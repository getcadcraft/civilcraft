/* SPDX-License-Identifier: Apache-2.0 */
/**
 * packs.js — author, check and cover the data packs of process safety (0.8 Track CH, CH.17 and CH.18; DOM-free).
 * The regulation numbers (threshold quantities, the classification table of IEC 60079-10-1 / API RP 505, the reactive-group matrix) are CONTENT that a person with
 * the document open types (rule 29: nothing is typed here, KICKOFF rule 44: content goes through the Library). What a session can build is the way to make
 * those packs without error: spreadsheets (CSV) in, a validated pack out, every row with its clause, quantities converted by an exact definition, and a report of
 * what is NOT covered (silence is never "compatible").
 *   thresholdPackFromCsv(csv, meta)   columns: id, clause, name, cas, group, basis (process|location|site), qty, unit (kg|lb|t), note. A row with no clause or quantity is refused.
 *   reactivityPackFromCsv(groupsCsv, pairsCsv, meta)   groups: id, name; pairs: a, b, effect, note.
 *   areaPackFromCsv(csv, meta)        columns: grade, degree, availability, zone (Zone 0|1|2|NE|...), clause; + meta.k { continuous, primary, secondary } (the dilution k factors, the person's)
 *   coverage(pack)                    reactivity: how many group pairs have a statement; the list of those that have none.
 *   lint(kind, pack)                  what the strict cleaner dropped or changed, so a pack never "loses" a rule silently.
 *   TEMPLATES                         the CSV headers, for the Library's authoring page.
 * Every pack carries `review: not confirmed` until meta.review names a person and a date.
 */
import { parseCsv } from '../env/lims.js';
import { cleanThresholdPack, cleanReactivityPack } from './inventory.js';
import { cleanPack as cleanAreaPack, GRADES, DEGREES, AVAIL, ZONES } from './area.js';
import { problem } from './common.js';

export const TEMPLATES = {
  threshold: 'id,clause,name,cas,group,basis,qty,unit,note',
  reactivityGroups: 'id,name',
  reactivityPairs: 'a,b,effect,note',
  area: 'grade,degree,availability,zone,clause',
};
const UNIT_TO_KG = { kg: 1, lb: 0.45359237, t: 1000 };                 // the pound is defined as exactly 0.45359237 kg; a (metric) tonne is 1000 kg
const rv = (m) => (m && m.review && m.review.by && /^\d{4}-\d{2}-\d{2}$/.test(m.review.date || '') ? { state: 'confirmed', by: String(m.review.by).slice(0, 80), date: m.review.date } : { state: 'not confirmed' });
const rows = (csv) => parseCsv(String(csv || '')).map((r) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '').trim()]))).filter((r) => Object.values(r).some(Boolean));

export function thresholdPackFromCsv(csv, meta = {}) {
  const problems = [], out = [], seen = new Set();
  rows(csv).forEach((r, i) => {
    const line = i + 2, at = [{ id: 'row ' + line }];
    if (!r.clause) { problems.push(problem('pack.noclause', 'error', `Row ${line} (${r.name || r.id || '?'}) has no clause: every threshold names the clause it comes from.`, at)); return; }
    const q = Number(r.qty), f = UNIT_TO_KG[(r.unit || 'kg').toLowerCase()];
    if (!(q > 0) || !f) { problems.push(problem('pack.noqty', 'error', `Row ${line} (${r.name || r.id || '?'}) needs a positive quantity and the unit kg, lb or t.`, at)); return; }
    if (!r.cas && !r.group) { problems.push(problem('pack.nomatch', 'error', `Row ${line} (${r.name || '?'}) matches nothing: give a CAS number or a reactive group.`, at)); return; }
    const id = r.id || 'T' + (out.length + 1); if (seen.has(id)) { problems.push(problem('pack.dupid', 'error', `Row ${line}: id ${id} is used twice.`, at)); return; } seen.add(id);
    out.push({ id, clause: r.clause, name: r.name, match: { cas: r.cas, group: r.group }, basis: ['process', 'location', 'site'].includes(r.basis) ? r.basis : 'site', qty: q * f });
  });
  const pack = cleanThresholdPack({ format: 'cadcraft-threshold-pack', version: 1, id: meta.id || 'pack', name: meta.name || 'Threshold pack', jurisdiction: meta.jurisdiction || '', regulation: meta.regulation || '', edition: meta.edition || '', review: rv(meta), warnFraction: meta.warnFraction ?? 0.8, rules: out });
  return { pack: problems.some((p) => p.severity === 'error') && !out.length ? null : pack, problems, rows: out.length };
}
export function reactivityPackFromCsv(groupsCsv, pairsCsv, meta = {}) {
  const problems = [], groups = rows(groupsCsv).map((g) => ({ id: g.id, name: g.name })).filter((g) => g.id), ids = new Set(groups.map((g) => g.id)), pairs = [];
  rows(pairsCsv).forEach((p, i) => {
    const line = i + 2; if (!ids.has(p.a) || !ids.has(p.b)) { problems.push(problem('pack.group', 'error', `Pair row ${line}: "${p.a}" and "${p.b}" must both be declared groups.`, [{ id: 'row ' + line }])); return; }
    if (!p.effect) { problems.push(problem('pack.noeffect', 'warning', `Pair row ${line}: ${p.a} with ${p.b} names no effect.`, [{ id: 'row ' + line }])); return; }
    pairs.push({ a: p.a, b: p.b, effect: p.effect, note: p.note });
  });
  const pack = cleanReactivityPack({ format: 'cadcraft-reactivity-pack', version: 1, id: meta.id || 'pack', name: meta.name || 'Reactivity pack', review: rv(meta), groups, pairs });
  return { pack, problems, coverage: coverage(pack) };
}
/** Of all group pairs (including a group with itself), how many have a statement. A missing pair is NOT compatible: it is unknown. */
export function coverage(pack) {
  const g = pack.groups.map((x) => x.id), have = new Set(pack.pairs.map((p) => [p.a, p.b].sort().join('|'))), missing = [];
  for (let i = 0; i < g.length; i++) for (let j = i; j < g.length; j++) { const key = [g[i], g[j]].sort().join('|'); if (!have.has(key)) missing.push([g[i], g[j]]); }
  const total = g.length * (g.length + 1) / 2;
  return { groups: g.length, pairs: total, stated: total - missing.length, missing, fraction: total ? (total - missing.length) / total : 0, note: 'a missing pair is unknown, never compatible' };
}
export function areaPackFromCsv(csv, meta = {}) {
  const problems = [], zones = {};
  rows(csv).forEach((r, i) => {
    const line = i + 2, at = [{ id: 'row ' + line }];
    if (!r.clause) { problems.push(problem('pack.noclause', 'error', `Row ${line}: every cell of the table names its clause.`, at)); return; }
    if (!r.grade || !r.degree || !r.availability || !r.zone) { problems.push(problem('pack.cell', 'error', `Row ${line}: give grade, degree, availability and zone.`, at)); return; }
    ((zones[r.grade] ||= {})[r.degree] ||= {})[r.availability] = r.zone;
  });
  for (const g of GRADES) for (const d of DEGREES) for (const a of AVAIL) {
    const z = zones[g]?.[d]?.[a]; if (z == null) problems.push(problem('pack.missingcell', 'error', `The table has no cell for ${g} grade, ${d} ventilation, ${a} availability: all 27 cells are needed.`, [{ id: `${g}/${d}/${a}` }]));
    else if (!ZONES.includes(z)) problems.push(problem('pack.zone', 'error', `"${z}" is not a zone (${ZONES.join(', ')}) for ${g}/${d}/${a}.`, [{ id: `${g}/${d}/${a}` }]));
  }
  if (problems.some((p) => p.severity === 'error')) return { pack: null, problems, complete: false };
  const pack = cleanAreaPack({ format: 'cadcraft-area-pack', version: 1, id: meta.id || 'pack', name: meta.name || 'Area classification pack', standard: meta.standard || '', edition: meta.edition || '', review: rv(meta), zones, k: meta.k || { continuous: 0.25, primary: 0.25, secondary: 0.5 } });
  if (!meta.k) problems.push(problem('pack.k', 'warning', 'No dilution k factors were given: the screening values 0.25 / 0.25 / 0.5 are in the pack; replace them from the standard.', [{ id: 'k' }]));
  return { pack, problems, complete: true };
}
/** What the strict cleaner changed: counts of rules in and out, so nothing disappears quietly. */
export function lint(kind, pack) {
  const clean = kind === 'threshold' ? cleanThresholdPack(pack) : kind === 'reactivity' ? cleanReactivityPack(pack) : cleanAreaPack(pack), problems = [];
  if (!clean) return { pack: null, problems: [problem('pack.format', 'error', 'This is not a ' + kind + ' pack (format or version).', [{ id: kind }])] };
  const nIn = kind === 'threshold' ? (pack.rules || []).length : kind === 'reactivity' ? (pack.pairs || []).length : Object.keys(pack.zones || {}).length;
  const nOut = kind === 'threshold' ? clean.rules.length : kind === 'reactivity' ? clean.pairs.length : Object.keys(clean.zones || {}).length;
  if (nOut < nIn) problems.push(problem('pack.dropped', 'warning', `${nIn - nOut} entr${nIn - nOut === 1 ? 'y was' : 'ies were'} dropped by the strict reader (missing fields or unknown groups).`, [{ id: kind }]));
  if (clean.review.state !== 'confirmed') problems.push(problem('pack.unreviewed', 'info', 'The pack is not confirmed by a named person with a date: every check using it says so.', [{ id: kind }]));
  return { pack: clean, problems };
}
