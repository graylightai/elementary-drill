import type { Item, TraceQuestion } from '../../types';
import { $, el } from '../dom';
import { sfx } from '../sfx';
import { STROKES, FLIP, dataY, medPts, grid, charSVG } from '../visuals/glyph';
import { matchStroke } from '../stroke-match';
import { settle, next } from '../quiz';

type P = [number, number];

/* ---------- 描字 ---------- */
export function renderTrace(item: Item, q: TraceQuestion): void {
  const d = STROKES![q.ch], n = d.s.length;
  const medOf = (i: number) => medPts(d.m[i]);
  let cur = 0, misses = 0, tries = 0, demos = 0;
  const t0 = performance.now();

  const card = $('#card'); card.replaceChildren();
  const ask = el('div', 'ask'); ask.textContent = q.ask; card.append(ask);
  const box = el('div'); card.append(box);

  const bar = el('div', 'trbar');
  bar.innerHTML = `<span class="n" id="trn"></span><button id="trdemo" type="button">看一次怎麼寫</button>`;
  const why = el('div', 'trwhy');
  $('#choices').replaceChildren();
  $('#feedback').replaceChildren(bar, why);

  let svg!: SVGSVGElement, ink!: SVGPolylineElement, pts: P[] = [], drawing = false;
  function paint() {
    box.innerHTML = charSVG(q.ch, { done: cur, cur });
    svg = box.querySelector('svg')!; ink = svg.querySelector('.ink')!;
    $('#trn').textContent = `第 ${Math.min(cur + 1, n)} / ${n} 畫`;
    wire();
  }
  const toSvg = (e: PointerEvent): P => {
    const r = svg.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * 1024, (e.clientY - r.top) / r.height * 1024];
  };
  function wire() {
    svg.addEventListener('pointerdown', e => {
      if (cur >= n) return;
      drawing = true; pts = [toSvg(e)]; svg.setPointerCapture(e.pointerId); ink.setAttribute('points', '');
    });
    svg.addEventListener('pointermove', e => {
      if (!drawing) return;
      pts.push(toSvg(e));
      ink.setAttribute('points', pts.map(p => p.map(Math.round).join(',')).join(' '));
    });
    const end = () => { if (drawing) { drawing = false; judge(); } };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('pointerleave', end);
  }

  function judge() {
    const r = matchStroke(pts, medOf(cur));
    if (r.ok) {
      sfx.good(cur + 1); why.textContent = ''; tries = 0; cur++;
      if (cur >= n) return done();
      paint();
    } else {
      misses++; tries++; sfx.bad();
      why.textContent = r.why + (tries >= 3 ? '　看一下示範吧' : '');
      if (tries >= 3) { demo(); tries = 0; }
      else setTimeout(paint, 450);
    }
  }

  /* 用 mask 沿著筆畫中線把輪廓一點一點露出來 */
  function demo() {
    demos++;
    const mid = medPts(d.m[cur]).map(p => [p[0], dataY(p[1])]);   // 回到資料座標給 mask 用
    const dd = 'M' + mid.map(p => p.join(' ')).join('L');
    box.innerHTML = `<svg class="tr" viewBox="0 0 1024 1024">${grid()}
      <defs><mask id="mk"><path id="mp" d="${dd}" stroke="#fff" stroke-width="200"
        fill="none" stroke-linecap="round" stroke-linejoin="round" transform="${FLIP}"/></mask></defs>
      <g transform="${FLIP}">
        ${d.s.map((p, i) => `<path d="${p}" class="${i < cur ? 'st-done' : 'st-ghost'}"/>`).join('')}
      </g>
      <path d="${d.s[cur]}" class="st-done" transform="${FLIP}" mask="url(#mk)"/></svg>`;
    const mp = box.querySelector<SVGPathElement>('#mp')!, L = mp.getTotalLength();
    mp.style.strokeDasharray = String(L); mp.style.strokeDashoffset = String(L);
    const a = mp.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }],
      { duration: Math.max(500, L * 1.1), easing: 'ease-in-out', fill: 'forwards' });
    a.onfinish = () => setTimeout(paint, 420);
  }

  function done() {
    const ms = performance.now() - t0;
    const pass = misses <= Math.floor(n / 4) && demos === 0;
    settle(item, pass, pass ? ms : 99999);      // 用了示範或錯太多就不算熟
    box.innerHTML = charSVG(q.ch, { done: n, cur: -1, ink: false });
    sfx.win();
    why.textContent = '';
    $('#trn').textContent = pass ? `${n} 畫，全對！` : `${n} 畫，寫完了`;
    const go = el('button', 'primary'); go.textContent = '下一題';
    go.style.marginTop = '10px'; go.onclick = next;
    $('#feedback').append(go);
    bar.querySelector<HTMLButtonElement>('#trdemo')!.disabled = true;
  }

  paint();
  bar.querySelector<HTMLButtonElement>('#trdemo')!.onclick = () => { if (cur < n) demo(); };
}
