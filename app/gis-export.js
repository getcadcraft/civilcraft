/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gis-export.js — CivilCraft's own objects as GIS feature layers, and the three writers behind GIS › Export
 * (docs/GIS-SPEC.md §2). No DOM; the Node test drives it exactly as the page does.
 *
 *   exportKinds(project) → [{ key, label, geom, count, file }]      what can be exported now (count 0 = nothing yet)
 *   exportGroups(project, keys, { toGrid }) → [{ key, label, file, geom, hasZ, fields, features }]
 *     features in GRID coordinates: every x, y goes through toGrid (frame.toGrid; identity when the project has no
 *     system). Lengths and elevations stay in project units. Kinds and their fields:
 *       points        survey points (point Z): P, N, E, Z, D        (N, E = the grid coordinates written)
 *       contours-eg / contours-fg   contours of existing ground / the graded surface (line Z at the contour): ELEV
 *       breaklines    the surface's breaklines (line Z): NAME
 *       boundary      the drawn boundary, else the surface's edge (polygon): NAME
 *       alignments    centerlines (line): NAME, LENGTH, STA_START, STA_END   (stations as numbers in project units)
 *       pads          pads (polygon Z at the pad elevation): NAME, ELEV, AREA
 *       daylight      daylight lines of pads and corridors (line Z): NAME
 *       corridor      corridor feature lines CL, EOP, SH (line Z): NAME, CODE
 *       pipes         pipes (line Z from upper to lower invert): NAME, FROM, TO, DIA, DIA_UNIT, INV_UP, INV_DN, SLOPE (%),
 *                     LENGTH, NETWORK
 *       structures    structures (point Z at the rim): NAME, RIM, INVERT (the lowest pipe invert there), SUMP, DIA, DIA_UNIT
 *       gis:<id>      a GIS layer itself, with its own fields
 *   await writeExport(groups, { format: 'shp'|'geojson'|'gpkg'|'kml'|'kmz', crs, prj, toLonLat, zToMetres, stem }) →   (kml/kmz: 0.4 V6)
 *     { name, bytes, type, notes }   shp = one .zip (a shapefile per kind + .cpg UTF-8 + .prj when given);
 *     geojson = one FeatureCollection, a "kind" property on every feature; gpkg = one GeoPackage, a table per kind
 */

import { writeShapefile } from './shapefile.js';
import { writeGeoJSON } from './geojson.js';
import { writeKml } from './kml.js';   // 0.4 V6
import { t } from './i18n.js';
import { zip } from './zipfile.js';
import { mapXY, ringArea, pointInRing } from './gis-geom.js';
import { DIA_UNIT } from './pipes.js';
import { frame, transformer, prjFor, METRES_PER as CRS_METRES } from './crs.js';

// [key, label key, geometry, file stem] (labels looked up when used: language files load after this module)
const KINDS = [
  ['points', 'gexp.kind.points', 'pt', 'survey_points'],
  ['contours-eg', 'gexp.kind.contours-eg', 'ln', 'contours_existing'],
  ['contours-fg', 'gexp.kind.contours-fg', 'ln', 'contours_graded'],
  ['breaklines', 'gexp.kind.breaklines', 'ln', 'breaklines'],
  ['boundary', 'gexp.kind.boundary', 'pg', 'boundary'],
  ['alignments', 'gexp.kind.alignments', 'ln', 'alignments'],
  ['pads', 'gexp.kind.pads', 'pg', 'pads'],
  ['daylight', 'gexp.kind.daylight', 'ln', 'daylight_lines'],
  ['corridor', 'gexp.kind.corridor', 'ln', 'corridor_lines'],
  ['pipes', 'gexp.kind.pipes', 'ln', 'pipes'],
  ['structures', 'gexp.kind.structures', 'pt', 'structures'],
];

export function safeName(s, used) {
  let b = String(s).normalize('NFKD').replace(/[^A-Za-z0-9_]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 40) || 'layer';
  if (/^\d/.test(b)) b = 'l_' + b;
  let k = b, j = 2;
  while (used.has(k.toLowerCase())) k = b + '_' + j++;
  used.add(k.toLowerCase());
  return k;
}

const P2 = (p) => [p.x, p.y];
const P3 = (p, z) => [p.x, p.y, z ?? p.z ?? 0];
const close = (r) => (r.length && (r[0][0] !== r[r.length - 1][0] || r[0][1] !== r[r.length - 1][1]) ? [...r, r[0]] : r);

/** Loops (each [{x,y}]) nested by containment: even depth = outer, odd = hole of the loop around it. */
function nest(loops) {
  const rings = loops.map((l) => close(l.map(P2))).filter((r) => r.length >= 4).map((r) => ({ r, a: Math.abs(ringArea(r)) })).sort((a, b) => b.a - a.a);
  const polys = [];
  for (let i = 0; i < rings.length; i++) {
    let parent = -1;
    for (let j = i - 1; j >= 0; j--) if (pointInRing(rings[i].r[0][0], rings[i].r[0][1], rings[j].r)) { parent = j; break; }
    rings[i].depth = parent < 0 ? 0 : rings[parent].depth + 1;
    if (rings[i].depth % 2 === 0) { rings[i].poly = [rings[i].r]; polys.push(rings[i].poly); } else rings[parent].poly.push(rings[i].r);
  }
  return polys;
}

// i18n-ignore-start: NAME attribute values written into the exported files (data, not UI)
function build(project, key) {
  const s = project.state, units = s.units;
  const F = (name, type) => ({ name, type });
  const P = () => Object.create(null);
  const feat = (g, props) => { const p = P(); Object.assign(p, props); return { g, p }; };
  switch (key) {
    case 'points': return { hasZ: project.points.some((q) => q.z !== null), fields: [F('P', 'text'), F('N', 'number'), F('E', 'number'), F('Z', 'number'), F('D', 'text')],
      features: project.points.map((q) => feat({ t: 'pt', c: q.z === null ? [q.x, q.y] : [q.x, q.y, q.z] }, { P: q.n, N: q.y, E: q.x, Z: q.z, D: q.d || '' })), coordFields: { N: 'y', E: 'x' } };
    case 'contours-eg': case 'contours-fg': {
      const sf = key === 'contours-eg' ? project.eg().surface : project.graded().surface;
      const list = sf ? project.contours(sf, key === 'contours-eg' ? 'eg' : 'fg') : [];
      return { hasZ: true, fields: [F('ELEV', 'number')], features: list.map((c) => feat({ t: 'ln', c: [(c.closed ? close(c.pts.map(P2)) : c.pts.map(P2)).map((p) => [p[0], p[1], c.z])] }, { ELEV: c.z })) };
    }
    case 'breaklines': return { hasZ: true, fields: [F('NAME', 'text')], features: project.egBreaklines().filter((b) => b.pts.length >= 2).map((b) => feat({ t: 'ln', c: [b.pts.map((p) => P3(p))] }, { NAME: b.name || 'Breakline' })) };
    case 'boundary': {
      const b = s.surface.boundary;
      if (b?.length >= 3) return { hasZ: false, fields: [F('NAME', 'text')], features: [feat({ t: 'pg', c: [[close(b.map(P2))]] }, { NAME: 'Boundary' })] };
      const sf = project.eg().surface;
      const polys = sf ? nest(sf.outline()) : [];
      return { hasZ: false, fields: [F('NAME', 'text')], features: polys.length ? [feat({ t: 'pg', c: polys }, { NAME: 'Surface edge' })] : [] };
    }
    case 'alignments': return { hasZ: false, fields: [F('NAME', 'text'), F('LENGTH', 'number'), F('STA_START', 'number'), F('STA_END', 'number')],
      features: s.alignments.map((a) => { const al = project.alignment(a); return al.ok ? feat({ t: 'ln', c: [al.polyline(Infinity, Math.PI / 360).map(P2)] }, { NAME: a.name, LENGTH: al.length, STA_START: al.start, STA_END: al.end }) : null; }).filter(Boolean) };
    case 'pads': return { hasZ: true, fields: [F('NAME', 'text'), F('ELEV', 'number'), F('AREA', 'number')],
      features: s.pads.filter((d) => d.pts.length >= 3).map((d) => feat({ t: 'pg', c: [[close(d.pts.map((p) => [p.x, p.y, Number(d.z)]))]] }, { NAME: d.name, ELEV: Number(d.z), AREA: Math.abs(ringArea(d.pts.map(P2))) })) };
    case 'daylight': {
      const out = [];
      for (const it of project.graded().items || []) {
        if (it.kind === 'pad' && it.daylight?.length >= 3 && !it.problems?.length) out.push(feat({ t: 'ln', c: [close(it.daylight.map((p) => P3(p)))] }, { NAME: (it.name || 'Pad') + ' daylight' }));
        if (it.kind === 'corridor') for (const k of ['DL_L', 'DL_R']) if (it.lines?.[k]?.length >= 2) out.push(feat({ t: 'ln', c: [it.lines[k].map((p) => P3(p))] }, { NAME: (it.name || 'Corridor') + ' ' + k }));
      }
      return { hasZ: true, fields: [F('NAME', 'text')], features: out };
    }
    case 'corridor': {
      const out = [];
      for (const it of project.graded().items || []) {
        if (it.kind !== 'corridor') continue;
        for (const k of ['CL', 'EOP_L', 'EOP_R', 'SH_L', 'SH_R']) if (it.lines?.[k]?.length >= 2) out.push(feat({ t: 'ln', c: [it.lines[k].map((p) => P3(p))] }, { NAME: it.name || 'Corridor', CODE: k }));
      }
      return { hasZ: true, fields: [F('NAME', 'text'), F('CODE', 'text')], features: out };
    }
    case 'pipes': {
      const n = s.network; if (!n) return { hasZ: true, fields: [], features: [] };
      const chk = project.networkCheck(), by = new Map(n.structures.map((x) => [x.id, x])), du = DIA_UNIT[units === 'm' ? 'm' : 'ft'].name;
      return { hasZ: true, fields: [F('NAME', 'text'), F('FROM', 'text'), F('TO', 'text'), F('DIA', 'number'), F('DIA_UNIT', 'text'), F('INV_UP', 'number'), F('INV_DN', 'number'), F('SLOPE', 'number'), F('LENGTH', 'number'), F('NETWORK', 'text')],
        features: n.pipes.map((p) => { const a = by.get(p.from), b = by.get(p.to); if (!a || !b) return null; const info = chk?.pipes.get(p.id);
          const fin = (v) => (Number.isFinite(v) ? v : null);
          return feat({ t: 'ln', c: [[[a.x, a.y, fin(p.invUp) ?? 0], [b.x, b.y, fin(p.invDn) ?? 0]]] }, { NAME: p.name, FROM: a.name, TO: b.name, DIA: p.dia, DIA_UNIT: du, INV_UP: fin(p.invUp), INV_DN: fin(p.invDn), SLOPE: info && Number.isFinite(info.slope) ? info.slope * 100 : null, LENGTH: info ? info.len : Math.hypot(b.x - a.x, b.y - a.y), NETWORK: n.name + ' (' + n.type + ')' }); }).filter(Boolean) };
    }
    case 'structures': {
      const n = s.network; if (!n) return { hasZ: true, fields: [], features: [] };
      const chk = project.networkCheck(), du = DIA_UNIT[units === 'm' ? 'm' : 'ft'].name;
      return { hasZ: true, fields: [F('NAME', 'text'), F('RIM', 'number'), F('INVERT', 'number'), F('SUMP', 'number'), F('DIA', 'number'), F('DIA_UNIT', 'text')],
        features: n.structures.map((x) => {
          const info = chk?.structs.get(x.id), rim = info?.rim ?? (Number.isFinite(x.rim) ? x.rim : null);
          const inv = [...n.pipes.filter((p) => p.to === x.id).map((p) => p.invDn), ...n.pipes.filter((p) => p.from === x.id).map((p) => p.invUp)].filter(Number.isFinite);
          return feat({ t: 'pt', c: rim === null ? [x.x, x.y] : [x.x, x.y, rim] }, { NAME: x.name, RIM: rim, INVERT: inv.length ? Math.min(...inv) : null, SUMP: info?.sump ?? null, DIA: x.dia, DIA_UNIT: du });
        }) };
    }
    default: {
      const id = key.startsWith('gis:') ? key.slice(4) : null;
      const l = id && project.state.gis?.layers.find((q) => q.id === id);
      if (!l) return null;
      return { hasZ: !!l.hasZ, fields: l.fields, features: project.gisFeatures.get(id) || [] };   // empty geometries kept (attributes)
    }
  }
}
// i18n-ignore-end

export function exportKinds(project) {
  const out = KINDS.map(([key, labelKey, geom, file]) => ({ key, label: t(labelKey), geom, file, count: build(project, key)?.features.length || 0 }));
  for (const l of project.state.gis?.layers || []) out.push({ key: 'gis:' + l.id, label: t('gexp.kind.gis', { layer: l.name }), geom: l.geom, file: l.name, count: (project.gisFeatures.get(l.id) || []).length });
  return out;
}

export function exportGroups(project, keys, { toGrid = (x, y) => [x, y] } = {}) {
  const kinds = exportKinds(project), used = new Set(), out = [];
  for (const key of keys) {
    const k = kinds.find((x) => x.key === key), b = build(project, key);
    if (!k || !b || !b.features.length) continue;
    const features = b.features.map((f) => {
      const g = mapXY(f.g, toGrid);
      if (!b.coordFields) return { g, p: f.p };
      const p = Object.create(null); Object.assign(p, f.p);
      if (g) { p.E = g.c[0]; p.N = g.c[1]; }
      return { g, p };
    });
    out.push({ key, label: k.label, kind: key.startsWith('gis:') ? safeName(k.file, new Set()) : k.file, file: safeName(k.file, used), geom: k.geom, hasZ: b.hasZ && features.some((f) => f.g && (f.g.t === 'pt' ? f.g.c.length > 2 : true)), fields: b.fields, features });
  }
  return out;
}

export async function writeExport(groups, { format, crs = null, prj = null, toLonLat = null, zToMetres = (z) => z, stem = 'site', srs = null } = {}) {
  const notes = [];
  if (!groups.length) throw new Error(t('gexp.nothing'));
  if (format === 'shp') {
    const files = [];
    for (const g of groups) {
      const { shp, shx, dbf, names } = writeShapefile(g);
      files.push({ name: g.file + '.shp', data: shp }, { name: g.file + '.shx', data: shx }, { name: g.file + '.dbf', data: dbf }, { name: g.file + '.cpg', data: 'UTF-8' });
      if (prj) files.push({ name: g.file + '.prj', data: prj });
      const renamed = g.fields.map((f, i) => [f.name, names[i]]).filter(([a, b]) => a !== b);
      if (renamed.length) notes.push(t(renamed.length > 8 ? 'gexp.shortened.more' : 'gexp.shortened', { kind: g.label, list: renamed.slice(0, 8).map(([a, b]) => a + ' → ' + b).join(', ') }));
    }
    return { name: stem + '-gis.zip', bytes: await zip(files), type: 'application/zip', notes };
  }
  if (format === 'geojson') {
    if (!toLonLat) throw new Error(t('gexp.geojson.crs'));
    return { name: stem + '.geojson', bytes: new TextEncoder().encode(writeGeoJSON(groups.map((g) => ({ ...g, kind: g.kind })), { toLonLat, zToMetres, name: stem })), type: 'application/geo+json', notes };
  }
  if (format === 'kml' || format === 'kmz') {   // 0.4 V6: longitude/latitude, like GeoJSON
    if (!toLonLat) throw new Error(t('kml.need.crs'));
    const text = writeKml(groups, { toLonLat, zToMetres: (z) => zToMetres(z), name: stem });
    if (format === 'kml') return { name: stem + '.kml', bytes: new TextEncoder().encode(text), type: 'application/vnd.google-earth.kml+xml', notes };
    return { name: stem + '.kmz', bytes: await zip([{ name: 'doc.kml', data: text }]), type: 'application/vnd.google-earth.kmz', notes };
  }
  if (format === 'gpkg') {
    const { writeGpkg } = await import('./gpkg.js');
    const bytes = await writeGpkg(groups.map((g) => ({ table: g.file, label: g.label, geom: g.geom, hasZ: g.hasZ, fields: g.fields, features: g.features })), { srs });
    return { name: stem + '.gpkg', bytes, type: 'application/geopackage+sqlite3', notes };
  }
  throw new Error('Unknown format.');   // i18n-ignore: developer error (the page only offers known formats)
}

/** The GeoPackage spatial reference row for the project's system: its EPSG code as srs_id (as GDAL does), the WKT from
 *  prjFor as the definition; a system without a code gets srs_id 100000 (organization NONE). null → no system. */
export function srsFor(crs, prj) {
  if (!crs) return null;
  return crs.code ? { id: crs.code, org: 'EPSG', code: crs.code, name: crs.name, definition: prj || 'undefined' } : { id: 100000, org: 'NONE', code: 100000, name: crs.name, definition: prj || 'undefined' };
}

/** GIS › Export in one call (the page and the test both use it): the chosen kinds in grid coordinates, written as
 *  `format`; GeoJSON needs a project system (refused with the reason otherwise); without one, shapefiles and
 *  GeoPackages carry the project's own numbers and no system (a note says so). */
export async function exportProject(project, keys, format, { stem = 'site' } = {}) {
  const crs = project.state.crs;
  if (format === 'geojson' && !crs) throw new Error(t('gexp.geojson.need'));
  if ((format === 'kml' || format === 'kmz') && !crs) throw new Error(t('kml.need.crs'));   // 0.4 V6
  const f = crs ? frame(crs) : null;
  const groups = exportGroups(project, keys, f ? { toGrid: f.toGrid } : {});
  const prj = crs ? await prjFor(crs) : null;
  const toLonLat = crs ? transformer(crs, null) : null;
  const k = crs ? CRS_METRES[crs.unit] || 1 : 1;
  const r = await writeExport(groups, { format, prj, toLonLat, zToMetres: (z) => z * k, stem, srs: srsFor(crs, prj) });
  if (!crs) r.notes.unshift(t('gexp.nocrs'));
  else if (!['geojson', 'kml', 'kmz'].includes(format) && crs.code == null && !prj) r.notes.unshift(t('gexp.nocode'));
  if (crs?.local && !['geojson', 'kml', 'kmz'].includes(format)) r.notes.push(t('gexp.grid', { crs: crs.name }));
  r.groups = groups;
  return r;
}
