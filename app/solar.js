/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and field names; the words are the UI's t() keys (solar.*). */
/**
 * solar.js — ground-mounted PV arrays on terrain (0.8 EG.15, CivilCraft side; round 3 session civil_PART_3). DOM-free, no strings. The PV engine itself
 * (modules, the winter sun rule, plane-of-array light, shadows, yield) is BimCraft's, copied byte-identical into ./pv/ by tools/pv/sync.mjs (rule 39);
 * this file adds what only the ground knows: tables follow the terrain, every row is spaced for the ground it actually stands on, steep or kept-out
 * ground is left empty, and the hills on the horizon take the beam they hide.
 *
 *   planGround({ ground, polygon, units, site, module, tilt, azimuth, perRow, stack, orient, gap, colGap, clearance, setback, maxSlope, maxPile, step, keepOut, hours, maxTables })
 *      ground    a surface with elevationAt(x, y) (project units) · polygon [{x,y}] · site { lat, lon, tz?, north? [x,y] (default +Y) }
 *      → { ok, tables: [{ id, col, x, y, z0, corners: [[x,y,z]×4] (project units: lower-left, lower-right, upper-right, upper-left), pileMax, slopeDeg, rise }], count,
 *          modules, kwp, pitch { min, max, mean } (m, row to row), flatPitch (m), skipped { steep, pile, outside, ground }, notes: [{ key, vars }], error? }
 *   moduleGeometry(table, plan) → the modules of one table in mm (for shade and IFC), through pv.js groundLayout
 *   horizonProfile(ground, at, { radius, step, observer }) → { az: [..], el: [..] } the highest terrain angle seen from `at` in each 5° of bearing
 *   yieldGround(plan, { sky, tAmb, losses, inverter, shade }) → { ok, res (pv-yield result), shade { frac, horizon }, notes }
 *
 * Maths (published; nothing copied): the no-shade row rule is the one pv.js uses (Duffie and Beckman, Solar Engineering of Thermal Processes), applied
 * on the real ground: a table of slant length Ls tilted β has its top edge at z0 + Ls·sin β; the sun at the winter solstice (elevation α, azimuth off the
 * rows' normal by Δ) casts a shadow that falls at tan α / cos Δ per unit of height, so the next table's lower edge must stand at least that high:
 * z0' ≥ z_top − (q' − q_top)·cos Δ·… (q measured behind the row). The next row therefore goes as close as the ground lets it: closer on ground that rises
 * behind the table, farther on ground that falls away. A table stands on piles: its plane is raised until every footprint sample is `clearance` below it.
 */
import { STARTER_MODULE, cleanModule, bearing, basisOf, groundLayout, winterPitch, planeNormal } from './pv/pv.js';
import { skyYear, sunGridOf, yieldOf, DEFAULT_LOSSES } from './pv/pv-yield.js';
import { obstructions, tableTris, shadeGrid } from './pv/pv-shade.js';
import { frameOf } from './pv/pv-sun.js';
import { METRES_PER } from './units.js';

const RAD = Math.PI / 180;
const fin = Number.isFinite;
const mPer = (units) => METRES_PER[units] || METRES_PER.ft;

export const DEFAULTS = Object.freeze({ tilt: 25, azimuth: null, perRow: 12, stack: 2, orient: 'portrait', gap: 0.02, colGap: 0.5, clearance: 0.6, setback: 3, maxSlope: 15, maxPile: 2, step: 0.1, hours: 0, maxTables: 4000, keepOutMargin: 1 });

function inPoly(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i], b = poly[j];
    if ((a.y > y) !== (b.y > y) && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}
function distToEdges(poly, x, y) {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[j], b = poly[i], dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy;
    const t = L ? Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L)) : 0;
    best = Math.min(best, Math.hypot(x - (a.x + t * dx), y - (a.y + t * dy)));
  }
  return best;
}

/** Fit a plane z = a + bx + cy by least squares through samples [[x,y,z]]. → { gx, gy } the gradient. */
function gradient(pts) {
  const n = pts.length; let sx = 0, sy = 0, sz = 0; for (const p of pts) { sx += p[0]; sy += p[1]; sz += p[2]; }
  const mx = sx / n, my = sy / n, mz = sz / n; let xx = 0, xy = 0, yy = 0, xz = 0, yz = 0;
  for (const p of pts) { const x = p[0] - mx, y = p[1] - my, z = p[2] - mz; xx += x * x; xy += x * y; yy += y * y; xz += x * z; yz += y * z; }
  const d = xx * yy - xy * xy;
  return Math.abs(d) < 1e-12 ? { gx: 0, gy: 0 } : { gx: (xz * yy - yz * xy) / d, gy: (yz * xx - xz * xy) / d };
}

export function cleanOptions(o = {}) {
  const d = DEFAULTS, num = (v, def, lo, hi) => (fin(Number(v)) && v !== null && v !== '' && Number(v) >= lo && Number(v) <= hi ? Number(v) : def);
  return {
    tilt: num(o.tilt, d.tilt, 0, 60), azimuth: o.azimuth === null || o.azimuth === undefined || o.azimuth === '' ? null : num(o.azimuth, null, 0, 360),
    perRow: Math.round(num(o.perRow, d.perRow, 1, 60)), stack: Math.round(num(o.stack, d.stack, 1, 6)), orient: o.orient === 'landscape' ? 'landscape' : 'portrait',
    gap: num(o.gap, d.gap, 0, 0.2), colGap: num(o.colGap, d.colGap, 0, 5), clearance: num(o.clearance, d.clearance, 0.1, 3), setback: num(o.setback, d.setback, 0, 100),
    maxSlope: num(o.maxSlope, d.maxSlope, 1, 45), maxPile: num(o.maxPile, d.maxPile, 0.3, 10), step: num(o.step, d.step, 0.02, 1), hours: num(o.hours, d.hours, 0, 4),
    maxTables: Math.round(num(o.maxTables, d.maxTables, 1, 20000)), keepOutMargin: num(o.keepOutMargin, d.keepOutMargin, 0, 20),
  };
}

export function planGround(input) {
  const { ground, units = 'ft' } = input, site = input.site, M = mPer(units);
  const o = cleanOptions(input);
  const mod = cleanModule(input.module || STARTER_MODULE);
  if (!mod.ok) return { ok: false, error: 'solar.err.module', tables: [] };
  const module = mod.module;
  const poly = (input.polygon || []).filter((p) => fin(p?.x) && fin(p?.y));
  if (!ground || typeof ground.elevationAt !== 'function') return { ok: false, error: 'solar.err.noground', tables: [] };
  if (poly.length < 3) return { ok: false, error: 'solar.err.region', tables: [] };
  if (!site || !fin(site.lat) || !fin(site.lon)) return { ok: false, error: 'solar.err.nosite', tables: [] };
  const az = o.azimuth ?? (site.lat >= 0 ? 180 : 0);
  const keep = (input.keepOut || []).filter((k) => Array.isArray(k) && k.length >= 3);
  // geometry of one table, metres
  const across0 = o.orient === 'landscape' ? module.lengthMm : module.widthMm, along0 = o.orient === 'landscape' ? module.widthMm : module.lengthMm;
  const A = (o.perRow * across0 + (o.perRow - 1) * o.gap * 1000) / 1000, Ls = (o.stack * along0 + (o.stack - 1) * o.gap * 1000) / 1000;
  const D = Ls * Math.cos(o.tilt * RAD), H = Ls * Math.sin(o.tilt * RAD), tanB = Math.tan(o.tilt * RAD);
  const win = winterPitch({ slantMm: Ls * 1000, tilt: o.tilt, azimuth: az, site, hours: o.hours });
  if (win.error) return { ok: false, error: win.error, tables: [] };
  const dAz = (win.sunAzimuth - az) * RAD, tanE = Math.tan(win.elevation * RAD) / Math.max(0.2, Math.cos(dAz));   // the shadow's drop per metre behind the row
  const flatPitch = win.pitchMm / 1000;
  // frame: q behind the tables (away from the way they face), s along the row
  const nh = bearing(az, site), bx = -nh[0], by = -nh[1], ux = -nh[1], uy = nh[0];   // u is to the right when facing nh
  const P = poly.map((p) => ({ x: p.x * M, y: p.y * M }));
  const at = (s, q) => ({ x: s * ux + q * bx, y: s * uy + q * by });
  const toLocal = (x, y) => ({ s: x * ux + y * uy, q: x * bx + y * by });
  let s0 = Infinity, s1 = -Infinity, q0 = Infinity, q1 = -Infinity;
  for (const p of P) { const l = toLocal(p.x, p.y); s0 = Math.min(s0, l.s); s1 = Math.max(s1, l.s); q0 = Math.min(q0, l.q); q1 = Math.max(q1, l.q); }
  const K = keep.map((k) => k.map((p) => ({ x: p.x * M, y: p.y * M })));
  const zg = (x, y) => { const z = ground.elevationAt(x / M, y / M); return fin(z) ? z * M : null; };
  const skipped = { steep: 0, pile: 0, outside: 0, ground: 0, keep: 0 };
  const ok = (x, y) => inPoly(P, x, y) && distToEdges(P, x, y) >= o.setback - 1e-9;
  const kept = (x, y) => K.some((k) => inPoly(k, x, y) || distToEdges(k, x, y) < o.keepOutMargin);
  /** Try a table whose lower edge middle is at (s, q): → table | { skip: reason }. */
  function tryTable(sc, q) {
    const samples = [], plan = [];
    for (const ds of [-A / 2, 0, A / 2]) for (const dq of [0, D / 3, (2 * D) / 3, D]) {
      const p = at(sc + ds, q + dq);
      if (!ok(p.x, p.y)) return { skip: 'outside' };
      if (K.length && kept(p.x, p.y)) return { skip: 'keep' };
      const z = zg(p.x, p.y);
      if (z === null) return { skip: 'ground' };
      samples.push([p.x, p.y, z]); plan.push(dq);
    }
    const g = gradient(samples), slopeDeg = Math.atan(Math.hypot(g.gx, g.gy)) / RAD;
    if (slopeDeg > o.maxSlope) return { skip: 'steep' };
    let z0 = -Infinity; samples.forEach((p, i) => { z0 = Math.max(z0, p[2] - plan[i] * tanB + o.clearance); });
    const lower = samples.filter((_, i) => plan[i] === 0);
    const pileMax = Math.max(...lower.map((p) => z0 - p[2]));
    if (pileMax > o.maxPile) return { skip: 'pile' };
    const c = (ds, dq, z) => { const p = at(sc + ds, q + dq); return [p.x, p.y, z]; };
    const m = at(sc, q);
    return { sc, q, z0, x: m.x, y: m.y, slopeDeg, pileMax, corners: [c(-A / 2, 0, z0), c(A / 2, 0, z0), c(A / 2, D, z0 + H), c(-A / 2, D, z0 + H)] };
  }
  const tables = []; let col = 0;
  const pitchStats = [];
  for (let sc = s0 + A / 2 + o.setback * 0; sc <= s1 - A / 2 + 1e-9 && tables.length < o.maxTables; sc += A + o.colGap, col++) {
    let q = q0, prev = null;
    while (q <= q1 - D + 1e-9 && tables.length < o.maxTables) {
      const r = tryTable(sc, q);
      if (r.skip) { if (r.skip !== 'outside' && r.skip !== 'ground') skipped[r.skip]++; q += Math.max(o.step * 2.5, 0.25); continue; }
      // the shadow of the table before it must not reach this lower edge
      if (prev) {
        const topZ = prev.z0 + H, qTop = prev.q + D;
        if (q < qTop + 0.02 || r.z0 < topZ - (q - qTop) * tanE - 1e-6) { q += o.step; continue; }
        pitchStats.push(q - prev.q);
      }
      tables.push({ id: 't' + (tables.length + 1), col, ...r }); prev = r;
      q += D + 0.02;
    }
  }
  const toU = (v) => v / M;
  const out = tables.map((tb) => ({ id: tb.id, col: tb.col, x: toU(tb.x), y: toU(tb.y), z0: toU(tb.z0), pileMax: tb.pileMax, slopeDeg: tb.slopeDeg,
    corners: tb.corners.map((c) => [toU(c[0]), toU(c[1]), toU(c[2])]) }));
  const per = o.perRow * o.stack, modules = out.length * per, kwp = Math.round(modules * module.wp / 10) / 100;
  const notes = [];
  if (module.starter) notes.push({ key: 'solar.note.starter' });
  if (skipped.steep) notes.push({ key: 'solar.note.steep', vars: { n: skipped.steep, deg: o.maxSlope } });
  if (skipped.pile) notes.push({ key: 'solar.note.pile', vars: { n: skipped.pile, h: o.maxPile } });
  if (tables.length >= o.maxTables) notes.push({ key: 'solar.note.cap', vars: { n: o.maxTables } });
  const mean = pitchStats.length ? pitchStats.reduce((a, b) => a + b, 0) / pitchStats.length : flatPitch;
  return { ok: true, tables: out, count: out.length, modules, kwp, perTable: per, azimuth: az, options: o, module, site, units,
    pitch: { min: pitchStats.length ? Math.min(...pitchStats) : flatPitch, max: pitchStats.length ? Math.max(...pitchStats) : flatPitch, mean }, flatPitch,
    sun: { elevation: win.elevation, azimuth: win.sunAzimuth }, size: { across: A, slant: Ls, depth: D, height: H }, skipped, notes };
}

/** The modules of one table (mm, the PV engine's axes): as pv.js groundLayout makes them for a single table placed on its piles. */
export function moduleGeometry(table, plan) {
  const M = mPer(plan.units), o = plan.options;
  const mid = table.corners[0].map((v, i) => (v + table.corners[1][i]) / 2);
  const g = groundLayout({ site: plan.site, module: plan.module, orient: o.orient, perRow: o.perRow, stack: o.stack, rows: 1, tilt: o.tilt, azimuth: plan.azimuth, gap: o.gap * 1000,
    origin: [mid[0] * M * 1000, mid[1] * M * 1000, mid[2] * M * 1000], clearance: 0, pitchMm: 1e6 });
  return g.error ? [] : g.modules;
}

/** The highest terrain angle in every 5° of bearing seen from `at` ({x, y} project units) standing `observer` metres above the ground there. */
export function horizonProfile(ground, at, { units = 'ft', radius = 1000, step = 10, observer = 1.5, site = null } = {}) {
  const M = mPer(units), z0 = ground.elevationAt(at.x, at.y);
  const F = frameOf(site || {}), out = { az: [], el: [] };
  if (!fin(z0)) return out;
  for (let a = 0; a < 360; a += 5) {
    const r = a * RAD, dx = F.north[0] * Math.cos(r) + F.east[0] * Math.sin(r), dy = F.north[1] * Math.cos(r) + F.east[1] * Math.sin(r);
    let best = 0;
    for (let d = step; d <= radius; d += step) {
      const z = ground.elevationAt(at.x + (dx * d) / M, at.y + (dy * d) / M);
      if (!fin(z)) break;
      best = Math.max(best, Math.atan2(z * M - (z0 * M + observer), d) / RAD);
    }
    out.az.push(a); out.el.push(best);
  }
  return out;
}

/** Light from the sun and the energy of the year; the tables shade one another and the horizon takes what it hides. */
export function yieldGround(plan, o = {}) {
  if (!plan?.ok || !plan.count) return { ok: false, error: 'solar.err.noarray' };
  const site = plan.site, opt = plan.options, sky = o.sky || { mode: 'clear' };
  const months = skyYear(site, sky, { tz: site.tz });
  const mods = [], tris = [];
  for (const tb of plan.tables) { mods.push(...moduleGeometry(tb, plan)); const M = mPer(plan.units); tris.push({ owner: null, tris: tableTris(tb.corners.map((c) => c.map((v) => v * M * 1000))) }); }
  const normal = planeNormal(opt.tilt, plan.azimuth, site);
  let frac = null, shadeInfo = null, horizon = null;
  if (o.shading !== false) {
    const sg = sunGridOf(months), r = shadeGrid(mods, normal, sg, obstructions(tris), { owner: null, perModule: 2, maxModules: o.maxModules || 400 });
    frac = r.frac; shadeInfo = { samples: r.samples, rays: r.rays };
    if (o.ground) {
      const c = plan.tables.reduce((a, t) => ({ x: a.x + t.x / plan.tables.length, y: a.y + t.y / plan.tables.length }), { x: 0, y: 0 });
      horizon = horizonProfile(o.ground, c, { units: plan.units, site, radius: o.horizonRadius || 1500 });
      if (horizon.az.length) {
        const hAt = (az) => horizon.el[Math.round((((az % 360) + 360) % 360) / 5) % 72];
        for (let m = 0; m < 12; m++) for (let h = 0; h < 24; h++) { const s = sg[m]?.[h]; if (s && frac[m][h] !== null && s.alt < hAt(s.az)) frac[m][h] = 1; }
      }
    }
  }
  const array = { id: 'ground', name: 'Ground array', module: plan.module, modules: mods.length, tilt: opt.tilt, azimuth: plan.azimuth, normal };
  const res = yieldOf({ arrays: [array], site, sky, tAmb: o.tAmb ?? 20, albedo: o.albedo ?? 0.2, losses: o.losses || DEFAULT_LOSSES, inverter: o.inverter || null, shade: frac ? { ground: frac } : {}, months, tz: site.tz });
  return { ok: true, res, shade: { frac, horizon, info: shadeInfo }, notes: res.notes || [] };
}

/** The table list as rows for a CSV: id, column, x, y, base height, lower-edge pile height, ground slope. */
export function tableRows(plan) {
  return plan.tables.map((t) => [t.id, t.col + 1, t.x, t.y, t.z0, t.pileMax, t.slopeDeg]);
}
