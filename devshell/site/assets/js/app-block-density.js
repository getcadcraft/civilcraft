/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-density.js: the interface from a 13-inch laptop to a 49-inch ultrawide (UI.29; asked twice on /suggest: #1560 and #1507, "looks
 * like a cartoon app on a 13-inch MacBook"). Three things, none of which moves a tool:
 *   density steps   compact | normal | comfortable, chosen AUTOMATICALLY from the window and changeable (auto, or one of the three); the
 *                   step is html[data-ws-density] and scales the chrome (--ws-scale) and the panel bounds. It never touches the app's own
 *                   settings density (data-cc-density, 0.7 PANEL-COMPACT), which stays the person's.
 *   panel sizes     a panel's width is clamped to [min, max] for the step AND the window (panelBounds), so a side panel is never a third of a
 *                   13-inch screen nor a sliver on an ultrawide; toolbars fold to a "..." menu and never wrap (the blocks do that themselves).
 *   presentation    one switch that hides the chrome (title bar, ribbon, palettes, status, overlays but the view cube) so a client sees the
 *                   drawing: html[data-ws-present]; Esc or the small "Exit presentation" pill brings everything back; nothing is closed.
 * The six screen sizes of the row: 1280x800, 1440x900, 1920x1080, 2560x1440, 3440x1440, 5120x1440 (UI.17's contact sheet takes them).
 *
 *   STEPS · SIZES · autoStep(w, h, dpr) → step · panelBounds(step, w) → { min, max } in px
 *   createDensity({ root, app, onPresent }) → { step(), choice(), set('auto'|step), present(on), isPresenting(), refresh(), destroy() }
 *   it also registers the Craft menu option "Present" (id present, words shell.present) through ccShell.option (0.11 UI.18).
 */
import { el, store } from './app-block-core.js';
import { install as craftInstall } from './app-block-craft.js';

export const STEPS = ['compact', 'normal', 'comfortable'];
export const SCALE = { compact: 0.9, normal: 1, comfortable: 1.12 };
export const SIZES = [[1280, 800], [1440, 900], [1920, 1080], [2560, 1440], [3440, 1440], [5120, 1440]];
/**
 * Auto: the screen's CSS pixels. A laptop (width under 1600 or height under 900) is compact: the chrome must leave the drawing room; a big
 * flat screen at 1x (3000 wide or more with room in height) is comfortable: targets and type grow so a client across a table reads them.
 * Between, normal. A touch screen at a small width never gets compact (2.75 rem targets stay, the rule of the shell).
 */
export function autoStep(w, h, touch = false) {
  if (!(w > 0) || !(h > 0)) return 'normal';
  if (w >= 3000 && h >= 1200) return 'comfortable';
  if (w < 1600 || h < 900) return touch ? 'normal' : 'compact';
  return 'normal';
}
/** Panel width limits in px for a step in a window: at least 13 rem, at most 28 rem and never more than a quarter of the window (an ultrawide gets up to 40 rem). */
export function panelBounds(step, w) {
  const k = SCALE[step] || 1, rem = 16 * k;
  const min = Math.round(13 * rem), cap = w >= 3000 ? 40 : 28;
  const max = Math.max(min, Math.min(Math.round(cap * rem), Math.round(w * 0.25)));
  return { min, max };
}
export const clampPanel = (width, step, w) => { const b = panelBounds(step, w); return Math.min(b.max, Math.max(b.min, width)); };

export function createDensity({ root = document.documentElement, app = '', onPresent = () => {}, win = window } = {}) {
  const st = store(app);
  let choice = (() => { const v = st.get('density', 'auto'); return v === 'auto' || STEPS.includes(v) ? v : 'auto'; })();
  let presenting = false, pill = null;
  const touch = () => { try { return !!win.matchMedia?.('(pointer: coarse)').matches; } catch (e) { return false; } };
  const current = () => (choice === 'auto' ? autoStep(win.innerWidth, win.innerHeight, touch()) : choice);
  function refresh() {
    const s = current();
    root.setAttribute('data-ws-density', s); root.setAttribute('data-ws-density-mode', choice);
    root.style.setProperty('--ws-scale', String(SCALE[s]));
    const b = panelBounds(s, win.innerWidth || 1920);
    root.style.setProperty('--ws-panel-min', b.min + 'px'); root.style.setProperty('--ws-panel-max', b.max + 'px');
  }
  function present(on) {
    on = !!on; if (on === presenting) return presenting;
    presenting = on;
    if (on) {
      root.setAttribute('data-ws-present', '1');
      pill = el('button', { type: 'button', className: 'blk-present-exit', 'data-blk': 'present-exit' }, win.ccShellT ? win.ccShellT('shell.present.exit') : 'shell.present.exit');
      pill.addEventListener('click', () => present(false)); root.ownerDocument.body.append(pill);
    } else { root.removeAttribute('data-ws-present'); pill?.remove(); pill = null; }
    onPresent(on); return presenting;
  }
  const key = (e) => { if (e.key === 'Escape' && presenting) { e.preventDefault(); e.stopPropagation(); present(false); } };
  root.ownerDocument.addEventListener('keydown', key, true);
  win.addEventListener('resize', refresh);
  refresh();
  // 0.11 UI.18: Present is reached from the Craft menu (ccShell.option; kept and replayed until the menu exists), pinnable like the other options
  const word = (k) => { try { const v = win.ccShellT ? win.ccShellT(k) : ''; return v && v !== k ? v : ''; } catch (e) { return ''; } };
  let offPresent = null;
  try { const label = word('shell.present'); if (label) offPresent = craftInstall(win).option({ id: 'present', label, order: 40, icon: win.ccIconSet?.node?.('present') || undefined, run: () => present(true) }); } catch (e) { /* the menu keeps its other options */ }
  return {
    step: current, choice: () => choice, isPresenting: () => presenting, refresh, present,
    set(v) { if (v !== 'auto' && !STEPS.includes(v)) return false; choice = v; st.set('density', v); refresh(); return true; },
    destroy() { present(false); try { offPresent?.(); } catch (e) { /* */ } root.ownerDocument.removeEventListener('keydown', key, true); win.removeEventListener('resize', refresh); ['data-ws-density', 'data-ws-density-mode'].forEach((a) => root.removeAttribute(a)); ['--ws-scale', '--ws-panel-min', '--ws-panel-max'].forEach((p) => root.style.removeProperty(p)); },
  };
}
