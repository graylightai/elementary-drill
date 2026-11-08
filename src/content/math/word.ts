/* ---------- 加減應用題（一年級 N-1-2） ----------
   課綱要求四種情境：添加型、併加型、拿走型、比較型，而且「應含加、減法並陳」，
   讓孩子自己察覺該用加還是減。一年級不做加數、被加數未知的題型（那是 N-2-3）。

   答錯時往回補：同一組數字的「純算式」題（例如 7＋8）緊接著出一次。
   應用題錯，常常不是不會讀題，而是那個加減事實本身還不熟——先把底下那一層補起來。 */
import type { Item } from '../../types';
import { rnd, pick, distract } from '../../util';
import { tenFrame, bond } from '../../ui/visuals/numbers';

const W: Item[] = [];

/** 東西：[圖檔, 名稱, 量詞, 動物怎麼移動（不是動物就留空）]
   動物不會被「媽媽給」，所以添加型、拿走型要換成「飛來／飛走」這類說法 */
const THINGS: [string, string, string, string?][] = [
  ['apple', '蘋果', '顆'], ['banana', '香蕉', '根'], ['cookie', '餅乾', '片'], ['balloon', '氣球', '顆'],
  ['bird', '小鳥', '隻', '飛'], ['duck', '鴨子', '隻', '游'], ['strawberry', '草莓', '顆'], ['cupcake', '蛋糕', '個'],
  ['star', '星星', '顆'], ['chick', '小雞', '隻', '跑'], ['fish', '小魚', '條', '游'], ['lemon', '檸檬', '顆'],
];
const PLACE: Record<string, string> = { 飛: '樹上', 游: '池塘裡', 跑: '院子裡' };
const NAMES = ['小美', '阿哲', '小安', '小樂', '安安', '哥哥', '妹妹'];

/* 對應到既有的算式題 key（這些題目在 g1.ts） */
export function addKey(x: number, y: number): string | undefined {
  const [a, b] = x <= y ? [x, y] : [y, x];
  if (a >= 1 && a + b <= 10) return `m.a.${a}+${b}`;
  if (a >= 2 && b <= 9 && a + b >= 11) return `m.c.${a}+${b}`;
}
export function subKey(s: number, b: number): string | undefined {
  if (s >= 11 && s <= 18 && b >= 2 && b <= 9 && s - b >= 2 && s - b <= 9) return `m.s.${s}-${b}`;
  return addKey(b, s - b);                      // 10 以內的減法用「還差多少」的加法事實來補
}

/** 兩個數：small = 10 以內，large = 11–18 要進退位 */
function pair(large: boolean): [number, number] {
  if (!large) { const s = 3 + rnd(8); const a = 1 + rnd(s - 1); return [a, s - a]; }
  for (;;) { const a = 2 + rnd(8), b = 2 + rnd(8); if (a + b >= 11) return [a, b]; }
}

type Kind = 'add' | 'join' | 'take' | 'cmp';
const KIND_NAME: Record<Kind, string> = { add: '添加', join: '合起來', take: '拿走', cmp: '比多少' };

function story(kind: Kind, large: boolean) {
  const [x, y] = pair(large);
  const [img, thing, q, move] = pick(THINGS);
  const n1 = pick(NAMES); let n2 = pick(NAMES); while (n2 === n1) n2 = pick(NAMES);
  const total = x + y;
  switch (kind) {
    case 'add': return { img, ans: total, key: addKey(x, y),
      ask: move ? `${PLACE[move]}有 ${x} ${q}${thing}，又${move}來了 ${y} ${q}。現在有幾${q}？`
        : `${n1}有 ${x} ${q}${thing}，媽媽又給了 ${y} ${q}。現在有幾${q}？`,
      hint: `「又${move ? move + '來' : '給'}了」是變多，用加的：${x} ＋ ${y} ＝ <b>${total}</b>。`,
      art: total <= 10 ? tenFrame(x, y) : tenFrame(x, 10 - x) + tenFrame(total - 10) };
    case 'join': return { img, ans: total, key: addKey(x, y),
      ask: `${n1}有 ${x} ${q}${thing}，${n2}有 ${y} ${q}${thing}。兩個人一共有幾${q}？`,
      hint: `「一共」是合起來，用加的：${x} ＋ ${y} ＝ <b>${total}</b>。`, art: bond(total, x, y) };
    case 'take': return { img, ans: x, key: subKey(total, y),
      ask: move ? `${PLACE[move]}有 ${total} ${q}${thing}，${move}走了 ${y} ${q}。還剩幾${q}？`
        : `${n1}有 ${total} ${q}${thing}，送給${n2} ${y} ${q}。還剩幾${q}？`,
      hint: `「${move ? move + '走了' : '送給別人'}」是變少，用減的：${total} － ${y} ＝ <b>${x}</b>。<br>也可以想：${y} 還差多少到 ${total}？`, art: bond(total, y, null) };
    case 'cmp':                                   // 比較型：total 和 x 兩堆比，差是 y
      return { img, ans: y, key: subKey(total, x),
        ask: `${n1}有 ${total} ${q}${thing}，${n2}有 ${x} ${q}${thing}。${n1}比${n2}多幾${q}？`,
        hint: `把兩堆一個對一個排好，多出來的就是答案：${total} － ${x} ＝ <b>${y}</b>。`, art: bond(total, x, null) };
  }
}

(['add', 'join', 'take', 'cmp'] as Kind[]).forEach(kind => [false, true].forEach(large => W.push({
  k: `wp.${kind}.${large ? 'l' : 's'}`, g: `應用題・${KIND_NAME[kind]}`, subj: 'math', cur: ['N-1-2'],
  make: () => {
    const s = story(kind, large);
    return { ask: s.ask, img: s.img,
      choices: distract(s.ans, 1, large ? 18 : 10).map(v => ({ t: v, ok: v === s.ans })),
      hint: s.hint, hintArt: s.art,
      remedial: s.key ? [s.key] : undefined };
  }
})));

export { W as WORD_PROBLEMS };
