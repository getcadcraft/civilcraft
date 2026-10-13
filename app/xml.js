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
  const s = String(text);
  let i = 0;
  const root = { name: '#doc', attrs: {}, children: [], text: '' };
  const stack = [root];
  const n = s.length;
  while (i < n) {
    const lt = s.indexOf('<', i);
    const top = stack[stack.length - 1];
    if (lt < 0) { appendText(top, s.slice(i)); break; }
    if (lt > i) appendText(top, s.slice(i, lt));
    if (s.startsWith('<!--', lt)) { const e = s.indexOf('-->', lt + 4); if (e < 0) throw new XmlError(t('xml.err.comment')); i = e + 3; continue; }
    if (s.startsWith('<![CDATA[', lt)) { const e = s.indexOf(']]>', lt + 9); if (e < 0) throw new XmlError(t('xml.err.cdata')); top.text += s.slice(lt + 9, e); i = e + 3; continue; }
    if (s.startsWith('<?', lt)) { const e = s.indexOf('?>', lt + 2); if (e < 0) throw new XmlError(t('xml.err.pi')); i = e + 2; continue; }
    if (s.startsWith('<!', lt)) {
      // DOCTYPE (possibly with an internal subset in [ ])
      let j = lt + 2, depth = 0;
      for (; j < n; j++) { const c = s[j]; if (c === '[') depth++; else if (c === ']') depth--; else if (c === '>' && depth <= 0) break; }
      i = j + 1; continue;
    }
    if (s[lt + 1] === '/') {
      const e = s.indexOf('>', lt);
      if (e < 0) throw new XmlError(t('xml.err.endtag'));
      const name = local(s.slice(lt + 2, e).trim());
      const el = stack.pop();
      if (!el || el === root || el.name !== name) throw new XmlError(el && el !== root ? t('xml.err.mismatch.open', { tag: '</' + name + '>', open: '<' + el.name + '>' }) : t('xml.err.mismatch', { tag: '</' + name + '>' }));
      i = e + 1; continue;
    }
    // start tag
    let j = lt + 1;
    while (j < n && !/[\s/>]/.test(s[j])) j++;
    const el = { name: local(s.slice(lt + 1, j)), attrs: Object.create(null), children: [], text: '' };
    if (!el.name) throw new XmlError(t('xml.err.empty'));
    for (;;) {
      while (j < n && /\s/.test(s[j])) j++;
      if (j >= n) throw new XmlError(t('xml.err.tag', { tag: '<' + el.name + '>' }));
      if (s[j] === '>') { j++; top.children.push(el); stack.push(el); if (stack.length > maxDepth) throw new XmlError(t('xml.err.deep')); break; }
      if (s[j] === '/' && s[j + 1] === '>') { j += 2; top.children.push(el); break; }
      let k = j;
      while (k < n && !/[\s=/>]/.test(s[k])) k++;
      const an = s.slice(j, k);
      while (k < n && /\s/.test(s[k])) k++;
      if (s[k] !== '=') throw new XmlError(t('xml.err.novalue', { tag: '<' + el.name + '>' }));
      k++;
      while (k < n && /\s/.test(s[k])) k++;
      const q = s[k];
      if (q !== '"' && q !== "'") throw new XmlError(t('xml.err.unquoted', { tag: '<' + el.name + '>' }));
      const e = s.indexOf(q, k + 1);
      if (e < 0) throw new XmlError(t('xml.err.attr', { tag: '<' + el.name + '>' }));
      if (!an.startsWith('xmlns')) el.attrs[local(an)] = decode(s.slice(k + 1, e));
      j = e + 1;
    }
    i = j;
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
