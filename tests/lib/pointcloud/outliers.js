/* SPDX-License-Identifier: Apache-2.0 */
/**
 * outliers.js — noise filters (spec § 7, PC.4). Tile-wise (a tile and a halo of `radius` around it), so memory is a tile.
 *
 *   await runOutliers(cloud, params, { progress, signal }) → { id, marked, low, high, tiles, ms }
 *     params:
 *       mode          'isolated' (default) | 'statistical' | 'both'
 *       radius        search radius in file units (default 2)
 *       minNeighbours isolated: fewer than this many other points within radius ⇒ noise (default 6)
 *       k, stdMul     statistical: mean distance to the k nearest (missing ones count as radius); more than mean + stdMul·σ of
 *                     the tile ⇒ noise (defaults 8 and 3)
 *       region        only points inside it are judged (default: everything)
 *       markLow/High  classes written (7 low point, 18 high noise), by comparing z with the median of the surrounding 10·radius
 *       remove        also delete them (default false)
 *       tile          tile size (default 256)
 *   Points already class 7 or 18 are neither judged nor counted as neighbours. The result is one materialised edit (one undo step).
 */
import { fail, throwIfAborted, reporter } from './util.js';
import { tileList, Hash3, compileRegion, regionNeedsGround } from './select.js';
import { PatchSet } from './edits.js';

export async function runOutliers(cloud, params = {}, { progress = null, signal = null } = {}) {
  const t0 = Date.now(), rep = reporter(progress);
  const mode = params.mode || 'isolated', radius = params.radius ?? 2, minN = params.minNeighbours ?? 6, K = params.k ?? 8, stdMul = params.stdMul ?? 3;
  const lowC = params.markLow ?? 7, highC = params.markHigh ?? 18, tileSize = params.tile ?? 256;
  if (!['isolated', 'statistical', 'both'].includes(mode) || !(radius > 0)) fail('bad_params', { mode, radius });
  const ground = regionNeedsGround(params.region) ? await cloud.ground() : null;
  const region = params.region ? compileRegion(params.region, { ground }) : null;
  const id = cloud.edits.allocId(), ps = new PatchSet(cloud, id);
  const tiles = tileList(cloud, tileSize, region && region.bbox);
  let marked = 0, low = 0, high = 0, nt = 0;
  try {
    for (let ti = 0; ti < tiles.length; ti++) {
      throwIfAborted(signal);
      const T = tiles[ti];
      const D = await cloud.readRegion([T.x0 - radius, T.y0 - radius, T.x1 + radius, T.y1 + radius]);
      const ids = [];
      for (let i = 0; i < D.n; i++) if (D.cls[i] !== 7 && D.cls[i] !== 18) ids.push(i);
      if (ids.length < 2) continue;
      nt++;
      const H = new Hash3(D.x, D.y, D.z, ids, radius);
      const core = [], meanD = [];
      for (const i of ids) {
        if (D.x[i] < T.x0 || D.x[i] >= T.x1 || D.y[i] < T.y0 || D.y[i] >= T.y1) continue;
        if (region && !region.test(D.x[i], D.y[i], D.z[i], D.cls[i])) continue;
        core.push(i);
      }
      const flagged = new Uint8Array(core.length);
      let mu = 0, sd = 0;
      if (mode !== 'isolated') {
        const md = new Float64Array(core.length), ds = [];
        for (let q = 0; q < core.length; q++) {
          const i = core[q]; ds.length = 0;
          H.near(D.x[i], D.y[i], D.z[i], radius, (j, d2) => { if (j !== i) ds.push(d2); });
          ds.sort((a, b) => a - b);
          let s = 0; for (let m = 0; m < K; m++) s += m < ds.length ? Math.sqrt(ds[m]) : radius;
          md[q] = s / K; mu += md[q];
        }
        mu /= core.length || 1;
        for (let q = 0; q < core.length; q++) sd += (md[q] - mu) ** 2;
        sd = Math.sqrt(sd / (core.length || 1));
        for (let q = 0; q < core.length; q++) if (md[q] > mu + stdMul * sd) flagged[q] = 1;
      }
      if (mode !== 'statistical') {
        for (let q = 0; q < core.length; q++) {
          const i = core[q]; let c = 0;
          H.near(D.x[i], D.y[i], D.z[i], radius, (j) => { if (j !== i) c++; });
          if (c < minN) flagged[q] = 1;
        }
      }
      const any = flagged.some((v) => v);
      if (!any) continue;
      // low or high: z against the median of the neighbourhood (10 radii), from the points that are not flagged
      const big = radius * 10, col = new Map();
      const ckey = (x, y) => Math.floor(x / big) * 1048576 + Math.floor(y / big);
      const isFlag = new Set(); core.forEach((i, q) => { if (flagged[q]) isFlag.add(i); });
      for (const i of ids) { if (isFlag.has(i)) continue; const k = ckey(D.x[i], D.y[i]); let a = col.get(k); if (!a) col.set(k, a = []); a.push(D.z[i]); }
      const med = new Map();
      const medOf = (cx, cy) => {
        const k = cx * 1048576 + cy; if (med.has(k)) return med.get(k);
        const z = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { const v = col.get((cx + a) * 1048576 + cy + b); if (v) for (const e of v) z.push(e); }
        z.sort((p, q) => p - q); const m = z.length ? z[z.length >> 1] : NaN; med.set(k, m); return m;
      };
      core.forEach((i, q) => {
        if (!flagged[q]) return;
        const m = medOf(Math.floor(D.x[i] / big), Math.floor(D.y[i] / big));
        const c = m === m && D.z[i] > m ? highC : lowC;
        ps.setClass(D.node[i], D.idx[i], c); if (params.remove) ps.setDel(D.node[i], D.idx[i], 1);
        marked++; if (c === highC) high++; else low++;
      });
      rep((ti + 1) / tiles.length * 0.95, 'outliers');
    }
    await ps.flush();
  } catch (e) { cloud.edits.discard(id); throw e; }
  cloud.edits.addMaterialised({ id, op: 'outliers', region: params.region || null, params, label: params.label || 'outliers', summary: { marked, low, high } });
  await cloud.edits.saved();
  rep(1, 'outliers');
  return { id, marked, low, high, tiles: nt, ms: Date.now() - t0 };
}
