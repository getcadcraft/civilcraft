/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a reader; the words a person sees are the host's (rows.js takes its `t`). */
/**
 * read.js — a building model as a list of measured elements (0.11 MT.1). DOM-free; host-neutral (lib/modeltakeoff).
 *
 *   const model = await readModel(WebIFC, bytes, { onProgress(done, total), manifold, transfer })
 *     WebIFC = cc-ifc's api.js module (the host imports its own copy: './ifc/api.js'); bytes = an IFC file (IFC2X3, IFC4, IFC4X3)
 *   → { schema, booleans, project: { name, application }, storeys: [{ id, name, elevation }], elements: [element], spaces, tris, notes: [..] }
 *
 *   element = { id, guid, cls ('IfcWall'), name, type ('Basic Wall:Interior 135'), storey (name or ''), box (bool),
 *               m (measure.js result or null), q: { length, height, side, plan, slope, volume },
 *               materials: [names], layers: [{ material, thickness (m), name }] (a wall or floor built of layers, outermost first; [] when it has none),
 *               size: { w, h } in m for a door or window (the file's own width and height) or null,
 *               capped (bool: the mesh is only the box, the budget was spent), bbox: [x0, y0, z0, x1, y1, z1] in the drawing's metres (Y up), mesh: { v (Float32Array, x y z nx ny nz per vertex), i (Uint32Array) } or null }
 * (0.11 MT.3/MT.4: the mesh is kept so the model can be drawn and an element clicked; past `meshBudget` triangles an element keeps only its box.)
 *   each q.<kind> = { v (SI: m, m², m³), from: 'file' | 'shape', exact (bool) } or null when the element has no such number.
 *
 * Where a number comes from: the file's own quantity set first (IfcElementQuantity: Net before Gross), as the model's author stated it; else the
 * element's shape, measured by measure.js. `box` marks an element whose shape is only a placeholder box (the lab's .rvt reader writes
 * BodySource = a bounding box when it could not decode the shape): it is counted, and its lengths, areas and volumes are left out, never guessed.
 */
import { Measure } from './measure.js';

const BOX_SOURCES = new Set(['partition_element_record_bbox', 'partition_family_instance_turned_box']);
const PREFIX = { EXA: 1e18, PETA: 1e15, TERA: 1e12, GIGA: 1e9, MEGA: 1e6, KILO: 1e3, HECTO: 1e2, DECA: 10, DECI: 0.1, CENTI: 0.01, MILLI: 1e-3, MICRO: 1e-6, NANO: 1e-9 };

const val = (v) => (v === null || v === undefined ? null : typeof v === 'object' && 'value' in v ? (v.value === '' ? null : v.value) : v);
const num = (v) => { const x = val(v); const n = typeof x === 'number' ? x : x === null ? NaN : Number(x); return Number.isFinite(n) ? n : null; };
const text = (v) => { const x = val(v); return x === null || x === undefined ? '' : String(x).trim(); };

/** SI per file unit for stated lengths, areas and volumes (the project's unit assignment; SI when it says nothing). */
function unitScales(api, mid) {
  const out = { length: 1, area: 1, volume: 1 };
  let g = null, f = null;
  try { g = api.geometry(mid).g; f = api.file(mid); out.length = g.lengthUnit || 1; } catch (e) { return out; }
  try {
    const ref = (v) => (v && typeof v === 'object' && v.ref !== undefined ? v.ref : null);
    const enm = (v) => (v && typeof v === 'object' && typeof v.enum === 'string' ? v.enum : null);
    const proj = f.ofType('IFCPROJECT', true)[0];
    const ua = proj !== undefined ? ref(g.a(proj, 'UnitsInContext')) : (f.ofType('IFCUNITASSIGNMENT')[0] ?? null);
    if (ua === null || ua === undefined) return out;
    const units = g.a(ua, 'Units');
    for (const u of (Array.isArray(units) ? units.map(ref).filter((x) => x !== null) : [])) {
      const kind = enm(g.a(u, 'UnitType'));
      const key = kind === 'AREAUNIT' ? 'area' : kind === 'VOLUMEUNIT' ? 'volume' : null;
      if (!key) continue;
      if (f.type(u) === 'IFCSIUNIT') { const p = enm(g.a(u, 'Prefix')); const k = p ? PREFIX[p] ?? 1 : 1; out[key] = key === 'area' ? k * k : k * k * k; }
      else { const v = g.unitFactor(u, 'METRE'); if (v) out[key] = v; }
    }
  } catch (e) { /* the SI defaults stand */ }
  return out;
}

const STATED = {
  length: [['LengthValue', ['Length']]],
  height: [['LengthValue', ['Height']]],
  side: [['AreaValue', ['NetSideArea', 'GrossSideArea']]],
  plan: [['AreaValue', ['NetFloorArea', 'NetArea', 'NetFootprintArea', 'GrossFloorArea', 'GrossArea', 'GrossFootprintArea', 'ProjectedArea']]],
  volume: [['VolumeValue', ['NetVolume', 'GrossVolume']]],
};

/** Triangles kept for drawing (24 bytes a vertex): past this, the rest of the elements keep only their bounding box. */
export const MESH_BUDGET = 1500000;

const strOf = (v) => (v && typeof v === 'object' && 'typed' in v ? strOf(v.value) : typeof v === 'string' ? v.trim() : '');
const numOf = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/**
 * What an element is made of, from IfcRelAssociatesMaterial on the element or on its type: a single material, a layer set (or its usage), a
 * material list, constituents or profiles. → { materials: [names], layers: [{ material, thickness (m), name }] }
 */
export function materialsOf(f, assoc, byType, id, lengthScale) {
  const out = { materials: [], layers: [] };
  if (!f || !assoc) return out;
  const nameOfMat = (m) => (m && f.type(m) === 'IFCMATERIAL' ? strOf(f.attr(m, 'Name')) : '');
  const add = (n) => { if (n && !out.materials.includes(n)) out.materials.push(n); };
  const walk = (m, depth) => {
    if (!m || depth > 6) return;
    const t = f.type(m);
    if (t === 'IFCMATERIAL') add(nameOfMat(m));
    else if (t === 'IFCMATERIALLAYERSETUSAGE') walk(f.attr(m, 'ForLayerSet')?.ref, depth + 1);
    else if (t === 'IFCMATERIALLAYERSET') {
      for (const l of f.attr(m, 'MaterialLayers') || []) {
        const lid = l && l.ref;
        if (!lid) continue;
        const mat = nameOfMat(f.attr(lid, 'Material')?.ref);
        const th = numOf(f.attr(lid, 'LayerThickness'));
        out.layers.push({ material: mat, thickness: th === null ? 0 : th * lengthScale, name: strOf(f.attr(lid, 'Name')) });
        add(mat);
      }
    } else if (t === 'IFCMATERIALLAYER') { const mat = nameOfMat(f.attr(m, 'Material')?.ref); add(mat); }
    else if (t === 'IFCMATERIALLIST') for (const x of f.attr(m, 'Materials') || []) walk(x?.ref, depth + 1);
    else if (t === 'IFCMATERIALCONSTITUENTSET') for (const c of f.attr(m, 'MaterialConstituents') || []) add(nameOfMat(f.attr(c?.ref, 'Material')?.ref));
    else if (t === 'IFCMATERIALPROFILESET') for (const c of f.attr(m, 'MaterialProfiles') || []) add(nameOfMat(f.attr(c?.ref, 'Material')?.ref));
    else if (t === 'IFCMATERIALPROFILESETUSAGE') walk(f.attr(m, 'ForProfileSet')?.ref, depth + 1);
    else if (t === 'IFCMATERIALPROFILE') add(nameOfMat(f.attr(m, 'Material')?.ref));
  };
  const owners = [id];
  for (const r of byType?.get(id) || []) { const tid = f.attr(r, 'RelatingType')?.ref; if (tid) owners.push(tid); }
  for (const o of owners) {
    for (const r of assoc.get(o) || []) walk(f.attr(r, 'RelatingMaterial')?.ref, 0);
    if (out.materials.length) break;                      // the element's own material wins over its type's
  }
  return out;
}

export async function readModel(WebIFC, bytes, { onProgress = () => {}, manifold = undefined, transfer = false, openAsync = null, keepMesh = true, meshBudget = MESH_BUDGET } = {}) {
  const api = new WebIFC.IfcAPI();
  await api.Init(manifold === undefined ? undefined : { manifold });
  const settings = { COORDINATE_TO_ORIGIN: true };
  let mid;
  if (openAsync && typeof api.AdoptModel === 'function') mid = api.AdoptModel(await openAsync(bytes, { transfer }), settings);
  else mid = api.OpenModel(bytes, settings);
  if (!(mid >= 0)) throw new Error('not an IFC file');
  try {
    const schema = api.GetModelSchema(mid);
    const booleans = api.booleans !== false;          // false: openings were not cut out of their walls (no boolean library on this page)
    const scale = unitScales(api, mid);
    const notes = [];

    // project + who wrote the file
    const project = { name: '', application: '' };
    try { const ids = api.GetLineIDsWithType(mid, WebIFC.IFCPROJECT); if (ids.size() > 0) { const p = api.GetLine(mid, ids.get(0)); project.name = text(p.LongName) || text(p.Name); } } catch (e) { /* no project line */ }
    try { const h = api.GetHeaderLine(mid, WebIFC.FILE_NAME); const a = h && h.arguments; if (a) project.application = [text(a[4]), text(a[5])].filter(Boolean).filter((x, i, l) => l.indexOf(x) === i).join(', '); } catch (e) { /* optional */ }

    // storeys, and which storey each thing sits in (at any depth)
    const storeys = [], storeyOf = new Map();
    try {
      const tree = await api.properties.getSpatialStructure(mid, false);
      const walk = (node, here) => {
        if (!node) return;
        const isStorey = String(node.type).toUpperCase() === 'IFCBUILDINGSTOREY';
        if (isStorey) { const s = api.GetLine(mid, node.expressID); here = { id: node.expressID, name: text(s.Name) || text(s.LongName) || '#' + node.expressID, elevation: num(s.Elevation) }; storeys.push(here); }
        else if (here) storeyOf.set(node.expressID, here.name);
        for (const ch of node.children || []) walk(ch, here);
      };
      walk(tree, null);
      storeys.sort((a, b) => (a.elevation ?? 0) - (b.elevation ?? 0));
    } catch (e) { notes.push({ code: 'storeys' }); }

    // shapes: one Measure per element
    const measures = new Map();
    const drawn = new Map();                    // element id → { chunks: [{ v, i }], box: [x0, y0, z0, x1, y1, z1] }
    let tris = 0, kept = 0;
    const onMesh = (mesh, index, total) => {
      const id = mesh.expressID;
      let m = measures.get(id);
      if (!m) measures.set(id, (m = new Measure()));
      let d = drawn.get(id);
      if (!d) drawn.set(id, (d = { chunks: [], box: [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity] }));
      const placed = mesh.geometries;
      for (let i = 0; i < placed.size(); i++) {
        const pg = placed.get(i);
        const geom = api.GetGeometry(mid, pg.geometryExpressID);
        const verts = api.GetVertexArray(geom.GetVertexData(), geom.GetVertexDataSize());
        const idx = api.GetIndexArray(geom.GetIndexData(), geom.GetIndexDataSize());
        m.add(verts, 6, idx, pg.flatTransformation);
        tris += idx.length / 3;
        if (keepMesh) { const c = placeChunk(verts, idx, pg.flatTransformation, d.box, kept + idx.length / 3 <= meshBudget); if (c) { d.chunks.push(c); kept += idx.length / 3; } }
        geom.delete?.();
      }
      if (index % 100 === 0) onProgress(index + 1, total);
    };
    if (typeof api.StreamAllMeshesAsync === 'function') await api.StreamAllMeshesAsync(mid, onMesh); else api.StreamAllMeshes(mid, onMesh);
    const spaceIds = new Set();
    try {
      const before = new Set(measures.keys());
      const cb = (mesh) => onMesh(mesh, 1, 1);
      if (typeof api.StreamAllMeshesWithTypesAsync === 'function') await api.StreamAllMeshesWithTypesAsync(mid, [WebIFC.IFCSPACE], cb); else api.StreamAllMeshesWithTypes(mid, [WebIFC.IFCSPACE], cb);
      for (const id of measures.keys()) if (!before.has(id)) spaceIds.add(id);
    } catch (e) { /* no spaces */ }

    // each element: class, names, type, stated quantities, box flag
    const elements = [];
    let n = 0;
    const className = (id) => {
      try { const line = api.GetLine(mid, id, false); if (line?.constructor && /^Ifc/.test(line.constructor.name)) return [line.constructor.name, line]; } catch (e) { /* below */ }
      try { return [String(api.GetNameFromTypeCode(api.GetLineType(mid, id))).replace(/^IFC/, 'Ifc'), api.GetLine(mid, id, false)]; } catch (e) { return ['Unknown', null]; }
    };
    let mf = null, massoc = null, mtype = null;
    try { mf = api.file(mid); massoc = mf.inverse('IFCRELASSOCIATESMATERIAL', 'RelatedObjects'); mtype = mf.inverse('IFCRELDEFINESBYTYPE', 'RelatedObjects'); } catch (e) { mf = null; }
    for (const [id, meas] of measures) {
      const m = meas.done();
      if (!m) continue;
      const [cls, line] = className(id);
      const isSpace = cls === 'IfcSpace';
      let type = '';
      try { const types = await api.properties.getTypeProperties(mid, id, false); if (types && types[0]) type = text(types[0].Name); } catch (e) { /* no type */ }
      if (!type) type = isSpace ? text(line?.LongName) || text(line?.Name) : text(line?.ObjectType);
      const stated = {};
      let box = false, qWidth = null, qHeight = null;
      try {
        for (const s of (await api.properties.getPropertySets(mid, id, true)) || []) {
          for (const p of s?.HasProperties || []) {
            if (p && text(p.Name) === 'BodySource' && BOX_SOURCES.has(text(p.NominalValue))) box = true;
            if (p && text(p.Name) === 'ProfileSource' && text(p.NominalValue)) stated.profile = true;
          }
          for (const q of s?.Quantities || []) {
            if (!q) continue;
            const name = text(q.Name);
            if (name === 'Width' && num(q.LengthValue) > 0) qWidth = num(q.LengthValue) * scale.length;
            if (name === 'Height' && num(q.LengthValue) > 0) qHeight = num(q.LengthValue) * scale.length;
            for (const [kind, rules] of Object.entries(STATED)) {
              for (const [field, names] of rules) {
                const rank = names.indexOf(name);
                if (rank < 0 || q[field] === undefined || q[field] === null) continue;
                const v = num(q[field]);
                if (v === null || v < 0) continue;
                if (!stated[kind] || rank < stated[kind].rank) stated[kind] = { rank, v: v * (field === 'LengthValue' ? scale.length : field === 'AreaValue' ? scale.area : scale.volume) };
              }
            }
          }
        }
      } catch (e) { /* no sets */ }
      if (box && stated.profile) box = false;                // its outline was read: only a bare record box is a placeholder
      const q = {};
      const put = (kind, shape, exact = true) => {
        if (stated[kind]) q[kind] = { v: stated[kind].v, from: 'file', exact: true };
        else if (!box && shape !== null && shape !== undefined && Number.isFinite(shape) && shape > 0) q[kind] = { v: shape, from: 'shape', exact };
        else q[kind] = null;
      };
      put('length', linearClass(cls) ? m.long : m.run);
      put('height', m.height);
      put('side', m.side, m.sideExact);
      put('plan', m.plan);
      put('slope', m.slope);
      put('volume', m.volume);
      let mats = { materials: [], layers: [] };
      try { mats = materialsOf(mf, massoc, mtype, id, scale.length); } catch (e) { /* no materials */ }
      let size = null;
      if (/^Ifc(Door|Window)$/.test(cls)) {
        const w = (num(line?.OverallWidth) > 0 ? num(line.OverallWidth) * scale.length : null) ?? qWidth, h = (num(line?.OverallHeight) > 0 ? num(line.OverallHeight) * scale.length : null) ?? qHeight;
        if (w && h) size = { w, h };
      }
      const d = drawn.get(id);
      const bbox = d && Number.isFinite(d.box[0]) ? d.box : null;
      elements.push({ id, guid: text(line?.GlobalId), cls, name: text(line?.Name), type, storey: storeyOf.get(id) || '', box, m, q, open: m.open,
        materials: mats.materials, layers: mats.layers, size, bbox, mesh: keepMesh && d ? joinChunks(d.chunks, bbox) : null, capped: !!(keepMesh && d && !d.chunks.length) });
      if (++n % 200 === 0) onProgress(n, measures.size);
    }
    const spaces = elements.filter((e) => e.cls === 'IfcSpace').length;
    return { schema, booleans, project, storeys: storeys.map((s) => ({ id: s.id, name: s.name, elevation: s.elevation })), elements, spaces, tris, notes };
  } finally {
    try { api.CloseModel(mid); } catch (e) { /* closed */ }
  }
}

/** One placed geometry as drawing data: positions and normals through the 4 × 4 (column-major), box grown; null when the budget is spent (the box still grows). */
function placeChunk(verts, idx, M, box, keep) {
  const n = Math.floor(verts.length / 6);
  const v = keep ? new Float32Array(n * 6) : null;
  for (let k = 0; k < n; k++) {
    const x = verts[k * 6], y = verts[k * 6 + 1], z = verts[k * 6 + 2];
    const X = M[0] * x + M[4] * y + M[8] * z + M[12], Y = M[1] * x + M[5] * y + M[9] * z + M[13], Z = M[2] * x + M[6] * y + M[10] * z + M[14];
    if (X < box[0]) box[0] = X; if (Y < box[1]) box[1] = Y; if (Z < box[2]) box[2] = Z;
    if (X > box[3]) box[3] = X; if (Y > box[4]) box[4] = Y; if (Z > box[5]) box[5] = Z;
    if (v) {
      const nx = verts[k * 6 + 3], ny = verts[k * 6 + 4], nz = verts[k * 6 + 5];
      const NX = M[0] * nx + M[4] * ny + M[8] * nz, NY = M[1] * nx + M[5] * ny + M[9] * nz, NZ = M[2] * nx + M[6] * ny + M[10] * nz;
      const L = Math.hypot(NX, NY, NZ) || 1;
      v[k * 6] = X; v[k * 6 + 1] = Y; v[k * 6 + 2] = Z; v[k * 6 + 3] = NX / L; v[k * 6 + 4] = NY / L; v[k * 6 + 5] = NZ / L;
    }
  }
  return v ? { v, i: Uint32Array.from(idx) } : null;
}

/** An element's chunks as one mesh; an element past the budget gets its box (12 triangles) so it is still seen and clicked. */
function joinChunks(chunks, box) {
  if (!chunks.length) return box ? boxMesh(box) : null;
  if (chunks.length === 1) return chunks[0];
  let nv = 0, ni = 0;
  for (const c of chunks) { nv += c.v.length; ni += c.i.length; }
  const v = new Float32Array(nv), i = new Uint32Array(ni);
  let ov = 0, oi = 0;
  for (const c of chunks) { const base = ov / 6; v.set(c.v, ov); for (let k = 0; k < c.i.length; k++) i[oi + k] = c.i[k] + base; ov += c.v.length; oi += c.i.length; }
  return { v, i };
}

/** A box [x0, y0, z0, x1, y1, z1] as a mesh with face normals. */
export function boxMesh(b) {
  const [x0, y0, z0, x1, y1, z1] = b;
  const faces = [[[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], 0, 0, 1], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], 0, 0, -1],
    [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1], 1, 0, 0], [[x0, y1, z0], [x0, y0, z0], [x0, y0, z1], [x0, y1, z1], -1, 0, 0],
    [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], 0, 1, 0], [[x0, y0, z1], [x0, y0, z0], [x1, y0, z0], [x1, y0, z1], 0, -1, 0]];
  const v = new Float32Array(24 * 6), i = new Uint32Array(36);
  faces.forEach((f, k) => {
    for (let j = 0; j < 4; j++) v.set([...f[j], f[4], f[5], f[6]], (k * 4 + j) * 6);
    i.set([k * 4, k * 4 + 1, k * 4 + 2, k * 4, k * 4 + 2, k * 4 + 3], k * 6);
  });
  return { v, i };
}

/** Classes measured along their own long axis (a member), not along a wall's face in plan. */
export function linearClass(cls) {
  return /^Ifc(Beam|Column|Member|Pile|Railing|PipeSegment|DuctSegment|CableSegment|CableCarrierSegment|FlowSegment|ReinforcingBar|Tendon)/.test(cls);
}
