/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — ids and protocol names only; the panel words them. */
/**
 * cells.js — the machine and cell list (0.9 D8.13). Machines come from the flow add-on's layout (each station is a machine; its place is
 * where the operator screen draws it, its mean process time the ideal cycle time) and from machines the person adds by hand. What the
 * person sets per machine (name, cell, kind, how it is read, whether writing is allowed) is kept in the factory's own state, so the flow
 * layout is never changed by this add-on.
 *
 *   machinesFrom(layout, config) → [{ id, name, cell, kind, source, idealCycleS, at: [x,y,z] | null, fromLayout, write, post }]
 *   cleanConfig(raw) → config      { machines: { id: settings }, cells: [{ id, name }], extra: [ids added by hand] }
 *   cleanSource(raw) → source      { protocol: sim|mtconnect|opcua|mqtt|modbus|bacnet|none, base?, device?, host?, port?, unit?, nodes? }
 */
export const KINDS = ['cnc', 'printer', 'laser', 'robot', 'assembly', 'test', 'other'];
export const PROTOCOLS = ['sim', 'mtconnect', 'opcua', 'mqtt', 'modbus', 'bacnet', 'none'];
export const NODE_KEYS = ['state', 'total', 'good', 'bad', 'alarm'];
const ID_RE = /^[A-Za-z0-9][A-Za-z0-9_.-]{0,79}$/;
const ID = { test: (v) => typeof v === 'string' && ID_RE.test(v) };
const text = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);

/** The mean of a flow distribution (lib/rng.js shapes): const v, uniform a b, exp mean, normal mean, tri a m b, erlang mean. */
export function distMean(d) {
  if (!d || typeof d !== 'object') return null;
  const n = (x) => (Number.isFinite(Number(x)) ? Number(x) : null);
  switch (d.kind) {
    case 'const': return n(d.v);
    case 'uniform': return n(d.a) !== null && n(d.b) !== null ? (n(d.a) + n(d.b)) / 2 : null;
    case 'tri': return [d.a, d.m, d.b].every((x) => n(x) !== null) ? (n(d.a) + n(d.m) + n(d.b)) / 3 : null;
    case 'exp': case 'normal': case 'erlang': return n(d.mean);
    default: return null;
  }
}

export function cleanSource(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const protocol = PROTOCOLS.includes(r.protocol) ? r.protocol : 'sim';
  const s = { protocol };
  if (protocol === 'mtconnect') { s.base = text(r.base, 300); s.device = text(r.device, 80); }
  if (['opcua', 'mqtt', 'modbus', 'bacnet'].includes(protocol)) {
    s.host = text(r.host, 253); if (Number.isInteger(r.port) && r.port > 0 && r.port < 65536) s.port = r.port; if (Number.isInteger(r.unit) && r.unit >= 0 && r.unit < 256) s.unit = r.unit;
    s.nodes = {}; for (const k of NODE_KEYS) if (r.nodes && r.nodes[k]) s.nodes[k] = text(r.nodes[k], 300);
  }
  if (r.approved === true) s.approved = true;
  return s;
}

/** High/low limits per value name (an alarm when a value goes past one; lib/live's store keeps the deadband). */
export function cleanLimits(raw) {
  const out = {};
  for (const [k, v] of Object.entries(raw && typeof raw === 'object' ? raw : {}).slice(0, 50)) {
    if (!/^[A-Za-z0-9_.:-]{1,80}$/.test(k) || !v || typeof v !== 'object') continue;
    const e = {}; for (const f of ['low', 'high', 'deadband']) if (Number.isFinite(v[f])) e[f] = v[f];
    if (Object.keys(e).length) out[k] = e;
  }
  return out;
}

export function cleanConfig(raw) {
  const r = raw && typeof raw === 'object' ? raw : {};
  const cells = (Array.isArray(r.cells) ? r.cells : []).filter((c) => c && ID.test(c.id)).slice(0, 100).map((c) => ({ id: c.id, name: text(c.name, 60) || c.id }));
  if (!cells.length) cells.push({ id: 'cell-1', name: 'Cell 1' });
  const machines = {};
  for (const [id, m] of Object.entries(r.machines && typeof r.machines === 'object' ? r.machines : {}).slice(0, 500)) {
    if (!ID.test(id) || !m || typeof m !== 'object') continue;
    machines[id] = { name: text(m.name, 80), cell: cells.some((c) => c.id === m.cell) ? m.cell : cells[0].id, kind: KINDS.includes(m.kind) ? m.kind : 'cnc', source: cleanSource(m.source),
      idealCycleS: Number.isFinite(m.idealCycleS) && m.idealCycleS > 0 ? m.idealCycleS : null, post: text(m.post, 60), write: m.write === true, limits: cleanLimits(m.limits) };
  }
  const extra = [...new Set((Array.isArray(r.extra) ? r.extra : []).filter((id) => ID.test(id)))].slice(0, 200);
  return { machines, cells, extra };
}

export function machinesFrom(layout, config) {
  const cfg = config || cleanConfig(null);
  const items = layout && Array.isArray(layout.items) ? layout.items : [];
  const out = [];
  const make = (id, base) => {
    const c = cfg.machines[id] || {};
    return { id, name: c.name || base.name || id, cell: c.cell || cfg.cells[0].id, kind: c.kind || base.kind || 'cnc', source: c.source || cleanSource(null),
      idealCycleS: c.idealCycleS || base.idealCycleS || null, at: base.at || null, fromLayout: !!base.fromLayout, write: c.write === true, post: c.post || '', limits: c.limits || {} };
  };
  for (const it of items) {
    if (!it || it.kind !== 'station' || !ID.test(String(it.id ?? ''))) continue;
    const z = Number(it.z) || 0;
    out.push(make(it.id, { name: it.id, kind: 'cnc', idealCycleS: distMean(it.params && it.params.time), at: [Number(it.x) || 0, Number(it.y) || 0, z + 1.1], fromLayout: true }));
  }
  for (const id of cfg.extra) if (!out.some((m) => m.id === id)) out.push(make(id, { name: id }));
  return out;
}

/** A fresh id for a machine added by hand. */
export function nextMachineId(machines) { let n = 1; while (machines.some((m) => m.id === 'machine-' + n)) n++; return 'machine-' + n; }
