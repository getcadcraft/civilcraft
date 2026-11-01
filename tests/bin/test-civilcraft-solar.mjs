#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** 0.8 round 3 (civil_PART_3), EG.15: ground PV arrays on terrain (civilcraft/dev/solar.js over the byte-identical PV engine in dev/pv/). Run: node bin/test-civilcraft-solar.mjs */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { drift } from '../tools/pv/sync.mjs';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const S = await import(pathToFileURL(path.join(APP, 'solar.js')).href);
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const RAD = Math.PI / 180;

ok(drift(['civilcraft']).length === 0, 'the PV engine in civilcraft/dev/pv is byte-identical to BimCraft\'s (tools/pv/sync.mjs --check)', drift(['civilcraft']).map((d) => d.file));

const site = { lat: 40, lon: -105, tz: -7 };
const poly = (x0, y0, x1, y1) => [{ x: x0, y: y0 }, { x: x1, y: y0 }, { x: x1, y: y1 }, { x: x0, y: y1 }];
const base = { units: 'm', site, polygon: poly(0, 0, 120, 200), tilt: 25, perRow: 12, stack: 2, step: 0.02, setback: 3, colGap: 0.5 };
const plane = (g) => ({ elevationAt: (x, y) => 100 + y * Math.tan(g * RAD) });   // g > 0: the ground rises toward +y (north, behind south-facing tables)

// ---- flat ground = the engine's own winter rule
const flat = S.planGround({ ...base, ground: plane(0) });
ok(flat.ok && flat.count > 100, 'flat ground fills the field with tables', flat.count);
ok(near(flat.pitch.mean, flat.flatPitch, 0.03), 'on flat ground the row pitch is the engine\'s winter-solstice pitch', [flat.pitch.mean, flat.flatPitch]);
ok(flat.modules === flat.count * 24 && near(flat.kwp, flat.modules * 0.4, 0.01), 'modules and kWp add up (24 modules a table, 400 Wp)', [flat.modules, flat.kwp]);
ok(flat.notes.some((n) => n.key === 'solar.note.starter'), 'starter module values are labelled');
// every table stands inside the polygon with the setback
ok(flat.tables.every((t) => t.corners.every((c) => c[0] >= 3 - 1e-6 && c[0] <= 117 + 1e-6 && c[1] >= 3 - 1e-6 && c[1] <= 197 + 1e-6)), 'every corner keeps the 3 m setback');

// ---- ground that rises behind the tables: rows can stand closer; ground that falls away: farther (closed form)
const { size, sun, azimuth } = flat, tanE = Math.tan(sun.elevation * RAD) / Math.max(0.2, Math.cos((sun.azimuth - azimuth) * RAD));
for (const g of [5, -5, 8]) {
  const r = S.planGround({ ...base, ground: plane(g) });
  const want = (size.height + size.depth * tanE) / (Math.tan(g * RAD) + tanE);
  ok(r.ok && near(r.pitch.mean, want, 0.04), 'pitch on a ' + g + '° slope along the rows matches (H + D tan E) / (tan γ + tan E)', [r.pitch.mean, want]);
  ok(g > 0 ? r.pitch.mean < flat.pitch.mean : r.pitch.mean > flat.pitch.mean, g > 0 ? 'rising ground behind: rows closer than flat' : 'falling ground behind: rows farther than flat');
}
// ---- too steep: nothing placed, and it says why
const steep = S.planGround({ ...base, ground: plane(20) });
ok(steep.ok && steep.count === 0 && steep.skipped.steep > 0 && steep.notes.some((n) => n.key === 'solar.note.steep'), 'ground over the slope limit stays empty and is counted', steep.skipped);
// ---- a table the ground would force too high on its piles is refused (a hump behind a table)
const hump = { elevationAt: (x, y) => 100 + (y > 100 ? 6 : 0) };
const hr = S.planGround({ ...base, polygon: poly(0, 0, 40, 200), ground: hump, maxPile: 2 });
ok(hr.skipped.pile > 0 || hr.skipped.steep > 0, 'a step in the ground that needs very tall piles is not built across', hr.skipped);
// ---- keep-out (a pond)
const koPoly = poly(40, 60, 80, 120);
const ko = S.planGround({ ...base, ground: plane(0), keepOut: [koPoly], keepOutMargin: 1 });
ok(ko.count < flat.count && ko.tables.every((t) => !t.corners.some((c) => c[0] > 39 && c[0] < 81 && c[1] > 59 && c[1] < 121)), 'a keep-out area is left empty', [ko.count, flat.count]);
// ---- outside the surface
const edge = S.planGround({ ...base, ground: { elevationAt: (x, y) => (y < 100 ? 100 : null) } });
ok(edge.ok && edge.count > 0 && edge.tables.every((t) => t.corners.every((c) => c[1] < 100)), 'no table is placed where the surface has no elevation');
// ---- refusals
ok(S.planGround({ ...base, ground: null }).error === 'solar.err.noground', 'no ground: refused with a code');
ok(S.planGround({ ...base, ground: plane(0), polygon: [] }).error === 'solar.err.region', 'no region: refused');
ok(S.planGround({ ...base, ground: plane(0), site: null }).error === 'solar.err.nosite', 'no place on Earth: refused');
ok(S.planGround({ ...base, ground: plane(0), module: { id: 'x', wp: -1 } }).error === 'solar.err.module', 'a bad module row: refused');
ok(S.planGround({ ...base, ground: plane(0), site: { lat: 85, lon: 0, tz: 0 } }).ok === false, 'polar night at the winter solstice: refused (the rule has no answer)');
// ---- yield
const small = S.planGround({ ...base, polygon: poly(0, 0, 40, 60), ground: plane(0) });
const y0 = S.yieldGround(small, { ground: plane(0) });
ok(y0.ok && y0.res.total.acKwh > 0, 'a year of energy is computed', y0.res?.annual);
const kwhPerKwp = y0.res.total.acKwh / small.kwp;
ok(kwhPerKwp > 900 && kwhPerKwp < 2400, 'the specific yield is in a believable range for 40 °N (clear sky is an upper bound): ' + Math.round(kwhPerKwp) + ' kWh/kWp', kwhPerKwp);
// a hill 30 m high, 60 m south of the array takes sun
const hill = { elevationAt: (x, y) => 100 + (y < -20 && y > -60 ? 30 : 0) };
const y1 = S.yieldGround(small, { ground: hill });
ok(y1.ok && y1.res.total.acKwh < y0.res.total.acKwh * 0.97, 'a hill to the south takes beam from the array', [y1.res.total.acKwh, y0.res.total.acKwh]);
ok(y1.shade.horizon.el[36] > 20, 'the horizon profile sees the hill (south = 180°)', y1.shade.horizon.el[36]);
const rows = S.tableRows(small);
ok(rows.length === small.count && rows[0].length === 7, 'the table list has a row per table');
// ---- the 3D view and the project file
const S3 = await import(pathToFileURL(path.join(APP, 'site3d.js')).href);
const PV = await import(pathToFileURL(path.join(APP, 'pv/pv.js')).href);
const PR = await import(pathToFileURL(path.join(APP, 'project.js')).href);
{
  const p = new PR.Project(); p.state.units = 'm';
  const pts = []; let n = 1; for (let x = 0; x <= 120; x += 10) for (let y = 0; y <= 200; y += 10) pts.push({ n: n++, x, y, z: 100 + y * Math.tan(3 * RAD), d: 'GRD' });
  p.setPoints(pts, 't.csv');
  p.change('parcel', (s) => { s.parcels.push({ id: 'r1', name: 'Field', pts: poly(0, 0, 120, 200) }); });
  p.change('solar', (s) => { s.solar = { arrays: [{ id: 'sa1', name: 'South field', region: { kind: 'parcel', ref: 'r1' }, keep: [], ground: 'auto', site, module: { ...PV.STARTER_MODULE }, options: { tilt: 25, perRow: 12, stack: 2 } }] }; });
  const R = await import(pathToFileURL(path.join(APP, 'solar-run.js')).href);
  const a = p.state.solar.arrays[0];
  const plan = R.planArray(p, a);
  ok(plan.ok && plan.count > 50, 'a parcel + the project\'s own surface lay out through solar-run', [plan.ok, plan.count, plan.error]);
  ok(R.planArray(p, a) === plan, 'the plan is remembered until the ground or the inputs change');
  const input = S3.siteInput(p);
  ok(input.solar.length === 1 && input.solar[0].plan.count === plan.count, 'the 3D input carries the array\'s tables');
  const sc = S3.buildSite3D(input, {});
  const m = sc.meshes.find((x) => x.key === 'solar');
  ok(m && m.positions.length >= plan.count * 6 * 3, 'the 3D scene has a panel mesh', m && m.positions.length);
  ok(!S3.buildSite3D(input, { show: { solar: false } }).meshes.some((x) => x.key === 'solar'), 'it can be hidden');
  const j = p.toJSON(); const back = PR.Project.fromJSON(JSON.parse(JSON.stringify(j))).project;
  ok(back.state.solar.arrays[0].region.ref === 'r1' && back.state.solar.arrays[0].module.wp === 400 && back.state.solar.arrays[0].options.tilt === 25, 'the array reads back from the project file with its inputs');
  ok(JSON.stringify(j.solar).length < 3000, 'the file keeps inputs, not tables', JSON.stringify(j.solar).length);
}
console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
