#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-traverse.mjs — CivilCraft 0.4 V22: traverse entry, closure and the compass adjustment (traverse.js),
 * DOM-free, in Node.
 *
 *   node bin/test-civilcraft-traverse.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: a 100 ft square walked clockwise from A (0,0) north, backsight east (azimuth 90°): every angle right is 270°.
 * With 10" too much on each of the three later angles and on the closing angle, the angular misclosure is 40" and each
 * takes −10": the square comes back exactly. With the last leg 99.96 the traverse ends 0.04 ft east of A: precision
 * 399.96 / 0.04 = 1 : 9,999, and the compass rule moves B, C, D west by 0.04 × 100/399.96, × 200/399.96, × 300/399.96.
 * The same loop by bearings; an open traverse ending on a known point; the CSV report; refusals.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const TV = await mod('traverse.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const SEC = 1 / 3600;

section('reading the legs');
{
  const r = TV.parseTraverse('270°00\'00" 100 B\n270-00-10 100.00 feet C\n270 00 10 100, D\n# comment\n270.0027778 100\nclose 270°00\'10"', 'angles');
  ok(!r.errors.length && r.legs.length === 4, 'four legs (dms, dashes, three numbers, decimal degrees; "feet", commas, a comment)');
  ok(r.legs.map((l) => l.name).join() === 'B,C,D,', 'station names kept; the last leg has none');
  near(r.legs[1].angle, 270 + 10 * SEC, 1e-12, '270-00-10'); near(r.legs[2].angle, 270 + 10 * SEC, 1e-12, '270 00 10');
  near(r.closingAngle, 270 + 10 * SEC, 1e-12, 'the closing angle');
  const b = TV.parseTraverse('N 0 E 100 B\nN 90°00\'00" E 100\nAZ 180-00-00 100 D\nS 90 W 100', 'bearings');
  ok(!b.errors.length && b.legs.length === 4 && b.legs[2].name === 'D', 'bearings: quadrant forms and an azimuth');
  const bad = TV.parseTraverse('361 100\n270\nN 95 E 10\nclose 400', 'angles');
  ok(bad.errors.length === 4 && bad.errors.map((e) => e.line).join() === '1,2,3,4', 'four bad lines, each with its line number');
  ok(TV.parseTraverse('close 90', 'bearings').errors.length === 1, 'a closing angle with bearings: said');
}

section('a loop by angles: angular and linear closure, the compass rule');
{
  const legs = [{ angle: 270, dist: 100, name: 'B' }, { angle: 270 + 10 * SEC, dist: 100, name: 'C' }, { angle: 270 + 10 * SEC, dist: 100, name: 'D' }, { angle: 270 + 10 * SEC, dist: 100, name: '' }];
  const r = TV.runTraverse({ start: { x: 0, y: 0 }, mode: 'angles', backsight: 90, legs, close: 'loop', closingAngle: 270 + 10 * SEC });
  near(r.angular.misclosure, 40 * SEC, 1e-9, 'angular misclosure +40"'); near(r.angular.perAngle, -10 * SEC, 1e-12, 'each angle −10"');
  near(r.linear.dist, 0, 1e-9, 'after the angles are adjusted the square closes'); ok(r.precision > 1e9, 'precision: as good as exact');
  const pos = r.stations.map((s) => [s.ax, s.ay]);
  ok([[0, 100], [100, 100], [100, 0], [0, 0]].every(([x, y], i) => Math.hypot(pos[i][0] - x, pos[i][1] - y) < 1e-9), 'B (0,100), C (100,100), D (100,0), back to A');
  const short = TV.runTraverse({ start: { x: 0, y: 0 }, mode: 'angles', backsight: 90, legs: legs.map((l, i) => ({ ...l, dist: i === 3 ? 99.96 : 100 })), close: 'loop', closingAngle: 270 + 10 * SEC });
  near(short.linear.dx, 0.04, 1e-9, 'last leg 99.96: ends 0.04 east'); near(short.linear.dy, 0, 1e-9, 'and no north error');
  near(short.precision, 399.96 / 0.04, 1e-6, 'precision 1 : 9,999');
  near(short.stations[0].cx, -0.04 * 100 / 399.96, 1e-12, 'B moves west 0.04 × 100/399.96');
  near(short.stations[1].cx, -0.04 * 200 / 399.96, 1e-12, 'C × 200/399.96'); near(short.stations[2].cx, -0.04 * 300 / 399.96, 1e-12, 'D × 300/399.96');
  near(short.stations[3].ax, 0, 1e-12, 'and the last station lands on A'); near(short.stations[2].ay, 0, 1e-9, 'D stays on the south side');
  const noClose = TV.runTraverse({ start: { x: 0, y: 0 }, mode: 'angles', backsight: 90, legs, close: 'loop' });
  ok(noClose.angular.misclosure === null && noClose.linear.dist > 0.01, 'without a closing angle: no angle check, the angle error shows as linear misclosure (' + noClose.linear.dist.toFixed(4) + ')');
}

section('by bearings; open to a known point');
{
  const b = TV.parseTraverse('N 0 E 100 B\nN 90 E 100 C\nS 0 E 100 D\nS 90 W 100.05', 'bearings');
  const r = TV.runTraverse({ start: { x: 500, y: 500 }, mode: 'bearings', legs: b.legs, close: 'loop' });
  near(r.linear.dx, -0.05, 1e-9, 'bearings: 100.05 back west ends 0.05 west'); ok(r.angular.misclosure === null, 'no angle check with bearings');
  near(r.stations[1].ax, 600 + 0.05 * 200 / 400.05, 1e-12, 'C moves east by 0.05 × 200/400.05');
  const o = TV.runTraverse({ start: { x: 0, y: 0 }, mode: 'bearings', legs: TV.parseTraverse('N 90 E 100\nN 90 E 100', 'bearings').legs, close: { x: 200.1, y: 0.1 } });
  near(o.linear.dx, -0.1, 1e-9, 'open, ending on a known point: 0.1 short in x'); near(o.linear.dy, -0.1, 1e-9, 'and 0.1 in y');
  near(o.stations[1].ax, 200.1, 1e-12, 'its end lands on the known point'); near(o.stations[0].ay, 0.05, 1e-12, 'half way: half the correction');
}

section('the report');
{
  const legs = TV.parseTraverse('N 0 E 100 B\nN 90 E 100 =C\nS 0 E 100 D\nS 90 W 99.96', 'bearings').legs;
  const r = TV.runTraverse({ start: { x: 0, y: 0 }, mode: 'bearings', legs, close: 'loop' });
  const csv = TV.traverseReport(r, { units: 'ft' }).split('\r\n');
  ok(csv[0] === 'Angular misclosure,' && csv[1] === 'Linear misclosure (ft),0.0400,"N 90°00\'00"" E"' && csv[3] === 'Precision,1 : 9999', 'closure lines first: angular (none), linear 0.0400 east, precision 1 : 9999');
  ok(csv[5].startsWith('Station,Bearing') && csv[6].startsWith('Start,,,0.0000,0.0000'), 'then the table, from the start');
  ok(csv[8].startsWith("'=C,"), 'a station name starting with = is quoted against spreadsheet formulas');
  ok(csv.length === 12 && csv[11] === '', 'four stations, CRLF line ends');
  ok(csv[7].split(',').at(-1) === '-0.0100' || csv[7].endsWith(',-0.0100'), 'negative numbers stay numbers (no leading apostrophe)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
