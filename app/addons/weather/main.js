/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Weather files add-on (0.11 Track WX, add-on API 1.4). The same file in every host; the app's own part is host.js.
 * Off until the person switches it on (Settings › Add-ons). The reader, the figures and the panel are lib/ (a byte-identical copy of
 * lib/weather, `node tools/weather/sync.mjs`). The weather itself is content: sets.json names the sets and where they are served from (the CDN
 * first, this site's copy second); an index is fetched when the panel opens and a station's year only when something needs the hours.
 * Nothing about the model or the person is sent: the requests are plain file downloads with no cookies.
 */
import { mountPanel } from './lib/panel.js';
import { makeHost } from './host.js';

/** text or a Blob (the viewer's pictures) */
function download(name, text, type = 'text/plain') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 30000);
}

export async function activate(api) {
  const config = await (await fetch(api.url('sets.json'))).json();
  const host = makeHost(api);
  const ctx = { api, host, config, panel: null };
  // one panel, made when the tab first opens or when a link asks for a view before that (WX.10)
  let root = null;
  function panel() {
    if (!root) {
      root = document.createElement('div');
      root.setAttribute('data-wx-panel', '');
      ctx.panel = mountPanel(root, { t: api.t, storage: api.storage, download, site: host.site, actions: host.actions, config });
    }
    return root;
  }
  api.ui.panelTab({
    id: 'weather', title: api.t('wx.name'),
    render: (body) => { body.append(panel()); },
  });
  const code = new URLSearchParams(location.search).get('wx');
  if (code) { panel(); ctx.panel.openShared(code).catch(() => {}); }
  window.ccWeather = ctx;   // the tests and a lab pass reach the add-on here
  api.onDeactivate(() => { try { ctx.panel && ctx.panel.unmount(); } catch { /* the tab is gone already */ } host.off(); if (window.ccWeather === ctx) delete window.ccWeather; });
}
