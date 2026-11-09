/* SPDX-License-Identifier: Apache-2.0 */
/**
 * panels-model.js — what the three panels list, as plain rows (DOM-free, node-tested). ui.js only draws these.
 */
import { layoutStats, hierarchyTree, topCells } from './layout.js';
import { layerInfo, mapFromLayerNames } from './layermap.js';
import { sdcSummary } from './sdc.js';
import { netSummary } from './spef.js';
import { sdfDelays } from './sdf.js';
import { num } from './problem.js';

/** Layer list: one row per layer/datatype used, with name, colour, stored and placed-out counts. */
export function layerRows(lib, map, top) {
  const m = map || (lib.layerNames ? mapFromLayerNames(lib.layerNames) : null), s = layoutStats(lib, top);
  return s.layers.map((l) => { const i = layerInfo(m, l.layer, l.datatype); return { key: l.layer + '/' + l.datatype, layer: l.layer, datatype: l.datatype, name: i.name, color: i.color, mapped: i.mapped, purpose: i.purpose, stored: l.stored, flat: l.flat }; });
}
/** Hierarchy rows for a tree list: depth-first, children shown only for open nodes (open = Set of paths "TOP/A/B"). */
export function hierarchyRows(lib, top, open = new Set()) {
  const rows = [], walk = (n, depth, path) => { const p = path ? path + '/' + n.name : n.name; rows.push({ name: n.name, path: p, depth, placed: n.placed, kids: n.children.length, open: open.has(p), missing: n.missing, loop: n.loop }); if (open.has(p)) for (const c of n.children) walk(c, depth + 1, p); };
  walk(hierarchyTree(lib, top), 0, ''); return rows;
}
export function defaultTop(lib) { const t = topCells(lib); return t.length ? t[t.length - 1] : lib.order[0]; }

/** Library rows from Liberty and/or LEF: one per cell name (both joined). Sizes in µm, area in the Liberty's units. */
export function libraryRows(lib, lef) {
  const by = new Map();
  for (const c of lib?.cells || []) by.set(c.name, { name: c.name, area: c.area, leakage: c.leakage, pins: c.pins.map((p) => p.name + (p.direction ? ' (' + p.direction + ')' : '')), arcs: c.pins.reduce((s, p) => s + p.timing.length, 0), seq: c.ff ? 'flip-flop' : c.latch ? 'latch' : '' });
  for (const m of lef?.macros || []) { const r = by.get(m.name) || { name: m.name, pins: m.pins.map((p) => p.name) }; r.size = m.size; r.cls = m.class; r.lefPins = m.pins.length; by.set(m.name, r); }
  return [...by.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Constraint rows in plain words, grouped. t(key, vars) gives the words (keys chip.fmt.sdc.*). */
export function constraintRows(commands, t) {
  const s = sdcSummary(commands), u = s.units.time || 'ns', rows = [], L = (x) => (x && x.length ? x.join(' ') : '—');
  for (const c of s.clocks) rows.push({ group: 'clock', line: c.line, text: t('chip.fmt.sdc.clock', { name: c.name, period: num(c.period), unit: u, rise: num(c.waveform[0]), fall: num(c.waveform[1]), on: L(c.sources) }) });
  for (const c of s.generatedClocks) rows.push({ group: 'clock', line: c.line, text: t('chip.fmt.sdc.genclock', { name: c.name, from: L(c.source), by: c.divideBy ? '÷' + c.divideBy : c.multiplyBy ? '×' + c.multiplyBy : '1', on: L(c.targets) }) });
  for (const d of s.inputDelays) rows.push({ group: 'io', line: d.line, text: t('chip.fmt.sdc.indelay', { value: num(d.value), unit: u, clock: d.clock || '—', on: L(d.targets), which: d.minmax }) });
  for (const d of s.outputDelays) rows.push({ group: 'io', line: d.line, text: t('chip.fmt.sdc.outdelay', { value: num(d.value), unit: u, clock: d.clock || '—', on: L(d.targets), which: d.minmax }) });
  for (const e of s.exceptions) rows.push({ group: 'exception', line: e.line, text: t('chip.fmt.sdc.' + e.kind, { value: e.value === undefined ? '' : num(e.value), unit: u, from: L(e.from), to: L(e.to), through: L(e.through) }) });
  for (const l of s.loads) rows.push({ group: 'env', line: l.line, text: t('chip.fmt.sdc.load', { value: num(l.value), unit: s.units.capacitance || 'pF', on: L(l.targets) }) });
  for (const d of s.drives) rows.push({ group: 'env', line: d.line, text: t('chip.fmt.sdc.drive', { cell: d.cell || '—', on: L(d.targets) }) });
  for (const g of s.groups) rows.push({ group: 'clock', line: g.line, text: t('chip.fmt.sdc.groups', { kind: g.kind, groups: g.groups.map((x) => '{' + x.join(' ') + '}').join(' ') }) });
  for (const [k, n] of Object.entries(s.other)) if (k !== 'set') rows.push({ group: 'other', text: t('chip.fmt.sdc.other', { cmd: k, n }) });
  return rows;
}
export function parasiticRows(spef) { return spef.nets.map(netSummary); }
export function delayRows(sdf, corner) { return sdfDelays(sdf, corner); }

/** Signals for a STIL pattern from a DEF's pins (or a list of names) and the SDC's clocks: clocks pulse inside the period. */
export function stilSignals({ def, ports, sdc } = {}) {
  const sig = [];
  if (def) for (const p of def.pins) { if (p.use === 'POWER' || p.use === 'GROUND' || p.special) continue; sig.push({ name: p.name, dir: p.direction === 'OUTPUT' ? 'Out' : p.direction === 'INOUT' ? 'InOut' : 'In' }); }
  else for (const p of ports || []) sig.push({ name: p.name || p, dir: p.dir || 'In' });
  let period;
  if (sdc) { const s = sdcSummary(sdc); for (const c of s.clocks) { period ??= c.period; for (const src of c.sources) { const x = sig.find((q) => q.name === src); if (x) x.clock = { rise: c.waveform[0] || c.period * 0.25, fall: c.waveform[1] }; } } }
  // a clock that rises at 0 is moved to a quarter period so the pulse sits inside the cycle
  for (const x of sig) if (x.clock && x.clock.rise === 0) x.clock.rise = (period || 10) / 4;
  return { signals: sig, period };
}
/** Vectors typed one per line (spaces ignored, # comments). */
export function parseVectors(text) { return String(text).split(/\r?\n/).map((l) => l.replace(/#.*$/, '').replace(/\s+/g, '')).filter(Boolean); }
