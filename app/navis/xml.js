// SPDX-License-Identifier: Apache-2.0
/**
 * xml.js — a small, strict XML reader for BCF files (untrusted input). Elements, attributes, text, CDATA, the five entities and numeric references.
 * A DOCTYPE or ENTITY declaration is refused (no entity expansion, nothing is fetched); depth, node count and size are capped.
 *   parseXml(text) → { tag, attrs, text, children }      find(node, tag) · all(node, tag) · textOf(node, tag) · esc(s)
 */
export const XML_LIMITS = { bytes: 8 * 1024 * 1024, depth: 64, nodes: 200000 };
const bad = (code) => Object.assign(new Error('navis.xml.' + code), { code });

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
const dec = s => s.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-z]+);/g, (m, e) => {
  if (e[0] === '#') { const n = e[1] === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n < 0x110000 && !(n >= 0xd800 && n < 0xe000) ? String.fromCodePoint(n) : ''; }
  return ENT[e] ?? m;
});

export function parseXml(input) {
  let s = String(input ?? '');
  if (s.length > XML_LIMITS.bytes) throw bad('toolarge');
  if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);
  if (/<!DOCTYPE|<!ENTITY/i.test(s)) throw bad('doctype');
  const root = { tag: '#root', attrs: {}, text: '', children: [] }; const stack = [root]; let i = 0, nodes = 0;
  while (i < s.length) {
    const lt = s.indexOf('<', i);
    const top = stack[stack.length - 1];
    if (lt < 0) { top.text += dec(s.slice(i)); break; }
    if (lt > i) top.text += dec(s.slice(i, lt));
    if (s.startsWith('<!--', lt)) { const e = s.indexOf('-->', lt + 4); if (e < 0) throw bad('broken'); i = e + 3; continue; }
    if (s.startsWith('<![CDATA[', lt)) { const e = s.indexOf(']]>', lt); if (e < 0) throw bad('broken'); top.text += s.slice(lt + 9, e); i = e + 3; continue; }
    if (s.startsWith('<?', lt)) { const e = s.indexOf('?>', lt); if (e < 0) throw bad('broken'); i = e + 2; continue; }
    const gt = (() => { let q = null; for (let k = lt + 1; k < s.length; k++) { const c = s[k]; if (q) { if (c === q) q = null; } else if (c === '"' || c === "'") q = c; else if (c === '>') return k; } return -1; })();
    if (gt < 0) throw bad('broken');
    const inner = s.slice(lt + 1, gt);
    if (inner[0] === '/') { const name = inner.slice(1).trim().replace(/^[^:]+:/, ''); if (stack.length < 2 || stack[stack.length - 1].tag !== name) throw bad('mismatch'); stack.pop(); i = gt + 1; continue; }
    const self = inner.endsWith('/'); const body = self ? inner.slice(0, -1) : inner;
    const m = /^([^\s/>]+)([\s\S]*)$/.exec(body); if (!m) throw bad('broken');
    const node = { tag: m[1].replace(/^[^:]+:/, ''), attrs: {}, text: '', children: [] };
    const re = /([^\s=]+)\s*=\s*("([^"]*)"|'([^']*)')/g; let a;
    while ((a = re.exec(m[2]))) { const k = a[1].replace(/^[^:]+:/, ''); if (!k.startsWith('xmlns')) node.attrs[k] = dec(a[3] ?? a[4] ?? ''); }
    if (++nodes > XML_LIMITS.nodes) throw bad('toomany');
    top.children.push(node);
    if (!self) { stack.push(node); if (stack.length > XML_LIMITS.depth) throw bad('toodeep'); }
    i = gt + 1;
  }
  if (stack.length !== 1) throw bad('unclosed');
  return root.children[0] || root;
}
export const find = (n, tag) => (n ? n.children.find(c => c.tag === tag) || null : null);
export const all = (n, tag) => (n ? n.children.filter(c => c.tag === tag) : []);
export const textOf = (n, tag) => { const c = find(n, tag); return c ? c.text.trim() : ''; };
export const esc = s => String(s ?? '').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
