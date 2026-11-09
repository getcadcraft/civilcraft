/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library; names go through the panel's words (twin.cell.<id>). */
/**
 * templates.js — ready cells as data (0.9 TW.8), built by snapping flow items port to port, plus the bill of materials (TW.9). Add a cell = one entry in CELLS. DOM-free; the flow code is handed in.
 *
 *   CELLS · buildCell(id, flow {newLayout, addAfter, defaults}) → { layout, looks }
 *   billOfMaterials(layout) → [{ code, qty, unit, what, items }] · bomCsv(rows)
 * A step: { kind, params, look, eye: at (metres; adds a photo-eye on this belt), then: { out1: [steps], out2: [steps] } }. Numbers are starting points, not recommendations.
 */
const belt = { speed: 0.5, gap: 0.1, accumulate: true, width: 0.6 };
const cst = (v) => ({ kind: 'const', v });
export const CELLS = [
  { id: 'guarded', source: { mode: 'interval', interarrival: { kind: 'exp', mean: 14 }, types: 'A 1 0.5' }, steps: [
    { kind: 'conveyor', params: { ...belt, length: 5 }, eye: 4.4 },
    { kind: 'gate', params: { mode: 'plc' } },
    { kind: 'conveyor', params: { ...belt, length: 3 }, eye: 1.0 },
    { kind: 'station', params: { servers: 1, queue: 0, time: { kind: 'normal', mean: 12, sd: 1.5 } }, look: 'machine' },
    { kind: 'conveyor', params: { ...belt, length: 3 } }, { kind: 'sink', params: {} }] },
  { id: 'palletizing', source: { mode: 'interval', interarrival: { kind: 'exp', mean: 9 }, types: 'A 3 0.5, B 1 0.7' }, steps: [
    { kind: 'zone', params: { zones: 6, zoneLength: 1, speed: 0.6, width: 0.6 } },
    { kind: 'station', params: { servers: 1, queue: 0, time: cst(8) }, look: 'palletizer' },
    { kind: 'conveyor', params: { ...belt, length: 3 } }, { kind: 'sink', params: {} }] },
  { id: 'sorting', source: { mode: 'interval', interarrival: { kind: 'exp', mean: 8 }, types: 'A 1 0.5, B 1 0.5' }, steps: [
    { kind: 'conveyor', params: { ...belt, length: 4, speed: 0.8 } },
    { kind: 'divert', params: { outputs: 2, rule: 'type', map: 'A 1, B 2' }, then: {
      out1: [{ kind: 'conveyor', params: { ...belt, length: 4 }, eye: 3.4 }, { kind: 'station', params: { servers: 1, queue: 0, time: { kind: 'normal', mean: 14, sd: 2 } }, look: 'operator' }, { kind: 'conveyor', params: { ...belt, length: 2 } }, { kind: 'sink', params: {} }],
      out2: [{ kind: 'conveyor', params: { ...belt, length: 4 }, eye: 3.4 }, { kind: 'station', params: { servers: 1, queue: 0, time: { kind: 'normal', mean: 14, sd: 2 } }, look: 'operator' }, { kind: 'conveyor', params: { ...belt, length: 2 } }, { kind: 'sink', params: {} }],
    } }] },
  { id: 'incline', source: { mode: 'interval', interarrival: { kind: 'exp', mean: 10 }, types: 'A 1 0.5' }, steps: [
    { kind: 'conveyor', params: { ...belt, length: 3 } }, { kind: 'incline', params: { ...belt, length: 4, rise: 1.4 } }, { kind: 'conveyor', params: { ...belt, length: 2 } },
    { kind: 'curve', params: { ...belt, radius: 1.2, angle: 90 } }, { kind: 'conveyor', params: { ...belt, length: 3 } }, { kind: 'sink', params: {} }] },
];

export function buildCell(id, flow) {
  const def = CELLS.find((c) => c.id === id);
  if (!def) return null;
  const L = flow.newLayout(), looks = {};
  const src = { id: 'source-1', kind: 'source', x: 0, y: 0, z: 0.8, rot: 0, params: { ...flow.defaults('source'), ...def.source } };
  L.items.push(src);
  let eyes = 0;
  const chain = (fromId, fromPort, steps) => {
    let at = { id: fromId, port: fromPort };
    for (const s of steps) {
      const it = flow.addAfter(L, at.id, at.port, s.kind, { ...flow.defaults(s.kind), ...s.params });
      L.items.push(it);
      if (s.look) looks[it.id] = s.look;
      if (s.eye !== undefined) { eyes++; L.items.push({ id: 'eye-' + eyes, kind: 'sensor', x: it.x, y: it.y, z: it.z, rot: 0, params: { ...flow.defaults('sensor'), on: it.id, at: s.eye } }); }
      if (s.then) { for (const [port, sub] of Object.entries(s.then)) chain(it.id, port, sub); return; }
      at = { id: it.id, port: 'out' };
    }
  };
  chain('source-1', 'out', def.steps);
  return { layout: L, looks };
}

const NAMES = { conveyor: 'belt', curve: 'curve', incline: 'incline', zone: 'zone', merge: 'merge', divert: 'divert', transfer: 'transfer', gate: 'gate', buffer: 'buffer', station: 'station', source: 'infeed', sink: 'outfeed', sensor: 'eye', 'agv-path': 'agvpath', 'agv-pick': 'agvpick', 'agv-drop': 'agvdrop' };
export function billOfMaterials(layout) {
  const rows = new Map();
  const add = (code, what, qty, unit, id) => { const r = rows.get(code) || { code, what, qty: 0, unit, items: [] }; r.qty += qty; if (id) r.items.push(id); rows.set(code, r); };
  for (const it of layout.items) {
    const p = it.params, nm = NAMES[it.kind] || it.kind;
    switch (it.kind) {
      case 'conveyor': case 'incline': add(`${nm}-w${p.width}`, { nm, width: p.width }, p.length, 'm', it.id); add('drive', { nm: 'drive' }, 1, 'ea', null); break;
      case 'curve': add(`${nm}-w${p.width}-r${p.radius}-a${Math.abs(p.angle)}`, { nm, width: p.width, radius: p.radius, angle: Math.abs(p.angle) }, 1, 'ea', it.id); add('drive', { nm: 'drive' }, 1, 'ea', null); break;
      case 'zone': add(`${nm}-l${p.zoneLength}`, { nm, zoneLength: p.zoneLength, width: p.width }, p.zones, 'ea', it.id); add('drive', { nm: 'drive' }, p.zones, 'ea', null); break;
      case 'agv-path': add(nm, { nm }, p.length, 'm', it.id); break;
      case 'station': add(nm + '-s' + p.servers, { nm, servers: p.servers }, 1, 'ea', it.id); break;
      default: add(nm, { nm }, 1, 'ea', it.id);
    }
  }
  const fleet = layout.fleet && layout.items.some((i) => i.kind === 'agv-path') ? layout.fleet.vehicles : 0;
  if (fleet) add('vehicle', { nm: 'vehicle' }, fleet, 'ea', null);
  return [...rows.values()].map((r) => ({ ...r, qty: +r.qty.toFixed(3) })).sort((a, b) => a.code.localeCompare(b.code));
}
const q = (s) => { const t = String(s ?? ''); const safe = /^[=+\-@\t\r]/.test(t) ? "'" + t : t; return /[",\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe; };
export function bomCsv(rows, label = (r) => r.code) { return [['code', 'item', 'quantity', 'unit', 'layout items', 'unit price', 'supplier'], ...rows.map((r) => [r.code, label(r), r.qty, r.unit, r.items.join(' '), '', ''])].map((x) => x.map(q).join(',')).join('\r\n') + '\r\n'; }
