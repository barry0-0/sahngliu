with open('slides/slide2.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_card5 = """        <!-- 2025 - 2026 -->
        <div class="time-card" style="animation-delay: 0.4s;">
            <div>
                <div class="time-badge">2025 - 2026 年</div>
                <div class="time-title">DeepSeek & 全自主 Agent</div>
                <div class="time-desc">DeepSeek R1/V3 (2025.01) 震撼全球；Manus 全自主 Agent 爆火，AI 进入全自动化交付与应用爆发期。</div>
            </div>
            <div class="img-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
        <linearGradient id="bg-time_2025" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
        <linearGradient id="accent-time_2025" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#374151" />
            <stop offset="100%" stop-color="#1f2937" />
        </linearGradient>
        <pattern id="grid-time_2025" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="1" />
        </pattern>
        
    </defs>
    
    <rect width="100%" height="100%" fill="url(#bg-time_2025)" />
    <rect width="100%" height="100%" fill="url(#grid-time_2025)" opacity="0.6" />
    
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
        <g transform="translate(200, 200)">
            
            <line x1="0" y1="-200" x2="0" y2="200" stroke="#cbd5e1" stroke-width="6"/>
            <circle cx="0" cy="0" r="60" fill="#f59e0b"/>
            <path d="M -20 0 C 0 -45 30 -45 30 0 C 0 45 -20 45 -20 0 Z" fill="#fff"/>
        
        </g>
    </svg>
    
    <rect x="0" y="100%" transform="translate(0, -6)" width="100%" height="6" fill="url(#accent-time_2025)" />
</svg>
            </div>
            <div class="hot-box">
                <b>🔥 全网爆火：</b>
                开源推理大模型落地、全自动订机票酒店、全套原型与代码极速交付。
            </div>
        </div>"""

new_card5 = """        <!-- 2025 - 2026 -->
        <div class="time-card" style="animation-delay: 0.4s;">
            <div>
                <div class="time-badge">2025 - 2026 年</div>
                <div class="time-title">Kimi k3, GPT-5 & Gemini 3.6</div>
                <div class="time-desc">Kimi k3 深度推理爆发；GPT-5.6 / Gemini 3.6 开启超长上下文与原生多模态 Agent 新浪潮。</div>
            </div>
            <div class="img-box">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
    <defs>
        <linearGradient id="bg-time_2025" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#f8fafc" />
            <stop offset="100%" stop-color="#f1f5f9" />
        </linearGradient>
        <linearGradient id="accent-time_2025" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#374151" />
            <stop offset="100%" stop-color="#1f2937" />
        </linearGradient>
        <pattern id="grid-time_2025" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#e2e8f0" stroke-width="1" />
        </pattern>
        
    </defs>
    
    <rect width="100%" height="100%" fill="url(#bg-time_2025)" />
    <rect width="100%" height="100%" fill="url(#grid-time_2025)" opacity="0.6" />
    
    <svg viewBox="0 0 400 400" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
        <g transform="translate(200, 200)">
            
            <line x1="0" y1="-200" x2="0" y2="200" stroke="#cbd5e1" stroke-width="6"/>
            <circle cx="0" cy="0" r="60" fill="#f59e0b"/>
            <path d="M -20 0 C 0 -45 30 -45 30 0 C 0 45 -20 45 -20 0 Z" fill="#fff"/>
        
        </g>
    </svg>
    
    <rect x="0" y="100%" transform="translate(0, -6)" width="100%" height="6" fill="url(#accent-time_2025)" />
</svg>
            </div>
            <div class="hot-box">
                <b>🔥 前沿爆款与焦点新闻：</b>
                长文本强化推理、多模态实时交互、前沿旗舰模型全面赋能复杂业务。
            </div>
        </div>"""

content = content.replace(old_card5, new_card5)

with open('slides/slide2.html', 'w', encoding='utf-8') as f:
    f.write(content)

