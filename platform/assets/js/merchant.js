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

    // 默认激活第一个菜单
    document.querySelector('.menu-item[data-page="page-shop"]').click();
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
    }
  },

  saveShopInfo() {
    UI.toast('店铺装潢保存成功，前台展示已更新', 'success');
  },

  // 2. 商品中心 - 所有商品列表
  renderAllProducts() {
    const tbody = document.querySelector('#table-all-products tbody');
    let html = '';
    const myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    
    myProducts.forEach(p => {
      let statusTag = p.status === 1 ? `<span class="tag tag-success">已上架</span>` : `<span class="tag tag-warning">未上架/待审核</span>`;
      html += `
        <tr>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>${p.name}</td>
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
      tbody.innerHTML = html;
      this._appendPagination(tbody, myProducts.length);
    }
  },

  // 3. 商品中心 - 已上架列表
  renderListedProducts() {
    const tbody = document.querySelector('#table-listed-products tbody');
    let html = '';
    const myListed = MockData.products.filter(p => p.shopId === this.currentShopId && p.status === 1);
    
    myListed.forEach(p => {
      html += `
        <tr>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td>${p.name}</td>
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
      tbody.innerHTML = html;
      this._appendPagination(tbody, myListed.length);
    }
  },

  // 4. 订单履约
  renderOrders() {
    const tbody = document.querySelector('#table-orders tbody');
    let html = '';
    const myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId);
    
    myOrders.forEach(o => {
      let statusTag = '';
      let actBtn = '';
      
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning">待买家签约</span>`;
        actBtn = `<button class="btn btn-text btn-sm" disabled>等待签约</button>`;
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
          <td>${o.id}</td>
          <td>${o.productName}</td>
          <td>${o.buyerName}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${o.type}</td>
          <td>${statusTag}</td>
          <td>${actBtn}</td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
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
      const myRes = MockData.biddingResources.filter(r => r.shopId === 'S001' || r.shopName === '远大钢铁官方直营店');
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
      tbody.innerHTML = html;
      this._appendPagination(tbody, myRes.length);
    }
  },

  renderBiddingAnn() {
    const tbody = document.querySelector('#table-merchant-ann tbody');
    if (tbody) {
      let html = '';
      const myAnn = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001' || a.shopName === '远大钢铁官方直营店');
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
      tbody.innerHTML = html;
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
