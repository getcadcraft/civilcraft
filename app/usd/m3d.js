/* SPDX-License-Identifier: Apache-2.0 */
/**
 * m3d.js — a model of ModelCraft's kernel (the `m3d` copies in CadCraft and the other 3D apps) written by the conventions
 * (docs/USD-CONVENTIONS.md §§ 5, 9). Duck-typed on the kernel's data, so it imports no app code: definitions
 * {id, kind, name, verts Map<id, [x,y,z]>, edges Map<id, {a, b}>, faces Map<id, {loops, color}>, insts Map<id, {def, m, name,
 * hidden, color, tag}>, mesh?} in `model.defs` (a Map with 'root'). DOM-free.
 *
 *   writeM3d(builder, model, { faceTris(def, face) → [[v, v, v]…], edgeFaces(def) → Map<edgeId, faces[]>,
 *            matOf(paint) → material path | null, onDef(prim, defId), onInst(prim, inst, id), onGeometry(prim, defId),
 *            proto(defId) → bool (written once under /Prototypes), kindOf(depth), allDefs (also definitions nothing places) })
 *   → { objects, defs, prototypes }
 *
 * The root definition's contents go under the builder's root (/World); a definition placed more than once (or `proto` says
 * so) becomes a prototype under the class `/Prototypes`, placed by instanceable references; the others are written in place.
 * A definition's own faces are one Mesh named `Geometry` (polygons as they are, faces with holes triangulated, one
 * GeomSubset per paint), its loose edges one linear BasisCurves `Edges`; an MD.1 mesh (`def.mesh`, its `toArrays()`) is a
 * Mesh with corner normals, UV sets and colours as primvars.
 */
import { V } from './sdf.js';

export function writeM3d(b, model, opts = {}) {
  const { faceTris, edgeFaces = null, matOf = () => null, onDef = () => {}, onInst = () => {}, onGeometry = () => {} } = opts;
  const report = { objects: 0, defs: 0, prototypes: 0 };
  const L = b.layer;
  const uses = new Map();
  for (const d of model.defs.values()) for (const i of d.insts.values()) uses.set(i.def, (uses.get(i.def) || 0) + 1);
  const isProto = opts.proto || ((id) => (uses.get(id) || 0) > 1 || model.defs.get(id)?.kind === 'component');
  const kindOf = opts.kindOf || ((depth) => (depth === 0 ? 'component' : 'subcomponent'));
  let protoRoot = null;
  const protoPath = new Map();
  const protoFor = (id) => {
    if (protoPath.has(id)) return protoPath.get(id);
    if (!protoRoot) protoRoot = L.addPrim('/', 'Prototypes', { specifier: 'class' });
    const d = model.defs.get(id);
    const p = b.prim(protoRoot, d.name || id, 'Xform', { displayName: d.name || id });
    protoPath.set(id, p);
    report.prototypes++;
    writeDef(p, id, 1);
    return p;
  };
  const visited = new Set();
  const writeDef = (p, id, depth) => {
    const def = model.defs.get(id);
    if (!def) return;
    visited.add(id);
    report.defs++;
    onDef(p, id);
    writeGeometry(p, def);
    for (const [iid, inst] of def.insts) {
      const target = model.defs.get(inst.def);
      if (!target) continue;
      const nm = inst.name || target.name || inst.def;
      const o = { matrix: inst.m, visible: !inst.hidden, kind: kindOf(depth), displayName: nm };
      let ip;
      if (isProto(inst.def)) ip = b.group(p, nm, { ...o, instanceable: true, references: [protoFor(inst.def)] });
      else { ip = b.group(p, nm, o); writeDef(ip, inst.def, depth + 1); }
      if (inst.tag) b.attr(ip, 'cadcraft:tag', 'token', inst.tag, { custom: true, uniform: true });
      if (inst.color) { const m = matOf(inst.color); if (m) b.bind(ip, m); }
      onInst(ip, inst, iid);
      report.objects++;
    }
  };
  const subsetsOf = (byPaint, nf) => {
    const subsets = [...byPaint].map(([paint, faces], k) => ({ name: 'paint_' + (k + 1), faces, material: matOf(paint) })).filter((s) => s.material);
    const whole = subsets.length === 1 && subsets[0].faces.length === nf;
    return whole ? { material: subsets[0].material, subsets: [] } : { material: null, subsets };
  };
  const writeGeometry = (p, def) => {
    if (def.mesh && typeof def.mesh.toArrays === 'function') return writeMesh(p, def);
    if (!def.verts || !def.verts.size) return;
    const vids = [...def.verts.keys()];
    const ix = new Map(vids.map((v, i) => [v, i]));
    const pts = new Float32Array(vids.length * 3);
    vids.forEach((v, i) => { const q = def.verts.get(v); pts[i * 3] = q[0]; pts[i * 3 + 1] = q[1]; pts[i * 3 + 2] = q[2]; });
    const counts = [], indices = [], byPaint = new Map();
    let nf = 0;
    for (const f of def.faces.values()) {
      const polys = f.loops.length === 1 ? [f.loops[0]] : faceTris(def, f);
      for (const poly of polys) {
        counts.push(poly.length);
        for (const v of poly) indices.push(ix.get(v));
        if (f.color) { let a = byPaint.get(f.color); if (!a) byPaint.set(f.color, (a = [])); a.push(nf); }
        nf++;
      }
    }
    if (nf) {
      const g = b.mesh(p, 'Geometry', { points: pts, counts, indices }, subsetsOf(byPaint, nf));
      onGeometry(g, def.id);
    }
    if (edgeFaces) {
      const ef = edgeFaces(def);
      const loose = [...def.edges].filter(([id]) => !(ef.get(id) || []).length);
      if (loose.length) {
        const c = b.prim(p, 'Edges', 'BasisCurves');
        const lp = new Float32Array(loose.length * 6);
        loose.forEach(([, e], k) => { const a = def.verts.get(e.a), q = def.verts.get(e.b); lp.set([a[0], a[1], a[2], q[0], q[1], q[2]], k * 6); });
        b.attr(c, 'type', 'token', 'linear', { uniform: true });
        b.attr(c, 'curveVertexCounts', 'int[]', new Int32Array(loose.length).fill(2));
        b.attr(c, 'points', 'point3f[]', lp);
        b.attr(c, 'widths', 'float[]', [0.005], { meta: { interpolation: V('token', 'constant') } });
        b.attr(c, 'cadcraft:edges', 'string', def.id, { custom: true, uniform: true });
      }
    }
  };
  const writeMesh = (p, def) => {
    const a = def.mesh.toArrays();
    if (!a.nf) return;
    const geo = { points: Float32Array.from(a.p), counts: a.fc, indices: a.fi, uvs: [] };
    for (const at of a.attrs) {
      if (at.domain !== 'corner' && at.domain !== 'vertex') continue;
      const interp = at.domain === 'corner' ? 'faceVarying' : 'vertex';
      if (at.name === 'normal' && at.size === 3) geo.normals = { values: at.data, interp };
      else if ((at.name === 'uv' || /^uv\.\d+$/.test(at.name)) && at.size === 2) geo.uvs.push({ name: at.name === 'uv' ? 'st' : 'st_' + at.name.slice(3), values: at.data, interp });
      else if (at.name === 'color' && at.size === 4) {
        const rgb = new Float32Array((at.data.length / 4) * 3);
        for (let i = 0, o = 0; i < at.data.length; i += 4, o += 3) { rgb[o] = at.data[i]; rgb[o + 1] = at.data[i + 1]; rgb[o + 2] = at.data[i + 2]; }
        geo.colors = { values: rgb, interp };
      }
    }
    const byPaint = new Map();
    for (let f = 0; f < a.nf; f++) { const k = a.fm[f]; if (k >= 0) { const pt = a.paints[k]; let s = byPaint.get(pt); if (!s) byPaint.set(pt, (s = [])); s.push(f); } }
    const g = b.mesh(p, 'Geometry', geo, subsetsOf(byPaint, a.nf));
    onGeometry(g, def.id);
  };
  writeDef(b.root, 'root', 0);
  // definitions nothing places (a component taken out of the model, still in its library) go under /Prototypes too
  if (opts.allDefs) for (const id of model.defs.keys()) if (!visited.has(id)) protoFor(id);
  return report;
}
