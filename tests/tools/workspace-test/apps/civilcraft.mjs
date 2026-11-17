/* SPDX-License-Identifier: Apache-2.0 */
/**
 * CivilCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.12, session ws-civilcraft): the sample site opened (points, a surface),
 * a drawing tool to start (Alignment), and how to read the running tool. No openOther: every file CivilCraft opens (points, LandXML,
 * DWG/DXF linework, GIS layers) goes into the one site plan, so there is no other kind of document view to step aside for.
 */
export async function prepare(page) {
  const had = await page.evaluate(() => window.civilcraft?.project?.points?.length || 0);
  if (!had) {
    await page.evaluate(() => document.querySelector('[data-sample]')?.click());
    if (await page.waitForSelector('dialog[data-import][open]', { timeout: 15000 }).catch(() => null)) await page.click('[data-imp-ok]');
  }
  return page.waitForFunction(() => (window.civilcraft?.project?.points?.length || 0) > 0, null, { timeout: 30000 }).then(() => page.waitForTimeout(600)).then(() => true, () => false);
}
/** The visible button that starts a drawing tool in this layout. */
export const toolButtons = ['.ws-ribbon [data-ws-command="design.alignment"]', '[data-tbx-tool="design.alignment"]'];
export const toolNow = (page) => page.evaluate(() => window.civilcraft?.tool || 'select');
