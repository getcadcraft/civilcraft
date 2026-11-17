/* SPDX-License-Identifier: Apache-2.0 */
/**
 * history.js — undo / redo by change records, and the dirty log autosave writes from (0.10 PERF.21 / PERF.24). Host-free.
 *
 *   const h = new ChunkHistory({ spec: { arrays: { members: 'id' } }, limit: 200, maxBytes: 96e6 });
 *   h.reset(state);                          // the baseline: every chunk serialized once
 *   // …the app edits `state`…
 *   h.commit(state, 'Move beam');            // → the step, or null when nothing changed
 *   h.commit(state, 'Move beam', { keys });  // keys = chunk keys that may have changed (skips serializing the rest)
 *   h.undo(state); h.redo(state);            // → label | null; only the changed chunks are put back, in place
 *   h.rollback(state);                       // an edit threw: put the state back as the last commit left it
 *
 * A step holds the chunks it changed, before and after, as strings that are shared with the current chunk table: a step
 * costs the size of what changed. `bytes` is the total of the undo stack; the oldest steps go past `limit` steps or
 * `maxBytes` (the newest `minSteps` stay).
 *
 * The same commits feed autosave: `dirty` names the chunks changed since the journal last took them (`takeDirty` →
 * a delta of {set, del} with a `commit()` to call once it is written, so a failed write loses nothing).
 */
import { split, eachChunk, serializeKeys, apply, KEYS, chunkBytes } from './chunks.js';

export const ABSENT = null;
let histories = 0;

export class ChunkHistory {
  constructor({ spec = {}, limit = 200, maxBytes = 96e6, minSteps = 20 } = {}) {
    this.spec = spec; this.limit = limit; this.maxBytes = maxBytes; this.minSteps = minSteps;
    this.cur = new Map();          // key → string: the chunks of the state as of the last commit
    this.undoStack = []; this.redoStack = [];   // never replaced (an app may keep them to put them back): emptied in place
    this.undoStack.history = this.redoStack.history = this;
    this.rev = 0;                  // counts every change to `cur`
    this.dirty = new Map();        // key → rev it last changed at, since the journal took them
    this.allDirty = true;          // nothing written yet: the next journal write is a base
    this.uid = ++histories; this.resets = 0; this.extras = 0;
  }

  /** Changes whenever the baseline is replaced (a new document, a state put in whole): a journal written for another epoch is not continued. */
  get epoch() { return this.uid + ':' + this.resets; }

  /** Start from `state`: the baseline, no steps. */
  reset(state) {
    this.cur = new Map(split(state, this.spec));
    this.extras = 0;
    this.resets++;
    this.undoStack.length = 0; this.redoStack.length = 0;
    this.rev++; this.dirty.clear(); this.allDirty = true;
    return this;
  }

  /** Bytes the undo stack holds (the chunk strings its steps changed). */
  get bytes() { let n = 0; for (const st of this.undoStack) n += st.bytes; return n; }
  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
  get chunkCount() { return this.cur.size; }

  /** What differs between `state` and the chunk table now: { set: Map key → string, del: Set key }. */
  diff(state, keys = null) {
    const set = new Map(), del = new Set();
    if (keys) {
      const now = serializeKeys(state, this.spec, keys);
      for (const [k, s] of now) {
        const was = this.cur.get(k);
        if (s === null) { if (was !== undefined) del.add(k); } else if (s !== was) set.set(k, s);
      }
      return { set, del };
    }
    let seen = 0, known = 0;
    eachChunk(state, this.spec, (k, s) => {
      seen++;
      const was = this.cur.get(k);
      if (was !== s) set.set(k, s);
      if (was !== undefined) known++;
    });
    // chunks the table has and the state no longer cuts: only looked for when the counts say there are some
    let have = this.cur.size - this.extras;
    if (known < have) { const now = new Set(); eachChunk(state, this.spec, (k) => { now.add(k); }); for (const k of this.cur.keys()) if (!now.has(k) && !k.startsWith('x:')) del.add(k); }
    return { set, del };
  }

  /** The edit is done: record it as one step. Returns the step, or null when `state` still equals the table. */
  commit(state, label, opts = {}) {
    const { set, del } = this.diff(state, opts.keys || null);
    if (opts.verify && opts.keys) {   // tests: a hint that missed a change is a bug in the app's adapter
      const all = this.diff(state), miss = [...all.set.keys(), ...all.del].filter((k) => !set.has(k) && !del.has(k));
      if (miss.length) throw new Error('history hint missed ' + miss.slice(0, 5).join(', ') + (miss.length > 5 ? ' …' : '') + ' (' + label + ')');
    }
    if (!set.size && !del.size) return null;
    const step = { label, undo: new Map(), redo: new Map(), bytes: 0 };
    for (const [k, s] of set) { const was = this.cur.get(k); step.undo.set(k, was === undefined ? ABSENT : was); step.redo.set(k, s); step.bytes += chunkBytes(was) + chunkBytes(s); }
    for (const k of del) { step.undo.set(k, this.cur.get(k)); step.redo.set(k, ABSENT); step.bytes += chunkBytes(this.cur.get(k)); }
    this._put(step.redo);
    this.undoStack.push(step);
    this.redoStack.length = 0;
    this._trim();
    return step;
  }

  /** Amend the newest step with a new edit that was made on top of it (push/pull typed after the drag): one step still. */
  amend(state, opts = {}) {
    const last = this.undoStack[this.undoStack.length - 1];
    if (!last) return this.commit(state, '', opts);
    const { set, del } = this.diff(state, opts.keys || null);
    if (!set.size && !del.size) return last;
    for (const [k, s] of set) { if (!last.undo.has(k)) { const was = this.cur.get(k); last.undo.set(k, was === undefined ? ABSENT : was); } last.bytes -= chunkBytes(last.redo.get(k)); last.redo.set(k, s); last.bytes += chunkBytes(s); }
    for (const k of del) { if (!last.undo.has(k)) last.undo.set(k, this.cur.get(k)); last.redo.set(k, ABSENT); }
    const redo = new Map([...set].concat([...del].map((k) => [k, ABSENT])));
    this._put(redo);
    this.redoStack.length = 0;
    return last;
  }

  /**
   * For an app that takes its snapshot BEFORE it edits (`push(label)`, then the edit): an open step that the next `sync` fills with what
   * changed since. Returns the step (an app may `undoStack.pop()` it again when the edit failed).
   */
  begin(label) {
    const step = { label, undo: new Map(), redo: new Map(), bytes: 0, open: true };
    this.undoStack.push(step);
    this.redoStack.length = 0;
    this._trim();
    return step;
  }

  /**
   * Bring the table up to `state`. The newest step, while it is open, takes what changed (so an autosave in the middle of a drag keeps
   * the step whole); `close` ends it. With no open step the change is only adopted (an edit that was made without a step).
   */
  sync(state, { close = false, keys = null } = {}) {
    const last = this.undoStack[this.undoStack.length - 1];
    const { set, del } = this.diff(state, keys);
    if (set.size || del.size) {
      const step = last && last.open ? last : null;
      const redo = new Map();
      for (const [k, s] of set) { if (step && !step.undo.has(k)) { const was = this.cur.get(k); step.undo.set(k, was === undefined ? ABSENT : was); } redo.set(k, s); }
      for (const k of del) { if (step && !step.undo.has(k)) step.undo.set(k, this.cur.get(k)); redo.set(k, ABSENT); }
      if (step) for (const [k, s] of redo) { step.bytes -= chunkBytes(step.redo.get(k)); step.redo.set(k, s); step.bytes += chunkBytes(s); }
      if (step) for (const k of step.undo.keys()) if (!this._counted(step, k)) { step.bytes += chunkBytes(step.undo.get(k)); (step.counted ||= new Set()).add(k); }
      this._put(redo);
    }
    if (close && last && last.open) last.open = false;
    return set.size > 0 || del.size > 0;
  }
  _counted(step, k) { return !!step.counted && step.counted.has(k); }

  /**
   * `commit` for an app that keeps its own stacks (CivilCraft: steps that also carry point lists): the record of what changed since the
   * table, `{ undo, redo, bytes }` (Maps key → string | null), the table moved on; null when nothing changed. Put back with `restore`.
   */
  capture(state, opts = {}) {
    const { set, del } = this.diff(state, opts.keys || null);
    if (!set.size && !del.size) return null;
    const rec = { undo: new Map(), redo: new Map(), bytes: 0 };
    for (const [k, s] of set) { const was = this.cur.get(k); rec.undo.set(k, was === undefined ? ABSENT : was); rec.redo.set(k, s); rec.bytes += chunkBytes(was) + chunkBytes(s); }
    for (const k of del) { rec.undo.set(k, this.cur.get(k)); rec.redo.set(k, ABSENT); rec.bytes += chunkBytes(this.cur.get(k)); }
    this._put(rec.redo);
    return rec;
  }
  /** Put one side of a `capture` record (`rec.undo` or `rec.redo`) into the state and the table. */
  restore(state, changes) { this._swap(state, changes); }

  undo(state) {
    const step = this.undoStack.pop();
    if (!step) return null;
    this._swap(state, step.undo);
    this.redoStack.push(step);
    return step.label;
  }

  redo(state) {
    const step = this.redoStack.pop();
    if (!step) return null;
    this._swap(state, step.redo);
    this.undoStack.push(step);
    this._trim();
    return step.label;
  }

  /** An edit threw half-way: every chunk that no longer matches the table is put back, in place. */
  rollback(state) {
    const { set, del } = this.diff(state);
    if (!set.size && !del.size) return false;
    const back = new Map(), gone = new Set();
    for (const k of set.keys()) { const was = this.cur.get(k); if (was === undefined) gone.add(k); else back.set(k, was); }
    for (const k of del) back.set(k, this.cur.get(k));
    apply(state, this.spec, back, gone, this.cur);
    return true;
  }

  /**
   * Data that belongs to the document but lives outside the state (a picture's PNG, an IDS text), kept by key `x:<name>`: it goes
   * into autosave copies with the rest, and never into undo steps. `str` null drops it. Returns true when it changed.
   */
  setExtra(key, str) {
    if (!key.startsWith('x:')) throw new Error('An extra chunk key starts with "x:".');
    const was = this.cur.get(key);
    if (str === ABSENT ? was === undefined : was === str) return false;
    this.extras += (str === ABSENT ? -1 : 0) + (was === undefined && str !== ABSENT ? 1 : 0);
    this._put(new Map([[key, str]]));
    return true;
  }
  extraKeys() { return [...this.cur.keys()].filter((k) => k.startsWith('x:')); }

  // Put `changes` (Map key → string | null) into the table, the dirty log and the state.
  _put(changes) {
    this.rev++;
    for (const [k, s] of changes) { if (s === ABSENT) this.cur.delete(k); else this.cur.set(k, s); this.dirty.set(k, this.rev); }
  }
  _swap(state, changes) {
    const set = new Map(), del = new Set();
    for (const [k, s] of changes) { if (s === ABSENT) del.add(k); else set.set(k, s); }
    this._put(changes);
    apply(state, this.spec, set, del, this.cur);
  }
  _trim() {
    let n = this.bytes;
    while (this.undoStack.length > this.limit || (n > this.maxBytes && this.undoStack.length > this.minSteps)) n -= this.undoStack.shift().bytes;
    // a redo stack is as old as the edits it undid: keep it to the same bounds
    while (this.redoStack.length > this.limit) this.redoStack.shift();
  }

  // ---- the journal's side ----

  /** Every chunk, for a base copy. Call `committed()` on the result once it is written. */
  takeAll() {
    const rev = this.rev, chunks = [...this.cur];
    return { chunks, bytes: chunks.reduce((n, [, s]) => n + chunkBytes(s), 0), commit: () => { if (this.rev === rev) this.dirty.clear(); else for (const [k, r] of this.dirty) if (r <= rev) this.dirty.delete(k); this.allDirty = false; } };
  }

  /** What changed since the last write: { set: [[key, string]], del: [key], bytes, commit() }, or null. */
  takeDirty() {
    if (!this.dirty.size) return null;
    const taken = new Map(this.dirty), set = [], del = [];
    let bytes = 0;
    for (const k of taken.keys()) { const s = this.cur.get(k); if (s === undefined) del.push(k); else { set.push([k, s]); bytes += chunkBytes(s); } }
    return { set, del, bytes, commit: () => { for (const [k, r] of taken) if (this.dirty.get(k) === r) this.dirty.delete(k); } };
  }
}

export { KEYS };
