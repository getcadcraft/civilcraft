/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site.js — the whole environmental study of a site in one call (0.9 SU.1119, cc-envir; DOM-free; imports shade, epw, pv, utci, solar).
 * Hosts pass masses and a weather file; they get numbers back. Nothing here knows an app.
 *
 *   masses = [{ id, name, pts: [{x,y}], z0 (base level), height }]       plan coordinates: x east, y north; `northAngle` = degrees the plan's +y
 *                                                                         is turned clockwise from true north (0 when the plan is north-up)
 *   skyViewFactor(world, point, normal?) → 0..1   64 rays over the hemisphere, cosine-weighted (open 1); with a surface normal [e,n,u], only the rays that face it
 *   surfacesOf(mass, northAngle) → [{ kind: 'roof'|'wall', edge, tilt, azimuth, area, points: [{x,y,z}] }]
 *   pvForMasses({ epw, masses, northAngle, albedo, losses, inverter, noct, gamma, efficiency = 0.20, roofCoverage = 0.6, wallCoverage = 0.4,
 *                 shading = true }) → [{ id, name, surfaces: [{ kind, edge, tilt, azimuth, area, svf, kWpPerM2, kWh (for the covered share), kWhPerM2 (of panel),
 *                 specific (kWh per kWp), poaKWhm2, shadeLossPct (annual loss against the same surface unshaded), monthly }], roofKWh, wallKWh, totalKWh }]
 *   comfortAtPoints({ epw, masses, northAngle, points: [{ x, y, name }], z = 0, albedo }) → [{ name, svf, open: comfortYear, here: comfortYear, ... }]
 */
import { sunVector } from './solar.js';
import { epwSunDirs } from './epw.js';
import { makeWorld, isLit, litFraction, planDir } from './shade.js';
import { yearYield } from './pv.js';
import { comfortYear } from './utci.js';

const R = Math.PI / 180;

function signedArea(pts) { let a = 0; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j].x * pts[i].y - pts[i].x * pts[j].y; return a / 2; }
function inside(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const a = pts[i], b = pts[j]; if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c; }
  return c;
}

export function skyViewFactor(world, p, normal = null) {
  let sum = 0, tot = 0;
  const NA = 16, alts = [11.25, 33.75, 56.25, 78.75];
  for (const alt of alts) {
    const w = Math.sin(alt * R) * Math.cos(alt * R);   // projected area of the band, up to a constant
    for (let k = 0; k < NA; k++) {
      const az = (k + 0.5) * (360 / NA);
      const dir = sunVector({ azimuth: az, altitude: alt });
      if (normal && dir[0] * normal[0] + dir[1] * normal[1] + dir[2] * normal[2] <= 0) continue;   // only the hemisphere the surface faces
      const lit = isLit(world, p.x, p.y, p.z, dir);
      tot += w; if (lit) sum += w;
    }
  }
  return tot ? sum / tot : 1;
}

export function surfacesOf(m, northAngle = 0) {
  const pts = m.pts, out = [], top = m.z0 + m.height;
  const A = signedArea(pts), sgn = A >= 0 ? 1 : -1;
  // roof: points on a grid inside the footprint (centroid if the grid misses a thin one)
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  const rp = [];
  for (let j = 0; j < 5; j++) for (let i = 0; i < 5; i++) { const x = x0 + ((i + 0.5) / 5) * (x1 - x0), y = y0 + ((j + 0.5) / 5) * (y1 - y0); if (inside(pts, x, y)) rp.push({ x, y, z: top + 1e-4 }); }
  if (!rp.length) rp.push({ x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length, z: top + 1e-4 });
  out.push({ kind: 'roof', edge: -1, tilt: 0, azimuth: 180, area: Math.abs(A), points: rp, normal: [0, 0, 1] });
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy);
    if (L < 1e-9) continue;
    const nx = (sgn * dy) / L, ny = (-sgn * dx) / L;   // outward for either winding
    const az = ((Math.atan2(nx, ny) / R + northAngle) % 360 + 360) % 360;
    const sp = [];
    for (const t of [1 / 6, 1 / 2, 5 / 6]) for (const hh of [0.25, 0.75]) sp.push({ x: a.x + dx * t + nx * 0.02, y: a.y + dy * t + ny * 0.02, z: m.z0 + m.height * hh });
    out.push({ kind: 'wall', edge: i, tilt: 90, azimuth: az, area: L * m.height, points: sp, normal: [nx, ny, 0] });
  }
  return out;
}

export function pvForMasses(o) {
  const { epw, masses } = o, north = o.northAngle || 0, eff = o.efficiency ?? 0.2;
  const suns = epwSunDirs(epw), world = makeWorld(masses.map((m) => ({ id: m.id, pts: m.pts, z0: m.z0, height: m.height })));
  const dirs = suns.map((s) => (s.altitude > 0 ? planDir(s, north) : null));
  const covers = { roof: o.roofCoverage ?? 0.6, wall: o.wallCoverage ?? 0.4 };
  const res = [];
  for (const m of masses) {
    const surfaces = [];
    for (const s of surfacesOf(m, north)) {
      const hourOf = epw.hours;
      const common = { epw, suns, tilt: s.tilt, azimuth: s.azimuth, albedo: o.albedo, losses: o.losses, inverter: o.inverter, noct: o.noct, gamma: o.gamma, kWp: 1 };
      // the sky a surface sees: the mean over its points of the sky view in the half-space it faces (shade on the diffuse part)
      const svf = o.shading === false ? 1 : s.points.reduce((a, p) => a + skyViewFactor(world, p, s.normal), 0) / s.points.length;
      common.svf = svf;
      const litArr = new Float32Array(hourOf.length);
      for (let i = 0; i < hourOf.length; i++) {
        const h = hourOf[i];
        litArr[i] = dirs[i] && (h.dni > 0) && o.shading !== false ? litFraction(world, s.points, dirs[i]) : 1;
      }
      const shaded = yearYield({ ...common, lit: litArr });
      const free = yearYield({ ...common, svf: 1 });
      const kWpPerM2 = eff, covered = s.area * covers[s.kind];
      surfaces.push({
        kind: s.kind, edge: s.edge, tilt: s.tilt, azimuth: s.azimuth, area: s.area, kWpPerM2,
        kWh: shaded.specific * kWpPerM2 * covered, kWhPerM2: shaded.specific * kWpPerM2, svf, specific: shaded.specific, poaKWhm2: shaded.poaKWhm2,
        shadeLossPct: free.kWh > 0 ? (100 * (free.kWh - shaded.kWh)) / free.kWh : 0, monthly: shaded.monthly.map((v) => v * kWpPerM2 * covered),
      });
    }
    const roofKWh = surfaces.filter((s) => s.kind === 'roof').reduce((a, s) => a + s.kWh, 0), wallKWh = surfaces.filter((s) => s.kind === 'wall').reduce((a, s) => a + s.kWh, 0);
    res.push({ id: m.id, name: m.name, surfaces, roofKWh, wallKWh, totalKWh: roofKWh + wallKWh });
  }
  return res;
}

export function comfortAtPoints(o) {
  const { epw, masses } = o, north = o.northAngle || 0, z = o.z ?? 0;
  const suns = epwSunDirs(epw), world = makeWorld(masses.map((m) => ({ id: m.id, pts: m.pts, z0: m.z0, height: m.height })));
  const dirs = suns.map((s) => (s.altitude > 0 ? planDir(s, north) : null));
  const open = comfortYear({ epw, suns, albedo: o.albedo });
  return (o.points || []).map((p) => {
    const here3 = { x: p.x, y: p.y, z: z + 1.1 };   // a standing person's centre
    const svf = skyViewFactor(world, here3);
    const lit = new Float32Array(epw.hours.length);
    for (let i = 0; i < lit.length; i++) lit[i] = dirs[i] && epw.hours[i].dni > 0 ? (isLit(world, here3.x, here3.y, here3.z, dirs[i]) ? 1 : 0) : 1;
    return { name: p.name || '', svf, open, here: comfortYear({ epw, suns, lit, svf, albedo: o.albedo }) };
  });
}
