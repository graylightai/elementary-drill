/* 本機儲存。key 前綴 g1.* 是改名前就在用的，刻意沿用，舊進度才不會掉。 */
export function load<T>(k: string, d: T): T {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) as T : d; } catch { return d; }
}
export function save(k: string, v: unknown): void {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* 私密瀏覽或空間滿：照常運作，只是不存 */ }
}

/** grade：首頁選的年級，只出到這個年級為止的題目；0 = 全部 */
export interface Settings { len: number; size: number; hint: boolean; sound: boolean; rest: number; grade: number }
export const S: Settings = { len: 12, size: 1, hint: true, sound: true, rest: 10, grade: 0 };
Object.assign(S, load('g1.set', {}));
export const saveSettings = () => save('g1.set', S);
