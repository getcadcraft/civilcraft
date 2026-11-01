#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-solaragent.mjs — CivilCraft 0.8 round 3 (civil_PART_3), EG.15: the assistant tools of solar-agent.js over a real Project in Node: every tool passes the AI
 * contract check (tools/mcp/contract.mjs), solar_save is one undo step and survives a save → load, and the read tools give the engine's answer.
 *   node bin/test-civilcraft-solaragent.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(f.startsWith('/') ? f : path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const PJ = await mod('project.js'), AG = await mod('solar-agent.js'), CT = await mod(path.join(REPO, 'tools/mcp/contract.mjs'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const rejects = async (f, code, m) => { try { await f(); ok(false, m + ' (no error)'); } catch (e) { ok(e.code === code, m + ' (' + e.code + ')'); } };

const p = new PJ.Project(); p.state.units = 'm';
const pts = []; let n = 1; for (let x = 0; x <= 100; x += 10) for (let y = 0; y <= 120; y += 10) pts.push({ n: n++, x, y, z: 50 + 0.02 * y, d: 'GRD' });
p.setPoints(pts, 'field.csv');
let changes = 0;
const defs = AG.solarTools({ project: () => p, changed: () => { changes++; } }), tools = Object.fromEntries(defs.map((d) => [d.name, d]));
ok(defs.length === 4, 'four tools: ' + Object.keys(tools).join(', '));
for (const d of defs) { const c = CT.checkTool(d, { app: 'civilcraft' }); ok(c.errors.length === 0, d.name + ' passes the contract: ' + c.errors.join('; ')); ok(d.group === 'read' || d.rollbackPreview === true, d.name + ': an edit tool can preview'); }

const field = { kind: 'poly', pts: [{ x: 5, y: 5 }, { x: 95, y: 5 }, { x: 95, y: 115 }, { x: 5, y: 115 }] };
const plan = tools.solar_plan.run({ region: field, latitude: 40, longitude: -105, options: { perRow: 6 } });
ok(plan.tables > 20 && plan.kWp > 10 && plan.rowPitch.mean > 0 && plan.rowPitch.mean < plan.rowPitch.flat + 0.5, 'solar_plan lays tables out: ' + JSON.stringify([plan.tables, plan.kWp, plan.rowPitch]));
ok(plan.rowPitch.mean < plan.rowPitch.flat, 'ground that rises behind the tables gives closer rows than flat ground (' + plan.rowPitch.mean + ' < ' + plan.rowPitch.flat + ')');
ok(/starter/i.test(plan.notes.join(' ')), 'the starter module is labelled in the notes');
ok(p.state.solar === undefined, 'solar_plan changes nothing');
try { const r = tools.solar_plan.run({ region: field }); ok(r.error && /latitude/i.test(r.error), 'no latitude: the answer says so (' + r.error + ')'); } catch (e) { ok(/latitude/i.test(e.message), 'no latitude: ' + e.message); }
await rejects(() => tools.solar_plan.run({ latitude: 40, longitude: -105 }), 'invalid_argument', 'no region: refused');
await rejects(() => tools.solar_plan.run({ id: 'sa99' }), 'not_found', 'an unknown id: not found');

const saved = tools.solar_save.run({ name: 'South field', region: field, latitude: 40, longitude: -105, options: { perRow: 6 } });
ok(/^sa\d+$/.test(saved.array) && saved.tables === plan.tables && changes === 1, 'solar_save saves and tells the app: ' + JSON.stringify(saved));
ok(p.undoStack.length === 1 && p.undoStack.at(-1).label === 'Assistant: save a solar array', 'one undo step, labelled as the assistant\'s');
const list = tools.solar_list.run({});
ok(list.arrays.length === 1 && list.arrays[0].summary.kwp === plan.kWp, 'solar_list shows it with its numbers');
const again = tools.solar_save.run({ id: saved.array, options: { tilt: 30 } });
ok(again.array === saved.array && p.state.solar.arrays.length === 1 && p.state.solar.arrays[0].options.tilt === 30 && p.state.solar.arrays[0].options.perRow === 6, 'saving with an id changes only what was given');
const y = tools.solar_yield.run({ id: saved.array });
ok(y.acKwh > 0 && y.specificKwhPerKwp > 900 && y.specificKwhPerKwp < 2400 && /clear-sky/.test(y.note), 'solar_yield gives the year (' + y.specificKwhPerKwp + ' kWh/kWp, clear sky)');
const q = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
ok(q.state.solar?.arrays?.length === 1 && q.state.solar.arrays[0].options.tilt === 30, 'save → load keeps the array');
p.undo(); p.undo();
ok(p.state.solar === undefined, 'two undos remove it (save, then change)');
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
