/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail-checks.js — a railway alignment's track geometry checks beside the cant (CV.1, 2026-11-12; rail.js cantPlan does the cant). No DOM.
 * Tested by bin/test-civilcraft-railline.mjs. Every limit is a PLACEHOLDER the person sets from the railway's own standard (docs/spikes/CV.1-rail.md):
 * nothing here is a number from a standard, only the published form each rule usually takes.
 *
 *   CHECK_LIMITS(units) → the extra limits kept in rail.limits (rail.js cleanRail keeps them):
 *     grade      steepest gradient of the profile, mm/m (‰)
 *     vRadius    the least vertical curve radius as k in Rv ≥ k·V² (Rv in metres, V in km/h): the usual form (vertical acceleration v²/Rv)
 *     vLength    shortest vertical curve, project units
 *     radius     least horizontal radius, project units (0 = not checked)
 *     elementTime the shortest circular arc and the shortest straight between two curves, as seconds of travel at line speed (L ≥ v·t;
 *                the familiar L ≥ V/2 m with V in km/h is 1.8 s)
 *     defRate    the rate of change of cant deficiency, mm/s
 *   curvatureAt(al, sta) → signed 1/R at a station (+ turns left), following each transition's own curvature law
 *   trackChecks(al, prof, rail, { speed (km/h | null), units, id, name, plan (rail.js cantPlan), t }) →
 *     { warnings, vertical: [{ pvi, bvc, evc, L, radius (project units), need (project units | null) }],
 *       elements: [{ kind 'arc'|'straight', from, to, len, need (| null), pi }], grades: [{ from, to, g (mm/m) }] }
 *     warnings: the shared Problems shape, codes rail.vert.grade, rail.vert.radius, rail.vert.length, rail.vert.ontransition (a note),
 *               rail.horiz.radius, rail.horiz.arc, rail.horiz.straight, rail.cant.defrate, rail.vert.none (a note: no design profile)
 *
 * Published maths: a parabolic vertical curve of length L between grades g1, g2 has radius Rv = L / |g2 − g1| at its vertex; the vertical
 * acceleration at speed v is v² / Rv; the cant deficiency grows over a transition of length L from 0 to D in L / v seconds, at the ramp
 * shape's steepest slope (rail.js RAMP_PEAK): dD/dt = peak · D · v / L.
 */

import { t as tr } from './i18n.js';
import { rampShape, RAMP_PEAK, toM, MORE_LIMITS } from './rail.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const SHAPE_OF = { clothoid: 'linear', cubic: 'linear', bloss: 'bloss', helmert: 'helmert', sinehalf: 'sinehalf', sine: 'sine' };

export function CHECK_LIMITS(units = 'm') {
  return { ...(units === 'm' ? MORE_LIMITS.m : MORE_LIMITS.ft) };
}

/** Signed curvature (1 / project unit, + = turning left) at a station: 0 on a straight, ±1/R on an arc, the transition's own law between. */
export function curvatureAt(al, sta) {
  const e = al?.elementAt?.(sta);
  if (!e || e.type === 'line') return 0;
  const sg = e.ccw ? 1 : -1;
  if (e.type !== 'spiral') return sg / e.r;
  if (e.io === 'cs') return e.k1 + ((e.k2 - e.k1) * Math.min(e.len, Math.max(0, sta - e.sta))) / e.len;   // 0.11 SU.1944
  const s = Math.min(e.len, Math.max(0, sta - e.sta)), u = e.len > 0 ? (e.io === 'in' ? s / e.len : 1 - s / e.len) : 1;
  return (sg * rampShape(e.tr || 'clothoid')(u)) / e.r;
}

export function trackChecks(al, prof, rail, { speed = null, units = 'm', id = '', name = '', plan = null, t = tr } = {}) {
  const warnings = [], vertical = [], elements = [], grades = [];
  if (!al?.ok || !rail?.on) return { warnings, vertical, elements, grades };
  const L = { ...CHECK_LIMITS(units), ...(rail.limits || {}) }, U = units === 'm' ? 'm' : 'ft', v = speed > 0 ? speed / 3.6 : null;
  const fromM = (m) => (units === 'm' ? m : m / toM(1, units));
  const n1 = (x) => String(Math.round(x * 10) / 10), n2 = (x) => String(Math.round(x * 100) / 100), n0 = (x) => String(Math.round(x));
  const warn = (code, severity, part, vars, extra = {}) => {
    const msg = { key: code, vars: { name, ...vars } };
    warnings.push({ code, severity, text: t(code, msg.vars), hard: false, msg, ref: id, about: { kind: 'alignment', id }, part, ...extra });
  };

  // ---- horizontal: least radius, shortest arc, shortest straight between curves, rate of change of cant deficiency
  const curves = al.curves || [], needLen = v && L.elementTime > 0 ? fromM(v * L.elementTime) : null;
  curves.forEach((c, k) => {
    const pi = c.piIndex + 1;
    if (L.radius > 0 && c.r < L.radius - 1e-9) warn('rail.horiz.radius', 'warning', 'pi' + pi + '-r', { pi, r: n1(c.r), min: n1(L.radius), u: U }, { limit: L.radius, value: c.r, unit: U });
    const arc = { kind: 'arc', from: c.sc, to: c.cs, len: c.cs - c.sc, need: needLen, pi };
    elements.push(arc);
    if (needLen !== null && arc.len > 1e-6 && arc.len < needLen - 1e-9) warn('rail.horiz.arc', 'warning', 'pi' + pi + '-arc', { pi, len: n1(arc.len), min: n1(needLen), u: U }, { limit: needLen, value: arc.len, unit: U });
    if (k) {
      const p = curves[k - 1], st = { kind: 'straight', from: p.st, to: c.ts, len: c.ts - p.st, need: needLen, pi };
      elements.push(st);
      // two curves joined end to end (no straight at all) are a compound or reverse curve by design: only a short straight is flagged
      if (needLen !== null && st.len > 1e-6 && st.len < needLen - 1e-9) warn('rail.horiz.straight', 'warning', 'pi' + (p.piIndex + 1) + '-' + pi, { a: p.piIndex + 1, b: pi, len: n1(st.len), min: n1(needLen), u: U }, { limit: needLen, value: st.len, unit: U });
    }
  });
  if (v && plan) for (const pc of plan.curves || []) {
    if (!fin(pc.deficiency)) continue;
    const rec = curves.find((c) => c.piIndex === pc.piIndex); if (!rec) continue;
    for (const [end, len] of [['TS', rec.ls1], ['ST', rec.ls2]]) {
      if (!(len > 0)) continue;
      const rate = (RAMP_PEAK[SHAPE_OF[pc.tr] || 'linear'] * Math.abs(pc.deficiency) * v) / toM(len, units);
      if (rate > L.defRate + 1e-9) warn('rail.cant.defrate', 'warning', 'pi' + (pc.piIndex + 1) + '-' + end + '-defrate', { pi: pc.piIndex + 1, end, r: n1(rate), max: n1(L.defRate) }, { limit: L.defRate, value: rate, unit: 'mm/s' });
    }
  }

  // ---- vertical: the profile's grades and vertical curves
  if (!prof || !prof.ok || !(prof.pvis?.length >= 2)) { warn('rail.vert.none', 'note', 'profile', {}); return { warnings, vertical, elements, grades }; }
  const inside = (a, b) => Math.min(b, al.end) - Math.max(a, al.start) > 1e-9;
  prof.grades.forEach((g, i) => {
    if (!inside(g.from, g.to)) return;
    const mm = g.g * 1000; grades.push({ from: g.from, to: g.to, g: mm });
    if (Math.abs(mm) > L.grade + 1e-9) warn('rail.vert.grade', 'warning', 'grade' + (i + 1), { g: n2(Math.abs(mm)), max: n2(L.grade), from: n0(g.from), to: n0(g.to) }, { limit: L.grade, value: Math.abs(mm), unit: 'mm/m' });
  });
  const ramps = (plan?.curves || []).flatMap((c) => [c.rampIn, c.rampOut].filter(Boolean).map((r) => ({ from: r.from, to: r.to, pi: c.piIndex + 1 })));
  const trans = (al.elements || []).filter((e) => e.type === 'spiral').map((e) => ({ from: e.sta, to: e.sta + e.len, pi: (curves.find((c) => e.sta >= c.ts - 1e-6 && e.sta <= c.st + 1e-6)?.piIndex ?? -1) + 1 }));
  for (const c of prof.curves) {
    if (!inside(c.bvc, c.evc)) continue;
    const radius = c.L / Math.abs(c.g2 - c.g1), need = speed > 0 && L.vRadius > 0 ? fromM(L.vRadius * speed * speed) : null;
    vertical.push({ pvi: c.i + 1, bvc: c.bvc, evc: c.evc, L: c.L, radius, need, kind: c.kind });
    if (need !== null && radius < need - 1e-9) warn('rail.vert.radius', 'warning', 'pvi' + (c.i + 1) + '-r', { pvi: c.i + 1, r: n0(radius), min: n0(need), u: U }, { limit: need, value: radius, unit: U });
    if (L.vLength > 0 && c.L < L.vLength - 1e-9) warn('rail.vert.length', 'warning', 'pvi' + (c.i + 1) + '-len', { pvi: c.i + 1, len: n1(c.L), min: n1(L.vLength), u: U }, { limit: L.vLength, value: c.L, unit: U });
    const hit = [...ramps, ...trans].find((r) => Math.min(r.to, c.evc) - Math.max(r.from, c.bvc) > 1e-6);
    if (hit) warn('rail.vert.ontransition', 'note', 'pvi' + (c.i + 1) + '-tr', { pvi: c.i + 1, pi: hit.pi || '?' });
  }
  return { warnings, vertical, elements, grades };
}
