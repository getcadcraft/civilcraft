/* SPDX-License-Identifier: Apache-2.0 */
/**
 * frame-design.js — member checks on a solved frame (0.7 SU.878, session make-07): the code-neutral engine. DOM-free; imports
 * frame-solve.js (diagrams), frame-combos.js (the National Annex table) and the two code modules. An aid until an engineer has
 * reviewed it (owner, LC.4): the panel and the report say so first, then name every clause and every assumption.
 *
 * Two code families, chosen per project (`design.code`):
 *   'asce-aisc'  ASCE 7-16 combinations + ANSI/AISC 360-16 (LRFD)     frame-combos.js, frame-design-aisc.js
 *   'en'         EN 1990 combinations + EN 1993-1-1 (+ editable National Annex values)   frame-combos.js, frame-design-en.js
 *
 * What the model must carry: each section's `shape` { kind: 'I', d, bf, tw, tf, r, welded? } (mm; the section's A, Iy, Iz, J
 * stay the analysis's own); the steel grade and unbraced lengths come from the design settings. A member whose section has no
 * I shape, a welded shape, a class-4 / slender part, or whose steel is not known is reported "not checked" with the reason —
 * never a number.
 *
 *   design = { code: 'none' | 'asce-aisc' | 'en', grade, ky, kz, lbRatio, deflLimit, eq, torsionFree, na: { combos, steel },
 *              overrides: { <memberId>: { ky?, kz?, lb?, grade? } } }       cleanDesign(untrusted) → design
 *   GRADES[code] → { name: { fy, fu, fy40? } }            gradeProps(code, name, tmax) → { fy, fu } (EN: thickness > 40 mm lowers fy)
 *   checkFrame(model, sol, design, { n }) → { ok, code, edition, members: [...], notes, clauses, max }
 *     member: { id, ref, section, status 'ok' | 'fail' | 'not-checked', util, set, check { id, clause, ratio }, why?,
 *               sets: [{ set, name, util, checks: [{ id, clause, demand, capacity, ratio, unit, x }] }], info }
 *   utilRamp(u) → [r, g, b] (0–1): the colour a member gets in the view for its utilisation
 *   designTables(result, t) → report tables (summary, clauses, assumptions, per-member checks of the governing set)
 */
import { diagram } from './frame-solve.js';
import { cleanNA } from './frame-combos.js';
import * as AISC from './frame-design-aisc.js';
import * as EN from './frame-design-en.js';

export const GRADES = Object.freeze({
  'asce-aisc': Object.freeze({ A992: { fy: 345, fu: 450 }, A36: { fy: 250, fu: 400 }, 'A572 Gr 50': { fy: 345, fu: 450 }, 'A913 Gr 65': { fy: 450, fu: 550 } }),
  en: Object.freeze({ S235: { fy: 235, fu: 360, fy40: 215, fu40: 360 }, S275: { fy: 275, fu: 430, fy40: 255, fu40: 410 }, S355: { fy: 355, fu: 490, fy40: 335, fu40: 470 }, S450: { fy: 440, fu: 550, fy40: 410, fu40: 550 } }),
});
export const DEFAULT_GRADE = Object.freeze({ 'asce-aisc': 'A992', en: 'S355' });
// SI values as rounded in AISC 360 (A36 36 ksi → 250 MPa, 50 ksi grades → 345 MPa)

export function gradeProps(code, name, tmax = 0) {
  const g = GRADES[code]?.[name];
  if (!g) return null;
  return code === 'en' && tmax > 40 ? { fy: g.fy40, fu: g.fu40 } : { fy: g.fy, fu: g.fu };      // EN 10025-2 Table 7: 16–40 mm / 40–80 mm
}

export function cleanDesign(x) {
  const o = x && typeof x === 'object' ? x : {};
  const code = o.code === 'asce-aisc' || o.code === 'en' ? o.code : 'none';
  const n = (v, d, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d);
  const grade = code !== 'none' && GRADES[code][o.grade] ? o.grade : DEFAULT_GRADE[code] || '';
  const overrides = {};
  if (o.overrides && typeof o.overrides === 'object') {
    for (const [id, v] of Object.entries(o.overrides).slice(0, 5000)) {
      if (!v || typeof v !== 'object') continue;
      const r = {};
      if (n(v.ky, null, 0.1, 10) !== null) r.ky = v.ky;
      if (n(v.kz, null, 0.1, 10) !== null) r.kz = v.kz;
      if (n(v.lb, null, 1, 1e7) !== null) r.lb = v.lb;
      if (code !== 'none' && GRADES[code][v.grade]) r.grade = v.grade;
      if (Object.keys(r).length) overrides[String(id).slice(0, 80)] = r;
    }
  }
  return {
    code, grade, ky: n(o.ky, 1, 0.1, 10), kz: n(o.kz, 1, 0.1, 10), lbRatio: n(o.lbRatio, 1, 0.01, 1), deflLimit: n(o.deflLimit, 360, 10, 5000),
    eq: o.eq === '6.10ab' ? '6.10ab' : '6.10', torsionFree: o.torsionFree !== false,
    na: { combos: cleanNA(o.na?.combos), steel: EN.cleanSteelNA(o.na?.steel) }, overrides,
  };
}

/** I-shape record of a section, or null (kind I only; a welded shape is refused later with its own reason). */
export function shapeOf(sec) {
  const s = sec?.shape;
  if (!s || s.kind !== 'I') return null;
  const ok = ['d', 'bf', 'tw', 'tf'].every((k) => Number.isFinite(s[k]) && s[k] > 0);
  return ok ? { d: s.d, bf: s.bf, tw: s.tw, tf: s.tf, r: Number.isFinite(s.r) && s.r >= 0 ? s.r : 0, welded: !!s.welded } : null;
}

// ---------------------------------------------------------------------------------------------------------------- helpers

const at = (x, a, xq) => {                                   // linear interpolation of a series
  if (xq <= x[0]) return a[0];
  const n = x.length - 1;
  if (xq >= x[n]) return a[n];
  let k = 0;
  while (x[k + 1] < xq) k++;
  const f = (xq - x[k]) / (x[k + 1] - x[k] || 1);
  return a[k] + f * (a[k + 1] - a[k]);
};
/** The stations inside [x0, x1] plus both ends, for the named series. */
function segment(d, x0, x1, keys) {
  const idx = d.x.map((v, k) => k).filter((k) => d.x[k] > x0 + 1e-9 && d.x[k] < x1 - 1e-9);
  const xs = [x0, ...idx.map((k) => d.x[k]), x1];
  const out = { x: xs };
  for (const key of keys) out[key] = [at(d.x, d[key], x0), ...idx.map((k) => d[key][k]), at(d.x, d[key], x1)];
  return out;
}
const quart = (x, M) => {                                    // |M| at the quarter points of a segment, and its maximum
  const L = x[x.length - 1] - x[0];
  const q = (f) => Math.abs(at(x, M, x[0] + f * L));
  return { max: Math.max(...M.map(Math.abs)), a: q(0.25), b: q(0.5), c: q(0.75) };
};
const maxAbs = (a) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

// ---------------------------------------------------------------------------------------------------------------- checks

/** Everything one member needs from its section, steel and bracing, before any load. */
function memberSetup(model, prep, k, design, E, G) {
  const m = model.members[k];
  const sec = model.sections.find((s) => s.id === m.section);
  const ov = design.overrides[m.id] || {};
  const base = { id: m.id, ref: m.from?.ref || '', section: sec?.name || m.section };
  const shape = shapeOf(sec);
  if (!shape) return { ...base, skip: 'no-shape' };
  if (shape.welded) return { ...base, skip: 'welded' };
  const grade = ov.grade || design.grade;
  const g = gradeProps(design.code, grade, Math.max(shape.tf, shape.tw));
  if (!g) return { ...base, skip: 'no-grade' };
  const L = prep.mem[k].ax.L;
  const lb = Math.min(L, ov.lb ?? design.lbRatio * L);
  const nseg = Math.max(1, Math.ceil(L / lb - 1e-9));
  const bounds = Array.from({ length: nseg + 1 }, (_, i) => Math.min(L, i * lb));
  const ky = ov.ky ?? design.ky, kz = ov.kz ?? design.kz;
  return { ...base, shape, sec, L, lb, bounds, ky, kz, grade, fy: g.fy, fu: g.fu, E, G, Lcy: ky * L, Lcz: kz * lb, Lt: lb };
}

function checkAISC(S, d, R, design) {
  const p = AISC.props(S.shape, S.sec);
  const sl = AISC.slender(p, S.fy, S.E);
  const skipComp = sl.compression && Math.min(...d.N) < -1;       // E7 not built: the compression checks are left out and the member is "partly checked"
  if (sl.bending && Math.max(maxAbs(d.My), maxAbs(d.Mz)) > 1000) return { skip: sl.bending.why, clause: 'AISC 360-16 §' + sl.bending.clause };
  const out = [];
  const add = (id, clause, demand, capacity, unit, x = null) => out.push({ id, clause, demand, capacity, ratio: capacity > 0 ? demand / capacity : Infinity, unit, x });
  const Nmax = Math.max(...d.N), Nmin = Math.min(...d.N);
  const t = AISC.tension(p, S.fy, S.fu);
  if (Nmax > 0) add('tension', 'AISC 360-16 §' + t.clause, Nmax, t.phiPn, 'N');
  const c = AISC.compression(p, S.fy, S.E, S.G, S.Lcy, S.Lcz, S.Lt);
  if (Nmin < 0 && !skipComp) add('compression', 'AISC 360-16 §E3' + (c.mode === 't' ? ', E4' : ''), -Nmin, c.phiPn, 'N');
  const minor = AISC.flexureMinor(p, S.fy, S.E);
  const Vmaj = AISC.shearMajor(p, S.fy, S.E), Vmin = AISC.shearMinor(p, S.fy, S.E);
  add('shear-z', 'AISC 360-16 §G2.1', maxAbs(d.Vz), Vmaj.phiVn, 'N');
  add('shear-y', 'AISC 360-16 §G4', maxAbs(d.Vy), Vmin.phiVn, 'N');
  add('bending-z', 'AISC 360-16 §F6', maxAbs(d.Mz), minor.phiMn, 'N·mm');
  const segs = [];
  for (let s = 0; s + 1 < S.bounds.length; s++) {
    const sg = segment(d, S.bounds[s], S.bounds[s + 1], ['My', 'Mz', 'N']);
    const Cb = AISC.cb(quart(sg.x, sg.My));
    const fl = AISC.flexureMajor(p, S.fy, S.E, S.bounds[s + 1] - S.bounds[s], Cb);
    const My = maxAbs(sg.My);
    add('bending-y', 'AISC 360-16 §F2' + (fl.flb ? ', F3' : ''), My, fl.phiMn, 'N·mm', sg.x[0]);
    let worst = { ratio: -1 };
    sg.x.forEach((x, k) => {
      const N = sg.N[k], Pc = N < 0 ? c.phiPn : t.phiPn;
      if (N < 0 && skipComp) return;
      const h = AISC.interaction(Math.abs(N), Pc, Math.abs(sg.My[k]), fl.phiMn, Math.abs(sg.Mz[k]), minor.phiMn);
      if (h.ratio > worst.ratio) worst = { ...h, x };
    });
    if (worst.ratio >= 0) add('interaction', 'AISC 360-16 §' + worst.eq, worst.ratio, 1, '', worst.x);
    segs.push({ Cb, Lb: S.bounds[s + 1] - S.bounds[s], Lp: fl.Lp, Lr: fl.Lr, zone: fl.zone, phiMn: fl.phiMn });
  }
  return { checks: out, partial: skipComp ? [sl.compression.why] : [], info: { Zx: p.Zx, Zy: p.Zy, phiPnc: c.phiPn, mode: c.mode, KLry: c.KLry, KLrz: c.KLrz, segs, Fy: S.fy } };
}

function checkEN(S, d, R, design, hasPoint) {
  const na = design.na.steel;
  const p = EN.props(S.shape, S.sec);
  const cl = EN.classify(p, S.fy);
  const hasN = Math.min(...d.N) < -1, hasM = Math.max(maxAbs(d.My), maxAbs(d.Mz)) > 1000;
  if (hasM && cl.bending === 4) return { skip: 'class-4', clause: 'EN 1993-1-1 Table 5.2' };
  const skipComp = hasN && cl.compression === 4;                  // no effective-section method: compression left out, "partly checked"
  const cls = Math.max(hasM ? cl.bending : 1, hasN && !skipComp ? cl.compression : 1);
  const out = [];
  const add = (id, clause, demand, capacity, unit, x = null) => out.push({ id, clause, demand, capacity, ratio: capacity > 0 ? demand / capacity : Infinity, unit, x });
  const Nmax = Math.max(...d.N), Nmin = Math.min(...d.N);
  const E = S.E, G = S.G;
  const t = EN.tension(p, S.fy, S.fu, na);
  if (Nmax > 0) add('tension', 'EN 1993-1-1 §' + t.clause, Nmax, t.NtRd, 'N');
  const cs = EN.compressionCS(p, S.fy, na);
  const bk = EN.buckling(p, S.fy, E, G, S.Lcy, S.Lcz, S.Lt, na);
  if (Nmin < 0 && !skipComp) {
    add('compression-section', 'EN 1993-1-1 §6.2.4', -Nmin, cs.NcRd, 'N');
    add('compression', 'EN 1993-1-1 §6.3.1' + (bk.mode === 't' ? '.4' : '.1'), -Nmin, bk.NbRd, 'N');
  }
  const sz = EN.shearMajor(p, S.fy, na), sy = EN.shearMinor(p, S.fy, na);
  const Vz = maxAbs(d.Vz);
  add('shear-z', sz.buckling ? 'EN 1993-1-5 §5.2' : 'EN 1993-1-1 §6.2.6', Vz, sz.VRd, 'N');
  const partial = skipComp ? ['class-4'] : [];
  if (sz.buckling && Vz > 0.5 * sz.VbRd) partial.push('shear-buckling-interaction');      // EN 1993-1-5 §7.1 not built
  add('shear-y', 'EN 1993-1-1 §6.2.6', maxAbs(d.Vy), sy.VplRd, 'N');
  const bz = EN.bendingMinor(p, S.fy, na, cl.bending);
  add('bending-z', 'EN 1993-1-1 §6.2.5', maxAbs(d.Mz), bz.McRd, 'N·mm');
  const bv = EN.bendingWithShear(p, S.fy, na, cl.bending, Vz, sz.VplRd);
  const Wy = cls <= 2 ? p.Wply : p.Wely, Wz = cls <= 2 ? p.Wplz : p.Welz;
  const R2 = { NRk: p.A * S.fy, MyRk: Wy * S.fy, MzRk: Wz * S.fy };
  const segs = [];
  for (let s = 0; s + 1 < S.bounds.length; s++) {
    const sg = segment(d, S.bounds[s], S.bounds[s + 1], ['My', 'Mz', 'N']);
    const Lb = S.bounds[s + 1] - S.bounds[s];
    const C1 = AISCCb(sg);
    const lt = EN.ltb(p, S.fy, E, G, Lb, C1, cl.bending, na);
    const My = maxAbs(sg.My);
    add('bending-section', 'EN 1993-1-1 §6.2.5' + (bv.rho ? ', 6.2.8' : ''), My, bv.McRd, 'N·mm', sg.x[0]);
    add('bending-y', 'EN 1993-1-1 §6.3.2.2', My, lt.MbRd, 'N·mm', sg.x[0]);
    const cmY = EN.cm(sg.x, sg.My, hasPoint), cmZ = EN.cm(sg.x, sg.Mz, hasPoint);
    let wCS = { ratio: -1 }, wI = { r: -1 };
    sg.x.forEach((x, k) => {
      const N = sg.N[k], My_ = Math.abs(sg.My[k]), Mz_ = Math.abs(sg.Mz[k]);
      if (N < 0 && skipComp) return;
      const ma = EN.momentAxial(p, S.fy, na, cls, N, My_, Mz_);
      if (ma.ratio > wCS.ratio) wCS = { ...ma, x };
      if (N < 0) {
        const it = EN.interaction({ NEd: -N, My: My_, Mz: Mz_ }, R2, bk, lt, { y: cmY, z: cmZ, LT: cmY }, cls, na, !design.torsionFree);
        const r = Math.max(it.r1, it.r2);
        if (r > wI.r) wI = { r, x, which: it.r1 >= it.r2 ? '6.61' : '6.62' };
      }
    });
    if (wCS.ratio >= 0) add('moment-axial', 'EN 1993-1-1 §6.2.9' + (cls === 3 ? '.2' : '.1'), wCS.ratio, 1, '', wCS.x);
    if (wI.r >= 0) add('interaction', 'EN 1993-1-1 §6.3.3 (' + wI.which + ')', wI.r, 1, '', wI.x);
    segs.push({ Lb, C1, chiLT: lt.chiLT, Mcr: lt.Mcr, cmY, cmZ });
  }
  return { checks: out, partial, info: { class: cls, classes: cl, Wpl: p.Wply, chi: bk.chi, mode: bk.mode, curves: bk.curves, segs, fy: S.fy, NbRd: bk.NbRd } };
}
const AISCCb = (sg) => AISC.cb(quart(sg.x, sg.My));      // C1 of the moment diagram: the same quartile expression (see frame-design-en.js header)

// ---------------------------------------------------------------------------------------------------------------- frame

export function checkFrame(model, sol, design, { n = 48 } = {}) {
  const D = cleanDesign(design);
  if (D.code === 'none') return { ok: false, error: 'no-code' };
  if (!sol?.ok) return { ok: false, error: 'no-solution' };
  const prep = sol.prep;
  const strength = model.combos.filter((c) => c.limit === 'strength' && sol.results['combo:' + c.id]);
  if (!strength.length) return { ok: false, error: 'no-combos' };
  const service = model.combos.filter((c) => c.limit === 'service' && sol.results['combo:' + c.id]);
  const mat = model.materials[0] || { E: 200000, G: 77000 };
  // the capacity formulas use the code's own moduli: EN 1993-1-1 §3.2.6 E = 210 000, G = 81 000 MPa; AISC 360 uses the model's steel
  const E = D.code === 'en' ? 210000 : mat.E, G = D.code === 'en' ? 81000 : mat.G;
  const modulus = Math.abs(mat.E - E) / E > 0.005 ? { model: mat.E, design: E } : null;
  const members = [];
  model.members.forEach((m, k) => {
    const S = memberSetup(model, prep, k, D, E, G);
    const row = { id: S.id, ref: S.ref, section: S.section, status: 'ok', util: 0, set: '', check: null, sets: [], info: null };
    if (S.skip) { members.push({ ...row, status: 'not-checked', why: S.skip, util: null }); return; }
    let skipped = null, maxT = 0;
    const partial = new Set();
    for (const cb of strength) {
      const R = sol.results['combo:' + cb.id];
      const d = diagram(prep, R, k, n);
      maxT = Math.max(maxT, maxAbs(d.T));
      const hasPoint = (R.loads[k] || []).some((l) => l.kind === 'point');
      const r = D.code === 'en' ? checkEN(S, d, R, D, hasPoint) : checkAISC(S, d, R, D);
      if (r.skip) { skipped = r; break; }
      for (const w of r.partial) partial.add(w);
      const worst = r.checks.reduce((a, b) => (b.ratio > a.ratio ? b : a), { ratio: -1 });
      row.sets.push({ set: cb.id, name: cb.name, clause: cb.clause, util: worst.ratio, checks: r.checks });
      if (!row.info) row.info = r.info;
      if (!row.check || worst.ratio > row.util) { row.util = worst.ratio; row.set = cb.id; row.check = { id: worst.id, clause: worst.clause, ratio: worst.ratio, x: worst.x }; row.info = r.info; }
    }
    if (skipped) { members.push({ ...row, status: 'not-checked', why: skipped.skip, clause: skipped.clause, util: null, sets: [], check: null }); return; }
    // serviceability: the deflection off the chord against the project's L/n limit
    const defl = { set: '', ratio: 0, value: 0 };
    for (const cb of service) {
      const R = sol.results['combo:' + cb.id];
      const d = diagram(prep, R, k, 24);
      const v = Math.max(...d.rel);
      const ratio = v / (S.L / D.deflLimit);
      if (ratio > defl.ratio) { defl.set = cb.id; defl.ratio = ratio; defl.value = v; defl.name = cb.name; }
    }
    row.defl = service.length ? { ...defl, limit: D.deflLimit, L: S.L } : null;
    row.torsion = maxT;
    row.fy = S.fy; row.grade = S.grade; row.L = S.L; row.lb = S.lb;
    row.partial = [...partial];
    row.status = row.util > 1 ? 'fail' : partial.size ? 'partial' : 'ok';
    members.push(row);
  });
  const checked = members.filter((m) => m.util !== null);
  const clauses = new Set();
  for (const m of checked) for (const s of m.sets) for (const c of s.checks) clauses.add(c.clause);
  for (const m of checked) for (const s of m.sets) if (s.clause) clauses.add(s.clause);
  return {
    ok: true, code: D.code, edition: D.code === 'en' ? EN.EDITION + ' + EN 1990' : AISC.EDITION + ' + ASCE 7-16', design: D,
    members, max: checked.reduce((a, m) => Math.max(a, m.util), 0), counts: { checked: checked.length, failed: checked.filter((m) => m.status === 'fail').length, partial: checked.filter((m) => m.status === 'partial').length, notChecked: members.length - checked.length },
    clauses: [...clauses].sort(), combos: strength.length, modulus,
  };
}

// ---------------------------------------------------------------------------------------------------------------- display

/** Colour of a utilisation for the view: blue (little used) → green → ochre (near 1) → red (over). */
export function utilRamp(u) {
  const stops = [[0, [0.25, 0.45, 0.85]], [0.5, [0.2, 0.7, 0.4]], [0.85, [0.85, 0.7, 0.15]], [1.0, [0.9, 0.35, 0.1]], [1.0001, [0.8, 0.05, 0.1]]];
  if (!Number.isFinite(u)) return [0.55, 0.55, 0.55];
  if (u >= 1.0001) return stops[4][1];
  for (let k = 1; k < stops.length; k++) {
    if (u <= stops[k][0]) {
      const [a, ca] = stops[k - 1], [b, cb] = stops[k], f = (u - a) / (b - a || 1);
      return ca.map((v, i) => v + f * (cb[i] - v));
    }
  }
  return stops[4][1];
}
const pc = (v) => (v === null || !Number.isFinite(v) ? '' : (Math.round(v * 1000) / 10).toFixed(1) + ' %');

/** Report tables of a check result (words from the app's t(), keys frame.des.*). */
export function designTables(res, t) {
  const T = [];
  const D = res.design;
  /* i18n-ignore-start: column heads that are symbols / units */
  T.push({ title: t('frame.des.title'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [
    [t('frame.des.not-reviewed'), ''],
    [t('frame.des.code'), res.edition],
    [t('frame.des.grade'), D.grade + (D.code === 'en' ? ' (EN 10025-2)' : '')],
    [t('frame.des.first-order'), t('frame.des.first-order-text')],
    [t('frame.des.lengths'), t('frame.des.lengths-text', { ky: D.ky, kz: D.kz, lb: D.lbRatio })],
    ...(res.modulus ? [[t('frame.des.modulus'), t('frame.des.modulus-text', res.modulus)]] : []),
    [t('frame.des.not-built'), t('frame.des.not-built-text')],
    ...(D.code === 'en' ? [[t('frame.des.na'), 'γM0 ' + D.na.steel.gammaM0 + ', γM1 ' + D.na.steel.gammaM1 + ', γM2 ' + D.na.steel.gammaM2 + ', η ' + D.na.steel.eta + ' · γG ' + D.na.combos.gammaG + ', γQ ' + D.na.combos.gammaQ]] : []),
    [t('frame.des.counts'), t('frame.des.counts-text', { n: res.counts.checked, partial: res.counts.partial, bad: res.counts.failed, skip: res.counts.notChecked, combos: res.combos })],
  ] });
  T.push({ title: t('frame.des.summary'), head: [t('frame.rep.member'), t('frame.rep.part'), t('frame.rep.section'), t('frame.des.util'), t('frame.des.state'), t('frame.des.governs'), t('frame.des.set')], numeric: [3],
    rows: res.members.map((m) => [m.id, m.ref, m.section, pc(m.util), t('frame.des.st.' + m.status), m.status === 'not-checked' ? t('frame.des.why.' + m.why) : t('frame.des.check.' + m.check.id) + ' · ' + m.check.clause + (m.partial?.length ? ' · ' + t('frame.des.partial', { why: t('frame.des.why.' + m.partial[0]) }) : ''), m.set ? (res.members.length ? (m.sets.find((s) => s.set === m.set)?.name || '') : '') : '']) });
  /* i18n-ignore-end */
  T.push({ title: t('frame.des.clauses'), head: [t('frame.des.clause')], numeric: [], rows: res.clauses.map((c) => [c]) });
  const withDefl = res.members.filter((m) => m.defl);
  if (withDefl.length) T.push({ title: t('frame.des.service'), head: [t('frame.rep.member'), t('frame.des.defl'), t('frame.des.limit'), t('frame.des.util'), t('frame.des.set')], numeric: [1, 2, 3],
    rows: withDefl.map((m) => [m.id, (Math.round(m.defl.value * 100) / 100).toFixed(2) + ' mm', 'L/' + m.defl.limit, pc(m.defl.ratio), m.defl.name || '']) });
  for (const m of res.members) {
    if (m.status === 'not-checked' || !m.sets.length) continue;
    const gov = m.sets.find((s) => s.set === m.set);
    if (!gov) continue;
    /* i18n-ignore-start: unit labels */
    T.push({ title: t('frame.des.member-title', { id: m.id, set: gov.name }), head: [t('frame.des.check-name'), t('frame.des.clause'), t('frame.des.demand'), t('frame.des.capacity'), t('frame.des.util')], numeric: [2, 3, 4],
      rows: gov.checks.map((c) => [t('frame.des.check.' + c.id), c.clause, fmtF(c.demand, c.unit), c.capacity === 1 && !c.unit ? '1.00' : fmtF(c.capacity, c.unit), pc(c.ratio)]) });
    /* i18n-ignore-end */
  }
  return T;
}
function fmtF(v, unit) {
  if (!Number.isFinite(v)) return '';
  if (unit === 'N') return (Math.round(v / 10) / 100).toFixed(2) + ' kN';
  if (unit === 'N·mm') return (Math.round(v / 1e4) / 100).toFixed(2) + ' kN·m';
  return (Math.round(v * 1000) / 1000).toFixed(3);
}
