/* 科目清單（首頁那幾格）。新增題庫：在對應資料夾加檔案，再掛到這裡。 */
import type { Item, Subject } from '../types';
import { MATH } from './math/g1';
import { BOPO, BOPOW } from './zh/bopo';
import { HANZI, buildHanziItems } from './zh/hanzi';
import { CLOCK } from './clock/clock';
import { ENGLISH } from './english/english';
import { MIXQ, RAMPQ } from './art/color';
import { LOGIC } from './logic/logic';
import type { StrokeData } from '../ui/visuals/glyph';

export const SUBJECTS: Subject[] = [
  { id: 'math',  name: '數學',     ic: '＋', c: '#C94F43', d: '湊十、20 以內加減、進位退位、比大小', items: MATH },
  { id: 'bopo',  name: '注音',     ic: 'ㄅ', c: '#3B7FB5', d: '拼讀、聲調、形近符號辨別', items: BOPO },
  { id: 'bopow', name: '注音描寫', ic: 'ㄅ', c: '#2F7FA8', d: '37 個注音符號，用手指描一次', items: BOPOW },
  { id: 'clock', name: '時鐘',     ic: '🕐', c: '#3B8F63', d: '認到一分、時間差、倒推時刻', items: CLOCK },
  { id: 'hanzi', name: '國字',     ic: '字', c: '#8A5BA8', d: '筆順描字、數筆畫、形近字辨別', items: HANZI },
  { id: 'eng',   name: '英文',     ic: 'A',  c: '#C9772B', d: '大小寫、字母順序、短單字、數字與顏色', items: ENGLISH },
  { id: 'mix',   name: '混色',     ic: '◓',  c: '#D1577E', d: '兩個顏色混在一起會變成什麼色', items: MIXQ },
  { id: 'ramp',  name: '色階',     ic: '階', c: '#2A9D9D', d: '把同一個顏色由淺到深排出來', items: RAMPQ },
  { id: 'logic', name: '圖形邏輯', ic: '◆',  c: '#4C6EC5', d: '找規律、旋轉接續、圖形矩陣', items: LOGIC }
];

/** key → 知識點 */
export const ALL: Record<string, Item> = {};
const index = (items: Item[]) => items.forEach(it => { ALL[it.k] = it; });
SUBJECTS.forEach(s => index(s.items));

/** 筆順資料載入後呼叫，把國字的數筆畫與描字題目掛上去 */
export function addStrokeItems(strokes: Record<string, StrokeData>): void {
  index(buildHanziItems(strokes));
}
