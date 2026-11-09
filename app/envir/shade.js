/* SPDX-License-Identifier: Apache-2.0 */
/**
 * shade.js — shade studies over a day or a season (0.9 SU.1119, cc-envir; DOM-free; imports solar.js only).
 *
 * Blockers are prisms: a footprint polygon (project x east, y north, any unit), a base level z0 and a height above it.
 * The ground is flat at level `area.z` (a number; the study is for a site, a roof deck or a plaza, not for terrain — the CivilCraft
 * sun-hours tool does terrain). A point is lit by the sun when the sun is above the horizon and the ray toward it meets no prism:
 * the ray is followed on the plan to the first edge of each footprint it crosses, and it is blocked when the ray is lower than the
 * prism's top there (the first crossing is the lowest height the ray has over that prism, so no later crossing needs a test).
 *
 *   makeWorld(blockers) → world                     blockers = [{ id, pts: [{x,y}], z0, height }]
 *   isLit(world, x, y, z, dir) → bool               dir = [east, north, up] unit vector toward the sun (north is the plan's +y)
 *   litFraction(world, points, dir) → 0..1          mean over points [{x,y,z}] (a surface sampled at several points)
 *   shadeStudy(input) → result
 *       input = { blockers, area: { minX, minY, maxX, maxY, cell, z = 0 }, lat, lon, days: [{ date, utcOffset }], stepMin = 15,
 *                 northAngle = 0 (degrees the plan's +y is turned clockwise from true north), frames: false|{ day = 0, every = 1 } }
 *       result = { nx, ny, cell, x0, y0, daylight (mean hours a day the sun is up), hours: Float32Array (mean sun hours; −1 under a blocker),
 *                  shadedHours: Float32Array (daylight − hours; −1 masked), max, masked, series: [{ date, min, altitude, azimuth, shadedArea,
 *                  shadedPct }] for the first day, frames: [{ min, altitude, azimuth, lit: Uint8Array (0 shaded, 1 lit, 2 masked, 3 night) }] }
 *   renderHours(result, { kind: 'sun'|'shade', max }) → { w, h, rgba }      the map as an image (north up)
 *   renderFrame(result, frame) → { w, h, rgba }
 *   contactSheet(result, cols = 4, gap = 2) → { w, h, rgba }      every animation frame on one picture
 *   hoursCsv(result) → text
 */
import { dayTrack, sunVector } from './solar.js';

const fin = Number.isFinite;

export function makeWorld(blockers) {
  const ps = [];
  for (const b of blockers || []) {
    if (!b || !Array.isArray(b.pts) || b.pts.length < 3 || !fin(b.z0) || !fin(b.height) || b.height <= 0) continue;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of b.pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    ps.push({ id: b.id, pts: b.pts, z0: b.z0, top: b.z0 + b.height, bb: [x0, y0, x1, y1] });
  }
  return { prisms: ps };
}

function inside(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i], b = pts[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

/** Smallest s > eps at which the plan ray (x + s·ux, y + s·uy) crosses the polygon boundary, or Infinity. */
function firstCrossing(pts, x, y, ux, uy) {
  let best = Infinity;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[j], b = pts[i];
    const ex = b.x - a.x, ey = b.y - a.y;
    const den = ux * ey - uy * ex;
    if (Math.abs(den) < 1e-12) continue;
    const s = ((a.x - x) * ey - (a.y - y) * ex) / den;
    const t = ((a.x - x) * uy - (a.y - y) * ux) / den;
    if (s > 1e-9 && t >= -1e-9 && t <= 1 + 1e-9 && s < best) best = s;
  }
  return best;
}

export function isLit(world, x, y, z, dir) {
  const up = dir[2];
  if (!(up > 0)) return false;
  const h = Math.hypot(dir[0], dir[1]);
  if (h < 1e-9) return true;   // sun overhead
  const ux = dir[0] / h, uy = dir[1] / h, tan = up / h;
  for (const p of world.prisms) {
    if (z >= p.top) continue;
    if (inside(p.pts, x, y)) { if (z < p.top - 1e-9) return false; continue; }
    // quick reject: the ray never reaches the box on the sun's side, or it passes over the top before it gets there
    const reach = (p.top - z) / tan;
    const cx = (p.bb[0] + p.bb[2]) / 2, cy = (p.bb[1] + p.bb[3]) / 2, r = Math.hypot(p.bb[2] - p.bb[0], p.bb[3] - p.bb[1]) / 2;
    const along = (cx - x) * ux + (cy - y) * uy;
    if (along < -r || along - r > reach) continue;
    if (Math.abs((cx - x) * uy - (cy - y) * ux) > r) continue;
    const s = firstCrossing(p.pts, x, y, ux, uy);
    if (s === Infinity) continue;
    if (z + s * tan < p.top - 1e-9) return false;
  }
  return true;
}

export function litFraction(world, points, dir) {
  if (!points.length) return 0;
  let n = 0;
  for (const p of points) if (isLit(world, p.x, p.y, p.z, dir)) n++;
  return n / points.length;
}

/** The sun's direction in plan coordinates when the plan's +y is turned `northAngle` degrees clockwise from true north. */
export function planDir(sun, northAngle = 0) {
  return sunVector({ azimuth: sun.azimuth - northAngle, altitude: sun.altitude });
}

export function shadeStudy(input) {
  const { blockers, area, lat, lon, days } = input;
  const stepMin = input.stepMin || 15, north = input.northAngle || 0;
  if (!area || !(area.cell > 0) || !(area.maxX > area.minX) || !(area.maxY > area.minY)) throw new Error('bad_area');
  if (!Array.isArray(days) || !days.length) throw new Error('no_days');
  const nx = Math.max(1, Math.ceil((area.maxX - area.minX) / area.cell)), ny = Math.max(1, Math.ceil((area.maxY - area.minY) / area.cell));
  if (nx * ny > 4e6) throw new Error('area_too_big');
  const z = area.z || 0, world = makeWorld(blockers), n = nx * ny;
  const mask = new Uint8Array(n);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = area.minX + (i + 0.5) * area.cell, y = area.minY + (j + 0.5) * area.cell;
    for (const p of world.prisms) if (inside(p.pts, x, y) && p.top > z) { mask[j * nx + i] = 1; break; }
  }
  const lit = new Float32Array(n), stepH = stepMin / 60;
  let daylight = 0;
  const fr = input.frames ? { day: input.frames.day || 0, every: Math.max(1, input.frames.every || 1) } : null;
  const frames = [], series = [];
  days.forEach((d, di) => {
    const track = dayTrack(d.date, d.utcOffset, lat, lon, stepMin);
    track.forEach((s, si) => {
      const up = s.altitude > 0;
      if (up) daylight += stepH;
      const dir = up ? planDir(s, north) : null;
      const keep = fr && di === fr.day && si % fr.every === 0 ? new Uint8Array(n) : null;
      const record = di === 0;
      let shaded = 0, open = 0;
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const k = j * nx + i;
        if (mask[k]) { if (keep) keep[k] = 2; continue; }
        if (!up) { if (keep) keep[k] = 3; continue; }
        const x = area.minX + (i + 0.5) * area.cell, y = area.minY + (j + 0.5) * area.cell;
        const l = isLit(world, x, y, z, dir);
        open++;
        if (l) { lit[k] += stepH; if (keep) keep[k] = 1; } else { shaded++; if (keep) keep[k] = 0; }
      }
      if (record && up) series.push({ date: d.date, min: s.min, altitude: s.altitude, azimuth: s.azimuth, shadedArea: shaded * area.cell * area.cell, shadedPct: open ? (100 * shaded) / open : 0 });
      if (keep) frames.push({ date: d.date, min: s.min, altitude: s.altitude, azimuth: s.azimuth, lit: keep });
    });
  });
  const nd = days.length, dl = daylight / nd;
  const hours = new Float32Array(n), shadedHours = new Float32Array(n);
  let max = 0, masked = 0;
  for (let k = 0; k < n; k++) {
    if (mask[k]) { hours[k] = -1; shadedHours[k] = -1; masked++; continue; }
    hours[k] = lit[k] / nd; shadedHours[k] = Math.max(0, dl - hours[k]);
    if (hours[k] > max) max = hours[k];
  }
  return { nx, ny, cell: area.cell, x0: area.minX, y0: area.minY, daylight: dl, hours, shadedHours, max, masked, series, frames, days: nd };
}

// ------------------------------------------------------------------ images
function ramp(u) {   // 0 dark blue → 1 yellow
  const h = 230 - 175 * u, l = 0.3 + 0.35 * u, s = 0.7;
  const c = (1 - Math.abs(2 * l - 1)) * s, hp = h / 60, x = c * (1 - Math.abs((hp % 2) - 1)), m = l - c / 2;
  const [r, g, b] = hp < 1 ? [c, x, 0] : hp < 2 ? [x, c, 0] : hp < 3 ? [0, c, x] : hp < 4 ? [0, x, c] : hp < 5 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
const GREY = [150, 150, 150];

/** kind 'sun': yellow = most sun hours; kind 'shade': yellow = most hours in shade. North is up. */
export function renderHours(r, { kind = 'sun', max } = {}) {
  const src = kind === 'shade' ? r.shadedHours : r.hours;
  const top = max || (kind === 'shade' ? r.daylight : r.max) || 1;
  const rgba = new Uint8ClampedArray(r.nx * r.ny * 4);
  for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) {
    const v = src[j * r.nx + i], o = ((r.ny - 1 - j) * r.nx + i) * 4;
    const c = v < 0 ? GREY : ramp(Math.min(1, v / top));
    rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
  }
  return { w: r.nx, h: r.ny, rgba };
}

export function renderFrame(r, frame) {
  const rgba = new Uint8ClampedArray(r.nx * r.ny * 4);
  const col = [[40, 60, 120], [250, 220, 90], GREY, [20, 20, 40]];
  for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) {
    const c = col[frame.lit[j * r.nx + i]], o = ((r.ny - 1 - j) * r.nx + i) * 4;
    rgba[o] = c[0]; rgba[o + 1] = c[1]; rgba[o + 2] = c[2]; rgba[o + 3] = 255;
  }
  return { w: r.nx, h: r.ny, rgba };
}

export function hoursCsv(r) {
  const rows = ['x,y,sun_hours,shade_hours'];
  for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) {
    const k = j * r.nx + i;
    if (r.hours[k] < 0) continue;
    rows.push([(r.x0 + (i + 0.5) * r.cell).toFixed(3), (r.y0 + (j + 0.5) * r.cell).toFixed(3), r.hours[k].toFixed(3), r.shadedHours[k].toFixed(3)].join(','));
  }
  return rows.join('\n') + '\n';
}

/** All the frames of the animation on one picture (cols across), each `gap` pixels apart: the contact sheet a report or a chat can carry. */
export function contactSheet(r, cols = 4, gap = 2) {
  const fs = r.frames || [];
  if (!fs.length) return { w: 0, h: 0, rgba: new Uint8ClampedArray(0) };
  const c = Math.min(cols, fs.length), rows = Math.ceil(fs.length / c), W = c * r.nx + (c - 1) * gap, H = rows * r.ny + (rows - 1) * gap;
  const rgba = new Uint8ClampedArray(W * H * 4).fill(255);
  fs.forEach((f, k) => {
    const im = renderFrame(r, f), ox = (k % c) * (r.nx + gap), oy = Math.floor(k / c) * (r.ny + gap);
    for (let y = 0; y < r.ny; y++) rgba.set(im.rgba.subarray(y * r.nx * 4, (y + 1) * r.nx * 4), ((oy + y) * W + ox) * 4);
  });
  return { w: W, h: H, rgba };
}
