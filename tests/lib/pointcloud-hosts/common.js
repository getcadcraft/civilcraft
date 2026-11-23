/* SPDX-License-Identifier: Apache-2.0 */
/**
 * common.js — what the BimCraft and CadCraft adapters of the Point clouds add-on share (0.9 PC.11 / PC.12, session `adapters-09`). Canonical in
 * lib/pointcloud-hosts/, copied byte for byte into bimcraft|cadcraft/dev/addons/pointcloud/ by tools/pointcloud-adapters/sync.mjs. DOM-free, no imports.
 *
 *   placement(cloudBounds, hostBox) → { T: [x, y, z], how }   where the cloud sits in the app's Z-up scene (metres): scene = (file point − cloud.origin) + T.
 *       'model'  the cloud's own coordinates overlap the host's box (a registered scan lines up with the design): T = cloud.origin
 *       'centre' else the cloud's middle on the host box's middle (its lowest point on the host's lowest), or on the origin when the host has nothing
 *   wrapPC(PC, host) → PC with inspect() and buildCloud() that also take E57 / PLY / PCD / PTX / XYZ / PTS through the app's own pointcloud.js reader
 *       (read once, thinned to at most NON_LAS_BUDGET points, then tiled by the same engine); LAS and LAZ go to the engine straight.
 *       E57 (0.10): when the host offers `e57()` (the app's e57.js) every point is read page by page and tiled: no thinning, no whole-file buffer.
 */
export const NON_LAS_BUDGET = 3000000;
const UNIT_M = { m: 1, ft: 0.3048, ftUS: 1200 / 3937 };

export function placement(origin, b, hb) {
  const cx = (b.min[0] + b.max[0]) / 2, cy = (b.min[1] + b.max[1]) / 2, ext = Math.max(b.max[0] - b.min[0], b.max[1] - b.min[1], 1);
  if (hb && Number.isFinite(hb.min[0]) && Number.isFinite(hb.max[0])) {
    const hx = (hb.min[0] + hb.max[0]) / 2, hy = (hb.min[1] + hb.max[1]) / 2;
    const near = Math.abs(hx - cx) <= (b.max[0] - b.min[0]) / 2 + (hb.max[0] - hb.min[0]) / 2 + 0.1 * ext && Math.abs(hy - cy) <= (b.max[1] - b.min[1]) / 2 + (hb.max[1] - hb.min[1]) / 2 + 0.1 * ext;
    if (near) return { T: origin.slice(), how: 'model' };
    return { T: [origin[0] - (cx - hx), origin[1] - (cy - hy), origin[2] - (b.min[2] - hb.min[2])], how: 'centre' };
  }
  return { T: [origin[0] - cx, origin[1] - cy, origin[2] - b.min[2]], how: 'centre' };
}

export function wrapPC(PC, host, t = (k) => k) {
  const cache = new WeakMap();
  const isLas = (f) => /\.(las|laz)$/i.test((f && f.name) || '');
  /** 0.10 PERF.25: an E57 is read page by page with every point kept (lib/e57-stream.js), not whole into memory and thinned. null = the app's reader does it. */
  async function readE57Stream(file) {
    if (!/\.e57$/i.test((file && file.name) || '') || typeof host.e57 !== 'function') return null;
    try {
      const [{ e57Source }, E] = await Promise.all([import('./lib/e57-stream.js'), host.e57()]);
      const src = await e57Source(file, { e57Detail: E.e57Detail });
      return { src, kind: 'e57', notes: [t('pcx.e57.full', { n: src.count.toLocaleString('en-US') })] };
    } catch (e) { if (e && (/^e57_/.test(e.code) || e.code === 'empty')) return null; throw e; }
  }
  /**
   * 0.10 SU.1809: what phone scanning apps export as a MESH: OBJ, USDZ (OBJ / PLY / USDA inside) and PLY with faces. The surface is sampled into points
   * (about one per spacing², at most NON_LAS_BUDGET), the up axis and the floor's lean are checked (scan-check.js) and the points turned Z up and level.
   * A point-only PLY, and anything this cannot read, goes to the app's own reader (null).
   */
  async function readMesh(file) {
    const name = (file && file.name) || '';
    if (!/\.(obj|usdz|usdc|glb|ply)$/i.test(name) || file.size > 400 * 1048576) return null;
    const [MS, SC] = await Promise.all([import('./lib/mesh-sample.js'), import('./lib/scan-check.js')]);
    const bytes = new Uint8Array(await file.arrayBuffer()), notes = [];
    let mesh = null;
    if (/\.obj$/i.test(name)) mesh = MS.readObj(new TextDecoder().decode(bytes));
    else if (/\.glb$/i.test(name)) { mesh = MS.readGlb(bytes); for (const n of mesh.notes || []) notes.push(t('pcx.mesh.glb.' + n.replace(/^glb_/, ''), {})); }
    else if (/\.usdc$/i.test(name)) mesh = MS.readUsdc(bytes);
    else if (/\.usdz$/i.test(name)) { const u = MS.readUsdz(bytes); mesh = u.mesh; if (!mesh) throw Object.assign(new Error('usdc'), { code: u.usdc ? 'usdc_unsupported' : 'mesh_no_points' }); for (const n of u.notes || []) if (/^usdc_(skinned|references|timesamples)$/.test(n)) notes.push(t('pcx.mesh.' + n)); }
    else { try { mesh = MS.readPly(bytes); } catch (e) { return null; } if (!mesh.triangles) return null; }
    const spacing = Math.max(0.005, Math.sqrt(Math.max(1e-6, MS.sampleSurface({ vertices: mesh.vertices, colors: null, triangles: mesh.triangles }, { spacing: 1e9, budget: 1 }).area) / NON_LAS_BUDGET));
    const s = MS.sampleSurface(mesh, { spacing: Math.max(0.01, spacing), budget: NON_LAS_BUDGET });
    if (!s.n) throw Object.assign(new Error('empty'), { code: 'mesh_no_points' });
    notes.push(t('pcx.mesh.note', { n: s.n.toLocaleString('en-US'), mm: Math.round(Math.max(0.01, spacing) * 1000) }));
    const free = SC.checkScan({ pos: s.pos, n: s.n });
    const unit = free.notes.find((x) => x.code === 'unit_suggested');
    if (unit) notes.push(t('pcx.mesh.unit', { unit: unit.data.unit }));
    const turn = SC.checkScan({ pos: s.pos, n: s.n, unit: 'm' });   // rotation and level only: the unit stays the person's to say
    let pos = s.pos;
    // the up axis is turned only for the phone and game convention (Y up) with some confidence, or when Z is already up; anything else is a hint
    const sure = turn.up.axis === 'z' || (turn.up.axis === 'y' && turn.up.confidence >= 0.5);
    if (!sure) notes.push(t('pcx.mesh.upunclear', { axis: turn.up.axis.toUpperCase() }));
    if (turn.matrix && sure) { pos = SC.applyMatrix(s.pos, s.n, turn.matrix); notes.push(t('pcx.mesh.up', { axis: turn.up.axis.toUpperCase(), deg: turn.level.tiltDeg.toFixed(1) })); }
    const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < s.n; i++) for (let k = 0; k < 3; k++) { const v = pos[3 * i + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; }
    const src = { name, count: s.n, rgb: !!s.rgb, intensity: false, min: mn, max: mx, points: () => (function* () { for (let i = 0; i < s.n; i++) yield { x: pos[3 * i], y: pos[3 * i + 1], z: pos[3 * i + 2], cls: 0, rgb: s.rgb ? [s.rgb[3 * i], s.rgb[3 * i + 1], s.rgb[3 * i + 2]] : null }; })() };
    return { src, kind: /\.ply$/i.test(name) ? 'ply' : /\.obj$/i.test(name) ? 'obj' : /\.glb$/i.test(name) ? 'glb' : /\.usdc$/i.test(name) ? 'usdc' : 'usdz', notes };
  }
  async function read(file) {
    if (cache.has(file)) return cache.get(file);
    const st = (await readE57Stream(file)) || (await readMesh(file));
    if (st) { cache.set(file, st); return st; }
    const R = await host.readers();
    const info = await R.readCloudInfo(file);
    const c = await R.loadCloud(file, info, { budget: NON_LAS_BUDGET });
    const kx = UNIT_M[c.unit || 'm'] || 1, kz = UNIT_M[c.zUnit || c.unit || 'm'] || 1, o = c.origin, n = c.n;
    const notes = [...(c.notes || [])];
    if (c.read > n) notes.push(t('pcx.thinned', { read: c.read.toLocaleString('en-US'), kept: n.toLocaleString('en-US') }));
    const src = {
      name: file.name, count: n, rgb: !!c.rgb, intensity: !!c.inten,
      min: [c.min[0] * kx, c.min[1] * kx, c.min[2] * kz], max: [c.max[0] * kx, c.max[1] * kx, c.max[2] * kz],
      points: () => (function* () {
        for (let i = 0; i < n; i++) {
          yield { x: (c.pos[3 * i] + o[0]) * kx, y: (c.pos[3 * i + 1] + o[1]) * kx, z: (c.pos[3 * i + 2] + o[2]) * kz, cls: c.cls ? c.cls[i] : 0,
            rgb: c.rgb ? [c.rgb[3 * i], c.rgb[3 * i + 1], c.rgb[3 * i + 2]] : null, inten: c.inten ? c.inten[i] : 0 };
        }
      })(),
    };
    const out = { src, kind: info.kind, notes };
    cache.set(file, out);
    return out;
  }
  return {
    ...PC,
    async inspect(f) {
      if (isLas(f)) return PC.inspect(f);
      const r = await read(f), info = await PC.inspect(r.src);
      return { ...info, kind: r.kind || 'points', version: '', format: '–', notes: r.notes.map(String) };
    },
    async buildCloud(f, store, o) { return PC.buildCloud(isLas(f) ? f : (await read(f)).src, store, o); },
  };
}
