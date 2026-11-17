// SPDX-License-Identifier: Apache-2.0
/**
 * methods.js — measurement methods a project chooses (booklet row BK.42, session bk-measure-10; owner decision 2026-11-11).
 * A method is DATA, not code: a pack that says, per measured quantity, the smallest opening that is deducted, how wall junctions
 * are measured and whether reveals are measured, plus how masonry is measured. Each pack names its source (title, publisher,
 * edition, link, the date it was read) and its review state. The shipped packs are method-packs.js; an office can load its own
 * file in the same format. Host-free: no DOM, no units of its own. Canonical copy: lib/quantities/ (tools/quantities/sync.mjs).
 *
 * Honesty rules built into the format:
 *   - a value is used only when its field says state 'stated' and names the clause it was read from;
 *   - 'not-confirmed' (the rule could not be read from a reliable source), 'not-encoded' (the source has a rule this format
 *     cannot hold, such as deductions in bands) and 'not-stated' (the source was read and says nothing on this) all fall back to
 *     the CadCraft default for that field, and the rule text says so for the first two;
 *   - every shipped pack has review state 'unchecked': no quantity surveyor has checked it. The apps show that wherever the
 *     method is named.
 *
 * The pack (JSON-safe):
 *   { format: 'cadcraft-measurement-method', version: 1, id, name, region,
 *     source: { title, publisher, edition, url, read: 'YYYY-MM-DD', note },
 *     review: { state: 'unchecked' | 'checked', by, date },
 *     quantities: { 'wall.side' | 'floor' | 'finish.wall' | 'finish.ceiling': {
 *         openings:  { state, clause, minArea, unit: 'm2' | 'ft2', inclusive },   an opening of at most (inclusive) / less than
 *                                                                                (not inclusive) minArea is NOT deducted; 0 = all deducted
 *         junctions: { state, clause, mode: 'centre' | 'overlap' | 'face' },      'wall.side' and 'finish.wall' only (junctions.js)
 *         reveals:   { state, clause, measured, linearUpTo (mm; 0 = always an area) } } },   'finish.wall' only
 *     masonry: { measure: { state, clause, unit: 'm2' | 'm3' | 'number' }, waste: { state, clause, pct },
 *                mortar: { state, clause, allowancePct } } }
 *
 *   cleanMethod(input) → { method | null, errors: [code] }      a wrong field is an error, never dropped silently
 *   builtinMethods() → the shipped packs (validated)             DEFAULT_METHOD 'cadcraft-default' is always first
 *   findMethod(id, own = []) → the pack with that id among the shipped ones and `own` (an office's loaded packs), or null
 *   methodRule(method, quantity, { m2, mm }) → { minArea, inclusive, junction, reveals: { measured, linearUpTo }, fallback: [field], unheld: [field] }
 *     in the CALLER's units: m2 = how many of its area units make 1 m², mm = how many of its length units make 1 mm
 *   methodMasonry(method) → { unit, wastePct | null, allowancePct, fallback: [field] }
 *   methodRuleText(method, quantity, tr?) → the rule as one text · methodLine(method, tr?) → "Measurement method: … Source: … Unchecked …"
 *   revealsOf({ openings, depth, rule }) → { area, length }       the reveals of the openings a finish is deducted for
 *   TEXT   the English wording by key (the apps' lang files hold the same words under 'qty.m.<key>'; a test keeps them equal)
 */
import { RULES, deducts } from './rules.js';
import { PACKS } from './method-packs.js';

export const METHOD_FORMAT = 'cadcraft-measurement-method';
export const METHOD_VERSION = 1;
export const DEFAULT_METHOD = 'cadcraft-default';
export const QUANTITIES = Object.freeze(['wall.side', 'floor', 'finish.wall', 'finish.ceiling']);
export const JUNCTION_MODES = Object.freeze(['centre', 'overlap', 'face']);
export const FIELD_STATES = Object.freeze(['stated', 'not-confirmed', 'not-encoded', 'not-stated']);
export const MASONRY_UNITS = Object.freeze(['m2', 'm3', 'number']);
export const AREA_UNITS = Object.freeze({ m2: 1, ft2: 0.09290304 });   // in m²
export const METHOD_LIMITS = Object.freeze({ id: 80, name: 120, text: 300, url: 500, note: 1000, bytes: 60000, minArea: 1000, pct: 100, linear: 5000 });
const ID_RE = /^[a-z0-9][a-z0-9._-]{0,79}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const text = (v) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
const finite = (v) => typeof v === 'number' && Number.isFinite(v);
const isObj = (v) => !!v && typeof v === 'object' && !Array.isArray(v);

function cleanField(raw, where, errors, read) {
  if (raw === undefined || raw === null) return { state: 'not-stated', clause: '' };
  if (!isObj(raw) || !FIELD_STATES.includes(raw.state)) { errors.push(where + '.state'); return null; }
  const clause = text(raw.clause);
  if (clause.length > METHOD_LIMITS.text) errors.push(where + '.clause');
  const out = { state: raw.state, clause };
  if (raw.state !== 'stated') return out;                // nothing is used from a field that is not stated
  if (!clause) errors.push(where + '.clause');           // a stated value names where it was read
  read(raw, out);
  return out;
}

export function cleanMethod(input) {
  const errors = [];
  if (!isObj(input)) return { method: null, errors: ['format'] };
  if (input.format !== METHOD_FORMAT) return { method: null, errors: ['format'] };
  if (input.version !== METHOD_VERSION) return { method: null, errors: ['version'] };
  const id = text(input.id), name = text(input.name), region = text(input.region);
  if (!ID_RE.test(id)) errors.push('id');
  if (!name || name.length > METHOD_LIMITS.name) errors.push('name');
  if (region.length > METHOD_LIMITS.name) errors.push('region');
  const s = isObj(input.source) ? input.source : null;
  const source = { title: text(s?.title), publisher: text(s?.publisher), edition: text(s?.edition), url: text(s?.url), read: text(s?.read), note: text(s?.note) };
  if (!s || !source.title || source.title.length > METHOD_LIMITS.text) errors.push('source.title');
  if (source.publisher.length > METHOD_LIMITS.text || source.edition.length > METHOD_LIMITS.text) errors.push('source.edition');
  if (source.url && (source.url.length > METHOD_LIMITS.url || !/^https:\/\/[^\s<>"']+$/.test(source.url))) errors.push('source.url');
  if (!DATE_RE.test(source.read)) errors.push('source.read');
  if (source.note.length > METHOD_LIMITS.note) errors.push('source.note');
  const r = isObj(input.review) ? input.review : {};
  const review = { state: r.state === 'checked' ? 'checked' : 'unchecked', by: text(r.by), date: text(r.date) };
  if (r.state !== undefined && r.state !== 'checked' && r.state !== 'unchecked') errors.push('review.state');
  if (review.state === 'checked' && (!review.by || review.by.length > METHOD_LIMITS.name || !DATE_RE.test(review.date))) errors.push('review.by');
  if (review.state === 'unchecked') { review.by = ''; review.date = ''; }

  const quantities = {};
  const q = isObj(input.quantities) ? input.quantities : {};
  for (const k of Object.keys(q)) if (!QUANTITIES.includes(k)) errors.push('quantities.' + k);
  for (const k of QUANTITIES) {
    const raw = isObj(q[k]) ? q[k] : {};
    if (q[k] !== undefined && !isObj(q[k])) errors.push('quantities.' + k);
    for (const f of Object.keys(raw)) if (!['openings', 'junctions', 'reveals'].includes(f) || (f === 'junctions' && !/wall/.test(k)) || (f === 'reveals' && k !== 'finish.wall')) errors.push(k + '.' + f);
    const o = {};
    o.openings = cleanField(raw.openings, k + '.openings', errors, (f, out) => {
      if (!finite(f.minArea) || f.minArea < 0 || f.minArea > METHOD_LIMITS.minArea) errors.push(k + '.openings.minArea');
      if (f.unit !== undefined && !(f.unit in AREA_UNITS)) errors.push(k + '.openings.unit');
      if (f.inclusive !== undefined && typeof f.inclusive !== 'boolean') errors.push(k + '.openings.inclusive');
      out.minArea = f.minArea; out.unit = f.unit || 'm2'; out.inclusive = f.inclusive !== false;
    });
    if (/wall/.test(k)) o.junctions = cleanField(raw.junctions, k + '.junctions', errors, (f, out) => {
      if (!JUNCTION_MODES.includes(f.mode)) errors.push(k + '.junctions.mode');
      out.mode = f.mode;
    });
    if (k === 'finish.wall') o.reveals = cleanField(raw.reveals, k + '.reveals', errors, (f, out) => {
      if (typeof f.measured !== 'boolean') errors.push(k + '.reveals.measured');
      const lin = f.linearUpTo === undefined || f.linearUpTo === null ? 0 : f.linearUpTo;
      if (!finite(lin) || lin < 0 || lin > METHOD_LIMITS.linear) errors.push(k + '.reveals.linearUpTo');
      out.measured = f.measured === true; out.linearUpTo = out.measured ? lin : 0;
    });
    quantities[k] = o;
  }
  const m = isObj(input.masonry) ? input.masonry : {};
  if (input.masonry !== undefined && !isObj(input.masonry)) errors.push('masonry');
  for (const f of Object.keys(m)) if (!['measure', 'waste', 'mortar'].includes(f)) errors.push('masonry.' + f);
  const masonry = {
    measure: cleanField(m.measure, 'masonry.measure', errors, (f, out) => { if (!MASONRY_UNITS.includes(f.unit)) errors.push('masonry.measure.unit'); out.unit = f.unit; }),
    waste: cleanField(m.waste, 'masonry.waste', errors, (f, out) => { if (!finite(f.pct) || f.pct < 0 || f.pct > METHOD_LIMITS.pct) errors.push('masonry.waste.pct'); out.pct = f.pct; }),
    mortar: cleanField(m.mortar, 'masonry.mortar', errors, (f, out) => { if (!finite(f.allowancePct) || f.allowancePct < 0 || f.allowancePct > METHOD_LIMITS.pct) errors.push('masonry.mortar.allowancePct'); out.allowancePct = f.allowancePct; }),
  };
  const uniq = [...new Set(errors)];
  if (uniq.length) return { method: null, errors: uniq };
  return { method: { format: METHOD_FORMAT, version: METHOD_VERSION, id, name, region, source, review, quantities, masonry }, errors: [] };
}

/** An office's method file as text → { method | null, errors }. Too large, not JSON, or a shipped pack's id: refused. */
export function readMethodFile(textIn) {
  const s = String(textIn ?? '');
  if (s.length > METHOD_LIMITS.bytes) return { method: null, errors: ['size'] };
  let raw = null;
  try { raw = JSON.parse(s); } catch (e) { return { method: null, errors: ['json'] }; }
  const r = cleanMethod(raw);
  if (r.method && builtinMethods().some((m) => m.id === r.method.id)) return { method: null, errors: ['id.taken'] };
  return r;
}

let BUILT = null;
export function builtinMethods() {
  if (!BUILT) {
    BUILT = PACKS.map((p) => cleanMethod(p)).filter((r) => r.method).map((r) => Object.freeze(r.method));
    BUILT.sort((a, b) => (a.id === DEFAULT_METHOD ? -1 : b.id === DEFAULT_METHOD ? 1 : 0));
  }
  return BUILT;
}
export function defaultMethod() { return builtinMethods().find((m) => m.id === DEFAULT_METHOD); }
export function findMethod(id, own = []) {
  return builtinMethods().find((m) => m.id === id) || (own || []).find((m) => m && m.id === id) || null;
}
export const isDefault = (method) => !method || method.id === DEFAULT_METHOD;

/** One quantity's rule under a method, in the caller's units. A field that is not 'stated' is the default's, and is listed in `fallback`. */
export function methodRule(method, quantity, { m2 = 1, mm = 1 } = {}) {
  const q = method?.quantities?.[quantity] || {};
  const fallback = [], unheld = [];
  const used = (f, name) => { if (f && f.state === 'stated') return f; if (f && f.state === 'not-confirmed') fallback.push(name); if (f && f.state === 'not-encoded') unheld.push(name); return null; };
  const op = used(q.openings, 'openings');
  const jn = /wall/.test(quantity) ? used(q.junctions, 'junctions') : null;
  const rv = quantity === 'finish.wall' ? used(q.reveals, 'reveals') : null;
  return {
    minArea: op ? op.minArea * AREA_UNITS[op.unit] * m2 : 0, inclusive: op ? op.inclusive : true,
    junction: jn ? jn.mode : 'centre',
    reveals: { measured: !!rv?.measured, linearUpTo: rv?.measured ? rv.linearUpTo * mm : 0 },
    fallback, unheld,
  };
}

export function methodMasonry(method) {
  const m = method?.masonry || {};
  const fallback = [], unheld = [];
  for (const k of ['measure', 'waste', 'mortar']) { if (m[k]?.state === 'not-confirmed') fallback.push(k); if (m[k]?.state === 'not-encoded') unheld.push(k); }
  return {
    unit: m.measure?.state === 'stated' ? m.measure.unit : 'm2',
    wastePct: m.waste?.state === 'stated' ? m.waste.pct : null,
    allowancePct: m.mortar?.state === 'stated' ? m.mortar.allowancePct : 0,
    fallback, unheld,
  };
}

/**
 * The reveals of a finish on one face of a wall: the returns of the finish into each opening the finish is DEDUCTED for (an
 * opening left in has none). Girth = both jambs and the head, plus the sill for a window. Depth = what the caller gives (the
 * apps give half the wall's thickness: the frame is taken to stand in the middle of the wall, with no thickness of its own).
 * A reveal no deeper than rule.reveals.linearUpTo is a length (the girth); a deeper one an area (girth × depth).
 */
export function revealsOf({ openings = [], depth = 0, rule = null } = {}) {
  const out = { area: 0, length: 0, n: 0 };
  if (!rule?.reveals?.measured || !(depth > 0)) return out;
  for (const o of openings || []) {
    if (!o || !(o.width > 0) || !(o.height > 0)) continue;
    if (!deducts(o.width * o.height, rule)) continue;
    const girth = 2 * o.height + (o.kind === 'window' ? 2 : 1) * o.width;
    out.n++;
    if (rule.reveals.linearUpTo > 0 && depth <= rule.reveals.linearUpTo) out.length += girth; else out.area += girth * depth;
  }
  return out;
}

// ------------------------------------------------------------------------------------------------------------ the words
// i18n-ignore-start: the English of each sentence; the apps' lang files hold the same words under 'qty.m.<key>' (a test keeps them equal)
export const TEXT = Object.freeze({
  'line': 'Measurement method: {name}.',
  'line.source': 'Source: {source}; read {read}.',
  'line.own': 'Loaded from an office file.',
  'review.unchecked': 'Unchecked by a quantity surveyor.',
  'review.checked': 'The file says it was checked by {by} on {date}.',
  'gross.wall.side': 'the area of one face of the wall, its length along the centre line times its height (the real face for a wall with a shaped top or base).',
  'junction.overlap': 'Where a wall ends against the run of another wall, its length is measured to the face of that wall; of two walls that cross, the thinner one loses the thickness of the other; corners are measured on the centre lines.',
  'junction.face': 'Every wall end that meets another wall is measured to the near face of that wall, and each of two walls that cross loses the thickness of the other.',
  'gross.floor': 'the area inside the outline of the floor.',
  'gross.finish.wall': 'for each finish layer of the wall type, the gross area of the wall face it covers. A finish is a layer of the wall: it is listed here and is not added to the wall area.',
  'gross.finish.ceiling': 'the area inside the outline of the ceiling.',
  'ded.wall.all': 'every door, window and other opening in the wall, its width times its height, each opening once.',
  'ded.wall.min': 'each door, window and other opening larger than {area}, its width times its height, once. An opening of {area} or less is not deducted.',
  'ded.wall.under': 'each door, window and other opening of {area} or more, its width times its height, once. An opening smaller than {area} is not deducted.',
  'ded.outline.all': 'every opening and cut-out inside that outline, each once.',
  'ded.outline.min': 'each opening and cut-out larger than {area} inside that outline, once. One of {area} or less is not deducted.',
  'ded.outline.under': 'each opening and cut-out of {area} or more inside that outline, once. One smaller than {area} is not deducted.',
  'ded.finish.all': 'the same openings as the wall, each once per face.',
  'ded.finish.min': 'each opening in the wall larger than {area}, once per face. An opening of {area} or less is not deducted.',
  'ded.finish.under': 'each opening in the wall of {area} or more, once per face. An opening smaller than {area} is not deducted.',
  'reveals.none': 'Reveals (the returns of the finish into the openings) are not measured.',
  'reveals.area': 'Reveals (the returns of the finish into each deducted opening: both jambs and the head, and the sill of a window) are measured as an area, their girth times their depth. The depth is taken as half the thickness of the wall.',
  'reveals.linear': 'Reveals (the returns of the finish into each deducted opening: both jambs and the head, and the sill of a window) are measured by their girth: as a length when no deeper than {width} mm, as an area (girth times depth) when deeper. The depth is taken as half the thickness of the wall.',
  'rule': 'Gross: {gross} Deductions: {deductions} Net: gross less deductions, never below zero.',
  'clauses': 'Read from: {clauses}.',
  'fallback': 'Not confirmed from the source, so the CadCraft default is used for: {fields}.',
  'unheld': 'The source has a rule that this method file cannot hold yet, so the CadCraft default is used for: {fields}.',
  'field.openings': 'the smallest opening deducted',
  'field.junctions': 'how wall junctions are measured',
  'field.reveals': 'reveals',
  'field.measure': 'how masonry is measured',
  'field.waste': 'waste on bricks or blocks',
  'field.mortar': 'a mortar allowance',
  'unit.m2': '{n} m²',
  'unit.ft2': '{n} ft²',
  'masonry.measure.m2': 'The method measures masonry by area, stating the thickness ({clause}).',
  'masonry.measure.m3': 'The method measures masonry by volume ({clause}).',
  'masonry.measure.number': 'The method measures masonry by the number of units ({clause}).',
  'masonry.waste': 'Waste on units from the method: {pct}% ({clause}), used where the wall type has none of its own.',
  'masonry.waste.none': 'The method states no waste on units: 0% is used unless the wall type has its own.',
  'masonry.mortar': 'Mortar allowance from the method: {pct}% ({clause}).',
  'masonry.mortar.none': 'The method states no mortar allowance: none is added.',
  'masonry.count': 'The numbers of units and the mortar volume are worked out by CadCraft from the unit size and the joint; they are not part of the measurement method.',
});
// i18n-ignore-end
const fill = (s, p = {}) => String(s).replace(/\{(\w+)\}/g, (m, k) => (p[k] !== undefined ? String(p[k]) : m));
const EN = (key, params) => fill(TEXT[key] ?? key, params);
const trim0 = (n) => String(Math.round(n * 1000) / 1000);

export function methodLine(method, tr = EN) {
  const m = method || defaultMethod();
  const src = [m.source.title, m.source.edition, m.source.publisher].filter(Boolean).join(', ');
  const parts = [tr('line', { name: m.name })];
  if (m.id !== DEFAULT_METHOD) parts.push(tr('line.source', { source: src, read: m.source.read }));
  if (m.id !== DEFAULT_METHOD && !builtinMethods().some((b) => b.id === m.id)) parts.push(tr('line.own'));
  if (m.id !== DEFAULT_METHOD) parts.push(m.review.state === 'checked' ? tr('review.checked', { by: m.review.by, date: m.review.date }) : tr('review.unchecked'));
  return parts.join(' ');
}

/** The rule of one quantity under a method, as one text. The default method's text is rules.js RULES, word for word. */
export function methodRuleText(method, quantity, tr = EN) {
  if (!QUANTITIES.includes(quantity)) return '';
  if (isDefault(method)) return tr === EN ? RULES[quantity].text : tr('default.' + quantity);
  const q = method.quantities[quantity], rule = methodRule(method, quantity);
  const op = q.openings.state === 'stated' && q.openings.minArea > 0 ? q.openings : null;
  const area = op ? tr('unit.' + op.unit, { n: trim0(op.minArea) }) : '';
  const fam = quantity === 'wall.side' ? 'wall' : quantity === 'finish.wall' ? 'finish' : 'outline';
  const gross = tr('gross.' + quantity) + (rule.junction !== 'centre' ? ' ' + tr('junction.' + rule.junction) : '');
  const ded = tr('ded.' + fam + (op ? (op.inclusive ? '.min' : '.under') : '.all'), { area });
  const parts = [tr('rule', { gross, deductions: ded })];
  if (quantity === 'finish.wall') parts.push(rule.reveals.measured ? (q.reveals.linearUpTo > 0 ? tr('reveals.linear', { width: trim0(q.reveals.linearUpTo) }) : tr('reveals.area')) : tr('reveals.none'));
  const clauses = ['openings', 'junctions', 'reveals'].map((f) => (q[f]?.state === 'stated' ? q[f].clause : '')).filter(Boolean);
  if (clauses.length) parts.push(tr('clauses', { clauses: [...new Set(clauses)].join('; ') }));
  if (rule.fallback.length) parts.push(tr('fallback', { fields: rule.fallback.map((f) => tr('field.' + f)).join(', ') }));
  if (rule.unheld.length) parts.push(tr('unheld', { fields: rule.unheld.map((f) => tr('field.' + f)).join(', ') }));
  return parts.join(' ');
}

/** What the method says about masonry, as one text (shown with the wall types' takeoff data). */
export function methodMasonryText(method, tr = EN) {
  if (isDefault(method)) return tr('masonry.count');
  const m = method.masonry, r = methodMasonry(method), parts = [];
  if (m.measure.state === 'stated') parts.push(tr('masonry.measure.' + m.measure.unit, { clause: m.measure.clause }));
  parts.push(m.waste.state === 'stated' ? tr('masonry.waste', { pct: trim0(m.waste.pct), clause: m.waste.clause }) : tr('masonry.waste.none'));
  parts.push(m.mortar.state === 'stated' ? tr('masonry.mortar', { pct: trim0(m.mortar.allowancePct), clause: m.mortar.clause }) : tr('masonry.mortar.none'));
  if (r.fallback.length) parts.push(tr('fallback', { fields: r.fallback.map((f) => tr('field.' + f)).join(', ') }));
  if (r.unheld.length) parts.push(tr('unheld', { fields: r.unheld.map((f) => tr('field.' + f)).join(', ') }));
  parts.push(tr('masonry.count'));
  return parts.join(' ');
}
