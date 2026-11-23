/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ids.js — ids that two editing sessions of one file do not both hand out (0.11 DC.27; owner 2026-11-21: "you should probably not
 * have the same id, and there should probably be larger limits", "larger as default"; log docs/0.11-sessions/dc27-ids-11.md).
 * Canonical in lib/history/; every app carries a byte-identical copy in <app>/dev/history/ (tools/history-test/sync.mjs).
 * ModelCraft's m3d kernel (model.js) keeps its own three-line copy of nextNumber (it stays flat for CadCraft's m3d/ copy).
 *
 * Session tags. When a file opens, the session draws a random 32-bit tag T (crypto.getRandomValues; 1 ≤ T ≤ 2^32 - 2, not the tag
 * of any number the file already uses) and hands out T × 2^21 + 1, + 2, … (at most 2^53: plain safe integers, the same look,
 * `m<number>`). Two sessions share a tag about once in 4 billion; then the merge drivers report the clash as a conflict, as before.
 * A session that runs out of its 2^21 - 1 numbers draws a new tag (nextNumber). Ids already in a file never change. A session that
 * hands out nothing writes the file's own counter (savedCounter). Live (DC.23) sets its per-client ranges itself, and that wins.
 * Every normal Save writes these ids and formatVersion FILE_IDS (3); readers accept every version.
 * Save for an older version (narrowIds): a copy whose ids above the old limit are numbered again, consecutive from the lowest free
 * number, every reference in the file rewritten, formatVersion left out.
 *
 *   openBlock(holder, counter, used, { last, key, rand })   at open: → the counter to use; used = the numbers the file has in use
 *   nextNumber(n, holder, key)                                the number to hand out when the counter says n (a new tag past the end)
 *   takeNumber(s)                                             the same for a state's `seq` (CivilCraft modules that number by hand)
 *   savedCounter(holder, counter, key)                        the counter to write
 *   narrowIds(obj, { ids, limit, numeric })                   → { obj, map, floor } (a copy; ids = the id numbers in use)
 */
export const TAG_SPAN = 2097152;                  // 2^21 numbers per tag
export const TAG_MAX = 4294967294;                // 2^32 - 2: TAG_MAX × 2^21 + 2^21 - 1 < 2^53
export const FILE_IDS = 3;                        // formatVersion of a file saved with session tags (2 was the 1,000,000 blocks, lab only)
export const OLD_LIMIT = 2147483647;              // what 0.8 - 0.10 keep for TakeoffCraft, DetailCraft, CivilCraft: 2^31 - 1
export const OLD_LIMIT_9 = 999999999;             // ModelCraft and PartCraft before 0.11: 9-digit ids
export const TAKEOFF_LIMIT = 1e9;                 // TakeoffCraft before 0.11 clamps its seq at 1e9

const blocks = new WeakMap();

/** The number at the end of an id ('m42' → 42, 'd7' → 7, 12 → 12); 0 when there is none. */
export const idNumber = (id) => { const m = /(\d+)$/.exec(String(id ?? '')); return m ? Number(m[1]) : 0; };
/** The largest number of a list (0 when empty), without spreading it (lists of 100,000+ ids). */
export const maxOf = (list) => { let m = 0; for (const n of list) if (n > m) m = n; return m; };
export const tagOf = (n) => Math.floor((Number(n) || 0) / TAG_SPAN);

const random32 = () => {
  try { const a = new Uint32Array(1); globalThis.crypto.getRandomValues(a); return a[0]; } catch { return Math.floor(Math.random() * 4294967296); }
};
/** A tag not in `used` (a Set of tags), 1 … TAG_MAX. `rand` (tests) → a 32-bit integer. */
export function randomTag(used = new Set(), rand = random32) {
  for (let i = 0; i < 1000; i++) { const t = rand() >>> 0; if (t >= 1 && t <= TAG_MAX && !used.has(t)) return t; }
  throw new Error('no free id tag');
}

/**
 * A file was opened: draw this session's tag. `counter` is the counter as the file left it, `used` the id numbers the file has
 * (any iterable of numbers). `last`: the counter holds the last number handed out (TakeoffCraft), not the next one.
 * → the counter to use from now on.
 */
export function openBlock(holder, counter, used = [], { last = false, rand, key = '' } = {}) {
  const c = Number(counter) || 0;
  const tags = new Set([0, tagOf(c), tagOf(Math.max(0, c - 1))]);
  for (const n of used) tags.add(tagOf(n));
  const tag = randomTag(tags, rand);
  tags.add(tag);
  const first = tag * TAG_SPAN + 1;
  const raised = last ? first - 1 : first;
  if (holder && typeof holder === 'object') {
    let m = blocks.get(holder);
    if (!m) blocks.set(holder, (m = new Map()));
    m.set(key, { base: c, raised, tag, used: tags });
  }
  return raised;
}

/**
 * The number to hand out when the counter says `n` (the next number): `n` itself, or, when `n` is past the end of a tag's numbers
 * (a multiple of 2^21) or past 2^53, the first number of a new random tag.
 */
export function nextNumber(n, holder = null, key = '', rand) {
  n = Number(n) || 1;
  if (n < TAG_SPAN || (n % TAG_SPAN !== 0 && Number.isSafeInteger(n + 1))) return n;
  const b = blockOf(holder, key);
  const used = b ? b.used : new Set([0]);
  used.add(tagOf(n)); used.add(tagOf(n - 1));
  const tag = randomTag(used, rand);
  used.add(tag);
  if (b) b.tag = tag;
  return tag * TAG_SPAN + 1;
}

/** The next id number from a state's counter `s.seq` (the next number), for code that numbers without its model: `'g' + takeNumber(s)`. */
export const takeNumber = (s) => { const n = nextNumber(s.seq || 1); s.seq = n + 1; return n; };

/** The counter a file is written with: the file's own while this session has handed out nothing. */
export function savedCounter(holder, counter, key = '') {
  const b = blockOf(holder, key);
  return b && counter === b.raised ? b.base : counter;
}

/** Another file (or a new one) goes into the holder: its tags no longer apply. */
export const dropBlocks = (holder) => { if (holder && typeof holder === 'object') blocks.delete(holder); };

/** The block a holder took for a counter (or null): { base, raised, tag, used }. */
export const blockOf = (holder, key = '') => (holder && typeof holder === 'object' ? blocks.get(holder)?.get(key) || null : null);

/** Every id number in a plain file: objects' string `id` like `m42` (and, `numeric`, integer `id`s). */
export function idNumbers(obj, { numeric = false } = {}) {
  const out = [];
  const walk = (v) => {
    if (Array.isArray(v)) { for (const x of v) walk(x); return; }
    if (!v || typeof v !== 'object') return;
    if (typeof v.id === 'string' && /^[a-z]+\d+$/i.test(v.id)) out.push(idNumber(v.id));
    else if (numeric && Number.isSafeInteger(v.id) && v.id > 0) out.push(v.id);
    for (const k in v) if (k !== 'points') walk(v[k]);
  };
  walk(obj);
  return out;
}

/**
 * Save for an older version: a copy of `obj` whose id numbers above `limit` are numbered again from the lowest free number (one
 * above the highest number at or below the limit), in the order they come, and every reference rewritten: each run of digits in a
 * string (`m4503599627370497`, `f4503….face@f12#2`, `obj:4503…/12`, `arc:4503…`) and, with `numeric`, every integer equal to one
 * of those ids (ModelCraft's vertices, edges, faces, placements and the paths that name them). Only numbers above the limit are
 * touched (ten digits or more), so nothing else in the file can be one of them. → { obj, map: Map old → new, floor }.
 * Throws when the renumbered ids would not fit below the limit.
 */
export function narrowIds(obj, { ids, limit, numeric = false }) {
  const all = [...new Set([...(ids || idNumbers(obj, { numeric }))].map(Number).filter((n) => Number.isSafeInteger(n) && n > 0))];
  const big = all.filter((n) => n > limit).sort((a, b) => a - b);
  const floor = maxOf(all.filter((n) => n <= limit)) + 1;
  if (floor + big.length - 1 > limit) throw new Error('the ids do not fit below ' + limit);
  const map = new Map(big.map((n, i) => [n, floor + i]));
  if (!map.size) return { obj: JSON.parse(JSON.stringify(obj)), map, floor };
  const re = /\d{10,16}/g;
  const str = (s) => (s.length > 200000 ? s : s.replace(re, (d) => { const n = Number(d); return map.has(n) ? String(map.get(n)) : d; }));
  const walk = (v) => {
    if (typeof v === 'string') return str(v);
    if (typeof v === 'number') return numeric && map.has(v) ? map.get(v) : v;
    if (Array.isArray(v)) return v.map(walk);
    if (v && typeof v === 'object') { const o = {}; for (const k of Object.keys(v)) o[str(k)] = walk(v[k]); return o; }
    return v;
  };
  return { obj: walk(obj), map, floor };
}
