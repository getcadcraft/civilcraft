// SPDX-License-Identifier: Apache-2.0
// node lib/office-standard/test/test.mjs — the office standard reader (BK.181) and the sync copies. The canonical files import ./annoscale.js, which each host gets from
// tools/annoscale/sync.mjs; the test builds that folder in a temp dir the same way.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url)), LIB = path.resolve(HERE, '..'), ROOT = path.resolve(LIB, '../..');
let pass = 0, fail = 0;
const ok = (c, l) => { if (c) pass++; else { fail++; console.log('  FAIL ' + l); } };
const eq = (a, b, l) => ok(JSON.stringify(a) === JSON.stringify(b), l + (JSON.stringify(a) === JSON.stringify(b) ? '' : ' → ' + JSON.stringify(a)));

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'office-std-'));
// plain copies under the real names (ES modules need a package type or .mjs: a package.json in the temp dir says module)
fs.writeFileSync(path.join(tmp, 'package.json'), '{"type":"module"}');
for (const f of ['office-standard.js', 'office-reader.js']) fs.copyFileSync(path.join(LIB, f), path.join(tmp, f));
fs.copyFileSync(path.join(ROOT, 'lib/annoscale/annoscale.js'), path.join(tmp, 'annoscale.js'));
const R = await import(pathToFileURL(path.join(tmp, 'office-reader.js')).href);
const O = await import(pathToFileURL(path.join(tmp, 'office-standard.js')).href);

const std = O.cleanOffice({ name: 'House', annotation: { heights: { text: 2.5, dimension: 3 } },
  titleBlock: { paper: 'iso-a1', fields: [{ key: 'client', label: 'Client', value: 'Acme' }, { key: 'status', label: 'Status', value: 'Draft' }] },
  drawingLayers: [{ name: 'A-WALL', color: '#112233', purpose: 'walls' }, { name: 'A-DOOR' }], templates: [{ name: 'Plan sheet', kind: 'sheet', version: 2 }, { name: 'Brief', kind: 'project' }],
  schedules: { policy: { group: 'level', totals: 'grand' } } }).standard;

// resolve
eq(R.resolve({}).from, 'none', 'nothing given: none');
ok(O.isEmpty(R.resolve({}).standard), 'nothing given: an empty standard (the app keeps its own)');
eq(R.resolve({ project: std }).from, 'project', 'the project record wins');
eq(R.resolve({ project: O.emptyOffice(), shared: { id: 'x', body: std } }).from, 'shared', 'an empty project record falls to a shared item (row.body)');
eq(R.resolve({ project: std, shared: { body: O.emptyOffice('Other') } }).standard.name, 'House', 'project over shared');
const pol = { policies: { 'all.anno.text': 3, 'all.schedule.group': 'type' } };
const fp = R.resolve({ policies: pol });
ok(fp.from === 'policies' && fp.standard.annotation.heights.text === 3 && fp.standard.schedules.policy.group === 'type', 'Default Policies describe a standard when nothing else does');
eq(R.resolve(null).from, 'none', 'null source is safe');
ok(R.resolve({ project: { format: 'x', annotation: { heights: { text: 9999 } } } }).from === 'none', 'an invalid number is dropped, so nothing is stated');

// heights
eq(R.paperHeight(std, 'text'), 2.5, 'paper height stated');
eq(R.paperHeight(std, 'tag'), null, 'not stated: null');
eq(R.paperHeight(std, 'tag', 2), 2, 'not stated: the host\'s own value');
eq(R.paperHeight(std, 'nonsense', 7), 7, 'unknown kind: own value');
eq(R.modelHeight(std, 'text', 100), 250, 'text 2.5 mm at 1:100 is 250 model mm');
eq(R.modelHeight(std, 'text', 50, null, 1000), 0.125, 'in metres: 2.5 mm x 50 / 1000');
eq(R.modelHeight(std, 'tag', 100), null, 'not stated: null model height');
eq(R.modelHeight(std, 'text', 0), null, 'bad ratio: null');

// title block
const tb = R.titleBlock(std, { client: 'Beta', job_no: '42', 'bad key': 'x' });
eq(tb.paper, 'iso-a1', 'title block paper');
eq(tb.fields.map((f) => f.key + '=' + f.value), ['client=Beta', 'status=Draft', 'job_no=42'], 'project values win; unknown valid key appended; bad key dropped');
eq(R.titleBlock(O.emptyOffice()).fields, [], 'empty standard: no fields');

// layers
const lp = R.layerPlan(std, ['a-wall', 'Notes']);
eq(lp.add.map((l) => l.name), ['A-DOOR'], 'layers to add (case-insensitive match)');
eq(lp.have, ['A-WALL'], 'layers the drawing has');
eq(lp.extra, ['Notes'], 'layers the office does not list are reported, never removed');
eq(R.layerPlan(O.emptyOffice(), ['x']).add, [], 'empty standard adds nothing');

// templates, schedules, policies, describe
eq(R.templatesOf(std, 'sheet').map((t) => t.name + ':' + t.version), ['Plan sheet:2'], 'templates by kind');
eq(R.templatesOf(std).length, 2, 'all templates');
eq(R.schedulePolicy(std), { group: 'level', totals: 'grand' }, 'schedule policy: only what is stated');
eq(R.policiesFor(std)['all.anno.text'], 2.5, 'policies for the apps');
eq(R.describe(std).map((d) => d.section), ['annotation', 'titleBlock', 'drawingLayers', 'templates', 'schedules'], 'describe: a line per stated section');
eq(R.describe(O.emptyOffice()), [], 'describe: empty says nothing');
ok(!('x' in R.schedulePolicy(std)) && Object.isFrozen(R) === false, 'plain data');

// copies
const sync = await import(pathToFileURL(path.join(ROOT, 'tools/office-standard/sync.mjs')).href);
eq(sync.FILES('cadcraft').map((x) => x[1]), ['office-standard.js', 'office-reader.js'], 'CadCraft/BimCraft file names');
eq(sync.FILES('supercadcraft').map((x) => x[1]), ['super-office.js', 'office-reader.js'], 'Super keeps super-office.js');
const sd = sync.drift(['supercadcraft']);
ok(sd.length === 0, 'Super\'s copies are byte-identical to lib/office-standard (run node tools/office-standard/sync.mjs --to supercadcraft)' + (sd.length ? ' drift: ' + sd.map((x) => x.file) : ''));
for (const app of ['cadcraft', 'bimcraft']) {   // not copied from here (their sessions' folders): report only
  const d = sync.drift([app]);
  console.log(`  note ${app}: ${d.length ? d.length + ' file(s) not yet copied (Inbox line to the app\'s session)' : 'in sync'}`);
}
for (const f of ['office-standard.js', 'office-reader.js']) ok(!/\b(document|window|localStorage|fetch)\b\s*[.(]/.test(fs.readFileSync(path.join(LIB, f), 'utf8').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')), f + ' is host-free (no DOM, storage or network)');

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
