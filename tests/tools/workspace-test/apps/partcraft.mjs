/* SPDX-License-Identifier: Apache-2.0 */
/**
 * PartCraft's hooks for bin/test-app-workspaces.mjs (0.7 WS.14, session ws-partcraft): a part open (the flange fixture), the tool
 * to start (Sketch with nothing picked waits for a plane: window.partcraft.tool 'sketch-plane'; Esc cancels it, as in classic) and
 * another kind of file (a manual in the Illustrate workspace: the model's view blocks step aside). PartCraft dev runs the mesh kernel.
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

export async function prepare(page) {   // the flange (tools/partcraft-test/fixtures.mjs), built, nothing picked
  const F = await import(pathToFileURL(path.join(REPO, 'tools/partcraft-test/fixtures.mjs')).href);
  if (!(await page.waitForFunction(() => !!window.partcraft?.openText && !!window.partcraft?.host, null, { timeout: 30000 }).catch(() => null))) return false;
  await page.evaluate(() => { if (window.partcraft.workspace !== 'design') window.partcraft.setWorkspace('design'); });
  await page.evaluate((t) => window.partcraft.openText(t, 'Flange.partcraft.json'), JSON.stringify(F.flange().part));
  await page.evaluate(() => window.partcraft.built()).catch(() => {});
  await page.waitForTimeout(600);
  return true;
}
/** The visible button that starts a tool in this layout: Sketch (Features tab's first group; the toolbar's Sketch group in the toolbox). */
export const toolButtons = ['.ws-ribbon [data-ws-command="sketch.new"]', '[data-tbx-tool="sketch.new"]'];
export const toolNow = (page) => page.evaluate(() => window.partcraft?.tool || 'select');
export async function openOther(page) {   // a manual (Illustrate) from the open part: the layout stays, the model's view blocks step aside
  await page.evaluate(() => window.ccInput.run('ws.illustrate'));
  if (!(await page.waitForFunction(() => window.partcraft.workspace === 'illustrate', null, { timeout: 10000 }).then(() => true, () => false))) return false;
  await page.evaluate(() => document.querySelector('[data-il-new="part"]')?.click());
  return page.waitForFunction(() => !!window.partcraft.WS.getWorkspace('illustrate')._state.doc, null, { timeout: 60000 }).then(() => true, () => false);
}
