#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * The fillable-form PDFs MarkupCraft's form filling (0.8, forms.js / form-ui.js) is tested on, made once into
 * /var/www/CADCRAFT/testfiles/generated/pdf-forms/ (outside git; skipped when a file is there, `--force` remakes).
 *
 *   node tools/markupcraft-test/form-corpus.mjs [--force] [--list]
 *
 *   form-ap.pdf     pdf-lib 1.17.1: three pages. Page 1: text fields (one line, multi-line, max length 5, read-only),
 *                   a check box (ticked), a radio group (B picked), a drop-down ("Two"), a list (several picked) — every
 *                   field with its own appearance (/AP), as Acrobat and most form makers write them. Page 2: one text field
 *                   and another program's Square annotation (an editable markup on a page with a form). Page 3: no form.
 *   form-noap.pdf   the same form with every widget's /AP removed and /NeedAppearances true — the files whose fields
 *                   "don't appear": the values are in /V only, a viewer has to draw them itself.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = '/var/www/CADCRAFT/testfiles/generated/pdf-forms';
const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const lib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const { PDFDocument, StandardFonts, PDFName, PDFBool, rgb } = lib;

export const FORM_FILES = ['form-ap.pdf', 'form-noap.pdf'];
export const FORM_DIR = OUT;

async function makeForm() {
  const doc = await PDFDocument.create();
  doc.setTitle('MarkupCraft form test');
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const form = doc.getForm();
  const p1 = doc.addPage([612, 792]);
  const label = (p, s, x, y) => p.drawText(s, { x, y, size: 10, font, color: rgb(0, 0, 0) });
  label(p1, 'Name', 72, 712);
  const name = form.createTextField('name'); name.setText('Jane Builder'); name.addToPage(p1, { x: 160, y: 700, width: 220, height: 22, font });
  label(p1, 'Notes', 72, 672);
  const notes = form.createTextField('notes'); notes.enableMultiline(); notes.setText('Line one\nLine two'); notes.addToPage(p1, { x: 160, y: 610, width: 300, height: 70, font });
  label(p1, 'Code (5)', 72, 582);
  const code = form.createTextField('code'); code.setMaxLength(5); code.setText('A12'); code.addToPage(p1, { x: 160, y: 570, width: 90, height: 22, font });
  label(p1, 'Locked', 72, 552);
  const locked = form.createTextField('locked'); locked.setText('Do not change'); locked.enableReadOnly(); locked.addToPage(p1, { x: 160, y: 540, width: 160, height: 22, font });
  label(p1, 'Approved', 72, 512);
  const ok = form.createCheckBox('approved'); ok.addToPage(p1, { x: 160, y: 506, width: 16, height: 16 }); ok.check();
  label(p1, 'Grade', 72, 482);
  const grade = form.createRadioGroup('grade');
  grade.addOptionToPage('A', p1, { x: 160, y: 476, width: 16, height: 16 });
  grade.addOptionToPage('B', p1, { x: 200, y: 476, width: 16, height: 16 });
  grade.addOptionToPage('C', p1, { x: 240, y: 476, width: 16, height: 16 });
  grade.select('B');
  label(p1, 'Pick', 72, 446);
  const pick = form.createDropdown('pick'); pick.addOptions(['One', 'Two', 'Three']); pick.select('Two'); pick.addToPage(p1, { x: 160, y: 440, width: 120, height: 20, font });
  label(p1, 'Trades', 72, 410);
  const trades = form.createOptionList('trades'); trades.addOptions(['Electrical', 'Plumbing', 'Framing', 'Roofing']); trades.enableMultiselect(); trades.select(['Plumbing', 'Roofing']);
  trades.addToPage(p1, { x: 160, y: 340, width: 140, height: 76, font });
  const p2 = doc.addPage([612, 792]);
  label(p2, 'Inspector', 72, 712);
  const insp = form.createTextField('inspector'); insp.setText('R. Davis'); insp.addToPage(p2, { x: 160, y: 700, width: 220, height: 22, font });
  // another program's Square (an editable markup) on the page with a field
  const sq = doc.context.obj({ Type: 'Annot', Subtype: 'Square', Rect: [300, 300, 420, 380], C: [1, 0, 0], Border: [0, 0, 2], T: lib.PDFString.of('Other program'), Contents: lib.PDFString.of('Check this') });
  p2.node.addAnnot(doc.context.register(sq));
  const p3 = doc.addPage([612, 792]);
  label(p3, 'A page with no form.', 72, 712);
  form.updateFieldAppearances(font);
  return doc;
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  if (args.includes('--list')) { for (const f of FORM_FILES) console.log(path.join(OUT, f), fs.existsSync(path.join(OUT, f)) ? 'made' : 'missing'); return; }
  const ap = path.join(OUT, 'form-ap.pdf'), noap = path.join(OUT, 'form-noap.pdf');
  if (FORCE || !fs.existsSync(ap)) { const d = await makeForm(); fs.writeFileSync(ap, await d.save({ useObjectStreams: false })); console.log('made', ap); }
  if (FORCE || !fs.existsSync(noap)) {
    const d = await PDFDocument.load(fs.readFileSync(ap));
    for (const f of d.getForm().getFields()) for (const w of f.acroField.getWidgets()) w.dict.delete(PDFName.of('AP'));
    d.catalog.lookup(PDFName.of('AcroForm')).set(PDFName.of('NeedAppearances'), PDFBool.True);
    fs.writeFileSync(noap, await d.save({ useObjectStreams: false, updateFieldAppearances: false }));
    console.log('made', noap);
  }
}
if (import.meta.url === pathToFileURL(process.argv[1]).href) await main();
