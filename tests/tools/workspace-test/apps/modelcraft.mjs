/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ModelCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.9, session ws-modelcraft): a scene (so the browser and the view tabs have
 * content), which tool to start and how to read the running tool. No openOther: every file
 * ModelCraft opens or imports becomes the model itself (there is no second kind of document to step aside for), so [9] is skipped.
 */
export async function prepare(page) {   // a scene (the Scenes list's own Add button), so the browser and the view tabs have one
  await page.waitForFunction(() => !!window.modelcraft?.model && !!window.ccInput, null, { timeout: 20000 }).catch(() => {});
  const ok = await page.evaluate(() => {
    const mc = window.modelcraft;
    if (!mc.model.scenes.length) document.querySelector('[data-scene-add]')?.click();
    return mc.model.scenes.length > 0;
  });
  await page.waitForTimeout(600);
  return ok;
}
/** The visible button that starts a drawing tool in this layout (the ribbon's Make tab has Move; the toolbox has Rectangle). */
export const toolButtons = ['.ws-ribbon [data-ws-command="modify.move"]', '[data-tbx-tool="draw.rect"]'];
export const toolNow = (page) => page.evaluate(() => window.modelcraft?.tools?.name || 'select');
