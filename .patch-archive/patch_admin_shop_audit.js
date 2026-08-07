const fs = require('fs');
let js = fs.readFileSync('platform/assets/js/admin.js', 'utf8');

const globalHandlers = `
      window.openAuditShopModal = (shopId) => {
        const shop = MockData.shops.find(s => s.id == shopId);
        if (!shop) return;
        document.getElementById('audit-shop-target-id').value = shopId;
        const titleEl = document.getElementById('audit-modal-shop-title');
        if (titleEl) titleEl.innerText = \`店铺入驻审核 - \${shop.shopName}\`;
        const inputEl = document.getElementById('audit-reject-reason-input');
        if (inputEl) inputEl.value = '';
        const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
        if (counterEl) counterEl.innerText = '0/50';
        document.getElementById('audit-reject-reason-box').style.display = 'none';
        const passRadio = document.querySelector('input[name="audit-result-radio"][value="pass"]');
        if (passRadio) passRadio.checked = true;
        UI.showModal('modal-audit-shop');
      };

      window.confirmSubmitAuditShop = () => {
        const shopId = document.getElementById('audit-shop-target-id').value;
        const shop = MockData.shops.find(s => s.id == shopId);
        if (!shop) return;
        const result = document.querySelector('input[name="audit-result-radio"]:checked')?.value;
        if (result === 'pass') {
          shop.status = '正常营业';
          delete shop.rejectReason;
          UI.toast(\`店铺 \${shop.shopName} 入驻审核通过，已上线正常营业！\`, 'success');
        } else {
          const reason = document.getElementById('audit-reject-reason-input').value.trim();
          if (!reason) {
            UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
            return;
          }
          shop.status = '审核未通过';
          shop.rejectReason = reason;
          UI.toast(\`店铺 \${shop.shopName} 审核拒绝\`, 'error');
        }
        UI.closeModal('modal-audit-shop');
        AdminApp.renderMerchantShops();
      };
`;

if (!js.includes('window.openAuditShopModal = (shopId) => {')) {
  // It should exist, but let's just append it to the global scope at the end to override
}

js += '\n' + globalHandlers;

fs.writeFileSync('platform/assets/js/admin.js', js);
console.log('Appended shop audit handlers to end of admin.js');
