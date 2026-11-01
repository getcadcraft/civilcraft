/* SPDX-License-Identifier: Apache-2.0 */
/**
 * costpack.js — cost index data packs and the hand-off of a process cost estimate to TakeoffCraft's price library (0.8 Track CH, CH.23; DOM-free).
 * Owner 2026-10-29: "CEPCI index as a data add-on" — the index values are DATA a person (or a pack) supplies; nothing in the engine knows today's index.
 *
 *   A cost-index pack:  { format: 'cadcraft-cost-index-pack', version: 1, id, name, series ('CEPCI' or the person's own), base (year the correlations are based on),
 *                         values: { '2019': 607.5, … }, source (who publishes it), licence, review: { state, note } }
 *   readIndexPack(json)              → { ok, pack, problems } | { ok: false, error }     (untrusted: every field checked, years 1950–2100, values 1–100000)
 *   indexAt(pack, year)              → the value, or null (never interpolated: a missing year is said)
 *   ratio(pack, fromYear, toYear)    → I_to / I_from, or { error }
 *   parseIndexCsv(text, meta)        → a pack from "year,value" lines (a spreadsheet export)
 *   STARTER                          the bundled starter pack: two published-by-others figures, marked NOT CONFIRMED, the base year of Turton's correlations (2001 = 397) and 2019 / 2010
 *                                    as the person should replace them with their own subscription's values
 *   takeoffPack(capitalResult, meta) → a `takeoffcraft-pack` (that app's readPack accepts it): one count item per equipment row with two components (purchase, installation),
 *                                    and the costs as a labelled SAMPLE rate block (region, date, currency) the estimator ticks to install. Rates are 1/10000 of a dollar.
 * The estimate keeps every Problem of cost.js: unchecked constants, outside the correlation's range, no index.
 */
import { EQUIPMENT, LANG, TURTON_BASE } from './cost.js';

export const INDEX_FORMAT = 'cadcraft-cost-index-pack';
const str = (v, n) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n) : '');

export function readIndexPack(json) {
  const fail = (error) => ({ ok: false, error });
  if (!json || typeof json !== 'object' || Array.isArray(json) || json.format !== INDEX_FORMAT) return fail('This is not a cost index pack (format ' + INDEX_FORMAT + ').');
  if (!(json.version >= 1) || json.version > 1) return fail('Unknown pack version.');
  const id = typeof json.id === 'string' && /^[a-z0-9][a-z0-9._-]{1,63}$/.test(json.id) ? json.id : null; if (!id) return fail('The pack needs an id of lower-case letters, digits, dots, dashes.');
  const name = str(json.name, 80); if (!name) return fail('The pack needs a name.');
  const values = {}; let n = 0, dropped = 0;
  for (const [y, v] of Object.entries(json.values && typeof json.values === 'object' ? json.values : {})) {
    const yr = +y; if (!Number.isInteger(yr) || yr < 1950 || yr > 2100 || typeof v !== 'number' || !(v >= 1 && v <= 1e5)) { dropped++; continue; }
    values[String(yr)] = v; n++;
  }
  if (!n) return fail('The pack has no usable year → value pairs.');
  const base = Number.isInteger(json.base) && values[String(json.base)] != null ? json.base : null;
  const problems = [];
  if (dropped) problems.push({ code: 'costpack.dropped', severity: 'warning', text: dropped + ' value(s) were not a year and a number and were dropped.' });
  const review = { state: json.review && json.review.state === 'confirmed' && str(json.review.by, 120) && /^\d{4}-\d{2}-\d{2}$/.test(String(json.review.on)) ? 'confirmed' : 'not confirmed', note: str(json.review && json.review.note, 300) };
  if (review.state !== 'confirmed') problems.push({ code: 'costpack.review', severity: 'warning', text: 'The index values in "' + name + '" are not confirmed against the publisher: replace them with your own subscription\'s figures before a number leaves your office.' });
  return { ok: true, pack: { format: INDEX_FORMAT, version: 1, id, name, series: str(json.series, 40) || 'index', base, values, source: str(json.source, 300), licence: str(json.licence, 200), review }, problems };
}
export const indexAt = (pack, year) => (pack && pack.values && pack.values[String(year)] != null ? pack.values[String(year)] : null);
export function ratio(pack, fromYear, toYear) {
  const a = indexAt(pack, fromYear), b = indexAt(pack, toYear);
  if (a == null) return { error: 'The pack has no value for ' + fromYear + '.' };
  if (b == null) return { error: 'The pack has no value for ' + toYear + '.' };
  return { ratio: b / a, from: a, to: b };
}
export function parseIndexCsv(text, meta = {}) {
  const values = {}; for (const line of String(text).split(/\r?\n/).slice(0, 500)) { const m = /^\s*"?(\d{4})"?\s*[,;\t]\s*"?([\d.]+)"?\s*$/.exec(line); if (m) values[m[1]] = +m[2]; }
  return readIndexPack({ format: INDEX_FORMAT, version: 1, id: meta.id || 'imported-index', name: meta.name || 'Imported index', series: meta.series || 'index', base: meta.base, values, source: meta.source || 'imported by the person', licence: meta.licence || '', review: { state: 'not confirmed' } });
}
export const STARTER = {
  format: INDEX_FORMAT, version: 1, id: 'cepci-starter', name: 'CEPCI starter values (not confirmed)', series: 'CEPCI', base: 2001,
  values: { 2001: TURTON_BASE.cepci, 2010: 550.8, 2019: 607.5 },
  source: 'Chemical Engineering magazine publishes the Chemical Engineering Plant Cost Index; the 2001 value is the base of the Turton correlations in cost.js. 2010 and 2019 were typed without the publication open.',
  licence: 'The index is published by Chemical Engineering; check its terms before redistributing a series. Values here are three annual figures for examples only.',
  review: { state: 'not confirmed', note: 'Typed without the publication open. Replace with your subscription\'s values.' },
};

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'item';
const KIND_NAME = { pump_centrifugal: 'centrifugal pump', hx_fixed_tube: 'fixed-tube heat exchanger', vessel_vertical: 'vertical vessel', vessel_horizontal: 'horizontal vessel', compressor_centrifugal: 'centrifugal compressor', heater_fired: 'fired heater' };
/** @param cap the result of cost.capital(); meta { id, name, region, date, currency, plant, indexNote } */
export function takeoffPack(cap, meta = {}) {
  const id = meta.id && /^[a-z0-9][a-z0-9._-]{1,63}$/.test(meta.id) ? meta.id : 'process.estimate', date = /^\d{4}-\d{2}-\d{2}$/.test(meta.date || '') ? meta.date : new Date().toISOString().slice(0, 10);
  const lang = LANG[meta.plant] || cap.lang, keys = new Set(), items = [], rates = {};
  for (const r of cap.rows) {
    let key = 'proc.' + slug(r.name); for (let k = 2; keys.has(key); k++) key = 'proc.' + slug(r.name) + '-' + k; keys.add(key);
    const purchased = r.cost, install = r.cost * (lang - 1);
    items.push({ key, name: str(r.name + ' ' + (KIND_NAME[r.kind] || r.kind), 80), type: 'count', unit: 'EA', waste: 0, group: 'Process equipment',
      components: [{ name: 'Purchased equipment', unit: 'EA', formula: 'N', waste: 0 }, { name: 'Installation (Lang factor ' + lang + ')', unit: 'EA', formula: 'N', waste: 0 }],
      sources: ['turton', 'lang'], note: str(r.kind + ', size ' + r.A + ' ' + (EQUIPMENT[r.kind] ? EQUIPMENT[r.kind].unit : '') + '; ' + (meta.indexNote || 'base-year cost, no cost index applied'), 300) });
    rates[key] = { mat: Math.round(purchased * 1e4), lab: 0, components: { 'Purchased equipment': { mat: Math.round(purchased * 1e4), lab: 0 }, ['Installation (Lang factor ' + lang + ')']: { mat: 0, lab: Math.round(install * 1e4) } } };
  }
  return { format: 'takeoffcraft-pack', version: 1, id, packVersion: '0.1.0', name: str(meta.name || 'Process equipment estimate', 80), trade: 'Process equipment',
    description: 'Equipment from a CadCraft process cost estimate (correlations of Turton et al. and Lang factors). The costs are in the sample block; install it only if you accept them as a class 4–5 estimate.',
    author: 'CadCraft process calculators', license: 'CC0-1.0', status: 'starter', csi: [],
    sources: [{ id: 'turton', title: 'Turton, Bailie, Whiting, Shaeiwitz, Analysis, Synthesis and Design of Chemical Processes, Appendix A (cost correlations; constants not yet checked against the book)' }, { id: 'lang', title: 'Lang factors, Peters and Timmerhaus, Plant Design and Economics for Chemical Engineers' }],
    items, samples: { label: str(meta.label || 'CadCraft process cost estimate', 200), region: str(meta.region || 'USA', 120), date, currency: /^[A-Z]{3}$/.test(meta.currency || '') ? meta.currency : 'USD', rates } };
}
