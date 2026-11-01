/* SPDX-License-Identifier: Apache-2.0 */
/**
 * fittingk.js — fitting losses by the 2-K (Hooper 1981) and 3-K (Darby 1999) forms from a `cadcraft-fitting-k-pack` (0.8 CH.10, chem-mount_PART_5). DOM-free. The formulas are k2K / k3K of
 * transient.js (written here); the constants are DATA in a pack, never in this code. The bundled pack (fittingk-data.js) is a DRAFT: its numbers were taken from the tables of the MIT-licensed
 * `fluids` library and have not been checked against the papers by an engineer, and every result carries that. Without a pack the functions stop and say what is needed (NEEDS_SOURCE_K).
 *
 *   cleanFittingPack(raw)                → { ok, problems, pack, reviewed }       format, both methods, finite numbers, unique ids
 *   bundled()                            → the draft pack (cleaned)
 *   listFittings(pack, method?)          → [{ method, id, label, category, source, note? }]
 *   fittingK(pack, { method, id, Re, Dinch, v? }) → { K, method, fitting, form, headLoss_m?, notes, draft, sources }
 *      2K: Dinch = actual inside diameter [in]      3K: Dinch = nominal pipe size [in]         v [m/s] gives the head loss K v^2 / 2g
 */
import { k2K, k3K, NEEDS_SOURCE_K } from './transient.js';

const G = 9.80665;
export { NEEDS_SOURCE_K };
export const DRAFT_NOTE = 'Draft constants taken from the MIT-licensed fluids library\'s tables of the Hooper (1981) and Darby (1999) methods; not yet checked against the original papers by an engineer.';
const FIELDS = { '2K': ['K1', 'Kinf'], '3K': ['K1', 'Ki', 'Kd'] };

export function cleanFittingPack(raw) {
  const p = raw && typeof raw === 'object' ? raw : {}, problems = [];
  const need = (c, t) => { if (!c) problems.push(t); };
  need(p.format === 'cadcraft-fitting-k-pack', 'format must be cadcraft-fitting-k-pack');
  need(typeof p.source === 'string' && p.source.length > 3, 'name the source (book, paper or table)');
  need(p.methods && typeof p.methods === 'object', 'methods are missing');
  for (const m of ['2K', '3K']) {
    const list = p.methods && p.methods[m] && p.methods[m].fittings;
    if (!Array.isArray(list) || !list.length) { problems.push(`method ${m} has no fittings`); continue; }
    const seen = new Set();
    for (const f of list) {
      if (!f || typeof f.id !== 'string' || !f.id) { problems.push(`method ${m}: a fitting has no id`); continue; }
      if (seen.has(f.id)) problems.push(`method ${m}: duplicate fitting ${f.id}`);
      seen.add(f.id);
      for (const k of FIELDS[m]) if (!(typeof f[k] === 'number' && Number.isFinite(f[k]) && f[k] >= 0)) problems.push(`method ${m}: ${f.id} has no number ${k}`);
    }
  }
  return { ok: problems.length === 0, problems, pack: p, reviewed: !!(p.review && p.review.state === 'confirmed' && p.review.by && p.review.date) };
}

let draft = null;
export async function bundled() { if (!draft) { const { FITTING_K_PACK } = await import('./fittingk-data.js'); draft = cleanFittingPack(FITTING_K_PACK); } return draft; }

const needs = (why) => { const e = new Error(NEEDS_SOURCE_K + (why ? ' (' + why + ')' : '')); e.needsSource = true; return e; };

export function listFittings(pack, method = null) {
  const c = cleanFittingPack(pack); if (!c.ok) throw needs(c.problems.join('; '));
  return ['2K', '3K'].filter((m) => !method || m === method).flatMap((m) => c.pack.methods[m].fittings.map((f) => ({ method: m, id: f.id, label: f.label || f.source || f.id, category: f.category || '', source: f.source || '', ...(f.note ? { note: f.note } : {}) })));
}

export function fittingK(pack, { method = '3K', id, Re, Dinch, v = null } = {}) {
  const c = cleanFittingPack(pack); if (!c.ok) throw needs(c.problems.join('; '));
  if (method !== '2K' && method !== '3K') throw new Error('method must be 2K or 3K');
  const f = c.pack.methods[method].fittings.find((x) => x.id === id);
  if (!f) throw new Error(`No fitting "${id}" in the ${method} table of this pack.`);
  if (!(Re > 0)) throw new Error('Re must be a positive number');
  if (!(Dinch > 0)) throw new Error('give the pipe size in inches (' + (method === '2K' ? 'actual inside diameter' : 'nominal size') + ')');
  const K = method === '2K' ? k2K(f, Re, Dinch) : k3K(f, Re, Dinch);
  const notes = [];
  if (f.note) notes.push(f.note);
  if (!c.reviewed) notes.push(c.pack.review && c.pack.review.state === 'draft' ? DRAFT_NOTE : 'The pack is NOT reviewed: nothing here is checked against the papers.');
  if (Re < 100) notes.push('Re below 100: the K1/Re term dominates; the methods are fitted for turbulent and transitional flow, so treat this as an extrapolation.');
  const out = { K, method, fitting: { id: f.id, label: f.label || f.source, category: f.category, source: f.source }, form: c.pack.methods[method].form, notes, draft: !c.reviewed, review: (c.pack.review && c.pack.review.state) || 'unknown',
    sources: (c.pack.provenance && c.pack.provenance.primary) || [c.pack.source] };
  if (v != null) { if (!(v >= 0)) throw new Error('v must be a velocity in m/s'); out.headLoss_m = K * v * v / (2 * G); }
  return out;
}

/**
 * The summed K of a list of fittings on one link at that link's own Re and diameter (0.8 CH.10: the network solver calls this at every iteration, so K follows the flow).
 *   list = [{ method?: '2K' | '3K' (default '3K'), id, count? (default 1) }]    Dinch = the link's inside diameter [in] (3-K uses it as the nominal size unless the fitting row gives `nps`)
 * Synchronous; `pack` must already be a pack object. Cleaned once per pack object. Throws on an unknown fitting (a typo must not pass as K = 0).
 */
const cleaned = new WeakMap();
export function kOfList(pack, list, Re, Dinch) {
  let c = cleaned.get(pack); if (!c) { c = cleanFittingPack(pack); cleaned.set(pack, c); }
  if (!c.ok) throw needs(c.problems.join('; '));
  let K = 0;
  for (const f of list || []) {
    const method = f.method === '2K' ? '2K' : '3K', row = c.pack.methods[method].fittings.find((x) => x.id === f.id);
    if (!row) throw new Error(`No fitting "${f.id}" in the ${method} table of the fitting pack.`);
    const n = f.count == null ? 1 : +f.count; if (!(n >= 0)) throw new Error('a fitting count must be zero or more');
    K += n * (method === '2K' ? k2K(row, Re, Dinch) : k3K(row, Re, f.nps > 0 ? f.nps : Dinch));
  }
  return K;
}
export const isPack = (p) => !!p && typeof p === 'object' && p.format === 'cadcraft-fitting-k-pack';
