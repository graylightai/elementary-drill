/* ---------- 一年級：整點、半點、日常時間用語（N-1-6） ----------
   課綱：「簡單時刻報讀『整點』與『半點』」「時刻須以鐘面教學」，
   「簡單日期報讀『幾月幾日』；『明天』『今天』『昨天』；『上午』『中午』『下午』『晚上』」，
   「不含曆法結構」——所以日期題不跨月。
   原本的時鐘從「認到五分」起跳，對一年級太前面；這裡補上更前面的入口。 */
import type { Item } from '../../types';
import { rnd, pick, shuffle, uniq } from '../../util';
import { clockSVG } from '../../ui/visuals/clock';

const G1: Item[] = [];
const CUR = ['N-1-6'];
const wrap = (h: number) => ((h - 1 + 12) % 12) + 1;

/* 整點：每個點鐘各一個知識點 */
for (let h = 1; h <= 12; h++) G1.push({
  k: `c.hour.${h}`, g: '整點', subj: 'clock', cur: CUR,
  make: () => {
    const opts = uniq([h, wrap(h + 1), wrap(h - 1), wrap(h + 6)]);
    return { ask: '現在幾點？', svg: clockSVG(h, 0),
      choices: shuffle(opts).map(v => ({ t: `${v} 點`, ok: v === h })),
      hint: `長針指著 12，就是「整點」。短針指著 <b>${h}</b>，所以是 <b>${h} 點</b>。` };
  }
});

/* 半點：最常見的錯是看短針已經過了 h，就唸成 h+1 點半 */
for (let h = 1; h <= 12; h++) G1.push({
  k: `c.half.${h}`, g: '半點', subj: 'clock', cur: CUR,
  make: () => {
    const opts = shuffle([
      { t: `${h} 點半`, ok: true }, { t: `${wrap(h + 1)} 點半`, ok: false },
      { t: `${h} 點`, ok: false }, { t: `${wrap(h + 1)} 點`, ok: false }]);
    return { ask: '現在幾點？', svg: clockSVG(h, 30), choices: opts,
      hint: `長針指著 6，是「半點」。短針走到 ${h} 和 ${wrap(h + 1)} 的中間，
        還沒到 ${wrap(h + 1)}，所以是 <b>${h} 點半</b>。` };
  }
});

/* 昨天、今天、明天：不跨月 */
const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
function calendar(m: number, d: number, w: number): string {
  return `<div class="cal"><div class="cal-m">${m} 月</div><div class="cal-d">${d}</div><div class="cal-w">星期${WEEK[w]}</div></div>`;
}
([['tmr', '明天', 1], ['yst', '昨天', -1]] as const).forEach(([id, word, delta]) => G1.push({
  k: `d.${id}`, g: '昨天今天明天', subj: 'clock', cur: CUR,
  make: () => {
    const m = 1 + rnd(12), d = 3 + rnd(25), w = rnd(7), ans = d + delta;   // 3..27：選項不會出現 0 日或 30 日以上
    const opts = uniq([ans, d - delta, d, ans + delta]);
    return { ask: `今天是 ${m} 月 ${d} 日。${word}是幾月幾日？`, art: calendar(m, d, w),
      choices: shuffle(opts).map(v => ({ t: `${m} 月 ${v} 日`, ok: v === ans })),
      hint: `${word}${delta > 0 ? '是今天的下一天，日期多 1' : '是今天的前一天，日期少 1'}：<b>${m} 月 ${ans} 日</b>。` };
  }
}));

/* 上午、中午、下午、晚上：從生活作息判斷 */
const PARTS = ['上午', '中午', '下午', '晚上'] as const;
const ROUTINE: Record<typeof PARTS[number], string[]> = {
  上午: ['到學校參加升旗', '早上第一節課', '吃完早餐去上學'],
  中午: ['在學校吃午餐', '吃完午餐睡午覺'],
  下午: ['放學回家', '上完最後一節課', '吃點心、寫功課'],
  晚上: ['吃晚餐', '洗澡準備睡覺', '看天上的星星和月亮'],
};
PARTS.forEach((p, i) => G1.push({
  k: `d.part.${i}`, g: '上午中午下午晚上', subj: 'clock', cur: CUR,
  make: () => {
    const act = pick(ROUTINE[p]);
    return { ask: `「${act}」通常是在什麼時候？`,
      choices: PARTS.map(x => ({ t: x, ok: x === p })),
      hint: `一天的順序是：<b>上午 → 中午 → 下午 → 晚上</b>。「${act}」是在<b>${p}</b>。` };
  }
}));

export { G1 as CLOCK_G1 };
