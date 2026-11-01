#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * docdata08.mjs — known answers for add-on data in the .modelcraft file (0.8, session model-08; doc-data.js).
 *
 *   node tools/modelcraft-test/docdata08.mjs      on its own
 *   run({ok, section, APP})                       from bin/test-modelcraft.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function run({ ok, section, APP }) {
  const { DocData, MAX_ADDON_BYTES } = await import(pathToFileURL(path.join(APP, 'doc-data.js')));
  section('Add-on data in the file (0.8): doc-data.js');
  let dirty = 0;
  const dd = new DocData(() => dirty++);
  const flow = dd.forAddon('flow');
  ok(flow.data('layout') === null && dd.toJSON() === null, 'nothing set: null, and no key to write');
  ok(flow.setData('layout', { items: [{ id: 1, at: [0, 1.5] }], note: 'ü' }) === true && dirty === 1, 'setData keeps JSON and marks the model unsaved');
  ok(flow.setData('layout', { items: [{ id: 1, at: [0, 1.5] }], note: 'ü' }) === true && dirty === 1, 'the same value again is not a change');
  const got = flow.data('layout'); got.items.push(1);
  ok(flow.data('layout').items.length === 1, 'data() hands out a copy');
  ok(JSON.stringify(dd.toJSON()) === '{"flow":{"layout":{"items":[{"id":1,"at":[0,1.5]}],"note":"ü"}}}', 'toJSON is { addons.<id>.<key> }');
  ok(flow.setData('bad key', 1) === false && flow.setData('f', () => 1) === false && flow.setData('c', (() => { const a = {}; a.a = a; return a; })()) === false, 'a bad key, a function or a cycle is refused');
  ok(flow.setData('layout', null) === true && dd.toJSON() === null && dirty === 2, 'null removes the key, and the last key takes the add-on out of the file');
  let threw = false; try { dd.forAddon('../x'); } catch { threw = true; }
  ok(threw, 'a bad add-on id is refused');

  section('Add-on data: pass-through and untrusted files');
  const file = { flow: { layout: { a: 1 } }, other: { k: [1, 2, 3] }, 'bad id!': { k: 1 }, arr: [1], str: 'x', ok2: { 'bad key!': 1, good: true } };
  const d2 = new DocData();
  d2.load(file);
  ok(JSON.stringify(d2.toJSON()) === '{"flow":{"layout":{"a":1}},"other":{"k":[1,2,3]},"ok2":{"good":true}}', 'ids and keys that are not plain are dropped, the rest passes through untouched');
  ok(d2.dropped.map((x) => x.id).sort().join() === 'arr,bad id!,str', 'and says which ids it dropped');
  ok(d2.forAddon('flow').data('layout').a === 1 && d2.forAddon('absent').data('x') === null, 'an add-on reads its own; one that is not there reads null');
  d2.forAddon('flow').setData('layout', { a: 2 });
  ok(d2.toJSON().other.k.length === 3, 'changing one add-on leaves the others as they came (add-ons switched off keep their data)');
  const big = new DocData();
  big.load({ huge: { k: 'x'.repeat(MAX_ADDON_BYTES + 10) }, small: { k: 1 } });
  ok(big.toJSON().small.k === 1 && !big.toJSON().huge && big.dropped[0].why === 'size', 'an add-on over the size cap is dropped whole, not kept half');
  ok(big.forAddon('small').setData('k2', 'x'.repeat(MAX_ADDON_BYTES + 10)) === false, 'and cannot grow past it');

  section('Add-on data: onOpen');
  const d3 = new DocData(); const heard = []; 
  const off = d3.forAddon('flow').onOpen(() => heard.push('flow')); d3.forAddon('other').onOpen(() => heard.push('other'));
  d3.load({ flow: { a: 1 } });
  ok(heard.join() === 'flow,other', 'every add-on hears a file open');
  d3.clear();
  ok(heard.length === 4 && d3.toJSON() === null, 'and New (clear)');
  off(); heard.length = 0; d3.load({});
  ok(heard.join() === 'other', 'unsubscribing stops it');
  d3.forAddon('other').onOpen(() => { throw new Error('x'); });
  let fine = true; const warn = console.warn; console.warn = () => {};
  try { d3.load({}); } catch { fine = false; } finally { console.warn = warn; }
  ok(fine, 'a listener that throws does not stop the open');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
  await run({ ok, section: (s) => console.log('\n== ' + s), APP: path.join(ROOT, 'public_html/assets/apps/modelcraft/dev') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
