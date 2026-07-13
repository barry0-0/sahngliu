/**
 * 商家端 H5 移动工作台逻辑
 */

const MH5App = {
  currentShopId: 'S001',

  init() {
    // 底部 Tab 切换逻辑
    const tabs = document.querySelectorAll('.h5-tab-item');
    const views = document.querySelectorAll('.h5-view');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        tabs.forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        
        const targetId = this.getAttribute('data-target');
        views.forEach(v => {
          v.classList.remove('active');
          if(v.id === targetId) {
            v.classList.add('active');
            
            const headerTitle = document.getElementById('mh5-header-title');
            if (targetId === 'view-shop') headerTitle.innerText = '店铺';
            if (targetId === 'view-products') headerTitle.innerText = '商品';
            if (targetId === 'view-orders') headerTitle.innerText = '订单';
            if (targetId === 'view-bidding') headerTitle.innerText = '竞价';
          }
        });
      });
    });

    this.renderShopInfo();
    this.renderProducts();
    this.renderOrders();
    this.renderBidding();
  },

  renderShopInfo() {
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if(shop) {
      const nameEl = document.getElementById('mh5-shop-name');
      if (nameEl) nameEl.innerText = shop.shopName;
      
      const idEl = document.getElementById('mh5-shop-id');
      if (idEl) idEl.innerText = shop.id;
      
      const avatarEl = document.getElementById('mh5-avatar');
      if (avatarEl && shop.avatar) avatarEl.src = shop.avatar;
    }
  },

  doProductSearch() {
    const kw = document.getElementById('mh5-product-search-kw').value.trim();
    const cat = document.getElementById('mh5-product-search-cat').value;
    this.renderProducts(kw, cat);
  },

  renderProducts(keyword = '', category = '') {
    const list = document.getElementById('mh5-product-list');
    let html = '';
    let filtered = MockData.products.filter(p => p.shopId === this.currentShopId && p.status === 1);
    
    if (keyword) {
      filtered = filtered.filter(p => p.name.includes(keyword));
    }
    // category is not modeled in MockData deeply, but we can simulate
    if (category) {
      filtered = filtered.filter(p => p.name.includes(category) || p.shopName.includes(category)); // naive filter
    }
    
    if (filtered.length === 0) {
      html = '<div class="text-center py-8 text-secondary text-sm">无匹配商品</div>';
    } else {
      filtered.forEach(p => {
        html += `
          <div style="background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 12px;">
            <img src="${p.image}" style="width: 80px; height: 80px; border-radius: 4px; object-fit: cover;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-weight: bold; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.name}</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <span class="text-danger font-bold">${p.priceStr.split(' ')[0]}</span>
                <button class="btn btn-text btn-sm text-danger" style="padding:0;">下架</button>
              </div>
            </div>
          </div>
        `;
      });
    }
    if(list) list.innerHTML = html;
  },

  renderOrders() {
    const list = document.getElementById('mh5-order-list');
    let html = '';
    const myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId);
    
    myOrders.forEach(o => {
      let statusTag = '';
      let btn = '';
      
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning">待买家签约</span>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        btn = `<button class="btn btn-primary btn-sm" onclick="MH5App.openShipModal()">立即发货</button>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货</span>`;
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
      } else {
        statusTag = `<span class="tag tag-danger">已关闭</span>`;
      }

      html += `
        <div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <div class="flex justify-between items-center mb-3 pb-3" style="border-bottom: 1px solid #eee;">
            <div class="text-sm">订单: ${o.id}</div>
            ${statusTag}
          </div>
          <div class="font-bold mb-2">${o.productName}</div>
          <div class="text-secondary text-sm mb-2">买方: ${o.buyerName}</div>
          <div class="flex justify-between items-center mt-4">
            <div class="text-danger font-bold text-lg">${o.amount}</div>
            ${btn}
          </div>
        </div>
      `;
    });
    if(list) list.innerHTML = html;
  },
  
  switchBidTab(targetId) {
    const tabs = document.querySelectorAll('.tab-mh5-bid');
    tabs.forEach(t => {
      t.style.background = 'transparent';
      t.style.color = '#64748b';
      t.style.boxShadow = 'none';
      t.classList.remove('active');
    });
    const el = document.querySelector(`.tab-mh5-bid[data-target='${targetId}']`);
    if(el) {
      el.style.background = '#fff';
      el.style.color = 'var(--primary-color)';
      el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
      el.classList.add('active');
    }
    
    document.getElementById('mh5-bid-res').style.display = 'none';
    document.getElementById('mh5-bid-ann').style.display = 'none';
    document.getElementById(targetId).style.display = 'block';
  },

  renderBidding() {
    // 渲染资源
    const resList = document.getElementById('mh5-bidding-res-list');
    let rHtml = '';
    const myRes = MockData.biddingResources.filter(r => r.shopId === 'S001' || r.shopName === '远大钢铁官方直营店');
    myRes.forEach(r => {
      let tag = r.status === '已通过' ? `<span class="tag tag-success">已通过</span>` : `<span class="tag tag-warning">待审核</span>`;
      rHtml += `
        <div style="background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 12px; border: 1px solid #eee;">
          <img src="${r.image}" style="width: 60px; height: 60px; border-radius: 4px; object-fit: cover;">
          <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
            <div style="font-weight: bold; font-size: 14px;">${r.name}</div>
            <div class="text-secondary text-sm">${r.specs}</div>
            <div style="display: flex; justify-content: space-between; align-items: flex-end;">
              ${tag}
              <div class="flex gap-2">
                 <button class="btn btn-text btn-sm text-primary" style="padding:0;">编辑</button>
                 <button class="btn btn-text btn-sm text-danger" style="padding:0;">删除</button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    if(resList) resList.innerHTML = rHtml || '<div class="text-center py-8 text-secondary">暂无资源</div>';
    
    // 渲染公告
    const annList = document.getElementById('mh5-bidding-ann-list');
    let aHtml = '';
    const myAnn = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001' || a.shopName === '远大钢铁官方直营店');
    myAnn.forEach(a => {
      let tag = a.status === 1 ? `<span class="tag tag-success">竞价中</span>` : (a.status === 0 ? `<span class="tag tag-warning">未开始</span>` : `<span class="tag tag-secondary">已结束</span>`);
      aHtml += `
        <div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #eee;">
          <div class="flex justify-between items-center mb-2">
            <div class="font-bold text-sm">${a.title}</div>
            ${tag}
          </div>
          <div class="text-secondary text-sm mb-2">底价: <span class="text-danger font-bold">${a.startPrice}</span></div>
          <div class="flex justify-between items-center mt-2">
            <div class="text-primary text-xs">${a.bidEndTime}</div>
            <div class="flex gap-2">
              <button class="btn btn-text btn-sm text-primary" style="padding:0;">修改</button>
              <button class="btn btn-text btn-sm text-danger" style="padding:0;">撤销</button>
            </div>
          </div>
        </div>
      `;
    });
    if(annList) annList.innerHTML = aHtml || '<div class="text-center py-8 text-secondary">暂无公告</div>';
  },

  openShipModal() {
    UI.showModal('modal-mh5-ship');
  },

  submitShip() {
    UI.closeModal('modal-mh5-ship');
    UI.toast('发货凭证提交成功！', 'success');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MH5App.init();
});
