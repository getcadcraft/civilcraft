#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-staking.mjs — CivilCraft 0.4 V23: staking reports (staking.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-staking.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: a straight alignment due east from (1000, 5000), stations every 50 ft from 0 to 200 (no curve on it, so no
 * key stations in between); offsets 12 L, 0, 12 R land 12 ft north and south; a design profile on
 * a 2 % grade from 100.00 and a flat ground at 101.00: at 1+00 the design is 102.00, the ground 101.00, so F 1.00; at
 * 0+00, C 1.00; the corridor's design at its edges; survey points read back their station and offset; a curved alignment's
 * PC and PT are stations; the CSV; the PDF pages through plot.js (pdftotext reads them back).
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
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
const SK = await mod('staking.js');
const AL = await mod('alignment.js');
const PF = await mod('profile.js');
const PL = await mod('plot.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

const al = AL.buildAlignment({ pis: [{ x: 1000, y: 5000 }, { x: 1200, y: 5000 }] });
const pr = PF.buildProfile([{ sta: 0, z: 100, L: 0 }, { sta: 200, z: 104, L: 0 }]);
const design = (sta, off) => (off === 0 || Math.abs(off) <= 12 ? pr.elevationAt(sta) : null);
const ground = () => 101;

section('stations and places');
{
  const st = SK.stakeStations(al, { from: 0, to: 200, step: 50 });
  ok(JSON.stringify(st) === '[0,50,100,150,200]', 'every 50 ft from 0+00 to 2+00');
  ok(JSON.stringify(SK.stakeStations(al, { from: 25, to: 130, step: 50 })) === '[25,50,100,130]', 'both ends kept when they are not on the step');
  const curve = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 300, y: 0, r: 200 }, { x: 500, y: -200 }] });
  const arc = curve.elements.find((e) => e.type === 'arc');
  const cs = SK.stakeStations(curve, { step: 100 });
  ok(cs.some((s) => Math.abs(s - arc.sta) < 1e-6) && cs.some((s) => Math.abs(s - (arc.sta + arc.len)) < 1e-6), 'a curve’s PC and PT are stations');
  ok(!SK.stakeStations(curve, { step: 100, keys: false }).some((s) => Math.abs(s - arc.sta) < 1e-6), 'unless key stations are off');
  const rows = SK.stakeRows(al, { stations: [100], offsets: [-12, 0, 12], design, ground, first: 101, prefix: 'S' });
  ok(rows.map((r) => r.id).join() === 'S101,S102,S103', 'numbered S101 onward');
  near(rows[0].y, 5012, 1e-9, '12 L is 12 ft north of an eastbound line'); near(rows[2].y, 4988, 1e-9, '12 R is 12 ft south'); near(rows[1].x, 1100, 1e-9, 'Sta 1+00 at x 1100');
  near(rows[1].design, 102, 1e-9, 'design at 1+00: 100 + 2 % × 100 = 102.00'); near(rows[1].cf, -1, 1e-9, 'ground 101 − design 102 = −1: fill');
  ok(SK.cutFillText(rows[1].cf) === 'F 1.00' && SK.cutFillText(1) === 'C 1.00' && SK.cutFillText(0.001) === '0.00' && SK.cutFillText(null) === '', 'F 1.00, C 1.00, 0.00 within half a hundredth, nothing without a design');
  ok(SK.offsetText(-12) === '12.00 L' && SK.offsetText(12) === '12.00 R' && SK.offsetText(0) === '0.00', 'offsets: 12.00 L, 12.00 R, 0.00');
  const far = SK.stakeRows(al, { stations: [0], offsets: [30], design, ground });
  ok(far[0].design === null && far[0].cf === null && far[0].ground === 101, 'no design at 30 R: the cut/fill is left empty');
}

section('typed offsets');
{
  ok(JSON.stringify(SK.parseOffsets('12 L, 0, 12 R')) === '[-12,0,12]' && JSON.stringify(SK.parseOffsets('L12 CL R12')) === '[-12,0,12]' && JSON.stringify(SK.parseOffsets('-12 0 12 12')) === '[-12,0,12]', '12 L, 0, 12 R = L12 CL R12 = -12 0 12 (a repeat dropped)');
  ok(JSON.stringify(SK.parseOffsets('16.5L 16.5r')) === '[-16.5,16.5]', '16.5L, lower-case r');
  ok(SK.parseOffsets('12 X').error === 'X' && SK.parseOffsets('L-12').error === 'L-12' && SK.parseOffsets('L12R').error === 'L12R', 'refused: X, a side with a minus, both sides');
}

section('survey points against the alignment');
{
  const pts = [{ n: '7', x: 1150, y: 4990, z: 103.5 }, { n: '8', x: 1050, y: 5005, z: 100 }, { n: '9', x: 900, y: 5000, z: 100 }];
  const { rows, outside } = SK.pointRows(al, pts, { design });
  ok(outside === 1 && rows.length === 2 && rows[0].id === '8', 'two points along it (sorted by station), one before its start left out');
  near(rows[1].sta, 150, 1e-9, 'point 7 at 1+50'); near(rows[1].off, 10, 1e-9, '10 R'); near(rows[1].cf, 103.5 - 103, 1e-9, 'its own elevation 103.50 against design 103.00: C 0.50');
  near(rows[0].off, -5, 1e-9, 'point 8: 5 L');
}

section('the CSV');
{
  const rows = SK.stakeRows(al, { stations: [0, 100], offsets: [0], design, ground, prefix: '=S' });
  const csv = SK.stakingCsv(rows, { units: 'ft', title: 'Main St stakes' }).split('\r\n');
  ok(csv[0] === 'Main St stakes' && csv[1].startsWith('Point,Station,Offset (ft),Northing,Easting,Design elev.,Ground elev.,Cut/fill (ft)'), 'title, then the header');
  ok(csv[2] === "'=S1,0+00.00,0.00,5000.000,1000.000,100.000,101.000,C 1.00,1.000", 'a stake row: id guarded, station, offset, N, E, design, ground, C 1.00, +1.000');
  ok(csv[3].endsWith(',F 1.00,-1.000'), 'a fill row keeps its minus sign as a number');
}

section('the PDF');
{
  const stations = SK.stakeStations(al, { step: 5 });
  const rows = SK.stakeRows(al, { stations, offsets: [-12, 0, 12], design, ground });
  const { sheets, perPage } = SK.stakingSheets(rows, { paper: 'letter', units: 'ft', title: 'Main St', name: 'Main St' });
  ok(sheets.length === Math.ceil(rows.length / perPage) && sheets.length > 1, `${rows.length} stakes on ${sheets.length} letter pages (${perPage} a page)`);
  const { bytes, report } = await PL.toPdfPages(sheets, { title: 'Staking' });
  ok(report.missing === 0 && report.pages === sheets.length, 'written: every page, every character');
  let has = false; try { execFileSync('pdftotext', ['-v'], { stdio: 'ignore' }); has = true; } catch {}
  if (has) {
    const f = path.join(os.tmpdir(), 'cc-staking-' + process.pid + '.pdf'); fs.writeFileSync(f, bytes);
    const txt = execFileSync('pdftotext', ['-layout', '-f', '1', '-l', '1', f, '-'], { encoding: 'utf8' }); fs.unlinkSync(f);
    ok(/Point\s+Station\s+Offset \(ft\)\s+Northing\s+Easting\s+Design elev\.\s+Ground elev\.\s+Cut\/fill \(ft\)/.test(txt), 'pdftotext: the header row');
    ok(/1\s+0\+00\.00\s+12\.00 L\s+5012\.000\s+1000\.000\s+100\.00\s+101\.00\s+C 1\.00/.test(txt), 'and the first stake: 1, 0+00.00, 12.00 L, 5012.000, 1000.000, 100.00, 101.00, C 1.00');
    ok(/Sheet 1 of \d+/.test(txt), 'Sheet 1 of N');
  } else console.log('  note poppler not installed: PDF text checks skipped');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
