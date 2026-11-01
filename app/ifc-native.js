/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-native.js — 0.7.1 71.27 (owner 2026-10-26): CivilCraft saves its project as a PAIR of files side by side,
 *   <name>.ifc               IFC 4.3 ADD2, the deliverable (ifc-civil.js), with the whole project embedded as a fallback
 *   <name>.civilcraft.json   the full design intent, the source of truth for editing
 * and each records the other: the IFC's IfcProject carries pset CadCraft_Native { Format, Version, JsonName, JsonHash (of the JSON
 * file's text), EntityHash (of the elements CivilCraft wrote), SavedAt, Embedded (gzip + base64 of { json: the JSON file's exact text,
 * elements: { GlobalId: [tag, hash] } }) }; the JSON carries `pair` { ifc (file name), schema, entityHash, savedAt }. DOM-free, async
 * (gzip through CompressionStream, in browsers and Node alike).
 *
 *   writePair(project, { stem, now, species, lat, lon }) → { jsonName, ifcName, jsonText, ifcText, entityHash, jsonHash, embeddedBytes }
 *   readNative(bytes) → { native: { jsonText, jsonName, jsonHash, entityHash, savedAt, elements } | null, current: { all, items, names, tags } }
 *   productHashes(file) → { all, items: { GlobalId: hash }, names: { GlobalId: Name }, classes }   every product's fingerprint: class,
 *       name, object type, its property sets and quantities (values), where it is placed (the placement chain's numbers) and the numbers
 *       of its shape (a rounded sum and a count over every number its representation reaches). Edits by another program that change any
 *       of those change the hash; re-saving that keeps them (other ids, other line order) does not.
 *   decide({ ifc: { name, native, current } | null, json: { name, text } | null }) → { open: 'json' | 'embedded' | 'import' | 'none',
 *       text (the project JSON to open), warnings: [{ code, severity, msg: { key, vars }, fixes: [action] }], diff: { missing, changed, added } }
 *     both, matching                   → the JSON, no warning
 *     the IFC changed by another tool  → the JSON, ifc.native.changed (offer: write the IFC again on save / take the IFC's geometry)
 *     one older than the other         → the newer, ifc.native.stale (which one is older)
 *     only the IFC, intact             → the embedded copy;  changed → the embedded copy reconciled (reconcile) + ifc.native.changed
 *     only the IFC, not CivilCraft's   → 'import' (ifc-civil-read.js);  only the JSON with a pair → the JSON + ifc.native.missing
 *   reconcile(obj, diff, tagOf, readAlignments) → { obj, dropped: [names], replaced: [names] }   a lone IFC changed elsewhere: an alignment
 *       whose elements changed takes the IFC's own alignment (same GlobalId) when it can be read, a pad / parcel / mass / pipe / structure
 *       whose every element is gone is dropped; nothing else is guessed (the warning lists what changed).
 */

import { IfcFile } from './ifc/model.js';
import { civilIfcModel } from './ifc-civil-model.js';
import { writeCivilIfc, fileOrigin } from './ifc-civil.js';

/** 0.8 DC.27 H1: one property per line (indent 1), lists of plain numbers kept on one line, so a version-control diff and merge read the file. Same JSON. */
const prettyJson = (obj) => JSON.stringify(obj, null, 1).replace(/\[\n\s*(-?\d[^,\[\]{}"\n]*(?:,\n\s*-?\d[^,\[\]{}"\n]*)*)\n\s*\]/g, (m, body) => '[' + body.replace(/,\n\s*/g, ', ') + ']');

export const NATIVE_FORMAT = 'civilcraft-native';
export const NATIVE_VERSION = 1;
export const NATIVE_SCHEMA = 'IFC4X3_ADD2';

/** A 64-bit string hash (cyrb64-style, two 32-bit lanes) as 16 hex digits — a fingerprint, not a security measure. */
export function hash64(str) {
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}

const b64 = {
  enc(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s); },
  dec(text) { const s = atob(text); const out = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i); return out; },
};
async function pipe(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
export const gzip = (text) => pipe(new TextEncoder().encode(text), new CompressionStream('gzip'));
export const gunzip = async (bytes) => new TextDecoder().decode(await pipe(bytes, new DecompressionStream('gzip')));

// ---------------------------------------------------------------------------- fingerprints

const num = (v) => (typeof v === 'number' ? Math.round(v * 1e6) / 1e6 : v);
function valueOf(v) {
  if (v === null || v === undefined) return null;
  if (typeof v === 'object' && 'typed' in v) return valueOf(v.value);
  if (typeof v === 'object' && 'enum' in v) return '.' + v.enum + '.';
  return num(v);
}
export function productHashes(f) {
  const s = f.schema, ref = (v) => (v && typeof v === 'object' && 'ref' in v ? v.ref : null);
  // property sets and quantities by object
  const props = new Map();
  for (const rel of f.ofType('IFCRELDEFINESBYPROPERTIES')) {
    const def = ref(f.attr(rel, 'RelatingPropertyDefinition'));
    if (def === null) continue;
    const t = f.type(def), name = String(valueOf(f.attr(def, 'Name')) ?? ''), vals = [];
    if (t === 'IFCPROPERTYSET') for (const pr of (f.attr(def, 'HasProperties') || []).map(ref)) vals.push([valueOf(f.attr(pr, 'Name')), valueOf(f.attr(pr, 'NominalValue'))]);
    else if (t === 'IFCELEMENTQUANTITY') for (const q of (f.attr(def, 'Quantities') || []).map(ref)) { const p = f.params(q); vals.push([valueOf(p[0]), valueOf(p[3])]); }
    vals.sort((a, b) => String(a[0]).localeCompare(String(b[0])));
    for (const o of (f.attr(rel, 'RelatedObjects') || []).map(ref)) { if (!props.has(o)) props.set(o, []); props.get(o).push(name + JSON.stringify(vals)); }
  }
  // every number an entity reaches (its shape or its placement): a rounded sum and a count, walked once per entity
  const memo = new Map();
  const walk = (id, depth = 0) => {
    if (id === null || depth > 40) return [0, 0];
    if (memo.has(id)) return memo.get(id);
    memo.set(id, [0, 0]);
    let sum = 0, n = 0;
    const visit = (v) => {
      if (typeof v === 'number') { sum += v; n++; } else if (Array.isArray(v)) v.forEach(visit);
      else if (v && typeof v === 'object') { if ('ref' in v) { const [a, b] = walk(v.ref, depth + 1); sum += a; n += b; } else if ('typed' in v) visit(v.value); }
    };
    for (const v of f.params(id) || []) visit(v);
    const r = [sum, n];
    memo.set(id, r);
    return r;
  };
  const items = {}, names = {}, classes = {};
  for (const t of s.subtypes('IFCPRODUCT')) for (const id of f.ofType(t)) {
    const gid = valueOf(f.attr(id, 'GlobalId'));
    if (typeof gid !== 'string') continue;
    const [gs, gn] = walk(ref(f.attr(id, 'Representation')));
    const [ps, pn] = walk(ref(f.attr(id, 'ObjectPlacement')));
    const key = [t, valueOf(f.attr(id, 'Name')), valueOf(f.attr(id, 'ObjectType')), (props.get(id) || []).sort().join('|'), Math.round(gs * 1000) / 1000, gn, Math.round(ps * 1000) / 1000, pn].join('\u0001');
    items[gid] = hash64(key); names[gid] = String(valueOf(f.attr(id, 'Name')) ?? ''); classes[gid] = s.pretty(t);
  }
  const all = hash64(Object.keys(items).sort().map((k) => k + ':' + items[k]).join(','));
  return { all, items, names, classes };
}

// ---------------------------------------------------------------------------- writing

export async function writePair(project, { stem = 'site', now = new Date(), species = null, lat = null, lon = null } = {}) {
  const jsonName = stem + '.civilcraft.json', ifcName = stem + '.ifc', seed = project.state.name || 'site';
  const model = civilIfcModel(project, { species, lat, lon }), origin = fileOrigin(model);
  // 1. the IFC alone (no native set): its elements' fingerprints and where each came from
  const first = writeCivilIfc(model, { schema: NATIVE_SCHEMA, now, seed, origin });
  const fp = productHashes(IfcFile.open(new TextEncoder().encode(first.text)));
  // 2. the JSON, naming its IFC and that fingerprint
  const savedAt = now.toISOString();
  const obj = project.toJSON();
  obj.saved = savedAt;
  obj.pair = { ifc: ifcName, schema: NATIVE_SCHEMA, entityHash: fp.all, savedAt };
  const { saved: savedLast, ...restOfObj } = obj;   // 0.8 DC.27 H3: the save time changes on every save, so it goes last
  const jsonText = prettyJson({ ...restOfObj, saved: savedLast });
  const jsonHash = hash64(jsonText);
  // 3. the IFC again with CadCraft_Native on the project (the elements are written the same: the set comes last)
  const elements = {};
  for (const [gid, h] of Object.entries(fp.items)) elements[gid] = [first.tags[gid] || '', h];
  const blob = await gzip(JSON.stringify({ json: jsonText, elements }));
  // i18n-ignore: IFC file data
  const native = [['Format', NATIVE_FORMAT, 'label'], ['Version', NATIVE_VERSION, 'int'], ['JsonName', jsonName, 'label'], ['JsonHash', jsonHash, 'label'], ['EntityHash', fp.all, 'label'], ['SavedAt', savedAt, 'label'],
    ['Embedded', 'gzip+base64:' + b64.enc(blob), 'text']];
  const r = writeCivilIfc(model, { schema: NATIVE_SCHEMA, now, seed, origin, projectPsets: [['CadCraft_Native', native]] });
  return { jsonName, ifcName, jsonText, ifcText: r.text, entityHash: fp.all, jsonHash, embeddedBytes: blob.length, counts: r.counts };
}

// ---------------------------------------------------------------------------- reading

export async function readNative(bytes) {
  const f = IfcFile.open(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes));
  const current = productHashes(f);
  let native = null;
  const ref = (v) => (v && typeof v === 'object' && 'ref' in v ? v.ref : null);
  const proj = f.ofType('IFCPROJECT')[0];
  for (const rel of f.ofType('IFCRELDEFINESBYPROPERTIES')) {
    if (!(f.attr(rel, 'RelatedObjects') || []).map(ref).includes(proj)) continue;
    const def = ref(f.attr(rel, 'RelatingPropertyDefinition'));
    if (def === null || valueOf(f.attr(def, 'Name')) !== 'CadCraft_Native') continue;
    const p = {};
    for (const pr of (f.attr(def, 'HasProperties') || []).map(ref)) p[valueOf(f.attr(pr, 'Name'))] = valueOf(f.attr(pr, 'NominalValue'));
    if (p.Format !== NATIVE_FORMAT) continue;
    let emb = null;
    try { if (typeof p.Embedded === 'string' && p.Embedded.startsWith('gzip+base64:')) emb = JSON.parse(await gunzip(b64.dec(p.Embedded.slice(12)))); } catch { emb = null; }
    native = { version: p.Version, jsonName: String(p.JsonName || ''), jsonHash: String(p.JsonHash || ''), entityHash: String(p.EntityHash || ''), savedAt: String(p.SavedAt || ''),
      jsonText: typeof emb?.json === 'string' ? emb.json : null, elements: emb?.elements && typeof emb.elements === 'object' ? emb.elements : {} };
  }
  return { native, current, file: f };
}

/** What changed between the elements CivilCraft wrote and the file as it is now. */
export function diffElements(native, current) {
  const missing = [], changed = [], added = [];
  for (const [gid, [tag, h]] of Object.entries(native?.elements || {})) {
    if (!(gid in current.items)) missing.push({ gid, tag }); else if (current.items[gid] !== h) changed.push({ gid, tag, name: current.names[gid] });
  }
  for (const gid of Object.keys(current.items)) if (!native?.elements?.[gid]) added.push({ gid, name: current.names[gid], cls: current.classes[gid] });
  return { missing, changed, added };
}

const time = (s) => { const v = Date.parse(s || ''); return Number.isFinite(v) ? v : 0; };

export function decide({ ifc = null, json = null } = {}) {
  const warnings = [], W = (code, key, vars, fixes = []) => warnings.push({ code, severity: 'warning', msg: { key, vars }, fixes });
  const n = ifc?.native || null;
  let obj = null;
  if (json) { try { obj = JSON.parse(json.text); } catch { obj = null; } }
  const diff = n && ifc ? diffElements(n, ifc.current) : { missing: [], changed: [], added: [] };
  const intact = !!(n && ifc && ifc.current.all === n.entityHash);
  const counts = { missing: diff.missing.length, changed: diff.changed.length, added: diff.added.length };
  if (json && ifc) {
    if (!obj) return { open: 'none', warnings, diff };
    if (!n) { W('ifc.native.changed', 'ifc.native.foreign', { ifc: ifc.name, json: json.name }, ['ifcSave', 'ifcTake']); return { open: 'json', text: json.text, warnings, diff }; }
    const matches = obj.pair?.entityHash === n.entityHash && n.jsonHash === hash64(json.text);
    if (intact && matches) return { open: 'json', text: json.text, warnings, diff };
    if (!intact) { W('ifc.native.changed', 'ifc.native.changed', { ifc: ifc.name, json: json.name, ...counts }, ['ifcSave', 'ifcTake']); return { open: 'json', text: json.text, warnings, diff }; }
    if (time(obj.pair?.savedAt || obj.saved) >= time(n.savedAt) || !n.jsonText) { W('ifc.native.stale', 'ifc.native.stale.ifc', { ifc: ifc.name, json: json.name }, ['ifcSave']); return { open: 'json', text: json.text, warnings, diff }; }
    W('ifc.native.stale', 'ifc.native.stale.json', { ifc: ifc.name, json: json.name }, ['ifcSave']);
    return { open: 'embedded', text: n.jsonText, warnings, diff };
  }
  if (ifc) {
    if (!n) return { open: 'import', warnings, diff };
    if (!n.jsonText) { W('ifc.native.changed', 'ifc.native.noembed', { ifc: ifc.name }, ['ifcTake']); return { open: 'import', warnings, diff }; }
    if (intact) return { open: 'embedded', text: n.jsonText, warnings, diff };
    W('ifc.native.changed', 'ifc.native.changed.alone', { ifc: ifc.name, ...counts }, ['ifcSave', 'ifcTake']);
    return { open: 'embedded', text: n.jsonText, warnings, diff, reconcile: true };
  }
  if (json) {
    if (!obj) return { open: 'none', warnings, diff };
    if (obj.pair?.ifc) W('ifc.native.missing', 'ifc.native.missing', { ifc: obj.pair.ifc, json: json.name }, ['ifcSave']);
    return { open: 'json', text: json.text, warnings, diff };
  }
  return { open: 'none', warnings, diff };
}

/** A lone IFC changed by another program: keep what still matches. tag → the project object it was written from. */
export function reconcile(obj, diff, readAlignments = []) {
  const dropped = [], replaced = [];
  const objOf = (tag) => { const m = /^(?:el\|)?(al|road|pad|pipe|struct|parcel|mass|building|storey)\|([^|]+)/.exec(tag || ''); return m ? { kind: m[1], id: m[2] } : null; };
  const touched = new Map();   // "kind:id" → { changed, missing }
  for (const [list, k] of [[diff.changed, 'changed'], [diff.missing, 'missing']]) for (const e of list) { const o = objOf(e.tag); if (!o) continue; const key = o.kind + ':' + o.id; if (!touched.has(key)) touched.set(key, { ...o, changed: [], missing: [] }); touched.get(key)[k].push(e); }
  for (const [, o] of touched) {
    if (o.kind === 'al' || o.kind === 'road') {
      const a = (obj.alignments || []).find((x) => String(x.id) === o.id);
      if (!a) continue;
      const al = o.kind === 'al' && readAlignments.find((x) => x.gidTag === 'al|' + o.id);
      if (al) { a.pis = al.pis; a.pvis = al.pvis; a.start = al.start; replaced.push(a.name); }
      else if (o.kind === 'al' && o.missing.length && !o.changed.length) { obj.alignments = obj.alignments.filter((x) => x !== a); dropped.push(a.name); }
      continue;
    }
    const lists = { pad: 'pads', parcel: 'parcels', mass: 'masses', building: 'masses', storey: 'masses' };
    if (lists[o.kind] && o.missing.length && !o.changed.length) {
      const L = obj[lists[o.kind]] || [], x = L.find((q) => String(q.id) === o.id);
      if (x) { obj[lists[o.kind]] = L.filter((q) => q !== x); dropped.push(x.name || x.id); }
    }
    if ((o.kind === 'pipe' || o.kind === 'struct') && o.missing.length && !o.changed.length && obj.network) {
      const key = o.kind === 'pipe' ? 'pipes' : 'structures', x = obj.network[key].find((q) => String(q.id) === o.id);
      if (x) { obj.network[key] = obj.network[key].filter((q) => q !== x); if (o.kind === 'struct') obj.network.pipes = obj.network.pipes.filter((q) => q.from !== x.id && q.to !== x.id); dropped.push(x.name || x.id); }
    }
  }
  return { obj, dropped, replaced };
}
