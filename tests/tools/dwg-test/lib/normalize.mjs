/* SPDX-License-Identifier: Apache-2.0 */
/**
 * normalize.mjs — build the harness's common entity form (README "Entity form", the same shape
 * lib/dump.py writes from a DXF) from
 *   fromModel(model)          our reader's model (docs/DWG-LIB-SPEC.md "Model"), field names tolerant
 *   fromLibredwgWeb(db)       libredwg-web's DwgDatabase (black box: only its public output is read)
 * Both return { entities, counts{block{TYPE:n}}, total{TYPE:n}, unknown{TYPE:n}, layers[], notes[] }.
 */

const UNI = /\\U\+([0-9A-Fa-f]{4})/g;
export const uni = (s) => (typeof s === 'string' ? s.replace(UNI, (_, h) => String.fromCharCode(parseInt(h, 16))) : s);
const num = (v, d = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : typeof v === 'bigint' ? Number(v) : d);
const P = (v) => (Array.isArray(v) ? [num(v[0]), num(v[1]), num(v[2])] : v && typeof v === 'object' ? [num(v.x), num(v.y), num(v.z)] : [0, 0, 0]);
const H = (h) => (h == null ? '' : typeof h === 'number' || typeof h === 'bigint' ? h.toString(16).toUpperCase() : String(h).toUpperCase().replace(/^0+(?=.)/, ''));
const pick = (o, ...ks) => { for (const k of ks) if (o && o[k] !== undefined && o[k] !== null) return o[k]; return undefined; };
const ANON = /^\*(?:(paper_space)\d*|([a-z])\d+)$/i;
/** Anonymous block names are renumbered on every save → keep the kind only (same rule as dump.py). */
export const canonBlock = (name) => { const m = ANON.exec(name || ''); return !m ? (name ?? '') : m[1] ? '*Paper_Space' : '*' + m[2].toUpperCase(); };
export const spaceOf = (name) => { const l = String(name || '').toLowerCase(); return l === '*model_space' ? 'model' : l.startsWith('*paper_space') ? 'paper' : 'block'; };

function finish(entities, layers, notes = []) {
  const counts = {}, total = {}, unknown = {};
  for (const e of entities) {
    const c = (counts[e.owner] ||= {});
    c[e.t] = (c[e.t] || 0) + 1;
    total[e.t] = (total[e.t] || 0) + 1;
    if (e.unknown) unknown[e.g.className || e.t] = (unknown[e.g.className || e.t] || 0) + 1;
  }
  return { entities, counts, total, unknown, layers, notes };
}

// ---------------------------------------------------------------------------------------------
// Our model (lib/dwg readDwg). Field names per the spec; alternatives accepted so a renamed field
// shows up as a geometry mismatch rather than a crash.
const POLY_KIND = { POLYLINE_2D: '2d', POLYLINE_3D: '3d', POLYLINE_PFACE: 'pface', POLYLINE_MESH: 'mesh', POLYLINE: '2d' };

export function modelGeom(e, t) {
  switch (t) {
    case 'LINE': return { a: P(pick(e, 'start', 'a')), b: P(pick(e, 'end', 'b')) };
    case 'POINT': return { p: P(pick(e, 'position', 'point', 'p')) };
    case 'CIRCLE': return { c: P(e.center), r: num(e.radius) };
    case 'ARC': return { c: P(e.center), r: num(e.radius), a0: num(e.startAngle), a1: num(e.endAngle) };
    case 'ELLIPSE': return { c: P(e.center), maj: P(e.majorAxis), ratio: num(e.ratio), p0: num(e.startParam), p1: num(e.endParam, 2 * Math.PI) };
    case 'LWPOLYLINE': return { closed: !!e.closed, elev: num(e.elevation), pts: (e.vertices || []).map((v) => [num(v.x), num(v.y), num(v.bulge)]) };
    case 'POLYLINE': {
      const flags = num(e.flags);
      const kind = POLY_KIND[e.type] || (flags & 8 ? '3d' : flags & 64 ? 'pface' : flags & 16 ? 'mesh' : '2d');
      const g = { kind, closed: e.closed !== undefined ? !!e.closed : !!(flags & 1), pts: (e.vertices || []).map((v) => P(v.position || v.point || v)) };
      // polyface: face records are vertex indices (1-based, negative = hidden edge), compared as faces
      if (kind === 'pface') g.faces = (e.faces || []).map((f) => [0, 1, 2, 3].map((i) => num(f[i])));
      return g;
    }
    case 'TEXT': case 'ATTRIB': case 'ATTDEF': {
      const g = { ins: P(e.insert), h: num(e.height), rot: num(e.rotation), text: uni(pick(e, 'value', 'text', 'default') ?? '') };
      const ha = num(pick(e, 'hAlign', 'halign')), va = num(pick(e, 'vAlign', 'valign'));
      if (ha || va) { g.ha = ha; g.va = va; if (e.align) g.align = P(e.align); }
      if (t !== 'TEXT') g.tag = e.tag ?? '';
      if (t === 'ATTDEF') g.prompt = uni(e.prompt ?? '');
      return g;
    }
    case 'MTEXT': return { ins: P(e.insert), h: num(e.height), w: num(e.width), attach: num(e.attach, 1), text: uni(e.value ?? '') };
    case 'INSERT': case 'MINSERT': {
      const s = e.scale;
      const g = { name: canonBlock(e.block ?? e.name ?? ''), ins: P(e.insert), sx: num(s?.x ?? s?.[0] ?? e.sx ?? s, 1), sy: num(s?.y ?? s?.[1] ?? e.sy ?? s, 1), sz: num(s?.z ?? s?.[2] ?? e.sz ?? s, 1), rot: num(e.rotation) };
      if (num(e.cols, 1) > 1 || num(e.rows, 1) > 1) { g.cols = num(e.cols, 1); g.rows = num(e.rows, 1); }
      return g;
    }
    case 'DIMENSION': return { dimtype: num(e.dimType) & 7, defp: P(e.defPoint), mid: P(e.textMid), block: canonBlock(e.block ?? ''), text: uni(e.text ?? '') };
    case 'HATCH': return { pattern: e.pattern ?? '', solid: !!e.solid, loops: Array.isArray(e.loops) ? e.loops.length : num(e.loops) };
    case 'SPLINE': return { degree: num(e.degree), ctrl: (e.control || e.controlPoints || []).map(P), knots: (e.knots || []).map((k) => num(k)), fit: (e.fit || e.fitPoints || []).map(P) };
    case 'SOLID': case 'TRACE': case '3DFACE': {
      const v = e.corners || e.points || e.vertices || [e.v0 ?? e.c1, e.v1 ?? e.c2, e.v2 ?? e.c3, e.v3 ?? e.c4];
      return { v: v.map(P) };
    }
    case 'VIEWPORT': return { c: P(e.center), w: num(e.width), h: num(e.height) };
    case 'LEADER': return { pts: (e.vertices || e.points || []).map(P) };
    case 'RAY': case 'XLINE': return { p: P(pick(e, 'start', 'point', 'base')), dir: P(pick(e, 'direction', 'unitVector', 'dir')) };
    default: return {};
  }
}

export function fromModel(model) {
  const out = [];
  const notes = [];
  // Dynamic blocks: the file stores the anonymous "*U…" name and the real one in xdata (our trueName);
  // ODA's DXF prints the real one, so the common form uses it for INSERT names and owners.
  const trueOf = new Map();
  for (const b of model.blocks || []) if (b.trueName && b.name) trueOf.set(String(b.name).toUpperCase(), b.trueName);
  const real = (n) => trueOf.get(String(n ?? '').toUpperCase()) ?? n;
  const one = (e, owner, space, insert) => {
    let t = String(e.type || 'UNKNOWN').toUpperCase();
    if (t.startsWith('POLYLINE')) t = 'POLYLINE';
    else if (t.startsWith('DIMENSION')) t = 'DIMENSION';
    const unknown = t === 'UNKNOWN' || t === 'PROXY';
    // An entity of a custom class (AEC objects…) can't be stored in DXF: ODA writes it as
    // ACAD_PROXY_ENTITY. Same object, so the common form uses that type (the class stays in g).
    if (unknown && (e.className || e.dxfName)) t = 'ACAD_PROXY_ENTITY';
    let g;
    try { g = unknown ? { className: e.className || e.dxfName || '' } : modelGeom(e, t); } catch (x) { g = { error: String(x.message || x).slice(0, 120) }; }
    if (g.name !== undefined && (t === 'INSERT' || t === 'MINSERT')) g.name = canonBlock(real(e.block ?? e.name ?? ''));
    if (insert) g.insert = insert;
    out.push({ h: H(e.handle), t, layer: e.layer ?? '0', owner: canonBlock(real(owner)), space, g, ...(unknown ? { unknown: true } : {}) });
  };
  for (const b of model.blocks || []) {
    const owner = b.name ?? '';
    const space = spaceOf(owner);
    for (const e of b.entities || []) {
      one(e, owner, space);
      for (const a of e.attribs || []) one({ ...a, type: 'ATTRIB' }, owner, space, H(e.handle));
    }
  }
  const layers = (model.tables?.layers || []).map((l) => ({ h: H(l.handle), name: l.name, color: l.color?.index ?? l.color }));
  for (const n of model.report?.notes || []) notes.push(String(n));
  return finish(out, layers, notes);
}

/**
 * The source entity as the writer wrote it: its layer, owner block, INSERT block name and DIMENSION block
 * through the writer's rename record (report.renamed { layers, blocks }: source name → written name; cleanName
 * makes "Lay/er:1" a legal "Lay_er_1"). Returns the same object when nothing was renamed.
 */
export function renamedAs(e, renamed) {
  if (!renamed) return e;
  const L = renamed.layers || {};
  // owners and INSERT names are case-insensitive block names in the common form
  const bUp = new Map(Object.entries(renamed.blocks || {}).map(([k, v]) => [k.toUpperCase(), v]));
  const block = (n) => { const v = n == null ? undefined : bUp.get(String(n).toUpperCase()); return v === undefined ? n : canonBlock(v); };
  const layer = Object.prototype.hasOwnProperty.call(L, e.layer) ? L[e.layer] : e.layer;
  const owner = block(e.owner);
  let g = e.g;
  if (g && (e.t === 'INSERT' || e.t === 'MINSERT') && block(g.name) !== g.name) g = { ...g, name: block(g.name) };
  else if (g && e.t === 'DIMENSION' && block(g.block) !== g.block) g = { ...g, block: block(g.block) };
  return layer === e.layer && owner === e.owner && g === e.g ? e : { ...e, layer, owner, g };
}

// ---------------------------------------------------------------------------------------------
// CivilCraft's entity list (dwg-write.js input) → what a reader should see in model space.
// `layerNames` = the writer's report.layers ([0, …given layers, …added]) when it renamed layers.
export function fromCivilList(c, layerNames = null) {
  const given = ['0', ...(c.layers || []).map((l) => l.name)];
  const nameOf = (n) => { if (!layerNames) return n; const i = given.indexOf(n); return i >= 0 && layerNames[i] ? layerNames[i] : n; };
  const out = [];
  const push = (t, layer, g) => out.push({ h: '', t, layer: nameOf(layer ?? '0'), owner: '*Model_Space', space: 'model', g });
  const p3 = (p) => [num(p.x), num(p.y), num(p.z)];
  for (const e of c.entities || []) {
    if (e.type === 'line') push('LINE', e.layer, { a: p3(e.a), b: p3(e.b) });
    else if (e.type === 'poly') { if (e.pts.length >= 2) push('LWPOLYLINE', e.layer, { closed: !!e.closed, elev: num(e.elev), pts: e.pts.map((p) => [num(p.x), num(p.y), num(p.bulge)]) }); }
    else if (e.type === 'poly3d') push('POLYLINE', e.layer, { kind: '3d', closed: !!e.closed, pts: e.pts.map(p3) });
    else if (e.type === 'arc') push('ARC', e.layer, { c: p3(e.c), r: e.r, a0: e.a0, a1: e.a1 });
    else if (e.type === 'circle') push('CIRCLE', e.layer, { c: p3(e.c), r: e.r });
    else if (e.type === 'point') push('POINT', e.layer, { p: [num(e.x), num(e.y), num(e.z)] });
    else if (e.type === 'text') {
      const g = { ins: [num(e.x), num(e.y), 0], h: e.h, rot: num(e.rot), text: e.text };
      const ha = e.align === 'center' ? 1 : e.align === 'right' ? 2 : 0;
      if (ha) { g.ha = ha; g.va = 0; g.align = [num(e.x), num(e.y), 0]; }
      push('TEXT', e.layer, g);
    }
  }
  return finish(out, []);
}

// ---------------------------------------------------------------------------------------------
// libredwg-web 0.7.x DwgDatabase (observed output shape; LWPOLYLINE.flag is the raw DWG flag, 512 = closed).
const LW_POLY = { POLYLINE2D: '2d', POLYLINE3D: '3d', POLYFACE_MESH: 'pface', POLYGON_MESH: 'mesh', PFACE: 'pface', MESH: 'mesh' };

function lwGeom(e, t) {
  const tx = e.text && typeof e.text === 'object' ? e.text : e;   // ATTRIB/ATTDEF nest their TEXT part
  switch (t) {
    case 'LINE': return { a: P(e.startPoint), b: P(e.endPoint) };
    case 'POINT': return { p: P(e.position) };
    case 'CIRCLE': return { c: P(e.center), r: num(e.radius) };
    case 'ARC': return { c: P(e.center), r: num(e.radius), a0: num(e.startAngle), a1: num(e.endAngle) };
    case 'ELLIPSE': return { c: P(e.center), maj: P(e.majorAxisEndPoint), ratio: num(e.axisRatio), p0: num(e.startAngle), p1: num(e.endAngle) };
    case 'LWPOLYLINE': return { closed: !!(num(e.flag) & 512), elev: num(e.elevation), pts: (e.vertices || []).map((v) => [num(v.x), num(v.y), num(v.bulge)]) };
    case 'POLYLINE': return { kind: LW_POLY[e.type] || '2d', closed: !!(num(e.flag) & 1), pts: (e.vertices || []).map(P) };
    case 'TEXT': case 'ATTRIB': case 'ATTDEF': {
      const g = { ins: P(tx.startPoint), h: num(tx.textHeight), rot: num(tx.rotation), text: uni((t === 'TEXT' ? e.text : tx.text) ?? '') };
      const ha = num(tx.halign), va = num(tx.valign);
      if (ha || va) { g.ha = ha; g.va = va; g.align = P(t === 'TEXT' ? e.endPoint : (e.alignmentPoint || tx.endPoint)); }
      if (t !== 'TEXT') g.tag = e.tag ?? '';
      if (t === 'ATTDEF') g.prompt = uni(e.prompt ?? '');
      return g;
    }
    case 'MTEXT': return { ins: P(e.insertionPoint), h: num(e.textHeight), w: num(e.rectWidth), attach: num(e.attachmentPoint, 1), text: uni(e.text ?? '') };
    case 'INSERT': case 'MINSERT': {
      const g = { name: canonBlock(e.name ?? ''), ins: P(e.insertionPoint), sx: num(e.xScale, 1), sy: num(e.yScale, 1), sz: num(e.zScale, 1), rot: num(e.rotation) };
      if (num(e.columnCount) > 1 || num(e.rowCount) > 1) { g.cols = num(e.columnCount); g.rows = num(e.rowCount); }
      return g;
    }
    case 'DIMENSION': return { dimtype: num(e.dimensionType) & 7, defp: P(e.definitionPoint), mid: P(e.textPoint), block: canonBlock(e.name ?? ''), text: uni(e.text ?? '') };
    case 'HATCH': return { pattern: e.patternName ?? '', solid: !!e.solidFill, loops: num(e.numberOfBoundaryPaths, (e.boundaryPaths || []).length) };
    case 'SPLINE': return { degree: num(e.degree), ctrl: (e.controlPoints || []).map(P), knots: (e.knots || []).map((k) => num(k)), fit: (e.fitPoints || []).map(P) };
    case 'SOLID': case 'TRACE': case '3DFACE': return { v: [e.corner1, e.corner2, e.corner3, e.corner4].map(P) };
    case 'VIEWPORT': return { c: P(e.viewportCenter), w: num(e.width), h: num(e.height) };
    case 'LEADER': return { pts: (e.vertices || []).map(P) };
    case 'RAY': case 'XLINE': return { p: P(e.firstPoint), dir: P(e.unitDirection) };
    default: return {};
  }
}

export function fromLibredwgWeb(db) {
  const records = db.tables?.BLOCK_RECORD?.entries || [];
  const nameOf = new Map(records.map((r) => [H(r.handle), r.name]));
  const seen = new Map();
  const add = (e) => { const h = H(e.handle); if (!seen.has(h)) seen.set(h, e); };
  for (const r of records) for (const e of r.entities || []) add(e);
  for (const e of db.entities || []) add(e);
  for (const e of [...seen.values()]) for (const a of e.attribs || []) add({ ...a, __insert: e });
  const out = [];
  for (const [h, e] of seen) {
    let t = String(e.type || 'UNKNOWN').toUpperCase();
    if (/^POLY(LINE[23]D|FACE_MESH|GON_MESH)$|^POLYLINE_/.test(t)) t = 'POLYLINE';
    let ownerH = H(e.ownerBlockRecordSoftId), insert;
    if (t === 'ATTRIB') {
      const ins = e.__insert || seen.get(ownerH);
      if (ins) { insert = H(ins.handle); ownerH = H(ins.ownerBlockRecordSoftId); }
    }
    const owner = nameOf.get(ownerH) ?? ('?' + ownerH);
    let g;
    try { g = lwGeom(e, t); } catch (x) { g = { error: String(x.message || x).slice(0, 120) }; }
    if (insert) g.insert = insert;
    out.push({ h, t, layer: e.layer ?? '0', owner: canonBlock(owner), space: spaceOf(owner), g });
  }
  const layers = (db.tables?.LAYER?.entries || []).map((l) => ({ h: H(l.handle), name: l.name, color: l.colorIndex }));
  return finish(out, layers);
}
