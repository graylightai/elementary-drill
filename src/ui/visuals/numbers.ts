/* ---------- 視覺模型：十格板 / 部分－整體 ----------
   小一停不下「用數的」，多半是因為只看到算式沒看到量。
   答錯時給的不是文字說明，是這兩張圖。 */
function tenFrame(n: number, extra?: number): string {
  const cell = 46, pad = 6;
  let c = '';
  for (let i = 0; i < 10; i++) {
    const x = pad + (i % 5) * cell, y = pad + ((i / 5) | 0) * cell;
    c += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" class="tf-c"/>`;
    if (i < n) c += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * .3}" class="tf-d"/>`;
    else if (extra && i < n + extra) c += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="${cell * .3}" class="tf-e"/>`;
  }
  return `<svg class="tf" viewBox="0 0 ${pad * 2 + cell * 5} ${pad * 2 + cell * 2}">${c}</svg>`;
}
function bond(whole: number | null, a: number | null, b: number | null): string {
  const q = (v: number | null) => v === null ? '?' : v;
  return `<svg class="bd" viewBox="0 0 260 150">
    <line x1="130" y1="52" x2="68" y2="96" class="bd-l"/><line x1="130" y1="52" x2="192" y2="96" class="bd-l"/>
    <circle cx="130" cy="34" r="30" class="bd-w"/><text x="130" y="44" class="bd-t">${q(whole)}</text>
    <circle cx="62" cy="116" r="28" class="bd-p"/><text x="62" y="126" class="bd-t">${q(a)}</text>
    <circle cx="198" cy="116" r="28" class="bd-p"/><text x="198" y="126" class="bd-t">${q(b)}</text></svg>`;
}

export { tenFrame, bond };

/* ---------- 位值積木：百（板）、十（條）、一（小方塊） ----------
   課綱 N-1-1、N-2-1 的參考教具就是位值積木。百是 10×10 的板，十是 1×10 的條。 */
const BU = 6;                                          // 一個小方塊的邊長
function flat(x: number, y: number): string {
  let s = `<rect x="${x}" y="${y}" width="${BU * 10}" height="${BU * 10}" class="pv-h"/>`;
  for (let i = 1; i < 10; i++) s += `<path d="M${x + i * BU} ${y}v${BU * 10}M${x} ${y + i * BU}h${BU * 10}" class="pv-grid"/>`;
  return s;
}
function rod(x: number, y: number): string {
  let s = `<rect x="${x}" y="${y}" width="${BU}" height="${BU * 10}" class="pv-t"/>`;
  for (let i = 1; i < 10; i++) s += `<path d="M${x} ${y + i * BU}h${BU}" class="pv-grid"/>`;
  return s;
}
const unit = (x: number, y: number) => `<rect x="${x}" y="${y}" width="${BU}" height="${BU}" class="pv-o"/>`;

/** 位值積木圖：h 個百、t 個十、o 個一 */
function blocks(h: number, t: number, o: number): string {
  let x = 0, s = '';
  for (let i = 0; i < h; i++) { s += flat(x, 0); x += BU * 10 + 6; }
  if (h && (t || o)) x += 6;
  for (let i = 0; i < t; i++) { s += rod(x, 0); x += BU + 4; }
  if (t && o) x += 8;
  for (let i = 0; i < o; i++) s += unit(x + (i % 2) * (BU + 3), (BU * 10) - (Math.floor(i / 2) + 1) * (BU + 3) + 3);
  if (o) x += 2 * (BU + 3);
  const w = Math.max(x, 10);
  return `<svg class="pv" viewBox="-2 -2 ${w + 4} ${BU * 10 + 4}" width="${Math.min(320, (w + 4) * 1.6)}">${s}</svg>`;
}
export { blocks };
