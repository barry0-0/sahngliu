import re

with open('assets/img/generate_svgs.py', 'r') as f:
    content = f.read()

# 1. Update viewBox and scale
content = content.replace('viewBox="0 0 800 400"', 'viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet"')
content = content.replace('transform="translate(400, 200)"', 'transform="translate(400, 180) scale(1.6)"')

# Prototype SVG has its own viewBox
content = content.replace('viewBox="0 0 800 360"', 'viewBox="0 0 800 360" preserveAspectRatio="xMidYMid meet"')

# 2. Update Prototype SVGs scale
content = content.replace('transform="translate(400, 180)"', 'transform="translate(400, 180) scale(1.4)"')

# 3. Add new diagrams
new_diagrams = """
    {
        "id": "time_2022",
        "title": "2022 - THE AWAKENING",
        "subtitle": "ChatGPT & Foundation Models",
        "content": '''
            <rect x="-120" y="-80" width="240" height="160" rx="8" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>
            <path d="M -40 -30 L 40 -30 L 0 30 Z" fill="#374151" />
            <text x="0" y="60" font-family="sans-serif" font-size="18" fill="#111827" font-weight="bold" text-anchor="middle">GPT-3.5 Release</text>
        '''
    },
    {
        "id": "time_2023",
        "title": "2023 - THE EXPLOSION",
        "subtitle": "Multimodal & Open Source",
        "content": '''
            <rect x="-120" y="-80" width="240" height="160" rx="8" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>
            <circle cx="-40" cy="-20" r="25" fill="#374151" />
            <rect x="15" y="-45" width="50" height="50" rx="4" fill="#6b7280" />
            <text x="0" y="60" font-family="sans-serif" font-size="18" fill="#111827" font-weight="bold" text-anchor="middle">GPT-4 & Llama</text>
        '''
    },
    {
        "id": "time_2024",
        "title": "2024 - THE AGENT ERA",
        "subtitle": "Autonomous Workflows & Reasoning",
        "content": '''
            <rect x="-120" y="-80" width="240" height="160" rx="8" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>
            <circle cx="-50" cy="-20" r="15" fill="#374151" />
            <circle cx="0" cy="-20" r="15" fill="#4b5563" />
            <circle cx="50" cy="-20" r="15" fill="#6b7280" />
            <path d="M -35 -20 L -15 -20 M 15 -20 L 35 -20" stroke="#1f2937" stroke-width="4"/>
            <text x="0" y="60" font-family="sans-serif" font-size="18" fill="#111827" font-weight="bold" text-anchor="middle">Agentic Frameworks</text>
        '''
    },
    {
        "id": "time_2025",
        "title": "2025/26 - AGI HORIZON",
        "subtitle": "Deep Research & Multimodal Agents",
        "content": '''
            <rect x="-120" y="-80" width="240" height="160" rx="8" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>
            <polygon points="0,-40 -30,10 30,10" fill="#374151" />
            <circle cx="0" cy="10" r="30" fill="none" stroke="#1f2937" stroke-width="4" />
            <text x="0" y="60" font-family="sans-serif" font-size="18" fill="#111827" font-weight="bold" text-anchor="middle">System 2 Thinking</text>
        '''
    },
    {
        "id": "tradeoff_pros",
        "title": "PROS: AI EFFICIENCY",
        "subtitle": "Speed & Scalability",
        "content": '''
            <rect x="-120" y="-80" width="240" height="160" rx="8" fill="#ffffff" stroke="#10b981" stroke-width="4"/>
            <path d="M -20 10 L 0 30 L 40 -20" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round"/>
        '''
    },
    {
        "id": "tradeoff_cons",
        "title": "CONS: AI LIMITATIONS",
        "subtitle": "Context Limits & Hallucination",
        "content": '''
            <rect x="-120" y="-80" width="240" height="160" rx="8" fill="#ffffff" stroke="#ef4444" stroke-width="4"/>
            <path d="M -20 -20 L 20 20 M 20 -20 L -20 20" fill="none" stroke="#ef4444" stroke-width="8" stroke-linecap="round"/>
        '''
    },
"""

if 'time_2022' not in content:
    content = content.replace('diagrams = [', 'diagrams = [' + new_diagrams)

with open('assets/img/generate_svgs.py', 'w') as f:
    f.write(content)

