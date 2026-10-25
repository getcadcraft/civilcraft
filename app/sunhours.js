/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sunhours.js — hours of direct sun on a site with building masses on it (0.7 LC.1 M4). No DOM, no three.js; the Node test
 * drives it (bin/test-civilcraft-massing.mjs) and sunhours-worker.js runs it off the page for a season.
 *
 * The sun is drive.js sunPosition (NOAA / Meeus) at the project's latitude and longitude, sampled every `stepMin` minutes of the
 * local day for a date and a time zone the person picks. A ground cell or a wall point is lit for a sample when the sun is above
 * the horizon, a wall faces it, and the ray toward it meets no mass and no rise of the ground. Hours = lit samples × step.
 *   - masses are prisms (footprint polygon from their lowest ground to the roof); a ray is tested against the footprint exactly
 *     (the crossings of the sun's line with the polygon's edges, concave footprints too), clipped to the prism's height
 *   - the ground shades itself: the ray is marched over a raster of the terrain (a terrainRaster) one cell at a time
 *   - cells under a mass, or off the surface, are masked (no value)
 *
 * Time zones. A time zone is a name ('America/Mexico_City') or a fixed offset from UTC in hours (-6). A name is looked up for the
 * date asked about, so daylight saving is applied where that zone has it; a typed offset is used as typed. The apps tell the
 * person which one they chose — a wrong offset moves every hour, but not the number of hours in a day.
 *
 *   utcOffsetFor(date 'YYYY-MM-DD', zone) → hours | null          (null = not a time zone)
 *   sunSamples({ date, utcOffset, lat, lon, stepMin = 15 }) → { dirs: Float64Array [e, n, u …], alt, az, hours: step in hours, day: hours above the horizon }
 *   terrainRaster(elevAt, { minX, minY, maxX, maxY }, cell) → { x0, y0, cell, nx, ny, z: Float32Array (NaN off the surface) }
 *   sampleRaster(r, x, y) → z | NaN                              (bilinear)
 *   makeWorld(masses, terrain, origin) → world                   masses = [{ id, name, pts, z0, zBottom, floors, floorHeight }]
 *   isLit(world, x, y, z, dir) → bool                            one ray toward the sun, project coordinates
 *   sunHours(input) → { origin, days, ground, facades, daylight }  input = { masses, terrain, lat, lon, days: [{ date, utcOffset }],
 *       stepMin, cell, margin, wallStep, mean: true } — ground = { x0, y0, cell, nx, ny, hours: Float32Array (mean hours a day; -1
 *       where masked), masked, max }, facades = [{ mass, name, edge, normal (radians), length, floors: [hours], mean, points:
 *       [{ x, y, z, floor, hours }] }], daylight = hours above the horizon, mean over the days
 *   mergeResults([result]) → result      the same site over different days, as one (the means weighted by their days)
 *   facadeSummary(result) → [{ mass, name, min, mean, max }]     the worst, average and best wall of each mass
 *   groundCsv(result) / facadeCsv(result) → text
 */

import { sunPosition, sunVector } from './drive.js';

const fin = Number.isFinite;

// ------------------------------------------------------------------ time and sun
/** Hours from UTC for a date in a zone: a number is used as typed (-14 … 14); a name is looked up for that date. */
export function utcOffsetFor(date, zone) {
  if (typeof zone === 'number') return fin(zone) && Math.abs(zone) <= 14 ? zone : null;
  const s = String(zone ?? '').trim();
  if (/^[+-]?\d+(\.\d+)?$/.test(s)) { const n = Number(s); return Math.abs(n) <= 14 ? n : null; }
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!m || !s) return null;
  try {
    const noon = Date.UTC(+m[1], +m[2] - 1, +m[3], 12, 0, 0);
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: s, timeZoneName: 'longOffset' }).formatToParts(new Date(noon));
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    if (tz === 'GMT') return 0;
    const g = /^GMT([+-])(\d{1,2})(?::(\d{2}))?$/.exec(tz);
    return g ? (g[1] === '-' ? -1 : 1) * (Number(g[2]) + Number(g[3] || 0) / 60) : null;
  } catch { return null; }
}

export function sunSamples({ date, utcOffset, lat, lon, stepMin = 15 }) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date));
  if (!m) throw new Error('bad_date');
  const day0 = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  const n = Math.round(1440 / stepMin), dirs = [], alt = [], az = [];
  for (let k = 0; k < n; k++) {
    const minute = (k + 0.5) * stepMin;   // the middle of each step
    const p = sunPosition(new Date(day0 + (minute - utcOffset * 60) * 60000), lat, lon);
    if (p.altitude > 0) { const v = sunVector(p); dirs.push(v[0], v[1], v[2]); alt.push(p.altitude); az.push(p.azimuth); }
  }
  return { dirs: Float64Array.from(dirs), alt, az, hours: stepMin / 60, day: (dirs.length / 3) * (stepMin / 60) };
}

// ------------------------------------------------------------------ terrain
export function terrainRaster(elevAt, { minX, minY, maxX, maxY }, cell) {
  const nx = Math.max(2, Math.ceil((maxX - minX) / cell) + 1), ny = Math.max(2, Math.ceil((maxY - minY) / cell) + 1), z = new Float32Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const v = elevAt(minX + i * cell, minY + j * cell); z[j * nx + i] = fin(v) ? v : NaN; }
  return { x0: minX, y0: minY, cell, nx, ny, z };
}
export function sampleRaster(r, x, y) {
  const fx = (x - r.x0) / r.cell, fy = (y - r.y0) / r.cell;
  if (fx < 0 || fy < 0 || fx > r.nx - 1 || fy > r.ny - 1) return NaN;
  const i = Math.min(r.nx - 2, Math.floor(fx)), j = Math.min(r.ny - 2, Math.floor(fy)), u = fx - i, v = fy - j;
  const a = r.z[j * r.nx + i], b = r.z[j * r.nx + i + 1], c = r.z[(j + 1) * r.nx + i], d = r.z[(j + 1) * r.nx + i + 1];
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
}

// ------------------------------------------------------------------ the world: prisms and terrain, in a local frame
function prismOf(m, ox, oy) {
  const P = m.pts, n = P.length;
  let area = 0; for (let i = 0; i < n; i++) { const p = P[i], q = P[(i + 1) % n]; area += p.x * q.y - q.x * p.y; }
  const pts = area < 0 ? P.slice().reverse() : P;   // counter-clockwise: the outward normal of an edge is (dy, −dx)
  const xs = Float64Array.from(pts, (p) => p.x - ox), ys = Float64Array.from(pts, (p) => p.y - oy);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (let i = 0; i < n; i++) { x0 = Math.min(x0, xs[i]); y0 = Math.min(y0, ys[i]); x1 = Math.max(x1, xs[i]); y1 = Math.max(y1, ys[i]); }
  return { id: m.id, name: m.name, n, xs, ys, x0, y0, x1, y1, zlo: m.zBottom, zhi: m.z0 + m.floors * m.floorHeight, z0: m.z0, floors: m.floors, floorHeight: m.floorHeight };
}

export function makeWorld(masses, terrain, origin) {
  const prisms = masses.map((m) => prismOf(m, origin.x, origin.y));
  let zmax = -Infinity;
  if (terrain) for (let i = 0; i < terrain.z.length; i++) if (terrain.z[i] > zmax) zmax = terrain.z[i];
  return { prisms, terrain: terrain ? { ...terrain, x0: terrain.x0 - origin.x, y0: terrain.y0 - origin.y } : null, zmax, origin };
}

/** Does the ray from (px, py, pz) toward direction s pass through the prism? */
function hitsPrism(px, py, pz, sx, sy, sz, P) {
  if (sz <= 1e-9) return false;
  let lo = Math.max((P.zlo - pz) / sz, 1e-9), hi = (P.zhi - pz) / sz;
  if (hi <= lo) return false;
  const h2 = sx * sx + sy * sy;
  if (h2 < 1e-18) {   // the sun overhead: the ray is a vertical line
    if (px < P.x0 || px > P.x1 || py < P.y0 || py > P.y1) return false;
    return inPoly(px, py, P);
  }
  for (const [p, s, a, b] of [[px, sx, P.x0, P.x1], [py, sy, P.y0, P.y1]]) {   // the box of the footprint, as a slab on each axis
    if (Math.abs(s) < 1e-12) { if (p < a || p > b) return false; continue; }
    let t1 = (a - p) / s, t2 = (b - p) / s;
    if (t1 > t2) { const q = t1; t1 = t2; t2 = q; }
    if (t1 > lo) lo = t1;
    if (t2 < hi) hi = t2;
    if (hi <= lo) return false;
  }
  // where the sun's line (the whole line) crosses the footprint's edges, as t along it; inside between every other pair
  const L = Math.sqrt(h2), ux = sx / L, uy = sy / L, n = P.n;
  const ts = [];
  for (let i = 0; i < n; i++) {
    const j = i + 1 === n ? 0 : i + 1;
    const da = ux * (P.ys[i] - py) - uy * (P.xs[i] - px), db = ux * (P.ys[j] - py) - uy * (P.xs[j] - px);
    if ((da > 0) === (db > 0)) continue;
    const f = da / (da - db), qx = P.xs[i] + (P.xs[j] - P.xs[i]) * f - px, qy = P.ys[i] + (P.ys[j] - P.ys[i]) * f - py;
    ts.push((qx * ux + qy * uy) / L);   // t in units of the ray parameter (sx, sy have length L)
  }
  if (ts.length < 2) return false;
  ts.sort((a, b) => a - b);
  for (let k = 0; k + 1 < ts.length; k += 2) if (ts[k] < hi && ts[k + 1] > lo && Math.min(ts[k + 1], hi) - Math.max(ts[k], lo) > 1e-9) return true;
  return false;
}
function inPoly(x, y, P) {
  let c = false;
  for (let i = 0, j = P.n - 1; i < P.n; j = i++) if ((P.ys[i] > y) !== (P.ys[j] > y) && x < ((P.xs[j] - P.xs[i]) * (y - P.ys[i])) / (P.ys[j] - P.ys[i]) + P.xs[i]) c = !c;
  return c;
}

/** One ray toward the sun from a point in project coordinates. */
export function isLit(world, x, y, z, dir) { return litLocal(world, x - world.origin.x, y - world.origin.y, z, dir[0], dir[1], dir[2]); }
function litLocal(world, px, py, pz, sx, sy, sz) {
  if (sz <= 1e-9) return false;
  for (const P of world.prisms) if (hitsPrism(px, py, pz, sx, sy, sz, P)) return false;
  const T = world.terrain;
  if (T && pz < world.zmax) {   // march over the ground, a cell at a time, until the ray is above the highest ground
    const h = Math.hypot(sx, sy);
    if (h > 1e-9) {
      const ds = T.cell, rise = (sz / h) * ds, dx = (sx / h) * ds, dy = (sy / h) * ds, kmax = Math.min(600, Math.ceil((world.zmax - pz) / rise));
      let x = px, y = py, zz = pz;
      for (let k = 1; k <= kmax; k++) {
        x += dx; y += dy; zz += rise;
        const g = sampleRaster(T, x, y);
        if (g > zz + 1e-3) return false;
      }
    }
  }
  return true;
}

// ------------------------------------------------------------------ the analysis
export function sunHours(input) {
  const { masses, terrain = null, lat, lon, days, stepMin = 15 } = input;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, hmax = 0;
  for (const m of masses) { for (const p of m.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); } hmax = Math.max(hmax, m.z0 + m.floors * m.floorHeight - m.zBottom); }
  if (!masses.length) throw new Error('no_masses');
  const origin = { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  const world = makeWorld(masses, terrain, origin);
  const margin = input.margin ?? Math.max(hmax * 1.5, 10);
  const cell = input.cell ?? Math.max((x1 - x0 + y1 - y0 + 4 * margin) / 120, 1);
  const gx0 = x0 - margin, gy0 = y0 - margin, nx = Math.ceil((x1 - x0 + 2 * margin) / cell), ny = Math.ceil((y1 - y0 + 2 * margin) / cell);
  const hours = new Float32Array(nx * ny), masked = new Uint8Array(nx * ny), gz = new Float32Array(nx * ny);
  const T = world.terrain;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = gx0 + (i + 0.5) * cell, y = gy0 + (j + 0.5) * cell, k = j * nx + i;
    const lx = x - origin.x, ly = y - origin.y;
    let under = false;
    for (const P of world.prisms) if (lx >= P.x0 && lx <= P.x1 && ly >= P.y0 && ly <= P.y1 && inPoly(lx, ly, P)) { under = true; break; }
    const g = T ? sampleRaster(T, lx, ly) : 0;
    if (under || !fin(g)) { masked[k] = 1; continue; }
    gz[k] = g + 0.01;
  }
  // wall points: along each edge every wallStep, at the middle of each floor
  const wallStep = input.wallStep ?? Math.max(cell, 3);
  const facades = [];
  for (const P of world.prisms) {
    const m = masses.find((q) => q.id === P.id);
    for (let e = 0; e < P.n; e++) {
      const a = e, b = (e + 1) % P.n, dx = P.xs[b] - P.xs[a], dy = P.ys[b] - P.ys[a], len = Math.hypot(dx, dy);
      if (len < 1e-9) continue;
      const nxv = dy / len, nyv = -dx / len, cnt = Math.max(1, Math.ceil(len / wallStep)), pts = [];
      for (let f = 0; f < P.floors; f++) for (let c = 0; c < cnt; c++) {
        const u = (c + 0.5) / cnt;
        pts.push({ x: P.xs[a] + dx * u, y: P.ys[a] + dy * u, z: P.z0 + (f + 0.5) * P.floorHeight, floor: f, hours: 0 });
      }
      facades.push({ mass: P.id, name: m.name, edge: e, normal: Math.atan2(nyv, nxv), nx: nxv, ny: nyv, length: len, pts });
    }
  }
  let daylight = 0;
  for (const day of days) {
    const sun = sunSamples({ date: day.date, utcOffset: day.utcOffset, lat, lon, stepMin });
    daylight += sun.day;
    const D = sun.dirs, ns = D.length / 3;
    for (let s = 0; s < ns; s++) {
      const sx = D[3 * s], sy = D[3 * s + 1], sz = D[3 * s + 2];
      for (let k = 0; k < hours.length; k++) {
        if (masked[k]) continue;
        const i = k % nx, j = (k - i) / nx;
        if (litLocal(world, gx0 + (i + 0.5) * cell - origin.x, gy0 + (j + 0.5) * cell - origin.y, gz[k], sx, sy, sz)) hours[k] += sun.hours;
      }
      for (const F of facades) {
        if (F.nx * sx + F.ny * sy <= 1e-9) continue;   // the wall faces away from the sun
        const eps = 0.02 * Math.max(1, F.length / 50);
        for (const p of F.pts) if (litLocal(world, p.x + F.nx * eps, p.y + F.ny * eps, p.z, sx, sy, sz)) p.hours += sun.hours;
      }
    }
  }
  const nd = days.length;
  let max = 0;
  for (let k = 0; k < hours.length; k++) { if (masked[k]) hours[k] = -1; else { hours[k] /= nd; if (hours[k] > max) max = hours[k]; } }
  const facadeOut = facades.map((F) => {
    const floors = Array.from({ length: world.prisms.find((P) => P.id === F.mass).floors }, () => ({ s: 0, n: 0 }));
    for (const p of F.pts) { p.hours /= nd; floors[p.floor].s += p.hours; floors[p.floor].n++; }
    const fl = floors.map((q) => (q.n ? q.s / q.n : 0));
    return { mass: F.mass, name: F.name, edge: F.edge, normal: F.normal, length: F.length, floors: fl, mean: fl.reduce((s, v) => s + v, 0) / fl.length,
      points: F.pts.map((p) => ({ x: p.x + origin.x, y: p.y + origin.y, z: p.z, floor: p.floor, hours: p.hours })) };
  });
  return { origin, days: nd, daylight: daylight / nd, stepMin, ground: { x0: gx0, y0: gy0, cell, nx, ny, hours, masked, max }, facades: facadeOut };
}

/** Results of the same site over different days (what several workers return) as one: means weighted by their number of days. */
export function mergeResults(parts) {
  if (parts.length === 1) return parts[0];
  const total = parts.reduce((s, p) => s + p.days, 0), first = parts[0];
  const hours = new Float32Array(first.ground.hours.length);
  let max = 0;
  for (let k = 0; k < hours.length; k++) {
    if (first.ground.masked[k]) { hours[k] = -1; continue; }
    let v = 0; for (const p of parts) v += p.ground.hours[k] * p.days;
    hours[k] = v / total; if (hours[k] > max) max = hours[k];
  }
  const facades = first.facades.map((f, i) => {
    const floors = f.floors.map((_, k) => parts.reduce((s, p) => s + p.facades[i].floors[k] * p.days, 0) / total);
    return { ...f, floors, mean: floors.reduce((s, v) => s + v, 0) / floors.length, points: f.points.map((q, n) => ({ ...q, hours: parts.reduce((s, p) => s + p.facades[i].points[n].hours * p.days, 0) / total })) };
  });
  return { origin: first.origin, days: total, daylight: parts.reduce((s, p) => s + p.daylight * p.days, 0) / total, stepMin: first.stepMin, ground: { ...first.ground, hours, max }, facades };
}

export function facadeSummary(r) {
  const by = new Map();
  for (const f of r.facades) { const s = by.get(f.mass) || { mass: f.mass, name: f.name, min: Infinity, max: -Infinity, sum: 0, n: 0 }; s.min = Math.min(s.min, f.mean); s.max = Math.max(s.max, f.mean); s.sum += f.mean; s.n++; by.set(f.mass, s); }
  return [...by.values()].map((s) => ({ mass: s.mass, name: s.name, min: s.min, mean: s.sum / s.n, max: s.max }));
}

const csvCell = (v) => { let s = String(v ?? ''); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };   // formula cells escaped
export function facadeCsv(r) {
  const rows = [['mass', 'wall', 'facing_deg', 'floor', 'sun_hours_per_day']];
  for (const f of r.facades) f.floors.forEach((h, k) => rows.push([f.name, f.edge + 1, Math.round(((90 - (f.normal * 180) / Math.PI) % 360 + 360) % 360), k + 1, h.toFixed(2)]));
  return rows.map((row) => row.map(csvCell).join(',')).join('\n') + '\n';
}
export function groundCsv(r) {
  const g = r.ground, rows = [['x', 'y', 'sun_hours_per_day']];
  for (let j = 0; j < g.ny; j++) for (let i = 0; i < g.nx; i++) { const h = g.hours[j * g.nx + i]; if (h >= 0) rows.push([(g.x0 + (i + 0.5) * g.cell).toFixed(3), (g.y0 + (j + 0.5) * g.cell).toFixed(3), h.toFixed(2)]); }
  return rows.map((row) => row.join(',')).join('\n') + '\n';
}
