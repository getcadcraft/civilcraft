/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/outputs.js — what a power-line study hands on (0.7 PL.7): stringing tables, the support table, material quantities
 * (CSV, XLSX, TakeoffCraft's quantities file) and the line as GIS features. No DOM. The .DON file (don.js), the PDF sheets and
 * the panel (out-ui.js) are elsewhere; they read these rows.
 * Everything comes out in the project's units: lengths and heights in m or ft, forces in daN (metres project) or lbf (feet
 * project, units.js forceUnit / toForce). `analysis` is checks.js analyzeLine's result; `lib` is a Map key → library item.
 *
 *   stringingRows(analysis, { units }) → [{ section (1-based), from, to (support indexes), Lr, temp, H, Tmax,
 *                                           spans: [{ span (index in the line), L, sag, length }] }]
 *       one row per section × temperature of the rule set's range (still air, no ice: sag.js stringingTable)
 *   stringingCsv(analysis, line, { units }) → text   a block per section: its title and ruling span, the span names and
 *       lengths, then temperature, horizontal tension and each span's sag; a blank line between blocks
 *   supportRows(analysis, line, lib, { units, cases }) → [{ i, id, name, role, item, itemKey, ground, attach, attachH, angle,
 *       load, loadCase, loadCaseName, nominal, ok, suggest, suggestKey, fdDepth, fdDia, swing, uplift, existing }]
 *       load = the worst equivalent load at the support's nominal point and its case (`cases` = state.rules.cases names it)
 *   supportTableCsv(analysis, line, lib, { units, cases }) → text
 *   quantities(state, analyses, lib, { units, groundAt, trench }) → [{ key, name, kind, unit, qty, note, item }]
 *       analyses  Map line id → analyzeLine result
 *       kind      'conductor' | 'support' | 'equipment' | 'cable' | 'trench' | 'duct' | 'excavation' | 'bedding' | 'backfill' | 'joint'
 *       unit      TakeoffCraft's: 'm' | 'LF' (lengths), 'm³' | 'CY' (volumes), 'EA' (counts)
 *       conductor per line = Σ catenary lengths of its spans in the everyday case (the rule set's first case) × phases ×
 *         circuits × (1 + JUMPER_PCT / 100): 2 % on top for jumpers, dead-end loops and sag-in waste. A span whose section
 *         did not solve counts its chord and the note says so.
 *       supports per library item (existing supports are not bought: left out, counted in the note); equipment per item:
 *         the line's equipment on every support + each support's own + free-standing equipment
 *       underground per route through underground.js trenchQuantities (cable per cable item, trench per trench type,
 *         ducts, excavation, bedding, backfill, joints; bank volumes, no swell); `trench` replaces that function (tests)
 *   quantitiesCsv(rows) → text · await quantitiesXlsx(rows, { title }) → bytes (landscape/xlsx.js)
 *   takeoffQuantities(rows, { project, made }) → TakeoffCraft's 'cadcraft-quantities' v1 object (keys 'pl:<row key>')
 *   geoFeatures(state, analyses, lib, { units }) → GeoJSON FeatureCollection in project coordinates; each feature's
 *       properties start with `kind` (one of GEO_LAYERS) and carry short upper-case names (shapefile fields: 10 letters):
 *         pl_supports         Point (z = ground): NAME LINE ROLE ITEM HEIGHT GROUND ATTACH LOAD LOAD_UNIT LOAD_CASE NOMINAL OK EXISTING
 *         pl_spans            LineString (z = attachment): NAME LINE SECTION LENGTH SAG_ED SAG_HOT CLEAR_MIN CLEAR_NEED OK
 *         pl_routes           LineString: NAME CABLE TRENCH COUNT LENGTH
 *         pl_equipment        Point: NAME ITEM TYPE LOAD_KW SOURCE
 *         pl_obstacles        LineString / pl_obstacle_pts Point: NAME HEIGHT RULE NEED
 *       heights and lengths in project units; LOAD and NOMINAL in LOAD_UNIT
 *   geoGroups(fc, { toGrid }) → gis-export.js writeExport groups [{ key, label, kind, file, geom, hasZ, fields, features: [{ g, p }] }]
 *       (x, y through toGrid, as exportGroups does), so GeoJSON / GeoPackage / KML / shapefile all come from one place
 *   GEO_LAYERS · JUMPER_PCT
 */

import { unitM, toForce, forceUnit, round } from './units.js';
import { t } from '../i18n.js';
import { writeXlsx } from '../landscape/xlsx.js';
import { mapXY } from '../gis-geom.js';
import { trenchQuantities as ugTrench } from './underground.js';

export const JUMPER_PCT = 2;
const CY_M3 = 0.764554857984;
const KIND_ORDER = ['conductor', 'support', 'equipment', 'cable', 'trench', 'duct', 'excavation', 'bedding', 'backfill', 'joint'];
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const r = (v, d = 2) => (fin(v) ? round(v, d) : '');
const nm = (line, i) => line?.supports?.[i]?.name || String(i + 1);
const getItem = (lib, k) => (k && lib ? lib.get(k) || null : null);

function cell(v) {
  let s = v == null ? '' : String(v);
  if (/^[=+\-@\t\r]/.test(s) && !/^-?\d/.test(s)) s = "'" + s;
  return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
const toCsv = (rows) => rows.map((row) => row.map(cell).join(',')).join('\r\n') + '\r\n';

/** The span's catenary in a case (section solved), or null. */
function catOf(a, spanIndex, caseId) {
  const sp = a?.spans?.[spanIndex];
  const S = sp && sp.section >= 0 ? a.sections[sp.section] : null;
  if (!S?.solve?.ok) return null;
  const k = S.spans.findIndex((x) => x.i === spanIndex);
  return k >= 0 ? S.solve.cases[caseId ?? S.solve.ref.caseId]?.spans[k] ?? null : null;
}

// ---------------------------------------------------------------------------------------------------------- stringing
export function stringingRows(analysis, { units = 'm' } = {}) {
  const um = unitM(units), out = [];
  for (const [si, S] of (analysis?.sections || []).entries()) {
    for (const row of S.stringing || []) {
      out.push({ section: si + 1, from: S.from, to: S.to, Lr: fin(S.Lr) ? S.Lr / um : null, temp: row.temp, H: toForce(row.H, units), Tmax: toForce(row.Tmax, units),
        spans: row.spans.map((sp, k) => ({ span: S.spans[k]?.i ?? k, L: sp.L / um, sag: sp.sag / um, length: sp.length / um })) });
    }
  }
  return out;
}

export function stringingCsv(analysis, line, { units = 'm' } = {}) {
  const lu = units === 'm' ? 'm' : 'ft', fu = forceUnit(units);
  const rows = stringingRows(analysis, { units });
  const out = [];
  for (const [si, S] of (analysis?.sections || []).entries()) {
    const mine = rows.filter((x) => x.section === si + 1);
    if (!mine.length) continue;
    if (out.length) out.push([]);
    const spans = mine[0].spans;
    out.push([t('pl.out.str.section', { n: si + 1, from: nm(line, S.from), to: nm(line, S.to) }), t('pl.out.str.ruling', { unit: lu }), r(mine[0].Lr)]);
    out.push([t('pl.out.str.span'), '', ...spans.map((sp) => nm(line, sp.span) + ' – ' + nm(line, sp.span + 1))]);
    out.push([t('pl.out.str.length', { unit: lu }), '', ...spans.map((sp) => r(sp.L))]);
    out.push([t('pl.out.str.temp'), t('pl.out.str.h', { unit: fu }), ...spans.map(() => t('pl.out.str.sag', { unit: lu }))]);
    for (const x of mine) out.push([x.temp, r(x.H, 1), ...x.spans.map((sp) => r(sp.sag))]);
  }
  return toCsv(out);
}

// ---------------------------------------------------------------------------------------------------------- supports
export function supportRows(analysis, line, lib, { units = 'm', cases = null } = {}) {
  const um = unitM(units);
  const caseName = (id) => (id == null ? '' : cases?.find((c) => c.id === id)?.name || id);
  return (analysis?.supports || []).map((s, i) => {
    const p = line?.supports?.[i] || {};
    const it = getItem(lib, s.item), sug = getItem(lib, s.suggest);
    return {
      i, id: s.id, name: nm(line, i), role: s.role, item: it?.name ?? (p.support || ''), itemKey: s.item ?? null,
      ground: s.groundZ ?? null, attach: s.attachZ ?? null, attachH: fin(s.attachZ) && fin(s.groundZ) ? s.attachZ - s.groundZ : null,
      angle: analysis.angles?.[i] ?? 0, load: toForce(s.worstFeq || 0, units), loadCase: s.worstCase ?? null, loadCaseName: caseName(s.worstCase),
      nominal: fin(it?.nominal_N) ? toForce(it.nominal_N, units) : null, ok: s.sizeOk ?? null,
      suggest: sug?.name ?? '', suggestKey: s.suggest ?? null,
      fdDepth: s.foundation ? s.foundation.depth_m / um : null, fdDia: s.foundation ? s.foundation.dia_m / um : null,
      swing: s.swing_deg ?? null, uplift: !!s.uplift, existing: !!p.existing,
    };
  });
}

export function supportTableCsv(analysis, line, lib, opts = {}) {
  const units = opts.units || 'm', lu = units === 'm' ? 'm' : 'ft', fu = forceUnit(units);
  const head = [t('pl.out.sup.name'), t('pl.out.sup.role'), t('pl.out.sup.item'), t('pl.out.sup.ground', { unit: lu }), t('pl.out.sup.attach', { unit: lu }),
    t('pl.out.sup.attach_h', { unit: lu }), t('pl.out.sup.angle'), t('pl.out.sup.load', { unit: fu }), t('pl.out.sup.case'), t('pl.out.sup.nominal', { unit: fu }),
    t('pl.out.sup.ok'), t('pl.out.sup.suggest'), t('pl.out.sup.fd_depth', { unit: lu }), t('pl.out.sup.fd_dia', { unit: lu }), t('pl.out.sup.swing'), t('pl.out.sup.uplift')];
  const yes = (v) => (v === true ? t('pl.out.yes') : v === false ? t('pl.out.no') : '');
  const rows = supportRows(analysis, line, lib, opts).map((x) => [x.name, t('pl.out.role.' + x.role), x.item, r(x.ground), r(x.attach), r(x.attachH), r(x.angle, 1),
    r(x.load, 1), x.loadCaseName, r(x.nominal, 1), yes(x.ok), x.suggest, r(x.fdDepth), r(x.fdDia), r(x.swing, 1), x.uplift ? t('pl.out.yes') : '']);
  return toCsv([head, ...rows]);
}

// ---------------------------------------------------------------------------------------------------------- quantities
export function quantities(state, analyses, lib, { units = 'm', groundAt = () => null, trench = ugTrench } = {}) {
  const um = unitM(units), feet = units !== 'm';
  const LU = feet ? 'LF' : 'm', VU = feet ? 'CY' : 'm³';
  const len = (m) => m / um, vol = (m3) => (feet ? m3 / CY_M3 : m3);
  const rows = [], by = new Map();
  const add = (key, kind, name, unit, qty, item = null) => {
    let x = by.get(key);
    if (!x) { x = { key, name, kind, unit, qty: 0, note: '', item }; by.set(key, x); rows.push(x); }
    x.qty += qty;
    return x;
  };
  const itemName = (k) => getItem(lib, k)?.name || k;
  const existing = new Map();

  for (const line of state.lines || []) {
    // conductor: Σ catenary lengths in the everyday case × conductors, + JUMPER_PCT
    const a = analyses?.get?.(line.id), c = getItem(lib, line.conductor);
    if (c && a && a.spans?.length) {
      let m = 0, est = 0;
      for (const sp of a.spans) {
        const cat = catOf(a, sp.i);
        if (cat) m += cat.length; else { m += Math.hypot(sp.L_m || 0, sp.dz_m || 0); est++; }
      }
      const phases = line.phases || 1, circuits = line.circuits || 1, n = phases * circuits;
      const x = add('conductor:' + line.id, 'conductor', `${c.name} (${line.name})`, LU, len(m * n * (1 + JUMPER_PCT / 100)), line.conductor);
      x.note = t('pl.out.q.cond_note', { phases, circuits, pct: JUMPER_PCT }) + (est ? ' ' + t('pl.out.q.chord', { n: est }) : '');
    }
    for (const p of line.supports || []) {
      if (p.support) {
        if (p.existing) existing.set(p.support, (existing.get(p.support) || 0) + 1);
        else add('support:' + p.support, 'support', itemName(p.support), 'EA', 1, p.support);
      }
      for (const k of [...(line.equip || []), ...(p.equip || [])]) add('equip:' + k, 'equipment', itemName(k), 'EA', 1, k);
    }
  }
  for (const [k, n] of existing) {
    const x = by.get('support:' + k) || add('support:' + k, 'support', itemName(k), 'EA', 0, k);
    x.note = t('pl.out.q.existing', { n });
  }
  for (const e of state.equipment || []) if (e.item) add('equip:' + e.item, 'equipment', itemName(e.item), 'EA', 1, e.item);

  if (typeof trench === 'function') {
    for (const route of state.routes || []) {
      const q = trench(route, { lib, units, groundAt });
      if (!q) continue;
      if (route.cable && q.cable_m > 0) add('cable:' + route.cable, 'cable', itemName(route.cable), LU, len(q.cable_m), route.cable);
      if (route.trench && q.trench_m > 0) add('trench:' + route.trench, 'trench', itemName(route.trench), LU, len(q.trench_m), route.trench);
      if (q.duct_m > 0) add('ug:ducts', 'duct', t('pl.out.q.ducts'), LU, len(q.duct_m));
      if (q.excavation_m3 > 0) add('ug:excavation', 'excavation', t('pl.out.q.excavation'), VU, vol(q.excavation_m3));
      if (q.bedding_m3 > 0) add('ug:bedding', 'bedding', t('pl.out.q.bedding'), VU, vol(q.bedding_m3));
      if (q.backfill_m3 > 0) add('ug:backfill', 'backfill', t('pl.out.q.backfill'), VU, vol(q.backfill_m3));
      const nj = Array.isArray(q.joints) ? q.joints.length : q.joints;
      if (nj > 0) add('ug:joints', 'joint', t('pl.out.q.joints'), 'EA', nj);
    }
  }
  return rows.sort((a, b) => KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind) || String(a.name).localeCompare(String(b.name)));
}

const qtyHead = () => [t('pl.out.q.item'), t('pl.out.q.unit'), t('pl.out.q.qty'), t('pl.out.q.note')];
export function quantitiesCsv(rows) {
  return toCsv([qtyHead(), ...rows.map((x) => [x.name, x.unit, r(x.qty), x.note])]);
}

export async function quantitiesXlsx(rows, { title = t('pl.out.q.title') } = {}) {
  const body = rows.map((x) => [{ v: String(x.name), s: 'text' }, x.unit, { v: round(x.qty, 2), s: 'qty' }, x.note || '']);
  return writeXlsx([{ name: t('pl.out.q.sheet'), cols: [44, 8, 14, 60], rows: [qtyHead().map((h) => ({ v: h, s: 'head' })), ...body], freeze: 1 }], { title });
}

const QKEY = /^[a-z0-9][a-z0-9:._-]{0,79}$/i;
/** TakeoffCraft's quantities format (fixedqty.js reads it), as planting.js scheduleQuantities writes it. */
export function takeoffQuantities(rows, { project = '', made = new Date().toISOString().replace(/\.\d+Z$/, 'Z') } = {}) {
  return {
    format: 'cadcraft-quantities', version: 1, app: 'CivilCraft', project: String(project).slice(0, 200), made,   // i18n-ignore: the app's name in the file
    items: rows.map((x) => ({ key: ('pl:' + x.key).slice(0, 80), name: String(x.name).slice(0, 200), unit: x.unit, qty: round(x.qty, 2), note: String(x.note || '').slice(0, 400) }))
      .filter((x) => QKEY.test(x.key) && x.qty >= 0),
  };
}

// ---------------------------------------------------------------------------------------------------------- GIS
const F = (name, type) => ({ name, type });
// i18n-ignore-start: field names written into the exported files (data, not UI)
export const GEO_LAYERS = [
  { kind: 'pl_supports', geom: 'pt', label: 'pl.out.gis.supports', fields: [F('NAME', 'text'), F('LINE', 'text'), F('ROLE', 'text'), F('ITEM', 'text'), F('HEIGHT', 'number'),
    F('GROUND', 'number'), F('ATTACH', 'number'), F('LOAD', 'number'), F('LOAD_UNIT', 'text'), F('LOAD_CASE', 'text'), F('NOMINAL', 'number'), F('OK', 'bool'), F('EXISTING', 'bool')] },
  { kind: 'pl_spans', geom: 'ln', label: 'pl.out.gis.spans', fields: [F('NAME', 'text'), F('LINE', 'text'), F('SECTION', 'number'), F('LENGTH', 'number'), F('SAG_ED', 'number'),
    F('SAG_HOT', 'number'), F('CLEAR_MIN', 'number'), F('CLEAR_NEED', 'number'), F('OK', 'bool')] },
  { kind: 'pl_routes', geom: 'ln', label: 'pl.out.gis.routes', fields: [F('NAME', 'text'), F('CABLE', 'text'), F('TRENCH', 'text'), F('COUNT', 'number'), F('LENGTH', 'number')] },
  { kind: 'pl_equipment', geom: 'pt', label: 'pl.out.gis.equipment', fields: [F('NAME', 'text'), F('ITEM', 'text'), F('TYPE', 'text'), F('LOAD_KW', 'number'), F('SOURCE', 'bool')] },
  { kind: 'pl_obstacles', geom: 'ln', label: 'pl.out.gis.obstacles', fields: [F('NAME', 'text'), F('HEIGHT', 'number'), F('RULE', 'text'), F('NEED', 'number')] },
  { kind: 'pl_obstacle_pts', geom: 'pt', label: 'pl.out.gis.obstacle_pts', fields: [F('NAME', 'text'), F('HEIGHT', 'number'), F('RULE', 'text'), F('NEED', 'number')] },
];
// i18n-ignore-end

export function geoFeatures(state, analyses, lib, { units = 'm' } = {}) {
  const um = unitM(units), feats = [];
  const R = state.rules || {};
  const need = (id) => R.clearances?.find((x) => x.id === id)?.min_m ?? R.clearances?.[0]?.min_m ?? null;
  const itemName = (k) => (k ? getItem(lib, k)?.name ?? k : '');
  const pt = (x, y, z) => ({ type: 'Point', coordinates: fin(z) ? [x, y, z] : [x, y] });
  const feat = (kind, geometry, props) => feats.push({ type: 'Feature', geometry, properties: { kind, ...props } });
  const num = (v) => (fin(v) ? v : null);
  for (const line of state.lines || []) {
    const a = analyses?.get?.(line.id) || null, P = line.supports || [];
    P.forEach((p, i) => {
      const s = a?.supports?.[i];
      const g = s?.groundZ ?? p.ground ?? null, it = getItem(lib, p.support);
      feat('pl_supports', pt(p.x, p.y, g), {
        NAME: nm(line, i), LINE: line.name || line.id, ROLE: s?.role ?? a?.roles?.[i] ?? p.role ?? 'auto', ITEM: itemName(p.support),
        HEIGHT: fin(s?.aboveGround_m) ? s.aboveGround_m / um : null, GROUND: num(g), ATTACH: num(s?.attachZ), LOAD: s ? toForce(s.worstFeq || 0, units) : null,
        LOAD_UNIT: forceUnit(units), LOAD_CASE: s?.worstCase ?? null, NOMINAL: fin(it?.nominal_N) ? toForce(it.nominal_N, units) : null, OK: s?.sizeOk ?? null, EXISTING: !!p.existing,
      });
    });
    for (let i = 0; i + 1 < P.length; i++) {
      const sp = a?.spans?.[i], A = a?.supports?.[i], B = a?.supports?.[i + 1];
      const za = A?.attachZ, zb = B?.attachZ;
      const coords = fin(za) && fin(zb) ? [[P[i].x, P[i].y, za], [P[i + 1].x, P[i + 1].y, zb]] : [[P[i].x, P[i].y], [P[i + 1].x, P[i + 1].y]];
      const ed = catOf(a, i), hot = R.hotCase ? catOf(a, i, R.hotCase) : null;
      const cl = sp ? Object.values(sp.clear || {}) : [];
      const minC = cl.length ? Math.min(...cl.map((c) => c.min_m)) : null;
      const ok = sp && (cl.length || ed) ? cl.every((c) => c.ok) && (sp.obstacles || []).every((o) => o.ok) && (!sp.spacing || sp.spacing.ok) : null;
      const nd = cl[0]?.need_m ?? need(line.clearance || 'ground');
      feat('pl_spans', { type: 'LineString', coordinates: coords }, {
        NAME: nm(line, i) + ' – ' + nm(line, i + 1), LINE: line.name || line.id, SECTION: sp && sp.section >= 0 ? sp.section + 1 : null,
        LENGTH: sp ? sp.L_m / um : Math.hypot(P[i + 1].x - P[i].x, P[i + 1].y - P[i].y), SAG_ED: ed ? ed.sag / um : null, SAG_HOT: hot ? hot.sag / um : null,
        CLEAR_MIN: minC != null ? minC / um : null, CLEAR_NEED: fin(nd) ? nd / um : null, OK: ok,
      });
    }
  }
  for (const rt of state.routes || []) {
    let L = 0;
    for (let i = 1; i < rt.pts.length; i++) L += Math.hypot(rt.pts[i].x - rt.pts[i - 1].x, rt.pts[i].y - rt.pts[i - 1].y);
    feat('pl_routes', { type: 'LineString', coordinates: rt.pts.map((q) => [q.x, q.y]) }, { NAME: rt.name || rt.id, CABLE: itemName(rt.cable), TRENCH: itemName(rt.trench), COUNT: rt.count ?? 1, LENGTH: L });
  }
  for (const e of state.equipment || []) {
    feat('pl_equipment', pt(e.x, e.y), { NAME: e.name || e.id, ITEM: itemName(e.item), TYPE: getItem(lib, e.item)?.type ?? null, LOAD_KW: num(e.load_kW), SOURCE: !!e.source });
  }
  for (const o of state.obstacles || []) {
    const nd = need(o.clearance), props = { NAME: o.name || o.id, HEIGHT: num(o.h), RULE: o.clearance || null, NEED: fin(nd) ? nd / um : null };
    if (o.pts.length >= 2) feat('pl_obstacles', { type: 'LineString', coordinates: o.pts.map((q) => [q.x, q.y]) }, props);
    else if (o.pts.length === 1) feat('pl_obstacle_pts', pt(o.pts[0].x, o.pts[0].y), props);
  }
  return { type: 'FeatureCollection', features: feats };
}

export function geoGroups(fc, { toGrid = (x, y) => [x, y] } = {}) {
  const out = [];
  for (const L of GEO_LAYERS) {
    const fs = (fc?.features || []).filter((f) => f.properties?.kind === L.kind);
    if (!fs.length) continue;
    const hasZ = fs.some((f) => (f.geometry.type === 'Point' ? f.geometry.coordinates.length > 2 : f.geometry.coordinates.some((c) => c.length > 2)));
    const z = (c) => (hasZ ? [c[0], c[1], fin(c[2]) ? c[2] : 0] : [c[0], c[1]]);
    const features = fs.map((f) => {
      const g = f.geometry.type === 'Point' ? { t: 'pt', c: z(f.geometry.coordinates) } : { t: 'ln', c: [f.geometry.coordinates.map(z)] };
      const p = Object.create(null);
      for (const fd of L.fields) p[fd.name] = f.properties[fd.name] ?? null;
      return { g: mapXY(g, toGrid), p };
    });
    out.push({ key: L.kind, label: t(L.label), kind: L.kind, file: L.kind, geom: L.geom, hasZ, fields: L.fields, features });
  }
  return out;
}
