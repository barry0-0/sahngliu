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
    document.querySelector('.menu-item[data-page="page-data"]').click();
  },

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

    const kw = document.getElementById('admin-search-shop-keyword')?.value.trim() || '';
    let filtered = MockData.shops || [];
    if (kw) {
      filtered = filtered.filter(s => s.shopName.includes(kw) || s.companyName.includes(kw));
    }

    document.getElementById('shop-management-count').innerText = `共 ${filtered.length} 个商家店铺`;

    let html = '';
    filtered.forEach(s => {
      // Calculate product count dynamically from MockData.products
      const prodCount = MockData.products.filter(p => p.shopId == s.id).length;
      
      // Setup status tag
      let statusTag = '';
      if (s.status === '正常' || s.status === '正常营业') {
        statusTag = '<span class="tag tag-success">正常营业</span>';
      } else if (s.status === '已关停' || s.status === '已禁用') {
        statusTag = '<span class="tag tag-danger">已关停</span>';
      } else {
        statusTag = `<span class="tag tag-warning">${s.status || '待审核'}</span>`;
      }

      // Add suspend action button
      let actionBtn = '';
      if (s.status === '正常' || s.status === '正常营业') {
        actionBtn = `<button class="btn btn-text btn-sm text-danger" onclick="window.openSuspendShopModal('${s.id}')">强行关停</button>`;
      } else if (s.status === '已关停' || s.status === '已禁用') {
        actionBtn = `<button class="btn btn-text btn-sm text-success" onclick="window.toggleShopStatus('${s.id}', '正常')">重新开启</button>`;
      } else {
        actionBtn = `<button class="btn btn-text btn-sm text-primary" onclick="window.toggleShopStatus('${s.id}', '正常')">同意开店</button>`;
      }

      // If suspended, show hover reason or list reason
      const reasonTip = s.suspendReason ? `<div class="text-[10px] text-danger mt-1">理由: ${s.suspendReason}</div>` : '';

      html += `
        <tr style="border-bottom: 1px solid var(--border-light);">
          <td style="padding:12px; font-weight:bold; color:var(--text-main);">${s.shopName}</td>
          <td style="padding:12px;">${s.companyName || '--'}</td>
          <td style="padding:12px; text-align:center;">
            ${statusTag}
            ${reasonTip}
          </td>
          <td style="padding:12px; text-align:center; font-weight:bold; color:var(--primary-color);">${prodCount}</td>
          <td style="padding:12px; font-family:monospace; font-size:12px;">${s.creditCode || '--'}</td>
          <td style="padding:12px; font-size:12px;">${s.regTime || '--'}</td>
          <td style="padding:12px; text-align:center;">
            ${actionBtn}
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = html || '<tr><td colspan="7" class="text-center py-8 text-secondary">暂无商家店铺记录</td></tr>';

    // Mount global modal handlers if not already mounted
    if (!window.openSuspendShopModal) {
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
          shop.status = '已关停';
          shop.suspendReason = reason;
          UI.toast(`已强行关停店铺: ${shop.shopName}`, 'error');
          UI.closeModal('modal-suspend-shop');
          AdminApp.renderMerchantShops();
        }
      };

      window.toggleShopStatus = (shopId, newStatus) => {
        const shop = MockData.shops.find(s => s.id == shopId);
        if (shop) {
          shop.status = newStatus;
          delete shop.suspendReason;
          UI.toast(`店铺状态已更新为: ${newStatus}`, 'success');
          AdminApp.renderMerchantShops();
        }
      };
    }
  },

  // === 2. 客户管理 ===
  renderCustomers() {
    const tbody = document.querySelector('#table-customers tbody');
    if (!tbody) return;
    
    // 把 showCustomerDetail 挂载到 window 方便内联 onclick 调用
    window.showCustomerDetail = (accountNo, certStatus, merchantStatus, regTime) => {
      document.getElementById('detail-account-no').innerText = accountNo;
      
      let html = '';
      
      // 企业认证节点
      let companyText = '未认证';
      let companyColor = 'error'; // red
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

      // 个人认证节点
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

      // 注册节点
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
      // 个人认证状态
      let personalStatus = u.certStatus > 0 ? '已认证' : '未认证';
      let personalTime = u.certStatus > 0 ? u.regTime : ''; 
      
      // 企业认证状态
      let companyStatus = '未认证';
      let companyTime = '';
      if (u.merchantStatus === 2) {
        companyStatus = '已认证';
        companyTime = '2026-06-02 11:11:26';
      } else if (u.merchantStatus === 1) {
        companyStatus = '待审核';
      }

      // 操作列
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
    if (tbody && MockData.productCategories) {
      let html = '';
      
      // 递归展平树状结构供表格展示
      const flattenCategories = (cats, parentName = '-', parentId = '', result = []) => {
        cats.forEach(c => {
          result.push({ ...c, parentName, parentId });
          if (c.children && c.children.length > 0) {
            flattenCategories(c.children, c.name, c.id, result);
          }
        });
        return result;
      };

      const flatList = flattenCategories(MockData.productCategories);
      
      flatList.forEach(c => {
        let levelBadge = '';
        if (c.level === 1) levelBadge = `<span class="tag tag-primary">一级</span>`;
        if (c.level === 2) levelBadge = `<span class="tag tag-success">二级</span>`;
        if (c.level === 3) levelBadge = `<span class="tag" style="background:#e6f4ff; color:#1677ff; border:1px solid #91caff;">三级</span>`;
        
        // 层级缩进视觉效果 (可选)
        const indent = (c.level - 1) * 20;
        const hasChildren = c.children && c.children.length > 0;
        const expandIcon = hasChildren ? `<span style="cursor:pointer; display:inline-block; width:20px; color:#999;" onclick="AdminApp.toggleCategory(this, '${c.id}')">▼</span>` : `<span style="display:inline-block; width:20px;"></span>`;

        html += `
          <tr data-id="${c.id}" data-parent="${c.parentId}" class="cat-row">
            <td style="padding-left: ${indent + 12}px; font-weight: ${c.level === 1 ? 'bold' : 'normal'}">${expandIcon} ${c.name}</td>
            <td>${c.id}</td>
            <td>${levelBadge}</td>
            <td>${c.status === 1 ? '<span class="tag tag-success">启用</span>' : '<span class="tag tag-error">禁用</span>'}</td>
            <td>
              <button class="btn btn-text btn-sm text-primary" onclick="window.openAddCategoryModal('${c.parentId}', '${c.id}', '${c.name}', '${c.id}', true)">编辑</button>
              ${c.level < 3 ? `<button class="btn btn-text btn-sm text-primary" onclick="window.openAddCategoryModal('${c.id}', '', '', '', false)">新增下级</button>` : ''}
              <button class="btn btn-text btn-sm ${c.status === 1 ? 'text-danger' : 'text-success'}" onclick="window.toggleCategoryStatus('${c.id}', ${c.status})">${c.status === 1 ? '禁用' : '启用'}</button>
              <button class="btn btn-text btn-sm text-danger" onclick="if(confirm('确认删除吗？')) { UI.toast('删除成功', 'success'); }">删除</button>
            </td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
      this._appendPagination(tbody, flatList.length);
    }
  },

  toggleCategory(iconEl, catId) {
    const isExpanded = iconEl.innerText === '▼';
    iconEl.innerText = isExpanded ? '▶' : '▼';
    
    // 递归查找并切换状态
    const toggleChildren = (parentId, show) => {
      document.querySelectorAll(`.cat-row[data-parent="${parentId}"]`).forEach(row => {
        row.style.display = show ? '' : 'none';
        const rowId = row.getAttribute('data-id');
        const icon = row.querySelector('span[onclick^="AdminApp.toggleCategory"]');
        if (icon) {
          // 如果当前是收起动作，子级全部隐藏；如果是展开动作，只有子级状态是展开的才显示它的子级
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

  addSubCategory(parentId) {
    UI.showModal('modal-add-category');
    // 设置默认父级
    setTimeout(() => {
      const parentSelect = document.getElementById('select-parent-category');
      if(parentSelect) {
        // 先检查 parentId 是否是一级分类
        const isL1 = MockData.productCategories.some(c => c.id === parentId);
        if(isL1) {
          parentSelect.value = parentId;
          parentSelect.dispatchEvent(new Event('change'));
        } else {
          // parentId 是二级分类
          let foundL1 = '';
          MockData.productCategories.forEach(c => {
            if(c.children && c.children.some(sub => sub.id === parentId)) {
              foundL1 = c.id;
            }
          });
          if(foundL1) {
            parentSelect.value = foundL1;
            parentSelect.dispatchEvent(new Event('change'));
            setTimeout(() => {
              const subSelect = document.getElementById('select-sub-category');
              if(subSelect) subSelect.value = parentId;
            }, 50);
          }
        }
      }
    }, 100);
  },

  renderMerchantProducts() {
    const tbody = document.querySelector('#table-merchant-products tbody');
    let html = '';
    MockData.products.forEach(p => {
      let statusTag = p.status === 1 ? `<span class="tag tag-success">已上架</span>` : `<span class="tag tag-warning">待审核/下架</span>`;
      let shelfTypeTag = p.shelfType === '预售' 
        ? `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591; padding:2px 6px; font-size:11px; margin-left:6px;">预售</span>`
        : `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border:1px solid #b7eb8f; padding:2px 6px; font-size:11px; margin-left:6px;">现货</span>`;
      
      let auditBtn = p.status === 1 
        ? `<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已强制违规下架该商品', 'error'); MockData.products.find(x => x.id === '${p.id}').status = 0; AdminApp.renderMerchantProducts();">违规下架</button>` 
        : `<button class="btn btn-primary btn-sm" onclick="UI.toast('商品审核通过', 'success'); MockData.products.find(x => x.id === '${p.id}').status = 1; AdminApp.renderMerchantProducts();">允许上架</button>`;

      let editBtn = `<button class="btn btn-text btn-sm text-primary" onclick="AdminApp.editProduct('${p.id}')">编辑</button>`;

      html += `
        <tr>
          <td><img src="${p.image}" style="width:40px; height:40px; border-radius:4px; object-fit:cover;"></td>
          <td>${p.shopName}</td>
          <td>
            <div style="font-weight:bold; display:flex; align-items:center;">
              ${p.name}
              ${shelfTypeTag}
            </div>
          </td>
          <td>${p.category}</td>
          <td class="text-danger font-bold">${p.priceStr}</td>
          <td>${statusTag}</td>
          <td>
            <div style="display:flex; gap:8px; align-items:center;">
              ${editBtn}
              ${auditBtn}
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.products.length);
    }
  },

  editProduct(productId) {
    const p = MockData.products.find(x => x.id === productId);
    if (!p) return;
    document.getElementById('edit-prod-id').value = p.id;
    document.getElementById('edit-prod-name').value = p.name;
    document.getElementById('edit-prod-price').value = p.priceStr;
    document.getElementById('edit-prod-cat').value = p.category;
    document.getElementById('edit-prod-stock').value = p.stock || 0;
    document.getElementById('edit-prod-shelf-type').value = p.shelfType || '现货';
    document.getElementById('edit-prod-img').value = p.image;
    document.getElementById('edit-prod-img-preview').src = p.image;
    UI.showModal('modal-edit-product');
  },

  saveProductInfo() {
    const id = document.getElementById('edit-prod-id').value;
    const p = MockData.products.find(x => x.id === id);
    if (!p) return;
    p.name = document.getElementById('edit-prod-name').value;
    p.priceStr = document.getElementById('edit-prod-price').value;
    p.category = document.getElementById('edit-prod-cat').value;
    p.stock = parseInt(document.getElementById('edit-prod-stock').value) || 0;
    p.shelfType = document.getElementById('edit-prod-shelf-type').value;
    p.image = document.getElementById('edit-prod-img').value;

    UI.closeModal('modal-edit-product');
    UI.toast('商品信息更新成功', 'success');
    this.renderMerchantProducts();
  },

  // === 4. 供需中心 ===
  renderDemands() {
    const tbody = document.querySelector('#table-demands tbody');
    let html = '';
    MockData.demands.forEach(d => {
      let statusTag = d.status === 1 ? `<span class="tag tag-success">大厅上架中</span>` : `<span class="tag tag-warning">待审核</span>`;
      let actBtn = d.status === 1 
        ? `<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已强行下架此商机', 'info')">下架</button>` 
        : `<button class="btn btn-primary btn-sm" onclick="UI.toast('审核通过', 'success')">同意上架</button>
           <button class="btn btn-text btn-sm text-danger">驳回</button>`;

      html += `
        <tr>
          <td>${d.id}</td>
          <td>${d.buyerName}</td>
          <td>${d.title}</td>
          <td>${statusTag}</td>
          <td>
            <div class="flex gap-2">${actBtn}</div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.demands.length);
    }
  },

  // === 5. 交易中心 ===
  renderOrders() {
    const tbody = document.querySelector('#table-orders tbody');
    let html = '';
    MockData.orders.forEach(o => {
      let statusText = '';
      let statusColor = '';
      if (o.status === 0) { statusText = '待买家签约'; statusColor = '#fa8c16'; }
      else if (o.status === 5) { statusText = '待卖家签约'; statusColor = '#c41d7f'; }
      else if (o.status === 4) { statusText = '待付款'; statusColor = '#d46b08'; }
      else if (o.status === 1) { statusText = '待发货'; statusColor = '#1677ff'; }
      else if (o.status === 2) { statusText = '待签收'; statusColor = '#0958d9'; }
      else if (o.status === 3) { statusText = '已完成'; statusColor = '#52c41a'; }
      else if (o.status === -1) { statusText = '已关闭'; statusColor = '#ff4d4f'; }
      
      let statusTag = `<span class="tag" style="background:${statusColor}15; color:${statusColor}; border:1px solid ${statusColor}40; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">${statusText}</span>`;
      
      let closeBtn = o.status !== -1 
        ? `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.closeOrder('${o.id}')">关闭(并退款)</button>` 
        : '';

      html += `
        <tr>
          <td><a href="javascript:void(0)" onclick="UI.showOrderDetail('${o.id}')" style="font-weight:bold; color:var(--primary-color);">${o.id}</a></td>
          <td>${o.buyerName}</td>
          <td>${o.shopName}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${statusTag}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${closeBtn}
              <button class="btn btn-text btn-sm" onclick="UI.showOrderDetail('${o.id}')">详情</button>
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.orders.length);
    }
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
    MockData.chats.forEach(c => {
      html += `
        <tr>
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
      MockData.biddingResources.forEach(r => {
        let tag = r.status === '已通过' ? `<span class="tag tag-success">已通过</span>` : `<span class="tag tag-warning">待审核</span>`;
        let btn = r.status === '待审核' 
          ? `<button class="btn btn-primary btn-sm" onclick="UI.toast('资源审核通过', 'success')">审核通过</button>`
          : `<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('驳回成功', 'warning')">驳回重审</button>`;
        resHtml += `
          <tr>
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
      MockData.biddingAnnouncements.forEach(a => {
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

        let btn = `<button class="btn btn-text btn-sm text-primary" onclick="AdminApp.showBiddingDetail('${a.id}')">查看详情</button>`;
        
        if (aStatus === '待审核') {
          btn += `<button class="btn btn-text btn-sm text-success" onclick="AdminApp.approveBiddingAnn('${a.id}')">通过</button>`;
          btn += `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.rejectBiddingAnn('${a.id}')">拒绝</button>`;
        }
        
        if (aStatus === '待审核' || aStatus === '已拒绝') {
          btn += `<button class="btn btn-text btn-sm text-warning" onclick="AdminApp.openEditBiddingAnnModal('${a.id}')">编辑</button>`;
          btn += `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.deleteBiddingAnn('${a.id}')">删除</button>`;
        }
        
        if (aStatus === '已通过' && a.status !== 4) {
          btn += `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.forceOfflineBiddingAnn('${a.id}')">下架</button>`;
        }

        annHtml += `
          <tr>
            <td>${a.id}</td>
            <td>${a.shopName}</td>
            <td>${a.title}</td>
            <td>${a.resId}</td>
            <td>${tag}</td>
            <td>${auditTag}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      annBody.innerHTML = annHtml;
      this._appendPagination(annBody, MockData.biddingAnnouncements.length);
    }
  },

  showBiddingDetail(id) {
    const a = MockData.biddingAnnouncements.find(x => x.id === id);
    if (!a) return;

    const offers = MockData.biddingOffers.filter(o => o.bidId === id);
    // Sort offers desc by price
    const sortedOffers = [...offers].sort((x, y) => {
      const px = parseFloat(x.offerPrice.replace(/[^\d\.]/g, '')) || 0;
      const py = parseFloat(y.offerPrice.replace(/[^\d\.]/g, '')) || 0;
      return py - px;
    });

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important; pointer-events:auto !important;';

    let offersHtml = '';
    if (sortedOffers.length === 0) {
      offersHtml = `<tr><td colspan="4" style="text-align:center; color:#94a3b8; padding:20px 0;">暂无出价记录</td></tr>`;
    } else {
      sortedOffers.forEach((o, index) => {
        let isWinnerTag = a.winner === o.buyerName ? '<span class="tag tag-success" style="font-size:10px; margin-left:4px;">中标签订</span>' : '';
        offersHtml += `
          <tr style="${index === 0 ? 'background:#fff9f0;' : ''}">
            <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; font-weight:${index === 0 ? 'bold' : 'normal'};">
              ${o.buyerName} ${isWinnerTag}
            </td>
            <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; color:#ef4444; font-family:monospace; font-weight:bold;">
              ${o.offerPrice}
            </td>
            <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9; color:#64748b; font-size:11px;">
              ${o.time}
            </td>
            <td style="padding:10px 12px; border-bottom:1px solid #f1f5f9;">
              <span class="tag ${index === 0 ? 'tag-primary' : 'tag-secondary'}" style="font-size:10px;">
                ${index === 0 ? '最高报价' : '参与报价'}
              </span>
            </td>
          </tr>
        `;
      });
    }

    modal.innerHTML = `
      <div class="modal-content" style="width:620px; background:#ffffff; border-radius:16px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:85vh; overflow:hidden; animation: popIn 0.3s ease-out; box-sizing:border-box;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">📋 竞价单流转详情 (运营监督)</h3>
            <div style="width:32px; height:3px; background:#1677ff; border-radius:2px; margin-top:4px;"></div>
          </div>
          <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>

        <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px; font-size:13px; line-height:1.5; color:#334155; box-sizing:border-box;">
          
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:14px; display:flex; gap:16px; box-sizing:border-box;">
            <img src="${a.image}" style="width:120px; height:90px; object-fit:cover; border-radius:8px; flex-shrink:0;">
            <div style="flex:1;">
              <div style="font-weight:bold; font-size:14px; color:#0f172a; margin-bottom:6px;">${a.title}</div>
              <div style="font-size:11px; color:#64748b;">
                <div><strong>项目编号：</strong>${a.id}</div>
                <div><strong>处置商家：</strong>${a.shopName}</div>
                <div><strong>起拍底价：</strong>${a.startPrice} | <strong>成交价：</strong>${a.currentMaxOffer}</div>
              </div>
            </div>
          </div>

          <div>
            <h4 style="margin:0 0 10px 0; font-weight:bold; color:#0f172a; font-size:13px; display:flex; align-items:center; justify-content:space-between;">
              <span>👥 所有参与的竞价人及价格 (${offers.length} 人次)</span>
            </h4>
            <div style="border:1px solid #e2e8f0; border-radius:8px; overflow:hidden;">
              <table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px;">
                <thead>
                  <tr style="background:#f8fafc; border-bottom:1px solid #e2e8f0;">
                    <th style="padding:10px 12px; font-weight:bold; color:#475569;">竞价人</th>
                    <th style="padding:10px 12px; font-weight:bold; color:#475569;">竞价价格</th>
                    <th style="padding:10px 12px; font-weight:bold; color:#475569;">竞价时间</th>
                    <th style="padding:10px 12px; font-weight:bold; color:#475569;">状态</th>
                  </tr>
                </thead>
                <tbody>
                  ${offersHtml}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style="padding:14px 20px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; background:#f8fafc; flex-shrink:0;">
          <button style="background:#1677ff; color:#fff; border:none; padding:8px 20px; border-radius:8px; font-size:12px; font-weight:bold; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">关闭窗口</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // === 9. 配置中心 (抽佣规则) ===
  renderConfig() {
    const tbody = document.querySelector('#table-admin-commission tbody');
    if (tbody) {
      let html = '';
      MockData.commissionRules.forEach(c => {
        let tag = c.status === 1 ? `<span class="tag tag-success">生效中</span>` : `<span class="tag tag-secondary">已停用</span>`;
        let btn = c.type === 'global'
          ? `<button class="btn btn-text btn-sm text-primary" onclick="UI.toast('暂不可修改全局默认', 'warning')">修改</button>`
          : `<button class="btn btn-text btn-sm text-primary" onclick="UI.toast('打开编辑弹窗', 'info')">编辑</button>
             <button class="btn btn-text btn-sm text-danger" onclick="UI.toast('规则已删除', 'info')">删除</button>`;
        
        let typeBadge = '';
        if (c.type === 'global') typeBadge = `<span class="tag" style="background:#e6f7ff;color:#1890ff;border-color:#91d5ff;">全局</span>`;
        if (c.type === 'merchant') typeBadge = `<span class="tag" style="background:#f6ffed;color:#52c41a;border-color:#b7eb8f;">商家</span>`;
        if (c.type === 'category') typeBadge = `<span class="tag" style="background:#fff0f6;color:#eb2f96;border-color:#ffadd2;">类目</span>`;
        if (c.type === 'fixed') typeBadge = `<span class="tag" style="background:#fff7e6;color:#fa8c16;border-color:#ffd591;">梯队</span>`;

        html += `
          <tr>
            <td>${c.id}</td>
            <td>${typeBadge} ${c.name}</td>
            <td>${c.target}</td>
            <td class="font-bold text-danger">${c.rate}</td>
            <td class="font-bold text-danger">${c.amount}</td>
            <td>${tag}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.commissionRules.length);
    }
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
    // 禁用逻辑模拟：必须没有货品挂在这个类别
    // 假设“钢材”(C01) 和 “木材”(C02) 下有货品
    if (catId === '1' || catId === '2' || catId === '111') {
      UI.toast('该类别下有关联商品，无法禁用！', 'error');
      return;
    }
    UI.toast('已成功禁用', 'success');
  } else {
    UI.toast('已成功启用', 'success');
  }
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

document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
  // 预初始化级联下拉框数据
  if (window.renderCategoryCascader) window.renderCategoryCascader();
});
