import os

svg_template = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="100%" height="100%">
    <defs>
        <linearGradient id="bg-{id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f3f4f6" />
            <stop offset="100%" stop-color="#e5e7eb" />
        </linearGradient>
        <linearGradient id="accent-{id}" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#374151" />
            <stop offset="100%" stop-color="#1f2937" />
        </linearGradient>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#d1d5db" stroke-width="1" />
        </pattern>
        {defs}
    </defs>
    <rect width="100%" height="100%" fill="url(#bg-{id})" />
    <rect width="100%" height="100%" fill="url(#grid)" opacity="0.5" />
    
    <g transform="translate(400, 200)">
        {content}
    </g>
    
    <text x="30" y="40" font-family="-apple-system, sans-serif" font-size="24" font-weight="bold" fill="#111827" letter-spacing="1">{title}</text>
    <text x="30" y="70" font-family="-apple-system, sans-serif" font-size="14" font-weight="normal" fill="#4b5563">{subtitle}</text>
    
    <rect x="0" y="390" width="800" height="10" fill="url(#accent-{id})" />
</svg>"""

diagrams = [
    {
        "id": "prompt",
        "title": "PROMPT ENGINEERING",
        "subtitle": "Constraint & Context Formatting",
        "content": """
            <rect x="-150" y="-80" width="300" height="160" rx="10" fill="#ffffff" stroke="#374151" stroke-width="4"/>
            <text x="0" y="-30" font-family="sans-serif" font-size="18" font-weight="bold" fill="#1f2937" text-anchor="middle">ROLE + TASK</text>
            <line x1="-100" y1="-10" x2="100" y2="-10" stroke="#9ca3af" stroke-width="2" stroke-dasharray="5,5"/>
            <text x="0" y="20" font-family="sans-serif" font-size="16" fill="#4b5563" text-anchor="middle">Constraints & Rules</text>
            <text x="0" y="50" font-family="sans-serif" font-size="16" fill="#4b5563" text-anchor="middle">Few-Shot Examples</text>
            <circle cx="-150" cy="0" r="20" fill="#374151"/><text x="-150" y="5" fill="#fff" font-family="sans-serif" font-size="14" text-anchor="middle">IN</text>
            <circle cx="150" cy="0" r="20" fill="#1f2937"/><text x="150" y="5" fill="#fff" font-family="sans-serif" font-size="14" text-anchor="middle">OUT</text>
        """
    },
    {
        "id": "agent",
        "title": "AGENT ARCHITECTURE",
        "subtitle": "Autonomous Execution & Memory",
        "content": """
            <circle cx="0" cy="0" r="70" fill="#ffffff" stroke="#1f2937" stroke-width="6"/>
            <text x="0" y="5" font-family="sans-serif" font-size="20" font-weight="bold" fill="#1f2937" text-anchor="middle">LLM BRAIN</text>
            
            <circle cx="-120" cy="-60" r="40" fill="#f9fafb" stroke="#6b7280" stroke-width="3"/>
            <text x="-120" y="-55" font-family="sans-serif" font-size="14" fill="#374151" text-anchor="middle">Memory</text>
            
            <circle cx="120" cy="-60" r="40" fill="#f9fafb" stroke="#6b7280" stroke-width="3"/>
            <text x="120" y="-55" font-family="sans-serif" font-size="14" fill="#374151" text-anchor="middle">Tools</text>
            
            <circle cx="0" cy="100" r="40" fill="#f9fafb" stroke="#6b7280" stroke-width="3"/>
            <text x="0" y="105" font-family="sans-serif" font-size="14" fill="#374151" text-anchor="middle">Action</text>
            
            <path d="M -50 -50 L -90 -60" stroke="#374151" stroke-width="3" stroke-dasharray="4,4"/>
            <path d="M 50 -50 L 90 -60" stroke="#374151" stroke-width="3" stroke-dasharray="4,4"/>
            <path d="M 0 70 L 0 60" stroke="#374151" stroke-width="3" />
        """
    },
    {
        "id": "workflow",
        "title": "WORKFLOW CANVAS",
        "subtitle": "Multi-Step Logic Orchestration",
        "content": """
            <rect x="-200" y="-50" width="80" height="100" rx="8" fill="#fff" stroke="#1f2937" stroke-width="3"/>
            <text x="-160" y="5" font-family="sans-serif" font-size="14" fill="#1f2937" font-weight="bold" text-anchor="middle">START</text>
            
            <path d="M -120 0 L -70 0" stroke="#1f2937" stroke-width="4" marker-end="url(#arrow)"/>
            
            <rect x="-70" y="-50" width="100" height="100" rx="8" fill="#fff" stroke="#374151" stroke-width="3"/>
            <text x="-20" y="-5" font-family="sans-serif" font-size="14" fill="#1f2937" font-weight="bold" text-anchor="middle">LLM Node</text>
            <text x="-20" y="15" font-family="sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">Analyze Data</text>
            
            <path d="M 30 0 L 80 0" stroke="#1f2937" stroke-width="4" marker-end="url(#arrow)"/>
            
            <rect x="80" y="-50" width="100" height="100" rx="8" fill="#1f2937" />
            <text x="130" y="5" font-family="sans-serif" font-size="14" fill="#fff" font-weight="bold" text-anchor="middle">END</text>
        """,
        "defs": """
            <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#1f2937" />
            </marker>
        """
    },
    {
        "id": "mcp",
        "title": "MCP INTEGRATION",
        "subtitle": "Model Context Protocol",
        "content": """
            <rect x="-180" y="-60" width="120" height="120" rx="10" fill="#fff" stroke="#374151" stroke-width="4"/>
            <text x="-120" y="0" font-family="sans-serif" font-size="18" fill="#1f2937" font-weight="bold" text-anchor="middle">Claude</text>
            <text x="-120" y="20" font-family="sans-serif" font-size="12" fill="#6b7280" text-anchor="middle">LLM Engine</text>
            
            <path d="M -60 -10 L 60 -10" stroke="#1f2937" stroke-width="4" stroke-dasharray="6,4" marker-end="url(#arrow-mcp)"/>
            <path d="M 60 10 L -60 10" stroke="#1f2937" stroke-width="4" stroke-dasharray="6,4" marker-end="url(#arrow-mcp)"/>
            <text x="0" y="-20" font-family="sans-serif" font-size="14" fill="#1f2937" font-weight="bold" text-anchor="middle">MCP API</text>
            
            <rect x="60" y="-60" width="120" height="120" rx="10" fill="#1f2937" />
            <text x="120" y="-5" font-family="sans-serif" font-size="16" fill="#fff" font-weight="bold" text-anchor="middle">Local DB /</text>
            <text x="120" y="15" font-family="sans-serif" font-size="16" fill="#fff" font-weight="bold" text-anchor="middle">File System</text>
        """,
        "defs": """
            <marker id="arrow-mcp" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#1f2937" />
            </marker>
        """
    },
    {
        "id": "apple_map",
        "title": "APPLE MAPS AGENT",
        "subtitle": "System UI & Map Invocation",
        "content": """
            <rect x="-80" y="-120" width="160" height="240" rx="20" fill="#ffffff" stroke="#1f2937" stroke-width="5"/>
            <rect x="-30" y="-110" width="60" height="10" rx="5" fill="#1f2937"/>
            <rect x="-60" y="-70" width="120" height="100" rx="10" fill="#f3f4f6" stroke="#d1d5db" stroke-width="2"/>
            <path d="M -30 -20 Q 0 -50 30 -20 T -10 10" fill="none" stroke="#3b82f6" stroke-width="4"/>
            <circle cx="-30" cy="-20" r="5" fill="#ef4444"/>
            <circle cx="30" cy="-20" r="5" fill="#10b981"/>
            
            <rect x="-60" y="50" width="120" height="30" rx="8" fill="#1f2937"/>
            <text x="0" y="70" font-family="sans-serif" font-size="12" fill="#fff" font-weight="bold" text-anchor="middle">Navigate</text>
        """
    },
    {
        "id": "orchestration",
        "title": "ORCHESTRATION",
        "subtitle": "Connecting Multiple Agents",
        "content": """
            <circle cx="-100" cy="0" r="40" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>
            <text x="-100" y="5" font-family="sans-serif" font-size="12" fill="#1f2937" font-weight="bold" text-anchor="middle">Agent A</text>
            
            <circle cx="100" cy="0" r="40" fill="#ffffff" stroke="#1f2937" stroke-width="4"/>
            <text x="100" y="5" font-family="sans-serif" font-size="12" fill="#1f2937" font-weight="bold" text-anchor="middle">Agent B</text>
            
            <circle cx="0" cy="-100" r="45" fill="#1f2937" />
            <text x="0" y="-95" font-family="sans-serif" font-size="12" fill="#fff" font-weight="bold" text-anchor="middle">Manager</text>
            
            <path d="M 0 -55 L -80 -25" stroke="#374151" stroke-width="3" />
            <path d="M 0 -55 L 80 -25" stroke="#374151" stroke-width="3" />
            
            <rect x="-40" y="60" width="80" height="40" rx="5" fill="#f3f4f6" stroke="#9ca3af" stroke-width="2"/>
            <text x="0" y="85" font-family="sans-serif" font-size="12" fill="#4b5563" font-weight="bold" text-anchor="middle">Data Sync</text>
            <path d="M -80 30 L -40 60" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,2"/>
            <path d="M 80 30 L 40 60" stroke="#9ca3af" stroke-width="2" stroke-dasharray="4,2"/>
        """
    },
    {
        "id": "ios_island",
        "title": "iOS DYNAMIC ISLAND",
        "subtitle": "Live Activities & UI Overlay",
        "content": """
            <rect x="-100" y="-80" width="200" height="60" rx="30" fill="#000000" />
            <circle cx="-60" cy="-50" r="15" fill="#1f2937" stroke="#374151" stroke-width="2"/>
            <path d="M -50 -50 Q -30 -70 -10 -50 T 30 -50" fill="none" stroke="#3b82f6" stroke-width="3"/>
            <text x="50" y="-45" font-family="sans-serif" font-size="16" fill="#fff" font-weight="bold" text-anchor="middle">12:34</text>
            
            <rect x="-120" y="20" width="240" height="80" rx="20" fill="#fff" stroke="#e5e7eb" stroke-width="2" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.1))"/>
            <text x="-90" y="55" font-family="sans-serif" font-size="16" fill="#1f2937" font-weight="bold">Next Step:</text>
            <text x="-90" y="75" font-family="sans-serif" font-size="14" fill="#6b7280">Arrive at Destination</text>
            <circle cx="80" cy="60" r="15" fill="#10b981"/>
        """
    },
    {
        "id": "skill_reverse",
        "title": "SKILL REVERSE ENGINEERING",
        "subtitle": "Python Logic & Execution",
        "content": """
            <rect x="-140" y="-100" width="280" height="200" rx="8" fill="#1f2937" />
            <circle cx="-120" cy="-80" r="6" fill="#ef4444"/>
            <circle cx="-100" cy="-80" r="6" fill="#f59e0b"/>
            <circle cx="-80" cy="-80" r="6" fill="#10b981"/>
            <line x1="-140" y1="-60" x2="140" y2="-60" stroke="#374151" stroke-width="2"/>
            
            <text x="-120" y="-30" font-family="monospace" font-size="14" fill="#a78bfa">def</text>
            <text x="-90" y="-30" font-family="monospace" font-size="14" fill="#60a5fa">analyze_logic</text>
            <text x="25" y="-30" font-family="monospace" font-size="14" fill="#e5e7eb">(code):</text>
            
            <text x="-100" y="0" font-family="monospace" font-size="14" fill="#34d399"># Extract architecture</text>
            
            <text x="-100" y="30" font-family="monospace" font-size="14" fill="#e5e7eb">ast = parse(code)</text>
            
            <text x="-100" y="60" font-family="monospace" font-size="14" fill="#f472b6">return</text>
            <text x="-40" y="60" font-family="monospace" font-size="14" fill="#e5e7eb">ast.reverse()</text>
        """
    },
    {
        "id": "strategy",
        "title": "STRATEGY PPT ANALYSIS",
        "subtitle": "Data Parsing & Insights",
        "content": """
            <rect x="-120" y="-90" width="240" height="160" rx="8" fill="#fff" stroke="#1f2937" stroke-width="4"/>
            <rect x="-100" y="-70" width="200" height="40" rx="4" fill="#f3f4f6"/>
            <rect x="-100" y="-20" width="90" height="70" rx="4" fill="#1f2937"/>
            <rect x="0" y="-20" width="100" height="70" rx="4" fill="#e5e7eb"/>
            
            <circle cx="-55" cy="15" r="20" fill="#fff"/>
            <path d="M 10 10 L 90 10 M 10 30 L 70 30 M 10 50 L 80 50" stroke="#9ca3af" stroke-width="4" stroke-linecap="round"/>
            
            <path d="M 120 0 L 160 0 L 140 30 Z" fill="#374151" transform="rotate(90 140 15)"/>
        """
    },
    {
        "id": "s2b2b",
        "title": "S2B2B ARCHITECTURE",
        "subtitle": "Supplier -> Business -> Business",
        "content": """
            <rect x="-160" y="-40" width="80" height="80" rx="10" fill="#1f2937"/>
            <text x="-120" y="5" font-family="sans-serif" font-size="20" fill="#fff" font-weight="bold" text-anchor="middle">S</text>
            
            <path d="M -80 0 L -30 0" stroke="#6b7280" stroke-width="3" marker-end="url(#arrow-s2b2b)"/>
            
            <rect x="-20" y="-40" width="80" height="80" rx="10" fill="#fff" stroke="#1f2937" stroke-width="4"/>
            <text x="20" y="5" font-family="sans-serif" font-size="20" fill="#1f2937" font-weight="bold" text-anchor="middle">B</text>
            
            <path d="M 60 0 L 110 0" stroke="#6b7280" stroke-width="3" marker-end="url(#arrow-s2b2b)"/>
            
            <rect x="120" y="-40" width="80" height="80" rx="10" fill="#f3f4f6" stroke="#9ca3af" stroke-width="3"/>
            <text x="160" y="5" font-family="sans-serif" font-size="20" fill="#4b5563" font-weight="bold" text-anchor="middle">b</text>
        """,
        "defs": """
            <marker id="arrow-s2b2b" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#6b7280" />
            </marker>
        """
    },
    {
        "id": "chrome_research",
        "title": "AUTOMATED CHROME",
        "subtitle": "Web Scraping & DOM Interaction",
        "content": """
            <rect x="-150" y="-100" width="300" height="200" rx="8" fill="#fff" stroke="#1f2937" stroke-width="4"/>
            <rect x="-150" y="-100" width="300" height="30" rx="0" fill="#f3f4f6"/>
            <circle cx="-130" cy="-85" r="5" fill="#e5e7eb"/>
            <circle cx="-115" cy="-85" r="5" fill="#e5e7eb"/>
            <circle cx="-100" cy="-85" r="5" fill="#e5e7eb"/>
            <rect x="-80" y="-92" width="200" height="14" rx="7" fill="#fff" stroke="#d1d5db" stroke-width="1"/>
            
            <rect x="-120" y="-50" width="240" height="40" rx="4" fill="#e5e7eb"/>
            <rect x="-120" y="0" width="100" height="80" rx="4" fill="#f3f4f6" stroke="#9ca3af" stroke-dasharray="4,4"/>
            <rect x="-10" y="0" width="130" height="20" rx="4" fill="#e5e7eb"/>
            <rect x="-10" y="30" width="130" height="20" rx="4" fill="#e5e7eb"/>
            
            <path d="M 50 80 L 70 50 L 90 80 Z" fill="#1f2937" transform="rotate(-30 70 50) translate(0 10)"/>
            <circle cx="70" cy="50" r="6" fill="#ef4444" opacity="0.8"/>
        """
    },
    {
        "id": "prototype",
        "title": "PROTOTYPE UI",
        "subtitle": "Interactive Wireframing",
        "content": """
            <rect x="-140" y="-120" width="280" height="240" rx="6" fill="#fff" stroke="#374151" stroke-width="3"/>
            <line x1="-140" y1="-80" x2="140" y2="-80" stroke="#e5e7eb" stroke-width="2"/>
            <line x1="-60" y1="-80" x2="-60" y2="120" stroke="#e5e7eb" stroke-width="2"/>
            
            <rect x="-120" y="-105" width="40" height="10" rx="2" fill="#1f2937"/>
            <rect x="-120" y="-60" width="40" height="8" rx="2" fill="#d1d5db"/>
            <rect x="-120" y="-40" width="40" height="8" rx="2" fill="#d1d5db"/>
            <rect x="-120" y="-20" width="40" height="8" rx="2" fill="#d1d5db"/>
            
            <rect x="-40" y="-60" width="160" height="100" rx="4" fill="#f3f4f6"/>
            <circle cx="40" cy="-10" r="20" fill="#1f2937"/>
            
            <rect x="-40" y="50" width="70" height="50" rx="4" fill="#e5e7eb"/>
            <rect x="50" y="50" width="70" height="50" rx="4" fill="#e5e7eb"/>
        """
    },
    {
        "id": "prd_annotator",
        "title": "PRD ANNOTATOR",
        "subtitle": "Automated Spec Generation",
        "content": """
            <rect x="-160" y="-100" width="140" height="200" rx="4" fill="#fff" stroke="#1f2937" stroke-width="3"/>
            <line x1="-140" y1="-70" x2="-40" y2="-70" stroke="#9ca3af" stroke-width="4"/>
            <line x1="-140" y1="-50" x2="-60" y2="-50" stroke="#9ca3af" stroke-width="4"/>
            <line x1="-140" y1="-30" x2="-40" y2="-30" stroke="#9ca3af" stroke-width="4"/>
            
            <path d="M -10 -20 L 30 -20" stroke="#3b82f6" stroke-width="3" stroke-dasharray="4,4" marker-end="url(#arrow-prd)"/>
            
            <rect x="40" y="-100" width="120" height="200" rx="4" fill="#1f2937" />
            <text x="100" y="-70" font-family="sans-serif" font-size="12" fill="#fff" font-weight="bold" text-anchor="middle">SPEC v1</text>
            <rect x="60" y="-50" width="80" height="4" fill="#4b5563"/>
            <rect x="60" y="-35" width="60" height="4" fill="#4b5563"/>
            <rect x="60" y="-20" width="70" height="4" fill="#4b5563"/>
            
            <circle cx="-60" cy="-20" r="15" fill="#ef4444" opacity="0.8"/>
        """,
        "defs": """
            <marker id="arrow-prd" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
            </marker>
        """
    },
    {
        "id": "git_code",
        "title": "GITHUB REPO",
        "subtitle": "Version Control & Sync",
        "content": """
            <path d="M -20 -80 L 20 -80 L 60 -40 L 60 80 L -60 80 L -60 -40 Z" fill="#fff" stroke="#1f2937" stroke-width="4"/>
            <circle cx="-20" cy="-20" r="10" fill="#374151"/>
            <circle cx="-20" cy="40" r="10" fill="#374151"/>
            <circle cx="20" cy="10" r="10" fill="#1f2937"/>
            <line x1="-20" y1="-10" x2="-20" y2="30" stroke="#374151" stroke-width="4"/>
            <path d="M -20 -20 Q 20 -20 20 0" fill="none" stroke="#374151" stroke-width="4"/>
            
            <text x="0" y="120" font-family="monospace" font-size="16" fill="#1f2937" font-weight="bold" text-anchor="middle">git commit -m "Auto"</text>
        """
    },
    {
        "id": "deliverables",
        "title": "PHASE 1 DELIVERABLES",
        "subtitle": "HTML Prototypes & Documentation",
        "content": """
            <rect x="-150" y="-80" width="90" height="120" rx="4" fill="#fff" stroke="#374151" stroke-width="3"/>
            <text x="-105" y="-50" font-family="sans-serif" font-size="18" fill="#1f2937" font-weight="bold" text-anchor="middle">HTML</text>
            <line x1="-130" y1="-20" x2="-80" y2="-20" stroke="#d1d5db" stroke-width="4"/>
            <line x1="-130" y1="-5" x2="-90" y2="-5" stroke="#d1d5db" stroke-width="4"/>
            
            <rect x="-45" y="-60" width="90" height="120" rx="4" fill="#1f2937" stroke="#1f2937" stroke-width="3"/>
            <text x="0" y="-30" font-family="sans-serif" font-size="18" fill="#fff" font-weight="bold" text-anchor="middle">PRD</text>
            <line x1="-25" y1="0" x2="25" y2="0" stroke="#4b5563" stroke-width="4"/>
            <line x1="-25" y1="15" x2="15" y2="15" stroke="#4b5563" stroke-width="4"/>
            
            <rect x="60" y="-40" width="90" height="120" rx="4" fill="#f3f4f6" stroke="#9ca3af" stroke-width="3"/>
            <text x="105" y="-10" font-family="sans-serif" font-size="18" fill="#374151" font-weight="bold" text-anchor="middle">UML</text>
            <line x1="80" y1="20" x2="130" y2="20" stroke="#d1d5db" stroke-width="4"/>
            <line x1="80" y1="35" x2="110" y2="35" stroke="#d1d5db" stroke-width="4"/>
        """
    },
    {
        "id": "data_dict",
        "title": "DATA DICTIONARY",
        "subtitle": "Schema & Field Definitions",
        "content": """
            <rect x="-140" y="-80" width="280" height="160" rx="6" fill="#fff" stroke="#1f2937" stroke-width="4"/>
            <line x1="-140" y1="-40" x2="140" y2="-40" stroke="#1f2937" stroke-width="2"/>
            <line x1="-40" y1="-80" x2="-40" y2="80" stroke="#e5e7eb" stroke-width="2"/>
            <line x1="60" y1="-80" x2="60" y2="80" stroke="#e5e7eb" stroke-width="2"/>
            
            <text x="-90" y="-55" font-family="sans-serif" font-size="12" fill="#1f2937" font-weight="bold" text-anchor="middle">FIELD</text>
            <text x="10" y="-55" font-family="sans-serif" font-size="12" fill="#1f2937" font-weight="bold" text-anchor="middle">TYPE</text>
            <text x="100" y="-55" font-family="sans-serif" font-size="12" fill="#1f2937" font-weight="bold" text-anchor="middle">DESC</text>
            
            <text x="-90" y="-15" font-family="monospace" font-size="12" fill="#4b5563" text-anchor="middle">user_id</text>
            <text x="10" y="-15" font-family="monospace" font-size="12" fill="#3b82f6" text-anchor="middle">BIGINT</text>
            <text x="100" y="-15" font-family="sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">Primary Key</text>
            
            <text x="-90" y="15" font-family="monospace" font-size="12" fill="#4b5563" text-anchor="middle">status</text>
            <text x="10" y="15" font-family="monospace" font-size="12" fill="#3b82f6" text-anchor="middle">TINYINT</text>
            <text x="100" y="15" font-family="sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">0: Off, 1: On</text>
            
            <text x="-90" y="45" font-family="monospace" font-size="12" fill="#4b5563" text-anchor="middle">created_at</text>
            <text x="10" y="45" font-family="monospace" font-size="12" fill="#3b82f6" text-anchor="middle">DATETIME</text>
            <text x="100" y="45" font-family="sans-serif" font-size="10" fill="#6b7280" text-anchor="middle">Timestamp</text>
        """
    },
    {
        "id": "openapi",
        "title": "OPENAPI DDL CODE",
        "subtitle": "RESTful Interface Generation",
        "content": """
            <rect x="-160" y="-90" width="320" height="180" rx="8" fill="#1f2937"/>
            <circle cx="-140" cy="-70" r="5" fill="#ef4444"/>
            <circle cx="-120" cy="-70" r="5" fill="#f59e0b"/>
            <circle cx="-100" cy="-70" r="5" fill="#10b981"/>
            
            <text x="-140" y="-30" font-family="monospace" font-size="14" fill="#a78bfa">openapi:</text>
            <text x="-70" y="-30" font-family="monospace" font-size="14" fill="#a3e635">"3.0.0"</text>
            
            <text x="-140" y="-5" font-family="monospace" font-size="14" fill="#a78bfa">paths:</text>
            <text x="-120" y="20" font-family="monospace" font-size="14" fill="#60a5fa">/api/v1/orders:</text>
            <text x="-100" y="45" font-family="monospace" font-size="14" fill="#a78bfa">get:</text>
            <text x="-80" y="70" font-family="monospace" font-size="14" fill="#60a5fa">summary:</text>
            <text x="-10" y="70" font-family="monospace" font-size="14" fill="#a3e635">"List Orders"</text>
        """
    }
]

for d in diagrams:
    svg_str = svg_template.format(
        id=d["id"],
        title=d["title"],
        subtitle=d["subtitle"],
        content=d["content"],
        defs=d.get("defs", "")
    )
    file_path = os.path.join("/Users/barry/Desktop/工作/享宇森云/商流/ai-efficiency-ppt/assets/img", f"svg_{d['id']}.svg")
    with open(file_path, "w") as f:
        f.write(svg_str)
    print(f"Generated {file_path}")
