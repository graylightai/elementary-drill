/* 課綱代碼 → 年級與類別。首頁的年級篩選、領域分區都靠這裡。
   數學代碼的第二段就是年級：N-2-13 → 2 年級。
   國語文用學習階段：I＝1–2 年級、II＝3–4、III＝5–6，取該階段的第一個年級。
   一個知識點標了好幾個代碼時，取最早的那個年級（第一次教到它的時候）。 */
import type { Item } from '../types';

const STAGE: Record<string, number> = { I: 1, II: 3, III: 5 };

export function gradeOf(code: string): number | null {
  const m = code.match(/^([NSRD])-(\d)-\d+$/);
  if (m) return +m[2];
  const z = code.match(/^[A-D][a-e]-(I{1,3})-\d+$/);
  if (z) return STAGE[z[1]] ?? null;
  return null;
}

/** 知識點的年級；沒標課綱（英文、色彩、邏輯）回傳 null */
export function itemGrade(it: Item): number | null {
  const gs = it.cur.map(gradeOf).filter((g): g is number => g !== null);
  return gs.length ? Math.min(...gs) : null;
}

/** 「我的年級」篩選：到這個年級為止學過的都算（複習包含前面的年級）。0 = 全部 */
export function forGrade(items: Item[], grade: number): Item[] {
  if (!grade) return items;
  return items.filter(it => { const g = itemGrade(it); return g === null || g <= grade; });
}

/** 課綱的類別名稱（首頁分區標題底下那行） */
const CATEGORY: Record<string, string> = {
  N: '數與量', S: '空間與形狀', R: '關係', D: '資料與不確定性',
  Aa: '標音符號', Ab: '字詞', Ac: '句段', Ad: '篇章',
};
export function categoriesOf(items: Item[]): string[] {
  const seen = new Set<string>();
  for (const it of items) for (const c of it.cur) {
    const k = c.match(/^([NSRD])-/)?.[1] ?? c.match(/^([A-D][a-e])-/)?.[1];
    if (k && CATEGORY[k]) seen.add(k);
  }
  const order = Object.keys(CATEGORY);
  return [...seen].sort((a, b) => order.indexOf(a) - order.indexOf(b)).map(k => CATEGORY[k]);
}

/** 一組知識點涵蓋的年級範圍，例如「1–3 年級」；沒標課綱回傳 null */
export function gradeRange(items: Item[]): string | null {
  const gs = items.map(itemGrade).filter((g): g is number => g !== null);
  if (!gs.length) return null;
  const lo = Math.min(...gs), hi = Math.max(...gs);
  return lo === hi ? `${lo} 年級` : `${lo}–${hi} 年級`;
}
