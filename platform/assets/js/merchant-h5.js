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

    if (!MockData.shelfAnnouncements) {
      MockData.shelfAnnouncements = [
        { id: 'SA001', title: '2026年Q3高强度抗震螺纹钢新品上架公示', productName: 'HRB400E 抗震螺纹钢 12mm', date: '2026-07-20', status: 'active' },
        { id: 'SA002', title: '定制加工松木板材上架公示', productName: '俄罗斯进口 樟子松原木', date: '2026-07-10', status: 'ended' }
      ];
    }
    this.renderShopInfo();
    this.renderProducts();
    this.renderOrders();
    this.renderBidding();
    this.renderShelfAnnouncements();
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

      // 渲染店铺当前状态与下架申诉
      const statusBadge = document.getElementById('mh5-shop-status-badge');
      const warningBox = document.getElementById('mh5-shop-warning-box');
      const reasonText = document.getElementById('mh5-suspend-reason-text');

      if (shop.status === '已关停' || shop.status === '已禁用') {
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-danger" style="border-radius:10px; padding: 2px 8px; font-size:10px;">已下架</span>';
        if (warningBox) warningBox.style.display = 'block';
        if (reasonText) reasonText.innerText = shop.suspendReason || '违规操作，请检查资质及货源合规性';
      } else {
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-success" style="border-radius:10px; padding: 2px 8px; font-size:10px;">正常营业</span>';
        if (warningBox) warningBox.style.display = 'none';
      }
    }
  },

  openAppealModal() {
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      document.getElementById('mh5-edit-shop-name').value = shop.shopName;
      document.getElementById('mh5-edit-shop-desc').value = '';
      UI.showModal('modal-mh5-edit-shop');
    }
  },

  submitShopAppeal() {
    const newName = document.getElementById('mh5-edit-shop-name').value.trim();
    if (!newName) {
      UI.toast('请输入店铺名称', 'warning');
      return;
    }
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.shopName = newName;
      shop.status = '正常'; // reset back to normal
      delete shop.suspendReason;
      UI.toast('编辑成功，店铺已重新上架！', 'success');
      UI.closeModal('modal-mh5-edit-shop');
      this.renderShopInfo();
    }
  },

  currentProductSection: 'mh5-prod-list-section',

  switchProductSection(sectionId) {
    this.currentProductSection = sectionId;
    const tabs = document.querySelectorAll('.tab-mh5-prod-section');
    tabs.forEach(t => {
      t.style.borderBottom = '2px solid transparent';
      t.style.color = '#64748b';
      t.classList.remove('active');
    });
    const el = document.querySelector(`.tab-mh5-prod-section[data-target='${sectionId}']`);
    if(el) {
      el.style.borderBottom = '2px solid var(--primary-color)';
      el.style.color = 'var(--primary-color)';
      el.classList.add('active');
    }
    
    document.getElementById('mh5-prod-list-section').style.display = 'none';
    document.getElementById('mh5-prod-shelf-section').style.display = 'none';
    document.getElementById(sectionId).style.display = 'block';
  },

  currentProductTab: 'active',

  switchProductTab(tab, el) {
    this.currentProductTab = tab;
    const filters = document.querySelectorAll('.mh5-prod-filter');
    filters.forEach(f => {
      f.className = 'tag tag-secondary cursor-pointer mh5-prod-filter';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-prod-filter';
    }
    this.renderProducts();
  },

  doProductSearch() {
    const kw = document.getElementById('mh5-product-search-kw').value.trim();
    const cat = document.getElementById('mh5-product-search-cat').value;
    this.renderProducts(kw, cat);
  },

  renderProducts(keyword = '', category = '') {
    const list = document.getElementById('mh5-product-list');
    let html = '';
    let filtered = MockData.products.filter(p => p.shopId === this.currentShopId);
    
    // 过滤已上架 vs 待审核
    const tab = this.currentProductTab || 'active';
    if (tab === 'active') {
      filtered = filtered.filter(p => p.status === 1);
    } else {
      filtered = filtered.filter(p => p.status !== 1);
    }
    
    if (keyword) {
      filtered = filtered.filter(p => p.name.includes(keyword));
    }
    if (category) {
      filtered = filtered.filter(p => p.name.includes(category) || p.shopName.includes(category));
    }
    
    if (filtered.length === 0) {
      html = '<div class="text-center py-8 text-secondary text-sm">暂无匹配商品</div>';
    } else {
      filtered.forEach(p => {
        const actionBtn = p.status === 1 ? `<button class="btn btn-text btn-sm text-danger" style="padding:0;" onclick="UI.toast('已下架该商品', 'info')">下架</button>` : `<span class="text-xs text-warning font-bold">待平台审核</span>`;
        html += `
          <div style="background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 12px;">
            <img src="${p.image}" style="width: 80px; height: 80px; border-radius: 4px; object-fit: cover;">
            <div style="flex: 1; display: flex; flex-direction: column; justify-content: space-between;">
              <div style="font-weight: bold; font-size: 14px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.name}</div>
              <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                <span class="text-danger font-bold">${p.priceStr.split(' ')[0]}</span>
                ${actionBtn}
              </div>
            </div>
          </div>
        `;
      });
    }
    if(list) list.innerHTML = html;
  },

  currentOrderFilter: 'all',

  setOrderStatusFilter(status, el) {
    this.currentOrderFilter = status;
    const filters = document.querySelectorAll('.mh5-order-filter');
    filters.forEach(f => {
      f.className = 'tag tag-secondary cursor-pointer mh5-order-filter';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-order-filter';
    }
    this.renderOrders();
  },

  renderOrders() {
    const list = document.getElementById('mh5-order-list');
    let html = '';
    let myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId);
    
    // 过滤状态
    const status = this.currentOrderFilter || 'all';
    if (status === 'sign') {
      myOrders = myOrders.filter(o => o.status === 0 || o.status === 5);
    } else if (status === 'ship') {
      myOrders = myOrders.filter(o => o.status === 1);
    } else if (status === 'pay') {
      myOrders = myOrders.filter(o => o.status === 4);
    } else if (status === 'done') {
      myOrders = myOrders.filter(o => o.status === 2 || o.status === 3);
    }

    // 筛选关键词
    const kw = document.getElementById('mh5-order-search-kw')?.value.trim();
    if (kw) {
      myOrders = myOrders.filter(o => o.productName.includes(kw) || o.buyerName.includes(kw) || o.id.includes(kw));
    }

    myOrders.forEach(o => {
      let statusTag = '';
      let btn = '';
      
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning">待买家签约</span>`;
      } else if(o.status === 5) {
        statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待卖家签约</span>`;
        btn = `<button class="btn btn-warning btn-sm" onclick="MH5App.openContractModal('${o.id}')">立即签约</button>`;
      } else if(o.status === 4) {
        statusTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#595959;">待付款</span>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        btn = `<button class="btn btn-primary btn-sm" onclick="MH5App.openShipModal()">立即发货</button>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货</span>`;
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完结</span>`;
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
      t.style.borderBottom = '2px solid transparent';
      t.style.color = '#64748b';
      t.classList.remove('active');
    });
    const el = document.querySelector(`.tab-mh5-bid[data-target='${targetId}']`);
    if(el) {
      el.style.borderBottom = '2px solid var(--primary-color)';
      el.style.color = 'var(--primary-color)';
      el.classList.add('active');
    }
    
    document.getElementById('mh5-bid-res').style.display = 'none';
    document.getElementById('mh5-bid-ann').style.display = 'none';
    document.getElementById(targetId).style.display = 'block';
  },

  currentBidResFilter: 'all',
  currentBidAnnFilter: 'all',

  setBidResFilter(status, el) {
    this.currentBidResFilter = status;
    const filters = document.querySelectorAll('.mh5-bid-res-filter');
    filters.forEach(f => {
      f.className = 'tag tag-secondary cursor-pointer mh5-bid-res-filter';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-bid-res-filter';
    }
    this.renderBidding();
  },

  setBidAnnFilter(status, el) {
    this.currentBidAnnFilter = status;
    const filters = document.querySelectorAll('.mh5-bid-ann-filter');
    filters.forEach(f => {
      f.className = 'tag tag-secondary cursor-pointer mh5-bid-ann-filter';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-bid-ann-filter';
    }
    this.renderBidding();
  },

  renderBidding() {
    // 1. 渲染资源
    const resList = document.getElementById('mh5-bidding-res-list');
    let rHtml = '';
    let myRes = MockData.biddingResources.filter(r => r.shopId === 'S001' || r.shopName === '远大钢铁官方直营店');
    
    // 过滤资源状态
    const resStatus = this.currentBidResFilter || 'all';
    if (resStatus === 'pending') {
      myRes = myRes.filter(r => r.status === '待审核');
    } else if (resStatus === 'approved') {
      myRes = myRes.filter(r => r.status === '已通过');
    }

    // 搜索资源名称
    const resKw = document.getElementById('mh5-bid-res-search-kw')?.value.trim();
    if (resKw) {
      myRes = myRes.filter(r => r.name.includes(resKw));
    }

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
    
    // 2. 渲染公告
    const annList = document.getElementById('mh5-bidding-ann-list');
    let aHtml = '';
    let myAnn = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001' || a.shopName === '远大钢铁官方直营店');

    // 过滤公告状态
    const annStatus = this.currentBidAnnFilter || 'all';
    if (annStatus !== 'all') {
      myAnn = myAnn.filter(a => a.status === parseInt(annStatus));
    }

    // 搜索公告标题
    const annKw = document.getElementById('mh5-bid-ann-search-kw')?.value.trim();
    if (annKw) {
      myAnn = myAnn.filter(a => a.title.includes(annKw));
    }

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
  },

  openContractModal(orderId) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const bodyEl = document.getElementById('mh5-contract-body');
    if (bodyEl) {
      bodyEl.innerHTML = `
        <div style="text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 12px;">工业品买卖电子合同</div>
        <p><strong>合同编号：</strong>HT-${order.id}</p>
        <p><strong>买方 (采购商)：</strong>${order.buyerName}</p>
        <p><strong>卖方 (供应商家)：</strong>${order.shopName}</p>
        <hr style="margin: 12px 0; border: none; border-top: 1px solid #ddd;">
        <p>买方向卖方订购以下货物，经双方友好协商一致，特订立本合同以兹共同遵守：</p>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size:11px;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="border: 1px solid #ddd; padding: 6px;">货物名称</th>
              <th style="border: 1px solid #ddd; padding: 6px;">规格型号</th>
              <th style="border: 1px solid #ddd; padding: 6px;">总价金额</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #ddd; padding: 6px;">${order.productName}</td>
              <td style="border: 1px solid #ddd; padding: 6px;">国标/正品级</td>
              <td style="border: 1px solid #ddd; padding: 6px; color: red; font-weight: bold;">${order.amount}</td>
            </tr>
          </tbody>
        </table>
        <p><strong>双方签章确认：</strong></p>
        <div style="display: flex; justify-content: space-between; margin-top: 15px;">
          <div>
            <p>买方盖章：</p>
            <div style="border: 2px dashed #ff4d4f; color: #ff4d4f; padding: 4px 8px; border-radius: 4px; display: inline-block; font-weight: bold; transform: rotate(-5deg); font-size:11px;">
              ✔ ${order.buyerName}<br>电子合同签署专用章
            </div>
          </div>
          <div>
            <p>卖方盖章：</p>
            <div style="color: #999; border: 1px dashed #ccc; padding: 8px 12px; font-size:11px;">
              (未签章)
            </div>
          </div>
        </div>
      `;
    }
    
    const signBtn = document.getElementById('mh5-contract-sign-btn');
    if (signBtn) {
      signBtn.onclick = () => {
        order.status = 1; // Change to pending shipment / "待发货"
        UI.closeModal('sheet-mh5-contract');
        UI.toast('电子合同商家签章成功！合同正式生效，请尽快安排发货。', 'success');
        this.renderOrders();
      };
    }
    
    UI.showModal('sheet-mh5-contract');
  },

  currentShelfAnnFilter: 'all',

  setShelfAnnFilter(status, el) {
    this.currentShelfAnnFilter = status;
    const filters = document.querySelectorAll('.mh5-shelf-ann-filter');
    filters.forEach(f => {
      f.className = 'tag tag-secondary cursor-pointer mh5-shelf-ann-filter';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-shelf-ann-filter';
    }
    this.renderShelfAnnouncements();
  },

  renderShelfAnnouncements() {
    const list = document.getElementById('mh5-shelf-ann-list');
    if (!list) return;
    
    let anns = MockData.shelfAnnouncements || [];
    
    // Filter status
    const status = this.currentShelfAnnFilter || 'all';
    if (status !== 'all') {
      anns = anns.filter(a => a.status === status);
    }
    
    // Filter keyword
    const kw = document.getElementById('mh5-shelf-ann-search-kw')?.value.trim();
    if (kw) {
      anns = anns.filter(a => a.title.includes(kw) || a.productName.includes(kw));
    }
    
    let html = '';
    if (anns.length === 0) {
      html = '<div class="text-center py-8 text-secondary text-sm">暂无上架公告公示</div>';
    } else {
      anns.forEach(a => {
        const badge = a.status === 'active' ? `<span class="tag tag-success">公示中</span>` : `<span class="tag tag-secondary">已结束</span>`;
        html += `
          <div style="background: #fff; padding: 14px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #f1f5f9; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between; align-items:center;">
              <div class="font-bold text-sm text-slate-800">${a.title}</div>
              ${badge}
            </div>
            <div class="text-xs text-slate-500 mb-1">上架货物：${a.productName}</div>
            <div class="text-xs text-slate-400">计划上架时间：${a.date}</div>
            <div style="display:flex; justify-content:flex-end; gap:8px; margin-top:10px;">
              <button class="btn btn-text btn-sm text-primary" style="padding:0;" onclick="UI.toast('公告发布已同步商城首页公示板块！', 'info')">推送首页</button>
              <button class="btn btn-text btn-sm text-danger" style="padding:0;" onclick="MockData.shelfAnnouncements = MockData.shelfAnnouncements.filter(x => x.id !== '${a.id}'); MH5App.renderShelfAnnouncements(); UI.toast('已下撤公告', 'warning');">撤销</button>
            </div>
          </div>
        `;
      });
    }
    list.innerHTML = html;
  },

  openAddShelfAnnModal() {
    const select = document.getElementById('mh5-add-shelf-prod');
    if (select) {
      let html = '';
      const products = MockData.products.filter(p => p.shopId === this.currentShopId);
      products.forEach(p => {
        html += `<option value="${p.name}">${p.name}</option>`;
      });
      select.innerHTML = html;
    }
    // Set default date
    const dateInput = document.getElementById('mh5-add-shelf-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }
    UI.showModal('modal-mh5-add-shelf-ann');
  },

  submitShelfAnn() {
    const title = document.getElementById('mh5-add-shelf-title').value.trim();
    const productName = document.getElementById('mh5-add-shelf-prod').value;
    const date = document.getElementById('mh5-add-shelf-date').value;
    
    if (!title) {
      UI.toast('请输入公告标题', 'warning');
      return;
    }
    
    const newAnn = {
      id: 'SA' + Date.now(),
      title,
      productName,
      date,
      status: 'active'
    };
    
    MockData.shelfAnnouncements.unshift(newAnn);
    UI.closeModal('modal-mh5-add-shelf-ann');
    UI.toast('新品上架公示公告已发布！已向订户发送上架推送通知。', 'success');
    this.renderShelfAnnouncements();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  MH5App.init();
});
