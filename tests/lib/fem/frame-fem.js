/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-fem.js — what the Analysis panels of BimCraft and DetailCraft call for the finite element engine (0.9 SU.908 / SU.1056). DOM-free.
 * It takes the cleaned lib/frame model the panel already analysed (members, plates, floors, supports), hands it to lib/fem and returns what the
 * panel shows: the natural frequencies, periods and effective modal masses, and each mode as a result set the panel draws the way it draws
 * the deflected shape. One engine: the frame's static results stay lib/frame's (beams and plates); this file adds the modal analysis.
 * An analysis aid, not a code check; your engineer reviews the results.
 *
 *   modalOfFrame(model, { n = 6, bending = 'mitc4' }) → { ok, error?, rows: [{ n, hz, period, omega, mass: [X, Y, Z], cum: [X, Y, Z] }], total: [X, Y, Z] (kg),
 *       mass (kg, all elements), dofs, warnings: [{ code, … }], sys, modal }
 *   modeSolution(sol, out, k) → { sol, key } a copy of the frame solution holding mode k (0-based) as a result set `mode:k+1`, for the panel's drawing
 *   MODAL_NOTE
 * Carried from the model: members with their end releases, slabs and walls as flat four-node shells, supports (fixed and springs), rigid floors
 * (in plane). Mass: the density of each material times its volume (no applied loads are turned into mass: a load is not mass here). Warnings:
 *   'no-mass'   nothing has a density, so there is nothing to vibrate;  'few-modes' fewer modes than asked for exist
 *   'not-converged'  the eigen-solve did not settle in the passes allowed
 */
import { fromFrame } from './bim.js';
import { build, modal as solveModal, beamEnds, NOTE } from './model.js';

export const MODAL_NOTE = NOTE;
const AXES = [0, 1, 2];

export function modalOfFrame(model, { n = 6, bending = 'mitc4', masses = null } = {}) {
  const warnings = [];
  const conv = fromFrame(model);
  for (const s of conv.model.shells) s.bending = bending === 'dkq' ? 'dkq' : 'mitc4';
  if (masses && masses.length) conv.model.masses = masses;         // 0.9 dynamics: lumped masses made from load cases (frame-dyn.js massesFromCases)
  const hasMass = conv.model.beams.some((b) => b.rho) || conv.model.shells.some((s) => s.rho) || !!(masses && masses.length);
  if (!hasMass) return { ok: false, error: { code: 'no-mass' }, warnings, rows: [], total: [0, 0, 0], mass: 0, dofs: 0 };
  let sys;
  try { sys = build(conv.model); } catch (e) { return { ok: false, error: { code: 'internal', message: e.message }, warnings, rows: [], total: [0, 0, 0], mass: 0, dofs: 0 }; }
  if (!sys.ndof) return { ok: false, error: { code: 'no-dofs' }, warnings, rows: [], total: [0, 0, 0], mass: 0, dofs: 0 };
  const want = Math.max(1, Math.min(60, Math.floor(n) || 1));
  const res = solveModal(sys, Math.min(want, sys.ndof), { maxIter: 80 });
  if (!res.ok) warnings.push({ code: 'not-converged' });
  if (res.freqHz.length < want) warnings.push({ code: 'few-modes', n: res.freqHz.length });
  // influence vectors of the three translations (reduced dofs that are a translation along the axis), total mass r' M r
  const dirOf = new Int8Array(sys.ndof).fill(-1);
  for (let d = 0; d < sys.red.length; d++) if (sys.red[d] >= 0) dirOf[sys.red[d]] = d % 6;
  const M = sys.M, mr = AXES.map((a) => {
    const r = new Float64Array(sys.ndof); for (let i = 0; i < sys.ndof; i++) if (dirOf[i] === a) r[i] = 1;
    const y = new Float64Array(sys.ndof);
    for (let i = 0; i < sys.ndof; i++) { let s = 0; for (let p = M.ptr[i]; p < M.ptr[i + 1]; p++) s += M.val[p] * r[M.col[p]]; y[i] = s; }
    return { r, y };
  });
  const total = mr.map(({ r, y }) => { let s = 0; for (let i = 0; i < r.length; i++) s += r[i] * y[i]; return s * 1000; });   // tonne → kg
  const cum = [0, 0, 0], rows = [];
  res.modes.forEach((full, k) => {
    // the mode in reduced coordinates, M-normalised by modal() already; Γ = φ' M r, effective mass Γ²
    const mass = mr.map(({ y }, a) => { let g = 0; for (let d = 0; d < sys.red.length; d++) if (sys.red[d] >= 0) g += full[d] * y[sys.red[d]]; return g * g * 1000; });
    for (const a of AXES) cum[a] += mass[a];
    rows.push({ n: k + 1, hz: res.freqHz[k], omega: res.omega[k], period: res.freqHz[k] > 0 ? 1 / res.freqHz[k] : Infinity, mass, cum: [...cum] });
  });
  // the whole mass of the elements: the sum of the x-translation block of every element's mass matrix (held nodes included)
  let mass = 0;
  for (const e of sys.el) { const m = e.m(); if (!m) continue; const nn = e.dofs.length; for (let a = 0; a < nn; a++) if (e.dofs[a] % 6 === 0) for (let b = 0; b < nn; b++) if (e.dofs[b] % 6 === 0) mass += m[a * nn + b]; }
  for (const q of conv.model.masses || []) if (sys.red[6 * q.node] >= 0 || sys.slave.has(6 * q.node)) mass += q.m[0];
  return { ok: true, rows, total, mass: mass * 1000, dofs: sys.ndof, warnings, sys, modal: res, conv };
}

/** A copy of the frame solution with mode k (0-based) as the result set `mode:k+1`: its displacements, and the end forces of the members it bends. */
export function modeSolution(sol, out, k) {
  const full = out.modal.modes[k], key = 'mode:' + (k + 1);
  const nn = out.conv.model.nodes.length, u = new Float64Array(6 * nn);
  for (let d = 0; d < u.length; d++) u[d] = full[d] || 0;
  const ends = new Float64Array(12 * out.conv.model.beams.length);
  out.conv.model.beams.forEach((_, m) => { ends.set(beamEnds(out.sys, full, m), 12 * m); });
  const base = Object.values(sol.results)[0];
  const R = { ...base, id: key, kind: 'mode', name: 'Mode ' + (k + 1), u, ends, loads: out.conv.model.beams.map(() => []), reactions: new Float64Array(6 * nn), second: undefined };
  return { sol: { ...sol, results: { [key]: R } }, key };
}

