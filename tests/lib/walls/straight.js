/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/walls/straight.js — for a host whose walls are straight only (CadCraft plan walls, session walls-plan-09; BimCraft draws curved
 * walls and does not take this file): a curved piece of a draw.js path becomes chords. Host-free.
 *
 *   chordsOf(seg, stepDeg)    { a, b, bulge } → [{ a, b, bulge: 0 }]: chords of at most stepDeg degrees each (at least two), corners on the arc
 *   flatten(path, stepDeg)    a draw.js path with every curved side made chords, closed as it was
 */
import { segsOf } from './draw.js';
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1]];
const mul = (a, k) => [a[0] * k, a[1] * k];

export function chordsOf(seg, stepDeg = 15) {
  const bg = Number(seg.bulge) || 0;
  if (!(Math.abs(bg) > 1e-9)) return [{ a: seg.a, b: seg.b, bulge: 0 }];
  const A = seg.a, B = seg.b, d = sub(B, A), c = Math.hypot(d[0], d[1]);
  if (c < 1e-9) return [];
  const theta = 4 * Math.atan(bg), nl = [-d[1] / c, d[0] / c], h = bg * c / 2, m = mul(add(A, B), 0.5);
  const mid = sub(m, mul(nl, h)), R = ((c / 2) ** 2 + h * h) / (2 * Math.abs(h)), sg = Math.sign(theta);
  const C = add(mid, mul(nl, R * sg)), a0 = Math.atan2(A[1] - C[1], A[0] - C[0]);
  const n = Math.max(2, Math.ceil(Math.abs(theta) / (stepDeg * Math.PI / 180)));
  const pts = [A];
  for (let i = 1; i < n; i++) { const f = a0 + theta * i / n; pts.push([C[0] + R * Math.cos(f), C[1] + R * Math.sin(f)]); }
  pts.push(B);
  return pts.slice(0, -1).map((p, i) => ({ a: p, b: pts[i + 1], bulge: 0 }));
}
/** A path with every curved side made chords (see chordsOf): a path of straight sides, closed as it was. */
export function flatten(path, stepDeg = 15) {
  const chords = segsOf(path).flatMap((s) => chordsOf(s, stepDeg));
  if (!chords.length) return { points: [], bulges: [], closed: !!path.closed };
  const points = chords.map((s) => s.a);
  if (!path.closed) points.push(chords[chords.length - 1].b);
  return { points, bulges: points.map(() => 0), closed: !!path.closed };
}
