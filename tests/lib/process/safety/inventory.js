/* SPDX-License-Identifier: Apache-2.0 */
/**
 * inventory.js — chemical inventory, SDS and compatibility (0.8 Track CH, CH.18; DOM-free). What is stored where, SDS sections, a reactivity matrix by reactive group
 * and threshold checks, all as DATA PACKS in the style of REG.1 (the regulation packs): the code knows no regulation and no matrix, it only reads a pack.
 *
 *   NO regulatory threshold number is typed in this folder. The bundled threshold pack list is EMPTY except a made-up test pack; a jurisdiction's pack (US PSM / RMP lists,
 *   others) is typed by a person from the regulation with the text open, carries its clause and review state, and is added through the Library. Likewise the bundled
 *   reactivity pack is a small STARTER set of well-known hazardous pairs, labelled as incomplete: silence in a matrix is never a statement of compatibility.
 *
 *   item  { id, chem: { name, cas, groups: [group ids] }, qty (kg), state, location: { id, kind, tag }, process, container, sds: { rev, supplier, sections: { 1..16: text } } }
 *   threshold pack { format: 'cadcraft-threshold-pack', version: 1, id, name, jurisdiction, regulation, edition, review: { state }, warnFraction, rules: [{ id, clause, match: { cas | group }, basis: 'process' | 'location' | 'site', qty (kg), name }] }
 *   reactivity pack { format: 'cadcraft-reactivity-pack', version: 1, id, name, review, groups: [{ id, name }], pairs: [{ a, b, effect, note }] }
 *
 *   cleanInventory · addItem · locationTable · sdsGaps · compatibility · thresholds · check · toCsv
 */
import { str, num, pos, list, oneOf, nextId, problem, DISCLAIMER } from './common.js';

export const SDS_SECTIONS = [
  'Identification', 'Hazard(s) identification', 'Composition and information on ingredients', 'First-aid measures', 'Fire-fighting measures', 'Accidental release measures', 'Handling and storage',
  'Exposure controls and personal protection', 'Physical and chemical properties', 'Stability and reactivity', 'Toxicological information', 'Ecological information', 'Disposal considerations',
  'Transport information', 'Regulatory information', 'Other information',
];
export const SOURCES = { sds: 'The 16 section headings of the GHS safety data sheet, in order (vocabulary only)', starter: 'Starter reactivity pairs: widely taught hazards (acid + base heat, oxidiser + fuel, cyanide + acid, hypochlorite + ammonia or acid, water-reactive + water), not the NOAA matrix' };
export const REVIEW = { state: 'not confirmed', note: 'The starter reactivity pairs are a short list of well-known hazards. They are not complete and not a regulatory matrix; a pair that is missing is NOT compatible by default.' };
const KINDS = ['tank', 'room', 'area', 'tankfarm', 'cabinet', 'site'];

export const STARTER_REACTIVITY = Object.freeze({
  format: 'cadcraft-reactivity-pack', version: 1, id: 'starter', name: 'Starter reactive pairs (incomplete)', review: { state: 'not confirmed' },
  groups: [{ id: 'acid', name: 'Acids' }, { id: 'base', name: 'Bases' }, { id: 'oxidiser', name: 'Oxidisers' }, { id: 'flammable', name: 'Flammable or combustible' }, { id: 'cyanide', name: 'Cyanides and sulfides' }, { id: 'hypochlorite', name: 'Hypochlorites' }, { id: 'ammonia', name: 'Ammonia and amines' }, { id: 'water-reactive', name: 'Water-reactive' }, { id: 'water', name: 'Water or aqueous' }],
  pairs: [
    { a: 'acid', b: 'base', effect: 'heat', note: 'Neutralisation releases heat; violent when concentrated.' },
    { a: 'oxidiser', b: 'flammable', effect: 'fire or explosion', note: 'An oxidiser with a fuel can ignite or explode.' },
    { a: 'cyanide', b: 'acid', effect: 'toxic gas', note: 'Releases hydrogen cyanide or hydrogen sulfide.' },
    { a: 'hypochlorite', b: 'acid', effect: 'toxic gas', note: 'Releases chlorine.' },
    { a: 'hypochlorite', b: 'ammonia', effect: 'toxic gas', note: 'Releases chloramines.' },
    { a: 'water-reactive', b: 'water', effect: 'heat, gas or fire', note: 'Reacts with water.' },
    { a: 'oxidiser', b: 'acid', effect: 'toxic gas or heat', note: 'Some oxidising salts release toxic gases with acid.' },
  ],
});
/** A made-up pack for tests and for showing the format. It is not a regulation; its name says so. */
export const EXAMPLE_THRESHOLDS = Object.freeze({
  format: 'cadcraft-threshold-pack', version: 1, id: 'example-thresholds', name: 'Example thresholds (made up, for tests)', jurisdiction: 'Nowhere', regulation: 'None: example numbers only', edition: '0', review: { state: 'not confirmed' }, warnFraction: 0.8,
  rules: [{ id: 'ex.1', clause: 'example rule 1', match: { cas: '000-00-0' }, basis: 'process', qty: 1000, name: 'Example chemical' }, { id: 'ex.2', clause: 'example rule 2', match: { group: 'flammable' }, basis: 'site', qty: 5000, name: 'Any flammable' }],
});

export const newInventory = () => ({ items: [], locations: [], extraPairs: [] });
export function cleanItem(r, i = 0) {
  const sections = {}; for (const [k, v] of Object.entries(r.sds?.sections && typeof r.sds.sections === 'object' ? r.sds.sections : {}).slice(0, 16)) { const n = +k; if (n >= 1 && n <= 16 && str(v, 4000)) sections[n] = str(v, 4000); }
  return { id: str(r.id, 16) || 'I' + (i + 1), chem: { name: str(r.chem?.name, 120), cas: str(r.chem?.cas, 20), groups: list(r.chem?.groups, 8, 30) }, qty: pos(r.qty) ?? 0, state: oneOf(r.state, ['gas', 'liquid', 'solid'], 'liquid'),
    location: { id: str(r.location?.id, 24), kind: oneOf(r.location?.kind, KINDS, 'area'), tag: str(r.location?.tag, 24) }, process: str(r.process, 40), container: str(r.container, 60),
    sds: { rev: str(r.sds?.rev, 10), supplier: str(r.sds?.supplier, 80), sections } };
}
export function cleanInventory(raw) {
  const v = newInventory(); if (!raw || typeof raw !== 'object') return v;
  v.items = (Array.isArray(raw.items) ? raw.items : []).slice(0, 5000).filter((r) => r && typeof r === 'object').map(cleanItem);
  v.extraPairs = (Array.isArray(raw.extraPairs) ? raw.extraPairs : []).slice(0, 200).map((p) => ({ a: str(p?.a, 30), b: str(p?.b, 30), effect: str(p?.effect, 60), note: str(p?.note, 200) })).filter((p) => p.a && p.b);
  return v;
}
export function addItem(inv, item) { if (inv.items.length >= 5000) throw new Error('At most 5000 items.'); const c = cleanItem({ ...item, id: item.id || nextId('I', inv.items) }, inv.items.length); inv.items.push(c); return c; }

export function cleanThresholdPack(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== 'cadcraft-threshold-pack' || raw.version !== 1) return null;
  const rules = (Array.isArray(raw.rules) ? raw.rules : []).slice(0, 2000).map((r) => ({ id: str(r?.id, 30), clause: str(r?.clause, 80), name: str(r?.name, 120), match: { cas: str(r?.match?.cas, 20), group: str(r?.match?.group, 30) }, basis: oneOf(r?.basis, ['process', 'location', 'site'], 'site'), qty: pos(r?.qty) })).filter((r) => r.id && r.qty && (r.match.cas || r.match.group));
  return { format: 'cadcraft-threshold-pack', version: 1, id: str(raw.id, 40), name: str(raw.name, 120), jurisdiction: str(raw.jurisdiction, 80), regulation: str(raw.regulation, 160), edition: str(raw.edition, 40), review: { state: raw.review?.state === 'confirmed' && str(raw.review?.by, 80) ? 'confirmed' : 'not confirmed', by: str(raw.review?.by, 80) }, warnFraction: num(raw.warnFraction) > 0 && raw.warnFraction < 1 ? raw.warnFraction : 0.8, rules };
}
export function cleanReactivityPack(raw) {
  if (!raw || typeof raw !== 'object' || raw.format !== 'cadcraft-reactivity-pack' || raw.version !== 1) return null;
  const groups = (Array.isArray(raw.groups) ? raw.groups : []).slice(0, 200).map((g) => ({ id: str(g?.id, 30), name: str(g?.name, 80) })).filter((g) => g.id), ids = new Set(groups.map((g) => g.id));
  const pairs = (Array.isArray(raw.pairs) ? raw.pairs : []).slice(0, 5000).map((p) => ({ a: str(p?.a, 30), b: str(p?.b, 30), effect: str(p?.effect, 60), note: str(p?.note, 200) })).filter((p) => ids.has(p.a) && ids.has(p.b));
  return { format: 'cadcraft-reactivity-pack', version: 1, id: str(raw.id, 40), name: str(raw.name, 120), review: { state: raw.review?.state === 'confirmed' && str(raw.review?.by, 80) ? 'confirmed' : 'not confirmed', by: str(raw.review?.by, 80) }, groups, pairs };
}

/** Quantities by location (kg), with the items in each. */
export function locationTable(inv) {
  const m = new Map();
  for (const it of inv.items) { const id = it.location.id || '(no location)'; if (!m.has(id)) m.set(id, { id, kind: it.location.kind, tag: it.location.tag, total: 0, items: [] }); const r = m.get(id); r.total += it.qty; r.items.push(it.id); }
  return [...m.values()];
}
/** Missing SDS sections of an item: sections 1 to 11 and 16 are `warning`, 12 to 15 are `note`. */
export function sdsGaps(it) { const out = []; for (let n = 1; n <= 16; n++) if (!it.sds.sections[n]) out.push({ section: n, name: SDS_SECTIONS[n - 1], severity: n >= 12 && n <= 15 ? 'note' : 'warning' }); return out; }

/** Pairs of items in the same location whose groups meet in a pack pair (one entry per item pair; `others` = further pairs that also match). → [{ location, a, b, pair, others }] */
export function compatibility(inv, pack = STARTER_REACTIVITY) {
  const pairs = pack.pairs.concat(inv.extraPairs || []), out = [], byLoc = new Map();
  for (const it of inv.items) { const k = it.location.id; if (!k) continue; (byLoc.get(k) || byLoc.set(k, []).get(k)).push(it); }
  for (const [loc, items] of byLoc) for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) {
    const hit = pairs.filter((p) => { const A = items[i].chem.groups, B = items[j].chem.groups; return (A.includes(p.a) && B.includes(p.b)) || (A.includes(p.b) && B.includes(p.a)); });
    if (hit.length) out.push({ location: loc, a: items[i].id, b: items[j].id, pair: hit[0], others: hit.slice(1) });
  }
  return out;
}
/** Threshold checks: per rule, the quantity of the matching items by basis against the rule's quantity. → [{ rule, basis, key, qty, threshold, ratio, over, near, items }] */
export function thresholds(inv, pack) {
  const out = [];
  for (const r of pack.rules) {
    const match = inv.items.filter((it) => (r.match.cas ? it.chem.cas === r.match.cas : it.chem.groups.includes(r.match.group)));
    const keyOf = (it) => (r.basis === 'process' ? it.process : r.basis === 'location' ? it.location.id : 'site');
    const groups = new Map(); for (const it of match) { const k = keyOf(it) || '(none)'; (groups.get(k) || groups.set(k, []).get(k)).push(it); }
    for (const [key, items] of groups) { const qty = items.reduce((s, x) => s + x.qty, 0), ratio = qty / r.qty; out.push({ rule: r.id, clause: r.clause, name: r.name, basis: r.basis, key, qty, threshold: r.qty, ratio, over: ratio >= 1, near: ratio >= pack.warnFraction && ratio < 1, items: items.map((x) => x.id) }); }
  }
  return out;
}
/** Problems (shared shape). `ctx` = { thresholdPacks: [pack], reactivity: pack, pid: { equipment } }. Threshold problems carry the pack and clause (rule 29). */
export function check(inv, ctx = {}) {
  const out = [], packs = ctx.thresholdPacks || [], rp = ctx.reactivity || STARTER_REACTIVITY;
  for (const it of inv.items) {
    const about = [{ kind: 'inventory-item', id: it.id, label: it.chem.name }];
    if (!it.chem.name) out.push(problem('inv.name', 'warning', `Item ${it.id} has no chemical name.`, about));
    if (!it.chem.cas) out.push(problem('inv.cas', 'note', `Item ${it.id} (${it.chem.name || 'unnamed'}) has no CAS number, so threshold lists cannot be matched.`, about));
    if (!(it.qty > 0)) out.push(problem('inv.qty', 'warning', `Item ${it.id} has no quantity.`, about));
    if (!it.location.id) out.push(problem('inv.location', 'warning', `Item ${it.id} is not placed anywhere.`, about));
    if (!it.chem.groups.length) out.push(problem('inv.groups', 'note', `Item ${it.id} has no reactive group, so it is not in the compatibility check.`, about));
    const gaps = sdsGaps(it), core = gaps.filter((g) => g.severity === 'warning');
    if (!it.sds.rev && !Object.keys(it.sds.sections).length) out.push(problem('sds.none', 'warning', `Item ${it.id} has no safety data sheet on file.`, about));
    else if (core.length) out.push(problem('sds.gaps', 'warning', `The safety data sheet of ${it.id} lacks section${core.length > 1 ? 's' : ''} ${core.slice(0, 6).map((g) => g.section).join(', ')}.`, about));
    if (ctx.pid && it.location.tag && !(ctx.pid.equipment || []).some((e) => String(e.tag).toUpperCase() === it.location.tag.toUpperCase())) out.push(problem('inv.tag', 'warning', `Item ${it.id} is in ${it.location.tag}, which is not on the P&ID.`, about));
  }
  for (const c of compatibility(inv, rp)) out.push(problem('inv.incompatible', 'error', `${c.a} and ${c.b} are stored together in ${c.location} and meet in a known hazard (${c.pair.effect}): ${c.pair.note}`, [{ kind: 'inventory-item', id: c.a }, { kind: 'inventory-item', id: c.b }]));
  for (const pk of packs) for (const t of thresholds(inv, pk)) {
    if (!t.over && !t.near) continue;
    out.push(problem('inv.threshold', t.over ? 'warning' : 'note', `${t.name || t.rule}: ${t.qty} kg ${t.basis === 'site' ? 'on the site' : 'in ' + t.key} is ${(t.ratio * 100).toFixed(0)} % of the ${t.threshold} kg in ${pk.name}, ${t.clause}${t.over ? ' (reached)' : ''}. Review state of the pack: ${pk.review.state}.`,
      t.items.slice(0, 20).map((id) => ({ kind: 'inventory-item', id })), { source: { kind: 'regulation', name: 'process.safety', pack: { id: pk.id, name: pk.name, edition: pk.edition, clause: t.clause, jurisdiction: pk.jurisdiction, review: pk.review.state } }, req: { op: '<=', value: t.threshold, unit: 'kg' }, found: { value: t.qty, unit: 'kg' } }));
  }
  return out;
}
const cell = (s) => { let t = String(s ?? ''); if (/^[=+\-@\t\r]/.test(t)) t = "'" + t; return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t; };
export function toCsv(inv) {
  const head = ['Item', 'Chemical', 'CAS', 'Quantity kg', 'State', 'Location', 'Kind', 'Process', 'Groups', 'SDS revision', 'SDS sections on file'];
  return [cell(DISCLAIMER), head.join(','), ...inv.items.map((it) => [it.id, it.chem.name, it.chem.cas, it.qty, it.state, it.location.id, it.location.kind, it.process, it.chem.groups.join(' '), it.sds.rev, Object.keys(it.sds.sections).length + '/16'].map(cell).join(','))].join('\r\n') + '\r\n';
}
