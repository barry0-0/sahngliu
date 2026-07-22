const fs = require('fs');
let js = fs.readFileSync('platform/assets/js/merchant.js', 'utf8');

// Map category to full hierarchy
const catMap = {
  '大米': '粮油-谷物-大米',
  '面粉': '粮油-谷物-面粉',
  '食用油': '粮油-油类-食用油',
  '钢材': '建材-金属-钢材',
  '木材': '建材-板材-木材',
  '水泥': '建材-粉材-水泥'
};

// 1. Rewrite renderAllProducts
const renderAllStr = `renderAllProducts() {
    const tbody = document.querySelector('#table-all-products tbody');
    let html = '';
    let myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    
    // Apply filters
    const kwEl = document.getElementById('filter-all-prod-kw');
    const catEl = document.getElementById('filter-all-prod-cat');
    const statusEl = document.getElementById('filter-all-prod-status');
    if (kwEl && kwEl.value.trim() !== '') {
      const kw = kwEl.value.trim().toLowerCase();
      myProducts = myProducts.filter(p => p.name.toLowerCase().includes(kw) || String(p.id).toLowerCase().includes(kw));
    }
    if (catEl && catEl.value !== '') {
      myProducts = myProducts.filter(p => p.category === catEl.value);
    }
    if (statusEl && statusEl.value !== '') {
      myProducts = myProducts.filter(p => String(p.status) === statusEl.value);
    }

    const catMap = {
      '大米': '粮油-谷物-大米',
      '面粉': '粮油-谷物-面粉',
      '食用油': '粮油-油类-食用油',
      '钢材': '建材-金属-钢材',
      '木材': '建材-板材-木材',
      '水泥': '建材-粉材-水泥'
    };

    myProducts.forEach((p, idx) => {
      let statusTag = '';
      let acts = '';
      let dispStatus = String(p.status);
      
      if (dispStatus === '1') {
        statusTag = '<span class="tag tag-success">已上架</span>';
        acts = '<span class="text-xs text-secondary">--</span>';
      } else if (dispStatus === '0') {
        statusTag = '<span class="tag tag-warning">待审核</span>';
        acts = '<span class="text-xs text-secondary">--</span>';
      } else if (dispStatus === '2') {
        statusTag = '<span class="tag tag-danger">已下架</span>';
        acts = '<button class="btn btn-text btn-sm text-primary">编辑</button><button class="btn btn-text btn-sm text-danger" onclick="UI.toast(\\'删除成功\\', \\'success\\');">删除</button>';
      } else {
        // 未上架 or 审核未通过
        statusTag = '<span class="tag" style="background:#f1f5f9; color:#475569;">未上架</span>';
        acts = '<button class="btn btn-text btn-sm text-primary">编辑</button><button class="btn btn-text btn-sm text-danger" onclick="UI.toast(\\'删除成功\\', \\'success\\');">删除</button>';
      }

      let typeTag = p.type === '预售' ? '<span class="tag" style="background:#e0e7ff; color:#4f46e5; border-color:#c7d2fe;">预售</span>' : '<span class="tag" style="background:#dcfce7; color:#16a34a; border-color:#bbf7d0;">现货</span>';
      let catFull = catMap[p.category] || p.category;

      html += \`
        <tr>
          <td>\${idx + 1}</td>
          <td><img src="\${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>\${p.name}</td>
          <td>\${typeTag}</td>
          <td>\${catFull}</td>
          <td>\${statusTag}</td>
          <td><div class="flex gap-2">\${acts}</div></td>
        </tr>
      \`;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center py-8 text-secondary">暂无商品数据</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  }`;

js = js.replace(/renderAllProducts\(\)\s*\{[\s\S]*?\}\n  \}\,/m, renderAllStr + ',');

// 2. Rewrite renderListedProducts to add minQty, stock, and remove product ID
const renderListedStr = `renderListedProducts() {
    const tbody = document.querySelector('#table-listed-products tbody');
    let html = '';
    let myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    
    // Filters...
    const kwEl = document.getElementById('filter-listed-prod-kw');
    const catEl = document.getElementById('filter-listed-prod-cat');
    if (kwEl && kwEl.value.trim() !== '') {
      const kw = kwEl.value.trim().toLowerCase();
      myProducts = myProducts.filter(p => p.name.toLowerCase().includes(kw) || String(p.id).toLowerCase().includes(kw));
    }
    if (catEl && catEl.value !== '') {
      myProducts = myProducts.filter(p => p.category === catEl.value);
    }

    const catMap = {
      '大米': '粮油-谷物-大米',
      '面粉': '粮油-谷物-面粉',
      '食用油': '粮油-油类-食用油',
      '钢材': '建材-金属-钢材',
      '木材': '建材-板材-木材',
      '水泥': '建材-粉材-水泥'
    };

    myProducts.forEach((p, idx) => {
      let statusDisplay = '';
      let acts = '';
      let dispStatus = String(p.status);

      if (dispStatus === '0') {
        statusDisplay = '<span class="tag tag-warning">待审核</span>';
        acts = '<span class="text-xs text-secondary">审核中...</span>';
      } else if (dispStatus === '1') {
        statusDisplay = '<span class="tag tag-success">已上架</span>';
        acts = \`<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已下架该商品', 'info'); MockData.products.find(x => x.id == '\${p.id}').status = 2; MockData.products.find(x => x.id == '\${p.id}').downReason = '自主下架'; MerchantApp.renderListedProducts(); MerchantApp.renderAllProducts();">下架</button>\`;
      } else if (dispStatus === '2') {
        let reasonStr = p.downReason ? \`<div style="font-size:10px; color:#ef4444; margin-top:2px;">原因: \${p.downReason}</div>\` : '';
        statusDisplay = \`<span class="tag tag-danger">已下架</span>\${reasonStr}\`;
        acts = \`
          <button class="btn btn-text btn-sm text-primary">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="UI.toast('提交审核成功', 'success'); MockData.products.find(x => x.id == '\${p.id}').status = 0; MerchantApp.renderListedProducts(); MerchantApp.renderAllProducts();">提交上架</button>
        \`;
      } else {
        // 未上架 (审核未通过)
        let reasonStr = p.rejectReason ? \`<div style="font-size:10px; color:#ef4444; margin-top:2px;">原因: \${p.rejectReason}</div>\` : '';
        statusDisplay = \`<span class="tag" style="background:#f1f5f9; color:#475569;">未上架</span>\${reasonStr}\`;
        acts = \`
          <button class="btn btn-text btn-sm text-primary">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="UI.toast('提交审核成功', 'success'); MockData.products.find(x => x.id == '\${p.id}').status = 0; MerchantApp.renderListedProducts(); MerchantApp.renderAllProducts();">提交上架</button>
        \`;
      }

      let typeTag = p.type === '预售' ? '<span class="tag" style="background:#e0e7ff; color:#4f46e5; border-color:#c7d2fe;">预售</span>' : '<span class="tag" style="background:#dcfce7; color:#16a34a; border-color:#bbf7d0;">现货</span>';
      let catFull = catMap[p.category] || p.category;

      html += \`
        <tr>
          <td>\${idx + 1}</td>
          <td><img src="\${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>\${p.name}</td>
          <td>\${typeTag}</td>
          <td>\${catFull}</td>
          <td class="font-bold text-danger">\${p.priceStr || '¥0.00'}</td>
          <td>\${p.minQty || '1'}</td>
          <td>\${p.stock || '999'}</td>
          <td>\${p.sales || 0}</td>
          <td class="text-xs text-secondary">\${p.listTime || '--'}</td>
          <td>\${statusDisplay}</td>
          <td><div class="flex gap-2">\${acts}</div></td>
        </tr>
      \`;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="12" class="text-center py-8 text-secondary">暂无上架商品数据</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  }`;

js = js.replace(/renderListedProducts\(\)\s*\{[\s\S]*?\}\n  \}\,/m, renderListedStr + ',');

// Fix submitNewListedProduct to include minQty and stock
const submitNewListedProductStr = `submitNewListedProduct() {
    const baseId = document.getElementById('add-listed-prod-select').value;
    const type = document.getElementById('add-listed-prod-type').value;
    const priceStr = document.getElementById('add-listed-prod-price').value;
    const minQty = document.getElementById('add-listed-prod-min-qty').value;
    const stock = document.getElementById('add-listed-prod-stock').value;

    if (!baseId || !type || !priceStr) {
      UI.toast('请填写完整的上架信息（货品、类型、单价）', 'warning');
      return;
    }

    const baseProd = MockData.products.find(p => p.id == baseId);
    if (!baseProd) return;

    // To simulate, we'll just update the base product with new properties and status 0.
    // In a real system, you'd create a new listing record linked to base.
    baseProd.type = type;
    baseProd.priceStr = "¥" + parseFloat(priceStr).toFixed(2);
    baseProd.minQty = minQty || 1;
    baseProd.stock = stock || 999;
    baseProd.status = 0; // 待审核
    
    const now = new Date();
    baseProd.listTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');

    UI.toast('已成功提交上架申请，等待平台审核', 'success');
    UI.closeModal('modal-add-listed-product');
    
    this.renderListedProducts();
    this.renderAllProducts();
  }`;

js = js.replace(/submitNewListedProduct\(\)\s*\{[\s\S]*?\}\n  \}\,/m, submitNewListedProductStr + ',');

// Add window.submitNewProduct and window.openAddProductModal
const submitNewProductCode = `
  window.openAddProductModal = () => {
    document.getElementById('add-prod-image').value = '';
    document.getElementById('add-prod-name').value = '';
    document.getElementById('add-prod-type').value = '现货';
    document.getElementById('add-prod-cat').value = '大米';
    UI.showModal('modal-add-product');
  };

  window.submitNewProduct = () => {
    const img = document.getElementById('add-prod-image').value.trim();
    const name = document.getElementById('add-prod-name').value.trim();
    const type = document.getElementById('add-prod-type').value;
    const cat = document.getElementById('add-prod-cat').value;

    if (!img || !name) {
      UI.toast('请填写完整的商品信息', 'warning');
      return;
    }

    const newProd = {
      id: Math.floor(Math.random() * 1000000),
      shopId: MerchantApp.currentShopId,
      image: img,
      name: name,
      category: cat,
      type: type,
      status: '未上架',
      sales: 0
    };

    MockData.products.unshift(newProd);
    UI.toast('新商品发布成功', 'success');
    UI.closeModal('modal-add-product');
    MerchantApp.renderAllProducts();
  };
`;
js += '\n' + submitNewProductCode;

fs.writeFileSync('platform/assets/js/merchant.js', js);
console.log('Patched merchant.js');
