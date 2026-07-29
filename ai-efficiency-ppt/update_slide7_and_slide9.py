import re

# ==========================================
# 1. Update Slide 7 HTML & Graph
# ==========================================

slide7_html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Slide 7 - 既有系统 MCP 自动化调研与知识结构构建</title>
    <style>
        :root {
            --bg: #ffffff;
            --primary: #1f2937;
            --accent: #374151;
            --text-main: #111827;
            --text-sub: #4b5563;
            --border: #e5e7eb;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            width: 100vw; height: 100vh; background: var(--bg); color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
            overflow: hidden; padding: 45px 65px; display: flex; flex-direction: column; justify-content: space-between;
        }
        .header { margin-bottom: 14px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .tag { font-size: 13px; font-weight: 700; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; }
        .title { font-size: 28px; font-weight: 800; color: #111827; margin-top: 4px; }

        .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; margin-top: 4px; }
        .panel {
            background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 20px;
            display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .panel-title { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 8px; }
        
        .img-box {
            width: 100%; height: 110px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border);
            margin-bottom: 10px; filter: grayscale(10%); transition: filter 0.3s ease;
        }
        .img-box:hover { filter: grayscale(0%); }
        .img-box img, .img-box svg { width: 100%; height: 100%; object-fit: cover; }
        
        .mcp-steps { display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between; }
        .mcp-step-item {
            background: #f9fafb; border: 1px solid #e5e7eb; padding: 9px 12px; border-radius: 4px; font-size: 11px; color: #374151; line-height: 1.45;
        }
        .mcp-step-item b { color: #111827; display: block; margin-bottom: 2px; font-size: 12px; }

        .file-graph-container {
            width: 100%; height: 100%; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 8px;
            display: flex; align-items: center; justify-content: center;
        }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="header">
        <div class="tag">06. Automated Research & Knowledge Graph</div>
        <div class="title">既有系统 MCP 自动化调研与多格式知识库构建</div>
    </div>

    <div class="grid">
        <!-- 左侧：MCP 调研与知识库构建原理 -->
        <div class="panel" style="animation-delay: 0.1s;">
            <div>
                <div class="panel-title">🌐 Chrome DevTools MCP 自动化调研与抓取</div>
                <div class="img-box">
                    <img src="../assets/img/svg_chrome_research.svg" alt="Chrome Research MCP">
                </div>
            </div>
            <div class="mcp-steps">
                <div class="mcp-step-item">
                    <b>1. MCP 自动化抓取调度 (Chrome DevTools MCP)</b>
                    通过 MCP 调用 `navigate_page` 自动登录千匠既有系统，利用 `evaluate_script` 秒级抓取运营端/商家端/供应商端的多级 DOM 节点与菜单拓扑。
                </div>
                <div class="mcp-step-item">
                    <b>2. 多源异构数据清洗与解析</b>
                    将抓取到的原始 DOM 快照、网络 API 报文、既有规则 Excel 账表与竞品 PDF 报告统一进行清洗、分类与结构化化提炼。
                </div>
                <div class="mcp-step-item">
                    <b>3. 模块化知识库沉淀 (Knowledge Base Build)</b>
                    输出包含 Markdown 需求大纲、CSV 权限矩阵、JSON DOM 拓扑与 Excel 字典的多格式文件链路，为后续原型生成提供完备规则源。
                </div>
            </div>
        </div>

        <!-- 右侧：丰富的文件关系图谱 SVG -->
        <div class="panel" style="animation-delay: 0.2s;">
            <div>
                <div class="panel-title">📄 多格式项目知识库文件关系图谱</div>
            </div>
            <div class="file-graph-container">
                <svg viewBox="0 0 680 400" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
                    <defs>
                        <linearGradient id="root-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#1f2937" />
                            <stop offset="100%" stop-color="#374151" />
                        </linearGradient>
                        <linearGradient id="cat-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stop-color="#3b82f6" />
                            <stop offset="100%" stop-color="#2563eb" />
                        </linearGradient>
                        <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
                            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.05"/>
                        </filter>
                    </defs>

                    <!-- Edges Level 1 to Level 2 -->
                    <path d="M 130 200 C 160 200, 170 65, 200 65" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 130 200 L 200 200" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 130 200 C 160 200, 170 335, 200 335" fill="none" stroke="#cbd5e1" stroke-width="2" />

                    <!-- Edges Level 2 to Level 3 -->
                    <!-- Cat 1 (全局与需求库) -> L3 -->
                    <path d="M 320 65 C 340 65, 350 45, 370 45" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 65 C 340 65, 350 85, 370 85" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    
                    <!-- Cat 2 (多端结构与快照) -> L3 -->
                    <path d="M 320 200 C 340 200, 350 125, 370 125" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 200 C 340 200, 350 162, 370 162" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 200 C 340 200, 350 200, 370 200" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 200 C 340 200, 350 238, 370 238" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 200 C 340 200, 350 275, 370 275" fill="none" stroke="#cbd5e1" stroke-width="2" />

                    <!-- Cat 3 (业务规则与接口) -> L3 -->
                    <path d="M 320 335 C 340 335, 350 312, 370 312" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 335 C 340 335, 350 350, 370 350" fill="none" stroke="#cbd5e1" stroke-width="2" />
                    <path d="M 320 335 C 340 335, 350 385, 370 385" fill="none" stroke="#cbd5e1" stroke-width="2" />

                    <!-- Nodes Level 1 -->
                    <g transform="translate(15, 180)">
                        <rect x="0" y="0" width="115" height="40" rx="6" fill="url(#root-grad)" filter="url(#shadow)"/>
                        <text x="57" y="24" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff" text-anchor="middle">商流项目知识库</text>
                    </g>

                    <!-- Nodes Level 2 -->
                    <g transform="translate(200, 45)">
                        <rect x="0" y="0" width="120" height="40" rx="4" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
                        <rect x="0" y="0" width="6" height="40" fill="url(#cat-grad)" rx="2"/>
                        <text x="60" y="24" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">全局与需求大纲</text>
                    </g>
                    <g transform="translate(200, 180)">
                        <rect x="0" y="0" width="120" height="40" rx="4" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
                        <rect x="0" y="0" width="6" height="40" fill="url(#cat-grad)" rx="2"/>
                        <text x="60" y="24" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">多端结构与快照</text>
                    </g>
                    <g transform="translate(200, 315)">
                        <rect x="0" y="0" width="120" height="40" rx="4" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
                        <rect x="0" y="0" width="6" height="40" fill="url(#cat-grad)" rx="2"/>
                        <text x="60" y="24" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1e293b" text-anchor="middle">业务规则与接口</text>
                    </g>

                    <!-- Nodes Level 3 (Rich Multi-format Files) -->
                    <!-- Cat 1 -->
                    <g transform="translate(370, 30)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📄 全功能与菜单目录大纲.md</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#eff6ff"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#1d4ed8" text-anchor="middle">主大纲</text>
                    </g>
                    <g transform="translate(370, 70)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📕 既有竞品分析报告.pdf</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#fef2f2"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#b91c1c" text-anchor="middle">竞品PDF</text>
                    </g>
                    
                    <!-- Cat 2 -->
                    <g transform="translate(370, 110)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📄 运营端菜单.md</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#f1f5f9"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#475569" text-anchor="middle">运营后台</text>
                    </g>
                    <g transform="translate(370, 147)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📄 商家后台菜单.md</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#f1f5f9"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#475569" text-anchor="middle">商户端</text>
                    </g>
                    <g transform="translate(370, 185)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📄 供应商端菜单.md</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#f1f5f9"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#475569" text-anchor="middle">供货端</text>
                    </g>
                    <g transform="translate(370, 223)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📄 买家端 PC 商城菜单.md</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#f1f5f9"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#475569" text-anchor="middle">买家大厅</text>
                    </g>
                    <g transform="translate(370, 260)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📦 抓取 DOM 拓扑树.json</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#fef3c7"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#b45309" text-anchor="middle">DOM拓扑</text>
                    </g>

                    <!-- Cat 3 -->
                    <g transform="translate(370, 298)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📄 千匠业务流程说明.md</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#f1f5f9"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#475569" text-anchor="middle">流程规则</text>
                    </g>
                    <g transform="translate(370, 335)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">📊 功能权限矩阵.csv</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#dcfce7"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#15803d" text-anchor="middle">RBAC表格</text>
                    </g>
                    <g transform="translate(370, 372)">
                        <rect x="0" y="0" width="240" height="28" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
                        <text x="10" y="18" font-family="sans-serif" font-size="11" font-weight="600" fill="#334155">⚙️ Swagger 接口草案.json</text>
                        <rect x="175" y="5" width="55" height="18" rx="2" fill="#f3e8ff"/><text x="202" y="17" font-family="sans-serif" font-size="9" fill="#6b21a8" text-anchor="middle">API定义</text>
                    </g>

                </svg>
            </div>
        </div>
    </div>
</body>
</html>
"""

with open('slides/slide7.html', 'w', encoding='utf-8') as f:
    f.write(slide7_html)


# ==========================================
# 2. Update Slide 9 HTML (Position 8 in index)
# De-emphasize GitHub, emphasize HTML Prototype, fix spacing & font layout
# ==========================================

slide9_html = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>Slide 9 - AI 本项目全链路实践与 HTML 原型提效</title>
    <style>
        :root {
            --bg: #ffffff;
            --primary: #1f2937;
            --accent: #374151;
            --text-main: #111827;
            --text-sub: #4b5563;
            --border: #e5e7eb;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            width: 100vw; height: 100vh; background: var(--bg); color: var(--text-main);
            font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif;
            overflow: hidden; padding: 45px 65px; display: flex; flex-direction: column; justify-content: space-between;
        }
        .header { margin-bottom: 14px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
        .tag { font-size: 13px; font-weight: 700; color: var(--accent); letter-spacing: 1px; text-transform: uppercase; }
        .title { font-size: 28px; font-weight: 800; color: #111827; margin-top: 4px; }

        .container { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; flex: 1; margin-top: 4px; }
        .box {
            background: #ffffff; border: 1px solid var(--border); border-radius: 6px; padding: 22px;
            display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 8px rgba(0,0,0,0.02);
            animation: fadeInUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .box-title { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 6px; }
        .box-desc { font-size: 13px; color: var(--text-sub); line-height: 1.5; margin-bottom: 12px; }
        
        .img-box {
            width: 100%; height: 110px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border);
            margin-bottom: 12px; filter: grayscale(10%); transition: filter 0.3s ease;
        }
        .img-box:hover { filter: grayscale(0%); }
        .img-box img, .img-box svg { width: 100%; height: 100%; object-fit: cover; }
        
        /* Flex stretch to fill card height without crowding */
        .item-list-stretched {
            display: flex; flex-direction: column; gap: 10px; flex: 1; justify-content: space-between;
        }
        .item-card {
            background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 14px; border-radius: 5px; font-size: 12px; color: #374151; line-height: 1.5;
        }
        .item-card b { color: #111827; display: block; margin-bottom: 3px; font-size: 13px; font-weight: 700; }

        @keyframes fadeInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
    </style>
</head>
<body>
    <div class="header">
        <div class="tag">08. AI Practice & HTML Prototype Highlights</div>
        <div class="title">本项目 AI 辅助全链路实践拆解与 HTML 原型提效总结</div>
    </div>

    <div class="container">
        <!-- 左侧：AI 在本项目的实践提效 -->
        <div class="box" style="animation-delay: 0.1s;">
            <div>
                <div class="box-title">⚡ AI 在本项目的 4 大全链路实践</div>
                <div class="box-desc">从既有系统调研抓取，到知识库沉淀与五端原型自动化生成。</div>
                <div class="img-box">
                    <img src="../assets/img/svg_prd_annotator.svg" alt="AI Spec Annotator">
                </div>
            </div>
            <div class="item-list-stretched">
                <div class="item-card">
                    <b>1. 既有系统 MCP 自动化抓取</b>
                    调用 Chrome DevTools MCP 秒级提取运营端、商家端与供应商端多级 DOM 与菜单拓扑。
                </div>
                <div class="item-card">
                    <b>2. 项目前期知识库沉淀</b>
                    自动生成 Markdown 功能大纲与 RBAC 权限矩阵，为后续版本迭代提供可查可复用的“第二大脑”。
                </div>
                <div class="item-card">
                    <b>3. 五端高保真原型生成</b>
                    根据结构化需求，AI 极速输出 PC 商城、H5 小程序、商家后台与运营总控 5 端交互页面。
                </div>
                <div class="item-card">
                    <b>4. 嵌入式 PRD 打点注入</b>
                    在 HTML 原型 DOM 节点上直接植入规格打点与规则卡片，实现“原型即需求文档”。
                </div>
            </div>
        </div>

        <!-- 右侧：突出 HTML 原型交互优势（弱化 GitHub 部署） -->
        <div class="box" style="animation-delay: 0.2s;">
            <div>
                <div class="box-title">🎨 HTML 交互原型优势与极速发布</div>
                <div class="box-desc">所见即所得的代码级交付，无缝沟通并顺畅发布静态预览。</div>
                <div class="img-box">
                    <img src="../assets/img/svg_git_code.svg" alt="HTML Prototype Workflow">
                </div>
            </div>
            <div class="item-list-stretched">
                <div class="item-card">
                    <b>1. 直观所见即所得 (100% 真实交互)</b>
                    原生 HTML/CSS/JS 交付，在浏览器无需安装 Axure 或插件即可体验真实动画与业务状态。
                </div>
                <div class="item-card">
                    <b>2. 原型代码直接供前端复用</b>
                    输出的 HTML/CSS 样式与 DOM 结构可直接被前端开发采纳，大幅降低研发二次还原成本。
                </div>
                <div class="item-card">
                    <b>3. 分钟级响应式迭代验证</b>
                    需求改动时只需调优 AI 指令，分钟级生成新原型，将传统以“周”为单位的改版压缩至“分钟级”。
                </div>
                <div class="item-card">
                    <b>4. 便捷云端部署与发布</b>
                    配合 GitHub Pages 或静态服务器一键发布预览链接（随改随生效），跨团队沟通透明高效。
                </div>
            </div>
        </div>
    </div>
</body>
</html>
"""

with open('slides/slide9.html', 'w', encoding='utf-8') as f:
    f.write(slide9_html)

