/* SPDX-License-Identifier: Apache-2.0 */
/**
 * river-solve.js — steady 1D water surface profiles by the standard step method (0.8 SU.957). No DOM, no strings: warnings
 * are codes the UI words (`river.flag.<code>`). Tested by bin/test-civilcraft-river.mjs. Every result is a design aid that
 * needs an engineer's review (the UI and the report say so).
 *
 * The method (as in the usual 1D river programs' hydraulic reference; Chow 1959 ch. 10; Brunner, HEC-RAS Hydraulic Reference
 * Manual ch. 2):
 *   Energy between a section (2, upstream) and the next one downstream (1):
 *       WS2 + α2·V2²/2g = WS1 + α1·V1²/2g + he
 *       he = L·Sf + C·|α2·V2²/2g − α1·V1²/2g|
 *   L  = discharge-weighted reach length (Llob·Qlob + Lch·Qch + Lrob·Qrob) / (Qlob + Qch + Qrob), flows averaged over the two
 *        sections
 *   Sf = ((Q1 + Q2) / (K1 + K2))²   (average conveyance)
 *   C  = the upstream section's contraction coefficient when the velocity head grows downstream, else its expansion one
 *   K  = conveyance by subdivision: each overbank is split at its Manning n changes, K = Σ (k/n)·A·R^(2/3); the main channel is
 *        one piece with a composite n = (Σ Pi·ni^1.5 / P)^(2/3) when its n changes (k = 1 SI, 1.486 US)
 *   α  = At²·Σ(Ki³/Ai²) / Kt³ over LOB, channel, ROB (unless the section fixes α)
 *   Critical water surface = the minimum of the specific energy WS + α·Q²/(2g·A²) (a scan, then golden-section refinement).
 *   The water surface above a section's ends is held by vertical walls there (flagged `walls`).
 *
 * Each unknown water surface is solved with Brent's method on a bracket (subcritical: above critical; supercritical: below
 * it), to 1e-6 of a unit, so there is no first-guess trouble. No bracket = the section is set to critical depth (flag
 * `critical`), as the usual programs do.
 *
 * Regimes: 'sub' runs upstream from the downstream boundary; 'super' runs downstream from the upstream boundary; 'mixed'
 * (a preview) runs both and keeps, at each section, the one with the larger specific force Q²/(gA) + A·ȳ, flagging a
 * hydraulic jump (`jump`) between sections where it changes from super to sub. Where the jump sits between the two sections
 * is not located.
 *
 *   geometry(section) → geo                    prepared once per section
 *   Ineffective areas and levees (river.js ineffectiveOf): a segment whose middle lies in an active ineffective range (water
 *   surface below its trigger, or no trigger) adds nothing to A, P, T, K or the specific force; the walls at the section's ends
 *   are not added there either.
 *   hydraulics(geo, ws, units) → { A, P, T, K, alpha, M1 (= A·ȳ), walls, reg: { lob, ch, rob: { A, P, T, K } } }
 *   criticalWs(geo, q, units) → ws
 *   normalWs(geo, q, slope, units) → ws | null
 *   solve(model) → { units, issues, profiles: [{ name, regime, rows (downstream first), flags }] }
 *   rows: { id, rs, q, wse, crit, egl, minZ, depth, alpha, area, top, v, vch, froude, frCh, qLob, qCh, qRob, sf, length,
 *           hf, hce, regime ('sub'|'super'|'crit'), flags: [code] }
 *   Flag codes: critical (set to critical depth), walls (water above the section's ends), froude (Fr > 1 in a subcritical
 *   answer, or < 1 in a supercritical one), kratio (conveyance ratio of the reach outside 0.7–1.4: add sections),
 *   noconv (the energy balance did not close), jump (mixed: a hydraulic jump between this section and the next downstream).
 */

import { UNIT_CONST, ordered, flowAt, nZonesFor, check, ineffectiveOf } from './river.js';

const TOL = 1e-6;

// ---------------------------------------------------------------------------
// Section geometry

export function geometry(sec) {
  const zones = nZonesFor(sec);
  const [bL, bR] = sec.banks;
  // element boundaries: zone edges + banks
  const cuts = new Set([bL, bR]);
  for (const z of zones) { cuts.add(z.o0); cuts.add(z.o1); }
  const ineff = ineffectiveOf(sec);   // 0.8 SU.957: ineffective areas and levees
  for (const r of ineff) { cuts.add(r.o0); cuts.add(r.o1); }
  const lo = sec.pts[0].o, hi = sec.pts[sec.pts.length - 1].o;
  const edges = [...cuts].filter((o) => o >= lo && o <= hi).sort((a, b) => a - b);
  // points with the element boundaries inserted
  const pts = [];
  const zAtO = (o) => {
    for (let i = 1; i < sec.pts.length; i++) {
      const p = sec.pts[i - 1], q = sec.pts[i];
      if (o >= p.o - 1e-12 && o <= q.o + 1e-12) return q.o > p.o ? p.z + ((q.z - p.z) * (o - p.o)) / (q.o - p.o) : q.z;
    }
    return null;
  };
  let e = 0;
  for (let i = 0; i < sec.pts.length; i++) {
    const p = sec.pts[i];
    while (e < edges.length && edges[e] < p.o - 1e-12) {
      if (i > 0 && edges[e] > sec.pts[i - 1].o + 1e-12) { const z = zAtO(edges[e]); if (z !== null) pts.push({ o: edges[e], z }); }
      e++;
    }
    while (e < edges.length && Math.abs(edges[e] - p.o) <= 1e-12) e++;
    pts.push({ o: p.o, z: p.z });
  }
  // elements: [o0, o1] with region and n
  const elems = [];
  for (let i = 1; i < edges.length; i++) {
    const o0 = edges[i - 1], o1 = edges[i], mid = (o0 + o1) / 2;
    if (!(o1 > o0)) continue;
    const zone = zones.find((z) => mid >= z.o0 && mid <= z.o1) || zones[zones.length - 1];
    elems.push({ o0, o1, n: zone.n, reg: mid < bL ? 'lob' : mid > bR ? 'rob' : 'ch' });
  }
  const segs = [];   // each segment with its element index
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    // a vertical wall belongs to the piece whose bed it bounds: going down → the piece to its right, going up → to its left
    const mid = b.o > a.o ? (a.o + b.o) / 2 : b.z < a.z ? a.o + 1e-9 : a.o - 1e-9;
    let k = elems.findIndex((el) => mid >= el.o0 - 1e-12 && mid <= el.o1 + 1e-12);
    if (k < 0) k = mid < bL ? 0 : elems.length - 1;
    segs.push({ a, b, k });
  }
  const zs = pts.map((p) => p.z);
  return { sec, pts, elems, segs, ineff, minZ: Math.min(...zs), maxZ: Math.max(...zs), zL: pts[0].z, zR: pts[pts.length - 1].z, alphaFix: sec.alpha ?? null };
}

export function hydraulics(geo, ws, units = 'm') {
  const k = UNIT_CONST[units === 'ft' ? 'ft' : 'm'].k;
  const el = geo.elems.map(() => ({ A: 0, P: 0, T: 0 }));
  let M1 = 0;
  const cut = (o) => geo.ineff.some((r) => o > r.o0 - 1e-12 && o < r.o1 + 1e-12 && (r.trigger === null || ws < r.trigger));   // inside an active ineffective area
  for (const { a, b, k: i } of geo.segs) {
    const da = ws - a.z, db = ws - b.z, dx = b.o - a.o, e = el[i];
    if (da <= 0 && db <= 0) continue;
    if (cut(b.o > a.o ? (a.o + b.o) / 2 : b.z < a.z ? a.o + 1e-9 : a.o - 1e-9)) continue;
    if (da >= 0 && db >= 0) {
      e.A += ((da + db) / 2) * dx; e.P += Math.hypot(dx, b.z - a.z); e.T += dx;
      M1 += (dx * (da * da + da * db + db * db)) / 6;
    } else {
      const dp = Math.max(da, db), dn = Math.min(da, db), f = dp / (dp - dn), w = f * dx;
      e.A += (dp * w) / 2; e.P += Math.hypot(w, dp); e.T += w;
      M1 += (dp * dp * w) / 6;
    }
  }
  let walls = false;
  if (ws > geo.zL && el.length && !cut(geo.pts[0].o + 1e-9)) { el[0].P += ws - geo.zL; walls = true; }
  if (ws > geo.zR && el.length && !cut(geo.pts[geo.pts.length - 1].o - 1e-9)) { el[el.length - 1].P += ws - geo.zR; walls = true; }
  const reg = { lob: { A: 0, P: 0, T: 0, K: 0 }, ch: { A: 0, P: 0, T: 0, K: 0 }, rob: { A: 0, P: 0, T: 0, K: 0 } };
  let chPn = 0;
  for (let i = 0; i < el.length; i++) {
    const r = reg[geo.elems[i].reg], e = el[i], n = geo.elems[i].n;
    r.A += e.A; r.P += e.P; r.T += e.T;
    if (geo.elems[i].reg === 'ch') chPn += e.P * Math.pow(n, 1.5);
    else if (e.A > 0 && e.P > 0) r.K += (k / n) * e.A * Math.pow(e.A / e.P, 2 / 3);
  }
  if (reg.ch.A > 0 && reg.ch.P > 0) {
    const nc = Math.pow(chPn / reg.ch.P, 2 / 3);
    reg.ch.K = (k / nc) * reg.ch.A * Math.pow(reg.ch.A / reg.ch.P, 2 / 3);
    reg.ch.n = nc;
  }
  const A = reg.lob.A + reg.ch.A + reg.rob.A, K = reg.lob.K + reg.ch.K + reg.rob.K;
  let alpha = 1;
  if (geo.alphaFix) alpha = geo.alphaFix;
  else if (K > 0) {
    let s = 0;
    for (const r of [reg.lob, reg.ch, reg.rob]) if (r.A > 0) s += (r.K * r.K * r.K) / (r.A * r.A);
    alpha = Math.max(1, (A * A * s) / (K * K * K));
  }
  return { A, P: reg.lob.P + reg.ch.P + reg.rob.P, T: reg.lob.T + reg.ch.T + reg.rob.T, K, alpha, M1, walls, reg };
}

// ---------------------------------------------------------------------------
// Root finding and minimising

/** Brent's method on [a, b] with f(a)·f(b) ≤ 0. Returns { x, ok, iter }. */
export function brent(f, a, b, tol = TOL, maxIter = 200) {
  let fa = f(a), fb = f(b);
  if (fa === 0) return { x: a, ok: true, iter: 0 };
  if (fb === 0) return { x: b, ok: true, iter: 0 };
  if (fa * fb > 0) return { x: NaN, ok: false, iter: 0 };
  let c = a, fc = fa, d = b - a, e = d;
  for (let it = 1; it <= maxIter; it++) {
    if (fb * fc > 0) { c = a; fc = fa; d = e = b - a; }
    if (Math.abs(fc) < Math.abs(fb)) { a = b; b = c; c = a; fa = fb; fb = fc; fc = fa; }
    const tol1 = 2 * Number.EPSILON * Math.abs(b) + tol / 2, xm = (c - b) / 2;
    if (Math.abs(xm) <= tol1 || fb === 0) return { x: b, ok: true, iter: it };
    if (Math.abs(e) >= tol1 && Math.abs(fa) > Math.abs(fb)) {
      const s = fb / fa;
      let p, q;
      if (a === c) { p = 2 * xm * s; q = 1 - s; } else {
        const qq = fa / fc, r = fb / fc;
        p = s * (2 * xm * qq * (qq - r) - (b - a) * (r - 1)); q = (qq - 1) * (r - 1) * (s - 1);
      }
      if (p > 0) q = -q; else p = -p;
      if (2 * p < Math.min(3 * xm * q - Math.abs(tol1 * q), Math.abs(e * q))) { e = d; d = p / q; } else { d = xm; e = d; }
    } else { d = xm; e = d; }
    a = b; fa = fb;
    b += Math.abs(d) > tol1 ? d : xm > 0 ? tol1 : -tol1;
    fb = f(b);
  }
  return { x: b, ok: false, iter: maxIter };
}

function golden(f, a, b, tol = TOL) {
  const r = (Math.sqrt(5) - 1) / 2;
  let c = b - r * (b - a), d = a + r * (b - a), fc = f(c), fd = f(d);
  for (let i = 0; i < 200 && Math.abs(b - a) > tol; i++) {
    if (fc < fd) { b = d; d = c; fd = fc; c = b - r * (b - a); fc = f(c); } else { a = c; c = d; fc = fd; d = a + r * (b - a); fd = f(d); }
  }
  return (a + b) / 2;
}

const G = (units) => UNIT_CONST[units === 'ft' ? 'ft' : 'm'].g;

/** Specific energy above the datum at water surface ws. */
function energy(geo, ws, q, units) {
  const h = hydraulics(geo, ws, units);
  return h.A > 0 ? ws + (h.alpha * q * q) / (2 * G(units) * h.A * h.A) : Infinity;
}

export function criticalWs(geo, q, units = 'm') {
  const E = (ws) => energy(geo, ws, q, units);
  const lo = geo.minZ;
  let hi = Math.max(geo.maxZ, lo + 1e-3);
  for (let grow = 0; grow < 40; grow++) {
    const N = 200, step = (hi - lo) / N;
    let bi = 1, be = Infinity;
    for (let i = 1; i <= N; i++) { const v = E(lo + i * step); if (v < be) { be = v; bi = i; } }
    if (bi < N) return golden(E, lo + Math.max(bi - 1, 0) * step + 1e-12, lo + (bi + 1) * step, TOL / 10);
    hi = lo + (hi - lo) * 2;   // the minimum is above the section: walls carry it
  }
  return hi;
}

export function normalWs(geo, q, slope, units = 'm') {
  if (!(slope > 0)) return null;
  const target = q / Math.sqrt(slope);
  const f = (ws) => hydraulics(geo, ws, units).K - target;
  let hi = Math.max(geo.maxZ, geo.minZ + 1e-3);
  for (let i = 0; i < 60 && f(hi) < 0; i++) hi = geo.minZ + (hi - geo.minZ) * 2;
  const r = brent(f, geo.minZ + 1e-12, hi);
  return r.ok ? r.x : null;
}

// ---------------------------------------------------------------------------
// The standard step

function state(geo, ws, q, units) {
  const h = hydraulics(geo, ws, units);
  const hv = h.A > 0 ? (h.alpha * q * q) / (2 * G(units) * h.A * h.A) : Infinity;
  const split = (r) => (h.K > 0 ? (q * r.K) / h.K : 0);
  return { ws, h, hv, H: ws + hv, qLob: split(h.reg.lob), qCh: split(h.reg.ch), qRob: split(h.reg.rob), q };
}

/** Loss from up (u, the section that owns the reach) to down (d). */
function loss(up, u, d) {
  const r = up.reach || {};
  const ql = (u.qLob + d.qLob) / 2, qc = (u.qCh + d.qCh) / 2, qr = (u.qRob + d.qRob) / 2, qt = ql + qc + qr;
  const L = qt > 0 ? ((r.lob ?? r.ch ?? 0) * ql + (r.ch ?? 0) * qc + (r.rob ?? r.ch ?? 0) * qr) / qt : r.ch ?? 0;
  const Ks = u.h.K + d.h.K;
  const sf = Ks > 0 ? Math.pow((u.q + d.q) / Ks, 2) : Infinity;
  const C = d.hv > u.hv ? up.cc : up.ce;
  const hf = L * sf, hce = C * Math.abs(u.hv - d.hv);
  return { L, sf, hf, hce, he: hf + hce };
}

function boundaryWs(b, geo, q, units) {
  if (!b) return null;
  if (b.type === 'ws') return b.wse;
  if (b.type === 'critical') return criticalWs(geo, q, units);
  return normalWs(geo, q, b.slope, units);
}

function makeRow(sec, geo, st, crit, units, extra = {}) {
  const g = G(units), h = st.h;
  const vch = h.reg.ch.A > 0 ? st.qCh / h.reg.ch.A : 0;
  const frCh = h.reg.ch.A > 0 && h.reg.ch.T > 0 ? vch / Math.sqrt((g * h.reg.ch.A) / h.reg.ch.T) : 0;
  const v = h.A > 0 ? st.q / h.A : 0;
  const fr = h.A > 0 && h.T > 0 ? v / Math.sqrt((g * h.A) / h.T) : 0;
  return {
    id: sec.id, rs: sec.rs, q: st.q, wse: st.ws, crit, egl: st.H, minZ: geo.minZ, depth: st.ws - geo.minZ, alpha: h.alpha, area: h.A, top: h.T,
    v, vch, froude: fr, frCh, qLob: st.qLob, qCh: st.qCh, qRob: st.qRob, sf: h.K > 0 ? (st.q / h.K) ** 2 : Infinity, k: h.K,
    specificForce: (st.q * st.q) / (g * h.A) + h.M1,
    length: 0, hf: 0, hce: 0, regime: 'sub', flags: h.walls ? ['walls'] : [], ...extra,
  };
}

function runSub(secs, geos, profile, units) {
  const rows = [];
  const n = secs.length;
  let prev = null;
  for (let i = 0; i < n; i++) {
    const sec = secs[i], geo = geos[i], q = flowAt(profile, sec.rs);
    const crit = criticalWs(geo, q, units);
    let ws, flags = [], lossInfo = null;
    if (i === 0) {
      ws = boundaryWs(profile.down, geo, q, units);
      if (ws === null || ws < crit) { flags.push('critical'); ws = crit; }
    } else {
      const f = (w) => { const u = state(geo, w, q, units); return u.H - (prev.H + loss(sec, u, prev).he); };
      const fc = f(crit);
      if (!(fc < 0)) { ws = crit; flags.push('critical'); } else {
        let hi = Math.max(crit, prev.H) + Math.max(1e-3, prev.H - geo.minZ);
        for (let k = 0; k < 60 && !(f(hi) > 0); k++) hi = crit + (hi - crit) * 2;
        const r = brent(f, crit, hi);
        ws = r.ok ? r.x : crit;
        if (!r.ok) flags.push('noconv');
      }
    }
    const st = state(geo, ws, q, units);
    if (prev) lossInfo = loss(sec, st, prev);
    const row = makeRow(sec, geo, st, crit, units, lossInfo ? { length: lossInfo.L, hf: lossInfo.hf, hce: lossInfo.hce } : {});
    row.flags.push(...flags);
    row.regime = flags.includes('critical') ? 'crit' : 'sub';
    if (row.regime === 'sub' && row.frCh > 1 + 1e-6) row.flags.push('froude');
    if (prev && prev.h.K > 0) { const kr = st.h.K / prev.h.K; if (kr < 0.7 || kr > 1.4) row.flags.push('kratio'); }
    rows.push(row);
    prev = st;
  }
  return rows;
}

function runSuper(secs, geos, profile, units) {
  const rows = new Array(secs.length);
  const n = secs.length;
  let prev = null;   // upstream state
  for (let i = n - 1; i >= 0; i--) {
    const sec = secs[i], geo = geos[i], q = flowAt(profile, sec.rs);
    const crit = criticalWs(geo, q, units);
    let ws, flags = [], lossInfo = null;
    if (i === n - 1) {
      ws = boundaryWs(profile.up, geo, q, units);
      if (ws === null || ws > crit) { flags.push('critical'); ws = crit; }
    } else {
      const up = secs[i + 1];
      const f = (w) => { const d = state(geo, w, q, units); return d.H + loss(up, prev, d).he - prev.H; };
      const fc = f(crit);
      if (!(fc < 0)) { ws = crit; flags.push('critical'); } else {
        let lo = geo.minZ + Math.max(1e-9, (crit - geo.minZ) * 1e-3);
        for (let k = 0; k < 60 && !(f(lo) > 0); k++) lo = geo.minZ + (lo - geo.minZ) / 4;
        const r = brent(f, lo, crit);
        ws = r.ok ? r.x : crit;
        if (!r.ok) flags.push('noconv');
      }
    }
    const st = state(geo, ws, q, units);
    rows[i] = makeRow(sec, geo, st, crit, units);
    rows[i].flags.push(...flags);
    rows[i].regime = flags.includes('critical') ? 'crit' : 'super';
    if (rows[i].regime === 'super' && rows[i].frCh < 1 - 1e-6) rows[i].flags.push('froude');
    if (prev) {
      lossInfo = loss(secs[i + 1], prev, st);
      Object.assign(rows[i + 1], { length: lossInfo.L, hf: lossInfo.hf, hce: lossInfo.hce });
      if (prev.h.K > 0) { const kr = prev.h.K / st.h.K; if (kr < 0.7 || kr > 1.4) rows[i + 1].flags.push('kratio'); }
    }
    prev = st;
  }
  return rows;
}

function runMixed(secs, geos, profile, units) {
  const sub = runSub(secs, geos, profile, units), sup = runSuper(secs, geos, profile, units);
  const rows = sub.map((r, i) => {
    const s = sup[i];
    const pickSuper = s.regime === 'super' && (r.regime === 'crit' || s.specificForce > r.specificForce);
    return { ...(pickSuper ? s : r), flags: [...(pickSuper ? s : r).flags] };
  });
  for (let i = 1; i < rows.length; i++) if (rows[i].regime === 'super' && rows[i - 1].regime !== 'super') rows[i].flags.push('jump');
  return rows;
}

export function solveProfile(model, profile) {
  const units = model.units === 'ft' ? 'ft' : 'm';
  const secs = ordered(model), geos = secs.map(geometry);
  const regime = model.regime || 'sub';
  const rows = regime === 'super' ? runSuper(secs, geos, profile, units) : regime === 'mixed' ? runMixed(secs, geos, profile, units) : runSub(secs, geos, profile, units);
  const flags = {};
  for (const r of rows) for (const f of r.flags) flags[f] = (flags[f] || 0) + 1;
  return { name: profile.name, regime, rows, flags };
}

const BLOCKING = new Set(['nomodel', 'fewsections', 'noprofile', 'samers', 'banks', 'nodown', 'noup', 'reach']);

export function solve(model) {
  const issues = check(model);
  const units = model?.units === 'ft' ? 'ft' : 'm';
  if (issues.some((i) => BLOCKING.has(i.code))) return { units, issues, profiles: [] };
  return { units, issues, profiles: model.profiles.map((p) => solveProfile(model, p)) };
}
