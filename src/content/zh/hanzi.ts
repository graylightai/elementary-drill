import type { Item } from '../../types';
import { pick, shuffle, uniq, distract } from '../../util';
import type { StrokeData } from '../../ui/visuals/glyph';

/* ---------- 國字 ----------
   筆順資料來自 Make Me a Hanzi，座標是 1024 的字框、y 軸朝上，
   所以畫的時候整組套 scale(1,-1) translate(0,-900)。
   注意：這份資料的筆順沿用中國大陸的規範，絕大多數字跟教育部標準一致，
   少數字（如「方」「出」）會有差異，家長須知裡有說明。 */
const HANZI_SIM: [string, string][] = [['日','目'],['人','入'],['大','犬'],['土','士'],['木','禾'],['手','毛'],
  ['千','干'],['天','夫'],['刀','力'],['白','百'],['王','玉'],['牛','午'],['田','由'],
  ['自','白'],['石','右'],['元','兄'],['十','土'],['水','永'],['免','兔'],['未','末']];
const HANZI: Item[] = HANZI_SIM.map(([a, b]) => ({
  k: `h.sim.${a}${b}`, g: '形近國字', subj: 'hanzi', cur: ['Ab-I-1'],
  make: () => {
    const t = pick([a, b]), partner = t === a ? b : a;
    const others = shuffle(uniq(HANZI_SIM.flat()).filter(x => x !== t && x !== partner)).slice(0, 2);
    return { ask: '哪一個跟上面一樣？', cjkBig: t,
      choices: shuffle([t, partner, ...others]).map(z => ({ cjk: z, ok: z === t })),
      hint: `<b>${a}</b> 和 <b>${b}</b> 只差一點點，要看清楚。` };
  }
}));

/* ---------- 兩種題型 ---------- */
/** 筆順資料載入後才呼叫：把數筆畫與描字題目加進 HANZI，回傳新加的題目 */
function buildHanziItems(STROKES: Record<string, StrokeData>): Item[] {
  const before = HANZI.length;
  const chars = Object.keys(STROKES);
  chars.forEach(ch => {
    const n = STROKES[ch].s.length;
    HANZI.push({                                       // 幾畫（選擇題）
      k: `h.count.${ch}`, g: '數筆畫', subj: 'hanzi', cur: ['Ab-I-1', 'Ab-I-3'],
      make: () => ({ ask: '這個字有幾畫？', cjkBig: ch,
        choices: distract(n, 1, 24).map(v => ({ t: v, ok: v === n })),
        hint: `「${ch}」有 <b>${n}</b> 畫。` })
    });
    if (n <= 12) HANZI.push({                          // 描字（手寫）
      k: `h.trace.${ch}`, g: '筆順描字', subj: 'hanzi', cur: ['Ab-I-1', 'Ab-I-3'],
      make: () => ({ kind: 'trace' as const, ch, ask: `照著筆順寫「${ch}」` })
    });
  });
  return HANZI.slice(before);
}

export { HANZI, buildHanziItems };
