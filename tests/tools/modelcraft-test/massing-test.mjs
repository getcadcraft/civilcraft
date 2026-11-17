#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * massing-test.mjs: ModelCraft's push / pull massing as IFC massing options (0.10 BK.44).   node tools/modelcraft-test/massing-test.mjs
 * The model is tools/modelcraft-test/massing-model.mjs (numbers worked by hand there). BimCraft's side of the round trip is
 * `node bin/test-bimcraft.mjs --massoptions`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildMassingModel } from './massing-model.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
let pass = 0, fail = 0;
const ok = (c, m, got) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (got !== undefined ? ' -> ' + JSON.stringify(got) : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));
const I18N = await import(path.join(APP, 'i18n.js'));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const MM = await import(path.join(APP, 'massing-mc.js'));
const { model, iids } = await buildMassingModel(APP);

const solids = MM.massingSolids(model);
ok(solids.length === 3 && solids.map((s) => s.name).join() === 'Bar,Stepped,L', 'three top-level groups are the solids', solids.map((s) => s.name));
const NOW = new Date('2026-11-11T12:00:00Z');
const f = MM.massingFile(model, { floorHeight: 3, set: 'Scheme A', name: 'tower', now: NOW });
const by = Object.fromEntries(f.report.map((m) => [m.name, m]));
ok(by.Bar.floors === 3 && near(by.Bar.footprint, 200) && near(by.Bar.gross, 600) && near(by.Bar.volume, 1800) && by.Bar.prism && !by.Bar.simplified, 'Bar: 3 floors, 200 m2, 600 m2 gross, 1800 m3, as modelled', by.Bar);
ok(by.Stepped.floors === 3 && near(by.Stepped.footprint, 200) && by.Stepped.floorAreas.map((a) => Math.round(a)).join() === '200,200,100' && near(by.Stepped.gross, 500) && near(by.Stepped.volume, 1500), 'Stepped: floors 200, 200, 100 = 500 m2 gross, 1500 m3', [by.Stepped.floorAreas, by.Stepped.gross, by.Stepped.volume]);
ok(by.Stepped.closed && by.Stepped.simplified && by.Stepped.notes.join() === 'floors-differ', 'Stepped: closed, simplified, because its floors differ', by.Stepped.notes);
ok(by.L.floors === 2 && near(by.L.footprint, 300) && near(by.L.gross, 600) && near(by.L.volume, 1800) && by.L.pts.length === 6 && by.L.prism, 'L: 2 floors, 300 m2, 600 m2 gross, 1800 m3, six corners', by.L);
ok(f.fileName === 'tower-massing.ifc' && f.counts.masses === 3 && f.counts.storeys === 3 && f.counts.spaces === 8, 'the file: 3 masses, 3 storeys (the tallest option), 3 + 3 + 2 floor spaces', f.counts);
const n = (re) => (f.text.match(re) || []).length;
ok(n(/=IFCBUILDING\(/g) === 1 && n(/=IFCBUILDINGELEMENTPROXY\(/g) === 3 && n(/=IFCSPACE\(/g) === 8 && n(/'CadCraft_SiteMass'/g) === 3, 'one building, three mass proxies with CadCraft_SiteMass, eight floor spaces');
ok(n(/'OptionSet',\$,IFCLABEL\('Scheme A'\)/g) === 3 && n(/'Current',\$,IFCBOOLEAN\(\.F\.\)/g) === 3 && n(/'Simplified'/g) === 1 && n(/'Source',\$,IFCLABEL\('ModelCraft'\)/g) === 3, 'option set on all three, none current, Simplified once, source ModelCraft');
ok(/IFCSIUNIT\(\*,\.LENGTHUNIT\.,\$,\.METRE\.\)/.test(f.text) && !/IFCCONVERSIONBASEDUNIT/.test(f.text) && !/IFCMAPCONVERSION/.test(f.text), 'metres; no coordinate system claimed');
ok(MM.massingFile(model, { floorHeight: 3, set: 'Scheme A', name: 'tower', now: NOW }).text === f.text, 'the same model gives the same file (stable GlobalIds)');
// only the selected
const one = MM.massingFile(model, { iids: [iids.l], floorHeight: 3, name: 'tower', now: NOW });
ok(one.counts.masses === 1 && one.counts.storeys === 2 && one.report[0].name === 'L' && /'OptionSet',\$,IFCLABEL\('tower'\)/.test(one.text), 'a selection of one: one option, 2 storeys, the set named after the model', one.counts);
// 4 m floors: Bar 9 / 4 = 2.25 -> 2 floors of 4.5 m, gross 400
const four = MM.massingFile(model, { iids: [iids.bar], floorHeight: 4, name: 'tower', now: NOW });
ok(four.report[0].floors === 2 && near(four.report[0].floorHeight, 4.5) && near(four.report[0].gross, 400), 'Bar at 4 m floors: 2 floors of 4.5 m, 400 m2 gross', four.report[0].floors);
// loose geometry is not a mass; a model with nothing grouped gives no file
const { Model } = await import(path.join(APP, 'model.js'));
const empty = MM.massingFile(new Model(), { floorHeight: 3 });
ok(empty.text === '' && empty.counts.masses === 0, 'an empty model: no file');
// the plain IFC export is untouched by this (proxies only, as before)
const { exportIFC } = await import(path.join(APP, 'io.js'));
const plain = exportIFC(model, { name: 'tower', date: NOW });
ok(!/CadCraft_SiteMass|IFCSPACE/.test(plain) && (plain.match(/=IFCBUILDINGELEMENTPROXY\(/g) || []).length === 3, 'Export > IFC is as it was: three plain proxies, no masses');
if (process.argv.includes('--write')) { const out = path.join(ROOT, 'tmp/modelcraft-test'); fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(path.join(out, 'tower-massing.ifc'), f.text); }
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
