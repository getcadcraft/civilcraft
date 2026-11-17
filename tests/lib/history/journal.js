/* SPDX-License-Identifier: Apache-2.0 */
/**
 * journal.js — autosave that writes what changed (0.10 PERF.24). The glue between a ChunkHistory and the shell's Autosave
 * (public_html/assets/js/app-autosave.js, `autosave.doc({ journal })`).
 *
 *   const journal = chunkJournal(history, { meta: () => ({ name }) });
 *   const doc = autosave.doc({ name, journal });          // Autosave calls journal.base() once, then journal.delta()
 *   …at recovery…
 *   const state = recoverState(rec, spec);                // rec from autosave.load(): the base + its deltas, folded and joined
 *
 * base() = every chunk; delta() = the chunks the history changed since the last write (null when none). Both give
 * `commit()`, which Autosave calls after the write reached storage: a failed write leaves the chunks dirty for the next try.
 */
import { join } from './chunks.js';
import { ChunkHistory } from './history.js';

export const BASE = 'chunks', DELTA = 'chunks-delta';

export function chunkJournal(history, { meta, prepare } = {}) {
  return {
    kind: BASE,
    epoch: () => history.epoch,
    async base() {
      if (prepare) prepare();
      const t = history.takeAll();
      return { data: { kind: BASE, v: 1, chunks: t.chunks }, size: t.bytes, meta: meta ? meta() : undefined, commit: t.commit };
    },
    async delta() {
      if (prepare) prepare();   // the app brings its extra chunks (setExtra) up to date
      const t = history.takeDirty();
      if (!t) return null;
      return { data: { kind: DELTA, v: 1, set: t.set, del: t.del }, size: t.bytes, meta: meta ? meta() : undefined, commit: t.commit };
    },
  };
}

/**
 * A journal for an app whose document is an object it can build on demand, with no undo history of its own to read the changes from
 * (or one that is cut differently): each write cuts `get()` into chunks, compares them with what was written and writes the difference.
 *   spec      how the object is cut (lib/history chunks)
 *   get()     the object now (JSON-shaped; leave out what is big and kept apart)
 *   identity() something that changes when another document is open (the project object): a new base is then written
 *   extras(h) optional: bring the big parts the object leaves out up to date with `h.setExtra('x:name', string | null)`
 *   meta()    small plain data stored with the copy
 */
export function objectJournal({ spec = {}, get, identity = () => 0, extras = null, meta = null } = {}) {
  const h = new ChunkHistory({ spec });
  let ident = {}, started = false;
  const sync = async () => {
    const id = identity(), obj = await get();   // get() may be async (an app that gathers a part of the document asynchronously)
    if (!started || id !== ident) { h.reset(obj); ident = id; started = true; } else h.sync(obj);
    if (extras) await extras(h);
  };
  const inner = chunkJournal(h, { meta });
  return {
    kind: BASE,
    epoch: () => h.epoch,
    async base() { await sync(); return inner.base(); },
    async delta() { await sync(); return inner.delta(); },
  };
}

/** A journal for the document an app has open now: `get()` returns the current chunkJournal (the app replaces its model when a file opens). */
export function followJournal(get) {
  return { base: () => get().base(), delta: () => get().delta(), epoch: () => get().epoch() };
}

/** A base and its deltas (oldest first) folded into one chunk table (Map key → string). */
export function foldChunks(base, deltas = []) {
  if (!base || base.kind !== BASE) throw new Error('Not a chunk copy.');
  const m = new Map(base.chunks);
  for (const d of deltas) {
    if (!d || d.kind !== DELTA) throw new Error('Not a chunk change.');
    for (const [k, s] of d.set) m.set(k, s);
    for (const k of d.del) m.delete(k);
  }
  return m;
}

/** The extra chunks (`x:` keys) of a copy: Map key → string. */
export function recoverExtras(rec) {
  const m = foldChunks(rec.data, rec.segments || []), out = new Map();
  for (const [k, s] of m) if (k.startsWith('x:')) out.set(k, s);
  return out;
}

/** What Autosave.load() returned (data = base, segments = deltas) as the state it was cut from. */
export function recoverState(rec, spec = {}) {
  return join(foldChunks(rec.data, rec.segments || []), spec);
}
