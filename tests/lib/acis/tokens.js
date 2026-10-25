/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tokens.js — SAT text and SAB bytes → one list of records (cc-acis, docs/ACIS-READER.md § 2). No DOM, no imports.
 *
 *   tokenize(input) → { ok, format, version, product, acisVersion, mmPerUnit, records, subtypes, history, cut, why }
 *
 * A record is { name, f } — name the save identifier joined with '-' ('plane-surface'), f its fields in order:
 *   number (int or real) · Ptr (a pointer: .i, −1 = none) · string (a word, an @-string, a SAB string) · true / false
 *   (a SAB logical) · [x, y, z] (a SAB position or vector) · OPEN / CLOSE (subtype braces; OPEN carries .n, its subtype
 *   number in file order).
 * `subtypes[n]` = { rec, at } (the record index and the field index of its OPEN) for `{ ref n }`.
 * Reading never throws: a damaged or cut-off file gives the records read so far, `cut: true` and why (a message key).
 */

export class Ptr { constructor(i) { this.i = i; } }
export const OPEN = { kind: 'open' }, CLOSE = { kind: 'close' };
/** a subtype start with its number (one object per subtype, so the number travels with it) */
class Open { constructor(n) { this.n = n; } }
export const isOpen = (t) => t instanceof Open;
export const isClose = (t) => t === CLOSE;

export const LIMITS = {
  bytes: 64 * 1024 * 1024,     // one solid's SAT/SAB
  records: 2000000,
  fields: 1000000,             // fields in one record (subtype data included)
  depth: 32,                   // subtype nesting
  string: 65536,
};

const END = /^End-of-(ACIS|ASM)-data$/;
const HISTORY = /^Begin-of-(ACIS|ASM)-History-Data$/;

export function tokenize(input) {
  let bytes = null, text = null;
  if (typeof input === 'string') text = input;
  else if (input instanceof Uint8Array) bytes = input;
  else return fail('ccacis.why.no_data');
  if (bytes && isSabHead(bytes)) return sab(bytes);
  if (bytes) {
    if (bytes.length > LIMITS.bytes) return fail('ccacis.why.too_big');
    text = latin1(bytes);
  }
  if (text.length > LIMITS.bytes) return fail('ccacis.why.too_big');
  return sat(text);
}

function fail(why) { return { ok: false, records: [], subtypes: [], why }; }

export function isSabHead(b) {
  if (b.length < 15) return false;
  const h = latin1(b.subarray(0, 15));
  return h === 'ACIS BinaryFile' || h === 'ASM BinaryFile4';
}

function latin1(b) {
  let s = '';
  for (let i = 0; i < b.length; i += 0x8000) s += String.fromCharCode.apply(null, b.subarray(i, i + 0x8000));
  return s;
}

// ---------------------------------------------------------------------------------------------------------------------
// SAT text

function sat(s) {
  const n = s.length;
  let p = 0;
  const out = { ok: true, format: 'sat', records: [], subtypes: [], history: false, cut: false, why: null };
  const ws = (c) => c === 32 || c === 9 || c === 10 || c === 13 || c === 12 || c === 11;
  const skipWs = () => { while (p < n && ws(s.charCodeAt(p))) p++; };
  /** the next white-space separated word ({ } # end a word too), or null at the end */
  const word = () => {
    skipWs();
    if (p >= n) return null;
    const c = s[p];
    if (c === '{' || c === '}' || c === '#') { p++; return c; }
    const a = p;
    while (p < n) { const k = s.charCodeAt(p); if (ws(k) || k === 0x7B || k === 0x7D || k === 0x23) break; p++; }
    return s.slice(a, p);
  };
  const lineEnd = () => { while (p < n && s[p] !== '\n') p++; if (p < n) p++; };
  // header: version, records, entities, history flag
  const head = [];
  for (let i = 0; i < 4; i++) { const w = word(); head.push(w === null ? NaN : +w); }
  if (!head.slice(0, 3).every(Number.isInteger)) return fail('ccacis.why.not_acis');
  out.version = head[0];
  if (out.version < 100 || out.version > 100000) return fail('ccacis.why.not_acis');
  // line 2 (from FILEINFO_VERSION 2.0): product, ACIS version, date — each "<length> <text>"
  if (out.version >= 200) {
    const str = () => {
      const w = word();
      // "<length> <text>"; ASM's SAT (20800 on) writes the header's strings with the @ of AT_VERSION too (spec gap)
      const len = w && w[0] === '@' ? +w.slice(1) : +w;
      if (!Number.isInteger(len) || len < 0 || len > 4096) return null;
      if (s[p] === ' ') p++;
      const v = s.slice(p, p + len); p += len;
      return v;
    };
    out.product = str(); out.acisVersion = str(); out.date = str();
    if (out.product === null || out.acisVersion === null) return fail('ccacis.why.not_acis');
  } else lineEnd();
  // line 3: mm per unit, resabs, resnor
  const reals = [word(), word(), word()].map(Number);
  if (!reals.every(Number.isFinite)) return fail('ccacis.why.not_acis');
  [out.mmPerUnit, out.resabs, out.resnor] = reals;
  // records
  let rec = null, depth = 0, seqUsed = false;
  const recs = out.records;
  for (;;) {
    const w = word();
    if (w === null) { if (rec) recs.pop(); out.cut = true; out.why = 'ccacis.why.cut_off'; break; }
    if (!rec) {
      if (END.test(w)) break;
      if (HISTORY.test(w)) { out.history = true; break; }
      let name = w, seq = -1;
      if (/^-\d+$/.test(w)) { seq = -+w; seqUsed = true; name = word(); if (name === null) { out.cut = true; out.why = 'ccacis.why.cut_off'; break; } }
      if (!/^[A-Za-z_][\w-]*$/.test(name) || name.length > 256) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; }
      if (recs.length >= LIMITS.records) { out.ok = false; out.why = 'ccacis.why.too_many_records'; break; }
      rec = { name, f: [], seq };
      recs.push(rec);
      depth = 0;
      continue;
    }
    if (w === '#') {
      if (depth !== 0) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; }
      rec = null; continue;
    }
    if (rec.f.length >= LIMITS.fields) { out.ok = false; out.why = 'ccacis.why.too_many_fields'; break; }
    if (w === '{') {
      if (++depth > LIMITS.depth) { out.ok = false; out.why = 'ccacis.why.too_deep'; break; }
      const o = new Open(out.subtypes.length);
      out.subtypes.push({ rec: recs.length - 1, at: rec.f.length });
      rec.f.push(o); continue;
    }
    if (w === '}') { if (--depth < 0) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; } rec.f.push(CLOSE); continue; }
    const c = w.charCodeAt(0);
    if (c === 0x24 /* $ */) {
      const i = +w.slice(1);
      if (!Number.isInteger(i)) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; }
      rec.f.push(new Ptr(i)); continue;
    }
    if (c === 0x40 /* @ */ && /^@\d+$/.test(w)) {
      // "@<length> <text>" (AT_VERSION 7.0): the text may hold spaces
      const len = +w.slice(1);
      if (len > LIMITS.string) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; }
      if (s[p] === ' ') p++;
      if (p + len > n) { recs.pop(); out.cut = true; out.why = 'ccacis.why.cut_off'; rec = null; break; }
      rec.f.push(s.slice(p, p + len)); p += len; continue;
    }
    if ((c >= 0x30 && c <= 0x39) || c === 0x2D || c === 0x2B || c === 0x2E) {
      const v = Number(w);
      if (Number.isFinite(v) || /^[-+]?(\d|\.\d)/.test(w)) { rec.f.push(Number.isFinite(v) ? v : NaN); continue; }
    }
    rec.f.push(w);
  }
  if (seqUsed) reindex(out);
  return out;
}

/** With sequence numbers, a pointer names a sequence number: put each record at its own number. */
function reindex(out) {
  const recs = out.records;
  let max = -1;
  for (const r of recs) if (r.seq > max) max = r.seq;
  if (max >= LIMITS.records) { out.ok = false; out.why = 'ccacis.why.too_many_records'; return; }
  if (recs.every((r, i) => r.seq === i)) return;
  const by = new Array(max + 1).fill(null);
  const move = new Map();
  recs.forEach((r, i) => { if (r.seq >= 0 && by[r.seq] === null) { by[r.seq] = r; move.set(i, r.seq); } });
  for (const st of out.subtypes) st.rec = move.has(st.rec) ? move.get(st.rec) : -1;
  out.records = by.map((r) => r || { name: '', f: [] });
}

// ---------------------------------------------------------------------------------------------------------------------
// SAB bytes

function sab(b) {
  const out = { ok: true, format: 'sab', records: [], subtypes: [], history: false, cut: false, why: null };
  if (b.length > LIMITS.bytes) return fail('ccacis.why.too_big');
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const n = b.length;
  let p = 15;
  if (n < 15 + 16) return { ...fail('ccacis.why.cut_off'), format: 'sab', cut: true };
  out.version = dv.getInt32(p, true); p += 4;
  // three header numbers: int32 in every sample, ASM's files included (spec gap); else try 8 bytes once
  let w = 4;
  if (b[p + 12] !== 7 && n > p + 24 && b[p + 24] === 7) w = 8;
  for (let i = 0; i < 3; i++) p += w;
  if (out.version < 100 || out.version > 100000) return fail('ccacis.why.not_acis');
  const str = (len) => { if (len > LIMITS.string || p + len > n) return null; const s = latin1(b.subarray(p, p + len)); p += len; return s; };
  /** one tagged value, or undefined when the data stops / is unknown (out.why says which) */
  const value = () => {
    if (p >= n) { out.cut = true; out.why = 'ccacis.why.cut_off'; return undefined; }
    const tag = b[p++];
    const need = (k) => { if (p + k > n) { out.cut = true; out.why = 'ccacis.why.cut_off'; return false; } return true; };
    switch (tag) {
      case 2: if (!need(1)) return undefined; return b[p++];
      case 3: if (!need(2)) return undefined; p += 2; return dv.getInt16(p - 2, true);
      case 4: if (!need(4)) return undefined; p += 4; return dv.getInt32(p - 4, true);
      case 5: if (!need(4)) return undefined; p += 4; return dv.getFloat32(p - 4, true);
      case 6: if (!need(8)) return undefined; p += 8; return dv.getFloat64(p - 8, true);
      case 7: case 13: case 14: case 18: {
        if (!need(1)) return undefined;
        const len = b[p++];
        if (!need(len)) return undefined;
        const s = str(len);
        return tag === 7 ? s : { id: s, sub: tag === 14 };
      }
      case 8: { if (!need(2)) return undefined; const len = dv.getUint16(p, true); p += 2; if (!need(len)) return undefined; return str(len); }
      case 9: { if (!need(4)) return undefined; const len = dv.getUint32(p, true); p += 4; if (len > LIMITS.string) { out.ok = false; out.why = 'ccacis.why.unknown_data'; return undefined; } if (!need(len)) return undefined; return str(len); }
      case 10: return true;
      case 11: return false;
      case 12: if (!need(4)) return undefined; p += 4; return new Ptr(dv.getInt32(p - 4, true));
      case 15: return OPEN;
      case 16: return CLOSE;
      case 17: return END_REC;
      case 19: case 20: {
        if (!need(24)) return undefined;
        const v = [dv.getFloat64(p, true), dv.getFloat64(p + 8, true), dv.getFloat64(p + 16, true)];
        p += 24; return v;
      }
      case 21: if (!need(4)) return undefined; p += 4; return dv.getInt32(p - 4, true);
      default: out.ok = false; out.why = 'ccacis.why.unknown_data'; return undefined;
    }
  };
  // header strings and reals (FILEINFO 2.0+)
  if (out.version >= 200) {
    const a = value(), c = value(), d = value();
    if (typeof a !== 'string' || typeof c !== 'string') return { ...out, ok: false, why: out.why || 'ccacis.why.not_acis' };
    out.product = a; out.acisVersion = c; out.date = typeof d === 'string' ? d : '';
  }
  const reals = [value(), value(), value()];
  if (!reals.every((x) => typeof x === 'number')) return { ...out, ok: false, why: out.why || 'ccacis.why.not_acis' };
  [out.mmPerUnit, out.resabs, out.resnor] = reals;
  const recs = out.records;
  let rec = null, name = [], depth = 0;
  for (;;) {
    const v = value();
    if (v === undefined) { if (rec) recs.pop(); if (!out.why) { out.cut = true; out.why = 'ccacis.why.cut_off'; } break; }
    if (!rec) {
      // a record starts with its identifiers: sub-identifiers (tag 14) then the identifier (tag 13)
      if (v && typeof v === 'object' && 'id' in v) {
        name.push(v.id);
        if (v.sub) continue;
        const full = name.join('-');
        name = [];
        if (END.test(full)) break;
        if (HISTORY.test(full)) { out.history = true; break; }
        if (recs.length >= LIMITS.records) { out.ok = false; out.why = 'ccacis.why.too_many_records'; break; }
        rec = { name: full, f: [], seq: -1 };
        recs.push(rec);
        depth = 0;
        continue;
      }
      out.ok = false; out.why = 'ccacis.why.unknown_data'; break;
    }
    if (v === END_REC) {
      if (depth !== 0) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; }
      rec = null; continue;
    }
    if (rec.f.length >= LIMITS.fields) { out.ok = false; out.why = 'ccacis.why.too_many_fields'; break; }
    if (v === OPEN) {
      if (++depth > LIMITS.depth) { out.ok = false; out.why = 'ccacis.why.too_deep'; break; }
      const o = new Open(out.subtypes.length);
      out.subtypes.push({ rec: recs.length - 1, at: rec.f.length });
      rec.f.push(o); continue;
    }
    if (v === CLOSE) { if (--depth < 0) { out.ok = false; out.why = 'ccacis.why.unknown_data'; break; } rec.f.push(CLOSE); continue; }
    // identifiers inside a record (subtype names, words) read as words
    rec.f.push(v && typeof v === 'object' && 'id' in v ? v.id : v);
  }
  return out;
}
const END_REC = { kind: 'end' };
