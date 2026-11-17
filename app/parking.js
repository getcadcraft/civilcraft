/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: the engine returns codes and numbers; the words are in parking-ui.js and lang/en.json */
/**
 * parking.js — the parking lot generator (0.10 SU.1815, session civil-site-10). No DOM, no project: boundary in, stalls out. The tool (parking-ui.js),
 * the assistant tools (site-gen-agent.js) and bin/test-civilcraft-sitegen.mjs all call this one file.
 *
 *   defaults(units, { region, angle, traffic }) → { stallW, stallL, depth, pitch, aisleW, ... } in project units (parking-tables.js; unverified, see its note)
 *   accessibleCount(total, region, custom) → how many accessible spaces a lot of `total` spaces needs (US: ADA 2010 Table 208.2)
 *   layout(boundary, opts) → { stalls, aisles, accessAisles, islands, counts, area, orientation, problems, notes, region, tables }
 *       boundary [{x, y}] a simple outline; opts: { angle 90|75|60|45|30|0, traffic 'one'|'two', stallW, stallL, aisleW, orientation (deg, null = tried from the outline's edges),
 *       region 'us'|'custom', islandW, maxRun (stalls between islands, 0 = none), endIslands, entrance {x, y}, accessible (null = the table), holes [[{x, y}]], setback, units }
 *   pickDrains(layout, boundary, spacing) → [{ x, y }] on the aisle centre lines, one per `spacing` of flow path
 *   dishGrade(boundary, drains, { zAt, fallPct, step, units }) → { spots [{ x, y, z }], z0, fallPct, cut, fill, edgeStep, problems }
 *       the surface rises from each drain at fallPct, so every point falls to its nearest drain; z0 is chosen so the mean of the new surface equals the mean of
 *       the ground (a balanced lot); cut and fill are a grid estimate (the project's own volumes() gives the exact figure after the grading is added)
 *   sceneItems(layout, drains, { mmPerUnit }) · scheduleRows(layout) · scheduleCsv(layout)
 *
 * Geometry. Rows run along u in a frame turned by `orientation`. A stall of width W (between its stripes) at angle a to the aisle has pitch W / sin a along the row
 * and a depth (aisle edge to back line) of L sin a + W cos a; at 90 degrees the depth is L. A double-loaded module is stall row + aisle + stall row; where the
 * lot leaves room for one row and an aisle only, a single-loaded band is added at either end. Angled stalls lean the same way on both sides of an aisle (one-way).
 * A stall counts only when it lies wholly inside the boundary (and clear of holes and the setback); an aisle cell is kept only where a stall needs it.
 * Accessible spaces go nearest the entrance, each with an access aisle (two share one, [space][aisle][space]); one in six is a van space. Whether the aisles
 * connect to a street is not checked.
 */
import TABLES from './parking-tables.js';

export const ANGLES = [90, 75, 60, 45, 30, 0];
export const FT = 0.3048;
const EPS = 1e-9;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const r3 = (v) => Math.round(v * 1000) / 1000;
const rad = (d) => (d * Math.PI) / 180;

const conv = (ft, units) => (units === 'm' ? Math.round(ft * FT * 20) / 20 : ft);   // metres rounded to 5 cm

export function regionOf(region) { return TABLES.regions[region] || TABLES.regions.us; }

export function defaults(units = 'ft', { region = 'us', angle = 90, traffic = null } = {}) {
  const R = regionOf(region), a = ANGLES.includes(angle) ? angle : 90;
  const tr = traffic || (a === 90 ? 'two' : 'one'), row = R.aisle.ftByAngle[String(a)];
  const wFt = a === 0 ? R.stall.parallelWFt : R.stall.wFt, lFt = a === 0 ? R.stall.parallelLFt : R.stall.lFt;
  return { angle: a, traffic: tr, stallW: conv(wFt, units), stallL: conv(lFt, units), aisleW: conv(tr === 'two' ? row.two : row.one, units),
    islandW: conv(6, units), maxRun: 10, endIslands: true, fallPct: 1.5, drainSpacing: conv(100, units), setback: 0 };
}

/** The accessible spaces a lot of `total` spaces needs. */
export function accessibleCount(total, region = 'us', custom = null) {
  if (!(total > 0)) return 0;
  const A = regionOf(region).accessible;
  if (region === 'custom' || !A.total) { const c = { ...A, ...(custom || {}) }; return Math.max(c.min || 0, Math.ceil((total * (c.percent || 0)) / 100)); }
  for (const [upTo, n] of A.total) if (total <= upTo) return n;
  if (total <= A.over500.to) return Math.ceil((total * A.over500.percent) / 100);
  return A.over1000.base + Math.ceil((total - 1000) / A.over1000.per);
}
export const vanCount = (n, region = 'us') => (n > 0 ? Math.ceil(n / regionOf(region).accessible.vanOneIn) : 0);

// ------------------------------------------------------------------ small geometry
const area2 = (P) => { let a = 0; for (let i = 0, j = P.length - 1; i < P.length; j = i++) a += (P[j].x + P[i].x) * (P[j].y - P[i].y); return -a / 2; };
export const polyArea = (P) => Math.abs(area2(P));
function pointIn(x, y, P) {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    if ((P[i].y > y) !== (P[j].y > y) && x < ((P[j].x - P[i].x) * (y - P[i].y)) / (P[j].y - P[i].y) + P[i].x) c = !c;
  }
  return c;
}
function segCross(a, b, c, d) {
  const d1x = b.x - a.x, d1y = b.y - a.y, d2x = d.x - c.x, d2y = d.y - c.y, den = d1x * d2y - d1y * d2x;
  if (Math.abs(den) < EPS) return false;
  const t = ((c.x - a.x) * d2y - (c.y - a.y) * d2x) / den, u = ((c.x - a.x) * d1y - (c.y - a.y) * d1x) / den;
  return t > 1e-7 && t < 1 - 1e-7 && u > 1e-7 && u < 1 - 1e-7;
}
function distSeg(p, a, b) {
  const dx = b.x - a.x, dy = b.y - a.y, l2 = dx * dx + dy * dy;
  const t = l2 < EPS ? 0 : Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / l2));
  return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
}
const centroid = (P) => ({ x: P.reduce((s, p) => s + p.x, 0) / P.length, y: P.reduce((s, p) => s + p.y, 0) / P.length });
const shrink = (P, f = 0.999) => { const c = centroid(P); return P.map((p) => ({ x: c.x + (p.x - c.x) * f, y: c.y + (p.y - c.y) * f })); };
const toFrame = (p, ph) => ({ x: p.x * Math.cos(ph) + p.y * Math.sin(ph), y: -p.x * Math.sin(ph) + p.y * Math.cos(ph) });
const fromFrame = (p, ph) => ({ x: p.x * Math.cos(ph) - p.y * Math.sin(ph), y: p.x * Math.sin(ph) + p.y * Math.cos(ph) });

/** Is the convex polygon Q wholly inside `B` (outline) and clear of `holes`, at least `setback` from the outline? */
function fits(Q, B, holes, setback) {
  const q = shrink(Q);
  for (const p of q) if (!pointIn(p.x, p.y, B)) return false;
  for (let i = 0; i < B.length; i++) {
    const a = B[i], b = B[(i + 1) % B.length];
    for (let k = 0; k < 4; k++) if (segCross(a, b, q[k], q[(k + 1) % 4])) return false;
    if (pointIn(a.x, a.y, q)) return false;
    if (setback > 0) { for (const p of Q) if (distSeg(p, a, b) < setback - 1e-9) return false; for (let k = 0; k < 4; k++) if (distSeg(a, Q[k], Q[(k + 1) % 4]) < setback - 1e-9) return false; }
  }
  for (const H of holes) {
    for (const p of H) if (pointIn(p.x, p.y, q)) return false;
    for (const p of q) if (pointIn(p.x, p.y, H)) return false;
    for (let i = 0; i < H.length; i++) for (let k = 0; k < 4; k++) if (segCross(H[i], H[(i + 1) % H.length], q[k], q[(k + 1) % 4])) return false;
  }
  return true;
}

// ------------------------------------------------------------------ the search
function geom(o) {
  const a = o.angle, s = Math.sin(rad(a)), c = Math.cos(rad(a));
  if (a === 0) return { pitch: o.stallL, D: o.stallW, shear: 0 };
  if (a === 90) return { pitch: o.stallW, D: o.stallL, shear: 0 };
  return { pitch: o.stallW / s, D: o.stallL * s + o.stallW * c, shear: (o.stallL * s + o.stallW * c) / Math.tan(rad(a)) };
}
const stallPoly = (u0, va, g, dir) => [{ x: u0, y: va }, { x: u0 + g.pitch, y: va }, { x: u0 + g.pitch + g.shear, y: va + dir * g.D }, { x: u0 + g.shear, y: va + dir * g.D }];

/** Place bands for one frame and offsets; returns { bands, count } where each band = { kind, v0, cols: [{ c, u0, aisle, lower, upper }] }. */
function place(B, holes, g, o, vStart, uStart, bb) {
  const A = o.aisleW, H = 2 * g.D + A, bands = [];
  const colsFor = (kind, v0) => {
    const cols = [];
    let n = 0;
    const lowerVa = kind === 'double' ? v0 + g.D : kind === 'singleTop' ? v0 + g.D : null;     // stalls below the aisle edge (extend -v)
    const upperVa = kind === 'double' ? v0 + g.D + A : kind === 'singleBottom' ? v0 + A : null;    // stalls above the aisle edge (extend +v)
    const aLo = kind === 'double' ? v0 + g.D : kind === 'singleTop' ? v0 + g.D : v0, aHi = aLo + A;
    for (let c = 0, u0 = uStart; u0 < bb.maxU + g.pitch; c++, u0 += g.pitch) {
      const cell = [{ x: u0, y: aLo }, { x: u0 + g.pitch, y: aLo }, { x: u0 + g.pitch, y: aHi }, { x: u0, y: aHi }];
      if (u0 + g.pitch < bb.minU - g.shear - g.pitch) continue;
      const lower = lowerVa !== null ? stallPoly(u0, lowerVa, g, -1) : null, upper = upperVa !== null ? stallPoly(u0, upperVa, g, 1) : null;
      const lo = lower && fits(lower, B, holes, o.setback), up = upper && fits(upper, B, holes, o.setback);
      if (!lo && !up) continue;
      if (!fits(cell, B, holes, 0)) continue;   // a stall needs its aisle cell
      cols.push({ c, u0, aisle: cell, lower: lo ? lower : null, upper: up ? upper : null });
      n += (lo ? 1 : 0) + (up ? 1 : 0);
    }
    return { kind, v0, aLo, aHi, cols, n };
  };
  let v0 = vStart, top = null, bottom = null;
  while (v0 < bb.maxV) { const b = colsFor('double', v0); if (b.n) { bands.push(b); top = v0 + H; bottom ??= v0; } v0 += H; }
  if (bands.length) {
    const sb = colsFor('singleBottom', bottom - g.D - A); if (sb.n) bands.unshift(sb);
    const st = colsFor('singleTop', top); if (st.n) bands.push(st);
  }
  return { bands, count: bands.reduce((s, b) => s + b.n, 0) };
}

function candidateAngles(B) {
  const e = [];
  for (let i = 0; i < B.length; i++) { const a = B[i], b = B[(i + 1) % B.length], l = Math.hypot(b.x - a.x, b.y - a.y); if (l > EPS) e.push({ l, d: (((Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI) % 180 + 180) % 180 }); }
  e.sort((x, y) => y.l - x.l);
  const out = [];
  for (const k of e) if (!out.some((d) => Math.abs(d - k.d) < 1 || Math.abs(Math.abs(d - k.d) - 180) < 1)) out.push(k.d);
  if (!out.length) out.push(0);
  return out.slice(0, 8);
}

export function layout(boundary, opts = {}) {
  const units = opts.units === 'm' ? 'm' : 'ft', region = opts.region === 'custom' ? 'custom' : 'us';
  const d = defaults(units, { region, angle: ANGLES.includes(opts.angle) ? opts.angle : 90, traffic: opts.traffic });
  const o = { ...d, ...Object.fromEntries(Object.entries(opts).filter(([, v]) => v !== undefined && v !== null)), units, region };
  if (!ANGLES.includes(o.angle)) o.angle = 90;
  const out = { stalls: [], aisles: [], accessAisles: [], islands: [], counts: { total: 0, standard: 0, accessible: 0, van: 0, accessAisles: 0, islands: 0, required: 0 },
    area: { lot: 0, stalls: 0, aisles: 0, islands: 0, perStall: null }, orientation: null, angle: o.angle, region, problems: [], notes: [], tables: { region, verified: false } };
  const B = (boundary || []).filter((p) => p && fin(p.x) && fin(p.y)).map((p) => ({ x: p.x, y: p.y }));
  if (B.length < 3 || polyArea(B) < EPS) { out.problems.push({ code: 'boundary' }); return out; }
  out.area.lot = polyArea(B);
  const g = geom(o);
  if (!(g.pitch > 0 && g.D > 0 && o.aisleW > 0)) { out.problems.push({ code: 'dims' }); return out; }
  if (o.angle !== 90 && o.angle !== 0 && o.traffic === 'two' && o.aisleW < defaults(units, { region, angle: o.angle, traffic: 'two' }).aisleW - 1e-9) out.notes.push({ code: 'twoway.narrow' });
  const holesW = (o.holes || []).filter((h) => Array.isArray(h) && h.length >= 3);
  const cands = fin(o.orientation) ? [((o.orientation % 180) + 180) % 180] : candidateAngles(B);
  let best = null;
  for (const deg of cands) {
    const ph = rad(deg), Bf = B.map((p) => toFrame(p, ph)), Hf = holesW.map((h) => h.map((p) => toFrame(p, ph)));
    const bb = { minU: Math.min(...Bf.map((p) => p.x)), maxU: Math.max(...Bf.map((p) => p.x)), minV: Math.min(...Bf.map((p) => p.y)), maxV: Math.max(...Bf.map((p) => p.y)) };
    const H = 2 * g.D + o.aisleW;
    for (let kv = 0; kv < 4; kv++) for (let ku = 0; ku < 3; ku++) {
      const r = place(Bf, Hf, g, o, bb.minV - H + (kv * H) / 4, bb.minU - g.pitch + (ku * g.pitch) / 3, bb);
      if (!best || r.count > best.count) best = { ...r, deg, ph, Bf, Hf };
    }
  }
  if (!best || !best.count) { out.problems.push({ code: 'nofit' }); out.orientation = best?.deg ?? 0; return out; }
  out.orientation = r3(best.deg);
  const { ph } = best, W = (poly) => poly.map((p) => { const q = fromFrame(p, ph); return { x: q.x, y: q.y }; });
  // rows: gather stalls per row (band + side) in column order
  const rows = new Map();
  best.bands.forEach((b, bi) => {
    for (const c of b.cols) {
      if (c.lower) (rows.get(bi + ':l') || rows.set(bi + ':l', []).get(bi + ':l')).push({ c: c.c, poly: c.lower, band: bi, side: 'l' });
      if (c.upper) (rows.get(bi + ':u') || rows.set(bi + ':u', []).get(bi + ':u')).push({ c: c.c, poly: c.upper, band: bi, side: 'u' });
    }
  });
  // islands
  const icols = Math.max(1, Math.ceil(o.islandW / g.pitch - 1e-9)), isl = [];
  const islandPoly = (run, side, b) => {
    const first = run[0], last = run[run.length - 1];
    const u0 = first.poly[0].x, u1 = last.poly[1].x, va = first.poly[0].y, vb = first.poly[3].y;
    return [{ x: u0, y: va }, { x: u1, y: va }, { x: u1 + g.shear, y: vb }, { x: u0 + g.shear, y: vb }];
  };
  for (const [key, list] of rows) {
    list.sort((a, b) => a.c - b.c);
    const runs = [];
    for (const s of list) { const r = runs.at(-1); if (r && s.c === r[r.length - 1].c + 1) r.push(s); else runs.push([s]); }
    for (const run of runs) {
      const mark = new Set();
      if (o.endIslands && run.length >= icols * 2 + 2) { for (let k = 0; k < icols; k++) { mark.add(k); mark.add(run.length - 1 - k); } }
      if (o.maxRun > 0) {
        let n = 0;
        for (let k = 0; k < run.length; k++) {
          if (mark.has(k)) { n = 0; continue; }
          n++;
          if (n === o.maxRun && k + icols < run.length - (o.endIslands ? icols : 0) - 1) { for (let q = 1; q <= icols; q++) mark.add(k + q); k += icols; n = 0; }
        }
      }
      for (const k of [...mark]) run[k].island = true;
      let cur = [];
      const flush = () => { if (cur.length) { isl.push({ poly: islandPoly(cur, cur[0].side), cols: cur.length }); cur = []; } };
      for (const s of run) { if (s.island) cur.push(s); else flush(); }
      flush();
    }
  }
  let stalls = [];
  for (const list of rows.values()) for (const s of list) if (!s.island) stalls.push(s);
  stalls.sort((a, b) => a.band - b.band || (a.side < b.side ? -1 : 1) || a.c - b.c);
  // accessible spaces, nearest the entrance
  const ent = o.entrance && fin(o.entrance.x) ? toFrame(o.entrance, ph) : toFrame(B[0], ph);
  const key = (s) => s.band + s.side;
  const byRow = new Map();
  for (const s of stalls) (byRow.get(key(s)) || byRow.set(key(s), new Map()).get(key(s))).set(s.c, s);
  const dist = (s) => { const c = centroid(s.poly); return Math.hypot(c.x - ent.x, c.y - ent.y); };
  const order = [...stalls].sort((a, b) => dist(a) - dist(b));
  const N = stalls.length;
  const assign = (n) => {
    const used = new Set(), groups = [], acc = [], aisles = [];
    let left = n;
    for (const s of stalls) { s.kind = 'standard'; delete s.aisle; }
    const free = (x) => x && !used.has(x) && !x.aisle;
    while (left > 0) {
      let done = false;
      for (const s of order) {
        if (!free(s)) continue;
        const row = byRow.get(key(s)), n1 = row.get(s.c + 1), n2 = row.get(s.c + 2), p1 = row.get(s.c - 1);
        if (left >= 2 && free(n1) && free(n2)) { acc.push(s, n2); aisles.push(n1); used.add(s); used.add(n1); used.add(n2); left -= 2; done = true; break; }
        if (free(n1)) { acc.push(s); aisles.push(n1); used.add(s); used.add(n1); left -= 1; done = true; break; }
        if (free(p1)) { acc.push(s); aisles.push(p1); used.add(s); used.add(p1); left -= 1; done = true; break; }
      }
      if (!done) break;
    }
    for (const s of acc) s.kind = 'accessible';
    for (const s of aisles) { s.aisle = true; s.kind = 'aisle'; }
    return { acc, aisles };
  };
  let need = fin(o.accessible) && o.accessible >= 0 ? Math.floor(o.accessible) : accessibleCount(N, region, o.custom), picked = assign(need);
  if (!(fin(o.accessible) && o.accessible >= 0)) {
    for (let k = 0; k < 4; k++) { const total = N - picked.aisles.length, n2 = accessibleCount(total, region, o.custom); if (n2 === need) break; need = n2; picked = assign(need); }
  }
  const vans = vanCount(picked.acc.length, region);
  [...picked.acc].sort((a, b) => dist(a) - dist(b)).slice(0, vans).forEach((s) => { s.kind = 'van'; });
  out.counts.required = need;
  let id = 1;
  for (const s of stalls) {
    if (s.aisle) { out.accessAisles.push({ poly: W(s.poly) }); continue; }
    out.stalls.push({ id: 's' + id++, poly: W(s.poly), kind: s.kind, row: s.band + (s.side === 'l' ? 'a' : 'b'), col: s.c });
  }
  for (const i of isl) out.islands.push({ poly: W(i.poly), area: polyArea(i.poly), center: (() => { const c = centroid(i.poly), q = fromFrame(c, ph); return { x: q.x, y: q.y }; })(), width: i.cols * g.pitch });
  // aisles: merged runs of aisle cells per band
  best.bands.forEach((b, bi) => {
    let run = [];
    const flush = () => { if (run.length) { const u0 = run[0].aisle[0].x, u1 = run.at(-1).aisle[1].x; out.aisles.push({ band: bi, poly: W([{ x: u0, y: b.aLo }, { x: u1, y: b.aLo }, { x: u1, y: b.aHi }, { x: u0, y: b.aHi }]), from: fromFrame({ x: u0, y: (b.aLo + b.aHi) / 2 }, ph), to: fromFrame({ x: u1, y: (b.aLo + b.aHi) / 2 }, ph) }); run = []; } };
    for (const c of b.cols) { if (run.length && c.c !== run.at(-1).c + 1) flush(); run.push(c); }
    flush();
  });
  const cnt = out.counts;
  cnt.total = out.stalls.length; cnt.accessible = out.stalls.filter((s) => s.kind === 'accessible' || s.kind === 'van').length; cnt.van = out.stalls.filter((s) => s.kind === 'van').length;
  cnt.standard = cnt.total - cnt.accessible; cnt.accessAisles = out.accessAisles.length; cnt.islands = out.islands.length;
  out.area.stalls = out.stalls.reduce((s, x) => s + polyArea(x.poly), 0); out.area.aisles = out.aisles.reduce((s, x) => s + polyArea(x.poly), 0); out.area.islands = out.islands.reduce((s, x) => s + x.area, 0);
  out.area.perStall = cnt.total ? out.area.lot / cnt.total : null;
  // checks
  const A = regionOf(region).accessible, win = (ft) => ft * 12 / 12 * (units === 'm' ? FT : 1), inch = (i) => (i / 12) * (units === 'm' ? FT : 1);
  if (cnt.accessible < cnt.required) out.problems.push({ code: 'access.short', have: cnt.accessible, need: cnt.required });
  if (cnt.accessible) {
    if (o.stallW < inch(A.carWidthIn) - 1e-6) out.problems.push({ code: 'access.width', have: o.stallW, need: inch(A.carWidthIn) });
    if (cnt.van && !(o.stallW >= inch(A.vanWidthIn) - 1e-6) && !(o.stallW >= inch(A.vanWidthNarrowIn) - 1e-6 && o.stallW >= inch(A.aisleWidthVanNarrowIn) - 1e-6)) out.problems.push({ code: 'access.van', have: o.stallW });
    if (o.stallW < inch(A.aisleWidthIn) - 1e-6) out.problems.push({ code: 'access.aisle', have: o.stallW, need: inch(A.aisleWidthIn) });
  }
  void win;
  return out;
}

// ------------------------------------------------------------------ drains and the graded dish
export function pickDrains(lay, boundary, spacing) {
  const pts = [];
  for (const a of lay.aisles) {
    const l = Math.hypot(a.to.x - a.from.x, a.to.y - a.from.y), n = Math.max(1, Math.ceil(l / (spacing / 2)));
    for (let k = 0; k <= n; k++) pts.push({ x: a.from.x + ((a.to.x - a.from.x) * k) / n, y: a.from.y + ((a.to.y - a.from.y) * k) / n });
  }
  if (!pts.length) { const c = centroid(boundary); return [{ x: c.x, y: c.y }]; }
  const out = [];
  for (const p of pts) if (!out.some((q) => Math.hypot(q.x - p.x, q.y - p.y) < spacing)) out.push(p);
  return out;
}

export function dishGrade(boundary, drains, { zAt = null, fallPct = 1.5, step = null, units = 'ft', edgeTol = null, maxSpots = 2500, maxFallPct = null } = {}) {
  const res = { spots: [], z0: null, fallPct, cut: 0, fill: 0, edgeStep: 0, problems: [] };
  if (!drains.length || boundary.length < 3) { res.problems.push({ code: 'nodrain' }); return res; }
  const s = fallPct / 100, area = polyArea(boundary), xs = boundary.map((p) => p.x), ys = boundary.map((p) => p.y);
  const st = Math.max(step || (units === 'm' ? 3 : 10), Math.sqrt(area / maxSpots));
  const dmin = (x, y) => { let m = Infinity; for (const d of drains) m = Math.min(m, Math.hypot(x - d.x, y - d.y)); return m; };
  const zg = (x, y) => { const z = zAt ? zAt(x, y) : null; return fin(z) ? z : null; };
  const pts = [];
  for (let x = Math.min(...xs) + st / 2; x <= Math.max(...xs); x += st) for (let y = Math.min(...ys) + st / 2; y <= Math.max(...ys); y += st) if (pointIn(x, y, boundary)) pts.push({ x, y });
  for (const d of drains) pts.push({ x: d.x, y: d.y });
  const cells = pts.map((p) => ({ ...p, g: zg(p.x, p.y), d: dmin(p.x, p.y) }));
  const known = cells.filter((c) => c.g !== null);
  if (!zAt || !known.length) res.problems.push({ code: 'noground' });
  const meanD = cells.reduce((a, c) => a + c.d, 0) / cells.length, meanG = known.length ? known.reduce((a, c) => a + c.g, 0) / known.length : 0;
  // balanced: mean of z0 + s*d equals the mean ground over the same cells
  const knownMeanD = known.length ? known.reduce((a, c) => a + c.d, 0) / known.length : meanD;
  res.z0 = meanG - s * knownMeanD;
  const cellA = st * st;
  for (const c of cells) {
    const z = res.z0 + s * c.d; c.z = z;
    if (c.g !== null && !drains.some((d) => d.x === c.x && d.y === c.y)) { if (c.g > z) res.cut += (c.g - z) * cellA; else res.fill += (z - c.g) * cellA; }
  }
  res.spots = cells.map((c) => ({ x: c.x, y: c.y, z: c.z }));
  // the edge: the grading object keeps the edge on the ground, so a design far from the ground there is a step
  let worst = 0;
  for (let i = 0; i < boundary.length; i++) {
    const a = boundary[i], b = boundary[(i + 1) % boundary.length], n = Math.max(1, Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / st));
    for (let k = 0; k < n; k++) { const x = a.x + ((b.x - a.x) * k) / n, y = a.y + ((b.y - a.y) * k) / n, g = zg(x, y); if (g !== null) worst = Math.max(worst, Math.abs(res.z0 + s * dmin(x, y) - g)); }
  }
  res.edgeStep = worst;
  const tol = edgeTol ?? (units === 'm' ? 0.3 : 1);
  if (zAt && worst > tol) res.problems.push({ code: 'edgestep', step: worst, tol });
  if (maxFallPct !== null && fallPct > maxFallPct + 1e-9) res.problems.push({ code: 'fall.steep', have: fallPct, limit: maxFallPct });
  if (fallPct < 0.5) res.problems.push({ code: 'fall.flat', have: fallPct });
  return res;
}

// ------------------------------------------------------------------ drawing and schedule
export const LAYER_DEFS = [['C-PARK-STALL', 'pk.layer.stall', 7], ['C-PARK-ADA', 'pk.layer.ada', 5], ['C-PARK-ISLAND', 'pk.layer.island', 3], ['C-PARK-AISLE', 'pk.layer.aisle', 8], ['C-PARK-DRAIN', 'pk.layer.drain', 4], ['C-PARK-TEXT', 'pk.layer.text', 7]];

export function sceneItems(lay, drains = [], { mmPerUnit = 1 } = {}) {
  const k = 1 / mmPerUnit, items = [];
  for (const s of lay.stalls) items.push({ layer: s.kind === 'standard' ? 'C-PARK-STALL' : 'C-PARK-ADA', kind: 'poly', closed: true, pts: s.poly });
  for (const s of lay.accessAisles) {
    items.push({ layer: 'C-PARK-ADA', kind: 'poly', closed: true, pts: s.poly });
    for (let i = 1; i < 4; i++) { const a = s.poly[0], b = s.poly[1], c = s.poly[3], d = s.poly[2], f = i / 4; items.push({ layer: 'C-PARK-ADA', kind: 'poly', pts: [{ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f }, { x: c.x + (d.x - c.x) * f, y: c.y + (d.y - c.y) * f }] }); }
  }
  for (const s of lay.islands) items.push({ layer: 'C-PARK-ISLAND', kind: 'poly', closed: true, pts: s.poly });
  for (const a of lay.aisles) items.push({ layer: 'C-PARK-AISLE', kind: 'poly', pts: [a.from, a.to] });
  for (const d of drains) { const r = 0.6 * k; items.push({ layer: 'C-PARK-DRAIN', kind: 'poly', pts: [{ x: d.x - r, y: d.y - r }, { x: d.x + r, y: d.y + r }] }, { layer: 'C-PARK-DRAIN', kind: 'poly', pts: [{ x: d.x - r, y: d.y + r }, { x: d.x + r, y: d.y - r }] }); }
  for (const s of lay.stalls) if (s.kind !== 'standard') { const c = centroid(s.poly); items.push({ layer: 'C-PARK-TEXT', kind: 'text', x: c.x, y: c.y, rot: 0, mm: 1.6, align: 'center', text: s.kind === 'van' ? 'V' : 'A' }); }
  return items;
}

export function scheduleRows(lay) {
  const c = lay.counts;
  return [['stalls', c.total, lay.area.stalls], ['standard', c.standard, null], ['accessible', c.accessible, null], ['van', c.van, null], ['accessAisles', c.accessAisles, null], ['islands', c.islands, lay.area.islands], ['aisles', lay.aisles.length, lay.area.aisles], ['lot', 1, lay.area.lot]];
}
export function scheduleCsv(lay, units = 'ft') {
  const q = (v) => '"' + String(v ?? '').replace(/"/g, '""') + '"';
  return [['item', 'qty', 'area_' + units + '2'].map(q).join(','), ...scheduleRows(lay).map((r) => [r[0], r[1], r[2] === null ? '' : r3(r[2])].map(q).join(','))].join('\n') + '\n';
}
