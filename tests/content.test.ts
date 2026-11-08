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

  it('影片對應的課綱代碼都存在，指定的影片都在影片庫裡', async () => {
    const { VIDEOS, VIDEO_IDS } = await import('../src/content/videos');
    expect(Object.keys(VIDEOS).filter(c => !codes.has(c))).toEqual([]);
    const lib = new Set(VIDEO_IDS);
    const bad = [...Object.values(VIDEOS).flat(), ...items().flatMap(i => i.vids || [])].filter(id => !lib.has(id));
    expect(bad).toEqual([]);
  });

  it('標的課綱代碼都存在', () => {
    const bad = items().flatMap(it => it.cur.filter(c => !codes.has(c)).map(c => `${it.k}: ${c}`));
    expect(bad).toEqual([]);
  });

  it('數學、注音、國字、時鐘的題目都有標課綱', () => {
    const untagged = items().filter(it => ['math', 'num', 'mul', 'money', 'clock', 'cmp', 'frac', 'shape', 'bopo', 'bopow', 'hanzi'].includes(it.subj) && !it.cur.length);
    expect(untagged.map(i => i.k)).toEqual([]);
  });
});

describe('年級篩選', () => {
  it('課綱代碼換算年級', async () => {
    const { gradeOf } = await import('../src/content/grade');
    expect([gradeOf('N-1-3'), gradeOf('N-2-13'), gradeOf('S-6-4'), gradeOf('Aa-I-3'), gradeOf('Ab-II-1'), gradeOf('Ad-III-2'), gradeOf('xx')])
      .toEqual([1, 2, 6, 1, 3, 5, null]);
  });

  it('選一年級時，時鐘只剩整點、半點、日期，沒有認到一分', async () => {
    const { forGrade } = await import('../src/content/grade');
    const clock = SUBJECTS.find(s => s.id === 'clock')!.items;
    const g1 = forGrade(clock, 1).map(i => i.g);
    expect(new Set(g1)).toEqual(new Set(['整點', '半點', '昨天今天明天', '上午中午下午晚上']));
    expect(forGrade(clock, 0).length).toBe(clock.length);
  });

  it('每個科目都歸到一個首頁分區', async () => {
    const { DOMAINS } = await import('../src/content');
    const ids = new Set(DOMAINS.map(d => d.id));
    expect(SUBJECTS.filter(s => !ids.has(s.domain)).map(s => s.id)).toEqual([]);
  });
});

describe('二年級計算題的答案', () => {
  const ans = (q: { choices: Choice[] }) => Number(String(q.choices.find(c => c.ok)!.t).replace(/[^0-9]/g, ''));
  it('直式加減：答案等於題目的兩個數相加或相減', () => {
    for (const it of items().filter(i => i.k.startsWith('vt.'))) for (let r = 0; r < 80; r++) {
      const q = it.make(); if (q.kind) continue;
      const rows = [...q.art!.matchAll(/<div class="vrow">(.*?)<\/div>/g)].map(m => Number(m[1].replace(/<[^>]+>/g, '').replace(/[^0-9]/g, '')));
      const [a, b] = rows, plus = q.art!.includes('＋');
      expect(ans(q), `${it.k} ${a} ${plus ? '+' : '-'} ${b}`).toBe(plus ? a + b : a - b);
    }
  });
  it('□ 是多少：把答案代回去算式成立', () => {
    for (const it of items().filter(i => i.k.startsWith('unk.'))) for (let r = 0; r < 80; r++) {
      const q = it.make(); if (q.kind) continue;
      const expr = q.big!.replace('□', String(ans(q))).replace(/＋/g, '+').replace(/－/g, '-').replace('＝', '===');
      expect(Function(`return ${expr}`)(), `${it.k}: ${q.big}`).toBe(true);
    }
  });
  it('九九乘法：答案等於兩數相乘', () => {
    for (const it of items().filter(i => /^x\.\d+x\d+$/.test(i.k))) {
      const q = it.make(); if (q.kind) continue;
      const [a, b] = q.big!.split('×').map(Number);
      expect(ans(q), it.k).toBe(a * b);
    }
  });
});

describe('學習地圖', () => {
  it('每個細項一格，進度是箱號平均，75% 以上點亮', async () => {
    const { cells, isLit } = await import('../src/engine/mastery');
    const { SR } = await import('../src/engine/srs');
    const t10 = items().filter(i => i.g === '湊十');
    t10.forEach((it, i) => { SR[it.k] = { b: i < 6 ? 4 : 2, d: 0, n: 1, ok: 1, bad: 0, t: [1] }; });
    const [c] = cells(t10);
    expect(c.g).toBe('湊十');
    expect(c.prog).toBeCloseTo((6 * 4 + 3 * 2) / (9 * 4));   // 30/36 ≈ 83%
    expect(isLit(c)).toBe(true);
    t10.forEach(it => { delete SR[it.k]; });
    expect(isLit(cells(t10)[0])).toBe(false);
    const all = cells(items());
    expect(all.length).toBe(new Set(items().map(i => i.subj + '/' + i.g)).size);
  });
});

describe('二年級應用題的答案', () => {
  const ans = (q: { choices: Choice[] }) => Number(String(q.choices.find(c => c.ok)!.t).replace(/[^0-9]/g, ''));
  const nums = (s: string) => (s.match(/\d+/g) || []).map(Number);
  it('兩步驟：照題目的數字一步一步算', () => {
    for (let r = 0; r < 100; r++) {
      const get = (k: string) => { const q = ALL[k].make(); if (q.kind) throw 0; return q; };
      let q = get('two.addsub'); let [a, b, c] = nums(q.ask!); expect(ans(q), q.ask).toBe(a - b + c);
      q = get('two.multadd'); [a, b, c] = nums(q.ask!); expect(ans(q), q.ask).toBe(q.ask!.includes('送') ? a * b + c : a * b - c);
      q = get('two.addmult'); [a, b, c] = nums(q.ask!); expect(ans(q), q.ask).toBe((a + b) * c);
      q = get('sum3'); expect(ans(q), q.big).toBe(nums(q.big!).reduce((x, y) => x + y, 0));
    }
  });
  it('估算：答案是四捨五入到百位後再算', () => {
    const r100 = (n: number) => Math.round(n / 100) * 100;
    for (let r = 0; r < 100; r++) {
      let q = ALL['est.add'].make(); if (q.kind) throw 0;
      let [a, b] = nums(q.ask!); expect(ans(q), q.ask).toBe(r100(a) + r100(b));
      q = ALL['est.sub'].make(); if (q.kind) throw 0;
      [a, b] = nums(q.ask!); expect(ans(q), q.ask).toBe(a - r100(b));
    }
  });
});
