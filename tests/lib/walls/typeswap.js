// SPDX-License-Identifier: Apache-2.0
/**
 * typeswap.js: swap the type of many walls, and say what moved (0.10 BK.7, BK.16; session bk-typeswap-10). Host-free: plain rows in,
 * plain rows out, no DOM, no file format. The host does the swap itself (its own undoable change); this file holds the rules around it:
 * which walls change, how the list of types reads, and the "what moved" report from a snapshot taken before and one taken after.
 * The report advises. It never refuses a swap.
 *
 * Rows (all lengths mm, areas mm2, plan points [x, y]):
 *   type      { key, name, t (total thickness), lod? (lod.js; no field = not set), exterior?, custom? }
 *   wall      { guid, typeKey, typeName, t, a, b, lod? (its type's tag when the snapshot was taken) }
 *   opening   { guid, kind: 'door' | 'window', wall (its wall's guid), offset (along the wall, from its start), width, p (its middle, in plan) }
 *   room      { guid, number, name, area }
 *   snapshot  { walls: [wall], openings: [opening], rooms: [room] }
 *
 *   planSwap(walls, guids, toKey)        → { change: [guid], same: [guid] (already that type), missing: [guid] (not a wall of this model) }
 *   swapChoices(types, walls, { query }) → the swap list: [{ key, name, t, lod, tag ('LOD 300' | ''), exterior, custom, current (how many of
 *                                          `walls` have it now) }] in the order given; `query` keeps the rows whose name, thickness or tag has
 *                                          every word of it
 *   swapLabel(row)                       'Wall 230 generic [LOD 200]' (no brackets when the type has no tag)
 *   swapReport(before, after, { guids, to, tol, areaTol })
 *        → { nothing (true when no wall changed type),
 *            to: { key, name, t, lod } | null,
 *            walls: { asked, changed, same, missing, from: [{ key, name, t, lod, count }], thicker, thinner, sameThickness,
 *                     shifted (changed walls whose centre line moved sideways: the location line was kept), maxShift,
 *                     followed (other walls whose ends moved to stay joined), list: [{ guid, from, to, tFrom, tTo, shift }] },
 *            openings: { rehosted (doors and windows of the changed walls: made again in the new wall), doors, windows,
 *                        refit (of those, in a wall whose thickness changed), moved (place in plan changed), slid (place along the wall
 *                        changed), maxMove, lost (not there after), list: [{ guid, kind, wall, refit, move, slide }] },
 *            rooms: { changed, list: [{ guid, number, name, before, after, delta }], before, after, delta (the changed rooms together),
 *                     lost: [{ guid, number, name, before }], made: [{ guid, number, name, after }] },
 *            lod: { to, from: [distinct tags before, not set = null], kind ('none' | 'same' | 'up' | 'down' | 'set' | 'cleared' | 'mixed'),
 *                   changed (walls whose tag is another one now) } }
 *   reportLines(report)                  → [{ key, fill }] for the host's language file, most important first. Fills ending in `Len` are mm,
 *                                          in `Area` are mm2 (the host formats them in the person's units); the others are ready to print.
 */
import { isLod, lodLabel, lodChange } from './lod.js';

const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const tag = (x) => (isLod(x?.lod) ? x.lod : null);

export function planSwap(walls, guids, toKey) {
  const by = new Map(walls.map((w) => [w.guid, w])), out = { change: [], same: [], missing: [] }, seen = new Set();
  for (const g of guids || []) {
    if (seen.has(g)) continue;
    seen.add(g);
    const w = by.get(g);
    if (!w) out.missing.push(g);
    else if (w.typeKey === toKey) out.same.push(g);
    else out.change.push(g);
  }
  return out;
}

export function swapChoices(types, walls = [], { query = '' } = {}) {
  const count = new Map();
  for (const w of walls) count.set(w.typeKey, (count.get(w.typeKey) || 0) + 1);
  const words = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const rows = [];
  for (const ty of types) {
    const row = { key: ty.key, name: String(ty.name || ty.key), t: ty.t, lod: tag(ty), tag: lodLabel(ty.lod), exterior: !!ty.exterior, custom: !!ty.custom, current: count.get(ty.key) || 0 };
    const hay = (row.name + ' ' + (Math.round(row.t * 10) / 10) + ' ' + row.tag + ' ' + row.tag.replace(' ', '')).toLowerCase();
    if (words.every((x) => hay.includes(x))) rows.push(row);
  }
  return rows;
}
export const swapLabel = (row) => row.name + (isLod(row.lod) ? ' [' + lodLabel(row.lod) + ']' : '');

/** How far a wall's centre line moved sideways (mm, to its own left +): the middle of the new line measured from the old line. */
function sideShift(A, B) {
  const L = dist(A.a, A.b);
  if (!(L > 0)) return 0;
  const n = [-(A.b[1] - A.a[1]) / L, (A.b[0] - A.a[0]) / L], m = [(B.a[0] + B.b[0]) / 2, (B.a[1] + B.b[1]) / 2];
  return (m[0] - A.a[0]) * n[0] + (m[1] - A.a[1]) * n[1];
}

export function swapReport(before, after, { guids = [], to = null, tol = 0.01, areaTol = 1 } = {}) {
  const wB = new Map((before.walls || []).map((w) => [w.guid, w])), wA = new Map((after.walls || []).map((w) => [w.guid, w]));
  const asked = [...new Set(guids)];
  const walls = { asked: asked.length, changed: 0, same: 0, missing: 0, from: [], thicker: 0, thinner: 0, sameThickness: 0, shifted: 0, maxShift: 0, followed: 0, list: [] };
  const changed = new Set(), rethick = new Set(), from = new Map();
  for (const g of asked) {
    const A = wB.get(g), B = wA.get(g);
    if (!A || !B) { walls.missing++; continue; }
    if (A.typeKey === B.typeKey) { walls.same++; continue; }
    changed.add(g); walls.changed++;
    const dt = B.t - A.t, shift = sideShift(A, B);
    if (dt > tol) walls.thicker++; else if (dt < -tol) walls.thinner++; else walls.sameThickness++;
    if (Math.abs(dt) > tol) rethick.add(g);
    if (Math.abs(shift) > tol) { walls.shifted++; walls.maxShift = Math.max(walls.maxShift, Math.abs(shift)); }
    const f = from.get(A.typeKey) || { key: A.typeKey, name: A.typeName, t: A.t, lod: tag(A), count: 0 };
    f.count++; from.set(A.typeKey, f);
    walls.list.push({ guid: g, from: A.typeKey, to: B.typeKey, tFrom: A.t, tTo: B.t, shift });
  }
  walls.from = [...from.values()];
  for (const [g, B] of wA) {
    if (changed.has(g)) continue;
    const A = wB.get(g);
    if (A && (dist(A.a, B.a) > tol || dist(A.b, B.b) > tol)) walls.followed++;
  }

  const oA = new Map((after.openings || []).map((o) => [o.guid, o]));
  const openings = { rehosted: 0, doors: 0, windows: 0, refit: 0, moved: 0, slid: 0, maxMove: 0, lost: 0, list: [] };
  for (const o of before.openings || []) {
    const n = oA.get(o.guid);
    if (!n) { if (changed.has(o.wall)) openings.lost++; continue; }
    const move = dist(o.p, n.p), slide = n.offset - o.offset, inChanged = changed.has(n.wall) || changed.has(o.wall);
    const didMove = move > tol, didSlide = Math.abs(slide) > tol;
    if (!inChanged && !didMove && !didSlide) continue;
    if (inChanged) { openings.rehosted++; if (o.kind === 'door') openings.doors++; else openings.windows++; if (rethick.has(n.wall)) openings.refit++; }
    if (didMove) { openings.moved++; openings.maxMove = Math.max(openings.maxMove, move); }
    if (didSlide) openings.slid++;
    openings.list.push({ guid: o.guid, kind: o.kind, wall: n.wall, refit: inChanged && rethick.has(n.wall), move: didMove ? move : 0, slide: didSlide ? slide : 0 });
  }

  const rB = new Map((before.rooms || []).map((r) => [r.guid, r])), rA = new Map((after.rooms || []).map((r) => [r.guid, r]));
  const rooms = { changed: 0, list: [], before: 0, after: 0, delta: 0, lost: [], made: [] };
  for (const [g, A] of rB) {
    const B = rA.get(g);
    if (!B) { rooms.lost.push({ guid: g, number: A.number, name: A.name, before: A.area }); continue; }
    if (Math.abs(B.area - A.area) <= areaTol) continue;
    rooms.changed++; rooms.before += A.area; rooms.after += B.area;
    rooms.list.push({ guid: g, number: B.number, name: B.name, before: A.area, after: B.area, delta: B.area - A.area });
  }
  rooms.delta = rooms.after - rooms.before;
  for (const [g, B] of rA) if (!rB.has(g)) rooms.made.push({ guid: g, number: B.number, name: B.name, after: B.area });

  const toRow = to ? { key: to.key, name: String(to.name || to.key), t: to.t, lod: tag(to) } : null;
  const lodFrom = [...new Set(walls.from.map((f) => f.lod))], toLod = toRow ? toRow.lod : null;
  const kinds = new Set(lodFrom.map((f) => lodChange(f, toLod)));
  const lod = { to: toLod, from: lodFrom, kind: !kinds.size ? 'none' : kinds.size > 1 ? 'mixed' : [...kinds][0], changed: walls.from.filter((f) => f.lod !== toLod).reduce((s, f) => s + f.count, 0) };

  return { nothing: walls.changed === 0, to: toRow, walls, openings, rooms, lod };
}

export function reportLines(r) {
  if (!r || r.nothing) return [{ key: 'typeswap.rep.none', fill: {} }];
  const out = [], W = r.walls, O = r.openings, R = r.rooms, to = r.to || { name: '', t: 0, lod: null };
  out.push({ key: 'typeswap.rep.walls', fill: { n: W.changed, to: to.name + (isLod(to.lod) ? ' [' + lodLabel(to.lod) + ']' : '') } });
  if (W.same) out.push({ key: 'typeswap.rep.same', fill: { n: W.same } });
  const ts = [...new Set(W.list.map((x) => Math.round(x.tFrom * 100) / 100))];
  if (W.thicker + W.thinner > 0) out.push(ts.length === 1 ? { key: 'typeswap.rep.thick', fill: { fromLen: ts[0], toLen: to.t } } : { key: 'typeswap.rep.thickmixed', fill: { toLen: to.t } });
  const L = r.lod, one = L.from.length === 1 ? L.from[0] : null;
  if (L.kind === 'up' || L.kind === 'down') out.push({ key: 'typeswap.rep.lod.' + L.kind, fill: { from: lodLabel(one), to: lodLabel(L.to) } });
  else if (L.kind === 'set') out.push({ key: 'typeswap.rep.lod.set', fill: { to: lodLabel(L.to) } });
  else if (L.kind === 'cleared') out.push({ key: 'typeswap.rep.lod.cleared', fill: { from: one === null ? '' : lodLabel(one) } });
  else if (L.kind === 'mixed') out.push({ key: 'typeswap.rep.lod.mixed', fill: { from: L.from.map((x) => (x === null ? '-' : String(x))).join(', '), to: L.to === null ? '-' : lodLabel(L.to) } });
  else if (L.kind === 'same') out.push({ key: 'typeswap.rep.lod.same', fill: { to: lodLabel(L.to) } });
  if (W.shifted) out.push({ key: 'typeswap.rep.shifted', fill: { n: W.shifted, maxLen: W.maxShift } });
  if (W.followed) out.push({ key: 'typeswap.rep.followed', fill: { n: W.followed } });
  if (O.rehosted) out.push({ key: 'typeswap.rep.openings', fill: { n: O.rehosted, doors: O.doors, windows: O.windows } });
  if (O.moved) out.push({ key: 'typeswap.rep.openmoved', fill: { n: O.moved, maxLen: O.maxMove } });
  if (O.lost) out.push({ key: 'typeswap.rep.openlost', fill: { n: O.lost } });
  if (!O.rehosted && !O.moved && !O.lost) out.push({ key: 'typeswap.rep.noopenings', fill: {} });
  if (R.changed) {
    out.push({ key: 'typeswap.rep.rooms', fill: { n: R.changed, beforeArea: R.before, afterArea: R.after, deltaArea: R.delta } });
    for (const x of R.list) out.push({ key: 'typeswap.rep.room', fill: { room: [x.number, x.name].filter(Boolean).join(' '), beforeArea: x.before, afterArea: x.after, deltaArea: x.delta }, room: x.guid });
  } else out.push({ key: 'typeswap.rep.norooms', fill: {} });
  if (R.lost.length) out.push({ key: 'typeswap.rep.roomslost', fill: { n: R.lost.length, rooms: R.lost.map((x) => x.number).filter(Boolean).join(', ') } });
  if (R.made.length) out.push({ key: 'typeswap.rep.roomsmade', fill: { n: R.made.length, rooms: R.made.map((x) => x.number).filter(Boolean).join(', ') } });
  return out;
}
