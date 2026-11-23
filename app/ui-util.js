/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ui-util.js — small DOM and formatting helpers for the CivilCraft UI (copied from CadCraft).
 * el() is the only way file-derived text reaches the page: children are appended as text
 * nodes (textContent semantics), never parsed as HTML. A drawing is untrusted input.
 */
import { makeEl, fillDlWith, bytes, num, fmt, frame } from './ui-util-core.js';
export { bytes, num, fmt, frame };

export const el = makeEl();   // PERF.74: the shared builder with this app's own rules (ui-util-core.js)

export function fillDl(dl, rows) { fillDlWith(el, dl, rows); }

