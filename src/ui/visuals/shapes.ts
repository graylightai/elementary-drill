/* ---------- 圖像邏輯 ---------- */
const SHAPES = ['circle', 'square', 'triangle', 'star', 'hex', 'diamond'];
export interface ShapeSpec { k: string; fill?: string; sc?: number; rot?: number }
function logoSVG(sp: ShapeSpec, size = 62): string {
  const c = 50, R = 40 * (sp.sc || 1), f = sp.fill || 'var(--ink)';
  let d = '';
  if (sp.k === 'circle') d = `<circle cx="${c}" cy="${c}" r="${R}"/>`;
  else if (sp.k === 'square') d = `<rect x="${c - R * .9}" y="${c - R * .9}" width="${R * 1.8}" height="${R * 1.8}" rx="4"/>`;
  else {
    const sides = ({ triangle: 3, diamond: 4, hex: 6 } as Record<string, number>)[sp.k];
    if (sides) {
      const pts = [];
      for (let i = 0; i < sides; i++) {
        const a = -Math.PI / 2 + i * 2 * Math.PI / sides;
        pts.push(`${(c + R * Math.cos(a)).toFixed(1)},${(c + R * Math.sin(a)).toFixed(1)}`);
      }
      d = `<polygon points="${pts.join(' ')}"/>`;
    } else {                                  // star
      const pts = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 ? R * .45 : R, a = -Math.PI / 2 + i * Math.PI / 5;
        pts.push(`${(c + r * Math.cos(a)).toFixed(1)},${(c + r * Math.sin(a)).toFixed(1)}`);
      }
      d = `<polygon points="${pts.join(' ')}"/>`;
    }
  }
  return `<svg class="lg" width="${size}" height="${size}" viewBox="0 0 100 100" fill="${f}"
    style="transform:rotate(${sp.rot || 0}deg)">${d}</svg>`;
}
const LGC = ['#E03131', '#2A6FD6', '#2F9E44', '#F3C218', '#8043B8'];

export { SHAPES, logoSVG, LGC };
