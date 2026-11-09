/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-goo.js — the Elegoo GOO file writer (roadmap RSN.*): a Sliced plate in, the bytes of a .goo out, ready for the printer's USB stick. No DOM, no imports
 * beyond lib/printresin/*. Written from Elegoo's own published "Goo Format Spec V1.2" (the PDF in github.com/elegooofficial/GOO) and nothing else; no
 * third-party implementation was read. The spec is silent or unclear in places; each is marked `// SPEC-GAP:` with the reading taken, so a first real-printer
 * test knows where to look.
 *
 * SWITCHABLE CHOICES: the spec leaves two real forks open, so they are options, not fixed guesses (GOO.options; chosen per file in meta.options):
 *   byteOrder 'big' | 'little'  every int / short / float field and the RGB565 preview words        (default 'big')
 *   checksum  'negsum' | 'sum'  the image-data checksum: two's complement (negated) of the byte sum, or the plain byte sum, both mod 256   (default 'negsum')
 * The defaults rest on a SECONDARY, UNVERIFIED report: a web search turned up a commit message by the author of a third-party slicer saying real files are
 * big-endian with a negated-sum checksum. It is not from source we read and not checked by us; no real Elegoo printer has been tried. A tester flips the
 * options when the printer rejects a file. The UI shows labels from the add-on's lang file under `opt.<id>` and `opt.<id>.<value>`.
 *
 * HONESTY: nothing written here has been loaded on a real Elegoo printer. It is read back by our own reader only (tools/printresin/goo-read.mjs, also
 * written from the spec), so it proves the file matches our reading of the spec, not that a machine accepts it.
 *
 *   GOO = { id, name, ext, mime, options: [{ id, values, default }] }
 *   writeGoo(sliced, meta) → Promise<Uint8Array>
 *     sliced: { w, h, layerHeight, count, layer(i) → Uint8Array(w * h), mm: [x, y] }                    see rs-rle.js
 *     meta:   { name, printer: { id, name, mm?: [x, y, z], flip?: { x, y } },
 *               resin: { name, exposure, bottomExposure, bottomLayers, liftHeight, liftSpeed, retractSpeed, lightOff, density?, price?, pwm? },
 *               layerHeight, volumeMl, seconds, time?: Date, onProgress?(0..1),
 *               options?: { byteOrder?, checksum? } }                   unknown value → throws; missing → the GOO.options default
 *     times in seconds, distances in mm, speeds in mm/min: exactly what the profile holds, which is exactly what the spec asks for; only the volume converts
 *   MAX_PX                                                  the largest resolution one axis may have (the spec's X and Y are 16-bit)
 *
 * File layout (spec V1.2): header info, then one "layer content" a layer, then the ending string.
 *   header: version(4) magic(8) software(32) softwareVersion(24) time(24) printerName(32) printerType(32) profile(32) aa(2) grey(2) blur(2)
 *           small preview 116×116 RGB565, CRLF, big preview 290×290 RGB565, CRLF, then fields 15–61 (counts, size, exposure, motion, power, totals, offset)
 *   layer content: layer definition (66 bytes, ends CRLF) · data size (4) · image data (0x55, RLE chunks, 8-bit checksum) · CRLF
 *   ending string: 00 00 00 07 00 00 00 44 4C 50 00
 */
export const GOO = {
  id: 'goo', name: 'Elegoo GOO (.goo)', ext: 'goo', mime: 'application/octet-stream',
  options: [
    { id: 'byteOrder', values: ['big', 'little'], default: 'big' },
    { id: 'checksum', values: ['negsum', 'sum'], default: 'negsum' },
  ],
};

// SPEC-GAP (byteOrder): the spec never says which byte order its int/short/float fields use. Its own bytes do not settle it, honestly: the 8-byte magic
// 07 00 00 00 44 4C 50 00 reads as the number 7 followed by "DLP\0" only if little-endian; the ending string 00 00 00 07 00 00 00 44 4C 50 00 reads as a
// big-endian 7 followed by 00 00 00 "DLP" 00, but it equally reads as three zero bytes plus the very same magic. Both are plain byte strings the writer
// copies verbatim, so neither supports either order. The default 'big' follows only the secondary, UNVERIFIED web-search report named in the header
// comment (a third-party slicer author's commit message: big-endian, negated-sum checksum; not from source we read, not verified by us).
// SPEC-GAP (checksum): the spec says "8-bit checksum" with no formula; 'negsum' (default, same unverified report) or the plain 'sum'.
// SPEC-GAP (header size): the table's fields add up to a 195,477-byte header; the spec's example offset 0x2FAB7 = 195,255 cannot be reconciled with it
// (header bytes 0-14 alone are 195,310), so the example is read as illustrative and the table is followed.
const optionsOf = (given) => {
  const out = {}, g = given || {};
  for (const k of Object.keys(g)) if (!GOO.options.some((o) => o.id === k)) throw new Error(`goo: unknown option "${k}"`);
  for (const o of GOO.options) {
    const v = g[o.id] === undefined || g[o.id] === null ? o.default : g[o.id];
    if (!o.values.includes(v)) throw new Error(`goo: option ${o.id} must be one of ${o.values.join(', ')}, not ${JSON.stringify(v)}`);
    out[o.id] = v;
  }
  return out;
};

// SPEC-GAP: "format version" (String, 4 bytes) is given no value; the document is titled V1.2, so those four characters are written.
const VERSION = 'V1.2';
const MAGIC = [0x07, 0x00, 0x00, 0x00, 0x44, 0x4c, 0x50, 0x00];                // field 1, "fix constant"
const ENDING = [0x00, 0x00, 0x00, ...MAGIC];                                    // the diagram's ending string: 00 00 00 + the magic tag (11 bytes)
const CRLF = [0x0d, 0x0a];
const SMALL = 116, BIG = 290;                                                   // preview edges, fields 11 and 13
export const MAX_PX = 32767;       // the spec's resolutions are "short int"; held to the signed range so either reading is safe
const MAX_RUN = 0x0fffffff;        // 4-bit nibble + three length bytes

const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);

/** Sequential little helper over one ArrayBuffer: every field goes through here so the byte order lives in one place. */
class Out {
  constructor(n, le) { this.b = new Uint8Array(n); this.v = new DataView(this.b.buffer); this.o = 0; this.le = le; }
  u8(x) { this.b[this.o++] = x & 0xff; }
  i16(x) { this.v.setInt16(this.o, x, this.le); this.o += 2; }
  i32(x) { this.v.setInt32(this.o, x, this.le); this.o += 4; }
  f32(x) { this.v.setFloat32(this.o, x, this.le); this.o += 4; }
  bytes(a) { this.b.set(a, this.o); this.o += a.length; }
  str(s, n) {                      // fixed-width ASCII, zero-padded; always leaves a closing zero so a reader stops where the text does
    const t = String(s ?? '').replace(/[^\x20-\x7e]/g, '?').slice(0, n - 1);
    for (let i = 0; i < n; i++) this.b[this.o + i] = i < t.length ? t.charCodeAt(i) : 0;
    this.o += n;
  }
}

const pad2 = (n) => String(n).padStart(2, '0');
// SPEC-GAP: "File create time" is a 24-byte String with no format; "YYYY-MM-DD HH:MM:SS" (19 characters, local time) is the plain reading.
const stamp = (d) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;

/**
 * One preview picture as RGB565 (red 5 bits, green 6, blue 5), size × size. The plate is shown as every layer's light laid on top of one another (sampled to
 * at most 24 layers), fitted into the square with its proportions kept, in resin-green on dark. Pixels are area-averaged, not picked, so edges stay smooth.
 */
function preview(sliced, size, le) {
  const { w, h, count } = sliced;
  const acc = new Uint8Array(w * h);
  const step = Math.max(1, Math.ceil(count / 24));
  for (let i = 0; i < count; i += step) { const g = sliced.layer(i); for (let k = 0; k < acc.length; k++) if (g[k] > acc[k]) acc[k] = g[k]; }
  const s = Math.min(size / w, size / h), pw = Math.max(1, Math.round(w * s)), ph = Math.max(1, Math.round(h * s));
  const x0 = (size - pw) >> 1, y0 = (size - ph) >> 1;
  const out = new Uint8Array(size * size * 2), v = new DataView(out.buffer);
  const bg = [16, 18, 22], fg = [96, 230, 150];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let t = 0;
      if (x >= x0 && x < x0 + pw && y >= y0 && y < y0 + ph) {
        const sx0 = Math.floor((x - x0) * w / pw), sx1 = Math.max(sx0 + 1, Math.floor((x - x0 + 1) * w / pw));
        const sy0 = Math.floor((y - y0) * h / ph), sy1 = Math.max(sy0 + 1, Math.floor((y - y0 + 1) * h / ph));
        let sum = 0, n = 0;
        for (let yy = sy0; yy < sy1 && yy < h; yy++) for (let xx = sx0; xx < sx1 && xx < w; xx++) { sum += acc[yy * w + xx]; n++; }
        t = n ? sum / n / 255 : 0;
      }
      const c = [0, 1, 2].map((k) => Math.round(bg[k] + (fg[k] - bg[k]) * t));
      v.setUint16((y * size + x) * 2, ((c[0] >> 3) << 11) | ((c[1] >> 2) << 5) | (c[2] >> 3), le);
    }
  }
  return out;
}

/**
 * One layer picture as the spec's image data: 0x55, RLE chunks, an 8-bit checksum. Chunk byte 0 is [type:2][length code:2][nibble:4]:
 *   00 all-0x00 pixels · 11 all-0xff pixels · 01 one grey 0x01–0xfe, the grey byte following byte 0 · (10, a diff from the previous pixel, is never written)
 * The run length is the low nibble of byte 0 plus 0–3 more bytes, most significant first, then the nibble last — read off the spec's worked examples
 * (bytes 55 56 57 + nibble f is length 0x555657f). The shortest code that holds the run is used.
 * SPEC-GAP: the diff chunk's meaning for a run (does the step apply once, or to every pixel?) and its first-pixel start value are not stated, so the writer
 * does not use it; plain run chunks are always valid under the spec's table, at some cost in size on antialiased edges.
 * SPEC-GAP: the "8-bit checksum" has no formula. Over every byte after the 0x55 and before the checksum, modulo 256: 'sum' is the plain sum, 'negsum' its
 * two's complement (option `checksum`).
 */
function encodeImage(gray, checksum) {
  const out = [0x55];
  let sum = 0;
  const put = (b) => { out.push(b); sum = (sum + b) & 0xff; };
  const n = gray.length;
  let i = 0;
  while (i < n) {
    const val = gray[i];
    let j = i + 1;
    while (j < n && gray[j] === val) j++;
    for (let run = j - i; run > 0;) {                      // a run past MAX_RUN is split; a layer never gets near it
      const len = Math.min(run, MAX_RUN);
      run -= len;
      const code = len < 0x10 ? 0 : len < 0x1000 ? 1 : len < 0x100000 ? 2 : 3;
      const type = val === 0 ? 0 : val === 255 ? 3 : 1;
      put((type << 6) | (code << 4) | (len & 0x0f));
      if (type === 1) put(val);
      for (let k = code; k > 0; k--) put((len >>> (4 + 8 * (k - 1))) & 0xff);
    }
    i = j;
  }
  out.push((checksum === 'sum' ? sum : -sum) & 0xff);                                     // the magic 0x55 is not in the sum
  return Uint8Array.from(out);
}

export async function writeGoo(sliced, meta = {}) {
  const opt = optionsOf(meta.options), LE = opt.byteOrder === 'little';
  const { w, h, count } = sliced;
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) throw new Error('goo: the layer size must be whole pixels');
  if (w > MAX_PX || h > MAX_PX) throw new Error(`goo: ${w} × ${h} px is too large; the format holds at most ${MAX_PX} px on each side`);
  if (!Number.isInteger(count) || count < 1) throw new Error('goo: there are no layers to write');
  const pr = meta.printer || {}, rs = meta.resin || {};
  const layerH = num(meta.layerHeight, sliced.layerHeight);
  const bottomN = Math.max(0, Math.min(count, Math.round(num(rs.bottomLayers))));
  const expo = num(rs.exposure), bExpo = num(rs.bottomExposure, expo);
  const lift = num(rs.liftHeight), liftV = num(rs.liftSpeed), retV = num(rs.retractSpeed), off = num(rs.lightOff);
  const pwm = Math.max(0, Math.min(255, Math.round(num(rs.pwm, 255))));
  const mm = sliced.mm || pr.mm || [0, 0];
  const platZ = num(pr.mm && pr.mm[2], count * layerH);   // SPEC-GAP: "Z size of platform" has no source in the plate; the printer's build height, else the model's own height
  const volMm3 = num(meta.volumeMl) * 1000;                // the one conversion: the plate holds millilitres, the spec wants mm³ (1 ml = 1000 mm³)
  const grams = num(meta.volumeMl) * num(rs.density, 1.1); // weight: millilitres × the resin's density (g/ml; 1.1 when the profile has none)
  const price = grams / 1000 * num(rs.price);              // price: profile price is read as per kilogram; 0 when the profile has none

  const sm = preview(sliced, SMALL, LE), big = preview(sliced, BIG, LE);
  const hd = new Out(2 * (SMALL * SMALL + BIG * BIG) + 1024, LE);   // roomy; trimmed to what was written below
  hd.str(VERSION, 5); hd.o -= 1;                           // the 4 characters fill the whole field; no closing zero here
  hd.bytes(MAGIC);
  hd.str('CadCraft', 32);
  hd.str(meta.softwareVersion || '0.9', 24);
  hd.str(stamp(meta.time instanceof Date ? meta.time : new Date()), 24);
  hd.str(pr.name || pr.id, 32);
  hd.str(pr.type || pr.id, 32);                            // SPEC-GAP: "Printer type" is not explained; the printer's id is the stable short name
  hd.str(rs.name, 32);
  hd.i16(1);       // SPEC-GAP: "Anti-aliasing level setting by slicer": CadCraft's layers carry their own grey edge, written as level 1
  hd.i16(255);     // SPEC-GAP: "Grey level" is not explained; 255, the top value a pixel here can take
  hd.i16(0);       // blur level: none applied
  hd.bytes(sm); hd.bytes(CRLF); hd.bytes(big); hd.bytes(CRLF);
  hd.i32(count);
  hd.i16(w); hd.i16(h);
  hd.u8(pr.flip && pr.flip.x ? 1 : 0); hd.u8(pr.flip && pr.flip.y ? 1 : 0);
  hd.f32(num(mm[0])); hd.f32(num(mm[1])); hd.f32(platZ);
  hd.f32(layerH);
  hd.f32(expo);
  // SPEC-GAP: "Exposure delay mode" 1 = static time, 0 = "turn off time". The profile's one light-off delay is exactly the turn-off time, so mode 0 and the
  // per-phase waits (before lift, after lift, after retract) are written as 0.
  hd.u8(0);
  hd.f32(off);
  hd.f32(0); hd.f32(0); hd.f32(0);                         // bottom: before lift, after lift, after retract
  hd.f32(0); hd.f32(0); hd.f32(0);                         // common: before lift, after lift, after retract
  hd.f32(bExpo); hd.i32(bottomN);
  // SPEC-GAP: the profile has one lift (and one speed) for every layer, and no second stage; bottom layers use the same. The retract distance is written
  // equal to the lift distance (the head returns to where it left). Second-stage distances are 0 and carry the first stage's speed.
  hd.f32(lift); hd.f32(liftV);                             // bottom lift distance, speed
  hd.f32(lift); hd.f32(liftV);                             // lift distance, speed
  hd.f32(lift); hd.f32(retV);                              // bottom retract distance, speed
  hd.f32(lift); hd.f32(retV);                              // retract distance, speed
  hd.f32(0); hd.f32(liftV); hd.f32(0); hd.f32(liftV);      // bottom second lift, second lift: distance, speed
  hd.f32(0); hd.f32(retV); hd.f32(0); hd.f32(retV);        // bottom second retract, second retract: distance, speed
  hd.i16(pwm); hd.i16(pwm);                                // bottom light PWM, light PWM (0–255; the profile has no power, so full)
  hd.u8(0);                                                // advance mode: normal (the header values apply; the per-layer values repeat them)
  hd.i32(Math.round(num(meta.seconds)));
  hd.f32(volMm3); hd.f32(grams); hd.f32(price);
  hd.str('$', 8);                                          // SPEC-GAP: price unit; the profile's price is dollars
  const offAt = hd.o; hd.i32(0);                           // offset of the first layer, filled in below
  hd.u8(1);                                                // gray scale level 1: pixel values 0x00–0xff
  hd.i16(0);                                               // transition layers: none
  const HEAD = hd.o;
  hd.v.setInt32(offAt, HEAD, LE);                          // SPEC-GAP: the offset is counted from the first byte of the file, the start of the first layer definition

  const parts = [hd.b.slice(0, HEAD)];
  for (let i = 0; i < count; i++) {
    const g = sliced.layer(i);
    if (!g || g.length !== w * h) throw new Error(`goo: layer ${i} is not ${w} × ${h}`);
    const bottom = i < bottomN;
    const img = encodeImage(g, opt.checksum);
    const ld = new Out(66 + 4, LE);
    ld.i16(0);                                             // pause flag: 0, no pause
    ld.f32(0);                                             // pause position Z
    ld.f32(Math.fround((i + 1) * layerH));                 // SPEC-GAP: "layer position Z, the height of current layer": the top of this layer, (i + 1) × thickness
    ld.f32(bottom ? bExpo : expo);
    ld.f32(off);                                           // layer off time (used in mode 0)
    ld.f32(0); ld.f32(0); ld.f32(0);                       // before lift, after lift, after retract (used in mode 1)
    ld.f32(lift); ld.f32(liftV); ld.f32(0); ld.f32(liftV);
    ld.f32(lift); ld.f32(retV); ld.f32(0); ld.f32(retV);
    ld.i16(pwm);
    ld.bytes(CRLF);
    ld.i32(img.length);                                    // SPEC-GAP: "size of encoded image data" is counted over the whole image-data field: 0x55, chunks and checksum
    parts.push(ld.b, img, Uint8Array.from(CRLF));
    if (meta.onProgress && (i & 31) === 31) { meta.onProgress((i + 1) / count); await Promise.resolve(); }
  }
  parts.push(Uint8Array.from(ENDING));
  const total = parts.reduce((s, p) => s + p.length, 0), out = new Uint8Array(total);
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}
