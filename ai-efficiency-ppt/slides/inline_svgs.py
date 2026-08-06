import os
import re

svg_dir = "/Users/barry/Desktop/Obsidian/享宇森云/商流/ai-efficiency-ppt/assets/img"
slides_dir = "/Users/barry/Desktop/Obsidian/享宇森云/商流/ai-efficiency-ppt/slides"

svg_files = {
    "Prompt Engineering Logic": "svg_prompt.svg",
    "Agent Architecture Flow": "svg_agent.svg",
    "Workflow Canvas": "svg_workflow.svg",
    "MCP Integration": "svg_mcp.svg",
    "Apple Maps Agent Integration": "svg_apple_map.svg",
    "Workflow Orchestration": "svg_orchestration.svg",
    "iOS Dynamic Island": "svg_ios_island.svg",
    "Python Skill Reverse": "svg_skill_reverse.svg",
    "Strategy PPT Analysis": "svg_strategy.svg",
    "S2B2B Architecture": "svg_s2b2b.svg",
    "Automated Chrome Research": "svg_chrome_research.svg",
    "Mall Prototype": "svg_prototype.svg",
    "Merchant Prototype": "svg_prototype.svg",
    "Admin Prototype": "svg_prototype.svg",
    "PRD Annotator Tool": "svg_prd_annotator.svg",
    "GitHub Code Repo": "svg_git_code.svg",
    "Phase 1 Deliverables": "svg_deliverables.svg",
    "PRD Data Dictionary": "svg_data_dict.svg",
    "OpenAPI DDL Code": "svg_openapi.svg"
}

# Cache SVG content
svg_contents = {}
for alt, svg_name in svg_files.items():
    path = os.path.join(svg_dir, svg_name)
    if os.path.exists(path):
        with open(path, 'r', encoding='utf-8') as f:
            svg_contents[alt] = f.read().strip()

for filename in os.listdir(slides_dir):
    if not filename.endswith(".html"):
        continue
    filepath = os.path.join(slides_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Update style to support svg
    if ".img-box img" in content and ".img-box svg" not in content:
        content = content.replace(".img-box img {", ".img-box img, .img-box svg {")

    # Replace <img ... alt="ALT"> with inline SVG
    def replacer(match):
        img_tag = match.group(0)
        alt_match = re.search(r'alt="([^"]+)"', img_tag)
        if alt_match:
            alt_text = alt_match.group(1)
            if alt_text in svg_contents:
                return svg_contents[alt_text]
        return img_tag

    # Match any <img ...> tag
    new_content = re.sub(r'<img [^>]+>', replacer, content)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Updated {filename} with inline SVGs")
