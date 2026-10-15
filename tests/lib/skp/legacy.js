/* SPDX-License-Identifier: Apache-2.0 */
/**
 * legacy.js — cc-skp reader for classic SketchUp files (SketchUp 3 … 2020; docs/SKP-LIB-SPEC.md).
 * Format knowledge comes from OpenSKP (MIT, © 2024-2026 Ahsan Mehmood, refs/openskp @ a8408f3; see NOTICE):
 * its legacy.ts / legacy.py walk was our map. The code here is ours.
 *
 *   readLegacy(bytes, header, opts) → the spec's model object (container 'legacy')
 *
 * ── What we rely on from read.js ─────────────────────────────────────────────────────────────────────
 *   bytes            Uint8Array, the whole file (we check LIMITS.fileBytes again).
 *   header.version   '6.0.1' / '17.0.18899' (used as is for model.version; we read it ourselves when missing).
 *   header.major     3 … 20 (2013 → 13). Missing → read from the header's "{x.y.z}" string.
 *   header.bodyStart optional: a byte offset at or before the CVersionMap class record (read.js: just past the
 *                    version string; the 16-byte id, a path string and a timestamp follow). We look for the record
 *                    from there; missing, wrong or past it → we search the file's first 64 KB ourselves.
 *   opts.onProgress  optional, called as onProgress({ stage: 'legacy', done, total: 100 }) between phases.
 *   opts.signal      optional AbortSignal, checked between phases (an abort throws signal.reason, not an SkpError).
 * Everything else that goes wrong comes out as SkpError (damaged / unsupported / too_big).
 *
 * ── The format in brief (our words) ─────────────────────────────────────────────────────────────────
 * After the header records the body is ONE uncompressed MFC CArchive object stream with a single store map:
 * every new class record (0xFFFF, schema u16, name length u16, ASCII name) and every new object takes the next
 * 1-based index; later references are back-refs to that index (u16, or 0x7FFF + u32 once indexes get big);
 * 0x8000|n = "a new object of the class at index n". The stream opens with CVersionMap (class name → schema
 * number, which we use to tell layouts apart), then document settings we do not walk, then the material
 * manager, the layer list, the definition list, the model's own entity list and finally options dictionaries
 * (UnitsOptions → LengthUnit). Because we skip the settings region we don't know how many store-map indexes it
 * used: the "slot base" is bootstrapped from the first back-references (OpenSKP's trick). Geometry: CFace →
 * CLoop → CEdgeUse → CEdge → CVertex; components/groups are CComponentDefinition + CComponentInstance/CGroup
 * with a 13-double transform (3×3 row by row, origin, w).
 *
 * Untrusted input: every read goes through util.js's bounds-checked Reader, counts are capped, object nesting is
 * depth-capped (no unbounded recursion), and any internal failure is turned into SkpError('damaged').
 */

import { SkpError, Reader, LIMITS, okNum } from './util.js';
import { msg } from './messages.js';

// ── small helpers ─────────────────────────────────────────────────────────────────────────────────────

/** A record we could not make sense of. Caught inside the walk where OpenSKP's layout tolerates it; anything
 * that escapes becomes SkpError('damaged'). `key` is a ccskp.legacy.* message (messages.js), `fills` its fills. */
class Misparse extends Error {
  constructor(key, fills) { super(msg(key, fills)); }
}

const STR = [0xff, 0xfe, 0xff];   // a CString record starts with these three bytes

const hex = (b) => Array.from(b, (x) => x.toString(16).padStart(2, '0')).join('');
const u16at = (b, p) => (p + 2 <= b.length ? b[p] | (b[p + 1] << 8) : -1);
const u32at = (b, p) => (p + 4 <= b.length ? (b[p] | (b[p + 1] << 8) | (b[p + 2] << 16) | (b[p + 3] << 24)) >>> 0 : -1);
const strAt = (b, p) => p + 3 <= b.length && b[p] === 0xff && b[p + 1] === 0xfe && b[p + 2] === 0xff;
const asciiAt = (b, p, s) => {
  if (p < 0 || p + s.length > b.length) return false;
  for (let i = 0; i < s.length; i++) if (b[p + i] !== s.charCodeAt(i)) return false;
  return true;
};
/** First index of `needle` (array of bytes, null = any byte) in b[start, end), or -1. */
function find(b, needle, start = 0, end = b.length) {
  const last = Math.min(end, b.length) - needle.length;
  outer: for (let i = Math.max(0, start); i <= last; i++) {
    for (let j = 0; j < needle.length; j++) if (needle[j] !== null && b[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}
const asciiBytes = (s) => Array.from(s, (c) => c.charCodeAt(0));
/** A new-class record for `name`: FF FF <schema u16> <len u16> name. */
const classRecord = (name) => [0xff, 0xff, null, null, name.length, 0, ...asciiBytes(name)];

/** CString: FF FE FF, length u8 (0xFF → u16, 0xFFFF → u32) in UTF-16 code units, then the text. */
function str(r) {
  if (!strAt(r.b, r.pos)) throw new Misparse('ccskp.legacy.text_record', { at: r.pos });
  r.pos += 3;
  let n = r.u8();
  if (n === 0xff) { n = r.u16(); if (n === 0xffff) n = r.u32(); }
  if (n * 2 > r.left()) throw new Misparse('ccskp.legacy.text_long', { at: r.pos });
  return r.utf16(n);
}
const f64s = (r, n) => { const a = new Array(n); for (let i = 0; i < n; i++) a[i] = r.f64(); return a; };
const peek16 = (r) => { r.need(2); return u16at(r.b, r.pos); };

// ── the archive: store map + object walk ──────────────────────────────────────────────────────────────

/** Object nesting cap: a definition inlined in an instance inlined in a definition … costs ~2 levels per
 * model nesting level, plus face → loop → edge use → edge → vertex and attribute containers. */
const MAX_OBJECT_DEPTH = 2 * LIMITS.depth + 32;
const MAX_SLOTS = 64_000_000;

/** Layout switches. Each comes from the class's schema number in the file's own CVersionMap when it is there
 * (so versions we have never seen, e.g. SketchUp 8 or 2016, follow their schemas), else from the major
 * version as OpenSKP calibrated it. */
function layoutFor(major, schemas) {
  const sch = (name, fallback) => (schemas.has(name) ? schemas.get(name) : fallback);
  return {
    major,
    v3: major < 4,                                                     // SketchUp 3: shorter records, no attribute pointers
    pid: sch('CEntity', major >= 17 ? 5 : 3) >= 5,                     // entity preambles carry a persistent-id mask
    attrTail: sch('CAttributeNamed', major >= 7 ? 1 : 0) >= 1,         // trailing u32 on attribute dictionaries
    instGuid: sch('CComponentInstance', major >= 14 ? 5 : 4) >= 5,     // instances and groups end with a 16-byte GUID
  };
}

class Archive {
  constructor(bytes, lay) {
    this.b = bytes;
    this.lay = lay;
    this.r = new Reader(bytes);
    this.slots = new Map();      // store-map index → [kind 'class'|'obj', class name, value]
    this.classSlot = new Map();  // class name → index of its class record
    this.next = 0;               // next store-map index
    this.base = 0;               // indexes below this belong to the settings region we skip
    this.depth = 0;
    this.vertices = 0;
    this.currentLoop = null;
    this.currentSlot = null;
    // Annotation "burns" (OpenSKP's finding): attaching a dimension or leader text to geometry maps
    // connection-point objects into the store map without writing any bytes, so later back-references run
    // ahead of our numbering. We record each band [fileStart, width] and translate references through them.
    this.burns = [];
    this.burnTotal = 0;
    this.annotMark = null;
    this.burnCredits = [];
    this.clineTail = null;
    this.onDefinition = null;    // called with (slot, value) as each CComponentDefinition completes
    this.skipped = { text: 0, dims: 0, sections: 0, guides: 0, images: 0 };
  }

  alloc(entry) {
    if (this.next - this.base > MAX_SLOTS) throw new SkpError('too_big', msg('ccskp.too_big.objects'));
    const s = this.next++;
    this.slots.set(s, entry);
    return s;
  }

  /** Read one object reference / object. Returns [slot, className, value]; [null, null, null] for a null. */
  obj(r, expect = null) {
    const tag = r.u16();
    if (tag === 0) return [null, null, null];
    if (tag === 0x7fff) {
      const big = r.u32();
      return big & 0x80000000 ? this.ofClass(r, big & 0x7fffffff, expect) : this.backref(big, r);
    }
    if (tag === 0xffff) {
      const schema = r.u16();
      const len = r.u16();
      if (len > 40) throw new Misparse('ccskp.legacy.class_name', { at: r.pos });
      const name = r.ascii(len);
      const s = this.alloc(['class', name, schema]);
      this.classSlot.set(name, s);
      return this.newObj(r, name);
    }
    if (tag & 0x8000) return this.ofClass(r, tag & 0x7fff, expect);
    return this.backref(tag, r);
  }

  ofClass(r, cslot, expect) {
    let ent = this.slots.get(cslot);
    if (!ent) {
      // a class first defined in the settings region we skipped: learn it from what the reader expects here
      if (!expect) throw new Misparse('ccskp.legacy.class_unknown', { at: r.pos });
      ent = ['class', expect, null];
      this.slots.set(cslot, ent);
      this.classSlot.set(expect, cslot);
    }
    if (ent[0] !== 'class') throw new Misparse('ccskp.legacy.ref_as_class', { at: r.pos });
    return this.newObj(r, ent[1]);
  }

  newObj(r, name) {
    const read = READERS[name];
    if (!read) throw new Misparse('ccskp.legacy.type_unknown', { type: name, at: r.pos });
    if (++this.depth > MAX_OBJECT_DEPTH) {
      throw new SkpError('too_big', msg('ccskp.too_big.object_depth', { levels: LIMITS.depth }));
    }
    const slot = this.alloc(['obj', name, null]);
    const prev = this.currentSlot;
    this.currentSlot = slot;
    let v;
    try { v = read(this, r); } finally { this.currentSlot = prev; this.depth--; }
    this.slots.set(slot, ['obj', name, v]);
    if (name === 'CComponentDefinition' && v && this.onDefinition) this.onDefinition(slot, v);
    if (name === 'CDimensionLinear' || name === 'CText') this.annotMark = this.next;
    return [slot, name, v];
  }

  /** A file index → our numbering, through the burn bands; null when it points INTO a band. */
  translate(slot) {
    let off = 0;
    for (const [start, width] of this.burns) {
      if (slot < start) break;
      if (slot < start + width) return null;
      off += width;
    }
    return slot - off;
  }

  backref(slot, r) {
    if (this.burns.length && slot >= this.burns[0][0]) {
      const t = this.translate(slot);
      if (t === null) return [slot, 'reserved', null];
      slot = t;
    }
    const ent = this.slots.get(slot);
    if (!ent) {
      if (slot < this.base) return [slot, 'premodel', null];
      throw new Misparse('ccskp.legacy.ref_unread', { at: r.pos });
    }
    if (ent[0] === 'class') throw new Misparse('ccskp.legacy.ref_class_record', { at: r.pos });
    return [slot, ent[1], ent[2]];
  }

  /** Is there a CLayer record at `at` (new class record, or a class-ref to the known CLayer class)? */
  layerRecordAt(at, anyClassRef = false) {
    const t = u16at(this.b, at);
    if (t === 0xffff && u16at(this.b, at + 4) === 6 && asciiAt(this.b, at + 6, 'CLayer')) return true;
    const cs = this.classSlot.get('CLayer');
    if (cs !== undefined && isClassRef(this.b, at, cs)) return true;
    return anyClassRef && t !== -1 && (t & 0x8000) !== 0 && t !== 0xffff;
  }

  /** Layer records past the declared count (seen in SketchUp 2018/2020 files), with null separators. */
  trailingLayers(out, anyClassRef = false) {
    const r = this.r;
    while (r.pos + 2 <= r.end) {
      if (u16at(this.b, r.pos) === 0) { r.pos += 2; continue; }
      if (!this.layerRecordAt(r.pos, anyClassRef)) break;
      const [s, , v] = this.obj(r, 'CLayer');
      if (v) out.push([s, v]);
    }
  }
}

/** Class-ref to `slot` at p, short (0x8000|slot) or escaped (0x7FFF + 0x80000000|slot). */
function isClassRef(b, p, slot) {
  if (slot <= 0x7fff) return u16at(b, p) === (0x8000 | slot);
  return u16at(b, p) === 0x7fff && u32at(b, p + 2) === ((0x80000000 | slot) >>> 0);
}

/** Can the u16 at `at` start an object read without doubt (null, escape, class record, known class-ref)? */
function strictTag(ar, at, allowNull = true) {
  const t = u16at(ar.b, at);
  if (t === -1) return false;
  if (t === 0) return allowNull;
  if (t === 0x7fff || t === 0xffff) return true;
  if (t & 0x8000) { const e = ar.slots.get(t & 0x7fff); return !!e && e[0] === 'class'; }
  return false;
}
/** Like strictTag, but a plain back-ref inside the walked range also counts. */
function plausibleTag(ar, at) {
  const t = u16at(ar.b, at);
  if (t === -1) return false;
  if (t === 0 || t === 0x7fff || t === 0xffff) return true;
  if (t & 0x8000) { const e = ar.slots.get(t & 0x7fff); return !!e && e[0] === 'class'; }
  return t < ar.next;
}

/** SketchUp 2020 sometimes writes an empty text record + zero padding ahead of a count, which leaves us a few
 * bytes early. Given where the bad count was read, find the real one: past the marker, at +4+pad with
 * pad ≡ 1 (mod 4), the first plausible non-zero u32. Returns the count (cursor moved) or null. */
function retryAfterFiller(ar, r, countPos, limit) {
  let m = -1;
  for (let i = countPos; i < countPos + 12 && i + 4 <= ar.b.length; i++) if (strAt(ar.b, i)) { m = i; break; }
  if (m < 0 || ar.b[m + 3] !== 0) return null;
  for (let pad = 1; pad <= 29; pad += 4) {
    const at = m + 4 + pad;
    const n = u32at(ar.b, at);
    if (n === -1) break;
    if (n > 0 && n <= limit && plausibleTag(ar, at + 4)) { r.pos = at + 4; return n; }
  }
  return null;
}

// ── shared record blocks ──────────────────────────────────────────────────────────────────────────────

/** Entity preamble: attribute-container pointer, then (2017+) a persistent-id mask + its bytes. */
function preamble(ar, r) {
  const [attrSlot, , attrs] = ar.obj(r, 'CAttributeContainer');
  if (ar.lay.pid) {
    const mask = r.u8();
    for (let bit = 0; bit < 8; bit++) if (mask & (1 << bit)) r.u8();
  }
  return { attrs, attrSlot };
}
/** Vertex, loop, edge use, material and layer have no attribute pointer in SketchUp 3. */
const earlyPreamble = (ar, r) => (ar.lay.v3 ? { attrs: null, attrSlot: null } : preamble(ar, r));

/** Drawing-element block: 8 bytes (material u16, hidden, ?, ?, soft, smooth, ?) then the layer. SketchUp 3 has
 * 5 bytes we can't decode. The layer is a reference to a CLayer: a plain index, or (seen on 2018 instances) a
 * whole CLayer record on first use / an escaped back-ref. Returns the layer's store-map index or null. */
function drawbase(ar, r) {
  const blk = r.bytes(ar.lay.v3 ? 5 : 8);
  let layer = null;
  const t = peek16(r);
  if (t === 0x7fff || (t & 0x8000)) {
    const [s, n] = ar.obj(r, 'CLayer');
    if (n === 'CLayer') layer = s;
  } else {
    r.pos += 2;
    const s = t && ar.burns.length ? ar.translate(t) : t;
    if (s && ar.slots.get(s)?.[1] === 'CLayer') layer = s;
  }
  if (ar.lay.v3) return { mat: 0, hidden: false, soft: false, smooth: false, layer };
  return { mat: blk[0] | (blk[1] << 8), hidden: blk[2] !== 0, soft: blk[5] !== 0, smooth: blk[6] !== 0, layer };
}

// ── entity readers (one per class; each returns a small plain object) ─────────────────────────────────

function readVertex(ar, r) {
  earlyPreamble(ar, r);
  if (++ar.vertices > LIMITS.vertices) throw new SkpError('too_big', msg('ccskp.too_big.vertices', { max: LIMITS.vertices }));
  const p = f64s(r, 3);
  if (!p.every(okNum)) throw new Misparse('ccskp.legacy.vertex_range', { at: r.pos });
  return { k: 'vertex', p };
}

function readEdge(ar, r) {
  preamble(ar, r);
  const db = drawbase(ar, r);
  const [v1] = ar.obj(r, 'CVertex');
  const [v2] = ar.obj(r, 'CVertex');
  const [, cn] = ar.obj(r);
  if (cn !== null && cn !== 'CCurve' && cn !== 'CArcCurve') throw new Misparse('ccskp.legacy.edge_curve', { type: cn, at: r.pos });
  return { k: 'edge', db, v1, v2 };
}

function readCurve(ar, r) { preamble(ar, r); r.u8(); r.u32(); return { k: 'curve' }; }
function readArcCurve(ar, r) { preamble(ar, r); r.skip(5); r.skip(14 * 8); return { k: 'curve' }; }

function readEdgeUse(ar, r) {
  earlyPreamble(ar, r);
  const [edge] = ar.obj(r, 'CEdge');
  const sense = r.u8();
  // The parent-loop back-ref keeps us honest: it must name the loop being read. When it runs AHEAD of our
  // numbering right after an annotation, the writer burned indexes (see Archive.burns) — record the band.
  const p0 = r.pos;
  const tag = r.u16();
  let parent;
  if (tag === 0x7fff) {
    const big = r.u32();
    if (big & 0x80000000) throw new Misparse('ccskp.legacy.edgeuse_parent', { at: r.pos });
    parent = big;
  } else if (tag === 0xffff || (tag & 0x8000)) {
    throw new Misparse('ccskp.legacy.edgeuse_parent', { at: r.pos });
  } else parent = tag || null;
  const want = ar.currentLoop !== null ? ar.currentLoop + ar.burnTotal : null;
  if (parent !== want) {
    const delta = parent !== null && want !== null ? parent - want : 0;
    if (delta > 0 && delta <= 4096 && ar.annotMark !== null) {
      ar.burns.push([ar.annotMark + ar.burnTotal, delta]);
      ar.burnTotal += delta;
      ar.annotMark = null;
      if (ar.burnCredits.length) ar.burnCredits[ar.burnCredits.length - 1]++;
    } else {
      r.pos = p0;
      throw new Misparse('ccskp.legacy.edgeuse_loop', { at: r.pos });
    }
  }
  return { k: 'use', edge, sense };
}

function readLoop(ar, r) {
  const prev = ar.currentLoop;
  ar.currentLoop = ar.currentSlot;
  earlyPreamble(ar, r);
  r.skip(2);
  const uses = [];
  while (peek16(r) !== 0) uses.push(ar.obj(r, 'CEdgeUse')[2]);
  r.pos += 2;
  ar.currentLoop = prev;
  return { k: 'loop', uses };
}

function readFace(ar, r) {
  const pre = preamble(ar, r);
  const db = drawbase(ar, r);
  let attrs = pre.attrs;
  if (ar.lay.v3 && attrs && attrs.k === 'material') {   // SketchUp 3: the opening pointer is the front material
    db.mat = pre.attrSlot;
    attrs = null;
  }
  const plane = f64s(r, 4);
  const n = r.u32();
  if (n > 10000) throw new Misparse('ccskp.legacy.loop_count', { at: r.pos });
  const loops = [];
  for (let i = 0; i < n; i++) loops.push(ar.obj(r, 'CLoop')[2]);
  const back = r.u16();
  let ftc = null;
  for (const [, c] of attrs?.children || []) if (c && c.k === 'ftc') ftc = c;
  return { k: 'face', db, plane, loops, back, ftc };
}

function readAttrContainer(ar, r) {
  preamble(ar, r);
  const children = [];
  while (peek16(r) !== 0) { const [, n, v] = ar.obj(r, 'CAttributeNamed'); children.push([n, v]); }
  r.pos += 2;
  return { k: 'attrs', children };
}

function readAttrNamed(ar, r) {
  preamble(ar, r);
  r.skip(4);
  const name = str(r);
  const entries = {};
  for (;;) {
    const key = str(r);
    if (key === '') break;
    entries[key] = typedValue(r, 0);
  }
  if (ar.lay.attrTail) r.u32();
  return { k: 'dict', name, entries };
}

/** A typed attribute / option value. */
function typedValue(r, depth) {
  const t = r.u8();
  switch (t) {
    case 0x00: return null;
    case 0x04: return r.i32();
    case 0x06: case 0x0c: return r.f64();
    case 0x07: return r.u8();
    case 0x09: return r.u32();
    case 0x0a: return str(r);
    case 0x11: case 0x12: return f64s(r, 3);
    case 0x0b: {
      const n = r.u32();
      if (n > 100000 || depth > 8) throw new Misparse('ccskp.legacy.attr_array', { at: r.pos });
      const a = [];
      for (let i = 0; i < n; i++) a.push(typedValue(r, depth + 1));
      return a;
    }
    default: throw new Misparse('ccskp.legacy.attr_type', { type: t, at: r.pos });
  }
}

function readLayer(ar, r) {
  earlyPreamble(ar, r);
  const name = str(r);
  const mid = [];
  while (mid.length < 8 && !strAt(r.b, r.pos)) mid.push(r.u8());   // flag bytes (3–5); the first is "hidden"
  str(r);                                                           // internal name "Layer_<name>"
  const flags = r.u16();
  if (flags & 0xff) {
    // colour by layer with a TEXTURED material: the layer carries a whole texture block
    const tex = textureBlock(ar, r);
    r.skip(4);
    return { k: 'layer', name, visible: !mid[0], rgba: tex.rgba };
  }
  const rgba = Array.from(r.bytes(4));
  str(r);
  r.skip(ar.lay.v3 ? 17 : 21);
  // v18 zero-material files: 12 zero bytes + u32 before another CLayer
  if (r.pos + 18 <= r.end && r.b.subarray(r.pos, r.pos + 12).every((x) => x === 0) && ar.layerRecordAt(r.pos + 16, true)) r.pos += 16;
  // v18 template Layer0 after a custom tag: <parent u16><active u16> when both name CLayer objects
  const a = u16at(r.b, r.pos), b = u16at(r.b, r.pos + 2);
  if (a > 0 && b > 0 && !(a & 0x8000) && !(b & 0x8000) && a !== 0x7fff && b !== 0x7fff && a !== ar.currentSlot) {
    const ea = ar.slots.get(a), eb = ar.slots.get(b);
    if (ea && eb && ea[0] === 'obj' && eb[0] === 'obj' && ea[1] === 'CLayer' && eb[1] === 'CLayer') r.pos += 2;
  }
  return { k: 'layer', name, visible: !mid[0], rgba };
}

/** A material's texture: embedded image (CDib) + tile size in inches + source name + average colour + opacity.
 * From SketchUp 4 on it is an entity of its own (preamble, then a CDib object); in SketchUp 3 the image follows
 * directly. The caller has read the "has texture" flag as a u16, whose high byte is the preamble's first byte. */
function textureBlock(ar, r) {
  let dib;
  if (ar.lay.v3) dib = readDib(ar, r);
  else {
    r.pos -= 1;
    preamble(ar, r);
    dib = ar.obj(r, 'CDib')[2];
    if (!dib || dib.k !== 'dib') throw new Misparse('ccskp.legacy.texture_image', { at: r.pos });
  }
  const m = find(r.b, STR, r.pos, r.pos + 28);
  if (m - r.pos === 20) r.u32();
  else if (m - r.pos !== 16) throw new Misparse('ccskp.legacy.texture_size', { at: r.pos });
  const w = r.f64(), h = r.f64();
  const file = str(r);
  const avg = r.bytes(9);
  str(r);
  r.skip(8);
  const opacity = r.f64();
  const useOpacity = r.u8();
  return { rgba: Array.from(avg.subarray(0, 4)), opacity, useOpacity, image: dib.data, w, h, file };
}

function readMaterial(ar, r) {
  earlyPreamble(ar, r);
  const name = str(r);
  const texFlag = r.u16();
  if (texFlag === 0) {
    const rgba = Array.from(r.bytes(4));
    str(r);
    r.skip(8);
    const opacity = r.f64();
    const useOpacity = r.u8();
    return { k: 'material', name, rgba, opacity, useOpacity, tex: null };
  }
  const tex = textureBlock(ar, r);
  return { k: 'material', name, rgba: tex.rgba, opacity: tex.opacity, useOpacity: tex.useOpacity, tex };
}

/** CDib: subtype u32, length u32, the image bytes. A JPEG (subtype 1) is followed by a u32 quality (70, 75 …).
 * OpenSKP absorbs that u32 only inside material textures (its "optional u32" before the tile size); in a
 * component's thumbnail nothing did, and every list after a JPEG thumbnail went out of step — the SketchUp 6
 * PCB lost most of its top-level components that way. Found on pimeta-v2-pcb-model-12-v6.skp (ours). */
function readDib(ar, r) {
  const subtype = r.u32();
  const len = r.u32();
  if (len > r.left()) throw new Misparse('ccskp.legacy.image_long', { at: r.pos });
  const data = r.bytes(len);
  if (subtype === 1 && len > 0) r.u32();
  return { k: 'dib', subtype, data };
}

/** Texture positioning: a 3×3 (front) and 3×3 (back) mapping inside 24 doubles, pins, per-side flags. */
function readFtc(ar, r) {
  preamble(ar, r);
  r.u32();
  const ks = f64s(r, 24);
  for (let side = 0; side < 2; side++) {
    const n = r.u32();
    if (n > 64) throw new Misparse('ccskp.legacy.texture_pins', { at: r.pos });
    r.skip(n * 32);
  }
  const ff = r.u32();
  r.u32();
  return { k: 'ftc', front: ks.slice(0, 9), projected: (ff & 2) !== 0 };
}

function readCamera(ar, r) { r.skip(137); r.u16(); str(r); r.skip(33); return { k: 'camera' }; }

function readThumbnail(ar, r) {
  preamble(ar, r);
  if (ar.lay.v3) { r.skip(129); return { k: 'thumbnail' }; }
  ar.obj(r, 'CCamera');
  ar.obj(r, 'CDib');
  return { k: 'thumbnail' };
}

/** An Image entity: placed like an instance of the definition holding its textured face. */
function readImage(ar, r) {
  preamble(ar, r);
  const db = drawbase(ar, r);
  const [def] = ar.obj(r);
  const xf = f64s(r, 12);
  r.f64();
  str(r);
  r.skip(16);
  return { k: 'inst', cls: 'CImage', db, def, xf: [...xf, 1], name: '' };
}

/** A reference to an entity that may point FORWARD (annotations are written before what they label). */
function entityRef(r) {
  const tag = r.u16();
  if (tag === 0) return null;
  if (tag === 0x7fff) {
    const big = r.u32();
    if (big & 0x80000000) throw new Misparse('ccskp.legacy.entity_ref', { at: r.pos });
    return big;
  }
  if (tag === 0xffff || (tag & 0x8000)) throw new Misparse('ccskp.legacy.entity_ref', { at: r.pos });
  return tag;
}

/** A dimension connection's instance paths: [ref][u32 n1][n1 refs][u32 n2][n2 refs]. A path entry is usually
 * a reference, but MFC writes an object in full the first time anything points at it (a whole group, even). */
function connectionPaths(ar, r) {
  entityRef(r);
  for (let k = 0; k < 2; k++) {
    const n = r.u32();
    if (n > 1000) throw new Misparse('ccskp.legacy.dim_path', { at: r.pos });
    for (let i = 0; i < n; i++) {
      const t = peek16(r);
      let isNew = t === 0xffff || (t !== 0x7fff && (t & 0x8000) !== 0);
      if (t === 0x7fff) isNew = (u32at(r.b, r.pos + 2) & 0x80000000) !== 0;
      if (isNew) ar.obj(r); else entityRef(r);
    }
  }
}

function readRelationship(ar, r) { preamble(ar, r); entityRef(r); entityRef(r); return { k: 'rel' }; }

function readConstructionLine(ar, r) {
  preamble(ar, r);
  drawbase(ar, r);
  r.skip(8 * 8);
  // The tail length depends on the build that wrote the file (0, 4 or 7 bytes): calibrate on the first one —
  // the length that lands on an unambiguous next tag — and keep it.
  if (ar.clineTail === null) {
    const dflt = ar.lay.major === 17 ? 7 : 4;
    const order = [dflt, ...[0, 4, 7].filter((c) => c !== dflt)];
    let k = null;
    for (const allowNull of [false, true]) {
      for (const c of order) if (strictTag(ar, r.pos + c, allowNull)) { k = c; break; }
      if (k !== null) break;
    }
    ar.clineTail = k ?? dflt;
  }
  r.skip(ar.clineTail);
  ar.skipped.guides++;
  return { k: 'guide' };
}

function readConstructionPoint(ar, r) {
  preamble(ar, r); drawbase(ar, r); r.skip(48); r.u8();
  ar.skipped.guides++;
  return { k: 'guide' };
}

function readSectionPlane(ar, r) {
  preamble(ar, r);
  drawbase(ar, r);
  r.need(8);
  const first = r.dv.getFloat64(r.pos, true);
  if (!(Math.abs(first) <= 1.0001)) ar.obj(r);      // optional object pointer before the plane
  r.skip(32);
  if (strAt(r.b, r.pos)) { str(r); str(r); }
  ar.skipped.sections++;
  return { k: 'section' };
}

function readSkFont(ar, r) {
  ar.obj(r, 'CAttributeContainer');
  if (ar.lay.pid) r.u8();
  str(r);
  r.skip(15);
  return { k: 'font' };
}

function readDimLinear(ar, r) {
  preamble(ar, r);
  drawbase(ar, r);
  str(r);
  ar.obj(r, 'CSkFont');
  r.skip(37);
  entityRef(r); connectionPaths(ar, r);
  r.skip(32);
  entityRef(r); connectionPaths(ar, r);
  r.skip(72);
  ar.skipped.dims++;
  return { k: 'dim' };
}

function readText(ar, r) {
  preamble(ar, r);
  drawbase(ar, r);
  ar.obj(r, 'CSkFont');
  // variable middle, closed by `01 00 00 00 ?? 00 03 00 00 00 01` right before the text record
  let p = r.pos, at;
  for (;;) {
    at = find(r.b, STR, p, r.pos + 512);
    if (at < 0) throw new Misparse('ccskp.legacy.text_label', { at: r.pos });
    const k = at - 11;
    if (k >= r.pos && u32at(r.b, k) === 1 && r.b[k + 5] === 0 && u32at(r.b, k + 6) === 3 && r.b[k + 10] === 1) break;
    p = at + 3;
  }
  r.pos = at;
  str(r);
  r.skip(5);
  // optional leader attachments in the escaped 6-byte form only (a 2-byte one is indistinguishable from the next tag)
  while (u16at(r.b, r.pos) === 0x7fff && r.pos + 6 <= r.end && !(u32at(r.b, r.pos + 2) & 0x80000000)) r.pos += 6;
  ar.skipped.text++;
  return { k: 'text' };
}

function readEntityList(ar, r, count, owner) {
  const ents = [];
  ar.burnCredits.push(0);
  try {
    while (ents.length < count) {
      const p = r.pos;
      const credit = owner === 'def' && ar.burnCredits[ar.burnCredits.length - 1] > 0;
      // burned indexes also count as phantom list items: the definition tail (nrel = 0, padding, GUID, name
      // record at +22) marks the list's real end
      if (credit && u32at(r.b, p) === 0 && strAt(r.b, p + 22)) break;
      try {
        ents.push(ar.obj(r));
      } catch (e) {
        if (!(e instanceof Misparse)) throw e;
        if (owner === 'root' || credit) { r.pos = p; if (owner === 'root') ar.rootCut = count - ents.length; break; }
        throw e;
      }
    }
  } finally { ar.burnCredits.pop(); }
  return ents;
}

function readDefinition(ar, r) {
  preamble(ar, r);
  r.skip(ar.lay.pid ? 22 : ar.lay.v3 ? 13 : 20);      // undecoded block
  const nl = r.u32();
  if (nl > 10000) throw new Misparse('ccskp.legacy.def_layers', { at: r.pos });
  for (let got = 0; got < nl;) {
    if (peek16(r) === 0) { r.pos += 2; continue; }   // SketchUp 2020 puts null separators between layers
    ar.obj(r, 'CLayer');
    got++;
  }
  if (r.u16() === 0x7fff) r.u32();
  let count = null;
  if (ar.lay.major >= 20) count = retryAfterFiller(ar, r, r.pos, 5_000_000);
  if (count === null) { r.u32(); count = r.u32(); }
  if (count > 5_000_000 || count === 0) { const n = retryAfterFiller(ar, r, r.pos - 4, 5_000_000); if (n !== null) count = n; }
  if (count > 5_000_000) throw new Misparse('ccskp.legacy.def_entities', { at: r.pos });
  const ents = readEntityList(ar, r, count, 'def');
  let nrel = r.u32();
  if (nrel > 100000) { const n = retryAfterFiller(ar, r, r.pos - 4, 100000); if (n !== null) nrel = n; }
  if (nrel > 100000) throw new Misparse('ccskp.legacy.def_misaligned', { at: r.pos });
  for (let i = 0; i < nrel; i++) ar.obj(r, 'CRelationship');
  r.u16();
  // the 16-byte GUID is followed by the name record; SketchUp 2020 can put 2 more bytes before the GUID
  if (!strAt(r.b, r.pos + 16)) {
    for (let s = 1; s <= 4; s++) if (strAt(r.b, r.pos + s + 16)) { r.pos += s; break; }
  }
  const guid = hex(r.bytes(16));
  const name = str(r);
  str(r);
  str(r);
  r.u32();
  // an undecoded block (~39–47 bytes), then this definition's CThumbnail
  let tpos = -1;
  const ts = ar.classSlot.get('CThumbnail');
  for (let off = 0; off < 96; off++) {
    const p = r.pos + off;
    if ((u16at(r.b, p) === 0xffff && u16at(r.b, p + 4) === 10 && asciiAt(r.b, p + 6, 'CThumbnail')) ||
        (ts !== undefined && isClassRef(r.b, p, ts))) { tpos = p; break; }
  }
  if (tpos < 0) throw new Misparse('ccskp.legacy.def_end', { at: r.pos });
  r.pos = tpos;
  ar.obj(r, 'CThumbnail');
  return { k: 'def', name, guid, ents };
}

function readInstance(ar, r) {
  preamble(ar, r);
  const db = drawbase(ar, r);
  const [def, dn] = ar.obj(r, 'CComponentDefinition');
  if (dn !== 'CComponentDefinition') throw new Misparse('ccskp.legacy.inst_not_def', { at: r.pos });
  const xf = f64s(r, 13);
  const name = !ar.lay.v3 || strAt(r.b, r.pos) ? str(r) : '';   // SketchUp 3 instances have no name
  if (ar.lay.instGuid) r.skip(16);
  return { k: 'inst', cls: ar.slots.get(ar.currentSlot)?.[1] || 'CComponentInstance', db, def, xf, name };
}

const READERS = {
  CVertex: readVertex, CEdge: readEdge, CCurve: readCurve, CArcCurve: readArcCurve, CEdgeUse: readEdgeUse,
  CLoop: readLoop, CFace: readFace, CLayer: readLayer, CMaterial: readMaterial, CDib: readDib,
  CAttributeContainer: readAttrContainer, CAttributeNamed: readAttrNamed, CCamera: readCamera,
  CThumbnail: readThumbnail, CRelationship: readRelationship, CComponentDefinition: readDefinition,
  CImage: readImage, CComponentInstance: readInstance, CGroup: readInstance, CFaceTextureCoords: readFtc,
  CConstructionLine: readConstructionLine, CConstructionPoint: readConstructionPoint,
  CSectionPlane: readSectionPlane, CSkFont: readSkFont, CDimensionLinear: readDimLinear, CText: readText,
};

// ── header, version map, document start ─────────────────────────────────────────────────────────────

/** "{6.0.1}" from the second header string, when read.js did not hand us the version. */
function headerVersion(b) {
  let s = '';
  for (let i = 0; i < Math.min(b.length, 0x80); i += 2) { const c = b[i] | (b[i + 1] << 8); s += c >= 32 && c < 127 ? String.fromCharCode(c) : ' '; }
  const m = s.match(/\{(\d+)\.([\d.]*)\}/);
  return m ? m[1] + '.' + m[2] : null;
}

/** CVersionMap: FF FF 00 00 0B 00 "CVersionMap", then (name text, u32 schema) pairs up to End-Of-Version-Map. */
function readVersionMap(b, from) {
  const pat = classRecord('CVersionMap');
  let at = from >= 0 ? find(b, pat, from, from + (1 << 16)) : -1;
  if (at < 0) at = find(b, pat, 0, Math.min(b.length, 1 << 16));
  if (at < 0) return null;
  const r = new Reader(b, at + 6 + 11);
  const schemas = new Map();
  for (let i = 0; i < 500; i++) {
    const name = str(r);
    const v = r.u32();
    if (name === 'End-Of-Version-Map') return { schemas, end: r.pos };
    schemas.set(name, v);
  }
  return null;
}

/** The model thumbnail: a CDib record within a few bytes of the version map's end (SketchUp 6+). */
function readThumbnailImage(b, from) {
  const at = find(b, classRecord('CDib'), from, from + 64);
  if (at < 0) return null;
  try {
    const r = new Reader(b, at + 10);
    r.u32();
    const data = r.bytes(r.u32());
    const mime = sniffImage(data);
    if (mime === 'image/x-dib') return { mime: 'image/bmp', bytes: dibToBmp(data) };
    return mime ? { mime, bytes: data } : null;
  } catch { return null; }
}

function sniffImage(d) {
  if (d.length > 8 && d[0] === 0x89 && d[1] === 0x50 && d[2] === 0x4e && d[3] === 0x47) return 'image/png';
  if (d.length > 3 && d[0] === 0xff && d[1] === 0xd8 && d[2] === 0xff) return 'image/jpeg';
  if (d.length > 2 && d[0] === 0x42 && d[1] === 0x4d) return 'image/bmp';
  if (d.length > 6 && asciiAt(d, 0, 'GIF8')) return 'image/gif';
  if (d.length > 4 && ((d[0] === 0x49 && d[1] === 0x49) || (d[0] === 0x4d && d[1] === 0x4d))) return 'image/tiff';
  if (d.length > 4 && asciiAt(d, 0, '8BPS')) return 'image/vnd.adobe.photoshop';   // SketchUp kept the .psd as is
  if (d.length > 40 && u32at(d, 0) === 40) return 'image/x-dib';          // a bare BITMAPINFOHEADER
  return null;
}

/** A bare Windows DIB (BITMAPINFOHEADER + palette + pixels) → a .bmp file. */
function dibToBmp(d) {
  const bits = u16at(d, 14), clrUsed = u32at(d, 32), comp = u32at(d, 16);
  const palette = (clrUsed || (bits <= 8 ? 1 << bits : 0)) * 4 + (comp === 3 ? 12 : 0);
  const out = new Uint8Array(14 + d.length);
  const dv = new DataView(out.buffer);
  out[0] = 0x42; out[1] = 0x4d;
  dv.setUint32(2, out.length, true);
  dv.setUint32(10, 14 + 40 + palette, true);
  out.set(d, 14);
  return out;
}

/** Display units: the "UnitsOptions" options dictionary → LengthUnit (0 in, 1 ft, 2 mm, 3 cm, 4 m). */
function readUnits(b) {
  const key = [...STR, 12, ...asciiBytes('UnitsOptions').flatMap((c) => [c, 0])];
  const at = find(b, key);
  if (at < 0) return null;
  try {
    const r = new Reader(b, at);
    str(r);
    for (let i = 0; i < 24 && strAt(b, r.pos); i++) {
      const k = str(r);
      const v = typedValue(r, 0);
      if (k === 'LengthUnit') return ['in', 'ft', 'mm', 'cm', 'm'][v] ?? null;
    }
  } catch { /* an options block we don't understand: no unit */ }
  return null;
}

// ── the walk ─────────────────────────────────────────────────────────────────────────────────────────

/** Where the model data starts: the material manager (count u32 right before the first CMaterial class
 * record), or — with no materials — the layer list just before the first CLayer class record. */
function modelStart(b, lay, from) {
  const mat = find(b, classRecord('CMaterial'), from);
  if (mat >= 0) {
    const n = u32at(b, mat - 4);
    if (n > 100000) throw new Misparse('ccskp.legacy.material_count');
    return { start: mat, matCount: n };
  }
  const layer = find(b, classRecord('CLayer'), from);
  if (layer < 0) throw new Misparse('ccskp.legacy.no_lists');
  return { start: layer - (lay.pid ? 9 : 8), matCount: 0 };
}

/** Candidate slot bases. With 2+ materials: read material 1 with a throwaway numbering; material 2's
 * class-ref names CMaterial's true index, which fixes the base exactly. Otherwise read the materials and the
 * layer list with a throwaway base: the next object is an ABSOLUTE back-ref to the active layer, an object
 * we just numbered relatively — one candidate per layer read. */
function slotBases(b, lay, start, matCount) {
  const probe = new Archive(b, lay);
  const B0 = 1 << 20;
  probe.next = probe.base = B0;
  probe.r.pos = start;
  if (matCount >= 2) {
    probe.obj(probe.r, 'CMaterial');
    const t = u16at(b, probe.r.pos);
    if (t === 0xffff || !(t & 0x8000)) throw new Misparse('ccskp.legacy.numbering');
    return [t & 0x7fff];
  }
  for (let i = 0; i < matCount; i++) probe.obj(probe.r, 'CMaterial');
  probe.r.u32();
  if (lay.pid) probe.r.u8();
  let n = 0;
  if (!lay.v3) {
    n = probe.r.u32();
    if (!(n >= 1 && n <= 100000)) throw new Misparse('ccskp.legacy.layer_count');
  }
  const got = [];
  for (let i = 0; i < n; i++) got.push([probe.obj(probe.r, 'CLayer')[0]]);
  probe.trailingLayers(got, true);
  const [s, name] = probe.obj(probe.r);
  if (name !== 'premodel') throw new Misparse('ccskp.legacy.layer_end');
  return got.map(([rel]) => s - (rel - B0)).filter((c) => c > 0 && c < B0);
}

function walkModel(b, lay, start, matCount, base, onDefinition) {
  const ar = new Archive(b, lay);
  ar.next = ar.base = base;
  ar.onDefinition = (slot, v) => onDefinition(ar, slot, v);
  const r = ar.r;
  r.pos = start;
  const materials = [];
  for (let i = 0; i < matCount; i++) { const [s, , v] = ar.obj(r, 'CMaterial'); materials.push([s, v]); }

  // layer list: <u32><u8 if pid><u32 count> — SketchUp 3 writes no count, its records run to the anchor
  r.u32();
  if (lay.pid) r.u8();
  const declared = lay.v3 ? Infinity : r.u32();
  if (declared > 100000 && !lay.v3) throw new Misparse('ccskp.legacy.layer_count');
  const layers = [];
  while (layers.length < declared) {
    const t = peek16(r);
    if (t === 0) { r.pos += 2; continue; }          // SketchUp 2020 separators
    if (t !== 0xffff && !(t & 0x8000)) break;        // a back-ref: the definition-list anchor
    const [s, , v] = ar.obj(r, 'CLayer');
    if (v) layers.push([s, v]);
  }
  ar.trailingLayers(layers);

  // definition list: a reference to the ACTIVE layer, then the count
  const [, an] = ar.obj(r);
  if (an !== 'CLayer') throw new Misparse('ccskp.legacy.def_list');
  let nd = r.u32();
  if (nd > 1_000_000) { const n = retryAfterFiller(ar, r, r.pos - 4, 1_000_000); if (n !== null) nd = n; }
  if (nd > 1_000_000) throw new Misparse('ccskp.legacy.def_count');
  for (let i = 0; i < nd; i++) ar.obj(r, 'CComponentDefinition');
  // definitions written back to back past the count
  for (;;) {
    const ds = ar.classSlot.get('CComponentDefinition');
    const t = u16at(b, r.pos);
    const isDef = (ds !== undefined && t === (0x8000 | ds)) || (t === 0xffff && asciiAt(b, r.pos + 6, 'CComponentDefinition'));
    if (!isDef) break;
    ar.obj(r);
  }

  // the model's own entity list
  let nr = r.u32();
  if (nr > 5_000_000) { const n = retryAfterFiller(ar, r, r.pos - 4, 5_000_000); if (n !== null) nr = n; }
  if (nr > 5_000_000) throw new Misparse('ccskp.legacy.entity_count');
  const root = readEntityList(ar, r, nr, 'root');
  return { ar, materials, layers, root, rootDeclared: nr };
}

// ── turning walked objects into the spec's model ───────────────────────────────────────────────────

/** Definitions' entity objects are no longer needed once the definition is built: swap them for one shared
 * placeholder per class so later back-refs still type-check while the objects can be collected. */
const RELEASED = new Set(['CVertex', 'CEdge', 'CEdgeUse', 'CLoop', 'CFace']);

/** Build one entity list into raw geometry (store-map indexes for materials/layers/definitions, resolved later). */
function buildEntities(ar, ents, stats) {
  const point = (s) => ar.slots.get(s)?.[2]?.p || null;
  const faces = [], insts = [], edges = new Map(), used = new Set();
  const addEdge = (s, e) => { if (!edges.has(s)) edges.set(s, e); };
  for (const [s, , v] of ents) {
    if (!v) continue;
    if (v.k === 'edge') addEdge(s, v);
    else if (v.k === 'inst') insts.push(v);
    else if (v.k === 'face') {
      const loops = [];
      for (const lp of v.loops) {
        if (!lp) continue;
        const pts = [];
        let prev = null;
        for (const u of lp.uses) {
          const e = u && ar.slots.get(u.edge)?.[2];
          if (!e || e.k !== 'edge') continue;
          addEdge(u.edge, e);
          used.add(u.edge);
          const vs = u.sense ? e.v2 : e.v1;   // the use runs v1 → v2, or reversed
          if (vs !== prev) { const p = point(vs); if (p) { pts.push(p); prev = vs; } }
        }
        if (pts.length > 1 && pts[0] === pts[pts.length - 1]) pts.pop();
        if (pts.length >= 3) loops.push(pts);
      }
      if (!loops.length) { stats.badFaces++; continue; }
      faces.push({ loops, plane: v.plane, front: v.db.mat || null, back: v.back || null, layer: v.db.layer, hidden: v.db.hidden, ftc: v.ftc });
    }
  }
  const loose = [], soft = [];
  for (const [s, e] of edges) {
    const a = point(e.v1), b = point(e.v2);
    if (!a || !b) continue;
    if (!used.has(s)) loose.push({ a, b, layer: e.db.layer, soft: e.db.soft, smooth: e.db.smooth, hidden: e.db.hidden });
    else if (e.db.soft || e.db.smooth) soft.push([a, b]);
  }
  return { faces, edges: loose, soft, insts };
}

/** SketchUp's 13 doubles → column-major 4×4. The first nine are the 3×3 part ROW by row (x' = m0·x + m1·y +
 * m2·z + m9, as OpenSKP reads it; checked on gondola_v20.skp, whose rotated components meet their neighbours'
 * vertices only this way round), then the translation, then w. w is 1 in every file we have; we treat it as
 * the homogeneous divisor. */
function matrixOf(xf) {
  const w = okNum(xf[12]) && Math.abs(xf[12]) > 1e-12 ? xf[12] : 1;
  const m = [xf[0], xf[3], xf[6], 0, xf[1], xf[4], xf[7], 0, xf[2], xf[5], xf[8], 0, xf[9], xf[10], xf[11], w];
  if (!m.every(okNum)) return null;
  if (w !== 1) { for (let i = 0; i < 15; i++) m[i] /= w; m[15] = 1; }
  return m;
}

/** Texture coordinates for a face's loops (OpenSKP's recipe): plane basis xr = Z × n, yr = n × xr; untouched
 * textures project straight onto it, positioned ones go through the inverse of their 3×3 mapping. */
function faceUv(loops, n, ftc, tileW, tileH) {
  const [nx, ny, nz] = n;
  let xr, yr;
  const cl = Math.hypot(nx, ny);
  if (cl < 1e-9) { xr = [1, 0, 0]; yr = [0, nz >= 0 ? 1 : -1, 0]; }
  else { xr = [-ny / cl, nx / cl, 0]; yr = [-nz * xr[1], nz * xr[0], nx * xr[1] - ny * xr[0]]; }
  let inv = null;
  if (ftc) {
    const [a, b, c, d, e, f, g, h, i] = ftc.front;
    const det = a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g);
    if (Number.isFinite(det) && Math.abs(det) > 1e-12) {
      const k = 1 / det;
      inv = [(e * i - f * h) * k, (c * h - b * i) * k, (b * f - c * e) * k, (f * g - d * i) * k, (a * i - c * g) * k,
        (c * d - a * f) * k, (d * h - e * g) * k, (b * g - a * h) * k, (a * e - b * d) * k];
    }
  }
  const tw = okNum(tileW) && tileW > 1e-9 ? tileW : 1, th = okNum(tileH) && tileH > 1e-9 ? tileH : 1;
  return loops.map((pts) => pts.map((p) => {
    const px = p[0] * xr[0] + p[1] * xr[1] + p[2] * xr[2];
    const py = p[0] * yr[0] + p[1] * yr[1] + p[2] * yr[2];
    if (!inv) return [px / tw, py / th];
    let q = px * inv[2] + py * inv[5] + inv[8];
    if (Math.abs(q) < 1e-12) q = 1;
    return [(px * inv[0] + py * inv[3] + inv[6]) / q / tw, (px * inv[1] + py * inv[4] + inv[7]) / q / th];
  }));
}

/** Newell normal of a loop (for checking orientation against the stored plane). */
function newell(pts) {
  let x = 0, y = 0, z = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    x += (a[1] - b[1]) * (a[2] + b[2]); y += (a[2] - b[2]) * (a[0] + b[0]); z += (a[0] - b[0]) * (a[1] + b[1]);
  }
  return [x, y, z];
}

const WEB_IMAGES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/bmp']);

// ── entry point ──────────────────────────────────────────────────────────────────────────────────────

export async function readLegacy(bytes, header = {}, opts = {}) {
  if (!(bytes instanceof Uint8Array)) throw new SkpError('not_skp', msg('ccskp.not_skp'));
  if (bytes.length > LIMITS.fileBytes) throw new SkpError('too_big', msg('ccskp.too_big.file', { size: '1 GB' }));
  const step = (f) => {
    if (opts.signal?.aborted) throw opts.signal.reason ?? new Error('aborted');   // i18n-ignore: diagnostic (an abort, not shown)
    try { opts.onProgress?.({ stage: 'legacy', done: Math.round(f * 100), total: 100 }); } catch { /* a progress callback never stops the read */ }
  };
  try {
    return read(bytes, header || {}, step);
  } catch (e) {
    if (e instanceof SkpError) throw e;
    if (opts.signal?.aborted && e === opts.signal.reason) throw e;
    if (e instanceof Misparse) throw new SkpError('damaged', msg('ccskp.legacy.failed', { reason: e.message }));
    if (e instanceof RangeError && /call stack/i.test(e.message)) throw new SkpError('too_big', msg('ccskp.too_big.stack'));
    throw new SkpError('damaged', msg('ccskp.legacy.failed_internal', { reason: e?.message || String(e) }));
  }
}

function read(b, header, step) {
  step(0);
  const version = typeof header.version === 'string' && /^\d+(\.\d+)*$/.test(header.version) ? header.version : headerVersion(b);
  const major = Number.isInteger(header.major) ? header.major : parseInt(version ?? '', 10);
  if (!Number.isInteger(major)) throw new SkpError('not_skp', msg('ccskp.legacy.no_version'));
  if (major < 3) throw new SkpError('unsupported', msg('ccskp.legacy.too_old', { major }));
  if (major > 20) throw new SkpError('unsupported', msg('ccskp.legacy.unknown_major', { major }));

  const vmap = readVersionMap(b, Number.isInteger(header.bodyStart) ? header.bodyStart : -1);
  if (!vmap) throw new SkpError('damaged', msg('ccskp.damaged', { reason: msg('ccskp.damaged.no_version_map') }));
  const lay = layoutFor(major, vmap.schemas);
  const thumbnail = readThumbnailImage(b, vmap.end);
  const { start, matCount } = modelStart(b, lay, vmap.end);

  // Build each definition as soon as its record completes, then release its entity objects.
  const built = new Map();     // definition slot → { name, guid, faces, edges, soft, insts }
  const stats = { badFaces: 0 };
  const onDefinition = (ar, slot, v) => {
    const g = buildEntities(ar, v.ents, stats);
    built.set(slot, { name: v.name, guid: v.guid, ...g });
    v.ents = null;
    for (let k = slot + 1; k < ar.next; k++) {
      const e = ar.slots.get(k);
      if (e && e[0] === 'obj' && e[2] !== null && RELEASED.has(e[1])) ar.slots.set(k, ['obj', e[1], null]);
    }
  };

  let walked = null, last = null;
  for (const base of slotBases(b, lay, start, matCount)) {
    built.clear();
    stats.badFaces = 0;
    try { walked = walkModel(b, lay, start, matCount, base, onDefinition); break; }
    catch (e) { if (!(e instanceof Misparse)) throw e; last = e; }
  }
  if (!walked) throw last || new Misparse('ccskp.legacy.no_numbering');
  step(0.8);
  const { ar, root } = walked;
  const rootBuilt = buildEntities(ar, root, stats);

  // materials (spec order = file order), keyed by store-map index
  const matIndex = new Map();
  let badTextures = 0;
  const materials = walked.materials.map(([s, v], i) => {
    matIndex.set(s, i);
    // the stored double is a transparency gated by the use-flag (OpenSKP); alpha = 1 − it
    const alpha = v.useOpacity ? Math.min(1, Math.max(0, 1 - v.opacity)) : 1;
    let texture = null;
    if (v.tex && v.tex.image?.length) {
      let mime = sniffImage(v.tex.image), data = v.tex.image;
      if (mime === 'image/x-dib') { mime = 'image/bmp'; data = dibToBmp(data); }
      if (!WEB_IMAGES.has(mime)) badTextures++;
      texture = { name: (v.tex.file || v.name).split(/[\\/]/).pop() || v.name, mime: mime || 'application/octet-stream', bytes: data,
        width: okNum(v.tex.w) ? v.tex.w : 1, height: okNum(v.tex.h) ? v.tex.h : 1 };
    }
    return { name: v.name, color: v.rgba ? v.rgba.slice(0, 3) : null, alpha, texture };
  });

  // layers: Layer0 first (spec: index 0 = Layer0 / Untagged)
  let layerList = walked.layers.slice();
  const l0 = layerList.findIndex(([, v]) => v.name === 'Layer0');
  if (l0 > 0) layerList.unshift(...layerList.splice(l0, 1));
  const layers = layerList.map(([, v]) => ({ name: v.name, visible: v.visible, color: v.rgba ? v.rgba.slice(0, 3) : null }));
  if (l0 < 0) { layers.unshift({ name: 'Layer0', visible: true, color: null }); layerList.unshift([null, null]); }
  const layerIndex = new Map(layerList.map(([s], i) => [s, i]));
  const L = (s) => (s === null || s === undefined ? 0 : layerIndex.get(s) ?? 0);

  // definitions: the model first, then every definition in file order
  const defSlots = [...built.keys()].sort((x, y) => x - y);
  const defIndex = new Map(defSlots.map((s, i) => [s, i + 1]));
  const kindOf = new Map();
  for (const g of [rootBuilt, ...built.values()]) {
    for (const it of g.insts) {
      const k = it.cls === 'CGroup' ? 'group' : it.cls === 'CImage' ? 'image' : 'component';
      if (!kindOf.has(it.def) || k !== 'component') kindOf.set(it.def, k);
    }
  }
  const counts = { unknownMat: 0, badInst: 0, projected: 0, textured: 0, flipped: 0 };
  const M = (s) => {
    if (!s) return null;
    const i = matIndex.get(s);
    if (i === undefined) { counts.unknownMat++; return null; }
    return i;
  };
  const toDef = (g, name, kind, guid) => ({
    name, kind, guid,
    faces: g.faces.map((f) => {
      // keep SketchUp's front side: outer loop counter-clockwise seen along the stored plane normal
      const n = f.plane.slice(0, 3);
      const nn = newell(f.loops[0]);
      if (nn[0] * n[0] + nn[1] * n[1] + nn[2] * n[2] < 0) { counts.flipped++; }
      const front = M(f.front);
      const tex = front !== null ? materials[front].texture : null;
      let uv = null;
      if (tex) {
        counts.textured++;
        if (f.ftc?.projected) counts.projected++;
        uv = faceUv(f.loops, n, f.ftc, tex.width, tex.height);
      }
      const out = { loops: f.loops, front, back: M(f.back), layer: L(f.layer), uv };
      if (f.hidden) out.hidden = true;
      return out;
    }),
    edges: g.edges.map((e) => ({ a: e.a, b: e.b, layer: L(e.layer), soft: e.soft, smooth: e.smooth, hidden: e.hidden })),
    soft: g.soft,
    insts: g.insts.flatMap((it) => {
      const d = defIndex.get(it.def);
      const m = matrixOf(it.xf);
      if (d === undefined || !m) { counts.badInst++; return []; }
      return [{ def: d, m, name: it.name || '', layer: L(it.db.layer), hidden: it.db.hidden, material: M(it.db.mat) }];
    }),
  });
  const defs = [toDef(rootBuilt, 'Model', 'model', null)];
  for (const s of defSlots) {
    const g = built.get(s);
    defs.push(toDef(g, g.name, kindOf.get(s) || 'component', g.guid || null));
  }
  step(0.95);

  // notes: one line per kind of thing skipped
  const notes = [];
  const sk = ar.skipped;
  if (sk.text) notes.push(msg('ccskp.note.text_labels', { n: sk.text }));
  if (sk.dims) notes.push(msg('ccskp.note.dimensions', { n: sk.dims }));
  if (sk.sections) notes.push(msg('ccskp.note.section_planes', { n: sk.sections }));
  if (sk.guides) notes.push(msg('ccskp.note.guides', { n: sk.guides }));
  if (stats.badFaces) notes.push(msg('ccskp.note.face_corners', { n: stats.badFaces }));
  if (counts.badInst) notes.push(msg('ccskp.note.inst_broken', { n: counts.badInst }));
  if (counts.unknownMat) notes.push(msg('ccskp.note.material_unknown', { n: counts.unknownMat }));
  if (badTextures) notes.push(msg('ccskp.note.texture_format', { n: badTextures }));
  if (counts.projected) notes.push(msg('ccskp.note.texture_projected', { n: counts.projected }));
  if (counts.flipped) notes.push(msg('ccskp.note.face_flipped', { n: counts.flipped }));
  if (ar.rootCut) notes.push(msg('ccskp.note.root_cut', { n: ar.rootCut }));
  if (lay.v3) notes.push(msg('ccskp.note.v3'));
  notes.push(msg('ccskp.note.not_read'));

  const nFaces = defs.reduce((s, d) => s + d.faces.length, 0);
  const nEdges = defs.reduce((s, d) => s + d.edges.length, 0);
  const nInsts = defs.reduce((s, d) => s + d.insts.length, 0);
  step(1);
  return {
    format: 'skp',
    container: 'legacy',
    version: version || String(major),
    major,
    materials,
    layers,
    defs,
    root: 0,
    thumbnail,
    units: { length: readUnits(b) },
    notes,
    counts: { defs: defs.length, faces: nFaces, edges: nEdges, insts: nInsts, materials: materials.length, layers: layers.length },
  };
}

