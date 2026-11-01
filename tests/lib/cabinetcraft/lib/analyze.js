/* SPDX-License-Identifier: Apache-2.0 */
/**
 * analyze.js — one call from a job to everything the panel, the exports and the tests show (0.8 DC.117, session `cabinetcraft_addon`).
 * DOM-free. The build is cheap and runs on every edit; the nest is not (it runs when asked) and is kept by the caller.
 *
 *   analyze(project, { say, word, t, nest (a nestAll result | null), nestOpts }) →
 *     { build, list (lib/cutlist cutList), linear, est (estimate), problems (checkJob) }
 *   runNest(build, { sheetOf?, tries, timeLimit, seed }) → nestAll result for the job (sheets by material from the job's materials)
 */
import { buildJob } from './build.js';
import { cutListOf, nestAll, linearList, sheetParts } from './sheets.js';
import { sheetFor } from './materials.js';
import { estimate } from './estimate.js';
import { checkJob } from './checks.js';

export function sheetOfFor(project, say) {
  return (material, thickness) => sheetFor(material, thickness, { picks: project.picks, custom: project.custom, say, unit: project.unit, fallback: { w: project.sheet.w, h: project.sheet.h } });
}

export function runNest(build, { say = (k) => k, tries = 6, timeLimit = 20000, seed = 1 } = {}) {
  const p = build.project;
  return nestAll(build.parts, { sheetOf: sheetOfFor(p, say), margin: p.sheet.margin, spacing: p.sheet.spacing, tries, timeLimit, seed });
}

export function analyze(project, { say = (k) => k, word = (k) => k, t = (k) => k, nest = null, install = false } = {}) {
  const build = buildJob(project, { say, word });
  const list = cutListOf(build.parts, { merge: true, bandWaste: 0 });
  const linear = linearList(sheetParts(build.parts).linear);
  const est = estimate(build, nest, { rates: project.rates, sheetOf: sheetOfFor(project, say), install, ok: project.ratesOk || [] });
  const problems = checkJob(build, { nest, est, t });
  return { build, list, linear, est, problems };
}
