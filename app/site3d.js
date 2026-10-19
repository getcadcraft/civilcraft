/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d.js — the CivilCraft 3D site scene as plain typed arrays. No DOM, no three.js: the 3D view
 * (site-view3d.js) hands these arrays to three.js, the exporters (site3d-export.js) write them as
 * GLB/OBJ, and the Node test checks them.
 *
 *   siteInput(project)                     → the plain input below, gathered from a Project
 *   buildSite3D(input, opts)               → scene
 *   pickSite(scene, cam, sx, sy, {tol})    → { kind: 'point'|'alignment'|'pad'|'feature'|'breakline'|'pipe'|'structure'|'surface', id, name,
 *                                             at:{x,y,z} } | null   (0.4 V5: owned lines within tol px, not behind the ground)
 *   bandLevels(stats, n) / bandColor(t, dark)   the plan's elevation bands (same levels and ramp)
 *
 * input = { units, eg, fg (Surface | null), contours: {eg, fg}, interval, major, breaklines:[{name, pts:[{x,y,z}]}],
 *           alignments:[{id, name, alignment, profile}], corridors:[{id, name, lines:{CL, EOP_L, …}}],
 *           pads:[{id, name, pts, z, daylight}], network, check (analyzeNetwork result), points:[{n,x,y,z,d}] }
 * opts  = { exag (1–10), color: 'bands'|'single'|'map', bandCount, dark, colors: {token: '#rrggbb'}, show: {…SHOW_DEFAULTS},
 *           drape: {minX, minY, maxX, maxY} }   show.gis (0.4 V4): the visible GIS layers (input.gis) as lines, key 'gis-<id>' — 0.4 V3: with color 'map' and a drape box the surfaces are white and carry
 *           `uvs` (Float32, u east, v north over the box: drapeUVs) for the map layers' picture
 *
 * Coordinates: every position is LOCAL — project coordinate minus `scene.origin` (x, y: the existing ground's own
 * local origin, so state-plane eastings/northings in the millions keep their precision in Float32; z: the lowest
 * elevation, rounded down) — and z is multiplied by the vertical exaggeration. scene.origin + scene.exag give the
 * project coordinate back: X = x + origin.x, Y = y + origin.y, Z = z / exag + origin.z. Z is up, in project units.
 *
 * scene = { units, origin:{x,y,z}, exag, bbox:{min,max} (local), notes:[],
 *           meshes:[{ key, name, positions, normals, colors (Float32 rgb), indices (Uint32), uvs?, owners?, triOwner? }],
 *           lines:[{ key, name, color, positions (Float32, segment pairs), owners?:[{kind, id, name}], segOwner? (Uint32 per segment) }],
 *           points: { positions, ids:[point numbers], color } | null, counts,
 *           labels:[{ text, at:[x,y,z] (local), kind, pri, color }] }   (0.5 WL.22, show.labels: drawn facing the camera)
 * Labels (0.5 WL.22): each alignment's name at its start and its station at every major tick, each major contour's
 * elevation once (at its middle vertex), pads, feature lines and structures by name, and — with Show › Points — each
 * survey point's number and elevation (≤ MAX_LABELS in all). `pri` orders them when they crowd (0 first): alignments,
 * structures, pads, feature lines, stations, contours, points. declutterLabels(labels, project, {w, h}) → Uint8Array
 * (1 = draw): on screen, nearest first within a priority, never overlapping one already kept.
 * Pipes are cylinders between their inverts: the invert is the bottom of the inside, the crown = invert + inside
 * diameter (inches on feet projects, millimetres on metre projects, as pipes.js). Structures are vertical
 * cylinders from the rim down to the sump (lowest invert − sump depth).
 */

import { rayTri } from './vec.js';
import { DIA_UNIT } from './pipes.js';
import { surfaceSection } from './sections.js';   // 0.4 V4: GIS lines draped on the ground (exact at triangle edges)
import { t } from './i18n.js';
import { formatStation, fixed } from './units.js';   // 0.5 WL.22 labels
import { flatten as flattenFeature } from './featureline.js';   // 0.6 WL.24: feature lines with arcs
import { structGeom } from './structs.js';   // 0.6 WL.27: structure types (outside size, rectangles)

export const SHOW_DEFAULTS = {
  eg: true, fg: true, triangles: false, contours: true, breaklines: true, boundary: true,
  alignments: true, corridors: true, pads: true, pipes: true, points: false, gis: true,   // gis: 0.4 V4
  labels: true,   // 0.5 WL.22
};
export const MAX_LABELS = 6000;
export const LABEL_PRI = { alignment: 0, structure: 1, pad: 2, feature: 3, station: 4, contour: 5, point: 6 };
export const MAX_GIS_SEGMENTS = 300000;
export const EXAGGERATIONS = [1, 2, 3, 5, 10];

/** Paper defaults for every colour token the scene uses (the view passes the page's own). */
export const DEFAULT_COLORS = {
  surface: '#c9c1aa', graded: '#b9c4cf', tin: '#7a8796', major: '#17202b', minor: '#8c96a2', breakline: '#a84a00', edge: '#34404e',
  alignment: '#b3122e', corridor: '#8a6200', pad: '#1e48c8', daylight: '#9a1f86', pipe: '#1e48c8', structure: '#1e48c8', problem: '#b3122e', point: '#17703a',
  // 0.4 V4: GIS layer colours by their token (gis-state.js LAYER_TOKENS)
  'gis:blue': '#1e48c8', 'gis:orange': '#a84a00', 'gis:magenta': '#9a1f86', 'gis:cyan': '#00707e', 'gis:ochre': '#8a6200', 'gis:green': '#17703a', 'gis:red': '#b3122e',
};

// ---------------------------------------------------------------------------- input

export function siteInput(project) {
  const s = project.state, d = s.display;
  const eg = project.eg().surface || null;
  const g = project.graded();
  const fg = g.surface || null;
  const items = g.items || [];
  return {
    units: s.units,
    eg, fg,
    contours: { eg: eg ? project.contours(eg, 'eg') : [], fg: fg ? project.contours(fg, 'fg') : [] },
    interval: Number(d.interval) || 1, major: Number(d.major) || 5, bandCount: Number(d.bandCount) || 8,
    // 0.4 V5: each breakline knows what it is (picking in 3D): a drawn one (its index), a point group's, or a feature line's
    breaklines: project.egBreaklines().filter((b) => !b.feature).map((b) => ({ ...b, owner: b.fromGroup ? { kind: 'breakline', id: 'group:' + b.name, name: b.name } : { kind: 'breakline', id: 'drawn:' + s.surface.breaklines.indexOf(b), name: b.name } })),
    features: (s.features || []).map((f) => ({ id: f.id, name: f.name, pts: flattenFeature(f) })),   // 0.4 V5; 0.6 WL.24: arcs in pieces
    alignments: s.alignments.map((a) => ({ id: a.id, name: a.name, alignment: project.alignment(a), profile: project.designProfile(a) })),
    corridors: items.filter((x) => x.kind === 'corridor' && x.lines).map((x) => ({ id: x.id, name: x.name, lines: x.lines })),
    pads: s.pads.map((p) => ({ id: p.id, name: p.name, pts: p.pts, z: Number(p.z), daylight: items.find((x) => x.id === p.id)?.daylight || [] })),
    network: s.network, check: s.network ? project.networkCheck() : null,
    points: project.points,
    // 0.4 V4: the visible GIS layers with their features (gis-layers.js)
    gis: (s.gis?.layers || []).filter((l) => l.visible).map((l) => ({ id: l.id, name: l.name, color: l.color, features: project.gisFeatures?.get(l.id) || [] })),
  };
}

// ---------------------------------------------------------------------------- colours

export function bandLevels(stats, n) {
  const levels = [];
  for (let i = 1; i < n; i++) levels.push(stats.minZ + ((stats.maxZ - stats.minZ) * i) / n);
  return levels;
}
/** The plan's band ramp (civilcraft.js): low blue-green → high ochre-brown, lightness readable on the theme. */
export function bandColor(t, dark) {
  const h = 190 - 160 * t, s = 45, l = dark ? 30 + 10 * t : 82 - 22 * t;
  return hslHex(h, s, l);
}
function hslHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
  const f = (n) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
  return '#' + [f(0), f(8), f(4)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
export function rgb(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(hex).trim());
  if (!m) {
    const r = /rgba?\(\s*([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i.exec(String(hex));
    return r ? [r[1] / 255, r[2] / 255, r[3] / 255] : [0.5, 0.5, 0.5];
  }
  const v = parseInt(m[1], 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

// ---------------------------------------------------------------------------- building

export function buildSite3D(input, opts = {}) {
  const show = { ...SHOW_DEFAULTS, ...(opts.show || {}) };
  const exag = Math.min(10, Math.max(1, Number(opts.exag) || 1));
  const C = { ...DEFAULT_COLORS, ...(opts.colors || {}) };
  const units = input.units === 'm' ? 'm' : 'ft';
  const notes = [];
  const origin = siteOrigin(input);
  const L = (x, y, z) => [x - origin.x, y - origin.y, (z - origin.z) * exag];
  const scene = { units, origin, exag, meshes: [], lines: [], points: null, notes, labels: [], counts: { triangles: 0, segments: 0, points: 0, pipes: 0, structures: 0 } };
  // 0.5 WL.22: labels that face the camera (the view draws them); `at` is local like every position
  const label = (kind, text, x, y, z, color) => { if (show.labels && scene.labels.length < MAX_LABELS && Number.isFinite(z)) scene.labels.push({ text: String(text), at: L(x, y, z), kind, pri: LABEL_PRI[kind], color }); };

  // surfaces
  const surfs = [];
  if (show.eg && input.eg) surfs.push({ key: 'eg', name: t('surface.eg'), s: input.eg, color: C.surface });
  if (show.fg && input.fg) surfs.push({ key: 'fg', name: t('surface.fg'), s: input.fg, color: C.graded });
  for (const it of surfs) {
    const st = it.s.stats();
    const n = Math.max(2, Math.min(64, Number(opts.bandCount ?? input.bandCount) || 8));
    const map = opts.color === 'map' && opts.drape;   // 0.4 V3: map layers draped on the surface (white, so the picture shows true)
    const bands = opts.color !== 'single' && !map ? { levels: bandLevels(st, n), colors: Array.from({ length: n }, (_, i) => rgb(bandColor(i / Math.max(1, n - 1), !!opts.dark))) } : null;
    const m = surfaceMesh(it.s, origin, exag, bands, map ? [1, 1, 1] : rgb(it.color));
    if (map) m.uvs = drapeUVs(m.positions, origin, opts.drape);
    scene.meshes.push({ key: it.key, name: it.name, ...m });
    scene.counts.triangles += m.indices.length / 3;
    if (show.triangles) scene.lines.push({ key: it.key + '-tin', name: it.name + ' triangles', color: C.tin, positions: surfaceEdges(it.s, origin, exag, false) });
    if (show.boundary) scene.lines.push({ key: it.key + '-edge', name: it.name + ' edge', color: C.edge, positions: surfaceEdges(it.s, origin, exag, true) });
    if (show.contours) {
      const list = input.contours?.[it.key] || [];
      const step = (Number(input.interval) || 1) * (Number(input.major) || 5);
      const isMaj = (z) => step > 0 && Math.abs(z / step - Math.round(z / step)) < 1e-6;
      const maj = [], min = [];
      for (const c of list) {
        polySegs(isMaj(c.z) ? maj : min, c.pts.map((p) => L(p.x, p.y, c.z)), c.closed);
        if (isMaj(c.z) && c.pts.length >= 4) { const m = c.pts[Math.floor(c.pts.length / 2)]; label('contour', fixed(c.z, step < 1 ? 1 : 0).replace(/,/g, ''), m.x, m.y, c.z, C.major); }
      }
      if (min.length) scene.lines.push({ key: it.key + '-minor', name: t('s3.contours.minor', { surface: it.name }), color: C.minor, positions: new Float32Array(min) });
      if (maj.length) scene.lines.push({ key: it.key + '-major', name: t('s3.contours.major', { surface: it.name }), color: C.major, positions: new Float32Array(maj) });
    }
  }

  // 0.4 V5: line sets carry owners — `owners` [{kind, id, name}] and `segOwner` (Uint32, one per segment) — so a click can
  // pick an alignment, a pad, a feature line or a breakline, and the view can highlight what is selected
  const owned = () => { const seg = [], owners = [], so = []; return { seg, add(owner, fn) { const n0 = seg.length; fn(seg); const k = owners.push(owner) - 1; for (let i = n0; i < seg.length; i += 6) so.push(k); }, done(extra) { return { ...extra, positions: new Float32Array(seg), owners, segOwner: new Uint32Array(so) }; } }; };

  // breaklines (they shape the existing ground)
  if (show.breaklines && input.breaklines?.length) {
    const o = owned();
    for (const b of input.breaklines) o.add(b.owner || { kind: 'breakline', id: b.name, name: b.name }, (seg) => polySegs(seg, b.pts.filter((p) => Number.isFinite(p.z)).map((p) => L(p.x, p.y, p.z)), false));
    if (o.seg.length) scene.lines.push(o.done({ key: 'breaklines', name: t('scene.layer.brkl'), color: C.breakline }));
  }
  // feature lines (0.4 V14/V5), shown with the breaklines
  if (show.breaklines && input.features?.length) {
    const o = owned();
    for (const f of input.features) {
      o.add({ kind: 'feature', id: f.id, name: f.name }, (seg) => polySegs(seg, f.pts.filter((p) => Number.isFinite(p.z)).map((p) => L(p.x, p.y, p.z)), false));
      const m = f.pts[Math.floor((f.pts.length - 1) / 2)];
      if (m) label('feature', f.name, m.x, m.y, m.z, C['gis:green']);
    }
    if (o.seg.length) scene.lines.push(o.done({ key: 'features', name: t('scene.layer.feat'), color: C['gis:green'] }));
  }

  // alignments at the design profile (or on the existing ground where there is none), with station ticks
  if (show.alignments) {
    const o = owned(), tick = [];
    for (const a of input.alignments || []) {
      const al = a.alignment;
      if (!al?.ok) continue;
      const zAt = (sta, x, y) => {
        const z = a.profile?.ok ? a.profile.elevationAt(sta) : null;
        return z ?? input.eg?.elevationAt(x, y, 1e-6) ?? null;
      };
      o.add({ kind: 'alignment', id: a.id, name: a.name }, (seg) => {
      const stas = new Set(al.polyline(Math.max(al.length / 400, 0.5)).map((p) => p.sta));
      const step = Math.max(al.length / 400, 0.5);
      for (let s = al.start; s < al.end; s += step) stas.add(s);
      stas.add(al.end);
      if (a.profile?.ok) for (const c of a.profile.curves || []) for (let k = 0; k <= 16; k++) { const s = c.bvc + (c.L * k) / 16; if (s >= al.start && s <= al.end) stas.add(s); }
      let run = [];
      for (const sta of [...stas].sort((p, q) => p - q)) {
        const p = al.pointAt(sta), z = p ? zAt(sta, p.x, p.y) : null;
        if (z === null) { polySegs(seg, run, false); run = []; continue; }
        run.push(L(p.x, p.y, z));
      }
      polySegs(seg, run, false);
      });
      const p0 = al.pointAt(al.start);
      if (p0) label('alignment', a.name, p0.x, p0.y, zAt(al.start, p0.x, p0.y), C.alignment);
      const minor = units === 'm' ? 20 : 50, major = 100;
      for (const t of al.ticks(minor)) {
        const z = zAt(t.sta, t.x, t.y);
        if (z === null) continue;
        const isMaj = Math.abs(t.sta / major - Math.round(t.sta / major)) < 1e-9;
        const k = (units === 'm' ? 1.5 : 5) * (isMaj ? 1.6 : 1);
        const nx = Math.sin(t.dir), ny = -Math.cos(t.dir);
        tick.push(...L(t.x - nx * k, t.y - ny * k, z), ...L(t.x + nx * k, t.y + ny * k, z));
        if (isMaj) label('station', formatStation(t.sta, units, 0), t.x, t.y, z, C.alignment);
      }
    }
    if (o.seg.length) scene.lines.push(o.done({ key: 'alignments', name: t('s3.alignments'), color: C.alignment }));
    if (tick.length) scene.lines.push({ key: 'stations', name: t('s3.stations'), color: C.alignment, positions: new Float32Array(tick) });
  }

  // corridor feature lines
  if (show.corridors) {
    const seg = [];
    for (const c of input.corridors || []) for (const [name, pts] of Object.entries(c.lines || {})) {
      if (name === 'CL') continue;   // the alignment is drawn on the profile already
      polySegs(seg, (pts || []).filter((p) => Number.isFinite(p.z)).map((p) => L(p.x, p.y, p.z)), false);
    }
    if (seg.length) scene.lines.push({ key: 'corridors', name: t('s3.corridors'), color: C.corridor, positions: new Float32Array(seg) });
  }

  // pads and their daylight lines
  if (show.pads) {
    const pad = owned(), day = owned();
    for (const p of input.pads || []) {
      if (!Number.isFinite(p.z) || (p.pts || []).length < 3) continue;
      const ow = { kind: 'pad', id: p.id, name: p.name };
      pad.add(ow, (seg) => polySegs(seg, p.pts.map((q) => L(q.x, q.y, p.z)), true));
      label('pad', p.name, p.pts.reduce((a, q) => a + q.x, 0) / p.pts.length, p.pts.reduce((a, q) => a + q.y, 0) / p.pts.length, p.z, C.pad);
      day.add(ow, (seg) => polySegs(seg, (p.daylight || []).filter((q) => Number.isFinite(q.z)).map((q) => L(q.x, q.y, q.z)), true));
    }
    if (pad.seg.length) scene.lines.push(pad.done({ key: 'pads', name: t('scene.layer.pads'), color: C.pad }));
    if (day.seg.length) scene.lines.push(day.done({ key: 'daylight', name: t('scene.layer.dayl'), color: C.daylight }));
  }

  // pipe network
  if (show.pipes && input.network) {
    const net = input.network, chk = input.check;
    const per = DIA_UNIT[units].perUnit;
    const bad = new Set((chk?.problems || []).map((p) => p.id).filter(Boolean));
    const byId = new Map(net.structures.map((s) => [s.id, s]));
    const pipeB = meshBuilder(), strB = meshBuilder();
    let noInv = 0, noRim = 0;
    for (const p of net.pipes) {
      const a = byId.get(p.from), b = byId.get(p.to);
      if (!a || !b) continue;
      if (!Number.isFinite(p.invUp) || !Number.isFinite(p.invDn)) { noInv++; continue; }
      const D = (Number(p.dia) || 0) / per;
      if (!(D > 0)) continue;
      const r = D / 2;
      pipeB.owner({ kind: 'pipe', id: p.id, name: p.name });
      cylinder(pipeB, [a.x, a.y, p.invUp + r], [b.x, b.y, p.invDn + r], r, 16, false, L, exag, rgb(bad.has(p.id) ? C.problem : C.pipe));
      scene.counts.pipes++;
    }
    for (const s of net.structures) {
      const info = chk?.structs?.get(s.id);
      const rim = info?.rim ?? (Number.isFinite(s.rim) ? s.rim : null);
      if (!Number.isFinite(rim)) { noRim++; continue; }
      let bottom = info?.sump;
      if (!Number.isFinite(bottom)) bottom = rim - (units === 'm' ? 1.5 : 5);
      const g = structGeom(s, net, units);   // 0.6 WL.27: a type gives the outside size; a rectangular one is a box
      const r = g.type ? g.outW / 2 : (Number(s.dia) || 0) / per / 2;
      if (!(r > 0) || bottom >= rim) continue;
      strB.owner({ kind: 'structure', id: s.id, name: s.name });
      label('structure', s.name, s.x, s.y, rim, C.structure);
      if (g.type && g.shape === 'rect') {
        const out = net.pipes.find((p) => p.from === s.id), to = out && byId.get(out.to), ang = to ? Math.atan2(to.y - s.y, to.x - s.x) : 0;
        box(strB, s.x, s.y, ang, g.outL / 2, g.outW / 2, bottom, rim, L, exag, rgb(bad.has(s.id) ? C.problem : C.structure));
      } else cylinder(strB, [s.x, s.y, bottom], [s.x, s.y, rim], r, 24, true, L, exag, rgb(bad.has(s.id) ? C.problem : C.structure));
      scene.counts.structures++;
    }
    if (noInv) notes.push(t('s3.noinv', { n: noInv }));
    if (noRim) notes.push(t('s3.norim', { n: noRim }));
    if (pipeB.count()) scene.meshes.push({ key: 'pipes', name: t('scene.layer.pipe'), ...pipeB.done() });
    if (strB.count()) scene.meshes.push({ key: 'structures', name: t('scene.layer.strc'), ...strB.done() });
  }

  // 0.4 V4: GIS layers — lines and outlines at their own z when every vertex has one, else draped on the existing ground
  // (exact: a vertex wherever a segment crosses a triangle edge); points as small crosses
  if (show.gis && input.gis?.length) {
    let budget = MAX_GIS_SEGMENTS, cut = false, flatOff = 0;
    const eg = input.eg;
    const sb = eg ? eg.bounds : null, cross = sb ? Math.max(sb.maxX - sb.minX, sb.maxY - sb.minY) / 300 : 1;
    for (const l of input.gis) {
      const seg = [];
      const add = (a, b) => { if (budget <= 0) { cut = true; return; } budget--; seg.push(...L(a[0], a[1], a[2]), ...L(b[0], b[1], b[2])); };
      const part = (pts) => {
        if (pts.length < 2 || cut) return;
        if (pts.every((q) => q.length > 2 && Number.isFinite(q[2]))) { for (let i = 1; i < pts.length; i++) add(pts[i - 1], pts[i]); return; }
        if (!eg) { flatOff++; return; }
        for (let i = 1; i < pts.length && !cut; i++) {
          const a = { x: pts[i - 1][0], y: pts[i - 1][1] }, b = { x: pts[i][0], y: pts[i][1] }, len = Math.hypot(b.x - a.x, b.y - a.y);
          for (const run of surfaceSection(eg, a, b, 0, len)) for (let k = 1; k < run.length; k++) {
            const p0 = run[k - 1], p1 = run[k], f0 = len ? p0.o / len : 0, f1 = len ? p1.o / len : 0;
            add([a.x + (b.x - a.x) * f0, a.y + (b.y - a.y) * f0, p0.z], [a.x + (b.x - a.x) * f1, a.y + (b.y - a.y) * f1, p1.z]);
          }
        }
      };
      for (const f of l.features) {
        const g = f?.g;
        if (!g) continue;
        if (g.t === 'ln') for (const q of g.c) part(q);
        else if (g.t === 'pg') for (const poly of g.c) for (const r of poly) part(r);
        else if (g.t === 'pt') {
          const [x, y] = g.c, z = g.c.length > 2 && Number.isFinite(g.c[2]) ? g.c[2] : eg?.elevationAt(x, y, 1e-6);
          if (z === null || z === undefined) { flatOff++; continue; }
          add([x - cross, y, z], [x + cross, y, z]); add([x, y - cross, z], [x, y + cross, z]);
        }
        if (cut) break;
      }
      if (seg.length) scene.lines.push({ key: 'gis-' + l.id, name: l.name, color: C['gis:' + l.color] || C['gis:blue'], positions: new Float32Array(seg) });
      if (cut) break;
    }
    if (cut) notes.push(t('v3d.gis.cut', { n: MAX_GIS_SEGMENTS.toLocaleString('en-US') }));
    if (flatOff) notes.push(t('v3d.gis.off', { n: flatOff }));
  }

  // survey points
  if (show.points && input.points?.length) {
    const pos = [], ids = [];
    for (const p of input.points) {
      if (p.z === null || !Number.isFinite(p.z)) continue;
      pos.push(...L(p.x, p.y, p.z)); ids.push(p.n);
      label('point', t('s3.label.point', { n: p.n, z: fixed(p.z, 2).replace(/,/g, '') }), p.x, p.y, p.z, C.point);
    }
    if (ids.length) scene.points = { positions: new Float32Array(pos), ids, color: C.point };
    scene.counts.points = ids.length;
  }

  for (const l of scene.lines) scene.counts.segments += l.positions.length / 6;
  if (show.labels && scene.labels.length >= MAX_LABELS) notes.push(t('s3.labels.cut', { n: MAX_LABELS.toLocaleString('en-US') }));
  scene.bbox = bboxOf(scene);
  return scene;
}

/**
 * Which labels to draw for this view (0.5 WL.22): each label's box on screen (`w` px wide when the view measured it, else
 * estimated; `h` px tall, standing on its point) — off screen or behind the eye: not drawn; then by priority and, within
 * one, nearest first, a label is drawn only when its box overlaps none already drawn. `project(at)` → [x, y, depth] | null.
 */
export function declutterLabels(labels, project, { w, h, hPx = 16, charPx = 7, gap = 2 } = {}) {
  const vis = new Uint8Array(labels.length), cand = [];
  labels.forEach((l, i) => {
    const s = project(l.at);
    if (!s || s[0] < -50 || s[0] > w + 50 || s[1] < -20 || s[1] > h + 20) return;
    const lw = l.w || l.text.length * charPx + 8;
    cand.push({ i, x0: s[0] - lw / 2 - gap, x1: s[0] + lw / 2 + gap, y0: s[1] - 6 - hPx - gap, y1: s[1] - 6 + gap, d: s[2], pri: l.pri ?? 9 });
  });
  cand.sort((a, b) => a.pri - b.pri || a.d - b.d);
  const cell = 64, grid = new Map(), key = (cx, cy) => cx + ',' + cy;
  for (const c of cand) {
    const cx0 = Math.floor(c.x0 / cell), cx1 = Math.floor(c.x1 / cell), cy0 = Math.floor(c.y0 / cell), cy1 = Math.floor(c.y1 / cell);
    let hit = false;
    for (let cx = cx0; cx <= cx1 && !hit; cx++) for (let cy = cy0; cy <= cy1 && !hit; cy++) for (const o of grid.get(key(cx, cy)) || []) if (o.x0 < c.x1 && c.x0 < o.x1 && o.y0 < c.y1 && c.y0 < o.y1) { hit = true; break; }
    if (hit) continue;
    vis[c.i] = 1;
    for (let cx = cx0; cx <= cx1; cx++) for (let cy = cy0; cy <= cy1; cy++) { const k = key(cx, cy); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(c); }
  }
  return vis;
}

/** x, y: the existing ground's local origin (else the first thing with coordinates); z: its lowest elevation, rounded down. */
export function siteOrigin(input) {
  const s = input.eg || input.fg;
  if (s) { const st = s.stats(); return { x: s.ox, y: s.oy, z: Math.floor(Math.min(st.minZ, input.fg && input.eg ? input.fg.stats().minZ : Infinity)) }; }
  const first = input.points?.find((p) => Number.isFinite(p.x)) || input.network?.structures?.[0] || input.alignments?.[0]?.alignment?.pis?.[0];
  let z = Infinity;
  for (const p of input.points || []) if (Number.isFinite(p.z) && p.z < z) z = p.z;
  return { x: first ? Math.floor(first.x) : 0, y: first ? Math.floor(first.y) : 0, z: Number.isFinite(z) ? Math.floor(z) : 0 };
}

function polySegs(out, pts, closed) {
  for (let i = 0; i + 1 < pts.length; i++) out.push(...pts[i], ...pts[i + 1]);
  if (closed && pts.length > 2) out.push(...pts[pts.length - 1], ...pts[0]);
}

function bboxOf(scene) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const add = (a) => { for (let i = 0; i < a.length; i += 3) for (let k = 0; k < 3; k++) { const v = a[i + k]; if (v < min[k]) min[k] = v; if (v > max[k]) max[k] = v; } };
  for (const m of scene.meshes) add(m.positions);
  for (const l of scene.lines) add(l.positions);
  if (scene.points) add(scene.points.positions);
  if (min[0] === Infinity) return null;
  return { min, max };
}

// ---------------------------------------------------------------------------- surfaces

/**
 * One indexed mesh for a TIN surface: smooth vertex normals (in exaggerated space). With bands, each triangle is cut
 * at the band levels (true elevations) into pieces of one colour, so the band edges are sharp and exactly at the levels.
 */
/** 0.4 V3: texture coordinates for a drape over the box { minX, minY, maxX, maxY } (project coordinates): u east, v north. */
export function drapeUVs(positions, O, box) {
  const w = Math.max(box.maxX - box.minX, 1e-9), h = Math.max(box.maxY - box.minY, 1e-9), out = new Float32Array((positions.length / 3) * 2);
  for (let i = 0, j = 0; i < positions.length; i += 3, j += 2) { out[j] = (positions[i] + O.x - box.minX) / w; out[j + 1] = (positions[i + 1] + O.y - box.minY) / h; }
  return out;
}

export function surfaceMesh(s, O, exag, bands, single) {
  const { X, Y, Z, tris } = s;
  const nV = X.length;
  const dx = s.ox - O.x, dy = s.oy - O.y;
  // smooth normals: area-weighted face normals, faces turned to face up
  const N = new Float64Array(nV * 3);
  for (let t = 0; t < tris.length; t += 3) {
    const a = tris[t], b = tris[t + 1], c = tris[t + 2];
    const ux = X[b] - X[a], uy = Y[b] - Y[a], uz = (Z[b] - Z[a]) * exag, vx = X[c] - X[a], vy = Y[c] - Y[a], vz = (Z[c] - Z[a]) * exag;
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
    for (const v of [a, b, c]) { N[3 * v] += nx; N[3 * v + 1] += ny; N[3 * v + 2] += nz; }
  }
  for (let v = 0; v < nV; v++) { const l = Math.hypot(N[3 * v], N[3 * v + 1], N[3 * v + 2]) || 1; N[3 * v] /= l; N[3 * v + 1] /= l; N[3 * v + 2] /= l; if (l === 1 && !N[3 * v + 2]) N[3 * v + 2] = 1; }
  const pos = [], nor = [], col = [], idx = [];
  const upCCW = (i0, i1, i2) => { const ux = pos[3 * i1] - pos[3 * i0], uy = pos[3 * i1 + 1] - pos[3 * i0 + 1], vx = pos[3 * i2] - pos[3 * i0], vy = pos[3 * i2 + 1] - pos[3 * i0 + 1]; return ux * vy - uy * vx >= 0; };
  const tri = (i0, i1, i2) => { if (upCCW(i0, i1, i2)) idx.push(i0, i1, i2); else idx.push(i0, i2, i1); };
  const push = (x, y, z, nx, ny, nz, c) => { pos.push(x + dx, y + dy, (z - O.z) * exag); nor.push(nx, ny, nz); col.push(c[0], c[1], c[2]); return pos.length / 3 - 1; };
  if (!bands) {
    const map = new Int32Array(nV).fill(-1);
    for (let t = 0; t < tris.length; t += 3) {
      const ids = [0, 1, 2].map((k) => { const v = tris[t + k]; if (map[v] < 0) map[v] = push(X[v], Y[v], Z[v], N[3 * v], N[3 * v + 1], N[3 * v + 2], single); return map[v]; });
      tri(ids[0], ids[1], ids[2]);
    }
  } else {
    const { levels, colors } = bands;
    const band = (z) => { let b = 0; while (b < levels.length && z > levels[b]) b++; return b; };
    const shared = new Map();
    for (let t = 0; t < tris.length; t += 3) {
      const vs = [tris[t], tris[t + 1], tris[t + 2]];
      const bs = vs.map((v) => band(Z[v]));
      const lo = Math.min(...bs), hi = Math.max(...bs);
      if (lo === hi) {
        const ids = vs.map((v) => { const k = v * 128 + lo; let i = shared.get(k); if (i === undefined) { i = push(X[v], Y[v], Z[v], N[3 * v], N[3 * v + 1], N[3 * v + 2], colors[lo]); shared.set(k, i); } return i; });
        tri(ids[0], ids[1], ids[2]);
        continue;
      }
      const poly0 = vs.map((v) => [X[v], Y[v], Z[v], N[3 * v], N[3 * v + 1], N[3 * v + 2]]);
      for (let b = lo; b <= hi; b++) {
        let poly = poly0;
        if (b > 0) poly = clipZ(poly, levels[b - 1], 1);
        if (b < levels.length) poly = clipZ(poly, levels[b], -1);
        if (poly.length < 3) continue;
        const ids = poly.map((q) => { const l = Math.hypot(q[3], q[4], q[5]) || 1; return push(q[0], q[1], q[2], q[3] / l, q[4] / l, q[5] / l, colors[b]); });
        for (let k = 1; k + 1 < ids.length; k++) tri(ids[0], ids[k], ids[k + 1]);
      }
    }
  }
  return { positions: new Float32Array(pos), normals: new Float32Array(nor), colors: new Float32Array(col), indices: new Uint32Array(idx) };
}

/** Keep the part of a polygon with z ≥ level (side 1) or z ≤ level (side −1); every attribute interpolated. */
function clipZ(poly, level, side) {
  const out = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i], b = poly[(i + 1) % poly.length];
    const da = (a[2] - level) * side, db = (b[2] - level) * side;
    if (da >= 0) out.push(a);
    if ((da > 0 && db < 0) || (da < 0 && db > 0)) {
      const t = da / (da - db);
      const p = a.map((v, k) => v + (b[k] - v) * t);
      p[2] = level;
      out.push(p);
    }
  }
  return out;
}

/** Triangle edges (all) or the surface's outer edge (edges with one triangle), as segment pairs. */
function surfaceEdges(s, O, exag, outerOnly) {
  const { X, Y, Z, tris } = s, dx = s.ox - O.x, dy = s.oy - O.y;
  const out = [];
  const seg = (a, b) => out.push(X[a] + dx, Y[a] + dy, (Z[a] - O.z) * exag, X[b] + dx, Y[b] + dy, (Z[b] - O.z) * exag);
  if (!outerOnly) {
    const e = s.edges();
    for (let i = 0; i < e.length; i += 2) seg(e[i], e[i + 1]);
  } else {
    const dir = new Set();
    const key = (a, b) => a * 4294967296 + b;
    for (let t = 0; t < tris.length; t += 3) for (let k = 0; k < 3; k++) dir.add(key(tris[t + k], tris[t + (k + 1) % 3]));
    for (let t = 0; t < tris.length; t += 3) for (let k = 0; k < 3; k++) {
      const a = tris[t + k], b = tris[t + (k + 1) % 3];
      if (!dir.has(key(b, a))) seg(a, b);
    }
  }
  return new Float32Array(out);
}

// ---------------------------------------------------------------------------- pipes and structures

function meshBuilder() {
  const pos = [], nor = [], col = [], idx = [], triOwner = [], owners = [];
  return {
    pos, nor, col, idx,
    owner(o) { owners.push(o); },
    tri(a, b, c) { idx.push(a, b, c); triOwner.push(owners.length - 1); },
    vert(p, n, c) { pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]); col.push(c[0], c[1], c[2]); return pos.length / 3 - 1; },
    count() { return owners.length; },
    done() { return { positions: new Float32Array(pos), normals: new Float32Array(nor), colors: new Float32Array(col), indices: new Uint32Array(idx), owners, triOwner: new Uint32Array(triOwner) }; },
  };
}

/** 0.6 WL.27: an upright box centred on (x, y), turned by ang, half sizes hl (along) × hw (across), from z0 to z1. */
function box(B, x, y, ang, hl, hw, z0, z1, L, exag, color) {
  const c = Math.cos(ang), s = Math.sin(ang);
  const P = (a, b, z) => L(x + a * c - b * s, y + a * s + b * c, z);
  const nrm = (n) => { const m = [n[0], n[1], n[2] / exag], l = Math.hypot(...m) || 1; return m.map((v) => v / l); };
  const corners = [[-hl, -hw], [hl, -hw], [hl, hw], [-hl, hw]];
  for (let k = 0; k < 4; k++) {
    const [a0, b0] = corners[k], [a1, b1] = corners[(k + 1) % 4];
    const ex = a1 - a0, ey = b1 - b0, el = Math.hypot(ex, ey), nx = ey / el, ny = -ex / el;   // outward (corners run anticlockwise)
    const n = nrm([nx * c - ny * s, nx * s + ny * c, 0]);
    const v = [P(a0, b0, z0), P(a1, b1, z0), P(a1, b1, z1), P(a0, b0, z1)].map((p) => B.vert(p, n, color));
    B.tri(v[0], v[1], v[2]); B.tri(v[0], v[2], v[3]);
  }
  for (const [z, up] of [[z0, false], [z1, true]]) {
    const n = nrm([0, 0, up ? 1 : -1]), v = corners.map(([a, b]) => B.vert(P(a, b, z), n, color));
    if (up) { B.tri(v[0], v[1], v[2]); B.tri(v[0], v[2], v[3]); } else { B.tri(v[0], v[2], v[1]); B.tri(v[0], v[3], v[2]); }
  }
}

/** A cylinder of radius r around the segment a → b (project coordinates, true scale), then mapped by L (local + exaggeration). */
function cylinder(B, a, b, r, sides, caps, L, exag, color) {
  const ax = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...ax);
  if (len <= 0) return;
  const w = ax.map((v) => v / len);
  let u = Math.abs(w[2]) < 0.9 ? [-w[1], w[0], 0] : [1, 0, 0];
  const ul = Math.hypot(...u); u = u.map((v) => v / ul);
  const v = [w[1] * u[2] - w[2] * u[1], w[2] * u[0] - w[0] * u[2], w[0] * u[1] - w[1] * u[0]];
  // normals through the exaggeration: n' ∝ (nx, ny, nz / exag)
  const nrm = (n) => { const m = [n[0], n[1], n[2] / exag], l = Math.hypot(...m) || 1; return m.map((x) => x / l); };
  const ring = [];
  for (let k = 0; k < sides; k++) {
    const t = (2 * Math.PI * k) / sides, c = Math.cos(t), s = Math.sin(t);
    const n = [u[0] * c + v[0] * s, u[1] * c + v[1] * s, u[2] * c + v[2] * s];
    const p0 = L(a[0] + n[0] * r, a[1] + n[1] * r, a[2] + n[2] * r), p1 = L(b[0] + n[0] * r, b[1] + n[1] * r, b[2] + n[2] * r);
    const nn = nrm(n);
    ring.push([B.vert(p0, nn, color), B.vert(p1, nn, color)]);
  }
  for (let k = 0; k < sides; k++) {
    const [a0, a1] = ring[k], [b0, b1] = ring[(k + 1) % sides];
    B.tri(a0, b0, b1); B.tri(a0, b1, a1);
  }
  if (caps) {
    for (const [end, sgn, j] of [[a, -1, 0], [b, 1, 1]]) {
      const n = nrm(w.map((x) => x * sgn));
      const c = B.vert(L(end[0], end[1], end[2]), n, color);
      const rim = ring.map((q) => { const i = q[j]; return B.vert([B.pos[3 * i], B.pos[3 * i + 1], B.pos[3 * i + 2]], n, color); });
      for (let k = 0; k < sides; k++) { if (sgn > 0) B.tri(c, rim[k], rim[(k + 1) % sides]); else B.tri(c, rim[(k + 1) % sides], rim[k]); }
    }
  }
}

// ---------------------------------------------------------------------------- picking

/**
 * What is under a screen pixel. `cam` is camera.js's Camera looking at the scene's local (exaggerated) space.
 * Survey points within `tol` pixels win when they are not behind a pipe or structure that was hit; then pipes and
 * structures (ray against their triangles, found even under the ground); then the surfaces (the elevation read there).
 */
/** The nearest hit of a ray on the surfaces (meshes without owners), as a ray parameter, or null. */
function surfaceHit(scene, o, d) {
  let t = null;
  for (const m of scene.meshes) {
    if (m.owners) continue;
    const P = m.positions, I = m.indices;
    for (let k = 0; k < I.length; k += 3) {
      const h = rayTri(o, d, [P[3 * I[k]], P[3 * I[k] + 1], P[3 * I[k] + 2]], [P[3 * I[k + 1]], P[3 * I[k + 1] + 1], P[3 * I[k + 1] + 2]], [P[3 * I[k + 2]], P[3 * I[k + 2] + 1], P[3 * I[k + 2] + 2]]);
      if (h !== null && (t === null || h < t)) t = h;
    }
  }
  return t;
}

export function pickSite(scene, cam, sx, sy, { tol = 8 } = {}) {
  if (!scene) return null;
  const { o, d } = cam.ray(sx, sy);
  const toProject = (p) => ({ x: p[0] + scene.origin.x, y: p[1] + scene.origin.y, z: p[2] / scene.exag + scene.origin.z });
  // pipes and structures are mostly buried: they are found through the ground, so they are tested first and win
  let best = null;
  const meshes = [...scene.meshes].sort((a, b) => (b.owners ? 1 : 0) - (a.owners ? 1 : 0));
  for (const m of meshes) {
    if (best?.m.owners && !m.owners) break;
    const P = m.positions, I = m.indices;
    for (let t = 0; t < I.length; t += 3) {
      const a = [P[3 * I[t]], P[3 * I[t] + 1], P[3 * I[t] + 2]], b = [P[3 * I[t + 1]], P[3 * I[t + 1] + 1], P[3 * I[t + 1] + 2]], c = [P[3 * I[t + 2]], P[3 * I[t + 2] + 1], P[3 * I[t + 2] + 2]];
      const hit = rayTri(o, d, a, b, c);
      if (hit !== null && (!best || hit < best.t)) best = { t: hit, m, tri: t / 3 };
    }
  }
  if (scene.points) {
    const P = scene.points.positions, vp = cam.viewProj();
    let pb = null;
    for (let i = 0; i < P.length; i += 3) {
      const p = [P[i], P[i + 1], P[i + 2]], s = cam.project(p, vp);
      if (!s) continue;
      const dd = Math.hypot(s[0] - sx, s[1] - sy);
      if (dd <= tol && (!pb || dd < pb.dd)) pb = { dd, i: i / 3, p };
    }
    if (pb) {
      const along = (pb.p[0] - o[0]) * d[0] + (pb.p[1] - o[1]) * d[1] + (pb.p[2] - o[2]) * d[2];
      const solid = best && best.m.owners;
      if (!solid || along <= best.t * 1.001) return { kind: 'point', id: scene.points.ids[pb.i], name: t('s3.point', { n: scene.points.ids[pb.i] }), at: toProject(pb.p) };
    }
  }
  // 0.4 V5: an owned line within tol px, unless the ground is in front of it
  {
    const vp = cam.viewProj();
    let lb = null;
    const groundT = scene.meshes.filter((m) => !m.owners).length ? surfaceHit(scene, o, d) : null;
    for (const l of scene.lines) {
      if (!l.owners) continue;
      const P = l.positions;
      for (let i = 0, k = 0; i < P.length; i += 6, k++) {
        const a = [P[i], P[i + 1], P[i + 2]], b = [P[i + 3], P[i + 4], P[i + 5]], sa = cam.project(a, vp), sb = cam.project(b, vp);
        if (!sa || !sb) continue;
        const ex = sb[0] - sa[0], ey = sb[1] - sa[1], L2 = ex * ex + ey * ey, u = L2 ? Math.max(0, Math.min(1, ((sx - sa[0]) * ex + (sy - sa[1]) * ey) / L2)) : 0;
        const dd = Math.hypot(sx - sa[0] - ex * u, sy - sa[1] - ey * u);
        if (dd > tol || (lb && dd >= lb.dd)) continue;
        const p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
        const along = (p[0] - o[0]) * d[0] + (p[1] - o[1]) * d[1] + (p[2] - o[2]) * d[2];
        if (groundT !== null && along > groundT * 1.01 + 1e-6) continue;   // behind a hill
        lb = { dd, l, k, p };
      }
    }
    // a pipe or structure right under the cursor wins over a line a few pixels away (a line within 3 px still wins)
    const solidUnder = best && best.m.owners;
    if (lb && (!solidUnder || lb.dd <= 3)) { const ow = lb.l.owners[lb.l.segOwner[lb.k]]; return { kind: ow.kind, id: ow.id, name: ow.name, at: toProject(lb.p) }; }
  }
  if (!best) return null;
  const at = toProject([o[0] + d[0] * best.t, o[1] + d[1] * best.t, o[2] + d[2] * best.t]);
  if (best.m.owners) { const ow = best.m.owners[best.m.triOwner[best.tri]]; return { kind: ow.kind, id: ow.id, name: ow.name, at }; }
  return { kind: 'surface', id: best.m.key, name: best.m.name, at };
}
