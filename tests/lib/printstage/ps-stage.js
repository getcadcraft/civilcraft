/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-stage.js — the stage model for a host whose document has no print bed of its own (roadmap PS.7; docs/PRINTSTAGE-HOST-CONTRACT.md).
 * Host-free and DOM-free. ModelCraft does not use it (its model IS the stage); PartCraft does, BimCraft and others may.
 *
 * The stage is a layout: things lie on the printer's bed (millimetres, Z up, the bed's corner at 0,0) as triangle meshes with a
 * placement each. It never changes the host's document: a part keeps its own geometry, only the layout moves. Every change is one
 * undo step of the stage's own history (`undo()`, `redo()`), a `batch` is one step however many changes it holds.
 *
 *   createStage({ select }) → stage
 *   stage.place(name, tris, { scale, at: [x, y], src }) → id        tris mm [[ [x,y,z] ×3 ] …], standing on 0 and centred on the origin
 *   stage.objects() → [{ id, name, min, max, src }]                 world boxes, mm, in the order they were placed
 *   stage.plate() → [[ [x,y,z] ×3 ] …]                              every triangle that prints, world mm
 *   stage.moveTo(id, x, y) · drop(id) · rescale(id, f) · scaleOf(id) · remove(id) · select(id) · batch(label, fn)
 *   stage.rotate(id, degrees)                                       about the vertical through the box centre (turns it flat on the bed)
 *   stage.orient(id, R)                                             a 3×3 (rows) that turns the thing before it is dropped on the bed
 *   stage.layFlat(id) → { area, n } | null                          the largest flat face that can carry it goes down; null if it was already so
 *   stage.baseFaces(id) → [{ n, area, R }]                          the faces it can rest on, largest first
 *   stage.rename(id, name)
 *   stage.replaceMesh(id, tris) · stage.setSrc(id, src)             the host's thing changed under the layout: new triangles, same placement (no undo step)
 *   stage.tris(id) · forget(id) · resetHistory()                   one object's triangles; drop one whose source is gone; start the history here
 *   stage.undo() · redo() · depth() (steps that can be undone) · labels()
 *   stage.version                                                   counts every change, including undo and redo
 *   hostOf(stage, extra) → the host object lib/printstage/ps-panel.js takes (objects, plate, place, moveTo, drop, rescale, remove, select, batch)
 */

const EPS = 1e-9;
const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const mul3 = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
const rz = (deg) => { const a = deg * Math.PI / 180, c = Math.cos(a), s = Math.sin(a); return [[c, -s, 0], [s, c, 0], [0, 0, 1]]; };
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const finTris = (tris) => Array.isArray(tris) && tris.length > 0 && tris.every((t) => Array.isArray(t) && t.length === 3 && t.every((p) => Array.isArray(p) && p.length === 3 && p.every(fin)));

/** Triangles → one Float64Array (9 numbers per triangle). */
const pack = (tris) => { const a = new Float64Array(tris.length * 9); tris.forEach((t, i) => { for (let k = 0; k < 3; k++) for (let j = 0; j < 3; j++) a[i * 9 + k * 3 + j] = t[k][j]; }); return a; };

/** The faces of a triangle soup that something can rest on: planar clusters whose plane has the whole thing on one side. */
export function restingFaces(base, R = I3) {
  const n = base.length / 9;
  const V = new Float64Array(base.length);
  for (let i = 0; i < base.length; i += 3) for (let r = 0; r < 3; r++) V[i + r] = R[r][0] * base[i] + R[r][1] * base[i + 1] + R[r][2] * base[i + 2];
  let diag = 0;
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < V.length; i += 3) for (let r = 0; r < 3; r++) { if (V[i + r] < lo[r]) lo[r] = V[i + r]; if (V[i + r] > hi[r]) hi[r] = V[i + r]; }
  diag = Math.hypot(hi[0] - lo[0], hi[1] - lo[1], hi[2] - lo[2]) || 1;
  const tol = diag * 1e-5;
  const groups = new Map();
  for (let t = 0; t < n; t++) {
    const o = t * 9;
    const ux = V[o + 3] - V[o], uy = V[o + 4] - V[o + 1], uz = V[o + 5] - V[o + 2], vx = V[o + 6] - V[o], vy = V[o + 7] - V[o + 1], vz = V[o + 8] - V[o + 2];
    const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx, len = Math.hypot(cx, cy, cz);
    if (len < 1e-12) continue;
    const nx = cx / len, ny = cy / len, nz = cz / len, d = nx * V[o] + ny * V[o + 1] + nz * V[o + 2];
    const key = [Math.round(nx * 500), Math.round(ny * 500), Math.round(nz * 500), Math.round(d / (diag * 2e-4))].join(',');
    const g = groups.get(key) || { n: [0, 0, 0], area: 0, d: 0 };
    g.n[0] += nx * len; g.n[1] += ny * len; g.n[2] += nz * len; g.area += len / 2; g.d += d * len; groups.set(key, g);
  }
  const out = [];
  for (const g of [...groups.values()].sort((a, b) => b.area - a.area).slice(0, 12)) {
    const l = Math.hypot(...g.n);
    if (l < 1e-12) continue;
    const nn = [g.n[0] / l, g.n[1] / l, g.n[2] / l], d = g.d / (2 * g.area);
    let supports = true;
    for (let i = 0; i < V.length && supports; i += 3) if (nn[0] * V[i] + nn[1] * V[i + 1] + nn[2] * V[i + 2] - d > tol * 20) supports = false;
    if (supports) out.push({ n: nn, area: g.area });
  }
  return out;
}

/** 3×3 (rows) turning unit a onto unit b by the smallest turn. */
export function turnTo(a, b) {
  const v = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]], c = a[0] * b[0] + a[1] * b[1] + a[2] * b[2], s = Math.hypot(...v);
  let k, ang;
  if (s < 1e-12) {
    if (c > 0) return I3.map((r) => r.slice());
    k = Math.abs(a[0]) < 0.9 ? [0, a[2], -a[1]] : [-a[2], 0, a[0]];
    const kl = Math.hypot(...k); k = k.map((x) => x / kl); ang = Math.PI;
  } else { k = v.map((x) => x / s); ang = Math.atan2(s, c); }
  const cs = Math.cos(ang), sn = Math.sin(ang), t = 1 - cs, [x, y, z] = k;
  return [[t * x * x + cs, t * x * y - sn * z, t * x * z + sn * y], [t * x * y + sn * z, t * y * y + cs, t * y * z - sn * x], [t * x * z - sn * y, t * y * z + sn * x, t * z * z + cs]];
}

export function createStage({ select } = {}) {
  let objs = new Map();     // id → { id, name, geom: { base }, orient (3×3), yaw (°), s, t: [x, y, z], src }
  let nextId = 1, version = 0, batching = null;
  const past = [], future = [];
  const bump = () => { version++; };
  const snap = () => new Map([...objs].map(([k, o]) => [k, { ...o, orient: o.orient.map((r) => r.slice()), t: o.t.slice() }]));
  const record = (label) => { if (batching) return; past.push({ label, state: snap() }); future.length = 0; if (past.length > 200) past.shift(); };
  const matrix = (o) => mul3(rz(o.yaw), o.orient).map((r) => r.map((v) => v * o.s));
  const boxOf = (o) => {
    const m = matrix(o), b = o.geom.base, lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < b.length; i += 3) for (let r = 0; r < 3; r++) {
      const v = m[r][0] * b[i] + m[r][1] * b[i + 1] + m[r][2] * b[i + 2] + o.t[r];
      if (v < lo[r]) lo[r] = v; if (v > hi[r]) hi[r] = v;
    }
    return { min: lo, max: hi };
  };
  const get = (id) => objs.get(id) || null;

  /** Keep the box's centre (x, y) and its lowest point while the linear part of the placement changes. */
  function reshape(o, change) {
    const before = boxOf(o);
    change(o);
    const after = boxOf(o);
    o.t[0] += (before.min[0] + before.max[0]) / 2 - (after.min[0] + after.max[0]) / 2;
    o.t[1] += (before.min[1] + before.max[1]) / 2 - (after.min[1] + after.max[1]) / 2;
    o.t[2] += before.min[2] - after.min[2];
  }

  const stage = {
    get version() { return version; },
    place(name, tris, { scale = 1, at = [0, 0], src = null } = {}) {
      if (!finTris(tris) || !fin(scale) || scale <= 0 || !Array.isArray(at) || !fin(at[0]) || !fin(at[1])) return null;
      record('place');
      const id = 'o' + nextId++;
      objs.set(id, { id, name: String(name || 'Object').slice(0, 120), geom: { base: pack(tris) }, orient: I3.map((r) => r.slice()), yaw: 0, s: scale, t: [at[0], at[1], 0], src });
      bump();
      return id;
    },
    objects() { return [...objs.values()].map((o) => ({ id: o.id, name: o.name, ...boxOf(o), src: o.src })); },
    plate() {
      const out = [];
      for (const o of objs.values()) {
        const m = matrix(o), b = o.geom.base;
        for (let i = 0; i < b.length; i += 9) {
          const tri = [];
          for (let k = 0; k < 3; k++) { const x = b[i + k * 3], y = b[i + k * 3 + 1], z = b[i + k * 3 + 2]; tri.push([m[0][0] * x + m[0][1] * y + m[0][2] * z + o.t[0], m[1][0] * x + m[1][1] * y + m[1][2] * z + o.t[1], m[2][0] * x + m[2][1] * y + m[2][2] * z + o.t[2]]); }
          out.push(tri);
        }
      }
      return out;
    },
    moveTo(id, x, y) {
      const o = get(id); if (!o || !fin(x) || !fin(y)) return;
      const b = boxOf(o), dx = x - (b.min[0] + b.max[0]) / 2, dy = y - (b.min[1] + b.max[1]) / 2;
      if (Math.abs(dx) < EPS && Math.abs(dy) < EPS) return;
      record('move'); o.t[0] += dx; o.t[1] += dy; bump();
    },
    drop(id) {
      const o = get(id); if (!o) return;
      const dz = -boxOf(o).min[2];
      if (Math.abs(dz) < 1e-7) return;
      record('drop'); o.t[2] += dz; bump();
    },
    rescale(id, f) {
      const o = get(id); if (!o || !fin(f) || f <= 0 || Math.abs(f - 1) < EPS) return;
      record('rescale'); reshape(o, (p) => { p.s *= f; }); bump();
    },
    remove(id) { if (!get(id)) return; record('remove'); objs.delete(id); bump(); },
    select(id) { if (get(id) && select) select(id); },
    batch(label, fn) {
      if (batching) { fn(); return; }
      const before = snap(), v = version;
      batching = label || 'batch';
      try { fn(); } finally {
        batching = null;
        if (version !== v) { past.push({ label: label || 'batch', state: before }); future.length = 0; if (past.length > 200) past.shift(); }
      }
    },
    rotate(id, degrees) {
      const o = get(id); if (!o || !fin(degrees) || Math.abs(degrees % 360) < EPS) return;
      record('rotate'); reshape(o, (p) => { p.yaw = (((p.yaw + degrees) % 360) + 360) % 360; }); bump();
    },
    orient(id, R) {
      const o = get(id);
      if (!o || !Array.isArray(R) || R.length !== 3 || !R.every((r) => Array.isArray(r) && r.length === 3 && r.every(fin))) return;
      record('orient'); reshape(o, (p) => { p.orient = R.map((r) => r.slice()); p.yaw = 0; }); bump();
    },
    baseFaces(id) {
      const o = get(id); if (!o) return [];
      return restingFaces(o.geom.base).map((f) => ({ ...f, R: turnTo(f.n, [0, 0, -1]) }));
    },
    layFlat(id) {
      const o = get(id); if (!o) return null;
      const faces = restingFaces(o.geom.base);
      if (!faces.length) return null;
      const f = faces[0], R = turnTo(f.n, [0, 0, -1]);
      if (R.every((r, i) => r.every((v, j) => Math.abs(v - o.orient[i][j]) < 1e-9)) && o.yaw === 0) return null;
      stage.orient(id, R);
      return { area: f.area, n: f.n };
    },
    replaceMesh(id, tris) {
      const o = get(id); if (!o || !finTris(tris)) return false;
      o.geom.base = pack(tris);   // shared with every history step that holds this object
      for (const h of [...past, ...future]) { const q = h.state.get(id); if (q) q.geom = o.geom; }
      bump(); return true;
    },
    rename(id, name) { const o = get(id); if (o) { o.name = String(name || 'Object').slice(0, 120); for (const h of [...past, ...future]) { const q = h.state.get(id); if (q) q.name = o.name; } } },
    setSrc(id, src) { const o = get(id); if (o) { o.src = src; for (const h of [...past, ...future]) { const q = h.state.get(id); if (q) q.src = src; } } },
    undo() { const h = past.pop(); if (!h) return false; future.push({ label: h.label, state: snap() }); objs = h.state; bump(); return true; },
    redo() { const h = future.pop(); if (!h) return false; past.push({ label: h.label, state: snap() }); objs = h.state; bump(); return true; },
    /** The scale an object stands at (1 = life size); bim-hosts-09: a scale model needs one scale for all. */
    scaleOf(id) { const o = get(id); return o ? o.s : 1; },
    depth() { return past.length; },
    redoDepth() { return future.length; },
    labels() { return past.map((h) => h.label); },
    /** The triangles of one object, world mm (for drawing it apart from the rest). */
    tris(id) {
      const o = get(id); if (!o) return [];
      const keep = objs; objs = new Map([[id, o]]);
      try { return stage.plate(); } finally { objs = keep; }
    },
    /** Drop an object because the host's thing is gone (not an edit: no undo step, and no history step brings it back). */
    forget(id) { objs.delete(id); for (const h of [...past, ...future]) h.state.delete(id); bump(); },
    /** The layout so far is the starting point: nothing before it can be undone. */
    resetHistory() { past.length = 0; future.length = 0; },
    clear() { objs = new Map(); past.length = 0; future.length = 0; bump(); },
  };
  return stage;
}

/** The host object lib/printstage/ps-panel.js takes, over a stage; `extra` adds what only the app can say (showBed, manifold, load, save, …). */
export function hostOf(stage, extra = {}) {
  return {
    objects: () => stage.objects().map(({ id, name, min, max }) => ({ id, name, min, max })),
    plate: () => stage.plate(),
    place: (name, tris, opts) => stage.place(name, tris, opts),
    moveTo: (id, x, y) => stage.moveTo(id, x, y),
    drop: (id) => stage.drop(id),
    rescale: (id, f) => stage.rescale(id, f),
    remove: (id) => stage.remove(id),
    select: (id) => stage.select(id),
    batch: (label, fn) => stage.batch(label, fn),
    ...extra,
  };
}
