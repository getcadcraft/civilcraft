/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-weld.js — weld group checks on a solved frame (0.10 SU.1811, session engineering-10). DOM-free; imports frame-solve.js (member end forces) and
 * frame-design.js (steel grades, design settings). An aid until an engineer has reviewed it: the report says so first and names every clause and assumption.
 * Own code, Apache-2.0: the methods are the published ones (cited below), nothing from another program was read.
 *
 * What a weld is here. A weld group lies in the cross-section plane of a member end (the plane the member's local y and z span; x is the member axis). Each
 * segment is a straight line in (y, z) mm, measured from the member's reference axis, with a size and a kind:
 *   fillet  size = leg length w (mm); throat a = w / sqrt 2 (AISC 360-16 §J2.2a "effective throat" for a 90 deg fillet; EN 1993-1-8 §4.5.2 throat height a)
 *   cjp     complete-joint-penetration butt weld, size = the thickness of the thinner part joined (the weld's effective throat equals it)
 * Not built (said in every report): partial-penetration welds (AISC Table J2.5 PJP rows, EN 1993-1-8 §4.7.2), skewed fillets and other included angles than 90 deg,
 * plug and slot welds, intermittent welds, the instantaneous-centre-of-rotation method (AISC Manual Part 8) and the EN 1993-1-8 §4.5.3.2 directional method
 * (the simplified method §4.5.3.3 is used), fatigue, and the base-metal block shear next to a weld.
 *
 * Forces on the group. The member end actions of a solved set (N, Vy, Vz, T, My, Mz at the i or j end, local axes, frame-solve.js sign convention) are what the
 * weld hands between joint and member. They are moved to the weld group's centroid (statics: M_c = M - c × F) and spread as a line section (every
 * segment is a line of unit thickness; "elastic vector method", the method of AISC Steel Construction Manual 15th ed. Part 8 "elastic method" and of
 * R. J. Blodgett, Design of Welded Structures, 1966, §7.4: weld force per unit length is a vector sum)
 *      q_x(y, z)  = F_x / L_w + (b y' + c z')                 out of plane (along the member): axial force and the two bending moments
 *      q_in(y, z) = (F_y, F_z) / L_w + (M_x,c / I_p') (-z', y')   in plane: the shears and the torsion about the group's centroid
 * with y', z' from the centroid, L_w the total length, I_y' = ∫ z'² dl, I_z' = ∫ y'² dl, I_yz' = ∫ y'z' dl, I_p' = I_y' + I_z' (b, c solve
 * [I_yz' I_y'; I_z' I_yz'] [b c]ᵀ = [M_y,c; -M_z,c]). The resultant per unit length q = |(q_x, q_in)| N/mm is taken at 21 points along every segment
 * (the strength of an AISC fillet depends on the angle, so the ends alone are not enough) and for every strength combination.
 *
 * Capacity per unit length, by code (`weld.code`; the same two families as frame-design.js):
 *   'asce-aisc'  ANSI/AISC 360-16 Chapter J.   Fillet (J2.4(a), Eq. J2-4, J2-5): φ R_n/l = 0.75 · F_nw · a, F_nw = 0.60 F_EXX (1.0 + 0.50 sin^1.5 θ), θ the
 *               angle between the resultant and the weld axis (0 = longitudinal). Base metal (J4.2(b) shear rupture, only when the segment names the part
 *               thickness `t`): φ 0.60 F_u t, φ = 0.75. CJP butt (Table J2.5): tension or compression normal to the weld axis, base metal: φ 0.90 F_y t; shear
 *               on the effective area, base metal: φ 0.60 F_y t with φ = 1.00 (J4.2(a)).
 *  'en'         EN 1993-1-8:2005 (+AC:2009).  Fillet, simplified method §4.5.3.3 (Eq. 4.3 / 4.4): F_w,Rd = f_vw,d · a, f_vw,d = (f_u / sqrt 3) / (β_w γ_M2),
 *               f_u the lower of the parts' ultimate strengths, β_w from Table 4.1, γ_M2 from the National Annex value kept in `design.na.steel`.
 *               CJP butt §4.7.1(1): the resistance of the weaker part joined, per unit length: normal stress σ ≤ f_y/γ_M0, shear τ ≤ f_y/(sqrt 3 γ_M0), and
 *               sqrt(σ² + 3 τ²) ≤ f_y/γ_M0.
 * Where each number comes from, and what was and was not checked against print: see `SOURCES` (exported, printed in the report) and docs/0.10-sessions/engineering-10.md.
 * Detailing warnings (not capacity): AISC §J2.2b minimum fillet size (Table J2.4) and maximum size, minimum length 4 w; EN 1993-1-8 §4.5.1 effective length not less
 * than 6 a or 30 mm and a not less than 3 mm.
 *
 *   weld = { code: 'asce-aisc' | 'en', grade, fexx (MPa, AISC weld metal; default 482.6 = E70), betaW (EN, overrides Table 4.1), tolerance? }   cleanWeldSettings(x)
 *   group = { id, member, end: 'i' | 'j', ref?, segments: [{ id, kind, size, y1, z1, y2, z2, t?, grade?, grade2? }] }
 *   groupProps(segments) → { L, yc, zc, Iy, Iz, Iyz, Ip, perSegment }   (mm, mm², mm³ per unit "thickness": a line section)
 *   lineForces(props, actions) → { at(seg, s) → { qx, qy, qz, q, longitudinal, transverse, theta } , centroidActions }      actions = [N Vy Vz T My Mz] N, N·mm
 *   segmentCapacity(seg, mat, weld, na) → { ... }      checkWelds(model, sol, groups, weld, { design }) → { ok, code, edition, groups: [...], max, notes, clauses }
 *   perimeterSegments(shape, size, parts?) → segments (I, RHS, CHS shapes welded all round)      weldTables(res, t) → report tables
 */
import { gradeProps, cleanDesign, DEFAULT_GRADE } from './frame-design.js';

export const EDITION = { 'asce-aisc': 'ANSI/AISC 360-16 Chapter J', en: 'EN 1993-1-8:2005+AC:2009' };
const SQRT2 = Math.SQRT2, SQRT3 = Math.sqrt(3);
export const FEXX_E70 = 482.6;      // MPa: AWS A5.1 classification E70xx = 70 ksi minimum tensile strength; 70 × 6.894757 = 482.63

/** EN 1993-1-8 Table 4.1, correlation factor β_w for fillet welds, by steel grade (EN 10025). S450 has no row in the table. */
export const BETA_W = Object.freeze({ S235: 0.8, S275: 0.85, S355: 0.9, S420: 1.0, S460: 1.0 });
/** AISC 360-16 Table J2.4 (SI form): minimum fillet leg by the thinner part joined (upper limit in mm, leg in mm). */
export const MIN_LEG = Object.freeze([[6, 3], [13, 5], [19, 6], [Infinity, 8]]);
export const SOURCES = Object.freeze([
  'ANSI/AISC 360-16, Specification for Structural Steel Buildings, Chapter J: §J2.2a effective area, §J2.2b minimum and maximum size, Table J2.4, §J2.4 Eq. J2-4/J2-5, Table J2.5, §J4.2',
  'ANSI/AISC 360-16 Commentary / AISC Steel Construction Manual 15th ed., Part 8: weld group as lines, elastic vector method; 1.392 kip/in per sixteenth of an inch for an E70 fillet (= 0.75 · 0.60 · 70 · 0.7071 / 16)',
  'EN 1993-1-8:2005+AC:2009: §4.5.1, §4.5.2, §4.5.3.3 Eq. (4.3)-(4.4), Table 4.1, §4.7.1; National Annex γM2 (recommended 1.25) in the project settings',
  'R. J. Blodgett, Design of Welded Structures, James F. Lincoln Arc Welding Foundation, 1966, §7.4 (weld groups treated as lines)',
]);

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export function cleanWeldSettings(x) {
  const o = x && typeof x === 'object' ? x : {};
  const code = o.code === 'en' ? 'en' : 'asce-aisc';
  const d = cleanDesign({ code, grade: o.grade, na: o.na });
  const n = (v, def, lo, hi) => (fin(v) && v >= lo && v <= hi ? v : def);
  return { code, grade: d.grade, fexx: n(o.fexx, FEXX_E70, 200, 1000), betaW: n(o.betaW, null, 0.5, 2), na: d.na, design: d };
}

// ------------------------------------------------------------------------------------------------------------- group geometry

const segLen = (s) => Math.hypot(s.y2 - s.y1, s.z2 - s.z1);

/** Line-section properties of a weld group about its centroid (the segments are lines of unit thickness). */
export function groupProps(segments) {
  let L = 0, Sy = 0, Sz = 0;
  for (const s of segments) { const l = segLen(s); L += l; Sy += l * (s.y1 + s.y2) / 2; Sz += l * (s.z1 + s.z2) / 2; }
  if (!(L > 0)) return { L: 0, yc: 0, zc: 0, Iy: 0, Iz: 0, Iyz: 0, Ip: 0 };
  const yc = Sy / L, zc = Sz / L;
  let Iy = 0, Iz = 0, Iyz = 0;
  for (const s of segments) {
    const l = segLen(s), y1 = s.y1 - yc, z1 = s.z1 - zc, y2 = s.y2 - yc, z2 = s.z2 - zc;
    Iy += l * (z1 * z1 + z1 * z2 + z2 * z2) / 3;                    // ∫ z'² dl along a straight line
    Iz += l * (y1 * y1 + y1 * y2 + y2 * y2) / 3;
    Iyz += l * (2 * y1 * z1 + y1 * z2 + y2 * z1 + 2 * y2 * z2) / 6;
  }
  return { L, yc, zc, Iy, Iz, Iyz, Ip: Iy + Iz };
}

/** Move the end actions [N Vy Vz T My Mz] (acting at the member axis, the origin of the segments) to the group centroid c = (0, yc, zc): M_c = M - c × F
 *  (the moment about c of a force at the origin; the line forces then integrate back to M about the origin: tested by equilibrium in bin/test-frame-weld.mjs). */
export function centroidActions(P, a) {
  const [N, Vy, Vz, T, My, Mz] = a;
  return { Fx: N, Fy: Vy, Fz: Vz, Mx: T - (P.yc * Vz - P.zc * Vy), My: My - P.zc * N, Mz: Mz + P.yc * N };
}

/** The solved distribution: returns f(y, z) → { qx, qy, qz } force per unit length (N/mm) at a point of the group. */
export function lineForces(P, a) {
  const c = centroidActions(P, a);
  const qx0 = c.Fx / P.L, qy0 = c.Fy / P.L, qz0 = c.Fz / P.L;
  // q_x = qx0 + b y' + c z':  ∫ z' q_x = M_y,c = b Iyz + c Iy ;  ∫ y' q_x = -M_z,c = b Iz + c Iyz
  const det = P.Iyz * P.Iyz - P.Iy * P.Iz;
  let b = 0, cc = 0;
  if (Math.abs(det) > 1e-12 * Math.max(1, P.Iy * P.Iz)) { b = (c.My * P.Iyz - P.Iy * -c.Mz) / det; cc = (P.Iyz * -c.Mz - P.Iz * c.My) / det; }
  else if (P.Iy > 0 && P.Iz <= 1e-12 * P.Iy) cc = c.My / P.Iy;      // all segments on one horizontal line
  else if (P.Iz > 0 && P.Iy <= 1e-12 * P.Iz) b = -c.Mz / P.Iz;
  const kappa = P.Ip > 0 ? c.Mx / P.Ip : 0;
  return { c, at: (y, z) => { const yp = y - P.yc, zp = z - P.zc; return { qx: qx0 + b * yp + cc * zp, qy: qy0 - kappa * zp, qz: qz0 + kappa * yp }; } };
}

// ------------------------------------------------------------------------------------------------------------- capacity per unit length

/** Minimum fillet leg (mm) of AISC Table J2.4 for the thinner part t (mm). */
export const minLegAISC = (t) => MIN_LEG.find(([hi]) => t <= hi)[1];

/**
 * Capacity of one segment at one point. `f` = the point's force per length { qx, qy, qz }; t = the segment's unit direction (in plane).
 * Returns the list of checks [{ id, clause, demand, capacity, ratio, unit: 'N/mm' | 'MPa' }].
 */
export function segmentChecks(seg, f, W, mat) {
  const out = [];
  const l = Math.hypot(seg.y2 - seg.y1, seg.z2 - seg.z1) || 1, ty = (seg.y2 - seg.y1) / l, tz = (seg.z2 - seg.z1) / l;
  const q = Math.hypot(f.qx, f.qy, f.qz);
  const qL = Math.abs(f.qy * ty + f.qz * tz);                       // along the weld axis
  const qInT = Math.abs(-f.qy * tz + f.qz * ty);                    // in plane, square to the weld
  const add = (id, clause, demand, capacity, unit) => out.push({ id, clause, demand, capacity, ratio: capacity > 0 ? demand / capacity : Infinity, unit });
  if (seg.kind === 'fillet') {
    const a = seg.size / SQRT2;
    if (W.code === 'asce-aisc') {
      const sinT = q > 1e-12 ? Math.sqrt(Math.max(0, 1 - Math.min(1, qL / q) ** 2)) : 0;     // θ: the angle between the resultant and the weld axis
      const Fnw = 0.60 * W.fexx * (1 + 0.5 * Math.pow(sinT, 1.5));
      add('fillet-weld', 'AISC 360-16 §J2.4(a), Eq. J2-4, J2-5', q, 0.75 * Fnw * a, 'N/mm');
      if (seg.t > 0 && mat.fu) add('base-shear', 'AISC 360-16 §J4.2(b)', q, 0.75 * 0.60 * mat.fu * seg.t, 'N/mm');
    } else {
      const beta = W.betaW ?? mat.betaW;
      add('fillet-weld', 'EN 1993-1-8 §4.5.3.3, Eq. (4.3), (4.4)', q, mat.fu / SQRT3 / (beta * W.na.steel.gammaM2) * a, 'N/mm');
    }
  } else {                                                           // cjp
    const t = seg.size, sig = Math.abs(f.qx) / t, tau = Math.hypot(qL, qInT) / t;
    if (W.code === 'asce-aisc') {
      add('butt-normal', 'AISC 360-16 Table J2.5 (CJP, tension/compression normal to the weld axis)', sig, 0.90 * mat.fy, 'MPa');
      add('butt-shear', 'AISC 360-16 Table J2.5, §J4.2(a) (CJP, shear)', tau, 1.00 * 0.60 * mat.fy, 'MPa');
    } else {
      const fyd = mat.fy / W.na.steel.gammaM0;
      add('butt-normal', 'EN 1993-1-8 §4.7.1(1) with EN 1993-1-1 (6.1)', sig, fyd, 'MPa');
      add('butt-shear', 'EN 1993-1-8 §4.7.1(1) with EN 1993-1-1 (6.18)', tau, fyd / SQRT3, 'MPa');
      add('butt-combined', 'EN 1993-1-8 §4.7.1(1) with EN 1993-1-1 (6.1), von Mises', Math.sqrt(sig * sig + 3 * tau * tau), fyd, 'MPa');
    }
  }
  return out;
}

/** Steel of one segment: its grade (or the group's), the weaker of grade and grade2 for fu (EN). */
function segmentMaterial(seg, W) {
  const code = W.code;
  const g1 = gradeProps(code, seg.grade || W.grade, seg.t || 0), g2 = seg.grade2 ? gradeProps(code, seg.grade2, 0) : g1;
  if (!g1 || !g2) return { error: 'no-grade' };
  const grade = seg.grade || W.grade, grade2 = seg.grade2 || grade;
  const fu = fin(seg.fu) && seg.fu > 0 ? seg.fu : Math.min(g1.fu, g2.fu), fy = Math.min(g1.fy, g2.fy);   // seg.fu: the user's own value (mill certificate) wins
  let betaW = null;
  if (code === 'en' && seg.kind === 'fillet' && W.betaW === null) {
    const key = (n) => String(n).match(/^S\d{3}/)?.[0];
    const bs = [key(grade), key(grade2)].map((k) => BETA_W[k]);
    if (bs.some((b) => b === undefined)) return { error: 'no-beta' };
    betaW = Math.max(...bs);                                         // dissimilar grades: the larger β_w (smaller resistance) is used, on the safe side of Table 4.1's own note (lower grade's β_w); said in the log
  }
  return { fu, fy, betaW };
}

/** Detailing warnings of a segment (codes only; the app words them). */
function detailing(seg, W) {
  const w = [];
  const l = segLen(seg);
  if (seg.kind === 'fillet') {
    if (W.code === 'asce-aisc') {
      if (seg.t > 0 && seg.size < minLegAISC(seg.t)) w.push({ code: 'min-leg', need: minLegAISC(seg.t), clause: 'AISC 360-16 Table J2.4' });
      if (seg.t > 0 && seg.size > (seg.t >= 6 ? seg.t - 2 : seg.t)) w.push({ code: 'max-leg', need: seg.t >= 6 ? seg.t - 2 : seg.t, clause: 'AISC 360-16 §J2.2b(b)' });
      if (l < 4 * seg.size) w.push({ code: 'min-length', need: 4 * seg.size, clause: 'AISC 360-16 §J2.2b(c)' });
    } else {
      const a = seg.size / SQRT2;
      if (a < 3) w.push({ code: 'min-throat', need: 3, clause: 'EN 1993-1-8 §4.5.1' });
      if (l < Math.max(30, 6 * a)) w.push({ code: 'min-length', need: Math.max(30, 6 * a), clause: 'EN 1993-1-8 §4.5.1' });
    }
  }
  return w;
}

// ------------------------------------------------------------------------------------------------------------- the check

const PTS = 21;

/**
 * Check weld groups against a solved frame. Every strength combination (limit 'strength') is run; per group the governing set, segment, point and check are kept.
 * A group refers to a member id and an end. Returns { ok, error?, groups: [{ id, member, end, ref, status 'ok' | 'fail' | 'not-checked', util, set, setName, governs: { segment, s, check }, props, segments: [...], warnings }] }.
 */
export function checkWelds(model, sol, groups, weldIn, { n = 0 } = {}) {
  const W = cleanWeldSettings(weldIn);
  if (!sol?.ok) return { ok: false, error: 'no-solution' };
  const strength = model.combos.filter((c) => c.limit === 'strength' && sol.results['combo:' + c.id]);
  if (!strength.length) return { ok: false, error: 'no-combos' };
  const mIdx = new Map(model.members.map((m, k) => [m.id, k]));
  const res = [];
  for (const g of groups) {
    const row = { id: g.id, member: g.member, end: g.end === 'j' ? 'j' : 'i', ref: g.ref || '', status: 'ok', util: 0, set: '', setName: '', governs: null, segments: [], warnings: [] };
    const k = mIdx.get(g.member);
    const segs = (g.segments || []).filter((s) => ['fillet', 'cjp'].includes(s.kind) && fin(s.size) && s.size > 0 && [s.y1, s.z1, s.y2, s.z2].every(fin) && segLen(s) > 0);
    if (k === undefined) { res.push({ ...row, status: 'not-checked', util: null, why: 'no-member' }); continue; }
    if (!segs.length) { res.push({ ...row, status: 'not-checked', util: null, why: 'no-segments' }); continue; }
    const mats = segs.map((s) => segmentMaterial(s, W));
    const bad = mats.find((m) => m.error);
    if (bad) { res.push({ ...row, status: 'not-checked', util: null, why: bad.error }); continue; }
    const P = groupProps(segs);
    const segRows = segs.map((s, i) => ({ id: s.id ?? 's' + (i + 1), kind: s.kind, size: s.size, length: segLen(s), util: 0, set: '', check: null, q: 0 }));
    for (const s of segs) row.warnings.push(...detailing(s, W).map((w) => ({ ...w, segment: s.id })));
    row.props = P;
    const perSet = [];
    for (const cb of strength) {
      const R = sol.results['combo:' + cb.id];
      const e = R.ends.subarray(12 * k + (row.end === 'j' ? 6 : 0), 12 * k + (row.end === 'j' ? 12 : 6));
      const F = lineForces(P, Array.from(e));
      let setWorst = { ratio: -1 };
      segs.forEach((s, i) => {
        for (let p = 0; p < PTS; p++) {
          const u = p / (PTS - 1), y = s.y1 + (s.y2 - s.y1) * u, z = s.z1 + (s.z2 - s.z1) * u;
          const f = F.at(y, z);
          const cks = segmentChecks(s, f, W, mats[i]);
          for (const c of cks) {
            const cand = { ...c, segment: segRows[i].id, s: u, f, set: cb.id, setName: cb.name };
            if (c.ratio > setWorst.ratio) setWorst = cand;
            if (c.ratio > segRows[i].util) { segRows[i].util = c.ratio; segRows[i].set = cb.id; segRows[i].setName = cb.name; segRows[i].check = { id: c.id, clause: c.clause, demand: c.demand, capacity: c.capacity, unit: c.unit, s: u }; segRows[i].q = Math.hypot(f.qx, f.qy, f.qz); }
          }
        }
      });
      perSet.push({ set: cb.id, name: cb.name, util: setWorst.ratio, centroid: F.c, worst: setWorst });
      if (setWorst.ratio > row.util || !row.governs) { row.util = setWorst.ratio; row.set = cb.id; row.setName = cb.name; row.governs = { segment: setWorst.segment, s: setWorst.s, check: setWorst.id, clause: setWorst.clause, demand: setWorst.demand, capacity: setWorst.capacity, unit: setWorst.unit, f: setWorst.f }; }
    }
    row.sets = perSet; row.segments = segRows; row.status = row.util > 1 ? 'fail' : 'ok';
    res.push(row);
  }
  const checked = res.filter((r) => r.util !== null);
  const clauses = new Set();
  for (const r of checked) for (const s of r.segments) if (s.check) clauses.add(s.check.clause);
  return {
    ok: true, code: W.code, edition: EDITION[W.code], weld: W, groups: res, max: checked.reduce((a, r) => Math.max(a, r.util), 0),
    counts: { groups: res.length, failed: checked.filter((r) => r.status === 'fail').length, notChecked: res.length - checked.length, combos: strength.length }, clauses: [...clauses].sort(), sources: SOURCES,
  };
}

// ------------------------------------------------------------------------------------------------------------- welds all round a section

/**
 * Segments of a weld all round a member's section, in the member's local (y, z): shape = { kind: 'I', d, bf, tw, tf, r } | { kind: 'RHS', h, b } | { kind: 'CHS', D }.
 * parts: 'all' (default) | 'flanges' | 'web' (I only). Fillets of leg `size` on every face listed; I: flange outsides, flange insides (either side of the root fillet),
 * web both faces between the root fillets. `t` (thinner part's thickness) is set to the plate or section wall when given.
 */
export function perimeterSegments(shape, size, { parts = 'all', t = undefined, kind = 'fillet', grade = undefined, grade2 = undefined } = {}) {
  const S = [];
  const add = (y1, z1, y2, z2, tt) => S.push({ id: 'w' + (S.length + 1), kind, size, y1, z1, y2, z2, ...(tt ? { t: tt } : {}), ...(grade ? { grade } : {}), ...(grade2 ? { grade2 } : {}) });
  if (shape.kind === 'I') {
    const { d, bf, tw, tf } = shape, r = shape.r || 0, h = d / 2;
    if (parts !== 'web') for (const sg of [1, -1]) {
      add(-bf / 2, sg * h, bf / 2, sg * h, tf);                                        // flange outside
      const zi = sg * (h - tf);
      add(-bf / 2, zi, -(tw / 2 + r), zi, tf); add(tw / 2 + r, zi, bf / 2, zi, tf);    // flange inside, either side of the web
    }
    if (parts !== 'flanges') for (const sy of [1, -1]) add(sy * tw / 2, -(h - tf - r), sy * tw / 2, h - tf - r, tw);
  } else if (shape.kind === 'RHS') {
    const { h, b } = shape;
    add(-b / 2, h / 2, b / 2, h / 2, t); add(b / 2, h / 2, b / 2, -h / 2, t); add(b / 2, -h / 2, -b / 2, -h / 2, t); add(-b / 2, -h / 2, -b / 2, h / 2, t);
  } else if (shape.kind === 'CHS') {
    const R = shape.D / 2, m = 48;
    for (let i = 0; i < m; i++) { const a = 2 * Math.PI * i / m, b = 2 * Math.PI * (i + 1) / m; add(R * Math.cos(a), R * Math.sin(a), R * Math.cos(b), R * Math.sin(b), t); }
  }
  return S;
}

// ------------------------------------------------------------------------------------------------------------- report

const pc = (v) => (v === null || !Number.isFinite(v) ? '' : (Math.round(v * 1000) / 10).toFixed(1) + ' %');
const num = (v, d = 1) => (Number.isFinite(v) ? v.toFixed(d) : '');

/** Report tables (words from the app's t(), keys frame.weld.*). */
export function weldTables(res, t) {
  const T = [];
  const W = res.weld;
  /* i18n-ignore-start: units and symbols */
  T.push({ title: t('frame.weld.title'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [
    [t('frame.weld.not-reviewed'), ''],
    [t('frame.weld.code'), res.edition],
    [t('frame.weld.steel'), W.grade + (W.code === 'asce-aisc' ? ' · F_EXX ' + W.fexx + ' MPa' : ' · γM2 ' + W.na.steel.gammaM2)],
    [t('frame.weld.method'), t('frame.weld.method-text-' + W.code)],
    [t('frame.weld.not-built'), t('frame.weld.not-built-text')],
    [t('frame.weld.counts'), t('frame.weld.counts-text', { n: res.counts.groups - res.counts.notChecked, bad: res.counts.failed, skip: res.counts.notChecked, combos: res.counts.combos })],
    ...res.sources.map((s) => [t('frame.weld.source'), s]),
  ] });
  T.push({ title: t('frame.weld.summary'), head: [t('frame.weld.group'), t('frame.rep.member'), t('frame.weld.end'), t('frame.des.util'), t('frame.des.state'), t('frame.des.set'), t('frame.weld.segment'), t('frame.des.check-name'), t('frame.des.clause')], numeric: [3],
    rows: res.groups.map((g) => g.util === null
      ? [g.id, g.member, g.end, '', t('frame.des.st.not-checked'), '', '', t('frame.weld.why.' + g.why), '']
      : [g.id, g.member, g.end, pc(g.util), t('frame.des.st.' + g.status), g.setName, g.governs.segment, t('frame.weld.check.' + g.governs.check), g.governs.clause]) });
  for (const g of res.groups) {
    if (g.util === null) continue;
    T.push({ title: t('frame.weld.group-title', { id: g.id, member: g.member, set: g.setName }), head: [t('frame.weld.segment'), t('frame.weld.kind'), t('frame.weld.size') + ' (mm)', 'L (mm)', t('frame.weld.demand'), t('frame.weld.capacity'), t('frame.des.util'), t('frame.des.check-name')], numeric: [2, 3, 4, 5, 6],
      rows: g.segments.map((s) => [s.id, t('frame.weld.kind.' + s.kind), num(s.size), num(s.length, 0), s.check ? num(s.check.demand, s.check.unit === 'MPa' ? 1 : 1) + ' ' + s.check.unit : '', s.check ? num(s.check.capacity, 1) + ' ' + s.check.unit : '', pc(s.util), s.check ? t('frame.weld.check.' + s.check.id) : ''] ) });
    for (const w of g.warnings) T.push({ title: t('frame.weld.warning'), head: [t('frame.weld.segment'), t('frame.des.clause'), t('frame.rep.value')], numeric: [2], rows: [[w.segment, w.clause, t('frame.weld.warn.' + w.code, { need: num(w.need, 1) })]] });
  }
  /* i18n-ignore-end */
  T.push({ title: t('frame.des.clauses'), head: [t('frame.des.clause')], numeric: [], rows: res.clauses.map((c) => [c]) });
  return T;
}
