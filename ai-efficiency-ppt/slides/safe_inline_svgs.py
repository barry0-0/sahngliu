import os
import re

slides_dir = "/Users/barry/Desktop/工作/享宇森云/商流/ai-efficiency-ppt/slides"
assets_img_dir = "/Users/barry/Desktop/工作/享宇森云/商流/ai-efficiency-ppt/assets/img"

for filename in os.listdir(slides_dir):
    if not filename.endswith(".html"):
        continue
        
    filepath = os.path.join(slides_dir, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
        
    pattern = r'<img src="\.\./assets/img/([^"]+\.svg)"([^>]*)>'
    
    def replacer(match):
        svg_filename = match.group(1)
        svg_filepath = os.path.join(assets_img_dir, svg_filename)
        if os.path.exists(svg_filepath):
            with open(svg_filepath, 'r', encoding='utf-8') as svg_file:
                # return the raw SVG code
                return svg_file.read().strip()
        return match.group(0)

    new_content = re.sub(pattern, replacer, content)
    
    if ".img-box img" in new_content and ".img-box svg" not in new_content:
        new_content = new_content.replace(".img-box img {", ".img-box img, .img-box svg {")
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
        
    print(f"Inlined SVGs into {filename}")
