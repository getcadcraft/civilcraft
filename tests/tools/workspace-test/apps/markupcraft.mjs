/* SPDX-License-Identifier: Apache-2.0 */
/**
 * MarkupCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.10): the public kitchen sheet opened (so the sheets, the tools and the
 * views exist), the Rectangle tool started from the layout and read back. No other-file hook: every file MarkupCraft opens is a PDF
 * whose pages become sheets (views) of the same set, so there is no "other kind of file" to step aside for; [9] is skipped.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAN = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../fixtures/pdf/kitchen-plan-sheet.pdf');

export async function prepare(page) {
  await page.evaluate(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Layout Check')); } catch (e) { /* none */ } });
  if (!(await page.waitForFunction(() => window.markupcraft?.view, null, { timeout: 30000 }).catch(() => null))) return false;
  if (await page.evaluate(() => !!window.markupcraft.view.page)) return true;
  await page.setInputFiles('[data-file]', [PLAN]);
  await page.waitForFunction(() => window.markupcraft.view.page && window.markupcraft.sheets.length, null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(800);
  return true;
}
/** The visible button that starts a drawing tool in this layout (ribbon: Mark up › Rectangle; toolbox: Rectangle). */
export const toolButtons = ['.ws-ribbon [data-ws-command="tool.rect"]', '[data-tbx-tool="tool.rect"]'];
export const toolNow = (page) => page.evaluate(() => window.markupcraft?.tool || 'select');
