#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-fixtures.mjs — the small public files bin/test-agents.mjs uses (made here, no customer drawings):
 *   fixtures/job.takeoff.json   a TakeoffCraft project built with the app's own model: a 1/4" = 1'-0" sheet, a 40 LF wall
 *                               (8 ft high, one assembly component), a 12 × 10 ft floor area, 3 outlets, one unscaled mark.
 *   node tools/mcp/test/make-fixtures.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from '../../cli/headless/apps.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const { Takeoff } = await load('takeoffcraft', 'model.js');
const t = new Takeoff();
const A = 'a'.repeat(64), B = 'b'.repeat(64);
t.addFile({ hash: A, name: 'Plan.pdf', size: 1000, pages: 1 });
t.addFile({ hash: B, name: 'Details.pdf', size: 1000, pages: 1 });
const sheet = A + ':0';
t.setScale(sheet, { method: 'preset', ftPerUnit: 4 / 72, preset: 'arch-1/4', label: '1/4" = 1\'-0"', cal: null });   // 72 pt = 1 in = 4 ft
const wall = t.addItem({ name: 'Partition wall', type: 'linear', unit: 'LF', heightFt: 8, mat: 125000, lab: 80000 });   // $12.50 / $8.00 per LF
t.addComponent(wall, { name: 'Drywall sheets', unit: 'EA', formula: 'ceil(A*2/32)', mat: 150000, lab: 0 });
const floor = t.addItem({ name: 'Floor tile', type: 'area', unit: 'SF', mat: 40000, lab: 30000 });
const outlet = t.addItem({ name: 'Duplex outlet', type: 'count', unit: 'EA', mat: 25000, lab: 450000 });
const ft = (f) => f * 18;   // points per foot at 1/4"
t.addMark({ item: wall, sheet, pts: [{ x: 0, y: 0 }, { x: ft(30), y: 0 }, { x: ft(30), y: ft(10) }] });   // 40 LF
t.addMark({ item: floor, sheet, pts: [{ x: 0, y: 0 }, { x: ft(12), y: 0 }, { x: ft(12), y: ft(10) }, { x: 0, y: ft(10) }] });   // 120 SF
for (const x of [10, 20, 30]) t.addMark({ item: outlet, sheet, pts: [{ x, y: 5 }] });
t.addMark({ item: wall, sheet: B + ':0', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }] });   // a sheet with no scale: listed, never counted
t.state.name = 'Fixture job';
const json = JSON.stringify(t.toJSON('2026-10-13T00:00:00.000Z'), null, 1) + '\n';
const out = path.join(HERE, 'fixtures', 'job.takeoff.json');
if (process.argv.includes('--check')) {
  const same = fs.existsSync(out) && fs.readFileSync(out, 'utf8') === json;
  console.log(same ? 'fixtures up to date' : 'fixtures differ: run without --check');
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(out, json);
console.log('wrote ' + path.relative(process.cwd(), out));
