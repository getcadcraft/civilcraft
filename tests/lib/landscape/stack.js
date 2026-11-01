/* SPDX-License-Identifier: Apache-2.0 */
/**
 * stack.js — one ordered stack of ground modifiers, cut and fill per modifier, overlaps, and live level annotations (0.8 LA.4, session
 * `landscape-arch_PART_4`). No DOM; imports only areas.js (beside it in every host). Canonical in lib/landscape/, byte-identical copies by
 * `node tools/landscape/sync.mjs`. The host grades the items in the order this gives (later wins inside overlaps) on its own terrain
 * engine (CivilCraft: grading.js gradedSurface); the existing ground is never changed — proposed = existing + the stack.
 *
 *   orderItems(items, order) → items          `order` = ids, the person's order; items it does not name keep their own order after it
 *   moveInOrder(ids, id, to) → ids            one modifier moved to index `to` (drag) · cleanOrder(order) (untrusted)
 *   overlapPairs(regions) → [{ a, b, area }]  regions [{ id, pts }] in stack order; b (later) wins inside the overlap
 *   cutFillBy(existing, proposed, regions, { cell, maxCells }) → { by: { id: { cut, fill, area } }, total: { cut, fill, area }, cell }
 *     one grid over the regions' box; a cell belongs to the LAST region holding it (what that modifier actually shapes)
 *   cleanLevels(list) (untrusted) · levelReadout(l, surface) → { z } | { z1, z2, dz, run, pct, ratio, down } | null
 *   levelItems(levels, { proposed, existing }, { unitPerMm, fixed, words }) → plan items (layers L-GRAD-SPOT / L-GRAD-EXST)
 *     spot: a cross and its level; grade: an arrow pointing downhill with "1:25 (4.0 %)". Read from the surface each time they are drawn,
 *     so moving an object updates every label. A label whose point is off the surface says "?".
 *   surface = anything with elevationAt(x, y) → z | null
 */
import { clipRegion, polyArea, pointIn } from './areas.js';

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const ID = /^[a-z]{1,8}\d{1,9}$/;

export function cleanOrder(order) { return Array.isArray(order) ? [...new Set(order.filter((x) => typeof x === 'string' && ID.test(x)))].slice(0, 5000) : []; }

export function orderItems(items, order) {
  const pos = new Map(cleanOrder(order).map((id, i) => [id, i]));
  const known = items.filter((x) => pos.has(String(x.id))).sort((a, b) => pos.get(String(a.id)) - pos.get(String(b.id)));
  return [...known, ...items.filter((x) => !pos.has(String(x.id)))];
}

export function moveInOrder(ids, id, to) {
  const out = ids.filter((x) => x !== id);
  out.splice(Math.max(0, Math.min(out.length, to)), 0, id);
  return out;
}

export function overlapPairs(regions) {
  const out = [];
  const R = regions.filter((r) => r && r.pts?.length >= 3);
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i], b = R[j];
    const full = Math.abs(polyArea(a.pts));
    if (!(full > 0)) continue;
    const left = clipRegion(a.pts, [b.pts]).area, area = full - left;
    if (area > full * 1e-6 + 1e-9) out.push({ a: a.id, b: b.id, area });
  }
  return out;
}

export function cutFillBy(existing, proposed, regions, { cell = 0, maxCells = 2e6 } = {}) {
  const R = regions.filter((r) => r && r.pts?.length >= 3);
  const by = {}, total = { cut: 0, fill: 0, area: 0 };
  for (const r of R) by[r.id] = { cut: 0, fill: 0, area: 0 };
  if (!R.length || !existing || !proposed) return { by, total, cell: 0 };
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  const boxes = R.map((r) => { let a = Infinity, b = Infinity, c = -Infinity, d = -Infinity; for (const p of r.pts) { a = Math.min(a, p.x); b = Math.min(b, p.y); c = Math.max(c, p.x); d = Math.max(d, p.y); } x0 = Math.min(x0, a); y0 = Math.min(y0, b); x1 = Math.max(x1, c); y1 = Math.max(y1, d); return [a, b, c, d]; });
  const W = x1 - x0, H = y1 - y0;
  if (!(W > 0 && H > 0)) return { by, total, cell: 0 };
  let c = cell > 0 ? cell : Math.sqrt((W * H) / 200000);
  while ((W / c) * (H / c) > maxCells) c *= 2;
  const A = c * c;
  for (let y = y0 + c / 2; y < y1; y += c) for (let x = x0 + c / 2; x < x1; x += c) {
    let k = -1;
    for (let i = R.length - 1; i >= 0; i--) { const b = boxes[i]; if (x >= b[0] && x <= b[2] && y >= b[1] && y <= b[3] && pointIn(x, y, R[i].pts)) { k = i; break; } }
    if (k < 0) continue;
    const z0 = existing.elevationAt(x, y), z1 = proposed.elevationAt(x, y);
    if (!fin(z0) || !fin(z1)) continue;
    const dz = z1 - z0, o = by[R[k].id];
    o.area += A; total.area += A;
    if (dz > 0) { o.fill += dz * A; total.fill += dz * A; } else { o.cut -= dz * A; total.cut -= dz * A; }
  }
  return { by, total, cell: c };
}

// ---- live level annotations ----
const XY = (v) => fin(v) && Math.abs(v) < 1e9;
export function cleanLevels(list) {
  const out = [];
  for (const l of Array.isArray(list) ? list.slice(0, 5000) : []) {
    if (!l || !ID.test(String(l.id)) || !XY(l.x) || !XY(l.y)) continue;
    const on = l.on === 'existing' ? 'existing' : 'proposed';
    if (l.kind === 'grade') { if (XY(l.x2) && XY(l.y2) && Math.hypot(l.x2 - l.x, l.y2 - l.y) > 1e-9) out.push({ id: l.id, kind: 'grade', x: l.x, y: l.y, x2: l.x2, y2: l.y2, on }); }
    else out.push({ id: l.id, kind: 'spot', x: l.x, y: l.y, on });
  }
  return out;
}

export function levelReadout(l, surface) {
  if (!surface) return null;
  const z1 = surface.elevationAt(l.x, l.y);
  if (l.kind !== 'grade') return fin(z1) ? { z: z1 } : null;
  const z2 = surface.elevationAt(l.x2, l.y2);
  if (!fin(z1) || !fin(z2)) return null;
  const run = Math.hypot(l.x2 - l.x, l.y2 - l.y), dz = z2 - z1, g = Math.abs(dz) / run;
  return { z1, z2, dz, run, pct: g * 100, ratio: g > 1e-9 ? 1 / g : Infinity, down: dz <= 0 ? 'forward' : 'back' };
}

export function levelItems(levels, { proposed = null, existing = null } = {}, { unitPerMm = 1, fixed = (v) => v.toFixed(2), words = {} } = {}) {
  const W = { flat: 'level', ...words }, items = [], mm = 2;
  for (const l of levels || []) {
    const layer = l.on === 'existing' ? 'L-GRAD-EXST' : 'L-GRAD-SPOT', sf = l.on === 'existing' ? existing : proposed, r = levelReadout(l, sf);
    if (l.kind === 'spot') {
      const h = 0.9 * unitPerMm;
      items.push({ layer, kind: 'poly', pts: [{ x: l.x - h, y: l.y - h }, { x: l.x + h, y: l.y + h }] }, { layer, kind: 'poly', pts: [{ x: l.x - h, y: l.y + h }, { x: l.x + h, y: l.y - h }] });
      items.push({ layer, kind: 'text', x: l.x + 1.3 * unitPerMm, y: l.y + 1.3 * unitPerMm, mm, rot: 0, text: r ? (l.on === 'existing' ? '(' + fixed(r.z) + ')' : '+' + fixed(r.z)) : '?', align: 'left', italic: l.on === 'existing' });
      continue;
    }
    // the arrow points downhill: from the higher end to the lower
    const fwd = !r || r.down === 'forward';
    const a = fwd ? { x: l.x, y: l.y } : { x: l.x2, y: l.y2 }, b = fwd ? { x: l.x2, y: l.y2 } : { x: l.x, y: l.y };
    const L = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / L, uy = (b.y - a.y) / L, hd = Math.min(L * 0.3, 2 * unitPerMm);
    items.push({ layer, kind: 'poly', pts: [a, b] });
    items.push({ layer, kind: 'poly', pts: [{ x: b.x - ux * hd - uy * hd * 0.45, y: b.y - uy * hd + ux * hd * 0.45 }, b, { x: b.x - ux * hd + uy * hd * 0.45, y: b.y - uy * hd - ux * hd * 0.45 }] });
    const text = !r ? '?' : r.pct < 0.05 ? W.flat : `1:${r.ratio >= 100 ? Math.round(r.ratio) : r.ratio.toFixed(1)} (${r.pct.toFixed(1)} %)`;
    const rot = Math.atan2(uy, ux), up = rot > Math.PI / 2 || rot < -Math.PI / 2 ? rot + Math.PI : rot;
    items.push({ layer, kind: 'text', x: (a.x + b.x) / 2 - uy * 1.2 * unitPerMm, y: (a.y + b.y) / 2 + ux * 1.2 * unitPerMm, mm, rot: up, text, align: 'center', italic: l.on === 'existing' });
  }
  return items;
}
