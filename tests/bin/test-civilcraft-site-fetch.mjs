#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-site-fetch.mjs — CivilCraft 0.8 EG.63: the open-data add-ons for Address to site (site-fetch.js + addons/site-*), DOM-free, in Node.
 * NO live network: every service answer is a recorded-shape fixture handed to a fake fetch. Checks: nothing is fetched until a source is pressed,
 * https only, the request each source builds (URL, bounding box, POST body), the parse of each answer, the 24 h cache, errors, and that a fetched
 * flood layer and OSM buildings flow through the existing siteAt().
 *   node bin/test-civilcraft-site-fetch.mjs [--build dev]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', arg('--build') || 'dev');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const F = await mod('site-fetch.js'), S = await mod('site-sources.js'), { readGeoJSON } = await mod('geojson.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const AD = ['site-geocode-osm', 'site-fema-flood', 'site-osm-buildings', 'site-usgs-elevation', 'site-ssurgo-soil', 'site-county-parcels'];
const SRC = {};
for (const id of AD) {
  const m = JSON.parse(fs.readFileSync(path.join(APP, 'addons', id, 'addon.json'), 'utf8'));
  ok(m.id === id && m.default === 'off' && m.apps.includes('civilcraft') && m.api, id + ': manifest, off by default');
  ok(JSON.parse(fs.readFileSync(path.join(APP, 'addons/index.json'), 'utf8')).addons.includes(id), id + ': in the bundled list');
  ok(!!m.description.match(/only when you press/), id + ': says it asks only on a press');
  SRC[id] = (await mod(`addons/${id}/lib/source.js`)).SOURCE;
  ok(SRC[id].id && SRC[id].licence && SRC[id].where && SRC[id].needs, id + ': source states licence, where, needs');
}
// nothing fetched on activation
let calls = [];
const fake = (answers) => async (url, init) => { calls.push({ url, init }); const a = answers(url, init); return { ok: a.status ? a.status < 400 : true, status: a.status || 200, text: async () => a.body }; };
for (const id of AD) { const main = fs.readFileSync(path.join(APP, 'addons', id, 'main.js'), 'utf8'); ok(!/fetch\(/.test(main), id + ': main.js never fetches'); }
const un = F.registerSource(SRC['site-fema-flood']); ok(F.sources().length === 1, 'registered'); un(); ok(F.sources().length === 0, 'unregistered');
const store = () => { const m = new Map(); return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => m.set(k, v) }; };
const lat = 40.0005, lon = -104.9995;

// geocode
let r = await F.runSource(SRC['site-geocode-osm'], { address: '12 Elm St, Boulder' }, { fetchFn: fake(() => ({ body: JSON.stringify({ status: 'success', data: { found: true, lat: 40.0005, lon: -104.9995, label: '12 Elm Street, Boulder', cached: false, attribution: '© OpenStreetMap contributors, ODbL' } }) })), store: store() });
ok(r.ok && Math.abs(r.result.point.lat - 40.0005) < 1e-9 && /Boulder/.test(r.result.point.label), 'geocode: point read');
ok(calls[0].url.startsWith('https://getcadcraft.com/api/v1/geocode?q=') && calls[0].url.includes('q=12%20Elm%20St%2C%20Boulder') && calls[0].init.credentials === 'omit' && !/nominatim/i.test(calls[0].url), 'geocode: https request to OUR proxy (never to Nominatim itself), address URL-encoded, no credentials');
r = await F.runSource(SRC['site-geocode-osm'], { address: 'zzzz' }, { fetchFn: fake(() => ({ body: JSON.stringify({ status: 'success', data: { found: false, lat: null, lon: null, label: '' } }) })), store: store() }); ok(r.ok && r.result.info[0].key === 'nomatch', 'geocode: no match said');
r = await F.runSource(SRC['site-geocode-osm'], { address: 'zzzz' }, { fetchFn: fake(() => ({ body: '[]' })), store: store() }); ok(!r.ok && r.why === 'parse', 'geocode: an answer that is not ours is a parse failure');
r = await F.runSource(SRC['site-geocode-osm'], { address: '  ' }, { fetchFn: fake(() => ({ body: '[]' })), store: store() }); ok(!r.ok && r.why === 'need', 'geocode: empty address refused');

// FEMA
calls = [];
const femaBody = JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { FLD_ZONE: 'AE', ZONE_SUBTY: 'FLOODWAY', SFHA_TF: 'T', STATIC_BFE: 1612.5 }, geometry: { type: 'Polygon', coordinates: [[[-105.001, 39.999], [-104.998, 39.999], [-104.998, 40.001], [-105.001, 40.001], [-105.001, 39.999]]] } }] });
r = await F.runSource(SRC['site-fema-flood'], { lat, lon, radius: 150 }, { fetchFn: fake(() => ({ body: femaBody })), store: store() });
ok(r.ok && r.result.kind === 'flood', 'fema: flood layer');
ok(calls[0].url.startsWith('https://hazards.fema.gov/arcgis/rest/services/public/NFHL/MapServer/28/query?') && /geometry=-105\.00\d+,39\.99\d+,-104\.99\d+,40\.00\d+/.test(calls[0].url) && calls[0].url.includes('f=geojson'), 'fema: envelope request');
const flood = readGeoJSON(r.result.geojson, r.result.name).layers[0];
ok(S.guessKind(flood)?.kind === 'flood', 'fema: layer recognised by siteAt');
const site = S.siteAt([{ kind: 'flood', layer: flood }], { x: lon, y: lat, radius: 150, geographic: true });
ok(site.flood.sfha && site.flood.atPoint === 'AE' && site.flood.bfe === 1612.5, 'fema: point is in AE, BFE 1612.5');
r = await F.runSource(SRC['site-fema-flood'], { lat, lon }, { fetchFn: fake(() => ({ body: '{"error":{"code":400}}' })), store: store() }); ok(!r.ok && r.why === 'parse', 'fema: service error body → parse failure');

// OSM buildings
calls = [];
const ring = (x, y) => [{ lat: y, lon: x }, { lat: y, lon: x + 0.00005 }, { lat: y + 0.00005, lon: x + 0.00005 }, { lat: y + 0.00005, lon: x }, { lat: y, lon: x }];
const ovp = JSON.stringify({ elements: [{ type: 'way', id: 1, tags: { building: 'house', 'building:levels': '2' }, geometry: ring(-104.9996, 40.0004) }, { type: 'way', id: 2, tags: { building: 'yes', height: '9.5' }, geometry: ring(-104.9990, 40.0004) }, { type: 'way', id: 3, tags: { highway: 'x' }, geometry: [{ lat: 1, lon: 1 }, { lat: 2, lon: 2 }] }, { type: 'node', id: 4 }] });
r = await F.runSource(SRC['site-osm-buildings'], { lat, lon, radius: 150 }, { fetchFn: fake(() => ({ body: ovp })), store: store() });
ok(r.ok && JSON.parse(r.result.geojson).features.length === 2, 'osm: two closed building ways, open ways and nodes skipped');
ok(calls[0].init.method === 'POST' && calls[0].url === 'https://overpass-api.de/api/interpreter' && decodeURIComponent(calls[0].init.body).includes('way["building"]('), 'osm: Overpass POST with the bounding box');
const bl = readGeoJSON(r.result.geojson, r.result.name).layers[0];
const s2 = S.siteAt([{ kind: 'buildings', layer: bl }], { x: lon, y: lat, radius: 150, geographic: true });
ok(s2.buildings.length === 2 && s2.buildings.some((b) => b.record.levels === 2) && s2.buildings.some((b) => b.record.height === 9.5), 'osm: levels and height reach siteAt');

// USGS elevation, SSURGO
r = await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: fake((u) => ({ body: '{"value": 1623.4567, "rasterId": 1}' })), store: store() });
ok(r.ok && r.result.info[0].key === 'elevation' && r.result.info[0].value === 1623.46 && calls.at(-1).url.includes('x=-104.999500&y=40.000500'), 'usgs: elevation in metres, rounded');
r = await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: fake(() => ({ body: '{"value": -1000000}' })), store: store() }); ok(r.result.info[0].key === 'noelev', 'usgs: no-data value said, not shown as a height');
r = await F.runSource(SRC['site-ssurgo-soil'], { lat, lon }, { fetchFn: fake(() => ({ body: '{"Table":[["100001","Cb","Colby silt loam, 3 to 5 percent slopes"]]}' })), store: store() });
ok(r.result.info[0].value.symbol === 'Cb' && r.result.info[0].value.mukey === '100001', 'ssurgo: map unit read'); const sb = JSON.parse(calls.at(-1).init.body); ok(sb.query.includes('POINT(-104.999500 40.000500)') && sb.format === 'JSON', 'ssurgo: query asks about the point only');
r = await F.runSource(SRC['site-ssurgo-soil'], { lat, lon }, { fetchFn: fake(() => ({ body: '{}' })), store: store() }); ok(r.result.info[0].key === 'nosoil', 'ssurgo: nothing found said');

// county parcels
const { layerUrl } = await mod('addons/site-county-parcels/lib/source.js');
ok(layerUrl('https://gis.example.gov/arcgis/rest/services/Parcels/MapServer/0') === 'https://gis.example.gov/arcgis/rest/services/Parcels/MapServer/0', 'parcels: layer address kept');
ok(layerUrl('https://gis.example.gov/x/FeatureServer/3/query?f=json') === 'https://gis.example.gov/x/FeatureServer/3', 'parcels: query part stripped');
ok(layerUrl('http://gis.example.gov/x/MapServer/0') === null && layerUrl('https://u:p@gis.example.gov/x/MapServer/0') === null && layerUrl('https://gis.example.gov/anything') === null && layerUrl('javascript:alert(1)') === null, 'parcels: http, credentials, non-layer and junk refused');
calls = [];
r = await F.runSource(SRC['site-county-parcels'], { lat, lon, url: 'http://gis.example.gov/x/MapServer/0' }, { fetchFn: fake(() => ({ body: '{}' })), store: store() }); ok(!r.ok && r.why === 'https' && !calls.length, 'parcels: http address refused before any request');
r = await F.runSource(SRC['site-county-parcels'], { lat, lon, url: '' }, { fetchFn: fake(() => ({ body: '{}' })), store: store() }); ok(!r.ok && r.why === 'need' && !calls.length, 'parcels: no address → nothing sent');
const pc = JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { APN: '123-45-678', OWNER: 'A. Person', SITUS: '12 Elm St' }, geometry: { type: 'Polygon', coordinates: [[[-105, 40], [-104.999, 40], [-104.999, 40.001], [-105, 40.001], [-105, 40]]] } }] });
r = await F.runSource(SRC['site-county-parcels'], { lat, lon, url: 'https://gis.example.gov/x/MapServer/0' }, { fetchFn: fake(() => ({ body: pc })), store: store() });
const pl = readGeoJSON(r.result.geojson, r.result.name).layers[0], s3 = S.siteAt([{ kind: 'parcels', layer: pl }], { x: lon, y: lat, radius: 150, geographic: true });
ok(s3.parcel?.record.id === '123-45-678' && s3.parcel.record.address === '12 Elm St', 'parcels: parcel at the point read');

// cache, errors, https
calls = []; const st = store(), ff = fake(() => ({ body: '{"value": 10}' }));
await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: ff, store: st, now: 1000 });
r = await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: ff, store: st, now: 1000 + 3600e3 }); ok(r.cached && calls.length === 1, 'cache: the second press within 24 h asks nobody');
r = await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: ff, store: st, now: 1000 + 25 * 3600e3 }); ok(!r.cached && calls.length === 2, 'cache: after 24 h it asks again');
r = await F.runSource(SRC['site-usgs-elevation'], { lat: lat + 1, lon }, { fetchFn: ff, store: st, now: 1000 }); ok(!r.cached && calls.length === 3, 'cache: another point is another request');
r = await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: fake(() => ({ status: 503, body: '' })), store: store() }); ok(!r.ok && r.why === 'http' && r.status === 503, 'error: HTTP status said');
r = await F.runSource(SRC['site-usgs-elevation'], { lat, lon }, { fetchFn: async () => { throw new Error('offline'); }, store: store() }); ok(!r.ok && r.why === 'network', 'error: offline said');
r = await F.runSource(SRC['site-usgs-elevation'], { lat: NaN, lon }, { fetchFn: ff, store: store() }); ok(!r.ok && r.why === 'need', 'error: no point → nothing sent');
r = await F.runSource({ ...SRC['site-usgs-elevation'], request: () => ({ url: 'http://epqs.example/x' }) }, { lat, lon }, { fetchFn: ff, store: store() }); ok(!r.ok && r.why === 'https', 'a source that builds an http request is refused');
const ui = fs.readFileSync(path.join(APP, 'eg-ui.js'), 'utf8'); ok(/runSource\(x,/.test(ui) && /onclick: \(\) => pressSource\(x\)/.test(ui) && !/runSource\([^)]*\)\s*;?\s*\n\s*\/\/ start/.test(ui), 'window: a service is asked from a button press');
console.log(`site-fetch: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
