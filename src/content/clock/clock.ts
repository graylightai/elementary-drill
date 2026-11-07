import type { Item } from '../../types';
import { rnd, shuffle, uniq } from '../../util';
import { clockSVG, hhmm } from '../../ui/visuals/clock';

/* 拆到「每個時刻 / 每個金額」各自一個知識點，間隔重複才有意義，
   診斷也才看得出是哪幾點鐘、哪個找零會卡。 */
/* ---------- 時鐘（拿掉錢幣，只練看時刻，不出整點） ---------- */
const CLOCK: Item[] = [];
for (let m = 5; m <= 55; m += 5) CLOCK.push({
  k: `c.five.${m}`, g: '認到五分', subj: 'clock', cur: ['N-2-13'],
  make: () => { const h = 1 + rnd(12);
    return { ask: '現在幾點幾分？', svg: clockSVG(h, m),
      choices: shuffle(uniq([m, (m + 5) % 60, (m + 55) % 60, (m + 25) % 60]).slice(0, 4)
        .map(v => ({ t: hhmm(h, v), ok: v === m }))),
      hint: `長針每走一大格是 5 分鐘。它停在第 <b>${m / 5}</b> 格，${m / 5}×5＝<b>${m}</b> 分。` }; }
});
// 分針落在刻度之間，要自己判斷
for (let m = 1; m <= 59; m++) if (m % 5) CLOCK.push({
  k: `c.min.${m}`, g: '認到一分', subj: 'clock', cur: ['N-2-13'],
  make: () => { const h = 1 + rnd(12), base = Math.floor(m / 5) * 5;
    return { ask: '現在幾點幾分？', svg: clockSVG(h, m),
      choices: shuffle(uniq([m, m + 1, m - 1, m + 5 > 59 ? m - 5 : m + 5]).filter(v => v >= 0 && v < 60)
        .slice(0, 4).map(v => ({ t: hhmm(h, v), ok: v === m }))),
      hint: `長針過了第 ${base / 5} 大格（${base} 分），再往前 <b>${m - base}</b> 小格，
        所以是 <b>${m}</b> 分。一小格是 1 分鐘。` }; }
});
// 時間差：再過幾分鐘是幾點
[10, 15, 20, 25, 30, 40, 45, 50].forEach(add => CLOCK.push({
  k: `c.add.${add}`, g: '再過多久', subj: 'clock', cur: ['N-3-17'],
  make: () => {
    const h = 1 + rnd(12), m = 5 * rnd(12);
    const tot = h * 60 + m + add, nh = (Math.floor(tot / 60) - 1) % 12 + 1, nm = tot % 60;
    const wrong: [number, number][] = [[nh, (nm + 5) % 60], [nh % 12 + 1, nm], [nh, (nm + 55) % 60]];
    return { ask: `再過 ${add} 分鐘是幾點？`, svg: clockSVG(h, m),
      choices: shuffle([[nh, nm], ...wrong].map(([a, bq]) => ({ t: hhmm(a, bq), ok: a === nh && bq === nm }))),
      hint: `現在 ${hhmm(h, m)}，${m} ＋ ${add} ＝ ${m + add}${m + add >= 60 ? '，滿 60 進一小時' : ''}，
        所以是 <b>${hhmm(nh, nm)}</b>。` };
  }
}));
// 倒推：幾分鐘前
[10, 15, 20, 25, 30].forEach(sub => CLOCK.push({
  k: `c.sub.${sub}`, g: '幾分鐘前', subj: 'clock', cur: ['N-3-17'],
  make: () => {
    const h = 1 + rnd(12), m = 5 * rnd(12);
    const tot = h * 60 + m - sub + 720, ph = (Math.floor(tot / 60) - 1) % 12 + 1, pm = tot % 60;
    const wrong: [number, number][] = [[ph, (pm + 5) % 60], [ph % 12 + 1, pm], [ph, (pm + 55) % 60]];
    return { ask: `${sub} 分鐘前是幾點？`, svg: clockSVG(h, m),
      choices: shuffle([[ph, pm], ...wrong].map(([a, bq]) => ({ t: hhmm(a, bq), ok: a === ph && bq === pm }))),
      hint: `現在 ${hhmm(h, m)}，往回 ${sub} 分鐘是 <b>${hhmm(ph, pm)}</b>。` };
  }
}));

export { CLOCK };
