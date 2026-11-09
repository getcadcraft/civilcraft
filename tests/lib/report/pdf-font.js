/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — font table names, PDF operators and errors for developers; nothing here is read by a person. */
/**
 * pdf-font.js — a TrueType font embedded in a plotted PDF, subset to the letters the drawing uses (0.6.1 FIX-061-PDF-CHARS).
 * Canonical in lib/report (hosts carry synced copies). DOM-free, no library: bin/test-cadcraft.mjs runs it in Node. Written from the OpenType spec (the 'sfnt' tables) and
 * ISO 32000-1 (§9.7 composite fonts, §9.10.3 ToUnicode CMaps).
 *
 * plot.js prints with the reader's built-in Helvetica while every text fits Windows-1252 (WinAnsi), so those PDFs are as
 * before. When a text needs more — Polish ą ę ł ś ż, Czech ř ů, Cyrillic, Greek … — the PDF carries this font instead: a
 * Type 0 font (Identity-H, two-byte codes = the subset's glyph ids) over a CIDFontType2 with the glyph widths and a ToUnicode
 * CMap, so the text stays selectable and searchable. The font is Liberation Sans 2.1.5 (SIL Open Font License 1.1;
 * assets/vendor/liberation-sans/<version>/ with its LICENSE): it has Helvetica's (Arial's) widths, so Latin text measures as
 * on screen (font.js).
 *
 *   readTtf(bytes)                 → font { unitsPerEm, numGlyphs, glyph(cp) → gid | 0, advance(gid) (font units), … }
 *   new FontUse(font)              collects what the pages use: use.encode(text) → { hex, width (1/1000 em), missing }
 *   subsetTtf(font, gids)          → { bytes (a smaller TrueType font: these glyphs from id 1, in this order), newGid(old), n }
 *   await fontObjects(use, first, pack) → { objects: [{ n, parts }] (Type0, CIDFont, descriptor, font file, ToUnicode), … }
 */
/* stand-ins for characters a font lacks (the same table as CadCraft's font.js) */
const SUBST = { '⌀': 'Ø', '−': '-', '′': "'", '″': '"', '\t': ' ' };

const u16 = (v, o) => v.getUint16(o), i16 = (v, o) => v.getInt16(o), u32 = (v, o) => v.getUint32(o);

/** A TrueType (glyf) font's tables and the lookups plot.js needs. Throws on anything else (CFF fonts, collections). */
export function readTtf(bytes, { name = 'LiberationSans', family = 'Liberation Sans' } = {}) {
  // a plain Uint8Array view (never a Node Buffer, whose slice() shares memory): the subset copies tables and edits the copies
  const b = ArrayBuffer.isView(bytes) ? new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength) : new Uint8Array(bytes);
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const ver = u32(v, 0);
  if (ver !== 0x00010000 && ver !== 0x74727565) throw new Error('not a TrueType font');
  const tables = new Map();
  for (let i = 0, n = u16(v, 4); i < n; i++) {
    const at = 12 + 16 * i, tag = String.fromCharCode(b[at], b[at + 1], b[at + 2], b[at + 3]);
    const off = u32(v, at + 8), len = u32(v, at + 12);
    if (off + len > b.length) throw new Error('font table ' + tag + ' runs past the end');
    tables.set(tag, { off, len });
  }
  for (const t of ['head', 'hhea', 'maxp', 'hmtx', 'loca', 'glyf', 'cmap']) if (!tables.has(t)) throw new Error('font has no ' + t + ' table');
  const T = (t) => tables.get(t).off;
  const unitsPerEm = u16(v, T('head') + 18), locaLong = i16(v, T('head') + 50) === 1;
  const numGlyphs = u16(v, T('maxp') + 4), nH = u16(v, T('hhea') + 34);
  const loca = (g) => (locaLong ? u32(v, T('loca') + 4 * g) : 2 * u16(v, T('loca') + 2 * g));
  const cmap = readCmap(v, T('cmap'));
  const os2 = tables.has('OS/2') ? T('OS/2') : -1;
  const font = {
    bytes: b, view: v, tables, unitsPerEm, numGlyphs, locaLong, psName: name, family,
    bbox: [i16(v, T('head') + 36), i16(v, T('head') + 38), i16(v, T('head') + 40), i16(v, T('head') + 42)],
    ascent: os2 >= 0 ? i16(v, os2 + 68) : i16(v, T('hhea') + 4),
    descent: os2 >= 0 ? i16(v, os2 + 70) : i16(v, T('hhea') + 6),
    capHeight: os2 >= 0 && u16(v, os2) >= 2 ? i16(v, os2 + 88) : i16(v, T('hhea') + 4),
    italicAngle: tables.has('post') ? i16(v, T('post') + 4) + u16(v, T('post') + 6) / 65536 : 0,
    glyph: (cp) => cmap.get(cp) || 0,
    advance: (g) => u16(v, T('hmtx') + 4 * Math.min(g, nH - 1)),
    lsb: (g) => (g < nH ? i16(v, T('hmtx') + 4 * g + 2) : i16(v, T('hmtx') + 4 * nH + 2 * (g - nH))),
    glyf: (g) => { if (g < 0 || g >= numGlyphs) return new Uint8Array(0); const a = loca(g), z = loca(g + 1); return z > a ? b.subarray(T('glyf') + a, T('glyf') + z) : new Uint8Array(0); },
    table: (t) => (tables.has(t) ? b.subarray(T(t), T(t) + tables.get(t).len) : null),
  };
  return font;
}

/** cmap: the Windows Unicode subtable (format 12 full range, else format 4 BMP), else a Unicode platform one. → Map(cp → gid) */
function readCmap(v, at) {
  const subs = [];
  for (let i = 0, n = u16(v, at + 2); i < n; i++) {
    const p = u16(v, at + 4 + 8 * i), e = u16(v, at + 6 + 8 * i), off = at + u32(v, at + 8 + 8 * i);
    subs.push({ p, e, off, fmt: u16(v, off) });
  }
  const rank = (s) => (s.fmt === 12 && (s.p === 3 || s.p === 0) ? 0 : s.fmt === 4 && s.p === 3 && s.e === 1 ? 1 : s.fmt === 4 && s.p === 0 ? 2 : 9);
  const s = subs.filter((x) => rank(x) < 9).sort((a, b) => rank(a) - rank(b))[0];
  const map = new Map();
  if (!s) throw new Error('font has no Unicode cmap');
  if (s.fmt === 12) {
    for (let i = 0, n = u32(v, s.off + 12); i < n; i++) {
      const g = s.off + 16 + 12 * i, a = u32(v, g), z = u32(v, g + 4), gid = u32(v, g + 8);
      for (let c = a; c <= z && c <= 0x10ffff; c++) map.set(c, gid + (c - a));
    }
    return map;
  }
  const segX2 = u16(v, s.off + 6), ends = s.off + 14, starts = ends + segX2 + 2, deltas = starts + segX2, ranges = deltas + segX2;
  for (let k = 0; k < segX2 / 2; k++) {
    const end = u16(v, ends + 2 * k), start = u16(v, starts + 2 * k), delta = i16(v, deltas + 2 * k), ro = u16(v, ranges + 2 * k);
    for (let c = start; c <= end && c !== 0xffff; c++) {
      let gid;
      if (!ro) gid = (c + delta) & 0xffff;
      else { const gi = u16(v, ranges + 2 * k + ro + 2 * (c - start)); gid = gi ? (gi + delta) & 0xffff : 0; }
      if (gid) map.set(c, gid);
    }
  }
  return map;
}

/** The glyphs a composite glyph is made of (its component glyph ids, with where each id sits in its bytes). */
function components(g) {
  const out = [];
  if (g.length < 10 || new DataView(g.buffer, g.byteOffset, g.byteLength).getInt16(0) >= 0) return out;
  const v = new DataView(g.buffer, g.byteOffset, g.byteLength);
  let p = 10;
  for (let guard = 0; guard < 256 && p + 4 <= g.length; guard++) {
    const flags = v.getUint16(p);
    out.push({ at: p + 2, gid: v.getUint16(p + 2) });
    p += 4 + (flags & 1 ? 4 : 2) + (flags & 8 ? 2 : flags & 0x40 ? 4 : flags & 0x80 ? 8 : 0);
    if (!(flags & 0x20)) break;
  }
  return out;
}

/**
 * What the pages print with the font: each text → its codes as a hex string for `Tj`, its width and the characters the
 * font has no glyph for (printed as "?" and counted, as before). Characters the font lacks try font.js's stand-ins first
 * (⌀ → Ø, the true minus → a hyphen).
 */
export class FontUse {
  constructor(font) { this.font = font; this.cids = new Map(); this.order = []; this.chars = []; this.q = font.glyph(0x3f); }
  /** The code a glyph prints with: CIDs count from 1 in the order glyphs are first used (= the subset's glyph ids). */
  cid(g, ch) {
    if (!g) return 0;
    let c = this.cids.get(g);
    if (c === undefined) { this.order.push(g); this.chars.push(ch); c = this.order.length; this.cids.set(g, c); }
    return c;
  }
  /** A glyph's box in font units [xMin, yMin, xMax, yMax] (its own header; a blank glyph has none). */
  box(g) {
    let b = this.boxes?.get(g);
    if (b !== undefined) return b;
    const d = this.font.glyf(g);
    b = d.length >= 10 ? (() => { const v = new DataView(d.buffer, d.byteOffset, d.byteLength); return [v.getInt16(2), v.getInt16(4), v.getInt16(6), v.getInt16(8)]; })() : null;
    (this.boxes ||= new Map()).set(g, b);
    return b;
  }
  encode(text) {
    let hex = '', width = 0, missing = 0;
    const gl = [];   // [glyph, char] in order, for the Thai mark placement
    for (const ch0 of String(text).normalize('NFC')) {
      let ch = ch0, g = this.font.glyph(ch.codePointAt(0));
      if (!g && SUBST[ch0]) { ch = SUBST[ch0]; g = this.font.glyph(ch.codePointAt(0)); }
      if (!g) { missing++; ch = '?'; g = this.q; }
      hex += this.cid(g, ch).toString(16).padStart(4, '0');
      width += this.font.advance(g) * 1000 / this.font.unitsPerEm;
      gl.push([g, ch0]);
    }
    const out = { hex, width, missing };
    if (/[\u0E48-\u0E4E]/.test(text)) { const ops = this.thaiOps(gl); if (ops) out.ops = ops; }
    return out;
  }
  /**
   * Thai tone marks (FX.3). The font draws a mark with no advance at the height it suits a plain consonant, so over an upper vowel
   * (ที่ นี้ ชั้น), over the ring of sara am (น้ำ) or beside a tall consonant (ป่ ฝ่ ฟ้) it lands on something and is lost. This
   * moves each such mark (x with a TJ adjustment, y with a text rise) from the glyphs' boxes: centred over the vowel, just above it;
   * over sara am's ring; left of a tall consonant's stem; a lower vowel under a descender (ญ ฐ) moves down. → the content-stream
   * fragment for the whole text, or null when nothing moves (the plain `<hex> Tj` is then used).
   */
  thaiOps(gl) {
    const U = 1000 / this.font.unitsPerEm, GAP = 40, UP = new Set([0x0E31, 0x0E34, 0x0E35, 0x0E36, 0x0E37, 0x0E47, 0x0E4D]);
    const TONE = (c) => (c >= 0x0E48 && c <= 0x0E4C) || c === 0x0E4E, LOW = (c) => c >= 0x0E38 && c <= 0x0E3A, TALL = new Set([0x0E1B, 0x0E1D, 0x0E1F, 0x0E2C]), DESC = new Set([0x0E0D, 0x0E10]);
    const hexOf = (g, ch) => this.cid(g, ch).toString(16).padStart(4, '0');
    const parts = []; let run = '', moved = false, base = null, up = null;
    const flush = () => { if (run) { parts.push('<' + run + '> Tj'); run = ''; } };
    for (let i = 0; i < gl.length; i++) {
      const [g, ch] = gl[i], c = ch.codePointAt(0);
      let dx = 0, rise = 0;
      const bx = this.box(g);
      if (TONE(c) && bx) {
        const next = gl[i + 1], nb = next && next[1] === '\u0E33' ? this.box(next[0]) : null;
        const ring = nb ? this.box(this.font.glyph(0x0E4D)) : null, mc = (bx[0] + bx[2]) / 2;
        if (nb && ring) { dx = nb[0] + (ring[2] - ring[0]) / 2 - mc; rise = Math.max(0, nb[3] + GAP - bx[1]); }
        else if (up) { dx = (up[0] + up[2]) / 2 - mc; rise = Math.max(0, up[3] + GAP - bx[1]); }
        else if (base && base.tall && base.box) { dx = Math.min(0, (base.box[0] + base.box[2]) / 2 - base.adv - bx[2]); }
      } else if (LOW(c) && bx && base && base.desc && base.box && bx[3] > base.box[1] - GAP) rise = base.box[1] - GAP - bx[3];
      if (UP.has(c)) up = bx;
      else if (!(TONE(c) || LOW(c))) { base = { box: bx, adv: this.font.advance(g), tall: TALL.has(c), desc: DESC.has(c) }; up = null; }
      if (dx || rise) {
        flush(); moved = true;
        parts.push((rise ? num2(rise * U / 1000) + ' Ts ' : '') + '[' + (dx ? num2(-dx * U) + ' ' : '') + '<' + hexOf(g, ch) + '>' + (dx ? ' ' + num2(dx * U) : '') + '] TJ' + (rise ? ' 0 Ts' : ''));
      } else run += hexOf(g, ch);
    }
    flush();
    return moved ? parts.join(' ') : null;
  }
}
const num2 = (x) => String(Math.round(x * 1000) / 1000);

/** How many characters of this text the font has no glyph for (font.js's stand-ins tried first, as FontUse.encode does). */
export function missingGlyphs(font, text) {
  let n = 0;
  for (const ch0 of String(text).normalize('NFC')) {
    if (font.glyph(ch0.codePointAt(0))) continue;
    const alt = SUBST[ch0];
    if (!alt || !font.glyph(alt.codePointAt(0))) n++;
  }
  return n;
}

/**
 * A smaller TrueType font with only these glyphs, in this order from id 1 (.notdef stays 0), then the parts of composite
 * glyphs. The hinting programs (cvt, fpgm, prep) go along unchanged: the glyphs' own instructions call them.
 * → { bytes, newGid(old) → new id, n }
 */
export function subsetTtf(font, gids) {
  const order = [0], map = new Map([[0, 0]]);
  const add = (g) => { if (map.has(g) || g < 0 || g >= font.numGlyphs) return; map.set(g, order.length); order.push(g); };
  for (const g of gids) add(g);
  for (let i = 0; i < order.length && order.length < 65535; i++) for (const c of components(font.glyf(order[i]))) add(c.gid);
  const n = order.length;
  // glyf + loca (long offsets), with the component ids of composite glyphs renumbered
  const parts = order.map((g) => {
    const src = font.glyf(g), copy = new Uint8Array(src.length + ((4 - (src.length % 4)) % 4));
    copy.set(src);
    const v = new DataView(copy.buffer);
    for (const c of components(src)) v.setUint16(c.at, map.get(c.gid) ?? 0);
    return copy;
  });
  const glyf = cat(parts), loca = new Uint8Array(4 * (n + 1)), lv = new DataView(loca.buffer);
  let at = 0;
  parts.forEach((p, i) => { lv.setUint32(4 * i, at); at += p.length; });
  lv.setUint32(4 * n, at);
  const hmtx = new Uint8Array(4 * n), hv = new DataView(hmtx.buffer);
  order.forEach((g, i) => { hv.setUint16(4 * i, font.advance(g)); hv.setInt16(4 * i + 2, font.lsb(g)); });
  const own = (t) => Uint8Array.from(font.table(t));   // a copy of its own
  const dv = (u) => new DataView(u.buffer, u.byteOffset, u.byteLength);
  const head = own('head'), hhea = own('hhea'), maxp = own('maxp');
  dv(head).setUint32(8, 0);           // checkSumAdjustment: set once the file is built
  dv(head).setInt16(50, 1);           // long loca offsets
  dv(hhea).setUint16(34, n);          // numberOfHMetrics
  dv(maxp).setUint16(4, n);           // numGlyphs
  const post = new Uint8Array(32);
  if (font.table('post')) post.set(font.table('post').subarray(0, 32));
  new DataView(post.buffer).setUint32(0, 0x00030000);  // format 3: no glyph names
  const tables = { head, hhea, maxp, hmtx, loca, glyf, post, cmap: cmapFor(font, map) };
  for (const t of ['cvt ', 'fpgm', 'prep', 'gasp', 'OS/2']) if (font.table(t)) tables[t] = own(t);
  tables.name = nameTable(font.psName, font.family);
  const bytes = sfnt(tables);
  const sum = checksum(bytes);
  const hOff = tableOffset(bytes, 'head');
  new DataView(bytes.buffer).setUint32(hOff + 8, (0xb1b0afba - sum) >>> 0);
  return { bytes, newGid: (g) => map.get(g) ?? 0, n };
}

/** cmap format 4 (BMP) over the subset: the characters the subset's glyphs stand for. */
function cmapFor(font, map) {
  const pairs = [];
  // every BMP character of the original font whose glyph is in the subset (few hundred at most)
  for (let c = 0x20; c < 0xffff; c++) { const g = font.glyph(c); if (g && map.has(g)) pairs.push([c, map.get(g)]); }
  const segs = pairs.map(([c, g]) => ({ start: c, end: c, delta: (g - c) & 0xffff }));
  segs.push({ start: 0xffff, end: 0xffff, delta: 1 });
  const nseg = segs.length, len = 16 + 8 * nseg;
  const sub = new Uint8Array(len), v = new DataView(sub.buffer);
  let sr = 1, es = 0;
  while (sr * 2 <= nseg) { sr *= 2; es++; }
  v.setUint16(0, 4); v.setUint16(2, len); v.setUint16(4, 0); v.setUint16(6, 2 * nseg); v.setUint16(8, 2 * sr); v.setUint16(10, es); v.setUint16(12, 2 * nseg - 2 * sr);
  segs.forEach((s, k) => {
    v.setUint16(14 + 2 * k, s.end);
    v.setUint16(16 + 2 * nseg + 2 * k, s.start);
    v.setUint16(16 + 4 * nseg + 2 * k, s.delta);
    v.setUint16(16 + 6 * nseg + 2 * k, 0);
  });
  const out = new Uint8Array(12 + len), ov = new DataView(out.buffer);
  ov.setUint16(0, 0); ov.setUint16(2, 1); ov.setUint16(4, 3); ov.setUint16(6, 1); ov.setUint32(8, 12);
  out.set(sub, 12);
  return out;
}

/** A small 'name' table: family, subfamily, full name and PostScript name (Windows, Unicode). */
function nameTable(ps, family) {
  const recs = [[1, family], [2, 'Regular'], [4, family], [6, ps]];
  const strs = recs.map(([, s]) => { const u = new Uint8Array(2 * s.length); for (let i = 0; i < s.length; i++) { u[2 * i] = s.charCodeAt(i) >> 8; u[2 * i + 1] = s.charCodeAt(i) & 255; } return u; });
  const head = 6 + 12 * recs.length, out = new Uint8Array(head + strs.reduce((n, s) => n + s.length, 0)), v = new DataView(out.buffer);
  v.setUint16(0, 0); v.setUint16(2, recs.length); v.setUint16(4, head);
  let off = 0;
  recs.forEach(([id], i) => {
    const r = 6 + 12 * i;
    v.setUint16(r, 3); v.setUint16(r + 2, 1); v.setUint16(r + 4, 0x409); v.setUint16(r + 6, id); v.setUint16(r + 8, strs[i].length); v.setUint16(r + 10, off);
    out.set(strs[i], head + off); off += strs[i].length;
  });
  return out;
}

function cat(list) { const out = new Uint8Array(list.reduce((n, p) => n + p.length, 0)); let at = 0; for (const p of list) { out.set(p, at); at += p.length; } return out; }
function checksum(b, off = 0, len = b.length) {
  let sum = 0;
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = off; i < off + len; i += 4) sum = (sum + (i + 4 <= b.length ? v.getUint32(i) : ((b[i] << 24) | ((b[i + 1] || 0) << 16) | ((b[i + 2] || 0) << 8) | (b[i + 3] || 0)) >>> 0)) >>> 0;
  return sum;
}
function sfnt(tables) {
  const tags = Object.keys(tables).sort();
  const n = tags.length;
  let sr = 1, es = 0;
  while (sr * 2 <= n) { sr *= 2; es++; }
  let at = 12 + 16 * n;
  const offs = tags.map((t) => { const o = at; at += tables[t].length + ((4 - (tables[t].length % 4)) % 4); return o; });
  const out = new Uint8Array(at), v = new DataView(out.buffer);
  v.setUint32(0, 0x00010000); v.setUint16(4, n); v.setUint16(6, 16 * sr); v.setUint16(8, es); v.setUint16(10, 16 * n - 16 * sr);
  tags.forEach((t, i) => {
    const r = 12 + 16 * i;
    for (let k = 0; k < 4; k++) out[r + k] = t.charCodeAt(k);
    out.set(tables[t], offs[i]);
    v.setUint32(r + 4, checksum(out, offs[i], tables[t].length));
    v.setUint32(r + 8, offs[i]); v.setUint32(r + 12, tables[t].length);
  });
  return out;
}
function tableOffset(b, tag) {
  const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 0, n = v.getUint16(4); i < n; i++) { const r = 12 + 16 * i; if (String.fromCharCode(b[r], b[r + 1], b[r + 2], b[r + 3]) === tag) return v.getUint32(r + 8); }
  return -1;
}

const utf16hex = (s) => { let h = ''; for (let i = 0; i < s.length; i++) h += s.charCodeAt(i).toString(16).padStart(4, '0'); return h.toUpperCase(); };

/**
 * The PDF objects for the font a FontUse collected, numbered from `first`: Type0 (first) → CIDFontType2 → FontDescriptor →
 * FontFile2 (the subset; `pack` = an async deflate, or null to store it plain) and the ToUnicode CMap (code → the character).
 * → { objects: [{ n, parts }], glyphs, name, size }
 */
export async function fontObjects(use, first, pack = null) {
  const font = use.font;
  const sub = subsetTtf(font, use.order);
  const k = 1000 / font.unitsPerEm, r = (x) => Math.round(x * k);
  // the subset tag (six capitals, ISO 32000-1 §9.6.4) from the glyphs it holds: the same drawing gives the same name
  let hsh = 2166136261;
  for (const g of use.order) { hsh ^= g; hsh = Math.imul(hsh, 16777619) >>> 0; }
  let tag = '';
  for (let i = 0; i < 6; i++) { tag += String.fromCharCode(65 + (hsh % 26)); hsh = Math.floor(hsh / 26); }
  const name = tag + '+' + font.psName;
  const widths = use.order.map((g) => r(font.advance(g)));
  const cmapLines = [];
  const pairs = use.chars.map((ch, i) => [i + 1, ch]);
  for (let i = 0; i < pairs.length; i += 100) {
    const chunk = pairs.slice(i, i + 100);
    cmapLines.push(chunk.length + ' beginbfchar', ...chunk.map(([c, ch]) => '<' + c.toString(16).padStart(4, '0').toUpperCase() + '> <' + utf16hex(ch) + '>'), 'endbfchar');
  }
  const cmap = ['/CIDInit /ProcSet findresource begin', '12 dict begin', 'begincmap', '/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def',
    '/CMapName /Adobe-Identity-UCS def', '/CMapType 2 def', '1 begincodespacerange', '<0000> <FFFF>', 'endcodespacerange', ...cmapLines,
    'endcmap', 'CMapName currentdict /CMap defineresource pop', 'end', 'end'].join('\n');
  const stream = async (extra, bytes) => {
    const packed = pack ? await pack(bytes) : null;
    const data = packed || bytes;
    return ['<< ' + extra + '/Length ' + data.length + (packed ? ' /Filter /FlateDecode' : '') + ' >>\nstream\n', data, '\nendstream'];
  };
  const objects = [
    { n: first, parts: '<< /Type /Font /Subtype /Type0 /BaseFont /' + name + ' /Encoding /Identity-H /DescendantFonts [' + (first + 1) + ' 0 R] /ToUnicode ' + (first + 4) + ' 0 R >>' },
    { n: first + 1, parts: '<< /Type /Font /Subtype /CIDFontType2 /BaseFont /' + name + ' /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ' + (first + 2) + ' 0 R /DW ' + r(font.advance(0)) + (widths.length ? ' /W [1 [' + widths.join(' ') + ']]' : '') + ' /CIDToGIDMap /Identity >>' },
    { n: first + 2, parts: '<< /Type /FontDescriptor /FontName /' + name + ' /Flags 32 /FontBBox [' + font.bbox.map(r).join(' ') + '] /ItalicAngle ' + font.italicAngle + ' /Ascent ' + r(font.ascent) + ' /Descent ' + r(font.descent) + ' /CapHeight ' + r(font.capHeight) + ' /StemV 80 /FontFile2 ' + (first + 3) + ' 0 R >>' },
    { n: first + 3, parts: await stream('/Length1 ' + sub.bytes.length + ' ', sub.bytes) },
    { n: first + 4, parts: await stream('', new TextEncoder().encode(cmap)) },
  ];
  return { objects, glyphs: sub.n, name, size: sub.bytes.length };
}
