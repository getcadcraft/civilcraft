/* SPDX-License-Identifier: Apache-2.0 */
/**
 * layout.js — a Material flow layout and its flow graph (0.8 SU.858 step 2, session sx-flow). DOM-free.
 *
 * A layout (file format `cadcraft-flow` v1, also what the add-on keeps):
 *   { format: 'cadcraft-flow', version: 1, items: [{ id, kind, x, y, z, rot, params }], fleet: {vehicles, speed, load, unload, nodes},
 *     run: { seed, hours, warmup (minutes) }, calendars: [{ id, name, windows }] (calendar.js; a file from before shifts has none) }
 * x, y, z in metres in ModelCraft's world (Z up), rot in degrees about Z. Connections are never stored: an out port and an in
 * port that touch (within 1 cm, headings within 1°) are joined, so moving an item and snapping it again keeps the graph true.
 * AGV path segments join where their ends touch (within 5 cm); a pickup or drop belongs to the path node its marker sits on.
 *
 *   newLayout() · cleanLayout(raw) → {layout, dropped} · nextId(layout, kind)
 *   worldPorts(item) · worldPath(item) → {length, at(s) → {p, h}} | null · place(kind, params, port, P, H) → {x, y, z, rot}
 *   addAfter(layout, fromId, fromPort, kind, params?) → new item (snapped to that port; not added)
 *   freePorts(layout) → [{id, name, dir, p, h}] · snapItem(layout, id, radius) → true when it moved onto a free port
 *   connect(layout) → {links, agv: {nodes, edges, nodeOf}} · buildGraph(layout) → {graph, problems, geom}
 */
import { cleanCalendar } from './calendar.js';
import { cleanOrderTable, rowsFor } from './orders.js';
import { KIND, KINDS, CONVEYOR_KINDS, cleanParams, defaults, localPorts, localPath, parseTypes, parseMap, parseNumbers, parseIds } from './catalog.js';

export const FORMAT = 'cadcraft-flow';
export const VERSION = 1;
export const JOIN_TOL = 0.01, JOIN_DEG = 1, AGV_TOL = 0.05, MAX_ITEMS = 2000;
export const REVERSE = '~r';
const DEG = Math.PI / 180;
const ID_RE = /^[a-z][a-z0-9-]{0,39}$/;
const fin = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e6 ? v : d);

export const DEFAULT_FLEET = { vehicles: 1, speed: 1, load: 5, unload: 5, nodes: false, mtbf: 0, mttr: 15, park: [] };
export const MAX_CALENDARS = 20;
export const MAX_ORDER_TABLES = 10;
export const DEFAULT_RUN = { seed: 1, hours: 8, warmup: 30 };

export function newLayout() { return { format: FORMAT, version: VERSION, items: [], fleet: { ...DEFAULT_FLEET }, run: { ...DEFAULT_RUN }, calendars: [], pools: [], orders: [] }; }

export function cleanLayout(raw) {
  const layout = newLayout();
  let dropped = 0;
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || typeof raw.version !== 'number' || raw.version > VERSION) return { layout, dropped: -1 };
  const seen = new Set();
  for (const it of Array.isArray(raw.items) ? raw.items.slice(0, MAX_ITEMS) : []) {
    if (!it || typeof it !== 'object' || !KINDS.includes(it.kind) || typeof it.id !== 'string' || !ID_RE.test(it.id) || seen.has(it.id)) { dropped++; continue; }
    seen.add(it.id);
    layout.items.push({ id: it.id, kind: it.kind, x: fin(it.x), y: fin(it.y), z: fin(it.z), rot: ((fin(it.rot) % 360) + 360) % 360, params: cleanParams(it.kind, it.params) });
  }
  const f = raw.fleet || {};
  layout.fleet = {
    vehicles: Math.round(Math.min(50, Math.max(0, fin(f.vehicles, 1)))), speed: Math.min(10, Math.max(0.05, fin(f.speed, 1))),
    load: Math.min(3600, Math.max(0, fin(f.load, 5))), unload: Math.min(3600, Math.max(0, fin(f.unload, 5))), nodes: !!f.nodes,
    // 0.8 round 4: vehicles break down (hours between, minutes to repair; 0 = never) and idle ones park at the named AGV path ends (ids of agv-path items; the first end of each)
    mtbf: Math.min(1e5, Math.max(0, fin(f.mtbf, 0))), mttr: Math.min(1e5, Math.max(0.01, fin(f.mttr, 15))),
    park: (Array.isArray(f.park) ? f.park : []).filter((x) => typeof x === 'string' && ID_RE.test(x)).slice(0, 20),
  };
  const poolIds = new Set();
  for (const q of Array.isArray(raw.pools) ? raw.pools.slice(0, 20) : []) {
    if (!q || typeof q.id !== 'string' || !ID_RE.test(q.id) || poolIds.has(q.id)) { dropped++; continue; }
    poolIds.add(q.id); layout.pools.push({ id: q.id, name: typeof q.name === 'string' ? q.name.slice(0, 60) : q.id, size: Math.round(Math.min(100, Math.max(1, fin(q.size, 1)))) });
  }
  const calIds = new Set();
  for (const c of Array.isArray(raw.calendars) ? raw.calendars.slice(0, MAX_CALENDARS) : []) {
    const cc = cleanCalendar(c);
    if (!cc || calIds.has(cc.id)) { dropped++; continue; }
    calIds.add(cc.id); layout.calendars.push(cc);
  }
  // order tables (0.9 TW.15): arrivals from a file; a table the file cannot read is dropped and counted
  const orderIds = new Set();
  for (const o of Array.isArray(raw.orders) ? raw.orders.slice(0, MAX_ORDER_TABLES) : []) {
    const oo = cleanOrderTable(o);
    if (!oo || orderIds.has(oo.id)) { dropped++; continue; }
    orderIds.add(oo.id); layout.orders.push(oo);
  }
  const r = raw.run || {};
  layout.run = { seed: Math.round(Math.min(2 ** 31, Math.max(0, fin(r.seed, 1)))), hours: Math.min(10000, Math.max(0.01, fin(r.hours, 8))), warmup: Math.min(6e5, Math.max(0, fin(r.warmup, 30))) };
  return { layout, dropped };
}

export function nextId(layout, kind) {
  const base = kind.replace(/^agv-/, 'agv');
  let n = 1;
  const ids = new Set(layout.items.map((i) => i.id));
  while (ids.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}

const rotXY = (p, rot) => { const c = Math.cos(rot * DEG), s = Math.sin(rot * DEG); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c, p[2]]; };
const toWorld = (it, p) => { const q = rotXY(p, it.rot); return [q[0] + it.x, q[1] + it.y, q[2] + it.z]; };
const normDeg = (h) => ((h % 360) + 540) % 360 - 180;

export function worldPorts(it) {
  return localPorts(it.kind, it.params).map((pt) => ({ id: it.id, name: pt.name, dir: pt.dir, p: toWorld(it, pt.p), h: normDeg(pt.h + it.rot) }));
}
export function worldPath(it) {
  const lp = localPath(it.kind, it.params);
  if (!lp) return null;
  return { length: lp.length, at: (s) => { const q = lp.at(Math.min(lp.length, Math.max(0, s))); return { p: toWorld(it, q.p), h: normDeg(q.h + it.rot) }; } };
}

/** Where an item of `kind` goes so that its port `port` sits on point P with heading H. */
export function place(kind, params, port, P, H) {
  const lp = localPorts(kind, params).find((x) => x.name === port);
  if (!lp) return null;
  const rot = ((H - lp.h) % 360 + 360) % 360;
  const q = rotXY(lp.p, rot);
  return { x: P[0] - q[0], y: P[1] - q[1], z: P[2] - q[2], rot };
}

/** A new item of `kind` joined to `fromId`'s port `fromPort` (an out port: its first in port; an AGV end: its start). */
export function addAfter(layout, fromId, fromPort, kind, params) {
  const from = layout.items.find((i) => i.id === fromId);
  if (!from) return null;
  const fp = worldPorts(from).find((x) => x.name === fromPort);
  if (!fp) return null;
  const pr = cleanParams(kind, params || defaults(kind));
  const mine = localPorts(kind, pr);
  const want = fp.dir === 'agv' ? mine.find((x) => x.dir === 'agv') : mine.find((x) => x.dir === (fp.dir === 'out' ? 'in' : 'out'));
  if (!want) return null;
  const at = place(kind, pr, want.name, fp.p, fp.h);
  const it = { id: nextId(layout, kind), kind, ...at, params: pr };
  if (kind === 'sensor') it.params.on = fromId;
  return it;
}

const samePt = (a, b, tol) => Math.abs(a[0] - b[0]) <= tol && Math.abs(a[1] - b[1]) <= tol && Math.abs(a[2] - b[2]) <= tol;
const sameH = (a, b) => Math.abs(normDeg(a - b)) <= JOIN_DEG;

export function connect(layout) {
  const ports = layout.items.flatMap(worldPorts);
  const outs = ports.filter((p) => p.dir === 'out'), ins = ports.filter((p) => p.dir === 'in');
  const usedIn = new Set(), links = [];
  for (const o of outs) {
    const i = ins.find((x) => x.id !== o.id && !usedIn.has(x.id + ':' + x.name) && samePt(x.p, o.p, JOIN_TOL) && sameH(x.h, o.h));
    if (!i) continue;
    usedIn.add(i.id + ':' + i.name);
    links.push({ from: o.id, out: o.name, to: i.id, in: i.name });
  }
  // AGV network: path ends merged into nodes
  const nodes = [];
  const nodeAt = (p, make) => {
    let n = nodes.find((x) => samePt(x.p, p, AGV_TOL));
    if (!n && make) { n = { id: 'n' + (nodes.length + 1), p }; nodes.push(n); }
    return n;
  };
  const edges = [];
  for (const it of layout.items) {
    if (it.kind !== 'agv-path') continue;
    const [a, b] = worldPorts(it);
    const na = nodeAt(a.p, true).id, nb = nodeAt(b.p, true).id;
    edges.push({ id: it.id, from: na, to: nb, length: it.params.length, ...(it.params.twoWay ? { lane: it.id } : {}) });
    if (it.params.twoWay) edges.push({ id: it.id + REVERSE, from: nb, to: na, length: it.params.length, lane: it.id });   // one lane: only one vehicle at a time
  }
  const nodeOf = {};
  for (const it of layout.items) {
    if (it.kind !== 'agv-pick' && it.kind !== 'agv-drop') continue;
    const np = worldPorts(it).find((x) => x.dir === 'agv');
    const n = nodeAt(np.p, false);
    if (n) nodeOf[it.id] = n.id;
  }
  return { links, agv: { nodes, edges, nodeOf } };
}

/** Free ports (not joined): what the panel offers to add after, and what snapping looks for. */
export function freePorts(layout) {
  const { links } = connect(layout);
  const used = new Set(links.flatMap((l) => [l.from + ':' + l.out, l.to + ':' + l.in]));
  return layout.items.flatMap(worldPorts).filter((p) => p.dir !== 'agv' && !used.has(p.id + ':' + p.name));
}

/** Move item `id` so that one of its free ports sits exactly on the nearest matching free port of another item (within radius). */
export function snapItem(layout, id, radius = 0.5) {
  const it = layout.items.find((i) => i.id === id);
  if (!it) return false;
  const free = freePorts(layout);
  const mine = free.filter((p) => p.id === id), others = free.filter((p) => p.id !== id);
  let best = null, bd = radius;
  for (const m of mine) {
    for (const o of others) {
      if (o.dir === m.dir) continue;
      const d = Math.hypot(o.p[0] - m.p[0], o.p[1] - m.p[1], o.p[2] - m.p[2]);
      if (d <= bd) { bd = d; best = { m, o }; }
    }
  }
  if (!best) return false;
  Object.assign(it, place(it.kind, it.params, best.m.name, best.o.p, best.o.h));
  return true;
}

export function pathLength(it) { const lp = localPath(it.kind, it.params); return lp ? lp.length : 0; }

/** The layout → the simulation graph (sim.js), its problems (layout-level), and geometry for playback. */
export function buildGraph(layout) {
  const { links, agv } = connect(layout);
  const problems = [], elements = [], geom = {};
  for (const it of layout.items) {
    const p = it.params, k = KIND[it.kind];
    if (it.kind === 'agv-path' && p.twoWay) {
      const f = worldPath(it);
      geom[it.id + REVERSE] = { kind: it.kind, path: { length: f.length, at: (s) => { const q = f.at(f.length - s); return { p: q.p, h: normDeg(q.h + 180) }; } }, ports: {}, x: it.x, y: it.y, z: it.z, rot: it.rot };
    }
    geom[it.id] = { kind: it.kind, path: worldPath(it), ports: Object.fromEntries(worldPorts(it).map((x) => [x.name, x])), x: it.x, y: it.y, z: it.z, rot: it.rot };
    if (!k.sim) continue;
    const base = { id: it.id, type: k.sim };
    switch (it.kind) {
      case 'conveyor': case 'curve': case 'incline':
        elements.push({ ...base, length: pathLength(it), speed: p.speed, gap: p.gap, accumulate: p.accumulate, ...(p.mtbf > 0 ? { mtbf: p.mtbf * 3600, mttr: p.mttr * 60 } : {}) }); break;
      case 'zone':
        elements.push({ ...base, length: p.zones * p.zoneLength, speed: p.speed, gap: 0, pitch: p.zoneLength, accumulate: true }); break;
      case 'merge': elements.push({ ...base, rule: p.rule }); break;
      case 'divert': elements.push({ ...base, rule: p.rule, map: parseMap(p.map), default: 1, weights: parseNumbers(p.weights), sensors: parseIds(p.sensors) }); break;
      case 'transfer': elements.push({ ...base, servers: 1, queue: 0, time: p.time }); break;
      case 'gate': elements.push({ ...base, mode: p.mode, open: p.open, closed: p.closed, offset: p.offset, ...(p.mtbf > 0 ? { mtbf: p.mtbf * 3600, mttr: p.mttr * 60 } : {}) }); break;
      case 'buffer': elements.push({ ...base, capacity: p.capacity }); break;
      case 'station': elements.push({ ...base, servers: p.servers, queue: p.queue, time: p.time, ...(p.calendar ? { calendar: p.calendar } : {}), ...(p.pool && (layout.pools || []).some((q) => q.id === p.pool) ? { pool: p.pool } : {}), ...(p.mtbf > 0 ? { mtbf: p.mtbf * 3600, mttr: p.mttr * 60 } : {}) }); break;
      case 'source': {
        const el = { ...base, mode: p.mode, interarrival: p.interarrival, types: parseTypes(p.types), limit: p.limit > 0 ? p.limit : Infinity, ...(p.calendar ? { calendar: p.calendar } : {}) };
        if (p.mode === 'orders') {
          const table = (layout.orders || []).find((q) => q.id === p.orders);
          if (!table) problems.push({ code: 'orders-missing', id: it.id });
          else { el.orders = rowsFor(table, it.id); if (!el.orders.length) problems.push({ code: 'orders-empty', id: it.id }); }
        }
        elements.push(el); break;
      }
      case 'sink': elements.push(base); break;
      case 'sensor': {
        const c = layout.items.find((x) => x.id === p.on);
        elements.push({ ...base, on: p.on, at: c ? Math.min(p.at, pathLength(c)) : p.at });
        if (c) geom[it.id].on = c.id;
        break;
      }
      case 'agv-pick': case 'agv-drop':
        if (!agv.nodeOf[it.id]) problems.push({ code: 'agv-not-on-path', id: it.id });
        elements.push({ ...base, node: agv.nodeOf[it.id] ?? null, capacity: p.capacity, ...(it.kind === 'agv-pick' ? { to: p.to } : {}) });
        break;
    }
  }
  const fl = layout.fleet, fleet = { vehicles: fl.vehicles, speed: fl.speed, load: fl.load, unload: fl.unload, nodes: fl.nodes, ...(fl.mtbf > 0 ? { mtbf: fl.mtbf * 3600, mttr: fl.mttr * 60 } : {}), ...(fl.park && fl.park.length ? { park: fl.park.map((id) => (agv.edges.find((e) => e.id === id) || {}).to).filter(Boolean) } : {}) };   // hours and minutes in the file, seconds in the model
  const graph = { elements, links, calendars: layout.calendars, pools: (layout.pools || []).map((q) => ({ id: q.id, size: q.size })), agv: agv.edges.length ? { edges: agv.edges, fleet } : null };
  return { graph, problems, geom, agvNodes: agv.nodes };
}

export { CONVEYOR_KINDS };
