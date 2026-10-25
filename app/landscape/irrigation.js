/* SPDX-License-Identifier: Apache-2.0 */
/**
 * irrigation.js — the Landscape workspace's irrigation design aid (0.7 LD.5, session `landscape`). No DOM. A CALCULATION AID,
 * NOT A STAMPED DESIGN: an irrigation designer checks every result (the help says so). Internally SI: metres, kPa, L/min;
 * the UI shows psi / gpm / inches in a feet project. Positions are project coordinates (converted with unitM).
 *
 * Heads come from a manufacturer-neutral catalog we wrote (GENERIC_HEADS, CC0: flows from the precipitation-rate formula, not
 * any maker's product) plus the project's own heads; a maker's row is accepted only with a recorded permission
 * (docs/landscape/PERMISSION-LETTERS.md: `source.kind === 'maker'` needs `source.grant`).
 *
 * state.landscape.irrigation = {
 *   supply: null | { x, y, pressure (kPa, static at the point of connection), flow (L/min available), loss (kPa: meter, backflow) },
 *   heads:  [{ id, x, y, type (catalog key), arc (deg), rot (deg, where the arc starts, counter-clockwise from east), radius (m | null = the type's) }],
 *   pipes:  [{ id, kind: 'main'|'lateral', a: {x,y}, b: {x,y}, size (PIPE_SIZES key) }],
 *   valves: [{ id, x, y, name }]         a valve starts a zone: every lateral reachable from it, and the heads on them
 *   drips:  [{ id, pts, q (L/h per emitter), spacing (m), size }]   a drip line fed at its first point
 *   catalog: [own heads], settings: { C, vMax (m/s), valveLoss (kPa), weekly (mm of water a week), joinTol (m) }
 * }
 *
 *   GENERIC_HEADS · PIPE_SIZES · cleanIrrigation(obj) · readHeads(list) (untrusted; maker rows need a grant)
 *   hazenWilliams({ Q (L/min), d (m), L (m), C }) → { hf (m of head), kPa, v (m/s) }   hf = 10.67 L Q^1.852 / (C^1.852 d^4.8704)
 *   psiPer100ft(Qgpm, dIn, C) = 4.52 Q^1.852 / (C^1.852 d^4.87) × 100   (the US form, same equation)
 *   outletFactor(N, { m = 1.852, firstFull = true })   Christiansen's multiple-outlet factor
 *   precipRate(flowLmin, areaM2) → mm/h · headFlow(head, type) · headRadius · spacingPR(type, spacing, pattern)
 *   analyse(irr, units, zAt) → { zones: [{ id, name, heads, flow, pressureNeed, worst, pr, minutes, problems }], main, supply, problems, bom }
 *   coverage(irr, units, area?, { cell }) → { covered, double, dry, cells }   head-to-head check: spacing vs radius
 */

import { unitM } from './planting.js';

export const G = 9.80665;                       // kPa per metre of water (ρ g / 1000)
export const KPA_PER_PSI = 6.894757;
export const LMIN_PER_GPM = 3.785412;

/** Generic heads, written by CadCraft (CC0): typical ranges for each kind of head, flows worked out from a design
 *  precipitation rate so heads of one kind are matched (flow ∝ arc). Not any maker's product; check against the heads used. */
// i18n-ignore-start: file data; the page shows each generic head by its own key (ls.i.h.<key>)
export const GENERIC_HEADS = [
  { key: 'spray-3', kind: 'spray', name: 'Generic fixed spray, 3 m', radius: 3, pr: 40, pressure: { min: 140, nominal: 205, max: 310 }, arcs: [90, 180, 270, 360] },
  { key: 'spray-4.5', kind: 'spray', name: 'Generic fixed spray, 4.5 m', radius: 4.5, pr: 40, pressure: { min: 140, nominal: 205, max: 310 }, arcs: [90, 180, 270, 360] },
  { key: 'rotary-5', kind: 'rotary', name: 'Generic rotary nozzle, 5 m', radius: 5, pr: 10, pressure: { min: 205, nominal: 275, max: 380 }, arcs: [90, 180, 270, 360], adjustable: true },
  { key: 'rotor-9', kind: 'rotor', name: 'Generic gear rotor, 9 m', radius: 9, pr: 13, pressure: { min: 240, nominal: 310, max: 450 }, arcs: [90, 180, 270, 360], adjustable: true },
  { key: 'rotor-14', kind: 'rotor', name: 'Generic gear rotor, 14 m', radius: 14, pr: 13, pressure: { min: 280, nominal: 380, max: 520 }, arcs: [90, 180, 270, 360], adjustable: true },
  { key: 'bubbler', kind: 'bubbler', name: 'Generic bubbler', radius: 0.5, flow: 1.9, pressure: { min: 100, nominal: 205, max: 410 }, arcs: [360] },
  { key: 'microspray', kind: 'microspray', name: 'Generic micro-spray', radius: 1.5, flow: 0.5, pressure: { min: 100, nominal: 140, max: 250 }, arcs: [90, 180, 360] },
  { key: 'emitter-4', kind: 'emitter', name: 'Generic point emitter, 4 L/h', radius: 0.2, flow: 4 / 60, pressure: { min: 70, nominal: 140, max: 350 }, arcs: [360] },
].map((h) => ({ ...h, source: { kind: 'generic', note: 'CadCraft generic head (CC0)' } }));
// i18n-ignore-end

/** Pipe sizes: inside diameters worked out from the standard outside diameters and the dimension ratio (ID = OD − 2·OD/SDR),
 *  US IPS PVC (SDR 21, class 200) and metric PE/PVC (SDR 11). C = 150 for new plastic pipe (a labelled default). */
// i18n-ignore-start: pipe size notation (nominal size, material, dimension ratio), as printed on the pipe
const IPS_OD = [['1/2', 0.84], ['3/4', 1.05], ['1', 1.315], ['1-1/4', 1.66], ['1-1/2', 1.9], ['2', 2.375], ['2-1/2', 2.875], ['3', 3.5], ['4', 4.5]];
const METRIC_OD = [16, 20, 25, 32, 40, 50, 63, 75, 90, 110];
export const PIPE_SIZES = [
  ...IPS_OD.map(([n, od]) => { const sdr = n === '1/2' ? 13.5 : 21; return { key: 'ips-' + n, label: n + '" PVC SDR ' + sdr, id: (od - (2 * od) / sdr) * 0.0254, system: 'ft' }; }),
  ...METRIC_OD.map((od) => ({ key: 'pe-' + od, label: od + ' mm PE SDR 11', id: (od - (2 * od) / 11) / 1000, system: 'm' })),
];
// i18n-ignore-end
export const sizeOf = (key) => PIPE_SIZES.find((s) => s.key === key) || null;
export const DEFAULT_SETTINGS = { C: 150, vMax: 1.5, valveLoss: 20, weekly: 25, joinTol: 0.05 };

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const XY = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
const ID = (v, p) => (new RegExp('^' + p + '\\d{1,9}$').test(String(v)) ? String(v) : null);

// ---- the hydraulics ----
export function hazenWilliams({ Q, d, L, C = 150 }) {
  const q = Q / 60000;   // m³/s
  if (!(q > 0) || !(d > 0)) return { hf: 0, kPa: 0, v: 0 };
  const hf = (10.67 * L * q ** 1.852) / (C ** 1.852 * d ** 4.8704);
  return { hf, kPa: hf * G, v: q / ((Math.PI * d * d) / 4) };
}
export const psiPer100ft = (Qgpm, dIn, C = 150) => (4.52 * Qgpm ** 1.852) / (C ** 1.852 * dIn ** 4.87) * 100;
/** Christiansen (1942): F = 1/(m+1) + 1/(2N) + √(m−1)/(6N²) with the first outlet a full spacing from the inlet; else the
 *  half-spacing form F = 2N/(2N−1) · (1/(m+1) + √(m−1)/(6N²)). */
export function outletFactor(N, { m = 1.852, firstFull = true } = {}) {
  if (!(N >= 1)) return 1;
  if (N === 1) return 1;
  const a = 1 / (m + 1), c = Math.sqrt(m - 1) / (6 * N * N);
  return firstFull ? a + 1 / (2 * N) + c : ((2 * N) / (2 * N - 1)) * (a + c);
}
export const precipRate = (flowLmin, areaM2) => (areaM2 > 0 ? (60 * flowLmin) / areaM2 : 0);   // mm/h
export const prInches = (gpm, areaFt2) => (areaFt2 > 0 ? (96.3 * gpm) / areaFt2 : 0);        // in/h, the US form

// ---- heads ----
export function readHeads(list) {
  const out = [], notes = [];
  for (const h of Array.isArray(list) ? list.slice(0, 500) : []) {
    if (!h || typeof h !== 'object' || !/^[a-z0-9-]{1,40}$/.test(h.key)) { notes.push('shape'); continue; }
    const src = h.source && typeof h.source === 'object' ? h.source : { kind: 'own' };
    if (src.kind === 'maker' && !(typeof src.grant === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(src.grant) && src.maker && src.licence)) { notes.push('no-grant'); continue; }   // no grant, no row
    const p = h.pressure || {};
    const pressure = { min: fin(p.min) && p.min > 0 ? p.min : 100, nominal: fin(p.nominal) && p.nominal > 0 ? p.nominal : 200, max: fin(p.max) && p.max > 0 ? p.max : 400 };
    if (!(pressure.min <= pressure.nominal && pressure.nominal <= pressure.max)) { notes.push('pressure'); continue; }
    const radius = fin(h.radius) && h.radius > 0 && h.radius < 100 ? h.radius : null;
    const flow = fin(h.flow) && h.flow > 0 && h.flow < 1000 ? h.flow : null, pr = fin(h.pr) && h.pr > 0 && h.pr < 500 ? h.pr : null;
    if (!radius || (!flow && !pr)) { notes.push('size'); continue; }
    out.push({ key: h.key, kind: ['spray', 'rotary', 'rotor', 'bubbler', 'microspray', 'emitter'].includes(h.kind) ? h.kind : 'spray', name: str(h.name) || h.key, radius, ...(flow ? { flow } : {}), ...(pr ? { pr } : {}), pressure,
      arcs: Array.isArray(h.arcs) ? h.arcs.filter((a) => fin(a) && a > 0 && a <= 360).slice(0, 12) : [360], adjustable: h.adjustable === true,
      source: src.kind === 'maker' ? { kind: 'maker', maker: str(src.maker), grant: src.grant, licence: str(src.licence, 40), url: str(src.url, 300), attribution: str(src.attribution, 300) } : { kind: 'own', note: str(src.note, 200) } });
  }
  return { heads: out, notes };
}
export const catalogOf = (irr) => new Map([...GENERIC_HEADS, ...(irr?.catalog || [])].map((h) => [h.key, h]));
export const headRadius = (h, type) => h.radius ?? type?.radius ?? 0;
/** A head's flow (L/min): the type's own, else from its design precipitation rate — quoted, as catalogs do, at head-to-head
 *  square spacing (spacing = radius): flow = pr × r² × arc/360 (matched precipitation: a half circle gives half the flow). */
export function headFlow(h, type) {
  if (!type) return 0;
  if (type.flow && !type.pr) return type.flow * (type.kind === 'microspray' ? h.arc / 360 : 1);
  const r = headRadius(h, type);
  return (type.pr * r * r * (h.arc || 360)) / 360 / 60;
}
/** The square cell a head waters at head-to-head spacing (m²): r² × arc/360. */
export const headCell = (h, type) => { const r = headRadius(h, type); return (r * r * (h.arc || 360)) / 360; };
/** The precipitation rate of heads of one type set out at `spacing` (m): square or triangular. */
export function spacingPR(type, spacing, pattern = 'square') {
  const full = headFlow({ arc: 360, radius: null }, type);
  const area = pattern === 'triangle' ? spacing * spacing * 0.866 : spacing * spacing;
  return precipRate(full, area);
}

export function cleanIrrigation(obj) {
  const s = { supply: null, heads: [], pipes: [], valves: [], drips: [], catalog: [], settings: { ...DEFAULT_SETTINGS } };
  if (!obj || typeof obj !== 'object') return s;
  const sp = obj.supply;
  if (sp && XY(sp) && fin(sp.pressure) && sp.pressure > 0 && sp.pressure < 5000) s.supply = { ...XY(sp), pressure: sp.pressure, flow: fin(sp.flow) && sp.flow > 0 && sp.flow < 1e5 ? sp.flow : 0, loss: fin(sp.loss) && sp.loss >= 0 && sp.loss < 1000 ? sp.loss : 0 };
  s.catalog = readHeads(obj.catalog).heads;
  const keys = catalogOf(s);
  for (const h of Array.isArray(obj.heads) ? obj.heads.slice(0, 20000) : []) {
    const q = XY(h), id = ID(h?.id, 'i');
    if (!q || !id || !keys.has(h.type)) continue;
    s.heads.push({ id, ...q, type: h.type, arc: fin(h.arc) && h.arc > 0 && h.arc <= 360 ? h.arc : 360, rot: fin(h.rot) ? ((h.rot % 360) + 360) % 360 : 0, radius: fin(h.radius) && h.radius > 0 && h.radius < 100 ? h.radius : null });
  }
  for (const p of Array.isArray(obj.pipes) ? obj.pipes.slice(0, 20000) : []) {
    const a = XY(p?.a), b = XY(p?.b), id = ID(p?.id, 'i');
    if (!a || !b || !id || !sizeOf(p.size)) continue;
    s.pipes.push({ id, kind: p.kind === 'main' ? 'main' : 'lateral', a, b, size: p.size });
  }
  for (const v of Array.isArray(obj.valves) ? obj.valves.slice(0, 500) : []) { const q = XY(v), id = ID(v?.id, 'i'); if (q && id) s.valves.push({ id, ...q, name: str(v.name) || id }); }
  for (const d of Array.isArray(obj.drips) ? obj.drips.slice(0, 2000) : []) {
    const pts = (Array.isArray(d?.pts) ? d.pts.slice(0, 5000) : []).map(XY).filter(Boolean), id = ID(d?.id, 'i');
    if (pts.length < 2 || !id || !sizeOf(d.size)) continue;
    s.drips.push({ id, pts, q: fin(d.q) && d.q > 0 && d.q < 100 ? d.q : 2, spacing: fin(d.spacing) && d.spacing >= 0.05 && d.spacing <= 5 ? d.spacing : 0.3, size: d.size });
  }
  const st = obj.settings || {};
  s.settings = { C: fin(st.C) && st.C >= 60 && st.C <= 160 ? st.C : 150, vMax: fin(st.vMax) && st.vMax > 0 && st.vMax <= 5 ? st.vMax : 1.5, valveLoss: fin(st.valveLoss) && st.valveLoss >= 0 && st.valveLoss < 500 ? st.valveLoss : 20,
    weekly: fin(st.weekly) && st.weekly > 0 && st.weekly < 500 ? st.weekly : 25, joinTol: fin(st.joinTol) && st.joinTol > 0 && st.joinTol < 5 ? st.joinTol : 0.05 };
  return s;
}

// ---- the network: nodes where pipe ends meet, trees from each valve (laterals) and from the supply (main) ----
function network(irr, units) {
  const k = unitM(units), tol = irr.settings.joinTol / k, nodes = [], at = (p) => {
    for (const n of nodes) if (Math.hypot(n.x - p.x, n.y - p.y) <= tol) return n;
    const n = { i: nodes.length, x: p.x, y: p.y, edges: [], heads: [], drips: [] };
    nodes.push(n);
    return n;
  };
  for (const p of irr.pipes) { const a = at(p.a), b = at(p.b); a.edges.push({ p, to: b }); b.edges.push({ p, to: a }); }
  for (const h of irr.heads) { const n = nodes.find((m) => Math.hypot(m.x - h.x, m.y - h.y) <= tol); if (n) n.heads.push(h); }
  for (const d of irr.drips) { const n = nodes.find((m) => Math.hypot(m.x - d.pts[0].x, m.y - d.pts[0].y) <= tol); if (n) n.drips.push(d); }
  const nodeAt = (p) => nodes.find((m) => Math.hypot(m.x - p.x, m.y - p.y) <= tol) || null;
  return { nodes, nodeAt, k };
}
const dripLen = (d, k) => { let L = 0; for (let i = 0; i + 1 < d.pts.length; i++) L += Math.hypot(d.pts[i + 1].x - d.pts[i].x, d.pts[i + 1].y - d.pts[i].y); return L * k; };
export const dripFlow = (d, k) => (Math.floor(dripLen(d, k) / d.spacing) + 1) * (d.q / 60);   // L/min

/** Every zone (from its valve, through laterals only) with its flow, the pressure it needs at the valve, the worst head;
 *  then the mainline from the supply to each valve. zAt(x, y) = ground elevation (project units) or null. */
export function analyse(irr, units, zAt = null) {
  const { nodes, nodeAt, k } = network(irr, units), cat = catalogOf(irr), S = irr.settings, problems = [];
  const elev = (p) => { const z = zAt ? zAt(p.x, p.y) : null; return fin(z) ? z * k : 0; };
  const zones = [];
  const inZone = new Set();
  for (const v of irr.valves) {
    const root = nodeAt(v);
    const zone = { id: v.id, name: v.name, valve: v, heads: [], drips: [], flow: 0, pipes: [], problems: [], pressureNeed: 0, worst: null, pr: 0, minutes: 0, length: 0 };
    zones.push(zone);
    if (!root) { zone.problems.push({ key: 'novalve' }); continue; }
    // the lateral tree: depth-first from the valve, never along a main; a node met twice = a loop
    const parent = new Map([[root.i, null]]), order = [root];
    for (let q = 0; q < order.length; q++) {
      const n = order[q];
      for (const e of n.edges) {
        if (e.p.kind !== 'lateral') continue;
        if (parent.has(e.to.i)) { if (e.p !== parent.get(n.i)?.p && e.p !== parent.get(e.to.i)?.p && !zone.problems.some((x) => x.key === 'loop')) zone.problems.push({ key: 'loop' }); continue; }   // met again by another pipe: a loop
        parent.set(e.to.i, { from: n, p: e.p, to: e.to });
        order.push(e.to);
      }
    }
    for (const n of order) { for (const h of n.heads) { zone.heads.push(h); inZone.add(h.id); } zone.drips.push(...n.drips); }
    // flows: each node's own heads and drips, summed upstream
    const own = new Map(order.map((n) => [n.i, n.heads.reduce((a, h) => a + headFlow(h, cat.get(h.type)), 0) + n.drips.reduce((a, d) => a + dripFlow(d, k), 0)]));
    const down = new Map(order.map((n) => [n.i, own.get(n.i)]));
    for (let q = order.length - 1; q > 0; q--) { const n = order[q], par = parent.get(n.i); down.set(par.from.i, down.get(par.from.i) + down.get(n.i)); }
    zone.flow = down.get(root.i);
    // pressure: worked backwards from each head's need, the largest at the valve wins (the worst-case head)
    const lossTo = new Map([[root.i, 0]]);
    for (const n of order.slice(1)) {
      const par = parent.get(n.i), L = Math.hypot(n.x - par.from.x, n.y - par.from.y) * k, sz = sizeOf(par.p.size);
      const hw = hazenWilliams({ Q: down.get(n.i), d: sz.id, L, C: S.C });
      lossTo.set(n.i, lossTo.get(par.from.i) + hw.kPa + (elev(n) - elev(par.from)) * G);
      zone.pipes.push({ id: par.p.id, size: par.p.size, L, Q: down.get(n.i), v: hw.v, kPa: hw.kPa });
      zone.length += L;
      if (hw.v > S.vMax + 1e-9) zone.problems.push({ key: 'velocity', id: par.p.id, v: hw.v, max: S.vMax });
    }
    for (const n of order) for (const h of n.heads) {
      const ty = cat.get(h.type), need = (ty?.pressure.nominal ?? 200) + lossTo.get(n.i);
      if (!zone.worst || need > zone.worst.need) zone.worst = { head: h.id, need, loss: lossTo.get(n.i), x: h.x, y: h.y };
    }
    for (const n of order) for (const d of n.drips) { const need = 140 + lossTo.get(n.i); if (!zone.worst || need > zone.worst.need) zone.worst = { drip: d.id, need, loss: lossTo.get(n.i), x: d.pts[0].x, y: d.pts[0].y }; }
    zone.pressureNeed = zone.worst ? zone.worst.need + S.valveLoss : 0;
    // every head then works at the valve pressure less its own losses: inside its range?
    for (const n of order) for (const h of n.heads) {
      const ty = cat.get(h.type), p = zone.pressureNeed - S.valveLoss - lossTo.get(n.i);
      if (ty && (p > ty.pressure.max + 1e-9)) zone.problems.push({ key: 'overpressure', id: h.id, p, max: ty.pressure.max });
    }
    const kinds = new Set(zone.heads.map((h) => cat.get(h.type)?.kind));
    if (kinds.size > 1 && [...kinds].some((x) => x === 'spray') && [...kinds].some((x) => x === 'rotor' || x === 'rotary')) zone.problems.push({ key: 'mixed' });
    // precipitation: the heads' flow over the area they wet (full circles count their whole circle)
    const cells = zone.heads.reduce((a, h) => a + headCell(h, cat.get(h.type)), 0);   // each head's head-to-head cell
    zone.pr = cells > 0 ? precipRate(zone.heads.reduce((a, h) => a + headFlow(h, cat.get(h.type)), 0), cells) : 0;
    zone.minutes = zone.pr > 0 ? (S.weekly / zone.pr) * 60 : 0;
    if (!zone.heads.length && !zone.drips.length) zone.problems.push({ key: 'empty' });
  }
  for (const h of irr.heads) if (!inZone.has(h.id)) problems.push({ key: 'orphan', id: h.id });
  // mainline: from the supply through mains only to each valve; the zone that needs most at the supply governs
  const main = { worstZone: null, need: 0, pipes: [] };
  const sn = irr.supply ? nodeAt(irr.supply) : null;
  if (irr.supply && !sn) problems.push({ key: 'nosupply' });
  if (sn) {
    const parent = new Map([[sn.i, null]]), order = [sn];
    for (let q = 0; q < order.length; q++) for (const e of order[q].edges) if (e.p.kind === 'main' && !parent.has(e.to.i)) { parent.set(e.to.i, { from: order[q], p: e.p }); order.push(e.to); }
    for (const z of zones) {
      const vn = nodeAt(z.valve);
      if (!vn || !parent.has(vn.i)) { if (vn) z.problems.push({ key: 'nomain' }); continue; }
      let loss = 0;
      for (let n = vn; parent.get(n.i); n = parent.get(n.i).from) {
        const par = parent.get(n.i), L = Math.hypot(n.x - par.from.x, n.y - par.from.y) * k, sz = sizeOf(par.p.size);
        const hw = hazenWilliams({ Q: z.flow, d: sz.id, L, C: S.C });   // one zone runs at a time: the main carries that zone's flow
        loss += hw.kPa + (elev(n) - elev(par.from)) * G;
        if (hw.v > S.vMax + 1e-9 && !z.problems.some((x) => x.key === 'mainvel')) z.problems.push({ key: 'mainvel', id: par.p.id, v: hw.v, max: S.vMax });
      }
      z.atSupply = z.pressureNeed + loss + (irr.supply.loss || 0);
      if (z.atSupply > main.need) { main.need = z.atSupply; main.worstZone = z.id; }
      if (z.atSupply > irr.supply.pressure + 1e-9) z.problems.push({ key: 'pressure', need: z.atSupply, have: irr.supply.pressure });
      if (irr.supply.flow > 0 && z.flow > irr.supply.flow + 1e-9) z.problems.push({ key: 'flow', need: z.flow, have: irr.supply.flow });
    }
  }
  return { zones, main, problems, bom: billOfMaterials(irr, units) };
}

export function billOfMaterials(irr, units) {
  const k = unitM(units), cat = catalogOf(irr), heads = new Map(), pipes = new Map();
  for (const h of irr.heads) { const key = h.type + '|' + h.arc; const r = heads.get(key) || { type: h.type, name: cat.get(h.type)?.name || h.type, arc: h.arc, n: 0 }; r.n++; heads.set(key, r); }
  for (const p of irr.pipes) { const L = Math.hypot(p.b.x - p.a.x, p.b.y - p.a.y) * k, r = pipes.get(p.size) || { size: p.size, label: sizeOf(p.size)?.label || p.size, m: 0 }; r.m += L; pipes.set(p.size, r); }
  let drip = 0, emitters = 0;
  for (const d of irr.drips) { const L = dripLen(d, k); drip += L; emitters += Math.floor(L / d.spacing) + 1; }
  return { heads: [...heads.values()].sort((a, b) => a.name.localeCompare(b.name) || a.arc - b.arc), pipes: [...pipes.values()], drip, emitters, valves: irr.valves.length, stations: irr.valves.length };
}

/** Coverage on a grid inside `area` (or the heads' bounds): cells wet by none (dry), one, two or more heads; and the
 *  head-to-head check (every head reaches its nearest neighbour). */
export function coverage(irr, units, area = null, { cell = null, max = 200000 } = {}) {
  const k = unitM(units), cat = catalogOf(irr), heads = irr.heads.map((h) => ({ ...h, r: headRadius(h, cat.get(h.type)) / k }));
  if (!heads.length) return { cells: 0, dry: 0, single: 0, double: 0, far: [] };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const pts = area || heads.flatMap((h) => [{ x: h.x - h.r, y: h.y - h.r }, { x: h.x + h.r, y: h.y + h.r }]);
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  let c = cell || Math.max((x1 - x0) / 200, (y1 - y0) / 200);
  while (((x1 - x0) / c) * ((y1 - y0) / c) > max) c *= 1.5;
  const inArc = (h, x, y) => {
    const dx = x - h.x, dy = y - h.y, d = Math.hypot(dx, dy);
    if (d > h.r) return false;
    if (h.arc >= 360 || d < 1e-9) return true;
    const a = (((Math.atan2(dy, dx) * 180) / Math.PI - h.rot) % 360 + 360) % 360;
    return a <= h.arc + 1e-9;
  };
  const inside = (x, y) => { if (!area) return true; let w = false; for (let i = 0, j = area.length - 1; i < area.length; j = i++) { const a = area[i], b = area[j]; if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) w = !w; } return w; };
  let cells = 0, dry = 0, single = 0, dbl = 0;
  for (let x = x0 + c / 2; x < x1; x += c) for (let y = y0 + c / 2; y < y1; y += c) {
    if (!inside(x, y)) continue;
    cells++;
    let n = 0;
    for (const h of heads) if (inArc(h, x, y) && ++n >= 2) break;
    if (n === 0) dry++; else if (n === 1) single++; else dbl++;
  }
  const far = [];
  for (const h of heads) {
    let nd = Infinity;
    for (const o of heads) if (o !== h) nd = Math.min(nd, Math.hypot(o.x - h.x, o.y - h.y));
    if (heads.length > 1 && nd > h.r * 1.0001) far.push({ id: h.id, gap: nd * k, r: h.r * k });   // head-to-head: the nearest head is within this head's throw
  }
  return { cells, dry, single, double: dbl, cell: c, far };
}
