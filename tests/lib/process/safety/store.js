/* SPDX-License-Identifier: Apache-2.0 */
/**
 * store.js — the safety block saved with the drawing (0.8 Track CH). ONE block `cadcraft-process-safety` holds the HAZOP / What-If worksheet (CH.14),
 * the LOPA scenarios and SIFs (CH.15), consequence cases (CH.16), release sources (CH.17) and the inventory (CH.18). It is stored like the process
 * model (model.js): JSON, split into chunks that fit a DWG object's extended data, and as `safety.json` in a SuperCad Studio .ccproject.
 *
 *   newSafety(name) · cleanSafety(raw) → block | null · toJSON · fromJSON · toChunks · fromChunks · projectEntry
 *
 * Untrusted data (a file): every section is cleaned by its own module; unknown fields are dropped; a block comes back 'not confirmed' unless a named person and a date are recorded.
 */
import { str, REVIEW } from './common.js';
import { cleanHazop, newHazop } from './hazop.js';
import { cleanLopa, newLopa } from './lopa.js';
import { cleanCases } from './consequence.js';
import { cleanSources } from './area.js';
import { cleanInventory, newInventory } from './inventory.js';

export const FORMAT = 'cadcraft-process-safety';
export const VERSION = 1;
export const LIMITS = { json: 4 * 1024 * 1024 };

export function newSafety(name = '') {
  return { format: FORMAT, version: VERSION, name: str(name, 120), review: { ...REVIEW }, hazop: newHazop(), lopa: newLopa(), cases: [], sources: [], inventory: newInventory() };
}
export function cleanSafety(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== FORMAT || !(raw.version >= 1) || raw.version > VERSION) return null;
  const s = newSafety(raw.name), rv = raw.review;
  if (rv && rv.state === 'confirmed' && str(rv.by, 80) && /^\d{4}-\d{2}-\d{2}$/.test(str(rv.date, 10))) s.review = { state: 'confirmed', by: str(rv.by, 80), date: str(rv.date, 10), note: str(rv.note, 240) };   // a person's record, not a trust boundary
  s.hazop = cleanHazop(raw.hazop); s.lopa = cleanLopa(raw.lopa); s.cases = cleanCases(raw.cases); s.sources = cleanSources(raw.sources); s.inventory = cleanInventory(raw.inventory);
  return s;
}
export const toJSON = (s) => JSON.stringify(s);
export function fromJSON(text) { try { if (String(text).length > LIMITS.json) return null; return cleanSafety(JSON.parse(text)); } catch { return null; } }
export function toChunks(s, size = 11000) {
  const j = toJSON(s).replace(/[^\x20-\x7e]/g, (c) => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')), out = [];
  for (let i = 0; i < j.length; i += size) out.push({ i: out.length, s: j.slice(i, i + size) });
  return out.map((c) => ({ ...c, n: out.length }));
}
export function fromChunks(chunks) {
  const l = [...(chunks || [])].filter((c) => c && Number.isInteger(c.i) && typeof c.s === 'string').sort((a, b) => a.i - b.i);
  if (!l.length || l.some((c, k) => c.i !== k || c.n !== l.length)) return null;
  return fromJSON(l.map((c) => c.s).join(''));
}
export const projectEntry = (s) => ({ path: 'safety.json', text: toJSON(s) });
