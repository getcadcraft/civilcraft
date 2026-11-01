/* SPDX-License-Identifier: Apache-2.0 */
/**
 * feeds.js — IND.8: an imported stream table (streamtable.js readStreamTable) becomes the feeds of a process model (lib/process).
 *
 *   applyFeeds(model, table, {basis}) → { applied: [feedId], skipped: [{stream, why}], problems }
 *
 * A stream is applied only to a feed the model already has (same id once case and punctuation are ignored, process/model.js `norm`): a table
 * never adds a unit or a stream the drawing does not draw. Components match the model's property package by id, ignoring case; a component
 * of the table the package does not know is left out and said, and the feed then carries only the components both have. A stream with no flow
 * on the chosen basis, or none of the package's components, is skipped and named. Temperature and pressure come over as read (K, Pa).
 * The flows are written in the model's own units (flows: mol/s, massFlows: kg/s) by feedOf. DOM-free; mutates `model.flowsheet.feeds`.
 */
import { feedOf } from './streamtable.js';

/** The last stream table an importer read, for the PIDFEEDS command (one drawing session). */
export const stash = { table: null, name: '' };

const norm = (s) => String(s ?? '').toUpperCase().replace(/\(.*\)/, '').replace(/[^A-Z0-9]/g, '');

export function applyFeeds(model, table, { basis = null } = {}) {
  const fs = model && model.flowsheet;
  const out = { applied: [], skipped: [], problems: [] };
  if (!fs || !table || !Array.isArray(table.streams)) { out.problems.push({ code: 'feeds.none', severity: 'error', text: 'There is no process model or no stream table to apply.' }); return out; }
  const b = basis || (table.basis === 'mass' ? 'mass' : 'mole');
  const feedIds = Object.keys(fs.feeds || {});
  const byNorm = new Map(feedIds.map((id) => [norm(id), id]));
  const pkg = ((fs.thermo && fs.thermo.components) || []).map((c) => (typeof c === 'string' ? c : c && c.id)).filter(Boolean);
  const ids = {};
  for (const name of table.components || []) { const hit = pkg.find((p) => p.toLowerCase() === String(name).toLowerCase()); if (hit) ids[name] = hit; }
  const unknown = (table.components || []).filter((n) => !ids[n]);
  if (unknown.length) out.problems.push({ code: 'feeds.component', severity: 'warning', text: `Component(s) ${unknown.join(', ')} are not in the model's property package and were left out of the feeds.` });
  for (const s of table.streams) {
    const id = byNorm.get(norm(s.name));
    if (!id) { out.skipped.push({ stream: s.name, why: 'no feed of that name in the model' }); continue; }
    let f = feedOf(s, { basis: b, ids });
    if (f.missing) { const g = feedOf(s, { basis: b === 'mass' ? 'mole' : 'mass', ids }); if (!g.missing) f = g; }   // the table gave its flow on the other basis
    if (f.missing) { out.skipped.push({ stream: s.name, why: 'no flow on the ' + b + ' basis, or none of its components is in the package' }); continue; }
    const old = fs.feeds[id] || {};
    const next = { ...f };
    if (!Number.isFinite(next.T)) { if (old.T != null) next.T = old.T; else { out.skipped.push({ stream: s.name, why: 'no temperature' }); continue; } }
    if (!Number.isFinite(next.P)) { if (old.P != null) next.P = old.P; else { out.skipped.push({ stream: s.name, why: 'no pressure' }); continue; } }
    fs.feeds[id] = next;
    out.applied.push(id);
  }
  for (const k of out.skipped) out.problems.push({ code: 'feeds.skipped', severity: 'note', text: `Stream ${k.stream} was not applied: ${k.why}.` });
  return out;
}
