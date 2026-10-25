#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-nest.mjs — 0.6 LC.17 in PartCraft: flat parts nested on sheets (nest-ui.js on the shared engine, dev/nest/nest.js).
 * A sheet metal bracket (plate + 90° flange + a hole in each) laid flat on the exact kernel → one nesting part whose area is the
 * flat pattern's to 1e-9 (outline, bend strip, holes); seven copies nested on a plate with the exact re-check; the copy of the
 * engine byte-identical to lib/nest; DXF outlines in inches turned into mm; the settings clamped; the summary rows.
 *   node tools/partcraft-test/test-nest.mjs [--verbose]    (or runNestTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runNestTests({ ok, section, oc, skip = (m) => console.log('  skip ' + m) }) {
  const I18N = await import(DEV + 'i18n.js');
  I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const NU = await import(DEV + 'nest-ui.js');
  const N = await import(DEV + 'nest/nest.js');
  const rel = (a, b, r = 1e-9) => Math.abs(a - b) <= r * Math.max(1, Math.abs(b));

  section('LC.17 nesting: the engine copy, settings, DXF outlines');
  ok(fs.readFileSync(DEV + 'nest/nest.js', 'utf8') === fs.readFileSync(path.join(REPO, 'lib/nest/nest.js'), 'utf8'), 'dev/nest/nest.js is the repo\'s lib/nest copy (tools/nest/sync.mjs)');
  const s = NU.readSettings({ kind: 'roll', w: -5, h: '1500', count: 2.7, margin: 'x', spacing: 3, step: 33, mirror: 1 });
  ok(s.kind === 'roll' && s.w === 1 && s.h === 1500 && s.count === 2 && s.margin === NU.DEFAULTS.margin && s.spacing === 3 && s.step === NU.DEFAULTS.step && s.mirror === true, 'settings clamped: a bad step and margin fall back, counts are whole');
  {
    // a DXF in inches: a 4 × 2 in plate with a Ø1 in hole → mm
    const P = (pairs) => pairs.map(([c, v]) => c + '\n' + v).join('\n');
    const text = P([[0, 'SECTION'], [2, 'HEADER'], [9, '$INSUNITS'], [70, 1], [0, 'ENDSEC'], [0, 'SECTION'], [2, 'ENTITIES'],
      [0, 'LWPOLYLINE'], [8, '0'], [90, 4], [70, 1], [10, 0], [20, 0], [10, 4], [20, 0], [10, 4], [20, 2], [10, 0], [20, 2],
      [0, 'CIRCLE'], [8, '0'], [10, 1], [20, 1], [40, 0.5], [0, 'ENDSEC'], [0, 'EOF']]) + '\n';
    const r = NU.outlineParts(text, 'Plate');
    ok(r.scale === 25.4 && r.parts.length === 1 && r.parts[0].loops.length === 2 && r.parts[0].name === 'Plate 1', 'a DXF in inches: one plate with its hole, named after the file');
    ok(rel(N.regionArea(r.parts[0].loops), (8 - Math.PI * 0.25) * 25.4 * 25.4), '… its area in mm² (×25.4²)');
    ok(r.notes.some((n) => /in inches/.test(n)), '… and says the units were changed: ' + r.notes.join(' '));
  }

  section('LC.17 nesting: a sheet metal flat pattern on plates (exact kernel)');
  if (!oc) { skip('no exact kernel here'); return; }
  const S = await import(DEV + 'sketch.js');
  const P = await import(DEV + 'part.js');
  const FL = await import(DEV + 'sheet-flat.js');
  const front = { kind: 'base', name: 'front' };
  const sketchOn = (part, draw) => { const sk = S.newSketch(); draw(sk); return P.addFeature(part, 'sketch', { plane: front, sketch: sk }); };
  const part = P.newPart('Bracket');
  let top = null;
  const sk = sketchOn(part, (q) => { S.addRect(q, [0, 0], [100, 60]); top = q.entities.filter((e) => e.type === 'line')[2].id; });
  const base = P.addFeature(part, 'sheetbase', { sketch: sk.id, t: 2, r: 2, k: 0.44 });
  P.addFeature(part, 'sheetflange', { edge: { faces: [`${base.id}.end`, `${base.id}.side:${top}`], at: [50, 60, 2] }, angle: 90, length: 20 });
  const hs = sketchOn(part, (q) => S.addCircle(q, [30, 30], 5));
  P.addFeature(part, 'extrude', { sketch: hs.id, op: 'cut', end: 'mid', depth: 10 });
  const fl = FL.sheetFlat(part, oc);
  const one = NU.flatToPart(fl, 'Bracket', 7);
  const BA = (Math.PI / 2) * (2 + 0.44 * 2);
  ok(one && one.loops.length === 2 && one.qty === 7, 'the flat pattern → one part: its outline and the hole');
  ok(one && rel(N.regionArea(one.loops), fl.area, 1e-9) && rel(fl.area, 100 * (60 + BA + 20) - Math.PI * 25, 1e-9), `… area = the flat pattern's, 100 × (60 + BA + 20) − 25π = ${fl.area.toFixed(6)}`);
  const run = NU.runNest([one], { kind: 'plate', w: 400, h: 250, margin: 10, spacing: 5, step: 90 }, { timeLimit: 8000 });
  const { result, sheet } = run;
  ok(result.placed.length === 7 && !result.unplaced.length, `seven brackets placed on ${result.sheets.length} plate(s) of 400 × 250`);
  ok(!N.checkNest(result, sheet, { spacing: 5 }).length, '… none closer than 5 mm, none in the 10 mm margins (exact)');
  ok(result.sheets.length === 1, '… all on one plate (turned, 4 × 2 fit in 380 × 230)');
  const rows = NU.summary(run);
  ok(rows.some(([k, v]) => k === 'Plates used' && v === '1') && rows.some(([k]) => k === 'Material used'), 'summary rows: plates used, material used');
  // one plate on hand, twelve wanted: the area alone allows at most 10 (380 × 230 / area)
  const short = NU.runNest([{ ...one, qty: 12 }], { kind: 'plate', w: 400, h: 250, count: 1, margin: 10, spacing: 5, step: 90 });
  const cap = Math.floor(380 * 230 / fl.area);
  ok(short.result.placed.length >= 8 && short.result.placed.length <= cap && short.result.unplaced.length === 12 - short.result.placed.length && short.result.unplaced.every((u) => u.why === 'no_room'), `one plate on hand: ${short.result.placed.length} placed (at most ${cap} by area), the rest listed as no room`);
  ok(NU.summary(short).some(([k, v]) => k === 'Not placed' && /Bracket/.test(v)), '… and the summary names them');
  ok(!N.checkNest(short.result, short.sheet, { spacing: 5 }).length, '… exact check clean');
  const dxf = N.nestDxf(result, sheet, { units: 'mm' });
  const back = N.readOutlines(dxf, { skipLayers: ['SHEET', 'LABELS'] });
  ok(back.parts.length === 7 && back.parts.every((p) => p.loops.length === 2 && rel(N.regionArea(p.loops), fl.area, 1e-6)), 'the DXF read back: seven brackets, each with its hole and the same area');
  // grain along the sheet: every copy as drawn or turned round, never across
  const g = NU.runNest([{ ...one, grain: 'along' }], { kind: 'plate', w: 400, h: 250, margin: 10, spacing: 5, step: 90 });
  ok(g.result.placed.every((p) => Math.abs(Math.sin(p.rot)) < 1e-12), 'grain along the sheet: no copy turned across it');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (m) => console.log(m);
  let oc = null;
  try {
    const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
    oc = await occtInit({ print: () => {}, printErr: () => {} });
  } catch (e) { console.log('  (no exact kernel: ' + e.message + ')'); }
  await runNestTests({ ok, section, oc });
  console.log(`nest (PartCraft): ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
