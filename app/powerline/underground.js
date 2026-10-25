/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/underground.js — underground cable routes (0.7 PL.5): length, the cable's profile under the surface and its cover,
 * crossings with CivilCraft's pipe network, other cable routes and overhead lines, joints from the drum length, trench
 * quantities. No DOM. A design aid: trench depths, cover and clearances are the user's (the trench type in the library and the
 * rule set); an engineer checks the result against what the network operator asks for. No thermal rating: ampacity is a
 * library number (decision D6).
 *
 * route = { id, pts: [{ x, y }], cable: key, trench: key, count, slack_pct, from, to }   (powerline/model.js; plan in project units)
 * lib   = Map key → library item (cable: diameter_mm, drum_m …; trench: depth_m, width_m, cover_m, bedding_m, ducts, ductDiam_mm,
 *         clearance_m — SI)
 * units = 'ft' | 'm' (plan and elevations); results ending in _m / _m3 are metres, ch / ground / cable are project units
 *
 *   routeLength(route)                                    → plan length in project units (0 for a bad route)
 *   routeProfile(route, { groundAt, lib, units, step })   → { samples: [{ ch, ground, cable }], minCover_m, need_m, ok, noGround }
 *       samples every `step` project units (default: length / 100) and at both ends; ground = groundAt(x, y) (null off the
 *       surface); cable = the elevation of the top of the cable (or of its ducts) = ground − cover (null off the surface)
 *       cover = trench.cover_m when the trench gives it, else depth_m − bedding_m − (duct diameter if ducts, else cable diameter)
 *       The cable follows the ground at a fixed depth, so the cover is the same everywhere the surface is known.
 *       need_m = state rules' coverMin_m when passed (opts.rules), else the trench's own cover_m; ok = minCover_m ≥ need_m
 *       noGround = the number of samples off the surface
 *   routeCrossings(route, state, network, { groundAt, lib, units })
 *                                                         → [{ kind: 'pipe'|'route'|'line', id, at_ch, sep_m, need_m, ok }] by at_ch
 *       network = the project's pipe network (pipes.js shape: structures { id, x, y }, pipes { id, from, to, dia, invUp, invDn };
 *       dia in inches (feet project) or mm (metre project)), an array of them, or null
 *       pipe:  the pipe's invert at the crossing (linear between invUp and invDn), top = invert + dia (inside diameter, the wall is
 *              not counted, as pipes.js); the cable band = [top − thickness, top] with top = ground − cover, thickness = duct
 *              diameter (ducts) or cable diameter. sep_m = the clear gap between the two bands (negative = they overlap).
 *              Needs the ground at the crossing and both inverts, else sep_m / ok are null.
 *       route: another power route crossing in plan; both cables at their own cover under the same ground; need = the larger
 *              clearance_m of the two trenches
 *       line:  an overhead line's span crossing in plan: listed for information, sep_m / need_m null, ok true
 *       need_m = the route's own clearance rule (route.clearance → state.rules.clearances), else the rule set's ugCross rule
 *              (0.7 PL.12), else this trench's clearance_m (default 0.2 m); route × route takes the larger of the two
 *   lineUnderground(line, state, network, { groundAt, lib, units })
 *                                                         → [{ kind: 'route'|'pipe', id, name, ch, z }] by ch (0.7 PL.12)
 *       the cable routes and pipes an overhead line's spans cross in plan, at the line's chainage (project units); z = the top of
 *       the cable (ground − cover) or of the pipe (invert + diameter) in project units, null when not known
 *   joints(route, { lib, units })                         → { count, perCable, at: [ch…], cableRun_m, drum_m }
 *       each cable run = length × (1 + slack_pct / 100); joints per cable = ceil(run / drum_m) − 1, placed every drum_m of cable
 *       (mapped back to plan chainage by the slack); count = per cable × route.count. No drum_m on the cable → no joints.
 *   trenchQuantities(route, { lib, units, groundAt })     → { length_m, trench_m, excavation_m3, bedding_m3, backfill_m3, duct_m,
 *                                                            cable_m, joints }
 *       trench_m = length_m; excavation = width × depth × length; bedding = width × bedding_m × length;
 *       duct_m = ducts × length; duct volume = ducts × π·(ductDiam / 2)² × length; backfill = excavation − bedding − duct volume;
 *       cable_m = (length × (1 + slack_pct / 100) + 2 × depth) × count  (the rise to the surface at each end, per cable);
 *       joints = joints(route).count. Volumes are null when the trench has no item. groundAt is accepted for later use (the
 *       depth is the trench's, so the volumes do not depend on the surface).
 */

import { unitM, fin } from './units.js';

const getItem = (lib, k) => (k && lib && typeof lib.get === 'function' ? lib.get(k) || null : null);
const goodPts = (route) => (Array.isArray(route?.pts) ? route.pts.filter((p) => p && fin(p.x) && fin(p.y)) : []);
const DEFAULT_CLEAR_M = 0.2;

export function routeLength(route) {
  const P = goodPts(route);
  let L = 0;
  for (let i = 1; i < P.length; i++) L += Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y);
  return L;
}

/** Cumulative chainage at each vertex (project units). */
function cumul(P) {
  const c = [0];
  for (let i = 1; i < P.length; i++) c.push(c[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
  return c;
}
/** The plan point at chainage ch along P. */
function pointAt(P, cum, ch) {
  for (let i = 1; i < P.length; i++) {
    if (ch <= cum[i] + 1e-12 || i === P.length - 1) {
      const seg = cum[i] - cum[i - 1], t = seg > 0 ? Math.min(1, Math.max(0, (ch - cum[i - 1]) / seg)) : 0;
      return { x: P[i - 1].x + (P[i].x - P[i - 1].x) * t, y: P[i - 1].y + (P[i].y - P[i - 1].y) * t };
    }
  }
  return P[0] ? { x: P[0].x, y: P[0].y } : { x: 0, y: 0 };
}

/** The trench's numbers in metres, and the cable band's thickness. */
function trenchOf(route, lib) {
  const tr = getItem(lib, route?.trench), cab = getItem(lib, route?.cable);
  const depth = fin(tr?.depth_m) ? tr.depth_m : null;
  const bedding = fin(tr?.bedding_m) ? tr.bedding_m : 0;
  const ducts = fin(tr?.ducts) ? tr.ducts : 0;
  const ductD = fin(tr?.ductDiam_mm) ? tr.ductDiam_mm / 1000 : 0;
  const cabD = fin(cab?.diameter_mm) ? cab.diameter_mm / 1000 : 0;
  const band = ducts > 0 && ductD > 0 ? ductD : cabD;
  let cover = fin(tr?.cover_m) ? tr.cover_m : null;
  if (cover == null && depth != null) cover = Math.max(0, depth - bedding - band);
  const clearance = fin(tr?.clearance_m) ? tr.clearance_m : DEFAULT_CLEAR_M;
  return { tr, cab, depth, bedding, ducts, ductD, cabD, band, cover, clearance, width: fin(tr?.width_m) ? tr.width_m : null };
}

export function routeProfile(route, { groundAt, lib, units, step, rules } = {}) {
  const um = unitM(units);
  const P = goodPts(route);
  const out = { samples: [], minCover_m: null, need_m: null, ok: null, noGround: 0 };
  if (P.length < 2) return out;
  const cum = cumul(P), L = cum[cum.length - 1];
  const T = trenchOf(route, lib);
  const st = fin(step) && step > 0 ? step : L / 100;
  const n = L > 0 ? Math.min(5000, Math.max(1, Math.ceil(L / st - 1e-9))) : 1;
  const g = typeof groundAt === 'function' ? groundAt : () => null;
  for (let j = 0; j <= n; j++) {
    const ch = j === n ? L : Math.min(L, j * st);
    const q = pointAt(P, cum, ch);
    let z = null;
    try { z = g(q.x, q.y); } catch { z = null; }
    if (!fin(z)) { z = null; out.noGround++; }
    const cable = z != null && T.cover != null ? z - T.cover / um : null;
    out.samples.push({ ch, ground: z, cable });
    if (z != null && T.cover != null && (out.minCover_m == null || T.cover < out.minCover_m)) out.minCover_m = T.cover;
  }
  out.need_m = fin(rules?.coverMin_m) ? rules.coverMin_m : fin(T.tr?.cover_m) ? T.tr.cover_m : null;
  out.ok = out.minCover_m == null || out.need_m == null ? null : out.minCover_m >= out.need_m - 1e-9;
  return out;
}

/** Plan intersections of segment a→b with segment p→q → { t (on a→b), u (on p→q) } or null. */
function segHit(a, b, p, q) {
  const dx = b.x - a.x, dy = b.y - a.y, ex = q.x - p.x, ey = q.y - p.y;
  const den = dx * ey - dy * ex;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((p.x - a.x) * ey - (p.y - a.y) * ex) / den, u = ((p.x - a.x) * dy - (p.y - a.y) * dx) / den;
  return t >= -1e-12 && t <= 1 + 1e-12 && u >= -1e-12 && u <= 1 + 1e-12 ? { t, u } : null;
}
/** Every crossing of polyline P (the route) with segment p→q → [{ ch, x, y, u }]. */
function hitsOnRoute(P, cum, p, q) {
  const out = [];
  for (let i = 1; i < P.length; i++) {
    const h = segHit(P[i - 1], P[i], p, q);
    if (!h) continue;
    out.push({ ch: cum[i - 1] + h.t * (cum[i] - cum[i - 1]), x: P[i - 1].x + (P[i].x - P[i - 1].x) * h.t, y: P[i - 1].y + (P[i].y - P[i - 1].y) * h.t, u: h.u });
  }
  // a crossing exactly on a shared vertex is found twice
  return out.filter((h, k) => !out.slice(0, k).some((o) => Math.abs(o.ch - h.ch) < 1e-9));
}
const gap = (lo1, hi1, lo2, hi2) => Math.max(lo1 - hi2, lo2 - hi1);   // clear gap between two vertical bands (negative = overlap)

export function routeCrossings(route, state, network, { groundAt, lib, units } = {}) {
  const out = [];
  try {
    const um = unitM(units);
    const P = goodPts(route);
    if (P.length < 2) return out;
    const cum = cumul(P);
    const A = trenchOf(route, lib);
    const R = state?.rules;
    const ruleMin = (id) => (id && Array.isArray(R?.clearances) ? R.clearances.find((c) => c?.id === id)?.min_m ?? null : null);
    const needOf = (rt, T) => { const v = ruleMin(rt?.clearance) ?? ruleMin(R?.ugCross); return fin(v) ? v : T.clearance; };
    const needA = needOf(route, A);
    const g = (x, y) => { try { const z = typeof groundAt === 'function' ? groundAt(x, y) : null; return fin(z) ? z : null; } catch { return null; } };
    // pipes of CivilCraft's network(s)
    const nets = Array.isArray(network) ? network : network ? [network] : [];
    const perUnit = units === 'm' ? 1000 : 12;   // pipe diameters: mm (metre project) or inches (feet project), as pipes.js
    for (const nw of nets) {
      const S = new Map((Array.isArray(nw?.structures) ? nw.structures : []).filter((s) => s && fin(s.x) && fin(s.y)).map((s) => [s.id, s]));
      for (const p of Array.isArray(nw?.pipes) ? nw.pipes : []) {
        const a = S.get(p?.from), b = S.get(p?.to);
        if (!a || !b) continue;
        for (const h of hitsOnRoute(P, cum, a, b)) {
          const z = g(h.x, h.y);
          let sep = null;
          if (z != null && A.cover != null && fin(p.invUp) && fin(p.invDn)) {
            const inv = (p.invUp + (p.invDn - p.invUp) * h.u) * um, top = inv + (fin(p.dia) ? p.dia / perUnit : 0) * um;
            const cTop = z * um - A.cover;
            sep = gap(cTop - A.band, cTop, inv, top);
          }
          out.push({ kind: 'pipe', id: p.id, at_ch: h.ch, sep_m: sep, need_m: needA, ok: sep == null ? null : sep >= needA - 1e-9 });
        }
      }
    }
    // other power routes
    for (const r of Array.isArray(state?.routes) ? state.routes : []) {
      if (!r || r === route || r.id === route.id) continue;
      const Q = goodPts(r);
      const B = trenchOf(r, lib);
      const need = Math.max(needA, needOf(r, B));
      for (let j = 1; j < Q.length; j++) for (const h of hitsOnRoute(P, cum, Q[j - 1], Q[j])) {
        // the same ground for both: the cables' tops are at −cover below it
        const sep = A.cover != null && B.cover != null ? gap(-A.cover - A.band, -A.cover, -B.cover - B.band, -B.cover) : null;
        out.push({ kind: 'route', id: r.id, at_ch: h.ch, sep_m: sep, need_m: need, ok: sep == null ? null : sep >= need - 1e-9 });
      }
    }
    // overhead lines: information only
    for (const l of Array.isArray(state?.lines) ? state.lines : []) {
      const Q = goodPts({ pts: l?.supports });
      for (let j = 1; j < Q.length; j++) for (const h of hitsOnRoute(P, cum, Q[j - 1], Q[j])) out.push({ kind: 'line', id: l.id, at_ch: h.ch, sep_m: null, need_m: null, ok: true, span: j - 1 });
    }
  } catch { /* odd input: what was found so far */ }
  return out.sort((a, b) => a.at_ch - b.at_ch);
}

export function lineUnderground(line, state, network, { groundAt, lib, units } = {}) {
  const out = [];
  try {
    const um = unitM(units);
    const S = goodPts({ pts: line?.supports });
    if (S.length < 2) return out;
    const cum = cumul(S);
    const g = (x, y) => { try { const z = typeof groundAt === 'function' ? groundAt(x, y) : null; return fin(z) ? z : null; } catch { return null; } };
    for (const r of Array.isArray(state?.routes) ? state.routes : []) {
      const Q = goodPts(r);
      const A = trenchOf(r, lib);
      for (let j = 1; j < Q.length; j++) for (const h of hitsOnRoute(S, cum, Q[j - 1], Q[j])) {
        const z = g(h.x, h.y);
        out.push({ kind: 'route', id: r.id, name: r.name || r.id, ch: h.ch, z: z != null && A.cover != null ? z - A.cover / um : null });
      }
    }
    const perUnit = units === 'm' ? 1000 : 12;
    for (const nw of Array.isArray(network) ? network : network ? [network] : []) {
      const St = new Map((Array.isArray(nw?.structures) ? nw.structures : []).filter((s) => s && fin(s.x) && fin(s.y)).map((s) => [s.id, s]));
      for (const p of Array.isArray(nw?.pipes) ? nw.pipes : []) {
        const a = St.get(p?.from), b = St.get(p?.to);
        if (!a || !b) continue;
        for (const h of hitsOnRoute(S, cum, a, b)) {
          const z = fin(p.invUp) && fin(p.invDn) ? p.invUp + (p.invDn - p.invUp) * h.u + (fin(p.dia) ? p.dia / perUnit : 0) : null;
          out.push({ kind: 'pipe', id: p.id, name: p.name || p.id, ch: h.ch, z });
        }
      }
    }
  } catch { /* odd input: what was found so far */ }
  return out.sort((a, b) => a.ch - b.ch);
}

export function joints(route, { lib, units } = {}) {
  const um = unitM(units);
  const cab = getItem(lib, route?.cable);
  const L = routeLength(route), Lm = L * um;
  const slack = 1 + (fin(route?.slack_pct) ? route.slack_pct : 0) / 100;
  const count = fin(route?.count) && route.count >= 1 ? route.count : 1;
  const run = Lm * slack;
  const drum = fin(cab?.drum_m) && cab.drum_m > 0 ? cab.drum_m : null;
  const res = { count: 0, perCable: 0, at: [], cableRun_m: run, drum_m: drum };
  if (!drum || !(run > 0)) return res;
  const per = Math.max(0, Math.ceil(run / drum - 1e-9) - 1);
  for (let k = 1; k <= per; k++) res.at.push((k * drum) / slack / um);
  res.perCable = per;
  res.count = per * count;
  return res;
}

export function trenchQuantities(route, { lib, units, groundAt } = {}) {
  void groundAt;
  const um = unitM(units);
  const T = trenchOf(route, lib);
  const length = routeLength(route) * um;
  const slack = 1 + (fin(route?.slack_pct) ? route.slack_pct : 0) / 100;
  const count = fin(route?.count) && route.count >= 1 ? route.count : 1;
  const q = { length_m: length, trench_m: length, excavation_m3: null, bedding_m3: null, backfill_m3: null, duct_m: 0, cable_m: null, joints: joints(route, { lib, units }).count };
  if (route?.cable) q.cable_m = (length * slack + 2 * (T.depth ?? 0)) * count;
  if (T.tr && T.depth != null && T.width != null) {
    q.excavation_m3 = T.width * T.depth * length;
    q.bedding_m3 = T.width * T.bedding * length;
    q.duct_m = T.ducts * length;
    const ductVol = T.ducts * Math.PI * (T.ductD / 2) ** 2 * length;
    q.backfill_m3 = Math.max(0, q.excavation_m3 - q.bedding_m3 - ductVol);
  }
  return q;
}
