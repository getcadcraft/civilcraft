/* SPDX-License-Identifier: Apache-2.0 */
/**
 * quantities.js — what a pool takes to build (0.11 POOL.1), from the elements build.js made. Host-free. Results in m, m², m³, kg and counts.
 * These are take-off quantities for a first estimate. The steel is an ESTIMATE from a ratio (ratio × concrete volume × 7850 kg/m³ × two
 * directions), not a bar schedule; the excavation is a box with 600 mm of working space, not an earthworks design.
 */
const STEEL = 7850;

/**
 * → { rows: [{ id, group, value, unit, note? }], pipes: [{ system, dn, length m, bends, junctions }], bars: [bar marks], byId }
 * extra = { net (network.js: the pipes are its segments and fittings, tails and machine room included), rebar (rebar.js bars()) }. With
 * rebarMode 'bars' the shell's steel is the bar schedule's mass (the machine room stays an estimate from the ratio).
 */
export function quantities(d, circ, steps, built, extra = {}) {
  const { elements, layout, metrics: M } = built;
  const vol = (pred) => elements.filter(pred).reduce((s, e) => s + e.qty.volume, 0) / 1e9;
  const shellConcrete = vol((e) => e.group === 'shell' && e.material === 'concrete');
  const roomConcrete = vol((e) => e.group === 'room' && e.material === 'concrete');
  const concrete = shellConcrete + roomConcrete;
  const tileArea = (M.tileFloor + M.tileWalls + M.tileSteps) / 1e6;
  const per = (a, l, w, j, waste) => Math.ceil(((a * 1e6) / ((l + j) * (w + j))) * (1 + waste) - 1e-9);
  const rows = [
    { id: 'water', group: 'water', value: circ.volume, unit: 'm3' },
    { id: 'surface', group: 'water', value: circ.surface, unit: 'm2' },
    { id: 'concrete.shell', group: 'shell', value: shellConcrete, unit: 'm3' },
    { id: 'concrete.room', group: 'shell', value: roomConcrete, unit: 'm3' },
    { id: 'formwork', group: 'shell', value: M.formwork / 1e6, unit: 'm2', note: 'estimate' },
    ...(d.rebarMode === 'bars' && extra.rebar
      ? [{ id: 'steel.bars', group: 'shell', value: extra.rebar.mass, unit: 'kg' }, { id: 'steel.room', group: 'shell', value: 2 * d.rebarRatio * roomConcrete * STEEL, unit: 'kg', note: 'estimate' }]
      : [{ id: 'steel', group: 'shell', value: 2 * d.rebarRatio * concrete * STEEL, unit: 'kg', note: 'estimate' }]),
    { id: 'excavation', group: 'shell', value: M.excavation / 1e9, unit: 'm3', note: 'estimate' },
    { id: 'tile.floor', group: 'finish', value: M.tileFloor / 1e6, unit: 'm2' },
    { id: 'tile.walls', group: 'finish', value: M.tileWalls / 1e6, unit: 'm2' },
    { id: 'tile.steps', group: 'finish', value: M.tileSteps / 1e6, unit: 'm2' },
    { id: 'tile.count', group: 'finish', value: d.finish > 0 ? per(tileArea, d.tileL, d.tileW, d.joint, d.waste) : 0, unit: 'n' },
    { id: 'coping', group: 'surround', value: M.copingLength / 1000, unit: 'm' },
    { id: 'paving', group: 'surround', value: M.pavingArea / 1e6, unit: 'm2' },
    { id: 'paving.count', group: 'surround', value: per(M.pavingArea / 1e6, d.paverL, d.paverW, d.joint, d.waste), unit: 'n' },
    { id: 'grating', group: 'surround', value: (M.gratingLength || 0) / 1000, unit: 'm' },
    { id: 'barrier', group: 'surround', value: (M.barrierLength || 0) / 1000, unit: 'm' },
    { id: 'gate', group: 'surround', value: elements.filter((e) => e.ifc === 'IFCDOOR').length, unit: 'n' },
    { id: 'benches', group: 'shell', value: elements.filter((e) => e.objectType === 'POOLBENCH').length, unit: 'n' },
    { id: 'filters', group: 'equipment', value: circ.filter.count, unit: 'n' },
    { id: 'pumps', group: 'equipment', value: circ.pump.count, unit: 'n' },
    { id: 'skimmers', group: 'equipment', value: circ.skimmers, unit: 'n' },
    { id: 'inlets', group: 'equipment', value: circ.inlets, unit: 'n' },
    { id: 'drains', group: 'equipment', value: circ.drains, unit: 'n' },
    { id: 'jets', group: 'equipment', value: circ.jets, unit: 'n' },
    ...(extra.net ? [
      { id: 'fittings.bend', group: 'pipes', value: extra.net.fittings.filter((f) => f.kind === 'BEND').length, unit: 'n' },
      { id: 'fittings.junction', group: 'pipes', value: extra.net.fittings.filter((f) => f.kind === 'JUNCTION').length, unit: 'n' },
    ] : []),
  ].filter((r) => r.value > 0 || r.id === 'water');
  if (extra.net) {
    const by = new Map();
    const row = (system, dn) => { const k = system + ':' + dn; if (!by.has(k)) by.set(k, { system, dn, length: 0, bends: 0, junctions: 0 }); return by.get(k); };
    for (const sg of extra.net.segments) row(sg.system, sg.dn).length += Math.hypot(sg.b[0] - sg.a[0], sg.b[1] - sg.a[1], sg.b[2] - sg.a[2]) / 1000;
    for (const f of extra.net.fittings) { const r = row(f.system, f.dn); if (f.kind === 'BEND') r.bends++; else r.junctions++; }
    const pipes = [...by.values()].sort((a, b) => a.system.localeCompare(b.system) || a.dn - b.dn);
    return { rows, pipes, bars: extra.rebar ? extra.rebar.marks : [], byId: Object.fromEntries(rows.map((r) => [r.id, r.value])) };
  }
  const by = new Map();
  for (const p of layout.pipes) {
    const k = p.system + ':' + p.dn, len = p.pts.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p.pts[i - 1][0], q[1] - p.pts[i - 1][1], q[2] - p.pts[i - 1][2]) : 0), 0);
    const r = by.get(k) || { system: p.system, dn: p.dn, length: 0, bends: 0 };
    r.length += len / 1000; r.bends += Math.max(0, p.pts.length - 2); by.set(k, r);
  }
  const pipes = [...by.values()].sort((a, b) => a.system.localeCompare(b.system) || a.dn - b.dn);
  return { rows, pipes, bars: extra.rebar ? extra.rebar.marks : [], byId: Object.fromEntries(rows.map((r) => [r.id, r.value])) };
}
