import os
import base64
import re

slides_dir = "/Users/barry/Desktop/Obsidian/享宇森云/商流/ai-efficiency-ppt/slides"
assets_img_dir = "/Users/barry/Desktop/Obsidian/享宇森云/商流/ai-efficiency-ppt/assets/img"

for filename in os.listdir(slides_dir):
    if not filename.endswith(".html"):
        continue
        
    filepath = os.path.join(slides_dir, filename)
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Find all <img src="../assets/img/svg_...svg">
    pattern = r'<img src="\.\./assets/img/([^"]+\.svg)"([^>]*)>'
    
    def replace_with_base64(match):
        svg_filename = match.group(1)
        rest_of_tag = match.group(2)
        
        svg_filepath = os.path.join(assets_img_dir, svg_filename)
        if os.path.exists(svg_filepath):
            with open(svg_filepath, 'rb') as svg_file:
                svg_data = svg_file.read()
                b64_encoded = base64.b64encode(svg_data).decode('utf-8')
                data_uri = f"data:image/svg+xml;base64,{b64_encoded}"
                return f'<img src="{data_uri}"{rest_of_tag}>'
        else:
            return match.group(0) # Keep original if file not found
            
    new_content = re.sub(pattern, replace_with_base64, content)
    
    # Also fix any remaining jpgs just in case? The user said they wanted custom SVG drawn, so we already replaced all 19 tags.
    # Wait, did we miss any? Let's check if there are any remaining jpgs in img-box.
    
    with open(filepath, 'w') as f:
        f.write(new_content)
        
    print(f"Processed {filename}")
