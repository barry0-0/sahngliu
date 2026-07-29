import re

with open('assets/img/generate_svgs.py', 'r') as f:
    content = f.read()

new_template = '''svg_template = """<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
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
    
    <!-- Background that perfectly fills the container -->
    <rect width="100%" height="100%" fill="url(#bg-{id})" />
    <rect width="100%" height="100%" fill="url(#grid-{id})" opacity="0.6" />
    
    <!-- Scaled inner drawing -->
    <svg viewBox="0 0 800 400" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
        <g transform="translate(400, 200) scale(1.6)">
            {content}
        </g>
    </svg>
    
    <!-- Title and Subtitle at fixed top-left -->
    <text x="24" y="32" font-family="-apple-system, sans-serif" font-size="18" font-weight="800" fill="#0f172a" letter-spacing="0.5">{title}</text>
    <text x="24" y="52" font-family="-apple-system, sans-serif" font-size="12" font-weight="600" fill="#64748b">{subtitle}</text>
    
    <!-- Bottom accent line -->
    <rect x="0" y="100%" transform="translate(0, -6)" width="100%" height="6" fill="url(#accent-{id})" />
</svg>"""'''

pattern = re.compile(r'"""<svg xmlns.*?</svg>"""', re.DOTALL)
content = pattern.sub(new_template.split('=', 1)[1].strip(), content)

# I also need to put 'svg_template = ' back because I removed it!
content = content.replace('"""<svg xmlns', 'svg_template = """<svg xmlns', 1)

with open('assets/img/generate_svgs.py', 'w') as f:
    f.write(content)
