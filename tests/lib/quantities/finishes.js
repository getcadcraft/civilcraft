/* SPDX-License-Identifier: Apache-2.0 */
/**
 * finishes.js — the ONE finishes model: what covers the floor, the walls and the ceiling of each room, and what that takes
 * (0.10 BK.29, BK.39, BK.47; session bk-r3-schedules-10). Host-free: imports only rules.js beside it, no DOM, one unit in and
 * the same unit out (BimCraft: mm, mm², mm³). Canonical in lib/quantities/, copied by `node tools/quantities/sync.mjs`.
 *
 * THE DOCUMENT a project keeps (BimCraft: property set CadCraft_Finishes on IfcProject):
 *   { format: 'cadcraft-finishes', version: 1,
 *     finishes: [{ id, name, kind: 'tile' | 'sheet' | 'coat' | 'board', thickness, code?,
 *                  tile?: { length, width, joint, waste (percent) },            only for kind 'tile'
 *                  substrate?: { name, thickness } }…],                           what goes under it (screed, backing board, plaster)
 *     rooms: { <room key>: { floor?: finish id, walls?: finish id, ceiling?: finish id, skirting?: { name, height } } },
 *     zones: [{ id, name, room: <room key>, surface: 'wall' | 'floor' | 'ceiling', finish: finish id,
 *               from, to,            wall zone: a band between two heights above the floor, on …
 *               walls?: [wall key…], … these walls of the room (none = every wall of the room)
 *               area }…] }           floor or ceiling zone: a typed area, taken out of the room's own finish
 *   A room key and a wall key are the host's own stable names (BimCraft: GlobalIds).
 *
 * WHAT IS MEASURED, AND HOW (stated in the schedules' note; the host shows FINISH_RULES through its language file):
 *   wall      each stretch of wall on the room's side: its length along the room × the height the finish covers, less the
 *             doors and windows in that stretch (the part of each inside the covered height). The project's measurement method
 *             decides which openings are too small to deduct ('finish.wall'), tested on the part inside the covered height.
 *   floor     the room inside its wall faces, less the islands inside it. ceiling: the same, by the method's 'finish.ceiling'.
 *   skirting  the room's wall length less the width of its doors.
 *   tiles     laid as a grid from one corner of the surface (the lowest corner of its box), one joint between tiles. A tile
 *             wholly on the surface is a WHOLE tile; a tile partly on it (an edge, a corner, round an opening) is a CUT tile.
 *             Tiles to order = (whole + cut) × (1 + waste), rounded up: every cut tile is counted as a new tile, offcuts are
 *             not reused. A surface with typed zones taken out of it, or over CELL_LIMIT tiles, is counted from its area
 *             instead and marked `estimated`.
 *   substrate volume = net area × the substrate's thickness. The finish's own volume = net area × its thickness.
 *
 *   cleanFinishes(raw) → { doc, errors: [{ code, at }] }     never throws; a wrong entry is left out and named
 *   emptyFinishes() · finishById(doc, id)
 *   tileCount({ outer, holes, tile }) → { whole, cut, cells, estimated }
 *   tilesToOrder({ whole, cut }, wastePct) → n
 *   surfaceOf(finish, measure, { outer, holes, estimate }) → { gross, deductions, net, tiles, substrate, volume }
 *   roomFinishes(doc, rooms, { rules }) → { rows, totals }
 *       rooms = [{ key, floor: { outer, holes } | null, ceiling: { outer, holes } | null, height,
 *                  edges: [{ wall (key | null), length, height? (the wall's own, when lower than the room), openings: [{ id, offset, width, sill, height, door }…] }…] }…]
 *       rows  = [{ room, surface: 'floor' | 'wall' | 'ceiling' | 'skirting', wall, zone, finish (the finish | null), name,
 *                  from, to, length, gross, deductions, net, tiles, substrate, volume, openings: [id…] }…]
 *       totals = [{ finish, name, kind, net, tiles: { whole, cut, order, estimated } | null, substrate: { name, volume } | null, volume, rows }…]
 */
import { measure, wallSide, outlineArea, addMeasures, deducts } from './rules.js';

export const FINISH_FORMAT = 'cadcraft-finishes';
export const FINISH_VERSION = 1;
export const FINISH_KINDS = ['tile', 'sheet', 'coat', 'board'];
export const SURFACES = ['floor', 'wall', 'ceiling'];
export const LIMITS = { finishes: 500, zones: 2000, rooms: 20000, name: 80, id: 64, walls: 200 };
export const CELL_LIMIT = 250000;
export const FINISH_RULES = ['wall', 'floor', 'ceiling', 'skirting', 'tiles', 'substrate'];

const plain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const tidy = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const pos = (v, max = 1e7) => typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= max;
const zeroPos = (v, max = 1e7) => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= max;
const ID_RE = /^[A-Za-z0-9_$.:-]{1,64}$/;

export const emptyFinishes = () => ({ format: FINISH_FORMAT, version: FINISH_VERSION, finishes: [], rooms: {}, zones: [] });
export const finishById = (doc, id) => (doc?.finishes || []).find((f) => f.id === id) || null;

export function cleanFinishes(raw) {
  const doc = emptyFinishes(), errors = [];
  const bad = (code, at) => errors.push({ code, at: String(at) });
  if (!plain(raw)) return { doc, errors };
  if (raw.format !== undefined && raw.format !== FINISH_FORMAT) { bad('format', 'format'); return { doc, errors }; }
  const ids = new Set();
  for (const f of (Array.isArray(raw.finishes) ? raw.finishes : []).slice(0, LIMITS.finishes)) {
    const at = 'finish ' + (plain(f) ? tidy(f.name || f.id, 40) : '?');
    if (!plain(f) || typeof f.id !== 'string' || !ID_RE.test(f.id) || ids.has(f.id)) { bad('finish_id', at); continue; }
    const name = tidy(f.name, LIMITS.name);
    if (!name) { bad('finish_name', at); continue; }
    if (!FINISH_KINDS.includes(f.kind)) { bad('finish_kind', at); continue; }
    if (!zeroPos(f.thickness ?? 0, 1e4)) { bad('finish_thickness', at); continue; }
    const out = { id: f.id, name, kind: f.kind, thickness: f.thickness ?? 0 };
    if (typeof f.code === 'string' && tidy(f.code, 40)) out.code = tidy(f.code, 40);
    if (f.kind === 'tile') {
      const t = f.tile;
      if (!plain(t) || !pos(t.length, 1e5) || !pos(t.width, 1e5) || !zeroPos(t.joint ?? 0, 1e3) || !zeroPos(t.waste ?? 0, 100)) { bad('finish_tile', at); continue; }
      out.tile = { length: t.length, width: t.width, joint: t.joint ?? 0, waste: t.waste ?? 0 };
    }
    if (f.substrate !== undefined && f.substrate !== null) {
      const s = f.substrate;
      if (!plain(s) || !tidy(s.name, LIMITS.name) || !pos(s.thickness, 1e4)) { bad('finish_substrate', at); continue; }
      out.substrate = { name: tidy(s.name, LIMITS.name), thickness: s.thickness };
    }
    ids.add(f.id);
    doc.finishes.push(out);
  }
  const key = (k) => (typeof k === 'string' && k.length >= 1 && k.length <= LIMITS.id && !/[\u0000-\u001f]/.test(k) ? k : null);
  const src = plain(raw.rooms) ? raw.rooms : {};
  for (const k of Object.keys(src).slice(0, LIMITS.rooms)) {
    const r = src[k], at = 'room ' + k.slice(0, 40);
    if (!key(k) || !plain(r)) { bad('room', at); continue; }
    const out = {};
    for (const s of ['floor', 'walls', 'ceiling']) {
      if (r[s] === undefined || r[s] === null || r[s] === '') continue;
      if (ids.has(r[s])) out[s] = r[s]; else bad('room_finish', at + ' ' + s);
    }
    if (r.skirting !== undefined && r.skirting !== null) {
      if (plain(r.skirting) && tidy(r.skirting.name, LIMITS.name) && pos(r.skirting.height, 1e4)) out.skirting = { name: tidy(r.skirting.name, LIMITS.name), height: r.skirting.height };
      else bad('room_skirting', at);
    }
    if (Object.keys(out).length) doc.rooms[k] = out;
  }
  const zids = new Set();
  for (const z of (Array.isArray(raw.zones) ? raw.zones : []).slice(0, LIMITS.zones)) {
    const at = 'zone ' + (plain(z) ? tidy(z.name || z.id, 40) : '?');
    if (!plain(z) || typeof z.id !== 'string' || !ID_RE.test(z.id) || zids.has(z.id)) { bad('zone_id', at); continue; }
    const name = tidy(z.name, LIMITS.name);
    if (!name || !key(z.room) || !SURFACES.includes(z.surface) || !ids.has(z.finish)) { bad('zone', at); continue; }
    const out = { id: z.id, name, room: z.room, surface: z.surface, finish: z.finish };
    if (z.surface === 'wall') {
      if (!zeroPos(z.from ?? 0, 1e6) || !pos(z.to, 1e6) || !(z.to > (z.from ?? 0))) { bad('zone_band', at); continue; }
      out.from = z.from ?? 0; out.to = z.to;
      if (Array.isArray(z.walls) && z.walls.length) { const w = [...new Set(z.walls.map(key).filter(Boolean))].slice(0, LIMITS.walls); if (w.length) out.walls = w; }
    } else {
      if (!pos(z.area, 1e13)) { bad('zone_area', at); continue; }
      out.area = z.area;
    }
    zids.add(z.id);
    doc.zones.push(out);
  }
  return { doc, errors };
}

// ---------------------------------------------------------------------------------------------- tiles
const polyArea = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - a[1] * b[0]; } return Math.abs(s) / 2; };
/** The part of a polygon inside an axis-aligned box (Sutherland–Hodgman against its four sides): its area. */
function clipArea(poly, x0, y0, x1, y1) {
  let p = poly;
  const cut = (inside, cross) => {
    const out = [];
    for (let i = 0; i < p.length; i++) {
      const a = p[i], b = p[(i + 1) % p.length], ia = inside(a), ib = inside(b);
      if (ia) out.push(a);
      if (ia !== ib) out.push(cross(a, b));
    }
    p = out;
  };
  const atX = (x) => (a, b) => [x, a[1] + (b[1] - a[1]) * (x - a[0]) / (b[0] - a[0])];
  const atY = (y) => (a, b) => [a[0] + (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]), y];
  cut((q) => q[0] >= x0, atX(x0)); if (p.length < 3) return 0;
  cut((q) => q[0] <= x1, atX(x1)); if (p.length < 3) return 0;
  cut((q) => q[1] >= y0, atY(y0)); if (p.length < 3) return 0;
  cut((q) => q[1] <= y1, atY(y1)); if (p.length < 3) return 0;
  return polyArea(p);
}
/**
 * Whole and cut tiles on a surface: `outer` its outline, `holes` what is cut out of it (openings, islands), both as point lists
 * in the surface's own plane. The grid starts at the lowest corner of the outline's box.
 */
export function tileCount({ outer, holes = [], tile }) {
  const none = { whole: 0, cut: 0, cells: 0, estimated: false };
  if (!Array.isArray(outer) || outer.length < 3 || !tile || !(tile.length > 0) || !(tile.width > 0)) return none;
  const j = tile.joint > 0 ? tile.joint : 0, px = tile.length + j, py = tile.width + j;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const q of outer) { x0 = Math.min(x0, q[0]); y0 = Math.min(y0, q[1]); x1 = Math.max(x1, q[0]); y1 = Math.max(y1, q[1]); }
  const eps = 1e-6 * Math.max(px, py);
  const nx = Math.max(1, Math.ceil((x1 - x0 - eps) / px)), ny = Math.max(1, Math.ceil((y1 - y0 - eps) / py));
  const full = tile.length * tile.width;
  if (nx * ny > CELL_LIMIT) {
    const net = Math.max(0, polyArea(outer) - holes.reduce((s, h) => s + polyArea(h), 0));
    return { whole: 0, cut: Math.ceil(net / (px * py)), cells: nx * ny, estimated: true };
  }
  const tiny = full * 1e-6;
  let whole = 0, cut = 0;
  for (let iy = 0; iy < ny; iy++) {
    for (let ix = 0; ix < nx; ix++) {
      const ax = x0 + ix * px, ay = y0 + iy * py, bx = ax + tile.length, by = ay + tile.width;
      let a = clipArea(outer, ax, ay, bx, by);
      if (a <= tiny) continue;
      for (const h of holes) { if (a <= tiny) break; a -= clipArea(h, ax, ay, bx, by); }
      if (a <= tiny) continue;
      if (a >= full - tiny) whole++; else cut++;
    }
  }
  return { whole, cut, cells: nx * ny, estimated: false };
}
export const tilesToOrder = (count, wastePct = 0) => Math.ceil(((count.whole || 0) + (count.cut || 0)) * (1 + (wastePct > 0 ? wastePct : 0) / 100) - 1e-9);

/** One surface under one finish: the areas as measured, the tiles when it is tiled, the substrate under it, its own volume. */
export function surfaceOf(finish, m, { outer = null, holes = [], estimate = false } = {}) {
  const out = { gross: m.gross, deductions: m.deductions, net: m.net, tiles: null, substrate: null, volume: 0 };
  if (!finish) return out;
  out.volume = m.net * (finish.thickness || 0);
  if (finish.substrate) out.substrate = { name: finish.substrate.name, thickness: finish.substrate.thickness, volume: m.net * finish.substrate.thickness };
  if (finish.kind === 'tile' && finish.tile && m.net > 0) {
    let c;
    if (outer && !estimate) c = tileCount({ outer, holes, tile: finish.tile });
    else c = { whole: 0, cut: Math.ceil(m.net / ((finish.tile.length + finish.tile.joint) * (finish.tile.width + finish.tile.joint)) - 1e-9), cells: 0, estimated: true };
    out.tiles = { whole: c.whole, cut: c.cut, order: tilesToOrder(c, finish.tile.waste), wastePct: finish.tile.waste, estimated: !!c.estimated };
  }
  return out;
}

const rect = (x0, y0, x1, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
/** What of [0, height] the bands leave: [[from, to]…]. */
function leftOver(height, bands) {
  let free = [[0, height]];
  for (const [a, b] of bands) free = free.flatMap(([f, t]) => (b <= f || a >= t ? [[f, t]] : [[f, Math.min(a, t)], [Math.max(b, f), t]].filter(([x, y]) => y - x > 1e-9)));
  return free;
}
/** A stretch of wall between two heights: its measure by the rule, its outline and the openings' boxes inside it. */
function band(edge, from, to, rule) {
  const holes = [], ops = [];
  for (const o of edge.openings || []) {
    const a = Math.max(from, o.sill || 0), b = Math.min(to, (o.sill || 0) + o.height);
    const x0 = Math.max(0, o.offset), x1 = Math.min(edge.length, o.offset + o.width);
    if (b - a <= 1e-9 || x1 - x0 <= 1e-9) continue;
    ops.push({ id: o.id, area: (x1 - x0) * (b - a), box: rect(x0, a, x1, b) });
  }
  const m = wallSide({ length: edge.length, height: to - from, openings: ops.map((o) => ({ id: o.id, area: o.area })), ...(rule ? { rule } : {}) });
  for (const o of ops) if (!rule || deducts(o.area, rule)) holes.push(o.box);   // the openings the method deducts are the ones no tile is laid on
  return { m, outer: rect(0, from, edge.length, to), holes, openings: ops.map((o) => o.id) };
}

export function roomFinishes(doc, rooms, { rules = {} } = {}) {
  const rows = [];
  const fin = (id) => finishById(doc, id);
  const push = (room, surface, finish, extra, s) => rows.push({ room: room.key, surface, wall: null, zone: null, finish, name: finish ? finish.name : '', from: null, to: null, length: null, openings: [], ...extra, ...s });
  for (const room of rooms || []) {
    const set = doc.rooms[room.key] || {};
    const zones = doc.zones.filter((z) => z.room === room.key);
    // ---- floor and ceiling: the room's own finish, less the typed zones
    for (const surface of ['floor', 'ceiling']) {
      const shape = room[surface], own = fin(set[surface]), zs = zones.filter((z) => z.surface === surface);
      if (!shape || (!own && !zs.length)) continue;
      const m = outlineArea(polyArea(shape.outer), (shape.holes || []).map(polyArea), surface === 'ceiling' ? (rules['finish.ceiling'] || null) : null);
      let taken = 0;
      for (const z of zs) {
        const a = Math.min(z.area, Math.max(0, m.net - taken));
        taken += a;
        push(room, surface, fin(z.finish), { zone: z.id, zoneName: z.name }, surfaceOf(fin(z.finish), measure(a, 0), { estimate: true }));
      }
      if (own) {
        const net = Math.max(0, m.net - taken);
        push(room, surface, own, {}, surfaceOf(own, taken > 0 ? { gross: m.gross, deductions: m.deductions + taken, net } : m, { outer: shape.outer, holes: shape.holes || [], estimate: taken > 0 }));
      }
    }
    // ---- walls: each stretch, the zones' bands first, the room's wall finish on what they leave
    const own = fin(set.walls), wz = zones.filter((z) => z.surface === 'wall');
    const rule = rules['finish.wall'] || null;
    for (const edge of room.edges || []) {
      const H = edge.height > 0 ? Math.min(room.height, edge.height) : room.height;   // a wall lower than the room is finished to its own top
      if (!(edge.length > 0) || !(H > 0)) continue;
      const mine = wz.filter((z) => !z.walls || (edge.wall !== null && z.walls.includes(edge.wall)));
      const bands = [];
      for (const z of mine) {
        const from = Math.min(z.from, H), to = Math.min(z.to, H);
        for (const [a, b] of leftOver(to, [[0, from], ...bands]).filter(([x, y]) => y > from && x < to)) {
          const B = band(edge, a, b, rule), f = fin(z.finish);
          push(room, 'wall', f, { wall: edge.wall, zone: z.id, zoneName: z.name, from: a, to: b, length: edge.length, openings: B.openings }, surfaceOf(f, B.m, { outer: B.outer, holes: B.holes }));
          bands.push([a, b]);
        }
      }
      if (own) for (const [a, b] of leftOver(H, bands)) {
        const B = band(edge, a, b, rule);
        push(room, 'wall', own, { wall: edge.wall, from: a, to: b, length: edge.length, openings: B.openings }, surfaceOf(own, B.m, { outer: B.outer, holes: B.holes }));
      }
    }
    // ---- skirting: the wall length less the doors
    if (set.skirting) {
      const len = (room.edges || []).reduce((s, e) => s + e.length, 0);
      const doors = (room.edges || []).flatMap((e) => (e.openings || []).filter((o) => o.door).map((o) => ({ id: o.id, w: Math.max(0, Math.min(e.length, o.offset + o.width) - Math.max(0, o.offset)) })));
      const m = measure(len, doors.map((d) => d.w));
      push(room, 'skirting', null, { name: set.skirting.name, to: set.skirting.height, length: m.net, openings: doors.map((d) => d.id) }, { gross: m.gross, deductions: m.deductions, net: m.net, tiles: null, substrate: null, volume: 0 });
    }
  }
  // ---- totals by finish
  const by = new Map();
  for (const r of rows) {
    if (!r.finish) continue;
    if (!by.has(r.finish.id)) by.set(r.finish.id, { finish: r.finish.id, name: r.finish.name, kind: r.finish.kind, parts: [], tiles: null, substrate: null, volume: 0, rows: 0 });
    const g = by.get(r.finish.id);
    g.parts.push(r); g.rows++; g.volume += r.volume;
    if (r.tiles) { g.tiles = g.tiles || { whole: 0, cut: 0, order: 0, estimated: false }; g.tiles.whole += r.tiles.whole; g.tiles.cut += r.tiles.cut; g.tiles.estimated = g.tiles.estimated || r.tiles.estimated; }
    if (r.substrate) { g.substrate = g.substrate || { name: r.substrate.name, volume: 0 }; g.substrate.volume += r.substrate.volume; }
  }
  const totals = [...by.values()].map((g) => {
    const m = addMeasures(g.parts);
    if (g.tiles) g.tiles.order = tilesToOrder(g.tiles, g.parts.find((p) => p.tiles)?.tiles.wastePct || 0);
    const { parts, ...rest } = g;
    return { ...rest, gross: m.gross, deductions: m.deductions, net: m.net };
  }).sort((a, b) => a.name.localeCompare(b.name));
  return { rows, totals };
}
