/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-windows.js — the one window service (0.10 UI.2; pattern: docs/INTERFACE-PATTERN.md § One tear-off). Every unit that leaves the page
 * for a window of its own goes through `popout()`: the ribbon, the toolbox, the tool rows, the status bar, an app panel and the classic
 * toolbar. `windows` is the registry of them (units, isOpen, open, back, backAll); `menuButton` is the one "…" menu.
 *
 * The implementation lives in app-workspace-popout.js, which the packed editions already list; this file is the name callers move to
 * once the packers list it (Inbox, 2026-11-13). Both files export the same functions.
 */
export { popout, menuButton, windows } from './app-workspace-popout.js';

/* 0.11 UI.4 / UI.3 (studio-11 -> lead): inside Studio the shell keeps which pop-up windows were open and on which monitor (window.cadcraftDesktop.popups.restore()
 * → the titles). At start each title that matches a torn-off block reopens it, once; the shell then puts the window back on its monitor. Units join the registry
 * when their block mounts, so a title that has no unit yet is tried again (every 400 ms, for 30 s). Outside Studio there is no `popups`: nothing runs. */
import { windows as ccw } from './app-workspace-popout.js';
(async function restoreStudioWindows() {
  const restore = typeof window !== 'undefined' && window.cadcraftDesktop && window.cadcraftDesktop.popups && window.cadcraftDesktop.popups.restore;
  if (typeof restore !== 'function') return;
  let titles = [];
  try { titles = (await restore.call(window.cadcraftDesktop.popups)) || []; } catch (e) { return; }
  const todo = new Set(Array.isArray(titles) ? titles.filter((t) => typeof t === 'string' && t) : []);
  /* ui-finish-11: a classic toolbar the layout in use does not show (app-toolbar-tear.js brings it home at once) is not reopened: its window would flash and close */
  const notShown = (t) => {
    const tt = window.ccToolbarTear; if (!tt || typeof tt.bars !== 'function') return false;
    const u = ccw.units().find((x) => x.title === t), m = u && /^(?:toolbar|panel)-[a-z0-9-]+-(\d+)$/.exec(u.name);
    return !!m && tt.bars()[+m[1]]?.shown === false;
  };
  for (let i = 0; todo.size && i < 75; i++) {   // ui-finish-11: 30 s (was 12 s): on a busy computer the dock manager mounts the units later
    for (const t of [...todo]) { try { if (notShown(t) || ccw.openByTitle(t)) todo.delete(t); } catch (e) { /* tried again */ } }
    if (todo.size) await new Promise((r) => setTimeout(r, 400));
  }
})();
