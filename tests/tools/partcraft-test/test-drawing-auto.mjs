#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-drawing-auto.mjs — 0.8 EG.20 / EG.56, PartCraft's half (part_PART_3): the drawing sheet dimensions the holes by itself and takes the
 * paper itself. A plate 100 × 50 × 20 (mesh kernel) with two Ø6 holes at (20, 15) and (20, 35) and one Ø8 at (70, 25), all through:
 *   - holeDims picks the view that sees them end-on, puts a centre mark on each, one callout per size ("2× …" for the pair), and ordinate
 *     positions from the view's lower-left corner — X 20 and 70, Y 15, 25 and 35 (plate units, the sketch's own numbers);
 *   - sheet 'auto': 1:1 on the smallest ISO sheet that holds the views at 1:1 (this plate: A4); a 1 m long bar: A0 at the largest scale A0 allows;
 *   - part.js reads/writes `sheet: 'auto'` and `holeDims: true` (a file without them is unchanged).
 *   node tools/partcraft-test/test-drawing-auto.mjs   (or runDrawingAutoTests() from bin/test-partcraft.mjs)
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runDrawingAutoTests({ ok, section, M = null }) {
  section('EG.20 / EG.56 PartCraft: hole dimensions and the automatic sheet (drawing.js)');
  const K = await import(DEV + 'kernel.js'), P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js'), D = await import(DEV + 'drawing.js');
  const I18N = await import(DEV + 'i18n.js');
  try { const fs = await import('node:fs'); I18N.init({ strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) }); } catch { /* optional */ }
  if (!M) { const { default: Module } = await import(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')); M = await Module(); M.setup(); }
  const part = P.newPart('Plate'), sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 50]);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
  const a = S.newSketch(); S.addPoint(a, 20, 15); S.addPoint(a, 20, 35);
  const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: a });
  P.addFeature(part, 'hole', { sketch: s2.id, kind: 'simple', d: 6, through: true });
  const b = S.newSketch(); S.addPoint(b, 70, 25);
  const s3 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: b });
  P.addFeature(part, 'hole', { sketch: s3.id, kind: 'simple', d: 8, through: true });
  const r = K.regenerate(part, M);
  const holes = D.partHoles(part, r);
  ok(holes && holes.length === 3, `three holes found on the mesh kernel (${holes?.length})`);
  const data = D.meshViews(r.mesh, { M });
  const sheet = D.composeSheet(data, { name: 'Plate', drawing: { holeDims: true }, holes });
  const hd = sheet.holeDims;
  ok(hd && hd.holes === 3 && hd.sizes === 2, `holeDims: 3 holes in 2 sizes on the ${hd?.view} view`);
  const xs = hd ? hd.xs.join() : '', ys = hd ? hd.ys.join() : '';
  ok(xs === '20,70' && ys === '15,25,35', `ordinate positions from the view's corner: X ${xs}; Y ${ys}`);
  const callouts = sheet.texts.filter((x) => /Ø|⌀|THRU|thru|through/i.test(x.text)).map((x) => x.text);
  ok(callouts.some((x) => /^2× /.test(x)) && callouts.length >= 2, 'one callout per size, the pair as "2× …": ' + callouts.join(' | '));
  const plain = D.composeSheet(data, { name: 'Plate', drawing: {}, holes });
  ok(!plain.holeDims && plain.texts.length < sheet.texts.length, 'without holeDims nothing changes');
  // the automatic sheet
  const auto = D.composeSheet(data, { name: 'Plate', drawing: { sheet: 'auto' }, holes });
  ok(auto.paper === 'a4' && auto.scale === 1, `sheet "auto" for the plate: ${auto.paper.toUpperCase()} at ${auto.scale === 1 ? '1:1' : auto.scale}`);
  const long = P.newPart('Bar'), sk2 = S.newSketch(); S.addRect(sk2, [0, 0], [1000, 80]);
  const f2 = P.addFeature(long, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk2 }); P.addFeature(long, 'extrude', { sketch: f2.id, depth: 40 });
  const dl = D.meshViews(K.regenerate(long, M).mesh, { M });
  const al = D.composeSheet(dl, { name: 'Bar', drawing: { sheet: 'auto' } });
  const best = D.sheetScale(dl.views, 'a0');
  ok(al.scale === Math.min(1, best) && D.AUTO_PAPERS.indexOf(al.paper) === D.AUTO_PAPERS.findIndex((k) => D.sheetScale(dl.views, k) >= al.scale), `a 1 m bar: ${al.paper.toUpperCase()} at 1:${+(1 / al.scale).toFixed(3)} (the largest standard scale up to 1:1, on the smallest sheet giving it)`);
  // the file
  part.drawing = { sheet: 'auto', holeDims: true };
  const back = P.readPart(P.toJSON(part));
  ok(back.drawing && back.drawing.sheet === 'auto' && back.drawing.holeDims === true, 'the part file keeps sheet "auto" and holeDims');
  let bad = false; try { P.readPart(JSON.stringify({ ...JSON.parse(P.toJSON(part)), drawing: { holeDims: 'yes' } })); } catch { bad = true; }
  ok(bad, 'a holeDims that is not true/false is refused (untrusted file)');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (process.argv.includes('--verbose')) console.log('  ok  ', m); } else { fail++; console.log('FAIL', m); } };
  await runDrawingAutoTests({ ok, section: (s) => console.log('\n== ' + s) });
  console.log(`\ndrawing-auto: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
