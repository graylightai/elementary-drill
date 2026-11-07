import type { Item, OrderQuestion } from '../../types';
import { S } from '../../engine/store';
import { $, el } from '../dom';
import { sfx } from '../sfx';
import { session, settle, next } from '../quiz';

/* ---------- 色階排序：由淺到深依序點 ---------- */
export function renderOrder(item: Item, q: OrderQuestion): void {
  const s = session!, n = q.items.length;
  let order = q.items.slice();          // 畫面上目前的排列
  let miss = 0;
  const t0 = performance.now();

  const card = $('#card'); card.replaceChildren();
  const ask = el('div', 'ask'); ask.textContent = q.ask; card.append(ask);
  const row = el('div', 'ramprow');
  row.style.gridTemplateColumns = `repeat(${n}, minmax(0,1fr))`;
  card.append(row);
  const ends = el('div', 'rampends');
  ends.innerHTML = '<span>← 淺</span><span>深 →</span>';
  card.append(ends);

  $('#choices').replaceChildren();
  const done = el('button', 'primary'); done.textContent = '排好了';
  $('#feedback').replaceChildren(done);

  function paint() {
    row.replaceChildren(...order.map((it, i) => {
      const d = el('div', 'rampcell');
      d.style.background = it.fill; d.dataset.i = String(i);
      return d;
    }));
  }
  paint();

  /* 拖曳：按住一格跟著手指走，放開時跟底下那一格互換 */
  let from = -1, ghost: HTMLDivElement | null = null, over = -1, gdx = 0, gdy = 0;
  const cellAt = (x: number) => {
    const r = row.getBoundingClientRect();
    if (x < r.left || x > r.right) return -1;
    return Math.max(0, Math.min(n - 1, Math.floor((x - r.left) / (r.width / n))));
  };
  row.addEventListener('pointerdown', e => {
    const cell = (e.target as Element).closest<HTMLElement>('.rampcell'); if (!cell) return;
    from = +cell.dataset.i!;
    const r = cell.getBoundingClientRect();
    ghost = el('div', 'rampghost');
    ghost.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;background:${order[from].fill}`;
    document.body.append(ghost);
    cell.classList.add('lift');
    row.setPointerCapture(e.pointerId);
    gdx = e.clientX - r.left; gdy = e.clientY - r.top;
  });
  row.addEventListener('pointermove', e => {
    if (from < 0) return;
    ghost!.style.left = (e.clientX - gdx) + 'px';
    ghost!.style.top = (e.clientY - gdy) + 'px';
    const t = cellAt(e.clientX);
    if (t !== over) {
      over = t;
      [...row.children].forEach((c, i) => c.classList.toggle('over', i === t && t !== from));
    }
  });
  const drop = () => {
    if (from < 0) return;
    const src = from;
    from = -1; over = -1;                 // 先清狀態：後面任何一行出錯都不會讓拖曳卡死
    let t = -1;
    if (ghost) {
      const g = ghost.getBoundingClientRect();
      t = cellAt((g.left + g.right) / 2);
      ghost.remove(); ghost = null;
    }
    if (t >= 0 && t !== src) {
      [order[src], order[t]] = [order[t], order[src]];
      sfx.step();
    }
    paint();
  };
  row.addEventListener('pointerup', drop);
  row.addEventListener('pointercancel', drop);

  done.onclick = () => {
    const wrong = order.map((it, i) => it.v === i ? -1 : i).filter(i => i >= 0);
    if (!wrong.length) {
      sfx.good(n);
      settle(item, miss === 0, miss === 0 ? performance.now() - t0 : 99999);
      done.textContent = '下一題'; done.onclick = () => next();
      setTimeout(() => { if (session === s) next(); }, 700);
    } else {
      miss++; sfx.bad();
      wrong.forEach(i => {
        const c = row.children[i]; c.classList.add('bad');
        setTimeout(() => c.classList.remove('bad'), 900);
      });
      if (S.hint) {
        let h = $('#feedback').querySelector<HTMLElement>('.hint');
        if (!h) { h = el('div', 'hint'); h.innerHTML = q.hint; $('#feedback').prepend(h); }
      }
    }
  };
}
