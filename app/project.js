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
 *   p.change(label, fn, { keys: p.keysOf('alignments', id) })   0.11 PERF.21: the same step, made from only the chunks the hint
 *                                            names (O(change), not a serialize of the whole state); a hint that misses a change is a
 *                                            bug in the caller: Project.verifyHints = true (tests) checks every hinted step in full
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
 *   0.7.1 71.26: an alignment may carry rail: rail.js cleanRail (a track: cant per PI `pis[i].cant` mm, transition `pis[i].tr`);
 *   p.railPlan(a) (cantPlan), p.railWarnings(); its corridor is then built as a track (corridor.js asm.rail via railAsm).
 *   alignments also carry corridor: null | { on, lane, laneSlope, shoulder, shoulderSlope, cut, fill, step, super?, targets? (0.6
 *   WL.25: corridor.js cleanTargets; corridorOrder() grades a corridor after the ones it targets) } (corridor.js;
 *   super: superelev.js, 0.4 V18)
 *   and sampling: null | { step, left, right, extra: [sta] } (0.4 V13 sample lines; p.sections(a), sections.js)
 *   state.crs: null | the project's coordinate system (crs.js; docs/GIS-SPEC.md §1) — an undoable change like any other;
 *   it never moves a coordinate. Older files have none (null); older CivilCraft builds ignore the key.
 *   0.9 SU.1110 + WB.6 (templates.js): state.templates = [template] (the project's own copies, ids tp<n>); a corridor may carry
 *   from / to (stations) and regions (templates by station, left and right apart); an alignment may carry corridors =
 *   [{ id cr<n>, name, …a corridor }] — more corridors on the same alignment (each graded as its own item, `alignment` = the
 *   alignment's id); state.terrainTemplates = [{ id tt<n>, name, tpl, surface 'eg'|'fg', clip: null | { kind 'parcel'|'pad'|
 *   'feature', id }, params }] — a template draped on a terrain inside a plan shape (p.terrainResults(), p.materials()).
 *   All optional keys: a file without them is written as before, so older builds open it (they ignore the keys).
 *   GIS: state.gis = { layers: [{ id, name, geom, fields, visible, color, source }], maps: [] } (gis-layers.js; maps:
 *   builder C). The layers' features are held outside the snapshots like the points: `gisFeatures` Map(layerId →
 *   [{ g, p }]); `editGis(label, (features, s) => features)` is one undo step that keeps the Map it replaced.
 */

import { cleanBlk } from './block-points.js';
import { cleanText, pointRow as readPointRow } from './project-rows.js';   // 0.11 PERF.33: one row reader for the page and the open Worker
import { buildSurface, surfaceFromFaces, pointInPoly } from './tin.js';
import { gridSurface, METHODS as GRID_METHODS } from './gridding.js';   // 0.9 D9.6: choose the contouring method
import { smoothContours, LEVELS as SMOOTH_LEVELS } from './contour-smooth.js';   // 0.9.1: contour smoothing (display.smooth 'light' | 'strong'; absent = none)
import { buildGround } from './ground-surface.js';   // 0.8 SU.911: contour terrain (flat triangles fixed when surface.flatFix > 0)
import { buildAlignment, TRANSITIONS } from './alignment.js';
import { buildProfile, sampleSurface } from './profile.js';
import { gradedSurface, gridVolume } from './grading.js';
import { analyzeNetwork } from './pipes.js';
import { corridorPatch, defaultAssembly, cleanTargets, cleanSides } from './corridor.js';
import { nominalWidths, findJunctions, padEnds, bodyOf, roadZAt, padZAt } from './junction.js';   // 0.10.1 #1977: roads that meet roads and pads
import { cleanTemplate, cleanRegions, cleanNamed, MAX_TEMPLATES, terrainQuantities } from './templates.js';   // 0.9 SU.1110 + WB.6
import { readGisState, gisFeaturesJSON } from './gis-state.js';   // GIS: layer data in the project file (docs/GIS-SPEC.md §2)
import { cleanSampling, buildSections } from './sections.js';   // 0.4 V13: sample lines and sections
import { cleanSuper } from './superelev.js';   // 0.4 V18
import { cleanRail, cantPlan, cantAt as cantAtPlan, baseOf as railBaseOf, kmh as railKmh } from './rail.js';   // 0.7.1 71.26: railway alignments and tracks
import { cleanCatchment, cleanHydro } from './hydro.js';
import { cleanRuleset, MAX_RULESETS } from './rulesets.js';   // 0.11 SU.1937b   // 0.4 V19/V20
import { cleanSewer, cleanSewLoad } from './sewer.js';   // 0.6 LC.16 S1
import { cleanType, MAX_TYPES } from './structs.js';   // 0.6 WL.27: structure types
import { cleanSwept, simulate, envelope, alignmentPath } from './swept.js';   // 0.6 WL.28: swept paths
import { cleanFeature, featureBreaklines, featureItem, breaklineItem, flatten as flattenFeature } from './featureline.js';   // 0.4 V14: feature lines
import { cleanParcel } from './parcels.js';   // 0.4 V21
import { cleanBook as cleanLandBook, bookEmpty as landBookEmpty } from './landbook.js';   // 0.11 LR.3: the land book (a copy of lib/landrecords/clean.js; the Land records add-on)
import { cleanZone } from './zoning.js';   // 0.7 LC.1 M3: the zoning limits a person typed
import { cleanMass, MAX_MASSES } from './massing.js';   // 0.7 LC.1: building masses (session massing)
import { cleanRiver } from './river.js';   // 0.8 SU.957: rivers (session sx-river)
import { cleanLandscape, freezeSpacing } from './landscape/planting.js';   // 0.7 LD: the Landscape workspace (session landscape)
import { cleanSides as cleanPadSides } from './sides.js';   // 0.7.1 71.22: slopes per side, retaining walls
import { gradeItems as lsGradeItems, gradeDeps as lsGradeDeps } from './landscape/grade.js';   // 0.7 LD.3: platforms, berms, swales, grading areas
import { readPlants } from './landscape/plants.js';
import { cleanIssues } from './issues.js';
import { cleanUtilities } from './utilnet.js';   // 0.10 SU.1810   // 0.10 CV.1
import { cleanParking } from './parking-apply.js';   // 0.10 SU.1815: parking lots
import { clean as cleanFence } from './fence/index.js';   // 0.10 SU.1814b: fences
import { cleanWater } from './water.js';
import { trackChecks, curvatureAt } from './rail-checks.js';   // CV.1 2026-11-12: grade, vertical curves, short elements, deficiency rate
import { placeAll, turnoutChecks } from './rail-turnouts.js';   // CV.1 2026-11-12: turnouts on the alignment
import { sweep as clearanceSweep, check as clearanceCheck } from './rail-clearance.js';   // CV.1 2026-11-12: the clearance envelope
import { cleanGeo } from './geo-state.js';   // 0.8 round 2 (civil-geo_PART_2): borings, slopes, junctions, nets, pits, links, turnouts
import { cleanSectionLines } from './platform.js';   // 0.8 SU.914 rest: saved free-section lines
import { cleanSolar } from './solar-state.js';   // 0.8 EG.15 (round 3): ground PV arrays on terrain
import { cleanPond } from './detention.js';   // 0.8 EG.12: detention ponds saved in the file (eg-ui.js)
import { cleanSite } from './site-context.js';   // 0.8 EG.63: the address, sources and results kept in the file
import { cleanProgress } from './progress.js';   // 0.8 EG.39: the survey rows kept in the file   // 0.8 LC.16 W1/W2: water mains (water-ui.js)
import { cleanPowerlines } from './powerline/model.js';   // 0.7 PL: the Power lines workspace (docs/0.7-PART8.md)
import { cleanDescKeys, cleanLineCodes, grouper, figures, parseDesc } from './desckeys.js';
import { PointTable } from './point-table.js';   // 0.11 (perf-finish-11 civil, the cap lifted): the survey points as typed arrays   // 0.4 V16: description keys, line codes
import { t } from './i18n.js';
import { ChunkHistory, objectJournal, recoverState, recoverExtras, join, KEYS, serializeKeys } from './history/index.js';
import { openBlock, nextNumber, savedCounter, idNumbers, narrowIds, maxOf, OLD_LIMIT, FILE_IDS } from './history/ids.js';   // 0.11 DC.27: each session's ids from its own random tag   // 0.10 PERF.21 / PERF.24: undo by change records, autosave that writes what changed
import { cleanAcceptedCivil } from './problems-civilcraft.js';   // 0.7.1 → 0.8: problems accepted as intended (docs/0.8-PROBLEMS-SPEC.md)
import { cleanIdsRecord, idsTextStore } from './ids/record.js';   // 0.7.1 71.25: the IDS the IFC export is checked against (cc-ids, lib/ids synced)

// profFeatures / profWithin (0.5 WL.20): feature lines in the profile view — their crossings, and (within > 0) the lines running
// alongside within that distance of the centerline; gradeOverlay (0.5 WL.21): grades and elevations along feature lines, screen only
export const DISPLAY_DEFAULTS = { surface: 'eg', triangles: false, contours: true, interval: 1, major: 5, labels: true, bands: false, bandCount: 8, slopes: false, points: true, pointLabels: false, breaklines: true, outline: true, pipes: true, profFeatures: true, profWithin: 0, gradeOverlay: false, secBasis: 'bottom' };
const MAX_UNDO = 200;
/** The most survey points a project file opens with (more are left out and the note says how many). 0.11 PERF.33 set it at 2,000,000 (one
 *  object a point). The points are now a PointTable (perf-finish-11 civil, owner 2026-11-22) and open, edit, undo and reopen were proven to
 *  10,000,000 on workstation11a, but Save (the project file's IFC: the TIN and its fingerprints, one string and several GB of heap) and the
 *  autosave's first copy (one IndexedDB record) were proven only to 2,000,810: so the cap stays at what all of them were proven at
 *  (docs/0.11-sessions/perf-finish-11-civil-cap.md). The table itself has no limit of its own below the descriptions' Map (16,777,216). */
export const MAX_POINTS = 2e6;
/** From this many existing-ground points the page rebuilds the surface off the page after an edit (Project.bigEg; it shows the surface it had
 *  until then). Below it the rebuild stays on the page, at once, as before the cap was lifted. */
export const BIG_EG = 2e6;
/** 0.11 PERF.33: the points of a parse made off the page (pointColumns) as fromJSON's rows, `from` to `to` (the page builds them in slices). */
export function pointsFromColumns(c, from = 0, to = c.count, names = c.names.split('\u0000'), descs = c.descs.split('\u0000'), out = []) {
  for (let i = from; i < to; i++) out.push({ n: names[i], x: c.x[i], y: c.y[i], z: Number.isNaN(c.z[i]) ? null : c.z[i], d: descs[i] });
  return out;
}
/** …and the block references of those rows (rare; 0.5 WL.19), put on the points they belong to. */
export function blocksFromColumns(c, pts) {
  for (let i = 0; i < c.blk.length; i += 2) { const b = cleanBlk(c.blk[i + 1]); if (b) pts[c.blk[i]].blk = b; }
  return pts;
}
/** How the state is cut into chunks (lib/history): display settings and the TIN stay out of the history (they are not undo steps); the lists of objects with an id are one chunk per object. */
export const HISTORY_SPEC = Object.freeze({
  arrays: { alignments: 'id', pads: 'id', features: 'id', parcels: 'id', masses: 'id', zoning: 'id', ponds: 'id', rivers: 'id', swept: 'id', templates: 'id', terrainTemplates: 'id', issues: 'id', parking: 'id', fences: 'id', sectionLines: 'id', progress: 'id' },
  view: (s) => { const { display, ...rest } = s; const { tin, ...surf } = s.surface; return { ...rest, surface: surf }; },
  revive: (key, v, state) => (key === 'k:surface' ? { ...v, tin: state.surface ? state.surface.tin : null } : v),
});
/** The project file as the autosave cuts it (what toJSON leaves out as big goes along as extra chunks). */
const FILE_SPEC = Object.freeze({ arrays: HISTORY_SPEC.arrays });

/** 0.7.1 71.24: an alignment's design speed and design class (untrusted: the project file) → { speed, unit 'km/h' | 'mph', cls } | null.
 *  Stored and written to IFC (Pset_RoadDesignCriteriaCommon); CivilCraft has no speed → radius table, so nothing is checked from it. */
export const SPEED_UNITS = ['km/h', 'mph'];
export function cleanDesign(o) {
  if (!o || typeof o !== 'object') return null;
  const speed = typeof o.speed === 'number' && Number.isFinite(o.speed) && o.speed > 0 && o.speed < 1000 ? o.speed : null;
  const cls = String(o.cls ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 60);
  if (speed === null && !cls) return null;
  return { ...(speed !== null ? { speed } : {}), unit: SPEED_UNITS.includes(o.unit) ? o.unit : 'km/h', ...(cls ? { cls } : {}) };
}

export function emptyState() {
  return {
    name: t('project.untitled'), units: 'ft',
    surface: { name: t('surface.eg'), groups: {}, breaklines: [], boundary: null, maxEdge: 0, tin: null, descKeys: [], lineCodes: cleanLineCodes() },   // 0.4 V16: descKeys, lineCodes
    display: { ...DISPLAY_DEFAULTS },
    alignments: [], pads: [], network: null, seq: 1, crs: null, features: [], parcels: [], masses: [], zoning: [],
    gis: { layers: [], maps: [] },   // GIS: vector layers (builder A) and map layers (builder C)
  };
}

/** 0.9 D9.6: the existing ground as a surface gridded by the chosen method (gridding.js); notes are words for the surface report. */
function gridEg(s, points, lines = [], boundary = null) {
  const report = { notes: [], errors: [] };
  const r = gridSurface(points, { method: s.method, step: s.gridStep || 0, power: s.gridPower, order: s.gridPower, abosQ: s.gridQ, abosAccuracy: s.gridAcc, lines: lines.map((l) => l.pts), boundary: boundary || null });
  if (r.error) { report.errors.push(t('cv.grid.err.' + r.error)); return { surface: null, report }; }
  const f = (v, d = 3) => (Number.isFinite(v) ? Number(v.toFixed(d)).toString() : '–');
  const aMeasure = /^(metric-|krigerr)/.test(s.method);   // a count or an error is not a height: nothing to compare with the points
  report.notes.push(aMeasure ? t('cv.grid.n.measure', { method: t('cv.grid.m.' + s.method), step: f(r.step, 2) })
    : t('cv.grid.n.used', { method: t('cv.grid.m.' + s.method), step: f(r.step, 2), n: r.residuals.n, rms: f(r.residuals.rms), max: f(r.residuals.max) }));
  for (const n of r.notes) {
    if (n.code === 'mincurv.iter') report.notes.push(t(n.converged ? 'cv.grid.n.mincurv' : 'cv.grid.n.mincurv.no', { n: n.n }));
    else if (n.code === 'kriging.variogram') report.notes.push(t('cv.grid.n.kriging', { range: f(n.range, 1), sill: f(n.sill) }));
    else if (n.code === 'abos.iter') report.notes.push(t(n.converged ? 'cv.grid.n.abos' : 'cv.grid.n.abos.no', { n: n.n, max: f(n.max), tol: f(n.tol), q: f(n.q, 2), acc: f(n.accuracy, 2), merged: n.merged }));
    else report.notes.push(t('cv.grid.n.' + n.code, { ...n, from: f(n.from, 2), to: f(n.to, 2) }));
  }
  const built = surfaceFromFaces({ pts: r.pts, faces: r.faces });
  report.notes.push(...built.report.notes); report.errors.push(...built.report.errors);
  return { surface: built.surface, report, grid: r.grid, sigma: r.sigma };
}

/** 0.11 (the cap lifted): `project.points` — the PointTable read as the array of point objects it replaced: an index gives a point object,
 *  everything else is the table's (length, iteration, filter, map, find, some, …). Writing an index is refused: edits go through editPointTable. */
const TABLE_OF = new WeakMap();
const INDEX = /^(?:0|[1-9]\d*)$/;
function pointView(t) {
  const bound = new Map();
  const v = new Proxy(t, {
    get(o, k) {
      if (typeof k === 'string' && INDEX.test(k)) return o.get(+k);
      const x = o[k];
      if (typeof x !== 'function') return x;
      let f = bound.get(k); if (!f) bound.set(k, (f = x.bind(o)));
      return f;
    },
    has(o, k) { return typeof k === 'string' && INDEX.test(k) ? +k < o.count : k in o; },
    set(o, k, val) { if (typeof k === 'string' && INDEX.test(k)) throw new TypeError('project.points: a point is changed through editPointTable'); o[k] = val; return true; },
  });
  TABLE_OF.set(v, t);
  return v;
}

/** 0.11: what editPointTable's callback edits with; each call is recorded (the rows it changed) so the step can be undone and redone. */
class PointEditor {
  constructor(t) { this.t = t; this.ops = []; }
  get table() { return this.t; }
  get length() { return this.t.count; }
  /** Append points (objects, or a PointTable). */
  add(points) { const frag = PointTable.from([]).append(points); if (!frag.count) return; const at = this.t.count; this.t.append(frag); this.ops.push({ k: 'add', at, frag }); }
  /** Put points in at row `at` (the rows from there on move along). */
  insert(at, points) {
    const frag = PointTable.from([]).append(points); if (!frag.count) return;
    if (at >= this.t.count) { this.add(frag); return; }
    const idx = Int32Array.from({ length: frag.count }, (_, i) => at + i);
    this.t.insertAt(idx, frag); this.ops.push({ k: 'ins', idx, frag });
  }
  /** Replace row i with point object p. */
  set(i, p) { if (!(i >= 0 && i < this.t.count)) throw new RangeError('no point ' + i); const before = this.t.get(i); this.t.setRow(i, p); this.ops.push({ k: 'set', i, before, after: this.t.get(i) }); }
  /** Remove these rows (indexes into the table as it is now; any order, repeats ignored). */
  remove(indexes) {
    const idx = Int32Array.from(new Set(indexes)).filter((i) => i >= 0 && i < this.t.count).sort();
    if (!idx.length) return 0;
    const frag = this.t.removeAt(idx); this.ops.push({ k: 'del', idx, frag });
    return idx.length;
  }
  /** Remove the rows fn(point, i) says yes to (each row read as a point object once). */
  /** Remove the rows whose name fn(name) says yes to (no point object made). */
  removeWhereName(fn) { return this.remove(this.t.indexesWhereName(fn)); }
  removeWhere(fn) { const idx = []; let i = 0; for (const b of this.t.blocks) for (let k = 0; k < b.n; k++, i++) if (fn(this.t.rowGet(b, k), i)) idx.push(i); return this.remove(idx); }
  /** Every point's x and y at once (xs, ys as long as the table): a move of all the points keeps the old coordinates, nothing else. */
  setXY(xs, ys) { const was = this.t.getXY(); this.t.setXY(xs, ys); this.ops.push({ k: 'xy', ox: was.xs, oy: was.ys, nx: Float64Array.from(xs), ny: Float64Array.from(ys) }); }
  revert() { replayPoints(this.t, this.ops, false); this.ops = []; }
  /** About how many bytes the record keeps. */
  bytes() { let n = 0; for (const o of this.ops) n += o.frag ? o.frag.bytes() + (o.idx ? o.idx.byteLength : 0) : o.k === 'xy' ? 4 * o.ox.byteLength : 400; return n; }
}
/** Apply a point step's records: redo = in order, undo = their inverses in reverse order. */
function replayPoints(t, ops, redo) {
  if (redo) {
    for (const o of ops) {
      if (o.k === 'add') t.append(o.frag);
      else if (o.k === 'set') t.setRow(o.i, o.after);
      else if (o.k === 'del') t.removeAt(o.idx);
      else if (o.k === 'ins') t.insertAt(o.idx, o.frag);
      else if (o.k === 'xy') t.setXY(o.nx, o.ny);
    }
  } else {
    for (let j = ops.length - 1; j >= 0; j--) {
      const o = ops[j];
      if (o.k === 'add') t.truncate(o.at);
      else if (o.k === 'set') t.setRow(o.i, o.before);
      else if (o.k === 'del') t.insertAt(o.idx, o.frag);
      else if (o.k === 'ins') t.removeAt(o.idx);
      else if (o.k === 'xy') t.setXY(o.ox, o.oy);
    }
  }
}

/** The project file text a journal copy (base + changes) holds: the app opens it like any file, so it is read and checked the same way. */
export function recoverText(rec) {
  const obj = recoverState(rec, FILE_SPEC), x = recoverExtras(rec);
  const points = [];
  if (x.has('x:pts:order')) {   // 0.11: blocks of the point table by id, in this order
    for (const uid of JSON.parse(x.get('x:pts:order'))) { const b = x.get('x:pb:' + uid); if (b === undefined) throw new Error('A block of points is missing.'); for (const r of JSON.parse(b)) points.push(r); }
  } else {   // a copy written before 0.11's point table: blocks of 5,000 by number
    const n = Number(x.get('x:pts:n') || 0);
    for (let i = 0; i < n; i++) { const b = x.get('x:pts:' + i); if (b === undefined) throw new Error('A block of points is missing.'); for (const r of JSON.parse(b)) points.push(r); }
  }
  obj.points = points; obj.gisFeatures = {}; obj.crsGrids = {}; obj.gisImages = {};
  for (const [k, v] of x) {
    if (k.startsWith('x:gis:')) obj.gisFeatures[k.slice(6)] = JSON.parse(v);
    else if (k.startsWith('x:grid:')) obj.crsGrids[k.slice(7)] = v;
    else if (k.startsWith('x:img:')) obj.gisImages[k.slice(6)] = v;
  }
  obj.saved = new Date().toISOString();
  return JSON.stringify(obj);
}

/**
 * 0.11 DC.27: Save for an older version (0.10 and before): the project file (toJSON) with every id above 2^31 - 1 numbered again
 * from the lowest free number and every reference rewritten (history/ids.js narrowIds), seq after the highest id, no formatVersion.
 * Throws when the ids do not fit. → a new object.
 */
export function olderCopy(file) {
  const { obj } = narrowIds(file, { limit: OLD_LIMIT });
  delete obj.formatVersion;
  obj.seq = Math.max(Number.isInteger(file.seq) && file.seq <= OLD_LIMIT ? file.seq : 1, maxOf(idNumbers(obj)) + 1);
  return obj;
}

export class Project {
  constructor() {
    this.h = new ChunkHistory({ spec: HISTORY_SPEC, limit: MAX_UNDO });   // the table of chunks the undo steps are made against
    this.state = emptyState();
    this._pts = new PointTable(); this._pts.owner = this; this._view = null;   // 0.11: the survey points (point-table.js); `points` reads them as the array they were
    this.pointsFile = '';
    this.pointsVersion = 0;
    this.gisFeatures = new Map(); this.gisVersion = 0;   // GIS: layer id → [{ g, p }], outside the snapshots
    this.crsGrids = new Map();   // 0.4 V11: grid shift files name → Uint8Array (crs.js loadGrid), outside the snapshots; state.crs.grid names the one in use
    this.idsTexts = idsTextStore();   // 0.7.1 71.25: IDS texts by hash, outside the snapshots (state.ids is { name, hash }; lead 2026-10-26)
    this.gisImages = new Map();   // GIS: map layer pictures 'img<n>' → data: URL (gis-map-ui.js), outside the snapshots (≤ 25 MB each)
    this.shell = {};   // 0.8 round 3: the shell's calc sheets and design reasons (shell-mount.js), outside the snapshots; saved as `shell`
    this.undoStack = []; this.redoStack = [];
    this.version = 0; this.saved = 0;
    this.cache = new Map();
    this.listeners = new Set();
  }
  on(f) { this.listeners.add(f); return () => this.listeners.delete(f); }
  emit(kind) { for (const f of this.listeners) f(kind); }
  get dirty() { return this.version !== this.saved; }
  /**
   * The undo steps. Emptying them (`undoStack = []`: a file was opened, the points were replaced, a Live snapshot came in) also starts the chunk table
   * again from the state as it is now, so whatever was put into the state without a step is the baseline, never part of the next step.
   */
  get undoStack() { return this._undo; }
  set undoStack(v) { this._undo = v; if (!v.length) this.h.reset(this._state); }
  /** The state. Putting a whole new one in starts the chunk table again from it. */
  get state() { return this._state; }
  set state(v) { this._state = v; this.h.reset(v); }
  /**
   * 0.11 (the cap lifted): the survey points. `pointTable` is the PointTable itself (typed arrays, point-table.js); `points` reads it as the
   * array of point objects it was (index, length, iteration, filter, map, find, …: fresh objects, never the same object twice). Putting an
   * array (or a table) in replaces the points, as before: not an undo step.
   */
  get pointTable() { return this._pts; }
  get points() { return this._view || (this._view = pointView(this._pts)); }
  set points(v) { this._setTable(v); }
  _setTable(v) {
    let t = (v && TABLE_OF.get(v)) || v;
    if (!(t instanceof PointTable)) t = PointTable.from(v || []);
    else if (t.owner && t.owner !== this) t = PointTable.from([]).append(t);   // another project's table: a copy of its own
    t.owner = this; this._pts = t; this._view = null;
  }

  // ---- edits ----
  // display settings are not undo steps: they stay as they are through undo/redo
  snapshot() { const { tin, ...surf } = this.state.surface; const { display, ...rest } = this.state; return JSON.stringify({ ...rest, surface: surf }); }
  restore(json) { const s = JSON.parse(json); s.surface.tin = this.state.surface.tin; s.display = this.state.display; this.state = s; }
  setDisplay(k, v) { if (this.state.display[k] === v) return; this.state.display[k] = v; this.touch('display'); }
  /** An undo step: `rec` the chunks the edit changed (before and after); `json` (live.js) the state's JSON before the step, for the newest step. */
  stepOf(label, rec, extra = {}) {
    const st = { label, rec, ...extra };
    Object.defineProperty(st, 'json', { configurable: true, get: () => this.beforeText(st) });
    return st;
  }
  beforeText(st) {
    const table = new Map(this.h.cur);
    if (st.rec) for (const [k, v] of st.rec.undo) { if (v === null) table.delete(k); else table.set(k, v); }
    return JSON.stringify(join(table, HISTORY_SPEC));
  }
  pushStep(st) {
    this.undoStack.push(st);
    if (this.undoStack.length > MAX_UNDO) this.undoStack.shift();
    this.redoStack = [];
  }
  change(label, fn, opts = {}) {
    let keys = this.hint(opts.keys);
    try { fn(this.state); } catch (e) { this.h.rollback(this.state); throw e; }   // 0.10: a throw half-way leaves no half edit behind
    if (keys) keys = this.grow(keys);
    if (keys && Project.verifyHints) this.verifyHint(keys, label);
    const rec = this.h.capture(this.state, keys ? { keys } : {});
    if (!rec) return false;
    const st = this.stepOf(label, rec);
    this.pushStep(st);
    if (this.idsTexts.size > 1) this.pruneIds();
    const v = this.version;
    this.touch('change');
    if (!keys || this.version !== v + 1) this.joinStep(st);   // a listener that changed the state says so with touch(): then the full look
    else if (Project.verifyHints) this.verifyHint([], 'listeners of ' + label);   // tests: nobody changed the state without saying so
    return true;
  }
  /**
   * 0.11 PERF.21: the chunk keys an edit of objects `ids` of the by-id list `list` changes IN PLACE (the objects keep their ids and the
   * list its members and order: a grip move, a property). When the list is not cut per object right now (its ids repeat) it is one chunk,
   * and that is named instead. A string that is already a chunk key ('k:network') is passed on as it is. Adds and deletes: listKeys().
   */
  keysOf(list, ...ids) {
    const out = [];
    const cut = !!list && this.h.cur.has('o:' + list);
    for (const id of ids.flat()) {
      if (id === null || id === undefined) continue;
      if (typeof id === 'string' && /^(?:[kxoe]:|#)/.test(id)) out.push(id);   // a chunk key as it is
      else if (cut) out.push('e:' + list + ':' + String(id));
    }
    if (list && !cut) out.push('k:' + list);
    return out;
  }
  /** keysOf() for an edit that also adds, deletes or reorders objects of `list`: its order chunk too (the objects that came or went are found from it). */
  listKeys(list, ...ids) { const k = this.keysOf(list, ...ids); if (this.h.cur.has('o:' + list)) k.push('o:' + list); return k; }
  /** The hint as change() uses it: always with the key list and `seq`; null = no hint (the full look). */
  hint(keys) { return Array.isArray(keys) && keys.length ? [...new Set([KEYS, 'k:seq', ...keys])] : null; }
  /** After the edit: a hinted list whose order chunk changed also names the objects that came or went (an add or a delete needs no id in the hint). */
  grow(keys) {
    const ord = keys.filter((k) => k.startsWith('o:'));
    if (!ord.length) return keys;
    const now = serializeKeys(this.state, HISTORY_SPEC, ord), out = new Set(keys);
    for (const [k, s] of now) {
      const was = this.h.cur.get(k);
      if (s === was) continue;
      const a = new Set(was ? JSON.parse(was) : []), b = new Set(s ? JSON.parse(s) : []), name = k.slice(2);
      for (const id of a) if (!b.has(id)) out.add('e:' + name + ':' + id);
      for (const id of b) if (!a.has(id)) out.add('e:' + name + ':' + id);
    }
    return [...out];
  }
  /** Tests (Project.verifyHints): a hinted step must find every chunk the full look finds. */
  verifyHint(keys, label) {
    const all = this.h.diff(this.state), got = this.h.diff(this.state, keys);
    const miss = [...all.set.keys(), ...all.del].filter((k) => !got.set.has(k) && !got.del.has(k));
    if (miss.length) throw new Error('history hint missed ' + miss.slice(0, 5).join(', ') + ' (' + label + ')');
  }
  /** What the listeners of 'change' altered (the landscape links follow their moved line, "inside the same undo step") joins the step that moved it. */
  joinStep(st) {
    const more = this.h.capture(this.state);
    if (!more) return;
    for (const [k, v] of more.undo) if (!st.rec.undo.has(k)) st.rec.undo.set(k, v);
    for (const [k, v] of more.redo) st.rec.redo.set(k, v);
    st.rec.bytes = (st.rec.bytes || 0) + (more.bytes || 0);
  }
  /** Every chunk string the steps hold (what an undo or redo could bring back). */
  stepStrings() {
    const out = [];
    for (const st of [...this.undoStack, ...this.redoStack]) if (st.rec) { for (const v of st.rec.undo.values()) if (v) out.push(v); for (const v of st.rec.redo.values()) if (v) out.push(v); }
    return out;
  }
  /** 0.7.1 71.25: IDS texts no state and no undo / redo snapshot refers to any more are let go; idsText() = the one in use. */
  pruneIds() { const refs = [JSON.stringify(this.state.ids || null), ...this.stepStrings()]; this.idsTexts.prune((h) => refs.some((r) => r.includes(h))); }
  idsText() { return this.state.ids ? this.idsTexts.get(this.state.ids.hash) : null; }
  /**
   * Points are held outside the JSON snapshots (they can be millions). The old form: `fn(pts, state)` gets a copy of the points as an array and
   * returns the new array; the step keeps the whole table it replaced. Kept for callers that have not moved to editPointTable (add-ons, tests).
   */
  editPoints(label, fn, opts = {}) {
    let keys = opts.keys ? this.hint(['k:surface', ...opts.keys]) : null;   // 0.11 PERF.21: the groups live in k:surface
    const arr = this._pts.toArray();
    const next = fn(arr.slice(), this.state);
    if (!Array.isArray(next)) { this.h.rollback(this.state); return false; }
    // 0.11: the step still records only what changed: the rows from the first one the callback changed to the last one (the points before and
    // after it are the same objects it was handed, or equal ones)
    const same = (a, b) => { if (a === b) return true; if (!a || !b || typeof b !== 'object') return false; const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every((k, i) => k === kb[i] && a[k] === b[k]); };
    const n0 = arr.length, n1 = next.length;
    let p = 0; while (p < n0 && p < n1 && same(arr[p], next[p])) p++;
    let q = 0; while (q < n0 - p && q < n1 - p && same(arr[n0 - 1 - q], next[n1 - 1 - q])) q++;
    const ed = new PointEditor(this._pts);
    if (n0 - q > p) ed.remove(Array.from({ length: n0 - q - p }, (_, i) => p + i));
    if (n1 - q > p) ed.insert(p, next.slice(p, n1 - q));
    this.addGroups();
    this.pointsVersion++;
    if (keys) keys = this.grow(keys);
    if (keys && Project.verifyHints) this.verifyHint(keys, label);
    this.pushStep(this.stepOf(label, this.h.capture(this.state, keys ? { keys } : {}), { prec: { ops: ed.ops, bytes: ed.bytes() } }));
    this.touch('change');
    return true;
  }
  /**
   * 0.11 (the cap lifted): one undo step that changes the survey points IN PLACE through an editor, and records only what changed (the rows
   * added, removed or replaced; a move of every point keeps the old x and y), never a copy of all the points.
   *   p.editPointTable(label, (ed, state) => { ed.add(points); ed.set(i, point); ed.remove(indexes); ed.removeWhere((p, i) => …); ed.setXY(xs, ys); })
   * The callback may change the state too (same step); returning false or null cancels everything it did. `opts.keys` as editPoints.
   */
  editPointTable(label, fn, opts = {}) {
    let keys = opts.keys ? this.hint(['k:surface', ...opts.keys]) : null;
    const ed = new PointEditor(this._pts);
    let r;
    try { r = fn(ed, this.state); } catch (e) { ed.revert(); this.h.rollback(this.state); if (ed.ops.length) this.pointsVersion++; throw e; }
    if (r === false || r === null) { ed.revert(); this.h.rollback(this.state); if (ed.ops.length) this.pointsVersion++; return false; }
    this.addGroups();
    this.pointsVersion++;
    if (keys) keys = this.grow(keys);
    if (keys && Project.verifyHints) this.verifyHint(keys, label);
    this.pushStep(this.stepOf(label, this.h.capture(this.state, keys ? { keys } : {}), { prec: { ops: ed.ops, bytes: ed.bytes() } }));
    this.touch('change');
    return true;
  }
  /** New description groups (an edit brought points of a group the surface has no use for yet) get their default use, as before. */
  addGroups() { const g = this.state.surface.groups; for (const key of [...this.groupKeys()].sort((a, b) => a.localeCompare(b))) if (!(key in g)) g[key] = this.defaultUse(key); }   // in pointGroups' order (sorted), as before
  /** The groups the points are in, as a Set (one look at each description in the dictionary, not one per point). */
  groupKeys() { return new Set(this.groupCounts().keys()); }
  /** group → number of points, in no particular order (pointGroups sorts). */
  groupCounts() {
    const t = this._pts, keyOf = this.keyOf(), n = new Float64Array(t.dict.length), out = new Map();
    for (const b of t.blocks) for (let k = 0; k < b.n; k++) if (!(b.irr && b.irr.has(k))) n[b.d[k]]++;
    for (let c = 0; c < n.length; c++) if (n[c]) { const key = keyOf({ d: t.dict[c] }); out.set(key, (out.get(key) || 0) + n[c]); }
    for (const b of t.blocks) if (b.irr) for (const o of b.irr.values()) { const key = keyOf(o); out.set(key, (out.get(key) || 0) + 1); }
    return out;
  }
  /** GIS: one undo step that changes GIS layer features (and, through `s`, the state — e.g. state.gis.layers or
   *  state.crs). fn gets a copy of the Map and returns the new Map; feature arrays are never changed in place. */
  editGis(label, fn) {
    const was = this.gisFeatures;
    const next = fn(new Map(was), this.state);
    if (!(next instanceof Map)) { this.h.rollback(this.state); return false; }
    this.gisFeatures = next;
    this.gisVersion++;
    this.pushStep(this.stepOf(label, this.h.capture(this.state), { gis: was }));
    this.touch('change');
    return true;
  }
  /** 0.4 V9: replace the surface's TIN (a grid surface, or null = build from the points again) as ONE undo step that keeps
   *  the TIN it replaced (TINs stay out of the history: they can be millions of triangles). `fn(state)` may change
   *  more in the same step (e.g. the coordinate system). */
  setTin(label, tin, fn = null) {
    const was = this.state.surface.tin;
    if (fn) fn(this.state);
    this.state.surface.tin = tin;
    this.pushStep(this.stepOf(label, this.h.capture(this.state), { tin: was, tinSet: true }));
    this.cache.clear();
    this.touch('change');
    return true;
  }
  step(from, to, kind) {
    const u = from.pop(); if (!u) return null;
    const redoing = from === this.redoStack;
    to.push(this.stepOf(u.label, u.rec, { pts: u.pts ? this._pts : undefined, prec: u.prec, gis: u.gis ? this.gisFeatures : undefined, ...(u.tinSet ? { tin: this.state.surface.tin, tinSet: true } : {}) }));
    if (u.rec) this.h.restore(this.state, redoing ? u.rec.redo : u.rec.undo);
    if (u.tinSet) { this.state.surface.tin = u.tin; this.cache.clear(); }   // 0.4 V9
    if (u.pts) { this._pts = u.pts; this._view = null; this.pointsVersion++; }
    if (u.prec) { replayPoints(this._pts, u.prec.ops, redoing); this.pointsVersion++; }   // 0.11: the rows the step changed, back or again
    if (u.gis) { this.gisFeatures = u.gis; this.gisVersion++; }
    this.touch(kind);
    return u.label;
  }
  undo() { return this.step(this.undoStack, this.redoStack, 'undo'); }
  redo() { return this.step(this.redoStack, this.undoStack, 'redo'); }
  touch(kind) { this.version++; this.emit(kind); }
  nextId(prefix) { const n = nextNumber(this.state.seq || 1, this); this.state.seq = n + 1; return prefix + n; }   // 0.11 DC.27: past its tag's last number, a new tag
  /** 0.11 DC.27: a file was opened: this session hands out its new ids from a random tag of its own (history/ids.js), so two people
   *  adding to the same project do not make the same id. `seq` is the next number (every module that takes one, nextId or
   *  takeNumber(s), gets it from the tag); the raise is not an undo step. */
  takeIdBlock() {
    const s = this.state;
    s.seq = openBlock(this, s.seq || 1, idNumbers(s));
    this.h.sync(s, { keys: ['k:seq'] });
    return s.seq;
  }

  setPoints(points, file = '') {
    this._setTable(points);
    this.pointsFile = file;
    this.pointsVersion++;
    // new description codes default to "points"; FL-like codes are left to the user
    const g = this.state.surface.groups, now = this.groupKeys();
    for (const k of Object.keys(g)) if (!now.has(k)) delete g[k];
    for (const key of [...now].sort((a, b) => a.localeCompare(b))) if (!(key in g)) g[key] = this.defaultUse(key);
    this.undoStack = []; this.redoStack = [];
    this.touch('points');
  }
  groups() { return [...this.groupCounts()].map(([key, count]) => ({ key, count })).sort((a, b) => a.key.localeCompare(b.key)).map((g) => ({ ...g, use: this.state.surface.groups[g.key] || 'points' })); }   // = pointGroups(points, keyOf), counted by description
  /** 0.4 V16: point → its group, through the description keys (the first word of the description without a key). */
  keyOf() { const k = this.state.surface.descKeys || []; return this.memo('keyOf', JSON.stringify(k), () => grouper(k)); }
  /** 0.4 V16: set the description keys and line codes as ONE undo step: groups no point is in any more are dropped, new
   *  ones start with their key's use (else Points); groups that stay keep the use the user gave them. */
  setCoding(keys, lineCodes, label = t('codes.undo')) {
    return this.change(label, (s) => {
      s.surface.descKeys = cleanDescKeys(keys);
      s.surface.lineCodes = cleanLineCodes(lineCodes);
      const keyOf = grouper(s.surface.descKeys), g = s.surface.groups, t = this._pts, now = new Set();
      { const seen = new Uint8Array(t.dict.length);   // = new Set(points.map(keyOf)): the groups in the order the points first name them
        for (const b of t.blocks) for (let k = 0; k < b.n; k++) { const o = b.irr && b.irr.get(k); if (o) now.add(keyOf(o)); else if (!seen[b.d[k]]) { seen[b.d[k]] = 1; now.add(keyOf({ d: t.dict[b.d[k]] })); } } }
      for (const k of Object.keys(g)) if (!now.has(k)) delete g[k];
      for (const k of now) if (!(k in g)) { const d = s.surface.descKeys.find((x) => (x.group || x.code) === k && x.use); g[k] = d ? d.use : 'points'; }
    });
  }
  /** A new group's use: the first description key naming that group with a use, else 'points'. */
  defaultUse(group) { const k = (this.state.surface.descKeys || []).find((x) => (x.group || x.code) === group && x.use); return k ? k.use : 'points'; }
  /** 0.4 V16: the lines that line codes make (all groups, or `only`) — see desckeys.js figures(). */
  /** `coded` (0.11): only the figures a line code shapes (f.coded), = figures().filter((f) => f.coded). Only the points of the codes asked for are
   *  made into objects (a figure is made from its own code's points alone), so 10 million points of one plain code cost a look at the dictionary. */
  figures(only = null, { coded = false } = {}) {
    const s = this.state.surface, keys = s.descKeys || [], lineCodes = s.lineCodes || cleanLineCodes();
    return this.memo('fig:' + (only ? [...only].join('|') : '*') + (coded ? ':coded' : ''), this.pointsVersion + '|' + JSON.stringify([s.descKeys, s.lineCodes]), () => {
      const t = this._pts, groupOf = grouper(keys), info = new Array(t.dict.length);
      const of = (d) => { const q = parseDesc(d, lineCodes); return { code: q.code, ctrl: q.ctrl, g: q.code ? groupOf({ d }) : null }; };
      const at = (c) => info[c] || (info[c] = of(t.dict[c]));
      let codedSet = null;
      if (coded) {
        codedSet = new Set();
        for (const b of t.blocks) for (let k = 0; k < b.n; k++) {
          const o = b.irr && b.irr.get(k);
          const q = o ? (o.z !== null ? of(o.d) : null) : b.z[k] === b.z[k] ? at(b.d[k]) : null;
          if (q && q.code && q.ctrl) codedSet.add(q.code);
        }
        if (!codedSet.size) return [];
      }
      const keep = (q) => q.code && (!only || only.has(q.g)) && (!codedSet || codedSet.has(q.code));
      const pts = [];
      for (const b of t.blocks) for (let k = 0; k < b.n; k++) {
        const o = b.irr && b.irr.get(k);
        if (o) { if (o.z !== null && keep(of(o.d))) pts.push({ ...o }); } else if (b.z[k] === b.z[k] && keep(at(b.d[k]))) pts.push(t.rowGet(b, k));
      }
      const out = figures(pts, { keys, lineCodes, only });
      return coded ? out.filter((f) => f.coded) : out;
    });
  }

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
  egPoints() { const out = []; this.egRows((t, b, k, o) => out.push(o ? { ...o } : t.rowGet(b, k))); return out; }
  /** The rows egPoints() makes objects of, in order: fn(table, block, row, object kept whole | undefined). A point with an elevation whose group is used as points. */
  egRows(fn) {
    const g = this.state.surface.groups, keyOf = this.keyOf(), t = this._pts, use = new Int8Array(t.dict.length);   // per description: 1 points, -1 not
    for (const b of t.blocks) for (let k = 0; k < b.n; k++) {
      const o = b.irr && b.irr.get(k);
      if (o) { if (o.z !== null && (g[keyOf(o)] || 'points') === 'points') fn(t, b, k, o); continue; }
      if (b.z[k] !== b.z[k]) continue;
      const c = b.d[k]; let u = use[c];
      if (!u) u = use[c] = (g[keyOf({ d: t.dict[c] })] || 'points') === 'points' ? 1 : -1;
      if (u > 0) fn(t, b, k);
    }
  }
  /** egPoints() as three Float64Arrays (x, y, z), with no point object made: what the open Worker triangulates. */
  egColumns() {
    let n = 0; this.egRows(() => { n++; });
    const xs = new Float64Array(n), ys = new Float64Array(n), zs = new Float64Array(n);
    let i = 0;
    this.egRows((t, b, k, o) => { if (o) { xs[i] = o.x; ys[i] = o.y; zs[i] = o.z; } else { xs[i] = b.x[k]; ys[i] = b.y[k]; zs[i] = b.z[k]; } i++; });
    return { xs, ys, zs, n };
  }
  eg() {
    const deps = this.surfaceDeps(), c = this.cache.get('eg');
    if (c && c.deps !== deps && Project.bigEg && !this.state.surface.tin && this._pts.length >= BIG_EG && this._noOffPage !== deps) {   // 0.11: a big rebuild runs off the page; the surface shown until then is the one before
      const r = Project.bigEg(this, deps, c.value.rebuilding ? c.value : c.value);
      if (r) { this._staleSurface = r.surface; return r; }
    }
    this._staleSurface = undefined;
    return this.memo('eg', deps, () => {
      const s = this.state.surface;
      if (s.tin) return surfaceFromFaces(s.tin);
      if (!this._pts.length && !s.breaklines.length && !(this.state.features || []).some((f) => f.use === 'eg')) return { surface: null, report: { notes: [], errors: [] } };
      if (s.method && s.method !== 'tin') return gridEg(s, this.egPoints(), this.egBreaklines(), s.boundary);   // 0.9 D9.6
      if (s.flatFix > 0) { const g = buildGround({ points: this.egPoints(), breaklines: this.egBreaklines(), boundary: s.boundary, maxEdge: Number(s.maxEdge) || 0, fixFlat: true, interval: s.flatFix }); return { surface: g.surface, report: g.report }; }   // 0.8 SU.911
      return buildSurface({ points: this.egPoints(), breaklines: this.egBreaklines(), boundary: s.boundary, maxEdge: Number(s.maxEdge) || 0 });
    });
  }
  contours(surface = this.eg().surface, tag = 'eg') {
    const d = this.state.display;
    if (!surface) return [];
    if (surface && surface === this._staleSurface) { const c = this.cache.get('contours:' + tag); if (c) return c.value; }   // 0.11: while a big surface is rebuilt off the page, its contours as they were
    return this.memo('contours:' + tag, this.surfaceDeps() + '|' + this.padsDeps(tag) + '|' + d.interval + '|' + (d.smooth || ''), () => this.contoursOf(surface));
  }
  /** 0.9.1: a surface's contours at the display interval, smoothed as the display says (contour-smooth.js); every screen, plot and export reads these. */
  contoursOf(surface) {
    const d = this.state.display;
    return (surface && smoothContours(surface, Number(d.interval) || 1, { level: d.smooth })) || [];
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
    const on = this.state.alignments.filter((a) => a.corridor?.on || (a.corridors || []).some((c) => c.on));
    // 0.6 WL.25: a corridor that targets a feature line depends on that line, whatever its use (0.9: template targets too)
    const tf = new Set(this.corridorEntries().flatMap((e) => allTargets(e.c)).filter((g) => g.from.kind === 'feature').map((g) => g.from.id));
    const tpl = on.some((a) => [a.corridor, ...(a.corridors || [])].some((c) => c?.regions)) ? this.state.templates || [] : [];   // 0.9 SU.1110
    return JSON.stringify([this.state.pads, on, (this.state.features || []).filter((f) => f.use === 'design' || tf.has(f.id)), tpl]) + lsGradeDeps(this.state.landscape);   // 0.7 LD.3
  }
  /** 0.9: every corridor that is on, in alignment order: the alignment's own (id = key = its id) then its other corridors (cr<n>);
   *  corridorOrder() returns these entries (id as before, so callers reading order[i].id are unchanged). */
  corridorEntries() {
    const out = [];
    for (const a of this.state.alignments) {
      if (a.corridor?.on) out.push({ id: a.id, key: a.id, a, c: a.corridor, main: true });
      for (const c of a.corridors || []) if (c.on) out.push({ id: c.id, key: c.id, a, c, main: false });
    }
    return out;
  }
  /** 0.9 SU.1110: the project's templates by id (the corridor's and the terrain templates' lookup). */
  templateMap() { return new Map((this.state.templates || []).map((x) => [x.id, x])); }
  /** 0.6 WL.25: the corridors in an order where every corridor comes after the corridors it targets; a target that would
   *  close a loop is marked { loop: true } (index per alignment id). */
  corridorOrder() {
    const on = this.corridorEntries(), byKey = new Map(on.map((e) => [e.key, e]));
    const order = [], mark = new Map(), loops = new Map();
    const jn = this.junctions().roads;   // 0.10.1 #1977: a road is graded after the road it joins
    const visit = (e) => {
      if (mark.get(e.key) === 2) return;
      mark.set(e.key, 1);
      for (const j of jn) if (j.minor === e.key) { const b = byKey.get(j.major); if (b && mark.get(b.key) !== 1 && b.key !== e.key) visit(b); }
      allTargets(e.c).forEach((g, i) => {
        if (g.from.kind !== 'corridor') return;
        const b = byKey.get(g.from.id);
        if (!b) return;
        if (mark.get(b.key) === 1 || b.key === e.key) { if (!loops.has(e.key)) loops.set(e.key, new Set()); loops.get(e.key).add(i); return; }
        visit(b);
      });
      mark.set(e.key, 2);
      order.push(e);
    };
    for (const e of on) visit(e);
    return { order, loops };
  }
  /**
   * 0.10.1 #1977 (junction.js): where the corridors meet each other and the pads, from the plan alone (the alignments, each
   * corridor's station range and its assembly's widths): { roads: findJunctions(…), pads: [{ road (key), pad (id), end }] }.
   * A corridor with `join: false` ("Join roads and pads it meets" off) takes no part, as the minor or the major road; tracks
   * never do.
   */
  junctions() {
    const es = this.corridorEntries().filter((e) => e.c.join !== false && !e.a.rail?.on);
    const dep = JSON.stringify(es.map((e) => [e.key, e.a.pis, e.a.start, e.c.from, e.c.to, e.c.lane, e.c.shoulder, e.c.parts, !!e.c.regions])) + '|' + JSON.stringify(this.state.pads.map((p) => [p.id, p.pts]));
    return this.memo('junctions', this.state.units + dep, () => {
      const units = this.state.units, roads = [];
      for (const e of es) {
        const al = this.alignment(e.a);
        if (!al?.ok) continue;
        roads.push({ key: e.key, alId: e.a.id, al, from: Math.max(al.start, Number.isFinite(e.c.from) ? e.c.from : al.start), to: Math.min(al.end, Number.isFinite(e.c.to) ? e.c.to : al.end), w: nominalWidths({ ...defaultAssembly(units), ...e.c }, units) });
      }
      const pads = [];
      for (const r of roads) for (const h of padEnds(r, this.state.pads.filter((p) => p.pts.length >= 3), { units })) pads.push({ road: r.key, ...h });
      return { roads: findJunctions(roads, { units }), pads };
    });
  }
  /** The items graded into the existing ground, in order: corridors first, then pads. */
  gradeItems() {
    const items = [];
    // 0.6 WL.25: corridors in target order; each one's lines are kept as it is graded, so a corridor targeting another's
    // edge reads that edge as it is now (it moves when the other corridor changes)
    const { order, loops } = this.corridorOrder(), done = new Map(), T = this.templateMap();
    const jn = this.junctions(), byKeyAll = new Map(order.map((x) => [x.key, x]));   // 0.10.1 #1977
    for (const e of order) {
      const a = e.a, c = e.c;
      const al = this.alignment(a), prof = this.designProfile(a), asm = { ...defaultAssembly(this.state.units), ...c, ...this.railAsm(a) };   // railAsm: 0.7.1 71.26
      const lineOf = (f) => {   // a target's line now: a feature line, or another corridor's line as graded so far
        if (f.kind === 'feature') { const x = (this.state.features || []).find((y) => y.id === f.id); return x ? flattenFeature(x) : null; }
        return done.get(f.id)?.lines?.[f.line] || null;
      };
      const resolve = () => (c.targets || []).map((g, i) => {
        if (g.from.kind === 'feature') {
          const f = (this.state.features || []).find((x) => x.id === g.from.id);
          return { ...g, line: f ? flattenFeature(f) : null, label: f ? f.name : t('corr.tg.gone') };
        }
        const b = this.state.alignments.find((x) => x.id === g.from.id);
        const label = b ? t('corr.tg.of', { name: b.name, line: t('corr.line.' + g.from.line.toLowerCase()) }) : t('corr.tg.gone');
        if (loops.get(e.key)?.has(i)) return { ...g, line: null, label, loop: true };
        return { ...g, line: done.get(g.from.id)?.lines?.[g.from.line] || null, label };
      });
      // 0.9 SU.1110: the regions with each use's target lines resolved, and the templates they name
      const withLines = (u) => (u?.targets ? { ...u, lines: Object.fromEntries(Object.entries(u.targets).map(([k, f]) => [k, lineOf(f)])) } : u);
      const regions = c.regions ? c.regions.map((r) => ({ from: r.from, L: { uses: r.L.uses.map(withLines), end: withLines(r.L.end) }, R: { uses: r.R.uses.map(withLines), end: withLines(r.R.end) } })) : null;
      const name = e.main ? t('project.corridor', { name: a.name }) : t('tpl.corr.name', { name: a.name, corridor: c.name });
      // 0.10.1 #1977: what this corridor joins (a road graded before it, a pad its end reaches) and where its own side opens
      const openings = jn.roads.filter((j) => j.major === e.key).flatMap((j) => j.openings);
      const tiesFor = (surf) => {
        const out = [];
        for (const j of jn.roads) {
          if (j.minor !== e.key) continue;
          const info = done.get(j.major), other = byKeyAll.get(j.major), body = info && bodyOf(info);
          if (!body || !other) continue;
          const zr = roadZAt(info, this.alignment(other.a)), zs = (x, y) => zr(x, y) ?? surf.elevationAt(x, y, 1e-6);
          out.push({ kind: 'road', id: j.major, name: other.a.name, end: j.end, inside: (x, y) => pointInPoly(x, y, body.poly), zAt: zs, lines: body.lines });
        }
        for (const h of jn.pads) {
          if (h.road !== e.key) continue;
          const pad = this.state.pads.find((p) => p.id === h.pad);
          if (!pad || !Number.isFinite(Number(pad.z))) continue;
          out.push({ kind: 'pad', id: pad.id, name: pad.name || '', end: h.end, inside: (x, y) => pointInPoly(x, y, pad.pts), zAt: padZAt(pad), lines: [[...pad.pts, pad.pts[0]]] });
        }
        return out;
      };
      items.push({ id: e.key, alignment: a.id, kind: 'corridor', name, patch: (surf) => {
        const r = corridorPatch(surf, al, prof, regions ? { ...asm, regions, templates: T } : asm, { targets: resolve(), units: this.state.units, ties: tiesFor(surf), openings });
        done.set(e.key, r.info);
        return r;
      } });
    }
    for (const f of this.state.features || []) { const it = featureItem(f); if (it) items.push(it); }   // 0.4 V14: closed design feature lines
    for (const p of this.state.pads) if (p.pts.length >= 3) items.push({ ...p, kind: 'pad', z: Number(p.z), cut: Number(p.cut), fill: Number(p.fill), about: { kind: 'pad', id: p.id } });
    items.push(...lsGradeItems(this.state.landscape, this.state.units, { roads: () => [...done.values()].map((info) => bodyOf(info)).filter(Boolean) }));   // 0.7 LD.3: the Landscape workspace's grading, last (0.10.1 #1977: a path stops at the roads built by then)
    // 0.10.1 #1970: open design feature lines are breaklines of the proposed surface, laid in after everything else (inside a pad
    // or platform they shape its interior)
    for (const f of this.state.features || []) { const it = breaklineItem(f); if (it) items.push(it); }
    return items;
  }
  /** SU.1815: the alignments as plain polylines: the streets a parking lot's aisles must reach (lib/landscape street.js). */
  streetLines() {
    return this.memo('streetLines', JSON.stringify(this.state.alignments || []), () => (this.state.alignments || []).map((a) => { const al = this.alignment(a); return al?.ok ? alignmentPath(al) : null; }).filter((p) => p && p.length >= 2));
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
      return { ...r, items: r.items.map((d, i) => ({ id: items[i].id, kind: items[i].kind, name: items[i].name, ...(items[i].alignment ? { alignment: items[i].alignment } : {}), problems: r.report.items[i].problems, region: r.regions[i], ...d })) };
    });
  }
  /**
   * 0.7.1 71.19 (owner 2026-10-26): with no existing ground a corridor cannot be graded in, so it is built on a FLAT STAND-IN
   * ground instead and drawn as provisional (3D view, the corridor's Properties). Nothing else uses it: no volumes, sections
   * or graded surface come from made-up ground. The stand-in's elevation: the mean of the design profile's PVIs; without a
   * design profile the road itself is laid level at elevation 0 on ground at 0. Each result carries `warnings` in DetailCraft's
   * problem shape { text, hard (false = a warning), ref (the alignment id) } + `code` 'corridor.standin', `z`, `basis`
   * ('profile' | 'zero') — the first case of a shared warnings list later.
   *   p.standInCorridors() → [{ id, kind: 'corridor', name, problems, sections, lines, from, to, warnings, standIn: { z, basis } }]
   */
  standInCorridors() {
    if (this.eg().surface) return [];
    return this.memo('standin', this.gradeDeps() + '|' + JSON.stringify(this.state.alignments.map((a) => [a.id, a.pis, a.start, a.pvis])), () => {
      const out = [], m = this.state.units === 'm';
      const byId = new Map(this.gradeItems().filter((x) => x.kind === 'corridor').map((x) => [x.id, x]));
      for (const { id, alignment } of [...byId.values()]) {
        const a = this.state.alignments.find((x) => x.id === (alignment || id)), al = this.alignment(a);
        if (!al?.ok) continue;
        let prof = this.designProfile(a), basis = 'profile', z;
        if (prof.ok && (a.pvis || []).length >= 2) z = Math.round((a.pvis.reduce((v, q) => v + q.z, 0) / a.pvis.length) * 100) / 100;
        else { basis = 'zero'; z = 0; prof = buildProfile([{ sta: al.start, z: 0 }, { sta: al.end, z: 0 }]); }
        // flat ground under the alignment, wide enough for its daylight (the profile's rise and fall at the flattest slope)
        const pl = al.polyline(Math.max(al.length / 200, 1));
        const zs = basis === 'profile' ? a.pvis.map((q) => q.z) : [0], dz = Math.max(...zs) - Math.min(...zs);
        const pad = (m ? 60 : 200) + 6 * dz;
        const x0 = Math.min(...pl.map((q) => q.x)) - pad, x1 = Math.max(...pl.map((q) => q.x)) + pad, y0 = Math.min(...pl.map((q) => q.y)) - pad, y1 = Math.max(...pl.map((q) => q.y)) + pad;
        const pts = []; for (const x of [x0, (x0 + x1) / 2, x1]) for (const y of [y0, (y0 + y1) / 2, y1]) pts.push({ x, y, z });
        const flat = buildSurface({ points: pts }).surface;
        if (!flat) continue;
        const cc = id === a.id ? a.corridor : (a.corridors || []).find((x) => x.id === id);   // 0.9: another corridor on the alignment
        const reg = cc?.regions ? { regions: cc.regions, templates: this.templateMap() } : {};
        const asm = { ...defaultAssembly(this.state.units), ...cc, ...this.railAsm(a), ...reg };   // railAsm: 0.7.1 71.26
        const r = basis === 'profile' ? byId.get(id).patch(flat) : corridorPatch(flat, al, prof, asm, { units: this.state.units });
        const text = t(basis === 'profile' ? 'corr.standin' : 'corr.standin.zero', { z: z.toFixed(2), unit: m ? 'm' : 'ft' });
        out.push({ id, ...(alignment ? { alignment } : {}), kind: 'corridor', name: byId.get(id).name, problems: r.problems, ...r.info, standIn: { z, basis }, warnings: [{ code: 'corridor.standin', text, hard: false, ref: id, z, basis }] });
      }
      return out;
    });
  }
  /** 0.7.1 71.26: an alignment's rail settings as the corridor takes them ({ rail } or {}): the speeds in km/h from its design speed
   *  (71.24 `design`) and the slowest trains' speed (rail.minSpeed, in the same unit). */
  railAsm(a) {
    if (!a?.rail?.on) return {};
    const unit = a.design?.unit || (this.state.units === 'm' ? 'km/h' : 'mph');
    return { rail: { ...a.rail, speed: railKmh(a.design?.speed, unit), minSpeed: railKmh(a.rail.minSpeed, unit), id: a.id, name: a.name } };
  }
  /** 0.7.1 71.26: the alignment's cant plan and its warnings (rail.js cantPlan), with or without a corridor; null when not a track. */
  railPlan(a) {
    if (!a?.rail?.on) return null;
    const al = this.alignment(a);
    if (!al.ok) return null;
    return this.memo('rail:' + a.id, JSON.stringify([a.pis, a.start, a.rail, a.design, a.name, this.state.units]), () => {
      const r = this.railAsm(a).rail;
      return cantPlan(al, r, { speed: r.speed, minSpeed: r.minSpeed, units: this.state.units, id: a.id, name: a.name });
    });
  }
  /** 0.7.1 71.26: every track's warnings, for the Problems panel: [{ id, name, warnings }]. */
  railWarnings() { return this.state.alignments.filter((a) => a.rail?.on).map((a) => ({ id: a.id, name: a.name, warnings: [...(this.railPlan(a)?.warnings || []), ...(this.railChecks(a)?.warnings || []), ...this.railTurnoutWarnings(a), ...(this.railClearance(a)?.warnings || [])] })); }
  /** CV.1 2026-11-12: the track geometry checks beside the cant (rail-checks.js): grades, vertical curves, short arcs and straights,
   *  the rate of change of cant deficiency. null when not a track. */
  railChecks(a) {
    if (!a?.rail?.on) return null;
    const al = this.alignment(a); if (!al.ok) return null;
    return this.memo('railchk:' + a.id, JSON.stringify([a.pis, a.start, a.pvis, a.rail, a.design, a.name, this.state.units]), () => {
      const r = this.railAsm(a).rail;
      return trackChecks(al, a.pvis?.length >= 2 ? this.designProfile(a) : null, r, { speed: r.speed, units: this.state.units, id: a.id, name: a.name, plan: this.railPlan(a) });
    });
  }
  /** CV.1 2026-11-12: the turnouts and crossovers placed on this alignment (geo.turnouts with `alignment` = its id), in project
   *  coordinates (rail-turnouts.js placeTurnout); [] when none. Any alignment may carry them; the checks run for railways. */
  railTurnouts(a) {
    const list = (this.state.geo?.turnouts || []).filter((x) => x.alignment === a?.id);
    if (!a || !list.length) return [];
    const al = this.alignment(a); if (!al.ok) return [];
    return this.memo('railtu:' + a.id, JSON.stringify([a.pis, a.start, a.rail, list, this.state.units]), () => placeAll(al, list, a.id, { units: this.state.units, rail: a.rail?.on ? a.rail : null }));
  }
  railTurnoutWarnings(a) {
    const placed = this.railTurnouts(a); if (!placed.length) return [];
    const r = this.railAsm(a).rail;
    return turnoutChecks(this.alignment(a), a.pvis?.length >= 2 ? this.designProfile(a) : null, this.railPlan(a), placed, { id: a.id, name: a.name, speed: r?.speed || null });
  }
  /** Every placed turnout of the project (the plan, the 3D view, exports): [{ alignment: a, placed }]. */
  allTurnouts() { return this.state.alignments.map((a) => ({ alignment: a, placed: this.railTurnouts(a) })).filter((x) => x.placed.length); }
  /** CV.1 2026-11-12: the clearance envelope swept along a railway (rail-clearance.js) and what it meets: feature lines, pipe
   *  structures, the other railway alignments (centre lines widened by their own envelope), this line's own tracks and a platform
   *  edge. → { rows, warnings, hits, spacing, platform } | null (not a railway, or the envelope is off). */
  railClearance(a) {
    const cl = a?.rail?.on && a.rail.clearance?.on ? a.rail.clearance : null; if (!cl) return null;
    const al = this.alignment(a); if (!al.ok) return null;
    const U = this.state.units, others = this.state.alignments.filter((x) => x.id !== a.id && x.rail?.on);
    const net = this.state.network, feats = this.state.features || [];
    return this.memo('railclr:' + a.id, JSON.stringify([a.pis, a.start, a.pvis, a.rail, a.design, a.name, U, feats.map((f) => [f.id, f.pts]), net?.structures?.map((s) => [s.id, s.x, s.y, s.rim]), others.map((x) => [x.id, x.pis, x.start, x.rail])]), () => {
      const plan = this.railPlan(a), rail = a.rail, n = rail.tracks || 1, tracks = Array.from({ length: n }, (_, k) => (k - (n - 1) / 2) * rail.centres);
      const sw = (al2, r2, cl2, plan2, tr2) => clearanceSweep(al2, cl2, { units: U, base: railBaseOf(r2), cantAt: (s) => cantAtPlan(plan2, s), curvatureAt: (s) => curvatureAt(al2, s), tracks: tr2 });
      const rows = sw(al, rail, cl, plan, tracks);
      const prof = a.pvis?.length >= 2 ? this.designProfile(a) : null;
      const obstacles = [
        ...feats.filter((f) => f.pts?.length).map((f) => ({ id: f.id, name: f.name, kind: 'feature', pts: f.closed ? [...f.pts, f.pts[0]] : f.pts })),
        ...(net?.structures || []).filter((s) => Number.isFinite(s.x) && Number.isFinite(s.y)).map((s) => ({ id: s.id, name: s.name, kind: 'structure', pts: [{ x: s.x, y: s.y, z: Number.isFinite(s.rim) ? s.rim : null }] })),
        ...others.map((x) => { const al2 = this.alignment(x); if (!al2.ok) return null; const n2 = x.rail.tracks || 1, half = ((n2 - 1) / 2) * x.rail.centres;
          const r2 = sw(al2, x.rail, x.rail.clearance || cl, this.railPlan(x), [0]); const reach = half + Math.max(0, ...r2.map((q) => Math.max(q.one.left, q.one.right)));
          return { id: x.id, name: x.name, kind: 'track', reach, pts: al2.polyline(al2.length / 200).map((p) => ({ x: p.x, y: p.y, z: null })) }; }).filter(Boolean),
      ];
      const res = clearanceCheck(al, rows, { obstacles, zAt: (s) => (prof?.ok ? prof.elevationAt(s) : null), centres: n > 1 ? rail.centres : 0, platform: cl.platform, units: U, id: a.id, name: a.name });
      return { rows, ...res };
    });
  }
  /** 0.4 V13: the alignment's sample lines and sections (sections.js) — ground = EG, design = the graded surface when
   *  anything is graded, else EG (no cut or fill); corridor feature lines marked. null without sample lines. */
  sections(a) {
    if (!a?.sampling) return null;
    const al = this.alignment(a);
    if (!al.ok) return null;
    return this.memo('sec:' + a.id, this.surfaceDeps() + '|' + this.gradeDeps() + '|' + JSON.stringify([a.pis, a.start, a.sampling, this.state.display?.secBasis || '']), () => {
      const eg = this.eg().surface, g = this.graded();
      const cor = g.items?.find((x) => x.kind === 'corridor' && x.id === a.id);
      // 0.9 SU.1110: the alignment's other corridors' lines too (each under its own key, the mark's code without it)
      const more = (g.items || []).filter((x) => x.kind === 'corridor' && x.alignment === a.id && x.id !== a.id && x.lines);
      let lines = cor?.lines || null;
      if (more.length) { lines = { ...(lines || {}) }; for (const m of more) for (const [k, v] of Object.entries(m.lines)) lines[k + '#' + m.id] = v; }
      // 0.9: the templates' components in the section at each sample line (the corridor section nearest it, within half a step)
      const tplItems = [cor, ...more].filter((x) => x?.components);
      // courses: 0.7.1 71.24; track: 71.26; extraLayers + volumeBasis: CV.3 (#1534), so the components' bottoms enter the cut and fill
      const r = buildSections({ alignment: al, ground: eg, design: g.surface || eg, regions: (g.regions || []).filter(Boolean), corridor: lines, courses: cor?.courses || null, track: cor?.rail || null, sampling: a.sampling,
        volumeBasis: this.state.display?.secBasis === 'top' ? 'top' : 'bottom', extraLayers: tplItems.length ? (sta) => componentMarks(tplItems, sta) : null });
      if (more.length) for (const sc of r.sections || []) for (const mk of sc.marks || []) mk.code = mk.code.replace(/#cr\d+$/, '');
      return r;
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
      total.items = g.items.filter((it) => it.region && !(it.kind === 'breakline' && it.inside)).map((it) => ({ id: it.id, name: it.name, ...gridVolume(eg, g.surface, { region: it.region, cell: total.cell }) }));
      return total;
    });
  }

  /** 0.9 WB.6: a terrain template's plan shape: a parcel's, a pad's or a closed feature line's outline; null = the whole terrain. */
  clipShape(clip) {
    if (!clip) return null;
    const s = this.state;
    const src = clip.kind === 'parcel' ? (s.parcels || []).find((x) => x.id === clip.id) : clip.kind === 'pad' ? s.pads.find((x) => x.id === clip.id) : clip.kind === 'feature' ? (s.features || []).find((x) => x.id === clip.id && x.closed) : null;
    return src && src.pts?.length >= 3 ? src.pts.map((q) => ({ x: q.x, y: q.y })) : undefined;   // undefined = the shape is gone
  }
  /** 0.9 WB.6: every terrain template's quantities: [{ id, name, tpl, surface, q (terrainQuantities), problem }]. */
  terrainResults() {
    const list = this.state.terrainTemplates || [];
    if (!list.length) return [];
    return this.memo('terrain-tpl', this.surfaceDeps() + '|' + (list.some((x) => x.surface === 'fg') ? this.gradeDeps() : '') + JSON.stringify([list, this.state.templates, list.map((x) => this.clipShape(x.clip))]), () => {
      const T = this.templateMap();
      return list.map((x) => {
        const tpl = T.get(x.tpl), clip = this.clipShape(x.clip);
        const surf = x.surface === 'fg' ? this.graded().surface || this.eg().surface : this.eg().surface;
        if (!tpl) return { ...x, problem: 'notemplate', q: null };
        if (clip === undefined) return { ...x, problem: 'noshape', q: null };
        if (!surf) return { ...x, problem: 'noground', q: null };
        const q = terrainQuantities(surf, clip, tpl, x.params || {});
        return { ...x, problem: q.ok ? '' : q.why, q };
      });
    });
  }
  /** 0.9 SU.1110 + WB.6: every material the templates place: corridor components and terrain template layers, one row each,
   *  [{ source 'corridor'|'terrain', id (item), item (its name), name, material, kind, volume, area? (plan, terrain), wall?, maxH? }]. */
  materials() {
    const out = [];
    // a corridor's components summed per name and material (both sides, every region; the corridor's Properties list them apart)
    for (const it of this.graded().items || []) if (it.kind === 'corridor' && it.components) {
      const by = new Map();
      for (const c of it.components) {
        const k = [c.name, c.material, c.kind].join('|');
        const r = by.get(k) || { source: 'corridor', id: it.id, item: it.name, name: c.name, material: c.material, kind: c.kind, volume: 0, ...(c.wall ? { wall: true, maxH: 0 } : {}) };
        r.volume += c.volume; if (c.wall) r.maxH = Math.max(r.maxH, c.maxH);
        by.set(k, r);
      }
      out.push(...by.values());
    }
    for (const r of this.terrainResults()) if (r.q?.ok) for (const L of r.q.layers) out.push({ source: 'terrain', id: r.id, item: r.name, name: L.name, material: L.material, kind: L.kind, volume: L.volume, area: L.planArea, where: L.where, t: L.t });
    return out;
  }

  /** 0.9 SU.1110 + WB.6: the templates' problems in the shared Problems shape: a corridor naming a template the project no longer
   *  has (warning, code tpl.missing), a terrain template whose template or shape is gone, with no terrain or off it (tpl.terrain.<why>). */
  templateWarnings() {
    const out = [], have = new Set((this.state.templates || []).map((x) => x.id));
    for (const e of this.corridorEntries()) {
      const miss = new Set();
      for (const r of e.c.regions || []) for (const sd of [r.L, r.R]) for (const u of [...sd.uses, sd.end]) if (u && !have.has(u.tpl)) miss.add(u.tpl);
      if (miss.size) out.push({ code: 'tpl.missing', severity: 'warning', text: t('tpl.err.missing', { n: miss.size }), msg: { key: 'tpl.err.missing', vars: { n: miss.size } }, about: { kind: 'alignment', id: e.a.id, label: e.a.name } });
    }
    for (const r of this.terrainResults()) if (r.problem) out.push({ code: 'tpl.terrain.' + r.problem, severity: 'warning', text: r.name + ': ' + t('tpl.tt.prob.' + r.problem), msg: { key: 'tpl.tt.prob.' + r.problem, vars: {} }, about: { kind: 'terrain-template', id: r.id, label: r.name } });
    return out;
  }

  pipeSurface() { return this.graded().surface || this.eg().surface; }
  networkCheck() {
    const n = this.state.network;
    if (!n) return null;
    return this.memo('net', this.surfaceDeps() + '|' + this.gradeDeps() + '|' + JSON.stringify(n) + this.state.units, () => analyzeNetwork(n, this.pipeSurface(), this.state.units));
  }

  // ---- project file ----
  toJSON({ light = false, pointsAs } = {}) {   // pointsAs (0.11): a value put where the points go (ifc-native.js writePair writes them itself, in parts)   // light: without what is big (points, GIS features, grid shift files, map pictures): the autosave journal carries those as extra chunks
    const shellOut = { ...(this.shell || {}) }; { const di = typeof window !== 'undefined' && window.ccDocInfo ? window.ccDocInfo.save() : null; if (di) shellOut.docinfo = di; }   // 0.9 DI.1: the drawing details, stamped with this save
    return {
      format: 'civilcraft-project', version: 1, formatVersion: FILE_IDS, saved: new Date().toISOString(),   // formatVersion (0.11 DC.27): ids from session blocks; older builds ignore it
      name: this.state.name, units: this.state.units, pointsFile: this.pointsFile,
      points: pointsAs !== undefined ? pointsAs : light ? [] : this._pts.rows(),   // 0.5 WL.19: + the block it came from (0.11: the table's rows, = points.map(pointRow))
      surface: this.state.surface, display: this.state.display,
      alignments: this.state.alignments, pads: this.state.pads, network: this.state.network, seq: savedCounter(this, this.state.seq),
      features: this.state.features || [],   // 0.4 V14
      parcels: this.state.parcels || [],   // 0.4 V21
      ...((this.state.masses || []).length ? { masses: this.state.masses } : {}),   // 0.7 LC.1: building masses
      ...((this.state.rivers || []).length ? { rivers: this.state.rivers } : {}),   // 0.8 SU.957: rivers (models only; results are computed again)
      ...((this.state.zoning || []).length ? { zoning: this.state.zoning } : {}),
      ...(this.state.land && !landBookEmpty(this.state.land) ? { land: this.state.land } : {}),   // 0.11 LR.3: land records, field walks, parcel proposals (only written when there are some, so older files stay byte-identical)   // 0.7 LC.1 M3: the limits typed per parcel
      swept: this.state.swept || [],   // 0.6 WL.28
      ...(this.state.landscape ? { landscape: freezeSpacing(this.state.landscape) } : {}),   // 0.7.1: spacing as filled, the plant list's edition   // 0.7 LD: plants, beds, hedges, the project's own plant list
      ...((this.state.utilities?.runs?.length || this.state.utilities?.nodes?.length) ? { utilities: this.state.utilities } : {}),   // 0.10 SU.1810: utility networks
      ...((this.state.parking || []).length ? { parking: this.state.parking } : {}),   // 0.10 SU.1815: parking lots (the layout is worked out again)
      ...((this.state.fences || []).length ? { fences: this.state.fences } : {}),   // 0.10 SU.1814b: fences (the layout is worked out again)
      ...((this.state.issues || []).length ? { issues: this.state.issues } : {}),   // 0.10 CV.1: issues pinned to the plan (BCF in and out)
      ...(this.state.powerlines ? { powerlines: this.state.powerlines } : {}),   // 0.7 PL: lines, routes, equipment, the project's library copy
      ...(Object.keys(shellOut).length ? { shell: shellOut } : {}),   // 0.8 round 3: calc sheets + design reasons (older builds ignore it)
      ...((this.state.ponds || []).length ? { ponds: this.state.ponds } : {}),   // 0.8 EG.12: detention ponds
      ...((this.state.templates || []).length ? { templates: this.state.templates } : {}),   // 0.9 SU.1110: the project's corridor templates
      ...((this.state.terrainTemplates || []).length ? { terrainTemplates: this.state.terrainTemplates } : {}),   // 0.9 WB.6: templates draped on a terrain
      ...(this.state.site ? { site: this.state.site } : {}),   // 0.8 EG.63: address to site (an optional key with its own v: no new file version)
      ...((this.state.progress || []).length ? { progress: this.state.progress } : {}),   // 0.8 EG.39: progress from surveys
      ...((this.state.sectionLines || []).length ? { sectionLines: this.state.sectionLines } : {}),   // 0.8 SU.914 rest: saved free-section lines
      ...(this.state.solar ? { solar: this.state.solar } : {}),   // 0.8 EG.15: ground PV arrays (inputs; the tables are worked out again)
      ...(this.state.geo ? { geo: this.state.geo } : {}),   // 0.8 EG.9/10/11/27/28 CV.1
      ...(this.state.water ? { water: this.state.water } : {}),   // 0.8 LC.16: junctions, reservoirs, tanks, pipes, pumps, valves
      ...((this.state.problems?.accepted || []).length ? { problems: { accepted: this.state.problems.accepted } } : {}),   // 0.7.1 → 0.8: the Problems panel's accepted list
      ...(this.state.ids && this.idsText() ? { ids: { ...this.state.ids, text: this.idsText() } } : {}),   // 0.7.1 71.25: the client's IDS { name, hash, text } (ids-ui.js; the text from idsTexts); older builds ignore it
      crs: this.state.crs,
      gis: this.state.gis, gisFeatures: light ? {} : gisFeaturesJSON(this.gisFeatures),   // GIS: { id: [[geometry, props], …] }
      crsGrids: light ? {} : crsGridsJSON(this),   // 0.4 V11: { name: base64 } for the grid state.crs.grid names
      gisImages: light ? {} : gisImagesJSON(this),   // GIS: { 'img<n>': data URL } for the map layers that use them (builder C)
      ...this.usesRecord(),   // 0.8 AL.6 "This file uses …": { usesAddons: { id: version } } (older builds ignore it)
    };
  }

  /**
   * Autosave that writes what changed (0.10 PERF.24): the journal the shell's Autosave.doc({ journal }) takes. The project file, cut into chunks
   * (lib/history), is written once and then only the chunks each edit changed; the points (in blocks of 5,000), GIS layers, grid shift file and
   * map pictures go as extra chunks that are looked at again only when they were edited.
   */
  autosaveJournal(meta = null) {
    const memo = { pts: -1, gis: -1, grid: null };
    return objectJournal({
      spec: FILE_SPEC, identity: () => this, meta,
      get: async () => {
        // 0.11: a big surface being rebuilt off the page first (the copy's text and the rebuild do not fit the tab's heap together at 10 M
        // points); waited for here, before the state is read, so the state and the points of the copy are of the same moment
        for (let w = typeof Project.idle === 'function' ? Project.idle(this) : null; w; w = Project.idle(this)) await w;
        const o = this.toJSON({ light: true }); delete o.saved; return o;
      },
      extras: (h) => this.syncExtras(h, memo),
    });
  }
  async syncExtras(h, memo) {
    const put = (key, str) => h.setExtra(key, str);
    if (memo.pts !== this.pointsVersion) {   // an edit of the points: write the blocks of the table whose version moved (0.11: never a pass over every point)
      // 0.11 (the cap lifted): the blocks as they are now are held (copy on write, PointTable.freeze) and written a few at a time with the page
      // answering in between (the first copy of 10 million points is seconds of text); an edit meanwhile changes a copy, so the copy written is
      // the project as it was when this write began, with the state chunks taken just before
      const ver = this.pointsVersion, T = this._pts, snap = T.freeze();
      try {
        const seen = memo.blocks || new Map(), now = new Map(), order = [];
        let t0 = Date.now();
        for (const b of snap.blocks) {
          order.push(b.uid); now.set(b.uid, b.v);
          if (seen.get(b.uid) !== b.v || h.cur.get('x:pb:' + b.uid) === undefined) put('x:pb:' + b.uid, T.blockRowsJSON(b));
          if (Date.now() - t0 > 40 && typeof setTimeout === 'function') { await new Promise((r) => setTimeout(r, 0)); t0 = Date.now(); }
        }
        for (const uid of seen.keys()) if (!now.has(uid)) put('x:pb:' + uid, null);
        memo.blocks = now; memo.pts = ver;
        put('x:pts:order', JSON.stringify(order));
      } finally { T.thaw(snap); }
    }
    if (memo.gis !== this.gisVersion) {
      memo.gis = this.gisVersion;
      const now = gisFeaturesJSON(this.gisFeatures), keep = new Set();
      for (const id of Object.keys(now)) { put('x:gis:' + id, JSON.stringify(now[id])); keep.add('x:gis:' + id); }
      for (const k of h.extraKeys()) if (k.startsWith('x:gis:') && !keep.has(k)) put(k, null);
    }
    const grid = crsGridsJSON(this), gname = Object.keys(grid)[0] || null, gbytes = gname ? this.crsGrids.get(gname) : null;
    if (memo.grid !== gbytes) { memo.grid = gbytes; for (const k of h.extraKeys()) if (k.startsWith('x:grid:')) put(k, null); if (gname) put('x:grid:' + gname, grid[gname]); }
    const imgs = gisImagesJSON(this), keepI = new Set();
    for (const [id, v] of Object.entries(imgs)) { put('x:img:' + id, v); keepI.add('x:img:' + id); }
    for (const k of h.extraKeys()) if (k.startsWith('x:img:') && !keepI.has(k)) put(k, null);
  }

  /** 0.8 AL.6: the add-ons this file's data came from. Project.stamp (set by the app) works the record out before a save; without it the record read at open stays. */
  usesRecord() {
    let rec = this.usesAddons || null;
    try { if (typeof Project.stamp === 'function') rec = Project.stamp(this) || rec; } catch { /* the record is a courtesy: never stop a save */ }
    return rec && Object.keys(rec).length ? { usesAddons: rec } : {};
  }

  /**
   * `pre` (0.11 PERF.33): the points already read off the page (open-async.js parseProjectAsync → pointsFromColumns): { pts, total } where
   * `pts` are the rows fromJSON would have made and `total` the file's row count; obj.points is then not read.
   */
  static fromJSON(obj, pre = null) {
    const notes = [];
    if (!obj || obj.format !== 'civilcraft-project') throw new Error(t('project.err.notcc'));
    if (obj.version !== 1) throw new Error(t('project.err.newer', { version: String(obj.version).slice(0, 10) }));
    const p = new Project();
    const fin = (v) => typeof v === 'number' && Number.isFinite(v);
    const str = cleanText;   // 0.11 PERF.33: project-rows.js, the same one the open Worker reads rows with
    const xy = (q) => (q && fin(q.x) && fin(q.y) ? { x: q.x, y: q.y } : null);
    const xyz = (q) => (q && fin(q.x) && fin(q.y) && fin(q.z) ? { x: q.x, y: q.y, z: q.z } : null);
    const list = (a, f, max) => (Array.isArray(a) ? a.slice(0, max).map(f).filter(Boolean) : []);
    const s = p.state;
    s.name = str(obj.name, 120) || t('project.untitled');
    s.units = obj.units === 'm' ? 'm' : 'ft';
    s.seq = Number.isInteger(obj.seq) && obj.seq > 0 ? obj.seq : 1;
    const pts = pre ? (pre.table || pre.pts) : list(obj.points, (r) => {
      const q = readPointRow(r);
      if (!q) return null;
      const blk = cleanBlk(r[5]);   // 0.5 WL.19
      if (blk) q.blk = blk;
      return q;
    }, MAX_POINTS);
    const nRows = pre ? pre.total : Array.isArray(obj.points) ? obj.points.length : -1;
    if (nRows > MAX_POINTS) notes.push(t('project.points.cap.max', { n: (nRows - MAX_POINTS).toLocaleString('en-US'), max: MAX_POINTS.toLocaleString('en-US') }));   // 0.11 PERF.33: said, not folded into "could not be read"
    if (nRows >= 0 && pts.length !== Math.min(nRows, MAX_POINTS)) notes.push(t('project.bad.points', { n: Math.min(nRows, MAX_POINTS) - pts.length }));
    const sf = obj.surface || {};
    s.surface.name = str(sf.name, 120) || t('surface.eg');
    s.surface.groups = {};
    if (sf.groups && typeof sf.groups === 'object') for (const [k, v] of Object.entries(sf.groups).slice(0, 10000)) if (['off', 'points', 'breakline'].includes(v)) s.surface.groups[str(k, 200)] = v;
    s.surface.breaklines = list(sf.breaklines, (b) => { const q = list(b?.pts, xyz, 1e6); return q.length >= 2 ? { name: str(b.name, 120), pts: q } : null; }, 1e5);
    const bnd = list(sf.boundary, xy, 1e6);
    s.surface.boundary = bnd.length >= 3 ? bnd : null;
    s.surface.maxEdge = fin(sf.maxEdge) && sf.maxEdge >= 0 ? sf.maxEdge : 0;
    if (typeof sf.method === 'string' && GRID_METHODS.some((m) => m.key === sf.method)) {   // 0.9 D9.6: only written when not the TIN, so older files stay byte-identical
      s.surface.method = sf.method;
      if (fin(sf.gridStep) && sf.gridStep > 0) s.surface.gridStep = sf.gridStep;
      if (fin(sf.gridPower) && sf.gridPower > 0) s.surface.gridPower = Math.min(sf.gridPower, 10);
      if (fin(sf.gridQ) && sf.gridQ > 0) s.surface.gridQ = Math.min(sf.gridQ, 100);   // 0.9.1 ABOS: smoothness q and accuracy (% of the height range)
      if (fin(sf.gridAcc) && sf.gridAcc >= 0) s.surface.gridAcc = Math.min(sf.gridAcc, 100);
    }
    if (fin(sf.flatFix) && sf.flatFix > 0) s.surface.flatFix = sf.flatFix;   // 0.8 SU.911: only written when on, so older files stay byte-identical
    s.surface.descKeys = cleanDescKeys(sf.descKeys);   // 0.4 V16
    s.surface.lineCodes = cleanLineCodes(sf.lineCodes);
    if (sf.tin && Array.isArray(sf.tin.pts) && Array.isArray(sf.tin.faces)) {
      const tp = sf.tin.pts.slice(0, 5e6).map(xyz);
      const tf = sf.tin.faces.slice(0, 1e7).filter((f) => Array.isArray(f) && f.length === 3 && f.every((i) => Number.isInteger(i) && i >= 0 && i < tp.length));
      s.surface.tin = { pts: tp, faces: tf };
      if (sf.tin.from === 'grid' || sf.tin.from === 'ifc') s.surface.tin.from = sf.tin.from;   // 'ifc': 0.7.1 71.24 (ifc-civil-read.js)   // GIS: a grid TIN made from an elevation grid (gis-terrain-ui.js)
    }
    if (obj.display && typeof obj.display === 'object') for (const k of Object.keys(DISPLAY_DEFAULTS)) { const v = obj.display[k]; if (typeof v === typeof DISPLAY_DEFAULTS[k] && (typeof v !== 'number' || (fin(v) && v > 0)) && (k !== 'surface' || v === 'eg' || v === 'fg')) s.display[k] = v; }
    if (typeof obj.display?.smooth === 'string' && Object.hasOwn(SMOOTH_LEVELS, obj.display.smooth) && SMOOTH_LEVELS[obj.display.smooth]) s.display.smooth = obj.display.smooth;   // 0.9.1 contour smoothing: only written when on, so older files stay byte-identical
    if (obj.display?.cutfill === true) s.display.cutfill = true;   // 0.8 SU.914: the cut and fill map; not a default key, so files that never turned it on stay byte-identical
    const id = (v, pre) => (/^[a-z]+\d+$/.test(String(v)) ? String(v) : p.nextId(pre));
    // 0.9 SU.1110: the project's templates first (the corridors' regions name them); untrusted, ids tp<n>
    { const tl = list(obj.templates, (x) => { const c = cleanTemplate(x, s.units); if (!c) return null; c.id = /^tp\d+$/.test(String(x?.id)) ? x.id : p.nextId('tp'); c.source = 'project'; return c; }, MAX_TEMPLATES).filter((x, i, a) => a.findIndex((y) => y.id === x.id) === i);
      if (tl.length) s.templates = tl;
      if (Array.isArray(obj.templates) && tl.length < obj.templates.length) notes.push(t('tpl.bad.dropped', { n: obj.templates.length - tl.length })); }
    const tplIds = new Set((s.templates || []).map((x) => x.id));
    s.alignments = list(obj.alignments, (a) => {
      const lsOf = (v) => (fin(v) && v > 0 && v < 1e7 ? v : 0);   // 0.7 D7.35: a spiral's length (ls = both ends)
      const pis = list(a?.pis, (q) => {
        if (!xy(q)) return null;
        const r = fin(q.r) && q.r > 0 ? q.r : 0, ls1 = r ? lsOf(q.ls1) || lsOf(q.ls) : 0, ls2 = r ? lsOf(q.ls2) || lsOf(q.ls) : 0;
        const tr = r && q.tr !== 'clothoid' && TRANSITIONS.includes(q.tr) ? q.tr : null, cant = r && fin(q.cant) && q.cant >= -300 && q.cant <= 300 && q.cant !== 0 ? q.cant : 0;   // 0.7.1 71.26: rail transition kind, applied cant (mm)
        const lsc = r && fin(q.lsc) && q.lsc > 0 ? q.lsc : 0;   // 0.11 SU.1944: a spiral to the next PI's curve
        return { ...xy(q), r, ...(ls1 ? { ls1 } : {}), ...(ls2 ? { ls2 } : {}), ...(lsc ? { lsc } : {}), ...(tr ? { tr } : {}), ...(cant ? { cant } : {}) };
      }, 1e4);
      if (pis.length < 2) return null;
      const pvis = list(a.pvis, (v) => (v && fin(v.sta) && fin(v.z) ? { sta: v.sta, z: v.z, L: fin(v.L) && v.L > 0 ? v.L : 0, ...(fin(v.R) && v.R > 0 ? { R: v.R } : {}), ...(v.locked === true ? { locked: true } : {}) } : null), 1e4);   // locked: CV.3 (#1534)
      const corridor = a.corridor && typeof a.corridor === 'object' ? cleanCorridor(a.corridor, s.units, tplIds) : null;
      // 0.9 SU.1110: more corridors on this alignment (station ranges), each a corridor of its own
      const more = list(a.corridors, (c) => { if (!c || typeof c !== 'object') return null; const x = cleanCorridor(c, s.units, tplIds); return { id: /^cr\d+$/.test(String(c.id)) ? c.id : p.nextId('cr'), name: str(c.name, 80) || t('tpl.corr.default'), ...x }; }, 20);
      const minR = fin(a.minR) && a.minR > 0 && a.minR < 1e7 ? a.minR : 0;   // 0.5 WL.23: design minimum radius (0 = none)
      const design = cleanDesign(a.design);   // 0.7.1 71.24: design speed and class (older files: none)
      const rail = cleanRail(a.rail, s.units);   // 0.7.1 71.26: a track (older files: none)
      return { id: id(a.id, 'a'), name: str(a.name, 120) || t('scene.al.default'), start: fin(a.start) ? a.start : 0, pis, pvis, corridor, sampling: cleanSampling(a.sampling, s.units), ...(more.length ? { corridors: more } : {}), ...(minR ? { minR } : {}), ...(design ? { design } : {}), ...(rail ? { rail } : {}) };
    }, 1000);
    s.pads = list(obj.pads, (d) => {
      // 0.10.1 #1970: a corner may carry its own elevation (a sloped pad, a ramp); it was dropped on open before
      const q = list(d?.pts, (c) => { const o = xy(c); if (o && fin(c.z) && Math.abs(c.z) < 1e6) o.z = c.z; return o; }, 1e4);
      if (q.length < 3 || !fin(d.z)) return null;
      const sides = cleanPadSides(d.sides, s.units, q.length);   // 0.7.1 71.22: slopes per side, retaining walls
      return { id: id(d.id, 'p'), name: str(d.name, 120) || t('scene.pad.default'), pts: q, z: d.z, cut: fin(d.cut) && d.cut > 0 ? d.cut : 2, fill: fin(d.fill) && d.fill > 0 ? d.fill : 2, ...(sides ? { sides } : {}) };
    }, 1000);
    s.features = list(obj.features, (f) => { const c = cleanFeature(f, s.units); if (c) c.id = id(f?.id, 'f'); return c; }, 1000);   // 0.4 V14
    s.parcels = list(obj.parcels, (f) => { const c = cleanParcel(f); if (c) c.id = id(f?.id, 'r'); return c; }, 2000);   // 0.4 V21
    s.masses = list(obj.masses, (f) => { const c = cleanMass(f, s.units); if (c) c.id = id(f?.id, 'm'); return c; }, MAX_MASSES);   // 0.7 LC.1 (untrusted)
    s.rivers = list(obj.rivers, (r) => cleanRiver(r), 50).filter((r, i, a) => a.findIndex((y) => y.id === r.id) === i);   // 0.8 SU.957 (untrusted; ids rv<n>, own counter in river-ui.js)
    s.zoning = list(obj.zoning, (z) => cleanZone(z, s.units), 2000).filter((z, i, a) => a.findIndex((y) => y.parcel === z.parcel) === i);   // 0.7 LC.1 M3 (untrusted; one per parcel)
    if (obj.land && typeof obj.land === 'object') { const lb = cleanLandBook(obj.land); if (!landBookEmpty(lb)) s.land = lb; }   // 0.11 LR.3 (untrusted; kept with the add-on switched off)
    s.swept = list(obj.swept, (w) => { const c = cleanSwept(w, s.units); if (c) c.id = id(w?.id, 'w'); return c; }, 200);   // 0.6 WL.28
    if (obj.landscape && typeof obj.landscape === 'object') s.landscape = cleanLandscape(obj.landscape, s.units, (rows) => readPlants({ format: 'cadcraft-plants', version: 1, species: rows }).library.species);   // 0.7 LD (untrusted)
    if (obj.utilities && typeof obj.utilities === 'object') { s.utilities = cleanUtilities(obj.utilities, s.units); if (!s.utilities.runs.length && !s.utilities.nodes.length) delete s.utilities; }   // 0.10 SU.1810 (untrusted)
    if (Array.isArray(obj.parking)) { s.parking = cleanParking(obj.parking, s.units); if (!s.parking.length) delete s.parking; }   // 0.10 SU.1815 (untrusted)
    if (Array.isArray(obj.fences)) { s.fences = obj.fences.slice(0, 500).map((f) => cleanFence(f, s.units)).filter(Boolean); if (!s.fences.length) delete s.fences; }   // 0.10 SU.1814b (untrusted)
    if (Array.isArray(obj.issues)) { s.issues = cleanIssues(obj.issues, s.units); if (!s.issues.length) delete s.issues; }   // 0.10 CV.1 (untrusted)
    if (obj.powerlines && typeof obj.powerlines === 'object') s.powerlines = cleanPowerlines(obj.powerlines);
    s.terrainTemplates = list(obj.terrainTemplates, (x) => cleanTerrainTpl(x, tplIds, id), 200);   // 0.9 WB.6 (untrusted)
    if (!s.terrainTemplates.length) delete s.terrainTemplates;
    s.ponds = list(obj.ponds, (q) => { const c = cleanPond(q, s.units); if (c) c.id = id(q?.id, 'q'); return c; }, 200);   // 0.8 EG.12 (untrusted)
    if (obj.shell && typeof obj.shell === 'object') for (const k of ['calcs', 'reasons', 'docinfo']) if (obj.shell[k] && typeof obj.shell[k] === 'object' && JSON.stringify(obj.shell[k]).length < 2e6) p.shell[k] = obj.shell[k];   // 0.8 round 3 (untrusted; the shell cleans it again on load)
    if (obj.shell && typeof obj.shell.regs === 'string' && obj.shell.regs.length < 2e5) p.shell.regs = obj.shell.regs;   // 0.8 REG.1 step 4: the drawing's own regulation ticks (JSON text, add-on regs)
    if (obj.usesAddons && typeof obj.usesAddons === 'object' && !Array.isArray(obj.usesAddons)) {   // 0.8 AL.6 (untrusted: ids and versions are cleaned)
      p.usesAddons = Object.fromEntries(Object.entries(obj.usesAddons).slice(0, 200).filter(([k]) => /^[A-Za-z0-9][A-Za-z0-9._-]{0,79}$/.test(k)).map(([k, v]) => [k, String(v ?? '').replace(/[^\x20-\x7e]/g, '').slice(0, 40)]));
    }
    if (obj.site !== undefined) { const r = cleanSite(obj.site); if (r.ok) s.site = r.site; else notes.push(t(r.why === 'newer' ? 'project.bad.sitenewer' : 'project.bad.site')); }   // 0.8 EG.63 (untrusted; a newer site block is refused, never half-read)
    s.progress = cleanProgress(obj.progress);   // 0.8 EG.39 (untrusted)
    { const sl = cleanSectionLines(obj.sectionLines, id); if (sl.length) s.sectionLines = sl; }   // 0.8 SU.914 rest (untrusted)
    { const sv = cleanSolar(obj.solar, id); if (sv) s.solar = sv; }   // 0.8 EG.15 (untrusted)
    { const g = cleanGeo(obj.geo, s.units, id); if (g) s.geo = g; }   // 0.8 EG.9/10/11/27/28 CV.1 (untrusted)
    if (obj.water && typeof obj.water === 'object') { const w = cleanWater(obj.water, s.units); if (w.nodes.length) s.water = w; }   // 0.8 LC.16 (untrusted)   // 0.7 PL (untrusted)
    const nw = obj.network;
    if (nw && typeof nw === 'object' && Array.isArray(nw.structures) && Array.isArray(nw.pipes)) {
      const r = nw.rules || {};
      const pos = (v, d) => (fin(v) && v >= 0 ? v : d);
      // 0.6 WL.27: structure types (structs.js); a structure keeps a type that exists
      const types = list(nw.types, (k) => { const c = cleanType(k, s.units); if (c) c.id = id(k?.id, 'u'); return c; }, MAX_TYPES);
      const typeIds = new Set(types.map((k) => k.id));
      const structures = list(nw.structures, (x) => (xy(x) ? { id: id(x.id, 's'), name: str(x.name, 60) || t('project.def.structure'), ...xy(x), rim: fin(x.rim) ? x.rim : null, sumpDepth: pos(x.sumpDepth, 0), dia: pos(x.dia, 48), ...(typeIds.has(x.type) ? { type: x.type } : {}), ...(cleanSewLoad(x.sew) ? { sew: cleanSewLoad(x.sew) } : {}) } : null), 1e4);
      const ids = new Set(structures.map((x) => x.id));
      const pipes = list(nw.pipes, (x) => (x && ids.has(x.from) && ids.has(x.to) && x.from !== x.to ? { id: id(x.id, 'q'), name: str(x.name, 60) || t('project.def.pipe'), from: x.from, to: x.to, dia: pos(x.dia, 12) || 12, invUp: fin(x.invUp) ? x.invUp : null, invDn: fin(x.invDn) ? x.invDn : null, ...(typeof x.mat === 'string' && /^[a-z][a-z0-9_]{0,23}$/.test(x.mat) ? { mat: x.mat } : {}) } : null), 1e4);
      if (pipes.length !== nw.pipes.length) notes.push(t('project.bad.pipes', { n: nw.pipes.length - pipes.length }));
      s.network = { name: str(nw.name, 60) || t('pipes.default'), type: nw.type === 'sanitary' ? 'sanitary' : 'storm', rules: { minSlope: pos(r.minSlope, 0), minCover: pos(r.minCover, 0), minDrop: pos(r.minDrop, 0) }, structures, pipes };
      // 0.4 V19/V20: catchments (to a structure of this network, else none) and the hydrology settings
      const cs = list(nw.catchments, (x) => { const c = cleanCatchment(x); if (!c) return null; c.id = id(x.id, 'k'); if (c.to && !ids.has(c.to)) c.to = null; return c; }, 1e4);
      if (cs.length) s.network.catchments = cs;
      if (nw.hydro && typeof nw.hydro === 'object') s.network.hydro = cleanHydro(nw.hydro, s.units);
      if (Array.isArray(nw.rulesets)) {   // 0.11 SU.1937b: the network's named drainage rule sets (each group cited or entered; ids rs<n>)
        const seen = new Set(), rl = [];
        for (const r of nw.rulesets.slice(0, MAX_RULESETS)) { const c = cleanRuleset(r, s.units).rs; if (!c) continue; let k = c.id; if (!k || seen.has(k)) { let n = 1; while (seen.has('rs' + n)) n++; k = 'rs' + n; } seen.add(k); rl.push({ ...c, id: k }); }
        if (rl.length) s.network.rulesets = rl;
      }
      if (types.length) s.network.types = types;
      if (nw.sewer && typeof nw.sewer === 'object') s.network.sewer = cleanSewer(nw.sewer, s.units);   // 0.6 LC.16 S1: sanitary design flows
    }
    s.crs = readCrs(obj.crs, str, fin, notes);
    const pa = cleanAcceptedCivil(obj.problems?.accepted);   // 0.7.1 → 0.8: problems accepted as intended (older builds ignore the key)
    if (pa.length) s.problems = { accepted: pa };
    const idsRec = cleanIdsRecord(obj.ids);   // 0.7.1 71.25: the IDS the IFC export is checked against (untrusted, bounded)
    if (idsRec) s.ids = { name: idsRec.name, hash: p.idsTexts.put(idsRec.text) };   // the snapshots keep { name, hash }; the text once
    { const g = readGisState(obj.gis, obj.gisFeatures, notes); s.gis = g.gis; p.gisFeatures = g.features; p.gisVersion++; }   // GIS (untrusted)
    p.crsGrids = readCrsGrids(obj.crsGrids, s.crs, notes);   // 0.4 V11
    if (p.crsGrids.size) {   // register with proj4 (crs.js, loaded only when a project has a grid); then tell the views
      import('./crs.js').then(async (C) => { for (const [n, b] of p.crsGrids) { try { await C.loadGrid(n, b); } catch (e) { p.gridError = e.message; } } p.emit('crs-grid'); }).catch((e) => { p.gridError = e.message; });
    }
    p.gisImages = readGisImages(obj.gisImages, s.gis.maps, notes);   // GIS: map layer pictures (builder C; gis-map-ui.js reads the layers)
    p._setTable(pts); p.pointsFile = str(obj.pointsFile, 200); p.pointsVersion++;
    for (const a of [...(s.templates || []), ...(s.terrainTemplates || []), ...s.alignments.flatMap((x) => x.corridors || []), ...s.alignments, ...s.pads, ...(s.network ? [...s.network.structures, ...s.network.pipes, ...(s.network.catchments || []), ...(s.network.types || [])] : []), ...s.gis.layers, ...(s.features || []), ...(s.parcels || []), ...(s.issues || []), ...(s.utilities ? [...s.utilities.runs, ...s.utilities.nodes] : []), ...(s.masses || []), ...(s.swept || []), ...(s.ponds || []), ...Object.values(s.geo || {}).flat(), ...(s.landscape ? [...s.landscape.plants, ...s.landscape.beds, ...s.landscape.hedges, ...s.landscape.grading, ...s.landscape.hardscape, ...(s.landscape.areas || []), ...(s.landscape.levels || []), ...(s.landscape.sections || []), ...(s.landscape.irrigation ? ['heads', 'pipes', 'valves', 'drips'].flatMap((w) => s.landscape.irrigation[w]) : []), ...(s.landscape.freeform || [])] : []), ...(s.water ? [...s.water.nodes, ...s.water.pipes] : []), ...(s.powerlines ? [...s.powerlines.lines, ...s.powerlines.lines.flatMap((l) => l.supports), ...s.powerlines.routes, ...s.powerlines.equipment, ...s.powerlines.obstacles] : [])]) { const n = Number(String(a.id).replace(/^\D+/, '')); if (n >= s.seq) s.seq = n + 1; }
    p.h.reset(p.state);   // the state was filled in place: the chunk table starts from it
    return { project: p, notes };
  }
}
/** 0.11 PERF.21: tests set this (or HISTORY_VERIFY=1 in Node) and every hinted edit is checked against the full look; a miss throws. */
Project.verifyHints = typeof process !== 'undefined' && process?.env?.HISTORY_VERIFY === '1';

/** A corridor from the project file (untrusted): the simple assembly, superelevation, parts, targets, and (0.9) its station
 *  range and templates by station (regions naming templates that exist). */
export function cleanCorridor(c, units, tplIds = new Set()) {
  const fin = (v) => typeof v === 'number' && Number.isFinite(v);
  const d = defaultAssembly(units), pos = (v, k) => (fin(v) && v >= 0 ? v : d[k]);
  const corridor = { on: c.on === true, lane: pos(c.lane, 'lane'), laneSlope: pos(c.laneSlope, 'laneSlope'), shoulder: pos(c.shoulder, 'shoulder'), shoulderSlope: pos(c.shoulderSlope, 'shoulderSlope'), cut: pos(c.cut, 'cut') || d.cut, fill: pos(c.fill, 'fill') || d.fill, step: pos(c.step, 'step') || d.step };
  const sup = cleanSuper(c.super, units);   // 0.4 V18
  if (sup) corridor.super = sup;
  const parts = cleanSides(c.parts, units);   // 0.7 D7.35: the assembly editor's parts, left and right
  if (parts) corridor.parts = parts;
  const tg = cleanTargets(c.targets);   // 0.6 WL.25
  if (tg.length) corridor.targets = tg;
  if (c.join === false) corridor.join = false;   // 0.10.1 #1977: this corridor does not join the roads and pads it meets
  if (fin(c.from)) corridor.from = c.from;   // 0.9 SU.1110: the corridor's own station range (several corridors on an alignment)
  if (fin(c.to) && !(fin(c.from) && c.to <= c.from)) corridor.to = c.to;
  const rg = cleanRegions(c.regions, tplIds);   // 0.9 SU.1110: templates by station
  if (rg) corridor.regions = rg;
  const nv = cleanNamed(c.named);   // 0.11 SU.1941: named values by station
  if (nv && rg) corridor.named = nv;
  return corridor;
}
/** 0.9: a corridor's WL.25 targets and its templates' point targets, as { from } records (corridorOrder, gradeDeps). */
function allTargets(c) {
  const out = [...(c?.targets || [])];
  for (const r of c?.regions || []) for (const sd of [r.L, r.R]) for (const u of [...sd.uses, sd.end]) for (const f of Object.values(u?.targets || {})) out.push({ from: f });
  return out;
}
/** 0.9 WB.6: a terrain template from the project file (untrusted). */
export function cleanTerrainTpl(x, tplIds, id) {
  if (!x || typeof x !== 'object' || !tplIds.has(x.tpl)) return null;
  const clip = x.clip && ['parcel', 'pad', 'feature'].includes(x.clip.kind) && /^[a-z]+\d+$/.test(String(x.clip.id)) ? { kind: x.clip.kind, id: String(x.clip.id) } : null;
  const params = {};
  if (x.params && typeof x.params === 'object') for (const [k, v] of Object.entries(x.params).slice(0, 16)) if (/^[a-z][a-z0-9_]{0,23}$/.test(k) && typeof v === 'number' && Number.isFinite(v) && Math.abs(v) < 1e5) params[k] = v;
  return { id: id(/^tt\d+$/.test(String(x.id)) ? x.id : '', 'tt'), name: String(x.name ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, 80) || 'Terrain template', tpl: x.tpl, surface: x.surface === 'fg' ? 'fg' : 'eg', clip, ...(Object.keys(params).length ? { params } : {}) };   // i18n-ignore: a fallback name in a file
}
/** 0.9 SU.1110: the template components across a sample line at station `sta`, from the corridor section nearest it (within half
 *  the corridor's step), as section-view layer lines { side, code, k, name, a: {o, z}, b: {o, z} } (left offsets negative). */
function componentMarks(items, sta) {
  const out = [];
  for (const it of items) {
    const secs = it.sections || [];
    if (!secs.length || sta < secs[0].sta - 1e-6 || sta > secs[secs.length - 1].sta + 1e-6) continue;
    let best = secs[0];
    for (const s of secs) if (Math.abs(s.sta - sta) < Math.abs(best.sta - sta)) best = s;
    const step = Number(it.assembly?.step) || 10;
    if (Math.abs(best.sta - sta) > step / 2 + 1e-6 || !best.comps) continue;
    for (const [side, sx] of [['L', -1], ['R', 1]]) for (const c of best.comps[side] || []) {
      c.poly.forEach((q, i) => { const r = c.poly[(i + 1) % c.poly.length]; out.push({ side, code: c.key, k: i, name: c.name, a: { o: sx * q.o, z: q.z }, b: { o: sx * r.o, z: r.z } }); });
    }
  }
  return out;
}

/** The project file's `crs` (untrusted): shape and sizes only — crs.js `crsProblem` judges the definition when used. */
function readCrs(c, str, fin, notes) {
  if (c == null) return null;
  const bad = () => { notes.push(t('project.bad.crs')); return null; };
  if (typeof c !== 'object' || typeof c.proj4 !== 'string' || !c.proj4.trim() || c.proj4.length > 20000 || !['m', 'ft', 'ftUS'].includes(c.unit)) return bad();
  const out = { code: Number.isInteger(c.code) && c.code > 0 && c.code < 1e6 ? c.code : null, name: str(c.name, 200) || t('project.def.crs'), proj4: c.proj4.replace(/[\u0000-\u001f\u007f]/g, ' '), unit: c.unit, local: null };
  if (typeof c.grid === 'string' && /^[A-Za-z0-9._-]{1,80}$/.test(c.grid)) out.grid = c.grid;   // 0.4 V11
  if (c.axes === 'ws') out.axes = 'ws';   // 0.8 ZA.1: a west/south system (crs.js axisNames)
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
    if (!used.has(k) || !/^img\d{1,16}$/.test(k)) continue;
    const v = obj[k];
    if (typeof v === 'string' && v.length <= MAX_GIS_IMAGE && /^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(v)) out.set(k, v); else bad++;
  }
  if (bad) notes.push(t('project.bad.maps', { n: bad }));
  return out;
}
