/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-civil-align.js: ifc-civil.js's 5 bindings for this topic, moved out of writeCivilIfc() unchanged (0.11 PERF.78 per-feature writers, perf-finish-11 r2 civil-detail; output byte-identical).
 * writeIfcAlignments(ctx) is called once by writeCivilIfc(); ctx carries what the closure shared with this code: values by name, and
 * accessors for the variables writeCivilIfc() assigns (read and written as ctx.<name>, exactly as the closure's own variable was).
 */
import { stepList as L, stepString as S } from './ifc/step.js';

export function writeIfcAlignments(ctx) {
  const { w, units, X4, lx, ly, lz, um, counts, root, O2, X2D, ax2d0, cAxis, cFoot, pset, place, shape, element, site, projectKids, contain, model, parabolaLength } = ctx;

  const put = (container, el) => { if (!contain.has(container)) contain.set(container, []); contain.get(container).push(el); };

  // 0.7.1 71.24: an alignment's design speed (with its unit, and in m/s for IFC's IfcLinearVelocityMeasure) and class
  const MPS = { 'km/h': 1 / 3.6, mph: 0.44704 };
  const designProps = (d) => (d ? [['DesignSpeed', ctx.fin(d.speed) ? d.speed + ' ' + d.unit : null, 'label'], ['DesignSpeedValue', ctx.fin(d.speed) ? d.speed : null, 'real'], ['DesignSpeedUnit', ctx.fin(d.speed) ? d.unit : null, 'label'], ['DesignClass', d.cls || null, 'label']] : []);

  /**
   * 0.7.1 71.26 / B: IfcAlignmentCant — rail.js cantPlan's segments (each rail's height over the profile, left / right looking up-station;
   * RailHeadDistance = rail.js baseOf, the rail-centre distance) with the zero-length end, Pset_AlignmentCantSegmentCommon on a curve's constant
   * cant (equilibrium and deficiency), and its geometry: an IfcSegmentedReferenceCurve over the gradient curve, the segments mapped as
   * IfcOpenShell (the reference implementation) maps them — the curve's ordinate is the mean height of the two rails, its parent curve the
   * cant's own shape (IfcLine, IfcClothoid for the linear ramp, the Bloss / Helmert / cosine / sine spirals), the placement's Axis leaning by the
   * rails' difference over the rail head distance.
   */
  function cantLayout(a, tag, grad, layouts) {
    const C = a.cant, mmU = (v) => v / 1000 / um, base = mmU(C.base), segs = [], curve = [];
    const axis = (half) => { const dy = 2 * half, dz = Math.sqrt(Math.max(0, base * base - dy * dy)); return w.dir([0, dy / base, dz / base]); };
    const lineP = () => w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) });
    const P2 = (x, y) => w.ent('IfcAxis2Placement2D', { Location: w.pt([x, y]), RefDirection: X2D });
    const smooth = (q) => q && q.type !== 'LINEARTRANSITION';   // zero slope at both ends (constant, Bloss, Helmert, cosine, sine)
    C.segments.forEach((q, i) => {
      const nx = C.segments[i + 1], d0 = q.start - a.start, Lh = q.length;
      const sl = mmU(q.startLeft), sr = mmU(q.startRight), el = mmU(q.endLeft), er = mmU(q.endRight);
      const Ds = (sl + sr) / 2, De = (el + er) / 2, f = De - Ds, half = (sr - sl) / 2;
      const T = (a2, n, p) => (a2 ? ctx.R(Lh ** p * Math.abs(a2) ** (-1 / n) * Math.sign(a2), 9) : null);
      // (codes as IfcOpenShell works them out on the 3D curve: smooth cant ends meet with the same curvature)
      const trans = !nx ? (smooth(q) ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.') : smooth(q) && smooth(nx) ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTINUOUS.';
      const seg = (start, len, parent, at, dir = 0) => curve.push(w.ent('IfcCurveSegment', { Transition: trans, Placement: w.ent('IfcAxis2Placement3D', { Location: w.pt(at), Axis: axis(half), RefDirection: w.dir([Math.cos(dir), Math.sin(dir), 0]) }),
        SegmentStart: 'IFCLENGTHMEASURE(' + ctx.R(start) + ')', SegmentLength: 'IFCLENGTHMEASURE(' + ctx.R(len) + ')', ParentCurve: parent }));
      if (q.type === 'CONSTANTCANT' || !f) seg(0, Lh, lineP(), [d0, Ds, 0]);
      else if (q.type === 'LINEARTRANSITION') { const A1 = Lh ** 1.5 * Math.abs(f) ** -0.5 * Math.sign(f); seg(0, Lh, w.ent('IfcClothoid', { Position: P2(0, 0), ClothoidConstant: ctx.R(A1, 9) }), [d0, Ds, 0], Math.atan((A1 * Lh * Lh) / Math.abs(A1 ** 3))); }
      else if (q.type === 'BLOSSCURVE') seg(0, Lh, w.ent('IfcThirdOrderPolynomialSpiral', { Position: P2(0, 0), CubicTerm: T(-2 * f, 4, 5 / 4), QuadraticTerm: T(3 * f, 3, 4 / 3), ConstantTerm: T(Ds, 1, 2) }), [d0, Ds, 0]);
      else if (q.type === 'COSINECURVE') seg(0, Lh, w.ent('IfcCosineSpiral', { Position: P2(0, 0), CosineTerm: T(-0.5 * f, 1, 2), ConstantTerm: T(Ds + 0.5 * f, 1, 2) }), [d0, Ds, 0]);
      else if (q.type === 'SINECURVE') seg(0, Lh, w.ent('IfcSineSpiral', { Position: P2(0, 0), SineTerm: T(-f / (2 * Math.PI), 1, 2), LinearTerm: T(f, 2, 1.5), ConstantTerm: T(Ds, 1, 2) }), [d0, Ds, 0]);
      else if (q.type === 'HELMERTCURVE') {
        // IfcOpenShell's Helmert cant works on the SUM of the rails' heights (its halves start at sum / 2)
        const Ss = sl + sr, Se = el + er, F2 = Se - Ss, A2a = T(4 * F2, 3, 4 / 3);
        seg(0, Lh / 2, w.ent('IfcSecondOrderPolynomialSpiral', { Position: P2(0, 0), QuadraticTerm: A2a, ConstantTerm: T(2 * Ss, 1, 2) }), [d0, Ss / 2, 0]);
        const slope = (Lh / 2) ** 2 * ((2 * (Lh / 2)) / (+A2a) ** 3);
        seg(Lh / 2, Lh / 2, w.ent('IfcSecondOrderPolynomialSpiral', { Position: P2(0, 0), QuadraticTerm: T(-4 * F2, 3, 4 / 3), LinearTerm: T(8 * F2, 2, 1.5), ConstantTerm: T(-2 * F2 + 2 * Ss, 1, 2) }), [d0 + Lh / 2, Ss / 2 + F2 / 4, 0], Math.atan(slope));
      } else seg(0, Lh, lineP(), [d0, Ds, 0]);
      const dp = w.ent('IfcAlignmentCantSegment', { StartDistAlong: ctx.R(d0), HorizontalLength: ctx.R(Lh), StartCantLeft: ctx.R(sl), EndCantLeft: ctx.R(el), StartCantRight: ctx.R(sr), EndCantRight: ctx.R(er), PredefinedType: ctx.E(q.type) });
      const sgEl = root('IfcAlignmentSegment', tag + '|c|' + i, { DesignParameters: dp });
      segs.push(sgEl);
      counts.segments++;
      const mid = q.start + Lh / 2, cv = q.type === 'CONSTANTCANT' && (q.startCant || 0) !== 0 ? C.curves.find((k) => k.sc <= mid && mid <= k.cs) : null;
      if (cv) pset([sgEl], 'Pset_AlignmentCantSegmentCommon', [['CantEquilibrium', ctx.fin(cv.eq) ? mmU(cv.eq) : null, 'len'], ['CantDeficiency', ctx.fin(cv.deficiency) ? mmU(cv.deficiency) : null, 'len']], tag + '|c|' + i);
    });
    const last = C.segments[C.segments.length - 1], dE = last.start + last.length - a.start, l2 = mmU(last.endLeft), r2 = mmU(last.endRight);
    segs.push(root('IfcAlignmentSegment', tag + '|c|end', { DesignParameters: w.ent('IfcAlignmentCantSegment', { StartDistAlong: ctx.R(dE), HorizontalLength: '0.', StartCantLeft: ctx.R(l2), EndCantLeft: ctx.R(l2), StartCantRight: ctx.R(r2), EndCantRight: ctx.R(r2), PredefinedType: '.CONSTANTCANT.' }) }));
    curve.push(w.ent('IfcCurveSegment', { Transition: '.DISCONTINUOUS.', Placement: w.ent('IfcAxis2Placement3D', { Location: w.pt([dE, (l2 + r2) / 2, 0]), Axis: axis((r2 - l2) / 2), RefDirection: w.dir([1, 0, 0]) }), SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(0.)', ParentCurve: lineP() }));
    const cantEl = root('IfcAlignmentCant', tag + '|cant', { RailHeadDistance: ctx.R(base) });
    root('IfcRelNests', tag + '|nest-c', { RelatingObject: cantEl, RelatedObjects: L(segs) });
    layouts.push(cantEl);
    return w.ent('IfcSegmentedReferenceCurve', { Segments: L(curve), SelfIntersect: '.F.', BaseCurve: grad });
  }

  // ---- alignments
  const alOut = new Map();   // alignment id → { el (IfcAlignment / its stand-in), curve (basis curve, 4.3) }
  for (const a of model.alignments) {
    const tag = 'al|' + a.id;
    counts.alignments++;
    // i18n-ignore: IFC file data (pset values)
    const props = [['StartStation', a.start, 'len'], ['EndStation', a.end, 'len'], ['Length', a.length, 'len'], ['ProjectUnits', units === 'm' ? 'metre' : 'US survey foot', 'label'],
      ['PIs', a.pis.map((p) => [...[p.x, p.y, p.r || 0, p.ls1 || p.ls || 0, p.ls2 || p.ls || 0].map((v) => +(+v).toFixed(6)), ...(p.tr || p.cant ? [p.tr || '', +(+(p.cant || 0)).toFixed(3)] : [])].join(',')).join(';'), 'text'],   // + transition kind and cant (mm): 71.26 / B
      ['PVIs', a.pvis.map((p) => [p.sta, p.z, p.L || 0].map((v) => +(+v).toFixed(6)).join(',')).join(';'), 'text'],
      ['CurveCount', a.h.filter((s) => s.type !== 'LINE').length, 'int'], ...designProps(a.design), ['RailSettings', a.rail ? JSON.stringify(a.rail) : null, 'text']];
    if (!X4) {
      // IFC4 / IFC2x3: an element with the 3D centreline as a polyline (and the PI / PVI tables in its pset)
      const p3 = a.poly.filter((q) => ctx.fin(q.z)), reps = [];
      if (p3.length >= 2) reps.push([cAxis, 'Axis', 'Curve3D', [w.ent('IfcPolyline', { Points: L(p3.map((q) => w.pt([lx(q.x), ly(q.y), lz(q.z)]))) })]]);
      reps.push([cFoot, 'FootPrint', 'Curve2D', [w.ent('IfcPolyline', { Points: L(a.poly.map((q) => w.pt([lx(q.x), ly(q.y)]))) })]]);
      if (p3.length < 2) reps.push([cAxis, 'Axis', 'Curve2D', [w.ent('IfcPolyline', { Points: L(a.poly.map((q) => w.pt([lx(q.x), ly(q.y)]))) })]]);
      const el = element({ cls: 'IfcAlignment', name: a.name, label: 'Alignment', tag, rep: shape(reps) });   // i18n-ignore: IFC file data
      put(site, el);
      if (a.superEvents.length) props.push(['Superelevation', a.superEvents.map((e) => [e.sta, -e.L, -e.R].map((v) => +v.toFixed(6)).join(',')).join(';'), 'text']);
      pset([el], 'CadCraft_Alignment', props, tag);
      alOut.set(a.id, { el });
      continue;
    }
    // ---- IFC 4.3: the layouts (business logic) and their geometry
    // horizontal
    const hSegs = [], curveSegs = [], H = a.h;
    const curv = (r) => (r ? 1 / r : 0);
    const endOf = () => { const q = a.poly[a.poly.length - 1]; const e = a.al.pointAt(a.end); return { x: q.x, y: q.y, dir: e.dir }; };
    H.forEach((s, i) => {
      const nx = H[i + 1];
      const dirEnd = ctx.fin(s.dir1) ? s.dir1 : s.type === 'LINE' ? s.dir : s.type === 'CIRCULARARC' ? s.dir + s.len / s.r0 : s.dir + (s.len * (curv(s.r0) + curv(s.r1))) / 2;
      // the cubic parabola's true curvature at its curve end is not exactly 1/R (y'' / (1 + y'²)^1.5): never "same curvature" there
      const kEnd = s.kind === 'cubic' && s.r1 ? NaN : curv(s.r1), kNext = nx?.kind === 'cubic' && nx.r0 ? NaN : curv(nx?.r0 || 0);
      const sameDir = (d1, d2) => Math.abs(Math.atan2(Math.sin(d1 - d2), Math.cos(d1 - d2))) < 1e-7;
      let trans;
      if (!nx) trans = Math.abs(kEnd) < 1e-12 ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.';
      else if (!sameDir(dirEnd, nx.dir)) trans = '.CONTINUOUS.';
      else trans = Math.abs(kEnd - kNext) < 1e-9 ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.';
      const plc = w.ent('IfcAxis2Placement2D', { Location: w.pt([lx(s.x), ly(s.y)]), RefDirection: w.dir([Math.cos(s.dir), Math.sin(s.dir)]) });
      let parent, start = 0, len = s.len;
      // 0.7.1 71.26 / B: rail transitions. Their parents follow IFC 4.3's spiral definitions as IfcOpenShell (the reference
      // implementation) maps them: the curvature over u = s / L is κ·L = a0 + Σ aᵢ·uⁱ (a0 = L/R0, f = L/R1 − L/R0), each term written
      // as Aᵢ = L·|aᵢ|^(−1/(i+1))·sign aᵢ (cosine and sine terms: L / a) — Bloss 3f u² − 2f u³ (third order), Helmert 2f u² then
      // −f + 4f u − 2f u² (two second-order halves), the sine half-wave ½f − ½f cos πu (IfcCosineSpiral), the sine
      // f u − f/2π · sin 2πu (IfcSineSpiral). Each is symmetric, so a spiral out of a curve is the same formula with f < 0.
      const term = (a, n) => (a ? ctx.R(s.len * Math.abs(a) ** (-1 / n) * Math.sign(a), 9) : null);
      const fK = s.len * curv(s.r1) - s.len * curv(s.r0), a0 = s.len * curv(s.r0);
      const extra = [];   // Helmert: its second half
      if (s.type === 'LINE') parent = w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) });
      else if (s.type === 'CIRCULARARC') { parent = w.ent('IfcCircle', { Position: ax2d0, Radius: ctx.R(Math.abs(s.r0)) }); len = s.len * Math.sign(s.r0); }
      else if (s.type === 'CUBIC') {
        // the cubic parabola y = x³ / (6·R·Lp), Lp along the tangent (CivilCraft's as typed); the segment runs `len` ALONG the curve
        // (IfcOpenShell's kernel reads a polynomial segment's length as arc length), a spiral out of a curve from −len to 0
        const A3 = s.r1 ? 1 / (6 * s.r1 * s.Lp) : -1 / (6 * s.r0 * s.Lp);
        parent = w.ent('IfcPolynomialCurve', { Position: ax2d0, CoefficientsX: L(['0.', '1.']), CoefficientsY: L(['0.', '0.', '0.', ctx.R(A3, 15)]) });
        start = s.r1 ? 0 : -s.len;
      } else if (s.type === 'BLOSSCURVE') parent = w.ent('IfcThirdOrderPolynomialSpiral', { Position: ax2d0, CubicTerm: term(-2 * fK, 4), QuadraticTerm: term(3 * fK, 3), ConstantTerm: term(a0, 1) });
      else if (s.type === 'COSINECURVE') parent = w.ent('IfcCosineSpiral', { Position: ax2d0, CosineTerm: term(-0.5 * fK, 1), ConstantTerm: term(0.5 * fK + a0, 1) });
      else if (s.type === 'SINECURVE') parent = w.ent('IfcSineSpiral', { Position: ax2d0, SineTerm: term(-fK / (2 * Math.PI), 1), LinearTerm: term(fK, 2), ConstantTerm: term(a0, 1) });
      else if (s.type === 'HELMERTCURVE') {
        parent = w.ent('IfcSecondOrderPolynomialSpiral', { Position: ax2d0, QuadraticTerm: term(2 * fK, 3), ConstantTerm: term(a0, 1) });
        len = s.len / 2;
        const mid = a.al.pointAt(s.sta + s.len / 2);
        extra.push(w.ent('IfcCurveSegment', { Transition: trans, Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([lx(mid.x), ly(mid.y)]), RefDirection: w.dir([Math.cos(mid.dir), Math.sin(mid.dir)]) }),
          SegmentStart: 'IFCLENGTHMEASURE(' + ctx.R(s.len / 2) + ')', SegmentLength: 'IFCLENGTHMEASURE(' + ctx.R(s.len / 2) + ')',
          ParentCurve: w.ent('IfcSecondOrderPolynomialSpiral', { Position: ax2d0, QuadraticTerm: term(-2 * fK, 3), LinearTerm: term(4 * fK, 2), ConstantTerm: term(a0 - fK, 1) }) }));
      } else {
        // the clothoid (ifcopenshell's mapping): A = L / √|f| · sign f; a spiral out of a curve runs −L … 0
        const A = (s.len / Math.sqrt(Math.abs(fK))) * Math.sign(fK);
        parent = w.ent('IfcClothoid', { Position: ax2d0, ClothoidConstant: ctx.R(A, 9) });
        start = s.cs ? (curv(s.r0) * s.len * s.len) / fK : s.r1 === 0 ? -s.len : 0;   // 0.11 SU.1944: a spiral between two curves starts where the Euler spiral's curvature is its start's
      }
      curveSegs.push(w.ent('IfcCurveSegment', { Transition: extra.length ? '.CONTSAMEGRADIENTSAMECURVATURE.' : trans, Placement: plc, SegmentStart: 'IFCLENGTHMEASURE(' + ctx.R(start) + ')', SegmentLength: 'IFCLENGTHMEASURE(' + ctx.R(len) + ')', ParentCurve: parent }));
      curveSegs.push(...extra);   // Helmert's second half after its first
      const dp = w.ent('IfcAlignmentHorizontalSegment', { StartPoint: w.pt([lx(s.x), ly(s.y)]), StartDirection: ctx.R(Math.atan2(Math.sin(s.dir), Math.cos(s.dir)), 12), StartRadiusOfCurvature: ctx.R(s.r0), EndRadiusOfCurvature: ctx.R(s.r1), SegmentLength: ctx.R(s.len), PredefinedType: ctx.E(s.type) });
      hSegs.push(root('IfcAlignmentSegment', tag + '|h|' + i, { DesignParameters: dp }));
      counts.segments++;
    });
    const end = endOf();
    hSegs.push(root('IfcAlignmentSegment', tag + '|h|end', { DesignParameters: w.ent('IfcAlignmentHorizontalSegment', { StartPoint: w.pt([lx(end.x), ly(end.y)]), StartDirection: ctx.R(Math.atan2(Math.sin(end.dir), Math.cos(end.dir)), 12), StartRadiusOfCurvature: '0.', EndRadiusOfCurvature: '0.', SegmentLength: '0.', PredefinedType: '.LINE.' }) }));
    curveSegs.push(w.ent('IfcCurveSegment', { Transition: '.DISCONTINUOUS.', Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([lx(end.x), ly(end.y)]), RefDirection: w.dir([Math.cos(end.dir), Math.sin(end.dir)]) }), SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(0.)', ParentCurve: w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) }) }));
    const comp = w.ent('IfcCompositeCurve', { Segments: L(curveSegs), SelfIntersect: '.F.' });
    const horiz = root('IfcAlignmentHorizontal', tag + '|h', {});
    root('IfcRelNests', tag + '|nest-h', { RelatingObject: horiz, RelatedObjects: L(hSegs) });
    const layouts = [horiz], reps = [];
    // vertical
    if (a.v?.length) {
      const vSegs = [], vCurve = [], V = a.v;
      V.forEach((s, i) => {
        const nx = V[i + 1], d0 = s.sta - a.start;
        const flat = (q) => !q || q.type === 'CONSTANTGRADIENT';   // curvature 0 (the zero-length end segment too)
        const trans = nx && Math.abs(s.g1 - nx.g0) >= 1e-9 ? '.CONTINUOUS.' : flat(s) && flat(nx) ? '.CONTSAMEGRADIENTSAMECURVATURE.' : '.CONTSAMEGRADIENT.';
        const th = Math.atan(s.g0), plc = w.ent('IfcAxis2Placement2D', { Location: w.pt([d0, s.z0]), RefDirection: w.dir([Math.cos(th), Math.sin(th)]) });
        let parent, len;
        if (s.type === 'CONSTANTGRADIENT') { parent = w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) }); len = s.len / Math.cos(th); }
        else { const C = (s.g1 - s.g0) / (2 * s.len); parent = w.ent('IfcPolynomialCurve', { Position: ax2d0, CoefficientsX: L(['0.', '1.']), CoefficientsY: L([ctx.R(s.z0), ctx.R(s.g0, 12), ctx.R(C, 15)]) }); len = parabolaLength(s.g0, C, s.len); }
        vCurve.push(w.ent('IfcCurveSegment', { Transition: trans, Placement: plc, SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(' + ctx.R(len) + ')', ParentCurve: parent }));
        vSegs.push(root('IfcAlignmentSegment', tag + '|v|' + i, { DesignParameters: w.ent('IfcAlignmentVerticalSegment', { StartDistAlong: ctx.R(d0), HorizontalLength: ctx.R(s.len), StartHeight: ctx.R(s.z0), StartGradient: ctx.R(s.g0, 12), EndGradient: ctx.R(s.g1, 12), PredefinedType: ctx.E(s.type) }) }));
        counts.segments++;
      });
      const last = V[V.length - 1], dEnd = last.sta + last.len - a.start, zEnd = last.z0 + (last.g0 + last.g1) / 2 * last.len;
      vSegs.push(root('IfcAlignmentSegment', tag + '|v|end', { DesignParameters: w.ent('IfcAlignmentVerticalSegment', { StartDistAlong: ctx.R(dEnd), HorizontalLength: '0.', StartHeight: ctx.R(zEnd), StartGradient: ctx.R(last.g1, 12), EndGradient: ctx.R(last.g1, 12), PredefinedType: '.CONSTANTGRADIENT.' }) }));
      const thE = Math.atan(last.g1);
      vCurve.push(w.ent('IfcCurveSegment', { Transition: '.DISCONTINUOUS.', Placement: w.ent('IfcAxis2Placement2D', { Location: w.pt([dEnd, zEnd]), RefDirection: w.dir([Math.cos(thE), Math.sin(thE)]) }), SegmentStart: 'IFCLENGTHMEASURE(0.)', SegmentLength: 'IFCLENGTHMEASURE(0.)', ParentCurve: w.one('IfcLine', { Pnt: O2, Dir: w.one('IfcVector', { Orientation: X2D, Magnitude: '1.' }) }) }));
      const vert = root('IfcAlignmentVertical', tag + '|v', {});
      root('IfcRelNests', tag + '|nest-v', { RelatingObject: vert, RelatedObjects: L(vSegs) });
      layouts.push(vert);
      const grad = w.ent('IfcGradientCurve', { Segments: L(vCurve), SelfIntersect: '.F.', BaseCurve: comp });
      const cantCurve = a.cant && X4 ? cantLayout(a, tag, grad, layouts) : null;   // 0.7.1 71.26 / B: a railway's cant
      reps.push([cFoot, 'FootPrint', 'Curve2D', [comp]], [cAxis, 'Axis', 'Curve3D', [cantCurve || grad]]);
    } else reps.push([cAxis, 'Axis', 'Curve2D', [comp]]);
    const alEl = root('IfcAlignment', tag, { Name: S(a.name), ObjectPlacement: place(null), Representation: shape(reps), PredefinedType: '.NOTDEFINED.' });
    projectKids.push(alEl);
    root('IfcRelNests', tag + '|nest', { RelatingObject: alEl, RelatedObjects: L(layouts) });
    // referents: the start station, then the superelevation events (each side)
    const refs = [], at = (d) => w.ent('IfcLinearPlacement', { RelativePlacement: w.ent('IfcAxis2PlacementLinear', { Location: w.ent('IfcPointByDistanceExpression', { DistanceAlong: 'IFCLENGTHMEASURE(' + ctx.R(d) + ')', BasisCurve: comp }) }),
      CartesianPosition: (() => { const p = a.al.pointAt(a.start + d), z = a.prof?.ok ? a.prof.elevationAt(a.start + d) : null; return w.ent('IfcAxis2Placement3D', { Location: w.pt([lx(p.x), ly(p.y), ctx.fin(z) ? lz(z) : 0]), RefDirection: w.dir([Math.cos(p.dir), Math.sin(p.dir), 0]), Axis: w.dir([0, 0, 1]) }); })() });
    const st = root('IfcReferent', tag + '|sta', { Name: S(String(+a.start.toFixed(3))), ObjectPlacement: at(0), PredefinedType: '.STATION.' });
    pset([st], 'Pset_Stationing', [['Station', a.start, 'len']], tag + '|sta');
    refs.push(st); counts.referents++;
    a.superEvents.forEach((e, k) => {
      for (const [side, v] of [['LEFT', e.L], ['RIGHT', e.R]]) {
        const r = root('IfcReferent', tag + '|se|' + k + side, { Name: S(side + ' ' + (+e.sta.toFixed(3))), ObjectPlacement: at(e.sta - a.start), PredefinedType: '.SUPERELEVATIONEVENT.' });
        // Superelevation: the lane's cross slope, + rising away from the centreline (a normal crown is −2 %)
        pset([r], 'Pset_Superelevation', [['Side', side, 'label'], ['Superelevation', -v, 'ratio'], ['TransitionSuperelevation', 'LINEAR', 'label']], tag + '|se|' + k + side);   // i18n-ignore: IFC enumerated words
        refs.push(r); counts.referents++;
      }
    });
    root('IfcRelNests', tag + '|nest-ref', { RelatingObject: alEl, RelatedObjects: L(refs) });
    pset([alEl], 'CadCraft_Alignment', props, tag);
    alOut.set(a.id, { el: alEl, curve: comp });
  }

  return { put, MPS, designProps, alOut };
}
