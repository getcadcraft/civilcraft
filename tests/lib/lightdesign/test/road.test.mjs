#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// road.test.mjs — 0.11 IL.10 road and street lighting (lib/road.js, road-ui.js, hosts/civil.js roadSections), session `road-light-11`.
// node lib/lightdesign/test/road.test.mjs     Sources and pages: docs/refs/road-lighting.md ([S] Sørensen 2013, [U] Fotios et al. 2005, [F] FHWA-HRT-14-051).
import * as L from '../lib/index.js';
import { sectionFromText, sectionToText } from '../road-ui.js';
import { roadSections } from '../hosts/civil.js';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const near = (a, b, e) => Number.isFinite(a) && Math.abs(a - b) <= e;

// A file written here from the IES LM-63 layout (no maker's data): axial, 1000 / 900 / 700 / 450 / 200 / 50 / 0 cd at 0 / 15 / 30 / 45 / 60 / 75 / 90°.
const IES = ['IESNA:LM-63-2002', '[LUMINAIRE] Hand-check road lantern', 'TILT=NONE', '1 1000 1 7 1 1 2 0.3 0.6 0 1 1 40', '0 15 30 45 60 75 90', '0', '1000 900 700 450 200 50 0'].join('\n');
const ies = L.parsePhotometry(IES, 'hand.ies').photo;
// A flat 1000 cd up to 60°, nothing past 60.5° (a cut-off written for the uniformity hand check)
const FLAT = ['IESNA:LM-63-2002', '[LUMINAIRE] Flat to 60', 'TILT=NONE', '1 1000 1 4 1 1 2 0.3 0.3 0 1 1 10', '0 60 60.5 90', '0', '1000 1000 0 0'].join('\n');
const flat = L.parsePhotometry(FLAT, 'flat.ies').photo;
const down = (x, y, z, photo) => ({ photo, p: [x, y, z], f: L.roadFrame([0, 1, 0], 0, 0) });

console.log('\nilluminance at a point, worked by hand ([S] eq. 1-2 p. 70-71: E = I cos v / d²)');
// luminaire 10 m up, point 10 m away across: γ = 45°, I = 450 cd, d² = 200 m², cos v = 0.70711 → E = 450 × 0.70711 / 200 = 1.5910 lx
ok(near(L.roadIlluminance([down(0, 0, 10, ies)], [0, 10, 0]), 1.5910, 0.0005), 'IES file, 10 m up, point 10 m across: 450 cd × 0.7071 / 200 m² = 1.591 lx', String(L.roadIlluminance([down(0, 0, 10, ies)], [0, 10, 0])));
// straight below: 1000 cd / 100 m² = 10 lx; 5 m along: γ = 26.565°, I = 900 − 200 × 11.565 / 15 = 745.80 cd, cos = 0.89443, d² = 125 → 5.3365 lx
ok(near(L.roadIlluminance([down(0, 0, 10, ies)], [0, 0, 0]), 10, 1e-9), 'straight below: 1000 cd / 10² = 10 lx');
ok(near(L.roadIlluminance([down(0, 0, 10, ies)], [5, 0, 0]), 5.3365, 0.0005), '5 m along: 745.8 cd (linear between 15° and 30°) × 0.8944 / 125 = 5.337 lx');
ok(L.roadIlluminance([down(0, 0, 10, ies)], [0, 0, 12]) === 0, 'a point above the luminaire gets no horizontal illuminance from it');

console.log('\nuniformity, worked by hand');
// One lane 4 m wide, 1 point across (y = 2), 4 along a 16 m field: x = 2, 6, 10, 14. Luminaires over y = 2 at x = 0 and 16, 10 m up (flat 1000 cd to 60°: reach 17.32 m;
// x = -16 and 32 are 18 m and more away, past 60.5°: nothing). E = 1000 × 10 / d³ from each:
//   a = 2: d³ = 104^1.5 = 1060.60 → 9.4286e-4; a = 14: 296^1.5 = 5092.6 → 1.9636e-4; a = 6: 136^1.5 = 1586.0 → 6.3052e-4; a = 10: 200^1.5 = 2828.4 → 3.5355e-4
//   E(2) = E(14) = 11.392 lx, E(6) = E(10) = 9.841 lx; average 10.617, Uo = 9.841 / 10.617 = 0.9269, Eavg/Emin = 1.0788
const one = { strips: [{ kind: 'carriageway', width: 4, lanes: 1 }] };
const u = L.runRoad({ section: one, arrangement: { type: 'single', side: 'left', spacing: 16, height: 10, overhang: 2 }, photo: flat, llf: 1, grid: { along: 4, across: 1 } });
const cu = u.carriageways[0];
ok(cu.points.map((p) => p[0]).join() === '2,6,10,14' && cu.points.every((p) => p[1] === 2), 'grid: 4 points along a 16 m field at D (i + ½), one across at the lane centre', JSON.stringify(cu.points));
ok(near(cu.values[0], 11.392, 0.002) && near(cu.values[1], 9.841, 0.002) && near(cu.values[3], 11.392, 0.002), 'E at the points: 11.392, 9.841, 9.841, 11.392 lx (by hand)', cu.values.map((v) => v.toFixed(3)).join());
ok(near(cu.E.avg, 10.617, 0.002) && near(cu.E.uo, 0.9269, 0.0005) && near(cu.E.ratio, 1.0788, 0.0005), 'average 10.617 lx, Uo = min / avg = 0.927, Eavg / Emin = 1.079 (by hand)', JSON.stringify(cu.E));
const u8 = L.runRoad({ section: one, arrangement: { type: 'single', side: 'left', spacing: 16, height: 10, overhang: 2 }, photo: flat, llf: 0.8, grid: { along: 4, across: 1 } });
ok(near(u8.carriageways[0].E.avg, 0.8 * 10.617, 0.002) && near(u8.carriageways[0].E.uo, 0.9269, 0.0005), 'a maintenance factor of 0.8 scales the average and leaves Uo');

console.log('\nluminance from an r-table ([S] eq. 5 p. 72; [U] p. 9)');
const T = { betas: [0, 90, 180], tans: [0, 1, 2], r: [[1000, 800, 400], [600, 400, 200], [500, 300, 100]] };
// bilinear: β 45 (half way 0 → 90), tan 0.5 (half way 0 → 1): (1000 + 800 + 600 + 400) / 4 = 700
ok(near(L.rAt(T, 45, 0.5), 700, 1e-9) && L.rAt(T, 0, 2.5) === null && near(L.rAt(T, 270, 1), 400, 1e-9), 'r interpolated linearly in β and tan γ (700 by hand), nothing past the last tan γ, β folded (270° = 90°)');
// a perfectly diffuse surface: r = q cos³γ with q = ρ / π, so L = q E = ρ E / π ([S] p. 70) at every point, whatever the observer
const D = L.diffuseRTable(0.1, [0, 0.25, 0.5, 1, 1.5, 2, 3, 4, 6, 8, 10, 12, 16, 20]);
const lum = down(0, 0, 10, ies), pt = [6, 8, 0], obs = [-60, 1.5, 1.5];   // tan γ = 10 / 10 = 1, a node of the table (between nodes the linear r differs from q cos³γ by up to a few %)
ok(near(L.roadLuminance([lum], pt, obs, D), (0.1 / Math.PI) * L.roadIlluminance([lum], pt), 1e-4), 'diffuse table: L = ρ E / π at a point (Lambert), on a tan γ node', L.roadLuminance([lum], pt, obs, D) + ' vs ' + (0.1 / Math.PI) * L.roadIlluminance([lum], pt));
// one luminaire straight above the point: tan γ = 0, β = 0: L = 0.0001 × r(0, 0) × I(0) / h² = 0.0001 × 1000 × 1000 / 100 = 1 cd/m²
ok(near(L.roadLuminance([lum], [0, 0, 0], obs, T), 1, 1e-9), 'luminaire straight above: 0.0001 × 1000 × 1000 cd / 10² = 1.000 cd/m² (by hand)');
// β: the luminaire beyond the point (as the observer sees it) is the specular side, β = 0; beside it β = 90
const beyond = { photo: ies, p: [10, 0, 10], f: L.roadFrame([0, 1, 0]) }, beside = { photo: ies, p: [0, 10, 10], f: L.roadFrame([0, 1, 0]) };
// beyond: tan 1, β 0 → r 800; I(45°) = 450 → 0.0001 × 800 × 450 / 100 = 0.36; beside: tan 1, β 90 → r 400 → 0.18
ok(near(L.roadLuminance([beyond], [0, 0, 0], [-60, 0, 1.5], T), 0.36, 1e-6) && near(L.roadLuminance([beside], [0, 0, 0], [-60, 0, 1.5], T), 0.18, 1e-6), 'β = 0 for a luminaire beyond the point (r 800: 0.36 cd/m²), 90 beside it (r 400: 0.18 cd/m²), by hand');

console.log('\nthreshold increment and veiling luminance ([S] A.9.2 p. 94-95)');
ok(near(L.thresholdIncrement(0.52, 1.25), 28.27, 0.01), "TI = 65 Lv / L^0.8: Lv 0.52, L 1.25 → 28.3 % (the source's own Table A.9, p. 99)");
ok(near(L.veilK(0), 10, 0) && near(L.veilK(23), 10.0, 0.01) && near(L.veilK(67), 20.08, 0.01), 'K = 10 for a young observer; 9.86 (1 + (A / 66.4)⁴) gives 10.0 at 23 and twice that at 67 years, as the source says');
// isotropic 1000 cd lamp 50 m ahead, 6.5 m above the eye: elevation atan(6.5/50) = 7.4069°, sight 1° down → θ = 8.4069°, d² = 2542.25,
// E = 1000 cos θ / d² = 0.38917 lx, Lv = 10 × 0.38917 / 8.4069² = 0.055065 cd/m²
const ISO = ['IESNA:LM-63-2002', 'TILT=NONE', '1 1000 1 3 1 1 2 0 0 0 1 1 10', '0 90 180', '0', '1000 1000 1000'].join('\n'), iso = L.parsePhotometry(ISO, 'iso.ies').photo;
const lamp = { photo: iso, p: [50, 0, 8], f: L.roadFrame([0, 1, 0]) }, th = 8.4069, E = 1000 * Math.cos((th * Math.PI) / 180) / 2542.25;
ok(near(L.veilingLuminance([lamp], [0, 0, 1.5], 1), (10 * E) / (th * th), 2e-5) && near((10 * E) / (th * th), 0.05506, 2e-5), 'Lv = 10 E / θ²: 0.0551 cd/m² for 1000 cd 50 m ahead, 6.5 m up (by hand)', String(L.veilingLuminance([lamp], [0, 0, 1.5], 1)));
ok(L.veilingLuminance([lamp], [0, 0, 1.5], -1) === 0, 'a luminaire behind the eye adds nothing');
ok(L.veilingLuminance([{ ...lamp, p: [10, 0, 8] }], [0, 0, 1.5], 1) === 0, 'a luminaire above the 20° roof line (6.5 m up, 10 m ahead: 33°) adds nothing');
ok(L.veilingLuminance([{ ...lamp, p: [600, 0, 8] }], [0, 0, 1.5], 1) === 0, 'a luminaire past 500 m adds nothing');

console.log('\narrangements and axes');
const sec = { strips: [{ kind: 'footway', width: 2 }, { kind: 'carriageway', width: 7, lanes: 2 }, { kind: 'footway', width: 2 }] };
const cs = L.cleanSection(sec);
ok(cs.width === 11 && cs.strips[1].y0 === 2 && cs.strips[1].laneWidth === 3.5 && cs.strips[1].dirs.join() === '-1,1', 'section: strips stacked from the left edge; two-way lanes −1, +1', JSON.stringify(cs.strips[1]));
const at = (type, o = {}) => L.roadLuminaires(cs, { type, spacing: 30, height: 8, overhang: 1, ...o }, ies, { from: 0, to: 59 });
ok(at('single').map((q) => q.p.join()).join(' ') === '0,3,8 30,3,8', 'one side, left: over y0 + overhang = 3 m, every 30 m');
ok(at('single', { side: 'right' })[0].p[1] === 8 && at('opposite').length === 4 && at('staggered').map((q) => q.x).sort((a, b) => a - b).join() === '0,15,30,45', 'right side over y1 − overhang; opposite = 2 a spacing; staggered: the right row half a spacing along');
const med = L.cleanSection({ strips: [{ kind: 'carriageway', width: 7, lanes: 2, oneWay: true }, { kind: 'median', width: 2 }, { kind: 'carriageway', width: 7, lanes: 2, oneWay: true, dirs: [-1, -1] }] });
const cen = L.roadLuminaires(med, { type: 'central', spacing: 30, height: 10, overhang: 1.5 }, ies, { from: 0, to: 0 });
ok(cen.length === 2 && cen.map((q) => q.p[1]).sort().join() === '6.5,9.5', 'twin arms on the centre: two luminaires back to back, 1.5 m each way from the middle of the median (8 m)');
const f0 = L.roadFrame([0, 1, 0], 0), f10 = L.roadFrame([0, 1, 0], 10);
ok(near(f0.s[1], 1, 1e-12) && near(f0.n[2], -1, 1e-12) && near(Math.abs(f0.r[0]), 1, 1e-12), 'C 90° points out over the road, C 0° along it, nadir down ([S] p. 73)');
ok(near(f10.n[1], Math.sin(Math.PI / 18), 1e-12) && near(f10.n[2], -Math.cos(Math.PI / 18), 1e-12), 'a 10° tilt turns the nadir 10° towards the road');

console.log('\na whole road');
const run = (o = {}) => L.runRoad({ section: sec, arrangement: { type: 'single', side: 'left', spacing: 30, height: 8, overhang: 1 }, photo: ies, llf: 0.8, rtable: D, ...o });
const r1 = run({ requirements: L.classValues('m', 'M4') });
const c1 = r1.carriageways[0];
ok(r1.count === 1 && c1.points.length === 60 && r1.footways.length === 2 && r1.footways[0].points.length === 30, 'one luminaire a field; carriageway 10 × 3 × 2 lanes = 60 points; two footways of 30');
ok(c1.luminance && c1.luminance.observers.length === 2 && near(c1.luminance.avg, (0.1 / Math.PI) * c1.E.avg, 0.02 * c1.luminance.avg), 'diffuse surface: average luminance ≈ ρ Ē / π (lowest of the two observers)', c1.luminance.avg + ' vs ' + (0.1 / Math.PI) * c1.E.avg);
ok(c1.lv.max > 0 && near(c1.ti, L.thresholdIncrement(c1.lv.max, c1.luminance.avg / 0.8), 1e-9), 'TI from the highest Lv and the INITIAL average luminance (maintained / 0.8)');
ok(c1.eir.left > 0 && c1.eir.right > 0 && c1.eir.min === Math.min(c1.eir.left, c1.eir.right), 'edge illumination ratio worked out on both edges (strips one lane wide)', JSON.stringify(c1.eir));
ok(r1.checks.map((c) => c.key).join() === 'L,uo,ul,ti,eir' && r1.checks.every((c) => typeof c.ok === 'boolean'), 'M4 checks: L, Uo, Ul, TI, EIR (wet Uo not checked)');
const noRt = run({ rtable: null, requirements: L.classValues('m', 'M4') });
ok(noRt.carriageways[0].luminance === null && noRt.carriageways[0].ti === null && noRt.checks.filter((c) => c.ok === null).map((c) => c.key).join() === 'L,uo,ul,ti' && noRt.notes.includes('road.note.nortable'), 'no r-table: no luminance, Ul or TI; those checks say "unknown", EIR is still checked');
const probs = L.roadProblems(noRt, (k, v) => k + JSON.stringify(v || {}));
ok(probs.length >= 4 && probs.filter((p) => p.severity === 'note').length === 4 && probs.every((p) => p.code.startsWith('road.') && p.source.name === 'lightdesign.road' && p.text), 'Problems: a note for each criterion that needs the table, a warning for each one not met');
const bad = run({ requirements: { E: 1000 } }), pf = L.roadProblems(bad);
ok(bad.checks[0].ok === false && pf.length === 1 && pf[0].severity === 'warning' && pf[0].req.value === 1000 && pf[0].found.unit === 'lx', 'a failed criterion is one Problems warning with required and found');

console.log('\ncited class tables');
ok(JSON.stringify(L.classValues('m', 'M1')) === JSON.stringify({ L: 2, uo: 0.4, ul: 0.7, ti: 10, eir: 0.35 }) && L.classValues('m', 'M6').ti === 20 && L.classValues('m', 'M5').uo === 0.35, 'M classes as [S] Table 2 p. 16 (M1 2.00 cd/m², 0.40, 0.70, 10 %, 0.35; M5 Uo 0.35; M6 TI 20)');
ok(L.classValues('c', 'C2').E === 20 && L.classValues('c', 'C5').E === 7.5 && L.classValues('p', 'P3').fEmin === 1.5 && L.classValues('p', 'P3').fEmax === 11.25, 'C2 20 lx, C5 7.5 lx ([S] Table 3); P3 7.5 / 1.5 lx and at most 1.5 × 7.5 = 11.25 ([S] Table 4 note a)');
ok(L.classValues('rp8', 'major.high', { pavement: 'R1' }).E === 12 && L.classValues('rp8', 'major.high', { pavement: 'R3' }).E === 17 && L.classValues('rp8', 'local.low', { pavement: 'R4' }).ratio === 6 && L.RP8_00.length === 14, 'RP-8-00 as FHWA Table 20: major/high 12 lx on R1, 17 on R2-R3; local Eavg/Emin 6; 14 rows');
ok(L.classValues('m', 'M9') === null && L.classValues('zz', 'M1') === null, 'an unknown class is null');

console.log('\nr-table text');
const txt = 'beta\\tan, 0, 0.5, 1\n0, 1000, 900, 700\n90, 800, 500, 300\n180, 700, 400, 200';
const pr = L.parseRTable(txt);
ok(pr.ok && pr.table.tans.join() === '0,0.5,1' && pr.table.betas.join() === '0,90,180' && pr.table.r[1][1] === 500, 'a pasted table: tan γ header (first cell a word), β rows, r × 10 000');
ok(L.parseRTable('0\t0,5\t1\n0\t10\t9\t8\n90\t5\t4\t3'.replace('0\t0,5', 'x\t0\t0,5')).ok && L.parseRTable('x;0;0,5\n0;1;2\n90;3;4').table.tans[1] === 0.5, 'tabs or semicolons with decimal commas');
ok(L.parseRTable('0 1\n0 5').key === 'rt.short' && L.parseRTable('0 2 1\n0 1 2 3\n9 1 2 3').key === 'rt.tans' && L.parseRTable('0 1\n0 1 2\n0 1 2').key === 'rt.betas' && L.parseRTable('0 1\n0 1\n9 1 2').key === 'rt.row' && L.parseRTable('0 1\n0 1 -2\n9 1 2').key === 'rt.neg', 'refused with a reason: too short, tan γ not rising, β not rising, a short row, a negative value');

console.log('\ncross-section text and CivilCraft assemblies');
const st = sectionFromText('footway, 2\ncarriageway, 7.3, 2\nverge, 1.5\nnonsense, 3\nfootway, 2');
ok(st.strips.length === 4 && st.strips[1].lanes === 2 && sectionFromText(sectionToText(st)).strips.map((s) => s.kind + s.width).join() === st.strips.map((s) => s.kind + s.width).join(), 'typed section: unknown kinds skipped; written and read back the same');
const civ = roadSections({ units: 'ft', alignments: [
  { id: 'a1', name: 'Main St', corridor: { on: true, parts: { L: [{ type: 'lane', w: 12 }, { type: 'gutter', w: 2 }, { type: 'curb', w: 0.5, h: 0.5 }, { type: 'strip', w: 5 }, { type: 'walk', w: 5 }, { type: 'daylight', cut: 2, fill: 3 }], R: [{ type: 'lane', w: 12 }, { type: 'lane', w: 12 }, { type: 'shoulder', w: 4 }, { type: 'daylight' }] } } },
  { id: 'a2', name: 'Lane', corridor: { on: true, lane: 12, shoulder: 4 } }, { id: 'a3', name: 'Track', rail: { gauge: 1.435 } }] });
const ms = civ[0].section.strips;
ok(civ.length === 2 && civ[0].name === 'Main St' && ms.map((s) => s.kind).join() === 'footway,verge,verge,verge,carriageway,verge', 'CivilCraft: left parts reversed then right; walk = footway, gutter/curb/strip/shoulder = verge, daylight left out; a track is not a road', ms.map((s) => s.kind).join());
const mc = ms[4];
ok(mc.lanes === 3 && near(mc.width, 36 * 0.3048, 1e-3) && mc.dirs.join() === '-1,1,1' && near(ms[0].width, 1.524, 1e-3), 'the lanes next to the centre line are one carriageway of 3 lanes (left one runs the other way), feet turned into metres');
ok(civ[1].simple && civ[1].section.strips.map((s) => s.kind).join() === 'verge,carriageway,verge' && civ[1].section.strips[1].lanes === 2, 'a simple assembly: one lane and one shoulder a side');
const rr = L.runRoad({ section: civ[0].section, arrangement: { type: 'opposite', spacing: 35, height: 10, overhang: 0.5, cw: 0 }, photo: ies, llf: 0.8 });
ok(rr.carriageways.length === 1 && rr.carriageways[0].lanes === 3 && rr.footways.length === 1 && rr.count === 2, 'a CivilCraft section runs: one carriageway of 3 lanes, one footway, 2 luminaires a field');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
