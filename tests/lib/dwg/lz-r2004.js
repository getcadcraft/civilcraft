/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lz-r2004.js — decompression of the R2004-family LZ77 variant (R2004, R2010, R2013, R2018 section pages
 * and system pages). cc-dwg (Apache-2.0), written from the ODA "Open Design Specification for .dwg files"
 * v5.4.1, 4.7 "Compression". The compressor lives in lz-r2004-write.js (writer).
 *
 *   decompressR2004(src, from, to, outSize) → Uint8Array(outSize)
 *   decompressR2004(src, from, to, outSize, true) → the same, but a damaged stream does not throw: the bytes decoded up
 *     to the damage are returned, with `.lzError` (the reason) and `.lzLength` (bytes decoded) set on the array (0.6.1:
 *     a page with one bad byte keeps what came before it instead of losing the whole section).
 *
 * Spec gap: 4.7 calls compOffset "offset backwards from the current location" without saying from where;
 * the copy source is (current position − compOffset − 1) — found by decompressing AutoCAD-saved R2004–R2018
 * files: with the − 1 every page map, section map and section decodes, page checksums and section CRCs
 * agree and the section sentinels appear where ch. 9/10 put them.
 */
import { msg } from './messages.js';

export function decompressR2004(src, from, to, outSize, partial = false) {
  const out = new Uint8Array(outSize);
  let ip = from, op = 0;
  if (partial) {
    try { run(); } catch (e) { out.lzError = e.message; }
    out.lzLength = op;
    return out;
  }
  run();
  return out;

  function run() {
    const literalLength = () => {
      const b = src[ip];
      if (b === 0) {
        ip++;
        let total = 0x0F, c;
        while ((c = src[ip++]) === 0) total += 0xFF;
        return total + c + 3;
      }
      if (b & 0xF0) return 0;          // not a length: this byte is the next opcode
      ip++;
      return b + 3;
    };
    const longCount = () => {
      let total = 0, c;
      if ((c = src[ip++]) !== 0) return c;
      total = 0xFF;
      while ((c = src[ip++]) === 0) total += 0xFF;
      return total + c;
    };
    const copyLit = (n) => {
      const k = Math.min(n, outSize - op);
      if (k > 0) out.set(src.subarray(ip, ip + k), op);
      ip += n; op += Math.max(0, k);
    };
    const copyBack = (offset, n) => {
      let s = op - offset - 1;
      if (s < 0) throw new Error(msg('ccdwg.err.lz_before_start'));
      if (op + n > outSize) n = outSize - op;
      for (let i = 0; i < n; i++) out[op++] = out[s++];
    };

    copyLit(literalLength());
    while (ip < to) {
      const op1 = src[ip++];
      if (op1 === 0x11) break;
      let count, offset, lit;
      if (op1 >= 0x40) {
        count = ((op1 & 0xF0) >> 4) - 1;
        const op2 = src[ip++];
        offset = (op2 << 2) | ((op1 & 0x0C) >> 2);
        lit = op1 & 3;
      } else {
        if (op1 === 0x10) { count = longCount() + 9; }
        else if (op1 >= 0x12 && op1 <= 0x1F) { count = (op1 & 0x0F) + 2; }
        else if (op1 === 0x20) { count = longCount() + 0x21; }
        else if (op1 >= 0x21) { count = op1 - 0x1E; }
        else throw new Error(msg('ccdwg.err.lz_opcode', { op: op1.toString(16) }));
        const b1 = src[ip++], b2 = src[ip++];
        offset = (b1 >> 2) | (b2 << 6);
        lit = b1 & 3;
        if (op1 < 0x20) offset += 0x3FFF;
      }
      copyBack(offset, count);
      if (lit === 0) lit = literalLength();
      copyLit(lit);
      if (op >= outSize) break;
    }
  }
}
