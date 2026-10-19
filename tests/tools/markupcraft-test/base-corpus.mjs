#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * The PDFs the base-content work (DF.14) is tested on, made once into
 * /var/www/CADCRAFT/testfiles/generated/pdf-base/ (outside git; skipped when a file is there, `--force` remakes).
 *
 *   node tools/markupcraft-test/base-corpus.mjs [--force] [--list]
 *
 * Made here, each from a different writer so the content streams look different:
 *   awkward.pdf      written by hand: comments, escaped and octal strings, hex strings, TJ kerning, Tz, ' and ",
 *                    an inline image whose raw bytes contain " EI ", a clip path, an axial shading inside marked
 *                    content, an image XObject, a form XObject used twice that holds another form, and one path
 *                    whose operands end the first content stream while its operator starts the second.
 *   pdflib.pdf       pdf-lib 1.17.1: shapes, SVG curves, Helvetica text, a PNG and a JPEG, an embedded page
 *                    (form XObject); object streams on.
 *   ghostscript.pdf  ps2pdf (Ghostscript pdfwrite) from ghostscript.ps written here: subset Type1C fonts, curves, an image.
 *   cairo.pdf        pdftocairo -pdf of pages 3–4 of shared-mime-info-spec.pdf (cairo re-embeds the Type1 subsets; page 4 has rules).
 *   chromium.pdf     Chromium's print to PDF (Skia) of a small page: TrueType fonts as Type0 / CIDFontType2, Identity-H,
 *                    2-byte codes — the font kind "Save as PDF" in a browser and many office programs write.
 *   blank-grid.pdf   MarkupCraft's own File › New page with the square grid (blank.js).
 *   encrypted.pdf    ghostscript.pdf re-written by Ghostscript with an owner password (opens without one): must refuse.
 *   signed.pdf       pdflib.pdf with an AcroForm whose signature field has a value (/SigFlags 3): must refuse.
 * And the ones already on the machine (read in place, never copied): the public kitchen fixture (pdf-lib), the
 * PartCraft flange drawing (our own PDF writer), shared-mime-info-spec.pdf (pdfTeX, Type1 subsets, 17 pages) and
 * a client set (Acrobat Distiller; client files live in testfiles and are listed in testfiles/CLIENT-PDFS.json, never in the repo).
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = '/var/www/CADCRAFT/testfiles/generated/pdf-base';
const FORCE = process.argv.includes('--force');

/** Client PDFs stay outside the repo: testfiles/CLIENT-PDFS.json lists them ([{name, file, producer}]); missing = none. */
function clientPdfs() {
  try {
    return JSON.parse(fs.readFileSync('/var/www/CADCRAFT/testfiles/CLIENT-PDFS.json', 'utf8')).map((c) => ({ ...c, client: true }));
  } catch { return []; }
}

export const CORPUS = [
  { name: 'awkward', file: path.join(OUT, 'awkward.pdf'), made: true, producer: 'hand-written' },
  { name: 'pdflib', file: path.join(OUT, 'pdflib.pdf'), made: true, producer: 'pdf-lib 1.17.1' },
  { name: 'ghostscript', file: path.join(OUT, 'ghostscript.pdf'), made: true, producer: 'Ghostscript pdfwrite' },
  { name: 'cairo', file: path.join(OUT, 'cairo.pdf'), made: true, producer: 'cairo (pdftocairo)' },
  { name: 'blank-grid', file: path.join(OUT, 'blank-grid.pdf'), made: true, producer: 'MarkupCraft blank.js' },
  { name: 'chromium', file: path.join(OUT, 'chromium.pdf'), made: true, producer: 'Chromium print to PDF (Skia)' },
  { name: 'encrypted', file: path.join(OUT, 'encrypted.pdf'), made: true, producer: 'Ghostscript, 128-bit RC4, owner password', blocked: 'encrypted' },
  { name: 'signed', file: path.join(OUT, 'signed.pdf'), made: true, producer: 'pdf-lib + a filled signature field', blocked: 'signed' },
  { name: 'kitchen', file: path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'), producer: 'pdf-lib (public fixture)' },
  { name: 'flange', file: path.join(ROOT, 'flange-drawing.pdf'), producer: 'PartCraft' },
  { name: 'pdftex', file: '/usr/share/doc/shared-mime-info/shared-mime-info-spec.pdf', producer: 'pdfTeX-1.40.22' },
  ...clientPdfs(),
];

/** A PDF from object bodies (strings or {dict, stream: Buffer}), with a correct xref. */
function writePdf(objects, rootNum) {
  const parts = [Buffer.from('%PDF-1.7\n%\xe2\xe3\xcf\xd3\n', 'latin1')];
  let at = parts[0].length;
  const offs = [];
  objects.forEach((o, k) => {
    offs.push(at);
    let body;
    if (typeof o === 'string') body = Buffer.from(`${k + 1} 0 obj\n${o}\nendobj\n`, 'latin1');
    else body = Buffer.concat([Buffer.from(`${k + 1} 0 obj\n<<${o.dict} /Length ${o.stream.length}>>\nstream\n`, 'latin1'), o.stream, Buffer.from('\nendstream\nendobj\n', 'latin1')]);
    parts.push(body);
    at += body.length;
  });
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const o of offs) xref += String(o).padStart(10, '0') + ' 00000 n \n';
  xref += `trailer\n<< /Size ${objects.length + 1} /Root ${rootNum} 0 R >>\nstartxref\n${at}\n%%EOF\n`;
  parts.push(Buffer.from(xref, 'latin1'));
  return Buffer.concat(parts);
}

export function awkward() {
  const img = Buffer.from([255, 0, 0, 0, 255, 0, 0x20, 0x45, 0x49, 0x20, 0, 255, 255, 255, 0, 0, 0, 0, 128, 128, 128, 0x45, 0x49, 10]);
  const a = Buffer.concat([
    Buffer.from(
      '% MarkupCraft DF.14 spike: an awkward but valid page\r\n' +
      'q 1 0 0 1 0 0 cm\n' +
      '0.5 w 1 0 0 RG\n50 700 m 150 700 l 150 750 l h S\n' +
      'q 0 0 1 rg 200 700 100 50 re f Q\n' +
      'q 220 600 m 300 600 l 260 680 l h W n 0.8 g 200 590 120 100 re f Q % a clip\n' +
      'BT /F1 18 Tf 50 650 Td (Hello \\(world\\) \\\\ \\101\\102) Tj 0 -24 Td [(Kern)-120(ed)<20>(Text)]TJ ET\n' +
      'BT/F1 12 Tf 1 0 0 1 50 560 Tm 120 Tz 14 TL(Scaled)Tj T*(quoted)\' 2 1(dq)" ET\n' +
      'q 40 0 0 20 300 520 cm BI /W 4 /H 2 /CS /RGB /BPC 8 ID ', 'latin1'),
    img,
    Buffer.from(' EI Q\n' +
      'q 30 0 0 30 400 650 cm /Im1 Do Q\n' +
      '/Fm1 Do\nq 1 0 0 1 200 0 cm /Fm1 Do Q\n' +
      '/Span <</MCID 0 /Alt (shade)>> BDC q 300 300 100 50 re W n /Sh0 sh Q EMC\n' +
      '0 0 1 RG 2 w 50 400\n', 'latin1'),
  ]);
  const b = zlib.deflateSync(Buffer.from('m 120 300 l 180 420 l S\n0 0.5 0 rg 60 200 150 60 re f\nQ\n', 'latin1'));
  const fm2 = Buffer.from('BT /F1 10 Tf 5 70 Td <696e6e6572> Tj ET\n', 'latin1');
  const fm1 = Buffer.from('0 g 0 0 m 80 0 l 40 60 l h f\n/Fm2 Do\n', 'latin1');
  const im1 = Buffer.from([0, 64, 128, 255, 64, 128, 255, 0, 128, 255, 0, 64, 255, 0, 64, 128]);
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',                                                       // 1
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',                                               // 2
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents [4 0 R 5 0 R] /Resources << /Font << /F1 6 0 R >> /XObject << /Fm1 7 0 R /Im1 9 0 R >> /Shading << /Sh0 10 0 R >> >> >>', // 3
    { dict: '', stream: a },                                                                  // 4
    { dict: ' /Filter /FlateDecode', stream: b },                                             // 5
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',       // 6
    { dict: ' /Type /XObject /Subtype /Form /BBox [0 0 100 100] /Matrix [1 0 0 1 50 200] /Resources << /XObject << /Fm2 8 0 R >> /Font << /F1 6 0 R >> >>', stream: fm1 }, // 7
    { dict: ' /Type /XObject /Subtype /Form /BBox [0 0 100 100] /Resources << /Font << /F1 6 0 R >> >>', stream: fm2 }, // 8
    { dict: ' /Type /XObject /Subtype /Image /Width 4 /Height 4 /ColorSpace /DeviceGray /BitsPerComponent 8', stream: im1 }, // 9
    '<< /ShadingType 2 /ColorSpace /DeviceRGB /Coords [300 300 400 300] /Function << /FunctionType 2 /Domain [0 1] /C0 [1 0 0] /C1 [0 0 1] /N 1 >> >>', // 10
  ];
  return writePdf(objs, 1);
}

async function pdflib() {
  const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
  const { createCanvas } = await import(pathToFileURL(path.join(ROOT, 'tools/markupcraft-test/node_modules/@napi-rs/canvas/index.js')).href);
  const doc = await PDFLib.PDFDocument.create();
  const helv = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
  const bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
  const cv = createCanvas(60, 40);
  const g = cv.getContext('2d');
  g.fillStyle = '#ffffff'; g.fillRect(0, 0, 60, 40); g.fillStyle = '#0a7'; g.fillRect(5, 5, 50, 30); g.fillStyle = '#c00'; g.beginPath(); g.arc(30, 20, 10, 0, 7); g.fill();
  const png = await doc.embedPng(cv.toBuffer('image/png'));
  const jpg = await doc.embedJpg(cv.toBuffer('image/jpeg'));
  const kitchen = await PDFLib.PDFDocument.load(fs.readFileSync(path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf')));
  const [emb] = await doc.embedPdf(kitchen, [0]);
  const page = doc.addPage([792, 612]);
  page.drawRectangle({ x: 40, y: 40, width: 712, height: 532, borderColor: PDFLib.rgb(0, 0, 0), borderWidth: 1.5 });
  page.drawText('Door schedule', { x: 60, y: 540, size: 20, font: bold });
  page.drawText('Frame 3070 hollow metal, closer, kick plate', { x: 60, y: 515, size: 11, font: helv });
  page.drawSvgPath('M 0 0 C 40 -60 120 -60 160 0 S 280 60 320 0', { x: 60, y: 460, borderColor: PDFLib.rgb(0.8, 0.1, 0.1), borderWidth: 2 });
  page.drawLine({ start: { x: 60, y: 380 }, end: { x: 380, y: 380 }, thickness: 0.75, color: PDFLib.rgb(0, 0, 0.6), dashArray: [6, 3] });
  page.drawImage(png, { x: 420, y: 430, width: 120, height: 80 });
  page.drawImage(jpg, { x: 560, y: 430, width: 120, height: 80 });
  page.drawPage(emb, { x: 420, y: 60, xScale: 0.35, yScale: 0.35 });
  page.drawText('Second stream text', { x: 60, y: 300, size: 14, font: helv });
  return Buffer.from(await doc.save({ useObjectStreams: true }));
}

function ghostscript() {
  const ps = path.join(OUT, 'ghostscript.ps');
  fs.writeFileSync(ps, [
    '%!PS-Adobe-3.0', '%%BoundingBox: 0 0 612 792', '<< /PageSize [612 792] >> setpagedevice',
    '/Times-Roman findfont 24 scalefont setfont 72 700 moveto (Section through the wall) show',
    '/Helvetica findfont 12 scalefont setfont 72 676 moveto (Gypsum board, 5/8 in. type X, both faces) show',
    '72 650 moveto (Studs 3-5/8 in. at 16 in. on center) show',
    '1.5 setlinewidth 0 0 0.7 setrgbcolor newpath 72 400 moveto 200 520 300 280 450 400 curveto stroke',
    '0.9 setgray newpath 100 200 moveto 300 200 lineto 300 300 lineto 100 300 lineto closepath fill',
    '0 setgray 2 setlinewidth newpath 100 200 moveto 300 200 lineto 300 300 lineto 100 300 lineto closepath stroke',
    'gsave 350 150 translate 120 120 scale 8 8 8 [8 0 0 -8 0 8] {<00204060809fbfdf20406080a0c0e0ff406080a0c0e0ff00>} image grestore',
    'showpage', '%%EOF', '',
  ].join('\n'));
  execFileSync('ps2pdf', ['-dPDFSETTINGS=/prepress', ps, path.join(OUT, 'ghostscript.pdf')], { stdio: 'ignore' });
  return null;
}

async function signed() { return signedFrom(fs.readFileSync(path.join(OUT, 'pdflib.pdf'))); }

/** A copy of a PDF with an AcroForm whose signature field has a value (what a signed file looks like to us). */
export async function signedFrom(bytes) {
  const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
  const doc = await PDFLib.PDFDocument.load(bytes);
  const ctx = doc.context;
  const sigValue = ctx.obj({ Type: 'Sig', Filter: 'Adobe.PPKLite', SubFilter: 'adbe.pkcs7.detached', ByteRange: [0, 0, 0, 0], Contents: PDFLib.PDFHexString.of('00'.repeat(64)) });
  const field = ctx.obj({ FT: 'Sig', T: PDFLib.PDFString.of('Signature1'), V: ctx.register(sigValue), Type: 'Annot', Subtype: 'Widget', Rect: [0, 0, 0, 0], F: 132, P: doc.getPage(0).ref });
  const fieldRef = ctx.register(field);
  doc.catalog.set(PDFLib.PDFName.of('AcroForm'), ctx.obj({ Fields: [fieldRef], SigFlags: 3 }));
  doc.getPage(0).node.set(PDFLib.PDFName.of('Annots'), ctx.obj([fieldRef]));
  return Buffer.from(await doc.save({ useObjectStreams: false }));
}

async function chromium() {
  const { chromium: pw } = await import('playwright-core');
  const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
  const build = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
  const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cache, build, s)).find((p) => fs.existsSync(p));
  const browser = await pw.launch({ executablePath: exe, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    await page.setContent(`<!doctype html><meta charset="utf-8"><body style="font: 14px 'DejaVu Sans', sans-serif; margin: 40px">
      <h1 style="font: 700 26px 'DejaVu Serif', serif">Mechanical room</h1>
      <p>Pump P-1 replaced with a quieter unit; isolation valves stay.</p>
      <p style="font-family: 'DejaVu Sans Mono', monospace">Duct 600 x 400 at 2.7 m</p>
      <svg width="420" height="160" viewBox="0 0 420 160"><rect x="10" y="10" width="160" height="90" fill="none" stroke="#000" stroke-width="2"/>
      <path d="M200 120 C 240 20, 320 20, 400 120" fill="none" stroke="#c00" stroke-width="3"/><circle cx="90" cy="130" r="20" fill="#0a7"/></svg>
      <div style="border: 1px solid #333; width: 300px; height: 40px; margin-top: 10px"></div></body>`);
    return Buffer.from(await page.pdf({ format: 'Letter', printBackground: true }));
  } finally { await browser.close(); }
}

async function blankGrid() {
  const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
  const blank = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/markupcraft/dev/blank.js')).href);
  return Buffer.from(await blank.blankPdf(PDFLib, { paper: 'letter', orient: 'portrait', grid: 'square', pages: 1 }));
}

export async function makeCorpus({ force = FORCE, log = () => {} } = {}) {
  fs.mkdirSync(OUT, { recursive: true });
  const make = async (name, fn) => {
    const f = path.join(OUT, name);
    if (fs.existsSync(f) && !force) return;
    const bytes = await fn();
    if (bytes) fs.writeFileSync(f, bytes);
    log('made ' + f);
  };
  await make('awkward.pdf', awkward);
  await make('pdflib.pdf', pdflib);
  await make('ghostscript.pdf', ghostscript);
  await make('cairo.pdf', () => { execFileSync('pdftocairo', ['-pdf', '-f', '3', '-l', '4', CORPUS.find((c) => c.name === 'pdftex').file, path.join(OUT, 'cairo.pdf')]); return null; });
  await make('blank-grid.pdf', blankGrid);
  await make('chromium.pdf', chromium);
  await make('encrypted.pdf', () => { execFileSync('gs', ['-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-sOwnerPassword=owner', '-sUserPassword=', '-dEncryptionR=3', '-dKeyLength=128', '-o', path.join(OUT, 'encrypted.pdf'), path.join(OUT, 'ghostscript.pdf')], { stdio: 'ignore' }); return null; });
  await make('signed.pdf', signed);
  return CORPUS.filter((c) => fs.existsSync(c.file));
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const list = await makeCorpus({ log: console.log });
  if (process.argv.includes('--list')) for (const c of list) console.log(c.name.padEnd(12), c.producer.padEnd(34), c.file);
}
