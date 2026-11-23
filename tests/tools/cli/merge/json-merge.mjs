/* SPDX-License-Identifier: Apache-2.0 */
/**
 * json-merge.mjs — a three-way merge of two edits of one JSON project file (0.8 DC.27, docs/spikes/DC.27_PART_2.md § 4). DOM-free, no imports.
 *
 *   mergeJson(base, ours, theirs, opts?) → { merged, conflicts: [{path, kind, ours, theirs, base}], notes: [string] }
 *
 * The rules are the ones Live already uses, in three-way form:
 *   - a value changed on one side only → taken; changed the same way on both → taken;
 *   - changed differently on both → a conflict; `merged` keeps OURS there (the report offers both);
 *   - objects merge key by key;
 *   - an array of objects that all have a string `id` merges by id: kept in base order, then ours' new ones, then theirs' new ones;
 *     added on one side → kept; added on both with different content → a conflict (ours kept, theirs listed, never renumbered here);
 *     removed on one side and untouched on the other → removed; removed on one side and CHANGED on the other → removed, reported (conflict kind "deleted");
 *   - any other array (no ids, or primitives) → changed on one side only is taken, otherwise a conflict;
 *   - `opts.volatile` (paths like "savedAt", "view.cam") → ours; `opts.maxKeys` (like "seq", "nextId") → the larger number;
 *     a `*` in a maxKeys path stands for any one id in brackets ("defs[*].next": every ModelCraft definition's counter; 0.11 DC.27);
 *   - `opts.numericIds` (ModelCraft: placements and faces carry integer ids) → an array of objects that all have an integer `id` merges by id too.
 * Since 0.11 DC.27 every app hands out each editing session's ids from a block of its own, so two people's new objects have different
 * ids and merge cleanly; `added-both` is left for files an older build wrote.
 */
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
export const same = (a, b) => {
  if (a === b) return true;
  if (typeof a !== typeof b || a === null || b === null || typeof a !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  const ka = Object.keys(a), kb = Object.keys(b);
  return ka.length === kb.length && ka.every((k) => Object.prototype.hasOwnProperty.call(b, k) && same(a[k], b[k]));
};
const clone = (v) => (v === undefined ? undefined : JSON.parse(JSON.stringify(v)));
const hasIds = (arr, numeric = false) => Array.isArray(arr) && arr.length > 0 && arr.every((x) => isObj(x) && (typeof x.id === 'string' || (numeric && Number.isInteger(x.id))));
const pathRe = (p) => new RegExp('^' + p.replace(/[.+?^${}()|\\]/g, '\\$&').replace(/\[\*\]/g, '\\[[^\\]]+\\]') + '$');

export function mergeJson(base, ours, theirs, opts = {}) {
  const conflicts = [], notes = [];
  const volatile = new Set(opts.volatile || []);
  const maxKeys = new Set(opts.maxKeys || []);
  const maxRes = [...maxKeys].filter((k) => k.includes('[*]')).map(pathRe);
  const isMax = (p) => maxKeys.has(p) || maxRes.some((r) => r.test(p));
  const numeric = !!opts.numericIds;
  const conflict = (path, kind, o, t, b) => conflicts.push({ path, kind, ours: clone(o), theirs: clone(t), base: clone(b) });

  function merge(b, o, t, path) {
    if (volatile.has(path)) return clone(o);
    if (same(o, t)) return clone(o);
    if (same(b, o)) return clone(t);
    if (same(b, t)) return clone(o);
    if (isMax(path) && typeof o === 'number' && typeof t === 'number') return Math.max(o, t);
    if (isObj(o) && isObj(t)) {
      const bb = isObj(b) ? b : {};
      const out = {};
      const keys = [...new Set([...Object.keys(o), ...Object.keys(t), ...Object.keys(bb)])];
      // key order: ours first (what the person sees), then theirs' new keys
      for (const k of keys) {
        const p = path ? path + '.' + k : k;
        const inO = k in o, inT = k in t, inB = k in bb;
        if (inO && inT) { const v = merge(bb[k], o[k], t[k], p); if (v !== undefined) out[k] = v; }
        else if (inO) { // theirs lacks it
          if (!inB) out[k] = clone(o[k]);                         // we added it
          else if (same(bb[k], o[k])) { /* they removed it, we did not touch it */ }
          else { conflict(p, 'deleted', o[k], undefined, bb[k]); }   // we changed it, they removed it: removed (theirs), reported
        } else if (inT) {
          if (!inB) out[k] = clone(t[k]);
          else if (same(bb[k], t[k])) { /* we removed it */ }
          else { conflict(p, 'deleted', undefined, t[k], bb[k]); }
        }
      }
      return out;
    }
    if (hasIds(o, numeric) && hasIds(t, numeric) && (b === undefined || b === null || hasIds(b, numeric) || (Array.isArray(b) && b.length === 0))) return mergeById(Array.isArray(b) ? b : [], o, t, path);
    conflict(path, 'changed', o, t, b);
    return clone(o);
  }

  function mergeById(b, o, t, path) {
    const idx = (arr) => new Map(arr.map((x) => [x.id, x]));
    const B = idx(b), O = idx(o), T = idx(t);
    const order = [...b.map((x) => x.id), ...o.map((x) => x.id).filter((i) => !B.has(i)), ...t.map((x) => x.id).filter((i) => !B.has(i) && !O.has(i))];
    const out = [];
    for (const id of [...new Set(order)]) {
      const p = `${path}[${id}]`, bb = B.get(id), oo = O.get(id), tt = T.get(id);
      if (oo && tt) {
        if (!bb && !same(oo, tt)) { conflict(p, 'added-both', oo, tt, undefined); out.push(clone(oo)); }   // two people handed out one id
        else out.push(merge(bb, oo, tt, p));
      } else if (oo) {
        if (!bb) out.push(clone(oo));
        else if (same(bb, oo)) { /* they removed it */ }
        else conflict(p, 'deleted', oo, undefined, bb);
      } else if (tt) {
        if (!bb) out.push(clone(tt));
        else if (same(bb, tt)) { /* we removed it */ }
        else conflict(p, 'deleted', undefined, tt, bb);
      }
    }
    return out;
  }

  const merged = merge(base, ours, theirs, '');
  if (conflicts.length) notes.push(`${conflicts.length} conflict(s); the merged file keeps your side where the two differ.`);
  return { merged, conflicts, notes };
}
