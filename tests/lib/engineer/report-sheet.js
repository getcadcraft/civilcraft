/* SPDX-License-Identifier: Apache-2.0 */
/**
 * report-sheet.js — IND.5: a Generated body's data sheet as a clause-traced calculation report (lib/report/calc.js).
 * The generator's header values are the inputs; each numeric data-sheet row is a result; the row's `ref` (its source) is the clause and
 * becomes one equation entry, so a row with no ref is traced to the generator itself (its id and script hash). Text rows are left out
 * of the results (a report result is a number). The signature line is the kit's and stays blank. DOM-free.
 *   reportFromSheet({ title, generator: {id, title, hash}, inputs: {name: value}, rows: [{name, value, unit, ref, note}], engine?, date, by })
 *     → { ok, report, markdown, html, errors }
 */
import { FORMAT, VERSION, validate, toMarkdown, toHtml } from '../report/calc.js';

const clean = (s, n) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const label = (k) => clean(String(k).replace(/_/g, ' '), 120);

export function reportFromSheet(o) {
  const gen = o.generator || {}, who = gen.title || gen.id || 'generator';
  const own = clean(who + (gen.hash ? ' (script ' + String(gen.hash).slice(0, 12) + ')' : ''), 190);
  const eqs = [], eqId = new Map();
  const equationFor = (clause) => {
    const c = clean(clause, 190) || own;
    if (!eqId.has(c)) { const id = 'EQ-' + (eqs.length + 1); eqId.set(c, id); eqs.push({ id, text: 'Computed by ' + clean(who, 100) + ': ' + c, clause: c }); }
    return eqId.get(c);
  };
  const inputs = Object.entries(o.inputs || {}).map(([k, v]) => ({
    name: label(k), symbol: clean(k, 20), value: typeof v === 'number' && Number.isFinite(v) ? v : clean(typeof v === 'object' ? JSON.stringify(v) : v, 80) || '-', unit: '-',
  }));
  const results = (o.rows || []).filter((r) => typeof r.value === 'number' && Number.isFinite(r.value))
    .map((r) => ({ name: label(r.name), symbol: clean(r.name, 20), value: r.value, unit: clean(r.unit, 20) || '-', equation: equationFor(r.ref), clause: clean(r.ref, 190) || own }));
  const report = {
    format: FORMAT, version: VERSION, id: clean(o.id, 60) || undefined, title: clean(o.title, 160) || label(who),
    engine: { id: clean(gen.id || who, 80), version: clean(o.engineVersion || '0.8', 40) },
    inputs, equations: eqs, results,
    revisions: [{ rev: 'A', date: clean(o.date, 10), by: clean(o.by, 120) || 'CadCraft Engineer', change: 'Issued from the data sheet' }],
  };
  const v = validate(report);
  if (!v.ok) return { ok: false, errors: v.errors, report };
  return { ok: true, report, markdown: toMarkdown(report), html: toHtml(report), errors: [] };
}
