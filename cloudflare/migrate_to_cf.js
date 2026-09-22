const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || 'YOUR_CF_ACCOUNT_ID';
const DATABASE_ID = process.env.CF_DATABASE_ID || '1236c4f5-1a67-4bf4-bbad-a821d51134b6';
const TOKEN = process.env.CF_API_TOKEN || process.env.TOKEN || 'YOUR_CF_API_TOKEN';

const D1_API_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

const filesToSync = [
  { docId: 'mall.html', file: 'platform/assets/js/prd-data-mall.js' },
  { docId: 'h5.html', file: 'platform/assets/js/prd-data-h5.js' },
  { docId: 'merchant.html', file: 'platform/assets/js/prd-data-merchant.js' },
  { docId: 'merchant-h5.html', file: 'platform/assets/js/prd-data-merchant-h5.js' },
  { docId: 'admin.html', file: 'platform/assets/js/prd-data-admin.js' }
];

function extractDataFromJs(filePath) {
  const fullPath = path.resolve(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`File not found: ${fullPath}`);
    return null;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  try {
    vm.runInContext(content, sandbox);
    return sandbox.window.INITIAL_PRD_DATA || null;
  } catch (e) {
    console.error(`Error executing ${filePath}:`, e.message);
    return null;
  }
}

async function upsertToD1(docId, dataList) {
  const dataStr = JSON.stringify(dataList);
  const sql = 'INSERT INTO sahngliu_prd (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP;';

  const resp = await fetch(D1_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      sql: sql,
      params: [docId, dataStr]
    })
  });

  const resJson = await resp.json();
  if (resJson.success) {
    console.log(`✅ [Cloudflare D1] Migrated ${docId} (${dataList.length} pins)`);
    return true;
  } else {
    console.error(`❌ [Cloudflare D1] Failed ${docId}:`, resJson.errors);
    return false;
  }
}

async function main() {
  console.log('🚀 Migrating PRD Pin Data to Cloudflare D1...');
  let success = 0;
  for (const item of filesToSync) {
    const data = extractDataFromJs(item.file);
    if (data && Array.isArray(data)) {
      const ok = await upsertToD1(item.docId, data);
      if (ok) success++;
    } else {
      console.warn(`⚠️ No data for ${item.docId}`);
    }
  }
  console.log(`\n🎉 Completed: ${success}/${filesToSync.length} documents uploaded to Cloudflare D1!`);
}

main().catch(console.error);
