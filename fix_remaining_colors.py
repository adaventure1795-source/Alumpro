import re
import glob

files = glob.glob('src/components/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Blue replacements
    content = re.sub(r'text-blue-500(?! dark:)', r'text-blue-500 dark:text-blue-400', content)
    content = re.sub(r'text-blue-400(?! dark:)', r'text-blue-400 dark:text-blue-300', content)
    
    # Border replacements
    content = re.sub(r'border-slate-100(?!/| dark:)', r'border-slate-100 dark:border-slate-700/50', content)
    content = re.sub(r'border-slate-200(?!/| dark:)', r'border-slate-200 dark:border-slate-700', content)

    # Some missed backgrounds
    content = re.sub(r'bg-slate-50(?!/| dark:)', r'bg-slate-50 dark:bg-slate-800/80', content)
    
    # Fix the contrast in DocumentosAludev.tsx box
    content = re.sub(r'dark:bg-slate-800/80 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50', r'dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50', content)

    # Buttons and badges
    content = re.sub(r'bg-slate-100(?!/| dark:)', r'bg-slate-100 dark:bg-slate-800', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed remaining colors")
