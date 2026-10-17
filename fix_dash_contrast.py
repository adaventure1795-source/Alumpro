import re

with open('src/components/Dashboard.tsx', 'r') as f:
    content = f.read()

# Fix dark backgrounds in Dashboard to use more vibrant/clean colors
content = re.sub(r'dark:bg-blue-950/40', r'dark:bg-blue-500/10', content)
content = re.sub(r'dark:border-blue-900/10', r'dark:border-blue-500/20', content)
content = re.sub(r'dark:text-blue-400', r'dark:text-blue-400', content)

content = re.sub(r'dark:bg-emerald-950/40', r'dark:bg-emerald-500/10', content)
content = re.sub(r'dark:border-emerald-900/10', r'dark:border-emerald-500/20', content)
content = re.sub(r'dark:bg-rose-950/40', r'dark:bg-rose-500/10', content)
content = re.sub(r'dark:border-rose-900/10', r'dark:border-rose-500/20', content)

content = re.sub(r'bg-blue-50/50', r'bg-blue-50', content)
content = re.sub(r'bg-emerald-50/50', r'bg-emerald-50', content)
content = re.sub(r'bg-rose-50/50', r'bg-rose-50', content)

with open('src/components/Dashboard.tsx', 'w') as f:
    f.write(content)
print("Fixed Dashboard contrast")
