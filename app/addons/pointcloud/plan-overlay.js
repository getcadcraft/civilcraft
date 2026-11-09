/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plan-overlay.js — the cloud in CivilCraft's PLAN as a raster (spec § 6): no per-point drawing. Built from the top levels of the
 * tiled cloud (the first ~300 k points in breadth-first order = the coarse levels), the lowest point in each cell shaded by height,
 * painted under the plan's own drawing through the plan's underlay hook. Rebuilt after edits.
 * PC.2: it refines on zoom. When the plan shows only a part of the cloud, a second raster of just that window (padded by a quarter on each
 * side, up to 600 k points taken from the coarse levels down, 1024 cells across) is built after the zoom settles and painted over the coarse one;
 * panning inside the padded window costs nothing, zooming in further builds a finer one. ctx.planWindow = { cell, points, box } says what is drawn.
 */
const MAX_POINTS = 300000, WINDOW_POINTS = 600000, SIDE = 1024, SETTLE_MS = 250;

export function mountPlanOverlay(ctx) {
  let img = null, box = null, visible = true, building = 0, heat = null, win = null, winBuilding = 0, winTimer = 0, winAsked = '';
  const painter = (g, v) => {
    if (!visible) return;
    if (heat && ctx.view.mode === 'residual') {   // the residual heat map: cloud minus ground, blue below, red above
      const a = v.toScreen(heat.x0, heat.y1), b = v.toScreen(heat.x1, heat.y0);
      g.save(); g.imageSmoothingEnabled = false; g.globalAlpha = 0.85; g.drawImage(heat.img, a.x, a.y, b.x - a.x, b.y - a.y); g.restore();
      return;
    }
    if (!img || !box) return;
    const a = v.toScreen(box.x0, box.y1), b = v.toScreen(box.x1, box.y0);
    g.save();
    g.imageSmoothingEnabled = false;
    g.globalAlpha = 0.9;
    g.drawImage(img, a.x, a.y, b.x - a.x, b.y - a.y);
    if (win) { const wa = v.toScreen(win.box.x0, win.box.y1), wb = v.toScreen(win.box.x1, win.box.y0); g.drawImage(win.img, wa.x, wa.y, wb.x - wa.x, wb.y - wa.y); }
    g.restore();
    wantRefine(v);
  };
  /** After the view settles: is the plan zoomed in on a part of the cloud that has no raster fine enough? Then build one for the window. */
  function wantRefine(v) {
    if (!ctx.cloud || !box) return;
    const vb = v.viewBounds(), cb = ctx.cloud.bounds;
    const vx0 = Math.max(vb.minX, cb.min[0]), vx1 = Math.min(vb.maxX, cb.max[0]), vy0 = Math.max(vb.minY, cb.min[1]), vy1 = Math.min(vb.maxY, cb.max[1]);
    if (!(vx1 > vx0 && vy1 > vy0)) return;
    const vw = vx1 - vx0, vh = vy1 - vy0, cw = cb.max[0] - cb.min[0], ch = cb.max[1] - cb.min[1];
    const need = Math.max(vw, vh) / SIDE;   // the cell the visible part would like
    const have = win && vx0 >= win.box.x0 && vx1 <= win.box.x1 && vy0 >= win.box.y0 && vy1 <= win.box.y1 ? win.cell : box.cell;
    if (!(vw * vh < 0.6 * cw * ch) || have <= need * 1.5) { clearTimeout(winTimer); winAsked = ''; return; }   // whole cloud in view, or fine enough already
    const key = [vx0, vy0, vx1, vy1].map((n) => n.toFixed(2)).join();
    if (key === winAsked) return;
    winAsked = key; clearTimeout(winTimer);
    winTimer = setTimeout(() => refine([vx0, vy0, vx1, vy1]), SETTLE_MS);
  }
  async function refine(bb) {
    const my = ++winBuilding, cloud = ctx.cloud;
    if (!cloud) return;
    const pw = (bb[2] - bb[0]) * 0.25, ph = (bb[3] - bb[1]) * 0.25, cb = cloud.bounds;
    const w = [Math.max(cb.min[0], bb[0] - pw), Math.max(cb.min[1], bb[1] - ph), Math.min(cb.max[0], bb[2] + pw), Math.min(cb.max[1], bb[3] + ph)];
    const r = await raster(cloud, w, WINDOW_POINTS, () => my !== winBuilding);
    if (!r || my !== winBuilding) return;
    win = r; ctx.planWindow = { cell: r.cell, points: r.points, box: r.box };
    invalidate();
  }
  /** The lowest point per cell over bbox [x0, y0, x1, y1], SIDE cells across the longer side, shaded by height; nodes taken in table order (coarse first). */
  async function raster(cloud, bb, limit, stale) {
    const b = cloud.bounds, o = cloud.origin, w = bb[2] - bb[0], h = bb[3] - bb[1], cell = Math.max(w, h) / SIDE || 1;
    const nx = Math.max(1, Math.ceil(w / cell)), ny = Math.max(1, Math.ceil(h / cell));
    const low = new Float32Array(nx * ny).fill(Infinity);
    let used = 0;
    for (const i of cloud.nodesIn(bb)) {
      if (used >= limit) break;
      if (!cloud.nodePoints(i)) continue;
      const r = await cloud.readNode(i, { attrs: [] });
      if (stale()) return null;
      used += r.n;
      for (let k = 0; k < r.n; k++) {
        const x = r.pos[3 * k] + o[0] - bb[0], y = r.pos[3 * k + 1] + o[1] - bb[1], z = r.pos[3 * k + 2] + o[2];
        if (x < 0 || y < 0 || x > w || y > h) continue;
        const c = Math.min(ny - 1, Math.floor(y / cell)) * nx + Math.min(nx - 1, Math.floor(x / cell));
        if (z < low[c]) low[c] = z;
      }
    }
    const cv = document.createElement('canvas');
    cv.width = nx; cv.height = ny;
    const g = cv.getContext('2d'), im = g.createImageData(nx, ny), z0 = b.min[2], zs = 1 / Math.max(b.max[2] - b.min[2], 1e-9);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const z = low[j * nx + i], q = ((ny - 1 - j) * nx + i) * 4;   // north is up
      if (z === Infinity) { im.data[q + 3] = 0; continue; }
      const t = Math.min(1, Math.max(0, (z - z0) * zs)), s = 70 + 150 * t;
      im.data[q] = s * 0.9; im.data[q + 1] = s; im.data[q + 2] = 90 + 100 * (1 - t); im.data[q + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    return { img: cv, box: { x0: bb[0], y0: bb[1], x1: bb[0] + nx * cell, y1: bb[1] + ny * cell, cell }, cell, nx, ny, points: used };
  }
  let reg = null;
  function install() {
    const gis = ctx.app() && ctx.app().gis;
    if (!gis || !gis.reg) return false;
    reg = gis.reg.underlay;
    if (!reg.includes(painter)) reg.push(painter);
    return true;
  }
  function invalidate() { const a = ctx.app(); if (a && a.view) a.view.invalidate(true); }
  async function rebuild() {
    const my = ++building, cloud = ctx.cloud;
    winBuilding++; win = null; winAsked = ''; clearTimeout(winTimer); ctx.planWindow = null;
    if (!cloud) { img = null; box = null; invalidate(); return; }
    const b = cloud.bounds;
    // the coarse levels: the first ~300 k points of the node table, 1024 cells across
    const r = await raster(cloud, [b.min[0], b.min[1], b.max[0], b.max[1]], MAX_POINTS, () => my !== building);
    if (!r || my !== building) return;
    img = r.img; box = r.box;
    ctx.planRaster = { nx: r.nx, ny: r.ny, cell: r.cell, points: r.points };
    invalidate();
  }
  function buildHeat() {
    const r = ctx.resid;
    if (!r) { heat = null; return; }
    const { x0, y0, cell, nx, ny, mean } = r.grid, tol = ctx.classTolerance || 0.15;
    const cv = document.createElement('canvas'); cv.width = nx; cv.height = ny;
    const g = cv.getContext('2d'), im = g.createImageData(nx, ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const v = mean[j * nx + i], o = ((ny - 1 - j) * nx + i) * 4;
      if (v !== v) { im.data[o + 3] = 0; continue; }
      const u = Math.max(-1, Math.min(1, v / (2 * tol)));
      im.data[o] = u < 0 ? 255 + 215 * u : 255; im.data[o + 1] = u < 0 ? 255 + 130 * u : 255 - 190 * u; im.data[o + 2] = u < 0 ? 255 : 255 - 230 * u; im.data[o + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    heat = { img: cv, x0, y0, x1: x0 + nx * cell, y1: y0 + ny * cell };
  }
  ctx.on('surface', () => { buildHeat(); invalidate(); });
  ctx.on('mode', invalidate);
  ctx.on('cloud', () => { heat = null; install(); rebuild(); });
  ctx.on('edited', () => rebuild());
  return {
    setVisible(on) { visible = on; invalidate(); },
    rebuild,
    /** The cloud's plan raster and where it sits, for the contour preview: { img (canvas), box: { x0, y0, x1, y1 } } or null. */
    snapshot() { return img && box ? { img, box } : null; },
    dispose() { building++; winBuilding++; clearTimeout(winTimer); win = null; if (reg) { const k = reg.indexOf(painter); if (k >= 0) reg.splice(k, 1); } img = null; invalidate(); },
  };
}
