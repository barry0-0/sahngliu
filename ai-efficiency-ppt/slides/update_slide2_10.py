import re

# UPDATE SLIDE 2
with open('slides/slide2.html', 'r') as f:
    content = f.read()

parts = content.split('<div class="hot-box">')
if len(parts) == 5:
    content = parts[0] + '<div class="img-box"><img src="../assets/img/svg_time_2022.svg" alt="Time 2022"></div>\n            <div class="hot-box">' + parts[1] + \
              '<div class="img-box"><img src="../assets/img/svg_time_2023.svg" alt="Time 2023"></div>\n            <div class="hot-box">' + parts[2] + \
              '<div class="img-box"><img src="../assets/img/svg_time_2024.svg" alt="Time 2024"></div>\n            <div class="hot-box">' + parts[3] + \
              '<div class="img-box"><img src="../assets/img/svg_time_2025.svg" alt="Time 2025"></div>\n            <div class="hot-box">' + parts[4]
    
    if '.img-box' not in content:
        content = content.replace('</style>', '        .img-box { width: 100%; height: 90px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 8px; }\n        .img-box img, .img-box svg { width: 100%; height: 100%; object-fit: cover; display: block; }\n    </style>')

    with open('slides/slide2.html', 'w') as f:
        f.write(content)

# UPDATE SLIDE 10
with open('slides/slide10.html', 'r') as f:
    content = f.read()

content = content.replace(
    '<div class="panel-title pros">\n                <span>🚀 实践探索核心优势 (Core Advantages)</span>\n            </div>',
    '<div class="panel-title pros">\n                <span>🚀 实践探索核心优势 (Core Advantages)</span>\n            </div>\n            <div class="img-box"><img src="../assets/img/svg_tradeoff_pros.svg" alt="Tradeoff Pros"></div>'
)

content = content.replace(
    '<div class="panel-title cons">\n                <span>⚠️ 潜在局限与改进方向 (Limitations)</span>\n            </div>',
    '<div class="panel-title cons">\n                <span>⚠️ 潜在局限与改进方向 (Limitations)</span>\n            </div>\n            <div class="img-box"><img src="../assets/img/svg_tradeoff_cons.svg" alt="Tradeoff Cons"></div>'
)

if '.img-box' not in content:
    content = content.replace('</style>', '        .img-box { width: 100%; height: 160px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border); margin-bottom: 12px; }\n        .img-box img, .img-box svg { width: 100%; height: 100%; object-fit: cover; display: block; }\n    </style>')

with open('slides/slide10.html', 'w') as f:
    f.write(content)

