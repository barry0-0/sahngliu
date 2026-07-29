import re

with open('slides/slide7.html', 'r', encoding='utf-8') as f:
    content = f.read()

svg_graph = """<div class="file-graph-container" style="width: 100%; height: 380px; margin-top: 16px; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px;">
    <svg viewBox="0 0 680 380" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
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
        <path d="M 140 190 C 170 190, 180 60, 210 60" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 140 190 L 210 190" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 140 190 C 170 190, 180 320, 210 320" fill="none" stroke="#cbd5e1" stroke-width="2" />

        <!-- Edges Level 2 to Level 3 -->
        <!-- Cat 1 to L3 -->
        <path d="M 330 60 L 380 60" fill="none" stroke="#cbd5e1" stroke-width="2" />
        
        <!-- Cat 2 to L3 -->
        <path d="M 330 190 C 350 190, 360 110, 380 110" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 330 190 C 350 190, 360 155, 380 155" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 330 190 C 350 190, 360 200, 380 200" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 330 190 C 350 190, 360 245, 380 245" fill="none" stroke="#cbd5e1" stroke-width="2" />

        <!-- Cat 3 to L3 -->
        <path d="M 330 320 C 350 320, 360 280, 380 280" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 330 320 C 350 320, 360 325, 380 325" fill="none" stroke="#cbd5e1" stroke-width="2" />
        <path d="M 330 320 C 350 320, 360 370, 380 370" fill="none" stroke="#cbd5e1" stroke-width="2" />

        <!-- Nodes Level 1 -->
        <g transform="translate(20, 170)">
            <rect x="0" y="0" width="120" height="40" rx="6" fill="url(#root-grad)" filter="url(#shadow)"/>
            <text x="60" y="24" font-family="sans-serif" font-size="14" font-weight="bold" fill="#ffffff" text-anchor="middle">知识结构整理</text>
        </g>

        <!-- Nodes Level 2 -->
        <g transform="translate(210, 40)">
            <rect x="0" y="0" width="120" height="40" rx="4" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
            <rect x="0" y="0" width="6" height="40" fill="url(#cat-grad)" rx="2"/>
            <text x="60" y="24" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">全局知识大纲</text>
        </g>
        <g transform="translate(210, 170)">
            <rect x="0" y="0" width="120" height="40" rx="4" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
            <rect x="0" y="0" width="6" height="40" fill="url(#cat-grad)" rx="2"/>
            <text x="60" y="24" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">多端菜单结构</text>
        </g>
        <g transform="translate(210, 300)">
            <rect x="0" y="0" width="120" height="40" rx="4" fill="#ffffff" stroke="#3b82f6" stroke-width="2" filter="url(#shadow)"/>
            <rect x="0" y="0" width="6" height="40" fill="url(#cat-grad)" rx="2"/>
            <text x="60" y="24" font-family="sans-serif" font-size="13" font-weight="bold" fill="#1e293b" text-anchor="middle">业务与底层支撑</text>
        </g>

        <!-- Nodes Level 3 (Files) -->
        <!-- Cat 1 -->
        <g transform="translate(380, 45)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 全功能与菜单目录大纲.md</text>
        </g>
        
        <!-- Cat 2 -->
        <g transform="translate(380, 95)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 运营端菜单.md</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#f1f5f9"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">运营后台</text>
        </g>
        <g transform="translate(380, 140)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 商家后台菜单.md</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#f1f5f9"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">商户端</text>
        </g>
        <g transform="translate(380, 185)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 供应商端菜单.md</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#f1f5f9"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">供货端</text>
        </g>
        <g transform="translate(380, 230)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 买家端 PC 商城菜单.md</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#f1f5f9"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">买家大厅</text>
        </g>

        <!-- Cat 3 -->
        <g transform="translate(380, 265)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 千匠业务流程说明.md</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#f1f5f9"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">流程拓扑</text>
        </g>
        <g transform="translate(380, 310)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📊 功能权限矩阵.csv</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#fef3c7"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#92400e" text-anchor="middle">RBAC</text>
        </g>
        <g transform="translate(380, 355)">
            <rect x="0" y="0" width="220" height="30" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" filter="url(#shadow)"/>
            <text x="12" y="19" font-family="sans-serif" font-size="12" font-weight="600" fill="#334155">📄 接口调研大纲.md</text>
            <rect x="150" y="6" width="60" height="18" rx="2" fill="#f1f5f9"/>
            <text x="180" y="18" font-family="sans-serif" font-size="9" fill="#64748b" text-anchor="middle">API 骨架</text>
        </g>

    </svg>
</div>"""

# Replace the file-list with svg_graph
pattern = re.compile(r'<div class="file-list">.*?</div>\s*</div>', re.DOTALL)
content = pattern.sub(svg_graph + "\n            </div>", content)

with open('slides/slide7.html', 'w', encoding='utf-8') as f:
    f.write(content)

