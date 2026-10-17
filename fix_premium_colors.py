import re
import glob

files = glob.glob('src/components/**/*.tsx', recursive=True)

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()

    # Dark mode subtle backgrounds: make them slightly more saturated
    content = content.replace("dark:bg-blue-900/20", "dark:bg-blue-950/60")
    content = content.replace("dark:bg-blue-900/30", "dark:bg-blue-900/40")
    content = content.replace("dark:border-blue-800/50", "dark:border-blue-800/40")
    
    content = content.replace("dark:bg-emerald-900/20", "dark:bg-emerald-950/60")
    content = content.replace("dark:bg-emerald-900/30", "dark:bg-emerald-900/40")
    content = content.replace("dark:border-emerald-800/50", "dark:border-emerald-800/40")
    
    # Let's also ensure slate-800/50 is darker
    content = content.replace("dark:bg-slate-800/50", "dark:bg-slate-800/40")

    # Change the blue header color to Aludev Blue #1E4089 for bg-blue-600
    # Actually, it's better to update the Tailwind classes, but we can't do that easily without Tailwind v4 setup.
    
    with open(file_path, 'w') as f:
        f.write(content)
print("Fixed premium colors")
