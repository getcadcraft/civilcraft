/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc.mjs — BimCraft's IFC questions without a screen (docs/AGENTS-SPEC.md §2), on cc-ifc (lib/ifc, Apache-2.0; the engine
 * BimCraft and DetailCraft switch to). Properties only: no geometry is built, so a 200 MB model answers in seconds.
 *
 *   const s = await IfcSession.open(bytes, 'House.ifc');
 *   s.summary()                              → {schema, project, storeys[], classes{}, elements}
 *   s.query({cls: 'IfcWall', storey, name, property: {set, name, equals|contains}, offset, limit})
 *   await s.properties(id)                   → attributes + property sets + quantities (type sets included)
 * IFC edits (0.6 DF.25, session `bim-draw`): BimCraft's own Draw ops, through its build's IfcEditor (apps.mjs, never a copy):
 *   await IfcSession.blank({ name, levels, height })  a new building as BimCraft's File › New building makes it
 *   await s.editor()                         → the IfcEditor on this model (made on first use)
 *   await s.apply(label, op)                 → the op's result; one undo step "<undoPrefix><label>"; the index follows
 *   await s.undo(steps, { any })             → labels undone (only "Assistant:" steps unless any)
 *   await s.save()                           → bytes of the model with every change
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { libDir, load } from './apps.mjs';

let L = null;
async function lib() {
  if (L) return L;
  const dir = libDir('ifc');
  const [api, model] = await Promise.all([import(pathToFileURL(path.join(dir, 'api.js')).href), import(pathToFileURL(path.join(dir, 'model.js')).href)]);
  L = { api, IfcFile: model.IfcFile };
  return L;
}

/** A cc-ifc value ({type, value} / Handle / list) → plain JSON. */
function val(v) {
  if (v === null || v === undefined) return null;
  if (Array.isArray(v)) return v.map(val);
  if (typeof v !== 'object') return v;
  if (v.type === 5 && 'value' in v) return { ref: v.value };
  if ('value' in v && Object.keys(v).every((k) => ['type', 'name', 'value', 'label', 'valueType', 'derived'].includes(k))) {
    const x = v.value;
    return typeof x === 'string' ? decodeIfcString(x) : x;
  }
  return null;
}

/** IFC string escapes (\X2\…\X0\, \X\hh, \S\c) → text. */
export function decodeIfcString(s) {
  if (typeof s !== 'string' || !s.includes('\\')) return s;
  return s
    .replace(/\\X2\\([0-9A-F]+)\\X0\\/gi, (_, h) => h.match(/.{4}/g).map((c) => String.fromCharCode(parseInt(c, 16))).join(''))
    .replace(/\\X\\([0-9A-F]{2})/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/\\S\\(.)/g, (_, c) => String.fromCharCode(c.charCodeAt(0) + 128));
}

export class IfcSession {
  static async open(bytes, name = 'model.ifc') {
    const { api } = await lib();
    const ifc = new api.IfcAPI();
    const mid = ifc.OpenModel(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
    if (mid < 0) throw new Error('"' + name + '" could not be read as IFC (ISO 10303-21).');
    const s = new IfcSession(ifc, mid, name);
    s.index();
    return s;
  }

  constructor(ifc, mid, name) {
    this.ifc = ifc;
    this.mid = mid;
    this.name = name;
    this.f = ifc.file(mid);
    this.ed = null;
    this.undoPrefix = 'Assistant: ';
  }

  /** A new building (n levels of `height` mm), as BimCraft's File › New building writes it. */
  static async blank({ name = 'Building', levels = 2, height = 3000 } = {}) {
    const N = await load('bimcraft', 'new-model.js');
    const text = N.newBuilding({ name, levels: N.stackLevels(levels, height, (i) => 'Level ' + (i + 1)), fileName: name + '.ifc' });
    const s = await IfcSession.open(new TextEncoder().encode(text), name + '.ifc');
    (await s.editor()).isNew = true;
    return s;
  }
  async editor() {
    if (this.ed) return this.ed;
    const [{ IfcEditor }, { api }] = await Promise.all([load('bimcraft', 'ifc-edit.js'), lib()]);
    this.ed = new IfcEditor(api, { api: this.ifc, modelID: this.mid });
    return this.ed;
  }
  async apply(label, op) {
    const ed = await this.editor();
    const r = ed.modelChange(op, { label: this.undoPrefix + label });
    this.index();
    return r;
  }
  async undo(steps = 1, { any = false } = {}) {
    const ed = await this.editor(), out = [];
    for (let i = 0; i < steps; i++) {
      const top = ed.changes[ed.changes.length - 1];
      if (!top) break;
      const label = top.label || top.kind;
      if (!any && !String(label).startsWith(this.undoPrefix)) { if (!out.length) throw new Error('The last change is not the assistant\'s ("' + label + '"): pass any: true to undo it.'); break; }
      ed.undo();
      out.push(label);
    }
    this.index();
    return out;
  }
  async save() { return (await this.editor()).save(); }

  pretty(id) { const up = this.f.type(id); return (up && this.f.schema.pretty(up)) || up || null; }
  str(id, attr) { try { return val(this.f.attr(id, attr)) ?? null; } catch { return null; } }
  attrText(id, attr) {
    const a = this.f.attr(id, attr);
    if (a === null || a === undefined) return null;
    if (typeof a === 'string') return decodeIfcString(a);
    if (typeof a === 'object' && 'typed' in a) return decodeIfcString(String(a.value));
    if (typeof a === 'object' && 'enum' in a) return a.enum;
    return typeof a === 'number' ? a : null;
  }

  /** Elements, their storey and type, once. */
  index() {
    const f = this.f;
    const ids = new Set([...f.ofType('IFCELEMENT', true), ...f.ofType('IFCSPACE', true)]);
    if (f.schema.has?.('IFCELEMENT') === false) for (const id of f.ofType('IFCPRODUCT', true)) ids.add(id);
    this.elements = [...ids].sort((a, b) => a - b);
    // storey: contained directly, else through what it is part of (an assembly, a space)
    const container = new Map();
    for (const r of f.ofType('IFCRELCONTAINEDINSPATIALSTRUCTURE', true)) {
      const st = f.attr(r, 'RelatingStructure');
      for (const x of f.attr(r, 'RelatedElements') || []) if (x && x.ref && st && st.ref) container.set(x.ref, st.ref);
    }
    const parent = new Map();
    for (const r of f.ofType('IFCRELAGGREGATES', true)) {
      const p = f.attr(r, 'RelatingObject');
      for (const x of f.attr(r, 'RelatedObjects') || []) if (x && x.ref && p && p.ref) parent.set(x.ref, p.ref);
    }
    for (const r of f.ofType('IFCRELNESTS', true)) {
      const p = f.attr(r, 'RelatingObject');
      for (const x of f.attr(r, 'RelatedObjects') || []) if (x && x.ref && p && p.ref && !parent.has(x.ref)) parent.set(x.ref, p.ref);
    }
    const storeys = new Set(f.ofType('IFCBUILDINGSTOREY', true));
    this.storeyIds = [...storeys];
    this.storeyOf = (id) => {
      for (let cur = id, n = 0; cur && n < 32; n++) {
        if (storeys.has(cur)) return cur;
        cur = container.get(cur) ?? parent.get(cur);
      }
      return null;
    };
    const typeOf = new Map();
    for (const r of f.ofType('IFCRELDEFINESBYTYPE', true)) {
      const t = f.attr(r, 'RelatingType');
      for (const x of f.attr(r, 'RelatedObjects') || []) if (x && x.ref && t && t.ref) typeOf.set(x.ref, t.ref);
    }
    this.typeOf = typeOf;
  }

  row(id) {
    const st = this.storeyOf(id), ty = this.typeOf.get(id);
    return { id, guid: this.attrText(id, 'GlobalId'), class: this.pretty(id), name: this.attrText(id, 'Name'), objectType: this.attrText(id, 'ObjectType'),
      storey: st ? this.attrText(st, 'Name') : null, type: ty ? { id: ty, class: this.pretty(ty), name: this.attrText(ty, 'Name') } : null };
  }

  summary() {
    const f = this.f, classes = {};
    for (const id of this.elements) { const c = this.pretty(id); classes[c] = (classes[c] || 0) + 1; }
    const proj = f.ofType('IFCPROJECT', true)[0];
    const perStorey = new Map();
    for (const id of this.elements) { const s = this.storeyOf(id); perStorey.set(s, (perStorey.get(s) || 0) + 1); }
    const elev = (id) => { const e = this.attrText(id, 'Elevation'); return typeof e === 'number' ? e : null; };
    return {
      file: this.name, schema: f.schemaName,
      project: proj !== undefined ? { id: proj, name: this.attrText(proj, 'Name'), longName: this.attrText(proj, 'LongName') } : null,
      application: this.application(),
      storeys: this.storeyIds.map((id) => ({ id, name: this.attrText(id, 'Name'), elevation: elev(id), elements: perStorey.get(id) || 0 })).sort((a, b) => (a.elevation ?? 0) - (b.elevation ?? 0)),
      classes: Object.fromEntries(Object.entries(classes).sort((a, b) => b[1] - a[1])), elements: this.elements.length,
      notInAStorey: perStorey.get(null) || 0,
    };
  }

  application() {
    const f = this.f;
    const app = f.ofType('IFCAPPLICATION', true)[0];
    return app !== undefined ? [this.attrText(app, 'ApplicationFullName'), this.attrText(app, 'Version')].filter(Boolean).join(' ') || null : null;
  }

  /** Flat property sets (and quantities) of one line: {set: {name: value}}. */
  async psets(id) {
    const out = {};
    const add = (ps) => {
      if (!ps) return;
      const setName = val(ps.Name) || ('#' + ps.expressID);
      const vals = out[setName] || (out[setName] = {});
      for (const p of ps.HasProperties || []) {
        if (!p) continue;
        const n = val(p.Name);
        if (!n) continue;
        if (p.NominalValue !== undefined) vals[n] = val(p.NominalValue);
        else if (p.EnumerationValues) vals[n] = val(p.EnumerationValues);
        else if (p.ListValues) vals[n] = val(p.ListValues);
        else if (p.UpperBoundValue !== undefined || p.LowerBoundValue !== undefined) vals[n] = { lower: val(p.LowerBoundValue), upper: val(p.UpperBoundValue) };
        else vals[n] = null;
      }
      for (const q of ps.Quantities || []) {
        if (!q) continue;
        const n = val(q.Name);
        const k = Object.keys(q).find((x) => /Value$/.test(x) && x !== 'Formula');
        if (n) vals[n] = k ? val(q[k]) : null;
      }
    };
    const p = this.ifc.properties;
    for (const ps of await p.getPropertySets(this.mid, id, true)) add(ps);
    return out;
  }

  async properties(id) {
    const f = this.f;
    if (!f.type(id)) throw new Error('There is no line #' + id + ' in this model.');
    const line = this.ifc.GetLine(this.mid, id, false);
    const attributes = {};
    for (const [k, v] of Object.entries(line)) if (!['expressID', 'type'].includes(k)) attributes[k] = val(v);
    const own = await this.psets(id);
    const ty = this.typeOf.get(id);
    const typeSets = ty ? await this.typeSets(ty) : {};
    return { ...this.row(id), attributes, propertySets: own, typePropertySets: typeSets };
  }

  /** A type's own HasPropertySets. */
  async typeSets(ty) {
    const out = {};
    const line = this.ifc.GetLine(this.mid, ty, true);
    for (const ps of line.HasPropertySets || []) {
      if (!ps || !ps.Name) continue;
      const vals = out[val(ps.Name)] = {};
      for (const p of ps.HasProperties || []) if (p && p.Name) vals[val(p.Name)] = p.NominalValue !== undefined ? val(p.NominalValue) : null;
      for (const q of ps.Quantities || []) { if (!q || !q.Name) continue; const k = Object.keys(q).find((x) => /Value$/.test(x)); vals[val(q.Name)] = k ? val(q[k]) : null; }
    }
    return out;
  }

  /** Find elements. property = {set?, name, equals?, contains?} (type property sets count too). */
  async query({ cls = null, storey = null, name = null, property = null, offset = 0, limit = 100 } = {}) {
    const want = cls ? String(cls).toUpperCase() : null;
    const f = this.f;
    let wantSet = null;
    if (want) {
      if (!f.schema.has?.(want) && !this.elements.some((id) => f.type(id) === want)) throw new Error('No class ' + cls + ' in ' + f.schemaName + '.');
      wantSet = new Set(f.ofType(want, true));
    }
    const nm = name ? String(name).toLowerCase() : null;
    const st = storey ? String(storey).toLowerCase() : null;
    const hits = [];
    for (const id of this.elements) {
      if (wantSet && !wantSet.has(id)) continue;
      if (nm && !String(this.attrText(id, 'Name') || '').toLowerCase().includes(nm)) continue;
      if (st) { const s = this.storeyOf(id); if (!s || String(this.attrText(s, 'Name') || '').toLowerCase() !== st) continue; }
      hits.push(id);
    }
    let ids = hits;
    if (property && property.name) {
      const pn = String(property.name).toLowerCase(), ps = property.set ? String(property.set).toLowerCase() : null;
      const match = (v) => {
        if (property.equals !== undefined) return String(v).toLowerCase() === String(property.equals).toLowerCase() || (typeof v === 'number' && Number(property.equals) === v);
        if (property.contains !== undefined) return String(v).toLowerCase().includes(String(property.contains).toLowerCase());
        return v !== undefined;
      };
      const keep = [];
      for (const id of ids) {
        const sets = { ...(await this.psets(id)) };
        const ty = this.typeOf.get(id);
        if (ty) for (const [k, v] of Object.entries(await this.typeSets(ty))) sets[k] = { ...v, ...(sets[k] || {}) };
        let ok = false;
        for (const [sn, vals] of Object.entries(sets)) {
          if (ps && sn.toLowerCase() !== ps) continue;
          for (const [k, v] of Object.entries(vals)) if (k.toLowerCase() === pn && match(v)) { ok = true; break; }
          if (ok) break;
        }
        if (ok) keep.push(id);
      }
      ids = keep;
    }
    return { total: ids.length, offset, elements: ids.slice(offset, offset + limit).map((id) => this.row(id)) };
  }
}
