/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dynamics.js — dynamic simulation of a plant (0.8 Track CH, CH.5). DOM-free, deterministic, runs in a worker.
 *
 *   stiff(f, t0, y0, t1, opts)      stiff ODE solver: implicit Euler with step-doubling (Richardson) extrapolation, Newton with a finite-difference
 *                                   Jacobian, adaptive step. For Robertson's problem and a linear stiff test it reproduces the published/closed-form answers.
 *   simulate(spec, opts)            a plant of liquid tanks, constant-volume reactors (CSTR with energy balance), gas vessels, valves with characteristics
 *                                   and stroke lag, PID controllers, and a script of upsets / start-ups / shut-downs → trends
 *   controllersFromLoops(loops, bindings)   P&ID loops (controls.js) + a table saying what each controller reads and drives → controller records
 *   fopdtFromStep(t, y, du)         first-order-plus-dead-time fit of a step test (Smith's 28.3 % / 63.2 % method)
 *   tune(method, fit, opts)         Ziegler–Nichols (reaction curve), Cohen–Coon, IMC/Lambda, SIMC: PI or PID settings
 *
 * spec (plain data, saved in the file):
 *   tanks:     [{ id, A (m2), h0 (m), rho (kg/m3), hmax? }]
 *   reactors:  [{ id, V (m3), rho, cp (J/kg/K), T0 (K), C0 { comp: mol/m3 }, reaction?: { nu { comp: coefficient }, k0, E (J/mol), orders { comp: n }, dH (J/mol, negative = exothermic) },
 *                 UA? (W/K), Tc? (K), Q? (W heater at full output) }]
 *   gas:       [{ id, V (m3), T (K), P0 (Pa) }]                                  ideal gas, isothermal
 *   sources:   [{ id, to, F (m3/s | mol/s for gas), T?, C? { comp }, max? (full-scale for a controller), kind?: 'liquid' | 'gas' }]
 *   valves:    [{ id, from, to (tank/reactor/gas id or null = atmosphere/drain), k, charact?: 'linear'|'equal'|'quick', R?, open, tau? (s), pOut? (Pa) }]
 *   controllers: [{ id, pv: 'T1.h' | 'R1.T' | 'R1.C.A' | 'G1.P', mv: 'valve.V1' | 'source.S1' | 'heater.R1' | 'jacket.R1', sp, Kc, Ti?, Td?, tf?, action: 'direct'|'reverse',
 *                   span: [min, max] of the measurement, bias?: 0..1, auto?: true, out? (manual output 0..1) }]
 *   script:    [{ t (s), set: { target, value } }]   targets: source.<id>.F / T, valve.<id>.open, ctrl.<id>.sp / auto / out / Kc / Ti, reactor.<id>.UA / Tc / Q
 * Valve flow: q = k · f(x) · sqrt(max(Δp, 0) / rho) with Δp from the liquid heads (tank to tank), f(x) = x (linear) or R^(x−1) (equal percentage; closes at x = 0).
 */
import { solveLinear } from './numeric.js';
import { R as RGAS } from './data.js';

const G = 9.80665;

// ---- stiff solver ------------------------------------------------------------------------------------------------------------------
function jac(f, t, y, f0) {
  const n = y.length, J = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let j = 0; j < n; j++) { const h = 1e-7 * Math.max(Math.abs(y[j]), 1e-3), yp = y.slice(); yp[j] += h; const fp = f(t, yp); for (let i = 0; i < n; i++) J[i][j] = (fp[i] - f0[i]) / h; }
  return J;
}
function ieStep(f, t, y, h, J) {   // one implicit Euler step with the (frozen) Jacobian J; null when Newton fails
  const n = y.length, M = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0) - h * J[i][j]));
  let x = y.slice();
  for (let it = 0; it < 12; it++) {
    const fx = f(t + h, x), r = x.map((v, i) => v - y[i] - h * fx[i]);
    const dx = solveLinear(M.map((row) => row.slice()), r.map((v) => -v)); if (!dx || dx.some((v) => !Number.isFinite(v))) return null;
    x = x.map((v, i) => v + dx[i]);
    const sc = Math.max(1e-12, ...x.map(Math.abs));
    if (Math.max(...dx.map(Math.abs)) < 1e-11 * sc + 1e-14) return x;
  }
  return null;
}
/** y' = f(t, y) from t0 to t1. → { y, t, steps, rejected, points: [[t, y]…] } (every accepted step). `onStep(t, y)` may return a replacement y (events). */
export function stiff(f, t0, y0, t1, { rtol = 1e-6, atol = 1e-9, h0 = null, hmax = Infinity, maxSteps = 500000 } = {}) {
  let t = t0, y = y0.slice(), h = Math.min(h0 || (t1 - t0) / 200, hmax), steps = 0, rejected = 0; const points = [[t, y.slice()]];
  while (t < t1 - 1e-12 * Math.max(1, Math.abs(t1)) && steps < maxSteps) {
    if (t + h > t1) h = t1 - t;
    const f0 = f(t, y), J = jac(f, t, y, f0);
    const full = ieStep(f, t, y, h, J), half1 = full && ieStep(f, t, y, h / 2, J), half2 = half1 && ieStep(f, t + h / 2, half1, h / 2, J);
    if (!half2) { h /= 4; rejected++; steps++; if (h < 1e-15 * Math.max(1, Math.abs(t))) throw new Error('stiff solver step underflow at t = ' + t); continue; }
    let err = 0; for (let i = 0; i < y.length; i++) { const sc = atol + rtol * Math.max(Math.abs(y[i]), Math.abs(half2[i])); err = Math.max(err, Math.abs(half2[i] - full[i]) / sc); }
    if (err <= 1) { y = half2.map((v, i) => 2 * v - full[i]); t += h; points.push([t, y.slice()]); }
    else rejected++;
    h = Math.min(hmax, h * Math.min(4, Math.max(0.2, 0.9 / Math.sqrt(err || 1e-12)))); steps++;
  }
  if (t < t1 - 1e-9 * Math.max(1, Math.abs(t1))) throw new Error('stiff solver ran out of steps before t = ' + t1);
  return { y, t, steps, rejected, points };
}

// ---- the plant ------------------------------------------------------------------------------------------------------------------
const charact = (v, x) => { x = Math.min(1, Math.max(0, x)); const c = v.charact || 'linear'; if (c === 'equal') return x <= 0 ? 0 : Math.pow(v.R || 50, x - 1); if (c === 'quick') return Math.sqrt(x); return x; };
const clamp01 = (u) => Math.min(1, Math.max(0, u));

function compile(spec0) {
  const spec = JSON.parse(JSON.stringify(spec0));
  const idx = {}; let n = 0; const names = [];
  const add = (key) => { idx[key] = n++; names.push(key); };
  (spec.tanks || []).forEach((v) => add(v.id + '.h'));
  (spec.reactors || []).forEach((r) => { add(r.id + '.T'); r.comps = Object.keys({ ...(r.C0 || {}), ...((r.reaction || {}).nu || {}) }); r.comps.forEach((c) => add(r.id + '.C.' + c)); });
  (spec.gas || []).forEach((g) => add(g.id + '.P'));
  (spec.valves || []).forEach((v) => { if (v.tau > 0) add('valve.' + v.id + '.x'); });
  (spec.controllers || []).forEach((c) => { add('ctrl.' + c.id + '.I'); add('ctrl.' + c.id + '.D'); });
  return { spec, idx, n, names };
}

function y0Of(c) {
  const y = new Array(c.n).fill(0);
  for (const v of c.spec.tanks || []) y[c.idx[v.id + '.h']] = v.h0 ?? 0;
  for (const r of c.spec.reactors || []) { y[c.idx[r.id + '.T']] = r.T0; r.comps.forEach((k) => { y[c.idx[r.id + '.C.' + k]] = (r.C0 || {})[k] || 0; }); }
  for (const g of c.spec.gas || []) y[c.idx[g.id + '.P']] = g.P0;
  for (const v of c.spec.valves || []) if (v.tau > 0) y[c.idx['valve.' + v.id + '.x']] = v.open ?? 0;
  for (const k of c.spec.controllers || []) { y[c.idx['ctrl.' + k.id + '.I']] = k.I0 ?? 0; }
  return y;
}
/** The measurement a controller reads. */
function measure(c, y, path) {
  const m = /^(\w+)\.(h|T|P)$/.exec(path); if (m) return y[c.idx[path]];
  const q = /^(\w+)\.C\.(\w+)$/.exec(path); if (q) return y[c.idx[path]];
  throw new Error('controller measurement ' + path + ' is not a tank level, reactor T / C or gas P');
}
function ctrlOut(c, k, y) {
  const span = (k.span[1] - k.span[0]) || 1, pv = (measure(c, y, k.pv) - k.span[0]) / span, sp = (k.sp - k.span[0]) / span;
  const I = y[c.idx['ctrl.' + k.id + '.I']], Df = y[c.idx['ctrl.' + k.id + '.D']];
  const eSigned =  // direct: output rises as the measurement rises; reverse: as it falls
    (k.action === 'direct' ? 1 : -1) * (pv - sp);
  const tf = k.tf || 0.1 * (k.Td || 0) + 1e-9;
  const dterm = k.Td ? (k.Td * (eSigned - Df)) / tf : 0;
  const raw = (k.bias ?? 0.5) + k.Kc * (eSigned + (k.Ti ? I / k.Ti : 0) + dterm);
  return { e: eSigned, raw, u: k.auto === false ? clamp01(k.out ?? 0) : clamp01(raw) };
}

function derivative(c, t, y) {
  const s = c.spec, dy = new Array(c.n).fill(0), X = c.idx;
  const ctr = {}; for (const k of s.controllers || []) ctr[k.id] = ctrlOut(c, k, y);
  const mvOf = (kind, id) => { const k = (s.controllers || []).find((q) => q.mv === kind + '.' + id); return k ? ctr[k.id].u : null; };
  const levelOf = (id) => { const tk = (s.tanks || []).find((q) => q.id === id); return tk ? y[X[id + '.h']] : 0; };
  const inflow = {}, outflow = {}, hin = {}, Cin = {}, Tin = {};
  const acc = (id, q, T, C) => { inflow[id] = (inflow[id] || 0) + q; hin[id] = (hin[id] || 0) + q * (T ?? 0); if (C) { Cin[id] ||= {}; for (const [k, v] of Object.entries(C)) Cin[id][k] = (Cin[id][k] || 0) + q * v; } };
  for (const so of s.sources || []) { const u = mvOf('source', so.id); const F = u != null ? u * (so.max ?? so.F) : so.F; acc(so.to, F, so.T, so.C); (so._F = F); }
  const vout = {};
  for (const v of s.valves || []) {
    const u = mvOf('valve', v.id), cmd = u != null ? u : v.open, x = v.tau > 0 ? y[X['valve.' + v.id + '.x']] : cmd;
    if (v.tau > 0) dy[X['valve.' + v.id + '.x']] = (cmd - x) / v.tau;
    const tank = (s.tanks || []).find((q) => q.id === v.from), gas = (s.gas || []).find((q) => q.id === v.from), rx = (s.reactors || []).find((q) => q.id === v.from);
    let q = 0;
    if (tank) { const rho = tank.rho; const hTo = v.to && (s.tanks || []).some((q2) => q2.id === v.to) ? levelOf(v.to) : 0; const dp = rho * G * (Math.max(y[X[v.from + '.h']], 0) - hTo + (v.dz || 0)); q = v.k * charact(v, x) * Math.sqrt(Math.max(dp, 0) / rho); outflow[v.from] = (outflow[v.from] || 0) + q; if (v.to) acc(v.to, q, null, null); }
    else if (gas) { const P = y[X[v.from + '.P']], Pd = v.to && (s.gas || []).some((q2) => q2.id === v.to) ? y[X[v.to + '.P']] : (v.pOut ?? 1e5); q = v.k * charact(v, x) * Math.sqrt(Math.max(P - Pd, 0)); outflow[v.from] = (outflow[v.from] || 0) + q; if (v.to && (s.gas || []).some((q2) => q2.id === v.to)) acc(v.to, q, null, null); }
    else if (rx) { q = v.k * charact(v, x); vout[v.from] = (vout[v.from] || 0) + q; }
    else throw new Error('valve ' + v.id + ' draws from ' + v.from + ', which is not a tank, reactor or gas vessel');
  }
  for (const tk of s.tanks || []) { const h = y[X[tk.id + '.h']]; let d = ((inflow[tk.id] || 0) - (outflow[tk.id] || 0)) / tk.A; if (h <= 0 && d < 0) d = 0; if (tk.hmax != null && h >= tk.hmax && d > 0) d = 0; dy[X[tk.id + '.h']] = d; }
  for (const g of s.gas || []) dy[X[g.id + '.P']] = (RGAS * g.T / g.V) * ((inflow[g.id] || 0) - (outflow[g.id] || 0));
  for (const r of s.reactors || []) {
    const T = y[X[r.id + '.T']], q = (inflow[r.id] || 0), Cm = Object.fromEntries(r.comps.map((k) => [k, y[X[r.id + '.C.' + k]]]));
    let rate = 0;
    if (r.reaction) { const rc = r.reaction; rate = rc.k0 * Math.exp(-rc.E / (RGAS * T)); for (const [k, nn] of Object.entries(rc.orders || {})) rate *= Math.pow(Math.max(Cm[k] || 0, 0), nn); }
    const Tfeed = q > 0 ? hin[r.id] / q : T, qq = Math.max(q, 0);
    for (const k of r.comps) dy[X[r.id + '.C.' + k]] = qq / r.V * ((Cin[r.id] && qq > 0 ? (Cin[r.id][k] || 0) / qq : 0) - Cm[k]) + (r.reaction && r.reaction.nu[k] ? r.reaction.nu[k] * rate : 0);
    const uH = mvOf('heater', r.id), Qh = (uH != null ? uH : 1) * (r.Q || 0), uJ = mvOf('jacket', r.id), Tj = uJ != null ? r.Tc + (uJ - 0.5) * (r.TcSpan || 0) : r.Tc;
    dy[X[r.id + '.T']] = qq / r.V * (Tfeed - T) + (r.reaction ? (-r.reaction.dH * rate) / (r.rho * r.cp) : 0) - (r.UA ? r.UA * (T - Tj) / (r.rho * r.cp * r.V) : 0) + Qh / (r.rho * r.cp * r.V);
  }
  for (const k of s.controllers || []) {
    const o = ctr[k.id], tf = k.tf || 0.1 * (k.Td || 0) + 1e-9;
    const sat = (o.raw > 1 && o.e > 0) || (o.raw < 0 && o.e < 0);
    dy[X['ctrl.' + k.id + '.I']] = k.auto === false || sat || !k.Ti ? 0 : o.e;
    dy[X['ctrl.' + k.id + '.D']] = k.Td ? (o.e - y[X['ctrl.' + k.id + '.D']]) / tf : 0;
  }
  c._ctr = ctr;
  return dy;
}

function setTarget(spec, target, value) {
  const [kind, id, field] = String(target).split('.');
  const pick = { source: 'sources', valve: 'valves', ctrl: 'controllers', reactor: 'reactors', tank: 'tanks' }[kind];
  const o = pick && (spec[pick] || []).find((q) => q.id === id);
  if (!o || !field) throw new Error('script target ' + target + ' does not name an item in the plant');
  if (kind === 'valve' && field === 'open') { o.open = value; return; }
  o[field === 'out' || field === 'auto' || field === 'sp' ? field : field] = value;
}

/**
 * → { t[], series: { '<name>': [..] }, outputs: { '<ctrl id>': [u…] }, steps, rejected, problems }
 * opts: { tEnd, dt (output spacing, default tEnd / 200), rtol, atol }
 */
export function simulate(spec0, { tEnd, dt = null, rtol = 1e-6, atol = 1e-9 } = {}) {
  const c = compile(spec0), problems = [];
  if (!(tEnd > 0)) throw new Error('simulate needs tEnd > 0');
  const step = dt || tEnd / 200;
  const events = [...(c.spec.script || [])].sort((a, b) => a.t - b.t);
  let y = y0Of(c), t = 0, steps = 0, rejected = 0;
  const times = [0], rows = [y.slice()], outs = [];
  const f = (tt, yy) => derivative(c, tt, yy);
  const record = (tt, yy) => { f(tt, yy); outs.push(Object.fromEntries((c.spec.controllers || []).map((k) => [k.id, c._ctr[k.id].u]))); };
  record(0, y);
  let ei = 0;
  while (t < tEnd - 1e-12) {
    while (ei < events.length && events[ei].t <= t + 1e-12) { setTarget(c.spec, events[ei].set.target, events[ei].set.value); ei++; }
    const next = Math.min(tEnd, t + step, ei < events.length ? events[ei].t : Infinity);
    const r = stiff(f, t, y, next, { rtol, atol, h0: (next - t) / 4 });
    y = r.y; t = next; steps += r.steps; rejected += r.rejected;
    times.push(t); rows.push(y.slice()); record(t, y);
  }
  const series = {}; c.names.forEach((nme, i) => { series[nme] = rows.map((row) => row[i]); });
  for (const tk of c.spec.tanks || []) if (series[tk.id + '.h'].some((v) => v < -1e-9)) problems.push({ id: 'process:dyn.dry:' + tk.id, code: 'dyn.dry', severity: 'error', text: `Tank ${tk.id} ran dry in the simulation.`, about: [{ kind: 'unit', id: tk.id }], source: { kind: 'engine', name: 'process' } });
  for (const tk of c.spec.tanks || []) if (tk.hmax != null && series[tk.id + '.h'].some((v) => v >= tk.hmax * (1 - 1e-9))) problems.push({ id: 'process:dyn.overflow:' + tk.id, code: 'dyn.overflow', severity: 'error', text: `Tank ${tk.id} overflowed in the simulation.`, about: [{ kind: 'unit', id: tk.id }], source: { kind: 'engine', name: 'process' } });
  const outputs = {}; for (const k of c.spec.controllers || []) outputs[k.id] = outs.map((o) => o[k.id]);
  return { t: times, series, outputs, steps, rejected, problems };
}

/** Controller records from P&ID loops: `bindings` = { '<controller tag>': { pv, mv, sp, span, action, Kc, Ti, Td } } says what each one reads and drives. */
export function controllersFromLoops(loops, bindings = {}, defaults = {}) {
  const out = [], problems = [];
  for (const l of loops) for (const m of l.members) if (m.role === 'controller') {
    const b = bindings[m.tag];
    if (!b || !b.pv || !b.mv) { problems.push({ id: 'process:dyn.unbound:' + m.tag, code: 'dyn.unbound', severity: 'warning', text: `Controller ${m.tag} is not tied to a measurement and an output in the plant model.`, about: [{ kind: 'loop', id: l.id }], source: { kind: 'engine', name: 'process' } }); continue; }
    out.push({ id: m.tag, action: 'reverse', Kc: 1, Ti: 60, auto: true, bias: 0.5, ...defaults, ...b });
  }
  return { controllers: out, problems };
}

// ---- tuning ------------------------------------------------------------------------------------------------------------------
/** Smith's two-point method on a step response (y at time t after a step of size du in the input): K, tau, theta. */
export function fopdtFromStep(t, y, du) {
  const y0 = y[0], yf = y[y.length - 1], dy = yf - y0, at = (frac) => { const target = y0 + frac * dy; for (let i = 1; i < t.length; i++) if ((y[i] - target) * (y[i - 1] - target) <= 0 && y[i] !== y[i - 1]) return t[i - 1] + (target - y[i - 1]) / (y[i] - y[i - 1]) * (t[i] - t[i - 1]); return NaN; };
  const t28 = at(0.283), t63 = at(0.632), tau = 1.5 * (t63 - t28), theta = Math.max(0, t63 - tau);
  return { K: dy / du, tau, theta };
}
export function tune(method, { K, tau, theta }, { type = 'PI', lambda = null } = {}) {
  const th = Math.max(theta, 1e-9), r = tau / (K * th), x = th / tau;
  if (method === 'zn') return type === 'P' ? { Kc: r } : type === 'PI' ? { Kc: 0.9 * r, Ti: 3.33 * th } : { Kc: 1.2 * r, Ti: 2 * th, Td: 0.5 * th };
  if (method === 'cohen-coon') return type === 'P' ? { Kc: r * (1 + x / 3) } : type === 'PI' ? { Kc: r * (0.9 + x / 12), Ti: th * (30 + 3 * x) / (9 + 20 * x) } : { Kc: r * (4 / 3 + x / 4), Ti: th * (32 + 6 * x) / (13 + 8 * x), Td: 4 * th / (11 + 2 * x) };
  if (method === 'imc') { const l = lambda ?? Math.max(th, 0.2 * tau); return type === 'PI' ? { Kc: (tau + th / 2) / (K * (l + th / 2)), Ti: tau + th / 2 } : { Kc: (tau + th / 2) / (K * (l + th / 2)), Ti: tau + th / 2, Td: tau * th / (2 * tau + th) }; }
  if (method === 'simc') { const tc = lambda ?? th; return { Kc: tau / (K * (tc + th)), Ti: Math.min(tau, 4 * (tc + th)), ...(type === 'PID' ? { Td: 0 } : {}) }; }
  throw new Error('unknown tuning method ' + method);
}
