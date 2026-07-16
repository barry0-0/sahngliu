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
    if(shop) {
      const shopIdInput = document.getElementById('shop-id-display');
      if (shopIdInput) shopIdInput.value = shop.id;
      document.getElementById('shop-name-input').value = shop.shopName;
      document.getElementById('shop-avatar-preview').src = shop.avatar || 'https://via.placeholder.com/100';
      document.getElementById('shop-banner-preview').src = shop.banner || 'https://via.placeholder.com/800x200';

      // 渲染店铺当前状态
      const statusText = document.getElementById('pc-shop-status-text');
      const statusBadge = document.getElementById('pc-shop-status-badge');
      const warningBox = document.getElementById('pc-shop-warning-box');
      const reasonText = document.getElementById('pc-suspend-reason-text');

      if (shop.status === '已关停' || shop.status === '已禁用') {
        if (statusText) statusText.innerText = '您的店铺已被平台下架限期整改，请检查资质及货源合规性！';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-danger" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">已下架</span>';
        if (warningBox) warningBox.style.display = 'block';
        if (reasonText) reasonText.innerText = shop.suspendReason || '违规操作，请检查资质及货源合规性';
      } else {
        if (statusText) statusText.innerText = '您的店铺处于正常对外营业状态，各渠道货源及现货市场展现正常。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-success" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">正常营业</span>';
        if (warningBox) warningBox.style.display = 'none';
      }
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
      UI.toast('店铺装潢及资料保存成功，前台展示已更新', 'success');
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
      shop.status = '正常';
      delete shop.suspendReason;
      UI.toast('整改申诉已提交，店铺已重新上架！', 'success');
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
      myProducts = myProducts.filter(p => p.name.toLowerCase().includes(kw));
    }
    if (catEl && catEl.value !== '') {
      myProducts = myProducts.filter(p => p.category === catEl.value);
    }
    if (statusEl && statusEl.value !== '') {
      myProducts = myProducts.filter(p => String(p.status) === statusEl.value);
    }

    myProducts.forEach(p => {
      let statusTag = p.status === 1 ? `<span class="tag tag-success">已上架</span>` : `<span class="tag tag-warning">未上架/待审核</span>`;
      let typeTag = p.shelfType === '预售' 
        ? `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591; padding:2px 6px; font-size:11px;">预售</span>`
        : `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; font-size:11px;">现货</span>`;
      html += `
        <tr>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>${p.name}</td>
          <td>${typeTag}</td>
          <td>${p.category}</td>
          <td class="font-bold text-danger">${p.priceStr}</td>
          <td>${p.stock}</td>
          <td>${statusTag}</td>
          <td>
            <button class="btn btn-text btn-sm">编辑</button>
            <button class="btn btn-text btn-sm">删除</button>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center p-4 text-secondary">没有找到符合条件的商品</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  },

  // 3. 商品中心 - 已上架列表
  renderListedProducts() {
    const tbody = document.querySelector('#table-listed-products tbody');
    let html = '';
    let myListed = MockData.products.filter(p => p.shopId === this.currentShopId && p.status === 1);
    
    // Apply filters
    const kwEl = document.getElementById('filter-listed-prod-kw');
    const catEl = document.getElementById('filter-listed-prod-cat');
    if (kwEl && kwEl.value.trim() !== '') {
      const kw = kwEl.value.trim().toLowerCase();
      myListed = myListed.filter(p => p.name.toLowerCase().includes(kw));
    }
    if (catEl && catEl.value !== '') {
      myListed = myListed.filter(p => p.category === catEl.value);
    }

    myListed.forEach(p => {
      let typeTag = p.shelfType === '预售' 
        ? `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591; padding:2px 6px; font-size:11px;">预售</span>`
        : `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; font-size:11px;">现货</span>`;
      html += `
        <tr>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>${p.name}</td>
          <td>${typeTag}</td>
          <td>${p.category}</td>
          <td class="font-bold text-danger">${p.priceStr}</td>
          <td>${p.sales}</td>
          <td><span class="tag tag-success">展示中</span></td>
          <td>
            <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已下架该商品', 'info')">主动下架</button>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center p-4 text-secondary">没有找到符合条件的上架商品</td></tr>';
      this._appendPagination(tbody, myListed.length);
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

    myOrders.forEach(o => {
      let statusTag = '';
      let actBtn = '';
      
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning">待买家签约</span>`;
        actBtn = `<button class="btn btn-text btn-sm" disabled>等待签约</button>`;
      } else if(o.status === 5) {
        statusTag = `<span class="tag tag-warning">待卖家签约</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="UI.toast('模拟卖家端签约完成。', 'success')">立即签约</button>`;
      } else if(o.status === 4) {
        statusTag = `<span class="tag tag-secondary">待付款</span>`;
        actBtn = `<span class="text-sm text-secondary">等买家付款</span>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openShipModal('${o.id}')">去发货</button>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货(待签收)</span>`;
        actBtn = `<div class="text-sm text-secondary">已录入物流</div>`;
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
        actBtn = `<span class="text-sm text-secondary">已结清</span>`;
      } else if(o.status === -1) {
        statusTag = `<span class="tag tag-danger">已关闭</span>`;
        actBtn = `<span class="text-sm text-secondary">线下协商退款</span>`;
      }

      html += `
        <tr>
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

      myRes.forEach(r => {
        let tag = r.status === '已通过' ? `<span class="tag tag-success">已通过</span>` : `<span class="tag tag-warning">待审核</span>`;
        let acts = r.status === '已通过' 
          ? `<button class="btn btn-text btn-sm text-primary" onclick="UI.showModal('modal-add-ann')">发布公告</button>`
          : `<button class="btn btn-text btn-sm">编辑</button> <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('资源已删除', 'info')">删除</button>`;
        html += `
          <tr>
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

      myAnn.forEach(a => {
        let tag = a.status === 1 ? `<span class="tag tag-success">竞价中</span>` : (a.status === 0 ? `<span class="tag tag-warning">未开始</span>` : `<span class="tag tag-secondary">已结束</span>`);
        let acts = a.status === 0 
          ? `<button class="btn btn-text btn-sm">修改底价</button> <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('公告已撤销', 'info')">撤销</button>`
          : `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openAwardModal('${a.id}')">查看出价/定标</button>`;
        html += `
          <tr>
            <td>${a.id}</td>
            <td><div class="font-bold">${a.title}</div></td>
            <td>${a.resId}</td>
            <td class="text-danger font-bold">${a.startPrice}</td>
            <td class="text-primary">${a.bidEndTime}</td>
            <td>${tag}</td>
            <td><div class="flex gap-2">${acts}</div></td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center p-4 text-secondary">没有找到符合条件的竞价公告</td></tr>';
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
      // Sort offers by price descending (simple string reverse sort for mock)
      offers.sort((a, b) => b.offerPrice.localeCompare(a.offerPrice));
      
      offers.forEach(o => {
        let tag = '';
        let btn = '';
        
        if (ann.status === 3) { // 已经结束定标了
          if (o.status === 1) {
            tag = `<span class="tag tag-success">已中标</span>`;
            btn = `<span class="text-secondary text-sm">已生成订单</span>`;
          } else {
            tag = `<span class="tag tag-secondary">未中标</span>`;
            btn = `-`;
          }
        } else { // 竞价中
          tag = `<span class="tag tag-primary">出价有效</span>`;
          btn = `<button class="btn btn-success btn-sm" style="background:#52c41a;color:#fff;border:none;" onclick="MerchantApp.selectWinner('${o.id}')">选为中标</button>`;
        }
        
        html += `
          <tr>
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
    if(confirm('确认选择该出价作为最终中标方？系统将自动生成订单并结束本场竞价。')) {
      UI.closeModal('modal-bid-award');
      UI.toast('定标成功！已自动生成待签约订单。', 'success');
      // In a real app, this would refresh the data from the server.
    }
  },

  renderMerchantDashboard() {
    // 1. Render transaction orders table (up to 4 records)
    const tbody = document.getElementById('merchant-db-order-tbody');
    if (tbody) {
      const myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId).slice(0, 4);
      let html = '';
      myOrders.forEach(o => {
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
