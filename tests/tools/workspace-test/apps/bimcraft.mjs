/* SPDX-License-Identifier: Apache-2.0 */
/**
 * BimCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.7): what the conformance test cannot know about an app — how to get a
 * document open, which tool to start and how to read the running tool, and another kind of file to open. Every hook is optional;
 * an app without a hooks file is checked on structure only (the test says which points it skipped).
 */
import path from 'node:path';

export async function prepare(page) {   // a new two-level building, so views, tools and selection exist
  await page.evaluate(() => document.querySelector('[data-new]')?.click());   // in a layout the button may sit in a palette tab not shown
  if (!(await page.waitForSelector('dialog.bc-new', { timeout: 5000 }).catch(() => null))) return false;
  await page.fill('[data-new-name]', 'Layout check'); await page.fill('[data-new-levels]', '2'); await page.click('[data-new-ok]');
  await page.waitForFunction(() => /^New building/.test(document.querySelector('[data-status]')?.textContent || '') || !!window.bimcraftPlan?.state?.data, null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(1200);
  return true;
}
/** The visible button that starts a drawing tool in this layout, or null. */
export const toolButtons = ['.ws-ribbon [data-ws-command="roof"]', '[data-tbx-tool="roof"]'];
export const toolNow = (page) => page.evaluate(() => window.bimcraftPlan?.state?.tool || 'select');
export async function openOther(page, REPO) {   // a DWG: the layout stays, the view blocks step aside
  await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/dwg/kitchen-equipment.dwg'));
  const asked = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"]', { timeout: 2500 }).catch(() => null);
  if (asked) await asked.click();
  // any language: the drawing's own view is showing, with its name in the status line
  return page.waitForFunction(() => document.querySelector('.bc-dwg:not([hidden])') && /kitchen-equipment/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 120000 }).then(() => true, () => false);
}
