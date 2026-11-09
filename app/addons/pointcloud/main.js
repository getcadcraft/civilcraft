/* SPDX-License-Identifier: Apache-2.0 */
/**
 * main.js — the Point clouds (drone and scan) add-on for CivilCraft (0.9 PC.2 / PC.10, add-on API 1.4). Off until the person switches
 * it on (Settings › Add-ons). The engine (lib/, a byte-identical copy of lib/pointcloud, `node tools/pointcloud-engine/sync.mjs`) is
 * handed the app's own LAS reader, thinner and ground modules once; the add-on adds one right-panel tab. Nothing is sent anywhere:
 * the file is read in this browser and the tiles live in this browser's own storage (OPFS, else IndexedDB).
 */
import * as PC from './lib/index.js';
import * as las from '../../las.js';
import * as thin from '../../thin.js';
import * as groundClassify from '../../ground-classify.js';
import * as groundSurface from '../../ground-surface.js';
import { createCtx } from './ctx.js';
import { ensureStyle, removeStyle, el } from './ui.js';
import { createCloudView } from './cloud-view.js';
import { mountPanel } from './cloud-panel.js';
import { mountClean } from './clean-ui.js';
import { mountClassify } from './classify-ui.js';
import { mountSurface } from './surface-ui.js';
import { mountSection } from './section-strip.js';
import { mountOrtho } from './ortho-ui.js';
import { mountPlanOverlay } from './plan-overlay.js';

export async function activate(api) {
  PC.configure({ las, thin, groundClassify, groundSurface });
  ensureStyle();
  const ctx = createCtx(api, PC);
  ctx.view = createCloudView(ctx);
  const plan = mountPlanOverlay(ctx);
  ctx.plan = plan;

  /** Make `cloud` the open one (null closes it). */
  ctx.setCloud = async (cloud) => {
    ctx.cloud = cloud; ctx.surface = null; ctx.resid = null; ctx.groundResult = null;
    await ctx.view.setCloud(cloud);
    if (cloud) {
      const a = ctx.app();
      if (a && a.view && !a.project.points.length) { const b = cloud.bounds; a.view.fit({ minX: b.min[0], minY: b.min[1], maxX: b.max[0], maxY: b.max[1] }); }
    }
    ctx.emit('cloud', cloud);
  };
  ctx.on('edited', () => ctx.view.reload());
  ctx.on('surface', () => { /* residual colour mode is enabled by the panel */ });

  const folds = [mountClean(ctx), mountClassify(ctx), mountSurface(ctx), mountOrtho(ctx), mountSection(ctx)];
  api.ui.panelTab({
    id: 'pointcloud', title: api.t('pc.name'),
    render: (body) => {
      const root = el('div', { className: 'pc-panel', 'data-pc-panel': '' });
      body.append(root);
      mountPanel(ctx, root, { folds, plan });
    },
  });
  window.ccPointCloud = ctx;   // the browser test and the lab pass reach the add-on here
  api.onDeactivate(() => {
    plan.dispose(); ctx.view.dispose(); removeStyle();
    if (window.ccPointCloud === ctx) delete window.ccPointCloud;
  });
}
