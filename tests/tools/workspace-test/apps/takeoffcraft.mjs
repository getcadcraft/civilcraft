/* SPDX-License-Identifier: Apache-2.0 */
/**
 * TakeoffCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.11, session ws-takeoffcraft): a plan open, the tool to start and how to
 * read it, and the other file.
 *
 * Contract point 9 in TakeoffCraft: a DWG / DXF drawing is not "another kind of file" beside the sheets — it opens AS sheets (its Model
 * and layouts), so it must stay in the layout as views: openOther opens fixtures/cad/kitchen-count.dwg, opens its K-101 sheet from the
 * layout's own place (the browser palette or the view tabs) and answers { asView: <that sheet's key> }; the test's [9] then checks the
 * layout is on and that sheet is its selected view tab (the engine follow-up, 2026-10-24: before it, this hook went on to the 3D check
 * view so the view blocks would step aside; that step is not run here any more).
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_HERE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function discardRecovery(page) {
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 }).catch(() => {});
  if (await page.evaluate(() => window.takeoffcraft?.recovery) === 'asking') {
    await page.click('[data-autosave-discard-all]').catch(() => {});
    await page.waitForFunction(() => !document.querySelector('dialog[data-autosave-dialog][open]'), null, { timeout: 5000 }).catch(() => {});
  }
}

/** The public kitchen plan sheet, open (a sheet, so the tools, the views and the browser have something to show). */
export async function prepare(page) {
  await discardRecovery(page);
  if (await page.evaluate(() => window.takeoffcraft?.files.length > 0)) return true;
  await page.setInputFiles('[data-file-pdf]', path.join(REPO_HERE, 'fixtures/pdf/kitchen-plan-sheet.pdf'));   // the input stays in the page in every layout
  const ok = await page.waitForFunction(() => window.takeoffcraft?.files.length > 0 && window.takeoffcraft.rendered() > 0, null, { timeout: 60000 }).then(() => true, () => false);
  await page.waitForTimeout(800);
  return ok;
}

/** The visible button that starts a tool in this layout (Calibrate: it needs only a sheet), or null. */
export const toolButtons = ['.ws-ribbon [data-ws-command="scale.calibrate"]', '[data-tbx-tool="scale.calibrate"]'];
export const toolNow = (page) => page.evaluate(() => window.takeoffcraft?.tool?.() || 'select');

export async function openOther(page, REPO) {
  const n = await page.evaluate(() => window.takeoffcraft.files.length);
  await page.setInputFiles('[data-file-pdf]', path.join(REPO || REPO_HERE, 'fixtures/cad/kitchen-count.dwg'));
  if (!(await page.waitForFunction((k) => window.takeoffcraft.files.length > k, n, { timeout: 60000 }).then(() => true, () => false))) return false;
  await page.waitForTimeout(800);
  const key = await page.evaluate(() => window.takeoffcraft.cad.sheets().find((s) => s.kind !== 'model')?.key || null);
  if (!key) return false;
  // open the drawing's K-101 from the layout: the browser's Sheets (Ribbon and project browser) or a view tab (Toolbox and info box)
  // 2026-11-09: Duncan's palettes sit behind an icon rail (one shows at a time, the Properties first): choose the rail's icons in turn until the drawing's sheet is on screen.
  for (const n of await page.$$eval('[data-ws-rail]', (b) => b.map((x) => x.dataset.wsRail))) {
    if (await page.evaluate((k) => { const b = document.querySelector('[data-pb-sheet="' + k + '"]') || document.querySelector('[data-ws-view="' + k + '"]'); return !!(b && b.offsetParent); }, key)) break;
    await page.click('[data-ws-rail="' + n + '"]'); await page.waitForTimeout(300);
  }
  const from = await page.evaluate((k) => {
    const b = document.querySelector('[data-pb-sheet="' + k + '"]') || document.querySelector('[data-ws-view="' + k + '"]');
    if (!b || !b.offsetParent) return null;
    b.click(); return b.matches('[data-pb-sheet]') ? 'browser' : 'tab';
  }, key);
  if (!from) return false;
  // 2026-11-09: a layout with no view tabs (Duncan: the sheets live in the browser palette) has no tab to be selected; the sheet being the open one is then the proof.
  const asView = await page.waitForFunction((k) => window.takeoffcraft.cad.info()?.sheet && document.querySelector('main.ws-on')
    && (!document.querySelector('[data-ws-drawing], [data-ws-view]') || document.querySelector('[data-ws-drawing="' + k + '"][aria-selected="true"], [data-ws-view="' + k + '"][aria-selected="true"]')), key, { timeout: 30000 }).then(() => true, () => false);
  return asView ? { asView: key } : false;
}
