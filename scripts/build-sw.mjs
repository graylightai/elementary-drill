// vite build 之後自動跑：依 dist/ 實際產出的檔案產生 dist/sw.js。
// 版本字串取自所有檔案內容的雜湊——內容一變，裝在主畫面的 app 下次開啟就會換新。
// 以前要手動跑 build-sw.py，忘了跑手機就一直吃舊快取；現在綁在 npm run build 裡。
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const files = walk(dist)
  .map(p => relative(dist, p).split('\\').join('/'))
  .filter(f => f !== 'sw.js' && !f.endsWith('.DS_Store') && !f.endsWith('.txt'))
  .sort();

const h = createHash('sha256');
for (const f of files) h.update(f).update(readFileSync(join(dist, f)));
const ver = h.digest('hex').slice(0, 12);

let tpl = readFileSync(new URL('../src/sw-template.js', import.meta.url), 'utf8');
tpl = tpl.replace(/const VERSION = '[^']*';/, `const VERSION = '${ver}';`);
tpl = tpl.replace(/const ASSETS = \[[\s\S]*?\n\];/, 'const ASSETS = ' + JSON.stringify(['./', ...files], null, 2) + ';');
writeFileSync(join(dist, 'sw.js'), tpl);
const kb = files.reduce((a, f) => a + statSync(join(dist, f)).size, 0) / 1024;
console.log(`sw.js：${files.length + 1} 個檔案、${kb.toFixed(0)} KB、版本 ${ver}`);
