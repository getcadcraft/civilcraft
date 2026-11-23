/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Land records and field walk add-on (0.11 Track LR, add-on API 1.4). The same file in every host; the app's own part is host.js.
 * Off until the person switches it on (Settings › Add-ons). The engine, the walk screen and the panel are lib/ (a byte-identical copy of
 * lib/landrecords, `node tools/landrecords/sync.mjs`). The papers it fills are data: packs/plain.json, or a pack the person opens.
 *
 * NOTHING IS SENT ANYWHERE. The device's position is read only while the walk screen is open, by this page, and is kept in the drawing's own
 * file when the person keeps the walk. There is no network call in this add-on.
 *
 * A phone opens the walk screen at once from an address ending ?fieldwalk=1 (once the add-on is on there), so a bookmark on the home screen
 * goes straight to the big button.
 *
 * A place's rules (lot minimums, legal figures, forms) are never in this add-on: a side add-on (land-rules-<place>) puts its pack on the page
 * in globalThis.ccLandRules and says so with the event 'cc-land-rules'; the panel offers what is there (0.11 LR.9).
 */
import { mountPanel } from './lib/panel.js';
import { cleanPack } from './lib/documents.js';
import { cleanRulePack } from './lib/rules.js';
import { makeHost } from './host.js';

function download(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = String(name).replace(/[\\/:*?"<>|]+/g, '_');
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

export async function activate(api) {
  const host = makeHost(api), packs = [];
  try { const c = cleanPack(await (await fetch(api.url('packs/plain.json'))).json()); if (c.ok) packs.push(c.pack); } catch (err) { api.log('the template pack did not load', err); }
  // the rule packs the side add-ons have put on the page, each cleaned once (untrusted: another add-on's data)
  const cleaned = new WeakMap();
  const rulePacks = () => (Array.isArray(globalThis.ccLandRules) ? globalThis.ccLandRules : []).map((raw) => {
    if (!raw || typeof raw !== 'object') return null;
    if (!cleaned.has(raw)) { const c = cleanRulePack(raw); cleaned.set(raw, c.ok ? c.pack : null); if (!c.ok) api.log('a rule pack on the page could not be read', c.why); }
    return cleaned.get(raw);
  }).filter(Boolean);
  const ctx = { api, host, packs, rulePacks, panel: null };
  let root = null;
  function panel() {
    if (!root) {
      root = document.createElement('div');
      root.className = 'lr-panel'; root.setAttribute('data-lr-panel', '');
      ctx.panel = mountPanel(root, { t: api.t, host, storage: api.storage, download, packs, rulePacks });
    }
    return root;
  }
  api.ui.panelTab({ id: 'land-records', title: api.t('lr.name'), render: (body) => { body.append(panel()); ctx.panel.refresh(); } });
  if (new URLSearchParams(location.search).get('fieldwalk')) {
    // the walk screen is modal: it waits its turn behind anything the app itself is asking at start-up (an unsaved drawing to restore, say)
    let tries = 0, gone = false;
    const openWhenClear = () => { if (gone) return; if (document.querySelector('dialog[open]:not([data-lr-walk])') && tries++ < 240) return void setTimeout(openWhenClear, 500); panel(); ctx.panel.openWalkView(); };
    openWhenClear();
    api.onDeactivate(() => { gone = true; });
  }
  ctx.ensure = () => { panel(); return ctx.panel; };
  window.ccLandRecords = ctx;   // the tests and a lab pass reach the add-on here
  api.onDeactivate(() => { try { ctx.panel && ctx.panel.unmount(); } catch { /* the tab is gone already */ } try { host.problems.dispose(); } catch { /* disposed with the add-on */ } if (window.ccLandRecords === ctx) delete window.ccLandRecords; });
}
