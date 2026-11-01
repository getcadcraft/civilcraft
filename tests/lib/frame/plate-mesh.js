/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plate-mesh.js — a slab or wall outline → four-node plates (0.8 SU.1056 step 1). DOM-free, imports nothing. Every mesh is
 * conforming (neighbours share whole edges), so the shell solver's patch test holds across it.
 *
 * Three ways, picked from the outline:
 *   'grid'        every edge of the outline and the openings runs along two square directions (an ordinary slab: rectangles,
 *                 L, T, U shapes, rectangular openings, also when the whole slab is turned): grid lines through every corner
 *                 and every `points` entry (columns, wall ends — so they land on nodes), each gap cut into equal parts no
 *                 longer than `size`; the cells inside the outline and outside the openings are the plates;
 *   'transfinite' four corners, convex, no openings, not square-cornered: an n × m structured mesh between the opposite edges;
 *   'split'       any other simple outline, no openings: the outline is cut into triangles (ear clipping), each triangle
 *                 into three quads (edge midpoints + centroid), then every quad into k × k (k the same everywhere, so it
 *                 stays conforming). Plates come out less regular: said as warning `mesh-irregular`.
 *
 *   meshOutline(outline, { holes, size, points }) → { kind, nodes: [[u, v]], quads: [[a, b, c, d]] (counter-clockwise),
 *                                                     warnings: [{ code }], quality: { maxAspect, minAngle } }
 *     outline, holes: [[u, v], …] in mm (either winding); size: the longest plate side wanted (mm)
 *     throws { code: 'mesh-outline' | 'mesh-holes' | 'mesh-size' | 'mesh-too-many' }
 *   slabPlates(json, { id, outline, holes, z, t, material, size, points, tol }) → { nodes: n added, plates: [ids] }
 *     adds a horizontal slab at height z to a frame file (nodes within tol (1 mm) of an existing node are that node)
 *   wallPlates(json, { id, from: [x, y], to: [x, y], z0, z1, t, material, size, openings: [{ u0, u1, v0, v1 }], points })
 *     a vertical wall on the line from → to between heights z0 and z1; openings in (u along the wall, v up from z0)
 */

export const MESH_LIMIT = 40000;

const area2 = (poly) => { let a = 0; for (let i = 0; i < poly.length; i++) { const p = poly[i], q = poly[(i + 1) % poly.length]; a += p[0] * q[1] - q[0] * p[1]; } return a; };
const ccw = (poly) => (area2(poly) < 0 ? [...poly].reverse() : poly);

/** Point in polygon (even–odd), points on the edge count as inside only through the cell-centre use below. */
export function inside(pt, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a[1] > pt[1]) !== (b[1] > pt[1]) && pt[0] < (b[0] - a[0]) * (pt[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
}

function cleanLoop(loop) {
  if (!Array.isArray(loop)) return null;
  const pts = loop.map((p) => (Array.isArray(p) ? [Number(p[0]), Number(p[1])] : [Number(p?.x), Number(p?.y)])).filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
  const out = [];
  for (const p of pts) { const q = out[out.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6) out.push(p); }
  if (out.length > 2 && Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) <= 1e-6) out.pop();
  // drop corners that lie on a straight run
  const s = out.filter((p, i) => { const a = out[(i - 1 + out.length) % out.length], b = out[(i + 1) % out.length]; return Math.abs((p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0])) > 1e-9 * Math.hypot(b[0] - a[0], b[1] - a[1]) ** 2; });
  return s.length >= 3 && Math.abs(area2(s)) > 1e-6 ? ccw(s) : null;
}

/** The turn (radians) that makes every edge run along u or v, or null. */
function squareTurn(loops) {
  let best = null, len = 0;
  for (const l of loops) for (let i = 0; i < l.length; i++) { const p = l[i], q = l[(i + 1) % l.length], d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d > len) { len = d; best = Math.atan2(q[1] - p[1], q[0] - p[0]); } }
  const c = Math.cos(-best), s = Math.sin(-best);
  for (const l of loops) for (let i = 0; i < l.length; i++) {
    const p = l[i], q = l[(i + 1) % l.length];
    const dx = c * (q[0] - p[0]) - s * (q[1] - p[1]), dy = s * (q[0] - p[0]) + c * (q[1] - p[1]);
    if (Math.min(Math.abs(dx), Math.abs(dy)) > 1e-6 * Math.max(1, Math.hypot(dx, dy))) return null;
  }
  return best;
}

export function meshOutline(outlineIn, { holes: holesIn = [], size, points = [] } = {}) {
  const outline = cleanLoop(outlineIn);
  if (!outline) throw { code: 'mesh-outline' };
  if (!(size > 0)) throw { code: 'mesh-size' };
  const holes = holesIn.map(cleanLoop);
  if (holes.some((h) => !h)) throw { code: 'mesh-holes' };
  const warnings = [];
  let out;
  const turn = squareTurn([outline, ...holes]);
  if (turn !== null) out = gridMesh(outline, holes, size, points, turn);
  else if (holes.length) throw { code: 'mesh-holes' };
  else if (outline.length === 4 && !points.length) out = transfinite(outline, size);
  else { out = splitMesh(outline, size); warnings.push({ code: 'mesh-irregular' }); }
  if (out.quads.length > MESH_LIMIT) throw { code: 'mesh-too-many', n: out.quads.length };
  return { ...out, warnings, quality: quality(out) };
}

function gridMesh(outline, holes, size, points, turnIn) {
  // a grid is the same a quarter turn on: use the smallest turn, and none at all for an outline square to the axes
  let turn = turnIn - Math.round(turnIn / (Math.PI / 2)) * (Math.PI / 2);
  if (Math.abs(turn) < 1e-12) turn = 0;
  const c = turn ? Math.cos(turn) : 1, s = turn ? Math.sin(turn) : 0;
  const toG = (p) => [c * p[0] + s * p[1], -s * p[0] + c * p[1]];
  const toW = (p) => [c * p[0] - s * p[1], s * p[0] + c * p[1]];
  const O = outline.map(toG), H = holes.map((h) => h.map(toG)), Pt = points.map(toG);
  const lines = (k) => {
    const v = [...O, ...H.flat(), ...Pt].map((p) => p[k]).sort((a, b) => a - b);
    const u = [];
    for (const x of v) if (!u.length || x - u[u.length - 1] > 1e-6) u.push(x);
    const fine = [u[0]];
    for (let i = 1; i < u.length; i++) { const n = Math.max(1, Math.ceil((u[i] - u[i - 1]) / size - 1e-9)); for (let j = 1; j <= n; j++) fine.push(u[i - 1] + (u[i] - u[i - 1]) * j / n); }
    return fine;
  };
  const xs = lines(0), ys = lines(1);
  if ((xs.length - 1) * (ys.length - 1) > 4 * MESH_LIMIT) throw { code: 'mesh-too-many', n: (xs.length - 1) * (ys.length - 1) };
  const id = new Map(), nodes = [], quads = [];
  const node = (i, j) => { const k = i * ys.length + j; if (!id.has(k)) { id.set(k, nodes.length); nodes.push(toW([xs[i], ys[j]])); } return id.get(k); };
  for (let i = 0; i + 1 < xs.length; i++) for (let j = 0; j + 1 < ys.length; j++) {
    const m = [(xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2];
    if (!inside(m, O) || H.some((h) => inside(m, h))) continue;
    quads.push([node(i, j), node(i + 1, j), node(i + 1, j + 1), node(i, j + 1)]);
  }
  return { kind: 'grid', nodes, quads };
}

function transfinite(o, size) {
  const d = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
  const n = Math.max(1, Math.ceil(Math.max(d(o[0], o[1]), d(o[3], o[2])) / size - 1e-9));
  const m = Math.max(1, Math.ceil(Math.max(d(o[1], o[2]), d(o[0], o[3])) / size - 1e-9));
  const nodes = [], quads = [];
  for (let i = 0; i <= n; i++) for (let j = 0; j <= m; j++) {
    const s = i / n, t = j / m;
    nodes.push([0, 1].map((k) => (1 - s) * (1 - t) * o[0][k] + s * (1 - t) * o[1][k] + s * t * o[2][k] + (1 - s) * t * o[3][k]));
  }
  for (let i = 0; i < n; i++) for (let j = 0; j < m; j++) quads.push([i * (m + 1) + j, (i + 1) * (m + 1) + j, (i + 1) * (m + 1) + j + 1, i * (m + 1) + j + 1]);
  return { kind: 'transfinite', nodes, quads };
}

/** Ear clipping of a simple counter-clockwise polygon → triangles (index triples). */
export function earClip(poly) {
  const idx = poly.map((_, i) => i), tris = [];
  const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
  let guard = 0;
  while (idx.length > 3 && guard++ < 10000) {
    let cut = false;
    for (let k = 0; k < idx.length; k++) {
      const i0 = idx[(k - 1 + idx.length) % idx.length], i1 = idx[k], i2 = idx[(k + 1) % idx.length];
      const a = poly[i0], b = poly[i1], c = poly[i2];
      if (cross(a, b, c) <= 1e-12) continue;
      let ok = true;
      for (const j of idx) {
        if (j === i0 || j === i1 || j === i2) continue;
        const p = poly[j];
        if (cross(a, b, p) >= 0 && cross(b, c, p) >= 0 && cross(c, a, p) >= 0) { ok = false; break; }
      }
      if (!ok) continue;
      tris.push([i0, i1, i2]); idx.splice(k, 1); cut = true; break;
    }
    if (!cut) throw { code: 'mesh-outline' };
  }
  tris.push([idx[0], idx[1], idx[2]]);
  return tris;
}

function splitMesh(outline, size) {
  const tris = earClip(outline);
  let longest = 0;
  for (const t of tris) for (let e = 0; e < 3; e++) { const a = outline[t[e]], b = outline[t[(e + 1) % 3]]; longest = Math.max(longest, Math.hypot(b[0] - a[0], b[1] - a[1])); }
  const k = Math.max(1, Math.ceil(longest / 2 / size - 1e-9));
  const key = new Map(), nodes = [], quads = [];
  const put = (p) => { const s = Math.round(p[0] * 1e4) + ',' + Math.round(p[1] * 1e4); if (!key.has(s)) { key.set(s, nodes.length); nodes.push(p); } return key.get(s); };
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  for (const [i, j, l] of tris) {
    const A = outline[i], B = outline[j], C = outline[l], g = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
    for (const q of [[A, mid(A, B), g, mid(C, A)], [B, mid(B, C), g, mid(A, B)], [C, mid(C, A), g, mid(B, C)]]) {
      for (let a = 0; a < k; a++) for (let b = 0; b < k; b++) {
        const at = (s, t) => [0, 1].map((c) => (1 - s) * (1 - t) * q[0][c] + s * (1 - t) * q[1][c] + s * t * q[2][c] + (1 - s) * t * q[3][c]);
        quads.push([put(at(a / k, b / k)), put(at((a + 1) / k, b / k)), put(at((a + 1) / k, (b + 1) / k)), put(at(a / k, (b + 1) / k))]);
      }
    }
  }
  return { kind: 'split', nodes, quads };
}

function quality({ nodes, quads }) {
  let maxAspect = 1, minAngle = 180;
  for (const q of quads) {
    const P = q.map((i) => nodes[i]);
    const L = P.map((p, i) => Math.hypot(P[(i + 1) % 4][0] - p[0], P[(i + 1) % 4][1] - p[1]));
    maxAspect = Math.max(maxAspect, Math.max(...L) / Math.min(...L));
    for (let i = 0; i < 4; i++) {
      const a = P[(i + 3) % 4], b = P[i], c = P[(i + 1) % 4];
      const u = [a[0] - b[0], a[1] - b[1]], v = [c[0] - b[0], c[1] - b[1]];
      minAngle = Math.min(minAngle, Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))) * 180 / Math.PI);
    }
  }
  return { maxAspect, minAngle };
}

/** Nodes of a frame file found or added by position. */
function nodeFinder(json, tol) {
  json.nodes = json.nodes || [];
  const grid = new Map(), cell = Math.max(tol, 1e-6) * 4;
  const k = (x, y, z) => [Math.floor(x / cell), Math.floor(y / cell), Math.floor(z / cell)];
  const addIdx = (n) => { const c = k(n.x, n.y, n.z).join(','); if (!grid.has(c)) grid.set(c, []); grid.get(c).push(n); };
  json.nodes.forEach(addIdx);
  const ids = new Set(json.nodes.map((n) => n.id));
  let added = 0;
  const find = (x, y, z, prefix) => {
    const [a, b, c] = k(x, y, z);
    for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let l = -1; l <= 1; l++) {
      for (const n of grid.get([a + i, b + j, c + l].join(',')) || []) if (Math.hypot(n.x - x, n.y - y, n.z - z) <= tol) return n.id;
    }
    let id = prefix + '.' + (++added);
    while (ids.has(id)) id = prefix + '.' + (++added);
    ids.add(id);
    const n = { id, x, y, z };
    json.nodes.push(n); addIdx(n);
    return id;
  };
  return { find, added: () => added };
}

export function slabPlates(json, { id = 'slab', outline, holes = [], z = 0, t, material, size, points = [], tol = 1 }) {
  const m = meshOutline(outline, { holes, size, points });
  const f = nodeFinder(json, tol);
  const ids = m.nodes.map(([x, y]) => f.find(x, y, z, id));
  json.plates = json.plates || [];
  const plates = m.quads.map((q, k) => { const p = { id: id + '.p' + (k + 1), nodes: q.map((i) => ids[i]), t, material }; json.plates.push(p); return p.id; });
  return { nodes: f.added(), plates, kind: m.kind, warnings: m.warnings, quality: m.quality, nodeIds: ids };
}

export function wallPlates(json, { id = 'wall', from, to, z0 = 0, z1, t, material, size, openings = [], points = [], tol = 1 }) {
  const L = Math.hypot(to[0] - from[0], to[1] - from[1]), H = z1 - z0;
  if (!(L > 0) || !(H > 0)) throw { code: 'mesh-outline' };
  const outline = [[0, 0], [L, 0], [L, H], [0, H]];
  const holes = openings.map((o) => [[o.u0, o.v0], [o.u1, o.v0], [o.u1, o.v1], [o.u0, o.v1]]);
  const m = meshOutline(outline, { holes, size, points });
  const ex = [(to[0] - from[0]) / L, (to[1] - from[1]) / L];
  const f = nodeFinder(json, tol);
  const ids = m.nodes.map(([u, v]) => f.find(from[0] + ex[0] * u, from[1] + ex[1] * u, z0 + v, id));
  json.plates = json.plates || [];
  const plates = m.quads.map((q, k) => { const p = { id: id + '.p' + (k + 1), nodes: q.map((i) => ids[i]), t, material }; json.plates.push(p); return p.id; });
  return { nodes: f.added(), plates, kind: m.kind, warnings: m.warnings, quality: m.quality, nodeIds: ids };
}
