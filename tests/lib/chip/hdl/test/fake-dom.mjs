/* SPDX-License-Identifier: Apache-2.0 */
/** A very small stand-in DOM, enough to mount the chip panels in Node (elements, text, attributes, events, innerHTML kept as text). */
class Node_ {
  constructor(doc) { this.ownerDocument = doc; this.childNodes = []; this.parentNode = null; }
  get textContent() { return this.childNodes.map((c) => c.textContent).join(''); }
  set textContent(v) { this.childNodes = []; if (v !== '' && v !== null && v !== undefined) this.append(this.ownerDocument.createTextNode(String(v))); }
  append(...kids) { for (const k of kids) { const n = typeof k === 'string' ? this.ownerDocument.createTextNode(k) : k; n.parentNode = this; this.childNodes.push(n); } }
  replaceChildren(...kids) { this.childNodes = []; this._html = null; this.append(...kids); }
}
class Text_ extends Node_ { constructor(doc, t) { super(doc); this.data = t; } get textContent() { return this.data; } }
class Element_ extends Node_ {
  constructor(doc, tag) { super(doc); this.tagName = tag.toUpperCase(); this.attrs = {}; this.listeners = {}; this.style = {}; this.value = ''; this._html = null; this.disabled = false; this.selectionStart = 0; this.selectionEnd = 0; this.scrollTop = 0; }
  set className(v) { this.attrs.class = v; } get className() { return this.attrs.class || ''; }
  set id(v) { this.attrs.id = v; } get id() { return this.attrs.id || ''; }
  setAttribute(k, v) { this.attrs[k] = String(v); if (k === 'value') this.value = String(v); if (k === 'selected') this.selected = true; }
  getAttribute(k) { return k in this.attrs ? this.attrs[k] : null; }
  removeAttribute(k) { delete this.attrs[k]; }
  addEventListener(t, fn) { (this.listeners[t] ||= []).push(fn); }
  dispatchEvent(e) { try { if (!e.target) e.target = this; } catch { /* a real Event's target is read-only */ } for (const fn of this.listeners[e.type] || []) fn(e); return true; }
  click() { this.dispatchEvent({ type: 'click', preventDefault() {} }); }
  focus() { this.ownerDocument.activeElement = this; }
  setSelectionRange(a, b) { this.selectionStart = a; this.selectionEnd = b; }
  setRangeText(t, a, b) { this.value = this.value.slice(0, a) + t + this.value.slice(b); this.selectionStart = this.selectionEnd = a + t.length; }
  set innerHTML(v) { this.childNodes = []; this._html = String(v); }
  get innerHTML() { return this._html ?? ''; }
  get children() { return this.childNodes.filter((c) => c instanceof Element_); }
  closest() { return null; }
  getBoundingClientRect() { return { left: 0, top: 0, width: 800, height: 400 }; }
  all(pred, out = []) { for (const c of this.children) { if (pred(c)) out.push(c); c.all(pred, out); } return out; }
  querySelector(sel) {
    if (sel === 'svg' && this._html && this._html.includes('<svg')) { const fake = new Element_(this.ownerDocument, 'svg'); const m = /viewBox="([^"]+)"/.exec(this._html); if (m) fake.attrs.viewBox = m[1]; return fake; }
    for (const c of this.children) { if (c._html && sel === 'svg') { const r = c.querySelector(sel); if (r) return r; } }
    const tag = sel.toUpperCase(); return this.all((e) => e.tagName === tag)[0] || null;
  }
  querySelectorAll(sel) { const tag = sel.toUpperCase(); return this.all((e) => e.tagName === tag); }
}
// <select>.value follows the selected option, as in a browser
function selectValue(el) { const opts = el.children.filter((c) => c.tagName === 'OPTION'); const s = opts.find((o) => o.selected) || opts[0]; return s ? s.attrs.value ?? '' : ''; }
export function makeDocument() {
  const doc = {
    activeElement: null,
    createElement(tag) {
      const e = new Element_(doc, tag);
      if (tag === 'select') { let v = null; Object.defineProperty(e, 'value', { get: () => (e.children.some((o) => o.selected) || v === null || !e.children.some((o) => o.attrs.value === v) ? selectValue(e) : v), set: (x) => { v = String(x); for (const o of e.children) o.selected = o.attrs.value === v; } }); }
      return e;
    },
    createTextNode(t) { return new Text_(doc, t); },
    getElementById(id) { return doc.documentElement.all((e) => e.id === id)[0] || null; },
    defaultView: { prompt: () => doc._promptAnswer ?? null },
  };
  doc.documentElement = new Element_(doc, 'html');
  doc.head = new Element_(doc, 'head'); doc.documentElement.append(doc.head);
  doc.body = new Element_(doc, 'body'); doc.documentElement.append(doc.body);
  return doc;
}
globalThis.Event = globalThis.Event || class { constructor(type) { this.type = type; } };
