import type { Item } from '../../types';
import { rnd, pick, shuffle, uniq } from '../../util';
import { SHAPES, LGC, logoSVG, type ShapeSpec } from '../../ui/visuals/shapes';

const LOGIC: Item[] = [];
// 規律接續：AB / AAB / ABC / ABB 四種節奏，變化可能在形狀或顏色
([['AB', 2], ['ABC', 3], ['AAB', 3], ['ABB', 3]] as const).forEach(([pat]) =>
  ['shape', 'color'].forEach(dim => LOGIC.push({
    k: `lg.seq.${pat}.${dim}`, g: '找規律', subj: 'logic', cur: [],   // 一般推理練習，不掛課綱（R-3-2 是三年級的數列規律，掛上去一年級就看不到了）
    make: () => {
      const uniqN = uniq(pat.split('')).length;
      const pool = dim === 'shape' ? shuffle(SHAPES.slice()).slice(0, uniqN)
                                   : shuffle(LGC.slice()).slice(0, uniqN);
      const base = dim === 'shape' ? pick(LGC) : pick(SHAPES);
      const mk = (i: number): ShapeSpec => dim === 'shape' ? { k: pool[i], fill: base } : { k: base, fill: pool[i] };
      const order = pat.split('').map(ch => ch.charCodeAt(0) - 65);
      const seq = Array.from({ length: 6 }, (_, i) => mk(order[i % pat.length]));
      const ansSpec = mk(order[6 % pat.length]);
      const wrongs: ShapeSpec[] = [];
      for (let g = 0; wrongs.length < 3 && g < 60; g++) {
        const w = mk(rnd(uniqN));
        if (dim === 'shape' ? w.k !== ansSpec.k : w.fill !== ansSpec.fill) {
          if (!wrongs.some(x => x.k === w.k && x.fill === w.fill)) wrongs.push(w);
        } else if (uniqN < 3) {
          const alt = dim === 'shape'
            ? { k: pick(SHAPES.filter(s => !pool.includes(s))), fill: base }
            : { k: base, fill: pick(LGC.filter(c => !pool.includes(c))) };
          if (!wrongs.some(x => x.k === alt.k && x.fill === alt.fill)) wrongs.push(alt);
        }
      }
      return { ask: '接下來是哪一個？',
        art: `<div class="lgrow">${seq.map(s => logoSVG(s, 44)).join('')}
          <span class="lgq">？</span></div>`,
        choices: shuffle([ansSpec, ...wrongs]).map(s =>
          ({ art: logoSVG(s, 54), ok: s.k === ansSpec.k && s.fill === ansSpec.fill })),
        hint: `規律是 <b>${pat}</b> 一直重複，數一數排到第幾個了。` };
    }
  })));
// 旋轉接續
[45, 90].forEach(step => LOGIC.push({
  k: `lg.rot.${step}`, g: '旋轉規律', subj: 'logic', cur: [],
  make: () => {
    const k = pick(['triangle', 'star', 'diamond', 'hex']), f = pick(LGC);
    const dir = pick([1, -1]);
    const seq = [0, 1, 2, 3].map(i => ({ k, fill: f, rot: i * step * dir }));
    const ansRot = 4 * step * dir;
    const wrongs = uniq([ansRot + step, ansRot - step, ansRot + step * 2])
      .filter(r => ((r % 360) + 360) % 360 !== ((ansRot % 360) + 360) % 360).slice(0, 3);
    return { ask: '接下來是哪一個？',
      art: `<div class="lgrow">${seq.map(s => logoSVG(s, 44)).join('')}<span class="lgq">？</span></div>`,
      choices: shuffle([ansRot, ...wrongs]).map(r =>
        ({ art: logoSVG({ k, fill: f, rot: r }, 54), ok: r === ansRot })),
      hint: `每一個都比前一個多轉 <b>${step}</b> 度，方向${dir > 0 ? '順時針' : '逆時針'}。` };
  }
}));
// 2×2 矩陣：上排怎麼變，下排就怎麼變
['color', 'size', 'shape'].forEach(dim => LOGIC.push({
  k: `lg.mat.${dim}`, g: '圖形矩陣', subj: 'logic', cur: [],
  make: () => {
    const s1 = pick(SHAPES); const s2 = pick(SHAPES.filter(s => s !== s1));
    const c1 = pick(LGC), c2 = pick(LGC.filter(c => c !== c1));
    let A: ShapeSpec, B: ShapeSpec, C: ShapeSpec, D: ShapeSpec;
    if (dim === 'color') {
      const other = pick(SHAPES.filter(s => s !== s1));
      A = { k: s1, fill: c1 }; B = { k: s1, fill: c2 };
      C = { k: other, fill: c1 }; D = { k: other, fill: c2 };
    } else if (dim === 'size') {
      A = { k: s1, fill: c1, sc: 1 }; B = { k: s1, fill: c1, sc: .55 };
      C = { k: s2, fill: c2, sc: 1 }; D = { k: s2, fill: c2, sc: .55 };
    } else {
      A = { k: s1, fill: c1 }; B = { k: s2, fill: c1 };
      A.sc = B.sc = 1; C = { k: s1, fill: c2 }; D = { k: s2, fill: c2 };
    }
    const wrongs: ShapeSpec[] = [];
    const cand = [{ ...D, fill: c1 }, { ...D, k: s1 }, { ...A }, { ...C }, { ...B },
                  { ...D, sc: (D.sc || 1) === 1 ? .55 : 1 }];
    const key = (x: ShapeSpec) => `${x.k}|${x.fill}|${x.sc || 1}`;
    for (const w of shuffle(cand)) {
      if (wrongs.length >= 3) break;
      if (key(w) !== key(D) && !wrongs.some(x => key(x) === key(w))) wrongs.push(w);
    }
    return { ask: '問號應該是哪一個？',
      art: `<div class="lgmat">${logoSVG(A, 50)}${logoSVG(B, 50)}
        ${logoSVG(C, 50)}<span class="lgq">？</span></div>`,
      choices: shuffle([D, ...wrongs]).map(x => ({ art: logoSVG(x, 54), ok: key(x) === key(D) })),
      hint: `看上面那一排是怎麼變的，下面那一排就照樣變。` };
  }
}));

export { LOGIC };
