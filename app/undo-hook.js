/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol only. */
/**
 * undo-hook.js — CivilCraft's end of the project-level undo (0.8 round 5, EG.77; docs/spikes/EG.77_PART_4.md, civil-mount_PART_5). The reporter is
 * undo-report.js (byte-identical copy of public_html/assets/js/undo-report.js). Each finished step is told to the window it runs in:
 *
 *   window event 'cc-undo-report' { detail: { type: 'edit.done', data: { step, label, depth, kind } } }   (Studio's host forwards it to the channel)
 *   window.ccUndoReporter.onMessage('undo.probe' | 'undo.run', data) → the reply Studio's journal waits for   (null = not ours)
 *
 * A step is "done" when the project's change / editPoints / editGis / setTin leaves the undo stack deeper than before (the project tells 'change');
 * the project's own undo and redo are told too. The project object is replaced when a file opens: attach() moves the hook to the new one, and the
 * stack it has not seen makes the probe say "moved" (Studio skips this window, never forces it).
 */
import { makeUndoReporter } from './undo-report.js';

export function mountUndoHook({ getProject, win = typeof window !== 'undefined' ? window : null }) {
  const depth = () => getProject().undoStack.length;
  const post = (type, data) => { try { win?.dispatchEvent(new CustomEvent('cc-undo-report', { detail: { type, data } })); } catch { /* no window */ } };
  let running = false, last = depth(), off = null, bound = null;
  const rep = makeUndoReporter({ depth, post, undoOne: () => { running = true; try { getProject().undo(); } finally { running = false; } }, label: () => getProject().undoStack.at(-1)?.label || '' });
  const onKind = (kind) => {
    const p = getProject(), d = p.undoStack.length;
    if (kind === 'undo') { last = d; if (!running) rep.undone(); }
    else if (kind === 'redo') { last = d; rep.redone(); }
    else if (d > last && !running) { last = d; rep.stepDone(p.undoStack.at(-1)?.label || ''); }
    else last = d;
  };
  /** Call after the app's project object was replaced (a file opened): the hook follows it. */
  function attach() {
    const p = getProject();
    if (p === bound) return rep;
    off?.(); bound = p; last = depth();
    off = p.on(onKind);
    return rep;
  }
  attach();
  if (win) win.ccUndoReporter = rep;
  return { rep, attach };
}
