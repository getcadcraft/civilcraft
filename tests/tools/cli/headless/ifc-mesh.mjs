/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-mesh.mjs: the triangles of an open IFC model without a window (FX.377, GH.6 ask 4; session assistant-11).
 *
 * BimCraft's viewer meshes a model with cc-ifc (lib/ifc, the same engine this file calls) and hands usd-bimcraft.js its
 * "load result". Here the same engine streams the same meshes in Node and this file builds that load result from them,
 * so the headless USD is written by BimCraft's own writer (bimUsd, docs/USD-CONVENTIONS.md) and not by a second one.
 *
 *   await meshModel(session)  -> { M, entries, triangles, elements, notes }
 *     M          what bimUsd reads: modelID, keyBase, elements, spaces, storeys, classOf, storeyOf, tree, batches
 *     entries    [{ mi: 0, ifc: { api }, model: M, name, visible: true }]   (bimUsd's first argument)
 *     triangles  [{ id, cls, storey, color: [r,g,b,a], tri: Float32Array(9 * n) }]  scene coordinates (metres, Y up), what the picture code draws
 *
 * Geometry is what the engine builds from the file: a wall's shape, the openings cut in it, a slab. A model whose elements the
 * engine cannot mesh gives fewer triangles (notes lists what it said); it is never invented here.
 */
const PLAIN = [1, 1, 1];

export async function meshModel(s) {
  const api = s.ifc, mid = s.mid;
  const byColour = new Map();                  // colour key -> batch
  const classOf = new Map(), storeyOf = new Map();
  const triangles = [];
  let spaces = 0, elements = 0;
  const batchOf = (c) => {
    const key = [c.x, c.y, c.z, c.w].map((v) => Math.round(v * 1000)).join(',');
    let b = byColour.get(key);
    if (!b) byColour.set(key, b = { color: [c.x, c.y, c.z, c.w], elems: { ids: [], t0: [], tn: [], v0: [], vn: [] }, pos: [], nrm: [], idx: [], nv: 0, nt: 0 });
    return b;
  };
  api.StreamAllMeshes(mid, (fm) => {
    const id = fm.expressID;
    const cls = s.pretty(id) || 'IfcBuildingElementProxy';
    const st = s.storeyOf(id);
    let any = false;
    const own = [];
    for (let k = 0; k < fm.geometries.size(); k++) {
      const pg = fm.geometries.get(k), g = api.GetGeometry(mid, pg.geometryExpressID);
      const V = g.GetVertexData(), I = g.GetIndexData();
      if (!V.length || !I.length) continue;
      const m = pg.flatTransformation, b = batchOf(pg.color);
      const v0 = b.nv, t0 = b.nt, nvert = V.length / 6, ntri = I.length / 3;
      for (let v = 0; v < nvert; v++) {
        const x = V[v * 6], y = V[v * 6 + 1], z = V[v * 6 + 2], nx = V[v * 6 + 3], ny = V[v * 6 + 4], nz = V[v * 6 + 5];
        b.pos.push(m[0] * x + m[4] * y + m[8] * z + m[12], m[1] * x + m[5] * y + m[9] * z + m[13], m[2] * x + m[6] * y + m[10] * z + m[14]);
        const ax = m[0] * nx + m[4] * ny + m[8] * nz, ay = m[1] * nx + m[5] * ny + m[9] * nz, az = m[2] * nx + m[6] * ny + m[10] * nz, l = Math.hypot(ax, ay, az) || 1;
        b.nrm.push(ax / l, ay / l, az / l);
      }
      for (let i = 0; i < I.length; i++) b.idx.push(I[i] + v0);
      b.nv += nvert; b.nt += ntri;
      b.elems.ids.push(id); b.elems.v0.push(v0); b.elems.vn.push(nvert); b.elems.t0.push(t0); b.elems.tn.push(ntri);
      const tri = new Float32Array(ntri * 9);
      for (let i = 0; i < I.length; i++) { const v = (I[i] + v0) * 3; tri.set([b.pos[v], b.pos[v + 1], b.pos[v + 2]], i * 3); }
      own.push(tri);
      any = true;
    }
    if (!any) return;
    classOf.set(id, cls);
    if (st) storeyOf.set(id, st);
    if (/^IfcSpace$/i.test(cls)) spaces++; else elements++;
    const tri = own.length === 1 ? own[0] : Float32Array.from(own.flatMap((a) => [...a]));
    const c = byColour.size ? [...byColour.values()].find((b) => b.elems.ids[b.elems.ids.length - 1] === id)?.color : null;
    triangles.push({ id, cls, storey: st || null, color: c ? c.slice() : [...PLAIN, 1], tri });
  });
  const batches = [...byColour.values()].map((b) => ({ color: b.color, elems: Object.fromEntries(Object.entries(b.elems).map(([k, v]) => [k, Int32Array.from(v)])), positions: Float32Array.from(b.pos), normals: Float32Array.from(b.nrm), indices: Uint32Array.from(b.idx) }));
  const elev = (id) => { const e = s.attrText(id, 'Elevation'); return typeof e === 'number' ? e : 0; };
  const storeys = s.storeyIds.map((id) => ({ id, name: s.attrText(id, 'Name') || 'Storey', elevation: elev(id) })).sort((a, b) => a.elevation - b.elevation);
  const f = s.f;
  const first = (cls) => { const l = f.ofType(cls, true); return l.length ? { type: cls, expressID: l[0], children: [] } : null; };
  const site = first('IFCSITE'), bld = first('IFCBUILDING');
  const tree = site ? { ...site, children: bld ? [bld] : [] } : bld ? { type: 'IFCPROJECT', expressID: 0, children: [bld] } : null;
  const notes = [];
  try { for (const n of api.notes?.(mid) || []) notes.push(String(n.message || n)); } catch { /* none */ }
  const M = { modelID: mid, keyBase: 0, elements, spaces, storeys, classOf, storeyOf, tree, batches };
  return { M, entries: [{ mi: 0, ifc: { api }, model: M, name: s.name, visible: true }], triangles, elements: elements + spaces, notes: notes.slice(0, 10) };
}
