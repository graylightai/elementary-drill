#!/usr/bin/env python3
"""把題庫裡用到、但影片庫（src/content/videos.ts）還沒有的 YouTube 影片補進去。

每一支都會先用 YouTube oEmbed 確認：
  1. 影片存在、允許嵌入（oEmbed 回 200）
  2. 是均一教育平台官方頻道 @JunyiAcademy 上的
不符合就停下來，不會加進去。標題取 oEmbed 的原標題，去掉【概念】【解題】。

用法：python3 scripts/sync-videos.py
"""
import glob, json, re, sys, urllib.request
from datetime import date

ROOT = __file__.rsplit('/scripts/', 1)[0]
LIB = f'{ROOT}/src/content/videos.ts'

used = set()
for f in glob.glob(f'{ROOT}/src/content/**/*.ts', recursive=True):
    if f.endswith('videos.ts'):
        continue
    src = open(f, encoding='utf-8').read()
    for m in re.finditer(r"vids:\s*\[([^\]]*)\]", src):
        used.update(re.findall(r"'([A-Za-z0-9_-]{11})'", m.group(1)))
    # 寫在常數表裡的（例如九九乘法的 TABLE_VID、V_NUM）
    for m in re.finditer(r"(?:VID|V_[A-Z]+|VIDS)\b[^=]*=\s*([\[{][^;]*?[\]}]);", src, re.S):
        used.update(re.findall(r"'([A-Za-z0-9_-]{11})'", m.group(1)))

lib = open(LIB, encoding='utf-8').read()
have = set(re.findall(r"'([A-Za-z0-9_-]{11})': '", lib))
missing = sorted(used - have)
if not missing:
    print('影片庫已包含所有用到的影片')
    sys.exit(0)

lines = []
for vid in missing:
    url = f'https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={vid}&format=json'
    try:
        d = json.load(urllib.request.urlopen(url, timeout=15))
    except Exception as e:
        sys.exit(f'✗ {vid}：oEmbed 失敗（影片不存在或不允許嵌入）：{e}')
    if not d.get('author_url', '').endswith('@JunyiAcademy'):
        sys.exit(f"✗ {vid}：不是均一官方頻道（{d.get('author_url')}）")
    title = re.sub(r'^【[^】]*】', '', d['title'].split('|')[0].strip()).strip().replace("'", '’')
    lines.append(f"  '{vid}': '{title}',")
    print(f'✓ {vid} {title}')

block = f"  // {date.today().isoformat()} 由 scripts/sync-videos.py 確認後加入\n" + '\n'.join(lines) + '\n'
lib = lib.replace('\n};\nexport const VIDEO_IDS', '\n' + block + '};\nexport const VIDEO_IDS', 1)
open(LIB, 'w', encoding='utf-8').write(lib)
print(f'加入 {len(lines)} 支')
