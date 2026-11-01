/* SPDX-License-Identifier: Apache-2.0 */
/** A small, safe XML reader (no DOM, no network): elements, attributes, text, CDATA, the five entities and numeric references. DOCTYPE and entity declarations are refused. Namespace prefixes are dropped. */
export const MAX_BYTES = 8 * 1024 * 1024, MAX_DEPTH = 200;

export function parseXml(src) {
  src = String(src); if (src.length > MAX_BYTES) throw new Error('XML is larger than ' + MAX_BYTES + ' bytes');
  if (/<!DOCTYPE|<!ENTITY/i.test(src)) throw new Error('DOCTYPE and entity declarations are refused');
  let i = 0; const n = src.length;
  const err = (m) => { const line = src.slice(0, i).split('\n').length; return new Error(m + ' (line ' + line + ')'); };
  const unesc = (s) => s.replace(/&(#x[0-9a-fA-F]+|#\d+|amp|lt|gt|quot|apos);/g, (m, e) => {
    if (e[0] === '#') { const c = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return c > 0 && c < 0x110000 ? String.fromCodePoint(c) : ''; }
    return { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[e];
  });
  const local = (name) => name.slice(name.indexOf(':') + 1);
  const skipMisc = () => {
    for (;;) {
      while (i < n && /\s/.test(src[i])) i++;
      if (src.startsWith('<?', i)) { const e = src.indexOf('?>', i); if (e < 0) throw err('Unclosed <?'); i = e + 2; }
      else if (src.startsWith('<!--', i)) { const e = src.indexOf('-->', i); if (e < 0) throw err('Unclosed comment'); i = e + 3; }
      else return;
    }
  };
  const element = (depth) => {
    if (depth > MAX_DEPTH) throw err('Nested deeper than ' + MAX_DEPTH);
    if (src[i] !== '<') throw err('Expected an element');
    i++; let j = i; while (j < n && /[^\s/>]/.test(src[j])) j++;
    const el = { name: local(src.slice(i, j)), attrs: {}, children: [], text: '' }; i = j;
    for (;;) {
      while (i < n && /\s/.test(src[i])) i++;
      if (src[i] === '/' && src[i + 1] === '>') { i += 2; return el; }
      if (src[i] === '>') { i++; break; }
      if (i >= n) throw err('Unexpected end inside a tag');
      let k = i; while (k < n && /[^\s=/>]/.test(src[k])) k++;
      const an = src.slice(i, k); if (!an) throw err('Bad attribute'); i = k;
      while (/\s/.test(src[i])) i++;
      if (src[i] !== '=') throw err('Attribute ' + an + ' has no value'); i++;
      while (/\s/.test(src[i])) i++;
      const q = src[i]; if (q !== '"' && q !== "'") throw err('Attribute value must be quoted'); const e = src.indexOf(q, i + 1); if (e < 0) throw err('Unclosed attribute value');
      if (!an.startsWith('xmlns')) el.attrs[local(an)] = unesc(src.slice(i + 1, e)); i = e + 1;
    }
    for (;;) {
      const lt = src.indexOf('<', i); if (lt < 0) throw err('Element ' + el.name + ' is never closed');
      el.text += unesc(src.slice(i, lt)); i = lt;
      if (src.startsWith('</', i)) { const e = src.indexOf('>', i); if (local(src.slice(i + 2, e).trim()) !== el.name) throw err('Closing tag does not match ' + el.name); i = e + 1; return el; }
      if (src.startsWith('<!--', i)) { const e = src.indexOf('-->', i); if (e < 0) throw err('Unclosed comment'); i = e + 3; continue; }
      if (src.startsWith('<![CDATA[', i)) { const e = src.indexOf(']]>', i); if (e < 0) throw err('Unclosed CDATA'); el.text += src.slice(i + 9, e); i = e + 3; continue; }
      if (src.startsWith('<?', i)) { const e = src.indexOf('?>', i); if (e < 0) throw err('Unclosed <?'); i = e + 2; continue; }
      el.children.push(element(depth + 1));
    }
  };
  skipMisc(); const root = element(0); skipMisc();
  if (i < n) throw err('Text after the root element');
  return root;
}
export const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const kids = (el, name) => el.children.filter((c) => c.name === name);
export const kid = (el, name) => el.children.find((c) => c.name === name) || null;
