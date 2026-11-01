/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — PDF syntax; no words. */
/**
 * pdf.js — pictures in a PDF (0.8 D8.8 round 3, session d88b_PART_3; canonical in lib/picture, rule 39: a host carries a byte copy written by
 * tools/picture/sync.mjs). From the published PDF specification (ISO 32000-1 §8.9 Images, §7.4.4 Flate, §7.4.8 DCT, §8.4.5 graphics state
 * parameter dictionaries: /ca, /CA): an image is an XObject stream; a JPEG goes in as it is (DCTDecode), anything else as raw 8-bit RGB
 * under FlateDecode with a soft mask (/SMask, an 8-bit gray image) for the alpha. DOM-free, no imports: decoding a PNG / WebP to pixels is the
 * host's (a canvas); this file only builds the objects and the page operators.
 *
 *   jpegInfo(bytes) → { w, h, comps, bits, orientation } | null        from the markers (SOF and the Exif orientation tag)
 *   directJpeg(bytes) → info | null       the JPEG can go in as it is: 8-bit gray or YCbCr/RGB, no Exif turn, not CMYK
 *   printSize({ w, h, mmPerPx, ratio, maxDpi, maxPixels }) → { w, h, k, dpi }   the pixel size to draw for a sheet at 1:ratio (never more than maxDpi on paper)
 *   imageObjects(img, first) → { objs: [{ dict, data }], name }  img: { kind: 'jpeg', bytes, w, h, comps } | { kind: 'flate', w, h, rgb (zlib bytes), alpha (zlib bytes | null) };
 *        `first` is the object number the image will have; the soft mask (if any) is first + 1. dict is the text between << >> without /Length (the writer adds it).
 *   unitMatrix(m, w, h) → [a, b, c, d, e, f]   picture.js matrix (pixels → plan mm) turned into the image XObject's unit square (x right, y UP) → plan mm
 *   drawOps({ im, gs, cm }) → string       "q /GS0 gs a b c d e f cm /Im0 Do Q"
 *   gsDict(opacity) → string               "<< /Type /ExtGState /ca 0.5 /CA 0.5 >>"
 */
const n = (v) => { const s = (Math.abs(v) < 5e-7 ? 0 : v).toFixed(6); return s.replace(/\.?0+$/, '') || '0'; };

export function jpegInfo(b) {
  if (!b || b.length < 4 || b[0] !== 0xff || b[1] !== 0xd8) return null;
  let o = 2, info = null, orientation = 1;
  while (o + 4 <= b.length) {
    if (b[o] !== 0xff) { o++; continue; }
    const m = b[o + 1];
    if (m === 0xff) { o++; continue; }
    if (m === 0xd8 || m === 0x01 || (m >= 0xd0 && m <= 0xd7)) { o += 2; continue; }
    const len = (b[o + 2] << 8) | b[o + 3];
    if (len < 2) return null;
    if (m === 0xe1 && len > 14 && b[o + 4] === 0x45 && b[o + 5] === 0x78 && b[o + 6] === 0x69 && b[o + 7] === 0x66) {   // "Exif"
      const t = o + 10, le = b[t] === 0x49;
      const u16 = (p) => (le ? b[p] | (b[p + 1] << 8) : (b[p] << 8) | b[p + 1]);
      const u32 = (p) => (le ? (b[p] | (b[p + 1] << 8) | (b[p + 2] << 16) | (b[p + 3] << 24)) >>> 0 : ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0);
      const ifd = t + u32(t + 4);
      if (ifd + 2 < b.length) {
        const cnt = u16(ifd);
        for (let i = 0; i < cnt && ifd + 2 + i * 12 + 12 <= b.length; i++) {
          const e = ifd + 2 + i * 12;
          if (u16(e) === 0x0112) { orientation = u16(e + 8); break; }
        }
      }
    }
    if ((m >= 0xc0 && m <= 0xcf) && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) {
      info = { bits: b[o + 4], h: (b[o + 5] << 8) | b[o + 6], w: (b[o + 7] << 8) | b[o + 8], comps: b[o + 9] };
      break;
    }
    o += 2 + len;
  }
  return info && info.w && info.h ? { ...info, orientation } : null;
}
export function directJpeg(b) {
  const i = jpegInfo(b);
  return i && i.bits === 8 && (i.comps === 1 || i.comps === 3) && i.orientation === 1 ? i : null;
}

/** The pixels to draw a picture at on a sheet at 1:ratio: paper mm per pixel = mmPerPx / ratio, so dpi = 25.4 / that. */
export function printSize({ w, h, mmPerPx, ratio, maxDpi = 200, maxPixels = 16e6 }) {
  const paperMm = mmPerPx / ratio, dpi = paperMm > 0 ? 25.4 / paperMm : Infinity;
  let k = dpi > maxDpi ? maxDpi / dpi : 1;
  if (w * h * k * k > maxPixels) k = Math.sqrt(maxPixels / (w * h));
  k = Math.min(1, k);
  return { w: Math.max(1, Math.round(w * k)), h: Math.max(1, Math.round(h * k)), k, dpi: Math.round(Math.min(dpi, 99999)) };
}

export function imageObjects(img, first) {
  const base = `/Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /BitsPerComponent 8`;
  if (img.kind === 'jpeg') {
    return { name: 'jpeg', objs: [{ dict: `${base} /ColorSpace ${img.comps === 1 ? '/DeviceGray' : '/DeviceRGB'} /Filter /DCTDecode`, data: img.bytes }] };
  }
  const objs = [{ dict: `${base} /ColorSpace /DeviceRGB /Filter /FlateDecode${img.alpha ? ` /SMask ${first + 1} 0 R` : ''}`, data: img.rgb }];
  if (img.alpha) objs.push({ dict: `/Type /XObject /Subtype /Image /Width ${img.w} /Height ${img.h} /BitsPerComponent 8 /ColorSpace /DeviceGray /Filter /FlateDecode`, data: img.alpha });
  return { name: 'flate', objs };
}

/** pixel (u, v: right, down) = plan mm through m; the unit square (s, t: right, up) has u = s·w, v = (1 − t)·h. */
export function unitMatrix(m, w, h) {
  return [m[0] * w, m[1] * w, -m[2] * h, -m[3] * h, m[4] + m[2] * h, m[5] + m[3] * h];
}
export const drawOps = ({ im, gs, cm }) => `q ${gs ? '/' + gs + ' gs ' : ''}${cm.map(n).join(' ')} cm /${im} Do Q`;
export const gsDict = (opacity) => `<< /Type /ExtGState /ca ${n(opacity)} /CA ${n(opacity)} >>`;
