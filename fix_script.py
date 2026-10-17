import sys
with open('src/components/Cotizador.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if 'let leftY = y + 20;' in line:
        lines[i] = '    let leftY = y + 25;\n'
    if 'if (leftY > 260) {' in line:
        lines[i] = '    if (leftY > 235) {\n'
    if 'leftY = Math.max(startTotalsY + 20, y + 15);' in line:
        lines[i] = '      leftY = y + 25;\n'

with open('src/components/Cotizador.tsx', 'w') as f:
    f.writelines(lines)
print("Fixed pagination threshold.")
