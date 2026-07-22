/**
 * 商家端后台业务逻辑 (Merchant Dashboard V2)
 */

const MerchantApp = {
  currentShopId: 'S001', 

  init() {
    UI.initSidebarSpa();
    
    this.renderShopInfo();
    this.renderAllProducts();
    this.renderListedProducts();
    this.renderOrders();
    this.renderBiddingRes();
    this.renderBiddingAnn();
    this.renderMerchantDashboard();

    // 默认激活第一个子菜单（数据中心）
    const defaultTab = document.querySelector('.sub-menu-item[data-page="page-merchant-dashboard"]');
    if (defaultTab) defaultTab.click();
  },

  _appendPagination(tbody, totalItems) {
    const parent = tbody.closest('.card-body');
    if (!parent) return;
    const existing = parent.querySelector('.pagination-container');
    if (existing) existing.remove();

    if (totalItems > 0) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pagination-container';
      pageDiv.innerHTML = UI.renderPagination(totalItems, 1, 10);
      parent.appendChild(pageDiv);
    }
  },

  // 1. 店铺管理
  renderShopInfo() {
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      const shopIdInput = document.getElementById('shop-id-display');
      if (shopIdInput) shopIdInput.value = shop.id;
      const shopNameInput = document.getElementById('shop-name-input');
      if (shopNameInput) shopNameInput.value = shop.shopName;
      document.getElementById('shop-avatar-preview').src = shop.avatar || 'https://via.placeholder.com/100';
      document.getElementById('shop-banner-preview').src = shop.banner || 'https://via.placeholder.com/800x200';

      // 渲染店铺当前状态
      const statusText = document.getElementById('pc-shop-status-text');
      const statusBadge = document.getElementById('pc-shop-status-badge');
      const warningBox = document.getElementById('pc-shop-warning-box');
      const reasonText = document.getElementById('pc-suspend-reason-text');

      if (statusBadge) {
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = '点击切换状态 (演示用)';
        statusBadge.setAttribute('onclick', 'window.cycleMerchantShopStatus()');
      }

      // 控制编辑按钮和表单置灰锁定
      const isPending = (shop.status === '待审核');
      if (shopNameInput) shopNameInput.disabled = isPending;
      
      const actionBox = document.querySelector('#page-shop .card-body > div:last-child');
      if (actionBox) {
        if (isPending) {
          actionBox.innerHTML = `
            <div style="display:flex; align-items:center; gap:16px;">
              <span class="text-secondary text-sm">🔒 店铺资料已提交审核，当前处于只读锁定状态</span>
              <button class="btn btn-outline" style="padding: 8px 24px; font-weight: bold; color: #ef4444; border-color: #fca5a5;" onclick="MerchantApp.withdrawShopAudit()">撤回审核</button>
            </div>
          `;
        } else {
          actionBox.innerHTML = `
            <button class="btn btn-primary" style="padding: 10px 40px; font-weight: bold;" onclick="MerchantApp.saveShopInfo()">提交审核</button>
          `;
        }
      }

      if (shop.status === '闭店中' || shop.status === '已关停' || shop.status === '已禁用' || shop.status === '审核未通过') {
        if (shop.suspendReason) {
          if (statusText) statusText.innerText = '您的店铺已被平台强行关闭整改，限制对外展现！';
          if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-danger" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">闭店中 (已下架)</span>';
          if (warningBox) warningBox.style.display = 'block';
          if (reasonText) reasonText.innerText = shop.suspendReason;
        } else if (shop.rejectReason) {
          if (statusText) statusText.innerText = '您的店铺资料审核未通过，处于关闭状态，请根据拒审原因修改后重新提交！';
          if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-danger" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">闭店中 (审核未通过)</span>';
          if (warningBox) warningBox.style.display = 'block';
          if (reasonText) reasonText.innerText = shop.rejectReason;
        } else {
          if (statusText) statusText.innerText = '您的店铺当前处于闭店状态，外部买家不可见。';
          if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-secondary" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px; background:#e2e8f0; color:#475569;">闭店中</span>';
          if (warningBox) warningBox.style.display = 'none';
        }
      } else if (shop.status === '待审核') {
        if (statusText) statusText.innerText = '店铺基本资料及装潢信息已提交审核，预计在1-2个工作日内完成审核。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-warning" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">待审核</span>';
        if (warningBox) warningBox.style.display = 'none';
      } else if (shop.status === '未开店' || !shop.status) {
        if (statusText) statusText.innerText = '您的账号尚未完成开店，请在下方在线填写商户基本信息与装潢提交审核。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-secondary" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px; background:#f1f5f9; color:#64748b;">未开店</span>';
        if (warningBox) warningBox.style.display = 'none';
      } else {
        // 正常营业 / 正常
        if (statusText) statusText.innerText = '您的店铺处于正常对外营业状态，各渠道货源及现货市场展现正常。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-success" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">正常营业</span>';
        if (warningBox) warningBox.style.display = 'none';
      }
    }
  },

  withdrawShopAudit() {
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.status = '未开店';
      delete shop.rejectReason;
      delete shop.suspendReason;
      UI.toast('已成功撤回审核，恢复编辑模式', 'info');
      this.renderShopInfo();
    }
  },

  saveShopInfo() {
    const newName = document.getElementById('shop-name-input').value.trim();
    if (!newName) {
      UI.toast('商户名不能为空', 'warning');
      return;
    }
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.shopName = newName;
      shop.status = '待审核'; // 提交审核
      UI.toast('店铺资料及装潢信息提交成功，等待平台运营审核', 'success');
      this.renderShopInfo();
    }
  },

  submitShopAppeal() {
    const newName = document.getElementById('shop-name-input').value.trim();
    if (!newName) {
      UI.toast('商户名不能为空', 'warning');
      return;
    }
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.shopName = newName;
      shop.status = '待审核'; // 重新提交审核
      delete shop.suspendReason;
      UI.toast('资料修改申诉已重新提交审核！', 'success');
      this.renderShopInfo();
    }
  },

  // 2. 商品中心 - 所有商品列表
  renderAllProducts() {
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
        acts = '<button class="btn btn-text btn-sm text-primary">编辑</button><button class="btn btn-text btn-sm text-danger" onclick="UI.toast(\'删除成功\', \'success\');">删除</button>';
      } else {
        // 未上架 or 审核未通过
        statusTag = '<span class="tag" style="background:#f1f5f9; color:#475569;">未上架</span>';
        acts = '<button class="btn btn-text btn-sm text-primary">编辑</button><button class="btn btn-text btn-sm text-danger" onclick="UI.toast(\'删除成功\', \'success\');">删除</button>';
      }

      let typeTag = p.type === '预售' ? '<span class="tag" style="background:#e0e7ff; color:#4f46e5; border-color:#c7d2fe;">预售</span>' : '<span class="tag" style="background:#dcfce7; color:#16a34a; border-color:#bbf7d0;">现货</span>';
      let catFull = catMap[p.category] || p.category;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>${p.name}</td>
          <td>${typeTag}</td>
          <td>${catFull}</td>
          <td>${statusTag}</td>
          <td><div class="flex gap-2">${acts}</div></td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center py-8 text-secondary">暂无商品数据</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  },

  // 3. 商品中心 - 已上架列表
  renderListedProducts() {
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
        acts = `<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已下架该商品', 'info'); MockData.products.find(x => x.id == '${p.id}').status = 2; MockData.products.find(x => x.id == '${p.id}').downReason = '自主下架'; MerchantApp.renderListedProducts(); MerchantApp.renderAllProducts();">下架</button>`;
      } else if (dispStatus === '2') {
        let reasonStr = p.downReason ? `<div style="font-size:10px; color:#ef4444; margin-top:2px;">原因: ${p.downReason}</div>` : '';
        statusDisplay = `<span class="tag tag-danger">已下架</span>${reasonStr}`;
        acts = `
          <button class="btn btn-text btn-sm text-primary">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="UI.toast('提交审核成功', 'success'); MockData.products.find(x => x.id == '${p.id}').status = 0; MerchantApp.renderListedProducts(); MerchantApp.renderAllProducts();">提交上架</button>
        `;
      } else {
        // 未上架 (审核未通过)
        let reasonStr = p.rejectReason ? `<div style="font-size:10px; color:#ef4444; margin-top:2px;">原因: ${p.rejectReason}</div>` : '';
        statusDisplay = `<span class="tag" style="background:#f1f5f9; color:#475569;">未上架</span>${reasonStr}`;
        acts = `
          <button class="btn btn-text btn-sm text-primary">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="UI.toast('提交审核成功', 'success'); MockData.products.find(x => x.id == '${p.id}').status = 0; MerchantApp.renderListedProducts(); MerchantApp.renderAllProducts();">提交上架</button>
        `;
      }

      let typeTag = p.type === '预售' ? '<span class="tag" style="background:#e0e7ff; color:#4f46e5; border-color:#c7d2fe;">预售</span>' : '<span class="tag" style="background:#dcfce7; color:#16a34a; border-color:#bbf7d0;">现货</span>';
      let catFull = catMap[p.category] || p.category;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>${p.name}</td>
          <td>${typeTag}</td>
          <td>${catFull}</td>
          <td class="font-bold text-danger">${p.priceStr || '¥0.00'}</td>
          <td>${p.minQty || '1'}</td>
          <td>${p.stock || '999'}</td>
          <td>${p.sales || 0}</td>
          <td class="text-xs text-secondary">${p.listTime || '--'}</td>
          <td>${statusDisplay}</td>
          <td><div class="flex gap-2">${acts}</div></td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="12" class="text-center py-8 text-secondary">暂无上架商品数据</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  },

  // 4. 订单履约
  renderOrders() {
    const tbody = document.querySelector('#table-orders tbody');
    let html = '';
    let myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId);
    
    // Apply filters
    const kwEl = document.getElementById('filter-order-kw');
    const statusEl = document.getElementById('filter-order-status');
    const typeEl = document.getElementById('filter-order-type');
    const startEl = document.getElementById('filter-order-start');
    const endEl = document.getElementById('filter-order-end');

    if (kwEl && kwEl.value.trim() !== '') {
      const kw = kwEl.value.trim().toLowerCase();
      myOrders = myOrders.filter(o => o.buyerName.toLowerCase().includes(kw) || o.productName.toLowerCase().includes(kw) || o.id.toLowerCase().includes(kw));
    }
    if (statusEl && statusEl.value !== '') {
      myOrders = myOrders.filter(o => String(o.status) === statusEl.value);
    }
    if (typeEl && typeEl.value !== '') {
      myOrders = myOrders.filter(o => o.type === typeEl.value);
    }
    // Handle date filtering (assuming format YYYY-MM-DD or standard parseable ISO)
    if (startEl && startEl.value !== '') {
      const startTime = new Date(startEl.value).getTime();
      myOrders = myOrders.filter(o => {
        const orderTime = new Date(o.date || '2026-07-07 09:00:00').getTime();
        return orderTime >= startTime;
      });
    }
    if (endEl && endEl.value !== '') {
      // Add a full day (86400000ms) to include the end date fully
      const endTime = new Date(endEl.value).getTime() + 86400000;
      myOrders = myOrders.filter(o => {
        const orderTime = new Date(o.date || '2026-07-07 09:00:00').getTime();
        return orderTime <= endTime;
      });
    }

    myOrders.forEach((o, idx) => {
      let statusTag = '';
      let actBtn = '';
      
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning">待买家签约</span>`;
        actBtn = `<div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${this.currentShopId}', () => MerchantApp.renderOrders())">取消</button>
                  </div>`;
      } else if(o.status === 5) {
        statusTag = `<span class="tag tag-warning">待卖家签约</span>`;
        actBtn = `<div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn btn-primary btn-sm" onclick="UI.showContractSigningModal('${o.id}', true, () => MerchantApp.renderOrders())">立即签约</button>
                    <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${this.currentShopId}', () => MerchantApp.renderOrders())">取消</button>
                  </div>`;
      } else if(o.status === 4) {
        statusTag = `<span class="tag tag-secondary">待付款</span>`;
        actBtn = `<div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${this.currentShopId}', () => MerchantApp.renderOrders())">取消</button>
                  </div>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openShipModal('${o.id}')">去发货</button>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货(待签收)</span>`;
        actBtn = '';
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
        actBtn = '';
      } else if(o.status === -1) {
        statusTag = `<span class="tag tag-danger">已关闭</span>`;
        actBtn = '';
      }

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><a href="javascript:void(0)" onclick="UI.showOrderDetail('${o.id}')" style="font-weight:bold; color:var(--primary-color);">${o.id}</a></td>
          <td>${o.productName}</td>
          <td>${o.buyerName}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${o.type}</td>
          <td>${statusTag}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${actBtn}
              <button class="btn btn-text btn-sm" onclick="UI.showOrderDetail('${o.id}')">详情</button>
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center p-4 text-secondary">没有找到符合条件的订单数据</td></tr>';
      this._appendPagination(tbody, myOrders.length);
    }
  },

  openShipModal(orderId) {
    document.getElementById('ship-order-id').innerText = orderId;
    UI.showModal('modal-ship');
  },

  submitShip() {
    UI.closeModal('modal-ship');
    UI.toast('发货成功！订单状态已更新', 'success');
  },

  renderBiddingRes() {
    const tbody = document.querySelector('#table-merchant-res tbody');
    if (tbody) {
      let html = '';
      let myRes = MockData.biddingResources.filter(r => r.shopId === 'S001' || r.shopName === '远大钢铁官方直营店');
      
      // Apply filters
      const kwEl = document.getElementById('filter-res-kw');
      const statusEl = document.getElementById('filter-res-status');
      if (kwEl && kwEl.value.trim() !== '') {
        const kw = kwEl.value.trim().toLowerCase();
        myRes = myRes.filter(r => r.name.toLowerCase().includes(kw) || r.id.toLowerCase().includes(kw));
      }
      if (statusEl && statusEl.value !== '') {
        myRes = myRes.filter(r => r.status === statusEl.value);
      }

      myRes.forEach((r, idx) => {
        let tag = r.status === '已通过' ? `<span class="tag tag-success">已通过</span>` : `<span class="tag tag-warning">待审核</span>`;
        let acts = r.status === '已通过' 
          ? `<button class="btn btn-text btn-sm text-primary" onclick="UI.showModal('modal-add-ann')">发布公告</button>`
          : `<button class="btn btn-text btn-sm">编辑</button> <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('资源已删除', 'info')">删除</button>`;
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td><img src="${r.image}" style="width:60px;height:40px;border-radius:4px;object-fit:cover;"></td>
            <td>${r.id}</td>
            <td><div class="font-bold">${r.name}</div></td>
            <td>${r.specs}</td>
            <td>${tag}</td>
            <td>${acts}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="6" class="text-center p-4 text-secondary">没有找到符合条件的竞价资源</td></tr>';
      this._appendPagination(tbody, myRes.length);
    }
  },

  renderBiddingAnn() {
    const tbody = document.querySelector('#table-merchant-ann tbody');
    if (tbody) {
      let html = '';
      let myAnn = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001' || a.shopName === '远大钢铁官方直营店');
      
      // Apply filters
      const kwEl = document.getElementById('filter-ann-kw');
      const statusEl = document.getElementById('filter-ann-status');
      if (kwEl && kwEl.value.trim() !== '') {
        const kw = kwEl.value.trim().toLowerCase();
        myAnn = myAnn.filter(a => a.title.toLowerCase().includes(kw) || a.id.toLowerCase().includes(kw));
      }
      if (statusEl && statusEl.value !== '') {
        myAnn = myAnn.filter(a => String(a.status) === statusEl.value);
      }

      myAnn.forEach((a, idx) => {
        let tag = '';
        if (a.status === 0) tag = `<span class="tag tag-warning" style="background:#e6f7ff; color:#1890ff; border-color:#91d5ff;">看货报名</span>`;
        else if (a.status === 1) tag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border-color:#ffd591;">现场看货</span>`;
        else if (a.status === 2) tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">参加竞价</span>`;
        else if (a.status === 3) tag = `<span class="tag tag-success" style="background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
        else if (a.status === 4) tag = `<span class="tag tag-secondary">已结束</span>`;

        let auditTag = '';
        const aStatus = a.auditStatus || '已通过';
        if (aStatus === '待审核') {
          auditTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border-color:#ffd591;">待审核</span>`;
        } else if (aStatus === '已通过') {
          auditTag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">已通过</span>`;
        } else if (aStatus === '已拒绝') {
          auditTag = `<span class="tag tag-danger" style="background:#fff2f0; color:#ff4d4f; border-color:#ffccc7;">已拒绝</span>`;
        } else if (aStatus === '已撤回') {
          auditTag = `<span class="tag tag-secondary">已撤回</span>`;
        }
        
        let acts = '';
        if (aStatus === '待审核' || aStatus === '已拒绝') {
          acts += `<button class="btn btn-warning btn-sm" onclick="MerchantApp.openEditAnnModal('${a.id}')">编辑</button>`;
          acts += `<button class="btn btn-outline btn-sm text-danger" onclick="MerchantApp.deleteBiddingAnn('${a.id}')">删除</button>`;
        } else if (aStatus === '已通过') {
          if (a.status !== 4) {
            acts += `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openAwardModal('${a.id}')">查看出价/定标</button>`;
            acts += `<button class="btn btn-outline btn-sm text-danger" onclick="MerchantApp.withdrawBiddingAnn('${a.id}')">撤回</button>`;
          } else {
            acts += `<button class="btn btn-outline btn-sm" onclick="MerchantApp.openAwardModal('${a.id}')">查看结果</button>`;
          }
        } else {
          acts += `<span class="text-secondary text-sm">已撤回</span>`;
        }

        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${a.id}</td>
            <td><div class="font-bold">${a.title}</div></td>
            <td>${a.resId}</td>
            <td class="text-danger font-bold">${a.startPrice}</td>
            <td class="text-primary">${a.bidEndTime}</td>
            <td>${tag}</td>
            <td>${auditTag}</td>
            <td><div class="flex gap-2">${acts}</div></td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="8" class="text-center p-4 text-secondary">没有找到符合条件的竞价公告</td></tr>';
      this._appendPagination(tbody, myAnn.length);
    }
  },

  openAwardModal(bidId) {
    const ann = MockData.biddingAnnouncements.find(a => a.id === bidId);
    if (!ann) return;
    
    document.getElementById('award-bid-title').innerText = `${ann.title} (${bidId})`;
    
    const offers = MockData.biddingOffers.filter(o => o.bidId === bidId);
    const tbody = document.querySelector('#table-bid-offers tbody');
    let html = '';
    
    if (offers.length === 0) {
      html = `<tr><td colspan="5" style="text-align:center; padding: 20px;">暂无买家出价</td></tr>`;
    } else {
      // Sort offers desc by price
      offers.sort((x, y) => {
        const px = parseFloat(x.offerPrice.replace(/[^\d\.]/g, '')) || 0;
        const py = parseFloat(y.offerPrice.replace(/[^\d\.]/g, '')) || 0;
        return py - px;
      });
      
      offers.forEach((o, idx) => {
        let tag = '';
        let btn = '';
        
        if (ann.status === 4) { // 已结束
          if (o.status === 1 || ann.winner === o.buyerName) {
            tag = `<span class="tag tag-success">已中标</span>`;
            btn = `<span class="text-secondary text-sm">已生成合同及订单</span>`;
          } else {
            tag = `<span class="tag tag-secondary">未中标</span>`;
            btn = `-`;
          }
        } else { // 竞拍中/等待定标
          tag = `<span class="tag tag-primary">出价有效</span>`;
          btn = `<button class="btn btn-success btn-sm" style="background:#52c41a;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;" onclick="MerchantApp.selectWinner('${o.id}')">选为中标</button>`;
        }
        
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${o.buyerName}</td>
            <td>${o.time}</td>
            <td class="font-bold text-danger text-lg">${o.offerPrice}</td>
            <td>${tag}</td>
            <td>${btn}</td>
          </tr>
        `;
      });
    }
    
    tbody.innerHTML = html;
    UI.showModal('modal-bid-award');
  },
  
  selectWinner(offerId) {
    const offer = MockData.biddingOffers.find(o => o.id === offerId);
    if (!offer) return;
    const ann = MockData.biddingAnnouncements.find(a => a.id === offer.bidId);
    if (!ann) return;

    if (confirm(`确认选择 ${offer.buyerName}（出价：${offer.offerPrice}）作为最终中标方？系统将自动结束本场竞价，并为买家生成待签约履约订单。`)) {
      // Update offer statuses
      const offers = MockData.biddingOffers.filter(o => o.bidId === ann.id);
      offers.forEach(o => {
        o.status = (o.id === offerId) ? 1 : 0;
      });

      // Update announcement status
      ann.status = 4; // 已结束
      ann.winner = offer.buyerName;
      ann.currentMaxOffer = offer.offerPrice;

      // Generate transaction order
      const orderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: orderId,
        productId: ann.resId,
        productName: ann.title,
        specs: '大宗交易竞拍标的资产包',
        price: offer.offerPrice,
        quantity: 1,
        amount: offer.offerPrice,
        shopId: ann.shopId || 'S001',
        shopName: ann.shopName,
        buyerName: offer.buyerName,
        status: 0, // 待买家签约
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: '竞价交易',
        paymentVoucher: null,
        contractFile: null
      };
      MockData.orders.unshift(newOrder);

      UI.closeModal('modal-bid-award');
      UI.toast(`定标成功！已为买家 ${offer.buyerName} 自动生成待签约订单：${orderId}`, 'success');
      
      this.renderBidding();
      this.renderMerchantDashboard();
    }
  },

  editingAnnId: null,

  openAddAnnModal() {
    this.editingAnnId = null;
    const titleEl = document.getElementById('add-ann-modal-title');
    if (titleEl) titleEl.innerText = '关联资源发布竞价公告';

    const selectEl = document.getElementById('add-ann-resource-select');
    if (!selectEl) return;

    // Filter approved resources
    const myApproved = MockData.biddingResources.filter(r => r.status === '已通过');
    if (myApproved.length === 0) {
      UI.toast('暂无可发布的已审核通过竞价资源，请先新增资源并等待平台审核。', 'warning');
      return;
    }

    selectEl.innerHTML = myApproved.map(r => `<option value="${r.id}">${r.id} - ${r.name}</option>`).join('');
    
    // Prefill title
    this.onAnnResourceChanged(selectEl);

    // Set default dates
    const now = new Date();
    
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format to yyyy-MM-ddThh:mm
    const formatDate = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    document.getElementById('add-ann-view-end').value = formatDate(threeDaysLater);
    document.getElementById('add-ann-bid-end').value = formatDate(sevenDaysLater);
    document.getElementById('add-ann-start-price').value = '';

    UI.showModal('modal-add-ann');
  },

  openEditAnnModal(annId) {
    const a = MockData.biddingAnnouncements.find(x => x.id === annId);
    if (!a) return;

    this.editingAnnId = annId;
    const titleEl = document.getElementById('add-ann-modal-title');
    if (titleEl) titleEl.innerText = `编辑竞价公告 (${annId})`;

    // Filter approved resources
    const myApproved = MockData.biddingResources.filter(r => r.status === '已通过');
    const selectEl = document.getElementById('add-ann-resource-select');
    if (selectEl) {
      selectEl.innerHTML = myApproved.map(r => `<option value="${r.id}">${r.id} - ${r.name}</option>`).join('');
      selectEl.value = a.resId;
    }

    // When editing, remove the prefix tag if exists
    let title = a.title || '';
    title = title.replace(/^【看货报名阶段】|^【现场看货阶段】|^【竞价出价阶段】|^【等待公布阶段】|^【已结束】|^【待审核测试】|^【已拒绝测试】|^【已撤回测试】/, '');
    document.getElementById('add-ann-title').value = title;
    document.getElementById('add-ann-start-price').value = parseFloat((a.startPrice || '').replace(/[^\d\.]/g, '')) || 0;

    const formatDateForInput = (str) => {
      if (!str) return '';
      return str.replace(' ', 'T');
    };

    document.getElementById('add-ann-view-end').value = formatDateForInput(a.viewEndTime || '');
    document.getElementById('add-ann-bid-end').value = formatDateForInput(a.bidEndTime || '');

    UI.showModal('modal-add-ann');
  },

  deleteBiddingAnn(annId) {
    if (confirm(`确认要删除竞价公告 ${annId} 吗？`)) {
      const idx = MockData.biddingAnnouncements.findIndex(x => x.id === annId);
      if (idx !== -1) {
        MockData.biddingAnnouncements.splice(idx, 1);
        UI.toast('公告已成功删除', 'success');
        this.renderBiddingAnn();
      }
    }
  },

  withdrawBiddingAnn(annId) {
    if (confirm(`确认要撤回竞价公告 ${annId} 吗？`)) {
      const a = MockData.biddingAnnouncements.find(x => x.id === annId);
      if (a) {
        a.auditStatus = '已撤回';
        UI.toast(`公告 ${annId} 已成功撤回`, 'success');
        this.renderBiddingAnn();
      }
    }
  },

  onAnnResourceChanged(selectEl) {
    const resId = selectEl.value;
    const res = MockData.biddingResources.find(r => r.id === resId);
    const titleEl = document.getElementById('add-ann-title');
    if (res && titleEl) {
      titleEl.value = res.name;
    }
  },

  submitBiddingAnnouncement() {
    const resId = document.getElementById('add-ann-resource-select').value;
    const title = document.getElementById('add-ann-title').value.trim();
    const priceVal = parseFloat(document.getElementById('add-ann-start-price').value);
    const viewEnd = document.getElementById('add-ann-view-end').value;
    const bidEnd = document.getElementById('add-ann-bid-end').value;

    if (!resId || !title || isNaN(priceVal) || priceVal <= 0 || !viewEnd || !bidEnd) {
      UI.toast('请填写完整且合法的竞价公告信息！', 'error');
      return;
    }

    if (new Date(viewEnd) >= new Date(bidEnd)) {
      UI.toast('竞拍截止时间必须晚于看货报名截止时间！', 'error');
      return;
    }

    const res = MockData.biddingResources.find(r => r.id === resId);
    const priceStr = '¥' + priceVal.toLocaleString('zh-CN', {minimumFractionDigits: 2});

    if (this.editingAnnId) {
      // Edit mode
      const a = MockData.biddingAnnouncements.find(x => x.id === this.editingAnnId);
      if (a) {
        a.resId = resId;
        a.image = res ? res.image : a.image;
        a.title = `【看货报名阶段】${title}`;
        a.startPrice = priceStr;
        a.viewEndTime = viewEnd.replace('T', ' ');
        a.bidEndTime = bidEnd.replace('T', ' ');
        a.status = 0; // Reset status to phase 0 (报名阶段)
        a.auditStatus = '待审核'; // Needs re-audit
        UI.toast(`竞价公告 ${this.editingAnnId} 修改成功，已重新提交审核！`, 'success');
      }
      this.editingAnnId = null;
    } else {
      // Create mode
      const newAnn = {
        id: 'BID2026' + String(Math.floor(1000 + Math.random() * 9000)),
        resId: resId,
        image: res ? res.image : 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80',
        shopId: 'S001',
        shopName: '远大钢铁官方直营店',
        title: `【看货报名阶段】${title}`,
        startPrice: priceStr,
        bidEndTime: bidEnd.replace('T', ' '),
        viewEndTime: viewEnd.replace('T', ' '),
        status: 0, // 看货报名阶段
        currentMaxOffer: '-',
        winner: '-',
        auditStatus: '待审核'
      };

      MockData.biddingAnnouncements.unshift(newAnn);
      UI.toast(`竞价公告发布成功，已提交平台审核！公告编号: ${newAnn.id}`, 'success');
    }

    UI.closeModal('modal-add-ann');
    this.renderBiddingAnn();
  },

  renderMerchantDashboard() {
    // 1. Render transaction orders table (up to 4 records)
    const tbody = document.getElementById('merchant-db-order-tbody');
    if (tbody) {
      const myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId).slice(0, 4);
      let html = '';
      myOrders.forEach((o, idx) => {
        let statusTag = '';
        if (o.status === 0) statusTag = `<span class="tag tag-warning">待买家签约</span>`;
        else if (o.status === 5) statusTag = `<span class="tag tag-warning">待卖家签约</span>`;
        else if (o.status === 4) statusTag = `<span class="tag tag-secondary">待付款</span>`;
        else if (o.status === 1) statusTag = `<span class="tag tag-primary">待发货</span>`;
        else if (o.status === 2) statusTag = `<span class="tag tag-info">已发货</span>`;
        else if (o.status === 3) statusTag = `<span class="tag tag-success">已完结</span>`;
        else statusTag = `<span class="tag tag-danger">已关闭</span>`;

        html += `
          <tr>
            <td class="p-2">${idx + 1}</td>
            <td class="p-2 font-bold"><a href="javascript:void(0)" onclick="UI.showOrderDetail('${o.id}')" style="color:var(--primary-color);">${o.id}</a></td>
            <td class="p-2">${o.productName}</td>
            <td class="p-2 text-secondary">${o.buyerName}</td>
            <td class="p-2 text-danger font-bold">${o.amount}</td>
            <td class="p-2">${statusTag}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="5" class="text-center p-4 text-secondary">暂无大宗交易数据</td></tr>';
    }

    // 2. Render bidding activity (up to 3 items)
    const bidList = document.getElementById('merchant-db-bid-list');
    if (bidList) {
      const myBids = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001').slice(0, 3);
      let html = '';
      myBids.forEach(b => {
        let statusLabel = b.status === 1 ? `<span class="text-xs text-success">竞价中</span>` : `<span class="text-xs text-secondary">已结束</span>`;
        html += `
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <span class="font-bold text-sm" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${b.title}</span>
              ${statusLabel}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size: 11px; color:#64748b;">
              <span>起拍价: <strong style="color:var(--danger-color);">${b.startPrice}</strong></span>
              <span>时间: ${b.bidEndTime.split(' ')[0]}</span>
            </div>
          </div>
        `;
      });
      bidList.innerHTML = html || '<div class="text-center p-4 text-secondary text-sm">暂无竞价活动</div>';
    }
  },

  populateAddListedProductModal() {
    const select = document.getElementById('add-listed-prod-id');
    if (!select) return;
    let myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    select.innerHTML = myProducts.map(p => `<option value="${p.id}">${p.name} (当前单价: ${p.priceStr})</option>`).join('');
  },

  deleteProduct(prodId) {
    MockData.products = MockData.products.filter(p => p.id != prodId);
    UI.toast('已成功删除该商品', 'success');
    this.renderAllProducts();
    this.renderListedProducts();
  },

  toggleListedProductType() {
    const type = document.getElementById('add-listed-prod-type')?.value;
    const stockGroup = document.getElementById('add-listed-prod-stock-group');
    if (stockGroup) {
      stockGroup.style.display = type === '现货' ? 'block' : 'none';
    }
  },

  handleProductFileSelect(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgInput = document.getElementById('add-prod-image');
        const imgPrev = document.getElementById('add-prod-img-preview');
        if (imgInput) imgInput.value = e.target.result;
        if (imgPrev) imgPrev.src = e.target.result;
        UI.toast('本地商品图片解析成功', 'success');
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  },

  editProduct(prodId) {
    const prod = MockData.products.find(p => p.id == prodId);
    if (!prod) return;
    window._editingProdId = prodId;
    document.getElementById('add-prod-image').value = prod.image || '';
    const imgPrev = document.getElementById('add-prod-img-preview');
    if (imgPrev) imgPrev.src = prod.image || '';
    document.getElementById('add-prod-name').value = prod.name || '';
    document.getElementById('add-prod-type').value = prod.type || prod.shelfType || '现货';
    document.getElementById('add-prod-cat').value = prod.category || '大米';
    UI.showModal('modal-add-product');
  },

  submitNewListedProduct() {
    const prodId = document.getElementById('add-listed-prod-id').value;
    const type = document.getElementById('add-listed-prod-type').value;
    const priceNum = document.getElementById('add-listed-prod-price-num')?.value.trim();
    const unit = document.getElementById('add-listed-prod-unit')?.value || '/ 吨';
    const minQty = document.getElementById('add-listed-prod-min-qty')?.value.trim() || '1吨';
    const stock = type === '现货' ? (parseInt(document.getElementById('add-listed-prod-stock')?.value) || 500) : 0;
    
    if (!prodId || !priceNum) {
      UI.toast('请填写完整的售卖单价与关联货品', 'warning');
      return;
    }

    const baseProd = MockData.products.find(p => p.id == prodId);
    if (!baseProd) return;

    const newProd = {
      ...baseProd,
      id: 'P' + Math.floor(Math.random() * 10000),
      listNo: 'LST-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-P' + Math.floor(Math.random() * 10000),
      shelfType: type,
      priceStr: `¥${priceNum} ${unit}`,
      minQty: minQty,
      stock: stock,
      status: 0, // 待审核
      sales: 0,
      listTime: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    MockData.products.unshift(newProd);
    
    UI.closeModal('modal-add-listed-product');
    UI.toast('商品已提交上架审核', 'success');
    this.renderListedProducts();
    this.renderAllProducts();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MerchantApp.init();
});

// 侧边栏子菜单切换逻辑
window.toggleSubmenu = function(el) {
  const menuItem = el.parentElement;
  const subMenu = menuItem.querySelector('.sub-menu');
  const arrow = el.querySelector('.arrow');
  
  if (subMenu.style.display === 'none') {
    subMenu.style.display = 'block';
    arrow.innerText = '▼';
  } else {
    subMenu.style.display = 'none';
    arrow.innerText = '▶';
  }
};

window.cycleMerchantShopStatus = () => {
  const shop = MockData.shops.find(s => s.id === MerchantApp.currentShopId);
  if (!shop) return;

  if (shop.status === '正常营业') {
    shop.status = '待审核';
    delete shop.rejectReason;
    delete shop.suspendReason;
  } else if (shop.status === '待审核') {
    shop.status = '闭店中';
    delete shop.rejectReason;
    delete shop.suspendReason;
  } else if (shop.status === '闭店中' && !shop.rejectReason && !shop.suspendReason) {
    shop.status = '闭店中';
    shop.rejectReason = '资质证照扫描件不够清晰，主体印章模糊，请重新拍照上传。';
    delete shop.suspendReason;
  } else if (shop.status === '闭店中' && shop.rejectReason) {
    shop.status = '闭店中';
    shop.suspendReason = '您的商铺违反了平台《大宗商品诚信交易规范》，被予以强行闭店处罚。';
    delete shop.rejectReason;
  } else {
    shop.status = '正常营业';
    delete shop.rejectReason;
    delete shop.suspendReason;
  }

  UI.toast(`[演示] 店铺状态已切换，当前主状态: ${shop.status}`, 'info');
  MerchantApp.renderShopInfo();
};


  window.openAddProductModal = () => {
    delete window._editingProdId;
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

    if (window._editingProdId) {
      const prod = MockData.products.find(p => p.id == window._editingProdId);
      if (prod) {
        prod.image = img;
        prod.name = name;
        prod.type = type;
        prod.shelfType = type;
        prod.category = cat;
        UI.toast('商品信息更新成功', 'success');
      }
      delete window._editingProdId;
    } else {
      const newProd = {
        id: 'P' + Math.floor(Math.random() * 1000000),
        shopId: MerchantApp.currentShopId,
        image: img,
        name: name,
        category: cat,
        type: type,
        shelfType: type,
        status: '未上架',
        sales: 0
      };
      MockData.products.unshift(newProd);
      UI.toast('新商品发布成功（当前为未上架状态）', 'success');
    }

    UI.closeModal('modal-add-product');
    MerchantApp.renderAllProducts();
    MerchantApp.renderListedProducts();
  };
