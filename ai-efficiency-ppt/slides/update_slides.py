import os

replacements = {
    "slide3.html": [
        (
            '<img src="../assets/img/skill_code.jpg" alt="Prompt Engineering Logic">',
            '<img src="../assets/img/svg_prompt.svg" alt="Prompt Engineering Logic">'
        ),
        (
            '<img src="../assets/img/b2b_network.jpg" alt="Agent Architecture Flow">',
            '<img src="../assets/img/svg_agent.svg" alt="Agent Architecture Flow">'
        )
    ],
    "slide4.html": [
        (
            '<img src="../assets/img/dify_coze.jpg" alt="Workflow Canvas">',
            '<img src="../assets/img/svg_workflow.svg" alt="Workflow Canvas">'
        ),
        (
            '<img src="../assets/img/qianjiang_analysis.jpg" alt="MCP Integration">',
            '<img src="../assets/img/svg_mcp.svg" alt="MCP Integration">'
        )
    ],
    "slide5.html": [
        (
            '<img src="../assets/img/apple_ai_map.jpg" alt="Apple Maps Agent Integration">',
            '<img src="../assets/img/svg_apple_map.svg" alt="Apple Maps Agent Integration">'
        ),
        (
            '<img src="../assets/img/dify_coze.jpg" alt="Workflow Orchestration">',
            '<img src="../assets/img/svg_orchestration.svg" alt="Workflow Orchestration">'
        ),
        (
            '<img src="../assets/img/ios_island.jpg" alt="iOS Dynamic Island">',
            '<img src="../assets/img/svg_ios_island.svg" alt="iOS Dynamic Island">'
        ),
        (
            '<img src="../assets/img/skill_code.jpg" alt="Python Skill Reverse">',
            '<img src="../assets/img/svg_skill_reverse.svg" alt="Python Skill Reverse">'
        )
    ],
    "slide6.html": [
        (
            '<img src="../assets/img/qianjiang_analysis.jpg" alt="Strategy PPT Analysis">',
            '<img src="../assets/img/svg_strategy.svg" alt="Strategy PPT Analysis">'
        ),
        (
            '<img src="../assets/img/apple_ai_map.jpg" alt="S2B2B Architecture">',
            '<img src="../assets/img/svg_s2b2b.svg" alt="S2B2B Architecture">'
        )
    ],
    "slide7.html": [
        (
            '<img src="../assets/img/qianjiang_analysis.jpg" alt="Automated Chrome Research">',
            '<img src="../assets/img/svg_chrome_research.svg" alt="Automated Chrome Research">'
        )
    ],
    "slide8.html": [
        (
            '<img src="../assets/img/b2b_network.jpg" alt="Mall Prototype">',
            '<img src="../assets/img/svg_prototype.svg" alt="Mall Prototype">'
        ),
        (
            '<img src="../assets/img/qianjiang_analysis.jpg" alt="Merchant Prototype">',
            '<img src="../assets/img/svg_prototype.svg" alt="Merchant Prototype">'
        ),
        (
            '<img src="../assets/img/strategy_ppt.jpg" alt="Admin Prototype">',
            '<img src="../assets/img/svg_prototype.svg" alt="Admin Prototype">'
        )
    ],
    "slide9.html": [
        (
            '<img src="../assets/img/code_skill.jpg" alt="PRD Annotator Tool">',
            '<img src="../assets/img/svg_prd_annotator.svg" alt="PRD Annotator Tool">'
        ),
        (
            '<img src="../assets/img/git_workflow.jpg" alt="GitHub Code Repo">',
            '<img src="../assets/img/svg_git_code.svg" alt="GitHub Code Repo">'
        )
    ],
    "slide11.html": [
        (
            '<img src="../assets/img/ios_island.jpg" alt="Phase 1 Deliverables">',
            '<img src="../assets/img/svg_deliverables.svg" alt="Phase 1 Deliverables">'
        ),
        (
            '<img src="../assets/img/skill_code.jpg" alt="PRD Data Dictionary">',
            '<img src="../assets/img/svg_data_dict.svg" alt="PRD Data Dictionary">'
        ),
        (
            '<img src="../assets/img/git_workflow.jpg" alt="OpenAPI DDL Code">',
            '<img src="../assets/img/svg_openapi.svg" alt="OpenAPI DDL Code">'
        )
    ]
}

slides_dir = "/Users/barry/Desktop/工作/享宇森云/商流/ai-efficiency-ppt/slides"

for filename, rules in replacements.items():
    filepath = os.path.join(slides_dir, filename)
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            content = f.read()
        
        for old_str, new_str in rules:
            content = content.replace(old_str, new_str)
            
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"Updated {filename}")
    else:
        print(f"File not found: {filename}")
