/**
 * 全局 UI 组件库 (Vanilla JS Components)
 * 包含：Toast提示、Modal弹窗、Tab切换
 */

const UI = {
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
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
    } else {
      console.error('Modal not found: ' + modalId);
    }
  },

  /**
   * 关闭模态框
   * @param {string} modalId 模态框对应的 ID
   */
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
    }
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

// 全局业务公共方法
window.MainApp = {
  /**
   * 检查用户鉴权状态
   * @param {string} type 'personal' | 'merchant'
   * @param {function} successCallback 鉴权通过后的回调
   */
  checkAuth(type, successCallback) {
    if (!window.MockData || !window.MockData.currentUser) {
      UI.toast('用户数据异常，请重新登录', 'error');
      if (successCallback) successCallback();
      return;
    }
    
    const user = window.MockData.currentUser;
    
    if (type === 'personal') {
      if (user.personalAuthStatus !== 1) {
        UI.toast('提示：您尚未完成【个人实名认证】', 'warning');
      }
      if (successCallback) successCallback();
    } else if (type === 'merchant') {
      if (user.merchantAuthStatus === 1) {
        UI.toast('提示：您的【企业商家认证】正在审核中', 'warning');
      } else if (user.merchantAuthStatus !== 2) {
        UI.toast('提示：您尚未完成【企业商家认证】', 'warning');
      }
      if (successCallback) successCallback();
    } else {
      if (successCallback) successCallback();
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
