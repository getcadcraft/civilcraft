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
