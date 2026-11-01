/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geotech.js — geotechnical tools (0.8 EG.9): boring logs, a soil profile between borings, slope stability (Bishop simplified and the ordinary method of
 * slices on circular surfaces, with a search for the critical circle) and settlement (immediate and consolidation, with time). No DOM, no strings (the UI words
 * the codes), no imports. Everything inside is SI: metres, kPa, kN/m³, degrees; the UI converts from the project's feet. Tested by bin/test-civilcraft-geotech.mjs
 * against published worked values. A calculation aid, not a stamped design: the soil numbers are the engineer's from the tests of the site.
 *
 * Published maths (nothing copied):
 *  - Method of slices: Fellenius 1936 (ordinary), Bishop 1955 (simplified): FS = Σ[(c'b + (W − ub)·tanφ') / mα] / Σ W·sinα, mα = cosα + sinα·tanφ'/FS,
 *    solved by iteration; the ordinary method FS = Σ[c'b/cosα + (W·cosα − u·b/cosα)·tanφ'] / Σ W·sinα. Duncan, Wright and Brandon 2014, Soil Strength and Slope Stability, ch. 6.
 *  - Taylor 1937/1948 stability number N = c / (γ·H·FS) for φ = 0 slopes: the checks in the test use his toe-circle values.
 *  - Pore pressure from a water table: u = γw·(z_w − z_base) under it; or r_u = u / (γ·h) (Bishop and Morgenstern 1960).
 *  - Consolidation settlement: S = Σ [Cc·H/(1+e0)]·log10((σ'0 + Δσ') / σ'0) (normally consolidated); Cs in place of Cc up to the preconsolidation σ'c (Terzaghi 1943).
 *  - Time rate: U = 1 − Σ (2/M²)·exp(−M²·Tv), M = π(2m+1)/2; Tv = cv·t / Hdr² (Terzaghi 1943).
 *  - Secondary compression: S = Cα·H/(1+ep)·log10(t₂/t₁) (Mesri 1973).
 *  - Stress under a loaded rectangle corner: Boussinesq as integrated by Newmark 1935 / Fadum 1948; 2:1 spread as the quick rule.
 *  - Elastic settlement of a flexible rectangle on a half-space (Timoshenko and Goodier 1951): corner w = q(1−ν²)/(πE)·[a·ln((b+d)/a) + b·ln((a+d)/b)], d = √(a²+b²).
 *  - SPT corrections: N60 = N·ER/60·CB·CS·CR, (N1)60 = CN·N60, CN = √(Pa/σ'v) ≤ 1.7 (Liao and Whitman 1986; NCEER, Youd et al. 2001).
 *
 *   SOILS                           USCS group symbols [{ code, kind: 'coarse'|'fine'|'organic'|'rock'|'fill', hatch }]; typicalSoil(code) → rough start values (placeholders)
 *   cleanBoring(o, units)           a boring from a file (untrusted) → { id, name, x, y, z (ground), water (depth | null), depth, layers: [{ from, to, soil, unit, desc, gamma, c, phi, su, cc, cs, e0, cv, es, nu, sigmaC, spt: [{ d, n }] }] } | null
 *   boringRows(b) → layers with the elevations (top, bottom) filled in
 *   boringSvg(b, opts) → SVG text of the log (depth, graphic, USCS, description, blow counts, water)
 *   sptCorrect(n, { er, cb, cs, cr, sigma (kPa, effective vertical) }) → { n60, n160, cn }
 *   sectionProfile(borings, line, { width, stations }) → { stations: [d], units: [{ unit, soil, polys }], contacts }   the layers between borings along a line
 *   bishop(geom, circle, { method: 'bishop' | 'ordinary', slices, kh }) → { fs, ok, moment, slices[], problems[] }
 *   searchSlip(geom, { x0, x1, ... }) → { critical: { circle, fs }, grid: [...], tried }
 *   stressRect / stress2to1 / elasticRect / consolidation / timeRate / secondary
 */

const G_W = 9.81;   // kN/m³, unit weight of water
const RAD = Math.PI / 180;
const fin = (v) => Number.isFinite(v);
const num = (v, d = 0) => (fin(Number(v)) && v !== '' && v !== null ? Number(v) : d);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const str = (v, n = 120) => String(v ?? '').slice(0, n);

// ---------------------------------------------------------------------------------------------------------------------------------- soils
export const SOILS = [
  { code: 'GW', kind: 'coarse', hatch: 'gravel' }, { code: 'GP', kind: 'coarse', hatch: 'gravel' },
  { code: 'GM', kind: 'coarse', hatch: 'gravel' }, { code: 'GC', kind: 'coarse', hatch: 'gravel' },
  { code: 'SW', kind: 'coarse', hatch: 'sand' }, { code: 'SP', kind: 'coarse', hatch: 'sand' },
  { code: 'SM', kind: 'coarse', hatch: 'sand' }, { code: 'SC', kind: 'coarse', hatch: 'sand' },
  { code: 'ML', kind: 'fine', hatch: 'silt' }, { code: 'CL', kind: 'fine', hatch: 'clay' },
  { code: 'OL', kind: 'organic', hatch: 'organic' }, { code: 'MH', kind: 'fine', hatch: 'silt' },
  { code: 'CH', kind: 'fine', hatch: 'clay' }, { code: 'OH', kind: 'organic', hatch: 'organic' },
  { code: 'PT', kind: 'organic', hatch: 'organic' }, { code: 'FILL', kind: 'fill', hatch: 'fill' },
  { code: 'ROCK', kind: 'rock', hatch: 'rock' },
];
const SOIL_BY = new Map(SOILS.map((s) => [s.code, s]));
export const soilInfo = (code) => SOIL_BY.get(String(code).toUpperCase()) || null;

// Rough starting values by group (kN/m³, kPa, degrees). Placeholders to be replaced from the site's tests; the UI says so next to them.
const TYPICAL = {
  GW: { gamma: 21, phi: 38, c: 0 }, GP: { gamma: 20, phi: 36, c: 0 }, GM: { gamma: 20, phi: 33, c: 0 }, GC: { gamma: 20, phi: 31, c: 2 },
  SW: { gamma: 20, phi: 34, c: 0 }, SP: { gamma: 19, phi: 32, c: 0 }, SM: { gamma: 19, phi: 30, c: 0 }, SC: { gamma: 19, phi: 28, c: 3 },
  ML: { gamma: 18, phi: 28, c: 3 }, CL: { gamma: 18, phi: 24, c: 8, su: 50 }, OL: { gamma: 16, phi: 20, c: 3, su: 25 }, MH: { gamma: 17, phi: 25, c: 5 },
  CH: { gamma: 17, phi: 20, c: 10, su: 50 }, OH: { gamma: 15, phi: 18, c: 3, su: 20 }, PT: { gamma: 11, phi: 15, c: 2, su: 10 },
  FILL: { gamma: 19, phi: 30, c: 0 }, ROCK: { gamma: 25, phi: 45, c: 100 },
};
export const typicalSoil = (code) => ({ ...(TYPICAL[String(code).toUpperCase()] || { gamma: 18, phi: 28, c: 0 }) });

// ---------------------------------------------------------------------------------------------------------------------------------- borings
const layerOf = (l) => {
  const from = num(l?.from, NaN), to = num(l?.to, NaN);
  if (!fin(from) || !fin(to) || to <= from || from < 0) return null;
  const soil = soilInfo(str(l.soil, 8)) ? str(l.soil, 8).toUpperCase() : 'CL', t = typicalSoil(soil);
  const o = { from, to, soil, unit: str(l.unit || soil, 40), desc: str(l.desc, 300), gamma: clamp(num(l.gamma, t.gamma), 5, 35), c: clamp(num(l.c, t.c), 0, 5000), phi: clamp(num(l.phi, t.phi), 0, 60) };
  for (const k of ['su', 'cc', 'cs', 'e0', 'cv', 'es', 'nu', 'sigmaC', 'gammaSat']) if (l[k] !== undefined && l[k] !== null && l[k] !== '' && fin(Number(l[k]))) o[k] = Number(l[k]);
  if (o.su !== undefined && o.su < 0) delete o.su;
  const spt = Array.isArray(l.spt) ? l.spt.slice(0, 40).map((s) => ({ d: num(s?.d, NaN), n: num(s?.n, NaN) })).filter((s) => fin(s.d) && fin(s.n) && s.d >= from - 1e-9 && s.d <= to + 1e-9 && s.n >= 0 && s.n <= 200) : [];
  if (spt.length) o.spt = spt;
  return o;
};

export function cleanBoring(o, units = 'm') {
  if (!o || typeof o !== 'object') return null;
  const x = num(o.x, NaN), y = num(o.y, NaN), z = num(o.z, 0);
  if (!fin(x) || !fin(y)) return null;
  const layers = (Array.isArray(o.layers) ? o.layers : []).slice(0, 80).map(layerOf).filter(Boolean).sort((a, b) => a.from - b.from);
  // layers must be end to end: a gap is closed by stretching the layer above; an overlap is cut at the layer below's top
  for (let i = 1; i < layers.length; i++) { if (layers[i].from > layers[i - 1].to) layers[i - 1].to = layers[i].from; else if (layers[i].from < layers[i - 1].to) layers[i - 1].to = layers[i].from; }
  const kept = layers.filter((l) => l.to > l.from);
  const depth = Math.max(num(o.depth, 0), kept.length ? kept[kept.length - 1].to : 0);
  const water = o.water === null || o.water === undefined || o.water === '' ? null : num(o.water, NaN);
  return { id: str(o.id, 20), name: str(o.name || 'B', 60), x, y, z, units: units === 'ft' ? 'ft' : 'm', depth, water: fin(water) && water >= 0 ? water : null, date: str(o.date, 20), driller: str(o.driller, 80), layers: kept };
}

export const boringRows = (b) => b.layers.map((l) => ({ ...l, top: b.z - l.from, bottom: b.z - l.to, thickness: l.to - l.from }));

// SPT corrections: Pa = 101.325 kPa. Defaults are the common US safe-hammer values; every factor is the user's.
export function sptCorrect(n, { er = 60, cb = 1, cs = 1, cr = 1, sigma = 100 } = {}) {
  const n60 = n * (er / 60) * cb * cs * cr, cn = Math.min(1.7, Math.sqrt(101.325 / Math.max(sigma, 1)));
  return { n60, cn, n160: n60 * cn };
}

// ---------------------------------------------------------------------------------------------------------------------------------- the log as a picture
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FILL = { gravel: '#c9b79c', sand: '#f0e0a8', silt: '#d8d2c0', clay: '#b9a58f', organic: '#6e6a4a', fill: '#cfcfcf', rock: '#9aa3ad' };
export function boringSvg(b, { scale = 24, units = 'm', labels = {} } = {}) {
  const rows = boringRows(b), top = 56, depth = Math.max(b.depth, 1), h = depth * scale, W = 640, x0 = 70, x1 = 150;
  const L = { depth: 'Depth', soil: 'USCS', desc: 'Description', spt: 'N', water: 'Water', ...labels };
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${top + h + 40}" width="${W}" height="${top + h + 40}" role="img" font-family="sans-serif" font-size="11">`,
    `<text x="8" y="18" font-size="14" font-weight="bold">${esc(b.name)}</text><text x="8" y="34">${esc(`x ${b.x.toFixed(2)}  y ${b.y.toFixed(2)}  z ${b.z.toFixed(2)}`)}</text>`,
    `<text x="${x0 - 6}" y="${top - 6}" text-anchor="end">${esc(L.depth)} (${esc(units)})</text><text x="${x0 + 4}" y="${top - 6}">${esc(L.soil)}</text><text x="${x1 + 10}" y="${top - 6}">${esc(L.desc)}</text><text x="${W - 40}" y="${top - 6}">${esc(L.spt)}</text>`];
  const step = depth > 40 ? 10 : depth > 15 ? 5 : depth > 6 ? 2 : 1;
  for (let d = 0; d <= depth + 1e-9; d += step) out.push(`<line x1="${x0 - 4}" x2="${x0}" y1="${top + d * scale}" y2="${top + d * scale}" stroke="#555"/><text x="${x0 - 7}" y="${top + d * scale + 4}" text-anchor="end">${d}</text>`);
  for (const l of b.layers) {
    const y = top + l.from * scale, hh = (l.to - l.from) * scale, s = soilInfo(l.soil);
    out.push(`<rect x="${x0}" y="${y}" width="${x1 - x0}" height="${hh}" fill="${FILL[s?.hatch] || '#ddd'}" stroke="#333"/>`,
      `<text x="${x0 + 4}" y="${y + Math.min(hh - 3, 14)}">${esc(l.soil)}</text>`,
      `<text x="${x1 + 10}" y="${y + Math.min(hh - 3, 14)}">${esc(l.desc || (labels.uscs && labels.uscs[l.soil]) || '')}</text>`);
    for (const p of l.spt || []) out.push(`<text x="${W - 40}" y="${top + p.d * scale + 4}">${esc(p.n)}</text>`);
  }
  if (b.water !== null && b.water <= depth) out.push(`<path d="M${x0 - 10} ${top + b.water * scale} h10" stroke="#1f6fb2" stroke-width="2"/><path d="M${x0 - 20} ${top + b.water * scale + 6} l10 -6 l10 6z" fill="#1f6fb2"/><text x="${x1 + 10}" y="${top + b.water * scale - 3}" fill="#1f6fb2">${esc(L.water)} ${b.water.toFixed(1)}</text>`);
  out.push('</svg>');
  return out.join('');
}

// ---------------------------------------------------------------------------------------------------------------------------------- soil profile between borings
/**
 * The layers between borings along a line. Each boring's layers are named by `unit` (a unit is one stratum that runs between borings); a unit
 * found in two neighbouring borings has its top and bottom joined by straight lines; a unit found in only one pinches out half way to the next boring.
 * Borings are projected onto the line (station = along, offset = across); those further than `width` from the line are left out.
 * line: [{ x, y }, …] (a polyline); returns { length, borings: [{ id, name, sta, off }], strata: [{ unit, soil, color, polygons: [[{ sta, z }]] }], ground: [{ sta, z }] }
 */
export function projectToLine(line, p) {
  let best = null, run = 0;
  for (let i = 0; i + 1 < line.length; i++) {
    const a = line[i], b = line[i + 1], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy, L = Math.sqrt(L2);
    if (L2 === 0) continue;
    const t = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / L2, 0, 1), qx = a.x + t * dx, qy = a.y + t * dy, off = Math.hypot(p.x - qx, p.y - qy);
    if (!best || off < best.off) best = { sta: run + t * L, off };
    run += L;
  }
  return best;
}

export function sectionProfile(borings, line, { width = Infinity } = {}) {
  const pts = [];
  for (const b of borings) { const q = projectToLine(line, b); if (q && q.off <= width) pts.push({ b, sta: q.sta, off: q.off }); }
  pts.sort((p, q) => p.sta - q.sta);
  let length = 0; for (let i = 0; i + 1 < line.length; i++) length += Math.hypot(line[i + 1].x - line[i].x, line[i + 1].y - line[i].y);
  if (pts.length < 1) return { length, borings: [], strata: [], ground: [], problems: [{ code: 'geo.profile.none' }] };
  // the order of the units, top to bottom, over all borings: first appearance fixes the position
  const order = [];
  for (const p of pts) for (const l of p.b.layers) if (!order.includes(l.unit)) order.push(l.unit);
  const top = (p, unit) => { const l = p.b.layers.find((q) => q.unit === unit); return l ? { top: p.b.z - l.from, bottom: p.b.z - l.to, soil: l.soil } : null; };
  const problems = [];
  const strata = order.map((unit) => ({ unit, soil: null, polygons: [] }));
  for (const s of strata) {
    // where this unit exists: a run of consecutive borings
    const at = pts.map((p) => top(p, s.unit));
    s.soil = at.find(Boolean)?.soil || null;
    // each pair of neighbours (and the free ends): a polygon between the two top lines and the two bottom lines
    const edge = (i) => ({ lo: i > 0 ? (pts[i - 1].sta + pts[i].sta) / 2 : pts[i].sta, hi: i + 1 < pts.length ? (pts[i].sta + pts[i + 1].sta) / 2 : pts[i].sta });
    for (let i = 0; i < pts.length; i++) {
      // from this boring to the next
      if (i + 1 < pts.length) {
        const a = at[i], c = at[i + 1], sa = pts[i].sta, sb = pts[i + 1].sta, mid = (sa + sb) / 2;
        if (a && c) s.polygons.push([{ sta: sa, z: a.top }, { sta: sb, z: c.top }, { sta: sb, z: c.bottom }, { sta: sa, z: a.bottom }]);
        else if (a) s.polygons.push([{ sta: sa, z: a.top }, { sta: mid, z: a.top - (a.top - a.bottom) * 0 + 0 }, { sta: sa, z: a.bottom }].map((q, k) => (k === 1 ? { sta: mid, z: (a.top + a.bottom) / 2 } : q)));
        else if (c) s.polygons.push([{ sta: sb, z: c.top }, { sta: mid, z: (c.top + c.bottom) / 2 }, { sta: sb, z: c.bottom }]);
      }
    }
    void edge;
  }
  const ground = pts.map((p) => ({ sta: p.sta, z: p.b.z }));
  const water = pts.filter((p) => p.b.water !== null).map((p) => ({ sta: p.sta, z: p.b.z - p.b.water }));
  return { length, borings: pts.map((p) => ({ id: p.b.id, name: p.b.name, sta: p.sta, off: p.off, depth: p.b.depth, z: p.b.z })), strata, ground, water, problems };
}

/** The elevation of the top of every unit at one station of a profile: [{ unit, soil, top, bottom }] top to bottom (the stack the slope code reads). */
export function stackAt(profile, sta) {
  const out = [];
  for (const s of profile.strata) {
    for (const poly of s.polygons) {
      const xs = poly.map((q) => q.sta), lo = Math.min(...xs), hi = Math.max(...xs);
      if (sta < lo - 1e-9 || sta > hi + 1e-9) continue;
      const cuts = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], c = poly[(i + 1) % poly.length];
        if (Math.abs(a.sta - c.sta) < 1e-12) continue;
        const t = (sta - a.sta) / (c.sta - a.sta);
        if (t >= -1e-9 && t <= 1 + 1e-9) cuts.push(a.z + t * (c.z - a.z));
      }
      if (cuts.length >= 2) { out.push({ unit: s.unit, soil: s.soil, top: Math.max(...cuts), bottom: Math.min(...cuts) }); break; }
    }
  }
  return out.sort((p, q) => q.top - p.top);
}

export function profileSvg(profile, { vx = 1, width = 700, height = 300, title = '' } = {}) {
  void vx;
  const zs = profile.strata.flatMap((s) => s.polygons.flat().map((q) => q.z));
  if (!zs.length) return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 40"><text x="8" y="24">${esc(title)}</text></svg>`;
  const zmin = Math.min(...zs), zmax = Math.max(...zs), L = Math.max(profile.length, 1e-6), m = 30;
  const X = (s) => m + (s / L) * (width - 2 * m), Y = (z) => m + ((zmax - z) / Math.max(zmax - zmin, 1e-6)) * (height - 2 * m);
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" font-family="sans-serif" font-size="11">`, `<text x="8" y="16" font-weight="bold">${esc(title)}</text>`];
  for (const s of profile.strata) {
    const fill = FILL[soilInfo(s.soil)?.hatch] || '#ddd';
    for (const poly of s.polygons) out.push(`<path d="M${poly.map((q) => `${X(q.sta).toFixed(1)} ${Y(q.z).toFixed(1)}`).join(' L')}Z" fill="${fill}" stroke="#444" stroke-width="0.7"/>`);
  }
  if (profile.water?.length > 1) out.push(`<path d="M${profile.water.map((q) => `${X(q.sta).toFixed(1)} ${Y(q.z).toFixed(1)}`).join(' L')}" fill="none" stroke="#1f6fb2" stroke-width="1.5" stroke-dasharray="5 3"/>`);
  for (const b of profile.borings) out.push(`<line x1="${X(b.sta)}" x2="${X(b.sta)}" y1="${Y(b.z)}" y2="${Y(b.z - b.depth)}" stroke="#222" stroke-width="2"/><text x="${X(b.sta)}" y="${Y(b.z) - 4}" text-anchor="middle">${esc(b.name)}</text>`);
  out.push('</svg>');
  return out.join('');
}

// ---------------------------------------------------------------------------------------------------------------------------------- slope stability
/**
 * geom = {
 *   ground: [{ x, z }] left to right (the slope face may fall either way; the code mirrors it so the sliding mass moves to +x),
 *   layers: [{ top: [{ x, z }] | number (a level), gamma, c, phi, cu?, name }]  top to bottom; a layer runs from its top down to the next layer's top (the last one to `floor`)
 *   water:  [{ x, z }] | number | null   the water table (or a level)
 *   ru:     pore pressure ratio, used where there is no water table (default 0)
 *   surcharge: [{ x0, x1, q }]  kPa on the ground
 *   floor:  the lowest elevation a circle may reach
 * }
 * A layer with `cu` (undrained strength) is run as c = cu, φ = 0.
 */
const interp = (poly, x) => {
  if (typeof poly === 'number') return poly;
  const n = poly.length;
  if (x <= poly[0].x) return poly[0].z;
  if (x >= poly[n - 1].x) return poly[n - 1].z;
  let lo = 0, hi = n - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (poly[m].x <= x) lo = m; else hi = m; }
  const a = poly[lo], b = poly[hi];
  return b.x === a.x ? b.z : a.z + ((x - a.x) / (b.x - a.x)) * (b.z - a.z);
};

export function mirrorGeom(geom) {
  const flip = (p) => (typeof p === 'number' || !p ? p : p.map((q) => ({ x: -q.x, z: q.z })).reverse());
  return { ...geom, ground: flip(geom.ground), layers: geom.layers.map((l) => ({ ...l, top: flip(l.top) })), water: flip(geom.water), surcharge: (geom.surcharge || []).map((s) => ({ ...s, x0: -s.x1, x1: -s.x0 })), mirrored: !geom.mirrored };
}
export const faceRight = (geom) => {
  const g = geom.ground;
  return g[0].z >= g[g.length - 1].z;   // the ground falls toward +x
};

function circleGround(geom, c) {
  // the lower arc meets the ground where ground(x) = zc − √(R² − (x − xc)²); scan, then refine by bisection
  const gx = geom.ground, xa = Math.max(gx[0].x, c.xc - c.R), xb = Math.min(gx[gx.length - 1].x, c.xc + c.R), n = 400;
  const f = (x) => interp(gx, x) - (c.zc - Math.sqrt(Math.max(0, c.R * c.R - (x - c.xc) ** 2)));   // > 0 where the ground is above the arc (inside)
  const roots = []; let px = xa, pf = f(xa);
  for (let i = 1; i <= n; i++) {
    const x = xa + ((xb - xa) * i) / n, v = f(x);
    if ((pf > 0) !== (v > 0)) { let lo = px, hi = x; for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if ((f(lo) > 0) === (f(m) > 0)) lo = m; else hi = m; } roots.push({ x: (lo + hi) / 2, into: v > 0 }); }
    px = x; pf = v;
  }
  return { roots, inside0: f(xa) > 0, inside1: f(xb) > 0, xa, xb };
}

/** Factor of safety of one circle. */
export function bishop(geom0, circle, { method = 'bishop', slices = 50, kh = 0, tol = 1e-5 } = {}) {
  const geom = faceRight(geom0) ? geom0 : mirrorGeom(geom0), c = geom0 === geom ? circle : (faceRight(geom0) ? circle : { xc: -circle.xc, zc: circle.zc, R: circle.R });
  const r = circleGround(geom, c), problems = [];
  if (r.inside0) return { fs: NaN, ok: false, slices: [], problems: [{ code: 'geo.slope.nocut' }] };   // starts inside the soil at the section's edge: runs off it
  // the slip surface is the arc between the first and last crossing of the ground by the lower arc (the longest span of ground above the arc)
  // both ends must be real crossings of the ground: a circle that runs off the edge of the section is not a slip surface
  let xl = null, xr = null;
  // entry = the first crossing into the soil, exit = the next crossing out of it (the surface leaves the section at its first exit)
  { const a = r.roots.findIndex((q) => q.into), e = a >= 0 ? r.roots.findIndex((q, i) => i > a && !q.into) : -1; if (a >= 0 && e > a) { xl = r.roots[a].x; xr = r.roots[e].x; } }
  if (xl === null || xr - xl < 1e-6) return { fs: NaN, ok: false, slices: [], problems: [{ code: 'geo.slope.nocut' }] };
  // slices of equal arc angle (not equal width): the arc is steep at its ends and equal widths lose accuracy there
  const n = Math.max(10, Math.min(400, slices | 0)), S = [];
  const th0 = Math.asin(clamp((xl - c.xc) / c.R, -1, 1)), th1 = Math.asin(clamp((xr - c.xc) / c.R, -1, 1)), xAt = (i) => c.xc + c.R * Math.sin(th0 + ((th1 - th0) * i) / n);
  const layerAt = (x, z) => {
    for (let i = geom.layers.length - 1; i >= 0; i--) if (z <= interp(geom.layers[i].top, x) + 1e-12 || i === 0) return geom.layers[i];
    return geom.layers[0];
  };
  const tops = (x) => geom.layers.map((l) => Math.min(interp(l.top, x), interp(geom.ground, x)));
  for (let i = 0; i < n; i++) {
    const xa = xAt(i), b = xAt(i + 1) - xa, x = xa + b / 2, zg = interp(geom.ground, x), dxc = x - c.xc, h = c.R * c.R - dxc * dxc;
    if (h < 0) continue;
    const zb = c.zc - Math.sqrt(h);
    if (zb >= zg - 1e-9) continue;
    if (zb < geom.floor - 1e-9) problems.push({ code: 'geo.slope.floor' });
    // weight: the thickness of each layer between the base and the ground
    const t = tops(x); let W = 0, zsum = 0;
    for (let k = 0; k < geom.layers.length; k++) {
      const hi = Math.min(t[k], zg), lo = k + 1 < geom.layers.length ? Math.min(t[k + 1], zg) : -Infinity, a = Math.max(lo, zb), top = hi;
      if (top > a) { const w = geom.layers[k].gamma * (top - a) * b; W += w; zsum += w * (top + a) / 2; }
    }
    let q = 0; for (const s of geom.surcharge || []) if (x >= s.x0 && x <= s.x1) q += s.q * b;
    const Wt = W + q, zcg = Wt > 0 ? (zsum + q * zg) / Wt : zb;
    const lay = layerAt(x, zb + 1e-9);
    const cc = lay.cu !== undefined ? lay.cu : lay.c, ph = lay.cu !== undefined ? 0 : lay.phi;
    const sinA = -dxc / c.R, cosA = Math.sqrt(Math.max(0, 1 - sinA * sinA));
    let u = 0;
    if (geom.water !== undefined && geom.water !== null) { const zw = interp(geom.water, x); if (zw > zb) u = G_W * (zw - zb); }
    else if (geom.ru) u = geom.ru * (W / b);
    S.push({ x, b, zb, zg, W: Wt, sinA, cosA, c: cc, phi: ph, u, zcg });
  }
  if (S.length < 3) return { fs: NaN, ok: false, slices: S, problems: [{ code: 'geo.slope.nocut' }] };
  let drive = 0; for (const s of S) { drive += s.W * s.sinA; if (kh) drive += (kh * s.W * (c.zc - s.zcg)) / c.R; }
  if (drive <= 1e-9) return { fs: Infinity, ok: true, slices: S, moment: drive, problems: [{ code: 'geo.slope.nodrive' }], xl, xr };
  let fs;
  if (method === 'ordinary') {
    let res = 0; for (const s of S) res += (s.c * s.b) / s.cosA + Math.max(0, s.W * s.cosA - (s.u * s.b) / s.cosA) * Math.tan(s.phi * RAD);
    fs = res / drive;
  } else {
    fs = 1.5;
    for (let it = 0; it < 200; it++) {
      let res = 0, bad = false;
      for (const s of S) {
        const m = s.cosA + (s.sinA * Math.tan(s.phi * RAD)) / fs;
        if (m < 0.2) bad = true;
        res += (s.c * s.b + Math.max(0, s.W - s.u * s.b) * Math.tan(s.phi * RAD)) / Math.max(m, 1e-6);
      }
      const next = res / drive;
      if (bad && !problems.some((p) => p.code === 'geo.slope.ma')) problems.push({ code: 'geo.slope.ma' });
      if (Math.abs(next - fs) < tol) { fs = next; break; }
      fs = next;
    }
  }
  return { fs, ok: fin(fs), slices: S, moment: drive, problems, xl, xr, mirrored: !!geom.mirrored };
}

/**
 * Search the critical circle: a grid of centres above the ground, for each a fan of radii (every circle that reaches the ground and stays above
 * `floor`), keeping the smallest FS; then the grid is refined around the best three times.
 *   opts: { x0, x1 (centre range), z0, z1, nx, nz, nr, method, slices, kh, entry: [xa, xb] (circle must enter/exit within), minDepth }
 */
export function searchSlip(geom0, opts = {}) {
  const geom = faceRight(geom0) ? geom0 : mirrorGeom(geom0), g = geom.ground, xs = g.map((p) => p.x), zs = g.map((p) => p.z);
  const xmin = Math.min(...xs), xmax = Math.max(...xs), zmax = Math.max(...zs), zmin = Math.min(...zs), H = zmax - zmin || 1;
  const floor = geom.floor ?? zmin - H;
  let bx0 = opts.x0 ?? xmin, bx1 = opts.x1 ?? xmax, bz0 = opts.z0 ?? zmax, bz1 = opts.z1 ?? zmax + 2.5 * H;
  if (geom !== geom0 && opts.x0 !== undefined) { bx0 = -opts.x1; bx1 = -opts.x0; }
  const nx = opts.nx ?? 14, nz = opts.nz ?? 10, nr = opts.nr ?? 14, method = opts.method || 'bishop', slices = opts.slices ?? 40;
  const grid = []; let best = null, tried = 0;
  const gg = { ...geom, floor };
  const scan = (x0, x1, z0, z1, kx, kz, record) => {
    for (let i = 0; i <= kx; i++) for (let j = 0; j <= kz; j++) {
      const xc = x0 + ((x1 - x0) * i) / kx, zc = z0 + ((z1 - z0) * j) / kz;
      let cellBest = null;
      // radii from the one that just reaches the floor down to the smallest that cuts the ground
      const rMax = zc - floor, rMin = Math.max(zc - zmax, 0.05 * H) + 1e-3;
      if (rMax <= rMin) continue;
      const radii = [];
      for (let k = 0; k < nr; k++) radii.push(rMin + ((rMax - rMin) * (k + 0.5)) / nr);
      for (const p of g) { const d = Math.hypot(p.x - xc, p.z - zc); for (const f of [0.999, 1.001]) if (d * f > rMin && d * f < rMax) radii.push(d * f); }   // circles through the face's corners (the toe)
      radii.push(rMax * 0.999);
      for (const R of radii) {
        tried++;
        const circle = { xc, zc, R }, r = bishop(gg, circle, { method, slices, kh: opts.kh || 0 });
        if (!r.ok || !fin(r.fs) || r.fs <= 0) continue;
        if (opts.entry && (r.xl < opts.entry[0] || r.xr > opts.entry[1])) continue;
        if (r.problems.some((p) => p.code === 'geo.slope.floor')) continue;
        if (!cellBest || r.fs < cellBest.fs) cellBest = { xc, zc, R, fs: r.fs, xl: r.xl, xr: r.xr };
      }
      if (cellBest) { if (record) grid.push({ xc, zc, fs: cellBest.fs }); if (!best || cellBest.fs < best.fs) best = cellBest; }
    }
  };
  scan(bx0, bx1, bz0, bz1, nx, nz, true);
  for (let round = 0; round < 4 && best; round++) {
    const sx = (bx1 - bx0) / nx, sz = (bz1 - bz0) / nz, cx = best.xc, cz = best.zc;
    bx0 = cx - sx; bx1 = cx + sx; bz0 = Math.max(cz - sz, zmax + 0.01 * H); bz1 = cz + sz;
    scan(bx0, bx1, bz0, bz1, 8, 8, false);
    // refine the radius around the best too
    for (let k = -6; k <= 6; k++) {
      const R = best.R + k * 0.01 * best.R, circle = { xc: best.xc, zc: best.zc, R }, r = bishop(gg, circle, { method, slices, kh: opts.kh || 0 }); tried++;
      if (r.ok && fin(r.fs) && r.fs > 0 && !r.problems.some((p) => p.code === 'geo.slope.floor') && r.fs < best.fs) best = { xc: best.xc, zc: best.zc, R, fs: r.fs, xl: r.xl, xr: r.xr };
    }
  }
  if (!best) return { critical: null, grid, tried, problems: [{ code: 'geo.slope.nocircle' }] };
  const final = bishop(gg, best, { method, slices: Math.max(slices, 80), kh: opts.kh || 0 });
  const back = (cc) => (geom === geom0 ? cc : { ...cc, xc: -cc.xc, xl: -cc.xr, xr: -cc.xl });
  return { critical: { circle: { xc: back(best).xc, zc: best.zc, R: best.R }, fs: final.fs, xl: back(best).xl, xr: back(best).xr, problems: final.problems }, grid: grid.map((q) => (geom === geom0 ? q : { ...q, xc: -q.xc })), tried, floor };
}

/** The slope as a picture: ground, layers, water, the critical circle's arc and the slices. */
export function slopeSvg(geom, result, { width = 700, height = 380 } = {}) {
  const xs = geom.ground.map((p) => p.x), zs = geom.ground.map((p) => p.z), floor = geom.floor ?? Math.min(...zs) - 5;
  const c = result?.critical?.circle;
  const x0 = Math.min(...xs, c ? c.xc - c.R : Infinity), x1 = Math.max(...xs, c ? c.xc + c.R : -Infinity), z1 = Math.max(...zs, c ? c.zc : -Infinity), z0 = floor, m = 24;
  const sc = Math.min((width - 2 * m) / (x1 - x0 || 1), (height - 2 * m) / (z1 - z0 || 1)), X = (x) => m + (x - x0) * sc, Y = (z) => m + (z1 - z) * sc;
  const out = [`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" font-family="sans-serif" font-size="11">`];
  const nx = geom.ground.length;
  out.push(`<path d="M${geom.ground.map((p) => `${X(p.x).toFixed(1)} ${Y(p.z).toFixed(1)}`).join(' L')} L${X(geom.ground[nx - 1].x).toFixed(1)} ${Y(floor).toFixed(1)} L${X(geom.ground[0].x).toFixed(1)} ${Y(floor).toFixed(1)}Z" fill="#e8e0cf" stroke="#333"/>`);
  for (const l of geom.layers.slice(1)) if (typeof l.top !== 'number') out.push(`<path d="M${l.top.map((p) => `${X(p.x).toFixed(1)} ${Y(p.z).toFixed(1)}`).join(' L')}" fill="none" stroke="#8a7d62" stroke-dasharray="4 3"/>`);
  if (geom.water && typeof geom.water !== 'number') out.push(`<path d="M${geom.water.map((p) => `${X(p.x).toFixed(1)} ${Y(p.z).toFixed(1)}`).join(' L')}" fill="none" stroke="#1f6fb2" stroke-width="1.5"/>`);
  if (c) {
    const a0 = Math.atan2(result.critical.xl - c.xc, c.zc - interpZ(geom, result.critical.xl)), a1 = Math.atan2(result.critical.xr - c.xc, c.zc - interpZ(geom, result.critical.xr));
    const pts = []; for (let i = 0; i <= 60; i++) { const a = a0 + ((a1 - a0) * i) / 60; pts.push(`${X(c.xc + c.R * Math.sin(a)).toFixed(1)} ${Y(c.zc - c.R * Math.cos(a)).toFixed(1)}`); }
    out.push(`<path d="M${pts.join(' L')}" fill="none" stroke="#c0392b" stroke-width="2"/><circle cx="${X(c.xc)}" cy="${Y(c.zc)}" r="3" fill="#c0392b"/>`);
    out.push(`<text x="${m}" y="16" font-weight="bold">FS ${result.critical.fs.toFixed(2)}</text>`);
  }
  out.push('</svg>');
  return out.join('');
}
const interpZ = (geom, x) => interp(geom.ground, x);

/** Safety-factor ratings the user can change: a placeholder list (the standard of the owner's jurisdiction decides). */
export const FS_TARGETS = { long: 1.5, short: 1.3, seismic: 1.1 };

// ---------------------------------------------------------------------------------------------------------------------------------- settlement
/** Vertical stress increase under the corner of a uniformly loaded rectangle a × b at depth z (Newmark 1935): Δσ = q·I, I from the closed form. */
export function influenceCorner(a, b, z) {
  if (z <= 0) return 0.25;
  const m = a / z, n = b / z, m2 = m * m, n2 = n * n, v = m2 + n2 + 1, v1 = m2 * n2, den = v - v1;
  const ang = Math.atan2(2 * m * n * Math.sqrt(v), den);
  return ((2 * m * n * Math.sqrt(v)) / (v + v1) * ((v + 1) / v) + (den > 0 ? ang : ang + Math.PI * 0) ) / (4 * Math.PI);
}
/** Under the centre of a B × L footing: four corner rectangles of B/2 × L/2. Under a corner: one. */
export const stressRect = (q, B, L, z, at = 'centre') => (at === 'corner' ? q * influenceCorner(B, L, z) : 4 * q * influenceCorner(B / 2, L / 2, z));
/** 2:1 spread: Δσ = q·B·L / ((B+z)(L+z)). */
export const stress2to1 = (q, B, L, z) => (q * B * L) / ((B + z) * (L + z));

/** Elastic settlement of the corner of a flexible a × b rectangle carrying q on a half-space of modulus E and Poisson ν (Timoshenko and Goodier). */
export function elasticCorner(q, a, b, E, nu) {
  const d = Math.hypot(a, b);
  return ((q * (1 - nu * nu)) / (Math.PI * E)) * (a * Math.log((b + d) / a) + b * Math.log((a + d) / b));
}
/** Centre settlement of a flexible B × L footing: four corners of B/2 × L/2. A rigid footing takes about 0.8 of that (Das). */
export const elasticCentre = (q, B, L, E, nu) => 4 * elasticCorner(q, B / 2, L / 2, E, nu);

/**
 * One-dimensional settlement of a stack of layers under a footing.
 *   layers: [{ top (elevation), bottom, soil kind: 'clay'|'sand', gamma, gammaSat, cc, cs, e0, sigmaC (kPa, effective), es, nu, cv, drain }]
 *   load: { q (kPa, net), B, L, depth (footing base elevation) , at: 'centre'|'corner', method: 'boussinesq' | '2:1' }
 *   water: elevation of the water table (null = none)
 * Compressible layers (cc given) are cut into sub-layers of at most `step` metres; granular layers (es given) give immediate settlement from
 * Δσ/Es·Δz (the strain method). Returns { consolidation, immediate, total, rows: [{ z, sigma0, dsigma, s, kind, layer }] }.
 */
export function settlement({ layers, load, water = null, ground = null, step = 1 }) {
  const rows = []; let sc = 0, si = 0;
  const base = load.depth ?? ground ?? layers[0].top;
  const sigmaAt = (z) => {   // effective vertical stress at elevation z, from the top of the first layer
    let s = 0, zt = ground ?? layers[0].top;
    for (const l of layers) {
      const hi = Math.min(zt, l.top), lo = Math.max(z, l.bottom);
      if (hi > lo) {
        const dry = water === null ? hi - lo : Math.max(0, Math.min(hi, Math.max(lo, water)) - lo) * 0 + Math.max(0, hi - Math.max(lo, water)), wet = hi - lo - dry;
        s += dry * l.gamma + wet * ((l.gammaSat ?? l.gamma) - G_W);
      }
      if (l.bottom <= z) break;
    }
    return s;
  };
  for (const [li, l] of layers.entries()) {
    const top = Math.min(l.top, base), bot = l.bottom;
    if (top <= bot) continue;
    const n = Math.max(1, Math.ceil((top - bot) / step)), dz = (top - bot) / n;
    for (let i = 0; i < n; i++) {
      const zm = top - (i + 0.5) * dz, depth = base - zm;
      const dsig = load.method === '2:1' ? stress2to1(load.q, load.B, load.L, depth) : stressRect(load.q, load.B, load.L, depth, load.at);
      if (l.cc !== undefined && l.e0 !== undefined) {
        const s0 = Math.max(sigmaAt(zm), 0.1), sf = s0 + dsig, sc0 = l.sigmaC ?? s0, cs = l.cs ?? l.cc / 5;
        let s;
        if (sc0 <= s0 * 1.0001) s = (l.cc * dz) / (1 + l.e0) * Math.log10(sf / s0);   // normally consolidated
        else if (sf <= sc0) s = (cs * dz) / (1 + l.e0) * Math.log10(sf / s0);   // stays below the preconsolidation stress
        else s = ((cs * dz) / (1 + l.e0)) * Math.log10(sc0 / s0) + ((l.cc * dz) / (1 + l.e0)) * Math.log10(sf / sc0);
        rows.push({ layer: li, z: zm, depth, sigma0: s0, dsigma: dsig, s, kind: 'consolidation' }); sc += s;
      } else if (l.es) {
        const s = (dsig / l.es) * dz * (1 - (l.nu ?? 0) * 0);
        rows.push({ layer: li, z: zm, depth, sigma0: Math.max(sigmaAt(zm), 0), dsigma: dsig, s, kind: 'immediate' }); si += s;
      }
    }
  }
  return { consolidation: sc, immediate: si, total: sc + si, rows };
}

/** Degree of consolidation for a time factor (Terzaghi, series). */
export function degreeOfConsolidation(Tv) {
  if (Tv <= 0) return 0;
  let s = 0; for (let m = 0; m < 200; m++) { const M = (Math.PI * (2 * m + 1)) / 2; s += (2 / (M * M)) * Math.exp(-M * M * Tv); if (M * M * Tv > 60) break; }
  return 1 - s;
}
/** Time factor for a degree of consolidation: by the usual closed forms below 60 %, bisection above. */
export function timeFactor(U) {
  if (U <= 0) return 0; if (U >= 1) return Infinity;
  let lo = 0, hi = 10; for (let i = 0; i < 80; i++) { const mid = (lo + hi) / 2; if (degreeOfConsolidation(mid) < U) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}
/** Time for U of the final consolidation settlement: t = Tv·Hdr² / cv. Hdr is the longest drainage path (m), cv in m²/year → years. */
export const timeFor = (U, Hdr, cv) => (timeFactor(U) * Hdr * Hdr) / cv;
/** Settlement curve: [{ t, U, s }] for a final consolidation settlement `sFinal`. */
export function timeCurve(sFinal, Hdr, cv, tMax, n = 40) {
  const out = []; for (let i = 0; i <= n; i++) { const t = (tMax * i) / n, U = degreeOfConsolidation((cv * t) / (Hdr * Hdr)); out.push({ t, U, s: sFinal * U }); }
  return out;
}
/** Secondary compression between t1 and t2 (Cα as e per log cycle, ep the void ratio at the end of primary, H the layer thickness). */
export const secondary = (Calpha, H, ep, t1, t2) => ((Calpha * H) / (1 + ep)) * Math.log10(t2 / t1);

/** Checks a reviewer asks for; the UI words the codes. limit values are the user's. */
export function checkSettlement(res, { total = 0.025, differential = null, time = null } = {}) {
  const out = [];
  if (total && res.total > total) out.push({ code: 'geo.settle.total', value: res.total, limit: total });
  if (differential && res.differential > differential) out.push({ code: 'geo.settle.diff', value: res.differential, limit: differential });
  if (time) void time;
  return out;
}
export function checkSlope(fs, { target = FS_TARGETS.long } = {}) { return fs < target ? [{ code: 'geo.slope.low', value: fs, limit: target }] : []; }
