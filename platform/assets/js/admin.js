
function formatTimeSec(str) {
  if (!str || str === "--") return "--";
  str = String(str).trim();
  if (str.length === 10) return str + " 00:00:00";
  if (str.length === 16) return str + ":00";
  return str;
}
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
    this.renderBidding();
    this.renderConfig();
    this.renderDecorationConfig();
    this.renderAgreementConfig();

    // 默认激活第一个菜单
    const defaultPage = document.querySelector('[data-page="page-data"]') || document.querySelector('.menu-item');
    if (defaultPage) defaultPage.click();

    const orderMenu = document.querySelector('[data-page="tab-trades-order"]');
    if (orderMenu) {
      orderMenu.addEventListener('click', () => {
        AdminApp.hideOrderDetailPage();
      });
    }
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
    const shopNameKw = document.getElementById('admin-search-shop-name')?.value.trim().toLowerCase() || '';
    const companyNameKw = document.getElementById('admin-search-company-name')?.value.trim().toLowerCase() || '';
    const statusKw = document.getElementById('admin-search-shop-status')?.value || '';

    let filtered = (MockData.shops || []).filter(s => s.status !== '未开店');
    
    // Exact match for Merchant ID
    if (shopIdKw) {
      filtered = filtered.filter(s => s.id.toLowerCase() === shopIdKw);
    }
    // Fuzzy match for Shop Name
    if (shopNameKw) {
      filtered = filtered.filter(s => s.shopName.toLowerCase().includes(shopNameKw));
    }
    // Fuzzy match for Company Name
    if (companyNameKw) {
      filtered = filtered.filter(s => s.companyName && s.companyName.toLowerCase().includes(companyNameKw));
    }
    // Status match
    if (statusKw) {
      if (statusKw === '审核中') {
        filtered = filtered.filter(s => s.status === '待审核');
      } else if (statusKw === '正常营业') {
        filtered = filtered.filter(s => s.status === '正常' || s.status === '正常营业');
      } else if (statusKw === '闭店中') {
        filtered = filtered.filter(s => s.status === '已关停' || s.status === '已禁用' || s.status === '审核未通过');
      }
    }

    // Sort: updated time new-to-old, default
    filtered.sort((a, b) => {
      const tA = new Date(a.updateTime || '2026-07-20 12:00:00').getTime();
      const tB = new Date(b.updateTime || '2026-07-20 12:00:00').getTime();
      return tB - tA;
    });

    const countEl = document.getElementById('shop-management-count');
    if (countEl) countEl.innerText = `共 ${filtered.length} 个商家店铺`;

    let html = '';
    filtered.forEach((s, idx) => {
      const prodCount = MockData.products.filter(p => p.shopId == s.id || p.shopName === s.shopName).length;
      
      let statusTag = '';
      if (s.status === '正常营业' || s.status === '正常') {
        statusTag = '<span class="tag tag-success">正常营业</span>';
      } else if (s.status === '待审核') {
        statusTag = '<span class="tag tag-warning">审核中</span>';
      } else {
        statusTag = s.suspendReason ? '<span class="tag tag-danger">闭店中</span>' : '<span class="tag tag-secondary">闭店中</span>';
      }

      let reasonTip = '';
      if (s.suspendReason) {
        reasonTip = `<div class="text-[10px] text-danger mt-1">已下架理由: ${s.suspendReason}</div>`;
      } else if (s.rejectReason) {
        reasonTip = `<div class="text-[10px] text-danger mt-1" style="font-size:11px; color:#ef4444;">拒审原因: ${s.rejectReason}</div>`;
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
          <td style="padding:12px; text-align:center; font-weight:bold; color:var(--primary-color);">${prodCount.toLocaleString('zh-CN')}</td>
          <td style="padding:12px; font-family:monospace; font-size:12px;">${s.creditCode || '--'}</td>
          <td style="padding:12px; text-align:center; font-family:monospace; font-size:12px;">${s.updateTime || '2026-07-20 12:00:00'}</td>
          <td style="padding:12px; text-align:center;">${actionBtn}</td>
        </tr>
      `;
    });

    tbody.innerHTML = html || '<tr><td colspan="11" class="text-center py-8 text-secondary">暂无符合条件的商家店铺记录</td></tr>';
  },

  resetMerchantShopsFilter() {
    if (document.getElementById('admin-search-shop-id')) document.getElementById('admin-search-shop-id').value = '';
    if (document.getElementById('admin-search-shop-name')) document.getElementById('admin-search-shop-name').value = '';
    if (document.getElementById('admin-search-company-name')) document.getElementById('admin-search-company-name').value = '';
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

    // Default sorting by createTime (new-to-old)
    flatList.sort((a, b) => {
      const tA = new Date(a.createTime || '2026-07-01 00:00:00').getTime();
      const tB = new Date(b.createTime || '2026-07-01 00:00:00').getTime();
      return tB - tA;
    });

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
          <td style="font-family:monospace; font-size:12px;">${formatTimeSec(c.createTime || '2026-06-01 09:00:00')}</td>
          <td style="font-family:monospace; font-size:12px;">${formatTimeSec(c.updateTime || '2026-07-01 10:00:00')}</td>
          <td>
            <button class="btn btn-text btn-sm text-primary" onclick="window.openAddCategoryModal('${c.parentId}', '${c.id}', '${c.name}', true)">编辑</button>
            ${c.level < 3 ? `<button class="btn btn-text btn-sm text-primary" onclick="window.openAddCategoryModal('${c.id}', '', '', false)">新增下级</button>` : ''}
            <button class="btn btn-text btn-sm ${c.status === 1 ? 'text-danger' : 'text-success'}" onclick="window.toggleCategoryStatus('${c.id}', ${c.status})">${c.status === 1 ? '禁用' : '启用'}</button>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="8" class="text-center p-4 text-secondary">没有找到符合条件的分类数据</td></tr>';
    this._appendPagination(tbody, flatList.length);
  },

  resetBaseProductsFilter() {
    const levelSelect = document.getElementById('filter-cat-level');
    if (levelSelect) levelSelect.value = '';
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
    if (!tbody) return;

    const shopKw = document.getElementById('filter-merchant-prod-shop')?.value.trim().toLowerCase();
    const listNoKw = document.getElementById('filter-merchant-prod-listno')?.value.trim().toLowerCase();
    const startDateKw = document.getElementById('filter-merchant-prod-start')?.value;
    const endDateKw = document.getElementById('filter-merchant-prod-end')?.value;
    const statusKw = document.getElementById('filter-merchant-prod-status')?.value;

    let list = MockData.products || [];

    // Filter by Shop Name (Fuzzy)
    if (shopKw) {
      list = list.filter(p => p.shopName && p.shopName.toLowerCase().includes(shopKw));
    }

    // Filter by List No (Exact)
    if (listNoKw) {
      list = list.filter(p => {
        const listNoStr = (p.listNo || ('LST260701' + String(p.id).padStart(4, '0'))).toLowerCase();
        return listNoStr === listNoKw;
      });
    }

    // Filter by Date Range (listTime)
    if (startDateKw) {
      const startMs = new Date(startDateKw + ' 00:00:00').getTime();
      list = list.filter(p => new Date(p.listTime || '2026-06-01 09:00:00').getTime() >= startMs);
    }
    if (endDateKw) {
      const endMs = new Date(endDateKw + ' 23:59:59').getTime();
      list = list.filter(p => new Date(p.listTime || '2026-06-01 09:00:00').getTime() <= endMs);
    }

    // Filter by Status
    if (statusKw !== '' && statusKw !== undefined) {
      list = list.filter(p => {
        // Map mock status to enum numbers: 0=待审核, 1=已上架, 2=已下架, 3=已售罄
        let mappedStatus = p.status;
        if (p.status === '待审核') mappedStatus = 0;
        if (p.status === '已上架') mappedStatus = 1;
        if (p.status === '已下架' || p.status === '未上架') mappedStatus = 2;
        if (p.status === '已售罄') mappedStatus = 3;
        return String(mappedStatus) === String(statusKw);
      });
    }

    // Sort: default new-to-old by createTime
    list.sort((a, b) => {
      const tA = new Date(a.createTime || '2026-05-20 09:00:00').getTime();
      const tB = new Date(b.createTime || '2026-05-20 09:00:00').getTime();
      return tB - tA;
    });

    let html = '';
    list.forEach((p, idx) => {
      const shop = MockData.shops.find(s => s.id === p.shopId || s.shopName === p.shopName);
      const companyName = shop ? shop.companyName : (p.companyName || '华东物资贸易有限公司');

      let statusTag = '';
      let actBtn = '';

      // Mock status normalization
      let currentStatus = p.status;
      if (p.status === '未上架') currentStatus = 2;
      if (p.status === '已下架') currentStatus = 2;
      if (p.status === '已售罄') currentStatus = 3;

      if (currentStatus === 0) {
        statusTag = `<span class="tag tag-warning">待审核</span>`;
        actBtn = `
          <button class="btn btn-text btn-sm text-primary" onclick="AdminApp.editProduct('${p.id}')">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="window.openAuditProductModal('${p.id}')" style="margin-left:4px;">审核</button>
        `;
      } else if (currentStatus === 1) {
        statusTag = `<span class="tag tag-success">已上架</span>`;
        actBtn = `<button class="btn btn-text btn-sm text-danger" onclick="window.forceOfflineProduct('${p.id}')">强制下架</button>`;
      } else if (currentStatus === 2) {
        statusTag = `<span class="tag tag-danger">已下架</span>`;
        if (p.rejectReason) {
          statusTag += `<div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2; white-space:nowrap;">(拒审原因：${p.rejectReason})</div>`;
        } else if (p.offlineReason || p.downReason) {
          statusTag += `<div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2; white-space:nowrap;">(强制下架原因：${p.offlineReason || p.downReason})</div>`;
        } else {
          statusTag += `<div style="font-size:11px; color:#64748b; margin-top:4px; line-height:1.2; white-space:nowrap;">(自主下架)</div>`;
        }
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      } else if (currentStatus === 3) {
        statusTag = `<span class="tag tag-danger" style="background:#fee2e2; color:#991b1b;">已售罄</span>`;
        actBtn = `<span class="text-secondary text-xs" style="color:#94a3b8;">--</span>`;
      }

      let shelfTypeTag = p.shelfType === '预售' 
        ? `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591; padding:2px 6px; font-size:11px;">预售</span>`
        : `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; font-size:11px;">现货</span>`;

      const listNoStr = p.listNo || ('LST260701' + String(p.id).replace(/[^\d]/g, '').padStart(4, '0'));

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold; color:var(--primary-color);">${listNoStr}</td>
          <td><img src="${p.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;"></td>
          <td style="font-weight:bold; color:#0f172a;">${p.shopName}</td>
          <td style="font-size:12px; color:#475569;">${companyName}</td>
          <td><div style="font-weight:bold;">${p.name}</div></td>
          <td>${catMap[p.category] || p.category}</td>
          <td>${shelfTypeTag}</td>
          <td class="text-danger font-bold">${p.priceStr}</td>
          <td class="font-bold" style="color:#0f172a;">${(p.sales || 0).toLocaleString()}</td>
          <td class="text-xs text-secondary">${formatTimeSec(p.listTime)}</td>
          <td class="text-xs text-secondary">${formatTimeSec(p.createTime)}</td>
          <td class="text-xs text-secondary">${p.opTime || '2026-06-01 10:00:00'}</td>
          <td>${statusTag}</td>
          <td>
            <div style="display:flex; gap:8px; align-items:center;">
              ${actBtn}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html || '<tr><td colspan="15" class="text-center p-4 text-secondary">没有找到符合条件的商品</td></tr>';
    this._appendPagination(tbody, list.length);
  },

  resetMerchantProductsFilter() {
    if (document.getElementById('filter-merchant-prod-shop')) document.getElementById('filter-merchant-prod-shop').value = '';
    if (document.getElementById('filter-merchant-prod-listno')) document.getElementById('filter-merchant-prod-listno').value = '';
    if (document.getElementById('filter-merchant-prod-start')) document.getElementById('filter-merchant-prod-start').value = '';
    if (document.getElementById('filter-merchant-prod-end')) document.getElementById('filter-merchant-prod-end').value = '';
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
    if (createTimeEl) createTimeEl.value = p.createTime || '2026-05-20 14:30:00';
    const listTimeEl = document.getElementById('edit-prod-list-time');
    if (listTimeEl) listTimeEl.value = p.listTime || '2026-06-01 10:00:00';
    const opTimeEl = document.getElementById('edit-prod-op-time');
    if (opTimeEl) opTimeEl.value = p.opTime || '2026-06-01 10:00:00';

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
    if (createTimeEl) p.createTime = createTimeEl.value || '2026-05-20 14:30:00';
    const listTimeEl = document.getElementById('edit-prod-list-time');
    if (listTimeEl) p.listTime = listTimeEl.value || '2026-06-01 10:00:00';

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
    if (!tbody) return;

    const demandIdKw = (document.getElementById('filter-demand-id')?.value || '').trim();
    const goodsKw = (document.getElementById('filter-demand-goods')?.value || '').trim().toLowerCase();

    let list = MockData.demands || [];

    // Filter by Demand ID (Exact)
    if (demandIdKw) {
      list = list.filter(d => d.id === demandIdKw);
    }

    // Filter by goods name (fuzzy)
    if (goodsKw) {
      list = list.filter(d => (d.goodsName || d.title || '').toLowerCase().includes(goodsKw));
    }

    // Sort: default by publishTime (createTime) descending
    list.sort((a, b) => {
      const tA = new Date(a.publishTime || '2026-07-20 09:00:00').getTime();
      const tB = new Date(b.publishTime || '2026-07-20 09:00:00').getTime();
      return tB - tA;
    });

    let html = '';
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

      // Parse quantity with unit display
      const goodsText = d.goodsName || d.title || '--';
      const qtyMatch = goodsText.match(/(\d[\d,]*\.?\d*)\s*(吨|立方|包|张|件|个|千克|kg)/i);
      const qtyStr = qtyMatch ? `${qtyMatch[1]} ${qtyMatch[2]}` : `${d.quantity || '--'}`;
      const deliveryPeriod = d.deliveryPeriod || d.deliveryTime || '--';

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${d.id}</td>
          <td style="font-weight:bold; color:#0f172a;">${d.buyerName}</td>
          <td style="font-family:monospace; color:#0284c7;">${d.buyerPhone || '--'}</td>
          <td style="font-weight:bold; color:#0f172a;">${goodsText}</td>
          <td style="font-weight:bold; color:#1e293b;">${qtyStr}</td>
          <td>${deliveryPeriod}</td>
          <td style="font-size:12px; color:#64748b;">${formatTimeSec(d.publishTime)}</td>
          <td style="font-size:12px; color:#64748b;">${d.updateTime || d.publishTime || '--'}</td>
          <td style="vertical-align:middle;">${statusTag}</td>
          <td>
            <div style="display:flex; gap:6px; align-items:center;">
              ${actBtn}
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="11" class="text-center p-4 text-secondary">暂无供求数据</td></tr>';
    this._appendPagination(tbody, list.length);
  },

  resetDemandsFilter() {
    if (document.getElementById('filter-demand-id')) document.getElementById('filter-demand-id').value = '';
    if (document.getElementById('filter-demand-goods')) document.getElementById('filter-demand-goods').value = '';
    this.renderDemands();
  },

  // === 5. 交易中心 (订单透视) ===
  renderOrders() {
    const tbody = document.querySelector('#table-orders tbody');
    if (!tbody) return;

    const orderIdKw = document.getElementById('filter-admin-order-id')?.value.trim().toLowerCase() || '';
    const typeKw = document.getElementById('filter-admin-order-type')?.value || '';
    const buyerKw = document.getElementById('filter-admin-order-buyer')?.value.trim().toLowerCase() || '';
    const sellerShopKw = document.getElementById('filter-admin-order-seller-shop')?.value.trim().toLowerCase() || '';
    const sellerCompanyKw = document.getElementById('filter-admin-order-seller-company')?.value.trim().toLowerCase() || '';
    const statusKw = document.getElementById('filter-admin-order-status')?.value || '';
    const dateRangeKw = document.getElementById('filter-admin-order-date-range')?.value.trim() || '';

    let list = MockData.orders || [];

    // Filter by Order ID (Exact)
    if (orderIdKw) {
      list = list.filter(o => o.id.toLowerCase() === orderIdKw);
    }
    // Filter by Order Type
    if (typeKw) {
      list = list.filter(o => (o.type || '现货交易订单') === typeKw);
    }
    // Filter by Buyer
    if (buyerKw) {
      list = list.filter(o => o.buyerName && o.buyerName.toLowerCase().includes(buyerKw));
    }
    // Filter by Seller Shop
    if (sellerShopKw) {
      list = list.filter(o => o.shopName && o.shopName.toLowerCase().includes(sellerShopKw));
    }
    // Filter by Seller Company
    if (sellerCompanyKw) {
      list = list.filter(o => {
        const shop = MockData.shops.find(s => s.id === o.shopId || s.shopName === o.shopName);
        const comp = shop ? shop.companyName : (o.sellerCompany || '');
        return comp.toLowerCase().includes(sellerCompanyKw);
      });
    }
    // Filter by Status
    if (statusKw) {
      list = list.filter(o => {
        let statusText = '';
        if (o.status === 0) statusText = '待买家签约';
        else if (o.status === 5) statusText = '待卖家签约';
        else if (o.status === 4) statusText = '待付款';
        else if (o.status === 1) statusText = '待发货';
        else if (o.status === 2) statusText = '待签收';
        else if (o.status === 3) statusText = '已完成';
        else if (o.status === -1) statusText = '已取消';
        else if (o.status === -2) statusText = '已关闭';
        
        if (statusKw === '待签约') return o.status === 0 || o.status === 5;
        return statusText === statusKw;
      });
    }
    // Filter by Date Range
    if (dateRangeKw) {
      const parts = dateRangeKw.split('~').map(s => s.trim());
      if (parts[0]) {
        const startMs = new Date(parts[0] + ' 00:00:00').getTime();
        list = list.filter(o => new Date(o.time || '2026-07-20 09:00:00').getTime() >= startMs);
      }
      if (parts[1]) {
        const endMs = new Date(parts[1] + ' 23:59:59').getTime();
        list = list.filter(o => new Date(o.time || '2026-07-20 09:00:00').getTime() <= endMs);
      }
    }

    // Default sorting: createTime (o.time) new-to-old
    list.sort((a, b) => {
      const tA = new Date(a.time || '2026-07-20 09:00:00').getTime();
      const tB = new Date(b.time || '2026-07-20 09:00:00').getTime();
      return tB - tA;
    });

    let html = '';
    list.forEach((o, idx) => {
      let statusText = '';
      let statusColor = '';
      if (o.status === 0) { statusText = '待买家签约'; statusColor = '#fa8c16'; }
      else if (o.status === 5) { statusText = '待卖家签约'; statusColor = '#c41d7f'; }
      else if (o.status === 4) { statusText = '待付款'; statusColor = '#d46b08'; }
      else if (o.status === 1) { statusText = '待发货'; statusColor = '#1677ff'; }
      else if (o.status === 2) { statusText = '待签收'; statusColor = '#0958d9'; }
      else if (o.status === 3) { statusText = '已完成'; statusColor = '#52c41a'; }
      else if (o.status === -1) { statusText = '已取消'; statusColor = '#ef4444'; }
      else if (o.status === -2) { statusText = '已关闭'; statusColor = '#64748b'; }
      else { statusText = '待签约'; statusColor = '#fa8c16'; }
      
      let statusTag = `<span class="tag" style="background:${statusColor}15; color:${statusColor}; border:1px solid ${statusColor}40; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">${statusText}</span>`;
      
      let confirmReceiptBtn = o.status === 2 
        ? `<button class="btn btn-primary btn-sm" onclick="AdminApp.confirmAdminReceipt('${o.id}')" style="background:#10b981; border-color:#10b981;">代确认收货</button>` 
        : '';

      let closeBtn = (o.status !== -1 && o.status !== -2 && o.status !== 3)
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
          <td><a href="javascript:void(0)" onclick="AdminApp.showOrderDetailPage('${o.id}')" style="font-weight:bold; color:var(--primary-color); font-family:monospace;">${o.id}</a></td>
          <td><span class="tag tag-info" style="font-size:11px; background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd;">${o.type || '现货交易订单'}</span></td>
          <td style="font-weight:bold;">${o.buyerName}</td>
          <td style="font-family:monospace; color:#0284c7;">${buyerPhone}</td>
          <td style="font-weight:bold;">${o.shopName}</td>
          <td style="font-size:12px; color:#475569;">${companyName}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td style="font-size:12px;"><span style="color:#0284c7; font-weight:bold;">${rateStr}</span> <div style="font-size:10px; color:#64748b;">(¥${commFee})</div></td>
          <td>${statusTag}</td>
          <td style="font-size:12px; color:#64748b;">${formatTimeSec(o.time)}</td>
          <td>
            <div style="display:flex; align-items:center; gap:6px;">
              ${confirmReceiptBtn}
              ${closeBtn}
              <button class="btn btn-text btn-sm" onclick="AdminApp.showOrderDetailPage('${o.id}')">详情</button>
            </div>
          </td>
        </tr>
      `;
    });
    tbody.innerHTML = html || '<tr><td colspan="12" class="text-center p-4 text-secondary">暂无符合条件的订单记录</td></tr>';
    this._appendPagination(tbody, list.length);
  },

  resetOrdersFilter() {
    if (document.getElementById('filter-admin-order-id')) document.getElementById('filter-admin-order-id').value = '';
    if (document.getElementById('filter-admin-order-type')) document.getElementById('filter-admin-order-type').value = '';
    if (document.getElementById('filter-admin-order-buyer')) document.getElementById('filter-admin-order-buyer').value = '';
    if (document.getElementById('filter-admin-order-seller-shop')) document.getElementById('filter-admin-order-seller-shop').value = '';
    if (document.getElementById('filter-admin-order-seller-company')) document.getElementById('filter-admin-order-seller-company').value = '';
    if (document.getElementById('filter-admin-order-status')) document.getElementById('filter-admin-order-status').value = '';
    if (document.getElementById('filter-admin-order-date-range')) document.getElementById('filter-admin-order-date-range').value = '';
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



  // === 8. 竞价中心 (审核监控) ===
  renderBidding() {
    const resBody = document.querySelector('#table-admin-bidding-res tbody');
    if (resBody) {
      // 读取筛选条件
      const fId = (document.getElementById('filter-bidres-id')?.value || '').trim();
      const fShop = (document.getElementById('filter-bidres-shop')?.value || '').trim().toLowerCase();
      const fCompany = (document.getElementById('filter-bidres-company')?.value || '').trim().toLowerCase();
      const fName = (document.getElementById('filter-bidres-name')?.value || '').trim().toLowerCase();
      const fSpecs = (document.getElementById('filter-bidres-specs')?.value || '').trim().toLowerCase();
      const fStatus = (document.getElementById('filter-bidres-status')?.value || '');

      let filtered = MockData.biddingResources.filter(r => {
        if (fId && r.id !== fId) return false;
        if (fShop && !r.shopName.toLowerCase().includes(fShop)) return false;
        if (fCompany && !(r.companyName || '').toLowerCase().includes(fCompany)) return false;
        if (fName && !r.name.toLowerCase().includes(fName)) return false;
        if (fSpecs && !(r.specs || '').toLowerCase().includes(fSpecs)) return false;
        if (fStatus && r.status !== fStatus) return false;
        return true;
      });

      // Sort newest first
      filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      let resHtml = '';
      filtered.forEach((r, idx) => {
        let tag;
        if (r.status === '已通过') tag = `<span class="tag tag-success">已通过</span>`;
        else if (r.status === '已撤销' || r.status === '未通过') tag = `<span class="tag tag-danger">未通过</span><div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2;">拒审原因：${r.rejectReason || '提报规格材料不全'}</div>`;
        else tag = `<span class="tag tag-warning">待审核</span>`;

        let btn = '';
        if (r.status === '待审核') {
          btn = `<button class="btn btn-primary btn-sm" onclick="window.openAuditBiddingResModal('${r.id}')">审核</button>`;
        }
        resHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td style="font-family:monospace; font-size:12px; font-weight:bold;">${r.id}</td>
            <td><img src="${r.image}" style="width:60px;height:40px;border-radius:4px;object-fit:cover;cursor:pointer;" onclick="UI.previewDocument('资源图片', '${r.image}')"></td>
            <td>${r.shopName}</td>
            <td>${r.companyName || '--'}</td>
            <td style="font-weight:bold; color:#0f172a;">${r.name}</td>
            <td style="font-size:12px; color:#64748b;">${r.specs || '规格标准'}</td>
            <td>${tag}</td>
            <td>${formatTimeSec(r.createdAt)}</td>
            <td>${formatTimeSec(r.updatedAt)}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      resBody.innerHTML = resHtml;
      this._appendPagination(resBody, filtered.length);
    }

    // 竞价公告部分
    const annBody = document.querySelector('#table-admin-bidding-ann tbody');
    if (annBody) {
      // 读取公告筛选条件
      const fAnnId = (document.getElementById('filter-bidann-id')?.value || '').trim();
      const fAnnTitle = (document.getElementById('filter-bidann-title')?.value || '').trim().toLowerCase();
      const fAnnShop = (document.getElementById('filter-bidann-shop')?.value || '').trim().toLowerCase();
      const fAnnCompany = (document.getElementById('filter-bidann-company')?.value || '').trim().toLowerCase();
      const fAnnStatus = (document.getElementById('filter-bidann-status')?.value || '');

      // Helper: compute display status for an announcement
      const getDisplayStatus = (a) => {
        const aStatus = a.auditStatus || '已通过';
        if (aStatus === '待审核') return '待审核';
        if (aStatus === '已拒绝' || aStatus === '已撤回') return '已下架';
        // 已通过 → based on stage
        if (a.status === 4) return '已结束';
        if (a.status === 0) return '竞价中';
        if (a.status === 1) return '竞价中';
        if (a.status === 2) return '竞价中';
        if (a.status === 3) return '等待公布';
        return '竞价中';
      };

      let filteredAnn = MockData.biddingAnnouncements.filter(a => {
        const shop = MockData.shops.find(s => s.id === a.shopId);
        const companyName = shop ? (shop.companyName || '') : '';

        if (fAnnId && a.id !== fAnnId) return false;
        if (fAnnTitle && !a.title.toLowerCase().includes(fAnnTitle)) return false;
        if (fAnnShop && !a.shopName.toLowerCase().includes(fAnnShop)) return false;
        if (fAnnCompany && !companyName.toLowerCase().includes(fAnnCompany)) return false;
        if (fAnnStatus && getDisplayStatus(a) !== fAnnStatus) return false;
        return true;
      });

      // Sort newest first
      filteredAnn.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      let annHtml = '';
      filteredAnn.forEach((a, idx) => {
        const aStatus = a.auditStatus || '已通过';
        const shop = MockData.shops.find(s => s.id === a.shopId);
        const companyName = shop ? (shop.companyName || '--') : '--';

        let combinedTag = '';
        let btn = '';
        
        if (aStatus === '待审核') {
          combinedTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待审核</span>`;
          btn = `<button class="btn btn-primary btn-sm" onclick="window.openAuditBiddingAnnModal('${a.id}')">审核</button>`;
        } else if (aStatus === '已拒绝') {
          combinedTag = `<span class="tag tag-danger" style="background:#fff2f0; color:#ff4d4f; border:1px solid #ffccc7;">已下架</span>
                         <div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2;">拒审原因：${a.rejectReason || '起拍底价设置过低'}</div>`;
          btn = '';
        } else if (aStatus === '已撤回' || aStatus === '已下架') {
          combinedTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#555; border:1px solid #d9d9d9;">已下架</span>
                         <div style="font-size:11px; color:#64748b; margin-top:4px; line-height:1.2;">(主动下架)</div>`;
          btn = '';
        } else {
          // 已通过
          if (a.status === 4) {
            combinedTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#64748b; border:1px solid #cbd5e1;">已结束</span>`;
            btn = `<button class="btn btn-text btn-sm text-primary" onclick="AdminApp.showBiddingDetail('${a.id}')">查看详情</button>`;
          } else {
            let stageName = '';
            if (a.status === 0) stageName = '竞价中';
            else if (a.status === 1) stageName = '竞价中';
            else if (a.status === 2) stageName = '竞价中';
            else if (a.status === 3) stageName = '等待公布';
            else stageName = '竞价中';
            
            combinedTag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f;">${stageName}</span>`;
            btn = `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.forceOfflineBiddingAnn('${a.id}')">强制下架</button>
                   <button class="btn btn-text btn-sm text-primary" style="margin-left:4px;" onclick="AdminApp.showBiddingDetail('${a.id}')">查看详情</button>`;
          }
        }

        annHtml += `
          <tr>
            <td>${idx + 1}</td>
            <td>${a.id}</td>
            <td><div style="font-weight:bold; color:#0f172a; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${a.title}">${a.title}</div></td>
            <td>${a.shopName}</td>
            <td>${companyName}</td>
            <td>${a.resId}</td>
            <td style="font-weight:bold; color:#475569;">${a.startPrice}</td>
            <td style="font-weight:bold; color:#ef4444;">${a.currentMaxOffer || a.startPrice}</td>
            <td>${combinedTag}</td>
            <td>${formatTimeSec(a.createdAt || a.createTime || '2026-07-01 09:00:00')}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      annBody.innerHTML = annHtml;
      this._appendPagination(annBody, filteredAnn.length);
    }
  },

  resetBidResFilter() {
    ['filter-bidres-id', 'filter-bidres-shop', 'filter-bidres-company', 'filter-bidres-name', 'filter-bidres-specs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const statusEl = document.getElementById('filter-bidres-status');
    if (statusEl) statusEl.value = '';
    this.renderBidding();
  },

  resetBidAnnFilter() {
    ['filter-bidann-id', 'filter-bidann-title', 'filter-bidann-shop', 'filter-bidann-company'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const statusEl = document.getElementById('filter-bidann-status');
    if (statusEl) statusEl.value = '';
    this.renderBidding();
  },

  // === 9. 配置中心 (抽佣规则: 支持 global, merchant, category 三种) ===
  renderConfig(isSubmit = false) {
    const tbody = document.querySelector('#table-admin-commission tbody');
    if (!tbody) return;

    const fType = document.getElementById('filter-comm-type')?.value;
    const fName = (document.getElementById('filter-comm-name')?.value || '').trim().toLowerCase();
    const fTarget = (document.getElementById('filter-comm-target')?.value || '').trim().toLowerCase();

    // Check mandatory filter only on explicit query action
    if (isSubmit && !fType) {
      UI.toast('筛选时必须选择“抽佣模式”！', 'warning');
      return;
    }

    let filtered = MockData.commissionRules.filter(c => {
      if (fType && c.type !== fType) return false;
      if (fName && !c.name.toLowerCase().includes(fName)) return false;
      if (fTarget && !c.target.toLowerCase().includes(fTarget)) return false;
      return true;
    });

    let html = '';
    filtered.forEach((c, idx) => {
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
          <td style="font-family:monospace; font-weight:bold; font-size:12px;">${c.id || ('RULE00' + (idx + 1))}</td>
          <td style="font-weight:bold; color:#0f172a;">${c.name}</td>
          <td>${typeBadge}</td>
          <td style="color:#475569; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${c.target}">${c.target}</td>
          <td class="font-bold text-danger">${c.rate}</td>
          <td style="font-size:12px; color:#64748b;">${formatTimeSec(c.createdAt)}</td>
          <td><div class="flex gap-2">${btn}</div></td>
        </tr>
      `;
    });
    tbody.innerHTML = html;
    this._appendPagination(tbody, filtered.length);
  },

  resetCommFilter() {
    const typeEl = document.getElementById('filter-comm-type');
    const nameEl = document.getElementById('filter-comm-name');
    const targetEl = document.getElementById('filter-comm-target');
    if (typeEl) typeEl.value = '';
    if (nameEl) nameEl.value = '';
    if (targetEl) targetEl.value = '';
    this.renderConfig();
  },

  toggleCommissionRuleType() {
    const type = document.getElementById('comm-rule-type')?.value;
    const targetGroup = document.getElementById('comm-rule-target-group');
    const targetSelect = document.getElementById('comm-rule-target-select');
    const cascaderWrapper = document.getElementById('comm-category-cascader-wrapper');
    const targetLabel = document.getElementById('comm-rule-target-label');
    if (!targetGroup) return;

    if (type === 'global') {
      targetGroup.style.display = 'none';
    } else if (type === 'merchant') {
      targetGroup.style.display = 'block';
      if (targetSelect) targetSelect.style.display = 'block';
      if (cascaderWrapper) cascaderWrapper.style.display = 'none';
      targetLabel.innerText = '针对商家店铺选择 *';
      let html = '';
      (MockData.shops || []).forEach(s => {
        html += `<option value="${s.shopName}">${s.shopName} (${s.companyName || s.id})</option>`;
      });
      if (targetSelect) targetSelect.innerHTML = html;
    } else if (type === 'category') {
      targetGroup.style.display = 'block';
      if (targetSelect) targetSelect.style.display = 'none';
      if (cascaderWrapper) cascaderWrapper.style.display = 'block';
      targetLabel.innerText = '针对商品类别选择 (三级级联选择) *';
      this.initCommCatCascader();
    }
  },

  _commPickedCatNames: [],
  _commL1Index: 0,
  _commL2Index: 0,

  initCommCatCascader() {
    const cats = MockData.productCategories || [];
    const l1Container = document.getElementById('comm-cat-l1-list');
    if (!l1Container || cats.length === 0) return;

    let l1Html = '';
    cats.forEach((c1, idx) => {
      l1Html += `
        <div class="comm-cat-l1-item" style="padding:8px 12px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center; ${idx === this._commL1Index ? 'background:#f1f5f9; font-weight:bold; color:#7c3aed;' : 'color:#334155;'}" onclick="AdminApp.selectCommL1(${idx})">
          <span>${c1.name}</span>
          <span style="font-size:10px; color:#cbd5e1;">›</span>
        </div>
      `;
    });
    l1Container.innerHTML = l1Html;
    this.renderCommL2();
  },

  selectCommL1(idx) {
    this._commL1Index = idx;
    this._commL2Index = 0;
    this.initCommCatCascader();
  },

  renderCommL2() {
    const cats = MockData.productCategories || [];
    const c1 = cats[this._commL1Index];
    const l2Container = document.getElementById('comm-cat-l2-list');
    if (!l2Container || !c1 || !c1.children) return;

    let l2Html = '';
    c1.children.forEach((c2, idx) => {
      l2Html += `
        <div class="comm-cat-l2-item" style="padding:8px 12px; cursor:pointer; font-size:12px; display:flex; justify-content:space-between; align-items:center; ${idx === this._commL2Index ? 'background:#f8fafc; font-weight:bold; color:#7c3aed;' : 'color:#334155;'}" onclick="AdminApp.selectCommL2(${idx})">
          <span>${c2.name}</span>
          <span style="font-size:10px; color:#cbd5e1;">›</span>
        </div>
      `;
    });
    l2Container.innerHTML = l2Html;
    this.renderCommL3();
  },

  selectCommL2(idx) {
    this._commL2Index = idx;
    this.renderCommL2();
  },

  renderCommL3() {
    const cats = MockData.productCategories || [];
    const c1 = cats[this._commL1Index];
    if (!c1 || !c1.children) return;
    const c2 = c1.children[this._commL2Index];
    const l3Container = document.getElementById('comm-cat-l3-list');
    if (!l3Container || !c2 || !c2.children) return;

    let l3Html = '';
    c2.children.forEach(c3 => {
      const isChecked = this._commPickedCatNames.includes(c3.name);
      l3Html += `
        <label style="display:flex; align-items:center; gap:6px; padding:6px 12px; cursor:pointer; font-size:12px; color:#334155;">
          <input type="checkbox" value="${c3.name}" ${isChecked ? 'checked' : ''} onchange="AdminApp.toggleCommCatCheck('${c3.name}', this.checked)">
          <span>${c3.name}</span>
        </label>
      `;
    });
    l3Container.innerHTML = l3Html;
  },

  toggleCommCatCheck(name, checked) {
    if (checked) {
      if (!this._commPickedCatNames.includes(name)) this._commPickedCatNames.push(name);
    } else {
      this._commPickedCatNames = this._commPickedCatNames.filter(x => x !== name);
    }
  },

  toggleCommCatPanel(e) {
    e.stopPropagation();
    const panel = document.getElementById('comm-cat-panel');
    if (panel) {
      panel.style.display = (panel.style.display === 'none' || !panel.style.display) ? 'block' : 'none';
    }
  },

  clearCommCatPicked() {
    this._commPickedCatNames = [];
    this.renderCommL3();
    const txt = document.getElementById('comm-cat-trigger-text');
    if (txt) {
      txt.innerText = '请选择商品分类';
      txt.style.color = '#94a3b8';
    }
  },

  confirmCommCatPicked() {
    const panel = document.getElementById('comm-cat-panel');
    if (panel) panel.style.display = 'none';
    const txt = document.getElementById('comm-cat-trigger-text');
    if (txt) {
      if (this._commPickedCatNames.length === 0) {
        txt.innerText = '请选择商品分类';
        txt.style.color = '#94a3b8';
      } else {
        txt.innerText = `已选择 (${this._commPickedCatNames.length}项): ` + this._commPickedCatNames.join('、');
        txt.style.color = '#7c3aed';
        txt.style.fontWeight = 'bold';
      }
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
    if (type === 'category') {
      if (this._commPickedCatNames.length > 0) {
        target = this._commPickedCatNames.join('、');
      } else {
        target = '建材-金属-螺纹钢/盘螺类';
      }
    }

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

    const renderBanners = (banners, tbodyId, type) => {
      const tbody = document.querySelector(tbodyId);
      if (!tbody) return;
      let html = '';
      banners.forEach(b => {
        let tag = b.active ? `<span class="tag tag-success">展示中</span>` : `<span class="tag tag-secondary" style="background:#f5f5f5; color:#8c8c8c; border:1px solid #d9d9d9;">隐藏中</span>`;
        let toggleText = b.active ? '隐藏' : '显示';
        html += `
          <tr>
            <td><img src="${b.url}" style="width:120px; height:48px; object-fit:cover; border-radius:4px; border:1px solid #eee;"></td>
            <td class="text-gray-500 text-sm">#/pages/mall/index</td>
            <td>${tag}</td>
            <td>
              <button class="btn btn-text btn-sm text-primary" onclick="AdminApp.toggleBannerActive('${type}', '${b.id}')">${toggleText}</button>
              <button class="btn btn-text btn-sm text-danger" onclick="AdminApp.deleteBanner('${type}', '${b.id}')">删除</button>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
    };
    
    if (MockData.decorationConfig) {
      renderBanners(MockData.decorationConfig.pcBanners, '#table-banner-pc tbody', 'pc');
      renderBanners(MockData.decorationConfig.h5Banners, '#table-banner-h5 tbody', 'h5');
    }
  },

  toggleBannerActive(type, id) {
    const config = MockData.decorationConfig;
    const list = type === 'pc' ? config.pcBanners : config.h5Banners;
    const b = list.find(x => x.id === id);
    if (!b) return;

    if (b.active) {
      const activeCount = list.filter(x => x.active).length;
      if (activeCount <= 1) {
        UI.toast('至少要有一个 Banner 处于展示状态！', 'warning');
        return;
      }
      b.active = false;
      UI.toast('Banner 已隐藏', 'success');
    } else {
      b.active = true;
      UI.toast('Banner 已展示', 'success');
    }
    this.renderDecorationConfig();
  },

  deleteBanner(type, id) {
    const config = MockData.decorationConfig;
    const list = type === 'pc' ? config.pcBanners : config.h5Banners;
    const idx = list.findIndex(x => x.id === id);
    if (idx === -1) return;

    const b = list[idx];
    if (list.length <= 1) {
      UI.toast('至少要保留一个 Banner！', 'warning');
      return;
    }

    if (b.active) {
      const activeCount = list.filter(x => x.active).length;
      if (activeCount <= 1) {
        UI.toast('无法删除唯一的展示中 Banner，请先将其他 Banner 设置为展示中！', 'warning');
        return;
      }
    }

    list.splice(idx, 1);
    UI.toast('Banner 已删除', 'success');
    this.renderDecorationConfig();
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
      // '2026-08-01 12:00:00' -> '2026-08-01T12:00'
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
      UI.toast('竞拍截止时间必须晚于现场看货截止时间！', 'error');
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
      html = `<tr><td colspan="7" style="text-align:center; padding: 20px;">暂无买家出价</td></tr>`;
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
          tag = `<span class="tag tag-primary">出价中</span>`;
        }

        // Look up buyer phone from MockData.users or synthesize
        const user = MockData.users.find(u => u.name && u.name.includes(o.buyerName)) || MockData.users.find(u => u.name && o.buyerName.includes(u.name.split(' ')[0]));
        let phone = '--';
        if (user && user.mobile) {
          phone = user.mobile.slice(0, 3) + '****' + user.mobile.slice(7);
        } else {
          let hash = 0;
          for (let i = 0; i < o.buyerName.length; i++) {
            hash = o.buyerName.charCodeAt(i) + ((hash << 5) - hash);
          }
          const middle = String(Math.abs(hash) % 9000 + 1000);
          phone = `137****${middle}`;
        }

        // Synthesize registration time (1 day before bid time)
        let regTime = '2026-07-18 09:00:00';
        if (o.time) {
          const d = new Date(o.time.replace(/-/g, '/'));
          if (!isNaN(d.getTime())) {
            d.setDate(d.getDate() - 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const dateStr = String(d.getDate()).padStart(2, '0');
            regTime = `${y}-${m}-${dateStr} 09:00`;
          }
        }
        
        html += `
          <tr>
            <td style="padding:10px;">${idx + 1}</td>
            <td style="padding:10px; font-weight:bold; color:#1e293b;">${o.buyerName}</td>
            <td style="padding:10px; font-family:monospace; color:#475569;">${phone}</td>
            <td style="padding:10px; color:#64748b;">${o.time}</td>
            <td style="padding:10px; text-align:right; font-weight:bold; color:#ef4444;">${o.offerPrice}</td>
            <td style="padding:10px; text-align:center;">${tag}</td>
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
window.openAddCategoryModal = function(parentId = '0', catId = '', name = '', isEdit = false) {
  const modalTitle = document.getElementById('category-modal-title');
  const parentSelect = document.getElementById('select-parent-category');
  const nameInput = document.getElementById('category-name-input');

  if (isEdit) {
    modalTitle.innerText = '编辑货品类别';
  } else {
    modalTitle.innerText = parentId === '0' ? '新增一级分类' : '新增下级分类';
  }

  // 渲染所有可能作为父级的选项 (一二级分类)
  if (parentSelect) {
    parentSelect.innerHTML = '<option value="0">作为一级大类</option>';
    if (MockData.productCategories) {
      MockData.productCategories.forEach(c1 => {
        // 避免自己成为自己的父级
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
    parentSelect.value = parentId || '0';
    // 如果是顶部的“新增一级分类”，禁用父级选择（只能是一级）
    if (!isEdit && (parentId === '0' || !parentId)) {
      parentSelect.disabled = true;
    } else {
      parentSelect.disabled = false;
    }
  }

  if (nameInput) nameInput.value = name || '';

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
      { demandId, shopName: '远大钢铁官方直营店', shopPhone: '139****8811', priceStr: '¥4,100.00 / 吨', remark: '含专车送达运费，附带材质检测合格报告。', time: '2026-07-07 10:15:00', status: '交易达成' },
      { demandId, shopName: '华东木材集散中心', shopPhone: '138****5566', priceStr: '¥4,150.00 / 吨', remark: '现货仓储配送，质保期12个月。', time: '2026-07-07 11:30:00', status: '未中标' }
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

AdminApp.showOrderDetailPage = function(orderId) {
  const listSec = document.getElementById('admin-order-list-section');
  const detailSec = document.getElementById('admin-order-detail-section');
  if (!listSec || !detailSec) return;

  const o = MockData.orders.find(item => item.id === orderId);
  if (!o) return;

  listSec.style.display = 'none';
  detailSec.style.display = 'block';

  document.getElementById('admin-detail-order-id').innerText = o.id;

  // Render Status Banner
  const bannerMap = {
    0: { title: '订单待签约', desc: '买卖双方正在进行 CA 电子签名签署大宗买卖交易合同及保证金协议。' },
    5: { title: '订单待卖家签约', desc: '买方已电子签名，等待供应商家代表签名并盖合同章。' },
    4: { title: '订单待付款', desc: '买方已电子签约，请及时在钱包或通过线下对公向平台监管账户汇款大宗货款。' },
    1: { title: '订单待发货', desc: '资金托管入账已由平台确认，等待卖家安排专车发运大宗货品。' },
    2: { title: '卖家已发货', desc: '卖家已安排大宗直达物流专车发运送达中，请在到货后仔细核对并确认收货。' },
    3: { title: '交易履约已完成', desc: '买卖双方均已确认收货，财务清算完成，托管资金已划拨至卖家商户余额。' },
    '-1': { title: '订单已关闭', desc: o.closeReason || '交易异常，订单已关闭。' }
  };
  const bData = bannerMap[o.status] || { title: '订单处理中', desc: '请耐心等待平台处理...' };
  const statusTitleEl = document.getElementById('admin-detail-status-title');
  const statusDescEl = document.getElementById('admin-detail-status-desc');
  if (statusTitleEl) statusTitleEl.innerText = bData.title;
  if (statusDescEl) statusDescEl.innerText = bData.desc;
  
  const typeTag = document.getElementById('admin-detail-type-tag');
  typeTag.innerText = o.type;
  typeTag.className = 'tag ' + (o.type.includes('现货') ? 'tag-primary' : o.type.includes('预售') ? 'tag-warning' : 'tag-info');

  document.getElementById('admin-detail-create-time').innerText = o.time || '2026-07-07 10:15:00';
  document.getElementById('admin-detail-buyer-name').innerText = o.buyerName || '--';
  document.getElementById('admin-detail-shop-name').innerText = o.shopName || '--';

  const statusBadge = document.getElementById('admin-detail-status-badge');
  const statusMap = {
    0: { text: '待签约', class: 'badge-primary' },
    5: { text: '待卖家签约', class: 'badge-primary' },
    4: { text: '待付款', class: 'badge-warning' },
    1: { text: '待发货', class: 'badge-info' },
    2: { text: '待签收', class: 'badge-secondary' },
    3: { text: '已完成', class: 'badge-success' },
    '-1': { text: '已关闭', class: 'badge-danger' }
  };
  const s = statusMap[o.status] || { text: '未知状态', class: 'badge-secondary' };
  statusBadge.innerHTML = `<span class="badge ${s.class}" style="font-size:14px; padding:6px 12px; border-radius:6px; font-weight:bold;">${s.text}</span>`;

  const stepsContainer = document.getElementById('admin-detail-steps');
  let currentStep = 0;
  if (o.status === 0 || o.status === 5) currentStep = 1;
  else if (o.status === 4) currentStep = 2;
  else if (o.status === 1) currentStep = 3;
  else if (o.status === 2) currentStep = 4;
  else if (o.status === 3) currentStep = 5;

  const steps = [
    { name: '1. 提交买单', time: o.time },
    { name: '2. 电子签约', time: (o.status >= 4 || o.status === 1 || o.status === 2 || o.status === 3) ? '2026-07-07 11:20:00' : '' },
    { name: '3. 资金托管', time: (o.status === 1 || o.status === 2 || o.status === 3) ? '2026-07-07 14:00:00' : '' },
    { name: '4. 卖家发货', time: (o.status === 2 || o.status === 3) ? '2026-07-08 09:30:00' : '' },
    { name: '5. 确认收货', time: (o.status === 3) ? '2026-07-09 08:30:00' : '' },
    { name: '6. 结算出账', time: (o.status === 3) ? '2026-07-09 10:00:00' : '' }
  ];

  stepsContainer.innerHTML = steps.map((st, index) => {
    const active = o.status !== -1 && index <= currentStep;
    const done = o.status !== -1 && index < currentStep;
    const numColor = active ? 'var(--primary-color)' : '#94a3b8';
    const numBg = active ? 'var(--primary-bg)' : '#f1f5f9';
    return `
      <div style="flex:1; text-align:center; position:relative; z-index:1;">
        <div style="width:32px; height:32px; border-radius:50%; background:${numBg}; color:${numColor}; border:2px solid ${active ? 'var(--primary-color)' : '#cbd5e1'}; display:flex; align-items:center; justify-content:center; margin:0 auto 8px; font-weight:bold; font-size:14px;">
          ${done ? '✓' : index + 1}
        </div>
        <div style="font-weight:bold; color:${active ? '#1e293b' : '#64748b'}; font-size:12px;">${st.name}</div>
        <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${formatTimeSec(st.time)}</div>
      </div>
    `;
  }).join('') + `
    <!-- Line background -->
    <div style="position:absolute; top:16px; left:40px; right:40px; height:2px; background:#cbd5e1; z-index:0;"></div>
    <div style="position:absolute; top:16px; left:40px; width:calc(${o.status === -1 ? 0 : Math.min(100, (currentStep / 5) * 100)}% - 80px); height:2px; background:var(--primary-color); z-index:0; transition: width 0.3s ease;"></div>
  `;

  const goodsTbody = document.getElementById('admin-detail-goods-tbody');
  const imgUrl = 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=120&q=80';
  goodsTbody.innerHTML = `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px;"><img src="${imgUrl}" style="width:50px; height:50px; border-radius:6px; object-fit:cover;" /></td>
      <td style="padding:12px; font-weight:bold; color:#334155;">
        <div>${o.productName}</div>
        <div style="font-size:11px; color:#94a3b8; margin-top:2px;">规格属性: 工业标准一级 | 包装: 散装/专车直达</div>
      </td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:#475569;">${o.amount}</td>
      <td style="padding:12px; text-align:center; color:#475569;">1 批次</td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:#0f172a;">${o.amount}</td>
    </tr>
  `;

  document.getElementById('admin-detail-subtotal-price').innerText = o.amount;
  document.getElementById('admin-detail-total-amount').innerText = o.amount;

  // 渲染合同模块 (最多支持10张合同附件)
  const contractWrapper = document.getElementById('admin-detail-contract-wrapper');
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
              <button class="btn btn-outline btn-xs" id="admin-detail-preview-contract-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:11px; flex-shrink:0;">【预览】</button>
            </div>
          `).join('')}
        </div>
      `;
      contractImages.forEach((img, i) => {
        const btn = document.getElementById(`admin-detail-preview-contract-btn-${i}`);
        if (btn) btn.onclick = () => UI.previewDocument(img.name, img.type, contractNo, o.amount, o.buyerName, o.shopName);
      });
    }
  }

  // 渲染支付凭证模块 (最多支持5张凭证附件)
  const voucherCard = document.getElementById('admin-detail-payment-voucher-card');
  if (voucherCard) {
    const voucherTitle = `<h3 class="text-base font-bold mb-3" style="color:#0f172a; display:flex; align-items:center; gap:8px;">
      <span style="width:4px; height:16px; background:var(--primary-color); border-radius:2px; display:inline-block;"></span>
      支付凭证与资金托管存证
    </h3>`;
    if (o.status === 0 || o.status === 5 || o.status === 4) {
      voucherCard.innerHTML = voucherTitle + `
        <div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px; background:#f8fafc; border-radius:8px; border:1px dashed #e2e8f0;">
          ⏳ 等待买方资金托管支付后，可查阅凭证回执。
        </div>
      `;
    } else {
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
              <button class="btn btn-outline btn-xs" id="admin-detail-preview-voucher-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:11px; color:#166534; border-color:#bbf7d0; background:#fff;">【预览】</button>
            </div>
          `).join('')}
        </div>
      `;
      voucherImages.forEach((vImg, i) => {
        const btn = document.getElementById(`admin-detail-preview-voucher-btn-${i}`);
        if (btn) btn.onclick = () => UI.previewDocument(vImg.name, vImg.type, voucherNo, o.amount, o.buyerName, o.shopName);
      });
    }
  }

  const logisticsNoEl = document.getElementById('admin-detail-logistics-no');
  if (logisticsNoEl) {
    logisticsNoEl.innerText = (o.status >= 2 || o.status === 3) ? 'SF1480928120' : '--';
  }

  document.getElementById('admin-detail-commission-amount').innerText = o.amount;
  const numericAmount = parseFloat(o.amount.replace(/[^\d.]/g, ''));
  if (!isNaN(numericAmount)) {
    const fee = numericAmount * 0.006;
    document.getElementById('admin-detail-commission-fee').innerText = '¥' + fee.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } else {
    document.getElementById('admin-detail-commission-fee').innerText = '¥0.00';
  }


};

AdminApp.hideOrderDetailPage = function() {
  document.getElementById('admin-order-list-section').style.display = 'block';
  document.getElementById('admin-order-detail-section').style.display = 'none';
};

AdminApp.resetBiddingResFilter = function() {
  ['filter-bidres-id', 'filter-bidres-shop', 'filter-bidres-company', 'filter-bidres-name'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const sel = document.getElementById('filter-bidres-status');
  if (sel) sel.value = '';
  AdminApp.renderBidding();
};

window.openAuditBiddingResModal = function(id) {
  const r = MockData.biddingResources.find(x => x.id === id);
  if (!r) return;

  // 填充资源信息摘要
  const infoEl = document.getElementById('audit-bidres-info');
  if (infoEl) {
    infoEl.innerHTML = `
      <div><strong>资源编号：</strong>${r.id}</div>
      <div><strong>提报店铺：</strong>${r.shopName}</div>
      <div><strong>公司名称：</strong>${r.companyName || '--'}</div>
      <div><strong>资源货品名：</strong>${r.name}</div>
    `;
  }

  // 重置表单
  document.getElementById('audit-bidres-target-id').value = id;
  const passRadio = document.querySelector('input[name="audit-bidres-radio"][value="pass"]');
  if (passRadio) passRadio.checked = true;
  document.getElementById('audit-bidres-reject-box').style.display = 'none';
  const reasonEl = document.getElementById('audit-bidres-reject-reason');
  if (reasonEl) {
    reasonEl.value = '';
    const counter = reasonEl.parentElement.querySelector('.char-counter');
    if (counter) counter.innerText = '0/50';
  }

  UI.showModal('modal-audit-bidres');
};

window.confirmSubmitAuditBidRes = function() {
  const id = document.getElementById('audit-bidres-target-id').value;
  const r = MockData.biddingResources.find(x => x.id === id);
  if (!r) return;

  const result = document.querySelector('input[name="audit-bidres-radio"]:checked')?.value;

  if (result === 'pass') {
    r.status = '已通过';
    UI.closeModal('modal-audit-bidres');
    AdminApp.renderBidding();
    UI.toast('资源审核已通过', 'success');
  } else {
    const reason = (document.getElementById('audit-bidres-reject-reason')?.value || '').trim();
    if (!reason) {
      UI.toast('请填写驳回理由', 'warning');
      return;
    }
    r.status = '未通过';
    r.rejectReason = reason;
    UI.closeModal('modal-audit-bidres');
    AdminApp.renderBidding();
    UI.toast('资源审核已驳回', 'warning');
  }
};
