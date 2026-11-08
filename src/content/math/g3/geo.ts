/* ---------- 三年級：角、正方形長方形、圓、展開圖 ----------
   S-3-1／N-3-13 角與角度：「教學應處理角大小與邊長長短混淆之常見錯誤」——
                 所以比大小的題目，大的那個角故意畫比較短的邊。認識直角。
   S-3-2 以邊與角定義正方形長方形；「斜擺的長方形或正方形依舊是長方形或正方形」。
   S-3-3 圓心、半徑、直徑（直徑＝2 個半徑）。
   S-3-4 展開圖：哪一個可以摺成正方體（初步體驗，不歸納規則）。 */
import type { Item } from '../../../types';
import { rnd, pick, shuffle, uniq } from '../../../util';

const G: Item[] = [];

/* ===== 角 ===== */
function angle(deg: number, arm: number, rot = 0, mark = false): string {
  const c = 60, r = arm, a = (rot * Math.PI) / 180, b = ((rot - deg) * Math.PI) / 180;
  const p = (t: number, rr: number) => `${(20 + rr * Math.cos(t)).toFixed(1)},${(c + rr * Math.sin(t)).toFixed(1)}`;
  const arc = deg === 90 && mark
    ? `<path d="M${p(a, 14)} L${(20 + 14 * Math.cos(a) + 14 * Math.cos(b)).toFixed(1)},${(c + 14 * Math.sin(a) + 14 * Math.sin(b)).toFixed(1)} L${p(b, 14)}" class="ang-arc"/>`
    : `<path d="M${p(a, 16)} A16 16 0 0 0 ${p(b, 16)}" class="ang-arc"/>`;
  return `<svg viewBox="0 0 130 110" width="120" class="ang"><path d="M${p(a, r)} L20,${c} L${p(b, r)}" class="ang-l"/>${arc}<circle cx="20" cy="${c}" r="3" class="ang-v"/></svg>`;
}
G.push({
  k: 'ang.cmp', g: '角的大小', subj: 'shape', cur: ['S-3-1', 'N-3-13'], vids: ['u1efe5DTsoc', 'Rh-wasg8eg0'],
  make: () => {
    let a = 25 + rnd(100), b = 25 + rnd(100); while (Math.abs(a - b) < 20) b = 25 + rnd(100);
    const big = a > b ? '紅色' : '藍色';
    // 大的角畫短邊、小的角畫長邊：專門抓「邊長就是角大」的誤解
    const armA = a > b ? 45 : 95, armB = a > b ? 95 : 45;
    return { ask: '哪一個角比較大？', art: `<div class="meas"><div class="angA">${angle(a, armA, 10)}<b>紅色</b></div><div class="angB">${angle(b, armB, 10)}<b>藍色</b></div></div>`,
      choices: ['紅色', '藍色', '一樣大'].map(v => ({ t: v, ok: v === big })),
      hint: `角的大小是看兩條邊<b>張開多少</b>，跟邊畫得長或短沒有關係。<b>${big}</b>的角張得比較開。` };
  }
});
G.push({
  k: 'ang.right', g: '找直角', subj: 'shape', cur: ['S-3-1', 'N-3-13'], vids: ['DkMjtxDDjHc'],
  make: () => {
    const degs = shuffle([90, pick([50, 60, 70]), pick([110, 120, 135]), pick([30, 40, 80])]);
    return { ask: '哪一個是直角？',
      choices: degs.map(d => ({ art: angle(d, 70, pick([0, 20, -15, 40])), ok: d === 90 })),
      hint: '直角像正方形的角、書本的角。拿三角板的直角去比，剛好貼合的就是直角。' };
  }
});

/* ===== 斜擺的正方形、長方形 ===== */
G.push({
  k: 'quad.tilt', g: '斜擺的正方形長方形', subj: 'shape', cur: ['S-3-2'], vids: ['RMl9NproJdg', '5Y22O53UfPg'],
  make: () => {
    const sq = rnd(2) === 0, w = sq ? 60 : 84, h = sq ? 60 : 44, rot = pick([25, 35, -30, 45]);
    const lab = (t: string, x: number, y: number) => `<text x="${x}" y="${y}" class="per-t" transform="rotate(${-rot} ${x} ${y})">${t}</text>`;
    const art = `<svg viewBox="0 0 160 150" width="170" class="per"><g transform="rotate(${rot} 80 75)">
      <rect x="${80 - w / 2}" y="${75 - h / 2}" width="${w}" height="${h}" class="per-r"/>
      <path d="M${80 - w / 2 + 10} ${75 - h / 2}v10h-10" class="ang-arc"/>
      ${lab(`${sq ? 5 : 8} 公分`, 80, 75 - h / 2 - 6)}${lab(`${sq ? 5 : 4} 公分`, 80 + w / 2 + 18, 79)}</g></svg>`;
    const ans = sq ? '正方形' : '長方形';
    return { ask: '四個角都是直角。這個斜斜放的是什麼形狀？', art,
      choices: ['正方形', '長方形', '都不是'].map(v => ({ t: v, ok: v === ans })),
      hint: sq ? '四個角都是直角、四條邊都一樣長，是<b>正方形</b>。轉了一個角度還是正方形。'
               : '四個角都是直角，長邊和短邊不一樣長，是<b>長方形</b>。斜斜放還是長方形。' };
  }
});

/* ===== 圓 ===== */
G.push({
  k: 'circ.rd', g: '半徑和直徑', subj: 'shape', cur: ['S-3-3'], vids: ['A2kDAWhplOo', 'FcMgIerCkLo'],
  make: () => {
    const r = 2 + rnd(9);
    return pick([
      { ask: `一個圓的半徑是 ${r} 公分，直徑是幾公分？`, choices: shuffle(uniq([2 * r, r, r + 2, 4 * r])).map(v => ({ t: `${v} 公分`, ok: v === 2 * r })),
        hint: `直徑穿過圓心，從圓周的一邊到另一邊，是<b>兩個半徑</b>：${r}×2＝<b>${2 * r}</b> 公分。` },
      { ask: `一個圓的直徑是 ${2 * r} 公分，半徑是幾公分？`, choices: shuffle(uniq([r, 2 * r, r + 1, 4 * r])).map(v => ({ t: `${v} 公分`, ok: v === r })),
        hint: `半徑是直徑的一半：${2 * r}÷2＝<b>${r}</b> 公分。` },
    ]);
  }
});
G.push({
  k: 'circ.parts', g: '圓心、半徑、直徑', subj: 'shape', cur: ['S-3-3'], vids: ['A2kDAWhplOo'],
  make: () => {
    const which = pick(['半徑', '直徑', '圓心'] as const), t = Math.random() * Math.PI * 2;
    const x = (k: number) => (70 + 50 * Math.cos(t + k)).toFixed(1), y = (k: number) => (70 + 50 * Math.sin(t + k)).toFixed(1);
    const mark = which === '半徑' ? `<line x1="70" y1="70" x2="${x(0)}" y2="${y(0)}" class="cp-hi"/>`
      : which === '直徑' ? `<line x1="${x(Math.PI)}" y1="${y(Math.PI)}" x2="${x(0)}" y2="${y(0)}" class="cp-hi"/>`
      : `<circle cx="70" cy="70" r="6" class="cp-dot"/>`;
    return { ask: `紅色標出來的是什麼？`, art: `<svg viewBox="0 0 140 140" width="150" class="circ"><circle cx="70" cy="70" r="50" class="cp-c"/><circle cx="70" cy="70" r="2.5" class="cp-o"/>${mark}</svg>`,
      choices: ['圓心', '半徑', '直徑', '圓周'].map(v => ({ t: v, ok: v === which })),
      hint: { 圓心: '正中間那一點是<b>圓心</b>，圓周上每一點到它都一樣遠。', 半徑: '從圓心連到圓周的線是<b>半徑</b>。', 直徑: '穿過圓心、兩頭都在圓周上的線是<b>直徑</b>，等於兩個半徑。' }[which] };
  }
});

/* ===== 正方體展開圖 ===== */
type Net = [number, number][];
const GOOD: Net[] = [
  [[1, 0], [0, 1], [1, 1], [2, 1], [3, 1], [1, 2]],              // 十字
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [0, 2]],              // 1-4-1，兩邊在同一端
  [[0, 0], [0, 1], [1, 1], [2, 1], [3, 1], [3, 2]],              // 1-4-1，兩邊在兩端
  [[0, 0], [1, 0], [1, 1], [2, 1], [2, 2], [3, 2]],              // 階梯
  [[0, 0], [1, 0], [2, 0], [2, 1], [3, 1], [4, 1]],              // 3-3
];
const BAD: Net[] = [
  [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1]],              // 2×3 長方形
  [[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [2, 0]],              // 一排 5 個
  [[0, 0], [3, 0], [0, 1], [1, 1], [2, 1], [3, 1]],              // 兩塊在同一邊的兩端：摺起來會疊在一起
  [[0, 0], [1, 0], [0, 1], [1, 1], [2, 1], [3, 1]],              // 有 2×2 的方塊
];
const netSVG = (n: Net) => {
  const u = 18, W = Math.max(...n.map(c => c[0])) + 1, H = Math.max(...n.map(c => c[1])) + 1;
  return `<svg viewBox="-1 -1 ${W * u + 2} ${H * u + 2}" width="${W * u * 1.5}" class="net">${n.map(([x, y]) => `<rect x="${x * u}" y="${y * u}" width="${u}" height="${u}"/>`).join('')}</svg>`;
};
G.push({
  k: 'net.cube', g: '正方體展開圖', subj: 'shape', cur: ['S-3-4'], vids: ['_DMg96F9A-Q'],
  make: () => {
    const good = pick(GOOD), bad = shuffle([...BAD]).slice(0, 3);
    return { ask: '哪一個可以摺成正方體？',
      choices: shuffle([{ art: netSVG(good), ok: true }, ...bad.map(b => ({ art: netSVG(b), ok: false }))]),
      hint: '想像摺起來：正方體有 6 個面，每一面只能用一次。有 4 格排成一個田字、或兩格摺起來會疊在一起的，都摺不成。拿紙剪下來摺摺看最清楚。' };
  }
});

export { G as GEO_G3 };
