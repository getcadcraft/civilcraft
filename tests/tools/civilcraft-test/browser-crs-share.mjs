#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-crs-share.mjs — crs-share_PART_3 (0.8 D8.9): CivilCraft's GIS › Coordinates dialog uses the shared coordinate system picker.
 *   node tools/civilcraft-test/browser-crs-share.mjs
 * "UTM, EPSG number or your own…" inside the project's coordinate system dialog: a UTM zone in a metres project becomes the project's
 * system (Apply = one undo step, as before); the same zone in a feet project is refused with the existing reason as a Problems message;
 * a projection of your own is kept in My projections and used; the old search, the fits list and a saved project are unchanged.
 * Real clicks, one app, minted session.
 */
import { harness, BASE, UTM33, OWN } from '../crs-pick/browser-common.mjs';

const H = await harness('civilcraft').open();
const { ok } = H;
const page = await H.page();
const dlg = 'dialog[data-crs-pick][open]';
const wait = (f, a) => page.waitForFunction(f, a, { timeout: 30000 });
try {
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('civilcraft.settings'); localStorage.removeItem('cadcraft.projections'); } catch { /* */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await wait(() => window.civilcraft.project.points.length === 276);
  const units = await page.evaluate(() => window.civilcraft.project.state.units);
  ok(units === 'ft', 'the sample project is in feet (' + units + ')');

  console.log('== a feet project: a metres UTM zone is refused, as a Problems message');
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  ok(await page.isVisible('[data-crs-more]') && /UTM zone|EPSG number/.test(await page.textContent('[data-crs-more-help]')), 'the picker button and its help line are in the dialog');
  await page.click('[data-crs-more]');
  await page.waitForSelector(dlg);
  await page.fill('[data-crs-q]', 'UTM 11N');
  await wait(() => /EPSG:32611/.test(document.querySelector('[data-crs-msg]').textContent));
  ok(await page.isDisabled('[data-crs-use]') && /feet|meters|metres/.test(await page.textContent('[data-crs-problem]')), 'Use stays off, the reason is said: ' + (await page.textContent('[data-crs-problem]')).slice(0, 110));
  ok(await page.evaluate(() => !!window.ccProblems && window.ccProblems.store.sources().some((s) => s.id === 'crs.pick' && s.count === 1)), 'a Problems message in the shell (source crs.pick)');

  console.log('== a feet system by number, through the same dialog');
  await page.fill('[data-crs-q]', '2230');
  await wait(() => !document.querySelector('[data-crs-use]').disabled);
  await page.click('[data-crs-use]');
  await wait(() => !document.querySelector('dialog[data-crs-pick]'));
  ok(await page.evaluate(() => !window.ccProblems.store.sources().some((s) => s.id === 'crs.pick' && s.count > 0)), 'a good choice clears the message');
  ok(/California/.test(await page.textContent('.cv-crs-chosen')), 'the project dialog now shows it as the chosen system: ' + (await page.textContent('.cv-crs-chosen')).slice(0, 80).replace(/\s+/g, ' '));
  const before = await page.evaluate(() => window.civilcraft.project.undoStack.length);
  await page.click('[data-crs-apply]');
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  ok(await page.evaluate(() => window.civilcraft.project.state.crs?.code === 2230 && window.civilcraft.project.state.crs.local === null), 'Apply: the project is in EPSG:2230');
  ok(await page.evaluate((n) => window.civilcraft.project.undoStack.length === n + 1, before), 'one undo step, as before');

  console.log('== your own projection in a metres project');
  await page.evaluate(() => { window.civilcraft.project.change('units', (st) => { st.units = 'm'; st.crs = null; }); });
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  await page.click('[data-crs-more]');
  await page.waitForSelector(dlg);
  await page.fill('[data-crs-q]', 'Plant half-degree grid = ' + OWN);
  await wait(() => !document.querySelector('[data-crs-use]').disabled);
  await page.click('[data-crs-keep]');
  const kept = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.projections') || '[]'));
  ok(kept.length === 1 && kept[0].name === 'Plant half-degree grid', 'kept in My projections: ' + JSON.stringify(kept.map((k) => k.name)));
  await page.click('[data-crs-use]');
  await wait(() => !document.querySelector('dialog[data-crs-pick]'));
  await page.click('[data-crs-apply]');
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  const crs = await page.evaluate(() => window.civilcraft.project.state.crs);
  ok(crs && crs.code == null && /half-degree/.test(crs.name) && crs.unit === 'm' && /\+lon_0=152\.5/.test(crs.proj4), 'the project has the definition of its own: ' + (crs ? crs.name : null));
  ok(await page.evaluate(() => { const o = window.civilcraft.project.state.crs; return Object.keys(o).sort().join() === 'code,local,name,proj4,unit'; }), 'saved in the shape a project already keeps (code, name, proj4, unit, local)');
  await page.screenshot({ path: '/tmp/cc-crs-share-civil.png' }).catch(() => {});

  console.log('== My projections that equals a listed system');
  await page.evaluate((def) => { const l = JSON.parse(localStorage.getItem('cadcraft.projections') || '[]'); l.push({ id: 'mine-utm33', name: 'Site grid', proj4: def, unit: 'm' }); localStorage.setItem('cadcraft.projections', JSON.stringify(l)); }, UTM33);
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"]');
  await page.click('[data-crs-more]');
  await page.waitForSelector(dlg);
  await page.click('[data-crs-mine-use="mine-utm33"]');
  ok(/same coordinates as EPSG:32633/.test(await page.textContent('[data-crs-msg]')), 'the "same coordinates as" note is shown');
  await page.click('[data-crs-use]');
  await wait(() => !document.querySelector('dialog[data-crs-pick]'));
  await page.click('[data-crs-apply]');
  await page.getByRole('button', { name: /^Yes/ }).click({ timeout: 10000 });   // the existing question: are the coordinates already in the new system
  await page.waitForSelector('[data-crs-dialog]', { state: 'detached' });
  ok(await page.evaluate(() => window.civilcraft.project.state.crs?.code === 32633), 'the project takes EPSG:32633');
} catch (e) {
  H.bump();
  console.log('  FAIL ' + (e.stack || e));
}
await H.finish();
