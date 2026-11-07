/* ---------- 一年級：簡單分類（D-1-1） ----------
   課綱：「能蒐集、分類、記錄、呈現日常生活物品」，
   「觀察分類的模式，知道同一組資料可有不同的分類方式」。
   最後一句是重點：同一組東西，用「會不會飛」分和用「住不住水裡」分，答案不一樣。
   圖都是 app 既有的圖，名稱沿用詞庫。 */
import type { Item } from '../../types';
import { pick, shuffle } from '../../util';
import { WORDS } from '../words';

const C: Item[] = [];
const CUR = ['D-1-1'];
const EXTRA_NAMES: Record<string, string> = { fish: '小魚', pear: '梨子', mango: '芒果' };
const name = (slug: string) => WORDS.find(w => w[0] === slug)?.[1] ?? EXTRA_NAMES[slug] ?? slug;

/** 類別：每一類的成員互斥地挑「一定屬於」的，避免像蜜蜂同時是昆蟲又會飛這種爭議 */
const CATS: Record<string, { label: string; members: string[] }> = {
  fruit:  { label: '水果', members: ['apple', 'banana', 'grapes', 'lemon', 'peach', 'pear', 'pineapple', 'strawberry', 'watermelon', 'mango', 'cherries', 'orange'] },
  sea:    { label: '住在海裡的動物', members: ['whale', 'shark', 'dolphin', 'octopus', 'crab', 'seal', 'squid', 'shrimp', 'lobster'] },
  farm:   { label: '農場的動物', members: ['cow', 'pig', 'sheep', 'horse', 'goat', 'rooster'] },
  insect: { label: '昆蟲', members: ['ant', 'bee', 'butterfly', 'ladybug', 'beetle', 'cricket'] },
  wild:   { label: '森林和草原的動物', members: ['lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'monkey', 'bear', 'fox'] },
};

/* 1) 哪一個不一樣 */
Object.entries(CATS).forEach(([id, cat]) => C.push({
  k: `cls.odd.${id}`, g: '哪一個不一樣', subj: 'cmp', cur: CUR,
  make: () => {
    const same = shuffle([...cat.members]).slice(0, 3);
    const otherId = pick(Object.keys(CATS).filter(k => k !== id));
    const odd = pick(CATS[otherId].members);
    return { ask: '哪一個跟其他的不是同一類？',
      choices: shuffle([...same, odd]).map(s => ({ img: s, ok: s === odd })),
      hint: `${same.map(name).join('、')}都是<b>${cat.label}</b>；${name(odd)}是${CATS[otherId].label}。` };
  }
}));

/* 2) 哪一個是某一類 */
Object.entries(CATS).forEach(([id, cat]) => C.push({
  k: `cls.find.${id}`, g: '找出同一類', subj: 'cmp', cur: CUR,
  make: () => {
    const ans = pick(cat.members);
    const others = shuffle(Object.keys(CATS).filter(k => k !== id)).slice(0, 3).map(k => pick(CATS[k].members));
    return { ask: `哪一個是${cat.label}？`,
      choices: shuffle([ans, ...others]).map(s => ({ img: s, ok: s === ans })),
      hint: `<b>${name(ans)}</b>是${cat.label}。` };
  }
}));

/* 3) 換一個分法，同一個東西的歸屬就不同（雞、貓頭鷹都出現在兩種分法裡）
   規則都挑沒有爭議的：企鵝住不住水裡、狗算不算農場動物這種會吵架的不放 */
const RULES: { id: string; rule: string; yes: string; no: string; set: string[]; odd: string }[] = [
  { id: 'fly',   rule: '會不會飛', yes: '會飛', no: '不會飛', set: ['bird', 'owl', 'parrot', 'penguin'], odd: 'penguin' },
  { id: 'water', rule: '住不住在水裡', yes: '住在水裡', no: '不住在水裡', set: ['fish', 'dolphin', 'whale', 'owl'], odd: 'owl' },
  { id: 'legs',  rule: '有沒有四隻腳', yes: '有四隻腳', no: '沒有四隻腳', set: ['dog', 'cat', 'horse', 'chicken'], odd: 'chicken' },
  // 跟上一組一起看：雞在「腳」的分法落單，在「下蛋」的分法卻跟鴨子、小鳥同一國
  { id: 'egg',   rule: '會不會下蛋', yes: '會下蛋', no: '不會下蛋', set: ['chicken', 'duck', 'bird', 'cow'], odd: 'cow' },
];
RULES.forEach(r => C.push({
  k: `cls.rule.${r.id}`, g: '換一種分法', subj: 'cmp', cur: CUR,
  make: () => ({ ask: `用「${r.rule}」來分，哪一個跟其他的不一樣？`,
    choices: shuffle([...r.set]).map(s => ({ img: s, ok: s === r.odd })),
    hint: `${r.set.filter(s => s !== r.odd).map(name).join('、')}都${r.yes}，<b>${name(r.odd)}</b>${r.no}。
      換一種分法，答案就可能不一樣。` })
}));

export { C as CLASSIFY };
