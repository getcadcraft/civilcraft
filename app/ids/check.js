/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; results are codes and the file's own names (an app words them). */
/**
 * check.js — checks an IFC model against an IDS (IDS 1.0 semantics; conformance: bin/test-ids.mjs runs buildingSMART's
 * test cases). DOM-free.
 *
 *   checkIds(ids, file, { maxFailures = 20000, now }) → result
 *     ids    from ids.js readIds(text)          file  a cc-ifc IfcFile (lib/ifc/model.js), IFC2X3, IFC4 or IFC4X3
 *   result = {
 *     schema: 'IFC4', info: ids.info, ms,
 *     counts: { specs, pass, fail, applicable, failedElements },
 *     specs: [{ index, name, identifier, description, instructions, cardinality, ifcVersion, versionMismatch (the model's
 *               schema is not one the specification names; it is still checked, as the IDS test cases expect),
 *               status: 'pass' | 'fail', applicable, passed, failed, applicabilityText, issues: [audit issues of this specification],
 *               specFailure: null | { code: 'spec.none' (required, nothing applicable) },
 *               failures: [{ id, guid, type, cls, name, facets: [{ index, kind, cardinality, text, code, found: [text] }] }],
 *               more: failures not listed (over maxFailures) }]
 *   }
 *   Facet codes: 'novalue' (missing / empty), 'value' (a value that does not match), 'datatype', 'entity', 'predefined',
 *   'prohibited' (present but prohibited), 'unsupported' (complex or reference properties: IDS does not read them),
 *   'invalid' (the facet names something the class does not have); 'spec.prohibited' = an element a prohibited specification forbids.
 *
 *   facetMatch(model, id, facet) → { ok, code, found }   one facet on one object (applicability uses cardinality 'required')
 */

import { Model } from './access.js';
import { matchValue, matchName, restrictionHasBounds, valueText } from './values.js';
import { facetText } from './ids.js';

const NUMERIC = new Set(['real', 'integer']);

function entityMatch(m, id, f) {
  const type = m.type(id);
  if (!type) return { ok: false, code: 'entity', found: [] };
  let nameOk = matchName(f.name, type), shown = type;
  if (!nameOk && m.schemaName === 'IFC2X3') {   // IFC2X3: the occurrence class some IFC4 classes stand for comes from the type
    const d = m.occurrenceClassFromType(id);
    if (d && d !== type && matchName(f.name, d)) { nameOk = true; shown = d; }
  }
  if (!nameOk) return { ok: false, code: 'entity', found: [type] };
  if (!f.predefinedType) return { ok: true };
  const p = m.predefined(id);
  if (!p) return { ok: false, code: 'predefined', found: [shown] };
  const cands = [p.value, ...(p.value === 'USERDEFINED' && p.user ? [p.user] : [])];
  if (cands.some((c) => matchName(f.predefinedType, c))) return { ok: true };
  return { ok: false, code: 'predefined', found: [shown + ' [' + (p.user || p.value) + ']'] };
}

function attributeMatch(m, id, f) {
  const names = m.attrNames(id).filter((n) => matchName(f.name, n));
  if (!names.length) return f.cardinality === 'prohibited' ? { ok: true } : f.cardinality === 'optional' ? { ok: true } : { ok: false, code: 'invalid', found: [] };
  const vals = names.map((n) => m.attrValue(id, n));
  const set = vals.filter((v) => v !== null && v !== undefined);   // written (even if empty)
  const present = vals.filter((v) => Model.present(v));
  const found = set.map((v) => valueText(v));
  const hit = (v) => Model.present(v) && (!f.value || matchValue(f.value, v));
  switch (f.cardinality) {
    case 'prohibited':
      if (!f.value) return set.some((v) => v.kind !== 'derived') ? { ok: false, code: 'prohibited', found } : { ok: true };
      return present.some(hit) ? { ok: false, code: 'prohibited', found } : { ok: true };
    case 'optional':
      if (!set.length) return { ok: true };
      return set.some(hit) ? { ok: true } : { ok: false, code: present.length ? 'value' : 'novalue', found };
    default:
      if (!present.length) return { ok: false, code: 'novalue', found };
      return present.some(hit) ? { ok: true } : { ok: false, code: 'value', found };
  }
}

function classificationMatch(m, id, f) {
  const refs = m.classifications(id);
  const hit = (r) => (!f.system || matchName(f.system, r.system)) && (!f.value || r.values.some((v) => matchName(f.value, v)));
  const found = refs.map((r) => [r.system ?? '?', ...r.values.slice(0, 1)].join(' '));
  if (f.cardinality === 'prohibited') return refs.some(hit) ? { ok: false, code: 'prohibited', found } : { ok: true };
  if (!refs.length) return f.cardinality === 'optional' ? { ok: true } : { ok: false, code: 'novalue', found };
  return refs.some(hit) ? { ok: true } : { ok: false, code: 'value', found };
}

function materialMatch(m, id, f) {
  const mat = m.materials(id);
  const hit = () => (!f.value ? mat.has : mat.names.some((n) => matchName(f.value, n)));
  if (f.cardinality === 'prohibited') return hit() ? { ok: false, code: 'prohibited', found: mat.names } : { ok: true };
  if (!mat.has) return f.cardinality === 'optional' ? { ok: true } : { ok: false, code: 'novalue', found: [] };
  return hit() ? { ok: true } : { ok: false, code: 'value', found: mat.names };
}

function partOfMatch(m, id, f) {
  const seen = new Set([id]);
  const chain = [];
  let x = m.parent(id, f.relation), ok = false;
  while (x !== null && x !== undefined && !seen.has(x) && seen.size < 256) {
    seen.add(x);
    chain.push(m.type(x));
    if (!f.entity || entityMatch(m, x, f.entity).ok) { ok = true; break; }
    x = m.parent(x, f.relation);
  }
  if (f.cardinality === 'prohibited') return ok ? { ok: false, code: 'prohibited', found: chain } : { ok: true };
  if (!chain.length) return f.cardinality === 'optional' ? { ok: true } : { ok: false, code: 'novalue', found: [] };
  return ok ? { ok: true } : { ok: false, code: 'entity', found: chain };
}

/** One property against the facet's dataType and value: { ok, code, found }. */
function propertyCheck(m, p, f) {
  if (p.kind === 'complex' || p.kind === 'reference' || p.kind === 'other') return { ok: false, code: 'unsupported', found: [p.kind] };
  let vals = p.values.filter((v) => Model.present(v));
  if (!vals.length) return { ok: false, code: 'novalue', found: [] };
  if (f.dataType) {
    const want = f.dataType.toUpperCase();
    const typed = vals.filter((v) => (v.type || '') === want);
    if (!typed.length) return { ok: false, code: 'datatype', found: [...new Set(vals.map((v) => v.type || v.kind))] };
    vals = typed;
  }
  if (!f.value) return { ok: true };
  const si = (v) => (v && NUMERIC.has(v.kind) ? { ...v, v: m.toSI(v.v, v.type, v.unitRef ?? p.unitRef) } : v);
  const conv = vals.map(si);
  let ok;
  if (p.kind === 'bounded' && restrictionHasBounds(f.value)) {
    // a range against a bounded value: both bounds must be given and both must lie inside it (property-facet.md)
    const up = si(p.bounds.upper), lo = si(p.bounds.lower);
    ok = Model.present(up) && Model.present(lo) && matchValue(f.value, up) && matchValue(f.value, lo);
  } else if ((p.kind === 'list' || p.kind === 'table' || p.kind === 'enumerated') && restrictionHasBounds(f.value)) ok = conv.every((v) => matchValue(f.value, v));
  else ok = conv.some((v) => matchValue(f.value, v));
  return ok ? { ok: true } : { ok: false, code: 'value', found: conv.map(valueText) };
}

function propertyMatch(m, id, f) {
  const sets = [...m.psets(id)].filter(([name]) => matchName(f.propertySet, name));
  const props = [];
  for (const [, ps] of sets) props.push({ ps, list: [...ps.props.values()].filter((p) => matchName(f.baseName, p.name)) });
  const all = props.flatMap((x) => x.list);
  if (f.cardinality === 'prohibited') {
    if (!f.value && !f.dataType) return all.length ? { ok: false, code: 'prohibited', found: all.map((p) => p.name) } : { ok: true };
    return all.some((p) => propertyCheck(m, p, f).ok) ? { ok: false, code: 'prohibited', found: all.map((p) => p.name) } : { ok: true };
  }
  if (f.cardinality === 'optional') {
    for (const p of all) {
      if (!p.values.some((v) => v !== null) && p.kind !== 'complex' && p.kind !== 'reference') continue;   // set but empty: as if absent
      const r = propertyCheck(m, p, f);
      if (!r.ok) return r;
    }
    return { ok: true };
  }
  if (!sets.length) return { ok: false, code: 'novalue', found: [] };
  for (const x of props) if (!x.list.length) return { ok: false, code: 'novalue', found: [] };
  for (const p of all) { const r = propertyCheck(m, p, f); if (!r.ok) return r; }
  return { ok: true };
}

/** One facet on one object. */
export function facetMatch(m, id, f) {
  switch (f.kind) {
    case 'entity': return entityMatch(m, id, f);
    case 'attribute': return attributeMatch(m, id, f);
    case 'classification': return classificationMatch(m, id, f);
    case 'material': return materialMatch(m, id, f);
    case 'partOf': return partOfMatch(m, id, f);
    case 'property': return propertyMatch(m, id, f);
    default: return { ok: false, code: 'invalid', found: [] };
  }
}

const asApplicability = (f) => (f.cardinality === 'required' ? f : { ...f, cardinality: 'required' });

/** The objects a specification could apply to, before its facets are tried: by class when it names one, else every rooted object and resource. */
function candidates(m, spec) {
  const f = m.f;
  const ent = spec.applicability.find((x) => x.kind === 'entity' && x.name);
  const out = new Set();
  const typed2x3 = (keep) => {   // IFC2X3: occurrences whose type stands for the class asked
    if (m.schemaName !== 'IFC2X3' || !m.has('IFCRELDEFINESBYTYPE')) return;
    for (const r of f.ofType('IFCRELDEFINESBYTYPE', true)) {
      const t = f.attr(r, 'RelatingType');
      const tn = t && t.ref !== undefined ? (f.type(t.ref) || '').replace(/TYPE$/, '').replace(/STYLE$/, '') : '';
      if (tn && keep(tn)) for (const o of [].concat(f.attr(r, 'RelatedObjects') || [])) if (o && o.ref !== undefined) out.add(o.ref);
    }
  };
  if (ent && ent.name.simple !== undefined) {
    const n = ent.name.simple;
    if (m.has(n)) for (const id of f.ofType(n, false)) out.add(id);
    typed2x3((tn) => tn === n);
  } else if (ent) {
    const present = f.typesPresent ? [...f.typesPresent().keys()] : [];
    for (const t of present) if (matchName(ent.name, t)) for (const id of f.ofType(t, false)) out.add(id);
    typed2x3((tn) => matchName(ent.name, tn));
  } else {
    for (const root of ['IFCROOT', 'IFCMATERIALDEFINITION', 'IFCMATERIAL', 'IFCPROFILEDEF']) if (m.has(root)) for (const id of f.ofType(root, true)) out.add(id);
  }
  return [...out].sort((a, b) => a - b);
}

/** Checks the model against every specification of the IDS. */
export function checkIds(ids, file, { maxFailures = 20000, now = () => Date.now() } = {}) {
  const t0 = now();
  const m = new Model(file);
  const schema = m.schemaName;
  const specs = [];
  let failedElements = 0, applicableAll = 0;
  for (const spec of ids.specs) {
    const versionMismatch = spec.ifcVersion.length > 0 && !spec.ifcVersion.some((v) => v === schema || (schema === 'IFC4X3' && v.startsWith('IFC4X3')));
    const appl = spec.applicability.map(asApplicability);
    const applicable = candidates(m, spec).filter((id) => appl.every((f) => facetMatch(m, id, f).ok));
    const failures = [];
    let failed = 0;
    if (spec.cardinality === 'prohibited') {
      for (const id of applicable) {
        failed++;
        if (failures.length < maxFailures) { const l = m.label(id); failures.push({ id, ...l, facets: [{ index: -1, kind: 'specification', cardinality: 'prohibited', text: spec.applicability.map(facetText).join(' + '), code: 'spec.prohibited', found: [l.type] }] }); }
      }
    } else {
      for (const id of applicable) {
        const bad = [];
        spec.requirements.forEach((f, index) => {
          const r = facetMatch(m, id, f);
          if (!r.ok) bad.push({ index, kind: f.kind, cardinality: f.cardinality, text: facetText(f), code: r.code, found: (r.found || []).slice(0, 12).map(String) });
        });
        if (bad.length) { failed++; if (failures.length < maxFailures) failures.push({ id, ...m.label(id), facets: bad }); }
      }
    }
    const specFailure = spec.cardinality === 'required' && !applicable.length ? { code: 'spec.none' } : null;
    const status = specFailure || failed ? 'fail' : 'pass';
    applicableAll += applicable.length;
    failedElements += failed;
    specs.push({
      index: spec.index, name: spec.name, identifier: spec.identifier, description: spec.description, instructions: spec.instructions,
      cardinality: spec.cardinality, ifcVersion: spec.ifcVersion, versionMismatch, status, applicabilityText: spec.applicability.map(facetText).join(' + '),
      applicable: applicable.length, passed: spec.cardinality === 'prohibited' ? 0 : applicable.length - failed, failed,
      issues: (ids.issues || []).filter((x) => x.spec === spec.index), specFailure, failures, more: Math.max(0, failed - failures.length),
    });
  }
  return {
    schema, info: ids.info, ms: now() - t0,
    counts: { specs: specs.length, pass: specs.filter((s) => s.status === 'pass').length, fail: specs.filter((s) => s.status === 'fail').length, applicable: applicableAll, failedElements },
    specs,
  };
}
