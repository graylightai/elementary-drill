/* ---------- 四年級：公里、平方公尺、體積、時間（跨午跨日、24 小時制）、面積周長公式 ----------
   N-4-9 公里與其他長度單位換算；N-4-11 平方公尺（不做平方公分換平方公尺、不用複名數）；
   N-4-12／S-4-4 體積：1 立方公分的正方體堆疊計數；
   N-4-13 跨時、跨午、跨日、24 小時制；
   S-4-3／R-4-3 長方形正方形的面積周長公式（邊長限整數），簡單複合圖形限兩個長方形組合。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const M: Item[] = [];

/* ===== 公里 ===== */
M.push({
  k: 'km.conv', g: '公里和公尺', subj: 'cmp', cur: ['N-4-9'], vids: ['qip1WNowEdc', 'bsG8QOussX8'],
  make: () => {
    const k = 1 + rnd(9), m = pick([0, 50, 300, 450, 800, 25]), ans = k * 1000 + m;
    return pick([
      { ask: `${k} 公里${m ? ` ${m} 公尺` : ''} ＝ 幾公尺？`, choices: shuffle(uniq([ans, k * 100 + m, k * 10000 + m, k + m])).map(v => ({ t: `${v} 公尺`, ok: v === ans })),
        hint: `1 公里 ＝ <b>1000</b> 公尺。${k} 公里是 ${k * 1000} 公尺${m ? `，再加 ${m}，一共 <b>${ans}</b> 公尺` : ''}。` },
      { ask: '從家裡走到學校大約 1 ？，下面哪一個單位最合適？', choices: shuffle(['公里', '公分', '毫米', '公尺']).map(t => ({ t, ok: t === '公里' })),
        hint: '走路要十幾分鐘的距離，用<b>公里</b>最合適。1 公里大約是操場跑 5 圈。' },
    ]);
  }
});
M.push({
  k: 'km.add', g: '公里公尺加減', subj: 'cmp', cur: ['N-4-9'], vids: ['T1UZLMAxoxo'],
  make: () => {
    const a = 1 + rnd(5), am = 100 * (1 + rnd(8)), b = 1 + rnd(4), bm = 100 * (1 + rnd(8)), tot = (a + b) * 1000 + am + bm;
    const ans = `${Math.floor(tot / 1000)} 公里 ${tot % 1000} 公尺`;
    return { ask: `先騎車 ${a} 公里 ${am} 公尺，再走路 ${b} 公里 ${bm} 公尺，一共多遠？`,
      choices: shuffle(uniq([ans, `${a + b} 公里 ${am + bm} 公尺`, `${Math.floor(tot / 1000) + 1} 公里 ${tot % 1000} 公尺`, `${a + b} 公里 ${(am + bm) % 1000} 公尺`])).map(t => ({ t, ok: t === ans })),
      hint: `公尺加起來 ${am}＋${bm}＝${am + bm}${am + bm >= 1000 ? `，滿 1000 公尺要<b>進 1 公里</b>` : ''}。一共 <b>${ans}</b>。` };
  }
});

/* ===== 面積周長公式、平方公尺 ===== */
M.push({
  k: 'ap.formula', g: '面積和周長（公式）', subj: 'shape', cur: ['S-4-3', 'R-4-3'], vids: ['k6wQVwE-q3g', 'lAmYJaTDCOw', 'niBwLeTdo7M'],
  make: () => {
    const sq = rnd(3) === 0, l = 3 + rnd(12), w = sq ? l : 2 + rnd(l - 2), area = rnd(2) === 0;   // 長方形的寬一定比長短
    const unit = pick(['公分', '公尺']), ans = area ? l * w : 2 * (l + w);
    const name = sq ? '正方形' : '長方形';
    return { ask: sq ? `正方形的邊長是 ${l} ${unit}，${area ? '面積' : '周長'}是多少？` : `長方形長 ${l} ${unit}、寬 ${w} ${unit}，${area ? '面積' : '周長'}是多少？`,
      choices: shuffle(uniq([ans, area ? 2 * (l + w) : l * w, area ? l + w : l + w, area ? l * w * 2 : 4 * l].filter(v => v > 0)))
        .map(v => ({ t: `${v} ${(area ? `平方${unit}` : unit)}`, ok: v === ans })),
      hint: area ? `${name}面積 ＝ ${sq ? '邊長 × 邊長' : '長 × 寬'}：${l}×${w}＝<b>${ans}</b> 平方${unit}。面積的單位是「平方」。`
                 : `${name}周長 ＝ ${sq ? '邊長 × 4' : '(長＋寬) × 2'}：${sq ? `${l}×4` : `(${l}＋${w})×2`}＝<b>${ans}</b> ${unit}。` };
  }
});
M.push({
  k: 'ap.compound', g: '複合圖形的面積', subj: 'shape', cur: ['S-4-3'], vids: ['XKegGJ4CbDw', 'WIPmbwzdD4k'],
  make: () => {
    // L 形 = 大長方形 W×H 切掉右上角 cw×ch
    const W = 6 + rnd(5), H = 5 + rnd(4), cw = 2 + rnd(W - 4), ch = 2 + rnd(H - 4), area = W * H - cw * ch, u = 16;
    const pts = `0,0 ${(W - cw) * u},0 ${(W - cw) * u},${ch * u} ${W * u},${ch * u} ${W * u},${H * u} 0,${H * u}`;
    const art = `<svg viewBox="-34 -22 ${W * u + 70} ${H * u + 44}" width="250" class="per"><polygon points="${pts}" class="per-r"/>
      <text x="${(W - cw) * u / 2}" y="-6" class="per-t">${W - cw}</text><text x="${W * u + 6}" y="${(ch + H) * u / 2 + 4}" class="per-t" text-anchor="start">${H - ch}</text>
      <text x="${W * u / 2}" y="${H * u + 16}" class="per-t">${W}</text><text x="-6" y="${H * u / 2 + 4}" class="per-t" text-anchor="end">${H}</text></svg>`;
    return { ask: '這個圖形的面積是幾平方公分？（單位：公分）', art,
      choices: shuffle(uniq([area, W * H, area + cw * ch / 2 | 0, (W - cw) * H])).map(v => ({ t: `${v} 平方公分`, ok: v === area })),
      hint: `把它看成大長方形 ${W}×${H}＝${W * H}，再減掉右上角缺的 ${cw}×${ch}＝${cw * ch}：<b>${area}</b> 平方公分。也可以切成兩個長方形相加。` };
  }
});

M.push({
  k: 'sqm', g: '平方公尺', subj: 'cmp', cur: ['N-4-11'], vids: ['iMKDPeiBCpI'],
  make: () => {
    const l = 4 + rnd(9), w = 3 + rnd(6);
    return pick([
      { ask: `教室長 ${l} 公尺、寬 ${w} 公尺，地板的面積是幾平方公尺？`,
        choices: shuffle(uniq([l * w, 2 * (l + w), l + w, l * w * 10])).map(v => ({ t: `${v} 平方公尺`, ok: v === l * w })),
        hint: `長 × 寬：${l}×${w}＝<b>${l * w}</b> 平方公尺。1 平方公尺是邊長 1 公尺的正方形，大約可以站 6～8 個小朋友。` },
      { ask: '一間教室的地板，面積大約是 60 ？，哪一個單位最合適？',
        choices: shuffle(['平方公尺', '平方公分', '公尺', '立方公分']).map(t => ({ t, ok: t === '平方公尺' })),
        hint: '面積要用「平方」的單位。教室很大，用<b>平方公尺</b>；平方公分是指甲那麼小的格子。' },
    ]);
  }
});

/* ===== 體積：數立方公分 ===== */
function box(l: number, w: number, h: number): string {
  const s = 16, dx = s * .55, dy = s * .45;
  let out = '';
  for (let z = 0; z < h; z++) for (let y = w - 1; y >= 0; y--) for (let x = 0; x < l; x++) {
    const X = 10 + x * s + y * dx, Y = 10 + (h - z) * s + (w - 1 - y) * dy + 10;
    out += `<polygon points="${X},${Y} ${X + s},${Y} ${X + s},${Y + s} ${X},${Y + s}" class="cb-f"/>
      <polygon points="${X},${Y} ${X + dx},${Y - dy} ${X + s + dx},${Y - dy} ${X + s},${Y}" class="cb-t"/>
      <polygon points="${X + s},${Y} ${X + s + dx},${Y - dy} ${X + s + dx},${Y + s - dy} ${X + s},${Y + s}" class="cb-s"/>`;
  }
  const W = 20 + l * s + w * dx, H = 30 + (h + 1) * s + w * dy;
  return `<svg viewBox="0 0 ${W} ${H}" width="${Math.min(260, W * 1.5)}" class="cubes">${out}</svg>`;
}
M.push({
  k: 'vol.count', g: '體積（數立方公分）', subj: 'shape', cur: ['N-4-12', 'S-4-4'], vids: ['Q27F4FX0ojg', 'ohsBxuz9x50'],
  make: () => {
    const l = 2 + rnd(4), w = 1 + rnd(3), h = 1 + rnd(3), v = l * w * h;
    return { ask: '每個小方塊是 1 立方公分。這個長方體的體積是幾立方公分？', art: box(l, w, h),
      choices: shuffle(uniq([v, l * h, l * w + h, v + l * w].filter(x => x > 0))).map(x => ({ t: `${x} 立方公分`, ok: x === v })),
      hint: `看不到的也要算。一層有 ${l}×${w}＝${l * w} 個，有 ${h} 層：${l * w}×${h}＝<b>${v}</b> 立方公分。` };
  }
});

/* ===== 時間：跨午、跨日、24 小時制 ===== */
const hm = (t: number) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
const zh = (t: number) => { const h = Math.floor(t / 60) % 24, m = t % 60; const p = h < 12 ? '上午' : '下午'; const hh = h % 12 || 12; return `${p} ${hh} 點${m ? ` ${m} 分` : ''}`; };
M.push({
  k: 't4.24h', g: '24 小時制', subj: 'clock', cur: ['N-4-13'], vids: ['HijAyF__Wyw'],
  make: () => {
    const t = (13 + rnd(10)) * 60 + 5 * rnd(12);
    return pick([
      { ask: `${hm(t)} 是下午幾點？`, choices: shuffle(uniq([zh(t), zh(t - 120), zh(t - 720 + 60), `下午 ${Math.floor(t / 60)} 點${t % 60 ? ` ${t % 60} 分` : ''}`])).map(x => ({ t: x, ok: x === zh(t) })),
        hint: `24 小時制下午的時刻減 12：${Math.floor(t / 60)}－12＝${Math.floor(t / 60) - 12}，所以是 <b>${zh(t)}</b>。` },
      { ask: `${zh(t)}，用 24 小時制怎麼寫？`, choices: shuffle(uniq([hm(t), hm(t - 720), hm(t + 60), hm(t - 600)])).map(x => ({ t: x, ok: x === hm(t) })),
        hint: `下午的時刻加 12：${Math.floor(t / 60) - 12}＋12＝${Math.floor(t / 60)}，寫成 <b>${hm(t)}</b>。` },
    ]);
  }
});
M.push({
  k: 't4.span', g: '經過多久（跨時跨午）', subj: 'clock', cur: ['N-4-13'], vids: ['xW4pQNPgwBw', 'UokhTe_8HKA'],
  make: () => {
    const s = (8 + rnd(5)) * 60 + 5 * (1 + rnd(11)), d = 40 + 5 * rnd(40), e = s + d;   // 起點不在整點，才需要分段算
    const ans = `${Math.floor(d / 60)} 小時 ${d % 60} 分`.replace(/^0 小時 /, '');
    const alt = (x: number) => `${Math.floor(x / 60)} 小時 ${x % 60} 分`.replace(/^0 小時 /, '');
    return { ask: `從 ${zh(s)} 到 ${zh(e)}，經過多久？`,
      choices: shuffle(uniq([ans, alt(d + 60), alt(Math.max(5, d - 20)), alt(d + 40)])).map(t => ({ t, ok: t === ans })),
      hint: `先算到整點：${zh(s)} 到 ${zh(Math.ceil(s / 60) * 60)} 是 ${Math.ceil(s / 60) * 60 - s} 分；再算到 ${zh(e)}。一共 <b>${ans}</b>。1 小時是 60 分，不能用 100 借。` };
  }
});

export { M as MEAS_G4 };
