/* SPDX-License-Identifier: Apache-2.0 */
/**
 * surface.js — ground surface, residuals and volumes (spec § 10, PC.7 / PC.8). The TIN comes from the injected buildGround
 * (ground-surface.js → tin.js); no second TIN code path.
 *
 *   await groundSurface(cloud, { spacing 1, mode 'nearest', breaklines, boundary, maxEdge, region, base, classes [2], signal, progress })
 *       → { surface, report }      class-2 points (after the edit log) thinned to `spacing`, then buildGround.
 *       region + base (a surface built before): only the area inside `region` is re-read from the cloud; outside it the vertices
 *       of `base` are kept (the fix-the-ground patch rebuild).  report = buildGround's report + { seen, kept, capped }.
 *   await residuals(cloud, surface, { cell 1, tolerance 0.15, classes [2], signal, progress })
 *       → { grid:{ x0, y0, cell, nx, ny, mean (Float32, NaN = no points), count (Uint32) },
 *           stats:{ n, outside, mean, rms, p95, within, worst:[{x, y, res, n}] } }
 *       residual = point z − surface z at the point; stats are over points (p95 of |res| to 1 mm), `worst` = ten cells with the
 *       largest |mean residual| (cell centres). `within` = share of points with |res| ≤ tolerance.
 *   await volumeBetween(surfaceA, surfaceB, { boundary, cell 1, signal }) → { cut, fill, net, area, outsideArea, cell }
 *       A → B: fill = where B is above A, cut = where A is above B, net = fill − cut (material gained). Cell centres inside the
 *       boundary (default: both surfaces' common bounds); `outsideArea` = boundary cells where a surface has no data.
 *   await nearestPoint(cloud, x, y, radius, { prefer 2 }) → [x, y, z] | null     the cloud point nearest to (x, y) in plan within `radius` (breaklines picked
 *       in the plan view). Noise classes (7, 18) never; a point of class `prefer` within the radius wins over a nearer one of another class.
 *   await stockpile(cloudOrSurface, boundary, { base 'lowest'|'plane'|'quadric'|'tin'|number, cell 0.5, spacing, signal })
 *       → { volume, area, outsideArea, base:{ kind, z?, plane? } }     volume of the surface above the base inside the boundary
 */
import { fail, dep, throwIfAborted, reporter } from './util.js';
import { compileRegion } from './select.js';

export async function groundSurface(cloud, params = {}) {
  const { Thinner } = dep('thin'), GS = dep('groundSurface');
  const { spacing = 1, mode = 'nearest', breaklines = [], boundary = null, maxEdge = 0, region = null, base = null, signal = null, progress = null } = params;
  const classes = new Set(params.classes || [2]);
  const rc = region ? compileRegion(region) : null;
  const th = new Thinner({ cell: spacing, mode, origin: [cloud.origin[0], cloud.origin[1]] });
  const [ox, oy, oz] = cloud.origin, [sx, sy, sz] = cloud.scale;
  await cloud.forEachNode((i, r) => {
    for (let k = 0; k < r.n; k++) {
      if (r.del[k] || !classes.has(r.cls[k])) continue;
      const x = ox + r.x[k] * sx, y = oy + r.y[k] * sy, z = oz + r.z[k] * sz;
      if (rc && base && !rc.test(x, y, z, r.cls[k])) continue;
      th.add(x, y, z, r.cls[k]);
    }
  }, { signal, progress, bbox: rc && base ? rc.bbox : null, phase: 'surface' });
  let pts = th.points();
  if (rc && base) {
    const S = base;
    for (let i = 0; i < S.X.length; i++) { const x = S.X[i] + S.ox, y = S.Y[i] + S.oy; if (!rc.test(x, y, S.Z[i], 2)) pts.push({ x, y, z: S.Z[i] }); }
  }
  if (pts.length < 3) fail('too_few_points', { n: pts.length });
  const res = GS.buildGround({ points: pts, breaklines, boundary, maxEdge });
  if (!res.surface) fail('no_surface', { errors: res.report.errors });
  return { surface: res.surface, report: { ...res.report, seen: th.seen, kept: th.count, capped: th.capped } };
}

const bounds = (S) => { const b = S.stats().bounds; return b; };

export async function residuals(cloud, surface, params = {}) {
  const cell = params.cell ?? 1, tol = params.tolerance ?? 0.15, classes = new Set(params.classes || [2]), { signal = null, progress = null } = params;
  const b = bounds(surface), x0 = b.minX, y0 = b.minY, nx = Math.floor((b.maxX - x0) / cell) + 1, ny = Math.floor((b.maxY - y0) / cell) + 1;
  if (nx * ny > 6e7) fail('too_many_cells', { cells: nx * ny });
  const sum = new Float64Array(nx * ny), count = new Uint32Array(nx * ny), BINS = 200000, hist = new Uint32Array(BINS + 1);
  let n = 0, outside = 0, s1 = 0, s2 = 0, within = 0;
  const [ox, oy, oz] = cloud.origin, [sx, sy, sz] = cloud.scale;
  await cloud.forEachNode((i, r) => {
    for (let k = 0; k < r.n; k++) {
      if (r.del[k] || !classes.has(r.cls[k])) continue;
      const x = ox + r.x[k] * sx, y = oy + r.y[k] * sy, z = oz + r.z[k] * sz, g = surface.elevationAt(x, y, 1e-6);
      if (g === null) { outside++; continue; }
      const e = z - g, a = Math.abs(e);
      n++; s1 += e; s2 += e * e; if (a <= tol) within++;
      hist[Math.min(BINS, Math.floor(a * 1000))]++;
      const c = Math.min(ny - 1, Math.floor((y - y0) / cell)) * nx + Math.min(nx - 1, Math.floor((x - x0) / cell));
      sum[c] += e; count[c]++;
    }
  }, { signal, progress, phase: 'residuals' });
  const mean = new Float32Array(nx * ny).fill(NaN);
  const worst = [];
  for (let c = 0; c < mean.length; c++) {
    if (!count[c]) continue;
    mean[c] = sum[c] / count[c];
    const a = Math.abs(mean[c]);
    if (worst.length < 10 || a > Math.abs(worst[worst.length - 1].res)) {
      const i = c % nx, j = (c - i) / nx;
      worst.push({ x: x0 + (i + 0.5) * cell, y: y0 + (j + 0.5) * cell, res: mean[c], n: count[c] });
      worst.sort((p, q) => Math.abs(q.res) - Math.abs(p.res)); if (worst.length > 10) worst.length = 10;
    }
  }
  let p95 = 0, acc = 0; const target = n * 0.95;
  for (let k = 0; k <= BINS; k++) { acc += hist[k]; if (acc >= target) { p95 = (k + 1) / 1000; break; } }
  return { grid: { x0, y0, cell, nx, ny, mean, count }, stats: { n, outside, mean: n ? s1 / n : 0, rms: n ? Math.sqrt(s2 / n) : 0, p95, within: n ? within / n : 0, worst } };
}

function ringBounds(ring) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of ring) { const x = p.x ?? p[0], y = p.y ?? p[1]; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}
const xy = (p) => [p.x ?? p[0], p.y ?? p[1]];

function inRing(x, y, ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

export async function volumeBetween(A, B, { boundary = null, cell = 1, signal = null } = {}) {
  const ba = bounds(A), bb = bounds(B);
  let bbox = [Math.max(ba.minX, bb.minX), Math.max(ba.minY, bb.minY), Math.min(ba.maxX, bb.maxX), Math.min(ba.maxY, bb.maxY)];
  const ring = boundary ? boundary.map(xy) : null;
  if (ring) { const r = ringBounds(ring); bbox = [r[0], r[1], r[2], r[3]]; }
  if (!(cell > 0) || bbox[2] <= bbox[0] || bbox[3] <= bbox[1]) fail('no_overlap');
  const nx = Math.ceil((bbox[2] - bbox[0]) / cell), ny = Math.ceil((bbox[3] - bbox[1]) / cell);
  if (nx * ny > 2e8) fail('too_many_cells', { cells: nx * ny });
  let cut = 0, fill = 0, area = 0, outside = 0;
  const a2 = cell * cell;
  for (let j = 0; j < ny; j++) {
    if ((j & 255) === 255) { throwIfAborted(signal); await new Promise((r) => setTimeout(r, 0)); }
    const y = bbox[1] + (j + 0.5) * cell;
    for (let i = 0; i < nx; i++) {
      const x = bbox[0] + (i + 0.5) * cell;
      if (ring && !inRing(x, y, ring)) continue;
      const za = A.elevationAt(x, y, 1e-6), zb = B.elevationAt(x, y, 1e-6);
      if (za === null || zb === null) { outside += a2; continue; }
      area += a2;
      const d = zb - za;
      if (d > 0) fill += d * a2; else cut -= d * a2;
    }
  }
  return { cut, fill, net: fill - cut, area, outsideArea: outside, cell };
}


/** Least squares z = c0 + c1 u + c2 v + c3 u2 + c4 uv + c5 v2 through samples [{x,y,z}] (centred, scaled); returns (x, y) => z. */
function fitQuadric(samples) {
  let mx = 0, my = 0; for (const s of samples) { mx += s.x; my += s.y; } mx /= samples.length; my /= samples.length;
  let sc = 0; for (const s of samples) sc = Math.max(sc, Math.abs(s.x - mx), Math.abs(s.y - my)); sc = sc || 1;
  const row = (x, y) => { const u = (x - mx) / sc, v = (y - my) / sc; return [1, u, v, u * u, u * v, v * v]; };
  const N = Array.from({ length: 6 }, () => new Float64Array(7));
  for (const s of samples) { const r = row(s.x, s.y); for (let i = 0; i < 6; i++) { for (let j = 0; j < 6; j++) N[i][j] += r[i] * r[j]; N[i][6] += r[i] * s.z; } }
  for (let i = 0; i < 6; i++) N[i][i] += 1e-9;
  for (let i = 0; i < 6; i++) {          // Gauss-Jordan with partial pivoting
    let p = i; for (let k = i + 1; k < 6; k++) if (Math.abs(N[k][i]) > Math.abs(N[p][i])) p = k;
    [N[i], N[p]] = [N[p], N[i]];
    for (let k = 0; k < 6; k++) { if (k === i) continue; const f = N[k][i] / N[i][i]; if (f) for (let j = i; j < 7; j++) N[k][j] -= f * N[i][j]; }
  }
  const co = N.map((r, i) => r[6] / r[i]);
  return (x, y) => { const r = row(x, y); let z = 0; for (let i = 0; i < 6; i++) z += co[i] * r[i]; return z; };
}

/** Boundary samples without the ones standing above the ground (PC.8: trees on the ring raised a TIN base by 0.2 m on average, 7 % of the volume). */
function trimSamples(samples) {
  let keep = samples;
  if (samples.length < 12) return keep;
  for (let it = 0; it < 5; it++) {
    const f = fitQuadric(keep), res = keep.map((s) => s.z - f(s.x, s.y)), a = res.map(Math.abs).sort((p, q) => p - q);
    const thr = Math.max(0.05, 3 * 1.4826 * a[a.length >> 1]);
    const next = keep.filter((s, i) => res[i] <= thr);
    if (next.length === keep.length || next.length < 12) break;
    keep = next;
  }
  return keep;
}

export async function stockpile(source, boundary, params = {}) {
  const cell = params.cell ?? 0.5, baseSpec = params.base ?? 'lowest', { signal = null } = params;
  const ring = boundary.map(xy);
  if (ring.length < 3) fail('bad_boundary');
  let S = source;
  if (!source || typeof source.elevationAt !== 'function') {
    const { Thinner } = dep('thin'), GS = dep('groundSurface'), cloud = source;
    const bb = ringBounds(ring), m = 2 * cell + 1, spacing = params.spacing ?? cell;
    const th = new Thinner({ cell: spacing, mode: 'nearest', origin: [cloud.origin[0], cloud.origin[1]] });
    const [ox, oy, oz] = cloud.origin, [sx, sy, sz] = cloud.scale;
    await cloud.forEachNode((i, r) => {
      for (let k = 0; k < r.n; k++) {
        if (r.del[k] || r.cls[k] === 7 || r.cls[k] === 18) continue;
        const x = ox + r.x[k] * sx, y = oy + r.y[k] * sy;
        if (x < bb[0] - m || x > bb[2] + m || y < bb[1] - m || y > bb[3] + m) continue;
        th.add(x, y, oz + r.z[k] * sz, r.cls[k]);
      }
    }, { signal, bbox: [bb[0] - m, bb[1] - m, bb[2] + m, bb[3] + m], phase: 'stockpile' });
    const pts = th.points();
    if (pts.length < 3) fail('too_few_points', { n: pts.length });
    const res = GS.buildGround({ points: pts });
    if (!res.surface) fail('no_surface', { errors: res.report.errors });
    S = res.surface;
  }
  // samples along the boundary
  const samples = [];
  for (let i = 0; i < ring.length; i++) {
    const [ax, ay] = ring[i], [bx, by] = ring[(i + 1) % ring.length], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / cell));
    for (let k = 0; k < n; k++) { const x = ax + (bx - ax) * k / n, y = ay + (by - ay) * k / n, z = S.elevationAt(x, y, 1e-6); if (z !== null) samples.push({ x, y, z }); }
  }
  if (samples.length < 3 && typeof baseSpec !== 'number') fail('boundary_off_data');
  // the ring may cross trees or a heap's own foot: samples that stand above a robust fit (canopy only ever raises them) are left out
  const ground = trimSamples(samples);
  let baseZ = null, kind, plane = null;
  if (typeof baseSpec === 'number') { kind = 'z'; baseZ = () => baseSpec; }
  else if (baseSpec === 'lowest') { const z = Math.min(...samples.map((s) => s.z)); kind = 'lowest'; baseZ = () => z; }
  else if (baseSpec === 'plane') {
    // least squares z = a x + b y + c through the boundary ground (centred)
    let mx = 0, my = 0, mz = 0; for (const s of ground) { mx += s.x; my += s.y; mz += s.z; }
    mx /= ground.length; my /= ground.length; mz /= ground.length;
    let sxx = 0, sxy = 0, syy = 0, sxz = 0, syz = 0;
    for (const s of ground) { const dx = s.x - mx, dy = s.y - my, dz = s.z - mz; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; sxz += dx * dz; syz += dy * dz; }
    const det = sxx * syy - sxy * sxy;
    const a = det ? (sxz * syy - syz * sxy) / det : 0, b = det ? (syz * sxx - sxz * sxy) / det : 0;
    plane = { a, b, c: mz - a * mx - b * my }; kind = 'plane';
    baseZ = (x, y) => plane.a * x + plane.b * y + plane.c;
  } else if (baseSpec === 'quadric') {
    // smooth and stable, unlike a TIN of the boundary points alone, whose long sliver triangles change with the noise of the samples
    if (ground.length < 6) fail('boundary_off_data');
    kind = 'quadric'; baseZ = fitQuadric(ground);
  } else if (baseSpec === 'tin') {
    const GS = dep('groundSurface'), res = GS.buildGround({ points: ground });
    if (!res.surface) fail('no_surface', { errors: res.report.errors });
    kind = 'tin'; const T = res.surface; baseZ = (x, y) => T.elevationAt(x, y, 1e-6);
  } else fail('bad_base', { base: baseSpec });
  const bb = ringBounds(ring), nx = Math.ceil((bb[2] - bb[0]) / cell), ny = Math.ceil((bb[3] - bb[1]) / cell), a2 = cell * cell;
  let volume = 0, area = 0, outside = 0;
  for (let j = 0; j < ny; j++) {
    const y = bb[1] + (j + 0.5) * cell;
    for (let i = 0; i < nx; i++) {
      const x = bb[0] + (i + 0.5) * cell;
      if (!inRing(x, y, ring)) continue;
      const z = S.elevationAt(x, y, 1e-6), g = baseZ(x, y);
      if (z === null || g === null) { outside += a2; continue; }
      if (z > g) { volume += (z - g) * a2; area += a2; }
    }
  }
  return { volume, area, outsideArea: outside, base: kind === 'plane' ? { kind, plane } : kind === 'z' ? { kind, z: baseSpec } : kind === 'lowest' ? { kind, z: baseZ() } : { kind } };
}

export async function nearestPoint(cloud, x, y, radius, { prefer = 2 } = {}) {
  if (!(radius > 0)) fail('bad_radius');
  const r = await cloud.readRegion([x - radius, y - radius, x + radius, y + radius]);
  let best = -1, bd = Infinity, pbest = -1, pd = Infinity;
  const r2 = radius * radius;
  for (let k = 0; k < r.n; k++) {
    const c = r.cls[k];
    if (c === 7 || c === 18) continue;
    const d = (r.x[k] - x) * (r.x[k] - x) + (r.y[k] - y) * (r.y[k] - y);
    if (d > r2) continue;
    if (d < bd) { bd = d; best = k; }
    if (c === prefer && d < pd) { pd = d; pbest = k; }
  }
  const k = pbest >= 0 ? pbest : best;
  return k < 0 ? null : [r.x[k], r.y[k], r.z[k]];
}
