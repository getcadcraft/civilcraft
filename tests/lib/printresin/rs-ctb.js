/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-ctb.js — the Chitubox .ctb writer, ONLY the layout the one published document describes (the older "version 2" file with magic 0x12fd0086). No DOM.
 * The container (header, ExtConfig, ExtConfig2, previews, layer table) is shared with rs-cbddlp.js (assembleChitu); this file adds the layer encoding.
 *
 * CLEAN ROOM. Written from format DOCUMENTATION only, never from source code; no GPL / AGPL / LGPL implementation was opened or paraphrased.
 * SOURCES:
 *   1. https://github.com/cbiffle/catibo/blob/master/doc/cbddlp-ctb.adoc — prose/table document in a BSD-2-Clause repository (only the .adoc was read).
 *      It documented: the ctb magic 0x12fd0086, the shared header tables, 7-bit pixels, the RLE7 run encoding (value in bits 6:0, run flag bit 7, a 1–4 byte
 *      big-endian run length marked by the top bits of its first byte), "encryption is disabled if encryption_key is 0", and the "86" cipher given in the
 *      document as two formulas in prose (keystream X[0], X[n+1], and C[n] = P[n] xor X[n], key and layer index as IV).
 *
 * WHAT IS NOT BUILT, AND WHY: the document describes ONE ctb layout (header "version" always 2). Later CTB versions (3, 4, 5 and the printers that need
 * them, per other sites' remarks) are not described by any prose document found; the only descriptions are source code, which is off limits. So nothing for
 * them is written and no field is invented. SPEC-GAP: whether a given printer (including those named below) accepts version 2 / unencrypted files is not
 * stated by the document beyond "tested in practice with the Creality LD-002R".
 *
 * HONESTY: nothing written here has been loaded on a printer. It is read back by our own reader only (tools/printresin/ctb-read.mjs, from the same document).
 * We do not claim any printer accepts it.
 *
 *   CTB = { id, name, ext, mime, options }
 *   writeCtb(sliced, meta) → Promise<Uint8Array>      sliced / meta as in rs-goo.js; units as rs-cbddlp.js
 *   options (meta.options.<id>; wrong value throws "ctb: option …"; missing → default):
 *     cipherConstant 'd8a83423' | 'd8a83424'   default 'd8a83423': the cipher's additive constant (the document says …24, two working implementations use …23; only matters with encryption on)
 *     encryption  'off' | 'on'            default 'off': encryption_key 0, which the document says the proprietary software accepts as "no encryption".
 *                                         'on' applies the document's "86" cipher with a non-zero key written in the header. It is obfuscation per the
 *                                         document; offered only because a document describes it fully.
 *     projection  'mirrored' | 'normal'   default 'mirrored'
 *     resType     'f32' | 'u32'           default 'f32' (the document types the resolution as f32; may be a typo — see rs-cbddlp.js SPEC-GAP)
 *
 * SPEC-GAPs / UNVERIFIED beyond those in rs-cbddlp.js:
 *   - SPEC-GAP: the document does not give the byte order inside a 32-bit cipher word; little-endian (the file's general rule) is used.
 *   - SPEC-GAP: how a layer's data_len relates to cipher padding: the document says pad, process, truncate, so data_len is the unpadded length.
 *   - SPEC-GAP: the grey 0..255 → 0..127 mapping is not given; round(v·127/255). A pixel that is nonzero but rounds to 0 is kept at 1.
 *   - SPEC-GAP: a run of length 1 is written as a single pixel (flag clear). Whether a run of 2+ must use the run form is implied, not stated.
 *   - SPEC-GAP: `encryption_mode` written 0xF (document: "0xF for ctb files") in both modes; `antialias_level` is "essentially arbitrary" for ctb: 1.
 *   - UNVERIFIED: the encryption key chosen for 'on' is a hash of name/count/seconds (never 0); the document says only that proprietary files use a random one.
 *   - Nothing in the document describes a checksum for this format, so none exists to write.
 *
 * PRINTERS (quoted from the document): "This information has been tested in practice with the Creality LD-002R, and by round-tripping files intended for the
 * older Elegoo Mars (`cbddlp`)." That is all the document says; it names no printer for a ctb written by anyone but the proprietary slicer other than the LD-002R.
 */
import { assembleChitu, checkSliced, pickOptions } from './rs-cbddlp.js';

export { MAX_PX } from './rs-cbddlp.js';

export const CTB = {
  id: 'ctb', name: 'Chitubox CTB (.ctb)', ext: 'ctb', mime: 'application/octet-stream',
  options: [
    { id: 'encryption', values: ['off', 'on'], default: 'off' },
    { id: 'cipherConstant', values: ['d8a83423', 'd8a83424'], default: 'd8a83423' },
    { id: 'projection', values: ['mirrored', 'normal'], default: 'mirrored' },
    { id: 'resType', values: ['f32', 'u32'], default: 'f32' },
  ],
};

/** RLE7 (document): byte 0 = [run flag:1][value:7]; a run is followed by its length in 1–4 bytes, big endian, the width marked by the top bits of the first. */
export function encodeRle7(px7) {
  const out = [];
  let i = 0;
  while (i < px7.length) {
    const v = px7[i];
    let j = i + 1;
    while (j < px7.length && px7[j] === v) j++;
    const run = j - i;
    if (run === 1) out.push(v);
    else {
      out.push(0x80 | v);
      if (run < 0x80) out.push(run);
      else if (run < 0x4000) out.push(0x80 | (run >>> 8), run & 0xff);
      else if (run < 0x200000) out.push(0xc0 | (run >>> 16), (run >>> 8) & 0xff, run & 0xff);
      else if (run < 0x10000000) out.push(0xe0 | (run >>> 24), (run >>> 16) & 0xff, (run >>> 8) & 0xff, run & 0xff);
      else throw new Error('ctb: a run longer than 28 bits');
    }
    i = j;
  }
  return Uint8Array.from(out);
}

/**
 * The document's "86" cipher. c = key·0x2D83CDAC + 0xD8A83424; X[0] = (iv·0x1E1530CD + 0xEC3D47CD)·c; X[n+1] = X[n] + c (all mod 2^32);
 * output word = input word xor X[n]. Data is padded to whole words and truncated back; encrypting twice gives the plaintext.
 */
// SPEC-GAP: the format document gives the additive constant as 0xD8A83424, but two independent working implementations (found by the CTB 3 to 5 spec work,
// docs/resin-formats/ctb-v3-v5-SPEC.md section 2) use 0xD8A83423. A tester flips this option; …23 is the default.
export const CIPHER_ADD = { d8a83423: 0xD8A83423, d8a83424: 0xD8A83424 };
export function cipher86(data, key, iv, add = CIPHER_ADD.d8a83423) {
  const c = (Math.imul(key >>> 0, 0x2D83CDAC) + add) >>> 0;
  let x = Math.imul((Math.imul(iv >>> 0, 0x1E1530CD) + 0xEC3D47CD) >>> 0, c) >>> 0;
  const n = data.length, words = (n + 3) >> 2;
  const buf = new Uint8Array(words * 4); buf.set(data);
  const v = new DataView(buf.buffer);
  for (let k = 0; k < words; k++) { v.setUint32(k * 4, (v.getUint32(k * 4, true) ^ x) >>> 0, true); x = (x + c) >>> 0; }
  return buf.slice(0, n);
}

function pickKey(sliced, meta) {
  let h = 0x811c9dc5;
  for (const ch of `${meta.name || ''}|${sliced.count}|${meta.seconds || 0}`) { h ^= ch.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
  return (h || 0x5eed1234) >>> 0;
}

export async function writeCtb(sliced, meta = {}) {
  checkSliced(sliced, 'ctb');
  const opt = pickOptions(CTB, meta.options);
  const { w, h, count } = sliced;
  const key = opt.encryption === 'on' ? pickKey(sliced, meta) : 0;
  const blobs = [];
  for (let i = 0; i < count; i++) {
    const g = sliced.layer(i);
    if (!g || g.length !== w * h) throw new Error(`ctb: layer ${i} is not ${w} × ${h}`);
    const px = new Uint8Array(w * h);
    for (let p = 0; p < px.length; p++) { const v = g[p]; px[p] = v === 0 ? 0 : Math.max(1, Math.round(v * 127 / 255)); }
    let b = encodeRle7(px);
    if (key) b = cipher86(b, key, i, CIPHER_ADD[opt.cipherConstant]);                           // IV = the layer's index in the layer table (bottom layer 0)
    blobs.push(b);
    if (meta.onProgress && (i & 31) === 31) { meta.onProgress((i + 1) / count); await Promise.resolve(); }
  }
  return assembleChitu(sliced, meta, {
    magic: 0x12fd0086, encryptionMode: 0xf, key, levelSets: 1, aaLevel: 1,
    projection: opt.projection, resType: opt.resType, blobs,
  });
}
