/* SPDX-License-Identifier: Apache-2.0 */
/**
 * usd-civilcraft.js — the 3D site as OpenUSD by docs/USD-CONVENTIONS.md § 2 (facility pattern) and § 6 (0.7 XF.8, session
 * `usd`). DOM-free; the library is cc-usd (./usd/, a copy of lib/usd written by tools/usd/sync.mjs).
 *
 *   siteUsd(scene, { format = 'usda' | 'usdc' | 'usdz', name, crs }) → { data, report: { meshes, lines, points } }
 *     scene = site3d.js buildSite3D(…) (what the 3D view shows); crs = the project's coordinate system (state.crs) or null
 *
 * At true scale (the vertical exaggeration taken back out), in metres (US survey feet → 1200/3937 m), Z up. Points stay in
 * the scene's local coordinates (small, precise floats); the Site's own transform (doubles) puts them back at the project's
 * eastings, northings and elevations, and the Site carries the coordinate system's name (`ifc:crs:name`). Surfaces, pipes,
 * structures and pads are meshes with their colours and normals (Terrain, Drainage, Grading); contours, breaklines,
 * corridors, GIS lines and feature lines are linear BasisCurves (each line kind one prim, segment pairs); alignments are
 * BasisCurves under `Facility_Alignments`, one per alignment; survey points are a Points prim with their numbers as ids.
 */
import { UsdBuilder, V } from './usd/index.js';

const METERS_PER = { ft: 1200 / 3937, m: 1 };
const GROUP_OF = (key) => (/^(eg|fg|tin|surface)/.test(key) ? 'Terrain' : /pipe|struct|network/.test(key) ? 'Drainage' : /pad|grad|daylight/.test(key) ? 'Grading' : /corridor/.test(key) ? 'Corridors' : 'Other');

export function siteUsd(scene, { format = 'usda', name = 'site', crs = null } = {}) {
  const k = METERS_PER[scene.units] || 1, e = scene.exag || 1;
  const b = new UsdBuilder({ app: 'CivilCraft', source: name, doc: name });
  const report = { meshes: 0, lines: 0, points: 0 };
  const o = scene.origin || { x: 0, y: 0, z: 0 };
  const site = b.group(b.root, 'Site_' + (name || 'site'), { kind: 'assembly', displayName: name || 'Site', matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, o.x * k, o.y * k, o.z * k, 1] });
  b.attr(site, 'ifc:class', 'token', 'IfcSite', { custom: true, uniform: true });
  const code = crs && (crs.code || crs.name || crs.id);
  if (code) b.attr(site, 'ifc:crs:name', 'string', String(code), { custom: true, uniform: true });
  b.attr(site, 'cadcraft:units', 'token', scene.units === 'ft' ? 'usft' : 'm', { custom: true, uniform: true });
  const conv = (P) => {
    const out = new Float32Array(P.length);
    for (let i = 0; i < P.length; i += 3) { out[i] = P[i] * k; out[i + 1] = P[i + 1] * k; out[i + 2] = (P[i + 2] / e) * k; }
    return out;
  };
  const convN = (N) => {
    const out = new Float32Array(N.length);
    for (let i = 0; i < N.length; i += 3) { const x = N[i], y = N[i + 1], z = N[i + 2] * e, l = Math.hypot(x, y, z) || 1; out[i] = x / l; out[i + 1] = y / l; out[i + 2] = z / l; }
    return out;
  };
  const groups = new Map();
  const groupOf = (g) => { if (!groups.has(g)) groups.set(g, b.group(site, g, { kind: 'group' })); return groups.get(g); };
  const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  for (const m of scene.meshes || []) {
    if (!m.indices || !m.indices.length) continue;
    const nt = m.indices.length / 3;
    const geo = { points: conv(m.positions), counts: new Int32Array(nt).fill(3), indices: Int32Array.from(m.indices) };
    if (m.normals) geo.normals = { values: convN(m.normals), interp: 'vertex' };
    if (m.colors) geo.colors = { values: Float32Array.from(m.colors, srgbToLin), interp: 'vertex' };
    if (m.uvs) geo.uvs = [{ name: 'st', values: m.uvs, interp: 'vertex' }];
    const p = b.mesh(groupOf(GROUP_OF(m.key || '')), m.name || m.key || 'Surface', geo, { displayName: m.name || m.key });
    b.attr(p, 'cadcraft:key', 'string', String(m.key || ''), { custom: true, uniform: true });
    report.meshes++;
  }
  // lines: alignments one curve each (by owner), everything else one curve per line kind
  for (const L of scene.lines || []) {
    const P = conv(L.positions);
    const nseg = P.length / 6;
    if (!nseg) continue;
    const color = typeof L.color === 'string' && /^#[0-9a-f]{6}$/i.test(L.color) ? [1, 3, 5].map((i) => srgbToLin(parseInt(L.color.slice(i, i + 2), 16) / 255)) : [0.1, 0.1, 0.1];
    const isAlign = /alignment/.test(L.key || '') && L.owners && L.segOwner;
    const parts = new Map();
    if (isAlign) for (let s = 0; s < nseg; s++) { const ow = L.segOwner[s]; if (!parts.has(ow)) parts.set(ow, []); parts.get(ow).push(s); }
    else parts.set(-1, Array.from({ length: nseg }, (_, s) => s));
    for (const [ow, segs] of parts) {
      const owner = ow >= 0 ? L.owners[ow] : null;
      const parent = isAlign ? groupOf('Facility_Alignments') : groupOf(GROUP_OF(L.key || '') === 'Other' ? 'Lines' : GROUP_OF(L.key || ''));
      const nm = owner ? owner.name || 'Alignment' : L.name || L.key || 'Lines';
      const pts = new Float32Array(segs.length * 6);
      segs.forEach((s, i) => pts.set(P.subarray(s * 6, s * 6 + 6), i * 6));
      const c = b.prim(parent, nm, 'BasisCurves', { displayName: nm });
      b.attr(c, 'type', 'token', 'linear', { uniform: true });
      b.attr(c, 'curveVertexCounts', 'int[]', new Int32Array(segs.length).fill(2));
      b.attr(c, 'points', 'point3f[]', pts);
      b.attr(c, 'widths', 'float[]', [0.1], { meta: { interpolation: V('token', 'constant') } });
      b.attr(c, 'primvars:displayColor', 'color3f[]', color, { meta: { interpolation: V('token', 'constant') } });
      b.attr(c, 'cadcraft:key', 'string', String(L.key || ''), { custom: true, uniform: true });
      if (owner) b.attr(c, 'cadcraft:alignment', 'string', String(owner.id ?? ''), { custom: true, uniform: true });
      report.lines++;
    }
  }
  if (scene.points && scene.points.positions && scene.points.positions.length) {
    const P = conv(scene.points.positions);
    const pp = b.prim(groupOf('Survey'), 'Points', 'Points');
    b.attr(pp, 'points', 'point3f[]', P);
    b.attr(pp, 'widths', 'float[]', [0.3], { meta: { interpolation: V('token', 'constant') } });
    const ids = (scene.points.ids || []).map((n) => Number(n));
    if (ids.length === P.length / 3 && ids.every((n) => Number.isSafeInteger(n) && n >= 0)) b.attr(pp, 'ids', 'int64[]', ids.map((n) => BigInt(n)));
    report.points = P.length / 3;
  }
  const data = format === 'usdz' ? b.usdz() : b.write(format);
  return { data, report };
}
