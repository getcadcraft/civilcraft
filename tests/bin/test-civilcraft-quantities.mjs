#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-quantities.mjs — CivilCraft 0.6 TK.5+: the earthwork as a quantities file for TakeoffCraft (qtyout.js),
 * DOM-free, in Node.
 *
 *   node bin/test-civilcraft-quantities.mjs [--build dev|x.y] [--verbose]
 *
 * By hand: 2,700 cu ft of cut and 5,400 of fill in a feet project = 100 and 200 CY (÷ 27, what the Earthwork panel shows);
 * a metre project stays in m³, rounded to the hundredth. A real project: flat ground at 0, a 20 × 20 ft pad at +2 with 2:1
 * fill slopes = prism 800 + side wedges 320 + corner cones 36 · ½·4²·sin 10° · ⅔ cu ft (the hand-worked solid of
 * test-civilcraft.mjs), so the file says (800 + 320 + cones) ÷ 27 CY of fill and no cut. Nothing graded → refused, saying why.
 * When TakeoffCraft's build sits beside it, its own reader (fixedqty.js) takes the file as it is.
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
const Q = await mod('qtyout.js');
const PJ = await mod('project.js');

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + JSON.stringify(extra) : '')); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const eq2 = (a, b, m) => ok(a === b, `${m} (got ${a})`);
const section = (s) => console.log('\n== ' + s);
const MADE = '2026-10-18T12:00:00Z';

section('worked by hand');
{
  const r = Q.earthworkFile({ name: 'North lot', units: 'ft', volumes: { cut: 2700, fill: 5400, cells: 100, cell: 2, items: [{ name: 'Pad A', cut: 2700, fill: 0 }, { name: 'Road', cut: 0, fill: 5400 }] }, made: MADE });
  ok(r.ok && r.cut === 100 && r.fill === 200 && r.unit === 'CY', 'feet project: 2,700 cu ft cut = 100 CY, 5,400 fill = 200 CY', r);
  const j = r.json;
  ok(j.format === 'cadcraft-quantities' && j.version === 1 && j.app === 'CivilCraft' && j.project === 'North lot' && j.made === MADE, 'the file names its format, version, app, project and time');
  ok(j.items.length === 2 && j.items[0].key === 'earthwork:cut' && j.items[1].key === 'earthwork:fill' && j.items.every((x) => x.unit === 'CY'), 'two items: earthwork:cut and earthwork:fill, in CY');
  ok(j.items[0].name === 'Earthwork: cut' && j.items[1].name === 'Earthwork: fill', 'named for the estimate');
  ok(/grid method, 100 cells of 2 ft; no shrink or swell/.test(j.items[0].note) && /Pad A: cut 100 CY, fill 0 CY\. Road: cut 0 CY, fill 200 CY\./.test(j.items[0].note), 'the note says how it was measured and each pad / corridor\'s share (totals only, so nothing counts twice)', j.items[0].note);
  const m = Q.earthworkFile({ name: 'Lote', units: 'm', volumes: { cut: 12.3456, fill: 0.004, cells: 9, cell: 0.5, items: [] }, made: MADE });
  ok(m.ok && m.unit === 'm³' && m.cut === 12.35 && m.fill === 0, 'metre project: m³ as measured, to the hundredth (12.3456 → 12.35; 0.004 → 0)', m);
  ok(!Q.earthworkFile({ name: 'x', units: 'ft', volumes: null }).ok && /grade a pad or a corridor first/.test(Q.earthworkFile({ name: 'x', units: 'ft', volumes: null }).why), 'nothing graded: refused, saying why');
  ok(!Q.earthworkFile({ name: 'x', units: 'ft', volumes: { cut: 0, fill: 0, cells: 0, cell: 1 } }).ok, 'no cells measured: refused');
  ok(JSON.parse(JSON.stringify(j)).items[1].qty === 200, 'plain JSON, survives a round trip');
}

section('a real project: a fill pad on flat ground');
let real = null;
{
  const p = new PJ.Project();
  const pts = [];
  let n = 1;
  for (let i = -10; i <= 10; i++) for (let j = -10; j <= 10; j++) pts.push({ n: String(n++), x: i * 10, y: j * 10, z: 0, d: 'GND' });
  p.setPoints(pts, 'flat');
  p.change('pad', (s) => { s.name = 'Flat site'; s.pads.push({ id: 'p1', name: 'Pad', pts: [{ x: -10, y: -10 }, { x: 10, y: -10 }, { x: 10, y: 10 }, { x: -10, y: 10 }], z: 2, cut: 2, fill: 2 }); });
  const v = p.volumes();
  ok(!!v && v.cells > 0, 'the project measures its volumes');
  const corners = 36 * 0.5 * 16 * Math.sin(Math.PI / 18) * 2 / 3;
  const want = 800 + 320 + corners;
  const r = Q.earthworkFile({ name: p.state.name, units: p.state.units, volumes: v, made: MADE });
  ok(r.ok, 'the file is made');
  near(r.fill, want / 27, (want / 27) * 0.002 + 0.01, `fill ${r.fill} CY vs (800 + 320 + ${corners.toFixed(2)}) ÷ 27 by hand`);
  near(r.fill, Math.round(v.fill / 27 * 100) / 100, 1e-9, 'exactly the panel\'s cu yd (the same ÷ 27), to the hundredth');
  ok(r.cut < 0.02, 'no cut on a fill pad');
  eq2(r.fill, 42.72, 'that is 42.72 CY (TakeoffCraft\'s suite prices this same file)');
  real = r.json;
}

section('TakeoffCraft reads it');
{
  const TK = path.join(REPO, 'public_html/assets/apps/takeoffcraft', 'dev');
  if (!fs.existsSync(path.join(TK, 'fixedqty.js'))) console.log('  skip TakeoffCraft is not in this repository: its own reader is checked in its suite');
  else {
    const TI = await import(pathToFileURL(path.join(TK, 'i18n.js')).href);
    TI.init({ strings: JSON.parse(fs.readFileSync(path.join(TK, 'lang/en.json'), 'utf8')) });
    const FQ = await import(pathToFileURL(path.join(TK, 'fixedqty.js')).href);
    const r = FQ.readQuantities(JSON.parse(JSON.stringify(real)));
    ok(r.ok && r.app === 'CivilCraft' && r.project === 'Flat site' && r.items.length === 2 && !r.skipped, 'TakeoffCraft\'s own reader takes the file as it is', r);
    ok(r.ok && r.items[1].qty === real.items[1].qty && r.items[1].unit === 'CY', 'with the same fill in CY');
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
