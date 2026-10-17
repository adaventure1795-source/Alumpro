import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Add basic dark mode variants for text colors
    content = re.sub(r'text-slate-900(?! dark:)', r'text-slate-900 dark:text-slate-50', content)
    content = re.sub(r'text-slate-800(?! dark:)', r'text-slate-800 dark:text-slate-100', content)
    content = re.sub(r'text-slate-700(?! dark:)', r'text-slate-700 dark:text-slate-200', content)
    content = re.sub(r'text-slate-600(?! dark:)', r'text-slate-600 dark:text-slate-300', content)
    content = re.sub(r'text-slate-500(?! dark:)', r'text-slate-500 dark:text-slate-400', content)

    # Backgrounds
    content = re.sub(r'bg-white(?! dark:)', r'bg-white dark:bg-slate-800', content)
    content = re.sub(r'bg-slate-50(?!/| dark:)', r'bg-slate-50 dark:bg-slate-800/80', content)
    content = re.sub(r'bg-slate-100(?!/| dark:)', r'bg-slate-100 dark:bg-slate-700/80', content)
    content = re.sub(r'bg-slate-200(?!/| dark:)', r'bg-slate-200 dark:bg-slate-700', content)

    # Borders
    content = re.sub(r'border-slate-200(?!/| dark:)', r'border-slate-200 dark:border-slate-700', content)
    content = re.sub(r'border-slate-300(?!/| dark:)', r'border-slate-300 dark:border-slate-600', content)

    # Specific tweaks for "Aludev Blue" feel
    content = re.sub(r'border-amber-500', r'border-blue-500', content)
    content = re.sub(r'text-amber-500', r'text-blue-500', content)
    content = re.sub(r'bg-amber-50/20', r'bg-blue-50/50', content)
    content = re.sub(r'bg-amber-50/50', r'bg-blue-50/50', content)
    content = re.sub(r'border-amber-100', r'border-blue-100', content)
    content = re.sub(r'dark:bg-amber-950/20', r'dark:bg-blue-900/20', content)
    content = re.sub(r'text-amber-700 dark:text-amber-400', r'text-blue-700 dark:text-blue-400', content)
    content = re.sub(r'focus:border-amber-400', r'focus:border-blue-400', content)
    content = re.sub(r'bg-amber-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600', r'bg-blue-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600', content)
    content = re.sub(r'accent-amber-600', r'accent-blue-600', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Updated styles globally")
