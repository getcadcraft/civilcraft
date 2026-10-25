/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.js — cc-3dm's error class and the caps on untrusted files. DOM-free; imports only messages.js.
 *
 *   ThreeDmError(code, message)   codes: not_3dm | damaged | too_big | unsupported
 *   damaged(key, fills) · tooBig(key, fills) · unsupported(key, fills)
 *   LIMITS                        caps (a caller may lower them through opts.limits)
 */
import { msg } from './messages.js';

export class ThreeDmError extends Error {
  constructor(code, message) {
    super(message || msg('ccdm.' + code));
    this.name = 'ThreeDmError';
    this.code = code;
  }
}

export const damaged = (key, fills) => new ThreeDmError('damaged', msg('ccdm.damaged', { reason: msg(key, fills) }));
export const tooBig = (key, fills) => new ThreeDmError('too_big', msg('ccdm.too_big', { what: msg(key, fills) }));
export const unsupported = (key, fills) => new ThreeDmError('unsupported', msg('ccdm.unsupported', { what: msg(key, fills) }));

/** Caps for untrusted files. */
export const LIMITS = {
  fileBytes: 2 ** 31,     // 2 GB
  items: 1 << 26,         // items in one array (67 M)
  unpacked: 1 << 30,      // one compressed buffer, unpacked
  depth: 32,              // nesting: poly curves in poly curves, blocks in blocks
  objects: 1 << 22,       // objects in one file (4 M)
  triangles: 1 << 25,     // triangles the tessellator may make for one file (33 M)
};

export function limitsOf(opts) { return opts && opts.limits ? { ...LIMITS, ...opts.limits } : LIMITS; }
