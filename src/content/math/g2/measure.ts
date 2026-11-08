/* ---------- 二年級：錢幣（N-2-5）、公分公尺（N-2-11、S-2-3）、年月日星期（N-2-14） ---------- */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';
import { money, purse, greedy, sum, DENOMS_G2 } from '../../../ui/visuals/money';

const M: Item[] = [];

/* ===== 錢幣：100、500、1000 元（N-2-5，「包含已學習之更小幣值」） ===== */
const yuan = (v: number) => `${v} 元`;
[100, 500, 1000].forEach(v => M.push({
  k: `y2.id.${v}`, g: '認識大鈔', subj: 'money', cur: ['N-2-5'],
  make: () => ({ ask: '這是幾元？', art: `<div class="purse">${money(v, 1.6)}</div>`,
    choices: shuffle(shuffle([1, 10, 50, 100, 500, 1000].filter(x => x !== v)).slice(0, 3).concat(v))
      .map(x => ({ t: yuan(x), ok: x === v })),
    hint: `${v === 100 ? '紅色' : v === 500 ? '棕色' : '藍色'}的紙鈔是 <b>${v} 元</b>。` })
}));
M.push({
  k: 'y2.cnt', g: '數大鈔', subj: 'money', cur: ['N-2-5'],
  make: () => {
    let vals: number[];
    do vals = [...Array(rnd(2)).fill(1000), ...Array(rnd(2)).fill(500), ...Array(1 + rnd(4)).fill(100), ...Array(rnd(3)).fill(10)];
    while (sum(vals) > 1000 || sum(vals) < 150);
    const t = sum(vals), along = [...vals].sort((a, b) => b - a).reduce<number[]>((acc, v) => [...acc, (acc.at(-1) ?? 0) + v], []);
    return { ask: '一共是幾元？', art: purse(vals, .85),
      choices: distract(t, 100, 1100).map(v => ({ t: yuan(v), ok: v === t })),
      hint: `大的先數：${along.join('、')}，一共 <b>${t} 元</b>。` };
  }
});
([[1000, 100], [500, 100], [1000, 500], [100, 10]] as const).forEach(([from, to]) => M.push({
  k: `y2.ex.${from}-${to}`, g: '大鈔換錢', subj: 'money', cur: ['N-2-5'],
  make: () => {
    const n = from / to;
    return { ask: `1 張 ${from} 元，可以換幾${to >= 100 ? '張' : '個'} ${to} 元？`,
      art: `<div class="purse">${money(from, 1.1)}<span class="mixop">＝</span><span class="mixq">？</span>${money(to, 1.1)}</div>`,
      choices: shuffle(uniq([n, n + 1, n - 1, n * 10, n + 5].filter(x => x >= 1)).slice(0, 4)).map(x => ({ t: `${x} ${to >= 100 ? '張' : '個'}`, ok: x === n })),
      hint: `${from} 裡面有 <b>${n}</b> 個 ${to}：${Array.from({ length: Math.min(n, 10) }, (_, i) => to * (i + 1)).join('、')}。` };
  }
}));
M.push({
  k: 'y2.pay', g: '付剛好的錢（大鈔）', subj: 'money', cur: ['N-2-5'],
  make: () => {
    const price = 10 * (12 + rnd(88));          // 120～990 元
    const right = greedy(price, DENOMS_G2)!;
    const wrongs = shuffle(uniq([price + 100, price - 100, price + 10, price - 10, price + 500].filter(v => v > 0)))
      .slice(0, 3).map(v => greedy(v, DENOMS_G2)!);
    return { ask: `一雙鞋子 ${price} 元，要付哪一堆錢？`,
      choices: shuffle([right, ...wrongs]).map(vals => ({ art: purse(vals, .62), ok: sum(vals) === price })),
      hint: `${price} 元 ＝ ${right.join(' ＋ ')}。大的先拿。` };
  }
});

/* ===== 公分、公尺 ===== */
/** 尺：從 0 到 len 公分，物件從 start 畫到 end */
function ruler(start: number, end: number, max = 15): string {
  const u = 20, w = max * u + 20;
  let ticks = '';
  for (let i = 0; i <= max; i++) {
    ticks += `<line x1="${10 + i * u}" y1="34" x2="${10 + i * u}" y2="${i % 5 ? 44 : 48}" class="rl-tick"/>`;
    ticks += `<text x="${10 + i * u}" y="62" class="rl-num">${i}</text>`;
    if (i < max) ticks += `<line x1="${10 + i * u + u / 2}" y1="34" x2="${10 + i * u + u / 2}" y2="39" class="rl-tick"/>`;
  }
  const x1 = 10 + start * u, x2 = 10 + end * u;
  return `<svg class="ruler" viewBox="0 0 ${w} 70" width="${Math.min(330, w)}">
    <rect x="${x1}" y="10" width="${x2 - x1 - 10}" height="16" rx="3" class="rl-obj"/>
    <polygon points="${x2 - 10},10 ${x2},18 ${x2 - 10},26" class="rl-tip"/>
    <rect x="2" y="32" width="${w - 4}" height="36" rx="4" class="rl-body"/>${ticks}</svg>`;
}
M.push({
  k: 'cm.read', g: '用尺量（從 0 開始）', subj: 'cmp', cur: ['N-2-11', 'S-2-3'], vids: ['3oDoN8T6eB4'],
  make: () => {
    const len = 3 + rnd(12);
    return { ask: '這枝筆有幾公分長？', art: ruler(0, len),
      choices: distract(len, 1, 15).map(v => ({ t: `${v} 公分`, ok: v === len })),
      hint: `筆的一頭對齊 0，另一頭指著 <b>${len}</b>，就是 ${len} 公分。` };
  }
});
M.push({
  k: 'cm.offset', g: '用尺量（沒從 0 開始）', subj: 'cmp', cur: ['N-2-11', 'S-2-3'], vids: ['3oDoN8T6eB4'],
  make: () => {
    const start = 1 + rnd(4), len = 3 + rnd(8), end = start + len;
    const opts = uniq([len, end, end + 1, len - 1].filter(v => v > 0));
    return { ask: '這枝筆有幾公分長？', art: ruler(start, end),
      choices: shuffle(opts).map(v => ({ t: `${v} 公分`, ok: v === len })),
      hint: `筆沒有從 0 開始！從 ${start} 到 ${end}，要數中間有幾格：${end}－${start}＝<b>${len}</b> 公分。答 ${end} 是只看了尾巴。` };
  }
});
M.push({
  k: 'cm.conv', g: '公尺和公分', subj: 'cmp', cur: ['N-2-11'], vids: ['a04kSYi8jwE'],
  make: () => {
    const m = 1 + rnd(3), cm = pick([0, 5, 20, 35, 50, 80]), ans = m * 100 + cm;
    return { ask: `${m} 公尺 ${cm ? `${cm} 公分` : ''} ＝ 幾公分？`.replace('  ', ' '),
      choices: shuffle(uniq([ans, m * 10 + cm, m + cm, m * 1000 + cm])).map(v => ({ t: `${v} 公分`, ok: v === ans })),
      hint: `1 公尺 ＝ 100 公分。${m} 公尺是 ${m * 100} 公分${cm ? `，再加 ${cm} 公分` : ''}，一共 <b>${ans} 公分</b>。` };
  }
});

/* ===== 年、月、日、星期 ===== */
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
function monthGrid(month: number, firstDay: number, days: number, mark: number): string {
  let cells = WEEK.map(w => `<b>${w}</b>`).join('');
  for (let i = 0; i < firstDay; i++) cells += '<span></span>';
  for (let d = 1; d <= days; d++) cells += `<span class="${d === mark ? 'on' : ''}">${d}</span>`;
  return `<div class="month"><div class="month-h">${month} 月</div><div class="month-g">${cells}</div></div>`;
}
M.push({
  k: 'cal.weekday', g: '看月曆找星期', subj: 'clock', cur: ['N-2-14'],
  make: () => {
    const month = 1 + rnd(12), first = rnd(7), days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    const d = 1 + rnd(days), w = (first + d - 1) % 7;
    return { ask: `${month} 月 ${d} 日是星期幾？`, art: monthGrid(month, first, days, d),
      choices: shuffle(uniq([w, (w + 1) % 7, (w + 6) % 7, (w + 3) % 7])).map(x => ({ t: `星期${WEEK[x]}`, ok: x === w })),
      hint: `找到 ${d}，往上看它在哪一欄：<b>星期${WEEK[w]}</b>。` };
  }
});
M.push({
  k: 'cal.week7', g: '一星期後', subj: 'clock', cur: ['N-2-14'],
  make: () => {
    const month = 1 + rnd(12), later = pick([7, 14]), d = 1 + rnd(28 - later), w = rnd(7);   // 加完不超過 28 日，哪個月都有
    return { ask: `${month} 月 ${d} 日是星期${WEEK[w]}。${month} 月 ${d + later} 日是星期幾？`,
      choices: shuffle(uniq([w, (w + 1) % 7, (w + 6) % 7, (w + later % 7 + 2) % 7])).map(x => ({ t: `星期${WEEK[x]}`, ok: x === w })),
      hint: `一星期有 7 天，過了 ${later} 天剛好是 ${later / 7} 個星期，所以還是<b>星期${WEEK[w]}</b>。` };
  }
});
M.push({
  k: 'cal.facts', g: '年月日的關係', subj: 'clock', cur: ['N-2-14'],
  make: () => pick([
    { ask: '一年有幾個月？', choices: shuffle([12, 10, 7, 30]).map(v => ({ t: `${v} 個月`, ok: v === 12 })), hint: '一年有 <b>12</b> 個月，1 月到 12 月。' },
    { ask: '一個星期有幾天？', choices: shuffle([7, 5, 10, 12]).map(v => ({ t: `${v} 天`, ok: v === 7 })), hint: '星期日、一、二、三、四、五、六，一共 <b>7</b> 天。' },
    { ask: '哪一個月一定有 31 天？', choices: shuffle(['1 月', '2 月', '4 月', '6 月']).map(v => ({ t: v, ok: v === '1 月' })), hint: '1、3、5、7、8、10、12 月有 31 天；2 月最短，只有 28 或 29 天。' },
  ])
});

export { M as MEASURE_G2 };
