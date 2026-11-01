#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * format08.mjs — known answers for the file's length precision and dimension text size (0.8 D8.6, session model-08):
 * units.js setLengthPrecision / formatLength, infer.js setDimTextSize / dimTextBox, model-info.js cleanFormat.
 *
 *   node tools/modelcraft-test/format08.mjs      on its own
 *   run({ok, close, section, APP})               from bin/test-modelcraft.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

export async function run({ ok, section, APP }) {
  const U = await import(pathToFileURL(path.join(APP, 'units.js')));
  const I = await import(pathToFileURL(path.join(APP, 'infer.js')));
  const M = await import(pathToFileURL(path.join(APP, 'model-info.js')));
  const F = U.formatLength, IN = U.IN;

  section('Length precision (0.8 D8.6): units.js setLengthPrecision');
  U.setLengthPrecision(null);
  ok(F(IN * 6.5, 'ft-in') === '6 1/2"', 'default: 6 1/2"');
  ok(F(IN * (12 + 1 / 16), 'ft-in') === `1' 1/16"`, 'default keeps 1/16"');
  ok(F(1.23456, 'mm') === '1234.6 mm', 'default mm: 1 decimal');
  U.setLengthPrecision(2);
  ok(F(IN * (12 + 1 / 16), 'ft-in') === `1' 0"`, `1/2" precision rounds 12 1/16" to 1' 0": ${F(IN * (12 + 1 / 16), 'ft-in')}`);
  ok(F(IN * 6.3, 'in') === '6 1/2"', '6.3" at 1/2 = 6 1/2"');
  ok(F(1.23456, 'mm') === '1234.56 mm', '2 decimal places in mm');
  ok(F(1.23456, 'm') === '1.23 m', '2 decimal places in m');
  U.setLengthPrecision(0);
  ok(F(1.23456, 'mm') === '1235 mm', '0 decimals in mm');
  U.setLengthPrecision(64);
  ok(F(IN * 6.5078125, 'in') === '6 33/64"', '1/64" precision: 6 33/64"');
  ok(F(1.23456, 'mm') === '1234.6 mm', 'a fraction setting leaves decimal units as they were');
  U.setLengthPrecision(3);
  ok(F(IN * 6.3, 'in') === '6 5/16"', 'decimals count (3) leaves feet-and-inches at 1/16"');
  U.setLengthPrecision(7);
  ok(U.lengthPrecision() === null, 'an unknown value is the default');
  U.setLengthPrecision(null);

  section('Dimension text size (0.8 D8.6): infer.js setDimTextSize');
  I.setDimTextSize(12);
  const b12 = I.dimTextBox([100, 100], '10 mm');
  I.setDimTextSize(24);
  const b24 = I.dimTextBox([100, 100], '10 mm');
  ok(b24.h === 2 * b12.h && b24.w > b12.w, 'the box grows with the text');
  ok(Math.abs(b24.x + b24.w / 2 - 100) < 1e-9 && Math.abs(b24.y + b24.h / 2 - 100) < 1e-9, 'and stays centred on the point');
  I.setDimTextSize(99);
  ok(I.dimTextSize() === 12, 'out of range = 12');
  I.setDimTextSize(12);

  section('The file\'s format key (0.8 D8.6): model-info.js cleanFormat');
  const c = M.cleanFormat;
  ok(JSON.stringify(c({ precision: 8, dimSize: 16, textHeight: 0.25 })) === '{"precision":8,"dimSize":16,"textHeight":0.25}', 'a good one is kept');
  ok(c({ precision: 5.5, dimSize: 100, textHeight: -1 }) === null, 'bad numbers are dropped, nothing left = null');
  ok(c({ precision: 7 }) === null && c({ precision: 3 })?.precision === 3, '7 is neither a fraction nor decimals; 3 is');
  ok(c(null) === null && c([1]) === null && c('x') === null, 'not an object = null');
  ok(JSON.stringify(c({ precision: 2, extra: 'x' })) === '{"precision":2}', 'unknown keys are dropped');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
  await run({ ok, section: (s) => console.log('\n== ' + s), APP: path.join(ROOT, 'public_html/assets/apps/modelcraft/dev') });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
