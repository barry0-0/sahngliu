with open('slides/slide9.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Change item 2 and item 3 wording in the right column of slide9.html
old_item2 = """<div class="item-card">
                    <b>2. 原型代码直接供前端复用</b>
                    输出的 HTML/CSS 样式与 DOM 结构可直接被前端开发采纳，大幅降低研发二次还原成本。
                </div>"""

new_item2 = """<div class="item-card">
                    <b>2. 原型代码供前端参考采纳</b>
                    输出的 HTML/CSS 样式与 DOM 结构可供前端开发直接参考与采纳，降低二次还原与理解成本。
                </div>"""

old_item3 = """<div class="item-card">
                    <b>3. 分钟级响应式迭代验证</b>
                    需求改动时只需调优 AI 指令，分钟级生成新原型，将传统以“周”为单位的改版压缩至“分钟级”。
                </div>"""

new_item3 = """<div class="item-card">
                    <b>3. 后续版本迭代快捷高效</b>
                    当后续出现版本改版或需求变更时，可借助 AI 极速调整原型与业务逻辑，大幅提升后续迭代效率。
                </div>"""

content = content.replace(old_item2, new_item2)
content = content.replace(old_item3, new_item3)

with open('slides/slide9.html', 'w', encoding='utf-8') as f:
    f.write(content)

