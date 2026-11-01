/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library. */
/**
 * access.js — what the IDS facets read from a model opened by cc-ifc (lib/ifc/model.js IfcFile), with the relationships
 * the IDS documentation defines: an occurrence's type, predefined types (USERDEFINED → ObjectType / ElementType /
 * ProcessType; the type's own value wins unless it is NOTDEFINED), property sets merged from the type and the occurrence
 * (the occurrence overrides property by property), quantities, predefined property sets, material and profile
 * properties, classifications up the reference chain (the occurrence overrides its type per system), materials of every
 * kind of set (the occurrence's own, else its type's), the "part of" relations, and project units (values → SI).
 * IFC2X3, IFC4 and IFC4X3 alike: attributes are read by name through the file's schema. DOM-free; one Model per file
 * version, caches inside.
 *
 *   const m = new Model(file)          file = IfcFile (or anything with its type / params / attr / ofType / inverse / schema)
 *   m.typeOf(id) · m.predefined(id) → { value, user } · m.psets(id) → Map(name → { id, props: Map(name → prop) })
 *   m.classifications(id) → [{ system, values: [identification…] }] · m.materials(id) → { has, names: [] }
 *   m.parent(id, relation) → id | null · m.toSI(number, typeName, unitRef) → number · m.value(raw, attrType) → values.js value
 */

const UPPER = (s) => String(s).toUpperCase();

// measure type → the unit type whose project unit converts it (IfcUnitEnum / IfcDerivedUnitEnum names)
const UNIT_OF = {
  IFCPOSITIVELENGTHMEASURE: 'LENGTHUNIT', IFCNONNEGATIVELENGTHMEASURE: 'LENGTHUNIT', IFCLENGTHMEASURE: 'LENGTHUNIT',
  IFCPLANEANGLEMEASURE: 'PLANEANGLEUNIT', IFCPOSITIVEPLANEANGLEMEASURE: 'PLANEANGLEUNIT',
  IFCAREAMEASURE: 'AREAUNIT', IFCVOLUMEMEASURE: 'VOLUMEUNIT', IFCMASSMEASURE: 'MASSUNIT', IFCTIMEMEASURE: 'TIMEUNIT',
  IFCTHERMODYNAMICTEMPERATUREMEASURE: 'THERMODYNAMICTEMPERATUREUNIT', IFCELECTRICCURRENTMEASURE: 'ELECTRICCURRENTUNIT',
  IFCAMOUNTOFSUBSTANCEMEASURE: 'AMOUNTOFSUBSTANCEUNIT', IFCLUMINOUSINTENSITYMEASURE: 'LUMINOUSINTENSITYUNIT', IFCSOLIDANGLEMEASURE: 'SOLIDANGLEUNIT',
  IFCMODULUSOFELASTICITYMEASURE: 'MODULUSOFELASTICITYUNIT', IFCSHEARMODULUSMEASURE: 'SHEARMODULUSUNIT', IFCPLANARFORCEMEASURE: 'PLANARFORCEUNIT',
  IFCSOUNDPRESSUREMEASURE: 'SOUNDPRESSUREUNIT', IFCSOUNDPOWERMEASURE: 'SOUNDPOWERUNIT',
};
const UNITLESS = new Set(['IFCRATIOMEASURE', 'IFCNORMALISEDRATIOMEASURE', 'IFCPOSITIVERATIOMEASURE', 'IFCCOUNTMEASURE', 'IFCNUMERICMEASURE', 'IFCREAL', 'IFCINTEGER',
  'IFCPHMEASURE', 'IFCPARAMETERVALUE', 'IFCCONTEXTDEPENDENTMEASURE', 'IFCDESCRIPTIVEMEASURE', 'IFCSOUNDPOWERLEVELMEASURE', 'IFCSOUNDPRESSURELEVELMEASURE']);
// IfcSIUnit prefixes and the SI base of each unit name (GRAM: the kilogram is the base)
const PREFIX = { EXA: 1e18, PETA: 1e15, TERA: 1e12, GIGA: 1e9, MEGA: 1e6, KILO: 1e3, HECTO: 1e2, DECA: 1e1, DECI: 1e-1, CENTI: 1e-2, MILLI: 1e-3, MICRO: 1e-6, NANO: 1e-9, PICO: 1e-12, FEMTO: 1e-15, ATTO: 1e-18 };
const POWER = { SQUARE_METRE: 2, CUBIC_METRE: 3 };
// quantity classes → the measure their value is
export const QUANTITY_MEASURE = { IFCQUANTITYLENGTH: 'IFCLENGTHMEASURE', IFCQUANTITYAREA: 'IFCAREAMEASURE', IFCQUANTITYVOLUME: 'IFCVOLUMEMEASURE',
  IFCQUANTITYCOUNT: 'IFCCOUNTMEASURE', IFCQUANTITYWEIGHT: 'IFCMASSMEASURE', IFCQUANTITYTIME: 'IFCTIMEMEASURE', IFCQUANTITYNUMBER: 'IFCNUMERICMEASURE' };
const QUANTITY_VALUE = { IFCQUANTITYLENGTH: 'LengthValue', IFCQUANTITYAREA: 'AreaValue', IFCQUANTITYVOLUME: 'VolumeValue', IFCQUANTITYCOUNT: 'CountValue',
  IFCQUANTITYWEIGHT: 'WeightValue', IFCQUANTITYTIME: 'TimeValue', IFCQUANTITYNUMBER: 'NumberValue' };

const isRef = (v) => v && typeof v === 'object' && v.ref !== undefined;
const refs = (v) => (Array.isArray(v) ? v.flatMap(refs) : isRef(v) ? [v.ref] : v && v.typed !== undefined ? refs(v.value) : []);

export class Model {
  constructor(file) {
    this.f = file;
    this.s = file.schema;
    this.schemaName = file.schemaName || this.s.name;
    this.cache = { type: new Map(), psets: new Map(), cls: new Map(), mat: new Map(), pre: new Map() };
    this.units = null;
  }

  type(id) { return this.f.type(id); }
  isA(id, up) { const t = this.f.type(id); return !!t && this.s.isA(t, up); }
  has(up) { return this.s.has(up); }
  attr(id, name) { return this.f.attr(id, name); }
  /** Lines of one relation class that point at id through one attribute (cached by cc-ifc per file version). */
  rels(up, attrName, id) { if (!this.s.has(up)) return []; return this.f.inverse(up, attrName).get(id) || []; }

  // ---- values ----

  /** A raw STEP value → a values.js value. at = the attribute's parsed type ({ agg, base, tname }) when known. */
  value(raw, at = null) {
    if (raw === null || raw === undefined) return null;
    if (raw && raw.derived) return { kind: 'derived', v: null };
    if (Array.isArray(raw)) return { kind: 'list', v: raw.map((x) => this.value(x, at && at.agg > 1 ? { ...at, agg: at.agg - 1 } : at && at.agg === 1 ? { ...at, agg: 0 } : null)).filter(Boolean) };
    if (isRef(raw)) return { kind: 'ref', v: raw.ref };
    if (raw.typed !== undefined) {
      const up = UPPER(raw.typed);
      if (at && at.base === 'S') return { kind: 'select', v: this.typed(up, raw.value).v, type: up, inner: this.typed(up, raw.value) };
      return this.typed(up, raw.value);
    }
    if (raw.enum !== undefined) {
      const base = at ? at.base : 'e';
      if (base === 'b') return { kind: 'boolean', v: raw.enum === 'T', type: at?.tname || 'IFCBOOLEAN' };
      if (base === 'l') return { kind: 'logical', v: raw.enum === 'U' ? 'unknown' : raw.enum === 'T', type: at?.tname || 'IFCLOGICAL' };
      if (raw.enum === 'T' || raw.enum === 'F') { if (!at) return { kind: 'boolean', v: raw.enum === 'T' }; }
      return { kind: 'enum', v: raw.enum, type: at?.tname || null };
    }
    if (raw.bin !== undefined) return { kind: 'binary', v: raw.bin };
    if (typeof raw === 'string') return { kind: 'string', v: raw, type: at?.tname || null };
    if (typeof raw === 'number') return { kind: at && at.base === 'i' ? 'integer' : 'real', v: raw, type: at?.tname || null };
    return null;
  }
  /** A value written with its defined type, IFCLABEL('x') → { kind, v, type }. */
  typed(up, inner) {
    let code = this.s.typeCode(up) || '';
    const agg = code.startsWith('[');
    code = code.replace(/^\[+/, '');
    if (agg || Array.isArray(inner)) return { kind: 'list', v: (Array.isArray(inner) ? inner : [inner]).map((x) => this.value(x)), type: up };
    switch (code) {
      case 's': return { kind: 'string', v: typeof inner === 'string' ? inner : String(inner ?? ''), type: up };
      case 'r': case 'n': return { kind: 'real', v: Number(inner), type: up };
      case 'i': return { kind: 'integer', v: Number(inner), type: up };
      case 'b': return { kind: 'boolean', v: inner && inner.enum === 'T', type: up };
      case 'l': return { kind: 'logical', v: inner && inner.enum === 'U' ? 'unknown' : !!(inner && inner.enum === 'T'), type: up };
      case 'e': return { kind: 'enum', v: inner && inner.enum !== undefined ? inner.enum : String(inner), type: up };
      default:
        if (typeof inner === 'string') return { kind: 'string', v: inner, type: up };
        if (typeof inner === 'number') return { kind: 'real', v: inner, type: up };
        if (inner && inner.enum !== undefined) return { kind: 'enum', v: inner.enum, type: up };
        return { kind: 'other', v: null, type: up };
    }
  }
  /** "Has a value" in IDS terms: not null, not an empty string, not an empty list, not a logical unknown, not derived. */
  static present(val) {
    if (!val) return false;
    if (val.kind === 'derived') return false;
    if (val.kind === 'string' && val.v === '') return false;
    if (val.kind === 'list') return val.v.length > 0;
    if (val.kind === 'logical' && val.v === 'unknown') return false;
    if (val.kind === 'other') return false;
    return true;
  }
  /** An explicit attribute's value (null when the entity has no such attribute: undefined). */
  attrValue(id, name) {
    const t = this.f.type(id);
    const e = t && this.s.entity(t);
    if (!e) return undefined;
    const k = e.index.get(name);
    if (k === undefined) return undefined;
    return this.value(this.f.params(id)?.[k], e.attrs[k].t);
  }
  /** Explicit attribute names of the line's class (derived-redeclared ones included; their value reads as derived). */
  attrNames(id) { const t = this.f.type(id); const e = t && this.s.entity(t); return e ? e.attrs.map((a) => a.name) : []; }
  str(id, name) { const v = this.f.attr(id, name); return typeof v === 'string' ? v : v && v.typed !== undefined && typeof v.value === 'string' ? v.value : null; }

  // ---- types and predefined types ----

  /** The type object an occurrence is defined by (IfcRelDefinesByType), or null. */
  typeOf(id) {
    let t = this.cache.type.get(id);
    if (t !== undefined) return t;
    t = null;
    for (const r of this.rels('IFCRELDEFINESBYTYPE', 'RelatedObjects', id)) { const x = this.f.attr(r, 'RelatingType'); if (isRef(x)) { t = x.ref; break; } }
    this.cache.type.set(id, t);
    return t;
  }
  /**
   * The predefined type: { value: 'SOLIDWALL' | 'USERDEFINED' | …, user: 'the user-defined name' | null } or null when none.
   * The type's own predefined type wins unless it is NOTDEFINED or unset; USERDEFINED reads ElementType / ProcessType /
   * ResourceType (a type) or ObjectType (an occurrence).
   */
  predefined(id) {
    if (this.cache.pre.has(id)) return this.cache.pre.get(id);
    const own = (x) => {
      const v = this.f.attr(x, 'PredefinedType');
      const value = v && v.enum !== undefined ? v.enum : null;
      if (!value) return null;
      let user = null;
      if (value === 'USERDEFINED') for (const n of ['ElementType', 'ProcessType', 'ResourceType', 'ObjectType']) { const s = this.str(x, n); if (s) { user = s; break; } }
      return { value, user };
    };
    let res = null;
    const t = this.typeOf(id);
    if (t !== null) { const tp = own(t); if (tp && tp.value !== 'NOTDEFINED') res = tp; }
    if (!res) res = own(id);
    this.cache.pre.set(id, res);
    return res;
  }
  /** The class name an IFC2X3 occurrence stands for through its type (IFCFLOWTERMINAL typed by IFCAIRTERMINALTYPE → IFCAIRTERMINAL). */
  occurrenceClassFromType(id) {
    const t = this.typeOf(id);
    if (t === null) return null;
    const tn = this.f.type(t) || '';
    return tn.replace(/TYPE$/, '').replace(/STYLE$/, '');
  }

  // ---- property sets ----

  /** Map(pset name → { id, kind, props: Map(name → prop) }): the type's sets first, then the occurrence's own, property by property. */
  psets(id) {
    let out = this.cache.psets.get(id);
    if (out) return out;
    out = new Map();
    const add = (psetId) => {
      const p = this.readPset(psetId);
      if (!p) return;
      const have = out.get(p.name);
      if (!have) { out.set(p.name, { id: psetId, kind: p.kind, props: new Map(p.props) }); return; }
      for (const [k, v] of p.props) have.props.set(k, v);
    };
    const isType = this.isA(id, 'IFCTYPEOBJECT');
    const t = isType ? null : this.typeOf(id);
    if (isType || t !== null) for (const r of refs(this.f.attr(isType ? id : t, 'HasPropertySets'))) add(r);
    for (const rel of this.rels('IFCRELDEFINESBYPROPERTIES', 'RelatedObjects', id)) for (const r of refs(this.f.attr(rel, 'RelatingPropertyDefinition'))) add(r);
    // IFC2X3 kept a type's relation the other way round too: IfcRelDefinesByProperties never names a type there, so nothing else to read
    if (this.isA(id, 'IFCMATERIALDEFINITION') || this.isA(id, 'IFCMATERIAL')) for (const mp of this.rels('IFCMATERIALPROPERTIES', 'Material', id)) add(mp);
    if (this.isA(id, 'IFCPROFILEDEF')) for (const pp of this.rels('IFCPROFILEPROPERTIES', 'ProfileDefinition', id)) add(pp);
    this.cache.psets.set(id, out);
    return out;
  }
  /** One property set line → { name, kind: 'pset' | 'qto' | 'predefined' | 'material', props: Map } or null. */
  readPset(psetId) {
    const t = this.f.type(psetId);
    if (!t) return null;
    const props = new Map();
    if (this.s.isA(t, 'IFCPROPERTYSET')) {
      for (const r of refs(this.f.attr(psetId, 'HasProperties'))) { const p = this.readProp(r); if (p) props.set(p.name, p); }
      return { name: this.str(psetId, 'Name') ?? '', kind: 'pset', props };
    }
    if (this.s.isA(t, 'IFCELEMENTQUANTITY')) {
      for (const r of refs(this.f.attr(psetId, 'Quantities'))) { const p = this.readProp(r); if (p) props.set(p.name, p); }
      return { name: this.str(psetId, 'Name') ?? '', kind: 'qto', props };
    }
    if (this.s.isA(t, 'IFCMATERIALPROPERTIES') || this.s.isA(t, 'IFCPROFILEPROPERTIES') || this.s.isA(t, 'IFCEXTENDEDPROPERTIES')) {
      const list = this.f.attr(psetId, 'Properties') ?? this.f.attr(psetId, 'ExtendedProperties');
      if (list === undefined) return null;   // IFC2X3's fixed material property classes are not property sets IDS reads
      for (const r of refs(list)) { const p = this.readProp(r); if (p) props.set(p.name, p); }
      return { name: this.str(psetId, 'Name') ?? '', kind: 'material', props };
    }
    if (this.s.isA(t, 'IFCPROPERTYSETDEFINITION')) {
      // a predefined property set (IfcDoorPanelProperties …): its own attributes after IfcRoot's four are its properties
      const e = this.s.entity(t);
      const ps = this.f.params(psetId) || [];
      e.attrs.forEach((a, k) => {
        if (k < 4 || a.t.base === 'E') return;
        const val = this.value(ps[k], a.t);
        props.set(a.name, { name: a.name, kind: 'predefined', values: val ? [val] : [], unitRef: null });
      });
      return { name: this.str(psetId, 'Name') ?? '', kind: 'predefined', props };
    }
    return null;
  }
  /** One property / quantity line → { name, kind, values: [value], unitRef, bounds? } (kind 'complex' / 'reference' = not supported by IDS). */
  readProp(pid) {
    const t = this.f.type(pid);
    if (!t) return null;
    const name = this.str(pid, 'Name') ?? '';
    const v = (raw) => this.value(raw);
    const unit = (n) => { const u = this.f.attr(pid, n); return isRef(u) ? u.ref : null; };
    switch (t) {
      case 'IFCPROPERTYSINGLEVALUE': { const x = v(this.f.attr(pid, 'NominalValue')); return { name, kind: 'single', values: x ? [x] : [], unitRef: unit('Unit') }; }
      case 'IFCPROPERTYENUMERATEDVALUE': { const x = v(this.f.attr(pid, 'EnumerationValues')); return { name, kind: 'enumerated', values: x?.kind === 'list' ? x.v : x ? [x] : [], unitRef: null }; }
      case 'IFCPROPERTYLISTVALUE': { const x = v(this.f.attr(pid, 'ListValues')); return { name, kind: 'list', values: x?.kind === 'list' ? x.v : x ? [x] : [], unitRef: unit('Unit') }; }
      case 'IFCPROPERTYBOUNDEDVALUE': {
        const up = v(this.f.attr(pid, 'UpperBoundValue')), lo = v(this.f.attr(pid, 'LowerBoundValue')), sp = v(this.f.attr(pid, 'SetPointValue'));
        return { name, kind: 'bounded', values: [up, lo, sp].filter(Boolean), bounds: { upper: up, lower: lo, set: sp }, unitRef: unit('Unit') };
      }
      case 'IFCPROPERTYTABLEVALUE': {
        const a = v(this.f.attr(pid, 'DefiningValues')), b = v(this.f.attr(pid, 'DefinedValues'));
        const du = unit('DefiningUnit'), eu = unit('DefinedUnit');
        const tag = (x, u) => (x?.kind === 'list' ? x.v : x ? [x] : []).map((y) => ({ ...y, unitRef: u }));
        return { name, kind: 'table', values: [...tag(a, du), ...tag(b, eu)], unitRef: null };
      }
      case 'IFCPROPERTYREFERENCEVALUE': return { name, kind: 'reference', values: [], unitRef: null };
      default:
        if (QUANTITY_VALUE[t]) {
          const raw = this.f.attr(pid, QUANTITY_VALUE[t]);
          const measure = QUANTITY_MEASURE[t];
          const x = raw === null || raw === undefined ? null : { kind: measure === 'IFCCOUNTMEASURE' && this.s.typeCode('IFCCOUNTMEASURE') === 'i' ? 'integer' : 'real', v: Number(raw && raw.typed !== undefined ? raw.value : raw), type: measure };
          return { name, kind: 'quantity', values: x ? [x] : [], unitRef: unit('Unit') };
        }
        if (this.s.isA(t, 'IFCCOMPLEXPROPERTY') || this.s.isA(t, 'IFCPHYSICALCOMPLEXQUANTITY')) return { name, kind: 'complex', values: [], unitRef: null };
        return { name, kind: 'other', values: [], unitRef: null };
    }
  }

  // ---- units ----

  /** A number of measure `type` in the file's units (or the property's own unit) → the SI unit IDS compares in. */
  toSI(x, type, unitRef = null) {
    const up = type ? UPPER(type) : '';
    if (!up || UNITLESS.has(up) || !Number.isFinite(x)) return x;
    let conv = unitRef !== null ? this.unitFactor(unitRef) : null;
    if (!conv) {
      const ut = UNIT_OF[up] || (up.endsWith('MEASURE') ? up.slice(0, -7) + 'UNIT' : '');
      conv = this.projectUnits().get(ut.replace(/^IFC/, '')) || null;
    }
    if (!conv) return x;
    return (x + conv.offset) * conv.factor + conv.add;
  }
  /** The project's units: Map(unit type → { factor, offset, add }) from IfcProject.UnitsInContext. */
  projectUnits() {
    if (this.units) return this.units;
    const m = new Map();
    const projects = this.has('IFCPROJECT') ? this.f.ofType('IFCPROJECT', true) : [];
    for (const p of projects) {
      const ua = this.f.attr(p, 'UnitsInContext');
      if (!isRef(ua)) continue;
      for (const u of refs(this.f.attr(ua.ref, 'Units'))) {
        const ut = this.f.attr(u, 'UnitType');
        const key = ut && ut.enum !== undefined ? ut.enum : null;
        if (!key || key === 'USERDEFINED') continue;
        const c = this.unitFactor(u);
        if (c && !m.has(key)) m.set(key, c);
      }
      break;
    }
    this.units = m;
    return m;
  }
  /** One unit line → { factor, offset, add }: value_SI = (value + offset) · factor + add; null when it cannot be worked out. */
  unitFactor(u, depth = 0) {
    if (depth > 8) return null;
    const t = this.f.type(u);
    if (!t) return null;
    if (t === 'IFCSIUNIT') {
      const pre = this.f.attr(u, 'Prefix'), nm = this.f.attr(u, 'Name');
      const name = nm && nm.enum !== undefined ? nm.enum : '';
      const p = pre && pre.enum !== undefined ? PREFIX[pre.enum] ?? 1 : 1;
      const factor = Math.pow(p, POWER[name] || 1) * (name === 'GRAM' ? 1e-3 : 1);
      return { factor, offset: 0, add: name === 'DEGREE_CELSIUS' ? 273.15 : 0 };
    }
    if (this.s.isA(t, 'IFCCONVERSIONBASEDUNIT')) {
      const mw = this.f.attr(u, 'ConversionFactor');
      if (!isRef(mw)) return null;
      const vc = this.f.attr(mw.ref, 'ValueComponent'), uc = this.f.attr(mw.ref, 'UnitComponent');
      const k = Number(vc && vc.typed !== undefined ? vc.value : vc);
      const base = isRef(uc) ? this.unitFactor(uc.ref, depth + 1) : { factor: 1, offset: 0, add: 0 };
      if (!base || !Number.isFinite(k)) return null;
      // IFC: "0 °C equals 273.15 K: the offset is −273.15", so base = (x − ConversionOffset) · k; then SI by the base's own rule
      const off = t === 'IFCCONVERSIONBASEDUNITWITHOFFSET' ? Number(this.f.attr(u, 'ConversionOffset')) || 0 : 0;
      return { factor: k * base.factor, offset: -off, add: base.add + base.offset * base.factor };
    }
    if (t === 'IFCDERIVEDUNIT') {
      let f = 1;
      for (const el of refs(this.f.attr(u, 'Elements'))) {
        const nu = this.f.attr(el, 'Unit'), ex = Number(this.f.attr(el, 'Exponent'));
        const c = isRef(nu) ? this.unitFactor(nu.ref, depth + 1) : null;
        if (!c || !Number.isFinite(ex)) return null;
        f *= Math.pow(c.factor, ex);
      }
      return { factor: f, offset: 0, add: 0 };
    }
    return null;   // IfcContextDependentUnit, IfcMonetaryUnit: no conversion known
  }

  // ---- classifications ----

  /** [{ system, values }] of one object: references (and classifications associated directly), the occurrence's own replacing its type's per system. */
  classifications(id) {
    let out = this.cache.cls.get(id);
    if (out) return out;
    const own = this.ownClassifications(id);
    const t = this.isA(id, 'IFCTYPEOBJECT') ? null : this.typeOf(id);
    if (t !== null) {
      const systems = new Set(own.map((c) => c.system));
      for (const c of this.ownClassifications(t)) if (!systems.has(c.system)) own.push(c);
    }
    this.cache.cls.set(id, own);
    return own;
  }
  ownClassifications(id) {
    const leaves = [];
    for (const rel of this.rels('IFCRELASSOCIATESCLASSIFICATION', 'RelatedObjects', id)) for (const r of refs(this.f.attr(rel, 'RelatingClassification'))) leaves.push(r);
    // IFC4: resources (materials, profiles …) are classified through IfcExternalReferenceRelationship
    for (const rel of this.rels('IFCEXTERNALREFERENCERELATIONSHIP', 'RelatedResourceObjects', id)) for (const r of refs(this.f.attr(rel, 'RelatingReference'))) leaves.push(r);
    const out = [];
    for (const leaf of leaves) {
      const t = this.f.type(leaf);
      if (t === 'IFCCLASSIFICATION') {
        const name = this.str(leaf, 'Name');
        if (name === null) continue;   // a classification with no name says nothing: as if absent
        out.push({ system: name, values: [name] });
        continue;
      }
      if (!t || !this.s.isA(t, 'IFCCLASSIFICATIONREFERENCE')) continue;
      const values = [];
      let system = null, at = leaf;
      for (let guard = 0; at !== null && guard < 64; guard++) {
        const tt = this.f.type(at);
        if (tt === 'IFCCLASSIFICATION') { system = this.str(at, 'Name'); break; }
        if (!tt || !this.s.isA(tt, 'IFCCLASSIFICATIONREFERENCE')) break;
        const code = this.str(at, 'Identification') ?? this.str(at, 'ItemReference');
        if (code !== null) values.push(code);
        const src = this.f.attr(at, 'ReferencedSource');
        at = isRef(src) ? src.ref : null;
      }
      out.push({ system, values });
    }
    return out;
  }

  // ---- materials ----

  /** { has: an association exists, names: every material / set / layer / profile / constituent name and category } — the occurrence's own, else its type's. */
  materials(id) {
    let out = this.cache.mat.get(id);
    if (out) return out;
    const read = (x) => {
      const rel = this.rels('IFCRELASSOCIATESMATERIAL', 'RelatedObjects', x);
      if (!rel.length) return null;
      const names = [];
      const seen = new Set();
      const walk = (m, depth) => {
        if (m === null || depth > 8 || seen.has(m)) return;
        seen.add(m);
        const t = this.f.type(m);
        if (!t) return;
        const push = (n) => { const s = this.str(m, n); if (s !== null && s !== '') names.push(s); };
        const sub = (n) => { for (const r of refs(this.f.attr(m, n))) walk(r, depth + 1); };
        if (t === 'IFCMATERIAL') { push('Name'); push('Category'); return; }
        if (t === 'IFCMATERIALLIST') { sub('Materials'); return; }
        if (t === 'IFCMATERIALLAYERSETUSAGE') { sub('ForLayerSet'); return; }
        if (t === 'IFCMATERIALLAYERSET') { push('LayerSetName'); push('Name'); sub('MaterialLayers'); return; }
        if (this.s.isA(t, 'IFCMATERIALLAYER')) { push('Name'); push('Category'); sub('Material'); return; }
        if (this.s.isA(t, 'IFCMATERIALPROFILESETUSAGE')) { sub('ForProfileSet'); sub('ForProfileEndSet'); return; }
        if (t === 'IFCMATERIALPROFILESET') { push('Name'); sub('MaterialProfiles'); return; }
        if (this.s.isA(t, 'IFCMATERIALPROFILE')) { push('Name'); push('Category'); sub('Material'); return; }
        if (t === 'IFCMATERIALCONSTITUENTSET') { push('Name'); sub('MaterialConstituents'); return; }
        if (t === 'IFCMATERIALCONSTITUENT') { push('Name'); push('Category'); sub('Material'); return; }
      };
      for (const r of rel) for (const m of refs(this.f.attr(r, 'RelatingMaterial'))) walk(m, 0);
      return { has: true, names };
    };
    out = read(id);
    if (!out) { const t = this.isA(id, 'IFCTYPEOBJECT') ? null : this.typeOf(id); out = (t !== null && read(t)) || { has: false, names: [] }; }
    this.cache.mat.set(id, out);
    return out;
  }

  // ---- part of ----

  /** The whole an object is part of through one relation (or any of them, '' = aggregate → nest → container → voided host → group), or null. */
  parent(id, relation = '') {
    const one = (up, attrName, whole) => { for (const r of this.rels(up, attrName, id)) { const w = this.f.attr(r, whole); if (isRef(w)) return w.ref; } return null; };
    switch (relation) {
      case 'IFCRELAGGREGATES': return one('IFCRELAGGREGATES', 'RelatedObjects', 'RelatingObject');
      case 'IFCRELNESTS': return one('IFCRELNESTS', 'RelatedObjects', 'RelatingObject');
      case 'IFCRELCONTAINEDINSPATIALSTRUCTURE': return one('IFCRELCONTAINEDINSPATIALSTRUCTURE', 'RelatedElements', 'RelatingStructure');
      case 'IFCRELASSIGNSTOGROUP': return one('IFCRELASSIGNSTOGROUP', 'RelatedObjects', 'RelatingGroup');
      case 'IFCRELVOIDSELEMENT IFCRELFILLSELEMENT': {
        if (this.isA(id, 'IFCOPENINGELEMENT')) return one('IFCRELVOIDSELEMENT', 'RelatedOpeningElement', 'RelatingBuildingElement');
        const opening = one('IFCRELFILLSELEMENT', 'RelatedBuildingElement', 'RelatingOpeningElement');
        if (opening === null) return null;
        for (const r of this.rels('IFCRELVOIDSELEMENT', 'RelatedOpeningElement', opening)) { const w = this.f.attr(r, 'RelatingBuildingElement'); if (isRef(w)) return w.ref; }
        return null;
      }
      default:
        return this.parent(id, 'IFCRELAGGREGATES') ?? this.parent(id, 'IFCRELNESTS') ?? this.parent(id, 'IFCRELCONTAINEDINSPATIALSTRUCTURE')
          ?? this.parent(id, 'IFCRELVOIDSELEMENT IFCRELFILLSELEMENT') ?? this.parent(id, 'IFCRELASSIGNSTOGROUP');
    }
  }

  /** GlobalId, Name and class of a line (for the report): { guid, name, type: 'IFCWALL', cls: 'IfcWall' }. */
  label(id) { const type = this.f.type(id) || ''; return { guid: this.str(id, 'GlobalId') || '', name: this.str(id, 'Name') || '', type, cls: (type && this.s.pretty(type)) || type }; }
}
