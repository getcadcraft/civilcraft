#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// node tools/cli/merge/test-pdf-merge-real.mjs — the MarkupCraft PDF merge driver (DC.27) on PDFs written by MarkupCraft's own writer
// (pdf-write.js), read back with its own reader (pdf-read.js): markups by id, and the 0.9 notes stream (notes by id, sealed blobs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mergePdf } from './pdf-merge.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const APP = path.join(ROOT, 'public_html/assets/apps/markupcraft/dev');
const TOOLS = path.join(ROOT, 'tools/markupcraft-test/node_modules');
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const pdfjs = await import(pathToFileURL(path.join(TOOLS, 'pdfjs-dist/legacy/build/pdf.mjs')).href);
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const i18n = await imp('i18n.js');
i18n.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const model = await imp('model.js'), reader = await imp('pdf-read.js'), writer = await imp('pdf-write.js');
const env = { pdfjs, pdfLib: PDFLib, docOptions: { standardFontDataUrl: path.join(TOOLS, 'pdfjs-dist/standard_fonts/') } };
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };

const blank = async () => { const d = await PDFLib.PDFDocument.create(); d.addPage([612, 792]); d.addPage([612, 792]); return d.save({ useObjectStreams: false }); };
const pageOf = (i, markups) => ({ index: i, markups, cal: null, calCleared: true, badge: 0, sheetName: null, legendOf: () => [] });
const mk = (id, text, sheetPage = 0, y = 50) => model.makeMarkup({ id, sheet: 'f1:' + sheetPage, type: 'text', rect: [50, y, 300, y + 30], text, author: 'Ann' });
const open = (bytes) => reader.openPdf(env, bytes.slice(), { fileId: 'f1', name: 't.pdf' });
// save: the markups of a opened file (after edit) + notes, as MarkupCraft's Save does
async function save(bytes, edit, notes) {
  const r = await open(bytes);
  const list = edit(r.markups.filter((m) => !m.scope || m.scope === 'regular'));
  const pages = [0, 1].map((i) => pageOf(i, list.filter((m) => m.sheet === 'f1:' + i)));
  const w = await writer.writeMarkedUp(PDFLib, r.bytes, { pages, removeRefs: r.removeRefs, notes });
  return w.bytes;
}
const note = (id, text) => ({ ...model.makeMarkup({ id, sheet: 'x', type: 'text', rect: [640, 50, 800, 90], text, author: 'Ann' }), scope: 'note', sheet: 1, v: 1 });

let b = await save(await blank(), () => [mk('mA', 'one'), mk('mB', 'two', 0, 100), mk('mC', 'three', 1)], { notes: [note('nBase', 'BASENOTE')], sealed: [{ s: 'blob-base' }] });
const O = await save(b, (l) => { l.find((m) => m.id === 'mA').text = 'one OURS'; l.push(mk('mE', 'ours new', 0, 200)); return l; }, { notes: [note('nBase', 'BASENOTE'), note('nOurs', 'OURNOTE')], sealed: [{ s: 'blob-base' }] });
const T = await save(b, (l) => { l.find((m) => m.id === 'mB').text = 'two THEIRS'; l.push(mk('mF', 'theirs new', 1, 200)); return l.filter((m) => m.id !== 'mC'); }, { notes: [note('nBase', 'BASENOTE'), note('nTheirs', 'THEIRNOTE')], sealed: [{ s: 'blob-base' }, { s: 'blob-theirs' }] });

const r = await mergePdf(b, O, T);
ok(r.code === 0 && r.conflicts.length === 0, 'files written by MarkupCraft merge with no conflict', r.conflicts);
const m = await open(r.bytes);
const byId = Object.fromEntries(m.markups.map((x) => [x.id, x]));
ok(byId.mA?.text === 'one OURS' && byId.mB?.text === 'two THEIRS', 'each side\'s edit survives, read back by MarkupCraft');
ok(byId.mE && byId.mF && !byId.mC, 'both additions are there and the markup they removed is gone', Object.keys(byId));
const nb = reader.notesOf ? null : null;
const txt = Buffer.from(r.bytes).toString('latin1');
const merged = await (async () => { const d = await PDFLib.PDFDocument.load(r.bytes); const st = d.context.lookup(d.catalog.get(PDFLib.PDFName.of('MarkupCraftNotes'))); return JSON.parse(new TextDecoder().decode(PDFLib.decodePDFRawStream(st).decode())); })();
ok(merged.notes.map((n) => n.id).sort().join() === 'nBase,nOurs,nTheirs', 'notes from both sides are kept', merged.notes.map((n) => n.id));
ok(merged.sealed.length === 2 && merged.sealed.some((s) => s.s === 'blob-theirs'), 'their sealed block is kept beside ours', merged.sealed);
// both edit the same note differently: conflict, ours kept
const O2 = await save(b, (l) => l, { notes: [note('nBase', 'OURS EDIT')], sealed: [{ s: 'blob-base' }] });
const T2 = await save(b, (l) => l, { notes: [note('nBase', 'THEIRS EDIT')], sealed: [{ s: 'blob-base' }] });
const r2 = await mergePdf(b, O2, T2);
ok(r2.code === 1 && r2.conflicts.some((c) => c.path === 'note/nBase') , 'one note edited two ways is a conflict', r2.conflicts);
// only theirs touched the notes: taken
const T3 = await save(b, (l) => l, { notes: [note('nBase', 'BASENOTE'), note('nTheirs', 'THEIRNOTE')], sealed: [{ s: 'blob-base' }] });
const O3 = await save(b, (l) => { l.find((x) => x.id === 'mA').text = 'x'; return l; }, { notes: [note('nBase', 'BASENOTE')], sealed: [{ s: 'blob-base' }] });
const r3 = await mergePdf(b, O3, T3);
const d3 = await PDFLib.PDFDocument.load(r3.bytes); const s3 = d3.context.lookup(d3.catalog.get(PDFLib.PDFName.of('MarkupCraftNotes')));
ok(r3.code === 0 && JSON.parse(new TextDecoder().decode(PDFLib.decodePDFRawStream(s3).decode())).notes.length === 2, 'notes only they added come across');
console.log(`pdf-merge-real: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
