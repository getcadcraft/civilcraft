/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-nurbs is a standalone library; its errors are codes (the app words them). */
/**
 * step.js — cc-nurbs (0.8 SU.747b, session `nurbs`): STEP for exactly what S1 makes — B-spline curves and untrimmed B-spline
 * surfaces, rational or not — written and read back without loss. DOM-free. lib/step (cc-step, owner `engineer` in 0.8) owns
 * STEP in general and reads any file as triangles; this module is the B-spline entity writer it does not have (D7.45: no writer
 * in the kernel either) and a reader for our own files. Whether it moves into lib/step is asked in docs/0.8-sessions/engineer.md.
 *
 * Written from the published schemas only (ISO 10303-21 the file; -42 geometry and topology: b_spline_curve_with_knots,
 * b_spline_surface_with_knots, rational_b_spline_curve/surface as complex instances in alphabetical order, advanced_face,
 * open_shell, shell_based_surface_model; -43 manifold_surface_shape_representation, geometric_curve_set inside a
 * geometrically_bounded_wireframe_shape_representation; AP242's product structure). No STEP library's code read.
 *
 * Each surface is one advanced face bounded by its four edge curves (exact iso-curves; an edge that has collapsed to a point is
 * left out of the loop), in an open shell of its own — S1 has no sewing, so neighbours are separate shells. Curves go in a
 * geometric curve set.
 *
 *   writeStep(doc, { name, author, org, time }) → text (AP242, millimetres)
 *   readStep(text) → doc (cadcraft-nurbs) with every B-spline face surface and curve-set curve, in mm; NurbsError nurbs.err.step_*
 *   parseP21(text) → Map(id → { type, params } | { type: '', parts }) (the small Part 21 reader readStep uses; capped)
 */
import * as B from './basis.js';
import * as C from './curve.js';
import * as S from './surface.js';
import * as D from './doc.js';
import * as TR from './trim.js';
import * as V from './vec.js';

const { fail } = C;
export const MAX_BYTES = 200 * 1024 * 1024;
export const MAX_ENTITIES = 4000000;

// ------------------------------------------------------------------------------------------------ writing

export function real(x) {
  if (!Number.isFinite(x)) fail('nurbs.err.step_number');
  if (Object.is(x, -0)) x = 0;
  let s = String(x).toUpperCase();
  if (!s.includes('.')) s = s.includes('E') ? s.replace('E', '.E') : s + '.';
  return s;
}
export function str(x) {
  let o = '';
  for (const ch of String(x)) {
    const c = ch.codePointAt(0);
    if (ch === "'") o += "''";
    else if (ch === '\\') o += '\\\\';
    else if (c >= 32 && c < 127) o += ch;
    else if (c < 0x10000) o += '\\X2\\' + c.toString(16).toUpperCase().padStart(4, '0') + '\\X0\\';
    else o += '\\X4\\' + c.toString(16).toUpperCase().padStart(8, '0') + '\\X0\\';
  }
  return "'" + o + "'";
}

function knotLists(U, p, n) {
  // STEP keeps distinct knots and their multiplicities (clamped: p + 1 at each end)
  const ks = B.distinctKnots(U);
  void p; void n;
  return { mults: ks.map((k) => k.m), knots: ks.map((k) => k.u) };
}

export function writeStep(doc, { name = 'nurbs', author = '', org = '', time = null } = {}) {
  const d = D.cleanDoc(doc);
  const lines = [];
  let next = 1;
  const add = (body) => { const id = next++; lines.push('#' + id + '=' + body + ';'); return id; };
  const pt = (p) => add('CARTESIAN_POINT(\'\',(' + p.map(real).join(',') + '))');
  const list = (a) => '(' + a.join(',') + ')';
  const refs = (a) => list(a.map((i) => '#' + i));

  const ctxApp = add("APPLICATION_CONTEXT('managed model based 3d engineering')");
  add("APPLICATION_PROTOCOL_DEFINITION('international standard','ap242_managed_model_based_3d_engineering',2014,#" + ctxApp + ')');
  const pctx = add("PRODUCT_CONTEXT('',#" + ctxApp + ",'mechanical')");
  const prod = add('PRODUCT(' + str(name) + ',' + str(name) + ",'',(#" + pctx + '))');
  const pdf = add("PRODUCT_DEFINITION_FORMATION('','',#" + prod + ')');
  const pdc = add("PRODUCT_DEFINITION_CONTEXT('part definition',#" + ctxApp + ",'design')");
  const pd = add("PRODUCT_DEFINITION('design','',#" + pdf + ',#' + pdc + ')');
  const pds = add("PRODUCT_DEFINITION_SHAPE('','',#" + pd + ')');
  const uLen = add('(LENGTH_UNIT()NAMED_UNIT(*)SI_UNIT(.MILLI.,.METRE.))');
  const uAng = add('(NAMED_UNIT(*)PLANE_ANGLE_UNIT()SI_UNIT($,.RADIAN.))');
  const uSol = add('(NAMED_UNIT(*)SI_UNIT($,.STERADIAN.)SOLID_ANGLE_UNIT())');
  const unc = add('UNCERTAINTY_MEASURE_WITH_UNIT(LENGTH_MEASURE(1.E-06),#' + uLen + ",'distance_accuracy_value','')");
  const ctx = add('(GEOMETRIC_REPRESENTATION_CONTEXT(3)GLOBAL_UNCERTAINTY_ASSIGNED_CONTEXT((#' + unc + '))GLOBAL_UNIT_ASSIGNED_CONTEXT((#' + uLen + ',#' + uAng + ',#' + uSol + "))REPRESENTATION_CONTEXT('',''))");
  const o = pt([0, 0, 0]);
  const ax = add("AXIS2_PLACEMENT_3D('',#" + o + ',$,$)');

  const bsCurve = (c, nm = '') => {
    const ids = c.cvs.map(pt), { mults, knots } = knotLists(c.knots, c.deg, c.cvs.length - 1);
    if (!c.w) return add('B_SPLINE_CURVE_WITH_KNOTS(' + str(nm) + ',' + c.deg + ',' + refs(ids) + ',.UNSPECIFIED.,.F.,.F.,' + list(mults) + ',' + list(knots.map(real)) + ',.UNSPECIFIED.)');
    return add('(BOUNDED_CURVE()B_SPLINE_CURVE(' + c.deg + ',' + refs(ids) + ',.UNSPECIFIED.,.F.,.F.)B_SPLINE_CURVE_WITH_KNOTS(' + list(mults) + ',' + list(knots.map(real)) + ',.UNSPECIFIED.)CURVE()GEOMETRIC_REPRESENTATION_ITEM()RATIONAL_B_SPLINE_CURVE(' + list(c.w.map(real)) + ')REPRESENTATION_ITEM(' + str(nm) + '))');
  };
  const bsSurface = (s, nm = '') => {
    const ids = s.cvs.map((row) => row.map(pt));
    const ku = knotLists(s.knotsU, s.degU), kv = knotLists(s.knotsV, s.degV);
    const net = list(ids.map(refs));
    const kn = list(ku.mults) + ',' + list(kv.mults) + ',' + list(ku.knots.map(real)) + ',' + list(kv.knots.map(real)) + ',.UNSPECIFIED.';
    if (!s.w) return add('B_SPLINE_SURFACE_WITH_KNOTS(' + str(nm) + ',' + s.degU + ',' + s.degV + ',' + net + ',.UNSPECIFIED.,.F.,.F.,.F.,' + kn + ')');
    return add('(BOUNDED_SURFACE()B_SPLINE_SURFACE(' + s.degU + ',' + s.degV + ',' + net + ',.UNSPECIFIED.,.F.,.F.,.F.)B_SPLINE_SURFACE_WITH_KNOTS(' + kn + ')GEOMETRIC_REPRESENTATION_ITEM()RATIONAL_B_SPLINE_SURFACE(' + list(s.w.map((r) => list(r.map(real)))) + ')REPRESENTATION_ITEM(' + str(nm) + ')SURFACE())');
  };

  const shells = [];
  for (const it of D.surfaces(d)) {
    const s = it.surface, size = S.size(s);
    const [ua, ub] = S.domainU(s), [va, vb] = S.domainV(s);
    const corner = { '00': S.point(s, ua, va), '10': S.point(s, ub, va), '11': S.point(s, ub, vb), '01': S.point(s, ua, vb) };
    const vtx = {};
    const vOf = (k) => (vtx[k] || (vtx[k] = add("VERTEX_POINT('',#" + pt(corner[k]) + ')')));
    // counter-clockwise in (u, v) — v0 forward, u1 forward, v1 backward, u0 backward — so the face normal is Su × Sv
    const loopDef = [['v0', '00', '10', true], ['u1', '10', '11', true], ['v1', '01', '11', false], ['u0', '00', '01', false]];
    const oes = [];
    for (const [edge, a, b, same] of loopDef) {
      const ec = S.edgeCurve(s, edge);
      if (C.arcLength(ec) <= 1e-9 * size) continue;         // collapsed to a point (a pole): no edge
      const e = add("EDGE_CURVE('',#" + vOf(a) + ',#' + vOf(b) + ',#' + bsCurve(ec) + ',.T.)');
      oes.push(add("ORIENTED_EDGE('',*,*,#" + e + ',' + (same ? '.T.' : '.F.') + ')'));
    }
    // a trim loop (0.8 DC.54 S2): one closed degree-1 B-spline through the loop's points on the surface, one edge, one vertex
    const trimBound = (L, outer) => {
      const P3 = L.map((q) => S.point(s, q[0], q[1]));
      const line = C.polyline([...P3, P3[0]]);
      const v = add("VERTEX_POINT('',#" + pt(P3[0]) + ')');
      const e = add("EDGE_CURVE('',#" + v + ',#' + v + ',#' + bsCurve(line) + ',.T.)');
      const oe = add("ORIENTED_EDGE('',*,*,#" + e + ',.T.)');
      return add((outer ? 'FACE_OUTER_BOUND' : 'FACE_BOUND') + "('',#" + add("EDGE_LOOP('',(#" + oe + '))') + ',.T.)');
    };
    const bounds = [];
    if (it.trim && it.trim.outer) bounds.push(trimBound(it.trim.outer, true));
    else {
      const loop = add("EDGE_LOOP('',(" + oes.map((i) => '#' + i).join(',') + '))');
      bounds.push(add("FACE_OUTER_BOUND('',#" + loop + ',.T.)'));
    }
    if (it.trim) for (const h of it.trim.holes) bounds.push(trimBound(h, false));
    const face = add('ADVANCED_FACE(' + str(it.name || it.id) + ',(' + bounds.map((b) => '#' + b).join(',') + '),#' + bsSurface(s, it.id) + ',.T.)');
    shells.push(add("OPEN_SHELL('',(#" + face + '))'));
  }
  const reps = [];
  if (shells.length) {
    const sbsm = add("SHELL_BASED_SURFACE_MODEL('',(" + shells.map((i) => '#' + i).join(',') + '))');
    reps.push(add('MANIFOLD_SURFACE_SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + ',#' + sbsm + '),#' + ctx + ')'));
  }
  const cs = D.curves(d);
  if (cs.length) {
    const set = add("GEOMETRIC_CURVE_SET('',(" + cs.map((it) => '#' + bsCurve(it.curve, it.id)).join(',') + '))');
    reps.push(add('GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + ',#' + set + '),#' + ctx + ')'));
  }
  if (!reps.length) reps.push(add('SHAPE_REPRESENTATION(' + str(name) + ',(#' + ax + '),#' + ctx + ')'));
  add('SHAPE_DEFINITION_REPRESENTATION(#' + pds + ',#' + reps[0] + ')');
  for (const r of reps.slice(1)) add("SHAPE_REPRESENTATION_RELATIONSHIP('','',#" + reps[0] + ',#' + r + ')');

  const stamp = (time || new Date().toISOString()).slice(0, 19);
  return [
    'ISO-10303-21;', 'HEADER;',
    "FILE_DESCRIPTION(('CadCraft NURBS patch set (cc-nurbs)'),'2;1');",
    'FILE_NAME(' + str(name) + ',' + str(stamp) + ',(' + str(author) + '),(' + str(org) + "),'CadCraft cc-nurbs','CadCraft','');",
    "FILE_SCHEMA(('AP242_MANAGED_MODEL_BASED_3D_ENGINEERING_MIM_LF { 1 0 10303 442 1 1 4 }'));",
    'ENDSEC;', 'DATA;', ...lines, 'ENDSEC;', 'END-ISO-10303-21;', '',
  ].join('\n');
}

// ------------------------------------------------------------------------------------------------ reading (Part 21)

function decodeStr(s) {
  return s.replace(/''/g, "'").replace(/\\X2\\((?:[0-9A-F]{4})+)\\X0\\/gi, (_, h) => String.fromCharCode(...h.match(/.{4}/g).map((x) => parseInt(x, 16))))
    .replace(/\\X4\\((?:[0-9A-F]{8})+)\\X0\\/gi, (_, h) => String.fromCodePoint(...h.match(/.{8}/g).map((x) => parseInt(x, 16))))
    .replace(/\\\\/g, '\\');
}

/** Parameters of one entity body `(...)`, from position i; returns [value, next index]. */
function parseList(t, i) {
  const out = [];
  if (t[i] !== '(') fail('nurbs.err.step_syntax');
  i++;
  for (;;) {
    while (t[i] === ' ' || t[i] === '\n' || t[i] === '\r' || t[i] === '\t') i++;
    const ch = t[i];
    if (ch === undefined) fail('nurbs.err.step_syntax');
    if (ch === ')') return [out, i + 1];
    if (ch === ',') { i++; continue; }
    if (ch === '(') { const [v, j] = parseList(t, i); out.push(v); i = j; continue; }
    if (ch === "'") {
      let j = i + 1, s = '';
      for (;;) { const k = t.indexOf("'", j); if (k < 0) fail('nurbs.err.step_syntax'); if (t[k + 1] === "'") { s += t.slice(j, k + 2); j = k + 2; continue; } s += t.slice(j, k); i = k + 1; break; }
      out.push({ str: decodeStr(s) }); continue;
    }
    if (ch === '#') { let j = i + 1; while (t[j] >= '0' && t[j] <= '9') j++; out.push({ ref: +t.slice(i + 1, j) }); i = j; continue; }
    if (ch === '.') { const k = t.indexOf('.', i + 1); if (k < 0) fail('nurbs.err.step_syntax'); out.push({ enum: t.slice(i + 1, k) }); i = k + 1; continue; }
    if (ch === '$' || ch === '*') { out.push(null); i++; continue; }
    if ((ch >= '0' && ch <= '9') || ch === '-' || ch === '+') {
      let j = i + 1; while (j < t.length && /[0-9.EeDd+-]/.test(t[j])) j++;
      out.push(+t.slice(i, j).replace(/[Dd]/, 'E')); i = j; continue;
    }
    if (/^[A-Za-z_]$/.test(ch)) {
      // a typed parameter: NAME(value)
      let j = i; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
      const [v, k] = parseList(t, j);
      out.push({ typed: t.slice(i, j).toUpperCase(), value: v[0] }); i = k; continue;
    }
    fail('nurbs.err.step_syntax');
  }
}

export function parseP21(text) {
  if (typeof text !== 'string') fail('nurbs.err.step_not');
  if (text.length > MAX_BYTES) fail('nurbs.err.too_big');
  if (!/^\s*ISO-10303-21;/.test(text)) fail('nurbs.err.step_not');
  const t = text.replace(/\/\*[\s\S]*?\*\//g, '');
  const dataAt = t.search(/\bDATA\b[^;]*;/);
  if (dataAt < 0) fail('nurbs.err.step_not');
  const ents = new Map();
  const re = /#(\d+)\s*=\s*/g;
  re.lastIndex = dataAt;
  let m;
  while ((m = re.exec(t))) {
    if (ents.size >= MAX_ENTITIES) fail('nurbs.err.too_many', { max: MAX_ENTITIES });
    let i = re.lastIndex;
    try {
      if (t[i] === '(') {
        // complex instance: (A(...)B(...)...)
        i++;
        const parts = [];
        for (;;) {
          while (i < t.length && /\s/.test(t[i])) i++;
          if (i >= t.length) fail('nurbs.err.step_syntax');
          if (t[i] === ')') { i++; break; }
          let j = i; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
          const [params, k] = parseList(t, j);
          parts.push({ type: t.slice(i, j).toUpperCase(), params }); i = k;
        }
        ents.set(+m[1], { type: '', parts });
      } else {
        let j = i; while (j < t.length && /[A-Za-z0-9_]/.test(t[j])) j++;
        const [params, k] = parseList(t, j);
        ents.set(+m[1], { type: t.slice(i, j).toUpperCase(), params }); i = k;
      }
    } catch { /* one bad entity: skip it, keep reading */ }
    const semi = t.indexOf(';', i);
    re.lastIndex = semi < 0 ? t.length : semi + 1;
  }
  return ents;
}

export function readStep(text) {
  const E = parseP21(text);
  const get = (r) => (r && typeof r.ref === 'number' ? E.get(r.ref) || null : null);
  const part = (e, type) => (!e ? null : e.parts ? e.parts.find((p) => p.type === type) || null : e.type === type ? e : null);
  const num = (x) => (typeof x === 'number' ? x : x && typeof x.value === 'number' ? x.value : NaN);
  // length unit in mm: an SI length unit (MILLI METRE = 1, METRE = 1000, …) or a conversion-based one (inch = 25.4 × its base)
  const unitMm = (e, depth = 0) => {
    if (!e || depth > 4) return null;
    const si = part(e, 'SI_UNIT');
    if (si) { const pre = si.params[0] && si.params[0].enum; return (({ MILLI: 1e-3, CENTI: 1e-2, DECI: 0.1, KILO: 1e3, MICRO: 1e-6 })[pre] ?? 1) * 1000; }
    const cb = part(e, 'CONVERSION_BASED_UNIT');
    if (cb) { const mw = get(cb.params[1]), p = mw && (mw.params || (part(mw, 'MEASURE_WITH_UNIT') || {}).params); if (!p) return null; const v = num(p[0]), b = unitMm(get(p[1]), depth + 1); return Number.isFinite(v) && b ? v * b : null; }
    return null;
  };
  let unit = 1;
  for (const e of E.values()) if (part(e, 'LENGTH_UNIT')) { const u = unitMm(e); if (u > 0) { unit = u; break; } }
  const pts = (list) => list.map((r) => { const p = get(r); const c = p && p.params && p.params[1]; if (!Array.isArray(c)) fail('nurbs.err.step_point'); return [num(c[0]) * unit, num(c[1]) * unit, num(c[2] ?? 0) * unit]; });
  const expand = (mults, knots) => { const U = []; mults.forEach((m, i) => { for (let k = 0; k < m; k++) U.push(num(knots[i])); }); return U; };
  const curveOf = (e) => {
    const plain = part(e, 'B_SPLINE_CURVE_WITH_KNOTS');
    if (plain && plain.params.length >= 9) {
      const [, deg, cps, , , , mults, knots] = plain.params;
      return C.cleanCurve({ deg, cvs: pts(cps), knots: expand(mults, knots) });
    }
    const bs = part(e, 'B_SPLINE_CURVE'), wk = part(e, 'B_SPLINE_CURVE_WITH_KNOTS'), rat = part(e, 'RATIONAL_B_SPLINE_CURVE');
    if (bs && wk) {
      const [deg, cps] = bs.params, [mults, knots] = wk.params;
      return C.cleanCurve({ deg, cvs: pts(cps), knots: expand(mults, knots), w: rat ? rat.params[0].map(num) : null });
    }
    return null;
  };
  const surfaceOf = (e) => {
    const plain = part(e, 'B_SPLINE_SURFACE_WITH_KNOTS');
    if (plain && plain.params.length >= 13 && !e.parts) {
      const [, du, dv, net, , , , , mu, mv, ku, kv] = plain.params;
      return S.cleanSurface({ degU: du, degV: dv, cvs: net.map(pts), knotsU: expand(mu, ku), knotsV: expand(mv, kv) });
    }
    const bs = part(e, 'B_SPLINE_SURFACE'), wk = part(e, 'B_SPLINE_SURFACE_WITH_KNOTS'), rat = part(e, 'RATIONAL_B_SPLINE_SURFACE');
    if (bs && wk) {
      const [du, dv, net] = bs.params, [mu, mv, ku, kv] = wk.params;
      return S.cleanSurface({ degU: du, degV: dv, cvs: net.map(pts), knotsU: expand(mu, ku), knotsV: expand(mv, kv), w: rat ? rat.params[0].map((r) => r.map(num)) : null });
    }
    return null;
  };
  // the face's bounds as trim loops in (u, v): each edge's curve sampled (a degree-1 curve by its own points), turned the way the
  // oriented edge goes, projected on the surface. A boundary that is the patch's own edge, or not on the surface, is not a trim.
  const trimOf = (face, surf) => {
    const size = S.size(surf);
    const [ua, ub] = S.domainU(surf), [va, vb] = S.domainV(surf);
    const loops = [];
    for (const br of face.params[1] || []) {
      const b = get(br), lp = b && get(b.params[1]);
      if (!lp || lp.type !== 'EDGE_LOOP') continue;
      const pts3 = [];
      for (const oer of lp.params[1] || []) {
        const oe = get(oer), ed = oe && get(oe.params[3]);
        if (!ed || ed.type !== 'EDGE_CURVE') continue;
        const ce = get(ed.params[3]), c = ce ? curveOf(ce) : null;
        if (!c) continue;
        const [a, z] = C.domain(c);
        let seg = c.deg === 1 ? c.cvs.slice() : Array.from({ length: 33 }, (_, i) => C.point(c, a + (z - a) * i / 32));
        const sameEdge = !(ed.params[4] && ed.params[4].enum === 'F'), sameOr = !(oe.params[4] && oe.params[4].enum === 'F');
        if (sameEdge !== sameOr) seg = seg.reverse();
        for (const q of seg) if (!pts3.length || V.dist(pts3[pts3.length - 1], q) > 1e-9 * size) pts3.push(q);
      }
      if (pts3.length > 1 && V.dist(pts3[0], pts3[pts3.length - 1]) < 1e-6 * size) pts3.pop();
      if (pts3.length < 3) continue;
      const L = [];
      let uv0 = null, offSurface = false;
      for (const q of pts3) { const r = S.closestPoint(surf, q, uv0 ? { uv0 } : {}); if (r.d > 1e-4 * size) { offSurface = true; break; } uv0 = [r.u, r.v]; L.push([r.u, r.v]); }
      if (offSurface) continue;
      const bflag = b.params[2] && b.params[2].enum === 'F';
      loops.push({ L: bflag ? L.reverse() : L, outer: face.params[1].indexOf(br) === 0 || /OUTER/.test(b.type || '') });
    }
    if (!loops.length) return null;
    let outer = null; const holes = [];
    const full = (ub - ua) * (va === vb ? 0 : (vb - va));
    for (const { L, outer: isOuter } of loops) {
      let area = 0; for (let i = 0; i < L.length; i++) { const p = L[i], q = L[(i + 1) % L.length]; area += p[0] * q[1] - q[0] * p[1]; }
      if (isOuter) { if (Math.abs(area / 2) < 0.999 * full) outer = L; } else holes.push(L);
    }
    try { return TR.cleanTrim({ outer, holes }, surf); } catch { return null; }
  };
  const nameOf = (e) => { const p = part(e, 'REPRESENTATION_ITEM') || e; const s = p && p.params && p.params[0]; return s && typeof s.str === 'string' ? s.str : ''; };
  let doc = D.newDoc();
  const ids = [...E.keys()].sort((a, b) => a - b);
  for (const id of ids) {
    const e = E.get(id);
    if (e.type === 'ADVANCED_FACE') {
      const se = get(e.params[2]);
      const s = se ? surfaceOf(se) : null;
      if (!s) continue;
      const fname = e.params[0] && e.params[0].str || '';
      const added = D.add(doc, 'surface', s, { name: fname, id: nameOf(se) || null });
      doc = added.doc;
      const trim = trimOf(e, s);
      if (trim) doc = D.setTrim(doc, added.id, trim);
    } else if (e.type === 'GEOMETRIC_CURVE_SET') {
      for (const r of e.params[1] || []) { const ce = get(r), c = ce ? curveOf(ce) : null; if (c) doc = D.add(doc, 'curve', c, { id: nameOf(ce) || null }).doc; }
    }
  }
  if (!doc.items.length) fail('nurbs.err.step_empty');
  void V;
  return doc;
}
