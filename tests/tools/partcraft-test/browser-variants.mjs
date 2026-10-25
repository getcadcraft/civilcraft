#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-variants.mjs — 0.7 W3.19 (the variant pack) in PartCraft, headless Chromium, mesh kernel: opens
 * fixtures/showcase/partcraft-configurator.partcraft.json, Parameters › Configurations › Variant pack…, unticks one configuration
 * and the IFC, makes the pack, and reads the downloaded zip: the files named by the configurations, variants.csv, the library
 * item. No console errors.
 *   node tools/partcraft-test/browser-variants.mjs [--state <file>] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { startHarness, cliArgs } from './browser-harness.mjs';

const h = await startHarness({ ...cliArgs(), exact: false });
const { page, ok } = h;
const REPO = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
try {
  console.log('\n== variant pack dialog (0.7 W3.19)');
  const text = fs.readFileSync(path.join(REPO, 'fixtures/showcase/partcraft-configurator.partcraft.json'), 'utf8');
  await page.evaluate(async (txt) => { await window.partcraft.openText(txt, 'plate.partcraft.json'); await window.partcraft.built(); }, text);
  await page.click('#pc-tab-params');
  await page.waitForSelector('[data-configs] [data-config-name]');
  ok((await page.$$('[data-configs] [data-config-name]')).length === 4, 'the four configurations are listed');
  await page.click('[data-variant-pack-open]');
  await page.waitForSelector('dialog [data-variant-pack]');
  ok((await page.$$('dialog [data-variant-config]')).length === 4 && (await page.$$('dialog [data-variant-format]')).length === 4, 'the dialog lists the 4 configurations and the 4 file kinds');
  await h.shot('variants-dialog');
  await page.uncheck('dialog [data-variant-config="Large"]');
  await page.uncheck('dialog [data-variant-format="ifc"]');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('dialog button[data-key="make"]')]);
  ok(/variants\.zip$/.test(dl.suggestedFilename()), 'one zip is downloaded: ' + dl.suggestedFilename());
  const zipPath = path.join(h.OUT, 'variants-test.zip');
  await dl.saveAs(zipPath);
  const names = (await import('node:child_process')).execFileSync('unzip', ['-Z1', zipPath], { encoding: 'utf8' }).trim().split('\n').sort();
  ok(!names.some((n) => n.endsWith('.ifc')) && !names.some((n) => /^Large\./.test(n)), 'no IFC and no Large in the zip: ' + names.join(', '));
  ok(['Small.step', 'Medium.step', 'Small.dwg', 'Medium.dwg', 'Small.svg', 'variants.csv', 'variants.json', 'README.txt', 'Mounting plate.item.json'].every((n) => names.includes(n)), 'the other files are there');
  const csv = (await import('node:child_process')).execFileSync('unzip', ['-p', zipPath, 'variants.csv'], { encoding: 'utf8' });
  ok(/Small,small,80,50,6/.test(csv) && /"Medium, no holes",medium-no-holes,120,60,8,Bolts/.test(csv) && !/Large/.test(csv), 'variants.csv holds the three chosen rows, with the feature the last one turns off');
  const item = JSON.parse((await import('node:child_process')).execFileSync('unzip', ['-p', zipPath, 'Mounting plate.item.json'], { encoding: 'utf8' }));
  ok(item.variants.rows.length === 3 && item.variants.default === 'medium', 'the library item has 3 variants, the active configuration as the default');
  await page.waitForFunction(() => /variants/.test(document.querySelector('[data-status]')?.textContent || ''));
  ok(/3 variants/.test(await h.statusText()), 'the status line says: ' + (await h.statusText()).trim());
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
  await h.finish();
} catch (e) { await h.failed(e); await h.finish(); }
