#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-shx-fonts.mjs — our own SHX test fonts (0.8 D8.7). Writes compiled shape fonts, built from the published description of the
 * format (the byte codes and the file's index), into fixtures/shx/:
 *
 *   cc-block.shx     shapes 1.0: block capitals L, O, S, M, B, P, F, Z and the digits' stand-ins, every byte code the reader knows
 *   cc-pre.shx       shapes 1.0: lower-case Latin letters mapped to letter shapes drawn in visual order (like a legacy Persian font)
 *   cc-uni.shx       unifont: Arabic-block code points (U+0627, U+0628, U+0644) as strokes
 *   cc-big.shx       bigfont: two characters of a double-byte range, with a primary font's letters beside them
 *
 *   node tools/cadcraft-test/make-shx-fonts.mjs [outdir]       (default fixtures/shx)
 *
 * These fonts are ours (CC0 / Apache-2.0 with the repo). None of them was copied from, or checked against, a font from another
 * program, so a pass here says the reader follows the description, not that it reads every font in the wild.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// ---- byte code assembler ----
export const UP = [2], DOWN = [1], END = [0];
export const vec = (len, dir) => [(len << 4) | dir];                 // dir 0 east … 4 north … 8 west … C south
export const disp = (dx, dy) => [8, dx & 255, dy & 255];
export const disps = (...p) => [9, ...p.flatMap(([x, y]) => [x & 255, y & 255]), 0, 0];
export const octArc = (r, start, span, cw = false) => [0x0a, r, (cw ? 0x80 : 0) | (start << 4) | (span & 7)];
export const fracArc = (so, eo, r, start, span, cw = false) => [0x0b, so, eo, r >> 8, r & 255, (cw ? 0x80 : 0) | (start << 4) | (span & 7)];
export const bulge = (dx, dy, b) => [0x0c, dx & 255, dy & 255, b & 255];
export const mul = (k) => [4, k], div = (k) => [3, k];
export const sub = (n) => [7, n], subWide = (n) => [7, n & 255, n >> 8];
export const PUSH = [5], POP = [6];

const ascii = (s) => [...s].map((c) => c.charCodeAt(0));
const cname = (name) => [...ascii(name), 0];
const u16 = (n) => [n & 255, (n >> 8) & 255];
const u32 = (n) => [n & 255, (n >> 8) & 255, (n >> 16) & 255, (n >>> 24) & 255];

/** glyphs: { code: bytes[] } (the name and the end byte are added). */
export function shapesFont({ name, above, below, glyphs }) {
  const codes = Object.keys(glyphs).map(Number).sort((a, b) => a - b);
  const defs = [[0, [...cname(name), above, below, 0, 0]], ...codes.map((c) => [c, [...cname(String(c)), ...glyphs[c], 0]])];
  const head = [...ascii('AutoCAD-86 shapes 1.0\r\n'), 0x1a, ...u16(0), ...u16(codes[codes.length - 1]), ...u16(defs.length)];
  for (const [c, d] of defs) head.push(...u16(c), ...u16(d.length));
  return Uint8Array.from([...head, ...defs.flatMap(([, d]) => d)]);
}
export function unifont({ name, above, below, glyphs }) {
  const codes = Object.keys(glyphs).map(Number).sort((a, b) => a - b);
  const hdr = [...cname(name), above, below, 0, 0, 0, 0];
  const out = [...ascii('AutoCAD-86 unifont 1.0\r\n'), 0x1a, ...u32(codes.length), ...u16(hdr.length), ...hdr];
  for (const c of codes) { const d = [...cname(String(c)), ...glyphs[c], 0]; out.push(...u16(c), ...u16(d.length), ...d); }
  return Uint8Array.from(out);
}
export function bigfont({ name, above, below, ranges = [[0xa1, 0xfe]], glyphs }) {
  const codes = [0, ...Object.keys(glyphs).map(Number).sort((a, b) => a - b)];
  const defs = new Map([[0, [...cname(name), above, below, 0, 0]], ...Object.keys(glyphs).map((c) => [+c, [...cname(String(c)), ...glyphs[c], 0]])]);
  const hlen = 25 + 4 + ranges.length * 2 + codes.length * 8;
  const out = [...ascii('AutoCAD-86 bigfont 1.0\r\n'), 0x1a, ...u16(codes.length), ...u16(ranges.length), ...ranges.flatMap(([a, b]) => [a, b])];
  let off = hlen;
  for (const c of codes) { const d = defs.get(c); out.push(...u16(c), ...u16(d.length), ...u32(off)); off += d.length; }
  for (const c of codes) out.push(...defs.get(c));
  return Uint8Array.from(out);
}

// ---- the fonts ----
const A = 8;   // capital height in font units
const L = [...UP, ...disp(0, 8), ...DOWN, ...vec(8, 12), ...vec(5, 0), ...UP, ...disp(2, 0), 0];                              // (0,8)→(0,0)→(5,0); next at 7
const BLOCK = {
  76: [...UP, ...disp(0, 8), ...DOWN, ...vec(8, 12), ...vec(5, 0), ...UP, ...disp(2, 0)],                                       // L
  79: [...UP, ...disp(8, 4), ...DOWN, ...octArc(4, 0, 0), ...UP, ...disp(2, -4)],                                               // O: full circle r 4 about (4,4)
  83: [...UP, ...DOWN, ...bulge(8, 0, 127), ...UP, ...disp(2, 0)],                                                              // S: a half circle, 8 across, bulging down
  77: [...UP, ...mul(2), ...DOWN, ...vec(3, 4), ...vec(1, 0), ...vec(3, 12), 3, 2, ...UP, ...disp(2, 0)],                       // M: ×2 scale: up 6, right 2, down 6, then ÷2
  66: [...DOWN, ...sub(76), ...sub(76)],                                                                                         // B: two L's side by side (sub-shape calls)
  80: [...PUSH, ...DOWN, ...vec(8, 4), ...POP, ...UP, ...disp(4, 0)],                                                            // P: a stroke up, popped back, then on
  70: [...DOWN, ...disps([3, 4], [3, -4]), ...UP, ...disp(2, 0)],                                                                // F: displacements (3,4),(3,-4) = a roof
  90: [...DOWN, ...fracArc(0, 0, 4, 0, 4), ...UP, ...disp(2, 0)],                                                                // Z: a quarter-turn of fractional arcs (4 octants, 180°)
  32: [...UP, ...disp(5, 0)],                                                                                                    // space
};
export const FONTS = {
  'cc-block.shx': () => shapesFont({ name: 'CCBLOCK', above: A, below: 2, glyphs: BLOCK }),
  'cc-pre.shx': () => shapesFont({
    name: 'CCPRE', above: A, below: 3,
    glyphs: {
      // a = a dot on a baseline stroke; b = a tall tooth; the shapes lean left to right (visual order, as legacy Persian fonts)
      97: [...DOWN, ...vec(6, 0), ...UP, ...disp(-3, 2), ...DOWN, ...vec(1, 4), ...UP, ...disp(5, -3)],
      98: [...DOWN, ...vec(2, 0), ...vec(6, 4), ...UP, ...disp(2, -6)],
      32: [...UP, ...disp(4, 0)],
    },
  }),
  'cc-uni.shx': () => unifont({
    name: 'CCUNI', above: A, below: 2,
    glyphs: {
      0x0627: [...UP, ...disp(1, 0), ...DOWN, ...vec(8, 4), ...UP, ...disp(2, -8)],                                              // alef: one stroke
      0x0628: [...DOWN, ...vec(6, 0), ...UP, ...disp(-3, -2), ...DOWN, ...vec(1, 12), ...UP, ...disp(5, 3)],                      // beh: a baseline and a dot below
      0x0644: [...UP, ...disp(1, 0), ...DOWN, ...vec(8, 4), ...subWide(0x0627), ...UP, ...disp(2, -8)],                         // lam: a stroke, then the alef shape (a two-byte call in a unifont)
      32: [...UP, ...disp(4, 0)],
    },
  }),
  'cc-big.shx': () => bigfont({
    name: 'CCBIG', above: A, below: 2,
    glyphs: {
      0xa140: [...UP, ...DOWN, ...vec(8, 4), ...vec(4, 0), ...UP, ...disp(2, -8)],
      0xa141: [...DOWN, ...vec(8, 0), ...vec(8, 4), ...UP, ...disp(2, -8)],
      65: [...DOWN, ...vec(8, 2), ...vec(8, 14), ...UP, ...disp(2, 0)],                                                           // a primary letter beside them
    },
  }),
};

if (import.meta.url === 'file://' + process.argv[1]) {
  const out = process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../fixtures/shx');
  fs.mkdirSync(out, { recursive: true });
  for (const [name, make] of Object.entries(FONTS)) { const b = make(); fs.writeFileSync(path.join(out, name), b); console.log(name, b.length + ' bytes'); }
}
