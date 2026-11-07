import type { Item, DrawQuestion } from '../../types';
import { $, el } from '../dom';
import { sfx } from '../sfx';
import { GRIDN, glyphCells, bopoSVG } from '../visuals/glyph';
import { session, settle, next } from '../quiz';

type P = [number, number];

/* ---------- 注音描寫 ----------
   不做筆順：我沒有可靠的注音筆順來源，硬編會教錯。
   這裡只看「有沒有把這個符號描出來」——用覆蓋率與出界比例評分。 */
export function renderDraw(item: Item, q: DrawQuestion): void {
  const s = session!, { inside, near, total } = glyphCells(q.ch);
  const painted = new Uint8Array(GRIDN * GRIDN);
  let tries = 0, peeks = 0;
  const t0 = performance.now();

  const card = $('#card'); card.replaceChildren();
  const ask = el('div', 'ask'); ask.textContent = q.ask; card.append(ask);
  const box = el('div'); card.append(box);
  const bar = el('div', 'trbar');
  bar.innerHTML = `<span class="n" id="trn">用手指描過去</span>
    <button id="peek" type="button">看一下</button><button id="clr" type="button">重寫</button>`;
  const why = el('div', 'trwhy');
  const go = el('button', 'primary'); go.textContent = '寫好了';
  go.style.marginTop = '10px';
  $('#choices').replaceChildren();
  $('#feedback').replaceChildren(bar, why, go);

  let svg!: SVGSVGElement, ink!: SVGPolylineElement, strokes: P[][] = [], cur: P[] = [], drawing = false;
  const BRUSH = 1;                      // 筆刷半徑（格）。要跟畫面上的筆跡粗細相當

  function paint(solid?: boolean) {
    box.innerHTML = bopoSVG(q.ch, { solid: !!solid });
    svg = box.querySelector('svg')!; ink = svg.querySelector('.ink')!;
    redraw(); wire();
  }
  function redraw() {
    svg.querySelectorAll('.inkdone').forEach(e => e.remove());
    strokes.forEach(st => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
      p.setAttribute('class', 'ink inkdone');
      p.setAttribute('points', st.map(v => v.map(Math.round).join(',')).join(' '));
      svg.append(p);
    });
  }
  const toSvg = (e: PointerEvent): P => {
    const r = svg.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width * 1024, (e.clientY - r.top) / r.height * 1024];
  };
  function mark(p: P) {
    const gx = Math.floor(p[0] / 1024 * GRIDN), gy = Math.floor(p[1] / 1024 * GRIDN);
    for (let dy = -BRUSH; dy <= BRUSH; dy++) for (let dx = -BRUSH; dx <= BRUSH; dx++) {
      const x = gx + dx, y = gy + dy;
      if (x < 0 || y < 0 || x >= GRIDN || y >= GRIDN) continue;
      if (dx * dx + dy * dy > BRUSH * BRUSH + 1) continue;
      painted[y * GRIDN + x] = 1;
    }
  }
  function wire() {
    svg.addEventListener('pointerdown', e => {
      drawing = true; cur = [toSvg(e)]; mark(cur[0]);
      svg.setPointerCapture(e.pointerId); ink.setAttribute('points', '');
    });
    svg.addEventListener('pointermove', e => {
      if (!drawing) return;
      const p = toSvg(e); const last = cur[cur.length - 1];
      // 補內插點，手指移動快的時候才不會漏格
      const steps = Math.ceil(Math.hypot(p[0] - last[0], p[1] - last[1]) / 10);
      for (let i = 1; i <= steps; i++)
        mark([last[0] + (p[0] - last[0]) * i / steps, last[1] + (p[1] - last[1]) * i / steps]);
      cur.push(p);
      ink.setAttribute('points', cur.map(v => v.map(Math.round).join(',')).join(' '));
    });
    const end = () => {
      if (!drawing) return;
      drawing = false;
      if (cur.length > 1) strokes.push(cur);
      cur = []; redraw(); ink.setAttribute('points', '');
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', end);
    svg.addEventListener('pointerleave', end);
  }
  paint();

  bar.querySelector<HTMLButtonElement>('#peek')!.onclick = () => {
    peeks++; paint(true); setTimeout(() => paint(false), 1400);
  };
  bar.querySelector<HTMLButtonElement>('#clr')!.onclick = () => {
    strokes = []; painted.fill(0); paint(false); why.textContent = '';
  };

  go.onclick = () => {
    // 覆蓋率要寬容：小孩是沿著筆畫中間畫一條線，不會把筆畫塗滿。
    // 所以字形的格子只要「附近 1 格內有畫過」就算覆蓋到。
    let hit = 0, out = 0, drawn = 0;
    for (let i = 0; i < painted.length; i++) {
      if (painted[i]) { drawn++; if (!near[i]) out++; }   // 出界用原始筆跡算，不放寬
      if (!inside[i]) continue;
      const x = i % GRIDN, y = (i / GRIDN) | 0;
      let got = 0;
      for (let dy = -1; dy <= 1 && !got; dy++) for (let dx = -1; dx <= 1; dx++) {
        const a = x + dx, bq = y + dy;
        if (a >= 0 && bq >= 0 && a < GRIDN && bq < GRIDN && painted[bq * GRIDN + a]) { got = 1; break; }
      }
      hit += got;
    }
    const cover = total ? hit / total : 0;
    const spill = drawn ? out / drawn : 1;
    tries++;
    if (cover >= .70 && spill <= .25) {
      const pass = tries === 1 && peeks === 0;
      sfx.win();
      settle(item, pass, pass ? performance.now() - t0 : 99999);
      $('#trn').textContent = `描到 ${Math.round(cover * 100)}%，很好！`;
      why.textContent = '';
      go.textContent = '下一題'; go.onclick = () => next();
      setTimeout(() => { if (session === s) next(); }, 900);
    } else {
      sfx.bad();
      why.textContent = cover < .72
        ? `還有地方沒描到（目前 ${Math.round(cover * 100)}%），把整個符號都蓋過去`
        : '畫到外面太多了，貼著筆畫描';
      $('#trn').textContent = '再試一次';
    }
  };
}
