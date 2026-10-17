import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    content = content.replace("dark:text-slate-500 dark:text-slate-400", "dark:text-slate-400")
    content = content.replace("dark:text-slate-400 dark:text-slate-400", "dark:text-slate-400")
    content = content.replace("dark:bg-slate-800 dark:bg-slate-800", "dark:bg-slate-800")
    
    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed typos")
