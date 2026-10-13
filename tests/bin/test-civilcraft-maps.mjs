#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-maps.mjs — CivilCraft's map layers, the DOM-free half (civilcraft/<build>/basemap.js), in Node.
 *
 *   node bin/test-civilcraft-maps.mjs [--build dev|x.y] [--verbose]
 *
 * Tile maths against known tiles and the OSM wiki formula; tile planning (cap, middle first); WMS 1.1.1 / 1.3.0 and WMTS
 * capabilities — hand-written fixtures (inheritance, axis order, a northing-first tile matrix set) and real answers saved
 * from public servers in tools/civilcraft-test/fixtures/maps/ (sources.json has each URL and the date); ArcGIS service
 * JSON (cached and not, MapServer and ImageServer, errors); URL building incl. WMS 1.3.0 axis order for EPSG:4326; XYZ
 * templates; world files; warping into a state plane project — the affine pieces stay within 0.5 px of the exact
 * per-pixel reprojection at site scale and zoomed out; the project file's map layers and pictures (untrusted); and
 * capabilities that are huge, carry entities, are HTML, JSON or junk. Nothing here touches the network.
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
// The build's language file: DOM-free modules speak through t() (docs/LANG.md); a build without one keeps its English.
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const FIX = path.join(REPO, 'tools/civilcraft-test/fixtures/maps');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const B = await mod('basemap.js');
const C = await mod('crs.js');
const PJ = await mod('project.js');
C.setCatalog(JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const throws = (f, re, m) => { let e = null; try { f(); } catch (x) { e = x; } ok(!!e && (!re || re.test(e.message)) && e.message.length < 300, m + (e ? ' — "' + e.message + '"' : ' (no error)')); };
const section = (s) => console.log('\n== ' + s);
const fx = (f) => fs.readFileSync(path.join(FIX, f), 'utf8');
const q = (url) => Object.fromEntries([...new URL(url).searchParams].map(([k, v]) => [k.toUpperCase(), v]));

// ---------------------------------------------------------------------------
section('web Mercator tiles');
{
  const osm = (lon, lat, z) => { const n = 2 ** z, r = lat * Math.PI / 180; return [Math.floor((lon + 180) / 360 * n), Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n)]; };
  const same = (a, b) => a[0] === b[0] && a[1] === b[1];
  ok(same(B.tileAt(-74.006, 40.7128, 10), [301, 385]), 'New York at z10 is tile 301/385 (OSM wiki)');
  ok(same(B.tileAt(0.0001, 0.0001, 1), [1, 0]) && same(B.tileAt(-0.0001, -0.0001, 1), [0, 1]), 'z1: the four quadrants');
  let agree = 0, n = 0;
  for (let z = 0; z <= 20; z += 2) for (const [lon, lat] of [[-97.7431, 30.2672], [13.405, 52.52], [151.2093, -33.8688], [-122.4194, 37.7749], [174.7762, -41.2865], [-0.1278, 51.5074]]) { n++; if (same(B.tileAt(lon, lat, z), osm(lon, lat, z))) agree++; }
  ok(agree === n, `tileAt matches the OSM wiki formula at ${n} places and zooms`);
  const [x, y] = B.lonLatToMerc(-97.7431, 30.2672), back = B.mercToLonLat(x, y);
  near(back[0], -97.7431, 1e-12, 'mercator → lon back'); near(back[1], 30.2672, 1e-12, 'mercator → lat back');
  near(B.lonLatToMerc(180, 0)[0], B.HALF_MERC, 1e-6, 'lon 180 = half the world');
  near(B.XYZ_GRID.matrices[0].res, 156543.03392804097, 1e-8, 'z0 resolution 156 543.034 m/px');
  near(B.XYZ_GRID.matrices[18].res, 156543.03392804097 / 2 ** 18, 1e-12, 'z18 resolution');
  ok(Object.isFrozen(B.XYZ_GRID) && B.XYZ_GRID.matrices.length === 23, 'XYZ grid z0…22, frozen');
  // a site 1500 m across on 1440 px: about 1 m per px → z17 (1.19 m px ≤ 1.5 × 1.04)
  const c = B.lonLatToMerc(-97.7431, 30.2672), res = 1500 / 1440 / Math.cos(30.2672 * Math.PI / 180);
  const r = B.gridTiles(B.XYZ_GRID, [c[0] - 750 / Math.cos(0.528), c[1] - 470 / Math.cos(0.528), c[0] + 750 / Math.cos(0.528), c[1] + 470 / Math.cos(0.528)], res);
  ok(r.matrix.id === '17' && r.tiles.length > 0 && r.tiles.length <= 64, `a 1500 m site on 1440 px: zoom ${r.matrix.id}, ${r.tiles.length} tiles`);
  const t0 = r.tiles[0], mid = [(t0.bounds[0] + t0.bounds[2]) / 2, (t0.bounds[1] + t0.bounds[3]) / 2];
  ok(r.tiles.every((t) => Math.hypot((t.bounds[0] + t.bounds[2]) / 2 - c[0], (t.bounds[1] + t.bounds[3]) / 2 - c[1]) >= Math.hypot(mid[0] - c[0], mid[1] - c[1]) - 1e-6), 'the middle tile comes first');
  const tz = r.tiles.find((t) => t.col === B.tileAt(-97.7431, 30.2672, 17)[0] && t.row === B.tileAt(-97.7431, 30.2672, 17)[1]);
  ok(!!tz && c[0] >= tz.bounds[0] && c[0] <= tz.bounds[2] && c[1] >= tz.bounds[1] && c[1] <= tz.bounds[3], 'the tile tileAt names holds the point');
  const big = B.gridTiles(B.XYZ_GRID, [-2e6, -2e6, 2e6, 2e6], 0.5, { cap: 64 });
  ok(big.tiles.length <= 64 && Number(big.matrix.id) < 20, `never more than 64 tiles: a huge view at 0.5 m/px drops to zoom ${big.matrix.id} (${big.tiles.length} tiles)`);
  const world = B.gridTiles(B.XYZ_GRID, [-3e7, -3e7, 3e7, 3e7], 1e6);
  ok(world.matrix.id === '0' && world.tiles.length === 1, 'the whole world at z0 is one tile (rows and columns clamped to the matrix)');
  ok(B.gridTiles(B.XYZ_GRID, [3e7, 3e7, 4e7, 4e7], 10).tiles.length === 0, 'outside the grid: no tiles');
  ok(B.pickMatrix(B.XYZ_GRID, 1e9).id === '0' && B.pickMatrix(B.XYZ_GRID, 1e-6).id === '22', 'pickMatrix clamps to the coarsest and finest');
}

section('XYZ templates');
{
  const t = 'https://{s}.tile.example.org/{z}/{x}/{y}.png';
  ok(B.checkTemplate(t) === t, 'a {s}/{z}/{x}/{y} template is accepted');
  ok(B.xyzUrl(t, 5, 7, 12) === 'https://a.tile.example.org/5/7/12.png'.replace('a.', ['a', 'b', 'c'][(7 + 12) % 3] + '.'), 'z/x/y and {s} filled');
  ok(B.xyzUrl('https://t.example.org/{z}/{x}/{-y}.png', 3, 1, 2) === 'https://t.example.org/3/1/5.png', '{-y} = 2^z − 1 − y (TMS)');
  ok(B.xyzUrl(t, 1, 0, 0, 'xyz').startsWith('https://x.'), 'own subdomain letters');
  throws(() => B.checkTemplate('ftp://x/{z}/{x}/{y}'), /https/, 'ftp refused');
  throws(() => B.checkTemplate('javascript:alert(1)//{z}{x}{y}'), /https/, 'javascript: refused');
  throws(() => B.checkTemplate('https://x.org/tiles/{z}/{x}.png'), /\{y\}/, 'a template without {y} is refused');
  throws(() => B.checkTemplate('https://x.org/{z}/{x}/{y}?key={apikey}'), /placeholder/, 'an unknown placeholder is named');
  throws(() => B.checkTemplate('https://user:pw@x.org/{z}/{x}/{y}'), /passwords/, 'credentials in the URL are refused');
}

// ---------------------------------------------------------------------------
section('WMS capabilities (hand-written)');
const WMS130 = `<?xml version="1.0" encoding="UTF-8"?>
<WMS_Capabilities version="1.3.0" xmlns="http://www.opengis.net/wms" xmlns:xlink="http://www.w3.org/1999/xlink">
 <Service><Name>WMS</Name><Title>County GIS</Title></Service>
 <Capability>
  <Request><GetMap><Format>image/png</Format><Format>image/jpeg</Format>
   <DCPType><HTTP><Get><OnlineResource xlink:type="simple" xlink:href="https://gis.example.gov/wms?map=county&amp;"/></Get></HTTP></DCPType></GetMap></Request>
  <Layer><Title>Root</Title><CRS>EPSG:4326</CRS><CRS>EPSG:3857</CRS>
   <EX_GeographicBoundingBox><westBoundLongitude>-98.2</westBoundLongitude><eastBoundLongitude>-97.4</eastBoundLongitude><southBoundLatitude>30.0</southBoundLatitude><northBoundLatitude>30.6</northBoundLatitude></EX_GeographicBoundingBox>
   <BoundingBox CRS="EPSG:4326" minx="30.0" miny="-98.2" maxx="30.6" maxy="-97.4"/>
   <Attribution><Title>County GIS Department</Title></Attribution>
   <Style><Name>default</Name><Title>Default</Title></Style>
   <Layer queryable="1"><Name>parcels</Name><Title>Parcels &amp; lots</Title><CRS>EPSG:2277</CRS>
     <Layer><Name>parcels:labels</Name><Title>Parcel labels</Title><Style><Name>small</Name></Style></Layer>
   </Layer>
   <Layer><Name>aerial2024</Name><Title>Aerial photo 2024</Title><Attribution><Title>Vendor Imaging</Title></Attribution></Layer>
   <Layer><Title>A group without a name</Title></Layer>
  </Layer>
 </Capability>
</WMS_Capabilities>`;
{
  const c = B.parseWmsCapabilities(WMS130);
  ok(c.version === '1.3.0' && c.title === 'County GIS', 'version and title');
  ok(c.getMap === 'https://gis.example.gov/wms?map=county&', 'GetMap URL from xlink:href (entity decoded)');
  ok(c.formats.join() === 'image/png,image/jpeg', 'formats');
  ok(c.layers.map((l) => l.name).join() === 'parcels,parcels:labels,aerial2024', 'only named layers can be requested (the root and the nameless group are not)');
  const parcels = c.layers[0], labels = c.layers[1], aerial = c.layers[2];
  ok(parcels.title === 'Parcels & lots' && parcels.queryable, 'title with an entity, queryable');
  ok([4326, 3857, 2277].every((k) => labels.codes.includes(k)) && !aerial.codes.includes(2277), 'CRS lists are inherited by children (2277 only below parcels)');
  ok(JSON.stringify(parcels.bboxes[4326]) === JSON.stringify([-98.2, 30, -97.4, 30.6]), '1.3.0 EPSG:4326 BoundingBox read latitude first → stored x (lon), y (lat)');
  ok(JSON.stringify(labels.bbox84) === JSON.stringify([-98.2, 30, -97.4, 30.6]), 'EX_GeographicBoundingBox inherited');
  ok(labels.styles.map((s) => s.name).join() === 'default,small', 'styles inherited and added');
  ok(parcels.attribution === 'County GIS Department' && aerial.attribution === 'Vendor Imaging', 'attribution inherited, a child\'s own wins');
  ok(B.wmsPickCode(parcels.codes, 2277) === 2277, 'the project\'s EPSG code is used when offered');
  ok(B.wmsPickCode(aerial.codes, 2277) === 3857, 'else web Mercator');
  ok(B.wmsPickCode([4326, 26914], 2277) === 4326, 'else WGS 84');
  ok(B.wmsPickCode([26914], 2277) === null, 'else nothing CivilCraft can place');
}
const WMS111 = `<?xml version="1.0"?><!DOCTYPE WMT_MS_Capabilities SYSTEM "http://schemas.opengis.net/wms/1.1.1/WMS_MS_Capabilities.dtd"
 [ <!ELEMENT VendorSpecificCapabilities EMPTY> ]>
<WMT_MS_Capabilities version="1.1.1"><Service><Name>OGC:WMS</Name><Title>Old server</Title></Service>
<Capability><Request><GetMap><Format>image/png</Format><DCPType><HTTP><Get><OnlineResource xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="http://old.example.org/cgi-bin/mapserv?"/></Get></HTTP></DCPType></GetMap></Request>
<Layer><Title>All</Title><SRS>EPSG:4326 EPSG:900913 EPSG:26914</SRS><LatLonBoundingBox minx="-100" miny="29" maxx="-96" maxy="33"/>
<BoundingBox SRS="EPSG:4326" minx="-100" miny="29" maxx="-96" maxy="33"/>
<Layer><Name>roads</Name><Title>Roads</Title></Layer></Layer></Capability></WMT_MS_Capabilities>`;
{
  const c = B.parseWmsCapabilities(WMS111);
  ok(c.version === '1.1.1' && c.layers.length === 1 && c.layers[0].name === 'roads', '1.1.1 with a DOCTYPE internal subset');
  ok([4326, 3857, 26914].every((k) => c.layers[0].codes.includes(k)), 'space-separated SRS list; Google\'s 900913 read as 3857');
  ok(JSON.stringify(c.layers[0].bboxes[4326]) === JSON.stringify([-100, 29, -96, 33]) && JSON.stringify(c.layers[0].bbox84) === JSON.stringify([-100, 29, -96, 33]), '1.1.1 BoundingBox and LatLonBoundingBox are longitude first');
}

section('WMS capabilities (real answers from public servers)');
{
  const src = JSON.parse(fx('sources.json'));
  ok(src.saved && Object.keys(src.files).length >= 7, `fixtures saved ${src.saved}, each with its source URL`);
  const u13 = B.parseWmsCapabilities(fx('usgs-topo-wms130.xml')), u11 = B.parseWmsCapabilities(fx('usgs-topo-wms111.xml'));
  ok(u13.version === '1.3.0' && u11.version === '1.1.1', 'USGS National Map (USGSTopo) WMS 1.3.0 and 1.1.1');
  ok(u13.layers.length >= 1 && u13.layers[0].codes.includes(3857) && u13.layers[0].codes.includes(4326), `USGSTopo layer "${u13.layers[0]?.name}" offers 3857 and 4326`);
  ok(/^https:\/\/basemap\.nationalmap\.gov/.test(u13.getMap) && u13.formats.includes('image/png'), 'its GetMap URL and PNG');
  const t = B.parseWmsCapabilities(fx('terrestris-osm-wms130.xml'));
  ok(t.layers.length >= 5 && t.layers.some((l) => l.name === 'OSM-WMS') && t.layers.find((l) => l.name === 'OSM-WMS').codes.includes(3857), `terrestris OSM WMS: ${t.layers.length} layers incl. OSM-WMS in 3857`);
}

section('WMS GetMap URLs');
{
  const u = B.wmsGetMapUrl({ url: 'https://gis.example.gov/wms?map=county&', version: '1.3.0', layer: 'parcels', style: '', format: 'image/png', code: 4326, bbox: [-98.2, 30.0, -97.4, 30.6], width: 800, height: 600 });
  const p = q(u);
  ok(p.BBOX === '30,-98.2,30.6,-97.4' && p.CRS === 'EPSG:4326' && !('SRS' in p), 'WMS 1.3.0 + EPSG:4326: BBOX is minLat,minLon,maxLat,maxLon, CRS=');
  ok(p.MAP === 'county' && p.SERVICE === 'WMS' && p.REQUEST === 'GetMap' && p.LAYERS === 'parcels' && p.STYLES === '' && p.WIDTH === '800' && p.HEIGHT === '600' && p.TRANSPARENT === 'TRUE' && p.FORMAT === 'image/png', 'the server\'s own parameters are kept; the GetMap ones set');
  const p2 = q(B.wmsGetMapUrl({ url: 'https://gis.example.gov/wms', version: '1.3.0', layer: 'a', code: 3857, bbox: [-10880000, 3530000, -10870000, 3537000], width: 512, height: 358 }));
  ok(p2.BBOX === '-10880000.000,3530000.000,-10870000.000,3537000.000' && p2.CRS === 'EPSG:3857', '1.3.0 + EPSG:3857: x first');
  const p3 = q(B.wmsGetMapUrl({ url: 'http://old.example.org/cgi-bin/mapserv?', version: '1.1.1', layer: 'roads', code: 4326, bbox: [-100, 29, -96, 33], width: 100, height: 100 }));
  ok(p3.BBOX === '-100,29,-96,33' && p3.SRS === 'EPSG:4326' && p3.VERSION === '1.1.1', 'WMS 1.1.1 + EPSG:4326: longitude first, SRS=');
  const p4 = q(B.wmsGetMapUrl({ url: 'https://x.org/wms?request=GetCapabilities&Service=WMS&version=1.1.1', version: '1.3.0', layer: 'a', code: 2277, bbox: [3e6, 1e7, 3.1e6, 1.01e7], width: 10, height: 10 }));
  ok(p4.REQUEST === 'GetMap' && p4.VERSION === '1.3.0' && new URL(B.wmsGetMapUrl({ url: 'https://x.org/wms?request=GetCapabilities', layer: 'a', code: 2277, bbox: [0, 0, 1, 1], width: 1, height: 1 })).search.match(/request=/gi).length === 1, 'parameters already in the URL are replaced whatever their case, never doubled');
  ok(q(B.wmsGetMapUrl({ url: 'https://x.org/wms', layer: 'a b&c', code: 3857, bbox: [0, 0, 1, 1], width: 1, height: 1 })).LAYERS === 'a b&c', 'layer names are encoded');
  const cu = B.capabilitiesUrl('https://x.org/wms?map=a&REQUEST=GetMap', 'WMS'), cp = q(cu);
  ok(cp.REQUEST === 'GetCapabilities' && cp.SERVICE === 'WMS' && cp.VERSION === '1.3.0' && cp.MAP === 'a', 'capabilitiesUrl from a base or a GetMap link');
  ok(B.capabilitiesUrl('https://x.org/wmts/1.0.0/WMTSCapabilities.xml', 'WMTS') === 'https://x.org/wmts/1.0.0/WMTSCapabilities.xml', 'a WMTSCapabilities.xml link is used as is');
}

// ---------------------------------------------------------------------------
section('WMTS capabilities');
const WMTS = `<?xml version="1.0" encoding="UTF-8"?>
<Capabilities xmlns="http://www.opengis.net/wmts/1.0" xmlns:ows="http://www.opengis.net/ows/1.1" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.0.0">
 <ows:ServiceIdentification><ows:Title>Tiles R Us</ows:Title></ows:ServiceIdentification>
 <ows:ServiceProvider><ows:ProviderName>Tiles R Us Inc.</ows:ProviderName></ows:ServiceProvider>
 <ows:OperationsMetadata><ows:Operation name="GetTile"><ows:DCP><ows:HTTP><ows:Get xlink:href="https://tiles.example.org/wmts?"><ows:Constraint name="GetEncoding"><ows:AllowedValues><ows:Value>KVP</ows:Value></ows:AllowedValues></ows:Constraint></ows:Get></ows:HTTP></ows:DCP></ows:Operation></ows:OperationsMetadata>
 <Contents>
  <Layer><ows:Title>Ortho</ows:Title><ows:Identifier>ortho</ows:Identifier>
   <ows:WGS84BoundingBox><ows:LowerCorner>166 -48</ows:LowerCorner><ows:UpperCorner>179 -34</ows:UpperCorner></ows:WGS84BoundingBox>
   <Style isDefault="true"><ows:Identifier>default</ows:Identifier></Style><Format>image/png</Format>
   <TileMatrixSetLink><TileMatrixSet>GoogleMapsCompatible</TileMatrixSet></TileMatrixSetLink>
   <TileMatrixSetLink><TileMatrixSet>WGS84</TileMatrixSet></TileMatrixSetLink>
   <TileMatrixSetLink><TileMatrixSet>NZTM</TileMatrixSet></TileMatrixSetLink>
   <TileMatrixSetLink><TileMatrixSet>missing</TileMatrixSet></TileMatrixSetLink>
   <ResourceURL format="image/png" resourceType="tile" template="https://tiles.example.org/ortho/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png"/>
   <ResourceURL format="image/png" resourceType="tile" template="javascript:alert(1)"/>
  </Layer>
  <TileMatrixSet><ows:Identifier>GoogleMapsCompatible</ows:Identifier><ows:SupportedCRS>urn:ogc:def:crs:EPSG:6.18.3:3857</ows:SupportedCRS>
   <TileMatrix><ows:Identifier>0</ows:Identifier><ScaleDenominator>559082264.0287178</ScaleDenominator><TopLeftCorner>-20037508.3427892 20037508.3427892</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>1</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix>
   <TileMatrix><ows:Identifier>1</ows:Identifier><ScaleDenominator>279541132.0143589</ScaleDenominator><TopLeftCorner>-20037508.3427892 20037508.3427892</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>2</MatrixWidth><MatrixHeight>2</MatrixHeight></TileMatrix>
   <TileMatrix><ows:Identifier>bad</ows:Identifier><ScaleDenominator>-5</ScaleDenominator><TopLeftCorner>x y</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>2</MatrixWidth><MatrixHeight>2</MatrixHeight></TileMatrix>
  </TileMatrixSet>
  <TileMatrixSet><ows:Identifier>WGS84</ows:Identifier><ows:SupportedCRS>urn:ogc:def:crs:EPSG::4326</ows:SupportedCRS>
   <TileMatrix><ows:Identifier>0</ows:Identifier><ScaleDenominator>279541132.0143589</ScaleDenominator><TopLeftCorner>90 -180</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>2</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix>
  </TileMatrixSet>
  <TileMatrixSet><ows:Identifier>NZTM</ows:Identifier><ows:SupportedCRS>urn:ogc:def:crs:EPSG::2193</ows:SupportedCRS>
   <TileMatrix><ows:Identifier>0</ows:Identifier><ScaleDenominator>32000000</ScaleDenominator><TopLeftCorner>10438190.1652 -3260586.7284</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>4</MatrixWidth><MatrixHeight>4</MatrixHeight></TileMatrix>
   <TileMatrix><ows:Identifier>1</ows:Identifier><ScaleDenominator>16000000</ScaleDenominator><TopLeftCorner>10438190.1652 -3260586.7284</TopLeftCorner><TileWidth>256</TileWidth><TileHeight>256</TileHeight><MatrixWidth>8</MatrixWidth><MatrixHeight>8</MatrixHeight></TileMatrix>
  </TileMatrixSet>
 </Contents>
</Capabilities>`;
{
  const c = B.parseWmtsCapabilities(WMTS);
  const l = c.layers[0];
  ok(c.title === 'Tiles R Us' && c.layers.length === 1 && l.id === 'ortho' && l.title === 'Ortho', 'title and the layer (namespaced ows: elements)');
  ok(l.sets.join() === 'GoogleMapsCompatible,WGS84,NZTM', 'tile matrix set links; one naming a set that is not there is dropped');
  ok(l.templates.length === 1 && /\{TileMatrix\}/.test(l.templates[0].template), 'REST template kept; a javascript: one dropped');
  ok(l.styles[0].id === 'default' && l.styles[0].isDefault && l.formats[0] === 'image/png' && l.attribution === 'Tiles R Us Inc.', 'style, format, provider as attribution');
  ok(c.kvp === 'https://tiles.example.org/wmts?', 'KVP GetTile URL');
  ok(c.sets.GoogleMapsCompatible.code === 3857 && c.sets.GoogleMapsCompatible.matrices.length === 2, 'a versioned EPSG URN; the matrix with bad numbers skipped');
  const g = B.wmtsGrid(c.sets.GoogleMapsCompatible, 'm');
  near(g.matrices[1].res, B.XYZ_GRID.matrices[1].res, 1e-6, 'GoogleMapsCompatible level 1 = XYZ z1 resolution (0.28 mm pixels)');
  ok(Math.abs(g.origin[0] + B.HALF_MERC) < 1e-3 && Math.abs(g.origin[1] - B.HALF_MERC) < 1e-3, 'its top-left corner');
  const w = c.sets.WGS84; ok(w.latFirst && w.code === 4326, 'EPSG::4326 set is latitude first');
  const gw = B.wmtsGrid(w, 'deg');
  ok(gw.matrices[0].origin[0] === -180 && gw.matrices[0].origin[1] === 90, 'its TopLeftCorner "90 -180" → x −180, y 90');
  near(gw.matrices[0].res * 256 * 2, 360, 1e-6, 'two tiles of 256 px cover 360° (scale denominator with metres per degree)');
  const nz = c.sets.NZTM, nzE = C.byCode(2193);
  const toSet = (lon, lat) => C.transformer(null, nzE)(lon, lat);
  const gn = B.wmtsGrid(nz, 'm', { toSet, bbox84: l.bbox84 });
  ok(gn.matrices[0].origin[0] === -3260586.7284 && gn.matrices[0].origin[1] === 10438190.1652, 'NZTM: a northing-first TopLeftCorner is recognised from where the layer is (→ x −3 260 586.7, y 10 438 190.2)');
  const gn2 = B.wmtsGrid(nz, 'm');
  ok(gn2.matrices[0].origin[0] === 10438190.1652, 'without that hint the corner is taken as written');
  const tu = B.wmtsTileUrl({ template: l.templates[0].template, layer: 'ortho', style: 'default', set: 'GoogleMapsCompatible', matrix: '12', row: 34, col: 56 });
  ok(tu === 'https://tiles.example.org/ortho/default/GoogleMapsCompatible/12/34/56.png', 'REST tile URL: ' + tu);
  const kv = q(B.wmtsTileUrl({ kvp: c.kvp, layer: 'ortho', style: 'default', format: 'image/png', set: 'WGS84', matrix: '0', row: 0, col: 1 }));
  ok(kv.SERVICE === 'WMTS' && kv.REQUEST === 'GetTile' && kv.TILEMATRIXSET === 'WGS84' && kv.TILEMATRIX === '0' && kv.TILEROW === '0' && kv.TILECOL === '1' && kv.LAYER === 'ortho', 'KVP GetTile URL');
  // the real one
  const u = B.parseWmtsCapabilities(fx('usgs-topo-wmts.xml'));
  ok(u.layers[0]?.id === 'USGSTopo' && u.layers[0].sets.includes('GoogleMapsCompatible') && u.layers[0].templates.length >= 1, 'USGS National Map WMTS: USGSTopo, GoogleMapsCompatible, a REST template');
  const ug = B.wmtsGrid(u.sets.GoogleMapsCompatible, 'm');
  ok(ug.matrices.every((m) => Math.abs(m.res - B.XYZ_GRID.matrices[0].res / 2 ** Number(m.id)) / m.res < 1e-6), `its GoogleMapsCompatible matrices (${ug.matrices.length}) are the XYZ levels`);
  const rt = B.wmtsTileUrl({ template: u.layers[0].templates[0].template, layer: 'USGSTopo', style: 'default', set: 'GoogleMapsCompatible', matrix: '5', row: 12, col: 7 });
  ok(/USGSTopo\/MapServer\/WMTS\/tile\/1\.0\.0\/USGSTopo\/default\/GoogleMapsCompatible\/5\/12\/7/.test(rt), 'its REST tile URL: ' + rt);
  // tiles of a grid whose matrices carry their own origins
  const tl = B.gridTilesAny(gw, [-100, 29, -96, 33], 0.5);
  ok(tl.tiles.length === 1 && tl.tiles[0].col === 0 && tl.tiles[0].row === 0, 'WGS84 set: Texas is in tile 0/0 of level 0');
}

// ---------------------------------------------------------------------------
section('ArcGIS map and image services');
{
  ok(B.arcgisBase('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer?f=pjson').base === 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer', 'the base URL from a ?f=pjson link');
  ok(B.arcgisBase('https://x.org/arcgis/rest/services/A/MapServer/3/query').base === 'https://x.org/arcgis/rest/services/A/MapServer', '…from a layer link');
  ok(B.arcgisBase('https://x.org/arcgis/rest/services/Elev/ImageServer/').kind === 'ImageServer', 'ImageServer');
  throws(() => B.arcgisBase('https://x.org/arcgis/rest/services/A/FeatureServer'), /MapServer/, 'a FeatureServer is not a map service');
  const topo = B.parseArcgisService(fx('usgs-topo-mapserver.json'), 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer');
  ok(topo.kind === 'MapServer' && topo.tiled && topo.code === 3857 && topo.grid.matrices.length >= 16, `USGSTopo: cached web Mercator tiles (${topo.grid.matrices.length} levels)`);
  ok(topo.grid.matrices.every((m) => Math.abs(m.res - B.XYZ_GRID.matrices[0].res / 2 ** Number(m.id)) / m.res < 1e-6) && Math.abs(topo.grid.origin[0] + B.HALF_MERC) < 1, 'its levels are the XYZ zooms, origin top-left of the world');
  ok(/USGS/.test(topo.attribution), 'copyrightText as attribution');
  ok(B.arcgisTileUrl('https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer', '5', 12, 7) === 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/5/12/7', 'tile URL is /tile/level/row/col');
  const st = B.parseArcgisService(fx('usgs-structures-mapserver.json'), 'https://carto.nationalmap.gov/arcgis/rest/services/structures/MapServer');
  ok(st.kind === 'MapServer' && !st.tiled && st.code === 3857 && st.extent, 'USGS structures: a dynamic map service (one picture per view)');
  const ex = q(B.arcgisExportUrl({ base: 'https://x.org/arcgis/rest/services/A/MapServer', kind: 'MapServer', bbox: [3115000, 10070000, 3116500, 10071000], code: 2277, width: 1440, height: 960 }));
  ok(ex.BBOX === '3115000.000,10070000.000,3116500.000,10071000.000' && ex.BBOXSR === '2277' && ex.IMAGESR === '2277' && ex.SIZE === '1440,960' && ex.FORMAT === 'png32' && ex.TRANSPARENT === 'true' && ex.F === 'image', 'export?bbox&bboxSR&imageSR&size&format=png32&transparent=true&f=image');
  ok(/\/MapServer\/export\?/.test(B.arcgisExportUrl({ base: 'https://x.org/a/MapServer', bbox: [0, 0, 1, 1], code: 3857, width: 1, height: 1 })), 'MapServer → /export');
  const im = B.parseArcgisService(fx('usgs-3dep-imageserver.json'), 'https://elevation.nationalmap.gov/arcgis/rest/services/3DEPElevation/ImageServer');
  ok(im.kind === 'ImageServer' && im.code === 3857, 'USGS 3DEP elevation: an ImageServer');
  ok(/\/ImageServer\/exportImage\?/.test(B.arcgisExportUrl({ base: 'https://x.org/a/ImageServer', kind: 'ImageServer', bbox: [0, 0, 1, 1], code: 3857, width: 1, height: 1 })), 'ImageServer → /exportImage');
  throws(() => B.parseArcgisService('{"error":{"code":499,"message":"Token Required"}}', 'https://x.org/a/MapServer'), /sign-in/, 'a service that needs a sign-in says so');
  throws(() => B.parseArcgisService('<html>nope</html>', 'https://x.org/a/MapServer'), /ArcGIS/, 'HTML instead of JSON');
  throws(() => B.parseArcgisService('[1,2]', 'https://x.org/a/MapServer'), /ArcGIS/, 'an array instead of an object');
  const odd = B.parseArcgisService({ singleFusedMapCache: true, spatialReference: { wkid: 102100 }, tileInfo: { rows: 1e9, cols: 256, origin: { x: -2e7, y: 2e7 }, spatialReference: { wkid: 102100 }, lods: [{ level: 0, resolution: 1 }] } }, 'https://x.org/a/MapServer');
  ok(!odd.tiled && odd.code === 3857, 'absurd tile sizes → not drawn from tiles; 102100 read as 3857');
  const poison = B.parseArcgisService('{"__proto__":{"polluted":1},"mapName":"x\\u0000y","spatialReference":{"wkid":2277}}', 'https://x.org/a/MapServer');
  ok(({}).polluted === undefined && poison.name === 'x y' && poison.code === 2277, '__proto__ in the JSON does nothing; control characters cleaned');
}

// ---------------------------------------------------------------------------
section('world files');
{
  // a 1000 × 800 picture, 0.5 ft pixels, upper-left pixel centre at (3115000.25, 10071000.25 − 0.5)
  const gt = B.parseWorldFile('0.5\n0.0\n0.0\n-0.5\n3115000.25\n10070999.75\n');
  ok(gt[0] === 3115000 && gt[3] === 10071000 && gt[1] === 0.5 && gt[5] === -0.5 && gt[2] === 0 && gt[4] === 0, 'pixel centres → the corner geotransform (half a pixel up and left)');
  const lr = B.pixelToSystem(gt, 1000, 800);
  ok(lr[0] === 3115500 && lr[1] === 10070600, 'the lower-right corner of a 1000 × 800 picture');
  const rot = B.parseWorldFile('  0.866 0.5 0.5 -0.866 100 200  ');
  const c0 = B.pixelToSystem(rot, 0.5, 0.5);
  ok(Math.abs(c0[0] - 100) < 1e-12 && Math.abs(c0[1] - 200) < 1e-12, 'rotation terms: the first pixel\'s centre maps to C, F');
  throws(() => B.parseWorldFile('1\n2\n3\n'), /six numbers/, 'five numbers short');
  throws(() => B.parseWorldFile('a\nb\nc\nd\ne\nf'), /six numbers/, 'words');
  throws(() => B.parseWorldFile('0\n0\n0\n0\n1\n1'), /zero/, 'a zero pixel size');
  throws(() => B.parseWorldFile('1\n'.repeat(20000)), /too long/, 'a huge file');
  ok(B.worldFileFor('Site Photo.PNG').includes('site photo.pgw') && B.worldFileFor('a.png').includes('a.pngw') && B.worldFileFor('a.jpg').includes('a.jgw') && B.worldFileFor('a.jpeg').includes('a.jgw') && B.worldFileFor('a.tif').includes('a.tfw') && B.worldFileFor('a.png').includes('a.wld'), 'world file names: .pgw .pngw .jgw .tfw .wld');
}

// ---------------------------------------------------------------------------
section('warping into the project (error vs the exact per-pixel reprojection)');
{
  const tx = C.crsFromEntry(C.byCode(2277));
  const f = C.frame(tx);
  const m3857 = C.crsFromEntry(C.byCode(3857)), from3857 = f.from(m3857), to3857 = f.to(m3857);
  // a plan view: the sample site's scale — 1500 ft across 1440 px, centred on a site in Austin
  const site = f.fromLonLat(-97.7431, 30.2672);
  const view = (wFt, wPx, hPx) => { const z = wPx / wFt; return { z, cx: site[0], cy: site[1], w: wPx, h: hPx, S: (x, y) => [(x - site[0]) * z + wPx / 2, hPx / 2 - (y - site[1]) * z] }; };
  const measure = (cells, pixToProj, w, h, v, step) => {
    let worst = 0, n = 0;
    for (let vv = 0.5; vv < h; vv += step) for (let u = 0.5; u < w; u += step) {
      const c = cells.find((k) => u >= k.src[0][0] && u <= k.src[2][0] && vv >= k.src[0][1] && vv <= k.src[2][1]);
      if (!c) continue;
      const a = B.applyAffine(c.m, u, vv), e = pixToProj(u, vv);
      const sa = v.S(a[0], a[1]), se = v.S(e[0], e[1]);
      worst = Math.max(worst, Math.hypot(sa[0] - se[0], sa[1] - se[1])); n++;
    }
    return { worst, n };
  };
  const planned = (pixToProj, w, h, v) => {
    // as gis-map-ui.js: planned in project units to a quarter pixel at this zoom
    const tolProj = 0.25 / v.z;
    return B.planWarp(pixToProj, w, h, { tol: tolProj, maxDepth: 7 });
  };
  for (const [label, wFt] of [['site scale (1500 ft on 1440 px)', 1500], ['zoomed out (3 miles on 1440 px)', 16000], ['a town (12 miles on 1440 px)', 63000]]) {
    const v = view(wFt, 1440, 900);
    const box = B.viewSourceBox({ minX: site[0] - wFt / 2, minY: site[1] - wFt * 0.3, maxX: site[0] + wFt / 2, maxY: site[1] + wFt * 0.3 }, to3857, 8);
    const res = (box[2] - box[0]) / 1440;
    const { matrix, tiles } = B.gridTiles(B.XYZ_GRID, box, res);
    let worst = 0, cells = 0, n = 0;
    for (const t of tiles.slice(0, 6)) {
      const rx = (t.bounds[2] - t.bounds[0]) / 256, ry = (t.bounds[3] - t.bounds[1]) / 256;
      const pix = (u, vv) => from3857(t.bounds[0] + u * rx, t.bounds[3] - vv * ry);
      const plan = planned(pix, 256, 256, v);
      const r = measure(plan, pix, 256, 256, v, 4);
      worst = Math.max(worst, r.worst); cells += plan.length; n += r.n;
    }
    ok(worst < 0.5, `${label}: web Mercator tiles (zoom ${matrix.id}) warped into Texas Central within 0.5 px (worst ${worst.toFixed(3)} px over ${n} pixels, ${cells} pieces for 6 tiles)`);
  }
  // a WMS picture in EPSG:4326 for a 2-mile view, 1440 × 900 px
  {
    const v = view(10560, 1440, 900);
    const to4326 = f.to(null), from4326 = f.from(null);
    const box = B.viewSourceBox({ minX: site[0] - 5280, minY: site[1] - 3300, maxX: site[0] + 5280, maxY: site[1] + 3300 }, to4326, 8);
    const rx = (box[2] - box[0]) / 1440, ry = (box[3] - box[1]) / 900;
    const pix = (u, vv) => from4326(box[0] + u * rx, box[3] - vv * ry);
    const plan = planned(pix, 1440, 900, v);
    const r = measure(plan, pix, 1440, 900, v, 9);
    ok(r.worst < 0.5, `a WGS 84 WMS picture of a 2-mile view: within 0.5 px (worst ${r.worst.toFixed(3)} px, ${plan.length} pieces)`);
    // the box covers the view: every view corner and edge midpoint maps inside it
    const inside = [[-5280, -3300], [5280, -3300], [5280, 3300], [-5280, 3300], [0, 3300], [0, -3300], [5280, 0], [-5280, 0]].every(([dx, dy]) => { const p = to4326(site[0] + dx, site[1] + dy); return p[0] >= box[0] - 1e-12 && p[0] <= box[2] + 1e-12 && p[1] >= box[1] - 1e-12 && p[1] <= box[3] + 1e-12; });
    ok(inside, 'viewSourceBox holds the whole view');
  }
  // a big UTM picture (4096 px, a whole county) into Texas Central, zoomed out to show it all
  {
    const utm = C.crsFromEntry(C.byCode(26914)), fromUtm = f.from(utm);
    const c = C.transformer(null, utm)(-97.7431, 30.2672);
    const gt = [c[0] - 20480, 10, 0, c[1] + 20480, 0, -10];
    const pix = (u, vv) => fromUtm(...B.pixelToSystem(gt, u, vv));
    const v = view(140000, 1440, 900);
    const plan = planned(pix, 4096, 4096, v);
    const r = measure(plan, pix, 4096, 4096, v, 37);
    ok(r.worst < 0.5 && plan.length < 400, `a 4096 px UTM picture of a county: within 0.5 px (worst ${r.worst.toFixed(3)} px, ${plan.length} pieces)`);
    const v2 = view(1500, 1440, 900);
    const plan2 = planned(pix, 4096, 4096, v2), r2 = measure(plan2, pix, 4096, 4096, v2, 41);
    ok(r2.worst < 0.5, `the same picture at site scale: within 0.5 px (worst ${r2.worst.toFixed(3)} px, ${plan2.length} pieces)`);
  }
  // the same system: one affine piece, exact
  {
    const gt = [site[0] - 500, 0.5, 0, site[1] + 400, 0, -0.5];
    const pix = (u, vv) => B.pixelToSystem(gt, u, vv);
    const plan = B.planWarp(pix, 2000, 1600, { tol: 0.01, maxDepth: 0 });
    ok(plan.length === 1 && plan[0].err < 1e-6, 'a picture in the project\'s own system is one affine piece');
    const a = B.applyAffine(plan[0].m, 2000, 1600);
    ok(Math.abs(a[0] - (site[0] + 500)) < 1e-6 && Math.abs(a[1] - (site[1] - 400)) < 1e-6, 'and lands exactly');
  }
  // with a ground (local) step the picture still lands where the grid says
  {
    const ground = { ...tx, local: C.groundLocal(0.99987, [0, 0]) }, fg = C.frame(ground);
    const g3857 = fg.from(m3857), p0 = g3857(...B.lonLatToMerc(-97.7431, 30.2672)), gp = fg.toGrid(p0[0], p0[1]), want = f.fromLonLat(-97.7431, 30.2672);
    ok(Math.hypot(gp[0] - want[0], gp[1] - want[1]) < 0.01, 'a ground project: a tile corner lands at the ground coordinates of its grid position');
  }
  const aff = B.affineFrom3([[0, 0], [1, 0], [0, 1]], [[10, 20], [12, 21], [9, 23]]);
  ok(JSON.stringify(aff) === JSON.stringify([2, 1, -1, 3, 10, 20]), 'affineFrom3 in canvas order (a b c d e f)');
  ok(B.affineFrom3([[0, 0], [1, 1], [2, 2]], [[0, 0], [1, 1], [2, 2]]) === null, 'three points on a line → null');
  const cut = B.planWarp((u, v) => (u > 50 ? null : [u, v]), 100, 100, { tol: 0.1, maxDepth: 3 });
  ok(cut.length > 0 && cut.every((c) => c.src[2][0] <= 50), 'parts of a picture the system cannot map are left out');
}

// ---------------------------------------------------------------------------
section('capabilities that are not what they say (untrusted)');
{
  throws(() => B.parseWmsCapabilities(''), /nothing/, 'empty');
  throws(() => B.parseWmsCapabilities('<html><body>Not found</body></html>'), /web page/, 'an HTML page');
  throws(() => B.parseWmsCapabilities('<!DOCTYPE html><html></html>'), /web page/, 'an HTML page with a doctype');
  throws(() => B.parseWmsCapabilities('{"layers":[]}'), /JSON/, 'JSON');
  throws(() => B.parseWmsCapabilities('\u0000\u0001\u0002 binary junk <<<'), null, 'binary junk');
  throws(() => B.parseWmsCapabilities('<ServiceExceptionReport version="1.3.0"><ServiceException code="InvalidFormat">Bad request &amp; more</ServiceException></ServiceExceptionReport>'), /error: Bad request & more/, 'a ServiceExceptionReport is shown as the server\'s error');
  throws(() => B.parseWmsCapabilities('<Capabilities/>'), /not a WMS/, 'a WMTS document given to the WMS reader');
  throws(() => B.parseWmtsCapabilities(WMS130), /not a WMTS/, 'a WMS document given to the WMTS reader');
  throws(() => B.parseWmsCapabilities('<WMS_Capabilities version="1.3.0"><Capability><Layer><Title>x</Title></Layer></Capability></WMS_Capabilities>'), /no map layers/, 'no named layers');
  throws(() => B.parseWmsCapabilities('<WMS_Capabilities>' + ' '.repeat(9 * 1024 * 1024) + '</WMS_Capabilities>'), /8 MB/, 'over 8 MB is refused before parsing');
  // external entities are never fetched or expanded; nested entities (billion laughs) are not expanded either
  const xxe = '<?xml version="1.0"?><!DOCTYPE x [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><WMS_Capabilities version="1.3.0"><Capability><Layer><Name>a</Name><Title>&xxe;</Title></Layer></Capability></WMS_Capabilities>';
  const cx = B.parseWmsCapabilities(xxe);
  ok(cx.layers[0].title === '&xxe;' && !/root:/.test(JSON.stringify(cx)), 'an external entity stays as text, nothing is read');
  let lol = '<?xml version="1.0"?><!DOCTYPE l [<!ENTITY l0 "lol">';
  for (let i = 1; i < 10; i++) lol += `<!ENTITY l${i} "${('&l' + (i - 1) + ';').repeat(10)}">`;
  lol += ']><WMS_Capabilities version="1.3.0"><Capability><Layer><Name>a</Name><Title>&l9;</Title></Layer></Capability></WMS_Capabilities>';
  const t0 = Date.now(), cl = B.parseWmsCapabilities(lol);
  ok(cl.layers[0].title === '&l9;' && Date.now() - t0 < 500, 'nested entities are not expanded ("billion laughs")');
  let deep = ''; for (let i = 0; i < 200; i++) deep += '<Layer><Name>n' + i + '</Name><Title>t</Title>';
  for (let i = 0; i < 200; i++) deep += '</Layer>';
  throws(() => B.parseWmsCapabilities('<WMS_Capabilities version="1.3.0"><Capability>' + deep + '</Capability></WMS_Capabilities>'), /could not be read/, 'layers nested 200 deep: refused, no stack overflow');
  let many = '<WMS_Capabilities version="1.3.0"><Capability><Layer><Title>r</Title>';
  for (let i = 0; i < 7000; i++) many += '<Layer><Name>l' + i + '</Name><Title>L</Title></Layer>';
  const cm = B.parseWmsCapabilities(many + '</Layer></Capability></WMS_Capabilities>');
  ok(cm.layers.length === 5000, `7000 layers are capped at ${cm.layers.length}`);
  const ctl = B.parseWmsCapabilities('<WMS_Capabilities version="1.3.0"><Capability><Layer><Name>a</Name><Title>A&#1;B' + 'x'.repeat(2000) + '</Title></Layer></Capability></WMS_Capabilities>');
  ok(!/[\u0000-\u001f]/.test(ctl.layers[0].title) && ctl.layers[0].title.length <= 300, 'control characters out, titles capped');
  const bad = B.parseWmtsCapabilities('<Capabilities><Contents><Layer><Identifier>a</Identifier><TileMatrixSetLink><TileMatrixSet>s</TileMatrixSet></TileMatrixSetLink></Layer><TileMatrixSet><Identifier>s</Identifier><SupportedCRS>EPSG:3857</SupportedCRS><TileMatrix><Identifier>0</Identifier><ScaleDenominator>1e300</ScaleDenominator><TopLeftCorner>0 0</TopLeftCorner><TileWidth>99999</TileWidth><TileHeight>256</TileHeight><MatrixWidth>1</MatrixWidth><MatrixHeight>1</MatrixHeight></TileMatrix></TileMatrixSet></Contents></Capabilities>');
  ok(Object.keys(bad.sets).length === 0 && bad.layers[0].sets.length === 0, 'WMTS: a tile matrix with a 99 999 px tile is dropped, and so is the set');
  throws(() => B.checkUrl('javascript:alert(1)'), /https/, 'checkUrl: javascript:');
  throws(() => B.checkUrl('file:///etc/passwd'), /https/, 'checkUrl: file:');
  throws(() => B.checkUrl('data:text/html,hi'), /https/, 'checkUrl: data:');
  throws(() => B.checkUrl('not a url'), /web address/, 'checkUrl: words');
  throws(() => B.checkUrl('https://' + 'a'.repeat(3000) + '.org'), /too long/, 'checkUrl: too long');
  ok(B.codeOfCrs('urn:ogc:def:crs:OGC:1.3:CRS84').crs84 && B.codeOfCrs('urn:ogc:def:crs:OGC:1.3:CRS84').code === 4326, 'CRS84 → 4326, longitude first');
  ok(B.codeOfCrs('http://www.opengis.net/def/crs/EPSG/0/2193').code === 2193 && B.codeOfCrs('EPSG:102100').code === 3857 && B.codeOfCrs('urn:ogc:def:crs:EPSG::900913').code === 3857, 'URL and URN forms; 102100 and 900913 → 3857');
  ok(B.codeOfCrs('EPSG:abc') === null && B.codeOfCrs('') === null && B.codeOfCrs('AUTO:42001') === null, 'unknown forms → null');
  ok(B.isLatFirst({ code: 4326 }) && B.isLatFirst({ code: 4269 }) && !B.isLatFirst({ code: 4326, crs84: true }) && !B.isLatFirst({ code: 3857 }) && !B.isLatFirst({ code: 2277 }), 'latitude first for geographic EPSG codes only');
}

// ---------------------------------------------------------------------------
section('map layers in the project file (untrusted)');
{
  const tx = C.crsFromEntry(C.byCode(2277));
  const png = 'data:image/png;base64,' + Buffer.from(fs.readFileSync(path.join(REPO, 'public_html/favicon-32.png'))).toString('base64');
  const grid = B.gridJson(B.wmtsGrid(B.parseWmtsCapabilities(WMTS).sets.GoogleMapsCompatible, 'm'));
  const maps = [
    { id: 'm1', name: 'Aerial', kind: 'image', image: 'img1', width: 32, height: 32, a0: 3115000, a1: 1, a2: 0, a3: 10071000, a4: 0, a5: -1, crsCode: 2277, crsName: tx.name, crsProj4: tx.proj4, crsUnit: 'ftUS', opacity: 0.6, visible: true, attribution: 'County' },
    { id: 'm2', name: 'OSM', kind: 'xyz', url: 'https://tile.example.org/{z}/{x}/{y}.png', crsCode: 3857, crsProj4: C.byCode(3857).proj4, crsUnit: 'm', visible: false, attribution: '© OpenStreetMap contributors' },
    { id: 'm3', name: 'Parcels', kind: 'wms', url: 'https://gis.example.gov/wms?map=county', layer: 'parcels', version: '1.3.0', crsCode: 2277, crsProj4: tx.proj4, crsUnit: 'ftUS', opacity: 1.7 },
    { id: 'm4', name: 'Ortho', kind: 'wmts', url: 'https://tiles.example.org/wmts?', layer: 'ortho', set: 'GoogleMapsCompatible', grid, crsCode: 3857, crsProj4: C.byCode(3857).proj4, crsUnit: 'm', template: 'https://tiles.example.org/ortho/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.png' },
    { id: 'm5', name: 'Evil', kind: 'xyz', url: 'javascript:alert(1)//{z}{x}{y}' },
    { id: 'm6', name: 'No picture', kind: 'image', image: 'img9', width: 10, height: 10, a0: 0, a1: 1, a2: 0, a3: 0, a4: 0, a5: -1 },
    { id: 'm7', name: 'Odd kind', kind: 'kml', url: 'https://x.org/a.kml' },
    { id: 'm8', name: 'WMTS without grid', kind: 'wmts', url: 'https://x.org/wmts', crsProj4: 'x' },
    { id: 'm9', name: 'Data URL tiles', kind: 'xyz', url: 'data:image/png;base64,AAAA/{z}/{x}/{y}' },
  ];
  const notes = [];
  const out = B.readMaps(maps, notes, new Map([['img1', png]]));
  ok(out.map((m) => m.id).join() === 'm1,m2,m3,m4', 'good layers kept; javascript:, a missing picture, an unknown kind, a WMTS without its grid and a data: URL dropped');
  ok(notes.length === 1 && /5 map layers/.test(notes[0]), 'one note says how many were left out: ' + notes[0]);
  ok(out[2].opacity === 1 && out[0].opacity === 0.6, 'opacity clamped to 0…1');
  ok(out[1].visible === false && out[3].set === 'GoogleMapsCompatible' && B.readGrid(out[3].grid).matrices.length === 2, 'visibility, WMTS set and grid kept');
  ok(B.readMaps('nope').length === 0 && B.readMaps(new Array(500).fill(maps[1])).length === 100, 'not a list → none; at most 100 layers');
  throws(() => B.readGrid('{"origin":[0,0],"matrices":[{"id":"0","res":-1,"tw":256,"th":256}]}'), null, 'a grid with a negative resolution');
  throws(() => B.readGrid('x'.repeat(300000)), null, 'a huge grid text');
  // through the project file: the picture rides outside the undo snapshots
  const p = new PJ.Project();
  p.gisImages.set('img1', png);
  p.change('Add map layer', (s) => { s.gis.maps.push(out[0], out[1]); });
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  ok(json.gisImages?.img1 === png && Object.keys(json.gisImages).length === 1, 'the project file carries the picture as a data URL');
  ok(p.undoStack.at(-1).json.length < 5000, 'the undo snapshot does not carry the picture (' + p.undoStack.at(-1).json.length + ' characters)');
  const back = PJ.Project.fromJSON(json);
  ok(back.project.gisImages.get('img1') === png && back.project.state.gis.maps.length === 2 && back.project.state.gis.maps[0].a0 === 3115000, 'reopened: picture and layers back');
  ok(B.readMaps(back.project.state.gis.maps, [], back.project.gisImages).length === 2, 'and they read as map layers again');
  const bad = JSON.parse(JSON.stringify(json));
  bad.gisImages = { img1: 'data:text/html;base64,PHNjcmlwdD4=', img2: png, __proto__: { x: 1 } };
  const b2 = PJ.Project.fromJSON(bad);
  ok(!b2.project.gisImages.has('img1') && !b2.project.gisImages.has('img2') && b2.notes.some((n) => /map picture/.test(n)), 'a picture that is not PNG/JPEG data is dropped with a note; one no layer uses is not kept');
  ok(B.readMaps(b2.project.state.gis.maps, [], b2.project.gisImages).length === 1, 'its layer is then left out');
  ok(B.checkImageData(png) && !B.checkImageData('data:image/svg+xml;base64,PHN2Zz4=') && !B.checkImageData('data:image/png;base64,<script>') && !B.checkImageData(42), 'checkImageData: PNG/JPEG base64 only');
  p.undo();
  ok(p.state.gis.maps.length === 0 && JSON.parse(JSON.stringify(p.toJSON())).gisImages && !('img1' in JSON.parse(JSON.stringify(p.toJSON())).gisImages), 'undo removes the layer; the file then leaves its picture out');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
