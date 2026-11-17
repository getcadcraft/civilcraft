/* SPDX-License-Identifier: Apache-2.0 */
/**
 * solid.js: a pushed / pulled solid as a building mass (lib/massing, 0.10 BK.44). Host-free: no DOM, no app import.
 * The explicit rule for handing ModelCraft's massing to an IFC model: a solid is ONE mass = a footprint, a height, a number of
 * floors and, per floor, the area of the solid's own horizontal section at that floor's level.
 *
 *   massFromSolid({ tris, floorHeight, name }) -> mass | null
 *     tris        [[[x, y, z], [x, y, z], [x, y, z]], ...] in the host's length unit, z up, wound one way throughout (either way: a solid
 *                 with a negative signed volume is turned round)
 *     floorHeight the storey height the person gives, same unit
 *     mass = { name, pts [{ x, y }] (anticlockwise: the outline of the section just above the base; the largest loop when there are several),
 *              z0 (the lowest point), height, floors (height / floorHeight rounded, at least 1), floorHeight (height / floors, so the
 *              floors fill the solid exactly), footprint (area of pts), floorAreas [per floor, lowest first; null = that section did not close],
 *              gross (the sum of the measured floor areas), volume, closed (every edge shared by exactly two faces, opposite ways),
 *              prism (closed, one outline, every floor the footprint's area, volume = footprint x height),
 *              simplified (not a prism: a proxy made by extruding pts to `height` is NOT the solid's shape; the areas and the volume here are the solid's own),
 *              notes [codes: 'open', 'floors-differ', 'loops' (more than one outline at the base), 'unmeasured' (a floor's section did not close), 'hull' (no base outline: the hull of the plan is used)] }
 *   sectionAt(tris, z) -> { area, loops [[{x, y}]...] (closed ones), open (segments that did not chain) }
 *   solidVolume(tris), isClosed(tris)
 *   optionMasses(solids [{ name, tris }], { floorHeight, set, current }) -> { masses (for mass-ifc.js writeMassingIfc: id, name, pts, floors,
 *     floorHeight, height, z0, gross, volume, floorAreas, option, simplified, source), shared { name, floors, floorHeight, z0 }, report [the massFromSolid results] }
 */

const EPS = 1e-9;
const key = (p, q) => Math.round(p / q) + ',';
const vkey = (p, q) => key(p[0], q) + key(p[1], q) + key(p[2], q);
const area2 = (P) => { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a.x * b.y - b.x * a.y; } return s / 2; };

function bounds(tris) {
  const b = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
  for (const t of tris) for (const p of t) for (let i = 0; i < 3; i++) { if (p[i] < b[i]) b[i] = p[i]; if (p[i] > b[i + 3]) b[i + 3] = p[i]; }
  return b;
}
const sizeOf = (b) => Math.max(b[3] - b[0], b[4] - b[1], b[5] - b[2], 0);

/** Six times the signed volume would be the sum of a . (b x c); outward normals give a positive volume. */
export function solidVolume(tris) {
  let v = 0;
  for (const [a, b, c] of tris) v += a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
  return v / 6;
}

/** Closed: every edge is used once each way (points welded to a millionth of the solid's size). */
export function isClosed(tris) {
  const q = Math.max(sizeOf(bounds(tris)), EPS) * 1e-6, edges = new Map();
  let n = 0;
  for (const t of tris) {
    const k = t.map((p) => vkey(p, q));
    if (k[0] === k[1] || k[1] === k[2] || k[0] === k[2]) continue;   // a sliver with no area
    n++;
    for (let i = 0; i < 3; i++) { const e = k[i] + '>' + k[(i + 1) % 3]; edges.set(e, (edges.get(e) || 0) + 1); }
  }
  if (!n) return false;
  for (const [e, c] of edges) { const [a, b] = e.split('>'); if (c !== 1 || edges.get(b + '>' + a) !== 1) return false; }
  return true;
}

/**
 * The horizontal section at height z: each triangle the plane cuts gives one segment, directed so the solid is on its left
 * (up x normal), so closed loops come out anticlockwise round material and clockwise round a hole, and the area is the sum
 * of the signed loop areas.
 */
export function sectionAt(tris, z) {
  const b = bounds(tris), q = Math.max(sizeOf(b), EPS) * 1e-6;
  const segs = [];
  for (const [p0, p1, p2] of tris) {
    const P = [p0, p1, p2], d = P.map((p) => p[2] - z);
    const up = d.map((v) => v >= 0);
    if (up[0] === up[1] && up[1] === up[2]) continue;
    const cut = [];
    for (let i = 0; i < 3; i++) {
      const j = (i + 1) % 3;
      if (up[i] === up[j]) continue;
      const f = d[i] / (d[i] - d[j]);
      cut.push([P[i][0] + (P[j][0] - P[i][0]) * f, P[i][1] + (P[j][1] - P[i][1]) * f]);
    }
    if (cut.length !== 2) continue;
    // the triangle's normal n, and the direction up x n = (-ny, nx): material on the left of the segment
    const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2], vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz;
    const dx = cut[1][0] - cut[0][0], dy = cut[1][1] - cut[0][1];
    if (dx * dx + dy * dy < q * q * 1e-6) continue;
    segs.push(dy * nx - dx * ny >= 0 ? [cut[0], cut[1]] : [cut[1], cut[0]]);
  }
  const k2 = (p) => key(p[0], q) + key(p[1], q);
  const from = new Map();
  for (const s of segs) { const k = k2(s[0]); if (!from.has(k)) from.set(k, []); from.get(k).push(s); }
  const used = new Set(), loops = [];
  let open = 0, area = 0;
  for (const s0 of segs) {
    if (used.has(s0)) continue;
    const loop = [];
    let s = s0, closed = false;
    while (s && !used.has(s)) {
      used.add(s);
      loop.push({ x: s[0][0], y: s[0][1] });
      const nk = k2(s[1]);
      if (nk === k2(s0[0])) { closed = true; break; }
      s = (from.get(nk) || []).find((c) => !used.has(c)) || null;
    }
    if (closed && loop.length >= 3) { loops.push(loop); area += area2(loop); } else open += loop.length;
  }
  return { area, loops, open };
}

/** A loop without the points that sit on a straight run (the diagonals of triangulated sides leave them). */
function tidy(P, q) {
  let out = P.slice();
  for (let pass = 0; pass < 2; pass++) {
    const next = [];
    for (let i = 0; i < out.length; i++) {
      const a = out[(i + out.length - 1) % out.length], b = out[i], c = out[(i + 1) % out.length];
      const cr = (b.x - a.x) * (c.y - b.y) - (b.y - a.y) * (c.x - b.x), l = Math.hypot(c.x - a.x, c.y - a.y);
      if (Math.hypot(b.x - a.x, b.y - a.y) < q || Math.abs(cr) <= q * Math.max(l, q)) continue;
      next.push(b);
    }
    out = next;
  }
  return out;
}

function hull(points) {
  const P = points.slice().sort((a, b) => a.x - b.x || a.y - b.y), cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lo = [], hi = [];
  for (const p of P) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
  for (const p of P.reverse()) { while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
  return lo.slice(0, -1).concat(hi.slice(0, -1));
}

export function massFromSolid({ tris = [], floorHeight = 0, name = '' } = {}) {
  let T = tris.filter((t) => t?.length === 3 && t.every((p) => p?.length >= 3 && p.every(Number.isFinite)));
  if (!T.length || !(floorHeight > 0)) return null;
  // a host whose triangles wind the other way (normals inward) gives a negative volume: turned round here, once
  if (solidVolume(T) < 0) T = T.map((t) => [t[0], t[2], t[1]]);
  const b = bounds(T), z0 = b[2], height = b[5] - b[2], size = sizeOf(b);
  if (!(height > size * 1e-6)) return null;
  const floors = Math.max(1, Math.round(height / floorHeight)), fh = height / floors, lift = Math.min(fh * 1e-4, height * 1e-4), q = size * 1e-6;
  const closed = isClosed(T), notes = [];
  if (!closed) notes.push('open');
  const base = sectionAt(T, z0 + lift);
  const outer = base.loops.filter((l) => area2(l) > 0).sort((p, r) => area2(r) - area2(p));
  let pts = outer.length ? tidy(outer[0], q) : [];
  if (outer.length > 1) notes.push('loops');
  if (pts.length < 3) { pts = hull(T.flatMap((t) => t.map((p) => ({ x: p[0], y: p[1] })))); notes.push('hull'); }
  if (pts.length < 3) return null;
  const footprint = Math.abs(area2(pts));
  const floorAreas = [];
  for (let k = 0; k < floors; k++) {
    const s = sectionAt(T, z0 + k * fh + lift);
    floorAreas.push(s.open || !s.loops.length ? null : Math.abs(s.area));
  }
  if (floorAreas.some((a) => a === null)) notes.push('unmeasured');
  const gross = floorAreas.reduce((s, a) => s + (a || 0), 0);
  const volume = Math.abs(solidVolume(T));
  const near = (x, y) => Math.abs(x - y) <= 1e-3 * Math.max(Math.abs(x), Math.abs(y), EPS);
  const top = sectionAt(T, b[5] - lift);
  const level = floorAreas.every((a) => a !== null && near(a, footprint)) && !top.open && near(Math.abs(top.area), footprint);
  if (!level && !notes.includes('unmeasured')) notes.push('floors-differ');
  const prism = closed && outer.length === 1 && base.loops.length === 1 && level && near(volume, footprint * height);
  return { name: String(name || ''), pts, z0, height, floors, floorHeight: fh, footprint, floorAreas, gross, volume, closed, prism, simplified: !prism, notes };
}

/** Selected solids as the options of one set, ready for writeMassingIfc: one shared building whose storeys are the tallest option's. */
export function optionMasses(solids = [], { floorHeight = 0, set = '', current = -1, source = '' } = {}) {
  const report = [], masses = [];
  solids.forEach((s, i) => {
    const m = massFromSolid({ tris: s.tris, floorHeight, name: s.name || 'Option ' + (i + 1) });   // i18n-ignore: an element name in the IFC file
    report.push(m ? { ...m, index: i } : { name: s.name || '', index: i, failed: true });
    if (!m) return;
    masses.push({ id: 'opt' + (i + 1), name: m.name, use: '', pts: m.pts, floors: m.floors, floorHeight: m.floorHeight, height: m.height, z0: m.z0, base: '', ground: '', parcel: '',
      gross: m.gross, volume: m.volume, floorAreas: m.floorAreas.map((a) => a || 0), option: { set, label: m.name, current: masses.length === current }, simplified: m.simplified, source });
  });
  const z0 = masses.length ? Math.min(...masses.map((m) => m.z0)) : 0;
  const shared = masses.length ? { name: set, floors: Math.max(...masses.map((m) => Math.ceil((m.z0 - z0 + m.height) / floorHeight - 1e-6))), floorHeight, z0 } : null;
  return { masses, shared, report };
}
