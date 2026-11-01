/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: its literals are file data and errors for developers; every word a person reads comes from the app (t()), e.g. bomCsv's labels. */
/**
 * vault-rev.js — revision names (0.8 SU.1058, session `sx-vault`). DOM-free, import-free.
 *
 * Released revisions are letters A, B … Z, AA, AB … (the plan's O2 default: every letter); `skip` takes letters out of the
 * sequence (ASME Y14.35 leaves out I, O, Q, S, X and Z: pass 'IOQSXZ'). Work in progress carries the letter it is heading to
 * and a number: the first copy checked in is A.1, then A.2 …; releasing A.3 makes it A; a new revision from A starts B.1.
 *
 *   letterAt(n, skip)    → the n-th letter name (0 → A, 25 → Z, 26 → AA with no skip)
 *   indexOf(name, skip)  → n, or -1 when the name is not in the sequence
 *   parseRev('B.3')      → { letter: 'B', minor: 3 } · parseRev('B') → { letter: 'B', minor: 0 } · bad → null
 *   isWip(rev)           → true for 'B.3'
 *   firstWip(skip)       → 'A.1'
 *   nextWip(rev, skip)   → 'A.1' → 'A.2'; a released 'A' → 'B.1'
 *   released(rev)        → 'B.3' → 'B'
 *   compareRev(a, b, skip) → < 0, 0, > 0 (A.2 < A < B.1 < B)
 */

const ALL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alphabet = (skip = '') => { const s = String(skip || '').toUpperCase(); const a = [...ALL].filter((c) => !s.includes(c)); if (a.length < 2) throw new Error('vault: too many letters skipped'); return a; };

/** Bijective base-k names: 0 → A … k-1 → last, k → AA. */
export function letterAt(n, skip = '') {
  const a = alphabet(skip), k = a.length;
  if (!Number.isInteger(n) || n < 0) throw new Error('vault: bad revision index');
  let s = '';
  n += 1;
  while (n > 0) { n -= 1; s = a[n % k] + s; n = Math.floor(n / k); }
  return s;
}
export function indexOf(name, skip = '') {
  const a = alphabet(skip), k = a.length;
  if (typeof name !== 'string' || !/^[A-Z]{1,4}$/.test(name)) return -1;
  let n = 0;
  for (const c of name) { const d = a.indexOf(c); if (d < 0) return -1; n = n * k + d + 1; }
  return n - 1;
}
export function parseRev(rev) {
  const m = /^([A-Z]{1,4})(?:\.([1-9]\d{0,4}))?$/.exec(String(rev ?? ''));
  return m ? { letter: m[1], minor: m[2] ? +m[2] : 0 } : null;
}
export const isWip = (rev) => !!parseRev(rev)?.minor;
export const firstWip = (skip = '') => letterAt(0, skip) + '.1';
export function nextWip(rev, skip = '') {
  const p = parseRev(rev);
  if (!p || indexOf(p.letter, skip) < 0) throw new Error('vault: not a revision: ' + rev);
  return p.minor ? p.letter + '.' + (p.minor + 1) : letterAt(indexOf(p.letter, skip) + 1, skip) + '.1';
}
export function released(rev) { const p = parseRev(rev); if (!p) throw new Error('vault: not a revision: ' + rev); return p.letter; }
export function compareRev(a, b, skip = '') {
  const pa = parseRev(a), pb = parseRev(b);
  if (!pa || !pb) throw new Error('vault: not a revision');
  const d = indexOf(pa.letter, skip) - indexOf(pb.letter, skip);
  if (d) return d;
  // within a letter: A.1 < A.2 < A (released is the end of its work)
  const ka = pa.minor || Infinity, kb = pb.minor || Infinity;
  return ka === kb ? 0 : ka < kb ? -1 : 1;
}
