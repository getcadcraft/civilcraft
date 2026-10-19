/* SPDX-License-Identifier: Apache-2.0 */
/**
 * corridor.js — a corridor: one simple assembly swept along an alignment and its design profile.
 * No DOM.
 *
 * The assembly is the same on both sides of the centreline: a lane (width, cross slope falling away
 * from the crown), a shoulder (width, slope), then a side slope at the cut or fill ratio (H:V) out to
 * where it meets the ground. Slopes are fractions (0.02 = 2%). Curb and gutter, sidewalks
 * and side-slope targets are not built yet (superelevation: 0.4 V18; edge targets and widening: 0.6 WL.25).
 *
 *   defaultAssembly(units) → { lane, laneSlope, shoulder, shoulderSlope, cut, fill, step }   (placeholders to edit)
 *   corridorPatch(surface, alignment, profile, asm) → { problems, region, points, breaklines, info }
 *     info = { sections: [{ sta, L: [cl, eop, sh, dl], R: [...] }], lines: { CL, EOP_L, SH_L, DL_L, EOP_R, SH_R, DL_R }, from, to }
 *     region = the daylight outline (left daylight forward, right daylight back), for gradedSurface().
 *     0.4 V18: asm.super (superelev.js) on → the lanes rotate through the curves (superPlan / slopesAt, the transition
 *     stations become sections); a lane falling away steeper than the shoulder slope takes the shoulder with it (a shoulder
 *     is never flatter than its lane on the low side). info.super = the plan (curves, problems).
 *
 * Targets (0.6 WL.25): corridorPatch(…, { targets }) — each target belongs to ONE side and moves one point of that side's
 * section to a line, where the section (square to the alignment, outward from the centreline on that side only) first
 * crosses it:
 *   { side 'L'|'R', what 'width'|'elev', part 'eop'|'sh', line: [{x,y,z}] | null, label }
 *     width + eop   the edge of pavement sits on the line (the lane widens or narrows to it)
 *     width + sh    the shoulder's outer edge sits on the line (the shoulder takes up the rest; never narrower than 0)
 *     elev  + eop   the edge of pavement takes the line's elevation there (the lane's cross slope follows)
 *     elev  + sh    the shoulder's outer edge takes the line's elevation there
 *   Where the section does not reach the line, the assembly's own values stay (counted). The other side never moves:
 *   a target on the left only ever changes left points. info.targets = [{ …target without line, found, of }].
 *   TARGET_WHAT, TARGET_PARTS, TARGET_SIDES, CORRIDOR_LINES (the lines another corridor can target), MAX_TARGETS
 *   cleanTargets(list) (untrusted: the project file) → [{ side, what, part, from: { kind 'feature', id } |
 *     { kind 'corridor', id (alignment id), line (CORRIDOR_LINES) } }]
 *   sectionHit(p, ux, uy, line) → { t (distance out along u), z } | null   the first crossing at t > 0
 */

import { t } from "./i18n.js";
import { castSlope, selfCrosses } from './grading.js';
import { superPlan, slopesAt, keyStations as superStations } from './superelev.js';   // 0.4 V18

export function defaultAssembly(units = 'ft') {
  return units === 'm'
    ? { lane: 3.6, laneSlope: 0.02, shoulder: 1.2, shoulderSlope: 0.04, cut: 2, fill: 3, step: 5 }
    : { lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 };
}

export const TARGET_SIDES = ['L', 'R'];
export const TARGET_WHAT = ['width', 'elev'];
export const TARGET_PARTS = ['eop', 'sh'];
export const CORRIDOR_LINES = ['CL', 'EOP_L', 'SH_L', 'DL_L', 'EOP_R', 'SH_R', 'DL_R'];
export const MAX_TARGETS = 8;
export function cleanTargets(list) {
  if (!Array.isArray(list)) return [];
  const out = [], seen = new Set();
  for (const g of list.slice(0, 64)) {
    if (!g || typeof g !== 'object' || !TARGET_SIDES.includes(g.side) || !TARGET_WHAT.includes(g.what) || !TARGET_PARTS.includes(g.part)) continue;
    const f = g.from, id = String(f?.id ?? '');
    let from = null;
    if (f?.kind === 'feature' && /^f\d{1,9}$/.test(id)) from = { kind: 'feature', id };
    else if (f?.kind === 'corridor' && /^a\d{1,9}$/.test(id) && CORRIDOR_LINES.includes(f.line)) from = { kind: 'corridor', id, line: f.line };
    if (!from) continue;
    const key = g.side + g.what + g.part;   // one target per side, kind and point
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ side: g.side, what: g.what, part: g.part, from });
    if (out.length >= MAX_TARGETS) break;
  }
  return out;
}
/** Where the ray from p along (ux, uy) first crosses the 3D polyline `line` (t > 0, the distance out), with the line's z
 *  there (by length along the crossed segment). */
export function sectionHit(p, ux, uy, line) {
  let best = null;
  for (let i = 1; i < (line?.length || 0); i++) {
    const a = line[i - 1], b = line[i], dx = b.x - a.x, dy = b.y - a.y, den = ux * dy - uy * dx;
    if (Math.abs(den) < 1e-15) continue;
    const wx = a.x - p.x, wy = a.y - p.y;
    const t = (wx * dy - wy * dx) / den, u = (wx * uy - wy * ux) / den;
    if (t <= 1e-9 || u < -1e-12 || u > 1 + 1e-12) continue;
    if (!best || t < best.t) best = { t, z: a.z + Math.min(1, Math.max(0, u)) * (b.z - a.z) };
  }
  return best;
}

export function corridorPatch(surface, alignment, profile, asm, { targets = [] } = {}) {
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
  // 0.6 WL.25: the targets, each with its counts (a target without a line is said once)
  const tgs = (targets || []).filter((g) => TARGET_SIDES.includes(g.side) && TARGET_WHAT.includes(g.what) && TARGET_PARTS.includes(g.part)).map((g) => ({ ...g, found: 0, of: 0 }));
  // (a target whose line is gone is a note, not a problem: the corridor still builds, with the assembly's own values)
  for (const g of tgs) g.missing = !g.line || g.line.length < 2;
  const tgOf = (side, what, part) => tgs.find((g) => g.side === side && g.what === what && g.part === part && g.line?.length >= 2) || null;
  const hitOf = (g, p, ux, uy) => { if (!g) return null; g.of++; const h = sectionHit(p, ux, uy, g.line); if (h) g.found++; return h; };
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
      // 0.6 WL.25: this side's targets move this side's points only
      const hW = hitOf(tgOf(side, 'width', 'eop'), p, ux, uy), hE = hitOf(tgOf(side, 'elev', 'eop'), p, ux, uy);
      const laneW = hW ? hW.t : A.lane;
      const eopZ = hE ? hE.z : z0 - laneW * sl[side];
      const ls = laneW > 1e-9 ? (z0 - eopZ) / laneW : sl[side];
      const ss = ls > A.shoulderSlope ? ls : A.shoulderSlope;   // 0.4 V18: the low side's shoulder no flatter than its lane
      const eop = { x: p.x + ux * laneW, y: p.y + uy * laneW, z: eopZ };
      const hSW = hitOf(tgOf(side, 'width', 'sh'), p, ux, uy), hSE = hitOf(tgOf(side, 'elev', 'sh'), p, ux, uy);
      const shW = hSW ? Math.max(0, hSW.t - laneW) : A.shoulder;
      const sh = { x: eop.x + ux * shW, y: eop.y + uy * shW, z: hSE ? hSE.z : eop.z - shW * ss };
      const r = castSlope(surface, sh, ux, uy, sh.z, A.cut, A.fill, { step: Math.max(0.1, step / 20), far });
      if (r.kind === 'off') off++;
      sec[side] = [cl, eop, sh, { x: r.x, y: r.y, z: r.z, kind: r.kind }];
    }
    sections.push(sec);
  }
  if (sections.length < 2) return empty(t('corr.err.two'));
  if (off) problems.push(t('corr.off', { n: off }));
  const tgInfo = tgs.map(({ line, ...g }) => g);
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
  return { problems, region, points, breaklines, info: { sections, lines, from, to, assembly: A, super: sp, targets: tgInfo } };
}

function cross(a, b, c, d) {
  const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
  const d1 = o(a, b, c), d2 = o(a, b, d), d3 = o(c, d, a), d4 = o(c, d, b);
  return ((d1 > 1e-12 && d2 < -1e-12) || (d1 < -1e-12 && d2 > 1e-12)) && ((d3 > 1e-12 && d4 < -1e-12) || (d3 < -1e-12 && d4 > 1e-12));
}
