/* SPDX-License-Identifier: Apache-2.0 */
/**
 * xml.js — a small XML reader for the tools' report files (KLayout's .lyrdb) (0.9 HD.8). DOM-free, no imports; elements, attributes,
 * text and CDATA; comments, processing instructions and DOCTYPE skipped; the five named entities and numeric ones. Not validating.
 *   readXml(text) → root element { name, attrs, children: [element], text }      kids(el, name) · kid(el, name) · textOf(el, name)
 */

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const unesc = (s) => s.replace(/&(#x[0-9a-fA-F]+|#\d+|\w+);/g, (m, e) => (e[0] === '#' ? String.fromCodePoint(e[1] === 'x' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : ENT[e] ?? m));

export function readXml(text) {
  const s = String(text);
  const root = { name: '#document', attrs: {}, children: [], text: '' };
  const stack = [root];
  let i = 0;
  while (i < s.length) {
    const lt = s.indexOf('<', i);
    if (lt < 0) { stack[stack.length - 1].text += unesc(s.slice(i)); break; }
    if (lt > i) stack[stack.length - 1].text += unesc(s.slice(i, lt));
    if (s.startsWith('<!--', lt)) { const e = s.indexOf('-->', lt); i = e < 0 ? s.length : e + 3; continue; }
    if (s.startsWith('<![CDATA[', lt)) { const e = s.indexOf(']]>', lt); stack[stack.length - 1].text += s.slice(lt + 9, e < 0 ? s.length : e); i = e < 0 ? s.length : e + 3; continue; }
    if (s[lt + 1] === '?' || s[lt + 1] === '!') { const e = s.indexOf('>', lt); i = e < 0 ? s.length : e + 1; continue; }
    const gt = s.indexOf('>', lt);
    if (gt < 0) throw new Error('XML cut off');
    const body = s.slice(lt + 1, gt);
    i = gt + 1;
    if (body[0] === '/') {
      const name = body.slice(1).trim();
      while (stack.length > 1) { const top = stack.pop(); if (top.name === name) break; }
      continue;
    }
    const self = body.endsWith('/');
    const inner = self ? body.slice(0, -1) : body;
    const m = /^([^\s/>]+)/.exec(inner);
    if (!m) continue;
    const el = { name: m[1], attrs: {}, children: [], text: '' };
    const re = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g;
    let a;
    while ((a = re.exec(inner.slice(m[1].length)))) el.attrs[a[1]] = unesc(a[3] ?? a[4] ?? '');
    stack[stack.length - 1].children.push(el);
    if (!self) stack.push(el);
  }
  return root.children.find((c) => c.name) || root;
}

export const kids = (el, name) => (el ? el.children.filter((c) => c.name === name) : []);
export const kid = (el, name) => (el ? el.children.find((c) => c.name === name) || null : null);
export const textOf = (el, name) => { const k = kid(el, name); return k ? k.text.trim() : ''; };
