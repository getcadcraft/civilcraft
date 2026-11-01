#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * The 71.10 OCR spike: classic OCR (ocr.js) measured on the synthetic scan fixture and on public-domain book scans.
 *   node tools/markupcraft-test/ocr-spike/run.mjs [--only synth|seattle] [--dump]
 * Templates come from the PDF standard fonts (Times, Helvetica, Courier: pdf-lib writes the glyphs, pdf.js draws them
 * with its bundled font data), the way the app would make them. Truth: fixtures/pdf/scan-filters.json (synthetic) and
 * testfiles/scans-public/seattle-1924/n30.truth.txt (hand-corrected text of a 1924 page).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ocrPage, binarize, pieces, glyphFeature, topK, OFF_A, TUNE, WEIGHTS } from './ocr.js';
if (process.env.OCR_TUNE) Object.assign(TUNE, JSON.parse(process.env.OCR_TUNE));
if (process.env.OCR_W) Object.assign(WEIGHTS, JSON.parse(process.env.OCR_W));

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../../..');
const T = path.join(REPO, 'tools/markupcraft-test/node_modules/');
const pdfjs = await import(pathToFileURL(T + 'pdfjs-dist/legacy/build/pdf.mjs').href);
const PDFLib = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const { createCanvas, loadImage } = await import(pathToFileURL(T + '@napi-rs/canvas/index.js').href);
const args = process.argv.slice(2);
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : '';
const docOpts = { isEvalSupported: false, standardFontDataUrl: T + 'pdfjs-dist/standard_fonts/', wasmUrl: T + 'pdfjs-dist/wasm/' };
const quiet = async (fn) => { const w = console.warn, l = console.log; console.warn = () => {}; console.log = (...a) => { if (!String(a[0]).startsWith('Warning')) l(...a); }; try { return await fn(); } finally { console.warn = w; console.log = l; } };

export const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.,;:\'"()-/&%$#?!“”’‘*[]';
const FONTS = ['TimesRoman', 'TimesRomanBold', 'TimesRomanItalic', 'Helvetica', 'HelveticaBold', 'Courier', 'CourierBold'];

async function greyOfCanvas(c) {
  const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, g = new Uint8Array(c.width * c.height);
  for (let i = 0; i < g.length; i++) g[i] = (d[i * 4] * 77 + d[i * 4 + 1] * 151 + d[i * 4 + 2] * 28) >> 8;
  return { w: c.width, h: c.height, data: g };
}

/** Glyph templates: one page per font, every character in its own cell at 60 pt, drawn by pdf.js. */
export async function makeTemplates(size = 60) {
  const doc = await PDFLib.PDFDocument.create();
  const cols = 12, cell = size * 1.6, rows = Math.ceil(CHARS.length / cols);
  const W = cols * cell, Hh = rows * cell;
  for (const fn of FONTS) {
    const font = await doc.embedFont(PDFLib.StandardFonts[fn]);
    const p = doc.addPage([W, Hh]);
    [...CHARS].forEach((ch, i) => p.drawText(ch, { x: (i % cols) * cell + size * 0.3, y: Hh - (Math.floor(i / cols) + 1) * cell + size * 0.45, size, font }));
  }
  const bytes = await doc.save();
  const pdf = await quiet(() => pdfjs.getDocument({ data: bytes, ...docOpts }).promise);
  const out = [];
  for (let k = 0; k < FONTS.length; k++) {
    const pg = await pdf.getPage(k + 1);
    const vp = pg.getViewport({ scale: 1 });
    const c = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    await quiet(() => pg.render({ canvas: c, canvasContext: c.getContext('2d'), viewport: vp, background: '#ffffff' }).promise);
    const g = await greyOfCanvas(c);
    const bm = new Uint8Array(g.w * g.h);
    for (let i = 0; i < bm.length; i++) bm[i] = g.data[i] < 128 ? 1 : 0;
    // x-height of this font: the 'x' cell's ink
    const box = (i) => { const cx = (i % cols) * cell, cy = Math.floor(i / cols) * cell; let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let y = Math.floor(cy); y < Math.floor(cy + cell); y++) for (let x = Math.floor(cx); x < Math.floor(cx + cell); x++) if (bm[y * g.w + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return x1 < 0 ? null : [x0, y0, x1 + 1, y1 + 1]; };
    const bx = box(CHARS.indexOf('x'));
    const xh = bx[3] - bx[1], baselineOf = (i) => Math.floor(i / cols) * cell + (cell - size * 0.45);
    [...CHARS].forEach((ch, i) => {
      const b = box(i);
      if (!b) return;
      out.push({ ch, font: FONTS[k], f: glyphFeature(bm, g.w, b, baselineOf(i), xh) });
    });
  }
  return out;
}

const norm = (s) => s.replace(/[¬]/g, '-').replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
function words(text) { return norm(text).split(/\s+/).map((w) => w.toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '')).filter(Boolean); }
function bagScore(truthText, gotText) {
  const tw = words(truthText), gw = words(gotText), bag = new Map();
  for (const w of tw) bag.set(w, (bag.get(w) || 0) + 1);
  let hit = 0;
  for (const w of gw) { const n = bag.get(w) || 0; if (n) { hit++; bag.set(w, n - 1); } }
  return { truth: tw.length, got: gw.length, hit, recall: +(hit / tw.length).toFixed(3), precision: +(hit / Math.max(1, gw.length)).toFixed(3) };
}
function lev(a, b) {
  const m = a.length, n = b.length; let prev = new Int32Array(n + 1), cur = new Int32Array(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) { cur[0] = i; for (let j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); [prev, cur] = [cur, prev]; }
  return prev[n];
}
/** Character confusions, line by line (truth line i ↔ OCR line i): "e→c ×3, …". */
function confusions(tl, gl) {
  const cnt = new Map();
  const n = Math.min(tl.length, gl.length);
  for (let k = 0; k < n; k++) {
    const a = norm(tl[k]).replace(/ /g, ''), b = gl[k].replace(/ /g, '');
    const D = Array.from({ length: a.length + 1 }, (_, i) => { const r = new Int32Array(b.length + 1); r[0] = i; return r; });
    for (let j = 0; j <= b.length; j++) D[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) D[i][j] = Math.min(D[i - 1][j] + 1, D[i][j - 1] + 1, D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    let i = a.length, j = b.length;
    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && D[i][j] === D[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) { if (a[i - 1] !== b[j - 1]) { const key = a[i - 1] + '→' + b[j - 1]; cnt.set(key, (cnt.get(key) || 0) + 1); } i--; j--; }
      else if (i > 0 && D[i][j] === D[i - 1][j] + 1) { const key = a[i - 1] + '→∅'; cnt.set(key, (cnt.get(key) || 0) + 1); i--; }
      else { const key = '∅→' + b[j - 1]; cnt.set(key, (cnt.get(key) || 0) + 1); j--; }
    }
  }
  return [...cnt].sort((x, y) => y[1] - x[1]).slice(0, 30).map(([k, v]) => k + '×' + v).join(' ');
}
/** Only the words the engine is sure of (every character's match under the bar): how many are kept, how many of them are right. */
function gated(truthText, r, bar) {
  const kept = r.lines.flatMap((l) => l.words).filter((w) => w.conf >= bar).map((w) => w.text).join(' ');
  const b = bagScore(truthText, kept);
  return { bar, kept: b.got, right: b.hit, precision: b.precision, recall: b.recall };
}
const textOf = (r) => r.lines.map((l) => l.words.map((w) => w.text).join(' ')).join('\n');

const tpl = await makeTemplates();
console.log('templates: ' + tpl.length + ' glyphs from ' + FONTS.join(', '));

if (!ONLY || ONLY === 'synth') {
  const meta = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/pdf/scan-filters.json'), 'utf8'));
  const pdf = await quiet(() => pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(path.join(REPO, 'fixtures/pdf/scan-filters.pdf'))), ...docOpts }).promise);
  for (const [n, scale, truthKey] of [[2, 150 / 72, 'lines'], [8, 300 / 72, 'lines_300'], [1, 150 / 72, 'lines']]) {
    const pg = await pdf.getPage(n), vp = pg.getViewport({ scale });
    const c = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
    await quiet(() => pg.render({ canvas: c, canvasContext: c.getContext('2d'), viewport: vp, background: '#ffffff' }).promise);
    const r = ocrPage(await greyOfCanvas(c), tpl, { debug: args.includes('--debug') });
    if (args.includes('--debug') && n === 8) {
      const L = +(args[args.indexOf('--debug') + 1] || 2);
      for (const ch of r.lines.raw[L].chars) console.log(ch.r.ch, ch.ids.size, ch.r.d.toFixed(2), 'w/xh', ((ch.x1 - ch.x0) / r.lines.raw[L].m.xh).toFixed(2), 'top', ch.f[OFF_A + 1].toFixed(2), 'bot', ch.f[OFF_A + 2].toFixed(2), JSON.stringify(topK(ch.f, tpl, 4).map((t) => t.ch + ':' + t.font.slice(0, 6) + ':' + t.d)));
    }
    const truth = meta[truthKey].map((l) => l.text).join('\n'), got = textOf(r);
    const cer = lev(norm(truth).replace(/\s+/g, ' '), got.replace(/\s+/g, ' ')) / truth.length;
    console.log(`synthetic page ${n} (${meta.pages[n - 1]}, ${Math.round(scale * 72)} dpi): skew ${r.deg}°, ${r.stats.chars} chars, ${r.stats.ms} ms, own templates ${r.stats.own}, fonts ${r.stats.fonts}`);
    console.log('   words ' + JSON.stringify(bagScore(truth, got)) + '  CER ' + (cer * 100).toFixed(1) + ' %');
    for (const bar of [0.6, 0.7, 0.8]) console.log('   sure words only ' + JSON.stringify(gated(truth, r, bar)));
    if (args.includes('--confusions')) console.log('   ' + confusions(meta[truthKey].map((l) => l.text), r.lines.map((l) => l.words.map((w) => w.text).join(' '))));
    if (args.includes('--dump')) console.log(got);
  }
}

if (!ONLY || ONLY === 'seattle') {
  const dir = path.join(REPO, '../testfiles/scans-public/seattle-1924');
  if (fs.existsSync(path.join(dir, 'n30.jpg'))) {
    const img = await loadImage(fs.readFileSync(path.join(dir, 'n30.jpg')));
    // the photo is ~400 dpi; read it at ~300 dpi like a scanner would hand it over
    const s = 0.75, c = createCanvas(Math.round(img.width * s), Math.round(img.height * s));
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    const r = ocrPage(await greyOfCanvas(c), tpl);
    const truth = fs.readFileSync(path.join(dir, 'n30.truth.txt'), 'utf8'), got = textOf(r);
    console.log(`Seattle 1924 page 27: skew ${r.deg}°, ${r.stats.chars} chars, ${r.stats.ms} ms, own templates ${r.stats.own}, fonts ${r.stats.fonts}, x/cap ${r.stats.capRatio.toFixed(2)}`);
    console.log('   words ' + JSON.stringify(bagScore(truth, got)));
    for (const bar of [0.6, 0.7, 0.8]) console.log('   sure words only ' + JSON.stringify(gated(truth, r, bar)));
    if (args.includes('--dump')) console.log(got);
  } else console.log('(no testfiles/scans-public: the real scan is skipped)');
}
