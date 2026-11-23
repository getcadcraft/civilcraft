/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rules.js — a place's own rules as data (0.11 LR.9): the lot minimums a zone sets, the figures its law states about changing a parcel, and
 * the forms it asks for, each with the document, the clause and the words it was read in. DOM-free; Node-tested.
 *
 * THE ENGINE HOLDS NO PLACE'S RULE. A rule pack is a file: a side add-on puts one on the page (globalThis.ccLandRules), or the person opens
 * one. Every figure in a pack names its source and says how it was read: 'primary' (in the authority's own text), 'secondary' (in someone's
 * summary of it). A figure with neither is not carried. The unit conversion is done HERE, exactly, from the figure as printed, so nobody
 * types a converted number.
 *
 *   RULES_FORMAT 'cadcraft-land-rules' · UNITS (what a printed figure may be in)
 *   cleanRulePack(o) → { ok, pack, problems } | { ok: false, why: 'format' | 'newer' | 'empty' }      (untrusted: a file)
 *     pack = { format, version: 1, id, name, country, researched, note, sources: [{ key, title, edition, publisher, url }],
 *              rules: [{ zone, zoneName, rule: 'area.min' | 'width.min' | 'depth.min', value, unit (as printed), si (m² or m), source, clause, quote, read, note,
 *                        partial? (true: the text says "a yard distance + this figure"; the figure alone is only a floor) }],
 *              thresholds: [{ id, what, value | null, unit, source, clause, quote, read, note }],
 *              forms: [{ id, title, edition, authority, source, read, note }], templates: a cadcraft-land-templates pack | null,
 *              base: '' | the id of the pack this one stands on (a city on its state) }
 *   resolvePlace(pack, all) → the pack with its base's rows behind its own (or with `baseMissing`)
 *   zonesOf(pack) → [{ zone, zoneName, area: [rule], width: [rule], depth: [rule] }]   (several rows for one zone and rule = the text gives more than one case)
 *   zoneKey(text) → the form zones are matched in ("R-1", "r1" and "R 1" are one zone)
 *   depthFrom(ring, a, b) → how far the outline reaches from the line a–b (project units)
 *   checkPlace(lots, pack) → { findings, unjudged, judged }
 *     lots: [{ name, zone, areaM2, widthM | null, depthM | null }]   zone may name several cases, separated by a comma
 *     findings: [{ code: 'minarea' | 'minwidth' | 'mindepth', lot, zone, value, limit (SI), printed ("5,000 sq ft"), rule }]
 *     unjudged: [{ lot, why: 'nozone' | 'unknownzone' | 'nomeasure' | 'several' | 'partial', zone?, rule? }]   never a pass: what could not be compared is said
 *   printed(rule) → "5,000 sq ft" · citeOf(pack, rule) → "Title (edition), clause"
 */
import { cleanPack } from './documents.js';

export const RULES_FORMAT = 'cadcraft-land-rules';
/** Square metres or metres in one of each printed unit. The foot is the international foot (0.3048 m exactly), the acre 43,560 of its squares. */
export const UNITS = { 'm²': ['area', 1], m2: ['area', 1], ha: ['area', 10000], 'sq ft': ['area', 0.09290304], ac: ['area', 4046.8564224], m: ['length', 1], ft: ['length', 0.3048] };
const KIND = { 'area.min': 'area', 'width.min': 'length', 'depth.min': 'length' };
const READS = ['primary', 'secondary'];
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').trim().slice(0, n);
const idOk = (v) => /^[a-z][a-z0-9-]{1,40}$/.test(String(v));
const web = (v) => { const s = str(v, 500); return /^https:\/\/[^\s"'<>]+$/.test(s) ? s : ''; };

export const zoneKey = (v) => String(v ?? '').toUpperCase().replace(/[\s._-]+/g, '');

export function cleanRulePack(o) {
  if (!o || typeof o !== 'object' || o.format !== RULES_FORMAT) return { ok: false, why: 'format' };
  if (o.version !== 1) return { ok: false, why: 'newer' };
  const problems = [], sources = [], keys = new Set();
  for (const s of (Array.isArray(o.sources) ? o.sources : []).slice(0, 100)) { if (!s || !idOk(s.key) || keys.has(s.key)) continue; keys.add(s.key); sources.push({ key: s.key, title: str(s.title, 300) || s.key, edition: str(s.edition, 200), publisher: str(s.publisher, 200), url: web(s.url) }); }
  const cited = (r, what) => { if (!keys.has(r?.source)) { problems.push(what + ': names no source of this pack, left out'); return false; } if (!READS.includes(r.read)) { problems.push(what + ': does not say how it was read, left out'); return false; } return true; };
  const rules = [];
  for (const r of (Array.isArray(o.rules) ? o.rules : []).slice(0, 2000)) {
    const what = 'rule ' + str(r?.zone, 40) + ' ' + str(r?.rule, 20);
    if (!r || typeof r !== 'object' || !KIND[r.rule] || !zoneKey(r.zone)) { problems.push(what + ': not a rule this build knows, left out'); continue; }
    const u = UNITS[r.unit], v = Number(r.value);
    if (!u || u[0] !== KIND[r.rule] || !(Number.isFinite(v) && v > 0 && v < 1e9)) { problems.push(what + ': no usable figure or unit, left out'); continue; }
    if (!cited(r, what)) continue;
    rules.push({ zone: str(r.zone, 40), zoneName: str(r.zoneName, 200), rule: r.rule, value: v, unit: r.unit, si: v * u[1], source: r.source, clause: str(r.clause, 200), quote: str(r.quote, 400), read: r.read, note: str(r.note, 600), ...(r.partial === true ? { partial: true } : {}) });
  }
  const thresholds = [];
  for (const t of (Array.isArray(o.thresholds) ? o.thresholds : []).slice(0, 400)) {
    if (!t || typeof t !== 'object' || !str(t.what, 400) || !cited(t, 'threshold ' + str(t?.id, 60))) continue;
    const v = t.value === null || t.value === undefined || t.value === '' ? null : Number(t.value);
    thresholds.push({ id: str(t.id, 60), what: str(t.what, 400), value: Number.isFinite(v) ? v : null, unit: str(t.unit, 40), source: t.source, clause: str(t.clause, 200), quote: str(t.quote, 400), read: t.read, note: str(t.note, 600) });
  }
  const forms = [];
  for (const f of (Array.isArray(o.forms) ? o.forms : []).slice(0, 50)) { if (!f || typeof f !== 'object' || !str(f.title, 200) || !cited(f, 'form ' + str(f?.id, 60))) continue; forms.push({ id: str(f.id, 60), title: str(f.title, 200), edition: str(f.edition, 200), authority: str(f.authority, 200), source: f.source, read: f.read, note: str(f.note, 600) }); }
  let templates = null;
  if (o.templates) { const c = cleanPack(o.templates); if (c.ok) templates = c.pack; else problems.push('the papers of this pack could not be read'); }
  if (!rules.length && !thresholds.length && !forms.length && !templates) return { ok: false, why: 'empty', problems };
  return { ok: true, problems, pack: { format: RULES_FORMAT, version: 1, id: idOk(o.id) ? o.id : 'place', name: str(o.name, 160) || 'Place', country: str(o.country, 8), researched: /^\d{4}-\d{2}-\d{2}$/.test(String(o.researched)) ? o.researched : '', base: idOk(o.base) ? o.base : '', note: str(o.note, 1200), sources, rules, thresholds, forms, templates } };
}

/**
 * A pack that stands on another (a city on its state: `base` names the other pack's id) seen as one: its own rows first, then the base's
 * figures of the law, forms, sources and the lot figures of zones it does not have itself. `baseMissing` is the base's id when that pack
 * is not among `all` (its add-on is off): the city's own rows still stand, and the panel says what is missing.
 */
export function resolvePlace(pack, all) {
  if (!pack || !pack.base) return pack;
  const base = (all || []).find((x) => x && x.id === pack.base && !x.base);
  if (!base) return { ...pack, baseMissing: pack.base };
  const keys = new Set(pack.sources.map((s) => s.key)), have = new Set(pack.rules.map((r) => zoneKey(r.zone)));
  return { ...pack, baseName: base.name, sources: [...pack.sources, ...base.sources.filter((s) => !keys.has(s.key))], rules: [...pack.rules, ...base.rules.filter((r) => !have.has(zoneKey(r.zone)))],
    thresholds: [...pack.thresholds, ...base.thresholds], forms: [...pack.forms, ...base.forms] };
}

export function zonesOf(pack) {
  const by = new Map();
  for (const r of pack.rules) {
    const k = zoneKey(r.zone); if (!by.has(k)) by.set(k, { zone: r.zone, zoneName: r.zoneName, area: [], width: [], depth: [] });
    const z = by.get(k); z[r.rule === 'area.min' ? 'area' : r.rule === 'width.min' ? 'width' : 'depth'].push(r); if (!z.zoneName) z.zoneName = r.zoneName;
  }
  return [...by.values()];
}

export function depthFrom(ring, a, b) {
  const L = Math.hypot(b.x - a.x, b.y - a.y); if (!(L > 0)) return 0;
  let d = 0; for (const p of ring) d = Math.max(d, Math.abs((b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)) / L);
  return d;
}

const group = (v, d) => Number(v).toLocaleString('en-US', { maximumFractionDigits: d });
export const printed = (r) => (r.partial ? '+ ' : '') + group(r.value, 4) + ' ' + r.unit;
export function citeOf(pack, r) { const s = pack.sources.find((x) => x.key === r.source); return [s ? s.title + (s.edition ? ' (' + s.edition + ')' : '') : '', r.clause].filter(Boolean).join(', '); }

export function checkPlace(lots, pack) {
  const zones = new Map(zonesOf(pack).map((z) => [zoneKey(z.zone), z])), findings = [], unjudged = []; let judged = 0;
  for (const lot of lots) for (const part of (String(lot.zone ?? '').split(/[,;+]/).map((x) => x.trim()).filter(Boolean).slice(0, 6).concat(zoneKey(lot.zone) ? [] : ['']))) {
    const k = zoneKey(part);   // a record may name more than one case of the rules ("KT-BIT-4, KT-OBZ"): each is compared
    if (!k) { unjudged.push({ lot: lot.name, why: 'nozone' }); continue; }
    const z = zones.get(k);
    if (!z) { unjudged.push({ lot: lot.name, why: 'unknownzone', zone: part }); continue; }
    for (const [code, list, value] of [['minarea', z.area, lot.areaM2], ['minwidth', z.width, lot.widthM], ['mindepth', z.depth, lot.depthM]]) {
      if (!list.length) continue;
      if (list.length > 1) { unjudged.push({ lot: lot.name, why: 'several', zone: z.zone, rule: code }); continue; }
      if (value === null || value === undefined || !Number.isFinite(value)) { unjudged.push({ lot: lot.name, why: 'nomeasure', zone: z.zone, rule: code }); continue; }
      const below = value < list[0].si - 1e-9;
      if (list[0].partial && !below) { unjudged.push({ lot: lot.name, why: 'partial', zone: z.zone, rule: code }); continue; }   // the text adds a distance this pack does not know
      judged++;
      if (below) findings.push({ code, lot: lot.name, zone: z.zone, value, limit: list[0].si, printed: printed(list[0]), rule: list[0] });
    }
  }
  return { findings, unjudged, judged };
}
