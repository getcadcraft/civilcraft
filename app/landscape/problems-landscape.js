/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems-landscape.js — the Landscape workspace's junction and overlap report as shared Problems (0.8 LA.4 + LA.2, session
 * `landscape-arch_PART_4`; shape docs/0.8-PROBLEMS-SPEC.md § 1–2, rule 29). No DOM: bin/test-landscape.mjs runs it in Node; civilcraft.js
 * registers it as the source `civilcraft.landscape`. Each row has "go to" (where.at) and names the object (about).
 *
 *   landscapeProblems(project, { t, units, proposed?, regions? }) → [problem]
 *     ls.j.wall.over     error    the ground on a wall's high side is above its top (soil over the wall)
 *     ls.j.wall.foot     warning  the ground on a wall's low side is below its footing's top (the footing shows)
 *     ls.j.wall.end    warning  a wall that shapes the ground ends where the existing ground on its high side is more than a typical drop away from the level it holds there (LA.4)
 *     ls.j.bed.high      warning  a planted area's finished level is above the paving edge it meets (soil and water run onto the paving)
 *     ls.j.bed.drop      note     … more than the typical drop below it (a trip edge)
 *     ls.j.step.bottom / ls.j.step.top  warning  a flight's bottom or top does not meet the paving it lands on
 *     ls.j.overlap       note     two ground modifiers overlap: the later one wins there (the stack's order)
 *     ls.link.bad        warning  a linked object's source line was refused (LA.2: open, self-crossing, too many points)
 *     ls.link.gone       note     a linked object's source line is gone (the object stays as it was)
 *   Thresholds are labelled typical values (TYPICAL), never a standard's.
 */
import { pavingSurface, wallLayout, stepsLayout } from './hardscape.js';
import { pointIn, clipRegion } from './areas.js';
import { overlapPairs } from './stack.js';

/** Typical tolerances in metres (converted for feet): a level within 10 mm meets; a bed more than 150 mm below paving is a trip edge. */
export const TYPICAL = { meet: 0.01, drop: 0.15 };

/** The paving's finished level at (x, y): its plane (cross fall), cone (to a drain) or flat level. */
export function pavingZ(p, surface, x, y) {
  const ps = pavingSurface(p, surface), f = p.falls;
  if (f.mode === 'cross') {   // the plane grade.js planeZ makes: through the outline's centroid at z0
    const cx = p.pts.reduce((v, q) => v + q.x, 0) / p.pts.length, cy = p.pts.reduce((v, q) => v + q.y, 0) / p.pts.length, a = (f.dir * Math.PI) / 180;
    return ps.z0 - (f.pct / 100) * ((x - cx) * Math.cos(a) + (y - cy) * Math.sin(a));
  }
  if (f.mode === 'drain' && f.drain) return ps.z0 + (f.pct / 100) * Math.hypot(x - f.drain.x, y - f.drain.y);
  return ps.z0;
}

export function landscapeProblems(project, { t = (k) => k, units = 'm', proposed = null, regions = null, linkNotes = [] } = {}) {
  const ls = project.state.landscape;
  if (!ls) return [];
  const out = [], k = units === 'm' ? 1 : 1 / 0.3048, meet = TYPICAL.meet * k, drop = TYPICAL.drop * k;
  const sf = proposed || project.graded?.().surface || project.eg?.().surface || null;
  const f2 = (v) => (Math.round(v * 100) / 100).toFixed(2);
  const push = (code, severity, key, vars, about, at) => out.push({ code, part: code + ':' + about.map((a) => a.id).join(',') + (at ? ':' + at.map((v) => Math.round(v)).join(',') : ''), severity, msg: { key, vars }, text: t(key, vars), about, ...(at ? { where: { at } } : {}) });
  const hard = ls.hardscape || [];
  const ref = (h) => ({ kind: 'ls-hard', id: h.id, label: h.name });
  if (sf) {
    // walls: the ground on each side against the top and the footing
    for (const w of hard.filter((h) => h.kind === 'wall')) {
      const lay = wallLayout(w, sf, units);
      let over = null, foot = null;
      const off = w.thickness / 2 + 0.05 * k;
      for (const st of lay.stations) {
        const gl = sf.elevationAt(st.x - st.uy * off, st.y + st.ux * off), gr = sf.elevationAt(st.x + st.uy * off, st.y - st.ux * off);
        if (gl == null || gr == null) continue;
        const hi = Math.max(gl, gr), lo = Math.min(gl, gr);
        if (hi - st.top > meet && (!over || hi - st.top > over.d)) over = { d: hi - st.top, st };
        if (st.footing - lo > meet && (!foot || st.footing - lo > foot.d)) foot = { d: st.footing - lo, st };
      }
      const ex = project.eg?.().surface || null;
      if (w.grade && ex && lay.stations.length > 1) {   // LA.4: at each end, the level the wall holds on its high side against the existing ground there
        const hiL = lay.stations.reduce((v, st) => v + ((sf.elevationAt(st.x - st.uy * off, st.y + st.ux * off) ?? 0) - (sf.elevationAt(st.x + st.uy * off, st.y - st.ux * off) ?? 0)), 0) >= 0, sgn = hiL ? 1 : -1;
        const worst = [lay.stations[0], lay.stations[lay.stations.length - 1]].map((st) => {
          const z = ex.elevationAt(st.x - sgn * st.uy * off, st.y + sgn * st.ux * off);
          return z == null ? null : { d: z - ((w.top ?? st.top) - w.coping.thickness), st };
        }).filter((e) => e && Math.abs(e.d) > drop).sort((p, q) => Math.abs(q.d) - Math.abs(p.d))[0];
        if (worst) push('ls.j.wall.end', 'warning', 'ls.j.wall.end', { name: w.name, d: f2(Math.abs(worst.d)), dir: t(worst.d > 0 ? 'ls.j.above' : 'ls.j.below'), u: units }, [ref(w)], [worst.st.x, worst.st.y]);
      }
      if (over) push('ls.j.wall.over', 'error', 'ls.j.wall.over', { name: w.name, d: f2(over.d), u: units }, [ref(w)], [over.st.x, over.st.y]);
      if (foot) push('ls.j.wall.foot', 'warning', 'ls.j.wall.foot', { name: w.name, d: f2(foot.d), u: units }, [ref(w)], [foot.st.x, foot.st.y]);
    }
    // steps: the bottom and the top against the paving they land on
    for (const s of hard.filter((h) => h.kind === 'steps')) {
      const lay = stepsLayout(s, sf, units);
      if (!lay.n) continue;
      const L = Math.hypot(s.pts[1].x - s.pts[0].x, s.pts[1].y - s.pts[0].y) || 1, ux = (s.pts[1].x - s.pts[0].x) / L, uy = (s.pts[1].y - s.pts[0].y) / L, e = 0.05 * k;
      for (const [end, p, z, dir] of [['bottom', s.pts[0], lay.zB, -1], ['top', s.pts[1], lay.zT, 1]]) {
        const pv = hard.find((h) => h.kind === 'paving' && pointIn(p.x + dir * ux * e, p.y + dir * uy * e, h.pts));   // just off the flight: where it lands
        if (!pv) continue;
        const d = z - pavingZ(pv, sf, p.x, p.y);
        if (Math.abs(d) > meet) push('ls.j.step.' + end, 'warning', 'ls.j.step.' + end, { name: s.name, paving: pv.name, d: f2(Math.abs(d)), dir: t(d > 0 ? 'ls.j.above' : 'ls.j.below'), u: units }, [ref(s), ref(pv)], [p.x, p.y]);
      }
    }
  }
  // planted areas with a finished level against the paving edges that cut them
  for (const a of (ls.areas || []).filter((x) => x.level != null)) {
    for (const pv of hard.filter((h) => h.kind === 'paving')) {
      const cut = clipRegion(a.pts, [pv.pts]).edges.filter((e) => e.from === 'cut');
      if (!cut.length) continue;
      let worst = null;
      for (const e of cut) {
        const x = (e.a.x + e.b.x) / 2, y = (e.a.y + e.b.y) / 2, d = a.level - pavingZ(pv, sf, x, y);
        if (!worst || Math.abs(d) > Math.abs(worst.d)) worst = { d, x, y };
      }
      if (worst.d > meet) push('ls.j.bed.high', 'warning', 'ls.j.bed.high', { name: a.name, paving: pv.name, d: f2(worst.d), u: units }, [{ kind: 'ls-pa', id: a.id, label: a.name }, ref(pv)], [worst.x, worst.y]);
      else if (-worst.d > drop) push('ls.j.bed.drop', 'note', 'ls.j.bed.drop', { name: a.name, paving: pv.name, d: f2(-worst.d), u: units }, [{ kind: 'ls-pa', id: a.id, label: a.name }, ref(pv)], [worst.x, worst.y]);
    }
  }
  // overlapping modifiers: the later one wins there
  if (regions?.length) {
    const byId = new Map(regions.map((r) => [r.id, r]));
    for (const o of overlapPairs(regions)) {
      const A = byId.get(o.a), B = byId.get(o.b);
      push('ls.j.overlap', 'note', 'ls.j.overlap', { a: A.name, b: B.name, area: f2(o.area), u: units }, [{ kind: A.kind, id: A.id, label: A.name }, { kind: B.kind, id: B.id, label: B.name }], null);
    }
  }
  // LA.2: linked objects whose source could not be used
  for (const n of linkNotes || []) push(n.code, n.code === 'ls.link.bad' ? 'warning' : 'note', n.code, { name: n.name, why: t('ls.link.why.' + (n.why || 'gone')) }, [{ kind: n.kind, id: n.id, label: n.name }], n.at || null);
  return out;
}
