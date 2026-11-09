/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * solid.js — cc-nurbs (0.9 DC.54, session `nurbs-09`): SOLIDS bounded by NURBS faces, and Booleans on them. DOM-free; the mesh Boolean
 * engine is handed in (manifold-3d, Apache-2.0, which ModelCraft and PartCraft already load), never imported here.
 *
 * A solid is a group of the patch set's surfaces (each with its trim, trim.js) that together close a volume: `doc.solids` =
 * [{ id, name, faces: [surface item ids] }] (optional key: a patch set without solids is written exactly as before, and an older
 * reader that does not know the key opens the same file with the faces as plain surfaces). The faces keep their exact B-spline
 * patches; what a Boolean changes is their TRIMS (and which faces are kept): every face of the result is one of the inputs' exact
 * surfaces, cut by new loops in its own (u, v) plane along the intersection.
 *
 * Method (written from the plain definitions; no kernel's code read):
 *   1. sew: each face is tessellated within the chord tolerance (trim.tessellate); boundary vertices of different faces closer than
 *      the weld distance are joined, and a boundary vertex lying on another face's open edge splits that edge (no T-junctions), until
 *      every edge has exactly two triangles. Faces are turned to one consistent orientation (outward, by the sign of the volume).
 *      What stays open is COUNTED and refused in words, never patched over: `nurbs.err.solid_open` with the edges and the gap.
 *   2. boolean: the two closed meshes, each corner carrying its face and its (u, v), go to the mesh engine (union, subtract,
 *      intersect). Every result corner is put back on its own exact surface (closest point from its carried (u, v)); the distance
 *      it had to move is the MEASURED deviation of the result. The triangles of each face are chained into loops in that face's
 *      (u, v) plane (seams stay loop edges), and each kept region becomes a trimmed copy of the face's surface.
 *   3. check: the result faces are sewn again from their exact surfaces and new trims; the report says whether they close and how
 *      far their volume is from the engine's.
 *
 *   TOL = 0.05 mm (chord tolerance by default)
 *   sew(faces [{ surface, trim }], { tol, weld, gap }) → { positions, tris: Uint32Array (3 per triangle), triFace, cornerUV,
 *       closed, openEdges, nonManifold, orientable, flipped [per face], maxGap, volume, area, triangles, tol }
 *   solids(doc) · solid(doc, id) · solidOf(doc, faceId) · facesOf(doc, id) → [items]
 *   addSolid(doc, faceIds, { name, tol }) → { doc, id, report }   refuses faces that do not close (nurbs.err.solid_open)
 *   removeSolid(doc, id, { faces }) → doc                         the group only, or with its faces
 *   box(doc, { corner, size }) · cylinder(doc, { base, axis, radius, height, tol }) · sphere(doc, { center, radius })
 *       → { doc, id, report }  NURBS-bounded primitives (box: 6 planar patches; cylinder: a rational side + two trimmed caps;
 *       sphere: one rational revolved patch with poles and a seam)
 *   mesh(doc, id, { tol }) → { positions: Float64Array, indices: Uint32Array, report }   the closed, outward mesh (a host's bake)
 *   addFaces(doc, [{ surface, trim, name }], name, tol) → addSolid's result for new faces (blend.js's fillet tool and thickened solids)
 *   boolean(M, doc, a, b, op 'union' | 'subtract' | 'intersect', { tol, keep, name, tangent }) → { doc, id, report }
 *       tangent = [{ s, with, dir, end }] (0.9 SU.747c): surface `s` meets surface `with` tangentially along its iso-line dir = end; a point on
 *       both is put on that line exactly (the meeting of tangent faces is ill-conditioned). Regions narrower than tol / 2 are left out (`slivers`)
 *       report = { op, tol, deviation (mm: largest move of a result corner onto its surface), faces, triangles, volume, area,
 *       closedAgain, openAgain, volumeAgain }   NurbsError nurbs.err.solid_open | bool_input | bool_empty | bool_trim | bool_detail
 *   cleanSolids(x, items) → solids   (doc.js calls it: untrusted input)
 */
import * as C from './curve.js';
import * as S from './surface.js';
import * as K from './construct.js';
import * as T from './trim.js';
import * as V from './vec.js';

const { fail } = C;
export const TOL = 0.05;
export const MAX_SOLIDS = 1000;
const OPS = ['union', 'subtract', 'intersect'];

// ------------------------------------------------------------------------------------------------ the data

const cleanId = (x) => (typeof x === 'string' && /^[A-Za-z0-9_.-]{1,64}$/.test(x) ? x : null);
const cleanName = (x) => (typeof x === 'string' ? x.replace(/[\u0000-\u001f\u007f-\u009f‎‏‪-‮⁦-⁩]/g, '').slice(0, 200) : '');

/** Untrusted `solids`: each a unique id and a list of existing surfaces, no surface in two solids. Bad entries are left out. */
export function cleanSolids(x, items) {
  if (!Array.isArray(x)) return [];
  const surf = new Set(items.filter((i) => i.kind === 'surface').map((i) => i.id));
  const ids = new Set(items.map((i) => i.id)), taken = new Set(), out = [];
  for (const b of x.slice(0, MAX_SOLIDS)) {
    if (!b || typeof b !== 'object') continue;
    const id = cleanId(b.id);
    if (!id || ids.has(id)) continue;
    const faces = Array.isArray(b.faces) ? [...new Set(b.faces.filter((f) => typeof f === 'string' && surf.has(f) && !taken.has(f)))] : [];
    if (!faces.length) continue;
    faces.forEach((f) => taken.add(f)); ids.add(id);
    out.push({ id, name: cleanName(b.name), faces });
  }
  return out;
}

export const solids = (doc) => (Array.isArray(doc.solids) ? doc.solids : []);
export const solid = (doc, id) => solids(doc).find((b) => b.id === id) || null;
export const solidOf = (doc, faceId) => solids(doc).find((b) => b.faces.includes(faceId)) || null;
export function facesOf(doc, id) {
  const b = solid(doc, id);
  if (!b) fail('nurbs.err.no_solid', { id });
  return b.faces.map((f) => doc.items.find((i) => i.id === f)).filter(Boolean);
}
const withSolids = (doc, list) => { const d = { ...doc }; if (list.length) d.solids = list; else delete d.solids; return d; };
function nextSolidId(doc) {
  let n = solids(doc).length + 1;
  const used = new Set([...doc.items.map((i) => i.id), ...solids(doc).map((b) => b.id)]);
  while (used.has('b' + n)) n++;
  return 'b' + n;
}
function nextItemId(doc, used) {
  let n = doc.items.length + 1;
  while (used.has('s' + n)) n++;
  used.add('s' + n);
  return 's' + n;
}

// ------------------------------------------------------------------------------------------------ sewing

/** Union-find over vertex ids. */
function uf(n) {
  const p = new Int32Array(n); for (let i = 0; i < n; i++) p[i] = i;
  const find = (a) => { while (p[a] !== a) { p[a] = p[p[a]]; a = p[a]; } return a; };
  return { find, join: (a, b) => { a = find(a); b = find(b); if (a !== b) p[Math.max(a, b)] = Math.min(a, b); } };
}

function bboxOf(P) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < P.length; i += 3) for (let k = 0; k < 3; k++) { if (P[i + k] < lo[k]) lo[k] = P[i + k]; if (P[i + k] > hi[k]) hi[k] = P[i + k]; }
  return { lo, hi, size: Math.max(1e-9, Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2])) };
}

const ekey = (a, b) => a * 4294967296 + b;   // vertex ids stay below 2^32

/**
 * Sew faces into one closed, consistently oriented triangle mesh (or say exactly what stays open).
 * Vertex ids in the result are positions shared by every face that meets there; each triangle keeps its face and its corners' (u, v).
 */
export function sew(faces, { tol = TOL, weld = null, gap = null } = {}) {
  if (!Array.isArray(faces) || !faces.length) fail('nurbs.err.solid_none');
  const P = [], tri = [], tf = [], tuv = [];   // per input vertex: position; per triangle: 3 vertex ids, face, 6 uv numbers
  const faceTris = [];
  faces.forEach((f, fi) => {
    const t = T.tessellate(f.surface, f.trim || null, { tol });
    const base = P.length / 3;
    for (let i = 0; i < t.positions.length; i++) P.push(t.positions[i]);
    const mine = [];
    for (let i = 0; i < t.indices.length; i += 3) {
      const a = t.indices[i], b = t.indices[i + 1], c = t.indices[i + 2];
      mine.push(tri.length / 3);
      tri.push(base + a, base + b, base + c); tf.push(fi);
      tuv.push(t.uvs[a * 2], t.uvs[a * 2 + 1], t.uvs[b * 2], t.uvs[b * 2 + 1], t.uvs[c * 2], t.uvs[c * 2 + 1]);
    }
    faceTris.push(mine);
  });
  const nv = P.length / 3;
  const box = bboxOf(P);
  const wTol = weld ?? Math.max(tol * 0.25, 1e-7 * box.size);
  const gTol = gap ?? Math.max(tol * 2, 1e-6 * box.size);
  const dist = (a, b) => Math.hypot(P[a * 3] - P[b * 3], P[a * 3 + 1] - P[b * 3 + 1], P[a * 3 + 2] - P[b * 3 + 2]);
  let maxGap = 0;

  // boundary vertices of each face (edges one triangle of that face uses), and which pairs are joined by a face edge
  const isB = new Uint8Array(nv), faceEdge = new Set();
  faceTris.forEach((list) => {
    const cnt = new Map();
    for (const t of list) for (let k = 0; k < 3; k++) {
      const a = tri[t * 3 + k], b = tri[t * 3 + (k + 1) % 3], key = ekey(Math.min(a, b), Math.max(a, b));
      cnt.set(key, (cnt.get(key) || 0) + 1);
    }
    for (const [key, n] of cnt) if (n === 1) { const a = Math.floor(key / 4294967296), b = key % 4294967296; isB[a] = 1; isB[b] = 1; faceEdge.add(key); }
  });
  // 1. weld boundary vertices (a hash grid of the weld distance)
  const U = uf(nv), cell = Math.max(wTol, 1e-12), grid = new Map();
  const gk = (x, y, z) => x + ',' + y + ',' + z;
  for (let v = 0; v < nv; v++) {
    if (!isB[v]) continue;
    const ix = Math.floor(P[v * 3] / cell), iy = Math.floor(P[v * 3 + 1] / cell), iz = Math.floor(P[v * 3 + 2] / cell);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      const l = grid.get(gk(ix + dx, iy + dy, iz + dz));
      if (!l) continue;
      for (const w of l) {
        const d = dist(v, w);
        if (d > wTol) continue;
        // two ends of one face edge are never joined, unless they are one point (a pole, a collapsed edge)
        if (d > 1e-9 * box.size && faceEdge.has(ekey(Math.min(v, w), Math.max(v, w)))) continue;
        U.join(v, w); if (d > maxGap) maxGap = d;
      }
    }
    const k = gk(ix, iy, iz);
    let l = grid.get(k); if (!l) grid.set(k, l = []);
    l.push(v);
  }
  // canonical ids, drop triangles that lost an edge
  let T3 = [], TF = [], TUV = [];
  for (let t = 0; t < tf.length; t++) {
    const a = U.find(tri[t * 3]), b = U.find(tri[t * 3 + 1]), c = U.find(tri[t * 3 + 2]);
    if (a === b || b === c || a === c) continue;
    T3.push(a, b, c); TF.push(tf[t]); for (let k = 0; k < 6; k++) TUV.push(tuv[t * 6 + k]);
  }

  // 2. split open edges at boundary vertices of other faces lying on them (T-junctions), a few passes
  const openEdges = () => {
    const cnt = new Map();
    for (let t = 0; t < TF.length; t++) for (let k = 0; k < 3; k++) {
      const a = T3[t * 3 + k], b = T3[t * 3 + (k + 1) % 3], key = ekey(Math.min(a, b), Math.max(a, b));
      const e = cnt.get(key); if (e) e.n++; else cnt.set(key, { n: 1, t, k });
    }
    return cnt;
  };
  for (let pass = 0; pass < 6; pass++) {
    const cnt = openEdges(), open = [], bverts = new Set();
    for (const e of cnt.values()) if (e.n === 1) { open.push(e); bverts.add(T3[e.t * 3 + e.k]); bverts.add(T3[e.t * 3 + (e.k + 1) % 3]); }
    if (!open.length) break;
    // edges hashed by the cells they pass through (cell h), vertices looked up in their own cell
    const h = Math.max(gTol * 4, box.size / 512), eg = new Map();
    const ck = (p) => gk(Math.floor(p[0] / h), Math.floor(p[1] / h), Math.floor(p[2] / h));
    open.forEach((e, i) => {
      const a = T3[e.t * 3 + e.k], b = T3[e.t * 3 + (e.k + 1) % 3];
      const pa = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], pb = [P[b * 3], P[b * 3 + 1], P[b * 3 + 2]];
      const n = Math.min(100000, Math.ceil(V.dist(pa, pb) / h) + 1), seen = new Set();
      for (let s = 0; s <= n; s++) {
        const q = V.lerp(pa, pb, s / n);
        for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
          const k = gk(Math.floor(q[0] / h) + dx, Math.floor(q[1] / h) + dy, Math.floor(q[2] / h) + dz);
          if (seen.has(k)) continue; seen.add(k);
          let l = eg.get(k); if (!l) eg.set(k, l = []); l.push(i);
        }
      }
    });
    const ins = new Map();   // open index → [{ v, s }]
    for (const v of bverts) {
      const p = [P[v * 3], P[v * 3 + 1], P[v * 3 + 2]];
      for (const i of eg.get(ck(p)) || []) {
        const e = open[i], a = T3[e.t * 3 + e.k], b = T3[e.t * 3 + (e.k + 1) % 3];
        if (v === a || v === b) continue;
        const pa = [P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], d = V.sub([P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], pa), L2 = V.dot(d, d);
        if (!(L2 > 0)) continue;
        const s = V.dot(V.sub(p, pa), d) / L2;
        if (s <= 0 || s >= 1) continue;
        const off = V.dist(p, V.add(pa, V.mul(d, s)));
        if (off > gTol || Math.sqrt(L2) * Math.min(s, 1 - s) <= wTol) continue;
        let l = ins.get(i); if (!l) ins.set(i, l = []);
        if (!l.some((x) => x.v === v)) l.push({ v, s, off });
      }
    }
    if (!ins.size) break;
    const split = new Set(), nT = [], nF = [], nUV = [];
    const byTri = new Map();
    for (const [i, l] of ins) { const e = open[i]; if (!byTri.has(e.t)) byTri.set(e.t, { k: e.k, l }); }   // one edge per triangle per pass
    for (let t = 0; t < TF.length; t++) {
      const job = byTri.get(t);
      if (!job) { nT.push(T3[t * 3], T3[t * 3 + 1], T3[t * 3 + 2]); nF.push(TF[t]); for (let k = 0; k < 6; k++) nUV.push(TUV[t * 6 + k]); continue; }
      split.add(t);
      const k = job.k, ids = [0, 1, 2].map((j) => T3[t * 3 + (k + j) % 3]), uv = [0, 1, 2].map((j) => [TUV[t * 6 + ((k + j) % 3) * 2], TUV[t * 6 + ((k + j) % 3) * 2 + 1]]);
      const pts = job.l.sort((x, y) => x.s - y.s);
      for (const q of pts) if (q.off > maxGap) maxGap = q.off;
      const chain = [{ v: ids[0], uv: uv[0] }, ...pts.map((q) => ({ v: q.v, uv: [uv[0][0] + (uv[1][0] - uv[0][0]) * q.s, uv[0][1] + (uv[1][1] - uv[0][1]) * q.s] })), { v: ids[1], uv: uv[1] }];
      for (let j = 0; j + 1 < chain.length; j++) {
        nT.push(chain[j].v, chain[j + 1].v, ids[2]); nF.push(TF[t]);
        nUV.push(...chain[j].uv, ...chain[j + 1].uv, ...uv[2]);
      }
    }
    T3 = nT; TF = nF; TUV = nUV;
  }

  // 3. closed? orientable? (faces turned as wholes so every shared edge is used once each way)
  const nt = TF.length, cnt = new Map();
  for (let t = 0; t < nt; t++) for (let k = 0; k < 3; k++) {
    const a = T3[t * 3 + k], b = T3[t * 3 + (k + 1) % 3], key = ekey(Math.min(a, b), Math.max(a, b));
    let e = cnt.get(key); if (!e) cnt.set(key, e = []);
    e.push({ t, fwd: a < b });
  }
  let open = 0, nonManifold = 0;
  const nf = faces.length, adj = Array.from({ length: nf }, () => []);
  for (const e of cnt.values()) {
    if (e.length === 1) { open++; continue; }
    if (e.length > 2) { nonManifold++; continue; }
    const [x, y] = e;
    adj[TF[x.t]].push({ g: TF[y.t], same: x.fwd === y.fwd });
    adj[TF[y.t]].push({ g: TF[x.t], same: x.fwd === y.fwd });
  }
  const flip = new Int8Array(nf).fill(-1);
  let orientable = true;
  for (let f0 = 0; f0 < nf; f0++) {
    if (flip[f0] >= 0) continue;
    flip[f0] = 0;
    const q = [f0];
    while (q.length) {
      const f = q.pop();
      for (const { g, same } of adj[f]) {
        const want = same ? 1 - flip[f] : flip[f];
        if (flip[g] < 0) { flip[g] = want; q.push(g); } else if (flip[g] !== want) orientable = false;
      }
    }
  }
  const out = new Uint32Array(nt * 3), uvOut = new Float64Array(nt * 6);
  const put = (t, rev) => {
    const o = rev ? [0, 2, 1] : [0, 1, 2];
    for (let j = 0; j < 3; j++) { out[t * 3 + j] = T3[t * 3 + o[j]]; uvOut[t * 6 + j * 2] = TUV[t * 6 + o[j] * 2]; uvOut[t * 6 + j * 2 + 1] = TUV[t * 6 + o[j] * 2 + 1]; }
  };
  for (let t = 0; t < nt; t++) put(t, flip[TF[t]] === 1);
  const c = [(box.lo[0] + box.hi[0]) / 2, (box.lo[1] + box.hi[1]) / 2, (box.lo[2] + box.hi[2]) / 2];
  const vol = () => {
    let v = 0;
    for (let t = 0; t < nt; t++) {
      const p = [0, 1, 2].map((j) => { const i = out[t * 3 + j]; return [P[i * 3] - c[0], P[i * 3 + 1] - c[1], P[i * 3 + 2] - c[2]]; });
      v += V.dot(p[0], V.cross(p[1], p[2])) / 6;
    }
    return v;
  };
  let volume = vol();
  if (volume < 0) { for (let f = 0; f < nf; f++) flip[f] = flip[f] === 1 ? 0 : 1; for (let t = 0; t < nt; t++) put(t, flip[TF[t]] === 1); volume = -volume; }
  let area = 0;
  for (let t = 0; t < nt; t++) {
    const p = [0, 1, 2].map((j) => { const i = out[t * 3 + j]; return [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]]; });
    area += V.len(V.cross(V.sub(p[1], p[0]), V.sub(p[2], p[0]))) / 2;
  }
  return {
    positions: Float64Array.from(P), tris: out, triFace: Uint32Array.from(TF), cornerUV: uvOut, flipped: [...flip].map((x) => x === 1),
    closed: open === 0 && nonManifold === 0 && orientable, openEdges: open, nonManifold, orientable, maxGap, volume, area, triangles: nt, tol, weld: wTol, gap: gTol,
  };
}

const sewReport = (sw) => ({ closed: sw.closed, openEdges: sw.openEdges, nonManifold: sw.nonManifold, orientable: sw.orientable, maxGap: sw.maxGap, volume: sw.volume, area: sw.area, triangles: sw.triangles, tol: sw.tol });
const round = (x, d = 4) => Math.round(x * 10 ** d) / 10 ** d;
function mustClose(sw, name) {
  if (!sw.closed) fail('nurbs.err.solid_open', { name: name || '', edges: sw.openEdges + sw.nonManifold + (sw.orientable ? 0 : 1), gap: round(sw.gap), tol: sw.tol });
}

// ------------------------------------------------------------------------------------------------ solids in a patch set

export function addSolid(doc, faceIds, { name = '', tol = TOL, weld = null, gap = null } = {}) {
  const ids = [...new Set(faceIds)];
  if (!ids.length) fail('nurbs.err.solid_none');
  const items = ids.map((id) => { const it = doc.items.find((i) => i.id === id); if (!it || it.kind !== 'surface') fail('nurbs.err.no_item', { id }); return it; });
  for (const id of ids) { const b = solidOf(doc, id); if (b) fail('nurbs.err.solid_taken', { id, solid: b.name || b.id }); }
  const sw = sew(items, { tol, weld, gap });
  mustClose(sw, name);
  const id = nextSolidId(doc);
  return { doc: withSolids(doc, [...solids(doc), { id, name: cleanName(name), faces: ids }]), id, report: sewReport(sw) };
}

export function removeSolid(doc, id, { faces = false } = {}) {
  const b = solid(doc, id);
  if (!b) fail('nurbs.err.no_solid', { id });
  let d = withSolids(doc, solids(doc).filter((x) => x.id !== id));
  if (faces) { const drop = new Set(b.faces); d = { ...d, items: d.items.filter((i) => !drop.has(i.id)), links: d.links.filter((l) => !drop.has(l.a) && !drop.has(l.b)) }; }
  return d;
}

/** Surfaces into the doc (fresh ids), then one solid of them (blend.js builds its fillet tools and thickened solids with it). */
export function addFaces(doc, list, name, tol) {
  const used = new Set([...doc.items.map((i) => i.id), ...solids(doc).map((b) => b.id)]);
  const items = list.map(({ surface, trim, name: n }) => {
    const it = { id: nextItemId(doc, used), name: cleanName(n || name), kind: 'surface', surface: S.cleanSurface(surface) };
    const tr = trim ? T.cleanTrim(trim, it.surface) : null;
    if (tr) it.trim = tr;
    return it;
  });
  const d = { ...doc, items: [...doc.items, ...items] };
  return addSolid(d, items.map((i) => i.id), { name, tol });
}

export function box(doc, { corner = [0, 0, 0], size = [100, 100, 100], name = '' } = {}) {
  const [x, y, z] = corner, [a, b, c] = size;
  if (![a, b, c].every((v) => Number.isFinite(v) && v > 0) || !corner.every(Number.isFinite)) fail('nurbs.err.solid_size');
  const p = (i, j, k) => [x + a * i, y + b * j, z + c * k];
  const quad = (q) => ({ surface: K.planarPatch(q) });
  const faces = [
    quad([p(0, 0, 0), p(0, 1, 0), p(1, 1, 0), p(1, 0, 0)]), quad([p(0, 0, 1), p(1, 0, 1), p(1, 1, 1), p(0, 1, 1)]),
    quad([p(0, 0, 0), p(1, 0, 0), p(1, 0, 1), p(0, 0, 1)]), quad([p(0, 1, 0), p(0, 1, 1), p(1, 1, 1), p(1, 1, 0)]),
    quad([p(0, 0, 0), p(0, 0, 1), p(0, 1, 1), p(0, 1, 0)]), quad([p(1, 0, 0), p(1, 1, 0), p(1, 1, 1), p(1, 0, 1)]),
  ];
  return addFaces(doc, faces, name, TOL);
}

export function cylinder(doc, { base = [0, 0, 0], axis = [0, 0, 1], radius = 20, height = 50, tol = TOL, name = '' } = {}) {
  if (!(radius > 0) || !(height > 0) || !base.every(Number.isFinite)) fail('nurbs.err.solid_size');
  const n = V.norm(axis);
  if (!(V.len(n) > 0.5)) fail('nurbs.err.axis');
  const ring = C.circle(base, n, radius);
  const side = K.extrude(ring, V.mul(n, height)).surface;
  // caps: a square planar patch round the circle, trimmed by the circle (a polygon fine enough to stay within tol / 4 of it)
  const ux = V.norm(V.perp(n)), uy = V.cross(n, ux);
  const segs = Math.min(T.MAX_LOOP_POINTS, Math.max(32, Math.ceil(Math.PI / Math.acos(Math.max(-1, 1 - tol / 4 / radius)))));
  const cap = (o) => {
    const q = (i, j) => V.add(o, V.add(V.mul(ux, radius * i), V.mul(uy, radius * j)));
    const s = K.planarPatch([q(-1, -1), q(1, -1), q(1, 1), q(-1, 1)]);
    return { surface: s, trim: T.addLoop(s, null, T.circleLoop(s, 0.5, 0.5, 0.5 - 1e-9, segs)) };
  };
  return addFaces(doc, [{ surface: side }, cap(base), cap(V.add(base, V.mul(n, height)))], name, tol);
}

export function sphere(doc, { center = [0, 0, 0], radius = 25, tol = TOL, name = '' } = {}) {
  if (!(radius > 0) || !center.every(Number.isFinite)) fail('nurbs.err.solid_size');
  // a half circle in the x-z plane from the south pole to the north pole, turned once round z
  const prof = C.arc(center, [1, 0, 0], [0, 0, 1], radius, -Math.PI / 2, Math.PI / 2);
  const s = K.revolve(prof, center, [0, 0, 1], 2 * Math.PI).surface;
  return addFaces(doc, [{ surface: s }], name, tol);
}

export function mesh(doc, id, { tol = TOL } = {}) {
  const b = solid(doc, id);
  if (!b) fail('nurbs.err.no_solid', { id });
  const sw = sew(facesOf(doc, id), { tol });
  mustClose(sw, b.name || b.id);
  // compact: only the vertices the triangles use
  const map = new Map(), pos = [];
  const idx = new Uint32Array(sw.tris.length);
  for (let i = 0; i < sw.tris.length; i++) {
    const v = sw.tris[i];
    let m = map.get(v);
    if (m === undefined) { m = pos.length / 3; map.set(v, m); pos.push(sw.positions[v * 3], sw.positions[v * 3 + 1], sw.positions[v * 3 + 2]); }
    idx[i] = m;
  }
  return { positions: Float64Array.from(pos), indices: idx, report: sewReport(sw) };
}

// ------------------------------------------------------------------------------------------------ Booleans

/** A sewn solid as the engine's mesh: numProp 5 (x, y, z near the common middle, u, v); one property vertex per position, face
 *  and (u, v); the merge lists say which property vertices are one point; faceID = the face's number across both inputs. */
function engineMesh(M, sw, faceBase, mid) {
  const keyOf = new Map(), props = [], first = new Map(), mFrom = [], mTo = [];
  const tv = new Uint32Array(sw.tris.length), fid = new Uint32Array(sw.triangles);
  for (let t = 0; t < sw.triangles; t++) {
    const f = sw.triFace[t];
    fid[t] = faceBase + f;
    for (let j = 0; j < 3; j++) {
      const v = sw.tris[t * 3 + j], u = sw.cornerUV[t * 6 + j * 2], w = sw.cornerUV[t * 6 + j * 2 + 1];
      const k = v + '|' + f + '|' + u + '|' + w;
      let pv = keyOf.get(k);
      if (pv === undefined) {
        pv = props.length / 5; keyOf.set(k, pv);
        props.push(sw.positions[v * 3] - mid[0], sw.positions[v * 3 + 1] - mid[1], sw.positions[v * 3 + 2] - mid[2], u, w);
        const f0 = first.get(v);
        if (f0 === undefined) first.set(v, pv); else { mFrom.push(pv); mTo.push(f0); }
      }
      tv[t * 3 + j] = pv;
    }
  }
  return new M.Mesh({ numProp: 5, vertProperties: Float32Array.from(props), triVerts: tv, mergeFromVert: Uint32Array.from(mFrom), mergeToVert: Uint32Array.from(mTo), faceID: fid });
}

const shoelace = (L) => { let a = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
function inPoly(L, x, y) {
  let inside = false;
  for (let i = 0, j = L.length - 1; i < L.length; j = i++) {
    const a = L[i], b = L[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}
/** Fewer loop points: straight runs (in (u, v)) merged; then, while too many, the points whose removal moves the loop least on the
 *  surface (3-D distance under tol / 4) go first. */
function simplify(s, L, tol) {
  let R = L.filter((p, i) => {
    const a = L[(i + L.length - 1) % L.length], b = L[(i + 1) % L.length];
    const cr = (p[0] - a[0]) * (b[1] - a[1]) - (p[1] - a[1]) * (b[0] - a[0]);
    return Math.abs(cr) > 1e-14;
  });
  if (R.length < 3) R = L;
  let guard = 0;
  while (R.length > T.MAX_LOOP_POINTS && guard++ < 64) {
    const keep = R.filter((p, i) => {
      if (i % 2 === 0) return true;
      const a = R[i - 1], b = R[(i + 1) % R.length];
      const m = S.point(s, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      return V.dist(m, S.point(s, p[0], p[1])) > tol / 4;
    });
    if (keep.length === R.length) break;
    R = keep;
  }
  if (R.length > T.MAX_LOOP_POINTS) fail('nurbs.err.bool_detail', { max: T.MAX_LOOP_POINTS });
  return R;
}

export function boolean(M, doc, a, b, op, { tol = TOL, keep = false, name = '', tangent = [] } = {}) {
  if (!M || !M.Manifold || !M.Mesh) fail('nurbs.err.bool_engine');
  if (!OPS.includes(op)) fail('nurbs.err.bool_op');
  if (a === b) fail('nurbs.err.bool_same');
  const A = solid(doc, a), B = solid(doc, b);
  if (!A) fail('nurbs.err.no_solid', { id: a });
  if (!B) fail('nurbs.err.no_solid', { id: b });
  const FA = facesOf(doc, a), FB = facesOf(doc, b), FALL = [...FA, ...FB];
  const sa = sew(FA, { tol }), sb = sew(FB, { tol });
  mustClose(sa, A.name || A.id); mustClose(sb, B.name || B.id);
  const ba = bboxOf(sa.positions), bb = bboxOf(sb.positions);
  const mid = [0, 1, 2].map((k) => (Math.min(ba.lo[k], bb.lo[k]) + Math.max(ba.hi[k], bb.hi[k])) / 2);
  const size = Math.max(ba.size, bb.size);

  const live = [];
  const own = (x) => { live.push(x); return x; };
  let out;
  try {
    let ma, mb;
    try { ma = own(new M.Manifold(own(engineMesh(M, sa, 0, mid)))); } catch { fail('nurbs.err.bool_input', { name: A.name || A.id }); }
    try { mb = own(new M.Manifold(own(engineMesh(M, sb, FA.length, mid)))); } catch { fail('nurbs.err.bool_input', { name: B.name || B.id }); }
    if (typeof ma.status === 'function' && ma.status() !== 'NoError') fail('nurbs.err.bool_input', { name: A.name || A.id });
    if (typeof mb.status === 'function' && mb.status() !== 'NoError') fail('nurbs.err.bool_input', { name: B.name || B.id });
    const r = own(op === 'union' ? ma.add(mb) : op === 'subtract' ? ma.subtract(mb) : ma.intersect(mb));
    if (r.isEmpty()) fail('nurbs.err.bool_empty', { op });
    out = r.getMesh();
  } finally { for (const x of live) try { x.delete?.(); } catch { /* already gone */ } }

  const np = out.numProp, VP = out.vertProperties, TV = out.triVerts, FID = out.faceID, nt = TV.length / 3, npv = VP.length / np;
  if (!nt) fail('nurbs.err.bool_empty', { op });
  // property vertex → one id per point
  const canon = new Uint32Array(npv); for (let i = 0; i < npv; i++) canon[i] = i;
  if (out.mergeFromVert) for (let i = 0; i < out.mergeFromVert.length; i++) canon[out.mergeFromVert[i]] = out.mergeToVert[i];
  // every corner back on its own exact surface. A point where faces meet (a new intersection, or an old edge) is moved onto all of
  // them at once — alternating projections onto each face's surface, averaged, until it stops moving — so every face's loop goes
  // through the SAME point; what is left (its distance to each surface) is the residual. deviation = how far the engine's points
  // had to move. Both are measured on the exact surfaces.
  const [, sizeAll] = [0, Math.max(ba.size, bb.size)];
  const side = (x, x0, lo, hi) => (Math.abs(x - x0) > (hi - lo) / 2 ? x + Math.sign(x0 - x) * (hi - lo) : x);
  const at = new Map();   // canonical point → Map(face → [property vertices])
  for (let t = 0; t < nt; t++) {
    const f = FID ? FID[t] : 0;
    for (let j = 0; j < 3; j++) {
      const pv = TV[t * 3 + j], c = canon[pv];
      let m = at.get(c); if (!m) at.set(c, m = new Map());
      let l = m.get(f); if (!l) m.set(f, l = []);
      if (!l.includes(pv)) l.push(pv);
    }
  }
  const refined = new Map();
  let deviation = 0, residual = 0, meeting = 0, tangentFixed = 0;
  for (const [c, m] of at) {
    const p0 = [VP[c * np] + mid[0], VP[c * np + 1] + mid[1], VP[c * np + 2] + mid[2]];
    const fs = [...m.keys()].filter((f) => f < FALL.length);
    const uv = new Map(fs.map((f) => { const pv = m.get(f)[0]; return [f, [VP[pv * np + 3], VP[pv * np + 4]]]; }));
    let p = p0, qs = [];
    for (let it = 0; it < (fs.length > 1 ? 24 : 1); it++) {
      qs = fs.map((f) => { const r = S.closestPoint(FALL[f].surface, p, { uv0: uv.get(f) }); uv.set(f, [r.u, r.v]); return r.point; });
      const pn = [0, 1, 2].map((k) => qs.reduce((x, q) => x + q[k], 0) / qs.length);
      const moved = V.dist(pn, p);
      p = pn;
      if (moved < 1e-10 * sizeAll) break;
    }
    // two faces that are TANGENT along a known line (a fillet and the face it runs into; blend.js says which): their meeting is
    // ill-conditioned (a point may slide across the line by √(2·noise·radius)), so a point on both is put on that line exactly
    for (const tg of tangent) {
      const fi = fs.find((f) => FALL[f].surface === tg.s), fj = fs.find((f) => FALL[f].surface === tg.with);
      if (fi === undefined || fj === undefined) continue;
      const [ua, ub] = tg.dir === 'u' ? S.domainU(tg.s) : S.domainV(tg.s), at = tg.end === 0 ? ua : ub;
      const cur = uv.get(fi), nu = tg.dir === 'u' ? [at, cur[1]] : [cur[0], at];
      uv.set(fi, nu);
      p = S.point(tg.s, nu[0], nu[1]);
      qs = fs.map((f) => { if (f === fi) return p; const r = S.closestPoint(FALL[f].surface, p, { uv0: uv.get(f) }); uv.set(f, [r.u, r.v]); return r.point; });
      tangentFixed++;
      break;
    }
    if (fs.length > 1) { meeting++; for (const q of qs) residual = Math.max(residual, V.dist(p, q)); }
    deviation = Math.max(deviation, V.dist(p, p0));
    for (const f of fs) {
      const s = FALL[f].surface, [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s), [u, v] = uv.get(f);
      // a closed direction wraps (u = 1 is u = 0 there): each property vertex stays on the side it came from, or the seam is lost
      const here = S.point(s, u, v), tiny = 1e-9 * sizeAll;
      for (const pv of m.get(f)) {
        let ru = side(u, VP[pv * np + 3], ua, ub), rv = side(v, VP[pv * np + 4], va, vb);
        // at a pole one parameter says nothing (every value is the same point): keep the one the corner came with
        const cu = Math.min(ub, Math.max(ua, VP[pv * np + 3])), cv = Math.min(vb, Math.max(va, VP[pv * np + 4]));
        if (V.dist(S.point(s, cu, rv), here) < tiny) ru = cu;
        if (V.dist(S.point(s, ru, cv), here) < tiny) rv = cv;
        refined.set(pv, [ru, rv]);
      }
    }
  }
  const onSurface = (pv) => refined.get(pv);
  // triangles by face
  const byFace = new Map();
  for (let t = 0; t < nt; t++) {
    const f = FID ? FID[t] : 0;
    if (!(f < FALL.length)) fail('nurbs.err.bool_input', { name: '' });
    let l = byFace.get(f); if (!l) byFace.set(f, l = []); l.push(t);
  }
  const used = new Set([...doc.items.map((i) => i.id), ...solids(doc).map((x) => x.id)]);
  const newItems = [];
  let slivers = 0;
  for (const [f, list] of [...byFace].sort((x, y) => x[0] - y[0])) {
    const src = FALL[f], s = src.surface;
    const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s), DU = ub - ua, DV = vb - va;
    const uvOf = (t, j) => onSurface(TV[t * 3 + j], f);
    // which way the face's triangles run in (u, v)
    let signed = 0;
    const dir = new Map();
    for (const t of list) {
      const p = [0, 1, 2].map((j) => uvOf(t, j));
      signed += ((p[1][0] - p[0][0]) * (p[2][1] - p[0][1]) - (p[1][1] - p[0][1]) * (p[2][0] - p[0][0]));
      for (let j = 0; j < 3; j++) dir.set(ekey(canon[TV[t * 3 + j]], canon[TV[t * 3 + (j + 1) % 3]]), { t, j });
    }
    // open edges of this face's region (twin missing, or across a seam: the (u, v) jumps), chained into loops
    const qk = (pv) => { const q = refined.get(pv); return canon[pv] + ':' + Math.round((q[0] - ua) / DU * 1e5) + ',' + Math.round((q[1] - va) / DV * 1e5); };
    const next = new Map(), node = new Map();
    for (const t of list) for (let j = 0; j < 3; j++) {
      const p0 = TV[t * 3 + j], p1 = TV[t * 3 + (j + 1) % 3];
      const tw = dir.get(ekey(canon[p1], canon[p0]));
      let boundary = !tw;
      if (tw) {
        const x0 = uvOf(t, j), y0 = uvOf(tw.t, (tw.j + 1) % 3);   // the same point seen from the twin
        if (Math.abs(x0[0] - y0[0]) > DU * 0.25 || Math.abs(x0[1] - y0[1]) > DV * 0.25) boundary = true;
      }
      if (!boundary) continue;
      const k0 = qk(p0), k1 = qk(p1);
      if (k0 === k1) continue;
      node.set(k0, refined.get(p0)); node.set(k1, refined.get(p1));
      let l = next.get(k0); if (!l) next.set(k0, l = []); l.push(k1);
    }
    // chain the open edges into loops; a chain that stops at a pole (a collapsed patch edge has no triangle edges) carries on from
    // another (u, v) of the same point, i.e. straight along the collapsed edge
    const sameAt = new Map();
    for (const k of next.keys()) { const c = k.slice(0, k.indexOf(':')); let l = sameAt.get(c); if (!l) sameAt.set(c, l = []); l.push(k); }
    const loops = [];
    let broken = 0;
    for (const start of [...next.keys()]) {
      while ((next.get(start) || []).length) {
        const L = [start];
        let cur = start, closed = false, guard = 0;
        while (guard++ < 1e6) {
          let l = next.get(cur);
          if (!l || !l.length) {
            const c = cur.slice(0, cur.indexOf(':'));
            const alt = (sameAt.get(c) || []).find((k) => k !== cur && (next.get(k) || []).length);
            if (!alt) break;
            if (alt === start) { closed = true; break; }
            L.push(alt); cur = alt; l = next.get(cur);
          }
          const to = l.pop();
          if (to === start) { closed = true; break; }
          L.push(to); cur = to;
        }
        if (closed && L.length >= 3) loops.push(L.map((k) => node.get(k))); else broken++;
      }
    }
    if (broken) fail('nurbs.err.bool_trim', { name: src.name || src.id, why: 'open' });
    const sign = signed >= 0 ? 1 : -1;
    // a region narrower than half the tolerance is the engine's noise where faces touch within the chord tolerance (a fillet's wall
    // along its touch line, a face tangent to another): left out and counted (0.9 SU.747c); the re-sew below says whether the rest closes
    const width = (L) => {
      let per = 0;
      const P3 = L.map((q) => S.point(s, q[0], q[1]));
      for (let i = 0; i < P3.length; i++) per += V.dist(P3[i], P3[(i + 1) % P3.length]);
      const cu = L.reduce((x, q) => x + q[0], 0) / L.length, cv = L.reduce((x, q) => x + q[1], 0) / L.length, D = S.derivs(s, cu, cv, 1);
      return 2 * Math.abs(shoelace(L)) * V.len(V.cross(D[1][0], D[0][1])) / Math.max(per, 1e-300);
    };
    const fixed = loops.map((L) => (sign > 0 ? L : L.slice().reverse())).map((L) => simplify(s, L, tol)).filter((L) => Math.abs(shoelace(L)) > 1e-12 * DU * DV)
      .filter((L) => { if (width(L) >= tol / 2) return true; slivers++; return false; });
    const outers = fixed.filter((L) => shoelace(L) > 0).sort((x, y) => shoelace(y) - shoelace(x));
    const holes = fixed.filter((L) => shoelace(L) < 0);
    const groups = outers.map((o) => ({ o, h: [] }));
    const loose = [];
    for (const h of holes) {
      const g = groups.filter((x) => inPoly(x.o, h[0][0], h[0][1])).sort((x, y) => shoelace(x.o) - shoelace(y.o))[0];
      if (g) g.h.push(h); else loose.push(h);
    }
    if (!fixed.length) continue;   // only slivers: the face is not in the result
    if (!groups.length && loose.length) groups.push({ o: null, h: loose });   // only holes: the whole patch minus them
    for (const g of groups) {
      let tr = null;
      if (g.o && T.wholePatch(s, g.o)) g.o = null;   // the face kept its four edges: no outer loop
      if (g.o || g.h.length) {
        try {
          if (g.o) tr = T.addLoop(s, null, g.o);
          for (const h of g.h) tr = T.addLoop(s, tr, h, { hole: true });
        } catch (e) { fail('nurbs.err.bool_trim', { name: src.name || src.id, why: e && e.code ? e.code : '' }); }
      }
      const it = { id: nextItemId(doc, used), name: src.name || '', kind: 'surface', surface: s };
      if (tr) it.trim = tr;
      newItems.push(it);
    }
  }
  if (!newItems.length) fail('nurbs.err.bool_empty', { op });
  // the new patch set: inputs out (unless kept), result faces and their solid in
  let d = doc;
  if (!keep) d = removeSolid(removeSolid(d, a, { faces: true }), b, { faces: true });
  const sid = (() => { let n = solids(d).length + 1; while (used.has('b' + n)) n++; used.add('b' + n); return 'b' + n; })();
  const nm = cleanName(name || A.name || '');
  d = withSolids({ ...d, items: [...d.items, ...newItems] }, [...solids(d), { id: sid, name: nm, faces: newItems.map((i) => i.id) }]);

  // the engine's own volume of the result, and the faces sewn again from their exact surfaces and new trims
  let vEngine = 0;
  for (let t = 0; t < nt; t++) {
    const p = [0, 1, 2].map((j) => { const i = TV[t * 3 + j]; return [VP[i * np], VP[i * np + 1], VP[i * np + 2]]; });
    vEngine += V.dot(p[0], V.cross(p[1], p[2])) / 6;
  }
  let again = null;
  try { again = sew(newItems, { tol }); } catch { again = null; }
  const report = {
    op, tol, deviation, residual, meeting, faces: newItems.length, triangles: nt, volume: vEngine, area: again ? again.area : null,
    slivers, tangentFixed, closedAgain: !!(again && again.closed), openAgain: again ? again.openEdges + again.nonManifold : null, volumeAgain: again ? again.volume : null,
    size,
  };
  return { doc: d, id: sid, report };
}
