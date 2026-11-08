/* ---------- 三年級：毫米、平方公分、公升毫升、公斤公克、時分秒 ----------
   N-3-12 毫米；N-3-14 平方公分（數格子，「不發展一般公式」）；
   N-3-15 公升毫升、N-3-16 公斤公克：「單位換算公升（公斤）數限個位數」，複名數只做加減、不做乘除；
   N-3-17 時間：日、時、分、秒的換算；時分複名數加減「無進、退位」。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const M: Item[] = [];

/* ===== 毫米 ===== */
function mmRuler(len: number): string {
  const u = 6, cm = 6, w = cm * 10 * u + 20;
  let t = '';
  for (let i = 0; i <= cm * 10; i++) {
    const big = i % 10 === 0, mid = i % 5 === 0;
    t += `<line x1="${10 + i * u}" y1="34" x2="${10 + i * u}" y2="${big ? 50 : mid ? 45 : 40}" class="rl-tick"/>`;
    if (big) t += `<text x="${10 + i * u}" y="64" class="rl-num">${i / 10}</text>`;
  }
  return `<svg class="ruler" viewBox="0 0 ${w} 70" width="330">
    <rect x="10" y="12" width="${len * u - 8}" height="14" rx="3" class="rl-obj"/><polygon points="${10 + len * u - 8},12 ${10 + len * u},19 ${10 + len * u - 8},26" class="rl-tip"/>
    <rect x="2" y="32" width="${w - 4}" height="36" rx="4" class="rl-body"/>${t}</svg>`;
}
M.push({
  k: 'mm.read', g: '用尺量毫米', subj: 'cmp', cur: ['N-3-12'], vids: ['qLcqbp4Asx0'],
  make: () => {
    let len: number;
    do len = 12 + rnd(45); while (len % 10 === 0);      // 剛好整公分就沒有毫米可數
    const c = Math.floor(len / 10), m = len % 10;
    const ans = `${c} 公分 ${m} 毫米`;
    return { ask: '這枝筆有多長？（一大格是 1 公分，一小格是 1 毫米）', art: mmRuler(len),
      choices: shuffle(uniq([ans, `${c + 1} 公分 ${m} 毫米`, `${c} 公分 ${10 - m} 毫米`, `${m} 公分 ${c} 毫米`])).map(t => ({ t, ok: t === ans })),
      hint: `先看到第幾個整公分：${c} 公分；再數多出來的小格：${m} 小格是 ${m} 毫米。一共 <b>${ans}</b>，也就是 ${len} 毫米。` };
  }
});
M.push({
  k: 'mm.conv', g: '公分和毫米', subj: 'cmp', cur: ['N-3-12'], vids: ['qLcqbp4Asx0', 'NYw6dlyXKoE'],
  make: () => {
    const c = 1 + rnd(15), m = rnd(10), ans = c * 10 + m;
    return { ask: `${c} 公分 ${m} 毫米 ＝ 幾毫米？`,
      choices: shuffle(uniq([ans, c * 100 + m, c + m, c * 10])).map(v => ({ t: `${v} 毫米`, ok: v === ans })),
      hint: `1 公分 ＝ 10 毫米。${c} 公分是 ${c * 10} 毫米，再加 ${m}，一共 <b>${ans} 毫米</b>。` };
  }
});

/* ===== 平方公分：數格子 ===== */
M.push({
  k: 'sqcm', g: '平方公分（數格子）', subj: 'cmp', cur: ['N-3-14'], vids: ['Rf-wV9hjKyw', 'MAmR1WZ4AuE'],
  make: () => {
    const w = 2 + rnd(5), h = 2 + rnd(4), cut = rnd(2) ? Math.min(w - 1, 1 + rnd(2)) : 0;     // 有時切掉一角變 L 形
    const cells: [number, number][] = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!(y === 0 && x >= w - cut)) cells.push([x, y]);
    const n = cells.length, u = 24;
    let s = '';
    for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) s += `<rect x="${x * u}" y="${y * u}" width="${u}" height="${u}" class="ar-off"/>`;
    s += cells.map(([x, y]) => `<rect x="${(x + 1) * u}" y="${(y + 1) * u}" width="${u}" height="${u}" class="ar-on" style="fill:#8EC3E6"/>`).join('');
    return { ask: '一小格是 1 平方公分。藍色部分的面積是幾平方公分？', art: `<svg viewBox="-1 -1 ${8 * u + 2} ${6 * u + 2}" width="230" class="area">${s}</svg>`,
      choices: distract(n, 2, 30).map(v => ({ t: `${v} 平方公分`, ok: v === n })),
      hint: `一排一排數：${Array.from({ length: h }, (_, y) => cells.filter(c => c[1] === y).length).join('＋')}＝<b>${n}</b> 格，就是 ${n} 平方公分。` };
  }
});

/* ===== 公升毫升、公斤公克 ===== */
const UNITS = {
  vol: { big: '公升', small: '毫升', vids: ['c9C-4FIzEZU', 'jNEYK-EiOqM'], thing: ['一瓶果汁', '一桶水', '一壺茶'], cur: 'N-3-15' },
  wt: { big: '公斤', small: '公克', vids: ['wV3T7qE5J-A', '0Yz3lf77sQA'], thing: ['一袋米', '一箱蘋果', '一個西瓜'], cur: 'N-3-16' },
} as const;
(Object.keys(UNITS) as (keyof typeof UNITS)[]).forEach(id => {
  const U = UNITS[id];
  M.push({
    k: `${id}.conv`, g: `${U.big}和${U.small}`, subj: 'cmp', cur: [U.cur], vids: [...U.vids],
    make: () => {
      const a = 1 + rnd(9), b = pick([50, 200, 350, 500, 800, 5, 60]), ans = a * 1000 + b;   // 不出整數公升：「5 公升 0 毫升」很彆扭
      return pick([
        { ask: `${a} ${U.big} ${b} ${U.small} ＝ 幾${U.small}？`,
          choices: shuffle(uniq([ans, a * 100 + b, a + b, a * 1000 + b * 10])).map(v => ({ t: `${v} ${U.small}`, ok: v === ans })),
          hint: `1 ${U.big} ＝ <b>1000</b> ${U.small}。${a} ${U.big}是 ${a * 1000} ${U.small}，再加 ${b}，一共 <b>${ans}</b> ${U.small}。` },
        { ask: `${ans} ${U.small} ＝ 幾${U.big}幾${U.small}？`,
          choices: shuffle(uniq([`${a} ${U.big} ${b} ${U.small}`, `${a * 10} ${U.big} ${b} ${U.small}`, `${a} ${U.big} ${b * 10} ${U.small}`, `${a + 1} ${U.big} ${b} ${U.small}`]))
            .map(t => ({ t, ok: t === `${a} ${U.big} ${b} ${U.small}` })),
          hint: `每 1000 ${U.small}是 1 ${U.big}：${ans} 裡有 ${a} 個 1000，剩 ${b}，所以是 <b>${a} ${U.big} ${b} ${U.small}</b>。` },
      ]);
    }
  });
  M.push({
    k: `${id}.add`, g: `${U.big}${U.small}加減`, subj: 'cmp', cur: [U.cur], vids: [...U.vids],
    make: () => {
      const a1 = 1 + rnd(4), a2 = 100 * (1 + rnd(4)), b1 = 1 + rnd(4), b2 = 100 * (1 + rnd(4));
      const add = rnd(2) === 0 || a1 * 1000 + a2 <= b1 * 1000 + b2 ? true : false;
      const [x1, x2, y1, y2] = add ? [a1, a2, b1, b2] : [a1 + b1, a2 + b2, b1, b2];   // 減法時保證夠減、不用退位
      const r1 = add ? x1 + y1 : x1 - y1, r2 = add ? x2 + y2 : x2 - y2;
      const ans = r2 >= 1000 ? `${r1 + 1} ${U.big} ${r2 - 1000} ${U.small}` : `${r1} ${U.big} ${r2} ${U.small}`;
      const thing = pick([...U.thing]);
      return { ask: add ? `${thing}原本 ${x1} ${U.big} ${x2} ${U.small}，又加了 ${y1} ${U.big} ${y2} ${U.small}，現在是多少？`
                        : `${thing}原本 ${x1} ${U.big} ${x2} ${U.small}，用掉 ${y1} ${U.big} ${y2} ${U.small}，還剩多少？`,
        choices: shuffle(uniq([ans, `${r1 + 1} ${U.big} ${r2} ${U.small}`, `${r1} ${U.big} ${r2 + 100} ${U.small}`, `${Math.max(0, r1 - 1)} ${U.big} ${r2} ${U.small}`])).slice(0, 4)
          .map(t => ({ t, ok: t === ans })),
        hint: `${U.big}和${U.big}${add ? '加' : '減'}、${U.small}和${U.small}${add ? '加' : '減'}：${x1}${add ? '＋' : '－'}${y1}＝${r1} ${U.big}，${x2}${add ? '＋' : '－'}${y2}＝${r2} ${U.small}。答案 <b>${ans}</b>。` };
    }
  });
});

/* ===== 時、分、秒 ===== */
M.push({
  k: 't3.conv', g: '日時分秒的換算', subj: 'clock', cur: ['N-3-17'], vids: ['xHH4pUWA1RQ', 'VFZaY8KElwo'],
  make: () => pick([
    (() => { const m = 2 + rnd(5), s = rnd(2) ? 0 : 10 * (1 + rnd(5)), ans = m * 60 + s;
      return { ask: `${m} 分${s ? ` ${s} 秒` : '鐘'} ＝ 幾秒？`, choices: shuffle(uniq([ans, m * 100 + s, m * 10 + s, ans + 60])).map(v => ({ t: `${v} 秒`, ok: v === ans })),
        hint: `1 分鐘 ＝ <b>60 秒</b>，不是 100 秒。${m} 分鐘是 ${m * 60} 秒${s ? `，再加 ${s} 秒` : ''}，一共 <b>${ans} 秒</b>。` }; })(),
    (() => { const h = 1 + rnd(3), m = rnd(2) ? 0 : 5 * (1 + rnd(11)), ans = h * 60 + m;
      return { ask: `${h} 小時${m ? ` ${m} 分` : ''} ＝ 幾分鐘？`, choices: shuffle(uniq([ans, h * 100 + m, h * 10 + m, ans + 60])).map(v => ({ t: `${v} 分`, ok: v === ans })),
        hint: `1 小時 ＝ <b>60 分鐘</b>。${h} 小時是 ${h * 60} 分${m ? `，再加 ${m} 分` : ''}，一共 <b>${ans} 分鐘</b>。` }; })(),
    { ask: '1 天有幾小時？', choices: shuffle([24, 12, 60, 10]).map(v => ({ t: `${v} 小時`, ok: v === 24 })), hint: '1 天 ＝ <b>24 小時</b>。時鐘轉兩圈是一天。' },
  ])
});
M.push({
  k: 't3.add', g: '時和分的加減', subj: 'clock', cur: ['N-3-17'], vids: ['64NWVbqlYIo', 'awQjDJwolxo'],
  make: () => {
    // 課綱限定無進、退位
    const h1 = 1 + rnd(3), m1 = 5 * (1 + rnd(6)), h2 = 1 + rnd(2), m2 = 5 * (1 + rnd(5));
    const add = rnd(2) === 0 || m1 < m2 || h1 < h2;
    const [a1, a2] = add ? [h1, m1] : [h1 + h2, m1 + m2];
    const r1 = add ? a1 + h2 : a1 - h2, r2 = add ? a2 + m2 : a2 - m2;
    const ans = `${r1} 小時 ${r2} 分`;
    return { ask: add ? `先坐車 ${a1} 小時 ${a2} 分，再走路 ${h2} 小時 ${m2} 分，一共花了多久？`
                      : `電影 ${a1} 小時 ${a2} 分，已經看了 ${h2} 小時 ${m2} 分，還剩多久？`,
      choices: shuffle(uniq([ans, `${r1 + 1} 小時 ${r2} 分`, `${r1} 小時 ${r2 + 10} 分`, `${Math.max(0, r1 - 1)} 小時 ${r2} 分`])).map(t => ({ t, ok: t === ans })),
      hint: `小時和小時${add ? '加' : '減'}、分和分${add ? '加' : '減'}：${a1}${add ? '＋' : '－'}${h2}＝${r1} 小時，${a2}${add ? '＋' : '－'}${m2}＝${r2} 分。<b>${ans}</b>。` };
  }
});

export { M as MEAS_G3 };
