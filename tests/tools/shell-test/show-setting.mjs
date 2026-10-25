/* SPDX-License-Identifier: Apache-2.0 */
/**
 * show-setting.mjs — for browser tests: since 0.7 (data-shell-07) the Settings dialog shows ONE section at a time from the
 * list on its left (assets/js/app-settings.js "Sections"). A field in another section is in the page but hidden, so a test
 * clicks the list entry that holds it first, as a person would (the approach of tools/bimcraft-test/browser-edit.mjs and
 * bin/test-app-panels.mjs). Builds without the list (older releases, --inject) are left as they are.
 *
 *   import { showSetting } from '../shell-test/show-setting.mjs';
 *   await showSetting(page, 'input[name="ccCorner"]');   // the dialog must be open; switches tab too if needed
 *
 * Returns true when a section button was clicked.
 */
export async function showSetting(page, sel) {
  const found = await page.evaluate((sel) => {
    const f = document.querySelector('dialog[open] ' + sel) || document.querySelector(sel);
    document.querySelectorAll('.shell-sec-nav button[data-test-sec]').forEach((b) => b.removeAttribute('data-test-sec'));
    if (!f) return false;
    const dlg = f.closest('dialog');
    // The list shows the sections of the tab in view; a field on the other tab: pick that tab first (its own button).
    const pane = f.closest('[data-settings-pane]');
    if (dlg && pane) {
      const tab = dlg.querySelector('[data-settings-tab="' + pane.getAttribute('data-settings-pane') + '"]');
      if (tab && pane.hidden && tab.offsetParent) tab.setAttribute('data-test-sec-tab', '');
    }
    return true;
  }, sel);
  if (!found) return false;
  if (await page.$('[data-test-sec-tab]')) {
    await page.click('[data-test-sec-tab]');
    await page.evaluate(() => document.querySelectorAll('[data-test-sec-tab]').forEach((t) => t.removeAttribute('data-test-sec-tab')));
  }
  const has = await page.evaluate((sel) => {
    const f = document.querySelector('dialog[open] ' + sel) || document.querySelector(sel);
    const b = f && [...document.querySelectorAll('.shell-sec-nav button')].find((x) => x.ccSet && x.ccSet.contains(f));
    if (!b) return false;
    b.setAttribute('data-test-sec', '');
    return true;
  }, sel);
  if (!has) return false;
  await page.click('.shell-sec-nav button[data-test-sec]');
  return true;
}
