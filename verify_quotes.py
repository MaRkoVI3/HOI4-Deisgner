import re

files = [
    'apps/web/src/components/designer/DesignComparison.tsx',
    'apps/web/src/components/designer/air/AircraftSaveLoadShare.tsx',
    'apps/web/src/components/designer/division/BattalionCard.tsx',
    'apps/web/src/components/designer/tank/TankSaveLoadShare.tsx',
    'apps/web/src/pages/DivisionDesigner.tsx',
]

for filepath in files:
    with open(filepath, 'r') as f:
        content = f.read()
    # Check for remaining literal double quotes in JSX text
    matches = re.findall(r'>[^<]*?"[^<]*?<', content)
    if matches:
        print(f'{filepath}: Found {len(matches)} potential unescaped quotes')
        for m in matches[:3]:
            print(f'  {repr(m)}')
    else:
        print(f'{filepath}: OK')