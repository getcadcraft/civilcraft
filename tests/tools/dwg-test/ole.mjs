#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ole.mjs — OLE2FRAME in DWG (0.7 D7.23, session cad-07): the reader keeps the OLE2 data, the writer writes it back.
 *
 *   node tools/dwg-test/ole.mjs
 *
 * Our own round trip only: a model with OLE2FRAME entities (flags, mode, data of several sizes) written as AutoCAD 2000 … 2018
 * and read again — the bytes equal. Not checked against another program: the ODA File Converter drops an OLE2FRAME it reads
 * from a DXF on Linux (it needs Windows' OLE), and the spec (20.4.88) says only "the OLE2 data" and gives no place or corners.
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO } from './lib/util.mjs';
const L = (f) => import(pathToFileURL(path.join(REPO, 'lib/dwg', f)).href);
const { readDwg } = await L('read.js');
const { writeDwg } = await L('write.js');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (c || !extra ? '' : '  — ' + extra)); return !!c; };
const rnd = (n, seed) => { const a = new Uint8Array(n); let x = seed; for (let i = 0; i < n; i++) { x = (x * 1103515245 + 12345) >>> 0; a[i] = x >>> 24; } return a; };
const sizes = [1, 7, 700, 20000];
const extraOk = (es) => es[4] && Buffer.from(es[4].data, 'base64').equals(Buffer.from(rnd(20000, 10))) && es[4].mode === 3;
const model = () => ({ header: {}, tables: { blockRecords: [{ handle: 'A1', name: '*Model_Space' }] }, objects: [],
  blocks: [{ name: '*Model_Space', record: 'A1', entities: [{ type: 'LINE', layer: '0', start: { x: 0, y: 0, z: 0 }, end: { x: 9, y: 9, z: 0 } },
    ...sizes.map((n, i) => ({ type: 'OLE2FRAME', handle: 'B' + (i + 1), layer: i % 2 ? 'Furn' : '0', flags: 2, mode: i, data: rnd(n, 7 + i) })),   // the model may hold the bytes or (as read) their base64
    { type: 'OLE2FRAME', handle: 'B8', layer: '0', flags: 2, mode: 3, data: Buffer.from(rnd(20000, 10)).toString('base64') },
    { type: 'OLE2FRAME', handle: 'B9', layer: '0', flags: 2, mode: 0, data: new Uint8Array(0) }] }] });
for (const v of ['2000', '2004', '2007', '2010', '2013', '2018']) {
  const out = writeDwg(model(), { version: v });
  const back = readDwg(out.bytes);
  const es = back.blocks.flatMap((b) => b.entities).filter((e) => e.type === 'OLE2FRAME');
  ok(es.length === 5, v + ': five OLE objects come back (the empty one is left out)', String(es.length) + ' ' + out.report.notes.join(' | '));
  ok(es.length === 5 && es.slice(0, 4).every((e, i) => e.flags === 2 && e.mode === i && Buffer.from(e.data, 'base64').equals(Buffer.from(rnd(sizes[i], 7 + i)))), v + ': flags, mode and every data byte equal');
  ok(es.length === 5 && es[1].layer === 'Furn', v + ': the layer comes back');
  ok(es.length === 5 && extraOk(es), v + ': an object given as base64 (as a read model holds it) is written the same');
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
