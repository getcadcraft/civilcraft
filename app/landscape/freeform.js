/* SPDX-License-Identifier: Apache-2.0 */
/**
 * freeform.js — freeform objects that know the terrain (0.7 LD.7, session `landscape`; spike docs/spikes/LD.7-freeform-terrain.md).
 * No DOM. A mesh made anywhere (a ModelCraft / PartCraft export as STL or OBJ, or a CadCraft library item with a mesh body)
 * placed on the site: its base either FOLLOWS the ground (its lowest point on the lowest ground under its footprint) or CUTS
 * the ground (the base set at an elevation and the ground inside the footprint graded to it with daylight slopes, through the
 * same grading as platforms). Quantities come from the mesh itself, so schedules and IFC count it like the parametric objects.
 *
 * state.landscape.freeform = [{ id, name, mesh: { positions: [x,y,z…] (mm, Z up, origin = insertion), indices }, at: {x, y, rot (deg)},
 *   base: 'follow' | 'cut', baseZ: null | z, cut, fill (H:V), ifc: { class, predefined } }]
 *
 *   readStl(bytes) · readObj(text) → { positions, indices } (mm as given ×scale; Y-up OBJ turned Z-up when asked)
 *   meshFromItem(item) → mesh | null (a CadCraft library item, format 1, with a mesh body; untrusted)
 *   cleanFreeform(list) (untrusted) · meshQuantities(mesh) → { volume (m³, closed meshes), area (m²), footprint area (m²), height (m), closed }
 *   footprint(rec, units) → outline [{x,y}] in project coordinates (convex hull of the plan, as the spike's first step)
 *   placed(rec, surface, units) → { base (project units), positions (project units, world), footprint, belowGround (m³, estimate) }
 *   freeformGradeItems(ls, units) → grading items for the 'cut' objects · freeformSceneItems · freeformElements (IFC)
 */

import { daylightPad } from '../grading.js';
import { unitM, inside } from './planting.js';

export const MAX_TRIS = 50000;
export const CLASSES = ['IfcGeographicElement', 'IfcBuildingElementProxy', 'IfcCivilElement', 'IfcFurnishingElement', 'IfcWall', 'IfcSlab'];
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);

function checkMesh(m) {
  if (!m || !Array.isArray(m.positions) && !(m.positions instanceof Float32Array)) return null;
  const P = Array.from(m.positions), I = Array.from(m.indices || []);
  if (P.length < 9 || P.length % 3 || P.length > 3 * 3 * MAX_TRIS || I.length % 3 || I.length / 3 > MAX_TRIS) return null;
  if (!P.every((v) => fin(v) && Math.abs(v) < 1e7)) return null;
  const n = P.length / 3;
  if (!I.every((i) => Number.isInteger(i) && i >= 0 && i < n)) return null;
  return { positions: P, indices: I.length ? I : P.map((_, i) => i).slice(0, n) };
}

/** STL (binary or ASCII) → mesh, vertices merged within 1e-6 of a unit. `scale` = mm per file unit. */
export function readStl(bytes, { scale = 1 } = {}) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const pos = [], idx = [], seen = new Map();
  const add = (x, y, z) => { const k = `${Math.round(x * 1e6)},${Math.round(y * 1e6)},${Math.round(z * 1e6)}`; let i = seen.get(k); if (i === undefined) { i = pos.length / 3; seen.set(k, i); pos.push(x * scale, y * scale, z * scale); } idx.push(i); };
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const nb = u8.length >= 84 ? dv.getUint32(80, true) : -1;
  if (nb >= 0 && 84 + nb * 50 === u8.length) {
    if (nb > MAX_TRIS) throw new Error('too-big');
    for (let t = 0; t < nb; t++) { const o = 84 + t * 50 + 12; for (let v = 0; v < 3; v++) add(dv.getFloat32(o + v * 12, true), dv.getFloat32(o + v * 12 + 4, true), dv.getFloat32(o + v * 12 + 8, true)); }
  } else {
    const text = new TextDecoder().decode(u8);
    const re = /vertex\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)\s+([-+0-9.eE]+)/g;
    let m;
    while ((m = re.exec(text))) { add(+m[1], +m[2], +m[3]); if (idx.length / 3 > MAX_TRIS) throw new Error('too-big'); }
    if (idx.length % 3) idx.length -= idx.length % 3;
  }
  const mesh = checkMesh({ positions: pos, indices: idx });
  if (!mesh) throw new Error('not-mesh');
  return mesh;
}
/** OBJ (v / f, polygons fanned) → mesh. `yUp` turns a Y-up file Z-up. */
export function readObj(text, { scale = 1, yUp = false } = {}) {
  const v = [], idx = [];
  for (const line of String(text).split(/\r?\n/)) {
    const s = line.trim();
    if (s.startsWith('v ')) { const [x, y, z] = s.slice(2).trim().split(/\s+/).map(Number); v.push(yUp ? [x, -z, y] : [x, y, z]); }
    else if (s.startsWith('f ')) {
      const f = s.slice(2).trim().split(/\s+/).map((w) => { const i = parseInt(w.split('/')[0], 10); return i < 0 ? v.length + i : i - 1; });
      for (let k = 1; k + 1 < f.length; k++) idx.push(f[0], f[k], f[k + 1]);
      if (idx.length / 3 > MAX_TRIS) throw new Error('too-big');
    }
  }
  const mesh = checkMesh({ positions: v.flat().map((x) => x * scale), indices: idx });
  if (!mesh) throw new Error('not-mesh');
  return mesh;
}
export function meshFromItem(item) {
  if (!item || item.format !== 'cadcraft-library-item' || item.body?.type !== 'mesh') return null;
  return checkMesh(item.body);
}

export function cleanFreeform(list) {
  const out = [];
  for (const f of Array.isArray(list) ? list.slice(0, 200) : []) {
    if (!f || !/^l\d{1,9}$/.test(String(f.id))) continue;
    const mesh = checkMesh(f.mesh), at = f.at && fin(f.at.x) && fin(f.at.y) ? { x: f.at.x, y: f.at.y, rot: fin(f.at.rot) ? ((f.at.rot % 360) + 360) % 360 : 0 } : null;
    if (!mesh || !at) continue;
    out.push({ id: f.id, name: str(f.name) || 'Freeform', mesh, at, base: f.base === 'cut' ? 'cut' : 'follow', baseZ: fin(f.baseZ) && Math.abs(f.baseZ) < 1e6 ? f.baseZ : null,
      cut: fin(f.cut) && f.cut > 0 && f.cut <= 100 ? f.cut : 2, fill: fin(f.fill) && f.fill > 0 && f.fill <= 100 ? f.fill : 2,
      ifc: { class: CLASSES.includes(f.ifc?.class) ? f.ifc.class : 'IfcGeographicElement', predefined: /^[A-Z_]{1,40}$/.test(f.ifc?.predefined || '') ? f.ifc.predefined : 'USERDEFINED' } });
  }
  return out;
}

/** Volume (divergence theorem: Σ v0·(v1×v2)/6, a closed outward mesh), surface area, plan footprint area, height — in m. */
export function meshQuantities(mesh) {
  const P = mesh.positions, I = mesh.indices;
  let vol = 0, area = 0, zmin = Infinity, zmax = -Infinity;
  const edges = new Map();
  for (let k = 0; k < I.length; k += 3) {
    const a = I[k] * 3, b = I[k + 1] * 3, c = I[k + 2] * 3;
    const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b], by = P[b + 1], bz = P[b + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
    vol += (ax * (by * cz - bz * cy) - ay * (bx * cz - bz * cx) + az * (bx * cy - by * cx)) / 6;
    const ux = bx - ax, uy = by - ay, uz = bz - az, vx = cx - ax, vy = cy - ay, vz = cz - az;
    area += Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) / 2;
    for (const [p, q] of [[I[k], I[k + 1]], [I[k + 1], I[k + 2]], [I[k + 2], I[k]]]) { const key = p < q ? p + ',' + q : q + ',' + p; edges.set(key, (edges.get(key) || 0) + 1); }
  }
  for (let i = 2; i < P.length; i += 3) { zmin = Math.min(zmin, P[i]); zmax = Math.max(zmax, P[i]); }
  const closed = [...edges.values()].every((n) => n === 2);
  const hull = convexHull(planPoints(mesh));
  return { volume: closed ? Math.abs(vol) / 1e9 : null, area: area / 1e6, footprint: Math.abs(polyArea(hull)) / 1e6, height: (zmax - zmin) / 1000, zmin: zmin / 1000, closed };
}
const planPoints = (mesh) => { const out = []; for (let i = 0; i < mesh.positions.length; i += 3) out.push({ x: mesh.positions[i], y: mesh.positions[i + 1] }); return out; };
function polyArea(p) { let a = 0; for (let i = 0; i < p.length; i++) { const q = p[(i + 1) % p.length]; a += p[i].x * q.y - q.x * p[i].y; } return a / 2; }
export function convexHull(pts) {
  const p = [...pts].sort((a, b) => a.x - b.x || a.y - b.y), cross = (o, a, b) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  if (p.length < 3) return p;
  const lo = [], hi = [];
  for (const q of p) { while (lo.length >= 2 && cross(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (hi.length >= 2 && cross(hi[hi.length - 2], hi[hi.length - 1], q) <= 0) hi.pop(); hi.push(q); }
  return [...lo.slice(0, -1), ...hi.slice(0, -1)];
}
/** mm (mesh) → project coordinates, turned by at.rot about the insertion point. */
function toWorld(rec, units) {
  const k = 1 / (1000 * unitM(units)), a = (rec.at.rot * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a);
  return (x, y) => ({ x: rec.at.x + (x * c - y * s) * k, y: rec.at.y + (x * s + y * c) * k });
}
export function footprint(rec, units) { const w = toWorld(rec, units); return convexHull(planPoints(rec.mesh)).map((p) => w(p.x, p.y)); }

/** Where it sits: follow = the lowest ground under the footprint (corners, edge midpoints, centre); cut = baseZ (or the mean). */
export function placed(rec, surface, units) {
  const fp = footprint(rec, units), um = unitM(units);
  const zs = [];
  if (surface) {
    for (let i = 0; i < fp.length; i++) { const p = fp[i], q = fp[(i + 1) % fp.length]; for (const r of [p, { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 }]) { const z = surface.elevationAt(r.x, r.y, 1e-6); if (z !== null) zs.push(z); } }
    const cz = surface.elevationAt(rec.at.x, rec.at.y, 1e-6); if (cz !== null) zs.push(cz);
  }
  const ground = zs.length ? { min: Math.min(...zs), mean: zs.reduce((a, b) => a + b, 0) / zs.length } : { min: 0, mean: 0 };
  const zmin = Math.min(...rec.mesh.positions.filter((_, i) => i % 3 === 2)) / 1000 / um;
  const base = rec.base === 'cut' ? rec.baseZ ?? ground.mean : ground.min;
  const w = toWorld(rec, units), P = rec.mesh.positions, positions = [];
  for (let i = 0; i < P.length; i += 3) { const q = w(P[i], P[i + 1]); positions.push(q.x, q.y, base + P[i + 2] / 1000 / um - zmin); }
  // below the existing ground (follow): sampled on a grid over the footprint — an estimate, as the spike says
  let below = 0;
  if (surface && rec.base === 'follow') {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of fp) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    const cell = Math.max((x1 - x0) / 40, (y1 - y0) / 40, 1e-6);
    for (let x = x0 + cell / 2; x < x1; x += cell) for (let y = y0 + cell / 2; y < y1; y += cell) { if (!inside(x, y, fp)) continue; const g = surface.elevationAt(x, y, 1e-6); if (g !== null && g > base) below += (g - base) * cell * cell; }
    below *= um ** 3;
  }
  return { base, positions, footprint: fp, belowGround: below };
}

export function freeformGradeItems(ls, units) {
  return (ls?.freeform || []).filter((f) => f.base === 'cut').map((f) => ({ id: f.id, kind: 'ls-freeform', name: f.name, patch: (surf) => {
    const pl = placed(f, surf, units), z = pl.base;
    const dl = daylightPad(surf, { pts: pl.footprint, z, cut: f.cut, fill: f.fill });
    if (dl.problems.length || !dl.rays.length) return { problems: dl.problems, region: null, points: [], breaklines: [], info: dl };
    const bl = [{ name: f.name, pts: [...dl.poly, dl.poly[0]].map((p) => ({ x: p.x, y: p.y, z })) }, { name: f.name + ' daylight', pts: [...dl.daylight, dl.daylight[0]] }];
    for (const r of dl.rays) if (r.d > 1e-6) bl.push({ name: 'slope', pts: [{ x: r.x0, y: r.y0, z }, { x: r.x, y: r.y, z: r.z }] });
    return { problems: [], region: dl.daylight, points: [], breaklines: bl, info: { kind: 'freeform', z } };
  } }));
}

export function freeformSceneItems(ls, units, { unitPerMm = 1 } = {}) {
  const items = [];
  for (const f of ls?.freeform || []) {
    const fp = footprint(f, units);
    items.push({ layer: 'L-HARD-PAVE', kind: 'poly', pts: fp, closed: true });
    items.push({ layer: 'L-HARD-TEXT', kind: 'text', x: f.at.x, y: f.at.y, mm: 2, rot: 0, text: f.name, align: 'center', middle: true });
    void unitPerMm;
  }
  return items;
}

/** IFC elements: the mesh as a body (ifc-landscape.js kind 'mesh') with its quantities. */
export function freeformElements(ls, surface, units) {
  return (ls?.freeform || []).map((f) => {
    const pl = placed(f, surface, units), q = meshQuantities(f.mesh), o = { x: f.at.x, y: f.at.y, z: pl.base };
    const pos = [];
    for (let i = 0; i < pl.positions.length; i += 3) pos.push(pl.positions[i] - o.x, pl.positions[i + 1] - o.y, pl.positions[i + 2] - o.z);
    const qto = f.ifc.class === 'IfcGeographicElement' ? 'CadCraft_FreeformQuantities' : f.ifc.class === 'IfcBuildingElementProxy' ? 'Qto_BuildingElementProxyQuantities' : 'CadCraft_FreeformQuantities';
    return { cls: f.ifc.class, predefined: f.ifc.predefined, name: f.name, objectType: 'Freeform', tag: f.id, at: o, body: { kind: 'mesh', positions: pos, indices: f.mesh.indices },
      psets: { CadCraft_Freeform: { Base: f.base, BaseElevation: pl.base, TerrainAware: true }, [qto]: { NetVolume: q.volume ?? '', OuterSurfaceArea: q.area, FootprintArea: q.footprint, Height: q.height, BelowGroundVolumeEstimate: f.base === 'follow' ? pl.belowGround : '' } } };
  });
}
