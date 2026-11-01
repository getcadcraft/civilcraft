#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// node tools/cli/merge/test-pdf-merge.mjs — the MarkupCraft PDF merge driver (0.8 DC.27): pages made with pdf-lib, markups by /NM, three-way cases, the CLI.
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { mergePdf } from './pdf-merge.mjs';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const L = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const { PDFDocument, PDFName, PDFString, PDFArray } = L;
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };

const annot = (doc, page, nm, text, rect = [50, 50, 150, 100], extra = {}) => {
  const ctx = doc.context;
  const d = ctx.obj({ Type: 'Annot', Subtype: 'Square', Rect: rect, NM: PDFString.of(nm), Contents: PDFString.of(text), C: [1, 0, 0], P: page.ref, F: 4, ...extra });
  const ref = ctx.register(d);
  let arr = page.node.Annots(); if (!arr) { arr = PDFArray.withContext(ctx); page.node.set(PDFName.of('Annots'), arr); }
  arr.push(ref);
  return ref;
};
async function make(spec, { pages = 2, info = {} } = {}) {
  const doc = await PDFDocument.create();
  for (let i = 0; i < pages; i++) doc.addPage([400, 300]);
  const ps = doc.getPages();
  for (const [nm, text, pi, rect] of spec) annot(doc, ps[pi], nm, text, rect);
  for (const [k, v] of Object.entries(info)) doc.context.lookup(doc.context.trailerInfo.Info).set(PDFName.of(k), PDFString.of(v));
  return doc;
}
const bytes = (d) => d.save({ useObjectStreams: false });
async function read(b) {
  const doc = await PDFDocument.load(b), out = {};
  doc.getPages().forEach((p, pi) => { const arr = p.node.Annots(); if (!arr) return; for (let i = 0; i < arr.size(); i++) { const d = doc.context.lookup(arr.get(i)); out[d.get(PDFName.of('NM')).decodeText()] = { page: pi, text: d.get(PDFName.of('Contents')).decodeText(), P: d.get(PDFName.of('P')) && d.get(PDFName.of('P')).toString() === p.ref.toString() }; } });
  return { out, info: Object.fromEntries([...doc.context.lookup(doc.context.trailerInfo.Info).entries()].map(([k, v]) => [k.decodeText(), v.decodeText ? v.decodeText() : String(v)])) };
}

const base = [['a', 'one', 0], ['b', 'two', 0], ['c', 'three', 1], ['d', 'four', 1]];
const B = await bytes(await make(base, { info: { MarkupCraftLayers: '[]' } }));
// ours: edits a, adds e on page 0; theirs: edits b, removes c, adds f on page 1, edits the layers
const O = await make([['a', 'one EDITED BY OURS', 0], ['b', 'two', 0], ['c', 'three', 1], ['d', 'four', 1], ['e', 'new ours', 0]], { info: { MarkupCraftLayers: '[]' } });
const T = await make([['a', 'one', 0], ['b', 'two EDITED BY THEIRS', 0], ['d', 'four', 1], ['f', 'new theirs', 1]], { info: { MarkupCraftLayers: '[{"name":"x"}]' } });
const r = await mergePdf(B, await bytes(O), await bytes(T));
ok(r.code === 0 && r.conflicts.length === 0, 'disjoint edits merge cleanly', JSON.stringify(r.conflicts));
const m = await read(r.bytes);
ok(m.out.a.text === 'one EDITED BY OURS' && m.out.b.text === 'two EDITED BY THEIRS', 'each side\'s edit is kept', JSON.stringify(m.out));
ok(!m.out.c, 'a markup theirs removed is removed');
ok(m.out.e && m.out.f && m.out.f.page === 1 && m.out.f.P && m.out.d, 'both sides\' additions are there, theirs on its own page with /P pointing at it');
ok(m.info.MarkupCraftLayers === '[{"name":"x"}]', 'the document data they changed is taken');
ok(Object.keys(m.out).sort().join() === 'a,b,d,e,f', 'exactly the right set', Object.keys(m.out).join());

// both change the same markup differently; ours kept, listed
const O2 = await make([['a', 'ours A', 0], ['b', 'two', 0], ['c', 'three', 1], ['d', 'four', 1]]), T2 = await make([['a', 'theirs A', 0], ['b', 'two', 0], ['c', 'three', 1], ['d', 'four', 1]]);
const r2 = await mergePdf(B, await bytes(O2), await bytes(T2));
const m2 = await read(r2.bytes);
ok(r2.code === 1 && r2.conflicts.some((c) => c.path === 'a' && c.kind === 'changed-both') && m2.out.a.text === 'ours A', 'the same markup changed two ways: a conflict, ours kept');
// same change both sides: taken
const O3 = await make([['a', 'same', 0], ['b', 'two', 0], ['c', 'three', 1], ['d', 'four', 1]]);
const r3 = await mergePdf(B, await bytes(O3), await bytes(O3));
ok(r3.code === 0, 'the same change on both sides is no conflict');
// removed vs changed
const O4 = await make([['a', 'one', 0], ['b', 'two', 0], ['c', 'three CHANGED', 1], ['d', 'four', 1]]);
const r4 = await mergePdf(B, await bytes(O4), await bytes(T));
ok(r4.conflicts.some((c) => c.path === 'c' && c.kind === 'deleted') && !(await read(r4.bytes)).out.c, 'removed on theirs, changed on ours: removed and reported');
// pages differ
const O5 = await make(base, { pages: 3 });
const r5 = await mergePdf(B, await bytes(O5), await bytes(T));
ok(r5.code === 1 && r5.conflicts[0].kind === 'pages', 'a different number of sheets is a conflict for the whole file');
// not a PDF
const r6 = await mergePdf(B, new Uint8Array([1, 2, 3]), await bytes(T));
ok(r6.code === 2, 'a file that is not a PDF could not be merged');

// a markup with a picture (an appearance stream) and a pop-up comes across whole
{
  const doc = await make(base);
  const ctx = doc.context, p0 = doc.getPages()[0];
  const ap = ctx.register(ctx.flateStream(new TextEncoder().encode('1 0 0 rg 0 0 100 50 re f'), { Type: 'XObject', Subtype: 'Form', BBox: [0, 0, 100, 50] }));
  const popup = ctx.obj({ Type: 'Annot', Subtype: 'Popup', Rect: [160, 50, 260, 100], Open: false });
  const popRef = ctx.register(popup);
  const ref = annot(doc, p0, 'g', 'with picture', [10, 10, 110, 60], { AP: ctx.obj({ N: ap }), Popup: popRef });
  ctx.lookup(popRef).set(PDFName.of('Parent'), ref); p0.node.Annots().push(popRef);
  const r7 = await mergePdf(B, await bytes(await make(base)), await bytes(doc));
  const d7 = await PDFDocument.load(r7.bytes);
  const arr = d7.getPages()[0].node.Annots(); let found = null, pops = 0;
  for (let i = 0; i < arr.size(); i++) { const d = d7.context.lookup(arr.get(i)); if (d.get(PDFName.of('Subtype')).decodeText() === 'Popup') pops++; if (d.get(PDFName.of('NM'))?.decodeText() === 'g') found = d; }
  ok(found && found.get(PDFName.of('AP')) && pops === 1, 'a markup with its picture and pop-up is copied whole');
  const apN = found && d7.context.lookup(found.get(PDFName.of('AP'))).get(PDFName.of('N'));
  const stream = apN && d7.context.lookup(apN);
  ok(stream && stream.getContents && stream.getContents().length > 5, 'its appearance stream has its bytes');
  const popRef2 = found.get(PDFName.of('Popup')), par = d7.context.lookup(popRef2).get(PDFName.of('Parent'));
  ok(par && d7.context.lookup(par) === found, 'the pop-up points back at the markup');
}
// the CLI: git's argument order, a %PDF file
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pdfmerge-'));
fs.writeFileSync(path.join(dir, 'base.pdf'), B); fs.writeFileSync(path.join(dir, 'ours.pdf'), await bytes(O)); fs.writeFileSync(path.join(dir, 't.pdf'), await bytes(T));
const cli = spawnSync(process.execPath, [path.join(ROOT, 'tools/cli/merge.mjs'), path.join(dir, 'base.pdf'), path.join(dir, 'ours.pdf'), path.join(dir, 't.pdf')], { encoding: 'utf8' });
ok(cli.status === 0 && /markupcraft-pdf: merged cleanly/.test(cli.stdout), 'merge.mjs takes a PDF', cli.stdout + cli.stderr);
ok(Object.keys((await read(fs.readFileSync(path.join(dir, 'ours.pdf')))).out).sort().join() === 'a,b,d,e,f', 'and writes the result over ours');
fs.rmSync(dir, { recursive: true, force: true });
console.log(`pdf-merge: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
