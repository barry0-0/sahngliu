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

  previewDocument(title, type, docNo, amount = '¥0.00', buyer = '买方', seller = '卖方') {
    let modal = document.getElementById('modal-doc-preview');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-doc-preview';
    modal.style.cssText = 'position:fixed !important; inset:0 !important; background:rgba(15,23,42,0.6) !important; backdrop-filter:blur(10px) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:120000 !important; padding:20px !important; box-sizing:border-box !important; opacity:1 !important; pointer-events:auto !important;';

    let contentHtml = '';
    if (type === 'contract') {
      contentHtml = `
        <div style="background:#fff5eb; border: 2px solid #e78c45; padding: 40px; font-family: serif; color: #2c1a0c; max-width: 680px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); position: relative; font-size:14px; line-height:1.6; text-align: left;">
          <div style="position: absolute; bottom: 80px; right: 180px; width: 120px; height: 120px; border: 3px solid rgba(239, 68, 68, 0.7); border-radius: 50%; color: rgba(239, 68, 68, 0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; transform: rotate(-15deg); pointer-events: none; text-align: center; line-height: 1.2;">
            <div style="font-size:10px;">★</div>
            <div>${buyer.substring(0, 8)}</div>
            <div style="border-top:1px solid rgba(239, 68, 68, 0.7); margin-top:2px; padding-top:2px;">CA 电子签章</div>
          </div>
          <div style="position: absolute; bottom: 60px; right: 60px; width: 120px; height: 120px; border: 3px solid rgba(239, 68, 68, 0.7); border-radius: 50%; color: rgba(239, 68, 68, 0.7); display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; transform: rotate(15deg); pointer-events: none; text-align: center; line-height: 1.2;">
            <div style="font-size:10px;">★</div>
            <div>${seller.substring(0, 8)}</div>
            <div style="border-top:1px solid rgba(239, 68, 68, 0.7); margin-top:2px; padding-top:2px;">CA 电子签章</div>
          </div>

          <h2 style="text-align: center; font-size: 22px; color: #1a0f05; margin-bottom: 24px; border-bottom: 2px double #e78c45; padding-bottom: 12px; font-weight: bold;">大宗商品买卖交易及履约合同</h2>
          <div style="margin-bottom: 20px;"><strong>合同编号：</strong>${docNo || 'HT-ORD-202607'}</div>
          
          <div style="margin-bottom: 16px;">
            <div><strong>甲方（买方）：</strong>${buyer}</div>
            <div><strong>乙方（卖方）：</strong>${seller}</div>
          </div>

          <p>根据《中华人民共和国民法典》及相关法律法规，甲乙双方本着自愿、平等、互惠互利的原则，就大宗商品采销交易达成如下协议：</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
            <thead>
              <tr style="border-bottom: 1px solid #e78c45; text-align: left;">
                <th style="padding: 6px 0;">货品名称</th>
                <th style="padding: 6px 0; text-align: right;">单价</th>
                <th style="padding: 6px 0; text-align: center;">交割方式</th>
                <th style="padding: 6px 0; text-align: right;">结算总价</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 8px 0; font-weight: bold;">合同约定履约货品（按批结算）</td>
                <td style="padding: 8px 0; text-align: right;">市场公允价</td>
                <td style="padding: 8px 0; text-align: center;">专车包干配送</td>
                <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #ef4444;">${amount}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 24px;">
            <strong>主要条款说明：</strong>
            <ol style="margin-top: 6px; padding-left: 20px;">
              <li><strong>交货期限：</strong>自订单合同生效且买方支付担保金入托管账户起3个工作日内发货。</li>
              <li><strong>质量保证：</strong>货到目的地后，买方应在24小时内完成质量验收，如有异议需提供国家承认的第三方检测报告。</li>
              <li><strong>结算路径：</strong>货款由平台监管托管，买方收到货并确认无异议后，由平台全额拨付至卖方。</li>
            </ol>
          </div>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div>
              <div>甲方代表签章：</div>
              <div style="margin-top: 40px; font-family: monospace; color: #64748b;">[已数字签章已存证]</div>
            </div>
            <div style="text-align: right; margin-right: 40px;">
              <div>乙方代表签章：</div>
              <div style="margin-top: 40px; font-family: monospace; color: #64748b;">[已数字签章已存证]</div>
            </div>
          </div>
        </div>
      `;
    } else {
      contentHtml = `
        <div style="background:#fff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 30px; max-width: 580px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.05); font-size:13px; text-align: left;">
          <h2 style="text-align: center; font-size: 18px; color: #0f172a; margin-top:0; margin-bottom: 20px; font-weight:bold; letter-spacing:1px;">中国建设银行记账凭证 (线下汇款回执)</h2>
          <div style="border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
            <div style="background: #f8fafc; padding: 12px; border-bottom: 1px solid #e2e8f0; display:flex; justify-content:space-between; font-weight:bold; color:#475569;">
              <span>回单编号: ${docNo || 'CCB-TRF-20260720'}</span>
              <span style="color:#16a34a;">交易成功</span>
            </div>
            <div style="padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; line-height: 1.5;">
              <div><span style="color:#64748b;">付款方：</span><strong style="color:#1e293b;">${buyer}</strong></div>
              <div><span style="color:#64748b;">收款方：</span><strong style="color:#1e293b;">${seller}</strong></div>
              <div><span style="color:#64748b;">付款账号：</span><span style="font-family:monospace; color:#334155;">6217 **** **** 8812</span></div>
              <div><span style="color:#64748b;">收款账号：</span><span style="font-family:monospace; color:#334155;">6222 **** **** 9931</span></div>
              <div><span style="color:#64748b;">付款开户行：</span><span>中国建设银行杭州萧山支行</span></div>
              <div><span style="color:#64748b;">收款开户行：</span><span>招商银行深圳湾分行</span></div>
              <div style="grid-column: span 2; border-top:1px dashed #e2e8f0; margin-top:8px; padding-top:12px; display:flex; justify-content:space-between; align-items:center;">
                <span style="color:#64748b;">转账金额：</span>
                <strong style="color:#ef4444; font-size: 18px;">${amount}</strong>
              </div>
              <div style="grid-column: span 2;"><span style="color:#64748b;">交易时间：</span><span>2026-07-20 14:00:23</span></div>
              <div style="grid-column: span 2;"><span style="color:#64748b;">交易附言：</span><span>大宗交易订单货款结清 - 存证转账</span></div>
            </div>
          </div>
          <div style="text-align: center; color: #94a3b8; font-size: 11px;">
            提示：本凭证仅供平台交易查阅核对使用，盖有建行电子专用章。
          </div>
        </div>
      `;
    }

    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; width:740px; max-width:96vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        <div style="background:#1e293b; color:#fff; padding:16px 20px; display:flex; justify-content:space-between; align-items:center;">
          <div style="font-weight:bold; font-size:15px;">🔍 资料文件在线实时预览 - ${title}</div>
          <button onclick="document.getElementById('modal-doc-preview').remove()" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer; line-height:1; hover:color:#fff;">&times;</button>
        </div>
        <div style="padding:24px; overflow-y:auto; flex:1; background:#f1f5f9; box-sizing:border-box;">
          ${contentHtml}
        </div>
        <div style="background:#f8fafc; padding:12px 20px; display:flex; justify-content:flex-end; border-top:1px solid #cbd5e1;">
          <button class="btn btn-primary btn-sm" onclick="document.getElementById('modal-doc-preview').remove()" style="border-radius:6px; padding:6px 16px;">关闭预览</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.setProperty('display', 'flex', 'important');
      modal.style.setProperty('opacity', '1', 'important');
      modal.style.setProperty('pointer-events', 'auto', 'important');
      modal.style.setProperty('z-index', '110000', 'important');
      modal.classList.add('active');
    }
  },

  closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove('active');
      modal.style.setProperty('display', 'none', 'important');
      modal.style.setProperty('opacity', '0', 'important');
      modal.style.setProperty('pointer-events', 'none', 'important');
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
   * 查看订单轨迹和详情
   */
  showOrderDetail(orderId) {
    if (window.MallApp && typeof window.MallApp.showOrderDetail === 'function' && document.getElementById('page-user-center')) {
      window.MallApp.showOrderDetail(orderId);
      return;
    }
    const o = (MockData.orders || []).find(item => item.id === orderId);
    if (!o) {
      this.toast('未找到该订单的详细记录！', 'warning');
      return;
    }

    const shop = (MockData.shops || []).find(s => s.id === o.shopId || s.shopName === o.shopName);
    const sellerCompany = shop ? shop.companyName : (o.sellerCompany || '华东大宗物资贸易有限公司');
    const buyerPhone = o.buyerPhone || '138****8818';

    const amountVal = parseFloat(o.amount.replace(/[^\d\.]/g, '')) || 100000;
    const commRateStr = o.commissionRate || '0.60%';
    const commFeeVal = (amountVal * 0.006).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2});

    let statusText = '';
    let statusColor = '';
    if (o.status === 0) { statusText = '待买家签约'; statusColor = '#fa8c16'; }
    else if (o.status === 5) { statusText = '待卖家签约'; statusColor = '#c41d7f'; }
    else if (o.status === 4) { statusText = '待付款'; statusColor = '#d46b08'; }
    else if (o.status === 1) { statusText = '待发货'; statusColor = '#1677ff'; }
    else if (o.status === 2) { statusText = '待签收(已发货)'; statusColor = '#0958d9'; }
    else if (o.status === 3) { statusText = '已完成'; statusColor = '#52c41a'; }
    else if (o.status === -1) { statusText = '已关闭'; statusColor = '#ff4d4f'; }

    let modal = document.getElementById('modal-order-detail');
    if (modal) modal.remove();

    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-order-detail';
    modal.style.cssText = 'position:fixed !important; inset:0 !important; background:rgba(15,23,42,0.45) !important; backdrop-filter:blur(8px) !important; display:flex !important; align-items:center !important; justify-content:center !important; z-index:110000 !important; padding:20px !important; box-sizing:border-box !important; opacity:1 !important; pointer-events:auto !important;';

    const dateStr = (o.time || '2026-07-08 09:12').split(' ')[0];

    const stepItems = [
      { num: 1, title: '订单创建', time: o.time || '2026-07-08 09:12', done: true },
      { num: 2, title: '买家盖章', time: o.status === 0 || o.status === 4 ? '等待签章' : `${dateStr} 10:15`, done: o.status !== 0 && o.status !== 4 },
      { num: 3, title: '卖家盖章', time: o.status === 0 || o.status === 5 || o.status === 4 ? '等待签章' : `${dateStr} 11:20`, done: o.status !== 0 && o.status !== 5 && o.status !== 4 },
      { num: 4, title: '打款与核销', time: o.status === 4 ? '等待打款' : (o.status === 0 || o.status === 5 ? '等待合同' : `${dateStr} 14:00`), done: o.status !== 0 && o.status !== 5 && o.status !== 4 },
      { num: 5, title: '物流发货', time: o.status === 1 ? '备货中' : (o.status === 2 || o.status === 3 ? `${dateStr} 15:45` : '未发货'), done: o.status === 2 || o.status === 3 },
      { num: 6, title: '签收结清', time: o.status === 3 ? `${dateStr} 18:30` : '等待确认', done: o.status === 3 }
    ];

    let stepsHtml = `
      <div style="display:flex; justify-content:space-between; align-items:center; position:relative; margin-bottom:20px; background:#f8fafc; padding:16px 20px; border-radius:12px; border:1px solid #e2e8f0;">
    `;
    stepItems.forEach((st, i) => {
      const activeColor = st.done ? '#10b981' : '#cbd5e1';
      const isCurrent = (o.status === 0 && i === 1) || (o.status === 5 && i === 2) || (o.status === 4 && i === 3) || (o.status === 1 && i === 4) || (o.status === 2 && i === 5) || (o.status === 3 && i === 5);
      stepsHtml += `
        <div style="display:flex; flex-direction:column; align-items:center; z-index:2; text-align:center;">
          <div style="width:28px; height:28px; border-radius:50%; background:${isCurrent ? '#7c3aed' : activeColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:bold; box-shadow: ${isCurrent ? '0 0 0 4px rgba(124,58,237,0.2)' : 'none'};">
            ${st.done ? '✓' : st.num}
          </div>
          <div style="font-size:12px; font-weight:bold; color:${isCurrent ? '#7c3aed' : st.done ? '#0f172a' : '#94a3b8'}; margin-top:6px;">${st.title}</div>
          <div style="font-size:10px; color:#94a3b8; margin-top:2px;">${st.time}</div>
        </div>
      `;
      if (i < stepItems.length - 1) {
        stepsHtml += `<div style="flex:1; height:2px; background:${st.done ? '#10b981' : '#e2e8f0'}; margin:0 8px; align-self:flex-start; margin-top:14px;"></div>`;
      }
    });
    stepsHtml += `</div>`;

    modal.innerHTML = `
      <div style="background:#fff; border-radius:16px; width:860px; max-width:96vw; max-height:90vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);">
        
        <!-- Modal Header -->
        <div style="background:#0f172a; color:#fff; padding:18px 24px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:18px; background:rgba(255,255,255,0.1); width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center;">📄</span>
            <div>
              <div style="font-weight:bold; font-size:16px;">大宗履约订单详情</div>
              <div style="font-size:11px; color:#94a3b8; margin-top:2px;">订单编号: <span style="font-family:monospace; color:#38bdf8;">${o.id}</span> | 交易模式: ${o.type || '现货交易'}</div>
            </div>
          </div>
          <button onclick="UI.closeModal('modal-order-detail')" style="background:none; border:none; color:#94a3b8; font-size:24px; cursor:pointer; line-height:1; hover:color:#fff;" title="关闭">&times;</button>
        </div>

        <!-- Modal Body -->
        <div style="padding:24px; overflow-y:auto; flex:1; font-size:13px; color:#334155; display:flex; flex-direction:column; gap:20px; box-sizing:border-box;">
          
          <!-- Step Process Bar -->
          ${stepsHtml}

          <!-- Info Cards Section -->
          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
            
            <!-- Buyer & Seller Card -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px;">
              <div style="font-weight:bold; font-size:14px; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <span>🏢 交易双边主体信息</span>
                <span class="tag" style="background:${statusColor}15; color:${statusColor}; border:1px solid ${statusColor}40; font-size:11px; padding:2px 8px;">${statusText}</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
                <div><span style="color:#64748b;">采购买家：</span><strong style="color:#0f172a;">${o.buyerName}</strong></div>
                <div><span style="color:#64748b;">买家联系电话：</span><span style="font-family:monospace; color:#0284c7; font-weight:bold;">${buyerPhone}</span></div>
                <div><span style="color:#64748b;">供应商家：</span><strong style="color:#0f172a;">${o.shopName}</strong></div>
                <div><span style="color:#64748b;">卖家主体公司：</span><span style="color:#475569;">${sellerCompany}</span></div>
              </div>
            </div>

            <!-- Finance & Commission Card -->
            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:16px;">
              <div style="font-weight:bold; font-size:14px; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:10px; margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">
                <span>💰 财务金额与平台抽佣计算</span>
                <span style="font-size:11px; color:#64748b;">自动核算比例</span>
              </div>
              <div style="display:flex; flex-direction:column; gap:8px; font-size:12px;">
                <div><span style="color:#64748b;">订单成交总额：</span><strong style="color:#ef4444; font-size:16px;">${o.amount}</strong></div>
                <div><span style="color:#64748b;">平台抽佣费率：</span><span style="color:#0284c7; font-weight:bold;">${commRateStr}</span> <span style="font-size:11px; color:#94a3b8;">(按类目/商家特殊规则生效)</span></div>
                <div><span style="color:#64748b;">预计平台抽佣金额：</span><strong style="color:#7c3aed; font-size:14px;">¥${commFeeVal}</strong></div>
                <div><span style="color:#64748b;">资金流转路径：</span><span style="color:#475569;">买卖双边线下公对公汇款 (平台存证与核查)</span></div>
              </div>
            </div>

          </div>

          <!-- Goods Detail Table -->
          <div style="border:1px solid #e2e8f0; border-radius:12px; overflow:hidden;">
            <div style="background:#f8fafc; padding:12px 16px; border-bottom:1px solid #e2e8f0; font-weight:bold; font-size:13px; color:#0f172a;">
              📦 订购商品明细表
            </div>
            <table style="width:100%; border-collapse:collapse; text-align:left; font-size:12px;">
              <thead>
                <tr style="background:#f1f5f9; border-bottom:1px solid #e2e8f0;">
                  <th style="padding:10px 16px;">序号</th>
                  <th style="padding:10px 16px;">货品名称</th>
                  <th style="padding:10px 16px;">单价 (元)</th>
                  <th style="padding:10px 16px;">履约数量</th>
                  <th style="padding:10px 16px; text-align:right;">小计金额</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding:12px 16px;">1</td>
                  <td style="padding:12px 16px; font-weight:bold; color:#0f172a;">${o.productName}</td>
                  <td style="padding:12px 16px; color:#475569;">依据合同约定标价</td>
                  <td style="padding:12px 16px; font-weight:bold;">大宗按批交割</td>
                  <td style="padding:12px 16px; text-align:right; font-weight:bold; color:#ef4444;">${o.amount}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Electronic Contract & Certificate Section -->
          <div style="background:#faf5ff; border:1px solid #e9d5ff; border-radius:12px; padding:16px;">
            <div style="font-weight:bold; font-size:13px; color:#6b21a8; margin-bottom:8px; display:flex; items-center; justify-content:space-between;">
              <span>📜 电子合同与双边 CA 签章状态存证</span>
              <span style="font-size:11px; background:#f3e8ff; color:#7e22ce; padding:2px 8px; border-radius:4px;">CA 电子签章存证</span>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; font-size:12px; margin-top:8px;">
              <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #f3e8ff;">
                <div style="font-weight:bold; color:#0f172a; margin-bottom:4px;">买方主体盖章：</div>
                <div style="color:${o.status === 0 || o.status === 4 ? '#d97706' : '#16a34a'}; font-weight:bold;">
                  ${o.status === 0 || o.status === 4 ? '⏳ 待买家完成电子盖章' : '✓ 万通建材采购部 (已完成 CA 电子签章存证)'}
                </div>
              </div>
              <div style="background:#fff; padding:10px; border-radius:8px; border:1px solid #f3e8ff;">
                <div style="font-weight:bold; color:#0f172a; margin-bottom:4px;">卖方主体盖章：</div>
                <div style="color:${o.status === 0 || o.status === 5 || o.status === 4 ? '#d97706' : '#16a34a'}; font-weight:bold;">
                  ${o.status === 0 || o.status === 5 || o.status === 4 ? '⏳ 待卖家完成电子盖章' : `✓ ${o.shopName} (已完成 CA 电子签章存证)`}
                </div>
              </div>
          </div>

          <!-- Payment Voucher Card -->
          <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px;">
            <div style="font-weight:bold; font-size:13px; color:#166534; margin-bottom:8px; display:flex; align-items:center; justify-content:space-between;">
              <span>💳 货款支付凭证核实</span>
              <span style="font-size:11px; background:#dcfce7; color:#15803d; padding:2px 8px; border-radius:4px;">财务确认入账</span>
            </div>
            <div style="background:#fff; padding:12px; border-radius:8px; border:1px solid #bbf7d0; font-size:12px;">
              ${o.status === 0 || o.status === 5 || o.status === 4 
                ? `<span style="color:#fa8c16; font-weight:bold;">⏳ 订单尚未付款</span>`
                : o.paymentVoucher 
                  ? `<div style="display:flex; justify-content:space-between; align-items:center;">
                       <div>
                         <div style="font-weight:bold; color:#0f172a;">线下汇款回执：${o.paymentVoucher}</div>
                         <div style="color:#64748b; font-size:11px; margin-top:2px;">付款金额: ${o.amount} | 汇款方式: 银行公对公转账</div>
                       </div>
                       <button class="btn btn-outline btn-sm" onclick="UI.previewDocument('线下对公转账凭证', 'voucher', '${o.paymentVoucher}', '${o.amount}', '${o.buyerName}', '${o.shopName}')" style="border-radius:6px; font-size:11px; padding:4px 10px; background:#fff; cursor:pointer;">查看凭证</button>
                     </div>`
                  : `<div style="display:flex; justify-content:space-between; align-items:center;">
                       <div>
                         <div style="font-weight:bold; color:#15803d;">在线支付：担保结算已结清</div>
                         <div style="color:#64748b; font-size:11px; margin-top:2px;">支付流水号: TXN-PAY-${o.id} | 托管状态: 平台监管中</div>
                       </div>
                       <button class="btn btn-outline btn-sm" onclick="UI.previewDocument('在线支付电子回单', 'voucher', 'TXN-PAY-${o.id}', '${o.amount}', '${o.buyerName}', '${o.shopName}')" style="border-radius:6px; font-size:11px; padding:4px 10px; background:#fff; cursor:pointer;">查看电子回单</button>
                     </div>`
              }
            </div>
          </div>

        </div>

        <!-- Modal Footer -->
        <div style="background:#f8fafc; padding:16px 24px; border-top:1px solid #e2e8f0; display:flex; justify-content:flex-end; gap:12px; flex-shrink:0;">
          <button class="btn btn-outline" style="border-radius:8px; padding:8px 20px;" onclick="UI.closeModal('modal-order-detail')">关闭窗口</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.openModal('modal-order-detail');
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
   * 生成通用的分页 HTML 代码 (包含共多少条，X条/页下拉框，上一页/下一页)
   * @param {number} totalItems 总数据量
   * @param {number} currentPage 当前页
   * @param {number} pageSize 每页条数
   */
  renderPagination(totalItems, currentPage = 1, pageSize = 10) {
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    let html = `
      <div class="pagination-bar flex justify-between items-center mt-4 text-sm text-secondary flex-wrap gap-2" style="border-top: 1px solid #f2f3f5; padding-top: 14px;">
        <div class="flex items-center gap-3">
          <span>共 <strong style="color:var(--primary-color, #ae86e7); font-weight:bold;">${totalItems}</strong> 条</span>
          <select class="form-control page-size-select" style="padding: 2px 6px; font-size: 12px; height: 28px; width: 92px; border-radius:4px; border: 1px solid #cbd5e1;">
            <option value="5" ${pageSize == 5 ? 'selected' : ''}>5 条/页</option>
            <option value="10" ${pageSize == 10 ? 'selected' : ''}>10 条/页</option>
            <option value="15" ${pageSize == 15 ? 'selected' : ''}>15 条/页</option>
            <option value="30" ${pageSize == 30 ? 'selected' : ''}>30 条/页</option>
          </select>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn btn-outline btn-sm" style="padding:3px 10px; font-size:12px;" ${currentPage <= 1 ? 'disabled' : ''}>上一页</button>
          <span style="font-size:12px; font-weight:bold; color:#475569;">${currentPage} / ${totalPages} 页</span>
          <button class="btn btn-outline btn-sm" style="padding:3px 10px; font-size:12px;" ${currentPage >= totalPages ? 'disabled' : ''}>下一页</button>
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
  
  // 绑定 50 字限制动态计数器
  document.body.addEventListener('input', (e) => {
    if (e.target.matches('[maxlength="50"], .limit-50')) {
      const val = e.target.value;
      const container = e.target.parentElement;
      if (container) {
        let countEl = container.querySelector('.char-counter');
        if (!countEl) {
          countEl = document.createElement('div');
          countEl.className = 'char-counter';
          countEl.style.cssText = 'font-size: 11px; color: #94a3b8; text-align: right; margin-top: 4px; font-family: monospace;';
          container.appendChild(countEl);
        }
        countEl.innerText = `${val.length}/50`;
        if (val.length >= 50) {
          countEl.style.color = '#ef4444';
        } else {
          countEl.style.color = '#94a3b8';
        }
      }
    }
  });

  // 全局演示辅助：点击任何含有状态特征的元素，就地循环切换其文本内容，方便开发查看不同 UI 样式
  document.body.addEventListener('click', (e) => {
    let el = e.target.closest('.tag, .badge, [class*="status"], [class*="state"]');
    if (!el) return;
    
    // 如果已经有了自定义的周期切换函数（如 cycleShopStatus 等），则不打断其自带的 JS 逻辑
    if (el.onclick || el.getAttribute('onclick') || el.closest('[onclick]')) {
      return; 
    }
    
    const text = el.innerText.trim();
    if (!text || text.length > 25) return; // 太长的句子不属于状态标签
    
    // 各种状态的常见映射组
    const groups = [
      ['正常营业', '待审核', '闭店中'],
      ['待审批', '已同意', '已拒绝', '待提交'],
      ['现货', '预售'],
      ['售卖中', '已下架', '已售罄', '违规下架'],
      ['交易中', '待付款', '待收货', '已完成', '已取消', '退款中'],
      ['求购中', '已成单', '已关闭', '待审核'],
      ['竞价中', '已中标', '已废标', '已结束']
    ];
    
    for (const group of groups) {
      // 模糊匹配
      const matchIndex = group.findIndex(s => text.includes(s));
      if (matchIndex !== -1) {
        const nextState = group[(matchIndex + 1) % group.length];
        
        // 动态变更类名和背景字色，使样式更配合
        el.innerText = nextState;
        if (['正常营业', '已同意', '现货', '售卖中', '已完成', '已成单', '已中标'].includes(nextState)) {
          el.className = el.className.replace(/tag-\w+|badge-\w+/g, '') + ' tag-success';
          el.style.backgroundColor = ''; el.style.color = '';
        } else if (['待审核', '待提交', '预售', '交易中', '待付款', '待收货', '求购中', '竞价中', '待审批'].includes(nextState)) {
          el.className = el.className.replace(/tag-\w+|badge-\w+/g, '') + ' tag-warning';
          el.style.backgroundColor = ''; el.style.color = '';
        } else {
          el.className = el.className.replace(/tag-\w+|badge-\w+/g, '') + ' tag-danger';
          el.style.backgroundColor = ''; el.style.color = '';
        }
        UI.toast(`[演示切换] 状态已切换为: ${nextState}`, 'info');
        e.preventDefault();
        e.stopPropagation();
        break;
      }
    }
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

        <div style="padding:${isMobile ? '16px 20px 32px' : '16px 20px'}; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc; flex-shrink:0;">
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
                <div style="color:#f59e0b;">* 请在线下完成公对公转账后，在此上传转账回执单/银行底单凭证以供平台审核入账。</div>
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

        <div style="padding:${isMobile ? '16px 20px 32px' : '16px 20px'}; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px; background:#f8fafc; flex-shrink:0;">
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
  showDemandQuotesModal(demandId, isMobile, callback, isAdmin) {
    const demand = (MockData.demands || []).find(d => d.id === demandId || d.demandNo === demandId) || {
      id: demandId,
      goodsName: `大宗求购货品项目 (${demandId})`
    };
    const demandTitle = (demand.goodsName || demand.title || '大宗求购货品项目').replace(/'/g, "\\'");

    let quotes = (MockData.demandQuotes || []).filter(q => q.demandId === demandId || q.demandId === demand.id);
    if (quotes.length === 0) {
      quotes = [
        { id: 'QT001', demandId, shopId: 'S001', shopName: '远大钢铁官方直营店', price: '¥4,100.00 / 吨', time: '2026-07-07 10:15', status: 0 },
        { id: 'QT002', demandId, shopId: 'S002', shopName: '华东木材集散中心', price: '¥4,150.00 / 吨', time: '2026-07-07 11:30', status: 0 }
      ];
    }

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important;';

    const contentWidth = isMobile ? '100%' : '600px';
    if (isMobile) {
      overlay.style.alignItems = 'flex-end';
      overlay.style.padding = '0';
    }

    let quotesHtml = '';
    quotes.forEach(q => {
        let actionBtn = '';
        if (isAdmin) {
          actionBtn = q.status === 1 
            ? `<span style="color:#52c41a; font-weight:bold; font-size:12px;">已采纳成单</span>` 
            : `<span style="color:#64748b; font-size:12px;">未采纳</span>`;
        } else {
          actionBtn = q.status === 1 
            ? `<span style="color:#52c41a; font-weight:bold; font-size:12px;">已采纳成单</span>` 
            : `<div style="display:flex; gap:8px;">
                 <button class="btn btn-outline btn-sm" style="border-radius:4px; padding:4px 8px;" onclick="UI.chatWithQuoteSeller('${q.shopName}', '${q.shopId}', '${demandTitle}', '${q.price}')">💬 沟通</button>
                 <button class="btn btn-primary btn-sm" style="border-radius:4px; padding:4px 8px;" onclick="UI.acceptDemandQuote('${q.id}', ${isMobile})">确认采纳</button>
               </div>`;
        }
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

    overlay.innerHTML = `
      <div style="width:${contentWidth}; background:#ffffff; border-radius:${isMobile ? '24px 24px 0 0' : '16px'}; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:80vh; overflow:hidden; box-sizing:border-box;">
        <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9; flex-shrink:0;">
          <div>
            <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">📋 求购报价列表</h3>
            <div style="font-size:12px; color:#64748b; margin-top:4px; max-width: 400px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${demandTitle}</div>
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
