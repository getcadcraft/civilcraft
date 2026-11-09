#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * The batch-links fixtures (0.9 SU.1085), made ONCE into testfiles/generated/markup/ (skipped when present; --force remakes):
 *   link-set.pdf           five 24 × 18 in sheets with a text layer, title blocks in the right-hand strip:
 *                          A-101 FLOOR PLAN (callouts), A-201 EXTERIOR ELEVATIONS (callouts), A-301 BUILDING SECTIONS (views 1, 2),
 *                          A-401 ENLARGED PLANS (its number drawn as lines and left out of its view titles: no text, the person types it), A-501 WALL SECTIONS
 *                          AND DETAILS (views 1–6 in a grid, each a bubble "n" over "A-501" with a title and scale beside it)
 *   link-set-addendum.pdf  one sheet A-601 DOOR DETAILS (views 1, 2): opened later, the 2/A-601 callouts that missed now link
 * Callouts on A-101 / A-201: "SEE 3/A-501" (inline), a bubble "5" over "A-501" (stacked), "1/A-301", "DETAIL 2 ON A-501",
 * "4/A-501", "2/A-401" (needs the typed number), "7/A-501" (no view 7: a view miss), "2/A-601" (no such sheet yet: a miss),
 * and codes that must NOT be taken for sheets: "R-19", "W12X26", "2X4", the notes "1 ALL DIMENSIONS …".
 *   node tools/markupcraft-test/make-link-set.mjs [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const OUTDIR = path.resolve(REPO, '../testfiles/generated/markup');
const force = process.argv.includes('--force');
const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));
const { PDFDocument, StandardFonts, rgb } = PDFLib;
const W = 1728, H = 1296;
const black = rgb(0, 0, 0), grey = rgb(0.45, 0.45, 0.45);

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

async function sheetSet(sheets, file) {
  const doc = await PDFDocument.create();
  doc.setTitle(path.basename(file, '.pdf')); doc.setProducer('make-link-set.mjs (CadCraft test fixture)'); doc.setCreationDate(new Date('2026-11-02T00:00:00Z')); doc.setModificationDate(new Date('2026-11-02T00:00:00Z'));
  const f = await doc.embedFont(StandardFonts.Helvetica), fb = await doc.embedFont(StandardFonts.HelveticaBold);
  for (const sh of sheets) {
    const p = doc.addPage([W, H]);
    const T = (s, x, y, size, bold = false, color = black) => p.drawText(s, { x, y, size, font: bold ? fb : f, color });
    p.drawRectangle({ x: 36, y: 36, width: W - 72, height: H - 72, borderColor: black, borderWidth: 2 });
    // title block: the right-hand strip
    const tx = 1520;
    p.drawLine({ start: { x: tx, y: 36 }, end: { x: tx, y: H - 36 }, thickness: 1.5 });
    T('DDG CLINIC RENOVATION', tx + 12, H - 80, 11, true);
    T('1200 EXAMPLE AVE', tx + 12, H - 96, 8);
    T('NO.', tx + 12, H - 140, 7); T('REVISION', tx + 40, H - 140, 7);
    T('1', tx + 12, H - 154, 8); T('ISSUED FOR PERMIT', tx + 40, H - 154, 8);
    T('2', tx + 12, H - 168, 8); T('ADDENDUM ONE', tx + 40, H - 168, 8);
    T('SCALE: AS NOTED', tx + 12, 260, 7);
    T('DATE: 11/02/2026', tx + 12, 248, 7);
    p.drawLine({ start: { x: tx, y: 236 }, end: { x: W - 36, y: 236 }, thickness: 1 });
    T('SHEET TITLE', tx + 12, 222, 7);
    sh.title.forEach((line, i) => T(line, tx + 12, 200 - i * 18, 14, true));
    p.drawLine({ start: { x: tx, y: 140 }, end: { x: W - 36, y: 140 }, thickness: 1 });
    T('SHEET NO.', tx + 12, 126, 7);
    if (sh.numberAsLines) drawNumberAsLines(p, sh.no, tx + 16, 64, 40); else T(sh.no, tx + 16, 64, 40, true);
    // some drawing
    const r = rng(sh.seed);
    for (let i = 0; i < 160; i++) { const x = 80 + r() * 1380, y = 80 + r() * 1100, d = 20 + r() * 120; const h = r() < 0.5; p.drawLine({ start: { x, y }, end: { x: h ? x + d : x, y: h ? y : y + d }, thickness: 0.6, color: grey }); }
    for (const c of sh.callouts || []) drawCallout(p, T, c);
    for (const v of sh.views || []) drawView(p, T, sh.numberAsLines ? '' : sh.no, v);
    for (const n of sh.notes || []) T(n.s, n.x, n.y, n.size || 9);
  }
  fs.writeFileSync(file, await doc.save({ useObjectStreams: false }));
}

function drawCallout(p, T, c) {
  if (c.kind === 'bubble') {   // a section/detail bubble: the detail number over a line over the sheet number
    p.drawCircle({ x: c.x, y: c.y, size: 22, borderColor: black, borderWidth: 1.2 });
    p.drawLine({ start: { x: c.x - 22, y: c.y }, end: { x: c.x + 22, y: c.y }, thickness: 1 });
    T(c.detail, c.x - 4, c.y + 6, 12, true);
    T(c.no, c.x - 14, c.y - 13, 8);
    p.drawLine({ start: { x: c.x + 22, y: c.y }, end: { x: c.x + 90, y: c.y + 40 }, thickness: 0.8 });
  } else T(c.s, c.x, c.y, c.size || 9);
}

function drawView(p, T, no, v) {   // a view title: bubble "n" over the sheet's own number, title + scale beside it
  const { x, y } = v;
  p.drawCircle({ x, y, size: 20, borderColor: black, borderWidth: 1.2 });
  p.drawLine({ start: { x: x - 20, y }, end: { x: x + 260, y }, thickness: 1 });
  T(v.id, x - 5, y + 5, 14, true);
  if (no) T(no, x - 13, y - 12, 7);
  T(v.title, x + 30, y + 5, 12, true);
  T(v.scale || 'SCALE: 1 1/2" = 1\'-0"', x + 30, y - 12, 8);
  // the view itself above its title
  p.drawRectangle({ x: x + 10, y: y + 40, width: 300, height: 240, borderColor: grey, borderWidth: 0.8 });
  p.drawLine({ start: { x: x + 10, y: y + 40 }, end: { x: x + 310, y: y + 280 }, thickness: 0.6, color: grey });
}

function drawNumberAsLines(p, s, x, y, h) {   // a plotted title block whose number is outlines, not text
  for (const ch of s) {
    const w = h * 0.55;
    p.drawRectangle({ x, y, width: w, height: h, borderColor: black, borderWidth: 2.5 });
    x += w + 8;
  }
}

const NOTES = [
  { s: 'GENERAL NOTES', x: 90, y: 330, size: 10 },
  { s: '1', x: 90, y: 312 }, { s: 'ALL DIMENSIONS ARE TO FACE OF STUD UNLESS NOTED.', x: 104, y: 312 },
  { s: '2', x: 90, y: 298 }, { s: 'PROVIDE R-19 INSULATION AT EXTERIOR WALLS.', x: 104, y: 298 },
  { s: '3', x: 90, y: 284 }, { s: 'W12X26 BEAM OVER, 2X4 BLOCKING AT 16" O.C.', x: 104, y: 284 },
];

const SET = [
  { no: 'A-101', title: ['FLOOR PLAN'], seed: 1, notes: NOTES, callouts: [
    { s: 'SEE 3/A-501', x: 400, y: 900 },
    { kind: 'bubble', detail: '5', no: 'A-501', x: 700, y: 700 },
    { s: 'SECTION 1/A-301', x: 1000, y: 1000 },
    { s: 'DETAIL 2 ON A-501', x: 300, y: 600 },
    { s: '2/A-401', x: 1200, y: 500 },
    { s: '7/A-501', x: 900, y: 420 },
    { s: '2/A-601', x: 500, y: 450 },
  ] },
  { no: 'A-201', title: ['EXTERIOR', 'ELEVATIONS'], seed: 2, callouts: [
    { s: '4/A-501', x: 600, y: 800 },
    { kind: 'bubble', detail: '2', no: 'A-301', x: 1100, y: 600 },
    { s: 'REFER TO A-101 FOR DOOR TAGS', x: 300, y: 400 },
    { s: '2/A-601', x: 800, y: 300 },
  ] },
  { no: 'A-301', title: ['BUILDING SECTIONS'], seed: 3, views: [
    { id: '1', title: 'BUILDING SECTION - NORTH', x: 120, y: 760, scale: 'SCALE: 1/4" = 1\'-0"' },
    { id: '2', title: 'BUILDING SECTION - EAST', x: 120, y: 200, scale: 'SCALE: 1/4" = 1\'-0"' },
  ] },
  { no: 'A-401', title: ['ENLARGED PLANS'], seed: 4, numberAsLines: true, views: [
    { id: '1', title: 'ENLARGED TOILET PLAN', x: 120, y: 760 },
    { id: '2', title: 'ENLARGED STAIR PLAN', x: 800, y: 760 },
  ] },
  { no: 'A-501', title: ['WALL SECTIONS', 'AND DETAILS'], seed: 5, views: [
    { id: '1', title: 'WALL SECTION AT ENTRY', x: 100, y: 860 }, { id: '2', title: 'PARAPET DETAIL', x: 600, y: 860 }, { id: '3', title: 'WINDOW HEAD DETAIL', x: 1100, y: 860 },
    { id: '4', title: 'WINDOW SILL DETAIL', x: 100, y: 420 }, { id: '5', title: 'FOUNDATION DETAIL', x: 600, y: 420 }, { id: '6', title: 'ROOF EDGE DETAIL', x: 1100, y: 420 },
  ] },
];
const ADDENDUM = [
  { no: 'A-601', title: ['DOOR DETAILS'], seed: 6, views: [
    { id: '1', title: 'DOOR HEAD DETAIL', x: 100, y: 860 }, { id: '2', title: 'DOOR JAMB DETAIL', x: 700, y: 860 },
  ] },
];

fs.mkdirSync(OUTDIR, { recursive: true });
for (const [name, sheets] of [['link-set.pdf', SET], ['link-set-addendum.pdf', ADDENDUM]]) {
  const file = path.join(OUTDIR, name);
  if (fs.existsSync(file) && !force) { console.log('kept ' + file); continue; }
  await sheetSet(sheets, file);
  console.log('made ' + file + ' (' + fs.statSync(file).size + ' bytes)');
}
