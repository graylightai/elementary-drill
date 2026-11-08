/* ---------- 二年級：估算、兩步驟、三數相加、容量重量面積、周長、分類計數 ----------
   N-2-4  簡單加減估算：「以百位數估算為主」，數字都挑靠近整百的，答案不會模稜兩可。
   N-2-8  兩步驟應用問題：加減混合、加與乘、減與乘；課綱註明「不含併式、不含連乘」。
   R-2-2  三數相加，順序改變不影響其和：先湊十。
   N-2-12 容量、重量、面積：初步認識、直接比較、間接比較（含個別單位）。
          關鍵觀念：用不一樣大的杯子量，杯數多不代表裝得多——專門出一題。
   S-2-4  平面圖形的邊長與周長。
   D-2-1  分類與呈現：把東西分好類，再數每一類有幾個。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';
import { WORDS } from '../../words';

const G: Item[] = [];
const name = (slug: string) => WORDS.find(w => w[0] === slug)?.[1] ?? slug;

/* ===== 估算 ===== */
const nearHundred = () => { const h = 1 + rnd(8); return h * 100 + pick([-1, 1]) * (2 + rnd(12)); };
const round100 = (n: number) => Math.round(n / 100) * 100;
G.push({
  k: 'est.add', g: '估算（大約多少錢）', subj: 'math', cur: ['N-2-4'], vids: ['M6MenPw4z5I'],
  make: () => {
    let a = nearHundred(), b = nearHundred(); while (round100(a) + round100(b) > 1000) { a = nearHundred(); b = nearHundred(); }
    const ans = round100(a) + round100(b);
    return { ask: `買一個 ${a} 元的書包和一雙 ${b} 元的鞋子，大約要幾百元？`,
      choices: shuffle(uniq([ans, ans + 100, ans - 100, ans + 200].filter(v => v > 0))).map(v => ({ t: `大約 ${v} 元`, ok: v === ans })),
      hint: `${a} 很接近 <b>${round100(a)}</b>，${b} 很接近 <b>${round100(b)}</b>。${round100(a)}＋${round100(b)}＝<b>${ans}</b>，所以大約 ${ans} 元。` };
  }
});
G.push({
  k: 'est.sub', g: '估算（大約剩多少）', subj: 'math', cur: ['N-2-4'], vids: ['M6MenPw4z5I'],
  make: () => {
    const have = 100 * (5 + rnd(5)); let p = nearHundred(); while (round100(p) >= have) p = nearHundred();
    const ans = have - round100(p);
    return { ask: `媽媽帶了 ${have} 元，買了 ${p} 元的東西，大約剩幾百元？`,
      choices: shuffle(uniq([ans, ans + 100, ans - 100, ans + 200].filter(v => v > 0))).map(v => ({ t: `大約 ${v} 元`, ok: v === ans })),
      hint: `${p} 很接近 <b>${round100(p)}</b>。${have}－${round100(p)}＝<b>${ans}</b>，大約剩 ${ans} 元。` };
  }
});

/* ===== 三數相加：先湊十 ===== */
G.push({
  k: 'sum3', g: '三個數相加（先湊十）', subj: 'math', cur: ['R-2-2', 'N-2-8'], vids: ['3__RmyOCDsk'],
  make: () => {
    const a = 1 + rnd(9), b = 10 - a, c = 2 + rnd(8);
    const [x, y, z] = shuffle([a, b, c]), s = a + b + c;
    return { ask: '算算看，哪兩個先加比較快？', big: `${x} ＋ ${y} ＋ ${z}`,
      choices: distract(s, 5, 30).map(v => ({ t: v, ok: v === s })),
      hint: `${a} 和 ${b} 先加剛好是 10，再加 ${c}：10＋${c}＝<b>${s}</b>。順序換了，答案一樣。` };
  }
});

/* ===== 兩步驟 ===== */
G.push({
  k: 'two.addsub', g: '兩步驟（加減混合）', subj: 'math', cur: ['N-2-8'], vids: ['9TIsp5p-eQ0'],
  make: () => {
    const a = 20 + rnd(40), b = 5 + rnd(15), c = 5 + rnd(20), ans = a - b + c;
    return { ask: `公車上有 ${a} 人，到站下車 ${b} 人，又上車 ${c} 人。現在車上有幾人？`,
      choices: distract(ans, 1, 99).map(v => ({ t: v, ok: v === ans })),
      hint: `一步一步算：下車是變少，${a}－${b}＝${a - b}；上車是變多，${a - b}＋${c}＝<b>${ans}</b>。` };
  }
});
G.push({
  k: 'two.multadd', g: '兩步驟（先乘再加減）', subj: 'mul', cur: ['N-2-8'], vids: ['ZSvWCYyxR7M'],
  make: () => {
    const each = 2 + rnd(8), boxes = 2 + rnd(8), plus = rnd(2) === 0;
    const p = each * boxes, c = 1 + rnd(Math.min(9, p - 1)), ans = plus ? p + c : p - c;
    return { ask: plus ? `每盒有 ${each} 顆糖，買了 ${boxes} 盒，老闆又多送 ${c} 顆。一共有幾顆？`
                       : `每盒有 ${each} 顆糖，買了 ${boxes} 盒，吃掉了 ${c} 顆。還剩幾顆？`,
      choices: distract(ans, 1, 90).map(v => ({ t: v, ok: v === ans })),
      hint: `先算 ${boxes} 盒有幾顆：${each}×${boxes}＝${p}。再${plus ? `加上送的 ${c} 顆：${p}＋${c}` : `減掉吃掉的 ${c} 顆：${p}－${c}`}＝<b>${ans}</b>。`,
      remedial: [`x.${each}x${boxes}`] };
  }
});
G.push({
  k: 'two.addmult', g: '兩步驟（先加再乘）', subj: 'mul', cur: ['N-2-8'], vids: ['dYaYLu-Dll0'],
  make: () => {
    const a = 1 + rnd(5), c = 1 + rnd(8 - a), each = a + c, bags = 2 + rnd(8), ans = each * bags;
    return { ask: `每個盤子先放 ${a} 顆草莓，再各放 ${c} 顆。${bags} 個盤子一共有幾顆？`,
      choices: distract(ans, 2, 90).map(v => ({ t: v, ok: v === ans })),
      hint: `先算一盤有幾顆：${a}＋${c}＝${each}。再算 ${bags} 盤：${each}×${bags}＝<b>${ans}</b>。`,
      remedial: [`x.${each}x${bags}`] };
  }
});

/* ===== 容量 ===== */
const cup = '<svg viewBox="0 0 20 24" width="18"><path d="M3 3h14l-2 18H5z" class="cup"/></svg>';
const jug = (color: string) => `<svg viewBox="0 0 40 60" width="44"><path d="M8 8h20v4l6 6v36a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V18l2-6z" fill="${color}" opacity=".85" stroke="var(--ink)" stroke-width="2"/></svg>`;
G.push({
  k: 'cap.unit', g: '容量（用杯子量）', subj: 'cmp', cur: ['N-2-12'], vids: ['CPabaPZfwFc'],
  make: () => {
    let a = 3 + rnd(7), b = 3 + rnd(7); while (a === b) b = 3 + rnd(7);
    const row = (n: number) => `<span class="cups">${cup.repeat(n)}</span>`;
    const askDiff = rnd(2) === 0, d = Math.abs(a - b), big = a > b ? '紅水壺' : '藍水壺';
    return { ask: askDiff ? '用一樣大的杯子倒。裝得多的那一壺，比另一壺多幾杯？' : '用一樣大的杯子倒。哪一個水壺裝的水比較多？',
      art: `<div class="meas"><div>${jug('#E07A6E')}<b>紅水壺</b>${row(a)}<small>倒滿 ${a} 杯</small></div><div>${jug('#6FA3CC')}<b>藍水壺</b>${row(b)}<small>倒滿 ${b} 杯</small></div></div>`,
      choices: askDiff
        ? shuffle(uniq([d, d + 1, d + 2, Math.max(1, d - 1)])).map(v => ({ t: `${v} 杯`, ok: v === d }))
        : ['紅水壺', '藍水壺', '一樣多'].map(v => ({ t: v, ok: v === big })),
      hint: `杯子一樣大，杯數多的就裝得多：紅 ${a} 杯、藍 ${b} 杯，<b>${big}</b>多 ${d} 杯。` };
  }
});
G.push({
  k: 'cap.trap', g: '容量（杯子不一樣大）', subj: 'cmp', cur: ['N-2-12'], vids: ['CPabaPZfwFc'],
  make: () => {
    const a = 5 + rnd(4), b = 2 + rnd(3);
    return { ask: `紅瓶倒滿了 ${a} 個小杯子，藍瓶倒滿了 ${b} 個大杯子。可以說紅瓶裝的水比較多嗎？`,
      choices: shuffle(['不能確定，杯子不一樣大', '可以，紅瓶杯數比較多', '可以，藍瓶比較多', '一樣多']).map(v => ({ t: v, ok: v === '不能確定，杯子不一樣大' })),
      hint: '要用<b>一樣大的杯子</b>量，杯數才可以比。一個用小杯、一個用大杯，杯數多不代表裝得多。' };
  }
});

/* ===== 重量 ===== */
function scale(left: string, right: string, tilt: number): string {
  // tilt > 0：左邊比較低（比較重）
  const a = tilt * 9;
  return `<svg viewBox="0 0 220 120" width="260" class="scale">
    <polygon points="110,62 96,112 124,112" class="sc-base"/>
    <g transform="rotate(${-a} 110 60)">
      <line x1="20" y1="60" x2="200" y2="60" class="sc-beam"/>
      <g transform="rotate(${a} 40 60)"><line x1="40" y1="60" x2="40" y2="76" class="sc-beam"/><path d="M16 76h48l-6 10H22z" class="sc-pan"/>
        <image href="img/${left}.png" x="24" y="38" width="32" height="38"/></g>
      <g transform="rotate(${a} 180 60)"><line x1="180" y1="60" x2="180" y2="76" class="sc-beam"/><path d="M156 76h48l-6 10h-36z" class="sc-pan"/>
        <image href="img/${right}.png" x="164" y="38" width="32" height="38"/></g>
    </g></svg>`;
}
const HEAVY = ['watermelon', 'pumpkin', 'pineapple', 'melon'], LIGHT = ['strawberry', 'cherries', 'lemon', 'grapes', 'apple', 'peach'];
const NAMES: Record<string, string> = { pumpkin: '南瓜', pineapple: '鳳梨', melon: '哈密瓜', watermelon: '西瓜' };
const nm = (s: string) => NAMES[s] ?? name(s);
G.push({
  k: 'wt.scale', g: '重量（看天平）', subj: 'cmp', cur: ['N-2-12'], vids: ['OhP9M1q4fDU'],
  make: () => {
    const h = pick(HEAVY), l = pick(LIGHT), heavyLeft = rnd(2) === 0;
    const [L, R] = heavyLeft ? [h, l] : [l, h];
    return { ask: '天平往哪邊低，那邊就比較重。哪一個比較重？', art: scale(L, R, heavyLeft ? 1 : -1),
      choices: shuffle([h, l]).map(s => ({ img: s, ok: s === h })),
      hint: `天平往<b>${nm(h)}</b>那邊沉下去，所以${nm(h)}比較重。` };
  }
});
G.push({
  k: 'wt.unit', g: '重量（用積木比）', subj: 'cmp', cur: ['N-2-12'], vids: ['OhP9M1q4fDU'],
  // 用看不到裡面的袋子，不用真的水果：櫻桃比蘋果重這種答案會跟生活經驗打架
  make: () => {
    let a = 3 + rnd(8), b = 3 + rnd(8); while (a === b) b = 3 + rnd(8);
    const heavier = a > b ? '紅袋子' : '藍袋子';
    return { ask: `紅袋子和 ${a} 個積木一樣重，藍袋子和 ${b} 個積木一樣重。哪一個袋子比較重？`,
      choices: ['紅袋子', '藍袋子', '一樣重'].map(v => ({ t: v, ok: v === heavier })),
      hint: `積木都一樣重，積木多的就比較重：${Math.max(a, b)} 個比 ${Math.min(a, b)} 個多，<b>${heavier}</b>比較重。` };
  }
});

/* ===== 面積：數格子 ===== */
/** 在 5×4 的方格裡長出 n 格連在一起的形狀 */
function blob(n: number): Set<number> {
  const W = 5, H = 4, s = new Set([rnd(W) + rnd(H) * W]);
  while (s.size < n) {
    const c = pick([...s]), x = c % W, y = Math.floor(c / W);
    const [nx, ny] = pick([[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]);
    if (nx >= 0 && ny >= 0 && nx < W && ny < H) s.add(nx + ny * W);
  }
  return s;
}
const gridSVG = (cells: Set<number>, color: string) => {
  let s = '';
  for (let i = 0; i < 20; i++) s += `<rect x="${(i % 5) * 20 + 1}" y="${Math.floor(i / 5) * 20 + 1}" width="20" height="20" class="${cells.has(i) ? 'ar-on' : 'ar-off'}" ${cells.has(i) ? `style="fill:${color}"` : ''}/>`;
  return `<svg viewBox="0 0 102 82" width="120" class="area">${s}</svg>`;
};
G.push({
  k: 'area.grid', g: '面積（數格子）', subj: 'cmp', cur: ['N-2-12', 'S-2-5'], vids: ['dbFQX6sFO1Q'],
  make: () => {
    let a = 4 + rnd(7), b = 4 + rnd(7); while (a === b) b = 4 + rnd(7);
    const big = a > b ? '紅色' : '藍色';
    return { ask: '哪一個圖形的面積比較大？', art: `<div class="meas">${gridSVG(blob(a), '#E07A6E')}${gridSVG(blob(b), '#6FA3CC')}</div>`,
      choices: ['紅色', '藍色', '一樣大'].map(v => ({ t: v, ok: v === big })),
      hint: `每一格一樣大，數格子：紅色 ${a} 格、藍色 ${b} 格，<b>${big}</b>比較大。形狀長得不一樣沒關係，看格子數。` };
  }
});

/* ===== 周長 ===== */
function rectSVG(w: number, h: number, labels: [string, string, string, string]): string {
  const W = 30 + w * 14, H = 20 + h * 14, x = 30, y = 20;
  return `<svg viewBox="0 0 ${W + 60} ${H + 40}" width="${Math.min(280, W + 60)}" class="per">
    <rect x="${x}" y="${y}" width="${W}" height="${H}" class="per-r"/>
    <text x="${x + W / 2}" y="${y - 6}" class="per-t">${labels[0]}</text>
    <text x="${x + W + 6}" y="${y + H / 2 + 5}" class="per-t" text-anchor="start">${labels[1]}</text>
    <text x="${x + W / 2}" y="${y + H + 18}" class="per-t">${labels[2]}</text>
    <text x="${x - 6}" y="${y + H / 2 + 5}" class="per-t" text-anchor="end">${labels[3]}</text></svg>`;
}
G.push({
  k: 'per.rect', g: '長方形的周長', subj: 'shape', cur: ['S-2-4'],
  make: () => {
    const w = 4 + rnd(8), h = 2 + rnd(Math.min(5, w - 2)), p = 2 * (w + h);
    return { ask: '長方形四條邊加起來，周長是幾公分？', art: rectSVG(w, h, [`${w} 公分`, `${h} 公分`, '', '']),
      choices: shuffle(uniq([p, w + h, w * h, p + 2])).map(v => ({ t: `${v} 公分`, ok: v === p })),
      hint: `長方形對面的邊一樣長：${w}＋${h}＋${w}＋${h}＝<b>${p}</b> 公分。只加兩條（${w + h}）是少算了一半。` };
  }
});
G.push({
  k: 'per.square', g: '正方形的周長', subj: 'shape', cur: ['S-2-4'],
  make: () => {
    const a = 2 + rnd(9), p = 4 * a;
    return { ask: '正方形四條邊一樣長，周長是幾公分？', art: rectSVG(Math.min(a, 6), Math.min(a, 6), [`${a} 公分`, '', '', '']),
      choices: shuffle(uniq([p, 2 * a, a + 4, 3 * a])).map(v => ({ t: `${v} 公分`, ok: v === p })),
      hint: `四條邊都是 ${a} 公分：${a}＋${a}＋${a}＋${a}＝<b>${p}</b> 公分。` };
  }
});

/* ===== 分類計數 ===== */
const SETS: Record<string, string[]> = {
  水果: ['apple', 'banana', 'grapes', 'lemon', 'peach', 'strawberry'],
  動物: ['cat', 'dog', 'pig', 'cow', 'rabbit', 'duck'],
};
G.push({
  k: 'data.count', g: '分類再數一數', subj: 'cmp', cur: ['D-2-1'],
  make: () => {
    const cat = pick(['水果', '動物'] as const), other = cat === '水果' ? '動物' : '水果';
    const n = 2 + rnd(5), m = 2 + rnd(5);
    const pics = shuffle([...Array.from({ length: n }, () => pick(SETS[cat])), ...Array.from({ length: m }, () => pick(SETS[other]))]);
    return { ask: `先分成水果和動物兩類。${cat}有幾個？`,
      art: `<div class="pile">${pics.map(s => `<img src="img/${s}.png" alt="">`).join('')}</div>`,
      choices: distract(n, 1, 12).map(v => ({ t: `${v} 個`, ok: v === n })),
      hint: `一共 ${n + m} 個：${cat} <b>${n}</b> 個、${other} ${m} 個。數的時候一類一類數，數過的做記號就不會重複。` };
  }
});

export { G as MORE_G2 };
