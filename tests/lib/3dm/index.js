/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — cc-3dm, CadCraft's own reader for .3dm files (0.7 SU.810). DOM-free, synchronous, no dependency; the apps
 * carry byte-identical copies written by tools/3dm/sync.mjs. Map: README.md.
 *
 *   read3dm(bytes, opts) → the file's tables as a plain model (read.js)
 *   toScene(model, opts) → meshes, polylines and block placements with layers, colours and a report (scene.js)
 *   open3dm(bytes, opts) → toScene(read3dm(bytes, opts), opts)
 *   is3dm(bytes) → true when the bytes start like a .3dm file
 */
import { read3dm, UNITS } from './read.js';
import { toScene, KIND_WORDS, SURFACE_WORDS } from './scene.js';
import { ThreeDmError, LIMITS } from './util.js';
import { msg, MESSAGES } from './messages.js';

export { read3dm, toScene, UNITS, ThreeDmError, LIMITS, msg, MESSAGES, KIND_WORDS, SURFACE_WORDS };

export function open3dm(bytes, opts = {}) { return toScene(read3dm(bytes, opts), opts); }

const MAGIC = '3D Geometry File Format ';   // i18n-ignore: the file's own first line
export function is3dm(bytes) {
  if (!bytes || bytes.length < 32) return false;
  for (let i = 0; i < 24; i++) if (bytes[i] !== MAGIC.charCodeAt(i)) return false;
  return true;
}
