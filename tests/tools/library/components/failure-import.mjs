#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * IND.7 — failure-rate data that a person supplies, added to a component item. The system never supplies a rate: every row of the
 * CSV must name a source row that is already in the item (the user adds it first, e.g. "Plant log 2019, pump P-101"), and the rows
 * are marked as the user's (or the community's). The review state is not changed: a rate is not "reviewed" until someone checks it.
 *
 *   node tools/library/components/failure-import.mjs rates.csv --item component.item.json [--supplied-by user|community] [--out file]
 *
 * CSV columns (a header line is required): mode,rate,unit,basis,source
 *   rate  a number, 0 or more (no thousands separators); unit per_hour | per_demand | per_year
 *   source the key of a source row in the item's component.sources
 * Exports importFailureRows(item, csvText, {suppliedBy}) → {ok, item, errors} for the test and any other caller.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const { validateItem, COMPONENT } = await import(pathToFileURL(join(root, 'public_html/assets/apps/bimcraft/dev/libitem.js')).href);

/** A small CSV reader: commas, double quotes with "" escapes, CRLF or LF. Returns rows of trimmed cells. */
export function parseCsv(text) {
  const rows = []; let row = []; let cell = ''; let q = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (q) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') q = false;
      else cell += ch;
    } else if (ch === '"') q = true;
    else if (ch === ',') { row.push(cell.trim()); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(cell.trim()); cell = '';
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
    } else cell += ch;
  }
  row.push(cell.trim());
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}

export function importFailureRows(item, csvText, { suppliedBy = 'user' } = {}) {
  const errors = [];
  if (!COMPONENT.suppliedBy.includes(suppliedBy)) return { ok: false, item, errors: ['supplied-by must be user or community: the system never supplies failure rates'] };
  const c = item?.component;
  if (!c || typeof c !== 'object') return { ok: false, item, errors: ['the item has no component record'] };
  const sourceKeys = new Set((c.sources ?? []).map((s) => s.key));
  const rows = parseCsv(String(csvText ?? ''));
  const head = (rows[0] ?? []).map((h) => h.toLowerCase());
  const want = ['mode', 'rate', 'unit', 'basis', 'source'];
  if (want.some((w) => !head.includes(w))) return { ok: false, item, errors: ['the first line must name the columns: ' + want.join(',')] };
  const col = (r, name) => r[head.indexOf(name)] ?? '';
  const added = [];
  rows.slice(1).forEach((r, i) => {
    const n = i + 2;   // the line in the file
    const rate = col(r, 'rate');
    if (!/^\d+(\.\d+)?(e-?\d+)?$/i.test(rate)) { errors.push(`line ${n}: rate "${rate}" is not a number, 0 or more`); return; }
    if (!COMPONENT.rateUnits.includes(col(r, 'unit'))) { errors.push(`line ${n}: unit must be ${COMPONENT.rateUnits.join(', ')}`); return; }
    if (!col(r, 'mode')) { errors.push(`line ${n}: mode is empty`); return; }
    if (!sourceKeys.has(col(r, 'source'))) { errors.push(`line ${n}: source "${col(r, 'source')}" is not a source row of this item: add it to component.sources first`); return; }
    added.push({ mode: col(r, 'mode'), rate: Number(rate), unit: col(r, 'unit'), basis: col(r, 'basis'), source: col(r, 'source'), supplied_by: suppliedBy });
  });
  if (errors.length) return { ok: false, item, errors };
  const next = structuredClone(item);
  next.component.failure_data = [...(c.failure_data ?? []), ...added];
  const v = validateItem(next, { partial: true });
  if (!v.ok) return { ok: false, item, errors: v.errors };
  return { ok: true, item: next, errors: [], added: added.length };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const opt = (name, def = null) => { const i = args.indexOf(name); return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def; };
  const csvPath = args.find((a, i) => !a.startsWith('--') && (i === 0 || !args[i - 1].startsWith('--')));
  const itemPath = opt('--item');
  if (!csvPath || !itemPath) { console.error('usage: failure-import.mjs rates.csv --item component.item.json [--supplied-by user|community] [--out file]'); process.exit(2); }
  const r = importFailureRows(JSON.parse(readFileSync(itemPath, 'utf8')), readFileSync(csvPath, 'utf8'), { suppliedBy: opt('--supplied-by', 'user') });
  if (!r.ok) { for (const e of r.errors) console.error(e); process.exit(1); }
  const dest = opt('--out', itemPath);
  writeFileSync(dest, JSON.stringify(r.item, null, 2) + '\n');
  console.log(`${r.added} failure rate(s) added to ${dest}; review state unchanged (${r.item.component.review.state})`);
}
