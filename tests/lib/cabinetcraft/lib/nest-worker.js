/* SPDX-License-Identifier: Apache-2.0 */
/**
 * nest-worker.js — the nest on a Web Worker, so the page stays alive while a kitchen is laid out on sheets (0.8 DC.117, session `cabinetcraft_addon`).
 * `handle(message, post)` is the whole job and is plain: the Node tests call it directly; in a worker, `self.onmessage` calls it.
 *
 *   in   { type: 'nest', parts, sheets: { 'material|thickness': { w, h } }, fallback: { w, h }, margin, spacing, tries, timeLimit, seed }
 *   out  { type: 'progress', group, groups, material, thickness, done, total } … then { type: 'done', result } or { type: 'error', message }
 */
import { nestAll } from './sheets.js';

export function handle(msg, post) {
  if (!msg || msg.type !== 'nest') throw new Error('nest-worker: unknown message');   // i18n-ignore: a developer error
  const sheetOf = (material, thickness) => (msg.sheets && msg.sheets[material + '|' + thickness]) || msg.fallback;
  const result = nestAll(msg.parts, { sheetOf, margin: msg.margin, spacing: msg.spacing, tries: msg.tries, timeLimit: msg.timeLimit, seed: msg.seed, onProgress: (p) => post({ type: 'progress', ...p }) });
  post({ type: 'done', result });
}

if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = (e) => {
    try { handle(e.data, (m) => self.postMessage(m)); } catch (err) { self.postMessage({ type: 'error', message: String((err && err.message) || err) }); }
  };
}
