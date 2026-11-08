/* ---------- 四年級：量角器、平角周角、旋轉角、垂直平行、全等、三角形四邊形、長條圖折線圖 ----------
   N-4-10／S-4-1 量角器：「須包括從量角器左右兩側進行量角」——量角器有內外兩圈刻度，
                 錯誤選項專放「讀錯圈」的那個度數（例如 50° 讀成 130°）。
   S-4-2 旋轉角：用鐘面，順時針與逆時針，不超過 360 度。
   S-4-5 垂直與平行；S-4-6 全等（平移、旋轉、翻轉後還是全等；放大縮小就不是）。
   S-4-7 特殊三角形；S-4-8 特殊四邊形（含平行）。
   D-4-1 長條圖、折線圖的報讀。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq, distract } from '../../../util';

const G: Item[] = [];

/* ===== 量角器 ===== */
function protractor(deg: number, fromLeft: boolean): string {
  const cx = 150, cy = 140, R = 120;
  let ticks = '';
  for (let d = 0; d <= 180; d += 10) {
    const a = Math.PI - (d * Math.PI) / 180, x1 = cx + R * Math.cos(a), y1 = cy - R * Math.sin(a), x2 = cx + (R - 10) * Math.cos(a), y2 = cy - (R - 10) * Math.sin(a);
    ticks += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" class="pt-t"/>`;
    if (d % 30 === 0) {
      const xo = cx + (R - 20) * Math.cos(a), yo = cy - (R - 20) * Math.sin(a), xi = cx + (R - 40) * Math.cos(a), yi = cy - (R - 40) * Math.sin(a);
      ticks += `<text x="${xo.toFixed(1)}" y="${(yo + 4).toFixed(1)}" class="pt-o">${d}</text><text x="${xi.toFixed(1)}" y="${(yi + 4).toFixed(1)}" class="pt-i">${180 - d}</text>`;
    }
  }
  // 一條邊在 0 度線上（左邊或右邊），另一條邊依角度畫
  const base = fromLeft ? Math.PI : 0, other = fromLeft ? Math.PI - (deg * Math.PI) / 180 : (deg * Math.PI) / 180;
  const ray = (t: number) => `${(cx + (R + 14) * Math.cos(t)).toFixed(1)},${(cy - (R + 14) * Math.sin(t)).toFixed(1)}`;
  return `<svg viewBox="0 0 300 160" width="300" class="prot">
    <path d="M${cx - R},${cy} A${R},${R} 0 0 1 ${cx + R},${cy} Z" class="pt-b"/>${ticks}
    <path d="M${ray(base)} L${cx},${cy} L${ray(other)}" class="pt-ray"/><circle cx="${cx}" cy="${cy}" r="3" class="pt-c"/></svg>`;
}
G.push({
  k: 'prot.read', g: '量角器', subj: 'shape', cur: ['N-4-10', 'S-4-1'], vids: ['M3K90v4leOY'],
  make: () => {
    const deg = 10 * (2 + rnd(15)), left = rnd(2) === 0;
    const scale = left ? '外圈（左邊從 0 開始）' : '內圈（右邊從 0 開始）';
    return { ask: '紅色的角是幾度？', art: protractor(deg, left),
      choices: shuffle(uniq([deg, 180 - deg, deg + 10, deg - 10].filter(v => v > 0 && v < 180))).map(v => ({ t: `${v}°`, ok: v === deg })),
      hint: `先看角的一條邊對著哪一邊的 0：這題要讀<b>${scale}</b>那一圈，讀到 <b>${deg}°</b>。讀錯圈會變成 ${180 - deg}°。` };
  }
});
G.push({
  k: 'ang4.sum', g: '平角、周角、角的合成', subj: 'shape', cur: ['N-4-10', 'S-4-1'], vids: ['WrNwQ_Ls0XI'],
  make: () => {
    const a = 10 * (2 + rnd(13));
    return pick([
      { ask: `一個平角被分成兩個角，其中一個是 ${a}°，另一個是幾度？`, choices: shuffle(uniq([180 - a, 360 - a, 90 - a > 0 ? 90 - a : a + 10, a])).map(v => ({ t: `${v}°`, ok: v === 180 - a })),
        hint: `平角是一直線，<b>180°</b>：180－${a}＝<b>${180 - a}°</b>。` },
      { ask: `一個周角裡，已經有一個 ${a + 90}° 的角，剩下的是幾度？`, choices: shuffle(uniq([270 - a, 180 - a, 360 + a, 90 + a])).map(v => ({ t: `${v}°`, ok: v === 270 - a })),
        hint: `周角轉一整圈，<b>360°</b>：360－${a + 90}＝<b>${270 - a}°</b>。` },
      { ask: '直角、平角、周角各是幾度？', choices: shuffle(['90°、180°、360°', '90°、360°、180°', '45°、90°、180°', '100°、200°、400°']).map(t => ({ t, ok: t === '90°、180°、360°' })),
        hint: '直角 <b>90°</b>，兩個直角是平角 <b>180°</b>，轉一整圈是周角 <b>360°</b>。' },
    ]);
  }
});
G.push({
  k: 'rot.clock', g: '旋轉角（鐘面）', subj: 'shape', cur: ['S-4-2'], vids: ['jG9pIO2pyRo'],
  make: () => {
    const from = 12, steps = pick([3, 6, 9, 2, 4, 1]), cw = rnd(3) > 0;
    const to = cw ? (from + steps - 1) % 12 + 1 : (from - steps + 11) % 12 + 1, deg = steps * 30;
    return { ask: `長針從 ${from} ${cw ? '順時針' : '逆時針'}轉到 ${to}，轉了幾度？`,
      choices: shuffle(uniq([deg, 360 - deg, steps * 10, deg + 30])).map(v => ({ t: `${v}°`, ok: v === deg })),
      hint: `鐘面一圈 360°，有 12 大格，一大格是 <b>30°</b>。${cw ? '順' : '逆'}時針走了 ${steps} 大格：${steps}×30＝<b>${deg}°</b>。${cw ? '' : '方向反了，格數要照逆時針數。'}` };
  }
});

/* ===== 垂直、平行 ===== */
G.push({
  k: 'perp.par', g: '垂直與平行', subj: 'shape', cur: ['S-4-5'], vids: ['JCxQYd19nBg'],
  make: () => {
    const kinds = ['互相垂直', '互相平行', '都不是'] as const, ans = pick(kinds), r = pick([0, 20, -30, 60]);
    const second = ans === '互相垂直' ? r + 90 : ans === '互相平行' ? r : r + pick([35, 55, 120]);
    const line = (deg: number, off: number) => { const t = (deg * Math.PI) / 180, cx = 80 + off * Math.sin(t), cy = 60 - off * Math.cos(t);
      return `<line x1="${(cx - 60 * Math.cos(t)).toFixed(1)}" y1="${(cy - 60 * Math.sin(t)).toFixed(1)}" x2="${(cx + 60 * Math.cos(t)).toFixed(1)}" y2="${(cy + 60 * Math.sin(t)).toFixed(1)}"/>`; };
    const art = `<svg viewBox="0 0 160 120" width="170" class="pp">${line(r, ans === '互相平行' ? -22 : 0)}${line(second, ans === '互相平行' ? 22 : 0)}</svg>`;
    return { ask: '這兩條直線是什麼關係？', art, choices: kinds.map(t => ({ t, ok: t === ans })),
      hint: { 互相垂直: '兩條線相交成<b>直角</b>（90°），叫互相垂直。', 互相平行: '兩條線怎麼延長都不會相交、中間的距離處處一樣，叫<b>互相平行</b>。', 都不是: '兩條線有相交，但不是直角，所以<b>不是垂直也不是平行</b>。' }[ans] };
  }
});

/* ===== 全等 ===== */
const SHAPE = 'M0,0 L40,0 L40,20 L20,20 L20,50 L0,50 Z';     // 不對稱的 L 形，翻面看得出來
G.push({
  k: 'congr', g: '全等圖形', subj: 'shape', cur: ['S-4-6'], vids: ['p2ZqJEefpvg'],
  make: () => {
    const draw = (tf: string) => `<svg viewBox="-35 -35 70 70" width="80" class="cg"><path d="${SHAPE}" transform="${tf} translate(-20,-25)"/></svg>`;
    const right = draw(pick(['rotate(90)', 'rotate(180)', 'scale(-1,1)', 'rotate(-90)']));
    const wrongs = [draw('scale(.7)'), draw('scale(1.3,1)'), draw('rotate(90) scale(1,.75)')];
    return { ask: '哪一個跟上面的圖形全等（形狀大小都一樣）？', art: draw(''),
      choices: shuffle([{ art: right, ok: true }, ...wrongs.map(w => ({ art: w, ok: false }))]),
      hint: '轉一轉、翻過來、移過去，只要能完全疊在一起就是<b>全等</b>。放大、縮小、拉長的都不行。' };
  }
});

/* ===== 三角形、四邊形 ===== */
/* 三角形可以同時是「等腰」又是「鈍角」，四邊形裡長方形、菱形也都是平行四邊形——
   選項只放「唯一正確」的那一組，不讓孩子答對了還被判錯。 */
G.push({
  k: 'tri.kind', g: '特殊三角形', subj: 'shape', cur: ['S-4-7'], vids: ['GcKfOD-O4Lo', 'GWzpFNSi9ek', 'Bo3OQmbXYS0'],
  make: () => {
    const q = pick([
      { d: '三條邊都是 6 公分', a: '正三角形', opts: ['正三角形', '直角三角形', '鈍角三角形'], h: '三條邊一樣長是<b>正三角形</b>，三個角都是 60°。' },
      { d: '有兩條邊都是 5 公分，第三條是 8 公分', a: '等腰三角形', opts: ['等腰三角形', '正三角形', '直角三角形'], h: '有兩條邊一樣長是<b>等腰三角形</b>。（它也剛好是鈍角三角形，但這題問的是邊。）' },
      { d: '三個角是 90°、40°、50°', a: '直角三角形', opts: ['直角三角形', '鈍角三角形', '銳角三角形'], h: '有一個角是 90°，是<b>直角三角形</b>。' },
      { d: '三個角是 120°、30°、30°', a: '鈍角三角形', opts: ['鈍角三角形', '直角三角形', '銳角三角形'], h: '有一個角比 90° 大，是<b>鈍角三角形</b>。' },
      { d: '三個角是 70°、60°、50°', a: '銳角三角形', opts: ['銳角三角形', '直角三角形', '鈍角三角形'], h: '三個角都比 90° 小，是<b>銳角三角形</b>。' },
    ]);
    return { ask: `一個三角形${q.d}。它是什麼三角形？`, choices: shuffle([...q.opts]).map(t => ({ t, ok: t === q.a })), hint: q.h };
  }
});
const QUADS: Record<string, { pts: string; pairs: number }> = {
  平行四邊形: { pts: '30,20 150,20 120,90 0,90', pairs: 2 },
  梯形: { pts: '40,20 110,20 150,90 0,90', pairs: 1 },
  菱形: { pts: '75,5 135,55 75,105 15,55', pairs: 2 },
  長方形: { pts: '10,25 150,25 150,90 10,90', pairs: 2 },
  一般四邊形: { pts: '20,30 130,10 150,95 10,80', pairs: 0 },
};
const quadSVG = (name: string, w = 180) => `<svg viewBox="-4 0 164 110" width="${w}" class="qd"><polygon points="${QUADS[name].pts}"/></svg>`;
G.push({
  k: 'quad.kind', g: '特殊四邊形', subj: 'shape', cur: ['S-4-8'], vids: ['0YGRstvTboA', 'taORlO6MzH0', 'E0uwgwAScUs'],
  make: () => {
    if (rnd(2)) {
      const name = pick(Object.keys(QUADS)), n = QUADS[name].pairs;
      return { ask: '這個四邊形有幾組對邊互相平行？', art: quadSVG(name),
        choices: [0, 1, 2].map(v => ({ t: `${v} 組`, ok: v === n })),
        hint: n === 2 ? `上下一組、左右一組都平行：<b>2 組</b>。兩組對邊都平行的叫平行四邊形（長方形、菱形也是）。`
          : n === 1 ? '只有上下這一組平行：<b>1 組</b>。只有一組對邊平行的叫<b>梯形</b>。' : '沒有任何一組對邊平行：<b>0 組</b>。' };
    }
    const others = shuffle(['平行四邊形', '長方形', '菱形', '一般四邊形']).slice(0, 3);
    return { ask: '哪一個是梯形？',
      choices: shuffle(['梯形', ...others]).map(n => ({ art: quadSVG(n, 110), ok: n === '梯形' })),
      hint: '梯形是<b>只有一組</b>對邊平行的四邊形。兩組都平行的是平行四邊形。' };
  }
});

/* ===== 長條圖、折線圖 ===== */
G.push({
  k: 'chart.bar', g: '長條圖', subj: 'data', cur: ['D-4-1'], vids: ['RZ-Os7WQVOQ'],
  make: () => {
    const labels = shuffle(['跳繩', '籃球', '游泳', '跑步', '桌球']).slice(0, 4), vals = labels.map(() => 2 + rnd(13));
    while (uniq(vals).length < 4) vals[rnd(4)] = 2 + rnd(13);
    const max = 16, H = 140, bw = 36;
    let s = '';
    for (let v = 0; v <= max; v += 4) s += `<line x1="30" y1="${10 + H - v / max * H}" x2="230" y2="${10 + H - v / max * H}" class="ch-g"/><text x="24" y="${14 + H - v / max * H}" class="ch-y">${v}</text>`;
    labels.forEach((l, i) => { const h = vals[i] / max * H, x = 44 + i * 48;
      s += `<rect x="${x}" y="${10 + H - h}" width="${bw}" height="${h}" class="ch-b"/><text x="${x + bw / 2}" y="${H + 26}" class="ch-x">${l}</text>`; });
    const art = `<svg viewBox="0 0 240 ${H + 34}" width="280" class="chart">${s}</svg>`;
    const [i, j] = shuffle([0, 1, 2, 3]).slice(0, 2), d = Math.abs(vals[i] - vals[j]);
    return rnd(2) ? { ask: '最多人喜歡哪一種運動？（單位：人）', art, choices: labels.map(t => ({ t, ok: t === labels[vals.indexOf(Math.max(...vals))] })),
        hint: `看哪一條最高：<b>${labels[vals.indexOf(Math.max(...vals))]}</b>，${Math.max(...vals)} 人。` }
      : { ask: `喜歡${labels[i]}的比喜歡${labels[j]}的${vals[i] > vals[j] ? '多' : '少'}幾人？`, art, choices: distract(d, 0, 15).map(v => ({ t: `${v} 人`, ok: v === d })),
        hint: `${labels[i]} ${vals[i]} 人，${labels[j]} ${vals[j]} 人，差 <b>${d}</b> 人。先看長條頂端對到左邊的哪一格。` };
  }
});
G.push({
  k: 'chart.line', g: '折線圖', subj: 'data', cur: ['D-4-1'], vids: ['fan4swe7eUk'],
  make: () => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月'], vals: number[] = [10 + rnd(10)];
    for (let i = 1; i < 6; i++) vals.push(Math.max(2, Math.min(28, vals[i - 1] + pick([-8, -5, -3, 3, 5, 8, 10]))));
    if (Math.max(...vals.slice(1).map((v, i) => v - vals[i])) <= 0) vals[3] = Math.min(28, vals[2] + 9);   // 至少有一段是增加的
    const ups2 = vals.slice(1).map((v, i) => v - vals[i]), kk = ups2.indexOf(Math.max(...ups2));
    const max = 40, H = 130;
    let s = '';
    for (let v = 0; v <= max; v += 10) s += `<line x1="30" y1="${10 + H - v / max * H}" x2="250" y2="${10 + H - v / max * H}" class="ch-g"/><text x="24" y="${14 + H - v / max * H}" class="ch-y">${v}</text>`;
    const pts = vals.map((v, i) => `${44 + i * 40},${10 + H - v / max * H}`);
    s += `<polyline points="${pts.join(' ')}" class="ch-l"/>` + pts.map(p => `<circle cx="${p.split(',')[0]}" cy="${p.split(',')[1]}" r="3.5" class="ch-d"/>`).join('');
    s += months.map((m, i) => `<text x="${44 + i * 40}" y="${H + 26}" class="ch-x">${m}</text>`).join('');
    return { ask: '這是每個月的下雨天數。哪一個月比前一個月增加最多？', art: `<svg viewBox="0 0 260 ${H + 34}" width="290" class="chart">${s}</svg>`,
      choices: shuffle([months[kk + 1], ...shuffle(months.slice(1).filter(m => m !== months[kk + 1])).slice(0, 3)]).map(t => ({ t, ok: t === months[kk + 1] })),
      hint: `看線<b>往上爬最陡</b>的那一段：${months[kk]} 到 ${months[kk + 1]}，多了 ${ups2[kk]} 天。折線圖適合看「變化」。` };
  }
});

export { G as GEO_G4 };
