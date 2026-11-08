/* 答錯時可以看的講解影片。
   用 YouTube 官方嵌入播放器在 app 裡直接播：影片仍從均一的頻道播出、觀看數算均一的，
   不下載、不轉存、不剪輯。播放器用 youtube-nocookie.com（不寫追蹤 cookie），
   rel=0 讓片尾推薦只限同一個頻道。
   均一教育平台的內容是 CC BY-NC-SA 3.0 TW（非商業）。這個 app 之後若收費，
   要先取得均一書面同意，或不把影片當作付費功能的一部分。
   下面每一支都用 YouTube oEmbed 確認過：在均一官方頻道 @JunyiAcademy、允許嵌入
   （一年級與時鐘那幾支 2026-11-07，二年級 2026-11-08）。 */
import type { Item } from '../types';

export interface Video { title: string; yt: string; source: string }

/** 影片庫：YouTube id → 標題（照均一原標題，去掉【概念】【解題】） */
const LIB: Record<string, string> = {
  '9nWKlQIBOnY': '幾時幾分',
  'YDNqlp27zhg': '點數經過多少時間',
  'o4N4cEXQ-sk': '認識加與減的關係',
  'xrun2N1jIk8': '解決加數、減數未知的問題',
  'C2eu2LFT8PM': '解決被加數未知的問題',
  'qriyC16bmr4': '解決被減數未知的問題',
  'x-usq3KRVG4': '認識 1000 以內的數',
  'DCLQR309fyw': '認識「百位」',
  'bu938zwaedo': '1000 以內數的大小比較',
  'M3LiA_FAxdE': '二位數不進退位的加減直式計算',
  'vMJkp_oaXmw': '二位數進位的加法直式計算',
  'RBo2H4kc-yY': '二位數退位的減法直式計算',
  '6IHZVgBLlHo': '認識 100 元、500 元、1000 元',
  'V5u1sWAIfho': '認識倍的語言',
  '58h95nYVvJg': '認識 10、1、0 的乘法',
  'dn0rScdLXNI': '認識 2、5 的乘法',
  'EMGBRNi5eUE': '認識 4、8 的乘法',
  'R5nzt9WkoOE': '認識 3、6 的乘法',
  'bOpMEm5q1T4': '認識 7、9 的乘法',
  'UkBauwBje1c': '分裝問題',
  'RrysBIOLHOA': '平分問題',
  'CtTeZBl4qe0': '認識等分',
  'mK6iKVto_IQ': '單位分數',
  '3oDoN8T6eB4': '認識公分',
  'a04kSYi8jwE': '認識公尺',
  'OuCseXFTbZc': '認識年、月、日和星期',
  '9Y8VSx0d9SY': '認識簡單平面圖形的特徵',
  'nN_ypaMi_cE': '認識簡單立體形體的特徵',
};
export const VIDEO_IDS = Object.keys(LIB);

/** 依課綱代碼的預設影片；題目可以用 Item.vids 指定得更精準 */
export const VIDEOS: Record<string, string[]> = {
  'N-2-13': ['9nWKlQIBOnY'],
  'N-3-17': ['YDNqlp27zhg'],
  'R-2-4':  ['o4N4cEXQ-sk'],
  'N-2-1':  ['x-usq3KRVG4', 'DCLQR309fyw'],
  'R-2-1':  ['bu938zwaedo'],
  'N-2-5':  ['6IHZVgBLlHo'],
  'N-2-10': ['CtTeZBl4qe0', 'mK6iKVto_IQ'],
  'N-2-14': ['OuCseXFTbZc'],
};

const asVideo = (yt: string): Video => ({ yt, title: LIB[yt], source: '均一教育平台' });

/** 嵌入用網址 */
export const embedUrl = (v: Video) =>
  `https://www.youtube-nocookie.com/embed/${v.yt}?rel=0&modestbranding=1&playsinline=1&autoplay=1`;

/** 一個知識點可以看的影片：有指定就用指定的，否則依課綱代碼（去重） */
export function videosFor(it: Pick<Item, 'cur' | 'vids'>): Video[] {
  const ids = it.vids ?? it.cur.flatMap(c => VIDEOS[c] || []);
  return [...new Set(ids)].filter(id => LIB[id]).map(asVideo);
}
