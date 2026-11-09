/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rng.js — seeded random numbers and time distributions for the Material flow add-on (0.8 SU.858, session sx-flow). DOM-free.
 *
 *   const r = makeRng(seed, key)     one stream per (seed, key): each element draws from its own stream, so adding an element
 *                                    never changes what the others draw (common random numbers). r.next() → [0, 1)
 *   sample(dist, r)                  one value from a distribution (seconds), never negative
 *   cleanDist(raw, fallback)         an untrusted distribution → a clean one (or fallback)
 *   meanOf(dist)                     its mean (for the panel and checks)
 *
 * Distributions: {kind:'const', v} · {kind:'uniform', a, b} · {kind:'exp', mean} · {kind:'normal', mean, sd} (cut at 0 by
 * drawing again) · {kind:'tri', a, m, b} · {kind:'erlang', mean, k}. The generator is sfc32 seeded through a string hash; the same
 * seed and key give the same numbers on every machine (32-bit integer arithmetic only).
 */

/** 32-bit string hash (xmur3-style mixing) → a function giving four seeds. */
function hashSeeds(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return () => {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return (h ^= h >>> 16) >>> 0;
  };
}

export function makeRng(seed, key = '') {
  const s = hashSeeds(String(seed) + '\u0000' + String(key));
  let a = s(), b = s(), c = s(), d = s();
  const next = () => {
    a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
    let t = (a + b) | 0;
    a = b ^ (b >>> 9);
    b = (c + (c << 3)) | 0;
    c = (c << 21) | (c >>> 11);
    d = (d + 1) | 0;
    t = (t + d) | 0;
    c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) next();   // warm the state up
  return { next };
}

const num = (v, lo = -Infinity, hi = Infinity) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : null);
export const DIST_KINDS = ['const', 'uniform', 'exp', 'normal', 'tri', 'erlang'];
const MAX_T = 1e7;

export function cleanDist(raw, fallback = { kind: 'const', v: 1 }) {
  if (typeof raw === 'number') return num(raw, 0, MAX_T) === null ? fallback : { kind: 'const', v: raw };
  if (!raw || typeof raw !== 'object' || !DIST_KINDS.includes(raw.kind)) return fallback;
  const n = (k) => num(raw[k], 0, MAX_T);
  switch (raw.kind) {
    case 'const': return n('v') === null ? fallback : { kind: 'const', v: raw.v };
    case 'uniform': return n('a') === null || n('b') === null || raw.b < raw.a ? fallback : { kind: 'uniform', a: raw.a, b: raw.b };
    case 'exp': return !(n('mean') > 0) ? fallback : { kind: 'exp', mean: raw.mean };
    case 'normal': return n('mean') === null || n('sd') === null ? fallback : { kind: 'normal', mean: raw.mean, sd: raw.sd };
    case 'tri': return n('a') === null || n('m') === null || n('b') === null || !(raw.a <= raw.m && raw.m <= raw.b) ? fallback : { kind: 'tri', a: raw.a, m: raw.m, b: raw.b };
    case 'erlang': {
      const k = num(raw.k, 1, 100);
      return !(n('mean') > 0) || k === null || !Number.isInteger(k) ? fallback : { kind: 'erlang', mean: raw.mean, k };
    }
  }
  return fallback;
}

export function meanOf(d) {
  switch (d.kind) {
    case 'const': return d.v;
    case 'uniform': return (d.a + d.b) / 2;
    case 'exp': case 'erlang': return d.mean;
    case 'normal': return d.mean;   // before the cut at 0; the panel says so when sd is large
    case 'tri': return (d.a + d.m + d.b) / 3;
  }
  return NaN;
}

export function sample(d, r) {
  switch (d.kind) {
    case 'const': return d.v;
    case 'uniform': return d.a + (d.b - d.a) * r.next();
    case 'exp': return -d.mean * Math.log(1 - r.next());
    case 'erlang': {
      let p = 1;
      for (let i = 0; i < d.k; i++) p *= 1 - r.next();
      return -(d.mean / d.k) * Math.log(p);
    }
    case 'normal': {
      for (let i = 0; i < 64; i++) {
        const u1 = 1 - r.next(), u2 = r.next();
        const x = d.mean + d.sd * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        if (x >= 0) return x;
      }
      return Math.max(0, d.mean);
    }
    case 'tri': {
      const u = r.next(), { a, m, b } = d;
      if (b === a) return a;
      const f = (m - a) / (b - a);
      return u < f ? a + Math.sqrt(u * (b - a) * (m - a)) : b - Math.sqrt((1 - u) * (b - a) * (b - m));
    }
  }
  return 0;
}
