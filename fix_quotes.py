with open('apps/web/src/components/designer/division/DivisionTemplateBuilder.tsx', 'r') as f:
    content = f.read()

old = 'Click "Add Battalion"'
# HTML entity " = 6 chars: & q u o t ;
new = 'Click ' + '"' + 'Add Battalion' + '"'
print('Old:', repr(old))
print('New:', repr(new))
print('Same?', old == new)

content = content.replace(old, new)

with open('apps/web/src/components/designer/division/DivisionTemplateBuilder.tsx', 'w') as f:
    f.write(content)
print('Written')