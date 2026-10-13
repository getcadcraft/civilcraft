/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its notes are English (an app translates what it shows). */
/**
 * geo-profile.js — IFC profiles as 2D outlines (IFC4 ADD2 TC1 §8.15 Profile resource). Parameterized shapes are drawn
 * in their own definition (dimensions, fillet and edge radii as true arcs, flange and leg slopes), centred as the
 * standard places them (bounding-box centre at the origin), then moved by the profile's Position:
 *   rectangle, rounded rectangle, hollow rectangle, circle, hollow circle, ellipse, I (symmetric and asymmetric), L, T,
 *   U, C, Z, trapezium; arbitrary closed (with voids), arbitrary open and centre-line (thickened), composite, derived
 *   (any 2D operator) and mirrored.
 *
 *   profileShapes(g, id) → [{ outer: [[x, y]…], holes: [[[x, y]…]…] }…]  outer counter-clockwise, holes clockwise; [] when
 *                          nothing can be drawn (a note says why). Composite profiles give several shapes.
 */

import { curvePoints, arcSegments, offsetPolyline } from './geo-curve.js';
import { area2, apply } from './geo-math.js';

export function profileShapes(g, id, depth = 0) {
  if (id === null || depth > 16) return [];
  const t = g.t(id);
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  let shapes;
  switch (t) {
    case 'IFCRECTANGLEPROFILEDEF': {
      const x = n('XDim') / 2, y = n('YDim') / 2;
      shapes = [{ outer: [[-x, -y], [x, -y], [x, y], [-x, y]], holes: [] }];
      break;
    }
    case 'IFCROUNDEDRECTANGLEPROFILEDEF': {
      const x = n('XDim') / 2, y = n('YDim') / 2, r = Math.min(n('RoundingRadius'), x, y);
      shapes = [{ outer: rounded([[-x, -y], [x, -y], [x, y], [-x, y]], [r, r, r, r]), holes: [] }];
      break;
    }
    case 'IFCRECTANGLEHOLLOWPROFILEDEF': {
      const x = n('XDim') / 2, y = n('YDim') / 2, w = n('WallThickness');
      const ro = Math.min(n('OuterFilletRadius'), x, y), ri = Math.min(n('InnerFilletRadius'), x - w, y - w);
      const xi = x - w, yi = y - w;
      shapes = [{ outer: rounded([[-x, -y], [x, -y], [x, y], [-x, y]], [ro, ro, ro, ro]), holes: xi > 0 && yi > 0 ? [rounded([[-xi, -yi], [xi, -yi], [xi, yi], [-xi, yi]], [ri, ri, ri, ri]).reverse()] : [] }];
      break;
    }
    case 'IFCCIRCLEPROFILEDEF': shapes = [{ outer: circle(n('Radius')), holes: [] }]; break;
    case 'IFCCIRCLEHOLLOWPROFILEDEF': {
      const r = n('Radius'), w = n('WallThickness');
      shapes = [{ outer: circle(r), holes: r - w > 0 ? [circle(r - w).reverse()] : [] }];
      break;
    }
    case 'IFCELLIPSEPROFILEDEF': shapes = [{ outer: circle(n('SemiAxis1'), n('SemiAxis2')), holes: [] }]; break;
    case 'IFCISHAPEPROFILEDEF': case 'IFCASYMMETRICISHAPEPROFILEDEF': shapes = [{ outer: iShape(g, id, t), holes: [] }]; break;
    case 'IFCLSHAPEPROFILEDEF': shapes = [{ outer: lShape(g, id), holes: [] }]; break;
    case 'IFCTSHAPEPROFILEDEF': shapes = [{ outer: tShape(g, id), holes: [] }]; break;
    case 'IFCUSHAPEPROFILEDEF': shapes = [{ outer: uShape(g, id), holes: [] }]; break;
    case 'IFCCSHAPEPROFILEDEF': shapes = [{ outer: cShape(g, id), holes: [] }]; break;
    case 'IFCZSHAPEPROFILEDEF': shapes = [{ outer: zShape(g, id), holes: [] }]; break;
    case 'IFCTRAPEZIUMPROFILEDEF': {
      const b = n('BottomXDim'), tx = n('TopXDim'), y = n('YDim') / 2, off = n('TopXOffset');
      shapes = [{ outer: [[-b / 2, -y], [b / 2, -y], [-b / 2 + off + tx, y], [-b / 2 + off, y]], holes: [] }];
      break;
    }
    case 'IFCARBITRARYCLOSEDPROFILEDEF': case 'IFCARBITRARYPROFILEDEFWITHVOIDS': {
      const outer = flat(curvePoints(g, g.ref(g.a(id, 'OuterCurve'))));
      const holes = g.refs(g.a(id, 'InnerCurves')).map((c) => flat(curvePoints(g, c))).filter((h) => h.length >= 3);
      shapes = outer.length >= 3 ? [{ outer, holes }] : [];
      if (!shapes.length) g.note('A closed profile has no usable outline');
      break;
    }
    case 'IFCARBITRARYOPENPROFILEDEF': case 'IFCCENTERLINEPROFILEDEF': {
      const pts = flat(curvePoints(g, g.ref(g.a(id, 'Curve'))));
      const th = t === 'IFCCENTERLINEPROFILEDEF' ? n('Thickness') : 0;
      if (th > 0 && pts.length >= 2) shapes = [{ outer: [...offsetPolyline(pts, th / 2).map(xy), ...offsetPolyline(pts, -th / 2).map(xy).reverse()], holes: [] }];
      else { shapes = pts.length >= 2 ? [{ outer: pts, holes: [], open: true }] : []; }
      break;
    }
    case 'IFCCOMPOSITEPROFILEDEF':
      shapes = g.refs(g.a(id, 'Profiles')).flatMap((p) => profileShapes(g, p, depth + 1));
      break;
    case 'IFCDERIVEDPROFILEDEF': case 'IFCMIRROREDPROFILEDEF': {
      const parent = profileShapes(g, g.ref(g.a(id, 'ParentProfile')), depth + 1);
      let m = g.operator(g.ref(g.a(id, 'Operator')));
      if (t === 'IFCMIRROREDPROFILEDEF') m = [-1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
      shapes = parent.map((s) => mapShape(s, m));
      break;
    }
    default:
      if (t) g.note(g.s.pretty(t) + ' profiles are not drawn yet');
      return [];
  }
  const pos = g.ref(g.a(id, 'Position'));
  if (pos !== null && t !== 'IFCDERIVEDPROFILEDEF' && t !== 'IFCMIRROREDPROFILEDEF') shapes = shapes.map((s) => mapShape(s, g.axis2(pos)));
  return shapes.map(orient);
}

const xy = (p) => [p[0], p[1]];

function flat(pts) {
  const out = [];
  for (const p of pts) { const l = out[out.length - 1]; if (!l || Math.abs(l[0] - p[0]) > 1e-12 || Math.abs(l[1] - p[1]) > 1e-12) out.push([p[0], p[1]]); }
  if (out.length > 2) { const a = out[0], b = out[out.length - 1]; if (Math.abs(a[0] - b[0]) < 1e-9 && Math.abs(a[1] - b[1]) < 1e-9) out.pop(); }
  return out;
}

function mapShape(s, m) {
  const f = (r) => r.map((p) => xy(apply(m, p[0], p[1], 0)));
  return { ...s, outer: f(s.outer), holes: s.holes.map(f) };
}

/** Outer counter-clockwise, holes clockwise (a mirror flips them). */
function orient(s) {
  if (s.open) return s;
  const outer = area2(s.outer) < 0 ? s.outer.slice().reverse() : s.outer;
  const holes = s.holes.map((h) => (area2(h) > 0 ? h.slice().reverse() : h));
  return { ...s, outer, holes };
}

function circle(r1, r2 = r1) {
  const n = arcSegments(2 * Math.PI, Math.max(r1, r2));
  const out = [];
  for (let i = 0; i < n; i++) { const a = 2 * Math.PI * i / n; out.push([r1 * Math.cos(a), r2 * Math.sin(a)]); }
  return out;
}

/** Replace each corner i of a closed polygon with an arc of radius r[i] tangent to both edges (0 = sharp). */
export function rounded(pts, r) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < n; i++) {
    const rad = r[i] || 0;
    const p = pts[i];
    if (rad <= 0) { out.push(p); continue; }
    const a = pts[(i + n - 1) % n], b = pts[(i + 1) % n];
    const u = unit([a[0] - p[0], a[1] - p[1]]), v = unit([b[0] - p[0], b[1] - p[1]]);
    const cosT = u[0] * v[0] + u[1] * v[1];
    const half = Math.acos(Math.max(-1, Math.min(1, cosT))) / 2;
    if (half < 1e-6 || Math.abs(half - Math.PI / 2) < 1e-9) { out.push(p); continue; }
    const d = rad / Math.tan(half);
    const la = Math.hypot(a[0] - p[0], a[1] - p[1]), lb = Math.hypot(b[0] - p[0], b[1] - p[1]);
    const dd = Math.min(d, la * 0.999, lb * 0.999);
    const rr = dd * Math.tan(half);
    const s = [p[0] + u[0] * dd, p[1] + u[1] * dd], e = [p[0] + v[0] * dd, p[1] + v[1] * dd];
    const bis = unit([u[0] + v[0], u[1] + v[1]]);
    const c = [p[0] + bis[0] * rr / Math.sin(half), p[1] + bis[1] * rr / Math.sin(half)];
    let a0 = Math.atan2(s[1] - c[1], s[0] - c[0]), a1 = Math.atan2(e[1] - c[1], e[0] - c[0]);
    let sweep = a1 - a0;
    while (sweep > Math.PI) sweep -= 2 * Math.PI;
    while (sweep < -Math.PI) sweep += 2 * Math.PI;
    const k = Math.max(2, arcSegments(Math.abs(sweep), rr));
    for (let j = 0; j <= k; j++) { const t = a0 + sweep * j / k; out.push([c[0] + rr * Math.cos(t), c[1] + rr * Math.sin(t)]); }
  }
  return out;
}

function unit(v) { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; }

/** How far a face sloping at `slope` (radians) rises over a distance. */
const slopeDrop = (slope, dist) => (slope ? Math.tan(slope) * dist : 0);

function iShape(g, id, t) {
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  const asym = t === 'IFCASYMMETRICISHAPEPROFILEDEF';
  const h = n('OverallDepth'), tw = n('WebThickness');
  const bw = asym ? n('BottomFlangeWidth', n('OverallWidth')) : n('OverallWidth');
  const bt = asym ? n('BottomFlangeThickness', n('FlangeThickness')) : n('FlangeThickness');
  const tWid = asym ? n('TopFlangeWidth', bw) : bw;
  const tt = asym ? n('TopFlangeThickness', bt) : bt;
  const rb = asym ? n('BottomFlangeFilletRadius', n('FilletRadius')) : n('FilletRadius');
  const rt = asym ? n('TopFlangeFilletRadius', rb) : rb;
  const eb = asym ? n('BottomFlangeEdgeRadius', n('FlangeEdgeRadius')) : n('FlangeEdgeRadius');
  const et = asym ? n('TopFlangeEdgeRadius', eb) : eb;
  const sb = (asym ? n('BottomFlangeSlope', n('FlangeSlope')) : n('FlangeSlope')) * g.angleUnit;
  const st = (asym ? n('TopFlangeSlope', sb / g.angleUnit) : n('FlangeSlope')) * g.angleUnit;
  const y0 = -h / 2, y1 = h / 2, w = tw / 2, B = bw / 2, T = tWid / 2;
  // flange thickness is measured at the quarter point of the flange's outstand when it slopes (as rolled sections)
  const bIn = (x) => y0 + bt + slopeDrop(sb, (B - w) / 2 - (x - w));
  const tIn = (x) => y1 - tt - slopeDrop(st, (T - w) / 2 - (x - w));
  const pts = [[-B, y0], [B, y0], [B, bIn(B)], [w, bIn(w)], [w, tIn(w)], [T, tIn(T)], [T, y1], [-T, y1], [-T, tIn(T)], [-w, tIn(w)], [-w, bIn(w)], [-B, bIn(B)]];
  const radii = [0, 0, eb, rb, rt, et, 0, 0, et, rt, rb, eb];
  return rounded(pts, radii);
}

function lShape(g, id) {
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  const d = n('Depth'), w = n('Width', d), t = n('Thickness'), r = n('FilletRadius'), e = n('EdgeRadius');
  const slope = n('LegSlope') * g.angleUnit;
  const x0 = -w / 2, y0 = -d / 2;
  const pts = [[x0, y0], [x0 + w, y0], [x0 + w, y0 + t], [x0 + t, y0 + t], [x0 + t, y0 + d], [x0, y0 + d]];
  // a leg slope thickens the legs toward the heel; the thickness is held at the tips
  if (slope) pts[3] = [x0 + t + slopeDrop(slope, d - t), y0 + t + slopeDrop(slope, w - t)];
  return rounded(pts, [0, 0, e, r, e, 0]);
}

function tShape(g, id) {
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  const d = n('Depth'), b = n('FlangeWidth'), tw = n('WebThickness'), tf = n('FlangeThickness');
  const r = n('FilletRadius'), ef = n('FlangeEdgeRadius'), ew = n('WebEdgeRadius');
  const y1 = d / 2, y0 = -d / 2, B = b / 2, w = tw / 2;
  const pts = [[-w, y0], [w, y0], [w, y1 - tf], [B, y1 - tf], [B, y1], [-B, y1], [-B, y1 - tf], [-w, y1 - tf]];
  return rounded(pts, [ew, ew, r, ef, 0, 0, ef, r]);
}

function uShape(g, id) {
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  const d = n('Depth'), b = n('FlangeWidth'), tw = n('WebThickness'), tf = n('FlangeThickness');
  const r = n('FilletRadius'), e = n('EdgeRadius');
  const slope = n('FlangeSlope') * g.angleUnit;
  const x0 = -b / 2, y0 = -d / 2, y1 = d / 2;
  const drop = slopeDrop(slope, (b - tw) / 2);
  const pts = [[x0, y0], [x0 + b, y0], [x0 + b, y0 + tf - drop], [x0 + tw, y0 + tf + drop], [x0 + tw, y1 - tf - drop], [x0 + b, y1 - tf + drop], [x0 + b, y1], [x0, y1]];
  return rounded(pts, [0, 0, e, r, r, e, 0, 0]);
}

function cShape(g, id) {
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  const d = n('Depth'), b = n('Width'), t = n('WallThickness'), lip = n('Girth'), r = n('InternalFilletRadius');
  const x0 = -b / 2, y0 = -d / 2, x1 = b / 2, y1 = d / 2;
  const ro = r ? r + t : 0;
  const pts = lip > t
    ? [[x0, y0], [x1, y0], [x1, y0 + lip], [x1 - t, y0 + lip], [x1 - t, y0 + t], [x0 + t, y0 + t], [x0 + t, y1 - t], [x1 - t, y1 - t], [x1 - t, y1 - lip], [x1, y1 - lip], [x1, y1], [x0, y1]]
    : [[x0, y0], [x1, y0], [x1, y0 + t], [x0 + t, y0 + t], [x0 + t, y1 - t], [x1, y1 - t], [x1, y1], [x0, y1]];
  const radii = lip > t ? [ro, ro, 0, 0, r, r, r, r, 0, 0, ro, ro] : [ro, 0, 0, r, r, 0, 0, ro];
  return rounded(pts, radii);
}

function zShape(g, id) {
  const n = (name, d = 0) => g.num(g.a(id, name), d);
  const d = n('Depth'), b = n('FlangeWidth'), tw = n('WebThickness'), tf = n('FlangeThickness');
  const r = n('FilletRadius'), e = n('EdgeRadius');
  const w = tw / 2, y0 = -d / 2, y1 = d / 2;
  const pts = [[-w, y0], [b - w, y0], [b - w, y0 + tf], [w, y0 + tf], [w, y1], [-b + w, y1], [-b + w, y1 - tf], [-w, y1 - tf]];
  return rounded(pts, [0, 0, e, r, 0, 0, e, r]);
}
