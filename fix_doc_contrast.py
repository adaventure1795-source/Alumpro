import re

with open('src/components/DocumentosAludev.tsx', 'r') as f:
    content = f.read()

# Fix Importe Acordado Box
content = content.replace('bg-slate-50 dark:bg-slate-800/90/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50', 
                          'bg-slate-50 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700')
content = content.replace('bg-slate-50 dark:bg-slate-800/90/40 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50', 
                          'bg-slate-50 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700')
content = content.replace('bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-700/50', 
                          'bg-slate-50 dark:bg-slate-800/90 p-3 rounded-xl border border-slate-200 dark:border-slate-700')

# Fix Anticipo de Obra Box
content = re.sub(r'bg-blue-50/50 dark:bg-blue-950/60 p-3 rounded-lg border border-blue-100 dark:border-blue-800/40',
                 r'bg-blue-50 dark:bg-blue-500/10 p-3 rounded-xl border border-blue-200 dark:border-blue-500/20', content)

content = re.sub(r'text-blue-500 dark:text-blue-300', r'text-blue-600 dark:text-blue-400', content)
content = re.sub(r'text-blue-900 dark:text-blue-100', r'text-blue-900 dark:text-blue-50', content)

# Fix Plazo Entrega Box
content = re.sub(r'bg-emerald-50/50 dark:bg-emerald-950/60 p-3 rounded-lg border border-emerald-100 dark:border-emerald-800/40',
                 r'bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/20', content)

content = re.sub(r'text-emerald-500 dark:text-emerald-400', r'text-emerald-600 dark:text-emerald-400', content)
content = re.sub(r'text-emerald-900 dark:text-emerald-100', r'text-emerald-900 dark:text-emerald-50', content)


with open('src/components/DocumentosAludev.tsx', 'w') as f:
    f.write(content)
print("Fixed DocumentosAludev.tsx contrast")
