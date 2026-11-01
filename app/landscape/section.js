/* SPDX-License-Identifier: Apache-2.0 */
/**
 * section.js — landscape sections (0.8 LA.9, session `landscape-arch_PART_4`): where a section line meets outlines and lines, and the section
 * drawn from what the host found there — existing and proposed ground, walls with their footings, paving and planted-area build-ups, steps
 * and plant silhouettes at mature size. No DOM; imports only areas.js. Canonical in lib/landscape/, copies by `node tools/landscape/sync.mjs`.
 *
 *   lineLen(line) · crossIntervals(line, poly) → [[d0, d1]…] where the line is inside the polygon (d = distance along the line)
 *   crossAt(line, polyline) → [d…] where the line crosses an open line · offsetFrom(line, p) → { d, off } (p's distance along and across)
 *   sectionDrawing(input, { vex }) → { paths: [{ pts: [{x, y}], layer, closed?, dashed? }], texts: [{ x, y, text, layer, align }], box }
 *     input = { length, existing: [[{d, z}]…], proposed: [[{d, z}]…],
 *               walls: [{ d, top, footing, thickness, footingWidth, footingDepth, name }],
 *               bands: [{ d0, d1, layers: [{ name, thickness }], kind: 'paving' | 'area', name }]   (layers hang below the proposed ground),
 *               steps: [{ name, profile: [{ d, z }] }], plants: [{ d, z, h, s, name, tree }] }
 *     x = d, y = z × vex (section units = project units). Layers: L-SECT-EXST (dashed), L-SECT-GRND, L-SECT-WALL, L-SECT-BLDP, L-SECT-PLNT, L-SECT-TEXT.
 */
import { pointIn, segCross } from './areas.js';

export function lineLen(line) { let L = 0; for (let i = 1; i < line.length; i++) L += Math.hypot(line[i].x - line[i - 1].x, line[i].y - line[i - 1].y); return L; }

export function crossIntervals(line, poly) {
  if (!poly || poly.length < 3 || line.length < 2) return [];
  const ds = [];
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    ds.push(acc);
    for (let j = 0; j < poly.length; j++) { const t = segCross(a, b, poly[j], poly[(j + 1) % poly.length]); if (t !== null) ds.push(acc + t * l); }
    acc += l;
  }
  ds.push(acc);
  const D = [...new Set(ds.map((v) => Math.round(v * 1e9) / 1e9))].sort((p, q) => p - q), out = [];
  const at = (d) => { let s = 0; for (let i = 1; i < line.length; i++) { const a = line[i - 1], b = line[i], l = Math.hypot(b.x - a.x, b.y - a.y); if (d <= s + l || i === line.length - 1) { const f = l ? (d - s) / l : 0; return { x: a.x + f * (b.x - a.x), y: a.y + f * (b.y - a.y) }; } s += l; } return line[0]; };
  for (let k = 0; k + 1 < D.length; k++) {
    if (D[k + 1] - D[k] < 1e-9) continue;
    const m = at((D[k] + D[k + 1]) / 2);
    if (!pointIn(m.x, m.y, poly)) continue;
    if (out.length && Math.abs(out[out.length - 1][1] - D[k]) < 1e-9) out[out.length - 1][1] = D[k + 1]; else out.push([D[k], D[k + 1]]);
  }
  return out;
}

export function crossAt(line, pl) {
  const out = [];
  let acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], l = Math.hypot(b.x - a.x, b.y - a.y);
    for (let j = 1; j < pl.length; j++) { const t = segCross(a, b, pl[j - 1], pl[j]); if (t !== null) out.push(acc + t * l); }
    acc += l;
  }
  return [...new Set(out.map((v) => Math.round(v * 1e9) / 1e9))].sort((p, q) => p - q);
}

export function offsetFrom(line, p) {
  let best = { d: 0, off: Infinity }, acc = 0;
  for (let i = 1; i < line.length; i++) {
    const a = line[i - 1], b = line[i], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy, l = Math.sqrt(L2);
    const t = L2 ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L2)) : 0;
    const off = Math.hypot(p.x - a.x - t * dx, p.y - a.y - t * dy);
    if (off < Math.abs(best.off)) best = { d: acc + t * l, off: ((dx * (p.y - a.y) - dy * (p.x - a.x)) >= 0 ? 1 : -1) * off };
    acc += l;
  }
  return best;
}

/** The proposed ground's z at distance d (linear between the cut's points), or null off the surface. */
function zOn(runs, d) {
  for (const r of runs || []) for (let i = 1; i < r.length; i++) if (d >= r[i - 1].d - 1e-9 && d <= r[i].d + 1e-9) { const f = r[i].d - r[i - 1].d ? (d - r[i - 1].d) / (r[i].d - r[i - 1].d) : 0; return r[i - 1].z + f * (r[i].z - r[i - 1].z); }
  return null;
}

export function sectionDrawing(input, { vex = 1 } = {}) {
  const paths = [], texts = [], Y = (z) => z * vex;
  const P = (pts, layer, extra = {}) => { if (pts.length >= 2) paths.push({ pts, layer, ...extra }); };
  for (const r of input.existing || []) P(r.map((q) => ({ x: q.d, y: Y(q.z) })), 'L-SECT-EXST', { dashed: true });
  for (const r of input.proposed || []) P(r.map((q) => ({ x: q.d, y: Y(q.z) })), 'L-SECT-GRND');
  // build-ups: each layer a band hanging below the proposed ground, sampled along the interval
  for (const b of input.bands || []) {
    const n = Math.max(2, Math.min(200, Math.ceil((b.d1 - b.d0) / Math.max(1e-6, (input.length || 1) / 200)) + 1)), ds = Array.from({ length: n }, (_, i) => b.d0 + ((b.d1 - b.d0) * i) / (n - 1));
    const top = ds.map((d) => zOn(input.proposed, d));
    if (top.some((z) => z === null)) continue;
    let depth = 0;
    for (const L of b.layers) {
      const a = ds.map((d, i) => ({ x: d, y: Y(top[i] - depth) })), c = ds.map((d, i) => ({ x: d, y: Y(top[i] - depth - L.thickness) })).reverse();
      P([...a, ...c], 'L-SECT-BLDP', { closed: true });
      depth += L.thickness;
    }
    const mid = (b.d0 + b.d1) / 2;
    texts.push({ x: mid, y: Y(top[Math.floor(n / 2)] - depth) - 0, text: b.name, layer: 'L-SECT-TEXT', align: 'center', below: true });
  }
  for (const w of input.walls || []) {
    const h = w.thickness / 2, fw = w.footingWidth / 2;
    P([{ x: w.d - h, y: Y(w.footing) }, { x: w.d + h, y: Y(w.footing) }, { x: w.d + h, y: Y(w.top) }, { x: w.d - h, y: Y(w.top) }], 'L-SECT-WALL', { closed: true });
    P([{ x: w.d - fw, y: Y(w.footing - w.footingDepth) }, { x: w.d + fw, y: Y(w.footing - w.footingDepth) }, { x: w.d + fw, y: Y(w.footing) }, { x: w.d - fw, y: Y(w.footing) }], 'L-SECT-WALL', { closed: true });
    texts.push({ x: w.d, y: Y(w.top), text: w.name, layer: 'L-SECT-TEXT', align: 'center' });
  }
  for (const s of input.steps || []) { P(s.profile.map((q) => ({ x: q.d, y: Y(q.z) })), 'L-SECT-WALL'); texts.push({ x: s.profile[0].d, y: Y(Math.max(...s.profile.map((q) => q.z))), text: s.name, layer: 'L-SECT-TEXT', align: 'left' }); }
  for (const p of input.plants || []) {
    // a silhouette at mature size: a trunk and a crown (trees), a mound (the rest); the tree's crown is drawn true, the ground under it with vex
    const base = Y(p.z), N = 24;
    if (p.tree) {
      const trunk = p.h * 0.35, cr = p.s / 2, ch = (p.h - trunk) / 2;
      P([{ x: p.d, y: base }, { x: p.d, y: base + trunk }], 'L-SECT-PLNT');
      P(Array.from({ length: N + 1 }, (_, k) => ({ x: p.d + cr * Math.cos((2 * Math.PI * k) / N), y: base + trunk + ch + ch * Math.sin((2 * Math.PI * k) / N) })), 'L-SECT-PLNT', { closed: true });
    } else P(Array.from({ length: N / 2 + 1 }, (_, k) => ({ x: p.d + (p.s / 2) * Math.cos((Math.PI * k) / (N / 2)), y: base + p.h * Math.sin((Math.PI * k) / (N / 2)) })), 'L-SECT-PLNT');
  }
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of paths) for (const q of p.pts) { x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
  return { paths, texts, box: Number.isFinite(x0) ? { x0, y0, x1, y1 } : null };
}
