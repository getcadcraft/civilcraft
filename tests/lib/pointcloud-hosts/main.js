/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Point clouds add-on in BimCraft and CadCraft (0.9 PC.11 / PC.12, add-on API 1.4). The same engine (lib/, a byte-identical copy of lib/pointcloud) and the same
 * panels as CivilCraft's add-on (build the cloud, look at all of it in the app's 3D view, clean it, sort it into classes where the app can, a section strip); only host.js
 * differs per app. Off until the person switches it on (Settings › Add-ons). The file is read in this browser and the tiles live in this browser's own storage.
 *   window.ccPointCloud  the add-on's ctx: .cloud = the open engine cloud (lib/pointcloud openCloud: select, readRegion, forEachNode, ground, edits) or null,
 *   .placement() → { T, how } the cloud's place in the app's scene (scene = file point − cloud.origin + T), .on('cloud', fn), .view (the 3D layer), .host
 */
import * as PC0 from './lib/index.js';
import * as hostMod from './host.js';
import { wrapPC } from './common.js';
import { createCtx } from './ctx.js';
import { ensureStyle, removeStyle, el } from './ui.js';
import { createCloudView } from './cloud-view.js';
import { mountPanel } from './cloud-panel.js';
import { mountClean } from './clean-ui.js';
import { mountSection } from './section-strip.js';

export async function activate(api) {
  PC0.configure(hostMod.engineDeps());
  const PC = wrapPC(PC0, hostMod, api.t);
  ensureStyle();
  const ctx = createCtx(api, PC);
  ctx.host = hostMod;
  ctx.app = () => hostMod.app(ctx);
  ctx.project = () => null;
  ctx.view = createCloudView(ctx);
  ctx.view.setEdl(false);   // the apps' own views draw stencil caps and overlays; eye-dome lighting stays an opt-in here
  ctx.plan = { setVisible() {}, dispose() {}, snapshot: () => null };
  ctx.placement = () => hostMod.placementOf(ctx);

  ctx.setCloud = async (cloud) => {
    ctx.cloud = cloud; ctx.surface = null; ctx.resid = null; ctx.groundResult = null;
    try { await ctx.view.setCloud(cloud); } catch (e) { ctx.cloud = null; ctx.emit('cloud', null); throw e; }
    ctx.emit('cloud', cloud);
  };
  ctx.on('edited', () => ctx.view.reload());

  const classifyMod = hostMod.ground ? await import('./classify-ui.js') : null;   // only the apps that carry the ground modules have this file
  const folds = [mountClean(ctx), classifyMod ? classifyMod.mountClassify(ctx) : null, mountSection(ctx)].filter(Boolean);
  api.ui.panelTab({
    id: 'pointcloud', title: api.t('pc.name'),
    render: (body) => {
      const root = el('div', { className: 'pc-panel', 'data-pc-panel': '' });
      body.append(root);
      mountPanel(ctx, root, { folds, plan: ctx.plan });
      const f = root.querySelector('[data-pc-file]'); if (f) f.accept = hostMod.accept;
      const pl = root.querySelector('[data-pc-plan]'); if (pl && pl.closest('label')) pl.closest('label').remove();   // no plan raster in this app
      const edl = root.querySelector('[data-pc-edl]'); if (edl) edl.checked = ctx.view.edl;
      root.querySelector('[data-pc-sec="open"] summary')?.after(el('p', { className: 'pc-note', 'data-pcx-note': '' }, api.t(hostMod.ground ? 'pcx.note.bim' : 'pcx.note.cad')));
    },
  });
  window.ccPointCloud = ctx;   // the browser test, the lab pass and other add-ons (scan to BIM) reach the open cloud here
  api.onDeactivate(() => {
    ctx.view.dispose(); removeStyle(); hostMod.dispose?.(ctx);
    if (window.ccPointCloud === ctx) delete window.ccPointCloud;
  });
}
