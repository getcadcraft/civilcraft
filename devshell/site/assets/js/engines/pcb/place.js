/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Placement (0.8 XE.11): simulated annealing on half-perimeter wire length + courtyard overlap + staying inside the outline. Seeded, so the same
 * seed gives the same board. Locked parts never move. Moves: shift, quarter-turn, swap. Textbook method (Kirkpatrick et al., Science 1983, applied to
 * placement as in Sechen/Sangiovanni-Vincentelli's TimberWolf, whose algorithm is published; no code of it is used).
 */
import { bbox } from './geom.js';
import { problem } from './board.js';

function rng(seed) { let a = seed >>> 0 || 1; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** Half-perimeter wire length of every net at the current positions (mm). */
export function hpwl(board) {
  const nets = new Map();
  for (const p of board.parts) for (const pad of p.pads) { const n = p.padNets[pad.num]; if (!n) continue; const w = board.padWorld(p, pad); if (!nets.has(n)) nets.set(n, []); nets.get(n).push([w.x, w.y]); }
  let t = 0; for (const pts of nets.values()) if (pts.length > 1) { const b = bbox(pts); t += (b[2] - b[0]) + (b[3] - b[1]); } return t;
}

const aabb = (board, p) => bbox(board.courtyardWorld(p));
const overlap = (a, b) => Math.max(0, Math.min(a[2], b[2]) - Math.max(a[0], b[0])) * Math.max(0, Math.min(a[3], b[3]) - Math.max(a[1], b[1]));

/**
 * place(board, {seed, iterations, gap}) moves the unlocked parts. gap = extra space kept between courtyards (mm). Returns
 * {before, after, overlaps, outside, moved, problems}. Parts at the same place (never placed) are first spread over a grid inside the outline.
 */
export function place(board, { seed = 1, iterations = 30000, gap = 0.3, keepRotation = false, edgeMargin = 0.5 } = {}) {
  const R = rng(seed), problems = [], free = board.parts.filter((p) => !p.locked), ob = bbox(board.outline), W = ob[2] - ob[0], H = ob[3] - ob[1];
  if (!free.length) return { before: hpwl(board), after: hpwl(board), overlaps: 0, outside: 0, moved: 0, problems };
  // courtyard area must fit
  const need = board.parts.reduce((s, p) => { const c = p.courtyard; return s + (c[2] - c[0] + gap) * (c[3] - c[1] + gap); }, 0);
  if (need > W * H * 0.9) problems.push(problem('place.too-full', 'The courtyards add up to ' + need.toFixed(0) + ' mm² on a ' + (W * H).toFixed(0) + ' mm² board; they cannot fit without overlap.', { fix: 'Enlarge the outline or use smaller parts.', severity: 'warning' }));
  // initial spread: shelf packing, biggest first
  const stuck = free.length > 1 && free.every((p) => p.x === free[0].x && p.y === free[0].y);
  if (stuck) {
    const order = free.slice().sort((a, b) => (b.courtyard[2] - b.courtyard[0]) * (b.courtyard[3] - b.courtyard[1]) - (a.courtyard[2] - a.courtyard[0]) * (a.courtyard[3] - a.courtyard[1]));
    let x = ob[0] + edgeMargin, y = ob[1] + edgeMargin, rowH = 0;
    for (const p of order) { const w = p.courtyard[2] - p.courtyard[0] + gap, h = p.courtyard[3] - p.courtyard[1] + gap; if (x + w > ob[2] - edgeMargin) { x = ob[0] + edgeMargin; y += rowH; rowH = 0; } p.x = x - p.courtyard[0] + gap / 2; p.y = y - p.courtyard[1] + gap / 2; x += w; rowH = Math.max(rowH, h); }
  }
  const nets = new Map(); board.parts.forEach((p, pi) => { for (const pad of p.pads) { const n = p.padNets[pad.num]; if (!n) continue; if (!nets.has(n)) nets.set(n, []); nets.get(n).push([pi, pad]); } });
  const netList = [...nets.values()].filter((l) => l.length > 1), partNets = board.parts.map(() => []); netList.forEach((l, ni) => { for (const [pi] of l) if (!partNets[pi].includes(ni)) partNets[pi].push(ni); });
  const netLen = (ni) => { let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; for (const [pi, pad] of netList[ni]) { const w = board.padWorld(board.parts[pi], pad); if (w.x < x0) x0 = w.x; if (w.x > x1) x1 = w.x; if (w.y < y0) y0 = w.y; if (w.y > y1) y1 = w.y; } return (x1 - x0) + (y1 - y0); };
  const boxes = board.parts.map((p) => { const b = aabb(board, p); return [b[0] - gap / 2, b[1] - gap / 2, b[2] + gap / 2, b[3] + gap / 2]; });
  const outPen = (b) => { const dx = Math.max(0, ob[0] + edgeMargin / 2 - b[0]) + Math.max(0, b[2] - (ob[2] - edgeMargin / 2)), dy = Math.max(0, ob[1] + edgeMargin / 2 - b[1]) + Math.max(0, b[3] - (ob[3] - edgeMargin / 2)); return dx * (b[3] - b[1]) + dy * (b[2] - b[0]); };
  const partCost = (pi) => { let c = outPen(boxes[pi]) * 50; for (let j = 0; j < boxes.length; j++) if (j !== pi && board.parts[j].side === board.parts[pi].side) c += overlap(boxes[pi], boxes[j]) * 50; return c; };
  const lens = netList.map((_, ni) => netLen(ni));
  let wl = lens.reduce((s, v) => s + v, 0), pen = 0; for (let i = 0; i < boxes.length; i++) pen += outPen(boxes[i]) * 50; for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) if (board.parts[i].side === board.parts[j].side) pen += overlap(boxes[i], boxes[j]) * 50;
  const before = hpwl(board), idx = (p) => board.parts.indexOf(p);
  let T = Math.max(1, (W + H) * 0.15) * 1, cur = wl + pen; const Tend = 0.002 * (W + H);
  const decay = Math.pow(Tend / T, 1 / Math.max(1, iterations));
  let moved = 0;
  for (let it = 0; it < iterations; it++, T *= decay) {
    const kind = R(), pa = free[Math.floor(R() * free.length)], ia = idx(pa), save = [{ p: pa, x: pa.x, y: pa.y, rot: pa.rot }];
    let ib = -1;
    if (kind < 0.55) { const s = Math.max(0.2, T * 1.2); pa.x += (R() - 0.5) * 2 * s; pa.y += (R() - 0.5) * 2 * s; }
    else if (kind < 0.7 && !keepRotation) pa.rot = (pa.rot + 90) % 360;
    else if (free.length > 1) { const pb = free[Math.floor(R() * free.length)]; if (pb === pa) continue; ib = idx(pb); save.push({ p: pb, x: pb.x, y: pb.y, rot: pb.rot }); [pa.x, pb.x] = [pb.x, pa.x]; [pa.y, pb.y] = [pb.y, pa.y]; }
    else continue;
    const touched = ib < 0 ? [ia] : [ia, ib], oldBoxes = touched.map((i) => boxes[i]), oldCost = touched.reduce((s, i) => s + partCost(i), 0), oldNets = new Set(touched.flatMap((i) => partNets[i])), oldLens = [...oldNets].map((n) => lens[n]);
    touched.forEach((i) => { const b = aabb(board, board.parts[i]); boxes[i] = [b[0] - gap / 2, b[1] - gap / 2, b[2] + gap / 2, b[3] + gap / 2]; });
    const newCost = touched.reduce((s, i) => s + partCost(i), 0); let dWl = 0; [...oldNets].forEach((n, k) => { const v = netLen(n); dWl += v - oldLens[k]; lens[n] = v; });
    const d = dWl + (newCost - oldCost) - (ib >= 0 ? 0 : 0);
    if (d <= 0 || R() < Math.exp(-d / T)) { cur += d; moved++; } else { for (const s of save) { s.p.x = s.x; s.p.y = s.y; s.p.rot = s.rot; } touched.forEach((i, k) => { boxes[i] = oldBoxes[k]; }); [...oldNets].forEach((n, k) => { lens[n] = oldLens[k]; }); }
  }
  // report
  let overlaps = 0, outside = 0; for (let i = 0; i < boxes.length; i++) { if (outPen(boxes[i]) > 1e-9) outside++; for (let j = i + 1; j < boxes.length; j++) if (board.parts[i].side === board.parts[j].side && overlap(boxes[i], boxes[j]) > 1e-9) overlaps++; }
  if (overlaps) problems.push(problem('place.overlap', overlaps + ' courtyard pair(s) still overlap after placement.', { severity: 'warning', fix: 'More iterations, a larger board, or move parts by hand.' }));
  if (outside) problems.push(problem('place.outside', outside + ' part(s) reach outside the outline margin.', { severity: 'warning' }));
  for (const p of board.parts) { p.x = Math.round(p.x * 1000) / 1000; p.y = Math.round(p.y * 1000) / 1000; }
  return { before, after: hpwl(board), overlaps, outside, moved, problems };
}
