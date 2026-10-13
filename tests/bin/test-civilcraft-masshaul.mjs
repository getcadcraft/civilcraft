#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-masshaul.mjs — CivilCraft 0.4 V24: the mass-haul diagram (masshaul.js), DOM-free, in Node.
 *
 *   node bin/test-civilcraft-masshaul.mjs [--build dev|x.y] [--verbose]
 *
 * By hand, sections every 100 ft: cut 1,000 and 1,000 cu ft, then fill 1,800 and 600, cut shrinking 10 % (factor 0.90):
 * mass ordinates 0, 900, 1,800, 0, −600. A balance point at 3+00; 0+00–3+00 moves 1,800 cu ft up station, average haul
 * 270,000 ÷ 1,800 = 150 ft; after 3+00 nothing balances: 600 is borrow. An open end: the balance line at its level. With 2,000 of fill at 3+00 the curve crosses
 * zero at 2+90 instead. A swell factor; a balanced job; the CSV; the corridor's real sections through buildSections.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const MH = await mod('masshaul.js');
const PJ = await mod('project.js');
const SEC = await mod('sections.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const rows = (vols) => vols.map(([c, f], i) => ({ sta: i * 100, cutVol: c, fillVol: f }));

section('worked by hand');
{
  const r = MH.massHaul(rows([[0, 0], [1000, 0], [1000, 0], [0, 1800], [0, 600]]), { factor: 0.9 });
  ok(JSON.stringify(r.points.map((p) => +p.m.toFixed(6))) === '[0,900,1800,0,-600]', 'mass ordinates 0, 900, 1,800, 0, −600');
  ok(JSON.stringify(r.balance) === '[300]', 'a balance point at 3+00');
  ok(r.spans.length === 1, 'one stretch: the last 600 short is borrow, nothing balances after 3+00');
  const [a] = r.spans;
  ok(a.from === 0 && a.to === 300 && Math.abs(a.volume - 1800) < 1e-9 && a.dir === 'ahead', '0+00 to 3+00: 1,800 moved up station');
  near(a.haul, 150, 1e-9, 'average haul 270,000 ÷ 1,800 = 150 ft');
  // an open end: 0, 900, 1,800, 1,200 — the balance line at 1,200 meets the rising limb at 1+33.33
  const o = MH.massHaul(rows([[0, 0], [900, 0], [900, 0], [0, 600]]), { factor: 1 });
  ok(o.balance.length === 0 && o.spans.length === 1 && Math.abs(o.spans[0].volume - 600) < 1e-9, 'ending at 1,200 with a peak of 1,800: 600 moved, 1,200 waste');
  near(o.spans[0].haul, (0.5 * (200 - 400 / 3) * 600 + 0.5 * 100 * 600) / 600, 1e-9, 'its haul: the area past the balance line ÷ 600 = 83.33 ft');
  ok(o.totals.kind === 'waste' && Math.abs(o.totals.end - 1200) < 1e-9, 'and 1,200 waste');
  ok(r.totals.kind === 'borrow' && Math.abs(r.totals.end + 600) < 1e-9 && r.totals.cut === 2000 && Math.abs(r.totals.cutAdj - 1800) < 1e-9 && r.totals.fill === 2400, 'totals: 2,000 cut (1,800 after shrink), 2,400 fill, 600 borrow');
  const x = MH.massHaul(rows([[0, 0], [1000, 0], [1000, 0], [0, 2000], [0, 400]]), { factor: 0.9 });
  near(x.balance[0], 290, 1e-9, 'with 2,000 of fill: crosses zero at 2+90 (1,800 / 2,000 of the way)');
  const sw = MH.massHaul(rows([[0, 0], [1000, 0], [0, 1050]]), { factor: 1.05 });
  ok(sw.totals.kind === 'balanced' && Math.abs(sw.points[2].m) < 1e-9, 'swell 5 %: 1,000 of cut fills 1,050: balanced');
  ok(MH.massHaul(rows([[0, 0], [100, 0]]), { factor: -3 }).factor === 1, 'a factor that makes no sense: 1');
  const csv = MH.massHaulCsv(r, { units: 'ft', station: (s) => (s / 100) + '+00' }).split('\r\n');
  ok(csv[0] === 'Station,Mass ordinate (cu yd)' && csv[3] === '2+00,66.7' && csv.includes('0+00,3+00,66.7,up station,150.00') && !csv.some((l) => l.startsWith('3+00,4+00')), 'CSV in cu yd: 1,800 cu ft = 66.7 cu yd; the stretch with its haul');
}

section('a real corridor');
{
  const p = new PJ.Project();
  const pts = []; let n = 1;
  for (let x = -100; x <= 1100; x += 25) for (let y = -150; y <= 150; y += 25) pts.push({ n: String(n++), x, y, z: 100 + 3 * Math.sin(x / 80), d: 'G' });
  p.setPoints(pts, 'wave');
  p.change('road', (s) => s.alignments.push({ id: 'a1', name: 'Main', start: 0, pis: [{ x: 0, y: 0, r: 0 }, { x: 1000, y: 0, r: 0 }], pvis: [{ sta: 0, z: 101, L: 0 }, { sta: 1000, z: 101, L: 0 }],
    corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }, sampling: SEC.cleanSampling({ step: 25, left: 80, right: 80 }) }));
  const set = p.sections(p.state.alignments[0]);
  const r = MH.massHaul(set.rows, { factor: 1 });
  if (VERBOSE) console.log('  rows', set.rows.slice(0, 12).map((q) => [q.sta, Math.round(q.cutVol), Math.round(q.fillVol)].join('/')).join(' '), 'totals', set.totals);
  near(r.points.at(-1).m, set.totals.cut - set.totals.fill, 1e-6, 'the last ordinate = the sections’ cut − fill');
  ok(r.balance.length >= 2, `a road through a wave: ${r.balance.length} balance points (${r.balance.map((s) => s.toFixed(1)).join(', ')})`);
  ok(r.spans.every((s) => s.haul > 0 && s.haul <= s.to - s.from + 1e-9), 'every average haul is inside its stretch');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
