# Bump the cache-busting version on every local css/js reference in index.html.
import re, time
h = open('index.html', encoding='utf8').read()
v = str(int(time.time()))
h = re.sub(r'(href|src)="([a-z\-]+\.(?:css|js))(?:\?v=[^"]*)?"', lambda m: f'{m.group(1)}="{m.group(2)}?v={v}"', h)
open('index.html', 'w', encoding='utf8').write(h)
print('v', v)
