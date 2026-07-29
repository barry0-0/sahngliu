import re

# Fix slide3.html
with open('slides/slide3.html', 'r', encoding='utf-8') as f:
    content3 = f.read()

# I will completely revert slide3 to the original structure by stripping out .example-box divs
# Regex to remove <div class="example-box ..."> ... </div> (the whole block)
content3 = re.sub(r'<div class="example-box.*?</div>\s*</div>\s*</div>', '</div>', content3, flags=re.DOTALL)
# Wait, that regex might be tricky. Let's be precise.
