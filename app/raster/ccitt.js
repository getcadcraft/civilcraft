/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — codes and tables. */
/**
 * ccitt.js — CCITT Group 4 (ITU-T T.6, TIFF compression 4) decoding, for scanned drawings. DOM-free. The code tables are
 * those of ITU-T T.4 / T.6 (published recommendations); the decoder is ours. 1 bit per pixel in, a row of 0/1 out.
 *
 *   decodeG4(bytes, width, height, { blackIs1 = true }) → Uint8Array(width × height) of 0 / 1, 1 = black (ink); a damaged
 *   or cut-off stream gives the rows it could decode and `rows` says how many.   → { data, rows }
 */
const WT = '00110101 000111 0111 1000 1011 1100 1110 1111 10011 10100 00111 01000 001000 000011 110100 110101 101010 101011 0100111 0001100 0001000 0010111 0000011 0000100 0101000 0101011 0010011 0100100 0011000 00000010 00000011 00011010 00011011 00010010 00010011 00010100 00010101 00010110 00010111 00101000 00101001 00101010 00101011 00101100 00101101 00000100 00000101 00001010 00001011 01010010 01010011 01010100 01010101 00100100 00100101 01011000 01011001 01011010 01011011 01001010 01001011 00110010 00110011 00110100'.split(' ');
const WM = '11011 10010 010111 0110111 00110110 00110111 01100100 01100101 01101000 01100111 011001100 011001101 011010010 011010011 011010100 011010101 011010110 011010111 011011000 011011001 011011010 011011011 010011000 010011001 010011010 011000 010011011'.split(' ');
const BT = '0000110111 010 11 10 011 0011 0010 00011 000101 000100 0000100 0000101 0000111 00000100 00000111 000011000 0000010111 0000011000 0000001000 00001100111 00001101000 00001101100 00000110111 00000101000 00000010111 00000011000 000011001010 000011001011 000011001100 000011001101 000001101000 000001101001 000001101010 000001101011 000011010010 000011010011 000011010100 000011010101 000011010110 000011010111 000001101100 000001101101 000011011010 000011011011 000001010100 000001010101 000001010110 000001010111 000001100100 000001100101 000001010010 000001010011 000000100100 000000110111 000000111000 000000100111 000000101000 000001011000 000001011001 000000101011 000000101100 000001011010 000001100110 000001100111'.split(' ');
const BM = '0000001111 000011001000 000011001001 000001011011 000000110011 000000110100 000000110101 0000001101100 0000001101101 0000001001010 0000001001011 0000001001100 0000001001101 0000001110010 0000001110011 0000001110100 0000001110101 0000001110110 0000001110111 0000001010010 0000001010011 0000001010100 0000001010101 0000001011010 0000001011011 0000001100100 0000001100101'.split(' ');
const EXT = '00000001000 00000001100 00000001101 000000010010 000000010011 000000010100 000000010101 000000010110 000000010111 000000011100 000000011101 000000011110 000000011111'.split(' ');

/** A decoding table: a code of up to 13 bits → (length << 16 | run) in a flat Int32Array indexed by the 13-bit window. */
function table(term, makeup) {
  const T = new Int32Array(1 << 13).fill(-1);
  const put = (code, run) => {
    const n = code.length, v = parseInt(code, 2) << (13 - n);
    for (let k = 0; k < 1 << (13 - n); k++) { if (T[v + k] !== -1) throw new Error('ccitt table clash ' + code); T[v + k] = (n << 16) | run; }
  };
  term.forEach((c, i) => put(c, i));
  makeup.forEach((c, i) => put(c, 64 * (i + 1)));
  EXT.forEach((c, i) => put(c, 1792 + 64 * i));
  return T;
}
const WHITE = table(WT, WM), BLACK = table(BT, BM);

export function decodeG4(src, width, height, { blackIs1 = true } = {}) {
  const out = new Uint8Array(width * height);
  let pos = 0;   // bit position
  const nbits = src.length * 8;
  const peek = (n) => {   // the next n (≤ 13) bits, zero-padded past the end
    let v = 0;
    const byte = pos >> 3;
    v = ((src[byte] || 0) << 16) | ((src[byte + 1] || 0) << 8) | (src[byte + 2] || 0);
    return (v >> (24 - (pos & 7) - n)) & ((1 << n) - 1);
  };
  // changing elements of the reference and the coding line: positions where the colour changes (starting white)
  let ref = new Int32Array(width + 3), cur = new Int32Array(width + 3);
  let nref = 0;
  ref[0] = width; ref[1] = width; nref = 0;   // all white: no change before the end
  let rows = 0;
  const run = (black) => {
    let total = 0;
    for (;;) {
      const e = (black ? BLACK : WHITE)[peek(13)];
      if (e < 0) return -1;
      pos += e >> 16;
      const r = e & 0xffff;
      total += r;
      if (r < 64) return total;
      if (pos > nbits) return -1;
    }
  };
  decode: for (let y = 0; y < height; y++) {
    if (pos >= nbits) break;
    let a0 = -1, ncur = 0, black = false;
    // b1: the first changing element on the reference line right of a0 and of opposite colour to a0's colour
    let bi = 0;
    const findB1 = () => {
      // reference changes alternate: index parity even = white→black (changes TO black)
      while (bi > 0 && ref[bi - 1] > a0) bi--;
      while (bi < nref && (ref[bi] <= a0 || ((bi & 1) === 0) === black)) bi++;
      // `black` is the colour of a0: b1 must change to the opposite, i.e. to white when black. Even index = to black.
      return bi < nref ? ref[bi] : width;
    };
    while (a0 < width) {
      const b1 = findB1();
      const b2 = bi + 1 < nref ? ref[bi + 1] : width;
      const c3 = peek(3);
      if (peek(1) === 1) { pos += 1; a0 = b1; cur[ncur++] = a0; black = !black; }                // V0
      else if (c3 === 3) { pos += 3; a0 = b1 + 1; cur[ncur++] = a0; black = !black; }               // VR1 011
      else if (c3 === 2) { pos += 3; a0 = b1 - 1; cur[ncur++] = a0; black = !black; }               // VL1 010
      else if (c3 === 1) {                                                                          // H 001
        pos += 3;
        const r1 = run(black), r2 = run(!black);
        if (r1 < 0 || r2 < 0) break decode;
        const s = a0 < 0 ? 0 : a0;
        cur[ncur++] = Math.min(width, s + r1); cur[ncur++] = Math.min(width, s + r1 + r2);
        a0 = Math.min(width, s + r1 + r2);
      } else if (peek(4) === 1) { pos += 4; a0 = b2; }                                               // P 0001
      else if (peek(6) === 3) { pos += 6; a0 = b1 + 2; cur[ncur++] = a0; black = !black; }          // VR2 000011
      else if (peek(6) === 2) { pos += 6; a0 = b1 - 2; cur[ncur++] = a0; black = !black; }          // VL2 000010
      else if (peek(7) === 3) { pos += 7; a0 = b1 + 3; cur[ncur++] = a0; black = !black; }          // VR3 0000011
      else if (peek(7) === 2) { pos += 7; a0 = b1 - 3; cur[ncur++] = a0; black = !black; }          // VL3 0000010
      else break decode;                                                                             // EOFB, an extension, or damage
      if (ncur > width + 1 || a0 < -1) break decode;
    }
    // paint the row: changes alternate white → black → white …
    const base = y * width;
    let x = 0, isBlack = false;
    for (let k = 0; k <= ncur; k++) {
      const e = k < ncur ? Math.max(x, Math.min(width, cur[k])) : width;
      if (isBlack) out.fill(1, base + x, base + e);
      x = e; isBlack = !isBlack;
    }
    // the coding line becomes the reference (drop trailing changes at `width`, keep order)
    let m = 0;
    for (let k = 0; k < ncur; k++) { const v = Math.max(0, Math.min(width, cur[k])); if (v >= width) break; cur[m++] = v; }
    // changes must alternate strictly; zero-length runs leave equal neighbours, which is what the reference needs
    const t = ref; ref = cur; cur = t; nref = m; ref[nref] = width; ref[nref + 1] = width;
    rows++;
  }
  if (!blackIs1) for (let i = 0; i < out.length; i++) out[i] ^= 1;
  return { data: out, rows };
}
