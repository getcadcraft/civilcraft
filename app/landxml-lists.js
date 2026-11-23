/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words. */
/**
 * landxml-lists.js — the two big lists of a LandXML TIN (<Pnts> of <P> and <Faces> of <F>) read as a stream, without an element tree
 * (0.11 PERF.33 / PERF.20, perf-finish-11 lane civil). A 500,000-point TIN is 1.5 million elements: as a tree (xml.js) they cost seconds and
 * over a gigabyte; here they are read part by part with a carry, straight into what readLandXml keeps.
 *
 *   cutLists(text) → null | { rest, blocks, tag }
 *     text    a string or the parts of a big file (textin.js; an array of strings)
 *     rest    the file as parts (strings) with the body of every list it read cut out: `<Pnts>…</Pnts>` becomes `<Pnts ccfast="<tag>:<k>"></Pnts>`
 *             (the same for Faces), so the tree reader still sees every element, in its place, and asks for block k
 *     blocks  [{ kind: 'Pnts', ids: [id | undefined], pts: [{x,y,z}] } | { kind: 'Faces', hidden, faces: [a, b, c, …] (id strings) }]
 *     tag     a fresh random word: an attribute in the file itself cannot pass for a cut
 *
 * Only what the tree reader would read the same way is taken: a list written exactly as `<Pnts>` / `<Faces>` (no attributes, no prefix)
 * holding nothing but `<P …>text</P>` / `<F …>text</F>` elements and white space, with no entity (&), comment or CDATA inside. A list that
 * is not like that is left in the text for the tree reader; anything odd in the file (a list that does not end, an element longer than
 * 64 KB) gives null and the whole file goes to the tree reader as before. Comments, CDATA and processing instructions elsewhere are stepped
 * over, so a `<Pnts>` written inside one is never taken.
 *
 * What readLandXml does with an element, done here per element: P: v = the numbers of its text (split on white space and commas), kept when
 * there are 3 or more and all finite, as { x: v[1], y: v[0], z: v[2] } under its `id` attribute (the last `id` written wins, as in the tree);
 * F: `i="1"` counts as hidden, else the first three words of its text when it has three or more.
 */
const MAXEL = 65536;
const nums = (s) => { const t = String(s || '').trim(); return t ? t.split(/[\s,]+/).map(Number) : []; };
const localName = (n) => { const i = n.indexOf(':'); return i < 0 ? n : n.slice(i + 1); };
// one attribute: name = "value" | 'value' (no < or & in it: an entity would need decoding: such a list goes to the tree reader)
const ATTR = /\s+([^\s=/>]+)\s*=\s*(?:"([^"<&]*)"|'([^'<&]*)')/y;
const ELEM = { P: /\s*<P((?:\s+[^\s=/>]+\s*=\s*(?:"[^"<&]*"|'[^'<&]*'))*)\s*>([^<&]*)<\/P\s*>/y, F: /\s*<F((?:\s+[^\s=/>]+\s*=\s*(?:"[^"<&]*"|'[^'<&]*'))*)\s*>([^<&]*)<\/F\s*>/y };
const END = { Pnts: /\s*<\/Pnts\s*>/y, Faces: /\s*<\/Faces\s*>/y };

function attrsOf(s) {
  const out = Object.create(null);
  ATTR.lastIndex = 0;
  for (let m; ATTR.lastIndex < s.length && (m = ATTR.exec(s));) { const n = m[1]; if (!n.startsWith('xmlns')) out[localName(n)] = m[2] ?? m[3]; }
  return out;
}

export function cutLists(text) {
  const parts = typeof text === 'string' ? [text] : Array.isArray(text) ? text : Array.isArray(text?.parts) ? text.parts : null;
  if (!parts) return null;
  const tag = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const rest = [], blocks = [];
  let pi = 0, s = '', i = 0, last = '';   // s: the window; i: where reading is; last: the last non-space character before i outside a list
  const more = () => { while (pi < parts.length) { const p = parts[pi++]; if (p) { s = s.slice(i) + p; i = 0; return true; } } return false; };
  /** Read on until `str` is found at or after `from` (a position in s); -1 at the end of the file. What lies before `i` is passed on first. */
  const find = (str, from) => {
    for (;;) {
      const k = s.indexOf(str, from);
      if (k >= 0) return k;
      if (pi >= parts.length) return -1;
      from -= i; flushTo(i);
      const had = s.length;
      if (!more()) return -1;
      from = Math.max(0, Math.min(from, had - str.length + 1));
    }
  };
  let out = '';   // text of the window already passed (outside any list), not yet pushed to rest
  const flushTo = (k) => { if (k > 0) { out += s.slice(0, k); s = s.slice(k); i -= k; } if (out.length > 1 << 22) { rest.push(out); out = ''; } };

  for (;;) {
    const lt = s.indexOf('<', i);
    if (lt < 0) {
      for (let k = s.length - 1; k >= i; k--) if (!/\s/.test(s[k])) { last = s[k]; break; }
      i = s.length; flushTo(i);
      if (!more()) break;
      continue;
    }
    for (let k = lt - 1; k >= i; k--) if (!/\s/.test(s[k])) { last = s[k]; break; }
    // a token that may run past the window: read on enough to tell what it is
    if (s.length - lt < 16 && pi < parts.length) { i = lt; flushTo(i); more(); continue; }
    if (s.startsWith('<!--', lt)) { const e = find('-->', lt + 4); if (e < 0) return null; i = e + 3; last = '>'; continue; }
    if (s.startsWith('<![CDATA[', lt)) { const e = find(']]>', lt + 9); if (e < 0) return null; i = e + 3; last = '>'; continue; }
    if (s.startsWith('<?', lt) || s.startsWith('<!', lt)) { const e = find('>', lt + 2); if (e < 0) return null; i = e + 1; last = '>'; continue; }
    const kind = s.startsWith('<Pnts>', lt) ? 'Pnts' : s.startsWith('<Faces>', lt) ? 'Faces' : null;
    if (!kind || last !== '>') {
      // any other tag: step over it (to its '>'; attribute values hold no '>' that matters to finding the next '<')
      const e = find('>', lt + 1); if (e < 0) return null;
      i = e + 1; last = '>'; continue;
    }
    // a list: read its elements
    i = lt; flushTo(i);
    const open = kind.length + 2;   // '<Pnts>' / '<Faces>': s now starts with it
    const k = blocks.length, el = ELEM[kind === 'Pnts' ? 'P' : 'F'], end = END[kind];
    const b = kind === 'Pnts' ? { kind, ids: [], pts: [] } : { kind, hidden: 0, faces: [] };
    let j = open, ok = false, plain = true;
    for (;;) {
      end.lastIndex = j;
      const me = end.exec(s);
      if (me) { j = end.lastIndex; ok = true; break; }
      el.lastIndex = j;
      const m = el.exec(s);
      if (m) {
        j = el.lastIndex;
        const a = m[1] ? attrsOf(m[1]) : null, body = m[2].trim();
        if (kind === 'Pnts') {
          const v = nums(body);
          if (v.length < 3 || v.some((x) => !Number.isFinite(x))) continue;
          b.ids.push(a ? a.id : undefined); b.pts.push({ x: v[1], y: v[0], z: v[2] });
        } else {
          if (a && a.i === '1') { b.hidden++; continue; }
          const w = body.split(/\s+/);
          if (w.length < 3) continue;
          b.faces.push(w[0], w[1], w[2]);
        }
        continue;
      }
      // neither: the element may run past the window, or the list holds something else
      const left = s.length - j;
      if (pi < parts.length && (left < MAXEL || /^\s*$/.test(s.slice(j)))) { s = s.slice(j); j = 0; i = 0; if (!more()) return null; continue; }
      plain = false; break;
    }
    if (!plain) return null;   // not a plain list: the tree reader reads the whole file (the same result, the old cost)
    if (!ok) return null;
    blocks.push(b);
    out += '<' + kind + ' ccfast="' + tag + ':' + k + '"></' + kind + '>';
    s = s.slice(j); i = 0; last = '>';
  }
  if (out) rest.push(out);
  return blocks.length ? { rest, blocks, tag } : null;
}
