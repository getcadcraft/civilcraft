/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-idf.mjs — the LC.20 item 8 SPIKE's IDF (tools/bim-ops/idf-spike.mjs; session bim-ops): the hand-worked room E1 written as
 * an EnergyPlus input file and checked for shape (zones, surfaces closed and facing out, the window inside its wall). With
 * EP_NATIVE=<path to energyplus> (the v26.2.0 release, outside the repo; never on the default path) it also runs EnergyPlus on
 * the design days and compares its zone heating load with energy-bim.js's. Part of ops-test.mjs (`--ops --only idf`).
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { energyBuilding } from './ops-energy.mjs';

export default async function idfPart({ APP, ROOT, WebIFC, ok, near, open }) {
  console.log('== LC.20 spike: an EnergyPlus IDF from the model');
  const E = await import(path.join(APP, 'energy-bim.js'));
  const D = await import(path.join(APP, 'daylight-bim.js'));
  const S = await import(path.join(APP, 'daylight-bim-sky.js'));
  const { idfFromModel } = await import(path.join(ROOT, 'tools/bim-ops/idf-spike.mjs'));
  const ed = await open(energyBuilding({ site: true }));
  const g = D.gatherRooms(WebIFC, ed.api, ed.mid, { keep: true });
  const e = E.gatherEnergy(WebIFC, ed.api, ed.mid, g);
  const uMap = E.uValues(WebIFC, ed.api, ed.mid, [...e.ids]);
  const out = idfFromModel(WebIFC, ed.api, ed.mid, { g, e, uMap, inputs: {}, site: S.siteOf(ed.api, ed.mid), name: 'E1', E });
  const objs = out.text.split(/;\s*\n/).map((x) => x.replace(/^(!.*\n)+/gm, '').trim()).filter(Boolean);
  const of = (type) => objs.filter((o) => o.startsWith(type + ','));
  const surf = of('BuildingSurface:Detailed').map((o) => o.split(/,\s*\n\s*/).map((x) => x.trim()));
  ok(out.zones === 1 && surf.length === 6 && out.windows === 1 && out.skipped.length === 0, 'E1 as an IDF: one zone, six faces (each face\'s two triangles merged into one polygon), one window, nothing skipped', JSON.stringify(out.skipped));
  const bc = surf.map((x) => x[2] + ':' + x[6]).sort().join(' ');
  ok(bc === 'Floor:Ground Roof:Outdoors Wall:Outdoors Wall:Outdoors Wall:Outdoors Wall:Outdoors', 'boundaries: the floor on the ground, the roof and four walls outdoors', bc);
  // every polygon counter-clockwise seen from outside (Newell normal away from the room's centre), as GlobalGeometryRules says
  // a surface's fields after split: [0] object type, [1] name, [2] surface type … [6] outside boundary, [11] vertex count, [12…] x y z
  const verts = (x, at, n) => Array.from({ length: n }, (_, i) => [0, 1, 2].map((k) => Number(x[at + i * 3 + k])));
  const newell = (P) => { const v = [0, 0, 0]; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; v[0] += (a[1] - b[1]) * (a[2] + b[2]); v[1] += (a[2] - b[2]) * (a[0] + b[0]); v[2] += (a[0] - b[0]) * (a[1] + b[1]); } return v; };
  const cen = surf.flatMap((x) => verts(x, 12, Number(x[11]))).reduce((s, p, i, all) => s.map((v, k) => v + p[k] / all.length), [0, 0, 0]);
  ok(surf.every((x) => { const P = verts(x, 12, Number(x[11])), n = newell(P), c = P.reduce((s, p) => s.map((v, k) => v + p[k] / P.length), [0, 0, 0]); return n[0] * (c[0] - cen[0]) + n[1] * (c[1] - cen[1]) + n[2] * (c[2] - cen[2]) > 0; }), 'every face counter-clockwise seen from outside');
  const area = (P) => { const n = newell(P); return Math.hypot(...n) / 2; };
  ok(near(surf.filter((x) => x[2] === 'Wall').reduce((s, x) => s + area(verts(x, 12, 4)), 0), 45, 1e-6) && near(surf.filter((x) => x[2] === 'Floor').reduce((s, x) => s + area(verts(x, 12, Number(x[11]))), 0), 20, 1e-6), 'faces 45 m² of wall, 20 m² of floor (the room\'s own surface)');
  const win = of('FenestrationSurface:Detailed')[0].split(/,\s*\n\s*/).map((x) => x.trim());
  const wp = verts(win, 10, 4);   // [0] is the object type
  ok(near(area(wp), 3, 1e-6) && /Wall/.test(win[4]), 'the window: 3 m² (2.0 × 1.5), on its wall', win[4]);
  ok(/Material:NoMass,\s*\n\s*C wall:0\.3 R,\s*\n\s*MediumRough,\s*\n\s*3\.1633/.test(out.text) && /WindowMaterial:SimpleGlazingSystem,\s*\n\s*Glazing,\s*\n\s*1\.4,\s*\n\s*0\.6,\s*\n\s*0\.7;/.test(out.text), 'constructions: walls R = 1/0.3 − 0.17 = 3.1633 m²K/W; the glazing U 1.4, g 0.6, T 0.7');
  const ep = process.env.EP_NATIVE;
  if (!ep || !fs.existsSync(ep)) { console.log('  --   EP_NATIVE not set: EnergyPlus not run (the spike runs it by hand; docs/spikes/LC.20-energyplus.md)'); return; }
  const dir = fs.mkdtempSync(path.join(ROOT, 'tmp', 'ops-idf-'));
  try {
    fs.writeFileSync(path.join(dir, 'in.idf'), out.text);
    let log = '';
    try { log = execFileSync(ep, ['-D', '-d', dir, path.join(dir, 'in.idf')], { encoding: 'utf8', timeout: 120000 }); } catch (x) { log = String(x.stdout || '') + String(x.stderr || ''); }
    const err = fs.existsSync(path.join(dir, 'eplusout.err')) ? fs.readFileSync(path.join(dir, 'eplusout.err'), 'utf8') : log;
    const severe = (err.match(/\*\* Severe {2}\*\*/g) || []).length, fatal = /\*\*  Fatal  \*\*/.test(err);
    ok(!fatal && severe === 0 && /EnergyPlus Completed Successfully/.test(err), 'native EnergyPlus 26.2 reads the IDF and completes: 0 severe errors', (err.match(/\*\* (Severe|Fatal).*$/gm) || []).slice(0, 4).join(' | '));
    const eio = fs.existsSync(path.join(dir, 'eplusout.eio')) ? fs.readFileSync(path.join(dir, 'eplusout.eio'), 'utf8') : '';
    const sizing = eio.split('\n').filter((l) => /^ Zone Sizing Information,/.test(l)).map((l) => l.split(',').map((x) => x.trim()));
    const heat = sizing.find((x) => x[2] === 'Heating');
    const cool = sizing.find((x) => x[2] === 'Cooling');
    const W = (x) => Number(x?.[3]);   // Calc Des Load {W}
    const ours = E.loads(e, uMap, {})[0];
    const dh = (W(heat) - ours.heat.total) / ours.heat.total;
    console.log(`  ..   EnergyPlus design heating ${W(heat).toFixed(1)} W (ours ${ours.heat.total.toFixed(1)} W, ${(dh * 100).toFixed(1)} %); design cooling ${W(cool).toFixed(1)} W`);
    ok(Number.isFinite(W(heat)) && Math.abs(dh) < 0.05, `its design heating load is within 5 % of energy-bim.js's 755.2 W (${W(heat).toFixed(1)} W, ${(dh * 100).toFixed(1)} %): the two agree on the physics they share`);
    // the showcase house: a real drawn model through EnergyPlus
    const hed = await open(fs.readFileSync(path.resolve(APP, '../../../../../fixtures/showcase/bimcraft-house.ifc')));
    const hg = D.gatherRooms(WebIFC, hed.api, hed.mid, { keep: true }), he = E.gatherEnergy(WebIFC, hed.api, hed.mid, hg);
    const hu = E.uValues(WebIFC, hed.api, hed.mid, [...he.ids]);
    const hout = idfFromModel(WebIFC, hed.api, hed.mid, { g: hg, e: he, uMap: hu, inputs: {}, site: null, name: 'Showcase house', E });
    const hdir = path.join(dir, 'house');
    fs.mkdirSync(hdir);
    fs.writeFileSync(path.join(hdir, 'in.idf'), hout.text);
    try { execFileSync(ep, ['-D', '-d', hdir, path.join(hdir, 'in.idf')], { encoding: 'utf8', timeout: 120000 }); } catch { /* the err file says */ }
    const herr = fs.existsSync(path.join(hdir, 'eplusout.err')) ? fs.readFileSync(path.join(hdir, 'eplusout.err'), 'utf8') : '';
    const hz = fs.existsSync(path.join(hdir, 'eplusout.eio')) ? fs.readFileSync(path.join(hdir, 'eplusout.eio'), 'utf8').split('\n').filter((l) => /^ Zone Sizing Information,.*Heating/.test(l)).length : 0;
    const ours5 = E.loads(he, hu, {}).reduce((t, r) => t + r.heat.total, 0);
    const theirs5 = fs.existsSync(path.join(hdir, 'eplusout.eio')) ? fs.readFileSync(path.join(hdir, 'eplusout.eio'), 'utf8').split('\n').filter((l) => /^ Zone Sizing Information,/.test(l)).map((l) => l.split(',').map((x) => x.trim())).filter((x) => x[2] === 'Heating').reduce((t, x) => t + Number(x[3]), 0) : NaN;
    console.log(`  ..   showcase house: ${hout.zones} zones, ${hout.surfaces} surfaces, ${hout.windows} windows, skipped: ${hout.skipped.length}; EnergyPlus heating ${theirs5.toFixed(0)} W, ours ${ours5.toFixed(0)} W`);
    ok(/EnergyPlus Completed Successfully/.test(herr) && !(herr.match(/\*\* Severe {2}\*\*/g) || []).length && hz === 5, 'the showcase house too: 5 zones sized by EnergyPlus, 0 severe errors', (herr.match(/\*\* (Severe|Fatal).*$/gm) || []).slice(0, 3).join(' | '));
  } finally { if (process.env.OPS_KEEP) fs.cpSync(dir, process.env.OPS_KEEP, { recursive: true }); fs.rmSync(dir, { recursive: true, force: true }); }
}
