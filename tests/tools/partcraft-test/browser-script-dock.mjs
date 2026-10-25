#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-script-dock.mjs — 0.5 WL.31 on the page (the mesh kernel): the Design workspace's right panel has a Script tab with
 * the Script workspace's editor; with it open the feature tree and the view work as in Design (a click selects a feature,
 * a double-click opens a sketch, the view turns), a script written there runs (F5) and reads a parameter, a field it shows
 * is not drawn in Design (the console says where it is) but is in the Script workspace, the scripts are saved in the part
 * (one undo step), the Script tab is hidden outside Design, and Pop out moves the panel to a window of its own where the
 * editor still runs scripts, then Put back docks it again; no console errors.
 *   node tools/partcraft-test/browser-script-dock.mjs [--state <file>] [--out <dir>]
 */
import { startHarness, cliArgs } from './browser-harness.mjs';

const { state, out } = cliArgs();
const h = await startHarness({ state, out, exact: false });
const { page, ok, pc, built, shot, F } = h;
const consoleText = (p = page) => p.evaluate(() => [...document.querySelectorAll('[data-cs-console] [data-cs-out]')].map((r) => r.textContent).join('\n'));
const idle = (p = page) => p.waitForFunction(() => !document.querySelector('[data-cs-panel]')?.classList.contains('is-busy'), null, { timeout: 30000 });

try {
  console.log('\n== the Script tab in Design (0.5 WL.31)');
  const fl = F.flange().part;
  fl.params = { vars: [{ name: 'k', expr: '7' }], links: [] };
  await pc((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(fl));
  await built();
  ok(await page.isVisible('#pc-tab-script'), 'Design: the right panel has a Script tab');
  await page.click('#pc-tab-script');
  await page.waitForSelector('[data-script-tab] [data-cs-editor]');
  ok(await page.evaluate(() => document.querySelector('main').dataset.activeWorkspace) === 'design' && await page.isVisible('[data-script-tab] [data-cs-run]'), 'it holds the script editor, the workspace stays Design');
  await page.fill('[data-script-tab] [data-cs-editor]', "a = param('k') * 6;\ndisp(a)\nm = hexGrid(10, 10, 10, 2, 2, 2);\nshow(m)\n");
  await page.focus('[data-script-tab] [data-cs-editor]'); await page.keyboard.press('F5');
  await page.waitForTimeout(150); await idle(); await page.waitForTimeout(200);
  let con = await consoleText();
  ok(/\b42\b/.test(con) && /Done in/.test(con) && page.url().endsWith('/lab/partcraft'), 'F5 in the tab runs the script (param(\'k\') × 6 = 42), the page is not reloaded');
  const ov = await pc(() => [...window.partcraft.view.overlays.keys()].filter((k) => k.startsWith('script-')).length);
  ok(ov === 0 && /is in the Script workspace/.test(con), 'show(m) draws nothing over the Design view; the console says where it is');
  // the tree and the view work as in Design
  await page.click('.pc-tree [data-id="f2"]');
  ok((await pc(() => window.partcraft.sel?.id)) === 'f2' && await page.isVisible('[data-script-tab] [data-cs-editor]'), 'a click in the feature tree selects Revolve1; the editor stays open');
  const cam0 = await pc(() => window.partcraft.view.camera.position.toArray());
  const box = await page.locator('.pc-stage canvas').first().boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 80, box.y + box.height / 2 + 20, { steps: 5 }); await page.mouse.up();
  const cam1 = await pc(() => window.partcraft.view.camera.position.toArray());
  ok(cam0.some((v, i) => Math.abs(v - cam1[i]) > 1e-3), 'dragging in the view turns it');
  await page.dblclick('.pc-tree [data-id="f1"]');
  await page.waitForTimeout(200);
  ok((await pc(() => window.partcraft.mode)) === 'sketch', 'a double-click opens Sketch1 for editing (Design does it)');
  await page.keyboard.press('Escape'); await page.click('.pc-tools [data-cmd="sketch-exit"]').catch(() => {});
  await page.waitForTimeout(200);
  // saved with the part: the editor flushes when it loses focus
  const st = await pc(() => window.partcraft.part.studies?.script?.scripts?.[0]?.text || '');
  ok(/param\('k'\) \* 6/.test(st), 'the script is kept in the part');
  await shot('sd-1-design-tab');
  // outside Design the tab hides; the Script workspace shows what the script showed
  await page.selectOption('[data-workspace]', 'script');
  await page.waitForSelector('[data-cs-panel]');
  await page.waitForTimeout(400);
  ok(!(await page.isVisible('#pc-tab-script')) && (await pc(() => [...window.partcraft.view.overlays.keys()].filter((k) => k.startsWith('script-')).length)) === 1, 'Script workspace: the Script tab is hidden and the shown mesh is drawn there');
  await page.selectOption('[data-workspace]', 'design');
  await page.waitForTimeout(300);
  ok((await pc(() => [...window.partcraft.view.overlays.keys()].filter((k) => k.startsWith('script-')).length)) === 0 && (await page.getAttribute('#pc-tab-props', 'aria-selected')) === 'true', 'back in Design: the view is the part\'s, the Properties tab is selected');

  console.log('\n== Pop out');
  await page.click('#pc-tab-script');
  await page.waitForSelector('[data-script-tab] [data-cs-pop-out]:not([hidden])');
  const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: 10000 }), page.click('[data-script-tab] [data-cs-pop-out]')]);
  await popup.waitForSelector('[data-cs-editor]');
  ok((await pc(() => window.ccShellPanels.panels().find((p) => p.id === 'right').inWindow)) === true, 'Pop out moves the panel to a window of its own');
  await popup.fill('[data-cs-editor]', 'b = 3 * 14;\ndisp(b + 1)\n');
  await popup.focus('[data-cs-editor]'); await popup.keyboard.press('F5');
  await popup.waitForTimeout(200); await idle(popup); await popup.waitForTimeout(200);
  ok(/\b43\b/.test(await consoleText(popup)), 'the editor runs scripts in that window (43)');
  ok((await popup.textContent('[data-cs-pop-out]')).trim() === 'Put back', 'its button now says Put back');
  await popup.waitForTimeout(500);
  ok(!(await popup.isVisible('[data-cs-reads-params]')), 'the tab note follows the text: this script reads no parameter');
  await page.click('.pc-tree [data-id="f3"]');
  ok((await pc(() => window.partcraft.sel?.id)) === 'f3', 'the main window\'s tree still selects (Sketch2)');
  await popup.screenshot({ path: out + '/sd-2-popout.png' });
  await Promise.all([popup.waitForEvent('close', { timeout: 10000 }).catch(() => null), popup.click('[data-cs-pop-out]')]);
  await page.waitForTimeout(400);
  ok((await pc(() => window.ccShellPanels.panels().find((p) => p.id === 'right').inWindow)) === false && await page.isVisible('[data-script-tab] [data-cs-editor]'), 'Put back docks it in the main window again, editor and all');
  await pc(() => window.ccShellPanels.reset());
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join('; ') : ''));
} catch (e) { await h.failed(e); }
await h.finish();
