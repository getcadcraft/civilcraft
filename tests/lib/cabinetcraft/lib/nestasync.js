/* SPDX-License-Identifier: Apache-2.0 */
/**
 * nestasync.js — the nest without freezing the page (0.8 DC.117, session `cabinetcraft_addon`). DOM-free apart from the Worker the caller makes.
 *
 *   nestAsync(build, { say, tries, timeLimit, seed, onProgress, makeWorker, yieldFn }) → Promise<nestAll result>
 *     1. On a Web Worker (makeWorker() → a Worker-like object, or a promise of one with postMessage / onmessage / onerror / terminate): lib/nest-worker.js does the whole nest and
 *        reports each try; the page never waits.
 *     2. When there is no worker (or it fails to start, or dies): the same nest on the page's own thread, one material at a time, giving the page back
 *        (yieldFn, a timer by default) between materials and after each try's report. A single material still runs in one piece.
 *   The result is the same either way (same parts, same seed). onProgress({ group, groups, material, thickness, done, total, via: 'worker' | 'page' }).
 */
import { nestGroups, nestOne, nestJoin } from './sheets.js';
import { sheetOfFor } from './analyze.js';

const tick = () => new Promise((r) => setTimeout(r, 0));

export async function nestAsync(build, { say = (k) => k, tries = 6, timeLimit = 4000, seed = 1, onProgress = () => {}, makeWorker = null, yieldFn = tick } = {}) {
  const p = build.project;
  const sheetOf = sheetOfFor(p, say);
  const margin = p.sheet.margin, spacing = p.sheet.spacing;
  const groups = nestGroups(build.parts);
  const sheets = {};
  for (const g of groups) sheets[g.material + '|' + g.thickness] = sheetOf(g.material, g.thickness);
  if (makeWorker) {
    let w = null;
    try { w = await makeWorker(); } catch { w = null; }
    if (w) {
      const r = await new Promise((resolve) => {
        const finish = (v) => { try { w.terminate(); } catch { /* already gone */ } resolve(v); };
        w.onmessage = (e) => {
          const m = e && e.data;
          if (!m) return;
          if (m.type === 'progress') onProgress({ ...m, via: 'worker' });
          else if (m.type === 'done') finish(m.result);
          else if (m.type === 'error') finish(null);
        };
        w.onerror = () => finish(null);
        try { w.postMessage({ type: 'nest', parts: JSON.parse(JSON.stringify(build.parts)), sheets, fallback: { w: p.sheet.w, h: p.sheet.h }, margin, spacing, tries, timeLimit, seed }); } catch { finish(null); }
      });
      if (r) return r;
    }
  }
  const done = [];
  let base = 0;
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi];
    await yieldFn();
    const r = nestOne(g, base, { sheetOf, margin, spacing, tries, timeLimit, seed, onProgress: (q) => onProgress({ group: gi + 1, groups: groups.length, material: g.material, thickness: g.thickness, ...q, via: 'page' }) });
    done.push(r);
    base += r.mat.result.sheets.length;
  }
  return nestJoin(done, margin);
}
