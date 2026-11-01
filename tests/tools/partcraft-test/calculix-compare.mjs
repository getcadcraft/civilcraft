#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Compare a CalculiX run with PartCraft's own answer for the same deck (SU.891).
//   ccx -i bar-bilinear            (writes bar-bilinear.frd next to the .inp)
//   node tools/partcraft-test/calculix-compare.mjs testfiles/generated/calculix/bar-bilinear.expected.json bar-bilinear.frd
// Reads the DISP block of the .frd (calculix.js parseFrd), averages D1 over the deck's end nodes and prints it beside
// PartCraft's value and the closed-form one. Exit 1 when CalculiX differs from PartCraft by more than `tolerance`.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const DEV = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../public_html/assets/apps/partcraft/dev/');
const { parseFrd } = await import(DEV + 'calculix.js');
const [expFile, frdFile] = process.argv.slice(2);
if (!expFile || !frdFile) { console.error('usage: calculix-compare.mjs <name>.expected.json <name>.frd'); process.exit(2); }
const exp = JSON.parse(fs.readFileSync(expFile, 'utf8')), frd = parseFrd(fs.readFileSync(frdFile, 'utf8'));
const blk = [...frd.blocks].reverse().find((b) => b.name === 'DISP');
if (!blk) { console.error('no DISP block in ' + frdFile); process.exit(2); }
const cx = exp.endNodes.reduce((s, id) => s + blk.values.get(id)[0], 0) / exp.endNodes.length;
const d = cx / exp.endDisplacementX - 1;
console.log(`${exp.deck}: CalculiX ${cx.toExponential(6)} mm, PartCraft ${exp.endDisplacementX.toExponential(6)} mm (${(d * 100).toFixed(3)} %), closed form ${exp.analytic.toExponential(6)} mm`);
process.exit(Math.abs(d) <= exp.tolerance ? 0 : 1);
