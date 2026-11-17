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
  const env = opts.envelope === false ? null : core.envelope(sim, cv, { cell: opts.cell || null });
  return { kind: 'road', ok: true, frames, traces, steer: sim.frames.map((f) => f.steer), maxSteer: sim.maxSteer, maxArt: sim.maxArt, problems: sim.problems, length: sim.length, envelope: env, limit: { steer: cv.maxSteer, art: cv.trailers.map((t) => t.maxArticulation) }, notes: [] };
}
const fail = (m) => ({ kind: null, ok: false, frames: [], traces: [], steer: [], maxSteer: 0, maxArt: [], problems: [], length: 0, envelope: null, notes: [m], error: m });
