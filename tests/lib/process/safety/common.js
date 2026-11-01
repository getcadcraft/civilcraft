/* SPDX-License-Identifier: Apache-2.0 */
/**
 * common.js — shared small helpers of lib/process/safety (0.8 Track CH, chem-safety_PART_3). DOM-free, no imports outside lib/process.
 *
 * Every number typed from a standard or a book in this folder is listed in a SOURCES table next to its code and carries
 * `check: 'not confirmed'`: it was typed WITHOUT the standard open, so it is never presented as the standard's (the owner's engineer, O7, checks it).
 * Problems use the shared shape (docs/0.8-PROBLEMS-SPEC.md § 1; rule 29): severity error | warning | note.
 */
import { problem as baseProblem } from '../report.js';

export const DISCLAIMER = 'Drafting and study aid, not an engineering approval. No representation. To be checked by an engineer.';
export const REVIEW = Object.freeze({ state: 'not confirmed', note: 'Typed without the standard or book open. A person with the document must check each value before it is used.' });

export const str = (v, n = 200) => String(v ?? '').replace(/[\u0000-\u001f‪-‮⁦-⁩]/g, ' ').trim().slice(0, n);
export const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
export const pos = (v) => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? v : undefined);
export const list = (v, n = 20, len = 240) => (Array.isArray(v) ? v : v == null || v === '' ? [] : [v]).slice(0, n).map((x) => str(x, len)).filter(Boolean);
export const oneOf = (v, set, dflt) => (set.includes(v) ? v : dflt);
export const isoDate = (v) => { const s = str(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : ''; };
export const clone = (o) => JSON.parse(JSON.stringify(o));

/** Next id with a prefix that no item of `items` (each with .id) uses: R1, R2 …; never reuses an id (rows are never hard-deleted). */
export function nextId(prefix, items) {
  let n = 0; const used = new Set(items.map((x) => x.id));
  for (const id of used) { const m = new RegExp('^' + prefix + '(\\d+)$').exec(id); if (m) n = Math.max(n, +m[1]); }
  return prefix + (n + 1);
}

export const SRC = { kind: 'engine', name: 'process.safety' };
/** A Problem in the shared shape. `about` = [{ kind, id, label? }]. */
export function problem(code, severity, text, about = [], extra = {}) {
  const p = baseProblem('safety.' + code, severity, text, about, extra);
  if (!extra.source) p.source = SRC;
  return p;
}
export const counts = (ps) => ({ errors: ps.filter((p) => p.severity === 'error').length, warnings: ps.filter((p) => p.severity === 'warning').length, notes: ps.filter((p) => p.severity === 'note' || p.severity === 'info').length });
