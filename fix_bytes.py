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
        # Find all double quotes
        for i, b in enumerate(line):
            if b == 0x22:
                print(f"  Found double quote at position {i}: {line[max(0,i-10):i+10]}")

    print()

# Fix each error with actual bytes
# " = b'"' (6 bytes: & q u o t ;)
quote_html = b'"'

# DesignComparison.tsx:615 - "Show only differences"
fix_line_bytes('apps/web/src/components/designer/DesignComparison.tsx', 615,
    b'"Show only differences"',
    b'"Show only differences"')

# AircraftSaveLoadShare.tsx:228 - "Save"
fix_line_bytes('apps/web/src/components/designer/air/AircraftSaveLoadShare.tsx', 228,
    b'"Save"',
    b'"Save"')

# BattalionCard.tsx:37 - "{battalion.customName}"
fix_line_bytes('apps/web/src/components/designer/division/BattalionCard.tsx', 37,
    b'"{battalion.customName}"',
    b'"{battalion.customName}"')

# TankSaveLoadShare.tsx:222 - "Save"
fix_line_bytes('apps/web/src/components/designer/tank/TankSaveLoadShare.tsx', 222,
    b'"Save"',
    b'"Save"')

# DivisionDesigner.tsx:648 - "Add Regiment"
fix_line_bytes('apps/web/src/pages/DivisionDesigner.tsx', 648,
    b'"Add Regiment"',
    b'"Add Regiment"')

print("Done")