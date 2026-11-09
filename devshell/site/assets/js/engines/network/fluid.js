/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fluid.js — steady-state pipe, duct, water and gas networks (0.8 XE.2; DOM-free). One solver for every pipe-like family: unknown nodal
 * potentials H, link flows Q, link law  loss(Q) = H_from − H_to  (odd in Q), continuity at every free node.
 *
 * Method: the global gradient algorithm of Todini & Pilati (1988) — Newton on the whole system, eliminated to a nodal matrix
 * (A21 D⁻¹ A12) dH = −A21 D⁻¹ F1 − (q − A21 Q); the same method EPANET's hydraulic solver describes. Hardy Cross (1936) is kept as an
 * independent second algorithm for loops given by hand (`hardyCross`), which the tests use as a cross-check.
 *
 *   water  potential = head (m), Q = m³/s:  Hazen–Williams (SI form h = 10.67 L Q^1.852 / (C^1.852 D^4.871)),
 *          Darcy–Weisbach with f from laminar 64/Re or Swamee–Jain (1976), minor losses K v²/2g, pumps  H = ω²·h0 − a Q²  with a check valve,
 *          closed links, generic power law  h = r Q|Q|^(n−1).  Also ducts and district heating (incompressible: give the fluid's rho and mu).
 *   gas    potential = p² (Pa²), Q = mass flow (kg/s), isothermal long-pipe law  p1² − p2² = f L R T Z ṁ² / (D A²)  (kinetic term neglected:
 *          good for long pipes at modest Mach number; the result says so).
 *
 * Network:  { kind: 'water' | 'gas', nodes: [{ id, head? | pressure? (fixed), demand? (outflow, + = consumption), z? }],
 *             links: [{ id, from, to, type: 'pipe'|'minor'|'pump'|'resistance'|'gaspipe', status?: 'closed', ...params }] }
 * Every failure is a plain problem in the shared Problems shape (rule 29). The nodal matrix is dense: thousands of nodes belong on the
 * workstation benchmark, not in a browser tab.
 */
import { solveLinear, problem } from './numeric.js';

export const G = 9.80665;
const MIN_SLOPE = 1e-9;
const FLUIDS = { water: { rho: 998.2, mu: 1.002e-3 }, air: { rho: 1.204, mu: 1.825e-5 }, methane: { rho: 0.668, mu: 1.1e-5, R: 518.3 } };
export { FLUIDS };

/** Darcy friction factor: laminar 64/Re below 2000, Swamee–Jain above 4000, linear blend between. relRough = ε/D. */
export function friction(Re, relRough = 0) {
  Re = Math.max(Re, 1e-6);
  const lam = 64 / Re;
  const turb = () => 0.25 / Math.log10(relRough / 3.7 + 5.74 / Math.pow(Re, 0.9)) ** 2;
  if (Re < 2000) return lam;
  if (Re > 4000) return turb();
  const w = (Re - 2000) / 2000; return lam * (1 - w) + turb() * w;
}
/** Colebrook–White by fixed-point iteration (the implicit equation Swamee–Jain approximates). */
export function colebrook(Re, relRough = 0) {
  let f = friction(Re, relRough);
  for (let i = 0; i < 60; i++) { const n = Math.pow(-2 * Math.log10(relRough / 3.7 + 2.51 / (Re * Math.sqrt(f))), -2); if (Math.abs(n - f) < 1e-14) return n; f = n; }
  return f;
}

const area = (D) => Math.PI * D * D / 4;
const slopeOf = (fn, Q) => { const e = Math.max(1e-6 * Math.abs(Q), 1e-12); return (fn(Q + e) - fn(Q - e)) / (2 * e); };

/** The law of one link: returns { loss(Q), slope(Q) } or null for a closed link. Throws on missing parameters. */
export function linkLaw(l, kind = 'water') {
  if (l.status === 'closed') return null;
  const need = (k) => { if (!(l[k] > 0)) throw new Error(`link ${l.id}: ${k} must be > 0`); return l[k]; };
  switch (l.type) {
    case 'pipe': {
      const D = need('D'), L = need('L');
      if (l.law === 'dw' || l.eps != null || l.fluid) {
        const fl = { ...FLUIDS.water, ...(typeof l.fluid === 'string' ? FLUIDS[l.fluid] : l.fluid) }, A = area(D), rr = (l.eps || 0) / D, K = l.K || 0;
        const loss = (Q) => { const Re = 4 * fl.rho * Math.abs(Q) / (Math.PI * D * fl.mu); const f = friction(Re, rr); return (f * L / D + K) / (2 * G * A * A) * Q * Math.abs(Q); };
        return { loss, slope: (Q) => Math.max(slopeOf(loss, Q), MIN_SLOPE) };
      }
      const C = need('C'), k = 10.67 * L / (Math.pow(C, 1.852) * Math.pow(D, 4.871));
      return { loss: (Q) => k * Math.pow(Math.abs(Q), 0.852) * Q, slope: (Q) => Math.max(1.852 * k * Math.pow(Math.abs(Q) + 1e-9, 0.852), MIN_SLOPE) };
    }
    case 'minor': { const k = need('K') / (2 * G * area(need('D')) ** 2); return { loss: (Q) => k * Q * Math.abs(Q), slope: (Q) => Math.max(2 * k * Math.abs(Q), MIN_SLOPE) }; }
    case 'resistance': { const r = need('r'), n = l.n || 2; return { loss: (Q) => r * Math.pow(Math.abs(Q), n - 1) * Q, slope: (Q) => Math.max(n * r * Math.pow(Math.abs(Q) + 1e-9, n - 1), MIN_SLOPE) }; }
    case 'pump': {
      const w = l.speed ?? 1; let { h0, a } = l;
      if (l.curve) { h0 = l.curve[0]; a = (l.curve[0] - l.curve[2]) / (l.curve[1] ** 2); }   // curve = [H at zero flow, design Q, H at design Q]
      if (!(h0 > 0) || !(a > 0)) throw new Error(`link ${l.id}: a pump needs h0 > 0 and a > 0 (or curve [H0, Qdesign, Hdesign])`);
      const Rcv = 1e6;   // check valve: continuous at Q = 0, very steep for backflow
      return { loss: (Q) => (Q >= 0 ? -w * w * h0 + a * Q * Q : -w * w * h0 + Rcv * Q), slope: (Q) => (Q >= 0 ? Math.max(2 * a * Q, MIN_SLOPE) : Rcv) };
    }
    case 'gaspipe': {
      const D = need('D'), L = need('L'), A = area(D), fl = { ...FLUIDS.methane, ...(typeof l.fluid === 'string' ? FLUIDS[l.fluid] : l.fluid) };
      const T = l.T || 288.15, Z = l.Z || 1, R = fl.R || 518.3, rr = (l.eps || 0) / D;
      const loss = (m) => { const Re = 4 * Math.abs(m) / (Math.PI * D * fl.mu); return friction(Re, rr) * L * R * T * Z / (D * A * A) * m * Math.abs(m); };
      return { loss, slope: (m) => Math.max(slopeOf(loss, m), MIN_SLOPE) };
    }
    default: throw new Error(`link ${l.id}: unknown type ${l.type}`);
  }
}

/**
 * Solve a steady network. → { ok, iterations, nodes: { id: { H, p, head, demand } }, links: { id: { Q, loss, v?, status } }, residual, problems, notes }
 * opts: tol (relative flow change, 1e-8), maxIter (100), init (map link id → starting Q)
 */
export function solveNetwork(net, opts = {}) {
  const kind = net.kind || 'water', problems = [], notes = [];
  const nodes = net.nodes, byId = new Map(nodes.map((n, i) => [n.id, i]));
  const fixedOf = (n) => (kind === 'gas' ? (n.pressure != null ? n.pressure * n.pressure : null) : (n.head != null ? n.head : null));
  const free = [], freeIdx = new Map();
  nodes.forEach((n, i) => { if (fixedOf(n) == null) { freeIdx.set(i, free.length); free.push(i); } });
  const links = [];
  for (const l of net.links) {
    const a = byId.get(l.from), b = byId.get(l.to);
    if (a == null || b == null) { problems.push(problem('link.node', 'error', `Link ${l.id} joins a node that does not exist.`, [{ kind: 'link', id: l.id }])); continue; }
    let law; try { law = linkLaw(l, kind); } catch (e) { problems.push(problem('link.params', 'error', e.message, [{ kind: 'link', id: l.id }])); continue; }
    if (law) links.push({ l, a, b, law });
  }
  if (problems.some((p) => p.severity === 'error')) return { ok: false, problems, nodes: {}, links: {}, iterations: 0, residual: NaN, notes };
  const fixedCount = nodes.length - free.length;
  if (!fixedCount) { problems.push(problem('network.nofixed', 'error', 'The network has no reservoir or fixed-pressure node, so the flows have no reference.', [{ kind: 'network', id: 'all' }])); return { ok: false, problems, nodes: {}, links: {}, iterations: 0, residual: NaN, notes }; }
  const top = Math.max(...nodes.map((m) => fixedOf(m) ?? -Infinity));
  const H = nodes.map((n) => { const f = fixedOf(n); return f != null ? f : top; });
  const demand = nodes.map((n) => n.demand || 0);
  const Q = links.map((k) => (opts.init && opts.init[k.l.id] != null ? opts.init[k.l.id] : (k.l.D ? area(k.l.D) : 0.01)));
  const nu = free.length; let iterations = 0, converged = nu === 0, resid = 0;
  // disconnected free nodes make the nodal matrix singular
  for (let it = 0; it < (opts.maxIter || 100) && !converged; it++) {
    iterations = it + 1;
    const N = Array.from({ length: nu }, () => new Array(nu).fill(0)), rhs = new Array(nu).fill(0);
    // F1_i = loss_i(Q_i) − (H_a − H_b);  Dinv_i = 1/slope_i;  A21 rows: −1 at a (outflow), +1 at b (inflow)
    links.forEach((k, i) => {
      const h = k.law.loss(Q[i]), d = k.law.slope(Q[i]), inv = 1 / d, F1 = h - (H[k.a] - H[k.b]);
      const ia = freeIdx.get(k.a), ib = freeIdx.get(k.b);
      // N = A21 Dinv A12 with A12[i,a] = −1, A12[i,b] = +1
      if (ia != null) { N[ia][ia] += inv; rhs[ia] += inv * F1; }          // −A21 Dinv F1 : A21[a,i] = −1 → +inv·F1 … sign handled below
      if (ib != null) { N[ib][ib] += inv; rhs[ib] -= inv * F1; }
      if (ia != null && ib != null) { N[ia][ib] -= inv; N[ib][ia] -= inv; }
    });
    // continuity residual of the current Q: (q − A21 Q) with q = demand, A21 Q = inflow − outflow
    const net_in = new Array(nodes.length).fill(0);
    links.forEach((k, i) => { net_in[k.b] += Q[i]; net_in[k.a] -= Q[i]; });
    // (A21 Dinv A12) dH = −A21 Dinv F1 − (q − A21 Q);   with q = −demand? demand is outflow: inflow − outflow = demand (consumed at the node)
    const cont = free.map((ni) => net_in[ni] - demand[ni]);       // A21 Q − q
    const b = free.map((_, r) => rhs[r] + cont[r]);
    const dH = nu ? solveLinear(N, b) : [];
    if (!dH) { problems.push(problem('network.singular', 'error', 'The nodal equations are singular: part of the network is not connected to a reservoir, or a link is closed so that some nodes are cut off.', [{ kind: 'network', id: 'all' }])); return { ok: false, problems, nodes: {}, links: {}, iterations, residual: NaN, notes }; }
    free.forEach((ni, r) => { H[ni] += dH[r]; });
    let dq = 0, sq = 0;
    links.forEach((k, i) => {
      const h = k.law.loss(Q[i]), d = k.law.slope(Q[i]), F1 = h - (H[k.a] - H[k.b]);   // after the head update: dQ = −Dinv (F1 + A12 dH) is the same as −Dinv·(loss_i − ΔH_new)
      const dQ = -F1 / d; Q[i] += dQ; dq += Math.abs(dQ); sq += Math.abs(Q[i]);
    });
    const ni2 = new Array(nodes.length).fill(0); links.forEach((k, i) => { ni2[k.b] += Q[i]; ni2[k.a] -= Q[i]; });
    resid = Math.max(0, ...free.map((ni) => Math.abs(ni2[ni] - demand[ni])));
    if (!Number.isFinite(sq)) { problems.push(problem('network.diverged', 'error', 'The iteration diverged (flows are not finite). Check pump curves and closed links.', [{ kind: 'network', id: 'all' }])); return { ok: false, problems, nodes: {}, links: {}, iterations, residual: NaN, notes }; }
    if (dq / Math.max(sq, 1e-30) < (opts.tol || 1e-8) && resid < 1e-6 * Math.max(1, sq)) converged = true;
  }
  if (!converged) problems.push(problem('network.noconverge', 'error', `No steady solution after ${iterations} iterations (largest continuity error ${resid.toExponential(2)}).`, [{ kind: 'network', id: 'all' }]));
  const outNodes = {}, outLinks = {};
  nodes.forEach((n, i) => {
    if (kind === 'gas') { const p2 = H[i]; if (p2 < 0) problems.push(problem('gas.collapse', 'error', `Node ${n.id}: the pressure would be negative; the pipes cannot deliver this demand.`, [{ kind: 'node', id: n.id }])); outNodes[n.id] = { H: p2, p: Math.sqrt(Math.max(p2, 0)), demand: demand[i] }; }
    else outNodes[n.id] = { H: H[i], head: H[i], p: (H[i] - (n.z || 0)) * 998.2 * G, pressureHead: H[i] - (n.z || 0), demand: demand[i] };
  });
  links.forEach((k, i) => {
    const r = { Q: Q[i], loss: H[k.a] - H[k.b], status: 'open' };
    if (k.l.D && kind === 'water') r.v = Q[i] / area(k.l.D);
    if (k.l.type === 'pump' && Q[i] < -1e-9) problems.push(problem('pump.reverse', 'warning', `Pump ${k.l.id} would run backwards; its check valve closes it.`, [{ kind: 'link', id: k.l.id }]));
    outLinks[k.l.id] = r;
  });
  for (const l of net.links) if (l.status === 'closed') outLinks[l.id] = { Q: 0, loss: H[byId.get(l.from)] - H[byId.get(l.to)], status: 'closed' };
  if (kind === 'gas') notes.push('Gas: isothermal long-pipe law, kinetic term neglected.');
  return { ok: converged, iterations, nodes: outNodes, links: outLinks, residual: resid, problems, notes };
}

/** Limits check on a solved network: velocity, minimum and maximum pressure head. → problems with req/found (Problems shape) */
export function checkNetwork(net, res, lim = {}) {
  const out = [];
  for (const l of net.links) { const r = res.links[l.id]; if (!r || r.v == null) continue; if (lim.vMax && Math.abs(r.v) > lim.vMax) out.push(problem('velocity.max', 'warning', `Link ${l.id}: velocity ${Math.abs(r.v).toFixed(2)} m/s is over ${lim.vMax} m/s.`, [{ kind: 'link', id: l.id }], { req: { op: '<=', value: lim.vMax, unit: 'm/s' }, found: { value: Math.abs(r.v), unit: 'm/s' } })); }
  for (const n of net.nodes) {
    const r = res.nodes[n.id]; if (!r) continue;
    if (net.kind === 'gas') { if (lim.pMin && r.p < lim.pMin) out.push(problem('pressure.min', 'warning', `Node ${n.id}: pressure ${(r.p / 1e5).toFixed(2)} bar is under ${(lim.pMin / 1e5).toFixed(2)} bar.`, [{ kind: 'node', id: n.id }], { req: { op: '>=', value: lim.pMin, unit: 'Pa' }, found: { value: r.p, unit: 'Pa' } })); continue; }
    if (lim.hMin != null && r.pressureHead < lim.hMin) out.push(problem('pressure.min', 'warning', `Node ${n.id}: pressure head ${r.pressureHead.toFixed(1)} m is under ${lim.hMin} m.`, [{ kind: 'node', id: n.id }], { req: { op: '>=', value: lim.hMin, unit: 'm' }, found: { value: r.pressureHead, unit: 'm' } }));
    if (lim.hMax != null && r.pressureHead > lim.hMax) out.push(problem('pressure.max', 'warning', `Node ${n.id}: pressure head ${r.pressureHead.toFixed(1)} m is over ${lim.hMax} m.`, [{ kind: 'node', id: n.id }], { req: { op: '<=', value: lim.hMax, unit: 'm' }, found: { value: r.pressureHead, unit: 'm' } }));
  }
  return out;
}

/**
 * Hardy Cross loop corrections (1936) for links with a power law, from continuity-consistent starting flows.
 * loops: [[{ link, dir: +1 | −1 }, …], …] (dir = +1 when the link's positive flow runs along the loop's direction). → { Q: { id: Q }, iterations, ok }
 */
export function hardyCross(net, loops, Q0, { tol = 1e-10, maxIter = 500 } = {}) {
  const law = new Map(net.links.map((l) => [l.id, linkLaw(l, net.kind)])), Q = { ...Q0 };
  for (let it = 1; it <= maxIter; it++) {
    let worst = 0;
    for (const loop of loops) {
      let num = 0, den = 0;
      for (const { link, dir } of loop) { const lw = law.get(link), q = Q[link]; num += dir * lw.loss(q); den += lw.slope(q); }
      const dq = -num / den; worst = Math.max(worst, Math.abs(dq));
      for (const { link, dir } of loop) Q[link] += dir * dq;
    }
    if (worst < tol) return { Q, iterations: it, ok: true };
  }
  return { Q, iterations: maxIter, ok: false };
}
