import os
import ast

with open("assets/img/generate_svgs.py", "r") as f:
    content = f.read()

# We will just redefine `diagrams` array in python using regex replacement of the `diagrams = [...]` block.
# Actually, I can just write a script that reads the template, and then generates the files directly, replacing generate_svgs.py completely.

new_script = '''import os

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
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="6"/>
            <circle cx="-150" cy="0" r="40" fill="#1f2937"/>
            <path d="M -170 -15 L -130 15 M -130 -15 L -170 15" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
        """
    },
    {
        "id": "time_2023",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="6"/>
            <circle cx="-30" cy="0" r="40" fill="#3b82f6"/>
            <rect x="-45" y="-15" width="30" height="30" fill="#fff" rx="4"/>
        """
    },
    {
        "id": "time_2024",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="6"/>
            <circle cx="90" cy="0" r="40" fill="#10b981"/>
            <polygon points="80,-15 110,0 80,15" fill="#fff"/>
        """
    },
    {
        "id": "time_2025",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#cbd5e1" stroke-width="6"/>
            <circle cx="210" cy="0" r="40" fill="#f59e0b"/>
            <path d="M 190 0 C 210 -30 230 -30 230 0 C 210 30 190 30 190 0 Z" fill="#fff"/>
        """
    },
    {
        "id": "prompt",
        "content": """
            <rect x="-320" y="-40" width="160" height="80" rx="8" fill="#1f2937"/>
            <path d="M -270 -10 L -210 -10 M -270 10 L -230 10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
            
            <line x1="-140" y1="0" x2="-80" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow)"/>
            
            <rect x="-50" y="-50" width="100" height="100" rx="50" fill="#3b82f6"/>
            <circle cx="0" cy="0" r="20" fill="#fff"/>
            
            <line x1="70" y1="0" x2="130" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow)"/>
            
            <rect x="160" y="-40" width="160" height="80" rx="8" fill="#10b981"/>
            <path d="M 210 -10 L 270 -10 M 210 10 L 250 10" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
            <circle cx="290" cy="-20" r="10" fill="#fff"/>
        """,
        "defs": """<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" /></marker>"""
    },
    {
        "id": "agent",
        "content": """
            <circle cx="-250" cy="0" r="60" fill="#1f2937"/>
            <circle cx="-250" cy="0" r="20" fill="#fff"/>
            
            <line x1="-170" y1="0" x2="-90" y2="0" stroke="#cbd5e1" stroke-width="6" marker-end="url(#arrow)"/>
            
            <rect x="-60" y="-70" width="120" height="140" rx="16" fill="#3b82f6"/>
            <path d="M -20 -20 L 20 -20 M -20 0 L 20 0 M -20 20 L 0 20" stroke="#fff" stroke-width="8" stroke-linecap="round"/>
            
            <line x1="80" y1="-20" x2="140" y2="-60" stroke="#cbd5e1" stroke-width="6" marker-end="url(#arrow)"/>
            <line x1="80" y1="20" x2="140" y2="60" stroke="#cbd5e1" stroke-width="6" marker-end="url(#arrow)"/>
            
            <rect x="170" y="-100" width="100" height="80" rx="12" fill="#f59e0b"/>
            <rect x="170" y="20" width="100" height="80" rx="12" fill="#10b981"/>
        """,
        "defs": """<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" /></marker>"""
    },
    {
        "id": "workflow",
        "content": """
            <circle cx="-300" cy="0" r="50" fill="#1f2937"/>
            <line x1="-230" y1="0" x2="-160" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow)"/>
            
            <rect x="-130" y="-50" width="120" height="100" rx="12" fill="#3b82f6"/>
            <line x1="10" y1="0" x2="80" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow)"/>
            
            <rect x="110" y="-50" width="120" height="100" rx="12" fill="#10b981"/>
            <line x1="250" y1="0" x2="320" y2="0" stroke="#9ca3af" stroke-width="6" marker-end="url(#arrow)"/>
            
            <circle cx="390" cy="0" r="50" fill="#f59e0b"/>
        """,
        "defs": """<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9ca3af" /></marker>"""
    },
    {
        "id": "mcp",
        "content": """
            <rect x="-350" y="-70" width="160" height="140" rx="16" fill="#1f2937"/>
            <circle cx="-270" cy="0" r="40" fill="#fff"/>
            
            <line x1="-170" y1="0" x2="-70" y2="0" stroke="#3b82f6" stroke-width="10" stroke-dasharray="12,12"/>
            <path d="M -120 -30 L -70 0 L -120 30" fill="none" stroke="#3b82f6" stroke-width="8" stroke-linecap="round"/>
            
            <rect x="-40" y="-80" width="160" height="160" rx="12" fill="#e5e7eb" stroke="#9ca3af" stroke-width="8"/>
            <rect x="-10" y="-50" width="100" height="12" fill="#9ca3af" rx="6"/>
            <rect x="-10" y="-10" width="100" height="12" fill="#9ca3af" rx="6"/>
            <rect x="-10" y="30" width="100" height="12" fill="#9ca3af" rx="6"/>
            
            <line x1="140" y1="0" x2="240" y2="0" stroke="#10b981" stroke-width="10"/>
            <path d="M 190 -30 L 240 0 L 190 30" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round"/>
            
            <path d="M 270 -60 C 270 -80 390 -80 390 -60 L 390 60 C 390 80 270 80 270 60 Z" fill="#10b981"/>
            <path d="M 270 -60 C 270 -40 390 -40 390 -60" fill="none" stroke="#fff" stroke-width="6"/>
        """
    },
    {
        "id": "prototype",
        "content": """
            <rect x="-300" y="-80" width="600" height="160" rx="8" fill="#fff" stroke="#1f2937" stroke-width="6"/>
            <line x1="-300" y1="-30" x2="300" y2="-30" stroke="#1f2937" stroke-width="6"/>
            <circle cx="-270" cy="-55" r="6" fill="#1f2937"/>
            <circle cx="-240" cy="-55" r="6" fill="#1f2937"/>
            <circle cx="-210" cy="-55" r="6" fill="#1f2937"/>
            
            <rect x="-260" y="-10" width="160" height="70" rx="4" fill="#e5e7eb"/>
            <rect x="-60" y="-10" width="160" height="70" rx="4" fill="#e5e7eb"/>
            <rect x="140" y="-10" width="120" height="70" rx="4" fill="#e5e7eb"/>
        """
    },
    {
        "id": "prd_annotator",
        "content": """
            <rect x="-200" y="-90" width="160" height="180" rx="8" fill="#fff" stroke="#1f2937" stroke-width="6"/>
            <line x1="-160" y1="-50" x2="-60" y2="-50" stroke="#9ca3af" stroke-width="6"/>
            <line x1="-160" y1="-20" x2="-80" y2="-20" stroke="#9ca3af" stroke-width="6"/>
            <line x1="-160" y1="10" x2="-60" y2="10" stroke="#9ca3af" stroke-width="6"/>
            
            <path d="M -20 -20 L 40 -20" stroke="#3b82f6" stroke-width="6" stroke-dasharray="8,8" marker-end="url(#arrow)"/>
            
            <rect x="60" y="-90" width="160" height="180" rx="8" fill="#1f2937" />
            <rect x="90" y="-50" width="100" height="8" fill="#4b5563" rx="4"/>
            <rect x="90" y="-20" width="80" height="8" fill="#4b5563" rx="4"/>
            <rect x="90" y="10" width="90" height="8" fill="#4b5563" rx="4"/>
            
            <circle cx="-80" cy="-20" r="16" fill="#ef4444" opacity="0.8"/>
            <circle cx="80" cy="-20" r="16" fill="#ef4444" opacity="0.8"/>
        """,
        "defs": """<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" /></marker>"""
    },
    {
        "id": "git_code",
        "content": """
            <line x1="-300" y1="0" x2="300" y2="0" stroke="#1f2937" stroke-width="8"/>
            <circle cx="-200" cy="0" r="20" fill="#1f2937"/>
            <circle cx="0" cy="0" r="20" fill="#1f2937"/>
            <circle cx="200" cy="0" r="20" fill="#1f2937"/>
            
            <path d="M -150 0 C -100 -80 -50 -80 0 -80 L 100 -80 C 150 -80 170 -40 200 0" fill="none" stroke="#3b82f6" stroke-width="8"/>
            <circle cx="0" cy="-80" r="16" fill="#3b82f6"/>
            <circle cx="100" cy="-80" r="16" fill="#3b82f6"/>
        """
    },
    {
        "id": "tradeoff_pros",
        "content": """
            <circle cx="-150" cy="0" r="60" fill="#10b981"/>
            <path d="M -180 0 L -160 20 L -120 -20" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="-40" y="-30" width="200" height="20" rx="10" fill="#10b981"/>
            <rect x="-40" y="10" width="140" height="20" rx="10" fill="#10b981"/>
        """
    },
    {
        "id": "tradeoff_cons",
        "content": """
            <circle cx="-150" cy="0" r="60" fill="#ef4444"/>
            <path d="M -170 -20 L -130 20 M -130 -20 L -170 20" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="-40" y="-30" width="200" height="20" rx="10" fill="#ef4444"/>
            <rect x="-40" y="10" width="160" height="20" rx="10" fill="#ef4444"/>
        """
    },
    {
        "id": "deliverables",
        "content": """
            <rect x="-300" y="-70" width="160" height="140" rx="8" fill="#fff" stroke="#1f2937" stroke-width="6"/>
            <circle cx="-220" cy="0" r="30" fill="#3b82f6"/>
            <line x1="-280" y1="-20" x2="-260" y2="20" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
            <line x1="-160" y1="-20" x2="-180" y2="20" stroke="#1f2937" stroke-width="6" stroke-linecap="round"/>
            
            <rect x="-80" y="-70" width="160" height="140" rx="8" fill="#1f2937"/>
            <line x1="-40" y1="-20" x2="40" y2="-20" stroke="#4b5563" stroke-width="8" stroke-linecap="round"/>
            <line x1="-40" y1="20" x2="20" y2="20" stroke="#4b5563" stroke-width="8" stroke-linecap="round"/>
            
            <rect x="140" y="-70" width="160" height="140" rx="8" fill="#e5e7eb" stroke="#9ca3af" stroke-width="6"/>
            <rect x="170" y="-30" width="40" height="30" rx="4" fill="#9ca3af"/>
            <rect x="230" y="10" width="40" height="30" rx="4" fill="#9ca3af"/>
            <line x1="190" y1="-15" x2="250" y2="25" stroke="#9ca3af" stroke-width="6"/>
        """
    },
    {
        "id": "data_dict",
        "content": """
            <rect x="-350" y="-80" width="700" height="160" rx="8" fill="#fff" stroke="#1f2937" stroke-width="6"/>
            <line x1="-350" y1="-30" x2="350" y2="-30" stroke="#1f2937" stroke-width="6"/>
            <line x1="-100" y1="-80" x2="-100" y2="80" stroke="#e5e7eb" stroke-width="4"/>
            <line x1="100" y1="-80" x2="100" y2="80" stroke="#e5e7eb" stroke-width="4"/>
            
            <rect x="-300" y="-60" width="80" height="12" rx="6" fill="#1f2937"/>
            <rect x="-60" y="-60" width="100" height="12" rx="6" fill="#1f2937"/>
            <rect x="140" y="-60" width="160" height="12" rx="6" fill="#1f2937"/>
            
            <rect x="-280" y="0" width="120" height="12" rx="6" fill="#9ca3af"/>
            <rect x="-40" y="0" width="80" height="12" rx="6" fill="#3b82f6"/>
            <rect x="140" y="0" width="140" height="12" rx="6" fill="#cbd5e1"/>
            
            <rect x="-280" y="40" width="100" height="12" rx="6" fill="#9ca3af"/>
            <rect x="-40" y="40" width="60" height="12" rx="6" fill="#3b82f6"/>
            <rect x="140" y="40" width="180" height="12" rx="6" fill="#cbd5e1"/>
        """
    },
    {
        "id": "openapi",
        "content": """
            <rect x="-300" y="-90" width="600" height="180" rx="12" fill="#1f2937"/>
            <circle cx="-260" cy="-55" r="8" fill="#ef4444"/>
            <circle cx="-230" cy="-55" r="8" fill="#f59e0b"/>
            <circle cx="-200" cy="-55" r="8" fill="#10b981"/>
            
            <path d="M -260 -10 Q -270 -10 -270 10 Q -270 30 -260 30" fill="none" stroke="#a78bfa" stroke-width="8" stroke-linecap="round"/>
            <path d="M 260 -10 Q 270 -10 270 10 Q 270 30 260 30" fill="none" stroke="#a78bfa" stroke-width="8" stroke-linecap="round"/>
            
            <rect x="-220" y="-10" width="120" height="12" rx="6" fill="#60a5fa"/>
            <rect x="-80" y="-10" width="200" height="12" rx="6" fill="#a3e635"/>
            <rect x="-220" y="30" width="160" height="12" rx="6" fill="#60a5fa"/>
        """
    }
]

# Remaining IDs
other_ids = [
    "apple_map", "orchestration", "ios_island",
    "skill_reverse", "strategy", "s2b2b", "chrome_research"
]

for oid in other_ids:
    diagrams.append({
        "id": oid,
        "content": f"""
            <rect x="-300" y="-80" width="600" height="160" rx="16" fill="#e5e7eb" stroke="#9ca3af" stroke-width="6"/>
            <circle cx="-150" cy="0" r="50" fill="#cbd5e1"/>
            <rect x="-50" y="-30" width="260" height="20" rx="10" fill="#9ca3af"/>
            <rect x="-50" y="10" width="180" height="20" rx="10" fill="#9ca3af"/>
        """
    })

# Add specifically apple_map, orchestration etc if we want them distinct
# But for now generic is ok to get the horizontal layout right without text
# Wait, let's make strategy and s2b2b distinct.
for d in diagrams:
    if d['id'] == 'strategy':
        d['content'] = """
            <circle cx="-200" cy="0" r="70" fill="none" stroke="#1f2937" stroke-width="12"/>
            <circle cx="-200" cy="0" r="40" fill="none" stroke="#1f2937" stroke-width="12"/>
            <circle cx="-200" cy="0" r="10" fill="#ef4444"/>
            <path d="M 0 50 L 100 -30 L 200 -10 L 300 -80" fill="none" stroke="#3b82f6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="280,-80 300,-80 300,-60" fill="none" stroke="#3b82f6" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        """
    elif d['id'] == 's2b2b':
        d['content'] = """
            <rect x="-300" y="-50" width="120" height="100" rx="12" fill="#1f2937"/>
            <line x1="-160" y1="0" x2="-80" y2="0" stroke="#cbd5e1" stroke-width="8" stroke-dasharray="12,12"/>
            <rect x="-60" y="-80" width="100" height="160" rx="12" fill="#3b82f6"/>
            <line x1="60" y1="-20" x2="160" y2="-60" stroke="#cbd5e1" stroke-width="8"/>
            <line x1="60" y1="20" x2="160" y2="60" stroke="#cbd5e1" stroke-width="8"/>
            <circle cx="220" cy="-70" r="40" fill="#10b981"/>
            <circle cx="220" cy="70" r="40" fill="#f59e0b"/>
        """

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

