/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: what a person reads goes through msg() (messages.js); the rest is internal diagnostics (the {why} of ccexr.damaged.chunk / ccexr.write.bad_image) and file-format text. */
/**
 * hdr.js — Radiance RGBE (.hdr / .pic) reader and writer, from the published format (Greg Ward, "Real Pixels",
 * Graphics Gems II, 1991, and the Radiance file format notes): a text header ("#?RADIANCE", variables such as
 * FORMAT=32-bit_rle_rgbe and EXPOSURE=), a blank line, a resolution line ("-Y 512 +X 1024"), then rows of 4-byte
 * pixels — mantissas R G B and a shared exponent E — flat, in the old run-length form, or in the "new" per-row form
 * (2 2 hi lo, then each of the four byte planes as runs). A pixel is (m + 0.5) · 2^(E − 136), as Radiance decodes it.
 *
 *   readHdr(bytes, { limits }) → { format: 'hdr', width, height, data: Float32Array RGB (top row first, left to right),
 *                                  exposure (product of EXPOSURE= lines, 1 if none), xyz (FORMAT was 32-bit_rle_xyze),
 *                                  header: { name → text } }
 *   writeHdr({ width, height, data, channels: 3 | 4 }, { rle: true }) → Uint8Array (top-down, "-Y h +X w")
 *   isHdr(bytes)
 * Errors: ExrError codes not_exr (not an HDR file), damaged, too_big.
 */
import { ExrError, LIMITS } from './util.js';
import { msg } from './messages.js';

export function isHdr(b) {
  return b && b.length > 2 && b[0] === 0x23 && b[1] === 0x3f;   // "#?"
}

const dmg = (key, fills) => new ExrError('damaged', msg('ccexr.hdr.damaged', { reason: msg(key, fills) }));

export function readHdr(input, opts = {}) {
  const b = input instanceof Uint8Array ? input : new Uint8Array(input);
  const limits = { ...LIMITS, ...(opts.limits || {}) };
  if (!isHdr(b)) throw new ExrError('not_exr', msg('ccexr.hdr.not_hdr'));
  // header lines up to the blank line, then the resolution line
  let pos = 0;
  const line = () => {
    const start = pos;
    while (pos < b.length && b[pos] !== 0x0a) pos++;
    if (pos >= b.length || pos - start > 4096) return null;
    let s = '';
    for (let i = start; i < pos; i++) s += String.fromCharCode(b[i]);
    pos++;
    return s.replace(/\r$/, '');
  };
  const header = {};
  let exposure = 1;
  let format = null;
  let first = true;
  for (let n = 0; ; n++) {
    const s = line();
    if (s === null || n > 1000) throw dmg('ccexr.hdr.size');
    if (first) { first = false; continue; }   // "#?RADIANCE", "#?RGBE", …
    if (s === '') break;
    if (s.startsWith('#')) continue;
    const eq = s.indexOf('=');
    if (eq > 0) {
      const k = s.slice(0, eq).trim();
      const v = s.slice(eq + 1).trim();
      if (k === 'FORMAT') format = v;
      else if (k === 'EXPOSURE') { const e = Number(v); if (e > 0 && Number.isFinite(e)) exposure *= e; }
      header[k] = k in header ? header[k] + '\n' + v : v;
    }
  }
  if (format && format !== '32-bit_rle_rgbe' && format !== '32-bit_rle_xyze') throw dmg('ccexr.hdr.format', { format });
  const res = line();
  const m = res && res.trim().match(/^([-+])([XY])\s+(\d+)\s+([-+])([XY])\s+(\d+)$/);
  if (!m || m[2] === m[5]) throw dmg('ccexr.hdr.size');
  // the first pair names the slow axis (the rows of the file)
  const n1 = Number(m[3]);
  const n2 = Number(m[6]);
  const yMajor = m[2] === 'Y';
  const width = yMajor ? n2 : n1;
  const height = yMajor ? n1 : n2;
  if (!(width >= 1 && height >= 1)) throw dmg('ccexr.hdr.size');
  if (width * height > limits.pixels) throw new ExrError('too_big', msg('ccexr.hdr.too_big', { n: Math.round(width * height / 1e6) }));
  const rows = n1;
  const len = n2;
  // where file row r, column c lands: Y "-" = top-down, X "+" = left-to-right
  const sY = yMajor ? m[1] : m[4];
  const sX = yMajor ? m[4] : m[1];
  const data = new Float32Array(width * height * 3);
  const scan = new Uint8Array(len * 4);
  const exp = new Float64Array(256);
  for (let e = 1; e < 256; e++) exp[e] = 2 ** (e - 136);
  for (let r = 0; r < rows; r++) {
    pos = readRow(b, pos, scan, len, r);
    for (let c = 0; c < len; c++) {
      let x;
      let y;
      if (yMajor) { y = sY === '-' ? r : height - 1 - r; x = sX === '+' ? c : width - 1 - c; }
      else { x = sX === '+' ? r : width - 1 - r; y = sY === '-' ? c : height - 1 - c; }
      const o = (y * width + x) * 3;
      const e = scan[c * 4 + 3];
      if (!e) { data[o] = data[o + 1] = data[o + 2] = 0; continue; }
      const f = exp[e];
      data[o] = (scan[c * 4] + 0.5) * f;
      data[o + 1] = (scan[c * 4 + 1] + 0.5) * f;
      data[o + 2] = (scan[c * 4 + 2] + 0.5) * f;
    }
  }
  return { format: 'hdr', width, height, data, channels: 3, exposure, xyz: format === '32-bit_rle_xyze', header };
}

function readRow(b, pos, scan, len, r) {
  if (pos + 4 > b.length) throw dmg('ccexr.hdr.short');
  if (len >= 8 && len < 0x8000 && b[pos] === 2 && b[pos + 1] === 2 && !(b[pos + 2] & 0x80)) {
    if (((b[pos + 2] << 8) | b[pos + 3]) !== len) throw dmg('ccexr.hdr.run');
    pos += 4;
    for (let k = 0; k < 4; k++) {
      let i = 0;
      while (i < len) {
        if (pos >= b.length) throw dmg('ccexr.hdr.short');
        let n = b[pos++];
        if (n > 128) {
          n -= 128;
          if (i + n > len || pos >= b.length) throw dmg('ccexr.hdr.run');
          const v = b[pos++];
          for (let j = 0; j < n; j++) scan[(i++) * 4 + k] = v;
        } else {
          if (n === 0 || i + n > len || pos + n > b.length) throw dmg('ccexr.hdr.run');
          for (let j = 0; j < n; j++) scan[(i++) * 4 + k] = b[pos++];
        }
      }
    }
    return pos;
  }
  // flat, or the old run-length form: 1 1 1 n repeats the previous pixel n << shift times
  let i = 0;
  let shift = 0;
  while (i < len) {
    if (pos + 4 > b.length) throw dmg('ccexr.hdr.short');
    if (b[pos] === 1 && b[pos + 1] === 1 && b[pos + 2] === 1) {
      if (!i) throw dmg('ccexr.hdr.run');
      const n = b[pos + 3] * 2 ** shift;
      if (i + n > len) throw dmg('ccexr.hdr.run');
      for (let j = 0; j < n; j++, i++) scan.copyWithin(i * 4, (i - 1) * 4, i * 4);
      shift += 8;
    } else {
      scan[i * 4] = b[pos]; scan[i * 4 + 1] = b[pos + 1]; scan[i * 4 + 2] = b[pos + 2]; scan[i * 4 + 3] = b[pos + 3];
      i++;
      shift = 0;
    }
    pos += 4;
  }
  return pos;
}

/** Radiance's float → RGBE: the largest component sets the exponent; mantissas truncate (decode adds 0.5). */
function toRgbe(r, g, bb, out, o) {
  const v = Math.max(r, g, bb);
  if (!(v > 1e-32)) { out[o] = out[o + 1] = out[o + 2] = out[o + 3] = 0; return; }
  if (!Number.isFinite(v)) { out[o] = out[o + 1] = out[o + 2] = 255; out[o + 3] = 255; return; }
  let e = Math.ceil(Math.log2(v));
  if (2 ** e <= v) e++;            // v < 2^e
  if (2 ** (e - 1) > v) e--;       // v ≥ 2^(e−1): the mantissa of the largest is 128…255
  if (e > 127) e = 127;
  const d = 256 / 2 ** e;
  out[o] = Math.min(255, Math.max(0, Math.floor(r * d)));
  out[o + 1] = Math.min(255, Math.max(0, Math.floor(g * d)));
  out[o + 2] = Math.min(255, Math.max(0, Math.floor(bb * d)));
  out[o + 3] = e + 128;
}

export function writeHdr(img, { rle = true } = {}) {
  const { width, height } = img;
  const ch = img.channels ?? 3;
  if (!(width >= 1 && height >= 1) || (ch !== 3 && ch !== 4) || !img.data || img.data.length < width * height * ch) {
    throw new ExrError('bad_image', msg('ccexr.write.bad_image', { why: 'size or data' }));
  }
  const head = '#?RADIANCE\nFORMAT=32-bit_rle_rgbe\nSOFTWARE=CadCraft\n\n-Y ' + height + ' +X ' + width + '\n';
  const out = [];
  for (let i = 0; i < head.length; i++) out.push(head.charCodeAt(i));
  const px = new Uint8Array(width * 4);
  const parts = [Uint8Array.from(out)];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const s = (y * width + x) * ch;
      toRgbe(img.data[s], img.data[s + 1], img.data[s + 2], px, x * 4);
    }
    if (!rle || width < 8 || width >= 0x8000) { parts.push(px.slice()); continue; }
    const row = [2, 2, width >> 8, width & 255];
    for (let k = 0; k < 4; k++) {
      let i = 0;
      while (i < width) {
        // a run of 3+ equal bytes is worth a run code; otherwise literals up to the next such run
        let run = 1;
        while (i + run < width && run < 127 && px[(i + run) * 4 + k] === px[i * 4 + k]) run++;
        if (run >= 3) { row.push(128 + run, px[i * 4 + k]); i += run; continue; }
        let n = 0;
        while (i + n < width && n < 128) {
          const j = i + n;
          if (j + 2 < width && px[j * 4 + k] === px[(j + 1) * 4 + k] && px[j * 4 + k] === px[(j + 2) * 4 + k]) break;
          n++;
        }
        row.push(n);
        for (let j = 0; j < n; j++) row.push(px[(i + j) * 4 + k]);
        i += n;
      }
    }
    parts.push(Uint8Array.from(row));
  }
  const total = parts.reduce((s, p) => s + p.length, 0);
  const res = new Uint8Array(total);
  let o = 0;
  for (const p of parts) { res.set(p, o); o += p.length; }
  return res;
}
