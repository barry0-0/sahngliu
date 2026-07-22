const fs = require('fs');
let js = fs.readFileSync('platform/assets/js/admin.js', 'utf8');

// Update shop audit button to make sure it doesn't fail
// Oh wait, why was it failing? Let's just define the audit handlers globally.

const globalHandlers = `
      window.openAuditProductModal = (prodId) => {
        const prod = MockData.products.find(p => p.id == prodId);
        if (!prod) return;
        document.getElementById('audit-product-target-id').value = prodId;
        const titleEl = document.getElementById('audit-modal-product-title');
        if (titleEl) titleEl.innerText = \`上架商品审核 - \${prod.name}\`;
        const inputEl = document.getElementById('audit-product-reject-input');
        if (inputEl) inputEl.value = '';
        const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
        if (counterEl) counterEl.innerText = '0/50';
        document.getElementById('audit-product-reject-box').style.display = 'none';
        const passRadio = document.querySelector('input[name="audit-product-radio"][value="pass"]');
        if (passRadio) passRadio.checked = true;
        UI.showModal('modal-audit-product');
      };

      window.confirmSubmitAuditProduct = () => {
        const id = document.getElementById('audit-product-target-id').value;
        const prod = MockData.products.find(p => p.id == id);
        if (!prod) return;
        const result = document.querySelector('input[name="audit-product-radio"]:checked')?.value;
        if (result === 'pass') {
          prod.status = 1; // 已上架
          delete prod.rejectReason;
          UI.toast(\`商品 \${prod.name} 审核通过，已成功上架\`, 'success');
        } else {
          const reason = document.getElementById('audit-product-reject-input').value.trim();
          if (!reason) {
            UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
            return;
          }
          prod.status = '审核未通过';
          prod.rejectReason = reason;
          UI.toast(\`商品 \${prod.name} 审核拒绝\`, 'error');
        }
        UI.closeModal('modal-audit-product');
        AdminApp.renderMerchantProducts();
      };

      window.openAuditDemandModal = (demandId) => {
        const demand = MockData.demands.find(d => d.id == demandId);
        if (!demand) return;
        document.getElementById('audit-demand-target-id').value = demandId;
        const titleEl = document.getElementById('audit-modal-demand-title');
        if (titleEl) titleEl.innerText = \`供求信息审核 - \${demand.title}\`;
        const inputEl = document.getElementById('audit-demand-reject-input');
        if (inputEl) inputEl.value = '';
        const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
        if (counterEl) counterEl.innerText = '0/50';
        document.getElementById('audit-demand-reject-box').style.display = 'none';
        const passRadio = document.querySelector('input[name="audit-demand-radio"][value="pass"]');
        if (passRadio) passRadio.checked = true;
        UI.showModal('modal-audit-demand');
      };

      window.confirmSubmitAuditDemand = () => {
        const id = document.getElementById('audit-demand-target-id').value;
        const demand = MockData.demands.find(d => d.id == id);
        if (!demand) return;
        const result = document.querySelector('input[name="audit-demand-radio"]:checked')?.value;
        if (result === 'pass') {
          demand.status = 1; // 大厅展示
          delete demand.rejectReason;
          UI.toast(\`供求信息审核通过并已上架大厅\`, 'success');
        } else {
          const reason = document.getElementById('audit-demand-reject-input').value.trim();
          if (!reason) {
            UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
            return;
          }
          demand.status = '审核未通过';
          demand.rejectReason = reason;
          UI.toast(\`供求信息审核拒绝\`, 'error');
        }
        UI.closeModal('modal-audit-demand');
        AdminApp.renderDemands();
      };
`;

if (!js.includes('window.openAuditProductModal')) {
  js = js.replace('window.confirmSubmitAuditShop = () => {', globalHandlers + '\n      window.confirmSubmitAuditShop = () => {');
  
  // Replace product audit button
  js = js.replace(
    /\`\<button class="btn btn-primary btn-sm" onclick="UI.toast\('商品审核通过', 'success'\); MockData.products.find\(x => x.id === '\$\{p.id\}'\).status = 1; AdminApp.renderMerchantProducts\(\);"\>允许上架\<\/button\>\`/g,
    `\`<button class="btn btn-primary btn-sm" onclick="window.openAuditProductModal('\${p.id}')"\>审核</button>\``
  );
  
  // Replace demand audit button
  js = js.replace(
    /\`\<button class="btn btn-primary btn-sm" onclick="UI.toast\('供求信息审核通过并已上架大厅', 'success'\); MockData.demands.find\(x => x.id === '\$\{d.id\}'\).status = 1; AdminApp.renderDemands\(\);"\>审核通过\<\/button\>\`/g,
    `\`<button class="btn btn-primary btn-sm" onclick="window.openAuditDemandModal('\${d.id}')"\>审核</button>\``
  );
  
  fs.writeFileSync('platform/assets/js/admin.js', js);
  console.log('Patched admin.js with new audit modals');
}
