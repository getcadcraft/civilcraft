/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and field names; the words are the UI's t() keys (wm.*). */
/**
 * water-objects.js — water mains as drawn things (0.8 LC.16 rest + CV.2, round 3 session civil_PART_3). DOM-free, no strings. The solver (water.js) knows nodes and
 * links; a drawing and a model need OBJECTS: pipes with ground-following depth, hydrants, valves and the fittings the layout implies. Everything here is read from the model,
 * so a changed pipe moves its fittings and the schedule with it.
 *
 *   cleanFittings(list, water) → [{ id 'wf<n>', kind, host: { node } | { pipe, t }, dia?, name, note }]      placed objects (untrusted: the file)
 *   layout(water, units, { cover, zAt }) → { pipes, fixtures, cover }
 *      pipes     [{ id, name, a: {x,y,z}, b: {x,y,z}, d (project small units), len (plan length), kind }]   z = ground − cover at each end (ground from node z, else zAt(x, y))
 *      fixtures  [{ id, kind, source 'placed' | 'derived', x, y, z, dia, name, angle? (bends, degrees), host, label }]
 *                derived: tee (three pipes meet), cross (four or more), bend (two pipes turning ≥ 5°, with the angle), reducer (two pipes of different size), cap (a dead end that
 *                is a junction), the line valve of a closed pipe is NOT derived (a pipe's status is the model's, not an object)
 *   schedule(fixtures, pipes, units) → { fittings: [{ kind, size, count }], pipes: [{ size, count, length }] }   a take-off list (CSV through scheduleCsv)
 *   sceneItems(water, units, { mmPerUnit, zAt }) → drawing items on C-WATR-MAIN / -HYDR / -VALV / -FITT / -TEXT (plan PDF and DWG/DXF)
 *   LAYER_DEFS → [[name, key, aci]]
 * A design aid: the fittings listed are what the layout implies, not a bill of quantities a contractor can order from.
 */
const fin = Number.isFinite;
const num = (v, d = null) => (typeof v === 'number' && fin(v) ? v : d);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
export const FITTING_KINDS = ['hydrant', 'valve', 'airvalve', 'blowoff', 'meter'];
export const COVER = { ft: 4, m: 1.2 };
export const LAYER_DEFS = [['C-WATR-MAIN', 'wm.layer.main', 5], ['C-WATR-HYDR', 'wm.layer.hydr', 1], ['C-WATR-VALV', 'wm.layer.valv', 3], ['C-WATR-FITT', 'wm.layer.fitt', 6], ['C-WATR-TEXT', 'wm.layer.text', 7]];
const MAX_FITTINGS = 5000;

export function cleanFittings(list, water) {
  const nodes = new Set((water?.nodes || []).map((n) => n.id)), pipes = new Set((water?.pipes || []).map((p) => p.id)), seen = new Set(), out = [];
  for (const f of (Array.isArray(list) ? list : []).slice(0, MAX_FITTINGS)) {
    if (!f || typeof f !== 'object' || !FITTING_KINDS.includes(f.kind)) continue;
    const id = /^wf\d{1,9}$/.test(String(f.id)) ? String(f.id) : null;
    if (!id || seen.has(id)) continue;
    const h = f.host || {};
    let host = null;
    if (typeof h.node === 'string' && nodes.has(h.node)) host = { node: h.node };
    else if (typeof h.pipe === 'string' && pipes.has(h.pipe)) host = { pipe: h.pipe, t: Math.min(1, Math.max(0, num(h.t, 0.5))) };
    if (!host) continue;
    if (f.kind === 'hydrant' && !host.node) continue;   // a hydrant stands on a junction (its connection)
    seen.add(id); out.push({ id, kind: f.kind, host, ...(num(f.dia) > 0 ? { dia: f.dia } : {}), name: str(f.name, 60), note: str(f.note, 200) });
  }
  return out;
}

const turnDeg = (p, q, r) => {   // the angle a line turns at q going p → q → r
  const a = Math.atan2(q.y - p.y, q.x - p.x), b = Math.atan2(r.y - q.y, r.x - q.x);
  let d = Math.abs(b - a); if (d > Math.PI) d = 2 * Math.PI - d;
  return (d * 180) / Math.PI;
};

export function layout(water, units, { cover = null, zAt = null } = {}) {
  const U = units === 'm' ? 'm' : 'ft', C = cover ?? COVER[U];
  const nodes = water?.nodes || [], by = new Map(nodes.map((n) => [n.id, n]));
  const ground = (n) => (n.z != null ? n.z : zAt ? num(zAt(n.x, n.y), null) : null);
  const at = (n) => { const g = ground(n); return { x: n.x, y: n.y, z: g == null ? null : n.kind === 'reservoir' || n.kind === 'tank' ? g : g - C }; };
  const pipes = [], deg = new Map(nodes.map((n) => [n.id, []]));
  for (const p of water?.pipes || []) {
    const a = by.get(p.a), b = by.get(p.b);
    if (!a || !b) continue;
    pipes.push({ id: p.id, name: p.name || p.id, a: at(a), b: at(b), d: p.d ?? null, len: p.length ?? Math.hypot(a.x - b.x, a.y - b.y), kind: p.kind, status: p.status });
    deg.get(a.id).push({ pipe: p, other: b }); deg.get(b.id).push({ pipe: p, other: a });
  }
  const fixtures = [];
  // placed objects
  for (const f of water?.fittings || []) {
    if (f.host.node) { const n = by.get(f.host.node), pt = n && at(n); if (pt) fixtures.push({ id: f.id, kind: f.kind, source: 'placed', ...pt, dia: f.dia ?? null, name: f.name || f.id, host: f.host, label: f.name || '' }); }
    else { const p = pipes.find((x) => x.id === f.host.pipe); if (p) { const t = f.host.t; fixtures.push({ id: f.id, kind: f.kind, source: 'placed', x: p.a.x + (p.b.x - p.a.x) * t, y: p.a.y + (p.b.y - p.a.y) * t, z: p.a.z == null || p.b.z == null ? null : p.a.z + (p.b.z - p.a.z) * t, dia: f.dia ?? p.d, name: f.name || f.id, host: f.host, label: f.name || '' }); } }
  }
  // derived from the layout (junctions only: a reservoir or tank has its own outlet)
  for (const n of nodes) {
    if (n.kind !== 'junction') continue;
    const links = deg.get(n.id).filter((l) => l.pipe.kind === 'pipe'), k = links.length, pt = at(n);
    const base = { source: 'derived', ...pt, host: { node: n.id }, name: n.name || n.id, label: '' };
    if (k >= 4) fixtures.push({ id: 'cross:' + n.id, kind: 'cross', dia: Math.max(...links.map((l) => l.pipe.d || 0)) || null, ...base });
    else if (k === 3) fixtures.push({ id: 'tee:' + n.id, kind: 'tee', dia: Math.max(...links.map((l) => l.pipe.d || 0)) || null, ...base });
    else if (k === 2) {
      const [l1, l2] = links, ang = turnDeg(l1.other, n, l2.other);
      if ((l1.pipe.d || 0) !== (l2.pipe.d || 0) && l1.pipe.d && l2.pipe.d) fixtures.push({ id: 'reducer:' + n.id, kind: 'reducer', dia: Math.max(l1.pipe.d, l2.pipe.d), dia2: Math.min(l1.pipe.d, l2.pipe.d), ...base });
      if (ang >= 5) fixtures.push({ id: 'bend:' + n.id, kind: 'bend', dia: Math.max(l1.pipe.d || 0, l2.pipe.d || 0) || null, angle: Math.round(ang * 10) / 10, ...base });
    } else if (k === 1) fixtures.push({ id: 'cap:' + n.id, kind: 'cap', dia: links[0].pipe.d || null, ...base });
  }
  return { pipes, fixtures, cover: C };
}

const sizeText = (d, units) => (d ? String(Math.round(d * 10) / 10) + (units === 'm' ? ' mm' : ' in') : '—');
export function schedule(fixtures, pipes, units) {
  const f = new Map(), p = new Map();
  for (const x of fixtures) { const key = x.kind + '|' + (x.dia ?? ''); const r = f.get(key) || { kind: x.kind, size: x.dia ?? null, count: 0 }; r.count++; f.set(key, r); }
  for (const x of pipes) { if (x.kind !== 'pipe') continue; const key = String(x.d ?? ''); const r = p.get(key) || { size: x.d ?? null, count: 0, length: 0 }; r.count++; r.length += x.len; p.set(key, r); }
  const ord = (a, b) => (a.kind || '').localeCompare(b.kind || '') || (a.size ?? 0) - (b.size ?? 0);
  return { fittings: [...f.values()].sort(ord), pipes: [...p.values()].sort((a, b) => (a.size ?? 0) - (b.size ?? 0)) };
}
export function scheduleCsv(sched, units, words = (k) => k) {
  const row = (a) => a.map((c) => { const s = String(c ?? ''); return /^[=+\-@]/.test(s) || /[",\r\n]/.test(s) ? '"' + (/^[=+\-@]/.test(s) ? "'" : '') + s.replace(/"/g, '""') + '"' : s; }).join(',');
  return [row([words('wm.sch.what'), words('wm.sch.size'), words('wm.sch.count'), words('wm.sch.length')]),
    ...sched.pipes.map((r) => row([words('wm.sch.pipe'), sizeText(r.size, units), r.count, Math.round(r.length * 100) / 100])),
    ...sched.fittings.map((r) => row([words('wm.fit.' + r.kind), sizeText(r.size, units), r.count, '']))].join('\r\n') + '\r\n';
}

/** Drawing items for the plan: pipes with their size, a symbol for every hydrant, valve and fitting. `mmPerUnit` = plan millimetres per project unit. */
export function sceneItems(water, units, { mmPerUnit = 1, zAt = null, words = (k) => k } = {}) {
  if (!water?.nodes?.length) return [];
  const { pipes, fixtures } = layout(water, units, { zAt }), out = [], u = (mm) => mm / mmPerUnit;   // a size in plan millimetres → project units
  const circle = (layer, x, y, r) => ({ layer, kind: 'arc', c: { x, y }, r, a0: 0, a1: Math.PI * 2 });
  const line = (layer, pts, closed = false) => ({ layer, kind: 'poly', pts, closed });
  for (const p of pipes) {
    out.push(line('C-WATR-MAIN', [{ x: p.a.x, y: p.a.y }, { x: p.b.x, y: p.b.y }]));
    if (p.d) {
      const dx = p.b.x - p.a.x, dy = p.b.y - p.a.y, L = Math.hypot(dx, dy) || 1;
      let rot = Math.atan2(dy, dx); if (rot > Math.PI / 2) rot -= Math.PI; else if (rot < -Math.PI / 2) rot += Math.PI;
      out.push({ layer: 'C-WATR-TEXT', kind: 'text', x: (p.a.x + p.b.x) / 2 - (dy / L) * u(1.6), y: (p.a.y + p.b.y) / 2 + (dx / L) * u(1.6), mm: 1.8, rot, align: 'center', middle: true, text: sizeText(p.d, units) + (p.kind === 'pipe' ? '' : ' ' + words('wm.' + p.kind)) });
    }
  }
  for (const f of fixtures) {
    const r = u(f.kind === 'hydrant' ? 1.6 : 1.1), x = f.x, y = f.y;
    if (f.kind === 'hydrant') {
      out.push(circle('C-WATR-HYDR', x, y, r)); out.push(line('C-WATR-HYDR', [{ x: x - r, y }, { x: x + r, y }])); out.push(line('C-WATR-HYDR', [{ x, y: y - r }, { x, y: y + r }]));
      if (f.label) out.push({ layer: 'C-WATR-TEXT', kind: 'text', x: x + r * 1.5, y, mm: 1.8, rot: 0, align: 'left', middle: true, text: f.label });
    } else if (f.kind === 'valve' || f.kind === 'airvalve' || f.kind === 'blowoff' || f.kind === 'meter') {
      out.push(line('C-WATR-VALV', [{ x: x - r, y: y - r * 0.7 }, { x: x + r, y: y + r * 0.7 }, { x: x + r, y: y - r * 0.7 }, { x: x - r, y: y + r * 0.7 }], true));   // the bow-tie
      if (f.kind !== 'valve') out.push({ layer: 'C-WATR-TEXT', kind: 'text', x: x + r * 1.5, y, mm: 1.5, rot: 0, align: 'left', middle: true, text: words('wm.fit.' + f.kind) });
    } else if (f.kind === 'tee' || f.kind === 'cross') {
      out.push(circle('C-WATR-FITT', x, y, r * 0.55));
    } else if (f.kind === 'bend') {
      out.push(line('C-WATR-FITT', [{ x: x - r * 0.6, y: y - r * 0.6 }, { x: x + r * 0.6, y: y + r * 0.6 }]));
      out.push({ layer: 'C-WATR-TEXT', kind: 'text', x: x + r * 1.2, y: y - r * 1.2, mm: 1.4, rot: 0, align: 'left', middle: true, text: f.angle + '°' });
    } else if (f.kind === 'cap') {
      out.push(line('C-WATR-FITT', [{ x: x - r * 0.7, y: y - r * 0.7 }, { x: x + r * 0.7, y: y - r * 0.7 }, { x: x + r * 0.7, y: y + r * 0.7 }, { x: x - r * 0.7, y: y + r * 0.7 }], true));
    } else if (f.kind === 'reducer') {
      out.push(line('C-WATR-FITT', [{ x: x - r, y: y - r * 0.5 }, { x: x + r, y: y - r * 0.2 }, { x: x + r, y: y + r * 0.2 }, { x: x - r, y: y + r * 0.5 }], true));
    }
  }
  return out;
}

/** The mains as a pipe network the LandXML writer takes (0.8 LC.16 rest): a structure per node, a pipe per main, inverts at the ground less the cover (a reservoir or tank at its ground).
 *  Hydrants carry `desc`. Diameters stay in the file's diameter unit (in | mm). */
export function waterNetwork(water, units, { cover = null, zAt = null, name = 'Water mains' } = {}) {
  const L = layout(water, units, { cover, zAt }), U = units === 'm' ? 'm' : 'ft';
  const hyd = new Set(L.fixtures.filter((f) => f.kind === 'hydrant' && f.host.node).map((f) => f.host.node));
  const z = new Map(), pipes = [];
  const pt = new Map((water?.nodes || []).map((n) => [n.id, n]));
  for (const p of L.pipes) {
    if (p.kind !== 'pipe' || p.a.z == null || p.b.z == null) continue;
    const src = water.pipes.find((q) => q.id === p.id);
    pipes.push({ id: p.id, name: p.name, from: src.a, to: src.b, invUp: p.a.z, invDn: p.b.z, dia: p.d || 0 });
    z.set(src.a, p.a.z); z.set(src.b, p.b.z);
  }
  const structures = [...z.keys()].map((id) => { const n = pt.get(id); return { id, name: n.name || n.id, x: n.x, y: n.y, dia: U === 'm' ? 150 : 6, rimShown: n.z != null ? n.z : null, sump: null, ...(hyd.has(id) ? { desc: 'Hydrant' } : {}) }; });   // i18n-ignore: file data
  return { name, type: 'water', structures, pipes };
}

/** A LandXML pipe network read back as water mains: nodes at the structures (ground = rim, else the highest invert + the cover), pipes between them. */
export function waterFromNetwork(net, units, { cover = null } = {}) {
  const C = cover ?? COVER[units === 'm' ? 'm' : 'ft'], top = new Map();
  for (const p of net.pipes) for (const [id, v] of [[p.from, p.invUp], [p.to, p.invDn]]) if (fin(v)) top.set(id, Math.max(top.get(id) ?? -Infinity, v));
  const nodes = net.structures.map((x, i) => ({ id: 'wm' + (i + 1), _src: x.id, name: str(x.name, 60), x: x.x, y: x.y, z: fin(x.rim) ? x.rim : top.has(x.id) ? top.get(x.id) + C : null, demand: 0, kind: 'junction' }));
  const map = new Map(nodes.map((n) => [n._src, n.id]));
  const pipes = net.pipes.map((p, i) => ({ id: 'wp' + (i + 1), name: str(p.name, 60), a: map.get(p.from), b: map.get(p.to), kind: 'pipe', length: null, d: p.dia > 0 ? p.dia : null, status: 'open' })).filter((p) => p.a && p.b && p.a !== p.b);
  for (const n of nodes) delete n._src;
  return { nodes, pipes };
}
