import re

# 1. Update slide3.html (AI 核心能力：Prompt, Agent & Markdown)
with open('slides/slide3.html', 'r', encoding='utf-8') as f:
    s3 = f.read()

s3 = s3.replace(
    '<div class="title">AI 核心技术深度拆解：为什么用、用来做什么、如何使用 (Prompt & Agent)</div>',
    '<div class="title">AI 核心功能与人机协同载体：Prompt, Agent & Markdown</div>'
)

# Update four-step for Prompt to include Markdown readability
old_prompt_steps = """<div class="four-step">
                    <div class="step-item"><b>1. 为什么有？</b>大模型需要明确上下文与角色指令才能精准回答。</div>
                    <div class="step-item"><b>2. 用来干什么？</b>限定回答角色、输出格式（如 JSON）与思考链 (CoT)。</div>
                    <div class="step-item"><b>3. 为什么要用？</b>防止 AI 幻觉乱答，获得结构化高质产出。</div>
                    <div class="step-item"><b>4. 如何使用？</b>给定“角色 + 任务 + 限制 + 样例 (Few-shot)”。</div>
                </div>"""

new_prompt_steps = """<div class="four-step">
                    <div class="step-item"><b>1. 为什么有？</b>大模型需要明确角色与上下文指令，避免回答发散。</div>
                    <div class="step-item"><b>2. Markdown 载体：</b>人类易读易写、AI 极为节省 Token 的最佳结构化文本。</div>
                    <div class="step-item"><b>3. 为什么要用？</b>约束 AI 输出规范，消除沟通歧义，获得高质量沉淀。</div>
                    <div class="step-item"><b>4. 如何使用？</b>给定“角色 + 任务 + 格式限制 + Few-shot 示例”。</div>
                </div>"""

s3 = s3.replace(old_prompt_steps, new_prompt_steps)

with open('slides/slide3.html', 'w', encoding='utf-8') as f:
    f.write(s3)


# 2. Update slide4.html (AI 核心能力：Workflow, MCP & HTML)
with open('slides/slide4.html', 'r', encoding='utf-8') as f:
    s4 = f.read()

s4 = s4.replace(
    '<div class="title">AI 核心技术深度拆解：为什么用、用来做什么、如何使用 (Workflow & MCP)</div>',
    '<div class="title">AI 核心功能与人机协同载体：Workflow, MCP & HTML 交互</div>'
)

old_workflow_steps = """<div class="four-step">
                    <div class="step-item"><b>1. 为什么有？</b>纯 LLM 自由度过高，复杂业务需要严格约束执行路线。</div>
                    <div class="step-item"><b>2. 用来干什么？</b>拖拽 API 请求、条件分支与大模型处理形成连线。</div>
                    <div class="step-item"><b>3. 为什么要用？</b>兼顾 AI 智能理解与传统软件的确定性稳定性。</div>
                    <div class="step-item"><b>4. 如何使用？</b>在 Dify/Coze 画布画流程图并配置参数。</div>
                </div>"""

new_workflow_steps = """<div class="four-step">
                    <div class="step-item"><b>1. 为什么有？</b>纯 LLM 自由度过高，复杂业务需要强硬逻辑约束。</div>
                    <div class="step-item"><b>2. HTML 载体：</b>高保真所见即所得，无需开发环境即可在浏览器点击交互。</div>
                    <div class="step-item"><b>3. 为什么要用？</b>兼顾 AI 智能理解与传统软件的可控确定性。</div>
                    <div class="step-item"><b>4. 如何使用？</b>图形化拖拽 API 与分支节点，编排自动化流程。</div>
                </div>"""

s4 = s4.replace(old_workflow_steps, new_workflow_steps)

with open('slides/slide4.html', 'w', encoding='utf-8') as f:
    f.write(s4)


# 3. Enrich slide9.html with Knowledge Base Accumulation and AI Prototyping advantages
with open('slides/slide9.html', 'r', encoding='utf-8') as f:
    s9 = f.read()

s9_rich_item_grid = """<div class="item-grid">
                <div class="item">
                    <b>1. 项目前期知识库沉淀</b>
                    将既有系统拓扑与菜单规则沉淀为 Markdown 知识库，不仅当前提效，更成为后续版本迭代时 AI 可快速复用的“第二大脑”。
                </div>
                <div class="item">
                    <b>2. 规格与代码零延迟同源</b>
                    AI 自动在 HTML 节点上植入 PRD 卡片打点，需求变更时仅需调优 AI 指令即可同步更新原型与规约，避免两套文档脱节。
                </div>
                <div class="item">
                    <b>3. 自动补全边界与逻辑遗漏</b>
                    AI 生成规格时自动补充异常状态（如网络超时、空数据、权限拦截），大幅减少评审会上研发与测试的反复确认成本。
                </div>
                <div class="item">
                    <b>4. 响应式敏捷极速验证</b>
                    产品经理只需输入修改诉求，AI 即可在分钟级调整交互组件并重新挂载打点，将原本以“周”为单位的改版压缩至“分钟级”。
                </div>
            </div>"""

# Replace item-grid in slide9
s9 = re.sub(r'<div class="item-grid">.*?</div>\s*</div>', s9_rich_item_grid + '\n        </div>', s9, flags=re.DOTALL)

with open('slides/slide9.html', 'w', encoding='utf-8') as f:
    f.write(s9)


# 4. Update index.html to adjust slide order & remove slide10.html
with open('index.html', 'r', encoding='utf-8') as f:
    idx = f.read()

# Update total counter in top-badge to 10
idx = idx.replace('<div class="top-badge" id="counter">1 / 11</div>', '<div class="top-badge" id="counter">1 / 10</div>')

# Swap order: slide7 -> slide9 -> slide8 -> slide11 (and remove slide10)
old_frames = """        <div class="slide-frame active"><iframe src="slides/slide1.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide2.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide3.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide4.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide5.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide6.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide7.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide8.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide9.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide10.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide11.html"></iframe></div>"""

new_frames = """        <div class="slide-frame active"><iframe src="slides/slide1.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide2.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide3.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide4.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide5.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide6.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide7.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide9.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide8.html"></iframe></div>
        <div class="slide-frame"><iframe src="slides/slide11.html"></iframe></div>"""

idx = idx.replace(old_frames, new_frames)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(idx)

