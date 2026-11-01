#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Word accuracy of MarkupCraft's OCR engine (Tesseract via tesseract.js, 0.7.1 71.10) on the pages the classic spike was
 * measured on, for one or more traineddata folders:
 *   node tools/markupcraft-test/ocr-measure.mjs [--data <dir>[,<dir>…]] [--lang eng] [--dump]
 * Default data: the vendored copy (public_html/assets/vendor/tessdata/current). Pages: fixtures/pdf/scan-filters.pdf p. 8
 * (300 dpi), p. 2 and p. 1 (150 dpi), and the 1924 Seattle building code p. 27 from testfiles/scans-public (skipped when
 * missing). Score = bag of words, case and punctuation ignored (the spike's measure).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const NM = path.join(HERE, 'node_modules/');
const pdfjs = await import(pathToFileURL(NM + 'pdfjs-dist/legacy/build/pdf.mjs').href);
const { createCanvas, loadImage } = await import(pathToFileURL(NM + '@napi-rs/canvas/index.js').href);
const { createWorker, OEM, PSM } = (await import(pathToFileURL(NM + 'tesseract.js/src/index.js').href)).default;
const args = process.argv.slice(2);
const DATA = (args.includes('--data') ? args[args.indexOf('--data') + 1] : path.join(REPO, 'public_html/assets/vendor/tessdata/current')).split(',');
const LANG = args.includes('--lang') ? args[args.indexOf('--lang') + 1] : 'eng';
const docOpts = { isEvalSupported: false, standardFontDataUrl: NM + 'pdfjs-dist/standard_fonts/', wasmUrl: NM + 'pdfjs-dist/wasm/' };
const quiet = async (fn) => { const w = console.warn, l = console.log; console.warn = () => {}; console.log = (...a) => { if (!String(a[0]).startsWith('Warning')) l(...a); }; try { return await fn(); } finally { console.warn = w; console.log = l; } };

const norm = (s) => s.replace(/[¬]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
const words = (t) => norm(t).split(/\s+/).map((w) => w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')).filter(Boolean);
export function bagScore(truthText, gotText) {
  const tw = words(truthText), gw = words(gotText), bag = new Map();
  for (const w of tw) bag.set(w, (bag.get(w) || 0) + 1);
  let hit = 0;
  for (const w of gw) { const n = bag.get(w) || 0; if (n) { hit++; bag.set(w, n - 1); } }
  return { truth: tw.length, got: gw.length, hit, recall: +(hit / tw.length).toFixed(3), precision: +(hit / Math.max(1, gw.length)).toFixed(3) };
}

const pages = [];
const meta = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/pdf/scan-filters.json'), 'utf8'));
const pdf = await quiet(() => pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(path.join(REPO, 'fixtures/pdf/scan-filters.pdf'))), ...docOpts }).promise);
for (const [n, dpi, key] of [[8, 300, 'lines_300'], [2, 150, 'lines'], [1, 150, 'lines']]) {
  const pg = await pdf.getPage(n), vp = pg.getViewport({ scale: dpi / 72 });
  const c = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
  await quiet(() => pg.render({ canvas: c, canvasContext: c.getContext('2d'), viewport: vp, background: '#ffffff' }).promise);
  pages.push({ name: `synthetic p. ${n} (${meta.pages[n - 1]}, ${dpi} dpi)`, png: c.toBuffer('image/png'), truth: meta[key].map((l) => l.text).join('\n') });
}
const sea = path.join(REPO, '../testfiles/scans-public/seattle-1924');
if (fs.existsSync(path.join(sea, 'n30.jpg'))) {
  const img = await loadImage(fs.readFileSync(path.join(sea, 'n30.jpg')));
  const c = createCanvas(Math.round(img.width * 0.75), Math.round(img.height * 0.75));
  c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  pages.push({ name: 'Seattle 1924 p. 27 (~300 dpi)', png: c.toBuffer('image/png'), truth: fs.readFileSync(path.join(sea, 'n30.truth.txt'), 'utf8') });
}

for (const dir of DATA) {
  const size = fs.readdirSync(dir).filter((f) => f.startsWith(LANG + '.')).map((f) => fs.statSync(path.join(dir, f)).size)[0] || 0;
  console.log(`\n== ${path.relative(REPO, dir) || dir} (${LANG}, ${(size / 1e6).toFixed(1)} MB)`);
  const gz = fs.existsSync(path.join(dir, LANG + '.traineddata.gz'));
  const worker = await createWorker(LANG, OEM.LSTM_ONLY, { langPath: dir, gzip: gz, cacheMethod: 'none' });
  await worker.setParameters({ tessedit_pageseg_mode: PSM.AUTO });
  for (const p of pages) {
    const t0 = Date.now();
    const { data } = await worker.recognize(p.png);
    console.log(`  ${p.name}: ${JSON.stringify(bagScore(p.truth, data.text))} ${Date.now() - t0} ms`);
    if (args.includes('--dump')) console.log(data.text);
  }
  await worker.terminate();
}
