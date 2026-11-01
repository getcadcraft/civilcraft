/* SPDX-License-Identifier: Apache-2.0 */
/**
 * zones.js — where the safety zones go (0.8 Track CH, CH.16 and CH.17; DOM-free). The consequence calculator (consequence.js) and the area calculator (area.js) give zones in
 * metres; this file turns them into what each host takes, so no host re-derives them:
 *   siteGeoJson(zones, { origin?, name? })   a GeoJSON FeatureCollection of the plan footprints (circles as 48-gon rings, plumes as their polygon), properties { id, label, kind, level,
 *                                            radius_m }, in LOCAL metres (no coordinate reference system: the site plan puts them where the release is; CivilCraft's Import reads it)
 *   siteDxf(zones, { origin? })              the same footprints as an R12 DXF text (LWPOLYLINE-free: POLYLINE/VERTEX), one layer per level: CONSEQ-1, CONSEQ-2…
 *   volumeMesh(volume, { sides })            a closed triangle mesh { verts, tris } of a zone volume (sphere, hemisphere, cylinder or extruded polygon), outward faces, metres
 *   sourcesFromPid(items, opts)              release sources (area.js shape) from P&ID equipment and fittings, grade by what each item is, the substance by its service, an
 *                                            editable screening hole when the design pressure is known. Every default is said in the result's `assumptions`.
 * Owner 2026-10-29: shipped in /lab marked "not engineer-reviewed" (O7).
 */
const f6 = (v) => +(+v).toFixed(6);
const ring = (cx, cy, r, n = 48) => Array.from({ length: n + 1 }, (_, k) => { const a = 2 * Math.PI * (k % n) / n; return [f6(cx + r * Math.cos(a)), f6(cy + r * Math.sin(a))]; });
const footprint = (z) => (z.type === 'circle' ? ring(z.cx, z.cy, z.r) : (z.polygon || []).length > 2 ? z.polygon.concat([z.polygon[0]]).map(([x, y]) => [f6(x), f6(y)]) : null);

export function siteGeoJson(zones, { origin = [0, 0], name = 'consequence zones' } = {}) {
  const features = [];
  for (const z of zones || []) {
    const r = footprint(z); if (!r) continue;
    features.push({ type: 'Feature', properties: { id: String(z.id), label: String(z.label || ''), kind: z.type === 'circle' ? 'radius' : 'plume', level: z.level ?? null, radius_m: f6(z.r || 0), review: 'not engineer-reviewed' },
      geometry: { type: 'Polygon', coordinates: [r.map(([x, y]) => [f6(x + origin[0]), f6(y + origin[1])])] } });
  }
  return { type: 'FeatureCollection', name, features };
}
export function siteDxf(zones, { origin = [0, 0] } = {}) {
  const lv = [...new Set((zones || []).map((z) => String(z.level)))], out = ['0', 'SECTION', '2', 'ENTITIES'];
  for (const z of zones || []) {
    const r = footprint(z); if (!r) continue;
    const layer = 'CONSEQ-' + (lv.indexOf(String(z.level)) + 1);
    out.push('0', 'POLYLINE', '8', layer, '66', '1', '70', '1');
    for (const [x, y] of r.slice(0, -1)) out.push('0', 'VERTEX', '8', layer, '10', String(f6(x + origin[0])), '20', String(f6(y + origin[1])), '30', '0');
    out.push('0', 'SEQEND', '8', layer);
  }
  out.push('0', 'ENDSEC', '0', 'EOF'); return out.join('\n') + '\n';
}

/** A closed outward-facing mesh of a zone volume. volume: { type 'sphere'|'hemisphere'|'cylinder'|'polygon', cx, cy, cz | z, r, z0, z1, polygon[[x,y]], height }. Metres. */
export function volumeMesh(v, { sides = 24 } = {}) {
  const verts = [], tris = [], push = (p) => verts.push(p) - 1;
  const lathe = (profile) => {                                                 // [r, z] from the bottom pole up; about (cx, cy)
    const rings = profile.map(([r, z]) => (r < 1e-9 ? { pole: push([v.cx, v.cy, z]) } : { ring: Array.from({ length: sides }, (_, i) => push([v.cx + r * Math.cos(2 * Math.PI * i / sides), v.cy + r * Math.sin(2 * Math.PI * i / sides), z])) }));
    for (let k = 0; k + 1 < rings.length; k++) for (let i = 0; i < sides; i++) {
      const a = rings[k], b = rings[k + 1], j = (i + 1) % sides;
      if (a.pole !== undefined && b.ring) tris.push([a.pole, b.ring[j], b.ring[i]]);
      else if (a.ring && b.pole !== undefined) tris.push([a.ring[i], a.ring[j], b.pole]);
      else if (a.ring && b.ring) { tris.push([a.ring[i], a.ring[j], b.ring[j]]); tris.push([a.ring[i], b.ring[j], b.ring[i]]); }
    }
  };
  if (v.type === 'sphere' || v.shape === 'sphere') { const n = 12; lathe(Array.from({ length: n + 1 }, (_, i) => { const a = -Math.PI / 2 + Math.PI * i / n; return [i === 0 || i === n ? 0 : v.r * Math.cos(a), v.cz + v.r * Math.sin(a)]; })); }
  else if (v.type === 'hemisphere' || v.shape === 'hemisphere') { const n = 8, z0 = v.z ?? 0; lathe([[0, z0]].concat(Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI / 2 * i / n; return [i === n ? 0 : v.r * Math.cos(a), z0 + v.r * Math.sin(a)]; }).slice(0))); }
  else if (v.type === 'cylinder' || v.shape === 'cylinder') lathe([[0, v.z0], [v.r, v.z0], [v.r, v.z1], [0, v.z1]]);
  else if ((v.type === 'polygon' || v.shape === 'extrusion') && v.polygon && v.polygon.length > 2) {
    const z0 = v.z0 ?? 0, z1 = z0 + (v.height ?? v.zMax ?? 1), P = v.polygon, area = P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + (p[0] * q[1] - q[0] * p[1]); }, 0);
    const poly = area < 0 ? P.slice().reverse() : P, lo = poly.map(([x, y]) => push([x, y, z0])), hi = poly.map(([x, y]) => push([x, y, z1])), n = poly.length;
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; tris.push([lo[i], lo[j], hi[j]], [lo[i], hi[j], hi[i]]); }
    const cLo = push([poly.reduce((s, p) => s + p[0], 0) / n, poly.reduce((s, p) => s + p[1], 0) / n, z0]), cHi = push([verts[cLo][0], verts[cLo][1], z1]);   // fan caps (star-shaped footprints)
    for (let i = 0; i < n; i++) { const j = (i + 1) % n; tris.push([cLo, lo[j], lo[i]], [cHi, hi[i], hi[j]]); }
  } else throw new Error('volume: sphere | hemisphere | cylinder | polygon');
  return { verts, tris };
}
export function meshVolume(m) { let s = 0; for (const [a, b, c] of m.tris) { const p = m.verts[a], q = m.verts[b], r = m.verts[c]; s += (p[0] * (q[1] * r[2] - q[2] * r[1]) - p[1] * (q[0] * r[2] - q[2] * r[0]) + p[2] * (q[0] * r[1] - q[1] * r[0])) / 6; } return s; }

/** 3D volumes (metres) of a result's zones, whatever made them: area zones carry a `shape` (sphere, cylinder), consequence zones a circle (a hemisphere on the ground) or a plume polygon (extruded). */
export function volumesOf(zones) {
  const out = [];
  for (const z of zones || []) {
    const label = z.label || (z.zone ? z.zone + (z.tag ? ' ' + z.tag : '') : String(z.id));
    if (z.shape) out.push({ ...z.shape, label, id: z.id });
    else if (z.type === 'circle') out.push({ type: 'hemisphere', cx: z.cx, cy: z.cy, z: 0, r: z.r, label, id: z.id });
    else if (z.polygon && z.polygon.length > 2) out.push({ type: 'polygon', polygon: z.polygon, z0: 0, height: z.zMax || 1, label, id: z.id });
  }
  return out;
}

// ---- release sources from the P&ID (CH.17) -----------------------------------------------------------------------------------------------------------------------
/**
 * What each P&ID item releases by default (a screening assumption, not a table of the standard): pump / compressor shaft seals and flanged equipment are SECONDARY grade sources,
 * valves' stem seals secondary, a vessel vent / open drain / sampling point PRIMARY, a relief valve to atmosphere SECONDARY here (primary if its attribute `vent` says so). The person
 * edits any of it. Items: [{ tag, sym, group, x, y (m, the drawing's), svc, attrs: { dp, dt, svc, vent } }].
 */
export const DEFAULT_GRADE = {
  'pump-cf': ['shaft seal', 'secondary'], 'pump-pd': ['shaft seal', 'secondary'], compressor: ['shaft seal', 'secondary'], fan: ['shaft seal', 'secondary'], agitator: ['shaft seal', 'secondary'],
  'vessel-v': ['flanges and nozzles', 'secondary'], 'vessel-h': ['flanges and nozzles', 'secondary'], column: ['flanges and nozzles', 'secondary'], reactor: ['flanges and nozzles', 'secondary'], tank: ['vent', 'primary'],
  'exch-shell': ['flanged joints', 'secondary'], 'exch-plate': ['gaskets', 'secondary'], filter: ['cover seal', 'secondary'], strainer: ['cover seal', 'secondary'], 'sight-glass': ['glass seals', 'secondary'],
  relief: ['relief outlet', 'secondary'], gate: ['stem seal', 'secondary'], globe: ['stem seal', 'secondary'], ball: ['stem seal', 'secondary'], plug: ['stem seal', 'secondary'], needle: ['stem seal', 'secondary'],
  butterfly: ['stem seal', 'secondary'], diaphragm: ['stem seal', 'secondary'], angle: ['stem seal', 'secondary'], threeway: ['stem seal', 'secondary'], sample: ['sampling point', 'primary'],
};
const num = (s) => { const m = /(-?\d+(?:\.\d+)?)/.exec(String(s ?? '')); return m ? +m[1] : null; };
/** opts { substances: { <service>: { name, lfl, M, heavy? } }, ventilation: { degree, availability, C?, f?, indoor? }, hole (m, default 0.00025), unitMm (drawing unit in mm → metres via x/1000), z (release height m, default 1), only: [syms] } */
export function sourcesFromPid(items, opts = {}) {
  const sources = [], problems = [], assumptions = ['grade of release by what the item is (' + 'seals, flanges and valve stems secondary; vents and sampling points primary): a screening default, not the standard\'s table', 'hole diameter ' + (opts.hole ?? 0.00025) * 1000 + ' mm unless the item gives a rate'], skipped = new Set();
  const vent = { degree: 'medium', availability: 'fair', indoor: false, ...(opts.ventilation || {}) }, k = opts.toMetres ?? 1;
  let n = 0;
  for (const it of items || []) {
    const d = DEFAULT_GRADE[it.sym]; if (!d || (opts.only && !opts.only.includes(it.sym))) continue;
    const svc = (it.svc || it.attrs?.svc || '').trim(), sub = svc && opts.substances?.[svc];
    if (!sub) { skipped.add(svc || '(no service)'); continue; }
    const vented = it.attrs?.vent === 'atmosphere' || it.attrs?.vent === 'yes', P = num(it.attrs?.dp), grade = it.sym === 'relief' && vented ? 'primary' : d[1];
    const src = { id: 'PS' + (++n), tag: it.tag || '', kind: d[0], grade, substance: { name: sub.name, lfl: sub.lfl, M: sub.M, heavy: !!sub.heavy }, at: { x: f6((it.x ?? 0) * k), y: f6((it.y ?? 0) * k), z: opts.z ?? 1 }, ventilation: { ...vent }, pid: it.tag || '' };
    if (it.attrs?.rate && num(it.attrs.rate) > 0) src.rate = num(it.attrs.rate);
    else if (P && (opts.hole ?? 0.00025) > 0) src.hole = { d: opts.hole ?? 0.00025, P0: 101325 + P * 1e5, T: (num(it.attrs?.dt) != null ? num(it.attrs.dt) + 273.15 : 293.15), k: sub.k || 1.3 };
    else { problems.push({ code: 'area.nosize', severity: 'info', text: `${it.tag || it.sym}: no design pressure (dp) or release rate (rate) on the symbol, so no extent can be worked out; the source is listed without one.` }); }
    sources.push(src);
  }
  for (const s of skipped) problems.push({ code: 'area.nosubstance', severity: 'warning', text: `Service "${s}" has no substance in the list given (name, lower flammable limit, molar mass): its items are not sources yet.` });
  return { sources, problems, assumptions };
}
