/* ---------- 時鐘與錢幣 ---------- */
function clockSVG(h: number, m: number, size = 128): string {
  const c = size / 2, r = c - 4;
  let ticks = '';
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 - Math.PI / 2;
    const r1 = r - (i % 3 ? 7 : 11), lw = i % 3 ? 1.8 : 3;
    ticks += `<line x1="${(c + r1 * Math.cos(a)).toFixed(1)}" y1="${(c + r1 * Math.sin(a)).toFixed(1)}"
      x2="${(c + (r - 3) * Math.cos(a)).toFixed(1)}" y2="${(c + (r - 3) * Math.sin(a)).toFixed(1)}"
      stroke="currentColor" stroke-width="${lw}" stroke-linecap="round"/>`;
    const rt = r - 22, ang = a;
    ticks += `<text x="${(c + rt * Math.cos(ang)).toFixed(1)}" y="${(c + rt * Math.sin(ang) + 5).toFixed(1)}"
      text-anchor="middle" font-size="13" font-family="IBM Plex Mono, monospace" fill="currentColor"
      opacity=".65">${i === 0 ? 12 : i}</text>`;
  }
  const ha = ((h % 12) + m / 60) * Math.PI / 6 - Math.PI / 2;
  const ma = m * Math.PI / 30 - Math.PI / 2;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" style="color:var(--ink)">
    <circle cx="${c}" cy="${c}" r="${r}" fill="var(--surface)" stroke="currentColor" stroke-width="2.5"/>
    ${ticks}
    <line x1="${c}" y1="${c}" x2="${(c + r * .5 * Math.cos(ha)).toFixed(1)}" y2="${(c + r * .5 * Math.sin(ha)).toFixed(1)}"
      stroke="currentColor" stroke-width="5" stroke-linecap="round"/>
    <line x1="${c}" y1="${c}" x2="${(c + r * .74 * Math.cos(ma)).toFixed(1)}" y2="${(c + r * .74 * Math.sin(ma)).toFixed(1)}"
      stroke="var(--red)" stroke-width="3.2" stroke-linecap="round"/>
    <circle cx="${c}" cy="${c}" r="3.6" fill="currentColor"/></svg>`;
}
const hhmm = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;

export { clockSVG, hhmm };
