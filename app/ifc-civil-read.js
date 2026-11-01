/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-read.js — 0.7.1 71.24: an IFC file into CivilCraft through cc-ifc (./ifc/, the shared reader BimCraft and DetailCraft use).
 * DOM-free; the Node test drives it exactly as the page does.
 *
 *   readCivilIfc(bytes, { units, maxRefTriangles }) → {
 *     schema, fileUnit (metres per file unit), units ('m' | 'ft': the project's, or the file's when none is given),
 *     georef: { crs, eastings, northings, height, rotation, scale } | null,
 *     alignments: [{ name, start, pis: [{x, y, r, ls1?, ls2?}], pvis: [{sta, z, L}], from, notes, design, gid (its GlobalId) }],
 *     surfaces: [{ id, name, kind 'eg' | 'design' | 'terrain', pts: [{x, y, z}], faces: [[a, b, c]] }],
 *     refs: [{ id, name, cls, positions: Float64Array (project coordinates), indices: Uint32Array }],
 *     counts, notes: [text] }
 *   layoutToPis(h) → { pis, notes } · layoutToPvis(v, start) → { pvis, notes }   (exported for the test)
 *   applyIfcImport(project, r, { eg, refs, file, label }) → { alignments, eg, refs }   one undo step (setTin when a TIN becomes the
 *     existing ground); `eg` = the index in r.surfaces to use as the existing ground, or -1 (none); the other surfaces and the
 *     elements become project.ifcRefs (shown in 3D as reference, kept while the project is open, not saved in the project file)
 *
 * Where the alignments come from, best first:
 *   IFC 4.3: IfcAlignment > IfcAlignmentHorizontal / IfcAlignmentVertical segments (the layout, "business logic"), the start station
 *     from the IfcReferent with Pset_Stationing at distance 0 (else 0). IFC 4x1: IfcAlignmentCurve with IfcAlignment2DHorizontal
 *     (line, circular arc, clothoid transition segments) and IfcAlignment2DVertical. CivilCraft's own IFC4 / IFC2x3 files: the PI and
 *     PVI tables of pset CadCraft_Alignment. A layout CivilCraft's PI model cannot hold (compound curves, spirals between two arcs,
 *     an alignment that starts or ends in a curve, spirals other than the clothoid) is not made into an alignment; it is said in the
 *     notes and its geometry stays a reference element.
 *   PIs come back as the crossing of the tangents before and after each curve (radius = the arc's, ls1 / ls2 = the spirals'); PVIs as
 *     the crossing of the grades (a parabolic arc's length = the vertical curve's L; a circular vertical arc is taken as a parabola of
 *     the same length and grades, noted).
 * Coordinates: the file's local coordinates through its IfcMapConversion (eastings, northings, rotation, scale) — the grid
 * coordinates of the file's map system — else, for a CivilCraft file without a coordinate system, plus its CadCraft_Site origin;
 * lengths converted from the file's unit to the project's.
 */

import { IfcFile } from './ifc/model.js';
import { GeoCtx } from './ifc/geo-ctx.js';
import { Geometry } from './ifc/geometry.js';
import { t } from './i18n.js';
import { transitionShape, transitionAt, cubicParamFor, buildAlignment } from './alignment.js';   // 0.7.1 71.26 / B: rail transitions
import { railDefaults, cleanRail } from './rail.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const M_PER = { m: 1, ft: 1200 / 3937 };

// ---------------------------------------------------------------------------- layouts → PIs / PVIs

/** Where a horizontal segment ends: { x, y, dir }. r0 / r1 signed (+ = turns left), 0 = straight. */
export function segEnd(s) {
  const k0 = s.r0 ? 1 / s.r0 : 0, k1 = s.r1 ? 1 / s.r1 : 0;
  if (s.type === 'LINE' || (!k0 && !k1)) return { x: s.x + Math.cos(s.dir) * s.len, y: s.y + Math.sin(s.dir) * s.len, dir: s.dir };
  if (s.type === 'CIRCULARARC' || Math.abs(k0 - k1) < 1e-15) {
    const sg = Math.sign(k0), r = Math.abs(1 / k0), cx = s.x - sg * Math.sin(s.dir) * r, cy = s.y + sg * Math.cos(s.dir) * r, turn = s.len * k0;
    const a0 = Math.atan2(s.y - cy, s.x - cx);
    return { x: cx + Math.cos(a0 + turn) * r, y: cy + Math.sin(a0 + turn) * r, dir: s.dir + turn };
  }
  const kind = KIND_OF[s.type] || 'clothoid';
  if (kind === 'cubic') {
    // the cubic parabola y = x³ / 6RLp along its tangent (Lp from the length along the curve); out of a curve: walked back from its end
    const R = 1 / Math.max(Math.abs(k0), Math.abs(k1)), Lp = cubicParamFor(R, s.len), q = transitionAt('cubic', s.len, R, Lp);
    const rot = (a, u, v) => [u * Math.cos(a) - v * Math.sin(a), u * Math.sin(a) + v * Math.cos(a)];
    if (!k0) { const sg = Math.sign(k1), [dx, dy] = rot(s.dir, q.x, sg * q.y); return { x: s.x + dx, y: s.y + dy, dir: s.dir + sg * q.th }; }
    const sg = Math.sign(k0), d1 = s.dir + sg * q.th, [dx, dy] = rot(d1 + Math.PI, q.x, -sg * q.y);
    return { x: s.x - dx, y: s.y - dy, dir: d1 };
  }
  // a transition: curvature k0 + (k1 − k0)·f(u) (alignment.js shapes; the clothoid f(u) = u), heading dir + L·(k0·u + (k1 − k0)·F(u)); Simpson's rule
  const F = transitionShape(kind).F, n = 400, hs = s.len / n, th = (u) => s.dir + s.len * (k0 * (u / s.len) + (k1 - k0) * F(Math.min(1, u / s.len)));
  let x = 0, y = 0;
  for (let i = 0; i <= n; i++) { const wgt = i === 0 || i === n ? 1 : i % 2 ? 4 : 2, a = th(i * hs); x += wgt * Math.cos(a); y += wgt * Math.sin(a); }
  return { x: s.x + (x * hs) / 3, y: s.y + (y * hs) / 3, dir: th(s.len) };
}

/** IFC 4.3 horizontal transition types → alignment.js kinds (the rail builder's TRANSITIONS). */
export const KIND_OF = { CLOTHOID: 'clothoid', CUBIC: 'cubic', BLOSSCURVE: 'bloss', HELMERTCURVE: 'helmert', COSINECURVE: 'sinehalf', SINECURVE: 'sine' };

function cross(p, d1, q, d2) {
  const ux = Math.cos(d1), uy = Math.sin(d1), vx = Math.cos(d2), vy = Math.sin(d2), den = ux * vy - uy * vx;
  if (Math.abs(den) < 1e-12) return null;
  const s = ((q.x - p.x) * vy - (q.y - p.y) * vx) / den;
  return { x: p.x + ux * s, y: p.y + uy * s };
}
const angDiff = (a, b) => Math.atan2(Math.sin(a - b), Math.cos(a - b));

export function layoutToPis(h0) {
  const h = (h0 || []).filter((s) => s.len > 1e-9);
  const notes = [];
  if (!h.length) return { pis: null, notes: [t('ifc.in.al.empty')] };
  const straight = (s) => s.type === 'LINE' || (!s.r0 && !s.r1);
  if (!straight(h[0]) || !straight(h[h.length - 1])) return { pis: null, notes: [t('ifc.in.al.endcurve')] };
  const pis = [{ x: h[0].x, y: h[0].y, r: 0 }];
  let i = 0;
  while (i < h.length) {
    const s = h[i];
    if (straight(s)) {
      const nx = h[i + 1];
      if (nx && straight(nx) && Math.abs(angDiff(nx.dir, s.dir)) > 1e-9) { const e = segEnd(s); pis.push({ x: e.x, y: e.y, r: 0 }); }   // an angle point
      i++;
      continue;
    }
    // a curve group: [clothoid 0 → R] [arc R] [clothoid R → 0], between two straights
    const before = h[i - 1], group = [];
    while (i < h.length && !straight(h[i])) group.push(h[i++]);
    const after = h[i];
    const types = group.map((g) => g.type).join(',');
    const TR = '(?:' + Object.keys(KIND_OF).join('|') + ')';
    const ok = new RegExp('^(' + TR + ',)?(CIRCULARARC)?(,' + TR + ')?$').test(types.replace(/^,|,$/g, ''));
    let R = 0, ls1 = 0, ls2 = 0, bad = !ok || !before || !after, kind = null;
    const lenOf = (g, r) => (KIND_OF[g.type] === 'cubic' ? cubicParamFor(r, g.len) : g.len);   // the cubic's PI length is along its tangent
    for (const g of group) {
      if (g.type === 'CIRCULARARC') { if (R && Math.abs(Math.abs(g.r0) - R) > 1e-6) bad = true; R = Math.abs(g.r0); }
      else if (KIND_OF[g.type]) {
        if (kind && kind !== KIND_OF[g.type]) notes.push(t('ifc.in.al.mixedtr'));
        kind = kind || KIND_OF[g.type];
        if (!g.r0 && g.r1) { if (ls1 || group.indexOf(g) !== 0) bad = true; R = R || Math.abs(g.r1); ls1 = lenOf(g, R); if (Math.abs(Math.abs(g.r1) - R) > 1e-6) bad = true; }
        else if (g.r0 && !g.r1) { if (group.indexOf(g) !== group.length - 1) bad = true; R = R || Math.abs(g.r0); ls2 = lenOf(g, R); if (Math.abs(Math.abs(g.r0) - R) > 1e-6) bad = true; }
        else bad = true;   // a spiral between two curves
      } else bad = true;
    }
    if (bad || !(R > 0)) return { pis: null, notes: [t('ifc.in.al.compound')] };
    const last = group[group.length - 1], e = segEnd(last);
    const pi = cross({ x: group[0].x, y: group[0].y }, group[0].dir, { x: e.x, y: e.y }, e.dir);
    if (!pi) return { pis: null, notes: [t('ifc.in.al.compound')] };
    pis.push({ x: pi.x, y: pi.y, r: R, ...(ls1 ? { ls1 } : {}), ...(ls2 ? { ls2 } : {}), ...(kind && kind !== 'clothoid' ? { tr: kind } : {}) });
  }
  const e = segEnd(h[h.length - 1]);
  pis.push({ x: e.x, y: e.y, r: 0 });
  return { pis, notes };
}

export function layoutToPvis(v0, start = 0) {
  const v = (v0 || []).filter((s) => s.len > 1e-9).sort((a, b) => a.d0 - b.d0);
  const notes = [];
  if (!v.length) return { pvis: [], notes };
  const pvis = [{ sta: start + v[0].d0, z: v[0].z0, L: 0 }];
  v.forEach((s, i) => {
    if (s.type === 'CIRCULARARC') notes.push(t('ifc.in.al.vcircle'));
    if (s.type === 'CLOTHOID') notes.push(t('ifc.in.al.vclothoid'));
    if (s.type !== 'CONSTANTGRADIENT') { pvis.push({ sta: start + s.d0 + s.len / 2, z: s.z0 + (s.g0 * s.len) / 2, L: s.len }); return; }
    const nx = v[i + 1];
    if (nx && nx.type === 'CONSTANTGRADIENT' && Math.abs(nx.g0 - s.g0) > 1e-12) pvis.push({ sta: start + s.d0 + s.len, z: s.z0 + s.g0 * s.len, L: 0 });
  });
  const l = v[v.length - 1], zEnd = l.type === 'CONSTANTGRADIENT' ? l.z0 + l.g0 * l.len : l.z0 + ((l.g0 + l.g1) / 2) * l.len;
  pvis.push({ sta: start + l.d0 + l.len, z: zEnd, L: 0 });
  return { pvis, notes: [...new Set(notes)] };
}

// ---------------------------------------------------------------------------- reading

function props(f, g) {
  // object id → { psetName: { prop: value } }
  const out = new Map();
  for (const rel of f.ofType('IFCRELDEFINESBYPROPERTIES')) {
    const def = g.ref(g.a(rel, 'RelatingPropertyDefinition'));
    if (def === null || g.t(def) !== 'IFCPROPERTYSET') continue;
    const name = g.str(g.a(def, 'Name')) || '', vals = {};
    for (const p of g.refs(g.a(def, 'HasProperties'))) if (g.t(p) === 'IFCPROPERTYSINGLEVALUE') { const v = g.a(p, 'NominalValue'); vals[g.str(g.a(p, 'Name'))] = v && typeof v === 'object' && 'typed' in v ? (typeof v.value === 'object' && v.value && 'enum' in v.value ? v.value.enum === 'T' : v.value) : null; }
    for (const o of g.refs(g.a(rel, 'RelatedObjects'))) { if (!out.has(o)) out.set(o, {}); out.get(o)[name] = vals; }
  }
  return out;
}
function nests(f, g) {
  const out = new Map();
  for (const rel of f.ofType('IFCRELNESTS')) { const o = g.ref(g.a(rel, 'RelatingObject')); if (o === null) continue; if (!out.has(o)) out.set(o, []); out.get(o).push(...g.refs(g.a(rel, 'RelatedObjects'))); }
  return out;
}

export function readCivilIfc(bytes, { units = null, maxRefTriangles = 2_000_000 } = {}) {
  const f = IfcFile.open(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
  const g = new GeoCtx(f), notes = [];
  const fileUnit = g.lengthUnit, pu = units || (Math.abs(fileUnit - 1) < 1e-9 ? 'm' : 'ft'), k = fileUnit / M_PER[pu];   // file units → project units
  const P = props(f, g), N = nests(f, g), raw = String(f.fileSchema || '').toUpperCase();
  // the file's local coordinates → project coordinates
  const geo = g.georef();
  let toProject, rot = 0, sc = 1;
  if (geo) {
    rot = geo.rotation; sc = geo.scale || 1;
    const M = geo.matrix;
    toProject = (x, y, z = 0) => [(M[0] * x + M[4] * y + M[8] * z + M[12]) * k, (M[1] * x + M[5] * y + M[9] * z + M[13]) * k, (M[2] * x + M[6] * y + M[10] * z + M[14]) * k];
  } else {
    const site = f.ofType('IFCSITE')[0], cc = site !== undefined ? P.get(site)?.CadCraft_Site : null;
    const ox = fin(cc?.OriginEasting) ? cc.OriginEasting : 0, oy = fin(cc?.OriginNorthing) ? cc.OriginNorthing : 0;
    toProject = (x, y, z = 0) => [(x + ox) * k, (y + oy) * k, z * k];
  }
  const out = { schema: raw.startsWith('IFC4X1') ? 'IFC4X1' : f.schemaName, fileUnit, units: pu, georef: geo ? { crs: geo.crs?.name || '', eastings: geo.eastings, northings: geo.northings, height: geo.height, rotation: rot, scale: sc } : null, alignments: [], surfaces: [], refs: [], counts: { alignments: 0, surfaces: 0, refs: 0, triangles: 0 }, notes };
  const LEN = sc * k;   // a length in the file → project units
  const used = new Set();   // products read as alignments or surfaces (not repeated as reference elements)

  // 0.7.1 71.24: the design speed and class CivilCraft wrote (CadCraft_Alignment)
  const designOf = (id) => {
    const c = P.get(id)?.CadCraft_Alignment;
    if (!c) return null;
    const speed = fin(c.DesignSpeedValue) ? c.DesignSpeedValue : null, unit = c.DesignSpeedUnit === 'mph' ? 'mph' : 'km/h', cls = typeof c.DesignClass === 'string' ? c.DesignClass : '';
    return speed !== null || cls ? { ...(speed !== null ? { speed } : {}), unit, ...(cls ? { cls } : {}) } : null;
  };
  const fromSegs = (name, h, v, start, from, id, cant = null) => {
    const r = layoutToPis(h);
    if (!r.pis) { notes.push(t('ifc.in.al.skip', { name, why: r.notes.join(' ') })); return; }
    const pv = layoutToPvis(v, start);
    // 0.7.1 71.26 / B: a railway — each curve's applied cant from the constant cant over its middle (the outer rail's height over the
    // inner one, mm), the rail settings CivilCraft wrote (CadCraft_Alignment.RailSettings), else the defaults with the file's rail head distance
    let rail = null;
    if (cant) {
      const al = buildAlignment({ pis: r.pis, start });
      for (const c of al.curves || []) {
        const mid = (c.sc + c.cs) / 2 - start, sg = cant.segs.find((q) => q.type === 'CONSTANTCANT' && q.d0 <= mid + 1e-6 && mid <= q.d0 + q.len + 1e-6);
        if (sg) { const E = c.ccw ? sg.sr - sg.sl : sg.sl - sg.sr; if (Math.abs(E) > 1e-6) r.pis[c.piIndex].cant = Math.round(E * 1000) / 1000; }
      }
      let own = null;
      try { own = JSON.parse(P.get(id)?.CadCraft_Alignment?.RailSettings || 'null'); } catch { own = null; }
      rail = cleanRail(own || { ...railDefaults(pu), base: Math.round(cant.base * 1000) / 1000 }, pu);
      if (!own) notes.push(t('ifc.in.al.rail', { name }));
    }
    out.alignments.push({ name, start, pis: r.pis, pvis: pv.pvis.length >= 2 ? pv.pvis : [], from, notes: [...r.notes, ...pv.notes], design: designOf(id), gid: g.str(g.a(id, 'GlobalId')), ...(rail ? { rail } : {}) });
    used.add(id);
  };

  // ---- IFC 4.3: layouts
  if (f.schemaName === 'IFC4X3') for (const al of f.ofType('IFCALIGNMENT')) {
    const name = g.str(g.a(al, 'Name')) || t('ifc.in.al.name', { n: out.alignments.length + 1 });
    const kids = N.get(al) || [];
    if (!kids.some((x) => g.t(x) === 'IFCALIGNMENTHORIZONTAL')) {   // a child alignment (its own vertical) or an empty one
      if (kids.some((x) => g.t(x) === 'IFCALIGNMENTVERTICAL')) notes.push(t('ifc.in.al.child', { name }));
      continue;
    }
    const segsOf = (layout) => (N.get(layout) || []).map((s) => g.ref(g.a(s, 'DesignParameters'))).filter((x) => x !== null);
    let start = 0;
    for (const r of kids.filter((x) => g.t(x) === 'IFCREFERENT')) {
      const ps = P.get(r)?.Pset_Stationing, d = (() => { const lp = g.ref(g.a(r, 'ObjectPlacement')); const rp = lp !== null ? g.ref(g.a(lp, 'RelativePlacement')) : null; const loc = rp !== null ? g.ref(g.a(rp, 'Location')) : null; return loc !== null ? g.num(g.a(loc, 'DistanceAlong'), null) : null; })();
      if (ps && fin(ps.Station) && (d === null || Math.abs(d) < 1e-9)) { start = ps.Station * k; break; }
    }
    const h = [], v = [];
    let cant = null;
    for (const lay of kids) {
      if (g.t(lay) === 'IFCALIGNMENTHORIZONTAL') for (const dp of segsOf(lay)) {
        const sp = g.point(g.ref(g.a(dp, 'StartPoint'))), [x, y] = toProject(sp[0], sp[1], 0);
        const rr = (a) => { const r = g.num(g.a(dp, a), 0); return r * LEN; };
        h.push({ type: g.enm(g.a(dp, 'PredefinedType')), x, y, dir: g.num(g.a(dp, 'StartDirection'), 0) * g.angleUnit + rot, r0: rr('StartRadiusOfCurvature'), r1: rr('EndRadiusOfCurvature'), len: g.num(g.a(dp, 'SegmentLength'), 0) * LEN });
      }
      if (g.t(lay) === 'IFCALIGNMENTVERTICAL') for (const dp of segsOf(lay)) {
        v.push({ type: g.enm(g.a(dp, 'PredefinedType')), d0: g.num(g.a(dp, 'StartDistAlong'), 0) * LEN, len: g.num(g.a(dp, 'HorizontalLength'), 0) * LEN, z0: (g.num(g.a(dp, 'StartHeight'), 0) * sc + (geo?.height || 0)) * k, g0: g.num(g.a(dp, 'StartGradient'), 0), g1: g.num(g.a(dp, 'EndGradient'), 0) });
      }
      if (g.t(lay) === 'IFCALIGNMENTCANT') {
        // 0.7.1 71.26 / B: the cant layout (rails' heights in the file's unit → mm) and the rail head distance (rail.js base, mm)
        const mm = fileUnit * 1000;
        cant = { base: g.num(g.a(lay, 'RailHeadDistance'), 0) * mm, segs: segsOf(lay).map((dp) => ({ type: g.enm(g.a(dp, 'PredefinedType')), d0: g.num(g.a(dp, 'StartDistAlong'), 0) * LEN, len: g.num(g.a(dp, 'HorizontalLength'), 0) * LEN,
          sl: g.num(g.a(dp, 'StartCantLeft'), 0) * mm, sr: g.num(g.a(dp, 'StartCantRight'), 0) * mm, el: g.num(g.a(dp, 'EndCantLeft'), g.num(g.a(dp, 'StartCantLeft'), 0)) * mm, er: g.num(g.a(dp, 'EndCantRight'), g.num(g.a(dp, 'StartCantRight'), 0)) * mm })) };
      }
    }
    fromSegs(name, h, v, start, 'layout', al, cant);
  }

  // ---- IFC 4x1: IfcAlignmentCurve (read by position: cc-ifc has no 4x1 table)
  if (raw.startsWith('IFC4X1')) for (const al of f.ofType('IFCALIGNMENT')) {
    const pa = f.params(al), name = (typeof pa[2] === 'string' && pa[2]) || t('ifc.in.al.name', { n: out.alignments.length + 1 });
    const curve = g.ref(pa[7]);
    if (curve === null || f.type(curve) !== 'IFCALIGNMENTCURVE') continue;
    const pc = f.params(curve), hz = g.ref(pc[0]), vt = g.ref(pc[1]);
    if (hz === null) continue;
    const ph = f.params(hz), start = (g.num(ph[0], 0) || 0) * k, h = [], v = [];
    for (const segId of g.refs(ph[1])) {
      const geomId = g.ref(f.params(segId)[3]), tp = f.type(geomId), q = f.params(geomId);
      const sp = g.point(g.ref(q[0])), [x, y] = toProject(sp[0], sp[1], 0), dir = g.num(q[1], 0) * g.angleUnit + rot, len = g.num(q[2], 0) * LEN;
      if (tp === 'IFCLINESEGMENT2D') h.push({ type: 'LINE', x, y, dir, r0: 0, r1: 0, len });
      else if (tp === 'IFCCIRCULARARCSEGMENT2D') { const r = g.num(q[3], 0) * LEN * (g.bool(q[4], true) ? 1 : -1); h.push({ type: 'CIRCULARARC', x, y, dir, r0: r, r1: r, len }); }
      else if (tp === 'IFCTRANSITIONCURVESEGMENT2D') {
        const kind = g.enm(q[7]), r0 = q[3] == null ? 0 : g.num(q[3], 0) * LEN * (g.bool(q[5], true) ? 1 : -1), r1 = q[4] == null ? 0 : g.num(q[4], 0) * LEN * (g.bool(q[6], true) ? 1 : -1);
        h.push({ type: kind === 'CLOTHOIDCURVE' ? 'CLOTHOID' : 'OTHER', x, y, dir, r0, r1, len });
      }
    }
    if (vt !== null) for (const segId of g.refs(f.params(vt)[0])) {
      const tp = f.type(segId), q = f.params(segId);
      const d0 = g.num(q[3], 0) * LEN - start, len = g.num(q[4], 0) * LEN, z0 = (g.num(q[5], 0) * sc + (geo?.height || 0)) * k, g0 = g.num(q[6], 0);
      if (tp === 'IFCALIGNMENT2DVERSEGLINE') v.push({ type: 'CONSTANTGRADIENT', d0, len, z0, g0, g1: g0 });
      else { const conv = g.bool(q[8], false), Rv = g.num(q[7], 1) * LEN; v.push({ type: tp === 'IFCALIGNMENT2DVERSEGPARABOLICARC' ? 'PARABOLICARC' : 'CIRCULARARC', d0, len, z0, g0, g1: g0 + (conv ? -1 : 1) * (len / Rv) }); }
    }
    fromSegs(name, h, v, start, 'layout-4x1', al);
  }

  // ---- CivilCraft's own IFC4 / IFC2x3: the PI / PVI tables
  for (const [id, sets] of P) {
    const c = sets.CadCraft_Alignment;
    if (!c || typeof c.PIs !== 'string' || used.has(id) || f.schemaName === 'IFC4X3') continue;
    const num = (s) => s.split(',').map(Number);
    const pis = c.PIs.split(';').filter(Boolean).map((row) => row.split(',')).map(([x, y, r, a, b, tr, ca]) => ({ x: +x * k, y: +y * k, r: (+r || 0) * k, ...(+a ? { ls1: +a * k } : {}), ...(+b ? { ls2: +b * k } : {}), ...(tr && tr !== 'clothoid' ? { tr } : {}), ...(+ca ? { cant: +ca } : {}) }));   // tr, cant: 71.26 / B
    const pvis = (c.PVIs || '').split(';').filter(Boolean).map(num).map(([sta, z, L]) => ({ sta: sta * k, z: z * k, L: (L || 0) * k }));
    if (pis.length < 2 || pis.some((p) => !fin(p.x) || !fin(p.y))) continue;
    let rail = null;
    try { rail = c.RailSettings ? cleanRail(JSON.parse(c.RailSettings), pu) : null; } catch { rail = null; }
    out.alignments.push({ name: g.str(g.a(id, 'Name')) || t('ifc.in.al.name', { n: out.alignments.length + 1 }), start: (fin(c.StartStation) ? c.StartStation : 0) * k, pis, pvis: pvis.length >= 2 ? pvis : [], from: 'pset', notes: [], design: designOf(id), ...(rail ? { rail } : {}) });
    used.add(id);
  }
  out.counts.alignments = out.alignments.length;

  // ---- surfaces and reference elements (geometry through cc-ifc)
  const geom = new Geometry(f);
  // no openings are cut: a terrain keeps every triangle (IFC 4.3 earthworks cuts void the ground they are cut from) and reference
  // elements are for looking at; cutting needs manifold-3d, which CivilCraft does not load
  geom.voids = new Map();
  const skipTypes = new Set(['IFCALIGNMENT', 'IFCALIGNMENTSEGMENT', 'IFCALIGNMENTHORIZONTAL', 'IFCALIGNMENTVERTICAL', 'IFCALIGNMENTCANT', 'IFCREFERENT', 'IFCANNOTATION', 'IFCGRID']);
  let tris = 0, cut = 0;
  for (const pid of geom.products()) {
    const tp = f.type(pid);
    if (used.has(pid) || skipTypes.has(tp) || f.schema.isA(tp, 'IFCSPATIALSTRUCTUREELEMENT') && tp !== 'IFCSITE') continue;
    const name = g.str(g.a(pid, 'Name')) || f.schema.pretty(tp), ot = String(g.str(g.a(pid, 'ObjectType')) || ''), pre = g.enm(g.a(pid, 'PredefinedType'));
    let pieces;
    try { pieces = geom.pieces(pid); } catch { notes.push(t('ifc.in.geom', { name })); continue; }
    const pos = [], idx = [];
    for (const pc of pieces) {
      const m = geom.mesh(pc.geomId), T = pc.matrix;
      if (!m || m.isEmpty) continue;
      const base = pos.length / 3;
      for (let i = 0; i < m.pos.length; i += 3) {
        const x = m.pos[i], y = m.pos[i + 1], z = m.pos[i + 2];
        const w = [T[0] * x + T[4] * y + T[8] * z + T[12], T[1] * x + T[5] * y + T[9] * z + T[13], T[2] * x + T[6] * y + T[10] * z + T[14]];
        pos.push(...toProject(w[0], w[1], w[2]));
      }
      for (const i of m.idx) idx.push(base + i);
    }
    if (!idx.length) continue;
    const terrain = (tp === 'IFCGEOGRAPHICELEMENT' && pre === 'TERRAIN' && !/pad/i.test(ot)) || (tp === 'IFCSITE') || (tp === 'IFCBUILDINGELEMENTPROXY' && /terrain|ground|surface|\btin\b/i.test(ot) && !/pad/i.test(ot));
    if (terrain) {
      // weld the triangles' corners into one point list (a TIN keeps its shape exactly)
      const at = new Map(), pts = [], faces = [];
      const vid = (i) => { const key = pos[i * 3].toFixed(6) + ',' + pos[i * 3 + 1].toFixed(6) + ',' + pos[i * 3 + 2].toFixed(6); let j = at.get(key); if (j === undefined) { j = pts.length; pts.push({ x: pos[i * 3], y: pos[i * 3 + 1], z: pos[i * 3 + 2] }); at.set(key, j); } return j; };
      for (let i = 0; i < idx.length; i += 3) { const a = vid(idx[i]), b = vid(idx[i + 1]), c = vid(idx[i + 2]); if (a !== b && b !== c && a !== c) faces.push([a, b, c]); }
      const kind = /exist/i.test(ot) || /exist|eg\b|ground/i.test(name) ? 'eg' : /design|graded|proposed/i.test(ot + ' ' + name) ? 'design' : 'terrain';
      out.surfaces.push({ id: pid, name, kind, pts, faces });
      continue;
    }
    if (tris + idx.length / 3 > maxRefTriangles) { cut++; continue; }
    tris += idx.length / 3;
    out.refs.push({ id: pid, name, cls: f.schema.pretty(tp), positions: Float64Array.from(pos), indices: Uint32Array.from(idx) });
  }
  if (cut) notes.push(t('ifc.in.refs.cut', { n: cut }));
  out.counts.surfaces = out.surfaces.length; out.counts.refs = out.refs.length; out.counts.triangles = tris;
  for (const [text] of geom.notes) notes.push(text);
  return out;
}

// ---------------------------------------------------------------------------- into the project

export function applyIfcImport(project, r, { eg = -1, refs = true, file = 'file.ifc', label = t('ifc.in.undo') } = {}) {
  const s = project.state, added = [];
  const addAlignments = (st) => {
    for (const a of r.alignments) {
      const id = project.nextId('a');
      st.alignments.push({ id, name: a.name.slice(0, 120), start: a.start, pis: a.pis, pvis: a.pvis, ...(a.design ? { design: a.design } : {}), ...(a.rail ? { rail: a.rail } : {}) });
      added.push(id);
    }
    if (!s.alignments.length && !project.points.length && st.name === t('project.untitled')) st.name = file.replace(/\.[^.]+$/, '').slice(0, 120);
  };
  const surf = eg >= 0 ? r.surfaces[eg] : null;
  if (surf) project.setTin(label, { pts: surf.pts, faces: surf.faces, from: 'ifc' }, (st) => { st.surface.name = surf.name.slice(0, 120); addAlignments(st); });
  else if (r.alignments.length) project.change(label, addAlignments);
  // the rest is shown as reference (outside the undo snapshots: meshes can be large; kept while the project is open)
  const list = [];
  if (refs) {
    r.surfaces.forEach((x, i) => {
      if (i === eg) return;
      const pos = new Float64Array(x.pts.length * 3);
      x.pts.forEach((q, j) => { pos[j * 3] = q.x; pos[j * 3 + 1] = q.y; pos[j * 3 + 2] = q.z; });
      list.push({ id: 'ifc' + x.id, name: x.name, cls: 'surface', positions: pos, indices: Uint32Array.from(x.faces.flat()), file });
    });
    for (const x of r.refs) list.push({ ...x, id: 'ifc' + x.id, file });
  }
  project.ifcRefs = [...(project.ifcRefs || []).filter((x) => x.file !== file), ...list];
  if (list.length) project.touch('change');
  return { alignments: added, eg: !!surf, refs: list.length };
}
