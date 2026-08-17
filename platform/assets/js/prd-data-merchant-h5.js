/**
 * PRD 需求数据 - merchant-h5 (H5 移动商家端)
 * 基于 Summary/字段表整理文档_完整版.md 全量高保真规格与 Mermaid 流程图
 */
window.INITIAL_PRD_DATA = [
  {
    "id": 1,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#view-shop",
    "title": "移动店铺看板与装潢",
    "type": "业务规则",
    "desc": "### 1️⃣ 店铺移动看板结构\n- **头部信息**：店铺名称、Logo 头像、经营状态 Tag（`正常营业` / `待审核` / `闭店中`）。\n- **经营大盘统计**：本月完结入账（¥）、待发货单（笔）、今日访客（人）、中标转化率（%）。\n- **装潢功能菜单**：修改店铺名称、更换 Logo、更换 Banner 通栏图；底部「保存店铺装潢」按钮。\n\n### 2️⃣ 🔄 商家入驻生命周期\n```mermaid\ngraph TB\n    A[未开店 / 闭店中]:::state\n    A -->|商家填写资料提交审核| A1[商家：提交审核]:::btn\n    A1 --> B[待审核]:::state\n    B -->|商家撤回审核| B1[商家：撤回审核]:::btn\n    B1 --> A\n    B -->|运营审核| C{运营审核店铺入驻}:::judge\n    C -->|通过| D[正常营业]:::state\n    C -->|拒绝+理由| E[闭店中 · 审核被拒]:::endState\n    D -->|商家修改资料重新提交| A1\n    D -->|运营强行关停| F[闭店中 · 强行关停]:::endState\n    F -->|商家申诉重新提交| A1\n    E -->|商家修改资料重新提交| A1\n    classDef state fill:#dbeafe,stroke:#2563eb,color:#1e40af\n    classDef btn fill:#dcfce7,stroke:#16a34a,color:#166534\n    classDef judge fill:#fef3c7,stroke:#d97706,color:#92400e\n    classDef endState fill:#f1f5f9,stroke:#64748b,color:#475569\n```"
  },
  {
    "id": 2,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#modal-mh5-edit-shop",
    "title": "Sheet：店铺申诉与重提审核",
    "type": "交互逻辑",
    "desc": "### 1️⃣ 触发入口\n店铺被关停或审核被拒时，点击「重新编辑并提交审核」。\n\n### 2️⃣ 表单字段\n- `店铺名称`（文本输入）；\n- `整改申诉说明`（多行文本框）；\n- 底部操作：`重新提交审核并上架`。"
  },
  {
    "id": 3,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#view-products",
    "title": "移动商品与上架公示管理",
    "type": "业务规则",
    "desc": "### 1️⃣ 移动商品列表\n商品主图、商品名称、销售单价、库存、上架状态（已上架/待审核/草稿）。\n\n### 2️⃣ 🔄 上架商品审核与下架流转\n```mermaid\nflowchart TB\n    A[\"草稿\"]\n    A1[\"商家：提交审核\"]\n    B[\"待审核\"]\n    C{\"运营审核上架商品\"}\n    D[\"已上架\"]\n    E[\"已下架 · 拒审\"]\n    F[\"已售罄\"]\n    G[\"已下架 · 自主\"]\n    H[\"已下架 · 强制\"]\n    A -->|\"商家提交审核\"| A1\n    A1 --> B\n    B -->|\"运营审核\"| C\n    C -->|\"通过\"| D\n    C -->|\"拒绝+理由\"| E\n    D -->|\"⚡ 库存归零或者低于起售量\"| F\n    D -->|\"商家自主下架\"| G\n    D -->|\"运营强制下架\"| H\n    E -->|\"商家修改后重新提交审核\"| A1\n    G -->|\"商家修改后重新提交审核\"| A1\n    H -->|\"商家修改后重新提交审核\"| A1\n    F -->|\"商家补货后重新提交审核\"| A1\n    classDef state fill:#dbeafe,stroke:#2563eb,color:#1e40af\n    classDef btn fill:#dcfce7,stroke:#16a34a,color:#166534\n    classDef judge fill:#fef3c7,stroke:#d97706,color:#92400e\n    classDef endState fill:#f1f5f9,stroke:#64748b,color:#475569\n```\n\n### 3️⃣ 新增上架公示公告 Sheet (#modal-mh5-add-shelf-ann)\n- 点击「新增上架公示/公告」调起；\n- 字段：`公告标题`、`选择上架商品`、`计划上架时间`；\n- 底部操作：`发布上架公告`；列表显示「公示中/已结束」及「推送首页/撤销」操作。"
  },
  {
    "id": 4,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#view-orders",
    "title": "移动订单中心与履约详情",
    "type": "业务规则",
    "desc": "### 1️⃣ 订单卡片列表\n订单编号、采购买家、订单金额（¥ 红色）、履约状态卡片，点击调起全景移动订单详情。\n\n### 2️⃣ 🔄 订单履约流转\n```mermaid\ngraph TB\n    A[订单创建]:::state\n    A --> B[待签约]:::state\n    B -->|买卖双方上传盖章合同| B1[\"买家/商家：去签约(盖章)\"]:::btn\n    B1 --> C{运营统一审核双边合同}:::judge\n    C -->|双方均通过| D[待付款]:::state\n    C -->|任一方打回| B\n    D -->|买家上传线下打款水单| D1[\"买家：去付款\"]:::btn\n    D1 --> E{运营对账审核付款凭证}:::judge\n    E -->|付款审核通过| F[待发货]:::state\n    E -->|凭证打回| D\n    F -->|卖家录入物流单号发货| F1[\"商家：去发货/立即发货\"]:::btn\n    F1 --> G[待签收]:::state\n    G -->|确认收货 / 代确认收货| G1[\"买家：确认收货 · 运营：代确认收货\"]:::btn\n    G1 --> H[已完成]:::endState\n    H --> H1[\"买家：申请发票 · 商家：开票处理\"]:::btn\n    B & D -->|取消订单| I[已取消]:::endState\n    B & D & F & G -->|运营关闭订单| J[已关闭]:::endState\n    classDef state fill:#dbeafe,stroke:#2563eb,color:#1e40af\n    classDef btn fill:#dcfce7,stroke:#16a34a,color:#166534\n    classDef judge fill:#fef3c7,stroke:#d97706,color:#92400e\n    classDef endState fill:#f1f5f9,stroke:#64748b,color:#475569\n```\n\n### 3️⃣ 移动订单详情页\n- **6 步履约进度条**：订单创建 → 合同签署 → 合同审核 → 打款与核销 → 物流发货 → 签收结清。\n- **双边主体与财务抽佣**：采购买家、买家电话（脱敏）、供应商家、卖家公司、成交总额、抽佣费率、预计抽佣金额、资金流转路径（线下汇款）。\n- **订购商品明细**：序号、货品名称、单价、履约交割数量、小计金额。\n- **合同签署与审核状态**：买方/卖方合同状态（已审核通过/已打回/已上传待审核/待上传）。\n- **货款支付凭证核实**：线下汇款回执与「查看凭证」（点击弹出建设银行记账凭证在线预览）。"
  },
  {
    "id": 5,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#mh5-contract-sign-btn",
    "title": "移动在线电子签章 & 卖家合同签署",
    "type": "交互逻辑",
    "desc": "### 1️⃣ 触发入口\n移动订单待签约卡片点击「去签约(盖章)」。\n\n### 2️⃣ 签署方式与规则\n- 签署方式页签：`上传纸质已签署合同`（默认）/ `在线电子签章（待对接）`。\n- 上传说明：最多 10 个文件，图片或文档不可混传。\n- 底部操作：`确认签署`（提交后卖家合同置为「已上传待审核」，推送运营审核）。"
  },
  {
    "id": 6,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#modal-mh5-ship",
    "title": "Sheet：移动发货登记",
    "type": "交互逻辑",
    "desc": "### 1️⃣ 触发入口\n待发货订单卡片点击「立即发货」。\n\n### 2️⃣ 表单字段字典\n- **选择物流公司 \\***：顺丰速运 / 德邦物流 / 安能物流 / 专线自建。\n- **纯文本运单号 \\***：支持手动输入或扫码录入。\n- **底部操作**：`确认提交并标记发货`。"
  },
  {
    "id": 7,
    "pageKey": "merchant-h5.html",
    "pageTitle": "H5 移动商家端",
    "selector": "#view-bidding",
    "title": "移动竞价资源与公告定标",
    "type": "业务规则",
    "desc": "### 1️⃣ 移动新增资源 Sheet (#modal-mh5-add-res)\n- 字段：`资源名称 *`、`规格描述 *`、`上传照片(拍照)`；底部「提交资源」→ 待平台审核。\n\n### 2️⃣ 移动新增/编辑公告 Sheet (#modal-mh5-add-ann)\n- 字段：`选择已审核的资源 *`、`公告标题 *`、`起拍底价 (元) *`、`竞拍截止时间 *`；底部「确认发布公告」。\n\n### 3️⃣ 🔄 移动定标与成单流转\n```mermaid\ngraph TB\n    A[关联资源发布公告 · 竞价中]:::state\n    A -->|⚡ 竞拍截止| B[等待公布]:::state\n    B -->|商家查看出价| B1[商家：选为中标]:::btn\n    B1 --> C{定标确认}:::judge\n    C -->|确认定标| D[已结束 · 自动生成买家待签约订单]:::endState\n    D --> E[进入订单履约]:::state\n    classDef state fill:#dbeafe,stroke:#2563eb,color:#1e40af\n    classDef btn fill:#dcfce7,stroke:#16a34a,color:#166534\n    classDef judge fill:#fef3c7,stroke:#d97706,color:#92400e\n    classDef endState fill:#f1f5f9,stroke:#64748b,color:#475569\n```"
  }
];
