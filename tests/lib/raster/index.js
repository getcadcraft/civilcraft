/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — format names. */
/**
 * cc-raster — scanned drawings (0.7 LC.6): readers (TIFF, PNG, JPEG), clean-up, auto trace, snapping. DOM-free; the same files
 * run in the apps and in Node. Everything here is classic image processing: no trained model, no network, nothing sent anywhere.
 *
 *   sniffScan(bytes)  → 'tiff' | 'png' | 'jpeg' | null          (by content, never by name)
 *   scanPages(bytes)  → number of pages (TIFF may have several; the rest have one)
 *   await readScan(bytes, page = 0, { decodeJpeg }) → { w, h, channels, data, bilevel, dpi?, format }
 *        decodeJpeg(bytes) → { w, h, channels, data } is the host's own decoder for the JPEG files ours does not read (progressive):
 *        the browser passes one made with createImageBitmap
 */
import { isTiff, readTiff, tiffInfo } from './tiff.js';
import { isPng, readPng } from './png.js';
import { isJpeg, readJpeg } from './jpeg.js';
import { RasterError, refuse, bytesOf } from './util.js';

export * from './util.js';
export { isTiff, readTiff, tiffInfo } from './tiff.js';
export { isPng, pngSize, readPng, writePng } from './png.js';
export { isJpeg, jpegSize, readJpeg } from './jpeg.js';
export { decodeG4 } from './ccitt.js';
export { toGrey, otsu, flatten, threshold, despeckle, findSkew, rotateGrey, rotateBitmap, rotateImage, crop, paintPolygon, paintRect, eraseRect, erasePolygon, bitmapToGrey, greyToBitmap, label } from './image.js';
export { trace } from './trace.js';
export { RasterSnap, snapPointsOf } from './snap.js';

export function sniffScan(bytes) {
  const b = bytesOf(bytes);
  return isTiff(b) ? 'tiff' : isPng(b) ? 'png' : isJpeg(b) ? 'jpeg' : null;
}
export function scanPages(bytes) {
  const b = bytesOf(bytes);
  return isTiff(b) ? tiffInfo(b).pages.length : 1;
}
export async function readScan(bytes, page = 0, { decodeJpeg = null } = {}) {
  const b = bytesOf(bytes), kind = sniffScan(b);
  if (kind === 'tiff') return { ...readTiff(b, page), format: 'tiff' };
  if (page) refuse('page', String(page));
  if (kind === 'png') return { ...(await readPng(b)), format: 'png' };
  if (kind === 'jpeg') {
    try { return { ...readJpeg(b), bilevel: false, format: 'jpeg' }; }
    catch (e) {
      if (decodeJpeg && e instanceof RasterError && (e.key === 'progressive' || e.key === 'jpeg')) return { ...(await decodeJpeg(b)), bilevel: false, format: 'jpeg' };
      throw e;
    }
  }
  return refuse('not_scan');
}
