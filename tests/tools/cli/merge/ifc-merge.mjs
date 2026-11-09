/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-merge.mjs — the three-way merge of two edits of one BimCraft model (an IFC STEP file, IFC2X3 / IFC4 / IFC4X3), 0.9 DC.27 (the BimCraft driver).
 *
 *   mergeIfc(baseBytes, oursBytes, theirsBytes) → { code, bytes, ext: 'ifc', format, conflicts, notes }   (code 0 clean, 1 conflicts, 2 could not run)
 *
 * Why this works on IFC: every object a person edits (wall, door, level, space, property set, relationship) is an IfcRoot with a GlobalId that
 * stays the same across saves, whatever number `#123` the file gives it. So objects are matched by GlobalId, never by `#id`. The things hanging
 * off an object that have no GlobalId (placements, points, shape representations, units) are compared by what they contain (a content hash,
 * with a reference to a rooted object written as its GlobalId), so two files that number them differently still compare equal.
 *
 * The rules are json-merge.mjs's, applied attribute by attribute:
 *   - an attribute changed on one side only is taken; changed the same way on both is taken;
 *   - an attribute changed differently on both sides is a conflict: ours is kept and the report lists both;
 *   - a list of references (RelatedElements, HasProperties, ...) merges as a set: what either side added is kept, what either side removed is
 *     removed. Two people each adding a wall to the same storey therefore do NOT conflict on the shared IfcRelContainedInSpatialStructure;
 *   - an object added on one side is kept (its placements, shapes and properties come with it); removed on one side and untouched on the other is
 *     removed; removed on one side and changed on the other is removed and reported (a conflict);
 *   - OwnerHistory (changes on every save) is ours; the header (time stamp, author) is ours;
 *   - the order and the numbers of OUR file are kept as they are (a git diff of the merge shows only what the merge changed); what is new is
 *     appended with the next free numbers. Parts that a change replaced and nothing uses any more are dropped.
 *   - a reference left pointing at a removed object is cleaned up: out of a list; an object that cannot live without it (a relationship, a
 *     scalar reference) is removed too, and each is reported.
 * Not merged: IFC zip / IFC XML / IFCX (other files, other formats); geometry inside a changed representation is whole-object (the attribute is
 * taken from one side, never mixed point by point).
 */
import { createHash } from 'node:crypto';
import { scanStep } from '../../../lib/ifc/step.js';
import { schemaFor } from '../../../lib/ifc/schema.js';

const RE = /'(?:[^']|'')*'|#(\d+)/g;   // a string, or a reference
const mapRefs = (text, fn) => text.replace(RE, (m, id) => (id === undefined ? m : fn(Number(id), m)));
const refsOf = (text) => { const out = []; mapRefs(text, (id) => { out.push(id); return ''; }); return out; };
const sha = (s) => createHash('sha1').update(s).digest('hex').slice(0, 16);

/** The top-level items of "(a,b,(c,d),'x,y')" (or of a list "(...)"): trimmed texts. */
export function splitTop(text) {
  const t = text.trim();
  const inner = t.startsWith('(') && t.endsWith(')') ? t.slice(1, -1) : t;
  const out = [];
  let depth = 0, cur = '', q = false;
  for (let i = 0; i < inner.length; i++) {
    const c = inner[i];
    if (q) { cur += c; if (c === "'") { if (inner[i + 1] === "'") { cur += "'"; i++; } else q = false; } continue; }
    if (c === "'") { q = true; cur += c; continue; }
    if (c === '(') depth++;
    else if (c === ')') depth--;
    if (c === ',' && depth === 0) { out.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  if (cur.trim() !== '' || out.length) out.push(cur.trim());
  return out;
}
const isList = (s) => s.startsWith('(') && s.endsWith(')');
const unq = (s) => (s && s.startsWith("'") && s.endsWith("'") ? s.slice(1, -1).replace(/''/g, "'") : null);

/** One side of the merge: the instances, which are rooted (by GlobalId), content hashes. */
function load(bytes, name) {
  const ix = scanStep(bytes);
  const latin = new TextDecoder('latin1').decode(bytes);
  const schema = schemaFor(ix.schema && ix.schema[0]);
  const inst = new Map(), order = [];
  const names = ix.names;
  for (let i = 0; i < ix.count; i++) {
    const id = ix.ids[i];
    const type = ix.types[i] >= 0 && names[ix.types[i]] ? names[ix.types[i]] : '';
    inst.set(id, { id, type, text: latin.slice(ix.starts[i], ix.ends[i]).trim() });
    order.push(id);
  }
  const guidOf = new Map(), idOf = new Map();
  for (const e of inst.values()) {
    if (!e.type || !schema.isA(e.type, 'IFCROOT')) continue;
    const g = unq(splitTop(e.text)[0] || '');
    if (g && !idOf.has(g)) { guidOf.set(e.id, g); idOf.set(g, e.id); }
  }
  const side = { name, ix, latin, schema, inst, order, guidOf, idOf, memo: new Map(), maxId: ix.maxId, header: latin.slice(0, (/\bDATA\s*;/.exec(latin) || { index: 0, 0: '' }).index + ((/\bDATA\s*;/.exec(latin) || [''])[0].length)) };
  return side;
}

/** The comparable form of a reference target: a rooted object is its GlobalId, anything else its content hash. */
function canonRef(side, id) {
  const g = side.guidOf.get(id);
  if (g) return '@' + g;
  if (side.memo.has(id)) return side.memo.get(id);
  const e = side.inst.get(id);
  if (!e) return '#missing';
  side.memo.set(id, '#cycle');   // a loop of unrooted instances: the inner reference reads "#cycle"
  const h = '#' + sha(e.type + canonText(side, e.text));
  side.memo.set(id, h);
  return h;
}
const canonText = (side, text) => mapRefs(text, (id) => canonRef(side, id));

/** Rooted instance's label for a report: IfcWall "Name" (guid). */
function label(side, guid) {
  const e = side.inst.get(side.idOf.get(guid));
  if (!e) return guid;
  const a = splitTop(e.text);
  const nm = unq(a[2] || '');
  const ent = side.schema.entity(e.type);
  return (ent ? ent.name : e.type) + (nm ? ' "' + nm + '"' : '') + ' (' + guid + ')';
}
const attrName = (side, type, i) => { const ent = side.schema.entity(type); return ent && ent.attrs[i] ? ent.attrs[i].name : 'attribute ' + (i + 1); };


/** A relationship one side removed and the other changed: what the changer added (list elements not in the base), or null if nothing is left. */
function remainder(S, B, g) {
  const e = S.inst.get(S.idOf.get(g)), eb = B.inst.get(B.idOf.get(g));
  if (!e || !eb || e.type !== eb.type || !S.schema.isA(e.type, 'IFCRELATIONSHIP')) return null;
  const a = splitTop(e.text), ab = splitTop(eb.text);
  if (a.length !== ab.length) return null;
  const inBase = new Set(); for (const x of ab) if (isList(x)) for (const it of splitTop(x)) inBase.add(canonText(B, it));
  let left = false;
  const res = a.map((x) => { if (!isList(x)) return x; const keep = splitTop(x).filter((it) => !inBase.has(canonText(S, it))); if (keep.length) left = true; return '(' + keep.join(',') + ')'; });
  return left ? res : null;
}

export async function mergeIfc(baseBytes, oursBytes, theirsBytes) {
  let O, T, B;
  try {
    O = load(oursBytes, 'ours'); T = load(theirsBytes, 'theirs');
    B = baseBytes && baseBytes.length ? load(baseBytes, 'base') : null;
  } catch (e) { return { code: 2, error: 'Not an IFC (STEP) file: ' + (e.message || e) }; }
  const fmtO = (O.ix.schema && O.ix.schema[0]) || '', fmtT = (T.ix.schema && T.ix.schema[0]) || '';
  if (fmtO !== fmtT) return { code: 2, error: `The files are not the same IFC schema (${fmtO} / ${fmtT}).` };
  if (B && ((B.ix.schema && B.ix.schema[0]) || '') !== fmtO) B = null;   // an unrelated base: merge as two files added independently

  const conflicts = [], notes = [];
  const conflict = (kind, path, why, extra = {}) => conflicts.push({ kind, path, why, ...extra });

  // ---- the result starts as OUR instances; texts are rewritten in place ----
  const out = new Map();
  for (const id of O.order) { const e = O.inst.get(id); out.set(id, { id, type: e.type, text: e.text }); }
  let next = O.maxId + 1;
  const oursByHash = new Map();
  for (const [id, e] of O.inst) if (!O.guidOf.has(id)) { const h = canonRef(O, id); if (!oursByHash.has(h)) oursByHash.set(h, id); }
  const gc = new Set();   // ids of OUR parts that a change took out of use: dropped at the end when nothing refers to them any more

  // ---- what happens to each rooted object ----
  const guids = new Set([...O.idOf.keys(), ...T.idOf.keys()]);
  const plan = new Map();   // guid → 'merge' | 'keep' | 'remove' | 'add'
  const remTexts = new Map();   // guid → attribute texts left of a relationship one side removed and the other changed
  const newId = new Map();  // guid → the id an added object gets
  const entityCanon = (S, g) => { const e = S.inst.get(S.idOf.get(g)); return e ? e.type + canonText(S, e.text) : null; };
  for (const g of guids) {
    const inO = O.idOf.has(g), inT = T.idOf.has(g), inB = !!(B && B.idOf.has(g));
    if (inO && inT) plan.set(g, 'merge');
    else if (inO) {
      if (!inB) plan.set(g, 'keep');   // added by us
      else {
        plan.set(g, 'remove');   // removed by them
        const rem = entityCanon(O, g) !== entityCanon(B, g) ? remainder(O, B, g) : null;
        if (rem) { plan.set(g, 'keepRem'); remTexts.set(g, rem); }
        else if (entityCanon(O, g) !== entityCanon(B, g)) conflict('removed-vs-changed', label(O, g), 'removed on their side, changed on ours: removed, as theirs; your changes to it are gone', { ours: entityCanon(O, g)?.slice(0, 300), theirs: null });
      }
    } else if (inT) {
      if (!inB) { plan.set(g, 'add'); newId.set(g, next++); }   // added by them
      else {
        plan.set(g, 'gone');   // removed by us: stays removed
        const rem = entityCanon(T, g) !== entityCanon(B, g) ? remainder(T, B, g) : null;
        if (rem) { plan.set(g, 'addRem'); remTexts.set(g, rem); newId.set(g, next++); }
        else if (entityCanon(T, g) !== entityCanon(B, g)) conflict('removed-vs-changed', label(T, g), 'removed on our side, changed on theirs: stays removed; their changes to it are gone', { ours: null, theirs: entityCanon(T, g)?.slice(0, 300) });
      }
    }
  }
  const idForGuid = (g) => (O.idOf.has(g) && plan.get(g) !== 'remove' ? O.idOf.get(g) : newId.get(g));

  // ---- bring an unrooted instance of THEIR file into the result ----
  const imported = new Map();   // their id → result id
  function importPart(id) {
    if (imported.has(id)) return imported.get(id);
    const h = canonRef(T, id);
    if (h !== '#cycle' && oursByHash.has(h)) { imported.set(id, oursByHash.get(h)); return imported.get(id); }
    const nid = next++;
    imported.set(id, nid);
    if (h !== '#cycle') oursByHash.set(h, nid);
    const e = T.inst.get(id);
    out.set(nid, { id: nid, type: e.type, text: toOurs(e.text) });
    return nid;
  }
  /** Text from THEIR file → the result's numbering. A reference to a removed rooted object is cut (reported by the sweep at the end). */
  function toOurs(text) {
    return mapRefs(text, (id) => {
      const g = T.guidOf.get(id);
      if (g) { const r = idForGuid(g); return r === undefined ? '#0' : '#' + r; }
      return '#' + importPart(id);
    });
  }

  // ---- attribute by attribute ----
  const volatile = (i) => i === 1;   // IfcRoot.OwnerHistory
  for (const [g, action] of plan) {
    if (action === 'remove') {
      const id = O.idOf.get(g);
      for (const r of refsOf(out.get(id).text)) if (!O.guidOf.has(r)) gc.add(r);
      out.delete(id);
    } else if (action === 'keepRem') {
      out.get(O.idOf.get(g)).text = '(' + remTexts.get(g).join(',') + ')';
    } else if (action === 'addRem') {
      const e = T.inst.get(T.idOf.get(g)), id = newId.get(g);
      out.set(id, { id, type: e.type, text: '(' + remTexts.get(g).map((x) => toOurs(x)).join(',') + ')' });
    } else if (action === 'add') {
      const e = T.inst.get(T.idOf.get(g));
      const id = newId.get(g);
      out.set(id, { id, type: e.type, text: toOurs(e.text) });
    } else if (action === 'merge') {
      const eo = O.inst.get(O.idOf.get(g)), et = T.inst.get(T.idOf.get(g)), eb = B && B.idOf.has(g) ? B.inst.get(B.idOf.get(g)) : null;
      const ao = splitTop(eo.text), at = splitTop(et.text), ab = eb && eb.type === eo.type ? splitTop(eb.text) : null;
      if (eo.type !== et.type || ao.length !== at.length) {
        if (canonText(O, eo.text) !== canonText(T, et.text)) conflict('type', label(O, g), `the two sides have it as different kinds (${eo.type} / ${et.type}): ours kept`, { ours: eo.type, theirs: et.type });
        continue;
      }
      const res = ao.slice();
      let changed = false;
      for (let i = 0; i < ao.length; i++) {
        const co = canonText(O, ao[i]), ct = canonText(T, at[i]), cb = ab ? canonText(B, ab[i] ?? '$') : undefined;
        if (co === ct || volatile(i)) continue;   // the same (or ours by rule)
        if (cb !== undefined && cb === ct) continue;   // only we changed it
        if (cb !== undefined && cb === co) { res[i] = toOurs(at[i]); changed = true; continue; }   // only they changed it
        // both changed it (or both added it): a list of references merges as a set
        const lo = isList(ao[i]) ? splitTop(ao[i]) : null, lt = isList(at[i]) ? splitTop(at[i]) : null;
        const lb = ab && isList(ab[i] ?? '') ? splitTop(ab[i]) : [];
        const refish = (l) => l && l.every((x) => /^#\d+$/.test(x));
        if (refish(lo) && refish(lt) && refish(lb)) {
          const so = lo.map((x) => canonRef(O, Number(x.slice(1)))), st = lt.map((x) => canonRef(T, Number(x.slice(1))));
          const sb = new Set(lb.map((x) => canonRef(B, Number(x.slice(1)))));
          const inT = new Set(st), inO = new Set(so);
          const keep = lo.filter((x, k) => !(sb.has(so[k]) && !inT.has(so[k])));   // theirs removed it
          const add = lt.filter((x, k) => !sb.has(st[k]) && !inO.has(st[k])).map((x) => '#' + (T.guidOf.has(Number(x.slice(1))) ? idForGuid(T.guidOf.get(Number(x.slice(1)))) : importPart(Number(x.slice(1)))));
          const merged = '(' + [...keep, ...add].join(',') + ')';
          if (merged !== ao[i]) { res[i] = merged; changed = true; }
        } else {
          conflict('attribute', `${label(O, g)} › ${attrName(O, eo.type, i)}`, 'changed differently on both sides: ours kept', { ours: ao[i].slice(0, 300), theirs: at[i].slice(0, 300), base: ab ? ab[i]?.slice(0, 300) : null });
        }
      }
      if (changed) {
        for (let i = 0; i < ao.length; i++) if (res[i] !== ao[i]) for (const r of refsOf(ao[i])) if (!O.guidOf.has(r)) gc.add(r);
        out.get(eo.id).text = '(' + res.join(',') + ')';
      }
    }
  }

  // ---- references left pointing at something removed ----
  
  const rootedIds = new Set([...O.idOf.values(), ...newId.values()]);
  for (let pass = 0; pass < 20; pass++) {
    let again = false;
    for (const [id, e] of [...out]) {
      if (!rootedIds.has(id) || !out.has(id)) continue;
      const a = splitTop(e.text);
      let edited = false, kill = null;
      const g = unq(a[0] || '');
      for (let i = 0; i < a.length && !kill; i++) {
        const items = isList(a[i]) ? splitTop(a[i]) : null;
        if (items) {
          const kept = items.filter((x) => { const m = /^#(\d+)$/.exec(x); return !m || out.has(Number(m[1])); });
          if (kept.length !== items.length) {
            if (!kept.length && e.type && O.schema.isA(e.type, 'IFCRELATIONSHIP')) { kill = `${attrName(O, e.type, i)} is empty now`; break; }
            a[i] = '(' + kept.join(',') + ')'; edited = true;
            notes.push(`${label(O, g) || g}: dropped ${items.length - kept.length} reference(s) to removed objects in ${attrName(O, e.type, i)}.`);
          }
        } else {
          const m = /^#(\d+)$/.exec(a[i]);
          if (m && !out.has(Number(m[1])) && Number(m[1]) !== 0) { kill = `${attrName(O, e.type, i)} points at a removed object`; }
          else if (m && Number(m[1]) === 0) kill = `${attrName(O, e.type, i)} points at a removed object`;
        }
      }
      if (kill) {
        conflict('dangling', (O.idOf.has(g) ? label(O, g) : T.idOf.has(g) ? label(T, g) : g), kill + ': removed with it');
        for (const r of refsOf(e.text)) if (!rootedIds.has(r)) gc.add(r);
        out.delete(id); rootedIds.delete(id); again = true;
      } else if (edited) out.get(id).text = '(' + a.join(',') + ')';
    }
    if (!again) break;
  }

  // ---- drop parts that nothing uses any more (only ones this merge took out of use) ----
  const count = new Map();
  for (const e of out.values()) for (const r of refsOf(e.text)) count.set(r, (count.get(r) || 0) + 1);
  const work = [...gc];
  while (work.length) {
    const id = work.pop();
    const e = out.get(id);
    if (!e || rootedIds.has(id) || (count.get(id) || 0) > 0) continue;
    out.delete(id);
    for (const r of refsOf(e.text)) { count.set(r, (count.get(r) || 1) - 1); if (!rootedIds.has(r)) work.push(r); }
  }

  // ---- write: our header, then the instances in our order, new ones after ----
  const lines = [];
  for (const e of out.values()) lines.push(`#${e.id}=${e.type}${e.text};`);
  const bodyStart = O.header;
  const text = bodyStart + '\n' + lines.join('\n') + '\nENDSEC;\nEND-ISO-10303-21;\n';
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i) & 255;   // the files are read as latin1 (escapes are ASCII), so this is the file's own bytes
  // the result must read: the same scanner opens it, no instance lost
  try {
    const chk = scanStep(bytes);
    if (chk.errors && chk.errors.length) conflict('invalid', '(whole file)', 'the merged file has ' + chk.errors.length + ' unreadable instance(s)');
    if (chk.count !== out.size) conflict('invalid', '(whole file)', `the merged file has ${chk.count} instances, expected ${out.size}`);
  } catch (e) { conflict('invalid', '(whole file)', String(e.message || e)); }
  if (!B) notes.push('No common ancestor was given: the two files were merged as if each had added everything it has.');
  notes.push(`${plan.size ? [...plan.values()].filter((v) => v === 'add' || v === 'addRem').length : 0} object(s) added from theirs, ${[...plan.values()].filter((v) => v === 'remove').length} removed.`);
  return { code: conflicts.length ? 1 : 0, bytes, ext: 'ifc', format: 'ifc (' + fmtO + ')', conflicts, notes };
}

/** Does this file look like an IFC STEP file? */
export function isIfc(bytes) {
  const head = new TextDecoder('latin1').decode(bytes.subarray(0, 64)).replace(/^﻿|^\xEF\xBB\xBF/, '').trimStart();
  return head.startsWith('ISO-10303-21');
}
