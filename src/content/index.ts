/* 科目清單（首頁那幾格）。新增題庫：在對應資料夾加檔案，再掛到這裡。 */
import type { Item, Subject } from '../types';
import { MATH } from './math/g1';
import { WORD_PROBLEMS } from './math/word';
import { MONEY } from './math/money';
import { PLACE } from './math/place';
import { ARITH_G2 } from './math/g2/arith';
import { MULT } from './math/g2/mult';
import { MEASURE_G2 } from './math/g2/measure';
import { SHAPE_G2 } from './math/g2/shape';
import { MORE_G2 } from './math/g2/more';
import { SHAPE_G1 } from './math/shape1';
import { NUM_G3 } from './math/g3/num';
import { OPS_G3 } from './math/g3/ops';
import { FRAC_G3 } from './math/g3/frac';
import { MEAS_G3 } from './math/g3/meas';
import { GEO_G3 } from './math/g3/geo';

const G3 = [...NUM_G3, ...OPS_G3, ...FRAC_G3, ...MEAS_G3, ...GEO_G3];
const more = (subj: string) => [...MORE_G2, ...G3].filter(i => i.subj === subj);
import { BOPO, BOPOW } from './zh/bopo';
import { HANZI, buildHanziItems } from './zh/hanzi';
import { CLOCK } from './clock/clock';
import { CLOCK_G1 } from './clock/g1';
import { LENGTH } from './compare/length';
import { CLASSIFY } from './compare/classify';
import { ENGLISH } from './english/english';
import { MIXQ, RAMPQ } from './art/color';
import { LOGIC } from './logic/logic';
import type { StrokeData } from '../ui/visuals/glyph';

/* 依 108 課綱的學習領域分區；同一區內照學習順序排。
   id 是學習紀錄與弱點診斷用的，上線後不能改（名稱可以改）。 */
export const SUBJECTS: Subject[] = [
  { id: 'num',   domain: 'math',  name: '認識數字', ic: '十', c: '#A0522D', d: '位值、三四位數、比大小、一位小數、數線', items: [...PLACE, ...more('num')] },
  { id: 'math',  domain: 'math',  name: '加減',     ic: '＋', c: '#C94F43', d: '湊十、進退位、應用題、直式、□ 是多少、估算', items: [...MATH, ...WORD_PROBLEMS, ...ARITH_G2, ...more('math')] },
  { id: 'mul',   domain: 'math',  name: '乘除',     ic: '×', c: '#B04A7A', d: '九九乘法、幾的幾倍、除法、直式乘除、兩步驟', items: [...MULT, ...more('mul')] },
  { id: 'money', domain: 'math',  name: '錢幣',     ic: '元', c: '#B5852A', d: '認錢幣、數錢、換錢、付錢、找錢、大鈔', items: [...MONEY, ...MEASURE_G2.filter(i => i.subj === 'money')] },
  { id: 'clock', domain: 'math',  name: '時鐘與日期', ic: '🕐', c: '#3B8F63', d: '整點半點、昨天明天、幾時幾分、月曆、時分秒', items: [...CLOCK_G1, ...CLOCK, ...MEASURE_G2.filter(i => i.subj === 'clock'), ...more('clock')] },
  { id: 'cmp',   domain: 'math',  name: '量與比較', ic: '量', c: '#6E8B3D', d: '比長短、用尺量、容量、重量、面積、分類', items: [...LENGTH, ...MEASURE_G2.filter(i => i.subj === 'cmp'), ...more('cmp'), ...CLASSIFY] },
  { id: 'frac',  domain: 'math',  name: '分數',     ic: '½', c: '#7A5BC0', d: '平分、幾分之一、幾分之幾、同分母加減', items: [...SHAPE_G2.filter(i => i.subj === 'frac'), ...more('frac')] },
  { id: 'shape', domain: 'math',  name: '圖形',     ic: '△', c: '#2F8A8A', d: '拼一拼、平面與立體、周長、角、圓、展開圖', items: [...SHAPE_G1, ...SHAPE_G2.filter(i => i.subj === 'shape'), ...more('shape')] },
  { id: 'data',  domain: 'math',  name: '規律與表格', ic: '▦', c: '#5E7C9A', d: '數字的規律、一維與二維表格', items: more('data') },
  { id: 'bopo',  domain: 'zh',    name: '注音',     ic: 'ㄅ', c: '#3B7FB5', d: '拼讀、聲調、形近符號辨別', items: BOPO },
  { id: 'bopow', domain: 'zh',    name: '注音描寫', ic: 'ㄅ', c: '#2F7FA8', d: '37 個注音符號，用手指描一次', items: BOPOW },
  { id: 'hanzi', domain: 'zh',    name: '國字',     ic: '字', c: '#8A5BA8', d: '筆順描字、數筆畫、形近字辨別', items: HANZI },
  { id: 'eng',   domain: 'eng',   name: '英文',     ic: 'A',  c: '#C9772B', d: '大小寫、字母順序、短單字、數字與顏色', items: ENGLISH },
  { id: 'mix',   domain: 'extra', name: '混色',     ic: '◓',  c: '#D1577E', d: '兩個顏色混在一起會變成什麼色', items: MIXQ },
  { id: 'ramp',  domain: 'extra', name: '色階',     ic: '階', c: '#2A9D9D', d: '把同一個顏色由淺到深排出來', items: RAMPQ },
  { id: 'logic', domain: 'extra', name: '圖形邏輯', ic: '◆',  c: '#4C6EC5', d: '找規律、旋轉接續、圖形矩陣', items: LOGIC }
];

/** 首頁的分區。note 是分區標題底下的說明；有課綱的區會自動接上課綱類別 */
export const DOMAINS: { id: Subject['domain']; name: string; note: string }[] = [
  { id: 'math',  name: '數學',   note: '108 課綱數學領域' },
  { id: 'zh',    name: '國語文', note: '108 課綱國語文' },
  { id: 'eng',   name: '英語文', note: '課綱從三年級開始，這裡是提早接觸字母和簡單單字' },
  { id: 'extra', name: '課綱以外', note: '色彩（接近藝術領域）與邏輯推理' },
];

/** key → 知識點 */
export const ALL: Record<string, Item> = {};
const index = (items: Item[]) => items.forEach(it => { ALL[it.k] = it; });
SUBJECTS.forEach(s => index(s.items));

/** 筆順資料載入後呼叫，把國字的數筆畫與描字題目掛上去 */
export function addStrokeItems(strokes: Record<string, StrokeData>): void {
  index(buildHanziItems(strokes));
}
