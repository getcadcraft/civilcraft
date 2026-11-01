#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * print-features08.mjs — known answers for PartCraft's Scale (shrinkage allowance) and Split for printing features (0.8 SU.929
 * step 5 + SU.934; partcraft/dev/print-features.js, written by model-08, mounted by engineer). Add to PartCraft's Node suite.
 *
 *   node tools/partcraft-test/print-features08.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/partcraft/dev');
const imp = (f) => import(pathToFileURL(path.join(APP, f)));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const section = (s) => console.log('\n== ' + s);

const I18N = await imp('i18n.js');
const fs = await import('node:fs');
if (!I18N.t('sx.split.h').includes(' ')) I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/lang/en.json'), 'utf8')) });
const F = await imp('print-features.js');

/** An axis-aligned box as 12 triangles, outward. */
const boxTris = (x0, y0, z0, x1, y1, z1) => {
  const v = [[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]];
  const q = (a, b, c, d) => [{ p: [v[a], v[b], v[c]] }, { p: [v[a], v[c], v[d]] }];
  return [...q(0, 3, 2, 1), ...q(4, 5, 6, 7), ...q(0, 1, 5, 4), ...q(2, 3, 7, 6), ...q(1, 2, 6, 5), ...q(3, 0, 4, 7)];
};

section('Scale feature (SU.934): factors, shrinkage, anchor');
{
  const f = { ...F.PRINT_DEFAULTS.scale(), shrink: { pct: [1.5, 1.5, 1], mode: 'add' }, about: 'min' };
  ok(F.scaleFactors(f).every((v, i) => close(v, [1.015, 1.015, 1.01][i])), 'shrinkage 1.5 / 1.5 / 1 % gives 1.015, 1.015, 1.01');
  ok(close(F.scaleFactors({ ...f, shrink: { ...f.shrink, mode: 'exact' } })[0], 1 / 0.985), 'the exact mode is 1 / (1 − s)');
  const tris = boxTris(10, 20, 30, 110, 80, 50);
  const out = F.scaleTris(tris, f);
  const xs = out.flatMap((t) => t.p.map((p) => p[0])), zs = out.flatMap((t) => t.p.map((p) => p[2]));
  ok(close(Math.min(...xs), 10) && close(Math.max(...xs), 10 + 100 * 1.015, 1e-9) && close(Math.max(...zs), 30 + 20 * 1.01, 1e-9), 'a 100 × 60 × 20 box grows from its lowest corner: 101.5 long, 20.2 high');
  const m = F.scaleMatrix({ min: [0, 0, 0], max: [10, 10, 10] }, { factors: [2, 2, 2], about: 'center', shrink: null });
  ok(m[0] === 2 && m[12] === -5 && m[13] === -5 && m[14] === -5 && m[15] === 1, 'matrix: doubling about the middle moves the origin by −5');
  ok(F.cleanPrintFeature('scale', { factors: [0, 1, 1], about: 'nope', shrink: { pct: [99, 0, 0] } }).shrink === null, 'a bad factor, anchor or percent falls back to the defaults');
  ok(JSON.stringify(F.cleanPrintFeature('scale', { factors: '1.01, 1.02, 1.03' }).factors) === '[1.01,1.02,1.03]', 'factors may be typed text');
  ok(F.cleanPrintFeature('other', {}) === null && F.cleanPrintFeature('scale', null) === null && F.cleanPrintFeature('split', [1]) === null, 'not ours / not an object = null');
}

section('Split feature (SU.929 step 5): defaults, reader, run');
{
  const d = F.cleanPrintFeature('split', { bed: [100, 100, 100], connector: 'bad', pegD: 99, planes: [{ n: [1, 0, 0], d: 5 }, { n: [1, 1, 0], d: 1 }], place: { '1-2': [[1, 2, 3], ['x']], bad: [] } });
  ok(d.connector === 'peg' && d.pegD === 5 && d.bed[0] === 100 && d.planes.length === 1 && JSON.stringify(d.place) === '{"1-2":[[1,2,3]]}', 'the reader keeps good values, drops bad ones and slanting planes');
  const so = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/solids.js')));   // only to load manifold-3d the way kernel.js is handed it
  const MF = await so.manifold(() => import(pathToFileURL(path.resolve(APP, '../../../vendor/manifold-3d/current/manifold.js')).href));
  const res = await F.runSplit(MF, boxTris(0, 0, 0, 300, 100, 100), { ...F.PRINT_DEFAULTS.split(), mode: 'bed', bed: [220, 220, 250], numbers: true });
  ok(res.ok && res.pieces.length === 2 && res.joints.length === 1 && res.joints[0].connectors.length >= 1, `a 300 mm bar for a 220 mm bed: ${res.pieces.length} pieces, ${res.joints.length} joint, ${res.joints[0]?.connectors.length} connectors`);
  const byPlane = await F.runSplit(MF, boxTris(0, 0, 0, 300, 100, 100), { ...F.PRINT_DEFAULTS.split(), mode: 'planes', planes: [{ n: [1, 0, 0], d: 100 }, { n: [1, 0, 0], d: 200 }], connector: 'none' });
  ok(byPlane.pieces.length === 3 && byPlane.joints.every((j) => j.connectors.length === 0), 'cut at 100 and 200 with no connectors: three pieces');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
