/* SPDX-License-Identifier: Apache-2.0 */
/**
 * chunks.js — a JSON document cut into chunks (0.10 PERF.21 / PERF.24). Host-free: no DOM, no app code.
 *
 * Undo by whole-document JSON costs the document's size at every edit and keeps a copy of it per step. Here the document
 * is cut into chunks, each one string: a top-level key is one chunk, and a top-level array of objects with an `id` is one
 * chunk per element plus one for the order. An edit then changes a few chunks; a history step and an autosave write hold
 * only those.
 *
 *   key             chunk
 *   `k:<name>`      the whole value of top-level key <name>
 *   `o:<name>`      the ids of array <name>, in order (a JSON array of strings)
 *   `e:<name>:<id>` one element of array <name> (when its elements have unique ids)
 *   `#keys`         the order of the top-level keys (JSON array)
 *
 * `spec` (all optional):
 *   arrays  { name: 'id' }   top-level arrays cut per element, by that property (members: 'id')
 *   autoArrays 'id'          every top-level array is cut per element by that property (when its elements have unique ones)
 *   view    (state) => object   what is cut (default: the state itself): a state that keeps display settings or caches
 *                          outside its history returns the part that is history
 *   revive  (key, value, state) => value   after a chunk is parsed back into `state` (a cache the chunk does not hold)
 *
 * join(split(x)) deep-equals JSON.parse(JSON.stringify(view(x))): the same values, the same key order.
 */

export const KEYS = '#keys';
const NAME_OK = /^[A-Za-z0-9_$-]{1,60}$/;

const idOf = (e, prop) => {
  const v = e && typeof e === 'object' && !Array.isArray(e) ? e[prop] : undefined;
  return typeof v === 'string' && v !== '' ? v : typeof v === 'number' && Number.isFinite(v) ? String(v) : null;
};

/** The ids of `arr` when every element is an object with a unique id, else null (the array stays one chunk). */
function idsOf(arr, prop) {
  const ids = new Array(arr.length), seen = new Set();
  for (let i = 0; i < arr.length; i++) {
    const id = idOf(arr[i], prop);
    if (id === null || seen.has(id)) return null;
    seen.add(id); ids[i] = id;
  }
  return ids;
}

const eKey = (name, id) => 'e:' + name + ':' + id;
// `arrays: { name: 'id' }` names the lists cut per element; `autoArrays: 'id'` cuts every top-level list (a list without unique ids stays one chunk anyway)
const idProp = (spec, name) => (spec.arrays && spec.arrays[name]) || spec.autoArrays || null;
const isByIdArray = (spec, name, v) => Array.isArray(v) && NAME_OK.test(name) && !!idProp(spec, name);

/** Calls fn(key, string) for every chunk of `state` (no list is built: a big state is cut in one pass). */
export function eachChunk(state, spec, fn) {
  const src = spec.view ? spec.view(state) : state;
  const names = Object.keys(src);
  fn(KEYS, JSON.stringify(names));
  for (const name of names) {
    const v = src[name];
    const ids = isByIdArray(spec, name, v) ? idsOf(v, idProp(spec, name)) : null;
    if (!ids) { const s = JSON.stringify(v); if (s !== undefined) fn('k:' + name, s); continue; }
    fn('o:' + name, JSON.stringify(ids));
    const pre = 'e:' + name + ':';
    for (let i = 0; i < v.length; i++) fn(pre + ids[i], JSON.stringify(v[i]));
  }
}

/** Every chunk of `state` as [key, string] pairs. */
export function split(state, spec = {}) {
  const out = [];
  eachChunk(state, spec, (k, s) => { out.push([k, s]); });
  return out;
}

/**
 * The chunks named in `keys` only, as a Map key → string (null = that chunk is not in the state now). The element index of an
 * array is built once per call (pointers, no serializing). A key that is no chunk of the state's present shape gives null.
 */
export function serializeKeys(state, spec, keys) {
  const src = spec.view ? spec.view(state) : state;
  const out = new Map(), idx = new Map();
  const index = (name) => {
    let m = idx.get(name);
    if (!m) {
      const arr = src[name];
      const ids = isByIdArray(spec, name, arr) ? idsOf(arr, idProp(spec, name)) : null;
      m = ids ? { ids, byId: new Map(ids.map((id, i) => [id, arr[i]])) } : { ids: null };
      idx.set(name, m);
    }
    return m;
  };
  for (const key of keys) {
    if (key === KEYS) { out.set(key, JSON.stringify(Object.keys(src))); continue; }
    const kind = key.slice(0, 2), rest = key.slice(2);
    if (kind === 'k:') {
      const v = src[rest];
      const m = v !== undefined && isByIdArray(spec, rest, v) ? index(rest) : null;
      out.set(key, v === undefined || (m && m.ids) ? null : JSON.stringify(v));
    } else if (kind === 'o:') {
      const m = src[rest] !== undefined ? index(rest) : null;
      out.set(key, m && m.ids ? JSON.stringify(m.ids) : null);
    } else if (kind === 'e:') {
      const c = rest.indexOf(':'), name = rest.slice(0, c), id = rest.slice(c + 1);
      const m = src[name] !== undefined ? index(name) : null;
      out.set(key, m && m.ids && m.byId.has(id) ? JSON.stringify(m.byId.get(id)) : null);
    }
  }
  return out;
}

/** Chunks (Map key → string) back into a state. */
export function join(chunks, spec = {}) {
  const get = (k) => chunks.get(k);
  const keys = JSON.parse(get(KEYS) || '[]');
  const out = {};
  for (const name of keys) {
    const k = get('k:' + name);
    if (k !== undefined && k !== null) { out[name] = JSON.parse(k); continue; }
    const o = get('o:' + name);
    if (o === undefined || o === null) continue;
    out[name] = JSON.parse(o).map((id) => JSON.parse(get(eKey(name, id))));
  }
  return out;
}

/**
 * Put changed chunks into `state` in place (top-level values are replaced; elements of an array that did not change keep
 * their objects). `set` Map key → string, `del` Set of keys; `all` Map of every chunk after the change (the order chunk is
 * read from it). The key order of the state follows `#keys`.
 */
export function apply(state, spec, set, del, all) {
  const touched = new Set();
  const edits = new Map();   // array name → { set: Map id → string, del: Set id }
  const arr = (name) => { let m = edits.get(name); if (!m) edits.set(name, m = { set: new Map(), del: new Set(), order: false }); return m; };
  const target = state;   // `view` only decides what is cut; the chunks go back into the state itself
  const put = (name, v) => { target[name] = spec.revive ? spec.revive('k:' + name, v, state) : v; touched.add(name); };
  for (const [key, str] of set) {
    const kind = key.slice(0, 2), rest = key.slice(2);
    if (kind === 'k:') put(rest, JSON.parse(str));
    else if (kind === 'o:') arr(rest).order = true;
    else if (kind === 'e:') { const c = rest.indexOf(':'); arr(rest.slice(0, c)).set.set(rest.slice(c + 1), str); }
  }
  for (const key of del) {
    const kind = key.slice(0, 2), rest = key.slice(2);
    if (kind === 'k:') { if (!(('o:' + rest) in objOf(all))) { delete target[rest]; touched.add(rest); } }
    else if (kind === 'o:') arr(rest).order = true;
    else if (kind === 'e:') { const c = rest.indexOf(':'); arr(rest.slice(0, c)).del.add(rest.slice(c + 1)); }
  }
  for (const [name, m] of edits) {
    const o = all.get('o:' + name);
    if (o === undefined || o === null) {                // the array is one chunk now (its k: chunk was set) or gone
      if (!all.has('k:' + name) && name in target) { delete target[name]; touched.add(name); }   // gone: an undo of the edit that made the key
      continue;
    }
    const cur = Array.isArray(target[name]) && !set.has('k:' + name) ? target[name] : [];
    const byId = new Map();
    const prop = idProp(spec, name);
    for (const e of cur) { const id = idOf(e, prop); if (id !== null) byId.set(id, e); }
    for (const id of m.del) byId.delete(id);
    for (const [id, str] of m.set) byId.set(id, JSON.parse(str));
    target[name] = JSON.parse(o).map((id) => {
      let e = byId.get(id);
      if (e === undefined) e = JSON.parse(all.get(eKey(name, id)));   // an element the state did not hold (a chunk set for it was not part of this change)
      return spec.revive ? spec.revive(eKey(name, id), e, state) : e;
    });
    touched.add(name);
  }
  const order = all.get(KEYS);
  if (order !== undefined && order !== null && (set.has(KEYS) || touched.size)) {
    // the keys the chunks know follow `#keys`; a key they do not know (kept outside the history) stays, after them
    const want = JSON.parse(order), have = Object.keys(target);
    const rest = have.filter((k) => !want.includes(k)), inOrder = have.filter((k) => want.includes(k));
    const wanted = want.filter((k) => k in target);
    if (wanted.some((k, i) => k !== inOrder[i]) || inOrder.length !== wanted.length) {
      const held = {};
      for (const k of have) held[k] = target[k];
      for (const k of have) delete target[k];
      for (const k of wanted) target[k] = held[k];
      for (const k of rest) target[k] = held[k];
    }
  }
  return state;
}

const objOf = (m) => { const o = {}; for (const k of m.keys()) o[k] = 1; return o; };

/** Bytes a chunk takes (UTF-16 strings). */
/** Bytes a chunk takes: a string as UTF-16, a Blob or typed array by its size (an extra chunk may hold one). */
export const chunkBytes = (s) => (!s ? 0 : typeof s === 'string' ? s.length * 2 : s.size || s.byteLength || 0);
