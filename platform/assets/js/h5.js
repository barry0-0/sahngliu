/**
 * 商城 H5 移动端业务逻辑
 */

const H5App = {
  init() {
    // 初始化底部 TabBar 切换
    const tabs = document.querySelectorAll('.h5-tab-item');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        H5App.switchH5View(targetId);
      });
    });

    this.renderQuickCategories();
    this.renderHomeProducts();
    this.renderDemands();
    this.renderBids();
    this.renderCart();
    
    // 首次打开同步视图并确保首页隐藏返回键
    this.switchH5View('view-home');
  },

  switchH5View(targetId) {
    const tabs = document.querySelectorAll('.h5-tab-item');
    const views = document.querySelectorAll('.h5-view');
    
    // Clear active state from bottom tabs
    tabs.forEach(t => t.classList.remove('active'));
    // If the target has a corresponding bottom tab, set it active
    const targetTab = document.querySelector(`.h5-tab-item[data-target="${targetId}"]`);
    if(targetTab) targetTab.classList.add('active');
    
    views.forEach(v => {
      v.classList.remove('active');
      if(v.id === targetId) {
        v.classList.add('active');
        
        // Header Management
        const mainHeader = document.getElementById('main-h5-header');
        if (targetId === 'view-uc-orders') {
          H5App.renderUserOrders();
        }
        if (targetId === 'view-uc-messages') {
          H5App.renderUserMessages();
        }
        if (targetId === 'view-uc-demands') {
          H5App.renderUserDemands();
        }
        if (targetId === 'view-uc-bids') {
          H5App.renderUserBids();
        }
        if (targetId === 'view-uc-invoices') {
          H5App.renderUserInvoices();
        }
        if (targetId === 'view-shop' || targetId === 'view-shops' || targetId.startsWith('view-uc-')) {
          if (mainHeader) mainHeader.style.display = 'none';
        } else {
          if (mainHeader) mainHeader.style.display = 'flex';
          
          const headerTitle = document.getElementById('h5-header-title');
          const backBtn = document.getElementById('h5-header-back-btn');
          
          // Set Title
          if (headerTitle) {
            if (targetId === 'view-home') headerTitle.innerText = '咖喱粑粑商城';
            if (targetId === 'view-demand') headerTitle.innerText = '找货源 (寻源大厅)';
            if (targetId === 'view-bid') headerTitle.innerText = '大宗竞价大厅';
            if (targetId === 'view-cart') headerTitle.innerText = '购物车';
            if (targetId === 'view-my') headerTitle.innerText = '我的中心';
          }
          
          if (backBtn) {
            if (targetId === 'view-home' || targetId === 'view-demand' || targetId === 'view-bid' || targetId === 'view-my') {
              backBtn.style.display = 'none';
            } else if (targetId === 'view-cart') {
              backBtn.style.display = 'flex';
              backBtn.setAttribute('onclick', "H5App.switchH5View('view-my')");
            } else {
              backBtn.style.display = 'flex';
              backBtn.setAttribute('onclick', "H5App.switchH5View('view-home')");
            }
          }
        }
      }
    });
  },

  setCategoryFilter(categoryName) {
    const banner = document.getElementById('h5-home-category-banner');
    const text = document.getElementById('h5-home-category-text');
    const gridTitle = document.getElementById('h5-home-grid-title');
    
    if (categoryName) {
      if(banner) banner.style.display = 'flex';
      if(text) text.innerText = '当前分类: ' + categoryName;
      if(gridTitle) gridTitle.innerText = categoryName + ' 现货';
    } else {
      if(banner) banner.style.display = 'none';
      if(gridTitle) gridTitle.innerText = '推荐现货';
    }
    this.renderHomeProducts(categoryName);
  },

  openChat(shopName, prodTitle, prodPrice, prodImg) {
    UI.openModal('sheet-h5-chat');
    const shopNameEl = document.getElementById('h5-chat-shop-name');
    if (shopNameEl) shopNameEl.innerText = shopName;
    document.getElementById('h5-chat-prod-title').innerText = prodTitle;
    document.getElementById('h5-chat-prod-price').innerText = prodPrice;
    document.getElementById('h5-chat-prod-img').src = prodImg;
  },

  _msgTab: 'spot',

  switchMsgTab(tab) {
    this._msgTab = tab;
    this.renderUserMessages();
  },

  renderUserMessages() {
    const container = document.querySelector('#view-uc-messages');
    if (!container) return;
    
    const tabsHtml = `
      <header class="h5-header flex items-center justify-center bg-white" style="padding: 0 16px; font-weight: bold; border-bottom: 1px solid #f1f5f9; flex-shrink:0; height:60px;">
        <div>消息中心</div>
      </header>
      <div class="flex border-b border-slate-100 bg-white" style="flex-shrink:0;">
        <div class="flex-1 text-center py-3 font-bold text-sm ${this._msgTab === 'spot' ? 'text-primary' : 'text-slate-500'}" 
             style="${this._msgTab === 'spot' ? 'border-bottom: 2px solid var(--primary-color);' : ''}" 
             onclick="H5App.switchMsgTab('spot')">
          现货沟通
        </div>
        <div class="flex-1 text-center py-3 font-bold text-sm ${this._msgTab === 'demand' ? 'text-primary' : 'text-slate-500'}" 
             style="${this._msgTab === 'demand' ? 'border-bottom: 2px solid var(--primary-color);' : ''}" 
             onclick="H5App.switchMsgTab('demand')">
          求购沟通
        </div>
      </div>
    `;
    
    let listHtml = '<div class="flex-1 overflow-y-auto" style="padding-bottom:80px; background:#fff;">';
    if (this._msgTab === 'spot') {
      const mockChats = [
        {
          shopName: '特钢新材料厂直营店',
          prodTitle: 'HRB400E 螺纹钢 12mm',
          prodPrice: '¥3950/吨',
          prodImg: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80',
          time: '10:35'
        },
        {
          shopName: '中铁物流建材城',
          prodTitle: 'Q345B 槽钢 10#',
          prodPrice: '¥4150/吨',
          prodImg: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=150&q=80',
          time: '昨天'
        },
        {
          shopName: '宏源工程管业制造',
          prodTitle: '大宗工程镀锌管 100mm',
          prodPrice: '¥4280/吨',
          prodImg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
          time: '星期三'
        }
      ];

      mockChats.forEach(chat => {
        listHtml += `
          <div class="flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onclick="H5App.openChat('${chat.shopName}', '${chat.prodTitle}', '${chat.prodPrice}', '${chat.prodImg}')">
            <div style="width: 40px; height: 40px; border-radius: 6px; background: #e0e7ff; color: #1677ff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size:16px; flex-shrink:0;">
              店
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-slate-800 text-sm truncate" style="max-width:70%;">${chat.shopName}</span>
                <span class="text-[10px] text-slate-400 font-semibold">${chat.time}</span>
              </div>
              <div style="font-size: 11px; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:4px; display:inline-block; max-width:95%; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                📦 现货沟通: ${chat.prodTitle} | ${chat.prodPrice}
              </div>
            </div>
          </div>
        `;
      });
    } else {
      const mockChats = [
        {
          shopName: '远大钢铁官方直营店',
          prodTitle: '急求 50吨 Q345B 槽钢，交期7天内',
          prodPrice: '¥4,150.00/吨',
          prodImg: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=150&q=80',
          time: '12:00'
        },
        {
          shopName: '海螺水泥华东总代',
          prodTitle: '采购 P.O 42.5 散装水泥 500吨 需送达杭州工地',
          prodPrice: '¥298.00/吨',
          prodImg: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
          time: '昨天'
        }
      ];

      mockChats.forEach(chat => {
        listHtml += `
          <div class="flex items-center gap-3 p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer" onclick="H5App.openChat('${chat.shopName}', '${chat.prodTitle}', '${chat.prodPrice}', '${chat.prodImg}')">
            <div style="width: 40px; height: 40px; border-radius: 6px; background: #ffe8d6; color: #fa8c16; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size:16px; flex-shrink:0;">
              求
            </div>
            <div class="flex-1 overflow-hidden">
              <div class="flex justify-between items-center mb-1">
                <span class="font-bold text-slate-800 text-sm truncate" style="max-width:70%;">${chat.shopName}</span>
                <span class="text-[10px] text-slate-400 font-semibold">${chat.time}</span>
              </div>
              <div style="font-size: 11px; color:#64748b; background:#f1f5f9; padding:4px 8px; border-radius:4px; display:inline-block; max-width:95%; text-overflow:ellipsis; overflow:hidden; white-space:nowrap;">
                📢 求购沟通: ${chat.prodTitle} | ${chat.prodPrice}
              </div>
            </div>
          </div>
        `;
      });
    }
    listHtml += '</div>';
    
    container.innerHTML = tabsHtml + listHtml;
  },

  renderQuickCategories() {
    const container = document.getElementById('h5-quick-categories');
    if (!container) return;
    let html = '';
    
    const categories = MockData.productCategories || [];
    const topLevels = categories.slice(0, 9); // Take first 9 to fit 2 rows of 5 alongside 'All'
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(5, 1fr)';
    container.style.padding = '14px 10px';
    container.style.gap = '12px 2px';
    container.style.margin = '10px 16px';
    container.style.background = '#ffffff';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 4px 10px rgba(0,0,0,0.02)';
    
    const emojiMap = {
      '螺纹钢': '🔩',
      '板材': '🪵',
      '管材': '🧪',
      '型材': '🏗️',
      '水泥': '🧱',
      '电缆': '🔌',
      '五金': '🛠️',
      '线材': '🔗',
      '角钢': '📐'
    };
    const colorBgMap = [
      '#ffe4e6', '#fef3c7', '#dcfce7', '#dbeafe', '#f3e8ff',
      '#e0f2fe', '#ffedd5', '#f1f5f9', '#ecfdf5'
    ];
    
    html += `
      <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" onclick="H5App.setCategoryFilter('')">
        <div style="width:38px; height:38px; border-radius:50%; background:#f1f5f9; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:5px;">📦</div>
        <span style="font-size:10px; color:#4b5563; font-weight:500; text-align:center;">全部</span>
      </div>
    `;
    
    topLevels.forEach((cat, index) => {
      const emoji = emojiMap[cat.name] || '🏷️';
      const bg = colorBgMap[index % colorBgMap.length];
      html += `
        <div style="display:flex; flex-direction:column; align-items:center; cursor:pointer;" onclick="H5App.setCategoryFilter('${cat.name}')">
          <div style="width:38px; height:38px; border-radius:50%; background:${bg}; display:flex; align-items:center; justify-content:center; font-size:18px; margin-bottom:5px;">${emoji}</div>
          <span style="font-size:10px; color:#4b5563; font-weight:500; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%;">${cat.name}</span>
        </div>
      `;
    });
    
    container.innerHTML = html;
  },

  renderHomeBids() {
    const container = document.getElementById('h5-home-bids-container');
    if (!container) return;
    
    let html = '';
    const bids = (MockData.biddingAnnouncements || []).filter(b => b.auditStatus === '已通过' || !b.auditStatus).slice(0, 3);
    
    bids.forEach(b => {
      html += `
        <div class="card" style="min-width: 260px; margin-right: 12px; padding: 12px; display: inline-block; white-space: normal;" onclick="H5App.switchH5View('view-bid')">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${b.title}</div>
          <div style="color: var(--danger-color); font-weight: bold;">当前价: ${b.currentMaxOffer || b.startPrice}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">由 ${b.shopName} 发布</div>
        </div>
      `;
    });
    container.innerHTML = html;
  },

  renderHomeProducts(keyword = '', shopId = null) {
    const grid = document.getElementById('h5-product-grid');
    let html = '';
    let filtered = MockData.products.filter(p => p.status === 1);
    
    if (keyword) {
      filtered = filtered.filter(p => p.name.includes(keyword) || p.shopName.includes(keyword) || (p.category && p.category.includes(keyword)));
    }
    if (shopId) {
      filtered = filtered.filter(p => p.shopId === shopId);
    }
    
    filtered.forEach(p => {
      html += `
        <div class="h5-product-card card" onclick="H5App.showCartSheet('${p.id}')">
          <div class="img-wrapper">
            <img src="${p.image}" alt="${p.name}">
          </div>
          <div class="info flex-col justify-between" style="flex: 1; padding: 12px; display: flex;">
            <div>
              <h3 class="title font-serif" style="font-size: 15px; margin-bottom: 4px;">${p.name}</h3>
              <div class="price" style="font-size: 18px; color: var(--danger-color); font-weight: bold;">${p.priceStr.split(' ')[0]}</div>
              <div class="shop-info mt-2" onclick="event.stopPropagation(); window.H5App && H5App.goToShop('${p.shopId}', '${p.shopName}')">
                <span class="shop-name truncate text-secondary text-sm">${p.shopName}</span>
              </div>
            </div>
            
            <div class="action-bar mt-4 flex items-center justify-between" onclick="event.stopPropagation()">
              <button class="btn btn-outline flex items-center justify-center" style="width: 30px; height: 30px; padding: 0; color: var(--primary-color); border-color: rgba(0, 82, 217, 0.2); background: rgba(0, 82, 217, 0.05); border-radius: 50%; flex-shrink: 0; cursor: pointer;" onclick="event.stopPropagation(); UI.openModal('sheet-h5-chat'); document.getElementById('h5-chat-prod-title').innerText='${p.name}'; document.getElementById('h5-chat-prod-price').innerText='${p.priceStr}'; document.getElementById('h5-chat-prod-img').src='${p.image}';">
                <svg class="icon-svg" style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </button>
              
              <div class="flex items-center gap-1" style="flex: 1; justify-content: flex-end;">
                <div class="quantity-stepper" style="transform: scale(0.9); transform-origin: right center; margin-right: 4px;">
                  <button class="stepper-btn minus" style="font-size: 14px; width: 24px; height: 24px;" onclick="let inp=this.nextElementSibling; inp.value=Math.max(1, parseInt(inp.value||1)-1)">-</button>
                  <input type="number" id="qty-in-${p.id}" value="1" min="1" class="stepper-input" style="font-size: 12px; width: 32px; height: 24px;" onclick="event.stopPropagation()">
                  <button class="stepper-btn plus" style="font-size: 14px; width: 24px; height: 24px;" onclick="let inp=this.previousElementSibling; inp.value=parseInt(inp.value||1)+1">+</button>
                </div>
                <button class="btn btn-primary flex items-center justify-center" style="width: 30px; height: 30px; padding: 0; border-radius: 50%; flex-shrink: 0; background: var(--primary-color); border: none; cursor: pointer; color: #fff;" onclick="H5App.quickAddToCart('${p.id}')">
                  <svg class="icon-svg" style="width: 14px; height: 14px; color: #fff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    if(grid) grid.innerHTML = html;
  },

  showCartSheet(productId) {
    const p = MockData.products.find(p => p.id == productId);
    if (!p) return;
    
    document.getElementById('h5-pd-title').innerText = p.name;
    document.getElementById('h5-pd-img').src = p.image;
    document.getElementById('h5-pd-price').innerText = p.priceStr;
    document.getElementById('h5-pd-shop').innerText = `商户: ${p.shopName} (No.${p.shopId})`;
    document.getElementById('h5-pd-qty').value = 1;
    document.getElementById('h5-pd-qty').dataset.pid = p.id;
    
    UI.showModal('sheet-h5-product-detail');
  },

  quickAddToCart(productId) {
    const qtyInput = document.getElementById(`qty-in-${productId}`);
    let qty = 1;
    if (qtyInput) {
      qty = parseInt(qtyInput.value) || 1;
    }
    const product = MockData.products.find(p => p.id == productId);
    if (product) {
      if (!MockData.cart) MockData.cart = [];
      const exist = MockData.cart.find(c => c.productId == productId && c.status === 1);
      if (exist) {
        exist.quantity += qty;
      } else {
        MockData.cart.push({ ...product, productId: product.id, quantity: qty, selected: true, status: 1 });
      }
      UI.toast(`已成功加入${qty}件到购物车`, 'success');
      if(window.MainApp) MainApp.updateCartCount();
      this.updateCartBadge();
    }
  },

  confirmAddToCart() {
    const qtyInput = document.getElementById('h5-pd-qty');
    const productId = qtyInput.dataset.pid;
    const qty = parseInt(qtyInput.value) || 1;
    
    const product = MockData.products.find(p => p.id == productId);
    if (product) {
      if (!MockData.cart) MockData.cart = [];
      const exist = MockData.cart.find(c => c.productId == productId && c.status === 1);
      if (exist) {
        exist.quantity += qty;
      } else {
        MockData.cart.push({
          id: Date.now(),
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: qty,
          shopId: product.shopId,
          shopName: product.shopName,
          checked: true,
          image: product.image,
          status: 1
        });
      }
      
      this.renderCart();
      UI.toast(`已加入购物车，数量: ${qty}`, 'success');
    }
  },

  renderDemands(keyword = '') {
    const list = document.getElementById('h5-demand-list');
    if (!list) return;

    const showOnlyMy = document.getElementById('h5-demand-filter-my')?.checked || false;
    const showOnlyJoined = document.getElementById('h5-demand-filter-joined')?.checked || false;

    let html = '';
    let filtered = MockData.demands;

    if (showOnlyMy) {
      filtered = filtered.filter(d => d.buyerName === 'H5买家用户');
    } else if (showOnlyJoined) {
      const myQuotes = MockData.demandQuotes.filter(q => q.quoterName === 'H5买家用户');
      filtered = filtered.filter(d => myQuotes.some(q => q.demandId === d.id));
    } else {
      filtered = filtered.filter(d => d.status === 1);
    }

    if (keyword) {
      filtered = filtered.filter(d => d.title.includes(keyword) || d.buyerName.includes(keyword));
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div class="text-center py-12 text-secondary text-sm">暂无符合条件的求购意向</div>`;
      return;
    }

    filtered.forEach(d => {
      let isMine = d.buyerName === 'H5买家用户';
      const myQuote = MockData.demandQuotes.find(q => q.demandId === d.id && q.quoterName === 'H5买家用户');
      let isJoined = !!myQuote;
      let btn = '';
      let statusTag = '';
      let quotePriceHtml = '';

      if (showOnlyJoined && isJoined) {
        if (myQuote.status === 1) {
          statusTag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">已采纳</span>`;
          btn = `<div class="flex gap-2 mt-2">
                   <button class="btn btn-outline flex-1" style="height:36px; border-radius:18px; font-size:13px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => { UI.openModal('sheet-h5-chat'); document.getElementById('h5-chat-prod-title').innerText='${d.title.replace(/'/g, "\\'")}'; document.getElementById('h5-chat-prod-price').innerText='${d.expectedPrice}'; document.getElementById('h5-chat-prod-img').src='https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'; })">💬 沟通</button>
                 </div>`;
        } else {
          statusTag = `<span class="tag tag-warning" style="background:#e6f7ff; color:#1890ff; border:1px solid #91d5ff; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">已报价</span>`;
          btn = `<div class="flex gap-2 mt-2">
                   <button class="btn btn-outline flex-1" style="height:36px; border-radius:18px; font-size:13px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => { UI.openModal('sheet-h5-chat'); document.getElementById('h5-chat-prod-title').innerText='${d.title.replace(/'/g, "\\'")}'; document.getElementById('h5-chat-prod-price').innerText='${d.expectedPrice}'; document.getElementById('h5-chat-prod-img').src='https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'; })">💬 沟通</button>
                   <button class="btn btn-primary flex-1" style="height:36px; border-radius:18px; font-size:13px;" onclick="H5App.editMyQuote('${myQuote.id}')">修改报价</button>
                 </div>`;
        }
        quotePriceHtml = `<div style="font-size:12px; color:#475569; margin-top:4px;">我的报价: <strong style="color:var(--danger-color);">${myQuote.price}</strong></div>`;
      } else if (isMine) {
        if (d.status === 0) {
          statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#d46b08; border:1px solid #ffd591; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">待审核</span>`;
        } else if (d.status === 1) {
          statusTag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">展示中</span>`;
        } else if (d.status === 2) {
          statusTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#555; border:1px solid #d9d9d9; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">已完结</span>`;
        } else if (d.status === -1) {
          statusTag = `<span class="tag tag-danger" style="background:#fff1f0; color:#cf1322; border:1px solid #ffa39e; padding:2px 6px; border-radius:4px; font-weight:bold; font-size:10px;">已撤销</span>`;
        }

        const quotesCount = MockData.demandQuotes.filter(q => q.demandId === d.id).length;

        if (d.status === 0 || d.status === 1) {
          btn = `<div class="flex gap-2 mt-2">
                   <button class="btn btn-outline flex-1" style="height:36px; border-radius:18px; font-size:13px;" onclick="H5App.cancelDemand('${d.id}')">撤销</button>
                   <button class="btn btn-primary flex-1" style="height:36px; border-radius:18px; font-size:13px;" onclick="UI.showDemandQuotesModal('${d.id}', true, () => H5App.renderDemands())">报价列表 (${quotesCount})</button>
                 </div>`;
        } else {
          btn = `<div class="text-secondary text-center text-xs mt-2">意向已关闭</div>`;
        }
      } else {
        btn = `<div class="flex gap-2 mt-2">
                 <button class="btn btn-outline flex-1" style="height: 36px; border-radius: 18px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => { UI.openModal('sheet-h5-chat'); document.getElementById('h5-chat-prod-title').innerText='${d.title.replace(/'/g, "\\'")}'; document.getElementById('h5-chat-prod-price').innerText='${d.expectedPrice}'; document.getElementById('h5-chat-prod-img').src='https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'; })">💬 沟通</button>
                 <button class="btn btn-primary flex-1" style="height: 36px; border-radius: 18px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => H5App.openQuoteModal('${d.id}', '${d.title.replace(/'/g, "\\'")}', '${d.expectedPrice}'))">立即报价</button>
               </div>`;
      }

      const goodsName = d.goodsName || d.title;
      const buyerPhone = d.buyerPhone || '138****8818';
      const deliveryPeriod = d.deliveryPeriod || '2026-08-01 至 2026-08-15';
      const remark = d.remark || d.desc || '按标准协议交货';

      html += `
        <div style="background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #f1f5f9; box-shadow:0 2px 8px rgba(0,0,0,0.02);">
          <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between; align-items:center;">
            <div style="font-weight: bold; font-size: 15px; color:#1e293b;">求购货品: ${goodsName}</div>
            ${statusTag}
          </div>
          <div style="font-size:12px; color:#64748b; margin-bottom:4px;">
            买方账号: <span style="font-family:monospace; font-weight:bold; color:#0284c7;">${buyerPhone}</span> (${d.buyerName})
          </div>
          <div style="font-size:12px; color:#1e293b; font-weight:500; margin-bottom:4px;">
            交期范围: ${deliveryPeriod}
          </div>
          ${quotePriceHtml}
          <div class="flex justify-between text-secondary items-center" style="font-size: 12px; border-bottom: 1px solid #f2f3f5; padding-bottom: 8px; margin-bottom: 8px; margin-top:4px;">
            <span>备注: ${remark}</span>
            <span>${d.publishTime}</span>
          </div>
          ${btn}
        </div>
      `;
    });
    if (list) list.innerHTML = html;
  },

  doDemandSearch() {
    const kw = document.getElementById('h5-demand-search-keyword').value.trim();
    this.renderDemands(kw);
  },

  cancelDemand(demandId) {
    const d = MockData.demands.find(x => x.id === demandId);
    if (d) {
      d.status = -1; // 已撤销
      UI.toast('已撤销该求购信息！', 'success');
      this.renderDemands();
    }
  },

  submitPublishDemand() {
    const goodsName = document.getElementById('h5-pd-goods-name')?.value.trim() || '';
    const quantity = document.getElementById('h5-pd-quantity')?.value.trim() || '50';
    const unit = document.getElementById('h5-pd-unit')?.value || '吨';
    const deliveryPeriod = document.getElementById('h5-pd-delivery-period')?.value.trim() || '';
    if (!goodsName) {
      UI.toast('请输入求购货品名称！', 'error');
      return;
    }
    if (!deliveryPeriod) {
      UI.toast('请输入交期时间范围！', 'error');
      return;
    }
    const newDemand = {
      id: 'REQ' + (MockData.demands.length + 1).toString().padStart(3, '0'),
      buyerName: 'H5买家用户',
      buyerPhone: '186****9966',
      title: goodsName,
      goodsName: goodsName,
      quantity: quantity,
      unit: unit,
      category: '大宗物资',
      expectedPrice: '面议',
      deliveryPeriod: deliveryPeriod,
      publishTime: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 0, // 待审核
      quotesCount: 0,
      remark: '',
      desc: ''
    };
    MockData.demands.unshift(newDemand);
    UI.toast('求购意向提交成功，已推送至平台运营端待审核！', 'success');
    UI.closeModal('sheet-h5-publish-demand');
    if (document.getElementById('h5-pd-goods-name')) document.getElementById('h5-pd-goods-name').value = '';
    if (document.getElementById('h5-pd-delivery-period')) document.getElementById('h5-pd-delivery-period').value = '';
    this.renderDemands();
  },

  openQuoteModal(demandId, name, expectedPrice) {
    this.currentQuoteDemandId = demandId;
    const titleEl = document.getElementById('h5-quote-prod-name');
    const expectedEl = document.getElementById('h5-quote-prod-expected');
    if (titleEl) titleEl.innerText = name;
    if (expectedEl) expectedEl.innerText = '期望价格: ' + expectedPrice;

    // Reset inputs
    document.getElementById('h5-quote-price').value = '';

    UI.openModal('sheet-h5-quote');
  },

  submitQuote() {
    const priceVal = document.getElementById('h5-quote-price').value.trim();

    if (!priceVal) {
      UI.toast('请填写报价金额！', 'error');
      return;
    }

    const priceFormatted = priceVal.startsWith('¥') ? priceVal : '¥' + priceVal;

    // Add to MockData.demandQuotes
    const newQuote = {
      id: 'QT' + (MockData.demandQuotes.length + 1).toString().padStart(3, '0'),
      demandId: this.currentQuoteDemandId,
      shopId: 'S001',
      shopName: 'H5买家 (报价主体)',
      price: priceFormatted,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 0,
      quoterName: 'H5买家用户'
    };

    MockData.demandQuotes.push(newQuote);
    UI.toast('报价提交成功！等待采购商联系。', 'success');
    UI.closeModal('sheet-h5-quote');
    this.renderDemands();
  },

  editMyQuote(quoteId) {
    const q = MockData.demandQuotes.find(x => x.id === quoteId);
    if (!q) return;

    const newPrice = prompt('请输入新的报价（例如 ¥4,100.00/吨）：', q.price);
    if (newPrice === null) return; // user cancelled
    const trimmed = newPrice.trim();
    if (!trimmed) {
      UI.toast('报价不能为空！', 'error');
      return;
    }

    q.price = trimmed;
    UI.toast('报价修改成功！', 'success');
    this.renderDemands();
  },

  toggleChatForm(type) {
    const form = document.getElementById('h5-chat-interactive-form');
    const inq = document.getElementById('h5-form-inquiry-fields');
    const qte = document.getElementById('h5-form-quote-fields');
    form.style.display = 'block';
    if (type === 'inquiry') {
      inq.style.display = 'block';
      qte.style.display = 'none';
    } else {
      inq.style.display = 'none';
      qte.style.display = 'block';
    }
  },

  submitQuickMessage(type) {
    const chatBox = document.getElementById('h5-chat-messages');
    if (!chatBox) return;
    document.getElementById('h5-chat-interactive-form').style.display = 'none';

    let contentHtml = '';
    let toastMsg = '';

    if (type === 'inquiry') {
      const qty = document.getElementById('h5-inq-qty').value || '100';
      const unit = document.getElementById('h5-inq-unit').value || '吨';
      contentHtml = `
        <div style="padding: 4px 0; font-size: 12px; text-align:left;">
          <strong style="color: #1d4ed8; display: block; margin-bottom: 2px;">💬 【采购意向询价】</strong>
          <div>意向数量：<span style="font-weight: bold;">${qty} ${unit}</span></div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">我想咨询购买此数量的批发优惠单价，请报价。</div>
        </div>
      `;
      toastMsg = '询价卡片已发送';
    } else if (type === 'quote') {
      const price = document.getElementById('h5-quote-price').value || '4150';
      const qty = document.getElementById('h5-quote-qty').value || '50';
      const unit = document.getElementById('h5-quote-unit').value || '吨';
      const qType = document.getElementById('h5-quote-type').value || '现货直销报价';
      contentHtml = `
        <div style="padding: 4px 0; font-size: 12px; text-align:left; color:#15803d;">
          <strong style="color: #15803d; display: block; margin-bottom: 4px;">💰 【大宗成交报价单】</strong>
          <div style="font-size: 9px; background: #e8f5e9; padding: 2px 4px; border-radius: 4px; display: inline-block;">类型: ${qType}</div>
          <div style="margin-top:4px;">单价：<span style="font-weight: bold; color: #15803d;">¥${price} / ${unit}</span></div>
          <div>数量：<span style="font-weight: bold;">${qty} ${unit}</span></div>
          <button class="btn btn-primary btn-sm mt-2" onclick="H5App.acceptChatQuote('${price}', '${qty}')" style="background:#15803d; border:none; padding:6px; font-size:11px; border-radius:6px; color:#fff; cursor:pointer; width:100%; display:block; margin-top:6px;">接受报价并签约</button>
        </div>
      `;
      toastMsg = '报价成交单已发送';
    }

    // Append user message
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-2.5 justify-end';
    msgDiv.innerHTML = `
      <div class="p-2.5 rounded shadow-sm text-xs" style="max-width: 80%; border-radius: 14px 0 14px 14px; background: ${type === 'quote' ? '#f0fdf4' : '#eff6ff'}; color: #334155; border: 1px solid ${type === 'quote' ? '#bbf7d0' : '#bfdbfe'}; line-height: 1.4;">
        ${contentHtml}
      </div>
      <div class="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] flex-shrink-0">我</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    UI.toast(toastMsg, 'success');

    // Simulate merchant response
    setTimeout(() => {
      const respDiv = document.createElement('div');
      respDiv.className = 'flex gap-2.5';
      let respText = '';
      if (type === 'inquiry') {
        respText = `好的，针对您的采购意向，为您申请的优惠出厂价为：**¥3950/吨**。请您使用“发起报价”功能发送成交单。`;
      } else {
        respText = '收到报价！已确认库存。点击报价卡片中的按钮可立即生成正式的电子签约大宗订单。';
      }
      respDiv.innerHTML = `
        <div class="w-7 h-7 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-[10px] flex-shrink-0 font-bold shadow-sm">店</div>
        <div class="bg-white p-2.5 text-slate-700 shadow-sm" style="max-width: 80%; border-radius: 4px 14px 14px 14px; line-height: 1.4; font-size: 12px; text-align:left;">
          ${respText}
        </div>
      `;
      chatBox.appendChild(respDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 1200);
  },

  acceptChatQuote(price, qty) {
    const prodName = document.getElementById('h5-chat-prod-title').innerText || '大宗交易物资';
    const amountVal = parseFloat(price) * parseFloat(qty);
    const amountStr = '¥' + amountVal.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    const orderId = 'O' + Math.floor(1000 + Math.random() * 9000);
    
    const newOrder = {
      id: orderId,
      shopId: 'S001',
      shopName: document.getElementById('h5-chat-shop-name').innerText || '丰收粮油直营店',
      buyerName: '远大筑建采购部',
      productName: `${prodName} (成交: ${qty})`,
      amount: amountStr,
      status: 0,
      type: '现货单',
      time: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    MockData.orders.unshift(newOrder);
    UI.closeModal('sheet-h5-chat');
    UI.toast(`已生成电子合同，请在个人中心签约！`, 'success');
    this.renderOrders();
    document.querySelector('.h5-tab-item[data-target="view-uc"]').click();
  },

  editNickname() {
    const textEl = document.getElementById('h5-username-text');
    if (!textEl) return;
    const newName = prompt('请输入新的个人/企业名称：', textEl.innerText);
    if (newName && newName.trim()) {
      const val = newName.trim();
      textEl.innerText = val;
      const avatarEl = document.querySelector('.h5-avatar');
      if (avatarEl) avatarEl.innerText = val.charAt(0);
      UI.toast('个人名称修改成功', 'success');
    }
  },

  currentBidFilter: 'all',

  renderBids(keyword = '') {
    const list = document.getElementById('h5-bid-list');
    let html = '';
    let filtered = (MockData.biddingAnnouncements || []).filter(b => b.auditStatus === '已通过' || !b.auditStatus);
    
    // 状态筛选
    const statusFilter = this.currentBidFilter || 'all';
    if (statusFilter === 'active') {
      filtered = filtered.filter(b => b.status !== 4);
    } else if (statusFilter === 'ended') {
      filtered = filtered.filter(b => b.status === 4);
    }

    // 关键词筛选
    if (keyword) {
      filtered = filtered.filter(b => b.title.includes(keyword));
    }
    
    filtered.forEach(b => {
      let tag = '';
      if (b.status === 0) tag = `<span class="tag tag-warning" style="font-size: 10px; padding: 2px 6px; background:#e6f7ff; color:#1890ff; border-color:#91d5ff;">看货报名</span>`;
      else if (b.status === 1) tag = `<span class="tag tag-warning" style="font-size: 10px; padding: 2px 6px; background:#fff7e6; color:#fa8c16; border-color:#ffd591;">现场看货</span>`;
      else if (b.status === 2) tag = `<span class="tag tag-success" style="font-size: 10px; padding: 2px 6px; background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">参加竞价</span>`;
      else if (b.status === 3) tag = `<span class="tag tag-success" style="font-size: 10px; padding: 2px 6px; background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
      else if (b.status === 4) tag = `<span class="tag tag-secondary" style="font-size: 10px; padding: 2px 6px;">已结束</span>`;

      html += `
        <div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px; display: flex; gap: 12px; cursor: pointer;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => H5App.showBidDetail('${b.id}'))">
          <img src="${b.image}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 4px;">
          <div style="flex:1;">
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 6px; display: flex; justify-content: space-between; align-items: flex-start;">
              <span style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 120px;">${b.title}</span>
              ${tag}
            </div>
            <div class="text-xs text-secondary flex items-center gap-1 mb-2"><span>${b.shopName}</span><span class="bg-gray-100 px-1 rounded">No.${b.shopId}</span></div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">底价: ${b.startPrice}</div>
            <div style="font-size: 12px; color: #666;">当前价: <span style="color: var(--danger-color); font-weight: bold; font-size: 16px;">${b.currentMaxOffer || b.startPrice}</span></div>
          </div>
        </div>
      `;
    });
    if(list) list.innerHTML = html || '<div class="text-center py-12 text-secondary text-sm">暂无符合条件的竞价项目</div>';
  },

  doBidSearch() {
    const kw = document.getElementById('h5-bid-search-keyword').value.trim();
    this.renderBids(kw);
  },

  setBidStatusFilter(status, el) {
    this.currentBidFilter = status;
    const parent = document.getElementById('h5-bid-status-filters');
    if (parent) {
      parent.querySelectorAll('span').forEach(span => {
        span.className = 'tag tag-secondary cursor-pointer';
      });
    }
    if (el) {
      el.className = 'tag tag-primary cursor-pointer';
    }
    const kw = document.getElementById('h5-bid-search-keyword').value.trim();
    this.renderBids(kw);
  },

  _bidPhotoFile: null,

  showBidDetail(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;

    // Generate steps (5 steps: 看货报名, 现场看货, 参加竞价, 等待公布, 中标付款)
    const steps = ['看货报名', '现场看货', '参加竞价', '等待公布', '中标付款'];
    let stepsHtml = '<div style="position: relative; padding-left: 28px; margin-top: 16px;">';
    stepsHtml += '<div style="position: absolute; left: 9px; top: 12px; bottom: 12px; width: 0; border-left: 2px dashed var(--border-color);"></div>';
    steps.forEach((name, index) => {
      let isActive = index === b.status;
      let isDone = index < b.status;
      
      let circleBg = '#ffffff';
      let circleBorder = 'var(--border-strong)';
      let textColor = 'var(--text-secondary)';
      let textWeight = 'normal';
      let icon = index + 1;
      
      if (isActive) {
        circleBg = 'var(--primary-color)';
        circleBorder = 'var(--primary-color)';
        textColor = 'var(--text-main)';
        textWeight = 'bold';
        icon = '<span style="color:#fff; font-size:8px;">●</span>';
      } else if (isDone) {
        circleBg = 'var(--success-bg)';
        circleBorder = 'var(--success-color)';
        textColor = 'var(--success-color)';
        textWeight = '500';
        icon = '<span style="font-size:10px;">✓</span>';
      }
      
      stepsHtml += `
        <div style="position: relative; margin-bottom: 20px; display: flex; align-items: center; min-height: 20px;">
          <div style="position: absolute; left: -28px; width: 20px; height: 20px; border-radius: 50%; background: ${circleBg}; border: 1.5px solid ${circleBorder}; display: flex; align-items: center; justify-content: center; font-size: 11px; color: ${isActive ? '#fff' : textColor}; font-weight: bold; box-shadow: var(--shadow-sm);">
            ${icon}
          </div>
          <div style="font-size: 13px; color: ${textColor}; font-weight: ${textWeight};">${name}</div>
        </div>
      `;
    });
    stepsHtml += '</div>';

    // Interactive UI based on status
    let actionCardHTML = '';
    if (b.status === 0) {
      actionCardHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-sizing:border-box;">
          <div style="font-weight:bold; font-size:13px; color:#1e293b; margin-bottom:6px;">📋 看货报名</div>
          <p style="margin:0 0 10px 0; font-size:11px; color:#64748b;">该项目须先在线报名以获取线下实勘看货和出价资格。</p>
          <button class="btn btn-primary w-full" style="height:36px; border-radius:18px; border:none; background:var(--primary-color); color:#fff; font-size:12px;" onclick="H5App.signUpForBidInspection('${b.id}')">立即报名看货</button>
        </div>
      `;
    } else if (b.status === 1) {
      actionCardHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-sizing:border-box;">
          <div style="font-weight:bold; font-size:13px; color:#1e293b; margin-bottom:6px;">📸 现场看货核验</div>
          <p style="margin:0 0 10px 0; font-size:11px; color:#64748b;">请到达存放现场，点击下方区域上传自拍照片：</p>
          <div style="border:1.5px dashed #cbd5e1; border-radius:8px; padding:12px; text-align:center; background:#fff; margin-bottom:10px;" onclick="document.getElementById('h5-bid-photo-picker').click()">
            <span style="font-size:18px;">📁</span>
            <div id="h5-bid-photo-text" style="font-size:11px; color:#475569; font-weight:bold; margin-top:4px;">选择现场照片 (PNG/JPG)</div>
            <input type="file" id="h5-bid-photo-picker" accept="image/*" style="display:none;" onchange="H5App.handleBidPhotoSelected(this)">
          </div>
          <div id="h5-bid-photo-card" style="display:none; align-items:center; justify-content:space-between; padding:6px 10px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:11px; color:#15803d; margin-bottom:10px;">
            <span id="h5-bid-photo-name" style="font-weight:bold; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70%;"></span>
            <span style="cursor:pointer; color:#ef4444; font-weight:bold;" onclick="event.stopPropagation(); H5App.clearBidPhoto()">删除</span>
          </div>
          <button id="h5-bid-photo-submit-btn" class="btn btn-primary w-full" style="height:36px; border-radius:18px; border:none; background:#cbd5e1; color:#fff; font-size:12px; cursor:not-allowed;" disabled onclick="H5App.submitBidPhoto('${b.id}')">确认提交现场照片</button>
        </div>
      `;
    } else if (b.status === 2) {
      actionCardHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; box-sizing:border-box;">
          <div style="font-weight:bold; font-size:13px; color:#1e293b; margin-bottom:6px;">⚖️ 竞价出价</div>
          <p style="margin:0 0 10px 0; font-size:11px; color:#64748b;">出价须高于起拍底价和当前最高出价：</p>
          <div style="display:flex; gap:8px;">
            <input type="number" id="h5-bid-price-input" placeholder="输入出价金额 (元)" class="form-control" style="flex:1; height:36px; border-radius:18px; font-family:monospace; font-weight:bold; font-size:13px; padding: 0 12px;" min="${parseFloat(b.startPrice.replace(/[^\d\.]/g, ''))}">
            <button class="btn btn-primary" style="height:36px; border-radius:18px; border:none; background:var(--primary-color); color:#fff; font-size:12px; padding: 0 16px;" onclick="H5App.submitBidPrice('${b.id}')">提交出价</button>
          </div>
          <div style="font-size:10px; color:#94a3b8; margin-top:4px;">* 底价 ${b.startPrice}，加价幅度不限。</div>
        </div>
      `;
    } else if (b.status === 3) {
      const myOffersForBid = MockData.biddingOffers.filter(o => o.bidId === b.id && o.buyerName === 'H5买家用户');
      let myLastOfferHtml = '';
      if (myOffersForBid.length > 0) {
        myLastOfferHtml = `<div style="font-weight:bold; color:#15803d; margin-bottom:4px;">您的已登记报价：${myOffersForBid[0].offerPrice}</div>`;
      }
      actionCardHTML = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:12px; color:#15803d; box-sizing:border-box; font-size:11px;">
          ${myLastOfferHtml}
          <div style="font-weight:bold; margin-bottom:4px;">⏳ 等待定标公布中</div>
          <p style="margin:0 0 8px 0; color:#64748b;">在公布结果前，您依然可以追加更高报价：</p>
          <div style="display:flex; gap:8px;">
            <input type="number" id="h5-bid-price-input" placeholder="追加报价金额 (元)" class="form-control" style="flex:1; height:36px; border-radius:18px; font-family:monospace; font-weight:bold; font-size:13px; padding: 0 12px;" min="${parseFloat(b.startPrice.replace(/[^\d\.]/g, ''))}">
            <button class="btn btn-primary" style="height:36px; border-radius:18px; border:none; background:var(--primary-color); color:#fff; font-size:12px; padding: 0 16px;" onclick="H5App.submitBidPrice('${b.id}')">追加</button>
          </div>
        </div>
      `;
    } else if (b.status === 4) {
      if (b.winner === 'H5买家用户') {
        actionCardHTML = `
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:12px; color:#15803d; box-sizing:border-box; font-size:12px;">
            <div style="font-weight:bold; margin-bottom:4px;">🏆 恭喜您中标该项目！</div>
            <div style="margin-bottom:8px;">成交金额：<strong style="color:#ef4444;">${b.currentMaxOffer}</strong>。请前往“我的 - 我的订单”进行电子合同签署及打款付款履约流程。</div>
            <button class="btn btn-primary w-full" style="height:34px; border-radius:17px; font-size:11px; border:none; background:var(--primary-color); color:#fff;" onclick="UI.closeModal('sheet-h5-bid-detail'); H5App.showView('view-uc-orders');">去订单中心处理</button>
          </div>
        `;
      } else {
        actionCardHTML = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; color:#64748b; box-sizing:border-box; font-size:12px;">
            <div style="font-weight:bold; color:#0f172a; margin-bottom:4px;">竞价已结束</div>
            <div>中标人：<strong>${b.winner}</strong> | 最终成交价：<strong style="color:#ef4444;">${b.currentMaxOffer}</strong></div>
          </div>
        `;
      }
    }

    const contentEl = document.getElementById('h5-bid-detail-content');
    if (contentEl) {
      contentEl.innerHTML = `
        <div class="flex flex-col gap-4">
          <div style="position: relative; overflow: hidden; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
            <img src="${b.image}" style="width: 100%; height: 140px; object-fit: cover; display: block;">
            <span class="tag" style="position: absolute; top: 12px; right: 12px; font-size: 10px; padding: 4px 8px; border-radius: 12px; background: rgba(0,0,0,0.6); color: #fff; backdrop-filter: blur(4px);">
              ${b.status === 4 ? '已结束' : '竞拍中'}
            </span>
          </div>
          <div>
            <h2 class="text-base font-bold text-main mb-1" style="line-height: 1.4;">${b.title}</h2>
            <div class="text-xs text-secondary flex items-center gap-1.5 mb-3">
              <span>🏢 处置商户: ${b.shopName}</span>
              <span style="color: #ddd;">|</span>
              <span class="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">No.${b.id}</span>
            </div>
            
            <div class="p-3 bg-gray-50 rounded-2xl flex flex-col gap-2" style="border: 1px solid var(--border-light); margin-bottom:12px;">
              <div class="flex justify-between items-center text-xs text-regular">
                <span>💰 起拍底价</span>
                <span class="text-main font-bold">${b.startPrice}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-regular">
                <span>🔥 当前最高出价</span>
                <span class="text-danger font-bold text-base">${b.currentMaxOffer}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-regular">
                <span>⏰ 截止竞价时间</span>
                <span class="text-main">${b.bidEndTime}</span>
              </div>
            </div>
            
            ${actionCardHTML}
          </div>
          <div class="mt-2 border-t pt-4">
            <h3 class="font-bold text-sm text-main">🚀 竞价项目节点流转</h3>
            ${stepsHtml}
          </div>
        </div>
      `;
    }

    const footerEl = document.getElementById('h5-bid-detail-footer');
    if (footerEl) {
      footerEl.innerHTML = `
        <button class="btn btn-outline w-full py-3" style="border-radius: 24px;" onclick="UI.closeModal('sheet-h5-bid-detail')">关闭</button>
      `;
    }

    UI.openModal('sheet-h5-bid-detail');
  },

  signUpForBidInspection(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    b.status = 1;
    UI.toast('看货报名成功！已激活现场核验步骤。', 'success');
    this.showBidDetail(id);
    this.renderBids();
  },

  handleBidPhotoSelected(input) {
    const file = input.files[0];
    if (!file) return;
    this._bidPhotoFile = file;
    
    document.getElementById('h5-bid-photo-name').innerText = `📸 ${file.name}`;
    document.getElementById('h5-bid-photo-card').style.display = 'flex';
    
    const submitBtn = document.getElementById('h5-bid-photo-submit-btn');
    if (submitBtn) {
      submitBtn.style.background = 'var(--primary-color)';
      submitBtn.style.cursor = 'pointer';
      submitBtn.disabled = false;
    }
    UI.toast('现场实勘照片选择成功，请点击确认提交！', 'success');
  },

  clearBidPhoto() {
    this._bidPhotoFile = null;
    document.getElementById('h5-bid-photo-picker').value = '';
    document.getElementById('h5-bid-photo-card').style.display = 'none';
    
    const submitBtn = document.getElementById('h5-bid-photo-submit-btn');
    if (submitBtn) {
      submitBtn.style.background = '#cbd5e1';
      submitBtn.style.cursor = 'not-allowed';
      submitBtn.disabled = true;
    }
  },

  submitBidPhoto(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    b.status = 2;
    UI.toast('现场自拍核验通过！出价通道开启。', 'success');
    this.showBidDetail(id);
    this.renderBids();
  },

  submitBidPrice(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    
    const inputEl = document.getElementById('h5-bid-price-input');
    if (!inputEl) return;
    
    const offerPriceVal = parseFloat(inputEl.value);
    const startPriceVal = parseFloat(b.startPrice.replace(/[^\d\.]/g, ''));
    const maxOfferVal = b.currentMaxOffer === '-' ? 0 : parseFloat(b.currentMaxOffer.replace(/[^\d\.]/g, ''));
    const minRequired = Math.max(startPriceVal, maxOfferVal);

    if (isNaN(offerPriceVal) || offerPriceVal <= minRequired) {
      UI.toast(`加价必须高于当前最高价 (当前最小出价要求: ¥${minRequired.toLocaleString()})`, 'error');
      return;
    }

    const offerPriceStr = '¥' + offerPriceVal.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    
    MockData.biddingOffers.unshift({
      id: 'OFR' + Math.floor(1000 + Math.random() * 9000),
      bidId: id,
      buyerName: 'H5买家用户',
      offerPrice: offerPriceStr,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 0
    });

    b.currentMaxOffer = offerPriceStr;
    b.status = 3;

    UI.toast(`提交成功！金额 ${offerPriceStr} 已录入系统。`, 'success');
    this.showBidDetail(id);
    this.renderBids();
    this.renderUserBids();
  },

  // === 搜索与商铺 ===
  doSearch() {
    const type = document.getElementById('h5-search-type').value;
    const kw = document.getElementById('h5-search-keyword').value.trim();
    if (!kw) {
      UI.toast('请输入搜索关键词', 'warning');
      return;
    }
    if (type === 'merchant') {
      const filteredShops = MockData.shops.filter(s => s.shopName.includes(kw) || s.companyName.includes(kw));
      if (filteredShops.length > 0) {
        this.switchH5View('view-shops');
        document.getElementById('h5-shops-count').innerText = `共找到 ${filteredShops.length} 个相关店铺`;
        let html = '';
        filteredShops.forEach(s => {
          const avatarChar = s.avatar ? '' : s.shopName.charAt(0);
          const avatarHtml = s.avatar ? `<img src="${s.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">${avatarChar}</div>`;
          html += `
            <div class="card flex gap-3 items-center" onclick="H5App.goToShop('${s.id}', '${s.shopName}')" style="padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; background: #fff; cursor: pointer; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 12px;">
                ${avatarHtml}
                <div>
                  <div class="font-bold text-sm text-slate-800">${s.shopName}</div>
                  <div class="text-[10px] text-slate-400 mt-0.5">${s.companyName}</div>
                </div>
              </div>
              <svg class="icon-svg text-slate-300" style="width:16px; height:16px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
          `;
        });
        document.getElementById('h5-grid-search-shops').innerHTML = html;
      } else {
        UI.toast('未找到相关商户', 'error');
      }
    } else {
      this.renderHomeProducts(kw);
    }
  },

  goToShop(shopId, shopName = '未知店铺') {
    const shop = MockData.shopDetails && MockData.shopDetails[shopId];
    document.getElementById('h5-shop-name').innerText = shop ? shop.name : shopName;
    document.getElementById('h5-shop-id').innerText = 'No.' + shopId;
    
    if (shop) {
      const banner = document.getElementById('h5-shop-banner');
      if (banner) banner.style.backgroundImage = `url(${shop.banner})`;
      
      const avatar = document.getElementById('h5-shop-avatar');
      if (avatar) avatar.innerText = shop.avatar;
      
      const followBtn = document.getElementById('h5-shop-follow-btn');
      if (followBtn) {
        followBtn.innerText = shop.isFollowed ? '已关注' : '关注';
        followBtn.className = shop.isFollowed ? 'btn btn-sm' : 'btn btn-primary btn-sm';
      }
    }
    
    this.switchH5View('view-shop');
    this.renderShopProducts(shopId);
    window.scrollTo(0, 0);
  },
  
  toggleFollowShop() {
    const shopIdText = document.getElementById('h5-shop-id').innerText;
    const shopId = parseInt(shopIdText.replace('No.', ''));
    const shop = MockData.shopDetails && MockData.shopDetails[shopId];
    if (shop) {
      shop.isFollowed = !shop.isFollowed;
      const followBtn = document.getElementById('h5-shop-follow-btn');
      if (followBtn) {
        followBtn.innerText = shop.isFollowed ? '已关注' : '关注';
        followBtn.className = shop.isFollowed ? 'btn btn-sm' : 'btn btn-primary btn-sm';
      }
      UI.toast(shop.isFollowed ? '已关注该店铺' : '已取消关注', 'success');
    }
  },

  doShopSearch() {
    const kw = document.getElementById('h5-shop-search-keyword').value.trim();
    const shopIdText = document.getElementById('h5-shop-id').innerText;
    const shopId = parseInt(shopIdText.replace('No.', ''));
    this.renderShopProducts(shopId, kw);
  },

  renderShopProducts(shopId, keyword = '') {
    const grid = document.getElementById('h5-shop-products');
    let html = '';
    let filtered = MockData.products.filter(p => p.status === 1 && p.shopId === shopId);
    if (keyword) {
      filtered = filtered.filter(p => p.name.includes(keyword));
    }
    filtered.forEach(p => {
      html += `
        <div style="background: #fff; border-radius: 8px; overflow: hidden; margin-bottom: 12px; display: flex; flex-direction: column;" onclick="H5App.showCartSheet('${p.id}')">
          <img src="${p.image}" style="width: 100%; height: 120px; object-fit: cover;">
          <div style="padding: 10px;">
            <div style="font-weight: bold; font-size: 13px; margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${p.name}</div>
            <div style="color: var(--danger-color); font-weight: bold; font-size: 16px;">${p.priceStr}</div>
            <div class="text-xs text-gray-400 mt-1">(店内) ${p.shopName}</div>
            <div class="mt-2 flex items-center justify-between" onclick="event.stopPropagation()">
              <button class="btn btn-outline flex items-center justify-center" style="width: 30px; height: 30px; padding: 0; color: var(--primary-color); border-color: rgba(0, 82, 217, 0.2); background: rgba(0, 82, 217, 0.05); border-radius: 50%; flex-shrink: 0; cursor: pointer;" onclick="event.stopPropagation(); UI.openModal('sheet-h5-chat'); document.getElementById('h5-chat-prod-title').innerText='${p.name}'; document.getElementById('h5-chat-prod-price').innerText='${p.priceStr}'; document.getElementById('h5-chat-prod-img').src='${p.image}';">
                <svg class="icon-svg" style="width: 14px; height: 14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
              </button>
              <div class="flex items-center gap-1" style="flex: 1; justify-content: flex-end;">
                <div class="quantity-stepper" style="transform: scale(0.9); transform-origin: right center; margin-right: 4px;">
                  <button class="stepper-btn minus" style="font-size: 14px; width: 24px; height: 24px;" onclick="let inp=this.nextElementSibling; inp.value=Math.max(1, parseInt(inp.value||1)-1)">-</button>
                  <input type="number" id="qty-in-${p.id}" value="1" min="1" class="stepper-input" style="font-size: 12px; width: 32px; height: 24px;" onclick="event.stopPropagation()">
                  <button class="stepper-btn plus" style="font-size: 14px; width: 24px; height: 24px;" onclick="let inp=this.previousElementSibling; inp.value=parseInt(inp.value||1)+1">+</button>
                </div>
                <button class="btn btn-primary flex items-center justify-center" style="width: 30px; height: 30px; padding: 0; border-radius: 50%; flex-shrink: 0; background: var(--primary-color); border: none; cursor: pointer; color: #fff;" onclick="H5App.quickAddToCart('${p.id}')">
                  <svg class="icon-svg" style="width: 14px; height: 14px; color: #fff;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    });
    if (grid) grid.innerHTML = html || '<div class="text-center py-8 text-secondary text-sm">店内未找到相关商品</div>';
  },

  // === 购物车渲染 ===
  renderCart() {
    const container = document.getElementById('h5-cart-list');
    const footer = document.getElementById('h5-cart-footer');
    if (!container || !MockData.cart) return;

    if (MockData.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-secondary mb-4">购物车空空如也</div>
          <button class="btn btn-primary" onclick="document.querySelector('.h5-tab-item[data-target=\\'view-home\\']').click()">去逛逛</button>
        </div>
      `;
      if (footer) footer.style.display = 'none';
      return;
    }

    // Group items by shopId
    const grouped = {};
    MockData.cart.forEach(item => {
      const shopId = item.shopId || 'unknown';
      if (!grouped[shopId]) {
        grouped[shopId] = {
          shopName: item.shopName || '其他店铺',
          items: []
        };
      }
      grouped[shopId].items.push(item);
    });

    let html = '';
    let totalAmount = 0;
    let selectedCount = 0;
    let invalidCount = 0;

    Object.keys(grouped).forEach(shopId => {
      const group = grouped[shopId];
      const shopName = group.shopName;
      const shopItems = group.items;

      const activeShopItems = shopItems.filter(i => i.status === 1);
      const allShopChecked = activeShopItems.length > 0 && activeShopItems.every(i => i.checked);

      let shopItemsHtml = '';
      shopItems.forEach((item, index) => {
        const isLast = index === shopItems.length - 1;
        const borderStyle = isLast ? '' : 'border-bottom: 1px solid #f8fafc; padding-bottom: 12px; margin-bottom: 12px;';

        if (item.status === 0) {
          invalidCount++;
          shopItemsHtml += `
            <div style="display: flex; align-items: center; gap: 10px; color: #999; ${borderStyle}">
              <span class="tag tag-secondary text-xs" style="padding:2px 6px;">失效</span>
              <div style="flex:1;">
                <div style="font-size: 13px; margin-bottom: 4px;">${item.name}</div>
              </div>
              <button class="btn btn-text btn-sm text-danger" onclick="H5App.removeCartItem('${item.id}')">删除</button>
            </div>
          `;
        } else {
          if (item.checked) {
            totalAmount += item.price * item.quantity;
            selectedCount += item.quantity;
          }

          shopItemsHtml += `
            <div style="display: flex; align-items: center; gap: 10px; ${borderStyle}">
              <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="H5App.toggleCartItem('${item.id}', this.checked)" style="width:16px; height:16px; cursor:pointer;">
              <div style="flex:1; overflow:hidden;">
                <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; color:#1e293b;">${item.name}</div>
                <div class="flex justify-between items-center" style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
                  <span style="color: var(--danger-color); font-weight: bold; font-size:14px; font-family:monospace;">¥${item.price}</span>
                  <div class="flex gap-2 items-center" style="display:flex; align-items:center; gap:6px;">
                    <button class="btn btn-outline" style="width:24px; height:24px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onclick="H5App.updateCartQty('${item.id}', -1)">-</button>
                    <input type="number" class="form-control" style="width:35px; height: 24px; text-align:center; padding:0; font-size:12px;" value="${item.quantity}" onchange="H5App.setCartQty('${item.id}', this.value)">
                    <button class="btn btn-outline" style="width:24px; height:24px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onclick="H5App.updateCartQty('${item.id}', 1)">+</button>
                  </div>
                </div>
              </div>
              <button class="btn btn-text text-danger px-1" onclick="H5App.removeCartItem('${item.id}')" style="margin-left:8px; font-size:12px;">删除</button>
            </div>
          `;
        }
      });

      html += `
        <div style="background: #fff; border-radius: 12px; margin-bottom: 16px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow:hidden;">
          <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #f8fafc; padding-bottom:8px; margin-bottom:8px;">
            <label class="flex items-center gap-2 font-bold text-slate-800 text-sm" style="display:flex; align-items:center; gap:6px; cursor:pointer;">
              <input type="checkbox" ${allShopChecked ? 'checked' : ''} onchange="H5App.toggleShopCart('${shopId}', this.checked)" style="width:16px; height:16px;">
              🏪 ${shopName}
            </label>
            <span class="text-xs text-secondary" onclick="H5App.goToShop('${shopId}', '${shopName}')">进店 &gt;</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:12px; margin-top:8px;">
            ${shopItemsHtml}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    if (footer) {
      footer.style.display = 'flex';
      const allActive = MockData.cart.filter(c => c.status === 1);
      const allChecked = allActive.length > 0 && allActive.every(c => c.checked);

      footer.innerHTML = `
        <div class="flex items-center gap-2 flex-1">
          <label class="flex items-center gap-1 text-sm" style="display:flex; align-items:center; gap:4px; font-weight:bold; color:#475569;"><input type="checkbox" ${allChecked ? 'checked' : ''} onchange="H5App.toggleAllCart(this.checked)" style="width:16px; height:16px;"> 全选</label>
        </div>
        <div class="flex items-center gap-3" style="display:flex; align-items:center; gap:12px;">
          <div class="text-right">
            <div class="text-sm" style="color:#475569;">合计: <span class="text-danger font-bold text-base" style="font-family:monospace; font-size:16px; font-weight:900;">¥${totalAmount}</span></div>
            ${invalidCount > 0 ? `<div class="text-xs text-secondary">${invalidCount}件失效</div>` : ''}
          </div>
          <button class="btn btn-primary" style="height: 40px; padding: 0 24px; border-radius: 20px; font-weight:bold; font-size:13px;" ${selectedCount === 0 ? 'disabled' : ''} onclick="H5App.checkoutCart()">生成订单</button>
        </div>
      `;
    }

    const badge = document.getElementById('h5-cart-badge');
    if (badge) {
      const totalQty = MockData.cart.filter(c => c.status === 1).reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty > 0) {
        badge.innerText = totalQty;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  toggleShopCart(shopId, checked) {
    MockData.cart.forEach(item => {
      if (item.shopId === shopId && item.status === 1) {
        item.checked = checked;
      }
    });
    this.renderCart();
  },

  toggleCartItem(id, checked) {
    const item = MockData.cart.find(c => c.id == id);
    if (item) item.checked = checked;
    this.renderCart();
  },

  toggleAllCart(checked) {
    MockData.cart.forEach(c => {
      if (c.status === 1) c.checked = checked;
    });
    this.renderCart();
  },

  updateCartQty(id, delta) {
    const item = MockData.cart.find(c => c.id == id);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty > 0) {
        item.quantity = newQty;
        this.renderCart();
      }
    }
  },

  setCartQty(id, value) {
    const item = MockData.cart.find(c => c.id == id);
    if (item) {
      const newQty = parseInt(value, 10);
      if (!isNaN(newQty) && newQty > 0) {
        item.quantity = newQty;
      }
      this.renderCart();
    }
  },

  removeCartItem(id) {
    if (confirm('确认移除？')) {
      MockData.cart = MockData.cart.filter(c => c.id != id);
      this.renderCart();
      UI.toast('已移除', 'success');
    }
  },

  checkoutCart() {
    const selectedItems = MockData.cart.filter(item => item.status === 1 && item.checked);
    if (selectedItems.length === 0) {
      UI.toast('请先勾选需要结算的商品', 'warning');
      return;
    }

    // 校验是否是同一个商家
    const shopIds = [...new Set(selectedItems.map(item => item.shopId))];
    if (shopIds.length > 1) {
      alert('⚠️ 大宗商品交易不支持跨商户合并结算！\n\n请只勾选同一家店铺的商品后再进行结算。');
      return;
    }

    const firstItem = selectedItems[0];
    const totalAmount = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const amountStr = '¥' + totalAmount.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    const orderId = 'ORD' + Date.now().toString().substring(5);

    // 构建商品名称串 (支持同商家多个货品显示)
    const productNamesStr = selectedItems.map(item => `${item.productName || item.name} (${item.quantity}件)`).join('、');

    const newOrder = {
      id: orderId,
      shopId: firstItem.shopId,
      shopName: firstItem.shopName,
      buyerName: 'H5买家用户',
      productName: productNamesStr,
      amount: amountStr,
      status: 0, // 待买家签约
      type: '现货交易',
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      products: selectedItems.map(item => ({
        name: item.productName || item.name,
        price: item.price,
        quantity: item.quantity,
        amount: item.price * item.quantity
      }))
    };

    // 插入订单库
    MockData.orders.unshift(newOrder);

    // 清理选中的购物车项
    MockData.cart = MockData.cart.filter(item => !item.checked);

    // 更新购物车渲染与角标
    this.renderCart();
    this.updateCartBadge();
    if (window.MainApp) MainApp.updateCartCount();

    UI.toast(`订单已生成，请在此进行签约！`, 'success');

    // 切换到“我的”订单列表
    this.showView('view-uc-orders');
  },

  currentUserOrderFilter: 'all',

  setOrderStatusFilter(status, el) {
    this.currentUserOrderFilter = status;
    const filters = document.querySelectorAll('.h5-order-filter');
    filters.forEach(f => {
      f.className = 'tag tag-secondary cursor-pointer h5-order-filter';
    });
    if (el) {
      el.className = 'tag tag-primary cursor-pointer h5-order-filter';
    }
    this.renderUserOrders();
  },

  renderUserOrders() {
    const list = document.getElementById('h5-user-order-list');
    if (!list) return;
    
    let myOrders = MockData.orders;
    
    // Filter status
    const status = this.currentUserOrderFilter || 'all';
    if (status !== 'all') {
      if (status === 'sign') {
        myOrders = myOrders.filter(o => o.status === 0 || o.status === 5);
      } else {
        myOrders = myOrders.filter(o => o.status === parseInt(status));
      }
    }
    
    let html = '';
    if (myOrders.length === 0) {
      html = '<div class="text-center py-12 text-secondary text-sm">暂无匹配的订单数据</div>';
    } else {
      myOrders.forEach(o => {
        let statusTag = '';
        let btn = '';
        
        if (o.status === 4) {
          statusTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#595959;">待付款</span>`;
          btn = `<div style="display:flex; gap:8px;">
                   <button class="btn btn-primary btn-sm" style="border-radius:16px;" onclick="event.stopPropagation(); UI.showPaymentModal('${o.id}', () => H5App.renderUserOrders())">立即付款</button>
                   <button class="btn btn-outline btn-sm" style="border-radius:16px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); UI.cancelOrder('${o.id}', '买家', 'H5买家用户', () => H5App.renderUserOrders())">取消</button>
                 </div>`;
        } else if (o.status === 0) {
          statusTag = `<span class="tag tag-warning">待买家签约</span>`;
          btn = `<div style="display:flex; gap:8px;">
                   <button class="btn btn-warning btn-sm" style="border-radius:16px;" onclick="event.stopPropagation(); UI.showContractSigningModal('${o.id}', false, () => H5App.renderUserOrders())">立即签约</button>
                   <button class="btn btn-outline btn-sm" style="border-radius:16px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); UI.cancelOrder('${o.id}', '买家', 'H5买家用户', () => H5App.renderUserOrders())">取消</button>
                 </div>`;
        } else if (o.status === 5) {
          statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待卖家签约</span>`;
          btn = `<button class="btn btn-outline btn-sm" style="border-radius:16px; border-color:#ef4444; color:#ef4444;" onclick="event.stopPropagation(); UI.cancelOrder('${o.id}', '买家', 'H5买家用户', () => H5App.renderUserOrders())">取消订单</button>`;
        } else if (o.status === 1) {
          statusTag = `<span class="tag tag-primary">待发货</span>`;
        } else if (o.status === 2) {
          statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货(待签收)</span>`;
          btn = `<button class="btn btn-primary btn-sm" style="border-radius:16px; background:#10b981; border-color:#10b981;" onclick="event.stopPropagation(); H5App.confirmBuyerReceipt('${o.id}')">确认收货</button>`;
        } else if (o.status === 3) {
          statusTag = `<span class="tag tag-success">已完结</span>`;
          if (!o.invoiceApplied) {
            btn = `<button class="btn btn-warning btn-sm" style="border-radius:16px;" onclick="event.stopPropagation(); H5App.applyInvoice('${o.id}')">申请发票</button>`;
          }
        } else {
          statusTag = `<span class="tag tag-danger">已关闭</span>`;
        }

        html += `
          <div onclick="UI.showOrderDetail('${o.id}')" style="background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #f1f5f9; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <div class="flex justify-between items-center mb-3 pb-3" style="border-bottom: 1px solid #f8fafc; display:flex; justify-content:space-between; align-items:center;">
              <div style="font-family: monospace; font-size: 12px; color: #64748b;">${o.id}</div>
              ${statusTag}
            </div>
            <div style="font-size: 15px; font-weight: 800; color: #1e293b; margin-bottom: 6px;">${o.productName}</div>
            <div style="font-size: 11px; color: #94a3b8; margin-bottom: 10px;">店铺: ${o.shopName}</div>
            <div class="flex justify-between items-center mt-3" style="display:flex; justify-content:space-between; align-items:center;">
              <div class="text-danger font-bold text-base" style="font-size: 16px; font-family: monospace;">${o.amount}</div>
              ${btn}
            </div>
          </div>
        `;
      });
    }
    list.innerHTML = html;
  },

  confirmBuyerReceipt(orderId) {
    const o = MockData.orders.find(x => x.id === orderId);
    if (o) {
      o.status = 3;
      UI.toast(`订单 ${orderId} 确认收货成功！交易已完成`, 'success');
      this.renderUserOrders();
    }
  },

  openUserContractModal(orderId) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;
    
    const bodyEl = document.getElementById('h5-contract-body');
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
            <div style="color: #999; border: 1px dashed #ccc; padding: 8px 12px; font-size:11px;">
              (未签章)
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
    
    const signBtn = document.getElementById('h5-contract-sign-btn');
    if (signBtn) {
      signBtn.onclick = () => {
        order.status = 5; // Change to pending seller signature / "待卖家签约"
        UI.closeModal('sheet-h5-contract');
        UI.toast('您已签名并盖章成功！已向商家发出签约提醒。', 'success');
        this.renderUserOrders();
      };
    }
    
    UI.showModal('sheet-h5-contract');
  },

  renderUserDemands() {
    const list = document.getElementById('h5-uc-demands-list');
    if (!list) return;
    list.innerHTML = `
      <div style="font-weight:bold; font-size:12px; color:#64748b; margin-bottom:8px;">📢 我发表的求购单</div>
      <div class="card p-3 mb-3 bg-white" style="border:1px solid #f1f5f9; border-radius:8px;">
        <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between;">
          <strong class="text-slate-800 text-sm">REQ001 急求 50吨 Q345B 槽钢</strong>
          <span class="tag tag-success" style="font-size:10px;">寻源中</span>
        </div>
        <div class="text-xs text-secondary mb-2">预算: ¥4,200/吨 | 2026-07-07 09:00</div>
        <div class="text-xs text-primary font-bold">已收到 3 份报价单</div>
      </div>
      <div class="card p-3 mb-4 bg-white" style="border:1px solid #f1f5f9; border-radius:8px;">
        <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between;">
          <strong class="text-slate-800 text-sm">REQ004 采购 500吨 P.O 42.5 水泥</strong>
          <span class="tag tag-success" style="font-size:10px;">寻源中</span>
        </div>
        <div class="text-xs text-secondary mb-2">预算: ¥300/吨 | 2026-07-09 08:00</div>
        <div class="text-xs text-primary font-bold">已收到 5 份报价单</div>
      </div>

      <div style="font-weight:bold; font-size:12px; color:#64748b; margin-bottom:8px;">🙋 我参与的求购单 (我的报价)</div>
      <div class="card p-3 mb-3 bg-white" style="border:1px solid #f1f5f9; border-radius:8px;">
        <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between;">
          <strong class="text-slate-800 text-sm">REQ002 寻优质防腐木供应商</strong>
          <span class="tag tag-warning" style="font-size:10px; background:#fff7e6; color:#d46b08;">评估中</span>
        </div>
        <div class="text-xs text-secondary mb-2">我的报价: <span class="text-danger font-bold">¥320/立方</span> | 需求方: 星辉建筑公司</div>
        <button class="btn btn-text btn-sm text-danger p-0" style="font-size:11px; border:none; background:none;" onclick="UI.toast('已撤回您的报价意向', 'info'); H5App.renderUserDemands()">撤回我的报价</button>
      </div>
    `;
  },

  renderUserBids() {
    const list = document.getElementById('h5-uc-bids-list');
    if (!list) return;

    // Filter offers for 'H5买家用户'
    const myOffers = MockData.biddingOffers.filter(o => o.buyerName === 'H5买家用户');
    const uniqueBidIds = [...new Set(myOffers.map(o => o.bidId))];

    if (uniqueBidIds.length === 0) {
      list.innerHTML = `<div class="text-center py-12 text-secondary text-sm">您尚未参与任何竞拍项目</div>`;
      return;
    }

    let html = '';
    uniqueBidIds.forEach(bidId => {
      const b = MockData.biddingAnnouncements.find(x => x.id === bidId);
      if (!b) return;

      const myOffersForBid = myOffers.filter(o => o.bidId === bidId);
      const myMaxOfferVal = Math.max(...myOffersForBid.map(o => parseFloat(o.offerPrice.replace(/[^\d\.]/g, '')) || 0));
      const myMaxOfferStr = '¥' + myMaxOfferVal.toLocaleString('zh-CN', {minimumFractionDigits: 2});

      let tag = '';
      if (b.status === 0) tag = `<span class="tag tag-warning" style="font-size: 10px; padding: 2px 6px; background:#e6f7ff; color:#1890ff; border-color:#91d5ff;">看货报名</span>`;
      else if (b.status === 1) tag = `<span class="tag tag-warning" style="font-size: 10px; padding: 2px 6px; background:#fff7e6; color:#fa8c16; border-color:#ffd591;">现场看货</span>`;
      else if (b.status === 2) tag = `<span class="tag tag-success" style="font-size: 10px; padding: 2px 6px; background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">参加竞价</span>`;
      else if (b.status === 3) tag = `<span class="tag tag-success" style="font-size: 10px; padding: 2px 6px; background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
      else if (b.status === 4) tag = b.winner === 'H5买家用户'
        ? `<span class="tag tag-success" style="font-size: 10px; padding: 2px 6px; background:#f6ffed; color:#52c41a; border-color:#b7eb8f; font-weight:bold;">🏆 中标</span>`
        : `<span class="tag tag-secondary" style="font-size: 10px; padding: 2px 6px;">未中标</span>`;

      html += `
        <div class="card p-3 mb-3 bg-white" style="border:1px solid #f1f5f9; border-radius:8px; cursor:pointer;" onclick="H5App.showBidDetail('${b.id}')">
          <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between; align-items:center;">
            <strong class="text-slate-800 text-sm" style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 60%;">${b.title}</strong>
            ${tag}
          </div>
          <div class="text-xs text-secondary mb-1">项目编号: ${b.id} | 起拍价: ${b.startPrice}</div>
          <div class="text-xs text-secondary mb-1">当前最高价: <span class="text-danger font-bold">${b.currentMaxOffer}</span></div>
          <div class="text-xs font-bold" style="color:var(--primary-color);">我的最高出价: ${myMaxOfferStr}</div>
          <div class="text-[10px] text-slate-400 mt-2">截止时间: ${b.bidEndTime}</div>
        </div>
      `;
    });

    list.innerHTML = html;
  },

  applyInvoice(orderId) {
    UI.showInvoiceModal(orderId, () => {
      this.renderUserOrders();
    });
  },

  renderUserInvoices() {
    const list = document.getElementById('h5-uc-invoices-list');
    if (!list) return;
    list.innerHTML = `
      <div class="card p-3 mb-3 bg-white" style="border:1px solid #f1f5f9; border-radius:8px;">
        <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between;">
          <strong class="text-slate-800 text-sm">增值税专用发票 (INV20260701)</strong>
          <span class="tag tag-success" style="font-size:10px;">已邮寄</span>
        </div>
        <div class="text-xs text-secondary mb-1">关联订单: OD202607130002</div>
        <div class="text-xs text-danger font-bold">发票金额: ¥18,500.00</div>
        <div class="text-[10px] text-slate-400 mt-2">申请时间: 2026-07-13 14:30</div>
      </div>
      <div class="card p-3 mb-3 bg-white" style="border:1px solid #f1f5f9; border-radius:8px;">
        <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between;">
          <strong class="text-slate-800 text-sm">增值税普通发票 (INV20260702)</strong>
          <span class="tag tag-warning" style="font-size:10px; background:#fff7e6; color:#d46b08;">开具中</span>
        </div>
        <div class="text-xs text-secondary mb-1">关联订单: OD202607130005</div>
        <div class="text-xs text-danger font-bold">发票金额: ¥865,000.00</div>
        <div class="text-[10px] text-slate-400 mt-2">申请时间: 2026-07-16 11:20</div>
      </div>
    `;
  }
}

window.H5App = H5App;

document.addEventListener('DOMContentLoaded', () => {
  H5App.init();
});
