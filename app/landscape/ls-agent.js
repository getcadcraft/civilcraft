/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: tool definitions and results are read by the assistant (MCP), not shown on the page (AGENTS-SPEC §5) */
/**
 * ls-agent.js — the Landscape workspace's tools for AI assistants and scripts (0.7 LD.8, session `landscape`), in the shape
 * civil-agent.js uses (host.control.tool(def)); civilcraft.js registers them beside civilTools. No DOM: bin/test-landscape.mjs
 * runs them on a Project. Coordinates in the project's units (easting x, northing y).
 *
 *   landscapeTools(app) → [tool definitions]   app.project(), app.seed() → the seed species (plants.js rows), app.changed()
 *
 *   landscape_plants_find   read  search the plant list (any name, any language) with filters → [{key, botanical, names, type, size…}]
 *   landscape_plant         edit  place plants (species key or a name) at points, or fill a bed (outline + mix by %), or a hedge
 *                                 (line + species) — one undo step → what was placed, the bed's count
 *   landscape_schedule      read  the plant schedule: counts by species and planting size
 *   landscape_grade         edit  add a platform / berm / swale / grading area (with spot elevations) — one undo step → its
 *                                 cut and fill and any problems
 *   landscape_irrigation_check  read  zones, flow, pressure needed at each valve and at the supply, worst-case head,
 *                                 precipitation, run time, problems, bill of materials — a calculation aid, not a design
 * (These are the MCP tools the track names landscape.plant, landscape.grade and landscape.irrigation.check: MCP names here
 *  use underscores, as every CivilCraft tool does.)
 */
import { search, displayName, sizeOf } from './plants.js';
import { emptyLandscape, speciesIndex, bedFill, hedgeFill, schedule } from './planting.js';
import { cleanGrading, defaults } from './grade.js';
import { analyse, cleanIrrigation } from './irrigation.js';

const XY = { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' } }, required: ['x', 'y'], additionalProperties: false };
const r3 = (v) => (Number.isFinite(v) ? Math.round(v * 1000) / 1000 : null);
const AID = 'A calculation aid, not a stamped design: an irrigation designer checks every result.';

export function landscapeTools(app) {
  const P = () => app.project();
  const index = () => speciesIndex(app.seed(), P().state.landscape?.palette || []);
  const species = (ref) => {
    const idx = index();
    if (idx.has(ref)) return idx.get(ref);
    const hit = search([...idx.values()], String(ref || ''));
    if (hit.length === 1) return hit[0];
    const exact = hit.find((s) => s.botanical.toLowerCase() === String(ref).toLowerCase() || Object.values(s.names).some((n) => n.toLowerCase() === String(ref).toLowerCase()));
    if (exact) return exact;
    throw new Error(hit.length ? `"${ref}" matches ${hit.length} plants: ${hit.slice(0, 8).map((s) => s.key).join(', ')}${hit.length > 8 ? '…' : ''}. Give a key.` : `No plant "${ref}". Use landscape_plants_find.`);
  };
  const edit = (label, fn) => { const r = P().change(label, (s) => { if (!s.landscape) s.landscape = emptyLandscape(); fn(s.landscape); }); app.changed?.(); return r; };
  const nid = () => P().nextId('l');
  return [
    {
      name: 'landscape_plants_find', group: 'read', title: 'Find plants',
      description: 'Search the plant list (built-in seed list plus the project\'s own plants) by any name in any language, botanical name, type, light, water or hardiness zone.',
      inputSchema: { type: 'object', properties: { query: { type: 'string' }, type: { type: 'string', enum: ['tree', 'shrub', 'hedge', 'grass', 'perennial', 'groundcover', 'climber'] }, light: { type: 'string', enum: ['sun', 'part', 'shade'] }, water: { type: 'string', enum: ['low', 'medium', 'high'] }, zone: { type: 'integer', minimum: 1, maximum: 13 }, limit: { type: 'integer', minimum: 1, maximum: 200 } }, additionalProperties: false },
      run: (a) => {
        const hit = search([...index().values()], a.query || '', { type: a.type, light: a.light, water: a.water, zone: a.zone });
        return { total: hit.length, plants: hit.slice(0, a.limit || 25).map((s) => ({ key: s.key, botanical: s.botanical, names: s.names, type: s.type, foliage: s.foliage, mature: s.size.mature, planting: sizeOf(s, 'plant'), spacing: s.spacing, zone: s.zone, light: s.light, water: s.water })) };
      },
    },
    {
      name: 'landscape_plant', group: 'edit', title: 'Place plants',
      description: 'Place plants: single plants at points, a planting bed (closed outline, mix by percent, optional spacing in metres) or a hedge (a line). One undo step. Plants sit on the ground (they follow later grading).',
      inputSchema: { type: 'object', properties: {
        species: { type: 'string', description: 'A plant key (from landscape_plants_find) or a name.' },
        points: { type: 'array', items: XY, maxItems: 1000, description: 'Single plants of `species`.' },
        bed: { type: 'object', properties: { outline: { type: 'array', items: XY, minItems: 3, maxItems: 5000 }, mix: { type: 'array', items: { type: 'object', properties: { species: { type: 'string' }, pct: { type: 'number', exclusiveMinimum: 0, maximum: 100 } }, required: ['species', 'pct'], additionalProperties: false }, maxItems: 20 }, spacing: { type: 'number', exclusiveMinimum: 0 }, name: { type: 'string' } }, required: ['outline'], additionalProperties: false },
        hedge: { type: 'object', properties: { line: { type: 'array', items: XY, minItems: 2, maxItems: 5000 }, rows: { type: 'integer', enum: [1, 2] }, spacing: { type: 'number', exclusiveMinimum: 0 }, name: { type: 'string' } }, required: ['line'], additionalProperties: false },
      }, additionalProperties: false },
      run: (a) => {
        const out = {};
        if (!a.points && !a.bed && !a.hedge) throw new Error('Give points, a bed or a hedge.');
        const sp = a.species ? species(a.species) : null;
        const ops = [];
        if (a.points?.length) { if (!sp) throw new Error('Say which species for the points.'); ops.push((l) => { for (const q of a.points) l.plants.push({ id: nid(), key: sp.key, x: q.x, y: q.y, z: null }); }); out.plants = { species: sp.key, count: a.points.length }; }
        let bedId = null, hedgeId = null;
        if (a.bed) {
          const mix = (a.bed.mix?.length ? a.bed.mix.map((m) => ({ key: species(m.species).key, pct: m.pct })) : sp ? [{ key: sp.key, pct: 100 }] : null);
          if (!mix) throw new Error('A bed needs a mix or a species.');
          bedId = nid();
          ops.push((l) => l.beds.push({ id: bedId, name: String(a.bed.name || `Bed ${l.beds.length + 1}`).slice(0, 120), pts: a.bed.outline.map((q) => ({ x: q.x, y: q.y })), mix, spacing: a.bed.spacing ?? null, pattern: 'triangular', angle: 0, seed: l.beds.length + 1 }));
        }
        if (a.hedge) {
          if (!sp) throw new Error('Say which species for the hedge.');
          hedgeId = nid();
          ops.push((l) => l.hedges.push({ id: hedgeId, name: String(a.hedge.name || `Hedge ${l.hedges.length + 1}`).slice(0, 120), pts: a.hedge.line.map((q) => ({ x: q.x, y: q.y })), key: sp.key, spacing: a.hedge.spacing ?? null, rows: a.hedge.rows === 2 ? 2 : 1, rowGap: 0.4 }));
        }
        edit('Assistant: place plants', (l) => { for (const op of ops) op(l); });
        const L = P().state.landscape, U = P().state.units;
        if (bedId) { const b = L.beds.find((x) => x.id === bedId), f = bedFill(b, index(), U); out.bed = { id: bedId, plants: f.pts.length, counts: f.counts, area: r3(f.area) }; }
        if (hedgeId) { const h = L.hedges.find((x) => x.id === hedgeId), f = hedgeFill(h, index(), U); out.hedge = { id: hedgeId, plants: f.pts.length, length: r3(f.length) }; }
        return out;
      },
    },
    {
      name: 'landscape_schedule', group: 'read', title: 'Plant schedule',
      description: 'The plant schedule of the open site: counts by species from single plants, beds and hedges, with planting size.',
      run: () => {
        const L = P().state.landscape || emptyLandscape(), sch = schedule(L, index(), P().state.units);
        return { total: sch.total, rows: sch.rows.map((r) => ({ key: r.key, botanical: r.botanical, name: r.name, type: r.type, container: r.container, planting: r.size, qty: r.qty, plants: r.plants, beds: r.beds, hedges: r.hedges })), missing: sch.missing };
      },
    },
    {
      name: 'landscape_grade', group: 'edit', title: 'Grade',
      description: 'Add a grading object to the proposed surface: platform (outline, elevation or null for the ground mean, optional fall {pct, dir}), berm (outline, height), swale (line the way water runs, depth, bottom width, side slope, optional fall %), or grading area (outline + spot elevations). One undo step. Returns its cut and fill in project units cubed.',
      inputSchema: { type: 'object', properties: {
        kind: { type: 'string', enum: ['platform', 'berm', 'swale', 'area'] }, name: { type: 'string' }, points: { type: 'array', items: XY, minItems: 2, maxItems: 5000 },
        z: { type: ['number', 'null'] }, fall: { type: 'object', properties: { pct: { type: 'number' }, dir: { type: 'number' } }, required: ['pct', 'dir'], additionalProperties: false },
        height: { type: 'number' }, depth: { type: 'number' }, bottom: { type: 'number' }, side: { type: 'number' }, swaleFall: { type: 'number' }, cut: { type: 'number' }, fill: { type: 'number' },
        spots: { type: 'array', items: { type: 'object', properties: { x: { type: 'number' }, y: { type: 'number' }, z: { type: 'number' } }, required: ['x', 'y', 'z'], additionalProperties: false }, maxItems: 1000 },
      }, required: ['kind', 'points'], additionalProperties: false },
      run: (a) => {
        const p = P(), d = defaults(p.state.units), id = nid();
        const raw = { id, kind: a.kind, name: a.name || a.kind, pts: a.points, z: a.z ?? null, fall: a.fall || null, height: a.height ?? d.height, cut: a.cut ?? d.cut, fill: a.fill ?? d.fill,
          depth: a.depth ?? d.depth, bottom: a.bottom ?? d.bottom, side: a.side ?? d.side, ...(a.kind === 'swale' ? { fall: a.swaleFall ?? null } : {}),
          spots: (a.spots || []).map((s, i) => ({ id: 's' + (i + 1), ...s })), contours: [] };
        const rec = cleanGrading([raw], p.state.units)[0];
        if (!rec) throw new Error(a.kind === 'swale' ? 'A swale needs a line of at least two points.' : 'Needs an outline of at least three points.');
        edit('Assistant: grade', (l) => { l.grading = [...(l.grading || []), rec]; });
        const g = p.graded(), item = g.items?.find((x) => x.id === id), v = p.volumes()?.items?.find((x) => x.id === id);
        return { id, kind: rec.kind, problems: item?.problems || [], cut: v ? r3(v.cut) : 0, fill: v ? r3(v.fill) : 0, units: p.state.units === 'm' ? 'cubic metres' : 'cubic feet' };
      },
    },
    {
      name: 'landscape_irrigation_check', group: 'read', title: 'Check the irrigation',
      description: 'Hydraulic check of the irrigation on the open site (Hazen–Williams): each zone\'s heads, flow (L/min), pressure needed at its valve and at the supply (kPa), worst-case head, precipitation (mm/h), minutes a week, problems; the bill of materials. ' + AID,
      run: () => {
        const p = P(), irr = cleanIrrigation(p.state.landscape?.irrigation);
        const r = analyse(irr, p.state.units, (x, y) => (p.graded().surface || p.eg().surface)?.elevationAt(x, y) ?? null);
        return { note: AID, zones: r.zones.map((z) => ({ valve: z.id, name: z.name, heads: z.heads.length, flowLmin: r3(z.flow), needAtValveKpa: r3(z.pressureNeed), needAtSupplyKpa: r3(z.atSupply ?? null), worst: z.worst ? (z.worst.head || z.worst.drip) : null, precipMmH: r3(z.pr), minutesAWeek: r3(z.minutes), problems: z.problems })),
          supply: irr.supply, problems: r.problems, bom: r.bom };
      },
    },
  ];
}
