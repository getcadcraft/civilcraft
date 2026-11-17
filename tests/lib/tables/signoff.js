/* SPDX-License-Identifier: Apache-2.0 */
/**
 * signoff.js — a person's sign-off of a table of figures, recorded in the file (0.10 BK.62; session bk-r3-schedules-10).
 * Host-free: no imports, no DOM, no clock of its own. Canonical in lib/tables/, copied by `node tools/tables/sync.mjs`.
 *
 * The record says who signed, when, and what total; it carries a print of every figure that was signed. It HOLDS only while
 * the figures are the ones that were signed: any change to a quantity, a rate or a line makes the print differ, and the host
 * then drops the record (the estimate is no longer signed off). A sign-off is made by a person in the app; nothing in this
 * file, and no assistant tool, signs for one.
 *
 *   lines = [{ key, name?, qty, unit?, waste?, mat?, lab?, total }]   what was signed, in order (numbers; a missing one is 0)
 *   fingerprint(lines, total) → 16 hex characters (two FNV-1a 32-bit hashes of the lines as text; a check, not a seal)
 *   makeSignoff({ by, role, at, total, currency, lines, missing }) → { ok, signoff } | { ok: false, error: 'name' | 'when' | 'total' }
 *       signoff = { format: 'cc-signoff', version: 1, by, role, at (ISO time), total, currency, lines: n, missing: n, print }
 *       missing = how many lines had no rate when it was signed (stated in the record, never hidden)
 *   cleanSignoff(raw) → signoff | null   (an untrusted file: wrong shape = no sign-off)
 *   holds(signoff, lines, total) → bool
 */
export const FORMAT = 'cc-signoff';
export const VERSION = 1;

const tidy = (s, max) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? Number(v.toPrecision(12)) : 0);
function fnv(text, seed) {
  let h = seed >>> 0;
  for (let i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return h.toString(16).padStart(8, '0');
}
export function fingerprint(lines, total = 0) {
  const text = JSON.stringify([(lines || []).map((l) => [String(l.key ?? ''), num(l.qty), String(l.unit ?? ''), num(l.waste), num(l.mat), num(l.lab), num(l.total)]), num(total)]);
  return fnv(text, 0x811c9dc5) + fnv(text, 0x01234567);
}
export function makeSignoff({ by, role = '', at, total, currency = '', lines = [], missing = 0 } = {}) {
  const name = tidy(by, 120);
  if (!name) return { ok: false, error: 'name' };
  if (typeof at !== 'string' || Number.isNaN(Date.parse(at))) return { ok: false, error: 'when' };
  if (typeof total !== 'number' || !Number.isFinite(total)) return { ok: false, error: 'total' };
  return { ok: true, signoff: { format: FORMAT, version: VERSION, by: name, role: tidy(role, 80), at: new Date(Date.parse(at)).toISOString(), total: num(total), currency: tidy(currency, 8),
    lines: lines.length, missing: Math.max(0, Math.round(Number(missing) || 0)), print: fingerprint(lines, total) } };
}
export function cleanSignoff(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw) || raw.format !== FORMAT || raw.version !== VERSION) return null;
  if (typeof raw.print !== 'string' || !/^[0-9a-f]{16}$/.test(raw.print)) return null;
  const r = makeSignoff({ by: raw.by, role: raw.role, at: raw.at, total: raw.total, currency: raw.currency, missing: raw.missing });
  if (!r.ok) return null;
  const n = Number.isInteger(raw.lines) && raw.lines >= 0 && raw.lines < 1e7 ? raw.lines : 0;
  return { ...r.signoff, lines: n, print: raw.print };
}
export const holds = (signoff, lines, total) => !!signoff && signoff.print === fingerprint(lines, total);
