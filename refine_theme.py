import re
import glob

files = glob.glob('src/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Refine some borders and backgrounds for premium feel
    content = content.replace("dark:bg-slate-900", "dark:bg-slate-900/90")
    content = content.replace("dark:bg-slate-800", "dark:bg-slate-800/90")
    
    # Shadows
    content = re.sub(r'shadow(?!-)', r'shadow-sm', content)

    # Rounded corners - more modern
    #content = re.sub(r'rounded-lg', r'rounded-xl', content)
    #content = re.sub(r'rounded-md', r'rounded-lg', content)

    with open(file_path, 'w') as f:
        f.write(content)
print("Refined theme")
