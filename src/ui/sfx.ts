/* 音效：即時合成，沒有音檔 */
import { S } from '../engine/store';

const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
let AC: AudioContext | null = null;
function actx(): AudioContext | null {
  if (!S.sound) return null;
  try { if (!AC) AC = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    if (AC.state === 'suspended') AC.resume(); return AC; } catch { return null; }
}
function tone(f: number, { at = 0, dur = .13, type = 'triangle' as OscillatorType, vol = .14, to = 0 } = {}) {
  const c = actx(); if (!c) return;
  const t = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(.0001, t);
  g.gain.linearRampToValueAtTime(vol, t + .012);
  g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + .03);
}
const PENTA = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];
const sfx = {
  good: (n: number) => tone(PENTA[Math.min((n | 0), PENTA.length - 1)] || PENTA[0], { dur: .13, vol: .13 }),
  step: () => tone(587.33, { dur: .05, vol: .05, type: 'sine' }),
  bad: () => tone(196, { dur: .18, vol: .09, type: 'sine', to: 155 }),
  win: () => [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, { at: i * .09, dur: .36, vol: .14 }))
};

export { REDUCED, sfx };
