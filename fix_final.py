with open('apps/web/src/components/designer/DesignComparison.tsx', 'r') as f:
    content = f.read()

# HTML entity for double quote is " (ampersand, q, u, o, t, semicolon)
old = 'Uncheck "Show only differences"'
new = 'Uncheck "Show only differences"'
content = content.replace(old, new)

with open('apps/web/src/components/designer/DesignComparison.tsx', 'w') as f:
    f.write(content)

print("Done")