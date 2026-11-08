/* ---------- 二年級：直式加減（N-2-2）、加減未知（N-2-3、R-2-4） ----------
   課綱備註：「加法含二次進位，減法限一次退位。須處理數字中有 0 的題型。」
   直式答錯時往回補：進位那一位其實就是一年級的加法事實（8＋7），退位那一位就是 15－7。
   未知數題照均一的四種分法：被加數、加數、被減數、減數未知，答錯的提示用部分－整體圖。 */
import type { Item } from '../../../types';
import { rnd, distract } from '../../../util';
import { bond } from '../../../ui/visuals/numbers';
import { addKey, subKey } from '../word';

const A: Item[] = [];

/** 直式排版：每一位一格，對齊個位 */
function vertical(a: number, b: number, op: '＋' | '－'): string {
  const w = Math.max(String(a).length, String(b).length, 3);
  const cells = (n: number | string) => String(n).padStart(w, ' ').split('').map(c => `<span>${c.trim()}</span>`).join('');
  return `<div class="vert" style="--w:${w}">
    <div class="vrow"><span class="vop"></span>${cells(a)}</div>
    <div class="vrow"><span class="vop">${op}</span>${cells(b)}</div>
    <div class="vline"></div>
    <div class="vrow"><span class="vop"></span>${cells('？'.padStart(w, ' '))}</div></div>`;
}

type Gen = () => [number, number];
const two = () => 10 + rnd(90);
/** 依條件產生兩個數 */
function find(ok: (a: number, b: number) => boolean, ga: () => number, gb: () => number): [number, number] {
  for (;;) { const a = ga(), b = gb(); if (ok(a, b)) return [a, b]; }
}
const ones = (n: number) => n % 10, tens = (n: number) => Math.floor(n / 10) % 10;

const ADD: [string, string, Gen, string][] = [
  ['vt.add0', '直式加法（不進位）', () => find((a, b) => ones(a) + ones(b) < 10 && tens(a) + tens(b) < 10, two, two), 'M3LiA_FAxdE'],
  ['vt.add1', '直式加法（進位一次）', () => find((a, b) => ones(a) + ones(b) >= 10 && tens(a) + tens(b) + 1 < 10, two, two), 'vMJkp_oaXmw'],
  ['vt.add2', '直式加法（進位兩次）', () => find((a, b) => ones(a) + ones(b) >= 10 && tens(a) + tens(b) + 1 >= 10, two, two), 'vMJkp_oaXmw'],
];
ADD.forEach(([k, g, gen, vid]) => A.push({
  k, g, subj: 'math', cur: ['N-2-2'], vids: [vid],
  make: () => {
    const [a, b] = gen(), s = a + b, c1 = ones(a) + ones(b) >= 10;
    return { ask: '用直式算算看', art: vertical(a, b, '＋'),
      choices: distract(s, 20, 198).map(v => ({ t: v, ok: v === s })),
      hint: c1
        ? `個位：${ones(a)}＋${ones(b)}＝${ones(a) + ones(b)}，寫 ${ones(s)}、<b>進 1</b> 到十位。十位：${tens(a)}＋${tens(b)}＋1＝${tens(a) + tens(b) + 1}。答案 <b>${s}</b>。`
        : `個位 ${ones(a)}＋${ones(b)}＝${ones(s)}，十位 ${tens(a)}＋${tens(b)}＝${tens(a) + tens(b)}。答案 <b>${s}</b>。`,
      // 進位的那一位答錯，多半是那個加法事實還不熟
      remedial: c1 ? [addKey(ones(a), ones(b))].filter((x): x is string => !!x) : undefined };
  }
}));

const SUB: [string, string, Gen, string][] = [
  ['vt.sub0', '直式減法（不退位）', () => find((a, b) => a > b && ones(a) >= ones(b), two, two), 'M3LiA_FAxdE'],
  ['vt.sub1', '直式減法（退位）', () => find((a, b) => a > b && ones(a) < ones(b) && ones(a) > 0, two, two), 'RBo2H4kc-yY'],
  ['vt.subz', '直式減法（個位是 0）', () => find((a, b) => a > b && ones(b) > 0, () => 10 * (2 + rnd(8)), two), 'RBo2H4kc-yY'],
];
SUB.forEach(([k, g, gen, vid]) => A.push({
  k, g, subj: 'math', cur: ['N-2-2'], vids: [vid],
  make: () => {
    const [a, b] = gen(), d = a - b, borrow = ones(a) < ones(b);
    return { ask: '用直式算算看', art: vertical(a, b, '－'),
      choices: distract(d, 1, 98).map(v => ({ t: v, ok: v === d })),
      hint: borrow
        ? `個位 ${ones(a)} 不夠減 ${ones(b)}，跟十位<b>借 1 個十</b>：${10 + ones(a)}－${ones(b)}＝${10 + ones(a) - ones(b)}。十位剩 ${tens(a) - 1}，${tens(a) - 1}－${tens(b)}＝${tens(a) - 1 - tens(b)}。答案 <b>${d}</b>。`
        : `個位 ${ones(a)}－${ones(b)}＝${ones(d)}，十位 ${tens(a)}－${tens(b)}＝${tens(d)}。答案 <b>${d}</b>。`,
      remedial: borrow ? [subKey(10 + ones(a), ones(b))].filter((x): x is string => !!x) : undefined };
  }
}));

/* 加減未知：□ 在不同位置 */
const UNK: [string, string, string][] = [
  ['unk.augend', '□＋b＝c（被加數未知）', 'C2eu2LFT8PM'],
  ['unk.addend', 'a＋□＝c（加數未知）', 'xrun2N1jIk8'],
  ['unk.minuend', '□－b＝c（被減數未知）', 'qriyC16bmr4'],
  ['unk.subtra', 'a－□＝c（減數未知）', 'xrun2N1jIk8'],
];
UNK.forEach(([k, g, vid]) => A.push({
  k, g, subj: 'math', cur: ['N-2-3', 'R-2-4'], vids: [vid],
  make: () => {
    const x = 10 + rnd(60), y = 5 + rnd(35), w = x + y;      // x＋y＝w，w 最多 108（二年級是一千以內）
    switch (k) {
      case 'unk.augend': return { ask: '□ 是多少？', big: `□ ＋ ${y} ＝ ${w}`, art: undefined,
        choices: distract(x, 1, 99).map(v => ({ t: v, ok: v === x })), hintArt: bond(w, null, y),
        hint: `整體是 ${w}，一部分是 ${y}，另一部分就是 ${w}－${y}＝<b>${x}</b>。` };
      case 'unk.addend': return { ask: '□ 是多少？', big: `${x} ＋ □ ＝ ${w}`,
        choices: distract(y, 1, 99).map(v => ({ t: v, ok: v === y })), hintArt: bond(w, x, null),
        hint: `${x} 還差多少到 ${w}？${w}－${x}＝<b>${y}</b>。` };
      case 'unk.minuend': return { ask: '□ 是多少？', big: `□ － ${y} ＝ ${x}`,
        choices: distract(w, 1, 120).map(v => ({ t: v, ok: v === w })), hintArt: bond(null, y, x),
        hint: `拿走 ${y} 之後剩 ${x}，原來就是兩部分合起來：${x}＋${y}＝<b>${w}</b>。` };
      default: return { ask: '□ 是多少？', big: `${w} － □ ＝ ${x}`,
        choices: distract(y, 1, 99).map(v => ({ t: v, ok: v === y })), hintArt: bond(w, x, null),
        hint: `${w} 拿走多少剩 ${x}？就是 ${x} 和 ${w} 差多少：${w}－${x}＝<b>${y}</b>。` };
    }
  }
}));

export { A as ARITH_G2 };
