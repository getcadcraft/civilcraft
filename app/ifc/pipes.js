/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its problem texts are English (an app translates what it shows). */
/**
 * pipes.js — the piping in an IFC file as PCF components (0.8 IND.8, session ifc_PART_4). DOM-free, on cc-ifc's IfcFile.
 * Reads IfcPipeSegment, IfcPipeFitting and IfcValve (any schema; names from the published EXPRESS) and returns a model in the shape
 * lib/interop/pcf.js reads and writes, so the host does `writePcf(readPipes(file).model)` or merges the pipelines into what exportPcf made.
 *
 *   readPipes(file) → { model: { format: 'cadcraft-pcf', units: {coords:'MM', bore:'MM', weight:'KGS'}, header: [], problems: [], pipelines: [{ ref, attrs, components }] },
 *                       problems: [{ code, severity, vars, text }], counts: { segments, fittings, valves, skipped } }
 *
 * Where the ends come from: the element's IfcDistributionPorts (IfcRelNests) when it has them (their placements), else, for a segment, the two ends of its
 * extruded body (IfcExtrudedAreaSolid: depth along its direction). A fitting without ports is left out and said so.
 *   2 ports on a BEND                 → ELBOW (90° ± 1°) or BEND, CENTRE-POINT = where the two port axes meet
 *   2 ports, bores differ (TRANSITION) → REDUCER-CONCENTRIC;   2 ports otherwise → COUPLING
 *   3 ports (JUNCTION)                → TEE: the two most nearly opposite ports are the run, the third is BRANCH1-POINT
 *   valve                             → VALVE (SKEY VVFL), 2 ports or extruded body
 * Bores: the body's circle (or hollow circle) profile, else the Pset_PipeSegmentTypeCommon / Pset_PipeFittingTypeCommon NominalDiameter, else 0 (said).
 * Pipelines: the element's IfcSystem / IfcGroup name (IfcRelAssignsToGroup), else one line 'IFC-PIPING'. Everything millimetres.
 */

import { GeoCtx } from './geo-ctx.js';
import { mul, apply, applyDir, sub, add, scale, dot, cross, norm, len } from './geo-math.js';

const ref = (v) => (v && typeof v === 'object' && v.ref !== undefined ? v.ref : null);
const refs = (v) => (Array.isArray(v) ? v.map(ref).filter((x) => x !== null) : []);
const P = (code, severity, vars, text) => ({ code, severity, vars, text });
const enm = (v) => (v && typeof v === 'object' && typeof v.enum === 'string' ? v.enum : null);

export function readPipes(file) {
  const g = new GeoCtx(file);
  const mm = g.lengthUnit * 1000;
  const problems = [];
  const counts = { segments: 0, fittings: 0, valves: 0, skipped: 0 };
  const model = { format: 'cadcraft-pcf', units: { coords: 'MM', bore: 'MM', weight: 'KGS' }, header: [], problems: [], pipelines: [] };
  const want = ['IFCPIPESEGMENT', 'IFCPIPEFITTING', 'IFCVALVE'].filter((t) => file.schema.has(t));
  if (!want.length) { problems.push(P('ifc.pipes.schema', 'note', {}, 'This IFC schema has no piping classes.')); return { model, problems, counts }; }

  // ports by owner, groups by element, nominal diameters by element
  const portsOf = new Map();
  for (const rel of file.ofType('IFCRELNESTS')) {
    const owner = ref(g.a(rel, 'RelatingObject'));
    for (const k of refs(g.a(rel, 'RelatedObjects'))) if (file.type(k) === 'IFCDISTRIBUTIONPORT') (portsOf.get(owner) || portsOf.set(owner, []).get(owner)).push(k);
  }
  for (const rel of file.ofType('IFCRELCONNECTSPORTTOELEMENT')) {   // IFC2x3 / IFC4 way of attaching ports
    const owner = ref(g.a(rel, 'RelatedElement')), port = ref(g.a(rel, 'RelatingPort'));
    if (owner !== null && port !== null) (portsOf.get(owner) || portsOf.set(owner, []).get(owner)).push(port);
  }
  const groupOf = new Map();
  for (const rel of file.ofType('IFCRELASSIGNSTOGROUP')) {
    const grp = ref(g.a(rel, 'RelatingGroup'));
    if (grp === null) continue;
    const nm = g.str(g.a(grp, 'Name'));
    for (const k of refs(g.a(rel, 'RelatedObjects'))) if (nm) groupOf.set(k, nm);
  }
  const nominal = new Map();
  for (const rel of file.ofType('IFCRELDEFINESBYPROPERTIES')) {
    const def = ref(g.a(rel, 'RelatingPropertyDefinition'));
    if (def === null || file.type(def) !== 'IFCPROPERTYSET') continue;
    for (const pid of refs(g.a(def, 'HasProperties'))) {
      if (g.str(g.a(pid, 'Name')) !== 'NominalDiameter') continue;
      const v = g.num(g.a(pid, 'NominalValue'));
      if (v) for (const k of refs(g.a(rel, 'RelatedObjects'))) nominal.set(k, v * mm);
    }
  }

  const portPoint = (pid) => { const m = g.placement(ref(g.a(pid, 'ObjectPlacement'))); return { p: apply(m, 0, 0, 0).map((v) => v * mm), z: norm(applyDir(m, 0, 0, 1)) }; };
  const bodyOf = (id) => {   // { a, b, bore } from the extruded body, or null
    const pds = ref(g.a(id, 'Representation'));
    if (pds === null) return null;
    const M = g.placement(ref(g.a(id, 'ObjectPlacement')));
    for (const sr of refs(g.a(pds, 'Representations'))) {
      for (const item of refs(g.a(sr, 'Items'))) {
        if (file.type(item) !== 'IFCEXTRUDEDAREASOLID') continue;
        const pos = g.axis2(ref(g.a(item, 'Position')));
        const T = mul(M, pos);
        const d = g.dir(ref(g.a(item, 'ExtrudedDirection')), [0, 0, 1]);
        const depth = g.num(g.a(item, 'Depth'), 0);
        const prof = ref(g.a(item, 'SweptArea'));
        const t = prof !== null ? file.type(prof) : null;
        const r = t === 'IFCCIRCLEPROFILEDEF' || t === 'IFCCIRCLEHOLLOWPROFILEDEF' ? g.num(g.a(prof, 'Radius'), 0) : 0;
        return { a: apply(T, 0, 0, 0).map((v) => v * mm), b: apply(T, d[0] * depth, d[1] * depth, d[2] * depth).map((v) => v * mm), bore: 2 * r * mm };
      }
    }
    return null;
  };

  const lines = new Map();
  const put = (id, c) => { const ref_ = groupOf.get(id) || 'IFC-PIPING'; (lines.get(ref_) || lines.set(ref_, []).get(ref_)).push(c); };
  const pt = (p, bore) => ({ x: p[0], y: p[1], z: p[2], bore, end: '' });
  const comp = (type, ends, extra = {}) => ({ type, ends, centre: null, branch: null, at: null, skey: '', angle: null, attrs: [], line: 0, ...extra });
  let noBore = 0;

  for (const cls of want) {
    for (const id of file.ofType(cls, true)) {
      const name = g.str(g.a(id, 'Name')) || '';
      const predef = enm(g.a(id, 'PredefinedType')) || '';
      const ports = (portsOf.get(id) || []).map(portPoint);
      const body = bodyOf(id);
      let bore = body?.bore || nominal.get(id) || 0;
      if (!bore) noBore++;
      const attrs = name ? [['TAG', name]] : [];
      if (cls === 'IFCPIPESEGMENT') {
        let a, b;
        if (body) { a = body.a; b = body.b; } else if (ports.length === 2) { a = ports[0].p; b = ports[1].p; }
        if (!a || len(sub(a, b)) < 0.01) { counts.skipped++; continue; }
        put(id, comp('PIPE', [pt(a, bore), pt(b, bore)], { attrs }));
        counts.segments++;
      } else if (cls === 'IFCVALVE') {
        let a, b;
        if (ports.length === 2) { a = ports[0].p; b = ports[1].p; } else if (body) { a = body.a; b = body.b; }
        if (!a || len(sub(a, b)) < 0.01) { counts.skipped++; continue; }
        put(id, comp('VALVE', [pt(a, bore), pt(b, bore)], { skey: 'VVFL', attrs }));
        counts.valves++;
      } else {   // fitting
        if (ports.length < 2) { counts.skipped++; continue; }
        const mid = scale(ports.reduce((s, q) => add(s, q.p), [0, 0, 0]), 1 / ports.length);
        const out = ports.map((q) => ({ ...q, d: dot(q.z, sub(q.p, mid)) >= 0 ? q.z : scale(q.z, -1) }));   // outward direction, sign-agnostic
        if (ports.length === 2) {
          const [p, q] = out;
          const between = (Math.acos(Math.max(-1, Math.min(1, dot(p.d, q.d)))) * 180) / Math.PI;   // 180° apart = straight
          const turn = +(180 - between).toFixed(2);   // the angle the pipe turns through
          if (predef === 'BEND' || turn > 1) {
            const n = cross(p.d, q.d);
            let centre = mid;
            if (len(n) > 1e-6) {   // lines p.p + s·p.d and q.p + t·q.d meet at the corner
              const w = sub(p.p, q.p), a = dot(p.d, p.d), b = dot(p.d, q.d), c = dot(q.d, q.d), d = dot(p.d, w), e = dot(q.d, w), den = a * c - b * b;
              const s = (b * e - c * d) / den, t = (a * e - b * d) / den;
              centre = scale(add(add(p.p, scale(p.d, s)), add(q.p, scale(q.d, t))), 0.5);
            }
            put(id, comp(Math.abs(turn - 90) < 1 ? 'ELBOW' : 'BEND', [pt(p.p, bore), pt(q.p, bore)], { centre, skey: 'ELBW', angle: turn, attrs }));
          } else if (predef === 'TRANSITION') {
            put(id, comp('REDUCER-CONCENTRIC', [pt(p.p, bore), pt(q.p, bore)], { skey: 'RCBW', attrs }));
          } else put(id, comp('COUPLING', [pt(p.p, bore), pt(q.p, bore)], { attrs }));
        } else if (ports.length === 3) {
          // the run = the pair most nearly opposite (outward directions dot closest to -1); the third is the branch
          let best = null;
          for (const [i, j] of [[0, 1], [0, 2], [1, 2]]) { const dd = dot(out[i].d, out[j].d); if (!best || dd < best.dd) best = { i, j, k: 3 - i - j, dd }; }
          const run = [out[best.i], out[best.j]], br = out[best.k];
          const centre = scale(add(run[0].p, run[1].p), 0.5);
          put(id, comp('TEE', [pt(run[0].p, bore), pt(run[1].p, bore)], { centre, branch: pt(br.p, bore), skey: 'TEBW', attrs }));
        } else { counts.skipped++; continue; }
        counts.fittings++;
      }
    }
  }
  if (noBore) problems.push(P('ifc.pipes.bore', 'warning', { n: noBore }, noBore + ' piping element(s) state no bore (no round body profile and no NominalDiameter); their bore is written as 0.'));
  if (counts.skipped) problems.push(P('ifc.pipes.skipped', 'warning', { n: counts.skipped }, counts.skipped + ' piping element(s) were left out: a fitting needs two or three ports, a segment or valve needs ports or an extruded body with a length.'));
  if (!lines.size) problems.push(P('ifc.pipes.none', 'error', {}, 'The IFC file holds no pipe segments, fittings or valves that could be turned into PCF components.'));
  for (const [refName, components] of lines) model.pipelines.push({ ref: refName, attrs: [], components });
  model.problems = problems;
  return { model, problems, counts };
}
