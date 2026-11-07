/* ---------- 直式注音 ----------
   照教育部的標法：符號由上往下排，二三四聲標在最後一個符號的右邊，
   輕聲（˙）標在第一個符號的上方，一聲不標。 */
const TONES = ['', 'ˊ', 'ˇ', 'ˋ', '˙'];
const baseOf = (z: string) => z.replace(/[ˊˇˋ˙]/g, '');
const toneOf = (z: string) => (z.match(/[ˊˇˋ˙]/) || [''])[0];
// ˊ是二聲、ˇ三聲、ˋ四聲，所以 indexOf 要 +2（之前用 ' ˊˇˋ' 查表整組少一聲）
const toneNo = (z: string) => { const t = toneOf(z); return t === '' ? 1 : t === '˙' ? 5 : 'ˊˇˋ'.indexOf(t) + 2; };

/** 一個音節 → 直式 HTML */
const TONE_SVG: Record<string, string> = {
  'ˊ': '<svg class="tn" viewBox="0 0 10 16" aria-hidden="true"><path d="M2.3 12.6 7.7 3.4"/></svg>',
  'ˇ': '<svg class="tn" viewBox="0 0 10 16" aria-hidden="true"><path d="M2.1 4.4 5 12.4 7.9 4.4"/></svg>',
  'ˋ': '<svg class="tn" viewBox="0 0 10 16" aria-hidden="true"><path d="M2.3 3.4 7.7 12.6"/></svg>',
  '˙': '<svg class="tn up" viewBox="0 0 10 10" aria-hidden="true"><circle class="dot" cx="5" cy="5" r="3.1"/></svg>'
};
function syl(zy: string): string {
  const t = toneOf(zy), syms = baseOf(zy).split('');
  return `<span class="syl">${syms.map(s => `<b>${s}</b>`).join('')}${TONE_SVG[t] || ''}</span>`;
}
/** 一個詞（含多個音節）→ 直式注音 HTML；withHan 會把國字排在注音右邊 */
function zhuyin(sylArr: string[], han?: string): string {
  const cols = sylArr.map((z, i) => han
    ? `<span class="col"><span class="han">${han[i]}</span>${syl(z)}</span>`
    : `<span class="col">${syl(z)}</span>`);
  return `<span class="zy n${sylArr.length}">${cols.join('')}</span>`;
}

export { TONES, baseOf, toneOf, toneNo, syl, zhuyin };
