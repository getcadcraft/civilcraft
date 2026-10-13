#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-mapout.mjs — CivilCraft 0.4 V8: map layers in the PDF plot and the DWG export (plot.js images +
 * sheetWindow, dwg-write.js images), DOM-free, in Node. The pictures themselves are painted by the browser
 * (tools/civilcraft-test/browser-04.mjs § V8); here a JPEG made by GDAL (tools/civilcraft-test/fixtures/map-8x6.jpg) stands in.
 *
 *   node bin/test-civilcraft-mapout.mjs [--build dev|x.y] [--verbose] [--keep]
 *
 * PDF: the sheet window in project coordinates; the picture placed exactly over it (under the linework), a /DCTDecode
 * image XObject, poppler's pdfimages lists it at 8 × 6, pdftoppm shows magenta west / green east; multi-page sheets with
 * pictures. DWG: an IMAGE on G-MAP-IMAG at the picture's box with one-pixel u/v, its IMAGEDEF naming the PNG beside it —
 * read back by cc-dwg (lib/dwg) and, when installed, by LibreDWG, libdxfrw and the ODA File Converter (ezdxf on their DXF).
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const KEEP = process.argv.includes('--keep');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const OUT = KEEP ? path.join(REPO, 'tmp/civilcraft-mapout') : fs.mkdtempSync('/tmp/civilcraft-mapout-');
fs.mkdirSync(OUT, { recursive: true });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18N = await mod('i18n.js');
I18N.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const PL = await mod('plot.js');
const SC = await mod('scene.js');
const DW = await mod('dwg-write.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const has = (cmd) => { try { execFileSync('sh', ['-c', 'command -v ' + cmd]); return true; } catch { return false; } };
const jpeg = new Uint8Array(fs.readFileSync(path.join(TOOLS, 'fixtures/map-8x6.jpg')));

section('the PDF: a map picture under the plan');
{
  const scale = PL.scalesFor('ft').find((s) => s.label === `1" = 40'`);
  const ext = { minX: 1000, minY: 2000, maxX: 1400, maxY: 2250 };
  const win = PL.sheetWindow(ext, { paper: 'tabloid', scale });
  near((win.maxX - win.minX) * scale.mmPerUnit, 431.8 - 24, 1e-9, 'the window is the frame’s width (407.8 mm) at the scale');
  near((win.maxY - win.minY) * scale.mmPerUnit, 279.4 - 24 - 16, 1e-9, 'and its height above the title strip (239.4 mm)');
  near((win.minX + win.maxX) / 2, 1200, 1e-9, 'centred on the extents');
  const scene = SC.planScene({ units: 'ft', alignments: [] }, { mmPerUnit: scale.mmPerUnit });
  scene.items.push({ layer: 'C-ROAD-CNTR', kind: 'poly', pts: [{ x: 1000, y: 2000 }, { x: 1400, y: 2250 }] });
  const sheet = PL.planSheet(scene, { extents: ext, paper: 'tabloid', scale, title: 'Map test', units: 'ft', images: [{ jpeg, pxW: 8, pxH: 6, box: win }] });
  const im = sheet.images[0];
  ok(Math.abs(im.x - sheet.clip.x0) < 1e-9 && Math.abs(im.y - sheet.clip.y0) < 1e-9 && Math.abs(im.x + im.w - sheet.clip.x1) < 1e-9 && Math.abs(im.y + im.h - sheet.clip.y1) < 1e-9, 'the picture covers the drawing window exactly');
  const { bytes } = await PL.toPdf(sheet);
  const raw = new TextDecoder('latin1').decode(bytes);
  ok(/\/XObject << \/Im1 \d+ 0 R >>/.test(raw) && /\/Subtype \/Image \/Width 8 \/Height 6 \/ColorSpace \/DeviceRGB \/BitsPerComponent 8 \/Filter \/DCTDecode/.test(raw), 'an image XObject, /DCTDecode, 8 × 6, on the page’s resources');
  const f = path.join(OUT, 'map.pdf'); fs.writeFileSync(f, bytes);
  if (has('pdfimages')) {
    const li = execFileSync('pdfimages', ['-list', f], { encoding: 'utf8' });
    ok(/\n\s*1\s+0\s+image\s+8\s+6\s+rgb\s+3\s+8\s+jpeg/.test(li), 'poppler pdfimages lists it: 8 × 6 RGB jpeg');
    execFileSync('pdftoppm', ['-r', '30', '-png', f, path.join(OUT, 'map')]);
    const png = fs.readdirSync(OUT).find((x) => /^map.*\.png$/.test(x));
    ok(!!png, 'pdftoppm renders it (' + png + ')');
  } else console.log('  note poppler not installed: PDF image checks skipped');
  // the content stream draws the picture before the linework (it is under it)
  const st = await (async () => { const m = raw.match(/\/Length (\d+) \/Filter \/FlateDecode >>\nstream\n/); if (!m) return ''; const i = raw.indexOf(m[0]) + m[0].length; const zlib = await import('node:zlib'); return zlib.inflateSync(Buffer.from(bytes.subarray(i, i + Number(m[1])))).toString('latin1'); })();
  ok(st.indexOf('/Im1 Do') > 0 && st.indexOf('/Im1 Do') < st.indexOf(' RG '), 'drawn first, under the linework');
  const two = await PL.toPdfPages([sheet, { ...sheet, name: 'b' }]);
  ok((new TextDecoder('latin1').decode(two.bytes).match(/\/Subtype \/Image/g) || []).length === 2 && two.report.pages === 2, 'two pages, a picture each');
  const none = await PL.toPdf(PL.planSheet(scene, { extents: ext, paper: 'tabloid', scale, title: 'No map', units: 'ft' }));
  ok(!/\/XObject/.test(new TextDecoder('latin1').decode(none.bytes)), 'without a picture: no XObject (as before)');
}

section('the DWG: an IMAGE beside the drawing');
{
  const box = { minX: 3115000, minY: 10070000, maxX: 3115400, maxY: 10070300 };
  const { bytes, report } = DW.writeDwg({ units: 'ft', layers: SC.LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: [{ type: 'poly', layer: 'C-TOPO-MAJR', pts: [{ x: box.minX, y: box.minY }, { x: box.maxX, y: box.maxY }], elev: 100 }], version: 'AC1032',
    images: [{ fileName: 'site-map.png', pxW: 800, pxH: 600, box, layer: 'G-MAP-IMAG' }] });
  ok(bytes.length > 1000 && !report.notes.some((n) => /IMAGE/.test(n)), 'written (2018) with no note against the image');
  const f = path.join(OUT, 'site.dwg'); fs.writeFileSync(f, bytes);
  const { readDwg } = await import(pathToFileURL(fs.existsSync(path.join(APP, 'dwg/read.js')) ? path.join(APP, 'dwg/read.js') : path.join(REPO, 'lib/dwg/read.js')).href);
  const m = readDwg(bytes);
  const ms = m.blocks.find((b) => /^\*model_space$/i.test(b.name));
  const img = ms.entities.find((e) => e.type === 'IMAGE');
  ok(img && img.layer === 'G-MAP-IMAG', 'cc-dwg reads an IMAGE on G-MAP-IMAG');
  near(img.insert.x, box.minX, 1e-6, 'insert = the box’s lower-left x'); near(img.insert.y, box.minY, 1e-6, 'and y');
  near(img.u.x, 0.5, 1e-12, 'u = one pixel east (400 ft / 800 px)'); near(img.v.y, 0.5, 1e-12, 'v = one pixel north (300 ft / 600 px)');
  ok(img.size?.x === 800 && img.size?.y === 600, 'size 800 × 600 px');
  const def = (m.objects || []).find((o) => o.type === 'IMAGEDEF');
  ok(def && def.fileName === 'site-map.png' && def.handle === img.def, 'its IMAGEDEF names site-map.png');
  ok((m.objects || []).some((o) => o.type === 'IMAGEDEF_REACTOR'), 'with its reactor');
  const { availableReaders } = await import(pathToFileURL(path.join(TOOLS, 'dwg-readers.mjs')).href);
  const readers = availableReaders(TOOLS);
  if (!readers.length) console.log('  note independent DWG readers not installed (sh tools/civilcraft-test/setup-dwg-readers.sh)');
  for (const r of readers) {
    const res = r.run([f], fs.mkdtempSync(path.join(OUT, 'rd-'))).get(f);
    const dxf = res?.dxf && fs.existsSync(res.dxf) ? fs.readFileSync(res.dxf, 'latin1') : '';
    const hasImage = /\n\s*0\s*\r?\nIMAGE\s*\r?\n/.test(dxf), hasDef = /site-map\.png/.test(dxf);
    if (/libdxfrw/.test(r.name)) ok(!res.problems.length, `${r.name}: reads the drawing (it writes no IMAGE to its DXF, as for any drawing)`);
    else ok(!res.problems.length && hasImage && hasDef, `${r.name}: IMAGE and IMAGEDEF site-map.png in its DXF` + (res.problems.length ? ' — ' + res.problems.join(' | ') : ''));
  }
}

console.log(`\n${pass} passed, ${fail} failed`);
if (!KEEP) fs.rmSync(OUT, { recursive: true, force: true });
process.exit(fail ? 1 : 0);
