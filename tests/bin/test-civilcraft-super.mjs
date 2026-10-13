#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-super.mjs — CivilCraft 0.4 V18: superelevation basics (superelev.js + corridor.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-super.mjs [--build dev|x.y] [--verbose]
 *
 * By hand, a 12 ft lane, NC 2 %, Δ 0.5 %, a 2,000 ft curve to the right → e 4 % from the placeholder table: runoff
 * Lr = 12 × 0.04 / 0.005 = 96 ft, runout Lt = 0.02 / 0.04 × 96 = 48 ft, two thirds of Lr before the PC. The slopes at
 * every key station (normal crown, level crown, reverse crown, full superelevation, back), the left/right sides for a
 * left curve, the corridor's edges of pavement at full super on flat ground (z ± 12 × 0.04), the low shoulder no flatter
 * than its lane, short curves and overlapping transitions said, untrusted settings, the project file.
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
const SE = await mod('superelev.js');
const AL = await mod('alignment.js');
const PJ = await mod('project.js');
const SEC = await mod('sections.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

section('the rate table');
{
  const d = SE.SUPER_DEFAULTS('ft');
  ok(SE.rateFor(8000, d.rate) === null && SE.rateFor(5000, d.rate) === 0.02 && SE.rateFor(3000, d.rate) === 0.03 && SE.rateFor(2000, d.rate) === 0.04 && SE.rateFor(1500, d.rate) === 0.05 && SE.rateFor(500, d.rate) === 0.06, 'placeholders: 8000 normal crown, 5000 2 %, 3000 3 %, 2000 4 %, 1500 5 %, 500 6 %');
  const c = SE.cleanSuper({ on: true, delta: 9, rate: [[100, 0.05], ['x', 1], [500, null], [300, 0.9], [-1, 0.02]] }, 'ft');
  ok(c.on && c.delta === 0.005 && JSON.stringify(c.rate) === '[[500,null],[100,0.05]]', 'untrusted: bad Δ → 0.5 %, bad rows dropped, sorted by radius');
  ok(SE.cleanSuper(null) === null && JSON.stringify(SE.cleanSuper({ rate: [] }, 'm').rate) === JSON.stringify(SE.SUPER_DEFAULTS('m').rate), 'nothing → none; an empty table → the metric placeholders');
}

// a road: east, a 2,000 ft radius curve to the right (south-east), then on
const right = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 2000 }, { x: 1700, y: -700 }] });
const sp = { on: true, delta: 0.005, rate: SE.SUPER_DEFAULTS('ft').rate };
section('transitions worked by hand');
const plan = SE.superPlan(right, { super: sp, nc: 0.02, lane: 12 });
const c = plan.curves[0];
{
  ok(plan.curves.length === 1 && c.dir === 'right' && c.outside === 'L' && c.e === 0.04, 'one curve, to the right: the outside is the left lane, e 4 %');
  near(c.Lr, 96, 1e-9, 'runoff 12 × 0.04 / 0.005 = 96 ft'); near(c.Lt, 48, 1e-9, 'runout 0.02 / 0.04 × 96 = 48 ft');
  const s = c.stations;
  near(s.lc0, c.pc - 64, 1e-9, 'level crown 2/3 × 96 = 64 ft before the PC'); near(s.nc0, c.pc - 112, 1e-9, 'normal crown ends 48 ft before that');
  near(s.rc0, c.pc - 64 + 48, 1e-9, 'reverse crown NC/e = half way along the runoff'); near(s.fs0, c.pc + 32, 1e-9, 'full superelevation 1/3 × 96 = 32 ft after the PC');
  near(s.fs1, c.pt - 32, 1e-9, 'and back: full to PT − 32'); near(s.nc1, c.pt + 112, 1e-9, 'normal crown again at PT + 112');
  ok(!plan.problems.length, 'no problems');
  const at = (sta) => SE.slopesAt(plan, sta, 0.02);
  const eq = (v, L, R, m) => ok(Math.abs(v.L - L) < 1e-12 && Math.abs(v.R - R) < 1e-12, `${m}: L ${v.L.toFixed(4)} R ${v.R.toFixed(4)}`);
  eq(at(s.nc0 - 10), 0.02, 0.02, 'before: normal crown');
  eq(at(s.nc0 + 24), 0.01, 0.02, 'half way along the runout: the outside lane at 1 %');
  eq(at(s.lc0), 0, 0.02, 'level crown: the outside lane flat');
  eq(at(s.rc0), -0.02, 0.02, 'reverse crown: one plane at 2 %');
  eq(at((s.rc0 + s.fs0) / 2), -0.03, 0.03, 'between: the whole section rotates (3 %)');
  eq(at(s.fs0), -0.04, 0.04, 'full superelevation: 4 % down to the inside');
  eq(at((c.pc + c.pt) / 2), -0.04, 0.04, 'mid curve: full');
  eq(at(s.rc1), -0.02, 0.02, 'reverse crown on the way out');
  eq(at(s.nc1 + 1), 0.02, 0.02, 'after: normal crown');
  const left = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 2000 }, { x: 1700, y: 700 }] });
  const pl = SE.superPlan(left, { super: sp, nc: 0.02, lane: 12 });
  const v = SE.slopesAt(pl, (pl.curves[0].pc + pl.curves[0].pt) / 2, 0.02);
  ok(pl.curves[0].outside === 'R' && Math.abs(v.R + 0.04) < 1e-12 && Math.abs(v.L - 0.04) < 1e-12, 'a curve to the left: the right lane is the outside one');
  ok(SE.superPlan(right, { super: { ...sp, on: false } }).curves.length === 0, 'off: nothing');
  const flat = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 9000 }, { x: 2000, y: -50 }] });
  ok(SE.superPlan(flat, { super: sp, nc: 0.02, lane: 12 }).curves.length === 0, 'a 9,000 ft curve stays at normal crown');
}

section('short curves and overlapping transitions');
{
  const tight = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 500, y: 0, r: 600 }, { x: 1000, y: -60 }] });   // Δ ≈ 6.8°, L ≈ 72 ft < 2 × Lr/3 = 96 ft
  const p1 = SE.superPlan(tight, { super: sp, nc: 0.02, lane: 12 });
  ok(p1.problems.some((m) => /too short for full superelevation/.test(m)), 'a short curve: said');
  const v = SE.slopesAt(p1, (p1.curves[0].pc + p1.curves[0].pt) / 2, 0.02);
  ok(v.L > -0.06 && v.L < 0, 'and its slope stops short of e in the middle (' + v.L.toFixed(4) + ')');
  const s2 = AL.buildAlignment({ pis: [{ x: 0, y: 0 }, { x: 1000, y: 0, r: 1000 }, { x: 1400, y: -100, r: 1000 }, { x: 2400, y: -100 }] });   // 166 ft of tangent; 144 + 144 ft of transitions
  ok(SE.superPlan(s2, { super: sp, nc: 0.02, lane: 12 }).problems.some((m) => /overlap/.test(m)), 'two curves too close: their transitions overlap, said');
}

section('the corridor at full superelevation');
{
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let x = -200; x <= 2000; x += 40) for (let y = -900; y <= 200; y += 40) pts.push({ n: String(n++), x, y, z: 100, d: 'G' });
  p.setPoints(pts, 'flat');
  p.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Curve', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 2000 }, { x: 1700, y: -700, r: 0 }], pvis: [{ sta: 0, z: 103, L: 0 }, { sta: right.end, z: 103, L: 0 }],
    corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10, super: sp }, sampling: null }));
  const g = p.graded(), it = g.items[0];
  ok(it && !it.problems.length && it.super?.curves.length === 1, 'the corridor carries its superelevation plan');
  const mid = (c.pc + c.pt) / 2;
  const sec = it.sections.reduce((a, b) => (Math.abs(b.sta - mid) < Math.abs(a.sta - mid) ? b : a));
  ok(Math.abs(sec.sta - mid) < 10 && sec.slopes, 'a corridor section near mid curve (' + sec.sta.toFixed(1) + ')');
  near(sec.L[1].z, 103 + 12 * 0.04, 1e-9, 'outside (left) edge of pavement 0.48 ft up'); near(sec.R[1].z, 103 - 12 * 0.04, 1e-9, 'inside (right) edge 0.48 ft down');
  near(sec.R[2].z, sec.R[1].z - 4 * 0.04, 1e-9, 'inside shoulder at 4 % (the lane is 4 %: no flatter)'); near(sec.L[2].z, sec.L[1].z - 4 * 0.04, 1e-9, 'outside shoulder rolls over at 4 %');
  ok(it.sections.some((x) => Math.abs(x.sta - c.stations.lc0) < 1e-6) && it.sections.some((x) => Math.abs(x.sta - c.stations.fs0) < 1e-6), 'the transition stations are sections');
  // a sample line at mid curve sees the tilted section
  p.change('Sample', (s) => { s.alignments[0].sampling = SEC.cleanSampling({ step: 10000, left: 60, right: 60, extra: [mid] }); });
  const xs = p.sections(p.state.alignments[0]).sections.find((x) => Math.abs(x.sta - mid) < 1e-6);
  const m = Object.fromEntries(xs.marks.map((q) => [q.code, q]));
  ok(m.EOP_L && m.EOP_R && m.EOP_L.z > m.CL.z && m.EOP_R.z < m.CL.z, 'the cross section at mid curve tilts toward the inside');
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(back.state.alignments[0].corridor.super) === JSON.stringify(sp), 'the project file keeps the superelevation settings');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
