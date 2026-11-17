/* SPDX-License-Identifier: Apache-2.0 */
/**
 * symbol-link.js — an asset linked to a symbol: place once, each view shows the right form (0.10 booklet row BK.23, session
 * bk-r3-types-10). Canonical in lib/symbols/; copied byte for byte into a host's dev/ by `node tools/symbols/sync.mjs <host>`; never
 * edit a copy. No DOM, no imports: tools/bimcraft-test/eltypes-test.mjs runs it in Node. The rule only: a host keeps the links and the
 * views' settings its own way (BimCraft: asset-symbol.js, in the IFC).
 *
 * A LINK says which symbol of a registered symbol set (symbol-sets.js) stands for one placed element: { set, key, turn? (degrees the
 * symbol is turned against the element, 0 | 90 | 180 | 270) }. The element is ONE element: it has a body (3D), a plan form (what a
 * plan cuts or draws of it) and, through the link, a symbol. A count counts the element, never its forms.
 *
 * A VIEW shows linked elements in one FORM:
 *   VIEW_FORMS            ['plan', 'symbols']   'plan' = the plan form (what the view showed before the link); 'symbols' = the symbol
 *                         (a services layout: electrical, plumbing)
 *   formFor(view, link)   view { kind: 'plan' | 'rcp' | 'callout' | '3d' | 'section' | 'elevation', form? } → 'body' | 'plan' | 'symbol'
 *                         3D, sections and elevations always show the body; a plan, ceiling plan or callout shows the symbol when the
 *                         view's form is 'symbols' and the element has a link, else its plan form
 *   cleanLink(obj)        → { set, key, turn } | null   (untrusted: ids as symbol-sets.js keeps them)
 *   cleanForms(obj)       → { viewKey: 'symbols' }      only views that differ from 'plan' are kept
 *   countLinked(links)    → [{ set, key, count }]       each element once, however many views show it and in whatever form
 */
export const VIEW_FORMS = ['plan', 'symbols'];
const ID_RE = /^[a-z][a-z0-9._-]{0,47}$/;
const FLAT = ['plan', 'rcp', 'callout'];

export function cleanLink(obj) {
  if (!obj || typeof obj !== 'object' || !ID_RE.test(String(obj.set || '')) || !ID_RE.test(String(obj.key || ''))) return null;
  const turn = [0, 90, 180, 270].includes(Number(obj.turn)) ? Number(obj.turn) : 0;
  return { set: String(obj.set), key: String(obj.key), turn };
}
export function formFor(view, link) {
  if (!view || !FLAT.includes(view.kind)) return 'body';
  return link && view.form === 'symbols' ? 'symbol' : 'plan';
}
export function cleanForms(obj) {
  const out = {};
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return out;
  for (const [k, v] of Object.entries(obj)) if (v === 'symbols' && /^(plan|rcp|callout):[A-Za-z0-9_$-]{1,64}$/.test(k) && Object.keys(out).length < 2000) out[k] = 'symbols';
  return out;
}
export function countLinked(links) {
  const by = new Map(), seen = new Set();
  for (const l of links || []) {
    const id = l.guid ?? l.id;
    if (seen.has(id)) continue;
    seen.add(id);
    const k = l.set + '/' + l.key;
    if (!by.has(k)) by.set(k, { set: l.set, key: l.key, count: 0 });
    by.get(k).count++;
  }
  return [...by.values()];
}
