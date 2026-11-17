/* SPDX-License-Identifier: Apache-2.0 */
/** browser-elevation-classic.mjs — 0.10 BT.10 in the CadCraft classic layout (/lab/bimcraft, headless): Build › Elevation, the project browser row, pick the marker
 *  (Properties: label, Flip the view, Look as far as), Delete, and the help topic place-an-elevation.   node tools/bimcraft-test/browser-elevation-classic.mjs [<shots dir>]   (as root) */
import { openLab } from './bk-page.mjs';
const L = await openLab({ tag: 'bkelev', units: 'mm' });
const { page, inPage, ok } = L;
const planClick = async (x, y) => { await inPage(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await page.waitForTimeout(250); await L.settled(); };
try {
  await L.newBuilding({ name: 'Classic', levels: 2, height: '3000 mm' });
  await L.tool('wall'); await L.frame(-4000, -5000, 10000, 9000);
  for (const [x, y] of [[0, 0], [6000, 0], [6000, 4000], [0, 4000], [0, 0]]) await planClick(x, y);
  await page.keyboard.press('Escape');
  // the Build menu, opened as a person does
  const menu = await inPage(() => { const b = document.querySelector('[data-mtool="elevation"]'), d = b.closest('details'); return { menu: d?.querySelector('summary')?.textContent.trim(), label: b.textContent.trim() }; });
  ok(menu.menu === 'Build' && menu.label === 'Elevation', 'classic layout: Elevation is in the Build menu', JSON.stringify(menu));
  await L.tool('elevation'); await L.frame(-4000, -5000, 10000, 9000);
  await planClick(3000, -3000); await planClick(3000, 0);
  await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  const row = await inPage(() => { const r = document.querySelector('[data-pb-elevmarker]'); if (!r) return null; const b = r.getBoundingClientRect(); return { text: r.textContent.trim().slice(0, 40), visible: b.width > 0 && b.height > 0, edit: !!(r.closest('li') || r.parentElement).querySelector('[data-pb-elevedit]') }; });
  ok(row && /Elevation 1/.test(row.text) && row.edit, 'classic layout: the project browser lists Elevation 1 with its Edit button', JSON.stringify(row));
  if (process.argv[2]) await page.screenshot({ path: process.argv[2] + '/classic-marker.png' });
  // pick the marker and read Properties, then Delete
  await L.tool('select'); await inPage(() => document.querySelector('[data-model-layout="plan"]').click()); await page.waitForTimeout(600); await L.frame(-4000, -9000, 10000, 9000); await page.waitForTimeout(300); await L.mouseClick(3000, -3000); await page.waitForTimeout(700);
  await page.click('[data-rtab="props"]').catch(() => {}); await page.waitForTimeout(500);
  console.log('  picked', JSON.stringify(await inPage(() => { const pv = window.bimcraftPlan.view, s = window.bimcraftRes.state.secs[0], kb = window.bimcraftRes.api.kb(); const sc = pv.toScreen([3000, -3000]), r = pv.canvas.getBoundingClientRect(); return { want: kb + s.id, hit: pv.hit(r.left + sc.x, r.top + sc.y), sel: [...(pv.selection || [])], tool: window.bimcraftPlan.state.tool }; })));
  if (process.argv[2]) await page.screenshot({ path: process.argv[2] + '/classic-picked.png' });
  console.log('  under', JSON.stringify(await inPage(() => { const pv = window.bimcraftPlan.view, sc = pv.toScreen([3000, -3000]), r = pv.canvas.getBoundingClientRect(); const e = document.elementFromPoint(r.left + sc.x, r.top + sc.y); return [e?.tagName, e?.className, [...document.querySelectorAll('[data-rtab]')].map((b) => b.dataset.rtab + ':' + b.getAttribute('aria-selected')).join(' '), (document.querySelector('[data-model-props]')?.textContent || '').slice(0, 200)]; })));
  const props = await inPage(() => ({ name: !!document.querySelector('[data-mp-secname]'), flip: document.querySelector('[data-mp-secflip]')?.textContent.trim(), depth: !!document.querySelector('[data-mp-secdepth]'), labels: [...document.querySelectorAll('[data-model-props] label, [data-model-props] .bc-field-label, [data-model-props] dt')].map((n) => n.textContent.trim()).slice(0, 8) }));
  ok(props.name && props.flip === 'Flip the view' && props.depth, 'picked: Properties has its label, Flip the view and Look as far as', JSON.stringify(props));
  await inPage(() => document.querySelector('[data-mp-secflip]').click()); await page.waitForTimeout(600); await L.settled();
  const dir = await inPage(async () => { const m = await import('/assets/apps/bimcraft/dev/res-sheets.js'); return m.elevationMarkerOf(window.bimcraftRes.state.secs[0]).dir; });
  ok(Math.abs(dir[1] + 1) < 1e-6, 'Flip the view: it looks south now, from the same spot', JSON.stringify(dir));
  await L.tool('select'); await inPage(() => document.querySelector('[data-model-layout="plan"]').click()); await page.waitForTimeout(600); await L.frame(-4000, -9000, 10000, 9000); await page.waitForTimeout(300); await L.mouseClick(3000, -3000); await page.waitForTimeout(700);
  await page.keyboard.press('Delete'); await page.waitForTimeout(800); await L.settled();
  ok(await inPage(() => window.bimcraftRes.state.secs.length) === 0, 'Delete removes the marker');
  // the help topic opens
  await inPage(() => window.cadcraftHelp.open('place-an-elevation')); await page.waitForTimeout(800);
  const help = await inPage(() => document.querySelector('[data-help-panel]')?.textContent.replace(/\s+/g, ' ').slice(0, 4000) || '');
  ok(/Place an elevation and open its view/.test(help) && /Click where the elevation stands/.test(help), 'the help topic "Place an elevation and open its view" opens in the app');
  ok(!/\bnull\b/.test(help.slice(0, 400)), 'no stray "null" under the topic\'s title (FX.267)', help.slice(0, 160));
  if (process.argv[2]) await page.screenshot({ path: process.argv[2] + '/help-topic.png' });
  L.done();
} catch (e) { console.error(e); }
await L.close();
