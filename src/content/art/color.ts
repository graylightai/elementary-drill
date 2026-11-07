import type { Item } from '../../types';
import { shuffle } from '../../util';
import { CHIP, COLORS } from '../../ui/visuals/color';

/* 顏料的減法混色（美術課那一套）。
   三原色互混的結果用課本教的鮮明顏色，不是 RGB 平均——
   「黃＋藍＝綠」是要教的概念，RGB 平均會得到混濁的橄欖色，反而誤導。 */
const MIX: [string, string, string][] = [
  ['紅', '黃', '橙'], ['黃', '藍', '綠'], ['藍', '紅', '紫'],
  ['紅', '白', '粉紅'], ['藍', '白', '淺藍'], ['綠', '白', '淺綠'],
  ['橙', '白', '淺橙'], ['紫', '白', '淺紫'],
  ['紅', '黑', '深紅'], ['藍', '黑', '深藍'], ['綠', '黑', '深綠'], ['白', '黑', '灰'],
  ['紅', '綠', '棕']
];
const MIXQ: Item[] = MIX.map(([a, b, r]) => ({
  k: `col.mix.${a}${b}`, g: '兩色相加', subj: 'mix', cur: [],
  make: () => {
    const others = shuffle(Object.keys(COLORS).filter(c => c !== r && c !== a && c !== b)).slice(0, 3);
    return { ask: '這兩個顏色混在一起，會變成什麼顏色？',
      art: `<div class="mixrow">${shuffle([a, b]).map(c => CHIP(COLORS[c])).join('<span class="mixop">＋</span>')}
        <span class="mixop">＝</span><span class="mixq">？</span></div>`,
      choices: shuffle([r, ...others]).map(c => ({ swatch: COLORS[c], tag: c, ok: c === r })),
      hint: `<b>${a}</b> 加 <b>${b}</b> 會變成 <b>${r}</b>。` };
  }
}));
// 色階排序：由淺到深點出來。這是「序列化」，六歲左右的認知里程碑
const HUES: [number, string][] = [[0, '紅'], [28, '橙'], [45, '黃'], [140, '綠'], [205, '藍'], [275, '紫'], [330, '粉']];
const RAMPQ: Item[] = [];
HUES.forEach(([h, name]) => [4, 5, 6].forEach(n => RAMPQ.push({
  k: `col.ramp.${name}${n}`, g: '由淺到深', subj: 'ramp', cur: [],
  make: () => {
    const lo = 30, hi = 88, step = (hi - lo) / (n - 1);
    const items = Array.from({ length: n }, (_, i) => ({
      v: i, fill: `hsl(${h} 72% ${(hi - i * step).toFixed(1)}%)`
    }));
    return { kind: 'order' as const, ask: '把它們從最淺排到最深', items: shuffle(items.slice()),
      hint: `按住一格拖到另一格就會互換。最淺的放最左邊。` };
  }
})));

export { MIXQ, RAMPQ };
