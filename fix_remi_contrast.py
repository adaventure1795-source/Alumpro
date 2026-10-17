import re

with open('src/components/Remision.tsx', 'r') as f:
    content = f.read()

content = re.sub(r'bg-blue-50(?! dark:)', r'bg-blue-50 dark:bg-blue-500/10', content)
content = re.sub(r'border-blue-200(?! dark:)', r'border-blue-200 dark:border-blue-500/20', content)
content = re.sub(r'text-blue-900(?! dark:)', r'text-blue-900 dark:text-blue-50', content)
content = re.sub(r'text-blue-700(?! dark:)', r'text-blue-700 dark:text-blue-400', content)

with open('src/components/Remision.tsx', 'w') as f:
    f.write(content)
print("Fixed Remision contrast")
