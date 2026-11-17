// SPDX-License-Identifier: Apache-2.0
/**
 * drawing-share.mjs: how much of the window the drawing gets (BK.35), measured in a real page.
 *
 * DEFINITION. Drawing share = (number of window pixels where the drawing is the topmost thing) / (window width x window height).
 *   - "The drawing" is every view box of the app: an element that directly holds a visible <canvas> at least MIN_VIEW px wide and
 *     high (the plan, the 3D view, each of four views). What sits inside a view box and belongs to the view counts as drawing: its
 *     canvas layers and the small heads-up marks drawn over it (view cube, coordinate read-out, display mode), because the drawing
 *     shows around them and they move with the view.
 *   - Anything of the layout does NOT count, even when it floats over a view box: bars, tool rows, ribbons, toolboxes, palettes,
 *     panels, panel edge tabs, tab strips, status bars, dialogs (CHROME below).
 *   - The window is the browser viewport (1920 x 1080 in the BK.35 test); the browser's own frame is not part of it.
 *   It is an AREA share, read by asking the page what is on top at every STEP-th pixel (document.elementFromPoint), so it is true
 *   to what a person sees whatever the layout does with z-order. Height share alone (app-fit.js) is a different number.
 *
 * measureShare(page, {step}) -> { share, hits, points, views: [{x, y, w, h}], rect: {x, y, w, h} (bounding box of the drawing pixels) }
 */
export const CHROME = '.ws-top, .ws-bottom, .ws-region, .ws-block, .ws-palettes, .ws-rail, .ws-ribbon, .tr-toolrows, .tbx-toolbox, .vw-menubar, .vw-palette, .shell-tb, .shell-grip, .shell-panel-tabs, .shell-ptab, .app-bar, [role="toolbar"], [role="menubar"], [role="tablist"], aside, header, footer, dialog, .ccp-panel';
export const MIN_VIEW = 120;

export function measureShare(page, opts = {}) {
  return page.evaluate(({ CHROME, MIN_VIEW, step }) => {
    const W = window.innerWidth, H = window.innerHeight;
    const shown = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width >= MIN_VIEW && r.height >= MIN_VIEW && s.visibility !== 'hidden' && s.display !== 'none'; };
    const boxes = new Set();
    for (const c of document.querySelectorAll('main canvas')) if (shown(c) && !c.closest(CHROME)) boxes.add(c.parentElement);
    const inView = (e) => {
      for (let n = e; n && n !== document.body; n = n.parentElement) {
        if (boxes.has(n)) return true;
        if (n.matches(CHROME)) return false;
      }
      return false;
    };
    let hits = 0, points = 0, x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
      points++;
      const e = document.elementFromPoint(x, y);
      if (e && inView(e)) { hits++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    }
    const views = [...boxes].map((b) => { const r = b.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; });
    return { share: points ? hits / points : 0, hits, points, views, rect: hits ? { x: Math.floor(x0 - step / 2), y: Math.floor(y0 - step / 2), w: Math.ceil(x1 - x0 + step), h: Math.ceil(y1 - y0 + step) } : null, window: { w: W, h: H } };
  }, { CHROME, MIN_VIEW, step: opts.step || 4 });
}
