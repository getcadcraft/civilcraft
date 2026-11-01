#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-progress.mjs — CivilCraft 0.8 EG.39: progress from surveys (progress.js), DOM-free, in Node.
 *
 * By hand: existing ground flat at 100 over x, y in 0..100 (cells 1). Design: west half (x < 50) cut to 98 -> planned cut 2 × 5 000 = 10 000; east half
 * filled to 101 -> planned fill 5 000; total 15 000. Survey 1 (1 May): west at 99, east at 100.5 -> cut done 5 000, fill done 2 500, 50 %.
 * Survey 2 (1 June): all finished -> 100 %. Survey 3: west cut to 97.5 -> over-cut 0.5 × 5 000 = 2 500. A level strip (design = existing)
 * with a pile 1 high on 10 × 10 cells -> stockpile 100. A schedule 0 % on 1 April and 100 % on 1 July gives 1 May = 32.8 % planned.
 *   node bin/test-civilcraft-progress.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const P = await import(pathToFileURL(path.join(APP, 'progress.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
const surf = (fn) => ({ elevationAt: (x, y) => (x >= 0 && x <= 100 && y >= 0 && y <= 100 ? fn(x, y) : null), stats: () => ({ bounds: { minX: 0, minY: 0, maxX: 100, maxY: 100 } }) });
const existing = surf(() => 100), design = surf((x, y) => (y >= 90 ? 100 : x < 50 ? 98 : 101));
// the strip y >= 90 is level in the design: planned cut = 2 × 50 × 90 = 9000, fill = 1 × 50 × 90 = 4500
const r0 = P.progressGrid({ existing, design, surveys: [], cell: 1 });
near(r0.planned.cut, 9000, 1, 'planned cut'); near(r0.planned.fill, 4500, 1, 'planned fill'); near(r0.planned.total, 13500, 1, 'planned total');
const s1 = surf((x, y) => (y >= 90 ? 100 : x < 50 ? 99 : 100.5)), s2 = surf((x, y) => (y >= 90 ? 100 : x < 50 ? 98 : 101));
const s3 = surf((x, y) => (y >= 90 ? 101 * (x < 10 ? 1 : 0) + 100 * (x < 10 ? 0 : 1) : x < 50 ? 97.5 : 101));
const r = P.progressGrid({ existing, design, surveys: [{ date: '2026-05-01', label: 'May', surface: s1 }, { date: '2026-06-01', label: 'June', surface: s2 }, { date: '2026-06-20', label: 'late', surface: s3 }], cell: 1, tol: 0.05, schedule: [{ date: '2026-04-01', pct: 0 }, { date: '2026-07-01', pct: 100 }] });
const [a, b, c] = r.series;
near(a.cutDone, 4500, 1, 'survey 1 cut done'); near(a.fillDone, 2250, 1, 'survey 1 fill done'); near(a.pct, 50, 0.1, 'survey 1 percent');
near(a.remainingCut, 4500, 1, 'remaining cut'); near(a.remainingFill, 2250, 1, 'remaining fill'); near(a.overCut + a.overFill + a.stockpile + a.dig, 0, 1e-6, 'nothing over-done at 50 %');
near(b.pct, 100, 1e-6, 'survey 2 complete'); near(b.within, 1, 1e-6, 'every cell within tolerance'); near(b.covered, 1, 1e-9, 'survey covers the whole region');
near(c.overCut, 0.5 * 50 * 90, 1, 'over-cut'); near(c.stockpile, 1 * 10 * 10 + 0, 2, 'a pile on the level strip (10 × 10 × 1)');
near(a.scheduled, (100 * 30) / 91, 0.01, 'scheduled percent on 1 May (30 of 91 days)'); near(a.ahead, 50 - (100 * 30) / 91, 0.01, 'ahead of schedule by the difference');
ok(r.map.cells.length === 10000, 'map has a cell per sample'); 
// forecast: 50 % on 1 May, 100 % on 1 June -> already 100; use a slower pair
const f = P.forecast([{ date: '2026-05-01', pct: 20 }, { date: '2026-05-11', pct: 40 }]);
ok(f && f.date === '2026-06-10' && f.estimate === true, 'forecast: 2 % a day from 40 % on 11 May -> 100 % on 10 June: ' + JSON.stringify(f)); near(f.perDay, 2, 1e-9, 'per day');
ok(P.forecast([{ date: '2026-05-01', pct: 40 }, { date: '2026-05-11', pct: 40 }]) === null, 'no forecast without progress'); ok(P.forecast([{ date: '2026-05-01', pct: 40 }]) === null, 'no forecast from one survey');
// a survey that reaches half the site
const half = { elevationAt: (x, y) => (x <= 50 ? s2.elevationAt(x, y) : null) };
near(P.progressGrid({ existing, design, surveys: [{ date: '2026-05-01', surface: half }], cell: 1 }).series[0].covered, 0.5, 0.01, 'half covered');
console.log(`progress: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
