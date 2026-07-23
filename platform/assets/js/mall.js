
function formatTimeSec(str) {
  if (!str || str === "--") return "--";
  str = String(str).trim();
  if (str.length === 10) return str + " 00:00:00";
  if (str.length === 16) return str + ":00";
  return str;
}
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
    this.renderUCBids();
    this.renderUCMessages();

    this.renderCart();
  },

  // === 渲染分类 ===
  renderCategories() {
    const menu = document.getElementById('home-category-menu');
    if (menu && MockData.productCategories) {
      let html = `
        <div style="padding: 16px 20px; font-weight: 800; color: #0f172a; font-size: 15px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; display: flex; align-items: center; justify-content: space-between;">
          <span style="display:flex; align-items:center; gap:8px;">
            <span style="display:inline-block; width:4px; height:16px; background:var(--primary-color); border-radius:2px;"></span>
            📦 全部品类导航
          </span>
          <span style="font-size:11px; color:#94a3b8; font-weight:normal;">一站式全覆盖</span>
        </div>
        <div style="flex:1; overflow-y:auto; padding:4px 0;">
          <!-- 1. 全部品类入口 -->
          <div class="home-cat-item" onclick="MallApp.goToSpotMarket('')" style="display:flex; align-items:center; justify-content:space-between; padding:12px 18px; transition:all 0.2s; border-bottom:1px solid #f8fafc; background: rgba(22,119,255,0.03);">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
              <span style="font-size:18px; width:26px; height:26px; border-radius:6px; background:var(--primary-bg); color:var(--primary-color); display:flex; align-items:center; justify-content:center;">📦</span>
              <div style="display:flex; flex-direction:column; overflow:hidden;">
                <span style="font-size:14px; font-weight:700; color:var(--primary-color);">全部品类</span>
                <span style="font-size:11px; color:#94a3b8; margin-top:2px;">查看大宗全量现货</span>
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
              <span style="font-size:10px; background:var(--primary-color); color:#fff; padding:2px 8px; border-radius:10px; font-weight:bold;">ALL</span>
              <span style="color:var(--primary-color); font-size:12px;">›</span>
            </div>
          </div>
      `;

      // Strictly limit categories to 5 items so total with '全部品类' is 6 items
      const categories = (MockData.productCategories || []).slice(0, 5);
      const catIcons = ['🔩', '🪵', '🧱', '🌾', '🍎'];

      categories.forEach((c, idx) => {
        const icon = catIcons[idx % catIcons.length];
        const childrenNames = c.children ? c.children.slice(0, 2).map(sub => sub.name).join(' / ') : '';
        const levelBadge = `<span style="font-size:10px; background:linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.2)); color:#059669; padding:2px 6px; border-radius:10px; font-weight:bold;">${c.children ? c.children.length + '个类目' : '热销'}</span>`;

        html += `
          <div class="home-cat-item" onclick="MallApp.goToSpotMarket('${c.id}')" style="display:flex; align-items:center; justify-content:space-between; padding:12px 18px; transition:all 0.2s; border-bottom:1px solid #f8fafc;">
            <div style="display:flex; align-items:center; gap:12px; overflow:hidden;">
              <span style="font-size:18px; width:26px; height:26px; border-radius:6px; background:#f1f5f9; display:flex; align-items:center; justify-content:center;">${icon}</span>
              <div style="display:flex; flex-direction:column; overflow:hidden;">
                <div style="display:flex; align-items:center; gap:6px;">
                  <span style="font-size:14px; font-weight:600; color:#1e293b;">${c.name}</span>
                </div>
                ${childrenNames ? `<span style="font-size:11px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${childrenNames}</span>` : ''}
              </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
              ${levelBadge}
              <span style="color:#cbd5e1; font-size:12px;">›</span>
            </div>
          </div>
        `;
      });

      html += `</div>`;
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

  doBannerSearch() {
    const type = document.getElementById('banner-search-type').value;
    const kw = document.getElementById('banner-search-keyword').value.trim();
    if (!kw) {
      UI.toast('请输入搜索关键词', 'warning');
      return;
    }
    const mainType = document.getElementById('search-type');
    const mainKw = document.getElementById('search-keyword');
    if (mainType) mainType.value = type;
    if (mainKw) mainKw.value = kw;
    this.doSearch();
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
        const target = item.dataset.target;
        items.forEach(i => i.classList.remove('active'));
        if (target && target.indexOf('ucenter') === -1 && target.indexOf('cart') === -1) {
          item.classList.add('active');
        }

        views.forEach(v => {
          v.classList.remove('active');
          if (v.id === target) v.classList.add('active');
        });

        if (target === 'mall-demand') {
          this.renderDemands();
        } else if (target === 'mall-bid') {
          this.renderBids();
        } else if (target === 'mall-spot') {
          this.renderProducts();
        }
      });
    });
  },

  // === 个人中心左侧菜单切换 ===
  initUCTabs() {
    const items = document.querySelectorAll('#uc-menu .uc-menu-item');
    const views = document.querySelectorAll('.uc-view');
    items.forEach(item => {
      item.addEventListener('click', () => {
        if (!item.dataset.target) return;
        items.forEach(i => i.classList.remove('active'));
        item.classList.add('active');

        views.forEach(v => {
          v.classList.remove('active');
          if (v.id === item.dataset.target) {
            v.classList.add('active');
            if (v.id === 'uc-cart') MallApp.renderCart();
            if (v.id === 'uc-bids') MallApp.renderUCBids();
            if (v.id === 'uc-orders') MallApp.renderUCOrders();
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
              <div class="flex gap-1 w-full">
                <button class="btn btn-primary btn-sm w-full" style="border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px; background: var(--primary-color); border-color: var(--primary-color); color: #fff;" onclick="MallApp.addToCart('${p.id}', parseInt(document.getElementById('qty-cat-${p.id}').value))">加入采购</button>
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
                <div class="flex gap-1 w-full">
                  <button class="btn btn-primary btn-sm w-full" style="border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px; background: var(--primary-color); border-color: var(--primary-color); color: #fff;" onclick="MallApp.addToCart('${p.id}', parseInt(document.getElementById('qty-home-${p.id}').value))">加入采购</button>
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
                <div class="flex gap-1 w-full">
                  <button class="btn btn-primary btn-sm w-full" style="border-radius: 4px; padding: 0 6px; height: 26px; font-size:11px; background: var(--primary-color); border-color: var(--primary-color); color: #fff;" onclick="MallApp.addToCart('${p.id}', parseInt(document.getElementById('qty-spot-${p.id}').value))">加入采购</button>
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
      const filteredShops = MockData.shops.filter(s => s.shopName.includes(kw) || s.companyName.includes(kw));
      if (filteredShops.length > 0) {
        document.querySelectorAll('.mall-view').forEach(v => v.classList.remove('active'));
        document.getElementById('mall-shops').classList.add('active');
        document.getElementById('shops-count-display').innerText = `共找到 ${filteredShops.length} 个相关店铺`;
        
        let html = '';
        filteredShops.forEach(s => {
          const avatarChar = s.avatar ? '' : s.shopName.charAt(0);
          const avatarHtml = s.avatar ? `<img src="${s.avatar}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid #fff;">` : `<div style="width: 48px; height: 48px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 20px; border: 2px solid #fff;">${avatarChar}</div>`;
          html += `
            <div class="card cursor-pointer hover:shadow-md transition-shadow" onclick="MallApp.goToShop('${s.id}', '${s.shopName}')" style="border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; background: #fff;">
              <div style="height: 80px; background: #f8fafc; background-image: url(${s.banner || 'https://images.unsplash.com/photo-1541888081-30d890632a7e?w=1200&h=300&fit=crop'}); background-size: cover; background-position: center;"></div>
              <div class="card-body flex gap-4 items-center" style="padding: 16px; position: relative; margin-top: -24px;">
                ${avatarHtml}
                <div class="flex-1" style="margin-top: 18px;">
                  <h4 class="font-bold text-base text-slate-800 m-0" style="margin: 0; font-size: 15px;">${s.shopName}</h4>
                  <div class="text-[10px] text-slate-400 mt-1">${s.companyName}</div>
                  <div class="text-xs text-slate-500 mt-1"><span class="tag tag-success text-[10px]" style="border-radius: 6px; padding: 2px 6px;">正常营业</span></div>
                </div>
              </div>
            </div>
          `;
        });
        document.getElementById('grid-search-shops').innerHTML = html;
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
      MockData.demands.slice(0, 4).forEach(d => { // 与竞价条数相同，均展示4条
        const goodsName = d.goodsName || d.title || '';
        const price = d.expectedPrice || '面议';
        dHtml += `
          <div class="product-card cursor-pointer" onclick="document.querySelector('.mall-nav-item[data-target=\\'mall-demand\\']').click()" style="margin: 12px; border-radius: 12px; box-shadow: none; border: 1px solid #f1f5f9;">
            <div class="product-info" style="padding: 12px 16px;">
              <div class="product-title" title="${goodsName}" style="font-size: 14px; font-weight: bold; color: #1e293b;">${goodsName}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span class="product-price" style="color: var(--danger-color); font-weight: 800; font-size: 14px;">${price}</span>
                <span style="font-size: 11px; color: #64748b; font-weight: 500;">${d.buyerName}</span>
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
      const bids = MockData.biddingAnnouncements.filter(b => b.auditStatus === '已通过' || !b.auditStatus).slice(0, 4); // 均展示4条
      let bHtml = '';
      bids.forEach(b => {
        let tag = b.status === 1 ? '<span class="tag tag-success text-[10px]" style="border-radius: 6px; padding: 2px 6px;">竞价中</span>' : '<span class="tag tag-secondary text-[10px]" style="border-radius: 6px; padding: 2px 6px;">已结束</span>';
        bHtml += `
          <div class="product-card cursor-pointer" onclick="MallApp.showBiddingDetail('${b.id}')" style="margin: 12px; border-radius: 12px; box-shadow: none; border: 1px solid #f1f5f9;">
            <div class="product-info" style="padding: 12px 16px;">
              <div class="product-title" title="${b.title}" style="font-size: 14px; font-weight: bold; color: #1e293b;">${b.title}</div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span class="product-price" style="color: var(--danger-color); font-weight: 800; font-size: 14px;">${b.currentMaxOffer || b.startPrice}</span>
                <div class="flex items-center gap-2">
                  <span style="font-size: 11px; color: #64748b; font-weight: 500;">${b.shopName}</span>
                  ${tag}
                </div>
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

    const showOnlyMy = document.getElementById('demand-filter-my')?.checked || false;
    const showOnlyJoined = document.getElementById('demand-filter-joined')?.checked || false;

    let html = '';
    let filtered = MockData.demands;

    if (showOnlyMy) {
      filtered = filtered.filter(d => d.buyerName === this.currentBuyerName);
    } else if (showOnlyJoined) {
      const myQuotes = MockData.demandQuotes.filter(q => q.quoterName === this.currentBuyerName);
      filtered = filtered.filter(d => myQuotes.some(q => q.demandId === d.id));
    }

    if (keyword) {
      filtered = filtered.filter(d => {
        const titleStr = d.goodsName || d.title || '';
        return titleStr.includes(keyword) || d.buyerName.includes(keyword);
      });
    }

    if (filtered.length === 0) {
      grid.innerHTML = '<div class="col-span-3 text-center py-12 text-secondary">暂无符合条件的求购意向</div>';
      return;
    }

    filtered.forEach(d => {
      let isMyDemand = d.buyerName === this.currentBuyerName;
      const myQuote = MockData.demandQuotes.find(q => q.demandId === d.id && q.quoterName === this.currentBuyerName);
      let isJoined = !!myQuote;
      let btn = '';
      let statusTag = '';
      let quotePriceHtml = '';

      const demandTitle = (d.goodsName || d.title || '').replace(/'/g, "\\'");
      const expectedPrice = d.expectedPrice || '面议';

      if (showOnlyJoined && isJoined) {
        if (myQuote.status === 1) {
          statusTag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">已采纳</span>`;
          btn = `<span class="tag tag-success" style="display:block; text-align:center; font-size:12px; padding:8px 8px; width:100%;">已采纳，请在线下执行订单合同</span>`;
        } else {
          statusTag = `<span class="tag tag-warning" style="background:#e6f7ff; color:#1890ff; border:1px solid #91d5ff; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">已报价</span>`;
          btn = `<button class="btn btn-primary" style="width:100%; height:36px; border-radius:8px; background:#9a66e4; border:none; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="MallApp.editMyQuote('${myQuote.id}')">修改报价</button>`;
        }
        quotePriceHtml = `<div>我的报价: <strong style="color:var(--danger-color);">${myQuote.price}</strong></div>`;
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
            btn = `<div style="display:flex; gap:12px; width:100%;">
                     <button class="btn btn-outline" style="flex:1; height:36px; border-radius:8px; border:1px solid #cbd5e1; color:#334155; font-size:13px; font-weight:500; cursor:pointer; background:#fff;" onclick="MallApp.cancelDemand('${d.id}')">下架</button>
                     <button class="btn btn-primary" style="flex:1; height:36px; border-radius:8px; background:linear-gradient(135deg, #9a66e4, #7e22ce); border:none; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="UI.showDemandQuotesModal('${d.id}', false, () => MallApp.renderDemands())">查看报价 (${quotesCount})</button>
                   </div>`;
          } else {
            btn = `<div style="display:flex; justify-content:center; align-items:center; height:36px; color:#94a3b8; font-size:13px; font-weight:500;">已下架</div>`;
          }
        } else {
          if (d.status === 2 || d.status === -1 || d.status === '已下架') {
            btn = `<div style="display:flex; justify-content:center; align-items:center; height:36px; color:#94a3b8; font-size:13px; font-weight:500;">已下架</div>`;
          } else {
            btn = `<button class="btn btn-primary" style="width:100%; height:36px; border-radius:8px; background:linear-gradient(135deg, #9a66e4, #7e22ce); border:none; color:#fff; font-size:13px; font-weight:bold; cursor:pointer;" onclick="MallApp.openQuoteModal('${d.id}')">立即报价</button>`;
          }
        }
      }

      const goodsName = d.goodsName || d.title;
      const buyerPhone = d.buyerPhone || '138****8818';
      const deliveryPeriod = d.deliveryPeriod || '2026-08-01 至 2026-08-15';

      html += `
        <div class="card product-card" style="border-radius:16px; border:1px solid #e5e7eb; background:#fff; box-shadow: 0 4px 20px rgba(0,0,0,0.02); display:flex; flex-direction:column; min-height: 220px; box-sizing:border-box;">
          <div class="card-body" style="padding:20px; display:flex; flex-direction:column; height:100%; box-sizing:border-box;">
            <!-- 头部：标题与状态 tag -->
            <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; gap:12px;">
              <h3 style="margin:0; font-size:16px; font-weight:bold; color:#0f172a; line-height:1.4; flex:1;" title="${goodsName}">求购货品: ${goodsName}</h3>
              <div style="flex-shrink:0;">${statusTag}</div>
            </div>

            <!-- 中间内容 (Flex 1 自动撑开，保证固定底部位置) -->
            <div style="flex:1; display:flex; flex-direction:column; gap:6px; font-size:13px; color:#64748b; line-height:1.5;">
              <div>买方账号: <span style="font-family:monospace; font-weight:bold; color:#0284c7;">${buyerPhone}</span> <span style="color:#64748b;">(${d.buyerName})</span></div>
              <div>交期范围: <span style="color:#1e293b; font-weight:500;">${deliveryPeriod}</span></div>
              <div>发布时间: <span style="color:#64748b;">${formatTimeSec(d.publishTime)}</span></div>
              ${quotePriceHtml}
            </div>
            <div style="margin-top:auto; padding-top:14px; border-top:1px dashed #f1f5f9;">
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

  cancelDemand(demandId) {
    const d = MockData.demands.find(x => x.id === demandId);
    if (d) {
      d.status = -1; // 已下架
      UI.toast('已下架该求购信息！', 'success');
      this.renderDemands();
    }
  },

  submitPublishDemand() {
    const goodsName = document.getElementById('pd-goods-name')?.value.trim() || '';
    const quantity = document.getElementById('pd-quantity')?.value.trim() || '50';
    const unit = document.getElementById('pd-unit')?.value || '吨';
    const deliveryPeriod = document.getElementById('pd-delivery-period')?.value.trim() || '';
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
      buyerName: this.currentBuyerName,
      buyerPhone: '138****8818',
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
    UI.closeModal('modal-publish-demand');
    if (document.getElementById('pd-goods-name')) document.getElementById('pd-goods-name').value = '';
    if (document.getElementById('pd-delivery-period')) document.getElementById('pd-delivery-period').value = '';
    this.renderDemands();
  },

  renderBids(keyword = '') {
    const grid = document.getElementById('grid-mall-bids');
    let html = '';
    let filtered = MockData.biddingAnnouncements.filter(b => b.auditStatus === '已通过' || !b.auditStatus);
    if (keyword) {
      filtered = filtered.filter(b => b.title.includes(keyword));
    }
    const statusVal = document.getElementById('bid-search-status')?.value || '';
    if (statusVal !== '') {
      if (statusVal === 'bidding') {
        filtered = filtered.filter(b => b.status === 0 || b.status === 1 || b.status === 2);
      } else if (statusVal === 'wait') {
        filtered = filtered.filter(b => b.status === 3);
      } else if (statusVal === 'ended') {
        filtered = filtered.filter(b => b.status === 4);
      }
    }
    filtered.forEach(b => {
      let tag = '';
      if (b.status === 0 || b.status === 1 || b.status === 2) {
        tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">竞价中</span>`;
      } else if (b.status === 3) {
        tag = `<span class="tag tag-warning" style="background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
      } else if (b.status === 4) {
        tag = `<span style="color:#94a3b8; font-size:12px; font-weight:500;">已结束</span>`;
      }

      let btnText = '竞价中';
      if (b.status === 1) btnText = '竞价中';
      else if (b.status === 3) btnText = '等待公布';
      else if (b.status === 4) btnText = '查看结果';

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
            <button class="btn btn-primary w-full" style="height: 36px; border-radius: 18px; font-size: 13px;" onclick="event.stopPropagation(); MallApp.showBiddingDetail('${b.id}')">${btnText}</button>
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

  _bidPhotoFile: null,

  showBiddingDetail(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;

    // UI steps: 看货报名(0) -> 现场看货(1) -> 参加竞价(2) -> 等待公布(3) -> 中标付款(4)
    let currentStep = b.status + 1; // status maps to index 0-4

    const steps = ['看货报名', '现场看货', '参加竞价', '等待公布', '中标付款'];
    let stepsHtml = '<div class="steps-container">';
    steps.forEach((name, index) => {
      let stateClass = '';
      if (index < b.status) stateClass = 'done';
      else if (index === b.status) stateClass = 'active';
      stepsHtml += `
        <div class="step-item ${stateClass}">
          <div class="step-circle">${index < b.status ? '✓' : (index + 1)}</div>
          <div class="step-title">${name}</div>
        </div>
      `;
    });
    stepsHtml += '</div>';

    // Build interactive action card
    let actionCardHTML = '';
    if (b.status === 0) {
      actionCardHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; box-sizing:border-box;">
          <h4 style="margin:0 0 8px 0; color:#0f172a; font-weight:bold;">📋 看货报名：</h4>
          <p style="margin:4px 0; font-size:12px; color:#64748b;">参与该大宗标的物拍卖前，您必须先在线报名，以获得线下看货及竞标资格。</p>
          <button class="btn btn-primary" style="margin-top:12px; height:36px; border-radius:18px;" onclick="MallApp.signUpForBiddingInspection('${b.id}')">立即报名看货</button>
        </div>
      `;
    } else if (b.status === 1) {
      actionCardHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; box-sizing:border-box;">
          <h4 style="margin:0 0 8px 0; color:#0f172a; font-weight:bold;">📸 现场看货核验：</h4>
          <p style="margin:4px 0; font-size:12px; color:#64748b;">为防范虚假交易，您必须亲临货物现场上传实勘自拍或场地照片证明以进行验真。</p>
          <div style="margin-top:12px; position:relative; border:2px dashed #cbd5e1; border-radius:8px; padding:16px; text-align:center; cursor:pointer; background:#fff; transition:all 0.2s;" onmouseover="this.style.borderColor='#1677ff';this.style.background='#f0f7ff'" onmouseout="this.style.borderColor='#cbd5e1';this.style.background='#fff'" onclick="document.getElementById('bid-photo-picker').click()">
            <div style="font-size:20px; margin-bottom:4px;">📁</div>
            <div id="bid-photo-text" style="font-size:12px; color:#475569; font-weight:bold;">点击选择或拖拽上传现场照片 (PNG/JPG)</div>
            <input type="file" id="bid-photo-picker" accept="image/*" style="display:none;" onchange="MallApp.handleBidPhotoSelected(this)">
          </div>
          <div id="bid-photo-card" style="display:none; align-items:center; justify-content:space-between; margin-top:10px; padding:8px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:6px; font-size:12px; color:#15803d; box-sizing:border-box;">
            <span id="bid-photo-name" style="font-weight:bold;"></span>
            <span style="cursor:pointer; color:#ef4444; font-weight:bold;" onclick="event.stopPropagation(); MallApp.clearBidPhoto()">删除</span>
          </div>
          <button id="bid-photo-submit-btn" class="btn btn-primary" style="margin-top:12px; background:#cbd5e1; cursor:not-allowed; border:none; height:36px; border-radius:18px;" disabled onclick="MallApp.submitBidPhoto('${b.id}')">确认看货并进入下一步</button>
        </div>
      `;
    } else if (b.status === 2) {
      actionCardHTML = `
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; box-sizing:border-box;">
          <h4 style="margin:0 0 8px 0; color:#0f172a; font-weight:bold;">⚖️ 录入竞出价：</h4>
          <p style="margin:4px 0; font-size:12px; color:#64748b;">您已具备竞买资格，请输入您的正式竞拍价。</p>
          <div style="margin-top:12px; display:flex; gap:10px;">
            <input type="number" id="bid-price-input" placeholder="输入报价金额 (元)" class="form-control" style="flex:1; height:36px; border-radius:18px; font-family:monospace; font-weight:bold; font-size:14px; padding: 0 16px;" min="${parseFloat(b.startPrice.replace(/[^\d\.]/g, ''))}">
            <button class="btn btn-primary" style="height:36px; border-radius:18px; padding:0 24px;" onclick="MallApp.submitBidPrice('${b.id}')">提交报价</button>
          </div>
          <p style="margin:6px 0 0 0; font-size:11px; color:#94a3b8;">* 起拍价为 ${b.startPrice}，您的出价不能低于当前最高出价</p>
        </div>
      `;
    } else if (b.status === 3) {
      const myOffersForBid = MockData.biddingOffers.filter(o => o.bidId === b.id && o.buyerName === (this.currentBuyerName || '万通建材采购部'));
      let myLastOfferHtml = '';
      if (myOffersForBid.length > 0) {
        myLastOfferHtml = `<p style="margin:4px 0; font-size:12px; color:#15803d;"><strong>您的已登记出价：</strong>${myOffersForBid[0].offerPrice}</p>`;
      }
      actionCardHTML = `
        <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; box-sizing:border-box; color:#15803d;">
          <h4 style="margin:0 0 6px 0; font-weight:bold; font-size:14px;">⏳ 等待商户定标公布中</h4>
          ${myLastOfferHtml}
          <p style="margin:4px 0; font-size:11px; color:#64748b;">商户正在评审出价，即将公布中标结果。请耐心等待...</p>
          <div style="background:#dcfce7; border-radius:6px; padding:8px 12px; font-size:11px; color:#15803d; margin-top:8px;">
            ⚠️ 该阶段已无法再次加价，请等待官方公布定标结果。
          </div>
        </div>
      `;
    } else if (b.status === 4) {
      if (b.winner === (this.currentBuyerName || '万通建材采购部')) {
        actionCardHTML = `
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; color:#15803d; box-sizing:border-box;">
            <h4 style="margin:0 0 6px 0; font-weight:bold; font-size:14px;">🏆 恭喜您中标该项目！</h4>
            <p style="margin:0 0 12px 0; font-size:12px;">商户已选定您为最终买受人，成交金额：<strong style="color:#ef4444; font-size:14px;">${b.currentMaxOffer}</strong>。请立即前往“个人中心 - 我的订单”进行电子合同签署及打款付款履约流程。</p>
            <button class="btn btn-primary" style="height:36px; border-radius:18px; padding:0 20px;" onclick="UI.closeModal('modal-bidding-detail'); document.querySelector('.uc-menu-item[data-target=\\'uc-orders\\']').click();">去订单中心处理</button>
          </div>
        `;
      } else {
        actionCardHTML = `
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; color:#64748b; box-sizing:border-box;">
            <h4 style="margin:0 0 6px 0; font-weight:bold; font-size:14px; color:#0f172a;">竞价已结束</h4>
            <p style="margin:0; font-size:12px;">本次项目已结标。中标人：<strong>${b.winner}</strong> | 最终成交价：<strong style="color:#ef4444;">${b.currentMaxOffer}</strong></p>
          </div>
        `;
      }
    }

    const modalBody = document.getElementById('bidding-detail-body');
    if (modalBody) {
      modalBody.innerHTML = `
        <div class="flex gap-4 mb-4">
          <img src="${b.image}" style="width: 260px; height: 180px; object-fit: cover; border-radius: 8px; flex-shrink:0;">
          <div style="flex:1;">
            <h2 class="text-xl font-bold mb-2">${b.title}</h2>
            <p class="text-secondary mb-2" style="font-size:12px;">处置商家: <strong>${b.shopName}</strong> <span class="text-xs text-gray-400 bg-gray-100 px-1 rounded ml-1">No.${b.shopId}</span></p>
            <p class="text-secondary mb-2" style="font-size:12px;">起拍底价: <span class="text-danger font-bold text-lg">${b.startPrice}</span></p>
            <p class="text-secondary mb-2" style="font-size:12px;">当前最高出价: <span class="text-danger font-bold text-lg">${b.currentMaxOffer}</span></p>
            <p class="text-secondary mb-4" style="font-size:12px;">截止时间: ${b.bidEndTime}</p>
          </div>
        </div>
        
        ${actionCardHTML}

        <div class="mt-6 border-t pt-4">
          <h3 class="font-bold mb-3" style="font-size:14px; color:#0f172a;">当前竞价流转节点</h3>
          ${stepsHtml}
        </div>
      `;
      UI.showModal('modal-bidding-detail');
    }
  },

  signUpForBiddingInspection(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    b.status = 1;
    UI.toast('报名成功！已为您开启现场看货核验通道。', 'success');
    this.showBiddingDetail(id);
    this.renderBids();
  },

  handleBidPhotoSelected(input) {
    const file = input.files[0];
    if (!file) return;
    this._bidPhotoFile = file;
    document.getElementById('bid-photo-name').innerText = `📸 ${file.name}`;
    document.getElementById('bid-photo-card').style.display = 'flex';
    
    const submitBtn = document.getElementById('bid-photo-submit-btn');
    if (submitBtn) {
      submitBtn.style.background = '#1677ff';
      submitBtn.style.cursor = 'pointer';
      submitBtn.disabled = false;
    }
    UI.toast('现场照片选择成功，请点击提交！', 'success');
  },

  clearBidPhoto() {
    this._bidPhotoFile = null;
    document.getElementById('bid-photo-picker').value = '';
    document.getElementById('bid-photo-card').style.display = 'none';
    
    const submitBtn = document.getElementById('bid-photo-submit-btn');
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
    UI.toast('现场实勘自拍验真通过！竞价出价通道已开启。', 'success');
    this.showBiddingDetail(id);
    this.renderBids();
  },

  submitBidPrice(id) {
    const b = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!b) return;
    
    const inputEl = document.getElementById('bid-price-input');
    if (!inputEl) return;
    
    const offerPriceVal = parseFloat(inputEl.value);
    const startPriceVal = parseFloat(b.startPrice.replace(/[^\d\.]/g, ''));
    const maxOfferVal = b.currentMaxOffer === '-' ? 0 : parseFloat(b.currentMaxOffer.replace(/[^\d\.]/g, ''));
    const minRequired = Math.max(startPriceVal, maxOfferVal);

    if (isNaN(offerPriceVal) || offerPriceVal <= minRequired) {
      UI.toast(`出价必须高于当前最高价 (当前最小出价要求: ¥${minRequired.toLocaleString()})`, 'error');
      return;
    }

    const offerPriceStr = '¥' + offerPriceVal.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    
    MockData.biddingOffers.unshift({
      id: 'OFR' + Math.floor(1000 + Math.random() * 9000),
      bidId: id,
      buyerName: this.currentBuyerName || '万通建材采购部',
      offerPrice: offerPriceStr,
      time: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: 0
    });

    b.currentMaxOffer = offerPriceStr;
    b.status = 3;

    UI.toast(`出价成功！金额 ${offerPriceStr} 已登记，请等待公布结果。`, 'success');
    this.showBiddingDetail(id);
    this.renderBids();
    this.renderUCBids();
  },

  openQuoteModal(demandId) {
    this.currentQuoteDemandId = demandId;
    this.editingQuoteId = null;

    const d = MockData.demands.find(x => x.id === demandId);
    const name = d ? (d.goodsName || d.title || '采购项目') : '采购项目';

    const titleEl = document.getElementById('quote-prod-name');
    if (titleEl) titleEl.innerText = name;

    // Reset inputs
    document.getElementById('quote-price').value = '';

    UI.openModal('modal-quote');
  },

  submitQuote() {
    const priceVal = document.getElementById('quote-price').value.trim();

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
      // Add to MockData.demandQuotes
      const newQuote = {
        id: 'QT' + (MockData.demandQuotes.length + 1).toString().padStart(3, '0'),
        demandId: this.currentQuoteDemandId,
        shopId: 'S001',
        shopName: '万通建材 (报价主体)',
        price: priceFormatted,
        time: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: 0,
        quoterName: this.currentBuyerName || '万通建材采购部'
      };

      MockData.demandQuotes.push(newQuote);
      UI.toast('报价提交成功！等待采购商联系。', 'success');
    }

    UI.closeModal('modal-quote');
    this.renderDemands();
  },

  editMyQuote(quoteId) {
    const q = MockData.demandQuotes.find(x => x.id === quoteId);
    if (!q) return;
    const d = MockData.demands.find(x => x.id === q.demandId);
    const goodsName = d ? (d.goodsName || d.title) : '采购意向项目';

    this.currentQuoteDemandId = q.demandId;
    this.editingQuoteId = quoteId; // 标记正在编辑的报价 ID

    const nameEl = document.getElementById('quote-prod-name');
    const priceEl = document.getElementById('quote-price');
    if (nameEl) nameEl.innerText = goodsName + ' (修改现有报价)';
    if (priceEl) priceEl.value = q.price;

    UI.openModal('modal-quote');
  },

  toggleChatForm(type) {
    const form = document.getElementById('chat-interactive-form');
    const inq = document.getElementById('form-inquiry-fields');
    const qte = document.getElementById('form-quote-fields');
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
    const chatBox = document.getElementById('chat-messages');
    if (!chatBox) return;
    document.getElementById('chat-interactive-form').style.display = 'none';

    let contentHtml = '';
    let toastMsg = '';

    if (type === 'inquiry') {
      const qty = document.getElementById('inq-qty').value || '100';
      const unit = document.getElementById('inq-unit').value || '吨';
      contentHtml = `
        <div style="padding: 4px 0; font-size: 13px;">
          <strong style="color: #1d4ed8; display: block; margin-bottom: 4px;">💬 【采购意向询价】</strong>
          <div>意向数量：<span style="font-weight: bold;">${qty} ${unit}</span></div>
          <div style="font-size: 11px; color: #64748b; margin-top: 4px;">您好，我想咨询购买上述数量的最低批发价格及交期，请商家报价。</div>
        </div>
      `;
      toastMsg = '询价卡片已发出';
    } else if (type === 'quote') {
      const price = document.getElementById('quote-price').value || '4150';
      const qty = document.getElementById('quote-qty').value || '50';
      const unit = document.getElementById('quote-unit').value || '吨';
      const qType = document.getElementById('quote-type').value || '现货直销报价';
      contentHtml = `
        <div style="padding: 4px 0; font-size: 13px; color:#15803d;">
          <strong style="color: #15803d; display: block; margin-bottom: 6px;">💰 【大宗成交报价单】</strong>
          <div style="font-size: 11px; background: #e8f5e9; padding: 2px 6px; border-radius: 4px; display: inline-block; margin-bottom: 6px;">类型: ${qType}</div>
          <div>成交单价：<span style="font-weight: bold; font-size: 14px; color: #15803d;">¥${price} / ${unit}</span></div>
          <div>可供数量：<span style="font-weight: bold;">${qty} ${unit}</span></div>
          <button class="btn btn-primary btn-sm mt-2" onclick="MallApp.acceptChatQuote('${price}', '${qty}')" style="background:#15803d; border:none; padding:4px 10px; font-size:11px; border-radius:4px; color:#fff; cursor:pointer; width:100%; display:block; margin-top:8px;">接受报价并一键签约</button>
        </div>
      `;
      toastMsg = '成交报价单已发送';
    }

    // Append user message
    const msgDiv = document.createElement('div');
    msgDiv.className = 'flex gap-3 justify-end';
    msgDiv.innerHTML = `
      <div class="p-3 rounded shadow-sm text-sm" style="max-width: 75%; border-radius: 16px 0 16px 16px; background: ${type === 'quote' ? '#f0fdf4' : '#eff6ff'}; color: #334155; border: 1px solid ${type === 'quote' ? '#bbf7d0' : '#bfdbfe'}; line-height: 1.5; text-align: left;">
        ${contentHtml}
      </div>
      <div class="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center text-xs flex-shrink-0">我</div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;

    UI.toast(toastMsg + '，已同步至园区信道', 'success');

    // Simulate merchant response
    setTimeout(() => {
      const respDiv = document.createElement('div');
      respDiv.className = 'flex gap-3';
      let respText = '';
      if (type === 'inquiry') {
        respText = `收到您的询价！针对 ${document.getElementById('inq-qty').value} ${document.getElementById('inq-unit').value} 的采购意向，我们给予的最低批发优惠价是：**¥3950/吨**。您可以点击下方“发起报价”并输入单价和数量发送成交单，我方将予以确认。`;
      } else {
        respText = '收到您的报价成交单！我方已核对资源排期与货源，您可以点击报价单内的“接受报价并一键签约”带入此条款生成正式园区大宗电子合同。';
      }
      respDiv.innerHTML = `
        <div class="w-8 h-8 rounded-full bg-slate-300 text-slate-600 flex items-center justify-center text-xs flex-shrink-0 font-bold shadow-sm">店</div>
        <div class="bg-white p-3 text-slate-700 shadow-sm border border-slate-100" style="max-width: 75%; border-radius: 4px 18px 18px 18px; line-height: 1.5; font-size:13px; text-align:left;">
          ${respText}
        </div>
      `;
      chatBox.appendChild(respDiv);
      chatBox.scrollTop = chatBox.scrollHeight;
    }, 1200);
  },

  acceptChatQuote(price, qty) {
    const prodName = document.getElementById('chat-prod-title').innerText || '大宗交易物资';
    const amountVal = parseFloat(price) * parseFloat(qty);
    const amountStr = '¥' + amountVal.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2});
    const orderId = 'O' + Math.floor(1000 + Math.random() * 9000);
    
    const newOrder = {
      id: orderId,
      shopId: 'S001',
      shopName: document.getElementById('chat-shop-name').innerText.replace('与', '').replace('安全沟通', '') || '丰收粮油直营店',
      buyerName: this.currentBuyerName || '远大筑建采购部',
      productName: `${prodName} (成交: ${qty})`,
      amount: amountStr,
      status: 0,
      type: '现货单',
      time: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    MockData.orders.unshift(newOrder);
    UI.closeModal('modal-chat');
    UI.toast(`成功接受报价！已生成签约订单 ${orderId}`, 'success');
    this.renderUCOrders();
    document.querySelector('.mall-nav-item[data-target="mall-uc"]').click();
  },

  // === 个人中心渲染 ===
  renderUCOrders() {
    const tbody = document.querySelector('#table-uc-orders tbody');
    let html = '';
    MockData.orders.filter(o => o.buyerName === this.currentBuyerName).forEach(o => {
      let statusTag = '';
      let actBtn = '';
      if (o.status === 0) {
        statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待买家签约</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MallApp.signContract('${o.id}')">签署合同(盖章)</button>
                  <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '买家', '${this.currentBuyerName}', () => MallApp.renderUCOrders())">取消</button>`;
      } else if (o.status === 4) {
        statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#d46b08; border:1px solid #ffd591;">待付款</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="UI.showPaymentModal('${o.id}', () => MallApp.renderUCOrders())">确认付款</button>
                  <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '买家', '${this.currentBuyerName}', () => MallApp.renderUCOrders())">取消</button>`;
      } else if (o.status === 5) {
        statusTag = `<span class="tag tag-warning" style="background:#fff0f6; color:#c41d7f; border:1px solid #ffd6e7;">待卖家签约</span>`;
        actBtn = `<button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '买家', '${this.currentBuyerName}', () => MallApp.renderUCOrders())">取消</button>`;
      } else if (o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        actBtn = '';
      } else if (o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #0958d9; background: #e6f4ff;">待签收</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MallApp.confirmBuyerReceipt('${o.id}')">确认收货</button>`;
      } else if (o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
        actBtn = !o.invoiceApplied 
          ? `<button class="btn btn-primary btn-sm" onclick="MallApp.applyInvoice('${o.id}')">申请发票</button>`
          : '';
      } else if (o.status === -1) {
        statusTag = `<span class="tag tag-danger" style="background:#fff1f0; color:#ef4444; border:1px solid #ffa39e;">已取消</span>`;
        actBtn = '';
      } else if (o.status === -2) {
        statusTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#64748b; border:1px solid #d9d9d9;">已关闭</span>`;
        actBtn = '';
      }
      html += `
        <tr>
          <td><a href="javascript:void(0)" onclick="MallApp.showOrderDetail('${o.id}')" style="font-weight:bold; color:var(--primary-color);">${o.id}</a></td>
          <td>${o.productName}</td>
          <td>
            <div>${o.shopName}</div>
            <div class="text-xs text-gray-400 bg-gray-100 px-1 rounded inline-block mt-1">No.${o.shopId}</div>
          </td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${statusTag}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${actBtn}
              <button class="btn btn-text btn-sm" onclick="MallApp.showOrderDetail('${o.id}')">详情</button>
            </div>
          </td>
        </tr>
      `;
    });
    if (tbody) tbody.innerHTML = html;
  },

  confirmBuyerReceipt(orderId) {
    const o = MockData.orders.find(x => x.id === orderId);
    if (o) {
      o.status = 3;
      UI.toast(`订单 ${orderId} 确认收货成功！交易已完成`, 'success');
      this.renderUCOrders();
      if (document.getElementById('uc-order-detail')?.classList.contains('active')) {
        this.showOrderDetail(orderId);
      }
    }
  },

  showUCTab(targetId) {
    const items = document.querySelectorAll('#uc-menu .uc-menu-item');
    const views = document.querySelectorAll('.uc-view');
    views.forEach(v => {
      v.classList.remove('active');
      v.style.display = 'none';
    });
    const targetView = document.getElementById(targetId);
    if (targetView) {
      targetView.classList.add('active');
      targetView.style.display = 'block';
    }
    items.forEach(i => {
      i.classList.remove('active');
      if (i.dataset.target === targetId || (targetId === 'uc-order-detail' && i.dataset.target === 'uc-orders')) {
        i.classList.add('active');
      }
    });
  },

  showOrderDetail(orderId) {
    // 1. 保证处于个人中心页面
    const pageUc = document.getElementById('page-user-center');
    if (pageUc && !pageUc.classList.contains('active')) {
      document.querySelectorAll('.mall-view').forEach(v => v.classList.remove('active'));
      pageUc.classList.add('active');
    }

    // 2. 切换至订单详情视图 uc-order-detail
    this.showUCTab('uc-order-detail');

    // 3. 寻找订单数据
    let o = MockData.orders.find(x => x.id === orderId);
    if (!o) {
      o = {
        id: orderId,
        productName: 'Q345B 槽钢 50吨',
        shopName: '远大钢铁官方直营店',
        shopId: 'S001',
        buyerName: '张三 (万通建材采购部)',
        buyerPhone: '138****8818',
        amount: '¥ 207,500.00',
        status: 2,
        createTime: '2026-07-07 10:15:00',
        typeStr: '现货交易订单',
        contractNo: 'HT-20260707-8891'
      };
    }

    // 4. 填充头部与基本信息
    const idEl = document.getElementById('pc-detail-order-id');
    if (idEl) idEl.innerText = o.id;
    const typeEl = document.getElementById('pc-detail-type-tag');
    if (typeEl) typeEl.innerText = o.orderType || '现货交易订单';
    const timeEl = document.getElementById('pc-detail-create-time');
    if (timeEl) timeEl.innerText = o.createTime || '2026-07-07 10:15:00';
    const payEl = document.getElementById('pc-detail-pay-method');
    if (payEl) payEl.innerText = o.payMethod || '线上担保支付 (托管账户)';
    const contractEl = document.getElementById('pc-detail-contract-no');
    if (contractEl) contractEl.innerText = o.contractNo || ('HT-' + o.id);

    // 渲染合同模块 (最多支持10张合同附件)
    const contractWrapper = document.getElementById('pc-detail-contract-wrapper');
    if (contractWrapper) {
      if (o.status === 0 || o.status === 5) {
        contractWrapper.innerHTML = `
          <div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px; background:#f8fafc; border-radius:8px; border:1px dashed #e2e8f0;">
            ⏳ 双方电子签约尚未完成，暂无可预览合同。
          </div>
        `;
      } else {
        const contractNo = o.contractNo || ('HT-' + o.id);
        const contractImages = (o.contractImages || [
          { label: '1. 主交易合同 (买家盖章联)', name: '《大宗物资买卖交易主合同》- 买家CA签署联', type: 'contract' },
          { label: '2. 主交易合同 (卖家盖章联)', name: '《大宗物资买卖交易主合同》- 卖家CA签署联', type: 'contract' },
          { label: '3. 货品质量验收标准附件', name: '《大宗商品质量检验与交付验收约定表》', type: 'contract' },
          { label: '4. CA数字证书签署存证', name: '《国家CA中心数字证书签署存证证明》', type: 'contract' }
        ]).slice(0, 10);

        contractWrapper.innerHTML = `
          <div style="margin-bottom:8px; font-size:12px; color:#64748b; font-weight:bold;">📄 已存档电子合同附件 (${contractImages.length}/10 份)：</div>
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
            ${contractImages.map((img, i) => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 14px; background:#f8fafc; border-radius:8px; border:1px solid #e2e8f0;">
                <span style="font-weight:bold; color:#1e293b; font-size:12px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;" title="${img.label}">${img.label}</span>
                <button class="btn btn-outline btn-xs" id="pc-detail-preview-contract-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:11px; flex-shrink:0;">【预览】</button>
              </div>
            `).join('')}
          </div>
        `;
        contractImages.forEach((img, i) => {
          const btn = document.getElementById(`pc-detail-preview-contract-btn-${i}`);
          if (btn) btn.onclick = () => UI.previewDocument(img.name, img.type, contractNo, o.amount, o.buyerName, o.shopName);
        });
      }
    }

    // 5. 填充买家与收货物流
    const rName = document.getElementById('pc-detail-receiver-name');
    if (rName) rName.innerText = o.buyerName || '张三';
    const rPhone = document.getElementById('pc-detail-receiver-phone');
    if (rPhone) rPhone.innerText = o.buyerPhone || '138****8818';
    const rAddr = document.getElementById('pc-detail-receiver-addr');
    if (rAddr) rAddr.innerText = o.address || '浙江省杭州市萧山区大宗仓储物流园区5号仓库';
    const lComp = document.getElementById('pc-detail-logistics-comp');
    if (lComp) lComp.innerText = o.logisticsComp || '顺丰专车大宗运输';
    const lNo = document.getElementById('pc-detail-logistics-no');
    if (lNo) lNo.innerText = o.waybillNo || 'SF1480928120';

    // 6. 填充卖家信息
    const sName = document.getElementById('pc-detail-shop-name');
    if (sName) sName.innerText = o.shopName || '远大钢铁官方直营店';
    const sAvatar = document.getElementById('pc-detail-shop-avatar');
    if (sAvatar) sAvatar.innerText = (o.shopName || '商').charAt(0);

    // 7. 状态 Banner 与 6步流程进度条
    const statusMap = {
      0: { title: '当前状态：待买家签约', desc: '合同已由卖家发起，请尽快确认合同条款并完成电子签章。', step: 0, tag: 'tag-warning' },
      5: { title: '当前状态：待卖家签约', desc: '您已完成合同签章，正在等待卖家确认盖章。', step: 1, tag: 'tag-warning' },
      4: { title: '当前状态：待买家付款', desc: '合同双签成功，请将款项支付至平台监管托管账户。', step: 2, tag: 'tag-secondary' },
      1: { title: '当前状态：买家已付款 (待卖家发货)', desc: '资金已入托管账户，商家正在调配货品安排装车配送。', step: 3, tag: 'tag-primary' },
      2: { title: '当前状态：卖家已发货 (待买家确认收货)', desc: '货品已由专车运往指定仓储地点，请收货后及时核对质量并确认收货。', step: 4, tag: 'tag-info' },
      3: { title: '当前状态：交易已完结 (已成功收货)', desc: '买家已确认收货，托管资金已打入卖家账户，交易圆满完成！', step: 5, tag: 'tag-success' },
      '-1': { title: '当前状态：订单已关闭', desc: '该订单已被取消或超期关闭。', step: 0, tag: 'tag-danger' }
    };

    const st = statusMap[o.status] || statusMap[2];
    const sTitle = document.getElementById('pc-detail-status-title');
    if (sTitle) sTitle.innerText = st.title;
    const sDesc = document.getElementById('pc-detail-status-desc');
    if (sDesc) sDesc.innerText = st.desc;

    // 顶部操作按钮
    const topActionsEl = document.getElementById('pc-detail-top-actions');
    if (topActionsEl) {
      let actionHtml = '';
      if (o.status === 2) {
        actionHtml += `<button class="btn btn-primary" onclick="MallApp.confirmBuyerReceipt('${o.id}')" style="border-radius:20px; padding:8px 24px; font-weight:bold;">确认收货</button>`;
      } else if (o.status === 4) {
        actionHtml += `<button class="btn btn-primary" onclick="UI.showPaymentModal('${o.id}', () => MallApp.switchOrderDetailStatus('${o.id}', 1))" style="border-radius:20px; padding:8px 24px; font-weight:bold;">去付款</button>`;
      } else if (o.status === 0) {
        actionHtml += `<button class="btn btn-primary" onclick="UI.showContractSigningModal('${o.id}', false, () => MallApp.switchOrderDetailStatus('${o.id}', 4))" style="border-radius:20px; padding:8px 24px; font-weight:bold;">确认签约合同</button>`;
      }
      actionHtml += `<button class="btn btn-outline" onclick="UI.toast('电子合同已调起下载', 'info')" style="border-radius:20px; padding:8px 16px;">下载电子合同</button>`;
      topActionsEl.innerHTML = actionHtml;
    }

    // 渲染 6步流程图
    const steps = ['提交订单', '双方签约', '托管付款', '商家发货', '确认收货', '交易完结'];
    const currentStepIndex = st.step;
    const stepsContainer = document.getElementById('pc-detail-steps');
    if (stepsContainer) {
      let stepHtml = '';
      steps.forEach((stepName, sIdx) => {
        const isDone = sIdx <= currentStepIndex;
        const isCurrent = sIdx === currentStepIndex;
        const circleStyle = isDone 
          ? 'background:var(--primary-color); color:#fff; font-weight:bold; border-color:var(--primary-color);'
          : 'background:#f1f5f9; color:#94a3b8; border:1px solid #cbd5e1;';
        const labelStyle = isCurrent
          ? 'color:var(--primary-color); font-weight:bold;'
          : (isDone ? 'color:#0f172a;' : 'color:#94a3b8;');
        
        stepHtml += `
          <div style="display:flex; flex-direction:column; align-items:center; z-index:2; position:relative; flex:1;">
            <div style="width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:13px; margin-bottom:6px; ${circleStyle}">
              ${isDone ? (sIdx < currentStepIndex ? '✓' : sIdx + 1) : sIdx + 1}
            </div>
            <div style="font-size:12px; ${labelStyle}">${stepName}</div>
          </div>
        `;
      });
      stepsContainer.innerHTML = stepHtml;
    }

    // 渲染商品明细
    const goodsTbody = document.getElementById('pc-detail-goods-tbody');
    if (goodsTbody) {
      const imgUrl = o.image || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80';
      goodsTbody.innerHTML = `
        <tr>
          <td style="padding:14px 12px;">
            <img src="${imgUrl}" style="width:50px; height:50px; border-radius:6px; object-fit:cover; border:1px solid #e2e8f0;">
          </td>
          <td style="padding:14px 12px;">
            <div style="font-weight:bold; color:#0f172a; font-size:14px;">${o.productName}</div>
            <div style="font-size:11px; color:#64748b; margin-top:2px;">标准大宗批次规格 | 提供材质质保书</div>
          </td>
          <td style="padding:14px 12px; text-align:right; font-weight:bold; color:#334155;">${o.priceStr || '¥4,150.00 / 吨'}</td>
          <td style="padding:14px 12px; text-align:center; font-weight:bold; color:#0f172a;">${o.qty || '50 吨'}</td>
          <td style="padding:14px 12px; text-align:right; font-weight:bold; color:#ef4444; font-size:14px;">${o.amount}</td>
        </tr>
      `;
    }

    // 金额汇总
    const subtotalEl = document.getElementById('pc-detail-subtotal-price');
    if (subtotalEl) subtotalEl.innerText = o.amount;
    const totalEl = document.getElementById('pc-detail-total-amount');
    if (totalEl) totalEl.innerText = o.amount;

    // 渲染付款凭证 (最多支持5张凭证附件)
    const voucherCard = document.getElementById('pc-detail-payment-voucher-card');
    if (voucherCard) {
      const voucherTitle = `<h3 class="text-base font-bold mb-3" style="color:#0f172a; display:flex; align-items:center; gap:8px; margin:0 0 12px 0;">
        <span style="width:4px; height:16px; background:#10b981; border-radius:2px; display:inline-block;"></span>
        支付凭证与资金托管存证
      </h3>`;
      if (o.status === 0 || o.status === 5 || o.status === 4) {
        voucherCard.style.display = 'none';
      } else {
        voucherCard.style.display = 'block';
        const voucherNo = o.paymentVoucher || ('TXN-PAY-' + o.id);
        const voucherImages = (o.voucherImages || [
          { label: '1. 银行对公转账电子回单', name: '《中国工商银行电子对公转账汇款单》', type: 'voucher' },
          { label: '2. 平台托管账户资金划转凭单', name: '《平台合规托管账户资金划转确认函》', type: 'voucher' },
          { label: '3. 财务对账清算划转凭据', name: '《交易货款清算划划拨款凭单》', type: 'voucher' }
        ]).slice(0, 5);

        voucherCard.innerHTML = voucherTitle + `
          <div style="margin-bottom:8px; font-size:12px; color:#64748b; font-weight:bold;">💳 已上传支付凭证附件 (${voucherImages.length}/5 份)：</div>
          <div style="display:flex; flex-direction:column; gap:8px;">
            ${voucherImages.map((vImg, i) => `
              <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 14px; background:#f0fdf4; border-radius:8px; border:1px solid #bbf7d0;">
                <span style="font-weight:bold; color:#166534; font-size:12px;">${vImg.label}</span>
                <button class="btn btn-outline btn-xs" id="pc-detail-preview-voucher-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:11px; color:#166534; border-color:#bbf7d0; background:#fff;">【预览】</button>
              </div>
            `).join('')}
          </div>
        `;
        voucherImages.forEach((vImg, i) => {
          const btn = document.getElementById(`pc-detail-preview-voucher-btn-${i}`);
          if (btn) btn.onclick = () => UI.previewDocument(vImg.name, vImg.type, voucherNo, o.amount, o.buyerName, o.shopName);
        });
      }
    }



    // 状态调试切换器
    const switchersContainer = document.getElementById('pc-detail-status-switchers');
    if (switchersContainer) {
      switchersContainer.innerHTML = `
        <button class="btn btn-outline btn-xs" onclick="MallApp.switchOrderDetailStatus('${o.id}', 0)">切为待签约</button>
        <button class="btn btn-outline btn-xs" onclick="MallApp.switchOrderDetailStatus('${o.id}', 4)">切为待付款</button>
        <button class="btn btn-outline btn-xs" onclick="MallApp.switchOrderDetailStatus('${o.id}', 1)">切为待发货</button>
        <button class="btn btn-outline btn-xs" onclick="MallApp.switchOrderDetailStatus('${o.id}', 2)">切为待收货</button>
        <button class="btn btn-outline btn-xs" onclick="MallApp.switchOrderDetailStatus('${o.id}', 3)">切为已完结</button>
      `;
    }
  },

  switchOrderDetailStatus(orderId, newStatus) {
    const o = MockData.orders.find(x => x.id === orderId);
    if (o) {
      o.status = newStatus;
      UI.toast(`[演示] 订单状态已切换为: ${newStatus}`, 'info');
      this.showOrderDetail(orderId);
      this.renderUCOrders();
    }
  },

  signContract(orderId) {
    UI.showContractSigningModal(orderId, false, () => this.renderUCOrders());
  },

  applyInvoice(orderId) {
    UI.showInvoiceModal(orderId, () => {
      this.renderUCOrders();
    });
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

  _msgTab: 'spot',

  switchMsgTab(tab) {
    this._msgTab = tab;
    const btnSpot = document.getElementById('btn-msg-tab-spot');
    const btnDemand = document.getElementById('btn-msg-tab-demand');
    if (tab === 'spot') {
      btnSpot?.classList.remove('btn-outline');
      btnSpot?.classList.add('btn-primary');
      btnDemand?.classList.remove('btn-primary');
      btnDemand?.classList.add('btn-outline');
    } else {
      btnDemand?.classList.remove('btn-outline');
      btnDemand?.classList.add('btn-primary');
      btnSpot?.classList.remove('btn-primary');
      btnSpot?.classList.add('btn-outline');
    }
    this.renderUCMessages();
  },

  renderUCMessages() {
    const list = document.getElementById('uc-messages-list');
    if (!list) return;

    let html = '';
    if (this._msgTab === 'spot') {
      const mockChats = [
        {
          shopName: '特钢新材料厂直营店',
          prodTitle: 'HRB400E 螺纹钢 12mm',
          prodPrice: '¥3,950.00/吨',
          time: '10:35'
        },
        {
          shopName: '中铁物流建材城',
          prodTitle: 'Q345B 槽钢 10#',
          prodPrice: '¥4,150.00/吨',
          time: '昨天'
        },
        {
          shopName: '宏源工程管业制造',
          prodTitle: '大宗工程镀锌管 100mm',
          prodPrice: '¥4,280.00/吨',
          time: '前天'
        }
      ];

      mockChats.forEach(chat => {
        html += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; width:100%; box-sizing:border-box;">
            <div style="flex:1;">
              <div style="font-weight:bold; color:#1e293b; font-size:14px; display:flex; justify-content:space-between; width:100%;">
                <span>${chat.shopName}</span>
                <span style="font-weight:normal; font-size:11px; color:#94a3b8;">${chat.time}</span>
              </div>
              <div style="font-size:12px; color:#64748b; margin-top:6px; background:#fff; padding:6px 10px; border-radius:4px; border:1px solid #f1f5f9; display:inline-block;">
                📦 现货沟通: ${chat.prodTitle} | <span class="text-danger font-bold">${chat.prodPrice}</span>
              </div>
            </div>
            <div style="margin-left:16px;">
              <button class="btn btn-primary btn-sm" onclick="UI.chatWithQuoteSeller('${chat.shopName}', 'S001', '${chat.prodTitle.replace(/'/g, "\\'")}', '${chat.prodPrice}')">💬 进入沟通</button>
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
          time: '12:00'
        },
        {
          shopName: '海螺水泥华东总代',
          prodTitle: '采购 P.O 42.5 散装水泥 500吨 需送达杭州工地',
          prodPrice: '¥298.00/吨',
          time: '昨天'
        }
      ];

      mockChats.forEach(chat => {
        html += `
          <div style="display:flex; align-items:center; justify-content:space-between; padding:16px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; width:100%; box-sizing:border-box;">
            <div style="flex:1;">
              <div style="font-weight:bold; color:#1e293b; font-size:14px; display:flex; justify-content:space-between; width:100%;">
                <span>${chat.shopName}</span>
                <span style="font-weight:normal; font-size:11px; color:#94a3b8;">${chat.time}</span>
              </div>
              <div style="font-size:12px; color:#64748b; margin-top:6px; background:#fff; padding:6px 10px; border-radius:4px; border:1px solid #f1f5f9; display:inline-block;">
                📢 求购沟通: ${chat.prodTitle} | 商家报价: <span class="text-danger font-bold">${chat.prodPrice}</span>
              </div>
            </div>
            <div style="margin-left:16px;">
              <button class="btn btn-primary btn-sm" onclick="UI.chatWithQuoteSeller('${chat.shopName}', 'S001', '${chat.prodTitle.replace(/'/g, "\\'")}', '${chat.prodPrice}')">💬 进入沟通</button>
            </div>
          </div>
        `;
      });
    }
    list.innerHTML = html;
  },

  renderUCBids() {
    const tbody = document.querySelector('#table-uc-bids tbody');
    if (!tbody) return;

    // Filter announcements where current buyer bidded (i.e. has offers in biddingOffers)
    const myOffers = MockData.biddingOffers.filter(o => o.buyerName === (this.currentBuyerName || '万通建材采购部'));
    const uniqueBidIds = [...new Set(myOffers.map(o => o.bidId))];

    if (uniqueBidIds.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-secondary py-8">您尚未参与任何竞拍项目，快去竞价大厅参与吧</td></tr>`;
      return;
    }

    let html = '';
    uniqueBidIds.forEach(bidId => {
      const b = MockData.biddingAnnouncements.find(x => x.id === bidId);
      if (!b) return;

      // Find my highest offer for this bid
      const myOffersForBid = myOffers.filter(o => o.bidId === bidId);
      const myMaxOfferVal = Math.max(...myOffersForBid.map(o => parseFloat(o.offerPrice.replace(/[^\d\.]/g, '')) || 0));
      const myMaxOfferStr = '¥' + myMaxOfferVal.toLocaleString('zh-CN', {minimumFractionDigits: 2});

      let tag = '';
      if (b.status === 0) tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">竞价中</span>`;
      else if (b.status === 1) tag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border-color:#ffd591;">竞价中</span>`;
      else if (b.status === 2) tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">竞价中</span>`;
      else if (b.status === 3) tag = `<span class="tag tag-success" style="background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
      else if (b.status === 4) tag = b.winner === (this.currentBuyerName || '万通建材采购部')
        ? `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f; font-weight:bold;">🏆 中标</span>`
        : `<span class="tag tag-secondary">未中标</span>`;

      let actBtn = `<button class="btn btn-text btn-sm text-primary" onclick="MallApp.showBiddingDetail('${b.id}')">查看详情</button>`;

      html += `
        <tr>
          <td>${b.id}</td>
          <td class="font-bold">${b.title}</td>
          <td class="text-secondary">${b.startPrice}</td>
          <td class="text-danger font-bold">${b.currentMaxOffer}</td>
          <td style="color:#ef4444; font-family:monospace; font-weight:bold;">${myMaxOfferStr}</td>
          <td>${tag}</td>
          <td>${actBtn}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html;
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
    const container = document.getElementById('cart-grouped-container');
    if (!container || !MockData.cart) return;

    // 更新红点角标数量
    const totalQty = MockData.cart.filter(c => c.status === 1).reduce((sum, item) => sum + item.quantity, 0);
    const ucBadge = document.getElementById('cart-badge-uc');
    if (ucBadge) {
      if (totalQty > 0) {
        ucBadge.innerText = totalQty;
        ucBadge.style.display = 'inline-block';
      } else {
        ucBadge.style.display = 'none';
      }
    }

    if (MockData.cart.length === 0) {
      container.innerHTML = `
        <div class="text-center py-12">
          <div class="text-secondary mb-4">购物车空空如也，快去挑点好货吧！</div>
          <button class="btn btn-primary" onclick="document.querySelector('.mall-nav-item[data-target=\\'mall-spot\\']').click()">去逛逛</button>
        </div>
      `;
      const footer = document.getElementById('cart-summary-footer');
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

      let shopRowsHtml = '';
      shopItems.forEach(item => {
        if (item.status === 0) {
          invalidCount++;
          shopRowsHtml += `
            <tr style="background: #fafafa; color: #999;">
              <td style="padding:12px 16px;">
                <div class="flex items-center gap-2">
                  <span class="tag tag-secondary" style="font-size:10px; padding:2px 6px;">失效</span>
                  <span>${item.name}</span>
                </div>
              </td>
              <td style="padding:12px 16px;">¥${item.price}</td>
              <td style="padding:12px 16px;">${item.quantity}</td>
              <td style="padding:12px 16px;">-</td>
              <td style="padding:12px 16px;"><button class="btn btn-text btn-sm text-danger" onclick="MallApp.removeCartItem('${item.id}')">删除</button></td>
            </tr>
          `;
        } else {
          if (item.checked) {
            totalAmount += item.price * item.quantity;
            selectedCount += item.quantity;
          }

          shopRowsHtml += `
            <tr>
              <td style="padding:12px 16px;">
                <div class="flex items-center gap-2">
                  <input type="checkbox" ${item.checked ? 'checked' : ''} onchange="MallApp.toggleCartItem('${item.id}', this.checked)" style="width:16px; height:16px; cursor:pointer;">
                  <span class="font-bold text-slate-800">${item.name}</span>
                </div>
              </td>
              <td style="padding:12px 16px;"><span class="text-danger font-bold">¥${item.price}</span></td>
              <td style="padding:12px 16px;">
                <div class="flex gap-2 items-center">
                  <button class="btn btn-outline" style="width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onclick="MallApp.updateCartQty('${item.id}', -1)">-</button>
                  <input type="number" class="form-control" style="width:50px; text-align:center; padding:2px; height:28px;" value="${item.quantity}" onchange="MallApp.setCartQty('${item.id}', this.value)">
                  <button class="btn btn-outline" style="width:28px; height:28px; padding:0; display:flex; align-items:center; justify-content:center; border-radius:4px;" onclick="MallApp.updateCartQty('${item.id}', 1)">+</button>
                </div>
              </td>
              <td style="padding:12px 16px;"><span class="text-danger font-bold">¥${(item.price * item.quantity).toLocaleString()}</span></td>
              <td style="padding:12px 16px;"><button class="btn btn-text btn-sm text-danger" onclick="MallApp.removeCartItem('${item.id}')">删除</button></td>
            </tr>
          `;
        }
      });

      html += `
        <div class="cart-shop-section mb-6" style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; background: #fff;">
          <div style="background: #f8fafc; padding: 12px 16px; font-weight: bold; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; color: #1e293b;">
            <div style="display:flex; align-items:center; gap:8px;">
              <input type="checkbox" ${allShopChecked ? 'checked' : ''} onchange="MallApp.toggleShopCart('${shopId}', this.checked)" style="width:16px; height:16px; cursor:pointer;">
              <span style="font-size:14px; font-weight:800;">🏪 ${shopName}</span>
            </div>
            <button class="btn btn-text btn-sm" onclick="MallApp.goToShop('${shopId}', '${shopName}')">进店逛逛 &gt;</button>
          </div>
          <table class="table" style="margin: 0; width: 100%; border-collapse: collapse;">
            <thead style="background:#fafafa; border-bottom:1px solid #f0f0f0;">
              <tr>
                <th style="padding:10px 16px; text-align:left; font-size:12px; color:#64748b;">商品信息</th>
                <th style="padding:10px 16px; text-align:left; font-size:12px; color:#64748b;">单价</th>
                <th style="padding:10px 16px; text-align:left; font-size:12px; color:#64748b;">数量</th>
                <th style="padding:10px 16px; text-align:left; font-size:12px; color:#64748b;">小计</th>
                <th style="padding:10px 16px; text-align:left; font-size:12px; color:#64748b;">操作</th>
              </tr>
            </thead>
            <tbody>
              ${shopRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    });

    container.innerHTML = html;

    let footer = document.getElementById('cart-summary-footer');
    if (!footer) {
      footer = document.createElement('div');
      footer.id = 'cart-summary-footer';
      footer.className = 'mt-4 p-4 flex justify-between items-center shadow-sm';
      footer.style.background = '#fff';
      footer.style.borderRadius = '8px';
      footer.style.border = '1px solid #e2e8f0';
      document.querySelector('#uc-cart .table-wrapper').appendChild(footer);
    }
    footer.style.display = 'flex';
    footer.innerHTML = `
      <div class="flex items-center gap-4">
        <label class="flex items-center gap-2 cursor-pointer" style="font-size:13px; font-weight:bold; color:#475569;">
          <input type="checkbox" id="cart-check-all" onchange="MallApp.toggleAllCart(this.checked)" style="width:16px; height:16px; cursor:pointer;"> 全选
        </label>
        ${invalidCount > 0 ? `<span class="text-sm text-secondary">(${invalidCount}件失效商品已过滤)</span>` : ''}
      </div>
      <div class="flex items-center gap-4">
        <div style="font-size:13px; color:#475569;">已选 <span class="text-primary font-bold px-1" style="font-size:16px;">${selectedCount}</span> 件商品，总计: <span class="text-danger text-2xl font-bold" style="font-family:monospace; font-size:22px; font-weight:900;">¥${totalAmount.toLocaleString()}</span></div>
        <button class="btn btn-primary" style="height: 40px; padding: 0 32px; border-radius:20px; font-weight:bold;" ${selectedCount === 0 ? 'disabled' : ''} onclick="MallApp.checkoutCart()">生成订单</button>
      </div>
    `;

    const allActive = MockData.cart.filter(c => c.status === 1);
    const allChecked = allActive.length > 0 && allActive.every(c => c.checked);
    const chkAll = document.getElementById('cart-check-all');
    if (chkAll) chkAll.checked = allChecked;
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
    if (confirm('确认将该商品从购物车中移除吗？')) {
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
      buyerName: this.currentBuyerName || '万通建材采购部',
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

    // 将新订单加入 MockData.orders 最前
    MockData.orders.unshift(newOrder);

    // 清理购物车中被选中的商品
    MockData.cart = MockData.cart.filter(item => !item.checked);

    this.renderCart();

    UI.toast(`订单 ${orderId} 提交成功！已自动合并同商家商品。`, 'success');
    
    // 跳转到订单管理页面
    this.renderUCOrders();
    document.querySelector('.uc-menu-item[data-target="uc-orders"]').click();
  }
};

window.MallApp = MallApp;

document.addEventListener('DOMContentLoaded', () => {
  MallApp.init();
});

window.openPlatformCustomerService = () => {
  UI.openModal('modal-chat');
  document.getElementById('chat-shop-name').innerText = '平台官方客服';
  document.getElementById('chat-prod-title').innerText = '大宗交易安全与履约保障客服';
  document.getElementById('chat-prod-price').innerText = '官方客服在线在线';
  document.getElementById('chat-prod-img').src = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80';
  
  const msgContainer = document.getElementById('chat-messages');
  if (msgContainer) {
    msgContainer.innerHTML = `
      <div class="message system" style="text-align: center; color: #94a3b8; font-size: 11px; margin: 4px 0;">
        平台官方客服已接入，由智能助理为您提供保障服务
      </div>
      <div class="message seller" style="display: flex; gap: 10px; align-items: flex-start; justify-content: flex-start; margin-bottom: 12px;">
        <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: bold;">客</div>
        <div style="background: #f1f5f9; border-radius: 0 12px 12px 12px; padding: 10px 14px; max-width: 70%; font-size: 12px; color: #1e293b; line-height: 1.4;">
          您好！我是大宗物资交易平台官方客服。请问您在签约合同、支付货款、物流配送或发票开具过程中遇到了什么问题？我会安全为您解决！
        </div>
      </div>
    `;
  }
};
