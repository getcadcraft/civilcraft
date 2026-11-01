/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plate-model.js — what the frame model gains for slabs, walls and floors (0.8 SU.1056 steps 1–2). DOM-free, imports nothing;
 * cleanFrame (frame-model.js) calls these only when a file has plates or diaphragms, so a frame-only model is unchanged.
 *
 *   model.plates:      [{ id, nodes: [4 node ids], t, material, from? }]      t = thickness (mm); ν = E / 2G − 1 of the material
 *   model.diaphragms:  [{ id, name, z, nodes: [ids], master?: { x, y } }]      a rigid floor: in plan the nodes move as one
 *                      (ux, uy, rz tied to a master point; the plan centroid of the nodes unless given). Written as `z` (+ `tol`,
 *                      default 1 mm) the nodes are found by height; as `nodes` they are named.
 *   case loads gain    { type: 'area', plate, dir: 'X' | 'Y' | 'Z' | 'n', p }   p in N/mm² (MPa) per unit area of the plate,
 *                                                                              along a global direction or the plate's own z
 *   cases' selfWeight  also counts plates: ρ g t per unit area along −Z.
 *
 *   cleanPlates(list, ctx, warn) → plates      ctx = { nodeIds, matIds, at (Map id → node) }
 *   cleanDiaphragms(list, ctx, warn) → diaphragms
 *   cleanAreaLoad(l, plateIds) → load | null
 */

const num = (v) => (typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN);
const fin = (v, lo = -1e12, hi = 1e12) => { const n = num(v); return Number.isFinite(n) && n >= lo && n <= hi ? n : null; };
const text = (s, max = 80) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
const id = (v) => text(v, 40);

export const PLATE_LIMIT = 50000;
export const AREA_DIRS = ['X', 'Y', 'Z', 'n'];

export function cleanPlates(list, ctx, warn) {
  const out = [], seen = new Set();
  for (const p of Array.isArray(list) ? list.slice(0, PLATE_LIMIT) : []) {
    const pid = id(p?.id), nodes = Array.isArray(p?.nodes) && p.nodes.length === 4 ? p.nodes.map(id) : null;
    const t = fin(p?.t, 1e-6, 1e5), material = id(p?.material);
    if (!pid || !nodes || nodes.some((n) => !ctx.nodeIds.has(n)) || new Set(nodes).size !== 4 || t === null || !ctx.matIds.has(material)) { warn('bad-plate', { id: pid }); continue; }
    if (seen.has(pid)) { warn('duplicate', { kind: 'plate', id: pid }); continue; }
    // a corner bent back (three corners in a line, or the quad folded over itself) cannot be analysed
    const P = nodes.map((n) => { const q = ctx.at.get(n); return [q.x, q.y, q.z]; });
    if (!convexQuad(P)) { warn('plate-shape', { id: pid }); continue; }
    seen.add(pid);
    const o = { id: pid, nodes, t, material };
    if (p.from && typeof p.from === 'object') o.from = { app: text(p.from.app, 20), ref: text(p.from.ref, 60) };
    out.push(o);
  }
  return out;
}

/** True when the four corners make a strictly convex quadrilateral (seen along its own normal). */
export function convexQuad(P) {
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const n = cr(sub(P[2], P[0]), sub(P[3], P[1]));
  const ln = Math.hypot(...n);
  if (!(ln > 0)) return false;
  for (let i = 0; i < 4; i++) {
    const c = cr(sub(P[(i + 1) % 4], P[i]), sub(P[(i + 2) % 4], P[(i + 1) % 4]));
    const s = (c[0] * n[0] + c[1] * n[1] + c[2] * n[2]) / ln;
    const e1 = Math.hypot(...sub(P[(i + 1) % 4], P[i])), e2 = Math.hypot(...sub(P[(i + 2) % 4], P[(i + 1) % 4]));
    if (!(s > 1e-3 * e1 * e2)) return false;                      // each corner turns the same way, by more than ~0.06°
  }
  return true;
}

export function cleanDiaphragms(list, ctx, warn) {
  const out = [], seen = new Set(), taken = new Set();
  for (const d of Array.isArray(list) ? list.slice(0, 1000) : []) {
    const did = id(d?.id);
    if (!did || seen.has(did)) { warn(did ? 'duplicate' : 'bad-diaphragm', { kind: 'diaphragm', id: did }); continue; }
    let nodes;
    const z = fin(d?.z);
    if (Array.isArray(d?.nodes)) nodes = [...new Set(d.nodes.map(id))].filter((n) => ctx.nodeIds.has(n));
    else if (z !== null) { const tol = fin(d.tol ?? 1, 0, 1e4) ?? 1; nodes = [...ctx.at.values()].filter((n) => Math.abs(n.z - z) <= tol).map((n) => n.id); }
    else { warn('bad-diaphragm', { id: did }); continue; }
    const free = nodes.filter((n) => !taken.has(n));
    if (free.length < nodes.length) warn('diaphragm-shared', { id: did, n: nodes.length - free.length });
    if (free.length < 2) { warn('bad-diaphragm', { id: did }); continue; }
    seen.add(did);
    free.forEach((n) => taken.add(n));
    const zz = z ?? free.reduce((s, n) => s + ctx.at.get(n).z, 0) / free.length;
    const o = { id: did, name: text(d.name) || did, z: zz, nodes: free };
    const mx = fin(d.master?.x), my = fin(d.master?.y);
    if (mx !== null && my !== null) o.master = { x: mx, y: my };
    out.push(o);
  }
  return out;
}

export function cleanAreaLoad(l, plateIds) {
  if (!l || l.type !== 'area' || !plateIds) return null;
  const plate = id(l.plate), p = fin(l.p);
  if (!plateIds.has(plate) || !AREA_DIRS.includes(l.dir) || p === null) return null;
  return { type: 'area', plate, dir: l.dir, p };
}
