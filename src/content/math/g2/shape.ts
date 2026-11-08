/* ---------- 二年級：單位分數（N-2-10）、平面圖形與立體形體（S-2-1、S-2-2） ----------
   單位分數的關鍵是「等分」：切成 4 塊但大小不一樣，塗一塊不是四分之一。所以有一題專考這個。
   圖形題的形狀會隨機轉角度、改大小，免得只認得課本上那個擺法。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle } from '../../../util';

const F: Item[] = [];
const ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八'];

/** 圓或長方形切成 n 等分，塗 1 塊 */
function cut(n: number, shape: 'circle' | 'rect', equal = true): string {
  if (shape === 'rect') {
    const W = 200, H = 80;
    // 不等分：切點偏掉
    const xs = Array.from({ length: n + 1 }, (_, i) => equal || i === 0 || i === n ? i * W / n : i * W / n + (i % 2 ? 14 : -10));
    const parts = xs.slice(0, -1).map((x, i) =>
      `<rect x="${x}" y="0" width="${xs[i + 1] - x}" height="${H}" class="${i === 0 ? 'fr-on' : 'fr-off'}"/>`).join('');
    return `<svg class="frac" viewBox="-2 -2 ${W + 4} ${H + 4}" width="220">${parts}</svg>`;
  }
  const R = 60, c = 62;
  const angs = Array.from({ length: n + 1 }, (_, i) => equal || i === 0 || i === n ? i / n : i / n + (i % 2 ? .06 : -.05));
  const pt = (t: number) => `${(c + R * Math.cos(2 * Math.PI * t - Math.PI / 2)).toFixed(1)},${(c + R * Math.sin(2 * Math.PI * t - Math.PI / 2)).toFixed(1)}`;
  const parts = angs.slice(0, -1).map((a, i) => {
    const b = angs[i + 1], large = b - a > .5 ? 1 : 0;
    return `<path d="M${c},${c} L${pt(a)} A${R},${R} 0 ${large} 1 ${pt(b)} Z" class="${i === 0 ? 'fr-on' : 'fr-off'}"/>`;
  }).join('');
  return `<svg class="frac" viewBox="0 0 124 124" width="150">${parts}</svg>`;
}

[2, 3, 4, 6, 8].forEach(n => F.push({
  k: `fr.unit.${n}`, g: '幾分之一', subj: 'frac', cur: ['N-2-10'],
  make: () => {
    const opts = shuffle([n, ...shuffle([2, 3, 4, 5, 6, 8].filter(x => x !== n)).slice(0, 3)]);
    return { ask: '塗色的部分是全部的幾分之一？', art: cut(n, pick(['circle', 'rect'] as const)),
      choices: opts.map(x => ({ t: `${ZH[x]}分之一`, ok: x === n })),
      hint: `平分成 <b>${n}</b> 塊一樣大的，塗了 1 塊，就是 <b>${ZH[n]}分之一</b>。${n === 2 ? '也就是「一半」。' : ''}` };
  }
}));
F.push({
  k: 'fr.equal', g: '有沒有平分', subj: 'frac', cur: ['N-2-10'], vids: ['CtTeZBl4qe0'],
  make: () => {
    const n = pick([3, 4]), shape = pick(['circle', 'rect'] as const);
    const right = cut(n, shape, true), wrongs = [cut(n, shape, false), cut(n + 1, shape, false), cut(n - 1, shape, true)];
    return { ask: `哪一個塗色的部分是${ZH[n]}分之一？`,
      choices: shuffle([{ art: right, ok: true }, ...wrongs.map(w => ({ art: w, ok: false }))]),
      hint: `要<b>切成 ${n} 塊一樣大的</b>才是${ZH[n]}分之一。切成 ${n} 塊但大小不一樣，不算。` };
  }
});

/* ===== 平面圖形 ===== */
const PLANE: Record<string, (s: number) => string> = {
  三角形: s => `<polygon points="50,${50 - 40 * s} ${50 + 42 * s},${50 + 30 * s} ${50 - 38 * s},${50 + 32 * s}"/>`,
  正方形: s => `<rect x="${50 - 34 * s}" y="${50 - 34 * s}" width="${68 * s}" height="${68 * s}"/>`,
  長方形: s => `<rect x="${50 - 44 * s}" y="${50 - 24 * s}" width="${88 * s}" height="${48 * s}"/>`,
  圓形: s => `<circle cx="50" cy="50" r="${38 * s}"/>`,
};
const planeSVG = (name: string) => {
  const rot = pick([0, 0, 15, 30, 45, -20]), s = .75 + Math.random() * .25;
  return `<svg class="shp" viewBox="0 0 100 100" width="130"><g transform="rotate(${rot} 50 50)">${PLANE[name](s)}</g></svg>`;
};
Object.keys(PLANE).forEach((name, i) => F.push({
  k: `shp.plane.${i}`, g: '平面圖形', subj: 'shape', cur: ['S-2-1', 'S-2-2'], vids: ['9Y8VSx0d9SY'],
  make: () => ({ ask: '這是什麼形狀？', art: planeSVG(name),
    choices: shuffle(Object.keys(PLANE)).map(x => ({ t: x, ok: x === name })),
    hint: { 三角形: '3 條邊、3 個角，是<b>三角形</b>。', 正方形: '4 條邊一樣長、4 個角都是直角，是<b>正方形</b>。轉了一個角度還是正方形。',
      長方形: '4 個角都是直角，對面的邊一樣長，但長邊比短邊長，是<b>長方形</b>。', 圓形: '沒有邊、沒有角，圓圓的，是<b>圓形</b>。' }[name] })
}));
F.push({
  k: 'shp.count', g: '邊和角', subj: 'shape', cur: ['S-2-2'], vids: ['9Y8VSx0d9SY'],
  make: () => {
    const name = pick(['三角形', '正方形', '長方形']), n = name === '三角形' ? 3 : 4, what = pick(['邊', '角']);
    return { ask: `${name}有幾個${what}？`, art: planeSVG(name),
      choices: shuffle([3, 4, 5, 0]).map(v => ({ t: `${v} 個`, ok: v === n })),
      hint: `${name}有 ${n} 條邊、${n} 個角。用手指沿著邊繞一圈數數看。` };
  }
});

/* ===== 立體形體 ===== */
const SOLID: Record<string, string> = {
  正方體: `<polygon points="22,40 62,40 62,80 22,80" class="s1"/><polygon points="22,40 40,24 80,24 62,40" class="s2"/><polygon points="62,40 80,24 80,64 62,80" class="s3"/>`,
  長方體: `<polygon points="12,42 66,42 66,80 12,80" class="s1"/><polygon points="12,42 32,26 86,26 66,42" class="s2"/><polygon points="66,42 86,26 86,64 66,80" class="s3"/>`,
  圓柱: `<path d="M25,28 V74 A25,8 0 0 0 75,74 V28" class="s1"/><ellipse cx="50" cy="28" rx="25" ry="8" class="s2"/>`,
  球: `<circle cx="50" cy="52" r="32" class="s1"/><ellipse cx="40" cy="40" rx="10" ry="6" class="s2" opacity=".6"/>`,
  圓錐: `<path d="M50,16 L22,74 A28,9 0 0 0 78,74 Z" class="s1"/><path d="M22,74 A28,9 0 0 1 78,74" class="s3" fill="none"/>`,
};
Object.keys(SOLID).forEach((name, i) => F.push({
  k: `shp.solid.${i}`, g: '立體形體', subj: 'shape', cur: ['S-2-1', 'S-2-2'], vids: ['nN_ypaMi_cE'],
  make: () => ({ ask: '這是什麼形體？', art: `<svg class="shp solid" viewBox="0 0 100 100" width="130">${SOLID[name]}</svg>`,
    choices: shuffle([name, ...shuffle(Object.keys(SOLID).filter(x => x !== name)).slice(0, 3)]).map(x => ({ t: x, ok: x === name })),
    hint: { 正方體: '6 個面都是一樣大的正方形，像骰子：<b>正方體</b>。', 長方體: '6 個面都是長方形（或有兩個正方形），像面紙盒：<b>長方體</b>。',
      圓柱: '上下兩個圓一樣大，中間直直的，像罐頭：<b>圓柱</b>。', 球: '每個方向看都是圓的，可以往任何方向滾：<b>球</b>。',
      圓錐: '底下一個圓，上面尖尖的，像甜筒：<b>圓錐</b>。' }[name] })
}));

export { F as SHAPE_G2 };
