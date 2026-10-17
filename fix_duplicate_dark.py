import re
import glob

files = glob.glob('src/components/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Find and fix duplicate dark classes like: dark:text-blue-400 dark:text-blue-300
    content = re.sub(r'dark:text-([a-z]+)-(\d+)\s+dark:text-([a-z]+)-(\d+)', r'dark:text-\3-\4', content)
    content = re.sub(r'dark:bg-([a-z]+)-(\d+)(/[0-9]+)?\s+dark:bg-([a-z]+)-(\d+)(/[0-9]+)?', r'dark:bg-\4-\5\6', content)
    content = re.sub(r'dark:border-([a-z]+)-(\d+)(/[0-9]+)?\s+dark:border-([a-z]+)-(\d+)(/[0-9]+)?', r'dark:border-\4-\5\6', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed duplicate dark classes")
