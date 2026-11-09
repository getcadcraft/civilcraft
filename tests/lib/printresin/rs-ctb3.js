/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-ctb3.js — the Chitubox .ctb writer for versions 3, 4 and 5, in both container styles the spec describes. No DOM. Needs WebCrypto
 * (globalThis.crypto.subtle: browsers, Node 24) only for style 'encrypted'.
 *
 * CLEAN ROOM, STAGE TWO. Written from ONE written source: docs/resin-formats/ctb-v3-v5-SPEC.md (and from our own lib/printresin/rs-cbddlp.js, rs-ctb.js,
 * rs-goo.js for house style and shared helpers). No third-party implementation was opened, fetched or recalled; every gap in the spec is marked
 * `// SPEC-GAP:` below and taken the safest reading that follows the spec's text.
 *
 * HONESTY: nothing written here has been loaded on a printer. It is read back by our own reader only (tools/printresin/ctb3-read.mjs, written from the
 * same spec), so it proves the file matches our reading of the spec, not that any machine accepts it. We do not claim any printer accepts it.
 *
 *   CTB3 = { id: 'ctb3', name, ext, mime, options }
 *   writeCtb3(sliced, meta) → Promise<Uint8Array>     sliced / meta as in rs-goo.js (see rs-rle.js); meta.options.<id>; a wrong value throws "ctb3: …"
 *   options (UI labels: lang keys opt.<id> and opt.<id>.<value>):
 *     style        'plain' | 'encrypted'   default 'encrypted'. plain = spec STYLE P (magic 0x12FD0086 for v3, 0x12FD0106 for v4/v5); encrypted = STYLE E
 *                                          (magic 0x12FD0107, settings AES-256-CBC, signature). The spec names Style E v5 as the main case.
 *     version      '3' | '4' | '5'         default '5'. plain allows 3, 4, 5; encrypted allows 4, 5 (v3 + encrypted throws).
 *     antialias    'on' | 'off'            default 'on': flag 0x0F + level 8; 'off': flag 0x07 + level 1. Pixels are 7-bit grey either way; the spec does
 *                                          not know whether a printer reads the flag, so a hardware test can flip it.
 *     projection   'mirrored' | 'normal'   default 'mirrored' (the spec: both sources default to 1)
 *     layerCipher  'on' | 'off'            default 'on' (seed 0x67). 'off' (seed 0 = no keystream) is allowed ONLY for plain v3; the spec requires a
 *                                          nonzero seed for v4, v5 and style E, so 'off' with those throws.
 *   Cipher constant: 0xD8A83423 (spec 2.2.1; the old …24 of rs-ctb.js is NOT used here). Not an option: the spec gives one value for v3 to v5.
 *
 * Units: our meta is seconds, mm, mm/min (rs-goo.js). The spec's file units are the same (mm, mm/min, s; print time u32 s; volume ml; timestamp = Unix
 * minutes), so nothing converts except the timestamp (ms → minutes) and the volume (already ml).
 *
 * SPEC-GAPs (each marked where it happens):
 *   1. Disclaimer text: the spec says the vendor's text is licence-bearing and not supplied; we write our own 320 bytes. A printer might check it.
 *   2. Single-stage lift: the profile has one lift per layer set, so every "stage 2" field is 0 and the totals equal the one value (spec 4.3 says zero
 *      is valid). Whether a printer needs the vendor's two-stage defaults is unknown.
 *   3. Rest times (before lift, after lift, after retract) and transition layer count: the profile has none → written 0.
 *   4. Unknown fields: written with what the spec says both sources write (0, 1, 42, the constants 4.0, 5, 4, the two end markers); the unknown float
 *      at v4-block offset 40 and u32 at 44 are written 0 ("probably acceptable (untested)").
 *   5. Layer z is written as the TOP of layer i, (i+1)·layerHeight (the spec only says "platform position, increasing"); same as rs-cbddlp.js.
 *   6. Style E: signature seed value 0xCAFEBABE (spec: "any value"); signature, 8-byte marker (v5) and 4-byte marker placed after the layers (the
 *      spec's preferred order; the other order is unverified on hardware). Style E preview record is 16 bytes (spec 2.4); readers follow the offset.
 *   7. AES-covered part of a layer: offset 0, length 0 (the spec's writer behaviour); a printer might demand it (spec 11.7).
 *   8. Print-parameter block size 60 and slicer block size 76 (spec) differ from the v2 writer's 64 and 80; a printer might compare (spec 11.10).
 *   9. Preview offsets in the header / settings point at the preview RECORD (record carries the data offset); the spec does not say which. Preview
 *      picture (resin-green on dark, max over sampled layers) is our own; sizes 400×300 and 200×125 as in all files the spec cites.
 *  10. Resin block (v5): colour (grey, alpha 0), type "Normal", name from the profile (else "Standard"), density from the profile (else 1.1); the spec
 *      leaves them free. Alpha 0 is "0 in one source's defaults".
 *  11. Layer pixel mapping g >> 1 (spec 2.1); a faint pixel 1 becomes 0 (spec behaviour, not our round-to-1 of rs-ctb.js).
 *  12. Timestamp: floor(Unix seconds / 60) (spec); meta.time (Date) when given, else now. The "epoch" of the other source is not known.
 *  13. Bottom-layer motion: a layer below the bottom count uses meta.resin.bottomLiftHeight / bottomLiftSpeed when given, else the normal lift.
 *  14. Writer-side AES: the spec says WebCrypto cannot do no-padding CBC; for whole blocks we encrypt and drop the final 16-byte padding block, which
 *      is the same ciphertext as no-padding CBC (chaining does not look ahead). Decryption (reader only) needs a padding block appended — see ctb3-read.
 *  15. Machine name: ASCII, no terminator, length = byte count (spec's recommendation).
 *  16. Pages: always 0 (files under 4 GiB); a larger file throws.
 */
import { Out, checkSliced, pickOptions } from './rs-cbddlp.js';

export { MAX_PX } from './rs-cbddlp.js';

export const CTB3 = {
  id: 'ctb3', name: 'Chitubox CTB v3 to v5 (.ctb)', ext: 'ctb', mime: 'application/octet-stream',
  options: [
    { id: 'style', values: ['plain', 'encrypted'], default: 'encrypted' },
    { id: 'version', values: ['3', '4', '5'], default: '5' },
    { id: 'antialias', values: ['on', 'off'], default: 'on' },
    { id: 'projection', values: ['mirrored', 'normal'], default: 'mirrored' },
    { id: 'layerCipher', values: ['on', 'off'], default: 'on' },
  ],
};

// ---- constants from the spec ----
export const SEED = 0x67;                                       // spec 2.2.2: fixed reproducible seed
export const CIPHER_ADD = 0xD8A83423;                           // spec 2.2.1
export const AES_KEY_HEX = 'D05B8E3371DE3D1AE54F22DDDF5BFD94AB5D643A9D7EBFAF4203F310D8522AEA';   // spec 6.8
export const AES_IV_HEX = '0F010A05050B060708060A0C0C0D090F';
const SIG_SEED = 0xCAFEBABE;                                    // SPEC-GAP 6
const MARKER_A = 0x422052FA, MARKER_B = 0x6D4232B3;             // spec 6.9
const HEADER_P = 0x70, PARAM_SIZE = 60, SLICER_SIZE = 76, V4_SIZE = 464, EXT_SIZE = 84, ENTRY_SIZE = 36;
const HEADER_E = 48, SETTINGS_E = 288, REC_E = 88, ENTRY_E = 16, DISCLAIMER_LEN = 320, RESIN_FIXED = 40;
const LARGE = [400, 300], SMALL = [200, 125];
const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const hex = (s) => Uint8Array.from(s.match(/../g), (x) => parseInt(x, 16));

/** Our own neutral 320 bytes (SPEC-GAP 1): text, then spaces. */
export function disclaimerBytes() {
  const b = new Uint8Array(DISCLAIMER_LEN).fill(0x20);
  b.set(new TextEncoder().encode("Written by CadCraft's open resin slicer."));
  return b;
}

/** RLE7 of 8-bit grey (spec 2.1): code = g >> 1; run byte has bit 7; run length big-endian 1..4 bytes; runs over 2^28 - 1 are split. */
export function encodeRle7(grey) {
  const out = [];
  const n = grey.length;
  let i = 0;
  while (i < n) {
    const c = grey[i] >> 1;
    let j = i + 1;
    while (j < n && (grey[j] >> 1) === c) j++;
    for (let run = j - i; run > 0;) {
      const r = Math.min(run, 0x0fffffff); run -= r;
      if (r === 1) { out.push(c); continue; }
      out.push(0x80 | c);
      if (r < 0x80) out.push(r);
      else if (r < 0x4000) out.push(0x80 | (r >>> 8), r & 0xff);
      else if (r < 0x200000) out.push(0xc0 | (r >>> 16), (r >>> 8) & 0xff, r & 0xff);
      else out.push(0xe0 | (r >>> 24), (r >>> 16) & 0xff, (r >>> 8) & 0xff, r & 0xff);
    }
    i = j;
  }
  return Uint8Array.from(out);
}

/** Layer keystream (spec 2.2): XOR with K_n = K0 + n·init, little-endian bytes; its own inverse. seed 0 = unchanged copy. */
export function keystreamXor(data, seed, layer) {
  const out = new Uint8Array(data.length);
  if (!seed) { out.set(data); return out; }
  const init = (Math.imul(seed >>> 0, 0x2D83CDAC) + CIPHER_ADD) >>> 0;
  const k0 = Math.imul((Math.imul(layer >>> 0, 0x1E1530CD) + 0xEC3D47CD) >>> 0, init) >>> 0;
  let kn = k0;
  for (let j = 0; j < data.length; j++) {
    if ((j & 3) === 0 && j) kn = (kn + init) >>> 0;
    out[j] = data[j] ^ ((kn >>> ((j & 3) * 8)) & 0xff);
  }
  return out;
}

/** AES-256-CBC without padding for whole blocks, fixed key/IV (spec 6.8), through WebCrypto (SPEC-GAP 14). */
export async function aesEncryptBlocks(data) {
  if (data.length % 16) throw new Error('ctb3: AES input must be whole 16-byte blocks');
  const s = globalThis.crypto && globalThis.crypto.subtle;
  if (!s) throw new Error('ctb3: the encrypted style needs WebCrypto (globalThis.crypto.subtle)');
  const key = await s.importKey('raw', hex(AES_KEY_HEX), 'AES-CBC', false, ['encrypt']);
  const ct = new Uint8Array(await s.encrypt({ name: 'AES-CBC', iv: hex(AES_IV_HEX) }, key, data));
  return ct.slice(0, data.length);                              // drop the padding block WebCrypto appends
}

/** Spec 6.7: AES(SHA-256(8-byte little-endian seed)). */
export async function signatureFor(seedLo, seedHi = 0) {
  const b = new Uint8Array(8), v = new DataView(b.buffer);
  v.setUint32(0, seedLo >>> 0, true); v.setUint32(4, seedHi >>> 0, true);
  const d = new Uint8Array(await globalThis.crypto.subtle.digest('SHA-256', b));
  return aesEncryptBlocks(d);
}

// ---- RGB15-RLE preview (spec 2.3): our own picture, resin-green on dark ----
function previewPixels(sliced, pw, ph) {
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
      const sx = Math.min(w - 1, Math.floor((x - x0) * w / iw)), sy = Math.min(h - 1, Math.floor((y - y0) * h / ih));
      t = acc[sy * w + sx] / 255;
    }
    const c = [0, 1, 2].map((k) => Math.round(bg[k] + (fg[k] - bg[k]) * t));
    out[y * pw + x] = ((c[0] >> 3) << 11) | ((c[1] >> 3) << 6) | (c[2] >> 3);       // bit 5 (repeat flag) clear
  }
  return out;
}
/** Runs of 3 or more identical words use the flag word + 0x3000|extra; shorter runs are literal (spec 2.3). */
export function encodeRgb15Rle(words) {
  const out = [];
  let i = 0;
  while (i < words.length) {
    const p = words[i];
    let j = i + 1;
    while (j < words.length && words[j] === p && j - i < 0xfff) j++;
    const n = j - i;
    if (n >= 3) { out.push(p | 0x20, 0x3000 | (n - 1)); i = j; } else { out.push(p); i++; }
  }
  const b = new Uint8Array(out.length * 2), v = new DataView(b.buffer);
  out.forEach((x, k) => v.setUint16(k * 2, x, true));
  return b;
}

const ascii = (s, max) => String(s).replace(/[^\x20-\x7e]/g, '?').slice(0, max);

export function checkCtb3Options(opt) {
  const ver = +opt.version;
  if (opt.style === 'encrypted' && ver === 3) throw new Error("ctb3: style 'encrypted' needs version 4 or 5 (version 3 exists only as style 'plain')");
  if (opt.layerCipher === 'off' && !(opt.style === 'plain' && ver === 3)) throw new Error("ctb3: layerCipher 'off' is only allowed for style 'plain' version 3 (the spec needs a nonzero seed otherwise)");
  return ver;
}

export async function writeCtb3(sliced, meta = {}) {
  checkSliced(sliced, 'ctb3');
  const opt = pickOptions(CTB3, meta.options);
  const ver = checkCtb3Options(opt);
  const encrypted = opt.style === 'encrypted';
  const { w, h, count } = sliced;
  const pr = meta.printer || {}, rs = meta.resin || {};

  // ---- numbers, in the file's units (= ours; see header) ----
  const layerH = num(meta.layerHeight, sliced.layerHeight);
  const bottomN = Math.max(0, Math.min(count, Math.round(num(rs.bottomLayers))));
  const expo = num(rs.exposure), bExpo = num(rs.bottomExposure, expo), off = num(rs.lightOff);          // s
  const lift = num(rs.liftHeight), liftV = num(rs.liftSpeed), retV = num(rs.retractSpeed);              // mm, mm/min
  const bLift = num(rs.bottomLiftHeight, lift), bLiftV = num(rs.bottomLiftSpeed, liftV);                 // SPEC-GAP 13
  const bRetV = num(rs.bottomRetractSpeed, retV);
  const S2 = 0;                                                                                          // SPEC-GAP 2: every stage-2 value
  const REST = 0;                                                                                        // SPEC-GAP 3: rest times / transition count
  const pwm = Math.max(0, Math.min(255, Math.round(num(rs.pwm, 255))));
  const mm = sliced.mm || pr.mm || [0, 0];
  const platX = num(pr.mm && pr.mm[0], num(mm[0])), platY = num(pr.mm && pr.mm[1], num(mm[1]));
  const platZ = num(pr.mm && pr.mm[2], count * layerH);
  const volume = num(meta.volumeMl), grams = volume * num(rs.density, 1.1), cost = grams / 1000 * num(rs.price);
  const seconds = Math.round(num(meta.seconds));
  const when = meta.time instanceof Date ? meta.time.getTime() : Date.now();
  const minutes = Math.floor(when / 60000);                                                              // SPEC-GAP 12
  const machine = new TextEncoder().encode(ascii(pr.type || pr.name || pr.id || 'CadCraft', 64));      // SPEC-GAP 15
  const aaFlag = opt.antialias === 'on' ? 0x0f : 0x07, aaLevel = opt.antialias === 'on' ? 8 : 1;
  const proj = opt.projection === 'mirrored' ? 1 : 0;
  const seed = opt.layerCipher === 'on' ? SEED : 0;
  const perLayerFlag = encrypted ? 0x40 : ver * 0x10;
  const swVersion = ver === 3 ? 0x01060300 : ver === 4 ? 0x01090000 : 0x02000000;
  const v4plus = ver >= 4;
  const disclaimer = disclaimerBytes();
  const resinType = new TextEncoder().encode('Normal'), resinName = new TextEncoder().encode(ascii(rs.name || 'Standard', 64));

  // ---- layers: RLE7, then keystream (index = layer number) ----
  const blobs = [];
  for (let i = 0; i < count; i++) {
    const g = sliced.layer(i);
    if (!g || g.length !== w * h) throw new Error(`ctb3: layer ${i} is not ${w} × ${h}`);
    blobs.push(keystreamXor(encodeRle7(g), seed, i));
    if (meta.onProgress && (i & 31) === 31) { meta.onProgress((i + 1) / count); await Promise.resolve(); }
  }
  const large = encodeRgb15Rle(previewPixels(sliced, LARGE[0], LARGE[1]));
  const small = encodeRgb15Rle(previewPixels(sliced, SMALL[0], SMALL[1]));
  const lay = (i) => {                                                   // per-layer values
    const b = i < bottomN;
    return { z: Math.fround((i + 1) * layerH), exp: b ? bExpo : expo, off,
      lift: b ? bLift : lift, liftV: b ? bLiftV : liftV, retV: b ? bRetV : retV };
  };
  const resinFixedLen = ver === 5 ? RESIN_FIXED + machine.length + resinType.length + resinName.length : 0;
  const putResin = (o, at) => {                                         // spec 6.6, shared by both styles
    const mAt = at + RESIN_FIXED, tAt = mAt + machine.length, nAt = tAt + resinType.length;
    o.u32(0); o.u8(0x80); o.u8(0x80); o.u8(0x80); o.u8(0);              // padding; blue, green, red, alpha (SPEC-GAP 10)
    o.u32(mAt); o.u32(resinType.length); o.u32(tAt); o.u32(resinName.length); o.u32(nAt); o.u32(machine.length);
    o.f32(num(rs.density, 1.1)); o.u32(0);
    o.bytes(machine); o.bytes(resinType); o.bytes(resinName);
  };

  if (!encrypted) {
    // ================= STYLE P =================
    const largeRec = HEADER_P, smallRec = largeRec + 32 + large.length;
    const paramAt = smallRec + 32 + small.length;
    const slicerAt = paramAt + PARAM_SIZE;
    const afterSlicer = slicerAt + SLICER_SIZE + machine.length;
    const disclAt = afterSlicer, v4At = v4plus ? disclAt + DISCLAIMER_LEN : 0;
    const resinAt = ver === 5 ? v4At + V4_SIZE : 0;
    const tableAt = (ver === 5 ? resinAt + resinFixedLen : v4plus ? v4At + V4_SIZE : afterSlicer);
    const dataAt = tableAt + count * ENTRY_SIZE;
    const pos = [];                                                      // RLE byte position of each layer
    let at = dataAt;
    for (let i = 0; i < count; i++) { pos.push(at + EXT_SIZE); at += EXT_SIZE + blobs[i].length; }
    if (at >= 0x100000000) throw new Error('ctb3: the file would pass 4 GiB (pages are not written)');   // SPEC-GAP 16
    const o = new Out(at);
    // header (0x70), spec 3
    o.u32(ver === 3 ? 0x12fd0086 : 0x12fd0106); o.u32(ver);
    o.f32(platX); o.f32(platY); o.f32(platZ); o.zero(8);
    o.f32(count * layerH); o.f32(layerH); o.f32(expo); o.f32(bExpo); o.f32(off);
    o.u32(bottomN); o.u32(w); o.u32(h);
    o.u32(largeRec); o.u32(tableAt); o.u32(count); o.u32(smallRec); o.u32(seconds);
    o.u32(proj); o.u32(paramAt); o.u32(PARAM_SIZE); o.u32(1);
    o.u16(pwm); o.u16(pwm); o.u32(seed); o.u32(slicerAt); o.u32(SLICER_SIZE);
    // previews: 32-byte record + data (spec 2.4)
    o.u32(LARGE[0]); o.u32(LARGE[1]); o.u32(largeRec + 32); o.u32(large.length); o.zero(16); o.bytes(large);
    o.u32(SMALL[0]); o.u32(SMALL[1]); o.u32(smallRec + 32); o.u32(small.length); o.zero(16); o.bytes(small);
    // print-parameter block (60), spec 4.1; v4+ lift = stage 1 + stage 2
    o.f32(bLift + S2); o.f32(bLiftV); o.f32(lift + S2); o.f32(liftV); o.f32(retV);
    o.f32(volume); o.f32(grams); o.f32(cost); o.f32(off); o.f32(off); o.u32(bottomN); o.zero(16);
    // slicer block (76) + machine name, spec 4.2
    o.f32(S2); o.f32(S2); o.f32(S2); o.f32(S2); o.f32(S2); o.f32(S2); o.f32(REST);
    o.u32(slicerAt + SLICER_SIZE); o.u32(machine.length);
    o.u8(aaFlag); o.zero(2); o.u8(perLayerFlag); o.u32(minutes); o.u32(aaLevel); o.u32(swVersion);
    o.f32(REST); o.f32(REST); o.u32(REST); o.u32(v4At); o.zero(8);
    o.bytes(machine);
    if (v4plus) {
      o.bytes(disclaimer);                                               // spec 4.4: disclaimer first, then the block
      o.f32(bRetV); o.f32(S2); o.u32(0); o.f32(4); o.u32(0); o.f32(4);
      o.f32(REST); o.f32(REST); o.f32(REST); o.f32(S2);
      o.f32(0); o.u32(0);                                                // SPEC-GAP 4
      o.u32(5); o.u32(count - 1); o.zero(16);
      o.u32(disclAt); o.u32(DISCLAIMER_LEN); o.u32(resinAt); o.zero(380);
      if (ver === 5) putResin(o, resinAt);
    }
    // layer table (36 each), then per layer: 84-byte extension + RLE bytes
    const entry = (i) => {
      const L = lay(i);
      return [L.z, L.exp, L.off, pos[i], blobs[i].length, 0, EXT_SIZE];
    };
    const putEntry = (e) => { o.f32(e[0]); o.f32(e[1]); o.f32(e[2]); o.u32(e[3]); o.u32(e[4]); o.u32(e[5]); o.u32(e[6]); o.zero(8); };
    for (let i = 0; i < count; i++) putEntry(entry(i));
    for (let i = 0; i < count; i++) {
      const L = lay(i);
      putEntry(entry(i));
      o.u32(EXT_SIZE + blobs[i].length);
      o.f32(L.lift + S2); o.f32(L.liftV); o.f32(v4plus ? S2 : 0); o.f32(v4plus ? S2 : 0);
      o.f32(L.retV); o.f32(v4plus ? S2 : 0); o.f32(v4plus ? S2 : 0);
      o.f32(v4plus ? REST : 0); o.f32(v4plus ? REST : 0); o.f32(v4plus ? REST : 0);
      o.f32(pwm);
      o.bytes(blobs[i]);
    }
    if (o.o !== o.b.length) throw new Error('ctb3: internal size mismatch');
    return o.b;
  }

  // ================= STYLE E =================
  const largeRec = HEADER_E + SETTINGS_E, smallRec = largeRec + 16 + large.length;
  const machineAt = smallRec + 16 + small.length;
  const disclAt = machineAt + machine.length;
  const resinAt = ver === 5 ? disclAt + DISCLAIMER_LEN : 0;
  const tableAt = disclAt + DISCLAIMER_LEN + resinFixedLen;
  const dataAt = tableAt + count * ENTRY_E;
  const recAt = [];
  let at = dataAt;
  for (let i = 0; i < count; i++) { recAt.push(at); at += REC_E + blobs[i].length; }
  if (at >= 0x100000000) throw new Error('ctb3: the file would pass 4 GiB (pages are not written)');
  const markerAt = at, sigAt = markerAt + (ver === 5 ? 8 : 0);
  const total = sigAt + 32 + 4;
  const o = new Out(total);
  o.zero(HEADER_E + SETTINGS_E);                                         // filled below
  o.u32(LARGE[0]); o.u32(LARGE[1]); o.u32(largeRec + 16); o.u32(large.length); o.bytes(large);
  o.u32(SMALL[0]); o.u32(SMALL[1]); o.u32(smallRec + 16); o.u32(small.length); o.bytes(small);
  o.bytes(machine); o.bytes(disclaimer);
  if (ver === 5) putResin(o, resinAt);
  for (let i = 0; i < count; i++) { o.u32(recAt[i]); o.u32(0); o.u32(REC_E); o.u32(0); }
  for (let i = 0; i < count; i++) {
    const L = lay(i);
    o.u32(REC_E); o.f32(L.z); o.f32(L.exp); o.f32(L.off);
    o.u32(recAt[i] + REC_E); o.u32(0); o.u32(blobs[i].length); o.u32(0);
    o.u32(0); o.u32(0);                                                  // AES-covered offset, length: SPEC-GAP 7
    o.f32(L.lift + S2); o.f32(L.liftV); o.f32(S2); o.f32(S2);
    o.f32(L.retV); o.f32(S2); o.f32(S2);
    o.f32(REST); o.f32(REST); o.f32(REST); o.f32(pwm); o.u32(0);
    o.bytes(blobs[i]);
  }
  if (ver === 5) { o.u32(MARKER_A); o.u32(0); }
  o.bytes(await signatureFor(SIG_SEED));
  o.u32(MARKER_B);
  if (o.o !== total) throw new Error('ctb3: internal size mismatch');

  // settings block (288), spec 6.2: built by offset, then AES-encrypted
  const sb = new Out(SETTINGS_E);
  sb.u32(SIG_SEED); sb.u32(0);
  sb.u32(tableAt); sb.f32(platX); sb.f32(platY); sb.f32(platZ); sb.zero(8);
  sb.f32(count * layerH); sb.f32(layerH); sb.f32(expo); sb.f32(bExpo); sb.f32(off);
  sb.u32(bottomN); sb.u32(w); sb.u32(h); sb.u32(count); sb.u32(largeRec); sb.u32(smallRec); sb.u32(seconds); sb.u32(proj);
  sb.f32(bLift + S2); sb.f32(bLiftV); sb.f32(lift + S2); sb.f32(liftV); sb.f32(retV);
  sb.f32(volume); sb.f32(grams); sb.f32(cost); sb.f32(off);
  sb.u32(1); sb.u16(pwm); sb.u16(pwm); sb.u32(seed);
  sb.f32(S2); sb.f32(S2); sb.f32(S2); sb.f32(S2); sb.f32(S2); sb.f32(S2); sb.f32(REST);
  sb.u32(machineAt); sb.u32(machine.length);
  sb.u8(aaFlag); sb.zero(2); sb.u8(perLayerFlag); sb.u32(minutes); sb.u32(aaLevel);
  sb.f32(REST); sb.f32(REST); sb.u32(REST);
  sb.f32(bRetV); sb.f32(S2); sb.u32(0); sb.f32(4); sb.u32(0); sb.f32(4);
  sb.f32(REST); sb.f32(REST); sb.f32(REST); sb.f32(S2);
  sb.u32(0); sb.u32(0); sb.u32(4); sb.u32(count - 1); sb.zero(16);
  sb.u32(disclAt); sb.u32(DISCLAIMER_LEN); sb.u32(0); sb.u32(resinAt); sb.zero(8);
  if (sb.o !== SETTINGS_E) throw new Error('ctb3: internal settings size mismatch');
  const encSettings = await aesEncryptBlocks(sb.b);
  const hd = new Out(HEADER_E);
  hd.u32(0x12fd0107); hd.u32(SETTINGS_E); hd.u32(HEADER_E); hd.u32(0); hd.u32(ver); hd.u32(32); hd.u32(sigAt); hd.u32(0);
  hd.u16(1); hd.u16(1); hd.u32(0); hd.u32(42); hd.u32(0);
  o.b.set(hd.b, 0); o.b.set(encSettings, HEADER_E);
  return o.b;
}
