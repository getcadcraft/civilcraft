/* SPDX-License-Identifier: Apache-2.0 */
/** An in-memory ctx for the panels and the session: files in a Map, every Problems set and file write recorded. */
export function makeCtx(files, extra = {}) {
  const store = new Map(Object.entries(files)), sets = [], writes = [];
  const ctx = {
    files: { list: async () => [...store.keys()].map((name) => ({ name })), read: async (n) => store.get(n), write: async (n, t) => { store.set(n, t); writes.push(n); } },
    problems: { set: (src, rows) => sets.push({ src, rows }) },
    t: (k) => k,
    ...extra,
  };
  return { ctx, store, sets, writes };
}
