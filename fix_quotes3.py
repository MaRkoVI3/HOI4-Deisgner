with open('apps/web/src/components/designer/DesignComparison.tsx', 'rb') as f:
    content = f.read()

lines = content.split(b'\n')
line = lines[614]  # 0-indexed

# Replace quotes at positions 51 and 73
# Position 51 is after "Uncheck "
# Position 73 is after "Show only differences"
new_line = line[:51] + b'"' + line[52:73] + b'"' + line[74:]
lines[614] = new_line

content = b'\n'.join(lines)
with open('apps/web/src/components/designer/DesignComparison.tsx', 'wb') as f:
    f.write(content)

# Verify
for i, byte in enumerate(new_line):
    if byte == 0x22:
        print(f'Position {i}: context ...{new_line[max(0,i-5):i+5]}...')

print('Done')