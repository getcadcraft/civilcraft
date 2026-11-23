/* SPDX-License-Identifier: Apache-2.0 */
/**
 * run.js — one entry for all three vehicle kinds (SW.3, SW.7). Road vehicles and the aircraft's centre body go through CivilCraft's own
 * swept path solver (handed in once with configure(), the WaterCraft way: ONE solver, never a second copy); rail follows the track rigidly.
 *
 *   configure({ simulate, envelope })             the core's swept.js functions
 *   run(vehicle, path, { units, mode, step })     vehicle = a clean pack vehicle (metres), path = [{x, y, b?}] in project units
 *   → { kind, ok, frames: [{ s, bodies: [[{x,y}]…], extras?: [{name,x,y}] }], traces: [{ name, pts }], steer, maxSteer, maxArt, problems[], length, envelope?, notes[] }
 *   frames hold the BODY POLYGONS (for clearance and drawing); traces are the paths worth drawing (wheels, wing tips, bogies, outer corners).
 */
import { coreVehicle, toUnits } from './vehicle.js';
import { runAircraft } from './aircraft.js';
import { runRail } from './rail.js';
import { sweptEnvelope } from './envelope.js';

let core = null;
export function configure(c) { core = c && typeof c.simulate === 'function' && typeof c.envelope === 'function' && typeof c.bodyOutline === 'function' ? c : null; return !!core; }
export const configured = () => !!core;

export function run(vehicle, path, opts = {}) {
  const units = opts.units === 'ft' ? 'ft' : 'm';
  if (!vehicle) return fail('no vehicle');
  if (!Array.isArray(path) || path.length < 2) return fail('The path needs at least two points.');
  if (vehicle.kind === 'rail') return runRail(toUnits(vehicle, units), path, opts);
  if (!core) return fail('The swept path solver was not handed in (configure).');
  if (vehicle.kind === 'aircraft') return runAircraft(core, toUnits(vehicle, units), coreVehicle(vehicle, units), path, opts);
  const cv = coreVehicle(vehicle, units);
  const sim = core.simulate(cv, path, { mode: opts.mode === 'reverse' ? 'reverse' : 'forward', step: opts.step || null });
  if (!sim.frames.length) return fail('The path is too short.');
  const n = 1 + cv.trailers.length;
  const frames = sim.frames.map((f) => ({ s: f.s, bodies: Array.from({ length: n }, (_, i) => core.bodyOutline(cv, f, i)), steer: f.steer, art: f.art }));
  const w = sim.wheels || [];
  const traces = w.map((P, i) => ({ name: 'wheel-' + (i + 1), pts: P }));
  // FX.351: our own sparse envelope (a fine cell at any path length); the core's dense grid is kept only for opts.coreEnvelope
  const env = opts.envelope === false ? null : opts.coreEnvelope ? core.envelope(sim, cv, { cell: opts.cell || null }) : sweptEnvelope(frames.flatMap((f) => f.bodies), { cell: opts.cell || null, tol: opts.tol || null });
  return { kind: 'road', ok: true, frames, traces, steer: sim.frames.map((f) => f.steer), maxSteer: sim.maxSteer, maxArt: sim.maxArt, problems: sim.problems, length: sim.length, stepError: stepError(frames), envelope: env, limit: { steer: cv.maxSteer, art: cv.trailers.map((t) => t.maxArticulation) }, notes: [] };
}
/** SW.3: how far a body corner can leave the union of the sampled bodies between two frames: chord x turn / 8 (the sagitta of the arc it travels), the largest over the run, in project units. */
export function stepError(frames) {
  let worst = 0;
  for (let i = 1; i < frames.length; i++) {
    const A = frames[i - 1].bodies, B = frames[i].bodies;
    for (let u = 0; u < Math.min(A.length, B.length); u++) {
      const a = A[u], b = B[u]; if (!a || !b || a.length < 2 || b.length < 2) continue;
      let d = Math.atan2(b[1].y - b[0].y, b[1].x - b[0].x) - Math.atan2(a[1].y - a[0].y, a[1].x - a[0].x);
      d = Math.abs(Math.atan2(Math.sin(d), Math.cos(d)));
      for (let k = 0; k < Math.min(a.length, b.length); k++) worst = Math.max(worst, Math.hypot(b[k].x - a[k].x, b[k].y - a[k].y) * d / 8);
    }
  }
  return worst;
}
const fail = (m) => ({ kind: null, ok: false, frames: [], traces: [], steer: [], maxSteer: 0, maxArt: [], problems: [], length: 0, envelope: null, notes: [m], error: m });
