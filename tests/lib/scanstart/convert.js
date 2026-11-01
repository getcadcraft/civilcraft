/* SPDX-License-Identifier: Apache-2.0 */
/**
 * convert.js — cc-scanstart: a placed sheet converted into a drawing. DOM-free (the host decodes the picture). The sheet is cleaned
 * (auto threshold, specks out) and traced by cc-raster into lines and arcs, then put where the sheet sits (place.js traceLayers).
 * Classic image processing only: no trained model, no network (the scan rule). Lettering and hatching stay on the picture.
 *
 *   convertImage(img, gt, { tol, specks, name, source }) → { layers: [GIS line layer] | [], lines, arcs, report } | throws RasterError
 *        img = { w, h, channels: 1 | 3 | 4, data } (the sheet as placed), gt = its geotransform (pixel → project)
 */
import { toGrey, threshold, despeckle, trace, MAX_TRACE_PIXELS, RasterError } from '../raster/index.js';
import { traceLayers } from './place.js';

export function rgb(img) {
  if (img.channels !== 4) return img;
  const n = img.w * img.h, out = new Uint8Array(n * 3);
  for (let i = 0; i < n; i++) { const a = img.data[i * 4 + 3] / 255; for (let c = 0; c < 3; c++) out[i * 3 + c] = Math.round(img.data[i * 4 + c] * a + 255 * (1 - a)); }
  return { ...img, channels: 3, data: out };
}

export function convertImage(img, gt, { tol = 1.5, specks = 6, name = 'Drawing from scan', source = null } = {}) {
  if (img.w * img.h > MAX_TRACE_PIXELS) throw new RasterError('trace_big', img.w + 'x' + img.h);
  const bm = threshold(toGrey(rgb(img)), { mode: 'auto' });
  despeckle(bm, { maxArea: specks });   // in place
  const r = trace(bm, { tol: Math.max(0.5, Number(tol) || 1.5) });
  return { layers: traceLayers(r, gt, { name, source }), lines: r.lines.length, arcs: r.arcs.length, report: r.report };
}
