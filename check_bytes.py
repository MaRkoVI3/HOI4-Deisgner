# Check what the HTML entity bytes should be
html_entity = '"'
print(f'HTML entity string: {html_entity!r}')
print(f'HTML entity bytes: {html_entity.encode()}')
print(f'Hex: {html_entity.encode().hex()}')

# Double quote
dq = '"'
print(f'Double quote string: {dq!r}')
print(f'Double quote bytes: {dq.encode()}')
print(f'Hex: {dq.encode().hex()}')