#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-holetable.mjs — the hole table on drawings (0.4 P23, drawing.js partHoles / holeTableRows / composeSheet): the flange
 * (eight Ø14 holes on r 75: one Hole + a circular pattern) on the exact kernel; the holes found from the cylindrical faces
 * (pattern copies included, the revolve's bore left out), their positions in the top view against 75 cos θ, 75 sin θ from the
 * view box's corner, tags A1…A8 and "Ø14 THRU"; none square to the front view; the table and tags on the sheet and in the
 * PDF (pdftotext); the setting in the part file.
 *   node tools/partcraft-test/test-holetable.mjs [--verbose]    (or runHoleTableTests() from bin/test-partcraft.mjs)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

export async function runHoleTableTests({ ok, section, oc, skip = (m) => console.log('  skip ' + m) }) {
  (await import(DEV + 'i18n.js')).init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
  const P = await import(DEV + 'part.js'), B = await import(DEV + 'brep.js'), BD = await import(DEV + 'brep-draw.js'), D = await import(DEV + 'drawing.js');
  const F = await import(path.join(HERE, 'fixtures.mjs'));
  section('hole table on drawings (0.4 P23)');
  const fl = F.flange();
  const part = fl.part;
  const r = B.regenerateBrep(part, oc);
  const holes = D.partHoles(part, r);
  ok(Array.isArray(holes) && holes.length === 8 && holes.every((h) => Math.abs(h.dia - 14) < 1e-6 && h.depth === null && h.callout === 'Ø14 THRU'), `the flange's holes from its cylindrical faces: 8 (one Hole + its circular pattern; the revolve's bore is not a hole), each Ø14 THRU (${holes?.length})`);
  ok(D.partHoles(part, { exact: false }) === null, 'the mesh kernel (no face records): no holes, so no table');
  const data = BD.drawingViews(part, oc, {});
  const top = D.holeTableRows(holes, 'top', data.views.top.box);
  const b = data.views.top.box;
  // top view: right = +x, up = −z; the holes at (75 cos θ, ·, 75 sin θ)
  const want = Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return [75 * Math.cos(a) - b.u0, -75 * Math.sin(a) - b.v0]; });
  const matched = top.rows.every((row) => want.some(([x, y]) => Math.abs(row.x - x) < 1e-6 && Math.abs(row.y - y) < 1e-6));
  ok(top.rows.length === 8 && top.skipped === 0 && matched && Math.abs(b.u0 + 100) < 1e-6 && Math.abs(b.v0 + 100) < 1e-6, `top view: 8 rows, every X / Y = 75 cos θ − u0, −75 sin θ − v0 from the view's corner (−100, −100) to 1e-6`);
  ok(top.rows.map((x) => x.tag).join() === 'A1,A2,A3,A4,A5,A6,A7,A8' && top.rows.every((x, i) => i === 0 || top.rows[i - 1].y >= x.y - 1e-9), 'one size, so tags A1 … A8, ordered top to bottom');
  const front = D.holeTableRows(holes, 'front', data.views.front.box);
  ok(front.rows.length === 0 && front.skipped === 8, 'front view: none of them square to it (8 skipped)');
  const sheet = D.composeSheet(data, { name: 'Flange', drawing: { holeTable: { view: 'top' } }, holes });
  const txt = sheet.texts.map((x) => x.text);
  ok(sheet.holeTable && sheet.holeTable.rows.length === 8 && sheet.place.holes && ['A1', 'A8', 'X0 Y0', 'Hole table (top view)', 'Ø14 THRU'].every((s) => txt.includes(s)) && !sheet.omitted.includes('holes'), 'the sheet: the table in a free slot, the tags on the top view, the X0 Y0 origin');
  const { bytes } = await D.toPdf(sheet);
  const f = path.join(REPO, 'tmp', 'partcraft-holetable.pdf');
  fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, bytes);
  try {
    const pt = execFileSync('pdftotext', ['-layout', f, '-'], { encoding: 'utf8' });
    ok(/Hole table \(top view\)/.test(pt) && /A8/.test(pt) && /Ø14 THRU/.test(pt) && /X0 Y0/.test(pt), 'the PDF has the table, the tags and the origin (pdftotext)');
  } catch { skip('pdftotext is not installed'); }
  const withT = JSON.parse(JSON.stringify(part)); withT.drawing = { section: null, detail: null, notes: [], holeTable: { view: 'right' } };
  ok(P.readPart(P.toJSON(withT)).drawing.holeTable.view === 'right' && P.fileVersion(withT) === 3, 'the setting is saved with the part (file version 3)');
  const bad = JSON.parse(P.toJSON(withT)); bad.drawing.holeTable = { view: 'iso' };
  let msg = ''; try { P.readPart(JSON.stringify(bad)); } catch (e) { msg = e.message; }
  ok(/hole table settings in this file are bad/.test(msg), `a hole table on the isometric view is refused ("${msg}")`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const VERBOSE = process.argv.includes('--verbose');
  let pass = 0, fail = 0;
  const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
  const section = (t) => console.log('\n== ' + t);
  const { default: occtInit } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await occtInit({ print: () => {}, printErr: () => {} });
  await runHoleTableTests({ ok, section, oc });
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
