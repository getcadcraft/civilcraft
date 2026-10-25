/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages carried back to sunhours-run.js */
/**
 * sunhours-worker.js — runs sunhours.js off the page (0.7 LC.1 M4). A message {id, input} is answered with {id, result} or
 * {id, error}. One file with no imports of its own beyond sunhours.js: CivilCraft does not carry the lib/compute pool (it would
 * bring the BVH and render files into an app that does not render); sunhours-run.js splits a season over a few of these.
 */
import { sunHours } from './sunhours.js';

self.onmessage = (e) => {
  const { id, input } = e.data || {};
  try { self.postMessage({ id, result: sunHours(input) }); } catch (err) { self.postMessage({ id, error: String(err?.message || err) }); }
};
