/* 答錯時可以看的講解影片，依 108 課綱代碼對應。
   用 YouTube 官方嵌入播放器在 app 裡直接播：影片仍從均一的頻道播出、觀看數算均一的，
   不下載、不轉存、不剪輯。播放器用 youtube-nocookie.com（不寫追蹤 cookie），
   rel=0 讓片尾推薦只限同一個頻道。
   均一教育平台的內容是 CC BY-NC-SA 3.0 TW（非商業）。這個 app 之後若收費，
   要先取得均一書面同意，或不把影片當作付費功能的一部分。
   每支影片都在 2026-11-07 用 YouTube oEmbed 確認過：在均一官方頻道 @JunyiAcademy、允許嵌入。 */

export interface Video { title: string; yt: string; source: string; page: string }

const junyi = (yt: string, title: string): Video =>
  ({ title, yt, source: '均一教育平台', page: `https://www.junyiacademy.org/video/${yt}` });

export const VIDEOS: Record<string, Video[]> = {
  'N-2-13': [junyi('9nWKlQIBOnY', '幾時幾分')],
  'N-3-17': [junyi('YDNqlp27zhg', '點數經過多少時間')],
  'R-2-4':  [junyi('o4N4cEXQ-sk', '認識加與減的關係')],
  'N-2-3':  [junyi('xrun2N1jIk8', '解決加數、減數未知的問題')],
};

/** 嵌入用網址 */
export const embedUrl = (v: Video) =>
  `https://www.youtube-nocookie.com/embed/${v.yt}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;

/** 一個知識點可以看的影片（依它標的課綱代碼，去重） */
export function videosFor(cur: string[]): Video[] {
  const seen = new Set<string>();
  return cur.flatMap(c => VIDEOS[c] || []).filter(v => !seen.has(v.yt) && !!seen.add(v.yt));
}
