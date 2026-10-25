#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-param-uses.mjs — 0.5 WL.30 on the page (the mesh kernel): the Parameters tab lists under each parameter where it is
 * used (Extrude1 depth directly, the hole through h, d; a configuration; a script), "Not used yet." for an unused one, and a
 * feature entry selects that feature and shows its properties; in the Script workspace a script's tab note lists the
 * parameters it reads (and one the part lacks), and the script reads their values in the worker (param, params); no
 * console errors.
 *   node tools/partcraft-test/browser-param-uses.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, shot, F } = h;

try {
  console.log('\n== parameters: where used (0.5 WL.30)');
  const P = await import('../../public_html/assets/apps/partcraft/dev/part.js');
  const S = await import('../../public_html/assets/apps/partcraft/dev/sketch.js');
  const part = P.newPart('Uses');
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: F.blockSketch(100, 50).sk });
  const e1 = P.addFeature(part, 'extrude', { sketch: s1.id, depth: 20 });
  const sk = S.newSketch(); S.addPoint(sk, 20, 20);
  const s2 = P.addFeature(part, 'sketch', { plane: { kind: 'face', feature: e1.id, face: 'end' }, sketch: sk });
  const h1 = P.addFeature(part, 'hole', { sketch: s2.id, d: 6 });
  part.params = { vars: [{ name: 'w', expr: '40' }, { name: 'h', expr: 'w / 2' }, { name: 'd', expr: 'h / 4' }, { name: 'spare', expr: '3' }],
    links: [{ target: e1.id + '.depth', expr: 'w' }, { target: h1.id + '.d', expr: 'd' }] };
  part.configs = { rows: [{ name: 'Small', values: { w: 30 } }], active: null };
  part.studies = { script: { v: 1, active: 0, keepVars: false, scripts: [{ name: 'size.craft', lang: 'craft', text: "a = param('w') + param('h');\nb = param('nope');\n" }] } };
  await pc((t) => window.partcraft.openText(t, 'Uses.partcraft.json'), JSON.stringify(part));
  await built();
  await page.click('#pc-tab-params');
  await page.waitForSelector('tr.pc-puses');
  const rowText = (n) => page.evaluate((n) => document.querySelector(`tr.pc-puses[data-uses-of="${n}"]`)?.textContent.trim(), n);
  const w = await rowText('w'), hh = await rowText('h'), sp = await rowText('spare');
  ok(/^Used by: Extrude1 depth; Hole1 diameter \(through h, d\); parameter h; configuration Small; script size$/.test(w), 'under w: ' + w);
  ok(/^Used by: Hole1 diameter \(through d\); parameter d; script size$/.test(hh), 'under h: ' + hh);
  ok(sp === 'Not used yet.', 'an unused parameter says "Not used yet."');
  await shot('pu-1-params');
  await page.click(`tr.pc-puses[data-uses-of="w"] button[data-use-target="${e1.id}.depth"]`);
  await page.waitForTimeout(100);
  const st = await page.evaluate(() => ({ props: !document.querySelector('#pc-sec-props').hidden, head: document.querySelector('[data-props-h]')?.textContent }));
  ok(st.props && st.head === 'Extrude1' && (await pc(() => window.partcraft.sel?.id)) === e1.id, 'clicking "Extrude1 depth" selects Extrude1 and shows its properties');

  console.log('\n== a script reads parameters');
  await page.selectOption('[data-workspace]', 'script');
  await page.waitForSelector('[data-cs-panel]');
  await page.waitForTimeout(500);
  const note = await page.evaluate(() => ({ reads: document.querySelector('[data-cs-reads-params]')?.textContent, missing: document.querySelector('[data-cs-missing-params]')?.textContent }));
  ok(note.reads === "Reads the part's parameters w, h, nope." && note.missing === 'The part has no parameter nope.', `the tab note: "${note.reads}" "${note.missing}"`);
  await page.fill('[data-cs-editor]', "a = param('w') + param('h');\ns = params();\nc = s.d * 2;\n");
  await page.focus('[data-cs-editor]'); await page.keyboard.press('F5');
  await page.waitForFunction(() => !document.querySelector('[data-cs-panel]')?.classList.contains('is-busy'), null, { timeout: 30000 });
  await page.waitForTimeout(300);
  const vals = await page.evaluate(() => [...document.querySelectorAll('[data-cs-var]')].map((r) => [r.dataset.csVar, r.querySelector('td:last-child')?.textContent]));
  const v = Object.fromEntries(vals);
  ok(v.a === '60' && v.c === '10', `the script read them in the worker: a = w + h = ${v.a}, c = params().d × 2 = ${v.c} (d = h / 4 = 5)`);
  await shot('pu-2-script');
  await page.selectOption('[data-workspace]', 'design');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
