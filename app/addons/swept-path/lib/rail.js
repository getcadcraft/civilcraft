/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rail.js — a light rail vehicle on a track (SW.7). There is no steering: both bogies stay on the track centre line, so the car's heading is the
 * direction from the rear bogie to the front one, and its body ends swing out of the track on a curve (inside at the middle, outside at the ends).
 * A consist is `cars` identical cars one behind the other, `gap` between the end bogie centres of neighbours. The car body is a rectangle
 * `front` ahead of its front bogie and `rear` behind its rear one. Everything is exact on a polyline (the track must be a fine polyline;
 * the adapter flattens arcs).
 *
 *   runRail(vehicle (project units), path, { step }) → the shape run.js returns; the front bogie of the first car follows the path.
 */
import { pointAt, cumulative } from './geom.js';

export function runRail(v, path, opts = {}) {
  const P = path.map((p) => ({ x: p.x, y: p.y })), cum = cumulative(P), total = cum[cum.length - 1];
  if (!(total > 0)) return { kind: 'rail', ok: false, frames: [], traces: [], steer: [], maxSteer: 0, maxArt: [], problems: [], length: 0, envelope: null, notes: ['The path is too short.'], error: 'The path is too short.' };
  const pitch = v.bogies + v.gap;                  // distance along the track from one car's front bogie to the next car's front bogie
  const back = (v.cars - 1) * pitch + v.bogies;    // the rearmost bogie is this far behind the first one
  const step = opts.step > 0 ? opts.step : Math.max(0.05, Math.min(v.bogies, total) / 40);
  const hw = v.width / 2, frames = [], traces = [];
  const names = [];
  for (let c = 0; c < v.cars; c++) names.push('bogie-' + (c + 1) + 'a', 'bogie-' + (c + 1) + 'b');
  const trace = Object.fromEntries(names.map((n) => [n, []])), outerL = [], outerR = [];
  // the vehicle front starts on the path's start; the rest of it is "behind the start" (on the track extended straight backwards)
  const ext = (s) => {   // a point at arc length s along the track, extended straight beyond both ends
    if (s >= 0 && s <= total) return pointAt(P, s, cum);
    const e = s < 0 ? pointAt(P, 0, cum) : pointAt(P, total, cum), d = s < 0 ? s : s - total;
    return { x: e.x + Math.cos(e.dir) * d, y: e.y + Math.sin(e.dir) * d, dir: e.dir };
  };
  let maxSwingIn = 0;
  for (let s = 0; s <= total + 1e-9; s += step) {
    const sA = Math.min(s, total), bodies = [];
    for (let c = 0; c < v.cars; c++) {
      const sf = sA - c * pitch, sr = sf - v.bogies, F = ext(sf), R = ext(sr);
      const th = Math.atan2(F.y - R.y, F.x - R.x), co = Math.cos(th), si = Math.sin(th);
      const corner = (a, b) => ({ x: R.x + a * co - b * si, y: R.y + a * si + b * co });   // a along the car from the REAR bogie, b to the left
      const body = [corner(-v.rear, -hw), corner(v.bogies + v.front, -hw), corner(v.bogies + v.front, hw), corner(-v.rear, hw)];
      bodies.push(body);
      trace['bogie-' + (c + 1) + 'a'].push({ x: F.x, y: F.y }); trace['bogie-' + (c + 1) + 'b'].push({ x: R.x, y: R.y });
      // how far the body ends are from the track centre line: the front end centre against the track, the middle against the chord
      const M = { x: (F.x + R.x) / 2, y: (F.y + R.y) / 2 }, T = ext(sA - c * pitch - v.bogies / 2);
      const off = (M.x - T.x) * -Math.sin(T.dir) + (M.y - T.y) * Math.cos(T.dir);   // + = the middle is left of the track
      maxSwingIn = Math.max(maxSwingIn, Math.abs(off));
      if (c === 0) { outerL.push(body[3]); outerR.push(body[2]); }
    }
    frames.push({ s: sA, bodies, steer: 0, art: [] });
    if (sA >= total) break;
  }
  for (const n of names) traces.push({ name: n, pts: trace[n] });
  traces.push({ name: 'front-left', pts: outerL }, { name: 'front-right', pts: outerR });
  return { kind: 'rail', ok: true, frames, traces, steer: [], maxSteer: 0, maxArt: [], problems: [], length: total, envelope: null, limit: { steer: 0, art: [] }, swing: { middle: maxSwingIn }, notes: [] };
}
