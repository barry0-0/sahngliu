/**
 * 产品经理专属交互式 PRD 打点与规格可视化系统 (In-situ PRD Writer & Document Inspector V3)
 * 特性：
 * 1. 左上角极小化悬浮球 (32x32px)，移入平滑展开工具栏，完全不遮挡顶部操作
 * 2. 元素精确定位系统 (先平滑滚动居中，待布局稳定后精确计算高亮与标点)
 * 3. 页面专属可视化文档式 PRD 查看大屏 (带大纲导航、卡片流式展示，非表格)
 * 4. 移除紧急程度/优先级字段，聚焦核心业务规约
 * 5. 导入/导出 JS 与 Markdown，导入支持【覆盖】或【新增追加】，全自动绑定元素
 * 6. 支持需求点上下自定义重排与模块筛选，页面内自动重新递增编号
 * 7. 大尺寸、可自由拖拽移动、支持最小化暂存草稿的 Markdown 高级编辑器
 * 8. 本地连接状态自动静默检测与多通道实时落盘
 */

(function() {
  // 当前页面标识
  const pageKey = window.location.pathname.split('/').pop() || 'admin.html';
  
  const PAGE_TITLES = {
    'admin.html': '平台运营端后台',
    'mall.html': 'PC 商城端',
    'merchant.html': '商家端后台',
    'h5.html': '买家移动端 H5',
    'merchant-h5.html': '商家移动端 H5'
  };
  const currentPageTitle = PAGE_TITLES[pageKey] || pageKey;
  const PRD_CACHE_VERSION = 'full-spec-v7';

  // 数据源加载：以代码内挂载的 window.INITIAL_PRD_DATA 为准
  const presets = window.INITIAL_PRD_DATA || [];
  let savedPins = JSON.parse(JSON.stringify(presets));

  try {
    const cacheKey = `prd_pins_${pageKey}`;
    const cacheVersionKey = `${cacheKey}_version`;
    if (localStorage.getItem(cacheVersionKey) !== PRD_CACHE_VERSION) {
      localStorage.removeItem(cacheKey);
      localStorage.setItem(cacheVersionKey, PRD_CACHE_VERSION);
    } else {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length >= presets.length) {
          savedPins = parsed;
        }
      }
    }
  } catch (e) {}

  function reIndexPins(pins) {
    pins.forEach((pin, index) => {
      pin.id = index + 1;
      pin.pageKey = pageKey;
      pin.pageTitle = currentPageTitle;
      pin.type = pin.type || '业务规则';
    });
  }
  reIndexPins(savedPins);

  // 全局状态
  let currentMode = 'hide'; // 'hide' | 'show' | 'edit'
  let editingPinId = null;
  let activeDraft = null; // 暂存草稿对象
  let isEditorMinimized = false;
  let highlightedElement = null;
  let rePickModeActive = false;
  let searchKeyword = '';
  let serverConnected = false;
  let dirHandle = null;

  // 1. 静默检测本地 Node/Python 服务
  (async function checkServerConnection() {
    try {
      const resp = await fetch('/api/get-all-prd');
      if (resp.ok) {
        serverConnected = true;
      }
    } catch (e) {
      serverConnected = false;
    }
  })();

  // 2. 注入全局高品质样式
  const style = document.createElement('style');
  style.id = 'prd-tool-styles-v3';
  style.textContent = `
    :root {
      --prd-primary: #2563eb;
      --prd-primary-hover: #1d4ed8;
      --prd-bg-panel: rgba(255, 255, 255, 0.98);
      --prd-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }

    /* ================== 1. 右上角收起状态 PRD 查看按钮（鼠标移入滑出） ================== */
    .prd-top-doc-wrapper {
      position: fixed;
      top: 14px;
      right: 0;
      z-index: 1000020;
      display: flex;
      align-items: center;
      font-family: var(--prd-font);
      pointer-events: auto;
      transform: translateX(calc(100% - 36px));
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s;
    }

    .prd-top-doc-wrapper:hover {
      transform: translateX(-12px);
    }

    .prd-top-doc-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 34px;
      padding: 0 16px 0 10px;
      border-radius: 18px 0 0 18px;
      background: linear-gradient(135deg, #0f172a, #1e293b);
      color: #ffffff;
      font-size: 12px;
      font-weight: 700;
      border: 1px solid rgba(59, 130, 246, 0.4);
      border-right: none;
      box-shadow: -4px 4px 14px rgba(0, 0, 0, 0.25);
      cursor: pointer;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      outline: none;
      white-space: nowrap;
    }

    .prd-top-doc-wrapper:hover .prd-top-doc-btn {
      background: #0284c7;
      border-color: #38bdf8;
      box-shadow: -6px 6px 20px rgba(2, 132, 199, 0.45);
      border-radius: 18px;
    }

    .prd-top-doc-tooltip {
      position: absolute;
      top: 40px;
      right: 12px;
      background: #0f172a;
      color: #e2e8f0;
      font-size: 11.5px;
      padding: 6px 12px;
      border-radius: 6px;
      white-space: nowrap;
      box-shadow: 0 10px 25px rgba(0,0,0,0.35);
      pointer-events: none;
      opacity: 0;
      transform: translateY(-4px);
      transition: all 0.2s ease;
      border: 1px solid rgba(255,255,255,0.12);
      z-index: 1000021;
    }

    .prd-top-doc-wrapper:hover .prd-top-doc-tooltip {
      opacity: 1;
      transform: translateY(0);
    }

    /* ================== 2. 右侧边缘快捷展开箭头 Tab ================== */
    .prd-drawer-edge-tab {
      position: fixed;
      right: 0;
      top: 140px;
      z-index: 1000009;
      background: linear-gradient(180deg, #1e293b, #0f172a);
      color: #ffffff;
      padding: 12px 6px 12px 8px;
      border-radius: 12px 0 0 12px;
      box-shadow: -4px 4px 16px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1);
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      font-family: var(--prd-font);
      user-select: none;
      transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .prd-drawer-edge-tab:hover {
      background: #2563eb;
      padding-left: 12px;
      box-shadow: -6px 6px 20px rgba(37, 99, 235, 0.4);
    }

    .prd-edge-arrow {
      font-size: 16px;
      font-weight: 800;
      line-height: 1;
      color: #38bdf8;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .prd-edge-text {
      writing-mode: vertical-rl;
      text-orientation: mixed;
      font-size: 11.5px;
      font-weight: 700;
      letter-spacing: 2px;
      color: #e2e8f0;
    }

    /* 抽屉左边缘收起箭头按钮 */
    .prd-drawer-left-arrow {
      position: absolute;
      left: -28px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 64px;
      background: linear-gradient(180deg, #1e293b, #0f172a);
      color: #38bdf8;
      border-radius: 8px 0 0 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 20px;
      font-weight: 800;
      box-shadow: -4px 4px 14px rgba(0, 0, 0, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-right: none;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 1000012;
      user-select: none;
    }
    .prd-drawer-left-arrow:hover {
      background: #2563eb;
      color: #ffffff;
      width: 32px;
      left: -32px;
    }

    /* ================== 3. 右侧需求卡片抽屉 ================== */
    .prd-right-drawer {
      position: fixed;
      top: 16px;
      right: 16px;
      bottom: 16px;
      width: 370px;
      z-index: 1000010;
      background: var(--prd-bg-panel);
      backdrop-filter: blur(16px);
      border-radius: 12px;
      box-shadow: 0 20px 40px -15px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(15, 23, 42, 0.08);
      border: 1px solid rgba(226, 232, 240, 0.9);
      font-family: var(--prd-font);
      display: flex;
      flex-direction: column;
      transform: translateX(430px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      color: #1e293b;
      overflow: visible;
    }

    .prd-right-drawer.open {
      transform: translateX(0);
      opacity: 1;
      pointer-events: auto;
    }

    .prd-drawer-header {
      padding: 12px 14px;
      background: #ffffff;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .prd-drawer-filter-bar {
      padding: 8px 14px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      gap: 6px;
      align-items: center;
    }

    .prd-filter-select {
      flex: 1;
      padding: 4px 8px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 11px;
      color: #334155;
      background: #fff;
      outline: none;
    }

    .prd-drawer-body {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: #f8fafc;
    }

    .prd-card-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 12px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      gap: 6px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }
    .prd-card-item:hover {
      border-color: var(--prd-primary);
      box-shadow: 0 4px 10px rgba(37, 99, 235, 0.08);
      transform: translateY(-1px);
    }

    .prd-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .prd-num-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .prd-pin-num-pill {
      background: #ef4444;
      color: #ffffff;
      font-size: 11px;
      font-weight: 800;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .prd-tag {
      font-size: 10px;
      font-weight: 600;
      padding: 2px 6px;
      border-radius: 4px;
      line-height: 1.2;
    }
    .prd-tag-type { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
    .prd-tag-module { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }

    .prd-card-desc {
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
      max-height: 50px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .prd-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid #f1f5f9;
      padding-top: 6px;
      margin-top: 2px;
      font-size: 11px;
    }

    .prd-btn-action {
      background: none;
      border: none;
      color: #64748b;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      padding: 2px 6px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 2px;
      transition: all 0.15s;
    }
    .prd-btn-action:hover {
      background: #f1f5f9;
      color: var(--prd-primary);
    }
    .prd-btn-action.btn-danger:hover {
      background: #fee2e2;
      color: #dc2626;
    }

    .prd-drawer-footer {
      padding: 10px 14px;
      background: #ffffff;
      border-top: 1px solid #e2e8f0;
      display: flex;
      gap: 8px;
    }

    .prd-btn-primary {
      flex: 1;
      background: var(--prd-primary);
      color: white;
      border: none;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      transition: all 0.2s;
    }
    .prd-btn-primary:hover {
      background: var(--prd-primary-hover);
    }

    /* ================== 3. 大头针徽标与高亮框 (精确定位) ================== */
    .prd-pin-marker {
      position: fixed;
      width: 24px;
      height: 24px;
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: #ffffff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 11px;
      font-family: var(--prd-font);
      box-shadow: 0 4px 8px rgba(239, 68, 68, 0.4), 0 0 0 2px #ffffff;
      cursor: pointer;
      z-index: 1000015;
      transform: translate(-50%, -50%);
      transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
      pointer-events: auto;
      user-select: none;
    }
    .prd-pin-marker:hover {
      transform: translate(-50%, -50%) scale(1.25);
      background: #2563eb;
    }
    .prd-pin-marker.highlighted {
      transform: translate(-50%, -50%) scale(1.35);
      background: #2563eb !important;
      box-shadow: 0 0 0 6px rgba(37, 99, 235, 0.35), 0 4px 12px rgba(37, 99, 235, 0.5) !important;
    }

    /* 准确定位高亮外框 */
    .prd-target-glow-box {
      position: fixed;
      pointer-events: none;
      z-index: 1000014;
      border: 3px solid #2563eb;
      box-shadow: 0 0 20px rgba(37, 99, 235, 0.8), inset 0 0 10px rgba(37, 99, 235, 0.15);
      border-radius: 6px;
      transition: all 0.2s ease;
    }

    .prd-pick-hover-outline {
      outline: 2px dashed #2563eb !important;
      outline-offset: 2px !important;
      cursor: crosshair !important;
    }

    /* ================== 4. 大尺寸可自由缩放 Markdown 可视化工作台编辑器 ================== */
    .prd-editor-modal {
      position: fixed;
      width: 860px;
      height: 680px;
      top: calc(50% - 340px);
      left: calc(50% - 430px);
      min-width: 580px;
      min-height: 460px;
      max-width: 96vw;
      max-height: 96vh;
      z-index: 1000030;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(0, 0, 0, 0.12);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      resize: both;
      box-sizing: border-box;
      font-family: var(--prd-font);
      animation: prd-zoom-in 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    @keyframes prd-zoom-in {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    .prd-editor-header {
      padding: 10px 16px;
      background: #0f172a;
      color: #ffffff;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    .prd-editor-header:active {
      cursor: grabbing;
    }

    .prd-editor-body {
      flex: 1;
      padding: 14px 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      overflow: hidden;
      background: #ffffff;
    }

    .prd-editor-workbench {
      flex: 1;
      display: flex;
      gap: 12px;
      overflow: hidden;
      min-height: 240px;
    }

    .prd-editor-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: #ffffff;
    }

    .prd-editor-pane.pane-preview {
      background: #fcfdfe;
      border-color: #e2e8f0;
    }

    .prd-editor-pane-header {
      padding: 6px 12px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11.5px;
      font-weight: 700;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
    }

    .prd-editor-preview {
      flex: 1;
      overflow-y: auto;
      padding: 14px 16px;
      font-size: 13px;
      line-height: 1.6;
    }

    .prd-md-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      background: #f8fafc;
      padding: 6px 8px;
      border-bottom: 1px solid #e2e8f0;
      align-items: center;
      flex-shrink: 0;
    }

    .prd-md-tool-btn {
      background: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 3px 7px;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 3px;
      transition: all 0.15s;
    }
    .prd-md-tool-btn:hover {
      background: #eff6ff;
      border-color: #3b82f6;
      color: var(--prd-primary);
    }

    .prd-tool-select {
      padding: 3px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 11px;
      color: #334155;
      background: #fff;
      outline: none;
      cursor: pointer;
    }

    .prd-mermaid-block {
      background: #ffffff;
      padding: 16px;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      margin: 12px 0;
      overflow-x: auto;
      text-align: center;
    }

    /* 最小化悬浮草稿胶囊 */
    .prd-minimized-capsule {
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 1000030;
      background: #0f172a;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 30px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--prd-font);
      font-size: 12px;
      font-weight: 600;
      animation: prd-bounce-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .prd-minimized-capsule:hover {
      background: #1e293b;
      transform: translateY(-2px);
    }

    @keyframes prd-bounce-in {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* ================== 5. 当前页面 PRD 可视化 Markdown 文档大屏 ================== */
    .prd-doc-overlay {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.65);
      backdrop-filter: blur(10px);
      z-index: 1000040;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      box-sizing: border-box;
      animation: prd-fade-in 0.2s ease;
    }

    @keyframes prd-fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .prd-doc-container {
      width: 1180px;
      max-width: 95vw;
      height: 90vh;
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.35);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      font-family: var(--prd-font);
    }

    .prd-doc-header {
      padding: 14px 24px;
      background: #ffffff;
      border-bottom: 1px solid #f1f5f9;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      z-index: 10;
    }

    .prd-doc-content-layout {
      flex: 1;
      display: flex;
      overflow: hidden;
      background: #ffffff;
    }

    .prd-doc-toc {
      width: 250px;
      background: #fafbfc;
      border-right: 1px solid #f1f5f9;
      padding: 16px 12px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex-shrink: 0;
    }

    .prd-toc-title {
      font-size: 11.5px;
      font-weight: 700;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 8px 8px 8px;
      margin-bottom: 4px;
      border-bottom: 1px dashed #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .prd-toc-item {
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12.5px;
      color: #475569;
      cursor: pointer;
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
      line-height: 1.4;
      text-decoration: none;
    }
    .prd-toc-item:hover {
      background: #f1f5f9;
      color: #0f172a;
    }
    .prd-toc-item.active {
      background: #eff6ff;
      color: var(--prd-primary);
      font-weight: 600;
    }
    .prd-toc-num {
      color: #94a3b8;
      font-size: 11.5px;
      font-weight: 600;
      flex-shrink: 0;
    }
    .prd-toc-item.active .prd-toc-num {
      color: var(--prd-primary);
    }
    .prd-toc-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .prd-doc-main-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 32px 48px;
      display: flex;
      justify-content: center;
      scroll-behavior: smooth;
      background: #ffffff;
    }

    .prd-doc-paper {
      width: 100%;
      max-width: 860px;
      background: transparent;
      box-sizing: border-box;
      min-height: 100%;
    }

    .prd-doc-hero {
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #f1f5f9;
    }

    .prd-doc-hero-title {
      font-size: 22px;
      font-weight: 800;
      color: #0f172a;
      line-height: 1.3;
      margin: 0 0 10px 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .prd-doc-hero-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      font-size: 12px;
      color: #64748b;
      line-height: 1.5;
    }

    .prd-doc-hero-meta code {
      background: #f1f5f9;
      color: #0f172a;
      padding: 1px 5px;
      border-radius: 3px;
      font-family: monospace;
      font-size: 11.5px;
    }

    /* 连续正文篇章 (无独立分割大卡片) */
    .prd-doc-article-section {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid #f8fafc;
      scroll-margin-top: 20px;
    }

    .prd-doc-article-section:first-of-type {
      margin-top: 0;
      padding-top: 0;
      border-top: none;
    }

    .prd-doc-sec-heading {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 12px 0;
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
      line-height: 1.4;
    }

    .prd-doc-heading-title {
      color: #0f172a;
    }

    .prd-doc-heading-type {
      font-size: 12px;
      font-weight: normal;
      color: #94a3b8;
      margin-left: 2px;
    }

    .prd-doc-anchor-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 11.5px;
      color: #64748b;
      cursor: pointer;
      margin-left: auto;
      text-decoration: none;
      transition: color 0.15s ease;
    }
    .prd-doc-anchor-link:hover {
      color: var(--prd-primary);
    }
    .prd-doc-anchor-link code {
      background: #f1f5f9;
      color: #64748b;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 11.5px;
      transition: all 0.15s ease;
    }
    .prd-doc-anchor-link:hover code {
      background: #eff6ff;
      color: var(--prd-primary);
    }
    .prd-doc-anchor-icon {
      font-size: 11px;
      color: var(--prd-primary);
      opacity: 0.8;
    }

    /* Markdown 纯正文档排版 */
    .prd-md-doc {
      font-size: 14px;
      line-height: 1.75;
      color: #334155;
    }
    .prd-md-doc p {
      margin: 8px 0;
    }
    .prd-md-doc h3, .prd-md-doc h4, .prd-md-doc h5, .prd-md-doc h6 {
      color: #0f172a;
      font-weight: 700;
      margin: 16px 0 8px 0;
    }
    .prd-md-doc h3 {
      font-size: 15px;
    }
    .prd-md-doc h4 {
      font-size: 14px;
    }
    .prd-md-doc h5 {
      font-size: 13.5px;
    }
    .prd-md-doc ul, .prd-md-doc ol {
      margin: 6px 0 10px 0;
      padding-left: 20px;
    }
    .prd-md-doc li {
      margin-bottom: 3px;
      color: #334155;
    }
    .prd-md-doc blockquote {
      margin: 10px 0;
      padding: 8px 14px;
      background: #f8fafc;
      border-left: 3px solid #3b82f6;
      border-radius: 0 6px 6px 0;
      color: #475569;
      font-size: 13px;
    }
    .prd-md-doc strong {
      font-weight: 700;
      color: #0f172a;
    }
    .prd-md-doc code {
      background: #f1f5f9;
      color: #ef4444;
      padding: 1px 4px;
      border-radius: 3px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12.5px;
    }
    .prd-md-doc pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 12px 16px;
      border-radius: 6px;
      font-family: monospace;
      font-size: 12.5px;
      overflow-x: auto;
      margin: 12px 0;
      line-height: 1.5;
    }
    .prd-md-doc pre code {
      background: transparent;
      color: inherit;
      padding: 0;
    }
    .prd-table-responsive {
      width: 100%;
      overflow-x: auto;
      margin: 12px 0;
    }
    .prd-md-doc table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13px;
    }
    .prd-md-doc th {
      background: #f8fafc;
      color: #0f172a;
      font-weight: 600;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      text-align: left;
    }
    .prd-md-doc td {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    .prd-md-doc tr:nth-child(even) td {
      background: #fcfdfe;
    }

    /* 悬浮 Popover 气泡 (支持自由拉大放小与拖拽) */
    .prd-inspect-bubble {
      position: fixed;
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 15px 35px -5px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.9);
      padding: 14px 16px;
      width: 400px;
      min-width: 280px;
      min-height: 200px;
      max-width: 85vw;
      max-height: 85vh;
      z-index: 1000018;
      font-family: var(--prd-font);
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: #1e293b;
      resize: both;
      overflow: hidden;
      box-sizing: border-box;
    }

    .prd-inspect-bubble-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #f1f5f9;
      padding-bottom: 6px;
      cursor: grab;
      user-select: none;
      flex-shrink: 0;
    }
    .prd-inspect-bubble-header:active {
      cursor: grabbing;
    }
  `;
  document.head.appendChild(style);

  // 3. 增强型 Markdown 转换器 (支持 Mermaid 图表与可视化表格)
  function loadMermaidEngine() {
    if (!window.mermaid) {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
      s.onload = () => {
        try {
          window.mermaid.initialize({
            startOnLoad: false,
            theme: 'default',
            securityLevel: 'loose',
            flowchart: { useMaxWidth: true, htmlLabels: true, curve: 'basis' }
          });
          window.renderMermaidInDom && window.renderMermaidInDom(document);
        } catch (e) {}
      };
      document.head.appendChild(s);
    }
  }
  loadMermaidEngine();

  window.renderMermaidInDom = async function(container) {
    if (!container) return;
    const nodes = container.querySelectorAll('.mermaid:not([data-processed="true"])');
    if (nodes.length === 0) return;
    if (window.mermaid && typeof window.mermaid.run === 'function') {
      try {
        await window.mermaid.run({ nodes: Array.from(nodes) });
      } catch (err) {
        console.warn('[PRD Mermaid Render]:', err);
      }
    }
  };

  function parseMarkdown(md) {
    if (!md) return '';
    let text = md.trim();

    // 1. 提取并保护代码块与 Mermaid 流程图
    const codeBlocks = [];
    text = text.replace(/```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g, (m, lang, code) => {
      const idx = codeBlocks.length;
      if (lang === 'mermaid') {
        codeBlocks.push(`<div class="prd-mermaid-block"><pre class="mermaid">${code.trim()}</pre></div>`);
      } else {
        const safe = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        codeBlocks.push(`<pre class="prd-code-block" data-lang="${lang || ''}"><code>${safe}</code></pre>`);
      }
      return `\n__PRD_CODE_BLOCK_${idx}__\n`;
    });

    // 2. 提取并保护行内代码
    const inlineCodes = [];
    text = text.replace(/`([^`\n]+)`/g, (m, code) => {
      const idx = inlineCodes.length;
      const safe = code.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
      inlineCodes.push(`<code>${safe}</code>`);
      return `__PRD_INLINE_CODE_${idx}__`;
    });

    // 3. 按行解析 Markdown
    const rawLines = text.split('\n');
    const outLines = [];
    let inList = false;
    let listType = 'ul';
    let inTable = false;
    let tableRows = [];
    let inQuote = false;
    let quoteLines = [];

    function flushTable() {
      if (!inTable || tableRows.length === 0) return;
      let tblHtml = '<div class="prd-table-responsive"><table>';
      if (tableRows.length >= 2 && tableRows[1].every(c => /^[-:\s]+$/.test(c))) {
        tblHtml += '<thead><tr>';
        tableRows[0].forEach(c => { tblHtml += `<th>${formatInline(c.trim())}</th>`; });
        tblHtml += '</tr></thead><tbody>';
        for (let r = 2; r < tableRows.length; r++) {
          tblHtml += '<tr>';
          tableRows[r].forEach(c => { tblHtml += `<td>${formatInline(c.trim())}</td>`; });
          tblHtml += '</tr>';
        }
        tblHtml += '</tbody>';
      } else {
        tblHtml += '<tbody>';
        for (let r = 0; r < tableRows.length; r++) {
          tblHtml += '<tr>';
          tableRows[r].forEach(c => { tblHtml += `<td>${formatInline(c.trim())}</td>`; });
          tblHtml += '</tr>';
        }
        tblHtml += '</tbody>';
      }
      tblHtml += '</table></div>';
      outLines.push(tblHtml);
      tableRows = [];
      inTable = false;
    }

    function flushQuote() {
      if (!inQuote || quoteLines.length === 0) return;
      outLines.push(`<blockquote>${quoteLines.map(l => formatInline(l)).join('<br>')}</blockquote>`);
      quoteLines = [];
      inQuote = false;
    }

    function flushList() {
      if (!inList) return;
      outLines.push(`</${listType}>`);
      inList = false;
    }

    function formatInline(str) {
      if (!str) return '';
      let s = str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      
      // 还原保护的占位符
      s = s.replace(/__PRD_INLINE_CODE_(\d+)__/g, (m, id) => inlineCodes[id] || '');
      s = s.replace(/__PRD_CODE_BLOCK_(\d+)__/g, (m, id) => codeBlocks[id] || '');

      // 粗体、斜体、删除线、链接
      s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
      s = s.replace(/\*([^*]+)\*/g, '<em>$1</em>');
      s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
      s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
      return s;
    }

    for (let i = 0; i < rawLines.length; i++) {
      let line = rawLines[i];
      let trimmed = line.trim();

      // 占位符直接输出
      if (/^__PRD_CODE_BLOCK_\d+__$/.test(trimmed)) {
        flushTable(); flushQuote(); flushList();
        outLines.push(trimmed);
        continue;
      }

      // 表格处理
      if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.length > 2) {
        flushQuote(); flushList();
        inTable = true;
        const cells = trimmed.slice(1, -1).split('|');
        tableRows.push(cells);
        continue;
      } else {
        if (inTable) flushTable();
      }

      // 引用处理
      if (trimmed.startsWith('>')) {
        flushTable(); flushList();
        inQuote = true;
        quoteLines.push(trimmed.replace(/^>\s?/, ''));
        continue;
      } else {
        if (inQuote) flushQuote();
      }

      // 标题处理
      if (/^#{1,6}\s+/.test(trimmed)) {
        flushTable(); flushQuote(); flushList();
        const level = trimmed.match(/^(#{1,6})/)[0].length;
        const titleText = trimmed.replace(/^#{1,6}\s+/, '');
        outLines.push(`<h${Math.min(level + 2, 6)}>${formatInline(titleText)}</h${Math.min(level + 2, 6)}>`);
        continue;
      }

      // 分割线
      if (/^(\*\*\*|---|___)$/.test(trimmed)) {
        flushTable(); flushQuote(); flushList();
        outLines.push('<hr style="border:none; border-top:1px solid #e2e8f0; margin:16px 0;">');
        continue;
      }

      // 无序列表
      if (/^[-*+]\s+/.test(trimmed)) {
        flushTable(); flushQuote();
        const content = trimmed.replace(/^[-*+]\s+/, '');
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
          outLines.push('<ul class="prd-md-list">');
        }
        outLines.push(`<li>${formatInline(content)}</li>`);
        continue;
      }

      // 有序列表
      if (/^\d+\.\s+/.test(trimmed)) {
        flushTable(); flushQuote();
        const content = trimmed.replace(/^\d+\.\s+/, '');
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
          outLines.push('<ol class="prd-md-list">');
        }
        outLines.push(`<li>${formatInline(content)}</li>`);
        continue;
      }

      // 普通段落或空行
      flushTable(); flushQuote(); flushList();
      if (trimmed === '') {
        continue;
      } else {
        outLines.push(`<p>${formatInline(trimmed)}</p>`);
      }
    }

    flushTable(); flushQuote(); flushList();

    let finalHtml = outLines.join('\n');
    finalHtml = finalHtml.replace(/__PRD_CODE_BLOCK_(\d+)__/g, (m, id) => codeBlocks[id] || '');
    finalHtml = finalHtml.replace(/__PRD_INLINE_CODE_(\d+)__/g, (m, id) => inlineCodes[id] || '');

    return finalHtml;
  }

  function showToast(msg, type = 'info') {
    if (window.UI && typeof window.UI.toast === 'function') {
      window.UI.toast(msg, type);
    } else {
      console.log(`[PRD Tool]: ${msg}`);
    }
  }

  // 4. 数据持久化保存：必须真正写入本地 JS 文件才算成功，否则直接返回 false 并提示保存失败
  async function persistData() {
    reIndexPins(savedPins);

    // 无论如何先确保内存与本地缓存即刻更新
    try {
      localStorage.setItem(`prd_pins_${pageKey}`, JSON.stringify(savedPins));
      localStorage.setItem(`prd_pins_${pageKey}_version`, PRD_CACHE_VERSION);
      window.INITIAL_PRD_DATA = savedPins;
    } catch (e) {}

    // 优先通过本地服务写入真实磁盘文件
    try {
      const resp = await fetch('/api/save-prd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageKey, data: savedPins })
      });
      if (resp.ok) {
        const resJson = await resp.json();
        if (resJson && resJson.success) {
          return true;
        }
      }
    } catch (e) {}

    // File System API 降级尝试
    if (dirHandle) {
      try {
        let jsDir = await dirHandle.getDirectoryHandle('assets', { create: false });
        jsDir = await jsDir.getDirectoryHandle('js', { create: false });
        const fileName = `prd-data-${pageKey.replace('.html', '')}.js`;
        const fileHandle = await jsDir.getFileHandle(fileName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(`window.INITIAL_PRD_DATA = ${JSON.stringify(savedPins, null, 2)};\n`);
        await writable.close();
        return true;
      } catch (err) {}
    }

    // 若无法真正写入磁盘文件，返回 false
    return false;
  }

  // 5. 元素可见性与弹窗感知检测
  function isElementVisibleOnScreen(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return false;

    let cur = el;
    while (cur && cur !== document.body && cur !== document.documentElement) {
      const style = window.getComputedStyle(cur);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return false;
      }
      if (cur.classList.contains('modal-overlay') || cur.classList.contains('modal-backdrop') || cur.id.startsWith('modal-') || cur.id.startsWith('sheet-h5-')) {
        if (!cur.classList.contains('active') && style.display === 'none') {
          return false;
        }
      }
      cur = cur.parentElement;
    }
    return true;
  }

  function getElementSelector(el) {
    if (!(el instanceof Element)) return '';
    if (el.id) return `#${el.id}`;
    if (el.getAttribute('data-target')) return `[data-target='${el.getAttribute('data-target')}']`;
    if (el.getAttribute('data-page')) return `[data-page='${el.getAttribute('data-page')}']`;

    const path = [];
    let cur = el;
    while (cur && cur.nodeType === Node.ELEMENT_NODE && cur !== document.body && cur !== document.documentElement) {
      if (cur.id) {
        path.unshift(`#${cur.id}`);
        break;
      }
      let sib = cur;
      let nth = 1;
      while (sib = sib.previousElementSibling) {
        if (sib.nodeName === cur.nodeName) nth++;
      }
      const nodeName = cur.nodeName.toLowerCase();
      path.unshift(`${nodeName}:nth-of-type(${nth})`);
      cur = cur.parentNode;
    }
    return path.join(' > ');
  }

  // 6. 大头针徽标渲染
  const pinsOverlay = document.createElement('div');
  pinsOverlay.id = 'prd-pins-overlay';
  pinsOverlay.style.cssText = 'position: fixed; inset: 0; pointer-events: none; z-index: 1000015;';
  document.body.appendChild(pinsOverlay);

  function renderPinMarkers() {
    pinsOverlay.innerHTML = '';
    if (currentMode === 'hide') return;

    savedPins.forEach((pin, index) => {
      if (searchKeyword && !pin.title.toLowerCase().includes(searchKeyword) && !pin.desc.toLowerCase().includes(searchKeyword)) return;
      if (!pin.selector || typeof pin.selector !== 'string' || !pin.selector.trim()) return;

      let el = null;
      try {
        el = document.querySelector(pin.selector);
      } catch (e) {
        return;
      }
      if (!el) return;

      // 若目标为弹窗外层 overlay，智能吸附至弹窗内部对话框卡片
      let targetEl = el;
      if (targetEl.classList.contains('modal-overlay') || (targetEl.id && (targetEl.id.startsWith('modal-') || targetEl.id.startsWith('sheet-')))) {
        const innerCard = targetEl.querySelector('.modal, .modal-dialog, .bottom-sheet, .modal-body, .sheet-body, .h5-card') || targetEl.firstElementChild;
        if (innerCard) targetEl = innerCard;
      }

      if (!isElementVisibleOnScreen(targetEl)) return;

      const rect = targetEl.getBoundingClientRect();
      const marker = document.createElement('div');
      marker.className = `prd-pin-marker pin-id-${pin.id}`;
      marker.innerText = pin.id;
      marker.title = pin.title || '需求点';

      // 精确放置在元素左上方内侧
      marker.style.top = `${rect.top + 8}px`;
      marker.style.left = `${rect.left + 8}px`;

      marker.addEventListener('click', (e) => {
        e.stopPropagation();
        showInspectBubble(pin, marker);
      });

      pinsOverlay.appendChild(marker);
    });

    const badge = document.getElementById('prd-drawer-count');
    if (badge) badge.innerText = savedPins.length;
  }

  // 7. 悬浮详情气泡 (可自由拖拽、支持拉大放小)
  let activeBubble = null;
  function showInspectBubble(pin, anchor) {
    if (activeBubble) activeBubble.remove();

    const bubble = document.createElement('div');
    bubble.className = 'prd-inspect-bubble';
    bubble.id = 'prd-inspect-popover';

    bubble.innerHTML = `
      <div class="prd-inspect-bubble-header">
        <div style="display:flex; align-items:center; gap:6px; flex:1; overflow:hidden;">
          <span class="prd-pin-num-pill">${pin.id}</span>
          <strong style="font-size:13px; color:#0f172a; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${escapeHtml(pin.title || '（未命名需求）')}</strong>
        </div>
        <div style="display:flex; align-items:center; gap:6px; flex-shrink:0;">
          <span style="font-size:10px; color:#94a3b8;">按住头部拖动 / 右下角拉伸</span>
          <button style="background:none; border:none; font-size:18px; color:#94a3b8; cursor:pointer;" onclick="window.closeInspectBubble()">&times;</button>
        </div>
      </div>
      <div style="display:flex; gap:6px; align-items:center; flex-wrap:wrap;">
        <span class="prd-tag prd-tag-type">${escapeHtml(pin.type || '业务规则')}</span>
        ${pin.selector ? `<code style="font-size:11px; background:#f1f5f9; color:#64748b; padding:1px 6px; border-radius:3px;">${escapeHtml(pin.selector)}</code>` : ''}
      </div>
      <div class="prd-md-rendered" style="flex:1; overflow-y:auto; min-height:120px; font-size:13px; line-height:1.6; padding-right:4px;">
        ${parseMarkdown(pin.desc) || '<p style="color:#94a3b8; font-style:italic;">暂无详细描述</p>'}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #f1f5f9; padding-top:6px; margin-top:2px; flex-shrink:0;">
        <span style="font-size:10px; color:#94a3b8;">${escapeHtml(pin.pageTitle || pageKey)}</span>
        <button class="prd-btn-action" style="color:var(--prd-primary);" onclick="window.openEditorForPin(${pin.id})">✏️ 编辑需求</button>
      </div>
    `;

    document.body.appendChild(bubble);
    activeBubble = bubble;

    // 绑定拖拽
    const headerHandle = bubble.querySelector('.prd-inspect-bubble-header');
    if (headerHandle) initDraggable(bubble, headerHandle);

    const rect = anchor.getBoundingClientRect();
    let popLeft = rect.left - 140;
    let popTop = rect.bottom + 12;

    if (popLeft < 10) popLeft = 10;
    if (popLeft + 410 > window.innerWidth) popLeft = window.innerWidth - 410;
    if (popTop + 260 > window.innerHeight) popTop = rect.top - 260;
    if (popTop < 10) popTop = 10;

    bubble.style.left = `${popLeft}px`;
    bubble.style.top = `${popTop}px`;

    setTimeout(() => {
      document.addEventListener('click', handleBubbleOutsideClick);
    }, 100);
  }

  window.closeInspectBubble = function() {
    if (activeBubble) {
      activeBubble.remove();
      activeBubble = null;
      document.removeEventListener('click', handleBubbleOutsideClick);
    }
  };

  function handleBubbleOutsideClick(e) {
    if (activeBubble && !activeBubble.contains(e.target) && !e.target.classList.contains('prd-pin-marker')) {
      window.closeInspectBubble();
    }
  }

  // 8. 智能弹窗数据初始化与多端页面联动分发器
  function triggerModalWithData(modalId, pin) {
    if (!modalId) return;

    // 8.1 智能页面 / Tab 导航切换
    const pageTabMap = {
      'modal-audit-shop': 'tab-merchant-shop',
      'modal-suspend-shop': 'tab-merchant-shop',
      'modal-add-category': 'tab-prod-base',
      'modal-audit-product': 'tab-prod-merchant',
      'modal-edit-product': 'tab-prod-merchant',
      'modal-audit-demand': 'page-demands',
      'modal-demand-quotes': 'page-demands',
      'modal-audit-bidres': 'tab-bidding-res',
      'modal-audit-bidding-ann': 'tab-bidding-ann',
      'modal-admin-bid-detail': 'tab-bidding-ann',
      'modal-admin-contract-audit': 'tab-trades-order',
      'modal-admin-payment-audit': 'tab-trades-order',
      'modal-add-commission': 'tab-config-commission',
      'modal-customer-detail': 'page-customers',
      'modal-audit-merchant': 'page-customers',
      'modal-add-product': 'page-prod-all',
      'modal-add-listed-product': 'page-prod-listed',
      'modal-order-detail': 'page-orders',
      'modal-ship': 'page-orders',
      'modal-invoice-process': 'page-orders',
      'merchant-invoice-modal-overlay': 'page-orders',
      'modal-add-res': 'page-bidding-res',
      'modal-add-ann': 'page-bidding-ann',
      'modal-bid-award': 'page-bidding-ann',
      'modal-product-detail': 'mall-spot',
      'modal-bidding-detail': 'mall-bid',
      'modal-publish-demand': 'mall-demand',
      'modal-quote': 'mall-demand',
      'modal-demand-quotes': 'mall-demand',
      'modal-demand-quotes-runtime': 'mall-demand',
      'modal-buyer-payment': 'uc-orders',
      'modal-payment': 'uc-orders',
      'modal-contract-signing': 'uc-orders',
      'modal-contract-sign': 'uc-orders',
      'modal-apply-invoice': 'uc-invoices',
      'modal-invoice': 'uc-invoices',
      'modal-invoice-preview': 'uc-invoices',
      'modal-view-invoice': 'uc-invoices',
      'sheet-h5-product-detail': 'view-home',
      'sheet-h5-bid-detail': 'view-bid',
      'sheet-h5-publish-demand': 'view-demand',
      'sheet-h5-quote': 'view-demand',
      'sheet-h5-contract': 'view-uc-orders',
      'sheet-h5-apply-invoice': 'view-uc-invoices',
      'modal-mh5-edit-shop': 'view-shop',
      'modal-mh5-add-shelf-ann': 'view-products',
      'modal-mh5-ship': 'view-orders',
      'modal-mh5-add-res': 'view-bidding',
      'modal-mh5-add-ann': 'view-bidding'
    };

    const targetPage = pageTabMap[modalId];
    if (targetPage) {
      const pageNav = document.querySelector(`[data-page="${targetPage}"], .sidebar-menu-item[data-target="${targetPage}"], .nav-item[data-target="${targetPage}"]`);
      if (pageNav) pageNav.click();

      const mallNav = document.querySelector(`.mall-nav-item[data-target="${targetPage}"]`);
      if (mallNav) mallNav.click();

      const ucTab = document.querySelector(`#uc-menu .uc-menu-item[data-target="${targetPage}"]`);
      if (ucTab) ucTab.click();

      if (window.H5App && typeof window.H5App.switchH5View === 'function') {
        window.H5App.switchH5View(targetPage);
      }
    }

    // 动态提取 MockData 实体 ID
    const MD = window.MockData || {};
    const sampleShopId = (MD.shops && MD.shops.find(s => s.status === '待审核')?.id) || (MD.shops && MD.shops[0]?.id) || '10001';
    const sampleSuspendShopId = (MD.shops && MD.shops.find(s => s.status === '正常营业')?.id) || '10001';
    const sampleProdId = (MD.products && MD.products[0]?.id) || 1;
    const sampleDemandId = (MD.demands && MD.demands[0]?.id) || 1;
    const sampleOrderId = (MD.orders && MD.orders[0]?.id) || 'ORD202607010001';
    const sampleBidId = (MD.biddingAnnouncements && MD.biddingAnnouncements[0]?.id) || 1;
    const sampleResId = (MD.biddingResources && MD.biddingResources[0]?.id) || 1;
    const sampleUserId = (MD.users && MD.users[0]?.id) || 1;

    // 8.2 调用各端具体填充真实业务数据的弹窗打开函数
    try {
      // --- 1. Admin 运营端 ---
      if (modalId === 'modal-audit-shop') {
        if (typeof window.openAuditShopModal === 'function') window.openAuditShopModal(sampleShopId);
      } else if (modalId === 'modal-suspend-shop') {
        if (typeof window.openSuspendShopModal === 'function') window.openSuspendShopModal(sampleSuspendShopId);
      } else if (modalId === 'modal-add-category') {
        if (typeof window.openAddCategoryModal === 'function') window.openAddCategoryModal('0', 'C001', '粮食油料', true);
      } else if (modalId === 'modal-audit-product') {
        if (typeof window.openAuditProductModal === 'function') window.openAuditProductModal(sampleProdId);
      } else if (modalId === 'modal-edit-product') {
        if (typeof window.openEditProductModal === 'function') window.openEditProductModal(sampleProdId);
        else if (window.AdminApp && typeof window.AdminApp.editProduct === 'function') window.AdminApp.editProduct(sampleProdId);
      } else if (modalId === 'modal-audit-demand') {
        if (typeof window.openAuditDemandModal === 'function') window.openAuditDemandModal(sampleDemandId);
      } else if (modalId === 'modal-demand-quotes') {
        if (typeof window.openDemandQuotesModal === 'function') window.openDemandQuotesModal(sampleDemandId);
      } else if (modalId === 'modal-audit-bidres') {
        if (typeof window.openAuditBiddingResModal === 'function') window.openAuditBiddingResModal(sampleResId);
      } else if (modalId === 'modal-audit-bidding-ann') {
        if (typeof window.openAuditBiddingAnnModal === 'function') window.openAuditBiddingAnnModal(sampleBidId);
      } else if (modalId === 'modal-admin-bid-detail') {
        if (window.AdminApp && typeof window.AdminApp.openBidDetail === 'function') window.AdminApp.openBidDetail(sampleBidId);
      } else if (modalId === 'modal-add-commission') {
        if (window.AdminApp && typeof window.AdminApp.editCommission === 'function') window.AdminApp.editCommission(1);
        else if (window.AdminApp && typeof window.AdminApp.openAddCommissionModal === 'function') window.AdminApp.openAddCommissionModal();
      } else if (modalId === 'modal-customer-detail') {
        if (window.AdminApp && typeof window.AdminApp.showCustomerDetail === 'function') window.AdminApp.showCustomerDetail(sampleUserId);
      } else if (modalId === 'modal-audit-merchant') {
        if (typeof window.openAuditMerchantModal === 'function') window.openAuditMerchantModal(sampleUserId);
        else if (window.AdminApp && typeof window.AdminApp.showAuditMerchantModal === 'function') window.AdminApp.showAuditMerchantModal(sampleUserId);
      } else if (modalId === 'modal-admin-contract-audit' || modalId === 'modal-audit-contracts') {
        if (window.AdminApp && typeof window.AdminApp.showContractAuditModal === 'function') window.AdminApp.showContractAuditModal(sampleOrderId);
        else if (window.showContractAuditModal) window.showContractAuditModal(sampleOrderId);
      } else if (modalId === 'modal-admin-payment-audit' || modalId === 'modal-audit-payment') {
        if (window.AdminApp && typeof window.AdminApp.showPaymentAuditModal === 'function') window.AdminApp.showPaymentAuditModal(sampleOrderId);
        else if (window.showPaymentAuditModal) window.showPaymentAuditModal(sampleOrderId);
      }

      // --- 2. Merchant PC 商家端 ---
      else if (modalId === 'modal-add-product') {
        if (window.MerchantApp && typeof window.MerchantApp.openEditProductModal === 'function') window.MerchantApp.openEditProductModal(sampleProdId);
        else if (window.MerchantApp && typeof window.MerchantApp.openAddProductModal === 'function') window.MerchantApp.openAddProductModal();
      } else if (modalId === 'modal-add-listed-product') {
        if (window.MerchantApp && typeof window.MerchantApp.openEditListedProductModal === 'function') window.MerchantApp.openEditListedProductModal(sampleProdId);
        else if (window.MerchantApp && typeof window.MerchantApp.openAddListedProductModal === 'function') window.MerchantApp.openAddListedProductModal();
      } else if (modalId === 'modal-order-detail') {
        if (window.UI && typeof window.UI.showOrderDetail === 'function') window.UI.showOrderDetail(sampleOrderId);
        else if (window.MerchantApp && typeof window.MerchantApp.showOrderDetail === 'function') window.MerchantApp.showOrderDetail(sampleOrderId);
      } else if (modalId === 'modal-contract-sign') {
        if (window.MerchantApp && typeof window.MerchantApp.openContractSignModal === 'function') window.MerchantApp.openContractSignModal(sampleOrderId);
        else if (window.MallApp && typeof window.MallApp.openContractSignModal === 'function') window.MallApp.openContractSignModal(sampleOrderId);
        else if (window.UI && typeof window.UI.showModal === 'function') window.UI.showModal(modalId);
      } else if (modalId === 'modal-ship') {
        if (window.MerchantApp && typeof window.MerchantApp.openShipModal === 'function') window.MerchantApp.openShipModal(sampleOrderId);
      } else if (modalId === 'modal-invoice-process' || modalId === 'merchant-invoice-modal-overlay') {
        if (window.MerchantApp && typeof window.MerchantApp.openInvoiceUploadModal === 'function') window.MerchantApp.openInvoiceUploadModal(sampleOrderId);
        else if (window.openInvoiceUploadModal) window.openInvoiceUploadModal(sampleOrderId);
      } else if (modalId === 'modal-add-res') {
        if (window.MerchantApp && typeof window.MerchantApp.openEditResModal === 'function') window.MerchantApp.openEditResModal(sampleResId);
        else if (window.MerchantApp && typeof window.MerchantApp.openAddResModal === 'function') window.MerchantApp.openAddResModal();
      } else if (modalId === 'modal-add-ann') {
        if (window.MerchantApp && typeof window.MerchantApp.openEditAnnModal === 'function') window.MerchantApp.openEditAnnModal(sampleBidId);
        else if (window.MerchantApp && typeof window.MerchantApp.openAddAnnModal === 'function') window.MerchantApp.openAddAnnModal();
      } else if (modalId === 'modal-bid-award') {
        if (window.MerchantApp && typeof window.MerchantApp.openAwardModal === 'function') window.MerchantApp.openAwardModal(sampleBidId, false);
      }

      // --- 3. Mall PC 买家商城端 ---
      else if (modalId === 'modal-product-detail') {
        if (window.MallApp && typeof window.MallApp.showProductDetail === 'function') window.MallApp.showProductDetail(sampleProdId);
      } else if (modalId === 'modal-bidding-detail') {
        if (window.MallApp && typeof window.MallApp.openBiddingDetail === 'function') window.MallApp.openBiddingDetail(sampleBidId);
      } else if (modalId === 'modal-publish-demand') {
        if (window.MallApp && typeof window.MallApp.openPublishDemandModal === 'function') window.MallApp.openPublishDemandModal();
      } else if (modalId === 'modal-quote') {
        if (window.MallApp && typeof window.MallApp.openQuoteModal === 'function') window.MallApp.openQuoteModal(sampleDemandId);
      } else if (modalId === 'modal-demand-quotes' || modalId === 'modal-view-quotes' || modalId === 'modal-demand-quotes-runtime') {
        if (window.UI && typeof window.UI.showDemandQuotesModal === 'function') window.UI.showDemandQuotesModal(sampleDemandId, false);
        else if (window.MallApp && typeof window.MallApp.openViewQuotesModal === 'function') window.MallApp.openViewQuotesModal(sampleDemandId);
      } else if (modalId === 'modal-contract-signing' || modalId === 'modal-contract-sign') {
        if (window.UI && typeof window.UI.showContractSigningModal === 'function') window.UI.showContractSigningModal(sampleOrderId, false);
        else if (window.MerchantApp && typeof window.MerchantApp.openContractSignModal === 'function') window.MerchantApp.openContractSignModal(sampleOrderId);
      } else if (modalId === 'modal-payment' || modalId === 'modal-buyer-payment') {
        if (window.UI && typeof window.UI.showPaymentModal === 'function') window.UI.showPaymentModal(sampleOrderId);
        else if (window.MallApp && typeof window.MallApp.openBuyerPaymentModal === 'function') window.MallApp.openBuyerPaymentModal(sampleOrderId);
      } else if (modalId === 'modal-invoice' || modalId === 'modal-apply-invoice') {
        if (window.UI && typeof window.UI.showInvoiceModal === 'function') window.UI.showInvoiceModal(sampleOrderId);
        else if (window.MallApp && typeof window.MallApp.applyInvoice === 'function') window.MallApp.applyInvoice(sampleOrderId);
      } else if (modalId === 'modal-invoice-preview' || modalId === 'modal-view-invoice') {
        if (window.UI && typeof window.UI.showInvoicePreviewModal === 'function') window.UI.showInvoicePreviewModal('INV202607010001');
        else if (window.MallApp && typeof window.MallApp.openViewInvoiceModal === 'function') window.MallApp.openViewInvoiceModal('INV202607010001');
      }

      // --- 4. H5 移动买家端 ---
      else if (modalId === 'sheet-h5-product-detail') {
        if (window.H5App && typeof window.H5App.openProductDetail === 'function') window.H5App.openProductDetail(sampleProdId);
      } else if (modalId === 'sheet-h5-bid-detail') {
        if (window.H5App && typeof window.H5App.openBidDetail === 'function') window.H5App.openBidDetail(sampleBidId);
      } else if (modalId === 'sheet-h5-publish-demand') {
        if (window.H5App && typeof window.H5App.openPublishDemandSheet === 'function') window.H5App.openPublishDemandSheet();
      } else if (modalId === 'sheet-h5-quote') {
        if (window.H5App && typeof window.H5App.openQuoteSheet === 'function') window.H5App.openQuoteSheet(sampleDemandId);
      } else if (modalId === 'sheet-h5-contract') {
        if (window.H5App && typeof window.H5App.openContractSheet === 'function') window.H5App.openContractSheet(sampleOrderId);
      } else if (modalId === 'sheet-h5-apply-invoice') {
        if (window.H5App && typeof window.H5App.openApplyInvoiceSheet === 'function') window.H5App.openApplyInvoiceSheet(sampleOrderId);
      }

      // --- 5. Merchant H5 移动商家端 ---
      else if (modalId === 'modal-mh5-edit-shop') {
        if (window.MerchantH5App && typeof window.MerchantH5App.openShopAppealModal === 'function') window.MerchantH5App.openShopAppealModal();
      } else if (modalId === 'modal-mh5-add-shelf-ann') {
        if (window.MerchantH5App && typeof window.MerchantH5App.openAddShelfAnnModal === 'function') window.MerchantH5App.openAddShelfAnnModal();
      } else if (modalId === 'modal-mh5-ship') {
        if (window.MerchantH5App && typeof window.MerchantH5App.openShipModal === 'function') window.MerchantH5App.openShipModal(sampleOrderId);
      } else if (modalId === 'modal-mh5-add-res') {
        if (window.MerchantH5App && typeof window.MerchantH5App.openAddResModal === 'function') window.MerchantH5App.openAddResModal();
      } else if (modalId === 'modal-mh5-add-ann') {
        if (window.MerchantH5App && typeof window.MerchantH5App.openAddAnnModal === 'function') window.MerchantH5App.openAddAnnModal(sampleBidId);
      }
    } catch (err) {
      console.warn('triggerModalWithData error:', err);
    }

    // 兜底保证弹窗可见
    const m = document.getElementById(modalId);
    if (m && (getComputedStyle(m).display === 'none' || !m.classList.contains('active'))) {
      if (window.UI && typeof window.UI.showModal === 'function') window.UI.showModal(modalId);
      else if (window.UI && typeof window.UI.openModal === 'function') window.UI.openModal(modalId);
      else {
        m.style.display = 'flex';
        m.classList.add('active');
      }
    }
  }

  // 9. 准确定位与高亮光框 (先滑动，再稳定精确定位)
  window.locateAndHighlight = function(id, showBubble = true) {
    const pin = savedPins.find(p => p.id === id);
    if (!pin) return;

    if (!pin.selector || typeof pin.selector !== 'string' || !pin.selector.trim()) {
      showToast('该需求暂未绑定具体的页面元素', 'info');
      return;
    }

    // 9.1 智能解析关联的弹窗 ID 并通过真实数据流唤起
    let modalId = null;
    if (pin.selector.startsWith('#')) {
      const possibleId = pin.selector.replace(/^#/, '').split(/[\s\.\[:]/)[0];
      if (possibleId.includes('modal') || possibleId.includes('sheet') || possibleId.includes('overlay')) {
        modalId = possibleId;
      }
    }

    let el = null;
    try {
      el = document.querySelector(pin.selector);
    } catch (e) {}

    if (!modalId && el) {
      const modalParent = el.closest('.modal-overlay, [id^="modal-"], [id^="sheet-"]');
      if (modalParent) modalId = modalParent.id;
    }

    if (modalId) {
      triggerModalWithData(modalId, pin);
    } else {
      // 9.2 普通页面 / Tab 视图切换
      // 优先检测是否属于 Mall 个人中心子 Tab
      const ucTabMatch = pin.selector.match(/#?(uc-[a-zA-Z0-9_-]+)/);
      if (ucTabMatch) {
        const ucTabId = ucTabMatch[1];
        const ucenterNav = document.querySelector(`.mall-nav-item[data-target="mall-ucenter"]`) || document.querySelector(`[onclick*="mall-ucenter"]`);
        if (ucenterNav) ucenterNav.click();
        if (window.MallApp && typeof window.MallApp.showUCTab === 'function') {
          window.MallApp.showUCTab(ucTabId);
          if (ucTabId === 'uc-cart') window.MallApp.renderCart && window.MallApp.renderCart();
          if (ucTabId === 'uc-bids') window.MallApp.renderUCBids && window.MallApp.renderUCBids();
          if (ucTabId === 'uc-orders') window.MallApp.renderUCOrders && window.MallApp.renderUCOrders();
        } else {
          const ucLink = document.querySelector(`#uc-menu .uc-menu-item[data-target="${ucTabId}"]`);
          if (ucLink) ucLink.click();
        }
      }

      const views = document.querySelectorAll('.h5-view, .uc-view, .mall-view, .page-view, .tab-pane, .tab-content');
      for (let view of views) {
        if (pin.selector.includes(view.id) || (el && view.contains(el))) {
          const viewId = view.id;
          if (window.H5App && typeof window.H5App.switchH5View === 'function') window.H5App.switchH5View(viewId);
          const h5Tab = document.querySelector(`.h5-tab-item[data-target="${viewId}"], .h5-tab[data-target="${viewId}"], .tab-item[data-target="${viewId}"], [data-target="${viewId}"]`);
          if (h5Tab) h5Tab.click();
          
          if (view.classList.contains('uc-view')) {
            const ucenterNav = document.querySelector(`.mall-nav-item[data-target="mall-ucenter"]`);
            if (ucenterNav) ucenterNav.click();
            if (window.MallApp && typeof window.MallApp.showUCTab === 'function') {
              window.MallApp.showUCTab(viewId);
              if (viewId === 'uc-cart') window.MallApp.renderCart && window.MallApp.renderCart();
              if (viewId === 'uc-bids') window.MallApp.renderUCBids && window.MallApp.renderUCBids();
              if (viewId === 'uc-orders') window.MallApp.renderUCOrders && window.MallApp.renderUCOrders();
            }
          } else if (view.classList.contains('mall-view')) {
            const mainNav = document.querySelector(`.mall-nav-item[data-target="${viewId}"]`);
            if (mainNav) mainNav.click();
          } else {
            const ucLink = document.querySelector(`#uc-menu .uc-menu-item[data-target="${viewId}"]`);
            if (ucLink) ucLink.click();
            const mainNav = document.querySelector(`.mall-nav-item[data-target="${viewId}"]`);
            if (mainNav) mainNav.click();
          }

          const menuLink = document.querySelector(`[data-page="${viewId}"]`) || document.querySelector(`.menu-item[data-page="${viewId}"]`);
          if (menuLink) menuLink.click();
        }
      }
    }

    // 9.3 等待弹窗与页面切换完成，平滑滚动并精确定位
    setTimeout(() => {
      let target = null;
      try {
        target = document.querySelector(pin.selector);
      } catch (e) {}

      if (target) {
        let scrollTarget = target;
        if (target.classList.contains('modal-overlay')) {
          scrollTarget = target.querySelector('.modal, .modal-dialog, .bottom-sheet, .modal-body, .sheet-body') || target;
        }
        scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // 等待平滑滚动与弹窗渲染完成（约 300ms）后再精确计算高亮与绘制光圈
      setTimeout(() => {
        let finalTarget = null;
        try {
          finalTarget = document.querySelector(pin.selector);
        } catch (e) {}

        if (finalTarget) {
          let highlightTarget = finalTarget;
          if (finalTarget.classList.contains('modal-overlay') || finalTarget.id.startsWith('modal-') || finalTarget.id.startsWith('sheet-')) {
            highlightTarget = finalTarget.querySelector('.modal, .modal-dialog, .bottom-sheet, .modal-body, .sheet-body') || finalTarget;
          }

          if (isElementVisibleOnScreen(highlightTarget)) {
            const rect = highlightTarget.getBoundingClientRect();
            
            // 渲染高亮发光框
            const oldBoxes = document.querySelectorAll('.prd-target-glow-box');
            oldBoxes.forEach(b => b.remove());

            const box = document.createElement('div');
            box.className = 'prd-target-glow-box';
            box.style.top = `${rect.top - 4}px`;
            box.style.left = `${rect.left - 4}px`;
            box.style.width = `${rect.width + 8}px`;
            box.style.height = `${rect.height + 8}px`;
            document.body.appendChild(box);

            setTimeout(() => box.remove(), 2500);

            renderPinMarkers();

            const marker = document.querySelector(`.prd-pin-marker.pin-id-${pin.id}`);
            if (marker) {
              marker.classList.add('highlighted');
              setTimeout(() => marker.classList.remove('highlighted'), 2500);
            }

            if (showBubble) {
              showInspectBubble(pin, marker || highlightTarget);
            }
          }
        }
      }, 300);
    }, 150);
  };

  // 9. 大尺寸可自由缩放 Markdown 可视化工作台编辑器
  let activeEditorEl = null;
  let currentEditorMode = 'split'; // 'split' | 'edit' | 'preview'

  window.openEditorForPin = function(id) {
    window.closeInspectBubble();
    const pin = savedPins.find(p => p.id === id) || {
      id: null,
      title: '',
      type: '业务规则',
      desc: '',
      selector: ''
    };

    activeDraft = JSON.parse(JSON.stringify(pin));
    renderEditorModal(activeDraft);
  };

  function renderEditorModal(draft) {
    if (activeEditorEl) activeEditorEl.remove();

    const editor = document.createElement('div');
    editor.className = 'prd-editor-modal';
    editor.id = 'prd-floating-editor';

    editor.innerHTML = `
      <div class="prd-editor-header" id="prd-editor-drag-handle">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:14px;">✏️</span>
          <strong>${draft.id ? `编辑需求规格 #${draft.id}` : '新建需求规格 (置顶排序)'}</strong>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <!-- 视图模式切换 -->
          <div style="display:flex; background:rgba(255,255,255,0.15); padding:2px; border-radius:6px;">
            <button class="prd-md-tool-btn ${currentEditorMode === 'split' ? 'active' : ''}" style="border:none; padding:2px 8px; font-size:11px;" onclick="window.setEditorLayoutMode('split')" title="左右分栏实时预览">🌓 双栏预览</button>
            <button class="prd-md-tool-btn ${currentEditorMode === 'edit' ? 'active' : ''}" style="border:none; padding:2px 8px; font-size:11px;" onclick="window.setEditorLayoutMode('edit')" title="纯编辑模式">✏️ 纯编辑</button>
            <button class="prd-md-tool-btn ${currentEditorMode === 'preview' ? 'active' : ''}" style="border:none; padding:2px 8px; font-size:11px;" onclick="window.setEditorLayoutMode('preview')" title="纯预览模式">👁️ 纯预览</button>
          </div>
          <button class="prd-btn-action" style="color:#ffffff; font-size:14px;" onclick="window.minimizeEditor()" title="暂存最小化 (保留草稿)">➖</button>
          <button class="prd-btn-action" style="color:#ffffff; font-size:16px;" onclick="window.closeEditorModal()" title="关闭">&times;</button>
        </div>
      </div>

      <div class="prd-editor-body">
        <!-- 头部元信息表单 -->
        <div style="display:grid; grid-template-columns: 2fr 1fr; gap: 12px; flex-shrink:0;">
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; font-weight:700; color:#334155;">需求名称 <span style="color:#ef4444;">*</span></label>
            <input type="text" id="prd-modal-title" style="padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:13px; outline:none;" placeholder="输入需求标题 (必填)" value="${escapeHtml(draft.title || '')}">
          </div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            <label style="font-size:12px; font-weight:700; color:#334155;">需求类型</label>
            <select id="prd-modal-type" style="padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; outline:none; background:#fff;">
              <option value="业务规则" ${draft.type === '业务规则' ? 'selected' : ''}>业务规则</option>
              <option value="交互逻辑" ${draft.type === '交互逻辑' ? 'selected' : ''}>交互逻辑</option>
              <option value="数据口径" ${draft.type === '数据口径' ? 'selected' : ''}>数据口径</option>
              <option value="权限规则" ${draft.type === '权限规则' ? 'selected' : ''}>权限规则</option>
              <option value="异常流" ${draft.type === '异常流' ? 'selected' : ''}>异常流</option>
              <option value="UI规范" ${draft.type === 'UI规范' ? 'selected' : ''}>UI规范</option>
            </select>
          </div>
        </div>

        <!-- 强大的可视化格式工具条 -->
        <div class="prd-md-toolbar">
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('**', '**')" title="加粗"><b>B</b></button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('*', '*')" title="斜体"><i>I</i></button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('~~', '~~')" title="删除线"><s>S</s></button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('### ', '')" title="三级标题">H3</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('#### ', '')" title="四级标题">H4</button>
          <span style="color:#cbd5e1; margin:0 2px;">|</span>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('- ', '')" title="无序列表">• 列表</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('1. ', '')" title="有序列表">1. 序号</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('- [ ] ', '')" title="待办清单">☑ 任务</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('> ', '')" title="引用说明">” 引用</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('\`', '\`')" title="行内代码">&lt;/&gt; 代码</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('\`\`\`javascript\\n', '\\n\`\`\`')" title="代码块">📦 代码块</button>
          <button class="prd-md-tool-btn" onclick="window.insertMdSyntax('\\n---\\n', '')" title="分割线">--- 分割线</button>
          <span style="color:#cbd5e1; margin:0 2px;">|</span>

          <!-- 📊 表格可视化插入下拉 -->
          <select class="prd-tool-select" onchange="window.insertMarkdownTable(this.value); this.value='';">
            <option value="">📊 插入表格...</option>
            <option value="field-spec">📋 字段字典规格表 (字段/类型/规范/校验/动作)</option>
            <option value="auth-matrix">🛡️ 多角色操作权限表 (状态/买家/商家/运营)</option>
            <option value="state-flow">🔄 状态机流转说明表 (源状态/触发/目标/系统动作)</option>
            <option value="custom">📄 基础 3×3 空白表格</option>
          </select>

          <!-- 🔄 Mermaid 流程图下拉 -->
          <select class="prd-tool-select" onchange="window.insertMermaidTemplate(this.value); this.value='';">
            <option value="">🔄 插入流程图 (Mermaid)...</option>
            <option value="state-chart">🔄 业务状态机流转图 (State Flow)</option>
            <option value="sequence">👥 多角色协同与审批时序图 (Sequence)</option>
            <option value="flowchart">🔀 业务决策与分支流程图 (Flowchart)</option>
          </select>

          <!-- 📑 业务规约模板下拉 -->
          <select class="prd-tool-select" onchange="window.insertMarkdownTemplate(this.value); this.value='';">
            <option value="">📑 插入业务规约模板...</option>
            <option value="rule">📋 业务规则与流转规约 (前置/逻辑/异常)</option>
            <option value="metric">🔢 数据口径与计算公式 (范围/口径/刷新)</option>
            <option value="modal">🪟 弹窗与表单交互规约 (字段/校验/提交)</option>
          </select>
        </div>

        <!-- 编辑与实时预览双栏工作台 (Resizable Workbench) -->
        <div class="prd-editor-workbench" id="prd-editor-workbench">
          <!-- 左侧编辑器 -->
          <div class="prd-editor-pane" id="prd-editor-edit-pane" style="flex:1;">
            <div class="prd-editor-pane-header">
              <span>✍️ 源码编辑 (支持快捷键与语法高亮)</span>
              <span style="font-size:10px; color:#94a3b8;">按住右下角可自由拉大放小窗口</span>
            </div>
            <textarea id="prd-modal-desc" style="flex:1; width:100%; border:none; padding:12px; font-size:12.5px; line-height:1.6; outline:none; font-family:ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; resize:none; box-sizing:border-box;" placeholder="输入功能逻辑、操作规则、字段规范或通过上方工具条一键插入表格与流程图..." oninput="window.updateEditorLivePreview()">${escapeHtml(draft.desc || '')}</textarea>
          </div>

          <!-- 右侧实时可视化 Markdown / Mermaid 预览 -->
          <div class="prd-editor-pane pane-preview" id="prd-editor-preview-pane" style="flex:1;">
            <div class="prd-editor-pane-header">
              <span>👁️ 实时可视化渲染 (Markdown + 流程图 + 表格)</span>
              <span style="font-size:10px; color:#10b981;">● 实时同步中</span>
            </div>
            <div class="prd-editor-preview prd-md-rendered" id="prd-editor-preview-content">
              ${parseMarkdown(draft.desc) || '<p style="color:#94a3b8; font-style:italic;">右侧实时渲染预览区</p>'}
            </div>
          </div>
        </div>

        <!-- 底部操作与选择器绑定 -->
        <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid #e2e8f0; padding-top:10px; flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <button class="prd-btn-action" style="background:#eff6ff; color:#1d4ed8; padding:4px 10px; border-radius:6px; font-weight:600;" onclick="window.rePickElementFromModal()">🎯 重新拾取元素</button>
            <span style="font-size:11px; color:#64748b; max-width:280px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; background:#f1f5f9; padding:2px 8px; border-radius:4px;">${draft.selector || '未绑定页面元素'}</span>
          </div>
          <div style="display:flex; gap:8px;">
            <button class="prd-btn-action" style="padding:6px 14px; background:#f1f5f9;" onclick="window.closeEditorModal()">取消</button>
            <button class="prd-btn-primary" style="padding:6px 18px;" onclick="window.saveEditorModal()">💾 保存需求</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(editor);
    activeEditorEl = editor;
    initDraggable(editor, document.getElementById('prd-editor-drag-handle'));
    window.setEditorLayoutMode(currentEditorMode);
    setTimeout(() => {
      window.renderMermaidInDom(document.getElementById('prd-editor-preview-content'));
    }, 100);
  }

  window.setEditorLayoutMode = function(mode) {
    currentEditorMode = mode;
    const editPane = document.getElementById('prd-editor-edit-pane');
    const previewPane = document.getElementById('prd-editor-preview-pane');
    if (!editPane || !previewPane) return;

    if (mode === 'split') {
      editPane.style.display = 'flex';
      previewPane.style.display = 'flex';
    } else if (mode === 'edit') {
      editPane.style.display = 'flex';
      previewPane.style.display = 'none';
    } else if (mode === 'preview') {
      editPane.style.display = 'none';
      previewPane.style.display = 'flex';
      window.updateEditorLivePreview();
    }
  };

  window.updateEditorLivePreview = function() {
    const textarea = document.getElementById('prd-modal-desc');
    const previewContent = document.getElementById('prd-editor-preview-content');
    if (!textarea || !previewContent) return;

    previewContent.innerHTML = parseMarkdown(textarea.value) || '<p style="color:#94a3b8; font-style:italic;">右侧实时渲染预览区</p>';
    window.renderMermaidInDom(previewContent);
  };

  window.insertMarkdownTable = function(type) {
    if (!type) return;
    const textarea = document.getElementById('prd-modal-desc');
    if (!textarea) return;

    let tpl = '';
    if (type === 'field-spec') {
      tpl = `| 字段名称 | 类型 | 格式与展示规范 | 校验规则 | 触发动作 |\n|---------|------|---------------|---------|---------|\n| **示例字段** | 文本/金额 | 必填，单行居中 | 最多50字符 | 点击弹出详情 |`;
    } else if (type === 'auth-matrix') {
      tpl = `| 履约/业务状态 | 买家端操作 | 商家端操作 | 运营端操作 |\n|---|---|---|---|\n| **待签约** | 去签约(盖章) / 取消订单 | 去签约(盖章) / 取消订单 | 审核合同 / 关闭订单 |\n| **待付款** | 去付款 / 取消订单 | 取消订单 | 审核付款 / 关闭订单 |\n| **待发货** | 只读 | 立即发货 | 关闭订单 |\n| **待签收** | 确认收货 | 只读 | 代确认收货 |`;
    } else if (type === 'state-flow') {
      tpl = `| 源状态 | 触发条件 / 操作动作 | 目标状态 | 发生后系统动作 |\n|---|---|---|---|\n| **待审核** | 运营审核通过 | 正常营业 / 展示中 | 开放全平台下单交易 |\n| **待签约** | ⚡ 3天超时未上传合同 | 已取消 | 自动取消订单并释放库存 |\n| **已上架** | ⚡ 库存归零或低于起售量 | 已售罄 | 前端购买入口置灰 |`;
    } else if (type === 'custom') {
      tpl = `| 列标题 1 | 列标题 2 | 列标题 3 |\n|---|---|---|\n| 单元格 1 | 单元格 2 | 单元格 3 |\n| 单元格 4 | 单元格 5 | 单元格 6 |`;
    }

    textarea.value = (textarea.value ? textarea.value + '\n\n' : '') + tpl;
    textarea.focus();
    window.updateEditorLivePreview();
  };

  window.insertMermaidTemplate = function(type) {
    if (!type) return;
    const textarea = document.getElementById('prd-modal-desc');
    if (!textarea) return;

    let tpl = '';
    if (type === 'state-chart') {
      tpl = `\`\`\`mermaid\ngraph TB\n    A[草稿 / 待审核]:::state -->|运营审核通过| B[正常营业 / 履约中]:::state\n    A -->|运营驳回| C[已下架 · 待整改]:::endState\n    B -->|⚡ 业务到期或超时| D[已完成]:::endState\n    classDef state fill:#dbeafe,stroke:#2563eb,color:#1e40af\n    classDef endState fill:#f1f5f9,stroke:#64748b,color:#475569\n\`\`\``;
    } else if (type === 'sequence') {
      tpl = `\`\`\`mermaid\nsequenceDiagram\n    autonumber\n    actor 买家 as 买家端\n    actor 商家 as 商家端\n    actor 运营 as 运营审核\n    买家->>运营: 提交采购需求/上传合同\n    商家->>运营: 提交货源报价/签章合同\n    运营->>运营: 统一双边核验对账\n    运营-->>买家: 审核通过，通知付款\n    运营-->>商家: 审核通过，通知备货发货\n\`\`\``;
    } else if (type === 'flowchart') {
      tpl = `\`\`\`mermaid\nflowchart TD\n    Start[用户发起操作] --> Check{前置合规性校验}\n    Check -->|校验通过| Submit[调用业务服务流转]\n    Check -->|校验不通过| Error[Toast 友好错误提示]\n    Submit --> Success[更新视图状态并下发通知]\n\`\`\``;
    }

    textarea.value = (textarea.value ? textarea.value + '\n\n' : '') + tpl;
    textarea.focus();
    window.updateEditorLivePreview();
  };

  window.insertMarkdownTemplate = function(type) {
    if (!type) return;
    const textarea = document.getElementById('prd-modal-desc');
    if (!textarea) return;

    let tpl = '';
    if (type === 'rule') {
      tpl = `### 1. 业务规则与流转\n- **触发条件**：用户在界面点击当前操作按钮\n- **前置校验**：必填项完整性与格式校验\n- **处理逻辑**：\n  1. 弹出二次确认弹窗\n  2. 提交接口执行状态流转\n  3. 刷新列表数据并下发通知\n\n### 2. 异常分支处理\n- 网络超时或接口报错时 Toast 提示友好错误码`;
    } else if (type === 'metric') {
      tpl = `### 1. 业务口径定义\n- **统计范围**：全平台所有已支付及履约中订单\n- **排除范围**：已关闭/已全额退款的异常订单\n- **计算公式**：\`GMV = ∑(订单成交金额 + 增值运费)\`\n- **刷新时效**：页面初始化拉取，支持每 60 秒定时静默更新`;
    } else if (type === 'modal') {
      tpl = `### 1. 弹窗展示与表单字段\n- **触发入口**：列表操作列「审核」按钮\n- **内部字段**：\n  1. 业务实体基础信息摘要（只读）\n  2. 审核结果单选（通过 / 拒绝，默认通过）\n  3. 拒绝/驳回原因（选中拒绝时必填，最多50字）\n\n### 2. 提交后系统动作\n- 审核通过推进至下一阶段状态\n- 驳回退回上一阶段并记录驳回历史`;
    }

    textarea.value = (textarea.value ? textarea.value + '\n\n' : '') + tpl;
    textarea.focus();
    window.updateEditorLivePreview();
  };

  // 窗口通用拖拽函数
  function initDraggable(el, handle) {
    if (!el || !handle) return;
    let isDragging = false;
    let startX, startY, origLeft, origTop;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.closest('button, select, input')) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = el.getBoundingClientRect();
      origLeft = rect.left;
      origTop = rect.top;
      e.preventDefault();

      function onMouseMove(ev) {
        if (!isDragging) return;
        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        el.style.left = `${Math.max(10, Math.min(window.innerWidth - el.offsetWidth - 10, origLeft + dx))}px`;
        el.style.top = `${Math.max(10, Math.min(window.innerHeight - el.offsetHeight - 10, origTop + dy))}px`;
        el.style.transform = 'none';
      }

      function onMouseUp() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      }

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    });
  }

  window.insertMdSyntax = function(prefix, suffix) {
    const textarea = document.getElementById('prd-modal-desc');
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selected = text.substring(start, end) || '内容';
    textarea.value = text.substring(0, start) + prefix + selected + suffix + text.substring(end);
    textarea.focus();
    window.updateEditorLivePreview();
  };

  window.minimizeEditor = function() {
    if (!activeDraft) return;
    const titleInput = document.getElementById('prd-modal-title');
    const descInput = document.getElementById('prd-modal-desc');
    const typeSelect = document.getElementById('prd-modal-type');

    activeDraft.title = titleInput ? titleInput.value : activeDraft.title;
    activeDraft.desc = descInput ? descInput.value : activeDraft.desc;
    activeDraft.type = typeSelect ? typeSelect.value : activeDraft.type;

    if (activeEditorEl) {
      activeEditorEl.remove();
      activeEditorEl = null;
    }

    const oldCap = document.getElementById('prd-draft-capsule');
    if (oldCap) oldCap.remove();

    const cap = document.createElement('div');
    cap.className = 'prd-minimized-capsule';
    cap.id = 'prd-draft-capsule';
    cap.innerHTML = `
      <span>✏️ 草稿: <strong>${escapeHtml(activeDraft.title || '（未命名）')}</strong></span>
      <span style="font-size:10px; color:#94a3b8; background:rgba(255,255,255,0.15); padding:1px 6px; border-radius:10px;">点击恢复</span>
    `;
    cap.addEventListener('click', () => {
      cap.remove();
      renderEditorModal(activeDraft);
    });
    document.body.appendChild(cap);
    showToast('草稿已最小化悬浮，内容已自动保留。', 'info');
  };

  window.closeEditorModal = function() {
    if (activeEditorEl) {
      activeEditorEl.remove();
      activeEditorEl = null;
    }
    const oldCap = document.getElementById('prd-draft-capsule');
    if (oldCap) oldCap.remove();
    activeDraft = null;
  };

  window.saveEditorModal = async function() {
    const titleInput = document.getElementById('prd-modal-title');
    const descInput = document.getElementById('prd-modal-desc');
    const typeSelect = document.getElementById('prd-modal-type');

    const title = (titleInput ? titleInput.value : '').trim();
    const desc = (descInput ? descInput.value : '').trim();
    const type = typeSelect ? typeSelect.value : '业务规则';

    if (!title) {
      showToast('保存失败：需求名称为必填项！', 'warning');
      titleInput.focus();
      return;
    }
    if (!desc) {
      showToast('保存失败：功能逻辑描述为必填项！', 'warning');
      descInput.focus();
      return;
    }

    const backupPins = JSON.parse(JSON.stringify(savedPins));

    if (activeDraft && activeDraft.id) {
      const idx = savedPins.findIndex(p => p.id === activeDraft.id);
      if (idx !== -1) {
        savedPins[idx].title = title;
        savedPins[idx].desc = desc;
        savedPins[idx].type = type;
        if (activeDraft.selector) {
          savedPins[idx].selector = activeDraft.selector;
        }
        savedPins[idx].pageKey = pageKey;
        savedPins[idx].pageTitle = currentPageTitle;
      }
    } else {
      // 新增打点：直接插入到最前面（置顶排序），重新递增编号
      savedPins.unshift({
        id: 1,
        pageKey: pageKey,
        pageTitle: currentPageTitle,
        selector: activeDraft ? (activeDraft.selector || '') : '',
        title,
        desc,
        type
      });
    }

    reIndexPins(savedPins);

    // 尝试真正写入本地 JS 文件
    const isSavedToDisk = await persistData();

    if (isSavedToDisk) {
      window.closeEditorModal();
      renderPinMarkers();
      renderRightDrawerList();
      showToast('✅ 需求规约已成功写入本地 JS 文件并完成排序！', 'success');
    } else {
      savedPins = backupPins;
      reIndexPins(savedPins);
      alert('❌ 保存失败：未检测到本地后端服务，无法直接写入本地 JS 文件！\n\n【原因】：当前页面可能是直接双击打开的 HTML 文件（file:// 协议）或本地服务未运行，浏览器安全策略禁止直接修改磁盘上的 JS 文件。\n\n【解决方案】：\n1. 请在终端项目目录下运行 ./start.sh 或 npm start / node server.js 启动本地服务。\n2. 通过 http://localhost:3000 打开页面即可实现调接口实时保存到本地文件。\n\n（您的编辑内容已完整保留在当前窗口中，不会丢失）');
      showToast('❌ 保存失败：无法写入本地 JS 文件', 'error');
    }
  };

  window.rePickElementFromModal = function() {
    window.minimizeEditor();
    rePickModeActive = true;
    document.body.style.cursor = 'crosshair';
    showToast('请在页面上点击要重新绑定的新组件！', 'info');
    bindPickListeners();
  };

  // 10. 右侧抽屉列表渲染与排序
  function renderRightDrawerList() {
    const container = document.getElementById('prd-drawer-list');
    if (!container) return;

    let filtered = savedPins.filter(p => {
      if (searchKeyword && !p.title.toLowerCase().includes(searchKeyword) && !p.desc.toLowerCase().includes(searchKeyword)) return false;
      return true;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; color:#94a3b8; padding:40px 10px;">
          <div style="font-size:28px; margin-bottom:6px;">📌</div>
          <div style="font-size:12px;">当前页面暂无匹配的需求点</div>
        </div>
      `;
      return;
    }

    let html = '';
    filtered.forEach((pin) => {
      html += `
        <div class="prd-card-item" onclick="window.locateAndHighlight(${pin.id})">
          <div class="prd-card-header">
            <div class="prd-num-title">
              <span class="prd-pin-num-pill">${pin.id}</span>
              <span>${escapeHtml(pin.title || '（未命名）')}</span>
            </div>
            <div style="display:flex; gap:2px;">
              <button class="prd-btn-action" style="padding:1px 4px; font-size:10px;" onclick="event.stopPropagation(); window.movePinOrder(${pin.id}, -1)" title="上移序号">▲</button>
              <button class="prd-btn-action" style="padding:1px 4px; font-size:10px;" onclick="event.stopPropagation(); window.movePinOrder(${pin.id}, 1)" title="下移序号">▼</button>
            </div>
          </div>

          <div style="display:flex; gap:6px;">
            <span class="prd-tag prd-tag-type">${pin.type || '业务规则'}</span>
          </div>

          <div class="prd-card-desc">
            ${parseMarkdown(pin.desc) || '暂无描述'}
          </div>

          <div class="prd-card-footer">
            <span style="font-size:10px; color:#94a3b8;">${pin.selector ? '已绑定组件' : '未绑定'}</span>
            <div style="display:flex; gap:6px;">
              <button class="prd-btn-action" onclick="event.stopPropagation(); window.locateAndHighlight(${pin.id});">🎯 定位</button>
              <button class="prd-btn-action" onclick="event.stopPropagation(); window.openEditorForPin(${pin.id});">✏️ 编辑</button>
              <button class="prd-btn-action btn-danger" onclick="event.stopPropagation(); window.deletePinItem(${pin.id});">🗑️ 删除</button>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  window.movePinOrder = async function(id, direction) {
    const idx = savedPins.findIndex(p => p.id === id);
    if (idx === -1) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= savedPins.length) return;

    const backup = JSON.parse(JSON.stringify(savedPins));
    const temp = savedPins[idx];
    savedPins[idx] = savedPins[targetIdx];
    savedPins[targetIdx] = temp;

    reIndexPins(savedPins);
    const isSaved = await persistData();
    if (isSaved) {
      renderPinMarkers();
      renderRightDrawerList();
      showToast('✅ 排序已更新并写入本地文件！', 'success');
    } else {
      savedPins = backup;
      reIndexPins(savedPins);
      renderRightDrawerList();
      alert('❌ 排序保存失败：未检测到本地服务接口，无法写入本地磁盘 JS 文件！\n请启动本地服务（./start.sh）后再试。');
      showToast('❌ 排序保存失败', 'error');
    }
  };

  window.deletePinItem = async function(id) {
    if (confirm('确认删除此项需求规约吗？')) {
      const backup = JSON.parse(JSON.stringify(savedPins));
      savedPins = savedPins.filter(p => p.id !== id);
      reIndexPins(savedPins);
      const isSaved = await persistData();
      if (isSaved) {
        renderPinMarkers();
        renderRightDrawerList();
        showToast('✅ 需求点已删除并同步至本地文件！', 'info');
      } else {
        savedPins = backup;
        reIndexPins(savedPins);
        renderPinMarkers();
        renderRightDrawerList();
        alert('❌ 删除失败：未检测到本地服务接口，无法写入本地磁盘 JS 文件！\n请启动本地服务（./start.sh）后再试。');
        showToast('❌ 删除失败', 'error');
      }
    }
  };

  // 11. 拾取元素逻辑
  function bindPickListeners() {
    document.addEventListener('mouseover', handlePickOver, true);
    document.addEventListener('mouseout', handlePickOut, true);
    document.addEventListener('click', handlePickClick, true);
  }

  function unbindPickListeners() {
    document.removeEventListener('mouseover', handlePickOver, true);
    document.removeEventListener('mouseout', handlePickOut, true);
    document.removeEventListener('click', handlePickClick, true);
    if (highlightedElement) {
      highlightedElement.classList.remove('prd-pick-hover-outline');
      highlightedElement = null;
    }
    document.body.style.cursor = 'default';
  }

  function handlePickOver(e) {
    if (e.target.closest('.prd-floating-hotspot, .prd-right-drawer, .prd-inspect-bubble, .prd-editor-modal, .prd-doc-overlay, .prd-minimized-capsule')) return;
    if (highlightedElement) highlightedElement.classList.remove('prd-pick-hover-outline');
    highlightedElement = e.target;
    highlightedElement.classList.add('prd-pick-hover-outline');
  }

  function handlePickOut(e) {
    if (highlightedElement === e.target) {
      highlightedElement.classList.remove('prd-pick-hover-outline');
      highlightedElement = null;
    }
  }

  function handlePickClick(e) {
    if (e.target.closest('.prd-floating-hotspot, .prd-right-drawer, .prd-inspect-bubble, .prd-editor-modal, .prd-doc-overlay, .prd-minimized-capsule')) return;
    e.preventDefault();
    e.stopPropagation();

    const selector = getElementSelector(e.target);
    unbindPickListeners();

    if (rePickModeActive && activeDraft) {
      rePickModeActive = false;
      activeDraft.selector = selector;
      const oldCap = document.getElementById('prd-draft-capsule');
      if (oldCap) oldCap.remove();
      renderEditorModal(activeDraft);
      showToast('组件重新绑定成功！', 'success');
    } else {
      window.openEditorForPin(null);
      if (activeDraft) {
        activeDraft.selector = selector;
        renderEditorModal(activeDraft);
      }
    }
  }

  // 12. 模式与抽屉切换
  window.togglePRDDrawer = function() {
    const drawer = document.getElementById('prd-drawer');
    const isOpen = drawer && drawer.classList.contains('open');
    if (isOpen) {
      window.setPRDMode('hide');
    } else {
      window.setPRDMode('show');
    }
  };

  window.setPRDMode = function(mode) {
    currentMode = mode;
    const drawer = document.getElementById('prd-drawer');
    const edgeTab = document.getElementById('prd-drawer-edge-tab');

    if (mode === 'edit') {
      document.body.style.cursor = 'crosshair';
      bindPickListeners();
      if (drawer) drawer.classList.add('open');
      if (edgeTab) edgeTab.style.display = 'none';
      renderPinMarkers();
      renderRightDrawerList();
      showToast('✏️ 编辑打点模式已激活：直接点击页面元素即可！', 'info');
    } else if (mode === 'show') {
      unbindPickListeners();
      if (drawer) drawer.classList.add('open');
      if (edgeTab) edgeTab.style.display = 'none';
      renderPinMarkers();
      renderRightDrawerList();
      showToast('👁️ 需求列表已展开：已同步显示页面打点标', 'info');
    } else if (mode === 'hide') {
      unbindPickListeners();
      if (drawer) drawer.classList.remove('open');
      if (edgeTab) edgeTab.style.display = 'flex';
      window.closeInspectBubble();
      pinsOverlay.innerHTML = '';
    }
  };

  // 13. 当前页面 PRD 可视化 Markdown 文档大屏 (Document View)
  let activeDocModal = null;
  window.openCurrentPagePRDDoc = function() {
    if (activeDocModal) activeDocModal.remove();

    const overlay = document.createElement('div');
    overlay.className = 'prd-doc-overlay';
    overlay.id = 'prd-doc-modal-overlay';

    overlay.innerHTML = `
      <div class="prd-doc-container" onclick="event.stopPropagation()">
        <!-- 顶部导航与操作栏 -->
        <div class="prd-doc-header">
          <div style="display:flex; align-items:center; gap:12px;">
            <span style="font-size:17px; font-weight:800; color:#0f172a; display:flex; align-items:center; gap:8px;">
              <span>📑 ${currentPageTitle}</span>
              <span style="font-size:13px; color:#64748b; font-weight:normal;">产品需求规格说明书 (PRD)</span>
            </span>
            <span style="font-size:12px; background:#e0f2fe; color:#0284c7; padding:2px 10px; border-radius:12px; font-weight:700;">
              共 ${savedPins.length} 项规格
            </span>
          </div>
          <div style="display:flex; align-items:center; gap:8px;">
            <button class="prd-btn-action" style="background:#10b981; color:#fff; padding:6px 12px; border-radius:6px; font-weight:600;" onclick="window.exportPRDMarkdown()">📥 导出 Markdown</button>
            <button class="prd-btn-action" style="background:#3b82f6; color:#fff; padding:6px 12px; border-radius:6px; font-weight:600;" onclick="window.exportPRDJS()">💾 导出 JS 数据</button>
            <button class="prd-btn-action" style="background:#8b5cf6; color:#fff; padding:6px 12px; border-radius:6px; font-weight:600;" onclick="window.triggerImportJS()">📂 导入 JS 数据</button>
            <input type="file" id="prd-file-import-input" accept=".js,.json,.txt" style="display:none;" onchange="window.handleImportJS(this)">
            <button class="prd-btn-action" style="font-size:22px; padding:4px 8px;" onclick="window.closeCurrentPagePRDDoc()">&times;</button>
          </div>
        </div>

        <!-- 布局：左侧目录大纲 + 右侧纯正 Markdown 文档 -->
        <div class="prd-doc-content-layout">
          <!-- 左侧目录大纲 (TOC Outline) -->
          <div class="prd-doc-toc">
            <div class="prd-toc-title">
              <span>📑 目录大纲</span>
              <span style="font-size:10px;">TOC</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:2px;">
              ${savedPins.map(pin => `
                <div class="prd-toc-item" onclick="window.docScrollToSection('sec-pin-${pin.id}', this)" title="${escapeHtml(pin.title || '')}">
                  <span class="prd-toc-num">${pin.id}.</span>
                  <span class="prd-toc-text">${escapeHtml(pin.title || '（未命名）')}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 右侧 Markdown 文档正文 (Continuous Document Paper) -->
          <div class="prd-doc-main-scroll" id="prd-doc-scroll-area">
            <div class="prd-doc-paper">
              <!-- 顶部文档 Hero -->
              <div class="prd-doc-hero">
                <h1 class="prd-doc-hero-title">
                  <span>${currentPageTitle} · 产品需求规格说明书 (PRD)</span>
                </h1>
                <div class="prd-doc-hero-meta">
                  <span>📄 页面文件: <code>${pageKey}</code></span>
                  <span>·</span>
                  <span>📌 规格条目: 共 <strong>${savedPins.length}</strong> 项</span>
                  <span>·</span>
                  <span>⏱️ 视图模式: Markdown 连续排版</span>
                </div>
              </div>

              <!-- 连续 Markdown 正文篇章 (无独立分割大卡片) -->
              <div class="prd-md-doc">
                ${savedPins.length === 0 ? `
                  <div style="text-align:center; padding:80px 20px; color:#94a3b8;">
                    <div style="font-size:42px; margin-bottom:12px;">📄</div>
                    <div style="font-size:16px; font-weight:600;">当前页面尚未录入任何 PRD 规格</div>
                  </div>
                ` : savedPins.map(pin => `
                  <article class="prd-doc-article-section" id="sec-pin-${pin.id}">
                    <h2 class="prd-doc-sec-heading">
                      <span class="prd-doc-heading-title">${pin.id}. ${escapeHtml(pin.title || '（未命名需求）')}</span>
                      <span class="prd-doc-heading-type">（${escapeHtml(pin.type || '业务规则')}）</span>
                      ${pin.selector ? `
                        <span class="prd-doc-anchor-link" onclick="window.docJumpToElement(${pin.id})" title="在原型界面定位并高亮此元素">
                          <code>${escapeHtml(pin.selector)}</code>
                          <span class="prd-doc-anchor-icon">🎯 定位</span>
                        </span>
                      ` : ''}
                    </h2>

                    <div class="prd-doc-sec-content">
                      ${parseMarkdown(pin.desc) || '<p style="color:#94a3b8; font-style:italic;">暂无详细描述</p>'}
                    </div>
                  </article>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    activeDocModal = overlay;
    window.renderMermaidInDom(overlay);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) window.closeCurrentPagePRDDoc();
    });
  };

  window.closeCurrentPagePRDDoc = function() {
    if (activeDocModal) {
      activeDocModal.remove();
      activeDocModal = null;
    }
  };

  window.docScrollToSection = function(sectionId, elem) {
    const target = document.getElementById(sectionId);
    const scrollArea = document.getElementById('prd-doc-scroll-area');
    if (target && scrollArea) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      document.querySelectorAll('.prd-toc-item').forEach(el => el.classList.remove('active'));
      if (elem) elem.classList.add('active');
    }
  };

  window.docJumpToElement = function(id) {
    window.closeCurrentPagePRDDoc();
    setPRDMode('show');
    window.locateAndHighlight(id);
  };

  // 14. 导出与导入 (JS / Markdown)
  window.exportPRDJS = function() {
    const dataFileName = `prd-data-${pageKey.replace('.html', '')}.js`;
    const jsContent = `/**\n * PRD 需求数据 - ${currentPageTitle}\n * 导出时间: ${new Date().toLocaleString()}\n */\nwindow.INITIAL_PRD_DATA = ${JSON.stringify(savedPins, null, 2)};\n`;
    const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = dataFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`已成功导出 ${dataFileName}（包含所有绑定的组件选择器）！`, 'success');
  };

  window.exportPRDMarkdown = function() {
    let md = `# ${currentPageTitle} - 产品需求规格说明书 (PRD)\n\n`;
    md += `> **生成时间**：${new Date().toLocaleString()}  \n`;
    md += `> **关联页面**：\`${pageKey}\`  \n\n---\n\n`;

    savedPins.forEach((pin, index) => {
      md += `## ${index + 1}. ${pin.title || '未命名需求'}\n`;
      md += `- **所属模块**：${pin.moduleName || '常规模块'}\n`;
      md += `- **需求类型**：${pin.type || '业务规则'}\n`;
      md += `- **关联元素选择器**：\`${pin.selector || '--'}\`\n\n`;
      md += `### 功能逻辑与业务规约\n${pin.desc || '暂无描述'}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pageKey.replace('.html', '')}_PRD_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Markdown PRD 文档导出成功！', 'success');
  };

  window.triggerImportJS = function() {
    const input = document.getElementById('prd-file-import-input');
    if (input) input.click();
  };

  window.handleImportJS = function(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
      try {
        let text = e.target.result.trim();
        const match = text.match(/\[[\s\S]*\]/);
        if (match) text = match[0];
        const parsed = JSON.parse(text);

        if (Array.isArray(parsed)) {
          const isOverwrite = confirm(`检测到 ${parsed.length} 条需求数据，是否【覆盖】现有数据？\n点击【确定】将覆盖全部现有数据；\n点击【取消】将作为新数据追加到末尾。`);
          const backup = JSON.parse(JSON.stringify(savedPins));
          if (isOverwrite) {
            savedPins = parsed;
          } else {
            savedPins = savedPins.concat(parsed);
          }
          reIndexPins(savedPins);
          const isSaved = await persistData();
          if (isSaved) {
            renderPinMarkers();
            renderRightDrawerList();
            window.openCurrentPagePRDDoc(); // 刷新文档窗口
            showToast('✅ 数据导入成功并已写入本地 JS 文件！', 'success');
          } else {
            savedPins = backup;
            reIndexPins(savedPins);
            alert('❌ 导入保存失败：未检测到本地服务接口，无法写入本地磁盘 JS 文件！\n请先启动本地服务（./start.sh）后再进行导入。');
            showToast('❌ 导入保存失败', 'error');
          }
        } else {
          showToast('导入失败：数据不是合法的需求数组', 'error');
        }
      } catch (err) {
        showToast('导入解析失败，请确保是有效的 JS/JSON 格式数据文件', 'error');
      }
      input.value = '';
    };
    reader.readAsText(file);
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // 15. DOM 初始化与事件绑定
  let isInitialized = false;
  function initDOM() {
    if (isInitialized) return;
    isInitialized = true;

    // 15.1 右上角常驻查看完整 PRD 按钮 (带悬浮友好提示)
    const topDocWrapper = document.createElement('div');
    topDocWrapper.className = 'prd-top-doc-wrapper';
    topDocWrapper.id = 'prd-top-doc-wrapper';
    topDocWrapper.innerHTML = `
      <button class="prd-top-doc-btn" id="prd-top-doc-btn" onclick="window.openCurrentPagePRDDoc()" title="查看完整 PRD 规约文档">
        <span style="font-size:14px;">📑</span>
        <span>查看完整PRD</span>
      </button>
      <div class="prd-top-doc-tooltip">
        点击查阅「${currentPageTitle}」完整 PRD 需求规格说明书 (Markdown 连续文档与大纲)
      </div>
    `;
    document.body.appendChild(topDocWrapper);

    // 15.2 右侧边缘快捷展开/收起箭头 Tab (随时点击快速呼出抽屉)
    const edgeTab = document.createElement('div');
    edgeTab.className = 'prd-drawer-edge-tab';
    edgeTab.id = 'prd-drawer-edge-tab';
    edgeTab.title = '点击展开/收起需求打点面板';
    edgeTab.onclick = window.togglePRDDrawer;
    edgeTab.innerHTML = `
      <span class="prd-edge-arrow" id="prd-edge-arrow">‹</span>
      <span class="prd-edge-text">📌 需求打点 (<span id="prd-edge-count">${savedPins.length}</span>)</span>
    `;
    document.body.appendChild(edgeTab);

    // 15.3 右侧抽屉面板 (附带左边缘收起箭头按钮、卡片列表、搜索、排序与新增打点)
    const drawer = document.createElement('div');
    drawer.className = 'prd-right-drawer';
    drawer.id = 'prd-drawer';
    drawer.innerHTML = `
      <!-- 左边缘快捷收起箭头按钮 -->
      <div class="prd-drawer-left-arrow" id="prd-drawer-left-arrow" onclick="window.setPRDMode('hide')" title="点击收起需求面板">
        <span>›</span>
      </div>

      <div class="prd-drawer-header">
        <div style="font-size:14px; font-weight:700; color:#0f172a; display:flex; align-items:center; gap:6px;">
          <span>📋 ${currentPageTitle}</span>
          <span style="background:#e0f2fe; color:#0284c7; font-size:11px; padding:2px 8px; border-radius:10px; font-weight:700;" id="prd-drawer-count">${savedPins.length}</span>
        </div>
        <div style="display:flex; align-items:center; gap:4px;">
          <button class="prd-btn-action" style="font-size:11px; background:#eff6ff; color:#1d4ed8;" onclick="window.openCurrentPagePRDDoc()" title="查看整页 PRD 大屏">📑 文档</button>
          <button class="prd-btn-action" style="font-size:16px;" onclick="window.setPRDMode('hide')" title="收起抽屉">&times;</button>
        </div>
      </div>

      <div class="prd-drawer-filter-bar" style="padding:8px 12px;">
        <input type="text" placeholder="🔍 快速搜索需求标题或业务逻辑..." style="width:100%; padding:6px 10px; border:1px solid #cbd5e1; border-radius:6px; font-size:12px; outline:none; background:#fff;" oninput="searchKeyword=this.value.toLowerCase().trim(); renderRightDrawerList(); renderPinMarkers();">
      </div>

      <div class="prd-drawer-body" id="prd-drawer-list">
        <!-- 动态渲染列表 -->
      </div>

      <div class="prd-drawer-footer" style="padding:10px 14px; background:#ffffff; border-top:1px solid #e2e8f0; display:flex; gap:8px;">
        <button class="prd-btn-primary" style="flex:1;" onclick="window.setPRDMode('edit')">📍 新增打点</button>
        <button class="prd-btn-action" style="background:#f1f5f9; padding:8px 14px;" onclick="window.openCurrentPagePRDDoc()">📑 查看完整PRD</button>
      </div>
    `;
    document.body.appendChild(drawer);

    // 默认如果未展开，更新 edge tab 计数
    const edgeCount = document.getElementById('prd-edge-count');
    if (edgeCount) edgeCount.innerText = savedPins.length;
  }

  // 16. 全局 SPA 页面切换/Tab 路由点击监听与标记自适应重绘
  function triggerDelayedMarkersUpdate() {
    if (currentMode === 'hide') return;
    requestAnimationFrame(() => renderPinMarkers());
    setTimeout(renderPinMarkers, 50);
    setTimeout(renderPinMarkers, 150);
    setTimeout(renderPinMarkers, 300);
    setTimeout(renderPinMarkers, 500);
    setTimeout(renderPinMarkers, 800);
  }

  document.addEventListener('click', (e) => {
    const isNav = e.target.closest('.menu-item, .sub-menu-item, .mall-nav-item, .nav-item, [data-page], [data-target], .uc-menu-item, .tab-btn, button, a, [onclick]');
    if (isNav) {
      triggerDelayedMarkersUpdate();
    }
  }, true);

  const observer = new MutationObserver(() => {
    if (currentMode !== 'hide') {
      triggerDelayedMarkersUpdate();
    }
  });
  observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['class', 'style', 'hidden'] });

  window.addEventListener('resize', () => {
    if (currentMode !== 'hide') renderPinMarkers();
  });
  window.addEventListener('scroll', () => {
    if (currentMode !== 'hide') renderPinMarkers();
  }, true);

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initDOM();
  } else {
    document.addEventListener('DOMContentLoaded', initDOM);
  }
})();
