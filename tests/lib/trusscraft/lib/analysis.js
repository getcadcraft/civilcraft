/* SPDX-License-Identifier: Apache-2.0 */
/**
 * analysis.js — member forces by the method of joints, and an axial check of timber members (DOM-free; pure).
 *   nodalLoads(g, loads, spacing) → Map node → kN (down)
 *   solve(g, loadsByNode) → { status: 'ok' | 'mechanism' | 'indeterminate' | 'unstable', forces: Map member → kN (tension +), reactions, residual }
 *   checkMembers(g, res, sizes, species, opts) → [{ id, mark, role, force, kind, size, util, slender, le }]
 *   autoSize(g, res, species, opts) → { sizes: { top, bottom, web }, rows, ok }
 * Pin-jointed, loads at the panel points, supports a pin and a roller at the heel joints. This is the whole model: no bending of the chords
 * between panel points, no joint slip, no net-section loss at the plates, no eccentricity, no deflection. The result is a first check on a
 * stated load case, never the truss design.
 */
import { SIZES, sizeById } from './tables.js';

const D2R = Math.PI / 180;
const live = (g) => g.members.filter((m) => m.role !== 'tail');
/** The members the method of joints solves: not the overhang tails, and not the bearing stub (its force is the bearing reaction, set after the solve). */
const solvable = (g) => g.members.filter((m) => m.role !== 'tail' && m.role !== 'stub');

/** kN at each node of the frame from kPa loads: roof dead on the slope, snow on plan, ceiling dead on plan; `spacing` mm between trusses. */
export function nodalLoads(g, { roofDead = 0, snow = 0, ceilingDead = 0 }, spacing) {
  const s = spacing / 1000, out = new Map();
  const add = (id, v) => out.set(id, (out.get(id) || 0) + v);
  for (const m of solvable(g)) {
    const dx = Math.abs(g.nodes[m.b].x - g.nodes[m.a].x);
    let w = 0;
    if (m.role === 'top') w = (roofDead * (m.len / 1000) + snow * (dx / 1000)) * s;       // dead on the slope, snow on plan
    else if (m.role === 'bottom') w = ceilingDead * (dx / 1000) * s;                       // ceiling on plan
    if (w) { add(m.a, w / 2); add(m.b, w / 2); }
  }
  return out;
}

/**
 * The four load cases as separate unit-less results (all kN at the nodes; a number is a downward load, {fx, fz} a force with fz up):
 *   D roof dead (on the slope) + ceiling dead · S snow or roof live (on plan) · W wind: normal pressures, windward on the left half of the top chord,
 *   leeward on the right (kPa, + pushes onto the roof, - is suction) · U uplift: a net upward pressure on plan.
 * Every figure is the person's own: nothing here is a code value.
 */
export function caseLoads(g, loads, spacing) {
  const s = spacing / 1000, S = g.span;
  const D = nodalLoads(g, { roofDead: loads.roofDead || 0, snow: 0, ceilingDead: loads.ceilingDead || 0 }, spacing);
  const Sn = nodalLoads(g, { roofDead: 0, snow: loads.snow || 0, ceilingDead: 0 }, spacing);
  const W = new Map(), U = new Map();
  const addV = (map, id, fx, fz) => { const p = map.get(id) || { fx: 0, fz: 0 }; p.fx += fx; p.fz += fz; map.set(id, p); };
  for (const m of solvable(g).filter((x) => x.role === 'top')) {
    const A = g.nodes[m.a], B = g.nodes[m.b], dx = B.x - A.x, dz = B.z - A.z, L = m.len, left = (A.x + B.x) / 2 < S / 2;
    const p = left ? (loads.windward || 0) : (loads.leeward || 0);
    if (p) {   // pressure p (kPa) on the surface pushes against the outward normal (-dz, dx)/L (upward side), kN = p·s·L
      const F = p * s * (L / 1000), sg = dx >= 0 ? 1 : -1, nx = (-dz / L) * sg, nz = (dx / L) * sg;
      for (const id of [m.a, m.b]) addV(W, id, -nx * F / 2, -nz * F / 2);
    }
    if (loads.uplift) for (const id of [m.a, m.b]) addV(U, id, 0, loads.uplift * s * (Math.abs(dx) / 1000) / 2);
  }
  return { D, S: Sn, W, U };
}

/** Transverse load on each chord member (kN/m, + toward the roof like gravity) per case, for the bending between panel points. */
export function chordLoads(g, loads, spacing) {
  const s = spacing / 1000, S = g.span, out = new Map();
  for (const m of solvable(g)) {
    if (m.role !== 'top' && m.role !== 'bottom') continue;
    const A = g.nodes[m.a], B = g.nodes[m.b], c = Math.abs(B.x - A.x) / m.len, left = (A.x + B.x) / 2 < S / 2;
    if (m.role === 'top') out.set(m.id, { D: (loads.roofDead || 0) * s * c, S: (loads.snow || 0) * s * c * c, W: (left ? loads.windward : loads.leeward) * s || 0, U: -(loads.uplift || 0) * s * c * c });
    else out.set(m.id, { D: (loads.ceilingDead || 0) * s * c, S: 0, W: 0, U: 0 });
  }
  return out;
}

/** Gaussian elimination with partial pivoting: A x = b (square) → x or null when singular. */
function gauss(A, b) {
  const n = b.length, M = A.map((r, i) => [...r, b[i]]);
  for (let c = 0; c < n; c++) {
    let p = c;
    for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    if (Math.abs(M[p][c]) < 1e-9) return null;
    [M[c], M[p]] = [M[p], M[c]];
    for (let r = c + 1; r < n; r++) { const f = M[r][c] / M[c][c]; if (f) for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  const x = new Array(n).fill(0);
  for (let r = n - 1; r >= 0; r--) { let s = M[r][n]; for (let k = r + 1; k < n; k++) s -= M[r][k] * x[k]; x[r] = s / M[r][r]; }
  return x;
}

export { gauss };
export function solve(g, loadsByNode) {
  const ms = solvable(g), used = new Set(ms.flatMap((m) => [m.a, m.b])), nodes = [...used].sort((a, b) => a - b), ix = new Map(nodes.map((id, i) => [id, i]));
  const [s0, s1] = g.supports, m = ms.length, n = nodes.length, unk = m + 3;
  if (!used.has(s0) || !used.has(s1)) return { status: 'unstable', forces: new Map(), reactions: null, residual: NaN };
  if (unk < 2 * n) return { status: 'mechanism', forces: new Map(), reactions: null, residual: NaN, dof: 2 * n - unk };
  if (unk > 2 * n) return { status: 'indeterminate', forces: new Map(), reactions: null, residual: NaN, extra: unk - 2 * n };
  const A = Array.from({ length: 2 * n }, () => new Array(unk).fill(0)), b = new Array(2 * n).fill(0);
  ms.forEach((mm, j) => {
    const a = g.nodes[mm.a], c = g.nodes[mm.b], L = Math.hypot(c.x - a.x, c.z - a.z), ex = (c.x - a.x) / L, ez = (c.z - a.z) / L;
    A[2 * ix.get(mm.a)][j] += ex; A[2 * ix.get(mm.a) + 1][j] += ez;
    A[2 * ix.get(mm.b)][j] -= ex; A[2 * ix.get(mm.b) + 1][j] -= ez;
  });
  A[2 * ix.get(s0)][m] = 1; A[2 * ix.get(s0) + 1][m + 1] = 1; A[2 * ix.get(s1) + 1][m + 2] = 1;
  for (const [id, v] of loadsByNode) {
    if (!ix.has(id)) continue;
    if (typeof v === 'number') b[2 * ix.get(id) + 1] += v;   // the load pulls the node down: the supports and members must give +v up
    else { b[2 * ix.get(id)] -= v.fx || 0; b[2 * ix.get(id) + 1] -= v.fz || 0; }   // a force {fx, fz up}: b is minus the external force
  }
  const x = gauss(A, b.map((v) => v));
  if (!x) return { status: 'unstable', forces: new Map(), reactions: null, residual: NaN };
  let res = 0;
  for (let r = 0; r < 2 * n; r++) { let s = -b[r]; for (let k = 0; k < unk; k++) s += A[r][k] * x[k]; res = Math.max(res, Math.abs(s)); }
  const forces = new Map(ms.map((mm, j) => [mm.id, x[j]]));
  return { status: 'ok', forces, reactions: { left: [x[m], x[m + 1]], right: [0, x[m + 2]] }, residual: res };
}

/** Sign check on the equation above: node equilibrium reads  Σ(member pulls) + reactions = load (a downward load is a positive b). */

const area = (s) => s.b * s.d;

/**
 * Check of one member under one force. Tension: T / (Ft·CD·A). Compression: C / (Fc·CD·Cp·A), Cp the column stability factor from E_min.
 * With a moment (kN·m, chord bending between panel points) and an Fb (MPa) the person gave: the published interaction equations
 *   tension + bending:      ft/Ft' + fb/Fb' <= 1
 *   compression + bending:  (fc/Fc')^2 + fb / (Fb' (1 - fc/FcE)) <= 1,  FcE = 0.822 Emin / (le/d)^2 about the strong axis.
 * Without an Fb, bending is reported as a stress (fb) and NOT checked (bendChecked false): no strength is invented.
 */
export function memberCheck(m, force, size, sp, { duration = 1, braceLen = 600, moment = 0, Fb = null } = {}) {
  const A = area(size), CD = duration > 0 ? duration : 1;
  const Sx = (size.b * size.d * size.d) / 6, fb = Math.abs(moment) * 1e6 / Sx, FbOk = Number.isFinite(Fb) && Fb > 0;
  const bend = { fb, moment: Math.abs(moment), bendChecked: !(Math.abs(moment) > 0) || FbOk };
  if (Math.abs(force) < 1e-6) return { kind: Math.abs(moment) > 0 ? 'B' : '0', util: FbOk ? fb / (Fb * CD) : 0, slender: false, le: m.len, ...bend };
  if (force > 0) { const ut = (force * 1000) / (sp.Ft * CD * A); return { kind: 'T', util: ut + (FbOk ? fb / (Fb * CD) : 0), slender: false, le: m.len, ...bend }; }
  const chord = m.role === 'top' || m.role === 'bottom';
  const lOut = chord ? Math.min(m.len, braceLen) : m.len;
  const slend = Math.max(m.len / size.d, lOut / size.b);
  const Fcs = sp.Fc * CD, FcE = (0.822 * sp.Emin) / (slend * slend), al = FcE / Fcs, c = 0.8;
  const q = (1 + al) / (2 * c), Cp = q - Math.sqrt(Math.max(0, q * q - al / c));
  const fc = (-force * 1000) / A, axial = fc / (Fcs * Cp);
  let util = axial;
  if (FbOk && fb > 0) {
    const FcEs = (0.822 * sp.Emin) / Math.pow(m.len / size.d, 2), amp = Math.max(0.05, 1 - fc / FcEs);
    util = axial * axial + fb / (Fb * CD * amp);
  }
  return { kind: 'C', util, slender: slend > 50, slend, le: m.len, Cp, ...bend };
}

/** Wrap one solve() result as the one-combination list the checks work on. */
const asCombos = (res, opts) => (Array.isArray(res) ? res : [{ name: 'service', CD: opts.duration || 1, forces: res.forces, moments: new Map() }]);
const groupOfRole = (r) => (r === 'post' || r === 'stub' ? 'web' : r);

/** The worst of all combinations for one member in one size: { ...memberCheck of the governing one, force, forceMax, forceMin, combo }. */
export function worstCase(m, size, sp, combos, opts = {}) {
  let best = null, fmax = -Infinity, fmin = Infinity;
  for (const c of combos) {
    const f = c.forces.get(m.id) ?? 0;
    fmax = Math.max(fmax, f); fmin = Math.min(fmin, f);
    const r = memberCheck(m, f, size, sp, { ...opts, duration: c.CD || opts.duration || 1, moment: c.moments && c.moments.get(m.id) || 0 });
    if (!best || r.util > best.util + 1e-12 || (best.kind === '0' && r.kind !== '0' && r.util >= best.util)) best = { ...r, force: f, combo: c.name };
  }
  return best ? { ...best, forceMax: fmax, forceMin: fmin } : { kind: '0', util: 0, force: 0, forceMax: 0, forceMin: 0, combo: '', le: m.len };
}

export function checkMembers(g, res, sizes, sp, opts = {}) {
  const combos = asCombos(res, opts), out = [];
  for (const m of live(g)) {
    const size = sizeById(sizes[groupOfRole(m.role) === 'web' ? 'web' : m.role === 'tail' ? 'top' : m.role]) || SIZES[1];
    const w = worstCase(m, size, sp, combos, { ...opts, Fb: opts.Fb });
    out.push({ id: m.id, mark: m.mark || 'M' + m.id, role: m.role, size: size.id, ...w });
  }
  return out;
}

/** The smallest size per group (top chord, bottom chord, webs and posts) that keeps every member of the group at or under 1.0 in every combination. */
export function autoSize(g, res, sp, opts = {}) {
  const combos = asCombos(res, opts), sizes = {}, groups = { top: ['top'], bottom: ['bottom'], web: ['web', 'post', 'stub'] };
  let ok = true;
  const okRes = combos.length && combos.every((c) => c.status === undefined || c.status === 'ok');
  for (const [grp, roles] of Object.entries(groups)) {
    const ms = live(g).filter((m) => roles.includes(m.role));
    if (!ms.length) { sizes[grp] = '2x4'; continue; }
    const cand = SIZES.filter((s) => (grp === 'web' ? true : s.id !== '2x3')).sort((a, b) => area(a) - area(b));
    let pick = null;
    for (const s of cand) if (ms.every((m) => worstCase(m, s, sp, combos, opts).util <= 1)) { pick = s; break; }
    if (!pick) { pick = cand[cand.length - 1]; ok = false; }
    sizes[grp] = pick.id;
  }
  const dTop = sizeById(sizes.top).d;   // a web deeper than the chord it meets does not fit the plate: keep webs no deeper than the top chord
  if (sizeById(sizes.web).d > dTop) sizes.web = sizeById(sizes.top).id;
  return { sizes, ok: ok && okRes !== false, rows: checkMembers(g, combos, sizes, sp, opts) };
}

/**
 * Vertical deflection estimate by virtual work (unit load at each bottom-chord joint): sum of N n L / (E A) over the members, N the member forces of
 * the service case, n the forces from a unit load. E is the species table's value (a labelled typical figure unless you gave your own).
 * Chord bending, joint slip and creep are NOT in it. → { max (mm, down), node, x, ratio (span / deflection) }
 */
export function deflection(g, forces, sizes, sp) {
  let best = { max: 0, node: null, x: 0 };
  const ms = solvable(g), bottoms = [...new Set(ms.filter((m) => m.role === 'bottom').flatMap((m) => [m.a, m.b]))].filter((id) => !g.supports.includes(id));
  for (const id of bottoms) {
    const u = solve(g, new Map([[id, 1]]));
    if (u.status !== 'ok') return null;
    let d = 0;
    for (const m of ms) {
      const grp = m.role === 'post' ? 'web' : m.role, size = sizeById(sizes[grp]) || SIZES[1];
      d += ((forces.get(m.id) ?? 0) * (u.forces.get(m.id) ?? 0) * m.len * 1000) / (sp.E * area(size));
    }
    if (d > best.max) best = { max: d, node: id, x: g.nodes[id].x };
  }
  return { ...best, ratio: best.max > 0 ? g.span / best.max : Infinity };
}
