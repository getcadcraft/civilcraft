/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/bim.js — the BimCraft adapter of the Scan to BIM add-on (0.9 SU.1132; copied to bimcraft/dev/addons/scanbim/host.js by tools/scanbim/sync.mjs).
 * The cloud is the Point clouds add-on's (window.ccPointCloud: .cloud the engine cloud, .placement() = { T, how }, see lib/pointcloud-hosts/NOTES.md), read only.
 * Plan millimetres = (file metre + T - cloud.origin) * 1000 in x, y and z: the scene BimCraft's viewer shows, which for a cloud that overlaps the model ('model') is the file's own coordinates.
 *
 *   detect(api, { t }) → host | null
 *   host.cloudInfo() → { name, count, how, off: [x, y, z] metres } | null          the open cloud, or null (Point clouds off or no cloud built)
 *   host.histogram(onProgress) → ZHistogram data { bin, entries }                  every point's height in mm, thinned to at most MAX_HIST points
 *   host.points(floor, ceiling) → { n, x, y, z (Float64Array mm) }                  the points between this floor and its ceiling, thinned to at most MAX_POINTS
 *   host.levels() → [{ guid, name, elevation, height }]                             the model's levels
 *   host.preview(level guid, proposals) / host.clearPreview()                       the proposals as dashed-free drafting lines in that level's plan view (tag 'scanbim')
 *   host.accept(spec) → { walls, openings, floors, level }                          ONE undo step: the level (if new), walls, doors/windows, floors
 */
import { addWall, readWalls, regenWalls } from '../../model-walls.js';
import { addOpening } from '../../model-openings.js';
import { addLevel } from '../../model-levels.js';
import { writeDrawnFloor } from '../../model-floors.js';
import { settleFor } from '../../model-ops.js';
import { syncResidential } from '../../res-follow.js';

const TAG = 'scanbim';
export const MAX_HIST = 20_000_000, MAX_POINTS = 1_500_000;

export function detect(api, { t }) {
  if (!api || !api.model || typeof api.model.write !== 'function' || typeof api.model.levels !== 'function') return null;
  const pc = () => (typeof window !== 'undefined' ? window.ccPointCloud : null);
  const offset = (x) => { const p = x.placement(), o = x.cloud.origin; return [p.T[0] - o[0], p.T[1] - o[1], p.T[2] - o[2]]; };
  const host = {
    id: 'bim',
    cloudInfo() {
      const x = pc();
      if (!x || !x.cloud) return null;
      const c = x.cloud, p = x.placement();
      return { name: c.name || c.id || '', count: c.count || 0, how: p.how, off: offset(x) };
    },
    async histogram(onProgress) {
      const x = pc();
      if (!x || !x.cloud) throw Object.assign(new Error('err.nocloud'), { key: 'err.nocloud' });
      const c = x.cloud, off = offset(x), oz = c.origin[2], sz = c.scale[2], stride = Math.max(1, Math.ceil((c.count || 1) / MAX_HIST));
      const bin = 20, counts = new Map(), sums = new Map();
      let seen = 0;
      await c.forEachNode(async (i, r) => {
        for (let k = 0; k < r.n; k += stride) {
          if (r.del && r.del[k]) continue;
          const z = (oz + r.z[k] * sz + off[2]) * 1000, key = Math.floor(z / bin);
          counts.set(key, (counts.get(key) || 0) + 1); sums.set(key, (sums.get(key) || 0) + z); seen++;
        }
      }, { applyEdits: true, progress: onProgress ? (f) => onProgress(f) : undefined });
      return { bin, counts: [...counts], sums: [...sums], seen, stride };
    },
    async points(floor, ceiling) {
      const x = pc();
      if (!x || !x.cloud) throw Object.assign(new Error('err.nocloud'), { key: 'err.nocloud' });
      const c = x.cloud, off = offset(x), b = c.bounds;
      const top = ceiling != null ? ceiling + 60 : floor + 4500;
      const r = await c.readRegion([b.min[0], b.min[1], b.max[0] + 1e-6, b.max[1] + 1e-6], { zmin: (floor - 60) / 1000 - off[2], zmax: top / 1000 - off[2] });
      const step = r.n > MAX_POINTS ? r.n / MAX_POINTS : 1, n = Math.min(r.n, MAX_POINTS), X = new Float64Array(n), Y = new Float64Array(n), Z = new Float64Array(n);
      for (let k = 0; k < n; k++) { const i = Math.floor(k * step); X[k] = (r.x[i] + off[0]) * 1000; Y[k] = (r.y[i] + off[1]) * 1000; Z[k] = (r.z[i] + off[2]) * 1000; }
      return { n, x: X, y: Y, z: Z, total: r.n };
    },
    async levels() { return api.model.levels(); },
    async preview(level, S) {
      if (typeof api.drafting?.put !== 'function') return 0;
      const items = [];
      const quad = (a, b, w, from = 0, to = null) => {
        const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, ex = (b[0] - a[0]) / L, ey = (b[1] - a[1]) / L, nx = -ey * w / 2, ny = ex * w / 2, s = from, e = to == null ? L : to;
        const p = (d, side) => [Math.round(a[0] + ex * d + (side ? nx : -nx)), Math.round(a[1] + ey * d + (side ? ny : -ny))];
        return [p(s, 0), p(e, 0), p(e, 1), p(s, 1)];
      };
      for (const w of S.walls) if (w.on !== false) items.push({ level, kind: 'lines', pts: quad(w.a, w.b, w.thickness), closed: true });
      for (const o of S.openings) {
        const w = S.walls.find((q) => q.id === o.wall);
        if (o.on === false || !w || w.on === false) continue;
        items.push({ level, kind: 'lines', pts: quad(w.a, w.b, w.thickness + 120, o.offset, o.offset + o.width), closed: true });
      }
      const put = await api.drafting.put(TAG, items, { label: t('preview.label') });
      return put.n;
    },
    async clearPreview() { try { if (typeof api.drafting?.put === 'function') await api.drafting.put(TAG, [], { label: t('preview.clear') }); } catch { /* none to clear */ } },
    async accept(spec) {
      const out = { walls: 0, openings: 0, floors: 0, level: spec.level.guid || null };
      await api.model.write(t('accept.label'), (w) => {
        let guid = spec.level.guid;
        if (!guid) { const r = addLevel(w, { name: spec.level.name, elevation: Math.round(spec.level.elevation), height: Math.round(spec.level.height || 2700) }); guid = r.guid; out.level = guid; }
        const sid = w.byGuid(guid);
        if (!sid) throw Object.assign(new Error('model.err.nolevel'), { key: 'model.err.nolevel' });
        const made = new Map();
        for (const p of spec.walls) {
          const r = addWall(w, { storey: sid, a: p.a.map(Math.round), b: p.b.map(Math.round), typeKey: 'int-2x4@' + Math.max(50, Math.round(p.thickness)), height: Math.round(p.height), extSide: 'right' });
          made.set(p.id, r.guid); out.walls++;
        }
        settleFor(w, [sid]);
        const used = new Set();
        for (const o of spec.openings) {
          const host = made.get(o.wall);
          if (!host) continue;
          addOpening(w, { wall: host, typeKey: o.kind === 'door' ? 'door-single' : 'win-fixed', offset: Math.round(o.offset), width: Math.round(o.width), height: Math.round(o.height), sill: o.kind === 'door' ? undefined : Math.round(o.sill) });
          used.add(host); out.openings++;
        }
        if (used.size) {
          const all = readWalls(w), sts = new Set();
          for (const g of used) { const x = all.find((y) => y.guid === g); if (x) { regenWalls(w, x.storey, [g]); sts.add(x.storey); } }
          for (const st of sts) syncResidential(w, st);
        }
        for (const f of spec.floors) { writeDrawnFloor(w, { storey: guid, points: f.poly.map((q) => [Math.round(q[0]), Math.round(q[1])]), kind: 'concrete', use: 'floor', offset: 0 }); out.floors++; }
      });
      return out;
    },
  };
  return host;
}
