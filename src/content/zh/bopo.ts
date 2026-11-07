import type { Item } from '../../types';
import { rnd, pick, shuffle, uniq } from '../../util';
import { WORDS } from '../words';
import { TONES, baseOf, toneOf, toneNo, zhuyin } from '../../ui/visuals/zhuyin';
import { BGLYPH } from '../../ui/visuals/bopo-glyphs';

/* 形近的注音符號——這一組同時也是精細視覺辨別的練習 */
const SIMILAR: [string, string][] = [['ㄨ','ㄩ'],['ㄛ','ㄜ'],['ㄓ','ㄗ'],['ㄔ','ㄘ'],['ㄕ','ㄙ'],['ㄋ','ㄣ'],
  ['ㄅ','ㄣ'],['ㄉ','ㄌ'],['ㄤ','ㄥ'],['ㄢ','ㄤ'],['ㄇ','ㄈ'],['ㄑ','ㄒ'],['ㄖ','ㄏ'],
  ['ㄞ','ㄟ'],['ㄠ','ㄡ'],['ㄆ','ㄅ'],['ㄈ','ㄐ'],['ㄥ','ㄣ']];
const ALLSYM = uniq(SIMILAR.flat());

/** 換掉詞裡某一個音節的一個形近符號，產生干擾選項 */
function mutateWord(arr: string[]): string[] {
  const out = arr.slice();
  for (let g = 0; g < 40; g++) {
    const i = rnd(out.length), z = out[i], b = baseOf(z), t = toneOf(z);
    const pairs = shuffle(SIMILAR.filter(([x, y]) => b.includes(x) || b.includes(y)));
    if (!pairs.length) continue;
    const [x, y] = pairs[0];
    out[i] = (b.includes(x) ? b.replace(x, y) : b.replace(y, x)) + t;
    if (out.join('') !== arr.join('')) return out;
  }
  // 找不到形近符號可換就改聲調
  const i = rnd(out.length);
  out[i] = baseOf(out[i]) + pick(TONES.filter(t => t !== toneOf(out[i])));
  return out;
}

const BOPO: Item[] = [];
// 拼讀選圖：看直式注音，從四張圖裡挑出來
WORDS.forEach(([slug, ch, zy]) => BOPO.push({
  k: `b.read.${slug}`, g: '注音拼讀', subj: 'bopo', cur: ['Aa-I-3'],
  make: () => {
    const others = shuffle(WORDS.filter(w => w[0] !== slug)).slice(0, 3);
    return { ask: '這是什麼？', zy: zhuyin(zy),
      choices: shuffle([slug, ...others.map(o => o[0])]).map(s => ({ img: s, ok: s === slug })),
      hint: `<b>${zy.join('')}</b> 拼起來是「<b>${ch}</b>」。` };
  }
}));
// 看圖選注音：四個直式注音，只有一個對
WORDS.forEach(([slug, ch, zy]) => BOPO.push({
  k: `b.spell.${slug}`, g: '看圖拼注音', subj: 'bopo', cur: ['Aa-I-3'],
  make: () => {
    const wrong: string[] = [];
    for (let g = 0; wrong.length < 3 && g < 60; g++) {
      const m = mutateWord(zy).join('|');
      if (m !== zy.join('|') && !wrong.includes(m)) wrong.push(m);
    }
    return { ask: `「${ch}」的注音是哪一個？`, img: slug,
      choices: shuffle([zy.join('|'), ...wrong]).map(s =>
        ({ zy: s.split('|'), ok: s === zy.join('|') })),
      hint: `「${ch}」唸 <b>${zy.join(' ')}</b>。` };
  }
}));
// 聲調：挖掉其中一個字的聲調
WORDS.forEach(([slug, ch, zy]) => BOPO.push({
  k: `b.tone.${slug}`, g: '聲調', subj: 'bopo', cur: ['Aa-I-2'],
  make: () => {
    const i = rnd(zy.length), target = zy[i], no = toneNo(target);
    return { ask: `「${ch}」的「${ch[i]}」是第幾聲？`, img: slug,
      sub: zhuyin(zy, ch),
      // 正解一定要在選項裡：輕聲的詞（獅子、兔子…）也要給得出「輕聲」這個選項
      choices: shuffle(uniq([no, ...shuffle([1, 2, 3, 4, 5]).filter(n => n !== no)]).slice(0, 4))
        .map(n => ({ zy: [baseOf(target) + TONES[n - 1]],
                     tag: ['一聲','二聲','三聲','四聲','輕聲'][n - 1], ok: n === no })),
      hint: `「${ch[i]}」是<b>${['一','二','三','四','輕'][no - 1]}聲</b>，寫作 <b>${target}</b>。` };
  }
}));
// 形近符號辨別
SIMILAR.forEach(([a, b]) => BOPO.push({
  k: `b.sim.${a}${b}`, g: '形近符號', subj: 'bopo', cur: ['Aa-I-1'],
  make: () => {
    const t = pick([a, b]), partner = t === a ? b : a;
    const others = shuffle(ALLSYM.filter(x => x !== t && x !== partner)).slice(0, 2);
    return { ask: '哪一個跟上面一樣？', zy: zhuyin([t]),
      choices: shuffle([t, partner, ...others]).map(z => ({ zy: [z], ok: z === t })),
      hint: `<b>${a}</b> 和 <b>${b}</b> 長得像，要看清楚筆畫差在哪裡。` };
  }
}));

/* ---------- 注音筆順 ---------- */
const BOPOW: Item[] = Object.keys(BGLYPH).map(ch => ({
  k: `bw.${ch}`, g: '注音描寫', subj: 'bopow', cur: ['Aa-I-1'],
  make: () => ({ kind: 'draw' as const, ch, ask: `把「${ch}」描一次` })
}));

export { BOPO, BOPOW };
