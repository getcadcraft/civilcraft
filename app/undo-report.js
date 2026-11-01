/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — protocol only. SPIKE PROTOTYPE (EG.77, spikes_PART_4): not mounted in any app; docs/spikes/EG.77_PART_4.md. */
/**
 * undo-report.js — the app side of the project-level undo (EG.77): a window tells Studio each step it finishes, and answers Studio's probe and run
 * for ITS OWN next undo, only when its undo stack is exactly as that step left it. DOM-free, no imports. The Studio side is studio/hub/undo-journal.js.
 *
 *   const rep = makeUndoReporter({ depth: () => stack.length, post: (type, data) => channel.send(type, data), undoOne: () => app.undo(), label: () => 'Place pump' })
 *   rep.stepDone('Place pump')        call after a step finishes (a push on the app's undo stack)  → posts edit.done { step, label, depth, kind: 'do' }
 *   rep.undone() / rep.redone()       call after the app's own undo / redo (by hand or by us)       → posts edit.done kind 'undo' / 'redo'
 *   rep.onMessage(type, data) → reply | null     answers 'undo.probe' → { depth, step, label } and 'undo.run' → { ok } ; anything else null
 *
 * Step ids are kept beside the stack depth. If the depth is not what the reporter last saw (a step it was never told about, an undo it did not see), the top step
 * is "unknown", the probe says so and Studio does not run the undo. Nothing is forced.
 */
export function makeUndoReporter({ depth, post, undoOne, label = () => '' }) {
  let seq = 0;
  const ids = [];            // ids[k] = the step id of the stack's entry k (0-based), for the depths this reporter saw
  let seen = depth();        // the depth after the last thing we were told about
  const top = () => (depth() === seen && ids.length === seen ? ids[seen - 1] : null);
  const sync = () => { while (ids.length > depth()) ids.pop(); while (ids.length < depth()) ids.push('?' + (++seq)); };
  return {
    stepDone(text) {
      const step = 's' + (++seq);
      while (ids.length > depth() - 1) ids.pop();
      while (ids.length < depth() - 1) ids.push('?' + (++seq));
      ids.push(step); seen = depth();
      post('edit.done', { step, label: String(text || label() || ''), depth: depth(), kind: 'do' });
      return step;
    },
    undone() { sync(); seen = depth(); post('edit.done', { step: ids[seen - 1] ?? '', label: '', depth: depth(), kind: 'undo' }); },
    redone() { sync(); seen = depth(); post('edit.done', { step: ids[seen - 1] ?? '', label: '', depth: depth(), kind: 'redo' }); },
    onMessage(type, data) {
      if (type === 'undo.probe') return { depth: depth(), step: top() || '', label: label() };
      if (type === 'undo.run') {
        const t = top();
        if (!t || (data && data.step && data.step !== t)) return { ok: false, why: 'moved' };
        const before = depth();
        undoOne();
        if (depth() !== before - 1) return { ok: false, why: 'failed' };
        ids.pop(); seen = depth();
        post('edit.done', { step: ids[seen - 1] ?? '', label: '', depth: seen, kind: 'undo' });
        return { ok: true };
      }
      return null;
    },
  };
}
