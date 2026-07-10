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
      let html = '<div class="text-sm font-bold text-secondary px-5 mb-2">大宗农贸主分类</div>';
      
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
        if(item.dataset.target.indexOf('ucenter') === -1 && item.dataset.target.indexOf('cart') === -1) {
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
            <div class="card-hover-overlay flex items-center justify-center gap-2" style="position: absolute; bottom: -60px; left: 0; width: 100%; height: 50px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); transition: bottom 0.3s ease; box-shadow: 0 -2px 10px rgba(0,0,0,0.05);" onclick="event.stopPropagation()">
              <button class="btn btn-outline btn-sm" style="color:var(--primary-color); border-color:var(--primary-color); border-radius: 16px; padding: 0 12px;" onclick="UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">
                💬 询价
              </button>
              <button class="btn btn-primary btn-sm" style="border-radius: 16px; padding: 0 12px;" onclick="MallApp.addToCart('${p.id}', 1)">加入采购</button>
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
              <div class="card-hover-overlay flex items-center justify-center gap-2" style="position: absolute; bottom: -60px; left: 0; width: 100%; height: 50px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); transition: bottom 0.3s ease; box-shadow: 0 -2px 10px rgba(0,0,0,0.05);" onclick="event.stopPropagation()">
                <button class="btn btn-outline btn-sm" style="color:var(--primary-color); border-color:var(--primary-color); border-radius: 16px; padding: 0 12px;" onclick="UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">
                  💬 询价
                </button>
                <button class="btn btn-primary btn-sm" style="border-radius: 16px; padding: 0 12px;" onclick="MallApp.addToCart('${p.id}', 1)">加入采购</button>
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
              <div class="card-hover-overlay flex items-center justify-center gap-2" style="position: absolute; bottom: -60px; left: 0; width: 100%; height: 50px; background: rgba(255,255,255,0.9); backdrop-filter: blur(4px); transition: bottom 0.3s ease; box-shadow: 0 -2px 10px rgba(0,0,0,0.05);" onclick="event.stopPropagation()">
                <button class="btn btn-outline btn-sm" style="color:var(--primary-color); border-color:var(--primary-color); border-radius: 16px; padding: 0 12px;" onclick="UI.openModal('modal-chat'); document.getElementById('chat-prod-title').innerText='${p.name}'; document.getElementById('chat-prod-price').innerText='${p.priceStr}'; document.getElementById('chat-prod-img').src='${p.image}';">
                  💬 询价
                </button>
                <button class="btn btn-primary btn-sm" style="border-radius: 16px; padding: 0 12px;" onclick="MallApp.addToCart('${p.id}', 1)">加入采购</button>
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
      let dHtml = '<table class="table" style="width:100%"><thead><tr><th>需求描述</th><th>采购方</th><th>期望报价</th></tr></thead><tbody>';
      MockData.demands.slice(0, 4).forEach(d => {
        dHtml += `
          <tr class="cursor-pointer hover:bg-gray-50" onclick="document.querySelector('.mall-nav-item[data-target=\\'mall-demand\\']').click()">
            <td class="font-bold">${d.title}</td>
            <td class="text-sm text-secondary">${d.buyerName}</td>
            <td class="text-danger font-bold text-right">${d.expectedPrice}</td>
          </tr>
        `;
      });
      dHtml += '</tbody></table>';
      dGrid.innerHTML = dHtml;
    }

    // 渲染首页的 热门竞价
    const bidList = document.getElementById('list-home-bids');
    if (bidList) {
      const bids = MockData.biddingAnnouncements.slice(0, 4);
      let bHtml = '<table class="table" style="width:100%"><thead><tr><th>竞价项目</th><th>状态</th><th>底价/当前价</th></tr></thead><tbody>';
      bids.forEach(b => {
        let tag = b.status === 1 ? '<span class="tag tag-success text-xs">竞价中</span>' : '<span class="tag tag-secondary text-xs">已结束</span>';
        bHtml += `
          <tr class="cursor-pointer hover:bg-gray-50" onclick="MallApp.showBiddingDetail('${b.id}')">
            <td class="font-bold">${b.title} <div class="text-sm text-secondary font-normal mt-1 flex items-center gap-2"><span>${b.shopName}</span><span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">No.${b.shopId}</span></div></td>
            <td>${tag}</td>
            <td class="text-danger font-bold text-right">${b.currentMaxOffer || b.startPrice}</td>
          </tr>
        `;
      });
      bHtml += '</tbody></table>';
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
        `<button class="btn btn-primary btn-sm" style="width: 100%; margin-top: 12px;" onclick="window.MainApp && MainApp.checkAuth('merchant', () => UI.toast('弹出IM聊天框与买家沟通', 'info'))">立即报价</button>`;
      
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
    filtered.forEach(b => {
      let tag = b.status === 1 ? '<span class="tag tag-success">竞价中</span>' : '<span class="tag tag-secondary">已结束</span>';
      html += `
        <div class="card shadow-sm border-0 cursor-pointer hover:shadow-md transition" onclick="MallApp.showBiddingDetail('${b.id}')">
          <div class="card-body">
            <div class="flex justify-between items-start mb-2">
              <h3 class="font-bold text-lg m-0 flex-1">${b.title}</h3>
              ${tag}
            </div>
            <div class="text-sm text-secondary mb-4 flex items-center gap-2">
              <span>${b.shopName}</span>
              <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded">No.${b.shopId}</span>
            </div>
            <div class="flex justify-between items-end mt-4">
              <div>
                <div class="text-xs text-secondary">底价/起拍价</div>
                <div class="text-lg font-bold text-gray-600">${b.startPrice}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-danger">当前最高出价</div>
                <div class="text-2xl font-bold text-danger">${b.currentMaxOffer || b.startPrice}</div>
              </div>
            </div>
            <button class="btn btn-primary w-full mt-4" onclick="event.stopPropagation(); window.MainApp && MainApp.checkAuth('merchant', () => UI.toast('进入竞价出价页面', 'info'))">参与竞价</button>
          </div>
        </div>
      `;
    });
    if(grid) grid.innerHTML = html;
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

  // === 个人中心渲染 ===
  renderUCOrders() {
    const tbody = document.querySelector('#table-uc-orders tbody');
    let html = '';
    MockData.orders.filter(o => o.buyerName === this.currentBuyerName).forEach(o => {
      let statusTag = '';
      let actBtn = '';
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning">待签约</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MallApp.signContract('${o.id}')">签署合同(盖章)</button>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        actBtn = `<span class="text-secondary text-sm">催发货</span>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #1677ff; background: #e6f4ff;">待签收</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="UI.toast('已确认收货，订单完成', 'success')">确认收货</button>`;
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
        actBtn = `<span class="text-secondary text-sm">已完成</span>`;
      } else if(o.status === -1) {
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
    if(tbody) tbody.innerHTML = html;
  },

  signContract(orderId) {
    if(confirm('系统将模拟调用 CA 电子签章接口签署合同，是否继续？')) {
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
    if(tbody) tbody.innerHTML = html;
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
    if(tbody) tbody.innerHTML = html;
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
    if(tbody) tbody.innerHTML = html;
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
