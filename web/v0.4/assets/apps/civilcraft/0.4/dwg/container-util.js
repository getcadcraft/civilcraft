/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-dwg is a standalone library; its errors and report notes are English (an app translates what it shows). */
/**
 * container-util.js — what the container readers share (cc-dwg, Apache-2.0): the "this file cannot be read" error and
 * the size check for damaged maps. Its own module so container-read.js and r2007.js import it without importing each
 * other (an import cycle: read-async.js links the reader for a worker, which needs the import graph to be a tree).
 */

export class UnsupportedDwg extends Error {}

/** Sizes read from a damaged map can be absurd: refuse anything far beyond what the file could hold. */
export function plausibleSize(n, fileLength) {
  if (!(n >= 0) || n > Math.max(1 << 26, fileLength * 64)) throw new Error('implausible size ' + n + ' (damaged map)');
  return n;
}
