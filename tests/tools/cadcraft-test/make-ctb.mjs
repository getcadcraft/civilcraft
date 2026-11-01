#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-ctb.mjs — our own CTB test file (0.8 DC.14). Written from the same description ctb.js reads (a text header, a zlib body of
 * `key=value` and `name{ … }` text): colour 1 → blue, lineweight 0.50 mm, screening 50 %; colour 5 "use object colour"; a
 * description. It tests the reader's plumbing, NOT whether a real CTB looks like this: see ctb.js and docs/spikes/ctb_PART_2.md.
 *
 *   node tools/cadcraft-test/make-ctb.mjs [outdir]       (default fixtures/ctb)
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export function ctbText({ description = '', pens = {}, lw = [0, 0.05, 0.09, 0.13, 0.15, 0.18, 0.2, 0.25, 0.3, 0.35, 0.4, 0.5] } = {}) {
  const L = [`description="${description}"`, 'aci_table_available=TRUE', 'scale_factor=1.000000', 'apply_factor=FALSE', 'custom_lineweight_display_units=0', 'lineweight_table{'];
  lw.forEach((v, i) => L.push(` ${i}=${v.toFixed(6)}`));
  L.push('}', 'aci_table{');
  for (let i = 0; i < 255; i++) {
    const p = pens[i + 1] || {};
    L.push(` ${i}{`, `  name="Color_${i + 1}"`, '  description=""', `  color=${p.color ?? -1}`, '  color_policy=1', '  physical_pen_number=0', '  virtual_pen_number=0', `  screen=${p.screen ?? 100}`, '  linepattern_size=0.5', '  linetype=31', '  adaptive_angle=0.0', `  lineweight=${p.lineweight ?? 0}`, '  endstyle=4', '  joinstyle=6', '  fill_style=73', ' }');
  }
  L.push('}');
  return L.join('\r\n') + '\r\n';
}
export function ctbFile(o) {
  const body = zlib.deflateSync(Buffer.from(ctbText(o), 'latin1'));
  return Uint8Array.from([...Buffer.from('PIAFILEVERSION_2.0,STYLEFILEVERSION_1,compressed\r\npmzlibcodec\r\n', 'latin1'), ...Buffer.from([body.length & 255, (body.length >> 8) & 255, (body.length >> 16) & 255, body.length >>> 24]), ...body]);
}
export const FIXTURES = {
  'cc-test-1.ctb': () => ctbFile({ description: 'CadCraft test 1', pens: { 1: { color: 0xff0000ff | 0, screen: 50, lineweight: 11 }, 3: { lineweight: 3 }, 5: {} } }),
};
if (import.meta.url === 'file://' + process.argv[1]) {
  const out = process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '../../fixtures/ctb');
  fs.mkdirSync(out, { recursive: true });
  for (const [n, mk] of Object.entries(FIXTURES)) { const b = mk(); fs.writeFileSync(path.join(out, n), b); console.log(n, b.length + ' bytes'); }
}
