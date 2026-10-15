/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tab-check.mjs — the in-page check of 0.5 VP.5, shared by browser-tabs-sweep.mjs (the sweep) and browser-draw.mjs (its
 * guard): run it with `page.evaluate(pageCheck)`; → a list of problems ([] = none).
 */
/** In the page: every check for one combination → a list of problems ('' = none). */
export function pageCheck() {
  const vw = window.innerWidth, vh = window.innerHeight;
  const desc = (el) => {
    if (!el) return 'nothing';
    if (el.closest('.shell-float')) return 'a floating panel (app-panels.js default place)';
    const c = el.closest('[class]');
    return (el.tagName.toLowerCase() + (c ? '.' + [...c.classList].slice(0, 2).join('.') : '')).slice(0, 60);
  };
  const out = [];
  const hit = (el, what) => {
    el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });   // the page has smooth scrolling; the phone layout scrolls
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) { out.push(`${what}: has no size`); return null; }
    const x = r.left + Math.min(r.width / 2, 12), y = r.top + r.height / 2;
    if (x < 0 || y < 0 || x > vw || y > vh) { out.push(`${what}: outside the window`); return r; }
    const at = document.elementFromPoint(x, y);
    if (!at || !(at === el || el.contains(at))) out.push(`${what}: covered by ${desc(at)}`);
    return r;
  };
  const tabs = [...document.querySelectorAll('[data-tabs] .cc-tab')];
  if (!tabs.length) out.push('no tabs');
  const strip = document.querySelector('.cc-tabs');
  for (const [i, tb] of tabs.entries()) {
    const r = hit(tb, i === 0 ? 'first tab' : i === tabs.length - 1 ? 'last tab' : 'a middle tab');
    const lr = tb.parentElement.getBoundingClientRect();
    if (r && (r.left + 2 < lr.left - 1 || r.right - 2 > lr.right + 1)) out.push('a tab sticks out of its strip');
  }
  hit(document.querySelector('.cc-tab-add'), 'the + (new sheet) button');
  const overlaps = (a, b) => a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1;
  const input = document.querySelector('[data-cmd-input]');
  const status = document.querySelector('.cc-status');
  const row = document.querySelector('.cc-keyrow');
  {   // every rect read at one scroll position
    const stR = strip.getBoundingClientRect();
    if (overlaps(document.querySelector('.cc-cmd').getBoundingClientRect(), stR)) out.push('the tab strip overlaps the command line');
    if (overlaps(status.getBoundingClientRect(), stR)) out.push('the tab strip overlaps the status bar');
    if (row && !row.hidden && overlaps(row.getBoundingClientRect(), stR)) out.push('the touch key row overlaps the tab strip');
  }
  hit(input, 'the command line input');
  for (const b of status.querySelectorAll('.cc-toggle, .cc-snapkinds summary')) {
    if (b.offsetParent === null) continue;
    hit(b, 'a status-bar button');
  }
  if (row && !row.hidden) hit(row.querySelector('.is-enter'), 'the key row Enter');
  return [...new Set(out)];
}

