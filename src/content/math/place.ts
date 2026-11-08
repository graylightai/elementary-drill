/* ---------- 位值 ----------
   一年級 N-1-1：一百以內的數，位值單位「個」「十」，十個一換一個十，0 的位值意義。
   二年級 N-2-1：一千以內的數，位值單位「百」；R-2-1：「>」「<」在算式中的意義。
   課綱備註：「學習 0 的位值意義以便順利連結日後直式計算」——所以專門出含 0 的題。
   最常見的錯：3 個十、5 個一寫成 53；4 個百、0 個十、6 個一寫成 46。干擾選項就放這些。 */
import type { Item, Choice } from '../../types';
import { rnd, pick, shuffle, uniq } from '../../util';
import { blocks } from '../../ui/visuals/numbers';

const P: Item[] = [];
const G1 = ['N-1-1'], G2 = ['N-2-1'];

/** 選項：正解＋常見錯誤，去重後補到 4 個 */
function opts(ans: number, wrongs: number[], lo: number, hi: number, fmt = (v: number) => String(v)): Choice[] {
  const out = uniq([ans, ...wrongs.filter(v => v >= lo && v <= hi && v !== ans)]).slice(0, 4);
  for (let g = 0; out.length < 4 && g < 100; g++) { const v = lo + rnd(hi - lo + 1); if (!out.includes(v)) out.push(v); }
  return shuffle(out).map(v => ({ t: fmt(v), ok: v === ans }));
}
const digits = (n: number) => ({ h: Math.floor(n / 100), t: Math.floor(n / 10) % 10, o: n % 10 });

/* ===== 一年級 ===== */
P.push({
  k: 'pv.read', g: '看積木說數字', subj: 'num', cur: G1,
  make: () => {
    const t = 1 + rnd(9), o = rnd(10), n = t * 10 + o;
    return { ask: '這些積木是多少？', art: blocks(0, t, o),
      choices: opts(n, [o * 10 + t, t + o, n + 10, n - 1], 1, 99),
      hint: `一條是 10，有 <b>${t}</b> 條就是 ${t * 10}；再加 <b>${o}</b> 個一，是 <b>${n}</b>。` };
  }
});
P.push({
  k: 'pv.split', g: '幾個十幾個一', subj: 'num', cur: G1,
  make: () => {
    const t = 1 + rnd(9), o = rnd(10), n = t * 10 + o;
    const f = (tt: number, oo: number) => `${tt} 個十、${oo} 個一`;
    const cand = uniq([f(t, o), f(o, t), f(t, o + 1 > 9 ? o - 1 : o + 1), f(t + 1 > 9 ? t - 1 : t + 1, o)]);
    return { ask: `${n} 是幾個十和幾個一？`, big: String(n),
      choices: shuffle(cand).map(c => ({ t: c, ok: c === f(t, o) })),
      hint: `${n} 的十位是 <b>${t}</b>、個位是 <b>${o}</b>：${f(t, o)}。` };
  }
});
P.push({
  k: 'pv.build', g: '湊成數字', subj: 'num', cur: G1,
  make: () => {
    const t = 1 + rnd(9), o = 1 + rnd(9), n = t * 10 + o;
    return { ask: `${t} 個十和 ${o} 個一是多少？`,
      choices: opts(n, [o * 10 + t, t + o, t * 100 + o], 1, 999),
      hint: `${t} 個十是 ${t * 10}，再加 ${o}，是 <b>${n}</b>。十位寫 ${t}、個位寫 ${o}。` };
  }
});
P.push({
  k: 'pv.zero', g: '0 的位值', subj: 'num', cur: G1,
  make: () => {
    const t = 1 + rnd(9), n = t * 10;
    return pick([
      { ask: `${t} 個十，0 個一，是多少？`, art: blocks(0, t, 0),
        choices: opts(n, [t, t * 100, n + 1], 1, 999),
        hint: `沒有一的時候，個位要寫 <b>0</b>，表示「沒有」：${t} 個十是 <b>${n}</b>，不是 ${t}。` },
      { ask: `${n} 的「0」是什麼意思？`, big: String(n),
        choices: shuffle(['個位沒有東西', '十位沒有東西', '0 可以不寫', '有 0 個十']).map(c => ({ t: c, ok: c === '個位沒有東西' })),
        hint: `${n} 是 ${t} 個十、0 個一。0 寫在個位，表示<b>個位沒有東西</b>；不寫 0 就變成 ${t} 了。` },
    ]);
  }
});
P.push({
  k: 'pv.digit', g: '十位和個位', subj: 'num', cur: G1,
  make: () => {
    let t = 1 + rnd(9), o = 1 + rnd(9); while (o === t) o = 1 + rnd(9);
    const n = t * 10 + o, askTen = rnd(2) === 0;
    return { ask: `${n} 的${askTen ? '十位' : '個位'}是幾？`, big: String(n),
      choices: opts(askTen ? t : o, [askTen ? o : t, n], 0, 99),
      hint: `${n}：左邊的 ${t} 在<b>十位</b>（${t} 個十），右邊的 ${o} 在<b>個位</b>（${o} 個一）。` };
  }
});
P.push({
  k: 'pv.100', g: '十個十是一百', subj: 'num', cur: G1,
  make: () => pick([
    { ask: '10 個十是多少？', art: blocks(0, 10, 0),
      choices: opts(100, [10, 1000, 20], 1, 1000),
      hint: '10、20、30……數到第 10 條是 <b>100</b>。' },
    { ask: '99 再多 1 是多少？', big: '99 ＋ 1',
      choices: opts(100, [910, 1000, 98], 1, 1000),
      hint: '個位 9 再加 1 滿 10，換成一個十；十位 9 再加 1 也滿 10，換成一個百：<b>100</b>。' },
  ])
});

/* ===== 二年級 ===== */
P.push({
  k: 'pv2.read', g: '看積木說三位數', subj: 'num', cur: G2,
  make: () => {
    const h = 1 + rnd(4), t = rnd(10), o = rnd(10), n = h * 100 + t * 10 + o;
    return { ask: '這些積木是多少？', art: blocks(h, t, o),
      choices: opts(n, [h * 100 + o * 10 + t, h * 10 + t + o, n + 100, n + 10], 100, 999),
      hint: `一片是 100、一條是 10：${h} 片、${t} 條、${o} 個，是 <b>${n}</b>。` };
  }
});
P.push({
  k: 'pv2.build', g: '幾個百幾個十幾個一', subj: 'num', cur: G2,
  make: () => {
    const h = 1 + rnd(9), t = rnd(10), o = rnd(10), n = h * 100 + t * 10 + o;
    return { ask: `${h} 個百、${t} 個十、${o} 個一是多少？`,
      choices: opts(n, [h * 100 + o * 10 + t, o * 100 + t * 10 + h, h * 10 + t * 10 + o, h + t + o], 1, 999),
      hint: `百位寫 ${h}、十位寫 ${t}、個位寫 ${o}：<b>${n}</b>。` };
  }
});
P.push({
  k: 'pv2.zero', g: '中間有 0 的數', subj: 'num', cur: G2,
  make: () => {
    const h = 1 + rnd(9), o = 1 + rnd(9), n = h * 100 + o;
    return { ask: `${h} 個百、0 個十、${o} 個一是多少？`, art: h <= 4 ? blocks(h, 0, o) : undefined,   // 百太多畫不下就不畫
      choices: opts(n, [h * 10 + o, h * 100 + o * 10, h + o], 1, 999),
      hint: `十位沒有東西也要寫 <b>0</b> 佔位置：${h}<b>0</b>${o}，是 <b>${n}</b>。不寫 0 就變成 ${h}${o} 了。` };
  }
});
P.push({
  k: 'pv2.digit', g: '百位十位個位', subj: 'num', cur: G2,
  make: () => {
    const ds = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]).slice(0, 3), n = ds[0] * 100 + ds[1] * 10 + ds[2];
    const which = pick(['百位', '十位', '個位'] as const), ans = ds[['百位', '十位', '個位'].indexOf(which)];
    return { ask: `${n} 的${which}是幾？`, big: String(n),
      choices: opts(ans, ds, 0, 9),
      hint: `${n}：${ds[0]} 在百位、${ds[1]} 在十位、${ds[2]} 在個位。` };
  }
});
P.push({
  k: 'pv2.cmp', g: '比大小（＞＜）', subj: 'num', cur: ['N-2-1', 'R-2-1'],
  make: () => {
    const a = 100 + rnd(900);
    // 一半的題目讓百位相同，逼她往下比十位
    const b = rnd(2) ? digits(a).h * 100 + rnd(100) : 100 + rnd(900);
    const sym = a > b ? '＞' : a < b ? '＜' : '＝';
    return { ask: '中間要填哪一個？', big: `${a}　□　${b}`,
      choices: ['＞', '＜', '＝'].map(s => ({ t: s, ok: s === sym })),
      hint: `先比百位，百位一樣再比十位，再比個位。${a} ${sym} ${b}。開口朝向比較大的數。` };
  }
});

export { P as PLACE };
