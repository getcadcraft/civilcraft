/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pdf-merge.mjs — the three-way merge of two edits of one MarkupCraft PDF (0.8 DC.27, the MarkupCraft driver; apps-mount_PART_5).
 *
 *   mergePdf(baseBytes, oursBytes, theirsBytes) → { code, bytes, format: 'markupcraft-pdf', conflicts, notes }   (code 0 clean, 1 conflicts, 2 could not run)
 *
 * The page content is never touched: both sides keep to the same sheets. What is merged is the markups, which a PDF keeps as annotations; each one is matched
 * by its name (/NM, the markup id MarkupCraft writes), never by object number. The rules are json-merge.mjs's, one markup at a time:
 *   - a markup changed on one side only is taken; changed the same way on both is taken; changed differently on both → a conflict (ours kept, both listed);
 *   - added on one side is kept (copied whole, with its picture and its pop-up); removed on one side and untouched on the other is removed;
 *     removed on one side and changed on the other is removed and reported;
 *   - the document-level data MarkupCraft keeps in the Info dictionary (layers, columns, records, calculations, …) is taken from the side that changed it;
 *     both changing it differently is a conflict (ours kept).
 * Sheets that differ in number between the three files are a conflict for the whole file (ours kept as it is): inserting or deleting pages is a job for a person.
 * The merged PDF is OUR file with the other side's changes applied by pdf-lib; it is a full rewrite (objects renumbered), as MarkupCraft's own Save is.
 */
import { createHash } from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let LIB = null;
async function pdfLib() { return LIB || (LIB = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href)); }

const SKIP = new Set(['P', 'Popup', 'Parent', 'IRT']);   // links to other objects: the page, the pop-up, the thread's parent — never copied or compared as objects (IRT is compared by the parent's name)

function ser(L, ctx, obj, depth = 0) {
  const { PDFName, PDFString, PDFHexString, PDFNumber, PDFBool, PDFNull, PDFArray, PDFDict, PDFRef, PDFRawStream, PDFStream } = L;
  if (depth > 6 || obj == null) return null;
  if (obj instanceof PDFRef) return ser(L, ctx, ctx.lookup(obj), depth + 1);
  if (obj instanceof PDFName) return '/' + obj.decodeText();
  if (obj instanceof PDFString || obj instanceof PDFHexString) return 's:' + obj.decodeText();
  if (obj instanceof PDFNumber) return Math.round(obj.asNumber() * 1e4) / 1e4;
  if (obj instanceof PDFBool) return obj.asBoolean();
  if (obj === PDFNull) return null;
  if (obj instanceof PDFArray) return obj.asArray().map((x) => ser(L, ctx, x, depth + 1));
  if (obj instanceof PDFStream || obj instanceof PDFRawStream) {
    const bytes = obj.getContents ? obj.getContents() : new Uint8Array();
    return { stream: ser(L, ctx, obj.dict, depth + 1), sha: createHash('sha1').update(bytes).digest('hex') };
  }
  if (obj instanceof PDFDict) {
    const o = {};
    for (const [k, v] of [...obj.entries()].sort((a, b) => a[0].decodeText().localeCompare(b[0].decodeText()))) { const key = k.decodeText(); if (!SKIP.has(key)) o[key] = ser(L, ctx, v, depth + 1); }
    const irt = obj.get(PDFName.of('IRT'));
    if (irt && depth === 0) { const par = ctx.lookup(irt), nm = par instanceof PDFDict && par.get(PDFName.of('NM')); o.IRT = nm ? 's:' + nm.decodeText() : null; }
    return o;
  }
  return String(obj);
}

/** Deep copy of an object of another document into dst, following references (cycles through `map`); keys in SKIP are re-pointed by the caller. */
function copyObj(L, srcCtx, dst, obj, map, skip = SKIP) {
  const { PDFDict, PDFArray, PDFRef, PDFRawStream, PDFStream } = L;
  if (obj instanceof PDFRef) {
    if (map.has(obj.toString())) return map.get(obj.toString());
    const ref = dst.nextRef();
    map.set(obj.toString(), ref);
    dst.assign(ref, copyObj(L, srcCtx, dst, srcCtx.lookup(obj), map, skip));
    return ref;
  }
  if (obj instanceof PDFArray) { const a = PDFArray.withContext(dst); for (const x of obj.asArray()) a.push(copyObj(L, srcCtx, dst, x, map, skip)); return a; }
  if (obj instanceof PDFRawStream || obj instanceof PDFStream) {
    const d = copyObj(L, srcCtx, dst, obj.dict, map, new Set());
    return PDFRawStream.of(d, obj.getContents());
  }
  if (obj instanceof PDFDict) {
    const d = PDFDict.withContext(dst);
    for (const [k, v] of obj.entries()) { if (skip.has(k.decodeText())) continue; d.set(k, copyObj(L, srcCtx, dst, v, map, skip)); }
    return d;
  }
  return obj;   // names, numbers, strings: immutable, shared
}

/** { nm → { fp, page, ref, dict, popupRef } } for every markup with a name, and the Info strings that are MarkupCraft's. */
function scan(L, doc) {
  const { PDFName, PDFArray, PDFDict, PDFRef } = L;
  const ctx = doc.context, out = new Map(), pages = doc.getPages();
  pages.forEach((page, pi) => {
    const arr = page.node.Annots();
    if (!arr) return;
    for (let i = 0; i < arr.size(); i++) {
      const raw = arr.get(i), d = ctx.lookup(raw);
      if (!(d instanceof PDFDict)) continue;
      const sub = d.get(PDFName.of('Subtype'));
      if (sub && sub.decodeText() === 'Popup') continue;   // follows its markup
      const nmObj = d.get(PDFName.of('NM'));
      if (!nmObj) continue;
      const nm = nmObj.decodeText();
      const popup = d.get(PDFName.of('Popup'));
      out.set(nm, { fp: JSON.stringify({ page: pi, a: ser(L, ctx, d) }), page: pi, idx: i, raw, dict: d, popup: popup instanceof PDFRef ? popup : null });
    }
  });
  const info = {};
  const infoDict = ctx.lookup(ctx.trailerInfo.Info);
  if (infoDict instanceof PDFDict) for (const [k, v] of infoDict.entries()) { const key = k.decodeText(); if (key.startsWith('MarkupCraft')) info[key] = JSON.stringify(ser(L, ctx, v)); }
  return { annots: out, info, pages: pages.length };
}

export async function mergePdf(baseBytes, oursBytes, theirsBytes) {
  const L = await pdfLib();
  const { PDFDocument, PDFName, PDFArray } = L;
  let docs;
  try {
    const open = (b) => PDFDocument.load(b, { updateMetadata: false, ignoreEncryption: false });
    docs = await Promise.all([open(baseBytes.length ? baseBytes : oursBytes), open(oursBytes), open(theirsBytes)]);
  } catch (e) { return { code: 2, error: 'A file is not a PDF this driver can read: ' + (e && e.message || e) }; }
  const [bd, od, td] = docs, conflicts = [], notes = [];
  const B = scan(L, bd), O = scan(L, od), T = scan(L, td);
  if (B.pages !== O.pages || O.pages !== T.pages) {
    return { code: 1, bytes: oursBytes, format: 'markupcraft-pdf', conflicts: [{ path: '(pages)', kind: 'pages', why: `the sheets differ in number (${B.pages} / ${O.pages} / ${T.pages}): ours is kept as it is` }], notes };
  }
  const octx = od.context, tctx = td.context;
  const pages = od.getPages();
  const removeFrom = (nm) => {   // take a markup (and its pop-up) out of its page
    const a = O.annots.get(nm), arr = pages[a.page].node.Annots();
    for (let i = 0; i < arr.size(); i++) if (arr.get(i) === a.raw || (a.raw.toString && arr.get(i).toString() === a.raw.toString())) { arr.remove(i); break; }
    if (a.popup) for (let i = 0; i < arr.size(); i++) if (arr.get(i).toString() === a.popup.toString()) { arr.remove(i); break; }
    O.annots.delete(nm);
  };
  const bring = (nm, t, replaceAt = null) => {   // copy theirs' markup into ours (replacing ours' when given)
    const page = pages[t.page], map = new Map();
    const pageRef = page.ref;
    const copy = copyObj(L, tctx, octx, t.dict, map);
    copy.set(PDFName.of('P'), pageRef);
    const ref = octx.register(copy);
    let arr = page.node.Annots();
    if (!arr) { arr = PDFArray.withContext(octx); page.node.set(PDFName.of('Annots'), arr); }
    if (t.popup) {
      const pcopy = copyObj(L, tctx, octx, tctx.lookup(t.popup), map);
      pcopy.set(PDFName.of('Parent'), ref); pcopy.set(PDFName.of('P'), pageRef);
      const pref = octx.register(pcopy);
      copy.set(PDFName.of('Popup'), pref);
      arr.push(ref); arr.push(pref);
    } else arr.push(ref);
    O.annots.set(nm, { ...t, ref, raw: ref, dict: copy, popup: t.popup ? copy.get(PDFName.of('Popup')) : null });
    fixIrt.push([nm, t]);
  };
  const fixIrt = [];
  const names = new Set([...B.annots.keys(), ...O.annots.keys(), ...T.annots.keys()]);
  let taken = 0, added = 0, removed = 0;
  for (const nm of [...names].sort()) {
    const b = B.annots.get(nm), o = O.annots.get(nm), t = T.annots.get(nm);
    const fb = b && b.fp, fo = o && o.fp, ft = t && t.fp;
    if (!b) {
      if (o && t) { if (fo !== ft) conflicts.push({ path: nm, kind: 'added-both', why: 'two different markups with the same name: ours is kept' }); }
      else if (t) { bring(nm, t); added++; }
      continue;
    }
    if (o && t) {
      if (fo === ft) continue;
      if (fo === fb) { removeFrom(nm); bring(nm, t); taken++; }
      else if (ft === fb) continue;
      else conflicts.push({ path: nm, kind: 'changed-both', why: 'changed on both sides: ours is kept' });
    } else if (o && !t) {   // theirs removed it
      if (fo === fb) { removeFrom(nm); removed++; } else { removeFrom(nm); removed++; conflicts.push({ path: nm, kind: 'deleted', why: 'removed on their side, changed on ours: removed' }); }
    } else if (!o && t) {   // ours removed it
      if (ft !== fb) conflicts.push({ path: nm, kind: 'deleted', why: 'removed on our side, changed on theirs: stays removed' });
    }
  }
  // a reply keeps pointing at the markup it answers, by name
  for (const [nm, t] of fixIrt) {
    const irt = t.dict.get(PDFName.of('IRT'));
    const par = irt && tctx.lookup(irt), pn = par && par.get && par.get(PDFName.of('NM'));
    const target = pn && O.annots.get(pn.decodeText());
    if (target) O.annots.get(nm).dict.set(PDFName.of('IRT'), target.ref || target.raw);
  }
  // document-level MarkupCraft data in the Info dictionary
  const { PDFDict } = L;
  const oInfo = octx.lookup(octx.trailerInfo.Info), tInfo = tctx.lookup(tctx.trailerInfo.Info);
  for (const key of new Set([...Object.keys(B.info), ...Object.keys(O.info), ...Object.keys(T.info)])) {
    const fb = B.info[key], fo = O.info[key], ft = T.info[key];
    if (fo === ft || ft === fb) continue;
    if (fo === fb) {
      if (!(oInfo instanceof PDFDict)) continue;
      const tv = tInfo instanceof PDFDict ? tInfo.get(PDFName.of(key)) : null;
      if (tv) oInfo.set(PDFName.of(key), copyObj(L, tctx, octx, tv, new Map())); else oInfo.delete(PDFName.of(key));
      taken++; notes.push(`${key}: taken from their side`);
    } else conflicts.push({ path: 'Info/' + key, kind: 'changed-both', why: 'changed on both sides: ours is kept' });
  }
  // 0.9 NOTES.1: the notes stream in the catalog ({ v, notes: [markup data with an id], sealed: [opaque blobs], uid }) merges like the markups
  const readNotes = (doc) => {
    try {
      const st = doc.context.lookup(doc.catalog.get(PDFName.of('MarkupCraftNotes')));
      if (!st || !L.decodePDFRawStream) return { v: 1, notes: [], sealed: [] };
      const v = JSON.parse(new TextDecoder().decode(L.decodePDFRawStream(st).decode()));
      return { ...v, notes: Array.isArray(v.notes) ? v.notes : [], sealed: Array.isArray(v.sealed) ? v.sealed : [] };
    } catch { return { v: 1, notes: [], sealed: [] }; }
  };
  const NB = readNotes(bd), NO = readNotes(od), NT = readNotes(td);
  const nj = JSON.stringify;
  if (nj(NO) !== nj(NT) && nj(NT) !== nj(NB)) {
    const mergeList = (kind, key, b, o, t) => {
      const idx = (a) => new Map(a.map((x, i) => [key(x, i), x]));
      const mb = idx(b), mo = idx(o), mt = idx(t), out = [];
      for (const k of new Set([...mo.keys(), ...mt.keys(), ...mb.keys()])) {
        const fb = mb.has(k) ? nj(mb.get(k)) : undefined, fo = mo.has(k) ? nj(mo.get(k)) : undefined, ft = mt.has(k) ? nj(mt.get(k)) : undefined;
        let pick = mo.get(k);
        if (fo === ft || ft === fb) pick = mo.get(k);
        else if (fo === fb) { pick = mt.get(k); taken++; }
        else { pick = mo.get(k); conflicts.push({ path: kind + '/' + String(k).slice(0, 60), kind: 'changed-both', why: 'changed on both sides: ours is kept' }); }
        if (fo !== undefined && ft === undefined && fb !== undefined && fo !== fb) conflicts.push({ path: kind + '/' + String(k).slice(0, 60), kind: 'deleted', why: 'removed on their side, changed on ours: removed' });
        if (pick !== undefined) out.push(pick);
      }
      return out;
    };
    const merged = { ...NO, notes: mergeList('note', (x, i) => (x && x.id) || 'n' + i, NB.notes, NO.notes, NT.notes), sealed: mergeList('sealed', (x) => nj(x), NB.sealed, NO.sealed, NT.sealed) };
    if (!merged.uid && NT.uid) merged.uid = NT.uid;
    od.catalog.set(PDFName.of('MarkupCraftNotes'), octx.register(octx.flateStream(new TextEncoder().encode(nj(merged)))));
    notes.push(`notes: ${merged.notes.length} note(s) and ${merged.sealed.length} sealed block(s) after the merge`);
  }
  const bytes = await od.save({ useObjectStreams: false });
  notes.unshift(`${taken} markup(s) taken from theirs, ${added} added, ${removed} removed`);
  return { code: conflicts.length ? 1 : 0, bytes, format: 'markupcraft-pdf', conflicts, notes };
}
