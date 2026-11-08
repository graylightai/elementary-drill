/* 熟練度：學習地圖上每一格（細項 g）亮不亮。
   進度＝這一格所有知識點的箱號平均（0～4 箱換成 0～100%），跟弱點診斷的百分比是同一個算法。
   75% 以上就點亮——大約是每一題都答對、而且夠快地升過三次箱。 */
import type { Item } from '../types';
import { SR } from './srs';

export const LIT = 0.75;

export interface Cell { subj: string; g: string; items: Item[]; prog: number; tried: number }

/** 依細項分格，保留題庫裡的先後順序 */
export function cells(items: Item[]): Cell[] {
  const m = new Map<string, Cell>();
  for (const it of items) {
    const id = it.subj + '/' + it.g;
    if (!m.has(id)) m.set(id, { subj: it.subj, g: it.g, items: [], prog: 0, tried: 0 });
    m.get(id)!.items.push(it);
  }
  for (const c of m.values()) {
    c.prog = c.items.reduce((a, it) => a + (SR[it.k]?.b ?? 0), 0) / (c.items.length * 4);
    c.tried = c.items.filter(it => SR[it.k]?.n).length;
  }
  return [...m.values()];
}

export const isLit = (c: Cell) => c.prog >= LIT;

/** 目前已點亮的格子 id（結算時比對「新點亮」用） */
export const litIds = (items: Item[]) => new Set(cells(items).filter(isLit).map(c => c.subj + '/' + c.g));
