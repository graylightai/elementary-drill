/* 間隔重複（Leitner）
   box 0..4，到期日用「天數」存。答錯回 0，答對升一箱。
   間隔：0→明天、1→2 天、2→4 天、3→8 天、4→16 天。
   反應時間納入判定：答對但太慢 = 還不熟，不升箱。 */
import type { Item, Rec } from '../types';
import { shuffle } from '../util';
import { load, save } from './store';

const GAPS = [1, 2, 4, 8, 16];
const DAY = 864e5;
export const today = () => Math.floor(Date.now() / DAY);

/** 答對但超過這個時間，視為「會但不熟」，不升箱 */
export const SLOW_MS = 6000;

export const SR: Record<string, Rec> = load('g1.sr', {});
const rec = (k: string) => SR[k] || (SR[k] = { b: 0, d: 0, n: 0, ok: 0, bad: 0, t: [] });

export function grade(key: string, right: boolean, ms: number): void {
  const r = rec(key);
  r.n++;
  r.t = [...r.t, ms].slice(-5);
  if (right) {
    r.ok++;
    if (ms <= SLOW_MS) {
      r.b = Math.min(4, r.b + 1);                     // 夠快才升箱，間隔才拉長
      r.d = today() + GAPS[r.b];
    } else {
      r.d = today() + 1;                              // 會但很慢：不升箱，明天就回來
    }
  } else {
    r.bad++;
    r.b = 0;
    r.d = today();                                    // 今天稍後、明天都還會出
  }
  save('g1.sr', SR);
}

/** 出題：到期的優先（箱子越低越前面），再補沒練過的，真的不夠才拿還沒到期的 */
export function buildSession(items: Item[], len: number): Item[] {
  const t = today();
  const due = items.filter(i => SR[i.k] && SR[i.k].d <= t);
  const fresh = items.filter(i => !SR[i.k]);
  const rest = items.filter(i => SR[i.k] && SR[i.k].d > t);
  due.sort((a, b) => SR[a.k].b - SR[b.k].b);
  return shuffle([...due, ...shuffle(fresh), ...shuffle(rest)].slice(0, len));
}
