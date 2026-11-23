/* SPDX-License-Identifier: Apache-2.0 */
/**
 * road.js — road and street lighting (0.11 IL.10, session `road-light-11`). DOM-free, host-free; the luminaire files are read by photometry.js.
 *
 * A straight road is a cross-section of strips (carriageways with lanes, footways, verges, medians, cycleways) lit by a repeating arrangement of luminaires (one
 * side, both sides opposite, staggered, or twin arms on the centre). What comes out, for the calculation field between two adjacent luminaires:
 *   - horizontal illuminance on the carriageway and on each footway or cycleway (average, lowest, highest, overall uniformity Uo, Eavg/Emin);
 *   - road-surface luminance seen by an observer in each lane (average L̄, Uo, longitudinal uniformity Ul), ONLY from an r-table the person gives;
 *   - the veiling luminance Lv and the threshold increment TI (TI needs the luminance);
 *   - the edge illumination ratio EIR (the surround ratio) of both carriageway edges;
 *   - checks against class values the person types or a cited table, and one Problems line per criterion not met.
 *
 * SOURCES (rule 66; notes with pages in docs/refs/road-lighting.md). EN 13201-2/-3, ANSI/IES RP-8 and CIE 140/144 are not read here; nothing below is typed from them.
 *   [S] K. Sørensen, "Road lighting", NMF textbook, 8 April 2013: eq. 1-2 p. 70-71 (E = I cos v / d² = I cos³ v / h²), eq. 5 p. 72 (dL = 0.0001 r I / h²),
 *       p. 73 (C-γ axes: C 90° forwards), p. 74 (observer mid-lane 60 m before the field; field = one luminaire to the next; β; linear interpolation),
 *       p. 79 (luminaires outside the r-table cannot contribute), A.7 p. 88-89 (Uo, Ul), A.8 p. 92 (lowest L̄, Uo, Ul over the observers),
 *       A.9.2 p. 94-95 (Lv = K Σ E/θ², K = 10 or 9.86 (1 + (A/66.4)^4), eye 1.5 m, sight 1° down, 500 m, 20° roof plane, steps, TI = 65 Lv / L̄^0.8 from initial
 *       values), A.10 p. 103 (EIR), Tables 2-4 p. 16-17 (the EN 13201-2 M, C and P classes as reproduced there).
 *   [U] Fotios, Boyce, Ellis, "The effect of pavement material on road lighting performance", for the UK DfT, 2005: p. 9 (L = q I cos³γ / h², r = q cos³γ,
 *       r-table values × 10 000), p. 10 (β 0-180°, symmetric), p. 11-12 (field, observer 60 m / 1.5 m, Uo, Ul).
 *   [F] FHWA-HRT-14-051 (2014) Table 20: the ANSI/IES RP-8-00 illuminance criteria as reproduced there (RP8_00 below).
 * OUR CHOICES (said in the notes and help, not a standard's): the grid (points along and across) is an input, default 10 × 3 a lane; the eye illuminance is taken on
 * a plane facing along the line of sight; the TI observer steps start where the luminance observer stands; TI uses the highest Lv and the lowest L̄ (initial).
 *
 *   cleanSection(sec) → { strips: [{ kind, width, y0, y1, lanes, dirs, name }], width }      strips from the left edge (y = 0) to the right, metres
 *   parseRTable(text) → { ok, table: { betas, tans, r } } | { ok: false, key }              the person's r-table (r × 10 000): first row tan γ, then one row a β
 *   rAt(table, beta, tan) → r × 10 000 (bilinear) | null outside the table
 *   roadLuminaires(section, arr) → [{ photo, p: [x, y, z] m, f, side, x }]               the arrangement repeated along the road
 *   runRoad({ section, arrangement, photo, llf, grid, rtable, observer, requirements }) → result (see the end of the file)
 *   roadChecks(res, req) → [{ key, op, req, found, ok, area }] · roadProblems(res, t) → Problems shape
 *   CLASS_SETS, RP8_00, classValues(set, id, opts) → requirement values from a cited table
 */
import { candela } from './photometry.js';

const rad = (d) => (d * Math.PI) / 180, deg = (r) => (r * 180) / Math.PI;
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const unit = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const fin = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v)) ? Number(v) : d));

// ------------------------------------------------------------------------------------------------------------- conventions ([S] p. 74, 90, 94-95; [U] p. 11)
export const ROAD_CONV = {
  observerDistance: 60,   // m in front of the field [S] p. 74, [U] p. 11
  eyeHeight: 1.5,         // m [S] p. 75, 94; [U] p. 11
  sightDown: 1,           // degrees below the horizontal [S] p. 94
  glareReach: 500,        // m: luminaires included in Lv [S] p. 94
  roofCut: 20,            // degrees: luminaires above a plane through the eye tilted this much up are left out [S] p. 94
  kYoung: 10,             // K for a young observer [S] p. 94
};
/** K of the veiling luminance for an observer of age A ([S] p. 94: K = 9.86 (1 + (A / 66.4)^4)); no age = 10. */
export const veilK = (age) => (fin(age, 0) > 0 ? 9.86 * (1 + (fin(age, 0) / 66.4) ** 4) : ROAD_CONV.kYoung);
/** TI in percent from INITIAL Lv and L̄ ([S] p. 95). */
export const thresholdIncrement = (lv, lav) => (lav > 0 && lv >= 0 ? (65 * lv) / lav ** 0.8 : null);

// ------------------------------------------------------------------------------------------------------------- cross-section
export const STRIP_KINDS = ['carriageway', 'footway', 'cycleway', 'verge', 'median'];
export const MAX_STRIPS = 16, MAX_LANES = 8;
/**
 * sec = { strips: [{ kind, width (m), lanes?, oneWay?, dirs?, name? }] } from the left edge to the right. A carriageway's lanes are its width / lanes each; on a
 * two-way carriageway the left half of the lanes run against +x (dir -1) and the rest with it (+1), unless `dirs` says otherwise.
 */
export function cleanSection(sec) {
  const strips = [];
  let y = 0;
  for (const s of (sec && Array.isArray(sec.strips) ? sec.strips : []).slice(0, MAX_STRIPS)) {
    if (!s || !STRIP_KINDS.includes(s.kind)) continue;
    const width = Math.min(60, Math.max(0, fin(s.width, 0)));
    if (!(width > 0.05)) continue;
    const o = { kind: s.kind, width, y0: y, y1: y + width, name: String(s.name || '').slice(0, 60) };
    if (s.kind === 'carriageway') {
      const n = Math.max(1, Math.min(MAX_LANES, Math.round(fin(s.lanes, 2))));
      let dirs = Array.isArray(s.dirs) && s.dirs.length === n ? s.dirs.map((d) => (Number(d) < 0 ? -1 : 1)) : null;
      if (!dirs) dirs = Array.from({ length: n }, (_, i) => (s.oneWay || n === 1 ? 1 : i < Math.floor(n / 2) ? -1 : 1));
      Object.assign(o, { lanes: n, dirs, laneWidth: width / n, oneWay: !!s.oneWay });
    }
    strips.push(o);
    y += width;
  }
  return { strips, width: y };
}
export const carriageways = (S) => S.strips.filter((s) => s.kind === 'carriageway');

// ------------------------------------------------------------------------------------------------------------- r-table ([S] p. 72, 74; [U] p. 9-10)
/**
 * The person's r-table as text: the first line is the tan γ values (a first cell that is not a number, e.g. "beta\tan", is skipped), then one line a β (degrees):
 * β, then r × 10 000 for each tan γ. Commas, tabs or spaces; a decimal comma is fine when the separators are tabs or semicolons. β must rise from 0 and stay within
 * 0..180, tan γ must rise from 0; at most 40 × 40. Values are r × 10 000 as tables print them.
 */
export function parseRTable(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
  if (lines.length < 3) return { ok: false, key: 'rt.short' };
  const cells = (l) => { const tabbed = /[\t;]/.test(l); return l.split(tabbed ? /[\t;]+/ : /[\s,]+/).map((c) => c.trim()).filter((c) => c !== '').map((c) => (tabbed ? c.replace(',', '.') : c)); };
  let head = cells(lines[0]);
  if (head.length && !Number.isFinite(Number(head[0]))) head = head.slice(1);
  const tans = head.map(Number);
  if (tans.length < 2 || tans.length > 40 || tans.some((v, i) => !Number.isFinite(v) || v < 0 || (i && v <= tans[i - 1]))) return { ok: false, key: 'rt.tans' };
  const betas = [], r = [];
  for (const l of lines.slice(1)) {
    const c = cells(l).map(Number);
    if (c.length !== tans.length + 1 || c.some((v) => !Number.isFinite(v))) return { ok: false, key: 'rt.row', vars: { n: betas.length + 2 } };
    const b = c[0];
    if (b < 0 || b > 180 || (betas.length && b <= betas[betas.length - 1])) return { ok: false, key: 'rt.betas' };
    if (c.slice(1).some((v) => v < 0)) return { ok: false, key: 'rt.neg' };
    betas.push(b); r.push(c.slice(1));
    if (betas.length > 40) return { ok: false, key: 'rt.big' };
  }
  if (betas.length < 2) return { ok: false, key: 'rt.short' };
  return { ok: true, table: { betas, tans, r } };
}
function bracket(a, x) {
  if (x <= a[0]) return [0, 0, 0];
  if (x >= a[a.length - 1]) return [a.length - 1, a.length - 1, 0];
  let lo = 0, hi = a.length - 1;
  while (hi - lo > 1) { const m = (lo + hi) >> 1; if (a[m] <= x) lo = m; else hi = m; }
  return [lo, hi, (x - a[lo]) / (a[hi] - a[lo])];
}
/** r × 10 000 at β (degrees, folded into 0..180: the table is symmetric, [U] p. 10) and tan γ: linear in both ([S] p. 74). null beyond the table ([S] p. 79). */
export function rAt(T, beta, tan) {
  let b = Math.abs(((beta % 360) + 360) % 360); if (b > 180) b = 360 - b;
  if (!T || tan < T.tans[0] - 1e-12 || tan > T.tans[T.tans.length - 1] + 1e-12 || b > T.betas[T.betas.length - 1] + 1e-9) return null;
  const [i0, i1, fi] = bracket(T.betas, b), [j0, j1, fj] = bracket(T.tans, tan);
  const a = T.r[i0][j0] * (1 - fj) + T.r[i0][j1] * fj, c = T.r[i1][j0] * (1 - fj) + T.r[i1][j1] * fj;
  return a * (1 - fi) + c * fi;
}
/** A table of r = q cos³γ for a perfectly diffuse surface of reflectance rho (q = rho / π): a test and teaching table, not a road surface. */
export function diffuseRTable(rho = 0.1, tans = [0, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, 12], betas = [0, 30, 60, 90, 120, 150, 180]) {
  const q = rho / Math.PI;
  return { betas: betas.slice(), tans: tans.slice(), r: betas.map(() => tans.map((t) => 1e4 * q * Math.cos(Math.atan(t)) ** 3)) };
}

// ------------------------------------------------------------------------------------------------------------- luminaires
export const ARRANGEMENTS = ['single', 'opposite', 'staggered', 'central'];
/**
 * The luminaire's axes when it faces `face` (unit horizontal, across the road) and is tilted `tilt` degrees: the nadir n turns towards the road as the arm is
 * tilted up; C 90° points forwards (towards the road) and C 0° along it ([S] p. 73: "(γ = 90°; C = 90°) pointing forwards"). `turn` turns it about n.
 * Returns the frame { n, r (C 0°), s (C 90°) } that photometry.js and this file read.
 */
export function roadFrame(face, tilt = 0, turn = 0) {
  const t = rad(tilt), n = unit([face[0] * Math.sin(t), face[1] * Math.sin(t), -Math.cos(t)]);
  let r = unit(cross(face, n));   // along the road: n × r = forwards
  if (turn) { const s0 = cross(n, r), a = rad(turn); r = unit([r[0] * Math.cos(a) + s0[0] * Math.sin(a), r[1] * Math.cos(a) + s0[1] * Math.sin(a), r[2] * Math.cos(a) + s0[2] * Math.sin(a)]); }
  return { n, r, s: cross(n, r) };
}
/** The arrangement, cleaned: { type, side ('left'|'right'), spacing, height, overhang, tilt, turn, cw (index of the carriageway it is set out from) }. */
export function cleanArrangement(a = {}) {
  return {
    type: ARRANGEMENTS.includes(a.type) ? a.type : 'single', side: a.side === 'right' ? 'right' : 'left',
    spacing: Math.min(200, Math.max(3, fin(a.spacing, 30))), height: Math.min(40, Math.max(2, fin(a.height, 10))),
    overhang: Math.min(20, Math.max(-20, fin(a.overhang, 0))), tilt: Math.min(45, Math.max(-15, fin(a.tilt, 0))), turn: fin(a.turn, 0) % 360,
    cw: Math.max(0, Math.round(fin(a.cw, 0))),
  };
}
/**
 * Where the luminaires stand, repeated along x from `from` to `to` (m). Set out from carriageway `cw`: a left luminaire stands over y0 + overhang facing +y, a right
 * one over y1 - overhang facing -y (overhang = how far the luminaire reaches over the carriageway from its edge; negative = set back). Staggered: the right row is
 * half a spacing along. Central: two luminaires back to back on the middle of the first median (else the middle of the road), each reaching `overhang` from it.
 */
export function roadLuminaires(S, arrIn, photo, { from = -200, to = 600 } = {}) {
  const a = cleanArrangement(arrIn), cws = carriageways(S), cw = cws[Math.min(a.cw, cws.length - 1)];
  if (!cw) return [];
  const out = [], put = (x, y, face, side) => out.push({ photo, p: [x, y, a.height], f: roadFrame(face, a.tilt, a.turn), side, x });
  const row = (y, face, side, shift) => { for (let k = Math.ceil((from - shift) / a.spacing); k * a.spacing + shift <= to; k++) put(k * a.spacing + shift, y, face, side); };
  const left = () => row(cw.y0 + a.overhang, [0, 1, 0], 'left', 0), right = (shift) => row(cw.y1 - a.overhang, [0, -1, 0], 'right', shift);
  if (a.type === 'single') { if (a.side === 'left') left(); else right(0); }
  else if (a.type === 'opposite') { left(); right(0); }
  else if (a.type === 'staggered') { left(); right(a.spacing / 2); }
  else {
    const med = S.strips.find((s) => s.kind === 'median'), yc = med ? (med.y0 + med.y1) / 2 : S.width / 2;
    row(yc + a.overhang, [0, 1, 0], 'centre+', 0); row(yc - a.overhang, [0, -1, 0], 'centre-', 0);
  }
  return out;
}

// ------------------------------------------------------------------------------------------------------------- point values
/** Candela from luminaire L towards point p (m), and the unit vector from L to p and the distance. */
function towards(L, p) {
  const v = sub(p, L.p), d = Math.hypot(v[0], v[1], v[2]);
  if (d < 1e-6) return null;
  const u = [v[0] / d, v[1] / d, v[2] / d], f = L.f;
  const gamma = deg(Math.acos(Math.max(-1, Math.min(1, dot(u, f.n))))), c = deg(Math.atan2(dot(u, f.s), dot(u, f.r)));
  return { I: candela(L.photo, gamma, c) * (L.scale ?? 1), u, d };
}
/** Horizontal illuminance (lx, initial) at p from the luminaires: Σ I cos v / d² ([S] eq. 1 p. 70). */
export function roadIlluminance(lums, p) {
  let E = 0;
  for (const L of lums) { const q = towards(L, p); if (!q) continue; const cosV = -q.u[2]; if (cosV > 0) E += (q.I * cosV) / (q.d * q.d); }
  return E;
}
/**
 * Luminance (cd/m², initial) at road point p seen by an observer at o: Σ 0.0001 r(β, tan v) I / h² ([S] eq. 5 p. 72). β is the angle between the horizontal
 * direction observer → point and the horizontal direction point → luminaire (0 = the luminaire beyond the point, the specular side; [S] p. 74, 77). A luminaire
 * outside the table gives nothing ([S] p. 79).
 */
export function roadLuminance(lums, p, o, T) {
  const ox = p[0] - o[0], oy = p[1] - o[1], ol = Math.hypot(ox, oy) || 1;
  let L = 0;
  for (const Lm of lums) {
    const h = Lm.p[2] - p[2];
    if (!(h > 0)) continue;
    const dx = Lm.p[0] - p[0], dy = Lm.p[1] - p[1], dh = Math.hypot(dx, dy), tan = dh / h;
    const beta = dh < 1e-9 ? 0 : deg(Math.acos(Math.max(-1, Math.min(1, (ox * dx + oy * dy) / (ol * dh)))));
    const r = rAt(T, beta, tan);
    if (r === null) continue;
    const q = towards(Lm, p);
    if (q) L += (1e-4 * r * q.I) / (h * h);
  }
  return L;
}
/**
 * Veiling luminance (cd/m², initial) at an eye looking along `dir` (+1 / -1 along x), sight 1° down: K Σ E / θ² with E on a plane at the eye facing along the
 * line of sight and θ in degrees ([S] p. 94). Luminaires behind the eye, beyond `reach` m, or above the roof plane (20° up) are left out.
 */
export function veilingLuminance(lums, eye, dir, { K = ROAD_CONV.kYoung, reach = ROAD_CONV.glareReach, roof = ROAD_CONV.roofCut, down = ROAD_CONV.sightDown } = {}) {
  const sight = unit([dir * Math.cos(rad(down)), 0, -Math.sin(rad(down))]);
  let Lv = 0;
  for (const Lm of lums) {
    const w = sub(Lm.p, eye), along = w[0] * dir;
    if (!(along > 0) || along > reach) continue;
    if (w[2] > Math.tan(rad(roof)) * along) continue;   // hidden by the roof of the car
    const q = towards(Lm, eye);
    if (!q) continue;
    const toLum = [-q.u[0], -q.u[1], -q.u[2]], cosT = dot(toLum, sight);
    if (!(cosT > 0)) continue;
    const theta = deg(Math.acos(Math.min(1, cosT)));
    if (theta < 0.1) continue;
    Lv += (q.I * cosT) / (q.d * q.d) / (theta * theta);
  }
  return K * Lv;
}

// ------------------------------------------------------------------------------------------------------------- the run
const statsOf = (v) => {
  if (!v.length) return { n: 0, avg: 0, min: 0, max: 0, uo: 0, ratio: null };
  let min = Infinity, max = -Infinity, s = 0;
  for (const x of v) { if (x < min) min = x; if (x > max) max = x; s += x; }
  const avg = s / v.length;
  return { n: v.length, avg, min, max, uo: avg > 0 ? min / avg : 0, ratio: min > 0 ? avg / min : null };
};
/** Points of a strip y0..y1 over the field 0..S: nx along at D (i + 1/2), ny across at d (j + 1/2) (our grid: the person can type their standard's). */
function stripPoints(y0, y1, S, nx, ny) {
  const pts = [], D = S / nx, d = (y1 - y0) / ny;
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) pts.push([D * (i + 0.5), y0 + d * (j + 0.5), 0]);
  return pts;
}
export const ROAD_GRID = { along: 10, across: 3 };   // OUR defaults (not a standard's rule): points along the field and across each lane or strip

/**
 * runRoad({ section, arrangement, photo, llf, grid: { along, across }, rtable (parsed table or null), observer: { age }, requirements }) →
 * {
 *   section, arrangement, spacing, luminaires (those near the field, for the picture), count (luminaires per field), llf,
 *   carriageways: [{ index, name, lanes, E: stats (maintained lx), points, values, luminance: null | { observers: [{ lane, dir, avg, min, uo, ul }], avg, uo, ul (lowest),
 *       values (the lowest-average observer's) }, lv: { max, lane, steps } (initial cd/m²), ti (%) | null, lvRatio (Lv,max / L̄) | null, eir: { left, right, min } }],
 *   footways: [{ index, kind, name, E: stats, points, values }],
 *   checks, notes
 * }
 */
export function runRoad({ section, arrangement, photo, llf = 0.8, grid = {}, rtable = null, observer = {}, requirements = {} }) {
  if (!photo) throw Object.assign(new Error('no luminaire'), { key: 'road.err.nophoto' });
  const S = cleanSection(section), cws = carriageways(S);
  if (!cws.length) throw Object.assign(new Error('no carriageway'), { key: 'road.err.nocw' });
  const a = cleanArrangement(arrangement), sp = a.spacing, H = a.height, mf = Math.min(1, Math.max(0.05, fin(llf, 0.8)));
  const nx = Math.max(2, Math.min(60, Math.round(fin(grid.along, ROAD_GRID.along)))), ny = Math.max(1, Math.min(15, Math.round(fin(grid.across, ROAD_GRID.across))));
  const D = sp / nx, obsD = ROAD_CONV.observerDistance;
  const lums = roadLuminaires(S, a, photo, { from: -(obsD + ROAD_CONV.glareReach + sp), to: sp + obsD + ROAD_CONV.glareReach + sp });
  const perField = lums.filter((L) => L.x >= 0 && L.x < sp - 1e-9).length;
  const K = veilK(observer.age);
  const res = { section: S, arrangement: a, spacing: sp, llf: mf, grid: { along: nx, across: ny, D }, K, count: perField, carriageways: [], footways: [], notes: ['road.note.straight', 'road.note.grid', 'road.note.direct'] };
  res.luminaires = lums.filter((L) => L.x >= -sp && L.x <= 2 * sp);
  const E = (p) => roadIlluminance(lums, p) * mf;

  cws.forEach((cw, ci) => {
    const pts = [], lanesPts = [];
    for (let k = 0; k < cw.lanes; k++) { const lp = stripPoints(cw.y0 + k * cw.laneWidth, cw.y0 + (k + 1) * cw.laneWidth, sp, nx, ny); lanesPts.push(lp); pts.push(...lp); }
    const values = pts.map(E), out = { index: ci, strip: S.strips.indexOf(cw), name: cw.name, lanes: cw.lanes, laneWidth: cw.laneWidth, y0: cw.y0, y1: cw.y1, points: pts, values, E: statsOf(values), luminance: null, lv: null, ti: null, lvRatio: null };
    // edge illumination ratio ([S] A.10 p. 103): strips one lane wide just outside and just inside each edge
    const avgE = (y0, y1) => statsOf(stripPoints(y0, y1, sp, nx, ny).map(E)).avg, w = cw.laneWidth;
    const eir = (inA, outA) => (inA > 0 ? outA / inA : null);
    out.eir = { left: eir(avgE(cw.y0, cw.y0 + w), avgE(cw.y0 - w, cw.y0)), right: eir(avgE(cw.y1 - w, cw.y1), avgE(cw.y1, cw.y1 + w)) };
    out.eir.min = [out.eir.left, out.eir.right].filter((v) => v !== null).reduce((m, v) => Math.min(m, v), Infinity);
    if (!Number.isFinite(out.eir.min)) out.eir.min = null;
    // the observers, one in the middle of each lane, 60 m before the field looking along the lane's direction ([S] p. 74, 90)
    const obs = [];
    for (let k = 0; k < cw.lanes; k++) {
      const dir = cw.dirs[k], yc = cw.y0 + (k + 0.5) * cw.laneWidth, x0 = dir > 0 ? -obsD : sp + obsD;
      obs.push({ lane: k, dir, yc, x0 });
    }
    if (rtable) {
      const list = obs.map((o) => {
        const eye = [o.x0, o.yc, ROAD_CONV.eyeHeight], vals = pts.map((p) => roadLuminance(lums, p, eye, rtable) * mf), st = statsOf(vals);
        // Ul: the line of points nearest the observer's own transverse position ([S] A.7.3 p. 89)
        const lane = lanesPts[o.lane], ys = [...new Set(lane.map((p) => p[1]))], yl = ys.reduce((b, y) => (Math.abs(y - o.yc) < Math.abs(b - o.yc) ? y : b), ys[0]);
        const line = pts.map((p, i) => (Math.abs(p[1] - yl) < 1e-9 ? vals[i] : null)).filter((v) => v !== null), lmax = Math.max(...line), lmin = Math.min(...line);
        return { lane: o.lane, dir: o.dir, avg: st.avg, min: st.min, max: st.max, uo: st.uo, ul: lmax > 0 ? lmin / lmax : 0, values: vals };
      });
      const low = list.reduce((b, o) => (o.avg < b.avg ? o : b), list[0]);
      out.luminance = { observers: list.map(({ values, ...o }) => o), avg: low.avg, uo: Math.min(...list.map((o) => o.uo)), ul: Math.min(...list.map((o) => o.ul)), values: low.values, lane: low.lane };
    }
    // veiling luminance: each lane, the observer moved in nx steps of D from where the luminance observer stands; the highest ([S] p. 95). Initial values.
    let lvMax = 0, lvLane = 0;
    for (const o of obs) for (let k = 0; k < nx; k++) {
      const lv = veilingLuminance(lums, [o.x0 + o.dir * k * D, o.yc, ROAD_CONV.eyeHeight], o.dir, { K });
      if (lv > lvMax) { lvMax = lv; lvLane = o.lane; }
    }
    out.lv = { max: lvMax, lane: lvLane, steps: nx };
    if (out.luminance) {
      const lavInitial = out.luminance.avg / mf;
      out.ti = thresholdIncrement(lvMax, lavInitial);
      out.lvRatio = lavInitial > 0 ? lvMax / lavInitial : null;
    }
    res.carriageways.push(out);
  });
  S.strips.forEach((s, i) => {
    if (s.kind !== 'footway' && s.kind !== 'cycleway') return;
    const pts = stripPoints(s.y0, s.y1, sp, nx, ny), values = pts.map(E);
    res.footways.push({ index: res.footways.length, strip: i, kind: s.kind, name: s.name, y0: s.y0, y1: s.y1, points: pts, values, E: statsOf(values) });
  });
  if (!rtable) res.notes.push('road.note.nortable');
  res.notes.push('road.note.ti', 'road.note.claim');
  res.checks = roadChecks(res, requirements);
  return res;
}

// ------------------------------------------------------------------------------------------------------------- class values and checks
/**
 * Cited tables. EN 13201-2 M, C and P classes as reproduced in [S] Tables 2-4 p. 16-17 (EN 13201-2's own notes let a country amend Ul, wet Uo, TI and EIR:
 * check against your class table). RP8_00 = ANSI/IES RP-8-00 illuminance criteria as reproduced in [F] Table 20.
 */
export const CLASS_SETS = {
  m: { source: 'road.src.s.m', rows: { M1: { L: 2.0, uo: 0.4, ul: 0.7, wet: 0.15, ti: 10, eir: 0.35 }, M2: { L: 1.5, uo: 0.4, ul: 0.7, wet: 0.15, ti: 10, eir: 0.35 }, M3: { L: 1.0, uo: 0.4, ul: 0.6, wet: 0.15, ti: 15, eir: 0.3 },
    M4: { L: 0.75, uo: 0.4, ul: 0.6, wet: 0.15, ti: 15, eir: 0.3 }, M5: { L: 0.5, uo: 0.35, ul: 0.4, wet: 0.15, ti: 15, eir: 0.3 }, M6: { L: 0.3, uo: 0.35, ul: 0.35, wet: 0.15, ti: 20, eir: 0.3 } } },
  c: { source: 'road.src.s.c', rows: { C0: { E: 50, uoE: 0.4 }, C1: { E: 30, uoE: 0.4 }, C2: { E: 20, uoE: 0.4 }, C3: { E: 15, uoE: 0.4 }, C4: { E: 10, uoE: 0.4 }, C5: { E: 7.5, uoE: 0.4 } } },
  p: { source: 'road.src.s.p', rows: { P1: { fE: 15, fEmin: 3 }, P2: { fE: 10, fEmin: 2 }, P3: { fE: 7.5, fEmin: 1.5 }, P4: { fE: 5, fEmin: 1 }, P5: { fE: 3, fEmin: 0.6 }, P6: { fE: 2, fEmin: 0.4 } }, capFactor: 1.5 },
};
// [F] Table 20: [road, conflict, E R1, E R2-R3, E R4 (lx), Eavg/Emin max, Lv,max/Lavg max]
export const RP8_00 = [
  ['freeway-a', 'none', 6, 9, 8, 3, 0.3], ['freeway-b', 'none', 4, 6, 5, 3, 0.3],
  ['expressway', 'high', 10, 14, 13, 3, 0.3], ['expressway', 'medium', 8, 12, 10, 3, 0.3], ['expressway', 'low', 6, 9, 8, 3, 0.3],
  ['major', 'high', 12, 17, 15, 3, 0.3], ['major', 'medium', 9, 13, 11, 3, 0.3], ['major', 'low', 6, 9, 8, 3, 0.3],
  ['collector', 'high', 8, 12, 10, 4, 0.4], ['collector', 'medium', 6, 9, 8, 4, 0.4], ['collector', 'low', 4, 6, 5, 4, 0.4],
  ['local', 'high', 6, 9, 8, 6, 0.4], ['local', 'medium', 5, 7, 6, 6, 0.4], ['local', 'low', 3, 4, 4, 6, 0.4],
].map(([road, conflict, r1, r23, r4, ratio, veil]) => ({ id: road + '.' + conflict, road, conflict, E: { R1: r1, R2: r23, R3: r23, R4: r4 }, ratio, veil }));
export const PAVEMENTS = ['R1', 'R2', 'R3', 'R4'];
/** Requirement values { L, uo, ul, ti, eir, E, uoE, ratio, veil, fE, fEmin, fEmax } of a cited class: set 'm' | 'c' | 'p' | 'rp8' (opts.pavement for RP-8). */
export function classValues(set, id, { pavement = 'R3' } = {}) {
  if (set === 'rp8') { const row = RP8_00.find((r) => r.id === id); return row ? { E: row.E[PAVEMENTS.includes(pavement) ? pavement : 'R3'], ratio: row.ratio, veil: row.veil } : null; }
  const S = CLASS_SETS[set], row = S && S.rows[id];
  if (!row) return null;
  const out = { ...row };
  delete out.wet;   // wet-road Uo needs a wet r-table: not offered (a stated gap)
  if (set === 'p') out.fEmax = row.fE * CLASS_SETS.p.capFactor;   // [S] Table 4 note a: the average must not exceed 1.5 times the class value
  return out;
}
/**
 * Checks of a result against requirement values (any may be absent or 0 = not checked): carriageway L ≥, uo ≥ (luminance), ul ≥, ti ≤, eir ≥, E ≥, uoE ≥ (illuminance
 * Uo), ratio ≤ (Eavg/Emin), veil ≤ (Lv,max/L̄); footways fE ≥, fEmin ≥, fEmax ≤. A criterion that needs the luminance without an r-table comes back with found null, ok null.
 */
export function roadChecks(res, req = {}) {
  const out = [], v = (k) => (fin(req[k], 0) > 0 ? fin(req[k], 0) : 0);
  const push = (area, key, op, r, found) => out.push({ area, key, op, req: r, found, ok: found === null || found === undefined ? null : op === '>=' ? found >= r - 1e-12 : found <= r + 1e-12 });
  for (const c of res.carriageways) {
    const a = 'cw' + c.index, Lm = c.luminance;
    if (v('L')) push(a, 'L', '>=', v('L'), Lm ? Lm.avg : null);
    if (v('uo')) push(a, 'uo', '>=', v('uo'), Lm ? Lm.uo : null);
    if (v('ul')) push(a, 'ul', '>=', v('ul'), Lm ? Lm.ul : null);
    if (v('ti')) push(a, 'ti', '<=', v('ti'), c.ti);
    if (v('veil')) push(a, 'veil', '<=', v('veil'), c.lvRatio);
    if (v('eir')) push(a, 'eir', '>=', v('eir'), c.eir.min);
    if (v('E')) push(a, 'E', '>=', v('E'), c.E.avg);
    if (v('uoE')) push(a, 'uoE', '>=', v('uoE'), c.E.uo);
    if (v('ratio')) push(a, 'ratio', '<=', v('ratio'), c.E.ratio === null ? Infinity : c.E.ratio);
  }
  for (const f of res.footways) {
    const a = 'fw' + f.index;
    if (v('fE')) push(a, 'fE', '>=', v('fE'), f.E.avg);
    if (v('fEmin')) push(a, 'fEmin', '>=', v('fEmin'), f.E.min);
    if (v('fEmax')) push(a, 'fEmax', '<=', v('fEmax'), f.E.avg);
  }
  return out;
}
const UNITS = { L: 'cd/m2', E: 'lx', fE: 'lx', fEmin: 'lx', fEmax: 'lx', ti: 'pct' };
/** One Problems line (warning) per criterion not met, and a note per criterion that could not be worked out (no r-table). t(key, vars) gives the words. */
export function roadProblems(res, t = (k) => k, { label = '' } = {}) {
  const out = [];
  for (const c of res.checks || []) {
    if (c.ok === true) continue;
    const area = t(c.area.startsWith('cw') ? 'road.area.cw' : 'road.area.fw', { n: Number(c.area.slice(2)) + 1 });
    const found = c.found === null || c.found === undefined ? null : c.found;
    out.push({
      code: 'road.' + c.key + (c.ok === null ? '.unknown' : ''), severity: c.ok === null ? 'note' : 'warning', part: c.area,
      text: c.ok === null ? t('road.prob.unknown', { what: t('road.chk.' + c.key), area }) : t('road.prob.fail', { what: t('road.chk.' + c.key), area, op: c.op === '>=' ? '≥' : '≤', req: round(c.req), found: found === Infinity ? '∞' : round(found), label }),
      req: { op: c.op, value: c.req, unit: UNITS[c.key] || '' }, found: { value: Number.isFinite(found) ? found : null, unit: UNITS[c.key] || '' },
      source: { name: 'lightdesign.road' },
    });
  }
  return out;
}
const round = (x) => (Number.isFinite(x) ? (Math.abs(x) >= 10 ? x.toFixed(1) : x.toFixed(2)) : '-');

/** The road result as CSV (one block per area: x, y, lux and, with an r-table, cd/m² of the lowest-average observer). Formula-looking text is quoted. */
export function roadCsv(res) {
  const q = (v) => { let x = String(v ?? ''); if (/^[=+\-@]/.test(x)) x = "'" + x; return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
  const rows = [['area', 'x_m', 'y_m', 'lux', 'cd_m2']];
  for (const c of res.carriageways) c.points.forEach((p, i) => rows.push(['carriageway ' + (c.index + 1), p[0].toFixed(3), p[1].toFixed(3), c.values[i].toFixed(2), c.luminance ? c.luminance.values[i].toFixed(3) : '']));
  for (const f of res.footways) f.points.forEach((p, i) => rows.push([f.kind + ' ' + (f.index + 1), p[0].toFixed(3), p[1].toFixed(3), f.values[i].toFixed(2), '']));
  return rows.map((r) => r.map(q).join(',')).join('\n') + '\n';
}
