/* SPDX-License-Identifier: Apache-2.0 */
/**
 * emergency.js — emergency (escape) lighting on the floor (0.9 IL.7, session `adapters-09`). DOM-free.
 *
 * What it computes: with only the luminaires on the emergency circuit lit, at their emergency output (a share of rated lumens), the DIRECT illuminance on the floor
 *   - along an escape route's centre line (a polyline the person draws), points every `step` mm;
 *   - over the open area of the room (the floor inside a border of `border` mm).
 * Reflected light is ignored on purpose (a conservative choice, as emergency calculations usually make it); furniture in `obstacles` blocks the direct light.
 *
 * The limits below are TYPICAL values in the style of EN 1838, typed from memory, UNVERIFIED, exactly like the room requirements (standards.js, roadmap IL.5):
 * they wait for a lighting engineer to confirm them against the edition the project works to. The panel and the report say so; every number can be typed over.
 * Nothing here is a claim that an installation complies, and nothing about the time to reach full output, the duration, signs or the luminaires' battery.
 *
 *   EMERGENCY_NOTE      the sentence the panel and report carry
 *   EMERGENCY_DEFAULTS  { route: { min, ratio }, open: { min }, border }
 *   pickEmergency(luminaires, { every, offset }) → the luminaires on the emergency circuit (every n-th, 1 = all)
 *   routePoints(route, step) → [[x, y]] along the polyline
 *   runEmergency({ room, luminaires, share, route, step, openArea, border, requirements, obstacles, spacing }) → result
 */
import { gridPoints, stats } from './photometry.js';
import { cleanRoom, autoSpacing } from './calc.js';
import { directAt, hiddenByObstacle } from './obstruct.js';

export const EMERGENCY_NOTE = 'Typical values in the style of EN 1838, not checked against the current edition and waiting for a lighting engineer: confirm them, or type your own. Direct light only; no signs, duration or switch-over time.';
export const EMERGENCY_DEFAULTS = { route: { min: 1, ratio: 40 }, open: { min: 0.5 }, border: 500 };

export function pickEmergency(luminaires, { every = 1, offset = 0 } = {}) {
  const n = Math.max(1, Math.round(Number(every) || 1)), o = Math.max(0, Math.round(Number(offset) || 0));
  return luminaires.filter((_, i) => (i - o) % n === 0 && i >= o);
}
export function routePoints(route, step = 500) {
  const pts = (Array.isArray(route) ? route : []).map((p) => [Number(p[0]), Number(p[1])]).filter((p) => p.every(Number.isFinite)), out = [];
  if (pts.length < 2) return out;
  const st = Math.max(50, step);
  for (let i = 0; i + 1 < pts.length; i++) {
    const a = pts[i], b = pts[i + 1], len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(len / st));
    for (let k = i === 0 ? 0 : 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

export function runEmergency({ room, luminaires, share = 1, route = [], step = 500, openArea = true, border = EMERGENCY_DEFAULTS.border, requirements = {}, obstacles = null, spacing = 0 }) {
  const rm = cleanRoom(room);
  if (!luminaires || !luminaires.length) throw Object.assign(new Error('no emergency luminaires'), { key: 'err.noemergency' });
  const k = Math.max(0, Number(share));
  const lum = luminaires.map((L) => ({ ...L, f: undefined, scale: (L.scale ?? 1) * k }));
  const floor = (p) => directAt(lum, [p[0], p[1], 0], [0, 0, 1], obstacles);
  const rp = routePoints(route, step).filter((p) => !hiddenByObstacle([p[0], p[1], 1], obstacles));
  const rv = rp.map(floor), rs = rv.length ? stats(rv) : null;
  let ov = [], op = [];
  if (openArea) {
    const sp = spacing > 0 ? spacing : autoSpacing(rm.polygon);
    let g = gridPoints(rm.polygon, { spacing: sp, height: 0, margin: Math.max(0, border) });
    if (!g.points.length) g = gridPoints(rm.polygon, { spacing: sp, height: 0, margin: 0 });
    op = g.points.filter((p) => !hiddenByObstacle([p[0], p[1], 1], obstacles)); ov = op.map(floor);
  }
  const os = ov.length ? stats(ov) : null;
  const req = { routeMin: Number(requirements.routeMin ?? EMERGENCY_DEFAULTS.route.min), ratio: Number(requirements.ratio ?? EMERGENCY_DEFAULTS.route.ratio), openMin: Number(requirements.openMin ?? EMERGENCY_DEFAULTS.open.min) };
  const checks = [];
  if (rs && req.routeMin > 0) checks.push({ key: 'e.route.min', op: '>=', req: req.routeMin, found: rs.min, ok: rs.min >= req.routeMin });
  if (rs && req.ratio > 0) { const ratio = rs.min > 0 ? rs.max / rs.min : Infinity; checks.push({ key: 'e.route.ratio', op: '<=', req: req.ratio, found: ratio, ok: ratio <= req.ratio }); }
  if (os && req.openMin > 0) checks.push({ key: 'e.open.min', op: '>=', req: req.openMin, found: os.min, ok: os.min >= req.openMin });
  return {
    room: rm, count: lum.length, share: k, route: { points: rp, values: rv, min: rs ? rs.min : null, max: rs ? rs.max : null, avg: rs ? rs.avg : null },
    open: { points: op, values: ov, min: os ? os.min : null, max: os ? os.max : null, avg: os ? os.avg : null }, checks, requirements: req,
    notes: ['note.emergency', 'note.emergency2'],
  };
}
