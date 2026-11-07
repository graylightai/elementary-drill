/* 首頁、弱點診斷、設定 */
import { SUBJECTS, ALL, DOMAINS } from '../content';
import { itemGrade, forGrade, gradeRange, categoriesOf } from '../content/grade';
import { WORDS } from '../content/words';
import { SR, SLOW_MS, today } from '../engine/srs';
import { S, saveSettings } from '../engine/store';
import { median } from '../util';
import { $, el } from './dom';
import { sfx } from './sfx';
import { start, elapsed } from './quiz';

export let view = 'home';
export function show(v: string): void {
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('on', p.id === v));
  $('#back').hidden = v === 'home';
  view = v; window.scrollTo(0, 0);
  if (v === 'home') buildHome();
  if (v === 'report') buildReport();
}

const GRADE_NAME = ['全部', '一年級', '二年級', '三年級', '四年級', '五年級', '六年級'];

export function buildHome(): void {
  const t = today();
  $('#lenNote').textContent = String(S.len);

  /* 年級：只列出真的有題目的年級 */
  const has = new Set(SUBJECTS.flatMap(s => s.items.map(itemGrade)).filter((g): g is number => g !== null));
  const chips = $('#gradeSeg'); chips.replaceChildren();
  [0, ...[1, 2, 3, 4, 5, 6].filter(g => has.has(g))].forEach(g => {
    const b = el('button'); b.type = 'button'; b.textContent = GRADE_NAME[g];
    b.setAttribute('aria-pressed', String(S.grade === g));
    b.onclick = () => { S.grade = g; saveSettings(); buildHome(); };
    chips.append(b);
  });
  $('#gradeNote').textContent = S.grade
    ? `只出${S.grade === 1 ? '一年級' : `一年級到${GRADE_NAME[S.grade]}`}學過的內容；英文和課綱以外的不分年級。`
    : '全部年級的題目都會出。選年級可以只複習學過的。';

  /* 依課綱領域分區 */
  const host = $('#subjects'); host.replaceChildren();
  DOMAINS.forEach(dm => {
    const subs = SUBJECTS.filter(s => s.domain === dm.id)
      .map(s => ({ s, items: forGrade(s.items, S.grade) }))
      .filter(x => x.items.length);
    if (!subs.length) return;
    const cats = categoriesOf(subs.flatMap(x => x.items));
    const sec = el('section', 'domain');
    sec.innerHTML = `<h2>${dm.name}</h2><p class="dnote">${dm.note}${cats.length ? `：${cats.join('・')}` : ''}</p>`;
    const list = el('div', 'subjects');
    subs.forEach(({ s, items }) => {
      const due = items.filter(i => !SR[i.k] || SR[i.k].d <= t).length;
      const mastered = items.filter(i => SR[i.k] && SR[i.k].b >= 4).length;
      const range = gradeRange(items);
      // 年級篩掉一部分時，說明改成實際會出的細項，不然會寫著「認到一分」卻不出
      const groups = [...new Set(items.map(i => i.g))];
      const desc = items.length < s.items.length
        ? groups.slice(0, 5).join('、') + (groups.length > 5 ? '…' : '') : s.d;
      const b = el('button', 'subj');
      b.style.setProperty('--c', s.c);
      b.innerHTML = `<div class="ic">${s.ic}</div>
        <div style="flex:1;min-width:0"><div class="t">${s.name}${range ? `<span class="gr">${range}</span>` : ''}</div>
          <div class="d">${desc}</div></div>
        <div class="st"><b>${due}</b>該練<br>${mastered}/${items.length} 熟</div>`;
      b.onclick = () => start(s.id);
      list.append(b);
    });
    sec.append(list);
    host.append(sec);
  });
}

/* ---------- 弱點診斷 ---------- */
function groups() {
  const m: Record<string, { subj: string; g: string; keys: string[] }> = {};
  Object.values(ALL).forEach(it => {
    const r = SR[it.k]; if (!r || !r.n) return;
    const id = it.subj + '/' + it.g;
    (m[id] || (m[id] = { subj: it.subj, g: it.g, keys: [] })).keys.push(it.k);
  });
  return Object.values(m);
}

function buildReport(): void {
  const seen = Object.keys(SR).filter(k => SR[k].n);
  $('#tToday').innerHTML = Math.round(elapsed.s / 60) + '<small> 分</small>';
  $('#tMastered').textContent = String(seen.filter(k => SR[k].b >= 4).length);
  $('#tWeak').textContent = String(seen.filter(k => SR[k].b <= 1 && SR[k].n >= 2).length);

  const host = $('#topics'); host.replaceChildren();
  const gs = groups();
  if (!gs.length) {
    host.innerHTML = `<p class="empty">還沒有資料。練過幾輪之後，這裡會告訴你她卡在哪一個數字、哪一組符號，
      而不是只給一個分數。</p>`;
    return;
  }
  const subjName = (id: string) => SUBJECTS.find(s => s.id === id)!.name;
  gs.sort((a, b) => a.subj.localeCompare(b.subj));
  gs.forEach(g => {
    const rs = g.keys.map(k => SR[k]);
    const prog = rs.reduce((a, r) => a + r.b, 0) / (rs.length * 4);
    const med = median(rs.flatMap(r => r.t));
    // 找出明顯比同組慢、或還在第 0/1 箱的細項
    const weak = g.keys.filter(k => SR[k].b <= 1 && SR[k].n >= 2);
    const slow = g.keys.filter(k => SR[k].t.length >= 2 && median(SR[k].t) > Math.max(med * 1.8, SLOW_MS));
    const d = el('div', 'topic');
    let note = '';
    if (weak.length) note += `<div class="note">還不熟：<b>${weak.slice(0, 6).map(label).join('、')}</b>${weak.length > 6 ? ` 等 ${weak.length} 項` : ''}</div>`;
    if (slow.length) note += `<div class="note">會但很慢（可能還在用數的）：<b>${slow.slice(0, 5).map(label).join('、')}</b></div>`;
    if (!note && prog > .8) note = `<div class="note good">這一組已經很穩了</div>`;
    d.innerHTML = `<div class="hd"><span class="nm">${subjName(g.subj)}・${g.g}</span>
        <span class="pc">${Math.round(prog * 100)}%　${(med / 1000).toFixed(1)}s</span></div>
      <div class="meter"><i style="width:${Math.round(prog * 100)}%"></i></div>${note}`;
    host.append(d);
  });
}

/** 把 key 變成人看得懂的標籤 */
function label(k: string): string {
  const p = k.split('.');
  if (p[0] === 'm') return p[2] || p[1];
  if (p[0] === 'b') { const w = WORDS.find(w => w[0] === p[2]); return w ? w[1] : p[2]; }
  if (p[0] === 'h') return p[2];
  if (p[0] === 'e') { const w = WORDS.find(w => w[0] === p[2]); return w ? w[3] : p[2]; }
  if (p[0] === 'c') return p[1] === 'five' ? p[2] + ' 分' : p[2] + ' 點';
  return p[1];
}

/* ---------- 設定 ---------- */
function seg<T>(host: string, opts: [T, string][], get: () => T, set: (v: T) => void): void {
  const h = $(host); h.replaceChildren();
  opts.forEach(([v, lab]) => {
    const b = el('button'); b.textContent = lab;
    b.setAttribute('aria-pressed', String(get() === v));
    b.onclick = () => { set(v); saveSettings(); syncSettings(); };
    h.append(b);
  });
}
export function syncSettings(): void {
  seg('#segLen', [[8, '8 題'], [12, '12 題'], [16, '16 題'], [20, '20 題']], () => S.len, v => { S.len = v; });
  seg('#segSize', [[0, '標準'], [1, '大'], [2, '特大']], () => S.size, v => { S.size = v; });
  seg('#segHint', [[true, '開'], [false, '關']], () => S.hint, v => { S.hint = v; });
  seg('#segSound', [[true, '開'], [false, '靜音']], () => S.sound, v => { S.sound = v; if (v) sfx.good(2); });
  seg('#segRest', [[5, '5 分'], [10, '10 分'], [15, '15 分'], [0, '不提醒']], () => S.rest, v => { S.rest = v || 9999; });
  document.documentElement.style.fontSize = [15, 16.5, 18.5][S.size] + 'px';
}
