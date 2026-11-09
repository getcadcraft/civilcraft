/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-pwmx.js — the Anycubic Photon Workshop writers, .pwmx (Photon Mono X) and .pws (Photon S): a Sliced plate in, the bytes of the file out. No DOM, no
 * imports. Written from docs/resin-formats/anycubic-pwmx-SPEC.md ONLY (our own clean-room specification); no third-party implementation was read or
 * recalled. Where the spec is unclear or silent the safest reading of its text is taken and marked `// SPEC-GAP:` (listed below).
 *
 * HONESTY: nothing written here has been loaded on a real Anycubic printer. It is read back by our own reader only (tools/printresin/pwmx-read.mjs, also
 * written from the spec), so it proves the file matches our reading of the spec, not that a machine accepts it.
 *
 * SWITCHABLE CHOICES (chosen per file in meta.options; unknown option or value → throws; missing → the default). The UI labels come from lang keys
 * `opt.<id>` and `opt.<id>.<value>`.
 *   flip     'off' | 'on'          mirror every layer picture left to right before it is encoded (the printer's display may be mirrored)   (default 'off')
 *   version  'v1' | 'v516'         container version; .pwmx only ('v516' adds the grey table, EXTRA and MACHINE sections; .pws is always v1)  (default 'v1')
 *   aa       '1' | '2' | '4' | '8' | '16'   anti-aliasing level written in the header; 1 = black/white pictures, more = grey levels kept         (default '1')
 *   perLayer 'off' | 'on'          header flag "layers carry their own exposure/lift"; the layer records are written either way, with equal values (default 'off')
 *
 * Everything else the spec leaves open is a SPEC-GAP:
 *  - flip: the spec only says the reference reports the display as mirrored and that this is untested; the default stores the picture as sliced. A
 *    printer.flip.x set in the profile also mirrors (spec section 11: "apply printer.flip if set"), so 'off' cannot cancel a profile's flip.
 *  - the layer CRC: step 4 gives C = T[R & 0xFF] * 256 + T[R >> 8] with 16-bit table entries, which can exceed 16 bits; only the two low bytes are stored
 *    (C mod 65536, high byte first). Truncating before or after the sum gives the same two bytes.
 *  - AA > 1 on 4-bit data and on bit planes is UNVERIFIED by the spec (real samples are AA 1); written as the spec's "safe writer policy" text says.
 *  - EXTRA (v516): its stored length is the constant 24 although 56 bytes of fields follow (spec says unexplained); written the same way. Stage counts are
 *    written 2 with stage-2 height 0, basic mode (stage 1 = header lift, every speed slot = the header speed, both retract slots equal).
 *  - MACHINE (v516): property mask 1, layer image format "pw0img", background constant 6506241, max version 516 as listed; display size from the plate /
 *    profile, Z travel from the profile's third mm value else 245 (the spec's Mono X row).
 *  - HEADER weight / price are "any" in the spec: weight = volume ml × resin density (1.1 g/ml when none), price = weight kg × resin price per kg (0 when none);
 *    currency symbol "$".
 *  - lit pixel count (layer record) = pixels that are not black in the picture as written (after flip and quantisation).
 *  - the preview is our own render (every layer's light laid over each other, resin-green on dark), 224 × 168, not a printer render.
 *  - resolution limit: the spec names no limit for v1; 65535 per side is enforced (it is the 16-bit limit the spec names for MACHINE in v518), and a file
 *    over 4 GiB is refused (addresses are u32).
 *  - the transition layer count is 0 and transition type 0 (so the exposure does not ramp); the profile has no ramp.
 *  - pixel pitch is taken from sliced.mm[0] / w (else the printer's mm[0] / w), in micrometres.
 *
 *   PWMX / PWS = { id, name, ext, mime, options: [{ id, values, default }] }
 *   writePwmx(sliced, meta) / writePws(sliced, meta) → Promise<Uint8Array>
 *     sliced: { w, h, layerHeight, count, layer(i) → Uint8Array(w * h), mm: [x, y] }                    see rs-rle.js
 *     meta:   { name, printer: { id, name, mm?: [x, y, z], flip?: { x, y } },
 *               resin: { name, exposure, bottomExposure, bottomLayers, liftHeight, liftSpeed, retractSpeed, lightOff, density?, price? },
 *               layerHeight, volumeMl, seconds, onProgress?(0..1), options? }
 *   Units: times s (unchanged), distances mm (unchanged), speeds mm/min IN → mm/s OUT (÷ 60), volume ml unchanged, print time rounded seconds,
 *          pixel pitch µm = mm / px × 1000, bottom layer count stored as a float.
 *   MAX_PX
 *
 * File order (spec section 2): mark, HEADER, PREVIEW, [grey table (v516)], LAYERDEF, [EXTRA, MACHINE (v516)], layer pictures. Little-endian throughout.
 * 4-bit pictures (.pwmx): high nibble of each pixel (0/15 only when aa = 1), runs, 2-byte CRC after each layer. .pws: bit planes, no CRC.
 */
const OPTS = {
  flip: { id: 'flip', values: ['off', 'on'], default: 'off' },
  version: { id: 'version', values: ['v1', 'v516'], default: 'v1' },
  aa: { id: 'aa', values: ['1', '2', '4', '8', '16'], default: '1' },
  perLayer: { id: 'perLayer', values: ['off', 'on'], default: 'off' },
};
export const PWMX = { id: 'pwmx', name: 'Anycubic Photon Workshop (.pwmx)', ext: 'pwmx', mime: 'application/octet-stream', options: [OPTS.flip, OPTS.version, OPTS.aa, OPTS.perLayer] };
export const PWS = { id: 'pws', name: 'Anycubic Photon Workshop (.pws)', ext: 'pws', mime: 'application/octet-stream', options: [OPTS.flip, OPTS.aa, OPTS.perLayer] };
export const MAX_PX = 65535;

function pickOptions(fmt, given) {
  const g = given || {}, out = {};
  for (const k of Object.keys(g)) if (!fmt.options.some((o) => o.id === k)) throw new Error(`${fmt.id}: unknown option "${k}"`);
  for (const o of fmt.options) {
    const v = g[o.id] !== undefined && g[o.id] !== null ? String(g[o.id]) : o.default;
    if (!o.values.includes(v)) throw new Error(`${fmt.id}: option ${o.id} cannot be '${v}' (use ${o.values.join(', ')})`);
    out[o.id] = v;
  }
  return out;
}

const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
const PW = 224, PH = 168, PREVIEW_BYTES = PW * PH * 2;
const SIZE_PREVIEW = 16 + 12 + PREVIEW_BYTES;       // 75292
const SIZE_GREY = 28, SIZE_EXTRA = 16 + 56, SIZE_MACHINE = 156;

class Out {
  constructor(n) { this.b = new Uint8Array(n); this.v = new DataView(this.b.buffer); this.o = 0; }
  u8(x) { this.b[this.o++] = x & 0xff; }
  u32(x) { this.v.setUint32(this.o, x >>> 0, true); this.o += 4; }
  f32(x) { this.v.setFloat32(this.o, x, true); this.o += 4; }
  bytes(a) { this.b.set(a, this.o); this.o += a.length; }
  text(s, n) {                      // fixed-width ASCII, zero padded
    const t = String(s ?? '').replace(/[^\x20-\x7e]/g, '?').slice(0, n);
    for (let i = 0; i < n; i++) this.b[this.o + i] = i < t.length ? t.charCodeAt(i) : 0;
    this.o += n;
  }
  zero(n) { this.o += n; }
}

// Layer CRC (spec 6.2): the reflected CRC-16 table (polynomial 0xA001), then the two-table scheme.
const T = (() => { const t = new Uint16Array(256); for (let i = 0; i < 256; i++) { let v = i; for (let k = 0; k < 8; k++) v = v & 1 ? (v >>> 1) ^ 0xa001 : v >>> 1; t[i] = v; } return t; })();
export function layerCrc(data) {
  let r = 0;
  for (let i = 0; i < data.length; i++) r = ((r << 8) & 0xffff) ^ T[((r >> 8) ^ T[data[i]]) & 0xff];
  return ((T[r & 0xff] * 256 + T[r >> 8]) & 0xffff);           // SPEC-GAP: low 16 bits of the spec's C (see header)
}

function mirror(g, w, h) {
  const o = new Uint8Array(g.length);
  for (let y = 0; y < h; y++) { const r = y * w; for (let x = 0; x < w; x++) o[r + x] = g[r + w - 1 - x]; }
  return o;
}

/** 224 × 168 RGB565 (little-endian words): all layers' light overlaid (sampled to ≤ 24), plate fitted with its proportions, area-averaged. */
function preview(sliced) {
  const { w, h, count } = sliced;
  const acc = new Uint8Array(w * h), step = Math.max(1, Math.ceil(count / 24));
  for (let i = 0; i < count; i += step) { const g = sliced.layer(i); for (let k = 0; k < acc.length; k++) if (g[k] > acc[k]) acc[k] = g[k]; }
  const s = Math.min(PW / w, PH / h), pw = Math.max(1, Math.round(w * s)), ph = Math.max(1, Math.round(h * s));
  const x0 = (PW - pw) >> 1, y0 = (PH - ph) >> 1;
  const out = new Uint8Array(PREVIEW_BYTES), v = new DataView(out.buffer);
  const bg = [16, 18, 22], fg = [96, 230, 150];
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    let t = 0;
    if (x >= x0 && x < x0 + pw && y >= y0 && y < y0 + ph) {
      const sx0 = Math.floor((x - x0) * w / pw), sx1 = Math.max(sx0 + 1, Math.floor((x - x0 + 1) * w / pw));
      const sy0 = Math.floor((y - y0) * h / ph), sy1 = Math.max(sy0 + 1, Math.floor((y - y0 + 1) * h / ph));
      let sum = 0, n = 0;
      for (let yy = sy0; yy < sy1 && yy < h; yy++) for (let xx = sx0; xx < sx1 && xx < w; xx++) { sum += acc[yy * w + xx]; n++; }
      t = n ? sum / n / 255 : 0;
    }
    const c = [0, 1, 2].map((k) => Math.round(bg[k] + (fg[k] - bg[k]) * t));
    v.setUint16((y * PW + x) * 2, ((c[0] >> 3) << 11) | ((c[1] >> 2) << 5) | (c[2] >> 3), true);
  }
  return out;
}

/** Grey → level lookup. 4-bit: aa 1 → nibble 0/15 at 128, else the high nibble. Bit planes: the number of planes whose threshold the grey reaches (spec 6.1). */
function levelTable(pws, aa) {
  const lut = new Uint8Array(256);
  for (let g = 0; g < 256; g++) {
    if (pws) { let c = 0; for (let k = 1; k <= aa; k++) if (g >= Math.floor(255 * k / (aa + 1)) + 1) c++; lut[g] = c; }
    else lut[g] = aa === 1 ? (g >= 128 ? 15 : 0) : g >> 4;
  }
  return lut;
}

/** 4-bit runs (spec 6.2) + 2-byte CRC. */
function encode4(levels) {
  const out = [];
  const n = levels.length;
  let i = 0;
  while (i < n) {
    const v = levels[i];
    let j = i + 1;
    while (j < n && levels[j] === v) j++;
    const long = v === 0 || v === 15, max = long ? 4095 : 15;
    for (let run = j - i; run > 0;) {
      const len = Math.min(run, max);
      run -= len;
      if (long) out.push((v << 4) | (len >> 8), len & 0xff); else out.push((v << 4) | len);
    }
    i = j;
  }
  const c = layerCrc(out);
  out.push(c >> 8, c & 0xff);
  return Uint8Array.from(out);
}

/** Bit planes (spec 6.1): plane k lit where level >= k (thresholds rise with k, so this is the spec's per-plane threshold test); single-byte runs ≤ 125. */
function encodePlanes(levels, aa) {
  const out = [];
  const n = levels.length;
  for (let k = 1; k <= aa; k++) {
    let i = 0;
    while (i < n) {
      const st = levels[i] >= k ? 1 : 0;
      let j = i + 1;
      while (j < n && (levels[j] >= k ? 1 : 0) === st) j++;
      for (let run = j - i; run > 0;) { const len = Math.min(run, 125); run -= len; out.push((st << 7) | len); }
      i = j;
    }
  }
  return Uint8Array.from(out);
}

async function build(fmt, sliced, meta = {}) {
  const opt = pickOptions(fmt, meta.options), name = fmt.id;
  const pws = name === 'pws', v516 = opt.version === 'v516', AA = +opt.aa;
  const { w, h, count } = sliced;
  if (!Number.isInteger(w) || !Number.isInteger(h) || w < 1 || h < 1) throw new Error(`${name}: the layer size must be whole pixels`);
  if (w > MAX_PX || h > MAX_PX) throw new Error(`${name}: ${w} × ${h} px is too large; at most ${MAX_PX} px on each side`);
  if (!Number.isInteger(count) || count < 1) throw new Error(`${name}: there are no layers to write`);
  const pr = meta.printer || {}, rs = meta.resin || {};
  const layerH = num(meta.layerHeight, sliced.layerHeight);
  const bottomN = Math.max(0, Math.min(count, Math.round(num(rs.bottomLayers))));
  const expo = num(rs.exposure), bExpo = num(rs.bottomExposure, expo);
  const lift = num(rs.liftHeight), liftV = num(rs.liftSpeed) / 60, retV = num(rs.retractSpeed) / 60;   // mm/min → mm/s
  const wait = num(rs.lightOff);
  const mm = sliced.mm || pr.mm || [0, 0];
  const pitch = num(mm[0]) / w * 1000;                                                                    // µm per pixel
  const grams = num(meta.volumeMl) * num(rs.density, 1.1), price = grams / 1000 * num(rs.price);
  const doFlip = opt.flip === 'on' || !!(pr.flip && pr.flip.x);
  const lut = levelTable(pws, AA);

  // pictures first (their sizes decide every address)
  const pics = [], lit = [];
  let picBytes = 0;
  for (let i = 0; i < count; i++) {
    let g = sliced.layer(i);
    if (!g || g.length !== w * h) throw new Error(`${name}: layer ${i} is not ${w} × ${h}`);
    if (doFlip) g = mirror(g, w, h);
    const lv = new Uint8Array(g.length);
    let n = 0;
    for (let k = 0; k < g.length; k++) { const l = lut[g[k]]; lv[k] = l; if (l) n++; }
    const bytes = pws ? encodePlanes(lv, AA) : encode4(lv);
    pics.push(bytes); lit.push(n); picBytes += bytes.length;
    if (meta.onProgress && (i & 31) === 31) { meta.onProgress((i + 1) / count); await Promise.resolve(); }
  }

  const markSize = v516 ? 52 : 48, headSize = v516 ? 100 : 96;
  const headAddr = markSize, prevAddr = headAddr + headSize;
  const greyAddr = v516 ? prevAddr + SIZE_PREVIEW : 0;
  const ldAddr = prevAddr + SIZE_PREVIEW + (v516 ? SIZE_GREY : 0), ldSize = 20 + 32 * count;
  const extraAddr = v516 ? ldAddr + ldSize : 0, machAddr = v516 ? extraAddr + SIZE_EXTRA : 0;
  const picAddr = v516 ? machAddr + SIZE_MACHINE : ldAddr + ldSize;
  const total = picAddr + picBytes;
  if (total > 0xffffffff) throw new Error(`${name}: the file would be over 4 GiB`);

  const o = new Out(total);
  // file mark (spec 3)
  o.text('ANYCUBIC', 12); o.u32(v516 ? 516 : 1); o.u32(v516 ? 8 : 4);
  o.u32(headAddr); o.u32(0); o.u32(prevAddr); o.u32(greyAddr); o.u32(ldAddr); o.u32(extraAddr);
  if (v516) o.u32(machAddr);
  o.u32(picAddr);
  // HEADER (spec 4)
  o.text('HEADER', 12); o.u32(headSize - 16);
  o.f32(pitch); o.f32(layerH); o.f32(expo); o.f32(wait); o.f32(bExpo); o.f32(bottomN);
  o.f32(lift); o.f32(liftV); o.f32(retV); o.f32(num(meta.volumeMl));
  o.u32(AA); o.u32(w); o.u32(h); o.f32(grams); o.f32(price);
  o.text('$', 4);
  o.u32(opt.perLayer === 'on' ? 1 : 0);
  o.u32(Math.round(num(meta.seconds)));
  o.u32(0); o.u32(0);                                      // transition layer count, transition type
  if (v516) o.u32(0);                                      // advanced mode: basic
  // PREVIEW (spec 5.1)
  o.text('PREVIEW', 12); o.u32(12 + PREVIEW_BYTES); o.u32(PW); o.u32(42); o.u32(PH); o.bytes(preview(sliced));
  // grey table (spec 7)
  if (v516) {
    o.u32(0); o.u32(16);
    for (let i = 0; i < 16; i++) o.u8(Math.min(255, Math.trunc((i + 1) * 255 / AA)));
    o.u32(0);
  }
  // LAYERDEF (spec 8)
  o.text('LAYERDEF', 12); o.u32(4 + 32 * count); o.u32(count);
  let at = picAddr;
  for (let i = 0; i < count; i++) {
    o.u32(at); o.u32(pics[i].length);
    o.f32(lift); o.f32(liftV); o.f32(i < bottomN ? bExpo : expo); o.f32(layerH);
    o.u32(lit[i]); o.u32(0);
    at += pics[i].length;
  }
  if (v516) {
    // EXTRA (spec 9.1), basic mode
    o.text('EXTRA', 12); o.u32(24);
    for (const grp of [0, 1]) { void grp; o.u32(2); o.f32(lift); o.f32(liftV); o.f32(retV); o.f32(0); o.f32(liftV); o.f32(retV); }
    // MACHINE (spec 9.2)
    o.text('MACHINE', 12); o.u32(SIZE_MACHINE);
    o.text(pr.name || 'Photon Mono X', 96); o.text('pw0img', 16);
    o.u32(16); o.u32(1); o.f32(num(mm[0])); o.f32(num(mm[1])); o.f32(num(pr.mm && pr.mm[2], 245)); o.u32(516); o.u32(6506241);
  }
  for (const p of pics) o.bytes(p);
  if (o.o !== total) throw new Error(`${name}: internal size mismatch`);
  return o.b;
}

export const writePwmx = (sliced, meta) => build(PWMX, sliced, meta);
export const writePws = (sliced, meta) => build(PWS, sliced, meta);
