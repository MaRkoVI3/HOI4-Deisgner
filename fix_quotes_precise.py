def fix_line(filepath, line_num, old_substring, new_substring):
    with open(filepath, 'r') as f:
        lines = f.readlines()

    line = lines[line_num - 1]
    if old_substring in line:
        lines[line_num - 1] = line.replace(old_substring, new_substring)
        with open(filepath, 'w') as f:
            f.writelines(lines)
        print(f"Fixed {filepath}:{line_num}")
    else:
        print(f"NOT FOUND in {filepath}:{line_num}: {old_substring!r}")
        print(f"  Actual line: {line!r}")

# Fix each error precisely
fix_line('apps/web/src/components/designer/DesignComparison.tsx', 615,
    'Uncheck "Show only differences"',
    'Uncheck "Show only differences"')

fix_line('apps/web/src/components/designer/air/AircraftSaveLoadShare.tsx', 228,
    'click "Save"',
    'click "Save"')

fix_line('apps/web/src/components/designer/division/BattalionCard.tsx', 37,
    '"{battalion.customName}"',
    '"{battalion.customName}"')

fix_line('apps/web/src/components/designer/tank/TankSaveLoadShare.tsx', 155,
    "'Anti-Air Tank'",
    '"Anti-Air Tank"')

fix_line('apps/web/src/components/designer/tank/TankSaveLoadShare.tsx', 222,
    'click "Save"',
    'click "Save"')

fix_line('apps/web/src/pages/DivisionDesigner.tsx', 648,
    'Click "Add Regiment"',
    'Click "Add Regiment"')

print("Done")