/**
 * 运营端后台业务逻辑 (Admin Dashboard V2)
 */

const AdminApp = {
  init() {
    UI.initSidebarSpa();
    
    // 初始化数据
    this.renderDataCenter();
    this.renderCustomers();
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
      let actBtn = p.status === 1 ? `<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已强制违规下架该商品', 'error')">违规下架</button>` : `<button class="btn btn-primary btn-sm">允许上架</button>`;

      html += `
        <tr>
          <td>${p.shopName}</td>
          <td>${p.name}</td>
          <td>${p.category}</td>
          <td class="text-danger">${p.priceStr}</td>
          <td>${statusTag}</td>
          <td>${actBtn}</td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.products.length);
    }
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
      let statusText = ['待签约', '待发货', '待签收', '已完成'][o.status] || '已关闭';
      let statusTag = o.status === -1 ? `<span class="tag tag-danger">已关闭</span>` : `<span class="tag tag-primary">${statusText}</span>`;
      
      let closeBtn = o.status !== -1 
        ? `<button class="btn btn-text btn-sm text-danger" onclick="AdminApp.closeOrder('${o.id}')">关闭(并退款)</button>` 
        : `<span class="text-secondary text-sm">退款原因: ${o.closeReason}</span>`;

      html += `
        <tr>
          <td>${o.id}</td>
          <td>${o.buyerName}</td>
          <td>${o.shopName}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${statusTag}</td>
          <td>${closeBtn}</td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html;
      this._appendPagination(tbody, MockData.orders.length);
    }
  },

  closeOrder(orderId) {
    if (confirm("系统不直接涉及线上资金池，是否确认关闭此订单并线下联系双方进行退款处理？")) {
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
        let tag = a.status === 1 ? `<span class="tag tag-success">竞价中</span>` : (a.status === 0 ? `<span class="tag tag-warning">未开始</span>` : `<span class="tag tag-secondary">已结束</span>`);
        let btn = `<button class="btn btn-text btn-sm text-primary" onclick="UI.toast('正在打开公告大纲查看页面', 'info')">查看大纲</button>`;
        if (a.status === 0 || a.status === 1) btn += `<button class="btn btn-text btn-sm text-danger" onclick="UI.toast('已下架该竞价项目', 'info')">强行下架</button>`;
        annHtml += `
          <tr>
            <td>${a.id}</td>
            <td>${a.shopName}</td>
            <td>${a.title}</td>
            <td>${a.resId}</td>
            <td>${tag}</td>
            <td><div class="flex gap-2">${btn}</div></td>
          </tr>
        `;
      });
      annBody.innerHTML = annHtml;
      this._appendPagination(annBody, MockData.biddingAnnouncements.length);
    }
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
