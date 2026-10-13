/* SPDX-License-Identifier: Apache-2.0 */
/**
 * viewimage.js — save a three.js view as a PNG, at its size on screen or twice it (0.4 1.7). Canonical here
 * (modelcraft/dev, owner `model`); byte-identical copies in every 3D app's dev/ (bimcraft, civilcraft, detailcraft,
 * partcraft, takeoffcraft, cadcraft/dev/m3d), kept by `node tools/modelcraft-test/viewimage-sync.mjs [--check]`.
 * It imports nothing: it uses the renderer it is given, so it fits any app's viewer.
 *
 *   viewPng({ renderer, render, scale = 1, overlays = [], drawOverlay = null }) → Promise<Blob> (image/png)
 *     renderer          the view's THREE.WebGLRenderer; its canvas is what is saved
 *     render()          draws one frame (the app's own call: renderer.render(scene, camera), plus anything it does)
 *     scale             1 = the view's size on screen in device pixels; 2 = twice that (capped at 8192 px a side)
 *     overlays          2D canvases laid over the view (marks, labels), stretched to the image
 *     drawOverlay(g, r) instead of `overlays`: draw the marks into context g at r device pixels per CSS pixel, so
 *                       they stay sharp at 2×
 *   viewImage({ …the same…, type = 'image/png', quality }) → Promise<Blob> of that type ('image/jpeg' for a PDF)
 *   pngName(base, scale) → "base.png" or "base@2x.png"
 *
 * The renderer's pixel ratio is raised for one frame and put back, and the view is drawn again as it was.
 */
export function viewPng(o) { return viewImage({ ...o, type: 'image/png' }); }   // i18n-ignore: a media type

export async function viewImage({ renderer, render, scale = 1, overlays = [], drawOverlay = null, type = 'image/png', quality }) {   // i18n-ignore: a media type
  const canvas = renderer.domElement, pr0 = renderer.getPixelRatio();
  const w = canvas.clientWidth || Math.round(canvas.width / pr0), h = canvas.clientHeight || Math.round(canvas.height / pr0);
  let pr = pr0 * (scale > 0 ? scale : 1);
  pr = Math.min(pr, 8192 / Math.max(w, h, 1));
  const out = document.createElement('canvas');
  try {
    renderer.setPixelRatio(pr);
    renderer.setSize(w, h, false);
    render();
    out.width = canvas.width; out.height = canvas.height;
    const g = out.getContext('2d');
    g.drawImage(canvas, 0, 0);   // read in the same task as the render, so it works without preserveDrawingBuffer
    if (drawOverlay) { g.save(); drawOverlay(g, pr); g.restore(); }
    else for (const o of overlays) if (o) g.drawImage(o, 0, 0, out.width, out.height);
  } finally {
    renderer.setPixelRatio(pr0);
    renderer.setSize(w, h, false);
    render();
  }
  return new Promise((ok, fail) => out.toBlob((b) => (b ? ok(b) : fail(new Error('toBlob'))), type, quality));   // i18n-ignore: callers say what failed
}

/** The file name for an image of `base` at `scale`. */
export const pngName = (base, scale = 1) => String(base || 'view') + (scale > 1 ? '@' + scale + 'x' : '') + '.png';   // i18n-ignore: file names
