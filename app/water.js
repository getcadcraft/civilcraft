/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine; the problem codes are shown through water-ui.js's strings (water.* keys) */
/**
 * water.js — water mains: a looped pressure network solved for heads and flows (0.8 LC.16 steps W1 + W2, session `civil-extra-08`).
 * DOM-free (bin/test-civilcraft-water.mjs). Our own code from published maths — Hazen–Williams head loss, the minor-loss
 * form K·v²/2g, and the global gradient method (Todini and Pilati 1988; the same family of solver every water-network program
 * uses) — with no vendored code. A calculation aid: an engineer checks every result (the help says so).
 *
 * Model (`state.water`, project units: ft / in / gpm / psi, or m / mm / L/s / kPa):
 *   nodes: [{ id, name, x, y, z, demand, kind: 'junction' | 'reservoir' | 'tank', head (reservoir: total head, null = z),
 *             level, minLevel, maxLevel, diameter (tank, in length-small units) }]
 *   pipes: [{ id, name, a, b, kind: 'pipe' | 'pump' | 'prv', length (null = plan distance), d, c, minor, status: 'open' | 'closed',
 *             check (pipes: a check valve), setting (prv: the pressure it holds), curve: [[Q, H], …] (pump: 1 or 3 points),
 *             pattern (pump: 0/1 per step) }]
 *   settings: { minP, maxP, vMax, c (default Hazen–Williams C), pattern (demand multipliers per step), step (seconds), duration (hours) }
 *
 *   cleanWater(raw, units) → the model, untrusted-input safe          emptyWater(units)
 *   solve(water, units, { mult, extra, heights, levels, pumpOn }) → { ok, converged, iterations, nodes: Map, pipes: Map, problems, totals }
 *   fireFlow(water, units, nodeId, { flow, residual }) → { atFlow, available }
 *   extended(water, units, { hours, step }) → { steps: [{ t, mult, nodes, pipes, tanks }], problems }
 *   writeInp(water, units) → EPANET-format text         readInp(text, units) → { water, notes }
 *
 * Signs: a pipe's flow is positive from `a` to `b`. Heads are total head (elevation + pressure head) in project length.
 */

import { cleanFittings } from './water-objects.js';

const G = 9.80665;
const FT = 0.3048, INCH = 0.0254, GPM = 6.30902e-5, LS = 1e-3, MM = 1e-3;
export const PSI_PER_FT = 0.433527, KPA_PER_M = 9.80665;
export const LIMITS = { nodes: 5000, pipes: 8000, text: 120, pattern: 1000, curve: 3 };

const si = (units) => (units === 'm' ? { len: 1, dia: MM, q: LS, p: KPA_PER_M } : { len: FT, dia: INCH, q: GPM, p: PSI_PER_FT / FT });
const str = (v, n = LIMITS.text) => String(v ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, n);
const num = (v, d = null) => { const x = typeof v === 'number' ? v : (typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN); return Number.isFinite(x) ? x : d; };
const pos = (v, d = null) => { const x = num(v); return x != null && x > 0 ? x : d; };

export const defaults = (units) => (units === 'm'
  ? { minP: 140, maxP: 700, vMax: 3.0, c: 130, step: 3600, duration: 24, pattern: [] }
  : { minP: 20, maxP: 100, vMax: 10, c: 130, step: 3600, duration: 24, pattern: [] });
export const emptyWater = (units) => ({ nodes: [], pipes: [], settings: defaults(units) });

/** The model from a file or script (untrusted): clamps numbers, drops what cannot be read, keeps ids unique. */
export function cleanWater(raw, units) {
  const out = emptyWater(units);
  if (!raw || typeof raw !== 'object') return out;
  const d = defaults(units), s = raw.settings || {};
  out.settings = { minP: pos(s.minP, d.minP), maxP: pos(s.maxP, d.maxP), vMax: pos(s.vMax, d.vMax), c: Math.min(200, pos(s.c, d.c)),
    step: Math.max(60, Math.min(86400, Math.round(pos(s.step, d.step)))), duration: Math.max(1, Math.min(720, pos(s.duration, d.duration))),
    pattern: (Array.isArray(s.pattern) ? s.pattern : []).slice(0, LIMITS.pattern).map((v) => Math.max(0, num(v, 1))) };
  const ids = new Set();
  for (const n of (Array.isArray(raw.nodes) ? raw.nodes : []).slice(0, LIMITS.nodes)) {
    if (!n || typeof n !== 'object') continue;
    const id = str(n.id, 40);
    if (!id || ids.has(id)) continue;
    const x = num(n.x), y = num(n.y);
    if (x == null || y == null) continue;
    const kind = n.kind === 'reservoir' || n.kind === 'tank' ? n.kind : 'junction';
    const node = { id, name: str(n.name), x, y, z: num(n.z, null), demand: Math.max(0, num(n.demand, 0)), kind };
    if (kind === 'reservoir') node.head = num(n.head, null);
    if (kind === 'tank') {
      node.level = Math.max(0, num(n.level, 0)); node.minLevel = Math.max(0, num(n.minLevel, 0));
      node.maxLevel = Math.max(node.minLevel, num(n.maxLevel, Math.max(node.level, node.minLevel + 1)));
      node.level = Math.min(node.maxLevel, Math.max(node.minLevel, node.level));
      node.diameter = pos(n.diameter, units === 'm' ? 10 : 30);
    }
    ids.add(id); out.nodes.push(node);
  }
  const pids = new Set();
  for (const p of (Array.isArray(raw.pipes) ? raw.pipes : []).slice(0, LIMITS.pipes)) {
    if (!p || typeof p !== 'object') continue;
    const id = str(p.id, 40), a = str(p.a, 40), b = str(p.b, 40);
    if (!id || pids.has(id) || !ids.has(a) || !ids.has(b) || a === b) continue;
    const kind = p.kind === 'pump' || p.kind === 'prv' ? p.kind : 'pipe';
    const q = { id, name: str(p.name), a, b, kind, status: p.status === 'closed' ? 'closed' : 'open' };
    q.length = pos(p.length, null); q.d = pos(p.d, null); q.c = Math.min(200, pos(p.c, null) ?? 0) || null; q.minor = Math.max(0, num(p.minor, 0));
    if (kind === 'pipe') q.check = p.check === true;
    if (kind === 'prv') q.setting = Math.max(0, num(p.setting, 0));
    if (kind === 'pump') {
      const cv = (Array.isArray(p.curve) ? p.curve : []).slice(0, LIMITS.curve).map((r) => (Array.isArray(r) ? [num(r[0]), num(r[1])] : null)).filter((r) => r && r[0] != null && r[1] != null && r[0] >= 0 && r[1] >= 0);
      q.curve = cv;
      q.pattern = (Array.isArray(p.pattern) ? p.pattern : []).slice(0, LIMITS.pattern).map((v) => (num(v, 1) > 0 ? 1 : 0));
    }
    pids.add(id); out.pipes.push(q);
  }
  const fit = cleanFittings(raw.fittings, out);   // 0.8 CV.2 (civil_PART_3): hydrants, valves and the like, placed on a node or along a pipe
  if (fit.length) out.fittings = fit;
  return out;
}

/** A pump curve's head at flow Q (SI): one point → shutoff 1.33 H and 2 Q at 0 head (the usual convention); three points →
 *  the power law H = H0 − r·Q^n through the shutoff point and the other two. Returns { h0, r, n }. */
export function pumpCurve(curve) {
  const c = [...(curve || [])].sort((x, y) => x[0] - y[0]);
  if (c.length === 1) {
    const [q1, h1] = c[0];
    if (!(q1 > 0 && h1 > 0)) return null;
    const h0 = 1.33334 * h1, q2 = 2 * q1, h2 = 0;
    const n = Math.log((h0 - h2) / (h0 - h1)) / Math.log(q2 / q1);
    return { h0, r: (h0 - h1) / Math.pow(q1, n), n };
  }
  if (c.length === 3 && c[0][0] === 0) {
    const [, h0] = c[0], [q1, h1] = c[1], [q2, h2] = c[2];
    if (!(h0 > h1 && h1 > h2 && q2 > q1 && q1 > 0)) return null;
    const n = Math.log((h0 - h2) / (h0 - h1)) / Math.log(q2 / q1);
    return { h0, r: (h0 - h1) / Math.pow(q1, n), n };
  }
  if (c.length === 3) {
    const [q0, h0] = c[0], [q1, h1] = c[1], [q2, h2] = c[2];   // a design point in the middle, as three points of a curve
    if (!(h0 > h1 && h1 > h2 && q2 > q1 && q1 > q0)) return null;
    const hh = h0 + (h0 - h1) * (q0 / Math.max(1e-12, q1 - q0)) * 0;   // no shutoff given: use the first point as shutoff
    const n = Math.log((hh - h2) / (hh - h1)) / Math.log(q2 / q1);
    return { h0: hh, r: (hh - h1) / Math.pow(q1, n), n };
  }
  return null;
}

/** Hazen–Williams in SI: head loss (m) for flow Q (m³/s) in a pipe L m long, D m wide. */
export const hwLoss = (Q, L, D, C) => 10.67 * L * Math.pow(Math.abs(Q), 1.852) / (Math.pow(C, 1.852) * Math.pow(D, 4.871)) * Math.sign(Q);

/** Solve one steady state. `opts`: mult (demand multiplier), extra { nodeId: flow in project flow units } (fire flow, a draw),
 *  levels { tankId: level } (tank levels for this state), pumpOn { pumpId: bool }. */
export function solve(water, units, opts = {}) {
  const W = cleanWater(water, units), K = si(units), S = W.settings;
  const nodes = W.nodes, N = nodes.length;
  const idx = new Map(nodes.map((n, i) => [n.id, i]));
  const mult = opts.mult ?? 1;
  const problems = [];
  const z = nodes.map((n) => (n.z == null ? 0 : n.z * K.len));
  nodes.forEach((n, i) => { if (n.z == null && n.kind !== 'reservoir') problems.push({ code: 'noelev', id: n.id }); });
  const fixedHead = new Array(N).fill(null);
  nodes.forEach((n, i) => {
    if (n.kind === 'reservoir') fixedHead[i] = (n.head == null ? (n.z ?? 0) : n.head) * K.len;
    else if (n.kind === 'tank') fixedHead[i] = z[i] + (opts.levels?.[n.id] ?? n.level ?? 0) * K.len;
  });
  const dem = nodes.map((n) => (n.kind === 'junction' ? n.demand * mult * K.q : 0));
  for (const [id, f] of Object.entries(opts.extra || {})) { const i = idx.get(id); if (i != null && nodes[i].kind === 'junction') dem[i] += f * K.q; }

  // links
  const L = [];
  for (const p of W.pipes) {
    const a = idx.get(p.a), b = idx.get(p.b);
    const k = { id: p.id, src: p, kind: p.kind, a, b, status: p.status === 'closed' ? 'closed' : 'open', check: p.check === true };
    if (p.kind === 'pump') {
      const off = opts.pumpOn && opts.pumpOn[p.id] === false;
      k.pc = pumpCurve((p.curve || []).map(([q, h]) => [q * K.q, h * K.len]));   // the curve is in project units; the solver works in SI
      if (!k.pc) { problems.push({ code: 'pumpcurve', id: p.id }); k.status = 'closed'; }
      if (off) k.status = 'closed';
      k.q0 = p.curve?.[Math.min(1, (p.curve?.length || 1) - 1)]?.[0] * K.q || 0.001;
    } else {
      const len = (p.length ?? Math.hypot(nodes[a].x - nodes[b].x, nodes[a].y - nodes[b].y)) * K.len;
      const D = (p.d ?? 0) * K.dia;
      if (!(D > 0)) { problems.push({ code: 'nodiameter', id: p.id }); k.status = 'closed'; k.D = 0.1; } else k.D = D;
      if (!(len > 0)) { k.L = 1; if (p.kind === 'pipe') problems.push({ code: 'nolength', id: p.id }); } else k.L = len;
      k.C = p.c || S.c;
      k.r = 10.67 * k.L / (Math.pow(k.C, 1.852) * Math.pow(k.D, 4.871));
      k.m = 8 * (p.minor || 0) / (Math.PI * Math.PI * G * Math.pow(k.D, 4));
      k.q0 = Math.PI * k.D * k.D / 4 * 0.3;
      if (p.kind === 'prv') { k.hs = (nodes[b].z == null ? 0 : nodes[b].z * K.len) + (p.setting || 0) / K.p; k.status = p.status === 'closed' ? 'closed' : 'active'; }
    }
    L.push(k);
  }
  const Q = L.map((k) => (k.status === 'closed' ? 0 : k.q0));
  const H = nodes.map((n, i) => (fixedHead[i] != null ? fixedHead[i] : Math.max(...fixedHead.filter((h) => h != null), 0)));

  const QMIN = 1e-7;
  const link = (k, q) => {   // → [f(q) head loss a→b, g = df/dq]
    if (k.status === 'closed') return [q * 1e8, 1e8];
    if (k.kind === 'pump') {
      const c = k.pc, qq = Math.max(q, QMIN);
      return [-(c.h0 - c.r * Math.pow(qq, c.n)), Math.max(c.r * c.n * Math.pow(qq, c.n - 1), 1e-6)];
    }
    const aq = Math.max(Math.abs(q), QMIN);
    const f = (k.r * Math.pow(aq, 0.852) + k.m * aq) * q;
    return [f, Math.max(1.852 * k.r * Math.pow(aq, 0.852) + 2 * k.m * aq, 1e-9)];
  };

  let converged = false, it = 0, statusChanged = true, reach = new Array(N).fill(false);
  const qprv = new Map();
  for (it = 1; it <= 300; it++) {
    // active PRVs hold their downstream node at the setting
    const fh = fixedHead.slice();
    for (const k of L) if (k.kind === 'prv' && k.status === 'active') fh[k.b] = k.hs;
    // coefficients
    const P = new Array(L.length), Y = new Array(L.length);
    L.forEach((k, i) => {
      if (k.kind === 'prv' && k.status === 'active') { P[i] = 0; Y[i] = 0; return; }
      const [f, g] = link(k, Q[i]);
      P[i] = 1 / g; Y[i] = Q[i] - f / g;
      if (k.status === 'closed') { P[i] = 1e-8; Y[i] = Q[i]; }
    });
    // unknown nodes = not fixed and reachable from a fixed head
    const adj = Array.from({ length: N }, () => []);
    L.forEach((k, i) => { if (P[i] > 0 && !(k.status === 'closed')) { adj[k.a].push(k.b); adj[k.b].push(k.a); } });
    reach = new Array(N).fill(false); const stack = [];
    for (let i = 0; i < N; i++) if (fh[i] != null) { reach[i] = true; stack.push(i); }
    while (stack.length) { const u = stack.pop(); for (const v of adj[u]) if (!reach[v]) { reach[v] = true; stack.push(v); } }
    const unk = []; const pos0 = new Array(N).fill(-1);
    for (let i = 0; i < N; i++) if (fh[i] == null && reach[i]) { pos0[i] = unk.length; unk.push(i); }
    const M = unk.length;
    const diag = new Float64Array(M), rhs = new Float64Array(M), rows = Array.from({ length: M }, () => []);
    const extra = new Float64Array(N);
    for (const k of L) if (k.kind === 'prv' && k.status === 'active') { const qp = qprv.get(k.id) || 0; extra[k.a] += qp; }
    for (let j = 0; j < M; j++) rhs[j] = -(dem[unk[j]] + extra[unk[j]]);
    L.forEach((k, i) => {
      if (!(P[i] > 0)) return;
      const ua = pos0[k.a], ub = pos0[k.b];
      // node b gains +Q, node a loses Q:  Q = P (Ha − Hb) + Y
      if (ub >= 0) { diag[ub] += P[i]; rhs[ub] += Y[i]; if (ua >= 0) rows[ub].push([ua, -P[i]]); else if (fh[k.a] != null) rhs[ub] += P[i] * fh[k.a]; }
      if (ua >= 0) { diag[ua] += P[i]; rhs[ua] -= Y[i]; if (ub >= 0) rows[ua].push([ub, -P[i]]); else if (fh[k.b] != null) rhs[ua] += P[i] * fh[k.b]; }
    });
    const Hn = solveSpd(M, diag, rows, rhs, unk.map((i) => H[i]));
    for (let j = 0; j < M; j++) H[unk[j]] = Hn[j];
    for (let i = 0; i < N; i++) if (fh[i] != null) H[i] = fh[i];
    // new flows
    let dq = 0, sq = 0;
    L.forEach((k, i) => {
      let qn;
      if (k.kind === 'prv' && k.status === 'active') qn = null;
      else if (!reach[k.a] && !reach[k.b]) qn = 0;
      else if (k.status === 'closed') qn = 0;
      else qn = P[i] * (H[k.a] - H[k.b]) + Y[i];
      if (qn != null) { dq += Math.abs(qn - Q[i]); sq += Math.abs(qn); Q[i] = qn; }
    });
    // active PRV flow = what continuity at its downstream node needs
    for (const k of L) if (k.kind === 'prv' && k.status === 'active') {
      let qp = dem[k.b];
      L.forEach((o, i) => { if (o === k) return; if (o.a === k.b) qp += Q[i]; if (o.b === k.b) qp -= Q[i]; });
      dq += Math.abs(qp - (Q[L.indexOf(k)] || 0)); sq += Math.abs(qp);
      Q[L.indexOf(k)] = qp; qprv.set(k.id, qp);
    }
    // status checks
    statusChanged = false;
    L.forEach((k, i) => {
      if (k.src.status === 'closed' || (k.kind === 'pump' && k.status === 'closed' && (!k.pc || opts.pumpOn?.[k.id] === false))) return;
      const dh = H[k.a] - H[k.b];
      if (k.kind === 'pipe' && k.check) {
        if (k.status === 'open' && Q[i] < -1e-9 && dh < 0) { k.status = 'closed'; Q[i] = 0; statusChanged = true; }
        else if (k.status === 'closed' && dh > 1e-9) { k.status = 'open'; statusChanged = true; }
      } else if (k.kind === 'pump') {
        if (k.status === 'open' && Q[i] < -1e-9) { k.status = 'closed'; Q[i] = 0; statusChanged = true; }
        else if (k.status === 'closed' && k.pc && dh + k.pc.h0 > 1e-6) { k.status = 'open'; Q[i] = k.q0; statusChanged = true; }
      } else if (k.kind === 'prv') {
        if (k.status === 'active' && (Q[i] < -1e-9)) { k.status = 'closed'; Q[i] = 0; statusChanged = true; }
        else if (k.status === 'active' && H[k.a] < k.hs - 1e-6) { k.status = 'open'; Q[i] = k.q0; statusChanged = true; }
        else if (k.status === 'open' && H[k.b] > k.hs + 1e-6) { k.status = 'active'; qprv.set(k.id, Math.max(0, Q[i])); statusChanged = true; }
        else if (k.status === 'closed' && H[k.a] > k.hs + 1e-6 && H[k.b] < k.hs) { k.status = 'active'; qprv.set(k.id, 0); statusChanged = true; }
      }
    });
    if (!statusChanged && sq > 0 && dq / sq < 1e-7) { converged = true; break; }
    if (!statusChanged && sq === 0 && it > 1) { converged = true; break; }
  }
  if (!converged) problems.push({ code: 'noconverge', iterations: it });

  // results in project units
  const totals = { demand: 0, supplied: 0 };
  const outNodes = new Map(), outPipes = new Map();
  nodes.forEach((n, i) => {
    const connected = reach[i];
    const head = connected ? H[i] / K.len : null;
    const pressure = connected && n.kind === 'junction' ? (H[i] - z[i]) * K.p : null;
    const d = dem[i] / K.q;
    if (n.kind === 'junction') totals.demand += d;
    if (n.kind === 'junction' && !connected) problems.push({ code: 'isolated', id: n.id });
    outNodes.set(n.id, { head, pressure, demand: d, kind: n.kind, z: n.z });
    if (pressure != null && pressure < S.minP && dem[i] >= 0) problems.push({ code: 'lowp', id: n.id, value: pressure, limit: S.minP });
    if (pressure != null && pressure > S.maxP) problems.push({ code: 'highp', id: n.id, value: pressure, limit: S.maxP });
    if (pressure != null && pressure < 0) problems.push({ code: 'negp', id: n.id, value: pressure });
  });
  L.forEach((k, i) => {
    const q = Q[i] / K.q;
    let v = null, hl = (H[k.a] - H[k.b]) / K.len, hl1000 = null;
    if (k.kind !== 'pump') {
      v = Math.abs(Q[i]) / (Math.PI * k.D * k.D / 4) / K.len;
      hl1000 = k.kind === 'pipe' ? Math.abs(hl) / ((k.L / K.len) / 1000) : null;
      if (k.kind === 'pipe' && v > S.vMax) problems.push({ code: 'fast', id: k.id, value: v, limit: S.vMax });
    }
    outPipes.set(k.id, { q, v, hl, hl1000, status: k.status, kind: k.kind });
    if (k.kind === 'pump' && k.pc && k.status === 'open' && Q[i] > 2 * (k.src.curve?.[Math.min(1, k.src.curve.length - 1)]?.[0] || Infinity) * K.q) problems.push({ code: 'pumpfar', id: k.id });
  });
  for (const n of nodes) if (n.kind === 'reservoir' || n.kind === 'tank') {
    let inflow = 0; const i = idx.get(n.id);
    L.forEach((k, j) => { if (k.b === i) inflow += Q[j]; if (k.a === i) inflow -= Q[j]; });
    outNodes.get(n.id).inflow = inflow / K.q; if (inflow < 0) totals.supplied -= inflow / K.q;
  }
  return { ok: converged && !problems.some((p) => p.code === 'noconverge'), converged, iterations: it, nodes: outNodes, pipes: outPipes, problems, totals, units };
}

/** Preconditioned conjugate gradient (Jacobi) on the sparse SPD system; dense Cholesky when small. */
function solveSpd(M, diag, rows, rhs, x0) {
  if (M === 0) return [];
  if (M <= 250) {
    const A = Array.from({ length: M }, () => new Float64Array(M));
    for (let i = 0; i < M; i++) { A[i][i] = diag[i]; for (const [j, v] of rows[i]) A[i][j] += v; }
    for (let j = 0; j < M; j++) {   // Cholesky A = L Lᵀ, in place (lower)
      let s = A[j][j]; for (let k = 0; k < j; k++) s -= A[j][k] * A[j][k];
      const d = Math.sqrt(Math.max(s, 1e-30)); A[j][j] = d;
      for (let i = j + 1; i < M; i++) { let t = A[i][j]; for (let k = 0; k < j; k++) t -= A[i][k] * A[j][k]; A[i][j] = t / d; }
    }
    const y = new Float64Array(M), x = new Float64Array(M);
    for (let i = 0; i < M; i++) { let t = rhs[i]; for (let k = 0; k < i; k++) t -= A[i][k] * y[k]; y[i] = t / A[i][i]; }
    for (let i = M - 1; i >= 0; i--) { let t = y[i]; for (let k = i + 1; k < M; k++) t -= A[k][i] * x[k]; x[i] = t / A[i][i]; }
    return x;
  }
  const mul = (v, out) => { for (let i = 0; i < M; i++) { let s = diag[i] * v[i]; for (const [j, a] of rows[i]) s += a * v[j]; out[i] = s; } };
  const x = Float64Array.from(x0), r = new Float64Array(M), z = new Float64Array(M), p = new Float64Array(M), Ap = new Float64Array(M);
  mul(x, Ap); for (let i = 0; i < M; i++) r[i] = rhs[i] - Ap[i];
  for (let i = 0; i < M; i++) { z[i] = r[i] / diag[i]; p[i] = z[i]; }
  let rz = 0; for (let i = 0; i < M; i++) rz += r[i] * z[i];
  let bn = 0; for (let i = 0; i < M; i++) bn += rhs[i] * rhs[i]; bn = Math.sqrt(bn) || 1;
  for (let k = 0; k < Math.max(2000, M * 4); k++) {
    let rn = 0; for (let i = 0; i < M; i++) rn += r[i] * r[i];
    if (Math.sqrt(rn) < 1e-13 * bn) break;
    mul(p, Ap); let pAp = 0; for (let i = 0; i < M; i++) pAp += p[i] * Ap[i];
    if (!(pAp > 0)) break;
    const al = rz / pAp;
    for (let i = 0; i < M; i++) { x[i] += al * p[i]; r[i] -= al * Ap[i]; z[i] = r[i] / diag[i]; }
    let rz2 = 0; for (let i = 0; i < M; i++) rz2 += r[i] * z[i];
    const be = rz2 / rz; rz = rz2;
    for (let i = 0; i < M; i++) p[i] = z[i] + be * p[i];
  }
  return x;
}

/** Fire flow at one node: the pressures with `flow` drawn there (every other demand as it is), and the flow that brings the
 *  lowest pressure anywhere to `residual` (bisection on the draw). */
export function fireFlow(water, units, nodeId, { flow, residual, mult = 1 } = {}) {
  const W = cleanWater(water, units), d = defaults(units);
  const target = residual ?? (units === 'm' ? 140 : 20);
  const lowest = (f) => {
    const r = solve(W, units, { mult, extra: { [nodeId]: f } });
    let m = Infinity, at = null;
    for (const [id, n] of r.nodes) if (n.pressure != null && n.pressure < m) { m = n.pressure; at = id; }
    return { r, min: m, at };
  };
  const node = W.nodes.find((n) => n.id === nodeId);
  if (!node || node.kind !== 'junction') return { error: 'node' };
  const atFlow = flow != null ? lowest(flow) : null;
  let lo = 0, hi = units === 'm' ? 200 : 3000, hiR = lowest(hi);
  let grow = 0; while (hiR.min >= target && grow++ < 6) { lo = hi; hi *= 2; hiR = lowest(hi); }
  const base = lowest(0);
  let available = null;
  if (base.min >= target) { for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (lowest(mid).min >= target) lo = mid; else hi = mid; } available = lo; }
  return { atFlow: atFlow && { flow, minPressure: atFlow.min, at: atFlow.at, nodePressure: atFlow.r.nodes.get(nodeId).pressure, problems: atFlow.r.problems }, available, residual: target, base: base.min, d };
}

/** Extended period: tank levels and demand pattern over time; hourly (or `step`) hydraulic states. Tanks clamp at their limits and
 *  the step is reported (no mass is invented: the clamp is a flagged event, a real tank would close its inlet). */
export function extended(water, units, { hours, step } = {}) {
  const W = cleanWater(water, units), K = si(units), S = W.settings;
  const dt = step || S.step, T = Math.round((hours ?? S.duration) * 3600 / dt);
  const levels = {}; for (const n of W.nodes) if (n.kind === 'tank') levels[n.id] = n.level;
  const steps = [], problems = [];
  for (let s = 0; s <= T; s++) {
    const mult = S.pattern.length ? S.pattern[s % S.pattern.length] : 1;
    const pumpOn = {}; for (const p of W.pipes) if (p.kind === 'pump' && p.pattern?.length) pumpOn[p.id] = p.pattern[s % p.pattern.length] > 0;
    const r = solve(W, units, { mult, levels, pumpOn });
    const tanks = {};
    for (const n of W.nodes) if (n.kind === 'tank') tanks[n.id] = { level: levels[n.id], inflow: r.nodes.get(n.id).inflow };
    steps.push({ t: s * dt, mult, nodes: r.nodes, pipes: r.pipes, tanks, ok: r.ok, problems: r.problems });
    if (s === T) break;
    for (const n of W.nodes) if (n.kind === 'tank') {
      const inflow = (r.nodes.get(n.id).inflow || 0) * K.q;                              // m³/s into the tank
      const areaSI = Math.PI * Math.pow(n.diameter * K.len, 2) / 4;
      let lv = levels[n.id] + inflow * dt / areaSI / K.len;
      if (lv > n.maxLevel) { problems.push({ code: 'tankfull', id: n.id, t: (s + 1) * dt }); lv = n.maxLevel; }
      if (lv < n.minLevel) { problems.push({ code: 'tankempty', id: n.id, t: (s + 1) * dt }); lv = n.minLevel; }
      levels[n.id] = lv;
    }
  }
  return { steps, problems, dt };
}

// ---------------------------------------------------------------------------------------------------------------------------
// EPANET-format input text (the format is publicly documented; written and read here from that description, no program code).
// US: GPM + ft + in + psi; SI: LPS + m + mm + kPa.

export function writeInp(water, units) {
  const W = cleanWater(water, units), M = units === 'm', f = (v, d = 4) => (v == null ? '' : String(Math.round(v * 10 ** d) / 10 ** d));
  const L = ['[TITLE]', 'CadCraft water mains', '', '[JUNCTIONS]', ';ID  Elevation  Demand'];
  for (const n of W.nodes) if (n.kind === 'junction') L.push(`${n.id}\t${f(n.z ?? 0)}\t${f(n.demand)}`);
  L.push('', '[RESERVOIRS]', ';ID  Head');
  for (const n of W.nodes) if (n.kind === 'reservoir') L.push(`${n.id}\t${f(n.head ?? n.z ?? 0)}`);
  L.push('', '[TANKS]', ';ID  Elevation  InitLevel  MinLevel  MaxLevel  Diameter  MinVol');
  for (const n of W.nodes) if (n.kind === 'tank') L.push(`${n.id}\t${f(n.z ?? 0)}\t${f(n.level)}\t${f(n.minLevel)}\t${f(n.maxLevel)}\t${f(n.diameter)}\t0`);
  L.push('', '[PIPES]', ';ID  Node1  Node2  Length  Diameter  Roughness  MinorLoss  Status');
  const pipeLen = (p) => p.length ?? Math.hypot(W.nodes.find((n) => n.id === p.a).x - W.nodes.find((n) => n.id === p.b).x, W.nodes.find((n) => n.id === p.a).y - W.nodes.find((n) => n.id === p.b).y);
  for (const p of W.pipes) if (p.kind === 'pipe') L.push(`${p.id}\t${p.a}\t${p.b}\t${f(pipeLen(p))}\t${f(p.d)}\t${f(p.c ?? W.settings.c)}\t${f(p.minor)}\t${p.status === 'closed' ? 'Closed' : p.check ? 'CV' : 'Open'}`);
  L.push('', '[PUMPS]', ';ID  Node1  Node2  Parameters');
  const curves = [];
  for (const p of W.pipes) if (p.kind === 'pump') { curves.push(p); L.push(`${p.id}\t${p.a}\t${p.b}\tHEAD C_${p.id}`); }
  L.push('', '[VALVES]', ';ID  Node1  Node2  Diameter  Type  Setting  MinorLoss');
  for (const p of W.pipes) if (p.kind === 'prv') L.push(`${p.id}\t${p.a}\t${p.b}\t${f(p.d)}\tPRV\t${f(p.setting)}\t${f(p.minor)}`);
  L.push('', '[CURVES]', ';ID  Flow  Head');
  for (const p of curves) for (const [q, h] of p.curve) L.push(`C_${p.id}\t${f(q)}\t${f(h)}`);
  if (W.settings.pattern.length) { L.push('', '[PATTERNS]'); for (let i = 0; i < W.settings.pattern.length; i += 6) L.push('1\t' + W.settings.pattern.slice(i, i + 6).map((v) => f(v)).join('\t')); }
  L.push('', '[TIMES]', `Duration\t${W.settings.duration}:00`, `Hydraulic Timestep\t${Math.round(W.settings.step / 3600 * 100) / 100 >= 1 ? Math.round(W.settings.step / 3600) + ':00' : '0:' + String(Math.round(W.settings.step / 60)).padStart(2, '0')}`);
  L.push('', '[OPTIONS]', `Units\t${M ? 'LPS' : 'GPM'}`, 'Headloss\tH-W', M ? 'Pattern\t1' : 'Pattern\t1', '', '[COORDINATES]', ';Node  X  Y');
  for (const n of W.nodes) L.push(`${n.id}\t${f(n.x)}\t${f(n.y)}`);
  L.push('', '[END]', '');
  return L.join('\n');
}

/** Read EPANET-format text (untrusted). Units come from [OPTIONS] Units (GPM → US; LPS and the SI flow units → SI; others are named and refused). */
export function readInp(text, units) {
  const notes = [];
  const src = String(text || '');
  if (src.length > 8 * 1024 * 1024) return { water: null, notes: ['too-big'] };
  const sec = {}; let cur = null;
  for (const raw of src.split(/\r?\n/)) {
    const line = raw.replace(/;.*$/, '').trim();
    if (!line) continue;
    const m = line.match(/^\[(\w+)\]/);
    if (m) { cur = m[1].toUpperCase(); sec[cur] = sec[cur] || []; continue; }
    if (cur) sec[cur].push(line.split(/\s+/));
  }
  let fileUnits = 'GPM';
  for (const r of sec.OPTIONS || []) if (/^units$/i.test(r[0])) fileUnits = String(r[1] || '').toUpperCase();
  for (const r of sec.OPTIONS || []) if (/^headloss$/i.test(r[0]) && !/^H-W$/i.test(r[1] || '')) notes.push('headloss:' + r[1]);
  const isSi = fileUnits === 'LPS';
  if (!isSi && fileUnits !== 'GPM') { notes.push('units:' + fileUnits); return { water: null, notes }; }
  const u = isSi ? 'm' : 'ft';
  const W = emptyWater(u);
  const xy = new Map(); for (const r of sec.COORDINATES || []) xy.set(r[0], [num(r[1], 0), num(r[2], 0)]);
  const place = (id) => xy.get(id) || [0, 0];
  for (const r of sec.JUNCTIONS || []) W.nodes.push({ id: r[0], name: '', x: place(r[0])[0], y: place(r[0])[1], z: num(r[1], 0), demand: num(r[2], 0), kind: 'junction' });
  for (const r of sec.RESERVOIRS || []) W.nodes.push({ id: r[0], name: '', x: place(r[0])[0], y: place(r[0])[1], z: num(r[1], 0), demand: 0, kind: 'reservoir', head: num(r[1], 0) });
  for (const r of sec.TANKS || []) W.nodes.push({ id: r[0], name: '', x: place(r[0])[0], y: place(r[0])[1], z: num(r[1], 0), demand: 0, kind: 'tank', level: num(r[2], 0), minLevel: num(r[3], 0), maxLevel: num(r[4], 1), diameter: num(r[5], 10) });
  for (const r of sec.PIPES || []) { const st = String(r[7] || 'Open').toUpperCase(); W.pipes.push({ id: r[0], name: '', a: r[1], b: r[2], kind: 'pipe', length: num(r[3]), d: num(r[4]), c: num(r[5]), minor: num(r[6], 0), status: st === 'CLOSED' ? 'closed' : 'open', check: st === 'CV' }); }
  const curves = new Map(); for (const r of sec.CURVES || []) { const c = curves.get(r[0]) || []; c.push([num(r[1], 0), num(r[2], 0)]); curves.set(r[0], c); }
  for (const r of sec.PUMPS || []) {
    const i = r.findIndex((x) => /^head$/i.test(x));
    if (i < 0) { notes.push('pump-power:' + r[0]); continue; }
    W.pipes.push({ id: r[0], name: '', a: r[1], b: r[2], kind: 'pump', curve: curves.get(r[i + 1]) || [], status: 'open', pattern: [] });
  }
  for (const r of sec.VALVES || []) {
    if (String(r[4]).toUpperCase() !== 'PRV') { notes.push('valve:' + r[4]); continue; }
    W.pipes.push({ id: r[0], name: '', a: r[1], b: r[2], kind: 'prv', d: num(r[3]), setting: num(r[5], 0), minor: num(r[6], 0), status: 'open' });
  }
  const pat = []; for (const r of sec.PATTERNS || []) pat.push(...r.slice(1).map((v) => num(v, 1)));
  if (pat.length) W.settings.pattern = pat;
  for (const r of sec.TIMES || []) {
    const k = r[0].toLowerCase();
    const hh = (s) => { const m = String(s || '').match(/^(\d+):?(\d+)?/); return m ? Number(m[1]) + Number(m[2] || 0) / 60 : null; };
    if (k === 'duration') W.settings.duration = hh(r[1]) || W.settings.duration;
    if (k === 'hydraulic' && /timestep/i.test(r[1] || '')) { const h = hh(r[2]); if (h) W.settings.step = Math.round(h * 3600); }
  }
  return { water: cleanWater(W, u), notes, units: u };
}
