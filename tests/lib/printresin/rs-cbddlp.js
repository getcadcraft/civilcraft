/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-cbddlp.js — the Chitubox .cbddlp / .photon resin file writer (roadmap RSN.*), and the shared container that rs-ctb.js builds on. A Sliced plate in, the
 * bytes of a .cbddlp out. No DOM, no imports beyond lib/printresin/*.
 *
 * CLEAN ROOM. Written from format DOCUMENTATION only (prose + tables), never from source code. No GPL / AGPL / LGPL implementation was opened, fetched or
 * paraphrased; nothing here comes from memory of any implementation.
 * SOURCES:
 *   1. https://github.com/cbiffle/catibo/blob/master/doc/cbddlp-ctb.adoc  — "CTB/CBDDLP file formats", a prose/table document in a BSD-2-Clause repository
 *      (only the .adoc document was read, no source file of that repository). It documented: little-endian rule, the 0x70-byte file header table, the ExtConfig
 *      and ExtConfig2 tables, field meanings/units, ImageHeader, the preview RLE15 encoding, the 36-byte LayerHeader, the cbddlp RLE1 layer encoding, the
 *      level-set (planar) antialiasing scheme, and (for rs-ctb.js) RLE7 and the "86" cipher.
 *   Nothing else was used. The document says it was tested on a Creality LD-002R and by round-tripping files for the older Elegoo Mars (cbddlp).
 *
 * HONESTY: nothing written here has been loaded on a printer. It is read back by our own reader only (tools/printresin/cbddlp-read.mjs, written from the
 * same document), so it proves the file matches our reading of the document, not that any machine accepts it. We do not claim any printer accepts it.
 *
 *   CBDDLP = { id, name, ext, mime, options }
 *   writeCbddlp(sliced, meta) → Promise<Uint8Array>        sliced / meta as in rs-goo.js (see rs-rle.js); times s, distances mm, speeds mm/min: all the
 *                                                          unit the document uses, so nothing converts but volume (the document's resin_volume_ml is ml too)
 *   options (meta.options.<id>; wrong value throws "cbddlp: option …"; missing → default):
 *     aa          '1' | '2' | '3' | '4'   number of level sets (planar antialiasing); default '4'. '1' = a plain 1-bit picture (pixel on when > 127)
 *     projection  'mirrored' | 'normal'   header `projection` field; default 'mirrored' (the document: "LCD printers are mirrored for this purpose")
 *     resType     'f32' | 'u32'           how resolution.x/.y are stored; default 'f32' (see SPEC-GAP below)
 *
 * SPEC-GAPs / UNVERIFIED (each also marked where it happens):
 *   - SPEC-GAP: the document types `resolution.{x,y}` as f32 although every other count is an integer; it may be a typo. The document's text is followed
 *     (default 'f32'); the option exists so a first real-printer test can flip it.
 *   - SPEC-GAP: `projection` "records whether this file was generated assuming" mirrored/normal projection; the document does not say whether the pixel data
 *     must itself be flipped for one of them. The writer sets the flag only and never touches the pixels.
 *   - SPEC-GAP: section order in the file is not fixed by the document; order used: header, ExtConfig, ExtConfig2, machine-type string, ImageHeaders,
 *     preview data, layer table, layer data.
 *   - SPEC-GAP: `version` is "always 2" (only ever seen value); written 2. `unknown 0x200` in ExtConfig2 is written as the u32 0x200. `mysterious_id`
 *     written 0 (the document says zeroing has no observed effect). All padding / reserved words are written 0.
 *   - SPEC-GAP: the RLE1 run limit: the proprietary limit is 0x7d (125) "reason not clear"; 125 is used. Preview run limit 0xffe is used.
 *   - SPEC-GAP: does a layer in the level-set 1..N-1 use the same z/exposure values as in set 0? Written identical (the document says nothing else).
 *   - SPEC-GAP: the threshold per level set is "one way of doing it" in the document (N=4: >192, >128, >64, >0); generalised as ceil(255·(N-1-k)/N).
 *     N=1 uses >127 (the document gives no value for a non-antialiased slice).
 *   - SPEC-GAP: `software_version` — the document suggests hardcoding 0x01060300; done. Whether any printer checks it is unknown.
 *   - UNVERIFIED: layer `z` is written as the TOP of the layer, (i+1)·layerHeight; the document says only "build platform Z position for this layer".
 *     `overall_height_mm` = count·layerHeight. `printer_out_mm.z` = printer.mm[2], else the model height.
 *   - UNVERIFIED: the per-layer exposure of the first `bottomLayers` layers is the bottom exposure; light_off per layer = resin.lightOff.
 *   - UNVERIFIED: resin_mass_g = ml × density (1.1 when missing); resin_cost = kg × price-per-kg.
 *   - Nothing in the document describes a checksum for this format, so none exists to write.
 */
export const MAX_PX = 32767;       // held well inside both the u32 and the exactly-representable f32 range

export const CBDDLP = {
  id: 'cbddlp', name: 'Chitubox CBDDLP (.cbddlp)', ext: 'cbddlp', mime: 'application/octet-stream',
  options: [
    { id: 'aa', values: ['1', '2', '3', '4'], default: '4' },
    { id: 'projection', values: ['mirrored', 'normal'], default: 'mirrored' },
    { id: 'resType', values: ['f32', 'u32'], default: 'f32' },
  ],
};

const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const HEADER_SIZE = 0x70, EXT_SIZE = 0x40, EXT2_SIZE = 0x50, IMGHDR_SIZE = 0x20, LAYERHDR_SIZE = 36;
const LARGE = [400, 300], SMALL = [200, 125];             // preview sizes "in all files observed in the wild"
const SOFTWARE_VERSION = 0x01060300;

/** Validates meta.options against a format's option list; returns { id: value } with defaults. Throws a clear Error naming the format. */
export function pickOptions(fmt, given) {
  const out = {};
  for (const o of fmt.options) {
    const v = given && given[o.id] !== undefined ? String(given[o.id]) : o.default;
    if (!o.values.includes(v)) throw new Error(`${fmt.id}: option ${o.id} cannot be '${v}' (use ${o.values.join(', ')})`);
    out[o.id] = v;
  }
  return out;
}

/** Sequential little-endian writer into a growing array of known final size. */
export class Out {
  constructor(n) { this.b = new Uint8Array(n); this.v = new DataView(this.b.buffer); this.o = 0; }
  u8(x) { this.b[this.o++] = x & 0xff; }
  u16(x) { this.v.setUint16(this.o, x, true); this.o += 2; }
  u32(x) { this.v.setUint32(this.o, x >>> 0, true); this.o += 4; }
  f32(x) { this.v.setFloat32(this.o, x, true); this.o += 4; }
  zero(n) { this.o += n; }
  bytes(a) { this.b.set(a, this.o); this.o += a.length; }
}

/** One preview picture as 16-bit words: red 5 | green 5 | run flag | blue 5, fitted into size w × h, area-averaged, resin-green on dark. */
function previewWords(sliced, pw, ph) {
  const { w, h, count } = sliced;
  const acc = new Uint8Array(w * h);
  const step = Math.max(1, Math.ceil(count / 24));
  for (let i = 0; i < count; i += step) { const g = sliced.layer(i); for (let k = 0; k < acc.length; k++) if (g[k] > acc[k]) acc[k] = g[k]; }
  const s = Math.min(pw / w, ph / h), iw = Math.max(1, Math.round(w * s)), ih = Math.max(1, Math.round(h * s));
  const x0 = (pw - iw) >> 1, y0 = (ph - ih) >> 1;
  const bg = [16, 18, 22], fg = [96, 230, 150];
  const out = new Uint16Array(pw * ph);
  for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
    let t = 0;
    if (x >= x0 && x < x0 + iw && y >= y0 && y < y0 + ih) {
      const sx0 = Math.floor((x - x0) * w / iw), sx1 = Math.max(sx0 + 1, Math.floor((x - x0 + 1) * w / iw));
      const sy0 = Math.floor((y - y0) * h / ih), sy1 = Math.max(sy0 + 1, Math.floor((y - y0 + 1) * h / ih));
      let sum = 0, n = 0;
      for (let yy = sy0; yy < sy1 && yy < h; yy++) for (let xx = sx0; xx < sx1 && xx < w; xx++) { sum += acc[yy * w + xx]; n++; }
      t = n ? sum / n / 255 : 0;
    }
    const c = [0, 1, 2].map((k) => Math.round(bg[k] + (fg[k] - bg[k]) * t));
    out[y * pw + x] = ((c[0] >> 3) << 11) | ((c[1] >> 3) << 6) | (c[2] >> 3);        // bit 5 (the run flag) left clear
  }
  return out;
}

/** RLE15 (document): a pixel with bit 5 set is followed by a word 0x3nnn, nnn = copies after the first; runs may cross rows. Run limit 0xffe. */
export function encodeRle15(words) {
  const out = [];
  let i = 0;
  while (i < words.length) {
    const p = words[i];
    let j = i + 1;
    while (j < words.length && words[j] === p && j - i - 1 < 0xffe) j++;
    const extra = j - i - 1;
    if (extra > 0) { out.push(p | 0x20, 0x3000 | extra); } else out.push(p);
    i = j;
  }
  const b = new Uint8Array(out.length * 2), v = new DataView(b.buffer);
  out.forEach((x, k) => v.setUint16(k * 2, x, true));
  return b;
}

/** RLE1 (document): one byte a run, bit 7 = pixel value, bits 6:0 = run length (1..125 used); runs wrap across rows. */
export function encodeRle1(bits) {
  const out = [];
  let i = 0;
  while (i < bits.length) {
    const v = bits[i];
    let j = i + 1;
    while (j < bits.length && bits[j] === v) j++;
    for (let run = j - i; run > 0;) { const n = Math.min(run, 125); run -= n; out.push((v ? 0x80 : 0) | n); }
    i = j;
  }
  return Uint8Array.from(out);
}

/**
 * Lays out and writes the container shared by .cbddlp and .ctb (the header, ExtConfig, ExtConfig2, previews, layer table are the same in both per the document).
 *   c: { magic, encryptionMode, key, levelSets, aaLevel, projection ('mirrored'|'normal'), resType ('f32'|'u32'), blobs: Uint8Array[count × levelSets] (set-major) }
 */
export function assembleChitu(sliced, meta, c) {
  const { w, h, count } = sliced;
  const pr = meta.printer || {}, rs = meta.resin || {};
  const layerH = num(meta.layerHeight, sliced.layerHeight);
  const bottomN = Math.max(0, Math.min(count, Math.round(num(rs.bottomLayers))));
  const expo = num(rs.exposure), bExpo = num(rs.bottomExposure, expo), off = num(rs.lightOff);
  const lift = num(rs.liftHeight), liftV = num(rs.liftSpeed), retV = num(rs.retractSpeed);
  const pwm = Math.max(0, Math.min(255, Math.round(num(rs.pwm, 255))));
  const mm = sliced.mm || pr.mm || [0, 0];
  const platZ = num(pr.mm && pr.mm[2], count * layerH);
  const grams = num(meta.volumeMl) * num(rs.density, 1.1);
  const cost = grams / 1000 * num(rs.price);
  const machine = String(pr.type || pr.name || pr.id || 'CadCraft').replace(/[^\x20-\x7e]/g, '?').slice(0, 64);   // 7-bit ASCII, not nul-terminated

  const large = encodeRle15(previewWords(sliced, LARGE[0], LARGE[1]));
  const small = encodeRle15(previewWords(sliced, SMALL[0], SMALL[1]));
  const tableN = count * c.levelSets;

  const extAt = HEADER_SIZE, ext2At = extAt + EXT_SIZE, machineAt = ext2At + EXT2_SIZE;
  const largeHdrAt = machineAt + machine.length, smallHdrAt = largeHdrAt + IMGHDR_SIZE;
  const largeAt = smallHdrAt + IMGHDR_SIZE, smallAt = largeAt + large.length;
  const tableAt = smallAt + small.length, dataAt = tableAt + tableN * LAYERHDR_SIZE;
  const dataLen = c.blobs.reduce((s, b) => s + b.length, 0);
  const o = new Out(dataAt + dataLen);

  // ---- file header (0x70) ----
  o.u32(c.magic); o.u32(2);                                         // SPEC-GAP: version always 2
  o.f32(num(pr.mm && pr.mm[0], num(mm[0]))); o.f32(num(pr.mm && pr.mm[1], num(mm[1])));   // printer_out_mm.x, .y
  o.f32(platZ); o.zero(8);                                          // printer_out_mm.z, then two zero words
  o.f32(count * layerH);                                            // overall_height_mm
  o.f32(layerH); o.f32(expo); o.f32(bExpo); o.f32(off);
  o.u32(bottomN);
  if (c.resType === 'u32') { o.u32(w); o.u32(h); } else { o.f32(w); o.f32(h); }   // SPEC-GAP: document says f32
  o.u32(largeHdrAt);
  o.u32(tableAt); o.u32(count); o.u32(smallHdrAt); o.u32(Math.round(num(meta.seconds)));
  o.u32(c.projection === 'mirrored' ? 1 : 0);
  o.u32(extAt); o.u32(EXT_SIZE); o.u32(c.levelSets);
  o.u16(pwm); o.u16(pwm);                                           // pwm_level, bot_pwm_level (0xff = fully on; the profile has no power → full)
  o.u32(c.key); o.u32(ext2At); o.u32(EXT2_SIZE);
  // ---- ExtConfig (0x40) ----
  o.f32(lift); o.f32(liftV); o.f32(lift); o.f32(liftV);             // bot_lift_dist, bot_lift_speed, lift_dist, lift_speed (the profile has one lift for all layers)
  o.f32(retV); o.f32(num(meta.volumeMl)); o.f32(grams); o.f32(cost);
  o.f32(off); o.f32(off); o.u32(bottomN); o.zero(4 + 16);           // bot_light_off, light_off, bot_layer_count, padding
  // ---- ExtConfig2 (0x50) ----
  o.zero(28); o.u32(machineAt);
  o.u32(machine.length); o.u32(c.encryptionMode); o.u32(0); o.u32(c.aaLevel);
  o.u32(SOFTWARE_VERSION); o.u32(0x200); o.zero(8 + 16);
  // ---- machine type string, ImageHeaders, previews ----
  for (let i = 0; i < machine.length; i++) o.u8(machine.charCodeAt(i));
  o.u32(LARGE[0]); o.u32(LARGE[1]); o.u32(largeAt); o.u32(large.length); o.zero(16);
  o.u32(SMALL[0]); o.u32(SMALL[1]); o.u32(smallAt); o.u32(small.length); o.zero(16);
  o.bytes(large); o.bytes(small);
  // ---- layer table, layer data ----
  let at = dataAt;
  for (let t = 0; t < tableN; t++) {
    const i = t % count;
    o.f32(Math.fround((i + 1) * layerH)); o.f32(i < bottomN ? bExpo : expo); o.f32(off);
    o.u32(at); o.u32(c.blobs[t].length); o.zero(16);
    at += c.blobs[t].length;
  }
  for (const b of c.blobs) o.bytes(b);
  if (o.o !== o.b.length) throw new Error('cbddlp: internal size mismatch');
  return o.b;
}

export function checkSliced(sliced, tag) {
  const { w, h, count } = sliced;
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) throw new Error(`${tag}: the layer size must be whole pixels`);
  if (w > MAX_PX || h > MAX_PX) throw new Error(`${tag}: ${w} × ${h} px is too large; the format holds at most ${MAX_PX} px on each side`);
  if (!Number.isInteger(count) || count < 1) throw new Error(`${tag}: there are no layers to write`);
}

export async function writeCbddlp(sliced, meta = {}) {
  checkSliced(sliced, 'cbddlp');
  const opt = pickOptions(CBDDLP, meta.options);
  const { w, h, count } = sliced;
  const N = +opt.aa;
  const thr = (k) => (N === 1 ? 127 : Math.ceil(255 * (N - 1 - k) / N));      // pixel is on when value > thr(k)
  const blobs = [];
  for (let k = 0; k < N; k++) {
    const t = thr(k);
    for (let i = 0; i < count; i++) {
      const g = sliced.layer(i);
      if (!g || g.length !== w * h) throw new Error(`cbddlp: layer ${i} is not ${w} × ${h}`);
      const bits = new Uint8Array(w * h);
      for (let p = 0; p < bits.length; p++) bits[p] = g[p] > t ? 1 : 0;
      blobs.push(encodeRle1(bits));
      if (meta.onProgress && (blobs.length & 31) === 31) { meta.onProgress(blobs.length / (N * count)); await Promise.resolve(); }
    }
  }
  return assembleChitu(sliced, meta, {
    magic: 0x12fd0019, encryptionMode: 0, key: 0, levelSets: N, aaLevel: N,      // document: antialias_level "will match the level_set_count" for cbddlp
    projection: opt.projection, resType: opt.resType, blobs,
  });
}
