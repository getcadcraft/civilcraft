/* SPDX-License-Identifier: Apache-2.0 */
/** node lib/mep-route/test/water.mjs — MEP.3 domestic water (water.js) with BimCraft's own demand and friction functions (mep/flow.js). */
import { planWater, boxesOfRuns } from '../water.js';
import { demandFor, hazenWilliams, PIPE_K } from '../../../public_html/assets/apps/bimcraft/dev/mep/flow.js';
let good = 0, bad = 0;
const ok = (c, label, detail = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail ? ' (' + detail + ')' : '')); };
// copper tube, ASTM B88 type L (mep/tables.js): nominal 1/2 .. 1-1/2: OD = nominal + 1/8, wall 0.040 / 0.045 / 0.050 / 0.055 / 0.060
const L = [['1/2', 0.625, 0.04], ['3/4', 0.875, 0.045], ['1', 1.125, 0.05], ['1-1/4', 1.375, 0.055], ['1-1/2', 1.625, 0.06], ['2', 2.125, 0.07]];
const sizes = L.map(([key, od, w]) => ({ key, od: od * 25.4, id: (od - 2 * w) * 25.4 }));
const rules = { sizes, demand: (u) => demandFor(u).q, friction: hazenWilliams, C: 140, K: { elbow: PIPE_K.elbow90, tee_branch: PIPE_K.tee_branch, reducer: PIPE_K.reducer }, vmax: 2.4 };

console.log('== hydraulics: Hazen-Williams worked by hand');
// inch-pound form p = 4.52 Q^1.85 / (C^1.85 d^4.87) psi/ft: 100 gpm, C 100, d 4 in -> 4.52 / 4^4.87 = 0.00529 psi/ft
const hand = 4.52 / 4 ** 4.87 * 6894.757 / 0.3048;   // Pa/m
const mine = hazenWilliams(100 * 0.003785411784 / 60, 4 * 0.0254, 100);
ok(Math.abs(mine / hand - 1) < 0.02, 'friction of 100 gpm in 4 in at C 100: ' + mine.toFixed(1) + ' Pa/m vs the inch-pound formula ' + hand.toFixed(1), String(mine / hand));

console.log('== a flat: cold water to six fixtures');
const fx = [['wc', [3000, 500, 200], 2.5], ['lav', [3600, 500, 600], 1], ['bath', [4600, 500, 500], 4], ['sink', [3000, 3500, 900], 1.5], ['sh', [3800, 3500, 1000], 2], ['wm', [4600, 3500, 900], 4]].map(([id, p, units]) => ({ id, p, out: [0, 1, 0], units }));
const wall = { min: [2000, 1800, -100], max: [5500, 2000, 2600] };
const plan = planWater({ source: { p: [0, 2000, 300], out: [1, 0, 0] }, fixtures: fx.map((f, i) => ({ ...f, out: i < 3 ? [0, 1, 0] : [0, -1, 0] })), obstacles: [], rules, pressure: { source: 300, required: 100 }, clearance: 25 });
console.log('       ' + JSON.stringify({ ok: plan.ok, failed: plan.failed, worst: plan.worst && { id: plan.worst.id, kPa: Math.round(plan.worst.pressure) }, sizes: plan.schedule }));
ok(plan.ok, 'routed and sized, every fixture above 100 kPa', JSON.stringify(plan.failed));
const total = fx.reduce((n, f) => n + f.units, 0);
const main = plan.runs.find((r) => r.role === 'main');
ok(Math.abs(main.units - total) < 1e-9 && Math.abs(main.flow - demandFor(total).q) < 1e-12, 'the first piece carries ' + total + ' units = the curve\'s ' + (demandFor(total).q * 1000).toFixed(2) + ' L/s');
ok(plan.paths.every((p) => p.velocity <= 2.4 + 1e-9), 'velocity at or under 2.4 m/s in every run');
const small = sizes.findIndex((s) => s.key === main.size);
ok(small >= 0 && demandFor(total).q / (Math.PI * (sizes[small].id / 1000) ** 2 / 4) <= 2.4 && (small === 0 || demandFor(total).q / (Math.PI * (sizes[small - 1].id / 1000) ** 2 / 4) > 2.4), 'and each size is the smallest that keeps it: ' + main.size);
ok(plan.worst && plan.paths.every((p) => p.pressure >= plan.worst.pressure - 1e-9), 'the worst fixture is named: ' + plan.worst?.id);
// hand check of one path: pressure = source - (friction + fittings + static)
const p0 = plan.paths[0];
ok(Math.abs(p0.pressure - (300 - p0.friction - p0.fittings - p0.static)) < 1e-9, 'pressure = 300 kPa − friction − fittings − static head (kPa)');
ok(Math.abs(plan.paths.find((p) => p.id === 'wc').static - ((p0.id === 'wc' ? p0 : plan.paths.find((p) => p.id === 'wc')).rise / 1000 * 998.2 * 9.80665 / 1000)) < 1e-6, 'static head follows the rise (rho g h)');
ok(plan.runs.every((r) => r.system === 'cw'), 'cold water system');
ok(!plan.clash, 'no clash');

console.log('== too little pressure, and a hot water return loop');
const low = planWater({ source: { p: [0, 2000, 300], out: [1, 0, 0] }, fixtures: fx, rules, pressure: { source: 105, required: 100 } });
ok(!low.ok && low.failed.some((f) => f.error === 'low-pressure' && f.short > 0), 'a source of 105 kPa fails the check and says by how many kPa', JSON.stringify(low.failed));
const hot = planWater({ source: { p: [0, 2200, 300], out: [1, 0, 0] }, fixtures: fx.slice(0, 3).map((f) => ({ ...f, p: [f.p[0] + 100, f.p[1], f.p[2]] })), obstacles: boxesOfRuns(plan.runs, 25), system: 'hw', rules, loop: { to: { p: [200, 1800, 300], out: [1, 0, 0] }, size: '1/2' } });
ok(hot.ok && hot.loop && hot.loop.run.system === 'hwr', 'hot water with a return loop: ' + (hot.loop ? Math.round(hot.loop.run.points.length) + ' points' : 'none'), JSON.stringify(hot.failed));
console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
process.exit(bad ? 1 : 0);
