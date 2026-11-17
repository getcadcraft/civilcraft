/* SPDX-License-Identifier: Apache-2.0 */
/**
 * app-workspace-overflow.js — a bar never wraps (0.10 UI.6, look.overflow; owner: "a bar never wraps"). One helper for the menu bar and the tool rows:
 *   more     what does not fit folds from the right into a ⋯ button (the first items stay, a pick runs the folded item's own button)
 *   compact  when it does not fit, everything folds into one ☰ button
 *   drop     when it does not fit, the bar takes its own row (the items flow on a second line, data-ws-drop)
 * foldBar(bar, { items: () => [Node], mode, label, glyph }) → { run(), destroy() }; run() is called on resize and when the bar's items change.
 * The folded items are not moved: a hidden copy of each is listed in the popover and a click on the copy clicks the original, so the bar's own handlers keep working.
 */
export const OVERFLOW = ['more', 'compact', 'drop'];

export function foldBar(bar, { items, mode = 'more', label = 'More', glyph } = {}) {
  if (!OVERFLOW.includes(mode)) mode = 'more';
  const doc = () => bar.ownerDocument;
  let more = null, pop = null, away = null;
  const close = () => { if (pop) { pop.remove(); pop = null; more?.setAttribute('aria-expanded', 'false'); doc().removeEventListener('pointerdown', away, true); } };
  const reset = () => { close(); more?.remove(); more = null; bar.removeAttribute('data-ws-drop'); for (const n of items()) n.hidden = false; };
  const fits = () => bar.scrollWidth <= bar.clientWidth + 1;
  const text = (n) => (n.querySelector('[data-vw-open], summary, button')?.textContent || n.getAttribute('aria-label') || n.textContent || '').replace(/\s+/g, ' ').trim();
  function open() {
    if (pop) { close(); return; }
    const hidden = items().filter((n) => n.hidden);
    pop = doc().createElement('div'); pop.className = 'ws-more-pop'; pop.setAttribute('role', 'menu');
    for (const n of hidden) {
      const b = doc().createElement('button'); b.type = 'button'; b.className = 'ws-more-item'; b.setAttribute('role', 'menuitem'); b.textContent = text(n);
      b.addEventListener('click', () => { close(); const o = n.matches('button') ? n : n.querySelector('[data-vw-open], summary, button'); n.hidden = false; o?.click(); n.hidden = true; });
      pop.append(b);
    }
    bar.append(pop); more.setAttribute('aria-expanded', 'true');
    away = (e) => { if (!pop?.contains(e.target) && e.target !== more) close(); };
    doc().addEventListener('pointerdown', away, true);
  }
  function run() {
    reset();
    const list = items();
    if (!list.length || fits()) return;
    if (mode === 'drop') { bar.setAttribute('data-ws-drop', ''); return; }
    more = doc().createElement('button'); more.type = 'button'; more.className = 'ws-more-btn'; more.setAttribute('aria-haspopup', 'menu'); more.setAttribute('aria-expanded', 'false');
    more.setAttribute('aria-label', label); more.title = label; more.textContent = glyph || (mode === 'compact' ? '☰' : '⋯');
    more.addEventListener('click', open); bar.append(more);
    if (mode === 'compact') { for (const n of list) n.hidden = true; return; }
    for (let i = list.length - 1; i > 0 && !fits(); i--) list[i].hidden = true;   // from the right; the first stays
  }
  return { run, destroy() { reset(); } };
}
