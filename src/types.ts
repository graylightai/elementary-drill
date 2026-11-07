/* 整個 app 共用的型別。
   題庫（src/content）只依賴這個檔與 visuals，不碰畫面與儲存。 */

/** 選擇題的一個選項。依欄位決定怎麼畫，優先順序見 ui/renderers/choice.ts */
export interface Choice {
  ok: boolean;
  t?: string | number;      // 純文字／數字
  img?: string;             // public/img/<img>.png
  zy?: string[];            // 直式注音（每個元素一個音節）
  en?: string;              // 英文
  big?: boolean;            // 英文用大字
  swatch?: string;          // 色塊
  tag?: string;             // 色塊或注音底下的小字
  art?: string;             // 任意 SVG/HTML
  cjk?: string;             // 大字國字
}

/** 一般選擇題 */
export interface ChoiceQuestion {
  kind?: undefined;
  ask?: string;
  img?: string;
  svg?: string;
  art?: string;
  row?: string;
  big?: string;
  zy?: string;
  en?: string;
  sub?: string;
  cjkBig?: string;
  choices: Choice[];
  hint?: string;
  hintArt?: string;
  /** 答錯時緊接著先練的基礎題（知識點 key），例如應用題錯了就先練那個加減事實 */
  remedial?: string[];
}

/** 拖曳排序（色階） */
export interface OrderQuestion {
  kind: 'order';
  ask: string;
  items: { v: number; fill: string }[];
  hint: string;
}

/** 依筆順描國字 */
export interface TraceQuestion {
  kind: 'trace';
  ask: string;
  ch: string;
}

/** 描注音符號（不評筆順，只看覆蓋率） */
export interface DrawQuestion {
  kind: 'draw';
  ask: string;
  ch: string;
}

export type Question = ChoiceQuestion | OrderQuestion | TraceQuestion | DrawQuestion;

/** 一個知識點。k 是學習紀錄的 key，一旦上線就不能改，改了舊進度會消失 */
export interface Item {
  k: string;
  g: string;                 // 細項名稱，弱點診斷依這個分組
  subj: string;              // 屬於哪個科目（首頁那一格）
  cur: string[];             // 對應的 108 課綱學習內容代碼，例如 ['N-1-3']；課綱外內容為空陣列
  make: () => Question;
}

export interface Subject {
  id: string;
  name: string;
  ic: string;
  c: string;
  d: string;
  items: Item[];
}

/** 一個知識點的學習紀錄 */
export interface Rec {
  b: number;                 // Leitner 箱號 0..4
  d: number;                 // 到期日（epoch 天數）
  n: number;                 // 作答次數
  ok: number;
  bad: number;
  t: number[];               // 最近 5 次反應時間（毫秒）
}
