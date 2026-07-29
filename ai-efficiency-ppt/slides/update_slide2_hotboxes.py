with open('slides/slide2.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Let's replace the whole timeline-grid in slide2.html to ensure perfection and clean layout
old_grid_start = '<div class="timeline-grid">'
old_grid_end = '</body>'

# We can replace the 5 cards inside timeline-grid
new_grid = """    <div class="timeline-grid">
        <!-- 2022.11 -->
        <div class="time-card" style="animation-delay: 0.1s;">
            <div>
                <div class="time-badge">2022 年 11 月</div>
                <div class="time-title">ChatGPT 破空出世</div>
                <div class="time-desc">OpenAI 发布 ChatGPT (GPT-3.5)，开启全球生成式 AI 大模型热潮，创下 2 个月破亿用户历史记录。</div>
            </div>
            <div class="img-box">
                <img src="../assets/img/svg_time_2022.svg" alt="2022">
            </div>
            <div class="hot-box">
                <b>🔥 核心演进与影响：</b>
                单次对话问答重塑人机交互。用户通过自然语言完成代码生成、长文撰写与知识检索，彻底拉开生成式 AI 时代大幕。
            </div>
        </div>

        <!-- 2023.03 - 2023.11 -->
        <div class="time-card" style="animation-delay: 0.2s;">
            <div>
                <div class="time-badge">2023 年 3-11 月</div>
                <div class="time-title">GPT-4 与 Coze/Dify 涌现</div>
                <div class="time-desc">GPT-4 多模态发布；Dify (2023.05) 与字节扣子 Coze (2023.11) 上线，工作流编排走入大众视角。</div>
            </div>
            <div class="img-box">
                <img src="../assets/img/svg_time_2023.svg" alt="2023">
            </div>
            <div class="hot-box">
                <b>🔥 核心演进与影响：</b>
                零代码 Agent 与可视化 Workflow 爆发。用户可自由拖拽 API 节点搭建个人 AI 助手、自媒体抓取机器人及企业客服。
            </div>
        </div>

        <!-- 2024.03 - 2024.11 -->
        <div class="time-card" style="animation-delay: 0.3s;">
            <div>
                <div class="time-badge">2024 年 3-11 月</div>
                <div class="time-title">Devin, Cursor & MCP 协议</div>
                <div class="time-desc">Devin (2024.03) 亮相；Cursor 席卷程序员圈；Anthropic (2024.11) 发布 MCP 协议，统一上下文读写标准。</div>
            </div>
            <div class="img-box">
                <img src="../assets/img/svg_time_2024.svg" alt="2024">
            </div>
            <div class="hot-box">
                <b>🔥 核心演进与影响：</b>
                从对话向 IDE 工程级辅助演进。Cursor 实现代码全库理解，MCP 确立统一数据规范，AI 可安全读写本地文件与数据库。
            </div>
        </div>

        <!-- NEW: 2024 - 2026 Dev Tooling -->
        <div class="time-card" style="animation-delay: 0.35s;">
            <div>
                <div class="time-badge">2024 - 2026 年</div>
                <div class="time-title">基建爆发：CLI, Skill, Claw</div>
                <div class="time-desc">Antigravity 终端自动化 (CLI)、原子化技能编排 (Skill) 与底层调度框架 (OpenClaw) 深度融入业务流。</div>
            </div>
            <div class="img-box">
                <img src="../assets/img/svg_time_tooling.svg" alt="tooling">
            </div>
            <div class="hot-box">
                <b>🔥 真正自主操控电脑：</b>
                突破窗口限制！在 OpenClaw 与 CLI/Skill 驱动下，AI 真正具备跨软件调配、接管终端与自动化操控电脑的能力。
            </div>
        </div>

        <!-- 2025 - 2026 -->
        <div class="time-card" style="animation-delay: 0.4s;">
            <div>
                <div class="time-badge">2025 - 2026 年</div>
                <div class="time-title">Kimi k3, GPT-5 & Gemini 3.6</div>
                <div class="time-desc">Kimi k3 深度推理爆发；GPT-5.6 / Gemini 3.6 开启超长上下文与原生多模态 Agent 新浪潮。</div>
            </div>
            <div class="img-box">
                <img src="../assets/img/svg_time_2025.svg" alt="2025">
            </div>
            <div class="hot-box">
                <b>🔥 前沿爆款与焦点新闻：</b>
                长文本深度逻辑推理、多模态实时交互，前沿旗舰大模型全面融入企业真实生产力与自动化交付。
            </div>
        </div>
    </div>
</body>
</html>"""

part1 = content.split('<div class="timeline-grid">')[0]
content = part1 + new_grid

with open('slides/slide2.html', 'w', encoding='utf-8') as f:
    f.write(content)

