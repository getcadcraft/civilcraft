/* SPDX-License-Identifier: Apache-2.0 */
/**
 * view3d.js — the equipment in a host's three.js scene (0.9 TW.5): real shapes in place of the flow add-on's strips, cartons on the belts, vehicles, moving robot arms. three.js is handed in (THREE),
 * so lib/twin stays free of it. It draws beside whatever is in the scene; the host hides the flow add-on's own marks while it is on.
 *
 *   const v = new TwinView(THREE, scene, invalidate)
 *   v.setEquipment(parts, { floor: part, robots: [{item, base, yaw}] })  ·  v.drawFrame({loads, vehicles}, t, stationsBusy: Set)  ·  v.drawBodies([{half, x, q}])  ·  v.clearFrame()  ·  v.dispose()
 */
import { COLORS, armParts, loadSize, loadColor } from './equipment.js';

const METAL = new Set(['steel', 'steelDark', 'roller', 'leg', 'chute']);
export class TwinView {
  constructor(THREE, scene, invalidate) {
    this.T = THREE; this.scene = scene; this.invalidate = invalidate || (() => {});
    this.group = new THREE.Group(); this.group.name = 'twin-equipment';
    this.dyn = new THREE.Group(); this.dyn.name = 'twin-moving';
    scene.add(this.group, this.dyn);
    this.box = new THREE.BoxGeometry(1, 1, 1);
    this.cyl = new THREE.CylinderGeometry(0.5, 0.5, 1, 14);   // axis along local Y, as a part's 'cyl' wants
    this.mats = new Map(); this.robots = []; this.m = new THREE.Matrix4(); this.pos = new THREE.Vector3(); this.q = new THREE.Quaternion(); this.s = new THREE.Vector3(); this.eu = new THREE.Euler(0, 0, 0, 'ZYX');
    this.pools = new Map();
  }
  mat(col, { glass = false, glow = false } = {}) {
    const k = col + (glass ? ':g' : '') + (glow ? ':e' : '');
    if (!this.mats.has(k)) {
      const hex = COLORS[col] || col, T = this.T;
      this.mats.set(k, new T.MeshStandardMaterial({ color: hex, metalness: METAL.has(col) ? 0.12 : 0, roughness: METAL.has(col) ? 0.5 : col === 'belt' ? 0.85 : 0.65,   // no environment map in the live view: real metalness would draw black
       
        ...(glass ? { transparent: true, opacity: 0.22, depthWrite: false } : {}), ...(glow ? { emissive: hex, emissiveIntensity: 0.9 } : {}) }));
    }
    return this.mats.get(k);
  }
  matrixOf(p, out) {
    this.eu.set(0, -(p.pitch || 0), (p.yaw * Math.PI) / 180, 'ZYX');
    this.q.setFromEuler(this.eu); this.pos.set(p.c[0], p.c[1], p.c[2]);
    this.s.set(p.s[0], p.s[1], p.s[2]);
    return out.compose(this.pos, this.q, this.s);
  }
  clearGroup(g) { for (const o of [...g.children]) { g.remove(o); if (o.dispose) o.dispose(); } }
  setEquipment(parts, { floor = null, robots = [] } = {}) {
    this.clearGroup(this.group);
    this.robots = robots;
    const sets = new Map();
    const all = floor ? [floor, ...parts] : parts;
    for (const p of all) { const k = [p.col, p.shape, p.glass ? 1 : 0, p.glow ? 1 : 0].join('|'); if (!sets.has(k)) sets.set(k, { p, list: [] }); sets.get(k).list.push(p); }
    for (const { p, list } of sets.values()) {
      const im = new this.T.InstancedMesh(p.shape === 'cyl' ? this.cyl : this.box, this.mat(p.col, p), list.length);
      im.name = 'twin:' + p.col; im.castShadow = !p.glass && p.col !== 'floor'; im.receiveShadow = true;
      list.forEach((x, i) => im.setMatrixAt(i, this.matrixOf(x, this.m)));
      im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); im.frustumCulled = false;
      this.group.add(im);
    }
    this.invalidate();
  }
  pool(key, col, geo, n, opts = {}) {
    let e = this.pools.get(key);
    if (!e || e.cap < n) {
      if (e) { this.dyn.remove(e.mesh); e.mesh.dispose(); }
      const cap = Math.max(64, n * 2), mesh = new this.T.InstancedMesh(geo, this.mat(col, opts), cap);
      mesh.frustumCulled = false; mesh.castShadow = true; mesh.receiveShadow = true; mesh.name = 'twin:' + key; this.dyn.add(mesh);
      e = { mesh, cap }; this.pools.set(key, e);
    }
    e.mesh.count = n;
    return e.mesh;
  }
  put(mesh, i, p) { mesh.setMatrixAt(i, this.matrixOf(p, this.m)); }
  drawFrame(frame, t = 0, busy = new Set()) {
    const loads = frame ? frame.loads : [], veh = frame ? frame.vehicles : [];
    const byCol = new Map();
    for (const l of loads) { const c = loadColor(l.type); if (!byCol.has(c)) byCol.set(c, []); byCol.get(c).push(l); }
    for (const key of this.pools.keys()) if (key.startsWith('load:')) this.pools.get(key).mesh.count = 0;
    let n = 0;
    for (const [c, list] of byCol) {
      const m = this.pool('load:' + c, c, this.box, list.length);
      list.forEach((l, i) => { const s = loadSize(l.L); this.put(m, i, { c: [l.p[0], l.p[1], l.p[2] + s.h / 2], s: [s.l, s.w, s.h], yaw: l.h, pitch: 0 }); });
      m.instanceMatrix.needsUpdate = true; n += list.length;
    }
    const tape = this.pool('tape', '#e8dcc0', this.box, n);
    { let i = 0; for (const l of loads) { const s = loadSize(l.L); this.put(tape, i++, { c: [l.p[0], l.p[1], l.p[2] + s.h + 0.001], s: [s.l * 1.002, 0.05, 0.004], yaw: l.h, pitch: 0 }); } tape.instanceMatrix.needsUpdate = true; }
    const body = this.pool('veh', 'vehicle', this.box, veh.length), deck = this.pool('deck', 'vehicleDark', this.box, veh.length);
    veh.forEach((v, i) => { this.put(body, i, { c: [v.p[0], v.p[1], 0.14], s: [1.0, 0.7, 0.22], yaw: v.h, pitch: 0 }); this.put(deck, i, { c: [v.p[0], v.p[1], 0.26], s: [0.92, 0.62, 0.02], yaw: v.h, pitch: 0 }); });
    body.instanceMatrix.needsUpdate = true; deck.instanceMatrix.needsUpdate = true;
    // the arms move while their station is working: a pick-and-place swing for the picture, not a robot program
    const links = [];
    for (const r of this.robots) {
      const w = busy.has(r.item) ? 1 : 0.15, q = [Math.sin(t * 1.3) * 0.9 * w, 0.55 + Math.sin(t * 2.1) * 0.22 * w, 0.8 + Math.cos(t * 2.1) * 0.3 * w];
      links.push(...armParts(r.base, r.yaw, q, r.item));
    }
    const grp = new Map();
    for (const p of links) { const k = p.col + '|' + p.shape; if (!grp.has(k)) grp.set(k, []); grp.get(k).push(p); }
    for (const key of this.pools.keys()) if (key.startsWith('arm:')) this.pools.get(key).mesh.count = 0;
    for (const [k, list] of grp) {
      const [col, shape] = k.split('|'), m = this.pool('arm:' + k, col, shape === 'cyl' ? this.cyl : this.box, list.length);
      list.forEach((p, i) => this.put(m, i, p)); m.instanceMatrix.needsUpdate = true;
    }
    this.invalidate();
    return { loads: n, vehicles: veh.length };
  }
  /** Boxes from the physics check. */
  drawBodies(bodies) {
    for (const key of this.pools.keys()) if (key.startsWith('load:') || key === 'tape') this.pools.get(key).mesh.count = 0;
    const m = this.pool('load:phys', LOADCOL, this.box, bodies.length);
    bodies.forEach((b, i) => { this.pos.set(b.x[0], b.x[1], b.x[2]); this.q.set(b.q[0], b.q[1], b.q[2], b.q[3]); this.s.set(2 * b.half[0], 2 * b.half[1], 2 * b.half[2]); m.setMatrixAt(i, this.m.compose(this.pos, this.q, this.s)); });
    m.instanceMatrix.needsUpdate = true;
    this.invalidate();
  }
  clearFrame() { for (const e of this.pools.values()) e.mesh.count = 0; this.invalidate(); }
  dispose() {
    this.clearGroup(this.group);
    for (const e of this.pools.values()) e.mesh.dispose();
    this.pools.clear();
    this.scene.remove(this.group, this.dyn);
    for (const m of this.mats.values()) m.dispose();
    this.box.dispose(); this.cyl.dispose();
    this.invalidate();
  }
}
const LOADCOL = '#c49a6c';
