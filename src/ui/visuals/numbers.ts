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
