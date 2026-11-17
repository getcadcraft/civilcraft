// SPDX-License-Identifier: Apache-2.0
/**
 * office-reader.js — how an APP reads the office standard (BK.181, session office-std-10). The record is office-standard.js; this is the read side every host
 * shares, so CadCraft and BimCraft (and Super's apps) ask the same questions and get the same answers. Host-free: no DOM, no storage, no network; the host hands in
 * what it has and gets plain data back. Canonical in lib/office-standard/, copied byte for byte by tools/office-standard/sync.mjs; never edit a copy.
 *
 * A standard states only what the office decided. Everything here answers "not stated" (null / [] / the host's own value) for the rest, so an empty standard changes
 * nothing in an app that reads it (the rule of lib/annoscale: an empty standard means the app's own sizes). No number in this file is a drafting standard.
 *
 *   resolve({ project, shared, policies, name }) → { standard, from }    the standard in force: the project's own record if it states anything, else a shared one
 *                                                                          the host names, else the person's Default Policies, else an empty one. `from` says which.
 *   paperHeight(standard, kind, ownMm = null) → mm | ownMm                the paper height of text / dimension / tag / room / grid / title / schedule
 *   modelHeight(standard, kind, ratio, ownMm = null, unitMm = 1) → units  that height at a drawing scale 1 : ratio, in the host's drawing unit (lib/annoscale's sum)
 *   titleBlock(standard, values = {}) → { paper, fields: [{ key, label, value }] }   the office fields with the project's own values laid over them (a value the project
 *                                                                          gives wins; a key the office does not list is kept after the office's, in the order given)
 *   layerPlan(standard, existingNames = []) → { add: [{ name, color, purpose }], have: [name], extra: [name] }   which office layers the drawing lacks (compared without
 *                                                                          case); `extra` = layers the drawing has that the office does not list (never removed)
 *   templatesOf(standard, kind = null) → [{ name, kind, version }]        by reference: the host finds the template itself where templates are kept
 *   schedulePolicy(standard) → { group?, totals?, title?, headings? }     only what is stated
 *   policiesFor(standard) → { 'all.anno.text': 2.5, … }                   the Default Policies values (office-standard.toPolicies)
 *   describe(standard) → [{ section, text }]                              one plain line per section that states something (for an About / status line)
 */
import { cleanOffice, emptyOffice, isEmpty, fromPolicies, toPolicies, summary } from './office-standard.js';
import { KINDS, modelOf } from './annoscale.js';

export const SOURCES = ['project', 'shared', 'policies', 'none'];
const plain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** @param {{ project?: object, shared?: object, policies?: object, name?: string }} src each is whatever the host has: a record (or its `body`), a team_shared_item row, a Default Policies document */
export function resolve(src = {}) {
  const s = plain(src) ? src : {};
  const body = (x) => (plain(x) && plain(x.body) && !x.format ? x.body : x);
  const project = plain(s.project) ? cleanOffice(body(s.project)).standard : null;
  if (project && !isEmpty(project)) return { standard: project, from: 'project' };
  const shared = plain(s.shared) ? cleanOffice(body(s.shared)).standard : null;
  if (shared && !isEmpty(shared)) return { standard: shared, from: 'shared' };
  const pol = fromPolicies(plain(s.policies) ? s.policies : {}, s.name || '');
  if (!isEmpty(pol)) return { standard: pol, from: 'policies' };
  return { standard: emptyOffice(s.name || ''), from: 'none' };
}

export function paperHeight(standard, kind, ownMm = null) {
  if (!KINDS.includes(kind)) return ownMm;
  const v = cleanOffice(standard).standard.annotation.heights[kind];
  return typeof v === 'number' ? v : ownMm;
}

export function modelHeight(standard, kind, ratio, ownMm = null, unitMm = 1) {
  const mm = paperHeight(standard, kind, ownMm);
  return mm === null || !(ratio > 0) ? null : modelOf(mm, ratio, unitMm);
}

export function titleBlock(standard, values = {}) {
  const s = cleanOffice(standard).standard, v = plain(values) ? values : {};
  const fields = s.titleBlock.fields.map((f) => ({ key: f.key, label: f.label, value: Object.prototype.hasOwnProperty.call(v, f.key) ? String(v[f.key] ?? '') : f.value }));
  const known = new Set(fields.map((f) => f.key));
  for (const k of Object.keys(v)) if (!known.has(k) && /^[a-z][a-z0-9_]{0,31}$/.test(k)) fields.push({ key: k, label: k, value: String(v[k] ?? '') });
  return { paper: s.titleBlock.paper, fields };
}

export function layerPlan(standard, existingNames = []) {
  const s = cleanOffice(standard).standard, have = new Set((Array.isArray(existingNames) ? existingNames : []).map((n) => String(n).toLowerCase()));
  const add = [], haveOut = [], listed = new Set();
  for (const l of s.drawingLayers) {
    listed.add(l.name.toLowerCase());
    if (have.has(l.name.toLowerCase())) haveOut.push(l.name); else add.push({ name: l.name, color: l.color, purpose: l.purpose });
  }
  const extra = (Array.isArray(existingNames) ? existingNames : []).map(String).filter((n) => !listed.has(n.toLowerCase()));
  return { add, have: haveOut, extra };
}

export const templatesOf = (standard, kind = null) => cleanOffice(standard).standard.templates.filter((t) => !kind || t.kind === kind).map((t) => ({ ...t }));
export const schedulePolicy = (standard) => ({ ...cleanOffice(standard).standard.schedules.policy });
export const policiesFor = (standard) => toPolicies(standard);

export function describe(standard) {
  const n = summary(standard), out = [];
  if (n.annotation) out.push({ section: 'annotation', text: `${n.annotation} text height${n.annotation === 1 ? '' : 's'} on paper` });
  if (n.titleBlockFields) out.push({ section: 'titleBlock', text: `${n.titleBlockFields} title block field${n.titleBlockFields === 1 ? '' : 's'}` });
  if (n.drawingLayers) out.push({ section: 'drawingLayers', text: `${n.drawingLayers} layer${n.drawingLayers === 1 ? '' : 's'}` });
  if (n.templates) out.push({ section: 'templates', text: `${n.templates} template${n.templates === 1 ? '' : 's'}` });
  if (n.schedules) out.push({ section: 'schedules', text: `${n.schedules} schedule setting${n.schedules === 1 ? '' : 's'}` });
  return out;
}
