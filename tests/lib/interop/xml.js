/* SPDX-License-Identifier: Apache-2.0 */
/**
 * xml.js — a small, safe XML reader and writer for exchange files (DEXPI ProteusXML). DOM-free, import-free.
 * The file is untrusted: no DOCTYPE / entity declarations (no expansion, no external fetch), only the five predefined
 * entities and numeric references, bounded size / depth / node count. Text between tags is kept only where an element has
 * no child elements (the formats here are attribute-driven).
 *
 *   parseXml(text, {maxBytes, maxDepth, maxNodes}) → { tag, attrs, children, text }       throws XmlError {code, message, at}
 *   find(node, tag) · all(node, tag) · attr(node, name, dflt) · walk(node, fn)
 *   esc(s) · attrs(obj) · XmlWriter: open(tag, attrs, selfClose) · close() · leaf(tag, attrs) · toString()
 */

export class XmlError extends Error { constructor(code, message, at = 0) { super(message); this.code = code; this.at = at; } }
export const LIMITS = { bytes: 64 * 1024 * 1024, depth: 200, nodes: 2_000_000 };

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function unescape(s, at) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, (m, g) => {
    if (g[0] === '#') {
      const cp = g[1] === 'x' ? parseInt(g.slice(2), 16) : parseInt(g.slice(1), 10);
      if (!(cp >= 0x20 || cp === 9 || cp === 10 || cp === 13) || cp > 0x10ffff || (cp >= 0xd800 && cp < 0xe000)) throw new XmlError('bad_ref', 'A character reference outside the allowed range', at);
      return String.fromCodePoint(cp);
    }
    if (g in ENT) return ENT[g];
    throw new XmlError('entity', 'The entity &' + g + '; is not declared (entity declarations are not supported)', at);
  });
}

export function parseXml(input, opt = {}) {
  const maxDepth = opt.maxDepth ?? LIMITS.depth, maxNodes = opt.maxNodes ?? LIMITS.nodes;
  let s = typeof input === 'string' ? input : new TextDecoder('utf-8').decode(input);
  if ((opt.maxBytes ?? LIMITS.bytes) < s.length) throw new XmlError('too_big', 'The file is larger than the reader accepts');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  let i = 0;
  const n = s.length;
  const root = { tag: '#root', attrs: {}, children: [], text: '' };
  const stack = [root];
  let nodes = 0;
  const skipWs = () => { while (i < n && /\s/.test(s[i])) i++; };
  while (i < n) {
    const lt = s.indexOf('<', i);
    const cur = stack[stack.length - 1];
    if (lt < 0) { if (s.slice(i).trim()) throw new XmlError('syntax', 'Text after the last element', i); break; }
    if (lt > i) {
      const txt = s.slice(i, lt);
      if (txt.trim()) { if (stack.length === 1) throw new XmlError('syntax', 'Text outside the root element', i); cur.text += unescape(txt, i); }
    }
    i = lt;
    if (s.startsWith('<!--', i)) { const e = s.indexOf('-->', i + 4); if (e < 0) throw new XmlError('syntax', 'A comment is not closed', i); i = e + 3; continue; }
    if (s.startsWith('<![CDATA[', i)) { const e = s.indexOf(']]>', i + 9); if (e < 0) throw new XmlError('syntax', 'A CDATA section is not closed', i); cur.text += s.slice(i + 9, e); i = e + 3; continue; }
    if (s.startsWith('<?', i)) { const e = s.indexOf('?>', i + 2); if (e < 0) throw new XmlError('syntax', 'A processing instruction is not closed', i); i = e + 2; continue; }
    if (s.startsWith('<!', i)) throw new XmlError('doctype', 'A DOCTYPE or entity declaration is not accepted', i);
    if (s[i + 1] === '/') {
      const e = s.indexOf('>', i);
      if (e < 0) throw new XmlError('syntax', 'A closing tag is not finished', i);
      const name = s.slice(i + 2, e).trim();
      if (stack.length < 2 || stack[stack.length - 1].tag !== name) throw new XmlError('mismatch', 'The closing tag </' + name + '> does not match', i);
      stack.pop(); i = e + 1; continue;
    }
    // open tag
    i++;
    const m = /^[A-Za-z_][\w.:-]*/.exec(s.slice(i, i + 200));
    if (!m) throw new XmlError('syntax', 'An element name is expected', i);
    const node = { tag: m[0], attrs: {}, children: [], text: '' };
    i += m[0].length;
    for (;;) {
      skipWs();
      if (s[i] === '/' && s[i + 1] === '>') { i += 2; node.self = true; break; }
      if (s[i] === '>') { i++; break; }
      const a = /^[A-Za-z_][\w.:-]*/.exec(s.slice(i, i + 200));
      if (!a) throw new XmlError('syntax', 'An attribute name is expected in <' + node.tag + '>', i);
      i += a[0].length; skipWs();
      if (s[i] !== '=') throw new XmlError('syntax', 'The attribute ' + a[0] + ' has no value', i);
      i++; skipWs();
      const q = s[i];
      if (q !== '"' && q !== "'") throw new XmlError('syntax', 'The attribute ' + a[0] + ' value is not quoted', i);
      const e = s.indexOf(q, i + 1);
      if (e < 0) throw new XmlError('syntax', 'An attribute value is not closed', i);
      if (Object.prototype.hasOwnProperty.call(node.attrs, a[0])) throw new XmlError('dup_attr', 'The attribute ' + a[0] + ' is given twice in <' + node.tag + '>', i);
      node.attrs[a[0]] = unescape(s.slice(i + 1, e), i);
      i = e + 1;
    }
    if (++nodes > maxNodes) throw new XmlError('too_many', 'The file has more elements than the reader accepts');
    cur.children.push(node);
    if (!node.self) { stack.push(node); if (stack.length > maxDepth) throw new XmlError('too_deep', 'Elements are nested deeper than the reader accepts', i); }
  }
  if (stack.length !== 1) throw new XmlError('unclosed', 'The element <' + stack[stack.length - 1].tag + '> is not closed');
  if (root.children.length !== 1) throw new XmlError('syntax', root.children.length ? 'More than one root element' : 'There is no element in the file');
  return root.children[0];
}

export const find = (node, tag) => (node ? node.children.find((c) => c.tag === tag) || null : null);
export const all = (node, tag) => (node ? node.children.filter((c) => c.tag === tag) : []);
export const attr = (node, name, dflt = '') => (node && Object.prototype.hasOwnProperty.call(node.attrs, name) ? node.attrs[name] : dflt);
export function walk(node, fn, depth = 0) { fn(node, depth); for (const c of node.children) walk(c, fn, depth + 1); }

// ---------------------------------------------------------------------------------------------------- writing
export const esc = (s) => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const attrs = (o) => Object.keys(o).filter((k) => o[k] !== undefined && o[k] !== null).map((k) => ' ' + k + '="' + esc(o[k]) + '"').join('');

export class XmlWriter {
  constructor(indent = '  ') { this.out = ['<?xml version="1.0" encoding="UTF-8"?>\n']; this.stack = []; this.ind = indent; }
  open(tag, a = {}, selfClose = false) {
    this.out.push(this.ind.repeat(this.stack.length) + '<' + tag + attrs(a) + (selfClose ? ' />' : '>') + '\n');
    if (!selfClose) this.stack.push(tag);
    return this;
  }
  close() { const t = this.stack.pop(); this.out.push(this.ind.repeat(this.stack.length) + '</' + t + '>\n'); return this; }
  leaf(tag, a = {}) { return this.open(tag, a, true); }
  toString() { while (this.stack.length) this.close(); return this.out.join(''); }
}
