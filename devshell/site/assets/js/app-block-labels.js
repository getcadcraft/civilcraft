/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-block-labels.js: optional labels under icons on first use (BK.123, Great Eight interface 08). New people see a short word under every
 * icon-only tool for their first sessions; the person can hide the labels at once, or keep them on; experienced people never see the
 * layout change (after `FIRST_USES` sessions the labels stop by themselves, and a person who hid them never sees them again).
 * One switch, html[data-ws-labels="1"], which app-block.css reads (the word is the tool's own aria-label, so nothing is written twice).
 * It is not UI.15's "labels follow" (the colour of the group names): this one adds the WORD under an icon.
 *
 *   state = { uses, mode: 'auto' | 'on' | 'off' }, kept in cc-ws-labels:<app>
 *   decide(state) → boolean                 auto = shown while uses <= FIRST_USES
 *   createLabels({ root, app, T }) → { visible(), mode(), set(mode), hint() → node, destroy() }   counts this session once on creation
 */
import { el, store } from './app-block-core.js';

export const FIRST_USES = 5;
export const MODES = ['auto', 'on', 'off'];
export const decide = (s) => (s.mode === 'on' ? true : s.mode === 'off' ? false : s.uses <= FIRST_USES);

export function createLabels({ root = document.documentElement, app = '', T = (k) => k, count = true } = {}) {
  const st = store(app);
  const saved = st.get('labels', null);
  const s = { uses: Number.isInteger(saved?.uses) && saved.uses >= 0 ? saved.uses : 0, mode: MODES.includes(saved?.mode) ? saved.mode : 'auto' };
  if (count) { s.uses += 1; st.set('labels', s); }
  const apply = () => { if (decide(s)) root.setAttribute('data-ws-labels', '1'); else root.removeAttribute('data-ws-labels'); };
  apply();
  return {
    visible: () => decide(s), mode: () => s.mode, uses: () => s.uses,
    set(mode) { if (!MODES.includes(mode)) return false; s.mode = mode; st.set('labels', s); apply(); return true; },
    /** The small line shown while labels are up on their own: "Names under the icons while you get started. Hide them" (one button). */
    hint() {
      if (s.mode !== 'auto' || !decide(s)) return null;
      const b = el('button', { type: 'button', className: 'blk-labels-hide' }, T('shell.labels.hide'));
      const n = el('div', { className: 'blk-labels-hint', role: 'note', 'data-blk': 'labels-hint' }, el('span', {}, T('shell.labels.hint')), b);
      b.addEventListener('click', () => { this.set('off'); n.remove(); });
      return n;
    },
    destroy() { root.removeAttribute('data-ws-labels'); },
  };
}
