/* SPDX-License-Identifier: Apache-2.0 */
/**
 * document.js — a standalone Engineer document (0.8 CE.12): the part a host without its own feature tree keeps its Generated bodies in,
 * and the file they are saved as. A host that has a document of its own (a part file) does not need it. DOM-free.
 *
 *   file  { format: 'cadcraft-engineer', version: 1, name, features: [ { id, name, type: 'generated', …the Generated feature (generated.js) } ] }
 *   newDocument(name) · add(doc, type, props) → the feature · byId(doc, id) · remove(doc, id)     (`features` of the adapter: add, byId)
 *   writeDocument(doc) → text (stable key order: the same document gives the same bytes) · readDocument(text) → doc (untrusted: every feature
 *   goes through readGenerated; a bad file throws with the module's words)
 */
import { GEN_DEFAULTS, GEN_BASE, readGenerated } from './generated.js';
import { t } from './host.js';

export const FORMAT = 'cadcraft-engineer', VERSION = 1, EXT = '.ccengineer';
export const MAX_FEATURES = 200, MAX_BYTES = 256 * 1024 * 1024;
const name = (s, max = 120) => String(s ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);

export const newDocument = (nm = '') => ({ name: name(nm), features: [], seq: 1 });
export function add(doc, type, props = {}) {
  if (type !== 'generated') throw new Error(t('gb.file.bad.the_operation', { name: type }));
  if (doc.features.length >= MAX_FEATURES) throw new Error(t('gb.err.too_big', { n: MAX_FEATURES }));
  const n = doc.seq++;
  const f = { id: 'g' + n, name: GEN_BASE.generated + ' ' + n, type, ...GEN_DEFAULTS.generated(), ...props };
  doc.features.push(f);
  return f;
}
export const byId = (doc, id) => doc.features.find((f) => f.id === id) || null;
export function remove(doc, id) { const i = doc.features.findIndex((f) => f.id === id); if (i >= 0) doc.features.splice(i, 1); return i >= 0; }

export function writeDocument(doc) {
  return JSON.stringify({ format: FORMAT, version: VERSION, name: doc.name, features: doc.features.map((f) => ({ ...f })) }) + '\n';
}
export function readDocument(text) {
  if (typeof text !== 'string' || text.length > MAX_BYTES) throw new Error(t('gb.ui.add.bad'));
  let j; try { j = JSON.parse(text); } catch { throw new Error(t('gb.ui.add.bad')); }
  if (!j || j.format !== FORMAT || j.version !== VERSION || !Array.isArray(j.features) || j.features.length > MAX_FEATURES) throw new Error(t('gb.ui.add.bad'));
  const doc = newDocument(j.name);
  const seen = new Set();
  for (const f of j.features) {
    if (!f || typeof f.id !== 'string' || !/^[A-Za-z0-9._-]{1,40}$/.test(f.id) || seen.has(f.id)) throw new Error(t('gb.ui.add.bad'));
    seen.add(f.id);
    const g = { id: f.id, name: name(f.name, 80) || f.id, type: 'generated' };
    if (!readGenerated(f, g, {})) throw new Error(t('gb.ui.add.bad'));
    doc.features.push(g);
  }
  doc.seq = doc.features.reduce((m, f) => Math.max(m, +(/^g(\d+)$/.exec(f.id) || [0, 0])[1]), 0) + 1;
  return doc;
}
