import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Find text-slate-[700-900] without dark:text-slate-*
    content = re.sub(r'text-slate-900(?! dark:text)', r'text-slate-900 dark:text-slate-50', content)
    content = re.sub(r'text-slate-800(?! dark:text)', r'text-slate-800 dark:text-slate-100', content)
    content = re.sub(r'text-slate-700(?! dark:text)', r'text-slate-700 dark:text-slate-200', content)
    content = re.sub(r'text-slate-600(?! dark:text)', r'text-slate-600 dark:text-slate-300', content)
    content = re.sub(r'text-slate-500(?! dark:text)', r'text-slate-500 dark:text-slate-400', content)

    # Same for bg-slate-[50-200]
    content = re.sub(r'bg-slate-50(?!/| dark:bg)', r'bg-slate-50 dark:bg-slate-800', content)
    content = re.sub(r'bg-slate-100(?!/| dark:bg)', r'bg-slate-100 dark:bg-slate-800', content)
    content = re.sub(r'bg-slate-200(?!/| dark:bg)', r'bg-slate-200 dark:bg-slate-700', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed remaining text")
