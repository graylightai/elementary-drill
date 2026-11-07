/* DOM 小工具與對話框 */
export const $ = <T extends HTMLElement = HTMLElement>(s: string) => document.querySelector(s) as T;
export const el = <K extends keyof HTMLElementTagNameMap>(t: K, c?: string): HTMLElementTagNameMap[K] => {
  const n = document.createElement(t); if (c) n.className = c; return n;
};

/* ---------- 對話框 ---------- */
type SheetButton = [label: string, fn: () => void, kind?: 'link'];
let sheetEl: HTMLDivElement | null = null;
let sheetCb: (() => void) | undefined;

export function sheet(html: string, buttons: SheetButton[], onClose?: () => void): HTMLDivElement {
  closeSheet();
  sheetEl = el('div', 'sheet');
  const box = el('div', 'box'); box.innerHTML = html;
  buttons.forEach(([label, fn, kind]) => {
    const b = el('button', kind === 'link' ? 'link' : 'primary');
    b.textContent = label; b.onclick = fn; box.append(b);
  });
  sheetEl.append(box); sheetCb = onClose;
  document.body.append(sheetEl);
  return box;
}
export function closeSheet(): void {
  if (!sheetEl) return;
  const cb = sheetCb; sheetEl.remove(); sheetEl = null; sheetCb = undefined; cb?.();
}
