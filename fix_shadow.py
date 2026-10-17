import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    content = content.replace("shadow-sm-sm", "shadow-sm")
    content = content.replace("shadow-sm-md", "shadow-md")
    content = content.replace("shadow-sm-lg", "shadow-lg")
    content = content.replace("shadow-sm-xl", "shadow-xl")
    content = content.replace("shadow-sm-inner", "shadow-inner")
    content = content.replace("shadow-sm-none", "shadow-none")
    
    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed shadows")
