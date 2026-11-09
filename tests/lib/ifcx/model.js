/* SPDX-License-Identifier: Apache-2.0 */
/**
 * model.js — a composed IFCX tree as a building model (SU.882): project › sites › buildings › storeys › elements, each with
 * name, IFC class, properties, quantities, classifications, material, colour, placement and triangle meshes.
 *
 *   toModel(composed, tree, { name }) → model
 *
 * model = { name, header, units: 'm', up: 'z', project, sites: [site], schemas, issues, stats }
 *   project / site / building / storey = { id, key, name, nameSource, description, extra, raw }
 *     site.buildings[], site.elements[]; building.storeys[], building.elements[]; storey { elevation, placement, elements[] }
 *   element = { id, key, name, nameSource, ifcClass, host, placement (4x4 row-vector, world), props { set: { name: value } },
 *     quantities { set: { name: { value, kind } } }, classifications [{ system, code, uri }], material { code, uri, props } | null,
 *     color [r,g,b] | null, opacity | null, meshes [{ id, key, positions (flat, in the element's frame), indices, color, opacity,
 *     hidden, extra }], extra { attribute: value }, raw [snapshot] }
 * `extra` holds every attribute this file has no mapping for, and `raw` the child nodes with no mapping (curves, space boundary
 * objects, groups with no geometry): both are written back untouched, so nothing is dropped silently. What cannot be kept
 * (attributes on a group node that only carries geometry) is listed in `issues` as ifcx.map.dropped.
 * Units are metres and Z is up: the examples say "units will be documented later", so this is an assumption stated here.
 */
import { A, PROPS } from './names.js';
import { IDENT, mulRow, movePoint, clone, isObj } from './util.js';

const code = (occ) => { const c = occ.node.attributes[A.CLASS]; return c && typeof c.code === 'string' ? c.code : null; };
const hasClassBelow = (occ) => occ.children.some((c) => code(c) || hasClassBelow(c));
const hasMeshBelow = (occ) => !!occ.node.attributes[A.MESH] || occ.children.some(hasMeshBelow);
const rgb = (c) => (Array.isArray(c) && c.length >= 3 && c.slice(0, 3).every((x) => typeof x === 'number') ? c.slice(0, 3) : null);

export function toModel(composed, tree, { name = '' } = {}) {
  const issues = [];
  const stats = { elements: 0, meshes: 0, triangles: 0, extraAttributes: 0, rawNodes: 0 };
  const model = { name: name || (composed.header && composed.header.id) || 'IFCX', header: composed.header, units: 'm', up: 'z', project: null, sites: [], schemas: {}, issues, stats };
  const used = new Set();
  const uniqueId = (path) => { let id = path, n = 1; while (used.has(id)) id = path + '#' + (++n); used.add(id); return id; };
  const snapshot = (occ) => ({ id: uniqueId(occ.path), key: occ.name, attributes: clone(occ.node.attributes), children: occ.children.map(snapshot) });
  const kindOf = (attr) => {
    const s = composed.schemas.get(attr);
    if (s && s.value && s.value.quantityKind) return s.value.quantityKind;
    if (s) return null;
    const p = PROPS[attr.slice(A.PROP.length)];
    return p && p[1] ? p[1] : null;
  };
  const keepSchema = (attr) => { const s = composed.schemas.get(attr); if (s && !model.schemas[attr]) model.schemas[attr] = clone({ value: s.value }); };

  /** Sort one resolved attribute set into the fields of `t` (a spatial object or an element). Returns nothing; leftovers go to t.extra. */
  const sortAttrs = (attrs, t, { geometry = false } = {}) => {
    t.extra = {};
    for (const [k, v] of Object.entries(attrs)) {
      if (k === A.CLASS || k === A.XFORM || k === A.ALPHA) continue;
      if (k === A.MESH || k === A.VISIBILITY) { if (!geometry) t.extra[k] = clone(v); continue; }
      if (k === A.COLOR) { t.color = rgb(v); if (!t.color) t.extra[k] = clone(v); continue; }
      if (k === A.OPACITY) { if (typeof v === 'number') t.opacity = v; else t.extra[k] = clone(v); continue; }
      if (k === A.MATERIAL) { if (isObj(v) && typeof v.code === 'string') { t.material = { code: v.code, uri: typeof v.uri === 'string' ? v.uri : '', props: (t.material && t.material.props) || {} }; } else t.extra[k] = clone(v); continue; }
      if (k.startsWith(A.MATPROP)) { t.material = t.material || { code: '', uri: '', props: {} }; t.material.props[k.slice(A.MATPROP.length)] = clone(v); keepSchema(k); continue; }
      if (k.startsWith(A.PROP)) {
        const n = k.slice(A.PROP.length);
        if (n === 'Name' && typeof v === 'string') { t.name = v; t.nameSource = 'prop'; continue; }
        if (n === 'Description' && typeof v === 'string') { t.description = v; continue; }
        const kind = kindOf(k);
        if (kind && typeof v === 'number') { ((t.quantities = t.quantities || {}).IFCX = t.quantities.IFCX || {})[n] = { value: v, kind }; }
        else if (['string', 'number', 'boolean'].includes(typeof v)) { ((t.props = t.props || {}).IFCX = t.props.IFCX || {})[n] = v; }
        else t.extra[k] = clone(v);
        continue;
      }
      if (k.startsWith(A.PSET) && isObj(v)) { (t.props = t.props || {})[k.slice(A.PSET.length)] = clone(v); continue; }
      if (k.startsWith(A.QTO) && isObj(v)) {
        const s = composed.schemas.get(k), vals = s && s.value.objectRestrictions && s.value.objectRestrictions.values;
        const set = (t.quantities = t.quantities || {})[k.slice(A.QTO.length)] = {};
        for (const [qn, qv] of Object.entries(v)) if (typeof qv === 'number') set[qn] = { value: qv, kind: (vals && vals[qn] && vals[qn].quantityKind) || null };
        continue;
      }
      if (k.endsWith('::class') && isObj(v) && typeof v.code === 'string') { (t.classifications = t.classifications || []).push({ system: k.slice(0, -7), code: v.code, uri: typeof v.uri === 'string' ? v.uri : '' }); continue; }
      t.extra[k] = clone(v);
      keepSchema(k);
      stats.extraAttributes++;
    }
  };

  const spatial = (occ, cls) => {
    const t = { id: uniqueId(occ.path), key: occ.name, name: occ.name, nameSource: 'key', description: '', extra: {}, raw: [], ifcClass: cls };
    sortAttrs(occ.node.attributes, t);
    return t;
  };
  const implicit = { site: null, building: null };
  const siteOf = (ctx) => {
    if (ctx.site) return ctx.site;
    if (!implicit.site) { implicit.site = { id: null, key: 'Site', name: 'Site', nameSource: 'key', description: '', extra: {}, raw: [], ifcClass: 'IfcSite', buildings: [], elements: [], implicit: true }; model.sites.push(implicit.site); }
    return implicit.site;
  };
  const buildingOf = (ctx) => {
    if (ctx.building) return ctx.building;
    const s = siteOf(ctx);
    if (!implicit.building || !s.buildings.includes(implicit.building)) {
      implicit.building = { id: null, key: 'Building', name: 'Building', nameSource: 'key', description: '', extra: {}, raw: [], ifcClass: 'IfcBuilding', storeys: [], elements: [], implicit: true };
      s.buildings.push(implicit.building);
    }
    return implicit.building;
  };
  const containerOf = (ctx) => ctx.storey || (ctx.building ? ctx.building : ctx.site ? ctx.site : buildingOf(ctx));

  const meshItem = (occ, rel, inh) => {
    const m = occ.node.attributes[A.MESH];
    if (!isObj(m) || !Array.isArray(m.points) || !Array.isArray(m.faceVertexIndices)) { issues.push({ level: 'warning', code: 'ifcx.map.mesh-bad', vars: { path: occ.path } }); return null; }
    const pts = m.points, idx = m.faceVertexIndices;
    if (idx.length % 3 || idx.some((i) => !Number.isInteger(i) || i < 0 || i >= pts.length) || pts.some((p) => !Array.isArray(p) || p.length < 3 || p.slice(0, 3).some((x) => typeof x !== 'number' || !Number.isFinite(x)))) {
      issues.push({ level: 'warning', code: 'ifcx.map.mesh-bad', vars: { path: occ.path } });
      return null;
    }
    const positions = new Array(pts.length * 3);
    pts.forEach((p, i) => { const q = movePoint(rel, p[0], p[1], p[2]); positions[i * 3] = q[0]; positions[i * 3 + 1] = q[1]; positions[i * 3 + 2] = q[2]; });
    const vis = occ.node.attributes[A.VISIBILITY];
    const item = { id: uniqueId(occ.path), key: occ.name, positions, indices: idx.slice(), color: inh.color, opacity: inh.opacity, hidden: !!(vis && vis.visibility === 'invisible') };
    // everything else on a geometry node (a material, a class, a property) is kept verbatim, with its schema
    item.extra = {};
    for (const [k, v] of Object.entries(occ.node.attributes)) {
      if ([A.MESH, A.VISIBILITY, A.COLOR, A.OPACITY, A.XFORM].includes(k)) continue;
      item.extra[k] = clone(v);
      keepSchema(k);
    }
    stats.meshes++; stats.triangles += idx.length / 3;
    return item;
  };

  const walk = (occ, ctx) => {
    const cls = code(occ);
    if (cls === 'IfcProject') {
      const p = spatial(occ, cls);
      p.sites = [];
      if (model.project) issues.push({ level: 'warning', code: 'ifcx.map.two-projects', vars: { path: occ.path } }); else model.project = p;
      return descend(occ, { ...ctx, project: p, host: null });
    }
    if (cls === 'IfcSite') { const s = spatial(occ, cls); s.buildings = []; s.elements = []; model.sites.push(s); return descend(occ, { ...ctx, site: s, building: null, storey: null }); }
    if (cls === 'IfcBuilding') { const b = spatial(occ, cls); b.storeys = []; b.elements = []; siteOf(ctx).buildings.push(b); return descend(occ, { ...ctx, site: siteOf(ctx), building: b, storey: null }); }
    if (cls === 'IfcBuildingStorey') {
      const s = spatial(occ, cls);
      s.elevation = occ.world[3][2]; s.placement = occ.world.map((r) => r.slice()); s.elements = [];
      buildingOf(ctx).storeys.push(s);
      return descend(occ, { ...ctx, building: buildingOf(ctx), site: siteOf(ctx), storey: s });
    }
    if (cls || (occ.node.attributes[A.MESH] && !ctx.host)) return element(occ, ctx, cls);
    return descend(occ, ctx);   // a group with no class and no geometry: only its children matter
  };
  const descend = (occ, ctx) => { for (const c of occ.children) walk(c, ctx); };

  const element = (occ, ctx, cls) => {
    const el = { id: uniqueId(occ.path), key: occ.name, name: occ.name, nameSource: 'key', ifcClass: cls || 'IfcBuildingElementProxy', host: ctx.host ? ctx.host.id : null,
      placement: occ.world.map((r) => r.slice()), props: {}, quantities: {}, classifications: [], material: null, color: null, opacity: null, meshes: [], description: '', raw: [] };
    if (!cls) issues.push({ level: 'info', code: 'ifcx.map.no-class', vars: { path: occ.path, name: occ.name } });
    sortAttrs(occ.node.attributes, el, { geometry: true });
    const inh = { color: el.color, opacity: el.opacity };
    if (occ.node.attributes[A.MESH]) { const m = meshItem(occ, IDENT(), inh); if (m) el.meshes.push(m); }
    collect(occ, IDENT(), el, inh, { ...ctx, host: el });
    containerOf(ctx).elements.push(el);
    stats.elements++;
  };
  /** The children of an element: geometry carriers fold into the element, classed ones become elements, the rest is kept raw. */
  const collect = (occ, rel, el, inh, ctx) => {
    for (const c of occ.children) {
      const attrs = c.node.attributes;
      if (code(c)) { walk(c, { ...ctx, host: el }); continue; }
      if (attrs[A.BOUNDARY]) { el.raw.push(snapshot(c)); stats.rawNodes++; continue; }
      const here = mulRow(c.local, rel);
      const cin = { color: rgb(attrs[A.COLOR]) || inh.color, opacity: typeof attrs[A.OPACITY] === 'number' ? attrs[A.OPACITY] : inh.opacity };
      if (attrs[A.MESH]) { const m = meshItem(c, here, cin); if (m) el.meshes.push(m); }
      if (hasMeshBelow(c) || hasClassBelow(c)) {
        if (!attrs[A.MESH]) {
          const lost = Object.keys(attrs).filter((k) => k !== A.XFORM && k !== A.COLOR && k !== A.OPACITY && k !== A.MATERIAL);
          if (lost.length) issues.push({ level: 'warning', code: 'ifcx.map.dropped', vars: { path: c.path, attrs: lost.join(', ') } });
        }
        collect(c, here, el, cin, ctx);
      } else { el.raw.push(snapshot(c)); stats.rawNodes++; }
    }
  };

  for (const r of tree.roots) walk(r, { project: null, site: null, building: null, storey: null, host: null });
  if (!model.project) model.project = { id: null, key: model.name, name: model.name, nameSource: 'key', description: '', extra: {}, raw: [], ifcClass: 'IfcProject', implicit: true };
  if (!model.sites.length) siteOf({});
  return model;
}
