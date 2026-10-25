/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page (AGENTS-SPEC §5) */
/**
 * civil-agent.js — CivilCraft's live tools for AI assistants and scripts (0.4 X.12; docs/AGENTS-SPEC.md §5.2, §6.3). No
 * DOM: bin/test-civilcraft-agent.mjs runs them in Node through host.js's dispatcher on the sample site.
 *
 *   civilTools(app) → [tool definitions] for host.control.tool(def)
 *     app.project()          → the open Project (project.js)
 *     app.select(nums, mode) → how many points are selected after it (mode 'replace' | 'add' | 'remove'; the page shows it)
 *
 * Tools (coordinates in the project's units, easting x / northing y; stations as numbers):
 *   site_describe       read  name, units, coordinate system, points (count, with elevation, groups), alignments (name,
 *                             start, end, length), surfaces (existing ground, graded: points, triangles, z range, area),
 *                             pads, parcels, pipe network
 *   points_list         read  group?, description? (contains), within? {minX, minY, maxX, maxY}, offset, limit ≤ 1000
 *                             → {total, offset, points: [{n, x, y, z, d}]}
 *   surface_elevation   read  points [{x, y}] (≤ 1000), surface eg | graded → [{x, y, z | null}] (null: off the surface)
 *   alignment_station   read  alignment (name or id; default the only one), points [{x, y}] → station, offset (+ right),
 *                             outside; or stations [n] → x, y, direction (degrees from north, clockwise) and ground z
 *   points_select       edit  numbers[] or the same filters as points_list, mode replace | add | remove → {selected};
 *                             the selection only: no point changes, no undo step
 * 0.7 AS.3 (session assistants; live and headless — tools/cli/headless/civil.mjs gives them a project):
 *   parcels_list        read  parcels: corners, area (+ in words), perimeter; legal: true adds each legal description
 *   surface_volume      read  cut / fill between the existing ground and the graded surface (the pads' and corridors'
 *                             daylight lines, or a region), or between the existing ground and a level (datum)
 *   profile_sample      read  along an alignment every `step`: ground, design profile and graded surface elevations
 *   points_add          edit  survey points (number, x, y, z, description; numbers given or the next free), one undo step
 *   project_save        save  the app's own Save (window only: app.saveProject); Studio: to a path in the allowed folders
 *   landxml_export      export  landXmlOf(project) as the app's Export › LandXML writes it; to a path (Studio) or a download
 *   dwg_export          export  the app's own DWG export (window only: app.exportDwg, its drawing comes from the panels)
 *   usd_export          export  the site in 3D as OpenUSD (site3d.js + usd-civilcraft.js, as the 3D view's Export › USD; 0.7 AS.6)
 *   app also: changed() after an edit (the page redraws), files (host.control.files: paths), download(bytes, name, mime)
 *   landXmlOf(project, {date}) → the LandXML text (the same composition as civilcraft.js exportLandXml; a browser test
 *   compares the two)
 */
import { groupKey } from './points.js';
import { parcelArea, perimeter, areaWords, legalDescription } from './parcels.js';
import { gridVolume } from './grading.js';
import { sampleSurface } from './profile.js';
import { writeLandXml } from './landxml.js';
import { UNITS, formatStation } from './units.js';
import { t } from './i18n.js';

const LIMIT = 1000;
const XY = { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'], additionalProperties: false };
const FILTERS = {
  group: { type: 'string', description: 'Point group: the first word of the description, upper case (as the Points panel lists them).' },
  description: { type: 'string', description: 'Text the description contains (case does not matter).' },
  within: {
    type: 'object', description: 'A box in project coordinates.',
    properties: { minX: { type: 'number' }, minY: { type: 'number' }, maxX: { type: 'number' }, maxY: { type: 'number' } },
    required: ['minX', 'minY', 'maxX', 'maxY'], additionalProperties: false,
  },
};

const r6 = (v) => (v === null || v === undefined || !Number.isFinite(v) ? null : Math.round(v * 1e6) / 1e6);

/** Points matching the filters (all points when none is given). */
export function filterPoints(points, a) {
  const g = a.group ? String(a.group).trim().toUpperCase() : null, d = a.description ? String(a.description).toLowerCase() : null, w = a.within;
  return points.filter((p) => (!g || groupKey(p.d) === g) && (!d || String(p.d || '').toLowerCase().includes(d)) && (!w || (p.x >= w.minX && p.x <= w.maxX && p.y >= w.minY && p.y <= w.maxY)));
}

/** The project as LandXML, as Export › LandXML writes it (civilcraft.js exportLandXml): points, the existing ground and the
 *  graded surface, alignments with their ground and design profiles, feature lines, the pipe network. */
export function landXmlOf(p, { date } = {}) {
  const s = p.state, r = p.eg();
  const surfaces = [];
  if (r.surface) surfaces.push({ name: s.surface.name || t('surface.eg'), desc: t('surface.eg'), surface: r.surface, breaklines: p.egBreaklines(), boundary: s.surface.boundary });
  const g = p.graded();
  if (g.surface) surfaces.push({ name: t('cv.lx.proposed'), desc: t('cv.lx.proposed.desc', { n: s.pads.length }), surface: g.surface });
  return writeLandXml({
    name: s.name, units: s.units, points: p.points, surfaces, crs: s.crs, ...(date ? { date } : {}),
    alignments: s.alignments.map((a) => ({ name: a.name, alignment: p.alignment(a), eg: r.surface ? { name: s.surface.name || t('surface.eg'), pts: p.egProfile(a) } : null, profile: a.pvis.length >= 2 ? { name: t('cv.lx.design', { name: a.name }), profile: p.designProfile(a) } : null })),
    features: s.features || [],
    networks: s.network ? [{ ...s.network, structures: s.network.structures.map((x) => { const i = p.networkCheck().structs.get(x.id); return { ...x, rimShown: i?.rim ?? null, sump: i?.sump ?? null }; }) }] : [],
  });
}

const PATH = { type: 'string', minLength: 1, maxLength: 4096, description: 'Studio: a file inside the folders the person allowed (Settings › CivilCraft › Assistants › Folders); without it the file downloads as the button would.' };
const POLY = { type: 'array', items: XY, minItems: 3, maxItems: 10000 };
const unitsOf = (p) => UNITS[p.state.units] || UNITS.ft;

export function civilTools(app) {
  const P = () => app.project();
  const findAl = (p, ref) => {
    const all = p.state.alignments;
    if (ref === undefined || ref === null || ref === '') {
      if (all.length === 1) return all[0];
      throw new Error(all.length ? 'Say which alignment: ' + all.map((a) => a.name).join(', ') + '.' : 'The site has no alignment.');
    }
    const a = all.find((x) => x.id === ref) || all.find((x) => x.name.toLowerCase() === String(ref).toLowerCase());
    if (!a) throw new Error('No alignment "' + ref + '". There are: ' + (all.map((x) => x.name).join(', ') || 'none') + '.');
    return a;
  };
  return [
    {
      name: 'site_describe', group: 'read', title: 'Describe the site',
      description: 'The open CivilCraft project: name, units, coordinate system, survey points and their groups, alignments, surfaces, parcels and pipes.',
      run: () => {
        const p = P(), s = p.state, groups = new Map();
        for (const pt of p.points) { const k = groupKey(pt.d); groups.set(k, (groups.get(k) || 0) + 1); }
        const eg = p.eg().surface, fg = p.graded().surface;
        const st = (sf) => { if (!sf) return null; const x = sf.stats(); return { points: x.points, triangles: x.triangles, minZ: r6(x.minZ), maxZ: r6(x.maxZ), area2d: r6(x.area2d) }; };
        return {
          name: s.name, units: s.units, crs: s.crs ? { name: s.crs.name || null, code: s.crs.code || null } : null,
          points: { count: p.points.length, withElevation: p.points.filter((q) => q.z !== null && q.z !== undefined).length, groups: [...groups].map(([group, count]) => ({ group, count })).sort((a, b) => a.group.localeCompare(b.group)) },
          alignments: s.alignments.map((a) => { const al = p.alignment(a); return { id: a.id, name: a.name, ok: al.ok, start: r6(al.start), end: r6(al.end), length: r6(al.length) }; }),
          surfaces: { existingGround: st(eg), graded: fg && fg !== eg ? st(fg) : null },
          pads: (s.pads || []).length, parcels: (s.parcels || []).length,
          network: s.network ? { name: s.network.name, structures: s.network.structures.length, pipes: s.network.pipes.length } : null,
        };
      },
    },
    {
      name: 'points_list', group: 'read', title: 'List survey points',
      description: 'Survey points of the open site (number, easting x, northing y, elevation z, description), filtered and paged.',
      inputSchema: { type: 'object', properties: { ...FILTERS, offset: { type: 'integer', minimum: 0 }, limit: { type: 'integer', minimum: 1, maximum: LIMIT } }, additionalProperties: false },
      run: (a) => {
        const pts = filterPoints(P().points, a), offset = a.offset || 0, limit = a.limit || 100;
        return { total: pts.length, offset, points: pts.slice(offset, offset + limit).map((q) => ({ n: q.n, x: q.x, y: q.y, z: q.z ?? null, d: q.d || '' })) };
      },
    },
    {
      name: 'surface_elevation', group: 'read', title: 'Surface elevations',
      description: 'Elevation of the existing ground (eg) or the graded surface at given points; null where a point is off the surface.',
      inputSchema: { type: 'object', properties: { points: { type: 'array', items: XY, minItems: 1, maxItems: LIMIT }, surface: { type: 'string', enum: ['eg', 'graded'] } }, required: ['points'], additionalProperties: false },
      run: (a) => {
        const p = P(), sf = (a.surface === 'graded' ? p.graded() : p.eg()).surface;
        if (!sf) throw new Error(a.surface === 'graded' ? 'The site has no graded surface (no pads or grading yet).' : 'The site has no existing-ground surface (no points with elevations).');
        return { surface: a.surface || 'eg', points: a.points.map((q) => ({ x: q.x, y: q.y, z: r6(sf.elevationAt(q.x, q.y)) })) };
      },
    },
    {
      name: 'alignment_station', group: 'read', title: 'Station and offset',
      description: 'Station and offset (+ = right) of points along an alignment, or the coordinates of stations on it (with the ground elevation there).',
      inputSchema: {
        type: 'object', properties: {
          alignment: { type: 'string', description: 'Its name or id; may be left out when the site has one alignment.' },
          points: { type: 'array', items: XY, maxItems: LIMIT },
          stations: { type: 'array', items: { type: 'number' }, maxItems: LIMIT },
        }, additionalProperties: false,
      },
      run: (a) => {
        const p = P(), ref = findAl(p, a.alignment), al = p.alignment(ref);
        if (!al.ok) throw new Error('Alignment "' + ref.name + '" cannot be built: ' + (al.errors[0] || 'it needs at least two PIs') + '.');
        if (!a.points?.length && !a.stations?.length) throw new Error('Give points (for their stations) or stations (for their coordinates).');
        const eg = p.eg().surface;
        const out = { alignment: ref.name, start: r6(al.start), end: r6(al.end) };
        if (a.points?.length) out.points = a.points.map((q) => { const so = al.stationOffset(q.x, q.y); return { x: q.x, y: q.y, station: r6(so.sta), offset: r6(so.off), outside: !!so.outside }; });
        if (a.stations?.length) out.stations = a.stations.map((sta) => {
          if (sta < al.start - 1e-9 || sta > al.end + 1e-9) return { station: sta, outside: true };
          const q = al.pointAt(sta);
          return { station: sta, x: r6(q.x), y: r6(q.y), direction: r6(((90 - q.dir * 180 / Math.PI) % 360 + 360) % 360), ground: eg ? r6(eg.elevationAt(q.x, q.y)) : null };
        });
        return out;
      },
    },
    {
      name: 'points_select', group: 'edit', title: 'Select survey points',
      description: 'Select survey points on the plan (by number or by the points_list filters), to show them to the person or before they copy or delete them. Changes no point.',
      inputSchema: { type: 'object', properties: { numbers: { type: 'array', items: { type: 'string' }, maxItems: 100000 }, ...FILTERS, mode: { type: 'string', enum: ['replace', 'add', 'remove'] } }, additionalProperties: false },
      run: (a) => {
        const p = P();
        let nums;
        if (a.numbers) {
          const have = new Set(p.points.map((q) => q.n)), bad = a.numbers.filter((n) => !have.has(n));
          if (bad.length) throw new Error('Unknown point numbers: ' + bad.slice(0, 20).join(', ') + (bad.length > 20 ? ' …' : '') + '. Nothing selected.');
          nums = [...new Set(a.numbers)];
        } else if (a.group || a.description || a.within) nums = filterPoints(p.points, a).map((q) => q.n);
        else throw new Error('Say which points: numbers, or group / description / within.');
        return { matched: nums.length, selected: app.select(nums, a.mode || 'replace') };
      },
    },
    ...moreTools(app, P, findAl),
  ].filter((d) => d && (d.name !== 'points_select' || app.select));
}

/** 0.7 AS.3: parcels, volumes, profiles, adding points, saving and exports. */
function moreTools(app, P, findAl) {
  const out = async (bytes, name, mime, a) => {   // a file the tool makes: to a.path (Studio), else the download the button makes
    if (a.path) {
      if (!app.files || !app.files.available) throw new Error('File paths work only in CadCraft Studio (the desktop app).');
      if (app.write) return { path: await app.write(a.path, bytes, { overwrite: a.overwrite }) };
      return { path: await app.files.write(a.path, bytes, { overwrite: a.overwrite }) };
    }
    if (!app.download) throw new Error('Give a path to write the file to.');
    app.download(bytes, name, mime);
    return { downloaded: name };
  };
  const stem = (p) => (p.state.name || 'site').replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '_').trim().slice(0, 80) || 'site';
  const tools = [
    {
      name: 'parcels_list', group: 'read', title: 'List parcels',
      description: 'Parcels of the site: name, corners (x, y; a bulge b on a corner makes the side after it an arc), area (square units and in words, with acres or hectares), perimeter. legal: true adds each one\'s legal description (metes and bounds).',
      inputSchema: { type: 'object', properties: { legal: { type: 'boolean', default: false }, name: { type: 'string', maxLength: 200 } }, additionalProperties: false },
      run: (a) => {
        const p = P(), u = p.state.units;
        const list = (p.state.parcels || []).filter((x) => !a.name || x.name.toLowerCase().includes(String(a.name).toLowerCase()));
        return { units: u, total: list.length, parcels: list.map((x) => ({ id: x.id, name: x.name, corners: x.pts.map((q) => ({ x: r6(q.x), y: r6(q.y), ...(q.b ? { b: r6(q.b) } : {}) })), area: r6(parcelArea(x.pts)), areaText: areaWords(parcelArea(x.pts), u), perimeter: r6(perimeter(x.pts)), ...(a.legal ? { legal: legalDescription(x, { units: u }) } : {}) })) };
      },
    },
    {
      name: 'surface_volume', group: 'read', title: 'Cut and fill',
      description: 'Cut and fill volumes (grid method), in cubic yards (ft projects) or cubic meters: between the existing ground and the graded surface inside the pads\' and corridors\' daylight lines (each item too), or inside a region you give; with datum, between the existing ground and that level (cut = ground above it to take off, fill = room below it to fill). cell = the grid size (default about 1/250 000 of the area).',
      inputSchema: { type: 'object', properties: { datum: { type: 'number' }, region: { ...POLY, description: 'A closed outline [{x, y}, …] in project coordinates.' }, cell: { type: 'number', minimum: 0.001, maximum: 1e6 } }, additionalProperties: false },
      run: (a) => {
        const p = P(), eg = p.eg().surface, u = unitsOf(p);
        if (!eg) throw new Error('The site has no existing-ground surface (no points with elevations).');
        const shape = (v) => ({ cut: r6(v.cut / u.volPer), fill: r6(v.fill / u.volPer), net: r6((v.fill - v.cut) / u.volPer), unit: u.vol, area: r6(v.area), cell: r6(v.cell), cells: v.cells });
        if (a.datum !== undefined) {
          const flat = { bounds: eg.bounds, elevationAt: (x, y) => (eg.elevationAt(x, y) === null ? null : a.datum) };
          return { between: 'existing ground and elevation ' + a.datum, ...shape(gridVolume(eg, flat, { region: a.region || null, cell: a.cell })) };
        }
        const g = p.graded();
        if (!g.surface || g.surface === eg) throw new Error('The site has no graded surface yet (no pads, corridors or design feature lines): give a datum to measure against a level.');
        if (a.region) return { between: 'existing ground and graded surface', ...shape(gridVolume(eg, g.surface, { region: a.region, cell: a.cell })) };
        const v = p.volumes(a.cell);
        if (!v) throw new Error('Nothing is graded inside daylight lines yet.');
        return { between: 'existing ground and graded surface', ...shape(v), items: (v.items || []).map((it) => ({ id: it.id, name: it.name, ...shape(it) })) };
      },
    },
    {
      name: 'profile_sample', group: 'read', title: 'Profile along an alignment',
      description: 'Elevations along an alignment every step (default: the alignment length / 1000, at least 0.5, plus its key stations): existing ground, the design profile where it has one, the graded surface where there is one. Stations as numbers and as text (12+34.56). At most 2000 rows.',
      inputSchema: { type: 'object', properties: { alignment: { type: 'string' }, step: { type: 'number', minimum: 0.01, maximum: 1e6 }, from: { type: 'number' }, to: { type: 'number' } }, additionalProperties: false },
      run: (a) => {
        const p = P(), ref = findAl(p, a.alignment), al = p.alignment(ref);
        if (!al.ok) throw new Error('Alignment "' + ref.name + '" cannot be built: ' + (al.errors[0] || 'it needs at least two PIs') + '.');
        const eg = p.eg().surface, g = p.graded().surface, prof = ref.pvis?.length >= 2 ? p.designProfile(ref) : null;
        if (!eg) throw new Error('The site has no existing-ground surface to sample.');
        let rows = sampleSurface(eg, al, { step: a.step }).filter((q) => (a.from === undefined || q.sta >= a.from - 1e-9) && (a.to === undefined || q.sta <= a.to + 1e-9));
        const truncated = rows.length > 2000;
        rows = rows.slice(0, 2000);
        return { alignment: ref.name, start: r6(al.start), end: r6(al.end), units: p.state.units, truncated, rows: rows.map((q) => {
          const pt = al.pointAt(q.sta);
          return { station: r6(q.sta), stationText: formatStation(q.sta, p.state.units), ground: r6(q.z), ...(prof && prof.ok !== false ? { design: r6(prof.elevationAt(q.sta)) } : {}), ...(g && g !== eg ? { graded: r6(g.elevationAt(pt.x, pt.y)) } : {}) };
        }) };
      },
    },
    {
      name: 'points_add', group: 'edit', title: 'Add survey points',
      description: 'Add survey points (x = easting, y = northing, z = elevation or left out, d = description; n = point number, else the next free numbers). One undo step; a number already used is refused.',
      inputSchema: { type: 'object', properties: { points: { type: 'array', minItems: 1, maxItems: 10000, items: { type: 'object', properties: { n: { type: 'string', minLength: 1, maxLength: 40 }, x: { type: 'number' }, y: { type: 'number' }, z: { type: ['number', 'null'] }, d: { type: 'string', maxLength: 200 } }, required: ['x', 'y'], additionalProperties: false } } }, required: ['points'], additionalProperties: false },
      run: (a) => {
        const p = P(), used = new Set(p.points.map((q) => String(q.n)));
        let next = Math.max(0, ...p.points.map((q) => Number(q.n)).filter(Number.isInteger)) + 1;
        const add = [];
        for (const q of a.points) {
          let n = q.n !== undefined ? String(q.n).trim() : null;
          if (n === null) { while (used.has(String(next))) next++; n = String(next++); }
          if (used.has(n)) throw new Error('Point number ' + n + ' is already used. Nothing was added.');
          used.add(n);
          if (Math.abs(q.x) > 1e9 || Math.abs(q.y) > 1e9 || (q.z !== undefined && q.z !== null && Math.abs(q.z) > 1e6)) throw new Error('Point ' + n + ' is too far out to be a coordinate. Nothing was added.');
          add.push({ n, x: q.x, y: q.y, z: q.z ?? null, d: String(q.d || '').replace(/[\u0000-\u001f]/g, ' ') });
        }
        p.editPoints('Assistant: add points', (all) => all.concat(add));
        app.changed?.();
        return { added: add.map((q) => q.n), total: p.points.length, undo: 'Assistant: add points' };
      },
    },
    {
      name: 'landxml_export', group: 'export', title: 'Export LandXML',
      description: 'The site as LandXML 1.2 (points, existing and graded surfaces, alignments with ground and design profiles, feature lines, the pipe network), as Export › LandXML writes it.',
      inputSchema: { type: 'object', properties: { path: PATH, overwrite: { type: 'boolean', default: false } }, additionalProperties: false },
      run: async (a) => {
        const p = P();
        if (!p.points.length && !p.eg().surface && !p.state.alignments.length && !(p.state.features || []).length) throw new Error('The site has nothing to export yet.');
        if (a.path && !/\.xml$/i.test(a.path)) throw new Error('LandXML is written to a .xml file.');
        const bytes = new TextEncoder().encode(landXmlOf(p));
        return { bytes: bytes.length, ...(await out(bytes, stem(p) + '.xml', 'application/xml', a)) };
      },
    },
    {
      name: 'usd_export', group: 'export', title: 'Export USD',
      description: 'The site in 3D as OpenUSD (the existing ground, graded surface, pads, corridors, pipes, as the 3D view\'s Export › USD makes it), .usdz (default), .usda or .usdc; with the coordinate system when the project has one.',
      inputSchema: { type: 'object', properties: { format: { type: 'string', enum: ['usdz', 'usda', 'usdc'], description: 'Default: from the path, else usdz.' }, path: PATH, overwrite: { type: 'boolean', default: false } }, additionalProperties: false },
      run: async (a) => {
        const p = P(), fmt = a.format || (a.path && /\.(usd[acz])$/i.exec(a.path)?.[1].toLowerCase()) || 'usdz';
        if (a.path && !new RegExp('\\.' + fmt + '$', 'i').test(a.path)) throw new Error('A .' + fmt + ' file ends in .' + fmt + '.');
        if (!p.points.length && !p.eg().surface) throw new Error('The site has nothing to show in 3D yet.');
        const [{ siteInput, buildSite3D }, { siteUsd }] = await Promise.all([import('./site3d.js'), import('./usd-civilcraft.js')]);
        const r = siteUsd(buildSite3D(siteInput(p)), { format: fmt, name: p.state.name || 'site', crs: p.state.crs });
        const bytes = typeof r.data === 'string' ? new TextEncoder().encode(r.data) : r.data;
        return { format: fmt, bytes: bytes.length, report: r.report, ...(await out(bytes, stem(p) + '-3d.' + fmt, fmt === 'usda' ? 'model/vnd.usda' : fmt === 'usdz' ? 'model/vnd.usdz+zip' : 'application/octet-stream', a)) };
      },
    },
  ];
  if (app.saveProject) tools.push({
    name: 'project_save', group: 'save', title: 'Save the project',
    description: 'CivilCraft\'s own Save: the project file (.civilcraft.json) in place when it was opened from one on the desktop, else a new file; with a path (Studio) it is written there.',
    inputSchema: { type: 'object', properties: { path: PATH, overwrite: { type: 'boolean', default: false } }, additionalProperties: false },
    run: async (a) => {
      if (a.path) {
        if (!/\.civilcraft\.json$/i.test(a.path)) throw new Error('A CivilCraft project is a .civilcraft.json file.');
        const r = await app.files.into(a.path, () => app.saveProject(), { overwrite: a.overwrite });
        if (!r.written.length) throw new Error(r.errors[0] || 'Nothing was written to ' + a.path + '.');
        return { saved: true, path: r.written[0] };
      }
      return { saved: !!(await app.saveProject()) };
    },
  });
  if (app.exportDwg) tools.push({
    name: 'dwg_export', group: 'export', title: 'Export DWG',
    description: 'The plan as a DWG (the same drawing as the DWG button: contours, breaklines, points, alignments, pads, parcels, pipes …), version 2000 (default), 2004, 2007, 2010, 2013 or 2018. With a path (Studio) it is written there.',
    inputSchema: { type: 'object', properties: { version: { type: 'string', enum: ['2000', '2004', '2007', '2010', '2013', '2018'], default: '2000' }, path: PATH, overwrite: { type: 'boolean', default: false } }, additionalProperties: false },
    run: async (a) => {
      const v = { 2000: 'AC1015', 2004: 'AC1018', 2007: 'AC1021', 2010: 'AC1024', 2013: 'AC1027', 2018: 'AC1032' }[a.version || '2000'];
      if (a.path) {
        if (!/\.dwg$/i.test(a.path)) throw new Error('The DWG is written to a .dwg file (with map layers shown, the button makes a .zip: hide them first).');
        if (!app.files?.available) throw new Error('File paths work only in CadCraft Studio (the desktop app).');
        const r = await app.files.into(a.path, () => app.exportDwg(v), { overwrite: a.overwrite });
        if (!r.written.length) throw new Error(r.errors[0] || 'Nothing was written (the site may have nothing to draw).');
        return { path: r.written[0], version: a.version || '2000' };
      }
      await app.exportDwg(v);
      return { downloaded: true, version: a.version || '2000' };
    },
  });
  return tools;
}
