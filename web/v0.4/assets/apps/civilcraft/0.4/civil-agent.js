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
 */
import { groupKey } from './points.js';

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
  ];
}
