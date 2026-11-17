// SPDX-License-Identifier: Apache-2.0
// SC.8: the shell's browser suites (bin/test-app-*.mjs, test-shell-*.mjs, test-workspace-arrange.mjs) wait for "networkidle" after a page load.
// SuperCad Studio keeps frames and account calls open, so the network never goes idle. This makes goto() and reload() of a /lab/supercadcraft page
// wait for "load" and then for the window's own ready mark ([data-sc-ready]) instead; every other page behaves as before. Also starts SuperCad Studio with Home off
// (a first visit shows Home over the window, which would catch the suites' clicks).
export function patchIdle(page) {
  // Home (the intro screen) covers the window on a first visit and would catch every click of a suite written for the single apps: start with it off, as the Super suites do
  page.context().addInitScript(() => { try { if (!localStorage.getItem('cc-super-home')) localStorage.setItem('cc-super-home', 'off'); } catch { /* no storage */ } }).catch(() => {});
  const sup = u => /\/lab\/supercadcraft(?:[/?#]|$)/.test(String(u));
  for (const m of ['goto', 'reload']) {
    const f = page[m].bind(page), at = m === 'goto' ? 1 : 0;
    page[m] = async (...a) => {
      const o = a[at] || {};
      if (!(o.waitUntil === 'networkidle' && sup(m === 'goto' ? a[0] : page.url()))) return f(...a);
      a[at] = { ...o, waitUntil: 'load' };
      const r = await f(...a);
      await page.waitForSelector('[data-sc-ready]', { timeout: 60000 }).catch(() => {});
      return r;
    };
  }
  return page;
}
