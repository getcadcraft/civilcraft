/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — cc-exr's front door: high-dynamic-range pictures and colour tables for the renderer (0.7 XF.5).
 * DOM-free, synchronous, no dependencies; runs on pages, in workers and in Node.
 *
 *   import { readExr, writeExr, readHdr, writeHdr, readCube, applyCube, readHdrImage } from './exr/index.js';
 *
 * readHdrImage(bytes) picks EXR or Radiance .hdr by the first bytes and returns { width, height, data: Float32Array RGBA
 * (linear, top row first), format, notes } — what an environment light or a picture viewer wants.
 */
import { readExr, writeExr, isExr, layersOf, rgbaOf, COMPRESSIONS } from './exr.js';
import { readHdr, writeHdr, isHdr } from './hdr.js';
import { readCube, writeCube, applyCube, applyCubeToImage, identityCube } from './cube.js';
import { ExrError, LIMITS, halfToFloat, floatToHalf } from './util.js';
import { msg, MESSAGES } from './messages.js';

export { readExr, writeExr, isExr, layersOf, rgbaOf, COMPRESSIONS, readHdr, writeHdr, isHdr, readCube, writeCube, applyCube,
  applyCubeToImage, identityCube, ExrError, LIMITS, halfToFloat, floatToHalf, msg, MESSAGES };

export function readHdrImage(bytes, opts = {}) {
  const b = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  if (isExr(b)) {
    const e = readExr(b, opts);
    const img = rgbaOf(e, opts);
    return { ...img, format: 'exr', notes: e.notes, incomplete: e.incomplete };
  }
  if (isHdr(b)) {
    const h = readHdr(b, opts);
    const data = new Float32Array(h.width * h.height * 4);
    for (let i = 0, o = 0; i < h.width * h.height; i++, o += 4) {
      data[o] = h.data[i * 3]; data[o + 1] = h.data[i * 3 + 1]; data[o + 2] = h.data[i * 3 + 2]; data[o + 3] = 1;
    }
    return { width: h.width, height: h.height, data, format: 'hdr', exposure: h.exposure, notes: [], incomplete: false };
  }
  throw new ExrError('not_exr', msg('ccexr.not_exr'));
}
