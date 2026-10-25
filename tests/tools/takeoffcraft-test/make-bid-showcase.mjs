#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-bid-showcase.mjs — the saved takeoff for the bidding screenshots and video (0.7 LC.13, session `bidding`): fixtures/showcase/
 * takeoffcraft-kitchen-bid.takeoff.json. A small kitchen job priced by hand, on the public sheet fixtures/showcase/kitchen-plan-sheet.pdf:
 * three CSI divisions (03 concrete, 06 carpentry, 09 finishes) and one item with no number, so Export › Bid packages and leveling… has four
 * packages. Made ONCE: it refuses to overwrite (pass --force). Open it in /lab/takeoffcraft, then File › Open plans and choose the PDF (the sheet
 * is matched by its hash).
 *   node tools/takeoffcraft-test/make-bid-showcase.mjs [--force]
 *
 * Prices (by hand): 09 = gypsum board 410 SF × ($0.55 + $0.90) $594.50 + paint 410 SF × ($0.20 + $0.55) $307.50 + base 96 LF × ($1.10 + $1.40)
 * $240.00 = $1,142.00; 06 = cabinet install 14 EA × $55 = $770.00 (labor) + shelving 32 LF × $8.00 = $256.00 = $1,026.00; 03 = patch slab 1 LS $450.00;
 * mobilization (no number) 1 LS $850.00. Total $3,468.00.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'fixtures/showcase/takeoffcraft-kitchen-bid.takeoff.json');
if (fs.existsSync(OUT) && !process.argv.includes('--force')) { console.log('exists: ' + path.relative(ROOT, OUT) + ' (made once; --force to rebuild)'); process.exit(0); }
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const M = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev/model.js')).href);
const pdfPath = path.join(ROOT, 'fixtures/showcase/kitchen-plan-sheet.pdf');
const bytes = fs.readFileSync(pdfPath);
const hash = crypto.createHash('sha256').update(bytes).digest('hex');
const doc = await PDFLib.PDFDocument.load(bytes);
const { width: W, height: H } = doc.getPage(0).getSize();

const t = new M.Takeoff();
t.state.name = 'Kitchen renovation';
t.addFile({ hash, name: 'kitchen-plan-sheet.pdf', size: bytes.length, pages: doc.getPageCount() });
const sheet = M.sheetKey(hash, 0);
t.setScale(sheet, { method: 'preset', preset: 'a1/4', ftPerUnit: 4 / 72, label: '1/4" = 1\'-0"', cal: null });
const rate = (dollars) => Math.round(dollars * 10000);
const px = (ft) => ft * 72 / 4;                                    // feet at 1/4" = 1'-0" → points
const x0 = W * 0.12, y0 = H * 0.2;
const board = t.addItem({ name: 'Gypsum board', type: 'area', mat: rate(0.55), lab: rate(0.90), csi: '09 21 16', unit: 'SF' });
const paint = t.addItem({ name: 'Paint walls', type: 'area', mat: rate(0.20), lab: rate(0.55), csi: '09 91 23', unit: 'SF' });
const base = t.addItem({ name: 'Rubber base', type: 'linear', mat: rate(1.10), lab: rate(1.40), csi: '09 65 13', unit: 'LF' });
const cabinets = t.addItem({ name: 'Install base cabinets', type: 'count', mat: 0, lab: rate(55), csi: '06 41 00', unit: 'EA' });
const shelving = t.addItem({ name: 'Wall shelving', type: 'linear', mat: rate(8), lab: 0, csi: '06 40 00', unit: 'LF' });
t.addItem({ name: 'Patch slab', type: 'fixed', unit: 'LS', qty: 1, mat: rate(450), csi: '03 30 00' });
t.addItem({ name: 'Mobilization', type: 'fixed', unit: 'LS', qty: 1, mat: rate(850) });
// 410 SF of board and paint: two rectangles 20.5' × 10' and 20.5' × 10' … drawn as one 41' × 10' strip split in two (205 SF each)
const rect = (x, y, wFt, hFt) => [{ x, y }, { x: x + px(wFt), y }, { x: x + px(wFt), y: y + px(hFt) }, { x, y: y + px(hFt) }];
t.addMark({ item: board, sheet, pts: rect(x0, y0, 20.5, 10) });
t.addMark({ item: board, sheet, pts: rect(x0, y0 + px(12), 20.5, 10) });
t.addMark({ item: paint, sheet, pts: rect(x0 + px(22), y0, 20.5, 10) });
t.addMark({ item: paint, sheet, pts: rect(x0 + px(22), y0 + px(12), 20.5, 10) });
t.addMark({ item: base, sheet, pts: [{ x: x0, y: y0 + px(25) }, { x: x0 + px(48), y: y0 + px(25) }] });
t.addMark({ item: base, sheet, pts: [{ x: x0, y: y0 + px(27) }, { x: x0 + px(48), y: y0 + px(27) }] });
for (let i = 0; i < 14; i++) t.addMark({ item: cabinets, sheet, pts: [{ x: x0 + px(2 + i * 3), y: y0 + px(30) }] });
t.addMark({ item: shelving, sheet, pts: [{ x: x0, y: y0 + px(33) }, { x: x0 + px(32), y: y0 + px(33) }] });

const est = M.baseEstimate(t.state);
const total = est.total;
if (total !== 346800) { console.error('the by-hand total is $3,468.00, the model says ' + total / 100); process.exit(1); }
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(t.toJSON('2026-10-23T12:00:00.000Z'), null, 1) + '\n');
console.log('wrote ' + path.relative(ROOT, OUT) + ' (total $' + (total / 100).toFixed(2) + ')');
