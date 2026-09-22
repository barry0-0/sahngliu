#!/usr/bin/env python3
import json
import re
import urllib.request
import os

ACCOUNT_ID = os.environ.get("CF_ACCOUNT_ID", "YOUR_CF_ACCOUNT_ID")
DATABASE_ID = os.environ.get("CF_DATABASE_ID", "1236c4f5-1a67-4bf4-bbad-a821d51134b6")
TOKEN = os.environ.get("CF_API_TOKEN", "YOUR_CF_API_TOKEN")

D1_API_URL = f"https://api.cloudflare.com/client/v4/accounts/{ACCOUNT_ID}/d1/database/{DATABASE_ID}/query"

files_to_sync = [
    ("mall.html", "platform/assets/js/prd-data-mall.js"),
    ("h5.html", "platform/assets/js/prd-data-h5.js"),
    ("merchant.html", "platform/assets/js/prd-data-merchant.js"),
    ("merchant-h5.html", "platform/assets/js/prd-data-merchant-h5.js"),
    ("admin.html", "platform/assets/js/prd-data-admin.js"),
]

def extract_json_from_js(file_path):
    if not os.path.exists(file_path):
        print(f"File not found: {file_path}")
        return None
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract window.INITIAL_PRD_DATA = [...]
    match = re.search(r'window\.INITIAL_PRD_DATA\s*=\s*(\[[\s\S]*?\]);', content)
    if match:
        raw_json = match.group(1)
        try:
            return json.loads(raw_json)
        except Exception as e:
            print(f"JSON decode error in {file_path}: {e}")
            return None
    return None

def upsert_to_d1(doc_id, data_list):
    data_str = json.dumps(data_list, ensure_ascii=False)
    sql = "INSERT INTO sahngliu_prd (id, data, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP) ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = CURRENT_TIMESTAMP;"
    
    payload = {
        "sql": sql,
        "params": [doc_id, data_str]
    }
    
    req = urllib.request.Request(
        D1_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json"
        }
    )
    
    try:
        with urllib.request.urlopen(req) as resp:
            res_data = json.loads(resp.read().decode("utf-8"))
            if res_data.get("success"):
                print(f"✅ Successfully migrated {doc_id} ({len(data_list)} pins) to Cloudflare D1")
                return True
            else:
                print(f"❌ Failed to migrate {doc_id}: {res_data.get('errors')}")
                return False
    except Exception as e:
        print(f"❌ Exception migrating {doc_id}: {e}")
        return False

def main():
    print("🚀 Starting Migration to Cloudflare D1...")
    success_count = 0
    for doc_id, js_file in files_to_sync:
        data = extract_json_from_js(js_file)
        if data:
            if upsert_to_d1(doc_id, data):
                success_count += 1
        else:
            print(f"⚠️ No data extracted for {doc_id}")
            
    print(f"\n🎉 Migration finished: {success_count}/{len(files_to_sync)} files migrated successfully!")

if __name__ == "__main__":
    main()
