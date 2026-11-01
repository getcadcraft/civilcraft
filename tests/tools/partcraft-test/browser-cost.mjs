#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cost.mjs — 0.8 EG.76 in PartCraft, headless Chromium: the EG.75 aluminium bracket opened, Manufacture › Cost (no CAM setup needed):
 * rows for stock, cutting, holes, handling and the setup; the total for one is 145.31; quantity 10 shares the setup (91.31 each); a changed
 * machine rate is saved with the part (part.studies.cost) and undone by Ctrl+Z; Back to the placeholder rates; the placeholder note is shown;
 * Printed switches the rows. No console errors.
 *   node tools/partcraft-test/browser-cost.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== making cost');
  const json = fs.readFileSync(path.join(REPO, 'fixtures/showcase/partcraft-bracket-20lb.partcraft.json'), 'utf8');
  await pc((t) => window.partcraft.openText(t, 'Bracket.partcraft.json'), json);
  await built();
  await page.selectOption('[data-workspace]', 'manufacture'); await page.waitForTimeout(400);
  await page.click('[data-mtab="cost"]');
  await page.waitForSelector('[data-cost-result]');
  const text = async () => (await page.textContent('[data-cost-result]')).replace(/\s+/g, ' ');
  let r = await text();
  ok(/Stock\s*8\.15 USD/.test(r) && /Cutting\s*68\.99 USD/.test(r) && /Holes\s*1\.17 USD/.test(r) && /Handling\s*7\.00 USD/.test(r) && /Setup, shared\s*60\.00 USD/.test(r), 'rows: stock 8.15, cutting 68.99, holes 1.17, handling 7.00, setup 60.00 — ' + r.slice(0, 160));
  ok(/Each, at 1\s*145\.31 USD/.test(r), 'the total for one is 145.31');
  ok(/placeholder/i.test(await page.textContent('[data-cost-note]')), 'the note says the rates are placeholders, not a quote');
  const qty = page.locator('[data-cost-panel] input[type=number]').first();
  await qty.fill('10'); await qty.press('Tab'); await page.waitForTimeout(400);
  r = await text();
  ok(/Each, at 10\s*91\.31 USD/.test(r) && /The whole job\s*913\.10 USD/.test(r) && /Setup, shared\s*6\.00 USD/.test(r), 'quantity 10: the setup is shared (6.00), 91.31 each, 913.10 the job — ' + r.slice(-120));
  let study = await pc(() => window.partcraft.part.studies?.cost);
  ok(study && study.qty === 10 && study.process === 'cnc' && !study.rates, 'the quantity is saved with the part (part.studies.cost), rates untouched');
  // a rate of the person's
  const rate = page.locator('[data-cost-rates] input[type=number]').first();
  await rate.fill('100'); await rate.press('Tab'); await page.waitForTimeout(400);
  study = await pc(() => window.partcraft.part.studies?.cost);
  r = await text();
  ok(study && study.rates && study.rates.cnc && study.rates.cnc.perHour === 100 && /Cutting\s*98\.56 USD/.test(r), 'machine rate 100 per hour: saved with the part, cutting 98.56 — ' + r.slice(0, 120));
  await page.click('[data-cost-reset]'); await page.waitForTimeout(300);
  study = await pc(() => window.partcraft.part.studies?.cost);
  ok(study && !study.rates && /Cutting\s*68\.99 USD/.test(await text()), 'Back to the placeholder rates drops them');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(400);
  study = await pc(() => window.partcraft.part.studies?.cost);
  ok(study && study.rates && study.rates.cnc.perHour === 100, 'Ctrl+Z puts the changed rate back (one step)');
  await page.selectOption('[data-cost-panel] select', 'printed'); await page.waitForTimeout(400);
  r = await text();
  ok(/Filament/.test(r) && /Machine time/.test(r) && !/Cutting/.test(r), 'Printed: filament and machine time, no cutting — ' + r.slice(0, 120));
  await shot('cost');
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-cost');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
