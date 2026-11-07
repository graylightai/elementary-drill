/* 小學練功房 — 啟動
   核心是間隔重複：每個知識點一個 key，答錯掉回第一箱，答對升一箱。
   反應時間納入判定：答對但太慢 = 還不熟，不升箱。 */
import './style.css';
import { addStrokeItems } from './content';
import { setStrokes, type StrokeData } from './ui/visuals/glyph';
import { $ } from './ui/dom';
import { closeSheet } from './ui/dom';
import { elapsed, stopTimer } from './ui/quiz';
import { show, view, buildHome, syncSettings } from './ui/pages';

$('#back').onclick = () => { stopTimer(); closeSheet(); show('home'); };
document.querySelectorAll<HTMLElement>('[data-go]').forEach(b => { b.onclick = () => show(b.dataset.go!); });

$('#clock').textContent = String(Math.floor(elapsed.s / 60));
syncSettings();
show('home');

/* 筆順資料 435 KB，單獨放一個檔。載好再把描字與數筆畫題目掛上去，
   其他科不等它。離線時由 Service Worker 從快取給。 */
fetch('strokes.json')
  .then(r => r.ok ? r.json() as Promise<Record<string, StrokeData>> : Promise.reject(r.status))
  .then(j => { setStrokes(j); addStrokeItems(j); if (view === 'home') buildHome(); })
  .catch(() => { setStrokes(null); });

/* 離線：第一次連網開啟時把整個 app 抓進快取。開發模式不註冊，免得改了看不到 */
const secure = location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname);
if ('serviceWorker' in navigator && secure && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
