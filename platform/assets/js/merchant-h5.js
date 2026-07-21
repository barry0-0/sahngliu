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
      t.style.borderBottom = 'none';
      t.style.backgroundColor = 'transparent';
      t.style.color = '#64748b';
      t.style.fontWeight = '500';
      t.style.boxShadow = 'none';
      t.classList.remove('active');
    });
    const el = document.querySelector(`.tab-mh5-prod-section[data-target='${sectionId}']`);
    if(el) {
      el.style.backgroundColor = '#fff';
      el.style.borderBottom = 'none';
      el.style.color = 'var(--primary-color)';
      el.style.fontWeight = '600';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)';
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
        btn = `<button class="btn btn-outline btn-sm" style="border-radius:16px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); UI.cancelOrder('${o.id}', '卖家', 'H5商家用户', () => MH5App.renderOrders())">取消订单</button>`;
      } else if(o.status === 5) {
        statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待卖家签约</span>`;
        btn = `<div style="display:flex; gap:8px;">
                 <button class="btn btn-warning btn-sm" onclick="event.stopPropagation(); UI.showContractSigningModal('${o.id}', true, () => MH5App.renderOrders())">立即签约</button>
                 <button class="btn btn-outline btn-sm" style="border-radius:16px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); UI.cancelOrder('${o.id}', '卖家', 'H5商家用户', () => MH5App.renderOrders())">取消</button>
               </div>`;
      } else if(o.status === 4) {
        statusTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#595959;">待付款</span>`;
        btn = `<button class="btn btn-outline btn-sm" style="border-radius:16px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); UI.cancelOrder('${o.id}', '卖家', 'H5商家用户', () => MH5App.renderOrders())">取消订单</button>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        btn = `<button class="btn btn-primary btn-sm" onclick="event.stopPropagation(); MH5App.openShipModal()">立即发货</button>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货</span>`;
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完结</span>`;
      } else {
        statusTag = `<span class="tag tag-danger">已关闭</span>`;
      }

      html += `
        <div onclick="UI.showOrderDetail('${o.id}')" style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #f1f5f9; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
          <div class="flex justify-between items-center mb-3 pb-3" style="border-bottom: 1px solid #f8fafc; display:flex; justify-content:space-between; align-items:center;">
            <div style="font-family: monospace; font-size: 12px; color: #64748b;">${o.id}</div>
            ${statusTag}
          </div>
          <div style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 6px;">${o.productName}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">买方: ${o.buyerName}</div>
          <div class="flex justify-between items-center mt-3" style="display:flex; justify-content:space-between; align-items:center;">
            <div class="text-danger font-bold text-base" style="font-size: 16px; font-family: monospace;">${o.amount}</div>
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
      t.style.borderBottom = 'none';
      t.style.backgroundColor = 'transparent';
      t.style.color = '#64748b';
      t.style.fontWeight = '500';
      t.style.boxShadow = 'none';
      t.classList.remove('active');
    });
    const el = document.querySelector(`.tab-mh5-bid[data-target='${targetId}']`);
    if(el) {
      el.style.backgroundColor = '#fff';
      el.style.borderBottom = 'none';
      el.style.color = 'var(--primary-color)';
      el.style.fontWeight = '600';
      el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.08), 0 1px 1px rgba(0,0,0,0.04)';
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
      f.className = 'tag cursor-pointer mh5-bid-res-filter';
      f.style.background = '#f1f5f9';
      f.style.color = '#64748b';
      f.style.border = 'none';
      f.style.boxShadow = 'none';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-bid-res-filter';
      el.style.background = 'var(--primary-color)';
      el.style.color = '#fff';
      el.style.boxShadow = '0 2px 6px rgba(79, 70, 229, 0.2)';
    }
    this.renderBidding();
  },

  setBidAnnFilter(status, el) {
    this.currentBidAnnFilter = status;
    const filters = document.querySelectorAll('.mh5-bid-ann-filter');
    filters.forEach(f => {
      f.className = 'tag cursor-pointer mh5-bid-ann-filter';
      f.style.background = '#f1f5f9';
      f.style.color = '#64748b';
      f.style.border = 'none';
      f.style.boxShadow = 'none';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer mh5-bid-ann-filter';
      el.style.background = 'var(--primary-color)';
      el.style.color = '#fff';
      el.style.boxShadow = '0 2px 6px rgba(79, 70, 229, 0.2)';
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

      let btnHtml = '';
      if (aStatus === '待审核' || aStatus === '已拒绝') {
        btnHtml += `<button class="btn btn-text btn-sm text-warning" style="padding:0; font-weight:bold;" onclick="MerchantH5App.openEditAnnModal('${a.id}')">编辑</button>`;
        btnHtml += `<button class="btn btn-text btn-sm text-danger" style="padding:0; font-weight:bold; margin-left: 10px;" onclick="MerchantH5App.deleteBiddingAnn('${a.id}')">删除</button>`;
      } else if (aStatus === '已通过') {
        if (a.status !== 4) {
          btnHtml += `<button class="btn btn-text btn-sm text-primary" style="padding:0; font-weight:bold;" onclick="MerchantH5App.openAwardModal('${a.id}')">出价/定标</button>`;
          btnHtml += `<button class="btn btn-text btn-sm text-danger" style="padding:0; font-weight:bold; margin-left: 10px;" onclick="MerchantH5App.withdrawBiddingAnn('${a.id}')">撤回</button>`;
        } else {
          btnHtml += `<button class="btn btn-text btn-sm text-primary" style="padding:0; font-weight:bold;" onclick="MerchantH5App.openAwardModal('${a.id}')">查看结果</button>`;
        }
      } else {
        btnHtml += `<span class="text-secondary text-xs">已撤回</span>`;
      }

      aHtml += `
        <div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; border: 1px solid #eee;">
          <div class="flex justify-between items-center mb-2">
            <div class="font-bold text-sm" style="flex: 1; margin-right: 8px;">${a.title}</div>
            <div style="display: flex; gap: 4px; flex-shrink: 0;">${tag}${auditTag}</div>
          </div>
          <div class="text-secondary text-sm mb-2">底价: <span class="text-danger font-bold">${a.startPrice}</span></div>
          <div class="flex justify-between items-center mt-2">
            <div class="text-primary text-xs">${a.bidEndTime}</div>
            <div class="flex gap-2">
              ${btnHtml}
            </div>
          </div>
        </div>
      `;
    });
    if(annList) annList.innerHTML = aHtml || '<div class="text-center py-8 text-secondary">暂无公告</div>';
  },

  editingAnnId: null,

  openAddAnnModal() {
    this.editingAnnId = null;
    const titleEl = document.getElementById('mh5-add-ann-modal-title');
    if (titleEl) titleEl.innerText = '关联资源发布公告';

    const selectEl = document.getElementById('mh5-add-ann-resource-select');
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
    
    const formatDate = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    document.getElementById('mh5-add-ann-view-end').value = formatDate(threeDaysLater);
    document.getElementById('mh5-add-ann-bid-end').value = formatDate(sevenDaysLater);
    document.getElementById('mh5-add-ann-start-price').value = '';

    UI.showModal('modal-mh5-add-ann');
  },

  openEditAnnModal(annId) {
    const a = MockData.biddingAnnouncements.find(x => x.id === annId);
    if (!a) return;

    this.editingAnnId = annId;
    const titleEl = document.getElementById('mh5-add-ann-modal-title');
    if (titleEl) titleEl.innerText = `编辑竞价公告 (${annId})`;

    // Filter approved resources
    const myApproved = MockData.biddingResources.filter(r => r.status === '已通过');
    const selectEl = document.getElementById('mh5-add-ann-resource-select');
    if (selectEl) {
      selectEl.innerHTML = myApproved.map(r => `<option value="${r.id}">${r.id} - ${r.name}</option>`).join('');
      selectEl.value = a.resId;
    }

    // Remove the status tags
    let title = a.title || '';
    title = title.replace(/^【看货报名阶段】|^【现场看货阶段】|^【竞价出价阶段】|^【等待公布阶段】|^【已结束】|^【待审核测试】|^【已拒绝测试】|^【已撤回测试】/, '');
    
    document.getElementById('mh5-add-ann-title').value = title;
    document.getElementById('mh5-add-ann-start-price').value = parseFloat((a.startPrice || '').replace(/[^\d\.]/g, '')) || 0;

    const formatDateForInput = (str) => {
      if (!str) return '';
      return str.replace(' ', 'T');
    };

    document.getElementById('mh5-add-ann-view-end').value = formatDateForInput(a.viewEndTime || '');
    document.getElementById('mh5-add-ann-bid-end').value = formatDateForInput(a.bidEndTime || '');

    UI.showModal('modal-mh5-add-ann');
  },

  deleteBiddingAnn(annId) {
    if (confirm(`确认要删除竞价公告 ${annId} 吗？`)) {
      const idx = MockData.biddingAnnouncements.findIndex(x => x.id === annId);
      if (idx !== -1) {
        MockData.biddingAnnouncements.splice(idx, 1);
        UI.toast('公告已成功删除', 'success');
        this.renderBidding();
      }
    }
  },

  withdrawBiddingAnn(annId) {
    if (confirm(`确认要撤回竞价公告 ${annId} 吗？`)) {
      const a = MockData.biddingAnnouncements.find(x => x.id === annId);
      if (a) {
        a.auditStatus = '已撤回';
        UI.toast(`公告 ${annId} 已成功撤回`, 'success');
        this.renderBidding();
      }
    }
  },

  onAnnResourceChanged(selectEl) {
    const resId = selectEl.value;
    const res = MockData.biddingResources.find(r => r.id === resId);
    const titleEl = document.getElementById('mh5-add-ann-title');
    if (res && titleEl) {
      titleEl.value = res.name;
    }
  },

  submitBiddingAnnouncement() {
    const resId = document.getElementById('mh5-add-ann-resource-select').value;
    const title = document.getElementById('mh5-add-ann-title').value.trim();
    const priceVal = parseFloat(document.getElementById('mh5-add-ann-start-price').value);
    const viewEnd = document.getElementById('mh5-add-ann-view-end').value;
    const bidEnd = document.getElementById('mh5-add-ann-bid-end').value;

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
        a.status = 0;
        a.auditStatus = '待审核'; // reset to re-audit
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

    UI.closeModal('modal-mh5-add-ann');
    this.renderBidding();
  },

  openAwardModal(bidId) {
    const ann = MockData.biddingAnnouncements.find(a => a.id === bidId);
    if (!ann) return;
    
    const offers = MockData.biddingOffers.filter(o => o.bidId === bidId);
    const sortedOffers = [...offers].sort((x, y) => {
      const px = parseFloat(x.offerPrice.replace(/[^\d\.]/g, '')) || 0;
      const py = parseFloat(y.offerPrice.replace(/[^\d\.]/g, '')) || 0;
      return py - px;
    });

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'mh5-modal-award';
    modal.style.cssText = 'display:flex !important; align-items:flex-end; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:0 !important; box-sizing:border-box !important; opacity:1 !important; pointer-events:auto !important;';

    let offersHtml = '';
    if (sortedOffers.length === 0) {
      offersHtml = `<div style="text-align:center; padding:30px 0; color:#94a3b8; font-size:13px;">暂无买家参与出价</div>`;
    } else {
      sortedOffers.forEach((o, index) => {
        let actHtml = '';
        if (ann.status === 4) {
          if (o.status === 1 || ann.winner === o.buyerName) {
            actHtml = `<span style="color:#22c55e; font-weight:bold; font-size:12px;">已中标</span>`;
          } else {
            actHtml = `<span style="color:#64748b; font-size:12px;">未中标</span>`;
          }
        } else {
          actHtml = `<button style="background:#22c55e; color:#fff; border:none; padding:6px 12px; border-radius:12px; font-size:11px; font-weight:bold; cursor:pointer;" onclick="MerchantH5App.selectWinner('${o.id}')">选为中标</button>`;
        }

        offersHtml += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f1f5f9;">
            <div>
              <div style="font-weight:bold; font-size:13px; color:#1e293b;">${o.buyerName}</div>
              <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${o.time}</div>
            </div>
            <div style="display:flex; align-items:center; gap:12px;">
              <span style="color:#ef4444; font-family:monospace; font-weight:bold; font-size:14px;">${o.offerPrice}</span>
              ${actHtml}
            </div>
          </div>
        `;
      });
    }

    modal.innerHTML = `
      <div style="width:100%; max-height:80vh; background:#ffffff; border-radius:24px 24px 0 0; display:flex; flex-direction:column; overflow:hidden; animation:slideUp 0.3s ease-out; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:15px; font-weight:800; color:#1e293b;">📢 查看出价/定标</h3>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">${ann.title}</div>
          </div>
          <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>
        <div style="padding:20px; overflow-y:auto; flex:1; box-sizing:border-box;">
          <div style="margin-bottom:12px; font-size:12px; color:#64748b;">
            起拍底价: <strong style="color:#0f172a;">${ann.startPrice}</strong> | 当前最高: <strong style="color:#ef4444;">${ann.currentMaxOffer}</strong>
          </div>
          <div style="font-weight:bold; font-size:13px; color:#1e293b; margin-bottom:8px; border-bottom:1px solid #e2e8f0; padding-bottom:6px;">出价记录：</div>
          ${offersHtml}
        </div>
        <div style="padding:16px 20px; border-top:1px solid #f1f5f9; background:#f8fafc; flex-shrink:0;">
          <button style="background:#fff; border:1px solid #cbd5e1; color:#475569; width:100%; padding:10px; border-radius:20px; font-size:13px; font-weight:bold; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">关闭</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
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

      const m = document.getElementById('mh5-modal-award');
      if (m) m.remove();

      UI.toast(`定标成功！已为买家 ${offer.buyerName} 自动生成订单：${orderId}`, 'success');
      
    }
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
