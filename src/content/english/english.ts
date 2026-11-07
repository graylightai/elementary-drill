import type { Item } from '../../types';
import { pick, shuffle, uniq } from '../../util';
import { WORDS } from '../words';
import { zhuyin } from '../../ui/visuals/zhuyin';
import { CHIP, COLORS } from '../../ui/visuals/color';

/* ---------- 英文（初學者） ----------
   原則：只用 5 個字母以內的短單字；干擾項一律是「別的真單字」，不是拼錯的字。
   拼字錯誤偵測（dog / bog / dag）對剛起步的孩子太難，而且練的不是認單字。
   b/d/p/q、m/n、u/v 這些形近字母只用在「字母」類的題目上。 */
const CONFUSE: Record<string, string> = { b:'dpq', d:'bpq', p:'bdq', q:'bdp', m:'nw', n:'mur', u:'vnw', v:'uwy',
  w:'vmu', i:'jl', j:'ig', l:'it', g:'qj', s:'z', z:'s', f:'t', t:'fl', c:'eo', e:'co',
  o:'ceq', a:'oe', h:'nk', k:'xh', r:'nv', x:'yk', y:'vx' };
const AZ = 'abcdefghijklmnopqrstuvwxyz'.split('');
const ENGLISH: Item[] = [];

// 1) 大小寫對應
AZ.forEach(l => {
  const U = l.toUpperCase();
  ENGLISH.push({ k: `e.up.${l}`, g: '大寫找小寫', subj: 'eng', cur: [],
    make: () => {
      const near = (CONFUSE[l] || '').split('').filter(Boolean);
      const others = shuffle(uniq([...near, ...AZ]).filter(c => c !== l)).slice(0, 3);
      return { ask: '哪一個是它的小寫？', en: U,
        choices: shuffle([l, ...others]).map(c => ({ en: c, big: true, ok: c === l })),
        hint: `<b>${U}</b> 的小寫是 <b>${l}</b>。` };
    } });
  ENGLISH.push({ k: `e.low.${l}`, g: '小寫找大寫', subj: 'eng', cur: [],
    make: () => {
      const near = (CONFUSE[l] || '').split('').map(c => c.toUpperCase());
      const others = shuffle(uniq([...near, ...AZ.map(c => c.toUpperCase())]).filter(c => c !== U)).slice(0, 3);
      return { ask: '哪一個是它的大寫？', en: l,
        choices: shuffle([U, ...others]).map(c => ({ en: c, big: true, ok: c === U })),
        hint: `<b>${l}</b> 的大寫是 <b>${U}</b>。` };
    } });
});

// 2) 字母順序：ABC 背得出來，但「B 的下一個」才是真的記住
AZ.slice(0, 25).forEach((l, i) => ENGLISH.push({
  k: `e.abc.${l}`, g: '字母順序', subj: 'eng', cur: [],
  make: () => {
    const ans = AZ[i + 1];
    const others = shuffle(AZ.filter(c => c !== ans && c !== l)).slice(0, 3);
    return { ask: `${l.toUpperCase()} 的下一個字母是？`, en: l.toUpperCase(),
      choices: shuffle([ans, ...others]).map(c => ({ en: c.toUpperCase(), big: true, ok: c === ans })),
      hint: `${AZ.slice(Math.max(0, i - 1), i + 3).map(c => c.toUpperCase()).join(' ')}
        —— <b>${l.toUpperCase()}</b> 的下一個是 <b>${ans.toUpperCase()}</b>。` };
  }
}));

// 3) 單字：用白名單，不是用長度篩。
//    「5 個字母以內」會放進 boar / llama / sloth / squid 這種初學者沒學過的字——
//    字短不等於學過。這裡只留小一英文課真的會出現的。
const BEGINNER = new Set(['cat','dog','pig','cow','duck','hen','bird','bee','ant','fox',
  'frog','bear','lion','tiger','horse','sheep','mouse','snake','panda','whale','shark',
  'crab','star','apple','pear','peach','cake','robot','ghost','heart','deer','wolf','owl']);
const ENG_WORDS = WORDS.filter(w => BEGINNER.has(w[3]));
ENG_WORDS.forEach(([slug, ch, zy, en]) => {
  ENGLISH.push({ k: `e.pic.${slug}`, g: '看單字選圖', subj: 'eng', cur: [],
    make: () => {
      const others = shuffle(ENG_WORDS.filter(w => w[0] !== slug)).slice(0, 3);
      return { ask: '這是什麼？', en,
        choices: shuffle([slug, ...others.map(o => o[0])]).map(s2 => ({ img: s2, ok: s2 === slug })),
        hint: `<b>${en}</b> 是「${ch}」。` };
    } });
  ENGLISH.push({ k: `e.word.${slug}`, g: '看圖選單字', subj: 'eng', cur: [],
    make: () => {
      const others = shuffle(ENG_WORDS.filter(w => w[3] !== en)).slice(0, 3);
      return { ask: '這個的英文是哪一個？', img: slug, sub: zhuyin(zy, ch),
        choices: shuffle([en, ...others.map(o => o[3])]).map(w => ({ en: w, ok: w === en })),
        hint: `${ch}是 <b>${en}</b>。` };
    } });
});

// 4) 開頭字母：自然發音的第一步
uniq(ENG_WORDS.map(w => w[3][0])).forEach(letter => ENGLISH.push({
  k: `e.first.${letter}`, g: '開頭字母', subj: 'eng', cur: [],
  make: () => {
    const w = pick(ENG_WORDS.filter(x => x[3][0] === letter));
    const near = (CONFUSE[letter] || '').split('').filter(Boolean);
    const others = shuffle(uniq([...near, ...AZ]).filter(c => c !== letter)).slice(0, 3);
    return { ask: `「${w[1]}」是 ${w[3].slice(1)}…，開頭是哪個字母？`, img: w[0],
      choices: shuffle([letter, ...others]).map(c => ({ en: c, big: true, ok: c === letter })),
      hint: `<b>${w[3]}</b>，開頭是 <b>${letter}</b>。` };
  }
}));

// 5) 數字 1–10，兩個方向都練
const NUMEN = ['one','two','three','four','five','six','seven','eight','nine','ten'];
NUMEN.forEach((w, i) => {
  const n = i + 1;
  ENGLISH.push({ k: `e.num.${n}`, g: '數字英文', subj: 'eng', cur: [],
    make: () => ({ ask: '這個數字的英文是？', big: String(n),
      choices: shuffle([w, ...shuffle(NUMEN.filter(x => x !== w)).slice(0, 3)])
        .map(x => ({ en: x, ok: x === w })),
      hint: `<b>${n}</b> 是 <b>${w}</b>。` }) });
  ENGLISH.push({ k: `e.numr.${n}`, g: '英文數字認讀', subj: 'eng', cur: [],
    make: () => ({ ask: '這個英文是哪個數字？', en: w,
      choices: shuffle([n, ...shuffle(NUMEN.map((_, j) => j + 1).filter(x => x !== n)).slice(0, 3)])
        .map(x => ({ t: x, ok: x === n })),
      hint: `<b>${w}</b> 是 <b>${n}</b>。` }) });
});

// 6) 顏色英文：看色塊選字
const COLEN = [['紅','red'],['黃','yellow'],['藍','blue'],['橙','orange'],['綠','green'],
  ['紫','purple'],['白','white'],['黑','black'],['棕','brown'],['粉紅','pink'],['灰','grey']];
COLEN.forEach(([zh, en]) => ENGLISH.push({
  k: `e.col.${en}`, g: '顏色英文', subj: 'eng', cur: [],
  make: () => ({ ask: '這是什麼顏色？', art: `<div class="mixrow">${CHIP(COLORS[zh], 86)}</div>`,
    choices: shuffle([en, ...shuffle(COLEN.filter(c => c[1] !== en)).slice(0, 3).map(c => c[1])])
      .map(w => ({ en: w, ok: w === en })),
    hint: `這個顏色是 <b>${en}</b>（${zh}）。` })
}));

export { ENGLISH };
