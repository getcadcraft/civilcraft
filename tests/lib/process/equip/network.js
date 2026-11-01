/* SPDX-License-Identifier: Apache-2.0 */
/**
 * network.js — process piping networks, pumps, compressors, control valves and water hammer (0.8 Track CH, CH.10; DOM-free, deterministic).
 * Our own code from published maths: Darcy–Weisbach with the friction factor of ../hydraulics.js, the global gradient method (Todini & Pilati 1988,
 * the same published family as civilcraft's water-mains solver; this one is SI, Darcy–Weisbach, and also handles gas), the Joukowsky relation
 * and the method of characteristics (Streeter & Wylie; Chaudhry). A calculation aid, "to be checked by an engineer": not an engineering approval.
 *
 *   net = { fluid: { kind: 'liquid', rho, mu } | { kind: 'gas', M (kg/mol), T (K), Z?, mu? },
 *           nodes: [{ id, z (m), P? (Pa abs: a fixed-pressure node), demand? (m3/s liquid, kg/s gas; + leaves the network) }],
 *           links: [{ id, a, b, kind: 'pipe'|'pump'|'valve'|'check'|'cvalve', D, L, eps?, K?, fittings?, curve?: [[Q, H], …] (pump), Kv?, R?, opening? (cvalve) }] }
 *   solveNetwork(net, opts) → { ok, iterations, nodes: { id: { P, head, demand } }, links: { id: { Q, mdot, v, dP, … } }, problems }
 *   Link flow is positive from `a` to `b`. Liquid heads are P/(rho g) + z. Gas networks solve in P² with the isothermal compressible-flow relation.
 *
 *   A link may carry `fit: [{ method?: '2K'|'3K', id, count? }]` (0.8 CH.10) with `net.fittingPack` (a cadcraft-fitting-k-pack object): its K is worked out at every iteration with that link's own Re and diameter and ADDED to the typed `K`
 *   (and to `fittings`, the older constant table). Without a pack the list is ignored with a warning and the typed K stands. The result of a link carries K (total), Kfit and Re.
 *   fitPumpCurve(points) · pumpHead(curve, Q) · npsha({ P, Pv, rho, z?, hLoss? }) · polytropicHead({ M, T, Z, n, P1, P2 }) · compressorPoint(map, Q, H) (surge margin)
 *   greitzerB({ U, as, Vp, Ac, Lc }) · waveSpeed({ K, rho, D, e, E, nu?, anchored? }) · joukowsky(a, dV, rho) · hammer(spec) (method of characteristics) · cvalveKv(link, opening)
 */
import { friction, K_FITTINGS, EPS_COMMERCIAL_STEEL, MU_ASSUMED } from '../hydraulics.js';
import { solveLinear } from '../numeric.js';
import { R } from '../data.js';
import { kOfList, isPack, cleanFittingPack } from './fittingk.js';

export const G = 9.80665;
const SRC = { kind: 'engine', name: 'process' };
const prob = (code, severity, text, id) => ({ id: 'process:' + code + ':' + id, code, severity, text, about: [{ id }], source: SRC });

/** Quadratic pump curve H = c0 + c1 Q + c2 Q² through 3 points, or H = H0 − k Q² through 2 points (the first is taken as the shut-off point if Q = 0). */
export function fitPumpCurve(pts) {
  if (!Array.isArray(pts) || pts.length < 2) throw new Error('a pump curve needs at least two (Q, H) points');
  const p = pts.slice().sort((x, y) => x[0] - y[0]);
  if (p.length === 2) { const [[q1, h1], [q2, h2]] = p; const k = (h1 - h2) / (q2 * q2 - q1 * q1); return [h1 + k * q1 * q1, 0, -k]; }
  const [[q1, h1], [q2, h2], [q3, h3]] = p;
  const s = solveLinear([[1, q1, q1 * q1], [1, q2, q2 * q2], [1, q3, q3 * q3]], [h1, h2, h3]);
  if (!s) throw new Error('pump curve points are not distinct'); return s;
}
export const pumpHead = (c, Q) => c[0] + c[1] * Q + c[2] * Q * Q;

/** Net positive suction head available (m): (P − Pv)/(rho g) + z − hLoss. P, Pv absolute (Pa), z the liquid level above the pump centreline, hLoss the suction line loss (m). */
export const npsha = ({ P, Pv, rho, z = 0, hLoss = 0 }) => (P - Pv) / (rho * G) + z - hLoss;

/** Polytropic head (m of gas column, J/kg / g given as J/kg too): Hp = n/(n−1) Z R T1 / M [ (P2/P1)^((n−1)/n) − 1 ]. Returns { head (J/kg), power (W per kg/s) }. */
export function polytropicHead({ M, T, Z = 1, n, P1, P2, eta = 1 }) {
  const e = (n - 1) / n, head = (n / (n - 1)) * Z * R * T / M * (Math.pow(P2 / P1, e) - 1); return { head, power: head / eta };
}
/** Surge check against a surge line map = [[Q, H], …] ascending in Q (the left edge of the compressor map): margin = (Q − Qsurge(H)) / Qsurge(H). */
export function compressorPoint(surgeLine, Q, H) {
  const s = surgeLine.slice().sort((a, b) => a[1] - b[1]); let q = null;
  for (let i = 1; i < s.length; i++) if (H >= s[i - 1][1] && H <= s[i][1]) { const w = (H - s[i - 1][1]) / (s[i][1] - s[i - 1][1]); q = s[i - 1][0] + w * (s[i][0] - s[i - 1][0]); }
  if (q == null) return { qSurge: null, margin: null, surge: false, notes: ['the head is outside the surge line'] };
  const margin = (Q - q) / q; return { qSurge: q, margin, surge: margin <= 0, notes: margin < 0.1 ? ['less than 10 % flow margin to surge (a common design margin; the project sets its own)'] : [] };
}
/** Greitzer's B parameter (1976): B = U/(2 as) sqrt(Vp/(Ac Lc)). B above about 0.7–0.8 tends to surge, below to rotating stall (published rule of thumb). */
export const greitzerB = ({ U, as, Vp, Ac, Lc }) => U / (2 * as) * Math.sqrt(Vp / (Ac * Lc));

/** Control valve: Kv in m3/h of water at 1 bar drop. Equal-percentage Kv(x) = Kvs R^(x−1), linear Kv(x) = Kvs x, quick opening Kvs sqrt(x). */
export function cvalveKv(l, x = l.opening ?? 1) {
  const Kvs = l.Kv, c = l.charact || 'equal'; x = Math.min(1, Math.max(0, x));
  if (x <= 0) return 0; return c === 'linear' ? Kvs * x : c === 'quick' ? Kvs * Math.sqrt(x) : Kvs * Math.pow(l.R || 50, x - 1);
}

/** The fitting K of a link at its own Re (0 without a list or a pack). */
function fitK(net, l, Re) { return l.fit && l.fit.length && net._fit ? kOfList(net._fit, l.fit, Math.max(Re, 1e-9), l.D * 1000 / 25.4) : 0; }

/** Link head-loss function: returns { h (loss a→b in the network's head unit), p (dh/dQ, > 0) } for flow Q (m3/s liquid, kg/s gas). */
function linkLoss(net, st, l, Q) {
  const f = net.fluid, liquid = f.kind !== 'gas';
  const A = Math.PI * l.D * l.D / 4, floor = 1e-9;
  if (l.kind === 'pump') {
    const c = l.coef; const Qa = Math.abs(Q);
    if (Q < 0) { const r = 1e3; return { h: r * Q * Math.abs(Q) - c[0], p: Math.max(2 * r * Qa, floor) }; }   // no reverse flow through a pump: a large resistance
    return { h: -pumpHead(c, Q), p: Math.max(-(c[1] + 2 * c[2] * Q), 1e-6 * (Math.abs(c[2]) + 1)) };
  }
  if (l.kind === 'check' && Q < 0) return { h: 1e6 * Q, p: 1e6 };
  if (liquid) {
    const rho = f.rho, mu = f.mu > 0 ? f.mu : MU_ASSUMED.liquid, Qa = Math.max(Math.abs(Q), 1e-12), v = Qa / A, Re = rho * v * l.D / mu;
    if (l.kind === 'cvalve') { const Kv = cvalveKv(l); if (Kv <= 0) return { h: 1e9 * Q, p: 1e9 }; const k = rho / 1000 * 1e5 / (G * rho) * Math.pow(3600 / Kv, 2); return { h: k * Q * Qa, p: Math.max(2 * k * Qa, floor) }; }
    const ff = (q) => { const vv = Math.max(Math.abs(q), 1e-12) / A; return friction(rho * vv * l.D / mu, (l.eps ?? EPS_COMMERCIAL_STEEL) / l.D); };
    let K = l.K || 0; for (const [n, c] of Object.entries(l.fittings || {})) K += (K_FITTINGS[n] || 0) * c;
    const Kf = fitK(net, l, Re); K += Kf; l._K = K; l._Kfit = Kf; l._Re = Re;
    const kk = (ff(Qa) * (l.L || 0) / l.D + K) / (2 * G * A * A), dz = 0;
    const h = kk * Q * Qa;
    // d/dQ of f(Q) Q|Q| neglected beyond the quadratic part: the turbulent f varies slowly, the iteration absorbs the rest
    const lam = Re < 2300 ? 1 : 0; const p = Math.max(2 * kk * Qa * (1 - 0.5 * lam), floor);
    return { h: h + dz, p: lam ? Math.max(p, 32 * mu * (l.L || 0) / (rho * G * l.D * l.D * A)) : p };
  }
  // gas: relation in P² for the isothermal compressible line  P1² − P2² = (R T / M) (W/A)² [ f L / D + K + 2 ln(P1/P2) ]
  const W = Q, Wa = Math.max(Math.abs(W), 1e-12), RT = R * f.T * (f.Z || 1) / f.M, mu = f.mu > 0 ? f.mu : MU_ASSUMED.gas;
  const Re = 4 * Wa / (Math.PI * l.D * mu);
  if (l.kind === 'cvalve') throw new Error('control valves on gas lines: give the valve as a pipe with K for now (gas Cv sizing is not built)');
  let K = l.K || 0; for (const [n, c] of Object.entries(l.fittings || {})) K += (K_FITTINGS[n] || 0) * c;
  const Kf = fitK(net, l, Re); K += Kf; l._K = K; l._Kfit = Kf; l._Re = Re;
  const fk = friction(Re, (l.eps ?? EPS_COMMERCIAL_STEEL) / l.D) * (l.L || 0) / l.D + K;
  let ln = 0; if (st && st.P1 > 0 && st.P2 > 0) ln = 2 * Math.log(st.P1 / st.P2);
  const k = RT * (fk + ln) / (A * A);
  return { h: k * W * Wa, p: Math.max(2 * k * Wa, floor) };
}

/** The steady network. Fixed-pressure nodes (P given) are the reservoirs; every other node balances its flows against its demand. */
export function solveNetwork(net, { maxIter = 200, tol = 1e-9 } = {}) {
  const gas = net.fluid.kind === 'gas', problems = [];
  net = { ...net, _fit: null };
  if (net.links.some((l) => l.fit && l.fit.length)) {
    if (isPack(net.fittingPack) && cleanFittingPack(net.fittingPack).ok) net._fit = net.fittingPack;
    else problems.push(prob('net.fit.nopack', 'warning', 'Links carry fitting lists but the network has no valid fitting pack (fittingPack): the typed K of each link stands and the lists are ignored.', 'network'));
  }
  const ids = net.nodes.map((n) => n.id), idx = new Map(ids.map((id, i) => [id, i]));
  const fixed = net.nodes.map((n) => n.P != null), free = [], fi = new Array(ids.length).fill(-1);
  net.nodes.forEach((n, i) => { if (!fixed[i]) { fi[i] = free.length; free.push(i); } });
  if (!fixed.some(Boolean)) throw new Error('a network needs at least one node with a fixed pressure');
  const rho = gas ? 0 : net.fluid.rho;
  const headOf = (n, P) => (gas ? P * P : P / (rho * G) + (n.z || 0));
  const pOf = (n, h) => (gas ? Math.sqrt(Math.max(h, 0)) : (h - (n.z || 0)) * rho * G);
  const H = net.nodes.map((n, i) => (fixed[i] ? headOf(n, n.P) : null));
  const hFix = Math.max(...H.filter((v) => v != null));
  net.nodes.forEach((n, i) => { if (!fixed[i]) H[i] = hFix; });
  const links = net.links.map((l) => ({ ...l, ia: idx.get(l.a), ib: idx.get(l.b), coef: l.kind === 'pump' ? fitPumpCurve(l.curve) : null }));
  for (const l of links) if (l.ia == null || l.ib == null) throw new Error('link ' + l.id + ' joins a node that does not exist');
  const Q = links.map((l) => (l.Q0 != null ? l.Q0 : (gas ? 1e-2 : 1e-3)));
  const dem = net.nodes.map((n) => n.demand || 0), nf = free.length;
  let iter = 0, ok = false, err = Infinity;
  for (; iter < maxIter; iter++) {
    // node i (free):  Σ_in Q − Σ_out Q = demand,  Q = c0 + g (Ha − Hb)  →  Σ g (Hi − Hn) = −demand + Σ_in c0 − Σ_out c0 + Σ g H(fixed neighbour)
    const A2 = Array.from({ length: nf }, () => new Array(nf).fill(0)), rhs = free.map((ni) => -dem[ni]), rec = [];
    links.forEach((l, k) => {
      const st = gas ? { P1: pOf(net.nodes[l.ia], H[l.ia]), P2: pOf(net.nodes[l.ib], H[l.ib]) } : null;
      const { h, p } = linkLoss(net, st, l, Q[k]), g = 1 / p, c0 = Q[k] - h / p; rec.push({ g, c0 });
      const ra = fi[l.ia], rb = fi[l.ib];
      if (rb >= 0) { A2[rb][rb] += g; rhs[rb] += c0; if (ra >= 0) A2[rb][ra] -= g; else rhs[rb] += g * H[l.ia]; }
      if (ra >= 0) { A2[ra][ra] += g; rhs[ra] -= c0; if (rb >= 0) A2[ra][rb] -= g; else rhs[ra] += g * H[l.ib]; }
    });
    const Hn = nf ? solveLinear(A2, rhs) : [];
    if (nf && !Hn) throw new Error('the network is not connected to a fixed-pressure node, or a link has no resistance');
    let dmax = 0; free.forEach((ni, r) => { const hv = Hn[r]; dmax = Math.max(dmax, Math.abs(hv - H[ni]) / (Math.abs(hv) + 1)); H[ni] = gas ? Math.max(hv, 1) : hv; });
    let dq = 0; links.forEach((l, k) => { const qn = rec[k].c0 + rec[k].g * (H[l.ia] - H[l.ib]); dq = Math.max(dq, Math.abs(qn - Q[k]) / (Math.abs(qn) + 1e-12)); Q[k] = qn; });
    err = Math.max(dmax, dq); if (err < tol) { ok = true; iter++; break; }
  }
  if (!ok) problems.push(prob('net.not-converged', 'error', `The network solution did not converge in ${maxIter} iterations (residual ${err.toExponential(2)}).`, 'network'));
  const nodes = {}; net.nodes.forEach((n, i) => { nodes[n.id] = { P: pOf(n, H[i]), head: gas ? null : H[i], demand: dem[i] }; });
  const out = {};
  links.forEach((l, k) => {
    const A = Math.PI * l.D * l.D / 4, q = Q[k];
    const r = { Q: q, dH: H[l.ia] - H[l.ib] }; if (gas) { r.mdot = q; r.v = q / (A * Math.max(1, (nodes[l.a].P + nodes[l.b].P) / 2) * net.fluid.M / (R * net.fluid.T * (net.fluid.Z || 1))); r.dP = nodes[l.a].P - nodes[l.b].P; }
    else { r.mdot = q * rho; r.v = q / A; r.dP = nodes[l.a].P - nodes[l.b].P; if (l.kind === 'pump') { r.head = pumpHead(l.coef, q); if (q < 0) problems.push(prob('net.pump-reverse', 'error', `Pump ${l.id} would run backwards at this solution.`, l.id)); } }
    if (!gas && l.kind !== 'pump') { const lim = 3; if (Math.abs(r.v) > lim) problems.push(prob('net.velocity', 'warning', `Line ${l.id}: velocity ${Math.abs(r.v).toFixed(1)} m/s is above the ${lim} m/s screening limit for liquids.`, l.id)); }
    if (gas) { const cs = Math.sqrt((net.fluid.k || 1.3) * R * net.fluid.T * (net.fluid.Z || 1) / net.fluid.M); if (Math.abs(r.v) > 0.7 * cs) problems.push(prob('net.mach', 'warning', `Line ${l.id}: Mach number ${(Math.abs(r.v) / cs).toFixed(2)} (isothermal model is not valid close to choking).`, l.id)); }
    if (l._K != null) { r.K = l._K; r.Kfit = l._Kfit; r.Re = l._Re; }
    out[l.id] = r;
  });
  return { ok, iterations: iter, nodes, links: out, problems };
}

/** Wave speed of a liquid in an elastic pipe (Korteweg–Joukowsky): a = sqrt( (K/rho) / (1 + (K D / (E e)) c1) ), c1 = 1 − nu²/2... anchored: 1 − nu² (both ends fixed), else 1 − nu/2 (anchored at the upstream end only) — the usual published pair. */
export function waveSpeed({ K = 2.19e9, rho = 998, D, e, E = 2.0e11, nu = 0.3, anchored = 'both' }) {
  const c1 = anchored === 'joints' ? 1 : anchored === 'upstream' ? 1 - nu / 2 : 1 - nu * nu;
  if (!(e > 0)) return Math.sqrt(K / rho);
  return Math.sqrt((K / rho) / (1 + (K * D / (E * e)) * c1));
}
/** Joukowsky: the head or pressure rise for an instantaneous velocity change dV: dP = rho a dV. */
export const joukowsky = (a, dV, rho) => rho * a * dV;

/**
 * Water hammer by the method of characteristics in one pipe: a reservoir upstream, a valve downstream (closing or opening by tau(t) = relative opening 0..1).
 *   spec = { L, D, a (wave speed), f? (Darcy friction, quasi-steady), Hres (m, reservoir head above the valve outlet), V0 (initial velocity m/s, steady-state before the event),
 *            tau: (t) => 0..1 or [[t, tau], …], tEnd (s), N? (reaches), Hv? (vapour head in the same datum, m: below it the run says column separation may occur), rho? }
 *   → { t[], Hvalve[], Qvalve[], Hmid[], Hmax, Hmin, tMax, period (4L/a), problems }
 * Heads are measured from the valve outlet; the steady head at the valve is Hres − friction. Not modelled: column separation (flagged), pump trip, unsteady friction.
 */
export function hammer(spec) {
  const { L, D, a, f = 0, Hres, V0, tEnd, N = 50, Hv = null, rho = 998 } = spec;
  const dx = L / N, dt = dx / a, A = Math.PI * D * D / 4, B = a / (G * A), Rr = f * dx / (2 * G * D * A * A);
  const tau = typeof spec.tau === 'function' ? spec.tau : ((pts) => (t) => { if (t <= pts[0][0]) return pts[0][1]; for (let i = 1; i < pts.length; i++) if (t <= pts[i][0]) { const w = (t - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]); return pts[i - 1][1] + w * (pts[i][1] - pts[i - 1][1]); } return pts[pts.length - 1][1]; })(spec.tau);
  const Q0 = V0 * A;
  let Q = new Array(N + 1).fill(Q0), Hh = new Array(N + 1);
  for (let i = 0; i <= N; i++) Hh[i] = Hres - Rr * Q0 * Q0 * (i / 1) * 1;   // head falls linearly along the pipe by friction
  const Hv0 = Hh[N];   // steady head at the valve (reservoir head less friction over N reaches)
  const CvOpen = Q0 * Q0 / Hv0;   // Q² = Cv τ² H at the valve with τ = 1 giving Q0 at the steady head
  const T = [], Hval = [], Qval = [], Hmid = [], problems = [];
  let Hmax = -Infinity, Hmin = Infinity, tMax = 0; const steps = Math.ceil(tEnd / dt);
  for (let s = 0; s <= steps; s++) {
    const t = s * dt;
    if (s > 0) {
      const Qn = new Array(N + 1), Hn = new Array(N + 1);
      for (let i = 1; i < N; i++) {
        const CP = Hh[i - 1] + (B - 0) * Q[i - 1] - Rr * Q[i - 1] * Math.abs(Q[i - 1]) * 0 - Rr * Q[i - 1] * Math.abs(Q[i - 1]);
        const CM = Hh[i + 1] - B * Q[i + 1] + Rr * Q[i + 1] * Math.abs(Q[i + 1]);
        // Wylie–Streeter: HP = 0.5 (CP + CM), QP = (CP − CM) / (2B) with CP = H(i−1) + B Q(i−1) − R Q|Q|, CM = H(i+1) − B Q(i+1) + R Q|Q|
        Hn[i] = 0.5 * (CP + CM); Qn[i] = (CP - CM) / (2 * B);
      }
      // upstream reservoir: C− from node 1
      { const CM = Hh[1] - B * Q[1] + Rr * Q[1] * Math.abs(Q[1]); Hn[0] = Hres; Qn[0] = (Hres - CM) / B; }
      // downstream valve: C+ from node N−1;  Q² = Cv τ² HP  with HP = CP − B Q
      { const CP = Hh[N - 1] + B * Q[N - 1] - Rr * Q[N - 1] * Math.abs(Q[N - 1]), tv = tau(t), c = CvOpen * tv * tv;
        if (c <= 0) { Qn[N] = 0; Hn[N] = CP; } else { const q = (-B * c + Math.sqrt(B * B * c * c + 4 * c * CP)) / 2; Qn[N] = q; Hn[N] = CP - B * q; } }
      Q = Qn; Hh = Hn;
    }
    T.push(t); Hval.push(Hh[N]); Qval.push(Q[N]); Hmid.push(Hh[N >> 1]);
    if (Hh[N] > Hmax) { Hmax = Hh[N]; tMax = t; } for (const hv of Hh) if (hv < Hmin) Hmin = hv;
  }
  if (Hv != null && Hmin < Hv) problems.push(prob('hammer.cavitation', 'error', `The head falls to ${Hmin.toFixed(1)} m, below the vapour head ${Hv.toFixed(1)} m: the liquid column can separate and this model (no column separation) is not valid after that moment.`, 'hammer'));
  return { t: T, Hvalve: Hval, Qvalve: Qval, Hmid, Hmax, Hmin, tMax, period: 4 * L / a, steady: Hv0, dtStep: dt, pressureMax: rho * G * Hmax, problems };
}
