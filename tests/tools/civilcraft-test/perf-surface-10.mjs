#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * perf-surface-10.mjs — CivilCraft 0.10 PERF.31 / PERF.33 in Node (no browser): the surface work of opening a 500,000-point project,
 * timed one step at a time, with `uptime` beside the numbers (rule 61). Same file as tools/perf/apps2d-civil.mjs.
 *   node tools/civilcraft-test/perf-surface-10.mjs [--file path.civilcraft.json] [--build dev] [--json]
 * Steps: JSON.parse · buildSurface (the string/integer vertex keys, Delaunator) · outline() twice (the second is the memo) · contours(1) · planScene.
 * Also prints a hash of the outline loops and the contour count so a before/after pair can be compared for identical output.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const FILE = arg('--file') || '/var/www/CADCRAFT/testfiles/generated/civil/survey-500k.civilcraft.json';
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const TIN = await mod('tin.js');
const load = () => execSync('uptime').toString().trim().replace(/^.*load average: /, 'load ');
const out = {};
const step = (name, fn) => { const t0 = performance.now(); const r = fn(); const ms = performance.now() - t0; out[name] = Math.round(ms); console.log(`${name.padEnd(22)} ${ms.toFixed(0).padStart(8)} ms   (${load()})`); return r; };
console.log(`file ${FILE} (${(fs.statSync(FILE).size / 1048576).toFixed(0)} MB), build ${path.basename(APP)}, node ${process.version}`);
const obj = step('read + JSON.parse', () => JSON.parse(fs.readFileSync(FILE, 'utf8')));
const points = obj.points.map((r) => ({ n: r[0], x: r[1], y: r[2], z: r[3], d: r[4] }));
const { surface, report } = step('buildSurface', () => TIN.buildSurface({ points }));
console.log(`  ${surface.nT} triangles, ${surface.X.length} vertices, merged ${report.merged}`);
const loops = step('outline() first', () => surface.outline());
step('outline() second', () => surface.outline());
const h = crypto.createHash('sha1');
for (const l of loops) { h.update(String(l.length)); for (const p of l) h.update(p.x + ',' + p.y + ';'); }
console.log(`  outline: ${loops.length} loop(s), ${loops.reduce((a, l) => a + l.length, 0)} points, sha1 ${h.digest('hex').slice(0, 16)}`);
const cs = step('contours(1)', () => surface.contours(1));
const h2 = crypto.createHash('sha1'); for (const c of cs) { h2.update(c.z + ':' + c.pts.length + (c.closed ? 'c' : 'o')); h2.update(c.pts[0].x + ',' + c.pts[0].y); }
console.log(`  contours: ${cs.length} lines, sha1 ${h2.digest('hex').slice(0, 16)}`);
const sceneMod = await mod('scene.js');
const sc = step('planScene (500k pts)', () => sceneMod.planScene({ surface, points, contours: { list: [], interval: 1 }, breaklines: [], units: 'ft' }, { mmPerUnit: 1 }));
console.log(`  scene items ${sc.items.length}`);
if (process.argv.includes('--json')) console.log(JSON.stringify(out));
