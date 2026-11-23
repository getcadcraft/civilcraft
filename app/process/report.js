/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report.js — mass and energy balance reports and the Problems for a solved flowsheet (0.8 Track CH, CH.2; DOM-free).
 * Problems use the shared shape (docs/0.8-PROBLEMS-SPEC.md § 1): { id, code, severity, text, about, source: { kind: 'engine', name }, req, found }.
 */
import { atoms } from './data.js';

const sum = (a) => a.reduce((s, v) => s + v, 0);
const SRC = { kind: 'engine', name: 'process' };
export function problem(code, severity, text, about = [], extra = {}) { return { id: 'process:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: SRC, ...extra }; }

/** Atom flows (mol/s) of a stream. */
export function atomFlows(th, s) {
  const out = {}; for (let i = 0; i < th.n; i++) { const a = atoms(th.c[i].formula || ''); for (const [k, v] of Object.entries(a)) out[k] = (out[k] || 0) + s.F * s.z[i] * v; } return out;
}
const addTo = (acc, o, sign = 1) => { for (const [k, v] of Object.entries(o)) acc[k] = (acc[k] || 0) + sign * v; };

export function balanceReport(th, def, res, tol = {}) {
  const tm = tol.mass ?? 1e-6, te = tol.energy ?? 1e-6, problems = [], units = [];
  const S = res.streams, enth = (s) => s.F * s.H, mass = (s) => s.F * th.mwMix(s.z);
  for (const u of def.units) {
    const ins = u.in.map((id) => S[id]).filter(Boolean), outs = (u.out || []).map((id) => S[id]).filter(Boolean), info = res.units[u.id] || {};
    const mIn = sum(ins.map(mass)), mOut = sum(outs.map(mass)), Hin = sum(ins.map(enth)), Hout = sum(outs.map(enth));
    const comp = th.ids.map((id, i) => ({ id, in: sum(ins.map((s) => s.F * s.z[i])), out: sum(outs.map((s) => s.F * s.z[i])) }));
    const aIn = {}, aOut = {}; ins.forEach((s) => addTo(aIn, atomFlows(th, s))); outs.forEach((s) => addTo(aOut, atomFlows(th, s)));
    let atomErr = 0; for (const k of new Set([...Object.keys(aIn), ...Object.keys(aOut)])) atomErr = Math.max(atomErr, Math.abs((aIn[k] || 0) - (aOut[k] || 0)) / (Math.abs(aIn[k] || 0) + 1e-30));
    const Q = (info.Q || 0), W = (info.W || 0), eScale = Math.max(Math.abs(Hin), Math.abs(Hout), Math.abs(Q), Math.abs(W), 1);
    const eErr = (Hin + Q + W - Hout) / eScale, mErr = mIn > 0 ? (mOut - mIn) / mIn : 0;
    const row = { unit: u.id, type: u.type, massIn: mIn, massOut: mOut, massError: mErr, atomError: atomErr, Hin, Hout, Q, W, energyError: eErr, components: comp };
    units.push(row);
    const about = [{ kind: 'unit', id: u.id }];
    if (Math.abs(mErr) > tm) problems.push(problem('balance.mass', 'error', `Mass balance of ${u.id} does not close (${(mErr * 100).toExponential(2)} %).`, about, { req: { op: '=', value: 0, unit: 'rel' }, found: { value: mErr, unit: 'rel' } }));
    if (atomErr > tm) problems.push(problem('balance.atoms', 'error', `Atom balance of ${u.id} does not close (${atomErr.toExponential(2)}).`, about, { req: { op: '=', value: 0, unit: 'rel' }, found: { value: atomErr, unit: 'rel' } }));
    if (Math.abs(eErr) > te) problems.push(problem('balance.energy', 'warning', `Energy balance of ${u.id} does not close (${eErr.toExponential(2)} of the larger enthalpy flow).`, about, { req: { op: '=', value: 0, unit: 'rel' }, found: { value: eErr, unit: 'rel' } }));
    for (const n of info.notes || []) problems.push(problem('unit.note.' + u.id + '.' + n.slice(0, 24).replace(/\W+/g, '_'), 'warning', `${u.id}: ${n}`, about));
  }
  // overall: streams nobody produces are feeds, nobody consumes are products
  const made = new Set(def.units.flatMap((u) => u.out || [])), used = new Set(def.units.flatMap((u) => u.in));
  const feeds = Object.keys(S).filter((id) => !made.has(id) && used.has(id)), prods = Object.keys(S).filter((id) => made.has(id) && !used.has(id));
  const mF = sum(feeds.map((id) => mass(S[id]))), mP = sum(prods.map((id) => mass(S[id]))), HF = sum(feeds.map((id) => enth(S[id]))), HP = sum(prods.map((id) => enth(S[id])));
  const Qt = sum(def.units.map((u) => (res.units[u.id] || {}).Q || 0)), Wt = sum(def.units.map((u) => (res.units[u.id] || {}).W || 0));
  const aF = {}, aP = {}; feeds.forEach((id) => addTo(aF, atomFlows(th, S[id]))); prods.forEach((id) => addTo(aP, atomFlows(th, S[id])));
  const overall = { feeds, products: prods, massIn: mF, massOut: mP, massError: mF > 0 ? (mP - mF) / mF : 0, Hin: HF, Hout: HP, Q: Qt, W: Wt, energyError: (HF + Qt + Wt - HP) / Math.max(Math.abs(HF), Math.abs(HP), Math.abs(Qt), Math.abs(Wt), 1), atomsIn: aF, atomsOut: aP };
  if (feeds.length && Math.abs(overall.massError) > tm) problems.push(problem('balance.overall.mass', 'error', `Overall mass balance does not close (${overall.massError.toExponential(2)}).`, [{ kind: 'flowsheet', id: 'overall' }]));
  if (feeds.length && Math.abs(overall.energyError) > te) problems.push(problem('balance.overall.energy', 'warning', `Overall energy balance does not close (${overall.energyError.toExponential(2)}).`, [{ kind: 'flowsheet', id: 'overall' }]));
  return { units, overall, problems };
}
