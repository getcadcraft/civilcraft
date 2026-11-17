/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page (AGENTS-SPEC section 5) */
/**
 * site-gen-agent.js — assistant tools for the parking lot and fence generators (0.10 SU.1815 and SU.1814b, session civil-site-10), in the shape civil-agent.js uses
 * (host.control.tool(def)); civilcraft.js registers them beside civilTools. No DOM: bin/test-civilcraft-sitegen.mjs runs them on a Project. These are the same
 * functions the Parking lot and Fences windows call (parking-apply.js, fence/index.js), so a client over MCP and a person on the page get the same lot.
 *
 *   siteGenTools(app) → [tool definitions]   app.project(), app.seed() → plant rows, app.zAt(x, y) → existing ground or null, app.changed()
 *
 *   parking_layout   read  boundary (points, or a parcel / pad name) + options → stalls, accessible and van spaces, islands, drains, the graded dish's cut and fill; nothing is written
 *   parking_build    edit  the same, then writes the lot: a grading area with falls to drains, paving, planting in the islands; one undo step; ids back
 *   parking_remove   edit  a lot and everything it made
 *   fence_build      edit  a fence along points or a feature line / parcel / pad: posts, rails or panels, gates, raked or stepped on the ground; one undo step → schedule
 *   fence_list       read  the fences of the site with their schedule and problems
 * Dimensions and the accessible-space table come from parking-tables.js and are NOT checked against the printed standard (see its note); results say so.
 */
import * as K from './parking.js';
import { buildLot, computeLot, removeLot } from './parking-apply.js';
import * as F from './fence/index.js';

const XY = { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'], additionalProperties: false };
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const NOTE = 'Dimensions and the accessible-space table are typical values / the 2010 ADA table as remembered, NOT checked against the printed standard or local code: a designer checks every number.';
const OPTS = {
  angle: { type: 'integer', enum: [90, 75, 60, 45, 30, 0], description: 'Stall angle to the aisle in degrees; 0 = parallel. Default 90.' },
  traffic: { type: 'string', enum: ['one', 'two'] },
  region: { type: 'string', enum: ['us', 'custom'], description: 'us = ADA 2010 accessible-space table; custom = your own rule (accessible count given).' },
  stallW: { type: 'number', exclusiveMinimum: 0 }, stallL: { type: 'number', exclusiveMinimum: 0 }, aisleW: { type: 'number', exclusiveMinimum: 0 },
  orientation: { type: 'number', description: 'Row direction in degrees from east; omit to try the outline\'s edges and keep the best.' },
  islandW: { type: 'number', exclusiveMinimum: 0 }, maxRun: { type: 'integer', minimum: 0, description: 'Stalls between islands in a row (0 = none). Default 10.' }, endIslands: { type: 'boolean' },
  accessible: { type: 'integer', minimum: 0, description: 'Accessible spaces; omit to follow the region table.' },
  entrance: XY, setback: { type: 'number', minimum: 0 },
  fallPct: { type: 'number', exclusiveMinimum: 0, maximum: 20, description: 'Fall to the drains in percent. Default 1.5.' }, drainSpacing: { type: 'number', exclusiveMinimum: 0 }, drains: { type: 'array', items: XY, maxItems: 200 },
  grade: { type: 'boolean' }, paving: { type: 'boolean' }, planting: { type: 'boolean' },
  treeSpecies: { type: 'string', description: 'A plant key or name from landscape_plants_find for the island trees.' }, shrubSpecies: { type: 'string' },
};
const BOUND = { boundary: { type: 'array', items: XY, minItems: 3, maxItems: 5000, description: 'The outline in project coordinates.' }, parcel: { type: 'string', description: 'Or the name or id of a parcel or pad in the project.' } };

export function siteGenTools(app) {
  const P = () => app.project();
  const boundaryOf = (a) => {
    if (a.boundary?.length) return { pts: a.boundary.map((q) => ({ x: q.x, y: q.y })), name: a.name };
    if (a.parcel) {
      const s = P().state, w = String(a.parcel).toLowerCase(), hit = [...(s.parcels || []), ...(s.pads || [])].find((x) => String(x.id).toLowerCase() === w || String(x.name || '').toLowerCase() === w);
      if (hit?.pts?.length >= 3) return { pts: hit.pts.map((q) => ({ x: q.x, y: q.y })), name: a.name || hit.name };
      throw new Error(`No parcel or pad "${a.parcel}" with an outline.`);
    }
    throw new Error('Give a boundary (points) or a parcel / pad name.');
  };
  const opts = (a) => Object.fromEntries(Object.keys(OPTS).filter((k) => a[k] !== undefined).map((k) => [k, a[k]]));
  const summary = (r, units) => {
    const c = r.layout.counts, ar = r.layout.area;
    return { note: NOTE, units, orientationDeg: r.layout.orientation, angle: r.layout.angle, spaces: c.total, standard: c.standard, accessible: c.accessible, van: c.van, accessibleRequired: c.required, accessAisles: c.accessAisles, islands: c.islands,
      areaPerSpace: ar.perStall === null ? null : r3(ar.perStall), lotArea: r3(ar.lot), stallArea: r3(ar.stalls), aisleArea: r3(ar.aisles), islandArea: r3(ar.islands),
      drains: r.drains.map((d) => ({ x: r3(d.x), y: r3(d.y) })),
      grade: r.grade ? { fallPct: r.grade.fallPct, z0: r3(r.grade.z0), cut: r3(r.grade.cut), fill: r3(r.grade.fill), edgeStep: r3(r.grade.edgeStep), spots: r.grade.spots.length } : null,
      problems: [...r.layout.problems, ...(r.grade?.problems || [])] };
  };
  return [
    {
      name: 'parking_layout', group: 'read', title: 'Lay out a parking lot (preview)',
      description: 'Preview a parking layout inside an outline: stall size and angle, aisles, accessible and van spaces, islands, drains and the graded dish\'s cut and fill against the existing ground. Writes nothing. ' + NOTE,
      inputSchema: { type: 'object', properties: { ...BOUND, ...OPTS }, additionalProperties: false },
      run: (a) => {
        const b = boundaryOf(a), u = P().state.units === 'm' ? 'm' : 'ft';
        const r = computeLot({ boundary: b.pts, opts: { ...opts(a), region: a.region } }, { units: u, zAt: app.zAt });
        return summary(r, u);
      },
    },
    {
      name: 'parking_build', group: 'edit', title: 'Build a parking lot',
      description: 'Lay out a parking lot and write it: stalls and aisles on the plan, a grading area whose spot elevations fall to drains (against the existing ground, from a surface or a point-cloud surface), paving, and planting in the islands (a shrub bed and a tree). One undo step; give `id` to rebuild one made earlier. ' + NOTE,
      inputSchema: { type: 'object', properties: { ...BOUND, ...OPTS, id: { type: 'string', description: 'A lot id from an earlier build, to rebuild it.' }, name: { type: 'string' } }, additionalProperties: false },
      run: (a) => {
        const b = a.id && !a.boundary && !a.parcel ? { pts: (P().state.parking || []).find((r) => r.id === a.id)?.boundary } : boundaryOf(a);
        if (!b.pts) throw new Error(`No lot ${a.id}.`);
        const r = buildLot(P(), { id: a.id, name: a.name || b.name, boundary: b.pts, opts: opts(a) }, { zAt: app.zAt, seed: app.seed() });
        if (!r.ok) throw new Error('Nothing fits: ' + JSON.stringify(r.problems));
        app.changed?.();
        const u = P().state.units === 'm' ? 'm' : 'ft';
        return { id: r.id, made: r.made, volumes: r.volumes, notes: r.notes, ...summary(r, u) };
      },
    },
    {
      name: 'parking_remove', group: 'edit', title: 'Remove a parking lot',
      description: 'Remove a parking lot and the grading, paving and planting it made. One undo step.',
      inputSchema: { type: 'object', properties: { id: { type: 'string' } }, required: ['id'], additionalProperties: false },
      run: (a) => { if (!removeLot(P(), a.id)) throw new Error(`No lot ${a.id}.`); app.changed?.(); return { removed: a.id }; },
    },
    {
      name: 'fence_build', group: 'edit', title: 'Build a fence',
      description: 'A fence along a path: posts at the ends, corners and gate edges and at equal bays no longer than `postSpacing`; rails, panels or pickets; gates (each at a station along the path, within one straight run); raked (follows the ground) or stepped (level panels). One undo step. Returns the schedule and any problems (gap too wide, ground through a panel). Defaults are usual choices, not code: local rules limit a fence\'s height.',
      inputSchema: { type: 'object', properties: {
        points: { type: 'array', items: XY, minItems: 2, maxItems: 5000 }, feature: { type: 'string', description: 'Or the name or id of a feature line, parcel or pad.' }, closed: { type: 'boolean' }, name: { type: 'string' },
        style: { type: 'string', enum: F.STYLES }, terrain: { type: 'string', enum: F.TERRAIN }, height: { type: 'number', exclusiveMinimum: 0 }, postSpacing: { type: 'number', exclusiveMinimum: 0 }, postSize: { type: 'number', exclusiveMinimum: 0 },
        rails: { type: 'integer', minimum: 1, maximum: 8 }, gap: { type: 'number', minimum: 0 }, maxGap: { type: 'number', minimum: 0 }, type: { type: 'string', description: 'A fence type name (Library item) to carry into the schedule and IFC.' },
        gates: { type: 'array', maxItems: 50, items: { type: 'object', properties: { station: { type: 'number', minimum: 0, description: 'Distance along the path to the gate\'s first post.' }, width: { type: 'number', exclusiveMinimum: 0 }, name: { type: 'string' } }, required: ['station', 'width'], additionalProperties: false } },
      }, additionalProperties: false },
      run: (a) => {
        const p = P(), s = p.state, u = s.units === 'm' ? 'm' : 'ft';
        let pts = a.points, closed = a.closed === true, name = a.name || '';
        if (!pts && a.feature) {
          const w = String(a.feature).toLowerCase(), hit = (s.features || []).find((x) => String(x.id).toLowerCase() === w || String(x.name || '').toLowerCase() === w) || [...(s.parcels || []), ...(s.pads || [])].find((x) => String(x.id).toLowerCase() === w || String(x.name || '').toLowerCase() === w);
          if (!hit?.pts?.length) throw new Error(`No line, parcel or pad "${a.feature}".`);
          pts = hit.pts; name ||= hit.name || ''; closed = closed || hit.closed === true || (s.parcels || []).includes(hit) || (s.pads || []).includes(hit);
        }
        if (!pts || pts.length < 2) throw new Error('Give points or a feature.');
        const raw = { id: p.nextId('fc'), name, pts: pts.map((q) => ({ x: q.x, y: q.y })), closed, ...Object.fromEntries(['style', 'terrain', 'height', 'postSpacing', 'postSize', 'rails', 'gap', 'maxGap', 'type'].filter((k) => a[k] !== undefined).map((k) => [k, a[k]])),
          gates: (a.gates || []).map((g) => ({ s: g.station, width: g.width, name: g.name || '' })) };
        const rec = F.clean(raw, u);
        if (!rec) throw new Error('The fence needs at least two points (three when closed).');
        p.change('Assistant: fence', (st) => { (st.fences ||= []).push(rec); });
        app.changed?.();
        const lay = F.build(rec, { zAt: app.zAt, units: u });
        return { id: rec.id, units: u, length: r3(lay.stats.length), posts: lay.posts.length, panels: lay.panels.length, gates: lay.gates.length, steps: lay.stats.steps, schedule: F.schedule(lay, u).rows, problems: lay.problems };
      },
    },
    {
      name: 'fence_list', group: 'read', title: 'List the fences',
      description: 'The fences of the open site with their schedule rows and problems.',
      run: () => { const p = P(), u = p.state.units === 'm' ? 'm' : 'ft'; return (p.state.fences || []).map((rec) => { const lay = F.build(rec, { zAt: app.zAt, units: u }); return { id: rec.id, name: rec.name, style: rec.style, terrain: rec.terrain, length: r3(lay.stats.length), schedule: F.schedule(lay, u).rows, problems: lay.problems }; }); },
    },
  ];
}
