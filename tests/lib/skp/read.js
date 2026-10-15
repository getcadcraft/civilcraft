/* SPDX-License-Identifier: Apache-2.0 */
/**
 * read.js — cc-skp's front door (docs/SKP-LIB-SPEC.md): reads a SketchUp .skp file into one plain model.
 * Header layout from OpenSKP (MIT, © 2024-2026 Ahsan Mehmood, see NOTICE: docs/BINARY_FORMAT.md §1.1, legacy.ts);
 * the code is ours. DOM-free, no dependencies.
 *
 *   import { readSkp, sniffSkp } from './read.js';
 *   const skp = await readSkp(bytes, { onProgress, signal });   // bytes: Uint8Array (or ArrayBuffer)
 *   sniffSkp(bytes) → { version, major, bodyStart, container: 'vff' | 'legacy' }   (header only; throws SkpError not_skp)
 *
 * Every file starts with UTF-16LE string records, each "FF FE FF" + a length + that many UTF-16 code units
 * (length: u8; 0xFF → u16 follows; 0xFFFF → u32 follows):
 *   record 1  "SketchUp Model"
 *   record 2  "{25.0.575}"  (the version, in braces)
 * Then SketchUp 2021+ (VFF) writes "VFF" and a few bytes and a ZIP archive (local header "PK\3\4"); older files
 * (≤ 2020, "legacy") carry a 16-byte id and the MFC object stream (header records naming CVersionMap, …).
 *
 * THE HEADER OBJECT handed to the container readers (vff.js readVff, legacy.js readLegacy) — exactly:
 *   {
 *     version:   '17.0.18899'   // record 2 without the braces
 *     major:     17              // integer before the first dot (2013 files say 13; SketchUp 3–8 say 3–8)
 *     bodyStart: 52              // byte offset just past record 2 (where the 16-byte id / "VFF" begins)
 *   }
 * legacy.js exports `async function readLegacy(bytes, header, opts)` (opts = this call's { onProgress, signal }) and
 * returns { materials, layers, defs, root, thumbnail, units, notes } (the model below without format/container/version/
 * major/counts — read.js adds those); it is loaded with import() on first use, so read.js works before it exists.
 *
 * Result (all coordinates in inches, Z up):
 *   { format: 'skp', container, version, major, materials, layers, defs, root, thumbnail, units, notes, counts }
 * See the spec for each field. Errors: SkpError with code not_skp | too_new | unsupported | damaged | too_big.
 */
import { SkpError, LIMITS } from './util.js';
import { msg } from './messages.js';
import { readVff } from './vff.js';

const MAGIC = 'SketchUp Model';

/** One "FF FE FF" string record at p → { text, end } or null. */
function stringRecord(b, p) {
  if (p + 4 > b.length || b[p] !== 0xff || b[p + 1] !== 0xfe || b[p + 2] !== 0xff) return null;
  let n = b[p + 3], q = p + 4;
  if (n === 0xff) {
    if (q + 2 > b.length) return null;
    n = b[q] | (b[q + 1] << 8); q += 2;
    if (n === 0xffff) {
      if (q + 4 > b.length) return null;
      n = (b[q] | (b[q + 1] << 8) | (b[q + 2] << 16) | (b[q + 3] << 24)) >>> 0; q += 4;
    }
  }
  if (n > 4096 || q + n * 2 > b.length) return null;
  let text = '';
  for (let i = 0; i < n; i++) text += String.fromCharCode(b[q + i * 2] | (b[q + i * 2 + 1] << 8));
  return { text, end: q + n * 2 };
}

/** Read the header records → { version, major, bodyStart, container }. */
export function sniffSkp(input) {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input);
  const notSkp = () => new SkpError('not_skp', msg('ccskp.not_skp'));
  const r1 = stringRecord(b, 0);
  if (!r1 || r1.text !== MAGIC) {
    // The start of "SketchUp Model" but the file ends inside it: a cut-off SketchUp file, not some other file.
    const head = [0xff, 0xfe, 0xff, MAGIC.length];
    for (let i = 0; i < MAGIC.length; i++) head.push(MAGIC.charCodeAt(i), 0);
    if (!r1 && b.length >= 8 && b.length < head.length && b.every((x, i) => x === head[i])) {
      throw new SkpError('damaged', msg('ccskp.damaged', { reason: msg('ccskp.damaged.header_cut') }));
    }
    throw notSkp();
  }
  const r2 = stringRecord(b, r1.end);
  const m = r2 && /^\{(\d+)\.([\d.]*)\}$/.exec(r2.text);
  if (!m) throw new SkpError('damaged', msg('ccskp.damaged', { reason: msg('ccskp.damaged.no_version') }));
  const version = m[1] + (m[2] ? '.' + m[2] : '');
  const major = parseInt(m[1], 10);
  const bodyStart = r2.end;
  // VFF: "VFF" right after the version, or a ZIP local header within the next few dozen bytes.
  let container = 'legacy';
  if (b[bodyStart] === 0x56 && b[bodyStart + 1] === 0x46 && b[bodyStart + 2] === 0x46) container = 'vff';
  else {
    for (let i = bodyStart, end = Math.min(b.length - 4, bodyStart + 64); i <= end; i++) {
      if (b[i] === 0x50 && b[i + 1] === 0x4b && b[i + 2] === 3 && b[i + 3] === 4) { container = 'vff'; break; }
    }
  }
  return { version, major, bodyStart, container };
}

let legacyModule = null;
async function loadLegacy(header) {
  if (!legacyModule) {
    try {
      legacyModule = await import('./legacy.js');
    } catch (e) {
      // Only "the module is not there" means unsupported; a broken legacy.js must show its real error.
      const missing = e && (e.code === 'ERR_MODULE_NOT_FOUND' || /Failed to fetch dynamically imported module|Cannot find module|error loading dynamically imported module/i.test(e.message || ''));
      if (!missing) throw e;
      throw new SkpError('unsupported', msg('ccskp.unsupported.pre2021', { version: header.version }));
    }
  }
  if (typeof legacyModule.readLegacy !== 'function') {
    throw new SkpError('unsupported', msg('ccskp.unsupported.pre2021', { version: header.version }));
  }
  return legacyModule.readLegacy;
}

/**
 * Read a .skp file. opts: { onProgress({ stage, done, total }), signal (AbortSignal) }.
 * Throws SkpError (see the header); an aborted read throws the signal's reason.
 */
export async function readSkp(input, opts = {}) {
  let bytes;
  if (input instanceof Uint8Array) bytes = input;
  else if (input instanceof ArrayBuffer) bytes = new Uint8Array(input);
  else if (ArrayBuffer.isView(input)) bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
  else throw new TypeError('readSkp needs a Uint8Array or ArrayBuffer');   // i18n-ignore: diagnostic (a caller's bug)
  if (bytes.length > LIMITS.fileBytes) throw new SkpError('too_big', msg('ccskp.too_big.file', { size: Math.round(LIMITS.fileBytes / 1048576) + ' MB' }));

  const sniff = sniffSkp(bytes);
  const header = { version: sniff.version, major: sniff.major, bodyStart: sniff.bodyStart };
  let body;
  if (sniff.container === 'vff') {
    body = await readVff(bytes, header, opts);
  } else {
    const readLegacy = await loadLegacy(header);
    body = await readLegacy(bytes, header, opts);
  }

  const counts = { defs: body.defs.length, faces: 0, edges: 0, insts: 0, materials: body.materials.length, layers: body.layers.length };
  for (const d of body.defs) { counts.faces += d.faces.length; counts.edges += d.edges.length; counts.insts += d.insts.length; }
  return {
    format: 'skp',
    container: sniff.container,
    version: sniff.version,
    major: sniff.major,
    materials: body.materials,
    layers: body.layers,
    defs: body.defs,
    root: body.root,
    thumbnail: body.thumbnail ?? null,
    units: body.units ?? { length: null },
    notes: body.notes ?? [],
    counts,
  };
}

export { SkpError };
