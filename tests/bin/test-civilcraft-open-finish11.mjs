#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-open-finish11.mjs — CivilCraft 0.11 PERF.33 (perf-finish-11, lane civil) in Node: the parts of the open that now run off the
 * page give exactly what the page's own code gives.
 *   1. project-rows.js pointColumns → pointsFromColumns / blocksFromColumns, through a structured clone (what crosses from the Worker), then
 *      Project.fromJSON(rest, pre) = Project.fromJSON(file): the same project file out (toJSON), on rows with bad values, control characters,
 *      missing z, block references, non-array rows, and past MAX_POINTS (the cap note).
 *   2. landxml-lists.js (the stream reader of <Pnts>/<Faces>): readLandXml(text) with it = readLandXml(text, { fast: false }) (the tree) on the
 *      writer's own files, on lists the tree must read (comments, CDATA, entities, attributes, prefixes, a <Pnts> inside a comment), with hidden
 *      faces, ids missing or written twice, commas, and the text cut into parts at random places; and on the 500k bench file (--big).
 *   node bin/test-civilcraft-open-finish11.mjs [--big]
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const imp = (f) => import(pathToFileURL(path.join(APP, f)).href);
const { Project, MAX_POINTS, pointsFromColumns, blocksFromColumns } = await imp('project.js');
const { pointColumns } = await imp('project-rows.js');
const { readLandXml, writeLandXml } = await imp('landxml.js');
const { cutLists } = await imp('landxml-lists.js');
const { buildSurface } = await imp('tin.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
let seed = 5; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const fileOf = (p) => { const j = p.toJSON(); delete j.saved; return JSON.stringify(j); };

// ---- 1. the point rows through the Worker's columns
function viaColumns(obj, max = MAX_POINTS) {
  const o = structuredClone(obj), cols = structuredClone(pointColumns(o.points, max)); delete o.points;
  const pts = []; pointsFromColumns(cols, 0, Math.floor(cols.count / 2), undefined, undefined, pts); pointsFromColumns(cols, Math.floor(cols.count / 2), cols.count, undefined, undefined, pts);
  blocksFromColumns(cols, pts);
  return Project.fromJSON(o, { pts, total: cols.total });
}
const odd = ['', 'GND', 'EP B', 'a\u0000b', 'x\ty\n', 5, null, undefined, { a: 1 }, 'é ü 中', 'x'.repeat(300), '\u007f'];
const rowsOf = (n) => Array.from({ length: n }, (_, i) => {
  const r = rnd();
  if (r < 0.03) return 'not a row';
  if (r < 0.05) return [String(i), 'x', 1, 2, ''];
  if (r < 0.07) return [String(i), 1, Infinity, 2, ''];
  const row = [r < 0.1 ? i : odd[i % odd.length] ?? String(i), rnd() * 1000, rnd() * 1000, r < 0.15 ? null : r < 0.17 ? 'z' : rnd() * 50, odd[(i * 7) % odd.length]];
  if (r > 0.97) row.push({ name: 'BLK' + i, layer: 'L\u0001', handle: 'h' + i });
  else if (r > 0.95) row.push('not a block');
  return row;
});
for (const n of [0, 1, 7, 500, 4000]) {
  const obj = { format: 'civilcraft-project', version: 1, name: 'rows ' + n, units: 'm', seq: 3, points: rowsOf(n), surface: { descKeys: [{ code: 'EP', use: 'breakline' }] } };
  const a = Project.fromJSON(structuredClone(obj)), b = viaColumns(obj);
  ok(fileOf(a.project) === fileOf(b.project), 'same project file from ' + n + ' rows');
  ok(JSON.stringify(a.notes) === JSON.stringify(b.notes), 'same notes from ' + n + ' rows', [a.notes, b.notes]);
  ok(JSON.stringify(a.project.points) === JSON.stringify(b.project.points), 'same point objects (' + a.project.points.length + ')');
}
{ // the cap: say how many were left out (a small cap stands in for 2,000,000)
  const obj = { format: 'civilcraft-project', version: 1, name: 'cap', units: 'm', seq: 1, points: rowsOf(300) };
  const cols = pointColumns(obj.points, 120);
  ok(cols.total === 300 && cols.count <= 120, 'pointColumns keeps the first max rows and counts them all', [cols.total, cols.count]);
}
{ const o = { format: 'civilcraft-project', version: 1, name: 'np', units: 'ft', seq: 1 }; const a = Project.fromJSON(structuredClone(o)), b = viaColumns(o); ok(fileOf(a.project) === fileOf(b.project) && JSON.stringify(a.notes) === JSON.stringify(b.notes), 'a file with no points'); }
{ const o = { format: 'civilcraft-project', version: 1, name: 'np', units: 'ft', seq: 1, points: 'x' }; const a = Project.fromJSON(structuredClone(o)), b = viaColumns(o); ok(fileOf(a.project) === fileOf(b.project) && JSON.stringify(a.notes) === JSON.stringify(b.notes), 'points that are not a list'); }
{ let e1 = '', e2 = ''; try { Project.fromJSON({ format: 'other' }); } catch (e) { e1 = e.message; } try { viaColumns({ format: 'other', points: [] }); } catch (e) { e2 = e.message; } ok(e1 && e1 === e2, 'not a CivilCraft file: the same message', [e1, e2]); }

// ---- 2. the LandXML lists
const same = (text, label, parts = null) => {
  const tree = readLandXml(text, { fast: false });
  const fast = readLandXml(parts || text);
  ok(JSON.stringify(fast) === JSON.stringify(tree), 'stream = tree: ' + label, { tree: JSON.stringify(tree).slice(0, 150), fast: JSON.stringify(fast).slice(0, 150) });
};
const cutParts = (s, n) => { const out = []; let i = 0; while (i < s.length) { const k = Math.max(1, Math.floor(rnd() * n)); out.push(s.slice(i, i + k)); i += k; } return out; };
// the writer's own file, with a TIN
const pts = Array.from({ length: 900 }, (_, i) => ({ x: 1000 + (i % 30) * 7 + rnd(), y: 2000 + Math.floor(i / 30) * 7 + rnd(), z: 50 + rnd() * 3 }));
const sf = buildSurface({ points: pts }).surface;
const own = writeLandXml({ name: 'Own', units: 'm', points: pts.slice(0, 40).map((p, i) => ({ n: String(i + 1), ...p, d: 'GND' })), surfaces: [{ name: 'EG', desc: '', surface: sf, breaklines: [{ name: 'B', pts: pts.slice(0, 3) }], boundary: null }], alignments: [], date: new Date(0) });
const ownCut = cutLists(own);
ok(ownCut && ownCut.blocks.length === 2 && ownCut.blocks[0].pts.length === sf.toFaces().pts.length, 'the writer\'s Pnts and Faces are read by the stream', ownCut && ownCut.blocks.map((b) => b.kind));
same(own, 'the writer\'s file');
for (const n of [1, 2, 3, 7, 50, 999, 20000]) same(own, 'the writer\'s file in parts of up to ' + n, cutParts(own, n));
const head = '<?xml version="1.0"?><LandXML xmlns="http://www.landxml.org/schema/LandXML-1.2" version="1.2"><Units><Metric linearUnit="meter"/></Units><Surfaces><Surface name="S"><Definition surfType="TIN">';
const tail = '</Definition></Surface></Surfaces></LandXML>';
const P = (id, t) => `<P id="${id}">${t}</P>`;
const lx = (pnts, faces, mid = '') => head + pnts + mid + faces + tail;
const basic = '<Pnts>' + P(1, '0 0 1') + P(2, '0 10 2') + P(3, '10 0 3') + P(4, '10,10,4') + '</Pnts>';
const cases = {
  'plain': lx(basic, '<Faces><F>1 2 3</F><F i="1">2 3 4</F><F>2 4 3</F></Faces>'),
  'ids twice, a P with no id, a bad P': lx('<Pnts>' + P(1, '0 0 1') + P(1, '0 5 1') + '<P>5 5 5</P>' + P(9, '1 2') + P(8, '1 x 2') + P(2, '0 10 2') + P(3, '10 0 3') + '</Pnts>', '<Faces><F>1 2 3</F><F>1 9 3</F><F> 2  3   1 </F><F>1 2</F><F></F></Faces>'),
  'attributes in another order, single quotes': lx("<Pnts><P code='a' id='1'>0 0 1</P><P id=\"2\" x:id=\"7\">0 10 2</P><P  id = '3' >10 0 3</P></Pnts>", '<Faces><F n="1">1 7 3</F><F i="0">1 2 3</F></Faces>'),
  'an entity in a P (the tree reads that list)': lx('<Pnts>' + P(1, '0 0 1') + '<P id="&#50;">0 10 2</P>' + P(3, '10 0 3') + '</Pnts>', '<Faces><F>1 2 3</F></Faces>'),
  'a comment inside Pnts': lx('<Pnts>' + P(1, '0 0 1') + '<!-- x -->' + P(2, '0 10 2') + P(3, '10 0 3') + '</Pnts>', '<Faces><F>1 2 3</F></Faces>'),
  'CDATA inside Faces': lx(basic, '<Faces><F><![CDATA[1 2 3]]></F></Faces>'),
  'a <Pnts> in a comment before the list': lx('<!-- <Pnts><P id="9">9 9 9</P></Pnts> -->' + basic, '<Faces><F>1 2 3</F></Faces>'),
  'a <Pnts> in CDATA of another element': lx(basic, '<Faces><F>1 2 3</F></Faces>', '<Feature><![CDATA[<Faces><F>4 4 4</F></Faces>]]></Feature>'),
  'Pnts with an attribute': lx('<Pnts note="x">' + P(1, '0 0 1') + P(2, '0 10 2') + P(3, '10 0 3') + '</Pnts>', '<Faces><F>1 2 3</F></Faces>'),
  'a prefixed list': head.replace('<LandXML ', '<LandXML xmlns:lx="http://www.landxml.org/schema/LandXML-1.2" ') + '<lx:Pnts>' + P(1, '0 0 1') + P(2, '0 10 2') + P(3, '10 0 3') + '</lx:Pnts><Faces><F>1 2 3</F></Faces>' + tail,
  'an attribute named ccfast in the file': lx('<Pnts ccfast="x:0">' + P(1, '0 0 1') + '</Pnts>', '<Faces><F>1 1 1</F></Faces>'),
  'two surfaces, one not a TIN': head + basic + '<Faces><F>1 2 3</F></Faces></Definition></Surface><Surface name="G"><Definition surfType="grid"><Pnts>' + P(1, '0 0 1') + '</Pnts></Definition></Surface><Surface name="T"><Definition surfType="TIN">' + basic + '<Faces><F>3 2 1</F></Faces>' + tail,
  'white space and new lines everywhere': lx('<Pnts>\n  ' + P(1, ' 0 0 1 ') + '\n\t' + P(2, '0\n10\n2') + '\r\n' + P(3, '10 0 3') + '\n</Pnts >', '<Faces>\n<F >1 2 3</F >\n</Faces>'),
  'a list that does not end': lx('<Pnts>' + P(1, '0 0 1'), ''),
  'an element in Pnts that is not a P': lx('<Pnts>' + P(1, '0 0 1') + '<Q>1</Q>' + P(2, '0 10 2') + P(3, '10 0 3') + '</Pnts>', '<Faces><F>1 2 3</F></Faces>'),
  'a self-closed P': lx('<Pnts>' + P(1, '0 0 1') + '<P id="5"/>' + P(2, '0 10 2') + P(3, '10 0 3') + '</Pnts>', '<Faces><F>1 2 3</F></Faces>'),
};
for (const [label, text] of Object.entries(cases)) {
  let tree = null, terr = null, fast = null, ferr = null;
  try { tree = readLandXml(text, { fast: false }); } catch (e) { terr = e.message; }
  try { fast = readLandXml(text); } catch (e) { ferr = e.message; }
  ok(terr === ferr && JSON.stringify(tree) === JSON.stringify(fast), 'stream = tree: ' + label, { terr, ferr, tree: JSON.stringify(tree)?.slice(0, 200), fast: JSON.stringify(fast)?.slice(0, 200) });
  for (const n of [1, 3, 11]) {
    // the same parts to both readers (xml.js, the tree, reads a CDATA wrong when '<![CDATA[' is spread over three or more parts: parts of
    // 1 to 3 characters only, never the 4 MB parts of a real file; noted in docs/0.11-sessions/perf-finish-11-civil.md)
    const parts = cutParts(text, n);
    let t2 = null, te2 = null, f2 = null, e2 = null;
    try { t2 = readLandXml(parts, { fast: false }); } catch (e) { te2 = e.message; }
    try { f2 = readLandXml(parts); } catch (e) { e2 = e.message; }
    const sameParts = te2 === e2 && JSON.stringify(t2) === JSON.stringify(f2), sameWhole = terr === e2 && JSON.stringify(tree) === JSON.stringify(f2);
    ok(sameParts || (n < 11 && sameWhole), 'stream = tree in parts of up to ' + n + ': ' + label, { te2, e2, terr });
    if (n >= 11) ok(JSON.stringify(f2) === JSON.stringify(tree), 'parts of up to ' + n + ' read as the whole text: ' + label);
  }
}
ok(cutLists(cases['plain'])?.blocks.length === 2, 'a plain file is read by the stream (not left to the tree)');
ok(cutLists(cases['a comment inside Pnts']) === null, 'a list with a comment gives the whole file to the tree');

if (process.argv.includes('--big')) {
  const big = fs.readFileSync('/var/www/CADCRAFT/testfiles/generated/civil/landxml-tin-500k.xml', 'utf8');
  global.gc?.();
  let h0 = process.memoryUsage().heapUsed, t0 = performance.now();
  const tree = readLandXml(big, { fast: false });
  const tTree = performance.now() - t0, hTree = process.memoryUsage().heapUsed - h0;
  global.gc?.(); h0 = process.memoryUsage().heapUsed; t0 = performance.now();
  const fast = readLandXml(cutParts(big, 4 << 20));
  const tFast = performance.now() - t0, hFast = process.memoryUsage().heapUsed - h0;
  ok(JSON.stringify(tree.surfaces[0].pts) === JSON.stringify(fast.surfaces[0].pts) && JSON.stringify(tree.surfaces[0].faces) === JSON.stringify(fast.surfaces[0].faces) && JSON.stringify({ ...tree, surfaces: null }) === JSON.stringify({ ...fast, surfaces: null }), 'the 500k bench file: the same result');
  console.log(`landxml-tin-500k.xml (${(big.length / 1048576).toFixed(0)} MB, ${tree.surfaces[0].pts.length} points, ${tree.surfaces[0].faces.length} faces): tree ${tTree.toFixed(0)} ms (+${(hTree / 1048576).toFixed(0)} MB heap after), stream ${tFast.toFixed(0)} ms (+${(hFast / 1048576).toFixed(0)} MB)`);
}
console.log(`test-civilcraft-open-finish11: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
