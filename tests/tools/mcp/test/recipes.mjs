#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * recipes.mjs — every recipe in the help topic assistants-recipes (assets/help/common/assistants-recipes.md) and in the 0.7
 * release note (docs/releases/0.7/assistants.md § Recipes) replayed with the same tool calls through the file server's tools
 * (0.7 AS.7, session assistants). A recipe in either text with no replay here fails the run: a recipe that can't be run is
 * cut, never left in the copy.
 *
 *   node tools/mcp/test/recipes.mjs [--verbose] [--package <installed @getcadcraft/mcp>]   (also from bin/test-agents.mjs)
 *
 * Files: the public fixtures (fixtures/dwg, fixtures/showcase/bimcraft-house.ifc, the takeoff of tools/mcp/test/fixtures),
 * a site project with a pad and an ISO 4017 screw made here by the apps' own code, all in a temporary folder.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..');
const VERBOSE = process.argv.includes('--verbose');
// --package <dir>: replay through an installed @getcadcraft/mcp (its mcp/ and cli/) instead of this repo's tools (AS.8)
const PI = process.argv.indexOf('--package');
const PKG = PI > 0 ? path.resolve(process.argv[PI + 1]) : null;
const TOOLS_JS = PKG ? path.join(PKG, 'cli/headless/tools.mjs') : path.join(ROOT, 'tools/cli/headless/tools.mjs');
const CORE_JS = PKG ? path.join(PKG, 'mcp/core.mjs') : path.join(ROOT, 'tools/mcp/core.mjs');
const CLI_JS = PKG ? path.join(PKG, 'cli/cadcraft.mjs') : path.join(ROOT, 'tools/cli/cadcraft.mjs');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 400) : '')); } };

// ---- the recipe titles in the two texts
const HELP = path.join(ROOT, 'public_html/assets/help/common/assistants-recipes.md');
const NOTE = path.join(ROOT, 'docs/releases/0.7/assistants.md');
const helpText = fs.readFileSync(HELP, 'utf8');
const helpTitles = [...helpText.slice(helpText.indexOf('## Recipes')).split(/\n## (?!#)/)[0].matchAll(/^### (.+)$/gm)].map((m) => m[1].trim());
const noteText = fs.readFileSync(NOTE, 'utf8');
const noteSec = noteText.slice(noteText.indexOf('### Recipes'));
const noteTitles = [...noteSec.slice(0, noteSec.indexOf('\n## ') > 0 ? noteSec.indexOf('\n## ') : undefined).matchAll(/^- \*\*([^*:]+?):?\*\*/gm)].map((m) => m[1].trim());

// ---- a folder with the files the recipes name
const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'cc-recipes-'));
fs.mkdirSync(path.join(TMP, 'Kitchen'));
fs.copyFileSync(path.join(ROOT, 'fixtures/dwg/kitchen-equipment.dwg'), path.join(TMP, 'Kitchen/kitchen-equipment.dwg'));
fs.copyFileSync(path.join(ROOT, 'fixtures/dwg/base-plan.dxf'), path.join(TMP, 'Kitchen/base-plan.dxf'));
fs.copyFileSync(path.join(ROOT, 'fixtures/showcase/bimcraft-house.ifc'), path.join(TMP, 'house.ifc'));
fs.copyFileSync(path.join(ROOT, 'tools/mcp/test/fixtures/job.takeoff.json'), path.join(TMP, 'job.takeoff.json'));
{
  const { load } = await import(pathToFileURL(path.join(ROOT, 'tools/cli/headless/apps.mjs')).href);
  // a site: the sample survey with a pad 2 ft above the ground in its middle (CivilCraft's own Project)
  const PJ = await load('civilcraft', 'project.js'), PT = await load('civilcraft', 'points.js');
  const p = new PJ.Project();
  p.setPoints(PT.parsePoints(fs.readFileSync(path.join(ROOT, 'tools/civilcraft-test/site-topo.csv'), 'utf8')).points, 'site-topo.csv');
  p.state.name = 'Sample site';
  const xs = p.points.map((q) => q.x), ys = p.points.map((q) => q.y), mx = (Math.min(...xs) + Math.max(...xs)) / 2, my = (Math.min(...ys) + Math.max(...ys)) / 2;
  const z = Math.round(p.eg().surface.elevationAt(mx, my)) + 2;
  p.state.pads.push({ id: 'd1', name: 'Pad A', pts: [{ x: mx - 25, y: my - 25 }, { x: mx + 25, y: my - 25 }, { x: mx + 25, y: my + 25 }, { x: mx - 25, y: my + 25 }], z, cut: 2, fill: 2 });
  fs.writeFileSync(path.join(TMP, 'site.civilcraft.json'), JSON.stringify(p.toJSON()));
  // a part: ISO 4017 from PartCraft's standard-part template
  const STD = await load('partcraft', 'stdparts.js'), PP = await load('partcraft', 'part.js');
  const id = STD.TEMPLATES[0].id;
  fs.writeFileSync(path.join(TMP, 'screw.partcraft.json'), PP.toJSON(STD.makeTemplate(id, STD.templateSizes(id)[2])));
}

const { createEnv, headlessTools } = await import(pathToFileURL(TOOLS_JS).href);
const { createDispatcher } = await import(pathToFileURL(CORE_JS).href);
/** A fresh file server on the folder with these permissions; call() = what the assistant sends. */
function server(allow) {
  const env = createEnv({ roots: [TMP] });
  const d = createDispatcher({ server: { name: 'cadcraft', version: 'test' }, allowed: () => allow });
  for (const t of headlessTools(env)) d.tool(t);
  return async (name, a = {}) => { const r = await d.call(name, a, {}); if (r.isError) throw new Error(name + ': ' + (r.content && r.content[0] && r.content[0].text)); return r.structuredContent || {}; };
}
const cli = (...a) => spawnSync(process.execPath, [CLI_JS, ...a], { encoding: 'utf8', cwd: TMP });
const head = (f, n) => fs.readFileSync(path.join(TMP, f)).subarray(0, n).toString();

const REPLAY = {
  'Tidy a drawing': async () => {
    const call = server(['read', 'edit', 'save']);
    const { doc } = await call('drawing_open', { path: 'Kitchen/kitchen-equipment.dwg' });
    const d0 = await call('drawing_describe', { doc });
    const empty = d0.layers.filter((l) => !l.objects), unused = d0.blocks.filter((b) => !b.uses && !b.nested && !b.name.startsWith('_'));
    const r = await call('command_run', { doc, input: 'PURGE' });
    const d1 = await call('drawing_describe', { doc });
    await call('drawing_save', { doc, path: 'Kitchen/kitchen-tidy.dwg' });
    ok(empty.length > 0 && unused.length > 0 && r.undo === 'Assistant: PURGE' && d1.blocks.filter((b) => !b.uses && !b.nested && !b.name.startsWith('_')).length === 0 && d1.blocks.length < d0.blocks.length && head('Kitchen/kitchen-tidy.dwg', 4) === 'AC10',
      'Tidy a drawing: ' + empty.length + ' empty layers and ' + unused.length + ' unused blocks found; PURGE leaves no unused block (dimension arrowheads stay); saved', { empty: empty.length, unused: unused.length, after: d1.blocks.length });
  },
  'Plot a set of sheets': async () => {
    const call = server(['read', 'export']);
    const files = (await call('files_list', { folder: 'Kitchen', extensions: ['dwg', 'dxf'] })).files.filter((f) => !/tidy/.test(f.path));
    fs.mkdirSync(path.join(TMP, 'Plots'), { recursive: true });
    let n = 0;
    for (const f of files) {
      const { doc } = await call('drawing_open', { path: f.path });
      const name = path.basename(f.path).replace(/\.[^.]+$/, '');
      for (const l of (await call('drawing_describe', { doc })).layouts) { await call('drawing_plot', { doc, layout: l.name, out: 'Plots/' + name + ' ' + l.name + '.pdf' }); n++; }
    }
    const pdfs = fs.readdirSync(path.join(TMP, 'Plots')).filter((x) => x.endsWith('.pdf'));
    const p = cli('plot', 'Kitchen/kitchen-equipment.dwg', 'Kitchen/base-plan.dxf', 'Plots-all', '--all');
    ok(files.length === 2 && n > 0 && pdfs.length === n && pdfs.every((x) => head('Plots/' + x, 5) === '%PDF-') && p.status === 0 && fs.readdirSync(path.join(TMP, 'Plots-all')).length === 2,
      'Plot a set of sheets: ' + n + ' sheet PDFs from 2 drawings; the command line writes one PDF per drawing', { n, pdfs, cli: p.stderr });
  },
  'Convert drawings for a consultant': async () => {
    const call = server(['read', 'export']);
    const files = (await call('files_list', { folder: 'Kitchen', extensions: ['dwg', 'dxf'] })).files.filter((f) => !/tidy/.test(f.path));
    fs.mkdirSync(path.join(TMP, 'Out'), { recursive: true });
    for (const f of files) await call('drawing_convert', { path: f.path, out: 'Out/' + path.basename(f.path).replace(/\.[^.]+$/, '') + '.dwg', version: '2013' });
    const p = cli('convert', 'Kitchen/kitchen-equipment.dwg', 'Kitchen/base-plan.dxf', 'Out-cli', '--to', 'dwg', '--version', '2013');
    ok(fs.readdirSync(path.join(TMP, 'Out')).every((x) => head('Out/' + x, 6) === 'AC1027') && fs.readdirSync(path.join(TMP, 'Out')).length === 2 && p.status === 0 && fs.readdirSync(path.join(TMP, 'Out-cli')).every((x) => head('Out-cli/' + x, 6) === 'AC1027'),
      'Convert drawings for a consultant: both as DWG 2013 (AC1027), by the tools and by the command line', p.stderr);
  },
  'Check drawings before sending them': async () => {
    const call = server(['read']);
    const rules = { layers: { noObjectsOn: ['0'] }, objects: { colorByLayer: true }, blocks: { noUnused: true } };
    const rows = [];
    for (const f of ['Kitchen/kitchen-equipment.dwg', 'Kitchen/base-plan.dxf']) {
      const { doc } = await call('drawing_open', { path: f });
      for (const x of (await call('drawing_check', { doc, rules })).findings) rows.push({ file: f, rule: x.rule, count: x.count });
    }
    fs.writeFileSync(path.join(TMP, 'office-standards.json'), JSON.stringify(rules));
    const p = cli('check', 'Kitchen/kitchen-equipment.dwg', 'Kitchen/base-plan.dxf', '--rules', 'office-standards.json', '--json');
    ok(rows.length > 0 && rows.every((x) => x.rule && x.count >= 0) && p.status === 1 && JSON.parse(p.stdout).files.length === 2, 'Check drawings before sending them: ' + rows.length + ' findings in a table; the command line exits 1', rows.slice(0, 4));
  },
  'Ask a building model questions': async () => {
    const call = server(['read']);
    const { doc } = await call('ifc_open', { path: 'house.ifc' });
    const doors = (await call('ifc_query', { doc, class: 'IfcDoor', limit: 500 })).elements;
    const byLevel = {}, external = [];
    for (const e of doors) {
      byLevel[e.storey] = (byLevel[e.storey] || 0) + 1;
      if ((await call('ifc_properties', { doc, id: e.id })).propertySets?.Pset_DoorCommon?.IsExternal === true) external.push(e.name);
    }
    ok(doors.length === 7 && byLevel['Level 1'] === 7 && external.length >= 1 && external.length < doors.length, 'Ask a building model questions: 7 doors on Level 1, ' + external.length + ' external', { byLevel, external });
  },
  'Draw a room in BimCraft': async () => {
    const call = server(['read', 'edit', 'save']);
    const { doc } = await call('ifc_new', {});
    const { walls } = await call('walls_add', { doc, points: [[0, 0], [6000, 0], [6000, 4000], [0, 4000]], closed: true });
    const { door } = await call('opening_add', { doc, wall: walls[0], kind: 'door' });
    const d = await call('model_describe', { doc });
    await call('ifc_save', { doc, path: 'room.ifc' });
    ok(walls.length === 4 && door && d.doors === 1 && d.rooms.some((r) => r.area > 20 && r.area < 24) && /^ISO-10303-21/.test(head('room.ifc', 13)), 'Draw a room in BimCraft: 4 walls, a door, a room a little under 24 m² (measured inside the walls), saved', d.rooms);
  },
  'Total a takeoff': async () => {
    const call = server(['read', 'export']);
    const { doc } = await call('takeoff_open', { path: 'job.takeoff.json' });
    const e = await call('takeoff_estimate', { doc });
    await call('takeoff_export', { doc, out: 'job.xlsx' });
    ok(e.total === '$2,102.50' && e.incomplete === true && head('job.xlsx', 2) === 'PK', 'Total a takeoff: $2,102.50, said to be incomplete (an unscaled mark), the XLSX written', e.total);
  },
  'Site numbers': async () => {
    const call = server(['read']);
    const { doc } = await call('site_open', { path: 'site.civilcraft.json' });
    const v = await call('surface_volume', { doc });
    const lv = await call('surface_volume', { doc, datum: 100 });
    ok(v.items.length === 1 && v.items[0].name === 'Pad A' && v.fill > 0 && v.unit === 'cu yd' && Math.abs(v.net - (v.fill - v.cut)) < 1e-6 && Number.isFinite(lv.cut), 'Site numbers: Pad A needs ' + v.fill + ' cu yd of fill (' + v.cut + ' cut); and against a level', v);
  },
  'Try a part variant': async () => {
    const call = server(['read', 'edit']);
    const { doc } = await call('part_open', { path: 'screw.partcraft.json' });
    const before = (await call('params_list', { doc })).variables.find((x) => x.name === 'l').value;
    await call('param_set', { doc, name: 'l', value: 40 });
    const m = await call('mass_properties', { doc });
    ok(before !== 40 && (await call('params_list', { doc })).variables.find((x) => x.name === 'l').value === 40 && m.mass > 0 && m.massUnit === 'g', 'Try a part variant: l ' + before + ' → 40, mass ' + m.mass + ' g', m);
  },
  'Fill in a title block': async () => {
    const call = server(['read', 'edit']);
    const { doc } = await call('drawing_open', { path: 'Kitchen/kitchen-equipment.dwg' });
    const r = await call('block_insert', { doc, block: 'TITLEBLOCK-ARCHD', at: [0, 0], attributes: { 'SHEET-NO': 'A-101', 'SHEET-TITLE': 'Kitchen plan' } });
    ok(r.attributes['SHEET-NO'] === 'A-101' && r.attributes['SHEET-TITLE'] === 'Kitchen plan' && r.undo === 'Assistant: INSERT TITLEBLOCK-ARCHD', 'Fill in a title block: A-101, Kitchen plan, one undo step', r.attributes);
  },
};

console.log('\nRecipes (help: ' + helpTitles.length + ', release note: ' + noteTitles.length + ')');
ok(helpTitles.length >= 8, 'the help topic lists its recipes', helpTitles);
for (const t of helpTitles) ok(REPLAY[t], 'help recipe "' + t + '" has a replay');
for (const t of noteTitles) ok(REPLAY[t], 'release-note recipe "' + t + '" has a replay');
for (const t of new Set([...helpTitles, ...noteTitles])) {
  if (!REPLAY[t]) continue;
  try { await REPLAY[t](); } catch (e) { ok(false, t + ' threw', e.message); }
}
fs.rmSync(TMP, { recursive: true, force: true });
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
