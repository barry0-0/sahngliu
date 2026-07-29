import re

# Fix slide3.html
with open('slides/slide3.html', 'r', encoding='utf-8') as f:
    content3 = f.read()

# First, remove all existing example-box elements completely so we can start fresh
content3 = re.sub(r'<div class="example-box.*?</div>\s*</div>\s*</div>\s*</div>', '</div>\n            </div>', content3, flags=re.DOTALL)
# The above regex might be fragile. Let's do it safer:
# Just remove everything between <div class="example-box"> and the next <div class="hot-case">
content3 = re.sub(r'<div class="example-box.*?(?=<div class="hot-case">)', '', content3, flags=re.DOTALL)
content3 = content3.replace('</div>\n            \n            <div class="hot-case">', '</div>\n            <div class="hot-case">')
content3 = content3.replace('</div>\n                \n            <div class="hot-case">', '</div>\n            <div class="hot-case">')


prompt_example = """</div>
                
                <div class="example-box">
                    <div class="example-title">💡 详细实战：结构化需求分析模板</div>
                    <div class="example-desc">将产品经理零散的想法或会议录音，直接转化为标准化的 Markdown PRD 文档。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>在提示词中给定固定的角色设定、任务指令、输出格式要求和一段参考范例（Few-shot）。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>解决大模型回答过于发散、格式混乱、无法直接落地的业务难题，确保每次输出稳定可用，不再是“废话文学”。</div>
                    </div>
                </div>
                
            </div>
            <div class="hot-case">"""

agent_example = """</div>
                
                <div class="example-box agent">
                    <div class="example-title">💡 详细实战：Cursor 多 Agent 协同写代码</div>
                    <div class="example-desc">打破单次对话限制，多个专业 Agent 在后台互相配合完成庞大的工程代码修改。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>在 Composer 面板输入“写一个登录页面”，系统自动唤起代码搜索 Agent、编写 Agent 与 Linter Agent。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>实现了“理解上下文 -> 自主搜集信息 -> 自动修改多处代码 -> 自查纠错”的闭环，Agent 像真实的程序员一样拥有执行力和自驱力，大幅替代人工编码环节。</div>
                    </div>
                </div>
                
            </div>
            <div class="hot-case">"""

parts = content3.split('<div class="hot-case">')
if len(parts) == 3:
    # parts[0] is up to the first hot-case (end of Prompt card div)
    # parts[1] is the prompt hot-case and up to the second hot-case (end of Agent card div)
    # parts[2] is the agent hot-case and the rest of the document
    
    parts[0] = parts[0].rstrip().replace('</div>\n            </div>', prompt_example)
    parts[1] = parts[1].rstrip().replace('</div>\n            </div>', agent_example)
    
    content3 = parts[0] + parts[1] + '<div class="hot-case">' + parts[2]
else:
    print("Warning: split count for slide3 is not 3")

with open('slides/slide3.html', 'w', encoding='utf-8') as f:
    f.write(content3)


# Fix slide4.html
with open('slides/slide4.html', 'r', encoding='utf-8') as f:
    content4 = f.read()

content4 = re.sub(r'<div class="example-box.*?(?=<div class="hot-case">)', '', content4, flags=re.DOTALL)
content4 = content4.replace('</div>\n            \n            <div class="hot-case">', '</div>\n            <div class="hot-case">')
content4 = content4.replace('</div>\n                \n            <div class="hot-case">', '</div>\n            <div class="hot-case">')

workflow_example = """</div>
                
                <div class="example-box workflow">
                    <div class="example-title">💡 详细实战：Dify 企微售后客服工作流</div>
                    <div class="example-desc">将知识库检索、LLM 意图判断与人工转接节点，通过图形化连线串联成确定的业务流。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>当客户发问时，流程先经过意图分类器，若是查询订单走 API 分支；若是咨询则走向量库检索分支。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>解决单一 LLM / Agent 无法精准控制业务走向的问题，用硬逻辑约束大模型，确保高风险业务（如客服、医疗、交易）100% 按既定标准流程执行。</div>
                    </div>
                </div>
                
            </div>
            <div class="hot-case">"""

mcp_example = """</div>
                
                <div class="example-box mcp">
                    <div class="example-title">💡 详细实战：Figma MCP 与 GitHub MCP 互通</div>
                    <div class="example-desc">大模型不需要懂 Figma 的底层逻辑，通过 MCP 协议就能像插拔 USB 一样读取设计稿数据。</div>
                    <div class="example-points">
                        <div class="example-point"><strong>怎么用：</strong>在本地启动 Figma MCP Server 并在 Claude 中挂载，AI 即可直接调取设计稿颜色、尺寸，并瞬间转化为可用的 TailwindCSS 代码甚至推送到 GitHub。</div>
                        <div class="example-point"><strong>解决什么问题：</strong>彻底打破了各种软件之间的数据孤岛，AI 可以安全的跨越边界触碰本地及云端数据，完成从设计、研发到交付的无缝数据流转。</div>
                    </div>
                </div>
                
            </div>
            <div class="hot-case">"""

parts4 = content4.split('<div class="hot-case">')
if len(parts4) == 3:
    parts4[0] = parts4[0].rstrip().replace('</div>\n            </div>', workflow_example)
    parts4[1] = parts4[1].rstrip().replace('</div>\n            </div>', mcp_example)
    
    content4 = parts4[0] + parts4[1] + '<div class="hot-case">' + parts4[2]
else:
    print("Warning: split count for slide4 is not 3")

with open('slides/slide4.html', 'w', encoding='utf-8') as f:
    f.write(content4)

