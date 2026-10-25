#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-assembly.mjs — CivilCraft 0.7 D7.35: the corridor assembly editor (corridor.js parts: lane, shoulder, gutter,
 * curb, strip, walk, daylight; different left and right), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-assembly.mjs [--build dev|x.y] [--verbose]
 *
 * By hand, on flat ground at 100 ft with the road 3 ft above it (ft): two 12 ft lanes at 2 % (EOP at 24, z 102.52), a 2 ft gutter at
 * 8 % (flowline at 26, 102.36), a curb 0.5 ft high and 0.5 ft wide (a 0.01 ft face: top of curb 102.86 at 26.01, back 102.86 at
 * 26.51), a 5 ft strip and a 5 ft walk that rise 2 % away from the road (102.96 at 31.51, 103.06 at 36.51), then a 3:1 fill slope to the
 * ground: 3 × 3.06 = 9.18 ft out (45.69). The right side is a plain lane and shoulder. Also: the same corridor as parts equals the
 * simple one, width and elevation targets, superelevation rolling both lanes, untrusted parts, the project file, the cross section marks.
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
const CO = await mod('corridor.js');
const SE = await mod('superelev.js');
const PJ = await mod('project.js');
const SEC = await mod('sections.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);

const flat = (z = 100) => { const p = new PJ.Project(), pts = []; let n = 1; for (let x = -100; x <= 1300; x += 25) for (let y = -300; y <= 300; y += 25) pts.push({ n: String(n++), x, y, z, d: 'G' }); p.setPoints(pts, 'flat'); return p; };
const road = (p, corridor, pis = [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }]) => p.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis, pvis: [{ sta: 0, z: 103, L: 0 }, { sta: 1000, z: 103, L: 0 }], corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50, ...corridor }, sampling: null }));
const mid = (it) => it.sections.reduce((a, b) => (Math.abs(b.sta - 500) < Math.abs(a.sta - 500) ? b : a));

section('presets and the file format');
{
  const u = CO.presetParts('urban', 'ft'), r = CO.presetParts('rural', 'm');
  ok(u.map((q) => q.type).join() === 'lane,lane,gutter,curb,strip,walk,daylight', 'urban: lane, lane, gutter, curb, strip, walk, daylight');
  ok(r.map((q) => q.type).join() === 'lane,shoulder,daylight' && r[0].w === 3.6 && r[1].w === 1.2, 'rural in metres: 3.6 m lane, 1.2 m shoulder');
  const c = CO.cleanParts([{ type: 'walk', w: 'x', slope: 9 }, { type: 'bogus' }, { type: 'daylight', cut: 2, fill: 3 }, { type: 'lane', w: -4, slope: 0.02 }, { type: 'curb', h: 99, w: 0.5 }, null, { type: 'daylight', cut: 5, fill: 5 }, { type: 'lane', w: 12, slope: 0.02 }], 'ft');
  ok(c.length === 5 && c[c.length - 1].type === 'daylight' && c.filter((q) => q.type === 'daylight').length === 1, 'untrusted: unknown types and a second daylight dropped, the daylight moved last');
  ok(c[0].w === 5 && c[0].slope === -0.02, 'bad numbers fall back to the type\'s defaults'); ok(c[1].w === 12 && c[2].h === 0.5, 'out-of-range widths and heights too');
  ok(CO.cleanParts('x') === null && CO.cleanSides({ L: [], R: [] }) === null && CO.cleanSides({ L: [{ type: 'lane' }] }).R.length === 0, 'not a list → null; neither side filled → null; one side is enough');
  ok(CO.cleanParts(Array.from({ length: 80 }, () => ({ type: 'lane', w: 1, slope: 0.02 }))).length === CO.MAX_PARTS, 'at most ' + CO.MAX_PARTS + ' parts');
}

section('an urban left side and a rural right side, by hand');
{
  const p = flat(), parts = { L: CO.presetParts('urban', 'ft'), R: CO.presetParts('rural', 'ft') };
  road(p, { parts });
  const it = p.graded().items[0];
  ok(it && !it.problems.length, 'the corridor builds: ' + (it?.problems || []).join(' | '));
  const s = mid(it), det = s.det.L, by = Object.fromEntries(det.map((q) => [q.code, q]));
  const off = (q) => Math.hypot(q.x - s.L[0].x, q.y - s.L[0].y);
  ok(det.map((q) => q.code).join() === 'CL,LANE,EOP,FL,TOC,BOC,STRIP,WALK,DL', 'left codes: ' + det.map((q) => q.code).join());
  near(off(by.LANE), 12, 1e-9, 'first lane out to 12'); near(by.LANE.z, 102.76, 1e-9, 'at 2 %: 102.76');
  near(off(by.EOP), 24, 1e-9, 'edge of pavement 24 ft out'); near(by.EOP.z, 102.52, 1e-9, '102.52');
  near(off(by.FL), 26, 1e-9, 'gutter flowline at 26'); near(by.FL.z, 102.36, 1e-9, 'the pan falls 8 %: 102.36');
  near(off(by.TOC), 26.01, 1e-9, 'top of curb a hair out of plumb'); near(by.TOC.z, 102.86, 1e-9, '0.5 ft above the flowline'); near(off(by.BOC), 26.51, 1e-9, 'back of curb 0.5 ft on'); near(by.BOC.z, 102.86, 1e-9, 'level');
  near(off(by.STRIP), 31.51, 1e-9, 'the strip 5 ft'); near(by.STRIP.z, 102.96, 1e-9, 'rising 2 % away from the road'); near(off(by.WALK), 36.51, 1e-9, 'the walk 5 ft more'); near(by.WALK.z, 103.06, 1e-9, '103.06');
  near(off(by.DL), 36.51 + 3 * 3.06, 1e-6, 'the 3:1 fill slope daylights 9.18 ft out'); near(by.DL.z, 100, 1e-6, 'on the ground');
  ok(s.L.length === 4 && s.L[1] === by.EOP && s.L[2] === by.WALK && s.L[3] === by.DL, 'the four-point view stays: CL, EOP, SH (= the last part), DL');
  const r = Object.fromEntries(s.det.R.map((q) => [q.code, q]));
  near(Math.hypot(r.EOP.x - s.R[0].x, r.EOP.y - s.R[0].y), 12, 1e-9, 'right: one 12 ft lane'); near(r.EOP.z, 102.76, 1e-9, 'its edge 102.76'); near(r.SH.z, 102.76 - 4 * 0.04, 1e-9, 'a 4 ft shoulder at 4 %');
  near(Math.hypot(r.DL.x - r.SH.x, r.DL.y - r.SH.y), 3 * (r.SH.z - 100), 1e-6, 'right daylight at 3:1');
  const lines = it.info?.lines || null;
  void lines;
}

section('the same corridor as parts equals the simple one');
{
  const a = flat(), b = flat();
  road(a, {});
  road(b, { parts: { L: [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'shoulder', w: 4, slope: 0.04 }], R: [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'shoulder', w: 4, slope: 0.04 }] } });
  const A = a.graded().items[0], B = b.graded().items[0];
  ok(A.sections.length === B.sections.length && A.sections.every((s, i) => ['L', 'R'].every((k) => s[k].every((q, j) => Math.abs(q.x - B.sections[i][k][j].x) + Math.abs(q.y - B.sections[i][k][j].y) + Math.abs(q.z - B.sections[i][k][j].z) < 1e-9))), 'every section point equal, both sides (' + A.sections.length + ' sections)');
  const ca = a.state.alignments[0], vol = (p) => p.volumes()?.items?.[0];
  near(vol(a)?.fill, vol(b)?.fill, 1e-6, 'and the same fill volume');
  void ca;
}

section('different cut and fill on each side, daylight parts');
{
  // ground at 100, road at 97 → a cut; left 1:1, right 4:1
  const p = flat(), pis = [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }];
  p.change('x', () => {});
  p.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Road', start: 0, pis, pvis: [{ sta: 0, z: 97, L: 0 }, { sta: 1000, z: 97, L: 0 }], corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 50, parts: { L: [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'daylight', cut: 1, fill: 1 }], R: [{ type: 'lane', w: 12, slope: 0.02 }, { type: 'daylight', cut: 4, fill: 4 }] } }, sampling: null }));
  const it = p.graded().items[0], s = mid(it);
  const dl = (k) => { const q = s.det[k]; return Math.hypot(q[q.length - 1].x - q[q.length - 2].x, q[q.length - 1].y - q[q.length - 2].y); };
  const h = (k) => 100 - s.det[k][s.det[k].length - 2].z;
  near(dl('L'), 1 * h('L'), 1e-4, 'left cut slope 1:1'); near(dl('R'), 4 * h('R'), 1e-4, 'right cut slope 4:1');
  ok(dl('R') > 3 * dl('L'), 'the right side reaches much further out');
}

section('targets move the end of the lanes and the last part');
{
  const p = flat();
  // a ditch line 20 ft left of the centre, 21 ft right: width targets on 'eop' and 'sh'
  road(p, { parts: { L: CO.presetParts('urban', 'ft'), R: CO.presetParts('urban', 'ft') } });
  const el = CO.corridorPatch(p.eg().surface, p.alignment(p.state.alignments[0]), p.designProfile(p.state.alignments[0]), { ...p.state.alignments[0].corridor }, {
    targets: [{ side: 'L', what: 'width', part: 'eop', line: [{ x: -50, y: 20, z: 100 }, { x: 1100, y: 20, z: 100 }] }, { side: 'R', what: 'width', part: 'sh', line: [{ x: -50, y: -40, z: 100 }, { x: 1100, y: -40, z: 100 }] }] });
  const s = el.info.sections[Math.floor(el.info.sections.length / 2)];
  const off = (q) => Math.hypot(q.x - s.L[0].x, q.y - s.L[0].y);
  near(off(s.L[1]), 20, 1e-9, 'left width target: the edge of pavement (end of the two lanes) at 20 ft'); near(off(s.det.L.find((q) => q.code === 'LANE')), 12, 1e-9, 'the first lane keeps its 12');
  near(off(s.det.R[s.det.R.length - 2]), 40, 1e-9, 'right width target: the walk (last part) ends at 40 ft');
  ok(el.info.targets.every((g) => g.found === g.of && g.of > 0), 'every section found both lines');
  const el2 = CO.corridorPatch(p.eg().surface, p.alignment(p.state.alignments[0]), p.designProfile(p.state.alignments[0]), { ...p.state.alignments[0].corridor }, {
    targets: [{ side: 'L', what: 'elev', part: 'eop', line: [{ x: -50, y: 24, z: 102 }, { x: 1100, y: 24, z: 102 }] }] });
  const s2 = el2.info.sections[3];
  near(s2.L[1].z, 102, 1e-9, 'an elevation target puts the edge of pavement at 102');
  near(s2.det.L.find((q) => q.code === 'LANE').z, 103 - 12 * (1 / 24), 1e-9, 'the first lane falls at the same 1/24 slope');
  near(s2.R[1].z, 102.52, 1e-9, 'the other side is untouched');
}

section('superelevation rolls every lane');
{
  const p = flat(), pis = [{ x: 0, y: 0, r: 0 }, { x: 500, y: 0, r: 800, ls: 120 }, { x: 1000, y: -400, r: 0 }];
  const sp = { on: true, delta: 0.005, rate: [[0, 0.06]] };
  road(p, { super: sp, parts: { L: CO.presetParts('urban', 'ft'), R: CO.presetParts('urban', 'ft') } }, pis);
  const al = p.alignment(p.state.alignments[0]);
  const it = p.graded().items[0];
  ok(al.ok && it?.super?.curves.length === 1, 'a spiral curve with an urban assembly: the plan is made (' + (al.errors[0] || it?.problems?.join(' ') || '') + ')');
  const c = al.curves[0], sec = it.sections.reduce((a, b) => (Math.abs(b.sta - (c.sc + c.cs) / 2) < Math.abs(a.sta - (c.sc + c.cs) / 2) ? b : a));
  const lane = (k) => { const d = sec.det[k]; const q = d.find((x) => x.code === 'LANE'), e = d.find((x) => x.code === 'EOP'); return { q, e }; };
  // turning right: the left is the outside, rising away at −6 %; the right lane falls at +6 %
  const L = lane('L'), R = lane('R');
  near(L.e.z, 103 + 24 * 0.06, 1e-6, 'outside (left) edge of the two lanes up 24 × 6 %'); near(R.e.z, 103 - 24 * 0.06, 1e-6, 'inside edge down');
  near(L.q.z, 103 + 12 * 0.06, 1e-6, 'and the first lane at the same slope (both lanes rotate)');
  const at = (k, cd) => sec.det[k].find((q) => q.code === cd);
  near(at('R', 'FL').z, R.e.z - 2 * 0.08, 1e-6, 'the gutter hangs from the lane edge at its own 8 %');
  ok(SE.keyStations(it.super).some((v) => Math.abs(v - c.sc) < 1e-6), 'the SC is a section');
  ok(it.sections.some((x) => Math.abs(x.sta - c.ts) < 1e-6) && it.sections.some((x) => Math.abs(x.sta - c.sc) < 1e-6), 'and so is the TS');
}

section('the surface, the sections and the file');
{
  const p = flat();
  road(p, { parts: { L: CO.presetParts('urban', 'ft'), R: CO.presetParts('rural', 'ft') } });
  const g = p.graded(), it = g.items[0];
  const names = new Set((it.breaklines || []).map((b) => b.name));
  ok(!it.problems.length, 'no problems'); const tin = g.surface?.toFaces?.(); ok(tin && tin.faces.length > 0, 'the graded surface exists');
  // the TIN has the curb: a vertex at the top of the left curb
  const mids = mid(it), toc = mids.det.L.find((q) => q.code === 'TOC');
  const hit = tin.pts.some((q) => Math.abs(q.x - toc.x) < 1e-6 && Math.abs(q.y - toc.y) < 1e-6 && Math.abs(q.z - toc.z) < 1e-6);
  ok(hit, 'the graded surface has a vertex on the top of the curb');
  ok(g.surface.elevationAt(toc.x, toc.y, 1e-6) !== null && Math.abs(g.surface.elevationAt(toc.x, toc.y, 1e-6) - toc.z) < 1e-6, 'and reads the curb height there');
  p.change('Sample', (s) => { s.alignments[0].sampling = SEC.cleanSampling({ step: 10000, left: 60, right: 60, extra: [500] }); });
  const xs = p.sections(p.state.alignments[0]).sections.find((x) => Math.abs(x.sta - 500) < 1e-6);
  const m = Object.fromEntries(xs.marks.map((q) => [q.code, q]));
  ok(m.FL_L && m.TOC_L && m.BOC_L && m.WALK_L && m.EOP_R && m.SH_R, 'the cross section marks the gutter flowline, curb, walk and the right side: ' + Object.keys(m).join(' '));
  near(m.TOC_L.z - m.FL_L.z, 0.5, 1e-6, 'the curb is 0.5 ft above the flowline in the section');
  ok(m.WALK_L.o < m.TOC_L.o && m.TOC_L.o < m.FL_L.o && m.FL_L.o < m.CL.o, 'out to the left of the centreline: flowline, curb, walk');
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project, c = back.state.alignments[0].corridor;
  ok(JSON.stringify(c.parts) === JSON.stringify(p.state.alignments[0].corridor.parts) && c.parts.L.length === 7 && c.parts.R.length === 3, 'the project file keeps both sides\' parts');
  const bad = PJ.Project.fromJSON({ ...JSON.parse(JSON.stringify(p.toJSON())), alignments: [{ ...p.state.alignments[0], corridor: { on: true, parts: { L: 'x', R: [{ type: 'lane', w: 1e9 }, { type: 'hack' }] } } }] }).project;
  ok(bad.state.alignments[0].corridor.parts.L.length === 0 && bad.state.alignments[0].corridor.parts.R.length === 1, 'untrusted parts in the file are cleaned');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
