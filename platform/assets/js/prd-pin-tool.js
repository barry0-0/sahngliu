/**
 * S2B2C 供应链系统 - 交互式 PRD 打点与研发规格工具 (带备份导入导出与智能跳转版)
 */
(function() {
  const ENABLE_PRD_TOOL = false; // 暂时关闭 PRD 打点标注工具
  if (!ENABLE_PRD_TOOL) return;

  // 1. 样式注入
  const style = document.createElement('style');
  style.textContent = `
    /* 悬浮控制面板 - 展开后为高侧边栏 */
    .prd-control-panel {
      position: fixed;
      top: 16px;
      right: 16px;
      bottom: 16px;
      z-index: 100000;
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.18);
      width: 330px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      font-size: 13px;
      color: #1e293b !important;
    }
    
    .prd-control-panel.collapsed {
      width: 140px;
      height: 42px;
      bottom: auto;
      cursor: grab;
    }
    .prd-control-panel.collapsed.dragging {
      cursor: grabbing;
      opacity: 0.85;
      transition: none;
    }
    
    .prd-panel-header {
      background: #1677ff;
      color: white;
      padding: 10px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: inherit;
      font-weight: bold;
      flex-shrink: 0;
    }
    
    .prd-panel-body {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      flex: 1;
      overflow: hidden;
    }
    
    /* 核心操作按钮 */
    .prd-action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      background: #1677ff;
      color: white;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: all 0.2s;
      width: 100%;
      flex-shrink: 0;
    }
    .prd-action-btn:hover {
      background: #0050b3;
    }
    .prd-action-btn.active {
      background: #ef4444;
      animation: prd-pulse 1.5s infinite;
    }
    
    @keyframes prd-pulse {
      0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
      70% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
      100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
    }
    
    /* 列表容器自适应 */
    #prd-items-container {
      flex: 1;
      overflow-y: auto;
      padding-right: 4px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 4px;
    }
    
    /* 列表项 */
    .prd-list-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .prd-list-item:hover {
      border-color: #1677ff;
      background: #f0f7ff;
    }
    .prd-item-meta {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      color: #94a3b8;
      margin-top: 4px;
    }
    
    /* 徽标大头针 */
    .prd-pin-marker {
      position: absolute;
      width: 24px;
      height: 24px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.5);
      border: 2px solid white;
      cursor: pointer;
      z-index: 99980;
      transform: translate(-50%, -50%);
      transition: all 0.2s;
      pointer-events: auto;
    }
    .prd-pin-marker:hover {
      transform: translate(-50%, -50%) scale(1.2);
      background: #1677ff;
      box-shadow: 0 2px 8px rgba(22, 119, 255, 0.5);
    }
    .prd-pin-marker.highlighted {
      background: #1677ff !important;
      box-shadow: 0 0 0 6px rgba(22, 119, 255, 0.3) !important;
      transform: translate(-50%, -50%) scale(1.25);
    }
    
    /* 选定高亮 */
    .prd-hover-highlight {
      outline: 2px dashed #1677ff !important;
      outline-offset: 2px;
      cursor: crosshair !important;
    }
    
    /* 定位高亮闪烁效果 */
    @keyframes prd-flash-glow {
      0% {
        box-shadow: 0 0 0 0 rgba(22, 119, 255, 0.7);
        background-color: rgba(22, 119, 255, 0.15);
      }
      50% {
        box-shadow: 0 0 0 15px rgba(22, 119, 255, 0);
        background-color: rgba(22, 119, 255, 0.3);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(22, 119, 255, 0);
        background-color: transparent;
      }
    }
    .prd-flash-highlight {
      animation: prd-flash-glow 0.8s ease-in-out 1 !important;
      outline: 3px solid #1677ff !important;
      outline-offset: 3px !important;
      transition: all 0.3s;
    }
    
    /* 内联编辑表单 */
    .prd-inline-edit-form {
      background: #ffffff;
      border: 2px solid #1677ff;
      border-radius: 8px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      cursor: default;
    }
    
    .prd-form-group {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .prd-form-group label {
      font-weight: bold;
      color: #475569;
      font-size: 11px;
    }
    .prd-form-control {
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 10px;
      font-size: 12px;
      outline: none;
      transition: all 0.2s;
      color: #0f172a !important;
      background: #fff;
    }
    .prd-form-control:focus {
      border-color: #1677ff;
      box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
    }
    
    /* Inspect Popover */
    .prd-inspect-popover {
      position: absolute;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.15);
      border: 1px solid #e2e8f0;
      padding: 16px;
      width: 295px;
      z-index: 100002;
      font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      display: none;
      color: #1e293b !important;
    }
    
    .prd-popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 6px;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 4px;
    }
  `;
  document.head.appendChild(style);

  // 2. 核心状态数据
  const pageKey = window.location.pathname.split('/').pop() || 'index.html';
  const presets = window.INITIAL_PRD_DATA || [];
  
  // 仅在本地 file 协议或本地开发服务器模式下开启编辑/标序标注功能，GitHub Pages 等生产部署只读
  const isEditMode = window.location.protocol === 'file:' || 
                     window.location.hostname === 'localhost' || 
                     window.location.hostname === '127.0.0.1';
  
  let savedPins = [];
  
  function reIndexPins(pins) {
    pins.forEach((pin, index) => {
      pin.id = index + 1; // 强制重新排列ID，杜绝重复ID
    });
  }

  if (!isEditMode) {
    savedPins = JSON.parse(JSON.stringify(presets));
    reIndexPins(savedPins);
  } else {
    try {
      const local = localStorage.getItem(`prd_pins_${pageKey}`);
      if (local) {
        savedPins = JSON.parse(local);
        reIndexPins(savedPins);
      } else {
        savedPins = JSON.parse(JSON.stringify(presets));
        reIndexPins(savedPins);
        localStorage.setItem(`prd_pins_${pageKey}`, JSON.stringify(savedPins));
      }
    } catch (e) {
      savedPins = JSON.parse(JSON.stringify(presets));
      reIndexPins(savedPins);
    }
  }

  // IndexedDB 辅助函数，用于持久化保存文件夹句柄 (Directory Handle)
  const DB_NAME = 'PrdToolDB';
  const STORE_NAME = 'handles';
  const KEY_NAME = 'projectDir';

  function getDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = (e) => {
        e.target.result.createObjectStore(STORE_NAME);
      };
      request.onsuccess = (e) => resolve(e.target.result);
      request.onerror = (e) => reject(request.error);
    });
  }

  async function saveDirHandle(handle) {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(handle, KEY_NAME);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function loadDirHandle() {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(KEY_NAME);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  let dirHandle = null;

  async function initDirHandle() {
    try {
      const handle = await loadDirHandle();
      if (handle) {
        const options = { mode: 'readwrite' };
        if ((await handle.queryPermission(options)) === 'granted') {
          dirHandle = handle;
          updateSyncStatus(true);
        } else {
          updateSyncStatus(false, 'needs-permission');
        }
      } else {
        updateSyncStatus(false);
      }
    } catch (e) {
      console.warn('加载本地目录句柄失败:', e);
      updateSyncStatus(false);
    }
  }

  async function syncDataToDisk() {
    if (!dirHandle) return false;
    try {
      let jsDir = null;
      try {
        jsDir = await dirHandle.getDirectoryHandle('assets', { create: false });
        jsDir = await jsDir.getDirectoryHandle('js', { create: false });
      } catch (err) {
        try {
          const platformDir = await dirHandle.getDirectoryHandle('platform', { create: false });
          jsDir = await platformDir.getDirectoryHandle('assets', { create: false });
          jsDir = await jsDir.getDirectoryHandle('js', { create: false });
        } catch (err2) {
          jsDir = await dirHandle.getDirectoryHandle('assets', { create: true });
          jsDir = await jsDir.getDirectoryHandle('js', { create: true });
        }
      }

      const fileName = `prd-data-${pageKey.replace('.html', '')}.js`;
      const fileHandle = await jsDir.getFileHandle(fileName, { create: true });
      const writable = await fileHandle.createWritable();
      
      const jsContent = `window.INITIAL_PRD_DATA = ${JSON.stringify(savedPins, null, 2)};\n`;
      await writable.write(jsContent);
      await writable.close();
      return true;
    } catch (e) {
      console.error('自动写入本地文件失败:', e);
      if (e.name === 'NotAllowedError') {
        updateSyncStatus(false, 'needs-permission');
      }
      return false;
    }
  }

  async function savePinsLocally() {
    localStorage.setItem(`prd_pins_${pageKey}`, JSON.stringify(savedPins));
    const synced = await syncDataToDisk();
    if (synced) {
      safeToast('已自动同步保存至本地 JS 文件！', 'success');
    }
  }

  window.linkProjectDirectory = async function() {
    try {
      const handle = await window.showDirectoryPicker();
      await saveDirHandle(handle);
      dirHandle = handle;
      updateSyncStatus(true);
      await syncDataToDisk();
      safeToast('成功关联项目目录，打点数据已自动同步保存！', 'success');
    } catch (e) {
      console.error(e);
      if (e.name !== 'AbortError') {
        safeToast('关联失败: ' + e.message, 'error');
      }
    }
  };

  window.requestDirectoryPermission = async function() {
    if (!dirHandle) return;
    try {
      const options = { mode: 'readwrite' };
      if ((await dirHandle.requestPermission(options)) === 'granted') {
        updateSyncStatus(true);
        await syncDataToDisk();
        safeToast('授权成功，已恢复自动保存！', 'success');
      }
    } catch (e) {
      console.error(e);
      safeToast('授权失败: ' + e.message, 'error');
    }
  };

  function updateSyncStatus(active, reason = '') {
    const box = document.getElementById('prd-sync-status-box');
    if (!box) return;
    
    if (active) {
      box.innerHTML = `
        <div style="font-size:11px; color:#10b981; display:flex; align-items:center; justify-content:center; gap:4px; font-weight:bold; margin-top: 6px;">
          <span>🟢 已关联本地项目 (自动保存)</span>
          <span style="color:#64748b; cursor:pointer; text-decoration:underline; font-weight:normal;" onclick="linkProjectDirectory()">重新关联</span>
        </div>
      `;
    } else {
      if (reason === 'needs-permission') {
        box.innerHTML = `
          <button class="prd-action-btn" style="background:#f59e0b; width:100%; font-size:11px; padding:6px; margin-top:6px;" onclick="requestDirectoryPermission()">
            🔑 授权本地项目读写权限以自动保存
          </button>
        `;
      } else {
        const hasAPI = typeof window.showDirectoryPicker === 'function';
        if (hasAPI) {
          box.innerHTML = `
            <button class="prd-action-btn" style="background:#10b981; width:100%; font-size:11px; padding:6px; margin-top:6px;" onclick="linkProjectDirectory()">
              🔗 关联本地项目文件夹 (自动保存)
            </button>
          `;
        } else {
          box.innerHTML = `
            <div style="font-size:11px; color:#f59e0b; padding:6px; border:1px dashed #f59e0b; border-radius:6px; background:#fffbeb; text-align:left; line-height:1.4; margin-top:6px;">
              ⚠️ 当前环境不支持自动保存功能。<br>
              请确保满足以下条件：<br>
              1. 必须使用 <strong>Chrome</strong> 或 <strong>Edge</strong> 浏览器打开本页面。<br>
              2. 必须使用本地服务器链接 (如 http://127.0.0.1:8080/merchant.html)，直接双击 HTML (file:// 协议) 无法使用。
            </div>
          `;
        }
      }
    }
  }

  let pinModeActive = false;
  let reSelectModeActive = false;
  let editingPinId = null;
  let highlightedElement = null;

  function safeToast(msg, type = 'info') {
    if (window.UI && typeof window.UI.toast === 'function') {
      window.UI.toast(msg, type);
    } else {
      alert(msg);
    }
  }

  // 极轻量 Markdown-to-HTML 渲染器
  function parseMarkdown(md) {
    if (!md) return '';
    let html = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
      
    html = html.replace(/^### (.*$)/gim, '<h6 style="margin:5px 0; font-weight:bold; color:#0f172a; font-size:12px;">$1</h6>');
    html = html.replace(/^## (.*$)/gim, '<h5 style="margin:6px 0; font-weight:bold; color:#0f172a; font-size:13px;">$1</h5>');
    html = html.replace(/^# (.*$)/gim, '<h4 style="margin:8px 0; font-weight:bold; color:#0f172a; font-size:14px;">$1</h4>');
    
    html = html.replace(/```([\s\S]*?)```/gm, '<pre style="background:#f8fafc; border:1px solid #e2e8f0; padding:6px; border-radius:4px; font-family:monospace; font-size:10px; white-space:pre-wrap; margin:6px 0; color:#0f172a;"><code>$1</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9; padding:2px 4px; border-radius:3px; font-family:monospace; font-size:11px; color:#ef4444;">$1</code>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong style="font-weight:bold; color:#0f172a;">$1</strong>');
    
    let lines = html.split('\n');
    let inList = false;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (line.startsWith('- ') || line.startsWith('* ')) {
        let content = line.substring(2);
        if (!inList) {
          lines[i] = '<ul style="margin:4px 0; padding-left:14px; list-style-type:disc;">\n<li style="margin-bottom:2px; font-size:11px;">' + content + '</li>';
          inList = true;
        } else {
          lines[i] = '<li style="margin-bottom:2px; font-size:11px;">' + content + '</li>';
        }
      } else {
        if (inList) {
          lines[i - 1] = lines[i - 1] + '\n</ul>';
          inList = false;
        }
      }
    }
    if (inList) {
      lines[lines.length - 1] = lines[lines.length - 1] + '\n</ul>';
    }
    html = lines.join('\n');
    
    html = html.replace(/\n/g, '<br>');
    html = html.replace(/<\/li><br>/g, '</li>');
    html = html.replace(/<\/ul><br>/g, '</ul>');
    html = html.replace(/<\/pre><br>/g, '</pre>');
    html = html.replace(/<br><br>/g, '<p style="margin:6px 0;"></p>');
    
    return html;
  }

  // 3. 构建控制面板 DOM
  const controlPanel = document.createElement('div');
  controlPanel.className = 'prd-control-panel collapsed';
  controlPanel.id = 'prd-panel';
  controlPanel.innerHTML = `
    <div class="prd-panel-header" id="prd-panel-header">
      <span>📋 PRD 规格清单 (<span id="prd-count-badge">0</span>)</span>
      <span id="prd-collapse-icon" style="font-size:10px;">▲</span>
    </div>
    <div class="prd-panel-body" id="prd-panel-body" style="display: none;">
      ${isEditMode ? `
      <button class="prd-action-btn" id="prd-btn-pin" onclick="togglePinMode()">
        <span>📍 开始打点标序</span>
      </button>
      ` : ''}
      
      <div id="prd-items-container">
        <!-- 动态渲染规格清单 -->
      </div>
      
      ${isEditMode ? `
      <div style="display:flex; gap:6px; margin-top:6px; flex-shrink:0;">
        <button class="prd-action-btn" style="flex:1; background:#475569;" onclick="exportPRDFile()">💾 导出 JS 数据</button>
        <button class="prd-action-btn" style="flex:1; background:#8b5cf6;" onclick="triggerImportFile()">📂 导入 JS 数据</button>
      </div>
      <div id="prd-sync-status-box"></div>
      <input type="file" id="prd-import-input" accept=".js,.txt" style="display:none;" onchange="importPRDFile(this)">
      ` : ''}
    </div>
  `;
  document.body.appendChild(controlPanel);

  // 3.5 拖拽移动逻辑（仅收起状态可拖）
  (function initDrag() {
    const header = document.getElementById('prd-panel-header');
    let isDragging = false;
    let startX, startY, origLeft, origTop;
    const DRAG_THRESHOLD = 4;

    header.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      const panel = document.getElementById('prd-panel');
      if (!panel.classList.contains('collapsed')) {
        // 展开态：header 点击 = 折叠
        togglePanelCollapse();
        return;
      }
      // 收起态：准备拖拽
      isDragging = false;
      const rect = panel.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      origLeft = rect.left;
      origTop = rect.top;
      e.preventDefault();

      function onMove(ev) {
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        if (!isDragging && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
          isDragging = true;
          panel.classList.add('dragging');
          // 切换到 left 定位
          panel.style.right = 'auto';
        }
        if (isDragging) {
          let newLeft = origLeft + dx;
          let newTop = origTop + dy;
          // 边界约束
          newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - panel.offsetWidth));
          newTop = Math.max(0, Math.min(newTop, window.innerHeight - panel.offsetHeight));
          panel.style.left = newLeft + 'px';
          panel.style.top = newTop + 'px';
        }
      }

      function onUp() {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        panel.classList.remove('dragging');
        if (!isDragging) {
          // 没拖动 = 点击 = 展开
          togglePanelCollapse();
        }
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });
  })();

  // 4. 创建大头针徽标渲染层
  const pinsOverlay = document.createElement('div');
  pinsOverlay.id = 'prd-pins-overlay';
  pinsOverlay.style.position = 'absolute';
  pinsOverlay.style.top = '0';
  pinsOverlay.style.left = '0';
  pinsOverlay.style.width = '100%';
  pinsOverlay.style.pointerEvents = 'none';
  pinsOverlay.style.zIndex = '99980';

  // 5. 生成唯一 :nth-child 路径选择器
  function getUniqueSelector(el) {
    if (!(el instanceof Element)) return '';
    if (el.id) return `#${el.id}`;
    
    const path = [];
    let cur = el;
    while (cur && cur.nodeType === Node.ELEMENT_NODE) {
      if (cur.id) {
        path.unshift(`#${cur.id}`);
        break;
      }
      
      let sib = cur;
      let childIndex = 1;
      while (sib = sib.previousElementSibling) {
        childIndex++;
      }
      
      const nodeName = cur.nodeName.toLowerCase();
      path.unshift(`${nodeName}:nth-child(${childIndex})`);
      cur = cur.parentNode;
    }
    return path.join(' > ');
  }

  // 6. 面板折叠
  window.togglePanelCollapse = function() {
    const panel = document.getElementById('prd-panel');
    const icon = document.getElementById('prd-collapse-icon');
    const body = document.getElementById('prd-panel-body');
    if (panel.classList.contains('collapsed')) {
      panel.classList.remove('collapsed');
      // 复位到默认停靠位置
      panel.style.top = '16px';
      panel.style.right = '16px';
      panel.style.left = 'auto';
      body.style.display = 'flex';
      icon.innerText = '▼';
      renderPins(); // 展开时渲染标记
    } else {
      panel.classList.add('collapsed');
      body.style.display = 'none';
      icon.innerText = '▲';
      renderPins(); // 收起时清空标记
      closeInspectPopover(); // 同时关闭打开的弹出气泡
    }
  };

  // 7. 开启/关闭打点模式
  window.togglePinMode = function() {
    pinModeActive = !pinModeActive;
    const btn = document.getElementById('prd-btn-pin');
    
    if (pinModeActive) {
      btn.classList.add('active');
      btn.innerText = '🛑 退出打点模式';
      document.body.style.cursor = 'crosshair';
      safeToast('打点激活！请直接在页面组件上点击进行标记。', 'info');
      
      document.addEventListener('mouseover', handleMouseOver, true);
      document.addEventListener('mouseout', handleMouseOut, true);
      document.addEventListener('click', handleElementClick, true);
    } else {
      btn.classList.remove('active');
      btn.innerText = '📍 开始打点标序';
      document.body.style.cursor = 'default';
      
      if (highlightedElement) {
        highlightedElement.classList.remove('prd-hover-highlight');
        highlightedElement = null;
      }
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleElementClick, true);
    }
  };

  function handleMouseOver(e) {
    if (e.target.closest('.prd-control-panel') || e.target.closest('.prd-inspect-popover')) return;
    
    if (highlightedElement) {
      highlightedElement.classList.remove('prd-hover-highlight');
    }
    highlightedElement = e.target;
    highlightedElement.classList.add('prd-hover-highlight');
  }

  function handleMouseOut(e) {
    if (highlightedElement === e.target) {
      highlightedElement.classList.remove('prd-hover-highlight');
      highlightedElement = null;
    }
  }

  function handleElementClick(e) {
    if (e.target.closest('.prd-control-panel') || e.target.closest('.prd-inspect-popover')) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const selector = getUniqueSelector(e.target);
    
    if (reSelectModeActive) {
      reSelectModeActive = false;
      document.body.style.cursor = 'default';
      
      if (highlightedElement) {
        highlightedElement.classList.remove('prd-hover-highlight');
        highlightedElement = null;
      }
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      document.removeEventListener('click', handleElementClick, true);
      
      const index = savedPins.findIndex(p => p.id === editingPinId);
      if (index !== -1) {
        savedPins[index].selector = selector;
        savePinsLocally();
      }
      
      renderPins();
      renderPRDList();
      
      locateAndHighlight(editingPinId, false);
      safeToast('组件重新关联成功！', 'success');
    } else {
      togglePinMode();
      
      // 创建新ID时，强制以现有长度加一的形式并重整，防止重复
      const newId = savedPins.length + 1;
      savedPins.push({ id: newId, selector, title: '', desc: '' });
      reIndexPins(savedPins);
      
      editingPinId = newId;
      renderPins();
      renderPRDList();
      
      locateAndHighlight(newId, false);
    }
  }

  // 校验组件是否完全显示
  function isElementVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;
    
    let cur = el;
    while (cur && cur !== document.body) {
      const style = window.getComputedStyle(cur);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      cur = cur.parentElement;
    }
    return true;
  }

  // 8. 渲染大头针徽标
  function renderPins() {
    const scrollContainer = document.querySelector('.h5-content') || document.body;
    if (scrollContainer && scrollContainer !== document.body) {
      const style = window.getComputedStyle(scrollContainer);
      if (style.position === 'static') {
        scrollContainer.style.position = 'relative';
      }
    }
    
    if (pinsOverlay.parentNode !== scrollContainer) {
      scrollContainer.appendChild(pinsOverlay);
    }

    pinsOverlay.innerHTML = '';
    
    const panel = document.getElementById('prd-panel');
    if (panel && panel.classList.contains('collapsed')) {
      const badge = document.getElementById('prd-count-badge');
      if (badge) badge.innerText = savedPins.length;
      return; // 收起时不渲染任何打点标记
    }
    
    savedPins.forEach((pin, i) => {
      const el = document.querySelector(pin.selector);
      if (!el || !isElementVisible(el)) return;
      
      const rect = el.getBoundingClientRect();
      const marker = document.createElement('div');
      marker.className = `prd-pin-marker pin-id-${pin.id}`;
      marker.innerText = i + 1;
      
      const containerRect = scrollContainer.getBoundingClientRect();
      const scrollT = scrollContainer === document.body ? window.scrollY : scrollContainer.scrollTop;
      const scrollL = scrollContainer === document.body ? window.scrollX : scrollContainer.scrollLeft;
      
      marker.style.top = `${rect.top - containerRect.top + scrollT}px`;
      marker.style.left = `${rect.left - containerRect.left + scrollL}px`;
      
      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        showInspectPopover(pin, marker);
      });
      
      pinsOverlay.appendChild(marker);
    });

    const badge = document.getElementById('prd-count-badge');
    if (badge) badge.innerText = savedPins.length;
  }

  window.addEventListener('resize', renderPins);
  window.addEventListener('scroll', renderPins, true);
  
  const observer = new MutationObserver((mutations) => {
    renderPins();
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style'] });

  // 9. 渲染规格清单列表
  function renderPRDList() {
    const container = document.getElementById('prd-items-container');
    if (!container) return;
    
    if (savedPins.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:#94a3b8; padding:20px 0;">当前页面暂无 PRD 点位，请点击开始打点！</div>`;
      return;
    }
    
    let html = '';
    savedPins.forEach((pin, index) => {
      if (pin.id === editingPinId) {
        // 渲染编辑状态的卡片
        html += `
          <div class="prd-inline-edit-form" onclick="event.stopPropagation()">
            <div style="font-weight:bold; font-size:12px; color:#1677ff; margin-bottom:4px; display:flex; justify-content:space-between; align-items:center;">
              <span>✏️ 编辑点位 #${index + 1}</span>
              <button class="btn btn-outline" style="padding:2px 8px; font-size:11px; height:24px; border-radius:4px;" onclick="reSelectElement(${pin.id})">🎯 重新关联组件</button>
            </div>
            
            <div class="prd-form-group">
              <label>需求名称 <span style="color:#ef4444;">*</span></label>
              <input type="text" id="prd-edit-title" class="prd-form-control" placeholder="请输入需求名称(必填)" value="${pin.title || ''}">
            </div>
            
            <div class="prd-form-group">
              <label>产品逻辑描述 (支持 Markdown 语法) <span style="color:#ef4444;">*</span></label>
              <textarea id="prd-edit-desc" class="prd-form-control" rows="8" placeholder="支持 Markdown，如：\n- **粗体逻辑**\n- \`行内代码\`\n- 换行列表(必填)">${pin.desc || ''}</textarea>
            </div>
            
            <div style="display:flex; gap:6px; justify-content:flex-end; margin-top:4px;">
              <button class="btn btn-outline" style="padding:4px 10px; font-size:11px; height:26px; border-radius:4px;" onclick="cancelInlineEdit(${pin.id})">取消</button>
              <button class="btn btn-primary" style="background:#1677ff; border:none; color:white; padding:4px 12px; font-size:11px; height:26px; border-radius:4px; font-weight:bold; cursor:pointer;" onclick="saveInlineEdit(${pin.id})">完成</button>
            </div>
          </div>
        `;
      } else {
        // 渲染只读状态的卡片
        html += `
          <div class="prd-list-item" onclick="locateAndHighlight(${pin.id})">
            <div class="flex justify-between items-center" style="display:flex; justify-content:space-between; align-items:center;">
              <strong style="color:#0f172a; font-size:12px;">${index + 1}. ${pin.title || '（未命名需求）'}</strong>
            </div>
            <div style="font-size:11px; color:#475569; overflow:hidden; text-overflow:ellipsis; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; line-height:1.4; margin-top:2px;">
              ${parseMarkdown(pin.desc) || '暂无产品逻辑描述'}
            </div>
            <div class="prd-item-meta">
              <span>ID: ${pin.id}</span>
              ${isEditMode ? `
              <div style="display:flex; gap:8px;">
                <span style="color:#1677ff; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); startInlineEdit(${pin.id})">编辑</span>
                <span style="color:#ef4444; font-weight:bold; cursor:pointer;" onclick="event.stopPropagation(); deletePin(${pin.id})">删除</span>
              </div>
              ` : ''}
            </div>
          </div>
        `;
      }
    });
    container.innerHTML = html;
  }

  // 开始编辑：将卡片变为编辑状态并跳转到对应元素
  window.startInlineEdit = function(id) {
    editingPinId = id;
    renderPRDList();
    locateAndHighlight(id, false);
  };

  // 重新关联点位
  window.reSelectElement = function(pinId) {
    editingPinId = pinId;
    reSelectModeActive = true;
    
    document.body.style.cursor = 'crosshair';
    safeToast('请直接点击页面上的新组件以重新关联点位。', 'info');
    
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('click', handleElementClick, true);
  };

  // 保存内联编辑 (必填强校验)
  window.saveInlineEdit = function(id) {
    const title = document.getElementById('prd-edit-title').value.trim();
    const desc = document.getElementById('prd-edit-desc').value.trim();
    
    if (!title) {
      safeToast('保存失败：需求名称为必填项！', 'warning');
      document.getElementById('prd-edit-title').focus();
      return;
    }
    if (!desc) {
      safeToast('保存失败：产品逻辑描述为必填项！', 'warning');
      document.getElementById('prd-edit-desc').focus();
      return;
    }
    
    const index = savedPins.findIndex(p => p.id === id);
    if (index !== -1) {
      savedPins[index].title = title;
      savedPins[index].desc = desc;
    }
    
    reIndexPins(savedPins);
    savePinsLocally();
    editingPinId = null;
    
    renderPins();
    renderPRDList();
    safeToast('保存成功', 'success');
  };

  // 取消内联编辑
  window.cancelInlineEdit = function(id) {
    const index = savedPins.findIndex(p => p.id === id);
    if (index !== -1 && !savedPins[index].title && !savedPins[index].desc) {
      savedPins.splice(index, 1);
    }
    
    editingPinId = null;
    reIndexPins(savedPins);
    renderPins();
    renderPRDList();
  };

  // 10. 删除点位
  window.deletePin = function(id) {
    if (confirm('确认删除此打点记录吗？')) {
      savedPins = savedPins.filter(p => p.id !== id);
      reIndexPins(savedPins);
      savePinsLocally();
      if (editingPinId === id) editingPinId = null;
      renderPins();
      renderPRDList();
      safeToast('点位已删除', 'info');
    }
  };

  function flashTargetRing(target) {
    const oldRings = document.querySelectorAll('.prd-target-glow-ring');
    oldRings.forEach(r => r.remove());

    const rect = target.getBoundingClientRect();
    const ring = document.createElement('div');
    ring.className = 'prd-target-glow-ring';
    
    const scrollContainer = document.querySelector('.h5-content') || document.body;
    if (scrollContainer && scrollContainer !== document.body) {
      const style = window.getComputedStyle(scrollContainer);
      if (style.position === 'static') {
        scrollContainer.style.position = 'relative';
      }
    }
    
    ring.style.position = 'absolute';
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollT = scrollContainer === document.body ? window.scrollY : scrollContainer.scrollTop;
    const scrollL = scrollContainer === document.body ? window.scrollX : scrollContainer.scrollLeft;
    
    ring.style.top = `${rect.top - containerRect.top + scrollT}px`;
    ring.style.left = `${rect.left - containerRect.left + scrollL}px`;
    ring.style.width = `${rect.width}px`;
    ring.style.height = `${rect.height}px`;
    ring.style.pointerEvents = 'none';
    ring.style.zIndex = '999999';
    ring.style.border = '4px solid #1677ff';
    ring.style.boxShadow = '0 0 25px rgba(22, 119, 255, 0.8)';
    ring.style.borderRadius = '6px';
    ring.style.transform = 'scale(1.4)';
    ring.style.opacity = '0';
    ring.style.transition = 'all 0.3s cubic-bezier(0.1, 0.8, 0.3, 1)';
    
    scrollContainer.appendChild(ring);
    
    setTimeout(() => {
      ring.style.transform = 'scale(1)';
      ring.style.opacity = '1';
    }, 30);
    
    setTimeout(() => {
      ring.style.transform = 'scale(0.9)';
      ring.style.opacity = '0';
      setTimeout(() => ring.remove(), 300);
    }, 600);
  }

  // 11. 定位与高亮
  window.locateAndHighlight = function(id, showPopover = true) {
    const pin = savedPins.find(p => p.id === id);
    if (!pin) return;
    
    // 智能解析选择器中的 ID tokens，用于决定是否切换 PC 商城的主导航卡片
    const idsInSelector = (pin.selector.match(/#[a-zA-Z0-9_-]+/g) || []).map(token => token.substring(1));
    
    // 如果选择器包含特定视图 ID，先触发大导航切换
    idsInSelector.forEach(viewId => {
      // 1. PC 端个人中心子页面
      if (['uc-orders', 'uc-invoices', 'uc-demands-pub', 'uc-demands-join', 'uc-auth'].includes(viewId)) {
        // 先切换主卡片到“个人中心 (mall-ucenter)”
        const navUcenter = document.querySelector('.mall-nav-item[data-target="mall-ucenter"]');
        if (navUcenter) navUcenter.click();
        
        // 再点击个人中心侧边栏对应菜单
        setTimeout(() => {
          const ucMenuLink = document.querySelector(`#uc-menu .uc-menu-item[data-target="${viewId}"]`);
          if (ucMenuLink) ucMenuLink.click();
        }, 50);
      }
      // 2. PC 端其他主页面 (首页、现货、求购、竞价、购物车)
      else if (['mall-home', 'mall-spot', 'mall-demand', 'mall-bid', 'mall-cart'].includes(viewId)) {
        const navLink = document.querySelector(`.mall-nav-item[data-target="${viewId}"]`);
        if (navLink) navLink.click();
      }
      // 3. H5 端视图切换
      else if (['view-uc-orders', 'view-uc-bids', 'view-uc-demands', 'view-uc-invoices', 'view-cart', 'view-home', 'view-bid', 'view-find', 'view-msg', 'view-my'].includes(viewId)) {
        if (window.H5App && typeof window.H5App.switchH5View === 'function') {
          window.H5App.switchH5View(viewId);
        }
      }
    });

    // 通用父类切换逻辑
    let el = document.querySelector(pin.selector);
    if (!el || !isElementVisible(el)) {
      const allViews = document.querySelectorAll('.h5-view, .uc-view, .mall-view, .page-view, .tab-pane, .tab-content');
      for (let view of allViews) {
        if (pin.selector.includes(view.id) || (el && view.contains(el))) {
          const viewId = view.id;
          
          if (window.H5App && typeof window.H5App.switchH5View === 'function') {
            window.H5App.switchH5View(viewId);
          }
          const ucMenuLink = document.querySelector(`#uc-menu .uc-menu-item[data-target="${viewId}"]`);
          if (ucMenuLink) {
            ucMenuLink.click();
          }
          const mainNavLink = document.querySelector(`.mall-nav-item[data-target="${viewId}"], .nav-item[data-target="${viewId}"], .nav-link[data-target="${viewId}"]`);
          if (mainNavLink) {
            mainNavLink.click();
          }
          const sellerNavLink = document.querySelector(`.sub-menu-item[data-page="${viewId}"], .menu-item[data-page="${viewId}"]`);
          if (sellerNavLink) {
            sellerNavLink.click();
          }
          const adminNavLink = document.querySelector(`.admin-menu-item[data-page="${viewId}"]`);
          if (adminNavLink) {
            adminNavLink.click();
          }
        }
      }
    }
    
    // 异步加载轮询，重试次数加到 8 次
    let attempts = 0;
    function tryLocate() {
      const target = document.querySelector(pin.selector);
      if (target && isElementVisible(target)) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        flashTargetRing(target);
        
        target.classList.add('prd-flash-highlight');
        setTimeout(() => target.classList.remove('prd-flash-highlight'), 3000);
        
        const marker = document.querySelector(`.prd-pin-marker.pin-id-${pin.id}`);
        if (marker) {
          marker.classList.add('highlighted');
          setTimeout(() => marker.classList.remove('highlighted'), 2500);
        }
        
        if (showPopover) {
          showInspectPopover(pin, marker || target);
        }
      } else if (attempts < 8) {
        attempts++;
        setTimeout(tryLocate, 150);
      } else {
        safeToast('定位提示：目标组件暂时处于隐藏的交互分支中，请切换视图查看。', 'warning');
      }
    }
    
    setTimeout(tryLocate, 150);
  };

  // 12. Inspect popover 气泡气球 (渲染 Markdown 格式的产品需求)
  let activePopover = null;
  function showInspectPopover(pin, anchor) {
    if (activePopover) activePopover.remove();
    
    const popover = document.createElement('div');
    popover.className = 'prd-inspect-popover';
    popover.id = 'prd-inspect-bubble';
    
    popover.innerHTML = `
      <div class="prd-popover-header">
        <strong style="font-size:12px; color:#1677ff;">📍 PRD 产品规约</strong>
        <button style="background:none; border:none; font-size:16px; color:#94a3b8; cursor:pointer;" onclick="closeInspectPopover()">&times;</button>
      </div>
      <h4 style="margin:4px 0 6px 0; font-size:13px; font-weight:bold; color:#0f172a;">${pin.title}</h4>
      <div style="margin:0; font-size:12px; color:#475569; line-height:1.5; max-height: 200px; overflow-y: auto;">
        ${parseMarkdown(pin.desc)}
      </div>
    `;
    
    const scrollContainer = document.querySelector('.h5-content') || document.body;
    if (scrollContainer && scrollContainer !== document.body) {
      const style = window.getComputedStyle(scrollContainer);
      if (style.position === 'static') {
        scrollContainer.style.position = 'relative';
      }
    }
    
    scrollContainer.appendChild(popover);
    activePopover = popover;
    
    const rect = anchor.getBoundingClientRect();
    popover.style.display = 'block';
    
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollT = scrollContainer === document.body ? window.scrollY : scrollContainer.scrollTop;
    const scrollL = scrollContainer === document.body ? window.scrollX : scrollContainer.scrollLeft;
    
    let popLeft = (rect.left - containerRect.left + scrollL) - 130;
    let popTop = (rect.top - containerRect.top + scrollT) - popover.offsetHeight - 12;
    
    if (popLeft < 10) popLeft = 10;
    const maxLeft = (scrollContainer === document.body ? window.innerWidth : containerRect.width) - 300;
    if (popLeft > maxLeft) popLeft = maxLeft;
    if (popLeft < 10) popLeft = 10;
    
    if (popTop < 10) popTop = (rect.bottom - containerRect.top + scrollT) + 12;
    
    popover.style.left = `${popLeft}px`;
    popover.style.top = `${popTop}px`;
    
    setTimeout(() => {
      document.addEventListener('click', handlePopoverOutsideClick);
    }, 100);
  }

  window.closeInspectPopover = function() {
    if (activePopover) {
      activePopover.remove();
      activePopover = null;
      document.removeEventListener('click', handlePopoverOutsideClick);
    }
  };

  function handlePopoverOutsideClick(e) {
    if (activePopover && !activePopover.contains(e.target) && !e.target.classList.contains('prd-pin-marker')) {
      closeInspectPopover();
    }
  }

  // 13. 导出备份 (JS 数据文件)
  window.exportPRDFile = function() {
    const dataFileName = `prd-data-${pageKey.replace('.html', '')}.js`;
    const jsContent = `window.INITIAL_PRD_DATA = ${JSON.stringify(savedPins, null, 2)};\n`;
    const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = dataFileName;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    safeToast(`已成功导出 ${dataFileName}，请覆盖 assets/js/ 中的同名文件以永久保存！`, 'success');
  };

  // 14. 触发文件上传
  window.triggerImportFile = function() {
    const fileInput = document.getElementById('prd-import-input');
    if (fileInput) {
      fileInput.click();
    }
  };

  // 15. 导入备份 (支持 JS 和 JSON)
  window.importPRDFile = function(element) {
    const file = element.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        let rawContent = e.target.result.trim();
        // 提取其中的 JSON 数组部分 (支持 window.INITIAL_PRD_DATA = [...]; 与纯 JSON)
        const arrayMatch = rawContent.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          rawContent = arrayMatch[0];
        }
        const parsed = JSON.parse(rawContent);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(item => item && item.selector && (item.title !== undefined) && (item.desc !== undefined));
          if (isValid) {
            savedPins = parsed;
            reIndexPins(savedPins);
            savePinsLocally();
            
            editingPinId = null;
            renderPins();
            renderPRDList();
            safeToast('备份数据导入成功！', 'success');
          } else {
            safeToast('导入失败：数据格式不合法', 'error');
          }
        } else {
          safeToast('导入失败：数据不是合法的数组格式', 'error');
        }
      } catch (err) {
        safeToast('导入失败：解析出错，请确认是合法的预设文件', 'error');
      }
      element.value = '';
    };
    reader.readAsText(file);
  };

  // 初始化首次绘制
  setTimeout(() => {
    renderPins();
    renderPRDList();
    if (isEditMode) {
      initDirHandle();
    }
  }, 1000);
})();
