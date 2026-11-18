with open('apps/web/src/components/designer/DesignComparison.tsx', 'r') as f:
    content = f.read()

lines = content.split('\n')
line = lines[614]  # 0-indexed
print(f'Before: {repr(line)}')

pos = line.find('Uncheck ')
if pos >= 0:
    q1 = line.find('"', pos + 8)
    q2 = line.find('"', q1 + 1)
    print(f'Quote positions: {q1}, {q2}')
    if q1 >= 0 and q2 >= 0:
        new_line = line[:q1] + '"' + line[q1+1:q2] + '"' + line[q2+1:]
        lines[614] = new_line
        print(f'After: {repr(new_line)}')

content = '\n'.join(lines)
with open('apps/web/src/components/designer/DesignComparison.tsx', 'w') as f:
    f.write(content)
print('Done')