/* SPDX-License-Identifier: Apache-2.0 */
/**
 * objects-check.mjs — builder M's check of what lib/dwg writes beyond plain entities: the source's non-graphical
 * objects (nongraphic-write.js), multileaders (mleader-*.js) and raw/proxy passthrough (passthrough.js).
 *
 *   node tools/dwg-test/objects-check.mjs [--sources a.dwg,dir,…] [--versions AC1015,…] [--keep dir] [--no-oracles]
 *        [--json out.json] [--quiet]
 *   default sources: every drawing of testfiles/dwg-corpus/AC1032 (written in all six versions) plus each corpus
 *   version's own files written back in their own version (the same-version, bit-for-bit path), plus the drawings in
 *   testfiles/PRIVATE-DWG.txt when this machine has it (a client drawing with AEC objects/entities; lib/util.mjs
 *   privateDrawings) and tools/bimcraft-test/fixtures/dwg3d-acad{2000,2018}.dwg in all six.
 *
 * Per (source, target version):
 *   write    writeDwg(readDwg(source)); report.notes of the copy (copied / not copied by type)
 *   ours     readDwg(written): non-graphical object types count as in the source minus what the writer reported as
 *            not copied; every MULTILEADER field equal to the source's (handles compared through report.handles,
 *            names as names); proxy/custom entities kept
 *   oda      ODA File Converter (audit on) → DXF: no .err; OBJECTS types and the named-object dictionary tree equal
 *            to the converter's DXF of the source, except types the writer reported as not copied (and objects the
 *            converter adds itself when they are missing: default visual styles, materials, DICTIONARYVAR); every
 *            MULTILEADER's DXF tags equal (handle-valued codes skipped; proxy-graphics size/data 160/310 skipped —
 *            the converter regenerates them for written files)
 *   libredwg dwgread -v2 error lines no more than on the source (LibreDWG's known misreads of ACIS and proxy entities
 *            not counted: LR_MISREAD);  libdxfrw  converts when it converts the source
 * Exit 1 on any failure.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readDwg, writeDwg } from '../../lib/dwg/index.js';
import { odaEach, dxfSummary, libredwg, libdxfrw } from './objects-lib.mjs';
import { privateDrawings } from './lib/util.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const C = '/var/www/CADCRAFT/testfiles/dwg-corpus';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i >= 0 ? process.argv[i + 1] : d; };
const ALL = ['AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'];
const versions = arg('--versions', ALL.join(',')).split(',');
const OUT = path.resolve(arg('--keep', path.join(ROOT, 'tmp/dwg-objects')));
const QUIET = process.argv.includes('--quiet');
const ORACLES = !process.argv.includes('--no-oracles');
fs.mkdirSync(OUT, { recursive: true });

const jobs = [];   // { src, version }
const srcArg = arg('--sources', null);
if (srcArg) {
  for (const s of srcArg.split(',')) {
    const files = fs.statSync(s).isDirectory() ? fs.readdirSync(s).filter((f) => f.endsWith('.dwg')).map((f) => path.join(s, f)) : [s];
    for (const f of files) for (const v of versions) jobs.push({ src: f, version: v });
  }
} else {
  for (const f of fs.readdirSync(path.join(C, 'AC1032')).filter((x) => x.endsWith('.dwg')).sort()) for (const v of versions) jobs.push({ src: path.join(C, 'AC1032', f), version: v });
  for (const v of versions) if (v !== 'AC1032') for (const f of fs.readdirSync(path.join(C, v)).filter((x) => x.endsWith('.dwg')).sort()) jobs.push({ src: path.join(C, v, f), version: v });
  // custom classes: AEC (Architecture) objects and entities (a client drawing on this machine only: privateDrawings()),
  // surfaces and meshes
  for (const f of [...privateDrawings(), path.join(ROOT, 'tools/bimcraft-test/fixtures/dwg3d-acad2000.dwg'), path.join(ROOT, 'tools/bimcraft-test/fixtures/dwg3d-acad2018.dwg')])
    if (fs.existsSync(f)) for (const v of versions) jobs.push({ src: f, version: v });
  // the multileader fixture (objects-fixture.mjs) made by the ODA converter in each version, written in all six
  for (const sv of ALL) { const f = path.join(C, '_fixtures/objects', sv, 'mleaders.dwg'); if (fs.existsSync(f)) for (const v of versions) jobs.push({ src: f, version: v }); }
}

const srcVer = (f) => { const m = srcCache.get(f); if (m) return m.version; const b = fs.readFileSync(f).subarray(0, 6).toString('latin1'); return b; };
const hex = (h) => (h === undefined || h === null || h === '' ? '' : String(h).toUpperCase().replace(/^0+(?=.)/, ''));
const log = (...a) => { if (!QUIET) console.log(...a); };
const results = [];
let failures = 0;

// ---------------------------------------------------------------- write + our reader
const srcCache = new Map();
const srcModel = (f) => { if (!srcCache.has(f)) { srcCache.clear(); srcCache.set(f, readDwg(new Uint8Array(fs.readFileSync(f)))); } return srcCache.get(f); };
for (const job of jobs) {
  const m = srcModel(job.src);
  const tag = path.basename(path.dirname(job.src)) + '-' + path.basename(job.src, '.dwg') + '-to-' + job.version;
  const res = { tag, src: job.src, version: job.version, problems: [], notes: [] };
  results.push(res);
  let w;
  try { w = writeDwg(m, { version: job.version }); } catch (e) { res.problems.push('writeDwg threw: ' + e.message); continue; }
  res.file = path.join(OUT, tag + '.dwg');
  fs.writeFileSync(res.file, w.bytes);
  res.report = w.report;
  res.notes = w.report.notes.filter((n) => /copied|bit for bit|left out/.test(n));
  const dropped = new Set(Object.keys(w.report.copied?.dropped || {}));
  const proxied = Object.values(w.report.copied?.proxied || {}).reduce((x, y) => x + y, 0);
  res.proxied = proxied;
  res.dropped = dropped;
  const back = readDwg(new Uint8Array(fs.readFileSync(res.file)));
  if (back.report.error) { res.problems.push('ours: ' + back.report.error); continue; }
  // object types
  // a proxy counts as its class (passthrough.js turns proxies back into the class in its own version, and the
  // other way round)
  const count = (mm) => { const cl = new Map(mm.classes.map((k) => [k.num, k.dxfName])); const c = {}; for (const o of mm.objects) { const t = o.type === 'ACAD_PROXY_OBJECT' ? cl.get(o.classId) || o.type : o.type; c[t] = (c[t] || 0) + 1; } return c; };
  const a = count(m), b = count(back);
  // objects that belong to an entity the writer does not write (a 3DSOLID's history, …) go with it
  const objBy = new Map(m.objects.map((o) => [hex(o.handle), o]));
  const ents = new Set(); for (const bl of m.blocks) for (const e of bl.entities) { ents.add(hex(e.handle)); for (const at of e.attribs || []) ents.add(hex(at.handle)); }
  const clsS = new Map(m.classes.map((k) => [k.num, k.dxfName]));
  for (const o of m.objects) {
    let h = hex(o.owner), n = 0;
    while (objBy.has(h) && n++ < 50) h = hex(objBy.get(h).owner);
    if (ents.has(h) && !w.report.handles[h]) { a[o.type === 'ACAD_PROXY_OBJECT' ? clsS.get(o.classId) || o.type : o.type]--; res.withEntity = (res.withEntity || 0) + 1; }
  }
  for (const t of new Set([...Object.keys(a), ...Object.keys(b)])) {
    if (dropped.has(t) || /^(LAYOUT|MLINESTYLE|IMAGEDEF|IMAGEDEF_REACTOR|RASTERVARIABLES|WIPEOUTVARIABLES|ACDBPLACEHOLDER|ACDBDICTIONARYWDFLT|DICTIONARY|XRECORD|SORTENTSTABLE)$/.test(t)) continue;
    if ((a[t] || 0) !== (b[t] || 0)) res.problems.push(`ours: ${t} ${a[t] || 0} in the source, ${b[t] || 0} written`);
  }
  // multileaders
  const mls = (mm) => mm.blocks.flatMap((bl) => bl.entities.filter((e) => e.type === 'MULTILEADER').map((e) => ({ e, block: bl.name })));
  const ma = mls(m), mb = mls(back);
  if (ma.length !== mb.length) res.problems.push(`ours: ${ma.length} multileaders in the source, ${mb.length} written`);
  const H = w.report.handles;
  const vOld = ALL.indexOf(job.version) < 3, vSrcOld = (m.version < 'AC1024');
  for (let i = 0; i < Math.min(ma.length, mb.length); i++) {
    const d = mlDiff(ma[i].e, mb[i].e, H, { lostLineFields: vOld && !vSrcOld, lostArrowheads: !vOld, addedArrowheads: vOld && !vSrcOld, noExtend: ALL.indexOf(job.version) < 4 });
    if (d.length) { res.problems.push(`ours: multileader ${ma[i].e.handle}: ${d.slice(0, 3).join('; ')}`); if (res.problems.length > 12) break; }
  }
  // custom/proxy entities
  const raws = (mm) => mm.blocks.reduce((n, bl) => n + bl.entities.filter((e) => e.type === 'UNKNOWN' || e.type === 'ACAD_PROXY_ENTITY').length, 0);
  const lost = Object.values(w.report.copied?.droppedEntities || {}).reduce((x, y) => x + y, 0);
  const ra = raws(m), rb = raws(back);
  if (ra - lost !== rb) res.problems.push(`ours: ${ra} custom/proxy entities in the source (${lost} reported left out), ${rb} written`);
  res.counts = { objects: back.objects.length, srcObjects: m.objects.length, multileaders: mb.length, raw: rb, srcRaw: ra };
}

function mlDiff(a, b, H, o) {
  const out = [];
  const skip = new Set(['handle', 'owner', 'reactors', 'extDict', 'raw', 'proxyGraphics', 'xdata', 'space', 'layer']);
  const isH = (k) => /Handle$|^handle$/.test(k);
  const walk = (x, y, p) => {
    if (out.length > 5) return;
    if (x === undefined && y === undefined) return;
    if (typeof x === 'number' && typeof y === 'number') { if (!(Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x)))) out.push(`${p}: ${x} ≠ ${y}`); return; }
    if (x && typeof x === 'object' && y && typeof y === 'object') {
      for (const k of new Set([...Object.keys(x), ...Object.keys(y)])) {
        if (skip.has(k)) continue;
        if (o.lostLineFields && /^roots\.\d+\.(lines\.\d+\.)?(leaderType|color|linetypeHandle|lineweight|arrowSize|arrowheadHandle|overrideFlags|attachDirection)$/.test((p + '.' + k).replace(/^\.?context\./, ''))) continue;
        if (o.lostLineFields && /^(version|attachDirection|textTopAttach|textBottomAttach|extendToText|topAttach|bottomAttach)$/.test(k)) continue;
        if (o.noExtend && k === 'extendToText') continue;
        if ((o.lostArrowheads || o.addedArrowheads) && k === 'arrowheads') continue;
        if ((k === 'style' && x.style === x.styleHandle) || (k === 'contentBlock' && x.contentBlock === x.context?.block?.blockHandle)) continue;
        if (x[k] === undefined) continue;   // a field the source's version does not have (written with its default)
        if (isH(k)) { const ex = hex(H[hex(x[k])] ?? ''), got = hex(y[k]); if (hex(x[k]) && ex !== got) out.push(`${p}.${k}: ${x[k]}→${ex} ≠ ${got}`); continue; }
        walk(x[k], y[k], p + '.' + k);
      }
      return;
    }
    if (JSON.stringify(x) !== JSON.stringify(y)) out.push(`${p}: ${JSON.stringify(x)} ≠ ${JSON.stringify(y)}`);
  };
  walk(a, b, '');
  return out;
}

// ---------------------------------------------------------------- oracles
// LibreDWG 0.14 misreads valid data of two kinds of object; those error lines are not counted (on either side), and
// only on these object types (dwgread's "Add entity <type>" before the line). Evidence (2026-10-11, all black box):
//  - ACIS entities (REGION, 3DSOLID, BODY) of R2007+ files: it looks for AutoCAD's End-of-ACIS mark in SAB data, which
//    the ODA File Converter's re-saved ACIS lacks, so it reads to the end of the object and every field after it
//    overflows (what it then reports depends on the trailing bits); R2013+ data storage likewise. The converter's own
//    R2010 copy of example-2000 (corpus AC1024) and its own R2010/R2013/R2018 saves of dwg3d-acad2000.dwg show the same
//    kinds on the same entities (the R2013/R2018 ones the identical set to ours); ODA reads our ACIS back byte for
//    byte (solids-check.mjs). Same allowance as solids-write-check.mjs, limited here to the ACIS entities.
//  - proxy entities: it takes the proxy-graphics size for the size of the proxy data, so the data read runs past the
//    object (TF overflow) or, when the graphics are smaller, the next read does (RC overflow). The converter's own
//    R2000 and R2010 saves of a client drawing give the TF overflow on all 63 of its AEC proxy entities, with the
//    same class id / version / data-format fields as ours.
const LR_MISREAD = [
  { type: /^(REGION|_3DSOLID|BODY)$/, kind: /bit_read_\w+ buffer overflow|bit_advance_position buffer overflow|unexpected \d-bit code|Invalid revision_bytes|Invalid (REGION|3DSOLID|BODY)\.(materials|silhouettes|wires)/ },
  { type: /^PROXY_ENTITY$/, kind: /bit_read_(TF|RC) buffer overflow/ },
];
const lrMisread = (x) => LR_MISREAD.some((m) => m.type.test(x.type) && m.kind.test(x.line));
if (ORACLES) {
  const srcs = [...new Set(results.filter((r) => r.file).map((r) => r.src))];
  const srcDir = path.join(OUT, 'src');
  fs.mkdirSync(srcDir, { recursive: true });
  // the converter names its output after the input file: copy sources under unique names
  const srcCopy = new Map(srcs.map((s) => { const n = path.join(srcDir, path.basename(path.dirname(s)) + '-' + path.basename(s)); fs.copyFileSync(s, n); return [s, n]; }));
  const odaSrc = await odaEach([...srcCopy.values()], srcDir);
  const odaOut = await odaEach(results.filter((r) => r.file).map((r) => r.file), OUT);
  const sumCache = new Map();
  const sum = (f) => { if (!sumCache.has(f)) sumCache.set(f, dxfSummary(f)); return sumCache.get(f); };
  const lrBase = new Map(), rwBase = new Map();
  for (const r of results.filter((x) => x.file)) {
    const so = odaSrc.get(srcCopy.get(r.src)), wo = odaOut.get(r.file);
    if (wo.err) r.problems.push('oda .err: ' + wo.err.split('\n').slice(0, 3).join(' | '));
    if (!wo.out) { r.problems.push('oda: no DXF'); continue; }
    if (!so.out) { r.notes.push('oda could not read the source'); continue; }
    const S = sum(so.out), W = dxfSummary(wo.out);
    const ODA_ADDS = /^(VISUALSTYLE|MATERIAL|DICTIONARYVAR|ACDBPLACEHOLDER|DICTIONARY|ACDBDICTIONARYWDFLT|MLEADERSTYLE|TABLESTYLE|CELLSTYLEMAP|SCALE|ACDBDETAILVIEWSTYLE|ACDBSECTIONVIEWSTYLE|XRECORD)$/;
    for (const t of new Set([...Object.keys(S.objects), ...Object.keys(W.objects)])) {
      const a = S.objects[t] || 0, b = W.objects[t] || 0;
      if (a === b || r.dropped.has(t)) continue;
      if (b > a && ODA_ADDS.test(t)) continue;                       // the converter's own defaults
      if (t === 'ACAD_PROXY_OBJECT' && r.dropped.size) continue;      // the converter writes undecoded classes as proxies
      if (t === 'LAYOUT' || t === 'MLINESTYLE') continue;             // the writer makes its own
      if (t === 'DICTIONARYVAR' && Math.abs(a - b) <= 1) continue;    // the converter moves XCLIPFRAME & co. between header and dictionary per version
      if (/^(DICTIONARY|XRECORD)$/.test(t) && b < a && r.withEntity) continue;   // they belonged to an entity the writer does not write (see 'ours')
      if (/^(DICTIONARY|XRECORD|ACDBPLACEHOLDER)$/.test(t) && r.dropped.size) continue;   // dictionaries/xrecords of left-out objects
      r.problems.push(`oda: ${t} ${a} in the source, ${b} written`);
    }
    // named-object dictionary names
    const sn = (S.dicts['/'] || []).map((x) => x.split(':')[0]), wn = new Set((W.dicts['/'] || []).map((x) => x.split(':')[0]));
    const miss = sn.filter((n) => !wn.has(n));
    if (miss.length) r.problems.push('oda: named-object dictionary lacks ' + miss.join(', '));
    // multileaders, tag by tag
    const ml = (s) => s.recs.filter((x) => x.type === 'MULTILEADER');
    const A = ml(S), B = ml(W);
    if (A.length !== B.length) r.problems.push(`oda: ${A.length} multileaders in the source DXF, ${B.length} written`);
    else {
      const HC = new Set([5, 330, 340, 341, 342, 343, 344, 345, 360, 102, 160, 310]);
      if (ALL.indexOf(r.version) < 4) HC.add(295);   // "extend leader to text" exists from R2013 only
      // the per-line properties (170 92 340 171 40 341 93 inside LEADER_LINE{}) exist from R2010 only: the converter's DXF of
      // a file on the other side of R2010 lists them (with its defaults) or not
      const LINEP = new Set([170, 92, 171, 40, 93]);
      const across = (ALL.indexOf(r.version) >= 3) !== (ALL.indexOf(srcVer(r.src)) >= 3);
      const clean = (rec) => { let inLine = false; return rec.tags.filter((x) => { if (x[0] === 304) inLine = true; if (x[0] === 305) inLine = false; return !HC.has(x[0]) && !(across && inLine && LINEP.has(x[0])) && !(across && (x[0] === 271) && !inLine); }); };
      let bad = 0;
      for (let i = 0; i < A.length; i++) {
        const ta = clean(A[i]), tb = clean(B[i]);
        const k = ta.findIndex((x, j) => JSON.stringify(x) !== JSON.stringify(tb[j]));
        if (k >= 0 || ta.length !== tb.length) { if (bad++ < 3) r.problems.push(`oda: multileader ${A[i].handle} DXF tag ${k}: ${JSON.stringify(ta[k])} ≠ ${JSON.stringify(tb[k])}`); }
      }
    }
    // LibreDWG / libdxfrw against the source
    if (!lrBase.has(r.src)) lrBase.set(r.src, libredwg(r.src));
    if (!rwBase.has(r.src)) rwBase.set(r.src, libdxfrw(r.src, OUT));
    let lb = lrBase.get(r.src);
    const lw = libredwg(r.file);
    // the same drawing as the converter saved it in the target version (corpus) is a baseline too: LibreDWG's own
    // trouble with a class (e.g. ACDBASSOC2DCONSTRAINTGROUP stored natively in R2010) is not the writer's
    const twin = r.src.startsWith(C + '/') ? path.join(C, r.version, path.basename(r.src)) : null;
    if (twin && twin !== r.src && fs.existsSync(twin)) { if (!lrBase.has(twin)) lrBase.set(twin, libredwg(twin)); const t = lrBase.get(twin); if (t.errors.length > lb.errors.length) lb = t; }
    if (lw.status !== 0 && lb.status === 0) r.problems.push('libredwg: dwgread exit ' + lw.status);
    const le = lw.typed.filter((x) => !lrMisread(x)), lbe = lb.typed.filter((x) => !lrMisread(x));
    if (le.length > lbe.length) r.problems.push(`libredwg: ${le.length} error lines (source ${lbe.length}): ${le.slice(0, 2).map((x) => x.type + ': ' + x.line).join(' | ')}`);
    const xw = libdxfrw(r.file, OUT);
    if (!xw.ok && rwBase.get(r.src).ok) r.problems.push('libdxfrw: ' + xw.text);
    r.oracle = { objects: W.objects, srcObjects: S.objects, libredwgErrors: [lb.errors.length, lw.errors.length], libdxfrw: [rwBase.get(r.src).ok, xw.ok] };
  }
}

for (const r of results) {
  const ok = !r.problems.length;
  if (!ok) failures++;
  log(`${ok ? 'ok  ' : 'FAIL'} ${r.tag}${r.counts ? ` objects ${r.counts.srcObjects}→${r.counts.objects}, multileaders ${r.counts.multileaders}, custom/proxy entities ${r.counts.srcRaw}→${r.counts.raw}` : ''}`);
  for (const p of r.problems) log('       ' + p);
  if (!ok || process.argv.includes('--verbose')) for (const n of r.notes) log('       · ' + n);
}
console.log(`${results.length - failures}/${results.length} passed`);
const jo = arg('--json', null);
if (jo) fs.writeFileSync(jo, JSON.stringify(results.map(({ report, dropped, ...r }) => ({ ...r, dropped: [...(dropped || [])] })), null, 1));
process.exit(failures ? 1 : 0);
