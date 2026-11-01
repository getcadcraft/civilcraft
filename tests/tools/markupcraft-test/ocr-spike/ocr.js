/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ocr.js — classic OCR of a scanned page, no trained model, no network (0.7.1 71.10 spike). No DOM.
 *
 * Pipeline: Sauvola threshold → skew from the text rows (projection) → turn → 8-connected pieces → text lines (pieces
 * linked left-right with vertical overlap) → baseline and x-height per line → characters (pieces overlapping in x merged:
 * i/j dots, colons, accents) → each character compared with glyph templates (nearest neighbour on a 16 × 16 ink grid +
 * aspect + position against baseline and x-height) → wide, badly matching pieces split where the ink is thinnest when
 * that matches better → a second pass with the page's own glyphs as templates (the confident matches, averaged) → words
 * by the gaps. Templates are made at run time from fonts (`glyphFeature` on rendered glyphs), never learned.
 *
 *   ocrPage(grey {w,h,data}, templates [{ch, f}], opts) → { deg, lines: [{ box, words: [{ text, box, conf }] }], stats }
 *   glyphFeature(bm, box, baseline, xh, mask?) → feature vector (Float32Array)
 */

const G = 10;            // density grid side
const Z = 4;             // direction zones per side
const ND = Z * Z * 4;    // 4 directions per zone
export const OFF_D = G * G, OFF_A = G * G + ND;
const NF = OFF_A + 3;    // grid + directions + log aspect + top + bottom

// ---- threshold / pieces ----

/** Sauvola threshold (k 0.25, window ~ 1/30 of the short side, at least 15 px). → Uint8Array, 1 = ink. */
export function binarize({ w, h, data }, { k = 0.25, window = 0 } = {}) {
  const r = Math.max(7, (window || Math.round(Math.min(w, h) / 30)) >> 1), W1 = w + 1;
  const I = new Float64Array(W1 * (h + 1)), I2 = new Float64Array(W1 * (h + 1));
  for (let y = 0; y < h; y++) {
    let s = 0, s2 = 0;
    for (let x = 0; x < w; x++) { const v = data[y * w + x]; s += v; s2 += v * v; I[(y + 1) * W1 + x + 1] = I[y * W1 + x + 1] + s; I2[(y + 1) * W1 + x + 1] = I2[y * W1 + x + 1] + s2; }
  }
  const out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    const y0 = Math.max(0, y - r), y1 = Math.min(h, y + r + 1);
    for (let x = 0; x < w; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(w, x + r + 1), n = (x1 - x0) * (y1 - y0);
      const sum = I[y1 * W1 + x1] - I[y0 * W1 + x1] - I[y1 * W1 + x0] + I[y0 * W1 + x0];
      const sum2 = I2[y1 * W1 + x1] - I2[y0 * W1 + x1] - I2[y1 * W1 + x0] + I2[y0 * W1 + x0];
      const mean = sum / n, sd = Math.sqrt(Math.max(0, sum2 / n - mean * mean));
      out[y * w + x] = data[y * w + x] < mean * (1 + k * (sd / 128 - 1)) && data[y * w + x] < 200 ? 1 : 0;
    }
  }
  return out;
}

/** 8-connected pieces → { lab Int32Array, pieces: [{id, area, x0, y0, x1, y1}] }. */
export function pieces(bm, w, h) {
  const lab = new Int32Array(w * h), stack = new Int32Array(w * h), out = [];
  let id = 0;
  for (let s = 0; s < w * h; s++) {
    if (!bm[s] || lab[s]) continue;
    id++;
    let sp = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
    stack[sp++] = s; lab[s] = id;
    while (sp) {
      const p = stack[--sp], x = p % w, y = (p - x) / w;
      area++;
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy; if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx; if (xx < 0 || xx >= w) continue;
          const q = yy * w + xx;
          if (bm[q] && !lab[q]) { lab[q] = id; stack[sp++] = q; }
        }
      }
    }
    out.push({ id, area, x0, y0, x1: x1 + 1, y1: y1 + 1 });
  }
  return { lab, pieces: out };
}

// ---- skew ----

/** Skew of text rows: the angle whose row projection of piece bottoms is most peaked (±maxDeg, 0.1° then 0.02°). */
export function textSkew(ps, w, h, maxDeg = 5) {
  const pts = ps.filter((p) => p.y1 - p.y0 > 4 && p.y1 - p.y0 < h / 20).map((p) => [(p.x0 + p.x1) / 2 - w / 2, p.y1 - h / 2]);
  if (pts.length < 20) return 0;
  const score = (deg) => {
    const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), hist = new Map();
    for (const [x, y] of pts) { const r = Math.round((y * c - x * s) / 2); hist.set(r, (hist.get(r) || 0) + 1); }
    let sc = 0; for (const v of hist.values()) sc += v * v; return sc;
  };
  let best = 0, bs = -1;
  for (let d = -maxDeg; d <= maxDeg + 1e-9; d += 0.1) { const s = score(d); if (s > bs) { bs = s; best = d; } }
  const c0 = best;
  for (let d = c0 - 0.1; d <= c0 + 0.1 + 1e-9; d += 0.02) { const s = score(d); if (s > bs) { bs = s; best = d; } }
  return Math.round(best * 100) / 100;
}

/** Turn a grey picture by deg (positive = counter-clockwise as seen), bilinear, white fill. */
export function rotate({ w, h, data }, deg) {
  if (Math.abs(deg) < 0.05) return { w, h, data };
  const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a), cx = w / 2, cy = h / 2, out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const dx = x - cx, dy = y - cy, sx = c * dx - s * dy + cx, sy = s * dx + c * dy + cy;
    const x0 = Math.floor(sx), y0 = Math.floor(sy);
    if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) { out[y * w + x] = 255; continue; }
    const fx = sx - x0, fy = sy - y0, i = y0 * w + x0;
    out[y * w + x] = (data[i] * (1 - fx) + data[i + 1] * fx) * (1 - fy) + (data[i + w] * (1 - fx) + data[i + w + 1] * fx) * fy;
  }
  return { w, h, data: out };
}

// ---- features ----

/**
 * Feature of the ink in box [x0,y0,x1,y1) of a bitmap (1 = ink), only pixels whose label is in `ids` when given:
 * a G × G grid of ink share (the box stretched to a square, smoothed), a Z × Z grid of edge directions (4 bins: the
 * outline's direction where ink meets paper, so stroke weight and small shifts matter less than the shape), log aspect,
 * top and bottom against the line (in x-heights above the baseline).
 */
export function glyphFeature(bm, w, box, baseline, xh, lab = null, ids = null) {
  const [x0, y0, x1, y1] = box, bw = Math.max(1, x1 - x0), bh = Math.max(1, y1 - y0);
  const f = new Float32Array(NF);
  // the character's own ink, with a 1 px paper border
  const W = bw + 2, H = bh + 2, m = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = y * w + x; if (bm[i] && (!ids || ids.has(lab[i]))) m[(y - y0 + 1) * W + (x - x0 + 1)] = 1; }
  const cnt = new Float32Array(G * G), sx = G / bw, sy = G / bh;
  const dir = new Float32Array(ND);
  let edges = 0;
  for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
    const i = y * W + x;
    if (m[i]) {
      const gx = Math.min(G - 1, Math.floor((x - 1 + 0.5) * sx)), gy = Math.min(G - 1, Math.floor((y - 1 + 0.5) * sy));
      cnt[gy * G + gx] += 1;
    }
    // Sobel on the mask: the outline's normal
    const dx = (m[i - W + 1] + 2 * m[i + 1] + m[i + W + 1]) - (m[i - W - 1] + 2 * m[i - 1] + m[i + W - 1]);
    const dy = (m[i + W - 1] + 2 * m[i + W] + m[i + W + 1]) - (m[i - W - 1] + 2 * m[i - W] + m[i - W + 1]);
    if (!dx && !dy || !m[i]) continue;
    let a = Math.atan2(dy, dx); if (a < 0) a += Math.PI;   // 0…π
    const t = a / (Math.PI / 4), k0 = Math.floor(t) % 4, k1 = (k0 + 1) % 4, fr = t - Math.floor(t);
    const zx = Math.min(Z - 1, Math.floor((x - 1) * Z / bw)), zy = Math.min(Z - 1, Math.floor((y - 1) * Z / bh)), o = (zy * Z + zx) * 4;
    const mag = Math.hypot(dx, dy);
    dir[o + k0] += (1 - fr) * mag; dir[o + k1] += fr * mag;
    edges += mag;
  }
  // density: share of each cell's area, then a light 3 × 3 smoothing
  const area = 1 / Math.max(1e-6, sx * sy);
  for (let gy = 0; gy < G; gy++) for (let gx = 0; gx < G; gx++) {
    let s = 0, n = 0;
    for (let yy = Math.max(0, gy - 1); yy <= Math.min(G - 1, gy + 1); yy++) for (let xx = Math.max(0, gx - 1); xx <= Math.min(G - 1, gx + 1); xx++) { const wgt = yy === gy && xx === gx ? 2 : 1; s += wgt * Math.min(1, cnt[yy * G + xx] / area); n += wgt; }
    f[gy * G + gx] = s / n;
  }
  let nrm = 0;
  for (let i = 0; i < ND; i++) nrm += dir[i] * dir[i];
  nrm = Math.sqrt(nrm) || 1;
  for (let i = 0; i < ND; i++) f[OFF_D + i] = dir[i] / nrm;
  f[OFF_A] = Math.log(bw / bh);
  f[OFF_A + 1] = (baseline - y0) / xh;
  f[OFF_A + 2] = (baseline - y1) / xh;
  return f;
}

export const WEIGHTS = { grid: 8, dir: 2, aspect: 3, pos: 3 };
export const TUNE = { splitD: 0.7, splitW: 0.9, splitRatio: 0.75, splitAbs: 0.9, adaptD: 0.8, adaptM: 0.25, wordGap: 0.42 };
export function dist(a, b) {
  let dg = 0, dd = 0;
  for (let i = 0; i < OFF_D; i++) { const t = a[i] - b[i]; dg += t * t; }
  for (let i = OFF_D; i < OFF_A; i++) { const t = a[i] - b[i]; dd += t * t; }
  const da = a[OFF_A] - b[OFF_A], dt = a[OFF_A + 1] - b[OFF_A + 1], db = a[OFF_A + 2] - b[OFF_A + 2];
  return WEIGHTS.grid * dg / OFF_D + WEIGHTS.dir * dd / 2 + WEIGHTS.aspect * da * da + WEIGHTS.pos * (dt * dt + db * db);
}

export function topK(f, templates, k = 5) {
  return templates.map((t) => ({ ch: t.ch, font: t.font || 'own', d: +dist(f, t.f).toFixed(3) })).sort((a, b) => a.d - b.d).slice(0, k);
}
function classify(f, templates) {
  let best = null, bd = Infinity, second = Infinity;
  for (const t of templates) {
    const d = dist(f, t.f);
    if (d < bd) { if (best && best.ch !== t.ch) second = bd; bd = d; best = t; } else if (d < second && t.ch !== best?.ch) second = d;
  }
  return { ch: best ? best.ch : '?', d: bd, margin: second - bd, t: best };
}

// ---- layout ----

function median(a) { if (!a.length) return 0; const s = [...a].sort((p, q) => p - q); return s[s.length >> 1]; }
/** The most common value (heights): the middle of the fullest window ±max(1, 6 %). */
function mode(a) {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  let best = 0, bi = 0;
  for (let i = 0, j = 0; i < s.length; i++) {
    while (s[i] - s[j] > Math.max(2, 0.12 * s[i])) j++;
    if (i - j + 1 > best) { best = i - j + 1; bi = (i + j) >> 1; }
  }
  return s[bi];
}
function pct(a, p) { if (!a.length) return 0; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(p * s.length))]; }

/**
 * Column gaps: x ranges no text line may be linked across — printed rules (tall thin pieces) and white gutters (x runs the
 * text pieces' boxes hardly cover while both sides are well covered). → [{x0, x1, y0, y1}]
 */
export function gutters(all, H, w, h) {
  const out = [];
  for (const p of all) if (p.y1 - p.y0 > 6 * H && p.x1 - p.x0 < 0.8 * H) out.push({ x0: p.x0 - 1, x1: p.x1 + 1, y0: p.y0, y1: p.y1 });
  const text = all.filter((p) => p.y1 - p.y0 >= 0.4 * H && p.y1 - p.y0 <= 3.2 * H);
  if (text.length < 50) return out;
  const cov = new Float64Array(w);
  for (const p of text) for (let x = p.x0; x < p.x1; x++) cov[x] += p.y1 - p.y0;
  const xs = text.map((p) => p.x0), xe = text.map((p) => p.x1);
  const left = pct(xs, 0.02), right = pct(xe, 0.98);
  const inner = [];
  for (let x = left; x < right; x++) inner.push(cov[x]);
  const med = median(inner.filter((v) => v > 0));
  let run = -1;
  for (let x = left; x <= right; x++) {
    const low = x < right && cov[x] < 0.08 * med;
    if (low && run < 0) run = x;
    if (!low && run >= 0) {
      if (x - run >= 0.6 * H && run - left > 6 * H && right - x > 6 * H) out.push({ x0: run, x1: x, y0: 0, y1: h });
      run = -1;
    }
  }
  return out;
}

/** Text lines from pieces: [{ pieces, box }]. */
function textLines(ps, H, seps = []) {
  const big = ps.filter((p) => p.y1 - p.y0 >= 0.4 * H && p.y1 - p.y0 <= 3.2 * H && p.x1 - p.x0 <= 6 * H);
  const small = ps.filter((p) => !big.includes(p) && p.y1 - p.y0 < 0.4 * H && p.area >= 3);
  big.sort((a, b) => a.x0 - b.x0);
  const parent = big.map((_, i) => i);
  const find = (i) => { while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; } return i; };
  for (let i = 0; i < big.length; i++) {
    const a = big[i];
    let bestJ = -1, bestGap = Infinity;
    for (let j = i + 1; j < big.length; j++) {
      const b = big[j];
      if (b.x0 - a.x1 > 2.4 * H) break;
      const ov = Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0);
      if (ov < 0.45 * Math.min(a.y1 - a.y0, b.y1 - b.y0)) continue;
      const ya = (a.y0 + a.y1) / 2;
      if (seps.some((g) => g.x0 >= a.x1 - 1 && g.x1 <= b.x0 + 1 && ya >= g.y0 && ya <= g.y1)) continue;
      const gap = Math.max(0, b.x0 - a.x1);
      if (gap < bestGap) { bestGap = gap; bestJ = j; }
    }
    if (bestJ >= 0) parent[find(i)] = find(bestJ);
  }
  const groups = new Map();
  big.forEach((p, i) => { const r = find(i); if (!groups.has(r)) groups.set(r, []); groups.get(r).push(p); });
  const lines = [...groups.values()].map((g) => ({ pieces: g, box: [Math.min(...g.map((p) => p.x0)), Math.min(...g.map((p) => p.y0)), Math.max(...g.map((p) => p.x1)), Math.max(...g.map((p) => p.y1))] }));
  // small pieces (dots, commas, periods, hyphens, accents) join the line they sit in or just above/below
  for (const s of small) {
    const cx = (s.x0 + s.x1) / 2, cy = (s.y0 + s.y1) / 2;
    let best = null, bd = Infinity;
    for (const l of lines) {
      if (cx < l.box[0] - H || cx > l.box[2] + H) continue;
      const lh = l.box[3] - l.box[1];
      const d = cy < l.box[1] ? l.box[1] - cy : cy > l.box[3] ? cy - l.box[3] : 0;
      if (d > 0.6 * lh) continue;
      if (d < bd) { bd = d; best = l; }
    }
    if (best) best.pieces.push(s);
  }
  return lines.filter((l) => l.pieces.length >= 1);
}

/** Line metrics: baseline (y) and x-height from its pieces. */
function lineMetrics(l, capRatio) {
  const main = l.pieces.filter((p) => p.y1 - p.y0 >= 0.4 * (l.box[3] - l.box[1]) * 0.5);
  const bottoms = main.map((p) => p.y1);
  const baseline = median(bottoms.length ? bottoms : l.pieces.map((p) => p.y1));
  const hs = main.filter((p) => Math.abs(p.y1 - baseline) <= Math.max(2, 0.12 * (l.box[3] - l.box[1]))).map((p) => p.y1 - p.y0);
  const lo = mode(hs), hi = pct(hs, 0.9);
  // all capitals (or figures): the x-height is the page's ratio of the capital height
  const xh = lo > 0.86 * hi ? hi * capRatio : lo;
  return { baseline, xh: Math.max(3, xh), caps: lo > 0.86 * hi };
}

/** Reading order: bands between lines that cross a gutter; inside a band, column by column, top to bottom. */
function readingOrder(lines, seps) {
  const cuts = [...new Set(seps.filter((g) => g.y0 === 0).map((g) => (g.x0 + g.x1) / 2))].sort((a, b) => a - b);
  const colOf = (l) => { const cx = (l.box[0] + l.box[2]) / 2; let k = 0; while (k < cuts.length && cx > cuts[k]) k++; return k; };
  const spans = (l) => cuts.some((x) => l.box[0] < x - 2 && l.box[2] > x + 2);
  const byY = [...lines].sort((a, b) => a.box[1] - b.box[1]);
  const out = [];
  let band = [];
  const flush = () => { band.sort((a, b) => colOf(a) - colOf(b) || a.box[1] - b.box[1] || a.box[0] - b.box[0]); out.push(...band); band = []; };
  for (const l of byY) { if (spans(l)) { flush(); out.push(l); } else band.push(l); }
  flush();
  return out;
}

// ---- words: letters or figures ----

const DIGIT_LIKE = { O: '0', o: '0', D: '0', l: '1', I: '1', i: '1', '|': '1', S: '5', s: '5', B: '8', Z: '2', z: '2', G: '6', g: '9', q: '9' };
const LETTER_LIKE = { 0: 'o', 1: 'l', 5: 's', 8: 'B', 2: 'z', 6: 'b', 9: 'g', '|': 'l' };
/** Put a word's look-alikes right: in a word of letters 1 → l, 0 → o; in a number O → 0; I/l by the case around them. */
export function fixWord(t) {
  const core = t.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, '');
  if (!core) return t;
  const letters = (core.match(/[A-Za-z]/g) || []).length, digits = (core.match(/[0-9]/g) || []).length;
  const upper = (core.match(/[A-Z]/g) || []).length, lower = (core.match(/[a-z]/g) || []).length;
  let out = '';
  for (let i = 0; i < t.length; i++) {
    let ch = t[i];
    if (digits > letters && DIGIT_LIKE[ch]) ch = DIGIT_LIKE[ch];
    else if (letters >= digits && LETTER_LIKE[ch] && letters > 0) ch = LETTER_LIKE[ch];
    if (letters >= digits) {
      // I and l look the same in many faces: the case around them decides; a capital I starts a word
      if (ch === 'I' && lower > upper && i > 0) ch = 'l';
      else if (ch === 'l' && upper > lower) ch = 'I';
    }
    out += ch;
  }
  // a word of capitals with stray small c/o/s/v/w/x/z (same shapes): capitals
  if (upper >= 2 && upper > lower) out = out.replace(/[cosvwxzu]/g, (c) => c.toUpperCase());
  return out;
}

// ---- the page ----

export function ocrPage(grey, templates, { adapt = true, split = true, debug = false } = {}) {
  const t0 = Date.now();
  let bm = binarize(grey);
  let { pieces: ps } = pieces(bm, grey.w, grey.h);
  const deg = textSkew(ps, grey.w, grey.h);
  let g = grey;
  if (Math.abs(deg) >= 0.05) { g = rotate(grey, deg); bm = binarize(g); }
  const P = pieces(bm, g.w, g.h);
  const lab = P.lab;
  ps = P.pieces.filter((p) => p.area >= 3 && (p.x1 - p.x0) < g.w / 4 && (p.y1 - p.y0) < g.h / 8);
  const H = median(ps.filter((p) => p.y1 - p.y0 > 5).map((p) => p.y1 - p.y0));
  const seps = gutters(P.pieces.filter((p) => p.area >= 3), H, g.w, g.h);
  const lines = readingOrder(textLines(ps, H, seps), seps);
  // the page's x-height / capital height ratio from lines that have both
  const ratios = [];
  for (const l of lines) {
    const hs = l.pieces.map((p) => p.y1 - p.y0).filter((x) => x > 3);
    const lo = pct(hs, 0.3), hi = pct(hs, 0.9);
    if (hs.length > 8 && lo < 0.8 * hi) ratios.push(lo / hi);
  }
  const capRatio = ratios.length ? median(ratios) : 0.68;

  const chars = [];
  for (const l of lines) {
    const m = lineMetrics(l, capRatio);
    l.m = m;
    // characters: pieces overlapping in x merge
    const sorted = [...l.pieces].sort((a, b) => a.x0 - b.x0);
    const cs = [];
    for (const p of sorted) {
      const last = cs[cs.length - 1];
      if (last) {
        const ov = Math.min(last.x1, p.x1) - Math.max(last.x0, p.x0);
        const narrow = Math.min(last.x1 - last.x0, p.x1 - p.x0);
        // a dot over a stem, the two dots of a colon, a broken letter
        if (ov > 0.5 * narrow) { last.ids.add(p.id); last.x0 = Math.min(last.x0, p.x0); last.x1 = Math.max(last.x1, p.x1); last.y0 = Math.min(last.y0, p.y0); last.y1 = Math.max(last.y1, p.y1); continue; }
      }
      cs.push({ ids: new Set([p.id]), x0: p.x0, y0: p.y0, x1: p.x1, y1: p.y1, line: l });
    }
    l.chars = cs;
    for (const c of cs) {
      c.f = glyphFeature(bm, g.w, [c.x0, c.y0, c.x1, c.y1], m.baseline, m.xh, lab, c.ids);
      c.r = classify(c.f, templates);
      chars.push(c);
    }
  }

  // wide characters that match badly: try splitting where the ink column is thinnest
  if (split) {
    for (const l of lines) {
      const out = [];
      for (const c of l.chars) {
        const wdt = c.x1 - c.x0;
        if (c.r.d > TUNE.splitD && wdt > TUNE.splitW * l.m.xh) {
          const parts = bestSplit(c, bm, g.w, lab, l.m, templates, 0);
          if (parts && parts.cost < TUNE.splitAbs && parts.cost < c.r.d * TUNE.splitRatio) { out.push(...parts.chars); continue; }
        }
        out.push(c);
      }
      l.chars = out;
    }
  }

  // second pass: the page's own glyphs, averaged per character from the confident matches
  // the page's fonts: the template fonts most confident matches came from; the rest are dropped for the second pass
  const votes = new Map();
  let nv = 0;
  for (const l of lines) for (const c of l.chars) if (c.r.d < 0.9 && c.r.t?.font) { votes.set(c.r.t.font, (votes.get(c.r.t.font) || 0) + 1); nv++; }
  const fonts = new Set([...votes].filter(([, n]) => n >= 0.15 * nv).map(([f]) => f));
  const tpl2 = fonts.size ? templates.filter((t) => fonts.has(t.font)) : templates;
  let own = [];
  if (adapt) {
    const by = new Map();
    for (const l of lines) for (const c of l.chars) if (c.r.d < TUNE.adaptD && c.r.margin > TUNE.adaptM) { if (!by.has(c.r.ch)) by.set(c.r.ch, []); by.get(c.r.ch).push(c.f); }
    for (const [ch, fs] of by) {
      if (fs.length < 3) continue;
      const f = new Float32Array(NF);
      for (const x of fs) for (let i = 0; i < NF; i++) f[i] += x[i] / fs.length;
      own.push({ ch, f, own: true });
    }
    const all = [...own, ...tpl2];
    for (const l of lines) for (const c of l.chars) c.r = classify(c.f, all);
  }

  // a stem with a dot over it is an i (or a j below the line) whatever the faces say; one piece is never an i
  for (const l of lines) for (const c of l.chars) {
    const dotted = c.ids.size >= 2 && (c.x1 - c.x0) < 0.6 * l.m.xh;
    if (dotted && 'Il1|!ij'.includes(c.r.ch) && c.r.ch !== '!') c.r = { ...c.r, ch: c.y1 > l.m.baseline + 0.2 * l.m.xh ? 'j' : 'i' };
    else if (!dotted && c.ids.size === 1 && (c.r.ch === 'i' || c.r.ch === 'j')) c.r = { ...c.r, ch: c.r.ch === 'j' ? 'J' : 'l' };
  }

  // words by the gaps, text with case fixed by position
  const outLines = [];
  for (const l of lines) {
    const cs = l.chars;
    if (!cs.length) continue;
    const xh = l.m.xh;
    const words = [];
    let cur = null;
    for (let i = 0; i < cs.length; i++) {
      const c = cs[i];
      const gap = i ? c.x0 - cs[i - 1].x1 : Infinity;
      if (!cur || gap > TUNE.wordGap * xh) { cur = { chars: [] }; words.push(cur); }
      cur.chars.push(c);
    }
    outLines.push({
      box: l.box,
      words: words.map((wd) => ({
        text: fixWord(wd.chars.map((c) => c.r.ch).join('')),
        box: [Math.min(...wd.chars.map((c) => c.x0)), Math.min(...wd.chars.map((c) => c.y0)), Math.max(...wd.chars.map((c) => c.x1)), Math.max(...wd.chars.map((c) => c.y1))],
        conf: Math.max(0, Math.min(1, 1 - Math.max(...wd.chars.map((c) => c.r.d)) / 3)),
      })),
    });
  }
  if (debug) outLines.raw = lines;
  return { deg, lines: outLines, stats: { ms: Date.now() - t0, chars: chars.length, own: own.length, H, capRatio, fonts: [...fonts] } };
}

/** The best way to cut a character in two or three where the ink column is thinnest (recursion depth ≤ 1). */
function bestSplit(c, bm, w, lab, m, templates, depth) {
  const x0 = c.x0, x1 = c.x1, wdt = x1 - x0;
  const col = new Float32Array(wdt);
  for (let y = c.y0; y < c.y1; y++) for (let x = x0; x < x1; x++) { const i = y * w + x; if (bm[i] && c.ids.has(lab[i])) col[x - x0]++; }
  const cands = [];
  for (let x = Math.max(2, Math.round(0.2 * m.xh)); x < wdt - Math.max(2, Math.round(0.2 * m.xh)); x++) {
    if (col[x] <= col[x - 1] && col[x] <= col[x + 1]) cands.push([col[x], x]);
  }
  cands.sort((a, b) => a[0] - b[0]);
  let best = null;
  for (const [, x] of cands.slice(0, 5)) {
    const L = sub(c, x0, x0 + x, bm, w, lab, m), R = sub(c, x0 + x, x1, bm, w, lab, m);
    if (!L || !R) continue;
    L.r = classify(L.f, templates); R.r = classify(R.f, templates);
    let parts = [L, R], cost = Math.max(L.r.d, R.r.d);
    if (depth < 1 && R.r.d > TUNE.splitD * 0.8 && R.x1 - R.x0 > TUNE.splitW * m.xh) {
      const s = bestSplit(R, bm, w, lab, m, templates, depth + 1);
      if (s && s.cost < R.r.d) { parts = [L, ...s.chars]; cost = Math.max(L.r.d, s.cost); }
    }
    if (!best || cost < best.cost) best = { cost, chars: parts };
  }
  return best;
}

function sub(c, xa, xb, bm, w, lab, m) {
  let y0 = Infinity, y1 = -1;
  for (let y = c.y0; y < c.y1; y++) for (let x = xa; x < xb; x++) { const i = y * w + x; if (bm[i] && c.ids.has(lab[i])) { if (y < y0) y0 = y; if (y > y1) y1 = y; } }
  if (y1 < 0) return null;
  const s = { ids: c.ids, x0: xa, x1: xb, y0, y1: y1 + 1, line: c.line };
  s.f = glyphFeature(bm, w, [xa, y0, xb, y1 + 1], m.baseline, m.xh, lab, c.ids);
  return s;
}
