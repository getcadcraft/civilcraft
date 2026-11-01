#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-share.mjs — crs-share_PART_3 (0.8 D8.9): "My projections" is one list on the origin, shared by BimCraft, CivilCraft and CadCraft.
 *   node tools/crs-pick/browser-share.mjs
 * A projection of your own is saved from BimCraft's picker (Settings › Location › Choose another system…), then read, used and removed in
 * CivilCraft's and CadCraft's pickers (three /lab pages, one browser profile, one localStorage key `cadcraft.projections`), one page at a
 * time. A second one is saved in CivilCraft and is seen in CadCraft. Minted session; fails on any console error.
 */
import { harness, BASE, OWN } from './browser-common.mjs';

const H = await harness('share').open();
const { ok } = H;
const dlg = 'dialog[data-crs-pick][open]';
const NAME = 'Plant half-degree grid';
const mineIds = (p) => p.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.projections') || '[]').map((e) => e.name));
try {
  console.log('== BimCraft saves one');
  let page = await H.page();
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.projections'); localStorage.removeItem('bimcraft.settings'); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-settings-open]');
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  await page.locator('dialog[data-app-settings]').getByText('Location', { exact: true }).first().click();
  await page.click('[data-bc-geo-more]');
  await page.waitForSelector('dialog[data-crs-pick="target"][open]');
  await page.fill('[data-crs-q]', NAME + ' = ' + OWN);
  await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled && !document.querySelector('.bc-crs-custom').hidden);
  await page.click('[data-crs-keep]');
  ok((await mineIds(page)).join() === NAME, 'BimCraft kept "' + NAME + '" under cadcraft.projections');
  await page.close();

  console.log('== CivilCraft reads it, saves a second one');
  page = await H.page();
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  await page.click('[data-crs-more]');
  await page.waitForSelector(dlg);
  ok((await page.textContent('[data-crs-mine]')).includes('Use ' + NAME), 'CivilCraft lists it in My projections');
  await page.fill('[data-crs-q]', 'Second grid = ' + OWN.replace('152.5', '151.5'));
  await page.waitForSelector('[data-crs-name]', { state: 'visible' });   // (Use stays off: the sample project is in feet; Keep does not need it)
  await page.click('[data-crs-keep]');
  ok((await mineIds(page)).length === 2, 'CivilCraft kept a second one: ' + (await mineIds(page)).join(' | '));
  await page.close();

  console.log('== CadCraft sees both, removes one');
  page = await H.page();
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.click('[data-cmd-input]'); await page.keyboard.type('MAPLAYERS'); await page.keyboard.press('Enter');
  await page.waitForSelector('[data-map-dialog]', { timeout: 30000 });
  await page.click('[data-map-crs-more]');
  await page.waitForSelector(dlg);
  const txt = await page.textContent('[data-crs-mine]');
  ok(txt.includes('Use ' + NAME) && txt.includes('Use Second grid'), 'CadCraft lists both: ' + txt.replace(/\s+/g, ' ').slice(0, 80));
  await page.locator('[data-crs-mine-remove]').first().click();
  ok((await mineIds(page)).length === 1, 'removed one in CadCraft: ' + (await mineIds(page)).join(' | '));
  await page.close();

  console.log('== BimCraft sees the removal');
  page = await H.page();
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-settings-open]');
  await page.waitForSelector('dialog[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  await page.locator('dialog[data-app-settings]').getByText('Location', { exact: true }).first().click();
  await page.click('[data-bc-geo-more]');
  await page.waitForSelector('dialog[data-crs-pick="target"][open]');
  ok((await page.locator('[data-crs-mine-use]').count()) === 1, 'BimCraft now lists one');
  await page.evaluate(() => { localStorage.removeItem('cadcraft.projections'); });
} catch (e) {
  H.bump();
  console.log('  FAIL ' + (e.stack || e));
}
await H.finish();
