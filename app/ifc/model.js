/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its errors are English (an app translates what it shows). */
/**
 * model.js — one open IFC file: the bytes, the instance index (step.js scanStep), lines parsed on first read, edits kept
 * beside the original bytes, and saving. DOM-free.
 *
 *   const m = IfcFile.open(bytes)          or new IfcFile(bytes, scanStep(bytes))  (open-async.js scans in a Worker)
 *   m.schema                                Schema (schema.js); m.schemaName 'IFC2X3' | 'IFC4' | 'IFC4X3'
 *   m.type(id)                              'IFCWALL' (upper case) or null when there is no such line
 *   m.params(id)                            raw parameter list (step.js values); do not mutate — write a copy back
 *   m.ids()                                 every live id, file order then new ones
 *   m.ofType('IFCWALL', inherited)          ids of that entity (and its subtypes)
 *   m.set(id, 'IFCWALL', params)            write a line (a new id or a replacement; the type may change)
 *   m.add('IFCWALL', params) → id           a new line at maxId + 1
 *   m.remove(id)                            the line is gone (references to it stay as written)
 *   m.save() → Uint8Array                   the file: untouched lines copied byte for byte, changed ones written anew
 *   m.refsTo(id) / m.inverse(type, attr)    who points at a line (built on demand, rebuilt after edits)
 *
 * A complex instance "(A(..)B(..))" is typed '' and its parts are read with m.complex(id).
 */

import { scanStep, parseParams, parseComplex, formatValue, formatString } from './step.js';
import { schemaFor } from './schema.js';

const enc = typeof TextEncoder !== 'undefined' ? new TextEncoder() : null;
const CACHE_MAX = 250000;

export class IfcFile {
  static open(bytes) {
    const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    return new IfcFile(b, scanStep(b));
  }

  constructor(bytes, ix) {
    this.bytes = bytes;
    this.ix = ix;
    this.header = ix.header;
    this.schema = schemaFor(ix.schema);
    this.schemaName = this.schema.name;
    this.fileSchema = ix.schema;
    this.errors = ix.errors || [];
    this.maxId = ix.maxId;
    this.edits = new Map();      // id → { type, params } (written lines, new or replacing)
    this.gone = new Set();       // removed ids
    this.cache = new Map();      // id → parsed params of original lines
    this.version = 0;            // bumps on every write: derived indexes check it
    // id → record index
    const n = ix.count;
    if (ix.maxId <= n * 4 + 1000000) {
      this.slot = new Int32Array(ix.maxId + 1).fill(-1);
      for (let i = 0; i < n; i++) this.slot[ix.ids[i]] = i;
      this.rec = (id) => (id >= 0 && id < this.slot.length ? this.slot[id] : -1);
    } else {
      const m = new Map();
      for (let i = 0; i < n; i++) m.set(ix.ids[i], i);
      this.rec = (id) => m.get(id) ?? -1;
    }
    this.byType = null;          // type name → [ids] of original lines (built on first use)
  }

  // ---- reading ----

  has(id) { return this.type(id) !== null; }

  type(id) {
    if (this.gone.has(id)) return null;
    const e = this.edits.get(id);
    if (e) return e.type;
    const r = this.rec(id);
    return r < 0 ? null : this.ix.names[this.ix.types[r]];
  }

  params(id) {
    if (this.gone.has(id)) return null;
    const e = this.edits.get(id);
    if (e) return e.params;
    let p = this.cache.get(id);
    if (p) return p;
    const r = this.rec(id);
    if (r < 0) return null;
    const ix = this.ix;
    if (ix.types[r] === 0) return null;   // complex: use complex(id)
    p = parseParams(this.bytes, ix.starts[r], ix.ends[r]);
    if (this.cache.size >= CACHE_MAX) this.cache.clear();
    this.cache.set(id, p);
    return p;
  }

  /** The parts of a complex instance: [{ type, params }]; null for a plain one. */
  complex(id) {
    if (this.gone.has(id) || this.edits.has(id)) return null;
    const r = this.rec(id);
    if (r < 0 || this.ix.types[r] !== 0) return null;
    return parseComplex(this.bytes, this.ix.starts[r], this.ix.ends[r]);
  }

  *ids() {
    const ix = this.ix;
    for (let i = 0; i < ix.count; i++) { const id = ix.ids[i]; if (!this.gone.has(id) && (!this.edits.has(id) || this.rec(id) === i)) yield id; }
    for (const id of this.newIds()) yield id;
  }

  newIds() { return [...this.edits.keys()].filter((id) => this.rec(id) < 0).sort((a, b) => a - b); }

  get count() { let n = 0; for (const _ of this.ids()) n++; return n; }

  indexTypes() {
    if (this.byType) return this.byType;
    const ix = this.ix, lists = new Array(ix.names.length);
    for (let t = 0; t < lists.length; t++) lists[t] = [];
    for (let i = 0; i < ix.count; i++) lists[ix.types[i]].push(ix.ids[i]);
    this.byType = new Map(ix.names.map((n, t) => [n, lists[t]]));
    return this.byType;
  }

  /** Ids of one entity type (upper case); inherited = its subtypes too. File order within each type. */
  ofType(up, inherited = false) {
    const types = inherited ? this.schema.subtypes(up) : [up];
    const byType = this.indexTypes();
    const out = [];
    const want = new Set(types);
    for (const t of types) for (const id of byType.get(t) || []) if (!this.gone.has(id) && !this.edits.has(id)) out.push(id);
    for (const [id, e] of this.edits) if (want.has(e.type)) out.push(id);
    if (types.length > 1 || this.edits.size) out.sort((a, b) => a - b);
    return out;
  }

  /** Every entity type present (upper case) with its count. */
  typesPresent() {
    const byType = this.indexTypes(), out = new Map();
    for (const [t, ids] of byType) { if (!t) continue; let n = 0; for (const id of ids) if (!this.gone.has(id) && !this.edits.has(id)) n++; if (n) out.set(t, n); }
    for (const e of this.edits.values()) out.set(e.type, (out.get(e.type) || 0) + 1);
    return out;
  }

  /** Attribute value of a line by name (raw). */
  attr(id, name) {
    const t = this.type(id);
    const e = t && this.schema.entity(t);
    if (!e) return undefined;
    const k = e.index.get(name);
    return k === undefined ? undefined : this.params(id)?.[k];
  }

  // ---- inverse references ----

  /** id → [ids of lines that reference it] (every attribute, any depth). Built once per version. */
  refIndex() {
    if (this.refs && this.refsVersion === this.version) return this.refs;
    const refs = new Map();
    const walk = (v, from) => {
      if (!v || typeof v !== 'object') return;
      if (Array.isArray(v)) { for (const x of v) walk(x, from); return; }
      if (v.ref !== undefined) { let a = refs.get(v.ref); if (!a) refs.set(v.ref, (a = [])); a.push(from); return; }
      if (v.typed !== undefined) walk(v.value, from);
    };
    for (const id of this.ids()) {
      const p = this.params(id);
      if (p) walk(p, id);
      else { const parts = this.complex(id); if (parts) for (const q of parts) walk(q.params, id); }
    }
    this.refs = refs;
    this.refsVersion = this.version;
    return refs;
  }

  refsTo(id) { return this.refIndex().get(id) || []; }

  /**
   * Relations of one entity type keyed by the target of one attribute: inverse('IFCRELDEFINESBYPROPERTIES',
   * 'RelatedObjects') → Map(element id → [relation ids]). Cached per version.
   */
  inverse(up, attrName, inherited = true) {
    const key = up + '.' + attrName + (inherited ? '+' : '');
    this.inv = this.inv && this.invVersion === this.version ? this.inv : new Map();
    this.invVersion = this.version;
    let m = this.inv.get(key);
    if (m) return m;
    m = new Map();
    for (const id of this.ofType(up, inherited)) {
      const v = this.attr(id, attrName);
      const add = (x) => { if (x && x.ref !== undefined) { let a = m.get(x.ref); if (!a) m.set(x.ref, (a = [])); a.push(id); } };
      if (Array.isArray(v)) v.forEach(add); else add(v);
    }
    this.inv.set(key, m);
    return m;
  }

  /**
   * 0.10 PERF.37: inverse() in slices that give the page back (`yieldFn` is async, called about every `sliceMs`), so the index is built after the
   * model is open and the first property lookup finds it. Same map as inverse(); when the file was edited meanwhile the result is not stored.
   */
  async inverseAsync(up, attrName, { inherited = true, yieldFn = null, sliceMs = 10 } = {}) {
    const key = up + '.' + attrName + (inherited ? '+' : '');
    if (this.inv && this.invVersion === this.version && this.inv.has(key)) return this.inv.get(key);
    const v0 = this.version, now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
    const m = new Map();
    let t0 = now(), n = 0;
    for (const id of this.ofType(up, inherited)) {
      const v = this.attr(id, attrName);
      const add = (x) => { if (x && x.ref !== undefined) { let a = m.get(x.ref); if (!a) m.set(x.ref, (a = [])); a.push(id); } };
      if (Array.isArray(v)) v.forEach(add); else add(v);
      if (yieldFn && (++n & 63) === 0 && now() - t0 >= sliceMs) { await yieldFn(); t0 = now(); }
    }
    if (this.version !== v0) return this.inverse(up, attrName, inherited);   // edited while it was built: the cheap, current answer
    this.inv = this.inv && this.invVersion === this.version ? this.inv : new Map();
    this.invVersion = this.version;
    if (!this.inv.has(key)) this.inv.set(key, m);
    return this.inv.get(key);
  }

  // ---- writing ----

  set(id, type, params) {
    id = Number(id);
    if (!Number.isInteger(id) || id <= 0) throw new Error('A line id must be a positive whole number.');
    const up = String(type).toUpperCase();
    this.gone.delete(id);
    this.edits.set(id, { type: up, params });
    this.cache.delete(id);
    if (id > this.maxId) this.maxId = id;
    this.version++;
    return id;
  }

  add(type, params) { return this.set(this.maxId + 1, type, params); }

  remove(id) {
    if (!this.has(id)) return false;
    this.edits.delete(id);
    this.cache.delete(id);
    if (this.rec(id) >= 0) this.gone.add(id);
    this.version++;
    return true;
  }

  get dirty() { return this.edits.size > 0 || this.gone.size > 0; }

  /** Is a bare number at this attribute position a REAL? */
  realAt(type, k) {
    const e = this.schema.entity(type);
    const a = e && e.attrs[k];
    return a ? a.t.base === 'r' || a.t.base === 'n' : false;
  }

  /** "#id=TYPE(…);" for a written line. */
  formatLine(id, type, params) {
    const sch = this.schema;
    const realType = (n) => sch.isRealType(n);
    const parts = params.map((v, k) => formatValue(v, () => this.realAt(type, k), realType));
    return '#' + id + '=' + type + '(' + parts.join(',') + ');';
  }

  /** The whole file as bytes. Untouched lines are copied exactly; the header is kept (FILE_NAME time stamp renewed). */
  save(opts = {}) {
    const chunks = [];
    let size = 0;
    for (const c of this.saveParts(opts)) { chunks.push(c); size += c.length; }
    if (chunks.length === 1) return chunks[0].slice();
    const out = new Uint8Array(size);
    let o = 0;
    for (const c of chunks) { out.set(c, o); o += c.length; }
    return out;
  }

  /**
   * 0.11 PERF.23: save() as a run of byte ranges, in file order (the same bytes save() returns). Untouched lines that the file already holds in
   * the form save() writes ("#id=TYPE(...);" and a line feed) come out as ONE view of the opened bytes per run of such lines, not three pieces a
   * line (115 MB: 1.8 M lines); any other line is written as before. The ranges are views of `bytes`: write them out before the next edit.
   */
  *saveParts({ timeStamp = new Date().toISOString().slice(0, 19) } = {}) {
    yield enc.encode('ISO-10303-21;\nHEADER;\n' + this.headerText(timeStamp) + 'ENDSEC;\nDATA;\n');
    const ix = this.ix, b = this.bytes, NL = new Uint8Array([10]);
    const noEdits = !this.gone.size && !this.edits.size;
    let r0 = -1, r1 = -1;   // the run of verbatim lines being gathered: [r0, r1)
    for (let i = 0; i < ix.count; i++) {
      const id = ix.ids[i];
      if (!noEdits) {
        if (this.gone.has(id)) continue;
        const e = this.edits.get(id);
        if (e) {
          if (this.rec(id) === i) { if (r0 >= 0) { yield b.subarray(r0, r1); r0 = -1; } yield enc.encode(this.formatLine(id, e.type, e.params) + '\n'); }
          continue;
        }
      }
      const t = ix.names[ix.types[i]], s = ix.starts[i], end = ix.ends[i];
      const h = verbatimStart(b, s, end, id, t);
      if (h >= 0) {
        if (r0 >= 0 && h === r1) { r1 = end + 2; continue; }
        if (r0 >= 0) yield b.subarray(r0, r1);
        r0 = h; r1 = end + 2;
        continue;
      }
      if (r0 >= 0) { yield b.subarray(r0, r1); r0 = -1; }
      yield enc.encode('#' + id + '=' + t);
      yield b.subarray(s, end + 1);
      yield NL;
    }
    if (r0 >= 0) yield b.subarray(r0, r1);
    let tail = '';
    for (const id of this.newIds()) { const e = this.edits.get(id); tail += this.formatLine(id, e.type, e.params) + '\n'; }
    yield enc.encode(tail + 'ENDSEC;\nEND-ISO-10303-21;\n');
  }

  /**
   * 0.11 PERF.23: save() into a writer, range by range, without the whole file in one more buffer: `write(u8)` may return a promise (a
   * FileSystemWritableFileStream's write, a Node stream wrapped in one). Ranges are gathered up to `chunk` bytes (default 8 MB) before a write.
   * → bytes written.
   */
  async saveTo(write, { chunk = 8 << 20, ...opts } = {}) {
    let buf = [], n = 0, total = 0;
    const flush = async () => {
      if (!buf.length) return;
      let out = buf[0];
      if (buf.length > 1) { out = new Uint8Array(n); let o = 0; for (const c of buf) { out.set(c, o); o += c.length; } }
      else out = out.slice();
      buf = []; n = 0;
      await write(out);
    };
    for (const c of this.saveParts(opts)) {
      total += c.length;
      if (c.length >= chunk) { await flush(); await write(c.slice()); continue; }
      buf.push(c); n += c.length;
      if (n >= chunk) await flush();
    }
    await flush();
    return total;
  }

  headerText(timeStamp) {
    const h = this.header.raw || {};
    const desc = h.FILE_DESCRIPTION || [['ViewDefinition [CoordinationView]'], '2;1'];
    const name = (h.FILE_NAME || ['', '', [''], [''], '', '', '']).slice();
    if (timeStamp) name[1] = timeStamp;
    const schema = h.FILE_SCHEMA || [[this.fileSchema || this.schemaName]];
    const f = (v) => formatValue(v);
    let out = 'FILE_DESCRIPTION(' + desc.map(f).join(',') + ');\n';
    out += 'FILE_NAME(' + name.map(f).join(',') + ');\n';
    out += 'FILE_SCHEMA(' + schema.map(f).join(',') + ');\n';
    for (const [k, v] of Object.entries(h)) if (!['FILE_DESCRIPTION', 'FILE_NAME', 'FILE_SCHEMA'].includes(k)) out += k + '(' + v.map(f).join(',') + ');\n';
    return out;
  }
}

/**
 * Where record (id, keyword t, "(" at s, ";" at end) starts when the file holds it exactly as save() writes it: "#<id>=<t>" right before s and a
 * line feed right after the ";" (→ the "#"'s offset), else -1 (spaces, lower case, a CR LF file, a comment between: save() normalises those).
 */
function verbatimStart(b, s, end, id, t) {
  if (b[end + 1] !== 10) return -1;
  let p = s - 1;
  for (let k = t.length - 1; k >= 0; k--, p--) if (b[p] !== t.charCodeAt(k)) return -1;
  if (b[p] !== 61) return -1;   // '='
  p--;
  let n = id;
  do { if (b[p] !== 48 + (n % 10)) return -1; n = Math.floor(n / 10); p--; } while (n > 0);
  return b[p] === 35 && (p === 0 || b[p - 1] !== 35) ? p : -1;   // '#'
}

export { formatString };
