/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fromroom.js — a room that a HOST knows (BimCraft's walls, a ModelCraft floor face, a closed CadCraft polyline) becomes the job's room
 * (0.8 DC.117, session `cabinetcraft_hosts`). DOM-free, pure.
 *
 *   applyModelRoom(project, model) → { project, placed, skipped }
 *     model = { name?, host?, storey?, height? (mm), pts: [[x, y]…] (mm, the host's plan axes, any winding),
 *               openings?: [{ kind: 'door' | 'window', x, y (the middle, mm), w (mm), h?, sill? }] }
 *     The outline is made counter-clockwise and moved so its lower-left corner is the room's (0, 0) (`project.site` keeps the move, so the host can put the
 *     cabinets back where the room is). A rectangle with sides along x and y becomes the plain rectangle room; anything else a free outline.
 *     An opening is put on the room wall nearest its middle (within 600 mm; further away it is `skipped`) with its offset along that wall.
 *   toModel(project, x, y) → [X, Y] mm in the host's axes for a point in the room's own axes (job unit)
 */
import * as E from './edit.js';
import { cleanProject } from './project.js';
import { walls as roomWalls } from './room.js';
import { conv } from './core.js';

const area = (p) => p.reduce((s, a, i) => { const b = p[(i + 1) % p.length]; return s + a[0] * b[1] - b[0] * a[1]; }, 0) / 2;
const MAX_OFF = 600;

export function cleanLoop(pts) {
  let p = (Array.isArray(pts) ? pts : []).map((q) => [Number(q[0]), Number(q[1])]).filter((q) => Number.isFinite(q[0]) && Number.isFinite(q[1]));
  if (p.length > 1 && Math.hypot(p[0][0] - p[p.length - 1][0], p[0][1] - p[p.length - 1][1]) < 1) p = p.slice(0, -1);
  // drop repeated points and points in a straight line
  let again = true;
  while (again && p.length > 3) {
    again = false;
    for (let i = 0; i < p.length; i++) {
      const a = p[(i + p.length - 1) % p.length], b = p[i], c = p[(i + 1) % p.length];
      const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
      if (Math.hypot(b[0] - a[0], b[1] - a[1]) < 1 || Math.abs(cross) < 1e-3 * Math.max(1, Math.hypot(b[0] - a[0], b[1] - a[1]) * Math.hypot(c[0] - b[0], c[1] - b[1]))) { p.splice(i, 1); again = true; break; }
    }
  }
  if (p.length < 3 || Math.abs(area(p)) < 1) return null;
  return area(p) < 0 ? p.reverse() : p;
}

export function applyModelRoom(project, model) {
  const loop = cleanLoop(model && model.pts);
  if (!loop) return { project, placed: [], skipped: [], error: 'room.bad' };
  const u = project.unit === 'in' ? 'in' : 'mm';
  const k = u === 'in' ? 1 / 25.4 : 1;
  const ox = Math.min(...loop.map((q) => q[0])), oy = Math.min(...loop.map((q) => q[1]));
  const rel = loop.map((q) => [q[0] - ox, q[1] - oy]);
  const rnd = (v) => (u === 'in' ? Math.round(v * k * 16) / 16 : Math.round(v * 10) / 10);
  const pts = rel.map((q) => [rnd(q[0]), rnd(q[1])]);
  const W = Math.max(...pts.map((q) => q[0])), D = Math.max(...pts.map((q) => q[1]));
  const isRect = pts.length === 4 && pts.every((q) => (q[0] === 0 || q[0] === W) && (q[1] === 0 || q[1] === D)) && new Set(pts.map((q) => q.join(','))).size === 4;
  let next = project;
  const q0 = JSON.parse(JSON.stringify(project));
  if (isRect) next = E.setProject(q0, { room: { shape: 'rect', w: W, d: D, ...(model.height > 0 ? { h: rnd(model.height) } : {}) } });
  else {
    next = E.setOutline(q0, pts);
    if (next === project || next.room.shape !== 'free') return { project, placed: [], skipped: [], error: 'room.refused' };
    if (model.height > 0) next = E.setProject(next, { room: { h: rnd(model.height) } });
  }
  // doors and windows onto the nearest wall
  const wl = roomWalls(next.room);
  const placed = [], skipped = [];
  const openings = [];
  let nd = 0, nw = 0;
  for (const o of (Array.isArray(model.openings) ? model.openings : []).slice(0, 80)) {
    const x = (Number(o.x) - ox) * k, y = (Number(o.y) - oy) * k, w = Number(o.w) * k;
    if (!Number.isFinite(x) || !Number.isFinite(y) || !(w > 0)) { skipped.push(o); continue; }
    let best = null;
    for (const wall of wl) {
      if (wall.arc) continue;
      const dx = x - wall.a.x, dy = y - wall.a.y, s = dx * wall.frame.u.x + dy * wall.frame.u.y, off = Math.abs(-dx * wall.frame.u.y + dy * wall.frame.u.x);
      if (s < -w / 2 || s > wall.len + w / 2) continue;
      if (!best || off < best.off) best = { wall, s, off };
    }
    if (!best || best.off > MAX_OFF * k) { skipped.push(o); continue; }
    const win = o.kind === 'window';
    const id = (win ? 'W' : 'D') + (win ? ++nw : ++nd);
    const at = Math.max(0, Math.min(best.wall.len - w, best.s - w / 2));
    openings.push({ id, kind: win ? 'window' : 'door', wall: best.wall.id, at, w, h: Number(o.h) > 0 ? Number(o.h) * k : conv(win ? 1200 : 2100, u), sill: win ? (Number(o.sill) >= 0 ? Number(o.sill) * k : conv(1000, u)) : 0, swing: 'in', name: '' });
    placed.push(id);
  }
  const out = cleanProject({ ...next, openings, site: { host: model.host || '', storey: model.storey || '', name: model.name || '', ox, oy, oz: Number(model.z) || 0 } });
  return { project: out, placed, skipped };
}

export function toModel(project, x, y) {
  const s = project.site || { ox: 0, oy: 0 };
  const k = project.unit === 'in' ? 25.4 : 1;
  return [s.ox + x * k, s.oy + y * k];
}
