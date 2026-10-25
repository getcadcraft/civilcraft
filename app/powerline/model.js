/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/model.js — what a CivilCraft project keeps for its power lines (0.7 Track PL): `project.state.powerlines`. No DOM.
 * Plan coordinates and heights are in the project's units (ft or m), like everything else in the project; forces and the
 * library are SI.
 *
 *   emptyPowerlines()                 → state (below)
 *   cleanPowerlines(obj)              the project file's `powerlines` (untrusted) → a fresh state; bad entries dropped
 *   cleanRules(obj)                   a rule set (untrusted: a file or the rules dialog) → a clean rule set
 *   exampleRules(which)               'cold' | 'mild' → a rule set marked as an example (every value editable)
 *   supportRoles(line, rules)         → [role] per support: 'deadend' | 'angle' | 'suspension' (set roles win; 'auto' from the turn)
 *   turnAngles(line)                  → [degrees] turn at each support (0 at the ends)
 *   sections(line, roles)             → [{ from, to }] support index ranges between dead-ends
 *   chainage(line)                    → [ch] cumulative horizontal distance at each support (project units)
 *   usedKeys(state)                   → Set of library keys the project's lines, routes and equipment use
 *
 * state = {
 *   v: 1,
 *   items: [library item…],           the project's copy of every library item it uses (a project opens anywhere)
 *   rules: { name, example, cases: [{ id, name, temp, wind_Pa, ice_mm, iceDensity, kind }], limits: [{ caseId, kind: 'H'|'T', pct }],
 *            clearances: [{ id, name, min_m }], hotCase, spacingK, swingMax_deg, sizeFactor, angleSusp_deg, angleDeadEnd_deg,
 *            temps: { from, to, step }, coverMin_m (underground minimum cover, null = the trench's), dropMax_pct (voltage drop limit),
            lsTrees, lsWalls: clearance id | null (off) — Landscape plants and walls as obstacles under overhead lines (0.7 PL.11),
            ugCross: clearance id | null (each trench's own clearance_m) — underground crossings (0.7 PL.12) },
 *   lines: [{ id, name, conductor: key, phases, circuits, voltage_kV, equip: [key] (on every support), clearance: id,
 *             supports: [{ id, x, y, name, support: key, equip: [key], role: 'auto'|'suspension'|'angle'|'deadend',
 *                          ground: z | null, h: height | null, existing }] }],
 *   routes: [{ id, name, pts: [{ x, y }], cable: key, trench: key, count, slack_pct, from: ref | null, to: ref | null,
             clearance: id | null (its crossings' rule; null = the rule set's ugCross, else the trench's) }],
 *            ref = { line, support } | { equipment }
 *   equipment: [{ id, x, y, name, item: key, load_kW, pf, source, voltage_kV (a source's working voltage; null = from the item or the line) }],
 *   obstacles: [{ id, name, pts: [{ x, y }], h, clearance: id }]     h = height above the ground (project units)
 * }
 */

import { cleanItem } from './library.js';
import { fin } from './units.js';
import { t } from '../i18n.js';

export const ROLES = ['auto', 'suspension', 'angle', 'deadend'];
export const CASE_KINDS = ['everyday', 'cold', 'hot', 'wind', 'ice', 'asym', 'other'];
const LIMITS = { lines: 500, supports: 2000, routes: 2000, pts: 5000, equipment: 5000, obstacles: 2000, items: 5000, cases: 40 };

export function exampleRules(which = 'cold') {
  const cold = which !== 'mild';
  return {
    name: t(cold ? 'pl.ex.cold' : 'pl.ex.mild'), example: true,
    cases: cold ? [
      { id: 'ed', name: t('pl.case.everyday'), kind: 'everyday', temp: 15, wind_Pa: 0, ice_mm: 0 },
      { id: 'cold', name: t('pl.case.cold'), kind: 'cold', temp: -20, wind_Pa: 0, ice_mm: 0 },
      { id: 'wind', name: t('pl.case.wind'), kind: 'wind', temp: 15, wind_Pa: 480, ice_mm: 0 },
      { id: 'ice', name: t('pl.ex.icewind'), kind: 'ice', temp: -5, wind_Pa: 180, ice_mm: 10, iceDensity: 900 },
      { id: 'asym', name: t('pl.case.asym'), kind: 'asym', temp: -5, wind_Pa: 0, ice_mm: 10, iceDensity: 900 },
      { id: 'hot', name: t('pl.case.hot'), kind: 'hot', temp: 60, wind_Pa: 0, ice_mm: 0 },
    ] : [
      { id: 'ed', name: t('pl.case.everyday'), kind: 'everyday', temp: 15, wind_Pa: 0, ice_mm: 0 },
      { id: 'cold', name: t('pl.case.cold'), kind: 'cold', temp: -5, wind_Pa: 0, ice_mm: 0 },
      { id: 'wind', name: t('pl.case.wind'), kind: 'wind', temp: 10, wind_Pa: 570, ice_mm: 0 },
      { id: 'hot', name: t('pl.case.hot'), kind: 'hot', temp: 75, wind_Pa: 0, ice_mm: 0 },
    ],
    limits: [{ caseId: 'ed', kind: 'H', pct: 18 }, { caseId: cold ? 'ice' : 'wind', kind: 'T', pct: 50 }, ...(cold ? [{ caseId: 'cold', kind: 'T', pct: 50 }] : [])],
    clearances: [
      { id: 'ground', name: t('pl.ex.cl.ground'), min_m: 6 }, { id: 'road', name: t('pl.ex.cl.road'), min_m: 7 }, { id: 'building', name: t('pl.ex.cl.building'), min_m: 3 },
      { id: 'water', name: t('pl.ex.cl.water'), min_m: 6 }, { id: 'line', name: t('pl.ex.cl.line'), min_m: 1.5 },
      { id: 'vegetation', name: t('pl.ex.cl.vegetation'), min_m: 3 }, { id: 'underground', name: t('pl.ex.cl.underground'), min_m: 0.3 },
    ],
    lsTrees: 'vegetation', lsWalls: 'building', ugCross: 'underground',
    hotCase: 'hot', iceCase: cold ? 'ice' : null, asymCase: cold ? 'asym' : null, windCase: 'wind',
    spacingK: 0.6, swingMax_deg: 45, sizeFactor: 1.0, angleSusp_deg: 5, angleDeadEnd_deg: 60,
    temps: { from: -5, to: 40, step: 5 },
    coverMin_m: null, dropMax_pct: 5,
  };
}

export function emptyPowerlines() {
  return { v: 1, items: [], rules: exampleRules('cold'), lines: [], routes: [], equipment: [], obstacles: [] };
}

const str = (v, max = 120) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');
const num = (v, lo, hi, d = null) => (fin(v) && v >= lo && v <= hi ? v : d);
const idOk = (v, pre) => (new RegExp('^' + pre + '\\d{1,9}$').test(String(v)) ? String(v) : null);
const keyOk = (v) => (typeof v === 'string' && /^[A-Za-z0-9_.:-]{1,64}$/.test(v) ? v : null);
const keys = (a, max = 20) => (Array.isArray(a) ? a.map(keyOk).filter(Boolean).slice(0, max) : []);
const xy = (q) => (q && fin(q.x) && fin(q.y) && Math.abs(q.x) < 1e9 && Math.abs(q.y) < 1e9 ? { x: q.x, y: q.y } : null);
const list = (a, max) => (Array.isArray(a) ? a.slice(0, max) : []);

export function cleanRules(r) {
  const base = exampleRules('cold');
  if (!r || typeof r !== 'object') return base;
  const caseIds = new Set();
  const cases = list(r.cases, LIMITS.cases).map((c) => {
    const id = typeof c?.id === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(c.id) && !caseIds.has(c.id) ? c.id : null;
    if (!id) return null;
    caseIds.add(id);
    return { id, name: str(c.name) || id, kind: CASE_KINDS.includes(c.kind) ? c.kind : 'other', temp: num(c.temp, -80, 250, 15),
      wind_Pa: num(c.wind_Pa, 0, 20000, 0), ice_mm: num(c.ice_mm, 0, 200, 0), iceDensity: num(c.iceDensity, 100, 1000, 900) };
  }).filter(Boolean);
  if (!cases.length) return base;
  const limits = list(r.limits, 40).map((l) => (caseIds.has(l?.caseId) ? { caseId: l.caseId, kind: l.kind === 'T' ? 'T' : 'H', ...(fin(l.fixed) && l.fixed > 0 ? { fixed: l.fixed } : { pct: num(l.pct, 0.1, 100, 20) }) } : null)).filter(Boolean);
  const cl = list(r.clearances, 60).map((c) => (typeof c?.id === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(c.id) ? { id: c.id, name: str(c.name) || c.id, min_m: num(c.min_m, 0, 100, 0) } : null)).filter(Boolean);
  const pick = (v) => (caseIds.has(v) ? v : null);
  const clIds = new Set((cl.length ? cl : base.clearances).map((c) => c.id));
  // a clearance id; null = off; absent (an older rule set) = the first of the defaults that this set has, else the first rule
  const clPick = (v, defs) => (v === null ? null : clIds.has(v) ? v : defs.find((d) => clIds.has(d)) ?? (cl[0] || base.clearances[0]).id);
  return {
    name: str(r.name) || base.name, example: r.example === true, cases, limits: limits.length ? limits : [{ caseId: cases[0].id, kind: 'H', pct: 18 }],
    clearances: cl.length ? cl : base.clearances, hotCase: pick(r.hotCase), iceCase: pick(r.iceCase), asymCase: pick(r.asymCase), windCase: pick(r.windCase),
    spacingK: num(r.spacingK, 0, 5, base.spacingK), swingMax_deg: num(r.swingMax_deg, 0, 90, base.swingMax_deg), sizeFactor: num(r.sizeFactor, 0.5, 5, 1),
    angleSusp_deg: num(r.angleSusp_deg, 0, 90, base.angleSusp_deg), angleDeadEnd_deg: num(r.angleDeadEnd_deg, 0, 180, base.angleDeadEnd_deg),
    temps: { from: num(r.temps?.from, -60, 100, -5), to: num(r.temps?.to, -60, 120, 40), step: num(r.temps?.step, 0.5, 50, 5) },
    coverMin_m: num(r.coverMin_m, 0, 10, null), dropMax_pct: num(r.dropMax_pct, 0.1, 50, 5),
    lsTrees: clPick(r.lsTrees, ['vegetation', 'building']), lsWalls: clPick(r.lsWalls, ['building']),
    ugCross: r.ugCross === null ? null : clIds.has(r.ugCross) ? r.ugCross : clIds.has('underground') ? 'underground' : null,
  };
}

export function cleanPowerlines(obj) {
  const s = emptyPowerlines();
  if (!obj || typeof obj !== 'object') return s;
  const notes = [];
  s.items = list(obj.items, LIMITS.items).map((it) => cleanItem(it, notes)).filter(Boolean);
  s.rules = cleanRules(obj.rules);
  s.lines = list(obj.lines, LIMITS.lines).map((l) => {
    const id = idOk(l?.id, 'e');
    if (!id) return null;
    const supports = list(l.supports, LIMITS.supports).map((p) => {
      const q = xy(p), sid = idOk(p?.id, 'e');
      if (!q || !sid) return null;
      return { id: sid, ...q, name: str(p.name, 40), support: keyOk(p.support), equip: keys(p.equip), role: ROLES.includes(p.role) ? p.role : 'auto',
        ground: num(p.ground, -1e6, 1e6, null), h: num(p.h, 0, 1000, null), existing: p.existing === true };
    }).filter(Boolean);
    return { id, name: str(l.name) || id, conductor: keyOk(l.conductor), phases: num(l.phases, 1, 12, 3), circuits: num(l.circuits, 1, 4, 1),
      voltage_kV: num(l.voltage_kV, 0, 1200, 0.4), equip: keys(l.equip), clearance: typeof l.clearance === 'string' ? str(l.clearance, 24) : 'ground', supports };
  }).filter(Boolean);
  const ref = (r) => {
    if (!r || typeof r !== 'object') return null;
    if (idOk(r.line, 'e') && idOk(r.support, 'e')) return { line: r.line, support: r.support };
    if (idOk(r.equipment, 'e')) return { equipment: r.equipment };
    return null;
  };
  s.routes = list(obj.routes, LIMITS.routes).map((r) => {
    const id = idOk(r?.id, 'e');
    const pts = list(r?.pts, LIMITS.pts).map(xy).filter(Boolean);
    if (!id || pts.length < 2) return null;
    return { id, name: str(r.name) || id, pts, cable: keyOk(r.cable), trench: keyOk(r.trench), count: num(r.count, 1, 64, 1), slack_pct: num(r.slack_pct, 0, 50, 3),
      from: ref(r.from), to: ref(r.to), clearance: typeof r.clearance === 'string' && /^[A-Za-z0-9_-]{1,24}$/.test(r.clearance) ? r.clearance : null };
  }).filter(Boolean);
  s.equipment = list(obj.equipment, LIMITS.equipment).map((e) => {
    const id = idOk(e?.id, 'e'), q = xy(e);
    if (!id || !q) return null;
    return { id, ...q, name: str(e.name, 60), item: keyOk(e.item), load_kW: num(e.load_kW, 0, 1e6, 0), pf: num(e.pf, 0.1, 1, 0.95), source: e.source === true, voltage_kV: num(e.voltage_kV, 0, 1200, null) };
  }).filter(Boolean);
  s.obstacles = list(obj.obstacles, LIMITS.obstacles).map((o) => {
    const id = idOk(o?.id, 'e');
    const pts = list(o?.pts, 500).map(xy).filter(Boolean);
    if (!id || !pts.length) return null;
    return { id, name: str(o.name, 60), pts, h: num(o.h, 0, 1000, 0), clearance: typeof o.clearance === 'string' ? str(o.clearance, 24) : 'ground' };
  }).filter(Boolean);
  return s;
}

export function turnAngles(line) {
  const P = line.supports;
  return P.map((p, i) => {
    if (i === 0 || i === P.length - 1) return 0;
    const a = Math.atan2(p.y - P[i - 1].y, p.x - P[i - 1].x), b = Math.atan2(P[i + 1].y - p.y, P[i + 1].x - p.x);
    let d = b - a;
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    return Math.abs(d) * 180 / Math.PI;
  });
}

export function supportRoles(line, rules) {
  const ang = turnAngles(line), n = line.supports.length;
  return line.supports.map((p, i) => {
    if (p.role && p.role !== 'auto') return p.role;
    if (i === 0 || i === n - 1) return 'deadend';
    if (ang[i] >= (rules?.angleDeadEnd_deg ?? 60)) return 'deadend';
    if (ang[i] > (rules?.angleSusp_deg ?? 5)) return 'angle';
    return 'suspension';
  });
}

export function sections(line, roles) {
  const out = [];
  let from = 0;
  for (let i = 1; i < line.supports.length; i++) if (roles[i] === 'deadend' || i === line.supports.length - 1) { out.push({ from, to: i }); from = i; }
  return out;
}

export function chainage(line) {
  let c = 0;
  return line.supports.map((p, i) => { if (i) c += Math.hypot(p.x - line.supports[i - 1].x, p.y - line.supports[i - 1].y); return c; });
}

export function usedKeys(s) {
  const k = new Set();
  for (const l of s.lines) { if (l.conductor) k.add(l.conductor); l.equip.forEach((e) => k.add(e)); for (const p of l.supports) { if (p.support) k.add(p.support); p.equip.forEach((e) => k.add(e)); } }
  for (const r of s.routes) { if (r.cable) k.add(r.cable); if (r.trench) k.add(r.trench); }
  for (const e of s.equipment) if (e.item) k.add(e.item);
  return k;
}
