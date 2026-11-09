/* SPDX-License-Identifier: Apache-2.0 */
/**
 * problems-civilcraft.js — CivilCraft's design checks as shared Problems (0.7.1 → 0.8; spec docs/0.8-PROBLEMS-SPEC.md § Migration). No DOM:
 * bin/test-problems.mjs runs it in Node; civilcraft.js registers it with the shell's window.ccProblems (manifest "problems").
 *
 *   civilProblems({ alignments, standIn }, { t, unit }) → [problem]
 *     alignments  project.state.alignments: solve-why.js curveWhy (curves that overlap or turn back = error; a radius under the design
 *                 minimum = warning, required vs found) and verticalWhy (a vertical curve that does not fit = error), each with the fix
 *                 the Properties panel offers (one undo step: setR [[pi, r], …] or setL { index, L })
 *     standIn     project.standInCorridors() (0.7.1 71.19): a road built on flat stand-in ground because there is no survey or surface =
 *                 warning about its alignment (the builder's own `warnings` data, code corridor.standin)
 *     graded      project.graded().items (0.7.1 71.22): each pad's or Landscape platform's own `warnings` (sides.js sideWarnings: a retaining
 *                 wall taller than its limit, a side slope steeper than allowed) — already in this shape (code, severity, msg, text, about);
 *                 required vs found from their limit and height / slope, one problem per side
 *     rail        project.railWarnings() (0.7.1 71.26): each track's rail.js cantPlan warnings (codes rail.*), about its alignment
 *     templates   project.templateWarnings() (0.9 SU.1110 + WB.6): a corridor naming a template that is gone, a terrain template that
 *                 cannot be draped (codes tpl.*), already in this shape
 *     native      the open IFC pair's warnings (0.7.1 71.27, ifc-native.js decide: ifc.native.changed / .stale / .missing), with their fixes
 *   t(key, vars) = CivilCraft's t (the words are the Properties panel's own keys: why.*, corr.standin*); unit = the short length unit.
 *   cleanAcceptedCivil(list)   the project file's problems.accepted (project.js), the same rules as the core's cleanAccepted
 */
import { curveWhy, verticalWhy } from './solve-why.js';
import { regionOf } from './solar-run.js';   // 0.8 EG.15: a solar array's problems are anchored at its region

const n2 = (v) => String(Math.round(v * 100) / 100);

export function civilProblems({ alignments = [], standIn = [], graded = [], rail = [], native = [], templates = [] } = {}, { t = (k) => k, unit = 'm' } = {}) {
  const out = [];
  for (const w of templates || []) {   // 0.9 SU.1110 + WB.6
    if (!w || typeof w.code !== 'string' || !/^tpl\./.test(w.code)) continue;
    out.push({ code: w.code, severity: w.severity === 'error' ? 'error' : 'warning', text: String(w.text || ''), ...(w.msg ? { msg: w.msg } : {}), about: w.about ? [{ kind: String(w.about.kind), id: String(w.about.id), label: w.about.label || w.about.id }] : [], source: { name: 'civilcraft.templates' } });
  }
  for (const a of alignments) {
    if (!a || !Array.isArray(a.pis)) continue;
    const about = [{ kind: 'alignment', id: a.id, label: a.name || a.id }];
    const piAt = (i) => (a.pis[i] ? [a.pis[i].x, a.pis[i].y] : null);
    const U = unit;
    for (const w of curveWhy(a.pis, { minR: a.minR || 0 })) {
      if (w.kind === 'overlap') {
        const one = !(w.Ta > 0 && w.Tb > 0), [pi, other] = w.Ta > 0 ? [w.a, w.b] : [w.b, w.a];
        const msg = one ? { key: 'why.overlap.one', vars: { pi: pi + 1, other: other + 1, need: n2(w.need), dist: n2(w.dist), u: U } }
          : { key: 'why.overlap', vars: { a: w.a + 1, b: w.b + 1, need: n2(w.need), ta: n2(w.Ta), tb: n2(w.Tb), dist: n2(w.dist), u: U } };
        const fixes = [];
        if (w.fixA !== null) fixes.push({ id: 'a', action: 'setR', args: [[w.a, w.fixA]], msg: { key: 'why.fix.r', vars: { pi: w.a + 1, r: n2(w.fixA), u: U } } });
        if (w.fixB !== null) fixes.push({ id: 'b', action: 'setR', args: [[w.b, w.fixB]], msg: { key: 'why.fix.r', vars: { pi: w.b + 1, r: n2(w.fixB), u: U } } });
        if (w.both.ra > 0 && w.both.rb > 0) fixes.push({ id: 'both', action: 'setR', args: [[w.a, w.both.ra], [w.b, w.both.rb]], msg: { key: 'why.fix.both', vars: { a: w.a + 1, b: w.b + 1, ra: n2(w.both.ra), rb: n2(w.both.rb), u: U } } });
        for (const f of fixes) f.text = t(f.msg.key, f.msg.vars);
        const A = piAt(w.a), B = piAt(w.b);
        out.push({ code: 'why.overlap', part: 'pi' + (w.a + 1) + '-' + (w.b + 1), severity: 'error', msg, text: t(msg.key, msg.vars), about, source: { name: 'civilcraft.curves' },
          req: { op: '<=', value: w.dist, unit: U }, found: { value: w.need, unit: U }, fixes, ...(A && B ? { where: { space: '2d', at: [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2] } } : {}) });
      } else if (w.kind === 'back') {
        const msg = { key: 'why.back', vars: { pi: w.pi + 1 } };
        const f = { id: 'nocurve', action: 'setR', args: [[w.pi, 0]], msg: { key: 'why.fix.nocurve', vars: { pi: w.pi + 1 } } };
        f.text = t(f.msg.key, f.msg.vars);
        out.push({ code: 'why.back', part: 'pi' + (w.pi + 1), severity: 'error', msg, text: t(msg.key, msg.vars), about, source: { name: 'civilcraft.curves' }, fixes: [f], where: { space: '2d', at: piAt(w.pi) } });
      } else {
        const msg = { key: 'why.min', vars: { pi: w.pi + 1, r: n2(w.r), min: n2(w.minR), u: U } };
        const fixes = [];
        if (w.fix !== null) { const f = { id: 'min', action: 'setR', args: [[w.pi, w.fix]], msg: { key: 'why.fix.min', vars: { pi: w.pi + 1, r: n2(w.fix), u: U } } }; f.text = t(f.msg.key, f.msg.vars); fixes.push(f); }
        const none = w.fix === null ? ' ' + t('why.min.none', { pi: w.pi + 1, max: n2(w.maxR), min: n2(w.minR), u: U }) : '';
        out.push({ code: 'why.min', part: 'pi' + (w.pi + 1), severity: 'warning', msg, text: t(msg.key, msg.vars) + none, about, source: { name: 'civilcraft.curves' },
          req: { op: '>=', value: w.minR, unit: U }, found: { value: w.r, unit: U }, fixes, where: { space: '2d', at: piAt(w.pi) } });
      }
    }
    for (const w of verticalWhy(a.pvis || [])) {
      const msg = { key: w.side === 'before' ? 'why.vc.before' : 'why.vc.past', vars: { pvi: w.pvi + 1, l: n2(w.L), room: n2(w.room / 2), u: U } };
      const fixes = [];
      if (w.fix) { const f = { id: 'L', action: 'setL', args: { index: w.index, L: w.fix }, msg: { key: 'why.fix.l', vars: { pvi: w.pvi + 1, l: n2(w.fix), k: w.K === null ? '' : String(Math.round(w.K * 10) / 10), u: U } } }; f.text = t(f.msg.key, f.msg.vars); fixes.push(f); }
      out.push({ code: 'why.vc', part: 'pvi' + (w.pvi + 1), severity: 'error', msg, text: t(msg.key, msg.vars), about, source: { name: 'civilcraft.profile' },
        req: { op: '<=', value: w.fix || 0, unit: U }, found: { value: w.L, unit: U }, fixes });
    }
  }
  // 0.7.1 71.19: the road drawn on flat stand-in ground (no survey or surface yet) — the corridor result's own warnings, as data
  for (const it of standIn || []) {
    for (const w of it.warnings || []) {
      if (!w || w.code !== 'corridor.standin') continue;
      const key = w.basis === 'profile' ? 'corr.standin' : 'corr.standin.zero';
      out.push({ code: 'corridor.standin', severity: 'warning', msg: { key, vars: { z: Number(w.z ?? 0).toFixed(2), unit: unit } }, text: String(w.text || ''), about: [{ kind: 'alignment', id: w.ref || it.id, label: it.name || it.id }],
        source: { name: 'civilcraft.corridor' } });
    }
  }
  // 0.7.1 71.22: retaining walls and side slopes of pads and Landscape platforms — the grading result's own warnings, as data
  for (const it of graded || []) {
    for (const w of it?.warnings || []) {
      if (!w || typeof w.code !== 'string' || !/^grade\./.test(w.code)) continue;
      const ab = w.about && w.about.kind && w.about.id != null ? { kind: String(w.about.kind), id: String(w.about.id) } : w.ref != null ? { kind: 'pad', id: String(w.ref) } : null;
      const side = Array.isArray(w.k) ? w.k[0] : w.k;
      const p = { code: w.code, severity: ['error', 'warning', 'note'].includes(w.severity) ? w.severity : 'warning', text: String(w.text || ''), about: ab ? [{ ...ab, label: w.msg?.vars?.name || it.name || ab.id }] : [],
        part: (Number.isInteger(side) ? 'side' + (side + 1) : '') + (w.kind ? '-' + w.kind : ''), source: { name: 'civilcraft.grading' } };
      if (w.msg && typeof w.msg.key === 'string') p.msg = { key: w.msg.key, vars: w.msg.vars || {} };
      if (w.code === 'grade.wall.tall' && Number.isFinite(w.limit) && Number.isFinite(w.h)) { const u = w.msg?.vars?.u || unit; p.req = { op: '<=', value: w.limit, unit: u }; p.found = { value: w.h, unit: u }; }
      if (w.code === 'grade.slope.steep' && Number.isFinite(w.limit) && Number.isFinite(w.H)) { p.req = { op: '>=', value: w.limit, unit: 'H:1' }; p.found = { value: w.H, unit: 'H:1' }; }
      out.push(p);
    }
  }
  // 0.7.1 71.26: railway tracks — rail.js cantPlan's own warnings (cant, deficiency, excess, cant gradient and rate, ramps on the straight,
  // overlapping ramps, no design speed), already in this shape; required vs found from their limit and value
  for (const it of rail || []) {
    for (const w of it?.warnings || []) {
      if (!w || typeof w.code !== 'string' || !/^rail\./.test(w.code)) continue;
      const p = { code: w.code, severity: ['error', 'warning', 'note'].includes(w.severity) ? w.severity : 'warning', text: String(w.text || ''), about: [{ kind: 'alignment', id: String(it.id), label: it.name || String(it.id) }],
        part: String(w.part || ''), source: { name: 'civilcraft.rail' } };
      if (w.msg && typeof w.msg.key === 'string') p.msg = { key: w.msg.key, vars: w.msg.vars || {} };
      if (Number.isFinite(w.limit) && Number.isFinite(w.value)) { p.req = { op: '<=', value: w.limit, unit: w.unit || 'mm' }; p.found = { value: w.value, unit: w.unit || 'mm' }; }
      out.push(p);
    }
  }
  // 0.7.1 71.27: the project's IFC pair (ifc-native.js decide): the IFC changed by another program, one file older than the other, or the IFC
  // missing — about the project as a whole; fixes: save now (both files) / show the IFC's geometry as reference
  for (const w of native || []) {
    if (!w || typeof w.code !== 'string' || !/^ifc\.native\./.test(w.code)) continue;
    out.push({ code: w.code, severity: 'warning', msg: w.msg, text: String(w.text || ''), about: [], source: { name: 'civilcraft.native' }, fixes: Array.isArray(w.fixes) ? w.fixes : [] });
  }
  return out;
}

const CTRL = new RegExp('[\\u0000-\\u001f\\u007f\\u2028\\u2029\\u202a-\\u202e\\u2066-\\u2069]', 'g');
const str = (v, max) => (typeof v === 'string' || typeof v === 'number' ? String(v).replace(CTRL, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : '');
/** The project file's `problems.accepted` (untrusted) — the same rules as problems.js cleanAccepted (bin/test-problems.mjs compares them). */
export function cleanAcceptedCivil(list) {
  const out = [], seen = new Set();
  for (const r of (Array.isArray(list) ? list : []).slice(0, 5000)) {
    if (!r || typeof r !== 'object') continue;
    const id = str(r.id, 240);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const date = typeof r.date === 'string' && /^\d{4}-\d{2}-\d{2}(T[\d:.]+Z?)?$/.test(r.date) ? r.date.slice(0, 30) : '';
    out.push({ id, by: str(r.by, 80), reason: str(r.reason, 500), date, fp: str(r.fp, 16) });
  }
  return out;
}

// ---- P.6 (0.8, session problems-08): ⚠ markers on the plan. Pure: the adapter's anchor and the view hook; civilcraft.js mounts them
// with `P.markers(civilMarkers({ view, stage, project: () => project, is3D }))`.
const mid = (pts) => {
  const q = (pts || []).filter((a) => a && Number.isFinite(a.x) && Number.isFinite(a.y));
  if (!q.length) return null;
  return [q.reduce((s, a) => s + a.x, 0) / q.length, q.reduce((s, a) => s + a.y, 0) / q.length];
};
/** Where a problem sits on the plan, in plan units: the first object it is about (alignment → middle PI, pad / platform → centre, structure → its place, pipe → middle of its ends). */
export function civilAnchor(state, p) {
  const s = state || {};
  for (const r of p.about || []) {
    const id = String(r.id);
    if (r.kind === 'alignment') { const a = (s.alignments || []).find((x) => String(x.id) === id); const pt = a && mid(a.pis && a.pis.length > 2 ? [a.pis[Math.floor(a.pis.length / 2)]] : a.pis); if (pt) return pt; }
    else if (r.kind === 'pad') { const d = (s.pads || []).find((x) => String(x.id) === id); const pt = d && mid(d.pts); if (pt) return pt; }
    else if (r.kind === 'ls-grade') { const g = ((s.landscape || {}).grading || []).find((x) => String(x.id) === id); const pt = g && mid(g.pts); if (pt) return pt; }
    else if (r.kind === 'structure') { const x = ((s.network || {}).structures || []).find((q) => String(q.id) === id); if (x && Number.isFinite(x.x) && Number.isFinite(x.y)) return [x.x, x.y]; }
    else if (r.kind === 'pipe') {
      const nw = s.network || {}, q = (nw.pipes || []).find((y) => String(y.id) === id);
      const ends = q ? (nw.structures || []).filter((y) => y.id === q.from || y.id === q.to) : [];
      const pt = mid(ends); if (pt) return pt;
    } else if (r.kind === 'river') { if (p.where?.at) return p.where.at; const rv = (s.rivers || []).find((x) => String(x.id) === id); const pt = rv && mid(rv.centreline); if (pt) return pt;   // 0.8 SU.957 (civil-08)
    } else if (r.kind === 'solar') { const a = ((s.solar || {}).arrays || []).find((x) => String(x.id) === id); const poly = a && regionOf({ state: s }, a); const pt = poly && mid(poly); if (pt) return pt;   // 0.8 EG.15
    } else if (r.kind === 'mass') { const m = (s.masses || []).find((x) => String(x.id) === id); const pt = m && mid(m.pts || m.footprint); if (pt) return pt; }
  }
  return null;
}
/** The shell's marker config for the plan view. The plan's overlay is wrapped, not replaced (view.js stays as it is); markers hide in 3D. */
export function civilMarkers({ view, stage, project, is3D = () => false }) {
  return {
    stage,
    anchor: (p) => (is3D() ? null : civilAnchor(project().state, p)),
    toScreen: (pt) => (is3D() ? null : view.toScreen(pt[0], pt[1])),
    onView: (fn) => {
      const prev = view.drawOverlay;
      const wrapped = (ctx, v) => { prev?.(ctx, v); fn(); };
      view.drawOverlay = wrapped;
      return () => { if (view.drawOverlay === wrapped) view.drawOverlay = prev; };
    },
  };
}
