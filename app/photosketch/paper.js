/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — paper keys and unit names are codes; hosts word them. */
/**
 * paper.js — cc-photosketch's paper sizes, units and three-point arc (0.8 round 3, model_PART_3): the same numbers as CadCraft's sheets.js
 * PAPERS / UNIT_MM and scan.js arcThrough, without the host's words or imports, so the engine runs in every host (rule 39).
 *   PAPERS [{ key, w, h, unit }] · UNIT_MM { unit → millimetres } · arcThrough(p1, p2, p3) → { cx, cy, r, a0, a1 } (counter-clockwise) | null
 */
export const PAPERS = [
  { key: 'iso-a4', w: 297, h: 210, unit: 'mm' }, { key: 'iso-a3', w: 420, h: 297, unit: 'mm' }, { key: 'iso-a2', w: 594, h: 420, unit: 'mm' },
  { key: 'iso-a1', w: 841, h: 594, unit: 'mm' }, { key: 'iso-a0', w: 1189, h: 841, unit: 'mm' },
  { key: 'letter', w: 11, h: 8.5, unit: 'in' }, { key: 'legal', w: 14, h: 8.5, unit: 'in' }, { key: 'ansi-b', w: 17, h: 11, unit: 'in' },
  { key: 'ansi-c', w: 22, h: 17, unit: 'in' }, { key: 'ansi-d', w: 34, h: 22, unit: 'in' },
  { key: 'arch-c', w: 24, h: 18, unit: 'in' }, { key: 'arch-d', w: 36, h: 24, unit: 'in' }, { key: 'arch-e', w: 48, h: 36, unit: 'in' },
];
export const UNIT_MM = {
  millimeters: 1, centimeters: 10, meters: 1000, kilometers: 1e6, inches: 25.4, feet: 304.8, yards: 914.4,
  miles: 1609344, microinches: 25.4e-6, mils: 0.0254, mm: 1, in: 25.4,
};
export function arcThrough(p1, p2, p3) {
  const ax = p1.x, ay = p1.y, bx = p2.x, by = p2.y, cx = p3.x, cy = p3.y;
  const d = 2 * (ax * (by - cy) + bx * (cy - ay) + cx * (ay - by));
  if (Math.abs(d) < 1e-12) return null;
  const ux = ((ax * ax + ay * ay) * (by - cy) + (bx * bx + by * by) * (cy - ay) + (cx * cx + cy * cy) * (ay - by)) / d;
  const uy = ((ax * ax + ay * ay) * (cx - bx) + (bx * bx + by * by) * (ax - cx) + (cx * cx + cy * cy) * (bx - ax)) / d;
  const r = Math.hypot(ax - ux, ay - uy), TAU = Math.PI * 2;
  const cross = (bx - ax) * (cy - by) - (by - ay) * (cx - bx);   // > 0: the three points run counterclockwise
  const ang = (p) => ((Math.atan2(p.y - uy, p.x - ux) % TAU) + TAU) % TAU;
  return cross > 0 ? { cx: ux, cy: uy, r, a0: ang(p1), a1: ang(p3) } : { cx: ux, cy: uy, r, a0: ang(p3), a1: ang(p1) };
}
