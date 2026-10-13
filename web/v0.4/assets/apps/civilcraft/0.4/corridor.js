/* SPDX-License-Identifier: Apache-2.0 */
/**
 * corridor.js — a corridor: one simple assembly swept along an alignment and its design profile.
 * No DOM.
 *
 * The assembly is the same on both sides of the centreline: a lane (width, cross slope falling away
 * from the crown), a shoulder (width, slope), then a side slope at the cut or fill ratio (H:V) out to
 * where it meets the ground. Slopes are fractions (0.02 = 2%). Curb and gutter, sidewalks,
 * superelevation and widening are not built yet.
 *
 *   defaultAssembly(units) → { lane, laneSlope, shoulder, shoulderSlope, cut, fill, step }   (placeholders to edit)
 *   corridorPatch(surface, alignment, profile, asm) → { problems, region, points, breaklines, info }
 *     info = { sections: [{ sta, L: [cl, eop, sh, dl], R: [...] }], lines: { CL, EOP_L, SH_L, DL_L, EOP_R, SH_R, DL_R }, from, to }
 *     region = the daylight outline (left daylight forward, right daylight back), for gradedSurface().
 *     0.4 V18: asm.super (superelev.js) on → the lanes rotate through the curves (superPlan / slopesAt, the transition
 *     stations become sections); a lane falling away steeper than the shoulder slope takes the shoulder with it (a shoulder
 *     is never flatter than its lane on the low side). info.super = the plan (curves, problems).
 */

import { t } from "./i18n.js";
import { castSlope, selfCrosses } from './grading.js';
import { superPlan, slopesAt, keyStations as superStations } from './superelev.js';   // 0.4 V18

export function defaultAssembly(units = 'ft') {
  return units === 'm'
    ? { lane: 3.6, laneSlope: 0.02, shoulder: 1.2, shoulderSlope: 0.04, cut: 2, fill: 3, step: 5 }
    : { lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 };
}

export function corridorPatch(surface, alignment, profile, asm) {
  const problems = [];
  const empty = (msg) => ({ problems: [msg], region: null, points: [], breaklines: [], info: { sections: [], lines: {} } });
  if (!alignment?.ok) return empty(t('corr.err.al'));
  if (!profile?.ok) return empty(t('corr.err.prof'));
  const A = { ...defaultAssembly(), ...asm };
  if (!(A.cut > 0 && A.fill > 0)) return empty(t('corr.err.slopes'));
  const from = Math.max(alignment.start, profile.start), to = Math.min(alignment.end, profile.end);
  if (!(to - from > 1e-6)) return empty(t('corr.err.overlap'));
  // stations: every step, the ends, the curve ends and the vertical curve ends
  const st = new Set([from, to]);
  const step = A.step > 0 ? A.step : 10;
  for (let s = Math.ceil(from / step) * step; s < to; s += step) st.add(Number(s.toFixed(6)));
  for (const k of alignment.keyStations()) if (k.sta > from && k.sta < to) st.add(k.sta);
  for (const c of profile.curves) for (const s of [c.bvc, c.evc]) if (s > from && s < to) st.add(s);
  const sp = A.super?.on ? superPlan(alignment, { super: A.super, nc: A.laneSlope, lane: A.lane }) : null;   // 0.4 V18
  if (sp) { for (const s of superStations(sp)) if (s > from && s < to) st.add(Number(s.toFixed(6))); problems.push(...sp.problems); }
  const stations = [...st].sort((a, b) => a - b).filter((s, i, a) => !i || s - a[i - 1] > 1e-6);

  const sb = surface.bounds, far = 2 * Math.hypot(sb.maxX - sb.minX, sb.maxY - sb.minY);
  const sections = [];
  let off = 0;
  for (const sta of stations) {
    const p = alignment.pointAt(sta), z0 = profile.elevationAt(sta);
    if (z0 === null) continue;
    const rx = Math.sin(p.dir), ry = -Math.cos(p.dir);   // to the right
    const sec = { sta };
    const sl = sp ? slopesAt(sp, sta, A.laneSlope) : { L: A.laneSlope, R: A.laneSlope };
    if (sp) sec.slopes = sl;
    for (const [side, sx] of [['L', -1], ['R', 1]]) {
      const ux = rx * sx, uy = ry * sx;
      const cl = { x: p.x, y: p.y, z: z0 };
      const ls = sl[side], ss = ls > A.shoulderSlope ? ls : A.shoulderSlope;   // 0.4 V18: the low side's shoulder no flatter than its lane
      const eop = { x: p.x + ux * A.lane, y: p.y + uy * A.lane, z: z0 - A.lane * ls };
      const sh = { x: eop.x + ux * A.shoulder, y: eop.y + uy * A.shoulder, z: eop.z - A.shoulder * ss };
      const r = castSlope(surface, sh, ux, uy, sh.z, A.cut, A.fill, { step: Math.max(0.1, step / 20), far });
      if (r.kind === 'off') off++;
      sec[side] = [cl, eop, sh, { x: r.x, y: r.y, z: r.z, kind: r.kind }];
    }
    sections.push(sec);
  }
  if (sections.length < 2) return empty(t('corr.err.two'));
  if (off) problems.push(t('corr.off', { n: off }));
  const line = (side, k) => sections.map((s) => s[side][k]);
  const lines = { CL: line('L', 0), EOP_L: line('L', 1), SH_L: line('L', 2), DL_L: line('L', 3), EOP_R: line('R', 1), SH_R: line('R', 2), DL_R: line('R', 3) };
  const region = [...lines.DL_L, ...lines.DL_R.slice().reverse()].map((q) => ({ x: q.x, y: q.y, z: q.z }));
  // neighbouring sections must not cross (they do on the inside of a curve tighter than the corridor)
  let crossing = false;
  for (let i = 0; i + 1 < sections.length && !crossing; i++) for (const side of ['L', 'R']) {
    const a = sections[i][side], b = sections[i + 1][side];
    if (cross(a[0], a[3], b[0], b[3])) { crossing = true; break; }
  }
  if (crossing || (!problems.length && selfCrosses(region))) problems.push(t('corr.cross'));
  const points = [];
  for (const s of sections) for (const side of ['L', 'R']) for (const q of s[side].slice(side === 'L' ? 0 : 1)) points.push({ x: q.x, y: q.y, z: q.z });
  const breaklines = Object.entries(lines).map(([name, pts]) => ({ name, pts: pts.map((q) => ({ x: q.x, y: q.y, z: q.z })) }));
  // every section across (so the triangles follow the sections, and the ends close the corridor)
  for (const s of sections) breaklines.push({ name: 'section', pts: [...s.L.slice().reverse(), ...s.R.slice(1)].map((q) => ({ x: q.x, y: q.y, z: q.z })) });
  return { problems, region, points, breaklines, info: { sections, lines, from, to, assembly: A, super: sp } };
}

function cross(a, b, c, d) {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12));
}
