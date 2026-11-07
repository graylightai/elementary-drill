/* 題庫的安全網。
   1. 學習紀錄靠 key 對應，key 一變舊進度就消失——所以拿改版前的 1211 個 key 當基準，一個都不能少。
   2. 每個出題函式跑很多次，檢查選擇題「剛好一個正解」、選項不重複。
   3. 每個知識點標的課綱代碼都要真的存在。 */
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import type { Item, Choice } from '../src/types';
import { SUBJECTS, ALL, addStrokeItems } from '../src/content';
import legacy from './legacy-keys.json';
import curriculum from '../src/content/curriculum.json';

beforeAll(() => {
  addStrokeItems(JSON.parse(readFileSync(new URL('../public/strokes.json', import.meta.url), 'utf8')));
});

const items = (): Item[] => Object.values(ALL);
const choiceKey = (c: Choice) => JSON.stringify([c.t, c.img, c.zy, c.en, c.swatch, c.tag, c.art, c.cjk]);

describe('學習紀錄相容', () => {
  it('改版前的每個 key 都還在，而且科目與細項名稱沒變', () => {
    const missing: string[] = [], changed: string[] = [];
    for (const [k, v] of Object.entries(legacy as Record<string, { subj: string; g: string }>)) {
      const it = ALL[k];
      if (!it) missing.push(k);
      else if (it.subj !== v.subj || it.g !== v.g) changed.push(`${k}: ${v.subj}/${v.g} → ${it.subj}/${it.g}`);
    }
    expect(missing).toEqual([]);
    expect(changed).toEqual([]);
  });

  it('沒有重複的 key', () => {
    const keys = SUBJECTS.flatMap(s => s.items.map(i => i.k));
    expect(keys.length).toBe(new Set(keys).size);
  });
});

describe('出題', () => {
  it('選擇題剛好一個正解、選項不重複、至少兩個選項', () => {
    const bad: string[] = [];
    for (const it of items()) {
      for (let r = 0; r < 30; r++) {
        const q = it.make();
        if (q.kind) continue;
        const oks = q.choices.filter(c => c.ok).length;
        const keys = q.choices.map(choiceKey);
        if (oks !== 1) { bad.push(`${it.k}: ${oks} 個正解`); break; }
        if (new Set(keys).size !== keys.length) { bad.push(`${it.k}: 選項重複 ${keys.join(' ')}`); break; }
        if (q.choices.length < 2) { bad.push(`${it.k}: 只有 ${q.choices.length} 個選項`); break; }
      }
    }
    expect(bad).toEqual([]);
  });

  it('排序、描字、描注音題有內容', () => {
    for (const it of items()) {
      const q = it.make();
      if (q.kind === 'order') expect(q.items.length).toBeGreaterThanOrEqual(4);
      if (q.kind === 'trace' || q.kind === 'draw') expect(q.ch).toBeTruthy();
    }
  });
});

describe('文字', () => {
  it('英文科以外，題目和提示不會漏出英文圖檔名（例如 fish 沒有中文名稱）', () => {
    const bad: string[] = [];
    for (const it of items().filter(i => i.subj !== 'eng')) for (let r = 0; r < 20; r++) {
      const q = it.make();
      if (q.kind) break;
      const text = [q.ask, q.hint].join(' ').replace(/<[^>]+>/g, '');
      const m = text.match(/[a-z]{3,}/);        // 圖檔名都是小寫；圖形規律的 ABC 是刻意的
      if (m) { bad.push(`${it.k}: ${m[0]}`); break; }
    }
    expect(bad).toEqual([]);
  });
});

describe('往回補', () => {
  it('答錯時要先練的基礎題，key 都真的存在', () => {
    const bad: string[] = [];
    for (const it of items()) for (let r = 0; r < 40; r++) {
      const q = it.make();
      if (q.kind) break;
      for (const k of q.remedial || []) if (!ALL[k]) bad.push(`${it.k} → ${k}`);
    }
    expect([...new Set(bad)]).toEqual([]);
  });

  it('應用題每一題都找得到對應的算式題', () => {
    const miss: string[] = [];
    for (const it of items().filter(i => i.k.startsWith('wp.'))) for (let r = 0; r < 60; r++) {
      const q = it.make();
      if (!q.kind && !q.remedial?.length) { miss.push(`${it.k}: ${q.ask}`); break; }
    }
    expect(miss).toEqual([]);
  });

  it('應用題的答案跟題目敘述算得起來', () => {
    for (const it of items().filter(i => i.k.startsWith('wp.'))) for (let r = 0; r < 60; r++) {
      const q = it.make();
      if (q.kind) continue;
      const [a, b] = (q.ask!.match(/\d+/g) || []).map(Number);
      const ans = Number(q.choices.find(c => c.ok)!.t);
      const kind = it.k.split('.')[1];
      expect(kind === 'add' || kind === 'join' ? a + b : a - b, `${it.k}: ${q.ask}`).toBe(ans);
    }
  });
});

describe('課綱對應', () => {
  const codes = new Set((curriculum as { nodes: { code: string }[] }).nodes.map(n => n.code));

  it('影片對應的課綱代碼都存在', async () => {
    const { VIDEOS } = await import('../src/content/videos');
    expect(Object.keys(VIDEOS).filter(c => !codes.has(c))).toEqual([]);
  });

  it('標的課綱代碼都存在', () => {
    const bad = items().flatMap(it => it.cur.filter(c => !codes.has(c)).map(c => `${it.k}: ${c}`));
    expect(bad).toEqual([]);
  });

  it('數學、注音、國字、時鐘的題目都有標課綱', () => {
    const untagged = items().filter(it => ['math', 'money', 'bopo', 'bopow', 'hanzi', 'clock'].includes(it.subj) && !it.cur.length);
    expect(untagged.map(i => i.k)).toEqual([]);
  });
});
