/**
 * 运营端后台业务逻辑 (Admin Dashboard V2)
 */

const AdminApp = {
  init() {
    UI.initSidebarSpa();
    
    // 初始化数据
    this.renderDataCenter();
    this.renderCustomers();
    this.renderMerchantShops();
    this.renderBaseProducts();
    this.renderMerchantProducts();
    this.renderDemands();
    this.renderOrders();
    this.renderChats();
    this.renderBidding();
    this.renderConfig();
    this.renderDecorationConfig();
    this.renderAgreementConfig();

    // 默认激活第一个菜单
    const defaultPage = document.querySelector('[data-page="page-data"]') || document.querySelector('.menu-item');
    if (defaultPage) defaultPage.click();
  },

  openAuditShopModal(shopId) { if (window.openAuditShopModal) window.openAuditShopModal(shopId); },
  openAuditProductModal(prodId) { if (window.openAuditProductModal) window.openAuditProductModal(prodId); },
  openAuditDemandModal(demandId) { if (window.openAuditDemandModal) window.openAuditDemandModal(demandId); },

  _appendPagination(tbody, totalItems) {
    if (!tbody) return;
    const wrapper = tbody.closest('.table-wrapper');
    if (wrapper) {
      let p = wrapper.querySelector('.pagination-container');
      if (!p) {
        p = document.createElement('div');
        p.className = 'pagination-container';
        wrapper.appendChild(p);
      }
      p.innerHTML = UI.renderPagination(totalItems, 1, 10);
    }
  },

  // === 1. 数据中心 ===
  renderDataCenter() {
    const stats = MockData.biStats.overview;
    document.getElementById('bi-total-gmv').innerText = `¥ ${stats.totalGMV.toLocaleString()}`;
    document.getElementById('bi-total-orders').innerText = stats.totalOrders.toLocaleString();
    document.getElementById('bi-total-merchants').innerText = stats.merchantsCount.toLocaleString();
    document.getElementById('bi-total-buyers').innerText = stats.buyersCount.toLocaleString();

    // 如果 echarts 没有加载，则退出
    if (typeof echarts === 'undefined') return;

    // 1. GMV 趋势 (柱状图)
    const gmvChartEl = document.getElementById('chart-gmv-trend');
    if (gmvChartEl) {
      const gmvChart = echarts.init(gmvChartEl);
      gmvChart.setOption({
        tooltip: { trigger: 'axis', formatter: '{b} <br/> {c} 万' },
        xAxis: { type: 'category', data: MockData.biStats.gmvTrend.map(d => d.month) },
        yAxis: { type: 'value', name: 'GMV (万)' },
        series: [{
          data: MockData.biStats.gmvTrend.map(d => d.amount),
          type: 'bar',
          itemStyle: { color: '#1677ff', borderRadius: [4, 4, 0, 0] },
          barWidth: '40%'
        }]
      });
    }

    // 2. 品类销售占比 (饼状图)
    const categoryPieEl = document.getElementById('chart-category-pie');
    if (categoryPieEl) {
      const pieChart = echarts.init(categoryPieEl);
      pieChart.setOption({
        tooltip: { trigger: 'item', formatter: '{b}: {d}%' },
        legend: { bottom: '5%', left: 'center' },
        series: [{
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: '18', fontWeight: 'bold' } },
          data: MockData.biStats.categoryPie
        }]
      });
    }

    // 3. 订单量与活跃买家趋势 (双折线图)
    const ordersLineEl = document.getElementById('chart-orders-line');
    if (ordersLineEl) {
      const lineChart = echarts.init(ordersLineEl);
      lineChart.setOption({
        tooltip: { trigger: 'axis' },
        legend: { data: ['订单量', '活跃买家数'], bottom: 0 },
        xAxis: { type: 'category', boundaryGap: false, data: MockData.biStats.orderTrend.map(d => d.month) },
        yAxis: { type: 'value' },
        series: [
          { name: '订单量', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, itemStyle: { color: '#52c41a' }, data: MockData.biStats.orderTrend.map(d => d.orders) },
          { name: '活跃买家数', type: 'line', smooth: true, areaStyle: { opacity: 0.1 }, itemStyle: { color: '#faad14' }, data: MockData.biStats.orderTrend.map(d => d.buyers) }
        ]
      });
    }

    // 4. TOP 5 商家销售榜单 (横向柱状图)
    const topMerchantsEl = document.getElementById('chart-top-merchants');
    if (topMerchantsEl) {
      const barChart = echarts.init(topMerchantsEl);
      // Data needs to be reversed because horizontal bars render from bottom to top
      const reverseData = [...MockData.biStats.topMerchants].reverse();
      barChart.setOption({
        tooltip: { trigger: 'axis', formatter: '{b} <br/> ¥ {c}' },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', name: '交易额(元)' },
        yAxis: { type: 'category', data: reverseData.map(d => d.name) },
        series: [{
          type: 'bar',
          data: reverseData.map(d => d.gmv),
          itemStyle: { color: '#ff4d4f', borderRadius: [0, 4, 4, 0] }
        }]
      });
    }

    // 响应式 Resize
    window.addEventListener('resize', () => {
      echarts.getInstanceByDom(document.getElementById('chart-gmv-trend'))?.resize();
      echarts.getInstanceByDom(document.getElementById('chart-category-pie'))?.resize();
      echarts.getInstanceByDom(document.getElementById('chart-orders-line'))?.resize();
      echarts.getInstanceByDom(document.getElementById('chart-top-merchants'))?.resize();
    });
  },

  // === 1.8 商家店铺管理 ===
  renderMerchantShops() {
    const tbody = document.getElementById('admin-shop-tbody');
    if (!tbody) return;

    const shopIdKw = document.getElementById('admin-search-shop-id')?.value.trim().toLowerCase() || '';
    const kw = document.getElementById('admin-search-shop-keyword')?.value.trim().toLowerCase() || '';
    const statusKw = document.getElementById('admin-search-shop-status')?.value || '';

    let filtered = (MockData.shops || []).filter(s => s.status !== '未开店');
    if (shopIdKw) {
      filtered = filtered.filter(s => s.id.toLowerCase().includes(shopIdKw));
    }
    if (kw) {
      filtered = filtered.filter(s => s.shopName.toLowerCase().includes(kw) || (s.companyName && s.companyName.toLowerCase().includes(kw)));
    }
    if (statusKw) {
      if (statusKw === '闭店中') {
        filtered = filtered.filter(s => s.status === '闭店中' || s.status === '已关停' || s.status === '已禁用' || s.status === '审核未通过');
      } else {
        filtered = filtered.filter(s => s.status === statusKw);
      }
    }

    const countEl = document.getElementById('shop-management-count');
    if (countEl) countEl.innerText = `共 ${filtered.length} 个商家店铺`;

    let html = '';
    filtered.forEach((s, idx) => {
      const prodCount = MockData.products.filter(p => p.shopId == s.id || p.shopName === s.shopName).length;
      
      let statusTag = '';
      if (s.status === '正常营业' || s.status === '正常') {
        statusTag = '<span class="tag tag-success">正常营业</span>';
      } else if (s.status === '待审核') {
        statusTag = '<span class="tag tag-warning">待审核</span>';
      } else {
        statusTag = s.suspendReason ? '<span class="tag tag-danger">闭店中 (已下架)</span>' : '<span class="tag tag-secondary">闭店中</span>';
      }

      let reasonTip = '';
      if (s.suspendReason) {
        reasonTip = `<div class="text-[10px] text-danger mt-1">理由: ${s.suspendReason}</div>`;
      } else if (s.rejectReason) {
        reasonTip = `<div class="text-[10px] text-danger mt-1" style="font-size:11px; color:#ef4444;">原因: ${s.rejectReason}</div>`;
      }

      let actionBtn = '';
      if (s.status === '正常营业' || s.status === '正常') {
        actionBtn = `<button class="btn btn-text btn-sm text-danger" onclick="window.openSuspendShopModal('${s.id}')">强行关停</button>`;
      } else if (s.status === '待审核') {
        actionBtn = `<button class="btn btn-primary btn-sm" onclick="window.openAuditShopModal('${s.id}')">审核</button>`;
      } else {
        actionBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      }

      const avatarHtml = s.avatar ? `<img src="${s.avatar}" style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #e2e8f0; cursor:pointer;" onclick="UI.openImagePreview('${s.avatar}')" title="点击预览">` : `<div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary-bg); color: var(--primary-color); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px;">${s.shopName.charAt(0)}</div>`;
      const bannerUrl = s.banner || 'https://images.unsplash.com/photo-1541888081-30d890632a7e?w=1200&h=300&fit=crop';
      const bannerHtml = `<img src="${bannerUrl}" style="width: 60px; height: 30px; border-radius: 4px; object-fit: cover; border: 1px solid #e2e8f0; cursor:pointer;" onclick="UI.openImagePreview('${bannerUrl}')" title="点击预览">`;

      html += `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding:12px; font-family:monospace; font-weight:bold; color:var(--text-main);">${idx + 1}</td>
          <td style="padding:12px; font-family:monospace; font-weight:bold; color:var(--text-main);">${s.id}</td>
          <td style="padding:12px; text-align:center;">${avatarHtml}</td>
          <td style="padding:12px; text-align:center;">${bannerHtml}</td>
          <td style="padding:12px; font-weight:bold; color:var(--text-main);">${s.shopName}</td>
          <td style="padding:12px;">${s.companyName || '--'}</td>
          <td style="padding:12px; text-align:center;">${statusTag} ${reasonTip}</td>
          <td style="padding:12px; text-align:center; font-weight:bold; color:var(--primary-color);">${prodCount}</td>
          <td style="padding:12px; font-family:monospace; font-size:12px;">${s.creditCode || '--'}</td>
          <td style="padding:12px; text-align:center; font-family:monospace; font-size:12px;">${s.updateTime || '2026-07-20 12:00'}</td>
          <td style="padding:12px; text-align:center;">${actionBtn}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html || '<tr><td colspan="11" class="text-center py-8 text-secondary">暂无符合条件的商家店铺记录</td></tr>';
  },

  resetMerchantShopsFilter() {
    if (document.getElementById('admin-search-shop-id')) document.getElementById('admin-search-shop-id').value = '';
    if (document.getElementById('admin-search-shop-keyword')) document.getElementById('admin-search-shop-keyword').value = '';
    if (document.getElementById('admin-search-shop-status')) document.getElementById('admin-search-shop-status').value = '';
    this.renderMerchantShops();
  },

  // === 2. 客户管理 ===
  renderCustomers() {
    const tbody = document.querySelector('#table-customers tbody');
    if (!tbody) return;
    
    window.showCustomerDetail = (accountNo, certStatus, merchantStatus, regTime) => {
      document.getElementById('detail-account-no').innerText = accountNo;
      
      let html = '';
      
      let companyText = '未认证';
      let companyColor = 'error';
      if (merchantStatus === 2) { companyText = '已认证'; companyColor = 'success'; }
      else if (merchantStatus === 1) { companyText = '待审核'; companyColor = 'warning'; }
      html += `
        <div class="timeline-item">
          <div class="timeline-dot ${companyColor}"></div>
          <div class="timeline-content">
            <span class="mr-4">企业认证</span>
            <span class="text-${companyColor === 'error' ? 'danger' : companyColor === 'success' ? 'success' : 'warning'}">${companyText}</span>
          </div>
        </div>
      `;

      let personalText = certStatus > 0 ? '已认证' : '未认证';
      let personalColor = certStatus > 0 ? 'success' : 'error';
      html += `
        <div class="timeline-item">
          <div class="timeline-dot ${personalColor}"></div>
          <div class="timeline-content">
            <span class="mr-4">个人认证</span>
            <span class="text-${personalColor === 'error' ? 'danger' : 'success'}">${personalText}</span>
          </div>
        </div>
      `;

      html += `
        <div class="timeline-item">
          <div class="timeline-dot success"></div>
          <span class="timeline-time">${regTime}</span>
          <div class="timeline-content">注册</div>
        </div>
      `;
      
      document.getElementById('detail-timeline').innerHTML = html;
      UI.showModal('modal-customer-detail');
    };

    let html = '';
    MockData.users.forEach((u, idx) => {
      let personalStatus = u.certStatus > 0 ? '已认证' : '未认证';
      let personalTime = u.certStatus > 0 ? u.regTime : ''; 
      
      let companyStatus = '未认证';
      let companyTime = '';
      if (u.merchantStatus === 2) {
        companyStatus = '已认证';
        companyTime = '2026-06-02 11:11:26';
      } else if (u.merchantStatus === 1) {
        companyStatus = '待审核';
      }

      let acts = `<a href="javascript:;" class="text-primary mr-3" style="color: #9a66e4;" onclick="showCustomerDetail('${u.mobile}', ${u.certStatus}, ${u.merchantStatus}, '${u.regTime}')">详情</a>`;
      
      if (companyStatus === '待审核' || (u.certStatus > 0 && u.merchantStatus === 0)) {
         acts += `<button class="btn btn-text btn-sm text-primary" onclick="UI.showModal('modal-audit-merchant')" style="color: #9a66e4;">审核商家</button>`;
      }

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${u.mobile}</td>
          <td>${personalStatus}</td>
          <td>${companyStatus}</td>
          <td>${u.regTime}</td>
          <td>${personalTime}</td>
          <td>${companyTime}</td>
          <td>${acts}</td>
        </tr>
      `;
    });
    
    tbody.innerHTML = html;
    this._appendPagination(tbody, MockData.users.length);
  },

  // === 3. 商品中心 ===
  renderBaseProducts() {
    const tbody = document.querySelector('#table-base-category tbody');
    if (!tbody || !MockData.productCategories) return;

    const levelVal = document.getElementById('filter-cat-level')?.value;
    const nameKw = document.getElementById('filter-cat-name')?.value.trim().toLowerCase();

    const flattenCategories = (cats, parentName = '-', parentId = '', result = []) => {
      cats.forEach(c => {
        result.push({ ...c, parentName, parentId });
        if (c.children && c.children.length > 0) {
          flattenCategories(c.children, c.name, c.id, result);
        }
      });
      return result;
    };

    let flatList = flattenCategories(MockData.productCategories);

    if (levelVal) {
      flatList = flatList.filter(c => String(c.level) === String(levelVal));
    }
    if (nameKw) {
      flatList = flatList.filter(c => c.name.toLowerCase().includes(nameKw));
    }

    let html = '';
    flatList.forEach((c, idx) => {
      let levelBadge = '';
      if (c.level === 1) levelBadge = `<span class="tag tag-primary">一级</span>`;
      else if (c.level === 2) levelBadge = `<span class="tag tag-success">二级</span>`;
      else if (c.level === 3) levelBadge = `<span class="tag" style="background:#e6f4ff; color:#1677ff; border:1px solid #91caff;">三级</span>`;
      
      const indent = (c.level - 1) * 20;
      const hasChildren = c.children && c.children.length > 0;
      const expandIcon = hasChildren ? `<span style="cursor:pointer; display:inline-block; width:20px; color:#999;" onclick="AdminApp.toggleCategory(this, '${c.id}')">▼</span>` : `<span style="display:inline-block; width:20px;"></span>`;

      html += `
        <tr data-id="${c.id}" data-parent="${c.parentId}" class="cat-row">
          <td>${idx + 1}</td>
          <td style="padding-left: ${indent + 12}px; font-weight: ${c.level === 1 ? 'bold' : 'normal'}">${expandIcon} ${c.name}</td>
          <td style="font-family:monospace;">${c.id}</td>
          <td>${levelBadge}</td>
          <td>${c.status === 1 ? '<span class="tag tag-success">启用</span>' : '<span class="tag tag-error">禁用</span>'}</td>
          <td style="font-family:monospace; font-size:12px;">${c.updateTime || '2026-07-20 12:00'}</td>
          <td>
            <button class="btn btn-text btn-sm text-primary" onclick="window.openAddCategoryModal('${c.parentId}', '${c.id}', '${c.name}', '${c.id}', true)">编辑</button>
            ${c.level < 3 ? `<button class="btn btn-text btn-sm text-primary" onclick="window.openAddCategoryModal('${c.id}', '', '', '', false)">新增下级</button>` : ''}
            <button class="btn btn-text btn-sm ${c.status === 1 ? 'text-danger' : 'text-success'}" onclick="window.toggleCategoryStatus('${c.id}', ${c.status})">${c.status === 1 ? '禁用' : '启用'}</button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="7" class="text-center p-4 text-secondary">没有找到符合条件的分类数据</td></tr>';
    this._appendPagination(tbody, flatList.length);
  },

  resetBaseProductsFilter() {
    if (document.getElementById('filter-cat-level')) document.getElementById('filter-cat-level').value = '';
    if (document.getElementById('filter-cat-name')) document.getElementById('filter-cat-name').value = '';
    this.renderBaseProducts();
  },

  toggleCategory(iconEl, catId) {
    const isExpanded = iconEl.innerText === '▼';
    iconEl.innerText = isExpanded ? '▶' : '▼';
    
    const toggleChildren = (parentId, show) => {
      document.querySelectorAll(`.cat-row[data-parent="${parentId}"]`).forEach(row => {
        row.style.display = show ? '' : 'none';
        const rowId = row.getAttribute('data-id');
        const icon = row.querySelector('span[onclick^="AdminApp.toggleCategory"]');
        if (icon) {
          if (!show) {
            toggleChildren(rowId, false);
          } else if (icon.innerText === '▼') {
            toggleChildren(rowId, true);
          }
        }
      });
    };
    
    toggleChildren(catId, !isExpanded);
  },

  renderMerchantProducts() {
    const catMap = {
      '大米': '粮油-谷物-大米',
      '面粉': '粮油-谷物-面粉',
      '食用油': '粮油-油类-食用油',
      '钢材': '建材-金属-钢材',
      '木材': '建材-板材-木材',
      '水泥': '建材-粉材-水泥'
    };
    const tbody = document.querySelector('#table-merchant-products tbody');
    let html = '';
    let list = MockData.products || [];
    const kw = document.getElementById('filter-merchant-prod-kw')?.value.trim().toLowerCase();
    const shopKw = document.getElementById('filter-merchant-prod-shop')?.value.trim().toLowerCase();
    const companyKw = document.getElementById('filter-merchant-prod-company')?.value.trim().toLowerCase();
    const statusKw = document.getElementById('filter-merchant-prod-status')?.value;

    if (kw) list = list.filter(p => p.name.toLowerCase().includes(kw));
    if (shopKw) list = list.filter(p => (p.shopName && p.shopName.toLowerCase().includes(shopKw)));
    if (companyKw) {
      list = list.filter(p => {
        const shop = MockData.shops.find(s => s.id === p.shopId || s.shopName === p.shopName);
        return shop && shop.companyName && shop.companyName.toLowerCase().includes(companyKw);
      });
    }
    if (statusKw !== '' && statusKw !== undefined) {
      list = list.filter(p => String(p.status) === String(statusKw));
    }
    list.forEach((p, idx) => {
      const shop = MockData.shops.find(s => s.id === p.shopId || s.shopName === p.shopName);
      const companyName = shop ? shop.companyName : (p.companyName || '华东物资贸易有限公司');

      let statusTag = '';
      let actBtn = '';

      if (p.status === 0) {
        statusTag = `<span class="tag tag-warning">待审核</span>`;
        actBtn = `
          <button class="btn btn-text btn-sm text-primary" onclick="AdminApp.editProduct('${p.id}')">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="window.openAuditProductModal('${p.id}')" style="margin-left:4px;">审核</button>
        `;
      } else if (p.status === 1) {
        statusTag = `<span class="tag tag-success">已上架</span>`;
        actBtn = `<button class="btn btn-text btn-sm text-danger" onclick="window.forceOfflineProduct('${p.id}')">强制下架</button>`;
      } else if (p.status === 2 || p.status === '已下架' || p.status === '未上架') {
        statusTag = `<span class="tag tag-danger">已下架</span>`;
        if (p.rejectReason) {
          statusTag += `<div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2; white-space:nowrap;">(拒审原因：${p.rejectReason})</div>`;
        } else if (p.offlineReason || p.downReason) {
          statusTag += `<div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2; white-space:nowrap;">(强制下架原因：${p.offlineReason || p.downReason})</div>`;
        } else {
          statusTag += `<div style="font-size:11px; color:#64748b; margin-top:4px; line-height:1.2; white-space:nowrap;">(自主下架)</div>`;
        }
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      } else if (p.status === 3 || p.status === '已售罄') {
        statusTag = `<span class="tag tag-secondary">已售罄</span>`;
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      } else {
        statusTag = `<span class="tag tag-secondary">${p.status}</span>`;
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      }

      let shelfTypeTag = p.shelfType === '预售' 
        ? `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591; padding:2px 6px; font-size:11px;">预售</span>`
        : `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; font-size:11px;">现货</span>`;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold; color:var(--primary-color);">${p.listNo || ('LST-202607-' + p.id)}</td>
          <td><img src="${p.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;"></td>
          <td style="font-weight:bold; color:#0f172a;">${p.shopName}</td>
          <td style="font-size:12px; color:#475569;">${companyName}</td>
          <td>
            <div style="font-weight:bold; display:flex; align-items:center;">
              ${p.name}
            </div>
          </td>
          <td>${shelfTypeTag}</td>
          <td>${catMap[p.category] || p.category}</td>
          <td class="text-danger font-bold">${p.priceStr}</td>
          <td class="font-bold" style="color:#0f172a;">${(p.sales || 0).toLocaleString()}</td>
          <td class="text-xs text-secondary">${p.createTime || '2026-05-20 14:30'}</td>
          <td class="text-xs text-secondary">${p.listTime || '2026-06-01 10:00'}</td>
          <td class="text-xs text-secondary">${p.opTime || '2026-06-01 10:00'}</td>
          <td>${statusTag}</td>
          <td>
            <div style="display:flex; gap:8px; align-items:center;">
              ${actBtn}
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="15" class="text-center p-4 text-secondary">没有找到符合条件的商品</td></tr>';
      this._appendPagination(tbody, list.length);
    }
  },

  resetMerchantProductsFilter() {
    if (document.getElementById('filter-merchant-prod-kw')) document.getElementById('filter-merchant-prod-kw').value = '';
    if (document.getElementById('filter-merchant-prod-shop')) document.getElementById('filter-merchant-prod-shop').value = '';
    if (document.getElementById('filter-merchant-prod-company')) document.getElementById('filter-merchant-prod-company').value = '';
    if (document.getElementById('filter-merchant-prod-status')) document.getElementById('filter-merchant-prod-status').value = '';
    this.renderMerchantProducts();
  },

  editProduct(productId) {
    const p = MockData.products.find(x => x.id === productId);
    if (!p) return;
    document.getElementById('edit-prod-id').value = p.id;
    document.getElementById('edit-prod-name').value = p.name;
    
    const priceStr = p.priceStr || '¥280.00 / 袋';
    const priceMatch = priceStr.match(/(?:¥\s*)?([\d\.,]+)\s*(\/.*)?/);
    if (priceMatch) {
      document.getElementById('edit-prod-price-num').value = priceMatch[1];
      if (priceMatch[2]) {
        const unitEl = document.getElementById('edit-prod-unit');
        if (unitEl) unitEl.value = priceMatch[2].trim();
      }
    } else {
      document.getElementById('edit-prod-price-num').value = p.priceStr;
    }

    document.getElementById('edit-prod-cat').value = p.category;
    document.getElementById('edit-prod-stock').value = p.stock || 0;
    const minQtyEl = document.getElementById('edit-prod-min-qty');
    if (minQtyEl) minQtyEl.value = p.minQty || '1';
    document.getElementById('edit-prod-shelf-type').value = p.shelfType || '现货';
    this.toggleEditProductShelfType();

    document.getElementById('edit-prod-img').value = p.image;
    document.getElementById('edit-prod-img-preview').src = p.image;

    const salesEl = document.getElementById('edit-prod-sales');
    if (salesEl) salesEl.value = p.sales || 0;
    const createTimeEl = document.getElementById('edit-prod-create-time');
    if (createTimeEl) createTimeEl.value = p.createTime || '2026-05-20 14:30';
    const listTimeEl = document.getElementById('edit-prod-list-time');
    if (listTimeEl) listTimeEl.value = p.listTime || '2026-06-01 10:00';
    const opTimeEl = document.getElementById('edit-prod-op-time');
    if (opTimeEl) opTimeEl.value = p.opTime || '2026-06-01 10:00';

    UI.showModal('modal-edit-product');
  },

  toggleEditProductShelfType() {
    const type = document.getElementById('edit-prod-shelf-type')?.value;
    const stockGroup = document.getElementById('edit-prod-stock-group');
    if (stockGroup) {
      stockGroup.style.display = type === '现货' ? 'block' : 'none';
    }
  },

  handleEditProductFileSelect(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('edit-prod-img').value = e.target.result;
        document.getElementById('edit-prod-img-preview').src = e.target.result;
        UI.toast('本地图片解析成功', 'success');
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  },

  saveProductInfo(newStatus) {
    const id = document.getElementById('edit-prod-id').value;
    const p = MockData.products.find(x => x.id === id);
    if (!p) return;
    p.name = document.getElementById('edit-prod-name').value;
    const num = document.getElementById('edit-prod-price-num').value || '0.00';
    const unit = document.getElementById('edit-prod-unit').value || '/ 吨';
    p.priceStr = `¥${num} ${unit}`;
    p.category = document.getElementById('edit-prod-cat').value;
    p.shelfType = document.getElementById('edit-prod-shelf-type').value;
    p.stock = p.shelfType === '现货' ? (parseInt(document.getElementById('edit-prod-stock').value) || 0) : 0;
    const minQtyEl = document.getElementById('edit-prod-min-qty');
    if (minQtyEl) p.minQty = minQtyEl.value;
    p.image = document.getElementById('edit-prod-img').value;

    const salesEl = document.getElementById('edit-prod-sales');
    if (salesEl) p.sales = parseInt(salesEl.value) || 0;
    const createTimeEl = document.getElementById('edit-prod-create-time');
    if (createTimeEl) p.createTime = createTimeEl.value || '2026-05-20 14:30';
    const listTimeEl = document.getElementById('edit-prod-list-time');
    if (listTimeEl) p.listTime = listTimeEl.value || '2026-06-01 10:00';

    if (newStatus !== undefined) {
      p.status = newStatus;
      if (newStatus === 1) {
        delete p.rejectReason;
      }
    }

    const now = new Date();
    const formattedTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    p.opTime = formattedTime;

    UI.closeModal('modal-edit-product');
    if (p.status === 1) {
      UI.toast('商品信息已审核通过并成功上架', 'success');
    } else {
      UI.toast('商品信息保存成功，状态变更为待审核', 'success');
    }
    this.renderMerchantProducts();
  },

  // === 4. 供求信息审核 ===
  renderDemands() {
    const tbody = document.querySelector('#table-demands tbody');
    let html = '';
    let list = MockData.demands || [];
    const kw = document.getElementById('filter-demand-kw')?.value.trim().toLowerCase();
    if (kw) {
      list = list.filter(d => 
        (d.goodsName && d.goodsName.toLowerCase().includes(kw)) ||
        (d.buyerPhone && d.buyerPhone.includes(kw)) ||
        (d.buyerName && d.buyerName.toLowerCase().includes(kw)) ||
        (d.username && d.username.toLowerCase().includes(kw)) ||
        d.id.toLowerCase().includes(kw)
      );
    }

    list.forEach((d, idx) => {
      let statusTag = '';
      let actBtn = '';

      if (d.status === 0) {
        statusTag = `<span class="tag tag-warning">待审核</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="window.openAuditDemandModal('${d.id}')">审核</button>`;
      } else if (d.status === 1) {
        statusTag = `<span class="tag tag-success">展示中</span>`;
        actBtn = `
          <button class="btn btn-text btn-sm text-danger" onclick="window.forceOfflineDemand('${d.id}')">强行下架</button>
          <button class="btn btn-outline btn-sm" onclick="window.openDemandQuotesModal('${d.id}')" style="border-radius:4px; font-size:11px; padding:2px 8px; margin-left:4px;">查看报价 (${d.quotesCount || 0})</button>
        `;
      } else if (d.status === 2) {
        statusTag = `<span class="tag tag-secondary">已完结</span>`;
        actBtn = `<button class="btn btn-outline btn-sm" onclick="window.openDemandQuotesModal('${d.id}')" style="border-radius:4px; font-size:11px; padding:2px 8px;">查看报价 (${d.quotesCount || 0})</button>`;
      } else if (d.status === '已下架' || d.status === '审核未通过') {
        statusTag = `<span class="tag tag-danger">已下架</span>`;
        if (d.rejectReason) {
          statusTag += `<div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2;">(拒审原因：${d.rejectReason})</div>`;
        } else if (d.offlineReason) {
          statusTag += `<div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2;">(强制下架原因：${d.offlineReason})</div>`;
        } else {
          statusTag += `<div style="font-size:11px; color:#64748b; margin-top:4px; line-height:1.2;">(自主下架)</div>`;
        }
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      } else {
        statusTag = `<span class="tag tag-secondary">${d.status}</span>`;
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      }

      const qtyUnitStr = `${d.quantity || '50'}${d.unit || '吨'}`;

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${d.id}</td>
          <td style="font-weight:bold; color:#0f172a;">${d.buyerName}</td>
          <td style="font-family:monospace; font-weight:bold; color:#0284c7;">${d.buyerPhone || '138****8818'}</td>
          <td style="font-weight:bold; color:#0f172a;">${d.goodsName || d.title}</td>
          <td style="font-weight:bold; color:#1e293b;">${qtyUnitStr}</td>
          <td style="font-size:12px; color:#64748b;">${d.publishTime || '2026-07-20'}</td>
          <td style="font-size:12px; color:#64748b;">${d.updateTime || d.publishTime || '2026-07-20 15:00'}</td>
          <td style="vertical-align:middle;">${statusTag}</td>
          <td>
            <div style="display:flex; gap:6px; align-items:center;">
              ${actBtn}
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="10" class="text-center p-4 text-secondary">暂无供求数据</td></tr>';
      this._appendPagination(tbody, list.length);
    }
  },

  resetDemandsFilter() {
    if (document.getElementById('filter-demand-kw')) document.getElementById('filter-demand-kw').value = '';
    this.renderDemands();
  },

  // === 5. 交易中心 (订单透视) ===
  renderOrders() {
    const tbody = document.querySelector('#table-orders tbody');
    let html = '';
    let list = MockData.orders || [];
    const kw = document.getElementById('filter-admin-order-kw')?.value.trim().toLowerCase();
    if (kw) {
      list = list.filter(o => 
        o.id.toLowerCase().includes(kw) || 
        o.buyerName.toLowerCase().includes(kw) || 
        (o.buyerPhone && o.buyerPhone.includes(kw)) ||
        o.shopName.toLowerCase().includes(kw) || 
        (o.companyName && o.companyName.toLowerCase().includes(kw)) ||
        o.productName.toLowerCase().includes(kw)
      );
    }

    list.forEach((o, idx) => {
      let statusText = '';
      let statusColor = '';
      if (o.status === 0) { statusText = '待买家签约'; statusColor = '#fa8c16'; }
      else if (o.status === 5) { statusText = '待卖家签约'; statusColor = '#c41d7f'; }
      else if (o.status === 4) { statusText = '待付款'; statusColor = '#d46b08'; }
      else if (o.status === 1) { statusText = '待发货'; statusColor = '#1677ff'; }
      else if (o.status === 2) { statusText = '待签收(已发货)'; statusColor = '#0958d9'; }
      else if (o.status === 3) { statusText = '已完成'; statusColor = '#52c41a'; }
      else if (o.status === -1) { statusText = '已关闭'; statusColor = '#ff4d4f'; }
      
      let statusTag = `<span class="tag" style="background:${statusColor}15; color:${statusColor}; border:1px solid ${statusColor}40; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">${statusText}</span>`;
      
      let confirmReceiptBtn = o.status === 2 
        ? `<button class="btn btn-primary btn-sm" onclick="AdminApp.confirmAdminReceipt('${o.id}')" style="background:#10b981; border-color:#10b981;">代确认收货</button>` 
        : '';

      let closeBtn = (o.status !== -1 && o.status !== 3)
        ? `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.closeOrder('${o.id}')">关闭(退款)</button>` 
        : '';

      const buyerPhone = o.buyerPhone || '138****8818';
      const shop = MockData.shops.find(s => s.id === o.shopId || s.shopName === o.shopName);
      const companyName = shop ? shop.companyName : (o.sellerCompany || '华东大宗物资贸易有限公司');

      const amountVal = parseFloat(o.amount.replace(/[^\d\.]/g, '')) || 100000;
      const rateStr = o.commissionRate || '0.60%';
      const commFee = (amountVal * 0.006).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><a href="javascript:void(0)" onclick="UI.showOrderDetail('${o.id}')" style="font-weight:bold; color:var(--primary-color); font-family:monospace;">${o.id}</a></td>
          <td><span class="tag tag-info" style="font-size:11px; background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd;">${o.type || '现货交易订单'}</span></td>
          <td style="font-weight:bold;">${o.buyerName}</td>
          <td style="font-family:monospace; color:#0284c7;">${buyerPhone}</td>
          <td style="font-weight:bold;">${o.shopName}</td>
          <td style="font-size:12px; color:#475569;">${companyName}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td style="font-size:12px;"><span style="color:#0284c7; font-weight:bold;">${rateStr}</span> <div style="font-size:10px; color:#64748b;">(¥${commFee})</div></td>
          <td>${statusTag}</td>
          <td style="font-size:12px; color:#64748b;">${o.time || '2026-07-08 09:12'}</td>
          <td>
            <div style="display:flex; align-items:center; gap:6px;">
              ${confirmReceiptBtn}
              ${closeBtn}
              <button class="btn btn-text btn-sm" onclick="UI.showOrderDetail('${o.id}')">详情</button>
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="12" class="text-center p-4 text-secondary">暂无符合条件的订单记录</td></tr>';
      this._appendPagination(tbody, list.length);
    }
  },

  resetOrdersFilter() {
    if (document.getElementById('filter-admin-order-kw')) document.getElementById('filter-admin-order-kw').value = '';
    this.renderOrders();
  },

  confirmAdminReceipt(orderId) {
    const o = MockData.orders.find(item => item.id === orderId);
    if (!o) return;
    o.status = 3;
    UI.toast(`平台已成功代买家确认收货，订单 ${orderId} 状态变更为已完成！`, 'success');
    this.renderOrders();
  },

  closeOrder(orderId) {
    const o = MockData.orders.find(item => item.id === orderId);
    if (!o) return;
    if (confirm("系统不直接涉及线上资金池，是否确认关闭此订单并线下联系双方进行退款处理？")) {
      o.status = -1;
      o.closeReason = '运营端人工强制关闭';
      this.renderOrders();
      UI.toast(`订单 ${orderId} 已强行关闭，并标记为需要线下退款。`, 'success');
    }
  },

  renderChats() {
    const tbody = document.querySelector('#table-chats tbody');
    let html = '';
    MockData.chats.forEach((c, idx) => {
      html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${c.demandId}</td>
          <td>${c.buyer}</td>
          <td>${c.seller}</td>
          <td>${c.time}</td>
          <td><button class="btn btn-primary btn-sm" onclick="UI.showModal('modal-chat')">查看聊天记录</button></td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.chats.length);
    }
  },

  // === 8. 竞价中心 (审核监控) ===
  renderBidding() {
    const resBody = document.querySelector('#table-admin-bidding-res tbody');
    if (resBody) {
      let resHtml = '';
      MockData.biddingResources.forEach((r, idx) => {
        let tag = r.status === '已通过' ? `<span class="tag tag-success">已通过</span>` : `<span class="tag tag-warning">待审核</span>`;
        let btn = r.status === '待审核' 
          ? `<button class="btn btn-primary btn-sm" onclick="MockData.biddingResources.find(x => x.id === '${r.id}').status = '已通过'; AdminApp.renderBidding(); UI.toast('资源审核通过', 'success')">审核</button>`
          : ``;
        resHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td>${r.id}</td>
            <td>${r.shopName}</td>
            <td><div class="font-bold">${r.name}</div><div class="text-xs text-secondary">${r.specs}</div></td>
            <td><img src="${r.image}" style="width:60px;height:40px;border-radius:4px;object-fit:cover;"></td>
            <td>${tag}</td>
            <td>${btn}</td>
          </tr>
        `;
      });
      resBody.innerHTML = resHtml;
      this._appendPagination(resBody, MockData.biddingResources.length);
    }

    const annBody = document.querySelector('#table-admin-bidding-ann tbody');
    if (annBody) {
      let annHtml = '';
      MockData.biddingAnnouncements.forEach((a, idx) => {
        const aStatus = a.auditStatus || '已通过';
        let combinedTag = '';
        if (aStatus === '待审核') {
          combinedTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待审核</span>`;
        } else if (aStatus === '已拒绝') {
          combinedTag = `<span class="tag tag-danger" style="background:#fff2f0; color:#ff4d4f; border:1px solid #ffccc7;">已拒绝</span>`;
        } else if (aStatus === '已撤回') {
          combinedTag = `<span class="tag tag-secondary">已撤回</span>`;
        } else {
          let stageName = '';
          if (a.status === 0) stageName = '看货报名';
          else if (a.status === 1) stageName = '现场看货';
          else if (a.status === 2) stageName = '参加竞价';
          else if (a.status === 3) stageName = '等待公布';
          else if (a.status === 4) stageName = '竞价已结束';
          
          let tagClass = a.status === 4 ? 'tag-secondary' : 'tag-success';
          let borderStyle = a.status === 4 
            ? 'background:#f5f5f5; color:#555; border:1px solid #d9d9d9;' 
            : 'background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f;';
          
          combinedTag = `<span class="tag ${tagClass}" style="${borderStyle}">${stageName}</span>`;
        }

        let btn = `<button class="btn btn-text btn-sm text-primary" onclick="AdminApp.showBiddingDetail('${a.id}')">查看详情</button>`;
        
        if (aStatus === '待审核') {
          btn += `<button class="btn btn-primary btn-sm" onclick="window.openAuditBiddingAnnModal('${a.id}')">审核</button>`;
        }
        
        if (aStatus === '已通过' && a.status !== 4) {
          btn += `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.forceOfflineBiddingAnn('${a.id}')">下架</button>`;
        }

        annHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td>${a.id}</td>
            <td>${a.shopName}</td>
            <td>${a.title}</td>
            <td>${a.resId}</td>
            <td style="font-weight:bold; color:#ef4444;">${a.currentMaxOffer || a.startPrice}</td>
            <td>${combinedTag}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      annBody.innerHTML = annHtml;
      this._appendPagination(annBody, MockData.biddingAnnouncements.length);
    }
  },

  // === 9. 配置中心 (抽佣规则: 支持 global, merchant, category 三种) ===
  renderConfig() {
    const tbody = document.querySelector('#table-admin-commission tbody');
    if (tbody) {
      let html = '';
      MockData.commissionRules.forEach((c, idx) => {
        let tag = c.status === 1 ? `<span class="tag tag-success">生效中</span>` : `<span class="tag tag-secondary">已停用</span>`;
        let btn = c.type === 'global'
          ? `<button class="btn btn-text btn-sm text-primary" onclick="UI.toast('编辑全局默认规则', 'info')">修改</button>`
          : `<button class="btn btn-text btn-sm text-primary" onclick="UI.toast('编辑抽佣规则', 'info')">编辑</button>
             <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('规则已删除', 'info')">删除</button>`;
        
        let typeBadge = '';
        if (c.type === 'global') typeBadge = `<span class="tag" style="background:#e6f7ff;color:#1890ff;border-color:#91d5ff;">全局模式</span>`;
        if (c.type === 'merchant') typeBadge = `<span class="tag" style="background:#f6ffed;color:#52c41a;border-color:#b7eb8f;">按特定商家</span>`;
        if (c.type === 'category') typeBadge = `<span class="tag" style="background:#fff0f6;color:#eb2f96;border-color:#ffadd2;">按特定商品类别</span>`;

        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${c.id}</td>
            <td style="font-weight:bold;">${c.name}</td>
            <td>${typeBadge}</td>
            <td style="color:#0f172a; font-weight:500;">${c.target}</td>
            <td class="font-bold text-danger">${c.rate}</td>
            <td>${tag}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.commissionRules.length);
    }
  },

  toggleCommissionRuleType() {
    const type = document.getElementById('comm-rule-type')?.value;
    const targetGroup = document.getElementById('comm-rule-target-group');
    const targetSelect = document.getElementById('comm-rule-target-select');
    const targetLabel = document.getElementById('comm-rule-target-label');
    if (!targetGroup || !targetSelect) return;

    if (type === 'global') {
      targetGroup.style.display = 'none';
    } else if (type === 'merchant') {
      targetGroup.style.display = 'block';
      targetLabel.innerText = '针对商家店铺选择 *';
      let html = '';
      (MockData.shops || []).forEach(s => {
        html += `<option value="${s.shopName}">${s.shopName} (${s.companyName || s.id})</option>`;
      });
      targetSelect.innerHTML = html;
    } else if (type === 'category') {
      targetGroup.style.display = 'block';
      targetLabel.innerText = '针对商品类别选择 *';
      let html = `
        <option value="建材-金属-钢材">建材-金属-钢材</option>
        <option value="建材-板材-木材">建材-板材-木材</option>
        <option value="建材-粉材-水泥">建材-粉材-水泥</option>
        <option value="粮油-谷物-大米">粮油-谷物-大米</option>
        <option value="粮油-谷物-面粉">粮油-谷物-面粉</option>
        <option value="生鲜-水果-苹果">生鲜-水果-苹果</option>
      `;
      targetSelect.innerHTML = html;
    }
  },

  saveCommissionRule() {
    const type = document.getElementById('comm-rule-type')?.value || 'global';
    const name = document.getElementById('comm-rule-name')?.value.trim();
    const rateVal = document.getElementById('comm-rule-rate')?.value;
    const targetSelect = document.getElementById('comm-rule-target-select');
    
    if (!name || !rateVal) {
      UI.toast('请填写完整规则名称与抽佣比例！', 'warning');
      return;
    }

    let target = '全平台通用';
    if (type === 'merchant') target = targetSelect ? targetSelect.value : '特定商家店铺';
    if (type === 'category') target = targetSelect ? targetSelect.value : '特定商品类别';

    const newRule = {
      id: 'CR-' + (MockData.commissionRules.length + 1).toString().padStart(3, '0'),
      type: type,
      name: name,
      target: target,
      rate: `${parseFloat(rateVal).toFixed(2)}%`,
      status: 1
    };

    MockData.commissionRules.push(newRule);
    UI.closeModal('modal-add-commission');
    UI.toast('抽佣规则配置保存成功！', 'success');
    this.renderConfig();
  },

  renderDecorationConfig() {
    const catContainer = document.getElementById('decoration-categories');
    
    if (catContainer && MockData.productCategories) {
      let catHtml = '';
      MockData.productCategories.forEach(c => {
        let isChecked = MockData.decorationConfig.displayCategories.includes(c.id) ? 'checked' : '';
        catHtml += `
          <label class="flex items-center gap-2 cursor-pointer bg-white px-3 py-2 rounded shadow-sm border border-gray-200">
            <input type="checkbox" name="dec-category" value="${c.id}" ${isChecked}>
            <span class="font-bold">${c.name}</span>
          </label>
        `;
      });
      catContainer.innerHTML = catHtml;
      
      window.saveDecorationConfig = function() {
        const checkboxes = document.querySelectorAll('input[name="dec-category"]:checked');
        if (checkboxes.length > 5) {
          UI.toast('最多只能选择5个外显分类！', 'error');
          return;
        }
        
        let selectedIds = [];
        checkboxes.forEach(cb => selectedIds.push(cb.value));
        
        MockData.decorationConfig.displayCategories = selectedIds;
        UI.toast('分类配置已保存生效', 'success');
      };
    }

    const renderBanners = (banners, tbodyId) => {
      const tbody = document.querySelector(tbodyId);
      if (!tbody) return;
      let html = '';
      banners.forEach(b => {
        let tag = b.active ? `<span class="tag tag-success">展示中</span>` : `<span class="tag tag-secondary">已隐藏</span>`;
        html += `
          <tr>
            <td><img src="${b.url}" style="width:120px; height:48px; object-fit:cover; border-radius:4px; border:1px solid #eee;"></td>
            <td class="text-gray-500 text-sm">#/pages/mall/index</td>
            <td>${tag}</td>
            <td>
              <button class="btn btn-text btn-sm text-primary" onclick="UI.toast('已切换状态', 'success')">${b.active ? '隐藏' : '展示'}</button>
              <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已删除', 'success')">删除</button>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    };
    
    if (MockData.decorationConfig) {
      renderBanners(MockData.decorationConfig.pcBanners, '#table-banner-pc tbody');
      renderBanners(MockData.decorationConfig.h5Banners, '#table-banner-h5 tbody');
    }
  },

  editingAnnId: null,

  approveBiddingAnn(id) {
    const a = MockData.biddingAnnouncements.find(x => x.id === id);
    if (a) {
      a.auditStatus = '已通过';
      UI.toast(`公告 ${id} 审核通过已发布！`, 'success');
      this.renderBidding();
    }
  },

  rejectBiddingAnn(id) {
    const a = MockData.biddingAnnouncements.find(x => x.id === id);
    if (a) {
      a.auditStatus = '已拒绝';
      UI.toast(`公告 ${id} 审核已被拒绝`, 'warning');
      this.renderBidding();
    }
  },

  openEditBiddingAnnModal(id) {
    const a = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!a) return;

    this.editingAnnId = id;
    document.getElementById('admin-edit-ann-modal-title').innerText = `编辑竞价公告 (${id})`;
    document.getElementById('admin-edit-ann-title').value = a.title || '';
    document.getElementById('admin-edit-ann-start-price').value = parseFloat((a.startPrice || '').replace(/[^\d\.]/g, '')) || 0;
    
    // Dates formatting
    const formatDateForInput = (str) => {
      if (!str) return '';
      // '2026-08-01 12:00' -> '2026-08-01T12:00'
      return str.replace(' ', 'T');
    };
    
    document.getElementById('admin-edit-ann-view-end').value = formatDateForInput(a.viewEndTime || '');
    document.getElementById('admin-edit-ann-bid-end').value = formatDateForInput(a.bidEndTime || '');

    UI.showModal('modal-admin-edit-ann');
  },

  saveBiddingAnnInfo() {
    if (!this.editingAnnId) return;
    const a = MockData.biddingAnnouncements.find(x => x.id === this.editingAnnId);
    if (!a) return;

    const title = document.getElementById('admin-edit-ann-title').value.trim();
    const priceVal = parseFloat(document.getElementById('admin-edit-ann-start-price').value);
    const viewEnd = document.getElementById('admin-edit-ann-view-end').value;
    const bidEnd = document.getElementById('admin-edit-ann-bid-end').value;

    if (!title || isNaN(priceVal) || priceVal <= 0 || !viewEnd || !bidEnd) {
      UI.toast('请填写完整且合法的竞价公告信息！', 'error');
      return;
    }

    if (new Date(viewEnd) >= new Date(bidEnd)) {
      UI.toast('竞拍截止时间必须晚于看货报名截止时间！', 'error');
      return;
    }

    a.title = title;
    a.startPrice = '¥' + priceVal.toLocaleString('zh-CN', {minimumFractionDigits: 2});
    a.viewEndTime = viewEnd.replace('T', ' ');
    a.bidEndTime = bidEnd.replace('T', ' ');
    
    // Save edit also keeps/re-submits the announcement to '待审核' status
    a.auditStatus = '待审核';

    UI.closeModal('modal-admin-edit-ann');
    UI.toast('保存成功，已重置为待审核状态', 'success');
    this.editingAnnId = null;
    this.renderBidding();
  },

  deleteBiddingAnn(id) {
    if (confirm(`确认要删除竞价公告 ${id} 吗？`)) {
      const idx = MockData.biddingAnnouncements.findIndex(x => x.id === id);
      if (idx !== -1) {
        MockData.biddingAnnouncements.splice(idx, 1);
        UI.toast('公告已成功删除', 'success');
        this.renderBidding();
      }
    }
  },

  forceOfflineBiddingAnn(id) {
    const a = MockData.biddingAnnouncements.find(x => x.id === id);
    if (a) {
      a.auditStatus = '已撤回';
      UI.toast(`公告 ${id} 已强行下架并变更为已撤回状态`, 'info');
      this.renderBidding();
    }
  },

  showBiddingDetail(bidId) {
    const ann = MockData.biddingAnnouncements.find(a => a.id === bidId);
    if (!ann) return;
    
    const titleEl = document.getElementById('admin-bid-detail-title');
    if (titleEl) titleEl.innerText = `${ann.title} (${bidId})`;
    
    const offers = MockData.biddingOffers.filter(o => o.bidId === bidId);
    const tbody = document.querySelector('#table-admin-bid-offers tbody');
    let html = '';
    
    if (offers.length === 0) {
      html = `<tr><td colspan="5" style="text-align:center; padding: 20px;">暂无买家出价</td></tr>`;
    } else {
      // Sort offers desc by price
      offers.sort((x, y) => {
        const px = parseFloat(x.offerPrice.replace(/[^\d\.]/g, '')) || 0;
        const py = parseFloat(y.offerPrice.replace(/[^\d\.]/g, '')) || 0;
        return py - px;
      });
      
      offers.forEach((o, idx) => {
        let tag = '';
        if (ann.status === 4) { // 已结束
          if (o.status === 1 || ann.winner === o.buyerName) {
            tag = `<span class="tag tag-success">已中标</span>`;
          } else {
            tag = `<span class="tag tag-secondary">未中标</span>`;
          }
        } else {
          tag = `<span class="tag tag-primary">出价有效</span>`;
        }
        
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${o.buyerName}</td>
            <td>${o.time}</td>
            <td class="font-bold text-danger">${o.offerPrice}</td>
            <td>${tag}</td>
          </tr>
        `;
      });
    }
    
    if (tbody) tbody.innerHTML = html;
    UI.showModal('modal-admin-bid-detail');
  },

  renderAgreementConfig() {
    window.renderAgreementConfig();
  }
};

// === 货品字典操作逻辑 ===
window.openAddCategoryModal = function(parentId = '0', catId = '', name = '', code = '', isEdit = false) {
  const modalTitle = document.getElementById('category-modal-title');
  const parentSelect = document.getElementById('select-parent-category');
  const nameInput = document.getElementById('category-name-input');
  const codeInput = document.getElementById('category-code-input');

  if (isEdit) {
    modalTitle.innerText = '编辑货品类别';
  } else {
    modalTitle.innerText = parentId === '0' ? '新增一级分类' : '新增下级分类';
  }

  // 渲染所有可能作为父级的选项 (一二级分类)
  parentSelect.innerHTML = '<option value="0">作为一级大类</option>';
  if (MockData.productCategories) {
    MockData.productCategories.forEach(c1 => {
      // 避免自己成为自己的父级 (简单规避)
      if (c1.id !== catId) {
        parentSelect.add(new Option(c1.name, c1.id));
        if (c1.children) {
          c1.children.forEach(c2 => {
            if (c2.id !== catId) {
              parentSelect.add(new Option('　├─ ' + c2.name, c2.id));
            }
          });
        }
      }
    });
  }

  // 赋值
  parentSelect.value = parentId;
  nameInput.value = name;
  codeInput.value = code;

  // 如果是顶部的“新增一级分类”，禁用父级选择（只能是一级）
  if (!isEdit && parentId === '0') {
    parentSelect.disabled = true;
  } else {
    parentSelect.disabled = false;
  }

  UI.showModal('modal-add-category');
};

window.toggleCategoryStatus = function(catId, currentStatus) {
  if (currentStatus === 1) {
    if (catId === '1' || catId === '2' || catId === '111') {
      UI.toast('该类别下有关联商品，无法禁用！', 'error');
      return;
    }
  }
  const findAndToggle = (cats) => {
    for (let c of cats) {
      if (c.id === catId) {
        c.status = currentStatus === 1 ? 0 : 1;
        const now = new Date();
        c.updateTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
        return true;
      }
      if (c.children && findAndToggle(c.children)) return true;
    }
    return false;
  };
  findAndToggle(MockData.productCategories || []);
  UI.toast(currentStatus === 1 ? '已成功禁用' : '已成功启用', 'success');
  AdminApp.renderBaseProducts();
};

// === 侧边栏子菜单折叠逻辑 ===
window.toggleSubmenu = function(el) {
  const parent = el.parentElement;
  const subMenu = parent.querySelector('.sub-menu');
  if (subMenu) {
    const isHidden = subMenu.style.display === 'none';
    
    if (isHidden) {
      subMenu.style.display = 'block';
    } else {
      subMenu.style.display = 'none';
    }
  }
};

// === 协议配置逻辑 ===
window.renderAgreementConfig = function() {
  const tbody = document.querySelector('#table-admin-agreement tbody');
  const keyword = document.getElementById('agreement-search-input')?.value.trim();
  if (tbody && MockData.agreementList) {
    let html = '';
    
    let list = MockData.agreementList;
    if (keyword) {
      list = list.filter(a => a.name.includes(keyword));
    }
    
    // 按时间倒序展示
    list.sort((a, b) => new Date(b.time) - new Date(a.time)).forEach(a => {
      let tag = a.status === 1 ? `<span class="tag tag-success">生效中</span>` : `<span class="tag tag-secondary">已失效</span>`;
      html += `
        <tr>
          <td>${a.id}</td>
          <td>${a.name}</td>
          <td>${a.version}</td>
          <td>${a.time}</td>
          <td>${tag}</td>
          <td><button class="btn-text">查看/编辑</button></td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }
};

window.openDemandQuotesModal = (demandId) => {
  if (window.UI && typeof window.UI.showDemandQuotesModal === 'function') {
    window.UI.showDemandQuotesModal(demandId, false, null, true);
    return;
  }
  const demand = MockData.demands.find(d => d.id === demandId);
  const titleEl = document.getElementById('demand-quotes-modal-title');
  if (titleEl) titleEl.innerText = `求购单报价人明细 - ${demand ? (demand.goodsName || demand.id) : demandId}`;
  const subEl = document.getElementById('demand-quotes-sub-info');
  if (subEl) subEl.innerText = `求购单号: ${demandId} | 买方主体电话: ${demand ? (demand.buyerPhone || '138****8818') : '-'}`;

  let quotes = (MockData.demandQuotes || []).filter(q => q.demandId === demandId);
  if (quotes.length === 0) {
    quotes = [
      { demandId, shopName: '远大钢铁官方直营店', shopPhone: '139****8811', priceStr: '¥4,100.00 / 吨', remark: '含专车送达运费，附带材质检测合格报告。', time: '2026-07-07 10:15', status: '交易达成' },
      { demandId, shopName: '华东木材集散中心', shopPhone: '138****5566', priceStr: '¥4,150.00 / 吨', remark: '现货仓储配送，质保期12个月。', time: '2026-07-07 11:30', status: '未中标' }
    ];
  }

  const tbody = document.getElementById('demand-quotes-tbody');
  if (tbody) {
    let html = '';
    quotes.forEach((q, idx) => {
      let stTag = q.status === '交易达成' || q.status === 1
        ? '<span class="tag tag-success">交易达成</span>'
        : '<span class="tag tag-secondary" style="background:#f1f5f9; color:#64748b;">未中标</span>';
      html += `
        <tr>
          <td style="padding:10px 8px;">${idx + 1}</td>
          <td style="padding:10px 8px; font-weight:bold; color:#0f172a;">${q.shopName}</td>
          <td style="padding:10px 8px; font-family:monospace; color:#0284c7;">${q.shopPhone || '139****8811'}</td>
          <td style="padding:10px 8px; text-align:right; font-weight:bold; color:#ef4444;">${q.priceStr || q.price}</td>
          <td style="padding:10px 8px; font-size:12px; color:#475569; max-width:200px;">${q.remark || '大宗现货协议供应，品质包退换。'}</td>
          <td style="padding:10px 8px; font-size:12px; color:#64748b;">${q.time}</td>
          <td style="padding:10px 8px; text-align:center;">${stTag}</td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
  }
  UI.showModal('modal-demand-quotes');
};

window.saveAgreement = function() {
  const type = document.getElementById('form-agreement-type').value;
  const version = document.getElementById('form-agreement-version').value || 'V1.0';
  
  if(MockData.agreementList) {
    // 将同类型旧协议全部置为失效 (0)
    MockData.agreementList.forEach(a => {
      if(a.name === type) {
        a.status = 0;
      }
    });
    
    // 插入新协议，置为生效 (1)
    const newId = 'AGR' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // 简单获取当前时间
    const now = new Date();
    const timeStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    
    MockData.agreementList.push({
      id: newId,
      name: type,
      version: version,
      time: timeStr,
      status: 1
    });
    
    window.renderAgreementConfig();
    UI.closeModal('modal-add-agreement');
    UI.toast('新版协议已发布生效并注销旧版', 'success');
  }
};

window.AdminApp = AdminApp;
window.editProduct = (prodId) => AdminApp.editProduct(prodId);
window.openEditProductModal = (prodId) => AdminApp.editProduct(prodId);
window.saveProductInfo = (newStatus) => AdminApp.saveProductInfo(newStatus);

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
  // 预初始化级联下拉框数据
  if (window.renderCategoryCascader) window.renderCategoryCascader();
});


window.openSuspendShopModal = (shopId) => {
  document.getElementById('suspend-shop-id').value = shopId;
  document.getElementById('suspend-reason-input').value = '';
  UI.showModal('modal-suspend-shop');
};

window.confirmSuspendShop = () => {
  const id = document.getElementById('suspend-shop-id').value;
  const reason = document.getElementById('suspend-reason-input').value.trim();
  if (!reason) {
    UI.toast('请输入关停理由', 'warning');
    return;
  }
  const shop = MockData.shops.find(s => s.id == id);
  if (shop) {
    shop.status = '闭店中';
    shop.suspendReason = reason;
    delete shop.rejectReason;
    const now = new Date();
    shop.updateTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    UI.toast(`已强行关停店铺: ${shop.shopName} (状态变更为闭店中)`, 'error');
    UI.closeModal('modal-suspend-shop');
    AdminApp.renderMerchantShops();
  }
};

window.toggleShopStatus = (shopId, newStatus) => {
  const shop = MockData.shops.find(s => s.id == shopId);
  if (shop) {
    shop.status = newStatus;
    delete shop.suspendReason;
    delete shop.rejectReason;
    const now = new Date();
    shop.updateTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    UI.toast(`店铺状态已更新为: ${newStatus}`, 'success');
    AdminApp.renderMerchantShops();
  }
};

window.openAuditShopModal = (shopId) => {
  const shop = MockData.shops.find(s => s.id == shopId);
  if (!shop) return;
  document.getElementById('audit-shop-target-id').value = shopId;
  const titleEl = document.getElementById('audit-modal-shop-title');
  if (titleEl) titleEl.innerText = `店铺入驻审核 - ${shop.shopName}`;
  const inputEl = document.getElementById('audit-reject-reason-input');
  if (inputEl) inputEl.value = '';
  const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
  if (counterEl) counterEl.innerText = '0/50';
  document.getElementById('audit-reject-reason-box').style.display = 'none';
  const passRadio = document.querySelector('input[name="audit-result-radio"][value="pass"]');
  if (passRadio) passRadio.checked = true;
  UI.showModal('modal-audit-shop');
};

window.confirmSubmitAuditShop = () => {
  const shopId = document.getElementById('audit-shop-target-id').value;
  const shop = MockData.shops.find(s => s.id == shopId);
  if (!shop) return;
  const result = document.querySelector('input[name="audit-result-radio"]:checked')?.value;
  if (result === 'pass') {
    shop.status = '正常营业';
    delete shop.rejectReason;
    delete shop.suspendReason;
    UI.toast(`店铺 ${shop.shopName} 入驻审核通过，已上线正常营业！`, 'success');
  } else {
    const reason = document.getElementById('audit-reject-reason-input').value.trim();
    if (!reason) {
      UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
      return;
    }
    shop.status = '闭店中';
    shop.rejectReason = reason;
    delete shop.suspendReason;
    UI.toast(`店铺 ${shop.shopName} 审核拒绝，状态变更为闭店中`, 'error');
  }
  const now = new Date();
  shop.updateTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  UI.closeModal('modal-audit-shop');
  AdminApp.renderMerchantShops();
};

window.openAuditProductModal = (prodId) => {
  const prod = MockData.products.find(p => p.id == prodId);
  if (!prod) return;
  document.getElementById('audit-product-target-id').value = prodId;
  const titleEl = document.getElementById('audit-modal-product-title');
  if (titleEl) titleEl.innerText = `上架商品审核 - ${prod.name}`;
  const inputEl = document.getElementById('audit-product-reject-input');
  if (inputEl) inputEl.value = '';
  const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
  if (counterEl) counterEl.innerText = '0/50';
  document.getElementById('audit-product-reject-box').style.display = 'none';
  const passRadio = document.querySelector('input[name="audit-product-radio"][value="pass"]');
  if (passRadio) passRadio.checked = true;
  UI.showModal('modal-audit-product');
};

window.confirmSubmitAuditProduct = () => {
  const id = document.getElementById('audit-product-target-id').value;
  const prod = MockData.products.find(p => p.id == id);
  if (!prod) return;
  const result = document.querySelector('input[name="audit-product-radio"]:checked')?.value;
  if (result === 'pass') {
    prod.status = 1; // 已上架
    delete prod.rejectReason;
    UI.toast(`商品 ${prod.name} 审核通过，已成功上架`, 'success');
  } else {
    const reason = document.getElementById('audit-product-reject-input').value.trim();
    if (!reason) {
      UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
      return;
    }
    prod.status = '未上架';
    prod.rejectReason = reason;
    UI.toast(`商品 ${prod.name} 审核拒绝`, 'error');
  }
  UI.closeModal('modal-audit-product');
  AdminApp.renderMerchantProducts();
};

window.openAuditDemandModal = (demandId) => {
  const demand = MockData.demands.find(d => d.id == demandId);
  if (!demand) return;
  document.getElementById('audit-demand-target-id').value = demandId;
  const titleEl = document.getElementById('audit-modal-demand-title');
  if (titleEl) titleEl.innerText = `供求信息审核 - ${demand.goodsName || demand.title}`;
  const inputEl = document.getElementById('audit-demand-reject-input');
  if (inputEl) inputEl.value = '';
  const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
  if (counterEl) counterEl.innerText = '0/50';
  document.getElementById('audit-demand-reject-box').style.display = 'none';
  const passRadio = document.querySelector('input[name="audit-demand-radio"][value="pass"]');
  if (passRadio) passRadio.checked = true;
  UI.showModal('modal-audit-demand');
};

window.confirmSubmitAuditDemand = () => {
  const id = document.getElementById('audit-demand-target-id').value;
  const demand = MockData.demands.find(d => d.id == id);
  if (!demand) return;
  const result = document.querySelector('input[name="audit-demand-radio"]:checked')?.value;
  if (result === 'pass') {
    demand.status = 1; // 大厅展示
    delete demand.rejectReason;
    UI.toast(`供求信息审核通过并已上架大厅`, 'success');
  } else {
    const reason = document.getElementById('audit-demand-reject-input').value.trim();
    if (!reason) {
      UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
      return;
    }
    demand.status = '已下架';
    demand.rejectReason = reason;
    UI.toast(`供求信息审核拒绝`, 'error');
  }
  const now = new Date();
  demand.updateTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
  UI.closeModal('modal-audit-demand');
  AdminApp.renderDemands();
};

window.forceOfflineDemand = (demandId) => {
  const reason = prompt("确定要强行下架该供求信息吗？请输入强行下架原因：");
  if (reason === null) return; // User cancelled
  const cleanReason = reason.trim();
  if (!cleanReason) {
    UI.toast("请输入强行下架原因！", "warning");
    return;
  }
  const dem = MockData.demands.find(x => x.id === demandId);
  if (dem) {
    dem.status = '已下架';
    dem.offlineReason = cleanReason;
    delete dem.rejectReason;
    const now = new Date();
    dem.updateTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    UI.toast("已成功强行下架该供求信息", "success");
    AdminApp.renderDemands();
  }
};

window.forceOfflineProduct = (prodId) => {
  const reason = prompt("确定要强制下架该商品吗？请输入强制下架原因：");
  if (reason === null) return; // User cancelled
  const cleanReason = reason.trim();
  if (!cleanReason) {
    UI.toast("请输入强制下架原因！", "warning");
    return;
  }
  const prod = MockData.products.find(x => x.id === prodId);
  if (prod) {
    prod.status = 2; // 已下架
    prod.offlineReason = cleanReason;
    delete prod.rejectReason;
    delete prod.downReason;
    const now = new Date();
    prod.opTime = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0') + '-' + String(now.getDate()).padStart(2,'0') + ' ' + String(now.getHours()).padStart(2,'0') + ':' + String(now.getMinutes()).padStart(2,'0');
    UI.toast(`已强制下架该商品: ${prod.name}`, "error");
    AdminApp.renderMerchantProducts();
  }
};

window.openAuditBiddingAnnModal = (annId) => {
  const ann = MockData.biddingAnnouncements.find(a => a.id == annId);
  if (!ann) return;
  document.getElementById('audit-bidding-ann-target-id').value = annId;
  const titleEl = document.getElementById('audit-modal-bidding-ann-title');
  if (titleEl) titleEl.innerText = `竞价公告审核 - ${ann.title}`;
  const inputEl = document.getElementById('audit-bidding-ann-reject-input');
  if (inputEl) inputEl.value = '';
  const counterEl = inputEl?.parentElement?.querySelector('.char-counter');
  if (counterEl) counterEl.innerText = '0/50';
  document.getElementById('audit-bidding-ann-reject-box').style.display = 'none';
  const passRadio = document.querySelector('input[name="audit-bidding-ann-radio"][value="pass"]');
  if (passRadio) passRadio.checked = true;
  UI.showModal('modal-audit-bidding-ann');
};

window.confirmSubmitAuditBiddingAnn = () => {
  const id = document.getElementById('audit-bidding-ann-target-id').value;
  const ann = MockData.biddingAnnouncements.find(a => a.id == id);
  if (!ann) return;
  const result = document.querySelector('input[name="audit-bidding-ann-radio"]:checked')?.value;
  if (result === 'pass') {
    ann.auditStatus = '已通过';
    delete ann.rejectReason;
    UI.toast(`公告 ${id} 审核通过并已发布入大厅`, 'success');
  } else {
    const reason = document.getElementById('audit-bidding-ann-reject-input').value.trim();
    if (!reason) {
      UI.toast('请输入审核未通过的原因说明（最多50字）', 'warning');
      return;
    }
    ann.auditStatus = '已拒绝';
    ann.rejectReason = reason;
    UI.toast(`公告 ${id} 审核已拒绝`, 'error');
  }
  UI.closeModal('modal-audit-bidding-ann');
  AdminApp.renderBidding();
};

window.cycleShopStatus = (shopId) => {
  const shop = MockData.shops.find(s => s.id == shopId);
  if (!shop) return;
  if (shop.status === '未开店' || !shop.status) {
    shop.status = '待审核';
    delete shop.rejectReason;
    delete shop.suspendReason;
  } else if (shop.status === '待审核') {
    shop.status = '正常营业';
    delete shop.rejectReason;
    delete shop.suspendReason;
  } else if (shop.status === '正常营业') {
    shop.status = '闭店中';
    shop.rejectReason = '资质文件模糊，无法辨识营业执照主体公章。';
    delete shop.suspendReason;
  } else if (shop.status === '闭店中' && shop.rejectReason) {
    shop.status = '闭店中';
    shop.suspendReason = '商家售卖违规大宗物资产品，平台强行闭店限期整改。';
    delete shop.rejectReason;
  } else {
    shop.status = '未开店';
    delete shop.rejectReason;
    delete shop.suspendReason;
  }
  UI.toast(`[演示] 店铺状态已切换，当前状态: ${shop.status}`, 'info');
  AdminApp.renderMerchantShops();
};

if (!UI.openImagePreview) {
  UI.openImagePreview = (url) => {
    let modal = document.getElementById('modal-image-preview');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'modal-image-preview';
      modal.className = 'modal-overlay';
      modal.style.cssText = 'display:none; align-items:center; justify-content:center; background: rgba(0,0,0,0.5); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 2000;';
      modal.onclick = (e) => { if(e.target === modal) modal.style.display = 'none'; };
      modal.innerHTML = `
        <div style="background:#fff; padding:12px; border-radius:12px; max-width:80%; max-height:80%; position:relative; box-shadow:0 20px 25px rgba(0,0,0,0.25);">
          <button style="position:absolute; right:10px; top:10px; border:none; background:none; font-size:24px; cursor:pointer; font-weight:bold;" onclick="document.getElementById('modal-image-preview').style.display='none'">&times;</button>
          <img id="preview-large-img" src="" style="max-width:100%; max-height:70vh; object-fit:contain; border-radius:6px; display:block; margin-top:24px;">
        </div>
      `;
      document.body.appendChild(modal);
    }
    document.getElementById('preview-large-img').src = url;
    modal.style.display = 'flex';
  };
}
