#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plotstyle-handle.mjs — entities whose handle stream carries a plot style handle the plot style flags do not name (0.11, FX row
 * "Plans.dwg loses 15 objects in a DWG round trip"). Plans.dwg (testfiles/powerline-plans) was written by a program that puts
 * the "Normal" plot style placeholder after the layer handle of every entity while the flags say ByLayer (0). Read by the
 * flags alone, the next handle is taken one place early: an INSERT's block became the placeholder (so CadCraft dropped the
 * insert on save as "a block the drawing does not define") and an MTEXT's text style did. lib/dwg/objects-read.js reads such
 * an entity again with the plot style handle when a whole handle is left over; read.js keeps that only when the handle names
 * an ACDBPLACEHOLDER.
 *
 *   node tools/dwg-test/plotstyle-handle.mjs
 *
 * The fixture is made here: our writer writes a small drawing (a block PKT with a circle, two INSERTs of it, an MTEXT in the
 * style Notes, a LINE) as AutoCAD 2004 / 2010 / 2018 while ObjWriter.H is wrapped to add that extra handle after the layer
 * handle of each model-space entity, as the other program does. Checks: the INSERTs keep PKT, the MTEXT keeps Notes, the
 * extra handle is the entity's plot style, written again by writeDwg and read back nothing is lost; and an extra handle that
 * is NOT a placeholder is not taken as a plot style (the first reading stands).
 */
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { REPO } from './lib/util.mjs';

const L = (f) => import(pathToFileURL(path.join(REPO, 'lib/dwg', f)).href);
const { readDwg } = await L('read.js');
const { writeDwg } = await L('write.js');
const OW = await L('objects-write.js');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (c || !extra ? '' : '  — ' + extra)); return !!c; };

const P = (x, y, z = 0) => ({ x, y, z });
const model = () => ({
  header: { INSUNITS: 6 },
  tables: { layers: [{ name: '0', color: { index: 7 } }, { name: 'Poles', color: { index: 1 } }], styles: [{ name: 'Standard', font: 'txt' }, { name: 'Notes', font: 'romans.shx' }] },
  blocks: [
    { name: '*Model_Space', entities: [
      { type: 'INSERT', layer: 'Poles', block: 'PKT', insert: P(10, 20) },
      { type: 'INSERT', layer: '0', block: 'PKT', insert: P(30, 40), scale: P(2, 2, 2), rotation: 0.5 },
      { type: 'MTEXT', layer: '0', insert: P(0, -5), height: 2.5, width: 40, attach: 1, value: 'Pole 12', style: 'Notes' },
      { type: 'LINE', layer: 'Poles', start: P(10, 20), end: P(30, 40) },
    ] },
    { name: '*Paper_Space', entities: [] },
    { name: 'PKT', base: P(0, 0), entities: [{ type: 'CIRCLE', layer: '0', center: P(0, 0), radius: 0.05 }] },
  ],
});
const created = new Date(Date.UTC(2026, 10, 22, 12));
const ms = (m) => m.blocks.find((b) => b.name === '*Model_Space').entities;

/** writeDwg with `extra(rec)` → a handle written after the layer handle of each model-space INSERT / MTEXT / LINE. */
function writeWithExtra(version, extra) {
  const proto = OW.ObjWriter.prototype, H0 = proto.H, wrapped = {};
  let armed = null;
  for (const t of ['INSERT', 'MTEXT', 'LINE']) {
    const enc = OW.ENC[t];
    wrapped[t] = enc;
    // the writer's model-space entities have entity mode 2, no reactors and (2004+) no extension dictionary: the first H is the layer
    OW.ENC[t] = (w, r) => { armed = (r.mode ?? 2) === 2 && !(r.reactors || []).length && !r.xdic ? extra(r) : null; try { return enc(w, r); } finally { armed = null; } };
  }
  proto.H = function (code, v) { H0.call(this, code, v); if (armed != null) { const x = armed; armed = null; H0.call(this, 5, x); } };
  try { return writeDwg(model(), { version, created }).bytes; }
  finally { proto.H = H0; Object.assign(OW.ENC, wrapped); }
}

for (const version of ['AC1018', 'AC1024', 'AC1032']) {
  console.log(`\n== ${version}`);
  const clean = writeDwg(model(), { version, created }).bytes;
  const raw = readDwg(clean, { raw: true });
  const holders = [...raw._records.values()].filter((r) => r.type === 'ACDBPLACEHOLDER');
  if (!ok(holders.length >= 1, 'our writer writes the plot style placeholder (ACDBPLACEHOLDER)')) continue;
  const normal = holders[0].handle;

  // 1. the extra handle is the placeholder: read as the plot style, the rest in place
  const bytes = writeWithExtra(version, () => normal);
  const back = readDwg(bytes, { raw: true });
  const ents = ms(back);
  const ins = ents.filter((e) => e.type === 'INSERT'), mt = ents.find((e) => e.type === 'MTEXT');
  ok(ents.length === 4, '4 model-space entities read', ents.map((e) => e.type).join());
  ok(ins.length === 2 && ins.every((e) => e.block === 'PKT'), 'both INSERTs reference PKT (not the plot style placeholder)', ins.map((e) => e.block).join());
  ok(mt && mt.style === 'Notes', 'the MTEXT keeps its text style Notes', mt?.style);
  const recs = [...back._records.values()].filter((r) => ['INSERT', 'MTEXT', 'LINE'].includes(r.type) && r._psflags === 0);
  ok(recs.length === 4 && recs.every((r) => r._h.plotstyle === normal), 'the extra handle is each entity\'s plot style', recs.map((r) => r._h.plotstyle).join());
  ok(ins[0].layer === 'Poles' && ins[1].layer === '0' && ents.find((e) => e.type === 'LINE').layer === 'Poles', 'layers unchanged');

  // 2. written again and read back: nothing lost (the bug: the INSERTs were not written)
  const again = readDwg(writeDwg(readDwg(bytes), { version, created }).bytes);
  const e2 = ms(again);
  ok(e2.length === 4 && e2.filter((e) => e.type === 'INSERT' && e.block === 'PKT').length === 2, 'round trip through writeDwg keeps both INSERTs of PKT', e2.map((e) => e.type + ':' + (e.block || '')).join());

  // 3. an extra handle that is not a placeholder (here: the text style Notes) is not taken as a plot style
  const notes = [...raw._records.values()].find((r) => r.type === 'STYLE' && r.name === 'Notes');
  if (ok(!!notes, 'the fixture has the style Notes')) {
    const odd = readDwg(writeWithExtra(version, () => notes.handle), { raw: true });
    const or = [...odd._records.values()].filter((r) => ['INSERT', 'MTEXT', 'LINE'].includes(r.type));
    ok(or.every((r) => r._h.plotstyle === undefined), 'a handle that is not a plot style placeholder is not read as one');
  }
  // 4. the clean file reads as before: no plot style where the flags name none
  ok([...raw._records.values()].filter((r) => r.isEntity && r._psflags !== 3).every((r) => r._h.plotstyle === undefined), 'a file without the extra handle: no entity gets a plot style');
}
console.log(`\nplotstyle-handle: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
