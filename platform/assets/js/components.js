/**
 * 全局 UI 组件库 (Vanilla JS Components)
 * 包含：Toast提示、Modal弹窗、Tab切换
 */

window.UI = {
  /**
   * Toast 提示框
   * @param {string} message 提示信息
   * @param {string} type 'success' | 'error' | 'info' | 'warning'
   */
  toast(message, type = 'info') {
    // 检查并创建容器
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    // 图标映射
    const icons = {
      success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#52c41a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>',
      error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ff4d4f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
      warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#faad14" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
      info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1677ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
    };

    const toastEl = document.createElement('div');
    toastEl.className = 'toast';
    toastEl.innerHTML = `
      ${icons[type] || icons.info}
      <span style="font-size: 14px; color: var(--text-main);">${message}</span>
    `;

    container.appendChild(toastEl);

    // 自动移除
    setTimeout(() => {
      toastEl.style.opacity = '0';
      toastEl.style.transform = 'translateY(-100%)';
      toastEl.style.transition = 'all 0.3s ease';
      setTimeout(() => {
        if (toastEl.parentNode) {
          toastEl.parentNode.removeChild(toastEl);
        }
      }, 300);
    }, 3000);
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'flex';
      setTimeout(() => {
        modal.classList.add('active');
      }, 10);
    }
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.style.display = 'none';
        }
      }, 250);
    }
  },

  /**
   * 初始化 Tab 切换
   * DOM 结构要求:
   * .tabs > .tab-item[data-target="id"]
   * .view-panel[id="id"]
   */
  initTabs() {
    const tabsGroups = document.querySelectorAll('.tabs');
    
    tabsGroups.forEach(group => {
      const items = group.querySelectorAll('.tab-item');
      items.forEach(item => {
        item.addEventListener('click', function() {
          // 移除同级 active
          items.forEach(i => i.classList.remove('active'));
          this.classList.add('active');

          const targetId = this.getAttribute('data-target');
          if (targetId) {
            // 找到所有同级的 panel
            const parent = this.closest('.card-body') || this.closest('.page-container') || document;
            const panels = parent.querySelectorAll('.view-panel');
            panels.forEach(p => p.classList.remove('active'));
            
            const targetPanel = document.getElementById(targetId);
            if (targetPanel) {
              targetPanel.classList.add('active');
            }
          }
        });
      });
    });
  },

  /**
   * 显示模态框
   * @param {string} modalId 模态框对应的 ID
   */
  showModal(modalId) {
    this.openModal(modalId);
  },

  /**
   * 关闭模态框
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      setTimeout(() => {
        if (!modal.classList.contains('active')) {
          modal.style.display = 'none';
        }
      }, 250);
    }
  },

  /**
   * 查看订单轨迹和详情
   */
  showOrderDetail(orderId) {
    const o = MockData.orders.find(item => item.id === orderId);
    if (!o) {
      alert('订单不存在！');
      return;
    }

    let modal = document.getElementById('modal-order-detail');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'modal-order-detail';
      modal.style.cssText = 'position:fixed; top:0; left:0; right:0; bottom:0; background:rgba(0,0,0,0.4); display:none; align-items:center; justify-content:center; z-index:9999; transition: opacity 0.2s ease; opacity: 0;';
      modal.innerHTML = `
        <div class="modal-card-container" style="background:#fff; border-radius:12px; overflow:hidden; width:600px; max-width:95%; box-shadow:0 10px 25px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:85vh; animation: zoomIn 0.25s ease;">
          <div style="background:#1e293b; color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:bold; font-size:14px;">📄 咖喱粑粑 - 大宗交易订单详情</span>
            <button onclick="UI.closeModal('modal-order-detail')" style="background:none; border:none; color:#fff; font-size:24px; cursor:pointer; line-height:1;">&times;</button>
          </div>
          <div style="padding:20px; overflow-y:auto; font-size:13px; color:#334155; line-height:1.6;">
            <!-- Main Grid Info -->
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px 20px; margin-bottom:16px; border-bottom:1px solid #f1f5f9; padding-bottom:16px;">
              <div><span style="color:#64748b;">订单编号：</span><strong id="det-order-id" style="font-family:monospace; color:#0f172a;">-</strong></div>
              <div><span style="color:#64748b;">交易类型：</span><span id="det-order-type" style="background:#e0f2fe; color:#0369a1; padding:2px 8px; border-radius:4px; font-weight:bold; font-size:11px;">-</span></div>
              <div><span style="color:#64748b;">采购买家：</span><span id="det-buyer-name" style="font-weight:bold;">-</span></div>
              <div><span style="color:#64748b;">供应商家：</span><span id="det-shop-name" style="font-weight:bold;">-</span></div>
            </div>

            <!-- Goods Detail -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:14px; margin-bottom:16px;">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px; margin-bottom:8px; font-weight:bold;">
                <span style="color:#475569;">商品清单</span>
                <span id="det-order-amount" style="color:var(--danger-color); font-size:15px;">-</span>
              </div>
              <div style="display:flex; align-items:center; gap:12px;">
                <div style="font-size:22px; width:40px; height:40px; border-radius:6px; background:#e2e8f0; display:flex; align-items:center; justify-content:center;">🏗️</div>
                <div>
                  <div id="det-product-name" style="font-weight:bold; color:#0f172a;">-</div>
                  <div style="color:#64748b; font-size:11px;">交货周期：遵守电子合同规范约定 (线下履约结算)</div>
                </div>
              </div>
            </div>

            <!-- Timeline -->
            <div style="font-weight:bold; margin-bottom:10px; color:#0f172a;">订单状态流转与履约轨迹</div>
            <div id="det-timeline" style="display:flex; flex-direction:column; gap:12px; padding-left:8px; margin-top:8px;">
              <!-- Timeline rows -->
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
    }

    // Populate data
    document.getElementById('det-order-id').innerText = o.id;
    document.getElementById('det-order-type').innerText = o.type;
    document.getElementById('det-buyer-name').innerText = o.buyerName;
    document.getElementById('det-shop-name').innerText = o.shopName;
    document.getElementById('det-order-amount').innerText = o.amount;
    document.getElementById('det-product-name').innerText = o.productName;

    // Timeline construction
    const timelineContainer = document.getElementById('det-timeline');
    let timelineHTML = '';
    const dateStr = o.time.split(' ')[0];

    const steps = [
      { label: '订单草拟与创建', desc: `下单时间: ${o.time}`, done: true },
      { label: '买家电子签章(采购盖章)', desc: o.status === 0 || o.status === 4 ? '等待买家在个人中心立即签约' : `已盖章签约: ${dateStr} 10:15`, done: o.status !== 0 && o.status !== 4 },
      { label: '卖家电子签章(供应盖章)', desc: o.status === 0 || o.status === 5 || o.status === 4 ? '等待卖家盖章' : `双边签约锁定: ${dateStr} 11:20`, done: o.status !== 0 && o.status !== 5 && o.status !== 4 },
      { label: '线下公对公汇款查验', desc: o.status === 4 ? '等买家线下汇款并上传凭证' : (o.status === 0 || o.status === 5 ? '等待合同签署完毕' : `财务对账确认: ${dateStr} 14:00`), done: o.status !== 0 && o.status !== 5 && o.status !== 4 },
      { label: '卖家装车发货并录单', desc: o.status === 1 ? '备货中，等待发货' : (o.status === 2 || o.status === 3 ? `已发货: ${dateStr} 15:45 (三方快递/物流单)` : '未发货'), done: o.status === 2 || o.status === 3 },
      { label: '买家签收与月度对账结算', desc: o.status === 3 ? `已收货结清: ${dateStr} 18:30 (待运营核销佣金开票)` : '等待线下交货与最终确认收货', done: o.status === 3 }
    ];

    if (o.status === -1) {
      let descStr = o.closeReason || '买卖双方沟通一致线下取消';
      if (o.cancelUser) {
        descStr = `取消操作人: ${o.cancelUser} (${o.cancelRole}) | 时间: ${o.cancelTime}`;
      }
      steps.push({ label: '订单强行关闭 / 交易取消', desc: descStr, done: true, error: true });
    }

    steps.forEach((step, idx) => {
      let iconColor = step.done ? '#10b981' : '#cbd5e1';
      if (step.error) iconColor = '#ef4444';
      let borderStyle = idx === steps.length - 1 ? '' : `border-left: 2px solid ${step.done ? '#10b981' : '#cbd5e1'};`;
      timelineHTML += `
        <div style="position:relative; padding-bottom:10px; ${borderStyle} padding-left:16px;">
          <div style="position:absolute; left:-5px; top:2px; width:10px; height:10px; border-radius:50%; background:${iconColor}; border:2px solid #fff;"></div>
          <div style="font-weight:bold; font-size:12px; color: ${step.done ? '#0f172a' : '#94a3b8'};">${step.label}</div>
          <div style="font-size:11px; color:#64748b; margin-top:2px;">${step.desc}</div>
        </div>
      `;
    });

    timelineContainer.innerHTML = timelineHTML;
    
    // Trigger modal open
    this.openModal('modal-order-detail');
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 50);
  },

  /**
   * 初始化侧边栏菜单切换 (SPA 核心逻辑)
   * DOM 结构要求:
   * .menu-item[data-page="id"]
   * .page-view[id="id"] (通常包裹在 .page-container 中)
   */
  initSidebarSpa() {
    const menuItems = document.querySelectorAll('.menu-item[data-page], .sub-menu-item[data-page]');
    const pageViews = document.querySelectorAll('.page-view');

    menuItems.forEach(item => {
      item.addEventListener('click', function() {
        // 更新菜单激活状态
        menuItems.forEach(m => m.classList.remove('active'));
        this.classList.add('active');

        // 如果是子菜单被点击，也要激活其父级菜单
        const parentMenuItem = this.closest('.menu-item');
        if (parentMenuItem) {
          document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
          parentMenuItem.classList.add('active');
        }

        // 更新页面视图
        const targetPageId = this.getAttribute('data-page');
        pageViews.forEach(page => {
          if (page.id === targetPageId) {
            page.style.display = 'block';
            page.style.animation = 'fadeIn 0.3s ease';
          } else {
            page.style.display = 'none';
          }
        });

        const titleElement = document.getElementById('top-header-title');
        if (titleElement) {
          titleElement.innerText = this.innerText.replace('▼', '').trim();
        }
      });
    });
  },

  /**
   * 生成通用的分页 HTML 代码 (模拟)
   * @param {number} totalItems 总数据量
   * @param {number} currentPage 当前页
   * @param {number} pageSize 每页条数
   */
  renderPagination(totalItems, currentPage = 1, pageSize = 10) {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    let html = `
      <div class="flex justify-between items-center mt-4 text-sm text-secondary" style="border-top: 1px solid #f2f3f5; padding-top: 16px;">
        <div>共 <span class="text-primary font-bold">${totalItems}</span> 条记录，当前第 ${currentPage}/${totalPages} 页</div>
        <div class="flex gap-2">
          <button class="btn btn-outline btn-sm" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
          <button class="btn btn-primary btn-sm">${currentPage}</button>
          <button class="btn btn-outline btn-sm" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
        </div>
      </div>
    `;
    return html;
  }
};
var UI = window.UI;

// 全局业务公共方法
window.MainApp = {
  /**
   * 检查用户鉴权状态
   * @param {string} type 'personal' | 'merchant'
   * @param {function} successCallback 鉴权通过后的回调
   */
  checkAuth(type, successCallback) {
    // 解除认证卡控，直接放行
    if (successCallback) successCallback();
  },

  /**
   * 取消订单通用方法（记录人与时间）
   */
  cancelOrder(orderId, role, userName, callback) {
    if (!confirm('确定要取消该订单吗？此操作不可逆。')) return;
    const o = MockData.orders.find(x => x.id === orderId);
    if (!o) {
      UI.toast('订单未找到', 'error');
      return;
    }
    o.status = -1;
    o.cancelRole = role;
    o.cancelUser = userName;
    o.cancelTime = new Date().toISOString().replace('T', ' ').substring(0, 16);
    
    UI.toast('订单已成功取消，并已存证操作轨迹', 'success');
    if (callback) {
      callback();
    }
  }
};

// 页面加载完成后自动初始化
document.addEventListener('DOMContentLoaded', () => {
  UI.initTabs();
  
  // 绑定所有带 data-close-modal 属性的按钮关闭事件
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-close-modal');
      UI.closeModal(modalId);
    });
  });
});

// 全局图片加载失败降级处理 (防止 Unsplash 图片加载失败导致裂开)
window.addEventListener('error', function(e) {
  if (e.target && e.target.tagName === 'IMG') {
    if (e.target.dataset.fallbackTriggered) return;
    e.target.dataset.fallbackTriggered = 'true';
    // 选用离线渲染、永不裂开的 SVG 货箱占位图
    e.target.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 100 100' style='background:%23f2f3f5;'><rect width='100' height='100' fill='%23f5f7fa'/><path d='M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z' fill='none' stroke='%23a8abb2' stroke-width='2'/><path d='M50 20 L50 80 M20 35 L80 65 M80 35 L20 65' fill='none' stroke='%23c8c9cc' stroke-width='1.5'/><text x='50' y='53' font-size='10' font-family='sans-serif' fill='%23909399' text-anchor='middle'>咖喱粑粑</text></svg>";
  }
}, true);
