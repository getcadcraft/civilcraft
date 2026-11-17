#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/** test-civilcraft-utilnet.mjs — CivilCraft 0.10 SU.1810: utility networks (utilnet.js), by hand-worked numbers. */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const APP = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'public_html/assets/apps/civilcraft/dev');
const REPO = path.resolve(APP, '../../../../..');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const U = await import(pathToFileURL(path.join(APP, 'utilnet.js')).href);
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, t, m) => ok(Math.abs(a - b) <= t, `${m}: ${a} vs ${b}`);
ok(U.diameterMm('300') === 300 && Math.abs(U.diameterMm('4 in') - 101.6) < 1e-9 && U.diameterMm('0.3 m') === 300 && U.diameterMm('big') === 0, 'OSM diameter: mm unless a unit is written');
// a flat local grid stands in for the CRS: lon/lat × 1000 → metres
const toProject = (lon, lat) => ({ x: lon * 1000, y: lat * 1000 });
const osm = { elements: [
  { type: 'way', id: 1, tags: { man_made: 'pipeline', substance: 'water', diameter: '200', operator: 'City', material: 'ductile iron' }, geometry: [{ lon: 0, lat: 0 }, { lon: 0.1, lat: 0 }] },
  { type: 'way', id: 2, tags: { man_made: 'pipeline', substance: 'sewage', depth: '2' }, geometry: [{ lon: 0.05, lat: -0.05 }, { lon: 0.05, lat: 0.05 }] },
  { type: 'way', id: 3, tags: { power: 'line' }, geometry: [{ lon: 0, lat: 0 }, { lon: 1, lat: 1 }] },
  { type: 'way', id: 4, tags: { power: 'cable', location: 'underground' }, geometry: [{ lon: 0, lat: 0.01 }, { lon: 0.1, lat: 0.01 }] },
  { type: 'way', id: 5, tags: { highway: 'residential' }, geometry: [{ lon: 0, lat: 0 }, { lon: 1, lat: 1 }] },
  { type: 'node', id: 6, lat: 0.001, lon: 0.002, tags: { emergency: 'fire_hydrant' } },
  { type: 'node', id: 7, lat: 0.001, lon: 0.003, tags: { amenity: 'bench' } },
  { type: 'way', id: 8, tags: { man_made: 'pipeline', substance: 'oil' }, geometry: [{ lon: 0, lat: 0 }, { lon: 1, lat: 0 }] },
] };
const r = U.fromOverpass(osm, { toProject, units: 'm' });
ok(r.runs.length === 3 && r.nodes.length === 1, 'three runs (water, sewer, power cable), one hydrant: ' + r.runs.length + '/' + r.nodes.length);
ok(r.skipped.overground === 1 && r.skipped['way-kind'] === 1 && r.skipped['node-kind'] === 1 && r.skipped.substance === 1, 'overhead line, a road, a bench and an oil pipe are counted as skipped: ' + JSON.stringify(r.skipped));
const w = r.runs[0], s = r.runs[1];
ok(w.service === 'water' && w.size === 200 && w.owner === 'City' && w.material === 'ductile iron' && w.source === 'osm' && w.osm === 'way/1', 'tags read into the run');
near(s.depth, 2, 1e-9, 'a depth tag in metres is taken in a metric project'); near(U.fromOverpass(osm, { toProject, units: 'ft' }).runs[1].depth, 2 / 0.3048, 1e-9, '... and converted for a feet project');
ok(r.attribution.includes('OpenStreetMap'), 'attribution comes with the data');
const u = U.cleanUtilities({ runs: r.runs.map((x, i) => ({ ...x, id: 'ur' + (i + 1) })), nodes: r.nodes.map((x) => ({ ...x, id: 'un1' })), osm: { count: 4 } }, 'm');
ok(u.runs.length === 3 && u.nodes.length === 1 && u.osm.attribution === U.ATTRIBUTION, 'cleanUtilities keeps good rows and fixes the attribution');
ok(U.cleanUtilities({ runs: [{ id: 'x', service: 'water', pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }] }, { id: 'ur1', service: 'lava', pts: [] }] }).runs.length === 0, 'bad ids, services and short runs are dropped');
// crossings: water (200 mm, cover 1.2 m) along y=0 and sewer (cover 2 m) across it; ground flat at 100
const wat = { id: 'ur1', service: 'water', pts: [{ x: 0, y: 0 }, { x: 100, y: 0 }], size: 200, depth: 1.2 }, sew = { id: 'ur2', service: 'sewer', pts: [{ x: 50, y: -50 }, { x: 50, y: 50 }], size: 300, depth: 2 };
const c = U.crossings([wat, sew], 'm', { zAt: () => 100, minClear: 0.3 });
// water: top 98.8, bottom 98.6; sewer: top 98.0, bottom 97.7 -> the sewer's top (98.0) is 0.6 below the water's bottom (98.6)
ok(c.length === 1 && Math.abs(c[0].x - 50) < 1e-9 && Math.abs(c[0].y) < 1e-9, 'one crossing at 50, 0');
near(c[0].clear, 0.6, 1e-9, 'clear height between the sewer top and the water bottom'); ok(!c[0].flag, 'not flagged at 0.3 minimum');
ok(U.crossings([wat, sew], 'm', { zAt: () => 100, minClear: 1 })[0].flag, 'flagged against a 1 m minimum');
ok(U.crossings([wat, sew], 'm')[0].clear === null, 'no ground, no clearance (said, not guessed)');
const al = U.crossingsAlong([{ x: 50, y: -50, sta: 0 }, { x: 50, y: 50, sta: 100 }], [wat], 'm', { zAt: () => 100 });
near(al[0].sta, 50, 1e-9, 'crossing along an alignment at station 50'); near(al[0].top, 98.8, 1e-9, 'its top'); near(al[0].bottom, 98.6, 1e-9, 'its bottom');
// trench: 200 mm pipe, cover 1.2, clearance 0.15, bedding = clearance, slope 0.5: invert depth 1.2+0.2+0.15 = 1.55, width 0.5, top 0.5+2*0.5*1.55=2.05, area (0.5+2.05)/2*1.55
const t = U.trench(wat, 'm', { clearance: 0.15, slope: 0.5 });
near(t.depthToInvert, 1.55, 1e-9, 'trench depth'); near(t.width, 0.5, 1e-9, 'trench bottom width'); near(t.area, 1.2750 * 1.55, 1e-9, 'trench area'); near(t.volume, t.area * 100, 1e-9, 'trench volume over 100 m');
const items = U.sceneItems(u, { mmPerUnit: 1 });
ok(items.some((i) => i.layer === 'U-WATR-RUN') && items.some((i) => i.layer === 'U-WATR-NODE') && items.some((i) => i.kind === 'text' && i.text === U.ATTRIBUTION), 'service layers and the attribution line');
const m = U.ifcModel(u, 'm', { zAt: () => 100 });
ok(m.runs.length === 3 && m.nodes.length === 1 && m.runs.find((x) => x.service === 'power').cable && m.attribution, 'IFC model: runs, cable flag, node, attribution');
near(m.runs[0].a.z, 100 - 1.0 - 0.1, 1e-9, 'axis elevation = ground - cover - radius (OSM water run has the default 1.0 m cover)');
// the project file keeps it, and the IFC writer writes it
const PJ = await import(pathToFileURL(path.join(APP, 'project.js')).href), IM = await import(pathToFileURL(path.join(APP, 'ifc-civil-model.js')).href), IW = await import(pathToFileURL(path.join(APP, 'ifc-civil.js')).href);
const pr = new PJ.Project(); pr.state.units = 'm';
const pts = []; for (let i = 0; i < 11; i++) for (let j = 0; j < 11; j++) pts.push({ n: String(i * 11 + j + 1), x: 500000 + i * 10, y: 4000000 + j * 10, z: 100, d: 'GRD' });
pr.setPoints(pts, 't.csv');
pr.state.utilities = U.cleanUtilities({ runs: [{ id: 'ur1', service: 'water', pts: [{ x: 500010, y: 4000010 }, { x: 500050, y: 4000010 }, { x: 500050, y: 4000050 }], size: 200, depth: 1.2, material: 'PE', owner: 'City', source: 'osm', osm: 'way/9' }, { id: 'ur2', service: 'power', pts: [{ x: 500010, y: 4000020 }, { x: 500060, y: 4000020 }], size: 80, depth: 0.8 }], nodes: [{ id: 'un3', service: 'water', kind: 'hydrant', x: 500020, y: 4000010, depth: 0, name: 'H1', source: 'osm', osm: 'node/5' }, { id: 'un4', service: 'sewer', kind: 'manhole', x: 500030, y: 4000030, depth: 0 }], osm: { count: 3 } }, 'm');
const back2 = PJ.Project.fromJSON(JSON.parse(JSON.stringify(pr.toJSON()))).project;
ok(back2.state.utilities.runs.length === 2 && back2.state.utilities.nodes.length === 2 && back2.state.utilities.osm.attribution === U.ATTRIBUTION, 'saved in the project file and read back');
const model = IM.civilIfcModel(pr, { lat: 36, lon: -120 });
ok(model.utilities && model.utilities.runs.length === 3 && !IM.modelEmpty(model), 'IFC model: three legs, two nodes');
for (const schema of ['IFC4', 'IFC4X3_ADD2']) {
  let text = ''; try { text = IW.writeCivilIfc(model, { schema, now: new Date('2026-11-14T00:00:00Z'), seed: 'util' }).text; } catch (e) { text = 'ERR ' + e.message; }
  ok(!text.startsWith('ERR') && /IFCPIPESEGMENT/.test(text) && /IFCCABLESEGMENT/.test(text) && /IFCDISTRIBUTIONCHAMBERELEMENT/.test(text) && /IFCFIRESUPPRESSIONTERMINAL/.test(text) && text.includes('OpenStreetMap contributors'), schema + ': pipe and cable segments, chamber, hydrant, attribution in the file: ' + text.slice(0, 80));
}
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
