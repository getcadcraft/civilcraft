#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-ole-dxf.mjs — fixtures/dwg/ole-frame.dxf (0.7 D7.23, session cad-07): a DXF 2000 with two OLE2FRAME objects.
 *
 *   node tools/cadcraft-test/make-ole-dxf.mjs [out.dxf]
 *
 * 1. "Bitmap Image": an OLE2 compound file (tools/fixtures/cfb.mjs, from the MS-CFB spec) with "\u0001CompObj" and a presentation
 *    stream "\u0002OlePres000" holding a 4 × 3 device-independent bitmap (clipboard format 8), frame (10.5, 70.25)–(110.5, 20.25).
 * 2. "Microsoft Excel Worksheet": a compound file with only its "\u0001CompObj" — no picture, so it draws as a labelled frame.
 * Written by us from the public format descriptions: no program's own file. The corners and group codes are the DXF reference's
 * OLE2FRAME (70, 3, 10, 11, 71, 72, 90, 310); whether another program takes these objects is not known (see the log).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { writeCfb } from '../fixtures/cfb.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = process.argv[2] || path.join(ROOT, 'fixtures/dwg/ole-frame.dxf');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const I18n = await import(pathToFileURL(APP + 'i18n.js').href);
I18n.init({ strings: JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8')) });
const { Doc } = await import(pathToFileURL(APP + 'doc.js').href);
const { writeDxf2000 } = await import(pathToFileURL(APP + 'dxf2000.js').href);

const u32 = (n) => { const b = new Uint8Array(4); new DataView(b.buffer).setUint32(0, n >>> 0, true); return b; };
const cat = (...a) => { const o = new Uint8Array(a.reduce((s, x) => s + x.length, 0)); let p = 0; for (const x of a) { o.set(x, p); p += x.length; } return o; };
const compObj = (name) => { const s = new TextEncoder().encode(name + '\0'); return cat(new Uint8Array([1, 0, 0xfe, 0xff, 3, 10, 0, 0, 0xff, 0xff, 0xff, 0xff]), new Uint8Array(16), u32(s.length), s, u32(0), u32(0)); };
const W = 4, H = 3, rowB = (W * 3 + 3) & ~3, px = new Uint8Array(rowB * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const o = y * rowB + x * 3; px[o] = 40 * x; px[o + 1] = 60 * y; px[o + 2] = 200; }   // BGR
const dib = cat(u32(40), u32(W), u32(H), new Uint8Array([1, 0, 24, 0]), u32(0), u32(px.length), u32(2835), u32(2835), u32(0), u32(0), px);
const pres = cat(u32(0xffffffff), u32(8), u32(4), u32(1), u32(0xffffffff), u32(0), u32(0), u32(2000), u32(1500), u32(dib.length), dib);
const bitmap = writeCfb([{ path: '\u0001CompObj', data: compObj('Bitmap Image') }, { path: '\u0002OlePres000', data: pres }]);
const sheet = writeCfb([{ path: '\u0001CompObj', data: compObj('Microsoft Excel Worksheet') }]);

const d = new Doc();
d.meta.units = 'millimeters'; d.meta.name = 'ole-frame';
d.change('seed', () => { d.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 150, y2: 0 }); });
let text = writeDxf2000(d).text.replace(/\r/g, '');
const g = (c, v) => String(c).padStart(3) + '\n' + v + '\n';
const frame = (name, o, data, h) => g(0, 'OLE2FRAME') + g(5, h) + g(100, 'AcDbEntity') + g(8, '0') + g(100, 'AcDbOle2Frame') + g(70, 2) + g(3, name)
  + g(10, o[0]) + g(20, o[1]) + g(30, '0.0') + g(11, o[2]) + g(21, o[3]) + g(31, '0.0') + g(71, 2) + g(72, 0) + g(90, data.length)
  + [...Array(Math.ceil(data.length / 127))].map((_, i) => g(310, [...data.subarray(i * 127, i * 127 + 127)].map((b) => b.toString(16).padStart(2, '0').toUpperCase()).join(''))).join('') + g(1, 'OLE');
const ents = frame('Bitmap Image', ['10.5', '70.25', '110.5', '20.25'], bitmap, 'A001') + frame('Microsoft Excel Worksheet', ['120', '70', '180', '40'], sheet, 'A002');
const at = text.indexOf('  0\nENDSEC', text.indexOf('  2\nENTITIES'));
text = text.slice(0, at) + ents + text.slice(at);
fs.writeFileSync(OUT, text);
console.log('wrote', OUT, text.length, 'bytes');
