/* ---------- 一年級：形體的操作（S-1-2） ----------
   課綱：「以操作活動為主。描繪、複製、拼貼、堆疊」，「應包含平面圖形、立體形體或兩者互動之活動」。
   手機上沒有真的積木，這裡做兩種「看圖想操作」的題：
   拼貼——這個形狀是哪兩塊拼起來的；堆疊——這一疊用了幾個積木（一年級只數看得到的）。 */
import type { Item } from '../../types';
import { rnd, pick, shuffle, uniq } from '../../util';

const S: Item[] = [];
const CUR = ['S-1-2'];

/* ===== 拼貼 ===== */
const piece = (body: string, w = 70, h = 70) => `<svg viewBox="-4 -4 ${w + 8} ${h + 8}" width="${w * .9}" class="pc">${body}</svg>`;
const P = {
  tri: '<polygon points="0,70 70,70 0,0" class="pc-a"/>',
  sq: '<rect x="0" y="0" width="70" height="70" class="pc-a"/>',
  halfRect: '<rect x="0" y="0" width="70" height="35" class="pc-a"/>',
  tallRect: '<rect x="0" y="0" width="35" height="70" class="pc-a"/>',
  circle: '<circle cx="35" cy="35" r="35" class="pc-a"/>',
  semi: '<path d="M0 35a35 35 0 0 1 70 0z" class="pc-a"/>',
};
const pair = (a: string, b: string) => `<div class="pair">${a}<span>＋</span>${b}</div>`;
/** [名稱, 拼好的形狀（兩塊用不同顏色畫出來）, 正確的兩塊, 錯誤的組合們] */
const COMPOSE: [string, string, string, string[]][] = [
  ['正方形', '<polygon points="0,70 70,70 0,0" class="pc-a"/><polygon points="0,0 70,0 70,70" class="pc-b"/>',
    pair(piece(P.tri), piece(P.tri)), [pair(piece(P.sq), piece(P.tri)), pair(piece(P.circle), piece(P.circle)), pair(piece(P.semi), piece(P.tri))]],
  ['長方形', '<rect x="0" y="0" width="70" height="70" class="pc-a"/><rect x="70" y="0" width="70" height="70" class="pc-b"/>',
    pair(piece(P.sq), piece(P.sq)), [pair(piece(P.tri), piece(P.sq)), pair(piece(P.circle), piece(P.sq)), pair(piece(P.tri), piece(P.tri))]],
  ['大三角形', '<polygon points="0,70 70,70 70,0" class="pc-a"/><polygon points="70,70 140,70 70,0" class="pc-b"/>',
    pair(piece(P.tri), piece(P.tri)), [pair(piece(P.sq), piece(P.sq)), pair(piece(P.semi), piece(P.semi)), pair(piece(P.halfRect), piece(P.tri))]],
  ['圓形', '<path d="M0 35a35 35 0 0 1 70 0z" class="pc-a"/><path d="M70 35a35 35 0 0 1 -70 0z" class="pc-b"/>',
    pair(piece(P.semi), piece(P.semi)), [pair(piece(P.tri), piece(P.tri)), pair(piece(P.sq), piece(P.semi)), pair(piece(P.halfRect), piece(P.halfRect))]],
];
COMPOSE.forEach(([nm, whole, right, wrongs], i) => S.push({
  k: `s1.compose.${i}`, g: '拼一拼', subj: 'shape', cur: CUR,
  make: () => {
    const wide = nm === '長方形' || nm === '大三角形';
    return { ask: `這個${nm}是用哪兩塊拼起來的？`,
      art: `<svg viewBox="-4 -4 ${wide ? 148 : 78} 78" width="${wide ? 190 : 110}" class="pc">${whole}</svg>`,
      choices: shuffle([{ art: right, ok: true }, ...wrongs.map(w => ({ art: w, ok: false }))]),
      hint: `看拼好的${nm}中間那條線，把它切開，就是兩塊一樣的形狀。` };
  }
}));

/* ===== 堆疊：數積木 ===== */
/** 等角投影的小方塊；heights[i] 是第 i 欄疊幾個（一排，看得到全部） */
function stack(heights: number[]): string {
  const s = 26, dx = s * .5, dy = s * .5;
  let out = '';
  heights.forEach((h, col) => {
    for (let k = 0; k < h; k++) {
      const x = 10 + col * s, y = 20 + (5 - k) * s;
      out += `<polygon points="${x},${y} ${x + s},${y} ${x + s},${y + s} ${x},${y + s}" class="cb-f"/>
        <polygon points="${x},${y} ${x + dx},${y - dy} ${x + s + dx},${y - dy} ${x + s},${y}" class="cb-t"/>
        <polygon points="${x + s},${y} ${x + s + dx},${y - dy} ${x + s + dx},${y + s - dy} ${x + s},${y + s}" class="cb-s"/>`;
    }
  });
  const w = 20 + heights.length * s + dx;
  return `<svg viewBox="0 0 ${w + 10} ${20 + 6 * s + 8}" width="${Math.min(260, (w + 10) * 1.3)}" class="cubes">${out}</svg>`;
}
([['s1.stack.s', 2, 4, 3], ['s1.stack.l', 3, 5, 7]] as const).forEach(([k, cols, maxH, minTotal]) => S.push({
  k, g: '數積木', subj: 'shape', cur: CUR,
  make: () => {
    let hs: number[];
    do hs = Array.from({ length: cols }, () => 1 + rnd(maxH)); while (hs.reduce((a, b) => a + b, 0) < minTotal);
    const n = hs.reduce((a, b) => a + b, 0);
    return { ask: '這一疊用了幾個積木？', art: stack(hs),
      choices: shuffle(uniq([n, n + 1, n - 1, n + 2].filter(v => v > 0))).map(v => ({ t: `${v} 個`, ok: v === n })),
      hint: `一欄一欄數：${hs.join('＋')}＝<b>${n}</b> 個。` };
  }
}));

export { S as SHAPE_G1 };
