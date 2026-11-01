#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Builds fixtures/showcase/markupcraft-markups-that-act.pdf ONCE (0.8 EG.64/66; memory showcase-files): the sample house plan, revision B, with
 * markups that are tasks: one for an assistant linked to an area that revision C changes, one for a person linked to an area C leaves alone,
 * an overdue one, a decision and a note. Open it, then open fixtures/showcase/cadcraft-sample-house-rev-C.pdf and choose Tasks > Check now.
 *   node tools/markupcraft-test/make-act-showcase.mjs        (refuses to overwrite)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url)), ROOT = path.resolve(HERE, '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/markupcraft/dev'), TOOLS = path.join(HERE, 'node_modules');
const OUT = path.join(ROOT, 'fixtures/showcase/markupcraft-markups-that-act.pdf');
if (fs.existsSync(OUT)) { console.log('exists, not rebuilt: ' + path.relative(ROOT, OUT)); process.exit(0); }
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const pdfjs = await import(pathToFileURL(path.join(TOOLS, 'pdfjs-dist/legacy/build/pdf.mjs')).href);
const PDFLib = await import(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js')).href);
const model = await imp('model.js'), T = await imp('tasks.js'), V = await imp('voice.js'), W = await imp('pdf-write.js'), R = await imp('pdf-read.js'), VD = await imp('vecdiff.js');
const env = { pdfjs, pdfLib: PDFLib, docOptions: { standardFontDataUrl: path.join(TOOLS, 'pdfjs-dist/standard_fonts/') } };
const B = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/showcase/cadcraft-sample-house-rev-B.pdf')));
const C = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/showcase/cadcraft-sample-house-rev-C.pdf')));
const quiet = async (fn) => { const w = console.warn, l = console.log; console.warn = () => {}; console.log = (...a) => { if (!String(a[0]).startsWith('Warning')) l(...a); }; try { return await fn(); } finally { console.warn = w; console.log = l; } };
const segsOf = async (bytes) => { const doc = await quiet(() => pdfjs.getDocument({ data: bytes.slice(), standardFontDataUrl: env.docOptions.standardFontDataUrl }).promise); const p = await doc.getPage(1); return VD.pageSegments(await p.getOperatorList(), pdfjs.OPS); };
const [sb, sc] = [await segsOf(B), await segsOf(C)];
const d = VD.diffSegments(sb, sc, { tol: 1.5, step: 2 });
const boxes = VD.clusters([...d.removed, ...d.added], { gap: 18, minLen: 6 });
if (!boxes.length) throw new Error('revision C has no change against B');
const big = boxes.map((b) => ({ b, n: (b[2] - b[0]) * (b[3] - b[1]) })).sort((a, b) => b.n - a.n)[0].b;
const pad = (b, g) => [b[0] - g, b[1] - g, b[2] + g, b[3] + g];
const changed = pad(big, 10);
// a calm area: a 160 × 120 box holding lines in B that C leaves exactly as they are
let calm = null;
const view = (await quiet(() => R.openPdf(env, B, { fileId: 'f1', name: 'b.pdf' }))).pages[0];
const [vx0, vy0, vx1, vy1] = view.view;
for (let y = vy0; y < vy1 - 120 && !calm; y += 60) for (let x = vx0; x < vx1 - 160 && !calm; x += 60) {
  const box = [x, y, x + 160, y + 120];
  const snap = T.regionSnapshot(sb, box);
  if (snap.segs.length >= 8 && !T.compareRegion(T.cleanLink({ kind: 'region', rect: snap.rect, segs: snap.segs }), sc).changed && !(box[2] > changed[0] && box[0] < changed[2] && box[3] > changed[1] && box[1] < changed[3])) calm = box;
}
if (!calm) throw new Error('no calm area found');
const opened = await quiet(() => R.openPdf(env, B, { fileId: 'f1', name: 'b.pdf' }));
const key = opened.pages[0].key;
const link = (box, label) => { const s = T.regionSnapshot(sb, box); return { kind: 'region', file: 'cadcraft-sample-house-rev-B.pdf', sheet: opened.pages[0].sheetNo || opened.pages[0].title, label, rect: s.rect, segs: s.segs, at: '2026-10-28T09:00:00Z' }; };
const st = new model.Store();
st.change('seed', (tx) => {
  tx.add({ id: 'act-1', sheet: key, type: 'cloudrect', rect: changed, text: 'Redraw this area for the new stair', author: 'Ana Reyes', created: '2026-10-27T15:00:00Z' });
  tx.add({ id: 'act-2', sheet: key, type: 'cloudrect', rect: pad(calm, 0), text: 'Check the notes here against the spec', author: 'Ben Okafor', created: '2026-10-27T15:05:00Z' });
  tx.add({ id: 'act-3', sheet: key, type: 'note', pts: [[vx0 + (vx1 - vx0) * 0.12, vy0 + (vy1 - vy0) * 0.85]], text: 'Confirm the garage door size with the client', author: 'Ana Reyes', created: '2026-10-27T15:10:00Z' });
});
T.setTask(st, 'act-1', { title: 'Redraw for the new stair', assignee: { kind: 'assistant', name: 'Your assistant' }, due: '2026-11-05', link: link(changed, 'Stair area') }, 'Ana Reyes');
T.setTask(st, 'act-2', { title: 'Check the notes against the spec', assignee: { kind: 'person', name: 'Ben Okafor' }, due: '2026-11-12', link: link(calm, 'Notes area') }, 'Ana Reyes');
T.setTask(st, 'act-3', { title: 'Confirm the garage door size', assignee: { kind: 'person', name: 'Ana Reyes' }, due: '2026-10-20' }, 'Ana Reyes');
V.addDecision(st, { sheet: key, at: [vx0 + (vx1 - vx0) * 0.6, vy0 + (vy1 - vy0) * 0.9], text: 'Stair moves to the north wall; the hall stays 1100 wide', by: 'Ana Reyes' });
const out = await W.writeMarkedUp(PDFLib, B, { pages: [{ index: 0, key, markups: st.onSheet(key), calibration: null }] });
fs.writeFileSync(OUT, out.bytes);
console.log('wrote ' + path.relative(ROOT, OUT) + ' (' + out.bytes.length + ' bytes); changed area ' + changed.map(Math.round) + ', calm area ' + calm);
