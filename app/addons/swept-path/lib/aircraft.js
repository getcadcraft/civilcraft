/* SPDX-License-Identifier: Apache-2.0 */
/**
 * aircraft.js — an aircraft on the ground (SW.7). The nose gear steers and the main gear is the fixed axle: that is the core solver's
 * "front axle on the path, rear axle follows" vehicle, so the centre body is the core's own simulation. The rest of the aircraft is a set
 * of points rigidly fixed to the main gear's frame (wing tips, tail, engine pods): each is carried through every frame, traced, and
 * the body outline is the fuselage rectangle plus the wing as a thin quadrilateral from the tip points. Pushback = mode 'reverse'.
 */
import { fin } from './geom.js';

export function runAircraft(core, a, cv, path, opts) {
  const mode = opts.mode === 'reverse' ? 'reverse' : 'forward';
  const sim = core.simulate(cv, path, { mode, step: opts.step || null });
  if (!sim.frames.length) return { kind: 'aircraft', ok: false, frames: [], traces: [], steer: [], maxSteer: 0, maxArt: [], problems: [], length: 0, envelope: null, notes: ['The path is too short.'], error: 'The path is too short.' };
  // the points are measured from the MAIN gear (ahead + / behind −, side + = left), where the core's unit 0 has its rear axle
  const pts = [{ name: 'nose', ahead: a.noseToMain + a.noseToNose, side: 0 }, { name: 'tail', ahead: a.noseToMain + a.noseToNose - a.length, side: 0 },
    { name: 'wing tip left', ahead: pickAhead(a, 'wing tip left', -a.noseToMain * 0.3), side: a.span / 2 }, { name: 'wing tip right', ahead: pickAhead(a, 'wing tip right', -a.noseToMain * 0.3), side: -a.span / 2 },
    ...a.points.filter((p) => !/^(nose|tail|wing tip (left|right))$/.test(p.name))];
  const at = (q, p) => { const c = Math.cos(q.th), s = Math.sin(q.th); return { x: q.x + p.ahead * c - p.side * s, y: q.y + p.ahead * s + p.side * c }; };
  const frames = sim.frames.map((f) => {
    const q = f.units[0], P = Object.fromEntries(pts.map((p) => [p.name, at(q, p)]));
    const fus = core.bodyOutline(cv, f, 0);
    const wingHull = [P['wing tip left'], at(q, { ahead: pts[2].ahead - 3, side: a.span / 2 }), at(q, { ahead: pts[2].ahead - 3, side: -a.span / 2 }), P['wing tip right']];
    return { s: f.s, bodies: [fus, wingHull], steer: f.steer, art: [], extras: pts.map((p) => ({ name: p.name, ...P[p.name] })) };
  });
  const traces = pts.map((p) => ({ name: p.name, pts: frames.map((f) => { const e = f.extras.find((x) => x.name === p.name); return { x: e.x, y: e.y }; }) }));
  for (const [i, P] of (sim.wheels || []).entries()) traces.push({ name: 'gear-' + (i + 1), pts: P });
  const notes = [];
  if (!fin(a.span)) notes.push('no span');
  return { kind: 'aircraft', ok: true, frames, traces, steer: sim.frames.map((f) => f.steer), maxSteer: sim.maxSteer, maxArt: [], problems: sim.problems, length: sim.length, envelope: null, limit: { steer: cv.maxSteer, art: [] }, notes };
}
// where a pack lists a named point it wins over the default (a wing tip is usually well aft of the nose, close to the main gear)
const pickAhead = (a, name, dflt) => { const p = a.points.find((x) => x.name === name); return p ? p.ahead : dflt; };
