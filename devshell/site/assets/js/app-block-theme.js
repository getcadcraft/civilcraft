/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-theme.js: the theme switch as a sun and a moon (UI.20; owner 2026-11-09: where we say "paper/model" we switch to sun/moon icons).
 * One component, two icon buttons in one row, the pressed one lit: a sun for the light theme and a moon for the dark one, with "Light theme"
 * and "Dark theme" as tooltips and labels (and "Match the system" where Settings offers it). THE WORDING ONLY: the stored values stay
 * paper / model (localStorage cc-space, the cc_space cookie, html[data-space]) and the logo file names cadcraft-logo-{paper,model} are
 * internal names nothing reads. The component prints the same `form.space-toggle` with `button[name=space][value=paper|model]` that
 * site.js already wires, so the click, the cookie and the pressed state work with no change there; used by the Craft menu (a row of icons,
 * never list items), the app bar, its More menu, Settings and the Studio hub (the .inc that prints it is perf-start-10's: Inbox line).
 * CadCraft's own paper space and model space (the drawing's layouts, the MODEL / PAPER status toggle) are not touched.
 *
 *   themeToggle({ T, current, system }) → the form node          VALUES = { light: 'paper', dark: 'model' }
 *   current: 'paper' | 'model' (default: html[data-space]); system: true adds a third button "Match the system" (value 'system', not stored here)
 */
import { el, svgEl } from './app-block-core.js';

export const VALUES = Object.freeze({ light: 'paper', dark: 'model' });
const sun = () => svgEl('svg', { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': 'true', focusable: 'false', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linecap': 'round' },
  svgEl('circle', { cx: 12, cy: 12, r: 4 }),
  ...[[12, 2.5, 12, 5], [12, 19, 12, 21.5], [2.5, 12, 5, 12], [19, 12, 21.5, 12], [5.3, 5.3, 7, 7], [17, 17, 18.7, 18.7], [5.3, 18.7, 7, 17], [17, 7, 18.7, 5.3]].map(([a, b, c, d]) => svgEl('line', { x1: a, y1: b, x2: c, y2: d })));
const moon = () => svgEl('svg', { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': 'true', focusable: 'false', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8, 'stroke-linejoin': 'round' },
  svgEl('path', { d: 'M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z' }));
const auto = () => svgEl('svg', { viewBox: '0 0 24 24', width: 18, height: 18, 'aria-hidden': 'true', focusable: 'false', fill: 'none', stroke: 'currentColor', 'stroke-width': 1.8 },
  svgEl('circle', { cx: 12, cy: 12, r: 8 }), svgEl('path', { d: 'M12 4a8 8 0 0 1 0 16z', fill: 'currentColor' }));

export function themeToggle({ T = (k) => k, current, system = false, action = '' } = {}) {
  const cur = current || document.documentElement.getAttribute('data-space') || VALUES.light;
  const mk = (value, key, icon) => {
    const b = el('button', { type: 'submit', name: 'space', value, className: 'blk-theme-btn', 'aria-pressed': String(cur === value), title: T(key), 'aria-label': T(key) });
    b.append(icon()); return b;
  };
  const f = el('form', { className: 'space-toggle blk-theme', method: 'get', action, role: 'group', 'aria-label': T('shell.bar.theme') });
  f.append(mk(VALUES.light, 'shell.bar.light', sun), mk(VALUES.dark, 'shell.bar.dark', moon));
  if (system) f.append(mk('system', 'shell.bar.system', auto));
  return f;
}
/** The words that used to read "Paper" / "Model" in a theme control; a test keeps them off the controls (the drawing's own spaces keep theirs). */
export const RETIRED_WORDS = ['shell.bar.paper', 'shell.bar.model', 'shell.bar.paper.title', 'shell.bar.model.title'];
