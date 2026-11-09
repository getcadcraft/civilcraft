/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: no words here (object names are ids). */
/**
 * display.js — cc-nurbs-ui (0.8 round 3, model_PART_3; SU.747b mount): a patch set drawn with three.js, the same in every host. Curves
 * as lines from curve.tessellate, surfaces as meshes from surface.tessellate with the surface's OWN normals (never recomputed), the
 * control net on request, zebra stripes from analysis.zebraValue and curvature colours from analysis.maps — the numbers stay cc-nurbs'.
 * THREE is handed in (the host's own three.js), so this file imports nothing but its sibling library.
 *
 *   const d = new NurbsDisplay(THREE, N, parent, { scale })   parent = a THREE.Object3D in the host's scene; scale = host units per mm
 *     (ModelCraft: 0.001, its model is in metres; PartCraft: 1)
 *   d.draw(doc, { mode: 'shaded' | 'zebra' | 'curvature', cvs, picks: [{ id, sub }], tol })   rebuilds what changed (per item, by identity)
 *   d.view(eye)            zebra follows the eye (host units); cheap when the eye barely moved
 *   d.pick(raycaster) → { id, kind, sub } | null      sub = the nearest edge of a surface (u0|u1|v0|v1) or end of a curve (start|end)
 *   d.range() → { min, max } | null   the Gaussian curvature range shown (1/mm²), for the host's legend
 *   d.setCloud(map, tol)   the deviation map of a scan fit as coloured points (map = Float32Array x, y, z, distance); null clears it
 *   d.dispose()
 */
const COL = { curve: 0x1f5fa8, picked: 0xd17a22, surface: 0xb8c4cf, cvs: 0x8a5a9c, edge: 0xd17a22 };

export class NurbsDisplay {
  constructor(THREE, N, parent, { scale = 1 } = {}) {
    this.T = THREE; this.N = N; this.scale = scale;
    this.group = new THREE.Group(); this.group.name = 'nurbs';
    parent.add(this.group);
    this.cache = new Map();   // item id → { geom (the item's curve/surface object), mode, obj }
    this.extra = new THREE.Group(); this.extra.name = 'nurbs-extra';
    this.group.add(this.extra);
    this.mode = 'shaded'; this.eye = null; this.kRange = null; this.doc = null;
  }
  mat(kind, color, opts = {}) {
    const T = this.T;
    if (kind === 'line') return new T.LineBasicMaterial({ color, ...opts });
    if (kind === 'points') return new T.PointsMaterial({ color, size: 5, sizeAttenuation: false, ...opts });
    return new T.MeshStandardMaterial({ color, side: T.DoubleSide, roughness: 0.45, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1, ...opts });
  }
  disposeObj(o) { o.traverse?.((x) => { x.geometry?.dispose?.(); if (x.material) (Array.isArray(x.material) ? x.material : [x.material]).forEach((m) => m.dispose?.()); }); }
  line(points, color) {
    const T = this.T, s = this.scale, a = new Float32Array(points.length * 3);
    points.forEach((p, i) => { a[i * 3] = p[0] * s; a[i * 3 + 1] = p[1] * s; a[i * 3 + 2] = (p[2] || 0) * s; });
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3));
    return new T.Line(g, this.mat('line', color));
  }
  surfaceMesh(it, mode, tol) {
    const T = this.T, s = this.scale, N = this.N;
    const tess = it.trim ? N.trim.tessellate(it.surface, it.trim, { tol, curvature: mode === 'curvature' })   // 0.8 DC.54 S2: cut along the trim loops
      : mode === 'curvature' ? N.analysis.maps(it.surface, { tol }) : N.surface.tessellate(it.surface, { tol });
    const n = tess.positions.length / 3, pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
    for (let i = 0; i < n * 3; i++) { pos[i] = tess.positions[i] * s; nor[i] = tess.normals[i]; }
    const g = new T.BufferGeometry();
    g.setAttribute('position', new T.BufferAttribute(pos, 3));
    g.setAttribute('normal', new T.BufferAttribute(nor, 3));   // the surface's own normals: kept
    g.setAttribute('uv', new T.BufferAttribute(Float32Array.from(tess.uvs), 2));
    g.setIndex(new T.BufferAttribute(tess.indices, 1));
    let material;
    if (mode === 'shaded') material = this.mat('mesh', COL.surface);
    else {
      const col = new Float32Array(n * 3);
      g.setAttribute('color', new T.BufferAttribute(col, 3));
      material = this.mat('mesh', 0xffffff, { vertexColors: true, roughness: 1, metalness: 0 });
      if (mode === 'curvature') g.userData.K = tess.K;
    }
    const m = new T.Mesh(g, material);
    m.userData.nurbs = { id: it.id, kind: 'surface' };
    m.userData.normals = tess.normals;
    return m;
  }
  /** Diverging colours for Gaussian curvature: blue (K < 0, saddle) · white (flat) · red (K > 0, dome), symmetric about zero. */
  paintCurvature() {
    let max = 0;
    for (const o of this.surfaces()) for (const k of o.geometry.userData.K || []) if (Number.isFinite(k)) max = Math.max(max, Math.abs(k));
    this.kRange = { min: -max, max };
    for (const o of this.surfaces()) {
      const K = o.geometry.userData.K, col = o.geometry.getAttribute('color');
      if (!K || !col) continue;
      for (let i = 0; i < K.length; i++) {
        const f = max > 0 && Number.isFinite(K[i]) ? Math.max(-1, Math.min(1, K[i] / max)) : 0;
        const r = f > 0 ? 1 : 1 + f, gch = 1 - Math.abs(f) * 0.85, b = f < 0 ? 1 : 1 - f;
        col.setXYZ(i, r, gch, b);
      }
      col.needsUpdate = true;
    }
  }
  paintZebra() {
    if (!this.eye) return;
    for (const o of this.surfaces()) {
      const col = o.geometry.getAttribute('color'), nrm = o.userData.normals, pos = o.geometry.getAttribute('position');
      if (!col || !nrm) continue;
      for (let i = 0; i < col.count; i++) {
        const n = [nrm[i * 3], nrm[i * 3 + 1], nrm[i * 3 + 2]];
        const d = [pos.getX(i) - this.eye[0], pos.getY(i) - this.eye[1], pos.getZ(i) - this.eye[2]], l = Math.hypot(d[0], d[1], d[2]) || 1;
        const z = this.N.analysis.zebraValue(n, [d[0] / l, d[1] / l, d[2] / l]) < 0.5 ? 0.08 : 0.96;
        col.setXYZ(i, z, z, z);
      }
      col.needsUpdate = true;
    }
  }
  surfaces() { const out = []; for (const c of this.cache.values()) if (c.obj?.isMesh) out.push(c.obj); return out; }
  draw(doc, { mode = 'shaded', cvs = false, picks = [], tol = 0.05 } = {}) {
    this.doc = doc; this.mode = mode;
    const seen = new Set();
    for (const it of doc ? doc.items : []) {
      seen.add(it.id);
      const geom = it[it.kind], c = this.cache.get(it.id);
      const want = it.kind === 'surface' ? mode : 'line';
      if (c && c.geom === geom && c.trim === it.trim && c.mode === want && c.hidden === !!it.hidden) continue;
      if (c) { this.group.remove(c.obj); this.disposeObj(c.obj); }
      let obj;
      if (it.kind === 'curve') { obj = this.line(this.N.curve.tessellate(geom, { tol }).points, COL.curve); obj.userData.nurbs = { id: it.id, kind: 'curve' }; }
      else obj = this.surfaceMesh(it, mode, tol);
      obj.visible = !it.hidden;
      this.group.add(obj);
      this.cache.set(it.id, { geom, trim: it.trim, mode: want, obj, hidden: !!it.hidden });
    }
    for (const [id, c] of [...this.cache]) if (!seen.has(id)) { this.group.remove(c.obj); this.disposeObj(c.obj); this.cache.delete(id); }
    // what is picked, and the control nets: small, rebuilt every time
    for (const o of [...this.extra.children]) { this.extra.remove(o); this.disposeObj(o); }
    const picked = new Set(picks.filter((p) => !p.sub).map((p) => p.id));
    for (const [id, c] of this.cache) if (c.obj.isLine) c.obj.material.color.setHex(picked.has(id) ? COL.picked : COL.curve);
    for (const p of picks) {
      if (!p.sub || !doc) continue;
      try {
        const g = this.N.tools.pick(doc, p.id + '.' + p.sub);
        if (Array.isArray(g)) { const m = new this.T.Points(new this.T.BufferGeometry().setAttribute('position', new this.T.BufferAttribute(Float32Array.from(g.map((v) => v * this.scale)), 3)), this.mat('points', COL.edge, { size: 9 })); this.extra.add(m); }
        else this.extra.add(this.line(this.N.curve.tessellate(g, { tol }).points, COL.edge));
      } catch { /* an item that went away */ }
    }
    if (cvs && doc) for (const it of doc.items) {
      if (it.hidden) continue;
      if (it.kind === 'curve') this.extra.add(this.line(it.curve.cvs, COL.cvs));
      else {
        const net = it.surface.cvs;
        for (const row of net) this.extra.add(this.line(row, COL.cvs));
        for (let j = 0; j < net[0].length; j++) this.extra.add(this.line(net.map((r) => r[j]), COL.cvs));
      }
    }
    if (mode === 'curvature') this.paintCurvature(); else this.kRange = null;
    if (mode === 'zebra') this.paintZebra();
  }
  view(eye) {
    if (this.mode !== 'zebra' || !eye) { this.eye = eye ? eye.slice() : null; return false; }
    if (this.eye && Math.hypot(eye[0] - this.eye[0], eye[1] - this.eye[1], eye[2] - this.eye[2]) < 1e-3 * (Math.hypot(...eye) || 1)) return false;
    this.eye = eye.slice(); this.paintZebra();
    return true;
  }
  range() { return this.kRange; }
  /** The scan's deviation map (0.9 round 2): the measured points of a scan fit as a point cloud, blue on the face, green halfway to the tolerance, red at the tolerance or more.
   *  map = Float32Array of x, y, z (mm), distance (mm) per point; null or empty removes it. */
  setCloud(map, tol) {
    if (this.cloud) { this.group.remove(this.cloud); this.disposeObj(this.cloud); this.cloud = null; }
    if (!map || map.length < 4) return 0;
    const T = this.T, s = this.scale, n = Math.floor(map.length / 4), pos = new Float32Array(n * 3), col = new Float32Array(n * 3), t = tol > 0 ? tol : 0.1;
    for (let i = 0; i < n; i++) {
      pos[i * 3] = map[i * 4] * s; pos[i * 3 + 1] = map[i * 4 + 1] * s; pos[i * 3 + 2] = map[i * 4 + 2] * s;
      const f = Math.max(0, Math.min(1, map[i * 4 + 3] / t));
      const [r, g, b] = f < 0.5 ? [0.1 + 0.8 * f, 0.35 + 0.9 * f, 1 - 1.6 * f] : [0.5 + 1.0 * (f - 0.5) * 1, 0.8 - 1.4 * (f - 0.5), 0.2 - 0.2 * (f - 0.5)];
      col[i * 3] = Math.min(1, r); col[i * 3 + 1] = Math.max(0, Math.min(1, g)); col[i * 3 + 2] = Math.max(0, Math.min(1, b));
    }
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('color', new T.BufferAttribute(col, 3));
    this.cloud = new T.Points(g, new T.PointsMaterial({ size: 4, sizeAttenuation: false, vertexColors: true }));
    this.cloud.name = 'nurbs-deviation-map'; this.cloud.userData.nurbsCloud = n;
    this.group.add(this.cloud);
    return n;
  }
  /** The item under a THREE.Raycaster: curves by their lines, surfaces by their faces; sub = the nearest edge or end. */
  pick(raycaster) {
    const objs = [...this.cache.values()].map((c) => c.obj).filter((o) => o.visible);
    const hits = raycaster.intersectObjects(objs, false);
    const h = hits[0];
    if (!h) return null;
    const ref = { ...h.object.userData.nurbs };
    const it = this.doc && this.N.doc.item(this.doc, ref.id);
    if (!it) return null;
    if (it.kind === 'surface' && h.uv) {
      const [ua, ub] = this.N.surface.domainU(it.surface), [va, vb] = this.N.surface.domainV(it.surface);
      const fu = (h.uv.x - ua) / ((ub - ua) || 1), fv = (h.uv.y - va) / ((vb - va) || 1);
      const d = { u0: fu, u1: 1 - fu, v0: fv, v1: 1 - fv };
      ref.sub = Object.keys(d).reduce((a, b) => (d[a] <= d[b] ? a : b));
    } else if (it.kind === 'curve') {
      const s = this.scale, cv = it.curve.cvs, p0 = cv[0], p1 = cv[cv.length - 1], q = h.point;
      const dist = (p) => Math.hypot(p[0] * s - q.x, p[1] * s - q.y, (p[2] || 0) * s - q.z);
      ref.sub = dist(p0) <= dist(p1) ? 'start' : 'end';
    }
    return ref;
  }
  dispose() { this.setCloud(null); for (const c of this.cache.values()) this.disposeObj(c.obj); this.cache.clear(); this.disposeObj(this.extra); this.group.parent?.remove(this.group); }
}
