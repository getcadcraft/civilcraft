/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: record names written into the project are the person's to rename; the page's words are in parking-ui.js */
/**
 * parking-apply.js — puts a parking lot (parking.js) into a CivilCraft project and keeps it in step (0.10 SU.1815). No DOM: the tool window, the
 * assistant tools and bin/test-civilcraft-sitegen.mjs call the same functions.
 *
 * state.parking = [{ id 'pk<n>', name, boundary [{x, y}], opts { angle, traffic, stallW, stallL, aisleW, orientation, region, islandW, maxRun, endIslands, entrance,
 *                    accessible, setback, fallPct, drainSpacing, drains [{x, y}] | null (= picked), grade, paving, planting, treeSpecies, shrubSpecies, treeMinW },
 *                  made { grading, paving, beds [], plants [] } }]
 * The layout itself is worked out again from the record (it is not stored). `made` lists the Landscape objects the lot made (a grading area with spot elevations
 * that fall to the drains, a paving, a bed and a tree per island) so a rebuild replaces them and a removal takes them away; the person may edit them in between.
 *
 *   cleanParking(list, units) (untrusted) · computeLot(rec, { units, zAt }) → { layout, drains, grade }
 *   buildLot(project, input, { zAt, seed }) → { ok, id, layout, drains, grade, made, notes, problems }   one undo step
 *   removeLot(project, id) → boolean
 */
import * as K from './parking.js';
import { takeNumber } from './history/ids.js';   // 0.11 DC.27: the project's counter (session tags)
import { emptyLandscape, speciesIndex } from './landscape/planting.js';
import { cleanGrading } from './landscape/grade.js';
import { cleanHardscape, hardDefaults } from './landscape/hardscape.js';
import { search } from './landscape/plants.js';
import { streetAccess } from './landscape/street.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n = 120) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').slice(0, n);
const XY = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
const pos = (v, max = 1e4) => (fin(v) && v > 0 && v <= max ? v : undefined);
export const MAX_LOTS = 50;

export function cleanOpts(o, units) {
  o = o && typeof o === 'object' ? o : {};
  const out = {};
  if (K.ANGLES.includes(o.angle)) out.angle = o.angle;
  if (o.traffic === 'one' || o.traffic === 'two') out.traffic = o.traffic;
  for (const k of ['stallW', 'stallL', 'aisleW', 'islandW', 'treeMinW', 'drainSpacing']) { const v = pos(o[k], 1000); if (v !== undefined) out[k] = v; }
  if (fin(o.orientation)) out.orientation = ((o.orientation % 180) + 180) % 180;
  out.region = K.REGION_IDS.includes(o.region) ? o.region : 'us';
  if (Number.isInteger(o.maxRun) && o.maxRun >= 0 && o.maxRun <= 100) out.maxRun = o.maxRun;
  if (typeof o.endIslands === 'boolean') out.endIslands = o.endIslands;
  const en = XY(o.entrance); if (en) out.entrance = en;
  if (Number.isInteger(o.accessible) && o.accessible >= 0 && o.accessible <= 1000) out.accessible = o.accessible;
  if (fin(o.setback) && o.setback >= 0 && o.setback < 1000) out.setback = o.setback;
  if (fin(o.fallPct) && o.fallPct > 0 && o.fallPct <= 20) out.fallPct = o.fallPct;
  if (Array.isArray(o.drains)) out.drains = o.drains.slice(0, 200).map(XY).filter(Boolean);
  for (const k of ['grade', 'paving', 'planting']) if (typeof o[k] === 'boolean') out[k] = o[k];
  for (const k of ['treeSpecies', 'shrubSpecies']) if (typeof o[k] === 'string' && o[k]) out[k] = str(o[k], 80);
  void units;
  return out;
}

export function cleanParking(list, units) {
  const out = [];
  if (!Array.isArray(list)) return out;
  for (const r of list.slice(0, MAX_LOTS)) {
    if (!r || typeof r !== 'object' || !/^pk\d{1,16}$/.test(String(r.id))) continue;
    const boundary = (Array.isArray(r.boundary) ? r.boundary.slice(0, 5000) : []).map(XY).filter(Boolean);
    if (boundary.length < 3) continue;
    const ids = (a, re) => (Array.isArray(a) ? a.filter((x) => re.test(String(x))).map(String).slice(0, 5000) : []);
    const m = r.made && typeof r.made === 'object' ? r.made : {};
    out.push({ id: String(r.id), name: str(r.name) || String(r.id), boundary, opts: cleanOpts(r.opts, units),
      made: { grading: /^l\d{1,16}$/.test(String(m.grading)) ? String(m.grading) : null, paving: /^l\d{1,16}$/.test(String(m.paving)) ? String(m.paving) : null, beds: ids(m.beds, /^l\d{1,16}$/), plants: ids(m.plants, /^l\d{1,16}$/) } });
  }
  return out;
}

/** The layout, drains and graded dish of a record (nothing is written). */
export function computeLot(rec, { units = 'ft', zAt = null, streets = null } = {}) {
  const o = rec.opts || {}, u = units === 'm' ? 'm' : 'ft', D = K.defaults(u, { region: o.region, angle: o.angle || 90, traffic: o.traffic });
  const layout = K.layout(rec.boundary, { ...o, units: u });
  const drains = o.drains?.length ? o.drains : K.pickDrains(layout, rec.boundary, o.drainSpacing || D.drainSpacing);
  const A = K.regionOf(o.region).accessible;
  const grade = o.grade === false ? null : K.dishGrade(rec.boundary, drains, { zAt, fallPct: o.fallPct || D.fallPct, units: u, maxFallPct: (A.maxSlope || 0.0208333) * 100 });
  if (grade && layout.counts.accessible && grade.fallPct > (A.maxSlope || 0.0208333) * 100 + 1e-9 && !grade.problems.some((p) => p.code === 'fall.steep')) grade.problems.push({ code: 'fall.steep', have: grade.fallPct, limit: (A.maxSlope || 0.0208333) * 100 });
  // SU.1815: do the aisles reach a street? Only said when there is a street to reach (an empty list is "no streets drawn", not "no access")
  let access = null;
  if (streets?.length) { access = streetAccess(layout, streets); if (!access.ok) layout.problems.push({ code: 'nostreet', count: access.unreachableAisles.length }); }
  if (K.regionOf(o.region).unread && !layout.problems.some((p) => p.code === 'region.unread')) layout.notes.push({ code: 'region.unread', source: K.regionOf(o.region).source });
  return { layout, drains, grade, access };
}

function pick(list, key, type) {
  if (key) { const hit = list.find((s) => s.key === key) || search(list, key, {})[0]; if (hit) return hit; }
  return search(list, '', { type })[0] || null;
}

/** Make or rebuild a lot: input = { id?, name?, boundary, opts }. One undo step. */
export function buildLot(P, input, { zAt = null, seed = [], streets = null } = {}) {
  const units = P.state.units === 'm' ? 'm' : 'ft', notes = [];
  const boundary = (input.boundary || []).map(XY).filter(Boolean);
  if (boundary.length < 3) return { ok: false, problems: [{ code: 'boundary' }], notes };
  const old = input.id ? (P.state.parking || []).find((r) => r.id === input.id) : null;
  const opts = cleanOpts({ ...(old?.opts || {}), ...(input.opts || {}) }, units);
  const rec = { id: old?.id || null, name: str(input.name) || old?.name || '', boundary, opts, made: { grading: null, paving: null, beds: [], plants: [] } };
  const calc = () => computeLot(rec, { units, zAt, streets: streets || P.streetLines?.() || null });
  const res = calc();
  if (!res.layout.counts.total) return { ok: false, problems: res.layout.problems.length ? res.layout.problems : [{ code: 'nofit' }], layout: res.layout, notes };
  const index = speciesIndex(seed, P.state.landscape?.palette || []), list = [...index.values()];
  const tree = opts.planting === false ? null : pick(list, opts.treeSpecies, 'tree'), shrub = opts.planting === false ? null : (pick(list, opts.shrubSpecies, 'shrub') || pick(list, opts.shrubSpecies, 'groundcover'));
  if (opts.planting !== false && !tree && !shrub) notes.push({ code: 'noplants' });
  let id = old?.id, made = { grading: null, paving: null, beds: [], plants: [] };
  P.change(old ? 'Parking lot: rebuild' : 'Parking lot', (s) => {
    s.landscape ||= emptyLandscape();
    const L = s.landscape;
    if (old) {   // take away what the last build made
      const m = old.made || {};
      L.grading = (L.grading || []).filter((g) => g.id !== m.grading);
      L.hardscape = (L.hardscape || []).filter((h) => h.id !== m.paving);
      L.beds = (L.beds || []).filter((b) => !(m.beds || []).includes(b.id));
      L.plants = (L.plants || []).filter((p) => !(m.plants || []).includes(p.id));
    }
    s.parking ||= [];
    id = old?.id || 'pk' + takeNumber(s);   // 0.11 DC.27: the project's counter (session tags)
    const nid = () => 'l' + takeNumber(s);
    const name = rec.name || old?.name || 'Parking lot ' + (s.parking.length + (old ? 0 : 1));
    if (res.grade && res.grade.spots.length) {
      const gid = nid();
      const raw = { id: gid, kind: 'area', name: name + ' grading', pts: boundary, spots: res.grade.spots.map((p, i) => ({ id: 's' + (i + 1), x: p.x, y: p.y, z: p.z })), contours: [] };
      const c = cleanGrading([raw], units)[0];
      if (c) { L.grading = [...(L.grading || []), c]; made.grading = gid; }
    }
    if (opts.paving !== false) {
      const pid = nid(), HD = hardDefaults(units);
      const c = cleanHardscape([{ id: pid, kind: 'paving', name: name + ' paving', pts: boundary, level: null, falls: { mode: 'none' }, grade: false, pattern: HD.paving.pattern }], units)[0];
      if (c) { L.hardscape = [...(L.hardscape || []), c]; made.paving = pid; }
    }
    if (opts.planting !== false) {
      const treeMin = opts.treeMinW || (units === 'm' ? 2.4 : 8);
      res.layout.islands.forEach((isl, i) => {
        if (shrub) { const bid = nid(); (L.beds ||= []).push({ id: bid, name: name + ' island ' + (i + 1), pts: isl.poly.map((p) => ({ x: p.x, y: p.y })), mix: [{ key: shrub.key, pct: 100 }], spacing: null, pattern: 'triangular', angle: 0, seed: i + 1 }); made.beds.push(bid); }
        if (tree && isl.width >= treeMin) { const tid = nid(); (L.plants ||= []).push({ id: tid, key: tree.key, x: isl.center.x, y: isl.center.y, z: null }); made.plants.push(tid); }
      });
    }
    const keep = { id, name, boundary, opts, made };
    const at = s.parking.findIndex((r) => r.id === id);
    if (at >= 0) s.parking[at] = keep; else s.parking.push(keep);
  });
  let vol = null;
  try { const v = made.grading ? P.volumes?.()?.items?.find((x) => x.id === made.grading) : null; if (v) vol = { cut: v.cut, fill: v.fill }; } catch { /* the project's volumes need an existing surface */ }
  return { ok: true, id, layout: res.layout, drains: res.drains, grade: res.grade, made, notes, volumes: vol, problems: [...res.layout.problems, ...(res.grade?.problems || [])] };
}

export function removeLot(P, id) {
  const old = (P.state.parking || []).find((r) => r.id === id);
  if (!old) return false;
  P.change('Parking lot: remove', (s) => {
    const m = old.made || {}, L = s.landscape;
    if (L) {
      L.grading = (L.grading || []).filter((g) => g.id !== m.grading);
      L.hardscape = (L.hardscape || []).filter((h) => h.id !== m.paving);
      L.beds = (L.beds || []).filter((b) => !(m.beds || []).includes(b.id));
      L.plants = (L.plants || []).filter((p) => !(m.plants || []).includes(p.id));
    }
    s.parking = (s.parking || []).filter((r) => r.id !== id);
    if (!s.parking.length) delete s.parking;
  });
  return true;
}
