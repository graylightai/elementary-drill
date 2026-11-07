/* ---------- 筆跡比對 ---------- */
type P = [number, number];
function resample(pts: P[], n: number): P[] {
  if (pts.length < 2) return Array(n).fill(pts[0] || [0, 0]);
  const seg: number[] = [], total = pts.reduce((a, p, i) =>
    i ? (seg.push(Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1])), a + seg[i - 1]) : 0, 0);
  if (!total) return Array(n).fill(pts[0]);
  const out: P[] = [pts[0]]; let acc = 0, i = 1, step = total / (n - 1), target = step;
  while (out.length < n && i < pts.length) {
    const d = seg[i - 1];
    if (acc + d >= target) {
      const t = (target - acc) / d;
      out.push([pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
                pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t]);
      target += step;
    } else { acc += d; i++; }
  }
  while (out.length < n) out.push(pts[pts.length - 1]);
  return out;
}
const pathLen = (p: P[]) => p.reduce((a, q, i) => i ? a + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0, 0);
const meanDist = (a: P[], b: P[]) => a.reduce((s, p, i) => s + Math.hypot(p[0] - b[i][0], p[1] - b[i][1]), 0) / a.length;

/** 回傳 {ok, why}。座標都在 1024 的 viewBox 空間 */
function matchStroke(user: P[], med: P[]): { ok: boolean; why?: string } {
  if (user.length < 2) return { ok: false, why: '太短了，要沿著筆畫拖過去' };
  const mLen = pathLen(med), uLen = pathLen(user);
  if (mLen < 90) {                                     // 點這種極短筆畫：落在附近就算
    const c = med[Math.floor(med.length / 2)];
    const near = user.some(p => Math.hypot(p[0] - c[0], p[1] - c[1]) < 230);
    return near ? { ok: true } : { ok: false, why: '位置不對' };
  }
  if (uLen < mLen * 0.38) return { ok: false, why: '沒有寫完整筆' };
  const U = resample(user, 16), M = resample(med, 16);
  const fwd = meanDist(U, M), rev = meanDist(U, M.slice().reverse());
  if (rev < fwd * 0.75 && rev < 200) return { ok: false, why: '方向反了，要照箭頭的方向寫' };
  const startD = Math.hypot(U[0][0] - M[0][0], U[0][1] - M[0][1]);
  if (startD > 300) return { ok: false, why: '起筆的位置不對' };
  return fwd < 200 ? { ok: true } : { ok: false, why: '跟筆畫差太多' };
}

export { matchStroke };
