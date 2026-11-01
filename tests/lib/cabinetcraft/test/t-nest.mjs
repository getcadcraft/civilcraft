/* SPDX-License-Identifier: Apache-2.0 */
// Round 2 (DC.117): the nest off the page's thread (lib/nestasync.js, lib/nest-worker.js): same result as the plain nest, progress reported, the page given back,
// a worker that fails falls back to the page; and a shop's OWN rates (importRates), the generic XML hole list.
const { ok, section, near, mine, EN, ADDON } = globalThis.__ccTest;
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const P = await mine('lib/project.js');
const An = await mine('lib/analyze.js');
const NA = await mine('lib/nestasync.js');
const W = await mine('lib/nest-worker.js');
const Sh = await mine('lib/sheets.js');
const Es = await mine('lib/estimate.js');
const X = await mine('lib/export.js');
const E = await mine('lib/edit.js');

const sample = P.sampleProject('mm', { name: 'x', north: 'N', east: 'E' });
const build = An.analyze(sample, {}).build;
const opts = { tries: 2, timeLimit: 3000, seed: 1 };
const sig = (r) => JSON.stringify({ sheets: r.sheets, unplaced: r.unplaced.length, eff: r.efficiency.map((e) => [e.material, e.sheets, Math.round(e.efficiency * 1e6)]), n: r.mats.map((m) => m.result.placed.length) });

section('Nest: off the page\'s thread');
{
  const plain = Sh.nestAll(build.parts, { sheetOf: An.sheetOfFor(build.project, (k) => k), margin: build.project.sheet.margin, spacing: build.project.sheet.spacing, ...opts });
  const groups = Sh.nestGroups(build.parts).length;
  // 1. the page's own thread, one material at a time
  let yields = 0; const seen = [];
  const t0 = Date.now();
  const viaPage = await NA.nestAsync(build, { ...opts, yieldFn: async () => { yields++; await new Promise((r) => setTimeout(r, 0)); }, onProgress: (p) => seen.push(p) });
  const ms = Date.now() - t0;
  ok(sig(viaPage) === sig(plain) && viaPage.seq.length === plain.seq.length && viaPage.mats.every((m, i) => m.sheetBase === plain.mats[i].sheetBase), 'without a worker the result is the plain nest\'s (same sheets, parts, order, sheet numbering)');
  ok(yields === groups && groups >= 4, 'the page is given back before each of the ' + groups + ' materials (' + yields + ' yields)');
  ok(seen.length > 0 && seen.every((p) => p.via === 'page' && p.group >= 1 && p.group <= p.groups && p.done >= 1 && p.done <= p.total && p.material) && seen.at(-1).group === groups, 'progress is reported after each try: ' + seen.length + ' reports, the last for material ' + seen.at(-1).group);
  ok(viaPage.unplaced.length === 0, 'every part is placed');
  // 2. a worker (a stand-in that runs lib/nest-worker.js's handle() the way a worker would, messages cloned)
  const made = { n: 0, terminated: 0 };
  const makeWorker = () => {
    made.n++;
    const w = { postMessage(msg) { const m = JSON.parse(JSON.stringify(msg)); setTimeout(() => { try { W.handle(m, (out) => setTimeout(() => w.onmessage({ data: JSON.parse(JSON.stringify(out)) }), 0)); } catch (e) { w.onmessage({ data: { type: 'error', message: e.message } }); } }, 0); }, terminate() { made.terminated++; } };
    return w;
  };
  const prog = [];
  const viaWorker = await NA.nestAsync(build, { ...opts, makeWorker, yieldFn: async () => { throw new Error('the page must not be used'); }, onProgress: (p) => prog.push(p) });
  ok(sig(viaWorker) === sig(plain), 'on a worker the result is the same again');
  ok(made.n === 1 && made.terminated === 1, 'one worker, stopped when done');
  ok(prog.length > 0 && prog.every((p) => p.via === 'worker') && prog.at(-1).group === groups, 'progress comes from the worker: ' + prog.length + ' reports');
  // the nest gives a nestDxf-able, labelable result
  ok(Sh.nestDxf(viaWorker, { units: 'mm' }).includes('SECTION') && Sh.labelsOf(build.parts, viaWorker, {}).length > 50, 'the worker\'s result works for the DXF and the labels');
  // 3. a worker that fails falls back
  const broken = { postMessage() { setTimeout(() => this.onerror(new Error('no module worker')), 0); }, terminate() {} };
  let y2 = 0;
  const fb = await NA.nestAsync(build, { ...opts, makeWorker: () => broken, yieldFn: async () => { y2++; } });
  ok(sig(fb) === sig(plain) && y2 === groups, 'a worker that errors: the same nest runs on the page instead');
  const fb2 = await NA.nestAsync(build, { ...opts, makeWorker: () => { throw new Error('no Worker'); }, yieldFn: async () => {} });
  ok(sig(fb2) === sig(plain), 'a worker that cannot be made: the page');
  const bad = { postMessage() { setTimeout(() => this.onmessage({ data: { type: 'error', message: 'boom' } }), 0); }, terminate() {} };
  ok(sig(await NA.nestAsync(build, { ...opts, makeWorker: () => bad, yieldFn: async () => {} })) === sig(plain), 'a worker that answers with an error: the page');
  ok((() => { try { W.handle({ type: 'x' }, () => {}); return false; } catch { return true; } })(), 'the worker refuses a message it does not know');
  console.log('  (page-thread nest of the example kitchen, 2 tries a material: ' + ms + ' ms in all; the longest single material is the longest block)');
  // the longest block on the page without a worker
  let longest = 0;
  const g = Sh.nestGroups(build.parts);
  for (const grp of g) { const a = Date.now(); Sh.nestOne(grp, 0, { sheetOf: An.sheetOfFor(build.project, (k) => k), margin: 10, spacing: 8, tries: 6, timeLimit: 4000, seed: 1 }); longest = Math.max(longest, Date.now() - a); }
  ok(longest > 0, 'longest single material, 6 tries: ' + longest + ' ms (what the page waits for at a time when no worker can be started)');
}

section('Cost: a shop\'s own rates');
{
  const csv = 'path,value\n# my shop\nlabour.perHour,62.5\nmarkup,0.3\nsheet.melamine-18,51\ncurrency,eur\nfoo.bar,3\nhardware.hinge,abc\nmarkup2,1\n';
  const r = Es.importRates(csv);
  ok(r.values['labour.perHour'] === 62.5 && r.values.markup === 0.3 && r.values['sheet.melamine-18'] === 51 && r.values.currency === 'EUR', 'CSV: path,value lines, a header and comments skipped');
  ok(r.ignored.map((x) => x.key + ':' + x.reason).join() === 'foo.bar:unknown,hardware.hinge:bad,markup2:unknown', 'unknown paths and unusable numbers are listed, not taken', JSON.stringify(r.ignored));
  const j = Es.importRates(JSON.stringify({ rates: { labour: { perHour: 70, evil: 1 }, hardware: { hinge: 2.9 }, markup: 'x' } }));
  ok(j.values['labour.perHour'] === 70 && j.values['hardware.hinge'] === 2.9 && j.ignored.length === 2, 'JSON in the job\'s own shape (or { rates })');
  ok(Es.importRates('{broken').applied.length === 0 && Es.importRates('').applied.length === 0 && Es.importRates(null).applied.length === 0, 'nothing usable in: nothing out');
  ok(Es.importRates('labour.perHour,-5\nlabour.base,1e9\nlabour.drawers,1.4').applied.join() === 'labour.drawers', 'negative and absurd numbers are not rates');
  const sheet = Es.rateSheetCsv({ labour: { perHour: 60 } });
  const rows = sheet.trim().split(/\r?\n/);
  ok(rows[0] === 'path,value,placeholder' && rows.length === Es.leafPaths().length + 1 && rows.find((x) => x.startsWith('labour.perHour')) === 'labour.perHour,60,no' && rows.find((x) => x.startsWith('markup,')).endsWith('yes'), 'the rate sheet: every rate, the value now, whether it is still a placeholder');
  ok(Es.importRates(sheet).applied.length === Es.leafPaths().length, 'the sheet imports straight back');
  let p = P.sampleProject('mm', {});
  const before = An.analyze(p, {}).est;
  const m = E.mergeRates(p, 'labour.perHour,60\nmarkup,0.3\nsheet.melamine-18,51');
  const after = An.analyze(m.project, {}).est;
  ok(m.applied.length === 3 && m.project.rates.labour.perHour === 60 && m.project.rates.markup === 0.3, 'merged into the job\'s rates, saved with the job', JSON.stringify(m.project.rates));
  ok(after.total !== before.total && after.placeholders < before.placeholders && !after.allPlaceholder, 'the estimate moves and counts fewer placeholders (' + before.placeholders + ' → ' + after.placeholders + ' of ' + after.rows.length + ')');
  ok(after.rows.find((x) => x.path === 'labour.perHour').placeholder === false && after.rows.find((x) => x.path === 'hardware.hinge').placeholder === true, 'rows on the shop\'s rate are not placeholders; the rest still are');
  ok(Es.DEFAULT_RATES.hardware.carousel > 0 && An.analyze(P.cleanProject({ unit: 'mm', runs: [{ id: 'A', wall: 'N', base: [{ kind: 'cab', tpl: 'base-corner-lazy', w: 900 }] }] }), {}).est.rows.some((x) => x.path === 'hardware.carousel' && x.placeholder), 'the carousel set is a labelled placeholder like every rate');
  const again = E.mergeRates(m.project, 'labour.perHour,65');
  ok(again.project.rates.labour.perHour === 65 && again.project.rates.markup === 0.3, 'a later import changes only what it names');
  ok(JSON.stringify(P.cleanProject(JSON.parse(JSON.stringify(m.project))).rates) === JSON.stringify(m.project.rates), 'saved and read back unchanged');
}

section('Drilling: the generic XML hole list');
{
  const xml = X.drillXml(build, { word: (k) => EN[k] || k });
  ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') && /<cabinetcraft-holes format="cabinetcraft-holes" version="1" generic="true" unit="mm"/.test(xml), 'an XML file with a root that says what it is and that it is generic');
  ok(/Not the file format of any boring machine/.test(xml.split('\n')[1]) || /Not the file format/.test(xml), 'it says in the file that it is not a machine format');
  const panels = (xml.match(/<panel /g) || []).length, holes = (xml.match(/<hole /g) || []).length;
  const csvHoles = X.drillCsv(build, {}).trim().split(/\r?\n/).length - 1;
  ok(panels > 10 && holes === csvHoles, 'the same holes as the CSV: ' + holes + ' holes in ' + panels + ' panels');
  ok(/<panel id="B\d+-\d+" cabinet="B\d+" name="[^"]+" qty="\d" length="\d+" width="\d+" thickness="18" material="[^"]+" face="inside">/.test(xml), 'a panel says its id, cabinet, size, thickness, material and face');
  ok(/<hole kind="(shelf-pin|plate|cup|slide)" x="[\d.]+" y="[\d.]+" diameter="[\d.]+" depth="[\d.]+" side="(both|left|right)"\/>/.test(xml), 'a hole says kind, x, y, diameter, depth and which of a pair takes it');
  const named = P.cleanProject({ ...sample, name: 'A "quoted" <job> & more' });
  const x2 = X.drillXml(An.analyze(named, {}).build, {});
  ok(x2.includes('job="A &quot;quoted&quot; job &amp; more"') && !/<job>/.test(x2), 'names are escaped');
  ok(!/[\u0000-\u0008]/.test(x2), 'no control characters');
  // well-formed: every tag opened is closed (a tiny check, the browser test parses it with DOMParser)
  const opens = (xml.match(/<panel /g) || []).length, closes = (xml.match(/<\/panel>/g) || []).length;
  ok(opens === closes && xml.trim().endsWith('</cabinetcraft-holes>'), 'every panel is closed');
  ok(X.drillXml(P.cleanProject({ unit: 'in', runs: [{ id: 'A', wall: 'S', base: [{ kind: 'cab', tpl: 'base-door', w: 24 }] }] }) && An.analyze(P.cleanProject({ unit: 'in', runs: [{ id: 'A', wall: 'S', base: [{ kind: 'cab', tpl: 'base-door', w: 24 }] }] }), {}).build).includes('unit="in"'), 'an inch job says unit="in"');
}

section('Nest worker: its modules can be linked as blob modules');
{
  const B = await mine('lib/blobworker.js');
  const lib = path.join(ADDON, 'lib');
  const graph = await B.blobGraph(pathToFileURL(path.join(lib, 'nest-worker.js')).href, { fetchText: async (u) => fs.readFileSync(fileURLToPath(u), 'utf8'), makeUrl: (src) => 'blob:' + src.length + ':' + Math.random() });
  ok(graph.urls.size >= 6 && [...graph.urls.keys()].some((u) => /nest\/nest\.js$/.test(u)) && [...graph.urls.keys()].some((u) => /cutlist\/cutlist\.js$/.test(u)), 'the worker\'s whole module graph is found, each module once: ' + [...graph.urls.keys()].map((u) => u.replace(/^.*lib\//, '')).join(' '));
  ok([...graph.urls.keys()].every((u) => !/main\.js|ui\.js|model\.js/.test(u) || /model\.js/.test(u)), 'the worker takes no DOM module (no ui.js, no main.js)');
  ok(B.depsOf("import { a } from './x.js';\nexport * from '../y/z.js';\n// import q from './nope.js'\nconst s = \"from './str.js'\";\nimport './side.js';").join() === './x.js,../y/z.js,./side.js', 'only real import lines count, not a comment or a string');
  let cyc = '';
  try { await B.blobGraph('http://x/a.js', { fetchText: async (u) => (u.endsWith('a.js') ? "import './b.js';" : "import './a.js';"), makeUrl: () => 'blob:x' }); } catch (e) { cyc = e.message; }
  ok(/cycle/.test(cyc), 'an import cycle is an error (the page then nests on its own thread)');
}
