/* SPDX-License-Identifier: Apache-2.0 */
// The checks, in the shared Problems shape (docs/0.8-PROBLEMS-SPEC.md § 1).
const { ok, section, mine } = globalThis.__ccTest;
const P = await mine('lib/project.js');
const A = await mine('lib/analyze.js');
const CH = await mine('lib/checks.js');
const E = await mine('lib/edit.js');

const run = (base, upper = [], over = {}) => P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, ...over, runs: [{ id: 'A', wall: 'S', base, upper }] });
const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w, ...extra });
const codes = (p, opts = {}) => A.analyze(p, opts).problems.map((x) => x.code);
const tt = (k, v) => k + JSON.stringify(v || {});

section('Problems');
{
  const clean = A.analyze(run([cab('base-door', 600)])).problems;
  ok(clean.every((x) => x.severity === 'note') && clean.map((x) => x.code).sort().join() === 'est.placeholder,run.gap', 'a clean job has only notes: the placeholder rates and the empty wall');
  const over = run([cab('base-pair', 1200), cab('base-pair', 1200), cab('base-pair', 1200), cab('base-door', 600)]);
  const pr = A.analyze(over, { t: tt }).problems.find((x) => x.code === 'run.over');
  ok(pr && pr.severity === 'error' && pr.req.value === 3600 && pr.found.value === 4200 && pr.about[0].kind === 'run', 'a run 600 too long: an error with the span required and the length found', JSON.stringify(pr));
  const gap = A.analyze(run([cab('base-door', 600)]), { t: tt }).problems.find((x) => x.code === 'run.gap');
  ok(gap && gap.severity === 'note' && !codes(run([cab('base-pair', 1200), cab('base-pair', 1200), cab('base-pair', 1150), { kind: 'filler', w: 50 }])).includes('run.gap'), 'an empty stretch of wall is only a note, and a full wall has none');
  const narrow = run([cab('base-door', 30)]);
  ok(codes(narrow).includes('cab.too-narrow'), 'a 30 mm cabinet is too narrow for its sides (the model says so)');
  const nodrawer = run([cab('base-drawers3', 600, { d: 200 })]);
  ok(codes(nodrawer).includes('cab.no-slide') || codes(nodrawer).includes('cab.too-shallow'), 'a drawer base 200 deep has no slide that fits');
  const tall = run([cab('tall-pantry', 600, { h: 2600 })]);
  const tp = A.analyze(tall, { t: tt }).problems.find((x) => x.code === 'cab.too-tall');
  ok(tp && tp.severity === 'error' && tp.found.value === 2600 && tp.req.value === 2400, 'a 2600 tall cabinet in a 2400 room: an error');
  ok(codes(run([cab('base-door', 600)], [cab('wall-door', 600, { elev: 900 })])).includes('cab.wall-clearance'), 'wall cabinets hung 30 mm above the counter leave no room to work');
  ok(!codes(run([cab('base-door', 600)], [cab('wall-door', 600)])).includes('cab.wall-clearance'), 'at the default 1400 they are fine');
  ok(codes(run([cab('tall-pantry', 600)], [cab('wall-door', 600)])).includes('cab.overlap'), 'a wall cabinet in front of a tall one: a collision');
  ok(!codes(run([cab('tall-pantry', 600)], [{ kind: 'gap', w: 600 }, cab('wall-door', 600)])).includes('cab.overlap'), 'beside it is fine');
  ok(codes(run([cab('base-blind', 1050)])).includes('cab.door-wide'), 'a 747 mm blind-corner door is wider than the usual 600');
  ok(codes(run([cab('base-door', 600), cab('base-pair', 900), cab('base-drawers3', 600), cab('base-door', 600), cab('base-pair', 885)])).includes('filler.thin') === true, 'a 15 mm filler is too thin');
  ok(codes(run([cab('base-pair', 1200), cab('base-pair', 1200), cab('base-pair', 1200)], [], { runs: undefined })).includes('counter.long'), 'a countertop over 3 m needs a joint');
  const ff = run([cab('base-door', 150)], [], { construction: 'faceframe' });
  ok(codes(ff).includes('ff.opening') || codes(ff).includes('cab.too-narrow'), 'a face-frame cabinet 150 wide has no real opening');
  // a nest with a part too big
  const bigp = run([cab('tall-pantry', 600, { h: 2300 })], [], { sheet: { w: 2000, h: 1000, margin: 10, spacing: 8 } });
  const a = A.analyze(bigp);
  const nest = A.runNest(a.build, { tries: 1, timeLimit: 1000 });
  const up = A.analyze(bigp, { nest, t: tt }).problems.filter((x) => x.code === 'nest.unplaced');
  ok(nest.unplaced.length === up.length, 'every unplaced part is a problem: ' + up.length);
  // the shape every source must give: id, code, severity, text
  const all = A.analyze(over, { t: tt }).problems;
  ok(all.every((x) => x.id.startsWith('cabinetcraft:') && x.code && ['error', 'warning', 'note'].includes(x.severity) && x.text && Array.isArray(x.about)), 'each problem has id, code, severity, text and about');
  ok(new Set(all.map((x) => x.id)).size === all.length, 'ids are unique and do not depend on the words');
  const again = A.analyze(over, { t: (k, v) => 'xx ' + k }).problems.map((x) => x.id).join();
  ok(again === all.map((x) => x.id).join(), 'ids do not change with the language');
  ok(CH.checkJob(A.analyze(over).build, {}).length > 0, 'checkJob alone works with the default words');
  // fixing the run clears the error
  const fixed = E.removeItem(over, 'A', 'base', 3);
  ok(!codes(fixed).includes('run.over'), 'taking a cabinet out clears the run.over error');
}
