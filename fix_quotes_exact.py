def fix_line_exact(filepath, line_num, old_substring, new_substring):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    line = lines[line_num - 1]
    print(f"Before: {line!r}")
    print(f"Searching for: {old_substring!r}")
    print(f"Found: {old_substring in line}")

    if old_substring in line:
        lines[line_num - 1] = line.replace(old_substring, new_substring)
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f"Fixed {filepath}:{line_num}")
    else:
        # Try to find the double quotes in the line and replace them
        for i, c in enumerate(line):
            if c == '"':
                print(f"  Found double quote at position {i}: {line[max(0,i-10):i+10]!r}")

    print()

# Fix each error by finding the exact double quotes
# DesignComparison.tsx:615 - "Show only differences"
fix_line_exact('apps/web/src/components/designer/DesignComparison.tsx', 615,
    '"Show only differences"',
    '"Show only differences"')

# AircraftSaveLoadShare.tsx:228 - "Save"
fix_line_exact('apps/web/src/components/designer/air/AircraftSaveLoadShare.tsx', 228,
    '"Save"',
    '"Save"')

# BattalionCard.tsx:37 - "{battalion.customName}"
fix_line_exact('apps/web/src/components/designer/division/BattalionCard.tsx', 37,
    '"{battalion.customName}"',
    '"{battalion.customName}"')

# TankSaveLoadShare.tsx:222 - "Save"
fix_line_exact('apps/web/src/components/designer/tank/TankSaveLoadShare.tsx', 222,
    '"Save"',
    '"Save"')

# DivisionDesigner.tsx:648 - "Add Regiment"
fix_line_exact('apps/web/src/pages/DivisionDesigner.tsx', 648,
    '"Add Regiment"',
    '"Add Regiment"')

print("Done")