#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-detention.mjs — CivilCraft 0.8 EG.12: detention ponds (detention.js), DOM-free, in Node.
 *
 * Known answers:
 *  - Curve number runoff by hand: P 100 mm, CN 80 -> S = 63.5 mm, Ia = 12.7, Q = (87.3)² / (100 + 50.8) = 50.54 mm.
 *  - SCS triangular unit hydrograph: the volume of the hydrograph equals runoff depth × area; the peak rises with the area.
 *  - Rational: 0.5 × 100 mm/h × 10 ha / 360 = 1.3889 m³/s.
 *  - Stage–storage of a pond with side slopes: V(h) = A0·h + P0·m·h²/2 + π·m²·h³/3; a 20 × 10 m floor, side 3, 2 m deep
 *    -> 400 + 2·... (see code) and the table form (frustum) agrees with it to a fraction of a percent.
 *  - Outlets: orifice Cd·A·√(2g(h − D/2)); weir Francis; V-notch 90° = 1.38·H^2.5 (8/15·0.58·√(2g) = 1.3716).
 *  - Routing: a linear reservoir (O = S/K) fed a constant inflow I rises as I(1 − e^{−t/K}); the routed outflow peak meets the falling inflow;
 *    mass balance: in − out = change in storage.
 *   node bin/test-civilcraft-detention.mjs [--build dev|x.y]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const D = await import(pathToFileURL(path.join(APP, 'detention.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);
const g = 9.80665;

near(D.runoffDepth(100, 80), 87.3 ** 2 / 150.8, 0.01, 'CN runoff by hand'); near(D.runoffDepth(10, 80), 0, 1e-12, 'below initial abstraction no runoff');
// SCS hydrograph volume
const h1 = D.scsHydrograph({ area: 1e6, cn: 80, tc: 30, rain: 50, duration: 120, dt: 5 });
near(h1.depth, D.runoffDepth(100, 80), 0.01, 'hydrograph depth = runoff depth'); near(h1.volume / 1e6 * 1000, h1.depth, h1.depth * 0.01, 'hydrograph volume = depth × area (1%)');
const h2 = D.scsHydrograph({ area: 2e6, cn: 80, tc: 30, rain: 50, duration: 120, dt: 5 }); near(h2.peak / h1.peak, 2, 1e-9, 'peak scales with area');
const rt = D.rationalHydrograph({ c: 0.5, area: 1e5, intensity: 100, tc: 20, duration: 30, dt: 1 }); near(rt.peak, 1.3889, 1e-3, 'rational peak');
// stage storage
const bottom = 100, A0 = 200, P0 = 60, m = 3, H = 2;
const ss = D.stageStorage({ kind: 'slopes', bottom, area0: A0, perimeter0: P0, side: m, top: bottom + H, step: 0.1 });
near(ss[ss.length - 1].storage, A0 * H + (P0 * m * H * H) / 2 + (Math.PI * m * m * H ** 3) / 3, 1e-9, 'sloped pond volume by formula');
const tab = D.stageStorage({ kind: 'table', rows: ss.map((r) => ({ z: r.z, area: r.area })) });
near(tab[tab.length - 1].storage / ss[ss.length - 1].storage, 1, 0.002, 'contour-area table agrees with the formula');
// ground storage: a cone-shaped dip of radius 10 and depth 2: V = π r² h /3 = 209.44
const cone = { elevationAt: (x, y) => Math.min(2, Math.hypot(x, y) * 0.2) };
const gs = D.groundStorage(cone, [{ x: -20, y: -20 }, { x: 20, y: -20 }, { x: 20, y: 20 }, { x: -20, y: 20 }], { bottom: 0, top: 2, step: 0.5, cell: 0.25 });
near(gs[gs.length - 1].storage, 2 * Math.PI * 100 - Math.PI * 100 * 2 * (2 / 3) + 0, 5, 'cone dip volume (π·r²·h/3 below the rim, r = 10): ' + gs[gs.length - 1].storage);
// outlets
const A = Math.PI * 0.15 ** 2;
near(D.outletFlow([{ kind: 'orifice', invert: 0, diameter: 0.3 }], 2), 0.6 * A * Math.sqrt(2 * g * 1.85), 1e-9, 'orifice');
near(D.outletFlow([{ kind: 'orifice', invert: 0, diameter: 0.3 }], 0.3), 0.6 * A * Math.sqrt(2 * g * 0.15), 1e-9, 'orifice just covered');
near(D.outletFlow([{ kind: 'orifice', invert: 0, diameter: 0.3 }], 0), 0, 0, 'orifice dry');
near(D.outletFlow([{ kind: 'weir', crest: 1, length: 2 }], 1.5), 1.84 * (2 - 0.2 * 2 * 0.5) * 0.5 ** 1.5, 1e-9, 'rect weir');
near(D.outletFlow([{ kind: 'vnotch', invert: 0, angle: 90 }], 0.4), (8 / 15) * 0.58 * Math.sqrt(2 * g) * 0.4 ** 2.5, 1e-9, 'V-notch');
near(D.outletFlow([{ kind: 'spillway', crest: 2, length: 10 }], 2.3), 1.66 * 10 * 0.3 ** 1.5, 1e-9, 'broad-crested spillway');
ok(D.outletFlow([{ kind: 'orifice', invert: 0, diameter: 0.3 }, { kind: 'weir', crest: 1, length: 2 }], 1.5) > D.outletFlow([{ kind: 'orifice', invert: 0, diameter: 0.3 }], 1.5), 'devices add');
// linear reservoir, step inflow
{
  const K = 3600, I = 2, dtm = 1, n = 241, inflow = new Array(n).fill(I);
  const r = D.routeTable(inflow, dtm, { s: [0, 1e5], o: [0, 1e5 / K] });
  const i = 60;   // t = K
  near(r.q[i] / (I * (1 - Math.exp(-1))), 1, 0.003, 'linear reservoir at t = K');
  near(r.q[n - 1] / (I * (1 - Math.exp(-(n - 1) * 60 / K))), 1, 0.003, 'linear reservoir later');
}
// a real pond: routed triangle
{
  const hy = D.scsHydrograph({ area: 5e5, cn: 85, tc: 25, rain: 60, duration: 60, dt: 2 });
  const st = D.stageStorage({ kind: 'slopes', bottom: 100, area0: 3000, perimeter0: 220, side: 3, top: 103, step: 0.1 });
  const dev = [{ kind: 'orifice', invert: 100, diameter: 0.25 }, { kind: 'spillway', crest: 102.5, length: 6 }];
  const r = D.routePond(hy.q, hy.dt, st, dev, { z0: 100 });
  ok(r.peakOut < r.peakIn, 'the pond cuts the peak: ' + r.peakOut.toFixed(3) + ' of ' + r.peakIn.toFixed(3));
  ok(r.attenuation > 0.2, 'attenuation ' + r.attenuation.toFixed(2));
  // the outflow peaks where it meets the inflow's falling limb
  const iPk = r.q.indexOf(r.peakOut); near(r.q[iPk], hy.q[iPk], r.peakOut * 0.06, 'outflow peak meets the inflow');
  // mass: in - out = storage change
  near(r.volumeIn - r.volumeOut, r.storage[r.storage.length - 1] - r.s0, r.volumeIn * 0.01, 'mass balance of the routing');
  const small = D.sizeOrifice(hy.q, hy.dt, st, { target: 1.2, z0: 100, devices: [{ kind: 'spillway', crest: 102.9, length: 6 }] });
  ok(small.met && Math.abs(small.peakOut - 1.2) < 0.005, 'sized orifice holds the peak: dia ' + small.diameter.toFixed(3) + ' peak ' + small.peakOut.toFixed(4));
  ok(D.sizeOrifice(hy.q, hy.dt, st, { target: 0.25, z0: 100, devices: [{ kind: 'spillway', crest: 102.9, length: 6 }] }).met === false, 'a pond smaller than the runoff volume cannot meet 0.25 m3/s: says so');
  const bad = D.checkPond(r, { top: 101, target: 0.01 });
  ok(bad.some((p) => p.code === 'overtop') && bad.some((p) => p.code === 'over-target'), 'checks flag overtop and over-target');
  ok(D.checkPond({ ...r, drawdown: 100 * 60 }, { drawdownMax: 72 * 60 }).some((p) => p.code === 'draindown'), 'draw-down too long');
  ok(D.checkPond({ ...r, drawdown: 3 * 60, attenuation: 0.5, zMax: 101 }, { top: 103, target: 5 }).length === 0, 'a good pond has no findings');
}
// a saved pond: the same pond in feet and in metres routes the same water
{
  const ft = { name: 'P', area: 10, cn: 85, tc: 25, storm: { mode: 'uniform', depth: 3, duration: 60 }, storage: { bottom: 100, area0: 8000, perimeter0: 360, side: 3, top: 106 }, devices: [{ kind: 'orifice', invert: 100, diameter: 0.5 }, { kind: 'spillway', crest: 105, length: 10 }] };
  const L = 0.3048, m = { name: 'P', area: 10 * 4046.8564224, cn: 85, tc: 25, storm: { mode: 'uniform', depth: 76.2, duration: 60 }, storage: { bottom: 100 * L, area0: 8000 * L * L, perimeter0: 360 * L, side: 3, top: 106 * L }, devices: [{ kind: 'orifice', invert: 100 * L, diameter: 0.5 * L }, { kind: 'spillway', crest: 105 * L, length: 10 * L }] };
  const a = D.runPond(ft, 'ft'), b = D.runPond(m, 'm');
  near(a.route.peakOut / b.route.peakOut, 1, 1e-6, 'peak out, feet vs metres'); near(a.hydro.volume / b.hydro.volume, 1, 1e-6, 'runoff volume, feet vs metres'); near(a.route.zMax / b.route.zMax, 1, 1e-6, 'top level');
  ok(a.show.peakOut > 0 && a.show.capacity > 0, 'display numbers in project units');
  ok(D.cleanPond({ area: -5, cn: 400, devices: [{ kind: 'nonsense' }] }, 'ft').cn === 80 && D.cleanPond({ devices: [] }, 'ft').devices.length === 2, 'untrusted input is cleaned');
  const idf = D.runPond({ ...ft, storm: { mode: 'idf', depth: 3, duration: 60 } }, 'ft', { hydro: { idf: { a: 60, b: 10, c: 0.75 } } });
  ok(idf && idf.hydro.peak > 0, 'an IDF storm runs');
}
console.log(`detention: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
