#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** 0.8 round 3 (civil_PART_3), SU.911/914 rest: the ground and platform steps in Problems, saved free-section lines in the file, spot levels in the 3D view. Run: node bin/test-civilcraft-groundproblems.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { t } = await mod('i18n.js'), PJ = await mod('project.js'), G = await mod('problems-ground.js'), S3 = await mod('site3d.js'), PF = await mod('platform.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const rect = (x, y, w, h) => [{ x, y }, { x: x + w, y }, { x: x + w, y: y + h }, { x, y: y + h }];

// ---- Problems
const p = new PJ.Project(); p.state.units = 'm';
p.setPoints([{ n: 1, x: 0, y: 0, z: 10, d: 'GRD' }, { n: 2, x: 10, y: 0, z: 10, d: 'GRD' }], 'two.csv');
let r = G.groundProblems(p, { t, units: 'm' });
ok(r.some((x) => x.code === 'ground.err' && x.severity === 'error'), 'a ground that could not be built says why (an error)', r.map((x) => x.code));
const pts = []; let n = 1; for (let x = 0; x <= 100; x += 10) for (let y = 0; y <= 100; y += 10) pts.push({ n: n++, x, y, z: 100, d: 'GRD' });
p.setPoints(pts, 'flat.csv');
r = G.groundProblems(p, { t, units: 'm' });
ok(r.length === 0, 'a plain ground has nothing to say', r.map((x) => x.code));
p.change('ramp', (s) => { s.pads.push({ id: 'p1', name: 'Ramp', pts: [{ x: 10, y: 10, z: 100 }, { x: 40, y: 10, z: 103 }, { x: 40, y: 13, z: 103 }, { x: 10, y: 13, z: 100 }], z: 101.5, cut: 2, fill: 2 }); });
r = G.groundProblems(p, { t, units: 'm' });
const steep = r.find((x) => x.code === 'platform.steep');
ok(steep && steep.severity === 'note' && /10\.0 %/.test(steep.text) && steep.about[0].id === 'p1', 'a ramp of 3 m in 30 m is 10 %, steeper than 1:12: a note about that pad', steep?.text);
p.change('gentle', (s) => { s.pads[0].pts = [{ x: 10, y: 10, z: 100 }, { x: 40, y: 10, z: 102 }, { x: 40, y: 13, z: 102 }, { x: 10, y: 13, z: 100 }]; });
ok(!G.groundProblems(p, { t, units: 'm' }).some((x) => x.code === 'platform.steep'), '2 m in 30 m (6.7 %) is not flagged');
r = G.groundProblems(p, { t, units: 'm', spots: [{ x: 5, y: 6, dz: -4.2, kind: 'cut' }, { x: 8, y: 9, dz: 1, kind: 'fill' }] });
ok(r.some((x) => x.code === 'platform.deep' && /cut/.test(x.text) && /4\.2/.test(x.text) && x.where.at[0] === 5), 'the deepest cut over 3 m is told with where');
ok(!G.groundProblems(p, { t, units: 'm', spots: [{ x: 5, y: 6, dz: -2.9, kind: 'cut' }] }).some((x) => x.code === 'platform.deep'), '2.9 m is under the limit');
p.change('contours', (s) => { s.surface.flatFix = 5; });
ok(G.groundProblems(p, { t, units: 'm' }).some((x) => x.code === 'ground.flatfix'), 'flat triangles fixed from contours are noted');
ok(G.groundProblems(p, { t, units: 'm' }).every((x) => x.text && x.part && x.msg.key), 'every problem has text, a part and a message key');

// ---- saved section lines
p.change('line', (s) => { s.sectionLines = [{ id: 'sl1', name: 'A–A', line: [{ x: 0, y: 0 }, { x: 50, y: 50 }] }]; });
const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
ok(back.state.sectionLines?.length === 1 && back.state.sectionLines[0].name === 'A–A' && back.state.sectionLines[0].line.length === 2, 'a saved section line comes back from the file');
const junk = PF.cleanSectionLines([{ id: 'x', name: 'one point', line: [{ x: 1, y: 1 }] }, { id: 'sl5', line: [{ x: 1, y: 1 }, { x: 1, y: 1 }] }, { name: 'ok\u0000\u0007', line: [{ x: 0, y: 0 }, { x: 'a', y: 1 }, { x: 5, y: 5 }] }, 4, null], (v, pre) => pre + '9');
ok(junk.length === 1 && junk[0].line.length === 2 && !/[\u0000-\u001f]/.test(junk[0].name) && junk[0].id === 'sl9', 'junk lines are dropped, names cleaned, ids made', junk);
p.undo(); ok(!p.state.sectionLines, 'saving a line is one undo step');

// ---- 3D spot labels
const input = S3.siteInput(p);
input.spots = [{ x: 20, y: 20, zd: 101, dz: -2.5, kind: 'cut', extreme: true }, { x: 30, y: 30, zd: 101, dz: 1.2, kind: 'fill', extreme: false }, { x: 40, y: 40, zd: 100, dz: 0, kind: 'level', extreme: false }];
const sc = S3.buildSite3D(input, {});
const texts = sc.labels.map((l) => l.text);
ok(texts.includes('−2.50 ◆') && texts.includes('+1.20') && texts.includes('0'), 'the scene labels the spots (− cut, + fill, ◆ the deepest)', texts.slice(0, 8));
ok(!S3.buildSite3D(input, { show: { spots: false } }).labels.some((l) => /◆/.test(l.text)), 'they can be switched off');
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
