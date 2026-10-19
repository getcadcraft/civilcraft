/* SPDX-License-Identifier: Apache-2.0 */
/**
 * project.js — the CivilCraft project: what the user made (points, surface rules, alignments with
 * their design profiles, pads) and everything computed from it (surfaces, contours, profiles,
 * daylight lines, volumes), cached. No DOM — the Node test drives it exactly as the page does.
 *
 *   const p = new Project();
 *   p.setPoints(points, fileName)            (not undoable: opening a file is a fresh start for undo)
 *   p.editPoints(label, (pts, s) => newPts)  one undo step that changes the survey points (paste, cut, delete, duplicate):
 *                                            the step remembers the points array before it; point objects are never changed in place
 *   p.change(label, (s) => { … edit p.state … })   one undo step; p.undo() / p.redo()
 *   p.eg()            { surface, report }     existing ground (points + breaklines + boundary, or a TIN read from LandXML)
 *   p.contours()      [{z, pts, closed}]      at state.display.interval
 *   p.alignment(a)    Alignment               p.egProfile(a) [{sta, z}]   p.designProfile(a) Profile
 *   p.graded()        { surface, report, regions, items:[{id, kind:'corridor'|'pad', problems, region, …}] }
 *                     EG with every corridor (alignments with corridor.on) and pad graded in
 *   p.volumes()       gridVolume between EG and the graded surface inside the daylight lines (+ .items per item)
 *   p.pipeSurface()   the surface pipes are checked against: the graded surface when there is one, else EG
 *   p.networkCheck()  analyzeNetwork(state.network, pipeSurface()) — slopes, cover, drops, problems
 *   p.toJSON() / Project.fromJSON(obj) → { project, notes }   the .civilcraft.json project file
 *
 * state = { name, units, surface: { name, groups: { [key]: 'off'|'points'|'breakline' }, breaklines: [{name, pts}],
 *           boundary, maxEdge, tin }, display: {…}, alignments: [{ id, name, start, pis:[{x,y,r}], pvis:[{sta,z,L}] }],
 *           pads: [{ id, name, pts:[{x,y}], z, cut, fill }], network: null | pipes.js network,
 *           parcels: [{ id, name, pts:[{x,y,b?}] }] (0.4 V21, parcels.js)
 *           features: [{ id, name, pts:[{x,y,z}], closed, use: 'eg'|'design'|'off', daylight, cut, fill }] (0.4 V14, featureline.js:
 *           'eg' lines are breaklines of the existing ground, closed 'design' lines grading items after the corridors) }
 *   alignments also carry corridor: null | { on, lane, laneSlope, shoulder, shoulderSlope, cut, fill, step, super?, targets? (0.6
 *   WL.25: corridor.js cleanTargets; corridorOrder() grades a corridor after the ones it targets) } (corridor.js;
 *   super: superelev.js, 0.4 V18)
 *   and sampling: null | { step, left, right, extra: [sta] } (0.4 V13 sample lines; p.sections(a), sections.js)
 *   state.crs: null | the project's coordinate system (crs.js; docs/GIS-SPEC.md §1) — an undoable change like any other;
 *   it never moves a coordinate. Older files have none (null); older CivilCraft builds ignore the key.
 *   GIS: state.gis = { layers: [{ id, name, geom, fields, visible, color, source }], maps: [] } (gis-layers.js; maps:
 *   builder C). The layers' features are held outside the snapshots like the points: `gisFeatures` Map(layerId →
 *   [{ g, p }]); `editGis(label, (features, s) => features)` is one undo step that keeps the Map it replaced.
 */

import { pointGroups } from './points.js';
import { cleanBlk } from './block-points.js';
import { buildSurface, surfaceFromFaces } from './tin.js';
import { buildAlignment } from './alignment.js';
import { buildProfile, sampleSurface } from './profile.js';
import { gradedSurface, gridVolume } from './grading.js';
import { analyzeNetwork } from './pipes.js';
import { corridorPatch, defaultAssembly, cleanTargets } from './corridor.js';
import { readGisState, gisFeaturesJSON } from './gis-state.js';   // GIS: layer data in the project file (docs/GIS-SPEC.md §2)
import { cleanSampling, buildSections } from './sections.js';   // 0.4 V13: sample lines and sections
import { cleanSuper } from './superelev.js';   // 0.4 V18
import { cleanCatchment, cleanHydro } from './hydro.js';   // 0.4 V19/V20
import { cleanSewer, cleanSewLoad } from './sewer.js';   // 0.6 LC.16 S1
import { cleanType, MAX_TYPES } from './structs.js';   // 0.6 WL.27: structure types
import { cleanSwept, simulate, envelope, alignmentPath } from './swept.js';   // 0.6 WL.28: swept paths
import { cleanFeature, featureBreaklines, featureItem, flatten as flattenFeature } from './featureline.js';   // 0.4 V14: feature lines
import { cleanParcel } from './parcels.js';   // 0.4 V21
import { cleanDescKeys, cleanLineCodes, grouper, figures } from './desckeys.js';   // 0.4 V16: description keys, line codes
import { t } from './i18n.js';

// profFeatures / profWithin (0.5 WL.20): feature lines in the profile view — their crossings, and (within > 0) the lines running
// alongside within that distance of the centerline; gradeOverlay (0.5 WL.21): grades and elevations along feature lines, screen only
export const DISPLAY_DEFAULTS = { surface: 'eg', triangles: false, contours: true, interval: 1, major: 5, labels: true, bands: false, bandCount: 8, slopes: false, points: true, pointLabels: false, breaklines: true, outline: true, pipes: true, profFeatures: true, profWithin: 0, gradeOverlay: false };
const MAX_UNDO = 200;

export function emptyState() {
  return {
    name: t('project.untitled'), units: 'ft',
    surface: { name: t('surface.eg'), groups: {}, breaklines: [], boundary: null, maxEdge: 0, tin: null, descKeys: [], lineCodes: cleanLineCodes() },   // 0.4 V16: descKeys, lineCodes
    display: { ...DISPLAY_DEFAULTS },
    alignments: [], pads: [], network: null, seq: 1, crs: null, features: [], parcels: [],
    gis: { layers: [], maps: [] },   // GIS: vector layers (builder A) and map layers (builder C)
  };
}

export class Project {
  constructor() {
    this.state = emptyState();
    this.points = [];
    this.pointsFile = '';
    this.pointsVersion = 0;
    this.gisFeatures = new Map(); this.gisVersion = 0;   // GIS: layer id → [{ g, p }], outside the snapshots
    this.crsGrids = new Map();   // 0.4 V11: grid shift files name → Uint8Array (crs.js loadGrid), outside the snapshots; state.crs.grid names the one in use
    this.gisImages = new Map();   // GIS: map layer pictures 'img<n>' → data: URL (gis-map-ui.js), outside the snapshots (≤ 25 MB each)
    this.undoStack = []; this.redoStack = [];
    this.version = 0; this.saved = 0;
    this.cache = new Map();
    this.listeners = new Set();
  }
  on(f) { this.listeners.add(f); return () => this.listeners.delete(f); }
  emit(kind) { for (const f of this.listeners) f(kind); }
  get dirty() { return this.version !== this.saved; }

  // ---- edits ----
  // display settings are not undo steps: they stay as they are through undo/redo
  snapshot() { const { tin, ...surf } = this.state.surface; const { display, ...rest } = this.state; return JSON.stringify({ ...rest, surface: surf }); }
  restore(json) { const s = JSON.parse(json); s.surface.tin = this.state.surface.tin; s.display = this.state.display; this.state = s; }
  setDisplay(k, v) { if (this.state.display[k] === v) return; this.state.display[k] = v; this.touch('display'); }
  change(label, fn) {
    const before = this.snapshot();
    fn(this.state);
    if (this.snapshot() === before) return false;
    this.undoStack.push({ label, json: before });
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.touch('change');
    return true;
  }
  /** Points are held outside the JSON snapshots (they can be 100k+); a point step keeps the array it replaced. */
  editPoints(label, fn) {
    const before = this.snapshot(), was = this.points;
    const next = fn(was.slice(), this.state);
    if (!Array.isArray(next)) return false;
    const g = this.state.surface.groups;
    for (const { key } of pointGroups(next, this.keyOf())) if (!(key in g)) g[key] = this.defaultUse(key);
    this.points = next;
    this.pointsVersion++;
    this.undoStack.push({ label, json: before, pts: was });
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.touch('change');
    return true;
  }
  /** GIS: one undo step that changes GIS layer features (and, through `s`, the state — e.g. state.gis.layers or
   *  state.crs). fn gets a copy of the Map and returns the new Map; feature arrays are never changed in place. */
  editGis(label, fn) {
    const before = this.snapshot(), was = this.gisFeatures;
    const next = fn(new Map(was), this.state);
    if (!(next instanceof Map)) { this.restore(before); return false; }
    this.gisFeatures = next;
    this.gisVersion++;
    this.undoStack.push({ label, json: before, gis: was });
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.touch('change');
    return true;
  }
  /** 0.4 V9: replace the surface's TIN (a grid surface, or null = build from the points again) as ONE undo step that keeps
   *  the TIN it replaced (TINs stay out of the JSON snapshots: they can be millions of triangles). `fn(state)` may change
   *  more in the same step (e.g. the coordinate system). */
  setTin(label, tin, fn = null) {
    const before = this.snapshot(), was = this.state.surface.tin;
    if (fn) fn(this.state);
    this.state.surface.tin = tin;
    this.undoStack.push({ label, json: before, tin: was, tinSet: true });
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
    this.cache.clear();
    this.touch('change');
    return true;
  }
  step(from, to, kind) {
    const u = from.pop(); if (!u) return null;
    to.push({ label: u.label, json: this.snapshot(), pts: u.pts ? this.points : undefined, gis: u.gis ? this.gisFeatures : undefined, ...(u.tinSet ? { tin: this.state.surface.tin, tinSet: true } : {}) });
    this.restore(u.json);
    if (u.tinSet) { this.state.surface.tin = u.tin; this.cache.clear(); }   // 0.4 V9
    if (u.pts) { this.points = u.pts; this.pointsVersion++; }
    if (u.gis) { this.gisFeatures = u.gis; this.gisVersion++; }
    this.touch(kind);
    return u.label;
  }
  undo() { return this.step(this.undoStack, this.redoStack, 'undo'); }
  redo() { return this.step(this.redoStack, this.undoStack, 'redo'); }
  touch(kind) { this.version++; this.emit(kind); }
  nextId(prefix) { return prefix + (this.state.seq++); }

  setPoints(points, file = '') {
    this.points = points;
    this.pointsFile = file;
    this.pointsVersion++;
    // new description codes default to "points"; FL-like codes are left to the user
    const g = this.state.surface.groups;
    const keyOf = this.keyOf();
    for (const k of Object.keys(g)) if (!points.some((p) => keyOf(p) === k)) delete g[k];
    for (const { key } of pointGroups(points, keyOf)) if (!(key in g)) g[key] = this.defaultUse(key);
    this.undoStack = []; this.redoStack = [];
    this.touch('points');
  }
  groups() { return pointGroups(this.points, this.keyOf()).map((g) => ({ ...g, use: this.state.surface.groups[g.key] || 'points' })); }
  /** 0.4 V16: point → its group, through the description keys (the first word of the description without a key). */
  keyOf() { const k = this.state.surface.descKeys || []; return this.memo('keyOf', JSON.stringify(k), () => grouper(k)); }
  /** 0.4 V16: set the description keys and line codes as ONE undo step: groups no point is in any more are dropped, new
   *  ones start with their key's use (else Points); groups that stay keep the use the user gave them. */
  setCoding(keys, lineCodes, label = t('codes.undo')) {
    return this.change(label, (s) => {
      s.surface.descKeys = cleanDescKeys(keys);
      s.surface.lineCodes = cleanLineCodes(lineCodes);
      const keyOf = grouper(s.surface.descKeys), g = s.surface.groups, now = new Set(this.points.map(keyOf));
      for (const k of Object.keys(g)) if (!now.has(k)) delete g[k];
      for (const k of now) if (!(k in g)) { const d = s.surface.descKeys.find((x) => (x.group || x.code) === k && x.use); g[k] = d ? d.use : 'points'; }
    });
  }
  /** A new group's use: the first description key naming that group with a use, else 'points'. */
  defaultUse(group) { const k = (this.state.surface.descKeys || []).find((x) => (x.group || x.code) === group && x.use); return k ? k.use : 'points'; }
  /** 0.4 V16: the lines that line codes make (all groups, or `only`) — see desckeys.js figures(). */
  figures(only = null) { const s = this.state.surface; return this.memo('fig:' + (only ? [...only].join('|') : '*'), this.pointsVersion + '|' + JSON.stringify([s.descKeys, s.lineCodes]), () => figures(this.points.filter((p) => p.z !== null), { keys: s.descKeys || [], lineCodes: s.lineCodes || cleanLineCodes(), only })); }

  // ---- derived ----
  memo(key, deps, f) {
    const c = this.cache.get(key);
    if (c && c.deps === deps) return c.value;
    const value = f();
    this.cache.set(key, { deps, value });
    return value;
  }
  surfaceDeps() { const { tin, ...s } = this.state.surface; return this.pointsVersion + '|' + (tin ? tin.pts.length + ':' + tin.faces.length : '') + '|' + JSON.stringify(s) + '|' + JSON.stringify((this.state.features || []).filter((f) => f.use === 'eg')); }

  /** The breaklines the surface uses: point groups marked 'breakline' (joined in point-number order) + drawn ones. */
  egBreaklines() {
    const out = [];
    // breakline groups: one line per code, split and closed by line codes (0.4 V16; a code without line codes joins all
    // its points in number order, as before)
    const bl = new Set(Object.entries(this.state.surface.groups).filter(([, use]) => use === 'breakline').map(([k]) => k));
    if (bl.size) for (const f of this.figures(bl)) out.push({ name: f.code, pts: [...f.pts, ...(f.closed ? [f.pts[0]] : [])].map((p) => ({ x: p.x, y: p.y, z: p.z })), fromGroup: true });
    for (const b of this.state.surface.breaklines) out.push(b);
    out.push(...featureBreaklines(this.state.features, 'eg'));   // 0.4 V14
    return out;
  }
  egPoints() {
    const g = this.state.surface.groups;
    const keyOf = this.keyOf();
    return this.points.filter((p) => p.z !== null && (g[keyOf(p)] || 'points') === 'points');
  }
  eg() {
    return this.memo('eg', this.surfaceDeps(), () => {
      const s = this.state.surface;
      if (s.tin) return surfaceFromFaces(s.tin);
      if (!this.points.length && !s.breaklines.length && !(this.state.features || []).some((f) => f.use === 'eg')) return { surface: null, report: { notes: [], errors: [] } };
      return buildSurface({ points: this.egPoints(), breaklines: this.egBreaklines(), boundary: s.boundary, maxEdge: Number(s.maxEdge) || 0 });
    });
  }
  contours(surface = this.eg().surface, tag = 'eg') {
    const d = this.state.display;
    if (!surface) return [];
    return this.memo('contours:' + tag, this.surfaceDeps() + '|' + this.padsDeps(tag) + '|' + d.interval, () => surface.contours(Number(d.interval) || 1) || []);
  }
  alignment(a) { return this.memo('al:' + a.id, JSON.stringify([a.pis, a.start]), () => buildAlignment({ pis: a.pis, start: Number(a.start) || 0 })); }
  egProfile(a) {
    const al = this.alignment(a), sf = this.eg().surface;
    return this.memo('eg:' + a.id, this.surfaceDeps() + JSON.stringify([a.pis, a.start]), () => sampleSurface(sf, al));
  }
  designProfile(a) { return this.memo('fg:' + a.id, JSON.stringify(a.pvis), () => buildProfile(a.pvis || [])); }

  padsDeps(tag = 'fg') { return tag === 'eg' ? '' : this.gradeDeps(); }
  /** What the graded surface depends on besides the existing ground: pads, and alignments with a corridor on. */
  gradeDeps() {
    const on = this.state.alignments.filter((a) => a.corridor?.on);
    // 0.6 WL.25: a corridor that targets a feature line depends on that line, whatever its use
    const tf = new Set(on.flatMap((a) => (a.corridor.targets || []).filter((g) => g.from.kind === 'feature').map((g) => g.from.id)));
    return JSON.stringify([this.state.pads, on, (this.state.features || []).filter((f) => f.use === 'design' || tf.has(f.id))]);
  }
  /** 0.6 WL.25: the corridors in an order where every corridor comes after the corridors it targets; a target that would
   *  close a loop is marked { loop: true } (index per alignment id). */
  corridorOrder() {
    const on = this.state.alignments.filter((a) => a.corridor?.on), byId = new Map(on.map((a) => [a.id, a]));
    const order = [], mark = new Map(), loops = new Map();
    const visit = (a) => {
      if (mark.get(a.id) === 2) return;
      mark.set(a.id, 1);
      (a.corridor.targets || []).forEach((g, i) => {
        if (g.from.kind !== 'corridor') return;
        const b = byId.get(g.from.id);
        if (!b) return;
        if (mark.get(b.id) === 1 || b.id === a.id) { if (!loops.has(a.id)) loops.set(a.id, new Set()); loops.get(a.id).add(i); return; }
        visit(b);
      });
      mark.set(a.id, 2);
      order.push(a);
    };
    for (const a of on) visit(a);
    return { order, loops };
  }
  /** The items graded into the existing ground, in order: corridors first, then pads. */
  gradeItems() {
    const items = [];
    // 0.6 WL.25: corridors in target order; each one's lines are kept as it is graded, so a corridor targeting another's
    // edge reads that edge as it is now (it moves when the other corridor changes)
    const { order, loops } = this.corridorOrder(), done = new Map();
    for (const a of order) {
      const al = this.alignment(a), prof = this.designProfile(a), asm = { ...defaultAssembly(this.state.units), ...a.corridor };
      const resolve = () => (a.corridor.targets || []).map((g, i) => {
        if (g.from.kind === 'feature') {
          const f = (this.state.features || []).find((x) => x.id === g.from.id);
          return { ...g, line: f ? flattenFeature(f) : null, label: f ? f.name : t('corr.tg.gone') };
        }
        const b = this.state.alignments.find((x) => x.id === g.from.id);
        const label = b ? t('corr.tg.of', { name: b.name, line: t('corr.line.' + g.from.line.toLowerCase()) }) : t('corr.tg.gone');
        if (loops.get(a.id)?.has(i)) return { ...g, line: null, label, loop: true };
        return { ...g, line: done.get(g.from.id)?.lines?.[g.from.line] || null, label };
      });
      items.push({ id: a.id, kind: 'corridor', name: t('project.corridor', { name: a.name }), patch: (surf) => {
        const r = corridorPatch(surf, al, prof, asm, { targets: resolve() });
        done.set(a.id, r.info);
        return r;
      } });
    }
    for (const f of this.state.features || []) { const it = featureItem(f); if (it) items.push(it); }   // 0.4 V14: closed design feature lines
    for (const p of this.state.pads) if (p.pts.length >= 3) items.push({ ...p, kind: 'pad', z: Number(p.z), cut: Number(p.cut), fill: Number(p.fill) });
    return items;
  }
  /** 0.6 WL.28: a swept path worked out: { path, sim, env } (null without its line), kept until it or its line changes. */
  sweptOf(rec) {
    let path = null, dep = '';
    if (rec.from.kind === 'feature') { const f = (this.state.features || []).find((x) => x.id === rec.from.id); if (f) { path = f.closed ? [...f.pts, { ...f.pts[0], b: undefined }] : f.pts; dep = JSON.stringify(f.pts) + f.closed; } }
    else { const a = this.state.alignments.find((x) => x.id === rec.from.id); const al = a && this.alignment(a); if (al?.ok) { path = alignmentPath(al); dep = JSON.stringify(path); } }
    return this.memo('swept:' + rec.id, JSON.stringify(rec) + '|' + dep, () => {
      if (!path || path.length < 2) return null;
      const sim = simulate(rec.vehicle, path, { mode: rec.mode });
      return { path, sim, env: envelope(sim, rec.vehicle) };
    });
  }
  graded() {
    return this.memo('graded', this.surfaceDeps() + '|' + this.gradeDeps(), () => {
      const eg = this.eg().surface, items = this.gradeItems();
      if (!eg || !items.length) return { surface: null, report: { notes: [], errors: [], items: [] }, regions: [], items: [] };
      const s = this.state.surface;
      let basePts, baseBl;
      if (s.tin) { basePts = eg.toFaces().pts; baseBl = []; } else { basePts = this.egPoints(); baseBl = this.egBreaklines(); }
      const build = (input) => buildSurface({ ...input, boundary: s.tin ? null : s.boundary, maxEdge: s.tin ? 0 : Number(s.maxEdge) || 0 });
      const r = gradedSurface(eg, basePts, baseBl, items, build);
      return { ...r, items: r.items.map((d, i) => ({ id: items[i].id, kind: items[i].kind, name: items[i].name, problems: r.report.items[i].problems, region: r.regions[i], ...d })) };
    });
  }
  /** 0.4 V13: the alignment's sample lines and sections (sections.js) — ground = EG, design = the graded surface when
   *  anything is graded, else EG (no cut or fill); corridor feature lines marked. null without sample lines. */
  sections(a) {
    if (!a?.sampling) return null;
    const al = this.alignment(a);
    if (!al.ok) return null;
    return this.memo('sec:' + a.id, this.surfaceDeps() + '|' + this.gradeDeps() + '|' + JSON.stringify([a.pis, a.start, a.sampling]), () => {
      const eg = this.eg().surface, g = this.graded();
      const cor = g.items?.find((x) => x.kind === 'corridor' && x.id === a.id);
      return buildSections({ alignment: al, ground: eg, design: g.surface || eg, regions: (g.regions || []).filter(Boolean), corridor: cor?.lines || null, sampling: a.sampling });
    });
  }
  /** Cut and fill (grid method) inside every daylight line, in total and per item. */
  volumes(cell) {
    const g = this.graded(), eg = this.eg().surface;
    if (!g.surface || !eg) return null;
    const regions = g.regions.filter(Boolean);
    if (!regions.length) return null;
    return this.memo('vol', this.surfaceDeps() + '|' + this.gradeDeps() + '|' + cell, () => {
      const total = gridVolume(eg, g.surface, { region: regions, cell });
      total.items = g.items.filter((it) => it.region).map((it) => ({ id: it.id, name: it.name, ...gridVolume(eg, g.surface, { region: it.region, cell: total.cell }) }));
      return total;
    });
  }

  pipeSurface() { return this.graded().surface || this.eg().surface; }
  networkCheck() {
    const n = this.state.network;
    if (!n) return null;
    return this.memo('net', this.surfaceDeps() + '|' + this.gradeDeps() + '|' + JSON.stringify(n) + this.state.units, () => analyzeNetwork(n, this.pipeSurface(), this.state.units));
  }

  // ---- project file ----
  toJSON() {
    return {
      format: 'civilcraft-project', version: 1, saved: new Date().toISOString(),
      name: this.state.name, units: this.state.units, pointsFile: this.pointsFile,
      points: this.points.map((p) => (p.blk ? [p.n, p.x, p.y, p.z, p.d, p.blk] : [p.n, p.x, p.y, p.z, p.d])),   // 0.5 WL.19: + the block it came from
      surface: this.state.surface, display: this.state.display,
      alignments: this.state.alignments, pads: this.state.pads, network: this.state.network, seq: this.state.seq,
      features: this.state.features || [],   // 0.4 V14
      parcels: this.state.parcels || [],   // 0.4 V21
      swept: this.state.swept || [],   // 0.6 WL.28
      crs: this.state.crs,
      gis: this.state.gis, gisFeatures: gisFeaturesJSON(this.gisFeatures),   // GIS: { id: [[geometry, props], …] }
      crsGrids: crsGridsJSON(this),   // 0.4 V11: { name: base64 } for the grid state.crs.grid names
      gisImages: gisImagesJSON(this),   // GIS: { 'img<n>': data URL } for the map layers that use them (builder C)
    };
  }

  static fromJSON(obj) {
    const notes = [];
    if (!obj || obj.format !== 'civilcraft-project') throw new Error(t('project.err.notcc'));
    if (obj.version !== 1) throw new Error(t('project.err.newer', { version: String(obj.version).slice(0, 10) }));
    const p = new Project();
    const fin = (v) => typeof v === 'number' && Number.isFinite(v);
    const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
    const xy = (q) => (q && fin(q.x) && fin(q.y) ? { x: q.x, y: q.y } : null);
    const xyz = (q) => (q && fin(q.x) && fin(q.y) && fin(q.z) ? { x: q.x, y: q.y, z: q.z } : null);
    const list = (a, f, max) => (Array.isArray(a) ? a.slice(0, max).map(f).filter(Boolean) : []);
    const s = p.state;
    s.name = str(obj.name, 120) || t('project.untitled');
    s.units = obj.units === 'm' ? 'm' : 'ft';
    s.seq = Number.isInteger(obj.seq) && obj.seq > 0 ? obj.seq : 1;
    const pts = list(obj.points, (r) => {
      if (!Array.isArray(r) || !fin(r[1]) || !fin(r[2])) return null;
      const q = { n: str(r[0], 40), x: r[1], y: r[2], z: fin(r[3]) ? r[3] : null, d: str(r[4]) };
      const blk = cleanBlk(r[5]);   // 0.5 WL.19
      if (blk) q.blk = blk;
      return q;
    }, 2e6);
    if (Array.isArray(obj.points) && pts.length !== obj.points.length) notes.push(t('project.bad.points', { n: obj.points.length - pts.length }));
    const sf = obj.surface || {};
    s.surface.name = str(sf.name, 120) || t('surface.eg');
    s.surface.groups = {};
    if (sf.groups && typeof sf.groups === 'object') for (const [k, v] of Object.entries(sf.groups).slice(0, 10000)) if (['off', 'points', 'breakline'].includes(v)) s.surface.groups[str(k, 200)] = v;
    s.surface.breaklines = list(sf.breaklines, (b) => { const q = list(b?.pts, xyz, 1e6); return q.length >= 2 ? { name: str(b.name, 120), pts: q } : null; }, 1e5);
    const bnd = list(sf.boundary, xy, 1e6);
    s.surface.boundary = bnd.length >= 3 ? bnd : null;
    s.surface.maxEdge = fin(sf.maxEdge) && sf.maxEdge >= 0 ? sf.maxEdge : 0;
    s.surface.descKeys = cleanDescKeys(sf.descKeys);   // 0.4 V16
    s.surface.lineCodes = cleanLineCodes(sf.lineCodes);
    if (sf.tin && Array.isArray(sf.tin.pts) && Array.isArray(sf.tin.faces)) {
      const tp = sf.tin.pts.slice(0, 5e6).map(xyz);
      const tf = sf.tin.faces.slice(0, 1e7).filter((f) => Array.isArray(f) && f.length === 3 && f.every((i) => Number.isInteger(i) && i >= 0 && i < tp.length));
      s.surface.tin = { pts: tp, faces: tf };
      if (sf.tin.from === 'grid') s.surface.tin.from = 'grid';   // GIS: a grid TIN made from an elevation grid (gis-terrain-ui.js)
    }
    if (obj.display && typeof obj.display === 'object') for (const k of Object.keys(DISPLAY_DEFAULTS)) { const v = obj.display[k]; if (typeof v === typeof DISPLAY_DEFAULTS[k] && (typeof v !== 'number' || (fin(v) && v > 0)) && (k !== 'surface' || v === 'eg' || v === 'fg')) s.display[k] = v; }
    const id = (v, pre) => (/^[a-z]+\d+$/.test(String(v)) ? String(v) : p.nextId(pre));
    s.alignments = list(obj.alignments, (a) => {
      const pis = list(a?.pis, (q) => (xy(q) ? { ...xy(q), r: fin(q.r) && q.r > 0 ? q.r : 0 } : null), 1e4);
      if (pis.length < 2) return null;
      const pvis = list(a.pvis, (v) => (v && fin(v.sta) && fin(v.z) ? { sta: v.sta, z: v.z, L: fin(v.L) && v.L > 0 ? v.L : 0 } : null), 1e4);
      let corridor = null;
      if (a.corridor && typeof a.corridor === 'object') {
        const d = defaultAssembly(s.units), c = a.corridor, pos = (v, k) => (fin(v) && v >= 0 ? v : d[k]);
        corridor = { on: c.on === true, lane: pos(c.lane, 'lane'), laneSlope: pos(c.laneSlope, 'laneSlope'), shoulder: pos(c.shoulder, 'shoulder'), shoulderSlope: pos(c.shoulderSlope, 'shoulderSlope'), cut: pos(c.cut, 'cut') || d.cut, fill: pos(c.fill, 'fill') || d.fill, step: pos(c.step, 'step') || d.step };
        const sup = cleanSuper(c.super, s.units);   // 0.4 V18
        if (sup) corridor.super = sup;
        const tg = cleanTargets(c.targets);   // 0.6 WL.25
        if (tg.length) corridor.targets = tg;
      }
      const minR = fin(a.minR) && a.minR > 0 && a.minR < 1e7 ? a.minR : 0;   // 0.5 WL.23: design minimum radius (0 = none)
      return { id: id(a.id, 'a'), name: str(a.name, 120) || t('scene.al.default'), start: fin(a.start) ? a.start : 0, pis, pvis, corridor, sampling: cleanSampling(a.sampling, s.units), ...(minR ? { minR } : {}) };
    }, 1000);
    s.pads = list(obj.pads, (d) => {
      const q = list(d?.pts, xy, 1e4);
      if (q.length < 3 || !fin(d.z)) return null;
      return { id: id(d.id, 'p'), name: str(d.name, 120) || t('scene.pad.default'), pts: q, z: d.z, cut: fin(d.cut) && d.cut > 0 ? d.cut : 2, fill: fin(d.fill) && d.fill > 0 ? d.fill : 2 };
    }, 1000);
    s.features = list(obj.features, (f) => { const c = cleanFeature(f, s.units); if (c) c.id = id(f?.id, 'f'); return c; }, 1000);   // 0.4 V14
    s.parcels = list(obj.parcels, (f) => { const c = cleanParcel(f); if (c) c.id = id(f?.id, 'r'); return c; }, 2000);   // 0.4 V21
    s.swept = list(obj.swept, (w) => { const c = cleanSwept(w, s.units); if (c) c.id = id(w?.id, 'w'); return c; }, 200);   // 0.6 WL.28
    const nw = obj.network;
    if (nw && typeof nw === 'object' && Array.isArray(nw.structures) && Array.isArray(nw.pipes)) {
      const r = nw.rules || {};
      const pos = (v, d) => (fin(v) && v >= 0 ? v : d);
      // 0.6 WL.27: structure types (structs.js); a structure keeps a type that exists
      const types = list(nw.types, (k) => { const c = cleanType(k, s.units); if (c) c.id = id(k?.id, 'u'); return c; }, MAX_TYPES);
      const typeIds = new Set(types.map((k) => k.id));
      const structures = list(nw.structures, (x) => (xy(x) ? { id: id(x.id, 's'), name: str(x.name, 60) || t('project.def.structure'), ...xy(x), rim: fin(x.rim) ? x.rim : null, sumpDepth: pos(x.sumpDepth, 0), dia: pos(x.dia, 48), ...(typeIds.has(x.type) ? { type: x.type } : {}), ...(cleanSewLoad(x.sew) ? { sew: cleanSewLoad(x.sew) } : {}) } : null), 1e4);
      const ids = new Set(structures.map((x) => x.id));
      const pipes = list(nw.pipes, (x) => (x && ids.has(x.from) && ids.has(x.to) && x.from !== x.to ? { id: id(x.id, 'q'), name: str(x.name, 60) || t('project.def.pipe'), from: x.from, to: x.to, dia: pos(x.dia, 12) || 12, invUp: fin(x.invUp) ? x.invUp : null, invDn: fin(x.invDn) ? x.invDn : null } : null), 1e4);
      if (pipes.length !== nw.pipes.length) notes.push(t('project.bad.pipes', { n: nw.pipes.length - pipes.length }));
      s.network = { name: str(nw.name, 60) || t('pipes.default'), type: nw.type === 'sanitary' ? 'sanitary' : 'storm', rules: { minSlope: pos(r.minSlope, 0), minCover: pos(r.minCover, 0), minDrop: pos(r.minDrop, 0) }, structures, pipes };
      // 0.4 V19/V20: catchments (to a structure of this network, else none) and the hydrology settings
      const cs = list(nw.catchments, (x) => { const c = cleanCatchment(x); if (!c) return null; c.id = id(x.id, 'k'); if (c.to && !ids.has(c.to)) c.to = null; return c; }, 1e4);
      if (cs.length) s.network.catchments = cs;
      if (nw.hydro && typeof nw.hydro === 'object') s.network.hydro = cleanHydro(nw.hydro, s.units);
      if (types.length) s.network.types = types;
      if (nw.sewer && typeof nw.sewer === 'object') s.network.sewer = cleanSewer(nw.sewer, s.units);   // 0.6 LC.16 S1: sanitary design flows
    }
    s.crs = readCrs(obj.crs, str, fin, notes);
    { const g = readGisState(obj.gis, obj.gisFeatures, notes); s.gis = g.gis; p.gisFeatures = g.features; p.gisVersion++; }   // GIS (untrusted)
    p.crsGrids = readCrsGrids(obj.crsGrids, s.crs, notes);   // 0.4 V11
    if (p.crsGrids.size) {   // register with proj4 (crs.js, loaded only when a project has a grid); then tell the views
      import('./crs.js').then(async (C) => { for (const [n, b] of p.crsGrids) { try { await C.loadGrid(n, b); } catch (e) { p.gridError = e.message; } } p.emit('crs-grid'); }).catch((e) => { p.gridError = e.message; });
    }
    p.gisImages = readGisImages(obj.gisImages, s.gis.maps, notes);   // GIS: map layer pictures (builder C; gis-map-ui.js reads the layers)
    p.points = pts; p.pointsFile = str(obj.pointsFile, 200); p.pointsVersion++;
    for (const a of [...s.alignments, ...s.pads, ...(s.network ? [...s.network.structures, ...s.network.pipes, ...(s.network.catchments || []), ...(s.network.types || [])] : []), ...s.gis.layers, ...(s.features || []), ...(s.parcels || []), ...(s.swept || [])]) { const n = Number(String(a.id).replace(/^\D+/, '')); if (n >= s.seq) s.seq = n + 1; }
    return { project: p, notes };
  }
}

/** The project file's `crs` (untrusted): shape and sizes only — crs.js `crsProblem` judges the definition when used. */
function readCrs(c, str, fin, notes) {
  if (c == null) return null;
  const bad = () => { notes.push(t('project.bad.crs')); return null; };
  if (typeof c !== 'object' || typeof c.proj4 !== 'string' || !c.proj4.trim() || c.proj4.length > 20000 || !['m', 'ft', 'ftUS'].includes(c.unit)) return bad();
  const out = { code: Number.isInteger(c.code) && c.code > 0 && c.code < 1e6 ? c.code : null, name: str(c.name, 200) || t('project.def.crs'), proj4: c.proj4.replace(/[\u0000-\u001f\u007f]/g, ' '), unit: c.unit, local: null };
  if (typeof c.grid === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(c.grid)) out.grid = c.grid;   // 0.4 V11
  const l = c.local;
  if (l != null) {
    const pt = (q) => Array.isArray(q) && q.length === 2 && q.every(fin);
    if (typeof l !== 'object' || !fin(l.scale) || !(l.scale > 0.5 && l.scale < 2) || !fin(l.rotation) || !pt(l.from) || !pt(l.to)) return bad();
    out.local = { scale: l.scale, rotation: l.rotation, from: [l.from[0], l.from[1]], to: [l.to[0], l.to[1]] };
  }
  return out;
}

// GIS (builder C): pictures of image map layers live in project.gisImages, not in the undo snapshots; the file keeps
// those a map layer uses, each a data:image/png|jpeg;base64 URL of at most 25 MB (untrusted on the way in).
const MAX_GIS_IMAGE = Math.ceil(25 * 1024 * 1024 * 4 / 3) + 40;
// 0.4 V11: the grid shift file the project's system uses, base64 in the file (at most 20 MB; untrusted on the way in)
const MAX_GRID = 20 * 1024 * 1024;
function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode(...u8.subarray(i, i + 0x8000)); return btoa(s); }
function crsGridsJSON(p) {
  const n = p.state.crs?.grid, b = n && p.crsGrids?.get(n);
  return b ? { [n]: b64(b) } : {};
}
function readCrsGrids(obj, crs, notes) {
  const out = new Map();
  if (!obj || typeof obj !== 'object' || Array.isArray(obj) || !crs?.grid) return out;
  const v = obj[crs.grid];
  if (typeof v !== 'string') { if (v !== undefined || crs.grid) notes.push(t('grid.err.notinfile', { name: crs.grid })); return out; }
  if (v.length > Math.ceil(MAX_GRID * 4 / 3) + 4 || !/^[A-Za-z0-9+/]+=*$/.test(v)) { notes.push(t('grid.err.badfile')); return out; }
  const bin = atob(v), u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  out.set(crs.grid, u8);
  return out;
}
function gisImagesJSON(p) {
  const used = new Set((p.state.gis?.maps || []).map((m) => m?.image).filter(Boolean));
  const out = {};
  for (const [k, v] of p.gisImages || []) if (used.has(k)) out[k] = v;
  return out;
}
function readGisImages(obj, maps, notes) {
  const out = new Map();
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
  const used = new Set((maps || []).map((m) => m?.image).filter((v) => typeof v === 'string'));
  let bad = 0;
  for (const k of Object.keys(obj).slice(0, 200)) {
    if (!used.has(k) || !/^img\d{1,9}$/.test(k)) continue;
    const v = obj[k];
    if (typeof v === 'string' && v.length <= MAX_GIS_IMAGE && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(v)) out.set(k, v); else bad++;
  }
  if (bad) notes.push(t('project.bad.maps', { n: bad }));
  return out;
}
