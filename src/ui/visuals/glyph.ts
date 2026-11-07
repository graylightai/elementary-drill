import { BGLYPH } from './bopo-glyphs';

export interface StrokeData { s: string[]; m: number[][] }
let STROKES: Record<string, StrokeData> | null = null;
const setStrokes = (j: Record<string, StrokeData> | null) => { STROKES = j; };                                   // 字 → {s:[筆畫輪廓], m:[[x,y,x,y…]]}
const FLIP = 'scale(1,-1) translate(0,-900)';         // 資料的 y 軸朝上
const dataY = (y: number) => 900 - y;                           // 資料座標 → viewBox 座標
const medPts = (m: number[]) => { const p: [number, number][] = []; for (let i = 0; i < m.length; i += 2) p.push([m[i], dataY(m[i + 1])]); return p; };

/* 把字形切成 48×48 的格子，先問瀏覽器哪些格子落在字裡面（只算一次）。
   她畫過的格子記下來，再比對覆蓋率與出界比例。 */
interface Cells { inside: Uint8Array; near: Uint8Array; total: number }
const GRIDN = 48, _cellCache: Record<string, Cells> = {};
function glyphCells(ch: string): Cells {
  if (_cellCache[ch]) return _cellCache[ch];
  const cv = document.createElement('canvas'); cv.width = cv.height = GRIDN;
  const cx = cv.getContext('2d')!;
  cx.setTransform(GRIDN / 1024, 0, 0, GRIDN / 1024, 0, 0);
  const p = new Path2D(BGLYPH[ch]);
  const inside = new Uint8Array(GRIDN * GRIDN);
  let n = 0;
  for (let y = 0; y < GRIDN; y++) for (let x = 0; x < GRIDN; x++) {
    // 路徑會被 transform 縮到 48×48，但 isPointInPath 的座標是畫布像素、不吃 transform，
    // 所以這裡要傳格子座標本身，不是 1024 空間的座標
    if (cx.isPointInPath(p, x + .5, y + .5)) { inside[y * GRIDN + x] = 1; n++; }
  }
  // 往外膨脹 2 格當容錯帶：手指比筆畫粗，貼著邊描不該被判出界
  const near = new Uint8Array(GRIDN * GRIDN), R = 2;
  for (let y = 0; y < GRIDN; y++) for (let x = 0; x < GRIDN; x++) {
    if (!inside[y * GRIDN + x]) continue;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      const a = x + dx, bq = y + dy;
      if (a >= 0 && bq >= 0 && a < GRIDN && bq < GRIDN) near[bq * GRIDN + a] = 1;
    }
  }
  return _cellCache[ch] = { inside, near, total: n };
}

/** 注音符號：直接畫真實字形輪廓 */
function bopoSVG(ch: string, { solid = false, ink = true } = {}): string {
  return `<svg class="tr" viewBox="0 0 1024 1024">${grid()}
    <path d="${BGLYPH[ch]}" class="${solid ? 'bg-solid' : 'bg-ghost'}"/>
    ${ink ? '<polyline class="ink" points=""/>' : ''}</svg>`;
}

/** 田字格 + 整個字的淡底 */
function grid(): string {
  return `<rect x="24" y="24" width="976" height="976" rx="14" class="tg-box"/>
    <path d="M24 512H1000M512 24V1000M24 24 1000 1000M1000 24 24 1000" class="tg-line"/>`;
}
function charSVG(ch: string, { done = 0, cur = -1, ink = true } = {}): string {
  const d = STROKES![ch];
  const all = d.s.map((p, i) =>
    `<path d="${p}" class="${i < done ? 'st-done' : i === cur ? 'st-cur' : 'st-ghost'}"/>`).join('');
  let dot = '';
  if (cur >= 0) {
    const p = medPts(d.m[cur])[0];
    dot = `<circle cx="${p[0]}" cy="${p[1]}" r="34" class="st-start"/>`;
  }
  return `<svg class="tr" viewBox="0 0 1024 1024">${grid()}
    <g transform="${FLIP}">${all}</g>${dot}
    ${ink ? '<polyline class="ink" points=""/>' : ''}</svg>`;
}

export { STROKES, setStrokes, FLIP, dataY, medPts, GRIDN, glyphCells, bopoSVG, grid, charSVG };
