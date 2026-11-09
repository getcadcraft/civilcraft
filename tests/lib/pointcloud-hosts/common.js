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
  async function read(file) {
    if (cache.has(file)) return cache.get(file);
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
