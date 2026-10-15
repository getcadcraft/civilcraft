#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-flprofile.mjs — CivilCraft 0.5 WL.20: feature lines in profile views (featureline.js alignmentCrossings,
 * projectedRuns, featureProfile) and WL.21: the grade and elevation overlay (gradeOverlay; screen only), DOM-free. Every
 * expected station, elevation and label is worked by hand below.
 *
 *   node bin/test-civilcraft-flprofile.mjs [--build dev|x.y] [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const VERBOSE = process.argv.includes('--verbose');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; return m ? { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true } : next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const F = await mod('featureline.js');
const { buildAlignment } = await mod('alignment.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol = 1e-9) => Number.isFinite(a) && Math.abs(a - b) <= tol;
const section = (s) => console.log('\n== ' + s);
const fl = (id, pts, extra = {}) => ({ id, name: id.toUpperCase(), pts: pts.map(([x, y, z]) => ({ x, y, z })), closed: false, use: 'eg', ...extra });

section('a straight alignment from (0, 0) to (100, 0), starting at station 1000');
const st = buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 100, y: 0 }], start: 1000 });
const curbX = fl('x', [[50, -10, 100], [50, 10, 104]]);
const c1 = F.alignmentCrossings(st, curbX);
ok(c1.length === 1 && near(c1[0].sta, 1050) && near(c1[0].z, 102) && near(c1[0].grade, 0.2), 'a line across at x = 50: one crossing at 10+50, z halfway = 102.00, its grade 20 %');
const kinked = fl('k', [[20, -5, 90], [30, 5, 91], [40, -5, 93]]);
const c2 = F.alignmentCrossings(st, kinked);
ok(c2.length === 2 && near(c2[0].sta, 1025) && near(c2[0].z, 90.5) && near(c2[1].sta, 1035) && near(c2[1].z, 92), 'a zig-zag crosses twice: 10+25 at 90.50, 10+35 at 92.00 (in station order)');
const onVertex = fl('v', [[60, -4, 80], [60, 0, 82], [60, 4, 84]]);
ok(F.alignmentCrossings(st, onVertex).length === 1 && near(F.alignmentCrossings(st, onVertex)[0].z, 82), 'a vertex exactly on the centerline counts once');
ok(F.alignmentCrossings(st, fl('p', [[10, 5, 1], [90, 5, 2]])).length === 0 && F.alignmentCrossings(st, fl('o', [[150, -5, 1], [150, 5, 2]])).length === 0, 'parallel, or past the end: no crossing');
const box = fl('b', [[70, -3, 50], [80, -3, 50], [80, 3, 52], [70, 3, 52]], { closed: true });
const cb = F.alignmentCrossings(st, box);
ok(cb.length === 2 && near(cb[0].sta, 1070) && near(cb[0].z, 51) && near(cb[1].sta, 1080) && near(cb[1].z, 51), 'a closed outline round the centerline: in at 10+70 and out at 10+80, both at 51.00 (its closing segment counted)');

section('alongside: a curb 6 ft right of the centerline');
const curb = fl('c', [[10, -6, 100], [50, -6, 102], [90, -6, 106]]);
ok(F.projectedRuns(st, curb, 5).length === 0, 'within 5 ft: not shown');
const r10 = F.projectedRuns(st, curb, 10);
ok(r10.length === 1 && r10[0].length === 3 && near(r10[0][0].sta, 1010) && near(r10[0][2].sta, 1090) && near(r10[0][1].z, 102) && near(r10[0][0].off, 6), 'within 10 ft: one run 10+10 → 10+90, its vertices\' elevations, offset +6 (right)');
const back = fl('r', [[90, 4, 1], [10, 4, 2]]);
const rb = F.projectedRuns(st, back, 5);
ok(rb.length === 1 && rb[0][0].sta < rb[0][1].sta && near(rb[0][0].z, 2), 'drawn the other way: the run still reads in station order');
const leaves = fl('l', [[10, 2, 1], [30, 2, 2], [40, 30, 3], [60, 2, 4], [80, 2, 5]]);
const rl = F.projectedRuns(st, leaves, 5);
ok(rl.length === 2 && rl[0].length === 2 && rl[1].length === 2, 'a line that leaves the band and comes back: two runs');
const crossing = fl('cr', [[10, -3, 10], [30, 3, 12]]);
const rc = F.projectedRuns(st, crossing, 5);
ok(rc.length === 1 && rc[0].length === 3 && near(rc[0][1].sta, 1020) && near(rc[0][1].z, 11) && rc[0][1].off === 0, 'a run that crosses the centerline carries the crossing point too (10+20 at 11.00)');
ok(F.projectedRuns(st, curb, 0).length === 0, 'within 0: no runs (crossings only)');
ok(F.projectedRuns(st, curbX, 20).length === 0, 'a line straight across, inside the band: only its crossing, no run');

section('a curved alignment: (0, 0) → PI (100, 0) R 50 → (100, 100)');
const cv = buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 100, y: 0, r: 50 }, { x: 100, y: 100 }], start: 0 });
// T = 50·tan 45° = 50: PC at (50, 0), centre (50, 50); a ray from the centre at −45° meets the arc at 50 + R·π/4
const ang = -Math.PI / 4, hitX = 50 + 50 * Math.cos(ang), hitY = 50 + 50 * Math.sin(ang);
const radial = fl('rad', [[50 + 40 * Math.cos(ang), 50 + 40 * Math.sin(ang), 200], [50 + 60 * Math.cos(ang), 50 + 60 * Math.sin(ang), 210]]);
const cc = F.alignmentCrossings(cv, radial);
ok(cc.length === 1 && near(cc[0].sta, 50 + 50 * Math.PI / 4, 1e-9) && near(cc[0].z, 205, 1e-9), 'a radial line across the curve: station 50 + R·π/4 = ' + (50 + 50 * Math.PI / 4).toFixed(4) + ' (' + cc[0]?.sta.toFixed(4) + '), z 205.00 halfway');
ok(near(cv.pointAt(cc[0].sta).x, hitX, 1e-9) && near(cv.pointAt(cc[0].sta).y, hitY, 1e-9), 'and that station is where the alignment really is at the crossing');
const chord = fl('ch', [[60, 40, 5], [110, 40, 7]]);
const ch = F.alignmentCrossings(cv, chord);
ok(ch.length === 1 && near(cv.pointAt(ch[0].sta).y, 40, 1e-9), 'a line across the curve\'s far side: one crossing, on the arc (y = 40)');

section('featureProfile');
const all = F.featureProfile(st, [curbX, curb, fl('far', [[10, 50, 1], [90, 50, 2]])], { within: 10 });
ok(all.length === 2 && all[0].name === 'X' && all[0].crossings.length === 1 && all[0].runs.length === 0 && all[1].runs.length === 1 && all[1].crossings.length === 0, 'lines with a crossing or a run are listed with their names; a line far off is left out');
ok(F.featureProfile(st, [curb]).length === 0 && F.featureProfile({ elements: [] }, [curbX]).length === 0 && F.featureProfile(st, null).length === 0, 'no band, no alignment, no lines: nothing');
// labels follow edits: the same line raised 1 ft gives a crossing 1 ft higher (the page works it out again on every change)
const raised = F.raise(curbX, 1);
ok(near(F.alignmentCrossings(st, raised)[0].z, 103), 'raised 1 ft: the crossing\'s elevation is 103.00');

section('the grade and elevation overlay (WL.21): screen labels only');
{
  const id = (x, y) => ({ x, y });   // one drawing unit = one pixel, y as drawn
  const ln = fl('g', [[0, 0, 100], [100, 0, 98], [100, 30, 98], [100, 130, 99]]);
  const items = F.gradeOverlay([ln], id);
  const grades = items.filter((i) => i.kind === 'grade'), elevs = items.filter((i) => i.kind === 'elev');
  ok(grades.length === 2 && grades[0].text === '2.00%' && grades[1].text === '1.00%', 'a grade at each segment long enough (100 px): 2.00 % and 1.00 %; the 30 px one is left out (' + grades.map((g) => g.text).join(', ') + ')');
  ok(near(grades[0].x, 50) && near(grades[0].y, 0) && near(grades[0].down, 0) && near(grades[1].down, Math.PI / 2 + Math.PI), 'labels at the middles; the arrow points downhill: along the first segment (falling), back along the last (rising)');
  ok(F.gradeOverlay([fl('lv', [[0, 0, 5], [100, 0, 5]])], id).find((i) => i.kind === 'grade').down === null, 'a level segment: 0.00 % and no arrow');
  ok(elevs.map((e) => e.text).join() === '100.00,98.00,99.00', 'elevations at the vertices, the one 30 px from another left out (decluttered): ' + elevs.map((e) => e.text).join(', '));
  const back = F.gradeOverlay([fl('bk', [[100, 0, 1], [0, 0, 2]])], id)[0];
  ok(Math.abs(back.ang) <= Math.PI / 2 + 1e-12 && near(back.down, Math.PI + Math.PI), 'a line drawn right to left: its label stays upright, the arrow still downhill (towards +x)');
  const zoomedOut = F.gradeOverlay([ln], (x, y) => ({ x: x / 10, y: y / 10 }));
  ok(!zoomedOut.some((i) => i.kind === 'grade') && zoomedOut.filter((i) => i.kind === 'elev').length === 1, 'zoomed out ten times: no grade labels, one elevation (the rest too close)');
  ok(F.gradeOverlay([ln, fl('h', [[0, 50, 1], [100, 50, 2]])], id, { skip: 'g' }).every((i) => i.kind !== 'grade' || i.text === '1.00%') && F.gradeOverlay([ln], id, { skip: 'g' }).length === 0, 'the selected line (skip) is left to its own labels');
  // the plotted / exported scene never sees the overlay
  const SC = await mod('scene.js');
  const st = { units: 'ft', points: [{ n: '1', x: 0, y: 0, z: 1, d: 'A' }], surface: null, contours: { interval: 1, major: 5, list: [] }, breaklines: [], alignments: [], pads: [], corridors: [], network: null };
  ok(JSON.stringify(SC.planScene(st, { show: { gradeOverlay: true } })) === JSON.stringify(SC.planScene(st, { show: { gradeOverlay: false } })), 'planScene (screen, PDF, DXF, DWG) is the same with the overlay on or off');
}

console.log(fail ? `\n${fail} FAILED, ${pass} passed` : `\nall ${pass} feature line profile checks passed`);
process.exit(fail ? 1 : 0);
