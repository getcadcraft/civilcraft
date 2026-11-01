#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-count-everything-showcase_PART_2.mjs — the Count everything demo set (0.8 EG.67, session takeoff_PART_2; rule 37). Made once, refuses to overwrite.
 *   node tools/takeoffcraft-test/make-count-everything-showcase_PART_2.mjs [--check]
 * fixtures/showcase/takeoffcraft-count-everything.pdf: a made-up 12-sheet electrical set (CC0), 24 × 36 in sheets. E-001 is the symbol legend (six
 * symbols, each with its name as real PDF text, and a general-notes box with no symbol); E-101 … E-111 are floor plans (rooms, walls, a door swing or two)
 * with the legend's symbols drawn along the walls, a different mix on each sheet. The counts it should give are written beside it in the .json file.
 */
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'fixtures/showcase/takeoffcraft-count-everything.pdf'), META = OUT.replace(/\.pdf$/, '.counts.json');
if (fs.existsSync(OUT) && !process.argv.includes('--check')) { console.log('exists: ' + OUT + ' (refusing to overwrite; delete it to make it again)'); process.exit(0); }
const L = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const doc = await L.PDFDocument.create();
const font = await doc.embedFont(L.StandardFonts.Helvetica), bold = await doc.embedFont(L.StandardFonts.HelveticaBold);
const black = L.rgb(0, 0, 0), grey = L.rgb(0.45, 0.45, 0.45);
const W = 2592, H = 1728;                                   // 36 × 24 in in points
const NAMES = ['Duplex receptacle', 'Quad receptacle', 'Ceiling light', 'Wall switch', 'Exit sign', 'Smoke detector'];
const ln = (pg, a, b, c, d, th = 1.4, color = black) => pg.drawLine({ start: { x: a, y: b }, end: { x: c, y: d }, thickness: th, color });
const SYM = [
  (pg, x, y) => { pg.drawCircle({ x, y, size: 11, borderWidth: 1.4, borderColor: black }); ln(pg, x - 5, y, x + 5, y); },
  (pg, x, y) => { pg.drawCircle({ x, y, size: 11, borderWidth: 1.4, borderColor: black }); ln(pg, x - 5, y - 3, x + 5, y - 3); ln(pg, x - 5, y + 3, x + 5, y + 3); },
  (pg, x, y) => { pg.drawCircle({ x, y, size: 11, borderWidth: 1.4, borderColor: black }); ln(pg, x - 8, y - 8, x + 8, y + 8); ln(pg, x - 8, y + 8, x + 8, y - 8); },
  (pg, x, y) => { pg.drawRectangle({ x: x - 8, y: y - 7, width: 16, height: 14, borderWidth: 1.4, borderColor: black }); ln(pg, x, y + 7, x, y + 16); ln(pg, x - 4, y, x + 4, y); },
  (pg, x, y) => { pg.drawRectangle({ x: x - 12, y: y - 8, width: 24, height: 16, borderWidth: 1.4, borderColor: black }); ln(pg, x, y + 5, x - 6, y - 5); ln(pg, x, y + 5, x + 6, y - 5); ln(pg, x - 6, y - 5, x + 6, y - 5); },
  (pg, x, y) => { pg.drawCircle({ x, y, size: 10, borderWidth: 1.4, borderColor: black }); pg.drawCircle({ x, y, size: 4, borderWidth: 1.4, borderColor: black }); },
];
let seed = 2026;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
const counts = [];
// E-001: the legend
{
  const pg = doc.addPage([W, H]);
  pg.drawRectangle({ x: 40, y: 40, width: W - 80, height: H - 80, borderWidth: 2, borderColor: black });
  pg.drawText('E-001  ELECTRICAL SYMBOLS AND GENERAL NOTES', { x: 80, y: H - 110, size: 28, font: bold });
  pg.drawRectangle({ x: 80, y: H - 640, width: 560, height: 480, borderWidth: 1.4, borderColor: black });
  pg.drawText('SYMBOL LEGEND', { x: 100, y: H - 200, size: 20, font: bold });
  NAMES.forEach((n, i) => { SYM[i](pg, 130, H - 270 - i * 60); pg.drawText(n, { x: 180, y: H - 277 - i * 60, size: 18, font }); });
  pg.drawRectangle({ x: 700, y: H - 640, width: 900, height: 480, borderWidth: 1.4, borderColor: black });
  pg.drawText('GENERAL NOTES', { x: 720, y: H - 200, size: 20, font: bold });
  ['1. All work to the current electrical code.', '2. Receptacles 18 in above finished floor unless noted.', '3. Verify exit sign locations with the fire marshal.', '4. This is a made-up drawing set for a demonstration.'].forEach((t, i) => pg.drawText(t, { x: 720, y: H - 250 - i * 40, size: 16, font }));
  counts.push({ sheet: 'E-001', ...Object.fromEntries(NAMES.map((n) => [n, 0])) });
}
// E-101 … E-111: floor plans
for (let s = 1; s <= 11; s++) {
  const pg = doc.addPage([W, H]);
  pg.drawRectangle({ x: 40, y: 40, width: W - 80, height: H - 80, borderWidth: 2, borderColor: black });
  pg.drawText('E-' + (100 + s) + '  LEVEL ' + (1 + (s % 3)) + ' ELECTRICAL PLAN, AREA ' + String.fromCharCode(64 + s), { x: 80, y: H - 110, size: 28, font: bold });
  // rooms: a grid of walls with door gaps
  const cols = 4, rows = 3, rw = (W - 400) / cols, rh = (H - 500) / rows, x0 = 200, y0 = 200;
  for (let c = 0; c <= cols; c++) ln(pg, x0 + c * rw, y0, x0 + c * rw, y0 + rows * rh, 3, grey);
  for (let r = 0; r <= rows; r++) ln(pg, x0, y0 + r * rh, x0 + cols * rw, y0 + r * rh, 3, grey);
  const row = { sheet: 'E-' + (100 + s), ...Object.fromEntries(NAMES.map((n) => [n, 0])) };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const cx = x0 + c * rw, cy = y0 + r * rh, put = (k, x, y) => { SYM[k](pg, x, y); row[NAMES[k]]++; };
    const n = 2 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) put(i % 2 ? 1 : 0, cx + 60 + ((i * 97 + s * 31) % (rw - 120)), cy + 40 + (i % 2) * (rh - 80));        // receptacles along the walls
    put(2, cx + rw / 2, cy + rh / 2);                                                                                              // a light in the middle
    if (rnd() < 0.7) put(3, cx + 50, cy + rh / 2 - 30);                                                                            // a switch by the door
    if (rnd() < 0.25) put(4, cx + rw - 60, cy + rh - 40);                                                                          // an exit sign
    if (rnd() < 0.5) put(5, cx + rw / 2 + 80, cy + rh / 2 + 60);                                                                   // a smoke detector
  }
  counts.push(row);
}
fs.writeFileSync(OUT, await doc.save());
const totals = Object.fromEntries(NAMES.map((n) => [n, counts.reduce((a, r) => a + r[n], 0)]));
fs.writeFileSync(META, JSON.stringify({ note: 'What Count everything should find on takeoffcraft-count-everything.pdf (the legend on E-001 is not counted). Made once by tools/takeoffcraft-test/make-count-everything-showcase_PART_2.mjs; CC0.', legendBox: 'E-001: the box round SYMBOL LEGEND, lower left', totals, bySheet: counts }, null, 1) + '\n');
console.log('wrote ' + OUT + ' (' + fs.statSync(OUT).size + ' bytes); totals ' + JSON.stringify(totals));
