with open('slides/slide11.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the list-box inside Card 3
old_card3 = """                <div class="card-title">深化规范与自动化链路</div>
                <div class="list-box">
                    <div class="list-item">
                        <strong>精细化字段与规则字典</strong>
                        基于现有 Markdown 知识库，自动补充异常边界逻辑、字段校验规则与错误码体系。
                    </div>
                    <div class="list-item">
                        <strong>Swagger / DDL 逆向生成</strong>
                        结合原型交互逻辑，自动反向推导 OpenAPI (Swagger) 接口定义与数据库 DDL。
                    </div>
                    <div class="list-item">
                        <strong>团队 Skill / Prompt 标准化</strong>
                        将实践沉淀为标准 Prompt 模板与 MCP 插件，降低团队其他成员的工具门槛。
                    </div>
                </div>"""

new_card3 = """                <div class="card-title">知识沉淀与 PRD 交付升级</div>
                <div class="list-box">
                    <div class="list-item">
                        <strong>结构化产品知识库沉淀</strong>
                        将业务拓扑与功能细节持续沉淀为标准 Markdown 知识库，为后续版本迭代与 AI 深度理解提供“第二大脑”。
                    </div>
                    <div class="list-item">
                        <strong>交互式打点与内联 PRD</strong>
                        引入原型节点可视化打点（Pinpoint）与内联规格卡片，实现“所见即所得”的需求标注与交互对照。
                    </div>
                    <div class="list-item">
                        <strong>自动化接口与测试推导</strong>
                        基于打点规格与知识库，进一步自动化反向推导 OpenAPI 接口定义与 QA 测试用例边界。
                    </div>
                </div>"""

content = content.replace(old_card3, new_card3)

with open('slides/slide11.html', 'w', encoding='utf-8') as f:
    f.write(content)

