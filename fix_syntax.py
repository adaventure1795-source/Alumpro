import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Find and fix anything with multiple slashes in class names
    content = re.sub(r'dark:bg-slate-([0-9]+)(/[0-9]+)+', r'dark:bg-slate-\1/90', content)
    content = re.sub(r'bg-slate-([0-9]+)(/[0-9]+)+', r'bg-slate-\1', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed syntax fully")
