/* SPDX-License-Identifier: Apache-2.0 */
/**
 * asm.js — shared pieces for the activated sludge model family beside ASM1 (0.11 CH.35, session water-b-11; DOM-free, imports only lib/process).
 * A model is plain data: { id, name, COMP, INFO, PROCESSES, PAR, composition(par), stoich(par), rates(c, par), particulate, solids, conserved, sources, review }.
 * The ASM1 engine stays in water.js (water-a-11's file). This file adds what ASM3 (asm3.js) and ASM2d (asm2d.js) need around it:
 *
 *   deriveRow(known, unknowns, comp, quantities)   fill the "?" coefficients of one Petersen row from continuity (COD, N, P, charge, TSS), as the
 *                                                  IWA task group writes them: every unknown solved from the conservation equations it appears in
 *   continuity(model, par)                         every row times every composition column: the residual per process and quantity (must be ~0)
 *   plantSteady(model, plant)                      water.js plantSteady + Problems for bad inputs + the continuity of every conserved quantity
 *   checkPlant(model, plant)                       Problems for out-of-range inputs, before anything runs
 *
 * plantSteady: the solver is water.js's `plantSteady(model, plant)` (water-a-11 exported it on 2026-11-22 for these models), imported, never copied. A model here
 * therefore also carries water.js's model shape: STOICH, cod, n, n2, oxygenSpecies, particulate, solids, signed, seed (and tss, temperature, p where defined).
 */
import { solveLinear } from '../numeric.js';
import { problem as baseProblem } from '../report.js';
import * as W from './water.js';

const SRC = { kind: 'engine', name: 'process.env' };
export const problem = (code, severity, text, about = [], extra = {}) => { const p = baseProblem('asm.' + code, severity, text, about, extra); p.source = SRC; return p; };
const pos = (v) => (v > 0 ? v : 0);
export { pos };

/**
 * One Petersen row from continuity. known { comp: coefficient }; unknowns: list of directions, each a component name or { comp: weight } (a tied pair, e.g. NOX
 * and N2 in an anoxic row: { SNOX: 1, SN2: -1 }); comp { quantity: { comp: factor } }; quantities: the conserved ones to use. The unknowns are solved in the least
 * squares sense over those equations (exact when the row can close); `residual` is the largest imbalance left (the caller's test says it must be ~0).
 */
export function deriveRow(known, unknowns, comp, quantities) {
  const dirs = unknowns.map((u) => (typeof u === 'string' ? { [u]: 1 } : u));
  const qf = (q, o) => Object.entries(o).reduce((s, [k, v]) => s + v * (comp[q][k] || 0), 0);
  const A = quantities.map((q) => dirs.map((d) => qf(q, d))), b = quantities.map((q) => -qf(q, known));
  const n = dirs.length, AtA = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A.reduce((s, r) => s + r[i] * r[j], 0)));
  const Atb = Array.from({ length: n }, (_, i) => A.reduce((s, r, k) => s + r[i] * b[k], 0));
  for (let i = 0; i < n; i++) if (Math.abs(AtA[i][i]) < 1e-300) AtA[i][i] = 1;   // an unknown no equation touches stays 0
  const x = n ? solveLinear(AtA, Atb) : [];
  const row = { ...known };
  dirs.forEach((d, i) => { for (const [k, w] of Object.entries(d)) row[k] = (row[k] || 0) + w * x[i]; });
  const residual = Math.max(0, ...quantities.map((q) => Math.abs(qf(q, row))));
  return { row, residual };
}

/** Continuity of a whole matrix: { rows: [{ process, q: { quantity: residual } }], worst }. */
export function continuity(model, par = model.PAR) {
  const comp = model.composition(par), M = model.STOICH(par), rows = [];
  let worst = 0;
  M.forEach((r, j) => {
    const q = {};
    for (const name of model.conserved) { const s = Object.entries(r).reduce((a, [k, v]) => a + v * (comp[name][k] || 0), 0); q[name] = s; worst = Math.max(worst, Math.abs(s)); }
    rows.push({ process: model.PROCESSES[j], q });
  });
  return { rows, worst };
}

/** The reaction rate of every component (object), g/m3/d, from a model's matrix and rates. */
export function derivs(model, c, par = model.PAR) {
  const rho = model.rates(c, par), M = model.STOICH(par), out = {};
  for (const k of model.COMP) { let s = 0; for (let j = 0; j < M.length; j++) s += (M[j][k] || 0) * rho[j]; out[k] = s; }
  return out;
}

/** Problems for a plant before it runs: flows, capture, volumes, aeration, influent. */
export function checkPlant(model, plant) {
  const ps = [], about = [{ kind: 'plant', id: 'plant' }], T = plant?.tanks || [];
  if (!T.length) ps.push(problem('tanks', 'error', 'A plant needs at least one tank.', about));
  for (const t of T) {
    if (!(t.V > 0)) ps.push(problem('volume', 'error', `Tank ${t.id} needs a volume above 0 m3.`, [{ kind: 'tank', id: String(t.id) }]));
    if (t.aerated && !(t.KLa >= 0) && t.SOfixed == null) ps.push(problem('kla', 'error', `Aerated tank ${t.id} needs KLa (1/d) or a fixed oxygen level.`, [{ kind: 'tank', id: String(t.id) }]));
    if (t.KLa > 2000) ps.push(problem('kla.high', 'warning', `KLa ${t.KLa} 1/d in tank ${t.id} is far above what diffused aeration gives; check the units (1/d).`, [{ kind: 'tank', id: String(t.id) }]));
  }
  const { Qin, Qint = 0, Qr, Qw } = plant || {};
  if (!(Qin > 0)) ps.push(problem('qin', 'error', 'The influent flow Qin must be above 0 m3/d.', about));
  if (!(Qr >= 0 && Qw >= 0 && Qint >= 0)) ps.push(problem('flows', 'error', 'Return sludge Qr, waste sludge Qw and internal recycle Qint cannot be negative.', about));
  if (Qin > 0 && !(Qw < Qin)) ps.push(problem('qw', 'error', 'The waste sludge flow Qw must be less than Qin (the effluent is Qin - Qw).', about));
  const settler = plant?.settler != null && plant.settler !== false;
  if (settler && typeof model.tss !== 'function') ps.push(problem('settler.tss', 'error', `${model.name} has no solids conversion here, so the layered settler cannot be used with it: give a clarifier capture instead.`, about));
  if (!settler && !(plant?.capture >= 0 && plant.capture <= 1)) ps.push(problem('capture', 'error', 'Give the clarifier capture of particulates as a fraction from 0 to 1 (or a settler); no default is assumed.', about));
  else if (!settler && plant.capture < 0.9) ps.push(problem('capture.low', 'warning', `A capture of ${plant.capture} loses ${((1 - plant.capture) * 100).toFixed(0)} % of the solids over the weir every pass: the sludge age will be short.`, about));
  const inf = plant?.influent || {};
  for (const k of Object.keys(inf)) {
    if (!model.COMP.includes(k)) ps.push(problem('influent.unknown', 'warning', `Influent component ${k} is not a ${model.name} component and is ignored (components: ${model.COMP.join(', ')}).`, about));
    else if (!(Number.isFinite(inf[k]))) ps.push(problem('influent.nan', 'error', `Influent ${k} is not a number.`, about));
    else if (inf[k] < 0 && k !== model.alk) ps.push(problem('influent.negative', 'error', `Influent ${k} is negative (${inf[k]}).`, about));
  }
  return ps;
}

/**
 * Steady state of a plant for any model of this family, through water.js's plantSteady (water-a-11's solver: pseudo-transient continuation, capture or the layered
 * settler, temperature through model.temperature). Out-of-range inputs come back as Problems (checkPlant) instead of a thrown error; the result also carries the
 * full continuity balances of the model's conserved quantities (P and charge too), which water.js's COD and N balances do not show.
 */
export function plantSteady(model, plant) {
  const pre = checkPlant(model, plant);
  if (pre.some((p) => p.severity === 'error')) { const e = new Error(pre.filter((p) => p.severity === 'error').map((p) => p.text).join(' ')); e.problems = pre; throw e; }
  const r = W.plantSteady(model, plant);
  r.problems = pre.concat(r.problems || []);
  if (model.alk && r.tanks.some((t) => t.c[model.alk] < 0.5)) r.problems.push(problem('alkalinity', 'warning', 'Alkalinity falls below 0.5 mol/m3 in a tank: nitrification is limited by it. The dosing calculator gives the lime or caustic to restore it.', [{ kind: 'plant', id: 'plant' }]));
  if (model.conserved.includes('P') && r.balances.p && r.converged && Math.abs(r.balances.p.rel) > 1e-3) r.problems.push(problem('balance.p', 'error', `Phosphorus balance does not close (${(r.balances.p.rel * 100).toFixed(3)} %).`, [{ kind: 'plant', id: 'plant' }]));
  r.matrix = continuity(model, { ...model.PAR, ...(plant.par || {}) });
  r.notes = [model.note, ...(r.notes || [])].filter(Boolean);
  return r;
}
