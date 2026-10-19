#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-targets.mjs — CivilCraft 0.6 WL.25: corridor targets (corridor.js targets, project.js corridorOrder /
 * gradeItems), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-targets.mjs [--build dev|x.y] [--verbose]
 *
 * Worked by hand on flat ground (z 100) and a straight road east along y = 0 at z 100 (lane 12 at 2 %, shoulder 4 at 4 %):
 * a feature line at y = −20 from x 100 to 300 as the right lane's width target → the right edge of pavement at y = −20 there
 * and at −12 elsewhere, the left side untouched (the wish: a target belongs to its own side); an elevation target at y = −30,
 * z 101 → the right edge at z 101, lane width kept, left untouched; shoulder width and elevation targets; a second road at
 * y = −60 whose left edge of pavement is the first road's right shoulder-width target, followed when the second road's
 * lane changes (dynamic, in grading order whatever the alignments' order); a loop refused on one side without breaking
 * either road; a deleted line = the assembly's values with a note; untrusted targets; the project file; one undo step.
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
const PJ = await mod('project.js');
const TU = await mod('targets-ui.js');

let pass = 0, fail = 0;
const ok = (cond, msg, extra) => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + msg); } else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra) : '')); } };
const near = (a, b, tol, msg) => ok(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol, msg, { got: a, want: b });
const head = (s) => console.log('== ' + s);

/** Flat ground at 100 from (−100, −150) to (500, 150), a road east along y = 0 (and optionally a second along y = −60). */
function site({ second = false } = {}) {
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let x = -100; x <= 500; x += 50) for (let y = -150; y <= 150; y += 50) pts.push({ n: String(n++), x, y, z: 100, d: 'GND' });
  p.setPoints(pts, 'flat');
  const asm = { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 25 };
  p.change('roads', (s) => {
    s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 400, y: 0, r: 0 }], pvis: [{ sta: 0, z: 100, L: 0 }, { sta: 400, z: 100, L: 0 }], corridor: { ...asm } });
    if (second) s.alignments.push({ id: 'a2', name: 'Side', start: 0, pis: [{ x: 0, y: -60, r: 0 }, { x: 400, y: -60, r: 0 }], pvis: [{ sta: 0, z: 100, L: 0 }, { sta: 400, z: 100, L: 0 }], corridor: { ...asm } });
    s.features = [];
  });
  return p;
}
const item = (p, id = 'a1') => p.graded().items.find((x) => x.kind === 'corridor' && x.id === id);
const setTargets = (p, id, targets) => p.change('targets', (s) => { s.alignments.find((a) => a.id === id).corridor.targets = CO.cleanTargets(targets); });
const addFeature = (p, f) => p.change('fl', (s) => { s.features.push(f); });

head('sectionHit');
{
  const h = CO.sectionHit({ x: 0, y: 0 }, 0, -1, [{ x: -10, y: -20, z: 99 }, { x: 10, y: -20, z: 101 }]);
  near(h.t, 20, 1e-12, 'distance out to the line'); near(h.z, 100, 1e-12, 'its elevation there (halfway)');
  ok(CO.sectionHit({ x: 0, y: 0 }, 0, 1, [{ x: -10, y: -20, z: 99 }, { x: 10, y: -20, z: 101 }]) === null, 'a line behind (the other side) is not reached');
}

head('the road without targets');
{
  const p = site(), it = item(p);
  ok(it && !it.problems.length && it.sections.length === 17, 'builds: 17 sections every 25 ft', it?.problems);
  const s = it.sections[4];
  near(s.R[1].y, -12, 1e-9, 'right edge of pavement at y = −12'); near(s.R[1].z, 100 - 0.24, 1e-9, 'at 2 % down');
  near(s.L[1].y, 12, 1e-9, 'left edge at +12');
}

head('a width target on the right lane');
{
  const p = site();
  addFeature(p, { id: 'f1', name: 'Widening', pts: [{ x: 100, y: -20, z: 99 }, { x: 300, y: -20, z: 99 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
  setTargets(p, 'a1', [{ side: 'R', what: 'width', part: 'eop', from: { kind: 'feature', id: 'f1' } }]);
  const it = item(p);
  const inside = it.sections.filter((s) => s.sta >= 100 && s.sta <= 300), out = it.sections.filter((s) => s.sta < 100 || s.sta > 300);
  ok(inside.length === 9 && inside.every((s) => Math.abs(s.R[1].y + 20) < 1e-9), 'from station 100 to 300 the right edge of pavement is on the line (y = −20)', inside.map((s) => s.R[1].y));
  ok(inside.every((s) => Math.abs(s.R[1].z - (100 - 20 * 0.02)) < 1e-9), 'the lane keeps its 2 % over the wider lane (z = 99.60)');
  ok(out.every((s) => Math.abs(s.R[1].y + 12) < 1e-9), 'elsewhere it stays at −12');
  ok(it.sections.every((s) => Math.abs(s.L[1].y - 12) < 1e-9 && Math.abs(s.L[1].z - 99.76) < 1e-9), 'the left side never moves (a target belongs to its own side)');
  ok(it.targets.length === 1 && it.targets[0].found === 9 && it.targets[0].of === 17, 'reached at 9 of 17 sections', it.targets);
  near(it.sections[8].R[2].y, -24, 1e-9, 'the shoulder follows outside it (y = −24)');
  ok(!it.problems.length && p.graded().surface, 'the corridor still grades');
}

head('an elevation target on the right lane only');
{
  const p = site();
  addFeature(p, { id: 'f1', name: 'Gutter grade', pts: [{ x: -10, y: -30, z: 101 }, { x: 410, y: -30, z: 101 }], closed: false, use: 'eg', daylight: false, cut: 2, fill: 3 });
  setTargets(p, 'a1', [{ side: 'R', what: 'elev', part: 'eop', from: { kind: 'feature', id: 'f1' } }]);
  const it = item(p);
  ok(it.sections.every((s) => Math.abs(s.R[1].z - 101) < 1e-9 && Math.abs(s.R[1].y + 12) < 1e-9), 'the right edge of pavement takes the line\'s 101 at its own offset (12)');
  ok(it.sections.every((s) => Math.abs(s.L[1].z - 99.76) < 1e-9), 'the left edge keeps its own 2 % (99.76)');
  // the low-side rule: the right lane now rises at 1/12; the shoulder keeps its own 4 % down from the new edge
  near(it.sections[3].R[2].z, 101 - 4 * 0.04, 1e-9, 'the right shoulder runs on from the new edge');
}

head('shoulder targets');
{
  const p = site();
  addFeature(p, { id: 'f1', name: 'Back of shoulder', pts: [{ x: -10, y: 22, z: 98 }, { x: 410, y: 22, z: 98 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
  setTargets(p, 'a1', [{ side: 'L', what: 'width', part: 'sh', from: { kind: 'feature', id: 'f1' } }, { side: 'L', what: 'elev', part: 'sh', from: { kind: 'feature', id: 'f1' } }]);
  const it = item(p), s = it.sections[5];
  near(s.L[2].y, 22, 1e-9, 'left shoulder edge on the line (shoulder 10 wide)'); near(s.L[2].z, 98, 1e-9, 'at its elevation');
  near(s.R[2].y, -16, 1e-9, 'the right shoulder untouched');
  ok(it.targets.every((g) => g.found === g.of && g.of === 17), 'both reached everywhere');
}

head('another corridor\'s edge, followed as it changes');
{
  const p = site({ second: true });
  // Main's right shoulder runs out to Side's left edge of pavement (Side is listed after Main: graded first anyway)
  setTargets(p, 'a1', [{ side: 'R', what: 'width', part: 'sh', from: { kind: 'corridor', id: 'a2', line: 'EOP_L' } }, { side: 'R', what: 'elev', part: 'sh', from: { kind: 'corridor', id: 'a2', line: 'EOP_L' } }]);
  ok(p.corridorOrder().order.map((a) => a.id).join() === 'a2,a1', 'grading order: the target first');
  let it = item(p);
  ok(it.sections.every((s) => Math.abs(s.R[2].y + 48) < 1e-9 && Math.abs(s.R[2].z - 99.76) < 1e-9), 'Main\'s right shoulder edge = Side\'s left edge of pavement (y −48, z 99.76)', it.sections.slice(0, 2).map((s) => s.R[2]));
  p.change('wider', (s) => { s.alignments.find((a) => a.id === 'a2').corridor.lane = 14; });
  it = item(p);
  ok(it.sections.every((s) => Math.abs(s.R[2].y + 46) < 1e-9 && Math.abs(s.R[2].z - (100 - 14 * 0.02)) < 1e-9), 'Side\'s lane 12 → 14: Main follows at once (y −46, z 99.72)');
  p.undo();
  ok(item(p).sections.every((s) => Math.abs(s.R[2].y + 48) < 1e-9), 'undo: back to −48');
  // a loop: Side's left lane width to Main's right shoulder edge
  setTargets(p, 'a2', [{ side: 'L', what: 'width', part: 'eop', from: { kind: 'corridor', id: 'a1', line: 'SH_R' } }]);
  const o = p.corridorOrder();
  const loopy = [...o.loops.entries()];
  ok(loopy.length === 1, 'a loop between the two is found once', loopy.map(([k, v]) => [k, [...v]]));
  const g1 = item(p, 'a1'), g2 = item(p, 'a2');
  ok(g1 && g2 && !g1.problems.length && !g2.problems.length, 'both roads still build');
  ok([...g1.targets, ...g2.targets].filter((g) => g.loop).length === 1, 'one target is marked as the loop; the other works');
  // the target UI lists the other road's lines and the feature lines, not its own
  const src = TU.targetSources(p, p.state.alignments[0]);
  ok(src.length === 7 && src.every((s) => s.from.id === 'a2'), 'targetSources: the other corridor\'s seven lines', src.map((s) => s.value));
}

head('a line that goes away');
{
  const p = site();
  addFeature(p, { id: 'f1', name: 'Gone soon', pts: [{ x: 0, y: -20, z: 99 }, { x: 400, y: -20, z: 99 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
  setTargets(p, 'a1', [{ side: 'R', what: 'width', part: 'eop', from: { kind: 'feature', id: 'f1' } }]);
  p.change('delete', (s) => { s.features = []; });
  const it = item(p);
  ok(it && !it.problems.length && it.targets[0].missing && it.sections.every((s) => Math.abs(s.R[1].y + 12) < 1e-9), 'the corridor builds with the assembly\'s width and says the line is gone');
}

head('untrusted targets and the project file');
{
  const c = CO.cleanTargets([
    { side: 'X', what: 'width', part: 'eop', from: { kind: 'feature', id: 'f1' } },
    { side: 'L', what: 'width', part: 'eop', from: { kind: 'feature', id: 'f1"><' } },
    { side: 'L', what: 'width', part: 'eop', from: { kind: 'corridor', id: 'a2', line: 'NOPE' } },
    { side: 'L', what: 'width', part: 'eop', from: { kind: 'feature', id: 'f7' } },
    { side: 'L', what: 'width', part: 'eop', from: { kind: 'feature', id: 'f8' } },
    { side: 'R', what: 'elev', part: 'sh', from: { kind: 'corridor', id: 'a3', line: 'DL_R' }, extra: 1 },
    'junk', null,
  ]);
  ok(c.length === 2 && c[0].from.id === 'f7' && c[1].from.line === 'DL_R' && !('extra' in c[1]), 'bad sides, ids, lines and a second target for the same point dropped', c);
  const p = site({ second: true });
  setTargets(p, 'a1', [{ side: 'R', what: 'width', part: 'sh', from: { kind: 'corridor', id: 'a2', line: 'EOP_L' } }]);
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(JSON.stringify(back.state.alignments[0].corridor.targets) === JSON.stringify(p.state.alignments[0].corridor.targets), 'the project file keeps the targets');
  const n = p.undoStack.length;
  setTargets(p, 'a1', []);
  ok(p.undoStack.length === n + 1, 'a change of targets is one undo step');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
