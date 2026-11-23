#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plan-loops-same-1995.mjs — #1995 (perf-finish-11, lane bim): model-rooms.js planLoops with its box grid gives the SAME loops as before
 * (fixtures-1995/model-rooms-before.mjs, the file as it was): rooms, islands, outlines, every point, on every level of the showcase models and
 * the #1995 test models (walls through the real storeyLoops input), plus random plans (crossing, touching, collinear, T and L joints).
 * Then the time of both on the 3,400-wall model.   node tools/bimcraft-test/plan-loops-same-1995.mjs
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
const ROOT = '/var/www/CADCRAFT/getcadcraft.com', APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) { if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true }; return next(spec, ctx); }`), import.meta.url);
const NEW = await import(path.join(APP, 'model-rooms.js'));
const OLD = await import(new URL('./fixtures-1995/model-rooms-before.mjs', import.meta.url).href);
const WebIFC = await import(path.join(APP, 'ifc/api.js'));
const { IfcModel } = await import(path.join(APP, 'ifc-model.js'));
const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
const MW = await import(path.join(APP, 'model-walls.js'));
const SL = await import(path.join(APP, 'model-slabs.js'));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL ' + m); } };
const quiet = (f) => async (...a) => { const l = console.log; console.log = () => {}; try { return await f(...a); } finally { console.log = l; } };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const capture = [];
// the plans storeyLoops hands planLoops: catch them by wrapping planLoops through the polys storeyLoops builds
async function plansOf(file) {
  const eng = await quiet(IfcModel.create)(WebIFC, null, { manifold: false });
  await quiet((b) => eng.load(b, () => {}, { worker: false }))(new Uint8Array(fs.readFileSync(file)));
  const w = new ModelWriter(WebIFC, eng.api, eng.modelID), out = [];
  const levels = (await import(path.join(APP, 'model-levels.js')).catch(() => null))?.readLevels?.(w) || [];
  for (const L of levels) {
    const all = levels.length > 1 ? MW.readWalls(w) : MW.readWalls(w, L.id);
    const walls = all.filter((x) => x.storey === L.id);
    const polys = [...MW.wallOutlines(walls.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t, bulge: x.bulge, off: x.joinOff }))).values()];
    out.push({ level: L.name, polys });
  }
  return out;
}
const files = [...fs.readdirSync(path.join(ROOT, 'fixtures/showcase')).filter((n) => /\.ifc$/.test(n) && fs.statSync(path.join(ROOT, 'fixtures/showcase', n)).size < 25e6).map((n) => path.join(ROOT, 'fixtures/showcase', n)),
  path.join(ROOT, 'testfiles/generated/sheets1995/structural-rebar-2500.ifc'), path.join(ROOT, 'testfiles/generated/sheets1995/walls-3500.ifc')];
let plans = 0, timed = null;
for (const f of files) {
  let list = [];
  try { list = await plansOf(f); } catch (e) { console.log('(skipped ' + path.basename(f) + ': ' + e.message + ')'); continue; }
  for (const { level, polys } of list) {
    if (!polys.length) continue;
    const t0 = performance.now(); const a = OLD.planLoops(polys); const t1 = performance.now(); const b = NEW.planLoops(polys); const t2 = performance.now();
    ok(same(a, b), path.basename(f) + ' ' + level + ': the same loops (' + polys.length + ' outlines, ' + (a.rooms?.length || 0) + ' rooms)');
    plans++;
    if (/walls-3500/.test(f)) timed = timed || { level, outlines: polys.length, old: Math.round(t1 - t0), now: Math.round(t2 - t1) };
  }
}
// random plans: rectangles and slanted bars, overlapping, touching, collinear
let s = 20261121; const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
for (let k = 0; k < 120; k++) {
  const polys = [];
  const n = 4 + Math.floor(rnd() * 60);
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * 20) * 500, y = Math.round(rnd() * 20) * 500, len = 500 + Math.round(rnd() * 10) * 500, t = 100 + Math.round(rnd() * 2) * 50, ang = rnd() < 0.7 ? (rnd() < 0.5 ? 0 : Math.PI / 2) : rnd() * Math.PI;
    const dx = Math.cos(ang), dy = Math.sin(ang), nx = -dy * t / 2, ny = dx * t / 2;
    polys.push([[x + nx, y + ny], [x + dx * len + nx, y + dy * len + ny], [x + dx * len - nx, y + dy * len - ny], [x - nx, y - ny]]);
  }
  const lines = rnd() < 0.3 ? [[[0, 0], [5000, 5000]], [[2500, 0], [2500, 9000]]] : [];
  ok(same(OLD.planLoops(polys, { lines }), NEW.planLoops(polys, { lines })), 'random plan ' + k + ' (' + n + ' bars' + (lines.length ? ', 2 lines' : '') + ')');
}
if (timed) console.log(`walls-3500 ${timed.level}: ${timed.outlines} wall outlines, planLoops before ${timed.old} ms, now ${timed.now} ms`);
console.log(`plan loops: ${pass} passed, ${fail} failed (${plans} real levels, 120 random plans)`);
process.exit(fail ? 1 : 0);
