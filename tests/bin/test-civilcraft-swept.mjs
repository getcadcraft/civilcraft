#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-swept.mjs — CivilCraft 0.6 WL.28: vehicle swept paths (swept.js), DOM-free, in Node. The spike's
 * measurements (docs/spikes/swept-paths.md) come from this file.
 *
 *   node bin/test-civilcraft-swept.mjs [--build dev|x.y] [--verbose] [--timing]
 *
 * Against closed forms: a car and a tractor-semitrailer (and a car with a trailer hitched behind its axle) driven round a
 * circle settle on the steady-state radii (√(R² − L²) per unit, the hitch at √(r² + c²)); the transient into a turn agrees
 * with a 10× finer integration; the steering angle on the circle is atan(L / r). Reversing: the trailer's axle backed round
 * a circle settles the tractor where the same formulas put it (forward and backward agree), its steering found and checked
 * against the lock; a tight reverse turn flags the lock and the articulation. The swept area of a straight run is (path +
 * body length) × width; round a circle it is the annulus between the inner rear corner's and the outer front corner's
 * radii, within the grid. Untrusted vehicles. `--timing` prints how long a 300 ft turn takes.
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
const SW = await mod('swept.js');

let pass = 0, fail = 0;
const ok = (cond, msg, extra) => { if (cond) { pass++; if (VERBOSE) console.log('  ok  ' + msg); } else { fail++; console.log('  FAIL ' + msg + (extra !== undefined ? ' — ' + JSON.stringify(extra).slice(0, 500) : '')); } };
const near = (a, b, tol, msg) => ok(Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) <= tol, msg + ` (${a?.toFixed?.(6)} vs ${b?.toFixed?.(6)})`, { got: a, want: b });
const head = (s) => console.log('== ' + s);
const V = Object.fromEntries(SW.VEHICLES('ft').map((v) => [v.key, SW.cleanVehicle(v, 'ft')]));
/** k full turns anticlockwise round (0, 0) at radius R, starting at (R, 0) going north; then `tail` ft straight north. */
const circle = (R, k, tail = 0) => { const p = []; for (let i = 0; i < 2 * k; i++) p.push({ x: i % 2 ? -R : R, y: 0, b: 1 }); p.push({ x: R, y: 0 }); if (tail) p.push({ x: R, y: tail }); return p; };
const radius = (q) => Math.hypot(q.x, q.y);

head('vehicles');
{
  ok(Object.values(V).every(Boolean) && V.semi.trailers.length === 1, 'the placeholder vehicles clean as they are');
  ok(SW.cleanVehicle({ ...V.car, wheelbase: -1 }, 'ft') === null && SW.cleanVehicle({ ...V.car, maxSteer: 95 }, 'ft') === null && SW.cleanVehicle({ ...V.semi, trailers: [{ hitch: 'x' }] }, 'ft') === null, 'a negative wheelbase, a steer past 89°, a junk trailer: refused');
  ok(SW.cleanVehicle({ ...V.car, track: 99 }, 'ft').track === V.car.width, 'the track never wider than the vehicle');
  ok(SW.cleanVehicle({ ...V.semi, trailers: [V.semi.trailers[0], V.semi.trailers[0], V.semi.trailers[0], V.semi.trailers[0]] }, 'ft').trailers.length === 3, 'at most three trailers');
  const m = SW.VEHICLES('m').find((v) => v.key === 'semi');
  near(m.trailers[0].wheelbase, 12.5, 1e-9, 'metre placeholders: 41 ft → 12.50 m');
}

head('forward round a circle: the steady state');
for (const key of ['car', 'semi', 'cartrailer']) {
  const v = V[key], R = 60, sim = SW.simulate(v, circle(R, 4));
  const last = sim.frames[sim.frames.length - 1], st = SW.steadyRadii(v, R);
  last.units.forEach((q, i) => near(radius(q), st.rear[i], 2e-3, key + ': unit ' + i + ' rear axle on its steady radius'));
  near(Math.abs(last.steer), Math.atan(v.wheelbase / st.rear[0]) / (Math.PI / 180), 0.02, key + ': steering = atan(L / r)');
  ok(!sim.problems.length, key + ': within the lock and the articulation at R 60', sim.problems);
}

head('the transient into a turn agrees with a finer integration');
{
  const p = [{ x: 0, y: 0 }, { x: 0, y: 100, b: Math.tan(Math.PI / 8) }, { x: -50, y: 150 }, { x: -200, y: 150 }];
  const a = SW.simulate(V.semi, p), b = SW.simulate(V.semi, p, { step: a.frames[1].s / 10 });
  let worst = 0;
  for (const f of a.frames) {
    const g = b.frames.reduce((m, q) => (Math.abs(q.s - f.s) < Math.abs(m.s - f.s) ? q : m), b.frames[0]);
    if (Math.abs(g.s - f.s) > 1e-6) continue;
    for (let i = 0; i < f.units.length; i++) worst = Math.max(worst, Math.hypot(f.units[i].x - g.units[i].x, f.units[i].y - g.units[i].y));
  }
  ok(worst < 0.01, 'a 90° turn of radius 50: the trailer axle within 0.01 ft of a 10× finer run (worst ' + worst.toExponential(2) + ')');
  ok(a.wheels.length === 6 && a.corners.length === 8 && a.wheels.every((w) => w.length === a.frames.length), 'wheel paths (tractor front + rear, trailer axle; both sides) and 8 body corner traces');
}

head('reversing');
{
  // the trailer's axle backed round a circle of radius 50: the tractor settles where the forward formulas put it
  const v = V.cartrailer, R = 50, sim = SW.simulate(v, circle(R, 4), { mode: 'reverse' });
  const last = sim.frames[sim.frames.length - 1];
  near(radius(last.units[1]), R, 1e-9, 'the trailer axle on the path');
  const tr = v.trailers[0], rh = Math.hypot(R, tr.wheelbase), rr = Math.sqrt(rh * rh - tr.hitch * tr.hitch);
  near(radius(last.units[0]), rr, 2e-3, 'the car\'s rear axle settles at √(√(R² + Lt²)² − c²)');
  near(Math.abs(last.steer), Math.atan(v.wheelbase / rr) / (Math.PI / 180), 0.05, 'its steering atan(L / r)');
  near(Math.abs(last.art[0]), (Math.atan2(tr.wheelbase, R) + Math.atan2(tr.hitch, rr)) / (Math.PI / 180), 0.05, 'the articulation between them');
  ok(!sim.problems.length, 'within the lock', sim.problems);
  // the same steady state driving forward round the circle the car's front axle then follows
  const Rf = Math.hypot(rr, v.wheelbase), fwd = SW.simulate(v, circle(Rf, 4)), lf = fwd.frames[fwd.frames.length - 1];
  near(radius(lf.units[1]), R, 2e-3, 'forward on the front axle\'s circle brings the trailer axle back to R 50');
  // a tight reverse turn: past the lock, and jackknifing
  const tight = SW.simulate(v, [{ x: 0, y: 0 }, { x: 0, y: 30, b: Math.tan(Math.PI / 4) }, { x: -12, y: 42 }, { x: -12, y: 60 }], { mode: 'reverse' });
  ok(tight.problems.some((p) => p.kind === 'steer') && tight.problems.some((p) => p.kind === 'articulation'), 'a 6 ft reverse half-turn: the lock and the articulation limit are both said', tight.problems.map((p) => p.kind));
  const semi = SW.simulate(V.semi, circle(80, 3), { mode: 'reverse' });
  const ls = semi.frames[semi.frames.length - 1];
  near(radius(ls.units[0]), Math.hypot(80, V.semi.trailers[0].wheelbase), 2e-3, 'a semitrailer backed round R 80: the fifth wheel (on the drive axle) at √(R² + Lt²)');
  const ahead = SW.simulate({ ...V.semi, trailers: [{ ...V.semi.trailers[0], hitch: -1 }] }, [{ x: 0, y: 0 }, { x: 0, y: 50 }], { mode: 'reverse' });
  ok(ahead.problems.some((p) => p.kind === 'hitch'), 'reversing with the hitch ahead of the axle: taken as on it, and said');
}

head('the swept area');
{
  const v = V.car, P = 100, sim = SW.simulate(v, [{ x: 0, y: 0 }, { x: P, y: 0 }]), e = SW.envelope(sim, v);
  const want = (P + v.front + v.wheelbase + v.rear) * v.width;
  near(e.area, want, (P + 30) * 2 * e.cell, 'straight: (path + body length) × width = ' + want);
  ok(e.loops.length === 1 && e.loops[0].length <= 8, 'one outline, a rectangle after thinning (' + e.loops[0]?.length + ' vertices)');
  // round a circle: from the last full turn the swept area is an annulus
  const R = 40, s2 = SW.simulate(v, circle(R, 4)), lastTurn = s2.frames.filter((f) => f.s > s2.length - 2 * Math.PI * R);
  const e2 = SW.envelope({ ...s2, frames: lastTurn }, v, { cell: 0.1 });
  const rr = SW.steadyRadii(v, R).rear[0], rin = rr - v.width / 2, rout = Math.hypot(rr + v.width / 2, v.wheelbase + v.front);
  near(e2.area, Math.PI * (rout * rout - rin * rin), 2 * Math.PI * (rout + rin) * 0.1, 'a circle: the annulus between ' + rin.toFixed(2) + ' and ' + rout.toFixed(2));
  const d = e2.loops.flat().map(radius);
  near(Math.min(...d), rin, 0.25, 'its inner edge at the inner rear corner\'s radius'); near(Math.max(...d), rout, 0.25, 'its outer edge at the outer front corner\'s radius');
  ok(e2.loops.length === 2, 'two outlines: the outside and the hole', e2.loops.length);
  // reversing a semitrailer round a corner: the outline holds the whole vehicle at the start, the middle and the end
  const rv = SW.simulate(V.semi, [{ x: 0, y: 0 }, { x: 0, y: 100, b: Math.tan(Math.PI / 8) }, { x: 60, y: 160 }], { mode: 'reverse' }), re = SW.envelope(rv, V.semi);
  const inLoops = (p) => { let k = false; for (const L of re.loops) for (let i = 0, j = L.length - 1; i < L.length; j = i++) if ((L[i].y > p.y) !== (L[j].y > p.y) && p.x < ((L[j].x - L[i].x) * (p.y - L[i].y)) / (L[j].y - L[i].y) + L[i].x) k = !k; return k; };
  const shrink = (b) => { const cx = b.reduce((m, p) => m + p.x, 0) / 4, cy = b.reduce((m, p) => m + p.y, 0) / 4; return b.map((p) => ({ x: cx + (p.x - cx) * 0.97, y: cy + (p.y - cy) * 0.97 })); };
  const fr = [rv.frames[0], rv.frames[rv.frames.length >> 1], rv.frames[rv.frames.length - 1]];
  ok(fr.every((f) => [0, 1].every((i) => shrink(SW.bodyOutline(V.semi, f, i)).every(inLoops))), 'reversing: the outline holds the whole vehicle at the start, the middle and the end');
}

head('in the project');
{
  const PJ = await mod('project.js'), AL = await mod('alignment.js'), SC = await mod('scene.js'), DXF = await mod('dxf.js');
  const p = new PJ.Project();
  p.change('lines', (s) => {
    s.features = [{ id: 'f1', name: 'Dock approach', pts: [{ x: 0, y: 0, z: 0 }, { x: 0, y: 80, z: 0, b: Math.tan(Math.PI / 8) }, { x: -60, y: 140, z: 0 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 }];
    s.alignments.push({ id: 'a1', name: 'Loop road', start: 0, pis: [{ x: 0, y: -200, r: 0 }, { x: 300, y: -200, r: 120 }, { x: 300, y: 100, r: 0 }], pvis: [] });
    s.swept = [SW.cleanSwept({ id: 'w1', name: 'Semi in', vehicle: V.semi, mode: 'forward', from: { kind: 'feature', id: 'f1' } }, 'ft'),
      SW.cleanSwept({ id: 'w2', name: 'Bus', vehicle: V.bus, mode: 'forward', from: { kind: 'alignment', id: 'a1' } }, 'ft')];
  });
  const r1 = p.sweptOf(p.state.swept[0]), r2 = p.sweptOf(p.state.swept[1]);
  ok(r1 && r1.sim.frames.length > 100 && r1.env.area > 0, 'a swept path along a feature line works out');
  near(r1.sim.length, 80 + 30 * Math.PI, 1e-9, 'its length = the line\'s (80 + a quarter circle of radius 60)');
  const al = p.alignment(p.state.alignments[0]);
  const off = Math.max(...r2.sim.frames.map((f) => { const q = f.units[0], fx = q.x + V.bus.wheelbase * Math.cos(q.th), fy = q.y + V.bus.wheelbase * Math.sin(q.th); const so = al.stationOffset(fx, fy); return so ? Math.abs(so.off) : 0; }));
  ok(off < 1e-3, 'along an alignment: the front axle stays on its centerline, curve included (' + off.toExponential(2) + ' ft)');
  ok(p.sweptOf(p.state.swept[0]) === r1, 'kept while nothing changes');
  p.change('move', (s) => { s.features[0].pts[2].x = -70; });
  ok(p.sweptOf(p.state.swept[0]) !== r1, 'worked out again when its line changes');
  p.change('gone', (s) => { s.features = []; });
  ok(p.sweptOf(p.state.swept[0]) === null, 'its line deleted: nothing to drive (said in Properties)');
  p.undo();
  const back = PJ.Project.fromJSON(JSON.parse(JSON.stringify(p.toJSON()))).project;
  ok(back.state.swept.length === 2 && JSON.stringify(back.state.swept[1]) === JSON.stringify(p.state.swept[1]), 'the project file keeps the swept paths');
  ok(SW.cleanSwept({ vehicle: V.car, from: { kind: 'feature', id: 'x"' } }, 'ft') === null && SW.cleanSwept({ vehicle: { width: -1 }, from: { kind: 'feature', id: 'f1' } }, 'ft') === null && SW.cleanSwept({ vehicle: V.car, from: { kind: 'feature', id: 'f1' }, mode: 'sideways' }, 'ft').mode === 'forward', 'untrusted: bad line ids and vehicles refused, a junk mode = forward');
  const items = SW.sweptItems('Semi in', p.sweptOf(p.state.swept[0]).sim, p.sweptOf(p.state.swept[0]).env);
  ok(items.filter((i) => i.kind === 'poly' && i.closed).length >= 1 && items.filter((i) => i.dashed).length === 4 && items.some((i) => i.kind === 'text'), 'plan items: the outline, four wheel paths, the name');
  ok(SC.LAYERS.some((l) => l.name === 'C-ROAD-SWPT'), 'its own plan layer C-ROAD-SWPT');
  const { text } = DXF.writeDxf({ units: 'ft', layers: SC.LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: SC.toDxfEntities({ layers: SC.LAYERS, items }, 1) });
  ok((text.match(/\r\n  8\r\nC-ROAD-SWPT\r\n/g) || []).length >= 5, 'and in the DXF');
}

if (process.argv.includes('--timing')) {
  const p = [{ x: 0, y: 0 }, { x: 0, y: 100, b: Math.tan(Math.PI / 8) }, { x: -50, y: 150 }, { x: -200, y: 150 }];
  let t0 = performance.now();
  const sim = SW.simulate(V.semi, p);
  const t1 = performance.now();
  const e = SW.envelope(sim, V.semi);
  const t2 = performance.now();
  console.log(`  timing: semitrailer, 300 ft with a 90° turn: ${sim.frames.length} steps in ${(t1 - t0).toFixed(1)} ms; swept area (${e.cells} cells of ${e.cell.toFixed(3)} ft) in ${(t2 - t1).toFixed(1)} ms`);
  t0 = performance.now();
  SW.simulate(V.semi, p, { mode: 'reverse' });
  console.log(`  timing: the same reversing: ${(performance.now() - t0).toFixed(1)} ms`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
