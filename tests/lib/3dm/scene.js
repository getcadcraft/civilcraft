/* SPDX-License-Identifier: Apache-2.0 */
/**
 * scene.js — a read .3dm model (read.js) as a plain scene the apps place: meshes, polylines and block placements in the
 * file's units, each with its layer, colour and visibility, plus a report of what was read, from where, and what was not.
 * DOM-free.
 *
 *   toScene(model, { mode: 'cached-first' | 'ours', tol, maxTriangles }) → {
 *     units { name, metres }, layers [{ index, name (path "Parent::Child"), color '#rrggbb', visible }],
 *     items [Item], blocks Map(id → { id, name, items [Item] }),
 *     report { meshes, faces, curves, instances, blocks, hidden,
 *              surfaces { cached, ours {kind → faces}, notRead {kind → faces} },
 *              skipped {kind → objects}, unreadable, missingBlocks, linkedBlocks, mitered, capped },
 *     notes [{ key, vars }]   (ccdm.note.* — what was read differently or left out, in words, through msg())
 *   }
 *   Item = { kind: 'mesh', name, id, layer, color, hidden, source: 'mesh' | 'cached' | 'ours' | 'mixed',
 *            positions Float64Array, indices Uint32Array, normals?, uvs?, colors?, triFace? }
 *        | { kind: 'curve', name, id, layer, color, hidden, pts [[x,y,z]…] }
 *        | { kind: 'instance', name, id, layer, color, hidden, block (id), xform (16 numbers, row-major as the file) }
 */
import { sampleCurve, curveOk, surfaceOk } from './geom.js';
import { msg } from './messages.js';
import { meshTriangles, tessellateBrep, tessellateExtrusion, newStats } from './tess.js';

const hex = (c) => '#' + [0, 1, 2].map((k) => (c[k] & 255).toString(16).padStart(2, '0')).join('');
const CURVES = new Set(['nurbsCurve', 'lineCurve', 'polylineCurve', 'arcCurve', 'polyCurve']);
const SURFACE_ONLY = new Set(['nurbsSurface', 'planeSurface', 'revSurface', 'sumSurface']);

/** A lone surface as a one-face brep (its whole domain, untrimmed). */
function surfaceBrep(s) {
  return { cls: 'brep', lone: s, c2: [], c3: [], S: [s], V: [], E: [], T: [], L: [], F: [{ li: [], si: 0, rev: false, mesh: null }] };
}

export function toScene(model, { mode = 'cached-first', tol = null, maxTriangles = 4000000 } = {}) {
  const stats = newStats();
  const report = { meshes: 0, faces: 0, curves: 0, instances: 0, blocks: 0, hidden: 0, surfaces: stats, skipped: { ...model.unread }, unreadable: model.unreadable, missingBlocks: 0, linkedBlocks: 0, mitered: 0, capped: 0 };
  const notes = model.notes.slice();
  const layers = model.layers.map((l, i) => ({ index: i, name: l.path || l.name || String(i + 1), color: hex(l.color), visible: l.visible && l.shownByParent !== false, material: l.material }));
  const materialColor = (i) => { const m = model.materials[i]; return m && m.diffuse ? hex(m.diffuse) : null; };
  const colorOf = (a) => {
    const L = layers[a.layer];
    switch (a.colorSource) {
      case 1: return a.color ? hex(a.color) : (L ? L.color : null);
      case 2: return materialColor(a.materialSource === 1 ? a.material : L ? L.material : -1) || (L ? L.color : null);
      default: return L ? L.color : null;   // by layer; by parent (in a block) takes the object's own layer here
    }
  };
  // the file's tolerance is a modelling tolerance; for triangles we also stay within a small part of each object's size
  const baseTol = tol || model.tolerance || 0.01;
  const tolFor = (bbox) => {
    if (!bbox || !(bbox[0][0] <= bbox[1][0] && bbox[0][1] <= bbox[1][1] && bbox[0][2] <= bbox[1][2])) return baseTol;
    const d = Math.hypot(bbox[1][0] - bbox[0][0], bbox[1][1] - bbox[0][1], bbox[1][2] - bbox[0][2]);
    return Number.isFinite(d) && d > 0 ? Math.max(baseTol, d * 1.5e-3) : baseTol;
  };

  const blockOf = new Map();   // object id → block id
  for (const b of model.blocks.values()) for (const id of b.objects) blockOf.set(id, b.id);
  const top = [], inBlock = new Map();
  let triangles = 0;

  for (const { attrs, geom } of model.objects) {
    const g = geom;
    const base = { name: attrs.name || '', id: attrs.id, layer: attrs.layer >= 0 && attrs.layer < layers.length ? attrs.layer : (layers.length ? 0 : -1), color: colorOf(attrs), hidden: !attrs.visible || attrs.mode === 1 };
    let item = null;
    try {
      if (g.cls === 'mesh' && !g.unread) {
        const t = meshTriangles(g);
        if (t.indices.length) item = { kind: 'mesh', source: 'mesh', ...base, ...t };
      } else if ((g.cls === 'brep' && !g.unread) || (SURFACE_ONLY.has(g.cls) && !g.unread)) {
        const b = g.cls === 'brep' ? g : surfaceBrep(g);
        const before = { cached: stats.cached, ours: sum(stats.ours) };
        const t = tessellateBrep(b, { tol: tolFor(roughBox(b)), mode, maxTriangles: Math.max(1000, maxTriangles - triangles), stats });
        const cached = stats.cached - before.cached, ours = sum(stats.ours) - before.ours;
        if (t.indices.length) item = { kind: 'mesh', source: cached && ours ? 'mixed' : cached ? 'cached' : 'ours', ...base, ...t };
        if (g.cls === 'brep' && g.F.some((f) => !surfaceOk(g.S[f.si]) && !f.mesh)) report.partial = (report.partial || 0) + 1;
      } else if (g.cls === 'extrusion' && !g.unread) {
        const m0 = stats.mitered;
        const t = tessellateExtrusion(g, { tol: tolFor(roughBox(g)), mode, stats });
        if (stats.mitered > m0) report.mitered++;
        if (t && t.indices.length) item = { kind: 'mesh', source: mode !== 'ours' && g.mesh ? 'cached' : 'ours', ...base, ...t };
      } else if (CURVES.has(g.cls) && !g.unread) {
        if (curveOk(g)) {
          const { pts } = sampleCurve(g, baseTol);
          if (pts.length >= 2) item = { kind: 'curve', ...base, pts };
        } else report.skipped[g.cls] = (report.skipped[g.cls] || 0) + 1;
      } else if (g.cls === 'instanceRef' && !g.unread) {
        if (g.xform.every(Number.isFinite)) item = { kind: 'instance', ...base, block: g.idef, xform: g.xform };
      }
    } catch (e) {
      // one object whose numbers make no sense (a damaged file) is left out and counted; the rest still comes in
      if (e && e.code === 'too_big') throw e;
      report.unreadable++;
      item = null;
    }
    if (!item) continue;
    if (item.kind === 'mesh') { triangles += item.indices.length / 3; }
    const bid = attrs.mode === 3 || blockOf.has(attrs.id) ? blockOf.get(attrs.id) : null;
    if (bid) { if (!inBlock.has(attrs.id)) inBlock.set(attrs.id, item); }
    else if (attrs.mode === 3) continue;   // block geometry no block lists
    else top.push(item);
  }

  const blocks = new Map();
  for (const b of model.blocks.values()) {
    const items = b.objects.map((id) => inBlock.get(id)).filter(Boolean);
    if (b.linked && !items.length) report.linkedBlocks++;
    blocks.set(b.id, { id: b.id, name: b.name || '', items });
  }
  // counts (top level and blocks once each)
  const count = (it) => {
    if (it.kind === 'mesh') { report.meshes++; report.faces += it.indices.length / 3; }
    if (it.kind === 'curve') report.curves++;
    if (it.kind === 'instance') { report.instances++; if (!blocks.has(it.block)) report.missingBlocks++; }
    if (it.hidden) report.hidden++;
  };
  top.forEach(count);
  for (const b of blocks.values()) b.items.forEach(count);
  report.blocks = [...blocks.values()].filter((b) => b.items.length).length;
  report.capped = stats.capped;

  // what was not read, in words
  const sk = report.skipped;
  const pts = (sk.point || 0) + (sk.pointCloud || 0);
  if (pts) notes.push({ key: 'ccdm.note.points', vars: { n: pts } });
  if (sk.subd) notes.push({ key: 'ccdm.note.subd', vars: { n: sk.subd } });
  const other = Object.entries(sk).filter(([k, n]) => n && !['point', 'pointCloud', 'subd'].includes(k));
  if (other.length) notes.push({ key: 'ccdm.note.skipped', vars: { n: other.reduce((a, [, n]) => a + n, 0), kinds: other.map(([k, n]) => n + ' × ' + KIND_WORDS(k)).join(', ') } });
  if (report.unreadable) notes.push({ key: 'ccdm.note.unreadable', vars: { n: report.unreadable } });
  const nr = Object.entries(stats.notRead).filter(([, n]) => n);
  if (nr.length) notes.push({ key: 'ccdm.note.surfaces', vars: { n: nr.reduce((a, [, n]) => a + n, 0), kinds: nr.map(([k, n]) => n + ' × ' + SURFACE_WORDS(k)).join(', ') } });
  if (report.mitered) notes.push({ key: 'ccdm.note.mitered', vars: { n: report.mitered } });
  if (stats.cached) notes.push({ key: 'ccdm.note.render_mesh', vars: { n: stats.cached } });
  if (report.missingBlocks) notes.push({ key: 'ccdm.note.missing_block', vars: { n: report.missingBlocks } });
  if (report.linkedBlocks) notes.push({ key: 'ccdm.note.linked_block', vars: { n: report.linkedBlocks } });
  if (report.capped) notes.push({ key: 'ccdm.note.capped', vars: { n: report.capped } });
  return { units: { name: model.units.name, metres: model.units.metres }, layers, items: top, blocks, report, notes };
}

const sum = (o) => Object.values(o).reduce((a, n) => a + n, 0);

/**
 * A box around a brep or extrusion from what is cheap to reach (its vertices, its curves' break points, control points),
 * for the tessellation tolerance only. The box a file stores is not used: some programs write an empty one.
 */
function roughBox(g) {
  const lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
  const add = (p) => { if (p && p.every(Number.isFinite)) for (let k = 0; k < 3; k++) { lo[k] = Math.min(lo[k], p[k]); hi[k] = Math.max(hi[k], p[k]); } };
  const curve = (c) => { if (curveOk(c)) for (const p of sampleCurve(c, Infinity).pts) add(p); };
  if (g.cls === 'brep') {
    g.V.forEach(add);
    g.c3.forEach(curve);
    for (const s of g.S) {
      if (!s) continue;
      if (s.cls === 'nurbsSurface') { const w = s.dim + (s.rat ? 1 : 0); for (let i = 0; i < s.cvs.length; i += w) add(s.rat ? [s.cvs[i] / s.cvs[i + s.dim], s.cvs[i + 1] / s.cvs[i + s.dim], s.cvs[i + 2] / s.cvs[i + s.dim]] : [s.cvs[i], s.cvs[i + 1], s.dim > 2 ? s.cvs[i + 2] : 0]); }
      if (s.cls === 'revSurface' && curveOk(s.curve)) {
        const pts = sampleCurve(s.curve, Infinity).pts, [o, e] = s.axis, d = [e[0] - o[0], e[1] - o[1], e[2] - o[2]], L = Math.hypot(...d) || 1, z = d.map((x) => x / L);
        for (const p of pts) { const v = [p[0] - o[0], p[1] - o[1], p[2] - o[2]], t = v[0] * z[0] + v[1] * z[1] + v[2] * z[2], r = Math.hypot(v[0] - t * z[0], v[1] - t * z[1], v[2] - t * z[2]); add([o[0] + t * z[0] - r, o[1] + t * z[1] - r, o[2] + t * z[2] - r]); add([o[0] + t * z[0] + r, o[1] + t * z[1] + r, o[2] + t * z[2] + r]); }
      }
    }
  } else if (g.cls === 'extrusion') {
    add(g.path[0]); add(g.path[1]);
    if (curveOk(g.profile)) { const pts = sampleCurve(g.profile, Infinity).pts; let r = 0; for (const p of pts) r = Math.max(r, Math.hypot(p[0], p[1])); add(g.path[0].map((x) => x - r)); add(g.path[1].map((x) => x + r)); }
  }
  return lo[0] <= hi[0] ? [lo, hi] : null;
}

/** The words for a kind of object or surface in the report (ccdm.kind.* / ccdm.surface.*, through the app's language). */
const snake = (k) => k.replace(/[A-Z]/g, (c) => '_' + c.toLowerCase());
export const KIND_WORDS = (k) => msg('ccdm.kind.' + snake(KINDS.has(k) ? k : 'other'));
export const SURFACE_WORDS = (k) => {
  const [cls, why] = String(k).split(':');
  const w = msg('ccdm.surface.' + snake(SURFACE_KINDS.has(cls) ? cls : 'other'));
  return why === 'trims' ? msg('ccdm.surface.trims', { kind: w }) : w;
};
const KINDS = new Set(['textDot', 'text', 'leader', 'dimension', 'hatch', 'light', 'detail', 'curveProxy', 'curveOnSurface', 'surfaceProxy', 'offsetSurface', 'clippingPlane', 'pointGrid', 'morphControl', 'oldBrep', 'instanceDefinition', 'layer', 'material', 'other']);
const SURFACE_KINDS = new Set(['nurbsSurface', 'planeSurface', 'revSurface', 'sumSurface', 'surfaceProxy', 'offsetSurface', 'clippingPlane', 'extrusion']);
