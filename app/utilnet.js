/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and field names; the words people read are the UI's t() keys (un.*). */
/**
 * utilnet.js — utility networks (0.10 SU.1810): one network kind per service (water, sewer, storm, gas, power, telecom), each run a pipe or a cable with a
 * material, a size, a depth and an owner; read from OpenStreetMap data (an Overpass JSON file the person chose, or the result of their own query);
 * crossings between runs and along an alignment (for the profile); trench sections per run; plan items on service layers (DWG, DXF, PDF) and the model for
 * the IFC writer. DOM-free; the project's units are 'ft' or 'm', sizes are kept in millimetres, depths in project units.
 *
 *   emptyUtilities() · cleanUtilities(raw, units)
 *   state.utilities = { runs: [{ id 'ur<n>', service, name, pts: [{ x, y }], material, size (mm), depth (cover to the top of the pipe or cable, project units),
 *                                 owner, source 'drawn'|'osm', osm?: 'way/123' }],
 *                       nodes: [{ id 'un<n>', service, kind, name, x, y, depth, owner, source, osm? }],
 *                       osm?: { attribution, importedAt, count } }
 *   fromOverpass(json, { toProject: (lon, lat) => { x, y }, units, nextId }) → { runs, nodes, skipped: { why: n }, attribution }
 *   runLength(run) · crossings(runs, units, { zAt, minClear }) → [{ a, b, x, y, clear (project units, null without ground), top: {…}, flag }]
 *   crossingsAlong(polyline [{ x, y, sta }], runs, units, { zAt }) → [{ sta, run, service, x, y, top, bottom, size }]  (for the profile view)
 *   trench(run, units, { bedding, clearance, slope, extraWidth }) → { width, topWidth, depthToInvert, area, length, volume }
 *   sceneItems(u, { mmPerUnit }) · LAYER_DEFS · ifcModel(u, units, { zAt }) → what ifc-civil.js writes
 *
 * OpenStreetMap: the tags read are the ones its wiki documents for these features (Key:man_made=pipeline with substance=*, Key:power=line|minor_line|cable,
 * Key:emergency=fire_hydrant, Key:manhole=*, Key:telecom=*, Key:waterway=drain|culvert, Key:diameter (millimetres unless a unit is written), Key:depth,
 * Key:operator, Key:material, Key:location=underground|overground). They were read from the wiki when this was written and are NOT re-checked at run time:
 * a tag that does not match is counted in `skipped`, never guessed. OSM data is © OpenStreetMap contributors, ODbL: every output that holds it carries the
 * attribution (the scene's text line, the IFC property set); a file we SHIP or SHARE that holds OSM data waits for the owner's licence read.
 * Depths, sizes and clearances here are the person's: the defaults are placeholders, not a standard's numbers.
 */
const fin = Number.isFinite;
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
export const ATTRIBUTION = '© OpenStreetMap contributors (ODbL)';
export const SERVICES = {
  water: { cable: false, aci: 5, layer: 'U-WATR' }, sewer: { cable: false, aci: 3, layer: 'U-SEWR' }, storm: { cable: false, aci: 4, layer: 'U-STRM' },
  gas: { cable: false, aci: 2, layer: 'U-GASS' }, power: { cable: true, aci: 1, layer: 'U-POWR' }, telecom: { cable: true, aci: 6, layer: 'U-TELC' },
};
export const NODE_KINDS = ['hydrant', 'manhole', 'valve', 'chamber', 'cabinet'];
export const LAYER_DEFS = Object.entries(SERVICES).map(([s, d]) => [d.layer + '-RUN', 'un.layer.' + s, d.aci]).concat(Object.entries(SERVICES).map(([s, d]) => [d.layer + '-NODE', 'un.layer.' + s + '.node', d.aci]), [['U-OSM-TEXT', 'un.layer.attr', 8]]);
const MAX = { runs: 20000, nodes: 20000, pts: 5000 };
export const DEFAULTS = { depth: { ft: 3.5, m: 1.0 }, size: 100, clearance: { ft: 0.5, m: 0.15 }, minClear: { ft: 1, m: 0.3 } };   // placeholders the person replaces

export const emptyUtilities = () => ({ runs: [], nodes: [] });
const mm = (units) => (units === 'm' ? 1000 : 304.8);   // mm per project unit

export function cleanUtilities(raw, units = 'ft') {
  const out = emptyUtilities();
  if (!raw || typeof raw !== 'object') return out;
  const seen = new Set();
  for (const r of (Array.isArray(raw.runs) ? raw.runs : []).slice(0, MAX.runs)) {
    if (!r || !SERVICES[r.service] || !/^ur\d{1,9}$/.test(String(r.id)) || seen.has(r.id)) continue;
    const pts = (Array.isArray(r.pts) ? r.pts : []).slice(0, MAX.pts).filter((p) => p && fin(p.x) && fin(p.y)).map((p) => ({ x: p.x, y: p.y }));
    if (pts.length < 2) continue;
    seen.add(r.id);
    out.runs.push({ id: r.id, service: r.service, name: str(r.name, 80), pts, material: str(r.material, 40), size: fin(r.size) && r.size > 0 && r.size < 5000 ? r.size : 0,
      depth: fin(r.depth) && r.depth >= 0 && r.depth < 200 ? r.depth : DEFAULTS.depth[units === 'm' ? 'm' : 'ft'], owner: str(r.owner, 80), source: r.source === 'osm' ? 'osm' : 'drawn', ...(r.osm ? { osm: str(r.osm, 40) } : {}) });
  }
  for (const n of (Array.isArray(raw.nodes) ? raw.nodes : []).slice(0, MAX.nodes)) {
    if (!n || !SERVICES[n.service] || !NODE_KINDS.includes(n.kind) || !/^un\d{1,9}$/.test(String(n.id)) || seen.has(n.id) || !fin(n.x) || !fin(n.y)) continue;
    seen.add(n.id);
    out.nodes.push({ id: n.id, service: n.service, kind: n.kind, name: str(n.name, 80), x: n.x, y: n.y, depth: fin(n.depth) && n.depth >= 0 && n.depth < 200 ? n.depth : 0, owner: str(n.owner, 80), source: n.source === 'osm' ? 'osm' : 'drawn', ...(n.osm ? { osm: str(n.osm, 40) } : {}) });
  }
  if (raw.osm && typeof raw.osm === 'object') out.osm = { attribution: ATTRIBUTION, importedAt: str(raw.osm.importedAt, 40), count: fin(raw.osm.count) ? raw.osm.count : 0 };
  return out;
}

export const runLength = (run) => { let L = 0; for (let i = 1; i < run.pts.length; i++) L += Math.hypot(run.pts[i].x - run.pts[i - 1].x, run.pts[i].y - run.pts[i - 1].y); return L; };

// ---------------------------------------------------------------------------- OpenStreetMap
const SUBSTANCE = { water: 'water', drinking_water: 'water', sewage: 'sewer', wastewater: 'sewer', rainwater: 'storm', gas: 'gas', natural_gas: 'gas', oil: null };
function serviceOf(tags) {
  if (tags.man_made === 'pipeline') { const s = SUBSTANCE[tags.substance]; return s === undefined ? 'water' : s; }
  if (tags.power === 'line' || tags.power === 'minor_line' || tags.power === 'cable') return 'power';
  if (tags.telecom === 'line' || tags.communication === 'line' || tags.telecom === 'cable') return 'telecom';
  if (tags.waterway === 'drain' || tags.waterway === 'culvert') return 'storm';
  return undefined;
}
/** OSM diameter: millimetres unless it says otherwise ("4 in", "0.3 m"). → mm | 0 */
export function diameterMm(v) {
  const m = /^\s*([0-9]+(?:[.,][0-9]+)?)\s*(mm|cm|m|in|"|ft|')?\s*$/i.exec(String(v ?? ''));
  if (!m) return 0;
  const n = Number(m[1].replace(',', '.')), u = (m[2] || 'mm').toLowerCase();
  return n * ({ mm: 1, cm: 10, m: 1000, in: 25.4, '"': 25.4, ft: 304.8, "'": 304.8 }[u]);
}
const depthOf = (v, units) => { const m = /^\s*([0-9]+(?:[.,][0-9]+)?)\s*(m|ft|')?\s*$/i.exec(String(v ?? '')); if (!m) return null; const n = Number(m[1].replace(',', '.')), u = (m[2] || 'm').toLowerCase(); const metres = u === 'm' ? n : n * 0.3048; return units === 'm' ? metres : metres / 0.3048; };

export function fromOverpass(json, { toProject, units = 'ft', nextId = null } = {}) {
  const runs = [], nodes = [], skipped = {};
  const skip = (why) => { skipped[why] = (skipped[why] || 0) + 1; };
  let n1 = 1, n2 = 1;
  const rid = () => (nextId ? nextId('ur') : 'ur' + n1++), nid = () => (nextId ? nextId('un') : 'un' + n2++);
  for (const e of (Array.isArray(json?.elements) ? json.elements : []).slice(0, 200000)) {
    const tags = e?.tags && typeof e.tags === 'object' ? e.tags : null;
    if (!tags) { skip('notags'); continue; }
    const osm = e.type + '/' + e.id;
    if (e.type === 'node' && fin(e.lat) && fin(e.lon)) {
      let service = null, kind = null;
      if (tags.emergency === 'fire_hydrant') { service = 'water'; kind = 'hydrant'; }
      else if (tags.manhole) { service = tags.manhole === 'drain' || tags.manhole === 'storm' ? 'storm' : tags.manhole === 'telecom' ? 'telecom' : tags.manhole === 'gas' ? 'gas' : tags.manhole === 'power' ? 'power' : tags.manhole === 'water' ? 'water' : 'sewer'; kind = 'manhole'; }
      else if (tags.man_made === 'pipeline' && tags.pipeline === 'valve') { service = SUBSTANCE[tags.substance] || 'water'; kind = 'valve'; }
      if (!service) { skip('node-kind'); continue; }
      const p = toProject(e.lon, e.lat); if (!p || !fin(p.x) || !fin(p.y)) { skip('no-position'); continue; }
      nodes.push({ id: nid(), service, kind, name: str(tags.name || tags.ref, 80), x: p.x, y: p.y, depth: 0, owner: str(tags.operator, 80), source: 'osm', osm });
      continue;
    }
    if (e.type === 'way' && Array.isArray(e.geometry)) {
      const service = serviceOf(tags);
      if (service === undefined) { skip('way-kind'); continue; }
      if (service === null) { skip('substance'); continue; }
      if (tags.location === 'overground' || tags.location === 'overhead' || tags.power === 'line') { skip('overground'); continue; }   // a run here is buried: overhead lines are not
      const pts = e.geometry.filter((g) => g && fin(g.lat) && fin(g.lon)).map((g) => toProject(g.lon, g.lat)).filter((p) => p && fin(p.x) && fin(p.y));
      if (pts.length < 2) { skip('geometry'); continue; }
      const d = depthOf(tags.depth, units);
      runs.push({ id: rid(), service, name: str(tags.name || tags.ref, 80), pts, material: str(tags.material, 40), size: diameterMm(tags.diameter), depth: d ?? DEFAULTS.depth[units === 'm' ? 'm' : 'ft'], owner: str(tags.operator, 80), source: 'osm', osm });
      continue;
    }
    skip('element');
  }
  return { runs, nodes, skipped, attribution: ATTRIBUTION };
}

// ---------------------------------------------------------------------------- geometry
function segHit(a, b, c, d) {
  const r = { x: b.x - a.x, y: b.y - a.y }, s = { x: d.x - c.x, y: d.y - c.y }, den = r.x * s.y - r.y * s.x;
  if (Math.abs(den) < 1e-12) return null;
  const t = ((c.x - a.x) * s.y - (c.y - a.y) * s.x) / den, u = ((c.x - a.x) * r.y - (c.y - a.y) * r.x) / den;
  return t >= 0 && t <= 1 && u >= 0 && u <= 1 ? { t, u, x: a.x + t * r.x, y: a.y + t * r.y } : null;
}
const level = (run, g, units) => { const top = g - run.depth, od = (run.size || DEFAULTS.size) / mm(units); return { top, bottom: top - od, size: run.size || DEFAULTS.size }; };

/** Where two runs of different services cross in plan, and the clear height between the lower one's top and the upper one's bottom (needs ground). */
export function crossings(runs, units = 'ft', { zAt = null, minClear = null } = {}) {
  const lim = minClear ?? DEFAULTS.minClear[units === 'm' ? 'm' : 'ft'], out = [];
  for (let i = 0; i < runs.length; i++) for (let j = i + 1; j < runs.length; j++) {
    const A = runs[i], B = runs[j];
    if (A.service === B.service && A.id === B.id) continue;
    for (let p = 1; p < A.pts.length; p++) for (let q = 1; q < B.pts.length; q++) {
      const h = segHit(A.pts[p - 1], A.pts[p], B.pts[q - 1], B.pts[q]); if (!h) continue;
      const g = zAt ? zAt(h.x, h.y) : null;
      let clear = null, flag = false, la = null, lb = null;
      if (fin(g)) { la = level(A, g, units); lb = level(B, g, units); clear = la.bottom > lb.bottom ? la.bottom - lb.top : lb.bottom - la.top; flag = clear < lim; }
      out.push({ a: A.id, b: B.id, x: h.x, y: h.y, clear, flag, levels: la && { a: la, b: lb } });
    }
  }
  return out;
}

/** Runs crossing an alignment's centreline: station, and the top and bottom of the run there (absolute elevation when `zAt` knows the ground). */
export function crossingsAlong(line, runs, units = 'ft', { zAt = null } = {}) {
  const out = [];
  for (let i = 1; i < line.length; i++) for (const r of runs) for (let q = 1; q < r.pts.length; q++) {
    const h = segHit(line[i - 1], line[i], r.pts[q - 1], r.pts[q]); if (!h) continue;
    const sta = line[i - 1].sta + h.t * (line[i].sta - line[i - 1].sta), g = zAt ? zAt(h.x, h.y) : null, l = fin(g) ? level(r, g, units) : null;
    out.push({ sta, run: r.id, service: r.service, name: r.name, x: h.x, y: h.y, top: l ? l.top : null, bottom: l ? l.bottom : null, size: r.size || DEFAULTS.size, depth: r.depth });
  }
  return out.sort((a, b) => a.sta - b.sta);
}

/** A trench for one run: the pipe's diameter plus a clearance each side at the bottom, side slope `slope` (horizontal per vertical; 0 = vertical sides), area of the cross section and volume over the run. */
export function trench(run, units = 'ft', { bedding = null, clearance = null, slope = 0.5 } = {}) {
  const od = (run.size || DEFAULTS.size) / mm(units), c = clearance ?? DEFAULTS.clearance[units === 'm' ? 'm' : 'ft'], b = bedding ?? c;
  const depthToInvert = run.depth + od + b, width = od + 2 * c, topWidth = width + 2 * slope * depthToInvert;
  const area = ((width + topWidth) / 2) * depthToInvert, length = runLength(run);
  return { width, topWidth, depthToInvert, area, length, volume: area * length };
}

// ---------------------------------------------------------------------------- drawing and model
export function sceneItems(u, { mmPerUnit = 1 } = {}) {
  const items = [], k = 1 / mmPerUnit;
  for (const r of u?.runs || []) items.push({ layer: SERVICES[r.service].layer + '-RUN', kind: 'poly', pts: r.pts });
  for (const n of u?.nodes || []) {
    const s = 1.4 * k;
    items.push({ layer: SERVICES[n.service].layer + '-NODE', kind: 'poly', pts: [{ x: n.x - s, y: n.y - s }, { x: n.x + s, y: n.y - s }, { x: n.x + s, y: n.y + s }, { x: n.x - s, y: n.y + s }], closed: true });
    if (n.name) items.push({ layer: SERVICES[n.service].layer + '-NODE', kind: 'text', x: n.x + 2 * k, y: n.y, rot: 0, mm: 1.6, align: 'left', text: n.name });
  }
  if (u?.osm && (u.runs.some((r) => r.source === 'osm') || u.nodes.some((n) => n.source === 'osm'))) {
    const all = [...u.runs.flatMap((r) => r.pts), ...u.nodes];
    if (all.length) items.push({ layer: 'U-OSM-TEXT', kind: 'text', x: Math.min(...all.map((p) => p.x)), y: Math.min(...all.map((p) => p.y)) - 4 * k, rot: 0, mm: 1.8, align: 'left', text: ATTRIBUTION });
  }
  return items;
}

export function ifcModel(u, units = 'ft', { zAt = null } = {}) {
  const per = mm(units), runs = [], nodes = [];
  for (const r of u?.runs || []) {
    const ptsZ = r.pts.map((p) => { const g = zAt ? zAt(p.x, p.y) : null; return fin(g) ? { x: p.x, y: p.y, z: g - r.depth - ((r.size || DEFAULTS.size) / per) / 2 } : null; });
    if (ptsZ.some((p) => !p)) continue;
    for (let i = 1; i < ptsZ.length; i++) runs.push({ id: r.id + '-' + i, run: r.id, service: r.service, cable: SERVICES[r.service].cable, name: r.name || r.id, a: ptsZ[i - 1], b: ptsZ[i], dia: (r.size || DEFAULTS.size) / per, material: r.material, owner: r.owner, depth: r.depth, osm: r.osm || '', source: r.source });
  }
  for (const n of u?.nodes || []) { const g = zAt ? zAt(n.x, n.y) : null; if (fin(g)) nodes.push({ id: n.id, service: n.service, kind: n.kind, name: n.name || n.id, x: n.x, y: n.y, z: g - n.depth, owner: n.owner, osm: n.osm || '', source: n.source }); }
  return runs.length || nodes.length ? { runs, nodes, attribution: u?.osm ? ATTRIBUTION : '' } : null;
}
