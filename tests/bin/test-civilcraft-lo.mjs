#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-lo.mjs — South Africa's Lo zones (0.8 ZA.1, CivilCraft side): EPSG Hartebeesthoek94 / Lo15 … Lo33 and Cape / Lo15 … Lo33
 * are in the catalog (west/south axes, `axes: 'ws'`), the project keeps east/north, and `frame.surveyor` / `fromSurveyor` give the Y (westing) /
 * X (southing) a South African plan is written in. Second reader: PROJ — the reference Y / X below were computed with pyproj 3.7.1 (PROJ 9.5.1, EPSG axes west, south) from the same longitude / latitude.
 *
 *   node bin/test-civilcraft-lo.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const C = await mod('crs.js');
const PJ = await mod('project.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const section = (s) => console.log('\n== ' + s);
const cat = C.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));
C.setWktCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-wkt.json'), 'utf8')));

section('the catalog');
const HBK = [2046, 2047, 2048, 2049, 2050, 2051, 2052, 2053, 2054, 2055], CAPE = [22275, 22277, 22279, 22281, 22283, 22285, 22287, 22289, 22291, 22293];
for (const c of [...HBK, ...CAPE]) ok(C.byCode(c)?.axes === 'ws' && /^(Hartebeesthoek94|Cape) \/ Lo\d\d$/.test(C.byCode(c).name) && C.byCode(c).unit === 'm', `EPSG:${c} ${C.byCode(c)?.name} is in, west/south`);
ok(cat.filter((e) => e.axes === 'ws').length === 20, 'exactly those twenty are west/south: ' + cat.filter((e) => e.axes === 'ws').length);
ok(HBK.every((c, i) => new RegExp('\\+lon_0=' + (15 + 2 * i) + '\\b').test(C.byCode(c).proj4) && !/\+axis/.test(C.byCode(c).proj4)), 'Lo15 … Lo33 are the central meridians 15 … 33 as plain east/north tmerc (no +axis in the definition)');
ok(C.byCode(2048).shiftAccuracy !== undefined && !/towgs84/.test(C.byCode(2048).proj4), 'Hartebeesthoek94 is WGS 84 for practical purposes: no datum shift');
ok(/towgs84/.test(C.byCode(22279).proj4), 'the Cape datum carries its grid-free shift to WGS 84');
ok(cat.filter((e) => !e.axes).every((e) => e.axes === null || e.axes === undefined), 'no other system is flagged');
const hits = C.search('Lo19').map((e) => e.code);
ok(hits.includes(2048) && hits.includes(22279), 'searching "Lo19" finds both Lo19 zones: ' + hits.slice(0, 6));
const near = C.suggest([18.42, -33.92]).map((e) => e.code);
ok(near.includes(2048) || near.includes(22279), 'suggest at Cape Town offers a Lo zone: ' + near.slice(0, 8));

section('against PROJ');
const REF = [[2048, 18.4241, -33.9249, 53251.51494715928, 3755480.587885415], [2053, 28.0473, -26.2041, 95219.41820721622, 2899796.308434149], [2055, 32.9, -27.0, 9925.49200524174, 2987634.2269741762], [2051, 25.6, -33.96, -55457.224177641125, 3759386.7713485383]];
for (const [code, lon, lat, Y, X] of REF) {
  const f = C.frame(C.crsFromEntry(C.byCode(code)));
  const [x, y] = f.fromLonLat(lon, lat);
  ok(Math.abs(x + Y) < 0.01 && Math.abs(y + X) < 0.01, `Lo ${code}: east/north are minus PROJ's Y/X (${x.toFixed(3)}, ${y.toFixed(3)})`);
  const [sy, sx] = f.surveyor(x, y);
  ok(Math.abs(sy - Y) < 0.01 && Math.abs(sx - X) < 0.01, `Lo ${code}: Y ${sy.toFixed(3)} (westing) X ${sx.toFixed(3)} (southing) agree with PROJ to 1 cm`);
  const back = f.fromSurveyor(sy, sx);
  ok(Math.abs(back[0] - x) < 1e-6 && Math.abs(back[1] - y) < 1e-6, `Lo ${code}: fromSurveyor undoes surveyor`);
  const [lo2, la2] = f.toLonLat(...f.fromSurveyor(Y, X));
  ok(Math.abs(lo2 - lon) < 1e-8 && Math.abs(la2 - lat) < 1e-8, `Lo ${code}: PROJ's Y, X typed as a surveyor would come back to ${lon}, ${lat}`);
}
{
  // Cape datum: the Cape zone differs from Hartebeesthoek94 by the datum (a hundred metres or so), same sign pattern
  const a = C.frame(C.crsFromEntry(C.byCode(2048))), b = C.frame(C.crsFromEntry(C.byCode(22279)));
  const pa = a.surveyor(...a.fromLonLat(18.4241, -33.9249)), pb = b.surveyor(...b.fromLonLat(18.4241, -33.9249));
  const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
  ok(d > 20 && d < 400, `Cape / Lo19 and Hartebeesthoek94 / Lo19 are a datum apart: ${d.toFixed(1)} m`);
}
section('the local step and ordinary systems');
{
  const f = C.frame(C.crsFromEntry(C.byCode(2048)));
  const g = C.frame({ ...f.crs, local: { scale: 1, rotation: 0, from: [0, 0], to: [100, 200] } });
  const s = g.surveyor(10, 20);
  ok(s[0] === -110 && s[1] === -220, 'the local step comes first, then the sign flip');
  const u = C.frame(C.crsFromEntry(C.byCode(32734)));   // WGS 84 / UTM 34S
  ok(u.axes === 'en' && u.surveyor(500000, 6000000)[0] === 500000 && u.fromSurveyor(1, 2)[1] === 2, 'an east/north system is untouched by surveyor()');
  ok(C.axisNames(f.crs).join() === 'Y,X' && C.axisNames(u.crs).join() === 'E,N', 'axisNames: Y, X for the Lo zones; E, N otherwise');
}
section('.prj and the project file');
ok(await C.prjFor(C.crsFromEntry(C.byCode(2048))) === null, 'no .prj for a Lo zone (the registry WKT says west/south; the files are east/north)');
ok((await C.prjFor(C.crsFromEntry(C.byCode(32734)))) !== null, 'an ordinary system still has its .prj');
{
  ok(C.crsFromEntry(C.byCode(2048)).axes === 'ws' && C.crsFromEntry(C.byCode(2046)).axes === 'ws' && C.crsFromEntry(C.byCode(32734)).axes === undefined, 'crsFromEntry carries axes only for the west/south systems');
  const base = { format: 'civilcraft-project', version: 1, name: 'x', units: 'm', points: [] };
  const crs = (extra) => ({ code: 2048, name: 'Hartebeesthoek94 / Lo19', proj4: C.byCode(2048).proj4, unit: 'm', local: null, ...extra });
  const a = PJ.Project.fromJSON({ ...base, crs: crs({ axes: 'ws' }) });
  ok(a.project.state.crs?.axes === 'ws' && !a.notes.length, 'a project file keeps `axes: ws`');
  ok(PJ.Project.fromJSON({ ...base, crs: crs({ axes: 'sw' }) }).project.state.crs?.axes === undefined && PJ.Project.fromJSON({ ...base, crs: crs({ axes: { x: 1 } }) }).project.state.crs?.axes === undefined, 'any other value is dropped');
  const again = PJ.Project.fromJSON(JSON.parse(JSON.stringify(a.project.toJSON())));
  ok(again.project.state.crs?.axes === 'ws', 'and it survives a save and reopen');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
