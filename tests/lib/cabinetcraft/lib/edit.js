/* SPDX-License-Identifier: Apache-2.0 */
/**
 * edit.js — the edits a person makes to a job: runs, the items in a run, the materials, the shop's numbers (0.8 DC.117, session
 * `cabinetcraft_addon`). DOM-free and pure: every function takes a project and returns a NEW cleaned project (project.js cleanProject),
 * so an edit can never leave a job the loader would refuse, and the panel needs no rules of its own.
 *
 *   addRun(p, wall) · removeRun(p, id) · setRun(p, id, patch)
 *   addItem(p, runId, row, item, at?) · removeItem(p, runId, row, i) · moveItem(p, runId, row, i, dir) · setItem(p, runId, row, i, patch)
 *   fillRun(p, runId, row) → the row's leftover (up to 75 mm) as a filler, or the row unchanged
 *   setPick(p, key, id) · setRule(p, key, value) · setFrame(p, key, value) · setRate(p, path, value) · setProject(p, patch)
 *   setRoomShape(p, shape) · setRoomNotch(p, patch) · setOutline(p, pts | text, arcs?) → the room as a rectangle, L, U or free outline (any angle, arcs)
 *   setSegments(p, text | segments) → the room from typed walls: `length angle` lines and `arc radius sweep heading` arcs (room.js outlineFromSegments)
 *   setWallArc(p, wallId, sweep) → one wall of a free outline made an arc (sweep 0 makes it straight) · setHw(p, key, value) → a typed fixing, shaft or pivot size (cornerdrill.js)
 *   addIsland(p, kind) · setIsland(p, id, patch) · removeIsland(p, id)   (items go through addItem … with the island's id and row 'base' or 'back')
 *   addOpening(p, wall, kind) · setOpening(p, id, patch) · removeOpening(p, id) · openGap(p, runId, openingId) → a gap in the floor row where the opening is
 *   mergeRates(p, text) → { project, applied, ignored } a shop's own rate table (CSV or JSON) on top of the job's rates
 *   setUnit(p, unit) → the job in the other unit (every size converted; inches to 1/16)
 */
import { cleanProject, WALLS, wallLength, wallIds, layoutProject } from './project.js';
import { roomPts, parsePoints, cleanOutline, cleanShape, walls as roomWalls, outlineFromSegments, parseSegments } from './room.js';
import { importRates } from './estimate.js';
import { conv } from './core.js';

const clone = (p) => JSON.parse(JSON.stringify(p));
const runOf = (p, id) => p.runs.find((r) => r.id === id) || (p.islands || []).find((r) => r.id === id);
const rowOk = (r, row) => ['base', 'upper'].includes(row) || (row === 'back' && r.back);

export function addRun(p, wall = 'S') {
  const q = clone(p);
  const used = new Set(q.runs.map((r) => r.id));
  let id = 'A';
  for (let i = 0; i < 26 && used.has(id); i++) id = String.fromCharCode(66 + i);
  const ids = wallIds(q.room);
  const w = ids.includes(wall) ? wall : ids[0];
  q.runs.push({ id, name: '', wall: w, from: 0, to: wallLength(w, q.room), autoFiller: true, endPanels: { start: 'auto', end: 'auto' }, base: [], upper: [] });
  return cleanProject(q);
}
export function removeRun(p, id) { const q = clone(p); q.runs = q.runs.filter((r) => r.id !== id); return cleanProject(q); }
export function setRun(p, id, patch) {
  const q = clone(p);
  const r = runOf(q, id);
  if (!r) return p;
  const { base, upper, id: _i, ...rest } = patch || {};
  Object.assign(r, rest);
  if (patch && patch.wall && !('to' in patch)) r.to = wallLength(r.wall, q.room);
  return cleanProject(q);
}
export function addItem(p, runId, row, item, at = null) {
  const q = clone(p);
  const r = runOf(q, runId);
  if (!r || !rowOk(r, row)) return p;
  const list = r[row];
  if (at === null || at === undefined || at > list.length) list.push(item); else list.splice(Math.max(0, at), 0, item);
  return cleanProject(q);
}
export function removeItem(p, runId, row, i) {
  const q = clone(p);
  const r = runOf(q, runId);
  if (!r || !r[row] || !r[row][i]) return p;
  r[row].splice(i, 1);
  return cleanProject(q);
}
export function moveItem(p, runId, row, i, dir) {
  const q = clone(p);
  const r = runOf(q, runId);
  const j = i + (dir < 0 ? -1 : 1);
  if (!r || !r[row] || !r[row][i] || !r[row][j]) return p;
  [r[row][i], r[row][j]] = [r[row][j], r[row][i]];
  return cleanProject(q);
}
export function setItem(p, runId, row, i, patch) {
  const q = clone(p);
  const r = runOf(q, runId);
  if (!r || !r[row] || !r[row][i]) return p;
  const next = { ...r[row][i], ...patch };
  for (const k of Object.keys(next)) if (next[k] === '' || next[k] === null || next[k] === undefined) delete next[k];
  r[row][i] = next;
  return cleanProject(q);
}
export function fillRun(p, runId, row = 'base') {
  const L = layoutProject(p).runs.find((r) => r.run.id === runId);
  if (!L) return p;
  const rest = L.rows[row].rest;
  if (!(rest > 0.5) || rest > conv(75, p.unit)) return p;
  return addItem(p, runId, row, { kind: 'filler', w: rest });
}

export function setRoomShape(p, shape) {
  const q = clone(p);
  const W = q.room.w, D = q.room.d;
  if (shape === 'L') q.room = { ...q.room, shape: 'L', notch: { w: Math.round(W / 3), d: Math.round(D / 2), at: 'NE' } };
  else if (shape === 'U') q.room = { ...q.room, shape: 'U', notch: { w: Math.round(W / 3), d: Math.round(D / 2), at: 'N' } };
  else if (shape === 'free') q.room = { ...q.room, shape: 'free', pts: roomPts(q.room) };
  else q.room = { w: W, d: D, h: q.room.h, shape: 'rect' };
  const r = cleanProject(remapWalls(q));
  return r;
}
/** Runs and openings on S / E / N / W move to the wall of the new outline that runs the same way (the longest one when there are two). */
function remapWalls(q) {
  const ws = roomWalls(cleanProject(q).room);
  const dir = { S: [1, 0], E: [0, 1], N: [-1, 0], W: [0, -1] };
  const ids = new Set(ws.map((w) => w.id));
  const fix = (id) => {
    if (ids.has(id) || !dir[id]) return id;
    const m = ws.filter((w) => Math.abs(w.frame.u.x - dir[id][0]) < 1e-6 && Math.abs(w.frame.u.y - dir[id][1]) < 1e-6).sort((a, b) => b.len - a.len)[0];
    return m ? m.id : id;
  };
  for (const r of q.runs) r.wall = fix(r.wall);
  for (const o of q.openings) o.wall = fix(o.wall);
  return q;
}
export function setRoomNotch(p, patch) {
  const q = clone(p);
  if (!q.room.notch) return p;
  Object.assign(q.room.notch, patch);
  return cleanProject(q);
}
/** pts = [[x, y]…] or the text a person typed ("0,0 4000,0 …"); a bad outline (slanted edge, crossing edges) leaves the job as it was. */
export function setOutline(p, pts, arcs = null) {
  const q = clone(p);
  const list = typeof pts === 'string' ? parsePoints(pts) : pts;
  const keep = arcs === null ? (q.room.shape === 'free' && Array.isArray(q.room.pts) && q.room.pts.length === list.length ? q.room.arcs : []) : arcs;
  if (!cleanShape(list, keep || [])) return p;
  q.room = { ...q.room, shape: 'free', pts: list, arcs: keep || [] };
  return cleanProject(remapWalls(q));
}
/** The room from typed walls (room.js parseSegments / outlineFromSegments). A text no outline can be made from leaves the job as it was. */
export function setSegments(p, text) {
  const segs = typeof text === 'string' ? parseSegments(text) : text;
  const o = outlineFromSegments(segs);
  if (!o) return p;
  return setOutline(p, o.pts, o.arcs);
}
/** Make one wall of a free outline an arc (sweep in degrees: + bulges away from the room, − into it) or straight again (0). */
export function setWallArc(p, wallId, sweep) {
  const q = clone(p);
  if (q.room.shape !== 'free') q.room = { ...q.room, shape: 'free', pts: roomPts(q.room), arcs: [] };
  const wl = roomWalls(cleanProject({ ...q }).room).find((w) => w.id === wallId);
  const pts = q.room.pts || roomPts(q.room);
  const i = wl ? wl.i : -1;
  if (i < 0) return p;
  const arcs = (q.room.arcs || []).filter((a) => a.i !== i);
  if (Math.abs(Number(sweep)) >= 0.5) arcs.push({ i, sweep: Number(sweep) });
  return setOutline(q, pts, arcs);
}
export function setHw(p, key, value) {
  const q = clone(p);
  q.hw = { ...(q.hw || {}) };
  if (value === '' || value === null || value === undefined) delete q.hw[key]; else q.hw[key] = Number(value);
  return cleanProject(q);
}

export function addIsland(p, kind = 'island') {
  const q = clone(p);
  const used = new Set([...q.runs.map((r) => r.id), ...q.islands.map((i) => i.id)]);
  let n = 1;
  while (used.has('I' + n) || used.has('I' + n + 'b')) n++;
  const peninsula = kind === 'peninsula';
  q.islands.push({ id: 'I' + n, name: '', kind: peninsula ? 'peninsula' : 'island', x: peninsula ? 0 : Math.round(q.room.w / 4), y: Math.round(q.room.d / 2), rot: 0, len: conv(1800, q.unit), attach: { start: peninsula, end: false }, seat: 0, autoFiller: true, endPanels: { start: 'auto', end: 'auto' }, base: [], back: [] });
  return cleanProject(q);
}
export function setIsland(p, id, patch) {
  const q = clone(p);
  const i = q.islands.find((x) => x.id === id);
  if (!i) return p;
  const { base, back, id: _i, ...rest } = patch || {};
  Object.assign(i, rest);
  return cleanProject(q);
}
export function removeIsland(p, id) { const q = clone(p); q.islands = q.islands.filter((i) => i.id !== id); return cleanProject(q); }

export function addOpening(p, wall, kind = 'door') {
  const q = clone(p);
  const ids = wallIds(q.room);
  q.openings.push({ id: '', kind: kind === 'window' ? 'window' : 'door', wall: ids.includes(wall) ? wall : ids[0], at: conv(300, q.unit), w: conv(kind === 'window' ? 1200 : 900, q.unit), h: conv(kind === 'window' ? 1200 : 2100, q.unit), sill: conv(1000, q.unit), swing: 'in', name: '' });
  q.openings[q.openings.length - 1].id = (kind === 'window' ? 'W' : 'D') + q.openings.filter((o) => o.kind === (kind === 'window' ? 'window' : 'door')).length;
  return cleanProject(q);
}
export function setOpening(p, id, patch) {
  const q = clone(p);
  const o = q.openings.find((x) => x.id === id);
  if (!o) return p;
  Object.assign(o, patch);
  return cleanProject(q);
}
export function removeOpening(p, id) { const q = clone(p); q.openings = q.openings.filter((o) => o.id !== id); return cleanProject(q); }

/** Put a gap in the run's floor row where the opening is, so the cabinets after it move on: the gap starts at the end of the last cabinet that ends before the opening
 *  (minus the clearance) and runs past the opening plus the clearance. The run must be on the opening's wall. */
export function openGap(p, runId, openingId, { clear = conv(50, p.unit) } = {}) {
  const op = p.openings.find((o) => o.id === openingId);
  const run = p.runs.find((r) => r.id === runId);
  if (!op || !run || run.wall !== op.wall) return p;
  const lay = layoutProject(p).runs.find((r) => r.run.id === runId);
  if (!lay) return p;
  const cells = lay.rows.base.cells.filter((c) => c.kind !== 'endpanel' && !c.auto);
  const a = op.at - clear, b = op.at + op.w + clear;
  let at = 0, start = lay.rows.base.start;
  for (let i = 0; i < cells.length; i++) { if (cells[i].x + cells[i].w <= a + 1e-6) { at = i + 1; start = cells[i].x + cells[i].w; } }
  const width = Math.ceil((b - start) * 10) / 10;
  if (!(width > 0)) return p;
  return addItem(p, runId, 'base', { kind: 'gap', w: width }, at);
}

export function mergeRates(p, text) {
  const r = importRates(text);
  const q = clone(p);
  const merged = JSON.parse(JSON.stringify(q.rates || {}));
  const put = (o, path, v) => { const ks = path.split('.'); for (const k of ks.slice(0, -1)) o = o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {}; o[ks[ks.length - 1]] = v; };
  for (const [path, v] of Object.entries(r.values)) put(merged, path, v);
  q.rates = merged;
  q.ratesOk = [...new Set([...(q.ratesOk || []), ...r.applied])];   // a rate the shop typed is the shop's, even when it equals the placeholder
  return { project: cleanProject(q), applied: r.applied, ignored: r.ignored };
}

export function setPick(p, key, id) {
  const q = clone(p);
  q.picks[key] = id;
  const r = cleanProject(q);
  return r.picks[key] === id ? r : p;       // a board for the wrong role, or one the job does not have, changes nothing
}
export function setRule(p, key, value) { const q = clone(p); q.rules[key] = value; return cleanProject(q); }
export function setFrame(p, key, value) { const q = clone(p); q.ff[key] = value; return cleanProject(q); }
export function setRate(p, path, value) {
  const q = clone(p);
  let o = q.rates;
  const keys = String(path).split('.');
  for (const k of keys.slice(0, -1)) o = o[k] = o[k] && typeof o[k] === 'object' ? o[k] : {};
  o[keys[keys.length - 1]] = path === 'currency' ? String(value) : Number(value);
  q.ratesOk = [...new Set([...(q.ratesOk || []), path])];
  return cleanProject(q);
}
export function setProject(p, patch) {
  const q = clone(p);
  const { room, sheet, counter, ...rest } = patch || {};
  Object.assign(q, rest);
  if (room) Object.assign(q.room, room);
  if (sheet) Object.assign(q.sheet, sheet);
  if (counter) Object.assign(q.counter, counter);
  return cleanProject(q);
}

export function setUnit(p, unit) {
  const to = unit === 'in' ? 'in' : 'mm';
  if (p.unit === to) return p;
  const k = to === 'in' ? 1 / 25.4 : 25.4;
  const c = (v) => (to === 'in' ? Math.round(v * k * 16) / 16 : Math.round(v * k));
  const q = clone(p);
  q.unit = to;
  for (const key of ['w', 'd', 'h']) q.room[key] = c(q.room[key]);
  for (const key of ['w', 'h', 'margin', 'spacing']) q.sheet[key] = c(q.sheet[key]);
  for (const key of Object.keys(q.counter)) q.counter[key] = c(q.counter[key]);
  for (const key of Object.keys(q.ff)) q.ff[key] = c(q.ff[key]);
  q.rules = {};            // the shop's numbers were in the old unit: back to the unit's own rule set
  for (const key of ['w', 'd', 'h']) if (q.room.notch) { q.room.notch.w = c(q.room.notch.w); q.room.notch.d = c(q.room.notch.d); }
  if (q.room.pts) q.room.pts = q.room.pts.map(([x, y]) => [c(x), c(y)]);
  for (const o of q.openings) for (const key of ['at', 'w', 'h', 'sill']) o[key] = c(o[key]);
  for (const i of q.islands) { for (const key of ['x', 'y', 'len', 'seat']) i[key] = c(i[key]); for (const row of ['base', 'back']) for (const it of i[row]) for (const key of ['w', 'h', 'd', 'elev', 'blind']) if (typeof it[key] === 'number') it[key] = c(it[key]); }
  for (const r of q.runs) {
    r.from = c(r.from); r.to = c(r.to);
    for (const row of ['base', 'upper']) for (const it of r[row]) for (const key of ['w', 'h', 'd', 'elev', 'blind']) if (typeof it[key] === 'number') it[key] = c(it[key]);
  }
  return cleanProject(q);
}
