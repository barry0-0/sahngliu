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
              <div id="det-goods-list" style="display:flex; flex-direction:column; gap:8px;">
                <!-- Dynamically populated goods rows -->
              </div>
            </div>

            <!-- Timeline -->
            <div style="font-weight:bold; margin-bottom:10px; color:#0f172a;">订单状态流转与履约轨迹</div>
            <div id="det-timeline" style="display:flex; flex-direction:column; gap:12px; padding-left:8px; margin-top:8px;">
              <!-- Timeline rows -->
            </div>

            <!-- Contract & Payment Attachments -->
            <div style="margin-top:16px; border-top:1px solid #f1f5f9; padding-top:16px; box-sizing:border-box;">
              <div style="font-weight:bold; margin-bottom:10px; color:#0f172a;">📜 合同与支付凭证存证</div>
              <div id="det-attachments-card" style="display:flex; flex-direction:column; gap:10px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; box-sizing:border-box;">
                <!-- Dynamically populated attachment rows -->
              </div>
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

    // Populate goods list
    const goodsListContainer = document.getElementById('det-goods-list');
    if (goodsListContainer) {
      if (o.products && o.products.length > 0) {
        goodsListContainer.innerHTML = o.products.map(p => `
          <div style="display:flex; align-items:center; justify-content:space-between; font-size:12px; margin-bottom:8px; border-bottom:1px dashed #f1f5f9; padding-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:14px;">🏗️</span>
              <div>
                <div style="font-weight:bold; color:#0f172a;">${p.name}</div>
                <div style="color:#64748b; font-size:10px;">单价：¥${parseFloat(p.price).toLocaleString('zh-CN')} × 数量：${p.quantity}</div>
              </div>
            </div>
            <div style="font-weight:bold; color:#ef4444;">¥${parseFloat(p.amount || (p.price * p.quantity)).toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
          </div>
        `).join('');
      } else {
        goodsListContainer.innerHTML = `
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="font-size:22px; width:40px; height:40px; border-radius:6px; background:#e2e8f0; display:flex; align-items:center; justify-content:center;">🏗️</div>
            <div>
              <div style="font-weight:bold; color:#0f172a;">${o.productName}</div>
              <div style="color:#64748b; font-size:11px;">交货周期：遵守电子合同规范约定 (线下履约结算)</div>
            </div>
          </div>
        `;
      }
    }

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

    // Attachments info construction
    const attachmentsContainer = document.getElementById('det-attachments-card');
    if (attachmentsContainer) {
      let attachmentsHTML = '';
      
      // 1. Contract Section
      let contractHTML = '';
      if (o.status === 0) {
        contractHTML = `
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">📄</span>
            <div>
              <div style="font-weight:bold; color:#64748b;">交易合同：双方尚未签署</div>
              <div style="font-size:11px; color:#94a3b8;">等待买家在个人中心进行 CA 线上盖章或上传已签署合同。</div>
            </div>
          </div>
        `;
      } else if (o.status === 5) {
        if (o.contractFile) {
          contractHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">📄</span>
              <div>
                <div style="font-weight:bold; color:#fa8c16;">交易合同：买方已上传已签署合同</div>
                <div style="font-size:11px; color:#475569;">
                  已上传买家签字文件: <a href="javascript:void(0)" onclick="alert('预览合同文件: ' + '${o.contractFile}')" style="color:#1677ff; font-weight:bold; text-decoration:underline;">${o.contractFile}</a> 
                  <span style="color:#94a3b8; margin-left:8px;">(等待卖家盖章/上传)</span>
                </div>
              </div>
            </div>
          `;
        } else {
          contractHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">💻</span>
              <div>
                <div style="font-weight:bold; color:#fa8c16;">交易合同：买方已电子签章 (CA签章)</div>
                <div style="font-size:11px; color:#94a3b8;">已生成买方 CA 数字指纹，校验码: <span style="font-family:monospace; background:#e2e8f0; padding:1px 4px; border-radius:3px;">CA-SIGN-${o.id}-BUYER</span>。等待卖家盖章。</div>
              </div>
            </div>
          `;
        }
      } else {
        if (o.contractFile) {
          contractHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">📄</span>
              <div>
                <div style="font-weight:bold; color:#10b981;">交易合同：双边已签署 (纸质合同上传)</div>
                <div style="font-size:11px; color:#475569;">
                  存证合同文件: <a href="javascript:void(0)" onclick="alert('预览合同文件: ' + '${o.contractFile}')" style="color:#1677ff; font-weight:bold; text-decoration:underline;">${o.contractFile}</a>
                </div>
              </div>
            </div>
          `;
        } else {
          contractHTML = `
            <div style="display:flex; align-items:center; gap:8px;">
              <span style="font-size:16px;">💻</span>
              <div>
                <div style="font-weight:bold; color:#10b981;">交易合同：双边已签署 (CA电子签章)</div>
                <div style="font-size:11px; color:#475569;">已生成双边电子签章。防伪校验指纹: <span style="font-family:monospace; background:#e2e8f0; padding:1px 4px; border-radius:3px;">CA-SIGN-${o.id}</span></div>
              </div>
            </div>
          `;
        }
      }

      // 2. Payment Section
      let paymentHTML = '';
      if (o.status === 0 || o.status === 5) {
        paymentHTML = `
          <div style="display:flex; align-items:center; gap:8px; border-top:1px dashed #e2e8f0; padding-top:10px; margin-top:4px;">
            <span style="font-size:16px;">⏳</span>
            <div>
              <div style="font-weight:bold; color:#64748b;">付款凭证：等待合同签约完毕</div>
              <div style="font-size:11px; color:#94a3b8;">签约完成后，买方可在个人中心执行货款结算。</div>
            </div>
          </div>
        `;
      } else if (o.status === 4) {
        paymentHTML = `
          <div style="display:flex; align-items:center; gap:8px; border-top:1px dashed #e2e8f0; padding-top:10px; margin-top:4px;">
            <span style="font-size:16px;">💳</span>
            <div>
              <div style="font-weight:bold; color:#fa8c16;">付款凭证：等待买方付款</div>
              <div style="font-size:11px; color:#94a3b8;">合同已生效，等待买方进行在线快捷支付或上传线下打款水单凭证。</div>
            </div>
          </div>
        `;
      } else if (o.status === -1) {
        paymentHTML = `
          <div style="display:flex; align-items:center; gap:8px; border-top:1px dashed #e2e8f0; padding-top:10px; margin-top:4px;">
            <span style="font-size:16px;">❌</span>
            <div>
              <div style="font-weight:bold; color:#ef4444;">付款凭证：订单交易已取消/关闭</div>
            </div>
          </div>
        `;
      } else {
        if (o.paymentVoucher) {
          paymentHTML = `
            <div style="display:flex; align-items:center; gap:8px; border-top:1px dashed #e2e8f0; padding-top:10px; margin-top:4px;">
              <span style="font-size:16px;">🏦</span>
              <div>
                <div style="font-weight:bold; color:#10b981;">付款凭证：线下对公汇款 (已上传)</div>
                <div style="font-size:11px; color:#475569;">
                  汇款回执凭证: <a href="javascript:void(0)" onclick="alert('预览打款凭证: ' + '${o.paymentVoucher}')" style="color:#1677ff; font-weight:bold; text-decoration:underline;">${o.paymentVoucher}</a>
                </div>
              </div>
            </div>
          `;
        } else {
          paymentHTML = `
            <div style="display:flex; align-items:center; gap:8px; border-top:1px dashed #e2e8f0; padding-top:10px; margin-top:4px;">
              <span style="font-size:16px;">⚡</span>
              <div>
                <div style="font-weight:bold; color:#10b981;">付款凭证：在线快捷支付 (已结清)</div>
                <div style="font-size:11px; color:#475569;">支付流水号: <span style="font-family:monospace; background:#e2e8f0; padding:1px 4px; border-radius:3px;">TXN-PAY-${o.id}</span></div>
              </div>
            </div>
          `;
        }
      }
      
      attachmentsContainer.innerHTML = contractHTML + paymentHTML;
    }
    
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

// ================== 新增：合同签署与货款支付通用弹窗 ==================
Object.assign(window.UI, {
  _signingCallback: null,
  _paymentCallback: null,
  _signingState: {
    method: 'online',
    onlineSigned: false,
    offlineFile: null
  },
  _paymentState: {
    method: 'online',
    onlinePaid: false,
    voucherFile: null
  },

  showContractSigningModal(orderId, isSeller, callback) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;

    UI._signingCallback = callback;

    let goodsRows = '';
    if (order.products && order.products.length > 0) {
      goodsRows = order.products.map(p => `
        <tr>
          <td style="border:1px solid #e2e8f0; padding:6px; font-size:11px;">
            <div style="font-weight:bold;">${p.name}</div>
            <div style="color:#64748b; font-size:10px;">数量：${p.quantity} | 单价：¥${parseFloat(p.price).toLocaleString('zh-CN')}</div>
          </td>
          <td style="border:1px solid #e2e8f0; padding:6px; text-align:right; font-weight:bold; color:#000; font-size:11px;">¥${parseFloat(p.amount || (p.price * p.quantity)).toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
        </tr>
      `).join('');
    } else {
      goodsRows = `
        <tr>
          <td style="border:1px solid #e2e8f0; padding:6px; font-size:11px;">${order.productName}</td>
          <td style="border:1px solid #e2e8f0; padding:6px; text-align:right; color:#ef4444; font-weight:bold; font-size:11px;">${order.amount}</td>
        </tr>
      `;
    }

    if (!document.getElementById('prd-contract-payment-styles')) {
      const s = document.createElement('style');
      s.id = 'prd-contract-payment-styles';
      s.textContent = `
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `;
      document.head.appendChild(s);
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important; pointer-events:auto !important;';
    
    const isMobile = window.innerWidth <= 768;
    const contentWidth = isMobile ? '100%' : '520px';
    
    if (isMobile) {
      modal.style.alignItems = 'flex-end';
      modal.style.padding = '0';
    }

    modal.innerHTML = `
      <div class="modal-content" style="width:${contentWidth}; background:#ffffff; border-radius:${isMobile ? '24px 24px 0 0' : '24px'}; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:${isMobile ? '85vh' : '90vh'}; overflow:hidden; animation: ${isMobile ? 'slideUp 0.3s' : 'popIn 0.3s'} ease-out; box-sizing:border-box;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">📄 大宗商品买卖合同签署</h3>
            <div style="width:32px; height:3px; background:#1677ff; border-radius:2px; margin-top:4px;"></div>
          </div>
          <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>

        <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px; font-size:13px; line-height:1.5; color:#334155; box-sizing:border-box;">
          
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px; box-sizing:border-box;">
            <div style="text-align:center; font-size:14px; font-weight:bold; color:#0f172a; margin-bottom:10px;">工业品买卖电子合同</div>
            <p style="margin:4px 0;"><strong>合同编号：</strong>HT-${order.id}</p>
            <p style="margin:4px 0;"><strong>买方 (采购)：</strong>${order.buyerName}</p>
            <p style="margin:4px 0;"><strong>卖方 (供应)：</strong>${order.shopName}</p>
            <hr style="margin:8px 0; border:none; border-top:1px dashed #cbd5e1;">
            <table style="width:100%; border-collapse:collapse; font-size:11px; margin-top:6px;">
              <thead>
                <tr style="background:#f1f5f9; text-align:left;">
                  <th style="border:1px solid #e2e8f0; padding:6px;">货物名称规格</th>
                  <th style="border:1px solid #e2e8f0; padding:6px; text-align:right;">总价金额</th>
                </tr>
              </thead>
              <tbody>
                ${goodsRows}
              </tbody>
            </table>
            
            <div style="display:flex; justify-content:space-between; margin-top:12px; font-size:11px;">
              <div>
                <div>买方盖章：</div>
                <div style="margin-top:4px;">
                  ${order.status !== 0 ? `<span style="border:1.5px dashed #22c55e; color:#22c55e; padding:2px 6px; border-radius:4px; font-weight:bold; display:inline-block;">✔ 已盖章</span>` : `<span style="color:#94a3b8; font-style:italic;">(未签章)</span>`}
                </div>
              </div>
              <div>
                <div>卖方盖章：</div>
                <div style="margin-top:4px;">
                  ${(order.status !== 0 && order.status !== 5) ? `<span style="border:1.5px dashed #22c55e; color:#22c55e; padding:2px 6px; border-radius:4px; font-weight:bold; display:inline-block;">✔ 已盖章</span>` : `<span style="color:#94a3b8; font-style:italic;">(未签章)</span>`}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div style="font-weight:bold; color:#1e293b; margin-bottom:8px;">请选择签署方式：</div>
            
            <div style="display:flex; border-bottom:2px solid #e2e8f0; margin-bottom:12px; gap:16px;">
              <div id="prd-sign-tab-online" style="padding:6px 4px; cursor:pointer; color:#1677ff; border-bottom:2px solid #1677ff; font-weight:bold;" onclick="UI.toggleContractSignTab(this, 'online')">💻 在线签章</div>
              <div id="prd-sign-tab-offline" style="padding:6px 4px; cursor:pointer; color:#64748b; font-weight:500;" onclick="UI.toggleContractSignTab(this, 'offline')">📤 上传纸质已签署合同</div>
            </div>

            <div id="prd-sign-pane-online" style="display:block; text-align:center; padding:12px 0;">
              <p style="font-size:12px; color:#64748b; margin-top:0; margin-bottom:12px;">使用系统默认CA证书及电子签章即时在线锁定签约（免打印）</p>
              <button id="prd-sign-online-btn" style="background:#1677ff; color:#fff; border:none; padding:10px 24px; border-radius:12px; font-weight:bold; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(22,119,255,0.2); transition:all 0.2s;" onclick="UI.performOnlineContractSign(this)">
                <span>✍️ 立即签名盖章并确认</span>
              </button>
            </div>

            <div id="prd-sign-pane-offline" style="display:none;">
              <p style="font-size:12px; color:#64748b; margin-top:0; margin-bottom:12px;">不使用线上签章时，请下载合同打印并双方签字盖章后，拍照或扫描上传</p>
              
              <div style="position:relative; border:2px dashed #cbd5e1; border-radius:12px; background:#f8fafc; padding:20px; text-align:center; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#1677ff';this.style.background='#f0f7ff'" onmouseout="this.style.borderColor='#cbd5e1';this.style.background='#f8fafc'" onclick="document.getElementById('prd-contract-file-picker').click()">
                <div style="font-size:24px; margin-bottom:6px;">📂</div>
                <div id="prd-upload-text" style="font-size:12px; color:#475569; font-weight:bold;">点击选择或拖拽上传合同文件 (PDF/JPG/PNG)</div>
                <div style="font-size:10px; color:#94a3b8; margin-top:4px;">建议大小不超过 10MB</div>
                <input type="file" id="prd-contract-file-picker" accept=".pdf,.jpg,.jpeg,.png" style="display:none;" onchange="UI.handleContractFileSelected(this)">
              </div>
              <div id="prd-upload-card" style="display:none; align-items:center; justify-content:space-between; margin-top:10px; padding:10px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; font-size:12px; color:#15803d; box-sizing:border-box;">
                <span id="prd-upload-file-name" style="font-weight:bold;"></span>
                <span style="cursor:pointer; color:#ef4444; font-weight:bold;" onclick="UI.clearUploadedContract(event)">删除</span>
              </div>
            </div>
          </div>
        </div>

        <div style="padding:16px 20px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc; flex-shrink:0;">
          <button style="background:#fff; border:1px solid #cbd5e1; color:#475569; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:bold; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">关闭</button>
          <button id="prd-contract-confirm-btn" style="background:#cbd5e1; color:#fff; border:none; padding:8px 20px; border-radius:8px; font-size:13px; font-weight:bold; cursor:not-allowed;" disabled onclick="UI.submitContractSigning('${orderId}', ${isSeller})">确认签署</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    
    this._signingState = {
      method: 'online',
      onlineSigned: false,
      offlineFile: null
    };
  },

  toggleContractSignTab(tabEl, mode) {
    const paneOnline = document.getElementById('prd-sign-pane-online');
    const paneOffline = document.getElementById('prd-sign-pane-offline');
    const tabOnline = document.getElementById('prd-sign-tab-online');
    const tabOffline = document.getElementById('prd-sign-tab-offline');

    tabOnline.style.color = '#64748b';
    tabOnline.style.borderBottom = 'none';
    tabOnline.style.fontWeight = '500';

    tabOffline.style.color = '#64748b';
    tabOffline.style.borderBottom = 'none';
    tabOffline.style.fontWeight = '500';

    tabEl.style.color = '#1677ff';
    tabEl.style.borderBottom = '2px solid #1677ff';
    tabEl.style.fontWeight = 'bold';

    this._signingState.method = mode;

    if (mode === 'online') {
      paneOnline.style.display = 'block';
      paneOffline.style.display = 'none';
    } else {
      paneOnline.style.display = 'none';
      paneOffline.style.display = 'block';
    }
    UI.updateContractConfirmButtonState();
  },

  performOnlineContractSign(btn) {
    btn.style.background = '#22c55e';
    btn.innerHTML = '<span>✔ 盖章及数字签名就绪</span>';
    this._signingState.onlineSigned = true;
    UI.updateContractConfirmButtonState();
    UI.toast('电子印章和数字证书已就绪，请点击“确认签署”提交！', 'success');
  },

  handleContractFileSelected(input) {
    const file = input.files[0];
    if (!file) return;

    this._signingState.offlineFile = file;
    document.getElementById('prd-upload-file-name').innerText = `📄 ${file.name}`;
    document.getElementById('prd-upload-card').style.display = 'flex';
    UI.updateContractConfirmButtonState();
    UI.toast('合同扫描件选择成功！请点击“确认签署”上传。', 'success');
  },

  clearUploadedContract(e) {
    e.stopPropagation();
    this._signingState.offlineFile = null;
    document.getElementById('prd-contract-file-picker').value = '';
    document.getElementById('prd-upload-card').style.display = 'none';
    UI.updateContractConfirmButtonState();
  },

  updateContractConfirmButtonState() {
    const confirmBtn = document.getElementById('prd-contract-confirm-btn');
    if (!confirmBtn) return;

    let eligible = false;
    if (this._signingState.method === 'online') {
      eligible = this._signingState.onlineSigned;
    } else {
      eligible = !!this._signingState.offlineFile;
    }

    if (eligible) {
      confirmBtn.style.background = '#1677ff';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.disabled = false;
    } else {
      confirmBtn.style.background = '#cbd5e1';
      confirmBtn.style.cursor = 'not-allowed';
      confirmBtn.disabled = true;
    }
  },

  submitContractSigning(orderId, isSeller) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;

    const isOnline = this._signingState.method === 'online';
    
    if (isOnline) {
      if (isSeller) {
        order.status = 4; // Moved to pending payment
        UI.toast('电子合同商家签章成功！合同已正式生效，等待买家付款。', 'success');
      } else {
        order.status = 5; // Moved to pending seller signature
        UI.toast('您已签名并盖章成功！已向商家发出签约提醒。', 'success');
      }
    } else {
      const fileName = this._signingState.offlineFile ? this._signingState.offlineFile.name : 'offline_signed_contract.pdf';
      order.contractFile = fileName;
      
      if (isSeller) {
        order.status = 4;
        UI.toast(`线下已签署合同 ${fileName} 上传成功！等待买家付款。`, 'success');
      } else {
        order.status = 5;
        UI.toast(`已上传签字盖章的合同文件 ${fileName}，已向商家发出签约提醒。`, 'success');
      }
    }

    const overlay = document.querySelector('.modal-overlay[style*="z-index: 110000"]');
    if (overlay) overlay.remove();

    if (UI._signingCallback) {
      UI._signingCallback();
      UI._signingCallback = null;
    }
  },

  showPaymentModal(orderId, callback) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;

    UI._paymentCallback = callback;

    if (!document.getElementById('prd-contract-payment-styles')) {
      const s = document.createElement('style');
      s.id = 'prd-contract-payment-styles';
      s.textContent = `
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `;
      document.head.appendChild(s);
    }

    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important; pointer-events:auto !important;';
    
    const isMobile = window.innerWidth <= 768;
    const contentWidth = isMobile ? '100%' : '520px';
    
    if (isMobile) {
      modal.style.alignItems = 'flex-end';
      modal.style.padding = '0';
    }

    modal.innerHTML = `
      <div class="modal-content" style="width:${contentWidth}; background:#ffffff; border-radius:${isMobile ? '24px 24px 0 0' : '24px'}; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:${isMobile ? '85vh' : '90vh'}; overflow:hidden; animation: ${isMobile ? 'slideUp 0.3s' : 'popIn 0.3s'} ease-out; box-sizing:border-box;">
        
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">💳 确认支付货款</h3>
            <div style="width:32px; height:3px; background:#1677ff; border-radius:2px; margin-top:4px;"></div>
          </div>
          <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>

        <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:16px; font-size:13px; line-height:1.5; color:#334155; box-sizing:border-box;">
          
          <div style="background:#fff7e6; border:1px solid #ffd591; border-radius:12px; padding:14px; box-sizing:border-box;">
            <div style="font-size:11px; color:#d46b08; font-weight:bold;">等待买家付款</div>
            <div style="font-size:15px; font-weight:bold; color:#0f172a; margin-top:6px;">订单金额：<span style="color:#ef4444; font-family:monospace; font-size:18px; font-weight:900;">${order.amount}</span></div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">订单编号：${order.id} | 卖家：${order.shopName}</div>
          </div>

          <div>
            <div style="font-weight:bold; color:#1e293b; margin-bottom:8px;">请选择支付方式：</div>
            
            <div style="display:flex; border-bottom:2px solid #e2e8f0; margin-bottom:12px; gap:16px;">
              <div id="prd-pay-tab-online" style="padding:6px 4px; cursor:pointer; color:#1677ff; border-bottom:2px solid #1677ff; font-weight:bold;" onclick="UI.togglePaymentTab(this, 'online')">⚡ 在线支付</div>
              <div id="prd-pay-tab-offline" style="padding:6px 4px; cursor:pointer; color:#64748b; font-weight:500;" onclick="UI.togglePaymentTab(this, 'offline')">🏦 线下对公打款凭证</div>
            </div>

            <div id="prd-pay-pane-online" style="display:block; text-align:center; padding:12px 0;">
              <p style="font-size:12px; color:#64748b; margin-top:0; margin-bottom:12px;">直接使用关联的快捷资金账户进行在线转账支付</p>
              <button id="prd-pay-online-btn" style="background:#1677ff; color:#fff; border:none; padding:10px 24px; border-radius:12px; font-weight:bold; font-size:13px; cursor:pointer; display:inline-flex; align-items:center; gap:6px; box-shadow:0 4px 12px rgba(22,119,255,0.2); transition:all 0.2s;" onclick="UI.performOnlinePayment(this)">
                <span>⚡ 确认在线快捷支付</span>
              </button>
            </div>

            <div id="prd-pay-pane-offline" style="display:none; flex-direction:column; gap:12px;">
              <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 12px; font-size:11px; color:#475569; line-height:1.6; box-sizing:border-box;">
                <div style="font-weight:bold; color:#0f172a; margin-bottom:4px;">🏦 平台对公收款账户：</div>
                <div><strong>开户银行：</strong>中国建设银行股份有限公司园区支行</div>
                <div><strong>银行账号：</strong>6217 0000 1234 5678 901</div>
                <div><strong>账户名称：</strong>咖喱粑粑（园区）商流技术服务有限公司</div>
                <div style="color:#f59e0b; margin-top:4px;">* 请在线下完成公对公转账后，在此上传转账回执单/银行底单凭证。</div>
              </div>

              <div style="position:relative; border:2px dashed #cbd5e1; border-radius:12px; background:#f8fafc; padding:18px; text-align:center; cursor:pointer; transition:all 0.2s;" onmouseover="this.style.borderColor='#1677ff';this.style.background='#f0f7ff'" onmouseout="this.style.borderColor='#cbd5e1';this.style.background='#f8fafc'" onclick="document.getElementById('prd-voucher-file-picker').click()">
                <div style="font-size:24px; margin-bottom:6px;">📎</div>
                <div id="prd-voucher-upload-text" style="font-size:12px; color:#475569; font-weight:bold;">点击选择或拖拽上传汇款回执单/凭证 (图片/PDF)</div>
                <input type="file" id="prd-voucher-file-picker" accept="image/*,.pdf" style="display:none;" onchange="UI.handleVoucherFileSelected(this)">
              </div>
              <div id="prd-voucher-upload-card" style="display:none; align-items:center; justify-content:space-between; padding:8px 12px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; font-size:12px; color:#15803d; box-sizing:border-box;">
                <span id="prd-voucher-upload-file-name" style="font-weight:bold;"></span>
                <span style="cursor:pointer; color:#ef4444; font-weight:bold;" onclick="UI.clearUploadedVoucher(event)">删除</span>
              </div>
            </div>
          </div>
        </div>

        <div style="padding:16px 20px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc; flex-shrink:0;">
          <button style="background:#fff; border:1px solid #cbd5e1; color:#475569; padding:8px 16px; border-radius:8px; font-size:13px; font-weight:bold; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button id="prd-pay-confirm-btn" style="background:#cbd5e1; color:#fff; border:none; padding:8px 20px; border-radius:8px; font-size:13px; font-weight:bold; cursor:not-allowed;" disabled onclick="UI.submitPayment('${orderId}')">确认付款</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    this._paymentState = {
      method: 'online',
      onlinePaid: false,
      voucherFile: null
    };
  },

  togglePaymentTab(tabEl, mode) {
    const paneOnline = document.getElementById('prd-pay-pane-online');
    const paneOffline = document.getElementById('prd-pay-pane-offline');
    const tabOnline = document.getElementById('prd-pay-tab-online');
    const tabOffline = document.getElementById('prd-pay-tab-offline');

    tabOnline.style.color = '#64748b';
    tabOnline.style.borderBottom = 'none';
    tabOnline.style.fontWeight = '500';

    tabOffline.style.color = '#64748b';
    tabOffline.style.borderBottom = 'none';
    tabOffline.style.fontWeight = '500';

    tabEl.style.color = '#1677ff';
    tabEl.style.borderBottom = '2px solid #1677ff';
    tabEl.style.fontWeight = 'bold';

    this._paymentState.method = mode;

    if (mode === 'online') {
      paneOnline.style.display = 'block';
      paneOffline.style.display = 'none';
    } else {
      paneOnline.style.display = 'none';
      paneOffline.style.display = 'flex';
    }
    UI.updatePaymentConfirmButtonState();
  },

  performOnlinePayment(btn) {
    btn.style.background = '#22c55e';
    btn.innerHTML = '<span>✔ 付款就绪 (验证通过)</span>';
    this._paymentState.onlinePaid = true;
    UI.updatePaymentConfirmButtonState();
    UI.toast('支付通道就绪，请点击“确认付款”提交支付！', 'success');
  },

  handleVoucherFileSelected(input) {
    const file = input.files[0];
    if (!file) return;

    this._paymentState.voucherFile = file;
    document.getElementById('prd-voucher-upload-file-name').innerText = `📄 ${file.name}`;
    document.getElementById('prd-voucher-upload-card').style.display = 'flex';
    UI.updatePaymentConfirmButtonState();
    UI.toast('付款凭证选择成功！请点击“确认付款”提交。', 'success');
  },

  clearUploadedVoucher(e) {
    e.stopPropagation();
    this._paymentState.voucherFile = null;
    document.getElementById('prd-voucher-file-picker').value = '';
    document.getElementById('prd-voucher-upload-card').style.display = 'none';
    UI.updatePaymentConfirmButtonState();
  },

  updatePaymentConfirmButtonState() {
    const confirmBtn = document.getElementById('prd-pay-confirm-btn');
    if (!confirmBtn) return;

    let eligible = false;
    if (this._paymentState.method === 'online') {
      eligible = this._paymentState.onlinePaid;
    } else {
      eligible = !!this._paymentState.voucherFile;
    }

    if (eligible) {
      confirmBtn.style.background = '#1677ff';
      confirmBtn.style.cursor = 'pointer';
      confirmBtn.disabled = false;
    } else {
      confirmBtn.style.background = '#cbd5e1';
      confirmBtn.style.cursor = 'not-allowed';
      confirmBtn.disabled = true;
    }
  },

  submitPayment(orderId) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;

    const isOnline = this._paymentState.method === 'online';

    if (isOnline) {
      order.status = 1;
      UI.toast('货款在线支付成功！商家已收到到账通知，准备发货。', 'success');
    } else {
      const fileName = this._paymentState.voucherFile ? this._paymentState.voucherFile.name : 'offline_payment_voucher.jpg';
      order.paymentVoucher = fileName;
      order.status = 1;
      UI.toast(`付款凭证 ${fileName} 上传成功！已通知卖家查验并准备发货。`, 'success');
    }

    const overlay = document.querySelector('.modal-overlay[style*="z-index: 110000"]');
    if (overlay) overlay.remove();

    if (UI._paymentCallback) {
      UI._paymentCallback();
      UI._paymentCallback = null;
    }
  },

  showInvoiceModal(orderId, callback) {
    const order = MockData.orders.find(o => o.id === orderId);
    if (!order) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important;';

    const isMobile = window.innerWidth <= 768;
    const contentWidth = isMobile ? '100%' : '480px';
    if (isMobile) {
      overlay.style.alignItems = 'flex-end';
      overlay.style.padding = '0';
    }

    overlay.innerHTML = `
      <div style="width:${contentWidth}; background:#ffffff; border-radius:${isMobile ? '24px 24px 0 0' : '16px'}; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:85vh; overflow:hidden; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">📝 申请开具发票</h3>
            <div style="width:32px; height:3px; background:#1677ff; border-radius:2px; margin-top:4px;"></div>
          </div>
          <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>

        <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:14px; font-size:13px; color:#334155; box-sizing:border-box;">
          <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px;">
            <div style="font-weight:bold; color:#0f172a;">发票金额：<span style="color:#ef4444; font-family:monospace; font-size:16px;">${order.amount}</span></div>
            <div style="font-size:11px; color:#64748b; margin-top:4px;">订单编号：${order.id}</div>
          </div>

          <div>
            <label style="display:block; font-weight:bold; margin-bottom:6px; color:#1e293b;">抬头类型 *</label>
            <div style="display:flex; gap:16px;">
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="inv-type" value="enterprise" checked onchange="document.getElementById('inv-tax-group').style.display='block'"> 企业
              </label>
              <label style="display:flex; align-items:center; gap:6px; cursor:pointer;">
                <input type="radio" name="inv-type" value="individual" onchange="document.getElementById('inv-tax-group').style.display='none'"> 个人/非企业
              </label>
            </div>
          </div>

          <div>
            <label style="display:block; font-weight:bold; margin-bottom:6px; color:#1e293b;">发票抬头名称 *</label>
            <input type="text" id="inv-title-input" class="form-control" placeholder="请输入发票抬头" style="width:100%; height:36px; padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; box-sizing:border-box;">
          </div>

          <div id="inv-tax-group">
            <label style="display:block; font-weight:bold; margin-bottom:6px; color:#1e293b;">纳税人识别号 *</label>
            <input type="text" id="inv-tax-input" class="form-control" placeholder="请输入企业税号" style="width:100%; height:36px; padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; box-sizing:border-box;">
          </div>

          <div>
            <label style="display:block; font-weight:bold; margin-bottom:6px; color:#1e293b;">接收邮箱 *</label>
            <input type="email" id="inv-email-input" class="form-control" placeholder="请输入电子邮箱" style="width:100%; height:36px; padding:6px 12px; border-radius:6px; border:1px solid #cbd5e1; box-sizing:border-box;">
          </div>
        </div>

        <div style="background:#f9fafb; padding:12px 20px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; flex-shrink:0;">
          <button class="btn btn-outline" style="border-radius:6px; padding:6px 16px; font-size:12px;" onclick="this.closest('.modal-overlay').remove()">取消</button>
          <button class="btn btn-primary" id="inv-submit-btn" style="border-radius:6px; padding:6px 16px; font-size:12px;">提交申请</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelector('#inv-submit-btn').onclick = () => {
      const isEnterprise = overlay.querySelector('input[name="inv-type"]:checked').value === 'enterprise';
      const title = overlay.querySelector('#inv-title-input').value.trim();
      const tax = overlay.querySelector('#inv-tax-input').value.trim();
      const email = overlay.querySelector('#inv-email-input').value.trim();

      if (!title) {
        UI.toast('请填写发票抬头名称！', 'error');
        return;
      }
      if (isEnterprise && !tax) {
        UI.toast('请填写企业纳税人识别号！', 'error');
        return;
      }
      if (!email) {
        UI.toast('请填写接收发票的电子邮箱！', 'error');
        return;
      }

      order.invoiceApplied = true;
      order.invoiceDetails = { isEnterprise, title, tax, email, time: new Date().toISOString() };
      
      UI.toast('发票申请已提交，电子发票开具后将发送至您的邮箱！', 'success');
      overlay.remove();

      if (callback) callback();
    };
  },

  showDemandQuotesModal(demandId, isMobile, callback) {
    const demand = MockData.demands.find(d => d.id === demandId);
    if (!demand) return;

    const quotes = MockData.demandQuotes.filter(q => q.demandId === demandId);

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important;';

    const contentWidth = isMobile ? '100%' : '600px';
    if (isMobile) {
      overlay.style.alignItems = 'flex-end';
      overlay.style.padding = '0';
    }

    let quotesHtml = '';
    if (quotes.length === 0) {
      quotesHtml = `<div style="text-align:center; padding:40px 20px; color:#64748b; font-size:14px;">暂无商家报价</div>`;
    } else {
      quotes.forEach(q => {
        let actionBtn = q.status === 1 
          ? `<span style="color:#52c41a; font-weight:bold; font-size:12px;">已采纳成单</span>` 
          : `<div style="display:flex; gap:8px;">
               <button class="btn btn-outline btn-sm" style="border-radius:4px; padding:4px 8px;" onclick="UI.chatWithQuoteSeller('${q.shopName}', '${q.shopId}', '${demand.title.replace(/'/g, "\\'")}', '${q.price}')">💬 沟通</button>
               <button class="btn btn-primary btn-sm" style="border-radius:4px; padding:4px 8px;" onclick="UI.acceptDemandQuote('${q.id}', ${isMobile})">确认采纳</button>
             </div>`;

        quotesHtml += `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; margin-bottom:10px;">
            <div>
              <div style="font-weight:bold; color:#1e293b; font-size:14px;">${q.shopName}</div>
              <div style="color:#64748b; font-size:11px; margin-top:2px;">报价时间：${q.time}</div>
              <div style="color:#ef4444; font-weight:bold; font-size:14px; margin-top:4px;">报价金额：${q.price}</div>
            </div>
            <div>
              ${actionBtn}
            </div>
          </div>
        `;
      });
    }

    overlay.innerHTML = `
      <div style="width:${contentWidth}; background:#ffffff; border-radius:${isMobile ? '24px 24px 0 0' : '16px'}; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:80vh; overflow:hidden; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">📋 求购报价列表</h3>
            <div style="font-size:12px; color:#64748b; margin-top:4px; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${demand.title}</div>
          </div>
          <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
        </div>

        <div style="padding:20px; overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:10px; box-sizing:border-box;">
          ${quotesHtml}
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    UI._demandQuotesCallback = callback;
  },

  acceptDemandQuote(quoteId, isMobile) {
    const q = MockData.demandQuotes.find(x => x.id === quoteId);
    if (!q) return;

    const demand = MockData.demands.find(d => d.id === q.demandId);
    if (!demand) return;

    q.status = 1;
    demand.status = 2; // 已结束

    // Generate Order
    const newOrderId = 'ORD' + new Date().getTime().toString().substring(5);
    const newOrder = {
      id: newOrderId,
      buyerName: demand.buyerName,
      shopName: q.shopName,
      shopId: q.shopId,
      productName: demand.title + ' (求购采纳成单)',
      amount: q.price.split('/')[0], // Extract price
      type: '现货交易',
      status: 0, // 待买家签约
      time: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    MockData.orders.unshift(newOrder);

    UI.toast(`采纳成功！已自动生成现货订单 ${newOrderId}`, 'success');

    const overlay = document.querySelector('.modal-overlay[style*="z-index: 110000"]');
    if (overlay) overlay.remove();

    if (UI._demandQuotesCallback) {
      UI._demandQuotesCallback();
    }
  },

  chatWithQuoteSeller(shopName, shopId, prodTitle, prodPrice) {
    const overlay = document.querySelector('.modal-overlay[style*="z-index: 110000"]');
    if (overlay) overlay.remove();

    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      UI.openModal('sheet-h5-chat');
      document.getElementById('h5-chat-prod-title').innerText = prodTitle;
      document.getElementById('h5-chat-prod-price').innerText = prodPrice;
      document.getElementById('h5-chat-prod-img').src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80';
    } else {
      UI.openModal('modal-chat');
      document.getElementById('chat-prod-title').innerText = prodTitle;
      document.getElementById('chat-prod-price').innerText = prodPrice;
      document.getElementById('chat-prod-img').src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80';
    }
  }
});
