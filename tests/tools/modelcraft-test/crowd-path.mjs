#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * crowd-path.mjs — 0.8 round 3 (model_PART_3): people_add / look_set people along a line walk along it, half each way (scene-entourage.js
 * plantPeople); people on an area still face anywhere. The figures' front is −Y (lib/entourage), so a placement's front = m · (0, −1, 0).
 *   node tools/modelcraft-test/crowd-path.mjs
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const D = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev/');
const SE = await import(pathToFileURL(D + 'scene-entourage.js').href), M = await import(pathToFileURL(D + 'model.js').href);
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };
const front = (m) => { const x = -m[4], y = -m[5], l = Math.hypot(x, y); return [x / l, y / l]; };   // m · (0, −1, 0)
const m = new M.Model();
const dir = [3, 4].map((v) => v / 5);   // a path from (0, 0) to (30, 40): 50 m long
const r = m.change('crowd', (mm) => SE.plantPeople(mm, { count: 20, where: { line: [[0, 0], [30, 40]] }, seed: 9 }));
const insts = r.placed.map((id) => m.root.insts.get(id));
const dots = insts.map((i) => { const f = front(i.m); return f[0] * dir[0] + f[1] * dir[1]; });
ok(insts.length === 20, '20 people along a 50 m path', String(insts.length));
ok(dots.every((d) => Math.abs(d) > Math.cos(0.2)), 'each one faces along the path (within 11°)', dots.map((d) => d.toFixed(2)).join(' '));
const fwd = dots.filter((d) => d > 0).length;
ok(fwd > 3 && fwd < 17, 'walking both ways (' + fwd + ' one way, ' + (20 - fwd) + ' the other)');
const m2 = new M.Model();
const r2 = m2.change('crowd', (mm) => SE.plantPeople(mm, { count: 20, where: { rect: [0, 0, 30, 40] }, seed: 9 }));
const d2 = r2.placed.map((id) => { const f = front(m2.root.insts.get(id).m); return f[0] * dir[0] + f[1] * dir[1]; });
ok(d2.some((d) => Math.abs(d) < 0.7), 'on an area they face anywhere (as before)');
console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
