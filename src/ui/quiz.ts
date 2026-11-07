/* 一輪練習的流程：出題 → 作答 → 結算 */
import type { Item, ChoiceQuestion } from '../types';
import { SUBJECTS } from '../content';
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
  list: Item[];
  i: number;
  ok: number;
  bad: number;
  extra: number;
  t0: number;
  marks: ('ok' | 'no')[];
}
export let session: Session | null = null;
let tick: ReturnType<typeof setInterval> | undefined;

/* 今天累積的練習秒數（跨輪累計，隔天歸零），休息提醒依這個算 */
export let elapsed: { d: number; s: number } = load('g1.time', { d: today(), s: 0 });
if (elapsed.d !== today()) elapsed = { d: today(), s: 0 };
let restMark = Math.floor(elapsed.s / 60 / S.rest);

export function start(subjId: string): void {
  const subj = SUBJECTS.find(s => s.id === subjId)!;
  const q = buildSession(subj.items, S.len);
  if (!q.length) return;
  session = { subj: subjId, list: q, i: 0, ok: 0, bad: 0, extra: 0, t0: performance.now(), marks: [] };
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
  if (!pass && s.extra < 3) { s.extra++; s.list.splice(Math.min(s.i + 3, s.list.length), 0, item); }
  drawBar();
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
        if (S.hint && (q.hint || q.hintArt)) {
          const h = el('div', 'hint');
          h.innerHTML = (q.hintArt ? `<div class="hintart">${q.hintArt}</div>` : '') + (q.hint || '');
          $('#feedback').append(h);
        }
        const go = el('button', 'primary'); go.textContent = '知道了，下一題';
        go.style.marginTop = '10px'; go.onclick = next; $('#feedback').append(go);
      }
    };
    ch.append(b);
  });
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
  sheet(`<h3>做完了！</h3>
    <div class="stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
    <div class="score">
      <div><div class="k">答對</div><div class="v">${s.ok}</div></div>
      <div><div class="k">答錯</div><div class="v">${s.bad}</div></div>
      <div><div class="k">用時</div><div class="v">${sec}<small>秒</small></div></div>
    </div>
    <p>${s.bad ? `答錯的 ${s.bad} 題明天會再出現。` : '全對！這些題目會隔比較久才再出現。'}</p>`,
    [['再來一輪', () => { closeSheet(); start(s.subj); }],
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
