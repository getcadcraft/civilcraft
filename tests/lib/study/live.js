/* SPDX-License-Identifier: Apache-2.0 */
/**
 * live.js — live analysis while you edit (0.8 round 3, EG.29; DOM-free, no imports, canonical copy: lib/study/).
 *
 * A change to the model starts a coarse solve at once (the previous one is cancelled); a refined solve follows when the person lets go
 * (`release()`) or after a quiet period with no further change. A result that arrives for a model that has since changed is dropped, and
 * a coarse result never overwrites a refined one for the same model. Every result says which size made it: "coarse" or "refined".
 * Timers and the solve are injected, so the same controller drives a part (two element sizes), a frame (one size: `levels: ['refined']`)
 * and a test with a fake clock.
 *
 *   createLive({ solve, setTimer, clearTimer, quiet, coarseFactor, levels, onResult, onStatus, onError }) → live
 *     solve(input, { quality: 'coarse'|'refined', factor, cancelled() → bool, gen }) → Promise<result>
 *         `factor` is the element-size multiplier for that level (coarseFactor for coarse, 1 for refined); the caller applies it.
 *         `cancelled()` turns true as soon as a newer change or a stop makes the answer unwanted; a solver that can stop early should.
 *     onResult({ quality, gen, factor, result, ms? })   only for a result that is still wanted
 *     onStatus({ state, gen })   state: idle | coarse-running | coarse | refined-running | refined | error | stopped
 *     onError({ quality, gen, error })
 *   live.change(input)   the model changed: cancel what runs, solve coarse now, schedule refined after `quiet` ms
 *   live.release(input?) the person let go: refined now (uses the newest input)
 *   live.stop()          cancel everything (the Live switch went off)
 *   live.state()         { state, gen, quality (of the newest accepted result), input }
 *
 * Rules: (1) a change makes every solve in flight stale; (2) a result is shown only when its model is still the newest and it is not
 * lower in quality than what is already shown for that model; (3) refined starts on its own timer (or `release`), and a coarse solve
 * still running when it starts is not waited for.
 */
export const DEFAULTS = { quiet: 700, coarseFactor: 4, levels: ['coarse', 'refined'] };

export function createLive(opts) {
  const o = { ...DEFAULTS, ...opts };
  if (typeof o.solve !== 'function') throw new Error('createLive needs a solve function.');   // i18n-ignore: a programming error
  const setTimer = o.setTimer || ((fn, ms) => setTimeout(fn, ms)), clearTimer = o.clearTimer || ((h) => clearTimeout(h));
  const levels = o.levels.length ? o.levels : ['refined'];
  const hasCoarse = levels.includes('coarse');
  let gen = 0, input = null, timer = null, stopped = false;
  let shown = { gen: -1, quality: null };
  let running = { coarse: null, refined: null };   // { gen } of the solve in flight, per level
  let state = 'idle';
  const status = (s) => { state = s; if (o.onStatus) o.onStatus({ state: s, gen }); };
  const rank = (q) => (q === 'refined' ? 2 : q === 'coarse' ? 1 : 0);
  const factorOf = (q) => (q === 'coarse' ? o.coarseFactor : 1);

  function start(quality) {
    const myGen = gen, mine = { gen: myGen };
    running[quality] = mine;
    status(quality + '-running');
    const cancelled = () => stopped || gen !== myGen || running[quality] !== mine;
    let p;
    try { p = Promise.resolve(o.solve(input, { quality, factor: factorOf(quality), cancelled, gen: myGen })); } catch (e) { p = Promise.reject(e); }
    p.then((result) => {
      if (running[quality] === mine) running[quality] = null;
      if (stopped || myGen !== gen) return;                                   // the model changed meanwhile: stale
      if (shown.gen === myGen && rank(shown.quality) >= rank(quality)) return;  // a refined answer is already shown; coarse never replaces it
      shown = { gen: myGen, quality };
      if (o.onResult) o.onResult({ quality, gen: myGen, factor: factorOf(quality), result });
      // coarse still running at refined's arrival is now unwanted
      if (quality === 'refined') running.coarse = null;
      status(quality);
    }, (error) => {
      if (running[quality] === mine) running[quality] = null;
      if (stopped || myGen !== gen) return;
      if (error && error.message === 'Stopped.') return;   // i18n-ignore: the worker client's cancel message
      if (o.onError) o.onError({ quality, gen: myGen, error });
      status('error');
    });
  }

  const clear = () => { if (timer !== null) { clearTimer(timer); timer = null; } };
  const refinedSoon = () => { clear(); timer = setTimer(() => { timer = null; if (!stopped) start('refined'); }, o.quiet); };

  return {
    change(next) {
      stopped = false; input = next; gen++; clear();
      running = { coarse: null, refined: null };   // everything in flight is now stale
      if (hasCoarse) start('coarse');
      if (levels.includes('refined')) refinedSoon();
    },
    release(next) {
      if (stopped) return;
      if (next !== undefined) { if (next !== input) { input = next; gen++; running = { coarse: null, refined: null }; } }
      clear();
      if (levels.includes('refined') && !(running.refined && running.refined.gen === gen) && !(shown.gen === gen && shown.quality === 'refined')) start('refined');
    },
    stop() { stopped = true; clear(); running = { coarse: null, refined: null }; status('stopped'); },
    state() { return { state, gen, quality: shown.gen === gen ? shown.quality : null, input }; },
  };
}

/** Frame hook: a frame re-solve after an edit is one level ('refined'); a frame is cheap, so the quiet time is short. */
export function frameLive({ solve, setTimer, clearTimer, onResult, onStatus, onError, quiet = 150 }) {
  return createLive({ solve: (model, ctx) => solve(model, ctx), setTimer, clearTimer, onResult, onStatus, onError, quiet, levels: ['refined'] });
}

/**
 * How far a coarse answer may be from the refined one. Used by the tests and the panel's note: the fraction |coarse − refined| / |refined|
 * for each number the two results share, and the worst of them.
 */
export function spread(coarse, refined, keys) {
  const out = {};
  let worst = 0;
  for (const k of keys) {
    const a = coarse[k], b = refined[k];
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) continue;
    out[k] = Math.abs(a - b) / Math.abs(b);
    if (out[k] > worst) worst = out[k];
  }
  return { by: out, worst };
}
