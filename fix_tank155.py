def fix_line_bytes(filepath, line_num, old_bytes, new_bytes):
    with open(filepath, 'rb') as f:
        content = f.read()

    lines = content.split(b'\n')
    line = lines[line_num - 1]
    print(f"Before: {line}")
    print(f"Searching for: {old_bytes}")
    print(f"Found: {old_bytes in line}")

    if old_bytes in line:
        lines[line_num - 1] = line.replace(old_bytes, new_bytes)
        with open(filepath, 'wb') as f:
            f.write(b'\n'.join(lines))
        print(f"Fixed {filepath}:{line_num}")
    else:
        for i, b in enumerate(line):
            if b == 0x22:
                print(f"  Found double quote at position {i}: {line[max(0,i-10):i+10]}")

    print()

# HTML entity bytes
html_entity = b'\x26\x71\x75\x6f\x74\x3b'  # """

# TankSaveLoadShare.tsx:155 - "Anti-Air Tank"
fix_line_bytes('apps/web/src/components/designer/tank/TankSaveLoadShare.tsx', 155,
    b'"Anti-Air Tank"',
    b'Anti-Air Tank')

print("Done")