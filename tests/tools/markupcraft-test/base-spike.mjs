#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * DF.14 spike: can MarkupCraft edit a PDF page's own content? Runs on every file of base-corpus.mjs.
 *
 *   node tools/markupcraft-test/base-spike.mjs [--only name,name] [--json]
 *
 * Per file: (1) every page's content and every form XObject it reaches → ops → written back: byte-identical?
 * (2) saved with no edits → every content stream's raw bytes unchanged? (3) one path moved (½ in right, ⅓ in
 * down) and one text run rewritten in its own font (its letters reversed), saved, then read back by
 * pdf.js (render + text), poppler (pdftoppm + pdftotext), pypdf (its own content parser + text) and
 * Ghostscript (render, a fourth opinion): the changed area must be the edited objects' area in every
 * renderer, the renderers must agree with each other, pypdf must find the moved coordinates, and every text
 * reader must find the new words. Edited files go to testfiles/generated/pdf-base/out/ (outside git: one of
 * the inputs is a client file). Report: out/report.json.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { makeCorpus } from './base-corpus.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const TOOLS = path.join(ROOT, 'tools/markupcraft-test');
const APP = path.join(ROOT, 'public_html/assets/apps/markupcraft/dev');
const OUT = '/var/www/CADCRAFT/testfiles/generated/pdf-base/out';
const PY = path.join(TOOLS, 'venv/bin/python');

const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const pdfjs = await import(pathToFileURL(path.join(TOOLS, 'node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
const { createCanvas } = await import(pathToFileURL(path.join(TOOLS, 'node_modules/@napi-rs/canvas/index.js')).href);
const lex = await import(pathToFileURL(path.join(APP, 'base-lex.js')).href);
const bc = await import(pathToFileURL(path.join(APP, 'base-content.js')).href);
const STD_FONTS = path.join(TOOLS, 'node_modules/pdfjs-dist/standard_fonts/');

const quiet = async (fn) => { const w = console.warn, l = console.log; console.warn = () => {}; console.log = () => {}; try { return await fn(); } finally { console.warn = w; console.log = l; } };
const eq = (a, b) => a.length === b.length && a.every((x, i) => x === b[i]);

// ---- readers ---------------------------------------------------------------------------------------
async function pdfjsRead(bytes, index, dpi) {
  const task = pdfjs.getDocument({ data: bytes.slice(), isEvalSupported: false, enableScripting: false, standardFontDataUrl: STD_FONTS });
  const doc = await quiet(() => task.promise);
  const page = await doc.getPage(index + 1);
  const vp = page.getViewport({ scale: dpi / 72 });
  const c = createCanvas(Math.ceil(vp.width), Math.ceil(vp.height));
  const g = c.getContext('2d');
  g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height);
  await quiet(() => page.render({ canvasContext: g, viewport: vp }).promise);
  const rgba = g.getImageData(0, 0, c.width, c.height).data;
  const gray = new Uint8Array(c.width * c.height);
  for (let i = 0; i < gray.length; i++) gray[i] = Math.round(0.299 * rgba[4 * i] + 0.587 * rgba[4 * i + 1] + 0.114 * rgba[4 * i + 2]);
  const tc = await quiet(() => page.getTextContent());
  const text = tc.items.map((it) => it.str).join(' ');
  const out = { w: c.width, h: c.height, gray, text, vp };
  await task.destroy();
  return out;
}

function pgm(buf) {
  // P5 header: magic, width, height, maxval, each separated by white space (comments allowed)
  let i = 0; const f = [];
  while (f.length < 4) {
    while (/\s/.test(String.fromCharCode(buf[i]))) i++;
    if (buf[i] === 0x23) { while (buf[i] !== 10) i++; continue; }
    let s = ''; while (!/\s/.test(String.fromCharCode(buf[i]))) s += String.fromCharCode(buf[i++]);
    f.push(s);
  }
  i++;
  return { w: +f[1], h: +f[2], gray: new Uint8Array(buf.subarray(i, i + f[1] * f[2])) };
}

function popplerRead(file, index, dpi, tmp) {
  const base = path.join(tmp, 'pop');
  execFileSync('pdftoppm', ['-r', String(dpi), '-gray', '-f', String(index + 1), '-l', String(index + 1), '-singlefile', file, base], { stdio: ['ignore', 'ignore', 'pipe'] });
  const img = pgm(fs.readFileSync(base + '.pgm'));
  const text = execFileSync('pdftotext', ['-f', String(index + 1), '-l', String(index + 1), file, '-'], { encoding: 'utf8' });
  return { ...img, text };
}

function gsRead(file, index, dpi, tmp) {
  const out = path.join(tmp, 'gs.pgm');
  execFileSync('gs', ['-q', '-dSAFER', '-dBATCH', '-dNOPAUSE', '-sDEVICE=pgmraw', `-r${dpi}`, `-dFirstPage=${index + 1}`, `-dLastPage=${index + 1}`,
    '-dTextAlphaBits=4', '-dGraphicsAlphaBits=4', '-o', out, file], { stdio: ['ignore', 'ignore', 'pipe'] });
  return pgm(fs.readFileSync(out));
}

function pypdfRead(file, index, form = null) {
  if (!fs.existsSync(PY)) return null;
  const args = ['-I', path.join(TOOLS, 'base_pypdf.py'), file, String(index)];
  if (form) args.push(form);
  return JSON.parse(execFileSync(PY, args, { encoding: 'utf8', maxBuffer: 256 << 20 }));
}

/** Changed 2-pt blocks between two renders of the same reader, in page space via the pdf.js viewport. */
function changedBlocks(a, b, vp, dpi) {
  const blocks = new Set();
  if (a.w !== b.w || a.h !== b.h) return null;
  const k = dpi / 72;
  for (let y = 0; y < a.h; y++) for (let x = 0; x < a.w; x++) {
    const i = y * a.w + x;
    if (Math.abs(a.gray[i] - b.gray[i]) <= 4) continue;   // one reader renders the same bytes the same way: any change is real
    const [px, py] = vp.convertToPdfPoint(x + 0.5, y + 0.5);
    blocks.add(Math.floor(px / 2) + ',' + Math.floor(py / 2));
    void k;
  }
  return blocks;
}
/** 2-pt blocks that hold ink (any pixel that is not paper: darker than 250) — what a reader shows, coarse enough to compare readers. */
function inkBlocks(img, vp) {
  const out = new Set();
  for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
    if (img.gray[y * img.w + x] >= 250) continue;
    const [px, py] = vp.convertToPdfPoint(x + 0.5, y + 0.5);
    out.add(Math.floor(px / 2) + ',' + Math.floor(py / 2));
  }
  return out;
}
/**
 * Places where two readers disagree about ink on the EDITED file but agreed on the original (a block and its
 * neighbours): the disagreement the edit itself brought in. 0 = the readers agree on the edit.
 */
function newDisagreement(a0, a1, b0, b1, where = null, box = null) {
  const near = (S, x, y) => { for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (S.has((x + dx) + ',' + (y + dy))) return true; return false; };
  let n = 0;
  for (const [A, B] of [[a1, b1], [b1, a1]]) for (const k of A) {
    if (B.has(k)) continue;
    const [x, y] = k.split(',').map(Number);
    // a line lying exactly on the page edge: each reader rasterizes that last pixel its own way
    if (box && (x * 2 < box[0] + 2 || x * 2 + 2 > box[2] - 2 || y * 2 < box[1] + 2 || y * 2 + 2 > box[3] - 2)) continue;
    if (near(B, x, y)) continue;                     // a pixel's difference in where a line falls
    if (a0.has(k) !== b0.has(k) || near(A === a1 ? b0 : a0, x, y) !== near(A === a1 ? a0 : b0, x, y)) continue;   // they already differed here
    n++;
    if (where && where.length < 12) where.push([x * 2, y * 2, A === a1 ? 'first has ink' : 'second has ink']);
  }
  return n;
}
const iou = (A, B) => { if (!A.size && !B.size) return 1; let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n); };
/** IoU after letting each block match a neighbour (anti-aliasing differs by a pixel between renderers). */
function looseIou(A, B) {
  const near = (S, key) => { const [x, y] = key.split(',').map(Number); for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) if (S.has((x + dx) + ',' + (y + dy))) return true; return false; };
  let a = 0, b = 0;
  for (const x of A) if (near(B, x)) a++;
  for (const x of B) if (near(A, x)) b++;
  return A.size + B.size ? (a + b) / (A.size + B.size) : 1;
}
const inBoxes = (key, boxes) => { const [x, y] = key.split(',').map(Number); const cx = x * 2 + 1, cy = y * 2 + 1; return boxes.some((b) => cx >= b[0] && cx <= b[2] && cy >= b[1] && cy <= b[3]); };
const pad = (b, m) => [b[0] - m, b[1] - m, b[2] + m, b[3] + m];
const squash = (s) => s.replace(/\s+/g, '');

// ---- choosing what to edit --------------------------------------------------------------------------
function pickPath(pc) {
  const ok = pc.objects.filter((o) => o.kind === 'path' && !o.clip && !o.inText && Number.isFinite(o.bbox[0])
    && (o.where === 'page' || pc.contents.get(o.where).uses === 1));
  const sized = ok.filter((o) => { const w = o.bbox[2] - o.bbox[0], h = o.bbox[3] - o.bbox[1]; return Math.max(w, h) >= 8 && w * h < 0.25 * pageArea(pc); });
  const c = (o) => pc.contents.get(o.where);
  // not across two of the page's streams
  const single = sized.filter((o) => { if (o.where !== 'page') return true; const s = c(o).ops[o.first].s, e = c(o).ops[o.last].e; return c(o).segments.some((g) => s >= g.s && e <= g.e); });
  if (!single.length) {                               // only big paths (a grid drawn as one path): take the biggest
    const big = ok.filter((o) => o.where === 'page');
    return big.sort((a, b) => (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]) - (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]))[0] || null;
  }
  return single.sort((a, b) => (b.bbox[2] - b.bbox[0]) * (b.bbox[3] - b.bbox[1]) - (a.bbox[2] - a.bbox[0]) * (a.bbox[3] - a.bbox[1]))[Math.min(2, single.length - 1)] || null;
}
function pageArea(pc) { const b = pc.page.getMediaBox(); return b.width * b.height; }

function pickText(pc, pageText) {
  const runs = pc.objects.filter((o) => o.kind === 'text' && o.info && !o.info.problem && /^[A-Za-z][A-Za-z ]{3,}$/.test(o.text.trim()));
  for (const r of runs) {
    const want = [...r.text].reverse().join('');
    if (squash(want) === squash(r.text) || squash(want).length < 4) continue;
    if (pageText.split(squash(r.text)).length !== 2) continue;          // the words occur once on the page
    if (pageText.includes(squash(want))) continue;
    const enc = r.info.encode(want);
    if (enc.missing.length) continue;
    return { run: r, want };
  }
  return null;
}

// ---- one file ----------------------------------------------------------------------------------------
async function spikeFile(entry, dpiFor) {
  const r = { name: entry.name, producer: entry.producer, pages: 0, contents: 0, ops: 0, roundTrip: true, mismatches: [], kinds: {}, problems: [], save: null, edit: null };
  const bytes = new Uint8Array(fs.readFileSync(entry.file));
  const doc = await PDFLib.PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
  r.blocker = bc.editBlocker(PDFLib, doc);
  r.pages = doc.getPageCount();
  if (entry.blocked) { r.expectBlocked = entry.blocked; r.refusedAsExpected = r.blocker === entry.blocked; r.roundTrip = null; return r; }
  const pcs = [];
  for (let p = 0; p < r.pages; p++) {
    const pc = bc.readPage(PDFLib, doc, p);
    pcs.push(pc);
    for (const c of pc.contents.values()) {
      r.contents++;
      r.ops += c.ops.length;
      const back = lex.writeOps(c.bytes, c.ops);
      if (!eq(back, c.bytes)) { r.roundTrip = false; r.mismatches.push({ page: p, where: c.key }); }
      if (c.key === 'page') for (const sg of c.segments) {
        const orig = bc.streamBytes(PDFLib, sg.raw);
        if (!eq(back.subarray(sg.s, sg.e), orig)) { r.roundTrip = false; r.mismatches.push({ page: p, where: 'stream ' + (sg.ref ? sg.ref.toString() : 'direct') }); }
      }
    }
    for (const o of pc.objects) r.kinds[o.kind] = (r.kinds[o.kind] || 0) + 1;
    for (const pr of pc.problems) if (r.problems.length < 20) r.problems.push({ page: p, ...pr });
  }

  // (2) save with no edits: the raw (still encoded) content streams must come back unchanged
  {
    const saved = await doc.save({ useObjectStreams: false });
    const back = await PDFLib.PDFDocument.load(saved, { ignoreEncryption: true, updateMetadata: false });
    let same = 0, diff = 0;
    for (let p = 0; p < r.pages; p++) {
      const a = bc.readPage(PDFLib, doc, p), b = bc.readPage(PDFLib, back, p);
      for (const [k, ca] of a.contents) {
        const cb = b.contents.get(k === 'page' ? 'page' : k);
        const rawA = k === 'page' ? ca.segments.map((s) => s.raw.contents) : [ca.raw.contents];
        const rawB = cb ? (k === 'page' ? cb.segments.map((s) => s.raw.contents) : [cb.raw.contents]) : [];
        if (rawA.length === rawB.length && rawA.every((x, i) => eq(x, rawB[i]))) same++; else diff++;
      }
    }
    r.save = { same, diff };
  }

  if (r.blocker) return r;

  // (3) one path moved and one text run rewritten, on the first page that has both (else what there is)
  let target = null;
  for (const pc of pcs) {
    const pt = await pdfjsRead(bytes, pc.index, 36).then((x) => squash(x.text));
    const path_ = pickPath(pc);
    const text = pickText(pc, pt);
    if (path_ && text) { target = { pc, path_, text }; break; }
    if (!target && (path_ || text)) target = { pc, path_, text };
  }
  if (!target) { r.edit = { skipped: 'nothing editable found' }; return r; }
  const { pc, path_, text } = target;
  const T = bc.translate(36, -24);
  const edits = [];
  const e = { page: pc.index, path: null, text: null };
  if (path_) {
    const t = bc.transformEdits(pc, path_, T);
    if (t.refused) e.path = { refused: t.refused }; else { edits.push(...t.edits); e.path = { where: path_.where, paint: path_.paint, bbox: path_.bbox.map((v) => +v.toFixed(2)), ops: path_.last - path_.first }; }
  }
  if (text) {
    const t = bc.textEdits(pc, text.run, text.want);
    if (t.refused || t.missing.length) e.text = { refused: t.refused || 'missing ' + t.missing.join('') };
    else { edits.push(...t.edits); e.text = { from: text.run.text, to: text.want, font: text.run.info.base, subtype: text.run.info.subtype, where: text.run.where, bbox: text.run.bbox.map((v) => +v.toFixed(2)) }; }
  }
  const applied = bc.applyEdits(PDFLib, doc, pc, edits);
  if (applied.refused) { e.refused = applied.refused; r.edit = e; return r; }
  const edited = await doc.save({ useObjectStreams: false });
  fs.mkdirSync(OUT, { recursive: true });
  const outFile = path.join(OUT, entry.name + '-edited.pdf');
  fs.writeFileSync(outFile, edited);
  e.file = outFile;

  // read back
  const tmp = fs.mkdtempSync(path.join(OUT, '.read-'));
  try {
    const dpi = dpiFor(pc.page);
    const origFile = path.join(tmp, 'orig.pdf');
    fs.writeFileSync(origFile, bytes);
    const J0 = await pdfjsRead(bytes, pc.index, dpi), J1 = await pdfjsRead(edited, pc.index, dpi);
    const P0 = popplerRead(origFile, pc.index, dpi, tmp), P1 = popplerRead(outFile, pc.index, dpi, tmp);
    const G0 = gsRead(origFile, pc.index, dpi, tmp), G1 = gsRead(outFile, pc.index, dpi, tmp);
    const Y0 = pypdfRead(origFile, pc.index), Y1 = pypdfRead(outFile, pc.index);
    const vp = J0.vp;
    const masks = { pdfjs: changedBlocks(J0, J1, vp, dpi), poppler: changedBlocks(P0, P1, vp, dpi), ghostscript: changedBlocks(G0, G1, vp, dpi) };
    const expect = [];
    if (e.path && !e.path.refused) { const lw = Math.max(1, (path_.lw || 1) * Math.sqrt(Math.abs(path_.ctm[0] * path_.ctm[3] - path_.ctm[1] * path_.ctm[2]))) * 2 + 4; expect.push(pad(path_.bbox, lw)); expect.push(pad([path_.bbox[0] + 36, path_.bbox[1] - 24, path_.bbox[2] + 36, path_.bbox[3] - 24], lw)); }
    if (e.text && !e.text.refused) expect.push(pad(text.run.bbox, 6));
    e.readers = {};
    for (const [nm, m] of Object.entries(masks)) {
      if (!m) { e.readers[nm] = { size: 'differs' }; continue; }
      const out = [...m].filter((k) => !inBoxes(k, expect));
      const ob = out.length ? out.map((k) => k.split(',').map((v) => +v * 2)).reduce((b, [x, y]) => [Math.min(b[0], x), Math.min(b[1], y), Math.max(b[2], x + 2), Math.max(b[3], y + 2)], [Infinity, Infinity, -Infinity, -Infinity]) : null;
      e.readers[nm] = { changed: m.size, outside: out.length, ...(ob ? { outsideBox: ob } : {}) };
    }
    const ink = { pdfjs: [inkBlocks(J0, vp), inkBlocks(J1, vp)], poppler: [inkBlocks(P0, vp), inkBlocks(P1, vp)], ghostscript: [inkBlocks(G0, vp), inkBlocks(G1, vp)] };
    const pb = [vp.viewBox[0], vp.viewBox[1], vp.viewBox[2], vp.viewBox[3]];
    e.newDisagreement = {
      'pdfjs~poppler': newDisagreement(ink.pdfjs[0], ink.pdfjs[1], ink.poppler[0], ink.poppler[1], null, pb),
      'pdfjs~ghostscript': newDisagreement(ink.pdfjs[0], ink.pdfjs[1], ink.ghostscript[0], ink.ghostscript[1], null, pb),
      'poppler~ghostscript': newDisagreement(ink.poppler[0], ink.poppler[1], ink.ghostscript[0], ink.ghostscript[1], null, pb),
    };
    e.agree = {
      'pdfjs~poppler': +looseIou(masks.pdfjs, masks.poppler).toFixed(3),
      'pdfjs~ghostscript': +looseIou(masks.pdfjs, masks.ghostscript).toFixed(3),
      'poppler~ghostscript': +looseIou(masks.poppler, masks.ghostscript).toFixed(3),
    };
    void iou;
    // pypdf: the moved path's new coordinates, found by pypdf's own parser
    if (e.path && !e.path.refused && Y1 && !Y1.error) {
      {
        const c = pc.contents.get(path_.where);
        const Yp = path_.where === 'page' ? Y1 : pypdfRead(outFile, pc.index, path_.where.split(' ')[0]);
        const want = [];
        const U = bc.mul(bc.mul(path_.ctm, T), bc.inv(path_.ctm));
        for (let i = path_.first; i < path_.last; i++) {
          const o = c.ops[i];
          if (o.op === 'h' || !'mlcvyre'.includes(o.op)) continue;
          const v = o.args.map((t) => t.v);
          if (o.op === 're') { const [x, y] = bc.apply(U, v[0], v[1]); want.push(['re', [x, y, v[2], v[3]]]); }
          else { const nv = []; for (let k = 0; k + 1 < v.length; k += 2) nv.push(...bc.apply(U, v[k], v[k + 1])); want.push([o.op, nv]); }
        }
        const close = (a, b) => a[0] === b[0] && a[1].length === b[1].length && a[1].every((x, i) => Math.abs(x - b[1][i]) < 2e-3);
        let found = false;
        for (let s = 0; s + want.length <= Yp.paths.length && !found; s++) found = want.every((w, k) => close(w, Yp.paths[s + k]));
        e.pypdfPath = (found ? 'found at the new place' : 'NOT FOUND') + (path_.where === 'page' ? '' : ' (in form XObject ' + path_.where + ')');
      }
    } else if (Y1 && Y1.error) e.pypdfPath = 'pypdf error: ' + Y1.error;
    if (e.text && !e.text.refused) {
      const want = squash(text.want);
      e.textReaders = {
        pdfjs: squash(J1.text).includes(want),
        poppler: squash(P1.text).includes(want),
        pypdf: Y1 && !Y1.error ? squash(Y1.text).includes(want) : null,
        before: { pdfjs: squash(J0.text).includes(want), poppler: squash(P0.text).includes(want), pypdf: Y0 ? squash(Y0.text).includes(want) : null },
      };
    }
  } finally { fs.rmSync(tmp, { recursive: true, force: true }); }
  r.edit = e;
  return r;
}

/** Extra checks on the hand-written file: refusals and a scale. */
async function awkwardExtras(entry) {
  const out = {};
  const doc = await PDFLib.PDFDocument.load(new Uint8Array(fs.readFileSync(entry.file)));
  const pc = bc.readPage(PDFLib, doc, 0);
  const paths = pc.objects.filter((o) => o.kind === 'path');
  const cross = paths.find((o) => o.where === 'page' && pc.contents.get('page').segments.every((g) => !(pc.contents.get('page').ops[o.first].s >= g.s && pc.contents.get('page').ops[o.last].e <= g.e)));
  out.crossStream = cross ? bc.applyEdits(PDFLib, doc, pc, bc.transformEdits(pc, cross, bc.translate(5, 5)).edits).refused : 'not found';
  const inShared = paths.find((o) => o.where !== 'page');
  out.sharedForm = inShared ? bc.applyEdits(PDFLib, doc, pc, bc.transformEdits(pc, inShared, bc.translate(5, 5)).edits).refused : 'not found';
  const clip = pc.objects.find((o) => o.kind === 'clip');
  out.clip = clip ? bc.transformEdits(pc, { ...clip, kind: 'path' }, bc.translate(5, 5)).refused : 'not found';
  out.inline = pc.objects.filter((o) => o.kind === 'image' && o.inline).length;
  out.forms = pc.objects.filter((o) => o.kind === 'form').length;
  out.shading = pc.objects.filter((o) => o.kind === 'shading').length;
  const runs = pc.objects.filter((o) => o.kind === 'text').map((o) => o.text);
  out.runs = runs;
  return out;
}

export async function runSpike({ only = null, log = console.log } = {}) {
  const corpus = (await makeCorpus()).filter((c) => !only || only.includes(c.name));
  const results = [];
  for (const entry of corpus) {
    const t0 = Date.now();
    const r = await spikeFile(entry, (page) => (Math.max(page.getWidth(), page.getHeight()) > 2000 ? 50 : 100));
    if (entry.name === 'awkward') r.extras = await awkwardExtras(entry);
    r.ms = Date.now() - t0;
    results.push(r);
    if (r.expectBlocked) { log(`${entry.name.padEnd(12)} refuses: ${r.blocker} (expected ${r.expectBlocked})`); continue; }
    log(`${entry.name.padEnd(12)} pages ${r.pages} contents ${r.contents} ops ${r.ops} round trip ${r.roundTrip ? 'identical' : 'DIFFERS'}; no-edit save ${r.save.same}/${r.save.same + r.save.diff} streams unchanged; ` +
      (r.edit ? JSON.stringify({ path: r.edit.path && (r.edit.path.refused || r.edit.path.paint), text: r.edit.text && (r.edit.text.refused || r.edit.text.to), readers: r.edit.readers, agree: r.edit.agree, newDisagreement: r.edit.newDisagreement, pypdf: r.edit.pypdfPath, text2: r.edit.textReaders }) : 'blocked: ' + r.blocker));
  }
  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(results, null, 1));
  return results;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const i = process.argv.indexOf('--only');
  const only = i > 0 ? process.argv[i + 1].split(',') : null;
  await runSpike({ only });
  console.log('report: ' + path.join(OUT, 'report.json'));
}
