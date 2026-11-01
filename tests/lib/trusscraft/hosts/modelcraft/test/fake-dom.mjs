/* SPDX-License-Identifier: Apache-2.0 */
// A small stand-in for the browser's DOM, enough for the CabinetCraft panel: elements with children, attributes, events, simple selectors.
// Used by t-addon.mjs (the real page is tested by tools/addons-test/browser-cabinetcraft.mjs).
const matches = (el, sel) => {
  for (const one of sel.split(',').map((s) => s.trim())) {
    const m = one.match(/^([a-z0-9]*)((?:\[[^\]]+\]|\.[\w-]+)*)$/i);
    if (!m) continue;
    if (m[1] && el.tag !== m[1].toUpperCase()) continue;
    let ok = true;
    for (const a of (m[2] || '').match(/\[[^\]]+\]|\.[\w-]+/g) || []) {
      if (a[0] === '.') { if (!String(el.className).split(/\s+/).includes(a.slice(1))) ok = false; continue; }
      const [, k, v] = a.match(/^\[([^=\]]+)(?:="?([^"\]]*)"?)?\]$/);
      if (!el.attrs.has(k)) { ok = false; continue; }
      if (v !== undefined && el.attrs.get(k) !== v) ok = false;
    }
    if (ok) return true;
  }
  return false;
};
export class El {
  constructor(tag, doc) { this.tag = tag.toUpperCase(); this.ownerDocument = doc; this.children = []; this.attrs = new Map(); this.listeners = new Map(); this.parentElement = null; this.className = ''; this._text = ''; this.value = ''; this.checked = false; this.dataset = {}; this.nodeType = 1; this._html = null; }
  setAttribute(k, v) { this.attrs.set(k, String(v)); if (k === 'class') this.className = String(v); if (k === 'value') this.value = String(v); if (k === 'selected' && this.parentElement) this.parentElement.value = this.attrs.get('value'); if (k.startsWith('data-')) this.dataset[k.slice(5)] = String(v); }
  getAttribute(k) { return this.attrs.has(k) ? this.attrs.get(k) : null; }
  removeAttribute(k) { this.attrs.delete(k); }
  hasAttribute(k) { return this.attrs.has(k); }
  append(...kids) {
    for (const k of kids) {
      const n = typeof k === 'string' ? this.ownerDocument.createTextNode(k) : k;
      if (n.parentElement) n.parentElement.children = n.parentElement.children.filter((x) => x !== n);
      n.parentElement = this; this.children.push(n);
      if (this.tag === 'SELECT') this._pick();
    }
  }
  // a select's value is its selected option, else the first option (inside an optgroup too)
  _pick() {
    const opts = [...this.walk()].filter((e) => e.tag === 'OPTION');
    const chosen = opts.find((o) => o.attrs.has('selected')) || opts[0];
    if (chosen) this.value = chosen.value || chosen.attrs.get('value') || chosen.textContent;
  }
  replaceChildren(...kids) { for (const c of this.children) c.parentElement = null; this.children = []; this._html = null; this.append(...kids); }
  remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((x) => x !== this); this.parentElement = null; }
  addEventListener(t, fn) { if (!this.listeners.has(t)) this.listeners.set(t, []); this.listeners.get(t).push(fn); }
  dispatchEvent(ev) { ev.target ||= this; for (const fn of this.listeners.get(ev.type) || []) fn(ev); return true; }
  fire(type) { return this.dispatchEvent({ type, target: this }); }
  click() { if (this.attrs.has('disabled')) return; if (this.tag === 'INPUT' && this.attrs.get('type') === 'checkbox') { this.checked = !this.checked; return this.fire('change'); } this.fire('click'); if (this.tag === 'A' && this.download !== undefined) this.ownerDocument.downloads.push({ name: this.download, href: this.href }); }
  set textContent(v) { this.children = []; this._text = String(v); }
  get textContent() { return this._text + this.children.map((c) => c.textContent).join(''); }
  set innerHTML(v) { this.children = []; this._html = String(v); }
  get innerHTML() { return this._html ?? this.children.map((c) => c.outerHTML ?? c.textContent).join(''); }
  get firstChild() { return this.children[0] || null; }
  *walk() { for (const c of this.children) { if (c.nodeType === 1) { yield c; yield* c.walk(); } } }
  querySelectorAll(sel) {
    // comma lists and descendant selectors ("[data-a] [data-b]"); no child combinator
    const groups = sel.split(',').map((g) => g.trim().split(/\s+/));
    const hit = (e, parts) => {
      if (!matches(e, parts.at(-1))) return false;
      let up = e.parentElement, i = parts.length - 2;
      while (i >= 0) { while (up && !matches(up, parts[i])) up = up.parentElement; if (!up) return false; up = up.parentElement; i--; }
      return true;
    };
    return [...this.walk()].filter((e) => groups.some((g) => hit(e, g)));
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] || null; }
  closest() { return null; }
  get dataset_() { return this.dataset; }
  set hidden(v) { if (v) this.attrs.set('hidden', ''); else this.attrs.delete('hidden'); }
  get hidden() { return this.attrs.has('hidden'); }
  set disabled(v) { if (v) this.attrs.set('disabled', ''); else this.attrs.delete('disabled'); }
  get files() { return this._files || null; }
  get style() { return {}; }
}
class Text { constructor(t, doc) { this.nodeType = 3; this._t = String(t); this.ownerDocument = doc; this.parentElement = null; } get textContent() { return this._t; } get outerHTML() { return this._t; } remove() { if (this.parentElement) this.parentElement.children = this.parentElement.children.filter((x) => x !== this); } }
export function makeDocument() {
  const doc = { downloads: [], listeners: new Map() };
  doc.createElement = (tag) => { const e = new El(tag, doc); return e; };
  // SVG elements (the room's plan picker): a click's clientX / clientY are taken as drawing coordinates
  doc.createElementNS = (ns, tag) => { const e = new El(tag, doc); e.getScreenCTM = () => ({ inverse: () => ({}) }); e.createSVGPoint = () => ({ x: 0, y: 0, matrixTransform() { return { x: this.x, y: this.y }; } }); return e; };
  doc.createTextNode = (t) => new Text(t, doc);
  doc.body = new El('body', doc);
  doc.addEventListener = (t, fn) => { if (!doc.listeners.has(t)) doc.listeners.set(t, []); doc.listeners.get(t).push(fn); };
  doc.querySelector = (s) => doc.body.querySelector(s);
  doc.querySelectorAll = (s) => doc.body.querySelectorAll(s);
  return doc;
}
// `value` on a select follows the option marked selected; inputs keep what they were given
const origSet = El.prototype.setAttribute;
void origSet;
