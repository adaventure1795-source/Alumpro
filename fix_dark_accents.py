import re
import glob

files = glob.glob('src/components/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Blue replacements
    content = re.sub(r'bg-blue-50/50(?! dark:)', r'bg-blue-50/50 dark:bg-blue-900/20', content)
    content = re.sub(r'bg-blue-50(?!/| dark:)', r'bg-blue-50 dark:bg-blue-900/30', content)
    content = re.sub(r'border-blue-100(?!/| dark:)', r'border-blue-100 dark:border-blue-800/50', content)
    content = re.sub(r'border-blue-200(?!/| dark:)', r'border-blue-200 dark:border-blue-700/50', content)
    content = re.sub(r'text-blue-900(?! dark:)', r'text-blue-900 dark:text-blue-100', content)
    content = re.sub(r'text-blue-800(?! dark:)', r'text-blue-800 dark:text-blue-200', content)
    content = re.sub(r'text-blue-700(?! dark:)', r'text-blue-700 dark:text-blue-300', content)
    content = re.sub(r'text-blue-600(?! dark:)', r'text-blue-600 dark:text-blue-400', content)
    
    # Emerald replacements
    content = re.sub(r'bg-emerald-50/50(?! dark:)', r'bg-emerald-50/50 dark:bg-emerald-900/20', content)
    content = re.sub(r'bg-emerald-50(?!/| dark:)', r'bg-emerald-50 dark:bg-emerald-900/30', content)
    content = re.sub(r'border-emerald-100(?!/| dark:)', r'border-emerald-100 dark:border-emerald-800/50', content)
    content = re.sub(r'text-emerald-900(?! dark:)', r'text-emerald-900 dark:text-emerald-100', content)
    content = re.sub(r'text-emerald-500(?! dark:)', r'text-emerald-500 dark:text-emerald-400', content)

    # Red/Rose/Amber replacements
    content = re.sub(r'bg-rose-50/50(?! dark:)', r'bg-rose-50/50 dark:bg-rose-900/20', content)
    content = re.sub(r'bg-rose-50(?!/| dark:)', r'bg-rose-50 dark:bg-rose-900/30', content)
    content = re.sub(r'text-rose-900(?! dark:)', r'text-rose-900 dark:text-rose-100', content)
    content = re.sub(r'border-rose-100(?!/| dark:)', r'border-rose-100 dark:border-rose-800/50', content)

    # slate backgrounds
    content = re.sub(r'bg-slate-800(?!/| dark:)', r'bg-slate-800 dark:bg-slate-900', content)
    content = re.sub(r'bg-slate-900(?!/| dark:)', r'bg-slate-900 dark:bg-black', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Updated dark accents")
