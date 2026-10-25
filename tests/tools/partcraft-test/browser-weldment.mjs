#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-weldment.mjs — 0.7 D7.50 on the page (the mesh kernel): a 500 × 300 rectangle sketch selected, More › Structural
 * member makes Member1 along its four lines (HSS2x2x1/4, mitred), the panel shows the section and a cut list of two rows;
 * Corners › Butt changes the list (four lengths, square ends); a second sketch ticked adds its line; Save the cut list (CSV)
 * downloads it. No console errors. Shot: weldment.png.
 *   node tools/partcraft-test/browser-weldment.mjs [--state <file>] [--out <dir>]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startHarness, cliArgs } from './browser-harness.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');
const I18N = await import(DEV + 'i18n.js');
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(DEV + 'lang/en.json', 'utf8')) });
const P = await import(DEV + 'part.js'), S = await import(DEV + 'sketch.js');
const part = P.newPart('Frame');
const sk = S.newSketch(); S.addRect(sk, [0, 0], [500, 300]);
P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
const sk2 = S.newSketch(); S.addLine(sk2, [250, 0], [250, 300]);
P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk2 });

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built } = h;
const TMP = path.join(out, 'weld');
fs.mkdirSync(TMP, { recursive: true });

try {
  console.log('\n== structural members (0.7 D7.50)');
  await pc((t) => window.partcraft.openText(t, 'Frame.partcraft.json'), P.toJSON(part));
  await built();
  await pc(() => window.partcraft.selectFeature(window.partcraft.part.features[0].id));
  // Features › More › Structural member
  const more = page.locator('.pc-tools details:has([data-cmd="member"]) > summary');
  await more.click();
  await page.click('.pc-tools [data-cmd="member"]');
  await page.waitForFunction(() => window.partcraft.part.features.some((f) => f.type === 'member'));
  await built();
  const s1 = await pc(() => { const p = window.partcraft, f = p.part.features.find((x) => x.type === 'member'); return { segs: f.segs.length, section: f.section, status: p.regen.results.get(f.id).status, vol: p.regen.stats?.volume || 0 }; });
  ok(/Member1: 4 members of HSS2x2x1\/4/.test(await h.statusText()), 'the status bar: ' + (await h.statusText()).trim());
  ok(s1.segs === 4 && s1.section === 'HSS2X2X1/4' && s1.status === 'ok' && s1.vol > 1.5e6, `Structural member along the selected sketch's 4 lines: ${s1.section}, built (${s1.vol.toFixed(0)} mm³)`);
  const rows1 = await page.$$eval('[data-cut-list] tbody tr', (rs) => rs.map((r) => [...r.cells].map((c) => c.textContent.trim()).join(' | ')));
  ok(rows1.length === 2 && rows1.every((r) => /45°/.test(r)), 'the cut list: two rows, ends at 45°: ' + rows1.join(' ; '));
  await page.screenshot({ path: path.join(out, 'weldment.png') });
  // corners → butt (the Corners select is the one offering 'butt')
  await page.locator('.pc-props select:has(option[value="butt"])').selectOption('butt');
  await built();
  const rows2 = await page.$$eval('[data-cut-list] tbody tr', (rs) => rs.map((r) => [...r.cells].map((c) => c.textContent.trim())));
  ok(rows2.length === 4 && rows2.every((r) => /square/.test(r[4])), 'Corners › Butt: four lengths, square ends');
  // tick the second sketch: its line joins as a crossbar
  await page.locator('.pc-props label:has-text("Sketch2") input[type=checkbox]').check();
  await built();
  const s3 = await pc(() => { const p = window.partcraft, f = p.part.features.find((x) => x.type === 'member'); return { segs: f.segs.length, status: p.regen.results.get(f.id).status }; });
  const fit = await page.$$eval('[data-cut-list] tbody tr', (rs) => rs.some((r) => /cut to fit/.test(r.textContent)));
  ok(s3.segs === 5 && s3.status === 'ok' && fit, 'Sketch2 ticked: its line is a crossbar, both ends cut to fit');
  const [d] = await Promise.all([page.waitForEvent('download'), page.click('[data-cut-csv]')]);
  const file = path.join(TMP, d.suggestedFilename());
  await d.saveAs(file);
  const csv = fs.readFileSync(file, 'utf8').trim().split('\n');
  ok(/cut list\.csv$/.test(file) && /^Item,Qty,Piece,Section/.test(csv[0]) && csv.length >= 4, `Save the cut list (CSV): ${path.basename(file)}, ${csv.length - 1} rows`);
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
