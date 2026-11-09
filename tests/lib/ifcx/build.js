/* SPDX-License-Identifier: Apache-2.0 */
/**
 * build.js — a building model (model.js) as an .ifcx file (SU.882).
 *
 *   fromModel(model, { id, author = 'CadCraft', timestamp, dataVersion = '1.0.0' }) → { file, issues }
 *
 * What is written: header { id, ifcxVersion 'ifcx_alpha', dataVersion, author, timestamp }; imports for exactly the published
 * schema files whose names are used; our own schemas for what the published ones do not describe (`cadcraft::pset::<Set>` for
 * other property sets, `cadcraft::qto::<Set>` for other quantity sets, `cadcraft::alpha` the note below, classification systems
 * the published files lack); every schema the model carried through; and one data entry per node (path, children, attributes).
 * The project node carries `cadcraft::alpha` { writer, note }: the file says in itself that it is the alpha format.
 * Layers and inherits are flattened (every element gets its own geometry nodes); unknown attributes and unmapped child nodes
 * are written back as they were read.
 */
import { A, PROPS, IMPORT_URI, KNOWN_CLASS_SYSTEMS, IFC_CLASS_URI } from './names.js';
import { isIdent, uuidFromText, clone, mulRow, invRow, IDENT } from './util.js';

const NOTE = 'IFC5 alpha (IFCX): written by CadCraft BimCraft while the format is still changing. Read it back with the same version first; do not treat it as an exchange standard yet.';
const typeOf = (v) => (typeof v === 'boolean' ? 'Boolean' : typeof v === 'number' ? 'Real' : 'String');

export function fromModel(model, { id = '', author = 'CadCraft', timestamp = '', dataVersion = '1.0.0' } = {}) {
  const issues = [];
  const data = [];
  const schemas = {};
  const used = { ifc: true, prop: false, mat: false, usd: false, nlsfb: false };
  const taken = new Set();
  const want = (path, seed) => { let p = path || uuidFromText(seed); let n = 1; while (taken.has(p)) p = (path || uuidFromText(seed)) + '#' + (++n); taken.add(p); return p; };
  for (const [k, v] of Object.entries(model.schemas || {})) schemas[k] = clone(v);
  const unique = (obj, key) => { let k = key || 'Item', n = 1; while (k in obj) k = (key || 'Item') + ' (' + (++n) + ')'; return k; };

  const pset = (set, values) => {
    const def = (schemas[A.PSET + set] = schemas[A.PSET + set] || { value: { dataType: 'Object', objectRestrictions: { values: {} } } });
    for (const [n, v] of Object.entries(values)) def.value.objectRestrictions.values[n] = def.value.objectRestrictions.values[n] || { dataType: typeOf(v), optional: true };
  };
  const qto = (set, values) => {
    const def = (schemas[A.QTO + set] = schemas[A.QTO + set] || { value: { dataType: 'Object', objectRestrictions: { values: {} } } });
    for (const [n, q] of Object.entries(values)) { const d = { dataType: 'Real', optional: true }; if (q.kind) d.quantityKind = q.kind; def.value.objectRestrictions.values[n] = def.value.objectRestrictions.values[n] || d; }
  };

  /** The attributes common to every node: class, name prop, description, extra. */
  const common = (t, attrs) => {
    if (t.ifcClass) attrs[A.CLASS] = { code: t.ifcClass, uri: IFC_CLASS_URI(t.ifcClass) };
    if (t.nameSource === 'prop' && t.name) { attrs[A.PROP + 'Name'] = t.name; used.prop = true; }
    if (t.description) { attrs[A.PROP + 'Description'] = t.description; used.prop = true; }
    for (const [k, v] of Object.entries(t.extra || {})) { if (k.includes('::')) attrs[k] = clone(v); else attrs[k] = clone(v); }
  };

  const content = (el, attrs) => {
    for (const [set, vals] of Object.entries(el.props || {})) {
      const rest = {};
      for (const [n, v] of Object.entries(vals)) {
        const known = set === 'IFCX' && PROPS[n] && !PROPS[n][1] && n !== 'Name' && n !== 'Description' && typeOf(v) === (PROPS[n][0] === 'Integer' || PROPS[n][0] === 'Real' ? 'Real' : PROPS[n][0]) && (PROPS[n][0] !== 'Integer' || Number.isInteger(v));
        if (known) { attrs[A.PROP + n] = v; used.prop = true; } else if (['string', 'number', 'boolean'].includes(typeof v)) rest[n] = v;
        else issues.push({ level: 'warning', code: 'ifcx.build.prop-type', vars: { set, name: n } });
      }
      if (Object.keys(rest).length) { attrs[A.PSET + set] = rest; pset(set, rest); }
    }
    for (const [set, vals] of Object.entries(el.quantities || {})) {
      const rest = {};
      for (const [n, q] of Object.entries(vals)) {
        if (set === 'IFCX' && PROPS[n] && PROPS[n][1] && (!q.kind || q.kind === PROPS[n][1])) { attrs[A.PROP + n] = q.value; used.prop = true; } else rest[n] = q;
      }
      if (Object.keys(rest).length) { const o = {}; for (const [n, q] of Object.entries(rest)) o[n] = q.value; attrs[A.QTO + set] = o; qto(set, rest); }
    }
    for (const c of el.classifications || []) {
      attrs[c.system + '::class'] = { code: c.code, uri: c.uri || '' };
      if (c.system === 'nlsfb') used.nlsfb = true;
      else if (!schemas[c.system + '::class'] && !KNOWN_CLASS_SYSTEMS[c.system]) schemas[c.system + '::class'] = { value: { dataType: 'Object', objectRestrictions: { values: { code: { dataType: 'String' }, uri: { dataType: 'String' } } } } };
    }
    if (el.material) {
      attrs[A.MATERIAL] = { code: el.material.code, uri: el.material.uri || '' };
      for (const [n, v] of Object.entries(el.material.props || {})) { attrs[A.MATPROP + n] = clone(v); used.mat = true; }
    }
    if (el.color) attrs[A.COLOR] = el.color.slice();
    if (typeof el.opacity === 'number') attrs[A.OPACITY] = el.opacity;
  };

  const emitRaw = (snap, node) => {
    const path = want(snap.id, snap.key);
    node.children[unique(node.children, snap.key)] = path;
    const n = { path, attributes: clone(snap.attributes), children: {} };
    for (const k of Object.keys(n.attributes)) { if (k === A.XFORM || k === A.MESH) used.usd = true; }
    data.push(n);
    for (const c of snap.children) emitRaw(c, n);
    if (!Object.keys(n.children).length) delete n.children;
    if (!Object.keys(n.attributes).length) delete n.attributes;
  };

  const emitElement = (el, parent, byId, parentWorld = IDENT()) => {
    const path = want(el.id, 'element:' + el.name);
    parent.children[unique(parent.children, el.name)] = path;
    const node = { path, children: {}, attributes: {} };
    byId.set(el.id, node);
    byWorld.set(el.id, el.placement || IDENT());
    data.push(node);
    common(el, node.attributes);
    // the model keeps WORLD placements; a node's matrix is relative to its parent (local = world · parent⁻¹)
    const inv = isIdent(parentWorld) ? IDENT() : invRow(parentWorld);
    const local = el.placement && inv ? mulRow(el.placement, inv) : el.placement;
    if (local && !isIdent(local, 1e-15)) { node.attributes[A.XFORM] = { transform: local.map((r) => r.slice()) }; used.usd = true; }
    content(el, node.attributes);
    for (const m of el.meshes || []) {
      const mp = want(m.id, path + ':' + m.key);
      node.children[unique(node.children, m.key || 'Body')] = mp;
      const pts = [];
      for (let i = 0; i < m.positions.length; i += 3) pts.push([m.positions[i], m.positions[i + 1], m.positions[i + 2]]);
      const at = { [A.MESH]: { faceVertexIndices: m.indices.slice(), points: pts } };
      if (m.color && JSON.stringify(m.color) !== JSON.stringify(el.color)) at[A.COLOR] = m.color.slice();
      if (typeof m.opacity === 'number' && m.opacity !== el.opacity) at[A.OPACITY] = m.opacity;
      if (m.hidden) at[A.VISIBILITY] = { visibility: 'invisible' };
      for (const [k, v] of Object.entries(m.extra || {})) at[k] = clone(v);
      data.push({ path: mp, attributes: at });
      used.usd = true;
    }
    for (const r of el.raw || []) emitRaw(r, node);
    return node;
  };
  const spatialNode = (t, parent, seed) => {
    const path = want(t.id, seed);
    if (parent) parent.children[unique(parent.children, t.name)] = path;
    const node = { path, children: {}, attributes: {} };
    data.push(node);
    common(t, node.attributes);
    for (const r of t.raw || []) emitRaw(r, node);
    return node;
  };
  const elements = (list, container, byId, containerWorld = IDENT()) => {
    const pending = [];
    for (const el of list) { if (el.host && byId.has(el.host)) pending.push(el); else emitElement(el, container, byId, containerWorld); }
    // hosted elements go under their host, after it exists (a host that is itself hosted is found on a later pass)
    for (let guard = 0; pending.length && guard < 8; guard++) {
      for (const el of pending.slice()) if (byId.has(el.host)) { emitElement(el, byId.get(el.host), byId, byWorld.get(el.host)); pending.splice(pending.indexOf(el), 1); }
    }
    for (const el of pending) emitElement(el, container, byId, containerWorld);
  };

  const byId = new Map();
  const byWorld = new Map();
  // hosts are emitted first so that hosted elements can nest: order by host depth within each container
  const ordered = (list) => {
    const ids = new Set(list.map((e) => e.id));
    const out = [], left = list.slice();
    for (let g = 0; left.length && g < 10; g++) for (const e of left.slice()) if (!e.host || !ids.has(e.host) || out.some((o) => o.id === e.host)) { out.push(e); left.splice(left.indexOf(e), 1); }
    return out.concat(left);
  };
  // a root with no attributes, then the project under its name (the same shape the examples have)
  const root = { path: want(null, 'root:' + model.project.name), children: {} };
  data.push(root);
  const project = spatialNode(model.project, root, 'project:' + model.project.name);
  project.attributes[A.ALPHA] = { writer: 'CadCraft BimCraft', note: NOTE };
  schemas[A.ALPHA] = { value: { dataType: 'Object', objectRestrictions: { values: { writer: { dataType: 'String' }, note: { dataType: 'String' } } } } };
  for (const s of model.sites) {
    const sn = spatialNode(s, project, 'site:' + s.name);
    elements(ordered(s.elements || []), sn, byId);
    for (const b of s.buildings) {
      const bn = spatialNode(b, sn, 'building:' + b.name);
      elements(ordered(b.elements || []), bn, byId);
      for (const st of b.storeys) {
        const sto = spatialNode(st, bn, 'storey:' + st.name);
        if (st.placement && !isIdent(st.placement)) { sto.attributes[A.XFORM] = { transform: st.placement.map((r) => r.slice()) }; used.usd = true; }
        elements(ordered(st.elements || []), sto, byId, st.placement || IDENT());
      }
    }
  }
  for (const n of data) {
    if (n.children && !Object.keys(n.children).length) delete n.children;
    if (n.attributes && !Object.keys(n.attributes).length) delete n.attributes;
  }
  used.usd = used.usd || data.some((n) => n.attributes && (A.MESH in n.attributes || A.XFORM in n.attributes));
  const imports = ['ifc', 'prop', 'mat', 'usd', 'nlsfb'].filter((k) => used[k]).map((k) => ({ uri: IMPORT_URI[k] }));
  const file = {
    header: { id: id || 'cadcraft/' + String(model.name || 'model').replace(/[^A-Za-z0-9._-]+/g, '_') + '.ifcx', ifcxVersion: 'ifcx_alpha', dataVersion, author, timestamp: timestamp || new Date().toISOString() },
    imports, schemas, data,
  };
  return { file, issues };
}
