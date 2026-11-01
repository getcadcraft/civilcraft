#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-site-sources.mjs — CivilCraft 0.8 EG.63: address to site (site-sources.js), DOM-free, in Node.
 *
 * Fixtures are made up here in the shapes the open sources publish (field names from their public descriptions): a county parcel layer, a zoning
 * layer, SSURGO-style soil units, FEMA-style flood zones and OpenStreetMap-style buildings, all GeoJSON in longitude/latitude, read through the
 * app's own GeoJSON reader. By hand: the parcel is 0.001° x 0.001° at 40°N, so 85.27 m x 111.32 m = 9 493 m²; zoning R-1 covers its west 30 %,
 * C-2 the east 70 %; soils split 50/50 by a north-south line; the flood zone AE covers its south-east quarter (0.5 x 0.5 = 25 %).
 *   node bin/test-civilcraft-site-sources.mjs [--build dev|x.y]
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
const { readGeoJSON } = await mod('geojson.js');
const S = await mod('site-sources.js');
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const near = (a, b, tol, m) => ok(Math.abs(a - b) <= tol, `${m}: ${a} vs ${b} (±${tol})`);

const lon0 = -105, lat0 = 40, d = 0.001;
const box = (x0, y0, x1, y1) => [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]];
const fc = (features) => JSON.stringify({ type: 'FeatureCollection', features });
const poly = (coords, properties) => ({ type: 'Feature', properties, geometry: { type: 'Polygon', coordinates: coords } });
const read = (text, name) => readGeoJSON(text, name).layers[0];
const P = box(lon0, lat0, lon0 + d, lat0 + d);
const parcels = read(fc([poly(P, { APN: '123-45-678', OWNER: 'A. Person', SITUS: '12 Elm St', ACRES: 2.35, LANDUSE: 'Residential' }), poly(box(lon0 + d, lat0, lon0 + 2 * d, lat0 + d), { APN: '123-45-679' }), poly(box(lon0 - 5, lat0 - 5, lon0 - 4, lat0 - 4), { APN: 'far away' })]), 'parcels');
const zoning = read(fc([poly(box(lon0 - d, lat0 - d, lon0 + 0.3 * d, lat0 + 2 * d), { ZONING: 'R-1', ZONEDESC: 'Single family' }), poly(box(lon0 + 0.3 * d, lat0 - d, lon0 + 3 * d, lat0 + 2 * d), { ZONING: 'C-2', ZONEDESC: 'Commercial' })]), 'zoning');
const soils = read(fc([poly(box(lon0 - d, lat0 - d, lon0 + 0.5 * d, lat0 + 2 * d), { MUSYM: 'Cb', MUKEY: '100001', AREASYMBOL: 'CO001' }), poly(box(lon0 + 0.5 * d, lat0 - d, lon0 + 3 * d, lat0 + 2 * d), { MUSYM: 'Dx', MUKEY: '100002', AREASYMBOL: 'CO001' })]), 'soils');
const flood = read(fc([poly(box(lon0 + 0.5 * d, lat0 - d, lon0 + 3 * d, lat0 + 0.5 * d), { FLD_ZONE: 'AE', ZONE_SUBTY: 'FLOODWAY', SFHA_TF: 'T', STATIC_BFE: 1612.5 }), poly(box(lon0 - d, lat0 - d, lon0 + 0.5 * d, lat0 + 2 * d), { FLD_ZONE: 'X', SFHA_TF: 'F' })]), 'flood');
const bl = (x, y, props) => poly(box(x, y, x + 0.00005, y + 0.00005), props);
const buildings = read(fc([bl(lon0 + 0.4 * d, lat0 + 0.4 * d, { building: 'house', 'building:levels': '2' }), bl(lon0 + 1.4 * d, lat0 + 0.4 * d, { building: 'yes', height: '9.5' }), bl(lon0 + 40 * d, lat0, { building: 'yes' })]), 'buildings');

ok(S.guessKind(parcels)?.kind === 'parcels', 'parcels recognised: ' + JSON.stringify(S.guessKind(parcels)));
ok(S.guessKind(zoning)?.kind === 'zoning', 'zoning recognised'); ok(S.guessKind(soils)?.kind === 'soils', 'soils recognised'); ok(S.guessKind(flood)?.kind === 'flood', 'flood recognised'); ok(S.guessKind(buildings)?.kind === 'buildings', 'buildings recognised');
const layers = [parcels, zoning, soils, flood, buildings].map((layer) => ({ layer }));
const site = S.siteAt(layers, { x: lon0 + 0.45 * d, y: lat0 + 0.55 * d, radius: 150, geographic: true });
ok(site.parcel?.record.id === '123-45-678', 'parcel at the point'); ok(site.parcel.record.owner === 'A. Person' && site.parcel.record.address === '12 Elm St', 'owner and address read');
near(site.parcel.area, 85.27 * 111.32, 40, 'parcel area (m²)');
ok(site.neighbours === 1, 'one neighbour within the radius (the far parcel is out): ' + site.neighbours);
ok(site.buildings.length === 2, 'two buildings within 150 m, the far one left out: ' + site.buildings.length);
ok(site.buildings[0].record.levels === 2 && site.buildings[1].record.height === 9.5, 'building levels and height read');
ok(site.buildings[0].d <= site.buildings[1].d, 'nearest first');
const r1 = site.zoning.find((z) => z.code === 'R-1'), c2 = site.zoning.find((z) => z.code === 'C-2');
near(r1.share, 0.3, 0.03, 'R-1 share of the parcel'); near(c2.share, 0.7, 0.03, 'C-2 share'); ok(c2.desc === 'Commercial', 'zoning description');
near(site.soils.find((s) => s.symbol === 'Cb').share, 0.5, 0.03, 'soil Cb share'); near(site.soils.find((s) => s.symbol === 'Dx').share, 0.5, 0.03, 'soil Dx share');
ok(site.flood.sfha === true, 'the parcel is partly in the special flood hazard area'); near(site.flood.share, 0.25, 0.03, 'flood share = the south-east quarter'); ok(site.flood.bfe === 1612.5, 'base flood elevation read');
ok(site.flood.atPoint === 'X', 'the point itself is in zone X: ' + site.flood.atPoint);
ok(site.missing.length === 0, 'nothing missing');
// without the flood and soils layers
const part = S.siteAt([parcels, zoning].map((layer) => ({ layer })), { x: lon0 + 0.5 * d, y: lat0 + 0.5 * d, radius: 150, geographic: true });
ok(part.missing.includes('flood') && part.missing.includes('soils') && part.flood === null, 'missing layers are said, not guessed');
// a point on no parcel
const off = S.siteAt(layers, { x: lon0 + 10 * d, y: lat0 + 10 * d, radius: 50, geographic: true });
ok(off.parcel === null && off.notes.includes('no-parcel-at-point'), 'no parcel at a point outside every parcel');
// override field names, project units
const odd = { fields: [{ name: 'weird' }], geom: 'pg', features: [{ g: { t: 'pg', c: [[[[0, 0], [10, 0], [10, 10], [0, 10], [0, 0]]]] }, p: { weird: 'Q-9' } }] };
const o2 = S.siteAt([{ kind: 'zoning', layer: odd, fields: { code: 'weird' } }], { x: 5, y: 5, radius: 20 });
ok(o2.zoning[0]?.code === 'Q-9' && o2.zoning[0].share === 1, 'a layer the person labels, fields they name');
const rows = S.siteRows(site);
ok(rows.some((r) => r.key === 'parcel') && rows.some((r) => r.key === 'flood') && rows.filter((r) => r.key === 'zoning').length === 2, 'rows for the UI');
ok(S.SOURCES.every((s) => s.id && s.kinds.length && s.licence && s.where), 'every registered source says its licence and where it is'); ok(S.SOURCES.every((s) => s.checked === false), 'none claims to be checked against a real download');
const bx = S.lonLatBox(40, -105, 1000); near((bx.maxY - bx.minY) * 111320, 2000, 1, 'lon/lat box height');
// 0.8 EG.63 (civil_PART_4): the items the site-context file is made from
{
  const ring = [[-105, 40], [-104.9998, 40], [-104.9998, 40.0002], [-105, 40.0002], [-105, 40]];
  const items = S.contextItems([
    { kind: 'buildings', layer: { geom: 'pg', fields: [{ name: 'height' }, { name: 'name' }], features: [{ g: { t: 'pg', c: [[ring]] }, p: { height: '12.5 m', name: 'Barn' } }, { g: { t: 'pt', c: [0, 0] }, p: {} }] } },
    { kind: 'flood', layer: { geom: 'pg', fields: [{ name: 'FLD_ZONE' }], features: [{ g: { t: 'pg', c: [[ring]] }, p: { FLD_ZONE: 'AE' } }] } },
    { kind: '', layer: { geom: 'pg', fields: [{ name: 'nothing_known' }], features: [{ g: { t: 'pg', c: [[ring]] }, p: {} }] } }]);
  ok(items.length === 2 && items[0].kind === 'building' && items[0].height === 12.5 && items[0].name === 'Barn' && items[0].rings[0].length === 5, 'contextItems: a building with its height read from "12.5 m"; points and unknown layers left out');
  ok(items[1].kind === 'flood' && items[1].label === 'AE' && items[1].height === null, 'contextItems: the flood zone label');
}
console.log(`site-sources: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
