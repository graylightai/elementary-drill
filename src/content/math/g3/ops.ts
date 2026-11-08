/* ---------- 三年級：多位數加減、乘以一位數、除法、乘除互逆、兩步驟、估算 ----------
   N-3-2 加減直式：多次進退位，「須處理數字中有 0 的題型」（例如 3004－1258）。
   N-3-3 乘以一位數：被乘數二、三位數，「須處理被乘數有 0 的題型」。
   N-3-4 除法的意義：先整除再有餘數；餘數一定比除數小——錯誤選項專放「餘數比除數大」的。
   N-3-5 除以一位數：被除數二、三位數，含被除數有 0。
   R-3-1 乘除互逆：「3 的幾倍是 15」「什麼數的 4 倍是 12」要用除法。
   N-3-6 乘除未知；N-3-7 兩步驟（連乘、加與除、減與除，不含併式）；N-3-8 簡單的四則估算。
   答錯往回補：除法錯了先練對應的九九乘法（28÷4 錯 → 先練 4×7）。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const O: Item[] = [];

/** 直式（加、減、乘）：每一位一格，對齊個位 */
function vertical(a: number, b: number, op: '＋' | '－' | '×'): string {
  const w = Math.max(String(a).length, String(b).length + 1, 3);
  const cells = (n: number | string) => String(n).padStart(w, ' ').split('').map(c => `<span>${c.trim()}</span>`).join('');
  return `<div class="vert" style="--w:${w}">
    <div class="vrow"><span class="vop"></span>${cells(a)}</div>
    <div class="vrow"><span class="vop">${op}</span>${cells(b)}</div>
    <div class="vline"></div>
    <div class="vrow"><span class="vop"></span>${cells('？'.padStart(w, ' '))}</div></div>`;
}
/** 常見錯誤：某一位忘了進位或退位（差 10、100、1000） */
const slips = (ans: number) => uniq([ans + 10, ans - 10, ans + 100, ans - 100, ans + 1000, ans - 1000].filter(v => v > 0 && v !== ans));
const opts = (ans: number, wrong: number[]) => shuffle([ans, ...shuffle(uniq(wrong.filter(v => v !== ans && v > 0))).slice(0, 3)]).map(v => ({ t: v, ok: v === ans }));

/* ===== 加減直式（多次進退位） ===== */
O.push({
  k: 'v3.add', g: '四位數加法（多次進位）', subj: 'math', cur: ['N-3-2'], vids: ['oy4bjDGzPeo'],
  make: () => {
    let a: number, b: number;
    do { a = 1000 + rnd(5000); b = 100 + rnd(3900); } while (a % 10 + b % 10 < 10 || Math.floor(a / 10) % 10 + Math.floor(b / 10) % 10 < 9 || a + b > 9999);
    const s = a + b;
    return { ask: '用直式算算看', art: vertical(a, b, '＋'), choices: opts(s, slips(s)),
      hint: `從個位開始，每一位滿 10 就<b>進 1</b> 到左邊那一位，別忘了加上進來的 1。答案 <b>${s}</b>。` };
  }
});
O.push({
  k: 'v3.sub', g: '四位數減法（多次退位）', subj: 'math', cur: ['N-3-2'], vids: ['NUziLUzJFqg'],
  make: () => {
    // 一半的題目被減數中間有 0（3004 這種，要連續借位）
    let a: number, b: number;
    do {
      a = rnd(2) ? (2 + rnd(8)) * 1000 + rnd(9) : 2000 + rnd(8000);
      b = 100 + rnd(a - 200);
    } while (a % 10 >= b % 10);                         // 個位一定要借
    const d = a - b;
    return { ask: '用直式算算看', art: vertical(a, b, '－'), choices: opts(d, slips(d)),
      hint: `個位不夠減就向左邊借 1 當 10；左邊是 0 借不到，就再往左借（千位借給百位、百位借給十位……）。答案 <b>${d}</b>。` };
  }
});

/* ===== 乘以一位數 ===== */
([['mul1.2d', '二位數×一位數', () => 11 + rnd(89), 't6IHXGm3_1k'],
  ['mul1.3d', '三位數×一位數', () => 101 + rnd(899), 'V8fwogjSLvw'],
  ['mul1.zero', '被乘數有 0', () => pick([(1 + rnd(9)) * 100 + rnd(10), (1 + rnd(9)) * 100 + (1 + rnd(9)) * 10, (1 + rnd(9)) * 10]), 'NgV1qLVq0Zc']] as const)
  .forEach(([k, g, gen, vid]) => O.push({
    k, g, subj: 'mul', cur: ['N-3-3'], vids: [vid],
    make: () => {
      const a = gen(), b = 2 + rnd(8), p = a * b;
      const ones = (a % 10) * b;
      return { ask: '用直式算算看', art: vertical(a, b, '×'), choices: opts(p, [...slips(p), p + b, p - b]),
        hint: `從個位乘起：${a % 10}×${b}＝${ones}，寫 ${ones % 10}${ones >= 10 ? `、進 ${Math.floor(ones / 10)}` : ''}；再乘十位，加上進來的數……答案 <b>${p}</b>。` +
          (String(a).includes('0') ? '<br>0 乘任何數都是 0，但那一位還是要寫，不能省掉。' : ''),
        remedial: a % 10 >= 2 ? [`x.${a % 10}x${b}`] : undefined };
    }
  }));

/* ===== 除法 ===== */
for (let d = 2; d <= 9; d++) O.push({
  k: `dv.${d}`, g: `除以 ${d}`, subj: 'mul', cur: ['N-3-4', 'R-3-1'], vids: ['IbolqEkVxX0'],
  make: () => {
    const q = 1 + rnd(9), n = d * q;
    return { ask: '答案是多少？', big: `${n} ÷ ${d}`,
      choices: distract(q, 1, 10).map(v => ({ t: v, ok: v === q })),
      hint: `想乘法：${d} × 幾 ＝ ${n}？${d} × ${q} ＝ ${n}，所以 ${n} ÷ ${d} ＝ <b>${q}</b>。`,
      remedial: q >= 1 ? [`x.${d}x${q}`] : undefined };
  }
});
O.push({
  k: 'dv.rem', g: '有餘數的除法', subj: 'mul', cur: ['N-3-4'], vids: ['_KjQPRYJ9fs'],
  make: () => {
    const d = 3 + rnd(7), q = 2 + rnd(8), r = 1 + rnd(d - 1), n = d * q + r;
    const fmt = (qq: number, rr: number) => `${qq} 餘 ${rr}`;
    // 最常見的錯：商少算 1，餘數就變得比除數大
    const wrong = [fmt(q - 1, r + d), fmt(q + 1, r), fmt(q, r + 1 < d ? r + 1 : r - 1)];
    return { ask: `${n} 顆糖，每 ${d} 顆裝一袋，可以裝幾袋、剩幾顆？`, big: `${n} ÷ ${d}`,
      choices: shuffle([fmt(q, r), ...uniq(wrong).filter(w => w !== fmt(q, r))]).map(t => ({ t, ok: t === fmt(q, r) })),
      hint: `${d}×${q}＝${d * q}，還剩 ${n}－${d * q}＝${r}：<b>${q} 袋餘 ${r} 顆</b>。<br>餘數一定要比 ${d} 小，不然還能再裝一袋。`,
      remedial: [`x.${d}x${q}`] };
  }
});
([['dv.long2', '直式除法（二位數）', 2, 'VXc_eTApEl8'], ['dv.long3', '直式除法（三位數）', 3, '3RmKdFRabSM']] as const).forEach(([k, g, digits, vid]) => O.push({
  k, g, subj: 'mul', cur: ['N-3-5'], vids: ['vZV3O5UCctk', vid],
  make: () => {
    let d: number, q: number, n: number;
    do { d = 2 + rnd(8); q = digits === 2 ? 11 + rnd(40) : 101 + rnd(300); n = d * q; } while (String(n).length !== digits);
    return { ask: '算算看', big: `${n} ÷ ${d}`, choices: opts(q, [q + 1, q - 1, q + 10, q - 10, Math.floor(q / 10)]),
      hint: `從最高位開始除：每一位都問「${d} 乘幾最接近」，商寫在那一位上面；不夠除就商 0。答案 <b>${q}</b>，驗算：${q}×${d}＝${n}。` };
  }
}));

/* ===== 乘除互逆、乘除未知 ===== */
O.push({
  k: 'inv.times', g: '幾倍是多少（用除法）', subj: 'mul', cur: ['R-3-1', 'N-3-6'], vids: ['y6g-4iIG9Vo'],
  make: () => {
    const a = 2 + rnd(8), b = 2 + rnd(8), p = a * b;
    return pick([
      { ask: `${a} 的幾倍是 ${p}？`, choices: distract(b, 1, 12).map(v => ({ t: `${v} 倍`, ok: v === b })),
        hint: `${a} × □ ＝ ${p}，□ 要用除法找：${p} ÷ ${a} ＝ <b>${b}</b>。` },
      { ask: `什麼數的 ${b} 倍是 ${p}？`, choices: distract(a, 1, 12).map(v => ({ t: v, ok: v === a })),
        hint: `□ × ${b} ＝ ${p}，□ ＝ ${p} ÷ ${b} ＝ <b>${a}</b>。` },
    ]);
  }
});
O.push({
  k: 'unk.muldiv', g: '□ 是多少（乘除）', subj: 'mul', cur: ['N-3-6', 'R-3-1'], vids: ['y6g-4iIG9Vo'],
  make: () => {
    const a = 2 + rnd(8), b = 2 + rnd(8), p = a * b;
    const [big, ans] = pick<[string, number]>([[`□ × ${b} ＝ ${p}`, a], [`${a} × □ ＝ ${p}`, b], [`${p} ÷ □ ＝ ${a}`, b], [`□ ÷ ${a} ＝ ${b}`, p]]);
    return { ask: '□ 是多少？', big, choices: distract(ans, 1, 90).map(v => ({ t: v, ok: v === ans })),
      hint: `乘和除是反過來的：${a} × ${b} ＝ ${p}，所以 ${p} ÷ ${a} ＝ ${b}${a !== b ? `、${p} ÷ ${b} ＝ ${a}` : ''}。□ 是 <b>${ans}</b>。` };
  }
});

/* ===== 兩步驟 ===== */
O.push({
  k: 'two3.mulmul', g: '兩步驟（連乘）', subj: 'mul', cur: ['N-3-7'], vids: ['LXeE0V7o8-M'],
  make: () => {
    const a = 2 + rnd(5), b = 2 + rnd(5), c = 2 + rnd(4), ans = a * b * c;
    return { ask: `每盒有 ${a} 顆蛋，每箱裝 ${b} 盒，${c} 箱一共有幾顆蛋？`,
      choices: distract(ans, 8, 200).map(v => ({ t: v, ok: v === ans })),
      hint: `先算一箱：${a}×${b}＝${a * b} 顆；再算 ${c} 箱：${a * b}×${c}＝<b>${ans}</b> 顆。` };
  }
});
O.push({
  k: 'two3.adddiv', g: '兩步驟（加減與除）', subj: 'mul', cur: ['N-3-7'], vids: ['Ep2y8QfNCvk', 'ZHNviuolLf8'],
  make: () => {
    const d = 2 + rnd(6), q = 3 + rnd(7), tot = d * q;
    if (rnd(2)) {
      const x = 1 + rnd(tot - 1), y = tot - x;
      return { ask: `姊姊有 ${x} 張貼紙，弟弟有 ${y} 張。合起來平分給 ${d} 個人，每人幾張？`,
        choices: distract(q, 1, 20).map(v => ({ t: v, ok: v === q })),
        hint: `先合起來：${x}＋${y}＝${tot}；再平分：${tot}÷${d}＝<b>${q}</b> 張。`, remedial: [`x.${d}x${q}`] };
    }
    const spent = 2 + rnd(15), have = tot + spent;
    return { ask: `有 ${have} 元，先買了 ${spent} 元的橡皮擦，剩下的錢買每枝 ${d} 元的鉛筆，可以買幾枝？`,
      choices: distract(q, 1, 20).map(v => ({ t: `${v} 枝`, ok: v === q })),
      hint: `先算剩多少：${have}－${spent}＝${tot}；再算買幾枝：${tot}÷${d}＝<b>${q}</b> 枝。`, remedial: [`x.${d}x${q}`] };
  }
});

/* ===== 估算 ===== */
O.push({
  k: 'est3', g: '估算（乘法）', subj: 'mul', cur: ['N-3-8'], vids: ['KYx7Mt-8Chc'],
  make: () => {
    const h = 1 + rnd(4), price = h * 100 + pick([-1, 1]) * (1 + rnd(8)), n = 2 + rnd(4), ans = h * 100 * n;
    return { ask: `一本書 ${price} 元，買 ${n} 本大約要多少錢？`,
      choices: shuffle(uniq([ans, ans + 100, ans - 100, h * 100 + n])).map(v => ({ t: `大約 ${v} 元`, ok: v === ans })),
      hint: `${price} 很接近 <b>${h * 100}</b>，${h * 100}×${n}＝<b>${ans}</b>，大約 ${ans} 元。` };
  }
});

export { O as OPS_G3 };
