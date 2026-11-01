/* SPDX-License-Identifier: Apache-2.0 */
/**
 * project.js — a CabinetCraft job and its room/run layout (0.8 DC.117, session `cabinetcraft_addon`). DOM-free.
 *
 * A job is plain data, saved as a `.cabinetcraft.json` file and in the browser. Everything read from a file is untrusted: cleanProject
 * keeps known fields only, bounds every number and every list, and drops what it cannot use. Sizes are in the job's unit (mm or in).
 *
 *   project = { cabinetcraft: 1, name, unit, hw (cornerdrill.js: sizes typed from the person's hardware; none until typed), room: { w, d, h, shape, notch?, pts? } (room.js: rectangle, L, U or free outline), islands (below), openings (room.js: doors and windows in walls), construction ('frameless' | 'faceframe'), rules (shop overrides of model.js RULES),
 *               ff (face-frame overrides), picks (materials.js), custom (own materials), sheet: { w, h, margin, spacing },
 *               counter: { t, front, end }, rates (estimate.js overrides), runs: [{ id, name, wall ('S' | 'E' | 'N' | 'W'), from, to, autoFiller, endPanels: { start, end },
 *               base: [item], upper: [item] }] }
 *   island = { id ('I1'…), name, kind ('island' | 'peninsula'), x, y (where its back line starts, plan), rot (0 | 90 | 180 | 270: the way the back line runs; the fronts face its left),
 *              len, attach: { start, end } (an end against a wall: a peninsula), seat (counter overhang over the back, mm), autoFiller, endPanels, base: [item], back: [item] (a second row facing the other way) }
 *   item = { kind: 'cab', tpl, w, hinge, h?, d?, shelves?, doors?, drawers?, blind?, elev?, construction?, note? }
 *        | { kind: 'gap', w, counter? }      (an appliance's space; counter: true keeps the countertop going over it)
 *        | { kind: 'filler', w }
 *   newProject(unit) · sampleProject(unit) · cleanProject(raw) · wallFrame(wall, room) · wallLength(wall, room)
 *   layoutProject(project, { rules, depthOf }) → { runs: [{ run, wall, frame, len, rows: { base, upper } }], counters, numbers }
 *     a row = { cells: [{ kind: 'cab' | 'gap' | 'filler' | 'endpanel', no, x, w, ... }], start, end (the usable span along the wall),
 *               blocked: { start, end }, used, rest, depth }
 *     Rows: the floor row (base, drawer, tall cabinets) and the upper row (hung cabinets). Where two runs meet in a room corner both
 *     reach, the one listed LATER stops short by the other's depth in that row (their backs butt), so nothing overlaps.
 */
import { rulesFor, cleanCabinet, prefixOf } from './model.js';
import { resolveEntry, templateById, rowOf } from './catalog.js';
import { cleanPicks, cleanCustom, DEFAULT_PICKS } from './materials.js';
import { readRates, leafPaths } from './estimate.js';
import { num, clamp, conv, r6 } from './core.js';
import { cleanRoom, cleanOpenings, walls as roomWalls } from './room.js';
import { hwOf } from './cornerdrill.js';
import { stepArc, cornerBlock, wedgeCorner, diagAt } from './angled.js';
import { overlap, toWorld } from './footprint.js';

export const WALLS = ['S', 'E', 'N', 'W'];
const MAX = { runs: 12, items: 60, name: 60, note: 160, islands: 6 };
const txt = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, n);

export function newProject(unit = 'mm') {
  const u = unit === 'in' ? 'in' : 'mm';
  return {
    cabinetcraft: 1, name: '', unit: u,
    room: { w: conv(3600, u), d: conv(3000, u), h: conv(2400, u), shape: 'rect' }, islands: [], openings: [],
    construction: 'frameless', rules: {}, ff: {}, picks: { ...DEFAULT_PICKS }, custom: [],
    sheet: { w: conv(2440, u), h: conv(1220, u), margin: conv(10, u), spacing: conv(8, u) },
    counter: { t: conv(38, u), front: conv(25, u), end: conv(25, u) },
    rates: {}, ratesOk: [], hw: {}, runs: [],
  };
}

export function wallLength(wall, room) { const w = roomWalls(room).find((x) => x.id === wall); return w ? w.len : roomWalls(room)[0].len; }

/** The frame of a wall: origin (the wall's start corner, going round counter-clockwise from the first wall), u along the wall, n into the room. */
export function wallFrame(wall, room) {
  const w = roomWalls(room).find((x) => x.id === wall) || roomWalls(room)[0];
  return w.frame;
}
export const wallIds = (room) => roomWalls(room).map((w) => w.id);

export function cleanItem(raw, unit) {
  if (!raw || typeof raw !== 'object') return null;
  const w = num(raw.w, NaN);
  if (raw.kind === 'gap') return w > 0 && w < 10000 ? { kind: 'gap', w, counter: !!raw.counter } : null;
  if (raw.kind === 'filler') return w > 0 && w < 10000 ? { kind: 'filler', w } : null;
  if (raw.kind !== 'cab' || !templateById(raw.tpl)) return null;
  const out = { kind: 'cab', tpl: String(raw.tpl), hinge: raw.hinge === 'right' ? 'right' : 'left' };
  const pos = (k, hi = 10000) => { const v = num(raw[k], NaN); if (v > 0 && v < hi) out[k] = v; };
  for (const k of ['w', 'h', 'd']) pos(k);
  if (raw.elev !== undefined && num(raw.elev, NaN) >= 0 && num(raw.elev, NaN) < 10000) out.elev = num(raw.elev, 0);
  if (raw.shelves !== undefined && raw.shelves !== '' && num(raw.shelves, NaN) >= 0) out.shelves = clamp(Math.round(num(raw.shelves, 0)), 0, 12);
  if (raw.drawers !== undefined && raw.drawers !== '' && num(raw.drawers, NaN) >= 1) out.drawers = clamp(Math.round(num(raw.drawers, 3)), 1, 8);
  if (raw.doors === 0 || raw.doors === 1 || raw.doors === 2 || raw.doors === 'auto') out.doors = raw.doors;
  else if (raw.doors === '0' || raw.doors === '1' || raw.doors === '2') out.doors = Number(raw.doors);
  if (raw.blind !== undefined && num(raw.blind, NaN) >= 0 && num(raw.blind, NaN) < 2000) out.blind = num(raw.blind, 0);
  if (raw.construction === 'frameless' || raw.construction === 'faceframe') out.construction = raw.construction;
  if (raw.note) out.note = txt(raw.note, MAX.note);
  if (!(out.w > 0)) { const r = resolveEntry(out, unit); if (r) out.w = r.cab.w; }
  return out;
}

export function cleanProject(raw) {
  const base = newProject(raw && raw.unit === 'in' ? 'in' : 'mm');
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const unit = base.unit;
  const p = { ...base, name: txt(raw.name, MAX.name) };
  const room = raw.room || {};
  p.room = cleanRoom(room, base.room);
  p.construction = raw.construction === 'faceframe' ? 'faceframe' : 'frameless';
  p.rules = {}; p.ff = {};
  const R0 = rulesFor(unit);
  for (const [k, v] of Object.entries(raw.rules && typeof raw.rules === 'object' ? raw.rules : {})) if (k in R0) p.rules[k] = v;
  p.rules = Object.fromEntries(Object.entries(p.rules).filter(([k]) => rulesFor(unit, { [k]: p.rules[k] })[k] !== R0[k] || JSON.stringify(rulesFor(unit, { [k]: p.rules[k] })[k]) !== JSON.stringify(R0[k])));
  for (const [k, v] of Object.entries(raw.ff && typeof raw.ff === 'object' ? raw.ff : {})) if (Number.isFinite(num(v, NaN)) && num(v, NaN) >= 0 && ['stile', 'rail', 't', 'overlay', 'gap'].includes(k)) p.ff[k] = num(v, 0);
  p.custom = cleanCustom(raw.custom);
  p.picks = cleanPicks(raw.picks, p.custom);
  const sh = raw.sheet || {};
  p.sheet = { w: clamp(num(sh.w, base.sheet.w), 1, 1e5), h: clamp(num(sh.h, base.sheet.h), 1, 1e5), margin: clamp(num(sh.margin, base.sheet.margin), 0, 1e4), spacing: clamp(num(sh.spacing, base.sheet.spacing), 0, 1e4) };
  const c = raw.counter || {};
  p.counter = { t: clamp(num(c.t, base.counter.t), 0, 1e3), front: clamp(num(c.front, base.counter.front), 0, 1e3), end: clamp(num(c.end, base.counter.end), 0, 1e3) };
  p.rates = readRates(raw.rates);
  { const known = new Set(leafPaths()); p.ratesOk = (Array.isArray(raw.ratesOk) ? raw.ratesOk : []).filter((x) => typeof x === 'string' && known.has(x)).slice(0, 400); }   // rates the shop confirmed as its own even though they equal the placeholder
  p.hw = Object.fromEntries(Object.entries(hwOf(raw.hw)).filter(([, v]) => v !== ''));   // the person's own fixing, shaft and pivot sizes: only what was typed
  const seen = new Set();
  p.runs = (Array.isArray(raw.runs) ? raw.runs.slice(0, MAX.runs) : []).map((r, i) => {
    if (!r || typeof r !== 'object') return null;
    const ids = wallIds(p.room);
    const wall = ids.includes(r.wall) ? r.wall : ids[0];
    let id = txt(r.id, 12).replace(/[^A-Za-z0-9-]/g, '') || String.fromCharCode(65 + i);
    while (seen.has(id)) id += 'x';
    seen.add(id);
    const len = wallLength(wall, p.room);
    const from = clamp(num(r.from, 0), 0, len), to = clamp(num(r.to, len), from, len);
    const ep = r.endPanels || {};
    const tri = (v) => (v === true || v === false ? v : 'auto');
    const items = (a) => (Array.isArray(a) ? a.slice(0, MAX.items) : []).map((x) => cleanItem(x, unit)).filter(Boolean);
    return { id, name: txt(r.name, MAX.name), wall, from, to, autoFiller: r.autoFiller !== false, endPanels: { start: tri(ep.start), end: tri(ep.end) }, base: items(r.base).filter((x) => x.kind !== 'cab' || rowOf(x) === 'base'), upper: items(r.upper).filter((x) => x.kind !== 'cab' || rowOf(x) === 'upper') };
  }).filter(Boolean);
  p.openings = cleanOpenings(raw.openings, p.room, unit);
  { const site = cleanSite(raw.site); if (site) p.site = site; }   // where the room sits in the host's model (BimCraft storey, ModelCraft floor, CadCraft drawing): see fromroom.js
  p.islands = cleanIslands(raw.islands, p.room, unit, seen, (a) => (Array.isArray(a) ? a.slice(0, MAX.items) : []).map((x) => cleanItem(x, unit)).filter(Boolean));
  return p;
}

/** Where the room came from in the host's model: { host, storey, name, ox, oy, oz } (mm; the room's own origin is the outline's lower-left corner). */
function cleanSite(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const n = (v) => clamp(num(v, 0), -1e8, 1e8);
  return { host: txt(raw.host, 16).replace(/[^a-z]/g, ''), storey: txt(raw.storey, 64).replace(/[^A-Za-z0-9_$-]/g, ''), name: txt(raw.name, 60), ox: n(raw.ox), oy: n(raw.oy), oz: n(raw.oz) };
}

function cleanIslands(list, room, unit, seen, items) {
  const out = [];
  for (const r of (Array.isArray(list) ? list.slice(0, MAX.islands) : [])) {
    if (!r || typeof r !== 'object') continue;
    let id = txt(r.id, 12).replace(/[^A-Za-z0-9-]/g, '') || 'I' + (out.length + 1);
    while (seen.has(id) || seen.has(id + 'b')) id += 'x';
    seen.add(id); seen.add(id + 'b');
    const rot = [0, 90, 180, 270].includes(Number(r.rot)) ? Number(r.rot) : 0;
    const at = r.attach && typeof r.attach === 'object' ? r.attach : {};
    const floor = (x) => x.kind !== 'cab' || rowOf(x) === 'base';
    out.push({
      id, name: txt(r.name, MAX.name), kind: r.kind === 'peninsula' ? 'peninsula' : 'island',
      x: clamp(num(r.x, room.w / 3), -1e5, 1e5), y: clamp(num(r.y, room.d / 2), -1e5, 1e5), rot, len: clamp(num(r.len, conv(1800, unit)), 1, 1e5),
      attach: { start: at.start === true, end: at.end === true }, seat: clamp(num(r.seat, 0), 0, 2000),
      autoFiller: r.autoFiller !== false, endPanels: { start: triOf(r.endPanels?.start), end: triOf(r.endPanels?.end) },
      base: items(r.base).filter(floor), back: items(r.back).filter(floor),
    });
  }
  return out;
}
const triOf = (v) => (v === true || v === false ? v : 'auto');

/** A small kitchen to start from: an L of two runs, a sink base, drawers, wall cabinets and a pantry. `words` = { name, north, east } in the person's language. */
export function sampleProject(unit = 'mm', words = {}) {
  const u = unit === 'in' ? 'in' : 'mm';
  const c = (v) => conv(v, u);
  const p = newProject(u);
  p.name = words.name || '';
  p.room = { w: c(3600), d: c(3000), h: c(2400) };
  const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w: c(w), ...extra });
  p.runs = [
    { id: 'A', name: words.north || '', wall: 'N', from: 0, to: p.room.w, autoFiller: true, endPanels: { start: 'auto', end: 'auto' },
      base: [cab('tall-pantry', 600), cab('base-drawers3', 600), cab('base-sink', 900), { kind: 'gap', w: c(600), counter: true }, cab('base-pair', 900)],
      upper: [{ kind: 'gap', w: c(600) }, cab('wall-pair', 800), cab('wall-door', 600), cab('wall-door', 600)] },
    { id: 'B', name: words.east || '', wall: 'E', from: 0, to: p.room.d, autoFiller: true, endPanels: { start: 'auto', end: 'auto' },
      base: [cab('base-drawers2', 450), cab('base-door', 600, { hinge: 'right' })], upper: [cab('wall-open', 600)] },
  ];
  // the north run's start is its wall's start (the north-east corner as you face it); the east wall's end meets it
  return cleanProject(p);
}

/** The islands as runs of their own: the front row faces the island's left, a back row (if it has items) faces the other way from the far end. */
export function islandRuns(p) {
  const out = [];
  for (const isl of p.islands || []) {
    const a = (isl.rot * Math.PI) / 180;
    const u = { x: r6(Math.cos(a)), y: r6(Math.sin(a)) }, n = { x: r6(-u.y), y: r6(u.x) };
    const o = { x: isl.x, y: isl.y };
    const mk = (id, items, frame, attach, ep) => ({
      run: { id, name: isl.name, wall: null, island: isl.id, from: 0, to: isl.len, autoFiller: isl.autoFiller, endPanels: ep, base: items, upper: [], attach, seat: isl.seat, kind: isl.kind },
      wall: null, frame, len: isl.len, rows: {}, closedStart: attach.start, closedEnd: attach.end, island: isl,
    });
    out.push(mk(isl.id, isl.base, { o, u, n, ang: a }, isl.attach, isl.endPanels));
    if (isl.back.length) {
      const o2 = { x: r6(o.x + u.x * isl.len), y: r6(o.y + u.y * isl.len) };
      out.push(mk(isl.id + 'b', isl.back, { o: o2, u: { x: -u.x, y: -u.y }, n: { x: -n.x, y: -n.y }, ang: a + Math.PI }, { start: isl.attach.end, end: isl.attach.start }, { start: isl.endPanels.end, end: isl.endPanels.start }));
    }
  }
  return out;
}

/** A cell's floor footprint as one polygon in room coordinates (a cabinet or an end panel; a corner cabinet by its outline's hull is not needed here). */
function cellPoly(L, c) {
  if (c.pf && c.arcCorners) { const q = c.arcCorners; return [q.bl, q.br, q.fr, q.fl].map((p) => [p.x, p.y]); }
  const d = c.kind === 'endpanel' ? c.depth : c.cab.d;
  return [[c.x, 0], [c.x + c.w, 0], [c.x + c.w, d], [c.x, d]].map(([s, o]) => { const p = toWorld(L.frame, s, o); return [p.x, p.y]; });
}

/**
 * Number the cabinets and place every row. `depthOf(cell)` lets the caller say how deep a cell stands (the face-frame depth is in
 * build.js); by default the cabinet's own depth. Pure: the project is not changed.
 *
 * Corners (room.js walls): where two walls meet in a room corner (a convex one) and both runs reach it, the run listed LATER stops short by the
 * other's depth. A corner cabinet (catalog `turn`) as the first or last item of a run at such a corner turns the corner: it fills the corner square,
 * and the next wall's run starts after its arm instead. At a reflex corner nothing butts and the end gets an end panel.
 */
export function layoutProject(project, { depthOf = null } = {}) {
  const p = project;
  const unit = p.unit;
  const R = rulesFor(unit, p.rules);
  const tol = 0.01;
  const maxFiller = conv(75, unit);
  const counters = {};
  const nextNo = (prefix) => { counters[prefix] = (counters[prefix] || 0) + 1; return prefix + String(counters[prefix]).padStart(2, '0'); };
  const W = roomWalls(p.room);
  const runs = p.runs.map((run) => {
    const w = W.find((x) => x.id === run.wall) || W[0];
    return { run, wall: w.id, frame: w.frame, len: w.len, rows: {}, closedStart: w.convexStart, closedEnd: w.convexEnd, wallInfo: w };
  });
  const wallRuns = runs.length;
  for (const L of islandRuns(p)) runs.push(L);
  // resolve each row's items into cells (without positions) and the row's depth
  const prep = (items, row) => items.map((it) => {
    if (it.kind !== 'cab') return { kind: it.kind, w: it.w, counter: !!it.counter, entry: it };
    const r = resolveEntry(it, unit);
    return r ? { kind: 'cab', w: r.cab.w, entry: it, tpl: r.tpl, cab: r.cab, blind: r.blind, turn: r.tpl.turn || null, row } : null;
  }).filter(Boolean);
  for (const L of runs) for (const row of ['base', 'upper']) {
    const cells = prep(L.run[row], row);
    const depth = Math.max(0, ...cells.filter((c) => c.kind === 'cab').map((c) => (depthOf ? depthOf(c) : c.cab.d)));
    L.rows[row] = { cells, depth, blocked: { start: 0, end: 0 }, start: 0, end: 0, used: 0, rest: 0, cornerStart: null, cornerEnd: null };
  }
  // a run on a curved wall uses more of the curve than the sum of its cabinets' widths (straight cabinets turned to the tangent have wedges between them),
  // so "does it reach the end", "how much is left" and the room for a filler are measured along the curve (angled.js stepArc), not by adding widths
  const arcOf = (L, row, cells) => {
    const g = L.wallInfo && L.wallInfo.arc;
    if (!g || L.island || !cells.length) return null;
    const rd = L.rows[row].depth;
    const st = stepArc(g, cells.map((c) => ({ curved: !!(c.tpl && c.tpl.curved), w: c.w, d: c.kind === 'cab' ? (depthOf ? depthOf(c) : c.cab.d) : c.kind === 'endpanel' ? c.depth : rd || c.depth || 0 })), { from: 0 });
    return st.invalid.length ? null : st.used;
  };
  // a cabinet on a BAY is turned about its back corner by about half the angle it spans, so its end face swings toward the neighbouring run by depth x sin(that angle):
  // whoever stops short of that corner leaves this much extra (a bow swings the other way, away)
  const arcTilt = (L, row, which) => {
    const g = L.wallInfo && L.wallInfo.arc;
    if (!g || !g.bay || L.island) return 0;
    const cells = L.rows[row].cells, c = which === 'start' ? cells[0] : cells[cells.length - 1];
    if (!c || (c.tpl && c.tpl.curved) || !(c.w < 2 * g.r)) return 0;
    const d = c.kind === 'cab' ? (depthOf ? depthOf(c) : c.cab.d) : L.rows[row].depth || 0;
    return d * Math.sin(Math.atan2(c.w / 2, Math.sqrt(Math.max(0, g.r * g.r - (c.w * c.w) / 4))));
  };
  const sumW = (L, row, cells) => { const u = arcOf(L, row, cells); return u === null ? cells.reduce((q, x) => q + x.w, 0) : u; };
  // corner cabinets: first or last item of a run that reaches a room corner. L-shaped and lazy susan only fit a right-angled corner between two straight
  // walls; the diagonal-front cabinet is made at the true angle of any convex corner between two straight walls (angled.js diagAt). Anything else is NOT
  // a corner cabinet here: it is laid out as a plain cabinet and `angleMismatch` says why (checks.js corner.angle).
  const wallOf = (id) => W.find((x) => x.id === id);
  const fits = (cell, tau, other, own) => {
    if (own.arc || (other && other.arc)) return 'arc';
    if (Math.abs(tau - 90) < 0.01) return null;
    if (cell.turn !== 'diag') return 'angle';
    const dg = diagAt(tau, cell.w, cell.cab.d);
    return dg.valid ? null : 'size';
  };
  for (const L of runs) for (const row of ['base', 'upper']) {
    const rw = L.rows[row], c = rw.cells;
    if (c.length && c[0].turn && L.run.from <= tol && L.closedStart && !L.island) {
      const why = fits(c[0], L.wallInfo.turnStart, wallOf(L.wallInfo.prevId), L.wallInfo);
      if (!why) { rw.cornerStart = c[0]; c[0].tau = L.wallInfo.turnStart; } else { c[0].angleMismatch = { why, tau: L.wallInfo.turnStart, turn: c[0].turn }; c[0].turn = null; }
    }
    const lc = c[c.length - 1];
    if (c.length && lc.turn && L.run.to >= L.len - tol && L.closedEnd && !L.island && lc !== rw.cornerStart) {
      const why = fits(lc, L.wallInfo.turnEnd, wallOf(L.wallInfo.nextId), L.wallInfo);
      if (!why) { rw.cornerEnd = lc; lc.tau = L.wallInfo.turnEnd; } else { lc.angleMismatch = { why, tau: L.wallInfo.turnEnd, turn: lc.turn }; lc.turn = null; }
    }
  }
  const reaches = (L, row) => {
    const c = L.rows[row].cells;
    return c.length > 0 && L.run.to >= L.len - tol && sumW(L, row, c) >= L.run.to - L.run.from - L.rows[row].blocked.start - maxFiller - tol;
  };
  const corners = [], wedges = [];
  for (let ia = 0; ia < wallRuns; ia++) for (let ib = 0; ib < wallRuns; ib++) {
    const A = runs[ia], B = runs[ib];
    if (ia === ib || B.wall !== A.wallInfo.nextId || !A.wallInfo.convexEnd || !(B.run.from <= tol)) continue;
    const tau = A.wallInfo.turnEnd, square = Math.abs(tau - 90) < 0.01;
    for (const row of ['base', 'upper']) {
      const a = A.rows[row], b = B.rows[row];
      if (a.cornerEnd) { b.blocked.start = Math.max(b.blocked.start, a.cornerEnd.w); if (!square) corners.push({ row, from: A.run.id, to: B.run.id, tau: r6(tau), kind: 'diag', cab: a.cornerEnd }); continue; }
      if (b.cornerStart) { a.blocked.end = Math.max(a.blocked.end, b.cornerStart.w); if (!square) corners.push({ row, from: A.run.id, to: B.run.id, tau: r6(tau), kind: 'diag', cab: b.cornerStart }); continue; }
      if (!a.cells.length || !b.cells.length || !reaches(A, row)) continue;
      // two runs meet in a convex corner. At 90 degrees the later run stops short by the other's depth; at another angle by depth · sin(turn) (angled.js), and the
      // right-triangle that is left over is a wedge filler (turn up to 90). Inside angles under 90 (turn over 90) have no stock form: checks.js corner.sharp.
      const later = ib > ia;
      const dOther = later ? a.depth : b.depth;
      const flat = square ? dOther : cornerBlock(tau, dOther);
      const bend = (L, q) => (L.wallInfo.arc && !L.island ? (q * q) / (2 * L.wallInfo.arc.r) : 0);   // the curve leaves the tangent line by s^2 / 2r over a stretch s
      const stop = flat + arcTilt(A, row, 'end') + arcTilt(B, row, 'start') + bend(A, flat);
      if (later) b.blocked.start = Math.max(b.blocked.start, stop); else a.blocked.end = Math.max(a.blocked.end, stop);
      if (!square || stop > dOther + 1e-6) {
        const ev = { row, from: A.run.id, to: B.run.id, tau: r6(tau), kind: tau > 90 ? 'sharp' : 'wedge', depth: dOther, stop, later: later ? B.run.id : A.run.id };
        corners.push(ev);
        const wc = wedgeCorner(tau, dOther);
        if (wc && wc.leg1 > 1 && wc.leg2 > 1) {
          const Pc = A.wallInfo.b;
          const uA = A.wallInfo.t1, nA = { x: -uA.y, y: uA.x }, uB = B.wallInfo.t0, nB = { x: -uB.y, y: uB.x };
          const tri = later
            ? [[Pc.x, Pc.y], [Pc.x + uB.x * wc.leg1, Pc.y + uB.y * wc.leg1], [Pc.x + nA.x * dOther, Pc.y + nA.y * dOther]]
            : [[Pc.x, Pc.y], [Pc.x - uA.x * wc.leg1, Pc.y - uA.y * wc.leg1], [Pc.x + nB.x * dOther, Pc.y + nB.y * dOther]];
          const hostRun = later ? A : B;
          const hc = hostRun.rows[row].cells.filter((x) => x.kind === 'cab').pop();
          wedges.push({ row, from: A.run.id, to: B.run.id, tau: r6(tau), depth: dOther, leg1: wc.leg1, leg2: wc.leg2, area: wc.area, tri, hostCab: hc || null });
          ev.wedge = wedges.length - 1;
        }
      }
    }
  }
  // place
  for (const L of runs) for (const row of ['base', 'upper']) {
    const rw = L.rows[row];
    rw.start = L.run.from + rw.blocked.start;
    rw.end = L.run.to - rw.blocked.end;
    const touchStart = L.run.from <= tol && L.closedStart;
    const cells = rw.cells;
    const filled = sumW(L, row, cells) >= rw.end - rw.start - maxFiller - tol;   // the cabinets reach the far end of the span
    const touchEnd = L.run.to >= L.len - tol && filled && L.closedEnd;
    const firstCab = cells[0]?.kind === 'cab', lastCab = cells[cells.length - 1]?.kind === 'cab';
    const panel = (which, wantCab) => {
      const o = L.run.endPanels[which];
      if (o === true) return wantCab;
      if (o === false) return false;
      const meets = which === 'start' ? (touchStart || rw.blocked.start > 0) : (touchEnd || rw.blocked.end > 0);
      return wantCab && !meets;
    };
    const lead = rw.cornerStart ? false : panel('start', firstCab), tail = rw.cornerEnd ? false : panel('end', lastCab);
    const ordered = [];
    if (lead) ordered.push({ kind: 'endpanel', w: R.frontT, side: 'start', row, height: panelHeight(cells[0], R), depth: panelDepth(cells[0], R, depthOf) });
    ordered.push(...cells);
    let used = sumW(L, row, ordered) + (tail ? R.frontT : 0);
    let rest = rw.end - rw.start - used;
    if (cells.length && L.run.autoFiller && rest > tol && rest <= maxFiller) {
      let wf = rest;
      if (L.wallInfo && L.wallInfo.arc && !L.island) {   // on a curve a filler also adds the wedge on either side of it: take the widest one that still fits the span
        const span = rw.end - rw.start - (tail ? R.frontT : 0);
        const fits = (v) => sumW(L, row, [...ordered, { kind: 'filler', w: v, depth: 0 }]) <= span + tol;
        if (!fits(wf)) { let lo = 0, hi = wf; for (let k = 0; k < 30; k++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; } wf = lo; }
      }
      if (wf < tol) wf = 0;
      const f = wf > 0 ? { kind: 'filler', w: r6(wf), auto: true, row, height: fillerHeight(ordered, R), depth: 0 } : null;
      if (!f) { /* no room for a filler on this curve */ } else {
      if (rw.cornerEnd) ordered.splice(ordered.length - 1, 0, f); else ordered.push(f);   // beside a corner cabinet the filler goes before it
      used += f.w; rest = r6(rest - f.w);
      }
    }
    if (tail) ordered.push({ kind: 'endpanel', w: R.frontT, side: 'end', row, height: panelHeight(cells[cells.length - 1], R), depth: panelDepth(cells[cells.length - 1], R, depthOf) });
    let x = rw.start;
    for (const c of ordered) {
      if (c === rw.cornerEnd) x = Math.max(x, rw.end - c.w);   // the corner cabinet sits IN the corner, whatever is left over is before it
      c.x = r6(x); x += c.w;
      c.run = L.run.id; c.row = row;
      if (c === rw.cornerEnd) c.corner = 'end'; else if (c === rw.cornerStart) c.corner = 'start';
      if (c.kind === 'cab') c.no = nextNo(prefixOf(c.cab.type));
      else if (c.kind === 'filler') c.no = nextNo('F');
      else if (c.kind === 'endpanel') c.no = nextNo('E');
    }
    rw.cells = ordered; rw.used = r6(used); rw.rest = r6(rest);
  }
  // curved walls: the cabinets of a run on an arc wall are straight, stepped along the arc, each turned to the tangent at its own middle (angled.js stepArc).
  // Each cell gets its own frame `pf` (cell-local x along the cabinet, y out from its back); `c.x` stays the position along the run (an arc length).
  for (const L of runs) {
    const g = L.wallInfo && L.wallInfo.arc;
    if (!g || L.island) continue;
    for (const row of ['base', 'upper']) {
      const rw = L.rows[row];
      if (!rw.cells.length) continue;
      const items = rw.cells.map((c) => ({ curved: !!(c.tpl && c.tpl.curved), w: c.w, d: c.kind === 'cab' ? (depthOf ? depthOf(c) : c.cab.d) : c.kind === 'endpanel' ? c.depth : rw.depth || c.depth || 0 }));
      let st = stepArc(g, items, { from: rw.start, to: rw.end });
      // where this run starts at a room corner, the formula for the corner (depth x sin of the turn) is for straight walls: on a curve the first cabinet's place
      // is found by moving it along until it clears the previous run's last cabinet (an exact search, never more than the room the formula already left)
      const prev = L.run.from <= tol && L.wallInfo.convexStart ? runs.find((q) => !q.island && q.wall === L.wallInfo.prevId) : null;
      const pcell = prev && prev.run.to >= prev.len - tol ? [...prev.rows[row].cells].reverse().find((q) => q.kind === 'cab' || q.kind === 'endpanel') : null;
      if (pcell && !st.invalid.length) {
        const poly = cellPoly(prev, pcell);
        const first = () => stepArc(g, items.slice(0, 1), { from: rw.start + shift });
        let shift = 0;
        const clashes = (sh) => { const f = stepArc(g, items.slice(0, 1), { from: rw.start + sh }); if (f.invalid.length) return false; const c0 = f.cells[0].corners; return overlap([c0.bl, c0.br, c0.fr, c0.fl].map((q) => [q.x, q.y]), poly) > 1e-6; };
        void first;
        if (clashes(0)) {
          let lo = 0, hi = conv(600, unit);
          if (!clashes(hi)) { for (let k = 0; k < 40; k++) { const mid = (lo + hi) / 2; if (clashes(mid)) lo = mid; else hi = mid; } shift = hi; }
        }
        if (shift > 0) { st = stepArc(g, items, { from: rw.start + shift, to: rw.end }); rw.arcShift = r6(shift); }
      }
      rw.arc = { bay: g.bay, r: g.r, invalid: st.invalid.length > 0, overflow: st.overflow, used: st.used, wedges: [], gapMax: 0 };
      if (st.invalid.length) continue;
      st.cells.forEach((sc, i) => { rw.cells[i].pf = sc.frame; rw.cells[i].arcGap = sc.gap; rw.cells[i].arcGapAt = sc.gapAt; rw.cells[i].arcCorners = sc.corners; if (sc.curved) rw.cells[i].curved = sc.curved; });
      rw.arc.gapMax = Math.max(0, ...st.cells.filter((_, i) => rw.cells[i].kind === 'cab' && !rw.cells[i].curved).map((q) => q.gap));
      rw.arc.wedges = st.wedges.map((wd) => ({ ...wd, between: [rw.cells[wd.i - 1].no || rw.cells[wd.i - 1].kind, rw.cells[wd.i].no || rw.cells[wd.i].kind], cabs: rw.cells[wd.i - 1].kind === 'cab' && rw.cells[wd.i].kind === 'cab' }));
    }
  }
  // countertops: runs of base cabinets, fillers and appliance gaps that carry the counter. Each end is a wall (or a corner), an end panel, a butt against a
  // tall cabinet or an appliance gap, or open: only an open end gets the overhang. A corner cabinet adds its arm.
  const cs = [];
  for (const L of runs) {
    const rw = L.rows.base;
    const cells = rw.cells;
    const seat = L.island ? (L.island.seat || 0) : 0;
    const carries = (c) => c && ((c.kind === 'cab' && !c.corner && (c.cab.type === 'base' || c.cab.type === 'drawers')) || c.kind === 'filler' || (c.kind === 'gap' && c.counter));
    let i = 0;
    while (i < cells.length) {
      if (!carries(cells[i])) { i++; continue; }
      let j = i;
      const adj = (p, q) => Math.abs(q.x - (p.x + p.w)) < tol;
      while (j + 1 < cells.length && carries(cells[j + 1]) && adj(cells[j], cells[j + 1])) j++;
      const seg = cells.slice(i, j + 1).filter((c) => c.kind === 'cab');
      if (seg.length) {
        const first = cells[i], last = cells[j];
        const prev = cells[i - 1] && adj(cells[i - 1], first) ? cells[i - 1] : undefined, next = cells[j + 1] && adj(last, cells[j + 1]) ? cells[j + 1] : undefined;   // a cabinet after a gap in the row is not its neighbour
        const runEnd = Math.abs(last.x + last.w - rw.end) < tol || (next === undefined);
        const kindAt = (n, atEdge, corner) => (n === undefined ? (atEdge && corner ? 'wall' : 'open') : n.kind === 'endpanel' ? 'panel' : 'butt');
        const startsRun = !prev && (i === 0 || !adj(cells[i - 1], first) ? i === 0 : true), endsRun = !next && j === cells.length - 1;
        const startWall = (L.run.from <= tol && L.closedStart) || rw.blocked.start > 0;
        const endWall = L.run.to >= L.len - tol && runEnd && (rw.rest <= maxFiller + tol || rw.cornerEnd) && L.closedEnd;
        const ends = { start: kindAt(prev, startsRun, startWall), end: kindAt(next, endsRun, endWall) };
        let x0 = first.x, x1 = last.x + last.w;
        if (ends.start === 'panel') x0 = prev.x;
        if (ends.end === 'panel') x1 = next.x + next.w;
        const ov = (e) => (e === 'open' ? p.counter.end : 0);
        const depth = Math.max(...seg.map((c) => (depthOf ? depthOf(c) : c.cab.d)));
        if (L.wallInfo && L.wallInfo.arc && cells.slice(i, j + 1).every((c) => c.pf)) {   // on a curve: one piece following the cabinets' own corners
          const run = cells.slice(i, j + 1), f = p.counter.front;
          const back = run.flatMap((c) => [c.arcCorners.bl, c.arcCorners.br]);
          const fr = run.map((c) => { const d = c.kind === 'cab' ? (depthOf ? depthOf(c) : c.cab.d) : (L.rows.base.depth || 0); const n = c.pf.n, u = c.pf.u; return [ { x: c.pf.o.x + n.x * (d + f), y: c.pf.o.y + n.y * (d + f) }, { x: c.pf.o.x + u.x * c.w + n.x * (d + f), y: c.pf.o.y + u.y * c.w + n.y * (d + f) } ]; });
          const poly = [...back, ...fr.slice().reverse().flatMap(([l, r]) => [r, l])].map((q) => [r6(q.x), r6(q.y)]);
          const area = Math.abs(poly.reduce((q, pt, k) => { const nx = poly[(k + 1) % poly.length]; return q + pt[0] * nx[1] - nx[0] * pt[1]; }, 0)) / 2;
          const xs = poly.map((q) => q[0]), ys = poly.map((q) => q[1]);
          cs.push({ run: L.run.id, wall: L.wall, world: true, poly, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), depth, cabs: seg.length, ids: seg.map((c) => c.no), ends, length: r6(run.reduce((q, c) => q + c.w, 0)), width: r6(depth + f), area: r6(area) });
          i = j + 1; continue;
        }
        cs.push({ run: L.run.id, wall: L.wall, x0: r6(x0 - ov(ends.start)), x1: r6(x1 + ov(ends.end)), y0: r6(-seat), depth, cabs: seg.length, ids: seg.map((c) => c.no), ends, length: r6(x1 - x0 + ov(ends.start) + ov(ends.end)), width: r6(depth + p.counter.front + seat) });
      }
      i = j + 1;
    }
    // a corner cabinet has a countertop of its own, the shape of its footprint with the overhang over its fronts
    for (const c of cells) if (c.kind === 'cab' && c.corner && (c.cab.type === 'base' || c.cab.type === 'drawers')) {
      const d = depthOf ? depthOf(c) : c.cab.d, f = p.counter.front, w = c.cab.w, a = w - d;
      let pts = c.turn === 'l' ? [[0, 0], [w, 0], [w, w], [a - f, w], [a - f, d + f], [0, d + f]] : [[0, 0], [w, 0], [w, w], [a - f * Math.SQRT2, w], [0, d + f * Math.SQRT2]];
      if (c.turn === 'diag' && c.tau && Math.abs(c.tau - 90) >= 0.01) {   // at another angle: the outline of diagAt with its front pushed out by the overhang
        const dg = diagAt(c.tau, w, d), dx = dg.FB[0] - dg.FA[0], dy = dg.FB[1] - dg.FA[1], ln = Math.hypot(dx, dy) || 1, nx = dy / ln, ny = -dx / ln;   // the front's normal away from the corner
        const sgn = (nx * (dg.Q[0] - dg.FA[0]) + ny * (dg.Q[1] - dg.FA[1])) > 0 ? -1 : 1;
        pts = [[0, 0], dg.P1, dg.P2, [dg.FB[0] + sgn * nx * f, dg.FB[1] + sgn * ny * f], [dg.FA[0] + sgn * nx * f, dg.FA[1] + sgn * ny * f]];
      }
      if (c.corner === 'start') pts = pts.map(([x, y]) => [w - x, y]).reverse();
      pts = pts.map(([x, y]) => [r6(c.x + x), r6(y)]);
      const area = Math.abs(pts.reduce((q, pt, i) => { const n = pts[(i + 1) % pts.length]; return q + pt[0] * n[1] - n[0] * pt[1]; }, 0)) / 2;
      const xs = pts.map((q) => q[0]), ys = pts.map((q) => q[1]), side = Math.sqrt(area);
      cs.push({ run: L.run.id, wall: L.wall, corner: c.turn, cab: c.no, poly: pts, x0: Math.min(...xs), x1: Math.max(...xs), y0: Math.min(...ys), y1: Math.max(...ys), depth: d, cabs: 1, ids: [c.no], ends: { start: 'wall', end: 'wall' }, length: r6(side), width: r6(side), area: r6(area) });
    }
  }
  for (const wd of wedges) wd.no = nextNo('W');
  // where each cell stands along its wall (a chord position for a curved wall: the projection of its footprint on the chord), for the openings
  for (const L of runs) for (const row of ['base', 'upper']) for (const c of L.rows[row].cells) {
    if (c.pf && L.wallInfo) {
      const a = L.wallInfo.a, u = L.wallInfo.frame.u, qs = Object.values(c.arcCorners).map((q) => (q.x - a.x) * u.x + (q.y - a.y) * u.y);
      c.ext = [r6(Math.min(...qs)), r6(Math.max(...qs))];
    } else c.ext = [c.x, r6(c.x + c.w)];
  }
  const counterList = cs.map((s, i) => ({ no: 'C' + String(i + 1).padStart(2, '0'), ...s }));
  return { runs, counters: counterList, numbers: counters, rules: R, walls: W, corners, wedges };
}

function panelHeight(cell, R) {
  if (!cell || cell.kind !== 'cab') return 0;
  const kick = cell.cab.type === 'wall' || R.kick === 'none' ? 0 : R.kickH;
  return r6(cell.cab.h - kick);
}
function panelDepth(cell, R, depthOf) { return cell && cell.kind === 'cab' ? r6((depthOf ? depthOf(cell) : cell.cab.d) + R.frontT) : 0; }
function fillerHeight(cells, R) {
  const c = cells.filter((x) => x.kind === 'cab').pop();
  if (!c) return 0;
  const kick = c.cab.type === 'wall' || R.kick === 'none' ? 0 : R.kickH;
  return r6(c.cab.h - kick);
}

export { cleanCabinet };
