import re
import glob

files = glob.glob('src/components/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    content = content.replace("dark:bg-slate-800 dark:bg-slate-900 dark:bg-black", "dark:bg-slate-900")
    content = content.replace("dark:bg-slate-800 dark:bg-slate-900", "dark:bg-slate-800")
    content = content.replace("dark:bg-slate-900 dark:bg-black", "dark:bg-slate-950")
    content = content.replace("dark:bg-black", "dark:bg-slate-950")

    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed double dark")
