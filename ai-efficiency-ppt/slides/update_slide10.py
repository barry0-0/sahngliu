import re

with open('slides/slide10.html', 'r') as f:
    content = f.read()

# Insert image box for pros
content = content.replace(
    '<div class="panel-title pros">\n                <span>🚀 实践探索核心优势 (Core Advantages)</span>\n            </div>',
    '<div class="panel-title pros">\n                <span>🚀 实践探索核心优势 (Core Advantages)</span>\n            </div>\n            <div class="img-box"><img src="../assets/img/svg_tradeoff_pros.svg" alt="Tradeoff Pros"></div>'
)

# Insert image box for cons
content = content.replace(
    '<div class="panel-title cons">\n                <span>⚠️ 潜在局限与改进方向 (Limitations)</span>\n            </div>',
    '<div class="panel-title cons">\n                <span>⚠️ 潜在局限与改进方向 (Limitations)</span>\n            </div>\n            <div class="img-box"><img src="../assets/img/svg_tradeoff_cons.svg" alt="Tradeoff Cons"></div>'
)

if '.img-box' not in content:
    content = content.replace('</style>', '        .img-box { width: 100%; height: 160px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 12px; }\n        .img-box img, .img-box svg { width: 100%; height: 100%; object-fit: cover; display: block; }\n    </style>')

with open('slides/slide10.html', 'w') as f:
    f.write(content)

