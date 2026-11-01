#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** 0.8 round 3 (civil_PART_3): CivilCraft's live adapter answers where(ops) for EG.41 (assistant scope in Studio Live). Run: node bin/test-civilcraft-live-where.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const { Project } = await mod('project.js');
const { createLive } = await mod('live.js');
const scopeable = (a) => !!a && typeof a.where === 'function';   // the test of studio/hub/live/assistant-scope.js
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const p = new Project();
p.setPoints([{ n: 1, x: 0, y: 0, z: 1, d: '' }, { n: 2, x: 100, y: 0, z: 2, d: '' }, { n: 3, x: 50, y: 80, z: 3, d: '' }], 't.csv');
p.change('pad', (s) => { s.pads.push({ id: 'p1', name: 'P', pts: [{ x: 10, y: 10 }, { x: 30, y: 10 }, { x: 30, y: 40 }], z: 2, cut: 2, fill: 2 }); });
const lv = createLive(() => p);
ok(scopeable(lv), 'the adapter can tell where a step landed (Studio offers the scope controls)');
ok(/Site|live\.where\.site/.test(lv.sheetLabel('')), 'sheet label', lv.sheetLabel(''));
let w = lv.where([{ o: 'put', path: ['state', 'pads', '#p1', 'z'], v: 3 }]);
ok(w && w.sheet === '' && JSON.stringify(w.box) === '[10,10,30,40]', 'a change inside a pad is located by the pad', w);
ok(JSON.stringify(w.cur) === '[20,25]', 'cursor is the centre of the area', w.cur);
w = lv.where([{ o: 'add', path: ['state', 'pads'], id: 'p9', v: { id: 'p9', name: 'N', pts: [{ x: 200, y: 200 }, { x: 220, y: 230 }, { x: 205, y: 260 }], z: 1 } }]);
ok(JSON.stringify(w.box) === '[200,200,220,260]', 'an added pad is located by its outline', w);
w = lv.where([{ o: 'add', path: ['points'], id: 7, v: { n: 7, x: -5, y: 12, z: 0, d: '' } }, { o: 'put', path: ['state', 'pads', '#p1', 'z'], v: 1 }]);
ok(JSON.stringify(w.box) === '[-5,10,30,40]', 'steps are joined into one area', w);
w = lv.where([{ o: 'del', path: ['state', 'pads'], id: 'p1' }]);
ok(w && w.box && w.box[0] === 10, 'a removed pad that is still in the project is located', w);
w = lv.where([{ o: 'del', path: ['state', 'pads'], id: 'gone' }]);
ok(w && w.box === null && w.sheet === '', 'a removal of something unknown has no area (unbounded)', w);
ok(lv.where([{ o: 'put', path: ['state', 'units'], v: 'm' }]) === null, 'a step with nothing on the plan cannot be placed (refused under a scope)');
ok(lv.where([]) === null, 'no ops');
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
