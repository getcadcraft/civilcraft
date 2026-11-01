#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-telecom.mjs — CivilCraft 0.8 EG.28: radio links, towers, fibre (telecom.js), DOM-free.
 * Known answers: FSPL(1 km, 1000 MHz) = 92.44 dB and +6 dB per doubling of distance; F1 at the middle of a 10 km 5 GHz link = 17.32·√(5·5/(5·10)) = 12.25 m;
 * earth bulge at the middle of 50 km (k 4/3) = 25·25/(12.74·4/3) = 36.8 m; a flat path with 30 m masts clears; a 40 m hill in the middle blocks it and needs a taller mast;
 * link budget by hand; fibre: 20 km at 0.35 dB/km + 4 splices + 2 connectors + 3 dB margin.
 *   node bin/test-civilcraft-telecom.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const T = await import(pathToFileURL(path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev', 'telecom.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

near(T.fspl(1, 1000), 92.44, 1e-9, 'FSPL 1 km 1000 MHz'); near(T.fspl(2, 1000) - T.fspl(1, 1000), 6.0206, 1e-3, '+6 dB per doubling'); near(T.fspl(10, 5800), 20 + 20 * Math.log10(5800) + 32.44, 1e-9, 'FSPL 10 km 5.8 GHz');
near(T.fresnel(5, 5, 5), 12.25, 0.01, 'F1 mid 10 km at 5 GHz'); near(T.fresnel(5, 5, 5, 2) / T.fresnel(5, 5, 5), Math.SQRT2, 1e-12, 'second zone is √2 bigger'); near(T.earthBulge(25, 25), 36.8, 0.05, 'earth bulge 50 km');
near(T.wavelength(300), 0.99931, 1e-4, 'λ at 300 MHz');
{
  const flat = Array.from({ length: 41 }, (_, i) => ({ d: i * 0.25, z: 100 }));
  const r = T.losProfile(flat, { hA: 30, hB: 30, f: 5 }); ok(r.clear, 'flat 10 km with 30 m masts clears 60 % F1'); near(r.min.d, 5, 0.25, 'tightest in the middle');
  near(r.min.clearance, 30 - T.earthBulge(5, 5), 1e-9, 'mid clearance = mast − bulge');
  const hill = flat.map((p) => ({ ...p, z: p.d === 5 ? 140 : p.z })); const h = T.losProfile(hill, { hA: 30, hB: 30, f: 5 }); ok(!h.clear && h.min.clearance < 0, 'a 40 m hill blocks the path');
  const need = T.mastHeightFor(hill, { hB: 30, f: 5 }); ok(need > 30, 'a taller mast is needed: ' + need); ok(T.losProfile(hill, { hA: need, hB: 30, f: 5 }).clear, 'and it clears');
  ok(T.losProfile(flat, { hA: 30, hB: 30, f: 5, clutter: 25 }).clear === false, 'clutter on the path reduces the clearance');
}
{ const b = T.linkBudget({ pt: 20, gt: 30, gr: 30, lossCableA: 1, lossCableB: 1, dKm: 10, fMHz: 5800, other: 2, sensitivity: -85 });
  near(b.pr, 20 + 60 - 2 - T.fspl(10, 5800) - 2, 1e-9, 'received power'); near(b.margin, b.pr + 85, 1e-9, 'fade margin'); }
{
  const f = T.fibreBudget({ lengthKm: 20, alpha: 0.35, splices: 4, spliceLoss: 0.1, connectors: 2, connectorLoss: 0.5, margin: 3, budget: 14 });
  near(f.loss, 7 + 0.4 + 1 + 3, 1e-9, 'fibre loss'); near(f.headroom, 14 - 11.4, 1e-9, 'headroom'); near(f.maxKm, (14 - 1 - 3 - 0.4) / 0.35, 1e-9, 'longest run');
  const r = T.fibreRoute([{ x: 0, y: 0 }, { x: 3000, y: 0 }, { x: 3000, y: 4000 }], { slack: 0.02, spare: 50, spliceEvery: 2000, handholeEvery: 500 });
  near(r.length, 7000, 1e-9, 'route length'); near(r.cable, 7000 * 1.02 + 100, 1e-9, 'cable to order'); near(r.splices, 3, 0, 'splices'); near(r.handholes, 15, 0, 'hand holes');
}
{
  const w = T.windLoad([{ area: 0.5, h: 30 }, { area: 1, h: 20, cd: 1.5 }], { v: 40, rho: 1.225 }); const q = 0.5 * 1.225 * 1600;
  near(w.q, q, 1e-9, 'dynamic pressure'); near(w.shear, q * (0.5 * 1.2 + 1.5), 1e-6, 'shear'); near(w.moment, q * (0.6 * 30 + 1.5 * 20), 1e-6, 'overturning moment');
  const t = T.terrainAlong((x, y) => x / 100 + y * 0, { x: 0, y: 0 }, { x: 10000, y: 0 }, 10); near(t[10].d, 10, 1e-9, 'terrain list length'); near(t[10].z, 100, 1e-9, 'terrain height at the end');
}
console.log(`telecom: ${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
