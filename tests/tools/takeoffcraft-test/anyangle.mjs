#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** anyangle.mjs — 0.8 EG.67 rest (session takeoff_PART_3): Count everything finds a symbol drawn at any angle. node tools/takeoffcraft-test/anyangle.mjs [--verbose] */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev'), VERBOSE = process.argv.includes('--verbose');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const Lg = await load('legend.js'), Mt = await load('match.js');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok  ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const canvas = (w, h) => ({ data: new Float32Array(w * h), w, h });
const put = (c, x, y, v) => { if (x >= 0 && y >= 0 && x < c.w && y < c.h) c.data[y * c.w + x] = Math.max(c.data[y * c.w + x], v); };
const px = (c, x, y) => { const fx = Math.floor(x), fy = Math.floor(y), ax = x - fx, ay = y - fy; put(c, fx, fy, (1 - ax) * (1 - ay) * 1.6); put(c, fx + 1, fy, ax * (1 - ay) * 1.6); put(c, fx, fy + 1, (1 - ax) * ay * 1.6); put(c, fx + 1, fy + 1, ax * ay * 1.6); };
const line = (c, x0, y0, x1, y1) => { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)) * 2; for (let i = 0; i <= n; i++) px(c, x0 + (x1 - x0) * i / n, y0 + (y1 - y0) * i / n); };
// an arrow: not round, not square, no mirror symmetry that a right-angle turn would reproduce
const arrow = (c, x, y) => { line(c, x, y + 12, x + 26, y + 12); line(c, x + 26, y + 12, x + 18, y + 5); line(c, x + 26, y + 12, x + 18, y + 19); line(c, x + 4, y + 4, x + 4, y + 12); };
const tpl = (() => { const c = canvas(40, 30); arrow(c, 6, 2); return Mt.trim ? Mt.trim(c) : c; })();
console.log('Any angle');
const plain = Lg.distinctTurns(tpl), any = Lg.distinctTurns(tpl, true);
ok(plain.length === 4 && plain.join() === '0,180,90,270', 'right angles: four turns for an arrow', plain.join());
ok(any.length > 12 && any.length <= 24 && any[0] === 0, 'any angle: up to every 15 degrees', any.join());
const round = (() => { const c = canvas(24, 24); for (let a = 0; a < 720; a++) px(c, 12 + 9 * Math.cos(a * Math.PI / 360), 12 + 9 * Math.sin(a * Math.PI / 360)); return c; })();
ok(Lg.distinctTurns(round, true).length === 1, 'a round symbol needs one search at any angle too');
// a sheet with the arrow at 0, 90 and 45 degrees (the last is only found with any angle)
const sheet = canvas(300, 200);
const place = (deg, cx, cy) => { const r = Mt.rotate(tpl, deg); for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) put(sheet, Math.round(cx - r.w / 2) + x, Math.round(cy - r.h / 2) + y, r.data[y * r.w + x]); };
place(0, 60, 50); place(90, 160, 60); place(45, 100, 140); place(200, 230, 150);
const find = (turns) => Lg.searchSheet(sheet, [{ key: 'a', tpl, floor: 0.6, turns }]).a;
const near = (hits, cx, cy) => hits.some((h) => Math.abs(h.x + h.w / 2 - cx) < 12 && Math.abs(h.y + h.h / 2 - cy) < 12);
const rightHits = find(plain), anyHits = find(any);
ok(near(rightHits, 60, 50) && near(rightHits, 160, 60), 'right angles find the arrow at 0 and 90 degrees');
ok(!near(rightHits, 100, 140), 'right angles do not find it at 45 degrees', JSON.stringify(rightHits.map((h) => [Math.round(h.x + h.w / 2), Math.round(h.y + h.h / 2), +h.score.toFixed(2)])));
ok(near(anyHits, 100, 140) && near(anyHits, 230, 150) && near(anyHits, 60, 50) && near(anyHits, 160, 60), 'any angle finds all four (0, 90, 45 and 200 degrees)', JSON.stringify(anyHits.map((h) => [Math.round(h.x + h.w / 2), Math.round(h.y + h.h / 2), +h.score.toFixed(2)])));
const kept = Lg.keepBest(anyHits.map((h) => ({ entry: 'a', sheet: 's', ...h })), () => 0.7).kept;
ok(kept.length === 4, 'after keeping the best of overlapping finds there are exactly four', String(kept.length));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
