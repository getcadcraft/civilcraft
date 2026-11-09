/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-slice.js — triangles to the layer pictures a resin printer shows (roadmap RSN.1 slicer, RSN.5 supports). Our own, Apache-2.0, clean room: the cuts
 * and the outline work are manifold-3d's (already vendored, Apache-2.0); the rest is written here from the published methods. No DOM.
 *
 *   sliceResin(MF, tris, job, { plateSolid, onProgress, signal, yieldEvery }) → Promise<{ ok, sliced, stats, warnings, islands, error? }>
 *     tris: mm, the plate as the bed has it (x, y from the screen's corner, z up); job: anything — cleanResin() holds every number in range
 *     plateSolid: ps-slice.js's plateSolid(MF, tris), handed in so this library stands alone and the Library's overlapping pieces are repaired the same way
 *     sliced: { w, h, layerHeight, count, layer(i), mm: [x, y], zLift } (rs-rle.js); layer 0 is the first layer on the plate (a raft, when supports are on)
 *     warnings: [{ kind, … }]  floating, sheets, skipped, islands, overhangs, nodrain
 *     islands: [{ layer, z, x, y, area }]   a piece with nothing under it (mm, part height z); with supports on they are supported, else only reported
 *   hollow: each layer keeps a skin `wall` thick; floors and roofs are as thick (a window of the layers above and below, sampled every ~0.3 mm), the
 *     cavity is open to the outside through a vent hole at every cavity top (and a drain hole at every bottom when the part is lifted on supports).
 *   supports: the part is lifted `lift` mm on a raft; the first layer and every unsupported area (growth over `overhang` degrees from vertical, and islands)
 *     is sampled on a grid, each point gets a pillar down to the raft or to the part below, with a fine tip and a wider shaft. Not tested on any printer.
 */
import { cleanResin, DENSITIES } from './rs-profiles.js';
import { rasterize } from './rs-raster.js';
import { encodeLayer, decodeLayer } from './rs-rle.js';

const RAFT_MM = 0.8, TIP_MM = 0.8, FOOT_MM = 0.6;

const inside = (polys, x, y) => {
  let c = false;
  for (const r of polys) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i], b = r[j];
    if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
  }
  return c;
};
const edgeDist = (polys, x, y) => {
  let best = Infinity;
  for (const r of polys) for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const a = r[i], b = r[j], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy;
    const t = L ? Math.min(1, Math.max(0, ((x - a[0]) * dx + (y - a[1]) * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(x - (a[0] + t * dx), y - (a[1] + t * dy)));
  }
  return best;
};
const boxOf = (polys) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const r of polys) for (const p of r) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
  return { x0, y0, x1, y1 };
};
/** Some point inside the outlines (any one: the middle of the box first, then a grid over it); null when none is found. Cheaper than interiorPoint, which looks for the best one. */
function anyInside(polys) {
  const b = boxOf(polys), at = (u, v) => [b.x0 + u * (b.x1 - b.x0), b.y0 + v * (b.y1 - b.y0)];
  let q = at(0.5, 0.5);
  if (inside(polys, q[0], q[1])) return q;
  for (const n of [4, 8, 16]) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { q = at((i + 0.5) / n, (j + 0.5) / n); if (inside(polys, q[0], q[1])) return q; }
  return interiorPoint(polys);
}
/** A point well inside the outlines (the one furthest from every edge among a grid of candidates), away from `avoid` by `gap`; null when none. */
function interiorPoint(polys, avoid = [], gap = 0) {
  const b = boxOf(polys), cand = [];
  const N = 14;
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) cand.push([b.x0 + (i + 0.5) / N * (b.x1 - b.x0), b.y0 + (j + 0.5) / N * (b.y1 - b.y0)]);
  cand.push([(b.x0 + b.x1) / 2, (b.y0 + b.y1) / 2]);
  let best = null, bestD = 0;
  for (const [x, y] of cand) {
    if (!inside(polys, x, y) || avoid.some((a) => Math.hypot(a[0] - x, a[1] - y) < gap)) continue;
    const d = edgeDist(polys, x, y);
    if (d > bestD) { bestD = d; best = [x, y]; }
  }
  return best;
}
/** A regular polygon, counter-clockwise like the outlines manifold gives, so a pillar on a part adds and never cuts. */
const disc = (x, y, r, n = 20) => Array.from({ length: n }, (_, i) => [x + r * Math.cos(i * 2 * Math.PI / n), y + r * Math.sin(i * 2 * Math.PI / n)]);

export async function sliceResin(MF, tris, jobIn, { plateSolid, onProgress = null, signal = null, yieldEvery = 4 } = {}) {
  const job = cleanResin(jobIn), P = job.printerSpec, lh = job.layerHeight;
  const warnings = [];
  const fail = (error, extra = {}) => ({ ok: false, error, sliced: null, stats: null, warnings, islands: [], ...extra });
  if (!tris.length) return fail('empty');
  if (typeof plateSolid !== 'function') return fail('failed');

  // ---- orient: a tilt about the X axis through the middle of the box, then down on the plate
  let pts = tris;
  if (job.tilt) {
    let y0 = Infinity, y1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const t of tris) for (const p of t) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); z0 = Math.min(z0, p[2]); z1 = Math.max(z1, p[2]); }
    const cy = (y0 + y1) / 2, cz = (z0 + z1) / 2, c = Math.cos(job.tilt * Math.PI / 180), s = Math.sin(job.tilt * Math.PI / 180);
    pts = tris.map((t) => t.map((p) => [p[0], cy + (p[1] - cy) * c - (p[2] - cz) * s, cz + (p[1] - cy) * s + (p[2] - cz) * c]));
  }
  let zMin = Infinity;
  for (const t of pts) for (const p of t) zMin = Math.min(zMin, p[2]);
  const flat = zMin === 0 ? pts : pts.map((t) => t.map((p) => [p[0], p[1], p[2] - zMin]));
  if (!job.tilt && Math.abs(zMin) > 0.01) warnings.push({ kind: 'floating', mm: zMin });
  const { solid, used, skipped, thickened } = plateSolid(MF, flat);
  if (thickened) warnings.push({ kind: 'sheets', n: thickened });
  if (skipped.length) {
    const lost = skipped.reduce((a, x) => a + x.triangles, 0);
    warnings.push({ kind: 'skipped', n: skipped.length, of: skipped.length + used, share: Math.max(1, Math.round(lost / tris.length * 100)) });
  }
  if (!solid) return fail('open');
  const bb = solid.boundingBox();
  const size = [bb.max[0] - bb.min[0], bb.max[1] - bb.min[1], bb.max[2] - bb.min[2]];
  const liftMm = job.supports ? job.lift : 0;
  if (bb.min[0] < -1e-6 || bb.min[1] < -1e-6 || bb.max[0] > P.mm[0] + 1e-6 || bb.max[1] > P.mm[1] + 1e-6 || bb.max[2] + liftMm > P.mm[2]) { solid.delete?.(); return fail('bed', { size }); }

  const CS = MF.CrossSection, free = new Set();
  const keep = (c) => { free.add(c); return c; };
  const drop = (c) => { if (c && free.delete(c)) c.delete?.(); };   // a shape nothing will read again is given back at once: a dense mesh would otherwise hold every layer's pieces to the end
  const tmp = [];
  const t = (c) => { tmp.push(keep(c)); return c; };   // a shape for this layer only
  const sweep = () => { for (const c of tmp.splice(0)) drop(c); };
  const L0 = Math.round(liftMm / lh), count = Math.max(1, Math.ceil((bb.max[2] + liftMm) / lh - 1e-6));
  const raftLayers = job.supports ? Math.max(2, Math.round(RAFT_MM / lh)) : 0;
  const pause = async (l, stage) => {
    if (signal?.aborted) throw new DOMException('aborted', 'AbortError');
    if (l % yieldEvery === 0) { onProgress?.({ stage, layer: l, layers: count }); await new Promise((r) => setTimeout(r, 0)); }
  };
  const D = DENSITIES[job.density];
  try {
    // ---- pass 1: cut every layer of the part; find islands and the areas that need holding up
    const cuts = new Array(count).fill(null), polyCache = new Map();
    const polysOf = (l) => { if (!polyCache.has(l)) polyCache.set(l, cuts[l] ? cuts[l].toPolygons() : []); return polyCache.get(l); };
    const islands = [], points = [];
    const grow = lh * Math.tan(job.overhang * Math.PI / 180);
    let hangLayers = 0;
    for (let l = L0; l < count; l++) {
      await pause(l, 'cut'); sweep();
      const cut = keep(solid.slice((l + 0.5) * lh - liftMm));
      cuts[l] = cut;
      if (cut.isEmpty()) continue;
      const prev = l > L0 && cuts[l - 1] && !cuts[l - 1].isEmpty() ? cuts[l - 1] : null;
      let fresh = cut;
      if (prev) {
        fresh = t(cut.subtract(t(prev.offset(grow, 'Miter'))));
        // a miniature's cut is dozens of small pieces: instead of working out each piece's overlap with the layer below, the overlap of the whole layers is found once and cut into
        // its own pieces; a piece of the cut holding the middle of one of them (of 0.0001 mm2 or more) is held up, and only the others are worked out one by one
        const seeds = [];
        for (const piece of t(cut.intersect(prev)).decompose()) {
          t(piece);
          if (piece.area() < 1e-4) continue;
          const ip = anyInside(piece.toPolygons());
          if (ip) seeds.push(ip);
        }
        if (l > L0) for (const comp of cut.decompose()) {
          t(comp);
          const cp = comp.toPolygons();
          if (cp.length) {
            const bx = boxOf(cp);
            if (seeds.some((q) => q[0] >= bx.x0 && q[0] <= bx.x1 && q[1] >= bx.y0 && q[1] <= bx.y1 && inside(cp, q[0], q[1]))) continue;
          }
          const ov = t(comp.intersect(prev));
          if (ov.area() < 1e-4) { const pl = comp.toPolygons(), b = boxOf(pl); islands.push({ layer: l, z: Math.round((l * lh - liftMm) * 1000) / 1000, x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, area: comp.area() }); }
        }
      } else if (l > L0) {   // the layer under it is empty: all of it is an island
        for (const comp of cut.decompose()) { t(comp); const b = boxOf(comp.toPolygons()); islands.push({ layer: l, z: Math.round((l * lh - liftMm) * 1000) / 1000, x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, area: comp.area() }); }
      }
      if (prev && fresh.area() > 2) hangLayers++;
      if (!job.supports || fresh.isEmpty() || fresh.area() < 0.02) continue;
      for (const comp of fresh.decompose()) {
        t(comp);
        const polys = comp.toPolygons(), b = boxOf(polys);
        const here = [];
        for (let x = b.x0 + D.spacing / 2 * Math.min(1, (b.x1 - b.x0) / D.spacing + 0.01); x <= b.x1; x += D.spacing) for (let y = b.y0 + D.spacing / 2 * Math.min(1, (b.y1 - b.y0) / D.spacing + 0.01); y <= b.y1; y += D.spacing) if (inside(polys, x, y)) here.push([x, y]);
        if (!here.length) { const ip = interiorPoint(polys); if (ip) here.push(ip); }
        for (const [x, y] of here) if (!points.some((p) => Math.hypot(p.x - x, p.y - y) < D.spacing * 0.8 && Math.abs(p.l - l) * lh < 1.5)) points.push({ x, y, l });
      }
    }
    sweep();
    if (!cuts.some((c) => c && !c.isEmpty())) return fail('empty', { size });
    if (islands.length && !job.supports) warnings.push({ kind: 'islands', n: islands.length });
    if (hangLayers && !job.supports) warnings.push({ kind: 'overhangs', n: hangLayers });

    // ---- supports: a pillar for every point, down to the raft or to the part below it
    const discs = Array.from({ length: count }, () => []);
    let onModel = 0, onRaft = 0;
    const rafts = [];
    if (job.supports) {
      const tipN = Math.max(1, Math.round(TIP_MM / lh)), footN = Math.max(1, Math.round(FOOT_MM / lh));
      for (const p of points) {
        let stop = -1;
        for (let j = p.l - 1; j >= L0; j--) { if (cuts[j] && !cuts[j].isEmpty() && inside(polysOf(j), p.x, p.y)) { stop = j; break; } }
        const base = stop >= 0 ? stop + 1 : raftLayers;
        if (base >= p.l) continue;
        if (stop >= 0) onModel++; else { onRaft++; rafts.push(p); }
        for (let l = base; l <= p.l; l++) {
          let r = D.shaft;
          const fromTop = p.l - l, fromBase = l - base;
          if (fromTop < tipN) r = D.tip + (D.shaft - D.tip) * fromTop / tipN;
          if (stop >= 0 && fromBase < tipN) r = Math.min(r, D.tip + (D.shaft - D.tip) * fromBase / tipN);
          if (stop < 0 && fromBase < footN) r = D.base;
          discs[l].push([p.x, p.y, r]);
        }
      }
    }
    polyCache.clear();
    const raftRegion = job.supports && rafts.length ? keep(CS.union([...rafts.map((p) => keep(CS.circle(D.base + 0.8, 24).translate([p.x, p.y]))), keep(cuts[L0].offset(1.2, 'Round'))])) : null;

    // ---- hollow: the skin, and the holes into the cavity
    const cores = new Array(count).fill(null), holes = Array.from({ length: count }, () => []);
    if (job.hollow) {
      const halfPx = Math.min(P.mm[0] / P.px[0], P.mm[1] / P.px[1]) / 2;
      const n = Math.max(1, Math.round(job.wall / lh)), step = Math.max(1, Math.round(0.3 / lh)), inner = new Map();
      const innerOf = (l) => {
        if (l < L0 || l >= count || !cuts[l] || cuts[l].isEmpty()) return null;
        if (!inner.has(l)) { const sm = cuts[l].simplify(halfPx); inner.set(l, keep(sm.offset(-job.wall, 'Miter'))); sm.delete(); }   // the cavity's wall need not follow detail finer than half a pixel: far fewer points to offset on a dense mesh
        return inner.get(l);
      };
      const coreOf = (l) => {
        const js = new Set([l, l - n, l + n]);
        for (let j = l - n + step; j < l + n; j += step) js.add(j);
        let core = null, own = false;   // own: `core` is a shape made here, not one of the cached insets, so it is given back when the next one replaces it
        for (const j of js) {
          const c = innerOf(j);
          if (!c || c.isEmpty()) { if (own) core.delete(); return null; }
          if (!core) core = c;
          else { const m = core.intersect(c); if (own) core.delete(); core = m; own = true; if (core.isEmpty()) { core.delete(); return null; } }
        }
        return own ? keep(core) : core;
      };
      for (let l = L0; l < count; l++) { await pause(l, 'hollow'); cores[l] = coreOf(l); const old = inner.get(l - n); if (old) { drop(old); inner.delete(l - n); } }   // the inset of layer l - n is read by no later core
      const holeR = job.drain / 2, placed = [];
      let cavities = 0, unvented = 0;
      for (let l = L0; l < count; l++) {
        sweep();
        const core = cores[l];
        if (!core) continue;
        const up = l + 1 < count ? cores[l + 1] : null, down = l > L0 ? cores[l - 1] : null;
        for (const comp of core.decompose()) {
          t(comp);
          if (comp.area() < Math.PI * holeR * holeR * 1.5) continue;
          const ovUp = up ? t(comp.intersect(up)).area() : 0, ovDown = down ? t(comp.intersect(down)).area() : 0;
          const polys = comp.toPolygons();
          if (ovUp < 1e-3) {   // the top of a cavity: a vent through the roof, and a second hole beside it when nothing drains from the bottom
            cavities++;
            const ip = interiorPoint(polys, placed, job.drain * 3);
            if (!ip) { unvented++; continue; }
            placed.push(ip);
            for (let k = l; k < count; k++) holes[k].push([ip[0], ip[1], holeR]);
            if (!job.supports) { const ip2 = interiorPoint(polys, placed, job.drain * 3); if (ip2) { placed.push(ip2); for (let k = l; k < count; k++) holes[k].push([ip2[0], ip2[1], holeR]); } }
          }
          if (ovDown < 1e-3 && job.supports) {   // the bottom of a cavity, on supports: a drain through the floor
            const ip = interiorPoint(polys, placed, job.drain * 3);
            if (ip) { placed.push(ip); for (let k = L0; k <= l; k++) holes[k].push([ip[0], ip[1], holeR]); }
          }
        }
      }
      if (unvented) warnings.push({ kind: 'nodrain', n: unvented });
      sweep();
      void cavities;
    }

    // ---- pass 2: the pictures
    const [w, h] = P.px, sx = w / P.mm[0], sy = h / P.mm[1];
    const px = (x, y) => [P.flip.x ? (P.mm[0] - x) * sx : x * sx, P.flip.y ? y * sy : (P.mm[1] - y) * sy];
    const layers = [];
    let canvas = null;
    let areaSum = 0, supportMm3 = 0;
    for (let l = 0; l < count; l++) {
      await pause(l, 'draw'); sweep();
      const rings = [];
      let base = l >= L0 ? cuts[l] : null;
      if (base && !base.isEmpty() && cores[l]) base = t(base.subtract(cores[l]));   // the skin: the part less its cavity
      if (base && holes[l].length) base = t(base.subtract(t(CS.union(holes[l].map(([x, y, r]) => t(CS.circle(r, 24).translate([x, y])))))));
      if (base && !base.isEmpty()) { areaSum += base.area() * lh; for (const r of base.toPolygons()) rings.push(r.map((p) => px(p[0], p[1]))); }
      if (l < raftLayers && raftRegion) { supportMm3 += raftRegion.area() * lh; for (const r of raftRegion.toPolygons()) rings.push(r.map((p) => px(p[0], p[1]))); }
      for (const [x, y, r] of discs[l]) { supportMm3 += Math.PI * r * r * lh; rings.push(disc(x, y, r).map((p) => px(p[0], p[1]))); }
      canvas = rasterize(rings, w, h, { into: canvas });
      layers.push(encodeLayer(canvas, w, h));
      sweep(); drop(cuts[l]); drop(cores[l]); cuts[l] = null;   // nothing reads this layer again
    }
    const sliced = { w, h, layerHeight: lh, count, mm: [P.mm[0], P.mm[1]], zLift: liftMm, rle: layers, layer: (i) => decodeLayer(layers[i], w, h) };
    const volumeMl = Math.round((areaSum + supportMm3) / 1000 * 100) / 100;
    const motion = 2 * job.liftHeight / (job.liftSpeed / 60) + job.lightOff;   // the plate up and back, per layer (a rough share: the real move depends on the firmware)
    const seconds = Math.round(Math.min(job.bottomLayers, count) * (job.bottomExposure + motion) + Math.max(0, count - job.bottomLayers) * (job.exposure + motion));
    const stats = { layers: count, seconds, volumeMl, grams: Math.round(volumeMl * job.density_g * 10) / 10, cost: Math.round(volumeMl * job.density_g * job.price / 1000 * 100) / 100, size, supports: points.length, onRaft, onModel, islands: islands.length, lift: liftMm, hollow: job.hollow };
    return { ok: true, sliced, stats, warnings, islands };
  } finally {
    for (const c of free) c.delete?.();
    free.clear();
    solid.delete?.();
  }
}
