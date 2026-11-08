/* ---------- 四年級：多位數乘除、兩步驟、併式與運算順序、計算規律、奇偶與數字圖 ----------
   N-4-2 乘數與除數為多位數（限三位）；末位是 0 的簡便算法（1600×200、60000÷400）。
   N-4-3 乘除、連除兩步驟（等分除與包含除兩種題型都出）。
   R-4-1 併式與四則混合的約定：由左往右、先乘除後加減、括號先算。
         錯誤選項專放「從左算到右忽略先乘除」的答案。
   R-4-2 計算規律：三數相乘順序不影響積（25×37×4 先算 25×4）；先乘後除與先除後乘結果相同。
   R-4-4 奇數偶數的加減乘模式；百數表、月曆的數字模式（不出公式）。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const O: Item[] = [];
const fmt = (n: number) => n.toLocaleString('en-US');
const opts = (ans: number, wrong: number[], unit = '') =>
  shuffle([ans, ...shuffle(uniq(wrong.filter(v => v !== ans && v > 0))).slice(0, 3)]).map(v => ({ t: fmt(v) + unit, ok: v === ans }));

/* ===== 多位數乘除 ===== */
O.push({
  k: 'm4.mul2', g: '乘數是二位數', subj: 'mul', cur: ['N-4-2'], vids: ['jydiWPCKDC4'],
  make: () => {
    const a = 12 + rnd(480), b = 12 + rnd(87), p = a * b, partial = a * (b % 10) + a * Math.floor(b / 10);
    return { ask: '算算看', big: `${a} × ${b}`,
      choices: opts(p, [partial, p + a, p - a, p + 10 * a]),
      hint: `拆成 ${a}×${b % 10}＝${a * (b % 10)} 和 ${a}×${Math.floor(b / 10)}0＝${a * Math.floor(b / 10) * 10}，再加起來：<b>${fmt(p)}</b>。<br>十位那一行要往左移一格（乘的是幾十），忘了移就會變成 ${fmt(partial)}。` };
  }
});
O.push({
  k: 'm4.mul3', g: '乘數是三位數', subj: 'mul', cur: ['N-4-2'], vids: ['g8zOft0VFM4'],
  make: () => {
    const a = 12 + rnd(88), b = 101 + rnd(800), p = a * b;
    return { ask: '算算看', big: `${a} × ${b}`, choices: opts(p, [p + a, p - 100 * a, p + 10 * a, p - a]),
      hint: `${b} 拆成 ${Math.floor(b / 100)} 個百、${Math.floor(b / 10) % 10} 個十、${b % 10} 個一，各乘 ${a} 再加起來：<b>${fmt(p)}</b>。` };
  }
});
O.push({
  k: 'm4.zeros', g: '末位是 0 的乘除', subj: 'mul', cur: ['N-4-2'], vids: ['xVzfTzc3Upg', 'i0tsL-RGww8'],
  make: () => {
    const a = 2 + rnd(8), b = 2 + rnd(8), za = 1 + rnd(2), zb = 1 + rnd(2);
    if (rnd(2)) {
      const A = a * 10 ** za, B = b * 10 ** zb, p = A * B;
      return { ask: '算算看（有簡單的算法）', big: `${fmt(A)} × ${fmt(B)}`, choices: opts(p, [p * 10, p / 10, a * b * 10 ** Math.max(za, zb)]),
        hint: `先算 ${a}×${b}＝${a * b}，再數後面一共有幾個 0（${za}＋${zb}＝${za + zb} 個），補上去：<b>${fmt(p)}</b>。` };
    }
    const D = b * 10 ** zb, ans = a * 10 ** za, n = ans * D;   // 例如 60000 ÷ 400 ＝ 150
    return { ask: '算算看（有簡單的算法）', big: `${fmt(n)} ÷ ${fmt(D)}`, choices: opts(ans, [ans * 10, ans / 10, a * b]),
      hint: `被除數和除數同時去掉 ${zb} 個 0，答案不變：${fmt(n / 10 ** zb)} ÷ ${b} ＝ <b>${fmt(ans)}</b>。` };
  }
});
O.push({
  k: 'm4.div2', g: '除數是二位數', subj: 'mul', cur: ['N-4-2'], vids: ['QmEXVHaoHIc'],
  make: () => {
    const d = 12 + rnd(85), q = 2 + rnd(40), r = rnd(2) ? 0 : 1 + rnd(d - 1), n = d * q + r;
    const ans = r ? `${q} 餘 ${r}` : String(q);
    const wrong = [r ? `${q - 1} 餘 ${r + d}` : String(q + 1), r ? `${q + 1} 餘 ${r}` : String(q - 1), r ? `${q} 餘 ${r + 1 < d ? r + 1 : r - 1}` : String(q * 10)];
    return { ask: '算算看', big: `${n} ÷ ${d}`,
      choices: shuffle(uniq([ans, ...wrong])).map(t => ({ t, ok: t === ans })),
      hint: `估商：把 ${d} 想成大約 ${Math.round(d / 10) * 10}，${n} 裡大約有幾個？試商後用 ${d}×商 檢查，不夠減就調小、餘數比 ${d} 大就調大。答案 <b>${ans}</b>（${d}×${q}${r ? `＋${r}` : ''}＝${n}）。` };
  }
});

/* ===== 乘除兩步驟 ===== */
O.push({
  k: 'two4', g: '乘除、連除兩步驟', subj: 'mul', cur: ['N-4-3'], vids: ['6AC5cKZrzTo', '9emrH4j5zeA'],
  make: () => {
    const a = 2 + rnd(8), b = 2 + rnd(8), c = 2 + rnd(5);
    return pick([
      // 連除（等分除再等分除）
      { ask: `${a * b * c} 顆糖平分給 ${c} 個班，每班再平分給 ${a} 組，每組幾顆？`, choices: distract(b, 1, 20).map(v => ({ t: v, ok: v === b })),
        hint: `先算每班：${a * b * c}÷${c}＝${a * b}；再算每組：${a * b}÷${a}＝<b>${b}</b> 顆。` },
      // 先乘再除（包含除）
      { ask: `每箱有 ${a * c} 瓶，${b} 箱的果汁重新每 ${c} 瓶裝一袋，可以裝幾袋？`, choices: distract(a * b, 1, 90).map(v => ({ t: v, ok: v === a * b })),
        hint: `先算一共幾瓶：${a * c}×${b}＝${a * b * c}；再算裝幾袋：${a * b * c}÷${c}＝<b>${a * b}</b> 袋。` },
    ]);
  }
});

/* ===== 併式與運算順序 ===== */
O.push({
  k: 'order', g: '先乘除後加減', subj: 'math', cur: ['R-4-1'], vids: ['Rw7y8vYN1x0', '-DK8yKNfOkk'],
  make: () => {
    const a = 2 + rnd(20), b = 2 + rnd(8), c = 2 + rnd(8);
    const forms: [string, number, number, string][] = [
      [`${a} ＋ ${b} × ${c}`, a + b * c, (a + b) * c, `先算乘法 ${b}×${c}＝${b * c}，再加：${a}＋${b * c}＝`],
      [`${a + b * c} － ${b} × ${c}`, a, (a + b * c - b) * c, `先算乘法 ${b}×${c}＝${b * c}，再減：${a + b * c}－${b * c}＝`],
      [`(${a} ＋ ${b}) × ${c}`, (a + b) * c, a + b * c, `括號先算 ${a}＋${b}＝${a + b}，再乘：${a + b}×${c}＝`],
      [`${b * c * 2} ÷ ${b} ÷ 2`, c, c * 4, `由左往右：${b * c * 2}÷${b}＝${c * 2}，再 ÷2＝`],   // 錯：先算 ${b}÷2
    ];
    const [expr, ans, wrongOrder, how] = pick(forms);
    return { ask: '照計算的規則算，答案是多少？', big: expr,
      choices: opts(ans, [Math.round(wrongOrder), ans + 1, ans + b, ans - 1]),
      hint: `${how}<b>${ans}</b>。規則：括號先算 → 先乘除後加減 → 一樣的就由左往右。` };
  }
});
O.push({
  k: 'expr', g: '列成一個算式（併式）', subj: 'math', cur: ['R-4-1'], vids: ['-DK8yKNfOkk'],
  make: () => {
    const each = 5 + rnd(20), n = 2 + rnd(6), paid = Math.ceil((each * n + 1) / 100) * 100;
    const right = `${paid} － ${each} × ${n}`;
    return { ask: `每枝筆 ${each} 元，買 ${n} 枝，付了 ${paid} 元。要找多少錢？哪一個算式對？`,
      choices: shuffle([right, `(${paid} － ${each}) × ${n}`, `${paid} － ${each} ＋ ${n}`, `${each} × ${n} － ${paid}`]).map(t => ({ t, ok: t === right })),
      hint: `要先算筆的錢 ${each}×${n}，再用 ${paid} 去減。因為先乘除後加減，寫成 <b>${right}</b> 不用加括號。` };
  }
});
O.push({
  k: 'rule', g: '計算規律（簡便算法）', subj: 'mul', cur: ['R-4-2'],
  make: () => {
    const x = 11 + rnd(80);
    return pick([
      { ask: '用簡單的方法算', big: `25 × ${x} × 4`, choices: opts(100 * x, [25 * x, 100 * x + 4, 4 * x]),
        hint: `三個數相乘，順序換了積不變：先算 25×4＝100，再 100×${x}＝<b>${fmt(100 * x)}</b>。` },
      { ask: '用簡單的方法算', big: `${x} × 5 × 2`, choices: opts(10 * x, [5 * x, x + 10, 10 * x + 2]),
        hint: `先算 5×2＝10，再 ${x}×10＝<b>${10 * x}</b>。` },
      (() => { const k = 2 + rnd(7), y = k * (3 + rnd(20)); return { ask: '先乘後除和先除後乘一樣。用好算的順序算', big: `${y} × ${x} ÷ ${k}`,
        choices: opts(y / k * x, [y * x, y / k + x, y / k * x + k]), hint: `先算 ${y}÷${k}＝${y / k}，再乘 ${x}：<b>${fmt(y / k * x)}</b>。結果跟先乘後除一樣。` }; })(),
    ]);
  }
});

/* ===== 奇數偶數、數字圖 ===== */
O.push({
  k: 'oddeven', g: '奇數和偶數', subj: 'data', cur: ['R-4-4'], vids: ['KNlss7MoB4M'],
  make: () => {
    const [p, q, op] = pick([['奇數', '奇數', '＋'], ['奇數', '偶數', '＋'], ['偶數', '偶數', '＋'], ['奇數', '奇數', '×'], ['奇數', '偶數', '×']] as const);
    const ans = op === '＋' ? (p === q ? '偶數' : '奇數') : (p === '奇數' && q === '奇數' ? '奇數' : '偶數');
    const ex = (k: string) => k === '奇數' ? pick([3, 5, 7, 9]) : pick([2, 4, 6, 8]);
    const [x, y] = [ex(p), ex(q)];
    return { ask: `${p} ${op} ${q}，答案一定是奇數還是偶數？`,
      choices: ['奇數', '偶數', '不一定'].map(t => ({ t, ok: t === ans })),
      hint: `試一個例子：${x} ${op} ${y} ＝ ${op === '＋' ? x + y : x * y}，是<b>${ans}</b>。${op === '＋' ? '兩個兩個配對，多出來的那一個看有沒有被配掉。' : '只要有一個是偶數，乘出來就是偶數。'}` };
  }
});
O.push({
  k: 'grid100', g: '百數表的規律', subj: 'data', cur: ['R-4-4'], vids: ['KNlss7MoB4M'],
  make: () => {
    const n = 12 + rnd(76), dir = pick(['下面', '上面', '右下', '左下'] as const);
    const d = { 下面: 10, 上面: -10, 右下: 11, 左下: 9 }[dir];
    if ((dir === '右下' && n % 10 === 0) || (dir === '左下' && n % 10 === 1)) return { ask: `百數表裡，${n} ${'下面'}那一格是多少？`, choices: distract(n + 10, 1, 100).map(v => ({ t: v, ok: v === n + 10 })), hint: `百數表一排 10 個，往下一格多 10：<b>${n + 10}</b>。` };
    const ans = n + d;
    let s = '';
    for (let r = -1; r <= 1; r++) for (let c = -1; c <= 1; c++) { const v = n + r * 10 + c; s += `<span class="${r === 0 && c === 0 ? 'on' : ''}">${v === ans ? '？' : v >= 1 && v <= 100 && Math.abs((v - 1) % 10 - (n - 1) % 10) <= 1 ? v : ''}</span>`; }
    return { ask: `百數表裡，${n} ${dir}那一格是多少？`, art: `<div class="h100">${s}</div>`,
      choices: distract(ans, 1, 100).map(v => ({ t: v, ok: v === ans })),
      hint: `百數表一排 10 個：往下一格多 10、往右一格多 1。${dir}就是 ${d > 0 ? '多' : '少'} ${Math.abs(d)}：<b>${ans}</b>。` };
  }
});

export { O as OPS_G4 };
