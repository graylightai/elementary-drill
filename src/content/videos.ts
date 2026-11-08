/* 答錯時可以看的講解影片。
   用 YouTube 官方嵌入播放器在 app 裡直接播：影片仍從均一的頻道播出、觀看數算均一的，
   不下載、不轉存、不剪輯。播放器用 youtube-nocookie.com（不寫追蹤 cookie），
   rel=0 讓片尾推薦只限同一個頻道。
   均一教育平台的內容是 CC BY-NC-SA 3.0 TW（非商業）。這個 app 之後若收費，
   要先取得均一書面同意，或不把影片當作付費功能的一部分。
   下面每一支都用 YouTube oEmbed 確認過：在均一官方頻道 @JunyiAcademy、允許嵌入
   （一年級與時鐘那幾支 2026-11-07，二、三年級 2026-11-08）。 */
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
  'M6MenPw4z5I': '三位數的加減估算',
  '3__RmyOCDsk': '連加兩步驟問題及加法結合律',
  '9TIsp5p-eQ0': '兩步驟的加減混合問題',
  'ZSvWCYyxR7M': '先乘再加（或減）的兩步驟問題',
  'dYaYLu-Dll0': '先加（或減）再乘的兩步驟問題',
  'CPabaPZfwFc': '認識容量的意義與比較',
  'OhP9M1q4fDU': '認識重量的意義與比較',
  'dbFQX6sFO1Q': '認識面積的意義與比較',
  // 三年級（2026-11-08 確認）
  '-LBTQcKknCg': '同分母分數的大小比較',
  '0Yz3lf77sQA': '重量的加減問題',
  '3GvZQw_gIHU': '數字或數量的規律',
  '3RmKdFRabSM': '直式除法：三位數除以一位數',
  '5Y22O53UfPg': '使用工具判斷長方形',
  '64NWVbqlYIo': '時分的加減計算1',
  'A2kDAWhplOo': '圓的認識',
  'DF3yNQ13uTA': '一位小數的大小比較',
  'DkMjtxDDjHc': '認識直角',
  'Ep2y8QfNCvk': '加除和除加問題',
  'FcMgIerCkLo': '半徑、直徑的關係',
  'I5z1L6Cezqc': '認識數線',
  'IO5_07lhSQY': '認識分數幾分之幾',
  'IbolqEkVxX0': '認識除法的意義 (含有餘數)',
  'J88R_XQL5E4': '一位小數的加法',
  'KYx7Mt-8Chc': '用估算解決乘法問題',
  'LXeE0V7o8-M': '連乘兩步驟問題1',
  'Lm2qOP804aw': '同分母分數的加法',
  'MAmR1WZ4AuE': '面積的實測與估測',
  'NUziLUzJFqg': '二次和三次退位的減法',
  'NYw6dlyXKoE': '長度的換算 (公分與公尺)',
  'NeRjFU2Ackg': '小數的化聚',
  'NgV1qLVq0Zc': '被乘數中間有 0 、末尾有 0 的直式計算',
  'PCb3FMDuqds': '認識 0.1',
  'RMl9NproJdg': '使用工具判斷正方形',
  'RU9iojEOYiY': '二維表格的報讀和應用',
  'Rf-wV9hjKyw': '認識平方公分',
  'Rh-wasg8eg0': '角的間接比較',
  'V8fwogjSLvw': '三位數乘以一位數的直式計算含整百',
  'VFZaY8KElwo': '時、分和秒的換算',
  'VXc_eTApEl8': '直式除法：二位數除以一位數',
  'ZHNviuolLf8': '減除和除減問題',
  '_DMg96F9A-Q': '體驗正方體的展開圖',
  '_KjQPRYJ9fs': '解決餘數不為0的除法問題',
  'awQjDJwolxo': '時分的加減計算 2',
  'c6g9zLRTsa4': '10000以內數的大小比較',
  'c9C-4FIzEZU': '認識公升與毫升',
  'f6yiqm38kB0': '一維表格的報讀和應用',
  'fizvoc4ptJQ': '二維表格的報讀',
  'gm5193TJp3A': '認識 10000 以內的數',
  'jNEYK-EiOqM': '容量的換算',
  'l5cRTw2ElpY': '同分母分數的減法',
  'lxNZOMzP_xU': '一維表格的報讀',
  'oy4bjDGzPeo': '二次和三次進位的加法',
  'qLcqbp4Asx0': '認識毫米、毫米與公分的關係',
  't6IHXGm3_1k': '二位數乘以一位數的直式計算含整十',
  'u1efe5DTsoc': '角的直接比較',
  'vZV3O5UCctk': '認識直式除法',
  'wAzwC9bW9rE': '一位小數的減法',
  'wV3T7qE5J-A': '認識 1 公斤秤與實測',
  'xHH4pUWA1RQ': '認識日、時、分和秒',
  'y6g-4iIG9Vo': '乘除互逆關係',
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
