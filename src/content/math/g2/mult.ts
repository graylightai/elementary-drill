/* ---------- 二年級：乘法（N-2-6、N-2-7、R-2-3）、分裝與平分（N-2-9） ----------
   台灣課本的列式慣例是「每份數 × 份數」：每盤 4 顆、3 盤 → 4 × 3。
   「3 的 4 倍」→ 3 × 4。題目與提示都照這個寫，選項不放順序對調的算式來考，免得跟學校吵架。
   九九乘法每一題各自是一個知識點（7×8 和 7×6 熟練度不同）；
   答錯時往回補前一題（7×8 錯 → 先練 7×7，再往上加 7），這就是課本教的「累加」。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const X: Item[] = [];

/** 九九乘法表對應的均一影片 */
const TABLE_VID: Record<number, string> = {
  0: '58h95nYVvJg', 1: '58h95nYVvJg', 10: '58h95nYVvJg',
  2: 'dn0rScdLXNI', 5: 'dn0rScdLXNI', 4: 'EMGBRNi5eUE', 8: 'EMGBRNi5eUE',
  3: 'R5nzt9WkoOE', 6: 'R5nzt9WkoOE', 7: 'bOpMEm5q1T4', 9: 'bOpMEm5q1T4',
};

/** 陣列圖：b 列、每列 a 個（每份 a 個，有 b 份） */
function array(a: number, b: number): string {
  const r = 7, gap = 18, w = a * gap + 4, h = b * gap + 4;
  let s = '';
  for (let j = 0; j < b; j++) {
    s += `<rect x="1" y="${j * gap + 2}" width="${w - 2}" height="${gap - 2}" rx="7" class="arr-row"/>`;
    for (let i = 0; i < a; i++) s += `<circle cx="${i * gap + gap / 2 + 2}" cy="${j * gap + gap / 2 + 1}" r="${r}" class="arr-dot"/>`;
  }
  return `<svg class="arr" viewBox="0 0 ${w} ${h}" width="${Math.min(260, w * 1.4)}">${s}</svg>`;
}

/* 九九乘法：2～9 的乘法表 × 1～9 */
for (let a = 2; a <= 9; a++) for (let b = 1; b <= 9; b++) X.push({
  k: `x.${a}x${b}`, g: `${a} 的乘法`, subj: 'mul', cur: ['N-2-7', 'R-2-3'], vids: [TABLE_VID[a]],
  make: () => {
    const p = a * b;
    const wrong = uniq([p + a, p - a, a * (b + 1), (a + 1) * b, p + 1, p - 1].filter(v => v > 0 && v !== p));
    return { ask: `${a} × ${b} ＝ ？`, big: `${a} × ${b}`,
      choices: shuffle([p, ...shuffle(wrong).slice(0, 3)]).map(v => ({ t: v, ok: v === p })),
      hintArt: array(a, b),
      hint: `${a} 的 ${b} 倍：${Array.from({ length: b }, (_, i) => a * (i + 1)).join('、')}，是 <b>${p}</b>。` +
        (a !== b ? `<br>${b} × ${a} 也是 ${p}，順序換了答案一樣。` : ''),
      remedial: b > 1 ? [`x.${a}x${b - 1}`] : undefined };
  }
});

/* 1、0、10 的乘法 */
([['x.1', '1 的乘法', 1], ['x.0', '0 的乘法', 0], ['x.10', '10 的乘法', 10]] as const).forEach(([k, g, a]) => X.push({
  k, g, subj: 'mul', cur: ['N-2-7'], vids: [TABLE_VID[a]],
  make: () => {
    const b = 1 + rnd(9), p = a * b, flip = rnd(2) === 0;
    return { ask: '答案是多少？', big: flip ? `${b} × ${a}` : `${a} × ${b}`,
      choices: distract(p, 0, 100).map(v => ({ t: v, ok: v === p })),
      hint: a === 0 ? `任何數乘 0、或 0 乘任何數，都是 <b>0</b>。` :
        a === 1 ? `乘 1 就是原來的數：<b>${p}</b>。` : `${b} 個十是 <b>${p}</b>，在後面加一個 0。` };
  }
}));

/* 乘法的意義：每份幾個、有幾份 */
const THINGS = [['apple', '蘋果', '顆', '盤'], ['cookie', '餅乾', '片', '包'], ['strawberry', '草莓', '顆', '盒'], ['balloon', '氣球', '顆', '束']];
X.push({
  k: 'x.groups', g: '每份幾個、有幾份', subj: 'mul', cur: ['N-2-6'], vids: ['V5u1sWAIfho'],
  make: () => {
    const [img, thing, q, unit] = pick(THINGS), a = 2 + rnd(5), b = 2 + rnd(4), p = a * b;
    const pics = Array.from({ length: b }, () =>
      `<div class="grp">${Array.from({ length: a }, () => `<img src="img/${img}.png" alt="">`).join('')}</div>`).join('');
    return { ask: `每${unit}有 ${a} ${q}${thing}，${b} ${unit}一共有幾${q}？`, art: `<div class="grps">${pics}</div>`,
      choices: distract(p, 2, 40).map(v => ({ t: v, ok: v === p })),
      hint: `每${unit} ${a} ${q}，有 ${b} ${unit}，就是 ${a} 的 ${b} 倍：${a} × ${b} ＝ <b>${p}</b>。` };
  }
});
X.push({
  k: 'x.times', g: '幾的幾倍', subj: 'mul', cur: ['N-2-6'], vids: ['V5u1sWAIfho'],
  make: () => {
    const a = 2 + rnd(8), b = 2 + rnd(8), p = a * b;
    const [n1, n2] = shuffle(['妹妹', '哥哥', '小美', '阿哲']).slice(0, 2);
    return { ask: `${n1}有 ${a} 張貼紙，${n2}的貼紙是${n1}的 ${b} 倍。${n2}有幾張？`,
      choices: distract(p, 2, 90).map(v => ({ t: v, ok: v === p })),
      hint: `「${a} 的 ${b} 倍」就是 ${a} × ${b} ＝ <b>${p}</b>。`,
      remedial: [`x.${a}x${b}`] };
  }
});

/* 分裝與平分：除法的前置經驗，用乘法想 */
X.push({
  k: 'div.pack', g: '分裝', subj: 'mul', cur: ['N-2-9'], vids: ['UkBauwBje1c'],
  make: () => {
    const each = 2 + rnd(5), bags = 2 + rnd(5), total = each * bags;
    return { ask: `有 ${total} 顆糖果，每 ${each} 顆裝一袋，可以裝幾袋？`,
      choices: distract(bags, 1, 12).map(v => ({ t: `${v} 袋`, ok: v === bags })),
      hint: `${each} 顆、${each} 顆一袋一袋數：${Array.from({ length: bags }, (_, i) => each * (i + 1)).join('、')}，數了 <b>${bags}</b> 次。也就是 ${each} × <b>${bags}</b> ＝ ${total}。`,
      remedial: [`x.${each}x${bags}`] };
  }
});
X.push({
  k: 'div.share', g: '平分', subj: 'mul', cur: ['N-2-9'], vids: ['RrysBIOLHOA'],
  make: () => {
    const people = 2 + rnd(4), each = 2 + rnd(6), total = people * each;
    return { ask: `${total} 片餅乾平分給 ${people} 個人，每個人分到幾片？`,
      choices: distract(each, 1, 12).map(v => ({ t: `${v} 片`, ok: v === each })),
      hint: `一人一片輪流發，發一輪用掉 ${people} 片。發幾輪剛好發完？${people} × <b>${each}</b> ＝ ${total}，每人 <b>${each}</b> 片。`,
      remedial: [`x.${people}x${each}`] };
  }
});

export { X as MULT };
