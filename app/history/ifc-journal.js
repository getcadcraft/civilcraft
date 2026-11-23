/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-journal.js — autosave that writes what changed, for an open IFC model (0.11 PERF.24, BimCraft half). Host-free.
 *
 * An IfcFile (lib/ifc/model.js) is the bytes it was opened from plus an `edits` map (id → { type, params }: lines written, new or replacing)
 * and a `gone` set (removed ids). So the document the person has is "the opened bytes + the edit map": the autosave need not build the whole IFC
 * (IfcFile.save, 8.8 s at 115 MB) to keep it.
 *
 *   base   = the opened bytes (already in memory) + the edit map as it is now
 *   delta  = the lines whose edit changed since the last write (a new `{ type, params }` object per IfcFile.set), the edits taken away,
 *            the ids gone or back
 *   whole  = the whole IFC as the app saves it (`whole()`): used when the journal cannot say (a line that is not plain data, another source of
 *            changes such as pictures embedded at save time: `forceWhole()`), as a base or as one change that replaces everything before it
 *
 *   const journal = ifcJournal({ file: () => api.file(mid), whole: async () => bytes, forceWhole: () => false });
 *   autosave.doc({ name, journal });
 *   …at recovery…   const bytes = recoverIfc(rec, IfcFile);     // the IFC with every change in it (one IfcFile.save)
 *
 * Nothing here touches the IfcFile except reading `bytes`, `edits`, `gone` (and, at recovery, set / save on a fresh one the caller opens).
 */

export const IFC_BASE = 'ifc-base', IFC_WHOLE = 'ifc-whole', IFC_DELTA = 'ifc-delta';

function plain(v, depth = 0) {
  if (v === null || v === undefined) return true;
  const t = typeof v;
  if (t === 'string' || t === 'boolean') return true;
  if (t === 'number') return Number.isFinite(v);
  if (depth > 40) return false;
  if (Array.isArray(v)) { for (const x of v) if (!plain(x, depth + 1)) return false; return true; }
  if (t === 'object') {
    const p = Object.getPrototypeOf(v);
    if (p !== Object.prototype && p !== null) return false;
    for (const k of Object.keys(v)) if (!plain(v[k], depth + 1)) return false;
    return true;
  }
  return false;
}
const sizeOf = (rows) => { let n = 0; for (const r of rows) n += 24 + (typeof r[1] === 'string' ? r[1].length : 0) + (r[2] ? JSON.stringify(r[2]).length : 0); return n; };

export function ifcJournal({ file, whole, forceWhole = () => false, meta = null } = {}) {
  const ids = new WeakMap();
  let nextId = 1, wholeCount = 0;
  let written = new Map(), writtenGone = new Set(), writtenFor = null;   // what the copy on disk holds (edit objects by id), for this IfcFile
  const idOf = (f) => { let i = ids.get(f); if (!i) { i = 'f' + nextId++; ids.set(f, i); } return i; };
  const usable = () => { const f = file(); return f && f.edits instanceof Map && f.gone instanceof Set && f.bytes ? f : null; };
  const m = () => (meta ? meta() : undefined);
  return {
    kind: 'ifc',
    epoch() { const f = usable(); if (!f || forceWhole()) return 'w' + (++wholeCount); return idOf(f); },
    async base() {
      const f = usable();
      if (f && !forceWhole()) {
        const edits = [...f.edits].map(([id, e]) => [id, e.type, e.params]);
        if (edits.every((r) => plain(r[2]))) {
          const gone = [...f.gone], snap = new Map(f.edits), gsnap = new Set(f.gone);
          return { data: { kind: IFC_BASE, bytes: f.bytes, edits, gone }, size: f.bytes.length + sizeOf(edits) + gone.length * 8, meta: m(),
            commit() { written = snap; writtenGone = gsnap; writtenFor = f; } };
        }
      }
      const bytes = await whole();
      return { data: { kind: IFC_WHOLE, bytes }, size: bytes.length, meta: m(), commit() { written = new Map(); writtenGone = new Set(); writtenFor = null; } };
    },
    async delta() {
      const f = usable();
      if (!f || forceWhole() || writtenFor !== f) {   // the model is another one than the base's: the next base starts over (epoch moved); a change taken now is the whole IFC
        const bytes = await whole();
        return { data: { kind: IFC_WHOLE, bytes }, size: bytes.length, meta: m(), commit() { written = new Map(); writtenGone = new Set(); writtenFor = null; } };
      }
      const set = [], unset = [], goneAdd = [], goneDel = [], took = new Map(), tookGone = new Map();
      for (const [id, e] of f.edits) if (written.get(id) !== e) { set.push([id, e.type, e.params]); took.set(id, e); }
      for (const id of written.keys()) if (!f.edits.has(id)) { unset.push(id); took.set(id, null); }
      for (const id of f.gone) if (!writtenGone.has(id)) { goneAdd.push(id); tookGone.set(id, true); }
      for (const id of writtenGone) if (!f.gone.has(id)) { goneDel.push(id); tookGone.set(id, false); }
      if (!set.length && !unset.length && !goneAdd.length && !goneDel.length) return null;
      if (!set.every((r) => plain(r[2]))) {   // a line the journal cannot copy: this change is the whole IFC
        const bytes = await whole();
        return { data: { kind: IFC_WHOLE, bytes }, size: bytes.length, meta: m(), commit() { written = new Map(f.edits); writtenGone = new Set(f.gone); } };
      }
      return { data: { kind: IFC_DELTA, v: 1, set, unset, goneAdd, goneDel }, size: sizeOf(set) + (unset.length + goneAdd.length + goneDel.length) * 8, meta: m(),
        commit() {
          for (const [id, e] of took) { if (e) written.set(id, e); else written.delete(id); }
          for (const [id, on] of tookGone) { if (on) writtenGone.add(id); else writtenGone.delete(id); }
        } };
    },
  };
}

/** A copy's base and changes (oldest first) as the IFC's bytes. `IfcFile` = lib/ifc/model.js's class (the caller's own copy of it). */
export function recoverIfc(rec, IfcFile, { timeStamp } = {}) {
  let bytes = null, edits = new Map(), gone = new Set();
  const start = (d) => {
    if (!d || (d.kind !== IFC_BASE && d.kind !== IFC_WHOLE)) throw new Error('Not an IFC copy.');
    bytes = d.bytes instanceof Uint8Array ? d.bytes : new Uint8Array(d.bytes); edits = new Map(); gone = new Set();
    if (d.kind === IFC_BASE) { for (const [id, type, params] of d.edits) edits.set(id, [type, params]); for (const id of d.gone) gone.add(id); }
  };
  start(rec.data);
  for (const s of rec.segments || []) {
    if (s && s.kind === IFC_WHOLE) { start(s); continue; }
    if (!s || s.kind !== IFC_DELTA) throw new Error('Not an IFC change.');
    for (const [id, type, params] of s.set) edits.set(id, [type, params]);
    for (const id of s.unset) edits.delete(id);
    for (const id of s.goneAdd) gone.add(id);
    for (const id of s.goneDel) gone.delete(id);
  }
  if (!edits.size && !gone.size) return bytes;
  const f = IfcFile.open(bytes);
  for (const [id, [type, params]] of edits) f.set(id, type, params);
  for (const id of gone) { if (!edits.has(id)) { f.gone.add(id); f.cache.delete(id); } }
  f.version++;
  return f.save(timeStamp ? { timeStamp } : undefined);
}
