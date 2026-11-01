#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
// IND.7 test: the component items (make-items.mjs) validate, cite their sources, carry no failure rates, and the user-supplied
// failure-rate import refuses what the system must never supply. Run: node tools/library/components/test.mjs
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '../../..');
const { validateItem, KINDS, CATEGORIES } = await import(pathToFileURL(join(root, 'public_html/assets/apps/bimcraft/dev/libitem.js')).href);
const { allItems, itemFor } = await import(pathToFileURL(join(here, 'make-items.mjs')).href);
const { importFailureRows, parseCsv } = await import(pathToFileURL(join(here, 'failure-import.mjs')).href);
const data = await import(pathToFileURL(join(root, 'lib/process/data.js')).href);

let pass = 0;
const ok = (name, fn) => { fn(); pass++; console.log('ok   ' + name); };

ok('component is a kind and has a category', () => {
  assert.ok(KINDS.includes('component'));
  assert.equal(CATEGORIES['components/process'], 'Process components');
});

const items = await allItems();
ok(`every databank component makes a valid item (${items.length})`, () => {
  assert.equal(items.length, Object.keys(data.COMPONENTS).length);
  for (const { file, item } of items) {
    const v = validateItem(item, { partial: true });
    assert.ok(v.ok, file + ': ' + v.errors.join('; '));
  }
});

ok('every property cites a source row, and every source is a table of the book', () => {
  for (const { item } of items) {
    const keys = new Set(item.component.sources.map((s) => s.key));
    for (const p of item.component.properties) assert.ok(keys.has(p.src), item.name + ' ' + p.key);
    for (const s of item.component.sources) assert.match(s.key, /^SVN7-(B1|B2|C1|C4)$/);
  }
});

ok('values are the databank values, not retyped', () => {
  const water = items.find((i) => i.file === 'water.item.json').item.component.properties;
  const get = (k) => water.find((p) => p.key === k)?.value;
  assert.equal(get('Tc'), data.COMPONENTS.water.Tc);
  assert.equal(get('Pc'), data.COMPONENTS.water.Pc);
  assert.equal(get('hf_liquid_298'), -285830);
  assert.equal(get('antoine_C'), data.COMPONENTS.water.antoine.C);
});

ok('no item carries failure rates, and every item is a draft, never reviewed', () => {
  for (const { item } of items) {
    assert.deepEqual(item.component.failure_data, []);
    assert.equal(item.component.review.state, 'draft');
    assert.equal(item.component.review.checked_by, undefined);
  }
});

ok('a rate from the system is refused by the format (supplied_by must be a person)', () => {
  const bad = structuredClone(items[0].item);
  bad.component.failure_data = [{ mode: 'x', rate: 1, unit: 'per_hour', basis: '', source: 'SVN7-B1', supplied_by: 'system' }];
  const v = validateItem(bad, { partial: true });
  assert.equal(v.ok, false);
  assert.ok(v.errors.some((e) => /never supplied by the system/.test(e)));
});

ok('reviewed needs a checker name', () => {
  const bad = structuredClone(items[0].item);
  bad.component.review = { state: 'reviewed' };
  assert.equal(validateItem(bad, { partial: true }).ok, false);
});

const water = items.find((i) => i.file === 'water.item.json').item;
const good = readFileSync(join(here, 'fixtures/rates-good.csv'), 'utf8');

ok('user rates are added with the user as supplier, review state unchanged', () => {
  const withSource = structuredClone(water);
  withSource.component.sources.push({ key: 'USER-1', kind: 'user', title: 'Plant log 2019 (example)' });
  const r = importFailureRows(withSource, good, { suppliedBy: 'user' });
  assert.ok(r.ok, r.errors.join('; '));
  assert.equal(r.added, 1);
  assert.equal(r.item.component.failure_data[0].supplied_by, 'user');
  assert.equal(r.item.component.failure_data[0].rate, 1.2e-5);
  assert.equal(r.item.component.review.state, 'draft');
  assert.equal(validateItem(r.item, { partial: true }).ok, true);
});

ok('a rate whose source row the item does not have is refused', () => {
  const csv = readFileSync(join(here, 'fixtures/rates-no-source.csv'), 'utf8');
  const r = importFailureRows(water, csv);
  assert.equal(r.ok, false);
  assert.match(r.errors[0], /not a source row of this item/);
});

ok('negative and unknown-unit rows are refused, line by line', () => {
  const csv = readFileSync(join(here, 'fixtures/rates-bad.csv'), 'utf8');
  const r = importFailureRows(water, csv);
  assert.equal(r.ok, false);
  assert.equal(r.errors.length, 2);
  assert.match(r.errors[0], /line 2/);
  assert.match(r.errors[1], /line 3/);
});

ok('the system can never be the supplier', () => {
  assert.equal(importFailureRows(water, good, { suppliedBy: 'system' }).ok, false);
});

ok('CSV reader handles quoted commas and CRLF', () => {
  assert.deepEqual(parseCsv('a,"b, c",d\r\n1,"x ""q""",3\r\n'), [['a', 'b, c', 'd'], ['1', 'x "q"', '3']]);
});

ok('the generated files on disk match the databank', () => {
  const dir = join(here, 'items');
  const files = readdirSync(dir).filter((f) => f.endsWith('.item.json'));
  assert.equal(files.length, items.length);
});

console.log(`components: ${pass} passed, 0 failed`);
