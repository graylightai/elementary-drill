/* 不依賴畫面的小工具。題庫與引擎都可以用。 */
export const rnd = (n: number) => Math.floor(Math.random() * n);
export const pick = <T>(a: readonly T[]): T => a[rnd(a.length)];
export const shuffle = <T>(a: T[]): T[] => {
  for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
export const uniq = <T>(a: T[]): T[] => [...new Set(a)];
export const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[s.length >> 1];
};

/** 產生 4 個不重複選項，正解在內，干擾項落在 lo..hi */
export function distract(ans: number, lo: number, hi: number): number[] {
  const out = new Set([ans]);
  const near = [ans - 1, ans + 1, ans - 2, ans + 2, ans - 10, ans + 10];
  for (const v of shuffle(near)) { if (out.size >= 4) break; if (v >= lo && v <= hi) out.add(v); }
  let guard = 0;
  while (out.size < 4 && guard++ < 200) { const v = lo + rnd(hi - lo + 1); if (v >= lo) out.add(v); }
  return shuffle([...out]);
}
