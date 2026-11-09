/* SPDX-License-Identifier: Apache-2.0 */
/**
 * foreign.js — a CAPE-OPEN unit operation from someone else as a unit in OUR flowsheet (0.9 IND.3, the reverse adapter). DOM-free.
 *
 * In a flowsheet definition (flowsheet.js) the unit is { id, type: 'capeopen', in: [...], out: [...], p: { component: { progId | clsid, name },
 * inPorts: [port names, in the order of `in`], outPorts: [port names, in the order of `out`], params: { name: value } } }.
 *
 * The foreign unit gets one material object per port (material.js, on OUR property package, so it flashes with our thermo), Calculate runs, and
 * the outlets come back as streams. Its heat and work are not known in general: Q is the energy balance on our package (Σ out F·H − Σ in F·H),
 * W = 0, and the unit's own output parameters are kept on the unit's result (`outputs`).
 *
 * The flowsheet solver is synchronous and a foreign unit lives in another process (the COM shim), so `solveWithForeign(def, bridge)` runs the
 * solver, collects every foreign unit it reached with the inlets it had (each one throws "pending" and is retried), asks the bridge for those,
 * remembers the answers by inlet state, and solves again until nothing is pending. A flowsheet with no recycle through a foreign unit needs one
 * pass per foreign unit in a row; a recycle through one needs about one pass per recycle iteration (each pass is a full solve: fine for small
 * flowsheets, slow for big ones — a later version can hand the bridge to the solver directly).
 *
 *   registerForeignUnit()                    puts UNITS.capeopen in place (done on import)
 *   solveWithForeign(def, bridge, opts)      → the usual solve() result + foreign: { calls, passes }
 *   bridge = { create(component) → driver }  protocol.js remoteUnitDriver(peer, …) for the shim, or { create: () => localUnitDriver(unit) } in-process
 */
import { UNITS, fromFlash, emptyStream } from '../stream.js';
import { solve } from '../flowsheet.js';
import { CoPropertyPackage } from './package.js';
import { CoMaterial } from './material.js';

export const FOREIGN_TYPE = 'capeopen';
export const NO_BRIDGE = 'A CAPE-OPEN unit from another program runs only in CadCraft Studio on Windows, which has the bridge to it. Here the unit is skipped.';
class Pending extends Error { constructor() { super('waiting for the CAPE-OPEN unit (bridge call)'); this.pending = true; } }

let ctx = null;
const sig = (v) => (typeof v === 'number' ? Number(v.toPrecision(12)) : v);
const keyOf = (p, ins) => JSON.stringify([p.component, p.inPorts, p.outPorts, p.params || {}, ins.map((s) => [sig(s.F), s.z.map(sig), sig(s.T), sig(s.P)])]);

export function registerForeignUnit() {
  UNITS[FOREIGN_TYPE] = function capeopenUnit(th, ins, p) {
    if (!ctx) throw new Error(NO_BRIDGE);
    if (!p || !p.component || !Array.isArray(p.inPorts) || !Array.isArray(p.outPorts)) throw new Error('a CAPE-OPEN unit needs component, inPorts and outPorts');
    const k = keyOf(p, ins);
    if (ctx.memo.has(k)) { const r = ctx.memo.get(k); return { ...r, outs: r.outs.map((s) => ({ ...s, z: s.z.slice(), phases: s.phases.map((q) => ({ ...q, x: q.x.slice() })) })) }; }
    if (!ctx.pending.has(k)) ctx.pending.set(k, { th, ins, p });
    throw new Pending();
  };
}
registerForeignUnit();

function streamToMaterial(pp, s, name) {
  const m = new CoMaterial(pp, name);
  m.SetOverallProp('totalFlow', 'Mole', [s.F > 0 ? s.F : 0]); m.SetOverallProp('fraction', 'Mole', s.z.slice());
  m.SetOverallProp('temperature', '', [s.T]); m.SetOverallProp('pressure', '', [s.P]);
  if (s.F > 0) { m.SetOverallProp('enthalpy', 'Mole', [s.H]); m.CalcEquilibrium(['temperature', '', 'Overall'], ['pressure', '', 'Overall']); }
  return m;
}
function materialToStream(th, m) {
  const F = m.GetOverallProp('totalFlow', 'Mole')[0], z = m.GetOverallProp('fraction', 'Mole'), T = m.GetOverallProp('temperature', '')[0], P = m.GetOverallProp('pressure', '')[0];
  if (!(F > 0)) return { ...emptyStream(th), T, P, z };
  let H = null; try { H = m.GetOverallProp('enthalpy', 'Mole')[0]; } catch { H = null; }
  const fl = H != null && m.__hSet ? th.flashPH(P, H, z, T) : th.flashPT(T, P, z);
  return fromFlash(F, fl || th.flashPT(T, P, z));
}

/** Run one foreign unit once (any driver; every driver call may be a promise). */
export async function runForeign(th, ins, p, driver) {
  const pp = new CoPropertyPackage(th), mats = [];
  for (let i = 0; i < p.inPorts.length; i++) { const m = streamToMaterial(pp, ins[i] || emptyStream(th), p.inPorts[i]); mats.push(m); await driver.connect(p.inPorts[i], m); }
  const outs = p.outPorts.map((name) => {
    const m = new CoMaterial(pp, name);
    // a unit that writes an enthalpy and flashes PH leaves it there; mark writes so materialToStream knows the value is the unit's, not ours
    const set = m.SetOverallProp.bind(m); m.SetOverallProp = (prop, basis, v) => { if (prop === 'enthalpy') m.__hSet = true; return set(prop, basis, v); };
    return m;
  });
  for (let i = 0; i < outs.length; i++) await driver.connect(p.outPorts[i], outs[i]);
  for (const [k, v] of Object.entries(p.params || {})) await driver.setParameter(k, v);
  const val = await driver.validate(); if (val && val.valid === false) throw new Error('the CAPE-OPEN unit is not valid: ' + (val.message || 'no reason given'));
  await driver.calculate();
  const streams = outs.map((m) => materialToStream(th, m));
  const Hin = ins.reduce((s, x) => s + (x.F > 0 ? x.F * x.H : 0), 0), Hout = streams.reduce((s, x) => s + (x.F > 0 ? x.F * x.H : 0), 0);
  let outputs = []; try { outputs = await driver.outputs(); } catch { outputs = []; }
  return { outs: streams, Q: Hout - Hin, W: 0, notes: ['heat from the energy balance on CadCraft\'s package (the unit does not report its own)'], outputs, foreign: driver.name || p.component.name || p.component.progId };
}

/** Solve a flowsheet that has CAPE-OPEN units. bridge.create(component) → driver (cached per component + port list). */
export async function solveWithForeign(def, bridge, opts = {}) {
  const maxPasses = opts.maxPasses || 400, drivers = new Map();
  const me = { memo: new Map(), pending: new Map() };
  let res = null, passes = 0, calls = 0;
  try {
    for (passes = 1; passes <= maxPasses; passes++) {
      ctx = me; try { res = solve(def); } finally { ctx = null; }
      if (!me.pending.size) break;
      const work = [...me.pending]; me.pending.clear();
      for (const [k, w] of work) {
        const dk = JSON.stringify([w.p.component, w.p.inPorts, w.p.outPorts]);
        if (!drivers.has(dk)) drivers.set(dk, await bridge.create(w.p.component));
        me.memo.set(k, await runForeign(w.th, w.ins, w.p, drivers.get(dk))); calls++;
      }
    }
  } finally { for (const d of drivers.values()) { try { await d.terminate(); } catch { /* the unit may already be gone */ } } }
  res.problems = (res.problems || []).filter((x) => !String(x.message || x.text || '').includes('waiting for the CAPE-OPEN unit'));
  res.foreign = { calls, passes: Math.min(passes, maxPasses), finished: passes <= maxPasses };
  return res;
}
