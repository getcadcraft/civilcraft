// SPDX-License-Identifier: Apache-2.0
/**
 * schedule.js: what the finishes on wall faces cover and take (0.10 BK.25, BK.26, BK.27, BK.28, BK.130; session bim-finishes-10). Host-free.
 * The host reads its walls into plain rows; this turns the document (model.js) into one row per zone and the totals the schedules print.
 *
 *   wall row  { guid, name?, level?, t, len, height, extent: { left: [s0, s1], right: [s0, s1] }, openings: [{ id, kind, offset, width, sill, height }],
 *               room: { left: key | null, right: key | null } }        (sill above the wall's base; openings cut BOTH faces)
 *   surfaces(doc, walls, { rules? }) → { rows, orphans: [{ wall, face }] (a face whose wall is not in `walls`) }
 *     row = { id (wall:face:zone), wall, wallName, level, face, zone, name, kind, type, typeName, finishKind, room, rect, lost, clipped,
 *             pieces (the rectangles that are covered: the zone less what lies over it and less the openings),
 *             gross (the part of the zone not covered by a zone laid over it), deductions (openings), net, thickness (the whole build-up),
 *             layers: [{ role, material, thickness, volume }], substrateVolume, finishVolume, volume (every layer),
 *             tiles: null | { whole, cut, order, estimated, cutSizes, area }, openings: [ids deducted], setout }
 *   byFinish(rows) → [{ type, name, kind, net, tiles: null | { whole, cut, order, estimated }, layers: [{ role, material, thickness, volume }], volume, count, rooms: [key] }]
 *   byRoom(rows) → [{ room, net, finishes: [{ type, name, net, tiles, volume }], count }]   (room null = a face no room was found for)
 *   byWall(rows) → [{ wall, wallName, net, left, right, count }]   left / right = the build-up thickness each face carries now (the widest zone)
 *   thicknessOn(rows, wall, face) → the thickest build-up on that face (what the finished wall adds on that side)
 *   FINISH_RULES: the words the schedules' note lists (keys for the host's language file)
 *
 * WHAT IS MEASURED: a zone's area is its rectangle on the face, less any zone laid over it, less every door and window cut through it (the part of each
 * inside the zone; none is left out for being small: the measurement method of the quantities module does not apply to a finish drawn on a face).
 * Volumes are net area x layer thickness. Tiles come from tiles.js.
 */
import { subtract, areaOf, inter, openingRect } from './face.js';
import { resolveZone, typeById, buildUp, tileOf } from './model.js';
import { setOut } from './tiles.js';

export const FINISH_RULES = ['finishes.rule.area', 'finishes.rule.over', 'finishes.rule.volume', 'finishes.rule.tiles'];

export function surfaces(doc, walls, { list = false } = {}) {
  const byGuid = new Map((walls || []).map((w) => [w.guid, w]));
  const rows = [], orphans = [];
  for (const f of doc.faces) {
    const w = byGuid.get(f.wall);
    if (!w) { orphans.push({ wall: f.wall, face: f.face }); continue; }
    const geom = { len: w.len, extent: w.extent?.[f.face] || [0, w.len], height: w.height };
    const res = f.zones.map((z) => ({ z, ...resolveZone(z, geom) }));
    const ops = (w.openings || []).map((o) => ({ o, r: openingRect(o) }));
    res.forEach((x, i) => {
      const type = typeById(doc, x.z.type);
      if (!type) return;
      const over = res.slice(i + 1).filter((y) => !y.lost).map((y) => y.rect);
      const region = x.lost ? [] : subtract(x.rect, over);
      const gross = areaOf(region);
      const hit = ops.filter((p) => region.some((q) => inter(q, p.r)));
      const holes = hit.map((p) => p.r);
      const pieces = region.flatMap((q) => subtract(q, holes));
      const net = areaOf(pieces);
      const layers = buildUp(type).map((l) => ({ role: l.role, material: l.material, thickness: l.thickness, volume: net * l.thickness }));
      const tile = tileOf(type);
      let tiles = null;
      if (tile && net > 0) {
        const t = setOut({ region, zone: x.rect, holes, tile, setout: x.z.setout || null, openings: Object.fromEntries(ops.map((p) => [p.o.id, p.r])), list });
        tiles = { whole: t.whole, cut: t.cut, order: t.order, estimated: t.estimated, cutSizes: t.cutSizes, area: t.area, rows: t.rows, cols: t.cols, ...(t.tiles ? { list: t.tiles } : {}) };
      }
      rows.push({
        id: f.wall + ':' + f.face + ':' + x.z.id, wall: f.wall, wallName: w.name || '', level: w.level ?? null, face: f.face, zone: x.z.id, name: x.z.name, kind: x.z.kind, type: type.id,
        typeName: type.name, finishKind: type.kind, room: w.room?.[f.face] ?? null, rect: x.rect, lost: x.lost, clipped: x.clipped, gross, deductions: gross - net, net,
        thickness: layers.reduce((s, l) => s + l.thickness, 0), pieces, layers, substrateVolume: layers.filter((l) => l.role === 'substrate').reduce((s, l) => s + l.volume, 0),
        finishVolume: layers.filter((l) => l.role === 'finish').reduce((s, l) => s + l.volume, 0), volume: layers.reduce((s, l) => s + l.volume, 0), tiles,
        openings: hit.map((p) => p.o.id), setout: x.z.setout || null,
      });
    });
  }
  return { rows, orphans };
}

const addTiles = (a, b) => (!b ? a : !a ? { whole: b.whole, cut: b.cut, order: b.order, estimated: !!b.estimated } : { whole: a.whole + b.whole, cut: a.cut + b.cut, order: a.order + b.order, estimated: a.estimated || !!b.estimated });
const live = (rows) => rows.filter((r) => !r.lost && r.net > 0);

export function byFinish(rows) {
  const out = new Map();
  for (const r of live(rows)) {
    let x = out.get(r.type);
    if (!x) out.set(r.type, x = { type: r.type, name: r.typeName, kind: r.finishKind, net: 0, tiles: null, layers: [], volume: 0, count: 0, rooms: [] });
    x.net += r.net; x.volume += r.volume; x.count++; x.tiles = addTiles(x.tiles, r.tiles);
    if (!x.rooms.includes(r.room)) x.rooms.push(r.room);
    for (const l of r.layers) {
      const k = x.layers.find((y) => y.role === l.role && y.material === l.material && y.thickness === l.thickness);
      if (k) k.volume += l.volume; else x.layers.push({ ...l });
    }
  }
  return [...out.values()];
}
export function byRoom(rows) {
  const out = new Map();
  for (const r of live(rows)) {
    let x = out.get(r.room);
    if (!x) out.set(r.room, x = { room: r.room, net: 0, finishes: [], count: 0 });
    x.net += r.net; x.count++;
    let f = x.finishes.find((y) => y.type === r.type);
    if (!f) x.finishes.push(f = { type: r.type, name: r.typeName, net: 0, tiles: null, volume: 0 });
    f.net += r.net; f.volume += r.volume; f.tiles = addTiles(f.tiles, r.tiles);
  }
  return [...out.values()];
}
export function byWall(rows) {
  const out = new Map();
  for (const r of live(rows)) {
    let x = out.get(r.wall);
    if (!x) out.set(r.wall, x = { wall: r.wall, wallName: r.wallName, net: 0, left: 0, right: 0, count: 0 });
    x.net += r.net; x.count++;
    x[r.face] = Math.max(x[r.face], r.thickness);
  }
  return [...out.values()];
}
export function thicknessOn(rows, wall, face) {
  return live(rows).filter((r) => r.wall === wall && r.face === face).reduce((m, r) => Math.max(m, r.thickness), 0);
}
