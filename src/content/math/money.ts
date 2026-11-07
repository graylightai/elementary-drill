/* ---------- 錢幣（一年級 N-1-4：1、5、10、50、100 元，數錢、換錢、找錢） ----------
   課綱寫「以操作活動為主」「容許多元策略，教師不應視為單純的加減單元」，
   所以題目都放在買東西的情境裡，提示講的是「怎麼數」而不是算式。
   key 用 y.* 開頭：舊版曾經有過 $.* 的錢幣題，換新前綴避免沿用到意思不同的舊紀錄。 */
import type { Item, Choice } from '../../types';
import { rnd, pick, shuffle, uniq } from '../../util';
import { money, purse, greedy, sum } from '../../ui/visuals/money';
import { WORDS } from '../words';

const M: Item[] = [];
const CUR = ['N-1-4'];
const yuan = (v: number) => `${v} 元`;

/** 4 個不重複的金額選項，正解在內 */
function amounts(ans: number, lo: number, hi: number, steps = [1, 5, 10]): Choice[] {
  const out = new Set([ans]);
  for (const d of shuffle(steps.flatMap(s => [s, -s]))) {
    if (out.size >= 4) break;
    const v = ans + d; if (v >= lo && v <= hi) out.add(v);
  }
  for (let g = 0; out.size < 4 && g < 100; g++) out.add(lo + rnd(hi - lo + 1));
  return shuffle([...out]).map(v => ({ t: yuan(v), ok: v === ans }));
}

/** 隨機湊一堆錢：每種面額最多 max 個，總額落在 lo..hi */
function randomPurse(kinds: number[], max: Record<number, number>, lo: number, hi: number): number[] {
  for (let g = 0; g < 200; g++) {
    const vals = kinds.flatMap(k => Array(rnd(max[k] + 1)).fill(k) as number[]);
    const t = sum(vals);
    if (t >= lo && t <= hi && uniq(vals).length >= Math.min(2, kinds.length)) return vals;
  }
  return greedy(lo)!;
}

/** 由大到小數的過程，例如 50、60、65、66 */
const countAlong = (vals: number[]) => {
  let acc = 0;
  return [...vals].sort((a, b) => b - a).map(v => (acc += v)).join('、');
};

/* 1) 認錢幣 */
const LOOK: Record<number, string> = {
  1: '最小、銅色的', 5: '銀色、比 1 元大一點的', 10: '銀色、比 5 元再大一點的',
  50: '金色、最大的', 100: '紙做的、紅色的'
};
[1, 5, 10, 50, 100].forEach(v => M.push({
  k: `y.id.${v}`, g: '認識錢幣', subj: 'money', cur: CUR,
  make: () => {
    const others = shuffle([1, 5, 10, 50, 100].filter(x => x !== v)).slice(0, 3);
    return { ask: '這是幾元？', art: `<div class="purse">${money(v, 1.8)}</div>`,
      choices: shuffle([v, ...others]).map(x => ({ t: yuan(x), ok: x === v })),
      hint: `${LOOK[v]}是 <b>${v} 元</b>。` };
  }
}));

/* 2) 數錢：大的先數 */
const COUNT_LV: { kinds: number[]; max: Record<number, number>; lo: number; hi: number; name: string }[] = [
  { name: '1 元和 5 元', kinds: [5, 1], max: { 5: 3, 1: 4 }, lo: 6, hi: 19 },
  { name: '加上 10 元', kinds: [10, 5, 1], max: { 10: 3, 5: 1, 1: 4 }, lo: 12, hi: 44 },
  { name: '加上 50 元', kinds: [50, 10, 5, 1], max: { 50: 1, 10: 4, 5: 1, 1: 4 }, lo: 55, hi: 99 },
];
COUNT_LV.forEach((lv, i) => M.push({
  k: `y.cnt.${i + 1}`, g: '數錢', subj: 'money', cur: CUR,
  make: () => {
    const vals = randomPurse(lv.kinds, lv.max, lv.lo, lv.hi), t = sum(vals);
    return { ask: '一共是幾元？', art: purse(vals),
      choices: amounts(t, Math.max(1, lv.lo - 10), lv.hi + 10),
      hint: `大的先數：<b>${countAlong(vals)}</b>，一共 <b>${t} 元</b>。` };
  }
}));

/* 3) 換錢 */
const EXCHANGE: [number, number][] = [[5, 1], [10, 5], [10, 1], [50, 10], [100, 50], [100, 10]];
EXCHANGE.forEach(([from, to]) => M.push({
  k: `y.ex.${from}-${to}`, g: '換錢', subj: 'money', cur: CUR,
  make: () => {
    const n = from / to;
    const opts = uniq([n, n + 1, n - 1, n * 2, n + 5].filter(x => x >= 1)).slice(0, 4);
    return { ask: `1 ${from === 100 ? '張' : '個'} ${from} 元，可以換幾個 ${to} 元？`,
      art: `<div class="purse">${money(from, 1.4)}<span class="mixop">＝</span><span class="mixq">？</span>${money(to, 1.4)}</div>`,
      choices: shuffle(opts).map(x => ({ t: `${x} 個`, ok: x === n })),
      hint: `${Array(n).fill(to).join(' ＋ ')} ＝ ${from}，所以是 <b>${n} 個</b>。` };
  }
}));

/* 買東西用的商品：都是 app 已經有圖的東西 */
const GOODS = ['apple', 'banana', 'cookie', 'cupcake', 'balloon', 'lemon', 'peach', 'strawberry', 'robot', 'teddy', 'watermelon', 'grapes']
  .map(slug => ({ slug, name: (WORDS.find(w => w[0] === slug) || [slug, slug === 'teddy' ? '小熊玩偶' : slug])[1] }));

/* 4) 付錢：選出剛好的那一堆 */
const PAY_LV = [{ lo: 6, hi: 20 }, { lo: 21, hi: 50 }, { lo: 51, hi: 100 }];
PAY_LV.forEach((lv, i) => M.push({
  k: `y.pay.${i + 1}`, g: '付剛好的錢', subj: 'money', cur: CUR,
  make: () => {
    const g = pick(GOODS), price = lv.lo + rnd(lv.hi - lv.lo + 1);
    const right = greedy(price)!;
    const wrongs = uniq([price + 1, price - 1, price + 5, price - 5, price + 10, price - 10].filter(v => v > 0))
      .map(v => greedy(v)!);
    const pickW = shuffle(wrongs).slice(0, 3);
    return { ask: `${g.name}要 ${price} 元，要付哪一堆錢？`, img: g.slug,
      choices: shuffle([right, ...pickW]).map(vals => ({ art: purse(vals, .8), ok: sum(vals) === price })),
      hint: `${price} 元 ＝ ${right.join(' ＋ ')}。大的先拿，再補小的。` };
  }
}));

/* 5) 找錢：付 10 元的就是湊十，接得上前面學的 */
const CHANGE: { pay: number; prices: () => number }[] = [
  { pay: 10, prices: () => 1 + rnd(9) },
  { pay: 50, prices: () => pick([15, 20, 25, 30, 35, 40, 45, 12, 18, 23, 37, 44]) },
  { pay: 100, prices: () => 10 * (1 + rnd(9)) },
];
CHANGE.forEach(({ pay, prices }) => M.push({
  k: `y.chg.${pay}`, g: '找錢', subj: 'money', cur: CUR,
  make: () => {
    const g = pick(GOODS), price = prices(), back = pay - price;
    return { ask: `${g.name} ${price} 元，付了 ${pay} 元，要找回幾元？`, img: g.slug,
      art: `<div class="purse">${money(pay, 1.2)}</div>`,
      choices: amounts(back, 1, pay - 1, pay === 10 ? [1, 2] : [1, 5, 10]),
      hint: `從 ${price} 往上數到 ${pay}：還差 <b>${back} 元</b>，就是要找的錢。`,
      // 付 10 元找錢就是「湊十」：答錯時先回去練那一題
      remedial: pay === 10 ? [`m.t10.${price}`] : undefined };
  }
}));

export { M as MONEY };
