/* ---------- 一年級：長度（N-1-5、S-1-1） ----------
   課綱：「以操作活動為主。初步認識、直接比較、間接比較（含個別單位）」，
   備註：「本條目教學無常用單位」——所以只用「幾個方塊長」，不出公分。
   重點陷阱：兩枝筆沒有從同一邊對齊時，右邊比較突出的不一定比較長。 */
import type { Item } from '../../types';
import { rnd, shuffle, uniq, distract } from '../../util';

const L: Item[] = [];
const CUR = ['N-1-5', 'S-1-1'];
const U = 24;                                    // 一個方塊的寬
const PENS = [['紅', '#D9534A'], ['藍', '#3B7FB5'], ['綠', '#3B8F63'], ['黃', '#E2B33C']] as const;

/** 一枝鉛筆：從 x 格開始、len 格長；units=true 時下面畫方塊 */
function pen(len: number, color: string, x = 0, y = 0, units = false): string {
  const px = x * U, w = len * U, tip = 14;
  let s = `<rect x="${px}" y="${y + 4}" width="${w - tip}" height="16" rx="3" fill="${color}"/>
    <polygon points="${px + w - tip},${y + 4} ${px + w},${y + 12} ${px + w - tip},${y + 20}" fill="#E8C9A0"/>
    <polygon points="${px + w - 5},${y + 10} ${px + w},${y + 12} ${px + w - 5},${y + 14}" fill="#3A332D"/>`;
  if (units) for (let i = 0; i < len; i++)
    s += `<rect x="${px + i * U + 1}" y="${y + 24}" width="${U - 2}" height="${U - 2}" rx="3" class="lenblk"/>`;
  return s;
}
/** 背景的淡格線，讓沒對齊的題目也能數 */
const gridBg = (cols: number, h: number) =>
  Array.from({ length: cols + 1 }, (_, i) => `<line x1="${i * U}" y1="0" x2="${i * U}" y2="${h}" class="lengrid"/>`).join('');
const svg = (cols: number, h: number, body: string) =>
  `<svg class="lensvg" viewBox="-2 -2 ${cols * U + 4} ${h + 4}" width="${Math.min(320, cols * U + 4)}">${body}</svg>`;

/** 長度不重複的幾枝筆 */
function lengths(n: number, lo: number, hi: number): number[] {
  for (;;) { const a = Array.from({ length: n }, () => lo + rnd(hi - lo + 1)); if (uniq(a).length === n) return a; }
}

/* 1) 直接比較：從同一邊對齊，最長／最短 */
(['long', 'short'] as const).forEach(which => L.push({
  k: `len.${which}`, g: '比長短', subj: 'cmp', cur: CUR,
  make: () => {
    const n = 2 + rnd(2), lens = lengths(n, 4, 12), pens = shuffle([...PENS]).slice(0, n);
    const target = which === 'long' ? Math.max(...lens) : Math.min(...lens);
    const body = lens.map((l, i) => pen(l, pens[i][1], 0, i * 30)).join('');
    return { ask: `哪一枝${which === 'long' ? '最長' : '最短'}？`, art: svg(12, n * 30, body),
      choices: pens.map(([name, hex], i) => ({ swatch: hex, tag: `${name}色`, ok: lens[i] === target })),
      hint: `筆都從左邊對齊了，看右邊誰${which === 'long' ? '最突出' : '最短'}：<b>${pens[lens.indexOf(target)][0]}色</b>。` };
  }
}));

/* 2) 沒對齊：右邊比較突出的不一定比較長，要數格子 */
L.push({
  k: 'len.align', g: '沒對齊怎麼比', subj: 'cmp', cur: CUR,
  make: () => {
    // 短的那枝往右移，讓它的尾巴比較突出——這就是陷阱
    const long = 6 + rnd(5), short = long - 1 - rnd(3), shift = long - short + 1 + rnd(2);
    const [pa, pb] = shuffle([...PENS]).slice(0, 2);
    const rows = shuffle([{ p: pa, len: long, x: 0 }, { p: pb, len: short, x: shift }]);
    const cols = Math.max(...rows.map(r => r.x + r.len));
    const body = gridBg(cols, 60) + rows.map((r, i) => pen(r.len, r.p[1], r.x, i * 30)).join('');
    return { ask: '哪一枝比較長？', art: svg(cols, 60, body),
      choices: rows.map(r => ({ swatch: r.p[1], tag: `${r.p[0]}色`, ok: r.len === long })),
      hint: `兩枝筆沒有從同一邊開始，不能只看誰比較靠右。數格子：${pa[0]}色 <b>${long}</b> 格，${pb[0]}色 <b>${short}</b> 格。` };
  }
});

/* 3) 用方塊量：有幾個方塊長 */
L.push({
  k: 'len.unit', g: '用方塊量', subj: 'cmp', cur: CUR,
  make: () => {
    const len = 3 + rnd(8), [, hex] = shuffle([...PENS])[0];
    return { ask: '這枝筆有幾個方塊長？', art: svg(len, 48, pen(len, hex, 0, 0, true)),
      choices: distract(len, 2, 12).map(v => ({ t: `${v} 個`, ok: v === len })),
      hint: `從左邊開始，一個一個數方塊：一共 <b>${len}</b> 個。` };
  }
});

/* 4) 間接比較：兩條分開量，再比誰長、長幾個 */
L.push({
  k: 'len.diff', g: '長幾個方塊', subj: 'cmp', cur: CUR,
  make: () => {
    const [a, b] = lengths(2, 3, 10), [pa, pb] = shuffle([...PENS]).slice(0, 2);
    const xa = rnd(2), xb = rnd(3);                 // 故意不對齊，只能靠方塊數比
    const body = pen(a, pa[1], xa, 0, true) + pen(b, pb[1], xb, 56, true);
    const big = a > b ? pa : pb, small = a > b ? pb : pa, d = Math.abs(a - b);
    return { ask: `${big[0]}色比${small[0]}色長幾個方塊？`, art: svg(13, 104, body),
      choices: distract(d, 1, 8).map(v => ({ t: `${v} 個`, ok: v === d })),
      hint: `${pa[0]}色 ${a} 個，${pb[0]}色 ${b} 個。${Math.max(a, b)} 比 ${Math.min(a, b)} 多 <b>${d}</b> 個。` };
  }
});

export { L as LENGTH };
