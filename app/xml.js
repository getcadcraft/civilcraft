/* SPDX-License-Identifier: Apache-2.0 */
/**
 * xml.js — a small XML reader and writer for LandXML. No DOM (runs in Node for the tests).
 *
 *   parseXml(text) → root element { name, attrs: {}, children: [elements], text }   (throws XmlError)
 *     Namespace prefixes are dropped from element names (LandXML files use a default namespace).
 *     Comments, processing instructions, DOCTYPE and CDATA are handled; DTDs/entities other than the
 *     five predefined and numeric character references are not expanded (no external fetches).
 *   kids(el, name) / kid(el, name) / textOf(el)
 *   esc(s)   escapes text/attribute values (and drops characters XML cannot hold)
 */

import { t } from "./i18n.js";
import { isParts, partsOf } from "./textin.js";

export class XmlError extends Error {}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (m, e) => {
    if (e[0] === '#') { const cp = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); try { return String.fromCodePoint(cp); } catch { return ''; } }
    return ENT[e] ?? m;
  });
}
const local = (n) => { const i = n.indexOf(':'); return i < 0 ? n : n.slice(i + 1); };

export function parseXml(text, { maxDepth = 256 } = {}) {
  // 0.10 PERF.20: `text` is a string or the parts of a big file (textin.js): the parser holds a window of the text (the part it is in
  // and what it needs next), never the whole file as one string. A string is one part, parsed as it always was.
  const parts = typeof text === 'string' ? [text] : isParts(text) ? partsOf(text) : [String(text)];
  let pi = 1;
  let s = parts.length ? parts[0] : '';
  const canMore = () => { while (pi < parts.length && !parts[pi]) pi++; return pi < parts.length; };
  const more = () => { if (!canMore()) return false; s += parts[pi++]; return true; };
  /** indexOf that reads on into the next parts until the text is found or the file ends. */
  const idx = (str, from) => {
    for (;;) {
      const k = s.indexOf(str, from);
      if (k >= 0) return k;
      const had = s.length;
      if (!more()) return -1;
      from = Math.max(from, had - str.length + 1);
    }
  };
  // startsWith that reads on only when what is left of the part is the start of `str` (a token cut by the part's end)
  const has = (str, at) => { if (s.startsWith(str, at)) return true; if (s.length - at < str.length && str.startsWith(s.slice(at)) && more()) return s.startsWith(str, at); return false; };
  const NEED = Symbol('need more text');
  let i = 0;
  const root = { name: '#doc', attrs: {}, children: [], text: '' };
  const stack = [root];

  /** A start tag at `lt`: { el, j, open }, or NEED when the part ends inside it and another follows (it is parsed again with more text). */
  function startTag(lt) {
    const n = s.length;
    let j = lt + 1;
    while (j < n && !/[\s/>]/.test(s[j])) j++;
    if (j >= n && canMore()) return NEED;
    const el = { name: local(s.slice(lt + 1, j)), attrs: Object.create(null), children: [], text: '' };
    if (!el.name) throw new XmlError(t('xml.err.empty'));
    for (;;) {
      while (j < n && /\s/.test(s[j])) j++;
      if (j >= n) { if (canMore()) return NEED; throw new XmlError(t('xml.err.tag', { tag: '<' + el.name + '>' })); }
      if (s[j] === '>') return { el, j: j + 1, open: true };
      if (s[j] === '/') { if (j + 1 >= n && canMore()) return NEED; if (s[j + 1] === '>') return { el, j: j + 2, open: false }; }
      let k = j;
      while (k < n && !/[\s=/>]/.test(s[k])) k++;
      const an = s.slice(j, k);
      while (k < n && /\s/.test(s[k])) k++;
      if (k >= n && canMore()) return NEED;
      if (s[k] !== '=') throw new XmlError(t('xml.err.novalue', { tag: '<' + el.name + '>' }));
      k++;
      while (k < n && /\s/.test(s[k])) k++;
      if (k >= n && canMore()) return NEED;
      const q = s[k];
      if (q !== '"' && q !== "'") throw new XmlError(t('xml.err.unquoted', { tag: '<' + el.name + '>' }));
      const e = s.indexOf(q, k + 1);
      if (e < 0) { if (canMore()) return NEED; throw new XmlError(t('xml.err.attr', { tag: '<' + el.name + '>' })); }
      if (!an.startsWith('xmlns')) el.attrs[local(an)] = decode(s.slice(k + 1, e));
      j = e + 1;
    }
  }

  /** At a token boundary with the part used up: the next part becomes the window (the part itself, no copy). */
  const nextWindow = () => { if (!canMore()) return false; s = parts[pi++]; i = 0; return true; };
  for (;;) {
    if (i >= s.length) { if (!nextWindow()) break; continue; }
    const top = stack[stack.length - 1];
    let lt = s.indexOf('<', i);
    if (lt < 0) {
      if (!canMore()) { appendText(top, s.slice(i)); break; }
      const tail = s.slice(i);
      // text with no tag left in this part: when it holds no entity it is added as it is (what follows is the same node's text)
      // and the next part is the window; else the next part is joined on so the entity is whole
      if (tail.indexOf('&') < 0) { appendText(top, tail); nextWindow(); continue; }
      lt = idx('<', i);
      if (lt < 0) { appendText(top, s.slice(i)); break; }
    }
    if (lt > i) appendText(top, s.slice(i, lt));
    if (has('<!--', lt)) { const e = idx('-->', lt + 4); if (e < 0) throw new XmlError(t('xml.err.comment')); i = e + 3; continue; }
    if (has('<![CDATA[', lt)) { const e = idx(']]>', lt + 9); if (e < 0) throw new XmlError(t('xml.err.cdata')); top.text += s.slice(lt + 9, e); i = e + 3; continue; }
    if (has('<?', lt)) { const e = idx('?>', lt + 2); if (e < 0) throw new XmlError(t('xml.err.pi')); i = e + 2; continue; }
    if (has('<!', lt)) {
      // DOCTYPE (possibly with an internal subset in [ ])
      let j = lt + 2, depth = 0;
      for (;; j++) { if (j >= s.length && !more()) break; const c = s[j]; if (c === '[') depth++; else if (c === ']') depth--; else if (c === '>' && depth <= 0) break; }
      i = j + 1; continue;
    }
    if (s[lt + 1] === undefined && more()) { i = lt; continue; }
    if (s[lt + 1] === '/') {
      const e = idx('>', lt);
      if (e < 0) throw new XmlError(t('xml.err.endtag'));
      const name = local(s.slice(lt + 2, e).trim());
      const el = stack.pop();
      if (!el || el === root || el.name !== name) throw new XmlError(el && el !== root ? t('xml.err.mismatch.open', { tag: '</' + name + '>', open: '<' + el.name + '>' }) : t('xml.err.mismatch', { tag: '</' + name + '>' }));
      i = e + 1; continue;
    }
    // start tag
    let r = startTag(lt);
    while (r === NEED) { more(); r = startTag(lt); }
    top.children.push(r.el);
    if (r.open) { stack.push(r.el); if (stack.length > maxDepth) throw new XmlError(t('xml.err.deep')); }
    i = r.j;
  }
  if (stack.length !== 1) throw new XmlError(t('xml.err.ends', { tag: '<' + stack[stack.length - 1].name + '>' }));
  const docEl = root.children[0];
  if (!docEl) throw new XmlError(t('xml.err.none'));
  return docEl;
}
function appendText(el, t) { if (el.name !== '#doc') el.text += decode(t); }

export const kids = (el, name) => (el ? el.children.filter((c) => c.name === name) : []);
export const kid = (el, name) => (el ? el.children.find((c) => c.name === name) || null : null);
export const textOf = (el) => (el ? el.text.trim() : '');

// eslint-disable-next-line no-control-regex
const BAD = /[\u0000-\u0008\u000b\u000c\u000e-\u001f￾￿]/g;
export const esc = (s) => String(s ?? '').replace(BAD, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
