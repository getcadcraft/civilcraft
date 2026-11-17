// SPDX-License-Identifier: Apache-2.0
// lib/fence tests: numbers worked by hand. node lib/fence/test/fence.test.mjs
import * as F from '../index.js';
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('FAIL ' + m, x !== '' ? JSON.stringify(x).slice(0, 300) : ''); } };
const near = (a, b, t, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= t, `${m} (${a} vs ${b})`);
const rec = (o) => ({ id: 'fc1', pts: [{ x: 0, y: 0 }, { x: 24, y: 0 }], ...o });

// 24 m straight, spacing 2.4: 10 bays, 11 posts, 2 end, 9 line
let L = F.build(rec({ postSpacing: 2.4 }), { units: 'm' });
ok(L.posts.length === 11 && L.panels.length === 10, 'ten bays, eleven posts', [L.posts.length, L.panels.length]);
ok(L.posts.filter((p) => p.kind === 'end').length === 2 && L.posts.filter((p) => p.kind === 'line').length === 9, 'two end posts, nine line posts');
near(L.stats.length, 24, 1e-9, 'length'); near(L.panels[0].plan, 2.4, 1e-9, 'bay 2.4');
// 25 m: ceil(25/2.4)=11 bays of 2.2727
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 25, y: 0 }], postSpacing: 2.4 }), { units: 'm' });
ok(L.panels.length === 11, 'eleven bays for 25 m'); near(L.panels[0].plan, 25 / 11, 1e-9, 'equal bays'); ok(L.panels.every((p) => p.plan <= 2.4 + 1e-9), 'none over the spacing');
// corner
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 4.8, y: 0 }, { x: 4.8, y: 4.8 }], postSpacing: 2.4 }), { units: 'm' });
ok(L.posts.filter((p) => p.kind === 'corner').length === 1 && L.posts.length === 5, 'one corner post, five posts', L.posts.map((p) => p.kind));
// slight bend is a line post
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 4.8, y: 0 }, { x: 9.6, y: 0.5 }], postSpacing: 2.4 }), { units: 'm' });
ok(L.posts.filter((p) => p.kind === 'corner').length === 0, 'a 6 degree bend is not a corner');
// closed square 4x4, spacing 2: 8 posts, 4 corners, no end
L = F.build({ id: 'fc2', closed: true, pts: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 4 }, { x: 0, y: 4 }], postSpacing: 2 }, { units: 'm' });
ok(L.posts.length === 8 && L.panels.length === 8 && L.posts.filter((p) => p.kind === 'corner').length === 4 && !L.posts.some((p) => p.kind === 'end'), 'closed square: 8 posts, 4 corners', [L.posts.length, L.panels.length]);
near(L.stats.length, 16, 1e-9, 'closed length');
// gate 1 m at s=10 on 24 m: posts at 10 and 11 gate; spans 0-10 (5 bays of 2), 11-24 (13 / 2.4 -> 6 bays)
L = F.build(rec({ postSpacing: 2.4, gates: [{ s: 10, width: 1 }] }), { units: 'm' });
ok(L.gates.length === 1 && L.gates[0].leaves === 1, 'one single gate');
ok(L.posts.filter((p) => p.kind === 'gate').length === 2, 'two gate posts');
ok(L.panels.length === 5 + 6 && L.posts.length === 5 + 1 + 6 + 1, 'panels and posts around the gate', [L.panels.length, L.posts.length]);
L = F.build(rec({ gates: [{ s: 10, width: 3 }] }), { units: 'm' }); ok(L.gates[0].leaves === 2, 'a 3 m gate has two leaves');
// gate across a corner is refused
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }], gates: [{ s: 4.5, width: 1 }] }), { units: 'm' }); ok(L.gates.length === 0 && L.problems.some((p) => p.code === 'gate.span'), 'gate over a vertex refused');
// raked on a 10 percent slope: ground z = 0.1 x. panel bottom parallel, gap 0.05
const slope = (x) => 0.1 * x;
L = F.build(rec({ postSpacing: 2.4, terrain: 'raked', height: 1.8, gap: 0.05 }), { zAt: slope, units: 'm' });
near(L.panels[0].a.z, 0.05, 1e-9, 'raked bottom at post 1'); near(L.panels[0].b.z, 0.24 + 0.05, 1e-9, 'raked bottom at post 2');
near(L.panels[0].len, Math.hypot(2.4, 0.24), 1e-9, 'slope length'); near(L.panels[0].gapMax, 0.05, 1e-9, 'gap stays 0.05'); ok(L.problems.length === 0, 'no problems');
near(L.posts[1].top, 0.24 + 0.05 + 1.8, 1e-9, 'post top'); near(L.posts[1].base, 0.24 - 0.6, 1e-9, 'post base is 0.6 m below ground');
// stepped: level, bottom = highest ground + gap; widest gap 0.24 + 0.05 at the low end, above maxGap 0.15 -> problem
L = F.build(rec({ postSpacing: 2.4, terrain: 'stepped', gap: 0.05 }), { zAt: slope, units: 'm' });
near(L.panels[0].a.z, 0.24 + 0.05, 1e-9, 'stepped bottom at the highest ground'); near(L.panels[0].b.z, L.panels[0].a.z, 1e-12, 'level');
near(L.panels[0].gapMax, 0.29, 1e-9, 'widest gap 0.29'); ok(L.problems.some((p) => p.code === 'gap.wide'), 'wide gap reported');
ok(L.stats.steps === 9, 'nine steps between ten level panels', L.stats.steps); near(L.panels[1].a.z - L.panels[0].a.z, 0.24, 1e-9, 'each step is 0.24');
// ground above the panel bottom (a hump)
L = F.build(rec({ pts: [{ x: 0, y: 0 }, { x: 2, y: 0 }], terrain: 'raked' }), { zAt: (x) => 0.5 * Math.sin(Math.PI * x / 2), units: 'm' }); ok(L.problems.some((p) => p.code === 'gap.ground'), 'ground through the panel reported');
// styles
L = F.build(rec({ style: 'rails', rails: 3, height: 1.2, railSize: 0.1 }), { units: 'm' }); ok(L.rails.length === 30, '3 rails x 10 bays'); near(L.rails[0].a.z, 0.05 + 0.05, 1e-9, 'lowest rail centre'); near(L.rails[2].a.z, 0.05 + 1.2 - 0.05, 1e-9, 'top rail centre');
L = F.build(rec({ style: 'pickets', postSpacing: 2.4, picketW: 0.09, picketGap: 0.01 }), { units: 'm' }); ok(L.stats.pickets === 10 * 24, 'pickets: floor((2.4+0.01)/0.10)=24 a bay', L.stats.pickets);
// off the ground: reported, still built
L = F.build(rec({}), { zAt: () => null, units: 'm' }); ok(L.problems.some((p) => p.code === 'ground.off') && L.posts.length === 11, 'unknown ground reported, fence still built');
// schedule + csv + plan items + ifc
const S = F.schedule(F.build(rec({ gates: [{ s: 10, width: 1, name: 'Side' }] }), { units: 'm' }), 'm'); ok(S.rows.some((r) => r.item === 'gate' && r.name === 'Side') && S.totals.posts === 13, 'schedule', S.totals);
ok(F.scheduleCsv(F.build(rec({}), { units: 'm' }), 'm').split('\n')[0].startsWith('"item"'), 'csv header');
ok(F.planItems(F.build(rec({ gates: [{ s: 10, width: 1 }] }), { units: 'm' })).some((i) => i.layer === 'C-FENC-GATE'), 'gate swing on the plan');
ok(F.ifcModel(F.build(rec({}), { units: 'm' }), 'm').posts.length === 11, 'ifc model');
// untrusted
ok(F.clean({ id: 'x', pts: [] }, 'm') === null && F.clean({ id: 'fc3', pts: [{ x: 0, y: 0 }, { x: 'a', y: 1 }] }, 'm') === null, 'clean refuses junk');
ok(F.clean({ id: 'fc3', pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }], height: -4, style: 'x', rails: 99 }, 'm').height === 1.8, 'bad numbers take defaults');
console.log(`fence: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
