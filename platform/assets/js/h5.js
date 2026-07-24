
function formatTimeSec(str) {
  if (!str || str === "--") return "--";
  str = String(str).trim();
  if (str.length === 10) return str + " 00:00:00";
  if (str.length === 16) return str + ":00";
  return str;
}
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
    this.renderUserOrders();
    this.renderUserBids();
    this.renderUserInvoices();
    
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
        if (targetId === 'view-uc-demands') {
          H5App.renderUserDemands();
        }
        if (targetId === 'view-uc-bids') {
          H5App.renderUserBids();
        }
        if (targetId === 'view-uc-invoices') {
          H5App.renderUserInvoices();
        }
        if (targetId === 'view-shop' || targetId === 'view-uc-order-detail') {
          if (mainHeader) mainHeader.style.display = 'none';
        } else {
          if (mainHeader) mainHeader.style.display = 'flex';
        }

        // 店铺详情页隐藏顶部全局搜索栏
        const globalSearchBar = document.getElementById('h5-search-bar');
        if (globalSearchBar) {
          if (targetId === 'view-shop') {
            globalSearchBar.style.display = 'none';
          } else {
            globalSearchBar.style.display = 'flex';
          }
        }
          
        const headerTitle = document.getElementById('h5-header-title');
        const backBtn = document.getElementById('h5-header-back-btn');
        
        // Set Title
        if (headerTitle) {
          if (targetId === 'view-home') headerTitle.innerText = '咖喱粑粑商城';
          if (targetId === 'view-demand') headerTitle.innerText = '找货源 (寻源大厅)';
          if (targetId === 'view-bid') headerTitle.innerText = '大宗竞价大厅';
          if (targetId === 'view-cart') headerTitle.innerText = '购物车';
          if (targetId === 'view-my') headerTitle.innerText = '我的中心';
          if (targetId === 'view-uc-orders') headerTitle.innerText = '我的订单';
          if (targetId === 'view-uc-bids') headerTitle.innerText = '我的竞价记录';
          if (targetId === 'view-uc-invoices') headerTitle.innerText = '财税与发票中心';
          if (targetId === 'view-shops') headerTitle.innerText = '搜索商户店铺';
        }
        
        if (backBtn) {
          if (targetId === 'view-home' || targetId === 'view-demand' || targetId === 'view-bid' || targetId === 'view-my') {
            backBtn.style.display = 'none';
          } else if (targetId === 'view-cart' || targetId === 'view-uc-orders' || targetId === 'view-uc-bids' || targetId === 'view-uc-invoices') {
            backBtn.style.display = 'flex';
            backBtn.setAttribute('onclick', "H5App.switchH5View('view-my')");
          } else if (targetId === 'view-shops') {
            backBtn.style.display = 'flex';
            backBtn.setAttribute('onclick', "H5App.switchH5View('view-home')");
          } else {
            backBtn.style.display = 'flex';
            backBtn.setAttribute('onclick', "H5App.switchH5View('view-home')");
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



  renderQuickCategories() {
    const container = document.getElementById('h5-quick-categories');
    if (!container) return;
    let html = '';
    
    const categories = MockData.productCategories || [];
    // 包含【全部】在内总共只展示 6 个分类 (取前 5 个品类 + 1 个全部)
    const topLevels = categories.slice(0, 5); 
    
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(6, 1fr)';
    container.style.padding = '14px 6px';
    container.style.gap = '8px 2px';
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

  currentSaleTypeFilter: '',

  setSaleTypeFilter(type, btnEl) {
    this.currentSaleTypeFilter = type;
    if (btnEl) {
      document.querySelectorAll('.h5-saletype-tab').forEach(b => {
        b.style.background = '#fff';
        b.style.color = '#64748b';
        b.style.borderColor = '#e2e8f0';
      });
      btnEl.style.background = '#9a66e4';
      btnEl.style.color = '#fff';
      btnEl.style.borderColor = '#9a66e4';
    }
    this.renderHomeProducts();
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
    if (this.currentSaleTypeFilter) {
      filtered = filtered.filter(p => (p.shelfType || '现货') === this.currentSaleTypeFilter);
    }
    
    filtered.forEach(p => {
      const isSpot = (p.shelfType === '现货' || !p.shelfType);
      const tagHtml = isSpot 
        ? `<span style="background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">现货</span>`
        : `<span style="background:#f3e8ff; color:#7e22ce; padding:2px 6px; border-radius:4px; font-size:10px; font-weight:bold;">预售</span>`;
      const stockHtml = isSpot
        ? `<span style="font-size:11px; color:#64748b; font-weight:500;">库存: ${p.stock !== undefined ? p.stock : 100}</span>`
        : `<span style="font-size:11px; color:#7e22ce; font-weight:500;">按需定制</span>`;

      html += `
        <div class="h5-product-card card" onclick="H5App.showCartSheet('${p.id}')">
          <div class="img-wrapper" style="position:relative;">
            <img src="${p.image}" alt="${p.name}">
            <div style="position:absolute; top:6px; left:6px; z-index:2;">${tagHtml}</div>
          </div>
          <div class="info flex-col justify-between" style="flex: 1; padding: 12px; display: flex;">
            <div>
              <h3 class="title font-serif" style="font-size: 14px; margin-bottom: 4px; font-weight:bold; color:#0f172a;">${p.name}</h3>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
                <div class="price" style="font-size: 16px; color: var(--danger-color); font-weight: bold;">${p.priceStr.split(' ')[0]}</div>
                ${stockHtml}
              </div>
              <div class="shop-info mt-2" onclick="event.stopPropagation(); window.H5App && H5App.goToShop('${p.shopId}', '${p.shopName}')">
                <span class="shop-name truncate text-secondary text-sm">${p.shopName}</span>
              </div>
            </div>
            
            <div class="action-bar mt-4 flex items-center justify-end" onclick="event.stopPropagation()">
              <div class="flex items-center gap-1" style="justify-content: flex-end;">
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
    }

    if (keyword) {
      filtered = filtered.filter(d => (d.title || d.goodsName || '').includes(keyword) || d.buyerName.includes(keyword));
    }

    if (filtered.length === 0) {
      list.innerHTML = `<div class="text-center py-12 text-secondary text-sm">暂无符合条件的求购意向</div>`;
      return;
    }

       filtered.forEach(d => {
      let isMyDemand = d.buyerName === 'H5买家用户';
      const myQuote = MockData.demandQuotes.find(q => q.demandId === d.id && q.quoterName === 'H5买家用户');
      let isJoined = !!myQuote;
      let btn = '';
      let statusTag = '';
      let quotePriceHtml = '';

      if (showOnlyJoined && isJoined) {
        if (myQuote.status === 1) {
          statusTag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">已采纳</span>`;
          btn = `<span class="tag tag-success" style="display:block; text-align:center; font-size:12px; padding:8px; border-radius:8px; width:100%;">已采纳，请在线下执行订单合同</span>`;
        } else {
          statusTag = `<span class="tag tag-warning" style="background:#e6f7ff; color:#1890ff; border:1px solid #91d5ff; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">已报价</span>`;
          btn = `<button class="btn btn-primary" style="width:100%; height:36px; border-radius:8px; background:#9a66e4; border:none; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="H5App.editMyQuote('${myQuote.id}')">修改报价</button>`;
        }
        quotePriceHtml = `<div style="font-size:12px; color:#475569; margin-top:4px;">我的报价: <strong style="color:var(--danger-color);">${myQuote.price}</strong></div>`;
      } else {
        if (d.status === 0) {
          statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#d46b08; border:1px solid #ffd591; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">待审核</span>`;
        } else if (d.status === 1) {
          statusTag = `<span style="color:#16a34a; font-size:12px; font-weight:bold;">展示中</span>`;
        } else if (d.status === 2 || d.status === -1 || d.status === '已下架') {
          statusTag = `<span style="color:#94a3b8; font-size:12px; font-weight:500;">已下架</span>`;
        }

        const quotesCount = MockData.demandQuotes.filter(q => q.demandId === d.id).length;
        if (isMyDemand) {
          if (d.status === 0 || d.status === 1) {
            btn = `<div style="display:flex; gap:10px; width:100%;">
                     <button class="btn btn-outline" style="flex:1; height:36px; border-radius:8px; border:1px solid #cbd5e1; color:#334155; font-size:13px; font-weight:500; cursor:pointer; background:#fff;" onclick="H5App.cancelDemand('${d.id}')">下架</button>
                     <button class="btn btn-primary" style="flex:1; height:36px; border-radius:8px; background:linear-gradient(135deg, #9a66e4, #7e22ce); border:none; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="UI.showDemandQuotesModal('${d.id}', true, () => H5App.renderDemands())">查看报价 (${quotesCount})</button>
                   </div>`;
          } else {
            btn = `<div style="display:flex; justify-content:center; align-items:center; height:36px; color:#94a3b8; font-size:13px; font-weight:500;">已下架</div>`;
          }
        } else {
          if (d.status === 2 || d.status === -1 || d.status === '已下架') {
            btn = `<div style="display:flex; justify-content:center; align-items:center; height:36px; color:#94a3b8; font-size:13px; font-weight:500;">已下架</div>`;
          } else {
            btn = `<button class="btn btn-primary" style="width:100%; height:36px; border-radius:8px; background:linear-gradient(135deg, #9a66e4, #7e22ce); border:none; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="H5App.openQuoteModal('${d.id}')">立即报价</button>`;
          }
        }
      }

      const goodsName = d.goodsName || d.title;
      const buyerPhone = d.buyerPhone || '138****8818';
      const deliveryPeriod = d.deliveryPeriod || '2026-08-01 至 2026-08-15';

      html += `
        <div style="background: #fff; padding: 18px; border-radius: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; box-shadow:0 4px 12px rgba(0,0,0,0.03); display:flex; flex-direction:column; min-height: 210px; box-sizing:border-box;">
          <div class="flex justify-between items-center mb-1" style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
            <div style="font-weight: bold; font-size: 15px; color:#0f172a; flex:1; line-height:1.4;">求购货品: ${goodsName}</div>
            <div style="flex-shrink:0;">${statusTag}</div>
          </div>
          <div style="flex:1; display:flex; flex-direction:column; gap:4px; font-size:12px; color:#64748b; line-height:1.5; margin-top:4px;">
            <div>买方账号: <span style="font-family:monospace; font-weight:bold; color:#0284c7;">${buyerPhone}</span> <span style="color:#64748b;">(${d.buyerName})</span></div>
            <div>交期范围: <span style="color:#334155; font-weight:500;">${deliveryPeriod}</span></div>
            <div>发布时间: <span style="color:#64748b;">${formatTimeSec(d.publishTime)}</span></div>
            ${quotePriceHtml}
          </div>
          <div style="margin-top:auto; padding-top:12px; border-top: 1px dashed #f1f5f9;">
            ${btn}
          </div>
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
      d.status = -1; // 已下架
      UI.toast('已下架该求购信息！', 'success');
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
      goodsName: goodsName,
      category: '大宗物资',
      deliveryPeriod: deliveryPeriod,
      remark: '需求数量：' + quantity + unit,
      publishTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 1, // 直接展示中
      quotesCount: 0
    };
    MockData.demands.unshift(newDemand);
    UI.toast('求购意向发布成功！已在供求大厅展示。', 'success');
    UI.closeModal('sheet-h5-publish-demand');
    if (document.getElementById('h5-pd-goods-name')) document.getElementById('h5-pd-goods-name').value = '';
    if (document.getElementById('h5-pd-delivery-period')) document.getElementById('h5-pd-delivery-period').value = '';
    this.renderDemands();
  },

  openPublishDemandModal() {
    UI.openModal('sheet-h5-publish-demand');
  },

  openQuoteModal(demandId) {
    this.currentQuoteDemandId = demandId;
    this.editingQuoteId = null;

    const d = MockData.demands.find(x => x.id === demandId);
    const name = d ? (d.goodsName || d.title || '采购项目') : '采购项目';

    const titleEl = document.getElementById('h5-quote-prod-name');
    if (titleEl) titleEl.innerText = name;

    // Reset inputs
    if (document.getElementById('h5-quote-price')) document.getElementById('h5-quote-price').value = '';

    UI.openModal('sheet-h5-quote');
  },

  submitQuote() {
    const priceVal = document.getElementById('h5-quote-price').value.trim();

    if (!priceVal) {
      UI.toast('请填写报价金额！', 'error');
      return;
    }

    const priceFormatted = priceVal.startsWith('¥') ? priceVal : '¥' + priceVal;

    if (this.editingQuoteId) {
      const q = MockData.demandQuotes.find(x => x.id === this.editingQuoteId);
      if (q) {
        q.price = priceFormatted;
        q.time = new Date().toISOString().replace('T', ' ').substring(0, 16);
      }
      this.editingQuoteId = null;
      UI.toast('报价修改成功！', 'success');
    } else {
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
    }

    UI.closeModal('sheet-h5-quote');
    this.renderDemands();
  },

  editMyQuote(quoteId) {
    const q = MockData.demandQuotes.find(x => x.id === quoteId);
    if (!q) return;
    const d = MockData.demands.find(x => x.id === q.demandId);
    const goodsName = d ? (d.goodsName || d.title) : '采购需求项目';

    this.currentQuoteDemandId = q.demandId;
    this.editingQuoteId = quoteId;

    const nameEl = document.getElementById('h5-quote-prod-name');
    const priceEl = document.getElementById('h5-quote-price');
    if (nameEl) nameEl.innerText = goodsName + ' (修改现有报价)';
    if (priceEl) priceEl.value = q.price;

    UI.openModal('sheet-h5-quote');
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
    
    // 状态筛选 - bidding=竞价中(0/1/2), wait=等待公布(3), ended=已结束(4), my=我参与的
    const statusFilter = this.currentBidFilter || 'all';
    if (statusFilter === 'bidding') {
      filtered = filtered.filter(b => b.status === 0 || b.status === 1 || b.status === 2);
    } else if (statusFilter === 'wait') {
      filtered = filtered.filter(b => b.status === 3);
    } else if (statusFilter === 'ended') {
      filtered = filtered.filter(b => b.status === 4);
    } else if (statusFilter === 'my') {
      filtered = filtered.filter(b => b.userApplied || b.userInspected || b.userOffered || (b.offers || []).some(o => o.merchantName === 'H5买家用户' || o.merchantName === '万通建材采购部' || o.shopName === '万通建材采购部'));
    }

    // 关键词筛选
    if (keyword) {
      filtered = filtered.filter(b => b.title.includes(keyword));
    }
    
    filtered.forEach(b => {
      let tag = '';
      if (b.status === 0 || b.status === 1 || b.status === 2) {
        tag = `<span class="tag tag-success" style="font-size: 10px; padding: 2px 6px; background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">竞价中</span>`;
      } else if (b.status === 3) {
        tag = `<span class="tag tag-warning" style="font-size: 10px; padding: 2px 6px; background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
      } else if (b.status === 4) {
        tag = `<span style="color:#94a3b8; font-size:11px; font-weight:500;">已结束</span>`;
      }

      const rawTitle = b.title.replace(/【[^】]*阶段】/g, '').replace(/【[^】]*】/g, '').trim();
      const parts = rawTitle.split(' - ');
      const mainTitle = parts[0] || rawTitle;
      const subSpec = parts.slice(1).join(' · ').replace(/规格:\s*/g, '').trim();
      const createTimeStr = b.createdAt ? b.createdAt.split(' ')[0] : '2026-07-01';

      html += `
        <div style="background: #fff; padding: 14px 16px; border-radius: 16px; margin-bottom: 12px; display: flex; gap: 12px; cursor: pointer; box-shadow: 0 4px 18px rgba(0,0,0,0.035);" onclick="H5App.showBidDetail('${b.id}')">
          <img src="${b.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 10px; background:#f8fafc;">
          <div style="flex:1; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 3px; display: flex; justify-content: space-between; align-items: flex-start; line-height: 1.3;">
                <span style="display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; color: #0f172a; font-weight:bold;">${mainTitle}</span>
                ${tag}
              </div>
              ${subSpec ? `<div style="font-size: 10px; color: #94a3b8; margin-bottom: 4px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${subSpec}</div>` : ''}
              <div style="font-size: 11px; color: #64748b; display:flex; justify-content:space-between; align-items:center;">
                <span>🏢 ${b.companyName || b.shopName}</span>
                <span style="font-size:10px; color:#94a3b8;">📅 ${createTimeStr}</span>
              </div>
            </div>
            <div style="font-size: 11px; color: #64748b; display:flex; justify-content:space-between; align-items:flex-end; margin-top:4px;">
              <span>起拍底价: ${b.startPrice}</span>
              <span style="font-size:11px; color:#ef4444; font-weight:bold;">最高: <span style="font-size:14px; font-family:monospace;">${b.currentMaxOffer || b.startPrice}</span></span>
            </div>
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

    // 清洗标题中的阶段前缀，展现标准：公告标题 + 货品名称 + 规格
    const cleanedTitle = b.title.replace(/【[^】]*阶段】/g, '').replace(/【[^】]*】/g, '').trim();

    // 5步流程节点 (横向高颜值进度条)
    const steps = ['看货报名', '现场看货', '参加竞价', '等待公布', '中标付款'];
    let stepsHtml = '<div style="display:flex; justify-content:space-between; position:relative; padding:10px 4px; margin-bottom:12px;">';
    stepsHtml += '<div style="position:absolute; top:21px; left:20px; right:20px; height:2px; background:#e2e8f0; z-index:1;"></div>';
    steps.forEach((name, index) => {
      let isActive = index === b.status;
      let isDone = index < b.status;
      let dotBg = '#fff';
      let dotBorder = '#cbd5e1';
      let dotColor = '#94a3b8';
      let textWeight = 'normal';
      let dotContent = index + 1;

      if (isActive) {
        dotBg = 'linear-gradient(135deg, #9a66e4, #7e22ce)';
        dotBorder = '#7e22ce';
        dotColor = '#fff';
        textWeight = 'bold';
        dotContent = '●';
      } else if (isDone) {
        dotBg = '#f0fdf4';
        dotBorder = '#16a34a';
        dotColor = '#16a34a';
        textWeight = 'bold';
        dotContent = '✓';
      }

      stepsHtml += `
        <div style="display:flex; flex-direction:column; align-items:center; gap:6px; z-index:2; position:relative;">
          <div style="width:24px; height:24px; border-radius:50%; background:${dotBg}; border:2px solid ${dotBorder}; display:flex; align-items:center; justify-content:center; font-size:11px; color:${dotColor}; font-weight:bold; box-shadow:0 2px 8px rgba(0,0,0,0.04);">
            ${dotContent}
          </div>
          <span style="font-size:10px; color:${isActive ? '#7e22ce' : (isDone ? '#16a34a' : '#94a3b8')}; font-weight:${textWeight};">${name}</span>
        </div>
      `;
    });
    stepsHtml += '</div>';

    // 状态快捷引导卡片
    let actionCardHTML = '';
    if (b.status === 3) {
      actionCardHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; flex-direction:column; gap:8px;">
          <div style="font-weight:bold; font-size:13px; color:#d97706; display:flex; align-items:center; gap:6px;">⏳ 等待公布结果</div>
          <div style="font-size:12px; color:#64748b; line-height:1.4;">报价已截止，商家正在评审定标中。该阶段无法继续提交价格，请关注公布结果。</div>
        </div>
      `;
    } else if (b.status === 4) {
      actionCardHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; flex-direction:column; gap:8px;">
          <div style="font-weight:bold; font-size:13px; color:#0f172a; display:flex; align-items:center; gap:6px;">🏁 竞拍已结束</div>
          <div style="font-size:12px; color:#64748b; line-height:1.4;">中标买家：<strong style="color:#0f172a;">${b.winner || '买家用户'}</strong> | 最终成交价：<strong style="color:#ef4444; font-family:monospace;">${b.currentMaxOffer}</strong></div>
        </div>
      `;
    } else if (!b.userApplied) {
      actionCardHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; flex-direction:column; gap:12px;">
          <div style="font-weight:bold; font-size:13px; color:#0f172a;">📋 看货报名说明</div>
          <div style="font-size:12px; color:#64748b; line-height:1.4;">本项目需先完成现场看货报名，看货后解锁正式竞拍报价权。</div>
          <button class="btn btn-primary w-full" style="height:40px; border-radius:20px; background:#1677ff; border:none; color:#fff; font-weight:bold; font-size:13px;" onclick="H5App.signUpForBidInspection('${b.id}')">立即看货报名</button>
        </div>
      `;
    } else if (b.status === 1 || (b.userApplied && !b.userInspected)) {
      actionCardHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; flex-direction:column; gap:12px;">
          <div style="font-weight:bold; font-size:13px; color:#0f172a;">🔍 现场看货拍照</div>
          <div style="font-size:11px; color:#64748b;">请前往现场看货拍照，并上传看货现场照片以激活报价。</div>
          <div style="display:flex; gap:10px;">
            <input type="file" id="h5-bid-photo-picker" accept="image/*" style="display:none;" onchange="H5App.handleBidPhotoSelected(this)">
            <button class="btn btn-outline" style="border-radius:20px; font-size:12px; padding:6px 14px;" onclick="document.getElementById('h5-bid-photo-picker').click()">📷 拍照/选择文件</button>
          </div>
          <button class="btn btn-primary w-full" style="height:38px; border-radius:20px; border:none; background:linear-gradient(135deg, #10b981, #059669); color:#fff; font-size:12px; font-weight:bold;" onclick="H5App.completeBidInspection('${b.id}')">完成看货 (解锁报价)</button>
        </div>
      `;
    } else if (b.status === 2) {
      const isReoffer = b.userOffered;
      const startVal = parseFloat(b.startPrice.replace(/[^\d\.]/g, '')) || 0;
      const currentMaxVal = b.currentMaxOffer === '-' ? 0 : parseFloat(b.currentMaxOffer.replace(/[^\d\.]/g, ''));
      const minRecommendPrice = (currentMaxVal > 0 ? currentMaxVal : startVal) + 5000;

      actionCardHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:bold; font-size:13px; color:#0f172a; display:flex; align-items:center; gap:6px;">⚡ ${isReoffer ? '加价竞拍出价' : '首次竞拍报价'}</span>
            <span style="font-size:10px; background:#fff7ed; color:#ea580c; padding:2px 8px; border-radius:10px; font-weight:bold;">竞拍火热中</span>
          </div>

          <div style="display:flex; justify-content:space-between; background:#f8fafc; padding:12px; border-radius:12px;">
            <div>
              <div style="font-size:10px; color:#94a3b8;">起拍底价</div>
              <div style="font-size:13px; font-weight:bold; color:#475569; font-family:monospace; margin-top:2px;">${b.startPrice}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:10px; color:#94a3b8;">当前最高报价</div>
              <div style="font-size:16px; font-weight:800; color:#ef4444; font-family:monospace; margin-top:2px;">${b.currentMaxOffer === '-' ? b.startPrice : b.currentMaxOffer}</div>
            </div>
          </div>

          <div>
            <label style="font-size:11px; font-weight:bold; color:#475569; margin-bottom:6px; display:block;">${isReoffer ? '加价出价金额 (元)' : '首次报价金额 (元)'}</label>
            <div style="display:flex; gap:8px;">
              <input type="number" id="h5-bid-offer-price-input" placeholder="建议不低于 ¥${minRecommendPrice}" value="${minRecommendPrice}" style="flex:1; height:40px; border-radius:20px; border:1px solid #cbd5e1; background:#f8fafc; padding:0 16px; font-size:13px; font-weight:bold; color:#0f172a; outline:none;">
              <button class="btn btn-primary" style="height:40px; border-radius:20px; padding:0 18px; border:none; background:linear-gradient(135deg, #9a66e4, #7e22ce); font-size:12px; font-weight:bold; color:#fff;" onclick="H5App.submitBidOffer('${b.id}')">${isReoffer ? '提交加价' : '提交报价'}</button>
            </div>
          </div>
        </div>
      `;
    }

    let myOffersListHTML = '';
    if (b.userOffered) {
      const myOnlyOffers = (b.offers || []).filter(o => o.merchantName === 'H5买家用户' || o.shopName === '万通建材采购部' || o.merchantName === '万通建材采购部');
      myOffersListHTML = `
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03);">
          <div style="font-weight:bold; font-size:13px; color:#0f172a; margin-bottom:10px; display:flex; align-items:center; justify-content:space-between;">
            <span>📜 我的历史报价记录</span>
            <span style="font-size:10px; color:#94a3b8;">共 ${myOnlyOffers.length} 笔</span>
          </div>
          <div style="display:flex; flex-direction:column; gap:8px; max-height:160px; overflow-y:auto;">
            ${myOnlyOffers.map(o => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:#f8fafc; padding:8px 12px; border-radius:10px; font-size:11px;">
                <div>
                  <div style="font-weight:bold; color:#334155;">我的出价记录</div>
                  <div style="font-size:10px; color:#94a3b8; margin-top:2px;">出价时间: ${o.time || '--'}</div>
                </div>
                <div style="font-weight:bold; font-size:13px; color:#9a66e4; font-family:monospace;">${o.price || o.offerPrice}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    const content = document.getElementById('h5-bid-detail-content');
    if (content) {
      content.innerHTML = `
        <!-- 头部货品全景卡片 -->
        <div style="background:#ffffff; border-radius:16px; padding:16px; box-shadow:0 4px 20px rgba(0,0,0,0.03); display:flex; gap:12px; align-items:center;">
          <img src="${b.image}" style="width:70px; height:70px; border-radius:12px; object-fit:cover; background:#f8fafc;">
          <div style="flex:1;">
            <div style="font-size:13px; font-weight:bold; color:#0f172a; line-height:1.4;">${cleanedTitle}</div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">发布企业: ${b.companyName || b.shopName}</div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px; font-family:monospace;">编号: ${b.id}</div>
          </div>
        </div>

        ${stepsHtml}
        ${actionCardHTML}
        ${myOffersListHTML}
      `;
    }

    UI.openModal('sheet-h5-bid-detail');
  },

  signUpForBidInspection(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    b.userApplied = true;
    b.status = 1;
    UI.toast('看货报名成功！请前往现场看货并上传照片。', 'success');
    this.showBidDetail(id);
    this.renderBids();
    this.renderUserBids();
  },

  completeBidInspection(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    b.userApplied = true;
    b.userInspected = true;
    b.status = 2;
    UI.toast('看货完成！已解锁【报价竞拍】入口。', 'success');
    this.showBidDetail(id);
    this.renderBids();
    this.renderUserBids();
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
    UI.toast('看货照片上传成功！出价通道开启。', 'success');
    this.showBidDetail(id);
    this.renderBids();
  },

  quickAddBidAmount(baseVal, addStep) {
    const inputEl = document.getElementById('h5-bid-price-input');
    if (inputEl) {
      let currentVal = parseFloat(inputEl.value);
      if (isNaN(currentVal) || currentVal < baseVal) {
        currentVal = baseVal;
      }
      const newVal = currentVal + addStep;
      inputEl.value = newVal;
      inputEl.style.transform = 'scale(1.02)';
      setTimeout(() => inputEl.style.transform = 'scale(1)', 150);
      UI.toast('已快捷增加报价，当前设定出价: ¥' + newVal, 'info');
    }
  },

  submitBidOffer(id) {
    this.submitBidPrice(id);
  },

  submitBidPrice(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    
    const inputEl = document.getElementById('h5-bid-offer-price-input') || document.getElementById('h5-bid-price-input');
    if (!inputEl) return;
    
    const offerPriceVal = parseFloat(inputEl.value);
    const startPriceVal = parseFloat(b.startPrice.replace(/[^\d\.]/g, '')) || 0;
    const maxOfferVal = b.currentMaxOffer === '-' ? 0 : (parseFloat(b.currentMaxOffer.replace(/[^\d\.]/g, '')) || 0);
    const minRequired = Math.max(startPriceVal, maxOfferVal);

    if (isNaN(offerPriceVal) || offerPriceVal <= minRequired) {
      UI.toast('加价必须高于当前最高报价', 'error');
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
    b.userOffered = true;
    b.status = 2;

    if (!b.offers) b.offers = [];
    b.offers.unshift({
      id: 'OFR' + Math.floor(1000 + Math.random() * 9000),
      merchantName: 'H5买家用户',
      price: offerPriceStr,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16)
    });

    UI.toast(`提交出价成功！金额 ${offerPriceStr} 已录入系统。`, 'success');
    this.showBidDetail(id);
    this.renderBids();
    this.renderUserBids();
  },

  // === 搜索与商铺 ===
  doSearch() {
    const type = document.getElementById('h5-search-type').value;
    const kw = document.getElementById('h5-search-keyword').value.trim();
    if (type === 'merchant' || type === 'shop') {
      this.switchH5View('view-shops');
      const shopsInput = document.getElementById('h5-shops-search-input');
      if (shopsInput) shopsInput.value = kw;
      this.doShopsSearch();
    } else {
      this.renderHomeProducts(kw);
    }
  },

  doShopsSearch() {
    const input = document.getElementById('h5-shops-search-input');
    const kw = input ? input.value.trim() : '';
    let filteredShops = MockData.shops || [];
    if (kw) {
      filteredShops = filteredShops.filter(s => (s.shopName || s.name || '').includes(kw) || (s.companyName || '').includes(kw));
    }
    const countEl = document.getElementById('h5-shops-count');
    if (countEl) countEl.innerText = `共找到 ${filteredShops.length} 个相关店铺`;
    const grid = document.getElementById('h5-grid-search-shops');
    if (!grid) return;
    let html = '';
    filteredShops.forEach(s => {
      const avatarChar = s.avatar ? '' : (s.shopName || s.name || '店').charAt(0);
      const avatarHtml = s.avatar ? `<img src="${s.avatar}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">` : `<div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 16px;">${avatarChar}</div>`;
      
      let statusTagHtml = `<span style="font-size: 9px; padding: 2px 6px; background: #e0f2fe; color: #0369a1; border-radius: 4px; font-weight: bold; margin-left: 6px;">正在营业</span>`;
      if (s.status === '闭店中' || s.status === '已关停' || s.status === '已禁用') {
        statusTagHtml = `<span style="font-size: 9px; padding: 2px 6px; background: #f1f5f9; color: #64748b; border-radius: 4px; font-weight: bold; margin-left: 6px;">闭店中</span>`;
      } else if (s.status === '审核未通过') {
        statusTagHtml = `<span style="font-size: 9px; padding: 2px 6px; background: #fef2f2; color: #ef4444; border-radius: 4px; font-weight: bold; margin-left: 6px;">审核未通过</span>`;
      }

      html += `
        <div class="card flex gap-3 items-center" onclick="H5App.goToShop('${s.id}', '${s.shopName || s.name}')" style="padding: 12px; border-radius: 16px; border: 1px solid #f1f5f9; background: #fff; cursor: pointer; display: flex; flex-direction: row; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 12px;">
            ${avatarHtml}
            <div>
              <div class="font-bold text-sm text-slate-800" style="display:flex; align-items:center;">
                ${s.shopName || s.name}
                ${statusTagHtml}
              </div>
              <div class="text-[10px] text-slate-400 mt-0.5">${s.companyName || '正品供货商户'}</div>
            </div>
          </div>
          <svg class="icon-svg text-slate-300" style="width:16px; height:16px; stroke: currentColor; fill: none; stroke-width: 2;" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </div>
      `;
    });
    grid.innerHTML = html || `<div style="text-align:center; padding:40px; color:#94a3b8; font-size:12px;">未找到匹配店铺</div>`;
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
            <div class="mt-2 flex items-center justify-end" onclick="event.stopPropagation()">
              <div class="flex items-center gap-1" style="justify-content: flex-end;">
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
    this.switchH5View('view-uc-orders');
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

        // Format Order Type label
        let rawType = o.type || '现货交易订单';
        if (!rawType.includes('交易订单')) {
          if (rawType.includes('现货')) rawType = '现货交易订单';
          else if (rawType.includes('预售')) rawType = '预售交易订单';
          else if (rawType.includes('供求')) rawType = '供求交易订单';
          else if (rawType.includes('竞价')) rawType = '竞价交易订单';
          else rawType = '现货交易订单';
        }

        html += `
          <div onclick="H5App.showH5OrderDetail('${o.id}')" style="background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #f1f5f9; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
            <div class="flex justify-between items-center mb-3 pb-3" style="border-bottom: 1px solid #f8fafc; display:flex; justify-content:space-between; align-items:center;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="font-family: monospace; font-size: 12px; color: #64748b;">${o.id}</span>
                <span class="tag" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-size:10px; padding:1px 6px; border-radius:4px; font-weight:600;">${rawType}</span>
              </div>
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

  showH5OrderDetail(orderId) {
    const o = MockData.orders.find(item => item.id === orderId);
    if (!o) return;

    this.switchH5View('view-uc-order-detail');

    // Fill order detail elements
    document.getElementById('h5-detail-order-id').innerText = o.id;
    
    const typeTag = document.getElementById('h5-detail-type-tag');
    typeTag.innerText = o.type || '现货交易订单';

    // Status mapping
    const statusMap = {
      0: { title: '等待双方签约', desc: '买卖双方正在进行CA数字签名，签署合同协议。' },
      5: { title: '待卖家签约', desc: '买家已签名，等待供应商家签署确认。' },
      4: { title: '等待买方付款', desc: '请及时在钱包或通过线下对公向平台监管账户汇款。' },
      1: { title: '等待卖家发货', desc: '资金托管入账已确认，等待卖家安排专车大宗运输发货。' },
      2: { title: '卖家已发货', desc: '专车已在途运输，请在收到货品后核对质量并确认收货。' },
      3: { title: '交易已完成', desc: '双方均已确认收货，货款已划拨至卖家商户余额。' },
      '-1': { title: '订单已关闭', desc: o.closeReason || '交易异常已关闭。' }
    };
    const s = statusMap[o.status] || { title: '订单处理中', desc: '请耐心等待平台处理...' };
    document.getElementById('h5-detail-status-text').innerText = s.title;
    document.getElementById('h5-detail-status-desc').innerText = s.desc;

    // Goods info
    const imgUrl = 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=120&q=80';
    document.getElementById('h5-detail-goods-img').src = imgUrl;
    document.getElementById('h5-detail-goods-name').innerText = o.productName;
    document.getElementById('h5-detail-goods-price').innerText = o.amount;
    document.getElementById('h5-detail-subtotal').innerText = o.amount;
    // 计算平台佣金 (固定比例 1.5%)
    const amountNum = parseFloat((o.amount || '0').replace(/[^\d.]/g, '')) || 0;
    const commission = amountNum * 0.015;
    const commissionStr = '¥' + commission.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const commissionEl = document.getElementById('h5-detail-commission');
    if (commissionEl) commissionEl.innerText = commissionStr;
    document.getElementById('h5-detail-total').innerText = o.amount;

    // Delivery info
    const logisticsNoEl = document.getElementById('h5-detail-logistics-no');
    if (logisticsNoEl) {
      logisticsNoEl.innerText = (o.status >= 2 || o.status === 3) ? 'SF1480928120' : '--';
    }

    // Contract
    const contractWrapper = document.getElementById('h5-detail-contract-wrapper');
    if (contractWrapper) {
      if (o.status === 0 || o.status === 5) {
        contractWrapper.innerHTML = `
          <div style="padding:10px; text-align:center; color:#94a3b8; font-size:12px; background:#f8fafc; border-radius:8px; border:1px dashed #e2e8f0;">
            ⏳ 电子签约尚未完成，暂无可预览合同。
          </div>
        `;
      } else {
        const contractNo = o.contractNo || ('HT-' + o.id);
        const contractImages = (o.contractImages || [
          { label: '1. 买家签署联主合同', name: '《大宗物资买卖交易合同》- 买家签署联', type: 'contract' },
          { label: '2. 卖家签署联主合同', name: '《大宗物资买卖交易合同》- 卖家签署联', type: 'contract' },
          { label: '3. 质量及交割约定', name: '《大宗商品质量检验及交割条款》', type: 'contract' },
          { label: '4. CA签章认证凭证', name: '《CA数字证书存证证明》', type: 'contract' }
        ]).slice(0, 10);
        contractWrapper.innerHTML = `
          <div style="font-size:11px; color:#64748b; margin-bottom:6px; font-weight:bold;">📄 电子合同附件清单 (${contractImages.length}/10 份)：</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${contractImages.map((img, i) => `
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:bold; font-size:11px; color:#1e293b; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:70%;">${img.label}</span>
                <button class="btn btn-outline btn-xs" id="h5-detail-preview-contract-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:10px;">[预览]</button>
              </div>
            `).join('')}
          </div>
        `;
        contractImages.forEach((img, i) => {
          const btn = document.getElementById(`h5-detail-preview-contract-btn-${i}`);
          if (btn) btn.onclick = () => UI.previewDocument(img.name, img.type, contractNo, o.amount, o.buyerName, o.shopName);
        });
      }
    }

    // Payment Voucher Section (最多5张)
    const voucherSection = document.getElementById('h5-detail-payment-voucher-section');
    if (o.status === 0 || o.status === 5 || o.status === 4) {
      voucherSection.style.display = 'none';
    } else {
      voucherSection.style.display = 'block';
      const voucherNo = o.paymentVoucher || ('TXN-PAY-' + o.id);
      const voucherImages = (o.voucherImages || [
        { label: '1. 银行对公转账回单', name: '《银行对公转账电子回单》', type: 'voucher' },
        { label: '2. 平台托管资金入账单', name: '《平台托管账户划转确认函》', type: 'voucher' },
        { label: '3. 财务结算清算凭据', name: '《交易货款清算凭单》', type: 'voucher' }
      ]).slice(0, 5);

      voucherSection.innerHTML = `
        <div style="font-size:11px; color:#166534; margin-bottom:6px; font-weight:bold;">💳 支付凭证附件清单 (${voucherImages.length}/5 份)：</div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${voucherImages.map((vImg, i) => `
            <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:8px 10px; display:flex; justify-content:space-between; align-items:center;">
              <span style="font-weight:bold; font-size:11px; color:#166534;">${vImg.label}</span>
              <button class="btn btn-outline btn-xs" id="h5-detail-preview-voucher-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:10px; color:#166534; border-color:#bbf7d0; background:#fff;">[预览]</button>
            </div>
          `).join('')}
        </div>
      `;
      voucherImages.forEach((vImg, i) => {
        const btn = document.getElementById(`h5-detail-preview-voucher-btn-${i}`);
        if (btn) btn.onclick = () => UI.previewDocument(vImg.name, vImg.type, voucherNo, o.amount, o.buyerName, o.shopName);
      });
    }

    // Timeline nodes (Vertical)
    const timeline = document.getElementById('h5-detail-timeline');
    if (timeline) {
      let currentStep = 0;
    if (o.status === 0 || o.status === 5) currentStep = 1; // 签约中
    else if (o.status === 4) currentStep = 2; // 待付款
    else if (o.status === 1) currentStep = 3; // 待发货
    else if (o.status === 2) currentStep = 4; // 待签收
    else if (o.status === 3) currentStep = 5; // 已完成

    const steps = [
      { name: '提交订单', time: o.time },
      { name: '双边 CA 电子签约完成', time: (o.status >= 4 || o.status === 1 || o.status === 2 || o.status === 3) ? '2026-07-07 11:20:00' : '' },
      { name: '货款资金平台托管入账', time: (o.status === 1 || o.status === 2 || o.status === 3) ? '2026-07-07 14:00:00' : '' },
      { name: '卖家安排专车发货配送', time: (o.status === 2 || o.status === 3) ? '2026-07-08 09:30:00' : '' },
      { name: '买方现场核验签字确认收货', time: (o.status === 3) ? '2026-07-09 08:30:00' : '' },
      { name: '财务清算划拨，订单履约完结', time: (o.status === 3) ? '2026-07-09 10:00:00' : '' }
    ];

    timeline.innerHTML = steps.map((st, index) => {
      const active = o.status !== -1 && index <= currentStep;
      const dotColor = active ? 'var(--primary-color)' : '#cbd5e1';
      return `
        <div style="position:relative; display:flex; flex-direction:column; gap:2px; text-align: left;">
          <!-- Node Dot -->
          <div style="position:absolute; left:-19px; top:4px; width:10px; height:10px; border-radius:50%; background:${dotColor}; border:2px solid #fff; box-shadow:0 0 0 2px ${active ? 'rgba(126,34,206,0.2)' : 'transparent'};"></div>
          <div style="font-weight:bold; font-size:13px; color:${active ? '#1e293b' : '#94a3b8'};">${st.name}</div>
          <div style="font-size:11px; color:#94a3b8;">${formatTimeSec(st.time)}</div>
        </div>
      `;
    }).join('');
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
        <div class="text-xs text-secondary mb-2">预算: ¥4,200/吨 | 2026-07-07 09:00:00</div>
        <div class="text-xs text-primary font-bold">已收到 3 份报价单</div>
      </div>
      <div class="card p-3 mb-4 bg-white" style="border:1px solid #f1f5f9; border-radius:8px;">
        <div class="flex justify-between items-center mb-2" style="display:flex; justify-content:space-between;">
          <strong class="text-slate-800 text-sm">REQ004 采购 500吨 P.O 42.5 水泥</strong>
          <span class="tag tag-success" style="font-size:10px;">寻源中</span>
        </div>
        <div class="text-xs text-secondary mb-2">预算: ¥300/吨 | 2026-07-09 08:00:00</div>
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

  currentUCBidStatusFilter: '',
  currentUCInvoiceTab: 'apply',

  setUCBidFilter(status, btnEl) {
    this.currentUCBidStatusFilter = status;
    if (btnEl) {
      document.querySelectorAll('.h5-uc-bid-tab').forEach(b => {
        b.style.background = '#fff';
        b.style.color = '#64748b';
        b.style.border = '1px solid #cbd5e1';
      });
      btnEl.style.background = 'linear-gradient(135deg, #9a66e4, #7e22ce)';
      btnEl.style.color = '#fff';
      btnEl.style.border = 'none';
    }
    this.renderUserBids();
  },

  renderUserBids() {
    const list = document.getElementById('h5-uc-bids-list');
    if (!list) return;
    let html = '';

    const allMyBids = (MockData.biddingAnnouncements || []).filter(b => {
      return b.userApplied || b.userInspected || b.userOffered || (b.offers || []).some(o => o.merchantName === 'H5买家用户' || o.shopName === '万通建材采购部' || o.merchantName === '万通建材采购部');
    });

    // 计算各状态数量
    const countAll = allMyBids.length;
    const countIng = allMyBids.filter(b => b.status === 0 || b.status === 1 || b.status === 2).length;
    const countWait = allMyBids.filter(b => b.status === 3).length;
    const countEnd = allMyBids.filter(b => b.status === 4).length;

    const elAll = document.getElementById('h5-bid-count-all');
    const elIng = document.getElementById('h5-bid-count-ing');
    const elWait = document.getElementById('h5-bid-count-wait');
    const elEnd = document.getElementById('h5-bid-count-end');
    if (elAll) elAll.innerText = `(${countAll})`;
    if (elIng) elIng.innerText = `(${countIng})`;
    if (elWait) elWait.innerText = `(${countWait})`;
    if (elEnd) elEnd.innerText = `(${countEnd})`;

    let bids = [...allMyBids];
    if (this.currentUCBidStatusFilter !== '') {
      const targetSt = parseInt(this.currentUCBidStatusFilter);
      bids = bids.filter(b => {
        if (targetSt === 1) return b.status === 0 || b.status === 1 || b.status === 2;
        return b.status === targetSt;
      });
    }

    if (bids.length === 0) {
      list.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#94a3b8;">
          <div style="font-size:36px; margin-bottom:8px;">⚖️</div>
          <div style="font-size:13px; font-weight:bold; color:#64748b;">暂无对应出价与竞拍记录</div>
          <div style="font-size:11px; margin-top:4px;">可以前往【竞价大厅】参与最新的物资公开竞拍交易</div>
          <button class="btn btn-primary" style="margin-top:16px; border-radius:18px; padding:6px 20px; font-size:12px; background:linear-gradient(135deg, #9a66e4, #7e22ce); border:none;" onclick="H5App.switchH5View('view-bid')">前往竞价大厅</button>
        </div>
      `;
      return;
    }

    bids.forEach(b => {
      let myOffers = (b.offers || []).filter(o => o.merchantName === 'H5买家用户' || o.shopName === '万通建材采购部' || o.merchantName === '万通建材采购部');
      let myMaxOfferStr = myOffers.length > 0 ? myOffers[myOffers.length - 1].price : '暂无报价';

      // 提取标题与规格信息：重点突出标题和货品，规格弱化不带“规格:”前缀
      const rawTitle = b.title.replace(/【[^】]*阶段】/g, '').replace(/【[^】]*】/g, '').trim();
      const parts = rawTitle.split(' - ');
      const mainTitle = parts[0] || rawTitle;
      const subSpec = parts.slice(1).join(' · ').replace(/规格:\s*/g, '').trim();
      const createTimeStr = b.createdAt ? b.createdAt.split(' ')[0] : '2026-07-01';

      let tag = '';
      if (b.status === 0 || b.status === 1 || b.status === 2) {
        tag = `<span style="font-size: 11px; padding: 2px 8px; background: #e6f4ff; color: #0958d9; border-radius: 12px; font-weight: 600;">竞价中</span>`;
      } else if (b.status === 3) {
        tag = `<span style="font-size: 11px; padding: 2px 8px; background: #fff0f6; color: #c41d7f; border-radius: 12px; font-weight: 600;">等待公布</span>`;
      } else if (b.status === 4) {
        tag = (b.winner === 'H5买家用户' || b.winner === '万通建材采购部')
          ? `<span style="font-size: 11px; padding: 2px 8px; background: #f6ffed; color: #389e0d; font-weight: bold; border-radius: 12px;">🏆 中标</span>`
          : `<span style="font-size: 11px; padding: 2px 8px; background: #f5f5f5; color: #8c8c8c; border-radius: 12px;">已结束</span>`;
      }

      let btnText = '看货报名';
      let btnBg = '#1677ff';
      if (!b.userApplied) {
        btnText = '看货报名';
        btnBg = '#1677ff';
      } else if (!b.userInspected) {
        btnText = '查看详情';
        btnBg = '#64748b';
      } else if (!b.userOffered) {
        btnText = '报价竞拍';
        btnBg = 'linear-gradient(135deg, #10b981, #059669)';
      } else if (b.status === 0 || b.status === 1 || b.status === 2) {
        btnText = '加价竞拍';
        btnBg = 'linear-gradient(135deg, #9a66e4, #7e22ce)';
      } else {
        btnText = '查看详情';
        btnBg = '#64748b';
      }

      html += `
        <div style="background: #ffffff; border-radius: 16px; padding: 14px 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.035); display: flex; flex-direction: column; gap: 8px; cursor: pointer;" onclick="H5App.showBidDetail('${b.id}')">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 8px;">
            <div style="font-size: 13px; font-weight: 800; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;">${mainTitle}</div>
            ${tag}
          </div>
          ${subSpec ? `<div style="font-size: 10px; color: #94a3b8; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${subSpec}</div>` : ''}

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #64748b;">
            <span>🏢 ${b.companyName || b.shopName}</span>
            <span style="font-size: 10px; color: #94a3b8;">📅 创建时间: ${createTimeStr}</span>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: flex-end; background: #f8fafc; padding: 10px 12px; border-radius: 12px;">
            <div>
              <div style="font-size: 10px; color: #94a3b8;">我的最新报价</div>
              <div style="font-size: 15px; font-weight: 800; color: #9a66e4; font-family: monospace; margin-top: 2px;">${myMaxOfferStr}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #94a3b8;">当前最高出价</div>
              <div style="font-size: 14px; font-weight: 700; color: #ef4444; font-family: monospace; margin-top: 2px;">${b.currentMaxOffer || b.startPrice}</div>
            </div>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; margin-top:2px;">
            <span>截止: ${b.bidEndTime}</span>
            <button class="btn btn-primary btn-sm" style="border-radius: 14px; font-size: 11px; padding: 4px 14px; background: ${btnBg}; border: none; font-weight: bold; color: #fff;" onclick="event.stopPropagation(); H5App.showBidDetail('${b.id}')">
              ${btnText}
            </button>
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  },

  switchUCInvoiceTab(tabName, btnEl) {
    this.currentUCInvoiceTab = tabName;
    if (btnEl) {
      document.querySelectorAll('.h5-uc-inv-tab').forEach(b => {
        b.style.color = '#64748b';
        b.style.borderBottom = '2px solid transparent';
        b.style.fontWeight = '600';
      });
      btnEl.style.color = '#9a66e4';
      btnEl.style.borderBottom = '2px solid #9a66e4';
      btnEl.style.fontWeight = 'bold';
    }
    this.renderUserInvoices();
  },

  renderUserInvoices() {
    const list = document.getElementById('h5-uc-invoices-list');
    if (!list) return;
    let html = '';

    const invoices = window.MockData.invoices || [];

    if (invoices.length === 0) {
      list.innerHTML = `<div style="text-align:center; padding: 40px 0; color: #94a3b8; font-size: 14px;">暂无发票记录</div>`;
      return;
    }

    invoices.forEach(inv => {
      const isIssued = inv.status === '已开具' || inv.status === '已送达' || inv.status === '已完成';
      const statusText = isIssued ? '已开具' : '待开具';
      let tag = isIssued
        ? `<span style="background:#f6ffed; color:#389e0d; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;">${statusText}</span>`
        : `<span style="background:#fff7e6; color:#d46b08; padding:2px 8px; border-radius:10px; font-size:10px; font-weight:bold;">${statusText}</span>`;

      const timeStr = inv.createTime || inv.applyTime || '—';
      const orderRef = inv.orderId ? ` (${inv.orderId})` : '';

      html += `
        <div style="background: #ffffff; border-radius: 16px; padding: 14px 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.035); display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; font-weight: 700; color: #0f172a;">${inv.type}</span>
            ${tag}
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 8px 12px; border-radius: 10px;">
            <div>
              <div style="font-size: 10px; color: #94a3b8;">发票编号${orderRef ? '/关联订单' : ''}</div>
              <div style="font-size: 11px; font-weight: 700; color: #334155; font-family: monospace;">${inv.id}${orderRef}</div>
            </div>
            <div style="text-align: right;">
              <div style="font-size: 10px; color: #94a3b8;">发票金额</div>
              <div style="font-size: 14px; font-weight: 800; color: #ef4444; font-family: monospace;">${inv.amount}</div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #94a3b8; margin-top: 2px;">
            <span>申请/开具时间: ${timeStr}</span>
            ${isIssued ? `<button class="btn btn-primary btn-sm" style="border-radius: 14px; font-size: 11px; padding: 4px 12px; background: linear-gradient(135deg, #9a66e4, #7e22ce); border: none; color: #fff; font-weight: bold;" onclick="UI.toast('已拉取增值税电子发票PDF/图文可随时打印', 'info')">查看电子发票</button>` : `<span style="font-size:11px; color:#d46b08; font-weight:bold;">商家开具中...</span>`}
          </div>
        </div>
      `;
    });

    list.innerHTML = html;
  },

  openApplyInvoiceModal(orderId, amountStr) {
    document.getElementById('h5-inv-order-id').innerText = orderId;
    document.getElementById('h5-inv-amount').innerText = amountStr || '¥ 0.00';
    UI.openModal('sheet-h5-apply-invoice');
  },

  submitApplyInvoice() {
    const orderId = document.getElementById('h5-inv-order-id').innerText;
    const amountStr = document.getElementById('h5-inv-amount').innerText;
    const invType = document.getElementById('h5-inv-type').value;
    const title = document.getElementById('h5-inv-title').value.trim();
    const taxNo = document.getElementById('h5-inv-taxno').value.trim();
    const email = document.getElementById('h5-inv-email').value.trim();

    if (!title || !taxNo || !email) {
      UI.toast('请完整填写发票抬头、税号及受票邮箱', 'warning');
      return;
    }

    const newInv = {
      id: 'INV' + Date.now().toString().slice(-8),
      orderId: orderId,
      type: invType,
      amount: amountStr,
      title: title,
      taxNo: taxNo,
      email: email,
      status: '待开具',
      applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    if (!window.MockData.invoices) window.MockData.invoices = [];
    window.MockData.invoices.unshift(newInv);

    UI.closeModal('sheet-h5-apply-invoice');
    UI.toast('发票申请已成功提交，等待卖家上传并开具！', 'success');
    this.renderUserInvoices();
  }
};

window.H5App = H5App;

document.addEventListener('DOMContentLoaded', () => {
  H5App.init();
});
