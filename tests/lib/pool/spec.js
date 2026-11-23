/* SPDX-License-Identifier: Apache-2.0 */
/**
 * spec.js — pool spec packs (0.11 POOL.4 / POOL.5): the norms of one place as data, carried by a side add-on, never by the generator.
 *
 * Format `cadcraft-pool-spec` v1:
 *   { format, version: 1, id, name, region, researched (date), standards: [{ key, title, edition, publisher, url }],
 *     values: { '<rule id>': { value (number | text | null), unit, standard (a key above), clause, read: 'primary' | 'secondary' | 'none',
 *               url, quote, note, value_us?, unit_us?, applies?: 'private' | 'public' (the rule is for that use only) } }, notes }
 * A rule may also be written for one use by its id: 'water.skimmer.area.public.max' is read before 'water.skimmer.area.max' for a public pool.
 * `read` is the honest part: 'primary' = we read the value in the standard's own text or its publisher's; 'secondary' = in a document that
 * quotes the standard; 'none' = not read, so the value is null and the rule is listed as not covered. A pack never holds a remembered number.
 *
 * cleanSpec(raw) → { ok, spec, problems }. spec.values[rule] gains `number` (the figure the generator can use, in the engine's units: mm, MPa,
 * ratio, h, m/h, m/s, m²; null when the value is a label or a range it cannot use) and `label` (what to show).
 * check(design, basis, circ, steps, spec) → rows for Problems and the report.
 * A side add-on puts its pack on the page (globalThis.ccPoolSpecs, event 'cc-pool-specs'); registeredSpecs() reads them.
 */
import { GOVERNED, ruleOf, lookup } from './model.js';

export const SPEC_FORMAT = 'cadcraft-pool-spec';
export const READS = ['primary', 'secondary', 'none'];
const RULE_RE = /^[a-z][a-z0-9.]{2,60}$/;
const str = (v, n) => (v === null || v === undefined ? '' : String(v).slice(0, n));
/** The unit each numeric rule must arrive in for the generator to use it (anything else is shown, not used). */
export const RULE_UNITS = {
  'shell.wall.thickness.min': 'mm', 'shell.floor.thickness.min': 'mm', 'shell.cover.min.water': 'mm', 'shell.cover.min.earth': 'mm',
  'shell.concrete.class.min': 'MPa', 'shell.rebar.ratio.min': 'ratio', 'shell.rebar.spacing.max': 'mm', 'shell.wc.max': 'ratio', 'shell.crack.width.max': 'mm',
  'water.turnover.private.max': 'h', 'water.turnover.public.max': 'h', 'water.filter.rate.max': 'm/h', 'water.velocity.suction.max': 'm/s',
  'water.velocity.return.max': 'm/s', 'water.skimmer.area.max': 'm2', 'safety.barrier.height.min': 'mm', 'safety.deck.width.min': 'mm',
};
/** The unit of a rule, also when it is written for one use ('water.skimmer.area.public.max'). */
export const unitOf = (rule) => RULE_UNITS[rule] || RULE_UNITS[rule.replace(/\.(private|public)\.(min|max)$/, '.$2')] || '';

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
    .map((s) => ({ key: str(s.key, 40), title: str(s.title, 300), edition: str(s.edition, 80), publisher: str(s.publisher, 120), url: /^https:\/\//.test(String(s.url || '')) ? str(s.url, 500) : '' }));
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
      const want = unitOf(rule);
      if (rule === 'shell.concrete.class.min') number = v.unit === 'MPa' || /^\s*L?C\s*\d/i.test(String(v.value)) ? strengthOf(v.value) : null;
      else if (want && v.unit === want && typeof v.value === 'number' && Number.isFinite(v.value) && v.value > 0) number = v.value;
    }
    values[rule] = {
      rule, value: has ? v.value : null, number, unit: str(v.unit, 20), label: has ? str(v.value, 200) + (v.unit && typeof v.value === 'number' ? ' ' + str(v.unit, 20) : '') : '',
      standard: has ? v.standard : '', clause: str(v.clause, 120), read: has ? read : 'none', url: has ? str(v.url, 500) : '', quote: str(v.quote, 400), note: str(v.note, 600),
      applies: v.applies === 'private' || v.applies === 'public' ? v.applies : '',
      us: v.value_us !== undefined && v.value_us !== null ? str(v.value_us, 60) + ' ' + str(v.unit_us, 20) : '',
    };
  }
  const spec = { format: SPEC_FORMAT, version: 1, id: String(raw.id), name: str(raw.name, 120) || String(raw.id), region: str(raw.region, 40), researched: str(raw.researched, 20), standards, values, notes: str(raw.notes, 2000) };
  spec.counts = READS.reduce((o, r) => ({ ...o, [r]: Object.values(values).filter((x) => x.read === r).length }), {});
  return { ok: true, spec, problems };
}

/** The standard a value cites, in words: "EN 1992-1-1, Table 4.4N". */
export function citation(spec, rec) {
  if (!spec || !rec || !rec.standard) return '';
  const s = spec.standards.find((x) => x.key === rec.standard);
  return (s ? s.title : rec.standard) + (rec.clause ? ', ' + rec.clause : '');
}

/**
 * Check a design against a spec. → [{ code, severity: 'error' | 'warning' | 'info', key (a lang key), vars, rule, read, cite }].
 * Only rules the pack holds a usable number for are judged; a person's own figure that breaks one is an error, the rest are notes.
 */
export function check(design, basis, circ, steps, spec, rebar = null) {
  const rows = [];
  if (!spec) return rows;
  const num = (rule) => lookup(spec, rule, design.use);
  const row = (code, severity, key, vars, rec) => rows.push({ code, severity, key, vars, rule: rec ? rec.rule : '', read: rec ? rec.read : '', cite: rec ? citation(spec, rec) : '' });
  for (const [k, g] of Object.entries(GOVERNED)) {
    if (k === 'barrierHeight') continue;
    const rec = num(ruleOf(k, design));
    if (!rec) continue;
    const v = design[k];
    if (g.how === 'min' && v < rec.number - 1e-9) row('pool.spec.' + k, 'error', 'pool.issue.below', { what: k, value: v, limit: rec.number, unit: g.unit }, rec);
    if (g.how === 'max' && v > rec.number + 1e-9) row('pool.spec.' + k, 'error', 'pool.issue.above', { what: k, value: v, limit: rec.number, unit: g.unit }, rec);
  }
  const fr = num('water.filter.rate.max');
  if (fr && circ.filter.rate > fr.number + 1e-9) row('pool.spec.filter', 'error', 'pool.issue.above', { what: 'filterRateActual', value: circ.filter.rate, limit: fr.number, unit: 'm/h' }, fr);
  for (const [line, rule] of [['surface', 'water.velocity.suction.max'], ['drain', 'water.velocity.suction.max'], ['ret', 'water.velocity.return.max']]) {
    const rec = num(rule), l = circ.lines[line];
    if (rec && l.flow > 0 && l.velocity > rec.number + 1e-9) row('pool.spec.v.' + line, 'error', 'pool.issue.above', { what: 'velocity.' + line, value: l.velocity, limit: rec.number, unit: 'm/s' }, rec);
  }
  const sk = num('water.skimmer.area.max');
  if (sk && circ.skimmers > 0 && circ.surface / circ.skimmers > sk.number + 1e-9) row('pool.spec.skimmers', 'error', 'pool.issue.above', { what: 'skimmerAreaActual', value: circ.surface / circ.skimmers, limit: sk.number, unit: 'm2' }, sk);
  const bh = num('safety.barrier.height.min');
  if (bh && design.kind === 'pool' && design.setting === 'outdoor') {
    if (!(design.barrierHeight > 0)) row('pool.spec.barrier', 'warning', 'pool.issue.nobarrier', { limit: bh.number }, bh);
    else if (design.barrierHeight < bh.number - 1e-9) row('pool.spec.barrier', 'error', 'pool.issue.below', { what: 'barrierHeight', value: design.barrierHeight, limit: bh.number, unit: 'mm' }, bh);
  }
  const dw = num('safety.deck.width.min');
  if (dw && design.kind === 'pool' && design.use === 'public' && design.copingWidth + design.pavingWidth < dw.number - 1e-9) row('pool.spec.deck', 'error', 'pool.issue.below', { what: 'deckWidth', value: design.copingWidth + design.pavingWidth, limit: dw.number, unit: 'mm' }, dw);
  const sp = num('shell.rebar.spacing.max');
  if (sp) row('pool.spec.spacing', 'info', 'pool.issue.note', { what: 'rebarSpacing', limit: sp.number, unit: 'mm', wall: rebar ? rebar.spacing.wall : null, floor: rebar ? rebar.spacing.floor : null }, sp);
  return rows;
}

/**
 * A side add-on hands its pack to the page as it is (it cannot import this file: add-ons do not reach into each other's folders):
 *   (globalThis.ccPoolSpecs ||= []).push(pack); dispatchEvent(new Event('cc-pool-specs'))
 * registerSpec() does the same for tests and scripts. registeredSpecs() cleans what is there (once per pack) and leaves out what is not a pack.
 */
export function registerSpec(raw) {
  const g = globalThis, list = (g.ccPoolSpecs ||= []);
  list.push(raw);
  const say = () => { try { if (typeof g.dispatchEvent === 'function' && typeof g.Event === 'function') g.dispatchEvent(new g.Event('cc-pool-specs')); } catch { /* no page */ } };
  say();
  return () => { const i = list.indexOf(raw); if (i >= 0) list.splice(i, 1); say(); };
}
const CLEANED = new WeakMap();
export function registeredSpecs() {
  const out = new Map();
  for (const raw of globalThis.ccPoolSpecs || []) {
    if (!raw || typeof raw !== 'object') continue;
    if (!CLEANED.has(raw)) CLEANED.set(raw, cleanSpec(raw));
    const c = CLEANED.get(raw);
    if (c.ok) out.set(c.spec.id, c.spec);
  }
  return [...out.values()];
}
