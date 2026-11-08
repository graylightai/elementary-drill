/* ---------- 三年級：一萬以內的數、一位小數、數線、數量規律、表格 ----------
   N-3-1  一萬以內的數，位值單位「千」，位值單位換算（不超過一萬）。
   N-3-10 一位小數：小數點、十分位、比較、加減。內部一律用「幾個 0.1」的整數算，避免 0.1+0.2 的浮點誤差。
   N-3-11 整數數線：報讀與標示，數線從 0 開始。
   R-3-2  一維變化模式（數列），課綱註明「不可出現公式」——提示只講「每次加幾」。
   D-3-1  一維表格與二維表格的報讀。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const N: Item[] = [];
/** 幾個 0.1 → 小數字串；剛好是整數就寫整數（4，不寫 4.0） */
const dec = (tenths: number) => tenths % 10 ? (tenths / 10).toFixed(1) : String(tenths / 10);

/* ===== 一萬以內的數 ===== */
const V_NUM = ['gm5193TJp3A'], V_CMP = ['c6g9zLRTsa4'];
N.push({
  k: 'n3.build', g: '四位數（幾個千幾個百）', subj: 'num', cur: ['N-3-1'], vids: V_NUM,
  make: () => {
    const d = [1 + rnd(9), rnd(10), rnd(10), rnd(10)];
    d[1 + rnd(3)] = 0;                                   // 一定有一位是 0
    const n = d[0] * 1000 + d[1] * 100 + d[2] * 10 + d[3];
    const squeeze = Number(d.filter(x => x).join(''));    // 漏寫 0 的錯
    return { ask: `${d[0]} 個千、${d[1]} 個百、${d[2]} 個十、${d[3]} 個一是多少？`,
      choices: shuffle(uniq([n, squeeze, n + 1000, d[0] * 1000 + d[2] * 100 + d[1] * 10 + d[3]].filter(v => v > 0))).slice(0, 4)
        .map(v => ({ t: v, ok: v === n })),
      hint: `千位 ${d[0]}、百位 ${d[1]}、十位 ${d[2]}、個位 ${d[3]}：<b>${n}</b>。沒有的位也要寫 0。` };
  }
});
N.push({
  k: 'n3.digit', g: '千位百位十位個位', subj: 'num', cur: ['N-3-1'], vids: V_NUM,
  make: () => {
    const ds = shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 4); if (!ds[0]) [ds[0], ds[1]] = [ds[1], ds[0]];
    const n = Number(ds.join('')), names = ['千位', '百位', '十位', '個位'], i = rnd(4);
    return { ask: `${n} 的${names[i]}是幾？`, big: String(n),
      choices: shuffle(uniq([ds[i], ...ds])).slice(0, 4).map(v => ({ t: v, ok: v === ds[i] })),
      hint: `${n}：${ds.map((x, j) => `${x} 在${names[j]}`).join('、')}。` };
  }
});
N.push({
  k: 'n3.cmp', g: '四位數比大小', subj: 'num', cur: ['N-3-1', 'R-2-1'], vids: V_CMP,
  make: () => {
    const a = 1000 + rnd(9000), b = rnd(2) ? Math.floor(a / 100) * 100 + rnd(100) : 1000 + rnd(9000);
    const sym = a > b ? '＞' : a < b ? '＜' : '＝';
    return { ask: '中間要填哪一個？', big: `${a}　□　${b}`,
      choices: ['＞', '＜', '＝'].map(s => ({ t: s, ok: s === sym })),
      hint: `從千位開始比，一樣再往右比：${a} ${sym} ${b}。` };
  }
});
N.push({
  k: 'n3.unit', g: '位值換算', subj: 'num', cur: ['N-3-1'], vids: V_NUM,
  make: () => pick([
    (() => { const k = 11 + rnd(89), n = k * 100;
      return { ask: `${k} 個百是多少？`, choices: shuffle(uniq([n, k * 10, k * 1000, n + 100])).map(v => ({ t: v, ok: v === n })),
        hint: `${k} 個百就是 ${k} 後面加兩個 0：<b>${n}</b>。` }; })(),
    { ask: '1 個千是幾個十？', choices: shuffle([100, 10, 1000, 50]).map(v => ({ t: `${v} 個`, ok: v === 100 })),
      hint: '1000 裡面有 <b>100</b> 個 10（10、20、30……數到 1000）。' },
    { ask: '10 個千是多少？', choices: shuffle([10000, 1000, 100000, 1100]).map(v => ({ t: v, ok: v === 10000 })),
      hint: '10 個千是 <b>一萬</b>，寫成 10000。' },
  ])
});

/* ===== 一位小數 ===== */
/** 一條切成 10 格的長條，塗 k 格；多於 10 就畫兩條 */
function tenthsBar(k: number): string {
  const bar = (fill: number, y: number) => Array.from({ length: 10 }, (_, i) =>
    `<rect x="${i * 24 + 1}" y="${y}" width="24" height="30" class="${i < fill ? 'tb-on' : 'tb-off'}"/>`).join('');
  const rows = k > 10 ? [10, k - 10] : [k];
  return `<svg viewBox="0 0 242 ${rows.length * 40}" width="260" class="tbar">${rows.map((f, i) => bar(f, i * 40 + 2)).join('')}</svg>`;
}
N.push({
  k: 'dec.bar', g: '小數（看圖）', subj: 'num', cur: ['N-3-10'], vids: ['PCb3FMDuqds'],
  make: () => {
    let k = 1 + rnd(19); if (k === 10) k = 7;          // 剛好 1 寫成 1.0 會讓人困惑，避開
    return { ask: '一整條是 1。塗色的部分是多少？', art: tenthsBar(k),
      choices: shuffle(uniq([dec(k), dec(k + 1), dec(Math.max(1, k - 1)), String(k)])).slice(0, 4).map(v => ({ t: v, ok: v === dec(k) })),
      hint: `一條切成 10 格，一格是 <b>0.1</b>。塗了 ${k} 格，就是 ${k} 個 0.1，是 <b>${dec(k)}</b>。` };
  }
});
N.push({
  k: 'dec.count', g: '幾個 0.1', subj: 'num', cur: ['N-3-10'], vids: ['NeRjFU2Ackg'],
  make: () => {
    const k = 2 + rnd(27), ans = dec(k);
    return { ask: `${k} 個 0.1 是多少？`,
      choices: shuffle(uniq([ans, String(k), dec(k + 1), (k / 100).toFixed(2)])).map(v => ({ t: v, ok: v === ans })),
      hint: `10 個 0.1 是 1。${k} 個 0.1 是 ${Math.floor(k / 10)} 個 1 和 ${k % 10} 個 0.1：<b>${ans}</b>。` };
  }
});
N.push({
  k: 'dec.cmp', g: '小數比大小', subj: 'num', cur: ['N-3-10'], vids: ['DF3yNQ13uTA'],
  make: () => {
    let a = 1 + rnd(29), b = 1 + rnd(29); while (a === b) b = 1 + rnd(29);
    const sym = a > b ? '＞' : '＜';
    return { ask: '中間要填哪一個？', big: `${dec(a)}　□　${dec(b)}`,
      choices: ['＞', '＜', '＝'].map(s => ({ t: s, ok: s === sym })),
      hint: `先比整數，一樣再比小數點後面那一位：${dec(a)} 是 ${a} 個 0.1，${dec(b)} 是 ${b} 個 0.1，所以 ${dec(a)} ${sym} ${dec(b)}。` };
  }
});
(['add', 'sub'] as const).forEach(op => N.push({
  k: `dec.${op}`, g: op === 'add' ? '小數加法' : '小數減法', subj: 'num', cur: ['N-3-10'], vids: [op === 'add' ? 'J88R_XQL5E4' : 'wAzwC9bW9rE'],
  make: () => {
    let a = 5 + rnd(60), b = 5 + rnd(40);
    if (op === 'sub' && b > a) [a, b] = [b, a];
    const r = op === 'add' ? a + b : a - b, ans = dec(r);
    return { ask: '算算看', big: `${dec(a)} ${op === 'add' ? '＋' : '－'} ${dec(b)}`,
      choices: shuffle(uniq([ans, dec(r + 10), dec(Math.abs(r - 10)), dec(r + 1)])).slice(0, 4).map(v => ({ t: v, ok: v === ans })),
      hint: `小數點對齊再算。想成「幾個 0.1」：${a} ${op === 'add' ? '＋' : '－'} ${b} ＝ ${r} 個 0.1，就是 <b>${ans}</b>。` };
  }
}));

/* ===== 數線 ===== */
function numberLine(step: number, mark: number, labelEvery = 5): string {
  const n = 10, u = 28;
  let s = `<line x1="10" y1="40" x2="${10 + n * u + 14}" y2="40" class="nl-axis"/><polygon points="${10 + n * u + 14},35 ${10 + n * u + 22},40 ${10 + n * u + 14},45" class="nl-arrow"/>`;
  for (let i = 0; i <= n; i++) {
    s += `<line x1="${10 + i * u}" y1="${i % labelEvery ? 34 : 30}" x2="${10 + i * u}" y2="46" class="nl-tick"/>`;
    if (i % labelEvery === 0) s += `<text x="${10 + i * u}" y="64" class="nl-num">${i * step}</text>`;
  }
  s += `<polygon points="${10 + mark * u - 7},14 ${10 + mark * u + 7},14 ${10 + mark * u},26" class="nl-mark"/>`;
  return `<svg viewBox="0 0 ${n * u + 34} 72" width="320" class="nline">${s}</svg>`;
}
N.push({
  k: 'nl.read', g: '數線', subj: 'num', cur: ['N-3-11'], vids: ['I5z1L6Cezqc'],
  make: () => {
    const step = pick([1, 2, 10, 100]), mark = pick([1, 2, 3, 4, 6, 7, 8, 9]), v = step * mark;
    return { ask: '箭頭指的是多少？', art: numberLine(step, mark),
      choices: shuffle(uniq([v, mark, v + step, v - step].filter(x => x >= 0))).slice(0, 4).map(x => ({ t: x, ok: x === v })),
      hint: `0 到 ${step * 5} 之間有 5 小格，一小格是 <b>${step}</b>。箭頭在第 ${mark} 格：${step}×${mark}＝<b>${v}</b>。` };
  }
});

/* ===== 數列規律 ===== */
N.push({
  k: 'pat.seq', g: '數字的規律', subj: 'data', cur: ['R-3-2'], vids: ['3GvZQw_gIHU'],
  make: () => {
    const up = rnd(3) > 0, d = 2 + rnd(9), start = up ? 1 + rnd(20) : 60 + rnd(40);
    const seq = Array.from({ length: 5 }, (_, i) => start + (up ? d : -d) * i), ans = seq[4];
    return { ask: '接下來是多少？', big: `${seq.slice(0, 4).join('、')}、？`,
      choices: distract(ans, 0, 150).map(v => ({ t: v, ok: v === ans })),
      hint: `每次都${up ? '多' : '少'} <b>${d}</b>：${seq[3]} ${up ? '＋' : '－'} ${d} ＝ <b>${ans}</b>。` };
  }
});

/* ===== 表格 ===== */
const FRUIT = ['蘋果', '香蕉', '橘子', '葡萄', '芒果'];
N.push({
  k: 'tbl.one', g: '一維表格', subj: 'data', cur: ['D-3-1'], vids: ['lxNZOMzP_xU', 'f6yiqm38kB0'],
  make: () => {
    const items = shuffle([...FRUIT]).slice(0, 4), vals = items.map(() => 3 + rnd(20));
    while (uniq(vals).length < 4) vals[rnd(4)] = 3 + rnd(20);
    const table = `<table class="dtab"><tr><th>水果</th>${items.map(x => `<th>${x}</th>`).join('')}</tr>
      <tr><th>人數</th>${vals.map(v => `<td>${v}</td>`).join('')}</tr></table>`;
    const mode = rnd(3);
    if (mode === 0) {
      const top = items[vals.indexOf(Math.max(...vals))];
      return { ask: '全班最喜歡的水果，哪一種最多人選？', art: table,
        choices: items.map(x => ({ t: x, ok: x === top })), hint: `找人數最大的那一格：<b>${top}</b> ${Math.max(...vals)} 人。` };
    }
    const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2), d = Math.abs(vals[i] - vals[j]);
    if (mode === 1) return { ask: `喜歡${items[i]}和喜歡${items[j]}的，相差幾人？`, art: table,
      choices: distract(d, 0, 25).map(v => ({ t: `${v} 人`, ok: v === d })),
      hint: `${items[i]} ${vals[i]} 人、${items[j]} ${vals[j]} 人，相差 ${Math.max(vals[i], vals[j])}－${Math.min(vals[i], vals[j])}＝<b>${d}</b> 人。` };
    const tot = vals.reduce((a, b) => a + b, 0);
    return { ask: '全班一共有幾人？（每人只選一種）', art: table,
      choices: distract(tot, 10, 99).map(v => ({ t: `${v} 人`, ok: v === tot })),
      hint: `把四格加起來：${vals.join('＋')}＝<b>${tot}</b> 人。` };
  }
});
N.push({
  k: 'tbl.two', g: '二維表格', subj: 'data', cur: ['D-3-1'], vids: ['fizvoc4ptJQ', 'RU9iojEOYiY'],
  make: () => {
    const rows = ['一班', '二班', '三班'], cols = ['男生', '女生'];
    const v = rows.map(() => cols.map(() => 8 + rnd(10)));
    const table = `<table class="dtab"><tr><th></th>${cols.map(c => `<th>${c}</th>`).join('')}</tr>
      ${rows.map((r, i) => `<tr><th>${r}</th>${v[i].map(x => `<td>${x}</td>`).join('')}</tr>`).join('')}</table>`;
    const i = rnd(3), j = rnd(2);
    if (rnd(2)) return { ask: `${rows[i]}的${cols[j]}有幾人？`, art: table,
      choices: distract(v[i][j], 5, 20).map(x => ({ t: `${x} 人`, ok: x === v[i][j] })),
      hint: `橫的找「${rows[i]}」，直的找「${cols[j]}」，交叉的那一格是 <b>${v[i][j]}</b>。` };
    const s = v[i][0] + v[i][1];
    return { ask: `${rows[i]}一共有幾人？`, art: table,
      choices: distract(s, 15, 40).map(x => ({ t: `${x} 人`, ok: x === s })),
      hint: `${rows[i]}那一橫排：男生 ${v[i][0]}＋女生 ${v[i][1]}＝<b>${s}</b> 人。` };
  }
});

export { N as NUM_G3 };
