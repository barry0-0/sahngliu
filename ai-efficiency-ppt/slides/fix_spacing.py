import re

# ================================
# Fix slide7.html
# ================================
with open('slides/slide7.html', 'r', encoding='utf-8') as f:
    s7 = f.read()

# Replace .img-box height and .mcp-steps styling in slide7
s7 = s7.replace('.img-box {\n            width: 100%; height: 110px;', '.img-box {\n            width: 100%; height: 150px;')
s7 = s7.replace('.mcp-steps { display: flex; flex-direction: column; gap: 8px; flex: 1; justify-content: space-between; }',
                '.mcp-steps { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }')
s7 = s7.replace('.mcp-step-item {\n            background: #f9fafb; border: 1px solid #e5e7eb; padding: 9px 12px; border-radius: 4px; font-size: 11px; color: #374151; line-height: 1.45;\n        }',
                '.mcp-step-item {\n            background: #f9fafb; border: 1px solid #e5e7eb; border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 4px; font-size: 12px; color: #374151; line-height: 1.5;\n        }')

with open('slides/slide7.html', 'w', encoding='utf-8') as f:
    f.write(s7)


# ================================
# Fix slide9.html (Position 8 in index)
# ================================
with open('slides/slide9.html', 'r', encoding='utf-8') as f:
    s9 = f.read()

# Make img-box taller (160px) and item-list a 2x2 grid so items don't stretch vertically
s9 = s9.replace('.img-box {\n            width: 100%; height: 110px;', '.img-box {\n            width: 100%; height: 160px;')
s9 = s9.replace('.item-list-stretched {\n            display: flex; flex-direction: column; gap: 10px; flex: 1; justify-content: space-between;\n        }',
                '.item-list-stretched {\n            display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 14px;\n        }')

s9 = s9.replace('.item-card {\n            background: #f9fafb; border: 1px solid #e5e7eb; padding: 12px 14px; border-radius: 5px; font-size: 12px; color: #374151; line-height: 1.5;\n        }',
                '.item-card {\n            background: #f9fafb; border: 1px solid #e5e7eb; border-top: 3px solid #374151; padding: 12px 14px; border-radius: 5px; font-size: 12px; color: #374151; line-height: 1.5;\n        }')

with open('slides/slide9.html', 'w', encoding='utf-8') as f:
    f.write(s9)

