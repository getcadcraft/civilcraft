/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pad-edit.js — a pad's corners edited from its table (0.10.1, suggestion #1970). No DOM, no imports; the Node test drives it
 * (bin/test-civilcraft-sg1970.mjs).
 *
 * A pad is { pts: [{ x, y, z? }], z, cut, fill, sides? }. A corner may carry its own elevation (z); a corner without one sits at
 * the pad's elevation. The side settings (sides.js: sides.edges[k] = the side from corner k to corner k + 1) follow the corners
 * when one is added or taken out.
 *
 *   cornerZ(pad, i) → the elevation corner i is graded at (its own, else the pad's)
 *   hasCornerZ(pad) → true when any corner carries its own elevation
 *   setCornerZ(pad, i, z | null) → pad'   null = back to the pad's elevation
 *   levelPad(pad) → pad' with no corner elevations (flat at pad.z)
 *   edgeGrades(pad) → [grade | null] per side (rise over run from corner k to the next; null for a side with no length)
 *   insertCorner(pad, k, u = 0.5) → pad'   a new corner on side k at fraction u; its elevation is the side's there when either
 *       end carries one; the new side keeps side k's settings
 *   removeCorner(pad, k) → pad' | null (a pad keeps at least 3 corners); the side before it runs on to the next corner
 *   nearestSide(pad, x, y) → { k, u, x, y, d }   the side closest to a plan point
 */

const fin = (v) => typeof v === 'number' && Number.isFinite(v);

export const cornerZ = (pad, i) => (fin(pad?.pts?.[i]?.z) ? pad.pts[i].z : Number(pad?.z));
export const hasCornerZ = (pad) => !!pad?.pts?.some((p) => fin(p.z));

export function setCornerZ(pad, i, z) {
  if (!pad?.pts?.[i] || (z !== null && !fin(z))) return pad;
  return { ...pad, pts: pad.pts.map((p, k) => { if (k !== i) return p; const { z: _, ...q } = p; return z === null ? q : { ...q, z }; }) };
}

export function levelPad(pad) {
  return { ...pad, pts: pad.pts.map(({ z: _, ...q }) => q) };
}

export function edgeGrades(pad) {
  const n = pad.pts.length;
  return pad.pts.map((a, k) => { const b = pad.pts[(k + 1) % n], L = Math.hypot(b.x - a.x, b.y - a.y); return L > 1e-12 ? (cornerZ(pad, (k + 1) % n) - cornerZ(pad, k)) / L : null; });
}

const withEdges = (pad, edges) => {
  if (!pad.sides) return {};
  while (edges.length && (edges[edges.length - 1] === null || edges[edges.length - 1] === undefined)) edges.pop();
  return { sides: { ...pad.sides, edges: edges.map((e) => e ?? null) } };
};

export function insertCorner(pad, k, u = 0.5) {
  const n = pad?.pts?.length || 0;
  if (!Number.isInteger(k) || k < 0 || k >= n || n < 2 || !(u > 1e-9) || !(u < 1 - 1e-9)) return pad;
  const a = pad.pts[k], b = pad.pts[(k + 1) % n];
  if (!(Math.hypot(b.x - a.x, b.y - a.y) > 1e-12)) return pad;
  const q = { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
  if (fin(a.z) || fin(b.z)) q.z = cornerZ(pad, k) + (cornerZ(pad, (k + 1) % n) - cornerZ(pad, k)) * u;
  const pts = pad.pts.slice();
  pts.splice(k + 1, 0, q);
  const edges = (pad.sides?.edges || []).slice();
  while (edges.length < n) edges.push(null);
  edges.splice(k + 1, 0, edges[k] ? { ...edges[k] } : null);
  return { ...pad, pts, ...withEdges(pad, edges) };
}

export function removeCorner(pad, k) {
  const n = pad?.pts?.length || 0;
  if (!pad?.pts?.[k] || n - 1 < 3) return null;
  const pts = pad.pts.slice();
  pts.splice(k, 1);
  const edges = (pad.sides?.edges || []).slice();
  while (edges.length < n) edges.push(null);
  edges.splice(k, 1);   // the side that started at the corner goes; the one before it now reaches the next corner
  return { ...pad, pts, ...withEdges(pad, edges) };
}

export function nearestSide(pad, x, y) {
  const n = pad?.pts?.length || 0;
  let best = null;
  for (let k = 0; k < n; k++) {
    const a = pad.pts[k], b = pad.pts[(k + 1) % n], dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy;
    if (!(L2 > 0)) continue;
    const u = Math.max(0, Math.min(1, ((x - a.x) * dx + (y - a.y) * dy) / L2)), px = a.x + dx * u, py = a.y + dy * u, d = Math.hypot(px - x, py - y);
    if (!best || d < best.d) best = { k, u, x: px, y: py, d };
  }
  return best;
}
