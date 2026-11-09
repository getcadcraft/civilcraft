/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * pipeline.js — the OpenFOAM wind study for the Environment block (wind-openfoam add-on): for every wind direction in the weather file, write a case from the masses,
 * hand it to a runner (a separate program on the user's own computer that calls the user's OpenFOAM), read the pedestrian-height speed ratio back, and let the SAME
 * classification as the built-in solver (lib/wind/study.js classify: Lawson, NEN 8100) turn them into comfort maps. The add-on is GPL-3.0-or-later; the Apache-2.0 core
 * modules it imports are used unchanged.
 *
 *   runOpenFoamStudy({ masses, epw, sectors, z0Site, z0Met, gust, quality, runner, onProgress, shouldStop, override }) → same shape as windStudy() (+ engine: 'openfoam')
 *   runner.run({ files, steps, collect, onTick, shouldStop }) → { ok, files, log, failedStep }       (http-runner.js or a test stub)
 */
import { writeCase } from './case.js';
import { speedRatioGrid, samplesFromProbes } from './samples.js';
import { classify } from '../../../wind/study.js';
import { windRose } from '../../../wind/abl.js';
import { OPENFOAM_VALIDATION } from './validation.js';

export const QUALITY = { screening: { cph: 8, iterations: 1200 }, standard: { cph: 12, iterations: 2500 } };
const UREF = 10;   // m/s at 10 m: the ratio is the speed at 1.5 m over the speed at 10 m upstream, like the built-in solver's

export async function runOpenFoamStudy(o) {
  const { masses, epw, sectors = 8, z0Site = 0.5, z0Met = 0.03, gust = 1.5, quality = 'screening', runner, onProgress, shouldStop } = o;
  if (!masses?.length) throw new Error('no_masses');
  if (!epw) throw new Error('need_epw');
  if (!runner) throw new Error('need_runner');
  const q = { ...(QUALITY[quality] || QUALITY.screening), ...(o.override || {}) };
  const rose = windRose(epw, sectors), results = [], logs = [];
  const todo = rose.freq.filter((f) => f > 0).length; let done = 0;
  let plan = null;
  for (let s = 0; s < sectors; s++) {
    if (rose.freq[s] === 0) { results.push(null); continue; }
    const deg = s * (360 / sectors);
    const c = writeCase({ masses, deg, z0: z0Site, Uref: UREF, Zref: 10, cph: q.cph, iterations: q.iterations, gridMax: q.gridMax || 100 });
    const r = await runner.run({ files: c.files, steps: c.steps, collect: ['cc-samples.json', 'postProcessing/probes'], shouldStop, onTick: (t) => onProgress && onProgress((done + (t || 0)) / todo, s, t) });
    if (shouldStop && shouldStop()) return { stopped: true };
    if (!r.ok) throw new Error(`OpenFOAM stopped at ${r.failedStep || 'a step'} for the wind from ${deg}°: ${String(r.log || '').slice(-400)}`);
    // OpenFOAM's own probes when the build wrote them (v2512), else the runner's reader of the written fields (cc-samples.json, also the cell count)
    const fromFields = r.files['cc-samples.json'] ? JSON.parse(r.files['cc-samples.json']) : null, pk = Object.keys(r.files).filter((k) => /^postProcessing\/probes\/[^/]+\/U$/.test(k)).sort().pop();
    let samples = fromFields;
    if (pk) { try { const pr = samplesFromProbes(r.files[pk], r.files[pk.replace(/U$/, 'p')]); if (pr.U.length >= c.probes.n * c.probes.n) samples = { ...pr, cells: fromFields?.cells ?? null }; } catch { /* use the field reader */ } }
    if (!samples) throw new Error('OpenFOAM wrote neither probes nor fields');
    const ratio = speedRatioGrid(samples, c.probes, UREF);
    logs.push({ deg, cells: samples.cells, time: samples.time });
    results.push({ deg, frame: c.frame, plan: c.plan, nx: c.probes.n, ny: c.probes.n, ratio, drift: 0, pedHeight: c.probes.z, openfoam: { cells: samples.cells, iterations: samples.time } });
    plan ||= { dx: c.probes.cell, H: c.plan.H, cellsPerHeight: c.plan.cellsPerHeight, cells: samples.cells };
    done++;
    if (onProgress) onProgress(done / todo, s, 1);
  }
  if (!plan) throw new Error('no wind in the weather file');
  const out = classify({ masses, epw, sectors, rose, results, plan, z0Site, z0Met, gust, quality, validation: OPENFOAM_VALIDATION, engine: 'openfoam' });
  out.openfoam = logs;
  return out;
}
