/* SPDX-License-Identifier: Apache-2.0 */
/**
 * xml.js — a small, safe XML reader for files from other programs (0.8 XE.7). Not a DOM parser: it refuses a DOCTYPE and any ENTITY (so no
 * entity expansion and no external entities), limits size and depth, decodes only the five predefined entities and numeric references,
 * and drops namespace prefixes from names. Returns { name, attrs, children[], text } trees. Throws XmlError.
 */
export class XmlError extends Error {}
const MAX_BYTES = 50 * 1024 * 1024, MAX_DEPTH = 200, MAX_NODES = 2_000_000;
function decode(s) {
  if (s.indexOf('&') < 0) return s;
  return s.replace(/&(#x[0-9a-fA-F]{1,6}|#\d{1,7}|lt|gt|amp|quot|apos);/g, (m, e) => {
    if (e[0] === '#') { const cp = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); if (!(cp === 9 || cp === 10 || cp === 13 || (cp >= 32 && cp <= 0xd7ff) || (cp >= 0xe000 && cp <= 0xfffd) || (cp >= 0x10000 && cp <= 0x10ffff))) return ''; return String.fromCodePoint(cp); }
    return { lt: '<', gt: '>', amp: '&', quot: '"', apos: "'" }[e];
  });
}
const local = (n) => n.slice(n.indexOf(':') + 1);
export function parseXml(text) {
  if (typeof text !== 'string') throw new XmlError('Not text.');
  if (text.length > MAX_BYTES) throw new XmlError('The file is too large.');
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new XmlError('The file has a DOCTYPE or entity declaration. These are refused for safety.');
  const root = { name: '#root', attrs: {}, children: [], text: '', parts: [] }; const stack = [root]; let i = 0, nodes = 0; const n = text.length;
  while (i < n) {
    const lt = text.indexOf('<', i);
    const chunk = text.slice(i, lt < 0 ? n : lt);
    if (chunk) { const d = decode(chunk), t = stack[stack.length - 1]; t.text += d; t.parts.push(d); }
    if (lt < 0) break; i = lt;
    if (text.startsWith('<!--', i)) { const e = text.indexOf('-->', i + 4); if (e < 0) throw new XmlError('Unclosed comment.'); i = e + 3; continue; }
    if (text.startsWith('<![CDATA[', i)) { const e = text.indexOf(']]>', i + 9); if (e < 0) throw new XmlError('Unclosed CDATA.'); { const d = text.slice(i + 9, e), t = stack[stack.length - 1]; t.text += d; t.parts.push(d); } i = e + 3; continue; }
    if (text.startsWith('<?', i)) { const e = text.indexOf('?>', i + 2); if (e < 0) throw new XmlError('Unclosed declaration.'); i = e + 2; continue; }
    if (text.startsWith('</', i)) {
      const e = text.indexOf('>', i); if (e < 0) throw new XmlError('Unclosed tag.');
      const name = local(text.slice(i + 2, e).trim()); const top = stack.pop();
      if (!top || stack.length === 0 || top.name !== name) throw new XmlError('Mismatched closing tag </' + name.slice(0, 40) + '>.');
      i = e + 1; continue;
    }
    // start tag, attributes may contain '>' inside quotes
    let j = i + 1, q = null;
    for (; j < n; j++) { const c = text[j]; if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '>') break; }
    if (j >= n) throw new XmlError('Unclosed tag.');
    let inner = text.slice(i + 1, j); const selfClose = inner.endsWith('/'); if (selfClose) inner = inner.slice(0, -1);
    const m = /^([^\s/>]+)([\s\S]*)$/.exec(inner); if (!m) throw new XmlError('Empty tag.');
    const node = { name: local(m[1]), attrs: {}, children: [], text: '', parts: [] };
    const re = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g; let a, rest = m[2];
    while ((a = re.exec(rest))) { const k = a[1]; if (k.startsWith('xmlns')) continue; node.attrs[local(k)] = decode(a[3] ?? a[4] ?? ''); }
    if (++nodes > MAX_NODES) throw new XmlError('Too many elements.');
    stack[stack.length - 1].children.push(node); stack[stack.length - 1].parts.push(node);
    if (!selfClose) { stack.push(node); if (stack.length > MAX_DEPTH) throw new XmlError('Nested too deeply.'); }
    i = j + 1;
  }
  if (stack.length !== 1) throw new XmlError('A tag was not closed (<' + stack[stack.length - 1].name.slice(0, 40) + '>).');
  const top = root.children.filter((c) => c); if (top.length !== 1) throw new XmlError('A file has exactly one root element.');
  return top[0];
}
export const kids = (n, name) => (n ? n.children.filter((c) => c.name === name) : []);
export const kid = (n, name) => kids(n, name)[0] || null;
/** Visible text of an XHTML fragment: blocks and <br/> become line breaks. */
export function plainText(n) {
  const BLOCK = new Set(['div', 'p', 'br', 'li', 'tr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']);
  let out = '';
  const walk = (x) => { if (x.name === 'br') { out += '\n'; return; } for (const p of x.parts) { if (typeof p === 'string') out += p.replace(/\s+/g, ' '); else walk(p); } if (BLOCK.has(x.name) && !out.endsWith('\n')) out += '\n'; };
  walk(n); return out.replace(/[ \t]*\n[ \t]*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
