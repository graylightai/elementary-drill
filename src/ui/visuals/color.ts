/* ---------- 顏色 ----------
   混色用顏料（減法混色），這是美術課教的那一套，不是螢幕的 RGB。 */
const CHIP = (hex: string, size = 76) =>
  `<span class="chip-c" style="--c:${hex};--s:${size}px"></span>`;
const COLORS: Record<string, string> = {
  紅: '#E03131', 黃: '#F3C218', 藍: '#2A6FD6', 橙: '#F08C1E', 綠: '#2F9E44',
  紫: '#8043B8', 白: '#FFFFFF', 黑: '#2B2621', 棕: '#9A6238', 灰: '#9AA0A6',
  // 加白變淺的那幾個，色票直接用「原色和白各半」算出來的值，
  // 畫面才不會跟教的內容打架
  粉紅: '#F09AA4', 淺藍: '#94B7EB', 淺綠: '#97CFA2', 淺橙: '#F7C68F', 淺紫: '#BFA1DB',
  深紅: '#85292A', 深藍: '#2A4A7B', 深綠: '#2D6232'
};

export { CHIP, COLORS };
