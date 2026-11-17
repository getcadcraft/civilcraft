/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sheetlist.js: a windowed list of sheets, so a 2,000-sheet set puts a screenful of rows in the page instead of 14,000 nodes (0.10 PERF.35).
 * Canonical copy: lib/sheetlist/. MarkupCraft and TakeoffCraft each carry a byte-identical copy in <app>/dev/sheetlist.js
 * (`node tools/sheetlist/sync.mjs [--check] markupcraft takeoffcraft`; nobody edits a copy).
 *
 *   const win = new SheetWindow({ list: <ol>, renderRow: (entry, i) => <li>, estimate: (entry) => px, overscan: 400 })
 *   onDrop(li)                a row that is forgotten (scrolled well away, or the list was set again): release what it holds (observers)
 *   win.set(entries)          the rows, in order: [{ id, ... }] (id keeps a measured height across set() calls). Rows are drawn lazily.
 *   win.refresh()             draw the rows that are in view again (a row changed); win.invalidate() throws every drawn row away first
 *   win.reveal(i)             scroll the list's own scroller so row i shows (draws it); no page scroll unless nothing else scrolls
 *   win.rowEl(i)              the drawn <li> of row i, or null when it is outside the window
 *   win.drawn()               [{ i, entry, el }] of the rows in the page now
 *   win.destroy()
 *
 * How it works: the <ol> holds the rows in (and a little around) the view; its padding stands for the rows that are not drawn. A row's height is its estimate until it has been drawn once, then the measured one. The scroller is the nearest ancestor
 * that scrolls (the panel), else the window; a panel that is hidden (no height yet) draws the first 40 rows so nothing looks empty.
 * The list gets class "is-windowed": CSS makes it a block list with a margin under each row (the gap a grid gave before).
 * The rows that are not drawn are stood in for by the list's own padding-top and padding-bottom (no spacer elements: `ol > li` is only rows).
 */

const MIN_ROWS = 40;

export class SheetWindow {
  constructor({ list, renderRow, estimate = () => 80, overscan = 400, onDrop = null }) {
    this.list = list; this.renderRow = renderRow; this.onDrop = onDrop; this.estimate = estimate; this.overscan = overscan;
    this.entries = []; this.h = []; this.off = [0]; this.cache = new Map();   // index → <li> drawn
    this.heights = new Map();                                                  // entry id → measured px (with its margin)
    this.first = 0; this.last = -1; this.scroller = null; this.boundTo = null; this.raf = 0; this.gap = 0;
    this.onScroll = () => { if (!this.raf) this.raf = requestAnimationFrame(() => { this.raf = 0; this.draw(); }); };
    list.classList.add('is-windowed');
    list.replaceChildren();
    const RO = typeof ResizeObserver === 'function' ? ResizeObserver : null;
    this.ro = RO ? new RO(() => this.onScroll()) : null;
    this.ro?.observe(list);
  }

  forget(keep) {
    for (const [k, li] of [...this.cache]) if (!keep || !keep(k)) { this.cache.delete(k); this.onDrop?.(li); }
  }
  set(entries) {
    this.entries = entries;
    this.forget();
    this.layout();
    this.draw(true);
  }
  invalidate() { this.forget(); this.draw(true); }
  refresh() { this.draw(true); }
  layout() {
    const n = this.entries.length;
    this.h = new Array(n); this.off = new Array(n + 1); this.off[0] = 0;
    for (let i = 0; i < n; i++) {
      const e = this.entries[i];
      this.h[i] = (e.id !== undefined && this.heights.get(e.id)) || this.estimate(e);
      this.off[i + 1] = this.off[i] + this.h[i];
    }
  }
  /** The nearest ancestor that scrolls, else null (the window). */
  findScroller() {
    for (let q = this.list.parentElement; q && q !== document.body && q !== document.documentElement; q = q.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(q).overflowY) && q.clientHeight > 0) return q;
      if (q.tagName === 'ASIDE') return q;
    }
    return null;
  }
  bind() {
    const sc = this.findScroller(), target = sc || window;
    this.scroller = sc;
    if (target === this.boundTo) return;
    this.boundTo?.removeEventListener('scroll', this.onScroll);
    this.boundTo = target;
    target.addEventListener('scroll', this.onScroll, { passive: true });
    if (sc) this.ro?.observe(sc);
  }
  /** The range of the list, in its own pixels, that the scroller shows (with the overscan around it): [from, to] or null (not shown). */
  view() {
    this.bind();
    const r = this.list.getBoundingClientRect();
    let a, b;
    if (this.scroller) { const s = this.scroller.getBoundingClientRect(); if (!(s.height > 0)) return null; a = s.top - r.top; b = s.bottom - r.top; }
    else { a = -r.top; b = window.innerHeight - r.top; }
    return [a - this.overscan, b + this.overscan];
  }
  /** First row whose bottom is below `y`. */
  rowAt(y) {
    let lo = 0, hi = this.entries.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (this.off[mid + 1] <= y) lo = mid + 1; else hi = mid; }
    return lo;
  }
  draw(force = false) {
    const n = this.entries.length;
    let first, last;
    const v = n ? this.view() : null;
    if (!n) { first = 0; last = -1; }
    else if (!v) { first = 0; last = Math.min(n - 1, MIN_ROWS - 1); }
    else { first = this.rowAt(Math.max(0, v[0])); last = Math.min(n - 1, Math.max(first, this.rowAt(Math.max(0, v[1])))); }
    if (!force && first === this.first && last === this.last) return;
    this.first = first; this.last = last;
    const rows = [];
    for (let i = first; i <= last; i++) {
      let li = this.cache.get(i);
      if (!li) { li = this.renderRow(this.entries[i], i); this.cache.set(i, li); }
      rows.push(li);
    }
    // forget what scrolled out (the next visit draws it again, from the entry)
    this.forget((k) => k >= first - 80 && k <= last + 80);
    this.pad(first, last);
    this.list.replaceChildren(...rows);
    if (this.measure(first, last, rows)) { this.layout(); this.pad(first, last); }
  }
  pad(first, last) {
    const n = this.entries.length;
    this.list.style.paddingTop = (n ? this.off[first] : 0) + 'px';
    this.list.style.paddingBottom = (n ? this.off[n] - this.off[last + 1] : 0) + 'px';
  }
  /** Measured heights (with the margin under a row) replace the estimates; true when any changed by more than a pixel. */
  measure(first, last, rows) {
    let changed = false;
    rows.forEach((li, k) => {
      const e = this.entries[first + k];
      if (!e || e.id === undefined) return;
      const hh = li.offsetHeight;
      if (!hh) return;
      const cs = getComputedStyle(li);
      const px = hh + (parseFloat(cs.marginTop) || 0) + (parseFloat(cs.marginBottom) || 0);
      if (Math.abs(this.h[first + k] - px) > 1) changed = true;
      this.heights.set(e.id, px);
    });
    return changed;
  }
  rowEl(i) { return i >= this.first && i <= this.last ? this.cache.get(i) || null : null; }
  drawn() { const out = []; for (let i = this.first; i <= this.last; i++) { const el = this.cache.get(i); if (el) out.push({ i, entry: this.entries[i], el }); } return out; }
  /** Scroll the scroller so row i is inside it (the least movement), then draw. */
  reveal(i) {
    if (i < 0 || i >= this.entries.length) return;
    this.bind();
    // twice: the first pass uses estimated heights; drawing the rows measures them, and the second pass lands on the real place
    for (let pass = 0; pass < 2; pass++) {
      const a = this.off[i], b = this.off[i + 1];
      const r = this.list.getBoundingClientRect();
      if (this.scroller) {
        const s = this.scroller.getBoundingClientRect();
        const top = r.top - s.top + a, bot = r.top - s.top + b;       // the row, in the scroller's view
        if (top < 0) this.scroller.scrollTop += top; else if (bot > s.height) this.scroller.scrollTop += Math.min(bot - s.height, top);
      } else {
        const top = r.top + a, bot = r.top + b;
        if (top < 0) window.scrollBy(0, top); else if (bot > window.innerHeight) window.scrollBy(0, Math.min(bot - window.innerHeight, top));
      }
      this.draw(true);
    }
  }
  destroy() {
    this.boundTo?.removeEventListener('scroll', this.onScroll);
    this.ro?.disconnect();
    if (this.raf) cancelAnimationFrame(this.raf);
    this.list.classList.remove('is-windowed');
    this.list.style.paddingTop = this.list.style.paddingBottom = '';
  }
}
