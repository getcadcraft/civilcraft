/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: no words here. */
/**
 * display.js — cc-nodes (0.8 round 3, nodes_PART_3; DC.54): the nodes that have their eye on, drawn with three.js, the same in every host.
 * Points as dots, curves as lines (curve.tessellate), surfaces as meshes with the surface's own normals (surface.tessellate), meshes as meshes.
 * THREE and cc-nurbs are handed in, so this file imports nothing.
 *
 *   const d = new NodesDisplay(THREE, N, parent, { scale })   scale = host units per millimetre (ModelCraft 0.001, PartCraft 1)
 *   d.draw(shown)        shown = Evaluator.run().shown; objects of a value that did not change are kept
 *   d.bounds() → { min: [x,y,z], max: [x,y,z] } | null   in millimetres, of what is drawn (for "fit")
 *   d.clear() · d.dispose()
 */
const COLORS = { point: 0xd17a22, curve: 0x1f5fa8, surface: 0xb8c4cf, mesh: 0xb8c4cf };

export class NodesDisplay {
  constructor(THREE, N, parent, { scale = 1, tol = 0.2 } = {}) {
    this.T = THREE; this.N = N; this.scale = scale; this.tol = tol;
    this.group = new THREE.Group(); this.group.name = 'nodes';
    parent.add(this.group);
    this.cache = new Map();   // 'id.port' → { value, obj, box }
  }
  free(o) { o.traverse?.((x) => { x.geometry?.dispose?.(); if (x.material) (Array.isArray(x.material) ? x.material : [x.material]).forEach((m) => m.dispose?.()); }); }
  /** Build the objects for one value (lists recurse); returns { obj, box } or null. */
  build(v) {
    const T = this.T, N = this.N, s = this.scale, group = new T.Group();
    let box = null;
    const grow = (p) => { box = box || { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] }; for (let k = 0; k < 3; k++) { box.min[k] = Math.min(box.min[k], p[k]); box.max[k] = Math.max(box.max[k], p[k]); } };
    const add = (x) => {
      if (Array.isArray(x)) { x.forEach(add); return; }
      if (x instanceof Float64Array && x.length === 3) {
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(Float32Array.of(x[0] * s, x[1] * s, x[2] * s), 3));
        group.add(new T.Points(g, new T.PointsMaterial({ color: COLORS.point, size: 7, sizeAttenuation: false }))); grow(x); return;
      }
      if (x && Array.isArray(x.knots) && Array.isArray(x.cvs)) {
        const pts = N.curve.tessellate(x, { tol: this.tol }).points, a = new Float32Array(pts.length * 3);
        pts.forEach((p, k) => { a[k * 3] = p[0] * s; a[k * 3 + 1] = p[1] * s; a[k * 3 + 2] = p[2] * s; grow(p); });
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(a, 3));
        group.add(new T.Line(g, new T.LineBasicMaterial({ color: COLORS.curve }))); return;
      }
      let pos = null, idx = null, nor = null;
      if (x && Array.isArray(x.knotsU)) { const t = N.surface.tessellate(x, { tol: this.tol }); pos = t.positions; idx = t.indices; nor = t.normals; }
      else if (x && x.positions instanceof Float64Array) { pos = x.positions; idx = x.indices; }
      if (pos) {
        const p = new Float32Array(pos.length);
        for (let k = 0; k < pos.length; k += 3) { p[k] = pos[k] * s; p[k + 1] = pos[k + 1] * s; p[k + 2] = pos[k + 2] * s; grow([pos[k], pos[k + 1], pos[k + 2]]); }
        const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(p, 3)); g.setIndex(new T.BufferAttribute(Uint32Array.from(idx), 1));
        if (nor) g.setAttribute('normal', new T.BufferAttribute(Float32Array.from(nor), 3)); else g.computeVertexNormals();
        group.add(new T.Mesh(g, new T.MeshStandardMaterial({ color: COLORS.surface, side: T.DoubleSide, roughness: 0.45, metalness: 0.05, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 })));
      }
    };
    add(v);
    return group.children.length ? { obj: group, box } : null;
  }
  draw(shown) {
    const seen = new Set();
    for (const { id, port, value } of shown) {
      const key = id + '.' + port; seen.add(key);
      const hit = this.cache.get(key);
      if (hit && hit.value === value) continue;
      if (hit) { this.group.remove(hit.obj); this.free(hit.obj); this.cache.delete(key); }
      const b = this.build(value);
      if (b) { this.group.add(b.obj); this.cache.set(key, { value, obj: b.obj, box: b.box }); }
    }
    for (const [key, hit] of [...this.cache]) if (!seen.has(key)) { this.group.remove(hit.obj); this.free(hit.obj); this.cache.delete(key); }
  }
  bounds() {
    let b = null;
    for (const { box } of this.cache.values()) if (box) {
      b = b || { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
      for (let k = 0; k < 3; k++) { b.min[k] = Math.min(b.min[k], box.min[k]); b.max[k] = Math.max(b.max[k], box.max[k]); }
    }
    return b;
  }
  clear() { this.draw([]); }
  dispose() { this.clear(); this.group.parent?.remove(this.group); }
}
