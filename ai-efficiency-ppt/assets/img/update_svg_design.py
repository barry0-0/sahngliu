import os
import re

svg_template = """<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
        <linearGradient id="bg-{id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
        <linearGradient id="accent-{id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#374151" />
            <stop offset="100%" stop-color="#1f2937" />
        </linearGradient>
        <pattern id="grid-{id}" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="1" />
        </pattern>
        {defs}
    </defs>
    
    <rect width="100%" height="100%" fill="url(#bg-{id})" />
    <rect width="100%" height="100%" fill="url(#grid-{id})" opacity="0.6" />
    
    <svg viewBox="0 0 1000 300" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
        <g transform="translate(500, 150)">
            {content}
        </g>
    </svg>
    
    <rect x="0" y="100%" transform="translate(0, -6)" width="100%" height="6" fill="url(#accent-{id})" />
</svg>"""

diagrams = [
    {
        "id": "time_2022",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="4"/>
            <circle cx="-150" cy="0" r="40" fill="#1f2937"/>
            <path d="M -165 -15 L -135 15 M -135 -15 L -165 15" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
        """
    },
    {
        "id": "time_2023",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="4"/>
            <circle cx="0" cy="0" r="40" fill="#3b82f6"/>
            <rect x="-15" y="-15" width="30" height="30" fill="#fff" rx="4"/>
        """
    },
    {
        "id": "time_2024",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="4"/>
            <circle cx="150" cy="0" r="40" fill="#10b981"/>
            <polygon points="140,-15 165,0 140,15" fill="#fff"/>
        """
    },
    {
        "id": "time_2025",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="4"/>
            <circle cx="250" cy="0" r="40" fill="#f59e0b"/>
            <path d="M 235 0 Q 250 -20 265 0 Q 250 20 235 0" fill="#fff"/>
        """
    },
    {
        "id": "prompt",
        "content": """
            <rect x="-350" y="-40" width="160" height="80" rx="8" fill="#1f2937"/>
            <path d="M -300 -10 L -240 -10 M -300 10 L -260 10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
            <line x1="-160" y1="0" x2="-90" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow-prompt)"/>
            
            <rect x="-60" y="-50" width="120" height="100" rx="8" fill="#3b82f6"/>
            <circle cx="0" cy="0" r="20" fill="#fff"/>
            <circle cx="0" cy="0" r="10" fill="#3b82f6"/>
            
            <line x1="90" y1="0" x2="160" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow-prompt)"/>
            <rect x="190" y="-40" width="160" height="80" rx="8" fill="#10b981"/>
            <path d="M 230 -10 L 290 -10 M 230 10 L 270 10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
            <circle cx="310" cy="-20" r="8" fill="#fff"/>
        """,
        "defs": """<marker id="arrow-prompt" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" /></marker>"""
    },
    {
        "id": "agent",
        "content": """
            <circle cx="-250" cy="0" r="50" fill="#1f2937"/>
            <circle cx="-250" cy="0" r="20" fill="#fff"/>
            
            <path d="M -180 0 L -80 0" stroke="#cbd5e1" stroke-width="6" marker-end="url(#arrow-agent)"/>
            
            <rect x="-50" y="-60" width="100" height="120" rx="12" fill="#3b82f6"/>
            <path d="M -20 -20 L 20 -20 M -20 0 L 20 0 M -20 20 L 0 20" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
            
            <path d="M 70 0 L 150 -50" stroke="#cbd5e1" stroke-width="6" marker-end="url(#arrow-agent)"/>
            <path d="M 70 0 L 150 50" stroke="#cbd5e1" stroke-width="6" marker-end="url(#arrow-agent)"/>
            
            <rect x="170" y="-80" width="80" height="60" rx="8" fill="#f59e0b"/>
            <rect x="170" y="20" width="80" height="60" rx="8" fill="#10b981"/>
        """,
        "defs": """<marker id="arrow-agent" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" /></marker>"""
    },
    {
        "id": "workflow",
        "content": """
            <circle cx="-300" cy="0" r="40" fill="#1f2937"/>
            <line x1="-240" y1="0" x2="-160" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow-wf)"/>
            
            <rect x="-130" y="-40" width="100" height="80" rx="8" fill="#3b82f6"/>
            <line x1="-10" y1="0" x2="70" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow-wf)"/>
            
            <rect x="100" y="-40" width="100" height="80" rx="8" fill="#10b981"/>
            <line x1="220" y1="0" x2="300" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow-wf)"/>
            
            <circle cx="360" cy="0" r="40" fill="#f59e0b"/>
        """,
        "defs": """<marker id="arrow-wf" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" /></marker>"""
    },
    {
        "id": "mcp",
        "content": """
            <rect x="-350" y="-60" width="140" height="120" rx="12" fill="#1f2937"/>
            <circle cx="-280" cy="0" r="30" fill="#fff"/>
            
            <line x1="-190" y1="0" x2="-70" y2="0" stroke="#3b82f6" stroke-width="8" stroke-dasharray="10,10"/>
            <path d="M -110 -20 L -70 0 L -110 20" fill="none" stroke="#3b82f6" stroke-width="6" stroke-linecap="round"/>
            <path d="M -150 -20 L -190 0 L -150 20" fill="none" stroke="#3b82f6" stroke-width="6" stroke-linecap="round"/>
            
            <rect x="-40" y="-70" width="140" height="140" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="6"/>
            <rect x="-20" y="-50" width="100" height="10" fill="#9ca3af" rx="5"/>
            <rect x="-20" y="-20" width="100" height="10" fill="#9ca3af" rx="5"/>
            <rect x="-20" y="10" width="100" height="10" fill="#9ca3af" rx="5"/>
            
            <line x1="120" y1="0" x2="200" y2="0" stroke="#10b981" stroke-width="8"/>
            <path d="M 160 -20 L 200 0 L 160 20" fill="none" stroke="#10b981" stroke-width="6" stroke-linecap="round"/>
            
            <path d="M 230 -50 C 230 -70 330 -70 330 -50 L 330 50 C 330 70 230 70 230 50 Z" fill="#10b981"/>
            <path d="M 230 -50 C 230 -30 330 -30 330 -50" fill="none" stroke="#fff" stroke-width="4"/>
        """
    }
]

# Add more empty diagrams to prevent missing file errors
other_ids = [
    "tradeoff_pros", "tradeoff_cons", "apple_map", "orchestration", "ios_island",
    "skill_reverse", "strategy", "s2b2b", "chrome_research", "prototype",
    "prd_annotator", "git_code", "deliverables", "data_dict", "openapi"
]

for oid in other_ids:
    diagrams.append({
        "id": oid,
        "content": f"""
            <rect x="-200" y="-80" width="400" height="160" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="4"/>
            <circle cx="0" cy="0" r="40" fill="#9ca3af"/>
        """
    })

# Overwrite generate_svgs.py
with open("assets/img/generate_svgs.py", "w") as f:
    f.write("import os\n\n")
    f.write(f"svg_template = {repr(svg_template)}\n\n")
    f.write(f"diagrams = {repr(diagrams)}\n\n")
    f.write("""for d in diagrams:
    svg_str = svg_template.format(
        id=d["id"],
        content=d["content"],
        defs=d.get("defs", "")
    )
    file_path = os.path.join("assets/img", f"svg_{d['id']}.svg")
    with open(file_path, "w") as f:
        f.write(svg_str)
    print(f"Generated {file_path}")
""")

