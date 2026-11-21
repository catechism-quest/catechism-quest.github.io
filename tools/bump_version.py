#!/usr/bin/env python3
"""Bump the app version after changing any app file.

Updates VERSION in sw.js (cq-vN -> cq-vN+1) and the ?v=N on every local
stylesheet and script in index.html, so browsers and the service worker
always load a matching set of files after a deploy.
Usage: python3 tools/bump_version.py
"""
import re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
sw = root / 'sw.js'; idx = root / 'index.html'
s = sw.read_text()
m = re.search(r"const VERSION = 'cq-v(\d+)';", s)
n = int(m.group(1)) + 1
sw.write_text(s.replace(m.group(0), f"const VERSION = 'cq-v{n}';"))
h = idx.read_text()
def tag(mo):
    attr, path = mo.group(1), mo.group(2)
    return f'{attr}="{path}?v={n}"'
h = re.sub(r'(src|href)="((?:js|css)/[^"?]+|catechisms\.js)(?:\?v=\d+)?"', tag, h)
idx.write_text(h)
print(f'cq-v{n}')
