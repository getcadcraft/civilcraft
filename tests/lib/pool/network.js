/* SPDX-License-Identifier: Apache-2.0 */
/**
 * network.js — the pipes as one connected network with ports (0.11 POOL.8). Host-free; millimetres.
 *
 * build.js routes each pipe run (a polyline: a skimmer branch, a collector, the drain line …). Here the runs are cut into straight segments, a
 * fitting is put where two segments meet at an angle (a bend) and where three or more meet (a junction: tee or cross), the short tails from each
 * terminal (skimmer, inlet, drain, overflow channel, jet) to its run are added, and so is the pipework in the machine room: the runs come in
 * through the wall, the suction riser and header feed every pump, each pump feeds its filter, the filters feed the return header and riser that
 * the return runs leave from. Every segment, fitting, terminal, pump and filter gets ports (IfcDistributionPort: where water comes in, SINK,
 * or goes out, SOURCE), and each pair of ports that meet is one connection (IfcRelConnectsPorts). Water flows toward the pumps on the suction
 * side and away from the filters on the return side; a segment's direction comes from that.
 *
 * It is a layout to start from: the machine room pipes are drawn square through free space by fixed offsets, valves and unions are not drawn,
 * and nothing is checked for clashes. The head loss (hydraulics.js loopHead) still counts the routed runs only, not the tails or the room pipes.
 *
 * network(built, d, circ) → { segments, fittings, ports, links: [[portKey, portKey]], open (ends that meet nothing), elements (the IFC
 *   elements: segments and fittings, plus `ports` lists to add to the terminals and equipment by key) }
 */
import { cyl, box, tidy, pathLen, COLORS } from './build.js';

const SIDE = { surface: 'suction', drain: 'suction', overflow: 'suction', suction: 'suction', ret: 'return', jet: 'return', return: 'return', link: 'link' };
const NAME = { surface: 'Skimmer suction pipe', overflow: 'Overflow pipe', drain: 'Drain suction pipe', ret: 'Return pipe', jet: 'Jet supply pipe', suction: 'Suction header', return: 'Return header', link: 'Pump to filter pipe' };
const COLOR = { suction: COLORS.surface, return: COLORS.ret, link: COLORS.link };
const K = (p) => p.map((v) => Math.round(v * 2) / 2).join(',');
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const len = (v) => Math.hypot(v[0], v[1], v[2]);
const unit = (v) => { const n = len(v) || 1; return [v[0] / n, v[1] / n, v[2] / n]; };
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** t in (0, 1) when p lies inside the segment a–b (within 0.5 mm), else null. */
function onSeg(p, a, b) {
  const ab = sub(b, a), L2 = dot(ab, ab);
  if (L2 < 1e-6) return null;
  const t = dot(sub(p, a), ab) / L2;
  if (t <= 1e-6 || t >= 1 - 1e-6) return null;
  const q = [a[0] + ab[0] * t, a[1] + ab[1] * t, a[2] + ab[2] * t];
  return len(sub(p, q)) < 0.5 ? t : null;
}

export function network(built, d, circ) {
  const { layout } = built, room = layout.room, T = room.T, raw = [], fixed = [];
  const seg = (system, dn, pts, flow, run = null) => { const p = tidy(pts); for (let i = 1; i < p.length; i++) if (len(sub(p[i], p[i - 1])) > 0.5) raw.push({ system, side: SIDE[system], dn, a: p[i - 1], b: p[i], flow, run }); };
  // the routed runs
  layout.pipes.forEach((p, i) => seg(p.system, p.dn, p.pts, p.flow, i));
  // tails: terminal port → its run
  const each = { surface: circ.skimmers ? circ.lines.surface.flow / circ.skimmers : 0, ret: circ.inlets ? circ.lines.ret.flow / circ.inlets : 0, drain: circ.drains ? circ.lines.drain.flow / circ.drains : 0, jet: d.jetFlow, overflow: circ.lines.surface.flow };
  for (const t of layout.terms) {
    seg(t.system, t.dn, [t.port, [t.start[0], t.start[1], t.port[2]], t.start], each[t.system] || 0);
    const src = t.kind === 'inlet' || t.kind === 'jet' ? 'SINK' : 'SOURCE';
    fixed.push({ owner: t.key, key: t.key + ':p', at: t.port, dir: t.dir, flow: src, system: t.system });
  }
  // the machine room
  const trw = room.wall, c = room.clear, zb = room.floorZ, zh = zb + 200, zrh = room.ceilZ - 150;
  const P = (u, v, z) => { const q = T(u, v); return [q[0], q[1], z]; };
  const pumps = room.items.filter((i) => i.kind === 'pump'), filters = room.items.filter((i) => i.kind === 'filter');
  const ends = (systems, at) => {
    const zs = new Set();
    for (const p of layout.pipes) if (systems.includes(p.system)) for (const q of [p.pts[0], p.pts[p.pts.length - 1]]) if (Math.hypot(q[0] - at[0], q[1] - at[1]) < 0.5) zs.add(q[2]);
    return [...zs];
  };
  const sz = ends(['surface', 'drain', 'overflow'], layout.entry);
  if (sz.length && pumps.length) {
    for (const z of sz) seg('suction', circ.lines.surface.dn, [[layout.entry[0], layout.entry[1], z], P(trw + 250, 0, z)], circ.flow);
    seg('suction', Math.max(circ.lines.surface.dn, circ.lines.drain.dn), [P(trw + 250, 0, Math.max(...sz, zh)), P(trw + 250, 0, Math.min(...sz, zh))], circ.flow);
    const vs = [0, ...pumps.map((p) => p.vc)];
    seg('suction', Math.max(circ.lines.surface.dn, circ.lines.drain.dn), [P(trw + 250, Math.min(...vs), zh), P(trw + 250, Math.max(...vs), zh)], circ.flow);
  }
  const rz = ends(['ret', 'jet'], layout.entryR);
  const retDn = Math.max(circ.lines.ret.dn, circ.lines.jet ? circ.lines.jet.dn : 0);
  pumps.forEach((p, i) => {
    const f = filters[i] || filters[0];
    if (sz.length) seg('suction', circ.lines.surface.dn, [P(trw + 250, p.vc, zh), P(p.u0, p.vc, zh)], circ.pump.flowEach);
    fixed.push({ owner: 'pump-' + p.n, key: 'pump-' + p.n + ':in', at: P(p.u0, p.vc, zh), dir: unit(sub(P(p.u0 - 1, p.vc, zh), P(p.u0, p.vc, zh))), flow: 'SINK', system: 'suction' });
    fixed.push({ owner: 'pump-' + p.n, key: 'pump-' + p.n + ':out', at: P(p.u0 + p.wu, p.vc, zh), dir: unit(sub(P(p.u0 + p.wu + 1, p.vc, zh), P(p.u0 + p.wu, p.vc, zh))), flow: 'SOURCE', system: 'link' });
    if (!f) return;
    const uf = f.u0 + f.wu / 2, top = zb + f.h, up = top + 150;
    seg('link', circ.lines.ret.dn, [P(p.u0 + p.wu, p.vc, zh), P(p.u0 + p.wu + 150, p.vc, zh), P(p.u0 + p.wu + 150, p.vc, up), P(uf, p.vc, up), P(uf, f.vc, up), P(uf, f.vc, top)], circ.pump.flowEach);
  });
  filters.forEach((f) => {
    const uf = f.u0 + f.wu / 2;
    fixed.push({ owner: 'filter-' + f.n, key: 'filter-' + f.n + ':in', at: P(uf, f.vc, zb + f.h), dir: [0, 0, 1], flow: 'SINK', system: 'link' });
    fixed.push({ owner: 'filter-' + f.n, key: 'filter-' + f.n + ':out', at: P(f.u0, f.vc, zb + 600), dir: unit(sub(P(f.u0 - 1, f.vc, 0), P(f.u0, f.vc, 0))), flow: 'SOURCE', system: 'return' });
    if (rz.length) seg('return', retDn, [P(f.u0, f.vc, zb + 600), P(trw + 100, f.vc, zb + 600), P(trw + 100, f.vc, zrh)], circ.pump.flowEach);
  });
  if (rz.length && filters.length) {
    const vs = [400, ...filters.map((f) => f.vc)];
    seg('return', retDn, [P(trw + 100, Math.min(...vs), zrh), P(trw + 100, Math.max(...vs), zrh)], circ.flow);
    const zz = [...rz, zrh];
    seg('return', retDn, [P(trw + 100, 400, Math.min(...zz)), P(trw + 100, 400, Math.max(...zz))], circ.flow);
    for (const z of rz) seg('return', retDn, [[layout.entryR[0], layout.entryR[1], z], P(trw + 100, 400, z)], circ.flow);
  }

  // ---- cut every segment where another one ends on it
  const pts = new Map();
  const note = (p) => pts.set(K(p), p);
  for (const s of raw) { note(s.a); note(s.b); }
  for (const f of fixed) note(f.at);
  const all = [...pts.values()];
  let segs = [];
  for (const s of raw) {
    const cuts = [];
    for (const p of all) { const t = onSeg(p, s.a, s.b); if (t !== null) cuts.push([t, p]); }
    cuts.sort((x, y) => x[0] - y[0]);
    let a = s.a;
    for (const [, p] of cuts) { segs.push({ ...s, a, b: p }); a = p; }
    segs.push({ ...s, a, b: s.b });
  }
  const seen = new Set();
  segs = segs.filter((s) => { const k = [K(s.a), K(s.b)].sort().join('|'); if (seen.has(k) || len(sub(s.a, s.b)) < 0.5) return false; seen.add(k); return true; });

  // ---- which way the water goes: toward the pumps (suction), away from the filters (return); pump-to-filter pipes as drawn
  const adj = new Map();
  segs.forEach((s, i) => { s.i = i; for (const [k, o] of [[K(s.a), K(s.b)], [K(s.b), K(s.a)]]) { if (!adj.has(k)) adj.set(k, []); adj.get(k).push([i, o]); } });
  const dist = (side, roots) => {
    const D = new Map(), q = [];
    for (const r of roots) { D.set(r, 0); q.push(r); }
    while (q.length) { const k = q.shift(); for (const [i, o] of adj.get(k) || []) { if (segs[i].side !== side || D.has(o)) continue; D.set(o, D.get(k) + 1); q.push(o); } }
    return D;
  };
  const Ds = dist('suction', fixed.filter((f) => f.key.endsWith(':in') && f.owner.startsWith('pump-')).map((f) => K(f.at)));
  const Dr = dist('return', fixed.filter((f) => f.key.endsWith(':out') && f.owner.startsWith('filter-')).map((f) => K(f.at)));
  for (const s of segs) {
    const ka = K(s.a), kb = K(s.b);
    if (s.side === 'suction' && Ds.has(ka) && Ds.has(kb) && Ds.get(ka) < Ds.get(kb)) [s.a, s.b] = [s.b, s.a];
    if (s.side === 'return' && Dr.has(ka) && Dr.has(kb) && Dr.get(ka) > Dr.get(kb)) [s.a, s.b] = [s.b, s.a];
    s.loose = (s.side === 'suction' && !Ds.has(ka)) || (s.side === 'return' && !Dr.has(ka));
  }

  // ---- ports, fittings, connections
  const ports = [], links = [], fittings = [];
  const byNode = new Map();
  const at = (k) => { if (!byNode.has(k)) byNode.set(k, { ends: [], fixed: [] }); return byNode.get(k); };
  segs.forEach((s, n) => {
    s.key = 'pipe-' + (n + 1);
    const dir = unit(sub(s.b, s.a));
    s.ports = [
      { key: s.key + ':a', owner: s.key, at: s.a, dir: dir.map((v) => -v), flow: 'SINK', system: s.system },
      { key: s.key + ':b', owner: s.key, at: s.b, dir, flow: 'SOURCE', system: s.system },
    ];
    ports.push(...s.ports);
    at(K(s.a)).ends.push({ s, port: s.ports[0], out: dir });
    at(K(s.b)).ends.push({ s, port: s.ports[1], out: dir.map((v) => -v) });
  });
  for (const f of fixed) { at(K(f.at)).fixed.push(f); ports.push(f); }
  let open = 0, fitN = 0;
  for (const [k, node] of byNode) {
    const { ends, fixed: fx } = node;
    const pos = ends.length ? (ends[0].port.at) : fx[0].at;
    if (ends.length === 1 && fx.length === 1) { links.push([ends[0].port.key, fx[0].key]); continue; }
    if (ends.length === 1 && !fx.length) { open++; continue; }
    if (!ends.length) { open += fx.length; continue; }
    if (ends.length === 2 && !fx.length && dot(ends[0].out, ends[1].out) < -0.9999) { links.push([ends[0].port.key, ends[1].port.key]); continue; }
    const kind = ends.length + fx.length === 2 ? 'BEND' : 'JUNCTION';
    const dn = Math.max(...ends.map((e) => e.s.dn));
    const key = 'fit-' + (++fitN), fps = [];
    for (const e of ends) {
      const into = e.port.flow === 'SOURCE';   // the segment's outlet ends here: water comes into the fitting
      const p = { key: key + ':' + fps.length, owner: key, at: pos, dir: e.out, flow: into ? 'SINK' : 'SOURCE', system: e.s.system };
      fps.push(p); links.push([e.port.key, p.key]);
    }
    for (const f of fx) { const p = { key: key + ':' + fps.length, owner: key, at: pos, dir: f.dir.map((v) => -v), flow: f.flow === 'SOURCE' ? 'SINK' : 'SOURCE', system: f.system }; fps.push(p); links.push([f.key, p.key]); }
    ports.push(...fps);
    fittings.push({ key, kind, at: pos, dn, system: ends[0].s.system, ports: fps, node: k });
  }

  // ---- elements
  const elements = [];
  for (const s of segs) {
    const L = len(sub(s.b, s.a));
    elements.push({ key: s.key, group: 'pipes', ifc: 'IFCPIPESEGMENT', predefined: 'RIGIDSEGMENT', objectType: s.system.toUpperCase(), name: NAME[s.system] + ' DN' + s.dn, material: 'plastic',
      color: COLORS[s.system] || COLOR[s.side] || COLORS.link, alpha: 1, pieces: [cyl(s.a, s.b, s.dn / 2, 8)], ports: s.ports,
      props: { System: s.system, NominalMm: s.dn, LengthMm: L, FlowM3h: s.flow || 0, ...(s.run !== null ? { Run: s.run + 1 } : {}) }, qty: { length: L } });
  }
  for (const f of fittings) {
    const h = f.dn * 0.7;
    elements.push({ key: f.key, group: 'pipes', ifc: 'IFCPIPEFITTING', predefined: f.kind, objectType: f.system.toUpperCase(), name: (f.kind === 'BEND' ? 'Bend' : 'Junction') + ' DN' + f.dn, material: 'plastic',
      color: COLORS.fitting, alpha: 1, pieces: [box(f.at[0] - h, f.at[1] - h, f.at[2] - h, f.at[0] + h, f.at[1] + h, f.at[2] + h)], ports: f.ports,
      props: { System: f.system, NominalMm: f.dn, Ports: f.ports.length }, qty: {} });
  }
  const owned = new Map();
  for (const f of fixed) { if (!owned.has(f.owner)) owned.set(f.owner, []); owned.get(f.owner).push(f); }
  return { segments: segs, fittings, ports, links, open, elements, owned, length: segs.reduce((s, x) => s + len(sub(x.b, x.a)), 0) };
}

/** Pipe totals by system and size from a network: [{ system, dn, length m, bends, junctions }]. */
export function pipeTotals(net) {
  const by = new Map();
  const row = (system, dn) => { const k = system + ':' + dn; if (!by.has(k)) by.set(k, { system, dn, length: 0, bends: 0, junctions: 0 }); return by.get(k); };
  for (const s of net.segments) row(s.system, s.dn).length += len(sub(s.b, s.a)) / 1000;
  for (const f of net.fittings) { const r = row(f.system, f.dn); if (f.kind === 'BEND') r.bends++; else r.junctions++; }
  return [...by.values()].sort((a, b) => a.system.localeCompare(b.system) || a.dn - b.dn);
}
export { pathLen };
