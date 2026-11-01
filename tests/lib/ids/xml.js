/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ids is a standalone library; its errors are English codes + words (an app translates what it shows). */
/**
 * xml.js — a small, non-validating XML 1.0 reader for cc-ids (IDS files are plain XML: elements, attributes, text, CDATA,
 * comments, processing instructions, character and the five predefined entity references). DOM-free and import-free, so
 * it runs in Node, a Worker and every browser the apps support. No DTDs are read (a <!DOCTYPE> is skipped; entities it
 * declares are not expanded — an IDS never needs them, and refusing them keeps "billion laughs" out).
 *
 *   parseXml(text) → root element  { name, local, prefix, attrs: { name: value }, children: [element], text }
 *     name   the tag as written ('xs:restriction'); local = the part after the prefix ('restriction'); prefix ('xs' or '')
 *     text   the element's own character data (CDATA included), not its children's; whitespace kept
 *   Errors throw XmlError { message, offset }.
 */

export class XmlError extends Error {
  constructor(message, offset) { super(message + (offset !== undefined ? ' (at character ' + offset + ')' : '')); this.name = 'XmlError'; this.offset = offset; }
}

const ENT = { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" };
const NAME = /[A-Za-z_:À-￿][-A-Za-z0-9_:.·À-￿]*/y;

function decode(s, at) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x[0-9A-Fa-f]+|#[0-9]+|[A-Za-z]+);|&/g, (m, e) => {
    if (!e) throw new XmlError('A bare "&" must be written &amp;', at);
    if (e[0] === '#') {
      const cp = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
      if (!(cp >= 1 && cp <= 0x10FFFF)) throw new XmlError('Bad character reference &' + e + ';', at);
      return String.fromCodePoint(cp);
    }
    if (!(e in ENT)) throw new XmlError('Unknown entity &' + e + ';', at);
    return ENT[e];
  });
}

function element(name) {
  const k = name.indexOf(':');
  return { name, local: k < 0 ? name : name.slice(k + 1), prefix: k < 0 ? '' : name.slice(0, k), attrs: {}, children: [], text: '' };
}

/** Text → the root element. */
export function parseXml(text) {
  let s = String(text ?? '');
  if (s.charCodeAt(0) === 0xFEFF) s = s.slice(1);
  const n = s.length;
  let i = 0, root = null;
  const stack = [];
  const name = () => {
    NAME.lastIndex = i;
    const m = NAME.exec(s);
    if (!m) throw new XmlError('A name was expected', i);
    i += m[0].length;
    return m[0];
  };
  const ws = () => { while (i < n && (s[i] === ' ' || s[i] === '\n' || s[i] === '\r' || s[i] === '\t')) i++; };
  while (i < n) {
    const lt = s.indexOf('<', i);
    const chunk = s.slice(i, lt < 0 ? n : lt);
    if (chunk) {
      if (stack.length) stack[stack.length - 1].text += decode(chunk, i);
      else if (chunk.trim()) throw new XmlError('Text outside the root element', i);
    }
    if (lt < 0) break;
    i = lt;
    if (s.startsWith('<!--', i)) { const e = s.indexOf('-->', i + 4); if (e < 0) throw new XmlError('A comment is not closed', i); i = e + 3; continue; }
    if (s.startsWith('<?', i)) { const e = s.indexOf('?>', i + 2); if (e < 0) throw new XmlError('A processing instruction is not closed', i); i = e + 2; continue; }
    if (s.startsWith('<![CDATA[', i)) {
      const e = s.indexOf(']]>', i + 9);
      if (e < 0) throw new XmlError('A CDATA section is not closed', i);
      if (!stack.length) throw new XmlError('CDATA outside the root element', i);
      stack[stack.length - 1].text += s.slice(i + 9, e);
      i = e + 3;
      continue;
    }
    if (s.startsWith('<!DOCTYPE', i)) {   // skipped, internal subset included; its entities are not used
      let depth = 0, j = i + 9;
      for (; j < n; j++) { if (s[j] === '[') depth++; else if (s[j] === ']') depth--; else if (s[j] === '>' && depth <= 0) break; }
      if (root || stack.length) throw new XmlError('A DOCTYPE must come before the root element', i);
      i = j + 1;
      continue;
    }
    if (s[i + 1] === '/') {
      i += 2;
      const nm = name();
      ws();
      if (s[i] !== '>') throw new XmlError('">" expected after </' + nm, i);
      i++;
      const open = stack.pop();
      if (!open || open.name !== nm) throw new XmlError('</' + nm + '> does not close <' + (open ? open.name : '') + '>', i);
      continue;
    }
    i++;
    const el = element(name());
    for (;;) {
      ws();
      if (s[i] === '>' || (s[i] === '/' && s[i + 1] === '>')) break;
      if (i >= n) throw new XmlError('The tag <' + el.name + '> is not closed', i);
      const an = name();
      ws();
      if (s[i] !== '=') throw new XmlError('"=" expected after the attribute ' + an, i);
      i++;
      ws();
      const q = s[i];
      if (q !== '"' && q !== "'") throw new XmlError('A quoted value expected for ' + an, i);
      const e = s.indexOf(q, i + 1);
      if (e < 0) throw new XmlError('The value of ' + an + ' is not closed', i);
      const raw = s.slice(i + 1, e);
      if (raw.indexOf('<') >= 0) throw new XmlError('"<" in the value of ' + an, i);
      if (an in el.attrs) throw new XmlError('The attribute ' + an + ' is given twice', i);
      // attribute value normalisation (XML 1.0 § 3.3.3): literal tabs and line ends become spaces, references stay as written
      el.attrs[an] = decode(raw.replace(/\r\n|[\t\n\r]/g, ' '), i);
      i = e + 1;
    }
    const selfClose = s[i] === '/';
    i += selfClose ? 2 : 1;
    if (stack.length) stack[stack.length - 1].children.push(el);
    else if (root) throw new XmlError('Only one root element is allowed', i);
    else root = el;
    if (!selfClose) stack.push(el);
  }
  if (stack.length) throw new XmlError('<' + stack[stack.length - 1].name + '> is not closed', n);
  if (!root) throw new XmlError('No root element', 0);
  return root;
}

/** The children of `el` with this local name (any namespace prefix). */
export const kids = (el, local) => (el ? el.children.filter((c) => c.local === local) : []);
/** The first child with this local name, or null. */
export const kid = (el, local) => (el ? el.children.find((c) => c.local === local) || null : null);
