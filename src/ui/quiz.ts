/* 一輪練習的流程：出題 → 作答 → 結算 */
import type { Item, ChoiceQuestion } from '../types';
import { SUBJECTS, ALL } from '../content';
import { videosFor, embedUrl, type Video } from '../content/videos';
import { forGrade } from '../content/grade';
import { cells, litIds, isLit } from '../engine/mastery';
import { buildSession, grade, today } from '../engine/srs';
import { S, load, save } from '../engine/store';
import { $, el, sheet, closeSheet } from './dom';
import { sfx } from './sfx';
import { zhuyin } from './visuals/zhuyin';
import { renderOrder } from './renderers/order';
import { renderDraw } from './renderers/draw';
import { renderTrace } from './renderers/trace';
import { show } from './pages';

export interface Session {
  subj: string;
  /** 從學習地圖點進來時，只練這一格（細項名稱） */
  group?: string;
  /** 開始前已點亮的格子，結算時比對出「新點亮」 */
  litBefore: Set<string>;
  pool: Item[];
  list: Item[];
  i: number;
  ok: number;
  bad: number;
  extra: number;
  t0: number;
  marks: ('ok' | 'no')[];
  /** 第幾題是因為答錯而插進來的基礎題 */
  remedial: Set<number>;
}
export let session: Session | null = null;
let tick: ReturnType<typeof setInterval> | undefined;

/* 今天累積的練習秒數（跨輪累計，隔天歸零），休息提醒依這個算 */
export let elapsed: { d: number; s: number } = load('g1.time', { d: today(), s: 0 });
if (elapsed.d !== today()) elapsed = { d: today(), s: 0 };
let restMark = Math.floor(elapsed.s / 60 / S.rest);

export function start(subjId: string, group?: string): void {
  const subj = SUBJECTS.find(s => s.id === subjId)!;
  const pool = forGrade(subj.items, S.grade).filter(i => !group || i.g === group);
  const q = buildSession(pool, S.len);
  if (!q.length) return;
  session = { subj: subjId, group, pool, litBefore: litIds(pool), list: q, i: 0, ok: 0, bad: 0, extra: 0,
    t0: performance.now(), marks: [], remedial: new Set() };
  show('quiz');
  stopTimer();
  tick = setInterval(() => {
    elapsed.s++; save('g1.time', elapsed);
    $('#clock').textContent = String(Math.floor(elapsed.s / 60));
  }, 1000);
  render();
}
export const stopTimer = () => clearInterval(tick);

export function drawBar(): void {
  const s = session!;
  $('#pbar').replaceChildren(...s.list.map((_, i) => {
    const b = el('i'); if (s.marks[i]) b.classList.add(s.marks[i]); return b;
  }));
}

/** 一題結束：記錄、計分、上進度條。沒過的這一輪稍後再出一次，當場補強（最多補 3 題，不然會沒完沒了） */
export function settle(item: Item, pass: boolean, ms: number): void {
  const s = session!;
  grade(item.k, pass, ms);
  if (pass) s.ok++; else s.bad++;
  s.marks[s.i] = pass ? 'ok' : 'no';
  if (!pass && s.extra < 3) {
    s.extra++;
    const at = Math.min(s.i + 3, s.list.length);
    s.list.splice(at, 0, item);
    s.remedial = new Set([...s.remedial].map(i => i >= at ? i + 1 : i));
  }
  drawBar();
}

/** 答錯後往回補：把基礎題插在下一題，畫面上會標「先練基礎」。跟補題共用每輪最多 3 題的上限 */
function insertRemedial(keys: string[] | undefined): string[] {
  const s = session!, added: string[] = [];
  for (const k of keys || []) {
    const it = ALL[k];
    if (!it || s.extra >= 3) continue;
    s.extra++;
    const at = s.i + 1 + added.length;
    s.list.splice(at, 0, it);
    // 插進來之後，後面已標記的位置要跟著往後挪
    s.remedial = new Set([...s.remedial].map(i => i >= at ? i + 1 : i)); s.remedial.add(at);
    added.push(k);
  }
  if (added.length) drawBar();
  return added;
}

export function next(): void { session!.i++; render(); }

function render(): void {
  const s = session!;
  drawBar();
  if (s.i >= s.list.length) return finish();
  const item = s.list[s.i];
  const q = item.make();
  if (q.kind === 'trace') return renderTrace(item, q);
  if (q.kind === 'order') return renderOrder(item, q);
  if (q.kind === 'draw') return renderDraw(item, q);
  renderChoice(item, q);
}

/* ---------- 選擇題 ---------- */
function renderChoice(item: Item, q: ChoiceQuestion): void {
  const card = $('#card'); card.replaceChildren();
  const add = (cls: string, html: string) => { const d = el('div', cls); d.innerHTML = html; card.append(d); return d; };

  if (session!.remedial.has(session!.i)) add('remedial', '先練基礎：把這一題練熟，剛剛那題就會了');
  if (q.ask) add('ask', q.ask);
  if (q.img) { const i = el('img', 'artimg'); i.src = `img/${q.img}.png`; i.alt = ''; card.append(i); }
  if (q.svg) add('', q.svg);
  if (q.art) add('', q.art);
  if (q.row) add('', `<div style="display:flex;flex-wrap:wrap;gap:7px;justify-content:center;max-width:300px">${q.row}</div>`);
  if (q.big) add('big', q.big);
  if (q.zy) add('', q.zy);
  if (q.en) add('en', q.en);
  if (q.sub) add('sub', q.sub);
  if (q.cjkBig) add('big', `<span style="font-family:var(--cjk)">${q.cjkBig}</span>`);

  const ch = $('#choices'); ch.replaceChildren();
  $('#feedback').replaceChildren();
  const t0 = performance.now();
  let answered = false;

  q.choices.forEach(c => {
    const b = el('button', 'ch');
    if (c.img) { const i = el('img'); i.src = `img/${c.img}.png`; i.alt = ''; b.append(i); }
    else if (c.zy) b.innerHTML = zhuyin(c.zy) + (c.tag ? `<span class="tag">${c.tag}</span>` : '');
    else if (c.en) b.innerHTML = `<span class="en${c.big ? ' big' : ''}">${c.en}</span>`;
    else if (c.swatch) b.innerHTML = `<span class="sw" style="background:${c.swatch}"></span>` +
      (c.tag ? `<span class="tag">${c.tag}</span>` : '');
    else if (c.art) b.innerHTML = c.art;
    else if (c.cjk) b.innerHTML = `<span class="cjkbig">${c.cjk}</span>`;
    else b.textContent = String(c.t);
    b.onclick = () => {
      if (answered) return;
      answered = true;
      settle(item, !!c.ok, performance.now() - t0);
      [...ch.children].forEach(x => { (x as HTMLButtonElement).disabled = true; });
      if (c.ok) {
        b.classList.add('ok');
        sfx.good(session!.marks.filter(m => m === 'ok').length);
        setTimeout(next, 520);
      } else {
        // 答錯就停在原題：標出正解、給算法提示，按鈕按了才走
        b.classList.add('no');
        [...ch.children].forEach((x, i) => { if (q.choices[i].ok) x.classList.add('ok'); });
        sfx.bad();
        const back = insertRemedial(q.remedial);
        if (S.hint && (q.hint || q.hintArt)) {
          const h = el('div', 'hint');
          h.innerHTML = (q.hintArt ? `<div class="hintart">${q.hintArt}</div>` : '') + (q.hint || '') +
            (back.length ? `<div class="hintnext">下一題先練基礎。</div>` : '');
          $('#feedback').append(h);
        }
        // 有網路才給影片（離線播不了）
        const vids = navigator.onLine ? videosFor(item) : [];
        vids.forEach(v => {
          const b = el('button', 'vid');
          b.type = 'button';
          b.innerHTML = `<span class="play">▶</span><span>看講解影片：${v.title}<small>${v.source}</small></span>`;
          b.onclick = () => playVideo(v);
          $('#feedback').append(b);
        });
        const go = el('button', 'primary'); go.textContent = '知道了，下一題';
        go.style.marginTop = '10px'; go.onclick = next; $('#feedback').append(go);
      }
    };
    ch.append(b);
  });
}

/* ---------- 講解影片：在 app 裡播，關掉就停 ---------- */
function playVideo(v: Video): void {
  const box = sheet(`<div class="vframe"><iframe src="${embedUrl(v)}" title="${v.title}"
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen
      referrerpolicy="strict-origin-when-cross-origin"></iframe></div>
    <p class="vsrc">${v.title}・影片來源：${v.source}</p>`,
    [['看完了', closeSheet]]);
  box.classList.add('vbox');
}

/* ---------- 結算與休息 ---------- */
function finish(): void {
  stopTimer();
  const s = session!;
  const sec = Math.round((performance.now() - s.t0) / 1000);
  const acc = s.ok / Math.max(1, s.ok + s.bad);
  const stars = acc >= .9 ? 3 : acc >= .7 ? 2 : 1;
  sfx.win();
  const mins = Math.floor(elapsed.s / 60);
  const needRest = Math.floor(mins / S.rest) > restMark;
  // 這一輪新點亮的格子
  const nowLit = cells(s.pool).filter(c => isLit(c) && !s.litBefore.has(c.subj + '/' + c.g)).map(c => c.g);
  sheet(`<h3>做完了！</h3>
    <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <div class="score">
      <div><div class="k">答對</div><div class="v">${s.ok}</div></div>
      <div><div class="k">答錯</div><div class="v">${s.bad}</div></div>
      <div><div class="k">用時</div><div class="v">${sec}<small>秒</small></div></div>
    </div>
    ${nowLit.length ? `<div class="newlit">🌟 新點亮：<b>${nowLit.join('、')}</b></div>` : ''}
    <p>${s.bad ? `答錯的 ${s.bad} 題明天會再出現。` : '全對！這些題目會隔比較久才再出現。'}</p>`,
    [['再來一輪', () => { closeSheet(); start(s.subj, s.group); }],
     ['回首頁', () => { closeSheet(); show('home'); }, 'link']],
    () => { if (needRest) { restMark = Math.floor(mins / S.rest); rest(); } });
}

function rest(): void {
  let left = 20;
  const box = sheet(`<h3>休息一下</h3><div class="restnum" id="rn">20</div>
    <p>放下手機，看窗外或房間裡最遠的東西 20 秒。</p>`, []);
  const n = box.querySelector('#rn')!;
  const iv = setInterval(() => { n.textContent = String(--left); if (left <= 0) { clearInterval(iv); closeSheet(); } }, 1000);
}
