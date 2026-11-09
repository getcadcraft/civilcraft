/* SPDX-License-Identifier: Apache-2.0 */
/**
 * util.js — shared helpers of the point cloud engine (0.9 PC.1+). No DOM, no app imports.
 *
 *   PcError / fail(code, data)      every error the engine throws carries `.code` (a short key the UI words) and `.data`;
 *                                   the message is the code, never a sentence for the person.
 *   throwIfAborted(signal)          AbortError with code 'aborted'
 *   configure(deps) / dep(name)     the collaborators the engine is handed (las, thin, groundClassify, groundSurface)
 *   jsonBytes / parseJson           UTF-8 JSON <-> Uint8Array
 */

export class PcError extends Error {
  constructor(code, data = null, dev = null) {
    super(dev || 'pointcloud: ' + code);   // i18n-ignore: developer message; the UI words the error from `code`
    this.name = code === 'aborted' ? 'AbortError' : 'PcError';
    this.code = code;
    this.data = data;
  }
}
export const fail = (code, data, dev) => { throw new PcError(code, data, dev); };
export const throwIfAborted = (signal) => { if (signal && signal.aborted) throw new PcError('aborted'); };
export const tick = () => new Promise((r) => setTimeout(r, 0));

const DEPS = {};
export function configure(deps = {}) { Object.assign(DEPS, deps); return Object.keys(DEPS); }
export function dep(name) {
  const d = DEPS[name];
  if (!d) fail('not_configured', { name }, 'pointcloud: configure({ ' + name + ' }) was not called');   // i18n-ignore: developer error
  return d;
}

const TE = new TextEncoder(), TD = new TextDecoder();
export const jsonBytes = (o) => TE.encode(JSON.stringify(o));
export const parseJson = (b) => JSON.parse(TD.decode(b));
export const textBytes = (s) => TE.encode(s);

/** A copy that is safe to read through typed arrays (4-byte aligned, own buffer). */
export function aligned(bytes) { return (bytes.byteOffset & 7) === 0 ? bytes : new Uint8Array(bytes); }

/** progress(fraction, phase) wrapper that tolerates null and clamps. */
export const reporter = (progress) => (f, phase) => { if (progress) progress(Math.max(0, Math.min(1, f)), phase); };

/** Octant digit of a child: bit 0 = x, bit 1 = y, bit 2 = z. */
export const MAX_DEPTH = 14;
