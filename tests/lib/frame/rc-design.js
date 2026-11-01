/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rc-design.js — reinforced concrete member checks on a solved frame, ACI 318-19 (0.8 SU.1056 step 3). DOM-free; imports
 * frame-solve.js (diagrams), rc-section.js and rc-aci318.js. The result has the shape of frame-design.js `checkFrame`
 * (members with status / util / governing check / per-combination checks), so the panel, the colours on the model and the
 * report read both the same way. An aid until an engineer has reviewed it.
 *
 * The concrete and its bars live in the design settings, not in the analysis model (the analysis keeps A, Iy, Iz, J):
 *   rc = { code: 'aci318', fc, fy, fyt, lambda, sway: true, k: 1,
 *          sections: { <model section id>: { b, h, bars: [{ y, z, A }], ties: { Av, s }, spiral?, role?: 'auto'|'beam'|'column' } } }
 *   b along the member's local y, h along local z (the depth of a beam), bars in those axes from the centre (rc-section.js
 *   rectBars / perimeterBars make them); ties: Av = area of the legs crossing a shear plane (mm²), s = spacing (mm).
 *
 * Per member, at every station of every strength combination (N, Vy, Vz, T, My, Mz from the diagram; Pu = −N):
 *   role 'auto': a vertical member, or one whose largest Pu reaches 0.10 f'c Ag, is a column; otherwise a beam.
 *   beam    flexure about y for the sign of My (bars on the tension side; 22.2, Table 21.2.2), about z the same, added
 *           linearly when both act (conservative); εt ≥ 0.004 (9.3.3.1); As,min (9.6.1.2); shear Vz (and Vy) with the ties
 *           (Table 22.5.5.1, 22.5.8.5.3, 22.5.1.2); Av,min (9.6.3.1, 9.6.3.4); tie spacing (9.7.6.2.2; columns 10.7.6.5.2,
 *           the same limits). Column tie detailing (25.7.2: 16 db, 48 dtie, least dimension) is not checked: no bar sizes here
 *   column  P–M about y and z on the φ diagrams (22.4, Table 21.2.2); both moments: B. Bresler's reciprocal load method
 *           ("Design criteria for reinforced columns under axial load and biaxial bending", ACI Journal 57 (1960) 481–490;
 *           ACI 318-19 R22.4) when Pu ≥ 0.10 f'c Ag, else Muy/φMny + Muz/φMnz ≤ 1 at that Pu; Pu ≤ φPn,max; shear as beams
*   both    the drawn section's area or inertias differ from the b × h given (the width along the member's local y, the depth along z) →
 *           "partly checked" (area-mismatch, axes-mismatch);
 *   column  slenderness (0.8 round 3): a NON-SWAY column with k ℓu / r > 34 + 12 M1/M2 (≤ 40; 6.2.5.1, r = 0.3 h) is designed for the magnified moment
 *           Mc = δns · max(M2, M2,min) (6.6.4.5): δns = Cm / (1 − Pu / 0.75 Pc) ≥ 1, Pc = π² (EI)eff / (k ℓu)² with (EI)eff = 0.4 Ec Ig / (1 + βdns)
 *           (Eq. 6.6.4.4.4a; βdns = `rc.betaDns`, default 0.6, the share of the factored axial load that is sustained), Cm = 0.6 + 0.4 M1/M2 ≥ 0.4 (no loads
 *           between the ends; 1.0 with them, or when M2,min governs), M2,min = Pu (15 + 0.03 h) (6.6.4.5.4); Pu ≥ 0.75 Pc is a failure (the column
 *           buckles). Each axis on its own. A SWAY column with k ℓu / r > 22 is "partly checked: sway magnification (6.6.4.6) not built" — it needs
 *           the second-order (P-Δ) analysis or the stability index Q of the whole storey, which the frame solver does not give.
 *   both    torsion above φ Tth (22.7.4.1) → "partly checked: torsion not designed"; the moments are first-order (as the analysis) apart from the above.
 *
 *   cleanRc(x) → rc · checkRcFrame(model, sol, rc, { n }) → { ok, code, edition, members, max, counts, clauses, combos }
 */
import { diagram } from './frame-solve.js';
import { layersFor } from './rc-section.js';
import * as ACI from './rc-aci318.js';

const num = (v, d, lo, hi) => (typeof v === 'number' && Number.isFinite(v) && v >= lo && v <= hi ? v : d);

export function cleanRc(x) {
  const o = x && typeof x === 'object' ? x : {};
  const out = { code: o.code === 'aci318' ? 'aci318' : 'none', fc: num(o.fc, 28, 10, 120), fy: num(o.fy, 420, 200, 700), fyt: num(o.fyt, 420, 200, 700),
    lambda: num(o.lambda, 1, 0.75, 1), sway: o.sway !== false, k: num(o.k, 1, 0.5, 5), betaDns: num(o.betaDns, 0.6, 0, 1), sections: {} };
  if (o.sections && typeof o.sections === 'object') {
    for (const [id, s] of Object.entries(o.sections).slice(0, 2000)) {
      if (!s || typeof s !== 'object') continue;
      const b = num(s.b, null, 50, 5000), h = num(s.h, null, 50, 5000);
      if (b === null || h === null || !Array.isArray(s.bars)) continue;
      const bars = s.bars.slice(0, 500).map((r) => ({ y: num(r?.y, null, -b / 2, b / 2), z: num(r?.z, null, -h / 2, h / 2), A: num(r?.A, null, 1, 1e5) })).filter((r) => r.y !== null && r.z !== null && r.A !== null);
      if (!bars.length) continue;
      const sec = { b, h, bars, role: ['beam', 'column'].includes(s.role) ? s.role : 'auto', spiral: s.spiral === true };
      const Av = num(s.ties?.Av, 0, 0, 1e5), sp = num(s.ties?.s, 0, 0, 5000);
      if (Av > 0 && sp > 0) sec.ties = { Av, s: sp };
      out.sections[String(id).slice(0, 40)] = sec;
    }
  }
  return out;
}

const maxAbs = (a) => a.reduce((m, v) => Math.max(m, Math.abs(v)), 0);

/** Capacities a section needs once (both axes, both signs, the P–M diagrams). */
function sectionSetup(sec, rc) {
  const mat = { fc: rc.fc, fy: rc.fy };
  const flex = {};
  for (const axis of ['y', 'z']) for (const sign of [1, -1]) {
    const r = ACI.beamFlexure({ b: sec.b, h: sec.h, bars: sec.bars, axis, sign, ...mat });
    flex[axis + (sign > 0 ? '+' : '-')] = r.ok ? r : null;
  }
  const D = { y: ACI.interaction({ b: sec.b, h: sec.h, bars: sec.bars, axis: 'y', spiral: sec.spiral, ...mat }), z: ACI.interaction({ b: sec.b, h: sec.h, bars: sec.bars, axis: 'z', spiral: sec.spiral, ...mat }) };
  // shear along local z is carried over the depth h (the layers of bending about y), along y over b; d = the centroid of the
  // bars in the far half (the tension side of a sagging beam), 0.8 × depth when that half has none
  const shear = {};
  for (const [dir, axis] of [['z', 'y'], ['y', 'z']]) {
    const L = layersFor(sec, axis, 1), depth = L.depth;
    const t = L.layers.filter((l) => l.d > depth / 2);
    const As = t.reduce((s, l) => s + l.As, 0);
    const d = As ? t.reduce((s, l) => s + l.As * l.d, 0) / As : 0.8 * depth;
    shear[dir] = { bw: L.width, d, h: depth, As };
  }
  return { flex, D, shear, Ag: sec.b * sec.h, Tth: ACI.torsionThreshold({ b: sec.b, h: sec.h, fc: rc.fc, lambda: rc.lambda }) };
}

/** φMn at a given Pu on a φ diagram (the outline's largest moment at that axial load). */
function momentAt(D, Pu) {
  const P = D.points;
  let best = 0;
  for (let k = 0; k + 1 < P.length; k++) {
    const a = P[k], b = P[k + 1];
    if ((a.phiPn - Pu) * (b.phiPn - Pu) > 0) continue;
    const t = Math.abs(b.phiPn - a.phiPn) < 1e-12 ? 0 : (Pu - a.phiPn) / (b.phiPn - a.phiPn);
    best = Math.max(best, a.phiMn + t * (b.phiMn - a.phiMn));
  }
  return best;
}
/** Utilisation against the φ diagram without the φPn,max cap (for Bresler's method). */
function rayUncapped(D, Pu, Mu) { return ACI.pmRatio({ ...D, phiPnMax: D.points[0].phi * D.points[0].Pn, points: D.points.map((p) => ({ ...p, phiPn: p.phi * p.Pn })) }, Pu, Mu); }

/**
 * Non-sway moment magnification of one axis of a column for one combination (ACI 318-19 6.6.4.5). Ms = the moments along the member (N·mm, sign as the diagram's:
 * the same sign at both ends is single curvature), Pu the largest compression (N), dim the section depth in the plane of bending (mm), Ig that axis's gross inertia.
 *   → { slender: false } · { slender: true, unstable, delta, Mc, Pc, Cm, M2min, kLr, limit }
 */
export function magnifyNonSway({ Ms, Pu, dim, Ig, L, rc }) {
  const M1 = Ms[0], M2 = Ms[Ms.length - 1];
  const big = Math.abs(M1) > Math.abs(M2) ? M1 : M2, small = big === M1 ? M2 : M1;
  const ratio = Math.abs(big) > 1e-9 ? small / big : 1;
  const kLr = rc.k * L / (0.3 * dim), limit = Math.min(34 + 12 * ratio, 40);
  if (kLr <= limit) return { slender: false, kLr, limit };
  const Ec = 4700 * Math.sqrt(rc.fc), EI = 0.4 * Ec * Ig / (1 + rc.betaDns), Pc = Math.PI ** 2 * EI / (rc.k * L) ** 2;
  if (Pu >= 0.75 * Pc) return { slender: true, unstable: true, Pc, kLr, limit };
  const absBig = Math.abs(big), M2min = Math.max(Pu, 0) * (15 + 0.03 * dim);
  const mid = Ms[Math.floor(Ms.length / 2)], span = Math.max(absBig, Math.abs(mid), 1e-9);
  const transverse = Math.abs(mid - (M1 + M2) / 2) > 0.05 * span;   // the diagram is not a straight line between the ends: loads between the supports (6.6.4.5.3b)
  const Cm = transverse || absBig < M2min ? 1 : Math.max(0.4, 0.6 + 0.4 * ratio);
  const delta = Math.max(1, Cm / (1 - Pu / (0.75 * Pc)));
  return { slender: true, unstable: false, delta, Mc: delta * Math.max(absBig, M2min), M2: absBig, Pc, Cm, M2min, kLr, limit };
}

export function checkRcFrame(model, sol, rcIn, { n = 24 } = {}) {
  const rc = cleanRc(rcIn);
  if (rc.code === 'none') return { ok: false, error: 'no-code' };
  if (!sol?.ok) return { ok: false, error: 'no-solution' };
  const prep = sol.prep;
  const strength = model.combos.filter((c) => c.limit === 'strength' && sol.results['combo:' + c.id]);
  if (!strength.length) return { ok: false, error: 'no-combos' };
  const setups = new Map();
  const members = [];
  const clauses = new Set();
  model.members.forEach((m, k) => {
    const sec = rc.sections[m.section];
    const base = { id: m.id, ref: m.from?.ref || '', section: model.sections.find((s) => s.id === m.section)?.name || m.section, status: 'ok', util: 0, set: '', check: null, sets: [], partial: [] };
    if (!sec) { members.push({ ...base, status: 'not-checked', why: 'no-rc-section', util: null }); return; }
    if (!setups.has(m.section)) setups.set(m.section, sectionSetup(sec, rc));
    const S = setups.get(m.section);
    const ax = prep.mem[k].ax, L = ax.L;
    const partial = new Set();
    const msec = model.sections.find((s) => s.id === m.section);
    if (msec && Math.abs(msec.A - S.Ag) > 0.05 * S.Ag) partial.add('area-mismatch');
    // the drawn section's inertias against the rectangle (b along local y, h along local z): gross, or the cracked 0.70 / 0.35 of ACI 6.6.3.1.1
    const likeIg = (I, Ig) => [1, 0.7, 0.35].some((f) => Math.abs(I - f * Ig) <= 0.05 * f * Ig);
    if (msec && !partial.has('area-mismatch') && !(likeIg(msec.Iy, sec.b * sec.h ** 3 / 12) && likeIg(msec.Iz, sec.h * sec.b ** 3 / 12))) partial.add('axes-mismatch');
    // role
    let maxPu = 0;
    const diags = strength.map((cb) => { const d = diagram(prep, sol.results['combo:' + cb.id], k, n); maxPu = Math.max(maxPu, ...d.N.map((v) => -v)); return d; });
    const vertical = Math.abs(ax.ex[2]) > 0.999999;
    const role = sec.role !== 'auto' ? sec.role : vertical || maxPu >= 0.1 * rc.fc * S.Ag ? 'column' : 'beam';
    const Igy = sec.b * sec.h ** 3 / 12, Igz = sec.h * sec.b ** 3 / 12;   // bending about y uses the depth h, about z the width b
    const magAll = role === 'column' && !rc.sway ? diags.map((dd) => {
      const Pu = Math.max(0, ...dd.N.map((v) => -v));
      return { y: magnifyNonSway({ Ms: dd.My, Pu, dim: sec.h, Ig: Igy, L, rc }), z: magnifyNonSway({ Ms: dd.Mz, Pu, dim: sec.b, Ig: Igz, L, rc }) };
    }) : null;
    if (magAll) { const worst = (ax) => magAll.map((m) => m[ax]).filter((m) => m.slender).sort((a, b) => (b.unstable ? 1e9 : b.delta) - (a.unstable ? 1e9 : a.delta))[0]; base.mag = { y: worst('y') || null, z: worst('z') || null }; }
    strength.forEach((cb, ci) => {
      const d = diags[ci];
      const mag = magAll ? magAll[ci] : null;
      const checks = [];
      const add = (id, clause, demand, capacity, x, unit) => { const ratio = capacity > 0 ? demand / capacity : (demand > 0 ? Infinity : 0); checks.push({ id, clause, demand, capacity, ratio, unit, x }); clauses.add(clause); };
      let worst = {};
      const keep = (id, clause, demand, capacity, x, unit) => { const r = capacity > 0 ? demand / capacity : (demand > 0 ? Infinity : 0); if (!worst[id] || r > worst[id].r) worst[id] = { id, clause, demand, capacity, x, unit, r }; };
      for (let q = 0; q < d.x.length; q++) {
        const x = d.x[q], Pu = -d.N[q], Vy = Math.abs(d.Vy[q]), Vz = Math.abs(d.Vz[q]), T = Math.abs(d.T[q]);
        let My = d.My[q], Mz = d.Mz[q];
        // 6.6.4.5: the design moment of a slender column is Mc along it. The minimum moment M2,min (6.6.4.5.4) is taken about each axis separately, never both at once:
        // an axis whose own M2 is below it is checked alone at Mc (uniaxial), the other keeps its moments
        if (mag) for (const ax of ['y', 'z']) {
          const g = mag[ax];
          if (!g.slender || g.unstable) continue;
          if (g.M2 >= g.M2min) { if (ax === 'y') My = Math.sign(My || 1) * Math.max(Math.abs(My), g.Mc); else Mz = Math.sign(Mz || 1) * Math.max(Math.abs(Mz), g.Mc); }
          else keep('rc-pm', 'ACI 318-19 6.6.4.5.4 (M2,min about ' + ax + ')', ACI.pmRatio(S.D[ax], Pu, g.Mc), 1, x);
        }
        if (mag && q === 0) for (const ax of ['y', 'z']) { if (mag[ax].unstable) keep('rc-slender-buckling', 'ACI 318-19 6.6.4.5.2', Pu, 0.75 * mag[ax].Pc, x, 'N'); }
        if (role === 'beam') {
          const fy = S.flex['y' + (My >= 0 ? '+' : '-')], fz = S.flex['z' + (Mz >= 0 ? '+' : '-')];
          const ry = fy ? Math.abs(My) / fy.phiMn : Infinity, rz = fz ? Math.abs(Mz) / fz.phiMn : Infinity;
          keep('rc-flexure', 'ACI 318-19 22.2 + Table 21.2.2', ry + (Math.abs(Mz) > 1e-9 ? rz : 0), 1, x);
          if (Math.abs(My) > 1e-6 && fy) {
            if (!fy.ductile) keep('rc-ductility', 'ACI 318-19 9.3.3.1', 0.004, fy.epsT, x);
            if (!fy.AsMinOk) keep('rc-as-min', 'ACI 318-19 9.6.1.2', fy.AsMin, fy.As, x, 'mm²');
          }
        } else {
          const uy = ACI.pmRatio(S.D.y, Pu, My), uz = ACI.pmRatio(S.D.z, Pu, Mz);
          const both = Math.min(Math.abs(My), Math.abs(Mz)) > 0.01 * Math.max(Math.abs(My), Math.abs(Mz), 1e-9);
          let r, clause;
          if (!both) { r = Math.abs(My) >= Math.abs(Mz) ? uy : uz; clause = 'ACI 318-19 22.4 + Table 21.2.2'; }
          else if (Pu >= 0.1 * rc.fc * S.Ag) { r = Math.max(rayUncapped(S.D.y, Pu, My) + rayUncapped(S.D.z, Pu, Mz) - Pu / (S.D.y.points[0].phi * S.D.y.Po), Pu / S.D.y.phiPnMax); clause = 'ACI 318-19 R22.4 (Bresler 1960)'; }
          // i18n-ignore: clause names of the design code, the same in every language
          else { r = Math.abs(My) / Math.max(momentAt(S.D.y, Pu), 1e-9) + Math.abs(Mz) / Math.max(momentAt(S.D.z, Pu), 1e-9); clause = 'ACI 318-19 R22.4 (linear, low axial load)'; }
          keep('rc-pm', clause, r, 1, x);
        }
        for (const [axis, V] of [['z', Vz], ['y', Vy]]) {
          if (V < 1e-6 && axis === 'y') continue;
          const sh = S.shear[axis];
          const r = ACI.beamShear({ bw: sh.bw, d: sh.d, h: sh.h, fc: rc.fc, fyt: rc.fyt, Av: sec.ties?.Av || 0, s: sec.ties?.s || 0, Vu: V, Nu: Pu, As: sh.As, lambda: rc.lambda, Ag: S.Ag });
          keep('rc-shear-' + axis, 'ACI 318-19 22.5.1.1 + Table 22.5.5.1', V, r.phiVn, x, 'N');
          if (!r.sizeOk) keep('rc-shear-size', 'ACI 318-19 22.5.1.2', V, ACI.PHI_SHEAR * (r.Vc + 0.66 * Math.min(Math.sqrt(rc.fc), 8.3) * sh.bw * sh.d), x, 'N');
          if (!r.AvMinOk) keep('rc-av-min', 'ACI 318-19 9.6.3.1', r.AvMin, sec.ties?.Av || 0, x, 'mm²');
          if (sec.ties && !r.sOk) keep('rc-spacing', role === 'column' ? 'ACI 318-19 10.7.6.5.2' : 'ACI 318-19 9.7.6.2.2', sec.ties.s, r.sMax, x, 'mm');
        }
        if (T > S.Tth) partial.add('torsion');
      }
      worst = Object.values(worst);
      for (const w of worst) add(w.id, w.clause, w.demand, w.capacity, w.x, w.unit);
      const gov = checks.reduce((a, b) => (b.ratio > a.ratio ? b : a), { ratio: -1 });
      base.sets.push({ set: cb.id, name: cb.name, clause: cb.clause, util: gov.ratio, checks });
      if (!base.check || gov.ratio > base.util) { base.util = gov.ratio; base.set = cb.id; base.check = { id: gov.id, clause: gov.clause, ratio: gov.ratio, x: gov.x }; }
    });
    if (role === 'column' && rc.sway) {
      // sway columns: the limit 22 (6.2.5.1); the magnification (6.6.4.6) needs the second-order analysis, not built
      if (['y', 'z'].some((axis) => rc.k * L / (0.3 * (axis === 'y' ? sec.h : sec.b)) > 22)) partial.add('slender-sway');
    }
    base.role = role;
    base.partial = [...partial];
    base.status = base.util > 1 ? 'fail' : partial.size ? 'partial' : 'ok';
    base.L = L;
    members.push(base);
  });
  const checked = members.filter((m) => m.util !== null);
  return { ok: true, code: 'aci318', edition: ACI.EDITION, design: rc, members, max: checked.reduce((a, m) => Math.max(a, m.util), 0),
    counts: { checked: checked.length, failed: checked.filter((m) => m.status === 'fail').length, partial: checked.filter((m) => m.status === 'partial').length, notChecked: members.length - checked.length },
    clauses: [...clauses].sort(), combos: strength.length };
}
