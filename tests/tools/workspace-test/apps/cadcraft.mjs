/* SPDX-License-Identifier: Apache-2.0 */
/**
 * CadCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.8, session ws-cadcraft): a drawing with something in it (so the Modify
 * tools are on), the tool to start and how to read the running command. No openOther: CadCraft opens every file it reads (DWG, DXF,
 * a sheet set, a PDF or a scan under the drawing) as a drawing with its own Model / sheet views, so there is no "other kind" of file
 * whose view blocks would step aside; contract point [9] is checked by hand in the log instead (a DWG opened inside each layout).
 */
export async function prepare(page) {   // a rectangle drawn at the command line, which stays in every layout
  const typed = async (text) => { await page.fill('[data-cmd-input]', text); await page.press('[data-cmd-input]', 'Enter'); await page.waitForTimeout(120); };
  if (!(await page.waitForSelector('[data-cmd-input]', { timeout: 10000 }).catch(() => null))) return false;
  await page.evaluate(() => { if (window.cadcraft?.engine?.busy) window.cadcraft.engine.escape(); });
  await typed('RECTANG'); await typed('0,0'); await typed('100,50');
  await page.waitForFunction(() => (window.cadcraft?.doc?.count?.() || 0) > 0, null, { timeout: 5000 }).catch(() => {});
  return true;
}
/** The visible button that starts a drawing tool in this layout. */
export const toolButtons = ['.ws-ribbon [data-ws-command="draw.line"]', '[data-tbx-tool="draw.line"]'];
export const toolNow = (page) => page.evaluate(() => window.cadcraft?.engine?.running || 'select');
