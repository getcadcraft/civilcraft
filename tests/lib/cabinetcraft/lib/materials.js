/* SPDX-License-Identifier: Apache-2.0 */
/**
 * materials.js — the sheet materials and edge bands a job picks from, and what the picks do to the construction rules
 * (0.8 DC.117, session `cabinetcraft_addon`). DOM-free; imports model.js and core.js.
 *
 * The library lists generic stock by kind and thickness. It names no maker and no product. Sheet sizes are common stock sizes
 * and the person can change every one; PRICES are not here (estimate.js keeps them, as labelled placeholders until a shop
 * supplies its own: owner rule EG.76).
 *
 *   SHEETS { id: { w, h, label } }   stock sizes in mm (inch jobs get the same sheets in inches: 96 × 48 in)
 *   MATERIALS [{ id, role ('carcass' | 'back' | 'fronts' | 'drawer' | 'drawer-bottom' | 'frame'), name (word key 'lib.mat.<id>'),
 *                thickness (mm), inch (inches, for an inch job), grain ('length' | 'none'), sheet (SHEETS id) }]
 *   BANDS [{ id, name ('lib.band.<id>'), thickness (mm), inch }]
 *   DEFAULT_PICKS { carcass, back, fronts, drawer, drawerBottom, frame, bandCarcass, bandFront, bandDrawer } (library ids)
 *   cleanPicks(picks, custom?) → picks with only known ids (custom = the job's own materials, see cleanCustom)
 *   cleanCustom(list) → a job's own materials [{ id 'my-…', role, name, thickness, grain, sheet: {w, h} }] (untrusted)
 *   rulesFromPicks(unit, picks, { say, custom, over }) → the model.js rule set with the materials' thicknesses and names written in
 *   sheetFor(name, thickness, ctx) → { w, h } for a material of that written name and thickness (the nest uses it)
 */
import { rulesFor } from './model.js';
import { num } from './core.js';

export const SHEETS = {
  '2440x1220': { w: 2440, h: 1220 },
  '2800x2070': { w: 2800, h: 2070 },
  '3050x1310': { w: 3050, h: 1310 },
  '2440x1830': { w: 2440, h: 1830 },
};
const M = (id, role, thickness, inch, grain = 'length', sheet = '2440x1220') => ({ id, role, name: 'lib.mat.' + id, thickness, inch, grain, sheet });
export const MATERIALS = [
  M('melamine-18', 'carcass', 18, 0.75), M('melamine-16', 'carcass', 16, 0.625), M('ply-18', 'carcass', 18, 0.75), M('ply-15', 'carcass', 15, 0.5906),
  M('hdf-8', 'back', 8, 0.3125, 'none'), M('hdf-3', 'back', 3, 0.125, 'none'), M('ply-6', 'back', 6, 0.25, 'none'),
  M('mdf-painted-18', 'fronts', 18, 0.75), M('laminate-19', 'fronts', 19, 0.75), M('veneer-ply-18', 'fronts', 18, 0.75), M('melamine-front-18', 'fronts', 18, 0.75),
  M('hardwood-19', 'frame', 19, 0.75), M('hardwood-25', 'frame', 25, 1),
  M('drawer-ply-15', 'drawer', 15, 0.5906), M('drawer-melamine-16', 'drawer', 16, 0.625),
  M('drawer-bottom-hdf-6', 'drawer-bottom', 6, 0.25, 'none'), M('drawer-bottom-ply-9', 'drawer-bottom', 9, 0.375, 'none'),
];
export const BANDS = [
  { id: 'pvc-1', name: 'lib.band.pvc-1', thickness: 1, inch: 0.04 },
  { id: 'pvc-2', name: 'lib.band.pvc-2', thickness: 2, inch: 0.08 },
  { id: 'abs-04', name: 'lib.band.abs-04', thickness: 0.4, inch: 0.016 },
  { id: 'veneer-05', name: 'lib.band.veneer-05', thickness: 0.5, inch: 0.02 },
];
export const DEFAULT_PICKS = { carcass: 'melamine-18', back: 'hdf-8', fronts: 'mdf-painted-18', drawer: 'drawer-ply-15', drawerBottom: 'drawer-bottom-hdf-6', frame: 'hardwood-19', bandCarcass: 'pvc-1', bandFront: 'pvc-2', bandDrawer: 'pvc-1' };
const ROLE = { carcass: 'carcass', back: 'back', fronts: 'fronts', drawer: 'drawer', drawerBottom: 'drawer-bottom', frame: 'frame' };

export function cleanCustom(list) {
  const out = [];
  for (const m of Array.isArray(list) ? list.slice(0, 40) : []) {
    if (!m || typeof m !== 'object') continue;
    const id = String(m.id || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
    const role = ['carcass', 'back', 'fronts', 'drawer', 'drawer-bottom', 'frame', 'band'].includes(m.role) ? m.role : null;
    const name = String(m.name || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 60);
    const th = num(m.thickness, NaN);
    if (!id.startsWith('my-') || !role || !name || !(th > 0 && th < 200)) continue;
    const w = num(m.sheet?.w, 0), h = num(m.sheet?.h, 0);
    out.push({ id, role, name, thickness: th, grain: m.grain === 'none' ? 'none' : 'length', ...(w > 0 && h > 0 ? { sheet: { w, h } } : {}) });
  }
  return out;
}

const find = (id, custom) => MATERIALS.find((x) => x.id === id) || BANDS.find((x) => x.id === id) || (custom || []).find((x) => x.id === id) || null;

export function cleanPicks(picks, custom = []) {
  const out = { ...DEFAULT_PICKS };
  for (const k of Object.keys(DEFAULT_PICKS)) {
    const id = picks && typeof picks[k] === 'string' ? picks[k] : null;
    const m = id ? find(id, custom) : null;
    if (!m) continue;
    const isBand = k.startsWith('band');
    if (isBand ? !(BANDS.includes(m) || m.role === 'band') : m.role !== ROLE[k]) continue;
    out[k] = id;
  }
  return out;
}

const thicknessIn = (m, unit) => (String(m.id).startsWith('my-') ? m.thickness : unit === 'in' ? m.inch : m.thickness);   // a job's own material is typed in the job's unit
/** A material's name as written in the person's language, with its thickness (a library word key); a typed name is kept. */
export const writtenName = (m, say, unit) => (typeof m.name === 'string' && m.name.startsWith('lib.') ? say(m.name, { t: thicknessIn(m, unit), unit }) : m.name);

/** `say(key)` writes a library word key in the person's language (identity in the tests); a custom name is kept as typed. */
export function rulesFromPicks(unit, picks, { say = (k) => k, custom = [], over = {} } = {}) {
  const P = cleanPicks(picks, custom);
  const inch = unit === 'in';
  const th = (m) => thicknessIn(m, unit);
  const nm = (m) => writtenName(m, say, unit);
  const car = find(P.carcass, custom), back = find(P.back, custom), fr = find(P.fronts, custom), dr = find(P.drawer, custom), db = find(P.drawerBottom, custom);
  const band = (id) => { const b = find(id, custom); return { code: nm(b), thickness: Math.round(th(b) * 1e4) / 1e4 }; };
  const r = {
    t: th(car), carcass: nm(car),
    backT: th(back), groove: Math.min(th(back), th(car) * 0.6), backMat: nm(back),
    frontT: th(fr), frontMat: nm(fr),
    drawerT: th(dr), drawerMat: nm(dr),
    drawerBottomT: th(db), drawerBottomMat: nm(db),
    bandCarcass: band(P.bandCarcass), bandFront: band(P.bandFront), bandDrawer: band(P.bandDrawer),
  };
  // the groove follows the back unless the shop typed one; the shop's own numbers (over) win over everything above
  return rulesFor(unit, { ...r, ...over });
}

/** The face frame's stock: { mat (written name), t (thickness) } — hardwood boards, cut by the length, not nested on sheets. */
export function frameFromPicks(unit, picks, { say = (k) => k, custom = [] } = {}) {
  const m = find(cleanPicks(picks, custom).frame, custom);
  return { mat: writtenName(m, say, unit), t: thicknessIn(m, unit) };
}

/** The sheet a material is cut from: by the written name and thickness, else the default sheet of the job. */
export function sheetFor(name, thickness, { picks = DEFAULT_PICKS, custom = [], say = (k) => k, unit = 'mm', fallback = { w: 2440, h: 1220 } } = {}) {
  const P = cleanPicks(picks, custom);
  const k = unit === 'in' ? 25.4 : 1;
  for (const id of [P.carcass, P.back, P.fronts, P.drawer, P.drawerBottom]) {
    const m = find(id, custom);
    if (!m) continue;
    if (writtenName(m, say, unit) === name) {
      if (m.sheet && typeof m.sheet === 'object') return { w: m.sheet.w, h: m.sheet.h };   // typed in the job's unit
      const s = SHEETS[m.sheet];
      if (s) return { w: Math.round((s.w / k) * 4) / 4, h: Math.round((s.h / k) * 4) / 4 };
    }
  }
  return { w: fallback.w, h: fallback.h };
}

/** The written names of the job's picks: materialNames Map(written name → library id), bandNames Map(library id → written code). */
export function namesOf(unit, picks, { say = (k) => k, custom = [] } = {}) {
  const P = cleanPicks(picks, custom);
  const materialNames = new Map(), bandNames = new Map();
  for (const k of ['carcass', 'back', 'fronts', 'drawer', 'drawerBottom', 'frame']) { const m = find(P[k], custom); if (m) materialNames.set(writtenName(m, say, unit), m.id); }
  for (const k of ['bandCarcass', 'bandFront', 'bandDrawer']) { const m = find(P[k], custom); if (m) bandNames.set(m.id, writtenName(m, say, unit)); }
  return { materialNames, bandNames };
}
