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
        if (targetId === 'view-shop' || targetId === 'view-shops' || targetId.startsWith('view-uc-')) {
          if (mainHeader) mainHeader.style.display = 'none';
        } else {
          if (mainHeader) mainHeader.style.display = 'flex';
          
          const headerTitle = document.getElementById('h5-header-title');
          const backBtn = document.getElementById('h5-header-back-btn');
          
          // Set Title
          if (headerTitle) {
            if (targetId === 'view-home') headerTitle.innerText = '享宇森云商城';
            if (targetId === 'view-demand') headerTitle.innerText = '找货源 (寻源大厅)';
            if (targetId === 'view-bid') headerTitle.innerText = '大宗竞价大厅';
            if (targetId === 'view-cart') headerTitle.innerText = '购物车';
            if (targetId === 'view-my') headerTitle.innerText = '我的中心';
          }
          
          if (backBtn) {
            if (targetId === 'view-home' || targetId === 'view-demand' || targetId === 'view-bid' || targetId === 'view-cart' || targetId === 'view-my') {
              backBtn.style.display = 'none';
            } else {
              backBtn.style.display = 'flex';
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

  renderQuickCategories() {
    const container = document.getElementById('h5-quick-categories');
    if (!container) return;
    let html = '';
    
    // 我们从 MockData.productCategories 取顶层分类
    const categories = MockData.productCategories || [];
    const topLevels = categories.slice(0, 10); // 取前10个作为快捷标签
    
    // 生成横向滑动的胶囊按钮
    container.style.display = 'flex';
    container.style.overflowX = 'auto';
    container.style.whiteSpace = 'nowrap';
    container.style.padding = '8px 16px';
    container.style.gap = '8px';
    container.style.background = 'transparent';
    
    html += `<button class="btn btn-outline" style="border-radius: 16px; padding: 4px 12px; font-size: 13px;" onclick="H5App.setCategoryFilter('')">全部</button>`;
    
    topLevels.forEach(cat => {
      html += `
        <button class="btn btn-outline" style="border-radius: 16px; padding: 4px 12px; font-size: 13px;" onclick="H5App.setCategoryFilter('${cat.name}')">
          ${cat.name}
        </button>
      `;
    });
    
    container.innerHTML = html;
  },

  renderHomeBids() {
    const container = document.getElementById('h5-home-bids-container');
    if (!container) return;
    
    let html = '';
    const bids = (MockData.biddingAnnouncements || []).slice(0, 3);
    
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
    let html = '';
    let filtered = MockData.demands.filter(d => d.status === 1);
    if (keyword) {
      filtered = filtered.filter(d => d.title.includes(keyword) || d.buyerName.includes(keyword));
    }
    
    filtered.forEach(d => {
      html += `
        <div style="background: #fff; padding: 16px; border-radius: 8px; margin-bottom: 12px;">
          <div style="font-weight: bold; margin-bottom: 8px;">${d.title}</div>
          <div style="color: var(--danger-color); font-weight: bold; margin-bottom: 8px;">${d.expectedPrice}</div>
          <div class="flex justify-between text-secondary items-center" style="font-size: 12px; border-bottom: 1px solid #f2f3f5; padding-bottom: 12px; margin-bottom: 12px;">
            <span>${d.buyerName}</span>
            <span>${d.publishTime} 发布</span>
          </div>
          <div class="flex gap-2 mt-2">
            <button class="btn btn-outline flex-1" style="height: 36px; border-radius: 18px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => { UI.openModal('sheet-h5-chat'); document.getElementById('h5-chat-prod-title').innerText='${d.title}'; document.getElementById('h5-chat-prod-price').innerText='${d.expectedPrice}'; document.getElementById('h5-chat-prod-img').src='https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'; })">💬 沟通</button>
            <button class="btn btn-primary flex-1" style="height: 36px; border-radius: 18px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => H5App.openQuoteModal('${d.title}', '${d.expectedPrice}'))">立即报价</button>
          </div>
        </div>
      `;
    });
    if(list) list.innerHTML = html;
  },

  doDemandSearch() {
    const kw = document.getElementById('h5-demand-search-keyword').value.trim();
    this.renderDemands(kw);
  },

  openQuoteModal(name, expectedPrice) {
    const titleEl = document.getElementById('h5-quote-prod-name');
    const expectedEl = document.getElementById('h5-quote-prod-expected');
    if (titleEl) titleEl.innerText = name;
    if (expectedEl) expectedEl.innerText = '期望价格: ' + expectedPrice;

    // Reset inputs
    document.getElementById('h5-quote-price').value = '';
    document.getElementById('h5-quote-qty').value = '';
    document.getElementById('h5-quote-notes').value = '';

    UI.openModal('sheet-h5-quote');
  },

  sendQuickMessage(type) {
    const chatBox = document.getElementById('h5-chat-messages');
    if (!chatBox) return;

    let contentHtml = '';
    let toastMsg = '';

    if (type === 'inquiry') {
      contentHtml = '您好，我想咨询该商品的最新批发价格及供货周期，请回复。';
      toastMsg = '询价卡片发送成功';
    } else if (type === 'quote') {
      const price = prompt('请输入您的报价单价（如：4150元/吨）：');
      if (!price) return;
      const qty = prompt('请输入可供货数量（如：50吨）：');
      if (!qty) return;
      contentHtml = `
        <div style="padding: 4px 0; font-size: 13px;">
          <strong style="color: #26a25b; display: block; margin-bottom: 4px;">💰 【货源报价单】</strong>
          <div>报价单价：<span style="font-weight: bold; color: #26a25b;">${price}</span></div>
          <div>可供数量：<span>${qty}</span></div>
        </div>
      `;
      toastMsg = '报价卡片发送成功';
    } else if (type === 'bargain') {
      const price = prompt('请输入您的意向砍价单价（如：3900元/吨）：');
      if (!price) return;
      contentHtml = `
        <div style="padding: 4px 0; font-size: 13px;">
          <strong style="color: #d55300; display: block; margin-bottom: 4px;">🤝 【意向砍价卡】</strong>
          <div>砍价目标：<span style="font-weight: bold; color: #d55300;">${price}</span></div>
          <div style="font-size: 11px; margin-top: 4px; opacity: 0.9;">期待与您促成交易，是否接受？</div>
        </div>
      `;
      toastMsg = '砍价卡片发送成功';
    }

    // Append user message
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-2.5 justify-end';
    msgDiv.innerHTML = `
      <div class="p-2.5 rounded shadow-sm text-sm" style="max-width: 75%; border-radius: 14px 0 14px 14px; background: ${type === 'quote' ? '#edfbf3' : type === 'bargain' ? '#fff8f0' : 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)'}; color: ${type === 'quote' ? '#26a25b' : type === 'bargain' ? '#d55300' : '#ffffff'}; border: 1px solid ${type === 'quote' ? '#d1f4df' : type === 'bargain' ? '#ffe3c2' : 'transparent'};">
        ${contentHtml}
      </div>
      <div class="w-7 h-7 rounded-full bg-secondary text-white flex items-center justify-center text-[10px] flex-shrink-0">我</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    UI.toast(toastMsg + '，已同步至消息中心', 'success');
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
    let filtered = MockData.biddingAnnouncements || [];
    
    // 状态筛选
    const statusFilter = this.currentBidFilter || 'all';
    if (statusFilter === 'active') {
      filtered = filtered.filter(b => b.status === 1);
    } else if (statusFilter === 'ended') {
      filtered = filtered.filter(b => b.status !== 1);
    }

    // 关键词筛选
    if (keyword) {
      filtered = filtered.filter(b => b.title.includes(keyword));
    }
    
    filtered.forEach(b => {
      let tag = b.status === 1 ? '<span class="tag tag-success" style="font-size: 10px; padding: 2px 4px;">竞价中</span>' : '<span class="tag tag-secondary" style="font-size: 10px; padding: 2px 4px;">已结束</span>';
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

  showBidDetail(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;

    // Generate steps
    let currentStep = 1;
    if (b.status === 1) currentStep = 4;
    if (b.status === 3) currentStep = 6;

    const steps = ['看货报名', '现场看货', '竞价报名', '参加竞价', '竞价成功', '线下付款'];
    let stepsHtml = '<div style="position: relative; padding-left: 28px; margin-top: 16px;">';
    // Vertical timeline dashed line
    stepsHtml += '<div style="position: absolute; left: 9px; top: 12px; bottom: 12px; width: 0; border-left: 2px dashed var(--border-color);"></div>';
    steps.forEach((name, index) => {
      let isActive = index + 1 === currentStep;
      let isDone = index + 1 < currentStep;
      
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

    const contentEl = document.getElementById('h5-bid-detail-content');
    const footerEl = document.getElementById('h5-bid-detail-footer');

    if (contentEl) {
      contentEl.innerHTML = `
        <div class="flex flex-col gap-4">
          <div style="position: relative; overflow: hidden; border-radius: var(--radius-md); box-shadow: var(--shadow-sm);">
            <img src="${b.image}" style="width: 100%; height: 160px; object-fit: cover; display: block;">
            <span class="tag ${b.status === 1 ? 'tag-primary' : 'tag-secondary'}" style="position: absolute; top: 12px; right: 12px; font-size: 10px; padding: 4px 8px; border-radius: 12px; backdrop-filter: blur(4px);">
              ${b.status === 1 ? '竞价中' : '已结束'}
            </span>
          </div>
          <div>
            <h2 class="text-base font-bold text-main mb-1" style="line-height: 1.4;">${b.title}</h2>
            <div class="text-xs text-secondary flex items-center gap-1.5 mb-3">
              <span>🏢 处置方: ${b.shopName}</span>
              <span style="color: #ddd;">|</span>
              <span class="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">No.${b.id}</span>
            </div>
            
            <div class="p-4 bg-gray-50 rounded-2xl flex flex-col gap-2.5" style="border: 1px solid var(--border-light);">
              <div class="flex justify-between items-center text-xs text-regular">
                <span>💰 起拍底价</span>
                <span class="text-main font-bold">${b.startPrice}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-regular">
                <span>🔥 当前最高出价</span>
                <span class="text-danger font-bold text-base">${b.currentMaxOffer || b.startPrice}</span>
              </div>
              <div class="flex justify-between items-center text-xs text-regular">
                <span>⏰ 截止竞价时间</span>
                <span class="text-main">${b.bidEndTime}</span>
              </div>
            </div>
          </div>
          <div class="mt-2 border-t pt-4">
            <h3 class="font-bold text-sm text-main">🚀 竞价项目节点流转</h3>
            ${stepsHtml}
          </div>
        </div>
      `;
    }

    if (footerEl) {
      footerEl.innerHTML = `
        <button class="btn btn-outline flex-1 py-3" style="border-radius: 24px;" onclick="UI.closeModal('sheet-h5-bid-detail')">关闭</button>
        <button class="btn btn-primary flex-2 py-3" style="border-radius: 24px; background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);" ${b.status !== 1 ? 'disabled' : ''} onclick="event.stopPropagation(); UI.toast('参与出价成功，等待系统确认！', 'success'); UI.closeModal('sheet-h5-bid-detail');">
          ${b.status === 1 ? '立即出价参与' : '竞价已结束'}
        </button>
      `;
    }

    UI.openModal('sheet-h5-bid-detail');
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

    let html = '';
    let totalAmount = 0;
    let selectedCount = 0;
    let invalidCount = 0;

    MockData.cart.forEach(item => {
      if (item.status === 0) {
        invalidCount++;
        html += `
          <div style="background: #fafafa; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; color: #999;">
            <span class="tag tag-secondary text-xs">失效</span>
            <div style="flex:1;">
              <div style="font-size: 13px; margin-bottom: 4px;">${item.name}</div>
              <div class="text-xs">店内: ${item.shopName}</div>
            </div>
            <button class="btn btn-text btn-sm text-danger" onclick="H5App.removeCartItem(${item.id})">删除</button>
          </div>
        `;
      } else {
        if (item.checked) {
          totalAmount += item.price * item.quantity;
          selectedCount += item.quantity;
        }
        
        html += `
          <div style="background: #fff; padding: 12px; border-radius: 8px; margin-bottom: 12px; display: flex; align-items: center; gap: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="H5App.toggleCartItem(${item.id}, this.checked)">
            <div style="flex:1;">
              <div style="font-weight: bold; font-size: 13px; margin-bottom: 4px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.name}</div>
              <div class="text-xs text-secondary mb-2" onclick="H5App.goToShop(${item.shopId}, '${item.shopName}')">店铺: ${item.shopName} ></div>
              <div class="flex justify-between items-center">
                <span style="color: var(--danger-color); font-weight: bold;">¥${item.price}</span>
                <div class="flex gap-2 items-center">
                  <button class="btn btn-sm" style="padding: 0 8px;" onclick="H5App.updateCartQty(${item.id}, -1)">-</button>
                  <input type="number" class="form-control" style="width:40px; height: 24px; text-align:center; padding:0; font-size:12px;" value="${item.quantity}" onchange="H5App.setCartQty(${item.id}, this.value)">
                  <button class="btn btn-sm" style="padding: 0 8px;" onclick="H5App.updateCartQty(${item.id}, 1)">+</button>
                </div>
              </div>
            </div>
            <button class="btn btn-text text-danger px-1" onclick="H5App.removeCartItem(${item.id})">删</button>
          </div>
        `;
      }
    });
    container.innerHTML = html;

    if (footer) {
      footer.style.display = 'flex';
      const allActive = MockData.cart.filter(c => c.status === 1);
      const allChecked = allActive.length > 0 && allActive.every(c => c.checked);
      
      footer.innerHTML = `
        <div class="flex items-center gap-2 flex-1">
          <label class="flex items-center gap-1 text-sm"><input type="checkbox" ${allChecked ? 'checked' : ''} onchange="H5App.toggleAllCart(this.checked)"> 全选</label>
        </div>
        <div class="flex items-center gap-3">
          <div class="text-right">
            <div class="text-sm">合计: <span class="text-danger font-bold text-lg">¥${totalAmount}</span></div>
            ${invalidCount > 0 ? `<div class="text-xs text-secondary">${invalidCount}件失效</div>` : ''}
          </div>
          <button class="btn btn-primary" style="height: 40px; padding: 0 24px; border-radius: 20px;" ${selectedCount === 0 ? 'disabled' : ''} onclick="UI.toast('去结算功能开发中', 'info')">结算(${selectedCount})</button>
        </div>
      `;
    }

    // Update bottom tab badge
    const badge = document.querySelector('.h5-tab-item[data-target="view-cart"] .h5-tab-badge');
    if (badge) {
      const totalQty = MockData.cart.filter(c => c.status === 1).reduce((sum, item) => sum + item.quantity, 0);
      if (totalQty > 0) {
        badge.innerText = totalQty;
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }
  },

  toggleCartItem(id, checked) {
    const item = MockData.cart.find(c => c.id === id);
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
    const item = MockData.cart.find(c => c.id === id);
    if (item) {
      const newQty = item.quantity + delta;
      if (newQty > 0) {
        item.quantity = newQty;
        this.renderCart();
      }
    }
  },

  setCartQty(id, value) {
    const item = MockData.cart.find(c => c.id === id);
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
      MockData.cart = MockData.cart.filter(c => c.id !== id);
      this.renderCart();
      UI.toast('已移除', 'success');
    }
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
          btn = `<button class="btn btn-primary btn-sm" style="border-radius:16px;" onclick="event.stopPropagation(); UI.toast('支付成功！', 'success'); o.status = 0; H5App.renderUserOrders();">立即付款</button>`;
        } else if (o.status === 0) {
          statusTag = `<span class="tag tag-warning">待买家签约</span>`;
          btn = `<button class="btn btn-warning btn-sm" style="border-radius:16px;" onclick="H5App.openUserContractModal('${o.id}')">立即签约</button>`;
        } else if (o.status === 5) {
          statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待卖家签约</span>`;
        } else if (o.status === 1) {
          statusTag = `<span class="tag tag-primary">待发货</span>`;
        } else if (o.status === 2) {
          statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">已发货</span>`;
        } else if (o.status === 3) {
          statusTag = `<span class="tag tag-success">已完结</span>`;
        } else {
          statusTag = `<span class="tag tag-danger">已关闭</span>`;
        }

        html += `
          <div style="background: #fff; padding: 16px; border-radius: 12px; margin-bottom: 12px; border: 1px solid #eee;">
            <div class="flex justify-between items-center mb-3 pb-3" style="border-bottom: 1px solid #f2f3f5; display:flex; justify-content:space-between;">
              <div class="text-xs text-slate-500">单号: ${o.id}</div>
              ${statusTag}
            </div>
            <div class="font-bold text-sm mb-1">${o.productName}</div>
            <div class="text-xs text-slate-400 mb-2">店铺: ${o.shopName}</div>
            <div class="flex justify-between items-center mt-3" style="display:flex; justify-content:space-between; align-items:center;">
              <div class="text-danger font-bold text-base">${o.amount}</div>
              ${btn}
            </div>
          </div>
        `;
      });
    }
    list.innerHTML = html;
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
  }
};

window.H5App = H5App;

document.addEventListener('DOMContentLoaded', () => {
  H5App.init();
});
