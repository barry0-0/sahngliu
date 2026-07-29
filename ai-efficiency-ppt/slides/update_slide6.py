with open('slides/slide6.html', 'r', encoding='utf-8') as f:
    content = f.read()

old_pills = """            <div class="pill-grid">
                <div class="pill"><b>法务电子合同</b>线上双边电子盖章</div>
                <div class="pill"><b>公对公打款</b>线下凭证穿透审核</div>
            </div>"""

new_pills = """            <div class="pill-grid">
                <div class="pill"><b>01. 上下游高效衔接</b>高效链接上游供应商/商家与下游企业买家</div>
                <div class="pill"><b>02. 业务全链路贯通</b>打通从求购询价、竞价定标到履约交付全过程</div>
            </div>"""

content = content.replace(old_pills, new_pills)

with open('slides/slide6.html', 'w', encoding='utf-8') as f:
    f.write(content)

