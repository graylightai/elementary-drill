/* 答錯時可以點的講解影片，依 108 課綱代碼對應。
   只放「連結」（開新視窗到對方網站），不嵌入、不下載、不轉存。
   均一教育平台的內容是 CC BY-NC-SA 3.0 TW（非商業）。這個 app 之後若收費，
   要先取得均一書面同意，或維持「只連結、不當作付費功能」。
   每支影片都在 2026-11-07 開過網頁、確認標題無誤。 */

export interface Video { title: string; url: string; source: string }

const junyi = (id: string, title: string): Video =>
  ({ title, url: `https://www.junyiacademy.org/video/${id}`, source: '均一教育平台' });

export const VIDEOS: Record<string, Video[]> = {
  'N-2-13': [junyi('9nWKlQIBOnY', '幾時幾分')],
  'N-3-17': [junyi('YDNqlp27zhg', '點數經過多少時間')],
  'R-2-4':  [junyi('o4N4cEXQ-sk', '認識加與減的關係')],
  'N-2-3':  [junyi('xrun2N1jIk8', '解決加數、減數未知的問題')],
};

/** 一個知識點可以看的影片（依它標的課綱代碼，去重） */
export function videosFor(cur: string[]): Video[] {
  const seen = new Set<string>();
  return cur.flatMap(c => VIDEOS[c] || []).filter(v => !seen.has(v.url) && !!seen.add(v.url));
}
