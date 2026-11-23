#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-utilnet11.mjs — CivilCraft 0.11 SU.1810: the IFC the utility networks write, READ BACK with the shared IFC reader (ifc/model.js, the
 * reader every CivilCraft IFC import uses): every pipe and cable leg is found again by name and guid tag, its circle profile has the run's radius, its
 * axis start and end follow the run's points leg by leg (end of one = start of the next, total length = the run's length), its elevation is
 * ground - cover - radius, and the hydrant and the chamber come back with their types. IFC4 and IFC4X3.  Not another program's reader: that stays a hand check.
 *   node bin/test-civilcraft-utilnet11.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const [U, PJ, IM, IW, { IfcFile }] = await Promise.all([imp('utilnet.js'), imp('project.js'), imp('ifc-civil-model.js'), imp('ifc-civil.js'), imp('ifc/model.js')]);
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 240)); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b}`);

const pr = new PJ.Project(); pr.state.units = 'm';
const pts = []; for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) pts.push({ n: String(i * 11 + j + 1), x: 500000 + i * 10, y: 4000000 + j * 10, z: 100, d: 'GRD' });
pr.setPoints(pts, 't.csv');
const water = [{ x: 500010, y: 4000010 }, { x: 500050, y: 4000010 }, { x: 500050, y: 4000050 }, { x: 500080, y: 4000050 }];
pr.state.utilities = U.cleanUtilities({ runs: [
  { id: 'ur1', service: 'water', name: 'Main', pts: water, size: 200, depth: 1.2, material: 'PE', owner: 'City', source: 'drawn' },
  { id: 'ur2', service: 'power', name: 'Feed', pts: [{ x: 500020, y: 4000090 }, { x: 500070, y: 4000090 }], size: 80, depth: 0.8, source: 'drawn' }],
  nodes: [{ id: 'un1', kind: 'hydrant', x: 500020, y: 4000010, service: 'water' }, { id: 'un2', kind: 'manhole', x: 500050, y: 4000030, service: 'sewer' }] }, 'm');
const model = IM.civilIfcModel(pr, { lat: 36, lon: -120 });

const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
for (const schema of ['IFC4', 'IFC4X3_ADD2']) {
  const text = IW.writeCivilIfc(model, { schema, now: new Date('2026-11-20T00:00:00Z'), seed: 'util11' }).text;
  const f = IfcFile.open(new TextEncoder().encode(text));
  const num = (v) => (typeof v === 'number' ? v : Number(v));
  const R = (v) => v.ref;
  const pointOf = (id) => f.params(id)[0].map(num);
  const legs = (type) => f.ofType(type).map((id) => {
    const p = f.params(id), pds = f.params(R(p[6])), sr = f.params(R(pds[2][0])), solid = f.params(R(sr[3][0]));   // IfcExtrudedAreaSolid(profile, position, dir, depth)
    const prof = f.params(R(solid[0])), pos = f.params(R(solid[1])), loc = pointOf(R(pos[0])), dir = f.params(R(solid[2]))[0].map(num), refd = f.params(R(pos[2]))[0].map(num), axisL = pos[1] ? f.params(R(pos[1]))[0].map(num) : [0, 0, 1], depth = num(solid[3]);
    // the extrusion runs along the placement's local z; the axis placement is (location, Axis = local z, RefDirection = local x) and the solid extrudes along `dir` in that frame (0,0,1)
    const axis = dir[2] === 1 && dir[0] === 0 && dir[1] === 0 ? axisL : null;
    return { id, name: p[2], tag: p[7], loc, axis, refd, depth, r: num(prof[3]), type: f.type(R(solid[0])) };
  });
  const pipes = legs('IFCPIPESEGMENT'), cables = legs('IFCCABLESEGMENT');
  const tagN = (x) => Number(String(x.tag).split('-').pop());
  ok(pipes.length === 3 && cables.length === 1, `${schema}: 3 water legs and 1 cable leg read back`, [pipes.length, cables.length]);
  ok(pipes.every((x) => x.name === 'Main' && x.type === 'IFCCIRCLEPROFILEDEF' && /^util\|ur1-\d$/.test(x.tag)), `${schema}: water legs are named Main, circle profiles, tagged ur1-n`, pipes.map((x) => [x.name, x.type, x.tag]));
  pipes.sort((a, b) => tagN(a) - tagN(b));
  near(pipes[0].r, 0.1, 1e-9, `${schema}: water radius is half of 200 mm`);
  near(cables[0].r, 0.04, 1e-9, `${schema}: cable radius is half of 80 mm`);
  // the axis: the run's own points leg by leg (the file is relative to the site's centre, so compare steps, not absolute places)
  const ends = pipes.map((x) => [x.loc[0] + x.axis[0] * x.depth, x.loc[1] + x.axis[1] * x.depth, x.loc[2] + x.axis[2] * x.depth]);
  for (let i = 1; i < pipes.length; i++) near(dist(ends[i - 1], pipes[i].loc), 0, 1e-6, `${schema}: leg ${i} ends where leg ${i + 1} starts`);
  near(pipes.reduce((a, x) => a + x.depth, 0), U.runLength({ pts: water }), 1e-9, `${schema}: the legs add up to the run's length (${U.runLength({ pts: water })} m)`);
  near(pipes[1].loc[0] - pipes[0].loc[0], 40, 1e-6, `${schema}: the second leg starts 40 m east of the first`);
  ok(pipes.map((x) => x.axis.map((v) => Math.round(v)).join(',')).join(' ') === '1,0,0 0,1,0 1,0,0', `${schema}: the legs run east, north, east`, pipes.map((x) => x.axis));
  near(pipes[2].depth, 30, 1e-9, `${schema}: the last leg is 30 m`);
  near(pipes[0].loc[2], 100 - 1.2 - 0.1, 1e-9, `${schema}: axis elevation = ground 100 - cover 1.2 - radius 0.1`);
  near(cables[0].loc[2], 100 - 0.8 - 0.04, 1e-9, `${schema}: cable elevation = 100 - 0.8 - 0.04`);
  ok(f.ofType('IFCFIRESUPPRESSIONTERMINAL').length === 1 && f.params(f.ofType('IFCFIRESUPPRESSIONTERMINAL')[0])[8]?.enum === 'FIREHYDRANT', `${schema}: the hydrant comes back as a fire hydrant`, f.ofType('IFCFIRESUPPRESSIONTERMINAL').map((id) => f.params(id)));
  ok(f.ofType('IFCDISTRIBUTIONCHAMBERELEMENT').length === 1, `${schema}: the manhole comes back as a distribution chamber`);
  ok(text.includes('OpenStreetMap contributors') === false, `${schema}: no OpenStreetMap credit in a file with no OpenStreetMap data`);
}
console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
