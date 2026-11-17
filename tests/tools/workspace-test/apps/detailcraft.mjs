/* SPDX-License-Identifier: Apache-2.0 */
/**
 * DetailCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.13, session ws-detailcraft): the sample building (members,
 * connections, drawings) so views, tools, the browser and selection exist; the Beam tool from the ribbon or the toolbox; the running
 * tool from window.detailcraft. No other-file hook: DetailCraft opens one kind of document (its model; an IFC file becomes members of
 * it), so point [9] has nothing to check here.
 */
export async function prepare(page) {
  await page.waitForFunction(() => !!window.detailcraft, null, { timeout: 30000 }).catch(() => {});
  const had = await page.evaluate(() => window.detailcraft?.model.state.members.length || 0);
  if (!had) {
    await page.evaluate(() => window.detailcraft.act('sample'));
    await page.waitForFunction(() => window.detailcraft.model.state.members.length > 0, null, { timeout: 30000 }).catch(() => {});
  }
  await page.evaluate(() => window.detailcraft.setTool('select'));
  await page.waitForTimeout(600);
  return true;
}
/** The visible button that starts a placing tool in this layout, or null. */
export const toolButtons = ['.ws-ribbon [data-ws-command="place.beam"]', '[data-tbx-tool="place.beam"]'];
export const toolNow = (page) => page.evaluate(() => window.detailcraft?.tool || 'select');
