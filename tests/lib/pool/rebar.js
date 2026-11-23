/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rebar.js — the shell's reinforcement as bars (0.11 POOL.8): a bar layout and a bar schedule from the steel ratio, the bar size and the
 * largest spacing. Host-free; millimetres.
 *
 * What it is: ONE layer of bars each way in the walls (vertical and horizontal, at the water face, cover from the water side) and in the floor
 * slab (along and across the pool, at the bottom, cover from the ground). The spacing is the bar's area over ratio x thickness (so the steel per
 * metre is the ratio's), rounded down to 5 mm, never more than the largest spacing (a governed figure: the spec's, else a starting figure); a
 * vertical wall bar has a leg of lapDia bar diameters into the floor; a bar longer than STOCK is joined with laps of lapDia diameters. The lap
 * and the 12 m stock length are starting figures, NOT from any standard.
 * What it is NOT: a reinforcement design. No second layer, no corner bars or bars round the steps, the gutter, the openings for skimmers and
 * inlets, no bending schedule shapes. A licensed engineer designs the reinforcement.
 */
import { offset, perimeter, along, spansAtY, spansAtX } from './plan.js';
import { floorPlane, cyl } from './build.js';

export const STOCK = 12000;
export const MAX_BAR_PIECES = 4000;
const STEEL = 7850;

const spacingFor = (dia, ratio, t, max) => { const s = ratio > 0 ? (Math.PI * dia * dia / 4) / (ratio * t) : Infinity; return Math.max(50, Math.floor(Math.min(s, max) / 5) * 5); };
const laps = (L, lap) => Math.max(0, Math.ceil(L / STOCK - 1e-9) - 1) * lap;
/** The parts of a closed outline where x ≥ x0, as open polylines. */
function clipX(poly, x0) {
  const out = []; let cur = null;
  const n = poly.length;
  const start = poly.findIndex((p) => p[0] < x0);
  if (start < 0) return [[...poly, poly[0]]];
  for (let k = 0; k < n; k++) {
    const a = poly[(start + k) % n], b = poly[(start + k + 1) % n];
    const ia = a[0] >= x0, ib = b[0] >= x0;
    const cut = () => { const t = (x0 - a[0]) / (b[0] - a[0]); return [x0, a[1] + t * (b[1] - a[1])]; };
    if (ia && ib) { cur.push(b); }
    else if (!ia && ib) { cur = [cut(), b]; }
    else if (ia && !ib) { cur.push(cut()); out.push(cur); cur = null; }
  }
  return out.filter((p) => p.length >= 2);
}
const plen = (p) => p.reduce((s, q, i) => (i ? s + Math.hypot(q[0] - p[i - 1][0], q[1] - p[i - 1][1]) : 0), 0);

/**
 * → { marks: [{ mark, where, dia, spacing, count, each (mm, mean), total (m), mass (kg) }], mass (kg), pieces: { W1, W2, F1, F2: [piece] }, tooMany }
 */
export function bars(d, layout) {
  const poly = layout.poly, dia = d.barDia, lap = d.lapDia * dia, Ab = Math.PI * dia * dia / 4;
  const [fa, fs] = floorPlane(d), tf = d.finish, zt = -d.copingThickness, L = d.length;
  const sW = spacingFor(dia, d.rebarRatio, d.wall, d.barSpacing), sF = spacingFor(dia, d.rebarRatio, d.floor, d.barSpacing);
  const slabBot = (x) => fa - tf - d.floor + fs * x;
  const floorBar = (x) => slabBot(x) + d.coverEarth + dia / 2;
  const marks = [], pieces = { W1: [], W2: [], F1: [], F2: [] };
  const push = (mark, where, count, total, spacing) => { if (count > 0) marks.push({ mark, where, dia, spacing, count, each: total / count, total: total / 1000, mass: (total / 1000) * Ab * 1e-6 * STEEL }); };

  // walls: the bar line inside the wall at cover from the water face
  const line = offset(poly, tf + d.coverWater + dia / 2) || poly, per = perimeter(line);
  const top = zt - d.coverWater - dia / 2;
  const nV = Math.max(1, Math.ceil(per / sW - 1e-9));
  let totV = 0;
  for (let k = 0; k < nV; k++) {
    const p = along(line, (per * k) / nV).at, bot = floorBar(Math.min(L, Math.max(0, p[0]))) + dia;
    const h = top - bot;
    if (h <= 0) continue;
    totV += h + lap;
    pieces.W1.push(cyl([p[0], p[1], bot], [p[0], p[1], top], dia / 2, 6));
  }
  push('W1', 'wall.vertical', nV, totV, sW);
  // horizontal bars: rows from the top down; a row runs only where the wall reaches below it (the deep end goes deeper)
  let totH = 0, nH = 0;
  const lowest = floorBar(L) + dia * 2, highest = floorBar(0) + dia * 2;
  for (let z = top - dia; z > lowest; z -= sW) {
    const parts = z > highest ? [[...line, line[0]]] : clipX(line, fs < 0 ? (z - (fa - tf - d.floor + d.coverEarth + dia * 2)) / fs : -Infinity);
    for (const p of parts) {
      const Lp = plen(p);
      if (Lp < 500) continue;
      nH++; totH += Lp + laps(Lp, lap) + (p[0] === p[p.length - 1] ? lap : 0);
      for (let i = 1; i < p.length; i++) pieces.W2.push(cyl([p[i - 1][0], p[i - 1][1], z], [p[i][0], p[i][1], z], dia / 2, 6));
    }
  }
  push('W2', 'wall.horizontal', nH, totH, sW);
  // floor: bars along x (rows across y) and along y (rows along x), inside the slab outline less the cover
  const slabLine = offset(poly, tf + d.wall - d.coverEarth) || poly;
  const ys = slabLine.map((q) => q[1]), xs = slabLine.map((q) => q[0]);
  const y0 = Math.min(...ys), y1 = Math.max(...ys), x0 = Math.min(...xs), x1 = Math.max(...xs);
  let tot1 = 0, n1 = 0, tot2 = 0, n2 = 0;
  for (let y = y0 + sF / 2; y < y1; y += sF) for (const [a, b] of spansAtY(slabLine, y)) {
    const Lb = (b - a) * Math.hypot(1, fs);
    n1++; tot1 += Lb + laps(Lb, lap);
    pieces.F1.push(cyl([a, y, floorBar(a)], [b, y, floorBar(b)], dia / 2, 6));
  }
  for (let x = x0 + sF / 2; x < x1; x += sF) for (const [a, b] of spansAtX(slabLine, x)) {
    const Lb = b - a, z = floorBar(x) + dia;
    n2++; tot2 += Lb + laps(Lb, lap);
    pieces.F2.push(cyl([x, a, z], [x, b, z], dia / 2, 6));
  }
  push('F1', 'floor.along', n1, tot1, sF);
  push('F2', 'floor.across', n2, tot2, sF);
  const count = Object.values(pieces).reduce((s, p) => s + p.length, 0);
  return { marks, mass: marks.reduce((s, m) => s + m.mass, 0), pieces, pieceCount: count, tooMany: count > MAX_BAR_PIECES, spacing: { wall: sW, floor: sF } };
}

/** The bar elements (IfcReinforcingBar, one per mark) for a bars() result; none when there would be too many pieces to draw. */
export function barElements(r, d) {
  if (r.tooMany) return [];
  const NAMES = { W1: 'Wall bars, vertical', W2: 'Wall bars, horizontal', F1: 'Floor bars, along', F2: 'Floor bars, across' };
  return r.marks.map((m) => ({
    key: 'rebar-' + m.mark, group: 'rebar', ifc: 'IFCREINFORCINGBAR', predefined: 'MAIN', objectType: null, name: NAMES[m.mark] + ' ' + m.dia + ' mm at ' + m.spacing,
    material: 'rebar', color: '#8b4513', alpha: 1, pieces: r.pieces[m.mark], bar: { dia: m.dia, area: Math.PI * m.dia * m.dia / 4, length: m.each },
    props: { Mark: m.mark, BarDiameterMm: m.dia, SpacingMm: m.spacing, Count: m.count, TotalLengthM: m.total, MassKg: m.mass, LapMm: d.lapDia * m.dia },
    qty: { length: m.total * 1000 },
  }));
}
