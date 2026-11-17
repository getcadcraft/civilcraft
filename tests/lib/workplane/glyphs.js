// SPDX-License-Identifier: Apache-2.0
/* i18n-ignore-file — font table names and errors for developers; nothing here is read by a person. */
/**
 * glyphs.js — letter outlines from a TrueType font, for text with real geometry (model text; session bk-tools-b-10).
 * Host-free, no DOM, no library: written from the OpenType specification ('sfnt' container; head, maxp, hhea, hmtx, cmap formats
 * 4 and 12, loca, glyf with composite glyphs, OS/2). Canonical in lib/workplane (tools/workplane/sync.mjs).
 *
 * The apps hand it the font their sheets and PDFs already use: Liberation Sans (SIL Open Font License 1.1,
 * assets/vendor/liberation-sans/<version>/ with its LICENSE). The outlines are read from the file at run time; no font data is
 * copied into this code.
 *
 *   readOutlineFont(bytes) → font { unitsPerEm, capHeight, ascent, descent, glyph(codePoint) → id | 0, advance(id),
 *                                   contours(id) → [[[x, y] …] …] in font units, curves made into short chords }
 *   textPolygons(font, text, { height, steps = 6, lineGap = 1.6 }) → { polys: [{ outer: [[x, y] …], holes: [[[x, y] …] …] }],
 *        width, lines, area, missing: [characters the font has no glyph for] }
 *        x along the text from the left of the first line's baseline, y up; `height` is the CAPITAL height; further lines sit
 *        below (lineGap capital heights apart). outer loops run counter-clockwise, holes clockwise. No kerning.
 */
export function readOutlineFont(bytes) {
  const b = ArrayBuffer.isView(bytes) ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) : new Uint8Array(bytes);
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const u16 = (o) => v.getUint16(o), i16 = (o) => v.getInt16(o), u32 = (o) => v.getUint32(o);
  if (u32(0) !== 0x00010000 && u32(0) !== 0x74727565) throw new Error('not a TrueType font');
  const T = {};
  for (let i = 0, n = u16(4); i < n; i++) { const o = 12 + i * 16; T[String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3])] = { off: u32(o + 8), len: u32(o + 12) }; }
  for (const need of ['head', 'maxp', 'hhea', 'hmtx', 'cmap', 'loca', 'glyf']) if (!T[need]) throw new Error('font has no ' + need + ' table');
  const unitsPerEm = u16(T.head.off + 18), longLoca = i16(T.head.off + 50) === 1;
  const numGlyphs = u16(T.maxp.off + 4), nH = u16(T.hhea.off + 34);
  const ascent = i16(T.hhea.off + 4), descent = i16(T.hhea.off + 6);
  let capHeight = 0;
  if (T['OS/2'] && u16(T['OS/2'].off) >= 2 && T['OS/2'].len >= 90) capHeight = i16(T['OS/2'].off + 88);
  const advance = (g) => u16(T.hmtx.off + 4 * Math.min(g, nH - 1));
  const loca = (g) => (longLoca ? u32(T.loca.off + 4 * g) : 2 * u16(T.loca.off + 2 * g));

  // ---- cmap: the best Unicode subtable (format 12 first, then 4) ----
  let cm4 = 0, cm12 = 0;
  for (let i = 0, n = u16(T.cmap.off + 2); i < n; i++) {
    const o = T.cmap.off + 4 + i * 8, pid = u16(o), eid = u16(o + 2), at = T.cmap.off + u32(o + 4), fmt = u16(at);
    if (fmt === 12 && (pid === 0 || (pid === 3 && eid === 10))) cm12 = at;
    if (fmt === 4 && (pid === 0 || (pid === 3 && eid === 1))) cm4 = at;
  }
  if (!cm4 && !cm12) throw new Error('font has no Unicode character map');
  const glyph = (cp) => {
    if (cm12) {
      const n = u32(cm12 + 12);
      let lo = 0, hi = n - 1;
      while (lo <= hi) { const m = (lo + hi) >> 1, o = cm12 + 16 + m * 12, s = u32(o), e = u32(o + 4); if (cp < s) hi = m - 1; else if (cp > e) lo = m + 1; else return u32(o + 8) + (cp - s); }
      if (!cm4) return 0;
    }
    if (cp > 0xffff) return 0;
    const segX2 = u16(cm4 + 6), ends = cm4 + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
    for (let i = 0; i < segX2; i += 2) {
      if (u16(ends + i) < cp) continue;
      const s = u16(starts + i);
      if (s > cp) return 0;
      const ro = u16(ranges + i);
      if (!ro) return (cp + u16(deltas + i)) & 0xffff;
      const g = u16(ranges + i + ro + 2 * (cp - s));
      return g ? (g + u16(deltas + i)) & 0xffff : 0;
    }
    return 0;
  };

  // ---- glyf: points of a glyph (composites resolved), then contours as chords ----
  function points(g, depth = 0) {
    if (g < 0 || g >= numGlyphs || depth > 8) return [];
    const o0 = loca(g), o1 = loca(g + 1);
    if (o1 <= o0) return [];
    const o = T.glyf.off + o0, nc = i16(o);
    if (nc >= 0) {
      const ends = [];
      for (let i = 0; i < nc; i++) ends.push(u16(o + 10 + 2 * i));
      const n = nc ? ends[nc - 1] + 1 : 0;
      let p = o + 10 + 2 * nc; p += 2 + u16(p);
      const flags = [];
      while (flags.length < n) { const f = b[p++]; flags.push(f); if (f & 8) { let r = b[p++]; while (r-- > 0 && flags.length < n) flags.push(f); } }
      const xs = [], ys = [];
      let x = 0;
      for (let i = 0; i < n; i++) { const f = flags[i]; if (f & 2) { const d = b[p++]; x += f & 16 ? d : -d; } else if (!(f & 16)) { x += i16(p); p += 2; } xs.push(x); }
      let y = 0;
      for (let i = 0; i < n; i++) { const f = flags[i]; if (f & 4) { const d = b[p++]; y += f & 32 ? d : -d; } else if (!(f & 32)) { y += i16(p); p += 2; } ys.push(y); }
      const out = [];
      let s = 0;
      for (const e of ends) { const c = []; for (let i = s; i <= e; i++) c.push({ x: xs[i], y: ys[i], on: !!(flags[i] & 1) }); out.push(c); s = e + 1; }
      return out;
    }
    const out = [];
    let p = o + 10, more = true;
    while (more) {
      const f = u16(p), gi = u16(p + 2); p += 4;
      let dx = 0, dy = 0;
      if (f & 1) { if (f & 2) { dx = i16(p); dy = i16(p + 2); } p += 4; } else { if (f & 2) { dx = v.getInt8(p); dy = v.getInt8(p + 1); } p += 2; }
      let a = 1, bb = 0, c = 0, d = 1;
      const f2 = (q) => i16(q) / 16384;
      if (f & 8) { a = d = f2(p); p += 2; } else if (f & 0x40) { a = f2(p); d = f2(p + 2); p += 4; } else if (f & 0x80) { a = f2(p); bb = f2(p + 2); c = f2(p + 4); d = f2(p + 6); p += 8; }
      for (const cnt of points(gi, depth + 1)) out.push(cnt.map((q) => ({ x: a * q.x + c * q.y + dx, y: bb * q.x + d * q.y + dy, on: q.on })));
      more = !!(f & 0x20);
    }
    return out;
  }
  function contours(g, steps = 6) {
    const out = [];
    for (const c of points(g)) {
      if (c.length < 2) continue;
      // every curve is on, off, on: between two off points lies an on point halfway
      const P = [];
      for (let i = 0; i < c.length; i++) { const a = c[i], n = c[(i + 1) % c.length]; P.push(a); if (!a.on && !n.on) P.push({ x: (a.x + n.x) / 2, y: (a.y + n.y) / 2, on: true }); }
      const s = P.findIndex((q) => q.on);
      if (s < 0) continue;
      const R = [...P.slice(s), ...P.slice(0, s)], poly = [];
      for (let i = 0; i < R.length; i++) {
        const a = R[i];
        if (!a.on) continue;
        poly.push([a.x, a.y]);
        const m = R[(i + 1) % R.length];
        if (m.on) continue;
        const e = R[(i + 2) % R.length];
        for (let k = 1; k < steps; k++) { const t = k / steps, w = 1 - t; poly.push([w * w * a.x + 2 * w * t * m.x + t * t * e.x, w * w * a.y + 2 * w * t * m.y + t * t * e.y]); }
      }
      const clean = [];
      for (const q of poly) { const l = clean[clean.length - 1]; if (!l || Math.hypot(q[0] - l[0], q[1] - l[1]) > 1e-9) clean.push(q); }
      if (clean.length > 2 && Math.hypot(clean[0][0] - clean[clean.length - 1][0], clean[0][1] - clean[clean.length - 1][1]) <= 1e-9) clean.pop();
      if (clean.length >= 3) out.push(clean);
    }
    return out;
  }
  if (!capHeight) { const H = contours(glyph(72)).flat(); capHeight = H.length ? Math.max(...H.map((q) => q[1])) : Math.round(unitsPerEm * 0.7); }
  return { unitsPerEm, capHeight, ascent, descent, numGlyphs, glyph, advance, contours };
}

const area = (p) => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], c = p[(i + 1) % p.length]; s += a[0] * c[1] - c[0] * a[1]; } return s / 2; };
const within = (poly, x, y) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], q = poly[j]; if ((a[1] > y) !== (q[1] > y) && x < a[0] + ((y - a[1]) / (q[1] - a[1])) * (q[0] - a[0])) c = !c; } return c; };

export function textPolygons(font, text, { height = 100, steps = 6, lineGap = 1.6 } = {}) {
  const k = height / font.capHeight, polys = [], missing = [];
  let width = 0, total = 0;
  const lines = String(text).split(/\r?\n/).slice(0, 50);
  lines.forEach((line, li) => {
    let pen = 0;
    const dy = -li * height * lineGap;
    for (const ch of line) {
      const cp = ch.codePointAt(0);
      let g = font.glyph(cp);
      if (!g && cp !== 32) { if (!missing.includes(ch)) missing.push(ch); g = font.glyph(63) || 0; }
      const loops = font.contours(g, steps).map((c) => c.map(([x, y]) => [pen + x * k, dy + y * k]));
      // TrueType: an outer contour runs clockwise (negative area with y up), a hole the other way; nesting decides when unsure
      const info = loops.map((l) => ({ l, a: area(l) })).filter((q) => Math.abs(q.a) > 1e-9);
      const depth = (q) => info.filter((o) => o !== q && Math.abs(o.a) > Math.abs(q.a) && within(o.l, q.l[0][0], q.l[0][1])).length;
      const outers = [], holes = [];
      for (const q of info) (depth(q) % 2 ? holes : outers).push(q);
      for (const o of outers) {
        const mine = holes.filter((h) => within(o.l, h.l[0][0], h.l[0][1]) && !outers.some((p) => p !== o && Math.abs(p.a) < Math.abs(o.a) && within(p.l, h.l[0][0], h.l[0][1]) && within(o.l, p.l[0][0], p.l[0][1])));
        const outer = o.a < 0 ? o.l.slice().reverse() : o.l;
        const hs = mine.map((h) => (h.a > 0 ? h.l.slice().reverse() : h.l));
        polys.push({ outer, holes: hs });
        total += Math.abs(o.a) - mine.reduce((s, h) => s + Math.abs(h.a), 0);
      }
      pen += font.advance(g) * k;
    }
    width = Math.max(width, pen);
  });
  return { polys, width, lines: lines.length, area: total, missing };
}
