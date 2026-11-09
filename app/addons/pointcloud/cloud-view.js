/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cloud-view.js — the point cloud in CivilCraft's 3D view (spec § 6, PC.2). ONE THREE.Group is added to the 3D view's scene; the core
 * drawing (site3d.js, site-view3d.js) is not changed. Every frame (selection throttled to 10 Hz):
 *   - the group is placed from the view's current local origin and vertical exaggeration (they move when the project gets ground);
 *   - cloud.select() chooses nodes: frustum cull, screen-space error (refine while a point covers more than maxError px), a point
 *     budget (default 2.5 M), parents before children (additive levels of detail);
 *   - PC.2: points are a small shader (square, `size` px; or shrinking with distance, "size attenuation"); eye-dome lighting (edl.js) shades
 *     the whole scene by depth when on. On a phone the budget starts at 500 k and EDL is off (spec § 6).
 *   - missing nodes are loaded by 2 workers (worker.js: decodeNode + colouring), held in an LRU cache (default 1 GB of geometry).
 * `stats()` is what the panel shows and what the browser test asserts: points drawn never exceed the budget.
 */
import * as THREE from 'three';
import { createEdl } from './edl.js';

const HEIGHT_OPTS = { rgb: 'rgb', height: 'height', class: 'class', intensity: 'intensity', residual: 'residual' };

const PHONE = (() => { try { return (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && Math.min(screen.width, screen.height) < 700) || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent); } catch { return false; } })();

/** For the browser test: the phone rule evaluated in the page it runs in. */
export const IS_PHONE = PHONE;

const PT_VS = `attribute vec3 color; varying vec3 vC; uniform float uSize; uniform float uAtten; uniform float uRef;
  void main(){ vC = color; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * mv;
    float d = max(-mv.z, 1e-3); gl_PointSize = uAtten > 0.5 ? clamp(uSize * uRef / d, 1.0, uSize * 8.0) : uSize; }`;
const PT_FS = 'varying vec3 vC; void main(){ gl_FragColor = linearToOutputTexel(vec4(vC, 1.0)); }';   // as PointsMaterial did: the screen gets the sRGB of the linear colour, a render target gets it unchanged

export function createCloudView(ctx) {
  const st = {
    cloud: null, group: null, host: null, v3: null, nodes: new Map(), loading: new Set(), queue: [], sel: [], selSet: new Set(),
    mode: 'rgb', size: 2, atten: false, edl: !PHONE, edlObj: null, budget: PHONE ? 500000 : 2500000, maxError: 1.5, cacheMB: 1024, cached: 0, gen: 0, dirty: true, lastSel: 0, lastKey: '',
    T: [0, 0, 0], S: [1, 1, 1], active: 0, resid: null, tol: 0.15, workers: [], jobs: new Map(), nextJob: 1, rr: 0, attached: false,
    origDraw: null, origRadius: null, mat: null, loadedTotal: 0,
  };
  const api = ctx.api;

  function ensureWorkers() {
    if (st.workers.length) return;
    for (let k = 0; k < 2; k++) {
      const w = new Worker(api.url('worker.js'), { type: 'module' });
      w.onmessage = (e) => { const j = st.jobs.get(e.data.id); if (!j) return; st.jobs.delete(e.data.id); if (e.data.error) j.reject(new Error(e.data.error)); else j.resolve(e.data); };
      w.onerror = (e) => { api.log('worker error', e.message); };   // i18n-ignore: developer log
      st.workers.push(w);
    }
  }
  function job(msg, transfer) {
    ensureWorkers();
    const id = st.nextJob++;
    return new Promise((resolve, reject) => { st.jobs.set(id, { resolve, reject }); st.workers[st.rr++ % st.workers.length].postMessage({ ...msg, id }, transfer || []); });
  }

  function colourOpts() {
    const c = st.cloud, b = c.bounds;
    return { mode: st.mode, zmin: b.min[2], zmax: b.max[2], imax: 65535, tol: st.tol, grid: st.resid, ox: c.origin[0], oy: c.origin[1], oz: c.origin[2] };
  }

  function sync() {
    const c = st.cloud, co = c.origin, d = st.host.data;
    if (st.mat) { const b = c.bounds; st.mat.uniforms.uRef.value = Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], b.max[2] - b.min[2]) || 100; }
    const O = d && d.origin ? d.origin : { x: co[0], y: co[1], z: co[2] }, ex = d && d.exag ? d.exag : 1;
    st.T = [co[0] - O.x, co[1] - O.y, (co[2] - O.z) * ex]; st.S = [1, 1, ex];
    st.group.position.set(st.T[0], st.T[1], st.T[2]);
    st.group.scale.set(1, 1, ex);
    st.group.updateMatrixWorld(true);
  }

  function viewParams() {
    const cam = st.host.cam, M = cam.viewProj(), [S0, S1, S2] = st.S, [T0, T1, T2] = st.T;
    const row = (r) => [M[r], M[4 + r], M[8 + r], M[12 + r]];
    const r0 = row(0), r1 = row(1), r2 = row(2), r3 = row(3);
    const comb = (a, b, s) => [a[0] + s * b[0], a[1] + s * b[1], a[2] + s * b[2], a[3] + s * b[3]];
    const local = [comb(r3, r0, 1), comb(r3, r0, -1), comb(r3, r1, 1), comb(r3, r1, -1), comb(r3, r2, 1), comb(r3, r2, -1)];
    const planes = local.map(([a, b, c, d]) => [a * S0, b * S1, c * S2, a * T0 + b * T1 + c * T2 + d]);
    const e = cam.eye;
    return { eye: [(e[0] - T0) / S0, (e[1] - T1) / S1, (e[2] - T2) / S2], planes, focalPx: cam.h / (2 * Math.tan((cam.fov * Math.PI) / 360)) };
  }

  function camKey() {
    const c = st.host.cam;
    return [c.eye.join(','), c.target.join(','), c.fov, c.persp ? 1 : 0, c.w, c.h, c.height.toFixed(3), st.T.join(','), st.S[2]].join('|');
  }

  function reselect() {
    const c = st.cloud;
    st.lastSel = performance.now(); st.dirty = false;
    const sel = c.select(viewParams(), { budget: st.budget, maxError: st.maxError });
    st.sel = sel; st.selSet = new Set(sel);
    for (const i of sel) { const n = st.nodes.get(i); if (n) { st.nodes.delete(i); st.nodes.set(i, n); n.obj.visible = true; } }   // LRU: touched = newest
    for (const [i, n] of st.nodes) if (!st.selSet.has(i)) n.obj.visible = false;
    st.queue = sel.filter((i) => !st.nodes.has(i) && !st.loading.has(i) && c.nodePoints(i) > 0);
    pump();
  }

  function pump() {
    while (st.active < 2 && st.queue.length) {
      const i = st.queue.shift();
      if (st.nodes.has(i) || st.loading.has(i)) continue;
      st.loading.add(i); st.active++;
      const gen = st.gen;
      loadNode(i, gen).catch((e) => api.log('node ' + i + ' failed', e && e.message))   // i18n-ignore: developer log
        .finally(() => { st.loading.delete(i); st.active--; pump(); });
    }
  }

  async function loadNode(i, gen) {
    const c = st.cloud, opt = colourOpts();
    let r;
    if (c.edits.count() === 0) {
      let bytes = await c.get('n/' + c.nodeId(i) + '.bin');
      if (!bytes) return;
      if (c.store.kind === 'memory') bytes = new Uint8Array(bytes);
      r = await job({ bytes, scale: c.scale, ...opt }, [bytes.buffer]);
    } else {
      const nd = await c.readNode(i, { attrs: ['cls', 'rgb', 'inten'] });
      r = await job({ node: nd, ...opt }, [nd.pos.buffer]);
    }
    if (gen !== st.gen || c !== st.cloud) return;
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(r.pos, 3));
    g.setAttribute('color', new THREE.BufferAttribute(r.col, 3, true));
    const pts = new THREE.Points(g, st.mat);
    pts.frustumCulled = false;
    pts.visible = st.selSet.has(i);
    st.group.add(pts);
    const bytes = r.n * 15;
    st.nodes.set(i, { obj: pts, n: r.n, bytes });
    st.cached += bytes;
    evict();
    st.loadedTotal++;
    st.host.invalidate();
  }

  function evict() {
    const cap = st.cacheMB * 1048576;
    if (st.cached <= cap) return;
    for (const [i, n] of [...st.nodes]) {
      if (st.cached <= cap) break;
      if (st.selSet.has(i)) continue;
      drop(i, n);
    }
  }
  function drop(i, n) { st.group.remove(n.obj); n.obj.geometry.dispose(); st.cached -= n.bytes; st.nodes.delete(i); }
  function clearNodes() { st.gen++; for (const [i, n] of [...st.nodes]) drop(i, n); st.queue = []; st.dirty = true; }

  function onFrame() {
    if (!st.cloud) return;
    sync();
    st.host.cam.clip(st.host.radius());
    const key = camKey(), now = performance.now();
    if (st.dirty || key !== st.lastKey) {
      if (now - st.lastSel >= 100 || st.dirty) { st.lastKey = key; reselect(); }
      else setTimeout(() => st.host.invalidate(), 100 - (now - st.lastSel) + 5);
    }
  }

  const api2 = {
    get attached() { return st.attached; },
    get host() { return st.host; },
    async attach() {
      const app = ctx.app();
      if (!app) throw Object.assign(new Error('no app'), { code: 'no_app' });   // i18n-ignore: developer error
      await app.show3D(true);
      const v3 = app.view3d;
      if (!v3) throw Object.assign(new Error('no 3d'), { code: 'no_3d' });   // i18n-ignore: developer error
      if (st.attached && st.host === v3.view) return;
      if (st.attached) api2.detach();
      st.v3 = v3; st.host = v3.view;
      st.group = new THREE.Group(); st.group.name = 'pointcloud'; st.group.matrixAutoUpdate = true;
      st.mat = new THREE.ShaderMaterial({ vertexShader: PT_VS, fragmentShader: PT_FS, uniforms: { uSize: { value: st.size }, uAtten: { value: st.atten ? 1 : 0 }, uRef: { value: 100 } } });
      st.edlObj = createEdl(THREE, st.host.renderer); st.edlObj.enabled = st.edl; st.edlObj.install();
      st.host.scene.add(st.group);
      st.origDraw = st.host.draw; st.origRadius = st.host.radius;
      const draw = st.origDraw.bind(st.host), radius = st.origRadius.bind(st.host);
      st.host.draw = function () { onFrame(); draw(); };
      st.host.radius = function () {
        const r = radius();
        if (!st.cloud) return r;
        const b = st.cloud.bounds;
        return Math.max(r, Math.hypot(b.max[0] - b.min[0], b.max[1] - b.min[1], (b.max[2] - b.min[2]) * st.S[2]) / 2);
      };
      st.attached = true;
    },
    detach() {
      if (!st.attached) return;
      clearNodes();
      st.host.scene.remove(st.group);
      st.mat.dispose(); if (st.edlObj) { st.edlObj.uninstall(); st.edlObj = null; }
      st.host.draw = st.origDraw; st.host.radius = st.origRadius;
      for (const w of st.workers) w.terminate();
      st.workers = []; st.jobs.clear();
      st.attached = false; st.host.invalidate();
    },
    async setCloud(cloud, { fit = true } = {}) {
      if (cloud) await api2.attach();
      clearNodes();
      st.cloud = cloud;
      if (cloud) { sync(); if (fit) api2.fit(); }
      st.dirty = true;
      st.host && st.host.invalidate();
    },
    fit(dir = null) {
      const b = st.cloud.bounds, [S0, S1, S2] = st.S, [T0, T1, T2] = st.T, o = st.cloud.origin;
      const lo = [S0 * (b.min[0] - o[0]) + T0, S1 * (b.min[1] - o[1]) + T1, S2 * (b.min[2] - o[2]) + T2], hi = [S0 * (b.max[0] - o[0]) + T0, S1 * (b.max[1] - o[1]) + T1, S2 * (b.max[2] - o[2]) + T2];
      st.host.cam.fit({ min: lo, max: hi }, dir);
      st.host.invalidate();
    },
    reload() { if (!st.cloud) return; clearNodes(); st.host && st.host.invalidate(); },
    setMode(m) { if (!HEIGHT_OPTS[m] || m === st.mode) return; st.mode = m; api2.reload(); },
    get mode() { return st.mode; },
    setSize(px) { st.size = px; if (st.mat) { st.mat.uniforms.uSize.value = px; st.host.invalidate(); } },
    get size() { return st.size; },
    /** Point size shrinks with distance (reference: the cloud's own width, where the size is the slider's value). */
    setAttenuation(on) { st.atten = !!on; if (st.mat) { st.mat.uniforms.uAtten.value = on ? 1 : 0; st.host.invalidate(); } },
    get attenuation() { return st.atten; },
    setEdl(on) { st.edl = !!on; if (st.edlObj) st.edlObj.enabled = st.edl; st.host && st.host.invalidate(); },
    get edl() { return st.edl; },
    get edlPasses() { return st.edlObj ? st.edlObj.passes : 0; },
    get phone() { return PHONE; },
    setBudget(n) { st.budget = Math.max(1000, n); st.dirty = true; st.host && st.host.invalidate(); },
    get budget() { return st.budget; },
    /** Pixels one point may cover before a node is refined (default 1.5); small = more points, up to the budget (the GPU test fills the budget with it). */
    setMaxError(px) { st.maxError = Math.max(0.01, Number(px)); st.dirty = true; st.host && st.host.invalidate(); },
    get maxError() { return st.maxError; },
    setCacheMB(mb) { st.cacheMB = mb; evict(); },
    setResidual(grid, tol) { st.resid = grid; st.tol = tol || st.tol; if (st.mode === 'residual') api2.reload(); },
    /** Frame-rate probe for the lab and the browser test: orbit a little every frame for `ms`; frames the view really drew. */
    benchmark(ms = 1500) {
      return new Promise((resolve) => {
        const h = st.host, f0 = h.frames, t0 = performance.now();
        let last = t0, worst = 0;
        const step = () => {
          const now = performance.now();
          worst = Math.max(worst, now - last); last = now;
          h.cam.orbit(2, 0); h.invalidate();
          if (now - t0 < ms) requestAnimationFrame(step);
          else resolve({ frames: h.frames - f0, ms: now - t0, fps: ((h.frames - f0) * 1000) / (now - t0), worstFrameMs: worst });
        };
        requestAnimationFrame(step);
      });
    },
    stats() {
      let drawn = 0, loaded = 0;
      for (const [i, n] of st.nodes) if (st.selSet.has(i)) { drawn += n.n; loaded++; }
      let selPts = 0; if (st.cloud) for (const i of st.sel) selPts += st.cloud.nodePoints(i);
      return { drawn, loaded, selected: st.sel.length, selectedPoints: selPts, budget: st.budget, loading: st.loading.size + st.queue.length, cachedMB: st.cached / 1048576, cachedNodes: st.nodes.size, mode: st.mode, edl: st.edl, atten: st.atten, phone: PHONE };
    },
    /** Local scene → absolute coordinates and back (cloud's file coordinates). */
    toAbs(l) { const o = st.cloud.origin; return [o[0] + (l[0] - st.T[0]) / st.S[0], o[1] + (l[1] - st.T[1]) / st.S[1], o[2] + (l[2] - st.T[2]) / st.S[2]]; },
    toLocal(a) { const o = st.cloud.origin; return [st.S[0] * (a[0] - o[0]) + st.T[0], st.S[1] * (a[1] - o[1]) + st.T[1], st.S[2] * (a[2] - o[2]) + st.T[2]]; },
    /** The point of the horizontal plane z (absolute) under screen pixel (sx, sy) of the 3D canvas → [x, y] absolute, or null. */
    screenToGround(sx, sy, z) {
      const ray = st.host.cam.ray(sx, sy), zl = st.S[2] * (z - st.cloud.origin[2]) + st.T[2];
      if (Math.abs(ray.d[2]) < 1e-9) return null;
      const t = (zl - ray.o[2]) / ray.d[2];
      if (!(t > 0)) return null;
      const a = api2.toAbs([ray.o[0] + ray.d[0] * t, ray.o[1] + ray.d[1] * t, zl]);
      return [a[0], a[1]];
    },
    /** Nearest drawn point to a pixel within `radius` px → [x, y, z] absolute, or null. */
    pickPoint(sx, sy, radius = 10) {
      if (!st.cloud || !st.attached) return null;
      const cam = st.host.cam, vp = cam.viewProj(), [S0, S1, S2] = st.S, [T0, T1, T2] = st.T, w = cam.w, h = cam.h;
      let best = null, bd = radius * radius, bz = Infinity;
      for (const [i, n] of st.nodes) {
        if (!st.selSet.has(i)) continue;
        const p = n.obj.geometry.attributes.position.array;
        for (let k = 0; k < p.length; k += 3) {
          const x = S0 * p[k] + T0, y = S1 * p[k + 1] + T1, z = S2 * p[k + 2] + T2;
          const W = vp[3] * x + vp[7] * y + vp[11] * z + vp[15];
          if (W <= 1e-9) continue;
          const px = ((vp[0] * x + vp[4] * y + vp[8] * z + vp[12]) / W + 1) * w / 2, py = (1 - (vp[1] * x + vp[5] * y + vp[9] * z + vp[13]) / W) * h / 2;
          const d = (px - sx) * (px - sx) + (py - sy) * (py - sy);
          if (d < bd || (d === bd && W < bz)) { bd = d; bz = W; best = [p[k], p[k + 1], p[k + 2]]; }
        }
      }
      const o = st.cloud.origin;
      return best ? [o[0] + best[0], o[1] + best[1], o[2] + best[2]] : null;
    },
    /** Move the camera to look at an absolute point from `dist` away. */
    flyTo(x, y, z, dist = 60) {
      const cam = st.host.cam, t = api2.toLocal([x, y, z]), d = [0.5, -0.7, 0.55], l = Math.hypot(...d);
      cam.target = t; cam.eye = [t[0] + (d[0] / l) * dist, t[1] + (d[1] / l) * dist, t[2] + (d[2] / l) * dist];
      st.host.invalidate();
    },
    canvas() { return st.host && st.host.canvas; },
    dispose() { api2.detach(); },
  };
  return api2;
}
