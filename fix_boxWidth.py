import sys
with open('src/components/Cotizador.tsx', 'r') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if '// 2. Client & Project Info' in line:
        lines.insert(i, '    const boxWidth = (contentWidth - 10) / 2;\n')
        break

with open('src/components/Cotizador.tsx', 'w') as f:
    f.writelines(lines)
print("Fixed boxWidth")
