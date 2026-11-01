/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sides.js — 0.7.1 71.22 (MickeyWolf: "adjust the slope between a modelled platform and the existing terrain, including the
 * option to make it vertical … retaining walls instead of sloped embankments"). No DOM. The side settings of a pad (Design ›
 * Pad) or a Landscape platform / berm, read by grading.js daylightPad, and what comes out of them: the retaining walls, their
 * quantities, plan symbols and warnings.
 *
 *   sides = { edges: [null | { wall: true } | { cut, fill }] (edges[k] = the side from pts[k] to pts[k + 1]; null = the pad's
 *             own cut and fill), wallT (wall thickness), wallLimit (a taller wall gets a warning), maxSlope (H:V; a slope
 *             steeper than this gets a warning; null = no check), u ('m' | 'ft', for the warnings' words) }
 *
 *   sideDefaults(units) · cleanSides(obj, units, nSides) (untrusted → sides | null) · setSide(sides, k, patch, n, units)
 *   parseSlope(text) → H for 1 V | null   "3" · "3:1" (H:V) · "33%" · "18.4°" · "vertical" / "wall" → 0
 *   slopeLabel(H) → "3.00:1 (33.3 %, 18.4°)"
 *   wallRuns(rays) → [{ k: [sides], pts: [{ x, y (pad edge), ox, oy (outer face), zPad, zGround, top, bottom, h }] }]
 *   wallQuantities(walls) → { n, length, faceArea, maxH, avgH }   length along the pad edge, face = height × length
 *   sideWarnings(dl, pad) → [{ code, text, hard: false, severity: 'warning', msg: { key, vars }, ref (pad id), about (pad.about:
 *     { kind, id } as the Problems panel names it), k, … }]   DetailCraft's problem shape { text, hard, ref } + `code`, the shared
 *     Problems fields (assets/js/problems.js) and its numbers, as the road's stand-in warning (project.standInCorridors): 'grade.wall.tall' (higher than
 *     wallLimit), 'grade.slope.steep' (a cut or fill slope in use steeper than maxSlope)
 *   wallSceneItems(walls, { layer, unitPerMm, fixed }) → plan items: the outer face, the ends closed, a tick every few mm
 *     on the retained side, and the height at both ends and at its tallest
 *   wallSolids(walls) → [{ inner: [{x,y}], outer: [{x,y}], top: [z], bottom: [z] }] for the 3D view (one run each)
 */

import { LAYERS } from './scene.js';
import { t } from './i18n.js';

if (!LAYERS.some((l) => l.name === 'C-GRAD-WALL')) LAYERS.push({ name: 'C-GRAD-WALL', token: 'major', aci: 7, get label() { return t('scene.layer.gradwall'); } });

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const MAX_SLOPE_H = 100;

export function sideDefaults(units) {
  const m = units === 'm';
  return { wallT: m ? 0.3 : 1, wallLimit: m ? 1 : 3.3, maxSlope: null };
}

/** Untrusted → the settings, or null when nothing differs from a plain pad (no walls, no own slopes, no checks). */
export function cleanSides(o, units, nSides = 10000) {
  if (!o || typeof o !== 'object') return null;
  const d = sideDefaults(units), H = (v) => (fin(v) && v > 0 && v <= MAX_SLOPE_H ? v : undefined);
  const edges = (Array.isArray(o.edges) ? o.edges.slice(0, Math.min(nSides, 10000)) : []).map((e) => {
    if (!e || typeof e !== 'object') return null;
    if (e.wall) return { wall: true };
    const c = H(e.cut), f = H(e.fill);
    return c || f ? { ...(c ? { cut: c } : {}), ...(f ? { fill: f } : {}) } : null;
  });
  while (edges.length && edges[edges.length - 1] === null) edges.pop();
  const wallT = fin(o.wallT) && o.wallT > 0 && o.wallT <= 100 ? o.wallT : d.wallT;
  const wallLimit = fin(o.wallLimit) && o.wallLimit > 0 && o.wallLimit <= 1000 ? o.wallLimit : d.wallLimit;
  const maxSlope = H(o.maxSlope) ?? null;
  if (!edges.length && maxSlope === null && wallT === d.wallT && wallLimit === d.wallLimit) return null;
  return { edges, wallT, wallLimit, maxSlope, u: units === 'm' ? 'm' : 'ft' };
}

/** The settings with side k changed (patch: { wall } | { cut, fill } | null = back to the pad's); k = 'all' changes every side. */
export function setSide(sides, k, patch, n, units) {
  const s = { ...sideDefaults(units), ...(sides || {}), edges: [...(sides?.edges || [])] };
  while (s.edges.length < n) s.edges.push(null);
  for (const i of k === 'all' ? s.edges.map((_, j) => j) : [k]) {
    if (patch === null) s.edges[i] = null;
    else if (patch.wall) s.edges[i] = { wall: true };
    else { const e = s.edges[i] && !s.edges[i].wall ? { ...s.edges[i] } : {}; for (const key of ['cut', 'fill']) if (key in patch) { if (patch[key] > 0) e[key] = patch[key]; else delete e[key]; } s.edges[i] = Object.keys(e).length ? e : null; }
  }
  return cleanSides(s, units, n);
}

/** A slope as typed: H:V ratio ("3", "3:1"), percent ("33%"), degrees ("18.4°", "18.4 deg") or "vertical" (0). → H per 1 V. */
export function parseSlope(text) {
  const s = String(text ?? '').trim().toLowerCase().replace(',', '.');
  if (!s) return null;
  if (/^(vertical|wall|vert)$/.test(s)) return 0;
  let m = /^([\d.]+)\s*%$/.exec(s);
  if (m) { const p = Number(m[1]); return p > 0 ? 100 / p : null; }
  m = /^([\d.]+)\s*(°|deg|degrees?)$/.exec(s);
  if (m) { const a = Number(m[1]); return a > 0 && a < 90 ? 1 / Math.tan((a * Math.PI) / 180) : a >= 90 ? 0 : null; }
  m = /^([\d.]+)\s*:\s*([\d.]+)$/.exec(s);
  if (m) { const h = Number(m[1]), v = Number(m[2]); return h > 0 && v > 0 ? h / v : null; }
  const h = Number(s);
  return Number.isFinite(h) && h > 0 ? h : null;
}
export function slopeLabel(H) {
  if (!(H > 0)) return t('sides.vertical');
  return t('sides.slope', { h: H.toFixed(2), pct: (100 / H).toFixed(1), deg: ((Math.atan(1 / H) * 180) / Math.PI).toFixed(1) });
}

// ---------------------------------------------------------------------------- walls

/** Consecutive wall rays (in order round the pad) as runs; a run that goes round the first corner is joined up. */
export function wallRuns(rays) {
  const runs = [];
  let cur = null;
  for (const r of rays) {
    if (r.kind !== 'wall') { cur = null; continue; }
    if (!cur) runs.push((cur = { k: [], pts: [] }));
    if (!cur.k.includes(r.k)) cur.k.push(r.k);
    const zPad = r.z0, zGround = r.z;
    cur.pts.push({ x: r.x0, y: r.y0, ox: r.x, oy: r.y, zPad, zGround, top: Math.max(zPad, zGround), bottom: Math.min(zPad, zGround), h: Math.abs(zPad - zGround) });
  }
  if (runs.length > 1 && rays.length && rays[0].kind === 'wall' && rays[rays.length - 1].kind === 'wall') {
    const first = runs.shift(), last = runs[runs.length - 1];
    last.pts.push(...first.pts);
    for (const k of first.k) if (!last.k.includes(k)) last.k.push(k);
  } else if (runs.length === 1 && rays.every((r) => r.kind === 'wall')) runs[0].closed = true;   // walls all round
  return runs;
}

export function wallQuantities(walls) {
  let length = 0, faceArea = 0, maxH = 0;
  for (const w of walls || []) {
    const P = w.pts, n = P.length, m = w.closed ? n : n - 1;
    for (let i = 0; i < m; i++) { const a = P[i], b = P[(i + 1) % n], l = Math.hypot(b.x - a.x, b.y - a.y); length += l; faceArea += (l * (a.h + b.h)) / 2; }
    for (const p of P) maxH = Math.max(maxH, p.h);
  }
  return { n: (walls || []).length, length, faceArea, maxH, avgH: length > 0 ? faceArea / length : 0 };
}

export function sideWarnings(dl, pad) {
  const S = pad.sides, out = [], u = S?.u || 'ft', name = pad.name || t('scene.pad.default'), ref = pad.id ?? null;
  if (!S) return out;
  for (const w of dl.walls || []) {
    const h = Math.max(0, ...w.pts.map((p) => p.h));
    const vars = { name, h: h.toFixed(2), limit: S.wallLimit.toFixed(2), u };
    if (h > S.wallLimit + 1e-9) out.push({ code: 'grade.wall.tall', text: t('sides.w.tall', vars), hard: false, severity: 'warning', msg: { key: 'sides.w.tall', vars }, ref, about: pad.about || null, k: w.k, h, limit: S.wallLimit });
  }
  if (S.maxSlope > 0) {
    const steep = new Map();   // side k → { kind, H }
    for (const r of dl.rays) {
      if ((r.kind !== 'cut' && r.kind !== 'fill') || !(r.k >= 0) || !(r.d > 1e-6)) continue;
      const e = S.edges?.[r.k], H = r.kind === 'cut' ? (e?.cut || Number(pad.cut)) : (e?.fill || Number(pad.fill));
      if (H < S.maxSlope - 1e-9 && !steep.has(r.k + r.kind)) steep.set(r.k + r.kind, { k: r.k, kind: r.kind, H });
    }
    for (const s of steep.values()) { const vars = { name, side: s.k + 1, h: s.H.toFixed(2), max: S.maxSlope.toFixed(2) }; out.push({ code: 'grade.slope.steep', text: t('sides.w.steep.' + s.kind, vars), hard: false, severity: 'warning', msg: { key: 'sides.w.steep.' + s.kind, vars }, ref, about: pad.about || null, k: [s.k], kind: s.kind, H: s.H, limit: S.maxSlope }); }
  }
  return out;
}

export function wallSceneItems(walls, { layer = 'C-GRAD-WALL', unitPerMm = 1, fixed = (v) => v.toFixed(2) } = {}) {
  const items = [];
  for (const w of walls || []) {
    const P = w.pts;
    if (P.length < 2) continue;
    const outer = P.map((p) => ({ x: p.ox, y: p.oy }));
    items.push({ layer, kind: 'poly', pts: outer, closed: !!w.closed });
    if (!w.closed) for (const p of [P[0], P[P.length - 1]]) items.push({ layer, kind: 'poly', pts: [{ x: p.x, y: p.y }, { x: p.ox, y: p.oy }] });
    // ticks across the wall every ~3 mm of paper: the wall's thickness reads as a wall, not a line
    const step = 3 * unitPerMm;
    let carry = 0;
    for (let i = 0; i + 1 < P.length; i++) {
      const a = P[i], b = P[i + 1], l = Math.hypot(b.x - a.x, b.y - a.y);
      for (let s = carry; s < l; s += step) { const f = s / l; items.push({ layer, kind: 'poly', pts: [{ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, { x: a.ox + (b.ox - a.ox) * f, y: a.oy + (b.oy - a.oy) * f }] }); }
      carry = (((carry - l) % step) + step) % step;
    }
    // heights: both ends and the tallest point
    let iMax = 0;
    P.forEach((p, i) => { if (p.h > P[iMax].h) iMax = i; });
    const marks = w.closed ? [iMax] : [...new Set([0, P.length - 1, iMax])];
    for (const i of marks) { const p = P[i]; items.push({ layer, kind: 'text', x: p.ox + (p.ox - p.x) * 0.5 + 1 * unitPerMm * Math.sign(p.ox - p.x || 1), y: p.oy + (p.oy - p.y) * 0.5, mm: 1.8, rot: 0, align: 'center', middle: true, text: t('sides.wall.h', { h: fixed(p.h) }) }); }
  }
  return items;
}

export function wallSolids(walls) {
  return (walls || []).filter((w) => w.pts.length >= 2).map((w) => ({ closed: !!w.closed, inner: w.pts.map((p) => ({ x: p.x, y: p.y })), outer: w.pts.map((p) => ({ x: p.ox, y: p.oy })), top: w.pts.map((p) => p.top), bottom: w.pts.map((p) => p.bottom) }));
}
