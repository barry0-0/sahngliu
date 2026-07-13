/**
 * 商城 PC 端业务逻辑
 */

const MallApp = {
  currentBuyerName: '万通建材采购部', // 当前模拟登录买家

  init() {
    this.initNavTabs();
    this.initUCTabs();

    this.renderCategories();
    this.renderProducts();
    this.renderDemands();
    this.renderBids();
    this.renderHomeExtras();

    // User Center Renders
    this.renderUCOrders();
    this.renderUCInvoices();
    this.renderUCDemandsPub();
    this.renderUCMessages();

    this.renderCart();
  },

  // === 渲染分类 ===
  renderCategories() {
    const menu = document.getElementById('home-category-menu');
    if (menu && MockData.productCategories && MockData.decorationConfig) {
      let html = '<div style="padding: 14px 20px 8px; font-weight: bold; color: var(--text-main); font-size: 15px; border-bottom: 1px solid var(--border-light); margin-bottom: 8px;">📦 全部品类</div>';

      const displayIds = MockData.decorationConfig.displayCategories.slice(0, 5);
      const displayCats = MockData.productCategories.filter(c => displayIds.includes(c.id));

      displayCats.forEach(c => {
        html += `<div class="home-cat-item" onclick="MallApp.goToSpotMarket('${c.id}')">
                   <svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> 
                   ${c.name}
                 </div>`;
      });
      menu.innerHTML = html;
    }
  },

  goToSpotMarket(catId) {
    document.querySelector('.mall-nav-item[data-target="mall-spot"]').click();
    UI.toast('已跳转现货市场并筛选该类目', 'info');
  },

  // === 搜索与店铺 ===
  doSearch() {
    const type = document.getElementById('search-type').value;
    const kw = document.getElementById('search-keyword').value.trim();
    if (!kw) {
      UI.toast('请输入搜索关键词', 'warning');
      return;
    }
    if (type === 'merchant') {
      this.goToShop(10001, kw);
    } else {
      document.querySelector('.mall-nav-item[data-target="mall-spot"]').click();
      UI.toast('已在现货市场搜索商品: ' + kw, 'success');
    }
  },

  goToShop(shopId, shopName = '未知店铺') {
    const shop = MockData.shopDetails && MockData.shopDetails[shopId];
    document.getElementById('shop-name-display').innerText = shop ? shop.name : shopName;
    document.getElementById('shop-id-display').innerText = 'No.' + shopId;

    if (shop) {
      const banner = document.getElementById('shop-banner-display');
      if (banner) banner.style.backgroundImage = `url(${shop.banner})`;

      const avatar = document.getElementById('shop-avatar-display');
      if (avatar) avatar.innerText = shop.avatar;

      const biz = document.getElementById('shop-biz-display');
      if (biz) biz.innerText = shop.mainBusiness;

      const reg = document.getElementById('shop-reg-display');
      if (reg) reg.innerText = '入驻时间：' + shop.regTime;

      const followBtn = document.getElementById('shop-follow-btn');
      if (followBtn) {
        followBtn.innerText = shop.isFollowed ? '已关注' : '关注店铺';
        followBtn.className = shop.isFollowed ? 'btn' : 'btn btn-primary';
      }
    }

    document.querySelector('.mall-nav-item[data-target=\'mall-shop\']').click();
    this.renderProducts('', shopId);
  },

  toggleFollowShop() {
    const shopIdText = document.getElementById('shop-id-display').innerText;
    const shopId = parseInt(shopIdText.replace('No.', ''));
    const shop = MockData.shopDetails && MockData.shopDetails[shopId];
    if (shop) {
      shop.isFollowed = !shop.isFollowed;
      const followBtn = document.getElementById('shop-follow-btn');
      if (followBtn) {
        followBtn.innerText = shop.isFollowed ? '已关注' : '关注店铺';
        followBtn.className = shop.isFollowed ? 'btn' : 'btn btn-primary';
      }
      UI.toast(shop.isFollowed ? '已关注该店铺' : '已取消关注', 'success');
    } else {
      UI.toast('关注功能模拟', 'success');
    }
  },


  // === 导航切换 ===
  initNavTabs() {
    const items = document.querySelectorAll('.mall-nav-item');
    const views = document.querySelectorAll('.mall-view');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        if (item.dataset.target.indexOf('ucenter') === -1 && item.dataset.target.indexOf('cart') === -1) {
          item.classList.add('active'); // 隐藏导航不加 active
        }

        views.forEach(v => {
          v.classList.remove('active');
          if (v.id === item.dataset.target) v.classList.add('active');
        });
      });
    });
  },

  // === 个人中心左侧菜单切换 ===
  initUCTabs() {
    const items = document.querySelectorAll('#uc-menu .uc-menu-item');
    const views = document.querySelectorAll('.uc-view');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        views.forEach(v => {
          v.classList.remove('active');
          if (v.id === item.dataset.target) {
            v.classList.add('active');
          }
        });
      });
    });
  },

  // === 渲染大厅数据 ===
  renderProducts(keyword = '', shopId = null) {
    let html = '';
    let filtered = MockData.products.filter(p => p.status === 1);

    if (keyword) {
      filtered = filtered.filter(p => p.name.includes(keyword) || p.shopName.includes(keyword));
    }
    if (shopId) {
      filtered = filtered.filter(p => p.shopId === shopId);
    }

    filtered.forEach(p => {
      html += `
        <div class="product-card cursor-pointer" onclick="MallApp.showProductDetail('${p.id}')">
          <div style="position: relative; overflow: hidden;">
            <img src="${p.image}" class="product-img">
            <div class="card-hover-overlay flex items-center justify-between gap-1" onclick="event.stopPropagation()">
              <div class="flex items-center" style="background:#fff; border: 1px solid #dcdfe6; border-radius:4px; height: 26px; overflow:hidden; flex-shrink: 0;">
                <button style="border:none; background:none; width: 18px; height: 100%; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="let val=document.getElementById('qty-cat-${p.id}'); if(parseInt(val.value)>1) val.value=parseInt(val.value)-1">-</button>
                <input type="text" id="qty-cat-${p.id}" value="1" style="width: 24px; height:100%; border:none; border-left:1px solid #e0e0e0; border-right:1px solid #e0e0e0; text-align:center; font-size:11px; outline:none; padding:0;">
                <button style="border:none; background:none; width: 18px; height: 100%; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="let val=document.getElementById('qty-cat-${p.id}'); val.value=parseInt(val.value)+1">+</button>
              </div>
              <div class="flex gap-1">
                <button class="btn btn-outline btn-sm" style="color:var(--primary-color); border-color:var(--primary-color); border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px;" onclick="UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">💬 询价</button>
                <button class="btn btn-primary btn-sm" style="border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px; background: var(--primary-color); border-color: var(--primary-color); color: #fff;" onclick="MallApp.addToCart('${p.id}', parseInt(document.getElementById('qty-cat-${p.id}').value))">加入采购</button>
              </div>
            </div>
          </div>
          <div class="product-info">
            <div class="product-title">${p.name}</div>
            <div class="product-price" style="color: var(--danger-color);">${p.priceStr}</div>
            <div class="product-shop text-sm text-secondary mt-2 flex justify-between items-center" onclick="event.stopPropagation(); window.MallApp && window.MallApp.goToShop('${p.shopId}', '${p.shopName}')">
              <span class="hover:text-primary">${p.shopName}</span>
              <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">No.${p.shopId}</span>
            </div>
          </div>
        </div>
      `;
    });

    const gridShop = document.getElementById('grid-shop-products');
    if (gridShop && shopId) gridShop.innerHTML = html;

    const grid1 = document.getElementById('grid-home-products');
    const grid2 = document.getElementById('grid-spot-products');
    if (grid1 && !keyword && !shopId) {
      // 首页不受现货搜索影响，只渲染默认前4个
      const top4 = MockData.products.filter(p => p.status === 1).slice(0, 4);
      let homeHtml = '';
      top4.forEach(p => {
        homeHtml += `
          <div class="product-card cursor-pointer" onclick="MallApp.showProductDetail('${p.id}')">
            <div style="position: relative; overflow: hidden;">
              <img src="${p.image}" class="product-img">
              <div class="card-hover-overlay flex items-center justify-between gap-1" onclick="event.stopPropagation()">
                <div class="flex items-center" style="background:#fff; border: 1px solid #dcdfe6; border-radius:4px; height: 26px; overflow:hidden; flex-shrink: 0;">
                  <button style="border:none; background:none; width: 18px; height: 100%; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="let val=document.getElementById('qty-home-${p.id}'); if(parseInt(val.value)>1) val.value=parseInt(val.value)-1">-</button>
                  <input type="text" id="qty-home-${p.id}" value="1" style="width: 24px; height:100%; border:none; border-left:1px solid #e0e0e0; border-right:1px solid #e0e0e0; text-align:center; font-size:11px; outline:none; padding:0;">
                  <button style="border:none; background:none; width: 18px; height: 100%; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="let val=document.getElementById('qty-home-${p.id}'); val.value=parseInt(val.value)+1">+</button>
                </div>
                <div class="flex gap-1">
                  <button class="btn btn-outline btn-sm" style="color:var(--primary-color); border-color:var(--primary-color); border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px;" onclick="UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">💬 询价</button>
                  <button class="btn btn-primary btn-sm" style="border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px; background: var(--primary-color); border-color: var(--primary-color); color: #fff;" onclick="MallApp.addToCart('${p.id}', parseInt(document.getElementById('qty-home-${p.id}').value))">加入采购</button>
                </div>
              </div>
            </div>
            <div class="product-info">
              <div class="product-title">${p.name}</div>
              <div class="product-price" style="color: var(--danger-color);">${p.priceStr}</div>
              <div class="product-shop text-sm text-secondary mt-2 flex justify-between items-center" onclick="event.stopPropagation(); window.MallApp && window.MallApp.goToShop('${p.shopId}', '${p.shopName}')">
                <span class="hover:text-primary">${p.shopName}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">No.${p.shopId}</span>
              </div>
            </div>
          </div>
        `;
      });
      grid1.innerHTML = homeHtml;
    }
    if (grid2) {
      // 现货市场修改
      let spotHtml = '';
      let filtered = MockData.products.filter(p => p.status === 1);
      if (keyword) {
        filtered = filtered.filter(p => p.name.includes(keyword) || p.shopName.includes(keyword));
      }
      filtered.forEach(p => {
        spotHtml += `
          <div class="product-card cursor-pointer" onclick="MallApp.showProductDetail('${p.id}')">
            <div style="position: relative; overflow: hidden;">
              <img src="${p.image}" class="product-img">
              <div class="card-hover-overlay flex items-center justify-between gap-1" onclick="event.stopPropagation()">
                <div class="flex items-center" style="background:#fff; border: 1px solid #dcdfe6; border-radius:4px; height: 26px; overflow:hidden; flex-shrink: 0;">
                  <button style="border:none; background:none; width: 18px; height: 100%; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="let val=document.getElementById('qty-spot-${p.id}'); if(parseInt(val.value)>1) val.value=parseInt(val.value)-1">-</button>
                  <input type="text" id="qty-spot-${p.id}" value="1" style="width: 24px; height:100%; border:none; border-left:1px solid #e0e0e0; border-right:1px solid #e0e0e0; text-align:center; font-size:11px; outline:none; padding:0;">
                  <button style="border:none; background:none; width: 18px; height: 100%; cursor:pointer; font-weight:bold; font-size:12px; display:flex; align-items:center; justify-content:center;" onclick="let val=document.getElementById('qty-spot-${p.id}'); val.value=parseInt(val.value)+1">+</button>
                </div>
                <div class="flex gap-1">
                  <button class="btn btn-outline btn-sm" style="color:var(--primary-color); border-color:var(--primary-color); border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px;" onclick="UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">💬 询价</button>
                  <button class="btn btn-primary btn-sm" style="border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px; background: var(--primary-color); border-color: var(--primary-color); color: #fff;" onclick="MallApp.addToCart('${p.id}', parseInt(document.getElementById('qty-spot-${p.id}').value))">加入采购</button>
                </div>
              </div>
            </div>
            <div class="product-info">
              <div class="product-title">${p.name}</div>
              <div class="product-price" style="color: var(--danger-color);">${p.priceStr}</div>
              <div class="product-shop text-sm text-secondary mt-2 flex justify-between items-center" onclick="event.stopPropagation(); window.MallApp && window.MallApp.goToShop('${p.shopId}', '${p.shopName}')">
                <span class="hover:text-primary">${p.shopName}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">No.${p.shopId}</span>
              </div>
            </div>
          </div>
        `;
      });
      grid2.innerHTML = spotHtml;
    }
  },

  doSearch() {
    const type = document.getElementById('search-type').value;
    const kw = document.getElementById('search-keyword').value.trim();
    if (!kw) {
      UI.toast('请输入搜索关键词', 'warning');
      return;
    }

    if (type === 'merchant') {
      // 模拟搜到第一个商家
      const p = MockData.products.find(p => p.shopName.includes(kw));
      if (p) {
        this.goToShop(p.shopId, p.shopName);
      } else {
        UI.toast('未找到相关商户', 'error');
      }
    } else {
      // 搜索商品，跳转现货市场并过滤
      document.querySelector('.mall-nav-item[data-target=\'mall-spot\']').click();
      // 设置现货市场的输入框
      document.getElementById('spot-search-keyword').value = kw;
      this.renderProducts(kw);
    }
  },

  doSpotSearch() {
    const kw = document.getElementById('spot-search-keyword').value.trim();
    this.renderProducts(kw);
  },

  doShopSearch() {
    const kw = document.getElementById('shop-search-keyword').value.trim();
    const shopIdText = document.getElementById('shop-id-display').innerText;
    const shopId = parseInt(shopIdText.replace('No.', ''));
    if (!kw) {
      UI.toast('请输入店内搜索词', 'warning');
      return;
    }

    // 渲染店内商品过滤
    const grid = document.getElementById('grid-shop-products');
    let html = '';
    let filtered = MockData.products.filter(p => p.status === 1 && p.shopId === shopId && p.name.includes(kw));

    filtered.forEach(p => {
      html += `
        <div class="product-card cursor-pointer" onclick="MallApp.showProductDetail('${p.id}')">
          <img src="${p.image}" class="product-img">
          <div class="product-info">
            <div class="product-title">${p.name}</div>
            <div class="flex justify-between items-center">
              <div class="product-price">${p.priceStr}</div>
              <button class="btn btn-outline text-xs px-2 py-1 flex items-center gap-1" style="color:var(--primary-color); border-color:var(--primary-color);" onclick="event.stopPropagation(); UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">
                💬 询价
              </button>
            </div>
            <div class="product-shop text-sm text-secondary mt-2 flex justify-between items-center">
              <span>(店内) ${p.shopName}</span>
              <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">No.${p.shopId}</span>
            </div>
            <div class="mt-3 flex gap-2" onclick="event.stopPropagation()">
              <div class="flex items-center border border-light rounded overflow-hidden flex-1 max-w-[100px]">
                <button class="bg-gray-100 px-2 hover:bg-gray-200" onclick="let inp=this.nextElementSibling; inp.value=Math.max(1, parseInt(inp.value||1)-1)">-</button>
                <input type="number" id="qty-sh-${p.id}" value="1" min="1" class="w-full text-center outline-none border-none text-sm">
                <button class="bg-gray-100 px-2 hover:bg-gray-200" onclick="let inp=this.previousElementSibling; inp.value=parseInt(inp.value||1)+1">+</button>
              </div>
              <button class="btn btn-primary text-sm px-3 flex-1 whitespace-nowrap" onclick="MallApp.addToCart('${p.id}', document.getElementById('qty-sh-${p.id}').value)">加入购物车</button>
            </div>
          </div>
        </div>
      `;
    });
    if (grid) grid.innerHTML = html || '<div class="col-span-4 text-center py-8 text-secondary">店内未找到相关商品</div>';
  },

  addToCart(productId, quantity = 1) {
    if (!productId) return;
    quantity = parseInt(quantity);
    if (isNaN(quantity) || quantity < 1) quantity = 1;

    let existing = MockData.cart.find(c => c.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      const p = MockData.products.find(p => p.id === productId);
      if (p) {
        MockData.cart.push({
          id: MockData.cart.length + 1,
          productId: p.id,
          productName: p.name,
          price: p.price,
          quantity: quantity,
          shopName: p.shopName,
          shopId: p.shopId,
          image: p.image,
          status: p.status
        });
      }
    }

    this.renderCart();

    // 更新右上角购物车角标
    const badge = document.querySelector('.mall-header .tag-danger');
    if (badge) {
      badge.innerText = MockData.cart.filter(c => c.status === 1).reduce((sum, item) => sum + item.quantity, 0);
    }

    UI.toast(`已加入购物车，数量: ${quantity}`, 'success');
  },

  showProductDetail(productId) {
    const p = MockData.products.find(p => p.id === productId);
    if (!p) return;
    this.currentDetailId = productId;
    document.getElementById('pd-title').innerText = p.name;
    document.getElementById('pd-img').src = p.image;
    document.getElementById('pd-price').innerText = p.priceStr;
    document.getElementById('pd-shop').innerText = `商户: ${p.shopName} (No.${p.shopId})`;
    document.getElementById('pd-qty').value = 1;
    UI.openModal('modal-product-detail');
  },

  renderHomeExtras() {
    // 渲染大宗求购
    const dGrid = document.getElementById('list-home-demands');
    if (dGrid) {
      let dHtml = '';
      MockData.demands.slice(0, 2).forEach(d => { // 只显示2个，与竞价对齐
        dHtml += `
          <div class="product-card cursor-pointer" onclick="document.querySelector('.mall-nav-item[data-target=\\'mall-demand\\']').click()">
            <div class="product-info">
              <div class="product-title" title="${d.title}">${d.title}</div>
              <div class="product-price" style="color: var(--danger-color);">${d.expectedPrice}</div>
              <div class="product-shop text-sm text-secondary mt-2 flex justify-between items-center">
                <span>${d.buyerName}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">求购</span>
              </div>
            </div>
          </div>
        `;
      });
      dGrid.innerHTML = dHtml;
    }

    // 渲染首页的 热门竞价
    const bidList = document.getElementById('list-home-bids');
    if (bidList) {
      const bids = MockData.biddingAnnouncements.slice(0, 4);
      let bHtml = '';
      bids.forEach(b => {
        let tag = b.status === 1 ? '<span class="tag tag-success text-xs">竞价中</span>' : '<span class="tag tag-secondary text-xs">已结束</span>';
        bHtml += `
          <div class="product-card cursor-pointer" onclick="MallApp.showBiddingDetail('${b.id}')">
            <div class="product-info">
              <div class="product-title" title="${b.title}">${b.title}</div>
              <div class="product-price" style="color: var(--danger-color);">${b.currentMaxOffer || b.startPrice}</div>
              <div class="product-shop text-sm text-secondary mt-2 flex justify-between items-center">
                <span>${b.shopName}</span>
                <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">竞价</span>
              </div>
            </div>
          </div>
        `;
      });
      bidList.innerHTML = bHtml;
    }
  },

  renderDemands(keyword = '') {
    const grid = document.getElementById('grid-mall-demands');
    if (!grid) return;

    // 获取其他筛选条件 (如果有)
    const dateStart = document.getElementById('demand-search-date-start')?.value || '';
    const dateEnd = document.getElementById('demand-search-date-end')?.value || '';
    const delivStart = document.getElementById('demand-search-delivery-start')?.value || '';
    const delivEnd = document.getElementById('demand-search-delivery-end')?.value || '';

    let html = '';
    let filtered = MockData.demands.filter(d => d.status === 1);
    if (keyword) {
      filtered = filtered.filter(d => d.title.includes(keyword) || d.buyerName.includes(keyword));
    }

    if (dateStart || dateEnd || delivStart || delivEnd) {
      // 此处省略复杂的日期过滤逻辑，仅做基础控制
      // console.log("Filtering by dates:", {dateStart, dateEnd, delivStart, delivEnd});
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="col-span-3 text-center py-12 text-secondary">暂无符合条件的求购意向</div>';
      return;
    }

    filtered.forEach(d => {
      let isMine = d.buyerName === this.currentBuyerName;
      let btn = isMine ?
        `<span class="text-secondary text-sm">我发布的</span>` :
        `<div class="flex gap-2" style="margin-top: 12px;">
           <button class="btn btn-outline btn-sm flex-1" onclick="window.MainApp && MainApp.checkAuth('merchant', () => { UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${d.title}'; document.getElementById('chat-prod-price').innerText='${d.expectedPrice}'; document.getElementById('chat-prod-img').src='https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80'; })">💬 沟通</button>
           <button class="btn btn-primary btn-sm flex-1" onclick="window.MainApp && MainApp.checkAuth('merchant', () => MallApp.openQuoteModal('${d.title}', '${d.expectedPrice}'))">立即报价</button>
         </div>`;

      html += `
        <div class="card product-card">
          <div class="card-body">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-lg truncate flex-1" title="${d.title}">${d.title}</h3>
            </div>
            <div class="text-sm text-secondary mb-4 flex flex-col gap-1">
              <div><span class="inline-block w-20">采购方:</span> <span class="text-dark">${d.buyerName}</span></div>
              <div><span class="inline-block w-20">发布时间:</span> <span class="text-dark">${d.publishTime}</span></div>
              <div><span class="inline-block w-20">期望报价:</span> <span class="text-danger font-bold">${d.expectedPrice}</span></div>
              <div><span class="inline-block w-20">交期要求:</span> <span class="text-dark">见详情</span></div>
            </div>
            <div class="border-t border-light pt-3">
              ${btn}
            </div>
          </div>
        </div>
      `;
    });
    grid.innerHTML = html;
  },

  doDemandSearch() {
    const kw = document.getElementById('demand-search-keyword').value.trim();
    this.renderDemands(kw);
  },

  renderBids(keyword = '') {
    const grid = document.getElementById('grid-mall-bids');
    let html = '';
    let filtered = MockData.biddingAnnouncements;
    if (keyword) {
      filtered = filtered.filter(b => b.title.includes(keyword));
    }
    const statusVal = document.getElementById('bid-search-status')?.value || '';
    if (statusVal !== '') {
      filtered = filtered.filter(b => b.status === parseInt(statusVal));
    }
    filtered.forEach(b => {
      let tag = b.status === 1 ? '<span class="tag tag-success">竞价中</span>' : '<span class="tag tag-secondary">已结束</span>';
      html += `
        <div class="card shadow-sm border-0 cursor-pointer hover:shadow-md transition" style="overflow:hidden;" onclick="MallApp.showBiddingDetail('${b.id}')">
          <div style="position: relative; overflow: hidden; height: 160px;">
            <img src="${b.image}" style="width: 100%; height: 100%; object-fit: cover; display: block;">
            <div style="position: absolute; top: 12px; right: 12px; z-index: 2;">${tag}</div>
          </div>
          <div class="card-body" style="padding: 16px;">
            <h3 class="font-bold text-base m-0 truncate mb-1" title="${b.title}">${b.title}</h3>
            <div class="text-xs text-secondary mb-3 flex items-center gap-1.5">
              <span>🏢 ${b.shopName}</span>
              <span style="color:#ddd;">|</span>
              <span class="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">No.${b.shopId}</span>
            </div>
            <div class="flex justify-between items-end bg-gray-50 p-3 rounded-lg" style="border: 1px solid var(--border-light); margin-bottom: 12px;">
              <div>
                <div class="text-[10px] text-secondary">底价/起拍价</div>
                <div class="text-sm font-bold text-gray-600">${b.startPrice}</div>
              </div>
              <div class="text-right">
                <div class="text-[10px] text-danger">当前最高出价</div>
                <div class="text-lg font-bold text-danger">${b.currentMaxOffer || b.startPrice}</div>
              </div>
            </div>
            <button class="btn btn-primary w-full" style="height: 36px; border-radius: 18px; font-size: 13px;" onclick="event.stopPropagation(); MallApp.showBiddingDetail('${b.id}')">参与竞价</button>
          </div>
        </div>
      `;
    });
    if (grid) grid.innerHTML = html;
  },

  editNickname() {
    const textEl = document.getElementById('uc-username-text');
    if (!textEl) return;
    const newName = prompt('请输入新的个人/企业名称：', textEl.innerText);
    if (newName && newName.trim()) {
      const val = newName.trim();
      textEl.innerText = val;
      const avatarEl = document.querySelector('.uc-avatar');
      if (avatarEl) avatarEl.innerText = val.charAt(0);
      this.currentBuyerName = val;
      UI.toast('个人名称修改成功', 'success');
    }
  },

  doBidSearch() {
    const kw = document.getElementById('bid-search-keyword').value.trim();
    this.renderBids(kw);
  },

  showBiddingDetail(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;

    // UI steps: 看货报名 -> 现场看货 -> 竞价报名 -> 参加竞价 -> 竞价成功 -> 线下付款
    // Generate current step based on status
    let currentStep = 1;
    if (b.status === 1) currentStep = 4; // 参加竞价
    if (b.status === 3) currentStep = 6; // 已结束，线下付款完成/进行中

    const steps = ['看货报名', '现场看货', '竞价报名', '参加竞价', '竞价成功', '线下付款'];
    let stepsHtml = '<div class="steps-container">';
    steps.forEach((name, index) => {
      let stateClass = '';
      if (index + 1 < currentStep) stateClass = 'done';
      if (index + 1 === currentStep) stateClass = 'active';
      stepsHtml += `
        <div class="step-item ${stateClass}">
          <div class="step-circle">${stateClass === 'done' ? '✓' : (index + 1)}</div>
          <div class="step-title">${name}</div>
        </div>
      `;
    });
    stepsHtml += '</div>';

    const modalBody = document.getElementById('bidding-detail-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="flex gap-4 mb-4">
          <img src="${b.image}" style="width: 300px; height: 200px; object-fit: cover; border-radius: 8px;">
          <div>
            <h2 class="text-xl font-bold mb-2">${b.title}</h2>
            <p class="text-secondary mb-2">处置方: ${b.shopName} <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">No.${b.shopId}</span></p>
            <p class="text-secondary mb-2">起拍底价: <span class="text-danger font-bold text-xl">${b.startPrice}</span></p>
            <p class="text-secondary mb-2">当前最高出价: <span class="text-danger font-bold text-xl">${b.currentMaxOffer}</span></p>
            <p class="text-secondary mb-4">截止时间: ${b.bidEndTime}</p>
            <button class="btn btn-primary" ${b.status !== 1 ? 'disabled' : ''} onclick="UI.toast('参与竞价操作，正在录入出价信息...', 'info')">
              ${b.status === 1 ? '立即出价' : '不在竞价期'}
            </button>
          </div>
        </div>
        <div class="mt-8 border-t pt-6">
          <h3 class="font-bold mb-2">当前竞价流转节点</h3>
          ${stepsHtml}
        </div>
      `;
      UI.showModal('modal-bidding-detail');
    }
  },

  openQuoteModal(name, expectedPrice) {
    const titleEl = document.getElementById('quote-prod-name');
    const expectedEl = document.getElementById('quote-prod-expected');
    if (titleEl) titleEl.innerText = name;
    if (expectedEl) expectedEl.innerText = '期望价格: ' + expectedPrice;

    // Reset inputs
    document.getElementById('quote-price').value = '';
    document.getElementById('quote-qty').value = '';
    document.getElementById('quote-notes').value = '';

    UI.openModal('modal-quote');
  },

  sendQuickMessage(type) {
    const chatBox = document.getElementById('chat-messages');
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
        <div style="padding: 4px 0; font-size: 14px;">
          <strong style="color: #26a25b; display: block; margin-bottom: 6px;">💰 【货源报价单】</strong>
          <div>报价单价：<span style="font-weight: bold; color: #26a25b;">${price}</span></div>
          <div>可供数量：<span>${qty}</span></div>
        </div>
      `;
      toastMsg = '报价卡片发送成功';
    } else if (type === 'bargain') {
      const price = prompt('请输入您的意向砍价单价（如：3900元/吨）：');
      if (!price) return;
      contentHtml = `
        <div style="padding: 4px 0; font-size: 14px;">
          <strong style="color: #d55300; display: block; margin-bottom: 6px;">🤝 【意向砍价卡】</strong>
          <div>砍价目标：<span style="font-weight: bold; color: #d55300;">${price}</span></div>
          <div style="font-size: 12px; margin-top: 4px; opacity: 0.9;">期待与您促成交易，是否接受？</div>
        </div>
      `;
      toastMsg = '砍价卡片发送成功';
    }

    // Append user message
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3 justify-end';
    msgDiv.innerHTML = `
      <div class="p-3 rounded shadow-sm text-sm" style="max-width: 75%; border-radius: 16px 0 16px 16px; background: ${type === 'quote' ? '#edfbf3' : type === 'bargain' ? '#fff8f0' : 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)'}; color: ${type === 'quote' ? '#26a25b' : type === 'bargain' ? '#d55300' : '#ffffff'}; border: 1px solid ${type === 'quote' ? '#d1f4df' : type === 'bargain' ? '#ffe3c2' : 'transparent'}; line-height: 1.5;">
        ${contentHtml}
      </div>
      <div class="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs flex-shrink-0">我</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    UI.toast(toastMsg + '，已同步至消息中心', 'success');
  },

  // === 个人中心渲染 ===
  renderUCOrders() {
    const tbody = document.querySelector('#table-uc-orders tbody');
    let html = '';
    MockData.orders.filter(o => o.buyerName === this.currentBuyerName).forEach(o => {
      let statusTag = '';
      let actBtn = '';
      if (o.status === 0) {
        statusTag = `<span class="tag tag-warning">待签约</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MallApp.signContract('${o.id}')">签署合同(盖章)</button>`;
      } else if (o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        actBtn = `<span class="text-secondary text-sm">催发货</span>`;
      } else if (o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">待签收</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="UI.toast('已确认收货，订单完成', 'success')">确认收货</button>`;
      } else if (o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
        actBtn = `<span class="text-secondary text-sm">已完成</span>`;
      } else if (o.status === -1) {
        statusTag = `<span class="tag tag-danger">已关闭</span>`;
        actBtn = `<span class="text-secondary text-sm">退款取消</span>`;
      }
      html += `
        <tr>
          <td>${o.id}</td>
          <td>${o.productName}</td>
          <td>
            <div>${o.shopName}</div>
            <div class="text-xs text-gray-400 bg-gray-100 px-1 rounded inline-block mt-1">No.${o.shopId}</div>
          </td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${statusTag}</td>
          <td>${actBtn}</td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;
  },

  signContract(orderId) {
    if (confirm('系统将模拟调用 CA 电子签章接口签署合同，是否继续？')) {
      UI.toast(`订单 ${orderId} 合同签署成功，等待商家发货`, 'success');
    }
  },

  renderUCInvoices() {
    const tbody = document.querySelector('#table-uc-invoices tbody');
    let html = '';
    MockData.invoices.filter(i => i.buyerName === this.currentBuyerName).forEach(i => {
      html += `
        <tr>
          <td>${i.id}</td>
          <td>${i.type}</td>
          <td class="text-danger font-bold">${i.amount}</td>
          <td>${i.applyTime}</td>
          <td><span class="tag tag-success">${i.status}</span></td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;
  },

  renderUCDemandsPub() {
    const tbody = document.querySelector('#table-uc-demands-pub tbody');
    let html = '';
    MockData.demands.filter(d => d.buyerName === this.currentBuyerName).forEach(d => {
      let actBtn = d.status === 1
        ? `<button class="btn btn-text btn-sm text-primary">编辑</button> <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已关闭该求购单', 'info')">关闭</button>`
        : `<span class="text-secondary text-sm">不可操作</span>`;
      html += `
        <tr>
          <td>${d.id}</td>
          <td>${d.title}</td>
          <td>${d.publishTime}</td>
          <td><span class="text-primary font-bold">${d.quotesCount}</span> 份报价</td>
          <td>${d.status === 1 ? '<span class="tag tag-success">寻源中</span>' : '<span class="tag tag-secondary">已关闭</span>'}</td>
          <td>${actBtn}</td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;
  },

  renderUCMessages() {
    const tbody = document.querySelector('#table-uc-messages tbody');
    let html = '';
    MockData.messages.forEach(m => {
      html += `
        <tr>
          <td style="width: 150px;">${m.time}</td>
          <td class="font-bold">${m.title}</td>
          <td class="text-secondary">${m.content}</td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;
  },

  // === 7. 购物车 ===
  renderCart() {
    const tbody = document.querySelector('#mall-cart tbody');
    if (!tbody || !MockData.cart) return;

    if (MockData.cart.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5" class="text-center py-12">
          <div class="text-secondary mb-4">购物车空空如也，快去挑点好货吧！</div>
          <button class="btn btn-primary" onclick="document.querySelector('.mall-nav-item[data-target=\\'mall-spot\\']').click()">去逛逛</button>
        </td></tr>
      `;
      // hide summary footer if exists
      const footer = document.getElementById('cart-summary-footer');
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
          <tr style="background: #fafafa; color: #999;">
            <td>
              <div class="flex items-center gap-2">
                <span class="tag tag-secondary">失效</span>
                <span>${item.name} <span class="text-xs ml-2">(店内: ${item.shopName})</span></span>
              </div>
            </td>
            <td>¥${item.price}</td>
            <td>${item.quantity}</td>
            <td>-</td>
            <td><button class="btn btn-text btn-sm text-danger" onclick="MallApp.removeCartItem('${item.id}')">删除</button></td>
          </tr>
        `;
      } else {
        if (item.checked) {
          totalAmount += item.price * item.quantity;
          selectedCount += item.quantity;
        }

        html += `
          <tr>
            <td>
              <div class="flex items-center gap-2">
                <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="MallApp.toggleCartItem('${item.id}', this.checked)">
                <span class="font-bold">${item.name}</span>
                <span class="text-xs text-secondary">(店内: <span class="hover:text-primary cursor-pointer" onclick="MallApp.goToShop('${item.shopId}', '${item.shopName}')">${item.shopName}</span>)</span>
              </div>
            </td>
            <td><span class="text-danger font-bold">¥${item.price}</span></td>
            <td>
              <div class="flex gap-2">
                <button class="btn btn-sm" onclick="MallApp.updateCartQty('${item.id}', -1)">-</button>
                <input type="number" class="form-control" style="width:60px; text-align:center; padding:0" value="${item.quantity}" onchange="MallApp.setCartQty('${item.id}', this.value)">
                <button class="btn btn-sm" onclick="MallApp.updateCartQty('${item.id}', 1)">+</button>
              </div>
            </td>
            <td><span class="text-danger font-bold">¥${item.price * item.quantity}</span></td>
            <td><button class="btn btn-text btn-sm text-danger" onclick="MallApp.removeCartItem('${item.id}')">删除</button></td>
          </tr>
        `;
      }
    });

    tbody.innerHTML = html;

    // Render summary footer
    let footer = document.getElementById('cart-summary-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.id = 'cart-summary-footer';
      footer.className = 'mt-4 p-4 flex justify-between items-center shadow-sm';
      footer.style.background = '#fff';
      footer.style.borderRadius = '8px';
      document.querySelector('#mall-cart .table-wrapper').appendChild(footer);
    }
    footer.style.display = 'flex';
    footer.innerHTML = `
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" id="cart-check-all" onchange="MallApp.toggleAllCart(this.checked)"> 全选
        </label>
        ${invalidCount > 0 ? `<span class="text-sm text-secondary">(${invalidCount}件失效商品已过滤)</span>` : ''}
      </div>
      <div class="flex items-center gap-4">
        <div>已选 <span class="text-primary font-bold px-1">${selectedCount}</span> 件商品，总计: <span class="text-danger text-2xl font-bold">¥${totalAmount}</span></div>
        <button class="btn btn-primary" style="height: 40px; padding: 0 32px;" ${selectedCount === 0 ? 'disabled' : ''} onclick="UI.toast('去结算功能开发中', 'info')">去结算</button>
      </div>
    `;

    // Check if all active items are checked to sync the "check all" checkbox
    const allActive = MockData.cart.filter(c => c.status === 1);
    const allChecked = allActive.length > 0 && allActive.every(c => c.checked);
    const chkAll = document.getElementById('cart-check-all');
    if (chkAll) chkAll.checked = allChecked;
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
    if (confirm('确认将该商品从购物车中移除吗？')) {
      MockData.cart = MockData.cart.filter(c => c.id !== id);
      this.renderCart();
      UI.toast('已移除', 'success');
    }
  }
};

window.MallApp = MallApp;

document.addEventListener('DOMContentLoaded', () => {
  MallApp.init();
});
