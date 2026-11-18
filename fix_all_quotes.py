# Fix all unescaped quotes in the codebase

def fix_file_quotes(filepath, replacements):
    """Replace literal double quotes with HTML entities in specific contexts."""
    with open(filepath, 'r') as f:
        content = f.read()

    for old, new in replacements:
        content = content.replace(old, new)

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed {filepath}")

# DesignComparison.tsx - line 615
fix_file_quotes('apps/web/src/components/designer/DesignComparison.tsx', [
    ('Uncheck "Show only differences"', 'Uncheck "Show only differences"'),
])

# AircraftSaveLoadShare.tsx - line 228
fix_file_quotes('apps/web/src/components/designer/air/AircraftSaveLoadShare.tsx', [
    ('click "Save"', 'click "Save"'),
])

# BattalionCard.tsx - line 37
fix_file_quotes('apps/web/src/components/designer/division/BattalionCard.tsx', [
    ('"{battalion.customName}"', '"{battalion.customName}"'),
])

# TankSaveLoadShare.tsx - lines 155, 222
fix_file_quotes('apps/web/src/components/designer/tank/TankSaveLoadShare.tsx', [
    ('"Anti-Air Tank"', '"Anti-Air Tank"'),
    ('click "Save"', 'click "Save"'),
])

# DivisionDesigner.tsx - line 648
fix_file_quotes('apps/web/src/pages/DivisionDesigner.tsx', [
    ('Click "Add Regiment"', 'Click "Add Regiment"'),
])

print("Done")