/* SPDX-License-Identifier: Apache-2.0 */
/**
 * realtime.js — run a simulation at the pace of the wall clock (0.8 SU.858 step 4 extra, session flow-08). DOM-free; the clock is
 * passed in, so tests drive it by hand. This is also the piece a PLC link needs (plan step 5, Studio only, waits on O2): the
 * model's clock then follows the real one, and `inputs` can change between ticks.
 *
 *   const rt = makeRealtime(sim, { scale: 1, clock: () => performance.now() })
 *   rt.start()               begins the run (sim.begin()); returns false when the graph has problems
 *   rt.tick() → { t, done }  advance the model to where the wall clock says it should be; done = the run is over
 *   rt.setScale(n)           1 = real time, 10 = ten times faster; continues from where the model is now
 *   rt.pause() · rt.resume()
 *   rt.t                     the model time now
 *
 * The same events happen in the same order as in sim.run(): stepping in many small ticks gives the identical result.
 */
export const MAX_SCALE = 3600;

export function makeRealtime(sim, { scale = 1, clock = () => performance.now() } = {}) {
  let wall0 = 0, sim0 = 0, paused = false, started = false, k = Math.min(MAX_SCALE, Math.max(0.01, scale));
  const rebase = () => { wall0 = clock(); sim0 = sim.now; };
  return {
    start() { if (!sim.begin()) return false; started = true; paused = false; rebase(); return true; },
    tick() {
      if (!started) return { t: sim.now, done: false };
      if (paused) return { t: sim.now, done: sim.over };
      const target = sim0 + ((clock() - wall0) / 1000) * k;
      const done = sim.advance(target);
      return { t: sim.now, done };
    },
    setScale(n) { k = Math.min(MAX_SCALE, Math.max(0.01, n)); if (started && !paused) rebase(); },
    pause() { if (started && !paused) { this.tick(); paused = true; } },
    resume() { if (started && paused) { paused = false; rebase(); } },
    get t() { return sim.now; },
    get scale() { return k; },
    get paused() { return paused; },
  };
}
