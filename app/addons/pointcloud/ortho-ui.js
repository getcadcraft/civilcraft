/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ortho-ui.js — drape a drone orthomosaic on the ground and the plan (0.9 PC.13). CivilCraft already turns a georeferenced picture
 * (a GeoTIFF, or a PNG / JPEG with its world file) into a map layer, paints it under the plan and drapes the visible map layers on the
 * 3D surface (gis-map-ui.js; the 3D view's "Map" colouring). This fold is the way in from the point cloud: it hands the files to that
 * same opener (no second reader), then checks the picture really lies over the cloud, and switches the 3D view to the map colouring.
 *   - the picture's corners come from the layer the opener made (its geotransform), compared with the cloud's bounds: how much of the
 *     cloud the picture covers, and a plain warning when it covers none (the usual cause: a different coordinate system)
 *   - nothing is uploaded; the picture is kept inside the project file like any other map layer (the opener's limit: 25 MB after the
 *     picture is re-encoded; a file over 200 MB is refused by the GeoTIFF reader; a very large mosaic is reduced to 16 megapixels)
 */
import { el, field } from './ui.js';
import { fmt } from './ctx.js';

export function mountOrtho(ctx) {
  const t = ctx.t;
  const fileIn = el('input', { type: 'file', multiple: true, accept: '.tif,.tiff,.png,.jpg,.jpeg,.pgw,.pngw,.jgw,.jpgw,.tfw,.tifw,.wld,.prj', 'data-pc-ortho-file': '' });
  const out = el('div', { className: 'pc-note', 'data-pc-ortho-out': '', role: 'status' });
  const show3d = el('button', { type: 'button', className: 'btn-line', disabled: true, 'data-pc-ortho-3d': '' }, t('pc.o.show3d'));
  ctx.on('cloud', () => { show3d.disabled = !ctx.cloud || !hasPicture(); });

  const maps = () => { const p = ctx.project(); return (p && p.state && p.state.gis && p.state.gis.maps) || []; };
  const hasPicture = () => maps().some((m) => m.kind === 'image' && m.visible !== false);
  /** [minX, minY, maxX, maxY] of a picture layer from its geotransform (a0..a5, width, height). */
  const bbox = (m) => {
    const xs = [], ys = [];
    for (const [c, r] of [[0, 0], [m.width, 0], [m.width, m.height], [0, m.height]]) { xs.push(m.a0 + c * m.a1 + r * m.a2); ys.push(m.a3 + c * m.a4 + r * m.a5); }
    return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  };
  /** The share of the cloud's plan area the picture covers (0..1). Exposed for the test. */
  ctx.orthoCoverage = (m) => {
    const b = ctx.cloud.bounds, p = bbox(m);
    const w = Math.max(0, Math.min(b.max[0], p[2]) - Math.max(b.min[0], p[0])), h = Math.max(0, Math.min(b.max[1], p[3]) - Math.max(b.min[1], p[1]));
    const area = (b.max[0] - b.min[0]) * (b.max[1] - b.min[1]);
    return area > 0 ? (w * h) / area : 0;
  };

  async function load(files) {
    const app = ctx.app();
    if (!app || !app.gis || !files.length) return;
    out.textContent = t('pc.o.reading');
    const before = new Set(maps().map((m) => m.id));
    try {
      await app.gis.open(files);
    } catch (e) { out.textContent = String((e && e.message) || e); return; }
    const added = maps().filter((m) => !before.has(m.id) && m.kind === 'image');
    if (!added.length) { out.textContent = t('pc.o.none'); return; }
    const m = added[added.length - 1];
    ctx.orthoLayer = m.id;
    show3d.disabled = !ctx.cloud;
    if (!ctx.cloud) { out.textContent = t('pc.o.added.nocloud', { name: m.name }); return; }
    const cov = ctx.orthoCoverage(m);
    out.textContent = cov < 0.01 ? t('pc.o.nooverlap', { name: m.name })
      : t('pc.o.added', { name: m.name, w: fmt(m.width, 0), h: fmt(m.height, 0), pct: fmt(cov * 100, 0) }) + (m.crsCode ? '' : ' ' + t('pc.o.nocrs'));
    if (cov >= 0.01) await showOn3D();
  }

  /** Switch the 3D view to the map colouring (the drape) and make sure it looks at the ground. */
  async function showOn3D() {
    const app = ctx.app();
    await ctx.view.attach();
    const sel = document.querySelector('[data-3d-color]');
    if (sel && sel.value !== 'map') { sel.value = 'map'; sel.dispatchEvent(new Event('change', { bubbles: true })); }
    if (app && app.view) app.view.invalidate(true);
    ctx.status(ctx.surface ? t('pc.o.on3d') : t('pc.o.needground'));
  }
  fileIn.addEventListener('change', () => { const f = [...(fileIn.files || [])]; fileIn.value = ''; load(f); });
  show3d.addEventListener('click', () => showOn3D());

  return el('details', { 'data-pc-sec': 'ortho' }, el('summary', {}, t('pc.sec.ortho')),
    el('p', { className: 'pc-note' }, t('pc.o.what')), field(t('pc.o.file'), fileIn, t('pc.o.file.hint')), el('div', { className: 'pc-row' }, show3d), out);
}
