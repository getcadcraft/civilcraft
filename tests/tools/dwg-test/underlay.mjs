#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * underlay.mjs — PDF underlays in DWG (0.7 D7.24, session cad-bugs): PDFDEFINITION + PDFUNDERLAY (class AcDbPdfReference).
 * The ODA spec does not describe these classes; the layout in lib/dwg/objects-read.js was found with black boxes only (the ODA
 * File Converter, run; its output read), which this script repeats as a test:
 *
 *   node tools/dwg-test/underlay.mjs [--keep]
 *
 *   1. our own round trip: a model with an underlay (3 variants: all fields; tilted normal + 2-point clip; bare) written as
 *      AutoCAD 2000 … 2018 and read again — every field equal, the definition shared, the dictionary ACAD_PDFDEFINITIONS made
 *   2. (needs the ODA File Converter + xvfb) our DWG → ODA → DXF 2018: its PDFUNDERLAY / PDFDEFINITION carry the same values
 *      (rotation in degrees), audit clean
 *   3. (same) a DXF 2000 with the underlay → ODA → DWG 2000 … 2018 → cc-dwg reads the same values
 * Files in tmp/underlay-check/ (removed unless --keep).
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync, execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { REPO, flag } from './lib/util.mjs';

const L = (f) => import(pathToFileURL(path.join(REPO, 'lib/dwg', f)).href);
const { readDwg } = await L('read.js');
const { writeDwg } = await L('write.js');
const KEEP = flag('--keep');
const ODA = path.join(REPO, 'tools/civilcraft-test/venv/dwg-readers/oda/AppRun');
const DIR = path.join(REPO, 'tmp/underlay-check');
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m + (c || !extra ? '' : '  — ' + extra)); return !!c; };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const VERSIONS = ['2000', '2004', '2007', '2010', '2013', '2018'];

// the values: one per field, distinct, so a misplaced field cannot pass
export const VARIANTS = {
  a: { file: 'sheets/plan-A.pdf', page: '3', insertion: { x: 101.5, y: 202.25, z: 3.5 }, scale: { x: 2.5, y: 3.5, z: 4.5 }, rotation: 0.7, normal: { x: 0, y: 0, z: 1 },
    flags: 11, contrast: 55, fade: 23, clip: [{ x: 1.25, y: 2.5 }, { x: 101.75, y: 2.5 }, { x: 101.75, y: 52.5 }, { x: 1.25, y: 52.5 }] },
  b: { file: 'x.pdf', page: 'Sheet 2', insertion: { x: -5, y: -6, z: 0 }, scale: { x: 1, y: 1, z: 1 }, rotation: 0, normal: { x: 0.6, y: 0, z: 0.8 },
    flags: 2, contrast: 100, fade: 0, clip: [{ x: 10, y: 20 }, { x: 30, y: 40 }] },
  c: { file: 'noclip.pdf', page: '1', insertion: { x: 0, y: 0, z: 0 }, scale: { x: 1, y: 1, z: 1 }, rotation: 0, normal: { x: 0, y: 0, z: 1 }, flags: 2, contrast: 100, fade: 0, clip: [] },
};
/** A model with every variant as an underlay in model space, the first two sharing a definition. */
export function model() {
  const objects = [], ents = [];
  Object.entries(VARIANTS).forEach(([k, v], i) => {
    objects.push({ handle: 'B' + (i + 1), type: 'PDFDEFINITION', file: v.file, page: v.page });
    ents.push({ type: 'PDFUNDERLAY', handle: 'C' + (i + 1), layer: '0', definition: 'B' + (i + 1), insertion: v.insertion, scale: v.scale, rotation: v.rotation,
      normal: v.normal, flags: v.flags, contrast: v.contrast, fade: v.fade, clip: v.clip });
  });
  ents.push({ type: 'PDFUNDERLAY', handle: 'C9', layer: '0', definition: 'B1', insertion: { x: 7, y: 8, z: 0 }, scale: { x: 0.5, y: 0.5, z: 0.5 }, rotation: 1.5, normal: { x: 0, y: 0, z: 1 }, flags: 3, contrast: 80, fade: 10, clip: [] });
  return { header: { INSUNITS: 6 }, tables: { blockRecords: [{ handle: 'A1', name: '*Model_Space' }] }, objects,
    blocks: [{ name: '*Model_Space', record: 'A1', entities: [{ type: 'LINE', layer: '0', start: { x: 0, y: 0, z: 0 }, end: { x: 9, y: 9, z: 0 } }, ...ents] }] };
}
const same = (u, v) => ['insertion', 'scale', 'normal'].every((k) => ['x', 'y', 'z'].every((a) => near(u[k][a], v[k][a], 1e-9))) && near(u.rotation, v.rotation, 1e-9) &&
  u.flags === v.flags && u.contrast === v.contrast && u.fade === v.fade && u.clip.length === v.clip.length && u.clip.every((p, i) => near(p.x, v.clip[i].x) && near(p.y, v.clip[i].y));
const pdfs = (m) => m.blocks.flatMap((b) => b.entities).filter((e) => e.type === 'PDFUNDERLAY');
const defOf = (m, e) => m.objects.find((o) => o.type === 'PDFDEFINITION' && o.handle === e.definition);

console.log('\n== 1. our own round trip, AutoCAD 2000 … 2018');
const src = model();
for (const v of VERSIONS) {
  const out = writeDwg(src, { version: v });
  const back = readDwg(out.bytes);
  const es = pdfs(back);
  ok(es.length === 4, v + ': four underlays come back', String(es.length) + ' ' + (out.report?.notes || []).join(' | '));
  const want = [VARIANTS.a, VARIANTS.b, VARIANTS.c, { insertion: { x: 7, y: 8, z: 0 }, scale: { x: 0.5, y: 0.5, z: 0.5 }, rotation: 1.5, normal: { x: 0, y: 0, z: 1 }, flags: 3, contrast: 80, fade: 10, clip: [] }];
  ok(es.length === 4 && es.every((e, i) => same(e, want[i])), v + ': every field equal (insertion, scale, rotation, normal, flags, contrast, fade, clip)');
  const defs = es.map((e) => defOf(back, e));
  ok(defs.every(Boolean) && defs[0].file === VARIANTS.a.file && defs[0].page === '3' && defs[1].page === 'Sheet 2' && defs[3] === defs[0], v + ': the definitions (file, page) come back, the first shared by two underlays');
  const nod = back.objects.find((o) => o.type === 'DICTIONARY' && o.entries?.ACAD_PDFDEFINITIONS);
  const dict = nod && back.objects.find((o) => o.handle === nod.entries.ACAD_PDFDEFINITIONS);
  ok(dict && Object.values(dict.entries).length === 3 && defs.every((d) => Object.values(dict.entries).includes(d.handle)), v + ': ACAD_PDFDEFINITIONS (in the named object dictionary) holds the three definitions');
  ok(defs[0].reactors?.length === 3, v + ': the shared definition has the dictionary and both underlays as reactors', JSON.stringify(defs[0].reactors));
  ok(!out.report?.notes?.some((n) => /PDF/.test(n)), v + ': nothing about PDF left out');
}
// a second write of what was read is the same (the model is stable)
{
  const once = readDwg(writeDwg(src, { version: '2018' }).bytes);
  const twice = readDwg(writeDwg(once, { version: '2010' }).bytes);
  ok(pdfs(twice).length === 4 && pdfs(twice).every((e, i) => same(e, pdfs(once)[i])), 'written, read, written in another version, read: the same underlays');
  const lost = writeDwg({ ...src, objects: [] }, { version: '2018' });
  ok(!pdfs(readDwg(lost.bytes)).length && lost.report.notes.some((n) => /PDFUNDERLAY/.test(n)), 'an underlay whose definition is missing is left out and said');
}

const xvfb = (() => { try { return execFileSync('sh', ['-c', 'command -v xvfb-run'], { encoding: 'utf8' }).trim(); } catch { return ''; } })();
if (!fs.existsSync(ODA) || !xvfb) console.log('\n  note: the ODA File Converter (or xvfb-run) is not set up — sections 2 and 3 are skipped');
else {
  fs.rmSync(DIR, { recursive: true, force: true });
  fs.mkdirSync(DIR, { recursive: true });
  const oda = (inD, outD, ver, fmt, ext) => {
    fs.mkdirSync(outD, { recursive: true });
    spawnSync(xvfb, ['-a', ODA, inD, outD, ver, fmt, '0', '1', '*.' + ext], { encoding: 'utf8', timeout: 600000 });
  };
  const group = (txt) => { const o = []; const a = txt.replace(/\r/g, '').split('\n'); for (let i = 0; i + 1 < a.length; i += 2) o.push([a[i].trim(), a[i + 1]]); return o; };
  /** The entities and objects of a DXF by type: [{type, pairs}] */
  const records = (txt) => {
    const p = group(txt), out = []; let cur = null;
    for (const [c, v] of p) { if (c === '0') { cur = { type: v, pairs: [] }; out.push(cur); } else if (cur) cur.pairs.push([c, v]); }
    return out;
  };
  const num = (r, c, n = 0) => { const x = r.pairs.filter(([k]) => k === c); return x[n] ? parseFloat(x[n][1]) : undefined; };

  console.log('\n== 2. our DWG → ODA File Converter → DXF 2018');
  const inD = path.join(DIR, 'ours');
  fs.mkdirSync(inD, { recursive: true });
  for (const v of VERSIONS) fs.writeFileSync(path.join(inD, 'ours-' + v + '.dwg'), writeDwg(src, { version: v }).bytes);
  oda(inD, path.join(DIR, 'ours-dxf'), 'ACAD2018', 'DXF', 'dwg');
  for (const v of VERSIONS) {
    const f = path.join(DIR, 'ours-dxf', 'ours-' + v + '.dxf');
    if (!ok(fs.existsSync(f), v + ': ODA opens our DWG')) continue;
    ok(!fs.existsSync(f + '.err'), v + ': and its audit is clean', fs.existsSync(f + '.err') ? fs.readFileSync(f + '.err', 'utf8').slice(0, 200) : '');
    const recs = records(fs.readFileSync(f, 'latin1'));
    const es = recs.filter((r) => /^PDF(REFERENCE|UNDERLAY)$/.test(r.type)), ds = recs.filter((r) => r.type === 'PDFDEFINITION');
    ok(es.length === 4 && ds.length === 3, v + ': ODA finds four underlays and three definitions (as proper classes, not proxies)', es.length + '/' + ds.length);
    const e = es[0];
    if (e) {
      const a = VARIANTS.a;
      ok(near(num(e, '10'), a.insertion.x) && near(num(e, '20'), a.insertion.y) && near(num(e, '30'), a.insertion.z) && near(num(e, '41'), a.scale.x) && near(num(e, '42'), a.scale.y) && near(num(e, '43'), a.scale.z) &&
        near(num(e, '50'), a.rotation * 180 / Math.PI, 1e-9) && num(e, '280') === a.flags && num(e, '281') === a.contrast && num(e, '282') === a.fade, v + ': insertion, scale, rotation, flags, contrast, fade as written');
      const xs = e.pairs.filter(([k]) => k === '11').map(([, x]) => +x), ys = e.pairs.filter(([k]) => k === '21').map(([, x]) => +x);
      ok(xs.join() === a.clip.map((p) => p.x).join() && ys.join() === a.clip.map((p) => p.y).join(), v + ': the clip boundary as written');
      const b = es[1];
      ok(near(num(b, '210'), 0.6) && near(num(b, '230'), 0.8), v + ': the tilted normal as written');
    }
    ok(ds.some((d) => d.pairs.some(([k, x]) => k === '1' && x === VARIANTS.a.file) && d.pairs.some(([k, x]) => k === '2' && x === '3')), v + ': a definition with the file name and page 3');
  }

  console.log('\n== 3. DXF 2000 → ODA File Converter → DWG → cc-dwg');
  const baseDxf = path.join(REPO, 'tools/dwg-test/lib/underlay-base.dxf');
  const dxfIn = path.join(DIR, 'dxf-in');
  fs.mkdirSync(dxfIn, { recursive: true });
  const g = (c, v) => String(c).padStart(3) + '\n' + v + '\n';
  const ent = (v, h, defH) => g(0, 'PDFUNDERLAY') + g(5, h) + g(330, '15') + g(100, 'AcDbEntity') + g(8, '0') + g(100, 'AcDbUnderlayReference') + g(340, defH) +
    g(10, v.insertion.x) + g(20, v.insertion.y) + g(30, v.insertion.z) + g(41, v.scale.x) + g(42, v.scale.y) + g(43, v.scale.z) + g(50, v.rotation * 180 / Math.PI) +
    g(210, v.normal.x) + g(220, v.normal.y) + g(230, v.normal.z) + g(280, v.flags) + g(281, v.contrast) + g(282, v.fade) + v.clip.map((p) => g(11, p.x) + g(21, p.y)).join('');
  const cls = (dxf, cpp, flags, e) => g(0, 'CLASS') + g(1, dxf) + g(2, cpp) + g(3, 'ObjectDBX Classes') + g(90, flags) + g(91, 0) + g(280, 0) + g(281, e);
  let t = fs.readFileSync(baseDxf, 'latin1').replace(/\r/g, '');
  t = t.replace('CLASSES\n', 'CLASSES\n' + cls('PDFDEFINITION', 'AcDbPdfDefinition', 1153, 0) + cls('PDFUNDERLAY', 'AcDbPdfReference', 4095, 1));
  t = t.replace('  3\nACAD_GROUP\n350\n11\n', '  3\nACAD_GROUP\n350\n11\n  3\nACAD_PDFDEFINITIONS\n350\n7001\n');
  const objs = g(0, 'DICTIONARY') + g(5, '7001') + g(330, '10') + g(100, 'AcDbDictionary') + g(281, 1) + Object.keys(VARIANTS).map((k, i) => g(3, 'PDF' + (i + 1)) + g(350, '700' + (i + 2))).join('') +
    Object.entries(VARIANTS).map(([k, v], i) => g(0, 'PDFDEFINITION') + g(5, '700' + (i + 2)) + g(102, '{ACAD_REACTORS') + g(330, '7001') + g(102, '}') + g(330, '7001') + g(100, 'AcDbUnderlayDefinition') + g(1, v.file) + g(2, v.page)).join('');
  const oi = t.indexOf('OBJECTS\n'), ei = t.indexOf('  0\nENDSEC', oi);
  t = t.slice(0, ei) + objs + t.slice(ei);
  t = t.replace('ENTITIES\n', 'ENTITIES\n' + Object.entries(VARIANTS).map(([k, v], i) => ent(v, '701' + i, '700' + (i + 2))).join(''));
  fs.writeFileSync(path.join(dxfIn, 'underlay.dxf'), t);
  for (const v of VERSIONS) oda(dxfIn, path.join(DIR, 'dwg-' + v), 'ACAD' + v, 'DWG', 'dxf');
  for (const v of VERSIONS) {
    const f = path.join(DIR, 'dwg-' + v, 'underlay.dwg');
    if (!ok(fs.existsSync(f), v + ': ODA makes a DWG from the DXF')) continue;
    const m = readDwg(new Uint8Array(fs.readFileSync(f)));
    const es = pdfs(m);
    ok(es.length === 3 && es.every((e, i) => same(e, Object.values(VARIANTS)[i])), v + ': cc-dwg reads the three underlays ODA wrote, every field as in the DXF');
    ok(es.every((e, i) => defOf(m, e)?.file === Object.values(VARIANTS)[i].file && defOf(m, e)?.page === Object.values(VARIANTS)[i].page), v + ': and their definitions (file, page)');
  }
  // and cc-dwg's rewrite of an ODA-made file is still readable by ODA
  {
    const m = readDwg(new Uint8Array(fs.readFileSync(path.join(DIR, 'dwg-2018', 'underlay.dwg'))));
    const rd = path.join(DIR, 'rewrite');
    fs.mkdirSync(rd, { recursive: true });
    for (const v of ['2000', '2010', '2018']) fs.writeFileSync(path.join(rd, 'rw-' + v + '.dwg'), writeDwg(m, { version: v }).bytes);
    oda(rd, path.join(DIR, 'rewrite-dxf'), 'ACAD2018', 'DXF', 'dwg');
    for (const v of ['2000', '2010', '2018']) {
      const f = path.join(DIR, 'rewrite-dxf', 'rw-' + v + '.dxf');
      const recs = fs.existsSync(f) ? records(fs.readFileSync(f, 'latin1')) : [];
      ok(recs.filter((r) => /^PDF(REFERENCE|UNDERLAY)$/.test(r.type)).length === 3 && recs.filter((r) => r.type === 'PDFDEFINITION').length === 3 && !fs.existsSync(f + '.err'), v + ': an ODA-made file rewritten by cc-dwg opens in ODA with its three underlays, audit clean');
    }
  }
}
if (!KEEP) fs.rmSync(DIR, { recursive: true, force: true });
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
