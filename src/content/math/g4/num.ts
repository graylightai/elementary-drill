/* ---------- 四年級：大數、概數、二位小數、假分數帶分數、等值分數、分數小數數線 ----------
   N-4-1 一億以內的數：萬、十萬、百萬、千萬；「30 萬 1200」這種寫法的加減。
   N-4-4 概數：四捨五入、無條件進入、無條件捨去，「≈」。
   N-4-5 同分母分數：真分數、假分數、帶分數，互換、比較、加減、整數倍。
   N-4-6 等值分數：簡單異分母（一個分母是另一個的倍數）比較加減；分數小數互換只用分母 2、5、10、100。
   N-4-7 二位小數：百分位，比較、加減、整數倍。內部用「幾個 0.01」的整數算。
   N-4-8 數線上的分數小數：標記限一位小數、分母不大於 5。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const N: Item[] = [];
const fr = (a: number | string, b: number) => `<span class="fr"><i>${a}</i><i>${b}</i></span>`;
/** 帶分數：w 又 a/b；w 為 0 時就是真分數 */
const mixed = (w: number, a: number, b: number) => a === 0 ? `${w}` : `${w ? `<b class="mw">${w}</b>` : ''}${fr(a, b)}`;
const big = (html: string) => `<span class="frbig">${html}</span>`;
const hund = (n: number) => (n / 100).toFixed(2).replace(/\.?0+$/, '');   // 幾個 0.01 → 小數字串

/* ===== 一億以內的數 ===== */
/** 中文的「幾萬幾千」寫法 */
const wan = (n: number) => { const w = Math.floor(n / 10000), r = n % 10000; return w ? `${w} 萬${r ? ` ${r}` : ''}` : String(r); };
N.push({
  k: 'n4.read', g: '一億以內的數', subj: 'num', cur: ['N-4-1'], vids: ['OXsnddZ7N4Y', 'gcg-6XHNhzs'],
  make: () => {
    const w = 1 + rnd(9999), r = pick([0, rnd(10000), 1000 * (1 + rnd(9)), 100 + rnd(900)]), n = w * 10000 + r;
    const squeeze = Number(`${w}${r || ''}`);                 // 漏寫 0 的錯：3507 萬 200 寫成 3507200
    return { ask: `「${wan(n)}」寫成數字是多少？`,
      choices: shuffle(uniq([n, squeeze, w * 1000 + r, n * 10].filter(v => v > 0))).slice(0, 4).map(v => ({ t: v.toLocaleString('en-US'), ok: v === n })),
      hint: `萬的部分寫 ${w}，後面一定還有<b>四位</b>（千、百、十、個）。${r} 不滿四位就在前面補 0：<b>${n.toLocaleString('en-US')}</b>。` };
  }
});
N.push({
  k: 'n4.digit', g: '萬、十萬、百萬、千萬', subj: 'num', cur: ['N-4-1'], vids: ['OXsnddZ7N4Y'],
  make: () => {
    const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 8), n = Number(ds.join(''));
    const names = ['千萬位', '百萬位', '十萬位', '萬位', '千位', '百位', '十位', '個位'], i = rnd(8);
    return { ask: `${n.toLocaleString('en-US')} 的${names[i]}是幾？`, big: n.toLocaleString('en-US'),
      choices: shuffle(uniq([ds[i], ds[(i + 1) % 8], ds[(i + 7) % 8], ds[(i + 4) % 8]])).map(v => ({ t: v, ok: v === ds[i] })),
      hint: `從個位往左數：個、十、百、千、萬、十萬、百萬、千萬。${names[i]}是 <b>${ds[i]}</b>。` };
  }
});
N.push({
  k: 'n4.add', g: '大數加減（萬）', subj: 'num', cur: ['N-4-1'], vids: ['dRVI-_FylBo'],
  make: () => {
    let a1 = 10 + rnd(60), a2 = 100 * rnd(50), b1 = 5 + rnd(30), b2 = 100 * rnd(50);
    const add = rnd(2) === 0;
    if (!add && b1 * 10000 + b2 >= a1 * 10000 + a2) [a1, a2, b1, b2] = [b1 + a1, a2 + b2, b1, b2];   // 減法保證夠減
    const A = a1 * 10000 + a2, B = b1 * 10000 + b2, ans = add ? A + B : A - B;
    return { ask: `${wan(A)} ${add ? '＋' : '－'} ${wan(B)} ＝ ？`,
      choices: shuffle(uniq([ans, ans + 10000, ans - 10000, add ? a1 + b1 + a2 + b2 : ans + 1000].filter(v => v > 0))).slice(0, 4).map(v => ({ t: wan(v), ok: v === ans })),
      hint: `萬和萬${add ? '加' : '減'}、後面四位和後面四位${add ? '加' : '減'}：${a1}${add ? '＋' : '－'}${b1} 萬，${a2}${add ? '＋' : '－'}${b2}。答案 <b>${wan(ans)}</b>。` };
  }
});

/* ===== 概數 ===== */
const PLACES: [string, number][] = [['百位', 100], ['千位', 1000], ['萬位', 10000]];
const ROUND: [string, string, (x: number) => number, string][] = [
  ['round', '四捨五入', Math.round, '_zsaPNAle0o'],
  ['ceil', '無條件進入', Math.ceil, 'f1Fbr4jEmwM'],
  ['floor', '無條件捨去', Math.floor, 'OYNEQfFUAOw'],
];
ROUND.forEach(([id, nm, fn, vid]) => N.push({
  k: `appr.${id}`, g: `概數（${nm}）`, subj: 'num', cur: ['N-4-4'], vids: [vid, 'yoH_YGRis4o'],
  make: () => {
    const [pn, p] = pick(PLACES);
    let n: number; do n = p * (2 + rnd(80)) + rnd(p); while (n % p === 0 || n > 99999999);
    const ans = fn(n / p) * p, other = [Math.round(n / p) * p, Math.ceil(n / p) * p, Math.floor(n / p) * p, ans + p];
    const nextDigit = Math.floor((n % p) / (p / 10));
    return { ask: `${n.toLocaleString('en-US')} 用${nm}法取到${pn}，大約是多少？`,
      choices: shuffle(uniq([ans, ...other])).slice(0, 4).map(v => ({ t: `≈ ${v.toLocaleString('en-US')}`, ok: v === ans })),
      hint: id === 'round' ? `看${pn}右邊那一位：是 <b>${nextDigit}</b>，${nextDigit >= 5 ? '5 以上要進 1' : '4 以下捨去'}。所以 ≈ <b>${ans.toLocaleString('en-US')}</b>。`
        : id === 'ceil' ? `無條件進入：${pn}右邊只要不是全部 0，就<b>進 1</b>。≈ <b>${ans.toLocaleString('en-US')}</b>。`
        : `無條件捨去：${pn}右邊的<b>全部變成 0</b>，不管多大。≈ <b>${ans.toLocaleString('en-US')}</b>。` };
  }
}));
N.push({
  k: 'appr.use', g: '用概數估算', subj: 'num', cur: ['N-4-4'], vids: ['PreckbC4R1M'],
  make: () => {
    const items = Array.from({ length: 3 }, () => 100 * (2 + rnd(7)) + pick([-1, 1]) * (5 + rnd(40)));
    const ans = items.reduce((a, x) => a + Math.round(x / 100) * 100, 0);
    return { ask: `買了 ${items.join(' 元、')} 元三樣東西，用四捨五入取到百位估算，大約要多少錢？`,
      choices: shuffle(uniq([ans, ans + 100, ans - 100, ans + 200])).map(v => ({ t: `≈ ${v} 元`, ok: v === ans })),
      hint: `每一樣先取概數：${items.map(x => `${x}≈${Math.round(x / 100) * 100}`).join('、')}；加起來 ≈ <b>${ans}</b> 元。` };
  }
});

/* ===== 二位小數 ===== */
N.push({
  k: 'dec2.read', g: '二位小數', subj: 'num', cur: ['N-4-7'], vids: ['rMnp5nTHW_A'],
  make: () => {
    const a = rnd(10), b = rnd(10), c = 1 + rnd(9), n = a * 100 + b * 10 + c;
    return pick([
      { ask: `${a} 個 1、${b} 個 0.1、${c} 個 0.01 是多少？`,
        choices: shuffle(uniq([hund(n), hund(a * 100 + c * 10 + b), `${a}.${c}${b}`, hund(a * 100 + b * 10)]).filter(Boolean)).slice(0, 4).map(v => ({ t: v, ok: v === hund(n) })),
        hint: `小數點後第一位是十分位（0.1）、第二位是<b>百分位</b>（0.01）：<b>${hund(n)}</b>。` },
      { ask: `${n} 個 0.01 是多少？`,
        choices: shuffle(uniq([hund(n), hund(n * 10), String(n / 10), hund(Math.floor(n / 10))])).slice(0, 4).map(v => ({ t: v, ok: v === hund(n) })),
        hint: `100 個 0.01 是 1。${n} 個 0.01 是 <b>${hund(n)}</b>。` },
    ]);
  }
});
N.push({
  k: 'dec2.cmp', g: '二位小數比大小', subj: 'num', cur: ['N-4-7'], vids: ['RETIi3Lmsqc'],
  make: () => {
    // 專門出 0.7 和 0.65 這種「位數多不代表比較大」的
    const t = 1 + rnd(8), a = t * 10, b = (t - 1) * 10 + 1 + rnd(9);   // 例如 0.7（70 個 0.01）對 0.65
    const [x, y] = shuffle([a, b]), sym = x > y ? '＞' : '＜';
    return { ask: '中間要填哪一個？', big: `0.${String(x).padStart(2, '0').replace(/0$/, '')}　□　0.${String(y).padStart(2, '0').replace(/0$/, '')}`,
      choices: ['＞', '＜', '＝'].map(s => ({ t: s, ok: s === sym })),
      hint: `先比十分位，一樣才比百分位。0.${String(a).padStart(2, '0').replace(/0$/, '')} 就是 0.${String(a).padStart(2, '0')}，十分位 ${t} 比 ${t - 1} 大。不是位數多的就比較大。` };
  }
});
(['add', 'sub', 'mul'] as const).forEach(op => N.push({
  k: `dec2.${op}`, g: { add: '二位小數加法', sub: '二位小數減法', mul: '小數的整數倍' }[op], subj: 'num', cur: ['N-4-7'],
  vids: [op === 'mul' ? 'NKaSoiMIheA' : 'MrgEinAKBgQ'],
  make: () => {
    if (op === 'mul') {
      const a = 101 + rnd(400), k = 2 + rnd(7), r = a * k;
      return { ask: '算算看', big: `${hund(a)} × ${k}`,
        choices: shuffle(uniq([hund(r), hund(r * 10), hund(Math.round(r / 10)), hund(r + a)])).slice(0, 4).map(v => ({ t: v, ok: v === hund(r) })),
        hint: `先當整數算：${a}×${k}＝${r}；${hund(a)} 有兩位小數，答案也要兩位：<b>${hund(r)}</b>。` };
    }
    let a = 100 + rnd(900), b = 10 + rnd(500); if (op === 'sub' && b > a) [a, b] = [b, a];
    const r = op === 'add' ? a + b : a - b;
    // 小數點沒對齊的錯：把 0.5 當 0.05
    return { ask: '小數點對齊，算算看', big: `${hund(a)} ${op === 'add' ? '＋' : '－'} ${hund(b)}`,
      choices: shuffle(uniq([hund(r), hund(r + 10), hund(Math.abs(r - 10)), hund(r + 100)])).slice(0, 4).map(v => ({ t: v, ok: v === hund(r) })),
      hint: `小數點對齊，想成幾個 0.01：${a} ${op === 'add' ? '＋' : '－'} ${b} ＝ ${r}，就是 <b>${hund(r)}</b>。` };
  }
}));

/* ===== 假分數、帶分數 ===== */
N.push({
  k: 'fr4.mixed', g: '假分數和帶分數互換', subj: 'frac', cur: ['N-4-5'], vids: ['CHETvzgpL4o', 'u_cEQwixc_0'],
  make: () => {
    const b = 2 + rnd(7), w = 1 + rnd(4), a = 1 + rnd(b - 1), top = w * b + a;
    if (rnd(2)) return { ask: '換成帶分數是多少？', art: big(fr(top, b)),
      choices: shuffle(uniq([`${w}|${a}`, `${a}|${w}`, `${w + 1}|${a}`, `${w}|${b - a}`])).map(s => { const [x, y] = s.split('|').map(Number); return { art: big(mixed(x, y, b)), ok: x === w && y === a }; }),
      hint: `${top} 裡面有幾個 ${b}？${b}×${w}＝${w * b}，還剩 ${a}：${big(mixed(w, a, b))}。` };
    return { ask: '換成假分數是多少？', art: big(mixed(w, a, b)),
      choices: shuffle(uniq([top, w + a, w * a + b, top + b])).map(t => ({ art: big(fr(t, b)), ok: t === top })),
      hint: `${w} 個 1 是 ${w * b} 個 ${fr(1, b)}，再加 ${a} 個：${w * b}＋${a}＝${top}，是 ${big(fr(top, b))}。` };
  }
});
N.push({
  k: 'fr4.addmul', g: '帶分數加減與整數倍', subj: 'frac', cur: ['N-4-5'], vids: ['_YOxwubFRR4', 'Su8gB_Fkfv4'],
  make: () => {
    const b = 3 + rnd(6), a = 1 + rnd(b - 1), k = 2 + rnd(4), top = a * k, w = Math.floor(top / b), r = top % b;
    return { ask: `${fr(a, b)} 的 ${k} 倍是多少？`,
      choices: shuffle(uniq([`${top}|${b}`, `${a}|${b * k}`, `${a + k}|${b}`, `${top}|${b * k}`]))
        .map(s => { const [x, y] = s.split('|').map(Number); return { art: big(fr(x, y)), ok: x === top && y === b }; }),
      hint: `${fr(a, b)} 是 ${a} 個 ${fr(1, b)}，${k} 倍就是 ${a}×${k}＝${top} 個 ${fr(1, b)}：${big(fr(top, b))}${w ? `，也就是 ${big(mixed(w, r, b))}` : ''}。分母不變。` };
  }
});

/* ===== 等值分數、分數小數互換 ===== */
N.push({
  k: 'fr4.equiv', g: '等值分數', subj: 'frac', cur: ['N-4-6'], vids: ['hZ9Bc9TLvIM'],
  make: () => {
    const b = 2 + rnd(5), a = 1 + rnd(b - 1), k = 2 + rnd(4);
    return { ask: `${fr(a, b)} ＝ ${fr('？', b * k)}，？是多少？`,
      choices: distract(a * k, 1, 30).map(v => ({ t: v, ok: v === a * k })),
      hint: `分母乘 ${k}，分子也要乘 ${k}：${a}×${k}＝<b>${a * k}</b>。切得更細，塊數變多，但大小一樣。` };
  }
});
N.push({
  k: 'fr4.cmp', g: '異分母比大小', subj: 'frac', cur: ['N-4-6'], vids: ['B74zYaNOjCk'],
  make: () => {
    const b = 2 + rnd(4), k = 2 + rnd(2), a = 1 + rnd(b - 1); let c = 1 + rnd(b * k - 1); while (c === a * k) c = 1 + rnd(b * k - 1);
    const sym = a * k > c ? '＞' : '＜';
    return { ask: '中間要填哪一個？', art: `<div class="frrow">${fr(a, b)}<span>□</span>${fr(c, b * k)}</div>`,
      choices: ['＞', '＜', '＝'].map(s => ({ t: s, ok: s === sym })),
      hint: `先換成一樣的分母：${fr(a, b)} ＝ ${fr(a * k, b * k)}，再比 ${a * k} 和 ${c}：${fr(a, b)} ${sym} ${fr(c, b * k)}。` };
  }
});
const FD: [number, number, string][] = [[1, 2, '0.5'], [1, 5, '0.2'], [2, 5, '0.4'], [3, 5, '0.6'], [4, 5, '0.8'], [3, 10, '0.3'], [7, 10, '0.7'], [9, 10, '0.9'], [1, 4, '0.25'], [3, 4, '0.75'], [7, 100, '0.07'], [23, 100, '0.23']];
N.push({
  k: 'fr4.dec', g: '分數和小數互換', subj: 'frac', cur: ['N-4-6'], vids: ['dLRGvd3USFU'],
  make: () => {
    const [a, b, d] = pick(FD), wrong = uniq([d, `${a}.${b}`, `0.${a}`, (a / b * 10).toFixed(1)].filter(x => x !== d));
    return { ask: `${fr(a, b)} 換成小數是多少？`,
      choices: shuffle([d, ...wrong.slice(0, 3)]).map(t => ({ t, ok: t === d })),
      hint: `先換成分母 10 或 100 的分數：${fr(a, b)} ＝ ${b === 10 || b === 100 ? fr(a, b) : b === 4 ? fr(a * 25, 100) : fr(a * (10 / b), 10)}，就是 <b>${d}</b>。不是把分子分母寫在小數點兩邊。` };
  }
});

/* ===== 數線上的分數、小數 ===== */
N.push({
  k: 'nl4', g: '數線上的分數小數', subj: 'num', cur: ['N-4-8'], vids: ['Dh2S0-O1o50', 'lgfEToUwj6g', '3dLo2exBmKs'],
  make: () => {
    const asDec = rnd(2) === 0, parts = asDec ? 10 : pick([2, 3, 4, 5]);
    let mark: number; do mark = 1 + rnd(parts * 2 - 1); while (mark === parts);   // 剛好是 1 就不考
    const u = 300 / (parts * 2);
    let s = `<line x1="10" y1="40" x2="320" y2="40" class="nl-axis"/>`;
    for (let i = 0; i <= parts * 2; i++) s += `<line x1="${10 + i * u}" y1="${i % parts ? 34 : 28}" x2="${10 + i * u}" y2="46" class="nl-tick"/>${i % parts === 0 ? `<text x="${10 + i * u}" y="64" class="nl-num">${i / parts}</text>` : ''}`;
    s += `<polygon points="${10 + mark * u - 7},12 ${10 + mark * u + 7},12 ${10 + mark * u},24" class="nl-mark"/>`;
    const art = `<svg viewBox="0 0 330 72" width="320" class="nline">${s}</svg>`;
    if (asDec) {
      const ans = (mark / 10).toFixed(1).replace(/\.0$/, '');
      return { ask: '箭頭指的是多少？（用小數回答）', art,
        choices: shuffle(uniq([ans, String(mark), ((mark + 1) / 10).toFixed(1), ((mark - 1) / 10).toFixed(1)])).slice(0, 4).map(t => ({ t, ok: t === ans })),
        hint: `0 到 1 之間切成 10 小格，一格是 0.1。箭頭在第 ${mark} 格：<b>${ans}</b>。` };
    }
    return { ask: '箭頭指的是多少？（用分數回答）', art,
      choices: shuffle(uniq([`${mark}|${parts}`, `${mark}|${parts * 2}`, `${mark + 1}|${parts}`, `1|${mark}`])).map(x => { const [p, q] = x.split('|').map(Number); return { art: big(fr(p, q)), ok: p === mark && q === parts }; }),
      hint: `0 到 1 之間切成 <b>${parts}</b> 小格，一格是 ${fr(1, parts)}。箭頭在第 ${mark} 格：${big(fr(mark, parts))}。` };
  }
});

export { N as NUM_G4 };
