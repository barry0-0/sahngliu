import re

for filename in ['slides/slide3.html', 'slides/slide4.html']:
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Change flex: 1 to margin-top: auto in example-box
    # Original: flex: 1; display: flex; flex-direction: column; justify-content: center; margin-bottom: 14px;
    
    content = content.replace(
        'flex: 1; display: flex; flex-direction: column; justify-content: center; margin-bottom: 14px;',
        'margin-top: auto; display: flex; flex-direction: column; justify-content: center; margin-bottom: 14px;'
    )
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(content)

