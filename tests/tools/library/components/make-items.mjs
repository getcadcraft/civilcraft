#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * IND.7 — writes the process-component Library items (kind component, category components/process) from the cited databank in
 * lib/process/data.js (the thermo components of CH.1). Every property cites one SVN7 table row of its own; no value is typed here.
 * Failure data is never generated: the system has none to give (LibraryCatalog::COMPONENT_SUPPLIED_BY). Review state is `draft`:
 * the book was not checked by an engineer (lib/process/data.js header, D-CH4, O7).
 *
 *   node tools/library/components/make-items.mjs            → writes items/<id>.item.json and manifest.json
 *   node tools/library/components/make-items.mjs --check    → exits 1 when the files on disk differ from the databank
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const out = join(here, 'items');

// The four SVN7 tables the databank cites (lib/process/data.js SRC). One source row each, so a property cites its own table.
const SOURCES = [
  { key: 'SVN7-B1', kind: 'textbook', title: 'J.M. Smith, H.C. Van Ness, M.M. Abbott, Introduction to Chemical Engineering Thermodynamics, 7th ed. (McGraw-Hill, 2005)', note: 'Table B.1: critical constants, acentric factor, normal boiling point, heat of vaporisation at Tb' },
  { key: 'SVN7-B2', kind: 'textbook', title: 'J.M. Smith, H.C. Van Ness, M.M. Abbott, Introduction to Chemical Engineering Thermodynamics, 7th ed. (McGraw-Hill, 2005)', note: 'Table B.2: Antoine constants, ln P (kPa) = A - B/(T °C + C)' },
  { key: 'SVN7-C1', kind: 'textbook', title: 'J.M. Smith, H.C. Van Ness, M.M. Abbott, Introduction to Chemical Engineering Thermodynamics, 7th ed. (McGraw-Hill, 2005)', note: 'Table C.1: ideal-gas heat capacity, Cp/R = A + B T + C T^2 + D/T^2 (T in K)' },
  { key: 'SVN7-C4', kind: 'textbook', title: 'J.M. Smith, H.C. Van Ness, M.M. Abbott, Introduction to Chemical Engineering Thermodynamics, 7th ed. (McGraw-Hill, 2005)', note: 'Table C.4: standard enthalpy and Gibbs energy of formation at 298.15 K' },
];

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** One databank component → the item object (format 1, no uuid/version/license/provenance: the server adds those). */
export function itemFor(c) {
  const props = [];
  const add = (key, value, unit, src, table) => { if (num(value) !== null) props.push({ key, value, unit, src, table }); };
  add('Tc', c.Tc, 'K', 'SVN7-B1', 'B.1');
  add('Pc', c.Pc, 'bar', 'SVN7-B1', 'B.1');
  add('omega', c.omega, '-', 'SVN7-B1', 'B.1');
  add('Tb', c.Tb, 'K', 'SVN7-B1', 'B.1');
  add('dHvap_Tb', c.dHvapTb, 'J/mol', 'SVN7-B1', 'B.1');
  if (c.antoine) {
    add('antoine_A', c.antoine.A, '-', 'SVN7-B2', 'B.2');
    add('antoine_B', c.antoine.B, '-', 'SVN7-B2', 'B.2');
    add('antoine_C', c.antoine.C, '°C', 'SVN7-B2', 'B.2');
  }
  add('cp_A', c.cp.A, 'Cp/R', 'SVN7-C1', 'C.1');
  add('cp_B', c.cp.B, 'Cp/R, 1/K', 'SVN7-C1', 'C.1');
  add('cp_C', c.cp.C, 'Cp/R, 1/K^2', 'SVN7-C1', 'C.1');
  add('cp_D', c.cp.D, 'Cp/R, K^2', 'SVN7-C1', 'C.1');
  add('hf_298', c.hf, 'J/mol', 'SVN7-C4', 'C.4');
  add('gf_298', c.gf, 'J/mol', 'SVN7-C4', 'C.4');
  if (num(c.hfLiquid) !== null) add('hf_liquid_298', c.hfLiquid, 'J/mol', 'SVN7-C4', 'C.4');
  const id = 'substance.' + c.id;
  return {
    format: 'cadcraft-library-item', format_version: 1,
    name: c.name, kind: 'component', category: 'components/process',
    description: `Pure component ${c.name} (${c.formula}). Properties cite the Smith, Van Ness and Abbott tables in their rows; not yet checked by an engineer.`,
    plan: { layers: [], entities: [] }, body: null, params: {},
    component: {
      format: 'cadcraft-component', version: 1, id, class: 'substance', formula: c.formula,
      sources: SOURCES.map((s) => ({ ...s })),
      properties: props,
      failure_data: [],
      review: { state: 'draft', note: 'Typed from the cited tables and checked by tests against known values (Antoine at the normal boiling point, Cp at 298 K). Not yet checked against the book by an engineer (lib/process/data.js, D-CH4, O7).' },
    },
  };
}

export async function allItems() {
  const data = await import(pathToFileURL(join(root, 'lib/process/data.js')).href);
  return Object.values(data.COMPONENTS).map((c) => ({ file: `${c.id}.item.json`, item: itemFor(c) }));
}

const text = (o) => JSON.stringify(o, null, 2) + '\n';
const sha = (s) => createHash('sha256').update(s).digest('hex');

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  const list = await allItems();
  const manifest = { format: 'cadcraft-component-seed', version: 1, source: 'lib/process/data.js', items: [] };
  let drift = 0;
  if (!check) mkdirSync(out, { recursive: true });
  for (const { file, item } of list) {
    const body = text(item);
    manifest.items.push({ file, name: item.name, sha256: sha(body) });
    const path = join(out, file);
    if (check) { if (!existsSync(path) || readFileSync(path, 'utf8') !== body) { drift++; console.log('differs: ' + file); } }
    else writeFileSync(path, body);
  }
  const mtext = text(manifest);
  if (check) {
    if (!existsSync(join(out, 'manifest.json')) || readFileSync(join(out, 'manifest.json'), 'utf8') !== mtext) { drift++; console.log('differs: manifest.json'); }
    const stray = readdirSync(out).filter((f) => f.endsWith('.item.json') && !list.some((l) => l.file === f));
    for (const f of stray) { drift++; console.log('stray: ' + f); }
    console.log(drift ? `${drift} file(s) differ: run make-items.mjs` : `components: ${list.length} items match lib/process/data.js`);
    process.exit(drift ? 1 : 0);
  }
  writeFileSync(join(out, 'manifest.json'), mtext);
  console.log(`components: ${list.length} items written to tools/library/components/items/`);
}
