/* SPDX-License-Identifier: Apache-2.0 */
/**
 * edit.js — editing the layout with the mouse (0.8 SU.858 step 2, session flow-08). DOM-free: the page turns a pointer into a
 * pick ray (ModelCraft's cam.ray) and these functions do the geometry.
 *
 *   groundPoint(ray, z) → [x, y] | null           where the ray meets the horizontal plane at height z
 *   gridSnap(v, step) → number                     round to the grid (0 = free)
 *   groupOf(layout, id) → [ids]                    the item and everything joined to it (belts, ports and AGV ends that touch)
 *   moveItems(layout, ids, dx, dy)                 translate items in the plane
 *   placeAt(layout, kind, x, y, params?) → item    a new item on the ground point, not yet in the layout (z by kind)
 *   makeHistory(limit) → { push(json), undo(cur) → json | null, redo(cur) → json | null, clear(), canUndo, canRedo }
 */
import { CONVEYOR_KINDS, defaults, cleanParams } from './catalog.js';
import { connect, nextId } from './layout.js';

const RAISED = [...CONVEYOR_KINDS, 'source', 'sink', 'station', 'buffer', 'merge', 'divert', 'gate', 'transfer', 'agv-pick', 'agv-drop'];
export const itemZ = (kind) => (RAISED.includes(kind) ? 0.8 : 0);

export function groundPoint(ray, z = 0) {
  if (!ray || !ray.o || !ray.d || Math.abs(ray.d[2]) < 1e-9) return null;
  const t = (z - ray.o[2]) / ray.d[2];
  if (!(t > 0)) return null;
  return [ray.o[0] + ray.d[0] * t, ray.o[1] + ray.d[1] * t];
}

export const gridSnap = (v, step) => (step > 0 ? Math.round(v / step) * step : v);

export function groupOf(layout, id) {
  const { links, agv } = connect(layout);
  const adj = new Map(layout.items.map((i) => [i.id, new Set()]));
  const join = (a, b) => { if (adj.has(a) && adj.has(b)) { adj.get(a).add(b); adj.get(b).add(a); } };
  for (const l of links) join(l.from, l.to);
  // AGV paths that share a node, and the pickups/drops on them
  const byNode = new Map();
  const note = (node, who) => { if (!byNode.has(node)) byNode.set(node, []); byNode.get(node).push(who); };
  for (const e of agv.edges) { note(e.from, e.id.replace(/~r$/, '')); note(e.to, e.id.replace(/~r$/, '')); }
  for (const [item, node] of Object.entries(agv.nodeOf)) note(node, item);
  for (const who of byNode.values()) for (const a of who) for (const b of who) if (a !== b) join(a, b);
  // photo-eyes ride with their belt
  for (const it of layout.items) if (it.kind === 'sensor' && it.params.on) join(it.id, it.params.on);
  const seen = new Set([id]), stack = [id];
  while (stack.length) for (const n of adj.get(stack.pop()) || []) if (!seen.has(n)) { seen.add(n); stack.push(n); }
  return [...seen];
}

export function moveItems(layout, ids, dx, dy) {
  const set = new Set(ids);
  for (const it of layout.items) if (set.has(it.id)) { it.x += dx; it.y += dy; }
}

export function placeAt(layout, kind, x, y, params) {
  return { id: nextId(layout, kind), kind, x, y, z: itemZ(kind), rot: 0, params: cleanParams(kind, params || defaults(kind)) };
}

export function makeHistory(limit = 50) {
  let past = [], future = [];
  return {
    push(json) { past.push(json); if (past.length > limit) past.shift(); future = []; },
    undo(cur) { if (!past.length) return null; future.push(cur); return past.pop(); },
    redo(cur) { if (!future.length) return null; past.push(cur); return future.pop(); },
    clear() { past = []; future = []; },
    get canUndo() { return past.length > 0; },
    get canRedo() { return future.length > 0; },
  };
}
