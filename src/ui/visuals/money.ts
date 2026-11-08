/* 錢幣圖示。刻意畫成簡化的圖形（顏色、大小、面額數字），不模仿真鈔真幣的圖案。
   顏色與相對大小照實際：1 元銅色最小、5 元與 10 元銀色、50 元金色最大；100 元是紙鈔。 */

export const DENOMS = [100, 50, 10, 5, 1] as const;
export const DENOMS_G2 = [1000, 500, 100, 50, 10, 5, 1] as const;

/* 紙鈔：100 紅、500 棕、1000 藍（照實際的主色，圖案不仿） */
const BILL: Record<number, { fill: string; edge: string; ink: string }> = {
  100:  { fill: '#E9A49A', edge: '#A8483C', ink: '#5A1A12' },
  500:  { fill: '#D9B48C', edge: '#8A5A2B', ink: '#4A2C0E' },
  1000: { fill: '#A9C4E6', edge: '#3E6699', ink: '#14304F' },
};

const STYLE: Record<number, { d: number; fill: string; edge: string; ink: string }> = {
  1:  { d: 34, fill: '#D29A55', edge: '#9C6A2E', ink: '#4A2E10' },
  5:  { d: 40, fill: '#D5D9DD', edge: '#8F969D', ink: '#33383D' },
  10: { d: 45, fill: '#E2E5E8', edge: '#8F969D', ink: '#33383D' },
  50: { d: 52, fill: '#E6C35C', edge: '#A88528', ink: '#4D3A08' },
};

/** 一個錢幣或一張 100 元紙鈔的 SVG。scale 用來整體放大 */
export function money(v: number, scale = 1): string {
  const bill = BILL[v];
  if (bill) {
    const w = 88 * scale, h = 46 * scale;
    return `<svg class="coin" width="${w}" height="${h}" viewBox="0 0 88 46" role="img" aria-label="${v} 元紙鈔">
      <rect x="1.5" y="1.5" width="85" height="43" rx="5" fill="${bill.fill}" stroke="${bill.edge}" stroke-width="2"/>
      <rect x="7" y="7" width="74" height="32" rx="3" fill="none" stroke="${bill.edge}" stroke-width="1" opacity=".55"/>
      <text x="44" y="30" text-anchor="middle" font-size="${v >= 1000 ? 17 : 19}" font-weight="700" font-family="Fredoka, sans-serif" fill="${bill.ink}">${v}</text>
      <text x="80" y="38" text-anchor="end" font-size="8" fill="${bill.ink}">元</text></svg>`;
  }
  const s = STYLE[v], d = s.d * scale, r = 50;
  return `<svg class="coin" width="${d}" height="${d}" viewBox="0 0 100 100" role="img" aria-label="${v} 元">
    <circle cx="${r}" cy="${r}" r="46" fill="${s.fill}" stroke="${s.edge}" stroke-width="5"/>
    <circle cx="${r}" cy="${r}" r="36" fill="none" stroke="${s.edge}" stroke-width="1.5" opacity=".5"/>
    <text x="${r}" y="${r + (v >= 10 ? 13 : 15)}" text-anchor="middle" font-size="${v >= 10 ? 38 : 44}" font-weight="700"
      font-family="Fredoka, sans-serif" fill="${s.ink}">${v}</text></svg>`;
}

/** 一堆錢，大的排前面 */
export function purse(vals: number[], scale = 1): string {
  return `<div class="purse">${[...vals].sort((a, b) => b - a).map(v => money(v, scale)).join('')}</div>`;
}

/** 用指定的面額湊出 amount，大的先用（找不開就回傳 null） */
export function greedy(amount: number, allowed: readonly number[] = DENOMS): number[] | null {
  const out: number[] = [];
  let left = amount;
  for (const d of [...allowed].sort((a, b) => b - a)) while (left >= d) { out.push(d); left -= d; }
  return left === 0 ? out : null;
}

export const sum = (vals: number[]) => vals.reduce((a, v) => a + v, 0);
