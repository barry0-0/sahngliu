# 享宇森云 - S2B2C 供应链商流交易系统 (Shangliu Platform)

本项目是享宇森云专为大宗商品及供应链交易打造的 **S2B2C 供应链商流平台** 原型系统。系统通过高保真的交互原型，完整还原了**买家端（PC+H5双端）**、**商家端（PC+H5双端）**以及**平台运营端（PC）**的全链路交易与监管流程。

---

## 📂 项目目录结构

```text
├── platform/                          # 系统高保真原型核心目录
│   ├── mall.html                      # 【买家端】PC 商城（大宗求购、竞价大厅、商品交易、商户搜索）
│   ├── h5.html                        # 【买家端】H5 移动商城（极简快捷下单、购物车、竞价筛选、个人中心）
│   ├── merchant.html                  # 【商家端】PC 管理后台（商品上架、报价处理、合同拟定、订单履约）
│   ├── merchant-h5.html               # 【商家端】H5 移动后台（轻量化店铺指标、移动报价、竞价查看）
│   ├── admin.html                     # 【平台端】运营管理后台（BI报表、商家店铺监管关停、分类数据字典、交易/竞价监控、商城配置）
│   └── assets/                        # 静态资源与前端核心代码
│       ├── css/                       # 样式表（global.css, admin.css, h5.css）
│       └── js/                        # 业务逻辑（mall.js, h5.js, admin.js, components.js, mock-data.js）
├── PRD_采销云简易版_S2B2C供应链系统.md   # 核心产品需求文档 (PRD)
├── 全功能与菜单目录大纲.md               # 平台全量功能思维图谱与架构大纲
└── README.md                          # 项目说明文件
```

---

## 🌟 核心业务板块与链路

### 1. 现货商城交易链 (Spot Trading)
* **业务流**：商家在【商家端】发布并上架钢材、木材等工业/大宗货品 $\rightarrow$ 买家在【买家商城】（PC/H5）通过分类/商户筛选浏览商品 $\rightarrow$ 支持快捷修改数量一键加入购物车 $\rightarrow$ 购物车多商户合并结算生成订单 $\rightarrow$ 订单转入双边待签约、待发货、待收货履约状态。

### 2. 大宗求购与货源报价链 (Sourcing & RFQ)
* **业务流**：买家发布“最新求购信息” $\rightarrow$ 运营人员在【运营后台】审核该求购 $\rightarrow$ 审核通过后信息在商城首页及求购专区置顶轮播 $\rightarrow$ 商家在【商家后台】针对需求进行货源报价（支持拟定单价、交货期等参数） $\rightarrow$ 买家确认合适报价生成合同。

### 3. 物资竞价大厅 (Bidding Hall)
* **业务流**：发布竞价公告 $\rightarrow$ 买家（交纳保证金后）在竞价大厅参与多轮动态出价 $\rightarrow$ 出价记录根据底价和最新报价实时更新，H5端支持“竞价中”和“已结束”分类筛选 $\rightarrow$ 竞价时间截止，系统自动锁定最高报价者胜出。

### 4. 平台强效合规监管 (Compliance & Suspension)
* **业务流**：【运营管理后台】设立独立 **“商家店铺管理”** 看板 $\rightarrow$ 透视全平台商户的商品数量、社会信用代码和经营状态 $\rightarrow$ 运营人员可对违规店铺执行**“强行关停”**并强制录入违规理由 $\rightarrow$ 店铺被关停后前台商城同步下架，保护交易安全。

---

## 🛠️ 技术选型与实现亮点

* **纯前端无状态高保真架构**：采用 Vanilla HTML5、Vanilla CSS3 以及纯原生 ES6+ JavaScript 编写，无需配置复杂的 Node.js、构建打包等后端依赖环境。
* **统一数据状态总线 (Mock Mock-Data)**：核心数据资产集中在 [mock-data.js](file:///Users/barry/Desktop/工作/享宇森云/商流/platform/assets/js/mock-data.js) 内。多端视图的增删改查（如商铺关停、发布出价、添加购物车）均通过该状态总线读取更新，实现了高仿真、可联动闭环的交互体验。
* **精美奢华的设计美学**：
  * 使用科技蓝与轻奢紫作为品牌色（Tailored HSL），在管理后台大量融入 ECharts 可视化 BI 仪表盘。
  * 抛弃设备差异化的默认 emoji，全面采用 **SVG 矢量图标库** 进行界面点缀，针对高频动作（如 H5 沟通、购物车、待签约/发货/收货订单状态）进行了微交互动效美化。

---

## 🚀 快速运行与演示

1. **直接启动**：
   无需安装任何运行依赖。直接进入 `platform/` 目录，双击您需要体验的端（如 [mall.html](file:///Users/barry/Desktop/工作/享宇森云/商流/platform/mall.html) 或 [admin.html](file:///Users/barry/Desktop/工作/享宇森云/商流/platform/admin.html)），在主流现代浏览器（Chrome/Safari/Edge）中打开即可。
2. **完美开发体验**：
   推荐在 VS Code 等编辑器中安装 `Live Server` 插件启动，可在多端（如模拟手机端调试 H5）之间获得最佳的热更新体验。
