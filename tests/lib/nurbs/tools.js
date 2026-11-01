/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors and labels are codes and keys (the app words them). */
/**
 * tools.js — cc-nurbs (0.8 SU.747b, session `nurbs`): the commands a host's Surfaces tools and panel call, as pure functions on
 * a patch set (doc.js). DOM-free: ModelCraft and PartCraft draw the buttons, pick the curves and edges, keep undo (one command =
 * one snapshot of the doc) and show the words for the keys; the geometry and the numbers come from here, so both apps behave the
 * same. Mount lines and their tests go to each app's owner by inbox (docs/0.8-sessions/nurbs.md § Inbox requests).
 *
 *   COMMANDS: { [id]: { label: lang key, needs: [{ kind: 'curve' | 'surface' | 'edge' | 'end' | 'points', n }], options } }
 *   run(doc, id, args) → { doc, ids (new items), report, problems } — never changes `doc`; throws NurbsError on bad input
 *   panel(doc, { tol }) → rows for the Surfaces panel: one per item (kind, degree, control points, knots, rational) and one per
 *     measured edge ({ a, edgeA, b, edgeB, want, got, gap, angle, dk }) — the continuity table — plus the problems for the shell
 *   pick(doc, ref) → the geometry a reference names: 's3', 's3.u1' (an edge), 'c2.end'
 *
 * Arguments use item ids: { curves: ['c1', 'c2'] }, { surface: 's1', edge: 'u1', target: 's2', targetEdge: 'v0' }, …
 */
import * as C from './curve.js';
import * as F from './fit.js';
import * as S from './surface.js';
import * as K from './construct.js';
import * as M from './match.js';
import * as D from './doc.js';
import * as TR from './trim.js';

const { fail } = C;

export const COMMANDS = Object.freeze({
  'curve.points': { label: 'nurbs.cmd.curve_points', needs: [{ kind: 'points', n: 2 }], options: { degree: 3 } },
  'curve.cvs': { label: 'nurbs.cmd.curve_cvs', needs: [{ kind: 'points', n: 2 }], options: { degree: 3 } },
  'curve.insertKnot': { label: 'nurbs.cmd.insert_knot', needs: [{ kind: 'curve', n: 1 }], options: { at: 0.5, times: 1 } },
  'curve.removeKnot': { label: 'nurbs.cmd.remove_knot', needs: [{ kind: 'curve', n: 1 }], options: { at: 0.5, tol: 0.01 } },
  'curve.elevate': { label: 'nurbs.cmd.elevate', needs: [{ kind: 'curve', n: 1 }], options: { by: 1 } },
  'curve.reduce': { label: 'nurbs.cmd.reduce', needs: [{ kind: 'curve', n: 1 }], options: { tol: 0.01 } },
  'curve.rebuild': { label: 'nurbs.cmd.rebuild', needs: [{ kind: 'curve', n: 1 }], options: { count: 8, degree: 3 } },
  'curve.match': { label: 'nurbs.cmd.match_curve', needs: [{ kind: 'end', n: 2 }], options: { continuity: 'G2' } },
  'curve.blend': { label: 'nurbs.cmd.blend_curve', needs: [{ kind: 'end', n: 2 }], options: { continuity: 'G2', bulge: [1, 1] } },
  'curve.join': { label: 'nurbs.cmd.join', needs: [{ kind: 'curve', n: 2 }], options: { tol: 0.01 } },
  'curve.split': { label: 'nurbs.cmd.split', needs: [{ kind: 'curve', n: 1 }], options: { at: 0.5 } },
  'surface.loft': { label: 'nurbs.cmd.loft', needs: [{ kind: 'curve', n: 2 }], options: { degree: 3 } },
  'surface.ruled': { label: 'nurbs.cmd.ruled', needs: [{ kind: 'curve', n: 2 }], options: {} },
  'surface.extrude': { label: 'nurbs.cmd.extrude', needs: [{ kind: 'curve', n: 1 }], options: { dir: [0, 0, 10] } },
  'surface.revolve': { label: 'nurbs.cmd.revolve', needs: [{ kind: 'curve', n: 1 }], options: { origin: [0, 0, 0], axis: [0, 0, 1], angle: 360 } },
  'surface.sweep1': { label: 'nurbs.cmd.sweep1', needs: [{ kind: 'curve', n: 2 }], options: { tol: 0.01, frame: 'rmf' } },
  'surface.sweep2': { label: 'nurbs.cmd.sweep2', needs: [{ kind: 'curve', n: 3 }], options: { tol: 0.01, keepHeight: false } },
  'surface.network': { label: 'nurbs.cmd.network', needs: [{ kind: 'curve', n: 4 }], options: { tol: 0.01 } },
  'surface.coons': { label: 'nurbs.cmd.coons', needs: [{ kind: 'curve', n: 4 }], options: {} },
  'surface.match': { label: 'nurbs.cmd.match_surface', needs: [{ kind: 'edge', n: 2 }], options: { continuity: 'G1' } },
  'surface.blend': { label: 'nurbs.cmd.blend_surface', needs: [{ kind: 'edge', n: 2 }], options: { continuity: 'G1', bulge: [1, 1] } },
  'surface.offset': { label: 'nurbs.cmd.offset', needs: [{ kind: 'surface', n: 1 }], options: { distance: 1, tol: 0.01 } },
  'surface.extend': { label: 'nurbs.cmd.extend', needs: [{ kind: 'edge', n: 1 }], options: { length: 5 } },
  'surface.rebuild': { label: 'nurbs.cmd.rebuild_surface', needs: [{ kind: 'surface', n: 1 }], options: { nu: 8, nv: 8, du: 3, dv: 3 } },
  'surface.insertKnot': { label: 'nurbs.cmd.insert_knot', needs: [{ kind: 'surface', n: 1 }], options: { dir: 'u', at: 0.5, times: 1 } },
  'surface.elevate': { label: 'nurbs.cmd.elevate', needs: [{ kind: 'surface', n: 1 }], options: { dir: 'u', by: 1 } },
  // trimmed surfaces (0.8 DC.54 S2): the patch keeps its shape; the part shown is cut by loops in its (u, v) plane
  'surface.trimCurve': { label: 'nurbs.cmd.trim_curve', needs: [{ kind: 'surface', n: 1 }, { kind: 'curve', n: 1 }], options: { hole: false, tol: 0.1 } },
  'surface.trimRect': { label: 'nurbs.cmd.trim_rect', needs: [{ kind: 'surface', n: 1 }], options: { u0: 0.25, u1: 0.75, v0: 0.25, v1: 0.75, hole: false } },
  'surface.trimCircle': { label: 'nurbs.cmd.trim_circle', needs: [{ kind: 'surface', n: 1 }], options: { u: 0.5, v: 0.5, r: 0.25, hole: true } },
  'surface.untrim': { label: 'nurbs.cmd.untrim', needs: [{ kind: 'surface', n: 1 }], options: {} },
});

const geo = (doc, id, kind) => {
  const it = D.item(doc, id);
  if (!it || (kind && it.kind !== kind)) fail('nurbs.err.no_item', { id });
  return it[it.kind];
};

export function pick(doc, ref) {
  const [id, sub] = String(ref).split('.');
  const it = D.item(doc, id);
  if (!it) fail('nurbs.err.no_item', { id });
  if (!sub) return it[it.kind];
  if (it.kind === 'surface') return S.edgeCurve(it.surface, sub);
  const e = C.endsOf(it.curve);
  if (sub === 'start' || sub === 'end') return e[sub];
  fail('nurbs.err.edge');
}

const addNew = (doc, kind, g, name) => { const r = D.add(doc, kind, g, { name }); return [r.doc, r.id]; };
const replaced = (doc, id, g) => D.replace(doc, id, g);

export function run(doc, id, args = {}) {
  const cmd = COMMANDS[id];
  if (!cmd) fail('nurbs.err.no_command', { id });
  const o = { ...cmd.options, ...args };
  let out = doc, ids = [], report = null;
  const curves = (n) => { const list = (o.curves || []).map((c) => geo(doc, c, 'curve')); if (list.length < n) fail('nurbs.err.need', { kind: 'curve', n }); return list; };
  switch (id) {
    case 'curve.points': { const c = F.interpolate(o.points, o.degree); [out, ids[0]] = addNew(doc, 'curve', c, o.name); break; }
    case 'curve.cvs': {
      const deg = Math.min(o.degree, o.points.length - 1);
      const c = { deg, knots: (o.knots || null) ?? clamped(o.points.length, deg), cvs: o.points, w: o.weights || null };
      [out, ids[0]] = addNew(doc, 'curve', c, o.name); break;
    }
    case 'curve.insertKnot': { const [c] = curves(1); out = replaced(doc, o.curves[0], C.insertKnot(c, at(c, o.at), o.times)); break; }
    case 'curve.removeKnot': { const [c] = curves(1); const r = C.removeKnot(c, at(c, o.at), 1, o.tol); out = replaced(doc, o.curves[0], r.curve); report = { removed: r.removed }; break; }
    case 'curve.elevate': { const [c] = curves(1); out = replaced(doc, o.curves[0], C.elevate(c, o.by)); break; }
    case 'curve.reduce': { const [c] = curves(1); const r = C.reduce(c, o.tol); if (!r) fail('nurbs.err.reduce', { tol: o.tol }); out = replaced(doc, o.curves[0], r.curve); report = { error: r.error }; break; }
    case 'curve.rebuild': { const [c] = curves(1); const r = F.rebuild(c, o.count, o.degree); out = replaced(doc, o.curves[0], r.curve); report = { deviation: r.deviation.max }; break; }
    case 'curve.match': { const r = M.matchCurve(geo(doc, o.curve, 'curve'), o.end, geo(doc, o.target, 'curve'), o.targetEnd, { continuity: o.continuity }); out = replaced(doc, o.curve, r.curve); report = r.report; break; }
    case 'curve.blend': { const r = M.blendCurve(geo(doc, o.a, 'curve'), o.endA, geo(doc, o.b, 'curve'), o.endB, { continuity: o.continuity, bulge: o.bulge }); [out, ids[0]] = addNew(doc, 'curve', r.curve, o.name); report = r.report; break; }
    case 'curve.join': { const c = C.join(curves(2), o.tol); [out, ids[0]] = addNew(doc, 'curve', c, o.name); break; }
    case 'curve.split': { const [c] = curves(1); const [a, b] = C.split(c, at(c, o.at)); out = replaced(doc, o.curves[0], a); [out, ids[0]] = addNew(out, 'curve', b, o.name); break; }
    case 'surface.loft': { const r = K.loft(curves(2), { degree: o.degree }); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.ruled': { const [a, b] = curves(2); const r = K.ruled(a, b); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.extrude': { const [c] = curves(1); const r = K.extrude(c, o.dir); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.revolve': { const [c] = curves(1); const r = K.revolve(c, o.origin, o.axis, o.angle * Math.PI / 180); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.sweep1': { const [p, rail] = curves(2); const r = K.sweep1(p, rail, { tol: o.tol, frame: o.frame }); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.sweep2': { const [p, r1, r2] = curves(3); const r = K.sweep2(p, r1, r2, { tol: o.tol, keepHeight: o.keepHeight }); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.network': {
      const P = (o.profiles || []).map((c) => geo(doc, c, 'curve')), G = (o.guides || []).map((c) => geo(doc, c, 'curve'));
      const r = K.network(P, G, { tol: o.tol }); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break;
    }
    case 'surface.coons': { const [a, b, c, d] = curves(4); const r = K.coons(a, b, c, d); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.match': {
      const r = M.matchSurface(geo(doc, o.surface, 'surface'), o.edge, geo(doc, o.target, 'surface'), o.targetEdge, { continuity: o.continuity });
      out = D.link(replaced(doc, o.surface, r.surface), o.surface, o.edge, o.target, o.targetEdge, o.continuity); report = r.report; break;
    }
    case 'surface.blend': {
      const r = M.blendSurface(geo(doc, o.a, 'surface'), o.edgeA, geo(doc, o.b, 'surface'), o.edgeB, { continuity: o.continuity, bulge: o.bulge });
      [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name);
      out = D.link(D.link(out, ids[0], 'u0', o.a, o.edgeA, o.continuity), ids[0], 'u1', o.b, o.edgeB, o.continuity); report = r.report; break;
    }
    case 'surface.offset': { const r = K.offset(geo(doc, o.surface, 'surface'), o.distance, { tol: o.tol }); [out, ids[0]] = addNew(doc, 'surface', r.surface, o.name); report = r.report; break; }
    case 'surface.extend': { const r = K.extend(geo(doc, o.surface, 'surface'), o.edge, o.length); out = replaced(doc, o.surface, r.surface); report = r.report; break; }
    case 'surface.rebuild': { const r = K.rebuild(geo(doc, o.surface, 'surface'), o.nu, o.nv, o.du, o.dv); out = replaced(doc, o.surface, r.surface); report = r.report; break; }
    case 'surface.insertKnot': { const s = geo(doc, o.surface, 'surface'); const [a, b] = o.dir === 'u' ? S.domainU(s) : S.domainV(s); out = replaced(doc, o.surface, S.insertKnot(s, o.dir, a + (b - a) * o.at, o.times)); break; }
    case 'surface.elevate': { out = replaced(doc, o.surface, S.elevate(geo(doc, o.surface, 'surface'), o.dir, o.by)); break; }
    case 'surface.trimCurve': case 'surface.trimRect': case 'surface.trimCircle': {
      const s = geo(doc, o.surface, 'surface'), it = D.item(doc, o.surface);
      const loop = id === 'surface.trimCurve' ? TR.curveLoop(s, geo(doc, o.curve, 'curve'), { tol: o.tol })
        : id === 'surface.trimRect' ? TR.rectLoop(s, o.u0, o.u1, o.v0, o.v1)
          : TR.circleLoop(s, o.u, o.v, o.r, 96);
      out = D.setTrim(doc, o.surface, TR.addLoop(s, it.trim || null, loop, { hole: !!o.hole }));
      report = { area: TR.area(s, D.item(out, o.surface).trim, { tol: 0.05 }) }; break;
    }
    case 'surface.untrim': { geo(doc, o.surface, 'surface'); out = D.setTrim(doc, o.surface, null); break; }
    default: fail('nurbs.err.no_command', { id });
  }
  const cont = D.continuity(out);
  return { doc: out, ids, report, problems: cont.problems };
}

function clamped(n, p) { const U = new Array(p + 1).fill(0); for (let i = 1; i < n - p; i++) U.push(i / (n - p)); for (let i = 0; i <= p; i++) U.push(1); return U; }
const at = (c, f) => { const [a, b] = C.domain(c); return a + (b - a) * f; };

export function panel(doc, { tol } = {}) {
  const items = doc.items.map((it) => (it.kind === 'curve'
    ? { id: it.id, name: it.name, kind: 'curve', degree: it.curve.deg, cvs: it.curve.cvs.length, knots: it.curve.knots.length, rational: !!it.curve.w }
    : { id: it.id, name: it.name, kind: 'surface', degree: [it.surface.degU, it.surface.degV], cvs: [it.surface.cvs.length, it.surface.cvs[0].length], rational: !!it.surface.w }));
  const ids = D.surfaces(doc).map((it) => it.id);
  const { report, problems } = D.continuity(doc, tol ? { tol } : {});
  const edges = report.edges.map((e) => ({ a: ids[e.a], edgeA: e.edgeA, b: ids[e.b], edgeB: e.edgeB, want: e.want, got: e.cls, gap: e.gap, angle: e.angle, dk: e.dk.max, flipped: e.flipped }));
  return { items, edges, problems, tol: report.tol };
}
