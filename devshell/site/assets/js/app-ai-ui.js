/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-ai-ui.js — what app-ai-suggest.js, app-ai-activity.js and app-ai-ask.js share (round 2, ai-trust_PART_2): their stylesheet, loaded once by whichever
 * module runs first (they sit on app-tools-ui.js's .cct panels and add only app-ai.css). Not loaded on its own.
 */
export function aiStyles() {
  if (typeof document === 'undefined' || document.getElementById('cc-ai-css')) return;
  const l = document.createElement('link');
  l.id = 'cc-ai-css'; l.rel = 'stylesheet'; l.href = new URL('../css/app-ai.css', import.meta.url).href.replace(/\?.*$/, '');
  document.head.append(l);
}
