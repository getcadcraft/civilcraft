#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-motion.mjs — 0.8 EG.7: motion studies (motion.js) on a real assembly (two flanges from fixtures.mjs, mesh kernel), against closed forms:
 *   - a revolute joint driven 0 → 90° in 2 s (linear): a point on a 75 mm radius moves at r·ω = 58.905 mm/s all the way, with the centripetal
 *     acceleration r·ω² = 46.27 mm/s², along an arc of length r·π/2 = 117.81 mm, and stays 75 mm from the axis
 *   - a slider −5 → 20 mm in 5 s: constant 5 mm/s; the gap between the two discs is the offset itself, so the least gap is 0 where they touch,
 *     the five steps with a negative offset clash and the first is reported at −5 mm
 *   - the laws: smoothstep peaks at 1.5 × the average speed, the sine law at π/2 ×, the round trip returns to where it started at 2 ×
 *   - limits hold the range; the joint value is put back; refusals say what to try; the plot and the CSV
 *   node tools/partcraft-test/test-motion.mjs [--verbose]    (or runMotionTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runMotionTests({ ok, section, M }) {
  const [A, K, V, MO, F, I18N] = await Promise.all(['assembly.js', 'kernel.js', 'vec.js', 'motion.js'].map((f) => import(DEV + f)).concat([import(path.join(HERE, 'fixtures.mjs')), import(DEV + 'i18n.js')]));
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const near = (a, b, rel = 1e-9) => Math.abs(a - b) <= rel * Math.max(1, Math.abs(b));
  const code = (fn) => { try { fn(); return ''; } catch (e) { return e.code || 'plain'; } };
  const fl = F.flange();
  const setup = (type, values = {}) => {
    const asm = A.newAssembly('Motion');
    const i1 = A.insertPart(asm, fl.part);
    const i2 = A.insertPart(asm, fl.part, { pid: i1.part, place: V.translation([300, 0, 0]) });
    const builds = new Map([[i1.part, K.regenerate(asm.parts[i1.part].part, M)]]);
    const bottom = { kind: 'face', feature: fl.ids.revolve, face: 'side', entity: fl.lines[0] };
    const j = A.addJoint(asm, type, { inst: i1.id, plane: bottom }, { inst: i2.id, plane: bottom }, values);
    return { asm, builds, j, i1, i2 };
  };

  section('EG.7 motion: a revolute joint');
  {
    const s = setup('revolute');
    const r = 75, w = (Math.PI / 2) / 2;
    const st = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: 0, to: 90, duration: 2, steps: 90, tracks: [{ inst: s.i2.id, at: [r, 0, 0], name: 'Bolt hole' }], clashes: false });
    ok(st.rows.length === 91 && st.rows[0].time === 0 && near(st.rows[90].time, 2) && st.key === 'angle' && st.unit === 'deg', '91 rows for 90 steps, 0 → 2 s, driving the angle');
    const sp = st.rows.map((q) => q.tracks[0].speed);
    const worst = Math.max(...sp.map((v) => Math.abs(v / (r * w) - 1)));
    ok(worst < 5e-4, `speed r·ω = ${(r * w).toFixed(4)} mm/s at every step (worst relative error ${(worst * 100).toFixed(4)} %)`);
    const acMid = Math.hypot(...st.rows[45].tracks[0].acc);
    ok(near(acMid, r * w * w, 2e-3), `centripetal acceleration r·ω² = ${(r * w * w).toFixed(3)} mm/s² (read ${acMid.toFixed(3)})`);
    ok(near(st.summary.peaks[0].travel, r * Math.PI / 2, 1e-3), `path length ${st.summary.peaks[0].travel.toFixed(3)} mm vs r·π/2 = ${(r * Math.PI / 2).toFixed(3)}`);
    const p0 = st.rows[0].tracks[0].pos, p1 = st.rows[90].tracks[0].pos, chord = Math.hypot(p1[0] - p0[0], p1[1] - p0[1], p1[2] - p0[2]);
    ok(near(chord, r * Math.SQRT2, 1e-9), `0° to 90°: the point has moved by the chord r·√2 = ${(r * Math.SQRT2).toFixed(4)} mm (read ${chord.toFixed(4)})`);
    ok(near(st.rows[45].rate, 45, 1e-9) && near(st.rows[45].value, 45, 1e-12), 'the joint value is 45° at half time and its rate 45°/s');
    ok(s.j.angle === 0 || s.j.angle === undefined, 'the joint\'s own value is put back');
  }

  section('EG.7 motion: a slider, clearance and clashes');
  {
    const s = setup('slider');
    const st = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: -5, to: 20, duration: 5, steps: 25, tracks: [{ inst: s.i2.id, at: [0, 0, 0], name: 'Origin' }], clearance: { limit: 2, search: 50 } });
    const sp = st.rows.map((q) => q.tracks[0].speed);
    ok(sp.every((v) => near(v, 5, 1e-6)), 'constant 5 mm/s: 25 mm in 5 s');
    const neg = st.rows.filter((q) => q.value < -1e-9), zero = st.rows.find((q) => Math.abs(q.value) < 1e-9);
    ok(neg.length === 5 && neg.every((q) => q.clashes.length === 1 && q.clashes[0].kind === 'overlap'), 'the five steps with a negative offset clash (the discs overlap)');
    ok(!zero.clashes.length, 'at offset 0 the faces touch: no clash');
    const overlapVol = neg[0].clashes[0].volume, slab = 5 * (Math.PI * (100 ** 2 - 34 ** 2) - 8 * Math.PI * 49) * F.facetFactor(64) / Math.PI;
    ok(near(overlapVol, slab, 1e-3), `at −5 mm the shared volume is ${overlapVol.toFixed(0)} mm³: a 5 mm slab of the disc with its bore and eight holes, π(100² − 34²) − 8π·7², × the 64-gon factor = ${slab.toFixed(0)}`);
    ok(st.summary.firstClash && st.summary.firstClash.k === 0 && near(st.summary.firstClash.value, -5), 'the first clash is reported at step 0, −5 mm');
    const g = (v) => st.rows.find((q) => Math.abs(q.value - v) < 1e-9).gaps[0].gap;
    ok(near(g(10), 10, 1e-6) && near(g(3), 3, 1e-6) && near(g(20), 20, 1e-6), 'clearance = the offset: gap 3 at 3 mm, 10 at 10 mm, 20 at 20 mm');
    ok(st.summary.minGap && near(st.summary.minGap.gap, 0, 1e-9), 'the least gap over the sweep is 0 (touching or overlapping)');
    const lim = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: -5, to: 20, duration: 5, steps: 25, clearance: { limit: 1.5 } });
    ok(lim.summary.gapFlags === 7, 'steps with a gap under a 1.5 mm limit are counted: offsets −5 … 1 (seven steps)');
    ok(lim.rows.every((q) => q.tracks.length === 0) && lim.summary.peaks.length === 0, 'no tracks asked, none recorded');
    const far = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: 30, to: 40, duration: 1, steps: 2, clearance: { search: 10 } });
    ok(far.rows.every((q) => q.gaps.length === 0) && far.summary.minGap === null, 'a pair farther than the search length is not listed (the gap is "far")');
    const named = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: 30, to: 40, duration: 1, steps: 2, clearance: { search: 10, pairs: [[s.i1.id, s.i2.id]] } });
    ok(named.rows.every((q) => q.gaps.length === 1 && q.gaps[0].gap === 10), 'a pair asked for by name is listed even when far: the gap is the search length, 10');
    ok(s.j.offset === 0 || s.j.offset === undefined, 'the joint\'s own value is put back');
  }

  section('EG.7 motion: the laws');
  {
    const s = setup('slider');
    const peak = (law, steps = 200) => { const st = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: 0, to: 20, duration: 4, steps, law, tracks: [{ inst: s.i2.id, at: [0, 0, 0] }], clashes: false }); return { st, sp: Math.max(...st.rows.map((q) => q.tracks[0].speed)) }; };
    const avg = 5;
    const e = peak('ease'), si = peak('sine'), rt = peak('round-trip');
    ok(near(e.sp, 1.5 * avg, 1e-3), `smoothstep: peak ${e.sp.toFixed(4)} mm/s = 1.5 × the average (${1.5 * avg})`);
    ok(near(si.sp, Math.PI / 2 * avg, 1e-3), `sine: peak ${si.sp.toFixed(4)} mm/s = π/2 × the average (${(Math.PI / 2 * avg).toFixed(4)})`);
    ok(near(rt.sp, 2 * avg, 1e-6) && near(rt.st.rows[200].value, 0, 1e-12) && near(rt.st.rows[100].value, 20, 1e-12), 'round trip: 2 × the average speed, 20 at half time, back at 0 at the end');
    ok(e.st.rows[0].tracks[0].speed < 0.1 && e.st.rows[200].tracks[0].speed < 0.1 && near(e.st.rows[200].value, 20, 1e-12), 'smoothstep starts and ends at rest and arrives at 20');
    ok(near(e.st.summary.peaks[0].speedAt, 2, 0.02), 'the peak speed is in the middle of the run (2 s)');
  }

  section('EG.7 motion: limits, refusals, plots and the file');
  {
    const s = setup('slider', {});
    s.j.limits = { min: 0, max: 10 };
    const st = MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: -5, to: 20, duration: 1, steps: 10 });
    ok(st.clamped && st.rows[0].value === 0 && st.rows[10].value === 10 && st.notes.some((n) => /limits/.test(n)), 'a range outside the joint\'s limits is held inside them, and the notes say so');
    const bad = (spec) => code(() => MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: 0, to: 1, ...spec }));
    ok(bad({ joint: 'jx' }) === 'not_found' && bad({ steps: 401 }) === 'invalid_argument' && bad({ law: 'wobble' }) === 'invalid_argument' && bad({ key: 'angle' }) === 'invalid_argument' && bad({ tracks: [{ inst: 'nope' }] }) === 'not_found' && bad({ duration: 0 }) === 'invalid_argument' && bad({ from: NaN }) === 'invalid_argument', 'unknown joint, too many steps, an unknown law, a value the joint lacks, an unknown track, zero duration, NaN: each refused with its code');
    const r = setup('rigid');
    ok(code(() => MO.motionStudy(r.asm, r.builds, M, { joint: r.j.id, from: 0, to: 1 })) === 'unsupported', 'a rigid joint has nothing to drive: unsupported');
    try { MO.motionStudy(s.asm, s.builds, M, { joint: s.j.id, from: 0, to: 1, key: 'angle' }); } catch (e) { ok(e.next.length && /offset/.test(e.next.join()), 'and the refusal says which value to use'); }
    const free = setup('slider', {});
    const run = MO.motionStudy(free.asm, free.builds, M, { joint: free.j.id, from: 0, to: 20, duration: 2, steps: 20, tracks: [{ inst: free.i2.id, at: [0, 0, 0], name: '<b>Slide</b>' }], clearance: { search: 50 } });
    const pos = MO.series(run, 'position'), sp = MO.series(run, 'speed'), val = MO.series(run, 'value'), cl = MO.series(run, 'clearance');
    ok(pos.length === 3 && pos[1].points.length === 21 && near(pos[1].points[20][1], -20, 1e-9) && sp.length === 1 && val.length === 2 && cl.length === 1 && near(cl[0].points[20][1], 20, 1e-6), 'series: x, y, z of the track (y runs 0 → −20), its speed, the value and its rate, the clearance of the pair');
    const svg = MO.plotSvg(sp, { title: 'Speed <t>', xLabel: 's', yLabel: 'mm/s' });
    ok(/^<svg /.test(svg) && /<path d="M/.test(svg) && !/<b>/.test(svg) && /&lt;b&gt;Slide&lt;\/b&gt;/.test(svg) && /Speed &lt;t&gt;/.test(svg), 'the plot is SVG with a line, and names are escaped');
    const csv = MO.csv(run);
    const lines = csv.split('\r\n').filter(Boolean);
    ok(csv.charCodeAt(0) === 0xfeff && lines.length === 22 && /Slide/.test(lines[0]) && lines[1].split(',').length === lines[0].split(',').length, 'CSV: a byte-order mark, a header and 21 rows of the same width');
    const evil = MO.csv({ ...run, tracks: [{ ...run.tracks[0], name: '=cmd()' }] });
    ok(/'=cmd\(\) x/.test(evil), 'a name that starts with = is quoted so a spreadsheet does not run it');
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const H = await import(path.join(REPO, 'tools/cli/headless/part.mjs'));
  const M = (await H.partModules()).man;
  await runMotionTests({ ok, section: (m) => { if (VERBOSE) console.log(m); }, M });
  console.log(`motion: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
