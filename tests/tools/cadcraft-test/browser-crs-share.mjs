#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-crs-share.mjs — crs-share_PART_3 (0.8 D8.9): CadCraft's Map layers dialog uses the shared coordinate system picker.
 *   node tools/cadcraft-test/browser-crs-share.mjs
 * MAPLAYERS › "UTM, EPSG number or your own…": a UTM zone sets the drawing's system (doc.meta.geo.crs, the field the DWG already keeps);
 * a projection of your own that matches no listed system is refused with a Problems-shaped message (the drawing keeps an EPSG number);
 * one in My projections that equals a listed system takes its number and says so. Real clicks, one app, minted session.
 */
import { harness, BASE, UTM33, OWN } from '../crs-pick/browser-common.mjs';

const H = await harness('cadcraft').open();
const { ok } = H;
const page = await H.page();
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const dlg = 'dialog[data-crs-pick][open]';
try {
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.projections'); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await typeCmd('MAPLAYERS');
  await page.waitForSelector('[data-map-dialog]', { timeout: 30000 });
  ok(await page.isVisible('[data-map-crs-more]') && /UTM zone|EPSG number/.test(await page.textContent('[data-map-crs-more-help]')), 'the picker button and its help line are in the Map layers dialog');

  console.log('== a UTM zone');
  await page.click('[data-map-crs-more]');
  await page.waitForSelector(dlg);
  await page.fill('[data-crs-q]', 'UTM 33N');
  await page.waitForFunction(() => !document.querySelector('[data-crs-use]').disabled);
  ok(/EPSG:32633/.test(await page.textContent('[data-crs-msg]')), 'UTM 33N is found: ' + await page.textContent('[data-crs-msg]'));
  await page.click('[data-crs-use]');
  await page.waitForFunction(() => !document.querySelector('dialog[data-crs-pick]'));
  ok(await page.inputValue('[data-map-crs-pick]') === '32633', 'the list in Map layers now stands on EPSG:32633');
  await page.click('[data-map-crs-apply]');
  await page.waitForFunction(() => window.cadcraft.doc.meta.geo?.crs?.code === 32633);
  ok(/32633/.test(await page.textContent('[data-map-crs]')), 'applied: ' + (await page.textContent('[data-map-crs]')).trim());
  ok(await page.evaluate(() => { const c = window.cadcraft.doc.meta.geo.crs; return c.code === 32633 && c.unit === 'm' && Object.keys(c).sort().join() === 'code,name,place,unit'; }), 'saved the way the feature already saves it: doc.meta.geo.crs {code, name, unit, place}, no new field');

  console.log('== your own projection that is not a listed system');
  await page.click('[data-map-crs-more]');
  await page.waitForSelector(dlg);
  await page.fill('[data-crs-q]', 'Plant half-degree grid = ' + OWN);
  await page.waitForFunction(() => !document.querySelector('.crs-pick-row[hidden]') || !!document.querySelector('[data-crs-problem]:not([hidden])'));
  ok(await page.isDisabled('[data-crs-use]'), 'Use stays off');
  ok(/no EPSG number/.test(await page.textContent('[data-crs-problem]')), 'the reason is said: ' + (await page.textContent('[data-crs-problem]')).slice(0, 120));
  ok(await page.evaluate(() => !!window.ccProblems && window.ccProblems.store.sources().some((s) => s.id === 'crs.pick' && s.count === 1)), 'and it is a Problems message in the shell (source crs.pick)');
  await page.click('[data-crs-keep]');
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.projections') || '[]'));
  ok(kept.length === 1 && kept[0].unit === 'm', 'kept in My projections: ' + JSON.stringify(kept.map((k) => k.name)));

  console.log('== My projections: one that equals a listed system');
  await page.evaluate((def) => { const l = JSON.parse(localStorage.getItem('cadcraft.projections') || '[]'); l.push({ id: 'mine-utm33', name: 'Site grid', proj4: def, unit: 'm' }); localStorage.setItem('cadcraft.projections', JSON.stringify(l)); }, UTM33);
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => !document.querySelector('dialog[data-crs-pick]'));
  await page.click('[data-map-crs-more]');
  await page.waitForSelector(dlg);
  ok(await page.evaluate(() => !window.ccProblems || window.ccProblems.store.sources().every((s) => s.id !== 'crs.pick' || s.count === 1)), 'the opened dialog starts clean');
  await page.click('[data-crs-mine-use="mine-utm33"]');
  ok(/same coordinates as EPSG:32633/.test(await page.textContent('[data-crs-msg]')), 'the "same coordinates as" note: ' + (await page.textContent('[data-crs-msg]')).slice(0, 100));
  ok(await page.isEnabled('[data-crs-use]'), 'Use is on: it takes the listed system\'s EPSG number');
  await page.click('[data-crs-use]');
  await page.waitForFunction(() => !document.querySelector('dialog[data-crs-pick]'));
  ok(await page.inputValue('[data-map-crs-pick]') === '32633', 'the Map layers list stands on EPSG:32633 again');
  ok(await page.evaluate(() => !window.ccProblems || window.ccProblems.store.sources().every((s) => s.id !== 'crs.pick' || s.count === 0)), 'a good choice clears the message');
  await page.screenshot({ path: '/tmp/cc-crs-share-cad.png' }).catch(() => {});
} catch (e) {
  H.bump();
  console.log('  FAIL ' + (e.stack || e));
}
await H.finish();
