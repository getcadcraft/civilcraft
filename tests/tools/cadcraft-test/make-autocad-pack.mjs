#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-autocad-pack.mjs — 0.6 DF.10: the DWG files CadCraft writes, packed for the owner to open in DWG TrueView and AutoCAD
 * on Windows (the checklist is docs/DWG-AUTOCAD-CHECK.md). Every file is written by CadCraft's own dwg-save.js.
 *
 *   node tools/cadcraft-test/make-autocad-pack.mjs [--out <dir>]     default /var/www/CADCRAFT/handoff/dwg-autocad-check
 *
 * Folders: 01-features (dwg-save-check.mjs's every-feature drawing in all six versions), 02-samples (DF.9's two samples in 2018
 * and 2000), 03-attributes (a title block after DF.5's BATTMAN and EATTEDIT changes), 04-xclip (a clipped reference, a block
 * the file defines), 05-pictures (a picture + its PNG beside), 06-dynamic (a vendor's public sample with dynamic blocks, opened
 * and saved by CadCraft, and the same with a visibility state switched — only when that sample is on this machine, outside
 * git), 07-ocs (DF.1's fixture saved by CadCraft: mirrored and tilted objects in the plan). Also checklist.csv (one row per
 * file: what to look at, columns for the result) and a .zip of the whole folder beside it. Files outside the repo: the pack
 * holds a vendor sample (06), so it never goes into git or onto the site.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const args = process.argv.slice(2);
const oi = args.indexOf('--out');
const OUT = oi >= 0 ? path.resolve(args[oi + 1]) : '/var/www/CADCRAFT/handoff/dwg-autocad-check';
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { attdef } = await load('attrs.js');
const { saveDwg, DWG_VERSIONS } = await load('dwg-save.js');
const { readDwg } = await load('dwg/read.js');
const { importDwg } = await load('dwg-import.js');
const { readDxf } = await load('dxf.js');
const AE = await load('attedit.js');
const PP = await load('pastepic.js');
const { setVisibility } = await load('dyn-blocks.js');
const { fixture } = await import(pathToFileURL(path.join(ROOT, 'tools/cadcraft-test/dwg-save-check.mjs')).href);

const VERS = ['2000', '2004', '2007', '2010', '2013', '2018'];
const rows = [['folder', 'file', 'version', 'look at', 'TrueView opens (yes/no, message)', 'AutoCAD opens', 'AUDIT (errors found / fixed)', 'what looks wrong']];
fs.rmSync(OUT, { recursive: true, force: true });
const put = (folder, name, bytes, version, look) => {
  fs.mkdirSync(path.join(OUT, folder), { recursive: true });
  fs.writeFileSync(path.join(OUT, folder, name), bytes);
  rows.push([folder, name, version, look, '', '', '', '']);
};
const save = (doc, v) => saveDwg(doc, { version: v }).bytes;
const open = (file) => { const d = new Doc(); const b = fs.readFileSync(file); d.load(file.endsWith('.dxf') ? readDxf(b.toString('latin1')) : importDwg(readDwg(new Uint8Array(b)), { versionTag: 'x' })); d.meta.name = path.basename(file).replace(/\.\w+$/, ''); return d; };

// 01 every feature, six versions
const fx = fixture(Doc, attdef);
for (const v of VERS) put('01-features', `every-feature-${v}.dwg`, save(fx, v), v, 'layers (on, off, frozen, true colour), two sheets mm/in with viewports and their scale, sheet text, a dimension with its own settings, ANSI31 hatch at scale 2 / 15°, a multileader, a named view, architectural length format, a block with attributes');
// 02 samples
for (const s of ['sample-house', 'sample-asbuilt']) {
  const d = open(path.join(APP, 'samples', s + '.dwg'));
  for (const v of ['2018', '2000']) put('02-samples', `${s}-${v}.dwg`, save(d, v), v, s === 'sample-house' ? 'four ARCH D sheets, viewports at 1/4" and 1 1/2" = 1\'-0", title block attributes, doors and windows as blocks (one mirrored), dimensions in feet and inches, EARTH / ANSI31 / ANSI37 hatches' : 'the scan points, revision clouds, dimensions in mm and in ft-in (DIMLFAC), the A3 sheet at 1:25');
}
// 03 attributes after BATTMAN and EATTEDIT
{
  const d = open(path.join(APP, 'samples', 'sample-house.dwg'));
  const blk = d.blocks.get('TB-ARCH-D');
  const defs = [blk.attdefs.find((x) => x.tag === 'SHEET'), ...blk.attdefs.filter((x) => x.tag !== 'SHEET').map((x) => (x.tag === 'DRAWN' ? { ...x, tag: 'DRAWN_BY', prompt: 'Drawn by (initials)' } : x))];
  d.change('BATTMAN', () => AE.applyAttdefs(d, 'TB-ARCH-D', defs, { renames: new Map([['DRAWN', 'DRAWN_BY']]) }));
  const lay = d.layouts[0], ref = [...lay.entities.values()].find((e) => e.type === 'insert');
  d.change('EATTEDIT', () => d.update(ref.id, AE.editedRef(ref, d.blocks.get('TB-ARCH-D'), 'TITLE', { value: 'GROUND FLOOR PLAN', h: 0.5, color: 1 }), lay.entities));
  for (const v of ['2018', '2000']) put('03-attributes', `title-block-edited-${v}.dwg`, save(d, v), v, 'sheet A-101: TITLE reads GROUND FLOOR PLAN, red, taller; every sheet: SHEET is the first attribute, DRAWN is now DRAWN_BY with its value kept (ATTEDIT / the attribute editor show them in that order)');
}
// 04 XCLIP
{
  const d = new Doc();
  d.change('xclip', () => {
    d.defineBlock({ name: 'GRID', base: { x: 0, y: 0 }, entities: [...Array.from({ length: 11 }, (_, i) => ({ type: 'line', layer: '0', x1: i * 10, y1: 0, x2: i * 10, y2: 100 })), ...Array.from({ length: 11 }, (_, i) => ({ type: 'line', layer: '0', x1: 0, y1: i * 10, x2: 100, y2: i * 10 })), { type: 'circle', layer: '0', cx: 50, cy: 50, r: 30 }] });
    d.add({ type: 'insert', layer: '0', block: 'GRID', x: 0, y: 0, sx: 1, sy: 1, rot: 0, clip: { pts: [{ x: 20, y: 20 }, { x: 80, y: 20 }, { x: 80, y: 60 }, { x: 50, y: 80 }, { x: 20, y: 60 }] } });
    d.add({ type: 'insert', layer: '0', block: 'GRID', x: 150, y: 0, sx: 1, sy: 1, rot: 0 });
  });
  for (const v of ['2018', '2000']) put('04-xclip', `xclip-${v}.dwg`, save(d, v), v, 'the left grid clipped to a five-sided outline (XCLIP shows it; the right one whole)');
}
// 05 a picture with its PNG beside
{
  const d = new Doc(); d.meta.name = 'picture';
  const png = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/dwg/example-logo.png')));
  const r = PP.placePastedPicture(d, png, { at: { x: 10, y: 10 }, width: 80 });
  d.change('frame', () => d.add({ type: 'poly', layer: '0', closed: true, pts: [{ x: 0, y: 0, b: 0 }, { x: 100, y: 0, b: 0 }, { x: 100, y: 100, b: 0 }, { x: 0, y: 100, b: 0 }] }));
  for (const v of ['2018', '2000']) put('05-pictures', `picture-${v}.dwg`, save(d, v), v, `the logo inside the square (IMAGE + IMAGEDEF naming ${r.name}, beside the drawing)`);
  fs.writeFileSync(path.join(OUT, '05-pictures', r.name), png);
}
// 06 dynamic blocks (a vendor's public sample, only when it is on this machine)
{
  const src = '/var/www/CADCRAFT/testfiles/dwg-samples/blocks_and_tables_-_imperial.dwg';
  if (fs.existsSync(src)) {
    const d = open(src);
    const own = d.meta.dwgVersion || '2018';
    put('06-dynamic', 'blocks-and-tables-resaved.dwg', saveDwg(d, {}).bytes, 'its own', 'dynamic blocks still dynamic (grips, visibility states), tables, attributes; the file opened and saved by CadCraft unchanged otherwise');
    const ref = [...d.model.values()].find((e) => e.type === 'insert' && e.dyn && d.blocks.get(e.block)?.dyn?.vis?.states?.length > 1) || null;
    if (ref) {
      const states = d.blocks.get(ref.block).dyn.vis.states.map((s) => s.name), next = states.find((s) => s !== (ref.dyn.state ?? states[0]));
      d.change('state', () => setVisibility(d, ref.id, next, d.model));
      put('06-dynamic', 'blocks-and-tables-state-switched.dwg', saveDwg(d, {}).bytes, 'its own', `one reference of ${ref.block} switched to visibility state "${next}": it shows that state and keeps its grips`);
    }
    void own;
  } else console.log('06-dynamic skipped: the vendor sample is not on this machine');
}
// 07 objects in their own coordinate system
{
  const d = open(path.join(ROOT, 'fixtures/dwg/df1-ocs-blocks.dwg'));
  for (const v of ['2018', '2000']) put('07-ocs', `ocs-blocks-${v}.dwg`, save(d, v), v, 'every CASE_ layer where the original (fixtures/dwg/df1-ocs-blocks.dwg) has it: chairs facing the same way, mirrored hatch, tilted circle as an ellipse');
}

const csv = rows.map((r) => r.map((c) => (/[",\n]/.test(c) ? '"' + c.replace(/"/g, '""') + '"' : c)).join(',')).join('\r\n') + '\r\n';
fs.writeFileSync(path.join(OUT, 'checklist.csv'), '﻿' + csv);
fs.writeFileSync(path.join(OUT, 'README.txt'), [
  'CadCraft DWG check pack (0.6 DF.10) - made ' + new Date().toISOString().slice(0, 10),
  '',
  'Every .dwg here was written by CadCraft. Open each one in DWG TrueView (free) and, if you have it, AutoCAD,',
  'and write what you see in checklist.csv (it opens in Excel or LibreOffice).',
  'The steps are in docs/DWG-AUTOCAD-CHECK.md on the server; the short version:',
  '  1. Open the file. Write down any message (recover? errors?) word for word.',
  '  2. AutoCAD only: type AUDIT, answer Y, and note "N errors found, N fixed".',
  '  3. Look at what the "look at" column names: model, each sheet tab, layers, dimensions, hatches, attributes.',
  '  4. Save a screenshot of anything that looks wrong next to the file.',
  'Keep 05-pictures/*.png beside the picture drawings.',
  '06-dynamic holds a vendor\'s sample drawing: do not publish or share this pack.',
].join('\r\n') + '\r\n');
const zip = OUT + '.zip';
fs.rmSync(zip, { force: true });
execFileSync('zip', ['-qr', zip, path.basename(OUT)], { cwd: path.dirname(OUT) });
console.log(`${rows.length - 1} files in ${OUT}, zipped to ${zip}`);
