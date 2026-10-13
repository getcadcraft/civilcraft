/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hydro.js — storm drainage on a pipe network (0.4 V19 + V20). No DOM; the Node test drives it (bin/test-civilcraft-hydro.mjs).
 *
 * V19 — catchments and the rational method
 *   net.catchments = [{ id, name, pts: [{x,y}], C (runoff coefficient 0–1), tc (minutes), to (structure id) }]
 *   net.hydro = { idf: { a, b, c }, n, kj, tailwater (null = none), minTc }   placeholders, not a standard
 *   i = a / (tc + b)^c   (in/h for feet projects, mm/h for metre projects)
 *   Q = C·i·A summed downstream: at each structure ΣCA = its catchments' C·A + what its incoming pipes carry; the time of
 *   concentration is the longest of its catchments' tc and every incoming pipe's tc + travel time (length / full-flow
 *   velocity, or HYDRO_DEFAULTS.vAssumed while a pipe has no slope). Q = ΣCA·i(tc) in cfs (A in acres; the 1.008 is
 *   left out, as is usual) or m³/s (A in hectares, Q = ΣCA·i / 360).
 *
 * V20 — pipe sizing (Manning) and the hydraulic and energy grade lines
 *   manningFull(D, S, n, units) → { Q, V, A }        Q = k/n·A·R^(2/3)·S^(1/2), k 1.486 (ft) or 1 (m); D in project units
 *   partFull(y, D) → { A, P, T }                     a circular pipe flowing y deep
 *   normalDepth(Q, D, S, n, units) → y | null (null: more than the pipe carries at its best depth ≈ 0.94 D)
 *   sizePipes(net, flows, units, { sizes }) → [{ id, dia, Q, cap, ok }]   the smallest standard size that carries Q at the
 *       pipe's own slope (sizes in inches or millimetres); none → the largest, ok false
 *   hydraulicGrade(net, flows, units, surface?) → { pipes: Map(id → { hglUp, hglDn, eglUp, eglDn, yn, full, V, Sf }),
 *       structs: Map(id → { hgl, egl, rim }), problems: [{ id, kind, msg }] }
 *     From the outlet upstream. A pipe's HGL at its lower end = the higher of the tailwater (outlet; else the structure's
 *     HGL below) and its invert + normal depth; flowing part full the HGL falls with the pipe (invert + normal depth), full
 *     (Q above its capacity, or the water below higher than its crown) it rises by the friction slope × length. A structure's
 *     HGL = its outgoing pipe's upper HGL + the junction loss kj·V²/2g. EGL = HGL + V²/2g. Flagged: a pipe flowing full
 *     (surcharged), an HGL above a rim (the water reaches the surface there).
 *
 *   HYDRO_DEFAULTS(units) · cleanCatchment(o) · cleanHydro(o, units) · catchmentArea(pts, units) (ac | ha) · idf(tc, h)
 *   rationalFlows(net, units, { velocity? }) → { structs: Map(id → { CA, tc }), pipes: Map(id → { CA, tc, i, Q, travel }), problems }
 */

import { t } from './i18n.js';
import { DIA_UNIT } from './pipes.js';

export function HYDRO_DEFAULTS(units = 'ft') {
  return units === 'm'
    ? { idf: { a: 1700, b: 12, c: 0.8 }, n: 0.013, kj: 0.5, tailwater: null, minTc: 10, vAssumed: 1 }
    : { idf: { a: 60, b: 10, c: 0.75 }, n: 0.013, kj: 0.5, tailwater: null, minTc: 10, vAssumed: 3 };
}
export const PIPE_SIZES = { ft: [12, 15, 18, 21, 24, 27, 30, 36, 42, 48, 54, 60, 66, 72], m: [300, 375, 450, 525, 600, 675, 750, 900, 1050, 1200, 1350, 1500, 1650, 1800] };
const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function cleanHydro(o, units = 'ft') {
  const d = HYDRO_DEFAULTS(units);
  if (!o || typeof o !== 'object') return { ...d, idf: { ...d.idf } };
  const pos = (v, dv, max) => (fin(v) && v > 0 && v < max ? v : dv);
  return {
    idf: { a: pos(o.idf?.a, d.idf.a, 1e6), b: fin(o.idf?.b) && o.idf.b >= 0 && o.idf.b < 1000 ? o.idf.b : d.idf.b, c: pos(o.idf?.c, d.idf.c, 5) },
    n: pos(o.n, d.n, 1), kj: fin(o.kj) && o.kj >= 0 && o.kj <= 10 ? o.kj : d.kj, tailwater: fin(o.tailwater) && Math.abs(o.tailwater) < 1e6 ? o.tailwater : null,
    minTc: pos(o.minTc, d.minTc, 1000), vAssumed: d.vAssumed,
  };
}
export function cleanCatchment(o) {
  if (!o || typeof o !== 'object' || !Array.isArray(o.pts)) return null;
  const pts = o.pts.filter((p) => p && fin(p.x) && fin(p.y) && Math.abs(p.x) < 1e9 && Math.abs(p.y) < 1e9).slice(0, 10000).map((p) => ({ x: p.x, y: p.y }));
  if (pts.length < 3) return null;
  return {
    id: /^k\d{1,9}$/.test(String(o.id)) ? String(o.id) : null,
    name: String(o.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 120) || 'Catchment',
    pts, C: fin(o.C) && o.C >= 0 && o.C <= 1 ? o.C : 0.5, tc: fin(o.tc) && o.tc > 0 && o.tc < 1000 ? o.tc : 10,
    to: typeof o.to === 'string' && o.to.length < 40 ? o.to : null,
  };
}

export function catchmentArea(pts, units = 'ft') {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += (pts[j].x + pts[i].x) * (pts[j].y - pts[i].y);
  a = Math.abs(a) / 2;
  return units === 'm' ? a / 10000 : a / 43560;
}
export const idf = (tc, h) => h.idf.a / Math.pow(tc + h.idf.b, h.idf.c);

const K = (units) => (units === 'm' ? 1 : 1.486);
const G = (units) => (units === 'm' ? 9.81 : 32.174);
const diaOf = (p, units) => (Number(p.dia) || 0) / DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit;

export function manningFull(D, S, n, units = 'ft') {
  if (!(D > 0) || !(S > 0) || !(n > 0)) return { Q: 0, V: 0, A: (Math.PI * D * D) / 4 };
  const A = (Math.PI * D * D) / 4, R = D / 4;
  const Q = (K(units) / n) * A * Math.pow(R, 2 / 3) * Math.sqrt(S);
  return { Q, V: Q / A, A };
}
export function partFull(y, D) {
  const yy = Math.max(0, Math.min(D, y));
  const th = 2 * Math.acos(Math.max(-1, Math.min(1, 1 - (2 * yy) / D)));
  return { A: (D * D / 8) * (th - Math.sin(th)), P: (D * th) / 2, T: D * Math.sin(th / 2) };
}
const qAt = (y, D, S, n, units) => { const { A, P } = partFull(y, D); return P > 0 ? (K(units) / n) * A * Math.pow(A / P, 2 / 3) * Math.sqrt(S) : 0; };
export function normalDepth(Q, D, S, n, units = 'ft') {
  if (!(Q > 0)) return 0;
  if (!(S > 0)) return null;
  // the most a circular pipe carries is a little below full (about 0.938 D)
  let hi = D, best = 0;
  for (let k = 0; k <= 200; k++) { const y = (D * k) / 200, q = qAt(y, D, S, n, units); if (q > best) { best = q; hi = y; } }
  if (Q > best) return null;
  let lo = 0;
  for (let it = 0; it < 80; it++) { const m = (lo + hi) / 2; if (qAt(m, D, S, n, units) < Q) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

/** Pipes in an order where every pipe comes after the ones flowing into its upper structure; null when there is a loop. */
function order(net) {
  const ins = new Map();
  for (const p of net.pipes) { if (!ins.has(p.to)) ins.set(p.to, []); ins.get(p.to).push(p); }
  const done = new Set(), out = [];
  while (out.length < net.pipes.length) {
    let moved = false;
    for (const p of net.pipes) {
      if (done.has(p.id)) continue;
      if ((ins.get(p.from) || []).every((q) => done.has(q.id))) { done.add(p.id); out.push(p); moved = true; }
    }
    if (!moved) return null;
  }
  return out;
}

export function rationalFlows(net, units = 'ft', { velocity = null } = {}) {
  const h = cleanHydro(net?.hydro, units), problems = [];
  const structs = new Map((net?.structures || []).map((s) => [s.id, { CA: 0, tc: 0 }]));
  for (const c of net?.catchments || []) {
    const s = structs.get(c.to);
    if (!s) { problems.push({ id: c.id, kind: 'catchment', msg: t('hy.no.outlet', { name: c.name }) }); continue; }
    s.CA += c.C * catchmentArea(c.pts, units);
    s.tc = Math.max(s.tc, c.tc);
  }
  const pipes = new Map(), byId = new Map((net?.structures || []).map((x) => [x.id, x]));
  const ord = order(net || { pipes: [] });
  if (!ord) { problems.push({ id: null, kind: 'network', msg: t('hy.loop') }); return { structs, pipes, problems, hydro: h }; }
  for (const p of ord) {
    const up = structs.get(p.from), dn = structs.get(p.to);
    if (!up || !dn) continue;
    const tc = Math.max(up.tc, h.minTc), i = idf(tc, h), Q = units === 'm' ? (up.CA * i) / 360 : up.CA * i;
    const a = byId.get(p.from), b = byId.get(p.to), len = Math.hypot(b.x - a.x, b.y - a.y);
    const S = fin(p.invUp) && fin(p.invDn) && len > 0 ? (p.invUp - p.invDn) / len : 0;
    const v = velocity?.(p) ?? (S > 0 ? manningFull(diaOf(p, units), S, h.n, units).V : 0);
    const travel = len / Math.max(v > 0 ? v : h.vAssumed, 1e-6) / 60;   // minutes
    pipes.set(p.id, { CA: up.CA, tc, i, Q, travel, len, S });
    dn.CA += up.CA;
    dn.tc = Math.max(dn.tc, tc + travel);
  }
  return { structs, pipes, problems, hydro: h };
}

export function sizePipes(net, flows, units = 'ft', { sizes = PIPE_SIZES[units === 'm' ? 'm' : 'ft'] } = {}) {
  const per = DIA_UNIT[units === 'm' ? 'm' : 'ft'].perUnit, h = flows.hydro || cleanHydro(net.hydro, units);
  const out = [];
  for (const p of net.pipes) {
    const f = flows.pipes.get(p.id);
    if (!f) continue;
    if (!(f.S > 0)) { out.push({ id: p.id, dia: p.dia, Q: f.Q, cap: 0, ok: false, flat: true }); continue; }
    let pick = null;
    for (const d of sizes) { const cap = manningFull(d / per, f.S, h.n, units).Q; if (cap >= f.Q) { pick = { dia: d, cap }; break; } }
    if (!pick) { const d = sizes[sizes.length - 1]; pick = { dia: d, cap: manningFull(d / per, f.S, h.n, units).Q, none: true }; }
    out.push({ id: p.id, dia: pick.dia, Q: f.Q, cap: pick.cap, ok: !pick.none });
  }
  return out;
}

export function hydraulicGrade(net, flows, units = 'ft', surface = null) {
  const h = flows.hydro || cleanHydro(net.hydro, units), g = G(units), problems = [];
  const pipes = new Map(), structs = new Map();
  const ord = order(net);
  if (!ord) return { pipes, structs, problems: [{ id: null, kind: 'network', msg: t('hy.loop') }] };
  const sById = new Map(net.structures.map((s) => [s.id, s]));
  const rimOf = (s) => (fin(s.rim) ? s.rim : surface ? surface.elevationAt(s.x, s.y, 1e-6) : null);
  for (const p of ord.slice().reverse()) {   // outlet first
    const f = flows.pipes.get(p.id);
    if (!f || !fin(p.invUp) || !fin(p.invDn)) continue;
    const D = diaOf(p, units), full = manningFull(D, f.S, h.n, units);
    const below = structs.get(p.to);
    const outlet = !net.pipes.some((q) => q.from === p.to);
    const yn = f.S > 0 ? normalDepth(f.Q, D, f.S, h.n, units) : null;
    const surch = yn === null;
    const startDn = Math.max(p.invDn + (surch ? D : yn), outlet ? (h.tailwater ?? -Infinity) : below?.hgl ?? -Infinity);
    // friction slope with the pipe full (pressure flow), from Manning
    const A = full.A, R = D / 4, Sf = A > 0 ? Math.pow((f.Q * h.n) / (K(units) * A * Math.pow(R, 2 / 3)), 2) : 0;
    const fullFlow = surch || startDn > p.invDn + D + 1e-9;
    let hglDn = startDn, hglUp;
    if (fullFlow) hglUp = Math.max(hglDn + Sf * f.len, p.invUp + D);
    else hglUp = p.invUp + yn;
    const aFlow = fullFlow ? A : partFull(yn, D).A, V = aFlow > 0 ? f.Q / aFlow : 0, hv = (V * V) / (2 * g);
    pipes.set(p.id, { hglUp, hglDn, eglUp: hglUp + hv, eglDn: hglDn + hv, yn, full: fullFlow, V, Sf });
    if (fullFlow) problems.push({ id: p.id, kind: 'pipe', msg: t('hy.full', { name: p.name }) });
    // the structure above: the outgoing pipe's upper HGL + the junction loss
    const sh = hglUp + h.kj * hv;
    const prev = structs.get(p.from);
    if (!prev || sh > prev.hgl) structs.set(p.from, { hgl: sh, egl: sh + hv, rim: rimOf(sById.get(p.from)) });
    if (!structs.has(p.to) && outlet) structs.set(p.to, { hgl: hglDn, egl: hglDn + hv, rim: rimOf(sById.get(p.to)) });
  }
  for (const [id, s] of structs) if (fin(s.rim) && s.hgl > s.rim + 1e-9) problems.push({ id, kind: 'structure', msg: t('hy.flood', { name: sById.get(id)?.name || id, by: (s.hgl - s.rim).toFixed(2) }) });
  return { pipes, structs, problems };
}
