#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-gds.mjs — our own small GDSII library for tests (0.8 SU.752 spike), written from the published record description:
 * cell LEAF (a boundary on layer 1, a path on layer 2/5, a text), cell MID (an sref of LEAF reflected, magnified 2 and turned 90°, and a
 * 2 × 3 array of LEAF), cell TOP (an sref of MID at 1000, 500). Units: 1 database unit = 1 nm, 1000 per user unit (µm).
 *   node tools/cadcraft-test/make-gds.mjs [outfile]       (default fixtures/gds/cc-test.gds)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const rec = (type, dt, data = []) => { const n = data.length + 4; return [n >> 8, n & 255, type, dt, ...data]; };
const i16 = (...v) => v.flatMap((x) => [(x >> 8) & 255, x & 255]);
const i32 = (...v) => v.flatMap((x) => [(x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255]);
export function real8(v) {
  if (v === 0) return [0, 0, 0, 0, 0, 0, 0, 0];
  const sign = v < 0 ? 0x80 : 0;
  v = Math.abs(v);
  let e = 0;
  while (v >= 1) { v /= 16; e++; }
  while (v < 1 / 16) { v *= 16; e--; }
  let m = Math.round(v * 72057594037927936);
  const out = [sign | (e + 64)];
  const hi = []; for (let i = 0; i < 7; i++) { hi.unshift(m % 256); m = Math.floor(m / 256); }
  return [...out, ...hi];
}
const str = (s) => { const a = [...s].map((c) => c.charCodeAt(0)); if (a.length % 2) a.push(0); return a; };
const date = i16(2026, 10, 27, 12, 0, 0, 2026, 10, 27, 12, 0, 0);

export function gdsFile() {
  const out = [];
  const R = (...a) => out.push(...rec(...a));
  R(0x00, 2, i16(600)); R(0x01, 2, date); R(0x02, 6, str('CCTEST')); R(0x03, 5, [...real8(0.001), ...real8(1e-9)]);
  const strBegin = (name) => { R(0x05, 2, date); R(0x06, 6, str(name)); };
  strBegin('LEAF');
  R(0x08, 0); R(0x0d, 2, i16(1)); R(0x0e, 2, i16(0)); R(0x10, 3, i32(0, 0, 4000, 0, 4000, 2000, 0, 2000, 0, 0)); R(0x11, 0);
  R(0x09, 0); R(0x0d, 2, i16(2)); R(0x0e, 2, i16(5)); R(0x21, 2, i16(2)); R(0x0f, 3, i32(200)); R(0x10, 3, i32(0, 3000, 5000, 3000)); R(0x11, 0);
  R(0x0c, 0); R(0x0d, 2, i16(63)); R(0x16, 2, i16(0)); R(0x10, 3, i32(100, 100)); R(0x19, 6, str('IN')); R(0x11, 0);
  R(0x07, 0);
  strBegin('MID');
  R(0x0a, 0); R(0x12, 6, str('LEAF')); R(0x1a, 1, i16(0x8000)); R(0x1b, 5, real8(2)); R(0x1c, 5, real8(90)); R(0x10, 3, i32(10000, 0)); R(0x11, 0);
  R(0x0b, 0); R(0x12, 6, str('LEAF')); R(0x13, 2, i16(2, 3)); R(0x10, 3, i32(0, 20000, 2 * 10000, 20000, 0, 20000 + 3 * 5000)); R(0x11, 0);
  R(0x07, 0);
  strBegin('TOP');
  R(0x0a, 0); R(0x12, 6, str('MID')); R(0x10, 3, i32(1000, 500)); R(0x11, 0);
  R(0x07, 0);
  R(0x04, 0);
  return Uint8Array.from(out);
}
if (import.meta.url === 'file://' + process.argv[1]) {
  const f = process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../fixtures/gds/cc-test.gds');
  fs.mkdirSync(path.dirname(f), { recursive: true });
  const b = gdsFile(); fs.writeFileSync(f, b); console.log(f, b.length + ' bytes');
}
