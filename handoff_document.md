# 咖喱粑粑 - 产业园区商流供应链系统 (S2B2C 轻量版) 项目交接文档 (Handoff Document)

本项目是一个轻量化、去资金网关、以“法务电子合同”为约束纽带、以“线下履约对账及抽佣”为核心的**大宗商品供应链商流平台高保真原型系统**。目前整体品牌主色调已更新为雅致的**紫罗兰色系 (`#ae86e7`)**。

---

## 📂 1. 项目目录结构与技术栈

项目采用 **纯前端原生架构 (HTML5 + CSS3 + Vanilla JS)**，零依赖，直接在主流浏览器中打开即可运行。

```text
├── platform/                          # 系统高保真原型核心目录
│   ├── mall.html                      # 【买家端】PC 商城（港口宽幅 Banner、意向求购、竞价大厅、个人中心）
│   ├── h5.html                        # 【买家端】H5 移动端（小程序化首页、购物车分类结算、订单中心、个人中心）
│   ├── merchant.html                  # 【商家端】PC 后台（数据中心、店铺装潢锁定、商品/上架双菜单、出价定标）
│   ├── merchant-h5.html               # 【商家端】H5 移动后台（店铺看板、商品列表、发货操作、定标管理）
│   ├── admin.html                     # 【平台运营端】园区总控后台（单级导航、店铺审核、供求/公告监控、合规下架）
│   └── assets/                        # 静态资源与前端核心代码
│       ├── css/                       # 样式表（global.css, admin.css, mall.css, h5.css）
│       └── js/                        # 业务逻辑
│           ├── components.js          # 全局 UI 核心组件（通用弹窗、分页器、付款凭证展示、状态秒切代理）
│           ├── mock-data.js           # 统一数据总线（核心内存数据库，同步多端业务状态）
│           ├── mall.js                # 买家端 PC 业务逻辑（求购/竞价/购物车/个人中心）
│           ├── h5.js                  # 买家端 H5 业务逻辑
│           ├── merchant.js            # 商家端 PC 业务逻辑
│           ├── merchant-h5.js         # 商家端 H5 业务逻辑
│           ├── admin.js               # 运营端后台业务逻辑（审核流、订单透视、报价核校、竞价监督）
│           ├── prd-data-merchant.js   # 商家端 PC PRD 打标数据
│           ├── prd-data-mall.js       # 买家端 PC PRD 打标数据
│           ├── prd-data-admin.js      # 运营端 PRD 打标数据
│           ├── prd-data-h5.js         # 买家端 H5 PRD 打标数据
│           └── prd-data-merchant-h5.js# 商家端 H5 PRD 打标数据
├── Summary/                           # 系统全景分析与字段全景整理文档
│   └── 字段表整理文档_完整版.md         # 平台全字段字典、弹窗详情与状态流转基准文档
├── .agents/                           # Agent 插件与规则配置目录
│   ├── rules/
│   │   └── grill-me.md                # 项目专属规则：强制执行 Grill-Me 追问
│   └── skills/                        # 项目自定义 Agent Skills（如 jo-html-product）
└── handoff_document.md                # 项目交接与核心架构演进文档（本文档）
```

---

## 🔄 2. 系统核心数据流动与联动机理

项目所有数据的存储与变更统一流经 `platform/assets/js/mock-data.js` 中的 `MockData` 对象：
1. **多端状态实时联动**：由于单页面共用同一内存数据库（或跨页面通过 localStorage 同步），各角色端状态是互通的。例如：商户在商家后台下架某商品，买家大厅对应卡片立即下架；商户在中选定标后，买家订单库中立即动态生成竞价类型的待签约订单。
2. **法务强约束流转**：系统不接入第三方支付，而是依靠法务合同进行双边约束。履约链条为：`意向/竞价成交 -> 生成电子合同 -> 双方在线电子盖章 -> 线下公对公汇款对账 -> 卖家发货录入物流 -> 买家确认收货结算`。

---

## 🛠️ 3. 系统核心重构模块规格说明

### 3.1 订单履约与付款凭证常态化存证机制
* **订单类型标签**：所有订单（买家 PC 个人中心、买家 H5、商家后台、运营后台）均前置突出展示交易类型标签，剔除了 `求购转单` 等杂乱类型。
  - **现行 4 种枚举值**：`现货交易订单`、`预售交易订单`、`供求交易订单`、`竞价交易订单`。三端筛选下拉均已统一。
* **货款付款凭证全生命周期常态化展示（2026-08-18 重构升级）**：
  - 在全端（商家 PC、买家 PC、买家 H5、商家 H5、运营端）订单详情中，常态化渲染「💳 电子合同与付款凭证存证」专区。
  - **待签约 (status 0) 与待付款 (status 4) 未上传凭证**：常态化渲染浅底虚线存证方框（`⏳ 买家尚未上传对公打款凭证。` / `⏳ 暂未上传对公打款凭证。请在顶部点击【去付款】提交凭证。`），确保任何状态下界面均有明确的容器占位，绝不坍缩隐藏。
  - **凭证审核中 (pending)**：展示黄色审核中提示卡片及打款凭证预览。
  - **凭证打回 (rejected)**：展示红色驳回原因，并提供【重新上传打款凭证】入口。
  - **审核通过 (passed)**：展示已上传的打款凭证附件清单（支持多附件预览）。
* **确认收货权限控制**：
  - **买家端**：仅买家（PC 个人中心及 H5）在订单处于“已发货”状态时显示【确认收货】按钮。
  - **运营端**：提供【代确认收货】按钮，拥有监管放款执行权。
  - **商家端**：**隐藏任何确认收货按钮**，仅保留录入发货物流的权限。

### 3.2 商家端：店铺装潢状态机与双场景细分
* **店铺状态机控制与双场景细分（2026-08-18 升级）**：
  - **正常营业**（绿色 Badge）：各渠道货源及现货市场展现正常，表单底部显示【保存店铺装潢】；
  - **待审核**（黄色 Badge）：资料提交后表单只读锁定（`disabled`），显示【撤回审核】；
  - **闭店中 · 场景一：强制下架/违规关停**：🔴 红色 `闭店中` 徽标（`tag-danger`），下方红框展示 `强制下架原因：[具体驳回/关停理由]`；
  - **闭店中 · 场景二：暂未开通店铺（初始未开店）**：⚪ 灰色 `闭店中` 徽标（`tag-secondary`），表单可编辑，下方告警框提示 `闭店原因：暂未开通店铺`，底部提供【提交审核】；
  - **界面精简**：移除了顶部「店铺当前状态」下方的灰色冗余副标题，保持界面结构干净利落。
* **店铺装潢表单实际字段**：仅 `商户号`（只读）、`商户名`、`店铺头像`、`店铺 Banner`、`店铺状态` **5 项**。
* **商品与上架独立双列表**：
  - 菜单拆分为独立的【商品列表】与【上架列表】。
  - **两表首列均为自增「序号」**；商品列表次列为「商品代码」（格式 `GDxxxxx`），上架列表次列为「上架单号」（格式 `LST2607010001`）。
  - 商品状态统一使用：`待审核`、`已上架`、`已下架`。已上架支持下架；已下架支持编辑与重新提交审核。

### 3.3 竞价业务：5 节点流转、公告必填字段与全端文案规范
* **竞价公告必填字段补齐（2026-08-18 落地）**：
  - 商家端新增/编辑竞价公告表单中，正式增加必填字段 **`看货地址 *`**（`inspectAddress`） 与 **`联系电话 *`**（`contactPhone`）；
  - 商家后台竞价公告列表表格正式扩充 **`看货地址`** 与 **`联系电话`** 展示列。
* **买家端竞价 5 节点流转判定精准化（2026-08-18 落地）**：
  - 严格按照买家实际履约进度判定高亮与打勾：
    1. `① 看货报名`：买家未报名（`!userApplied`）高亮第 1 节点（显示数字 `1`，无勾）；
    2. `② 现场看货`：完成看货报名后（`userApplied && !userInspected`），第 1 步打勾（`✓`），高亮第 2 节点；
    3. `③ 参加竞价`：完成现场拍照上传凭证后（`userInspected`），第 1、2 步打勾（`✓`），高亮第 3 节点参与报价；
    4. `④ 等待公布`：竞拍截止定标阶段（`status === 3`）高亮第 4 节点；
    5. `⑤ 中标付款`：竞价结束且当前买家中标（`status === 4`）高亮第 5 节点。
* **全端文案规范化与头部精简**：
  - 彻底废除“看货咨询电话/看货电话”歧义，全端统一为 **`联系电话`**；
  - 买家端（PC & H5）竞价详情头部信息区域精简，移除冗余地址与电话，将具体看货地址与联系电话集中收敛于「📋 竞拍报名须知」与「🔍 现场看货拍照」流程卡片中。

---

## 📝 4. 历次迭代改动文件一览表

### 4.1 HTML 结构文件改动
* **[`platform/admin.html`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/admin.html)**：
  - 移除了供求信息审核表格中的 `备注` 列头；增设管理表格首列 `序号` 标头；
  - 补全四个物理审核弹窗（店铺、商品、需求、公告）及只读竞价监督弹窗 `#modal-admin-bid-detail`。
* **[`platform/mall.html`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/mall.html)**：
  - 移除 Header 全局搜索与购物车角标，首页更换港口全宽背景横条；
  - 个人中心左侧菜单植入【我的购物车】与动态红点；
  - 竞价详情头部精简，强化 5 节点流程条与联系电话展示；
  - 订单详情添加常态化打款凭证存证卡片 `#pc-detail-payment-voucher-card`。
* **[`platform/merchant.html`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/merchant.html)**：
  - 店铺装修页面移除「店铺当前状态」下方多余灰色副标题说明；
  - 竞价公告管理表格增设「看货地址」与「联系电话」列，新增/编辑公告弹窗增加对应必填输入框；
  - 订单详情弹窗同步常态化展示付款凭证存证容器。
* **[`platform/h5.html`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/h5.html)** & **[`platform/merchant-h5.html`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/merchant-h5.html)**：
  - 买家 H5 与商家 H5 同步简化表单，强化 5 节点流转、联系电话规范以及常态化付款凭证展示。

### 4.2 JavaScript 逻辑文件改动
* **[`platform/assets/js/mock-data.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/mock-data.js)**：
  - 订单测试数据扩充多场景支付凭证案例（待付款未上传、待审核、已打回、已通过）；
  - 竞价公告数据补齐 `inspectAddress` 与 `contactPhone` 默认数据。
* **[`platform/assets/js/components.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/components.js)**：
  - 重构 `UI.showOrderDetail`，加入双通道货款支付凭证与未付款常态化虚线存证框渲染逻辑；
  - 植入全局状态点击秒切委托代理器，方便快速切换演示。
* **[`platform/assets/js/merchant.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/merchant.js)**：
  - 店铺装修状态细分「闭店中（红色：强制下架）」与「闭店中（灰色：暂未开通店铺）」；
  - 竞价公告列表与表单支持看货地址及联系电话；
  - 订单详情常态化渲染虚线付款凭证方框。
* **[`platform/assets/js/mall.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/mall.js)** & **[`platform/assets/js/h5.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/h5.js)**：
  - 修正买家竞价 5 节点进度判定（`buyerStepIndex` 计算逻辑），未报名严格高亮第 1 步无勾；
  - 订单详情常态化展示付款凭证容器与去付款提示。

### 4.3 2026-08-18：全平台关键业务流转与打标系统全面对齐（代码+文档+PRD 打标三位一体）
* **全景文档全面对齐**：[`Summary/字段表整理文档_完整版.md`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/Summary/字段表整理文档_完整版.md) 同步更新店铺状态双场景、竞价新增字段与 5 节点流转、订单常态化凭证存证说明。
* **PRD 打标系统 (PRD Pins) 同步**：
  - [`platform/assets/js/prd-data-merchant.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/prd-data-merchant.js)：同步 Pin 5（店铺装潢双场景）、Pin 11（订单详情付款存证）、Pin 16（竞价公告新增字段）；
  - [`platform/assets/js/prd-data-mall.js`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/platform/assets/js/prd-data-mall.js)：同步 Pin 7（竞价详情 5 节点流转与统一联系电话）、Pin 13（买家订单中心支付存证）。

---

## 🚀 5. 二次开发与联调部署说明

1. **零构建部署**：本项目为纯前端高保真系统，可直接通过 `Live Server`（或本地 Nginx/http-server）托管 `platform/` 目录进行演示及交互验收。
2. **全局事件秒切说明**：为配合业务效果演示，在任意页面点击诸如 `待付款`、`待发货`、`正常营业`、`闭店中` 等带有状态类名或标签色彩的元素时，页面会自动在预设状态集中循环轮转文字与色彩。二次开发若需要接入真实接口数据，可在 `components.js` 的事件委托中屏蔽这一演示机制。
3. **数据扩充**：若需要拓展或修改初始数据，可直接修改 `platform/assets/js/mock-data.js` 中 `MockData` 对象的初始化数组。
4. **字段对接基准**：接口联调、后端建模一律以 [Summary/字段表整理文档_完整版.md](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/Summary/字段表整理文档_完整版.md) 为准。

### 5.1 ⚠️ 当前未处置的遗留问题清单（接手必读）

| 编号 | 问题 | 位置 | 性质 |
|---|---|---|---|
| **I-01** | 买家前台仍可见【查看报价】，与 3.4 既定规则冲突 | `mall.js:668` | 待产品决策 |
| **I-02** | 运营端已结束公告（status=4）仍显示 `竞价中` | `admin.js:1259-1263` | 待修复缺陷 |
| **I-03** | 协议管理页 `#tab-config-agreement` 无侧边栏入口，功能不可达 | `admin.html:811` | 待补入口 |
| **I-04** | 「我参与的竞价」计算了中标变量却未渲染中标结果 | `mall.js:1922-1924` | 功能缺口 |
| **I-05** | 买家身份硬编码 `万通建材采购部`/`H5买家用户` | `mall.js:1901/1911` | 二开阻塞 |
| **I-06** | PC/H5/商家端发票去化「受票邮箱」，三端字段完全拉齐 | `merchant.js` / `mall.js` / `h5.js` | ✅ 已完成拉齐 |
| **I-07** | 商家端店铺装潢无资质回显（运营端可见公司名称/信用代码） | `merchant.html:218-286` | 待产品决策 |
| **I-08** | 「我参与的竞价」无排序、分页器为静态占位 | `mall.js:1897`、`mall.html:661` | 功能缺口 |

---

## 🤖 6. AI Agent 工作流与推荐 Skills (Suggested Skills)

本项目配置了严格的 Agent 协同规范与交互原则：

### 6.1 推荐 Skills 清单 (Suggested Skills)
* **`grilling` (或 `/grill-me`)**：在遇到复杂或存在歧义的业务需求时，主动向用户进行多轮单问题精准追问，梳理方案与边界条件。
* **`jo-html-product`**：严格遵循本项目前端原型设计规范、多端响应式适配及模块化原则。
* **`code-review`**：对重构或改动后的原生 JS/HTML 进行全端一致性审查。
* **`a11y-debugging`** / **`chrome-devtools`**：使用 Chrome DevTools MCP 工具进行多端页面渲染走查与实时交互验证。

### 6.2 Agent 接手与维护注意事项
1. **多端一致性原则**：修改任意业务逻辑（如竞价流转、订单状态、凭证上传）时，必须同时检查并同步 PC 商家端、PC 买家端、H5 移动商家端、H5 移动买家端以及 Admin 运营端 5 个端口。
2. **三位一体同步原则**：代码改动后，需同步更新 [`Summary/字段表整理文档_完整版.md`](file:///Users/barry/Desktop/Obsidian/XYSY/sahngliu/Summary/字段表整理文档_完整版.md) 以及对应的 `prd-data-*.js` 打标数据，确保原型与文档时刻一致。
