import re

css_style = """
        .hot-case { background: #ffffff; border: 1px dashed #cbd5e1; padding: 8px 12px; border-radius: 4px; font-size: 11px; color: var(--text-sub); }
        .hot-case b { color: #111827; }
        
        .example-box {
            margin-top: 14px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 14px; border-radius: 6px;
            flex: 1; display: flex; flex-direction: column; justify-content: center;
        }
        .example-box.agent { background: #eff6ff; border-color: #bfdbfe; }
        .example-box.workflow { background: #fffbeb; border-color: #fde68a; }
        .example-box.mcp { background: #fdf2f8; border-color: #fbcfe8; }
        
        .example-title { font-size: 14px; font-weight: 700; color: #166534; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;}
        .example-box.agent .example-title { color: #1e3a8a; }
        .example-box.workflow .example-title { color: #92400e; }
        .example-box.mcp .example-title { color: #831843; }
        
        .example-desc { font-size: 12px; color: #14532d; line-height: 1.6; margin-bottom: 10px; }
        .example-box.agent .example-desc { color: #1e3a8a; }
        .example-box.workflow .example-desc { color: #92400e; }
        .example-box.mcp .example-desc { color: #831843; }
        
        .example-points { display: flex; flex-direction: column; gap: 8px; }
        .example-point { font-size: 11px; color: #166534; background: #dcfce7; padding: 8px 10px; border-radius: 4px; border: 1px solid #bbf7d0; }
        .example-point strong { color: #14532d; }
        
        .example-box.agent .example-point { color: #1e40af; background: #dbeafe; border-color: #bfdbfe; }
        .example-box.agent .example-point strong { color: #1e3a8a; }
        
        .example-box.workflow .example-point { color: #b45309; background: #fef3c7; border-color: #fde68a; }
        .example-box.workflow .example-point strong { color: #92400e; }
        
        .example-box.mcp .example-point { color: #9d174d; background: #fce7f3; border-color: #fbcfe8; }
        .example-box.mcp .example-point strong { color: #831843; }
"""

def inject_examples(file_path, id_example_map):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Inject CSS
    content = content.replace(
        '.hot-case { background: #ffffff; border: 1px dashed #cbd5e1; padding: 8px 12px; border-radius: 4px; font-size: 11px; color: var(--text-sub); }\n        .hot-case b { color: #111827; }',
        css_style
    )

    # Split by cards
    cards = re.split(r'(<!-- \d+\. [^>]+ -->)', content)
    # cards[0] is header/css
    # cards[1] is <!-- 1. Prompt -->
    # cards[2] is the content of card 1
    # cards[3] is <!-- 2. Agent -->
    # cards[4] is the content of card 2
    
    new_content = cards[0]
    for i in range(1, len(cards), 2):
        comment = cards[i]
        card_content = cards[i+1]
        
        for key, example_html in id_example_map.items():
            if key in comment:
                card_content = card_content.replace(
                    '</div>\n            <div class="hot-case">',
                    f'</div>\n                {example_html}\n            </div>\n            <div class="hot-case">'
                )
                
        new_content += comment + card_content
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)


prompt_ex = """
                <div class="example-box">
                    <div class="example-title">💡 详细实战：结构化需求分析模板</div>
                    <div class="example-desc">将产品经理零散的想法或会议录音，直接转化为标准化的 Markdown PRD 文档。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>在提示词中给定固定的角色设定、任务指令、输出格式要求和一段参考范例（Few-shot）。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>解决大模型回答过于发散、格式混乱、无法直接落地的业务难题，确保每次输出稳定可用，不再是“废话文学”。</div>
                    </div>
                </div>
"""

agent_ex = """
                <div class="example-box agent">
                    <div class="example-title">💡 详细实战：Cursor 多 Agent 协同写代码</div>
                    <div class="example-desc">打破单次对话限制，多个专业 Agent 在后台互相配合完成庞大的工程代码修改。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>在 Composer 面板输入“写一个登录页面”，系统自动唤起代码搜索 Agent、编写 Agent 与 Linter Agent。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>实现了“理解上下文 -> 自主搜集信息 -> 自动修改多处代码 -> 自查纠错”的闭环，Agent 像真实的程序员一样拥有执行力和自驱力，大幅替代人工编码环节。</div>
                    </div>
                </div>
"""

workflow_ex = """
                <div class="example-box workflow">
                    <div class="example-title">💡 详细实战：Dify 企微售后客服工作流</div>
                    <div class="example-desc">将知识库检索、LLM 意图判断与人工转接节点，通过图形化连线串联成确定的业务流。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>当客户发问时，流程先经过意图分类器，若是查询订单走 API 分支；若是咨询则走向量库检索分支。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>解决单一 LLM / Agent 无法精准控制业务走向的问题，用硬逻辑约束大模型，确保高风险业务（如客服、医疗、交易）100% 按既定标准流程执行。</div>
                    </div>
                </div>
"""

mcp_ex = """
                <div class="example-box mcp">
                    <div class="example-title">💡 详细实战：Figma MCP 与 GitHub MCP 互通</div>
                    <div class="example-desc">大模型不需要懂 Figma 的底层逻辑，通过 MCP 协议就能像插拔 USB 一样读取设计稿数据。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>在本地启动 Figma MCP Server 并在 Claude 中挂载，AI 即可直接调取设计稿颜色、尺寸，并瞬间转化为可用的 TailwindCSS 代码甚至推送到 GitHub。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>彻底打破了各种软件之间的数据孤岛，AI 可以安全的跨越边界触碰本地及云端数据，完成从设计、研发到交付的无缝数据流转。</div>
                    </div>
                </div>
"""

inject_examples('slides/slide3.html', {'Prompt': prompt_ex, 'Agent': agent_ex})
inject_examples('slides/slide4.html', {'Workflow': workflow_ex, 'MCP': mcp_ex})
