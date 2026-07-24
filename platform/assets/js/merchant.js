
function formatTimeSec(str) {
  if (!str || str === "--") return "--";
  str = String(str).trim();
  if (str.length === 10) return str + " 00:00:00";
  if (str.length === 16) return str + ":00";
  return str;
}
/**
 * 商家端后台业务逻辑 (Merchant Dashboard V2)
 */

const MerchantApp = {
  currentShopId: 'S001', 

  init() {
    UI.initSidebarSpa();
    
    this.renderShopInfo();
    this.initCatFilters();
    this.renderAllProducts();
    this.renderListedProducts();
    this.renderOrders();
    this.renderBiddingRes();
    this.renderBiddingAnn();
    this.renderMerchantDashboard();

    const orderMenu = document.querySelector('.sub-menu-item[data-page="page-orders"]');
    if (orderMenu) {
      orderMenu.addEventListener('click', () => {
        MerchantApp.hideOrderDetailPage();
      });
    }

    // 默认激活第一个子菜单（数据中心）
    const defaultTab = document.querySelector('.sub-menu-item[data-page="page-merchant-dashboard"]');
    if (defaultTab) defaultTab.click();
  },

  switchPage(pageId) {
    if (pageId === 'page-orders') {
      MerchantApp.hideOrderDetailPage();
    }
    const item = document.querySelector(`.sub-menu-item[data-page="${pageId}"], .menu-item[data-page="${pageId}"]`);
    if (item) {
      item.click();
    }
  },

  _appendPagination(tbody, totalItems) {
    const parent = tbody.closest('.card-body');
    if (!parent) return;
    const existing = parent.querySelector('.pagination-container');
    if (existing) existing.remove();

    if (totalItems > 0) {
      const pageDiv = document.createElement('div');
      pageDiv.className = 'pagination-container';
      pageDiv.innerHTML = UI.renderPagination(totalItems, 1, 10);
      parent.appendChild(pageDiv);
    }
  },

  // 1. 店铺管理
  renderShopInfo() {
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      const shopIdInput = document.getElementById('shop-id-display');
      if (shopIdInput) shopIdInput.value = shop.id;
      const shopNameInput = document.getElementById('shop-name-input');
      if (shopNameInput) shopNameInput.value = shop.shopName;
      document.getElementById('shop-avatar-preview').src = shop.avatar || 'https://via.placeholder.com/100';
      document.getElementById('shop-banner-preview').src = shop.banner || 'https://via.placeholder.com/800x200';

      // 渲染店铺当前状态
      const statusText = document.getElementById('pc-shop-status-text');
      const statusBadge = document.getElementById('pc-shop-status-badge');
      const warningBox = document.getElementById('pc-shop-warning-box');
      const reasonText = document.getElementById('pc-suspend-reason-text');

      if (statusBadge) {
        statusBadge.style.cursor = 'pointer';
        statusBadge.title = '点击切换状态 (演示用)';
        statusBadge.setAttribute('onclick', 'window.cycleMerchantShopStatus()');
      }

      // 控制编辑按钮和表单置灰锁定
      const isPending = (shop.status === '待审核');
      if (shopNameInput) shopNameInput.disabled = isPending;
      
      const actionBox = document.querySelector('#page-shop .card-body > div:last-child');
      if (actionBox) {
        if (isPending) {
          actionBox.innerHTML = `
            <div style="display:flex; align-items:center; gap:16px;">
              <span class="text-secondary text-sm">🔒 店铺资料已提交审核，当前处于只读锁定状态</span>
              <button class="btn btn-outline" style="padding: 8px 24px; font-weight: bold; color: #ef4444; border-color: #fca5a5;" onclick="MerchantApp.withdrawShopAudit()">撤回审核</button>
            </div>
          `;
        } else {
          actionBox.innerHTML = `
            <button class="btn btn-primary" style="padding: 10px 40px; font-weight: bold;" onclick="MerchantApp.saveShopInfo()">提交审核</button>
          `;
        }
      }

      if (shop.status === '闭店中' || shop.status === '已关停' || shop.status === '已禁用' || shop.status === '审核未通过') {
        if (shop.suspendReason) {
          if (statusText) statusText.innerText = '您的店铺已被平台强行关闭整改，限制对外展现！';
          if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-danger" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">闭店中 (已下架)</span>';
          if (warningBox) warningBox.style.display = 'block';
          if (reasonText) reasonText.innerText = shop.suspendReason;
        } else if (shop.rejectReason) {
          if (statusText) statusText.innerText = '您的店铺资料审核未通过，处于关闭状态，请根据拒审原因修改后重新提交！';
          if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-danger" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">闭店中 (审核未通过)</span>';
          if (warningBox) warningBox.style.display = 'block';
          if (reasonText) reasonText.innerText = shop.rejectReason;
        } else {
          if (statusText) statusText.innerText = '您的店铺当前处于闭店状态，外部买家不可见。';
          if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-secondary" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px; background:#e2e8f0; color:#475569;">闭店中</span>';
          if (warningBox) warningBox.style.display = 'none';
        }
      } else if (shop.status === '待审核') {
        if (statusText) statusText.innerText = '店铺基本资料及装潢信息已提交审核，预计在1-2个工作日内完成审核。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-warning" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">待审核</span>';
        if (warningBox) warningBox.style.display = 'none';
      } else if (shop.status === '未开店' || !shop.status) {
        if (statusText) statusText.innerText = '您的账号尚未完成开店，请在下方在线填写商户基本信息与装潢提交审核。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-secondary" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px; background:#f1f5f9; color:#64748b;">未开店</span>';
        if (warningBox) warningBox.style.display = 'none';
      } else {
        // 正常营业 / 正常
        if (statusText) statusText.innerText = '您的店铺处于正常对外营业状态，各渠道货源及现货市场展现正常。';
        if (statusBadge) statusBadge.innerHTML = '<span class="tag tag-success" style="font-size: 13px; padding: 4px 12px; font-weight: bold; border-radius: 12px;">正常营业</span>';
        if (warningBox) warningBox.style.display = 'none';
      }
    }
  },

  withdrawShopAudit() {
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.status = '未开店';
      delete shop.rejectReason;
      delete shop.suspendReason;
      UI.toast('已成功撤回审核，恢复编辑模式', 'info');
      this.renderShopInfo();
    }
  },

  saveShopInfo() {
    const newName = document.getElementById('shop-name-input').value.trim();
    if (!newName) {
      UI.toast('商户名不能为空', 'warning');
      return;
    }
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.shopName = newName;
      shop.status = '待审核'; // 提交审核
      UI.toast('店铺资料及装潢信息提交成功，等待平台运营审核', 'success');
      this.renderShopInfo();
    }
  },

  submitShopAppeal() {
    const newName = document.getElementById('shop-name-input').value.trim();
    if (!newName) {
      UI.toast('商户名不能为空', 'warning');
      return;
    }
    const shop = MockData.shops.find(s => s.id === this.currentShopId);
    if (shop) {
      shop.shopName = newName;
      shop.status = '待审核'; // 重新提交审核
      delete shop.suspendReason;
      UI.toast('资料修改申诉已重新提交审核！', 'success');
      this.renderShopInfo();
    }
  },

  // 2. 商品中心 - 所有商品列表
  renderAllProducts() {
    const tbody = document.querySelector('#table-all-products tbody');
    let html = '';
    let myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    
    // Apply filters
    const kwEl = document.getElementById('filter-all-prod-kw');
    if (kwEl && kwEl.value.trim() !== '') {
      const kw = kwEl.value.trim().toLowerCase();
      myProducts = myProducts.filter(p => p.name.toLowerCase().includes(kw));
    }
    
    // Cascader filter
    if (this._selectedCategoryNames && this._selectedCategoryNames.length > 0) {
      myProducts = myProducts.filter(p => this._selectedCategoryNames.includes(p.category));
    }

    // Sort newest first
    myProducts.sort((a, b) => {
      const tA = new Date((a.createTime || '2026-01-01 09:00:00').replace(/-/g, '/')).getTime();
      const tB = new Date((b.createTime || '2026-01-01 09:00:00').replace(/-/g, '/')).getTime();
      return tB - tA;
    });

    const getCategoryFullPath = (catName) => {
      if (!MockData.productCategories) return catName;
      for (const c1 of MockData.productCategories) {
        if (c1.children) {
          for (const c2 of c1.children) {
            if (c2.children) {
              for (const c3 of c2.children) {
                if (c3.name === catName || c3.id === catName) {
                  const l1 = c1.name.replace('米面类', '').replace('与杂粮', '').replace('制品', '').replace('类', '').replace('大宗', '').replace('禽畜', '').replace('加工', '');
                  const l2 = c2.name.replace('米面类', '').replace('与杂粮', '').replace('制品', '').replace('类', '').replace('大宗', '').replace('禽畜', '').replace('加工', '');
                  const l3 = c3.name;
                  return `${l1}-${l2}-${l3}`;
                }
              }
            }
          }
        }
      }
      return catName;
    };

    const getProductCode = (p, idx) => {
      if (p.code) return p.code;
      const codeNum = p.id.replace(/[^0-9]/g, '');
      return 'GD' + (codeNum ? codeNum.padStart(5, '0').slice(-5) : String(idx + 1).padStart(5, '0'));
    };

    const formatDateTime = (dtStr) => {
      if (!dtStr) return '--';
      dtStr = String(dtStr).trim();
      if (dtStr.length === 10) return dtStr + ' 00:00:00';
      if (dtStr.length === 16) return dtStr + ':00';
      return dtStr;
    };

    myProducts.forEach((p, idx) => {
      // Edit & Delete buttons are ALWAYS present for every row
      const acts = `
        <button class="btn btn-text btn-sm text-primary" onclick="MerchantApp.editProduct('${p.id}')">编辑</button>
        <button class="btn btn-text btn-sm text-danger" onclick="MerchantApp.deleteProduct('${p.id}')">删除</button>
      `;

      const pCode = getProductCode(p, idx);
      const catFull = getCategoryFullPath(p.category);
      const cTime = formatDateTime(p.createTime || '2026-07-01 10:00:00');
      const uTime = formatDateTime(p.opTime || p.createTime || '2026-07-01 10:00:00');

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${pCode}</td>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover;"></td>
          <td style="font-weight:bold; color:#0f172a;">${p.name}</td>
          <td><span class="text-xs text-secondary bg-slate-100 px-2 py-1 rounded" style="font-weight:500;">${catFull}</span></td>
          <td style="font-size:12px; color:#64748b; font-family:monospace;">${cTime}</td>
          <td style="font-size:12px; color:#64748b; font-family:monospace;">${uTime}</td>
          <td><div class="flex gap-2">${acts}</div></td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="8" class="text-center py-8 text-secondary">暂无商品数据</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  },

  _selectedCategoryNames: [],

  initCatFilters() {
    this.renderCatCascaderCols();
    const cat1Add = document.getElementById('add-prod-cat1');
    if (!MockData.productCategories) return;
    
    let optionsAddHtml = '<option value="">请选择一级分类</option>';
    MockData.productCategories.forEach(c => {
      optionsAddHtml += `<option value="${c.id}">${c.name}</option>`;
    });
    if (cat1Add) cat1Add.innerHTML = optionsAddHtml;

    // Global click listener to close cascader panel when clicking outside
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('filter-cat-cascader-panel');
      const trigger = document.getElementById('filter-cat-cascader-trigger');
      if (panel && trigger && !panel.contains(e.target) && !trigger.contains(e.target)) {
        panel.style.display = 'none';
      }
    });
  },

  toggleCatCascaderPanel(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById('filter-cat-cascader-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    }
  },

  renderCatCascaderCols(selectedCat1Id = null, selectedCat2Id = null) {
    const col1 = document.getElementById('cascader-col-cat1');
    const col2 = document.getElementById('cascader-col-cat2');
    const col3 = document.getElementById('cascader-col-cat3');
    if (!col1 || !col2 || !col3 || !MockData.productCategories) return;

    // Helper: get all level 3 names under c1 or c2
    const getAllSubCat3Names = (cObj) => {
      let names = [];
      if (cObj.children) {
        cObj.children.forEach(c2 => {
          if (c2.children) {
            c2.children.forEach(c3 => names.push(c3.name));
          } else if (c2.name) {
            names.push(c2.name);
          }
        });
      }
      return names;
    };

    const getC2SubCat3Names = (c2Obj) => {
      let names = [];
      if (c2Obj.children) {
        c2Obj.children.forEach(c3 => names.push(c3.name));
      }
      return names;
    };

    // Render Level 1
    col1.innerHTML = MockData.productCategories.map(c1 => {
      const allSub = getAllSubCat3Names(c1);
      const isAllChecked = allSub.length > 0 && allSub.every(name => this._selectedCategoryNames.includes(name));
      const isSomeChecked = !isAllChecked && allSub.some(name => this._selectedCategoryNames.includes(name));
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; background: ${c1.id === selectedCat1Id ? 'var(--primary-bg)' : 'transparent'}; color: ${c1.id === selectedCat1Id ? 'var(--primary-color)' : '#334155'}; font-weight: ${c1.id === selectedCat1Id ? 'bold' : 'normal'};" onclick="MerchantApp.selectCascaderCat1('${c1.id}')">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; margin: 0;" onclick="event.stopPropagation()">
            <input type="checkbox" ${isAllChecked ? 'checked' : ''} ${isSomeChecked ? 'style="opacity:0.7;"' : ''} onchange="MerchantApp.toggleCascaderCat1Check(this, '${c1.id}')">
            <span>${c1.name}</span>
          </label>
          <span style="font-size: 10px; color: #cbd5e1;">›</span>
        </div>
      `;
    }).join('');

    // Render Level 2
    if (selectedCat1Id) {
      const c1Obj = MockData.productCategories.find(c => c.id === selectedCat1Id);
      if (c1Obj && c1Obj.children) {
        col2.innerHTML = c1Obj.children.map(c2 => {
          const sub = getC2SubCat3Names(c2);
          const isAllChecked = sub.length > 0 && sub.every(name => this._selectedCategoryNames.includes(name));
          const isSomeChecked = !isAllChecked && sub.some(name => this._selectedCategoryNames.includes(name));
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; background: ${c2.id === selectedCat2Id ? 'var(--primary-bg)' : 'transparent'}; color: ${c2.id === selectedCat2Id ? 'var(--primary-color)' : '#334155'}; font-weight: ${c2.id === selectedCat2Id ? 'bold' : 'normal'};" onclick="MerchantApp.selectCascaderCat2('${selectedCat1Id}', '${c2.id}')">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; margin: 0;" onclick="event.stopPropagation()">
                <input type="checkbox" ${isAllChecked ? 'checked' : ''} ${isSomeChecked ? 'style="opacity:0.7;"' : ''} onchange="MerchantApp.toggleCascaderCat2Check(this, '${selectedCat1Id}', '${c2.id}')">
                <span>${c2.name}</span>
              </label>
              <span style="font-size: 10px; color: #cbd5e1;">›</span>
            </div>
          `;
        }).join('');
      } else {
        col2.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">无二级分类</div>';
      }
    } else {
      col2.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">请先选择一级分类</div>';
    }

    // Render Level 3 Checkboxes
    if (selectedCat1Id && selectedCat2Id) {
      const c1Obj = MockData.productCategories.find(c => c.id === selectedCat1Id);
      const c2Obj = c1Obj?.children?.find(c => c.id === selectedCat2Id);
      if (c2Obj && c2Obj.children) {
        col3.innerHTML = c2Obj.children.map(c3 => {
          const isChecked = this._selectedCategoryNames.includes(c3.name);
          return `
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; user-select: none;">
              <input type="checkbox" value="${c3.name}" ${isChecked ? 'checked' : ''} onchange="MerchantApp.toggleCascaderCat3Check(this, '${c3.name}', '${selectedCat1Id}', '${selectedCat2Id}')">
              <span>${c3.name}</span>
            </label>
          `;
        }).join('');
      } else {
        col3.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">无三级品类</div>';
      }
    } else {
      col3.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">请选择二/三级</div>';
    }
  },

  selectCascaderCat1(c1Id) {
    this.renderCatCascaderCols(c1Id, null);
  },

  selectCascaderCat2(c1Id, c2Id) {
    this.renderCatCascaderCols(c1Id, c2Id);
  },

  toggleCascaderCat1Check(inputEl, c1Id) {
    const c1Obj = MockData.productCategories.find(c => c.id === c1Id);
    if (!c1Obj) return;
    let names = [];
    c1Obj.children?.forEach(c2 => {
      c2.children?.forEach(c3 => names.push(c3.name));
    });

    if (inputEl.checked) {
      names.forEach(name => {
        if (!this._selectedCategoryNames.includes(name)) {
          this._selectedCategoryNames.push(name);
        }
      });
    } else {
      this._selectedCategoryNames = this._selectedCategoryNames.filter(name => !names.includes(name));
    }
    this.updateCatCascaderText();
    this.renderCatCascaderCols(c1Id, null);
  },

  toggleCascaderCat2Check(inputEl, c1Id, c2Id) {
    const c1Obj = MockData.productCategories.find(c => c.id === c1Id);
    const c2Obj = c1Obj?.children?.find(c => c.id === c2Id);
    if (!c2Obj) return;
    let names = c2Obj.children?.map(c3 => c3.name) || [];

    if (inputEl.checked) {
      names.forEach(name => {
        if (!this._selectedCategoryNames.includes(name)) {
          this._selectedCategoryNames.push(name);
        }
      });
    } else {
      this._selectedCategoryNames = this._selectedCategoryNames.filter(name => !names.includes(name));
    }
    this.updateCatCascaderText();
    this.renderCatCascaderCols(c1Id, c2Id);
  },

  toggleCascaderCat3Check(inputEl, cat3Name, c1Id, c2Id) {
    if (inputEl.checked) {
      if (!this._selectedCategoryNames.includes(cat3Name)) {
        this._selectedCategoryNames.push(cat3Name);
      }
    } else {
      this._selectedCategoryNames = this._selectedCategoryNames.filter(name => name !== cat3Name);
    }
    this.updateCatCascaderText();
    this.renderCatCascaderCols(c1Id, c2Id);
  },

  updateCatCascaderText() {
    const textEl = document.getElementById('filter-cat-cascader-text');
    if (!textEl) return;
    if (this._selectedCategoryNames.length === 0) {
      textEl.innerText = '请选择商品分类';
      textEl.style.color = '#94a3b8';
    } else {
      textEl.innerText = `已选 (${this._selectedCategoryNames.length}): ` + this._selectedCategoryNames.join(', ');
      textEl.style.color = '#0f172a';
    }
  },

  clearCatCascaderSelection(e) {
    if (e) e.stopPropagation();
    this._selectedCategoryNames = [];
    this.updateCatCascaderText();
    this.renderCatCascaderCols();
  },

  confirmCatCascaderSelection(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById('filter-cat-cascader-panel');
    if (panel) panel.style.display = 'none';
    this.renderAllProducts();
  },

  resetAllProductsFilter() {
    const kwEl = document.getElementById('filter-all-prod-kw');
    if (kwEl) kwEl.value = '';
    this.clearCatCascaderSelection();
    this.renderAllProducts();
  },

  toggleAddCatCascaderPanel(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById('add-prod-cat-cascader-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        const val = document.getElementById('add-prod-cat3-val')?.value;
        const parents = this.findCategoryParents(val);
        this.renderAddCatCascaderCols(parents?.cat1Id || null, parents?.cat2Id || null);
      }
    }
  },

  renderAddCatCascaderCols(selectedCat1Id = null, selectedCat2Id = null) {
    const col1 = document.getElementById('add-cascader-col-cat1');
    const col2 = document.getElementById('add-cascader-col-cat2');
    const col3 = document.getElementById('add-cascader-col-cat3');
    if (!col1 || !col2 || !col3 || !MockData.productCategories) return;

    const currentVal = document.getElementById('add-prod-cat3-val')?.value;

    // Render Level 1
    col1.innerHTML = MockData.productCategories.map(c1 => `
      <div style="padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 12px; background: ${c1.id === selectedCat1Id ? 'var(--primary-bg)' : 'transparent'}; color: ${c1.id === selectedCat1Id ? 'var(--primary-color)' : '#334155'}; font-weight: ${c1.id === selectedCat1Id ? 'bold' : 'normal'};" onclick="MerchantApp.selectAddCascaderCat1('${c1.id}')">
        ${c1.name}
      </div>
    `).join('');

    // Render Level 2
    if (selectedCat1Id) {
      const c1Obj = MockData.productCategories.find(c => c.id === selectedCat1Id);
      if (c1Obj && c1Obj.children) {
        col2.innerHTML = c1Obj.children.map(c2 => `
          <div style="padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 12px; background: ${c2.id === selectedCat2Id ? 'var(--primary-bg)' : 'transparent'}; color: ${c2.id === selectedCat2Id ? 'var(--primary-color)' : '#334155'}; font-weight: ${c2.id === selectedCat2Id ? 'bold' : 'normal'};" onclick="MerchantApp.selectAddCascaderCat2('${selectedCat1Id}', '${c2.id}')">
            ${c2.name}
          </div>
        `).join('');
      } else {
        col2.innerHTML = '<div style="font-size:11px; color:#cbd5e1;">无二级分类</div>';
      }
    } else {
      col2.innerHTML = '<div style="font-size:11px; color:#cbd5e1;">选择一级分类</div>';
    }

    // Render Level 3 Single Selection
    if (selectedCat1Id && selectedCat2Id) {
      const c1Obj = MockData.productCategories.find(c => c.id === selectedCat1Id);
      const c2Obj = c1Obj?.children?.find(c => c.id === selectedCat2Id);
      if (c2Obj && c2Obj.children) {
        col3.innerHTML = c2Obj.children.map(c3 => `
          <div style="padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 12px; background: ${c3.name === currentVal ? '#dcfce7' : '#f8fafc'}; color: ${c3.name === currentVal ? '#15803d' : '#334155'}; font-weight: ${c3.name === currentVal ? 'bold' : 'normal'}; border: 1px solid ${c3.name === currentVal ? '#86efac' : '#e2e8f0'};" onclick="MerchantApp.pickAddCascaderCat3('${c3.name}')">
            ${c3.name} ${c3.name === currentVal ? '✓' : ''}
          </div>
        `).join('');
      } else {
        col3.innerHTML = '<div style="font-size:11px; color:#cbd5e1;">无三级品类</div>';
      }
    } else {
      col3.innerHTML = '<div style="font-size:11px; color:#cbd5e1;">选择二/三级</div>';
    }
  },

  selectAddCascaderCat1(c1Id) {
    this.renderAddCatCascaderCols(c1Id, null);
  },

  selectAddCascaderCat2(c1Id, c2Id) {
    this.renderAddCatCascaderCols(c1Id, c2Id);
  },

  pickAddCascaderCat3(cat3Name) {
    const valInput = document.getElementById('add-prod-cat3-val');
    const textEl = document.getElementById('add-prod-cat-cascader-text');
    const panel = document.getElementById('add-prod-cat-cascader-panel');

    if (valInput) valInput.value = cat3Name;
    if (textEl) {
      const parents = this.findCategoryParents(cat3Name);
      if (parents) {
        const c1Obj = MockData.productCategories.find(c => c.id === parents.cat1Id);
        const c2Obj = c1Obj?.children?.find(c => c.id === parents.cat2Id);
        textEl.innerText = `${c1Obj?.name} / ${c2Obj?.name} / ${cat3Name}`;
      } else {
        textEl.innerText = cat3Name;
      }
      textEl.style.color = '#0f172a';
    }

    if (panel) panel.style.display = 'none';
  },

  findCategoryParents(categoryName) {
    if (!MockData.productCategories) return null;
    for (const c1 of MockData.productCategories) {
      if (c1.children) {
        for (const c2 of c1.children) {
          if (c2.children) {
            for (const c3 of c2.children) {
              if (c3.name === categoryName) {
                return { cat1Id: c1.id, cat2Id: c2.id, cat3Name: c3.name };
              }
            }
          }
        }
      }
    }
    return null;
  },

  // 3. 商品中心 - 已上架列表
  _selectedListedCatNames: [],

  renderListedProducts() {
    const tbody = document.querySelector('#table-listed-products tbody');
    let html = '';
    let myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    
    // Filters according to Excel screenshot:
    // 上架单号: 全匹配
    // 商品名称: 模糊匹配
    // 类别: 现货 / 预售
    // 货品类别: 三级分类下拉多选
    // 上架时间范围: 日期范围筛选
    // 当前状态: 下拉单选 (待审核/已上架/已下架/已售罄/未上架)

    const noEl = document.getElementById('filter-listed-prod-no');
    const kwEl = document.getElementById('filter-listed-prod-kw');
    const typeEl = document.getElementById('filter-listed-prod-type');
    const startDateEl = document.getElementById('filter-listed-prod-start-date');
    const endDateEl = document.getElementById('filter-listed-prod-end-date');
    const statusEl = document.getElementById('filter-listed-prod-status');

    const getListNo = (p, idx) => {
      if (p.listNo) return p.listNo;
      const numStr = p.id ? p.id.replace(/[^0-9]/g, '') : '';
      return 'LST' + (numStr ? numStr.padStart(4, '0').slice(-4) : String(idx + 1).padStart(4, '0'));
    };

    if (noEl && noEl.value.trim() !== '') {
      const targetNo = noEl.value.trim().toLowerCase();
      myProducts = myProducts.filter((p, idx) => getListNo(p, idx).toLowerCase() === targetNo);
    }

    if (kwEl && kwEl.value.trim() !== '') {
      const kw = kwEl.value.trim().toLowerCase();
      myProducts = myProducts.filter(p => p.name.toLowerCase().includes(kw));
    }

    if (typeEl && typeEl.value !== '') {
      const typeVal = typeEl.value;
      myProducts = myProducts.filter(p => (p.type === typeVal || p.shelfType === typeVal));
    }

    // 货品类别 (三级分类下拉多选)
    if (this._selectedListedCatNames && this._selectedListedCatNames.length > 0) {
      myProducts = myProducts.filter(p => this._selectedListedCatNames.includes(p.category));
    }

    const dateRangeEl = document.getElementById('filter-listed-prod-date-range');
    if (dateRangeEl && dateRangeEl.value.trim() !== '') {
      const parts = dateRangeEl.value.trim().split('~').map(s => s.trim());
      const startMs = parts[0] ? new Date(parts[0] + ' 00:00:00').getTime() : 0;
      const endMs = parts[1] ? new Date(parts[1] + ' 23:59:59').getTime() : (parts[0] ? new Date(parts[0] + ' 23:59:59').getTime() : Infinity);
      myProducts = myProducts.filter(p => {
        const t = new Date((p.listTime || p.createTime || '2026-07-01 09:00:00').replace(/-/g, '/')).getTime();
        return t >= startMs && t <= endMs;
      });
    }

    if (statusEl && statusEl.value !== '') {
      const statusVal = statusEl.value;
      myProducts = myProducts.filter(p => String(p.status) === statusVal || (statusVal === '草稿' && (String(p.status) === '草稿' || String(p.status) === '未上架')));
    }

    // Sort by listTime/createTime descending (newest first)
    myProducts.sort((a, b) => {
      const tA = new Date((a.listTime || a.createTime || '2026-01-01 09:00:00').replace(/-/g, '/')).getTime();
      const tB = new Date((b.listTime || b.createTime || '2026-01-01 09:00:00').replace(/-/g, '/')).getTime();
      return tB - tA;
    });

    const getCategoryFullPath = (catName) => {
      if (!MockData.productCategories) return catName;
      for (const c1 of MockData.productCategories) {
        if (c1.children) {
          for (const c2 of c1.children) {
            if (c2.children) {
              for (const c3 of c2.children) {
                if (c3.name === catName || c3.id === catName) {
                  const l1 = c1.name.replace('米面类', '').replace('与杂粮', '').replace('制品', '').replace('类', '').replace('大宗', '').replace('禽畜', '').replace('加工', '');
                  const l2 = c2.name.replace('米面类', '').replace('与杂粮', '').replace('制品', '').replace('类', '').replace('大宗', '').replace('禽畜', '').replace('加工', '');
                  const l3 = c3.name;
                  return `${l1}-${l2}-${l3}`;
                }
              }
            }
          }
        }
      }
      return catName;
    };

    const formatDateTime = (dtStr) => {
      if (!dtStr) return '--';
      dtStr = String(dtStr).trim();
      if (dtStr.length === 10) return dtStr + ' 00:00:00';
      if (dtStr.length === 16) return dtStr + ':00';
      return dtStr;
    };

    const formatPriceStr = (p) => {
      let priceVal = p.priceStr || '¥0.00';
      const numMatch = priceVal.match(/[\d,.]+/);
      if (numMatch) {
        const num = parseFloat(numMatch[0].replace(/,/g, ''));
        const formattedNum = isNaN(num) ? '0.00' : num.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const unitPart = priceVal.replace(/^[¥￥]/, '').replace(/[\d,.]+/, '').trim();
        return `¥${formattedNum} ${unitPart}`.trim();
      }
      return priceVal;
    };

    myProducts.forEach((p, idx) => {
      const listNo = getListNo(p, idx);
      let statusDisplay = '';
      let acts = '';
      let dispStatus = String(p.status);

      // Status & Sub-reasons & Actions according to flowchart logic
      if (dispStatus === '0' || dispStatus === '待审核') {
        statusDisplay = '<span class="tag tag-warning">待审核</span>';
        acts = '<span class="text-xs text-secondary">审核中...</span>';
      } else if (dispStatus === '1' || dispStatus === '已上架') {
        statusDisplay = '<span class="tag tag-success">已上架</span>';
        acts = `<button class="btn btn-text btn-sm text-danger" onclick="MerchantApp.confirmOfflineProduct('${p.id}')">下架</button>`;
      } else if (dispStatus === '2' || dispStatus === '已下架') {
        let subReason = p.downReason || p.rejectReason || '自主下架';
        let reasonStr = `<div style="font-size:11px; color:#ef4444; margin-top:2px;">(原因: ${subReason})</div>`;
        statusDisplay = `<span class="tag tag-danger">已下架</span>${reasonStr}`;
        acts = `
          <button class="btn btn-text btn-sm text-primary" onclick="MerchantApp.editListedProduct('${p.id}')">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="MerchantApp.submitListedProductForAudit('${p.id}')">提交审核</button>
        `;
      } else if (dispStatus === '3' || dispStatus === '已售罄') {
        statusDisplay = '<span class="tag tag-danger" style="background:#fee2e2; color:#991b1b;">已售罄</span>';
        acts = `
          <button class="btn btn-text btn-sm text-primary" onclick="MerchantApp.editListedProduct('${p.id}')">编辑</button>
          <button class="btn btn-primary btn-sm" onclick="MerchantApp.submitListedProductForAudit('${p.id}')">提交审核</button>
        `;
      } else {
        // 草稿 (原未上架)
        statusDisplay = '<span class="tag" style="background:#f1f5f9; color:#475569;">草稿</span>';
        acts = `
          <button class="btn btn-primary btn-sm" onclick="MerchantApp.submitListedProductForAudit('${p.id}')">提交审核</button>
          <button class="btn btn-text btn-sm text-primary" style="margin-left:4px;" onclick="MerchantApp.editListedProduct('${p.id}')">编辑</button>
          <button class="btn btn-outline btn-sm text-danger" style="margin-left:4px;" onclick="MerchantApp.deleteListedProduct('${p.id}')">删除</button>
        `;
      }

      let typeTag = p.type === '预售' || p.shelfType === '预售'
        ? '<span class="tag" style="background:#e0e7ff; color:#4f46e5; border-color:#c7d2fe;">预售</span>'
        : '<span class="tag" style="background:#dcfce7; color:#16a34a; border-color:#bbf7d0;">现货</span>';
      
      let catFull = getCategoryFullPath(p.category);
      let salesStr = (p.sales || 0).toLocaleString('zh-CN');
      let priceDisplay = formatPriceStr(p);
      let lTime = formatDateTime(p.listTime || p.createTime || '2026-07-01 10:00:00');
      let cTime = formatDateTime(p.createTime || '2026-07-01 10:00:00');
      let uTime = formatDateTime(p.opTime || p.listTime || p.createTime || '2026-07-01 10:00:00');

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-family:monospace; font-weight:bold;">${listNo}</td>
          <td><img src="${p.image}" width="40" height="40" style="border-radius:4px; object-fit:cover; cursor:pointer;" onclick="UI.showModalImage('${p.image}')"></td>
          <td style="font-weight:bold; color:#0f172a;">${p.name}</td>
          <td>${typeTag}</td>
          <td><span class="text-xs text-secondary bg-slate-100 px-2 py-1 rounded" style="font-weight:500;">${catFull}</span></td>
          <td class="font-bold" style="color:#ef4444;">${priceDisplay}</td>
          <td style="font-weight:500;">${salesStr}</td>
          <td style="font-size:12px; color:#64748b; font-family:monospace;">${lTime}</td>
          <td style="font-size:12px; color:#64748b; font-family:monospace;">${cTime}</td>
          <td style="font-size:12px; color:#64748b; font-family:monospace;">${uTime}</td>
          <td>${statusDisplay}</td>
          <td><div class="flex gap-2" style="align-items:center;">${acts}</div></td>
        </tr>
      `;
    });

    if (tbody) {
      tbody.innerHTML = html || '<tr><td colspan="13" class="text-center py-8 text-secondary">暂无上架商品数据</td></tr>';
      this._appendPagination(tbody, myProducts.length);
    }
  },

  toggleListedCatCascaderPanel(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById('filter-listed-cat-cascader-panel');
    if (panel) {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
      if (panel.style.display === 'block') {
        this.renderListedCatCascaderCols();
      }
    }
  },

  renderListedCatCascaderCols(selectedCat1Id = null, selectedCat2Id = null) {
    const col1 = document.getElementById('listed-cascader-col-cat1');
    const col2 = document.getElementById('listed-cascader-col-cat2');
    const col3 = document.getElementById('listed-cascader-col-cat3');
    if (!col1 || !col2 || !col3 || !MockData.productCategories) return;

    const getAllSubCat3Names = (cObj) => {
      let names = [];
      if (cObj.children) {
        cObj.children.forEach(c2 => {
          if (c2.children) {
            c2.children.forEach(c3 => names.push(c3.name));
          } else if (c2.name) {
            names.push(c2.name);
          }
        });
      }
      return names;
    };

    const getC2SubCat3Names = (c2Obj) => {
      let names = [];
      if (c2Obj.children) {
        c2Obj.children.forEach(c3 => names.push(c3.name));
      }
      return names;
    };

    // Render Level 1
    col1.innerHTML = MockData.productCategories.map(c1 => {
      const allSub = getAllSubCat3Names(c1);
      const isAllChecked = allSub.length > 0 && allSub.every(name => this._selectedListedCatNames.includes(name));
      const isSomeChecked = !isAllChecked && allSub.some(name => this._selectedListedCatNames.includes(name));
      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; background: ${c1.id === selectedCat1Id ? 'var(--primary-bg)' : 'transparent'}; color: ${c1.id === selectedCat1Id ? 'var(--primary-color)' : '#334155'}; font-weight: ${c1.id === selectedCat1Id ? 'bold' : 'normal'};" onclick="MerchantApp.selectListedCascaderCat1('${c1.id}')">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; margin: 0;" onclick="event.stopPropagation()">
            <input type="checkbox" ${isAllChecked ? 'checked' : ''} ${isSomeChecked ? 'style="opacity:0.7;"' : ''} onchange="MerchantApp.toggleListedCascaderCat1Check(this, '${c1.id}')">
            <span>${c1.name}</span>
          </label>
          <span style="font-size: 10px; color: #cbd5e1;">›</span>
        </div>
      `;
    }).join('');

    // Render Level 2
    if (selectedCat1Id) {
      const c1Obj = MockData.productCategories.find(c => c.id === selectedCat1Id);
      if (c1Obj && c1Obj.children) {
        col2.innerHTML = c1Obj.children.map(c2 => {
          const sub = getC2SubCat3Names(c2);
          const isAllChecked = sub.length > 0 && sub.every(name => this._selectedListedCatNames.includes(name));
          const isSomeChecked = !isAllChecked && sub.some(name => this._selectedListedCatNames.includes(name));
          return `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 13px; background: ${c2.id === selectedCat2Id ? 'var(--primary-bg)' : 'transparent'}; color: ${c2.id === selectedCat2Id ? 'var(--primary-color)' : '#334155'}; font-weight: ${c2.id === selectedCat2Id ? 'bold' : 'normal'};" onclick="MerchantApp.selectListedCascaderCat2('${selectedCat1Id}', '${c2.id}')">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; margin: 0;" onclick="event.stopPropagation()">
                <input type="checkbox" ${isAllChecked ? 'checked' : ''} ${isSomeChecked ? 'style="opacity:0.7;"' : ''} onchange="MerchantApp.toggleListedCascaderCat2Check(this, '${selectedCat1Id}', '${c2.id}')">
                <span>${c2.name}</span>
              </label>
              <span style="font-size: 10px; color: #cbd5e1;">›</span>
            </div>
          `;
        }).join('');
      } else {
        col2.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">无二级分类</div>';
      }
    } else {
      col2.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">请先选择一级分类</div>';
    }

    // Render Level 3 Checkboxes
    if (selectedCat1Id && selectedCat2Id) {
      const c1Obj = MockData.productCategories.find(c => c.id === selectedCat1Id);
      const c2Obj = c1Obj?.children?.find(c => c.id === selectedCat2Id);
      if (c2Obj && c2Obj.children) {
        col3.innerHTML = c2Obj.children.map(c3 => {
          const isChecked = this._selectedListedCatNames.includes(c3.name);
          return `
            <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; cursor: pointer; user-select: none;">
              <input type="checkbox" value="${c3.name}" ${isChecked ? 'checked' : ''} onchange="MerchantApp.toggleListedCascaderCat3Check(this, '${c3.name}', '${selectedCat1Id}', '${selectedCat2Id}')">
              <span>${c3.name}</span>
            </label>
          `;
        }).join('');
      } else {
        col3.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">无三级品类</div>';
      }
    } else {
      col3.innerHTML = '<div style="font-size:12px; color:#cbd5e1;">请选择二/三级</div>';
    }
  },

  selectListedCascaderCat1(c1Id) {
    this.renderListedCatCascaderCols(c1Id, null);
  },

  selectListedCascaderCat2(c1Id, c2Id) {
    this.renderListedCatCascaderCols(c1Id, c2Id);
  },

  toggleListedCascaderCat1Check(inputEl, c1Id) {
    const c1Obj = MockData.productCategories.find(c => c.id === c1Id);
    if (!c1Obj) return;
    let names = [];
    c1Obj.children?.forEach(c2 => {
      c2.children?.forEach(c3 => names.push(c3.name));
    });

    if (inputEl.checked) {
      names.forEach(name => {
        if (!this._selectedListedCatNames.includes(name)) {
          this._selectedListedCatNames.push(name);
        }
      });
    } else {
      this._selectedListedCatNames = this._selectedListedCatNames.filter(name => !names.includes(name));
    }
    this.updateListedCatCascaderText();
    this.renderListedCatCascaderCols(c1Id, null);
  },

  toggleListedCascaderCat2Check(inputEl, c1Id, c2Id) {
    const c1Obj = MockData.productCategories.find(c => c.id === c1Id);
    const c2Obj = c1Obj?.children?.find(c => c.id === c2Id);
    if (!c2Obj) return;
    let names = c2Obj.children?.map(c3 => c3.name) || [];

    if (inputEl.checked) {
      names.forEach(name => {
        if (!this._selectedListedCatNames.includes(name)) {
          this._selectedListedCatNames.push(name);
        }
      });
    } else {
      this._selectedListedCatNames = this._selectedListedCatNames.filter(name => !names.includes(name));
    }
    this.updateListedCatCascaderText();
    this.renderListedCatCascaderCols(c1Id, c2Id);
  },

  toggleListedCascaderCat3Check(inputEl, cat3Name, c1Id, c2Id) {
    if (inputEl.checked) {
      if (!this._selectedListedCatNames.includes(cat3Name)) {
        this._selectedListedCatNames.push(cat3Name);
      }
    } else {
      this._selectedListedCatNames = this._selectedListedCatNames.filter(name => name !== cat3Name);
    }
    this.updateListedCatCascaderText();
    this.renderListedCatCascaderCols(c1Id, c2Id);
  },

  updateListedCatCascaderText() {
    const textEl = document.getElementById('filter-listed-cat-cascader-text');
    if (!textEl) return;
    if (this._selectedListedCatNames.length === 0) {
      textEl.innerText = '三级分类下拉多选';
      textEl.style.color = '#94a3b8';
    } else {
      textEl.innerText = `已选 (${this._selectedListedCatNames.length}): ` + this._selectedListedCatNames.join(', ');
      textEl.style.color = '#0f172a';
    }
  },

  clearListedCatCascaderSelection(e) {
    if (e) e.stopPropagation();
    this._selectedListedCatNames = [];
    this.updateListedCatCascaderText();
    this.renderListedCatCascaderCols();
  },

  confirmListedCatCascaderSelection(e) {
    if (e) e.stopPropagation();
    const panel = document.getElementById('filter-listed-cat-cascader-panel');
    if (panel) panel.style.display = 'none';
    this.renderListedProducts();
  },

  resetListedProductsFilter() {
    const noEl = document.getElementById('filter-listed-prod-no');
    const kwEl = document.getElementById('filter-listed-prod-kw');
    const typeEl = document.getElementById('filter-listed-prod-type');
    const startEl = document.getElementById('filter-listed-prod-start-date');
    const endEl = document.getElementById('filter-listed-prod-end-date');
    const statusEl = document.getElementById('filter-listed-prod-status');

    if (noEl) noEl.value = '';
    if (kwEl) kwEl.value = '';
    if (typeEl) typeEl.value = '';
    if (startEl) startEl.value = '';
    if (endEl) endEl.value = '';
    if (statusEl) statusEl.value = '';

    this.clearListedCatCascaderSelection();
    this.renderListedProducts();
  },

  confirmOfflineProduct(prodId) {
    if (confirm('确认要下架该商品条目吗？下架后前台将无法查看或购买。')) {
      const prod = MockData.products.find(x => x.id == prodId);
      if (prod) {
        prod.status = 2; // 已下架
        prod.downReason = '自主下架';
        UI.toast('商品下架成功', 'info');
        this.renderListedProducts();
        this.renderAllProducts();
      }
    }
  },

  editListedProduct(prodId) {
    const prod = MockData.products.find(p => p.id == prodId);
    if (!prod) return;
    this.populateAddListedProductModal();
    const select = document.getElementById('add-listed-prod-id');
    const typeSelect = document.getElementById('add-listed-prod-type');
    const priceInput = document.getElementById('add-listed-prod-price-num');
    const unitInput = document.getElementById('add-listed-prod-unit');
    const minQtyInput = document.getElementById('add-listed-prod-min-qty');
    const stockInput = document.getElementById('add-listed-prod-stock');

    if (select) {
      select.value = prod.id;
      this.onAddListedProdSelectChange();
    }
    if (typeSelect) typeSelect.value = prod.shelfType || prod.type || '现货';
    this.toggleListedProductType();

    if (priceInput && prod.priceStr) {
      const numMatch = prod.priceStr.match(/[\d,.]+/);
      if (numMatch) priceInput.value = numMatch[0].replace(/,/g, '');
    }
    if (unitInput && prod.priceStr) {
      const unitStr = prod.priceStr.replace(/^[¥￥]\s*[\d,.]+\s*\/?\s*/, '').trim();
      unitInput.value = unitStr || '吨';
    }
    if (minQtyInput) {
      const minNum = parseInt(String(prod.minQty || '1').replace(/[^0-9]/g, '')) || 1;
      minQtyInput.value = minNum;
    }
    if (stockInput) stockInput.value = prod.stock || 500;

    window._editingListedProdId = prodId;
    UI.showModal('modal-add-listed-product');
  },

  submitListedProductForAudit(prodId) {
    const prod = MockData.products.find(x => x.id == prodId);
    if (prod) {
      prod.status = 0; // 待审核
      delete prod.downReason;
      delete prod.rejectReason;
      UI.toast('提交审核成功，请等待管理员审核', 'success');
      this.renderListedProducts();
      this.renderAllProducts();
    }
  },

  // 4. 订单履约
  renderOrders() {
    const tbody = document.querySelector('#table-orders tbody');
    let html = '';
    let myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId);
    
    // Apply filters
    const idEl = document.getElementById('filter-order-id');
    const typeEl = document.getElementById('filter-order-type');
    const buyerEl = document.getElementById('filter-order-buyer');
    const statusEl = document.getElementById('filter-order-status');
    const startEl = document.getElementById('filter-order-start');
    const endEl = document.getElementById('filter-order-end');

    if (idEl && idEl.value.trim() !== '') {
      const oid = idEl.value.trim().toLowerCase();
      myOrders = myOrders.filter(o => o.id.toLowerCase() === oid);
    }
    if (typeEl && typeEl.value !== '') {
      myOrders = myOrders.filter(o => (o.type || '现货交易订单') === typeEl.value);
    }
    if (buyerEl && buyerEl.value.trim() !== '') {
      const buyerKw = buyerEl.value.trim().toLowerCase();
      myOrders = myOrders.filter(o => o.buyerName.toLowerCase().includes(buyerKw));
    }
    if (statusEl && statusEl.value !== '') {
      myOrders = myOrders.filter(o => {
        let statusText = '';
        if (o.status === 0) statusText = '待买家签约';
        else if (o.status === 5) statusText = '待卖家签约';
        else if (o.status === 4) statusText = '待付款';
        else if (o.status === 1) statusText = '待发货';
        else if (o.status === 2) statusText = '待签收';
        else if (o.status === 3) statusText = '已完成';
        else if (o.status === -1) statusText = '已取消';
        else if (o.status === -2) statusText = '已关闭';
        
        if (statusEl.value === '待签约') return o.status === 0 || o.status === 5;
        return statusText === statusEl.value;
      });
    }
    const dateRangeEl = document.getElementById('filter-order-date-range');
    if (dateRangeEl && dateRangeEl.value.trim() !== '') {
      const parts = dateRangeEl.value.trim().split('~').map(s => s.trim());
      const startMs = parts[0] ? new Date(parts[0] + ' 00:00:00').getTime() : 0;
      const endMs = parts[1] ? new Date(parts[1] + ' 23:59:59').getTime() : (parts[0] ? new Date(parts[0] + ' 23:59:59').getTime() : Infinity);
      myOrders = myOrders.filter(o => {
        const oMs = new Date(o.time || '2026-07-20 09:00:00').getTime();
        return oMs >= startMs && oMs <= endMs;
      });
    }

    const invAppliedEl = document.getElementById('filter-order-invoice-applied');
    if (invAppliedEl && invAppliedEl.value !== '') {
      myOrders = myOrders.filter(o => {
        const hasInvApp = o.invoiceApplied || (MockData.invoices || []).some(i => i.orderId === o.id || (i.buyerName === o.buyerName && i.amount === o.amount));
        return invAppliedEl.value === '是' ? hasInvApp : !hasInvApp;
      });
    }

    // Default Sort: newest first
    myOrders.sort((a, b) => {
      const tA = new Date(a.time || '2026-07-20 09:00:00').getTime();
      const tB = new Date(b.time || '2026-07-20 09:00:00').getTime();
      return tB - tA;
    });

    myOrders.forEach((o, idx) => {
      let statusTag = '';
      let actBtn = '';
      
      if(o.status === 0) {
        statusTag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border:1px solid #ffd591;">待买家签约</span>`;
        actBtn = `<div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${this.currentShopId}', () => MerchantApp.renderOrders())">取消</button>
                  </div>`;
      } else if(o.status === 5) {
        statusTag = `<span class="tag tag-warning" style="background:#fcf0f7; color:#c41d7f; border:1px solid #ffadd2;">待卖家签约</span>`;
        actBtn = `<div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn btn-primary btn-sm" onclick="UI.showContractSigningModal('${o.id}', true, () => MerchantApp.renderOrders())">立即签约</button>
                    <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${this.currentShopId}', () => MerchantApp.renderOrders())">取消</button>
                  </div>`;
      } else if(o.status === 4) {
        statusTag = `<span class="tag tag-secondary" style="background:#fffbe6; color:#d46b08; border:1px solid #ffe58f;">待付款</span>`;
        actBtn = `<div style="display:flex; gap:6px; align-items:center;">
                    <button class="btn btn-text btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${this.currentShopId}', () => MerchantApp.renderOrders())">取消</button>
                  </div>`;
      } else if(o.status === 1) {
        statusTag = `<span class="tag tag-primary">待发货</span>`;
        actBtn = `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openShipModal('${o.id}')">去发货</button>`;
      } else if(o.status === 2) {
        statusTag = `<span class="tag tag-info" style="color: #0958d9; background: #e6f4ff; border:1px solid #91caff;">待签收</span>`;
        actBtn = '';
      } else if(o.status === 3) {
        statusTag = `<span class="tag tag-success">已完成</span>`;
        const invRec = (MockData.invoices || []).find(i => i.orderId === o.id || (i.buyerName === o.buyerName && i.amount === o.amount));
        if (invRec && invRec.status === '已开具') {
          actBtn = `<button class="btn btn-sm" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-weight:bold;" onclick="MerchantApp.openInvoiceUploadModal('${o.id}')">✅ 已开发票 (查看)</button>`;
        } else if (o.invoiceApplied || invRec) {
          actBtn = `<button class="btn btn-sm" style="background:#fff7e6; color:#d46b08; border:1px solid #ffe58f; font-weight:bold; animation:pulse 2s infinite;" onclick="MerchantApp.openInvoiceUploadModal('${o.id}')">🔔 待开票 (买家已申请)</button>`;
        } else {
          actBtn = `<button class="btn btn-outline btn-sm text-secondary" style="border-color:#cbd5e1; color:#64748b;" onclick="MerchantApp.openInvoiceUploadModal('${o.id}')">📄 上传发票 (未申请)</button>`;
        }
      } else if(o.status === -1) {
        statusTag = `<span class="tag tag-danger" style="background:#fff1f0; color:#ef4444; border:1px solid #ffa39e;">已取消</span>`;
        actBtn = '';
      } else if(o.status === -2) {
        statusTag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#64748b; border:1px solid #d9d9d9;">已关闭</span>`;
        actBtn = '';
      }

      // Generate desensitized buyer phone number
      const user = MockData.users.find(u => u.name === o.buyerName) || MockData.users.find(u => u.name && o.buyerName.includes(u.name.split(' ')[0]));
      let buyerPhone = '--';
      if (user && user.mobile) {
        buyerPhone = user.mobile.slice(0, 3) + '****' + user.mobile.slice(7);
      } else {
        let hash = 0;
        for (let i = 0; i < o.buyerName.length; i++) {
          hash = o.buyerName.charCodeAt(i) + ((hash << 5) - hash);
        }
        const middle = String(Math.abs(hash) % 9000 + 1000);
        buyerPhone = `138****${middle}`;
      }

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td><a href="javascript:void(0)" onclick="MerchantApp.showOrderDetailPage('${o.id}')" style="font-weight:bold; color:var(--primary-color); font-family:monospace;">${o.id}</a></td>
          <td><span class="tag tag-info" style="font-size:11px; background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd;">${o.type || '现货交易订单'}</span></td>
          <td style="font-weight:bold; color:#334155;">${o.buyerName}</td>
          <td class="font-mono text-secondary">${buyerPhone}</td>
          <td class="font-bold text-danger">${o.amount}</td>
          <td>${statusTag}</td>
          <td class="text-xs text-secondary font-mono">${formatTimeSec(o.time)}</td>
          <td>
            <div style="display:flex; align-items:center; gap:8px;">
              ${actBtn}
              <button class="btn btn-text btn-sm" onclick="MerchantApp.showOrderDetailPage('${o.id}')">详情</button>
            </div>
          </td>
        </tr>
      `;
    });
    if(tbody) {
      tbody.innerHTML = html || '<tr><td colspan="9" class="text-center p-4 text-secondary">没有找到符合条件的订单数据</td></tr>';
      this._appendPagination(tbody, myOrders.length);
    }
  },

  openShipModal(orderId) {
    window._shippingOrderId = orderId;
    document.getElementById('ship-order-id').innerText = orderId;
    document.getElementById('ship-tracking-no').value = '';
    UI.showModal('modal-ship');
  },

  submitShip() {
    const orderId = window._shippingOrderId;
    const carrier = document.getElementById('ship-logistics-company').value;
    const trackingNo = document.getElementById('ship-tracking-no').value.trim();
    if (!trackingNo) {
      UI.toast('请填写物流单号！', 'warning');
      return;
    }
    const o = MockData.orders.find(item => item.id === orderId);
    if (o) {
      o.status = 2; // 已发货
      o.logisticsCarrier = carrier;
      o.logisticsNo = trackingNo;
      UI.closeModal('modal-ship');
      UI.toast('发货成功！订单状态已更新', 'success');
      MerchantApp.renderOrders();
      if (document.getElementById('merchant-order-detail-section').style.display === 'block') {
        MerchantApp.showOrderDetailPage(orderId);
      }
    }
  },

  renderBiddingRes() {
    const tbody = document.querySelector('#table-merchant-res tbody');
    if (tbody) {
      let html = '';
      let myRes = MockData.biddingResources.filter(r => r.shopId === 'S001' || r.shopName === '远大钢铁官方直营店');
      
      // Apply filters
      const idEl = document.getElementById('filter-res-id');
      const nameEl = document.getElementById('filter-res-name');
      const statusEl = document.getElementById('filter-res-status');
      
      if (idEl && idEl.value.trim() !== '') {
        const idVal = idEl.value.trim().toLowerCase();
        myRes = myRes.filter(r => r.id.toLowerCase() === idVal);
      }
      if (nameEl && nameEl.value.trim() !== '') {
        const nameVal = nameEl.value.trim().toLowerCase();
        myRes = myRes.filter(r => r.name.toLowerCase().includes(nameVal));
      }
      if (statusEl && statusEl.value !== '') {
        myRes = myRes.filter(r => r.status === statusEl.value);
      }

      myRes.forEach((r, idx) => {
        let tag = '';
        if (r.status === '草稿') {
          tag = `<span class="tag tag-secondary" style="background:#f1f5f9; color:#475569; border-color:#cbd5e1;">草稿</span>`;
        } else if (r.status === '待审核') {
          tag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border-color:#ffd591;">待审核</span>`;
        } else if (r.status === '已通过') {
          tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">已通过</span>`;
        } else {
          tag = `<span class="tag tag-danger" style="background:#fff2f0; color:#ff4d4f; border-color:#ffccc7;">未通过</span><div style="font-size:11px; color:#ef4444; margin-top:4px;">拒审原因：${r.rejectReason || '规格材料不全'}</div>`;
        }
        
        let acts = '';
        if (r.status === '草稿') {
          // 草稿：提交审核、编辑、删除 (只有草稿才有删除按钮)
          acts += `<button class="btn btn-primary btn-sm" onclick="MerchantApp.submitAuditRes('${r.id}')">提交审核</button>`;
          acts += `<button class="btn btn-warning btn-sm" style="margin-left:4px;" onclick="MerchantApp.openEditResModal('${r.id}')">编辑</button>`;
          acts += `<button class="btn btn-outline btn-sm text-danger" style="margin-left:4px;" onclick="MerchantApp.deleteBiddingRes('${r.id}')">删除</button>`;
        } else if (r.status === '待审核') {
          // 待审核状态：没有任何按钮
          acts = `<span style="color:#94a3b8; font-size:12px;">--</span>`;
        } else if (r.status === '已通过') {
          // 已通过：只有编辑按钮
          acts += `<button class="btn btn-warning btn-sm" onclick="MerchantApp.openEditResModal('${r.id}')">编辑</button>`;
        } else {
          // 未通过：提交审核、编辑 (无删除按钮)
          acts += `<button class="btn btn-primary btn-sm" onclick="MerchantApp.submitAuditRes('${r.id}')">提交审核</button>`;
          acts += `<button class="btn btn-warning btn-sm" style="margin-left:4px;" onclick="MerchantApp.openEditResModal('${r.id}')">编辑</button>`;
        }

        const specsStr = r.specs || 'HRB400E 规格 25mm，总量约 300 吨';
        const createTime = r.createdAt || '2026-07-01 09:00:00';

        html += `
          <tr>
            <td>${idx + 1}</td>
            <td style="font-family:monospace; font-weight:bold; font-size:12px;">${r.id}</td>
            <td><div class="font-bold" style="color:#0f172a;">${r.name}</div></td>
            <td><img src="${r.image}" style="width:50px; height:40px; border-radius:4px; object-fit:cover; cursor:pointer;" onclick="UI.previewDocument('资源主图', '${r.image}')"></td>
            <td style="font-size:12px; color:#475569;">${specsStr}</td>
            <td>${tag}</td>
            <td>${formatTimeSec(createTime)}</td>
            <td><div class="flex gap-2">${acts}</div></td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="8" class="text-center p-4 text-secondary">没有找到符合条件的竞价资源</td></tr>';
      this._appendPagination(tbody, myRes.length);
    }
  },

  resetBiddingAnnFilter() {
    const elId = document.getElementById('filter-ann-id');
    const elTitle = document.getElementById('filter-ann-title');
    const elResId = document.getElementById('filter-ann-resid');
    const elStatus = document.getElementById('filter-ann-status');
    if (elId) elId.value = '';
    if (elTitle) elTitle.value = '';
    if (elResId) elResId.value = '';
    if (elStatus) elStatus.value = '';
    this.renderBiddingAnn();
  },

  renderBiddingAnn() {
    const tbody = document.querySelector('#table-merchant-ann tbody');
    if (tbody) {
      let html = '';
      let myAnn = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001' || a.shopName === '远大钢铁官方直营店');
      
      const getAnnStatusName = (a) => {
        const aStatus = a.auditStatus || '已通过';
        if (aStatus === '草稿') return '草稿';
        if (aStatus === '待审核') return '待审核';
        if (aStatus === '已拒绝' || aStatus === '已撤回' || aStatus === '已下架') return '已下架';
        if (a.status === 4) return '已结束';
        if (a.status === 3) return '等待公布';
        return '竞价中';
      };

      // Apply filters:
      // 1. 公告编号 (精确全匹配)
      // 2. 公告标题 (模糊搜索)
      // 3. 关联资源编号 (精确全匹配)
      const annIdEl = document.getElementById('filter-ann-id');
      const annTitleEl = document.getElementById('filter-ann-title');
      const resIdEl = document.getElementById('filter-ann-resid');
      const statusEl = document.getElementById('filter-ann-status');

      if (annIdEl && annIdEl.value.trim() !== '') {
        const idVal = annIdEl.value.trim().toLowerCase();
        myAnn = myAnn.filter(a => a.id.toLowerCase() === idVal);
      }
      if (annTitleEl && annTitleEl.value.trim() !== '') {
        const titleVal = annTitleEl.value.trim().toLowerCase();
        myAnn = myAnn.filter(a => a.title.toLowerCase().includes(titleVal));
      }
      if (resIdEl && resIdEl.value.trim() !== '') {
        const resIdVal = resIdEl.value.trim().toLowerCase();
        myAnn = myAnn.filter(a => (a.resId || '').toLowerCase() === resIdVal);
      }
      if (statusEl && statusEl.value !== '') {
        myAnn = myAnn.filter(a => getAnnStatusName(a) === statusEl.value);
      }

      myAnn.forEach((a, idx) => {
        const aStatus = a.auditStatus || '已通过';
        let tag = '';
        if (aStatus === '草稿') {
          tag = `<span class="tag tag-secondary" style="background:#f1f5f9; color:#475569; border-color:#cbd5e1;">草稿</span>`;
        } else if (aStatus === '待审核') {
          tag = `<span class="tag tag-warning" style="background:#fff7e6; color:#fa8c16; border-color:#ffd591;">待审核</span>`;
        } else if (aStatus === '已拒绝' || aStatus === '已撤回' || aStatus === '已下架') {
          const reasonText = a.rejectReason ? `拒审原因：${a.rejectReason}` : '(主动下架)';
          tag = `<span class="tag tag-secondary">已下架</span><div style="font-size:11px; color:#ef4444; margin-top:4px; line-height:1.2;">${reasonText}</div>`;
        } else if (a.status === 3) {
          tag = `<span class="tag tag-success" style="background:#fff0f6; color:#eb2f96; border-color:#ffadd2;">等待公布</span>`;
        } else if (a.status === 4) {
          tag = `<span class="tag tag-secondary">已结束</span>`;
        } else {
          tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">竞价中</span>`;
        }
        
        let acts = '';
        if (aStatus === '草稿') {
          // 草稿：无法查看出价定标，只有编辑、提交审核、删除按钮 (唯一拥有删除按钮的状态)
          acts += `<button class="btn btn-primary btn-sm" onclick="MerchantApp.resubmitBiddingAnn('${a.id}')">提交审核</button>`;
          acts += `<button class="btn btn-warning btn-sm" style="margin-left:4px;" onclick="MerchantApp.openEditAnnModal('${a.id}')">编辑</button>`;
          acts += `<button class="btn btn-outline btn-sm text-danger" style="margin-left:4px;" onclick="MerchantApp.deleteBiddingAnn('${a.id}')">删除</button>`;
        } else if (aStatus === '待审核') {
          // 待审核：没有操作
          acts = `<span style="color:#94a3b8; font-size:12px;">--</span>`;
        } else if (aStatus === '已拒绝' || aStatus === '已撤回' || aStatus === '已下架') {
          // 已下架：可以有编辑，提交审核的操作 (无删除按钮)
          acts += `<button class="btn btn-warning btn-sm" onclick="MerchantApp.openEditAnnModal('${a.id}')">编辑</button>`;
          acts += `<button class="btn btn-primary btn-sm" style="margin-left:4px;" onclick="MerchantApp.resubmitBiddingAnn('${a.id}')">提交审核</button>`;
        } else if (aStatus === '已通过') {
          if (a.status !== 4) {
            acts += `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openAwardModal('${a.id}', false)">查看出价/定标</button>`;
            acts += `<button class="btn btn-outline btn-sm text-danger" style="margin-left:4px;" onclick="MerchantApp.withdrawBiddingAnn('${a.id}')">下架</button>`;
          } else {
            // 已结束：查看出价 (不用定标)
            acts += `<button class="btn btn-outline btn-sm text-primary" onclick="MerchantApp.openAwardModal('${a.id}', true)">查看出价</button>`;
          }
        }

        let curMax = (a.currentMaxOffer && a.currentMaxOffer !== '-') ? a.currentMaxOffer : (a.startPrice || '--');
        let createTime = a.createdAt || '2026-07-01 09:00:00';

        html += `
          <tr>
            <td>${idx + 1}</td>
            <td>${a.id}</td>
            <td><div class="font-bold">${a.title}</div></td>
            <td>${a.resId}</td>
            <td class="text-slate-700 font-bold">${a.startPrice}</td>
            <td class="text-danger font-bold">${curMax}</td>
            <td>${tag}</td>
            <td class="text-secondary" style="font-size:12px;">${createTime}</td>
            <td><div class="flex gap-2">${acts}</div></td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="9" class="text-center p-4 text-secondary">没有找到符合条件的竞价公告</td></tr>';
      this._appendPagination(tbody, myAnn.length);
    }
  },

  resubmitBiddingAnn(annId) {
    const a = MockData.biddingAnnouncements.find(x => x.id === annId);
    if (a) {
      a.auditStatus = '待审核';
      UI.toast(`公告 ${annId} 已重新提交平台审核！`, 'success');
      this.renderBiddingAnn();
    }
  },

  openAwardModal(bidId, isViewOnly = false) {
    const ann = MockData.biddingAnnouncements.find(a => a.id === bidId);
    if (!ann) return;
    
    document.getElementById('award-bid-title').innerText = `${ann.title} (${bidId})`;
    
    const offers = MockData.biddingOffers.filter(o => o.bidId === bidId);
    const tbody = document.querySelector('#table-bid-offers tbody');
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
        let btn = '';
        
        if (ann.status === 4 || isViewOnly) { // 已结束或纯查看出价
          if (o.status === 1 || ann.winner === o.buyerName) {
            tag = `<span class="tag tag-success" style="background:#f6ffed; color:#52c41a; border-color:#b7eb8f;">已中标</span>`;
            btn = `<span class="text-secondary text-sm">已生成履约订单</span>`;
          } else {
            tag = `<span class="tag tag-secondary" style="background:#f5f5f5; color:#595959; border-color:#d9d9d9;">未中标</span>`;
            btn = `-`;
          }
        } else { // 竞价中/等待公布
          tag = `<span class="tag tag-primary" style="background:#e0f2fe; color:#0369a1; border:1px solid #7dd3fc;">出价中</span>`;
          btn = `<button class="btn btn-success btn-sm" style="background:#52c41a;color:#fff;border:none;border-radius:4px;padding:4px 8px;cursor:pointer;" onclick="MerchantApp.selectWinner('${o.id}')">选为中标</button>`;
        }

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
          phone = `138****${middle}`;
        }
        
        html += `
          <tr>
            <td>${idx + 1}</td>
            <td style="font-weight:bold;">${o.buyerName}</td>
            <td style="font-family:monospace; color:#475569;">${phone}</td>
            <td>${o.time}</td>
            <td class="font-bold text-danger text-lg">${o.offerPrice}</td>
            <td>${tag}</td>
            <td>${btn}</td>
          </tr>
        `;
      });
    }
    
    tbody.innerHTML = html;
    UI.showModal('modal-bid-award');
  },
  
  selectWinner(offerId) {
    const offer = MockData.biddingOffers.find(o => o.id === offerId);
    if (!offer) return;
    const ann = MockData.biddingAnnouncements.find(a => a.id === offer.bidId);
    if (!ann) return;

    if (confirm(`确认选择 ${offer.buyerName}（出价：${offer.offerPrice}）作为最终中标方？系统将自动结束本场竞价，并为买家生成待签约履约订单。`)) {
      // Update offer statuses
      const offers = MockData.biddingOffers.filter(o => o.bidId === ann.id);
      offers.forEach(o => {
        o.status = (o.id === offerId) ? 1 : 0;
      });

      // Update announcement status
      ann.status = 4; // 已结束
      ann.winner = offer.buyerName;
      ann.currentMaxOffer = offer.offerPrice;

      // Generate transaction order
      const orderId = 'ORD' + Math.floor(100000 + Math.random() * 900000);
      const newOrder = {
        id: orderId,
        productId: ann.resId,
        productName: ann.title,
        specs: '大宗交易竞拍标的资产包',
        price: offer.offerPrice,
        quantity: 1,
        amount: offer.offerPrice,
        shopId: ann.shopId || 'S001',
        shopName: ann.shopName,
        buyerName: offer.buyerName,
        status: 0, // 待买家签约
        time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: '竞价交易',
        paymentVoucher: null,
        contractFile: null
      };
      MockData.orders.unshift(newOrder);

      UI.closeModal('modal-bid-award');
      UI.toast(`定标成功！已为买家 ${offer.buyerName} 自动生成待签约订单：${orderId}`, 'success');
      
      this.renderBidding();
      this.renderMerchantDashboard();
    }
  },

  editingAnnId: null,

  
  openAddResModal() {
    this.editingResId = null;
    const titleEl = document.getElementById('modal-res-title');
    if (titleEl) titleEl.innerText = '新增竞价物资资源';
    
    document.getElementById('add-res-name').value = '';
    document.getElementById('add-res-specs').value = '';
    document.getElementById('add-res-img-preview').src = 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80';
    
    const draftBtn = document.getElementById('btn-save-res-draft');
    if (draftBtn) draftBtn.style.display = 'none';
    const auditBtn = document.getElementById('btn-submit-res-audit');
    if (auditBtn) auditBtn.innerText = '提交审核';

    UI.showModal('modal-add-res');
  },

  openEditResModal(resId) {
    const r = MockData.biddingResources.find(x => x.id === resId);
    if (!r) return;

    this.editingResId = resId;
    const titleEl = document.getElementById('modal-res-title');
    if (titleEl) titleEl.innerText = `编辑竞价资源 (${resId})`;

    document.getElementById('add-res-name').value = r.name || '';
    document.getElementById('add-res-specs').value = r.specs || '';
    document.getElementById('add-res-img-preview').src = r.image || 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80';

    const draftBtn = document.getElementById('btn-save-res-draft');
    if (draftBtn) {
      draftBtn.style.display = (r.status === '已通过') ? 'inline-block' : 'none';
    }
    const auditBtn = document.getElementById('btn-submit-res-audit');
    if (auditBtn) auditBtn.innerText = (r.status === '已通过') ? '修改并重新提交审核' : '提交审核';

    UI.showModal('modal-add-res');
  },

  handleResImageUpload(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        document.getElementById('add-res-img-preview').src = e.target.result;
        UI.toast('资源货品图片更换成功！', 'success');
      };
      reader.readAsDataURL(input.files[0]);
    }
  },

  submitBiddingResource(submitAudit = false) {
    this.saveBiddingRes(submitAudit);
  },

  saveBiddingRes(submitAudit = false) {
    const name = document.getElementById('add-res-name').value.trim();
    const specs = document.getElementById('add-res-specs').value.trim();
    const image = document.getElementById('add-res-img-preview').src;

    if (!name || !specs) {
      UI.toast('请填写资源货品名称和规格描述！', 'error');
      return;
    }

    if (this.editingResId) {
      const r = MockData.biddingResources.find(x => x.id === this.editingResId);
      if (r) {
        r.name = name;
        r.specs = specs;
        r.image = image;
        r.status = '待审核'; // 编辑后保存即为待审核状态
        UI.toast(`资源 ${this.editingResId} 修改成功，已进入待审核状态！`, 'success');
      }
      this.editingResId = null;
    } else {
      const newRes = {
        id: 'RES2607' + String(Math.floor(10000 + Math.random() * 90000)),
        shopId: 'S001',
        shopName: '远大钢铁官方直营店',
        companyName: '远大钢铁集团有限公司',
        name: name,
        specs: specs,
        image: image,
        status: submitAudit ? '待审核' : '草稿',
        createdAt: '2026-07-23 09:00:00',
        updatedAt: '2026-07-23 09:00:00'
      };
      MockData.biddingResources.unshift(newRes);
      UI.toast(`竞价资源创建成功（状态: ${newRes.status}）！编号: ${newRes.id}`, 'success');
    }

    UI.closeModal('modal-add-res');
    this.renderBiddingRes();
  },

  deleteBiddingRes(resId) {
    if (confirm(`确认要删除竞价资源 ${resId} 吗？`)) {
      const idx = MockData.biddingResources.findIndex(x => x.id === resId);
      if (idx !== -1) {
        MockData.biddingResources.splice(idx, 1);
        UI.toast('资源已成功删除！', 'success');
        this.renderBiddingRes();
      }
    }
  },

  submitAuditRes(resId) {
    const r = MockData.biddingResources.find(x => x.id === resId);
    if (r) {
      r.status = '待审核';
      UI.toast(`资源 ${resId} 已成功重新提交平台审核！`, 'success');
      this.renderBiddingRes();
    }
  },

  simulateUploadResImg() {
    const sampleImgs = [
      'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=400&q=80'
    ];
    const picked = sampleImgs[Math.floor(Math.random() * sampleImgs.length)];
    document.getElementById('add-res-img-preview').src = picked;
    UI.toast('主图更换/上传成功！(单图限制)', 'success');
  },

  openAddAnnModal() {
    this.editingAnnId = null;
    const titleEl = document.getElementById('add-ann-modal-title');
    if (titleEl) titleEl.innerText = '关联资源发布竞价公告';

    const selectEl = document.getElementById('add-ann-resource-select');
    if (!selectEl) return;

    // Filter approved resources
    const myApproved = MockData.biddingResources.filter(r => r.status === '已通过');
    if (myApproved.length === 0) {
      UI.toast('暂无可发布的已审核通过竞价资源，请先新增资源并等待平台审核。', 'warning');
      return;
    }

    selectEl.innerHTML = myApproved.map(r => `<option value="${r.id}">📷 编号: ${r.id} | 货品: ${r.name} (${r.specs || '规格标准'})</option>`).join('');
    
    // Prefill title
    this.onAnnResourceChanged(selectEl);

    // Set default dates
    const now = new Date();
    
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Format to yyyy-MM-ddThh:mm
    const formatDate = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    document.getElementById('add-ann-bid-end').value = formatDate(sevenDaysLater);
    document.getElementById('add-ann-start-price').value = '';

    UI.showModal('modal-add-ann');
  },

  openEditAnnModal(annId) {
    const a = MockData.biddingAnnouncements.find(x => x.id === annId);
    if (!a) return;

    this.editingAnnId = annId;
    const titleEl = document.getElementById('add-ann-modal-title');
    if (titleEl) titleEl.innerText = `编辑竞价公告 (${annId})`;

    // Filter approved resources
    const myApproved = MockData.biddingResources.filter(r => r.status === '已通过');
    const selectEl = document.getElementById('add-ann-resource-select');
    if (selectEl) {
      selectEl.innerHTML = myApproved.map(r => `<option value="${r.id}">📷 编号: ${r.id} | 货品: ${r.name} (${r.specs || '规格标准'})</option>`).join('');
      selectEl.value = a.resId;
    }

    // When editing, remove the prefix tag if exists
    let title = a.title || '';
    title = title.replace(/^【看货报名阶段】|^【现场看货阶段】|^【竞价出价阶段】|^【等待公布阶段】|^【已结束】|^【待审核测试】|^【已拒绝测试】|^【已撤回测试】/, '');
    document.getElementById('add-ann-title').value = title;
    document.getElementById('add-ann-start-price').value = parseFloat((a.startPrice || '').replace(/[^\d\.]/g, '')) || 0;

    const formatDateForInput = (str) => {
      if (!str) return '';
      return str.replace(' ', 'T');
    };

    document.getElementById('add-ann-bid-end').value = formatDateForInput(a.bidEndTime || '');

    UI.showModal('modal-add-ann');
  },

  deleteBiddingAnn(annId) {
    if (confirm(`确认要删除竞价公告 ${annId} 吗？`)) {
      const idx = MockData.biddingAnnouncements.findIndex(x => x.id === annId);
      if (idx !== -1) {
        MockData.biddingAnnouncements.splice(idx, 1);
        UI.toast('公告已成功删除', 'success');
        this.renderBiddingAnn();
      }
    }
  },

  withdrawBiddingAnn(annId) {
    if (confirm(`确认要下架竞价公告 ${annId} 吗？`)) {
      const a = MockData.biddingAnnouncements.find(x => x.id === annId);
      if (a) {
        a.auditStatus = '已下架';
        a.rejectReason = '';
        UI.toast(`竞价公告 ${annId} 已成功下架！`, 'success');
        this.renderBiddingAnn();
      }
    }
  },

  onAnnResourceChanged(selectEl) {
    const resId = selectEl.value;
    const res = MockData.biddingResources.find(r => r.id === resId);
    const titleEl = document.getElementById('add-ann-title');
    const imgPreview = document.getElementById('add-ann-res-img-preview');
    if (res) {
      if (titleEl && !this.editingAnnId) titleEl.value = res.name;
      if (imgPreview) {
        imgPreview.src = res.image;
        imgPreview.style.display = 'block';
      }
    } else {
      if (imgPreview) imgPreview.style.display = 'none';
    }
  },

  submitBiddingAnnouncement(submitAudit = true) {
    const resId = document.getElementById('add-ann-resource-select').value;
    const title = document.getElementById('add-ann-title').value.trim();
    const priceVal = parseFloat(document.getElementById('add-ann-start-price').value);
    const bidEnd = document.getElementById('add-ann-bid-end').value;

    if (!resId || !title || isNaN(priceVal) || priceVal <= 0 || !bidEnd) {
      UI.toast('请填写完整且合法的竞价公告信息！', 'error');
      return;
    }

    const res = MockData.biddingResources.find(r => r.id === resId);
    const priceStr = '¥' + priceVal.toLocaleString('zh-CN', {minimumFractionDigits: 2});
    const targetAuditStatus = submitAudit ? '待审核' : '草稿';

    if (this.editingAnnId) {
      // Edit mode
      const a = MockData.biddingAnnouncements.find(x => x.id === this.editingAnnId);
      if (a) {
        a.resId = resId;
        a.image = res ? res.image : a.image;
        a.title = title;
        a.startPrice = priceStr;
        a.bidEndTime = bidEnd.replace('T', ' ');
        a.status = 0;
        a.auditStatus = targetAuditStatus;
        UI.toast(`竞价公告 ${this.editingAnnId} 保存成功（状态：${targetAuditStatus}）！`, 'success');
      }
      this.editingAnnId = null;
    } else {
      // Create mode
      const newAnn = {
        id: 'BID2026' + String(Math.floor(1000 + Math.random() * 9000)),
        resId: resId,
        image: res ? res.image : 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=400&q=80',
        shopId: 'S001',
        shopName: '远大钢铁官方直营店',
        title: title,
        startPrice: priceStr,
        bidEndTime: bidEnd.replace('T', ' '),
        status: 0,
        currentMaxOffer: '-',
        winner: '-',
        auditStatus: targetAuditStatus
      };

      MockData.biddingAnnouncements.unshift(newAnn);
      UI.toast(`竞价公告操作成功（状态：${targetAuditStatus}）！公告编号: ${newAnn.id}`, 'success');
    }

    UI.closeModal('modal-add-ann');
    this.renderBiddingAnn();
  },

  renderMerchantDashboard() {
    // 1. Render transaction orders table (up to 4 records)
    const tbody = document.getElementById('merchant-db-order-tbody');
    if (tbody) {
      const myOrders = MockData.orders.filter(o => o.shopId === this.currentShopId).slice(0, 4);
      let html = '';
      myOrders.forEach((o, idx) => {
        let statusTag = '';
        if (o.status === 0) statusTag = `<span class="tag tag-warning">待买家签约</span>`;
        else if (o.status === 5) statusTag = `<span class="tag tag-warning">待卖家签约</span>`;
        else if (o.status === 4) statusTag = `<span class="tag tag-secondary">待付款</span>`;
        else if (o.status === 1) statusTag = `<span class="tag tag-primary">待发货</span>`;
        else if (o.status === 2) statusTag = `<span class="tag tag-info">已发货</span>`;
        else if (o.status === 3) statusTag = `<span class="tag tag-success">已完结</span>`;
        else statusTag = `<span class="tag tag-danger">已关闭</span>`;

        html += `
          <tr>
            <td class="p-2">${idx + 1}</td>
            <td class="p-2 font-bold"><a href="javascript:void(0)" onclick="MerchantApp.showOrderDetailPage('${o.id}')" style="color:var(--primary-color); font-family:monospace;">${o.id}</a></td>
            <td class="p-2"><span class="tag tag-info" style="font-size:11px; background:#f0f9ff; color:#0284c7; border:1px solid #bae6fd;">${o.type || '现货交易订单'}</span></td>
            <td class="p-2 text-secondary" style="font-weight:bold;">${o.buyerName}</td>
            <td class="p-2 text-danger font-bold">${o.amount}</td>
            <td class="p-2">${statusTag}</td>
            <td class="p-2 text-slate-500 font-mono">${formatTimeSec(o.time)}</td>
          </tr>
        `;
      });
      tbody.innerHTML = html || '<tr><td colspan="7" class="text-center p-4 text-secondary">暂无大宗交易数据</td></tr>';
    }

    // 2. Render bidding activity (up to 3 items)
    const bidList = document.getElementById('merchant-db-bid-list');
    if (bidList) {
      const myBids = MockData.biddingAnnouncements.filter(a => a.shopId === 'S001').slice(0, 3);
      let html = '';
      myBids.forEach(b => {
        let statusLabel = b.status === 1 ? `<span class="text-xs text-success">竞价中</span>` : `<span class="text-xs text-secondary">已结束</span>`;
        html += `
          <div style="padding: 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #f1f5f9;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 4px;">
              <span class="font-bold text-sm" style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">${b.title}</span>
              ${statusLabel}
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; font-size: 11px; color:#64748b;">
              <span>起拍价: <strong style="color:var(--danger-color);">${b.startPrice}</strong></span>
              <span>时间: ${b.bidEndTime.split(' ')[0]}</span>
            </div>
          </div>
        `;
      });
      bidList.innerHTML = html || '<div class="text-center p-4 text-secondary text-sm">暂无竞价活动</div>';
    }
  },

  populateAddListedProductModal() {
    const select = document.getElementById('add-listed-prod-id');
    if (!select) return;
    let myProducts = MockData.products.filter(p => p.shopId === this.currentShopId);
    select.innerHTML = myProducts.map((p, idx) => {
      const code = p.prodCode || ('GD' + String(p.id ? p.id.replace(/[^0-9]/g, '') : (idx + 1)).padStart(5, '0'));
      const cat = p.category || '未分类';
      return `<option value="${p.id}" data-img="${p.image || ''}">【${code}】${p.name} | 分类: ${cat}</option>`;
    }).join('');
    this.onAddListedProdSelectChange();
  },

  onAddListedProdSelectChange() {
    const select = document.getElementById('add-listed-prod-id');
    const imgEl = document.getElementById('add-listed-prod-img-preview');
    if (!select || !imgEl) return;
    const selectedOpt = select.options[select.selectedIndex];
    if (selectedOpt && selectedOpt.dataset.img) {
      imgEl.src = selectedOpt.dataset.img;
      imgEl.style.display = 'block';
    } else {
      imgEl.style.display = 'none';
    }
  },

  deleteProduct(prodId) {
    MockData.products = MockData.products.filter(p => p.id != prodId);
    UI.toast('已成功删除该商品', 'success');
    this.renderAllProducts();
    this.renderListedProducts();
  },

  toggleListedProductType() {
    const type = document.getElementById('add-listed-prod-type')?.value;
    const stockGroup = document.getElementById('add-listed-prod-stock-group');
    if (stockGroup) {
      stockGroup.style.display = type === '现货' ? 'block' : 'none';
    }
  },

  handleProductFileSelect(fileInput) {
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imgInput = document.getElementById('add-prod-image');
        const imgPrev = document.getElementById('add-prod-img-preview');
        if (imgInput) imgInput.value = e.target.result;
        if (imgPrev) imgPrev.src = e.target.result;
        UI.toast('本地商品图片解析成功', 'success');
      };
      reader.readAsDataURL(fileInput.files[0]);
    }
  },

  editProduct(prodId) {
    const prod = MockData.products.find(p => p.id == prodId);
    if (!prod) return;
    window._editingProdId = prodId;
    document.getElementById('add-prod-image').value = prod.image || '';
    const imgPrev = document.getElementById('add-prod-img-preview');
    if (imgPrev) imgPrev.src = prod.image || '';
    document.getElementById('add-prod-name').value = prod.name || '';
    
    // Set category cascader
    if (prod.category) {
      this.pickAddCascaderCat3(prod.category);
    } else {
      document.getElementById('add-prod-cat3-val').value = '';
      document.getElementById('add-prod-cat-cascader-text').innerText = '请选择商品品类 (三级单选)';
      document.getElementById('add-prod-cat-cascader-text').style.color = '#94a3b8';
    }
    
    UI.showModal('modal-add-product');
  },

  submitNewListedProduct(isDraft = false) {
    const prodId = document.getElementById('add-listed-prod-id').value;
    const type = document.getElementById('add-listed-prod-type').value;
    const priceNumStr = document.getElementById('add-listed-prod-price-num')?.value.trim();
    const unit = document.getElementById('add-listed-prod-unit')?.value || '/ 吨';
    const minQtyStr = document.getElementById('add-listed-prod-min-qty')?.value.trim() || '1';
    const stockVal = type === '现货' ? parseInt(document.getElementById('add-listed-prod-stock')?.value) : 0;
    
    if (!prodId || !priceNumStr) {
      UI.toast('请填写完整的售卖单价与关联货品', 'warning');
      return;
    }

    const priceNum = parseFloat(priceNumStr);
    if (isNaN(priceNum) || priceNum <= 0) {
      UI.toast('售卖单价必须为有效的正数', 'warning');
      return;
    }

    const minQtyNum = parseInt(minQtyStr.replace(/[^0-9]/g, '')) || 1;

    // Rule: Stock must be strictly greater than minQty when type is 现货
    if (type === '现货') {
      if (isNaN(stockVal) || stockVal <= 0) {
        UI.toast('现货模式下库存量必须大于 0', 'warning');
        return;
      }
      if (stockVal < minQtyNum) {
        UI.toast(`现货库存量 (${stockVal}) 必须大于等于起售数量 (${minQtyNum})`, 'warning');
        return;
      }
    }

    const baseProd = MockData.products.find(p => p.id == prodId);
    if (!baseProd) return;

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const targetStatus = isDraft ? '未上架' : 0; // 0 is 待审核

    const formattedUnit = unit.startsWith('/') ? unit : `/ ${unit}`;

    if (window._editingListedProdId) {
      const prod = MockData.products.find(p => p.id == window._editingListedProdId);
      if (prod) {
        prod.shelfType = type;
        prod.type = type;
        prod.priceStr = `¥${priceNum.toFixed(2)} ${formattedUnit}`;
        prod.minQty = minQtyStr;
        prod.stock = stockVal;
        if (!isDraft) {
          prod.status = 0; // 提交审核
          delete prod.downReason;
          delete prod.rejectReason;
        }
        prod.opTime = nowStr;
        UI.toast(isDraft ? '修改成功并已保存草稿' : '修改成功并已提交审核', 'success');
      }
      delete window._editingListedProdId;
    } else {
      const newProd = {
        ...baseProd,
        id: 'P' + Math.floor(Math.random() * 100000),
        listNo: 'LST' + new Date().getFullYear().toString().slice(-2) + String(new Date().getMonth() + 1).padStart(2, '0') + String(new Date().getDate()).padStart(2, '0') + Math.floor(1000 + Math.random() * 9000),
        shelfType: type,
        type: type,
        priceStr: `¥${priceNum.toFixed(2)} ${formattedUnit}`,
        minQty: minQtyStr,
        stock: stockVal,
        status: targetStatus,
        sales: 0,
        createTime: nowStr,
        listTime: nowStr,
        opTime: nowStr
      };

      MockData.products.unshift(newProd);
      UI.toast(isDraft ? '已保存为草稿 (未上架状态)' : '新商品已提交上架审核', 'success');
    }
    
    UI.closeModal('modal-add-listed-product');
    this.renderListedProducts();
    this.renderAllProducts();
  }
};

window.MerchantApp = MerchantApp;

document.addEventListener('DOMContentLoaded', () => {
  MerchantApp.init();
});

// 侧边栏子菜单切换逻辑
window.toggleSubmenu = function(el) {
  const menuItem = el.parentElement;
  const subMenu = menuItem.querySelector('.sub-menu');
  const arrow = el.querySelector('.arrow');
  
  if (subMenu.style.display === 'none') {
    subMenu.style.display = 'block';
    arrow.innerText = '▼';
  } else {
    subMenu.style.display = 'none';
    arrow.innerText = '▶';
  }
};

window.cycleMerchantShopStatus = () => {
  const shop = MockData.shops.find(s => s.id === MerchantApp.currentShopId);
  if (!shop) return;

  if (shop.status === '正常营业') {
    shop.status = '待审核';
    delete shop.rejectReason;
    delete shop.suspendReason;
  } else if (shop.status === '待审核') {
    shop.status = '闭店中';
    delete shop.rejectReason;
    delete shop.suspendReason;
  } else if (shop.status === '闭店中' && !shop.rejectReason && !shop.suspendReason) {
    shop.status = '闭店中';
    shop.rejectReason = '资质证照扫描件不够清晰，主体印章模糊，请重新拍照上传。';
    delete shop.suspendReason;
  } else if (shop.status === '闭店中' && shop.rejectReason) {
    shop.status = '闭店中';
    shop.suspendReason = '您的商铺违反了平台《大宗商品诚信交易规范》，被予以强行闭店处罚。';
    delete shop.rejectReason;
  } else {
    shop.status = '正常营业';
    delete shop.rejectReason;
    delete shop.suspendReason;
  }

  UI.toast(`[演示] 店铺状态已切换，当前主状态: ${shop.status}`, 'info');
  MerchantApp.renderShopInfo();
};


  window.openAddProductModal = () => {
    delete window._editingProdId;
    document.getElementById('add-prod-image').value = '';
    const imgPrev = document.getElementById('add-prod-img-preview');
    if (imgPrev) imgPrev.src = 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80';
    document.getElementById('add-prod-name').value = '';
    
    // Reset category cascader
    document.getElementById('add-prod-cat3-val').value = '';
    const textEl = document.getElementById('add-prod-cat-cascader-text');
    if (textEl) {
      textEl.innerText = '请选择商品品类 (三级单选)';
      textEl.style.color = '#94a3b8';
    }

    UI.showModal('modal-add-product');
  };

  window.submitNewProduct = () => {
    const img = document.getElementById('add-prod-image').value.trim();
    const name = document.getElementById('add-prod-name').value.trim();
    const cat = document.getElementById('add-prod-cat3-val').value;

    if (!img || !name) {
      UI.toast('请填写完整的商品信息', 'warning');
      return;
    }

    if (!cat) {
      UI.toast('请选择具体的三级商品品类', 'warning');
      return;
    }

    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    if (window._editingProdId) {
      const prod = MockData.products.find(p => p.id == window._editingProdId);
      if (prod) {
        prod.image = img;
        prod.name = name;
        prod.category = cat;
        prod.opTime = nowStr;
        UI.toast('商品信息更新成功', 'success');
      }
      delete window._editingProdId;
    } else {
      const newProd = {
        id: 'P' + Math.floor(Math.random() * 1000000),
        shopId: MerchantApp.currentShopId,
        image: img,
        name: name,
        category: cat,
        type: '现货',
        shelfType: '现货',
        status: '未上架',
        sales: 0,
        createTime: nowStr,
        opTime: nowStr
      };
      MockData.products.unshift(newProd);
      UI.toast('新商品发布成功（当前为未上架状态）', 'success');
    }

    UI.closeModal('modal-add-product');
    MerchantApp.renderAllProducts();
    MerchantApp.renderListedProducts();
  };

MerchantApp.showOrderDetailPage = function(orderId) {
  const listSec = document.getElementById('merchant-order-list-section');
  const detailSec = document.getElementById('merchant-order-detail-section');
  if (!listSec || !detailSec) return;

  const o = MockData.orders.find(item => item.id === orderId);
  if (!o) return;

  listSec.style.display = 'none';
  detailSec.style.display = 'block';

  document.getElementById('merchant-detail-order-id').innerText = o.id;

  // Render Status Banner
  const bannerMap = {
    0: { title: '订单待签约', desc: '等待买方签署大宗买卖交易合同及保证资金协议。' },
    5: { title: '订单待卖家签约', desc: '买方已电子签名，请您点击上方“立即签署”盖章确认。' },
    4: { title: '订单待付款', desc: '买卖双方已签署合同，等待买方托管支付货款。' },
    1: { title: '订单待发货', desc: '买方已托管支付，请您安排专车直达运送货品并录入快递单号发货。' },
    2: { title: '卖家已发货', desc: '您已完成发货，大宗专车正在配送中，等待买方确认收货。' },
    3: { title: '交易履约已完成', desc: '买方已核验货品并确认收货，结算货款已划拨至您的商户余额。' },
    '-1': { title: '订单已关闭', desc: o.closeReason || '交易关闭。' }
  };
  const bData = bannerMap[o.status] || { title: '订单处理中', desc: '请耐心等待处理...' };
  document.getElementById('merchant-detail-status-title').innerText = bData.title;
  document.getElementById('merchant-detail-status-desc').innerText = bData.desc;

  const typeTag = document.getElementById('merchant-detail-type-tag');
  typeTag.innerText = o.type;
  typeTag.className = 'tag ' + (o.type.includes('现货') ? 'tag-primary' : o.type.includes('预售') ? 'tag-warning' : 'tag-info');

  document.getElementById('merchant-detail-create-time').innerText = o.time || '2026-07-07 10:15:00';
  document.getElementById('merchant-detail-pay-method').innerText = o.payMethod || '线上担保支付 (托管账户)';

  // Action buttons
  const actContainer = document.getElementById('merchant-detail-top-actions');
  let actHtml = '';
  if (o.status === 0) {
    actHtml = `<button class="btn btn-outline btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${MerchantApp.currentShopId}', () => { MerchantApp.showOrderDetailPage('${o.id}'); MerchantApp.renderOrders(); })">取消订单</button>`;
  } else if (o.status === 5) {
    actHtml = `
      <button class="btn btn-primary btn-sm" onclick="UI.showContractSigningModal('${o.id}', true, () => { MerchantApp.showOrderDetailPage('${o.id}'); MerchantApp.renderOrders(); })">立即签署</button>
      <button class="btn btn-outline btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${MerchantApp.currentShopId}', () => { MerchantApp.showOrderDetailPage('${o.id}'); MerchantApp.renderOrders(); })">取消订单</button>
    `;
  } else if (o.status === 4) {
    actHtml = `<button class="btn btn-outline btn-sm text-danger" onclick="UI.cancelOrder('${o.id}', '卖家', '${MerchantApp.currentShopId}', () => { MerchantApp.showOrderDetailPage('${o.id}'); MerchantApp.renderOrders(); })">取消订单</button>`;
  } else if (o.status === 1) {
    actHtml = `<button class="btn btn-primary btn-sm" onclick="MerchantApp.openShipDetailPage('${o.id}')">立即发货</button>`;
  } else if (o.status === 3) {
    const invRec = (MockData.invoices || []).find(i => i.orderId === o.id || (i.buyerName === o.buyerName && i.amount === o.amount));
    if (invRec && invRec.status === '已开具') {
      actHtml = `<button class="btn btn-sm" style="background:#f0fdf4; color:#166534; border:1px solid #bbf7d0; font-weight:bold;" onclick="MerchantApp.openInvoiceUploadModal('${o.id}')">✅ 已开发票 (管理)</button>`;
    } else if (o.invoiceApplied || invRec) {
      actHtml = `<button class="btn btn-sm" style="background:#fff7e6; color:#d46b08; border:1px solid #ffe58f; font-weight:bold;" onclick="MerchantApp.openInvoiceUploadModal('${o.id}')">🔔 待开票 (买家已申请)</button>`;
    } else {
      actHtml = `<button class="btn btn-outline btn-sm text-secondary" style="border-color:#cbd5e1; color:#64748b;" onclick="MerchantApp.openInvoiceUploadModal('${o.id}')">📄 上传发票 (买家未申请)</button>`;
    }
  }
  actContainer.innerHTML = actHtml;

  // Render Steps
  const stepsContainer = document.getElementById('merchant-detail-steps');
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

  // Goods
  const goodsTbody = document.getElementById('merchant-detail-goods-tbody');
  const imgUrl = 'https://images.unsplash.com/photo-1590509653066-51f7bb54c2a4?auto=format&fit=crop&w=120&q=80';
  goodsTbody.innerHTML = `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:12px;">
        <img src="${imgUrl}" style="width:40px; height:40px; border-radius:6px; object-fit:cover;" />
      </td>
      <td style="padding:12px;">
        <span style="font-weight:bold; color:#0f172a;">${o.productName}</span>
      </td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:#475569;">${o.amount}</td>
      <td style="padding:12px; text-align:center; color:#475569;">1 批次</td>
      <td style="padding:12px; text-align:right; font-weight:bold; color:#0f172a;">${o.amount}</td>
    </tr>
  `;

  document.getElementById('merchant-detail-subtotal-price').innerText = o.amount;
  document.getElementById('merchant-detail-total-amount').innerText = o.amount;

  // Contract (最多支持10张合同附件)
  const contractWrapper = document.getElementById('merchant-detail-contract-wrapper');
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
              <button class="btn btn-outline btn-xs" id="merchant-detail-preview-contract-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:11px; flex-shrink:0;">【预览】</button>
            </div>
          `).join('')}
        </div>
      `;
      contractImages.forEach((img, i) => {
        const btn = document.getElementById(`merchant-detail-preview-contract-btn-${i}`);
        if (btn) btn.onclick = () => UI.previewDocument(img.name, img.type, contractNo, o.amount, o.buyerName, '远大钢铁官方直营店');
      });
    }
  }

  // Payment voucher (最多支持5张凭证附件)
  const voucherCard = document.getElementById('merchant-detail-payment-voucher-card');
  if (voucherCard) {
    const voucherTitle = `<h3 class="text-base font-bold mb-3" style="color:#0f172a; display:flex; align-items:center; gap:8px;">
      <span style="width:4px; height:16px; background:var(--primary-color); border-radius:2px; display:inline-block;"></span>
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
              <button class="btn btn-outline btn-xs" id="merchant-detail-preview-voucher-btn-${i}" style="border-radius:4px; padding:3px 8px; font-size:11px; color:#166534; border-color:#bbf7d0; background:#fff;">【预览】</button>
            </div>
          `).join('')}
        </div>
      `;
      voucherImages.forEach((vImg, i) => {
        const btn = document.getElementById(`merchant-detail-preview-voucher-btn-${i}`);
        if (btn) btn.onclick = () => UI.previewDocument(vImg.name, vImg.type, voucherNo, o.amount, o.buyerName, '远大钢铁官方直营店');
      });
    }
  }

  // Logistics
  document.getElementById('merchant-detail-logistics-no').innerText = (o.status >= 2 || o.status === 3) ? `${o.logisticsCarrier || '顺丰速运'} ${o.logisticsNo || 'SF1480928120'}` : '--';

  // Buyer
  document.getElementById('merchant-detail-buyer-name').innerText = o.buyerName || '--';


};

MerchantApp.hideOrderDetailPage = function() {
  document.getElementById('merchant-order-list-section').style.display = 'block';
  document.getElementById('merchant-order-detail-section').style.display = 'none';
};

MerchantApp.openShipDetailPage = function(orderId) {
  MerchantApp.openShipModal(orderId);
  // Add a callback to refresh detail page after ship submission
  const oldSubmit = MerchantApp.submitShip;
  MerchantApp.submitShip = function() {
    oldSubmit();
    MerchantApp.showOrderDetailPage(orderId);
    MerchantApp.renderOrders();
  };
};

MerchantApp.openInvoiceUploadModal = function(orderId) {
  const order = MockData.orders.find(o => o.id === orderId);
  let inv = (MockData.invoices || []).find(i => i.orderId === orderId || (i.buyerName === order?.buyerName && i.amount === order?.amount));

  const existingOverlay = document.getElementById('merchant-invoice-modal-overlay');
  if (existingOverlay) existingOverlay.remove();

  const overlay = document.createElement('div');
  overlay.id = 'merchant-invoice-modal-overlay';
  overlay.className = 'modal-overlay';
  overlay.style.cssText = 'display:flex !important; align-items:center; justify-content:center; background:rgba(15,23,42,0.4) !important; backdrop-filter:blur(8px) !important; position:fixed !important; top:0 !important; left:0 !important; right:0 !important; bottom:0 !important; z-index:110000 !important; font-family:system-ui,-apple-system,sans-serif !important; padding:16px !important; box-sizing:border-box !important; opacity:1 !important;';

  const buyerStatusBadge = inv
    ? (inv.status === '已开具'
      ? `<span class="tag tag-success" style="font-size:12px; padding:3px 10px; border-radius:12px;">已开具 (买家已可查看)</span>`
      : `<span class="tag tag-warning" style="font-size:12px; padding:3px 10px; border-radius:12px; background:#fff7e6; color:#d46b08; border:1px solid #ffe58f;">待开具 (买家申请开票中)</span>`)
    : `<span class="tag tag-secondary" style="font-size:12px; padding:3px 10px; border-radius:12px;">待开具 (买家未单独提交申请)</span>`;

  const buyerApplyInfo = inv ? `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:16px;">
      <div style="font-weight:bold; color:#0f172a; margin-bottom:6px; font-size:13px; display:flex; align-items:center; justify-content:space-between;">
        <span>买家开票申请详情</span>
        ${buyerStatusBadge}
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; font-size:12px; color:#475569;">
        <div>发票抬头：<strong style="color:#1e293b;">${inv.title || inv.buyerName || order?.buyerName || '--'}</strong></div>
        <div>纳税人识别号：<span style="font-family:monospace; font-weight:bold;">${inv.taxNo || '91310115MA1K3***88'}</span></div>
        <div>发票类型：<span>${inv.type || '增值税专用发票'}</span></div>
        <div>受票邮箱：<span>${inv.email || 'finance@buyer.com'}</span></div>
        <div>申请时间：<span>${inv.applyTime || inv.createTime || '--'}</span></div>
        <div>开票金额：<strong style="color:#ef4444; font-family:monospace;">${inv.amount || order?.amount || '--'}</strong></div>
      </div>
    </div>
  ` : `
    <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:12px; margin-bottom:16px;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:bold; color:#0f172a; font-size:13px;">买家申请开票状态</div>
          <div style="font-size:12px; color:#64748b; margin-top:2px;">订单 ${orderId} 尚未接收到专门的开票申请单，您可以直接为买家主公开具上传凭证。</div>
        </div>
        ${buyerStatusBadge}
      </div>
    </div>
  `;

  const currentFileHtml = inv && inv.fileName ? `
    <div style="background:#f0fdf4; border:1px solid #bbf7d0; border-radius:8px; padding:10px 14px; display:flex; align-items:center; justify-content:space-between; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="font-size:18px;">📄</span>
        <div>
          <div style="font-weight:bold; color:#166534; font-size:12px;">已上传发票图文/文档</div>
          <div style="font-size:11px; color:#15803d; font-family:monospace;">${inv.fileName}</div>
        </div>
      </div>
      <button class="btn btn-outline btn-xs" style="color:#166534; border-color:#bbf7d0; background:#fff;" onclick="UI.previewDocument('${inv.fileName}', 'contract', '${inv.id}', '${inv.amount}', '${inv.buyerName}', '商家')">【预览发票】</button>
    </div>
  ` : '';

  overlay.innerHTML = `
    <div style="width:520px; background:#ffffff; border-radius:16px; border:1px solid rgba(0,0,0,0.05); box-shadow:0 20px 50px rgba(0,0,0,0.15); display:flex; flex-direction:column; max-height:90vh; overflow:hidden; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px; border-bottom:1px solid #f1f5f9;">
        <div>
          <h3 style="margin:0; font-size:16px; font-weight:800; color:#1e293b;">🧾 订单发票上传与开具管理</h3>
          <div style="font-size:12px; color:#64748b; margin-top:2px;">订单号：${orderId}</div>
        </div>
        <button style="background:none; border:none; color:#94a3b8; font-size:18px; cursor:pointer;" onclick="this.closest('.modal-overlay').remove()">✕</button>
      </div>

      <div style="padding:20px; overflow-y:auto; flex:1; box-sizing:border-box;">
        ${buyerApplyInfo}
        ${currentFileHtml}

        <div style="border:2px dashed #cbd5e1; border-radius:12px; padding:20px; text-align:center; background:#fafafa; cursor:pointer; transition:all 0.2s;" id="merchant-inv-dropzone" onclick="document.getElementById('merchant-inv-file-input').click()">
          <input type="file" id="merchant-inv-file-input" accept=".pdf,.jpg,.jpeg,.png,.gif" style="display:none;" onchange="MerchantApp._handleInvoiceFileSelected(this)">
          <div style="font-size:28px; margin-bottom:8px;">📤</div>
          <div style="font-weight:bold; color:#1e293b; font-size:14px; margin-bottom:4px;">点击选择或拖拽发票文件上传</div>
          <div style="font-size:12px; color:#64748b;">支持格式：PDF、JPG、JPEG、PNG (最大 15MB)</div>
        </div>

        <div id="merchant-inv-preview-area" style="display:none; margin-top:12px; background:#eff6ff; border:1px solid #bfdbfe; border-radius:8px; padding:10px 14px; justify-content:space-between; align-items:center;">
          <div style="display:flex; align-items:center; gap:8px;">
            <span style="font-size:16px;">📎</span>
            <span id="merchant-inv-preview-name" style="font-size:12px; font-weight:bold; color:#1e40af;"></span>
          </div>
          <button class="btn btn-text btn-xs text-danger" onclick="MerchantApp._clearInvoiceSelectedFile()">移除重新选</button>
        </div>
      </div>

      <div style="background:#f9fafb; padding:12px 20px; border-top:1px solid #f1f5f9; display:flex; justify-content:flex-end; gap:10px;">
        <button class="btn btn-outline" style="border-radius:6px; padding:6px 16px; font-size:12px;" onclick="this.closest('.modal-overlay').remove()">取消</button>
        <button class="btn btn-primary" style="border-radius:6px; padding:6px 16px; font-size:12px; background:#2563eb;" onclick="MerchantApp._submitUploadedInvoice('${orderId}')">确认上传并标记为已开具</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
};

MerchantApp._selectedInvFile = null;

MerchantApp._handleInvoiceFileSelected = function(input) {
  if (input.files && input.files[0]) {
    const file = input.files[0];
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.gif'];
    const fileName = file.name.toLowerCase();
    const isValid = validExts.some(ext => fileName.endsWith(ext));

    if (!isValid) {
      UI.toast('请上传 PDF / JPG / PNG / JPEG 格式的发票图文或文档', 'warning');
      input.value = '';
      return;
    }

    MerchantApp._selectedInvFile = file;
    document.getElementById('merchant-inv-preview-name').innerText = file.name + ` (${(file.size / 1024).toFixed(1)} KB)`;
    document.getElementById('merchant-inv-preview-area').style.display = 'flex';
    UI.toast('已选中发票文件: ' + file.name, 'info');
  }
};

MerchantApp._clearInvoiceSelectedFile = function() {
  MerchantApp._selectedInvFile = null;
  const input = document.getElementById('merchant-inv-file-input');
  if (input) input.value = '';
  const area = document.getElementById('merchant-inv-preview-area');
  if (area) area.style.display = 'none';
};

MerchantApp._submitUploadedInvoice = function(orderId) {
  const order = MockData.orders.find(o => o.id === orderId);
  let fileName = '电子发票_' + orderId + '.pdf';
  if (MerchantApp._selectedInvFile) {
    fileName = MerchantApp._selectedInvFile.name;
  }

  let inv = (MockData.invoices || []).find(i => i.orderId === orderId || (i.buyerName === order?.buyerName && i.amount === order?.amount));

  if (inv) {
    inv.status = '已开具';
    inv.fileName = fileName;
    inv.orderId = orderId;
    inv.applyTime = inv.applyTime || new Date().toISOString().replace('T', ' ').slice(0, 19);
  } else {
    inv = {
      id: 'INV-' + new Date().getFullYear() + String(new Date().getMonth() + 1).padStart(2, '0') + '-' + String(Math.floor(Math.random() * 900) + 100),
      orderId: orderId,
      buyerName: order ? order.buyerName : '万通建材采购部',
      type: '增值税专用发票',
      amount: order ? order.amount : '¥0.00',
      applyTime: new Date().toISOString().replace('T', ' ').slice(0, 19),
      status: '已开具',
      fileName: fileName
    };
    if (!MockData.invoices) MockData.invoices = [];
    MockData.invoices.unshift(inv);
  }

  if (order) order.invoiceApplied = true;

  const overlay = document.getElementById('merchant-invoice-modal-overlay');
  if (overlay) overlay.remove();

  UI.toast('🎉 发票文件 (' + fileName + ') 已成功上传，开票状态已同步更新为【已开具】！', 'success');

  MerchantApp.renderOrders();
  if (document.getElementById('merchant-order-detail-section')?.style.display === 'block') {
    MerchantApp.showOrderDetailPage(orderId);
  }
};

window.MerchantApp = MerchantApp;
