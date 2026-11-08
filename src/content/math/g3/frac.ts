/* ---------- 三年級：同分母分數（N-3-9） ----------
   課綱：簡單同分母分數的比較、加、減；「牽涉之分數與運算結果皆不超過 2」；
   以單位分數的點數為基礎（3/7 就是 3 個 1/7）；知道「和等於 1 的意義」。
   備註：不出現「真分數」「假分數」名詞，不教帶分數——所以超過 1 的一律寫成 9/7 這種。 */
import type { Item } from '../../../types';
import { rnd, shuffle, uniq } from '../../../util';

const F: Item[] = [];
const VIDS = { read: ['IO5_07lhSQY'], cmp: ['-LBTQcKknCg'], add: ['Lm2qOP804aw'], sub: ['l5cRTw2ElpY'] };

/** 直式分數：分子在上、分母在下 */
export const frac = (a: number, b: number) => `<span class="fr"><i>${a}</i><i>${b}</i></span>`;
/** 切成 n 等分的長條，塗 k 格；k 超過 n 就畫兩條 */
function bars(k: number, n: number): string {
  const W = 220, h = 28, w = W / n;
  const one = (fill: number, y: number) => Array.from({ length: n }, (_, i) =>
    `<rect x="${i * w + 1}" y="${y}" width="${w}" height="${h}" class="${i < fill ? 'tb-on' : 'tb-off'}"/>`).join('');
  const rows = k > n ? [n, k - n] : [k];
  return `<svg viewBox="0 0 ${W + 2} ${rows.length * 38}" width="250" class="tbar">${rows.map((f, i) => one(f, i * 38 + 2)).join('')}</svg>`;
}
const fracChoices = (ans: number, n: number, wrongs: number[]) =>
  shuffle(uniq([ans, ...wrongs.filter(w => w > 0 && w !== ans && w <= 2 * n)]).slice(0, 4)).map(k => ({ art: `<span class="frbig">${frac(k, n)}</span>`, ok: k === ans }));

F.push({
  k: 'fr3.read', g: '幾分之幾（看圖）', subj: 'frac', cur: ['N-3-9'], vids: VIDS.read,
  make: () => {
    const n = 3 + rnd(6), k = 1 + rnd(2 * n - 1);
    return { ask: '一整條是 1。塗色的部分是多少？', art: bars(k, n),
      choices: fracChoices(k, n, [n - k, k + 1, k - 1, n]),
      hint: `一條平分成 ${n} 格，一格是 ${frac(1, n)}。塗了 ${k} 格，就是 ${k} 個 ${frac(1, n)}：<b>${frac(k, n)}</b>。` };
  }
});
F.push({
  k: 'fr3.cmp', g: '同分母比大小', subj: 'frac', cur: ['N-3-9'], vids: VIDS.cmp,
  make: () => {
    const n = 4 + rnd(6); let a = 1 + rnd(2 * n - 1), b = 1 + rnd(2 * n - 1); while (a === b) b = 1 + rnd(2 * n - 1);
    const sym = a > b ? '＞' : '＜';
    return { ask: '中間要填哪一個？', art: `<div class="frrow">${frac(a, n)}<span>□</span>${frac(b, n)}</div>`,
      choices: ['＞', '＜', '＝'].map(s => ({ t: s, ok: s === sym })),
      hint: `分母一樣，就是比有幾個 ${frac(1, n)}：${a} 個比 ${b} 個${a > b ? '多' : '少'}，所以 ${frac(a, n)} ${sym} ${frac(b, n)}。` };
  }
});
(['add', 'sub'] as const).forEach(op => F.push({
  k: `fr3.${op}`, g: op === 'add' ? '同分母加法' : '同分母減法', subj: 'frac', cur: ['N-3-9'], vids: VIDS[op],
  make: () => {
    const n = 3 + rnd(7);
    let a: number, b: number, r: number;
    if (op === 'add') { do { a = 1 + rnd(n); b = 1 + rnd(n); r = a + b; } while (r > 2 * n); }
    else { do { a = 2 + rnd(2 * n - 1); b = 1 + rnd(a - 1); r = a - b; } while (a > 2 * n); }
    return { ask: '算算看', art: `<div class="frrow">${frac(a, n)}<span>${op === 'add' ? '＋' : '－'}</span>${frac(b, n)}<span>＝？</span></div>`,
      // 最常見的錯：分母也加起來
      choices: shuffle(uniq([`${r}/${n}`, `${r}/${op === 'add' ? 2 * n : n}`, `${r + 1}/${n}`, `${Math.max(1, r - 1)}/${n}`])).slice(0, 4)
        .map(s => { const [x, y] = s.split('/').map(Number); return { art: `<span class="frbig">${frac(x, y)}</span>`, ok: x === r && y === n }; }),
      hint: `${a} 個 ${frac(1, n)} ${op === 'add' ? '加' : '減'} ${b} 個 ${frac(1, n)}，是 ${r} 個 ${frac(1, n)}：<b>${frac(r, n)}</b>。分母是「切成幾份」，不能加減。` };
  }
}));
F.push({
  k: 'fr3.one', g: '湊成 1', subj: 'frac', cur: ['N-3-9'], vids: VIDS.add,
  make: () => {
    const n = 3 + rnd(8), a = 1 + rnd(n - 1), r = n - a;
    return { ask: '再加多少剛好是 1？', art: `<div class="frrow">${frac(a, n)}<span>＋ ？ ＝ 1</span></div>`,
      choices: fracChoices(r, n, [a, r + 1, r - 1, n]),
      hint: `1 就是 ${frac(n, n)}（${n} 個 ${frac(1, n)}）。已經有 ${a} 個，還差 ${n}－${a}＝${r} 個：<b>${frac(r, n)}</b>。` };
  }
});

export { F as FRAC_G3 };
