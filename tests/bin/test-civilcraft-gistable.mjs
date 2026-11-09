#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-gistable.mjs — the attribute table and symbology by attribute of CivilCraft's GIS layers (0.9 SU.1080 round 2), DOM-free,
 * in Node: sorting, filtering, cell edits, field changes, the field calculator (no eval), CSV, class breaks (equal interval, quantile, natural
 * breaks), colour-blind safe ramps, the scene classes and the project file round trip.
 *
 *   node bin/test-civilcraft-gistable.mjs [--build dev|x.y] [--verbose]
 *
 * Every number is worked out by hand in the comment beside it (squares of known size, circles by the n-gon area formula) or by an
 * identity that needs no second program (inclusion-exclusion on random polygons, and a point-by-point membership check against the
 * ray-casting test over a grid of probe points).
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const BUILD = arg('--build') || 'dev';
const VERBOSE = process.argv.includes('--verbose');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft', BUILD);
if (fs.existsSync(path.join(APP, 'lang/en.json'))) (await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const PJ = await mod('project.js');
const GL = await mod('gis-layers.js');
const A = await mod('gis-analysis.js');
const T = await mod('gis-table.js');
const S = await mod('gis-symbology.js');
const TR = await mod('gis-table-run.js');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const eq = (a, b, m) => ok(JSON.stringify(a) === JSON.stringify(b), `${m} (${JSON.stringify(a)} vs ${JSON.stringify(b)})`);
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const section = (s) => console.log('\n== ' + s);
const rec = (o) => { const p = Object.create(null); Object.assign(p, o); return p; };

section('lib/gis is canonical, the app carries byte-identical copies');
for (const f of ['gis-poly.js', 'gis-analysis.js', 'gis-symbology.js', 'gis-table.js']) ok(fs.readFileSync(path.join(REPO, 'lib/gis', f)).equals(fs.readFileSync(path.join(APP, f))), f + ' is identical in lib/gis and ' + BUILD);

section('class breaks, worked by hand');
{
  const v = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  eq(S.equalInterval([0, 30], 3), [0, 10, 20, 30], 'equal interval 0..30 in 3: 10 each');
  eq(S.equalInterval([2, 4, 11], 3), [2, 5, 8, 11], 'equal interval 2..11 in 3: width 3');
  eq(S.quantile(v, 2), [1, 5.5, 10], 'quantile 1..10 in 2: median 5.5 (position 0.5 × 9 = 4.5, between 5 and 6)');
  eq(S.quantile(v, 4), [1, 3.25, 5.5, 7.75, 10], 'quantile 1..10 in 4: positions 2.25, 4.5, 6.75 → 3.25, 5.5, 7.75');
  eq(S.quantile([5, 5, 5, 5, 9], 4), [5, 9], 'quantile with repeats: repeated breaks collapse to [5, 9]');
  eq(S.naturalBreaks([1, 2, 3, 10, 11, 12, 100, 101, 102], 3), [1, 3, 12, 102], 'natural breaks: three obvious clumps split at 3 and 12');
  eq(S.naturalBreaks([1, 1, 2, 2, 50, 51, 52], 2), [1, 2, 52], 'natural breaks in 2: {1,1,2,2} and {50,51,52}');
  eq(S.naturalBreaks([5, 5, 5], 3), [5, 5], 'natural breaks of one value: one class');
  // Jenks minimises the within-class sum of squares: check against brute force on a small set
  const data = [1, 2, 4, 7, 8, 15, 16, 30], best = (() => { let b = [Infinity, null]; for (let i = 1; i < 8; i++) for (let j = i + 1; j < 8; j++) { const cls = [data.slice(0, i), data.slice(i, j), data.slice(j)]; const ss = cls.reduce((s, c) => { const m = c.reduce((a, x) => a + x, 0) / c.length; return s + c.reduce((a, x) => a + (x - m) ** 2, 0); }, 0); if (ss < b[0]) b = [ss, [data[0], data[i - 1], data[j - 1], data[7]]]; } return b[1]; })();
  eq(S.naturalBreaks(data, 3), best, 'natural breaks equal the brute-force best 3-way split of 8 values');
  eq([S.classIndex(0, [0, 10, 20, 30]), S.classIndex(10, [0, 10, 20, 30]), S.classIndex(10.0001, [0, 10, 20, 30]), S.classIndex(30, [0, 10, 20, 30]), S.classIndex(31, [0, 10, 20, 30]), S.classIndex(-1, [0, 10, 20, 30]), S.classIndex(null, [0, 10, 20, 30])], [0, 0, 1, 2, -1, -1, -1], 'a value on a break goes to the lower class; outside the range and null are no class');
  const big = Array.from({ length: 4000 }, (_, i) => (i % 7) * 100 + (i % 13));
  const nb = S.classify(big, 'natural', 5); ok(nb.approx && nb.breaks.length >= 3 && nb.breaks[0] === 0, 'natural breaks on 4000 values use 1,500 sample values and say so');
}

section('colour ramps stay readable with colour blindness');
{
  eq(S.rampColors('viridis', 5), ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'], 'viridis in 5 = its five published stops');
  eq(S.rampColors('viridis', 5, true)[0], '#fde725', 'reverse flips the order');
  eq(S.rampColors('okabe', 3), ['#0072b2', '#e69f00', '#009e73'], 'Okabe-Ito: the first three published colours');
  eq(S.lerpHex('#000000', '#ffffff', 0.5), '#808080', 'halfway between black and white is #808080');
  for (const id of ['viridis', 'cividis']) {
    const lum = S.rampColors(id, 9).map(S.luminance);
    ok(lum.every((x, i) => i === 0 || x > lum[i - 1]), id + ': nine classes get steadily lighter (luminance rises every step), so order survives any colour vision');
  }
  const bl = S.rampColors('blues', 9).map(S.luminance); ok(bl.every((x, i) => i === 0 || x < bl[i - 1]), 'blues: steadily darker');
  // every pair of Okabe-Ito colours stays apart under each simulated colour vision (distance in linear RGB)
  const lin = (h) => [1, 3, 5].map((k) => { const v = parseInt(h.slice(k, k + 2), 16) / 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  let worst = Infinity;
  for (const kind of S.CVD_KINDS) {
    const c = S.rampColors('okabe', 8).map((h) => lin(S.cvdSimulate(h, kind)));
    for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) worst = Math.min(worst, Math.hypot(c[a][0] - c[b][0], c[a][1] - c[b][1], c[a][2] - c[b][2]));
  }
  ok(worst > 0.03, 'Okabe-Ito: the closest pair under protan, deutan and tritan simulation is still apart (min distance ' + worst.toFixed(3) + ' in linear RGB)');
  eq(S.cvdSimulate('#ffffff', 'deutan'), '#ffffff', 'white stays white under simulation (matrix rows sum to 1)');
}

section('compile: classes, counts and sizes by hand');
const layer = { name: 'Trees', geom: 'pt', fields: [{ name: 'Species', type: 'text' }, { name: 'DBH', type: 'number' }, { name: 'Planted', type: 'date' }], features: [] };
const sp = ['Oak', 'Oak', 'Elm', 'Elm', 'Elm', 'Ash', null, 'Oak'];
layer.features = sp.map((s, i) => ({ g: { t: 'pt', c: [i * 10, 0] }, p: rec({ Species: s, DBH: i === 7 ? null : (i + 1) * 5, Planted: '2020-0' + ((i % 9) + 1) + '-15' }) }));
{
  const c = S.compile({ ...layer, symbology: { mode: 'categorized', field: 'Species', ramp: 'okabe' } }, layer.features);
  eq(c.classes.map((k) => [k.label, k.count]), [['Ash', 1], ['Elm', 3], ['Oak', 3], ['', 1]], 'categorized: Ash 1, Elm 3, Oak 3 (alphabetical) and one "no value" class');
  eq(Array.from(c.classOf), [2, 2, 1, 1, 1, 0, 3, 2], 'class number of each feature');
  eq(c.classes[3].kind, 'none', 'the empty value is its own grey class');
  const g = S.compile({ ...layer, symbology: { mode: 'graduated', field: 'DBH', method: 'equal', classes: 3, ramp: 'viridis' } }, layer.features);
  // DBH = 5,10,...,35 and null: min 5 max 35 → breaks 5,15,25,35
  eq(g.breaks, [5, 15, 25, 35], 'graduated equal interval of 5..35 in 3: 5, 15, 25, 35');
  eq(g.classes.slice(0, 3).map((k) => k.count), [3, 2, 2], 'counts: 5,10,15 | 20,25 | 30,35 (a value on a break goes down)');
  eq(g.classes[0].label, '5 – 15', 'range label');
  eq(g.classes[3].count, 1, 'the null DBH is in the no-value class');
  const q = S.compile({ ...layer, symbology: { mode: 'graduated', field: 'DBH', method: 'quantile', classes: 2 } }, layer.features);
  eq(q.breaks, [5, 20, 35], 'quantile in 2 of 5,10,15,20,25,30,35: median 20');
  const z = S.compile({ ...layer, symbology: { mode: 'single', sizeField: 'DBH', sizeMin: 1, sizeMax: 3 } }, layer.features);
  near(z.size[0], 1, 1e-6, 'size by DBH: smallest value → sizeMin'); near(z.size[6], 3, 1e-6, '... largest → sizeMax'); near(z.size[3], 1 + 2 * (20 - 5) / 30, 1e-6, '... 20 is halfway between 5 and 35 → 1 + 2 × 15/30 = 2'); near(z.size[7], 1, 1e-6, '... no value → sizeMin');
  const many = { name: 'M', geom: 'pt', fields: [{ name: 'K', type: 'text' }], features: Array.from({ length: 30 }, (_, i) => ({ g: { t: 'pt', c: [i, 0] }, p: rec({ K: 'v' + (i % 12) }) })) };
  const m = S.compile({ ...many, symbology: { mode: 'categorized', field: 'K', ramp: 'okabe' } }, many.features);
  ok(m.classes.length === 8 && m.classes[7].kind === 'other' && m.note === 'other', 'twelve values with an eight-colour palette: seven colours and a grey "other" class');
}

section('the symbology of a project file is checked');
{
  const f = layer.fields;
  eq(S.cleanSymbology({ mode: 'graduated', field: 'Species' }, f), null, 'graduated on a text field falls back to single (nothing to keep)');
  eq(S.cleanSymbology({ mode: 'categorized', field: 'Gone' }, f), null, 'a field that is gone → single');
  const c = S.cleanSymbology({ mode: 'graduated', field: 'DBH', method: 'bogus', classes: 99, ramp: 'nope', sizeMin: 'x', __proto__: { evil: 1 }, extra: 1 }, f);
  ok(c.method === 'quantile' && c.classes === 9 && c.ramp === 'viridis' && c.sizeMin === 0.6 && !('extra' in c) && !('evil' in c), 'bad method, classes, ramp, size and unknown keys are cleaned');
  eq(S.cleanSymbology('x', f), null, 'not an object → null');
  const gs = await mod('gis-state.js');
  const raw = { mode: 'categorized', field: 'Species', ramp: 'okabe', classes: 5, reverse: false, method: 'quantile', sizeField: '', sizeMin: 0.6, sizeMax: 3, fill: false, legend: true };
  eq(gs.cleanSymbology(raw, f), S.cleanSymbology(raw, f), 'the small checker in gis-state.js (loaded at start) agrees with the library one');
  eq(gs.cleanSymbology({ mode: 'graduated', field: 'DBH', classes: 99, ramp: 'nope', sizeMin: 'x' }, f), S.cleanSymbology({ mode: 'graduated', field: 'DBH', classes: 99, ramp: 'nope', sizeMin: 'x' }, f), '... and on bad values');
}

section('table: coerce, sort, filter');
const tl = () => ({ name: 'T', geom: 'pt', fields: [{ name: 'Name', type: 'text' }, { name: 'N', type: 'number' }, { name: 'D', type: 'date' }, { name: 'B', type: 'bool' }], features: [['bob', 10, '2021-03-01', true], ['Alice', 2, '2020-12-31', false], ['carl', null, null, null], ['Dora', 33, '2021-01-15', true], ['alice', 2, '2022-02-28', false]].map(([a, n, d, b], i) => ({ g: { t: 'pt', c: [i, 0] }, p: rec({ Name: a, N: n, D: d, B: b }) })) });
{
  eq([T.coerce('12.5', 'number'), T.coerce('1,200', 'number'), T.coerce('abc', 'number'), T.coerce('', 'number'), T.coerce(null, 'text')], [{ ok: true, value: 12.5 }, { ok: true, value: 1200 }, { ok: false }, { ok: true, value: null }, { ok: true, value: null }], 'coerce numbers (a comma is a thousands mark), junk refused, empty = no value');
  eq([T.coerce('2024-02-29', 'date').ok, T.coerce('2023-02-29', 'date').ok, T.coerce('2023-13-01', 'date').ok, T.coerce('2024-02-29T10:00', 'date').value, T.coerce('1900-02-29', 'date').ok, T.coerce('2000-02-29', 'date').ok], [true, false, false, '2024-02-29', false, true], 'coerce dates: leap days (1900 no, 2000 yes), month 13 refused, a time part is cut');
  eq([T.coerce('Yes', 'bool').value, T.coerce('0', 'bool').value, T.coerce('maybe', 'bool').ok], [true, false, false], 'coerce yes/no');
  const L = tl();
  eq(T.sortIndices(L, 'N', 'asc'), [1, 4, 0, 3, 2], 'sort N ascending: 2, 2 (stable), 10, 33, then the empty one last');
  eq(T.sortIndices(L, 'N', 'desc'), [3, 0, 1, 4, 2], 'sort N descending: 33, 10, 2, 2 — the empty one stays last');
  eq(T.sortIndices(L, 'Name', 'asc'), [1, 4, 0, 2, 3], 'sort text without regard to case: Alice, alice, bob, carl, Dora');
  eq(T.sortIndices(L, 'D', 'asc'), [1, 3, 0, 4, 2], 'sort dates: 2020-12-31, 2021-01-15, 2021-03-01, 2022-02-28');
  eq(T.sortIndices(L, 'N', 'asc', [3, 0, 2]), [0, 3, 2], 'sort only some rows');
  eq(T.filterIndices(L, "N > 5").indices, [0, 3], 'filter by expression N > 5');
  eq(T.filterIndices(L, "Name like 'a%' and B = false").indices, [1, 4], "filter: Name like 'a%' and B = false");
  eq(T.filterIndices(L, 'N is null').indices, [2], 'filter: N is null');
  const w = T.filterIndices(L, 'alice 2022'); eq([w.mode, w.indices], ['value', [4]], 'not an expression → words in any column: "alice 2022" finds row 5');
  eq(T.filterIndices(L, '').indices.length, 5, 'empty filter shows everything');
}

section('table: cells, fields, calculator, CSV (pure)');
{
  const L = tl(), orig = JSON.stringify(L.features.map((f) => [f.g, f.p]));
  const f2 = T.setCell(L.features, 1, 'N', 99);
  ok(f2[1].p.N === 99 && L.features[1].p.N === 2 && f2[0] === L.features[0] && f2[1].g === L.features[1].g, 'setCell: a new array, one new feature, the others and the geometry are the same objects');
  const a = T.addField(L, 'Area', 'number'); ok(a.fields.length === 5 && a.features.every((f) => f.p.Area === null), 'addField: an empty field on every feature');
  eq([T.addField(L, 'name', 'text').error, T.addField(L, '', 'text').error, T.addField(L, 'x'.repeat(65), 'text').error, T.addField(L, 'a"b', 'text').error, T.addField(L, 'Q', 'blob').error], ['dup', 'empty', 'long', 'chars', 'type'], 'addField refuses a duplicate (any case), empty, long, quoted names and unknown types');
  const r = T.renameField(L, 'N', 'Count'); ok(r.fields[1].name === 'Count' && r.features[0].p.Count === 10 && !('N' in r.features[0].p) && r.fields.length === 4, 'renameField keeps values and order');
  eq(T.renameField(L, 'N', 'name').error, 'dup', '... and refuses a name that is taken');
  eq(T.renameField(L, 'N', 'n').fields[1].name, 'n', '... but allows changing only the case of its own name');
  const d = T.removeField(L, 'D'); ok(d.fields.length === 3 && !('D' in d.features[0].p), 'removeField');
  const c1 = T.calculate(L, 'N', 'N * 2 + 1'); eq(c1.features.map((f) => f.p.N), [21, 5, null, 67, 5], 'calculate N * 2 + 1 (empty stays empty)'); eq(c1.changed, 4, '... 4 rows changed (the empty one did not)');
  const c2 = T.calculate(L, 'Name', "upper(left(Name, 1)) || 'x'"); ok(c2.error && c2.error.code === 'syntax', 'a "||" is not in the language: a clear error, nothing run');
  const c3 = T.calculate(L, 'Name', "concat(upper(left(Name, 1)), lower(substr(Name, 2)), '-', N)"); eq(c3.features.map((f) => f.p.Name), ['Bob-10', 'Alice-2', 'Carl-', 'Dora-33', 'Alice-2'], 'concat, upper, left, lower, substr (1-based) on text');
  const c4 = T.calculate(L, 'N', "if(N >= 10, round(N / 3, 2), -1)"); eq(c4.features.map((f) => f.p.N), [3.33, -1, -1, 11, -1], 'if and round(…, 2): 10/3 = 3.33, 33/3 = 11');
  const c5 = T.calculate(L, 'N', 'Name', null); eq([c5.nulls, c5.features.every((f) => f.p.N === null)], [5, true], 'text into a number field: every row that cannot be a number is left empty and counted');
  const c6 = T.calculate(L, 'N', 'N * 10', [0, 3]); eq(c6.features.map((f) => f.p.N), [100, 2, null, 330, 2], 'calculate for chosen rows only');
  const c7 = T.calculate(L, 'D', 'year(D) + 1'); eq(c7.nulls, 4, 'a year is not a date: 4 results (the empty one is not counted) left empty');
  eq(T.calculate(L, 'N', 'N / 0').features.map((f) => f.p.N), [null, null, null, null, null], 'division by zero is empty, not Infinity');
  eq(T.calculate(L, 'N', 'process.exit(1)').error.code, 'field', 'a call to anything that is not in the function table is "no field called process.exit"');
  eq(T.calculate(L, 'N', 'round(1,2,3)').error.code, 'args', 'a function with the wrong number of values is refused');
  eq(T.calculate(L, 'N', '('.repeat(200) + '1' + ')'.repeat(200)).error.code, 'syntax', 'nesting 200 deep is refused, not a stack overflow');
  ok(orig === JSON.stringify(L.features.map((f) => [f.g, f.p])), 'no function changed its input');
  const csv = T.toCsv({ fields: [{ name: 'A,b', type: 'text' }, { name: 'N', type: 'number' }], features: [{ g: null, p: rec({ 'A,b': 'say "hi"\nthere', N: -5 }) }, { g: null, p: rec({ 'A,b': '=SUM(A1)', N: 1.5 }) }, { g: null, p: rec({ 'A,b': null, N: null }) }] });
  eq(csv, '"A,b",N\r\n"say ""hi""\nthere",-5\r\n\'=SUM(A1),1.5\r\n,\r\n', 'CSV: quotes doubled, commas and newlines quoted, a formula-looking text gets an apostrophe but a negative number does not, empty = empty');
}

section('table on a project: one undo step each, symbology saved and read back');
{
  const p = new PJ.Project();
  const [id] = GL.addLayers(p, [{ name: 'Trees', geom: 'pt', hasZ: false, fields: layer.fields.map((f) => ({ ...f })), features: layer.features.map((f) => ({ g: f.g, p: rec(f.p) })) }], { label: 'test import' });
  p.state.gis.layers[0].label = { field: 'DBH' };
  let n = p.undoStack.length;
  let r = TR.editCell(p, id, 0, 'DBH', '99'); ok(r.ok && p.gisFeatures.get(id)[0].p.DBH === 99 && p.undoStack.length === n + 1, 'edit a number cell: one undo step'); p.undo(); ok(p.gisFeatures.get(id)[0].p.DBH === 5, 'undo puts the old value back'); p.redo(); ok(p.gisFeatures.get(id)[0].p.DBH === 99, 'redo');
  n = p.undoStack.length;
  r = TR.editCell(p, id, 0, 'DBH', 'abc'); ok(!r.ok && r.error.code === 'type' && p.undoStack.length === n && TR.describe(r.error).includes('number'), 'a text in a number cell is refused with a sentence and no undo step: "' + TR.describe(r.error) + '"');
  r = TR.editCell(p, id, 0, 'DBH', ''); ok(r.ok && p.gisFeatures.get(id)[0].p.DBH === null, 'an empty box empties the cell');
  r = TR.editCell(p, id, 0, 'Planted', '2020-02-31'); ok(!r.ok, 'an impossible date is refused');
  r = TR.editCell(p, id, 1, 'Species', 'Maple'); ok(r.ok && p.gisFeatures.get(id)[1].p.Species === 'Maple', 'edit a text cell');
  n = p.undoStack.length;
  r = TR.calc(p, id, '', 'DBH * 2', { create: { name: 'Double', type: 'number' } }); ok(r.ok && p.undoStack.length === n + 1 && GL.layerOf(p, id).fields.length === 4 && p.gisFeatures.get(id)[2].p.Double === 30, 'calculator into a NEW field: the field and its values are ONE undo step (DBH 15 × 2 = 30)');
  p.undo(); ok(GL.layerOf(p, id).fields.length === 3, 'undo removes the new field again');
  r = TR.renameField(p, id, 'DBH', 'Trunk'); ok(r.ok && GL.layerOf(p, id).label.field === 'Trunk', 'renaming a field moves the label setting with it');
  GL.setLayer(p, id, { symbology: { mode: 'graduated', field: 'Trunk', method: 'equal', classes: 3, ramp: 'cividis' } });
  r = TR.renameField(p, id, 'Trunk', 'Girth'); ok(GL.layerOf(p, id).symbology.field === 'Girth', '... and the symbology');
  n = p.undoStack.length;
  r = TR.removeField(p, id, 'Girth'); ok(r.ok && !GL.layerOf(p, id).symbology && !GL.layerOf(p, id).label && p.undoStack.length === n + 1, 'removing the field drops the label and the symbology that used it, in one step');
  p.undo(); ok(GL.layerOf(p, id).symbology?.field === 'Girth' && GL.layerOf(p, id).label?.field === 'Girth', 'undo brings the field, the label and the symbology back');
  ok(!GL.setLayer(p, id, { symbology: { mode: 'graduated', field: 'Species' } }), 'a graduated style on a text field is refused');
  // the scene: one scene layer per class
  GL.setLayer(p, id, { label: null });
  GL.setLayer(p, id, { symbology: { mode: 'categorized', field: 'Species', ramp: 'okabe' } });
  const sc = GL.gisScene(p, 1);
  const names = sc.layers.map((l) => l.name);
  ok(names.every((nm) => nm.startsWith('GIS-' + id + '-c')) && sc.layers.every((l) => /^#[0-9a-f]{6}$/.test(l.token) && l.aci >= 1 && l.aci <= 9), 'scene: one layer per class with a #rrggbb colour and a CAD colour number: ' + names.join(','));
  ok(sc.items.length === 8 && new Set(sc.items.map((i) => i.layer)).size === sc.layers.length, 'scene: 8 point squares spread over the class layers');
  GL.setLayer(p, id, { symbology: { mode: 'single', sizeField: 'Nope', sizeMin: 1, sizeMax: 3 } });
  ok(GL.layerOf(p, id).symbology === undefined, '... (a size style on a field that does not exist, so a size style on it is dropped)');
  GL.setLayer(p, id, { symbology: { mode: 'single', sizeField: 'Double' } });
  const json = JSON.parse(JSON.stringify(p.toJSON()));
  GL.setLayer(p, id, { symbology: { mode: 'categorized', field: 'Species', ramp: 'okabe', legend: false } });
  const json2 = JSON.parse(JSON.stringify(p.toJSON()));
  const back = PJ.Project.fromJSON(json2);
  ok(!back.notes.length && back.project.state.gis.layers[0].symbology.field === 'Species' && back.project.state.gis.layers[0].symbology.legend === false, 'save and reopen: the symbology comes back, no notes');
  ok(json.format === 'civilcraft-project' && json.version === 1, 'the file format version stays 1 (an optional key on the layer; older builds ignore it)');
  const hostile = JSON.parse(JSON.stringify(json2)); hostile.gis.layers[0].symbology = { mode: 'graduated', field: 'Species', classes: 1e9, ramp: { x: 1 } };
  const h = PJ.Project.fromJSON(hostile); ok(!h.project.state.gis.layers[0].symbology, 'a hand-edited file with a graduated style on a text field opens with the plain colour');
  const old = JSON.parse(JSON.stringify(json2)); delete old.gis.layers[0].symbology;
  ok(!PJ.Project.fromJSON(old).project.state.gis.layers[0].symbology, 'a file without symbology (an older build) opens as before');
}

section('a few thousand features: sort, filter and calculate are fast');
{
  const N = 5000, big = { name: 'B', geom: 'pt', fields: [{ name: 'V', type: 'number' }, { name: 'K', type: 'text' }], features: Array.from({ length: N }, (_, i) => ({ g: { t: 'pt', c: [i, i] }, p: rec({ V: (i * 7919) % 1000, K: 'k' + (i % 50) }) })) };
  let t0 = performance.now();
  const s = T.sortIndices(big, 'V', 'asc'); const f = T.filterIndices(big, "V > 500 and K like 'k1%'"); const c = T.calculate(big, 'V', 'V * 2');
  const ms = performance.now() - t0;
  ok(s.length === N && s.every((i, k) => k === 0 || big.features[s[k - 1]].p.V <= big.features[i].p.V), '5,000 rows sorted in order');
  ok(f.indices.every((i) => big.features[i].p.V > 500 && big.features[i].p.K.startsWith('k1')) && f.indices.length > 0, 'the filter returns exactly the rows that match');
  ok(c.features[10].p.V === ((10 * 7919) % 1000) * 2, 'calculate over 5,000 rows');
  ok(ms < 1500, `sort + filter + calculate on 5,000 rows took ${ms.toFixed(0)} ms (under 1.5 s)`);
  console.log('  note 5,000 rows: sort + filter + calculate ' + ms.toFixed(0) + ' ms');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
