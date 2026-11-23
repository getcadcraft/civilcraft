/* SPDX-License-Identifier: Apache-2.0 */
/**
 * spec.js — dome spec packs (0.11 DOME.4 / DOME.5): the norms of one place as data, carried by a side add-on, never by the generator.
 *
 * Format `cadcraft-dome-spec` v1 (the Pool generator's pack format with this generator's rule ids):
 *   { format, version: 1, id, name, region, researched (date), standards: [{ key, title, edition, publisher, url }],
 *     values: { '<rule id>': { value (number | text | null), unit, standard (a key above), clause, read: 'primary' | 'secondary' | 'none',
 *               url, quote, note, value_us?, unit_us? } }, notes }
 * `read` is the honest part: 'primary' = we read the value in the standard's own text or its publisher's; 'secondary' = in a document that
 * quotes the standard; 'none' = not read, so the value is null and the rule is listed as not covered. A pack never holds a remembered number.
 *
 * cleanSpec(raw) → { ok, spec, problems }. spec.values[rule] gains `number` (the figure the generator can use, in the engine's units: mm, MPa,
 * ratio; null when the value is a sentence, a label or in another unit) and `label` (what to show).
 * check(design, basis, forces, spec) → rows for Problems and the report.
 * A side add-on puts its pack on the page (globalThis.ccDomeSpecs, event 'cc-dome-specs'); registeredSpecs() reads them.
 */
import { GOVERNED, lookup } from './model.js';

export const SPEC_FORMAT = 'cadcraft-dome-spec';
export const SPEC_EVENT = 'cc-dome-specs';
export const READS = ['primary', 'secondary', 'none'];
const RULE_RE = /^[a-z][a-z0-9.]{2,60}$/;
const str = (v, n) => (v === null || v === undefined ? '' : String(v).slice(0, n));
/** The unit each numeric rule must arrive in for the generator to use it (anything else is shown, not used). */
export const RULE_UNITS = {
  'shell.thickness.min': 'mm', 'shell.cover.min': 'mm', 'footing.cover.min.earth': 'mm', 'shell.concrete.strength.min': 'MPa', 'shotcrete.strength.min': 'MPa',
  'shell.rebar.ratio.min': 'ratio', 'shell.rebar.spacing.max': 'mm', 'steel.yield': 'MPa',
  'load.factor.dead.alone': 'factor', 'load.factor.dead': 'factor', 'load.factor.dead.min': 'factor', 'load.factor.snow': 'factor', 'load.factor.snow.accompanying': 'factor',
  'load.factor.wind': 'factor', 'load.factor.seismic': 'factor',
};
/** Rules that are sentences a person must read with their engineer or building official: check() lists them as notes when the spec holds them. */
export const READ_RULES = ['shell.stability', 'shell.buckling.guidance', 'foam.fire', 'thermal.barrier.dome', 'wind.dome', 'snow.dome', 'shell.openings'];
const STRENGTH_RULES = new Set(['shell.concrete.strength.min', 'shotcrete.strength.min']);

/** A concrete strength from a number or a class label: "C30/37" → 30 (the cylinder strength, MPa); 28 → 28. null when it is neither. */
export function strengthOf(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  const m = /^\s*L?C\s*(\d+(?:\.\d+)?)\s*\/\s*\d+/i.exec(String(v ?? ''));
  return m ? Number(m[1]) : null;
}

export function cleanSpec(raw) {
  const problems = [];
  if (!raw || typeof raw !== 'object' || raw.format !== SPEC_FORMAT || Number(raw.version) !== 1) return { ok: false, spec: null, problems: ['not a ' + SPEC_FORMAT + ' version 1 pack'] };
  if (!/^[a-z0-9][a-z0-9-]{1,40}$/.test(String(raw.id || ''))) return { ok: false, spec: null, problems: ['the pack has no usable id'] };
  const standards = (Array.isArray(raw.standards) ? raw.standards : []).filter((s) => s && typeof s.key === 'string' && s.key)
    .map((s) => ({ key: str(s.key, 40), title: str(s.title, 300), edition: str(s.edition, 160), publisher: str(s.publisher, 120), url: /^https:\/\//.test(String(s.url || '')) ? str(s.url, 500) : '' }));
  const known = new Set(standards.map((s) => s.key));
  const values = {};
  for (const [rule, v] of Object.entries(raw.values && typeof raw.values === 'object' ? raw.values : {})) {
    if (!RULE_RE.test(rule) || !v || typeof v !== 'object') { problems.push(rule + ': not a rule'); continue; }
    const read = READS.includes(v.read) ? v.read : 'none';
    const has = v.value !== null && v.value !== undefined && v.value !== '' && read !== 'none';
    if (has && !known.has(v.standard)) { problems.push(rule + ': names a standard the pack does not list'); continue; }
    if (has && !/^https:\/\//.test(String(v.url || ''))) { problems.push(rule + ': has a value and no page it was read on'); continue; }
    let number = null;
    if (has) {
      const want = RULE_UNITS[rule];
      if (STRENGTH_RULES.has(rule)) number = v.unit === 'MPa' || /^\s*L?C\s*\d/i.test(String(v.value)) ? strengthOf(v.value) : null;
      else if (want && v.unit === want && typeof v.value === 'number' && Number.isFinite(v.value) && v.value > 0) number = v.value;
    }
    values[rule] = {
      rule, value: has ? v.value : null, number, unit: str(v.unit, 20), label: has ? str(v.value, 240) + (v.unit && typeof v.value === 'number' ? ' ' + str(v.unit, 20) : '') : '',
      standard: has ? v.standard : '', clause: str(v.clause, 160), read: has ? read : 'none', url: has ? str(v.url, 500) : '', quote: str(v.quote, 400), note: str(v.note, 1200),
      us: v.value_us !== undefined && v.value_us !== null ? str(v.value_us, 60) + ' ' + str(v.unit_us, 20) : '',
    };
  }
  const spec = { format: SPEC_FORMAT, version: 1, id: String(raw.id), name: str(raw.name, 120) || String(raw.id), region: str(raw.region, 40), researched: str(raw.researched, 20), standards, values, notes: str(raw.notes, 2000) };
  spec.counts = READS.reduce((o, r) => ({ ...o, [r]: Object.values(values).filter((x) => x.read === r).length }), {});
  return { ok: true, spec, problems };
}

/** The standard a value cites, in words: "ACI 318-19, Table 20.5.1.3.1". */
export function citation(spec, rec) {
  if (!spec || !rec || !rec.standard) return '';
  const s = spec.standards.find((x) => x.key === rec.standard);
  return (s ? s.title : rec.standard) + (rec.clause ? ', ' + rec.clause : '');
}

/**
 * Check a design against a spec. → [{ code, severity: 'error' | 'warning' | 'info', key (a lang key), vars, rule, read, cite }].
 * Only rules the pack holds a usable number for are judged; a person's own figure that breaks one is an error. What the generator cannot
 * judge (bar spacing, the steel stress typed for the ring) is a note. Nothing here says a dome complies.
 */
export function check(design, basis, forces, spec) {
  const rows = [];
  if (!spec) return rows;
  const row = (code, severity, key, vars, rec) => rows.push({ code, severity, key, vars, rule: rec ? rec.rule : '', read: rec ? rec.read : '', cite: rec ? citation(spec, rec) : '' });
  for (const [k, g] of Object.entries(GOVERNED)) {
    const rec = lookup(spec, g.rules);
    if (!rec) continue;
    const way = g.check || 'min';
    if (way === 'min' && design[k] < rec.number - 1e-9) row('dome.spec.' + k, 'error', 'dome.issue.below', { what: k, value: design[k], limit: rec.number, unit: g.unit }, rec);
    if (way === 'max' && design[k] > rec.number + 1e-9) row('dome.spec.' + k, 'error', 'dome.issue.above', { what: k, value: design[k], limit: rec.number, unit: g.unit }, rec);
  }
  for (const rule of READ_RULES) { const v = spec.values[rule]; if (v && v.read !== 'none' && typeof v.value === 'string') row('dome.read.' + rule, 'info', 'dome.issue.read', { rule, text: v.value }, v); }
  const sp = spec.values['shell.rebar.spacing.max'];
  if (sp && Number.isFinite(sp.number)) {
    if (design.barSpacing > 0) { if (design.barSpacing > sp.number + 1e-9) row('dome.spec.spacing', 'error', 'dome.issue.above', { what: 'barSpacing', value: design.barSpacing, limit: sp.number, unit: 'mm' }, sp); }
    else row('dome.spec.spacing', 'info', 'dome.issue.note', { what: 'rebarSpacing', limit: sp.number, unit: 'mm' }, sp);
  }
  const fy = spec.values['steel.yield'];
  if (fy && Number.isFinite(fy.number) && design.steelStress > fy.number + 1e-9) row('dome.spec.steel', 'error', 'dome.issue.above', { what: 'steelStress', value: design.steelStress, limit: fy.number, unit: 'MPa' }, fy);
  return rows;
}

/**
 * A side add-on hands its pack to the page as it is (it cannot import this file: add-ons do not reach into each other's folders):
 *   (globalThis.ccDomeSpecs ||= []).push(pack); dispatchEvent(new Event('cc-dome-specs'))
 * registerSpec() does the same for tests and scripts. registeredSpecs() cleans what is there (once per pack) and leaves out what is not a pack.
 */
export function registerSpec(raw) {
  const g = globalThis, list = (g.ccDomeSpecs ||= []);
  list.push(raw);
  const say = () => { try { if (typeof g.dispatchEvent === 'function' && typeof g.Event === 'function') g.dispatchEvent(new g.Event(SPEC_EVENT)); } catch { /* no page */ } };
  say();
  return () => { const i = list.indexOf(raw); if (i >= 0) list.splice(i, 1); say(); };
}
const CLEANED = new WeakMap();
export function registeredSpecs() {
  const out = new Map();
  for (const raw of globalThis.ccDomeSpecs || []) {
    if (!raw || typeof raw !== 'object') continue;
    if (!CLEANED.has(raw)) CLEANED.set(raw, cleanSpec(raw));
    const c = CLEANED.get(raw);
    if (c.ok) out.set(c.spec.id, c.spec);
  }
  return [...out.values()];
}
