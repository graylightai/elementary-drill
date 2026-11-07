import type { Item } from '../../types';
import { rnd, pick, shuffle, distract } from '../../util';
import { tenFrame, bond } from '../../ui/visuals/numbers';

/* ---------- 數學（一年級為主） ---------- */
const MATH: Item[] = [];
for (let a = 1; a <= 9; a++) MATH.push({
  k: `m.t10.${a}`, g: '湊十', subj: 'math', cur: ['N-1-3'],
  make: () => ({ ask: '湊成 10', big: `${a} ＋ ？ ＝ 10`,
    choices: distract(10 - a, 1, 9).map(v => ({ t: v, ok: v === 10 - a })),
    hintArt: tenFrame(a, 10 - a),
    hint: `十格板上放了 <b>${a}</b> 個，還有 <b>${10 - a}</b> 格是空的。` })
});
for (let a = 1; a <= 9; a++) for (let b = a; a + b <= 10; b++) MATH.push({
  k: `m.a.${a}+${b}`, g: '10 以內加法', subj: 'math', cur: ['N-1-3', 'R-1-1'],
  make: () => { const [x, y] = shuffle([a, b]); return {
    big: `${x} ＋ ${y} ＝ ？`,
    choices: distract(a + b, 1, 10).map(v => ({ t: v, ok: v === a + b })),
    hintArt: tenFrame(x, y),
    hint: `先放 <b>${x}</b> 個，再放 <b>${y}</b> 個，一共 <b>${a + b}</b> 個。` }; }
});
for (let a = 2; a <= 9; a++) for (let b = a; b <= 9; b++) if (a + b >= 11) MATH.push({
  k: `m.c.${a}+${b}`, g: '進位加法', subj: 'math', cur: ['N-1-3'],
  make: () => { const [x, y] = shuffle([a, b]); return {
    big: `${x} ＋ ${y} ＝ ？`,
    choices: distract(a + b, 11, 18).map(v => ({ t: v, ok: v === a + b })),
    hintArt: tenFrame(x, 10 - x) + tenFrame(y - (10 - x)),
    hint: `${x} 還差 <b>${10 - x}</b> 就滿十。把 ${y} 拆成 ${10 - x} 和 ${y - (10 - x)}：
      滿一個十格板，再多 <b>${y - (10 - x)}</b> 個，所以是 <b>${a + b}</b>。` }; }
});
// 減法教成「還差多少」，不是「拿掉」——這樣才接得上湊十
for (let s = 11; s <= 18; s++) for (let b = 2; b <= 9; b++) if (s - b >= 2 && s - b <= 9) MATH.push({
  k: `m.s.${s}-${b}`, g: '退位減法', subj: 'math', cur: ['N-1-3'],
  make: () => ({ big: `${s} － ${b} ＝ ？`,
    choices: distract(s - b, 1, 9).map(v => ({ t: v, ok: v === s - b })),
    hintArt: bond(s, b, null),
    hint: `換個問法：<b>${b}</b> 還差多少才到 <b>${s}</b>？
      ${b} 先補到 10（差 ${10 - b}），再加上 ${s - 10}，一共 <b>${s - b}</b>。` })
});
// 缺加數：把加法和減法接起來的關鍵題型
for (let s = 11; s <= 18; s++) for (let a = 2; a <= 9; a++) if (s - a >= 2 && s - a <= 9) MATH.push({
  k: `m.miss.${a}+${s}`, g: '還差多少', subj: 'math', cur: ['N-1-3', 'R-2-4'],
  make: () => ({ ask: '還差多少？', big: `${a} ＋ ？ ＝ ${s}`,
    choices: distract(s - a, 1, 9).map(v => ({ t: v, ok: v === s - a })),
    hintArt: bond(s, a, null),
    hint: `${a} 先補到 10 要 <b>${10 - a}</b>，再從 10 到 ${s} 要 <b>${s - 10}</b>，合起來 <b>${s - a}</b>。
      這題跟 ${s} － ${a} 是同一件事。` })
});
// 部分－整體：同一組數字的四個算式是一件事
for (let a = 2; a <= 9; a++) for (let b = a; b <= 9; b++) if (a + b >= 11) MATH.push({
  k: `m.fam.${a}+${b}`, g: '算式家族', subj: 'math', cur: ['R-1-2', 'R-2-4'],
  make: () => {
    const w = a + b, hide = pick(['w', 'a', 'b'] as const);
    const shown = hide === 'w' ? bond(null, a, b) : hide === 'a' ? bond(w, null, b) : bond(w, a, null);
    const ans = hide === 'w' ? w : hide === 'a' ? a : b;
    return { ask: '問號是多少？', art: shown,
      choices: distract(ans, 1, 18).map(v => ({ t: v, ok: v === ans })),
      hint: `${a}、${b}、${w} 是一家人：${a}＋${b}＝${w}、${b}＋${a}＝${w}、
        ${w}－${a}＝${b}、${w}－${b}＝${a}。知道兩個就能推出第三個。` };
  }
});
MATH.push({ k: 'm.cmp', g: '比大小', subj: 'math', cur: ['N-1-1', 'R-2-1'], make: () => {
  const a = 10 + rnd(90); let b = 10 + rnd(90); while (b === a) b = 10 + rnd(90);
  return { ask: '哪一個比較大？', big: `${a}　${b}`,
    choices: shuffle([{ t: a, ok: a > b }, { t: b, ok: b > a }]),
    hint: `先比十位：${Math.floor(a / 10)} 和 ${Math.floor(b / 10)}。十位一樣才比個位。` };
} });
MATH.push({ k: 'm.seq', g: '數的順序', subj: 'math', cur: ['N-1-1'], make: () => {
  const st = 1 + rnd(90), step = pick([1, 1, 2, 5, 10]);
  const seq = [st, st + step, st + step * 2, st + step * 3];
  const hole = 1 + rnd(2), ans = seq[hole];
  return { ask: '空格要填什麼？', big: seq.map((v, i) => i === hole ? '？' : v).join('　'),
    choices: distract(ans, 1, 120).map(v => ({ t: v, ok: v === ans })),
    hint: `每次加 <b>${step}</b>。` };
} });

export { MATH };
