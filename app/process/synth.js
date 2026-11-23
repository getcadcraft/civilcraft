/* SPDX-License-Identifier: Apache-2.0 */
/**
 * synth.js — "describe it, get a plant" (0.8 Track CH, CH.29). DOM-free. The assistant turns a person's description ("methanol from syngas, 500 t/d")
 * into the plain spec below; this builds the flowsheet, solves it, sizes the lines, and lays out a P&ID (pid add-on objects) and a 3D plant (plant
 * add-on equipment and runs), all linked in one living model (model.js). Nothing is drawn here: the host applies the result in suggest mode.
 *
 * spec = { name, components: [ids], model?: 'pr', feed: { flows | massFlows, T, P },
 *          steps: [ { type: 'pump'|'heater'|'cooler'|'compressor'|'valve'|'flash'|'reactor'|'column', id?, p: {…unit parameters}, use?: outlet index to continue with },… ],
 *          scale?: { stream: 'last' | id, comp, tPerDay }     rescale the feed so this stream carries that much of the component }
 * The chain is linear (each step takes the stream before it); a side outlet that is not continued with becomes a product stream.
 * Recycles (0.8 chem-draw_PART_4): a `splitter` step with `recycleAs: 'R'` names its second outlet R; a `mixer` step with `with: ['@R']` takes it back in. The flowsheet solver iterates the loop (tear streams, Wegstein).
 *
 *   build(spec, opts)  → { model, result, sizes, pid: { items: [...] }, plant: { equipment: [...], runs: [...] }, problems, summary }
 */
import { newModel, linkUnit, linkStream, solveModel, hydraulics, check, streamTable } from './model.js';
import { NPS_LIST, insideDiameter } from './hydraulics.js';
import { massFlow } from './stream.js';
import { COMPONENTS } from './data.js';

const TYPE = {   // step type → { flowsheet unit type, tag prefix, P&ID symbol, plant equipment type, outlets }
  pump: { unit: 'pump', prefix: 'P', sym: 'pump-cf', plant: 'pump-cf', outs: 1 },
  heater: { unit: 'heater', prefix: 'E', sym: 'exch-shell', plant: 'exch-shell', outs: 1 },
  cooler: { unit: 'heater', prefix: 'E', sym: 'exch-shell', plant: 'exch-shell', outs: 1 },
  compressor: { unit: 'compressor', prefix: 'K', sym: 'compressor', plant: 'pump-cf', outs: 1 },
  valve: { unit: 'valve', prefix: 'FV', sym: 'globe', plant: null, outs: 1 },
  flash: { unit: 'flash', prefix: 'V', sym: 'vessel-v', plant: 'vessel-v', outs: 2 },
  reactor: { unit: 'conversion', prefix: 'R', sym: 'reactor', plant: 'vessel-v', outs: 1 },
  column: { unit: 'shortcut', prefix: 'C', sym: 'column', plant: 'column', outs: 2 },
  mixer: { unit: 'mixer', prefix: 'M', sym: 'tank', plant: 'vessel-v', outs: 1 },          // chem-draw_PART_4: takes the stream before it and `with` (ids, or '@name' of a recycle made further on)
  splitter: { unit: 'splitter', prefix: 'X', sym: 'tank', plant: null, outs: 2 },         // p.fractions [continues, other]; `recycleAs: 'name'` sends the other outlet back to the mixers that ask for '@name'
};
const OUT_NAMES = { flash: ['vapour', 'liquid'], column: ['distillate', 'bottoms'] };
export const STEP_TYPES = Object.keys(TYPE);

/** The smallest nominal size whose velocity is at or under the target (m/s); the biggest when none is. */
export function pickSize(mdot, rho, vmax) {
  const Q = mdot / rho;
  for (const nps of NPS_LIST) { const D = insideDiameter(nps); if (Q / (Math.PI * D * D / 4) <= vmax) return nps; }
  return NPS_LIST[NPS_LIST.length - 1];
}

export function build(spec, { liquidV = 2, gasV = 15, spacing = 2500, pitch = 600 } = {}) {
  const comps = spec.components; if (!Array.isArray(comps) || !comps.length) throw new Error('the plant needs its components');
  for (const c of comps) if (!COMPONENTS[c]) throw new Error('unknown component ' + c + ' (define it first)');
  const feed = { ...spec.feed };
  const counters = {}, units = [], tags = {}, streamIds = [];
  let cur = 'S1', sCount = 1; const feeds = { S1: feed }; streamIds.push('S1');
  const nextS = () => 'S' + (++sCount);
  const outInfo = [], recycles = {};
  for (const step of spec.steps || []) {
    const T = TYPE[step.type]; if (!T) throw new Error('unknown step type ' + step.type + ' (use ' + STEP_TYPES.join(', ') + ')');
    counters[T.prefix] = (counters[T.prefix] || 100) + 1;
    const id = step.id || T.prefix + '-' + counters[T.prefix];
    const outs = Array.from({ length: T.outs }, nextS); streamIds.push(...outs);
    const p = { ...(step.p || {}) };
    if (step.type === 'cooler' && p.Tout == null && p.dT == null && p.duty == null) throw new Error(id + ': a cooler needs Tout, dT or duty');
    const ins = [cur, ...((step.type === 'mixer' ? step.with : null) || [])];
    if (step.type === 'splitter' && !Array.isArray(p.fractions)) throw new Error(id + ': a splitter needs p.fractions, e.g. [0.9, 0.1]');
    if (step.type === 'mixer' && !(step.with || []).length) throw new Error(id + ': a mixer needs `with` (a stream id, or "@name" of a recycle)');
    units.push({ id, type: T.unit, in: ins, out: outs, p, _step: step.type });
    if (step.recycleAs) recycles[String(step.recycleAs)] = outs[1];
    outInfo.push({ id, type: step.type, outs });
    cur = outs[Math.min(Math.max(step.use ?? 0, 0), outs.length - 1)];
  }
  for (const u of units) u.in = u.in.map((sid) => { if (!String(sid).startsWith('@')) return sid; const r = recycles[String(sid).slice(1)]; if (!r) throw new Error(u.id + ': no splitter makes the recycle ' + sid); return r; });
  const def = { v: 1, thermo: { components: comps, model: spec.model || 'pr', ...(spec.thermo || {}) }, feeds, units: units.map(({ _step, ...u }) => u) };
  const model = newModel(spec.name || 'Plant', def);
  let result = solveModel(model);
  // rescale the feed so a stream carries the asked-for rate (the unit operations are scale-invariant, so one rescale is exact)
  if (spec.scale) {
    const sid = spec.scale.stream === 'last' || !spec.scale.stream ? cur : spec.scale.stream, s = result.streams[sid], th = result._thermo;
    const ci = th.index(spec.scale.comp), nowKgS = s ? s.F * s.z[ci] * th.c[ci].MWkg : 0;
    if (!(nowKgS > 0)) throw new Error('stream ' + sid + ' carries no ' + spec.scale.comp + ' to scale to');
    const k = (spec.scale.tPerDay * 1000 / 86400) / nowKgS;
    const f = def.feeds.S1;
    if (f.flows) for (const c of Object.keys(f.flows)) f.flows[c] *= k; else if (f.massFlows) for (const c of Object.keys(f.massFlows)) f.massFlows[c] *= k; else f.F *= k;
    result = solveModel(model);
  }
  const th = result._thermo;
  // tags and line numbers; sizes from velocity targets
  const sizes = {};
  for (const u of units) linkUnit(model, u.id, { tag: u.id });
  let seq = 100;
  for (const id of streamIds) {
    const s = result.streams[id]; if (!s || !(s.F > 0)) continue;
    const mdot = massFlow(th, s);
    // density from a first pass on a 2 inch assumed line, then the size follows the velocity target
    linkStream(model, id, { ln: '', size: '2' });
    const h0 = hydraulics(model, result, {}).find((h) => h.id === id), rho = h0 ? h0.rho : 1;
    const vmax = h0 && h0.phase === 'liquid' ? liquidV : gasV, nps = pickSize(mdot, rho, vmax);
    const svc = (id === 'S1' ? 'PF' : h0 && h0.phase === 'gas' ? 'PG' : 'PL');
    const ln = `${nps}"-${svc}-${++seq}-A1A`;
    linkStream(model, id, { ln, size: nps }); sizes[id] = { nps, ln, v: null };
  }
  const hyd = hydraulics(model, result, {});
  for (const h of hyd) if (sizes[h.id]) sizes[h.id].v = h.v;
  const problems = [...result.problems, ...check(model, result, { hyd })];
  // ---- P&ID layout (pid add-on objects): equipment left to right, process lines between, a feed flow loop ----
  const items = [], L = 800;
  const xOf = (k) => (k + 1) * spacing, y0 = 0;
  const symW = { 'vessel-v': 0.5, column: 0.4, reactor: 0.5, 'exch-shell': 0.6, 'pump-cf': 0.75, compressor: 0.5, globe: 1 };
  const pidEq = [];
  units.forEach((u, k) => {
    const T = TYPE[u._step];
    const l = u._step === 'valve' ? 100 : L, data = { sym: T.sym, tag: u.id, l, act: u._step === 'valve' ? 'diaphragm' : 'none', desc: u._step, attrs: { svc: spec.name || '' } };
    items.push({ kind: 'pidsym', e: { x: xOf(k), y: y0, rot: 0 }, data }); pidEq.push({ uid: u.id, tag: u.id, type: T.sym });
  });
  const lineData = (id, pts, seqText) => { const l = model.links[id]; const m = /^(.+)"-(\w+)-(\d+)-(\w+)$/.exec(l.ln); return { pts, style: 'process', size: m[1] + '"', svc: m[2], seq: m[3], spec: m[4], insul: '', arrow: 'end', lbl: true, k: 100, th: 20 }; };
  const halfW = (u) => (symW[TYPE[u._step].sym] || 0.5) * (u._step === 'valve' ? 100 : L) / 2;
  const pids = [];
  // feed line into the first unit
  if (units.length) {
    const first = units[0], x1 = xOf(0) - halfW(first);
    items.push({ kind: 'pidline', data: lineData('S1', [[x1 - spacing * 0.8, y0], [x1, y0]]) });
    pids.push({ ln: model.links.S1.ln, size: model.links.S1.size, from: [], to: [first.id] });
  }
  units.forEach((u, k) => {
    u.out.forEach((sid, j) => {
      const l = model.links[sid]; if (!l) return;
      const nxt = units[k + 1], continues = nxt && nxt.in[0] === sid;
      const xa = xOf(k) + halfW(u), ya = y0 + (u.out.length > 1 ? (j === 0 ? pitch : -pitch) : 0);
      const ci = units.findIndex((x) => x.in.includes(sid)), back = ci >= 0 && ci <= k;          // a recycle: up, back over the units, down onto the mixer's inlet
      const yTop = y0 + 3 * pitch, pts = back ? [[xa, ya], [xa, yTop], [xOf(ci), yTop], [xOf(ci), y0 + 0.3 * L]] : continues ? [[xa, y0], [xOf(k + 1) - halfW(nxt), y0]] : [[xa, ya], [xa + spacing * 0.6, ya]];
      items.push({ kind: 'pidline', data: lineData(sid, pts) });
      pids.push({ ln: l.ln, size: l.size, from: [u.id], to: back ? [units[ci].id] : continues ? [nxt.id] : [] });
    });
  });
  // instruments: a flow loop on the feed (FT-101 measures, FIC-101 controls, FV-101 acts) when the first unit is not a valve
  const loops = [];
  if (units.length) {
    const fx = xOf(0) - spacing * 0.4;
    const inst = (sym, tag, x, y) => items.push({ kind: 'pidsym', e: { x, y, rot: 0 }, data: { sym, tag, l: 300, act: 'none', desc: '', attrs: {} } });
    inst('inst-field', 'FT-101', fx, y0 + 700); inst('inst-shared', 'FIC-101', fx + 600, y0 + 1400);
    items.push({ kind: 'pidsym', e: { x: fx + 600, y: y0, rot: 0 }, data: { sym: 'globe', tag: 'FV-101', l: 100, act: 'diaphragm', desc: 'feed flow control', attrs: {} } });
    loops.push('F101');
  }
  const pid = { items, desc: { equipment: pidEq, lines: pids } };
  // ---- 3D plant: equipment on a grid (mm), runs on a pipe rack ----
  const equipment = [], runs = [];
  units.forEach((u, k) => { const T = TYPE[u._step]; if (T.plant) equipment.push({ type: T.plant, tag: u.id, x: xOf(k) * 4, y: 0, z: 0, rot: 0, params: {} }); });
  const rackZ = 4500;
  units.forEach((u, k) => u.out.forEach((sid) => {
    const l = model.links[sid]; if (!l) return; const nxt = units[k + 1];
    if (!(nxt && nxt.in[0] === sid)) return;
    runs.push({ tag: l.ln, size: l.size, system: l.ln, from: { equip: u.id, nozzle: 'outlet' }, to: { equip: nxt.id, nozzle: 'inlet' }, rackZ, mat: 'steel', cls: 'sch40' });
  }));
  model.layout = { equipment, runs };
  const table = streamTable(model, result, { hyd });
  const prod = th ? Object.fromEntries(Object.entries(result.streams).filter(([id]) => !units.some((u) => u.in.includes(id)) && result.streams[id].F > 0).map(([id, s]) => [id, { kgPerDay: massFlow(th, s) * 86400 }])) : {};
  return { model, result, sizes, pid, plant: { equipment, runs }, table, problems, summary: { units: units.map((u) => u.id), streams: streamIds.length, products: prod, feedMassKgPerDay: massFlow(th, result.streams.S1) * 86400, loops } };
}
