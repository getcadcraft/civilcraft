/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: SOURCES is registry data (source names, licence notes, field names) read by the importer and listed by eg-ui.js; the window words every code */
/**
 * site-sources.js — "Address to site" (0.8 EG.63): the importer framework that turns files from open data sources into what a site needs to
 * know — the parcel, the buildings round it, the zoning, the soils, the flood zone — for a point you give. No DOM, no strings (the UI words the
 * codes), no network, no imports. Tested by bin/test-civilcraft-site-sources.mjs against made-up files in the shapes the sources publish.
 *
 * The app never calls a data service. You (or your connected assistant, which can look an address up with its own tools) bring the files and
 * the point; this reads them with the GIS readers that exist (gis-read.js: GeoJSON, shapefile, KML, GeoPackage) and answers. Which sources to
 * list in the app is the owner's choice: SOURCES is the registry, one entry per source, each with the kinds it gives, the formats, where a person
 * gets it and what field names its files use. Entries marked `checked: false` were written from the sources' public descriptions and have not been
 * run against a real download yet.
 *
 * A LAYER here is what the readers return: { name, geom: 'pt'|'ln'|'pg', fields, features: [{ g: { t, c }, p: properties }] } with positions in
 * the layer's own coordinates (longitude/latitude for GeoJSON). A site query keeps everything in one coordinate system: pass lon/lat with `geographic: true`
 * (radius in metres is turned into degrees) or project units with the radius in the same units.
 *
 *   SOURCES · KINDS
 *   guessKind(layer) → { kind, score } | null            from its field names (and geometry)
 *   mapFeature(kind, props) → record                      the fields a kind needs, found under any of the usual names
 *   siteAt(layers, { x, y, radius, geographic }) → site   layers: [{ kind?, layer }]
 *     site = { point, parcel: { record, area, ring } | null, neighbours: n, buildings: [{ record, area, d }], zoning: [{ code, desc, share }],
 *       soils: [{ symbol, key, name, share }], flood: { zone, sfha, bfe, share, atPoint } | null, missing: [kinds not supplied], notes: [codes] }
 *   siteRows(site) → [{ key, value, ... }]                one row per thing worth saying (the UI words them)
 *   lonLatBox(lat, lon, radiusM) → { minX, minY, maxX, maxY }
 */

export const KINDS = ['parcels', 'buildings', 'zoning', 'soils', 'flood', 'terrain'];

/** Field names (upper-cased, punctuation removed) each kind is recognised and read by. */
const NAMES = {
  parcels: { id: ['APN', 'PIN', 'PARCELID', 'PARCELNO', 'PARCELNUMBER', 'PARCELNUM', 'PARID', 'PARCEL', 'TAXID', 'PROPID', 'OBJECTID'], owner: ['OWNER', 'OWNERNAME', 'OWNER1', 'OWNNAME'], address: ['SITEADDRESS', 'SITUS', 'SITUSADDR', 'ADDRESS', 'FULLADDRESS', 'SITEADDR'], area: ['ACRES', 'GISACRES', 'LOTSIZE', 'AREA', 'SHAPEAREA', 'SQFT'], use: ['LANDUSE', 'USECODE', 'USEDESC', 'PROPCLASS', 'USE'] },
  buildings: { height: ['HEIGHT', 'BLDGHEIGHT', 'HGT', 'EAVEHEIGHT'], levels: ['NUMFLOORS', 'LEVELS', 'BUILDINGLEVELS', 'STORIES', 'FLOORS'], kind: ['CLASS', 'SUBTYPE', 'BUILDING', 'BLDGTYPE', 'TYPE'], name: ['NAME', 'BLDGNAME'] },
  zoning: { code: ['ZONE', 'ZONING', 'ZONECODE', 'ZONINGCODE', 'ZONECLASS', 'ZONEDIST', 'DISTRICT', 'ZONING1'], desc: ['ZONEDESC', 'ZONINGDESC', 'DESCRIPTION', 'ZONENAME', 'ZONINGNAME', 'LABEL'] },
  soils: { symbol: ['MUSYM', 'MAPUNITSYM'], key: ['MUKEY'], name: ['MUNAME', 'MAPUNITNAME', 'SOILNAME'], area: ['AREASYMBOL'] },
  flood: { zone: ['FLDZONE', 'FLOODZONE', 'ZONE'], subtype: ['ZONESUBTY', 'ZONESUBTYPE'], sfha: ['SFHATF', 'SFHA'], bfe: ['STATICBFE', 'BFE'], depth: ['DEPTH'] },
};

/** The open sources the framework knows how to read. `file` says what the person downloads; `fields` the kind it feeds. */
export const SOURCES = [
  { id: 'osm-buildings', kinds: ['buildings'], name: 'OpenStreetMap buildings', region: 'world', licence: 'ODbL (attribution and share-alike apply to a database made from it)', formats: ['GeoJSON', 'Shapefile', 'GeoPackage'], where: 'https://www.openstreetmap.org (extracts: https://download.geofabrik.de)', fields: { kind: 'building', levels: 'building:levels', height: 'height', name: 'name' }, checked: false },
  { id: 'overture-buildings', kinds: ['buildings'], name: 'Overture Maps buildings', region: 'world', licence: 'check the theme\'s licence at the source', formats: ['GeoJSON', 'GeoPackage'], where: 'https://overturemaps.org', fields: { height: 'height', levels: 'num_floors', kind: 'class' }, checked: false },
  { id: 'ms-buildings', kinds: ['buildings'], name: 'Microsoft building footprints', region: 'world', licence: 'ODbL (check at the source)', formats: ['GeoJSON'], where: 'https://github.com/microsoft/GlobalMLBuildingFootprints', fields: { height: 'height' }, checked: false },
  { id: 'fema-nfhl', kinds: ['flood'], name: 'FEMA National Flood Hazard Layer (flood hazard zones)', region: 'US', licence: 'US federal data (public); check the notice at the source', formats: ['Shapefile', 'GeoJSON', 'GeoPackage'], where: 'https://www.fema.gov/flood-maps/national-flood-hazard-layer', fields: { zone: 'FLD_ZONE', subtype: 'ZONE_SUBTY', sfha: 'SFHA_TF', bfe: 'STATIC_BFE' }, checked: false },
  { id: 'ssurgo', kinds: ['soils'], name: 'USDA SSURGO soil map units', region: 'US', licence: 'US federal data (public); check at the source', formats: ['Shapefile', 'GeoPackage'], where: 'https://websoilsurvey.nrcs.usda.gov', fields: { symbol: 'MUSYM', key: 'MUKEY', area: 'AREASYMBOL' }, checked: false, note: 'The map unit NAME is in the tabular tables, not in the shapefile; the symbol and key are.' },
  { id: 'usgs-3dep', kinds: ['terrain'], name: 'USGS 3D Elevation Program (DEM)', region: 'US', licence: 'US federal data (public)', formats: ['GeoTIFF'], where: 'https://www.usgs.gov/3d-elevation-program', checked: false, note: 'A terrain model imports through Surface › Terrain from a DEM (gis-terrain-ui.js), not through this framework.' },
  { id: 'copernicus-dem', kinds: ['terrain'], name: 'Copernicus DEM GLO-30', region: 'world', licence: 'check the Copernicus licence at the source', formats: ['GeoTIFF'], where: 'https://spacedata.copernicus.eu', checked: false, note: 'As above: imported as a DEM.' },
  { id: 'county-parcels', kinds: ['parcels'], name: 'County or city parcel layer (open data portal)', region: 'by place', licence: 'differs by county; many publish open data, some do not', formats: ['Shapefile', 'GeoJSON', 'GeoPackage'], where: 'the county or city GIS open-data portal', fields: {}, checked: false, note: 'No national open parcel layer exists. Field names differ by county; the reader guesses from the usual names and the person can say which field is which.' },
  { id: 'local-zoning', kinds: ['zoning'], name: 'City or county zoning layer (open data portal)', region: 'by place', licence: 'differs by place', formats: ['Shapefile', 'GeoJSON', 'GeoPackage'], where: 'the city or county GIS open-data portal', fields: {}, checked: false, note: 'Zoning code text (what the zone allows) is not in the layer; only the district code is.' },
];

const norm = (s) => String(s).toUpperCase().replace(/[^A-Z0-9]/g, '');
const pick = (props, names) => { if (!props) return undefined; const idx = {}; for (const k of Object.keys(props)) idx[norm(k)] = k; for (const n of names) if (idx[n] !== undefined) return props[idx[n]]; return undefined; };

export function mapFeature(kind, props, over = {}) {
  const N = NAMES[kind]; if (!N) return {};
  const out = {};
  for (const [field, names] of Object.entries(N)) {
    const forced = over[field];
    out[field] = forced !== undefined ? props?.[forced] : pick(props, names);
  }
  return out;
}

export function guessKind(layer) {
  const have = new Set((layer.fields || []).map((f) => norm(f.name ?? f)));
  const score = (kind, keys) => keys.reduce((s, k) => s + (NAMES[kind][k].some((n) => have.has(n)) ? 1 : 0), 0);
  const cands = [];
  if (layer.geom === 'pg') {
    cands.push({ kind: 'flood', score: score('flood', ['subtype', 'sfha', 'bfe']) * 2 + (have.has('FLDZONE') ? 2 : 0) });
    cands.push({ kind: 'soils', score: score('soils', ['symbol', 'key', 'name']) * 2 });
    cands.push({ kind: 'parcels', score: score('parcels', ['id', 'owner', 'address', 'use']) + 0.1 });
    cands.push({ kind: 'zoning', score: score('zoning', ['code', 'desc']) });
    cands.push({ kind: 'buildings', score: score('buildings', ['height', 'levels', 'kind']) + 0.05 });
  }
  const best = cands.filter((c) => c.score >= 1).sort((a, b) => b.score - a.score)[0];
  return best || null;
}

export function lonLatBox(lat, lon, radiusM) {
  const dLat = radiusM / 111320, dLon = radiusM / (111320 * Math.max(0.01, Math.cos((lat * Math.PI) / 180)));
  return { minX: lon - dLon, minY: lat - dLat, maxX: lon + dLon, maxY: lat + dLat };
}

// ---------------------------------------------------------------------------
// geometry helpers on the readers' shapes

const ringArea = (r) => { let a = 0; for (let i = 0, n = r.length; i < n; i++) { const p = r[i], q = r[(i + 1) % n]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; };
const inRing = (x, y, r) => { let k = false; for (let i = 0, j = r.length - 1; i < r.length; j = i++) { const a = r[i], b = r[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) k = !k; } return k; };
const inPoly = (x, y, poly) => inRing(x, y, poly[0]) && !poly.slice(1).some((h) => inRing(x, y, h));
const inGeom = (x, y, g) => g.t === 'pg' && g.c.some((poly) => inPoly(x, y, poly));
const bbox = (g) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; const take = (p) => { a = Math.min(a, p[0]); b = Math.min(b, p[1]); c = Math.max(c, p[0]); d = Math.max(d, p[1]); }; if (g.t === 'pt') take(g.c); else if (g.t === 'ln') g.c.forEach((l) => l.forEach(take)); else g.c.forEach((poly) => poly.forEach((r) => r.forEach(take))); return { minX: a, minY: b, maxX: c, maxY: d }; };
const centroid = (g) => { const b = bbox(g); return { x: (b.minX + b.maxX) / 2, y: (b.minY + b.maxY) / 2 }; };
function geomArea(g, kx, ky) { let a = 0; for (const poly of g.c) { a += Math.abs(ringArea(poly[0])); for (const h of poly.slice(1)) a -= Math.abs(ringArea(h)); } return a * kx * ky; }
const overlaps = (a, b) => a.minX <= b.maxX && a.maxX >= b.minX && a.minY <= b.maxY && a.maxY >= b.minY;
const text = (v) => (v === undefined || v === null ? '' : String(v).trim());
const num = (v) => { const n = typeof v === 'number' ? v : parseFloat(String(v ?? '').replace(/[^\d.\-]/g, '')); return Number.isFinite(n) ? n : null; };

export function siteAt(layers, { x, y, radius = 150, geographic = false, grid = 40 } = {}) {
  // metres per unit of x and y (so areas and distances are in metres)
  const kx = geographic ? 111320 * Math.cos((y * Math.PI) / 180) : 1, ky = geographic ? 111320 : 1;
  const r = geographic ? { dx: radius / kx, dy: radius / ky } : { dx: radius, dy: radius };
  const area = { minX: x - r.dx, minY: y - r.dy, maxX: x + r.dx, maxY: y + r.dy };
  const site = { point: { x, y }, parcel: null, neighbours: 0, buildings: [], zoning: [], soils: [], flood: null, missing: [], notes: [] };
  const byKind = {};
  for (const L of layers) { const kind = L.kind || guessKind(L.layer)?.kind; if (!kind) { site.notes.push('unknown-layer'); continue; } (byKind[kind] ||= []).push(L); }
  for (const k of ['parcels', 'buildings', 'zoning', 'soils', 'flood']) if (!byKind[k]) site.missing.push(k);
  const feats = (kind) => (byKind[kind] || []).flatMap((L) => (L.layer.features || []).map((f) => ({ f, over: L.fields || {} }))).filter(({ f }) => f.g && f.g.t === 'pg' && overlaps(bbox(f.g), area));
  // parcel at the point (the smallest one that holds it)
  let best = null;
  const pcs = feats('parcels');
  for (const { f, over } of pcs) if (inGeom(x, y, f.g)) { const a = geomArea(f.g, kx, ky); if (!best || a < best.area) best = { f, over, area: a }; }
  site.neighbours = Math.max(0, pcs.length - (best ? 1 : 0));
  if (byKind.parcels && !best) site.notes.push('no-parcel-at-point');
  if (best) {
    const rec = mapFeature('parcels', best.f.p, best.over), b = bbox(best.f.g);
    site.parcel = { record: { id: text(rec.id), owner: text(rec.owner), address: text(rec.address), use: text(rec.use) }, area: best.area, ring: best.f.g.c[0][0], bounds: b, claimedArea: num(rec.area) };
  }
  // buildings within the radius
  for (const { f, over } of feats('buildings')) {
    const c = centroid(f.g), d = Math.hypot((c.x - x) * kx, (c.y - y) * ky);
    if (d > radius) continue;
    const rec = mapFeature('buildings', f.p, over), levels = num(rec.levels);
    site.buildings.push({ record: { height: num(rec.height), levels, kind: text(rec.kind), name: text(rec.name) }, area: geomArea(f.g, kx, ky), d, x: c.x, y: c.y });
  }
  site.buildings.sort((a, b) => a.d - b.d);
  // shares of the parcel (or the point's surroundings, if there is no parcel) by sampling
  const samples = [];
  if (site.parcel) {
    const b = site.parcel.bounds, nx = grid, ny = grid;
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) { const px = b.minX + ((i + 0.5) * (b.maxX - b.minX)) / nx, py = b.minY + ((j + 0.5) * (b.maxY - b.minY)) / ny; if (best.f.g.c.some((poly) => inPoly(px, py, poly))) samples.push([px, py]); }
  }
  if (!samples.length) samples.push([x, y]);
  const share = (kind, key) => {
    const list = feats(kind), tally = new Map();
    for (const [px, py] of samples) { const hit = list.find(({ f }) => inGeom(px, py, f.g)); const k = hit ? key(hit) : null; if (k !== null) tally.set(k.id, { ...k, n: (tally.get(k.id)?.n || 0) + 1 }); }
    return [...tally.values()].sort((a, b) => b.n - a.n).map((v) => ({ ...v, share: v.n / samples.length }));
  };
  site.zoning = share('zoning', ({ f, over }) => { const r = mapFeature('zoning', f.p, over); const code = text(r.code); return code ? { id: code, code, desc: text(r.desc) } : null; }).map(({ id, n, ...v }) => v);
  site.soils = share('soils', ({ f, over }) => { const r = mapFeature('soils', f.p, over); const sym = text(r.symbol), key = text(r.key); return sym || key ? { id: sym + '|' + key, symbol: sym, key, name: text(r.name) } : null; }).map(({ id, n, ...v }) => v);
  const fz = share('flood', ({ f, over }) => {
    const r = mapFeature('flood', f.p, over), zone = text(r.zone); if (!zone) return null;
    const sf = text(r.sfha).toUpperCase(), sfha = sf ? sf === 'T' || sf === 'TRUE' || sf === 'YES' || sf === 'Y' || sf === '1' : /^(A|V)/i.test(zone);
    return { id: zone, zone, sfha, bfe: num(r.bfe) };
  });
  if (byKind.flood) {
    const atPoint = feats('flood').find(({ f }) => inGeom(x, y, f.g));
    const total = fz.reduce((s, v) => s + (v.sfha ? v.share : 0), 0);
    site.flood = { zones: fz.map(({ id, n, ...v }) => v), share: total, sfha: total > 0, atPoint: atPoint ? text(mapFeature('flood', atPoint.f.p, atPoint.over).zone) : '', bfe: fz.find((v) => v.bfe !== null)?.bfe ?? null };
  }
  return site;
}

export function siteRows(site) {
  const rows = [];
  if (site.parcel) {
    rows.push({ key: 'parcel', id: site.parcel.record.id, address: site.parcel.record.address, owner: site.parcel.record.owner, area: site.parcel.area });
    if (site.parcel.record.use) rows.push({ key: 'use', value: site.parcel.record.use });
  } else if (!site.missing.includes('parcels')) rows.push({ key: 'no-parcel' });
  if (site.neighbours) rows.push({ key: 'neighbours', n: site.neighbours });
  if (site.buildings.length) rows.push({ key: 'buildings', n: site.buildings.length, tallest: Math.max(0, ...site.buildings.map((b) => b.record.height ?? (b.record.levels ? b.record.levels * 3 : 0))), nearest: site.buildings[0].d });
  for (const z of site.zoning) rows.push({ key: 'zoning', code: z.code, desc: z.desc, share: z.share });
  for (const s of site.soils) rows.push({ key: 'soil', symbol: s.symbol, mukey: s.key, name: s.name, share: s.share });
  if (site.flood) rows.push({ key: 'flood', sfha: site.flood.sfha, share: site.flood.share, atPoint: site.flood.atPoint, bfe: site.flood.bfe, zones: site.flood.zones.map((z) => z.zone) });
  for (const k of site.missing) rows.push({ key: 'missing', kind: k });
  return rows;
}

/**
 * What the layers hold, as the items lib/site-context's buildContext takes (0.8 EG.63, civil_PART_4): each polygon's outer ring (longitude/latitude), a name, the building's
 * height and levels when the source gave them, a label (zoning code, flood zone, soil name). Layers whose kind is not known are left out.
 */
export function contextItems(layers) {
  const MAP = { parcels: 'parcel', buildings: 'building', zoning: 'zoning', soils: 'soil', flood: 'flood' }, out = [];
  for (const L of layers) {
    const kind = L.kind || guessKind(L.layer)?.kind, k = MAP[kind]; if (!k) continue;
    for (const f of L.layer.features || []) {
      if (!f.g || f.g.t !== 'pg') continue;
      const r = mapFeature(kind, f.p);
      const label = kind === 'zoning' ? [text(r.code), text(r.desc)].filter(Boolean).join(' – ') : kind === 'flood' ? text(r.zone) : kind === 'soils' ? [text(r.symbol), text(r.name)].filter(Boolean).join(' ') : '';
      out.push({ kind: k, rings: f.g.c.map((poly) => poly[0]).filter(Boolean), name: kind === 'parcels' ? [text(r.id), text(r.address)].filter(Boolean).join(' ') : kind === 'buildings' ? text(r.name) : '', height: kind === 'buildings' ? num(r.height) : null, levels: kind === 'buildings' ? num(r.levels) : null, label });
    }
  }
  return out;
}
