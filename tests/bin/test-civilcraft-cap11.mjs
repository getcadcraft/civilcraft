#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-civilcraft-cap11.mjs — CivilCraft, the 2,000,000-point cap lifted (perf-finish-11 lane civil, owner 2026-11-22), in Node.
 *   1. point-table.js PointTable against the array of point objects it replaced: random appends, removals, puts back, row edits, truncations
 *      and moves of every point; the objects read back, the project file's rows (blockRowsJSON), indexOfName, the block sizes.
 *   2. project-stream.js against JSON.parse + pointColumns: random project texts (odd rows, escapes, nested values, numbers of every form, a second
 *      "points" key, a "points" that is not an array, white space), each cut into parts of 1 to 50,000 characters: the same rows kept, the same
 *      rest of the file, the same total; text JSON.parse refuses is refused.
 *   3. OLD (the snapshot taken before this work, tmp/pf11-civil-cap-before/) against NEW on the same inputs: Project.fromJSON → the project file
 *      (toJSON, = the saved file's object), the groups, the figures, the surface (triangles, stats) and the contours; then the same edits through
 *      the old calls (editPoints with arrays) and the new ones (editPointTable: delete by name, paste, duplicate, move one point, convert every
 *      coordinate): the same project file after each edit, after undoing all of them and after redoing them; the autosave copy (recoverText)
 *      equals the project file; a point edit's undo step keeps only the rows it changed.
 *   node bin/test-civilcraft-cap11.mjs [--big]   (--big: also survey-500k.civilcraft.json, old vs new open + surface + contours)
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const NEW = path.join(REPO, 'public_html/assets/apps/civilcraft/dev'), OLD = path.join(REPO, 'tmp/pf11-civil-cap-before');
const BIG = process.argv.includes('--big');
const strings = JSON.parse(fs.readFileSync(path.join(NEW, 'lang/en.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(NEW, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const imp = (dir, f) => import(pathToFileURL(path.join(dir, f)).href);
(await imp(NEW, 'i18n.js')).init({ strings });
const hasOld = fs.existsSync(path.join(OLD, 'project.js'));
if (hasOld) (await imp(OLD, 'i18n.js')).init({ strings });
const N = { ...(await imp(NEW, 'project.js')), ...(await imp(NEW, 'point-edit.js')), ...(await imp(NEW, 'crs-pick.js')) };
const O = hasOld ? { ...(await imp(OLD, 'project.js')), ...(await imp(OLD, 'point-edit.js')), ...(await imp(OLD, 'crs-pick.js')) } : null;
const { PointTable, BLOCK, BlockWriter, pointBlocks } = await imp(NEW, 'point-table.js');
const { ProjectStream } = await imp(NEW, 'project-stream.js');
const { pointColumns, writeRow } = await imp(NEW, 'project-rows.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 400)); } };
let seed = 11; const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const fileOf = (p) => { const j = p.toJSON(); delete j.saved; return JSON.stringify(j, null, 1); };
const rowJSON = (arr) => JSON.stringify(arr.map((p) => (p.blk ? [p.n, p.x, p.y, p.z, p.d, p.blk] : [p.n, p.x, p.y, p.z, p.d])));

// ---- 1. the table against the array
console.log('== point table against the array of point objects');
{
  const mk = (i) => { const r = rnd(); if (r < 0.04) return { x: i, n: 'w' + i, y: 2, z: 3, d: 'X' }; if (r < 0.07) return { n: String(i), x: i, y: -i, z: null, d: undefined, blk: { name: 'B' + i } }; if (r < 0.09) return { n: '', x: 0.1 * i, y: -0, z: -0, d: '' }; if (r < 0.1) return { n: 5, x: 1, y: 2, z: 3, d: 'num name' }; return { n: String(i % 40), x: i * 1.5, y: i / 3, z: rnd() < 0.2 ? null : i % 7, d: ['GRD', 'EP B', '', 'TOP  1', 'é 中'][i % 5] }; };
  let arr = [], id = 0; const t = PointTable.from([]);
  let rounds = 0, bad = 0;
  for (let round = 0; round < 600; round++) {
    const op = rnd();
    if (op < 0.35) { const add = Array.from({ length: 1 + (rnd() * (rnd() < 0.1 ? 3 * BLOCK : 300) | 0) }, () => mk(id++)); arr = arr.concat(add); t.append(rnd() < 0.5 ? add : PointTable.from(add)); }
    else if (op < 0.6 && arr.length) {
      const idx = [...new Set(Array.from({ length: 1 + (rnd() * 300 | 0) }, () => rnd() * arr.length | 0))].sort((a, b) => a - b);
      const gone = t.removeAt(idx), exp = idx.map((i) => arr[i]);
      if (JSON.stringify(gone.toArray()) !== JSON.stringify(exp)) bad++;
      const set = new Set(idx); arr = arr.filter((_, i) => !set.has(i));
      if (rnd() < 0.5) { t.insertAt(idx, gone); const a2 = []; let j = 0, k = 0; for (let f = 0; f < arr.length + idx.length; f++) a2.push(j < idx.length && idx[j] === f ? exp[j++] : arr[k++]); arr = a2; }
    } else if (op < 0.8 && arr.length) { const i = rnd() * arr.length | 0, p = mk(id++); arr[i] = p; t.setRow(i, p); }
    else if (op < 0.85 && arr.length) { const n = rnd() * arr.length | 0; arr = arr.slice(0, n); t.truncate(n); }
    else if (arr.length) { const { xs, ys } = t.getXY(); for (let i = 0; i < xs.length; i++) { xs[i] += 1; ys[i] -= 2; } t.setXY(xs, ys); arr = arr.map((p) => ({ ...p, x: Number(p.x) + 1, y: Number(p.y) - 2 })); }
    if (t.length !== arr.length) bad++;
    if (round % 25 === 0 || round === 599) {
      rounds++;
      ok(JSON.stringify(t.toArray()) === JSON.stringify(arr) && t.toArray().every((p, i) => Object.keys(p).join() === Object.keys(arr[i]).join()), 'round ' + round + ': the same point objects, keys in the same order (' + arr.length + ')');
      const txt = '[' + t.blocks.map((b) => t.blockRowsJSON(b).slice(1, -1)).filter(Boolean).join(',') + ']';
      ok(txt === rowJSON(arr), 'round ' + round + ': the blocks write the rows the project file wrote');
      ok(JSON.stringify(t.rows()) === rowJSON(arr), 'round ' + round + ': rows() = points.map(pointRow)');
      let names = true; for (let q = 0; q < 40 && arr.length; q++) { const i = rnd() * arr.length | 0; if (t.indexOfName(arr[i].n) !== arr.findIndex((p) => p.n === arr[i].n)) names = false; }
      ok(names && t.indexOfName('nope') === -1, 'round ' + round + ': indexOfName = findIndex by name');
      ok(t.blocks.every((b) => b.n > 0 && b.n <= 2 * BLOCK && b.x.length === b.n), 'round ' + round + ': blocks of 1 to ' + 2 * BLOCK + ' rows');
      ok(t.countWithZ() === arr.filter((p) => p.z !== null).length, 'round ' + round + ': countWithZ');
    }
  }
  ok(bad === 0, 'every step: removed rows and lengths as the array', bad);
  // the compat reads
  const v = N.Project.fromJSON({ format: 'civilcraft-project', version: 1, points: [['1', 1, 2, 3, 'a'], ['2', 4, 5, null, 'b']] }).project.points;
  ok(v[1].x === 4 && v.length === 2 && v.at(-1).n === '2' && v.filter((p) => p.z === null).length === 1 && [...v].length === 2 && v.map((p) => p.n).join() === '1,2' && JSON.stringify(v) === '[{"n":"1","x":1,"y":2,"z":3,"d":"a"},{"n":"2","x":4,"y":5,"z":null,"d":"b"}]', 'project.points reads as the array it was (index, at, filter, map, spread, JSON)');
  let threw = false; try { v[0] = { n: 'x' }; } catch { threw = true; }
  ok(threw, 'writing project.points[i] is refused (edits go through editPointTable)');
  // the Worker's blocks
  const cols = { count: 20000, x: Float64Array.from({ length: 20000 }, (_, i) => i), y: new Float64Array(20000), z: new Float64Array(20000).fill(NaN), names: Array.from({ length: 20000 }, (_, i) => 'p' + i), descs: Array.from({ length: 20000 }, (_, i) => 'D' + (i % 3)), blk: [5, { a: 1 }, 19000, { b: 2 }] };
  const pt = PointTable.fromParts(structuredClone(pointBlocks(cols)));
  ok(JSON.stringify(pt.get(5)) === JSON.stringify({ n: 'p5', x: 5, y: 0, z: null, d: 'D2', blk: { a: 1 } }) && pt.get(19000).blk.b === 2 && pt.indexOfName('p19999') === 19999 && pt.length === 20000, 'the Worker\'s blocks through a structured clone read back');
}

// ---- 2. the streamed reader against JSON.parse + pointColumns
console.log('== project-stream.js against JSON.parse + pointColumns');
{
  const MAXR = 300;
  const val = () => { const r = rnd(); return r < 0.2 ? 'GRD' : r < 0.3 ? 'a\\"b\\u00e9\\n' : r < 0.4 ? -0.0 : r < 0.5 ? 1e-7 : r < 0.55 ? 1e308 : r < 0.6 ? null : r < 0.65 ? true : r < 0.7 ? { k: [1, 2] } : r < 0.75 ? [1, [2]] : r < 0.8 ? '' : rnd() * 1000 - 500; };
  const numText = () => ['0', '-0', '12', '-3.25', '1e5', '2E-3', '1.5e+2', '-0.0', '123456789.123456789'][rnd() * 9 | 0];
  const rowText = (i) => {
    const r = rnd();
    if (r < 0.05) return JSON.stringify('not a row');
    if (r < 0.08) return '{"a":1}';
    if (r < 0.1) return '[]';
    if (r < 0.14) return JSON.stringify([String(i), val(), val(), val(), val(), val()]);
    const sp = () => (rnd() < 0.2 ? ' \n\t'.slice(0, 1 + (rnd() * 3 | 0)) : '');
    const parts = [rnd() < 0.1 ? String(i) : JSON.stringify(rnd() < 0.1 ? 'n\\' + i : 'P' + i), numText(), numText(), rnd() < 0.2 ? 'null' : numText(), JSON.stringify(['GRD', 'EP B', '', 'x"y', 'é'][i % 5])];
    if (rnd() < 0.05) parts.push(JSON.stringify({ name: 'B' + i, layer: 'L', handle: 'h' }));
    return '[' + sp() + parts.join(sp() + ',' + sp()) + sp() + ']';
  };
  const projText = (n, shape) => {
    const rows = Array.from({ length: n }, (_, i) => rowText(i)).join(rnd() < 0.5 ? ',' : ' ,\n ');
    const head = '{"format":"civilcraft-project","version":1,"name":"s \\"t\\" {[","units":"m","surface":{"points":[1,2],"groups":{"GRD":"points"}},';
    if (shape === 'twice') return head + '"points":[' + rows + '],"x":[{"points":1}],"points":[["9",1,2,3,"late"]]}';
    if (shape === 'notarray') return head + '"points":{"a":1},"seq":3}';
    if (shape === 'none') return '{"format":"civilcraft-project","version":1,"seq":2}';
    if (shape === 'escaped') return head + '"p\\u006fints":[' + rows + '],"seq":4}';
    if (shape === 'array') return '[' + rows + ']';
    return head + ' "points" : [' + rows + ']  ,"seq":5, "gis": {"layers":[]}} ';
  };
  const viaStream = (text, cut, max) => {
    const w = new BlockWriter(), st = new ProjectStream({ max, rowOf: writeRow, writer: w });
    for (let i = 0; i < text.length;) { const n = 1 + Math.floor(rnd() * cut); st.push(text.slice(i, i + n)); i += n; }
    const r = st.end(), obj = JSON.parse(r.rest.join(''));
    let parts, total = r.total;
    if (r.found === 'one' && obj && typeof obj === 'object' && !Array.isArray(obj)) parts = w.done();
    else { const cols = pointColumns(obj && typeof obj === 'object' ? obj.points : null, max); total = cols.total; parts = pointBlocks(cols); }
    if (obj && typeof obj === 'object') delete obj.points;
    return { obj, rows: PointTable.fromParts(parts).toArray(), total };
  };
  const viaParse = (text, max) => {
    const obj = JSON.parse(text), cols = pointColumns(obj && typeof obj === 'object' ? obj.points : null, max);
    if (obj && typeof obj === 'object') delete obj.points;
    const names = cols.names.split('\u0000'), descs = cols.descs.split('\u0000'), rows = [];
    for (let i = 0; i < cols.count; i++) rows.push({ n: names[i], x: cols.x[i], y: cols.y[i], z: Number.isNaN(cols.z[i]) ? null : cols.z[i], d: descs[i] });
    for (let i = 0; i < cols.blk.length; i += 2) rows[cols.blk[i]].blk = cols.blk[i + 1];
    return { obj, rows, total: cols.total };
  };
  let cases = 0, same = 0;
  for (const shape of ['plain', 'plain', 'plain', 'twice', 'notarray', 'none', 'escaped', 'array']) for (const n of [0, 1, 5, 200, 3000]) for (const cut of [1, 3, 17, 500, 50000]) for (const max of [Infinity, 7]) {
    const text = projText(n, shape), a = viaParse(text, max), b = viaStream(text, cut, max);
    cases++;
    if (JSON.stringify(a.obj) === JSON.stringify(b.obj) && JSON.stringify(a.rows) === JSON.stringify(b.rows) && a.total === b.total && Object.is(a.rows[0]?.x, b.rows[0]?.x)) same++;
    else if (same + 3 > cases) console.log('  differs: ' + shape + ' n ' + n + ' cut ' + cut + ' max ' + max, JSON.stringify([a.total, b.total, a.rows.length, b.rows.length]));
  }
  ok(same === cases, 'the same rows, rest and total as JSON.parse + pointColumns (' + same + ' of ' + cases + ' texts, cut 1 to 50,000 characters)');
  // -0 and the number forms survive (Object.is)
  { const r = viaStream('{"points":[["a",-0,1e-7,-0.0,"d"]]}', 3, Infinity).rows[0]; ok(Object.is(r.x, -0) && r.y === 1e-7 && Object.is(r.z, -0), 'numbers read as JSON.parse reads them (-0, exponents)'); }
  // what JSON.parse refuses is refused
  let refused = 0; const bads = ['{"points":[["a",1,2,3,"d"],]}', '{"points":[["a",01,2,3,"d"]]}', '{"points":[["a",1,2,3,"d"]', '{"points":[["a\u0001",1,2,3,"d"]]}', '{"points":[["a",1,2,3,"d"] ["b",1,2,3,"d"]]}', '{"points":[["a",1,2,3,"d"]]', '{"points":[["a",1,2,3,"d"]]} x', '{"points":[["a",1,2,nul,"d"]]}', '{"points":[["a",1,2,3,"d\\x"]]}'];
  for (const s of bads) { let threw = false; try { JSON.parse(s); } catch { threw = true; } let t2 = false; try { viaStream(s, 4, Infinity); } catch { t2 = true; } if (threw && t2) refused++; else console.log('  not refused: ' + s, threw, t2); }
  ok(refused === bads.length, 'text JSON.parse refuses is refused (' + refused + ' of ' + bads.length + ')');
}

// ---- 3. OLD against NEW
if (!O) console.log('(no snapshot in tmp/pf11-civil-cap-before: old-vs-new skipped)');
else {
  console.log('== old (before) against new: open, surface, contours, edits, undo, autosave');
  const projObj = (n, extra = {}) => ({ format: 'civilcraft-project', version: 1, name: 'cmp ' + n, units: 'ft', seq: 5, pointsFile: 'pts.csv',
    points: Array.from({ length: n }, (_, i) => { const x = 1000 + (i % 250) * 3 + rnd(), y = 2000 + Math.floor(i / 250) * 3 + rnd(); const r = [String(i + 1), x, y, rnd() < 0.03 ? null : 100 + Math.sin(x / 50) * 5 + Math.cos(y / 70) * 3, ['GRD', 'GRD', 'EP B', 'EP', 'TOP', 'TC E', ''][i % 7]]; if (i % 997 === 3) r.push({ name: 'BLK' + i, layer: 'L', handle: 'h' + i }); return r; }),
    surface: { descKeys: [{ code: 'TOP', use: 'breakline' }], lineCodes: { on: true, begin: ['B'], end: ['E'], close: ['C'] } }, display: { interval: 2, smooth: 'light' }, ...extra });
  const pair = (obj) => [O.Project.fromJSON(structuredClone(obj)), N.Project.fromJSON(structuredClone(obj))];
  const surf = (p) => { const s = p.eg().surface; return s ? JSON.stringify([s.nT, s.stats(), p.contours().length, p.contours().slice(0, 30)]) : 'none'; };
  const look = (p) => fileOf(p) + '|' + JSON.stringify(p.groups()) + '|' + JSON.stringify(p.figures().map((f) => [f.code, f.pts.length, f.closed])) + '|' + JSON.stringify(p.egBreaklines().length);
  for (const n of [0, 3, 500, 12000]) {
    const [a, b] = pair(projObj(n));
    ok(JSON.stringify(a.notes) === JSON.stringify(b.notes), n + ' points: the same notes', [a.notes, b.notes]);
    ok(look(a.project) === look(b.project), n + ' points: the same project file, groups, figures and breaklines');
    ok(surf(a.project) === surf(b.project), n + ' points: the same surface (triangles, stats) and contours');
    ok(JSON.stringify(b.project.figures(null, { coded: true })) === JSON.stringify(b.project.figures().filter((f) => f.coded)), n + ' points: figures({ coded }) = figures().filter(coded)');
    ok(JSON.stringify(b.project.egPoints()) === JSON.stringify(a.project.egPoints()), n + ' points: the same existing-ground points');
    { const c = b.project.egColumns(), e = a.project.egPoints(); ok(c.n === e.length && e.every((p, i) => p.x === c.xs[i] && p.y === c.ys[i] && p.z === c.zs[i]), n + ' points: egColumns = egPoints as columns'); }
  }
  // the edits, old calls vs new calls
  const ops = (lib, p, newApi) => {
    const out = [];
    const step = (what) => { out.push(what + '|' + fileOf(p)); };
    const names = p.points.map((q) => q.n);
    // 1. delete by name
    const gone = new Set(names.filter((_, i) => i % 13 === 5));
    if (newApi) p.editPointTable('del', (ed) => { ed.removeWhereName((n) => gone.has(n)); }); else p.editPoints('del', (pts) => pts.filter((q) => !gone.has(q.n)));
    step('delete');
    // 2. paste (append)
    const add = Array.from({ length: 777 }, (_, i) => ({ n: 'n' + i, x: 1100 + i, y: 2100 - i, z: i % 9 ? 90 + i / 100 : null, d: i % 2 ? 'GRD' : 'NEW CODE' }));
    if (newApi) p.editPointTable('paste', (ed) => { ed.add(add); }); else p.editPoints('paste', (all) => all.concat(add));
    step('paste');
    // 3. move one point (point-edit.js, old and new), and rename one
    const r1 = lib.editPoint(p, names[7], { x: '1234.5', y: 2222.25, z: '' });
    const r2 = lib.editPoint(p, names[40], { n: 'renamed', d: 'TOP' });
    step('edit ' + r1.ok + r2.ok + r1.followed);
    // 4. every coordinate converted (the coordinate system dialog)
    const map = (x, y) => [x * 0.3048 + 10, y * 0.3048 - 5];
    let res = null;
    if (newApi) p.editPointTable('crs', (ed, st) => { res = lib.reprojectProject(st, ed.table, map); if (res.refused) return null; ed.setXY(res.xs, res.ys); });
    else p.editPoints('crs', (pts, st) => { res = lib.reprojectProject(st, pts, map); if (res.refused) return null; return res.points; });
    step('convert ' + res.moved);
    // 5. a cancelled edit leaves nothing
    if (newApi) p.editPointTable('nothing', (ed) => { ed.add(add); ed.removeWhereName(() => true); return false; }); else p.editPoints('nothing', () => null);
    step('cancelled');
    while (p.undo()) step('undo');
    while (p.redo()) step('redo');
    p.undo(); p.undo(); step('undo2');
    return out;
  };
  for (const n of [40, 3000, 20000]) {
    const obj = projObj(n, { surface: { breaklines: [{ name: 'BL', pts: [] }] } });
    const [a, b] = pair(obj);
    // a breakline through point 8 (index 7): the move takes it along
    const q7 = b.project.points[7];
    for (const p of [a.project, b.project]) p.state.surface.breaklines = [{ name: 'BL', pts: [{ x: q7.x, y: q7.y, z: q7.z ?? 0 }, { x: q7.x + 5, y: q7.y + 5, z: 1 }] }];
    a.project.h.reset(a.project.state); b.project.h.reset(b.project.state);
    const oa = ops(O, a.project, false), ob = ops(N, b.project, true);
    let first = -1; for (let i = 0; i < Math.max(oa.length, ob.length); i++) if (oa[i] !== ob[i]) { first = i; break; }
    ok(first < 0 && oa.length === ob.length, n + ' points: the same project file after each of ' + oa.length + ' edits, undos and redos (old editPoints vs new editPointTable)', first < 0 ? '' : [first, (oa[first] || '').slice(0, 60), (ob[first] || '').slice(0, 60)]);
    ok(surf(a.project) === surf(b.project), n + ' points: the same surface and contours after them');
  }
  // Save's own writer (ifc-native.js writePair: the project file and its IFC) — the same bytes from the old code and the new
  {
    const WO = await imp(OLD, 'ifc-native.js'), WN = await imp(NEW, 'ifc-native.js');
    const [a, b] = pair(projObj(3000));
    const now = new Date('2026-11-22T12:00:00Z');
    let ra, rb, why = '';
    try { ra = await WO.writePair(a.project, { stem: 'cmp', now }); rb = await WN.writePair(b.project, { stem: 'cmp', now }); } catch (e) { why = e.message; }
    ok(ra && rb && ra.jsonText === rb.jsonText && ra.ifcText === rb.ifcText && ra.jsonText.length > 100000, 'Save writes the same project file and IFC, byte for byte (' + (ra ? ra.jsonText.length : 0) + ' + ' + (ra ? ra.ifcText.length : 0) + ' characters)', why);
  }
  // Save in parts (past PARTS_FROM points): the same project file text and hash as the one-string Save, on rows of every kind
  {
    const WN = await imp(NEW, 'ifc-native.js');
    const obj = projObj(9000);
    obj.points.push(['blk', 1, 2, 3, 'B', { name: 'BL', layer: 'L', scale: [1, 2, 3], at: [[1, 2], [3, 4]] }], ['é "q" \\ x', -0, 1e-7, null, 'x\ty'], ['n', 5, 6, 7, '']);
    const p = N.Project.fromJSON(obj).project;
    p.pointTable.append([{ x: 1, n: 'irregular', y: 2, z: 3, d: 'k' }, { n: 7, x: 1, y: 2, z: 3, d: 9 }]);   // kept whole: other key order, a number name
    const now = new Date('2026-11-22T12:00:00Z');
    const one = await WN.writePair(p, { stem: 'pp', now });
    WN.writePair.partsFrom = 0;
    let two, why = '';
    try { two = await WN.writePair(p, { stem: 'pp', now }); } catch (e) { why = e.stack; } finally { delete WN.writePair.partsFrom; }
    const text2 = two && (typeof two.jsonText === 'string' ? two.jsonText : await two.jsonText.text());
    ok(two && text2 === one.jsonText, 'Save in parts writes the same project file text (' + one.jsonText.length + ' characters, block references, escapes, -0, rows kept whole)', why || (text2 || '').slice(0, 80));
    ok(two && two.jsonHash === one.jsonHash && two.embeddedBytes === 0 && !/'gzip\+base64:/.test(two.ifcText) && two.ifcText.includes(one.jsonHash), 'its hash is the same and the IFC names it (no embedded copy in parts)');
    const back = N.Project.fromJSON(JSON.parse(text2)).project, back1 = N.Project.fromJSON(JSON.parse(one.jsonText)).project;
    ok(fileOf(back) === fileOf(back1) && back.points.length === p.points.length, 'the file written in parts opens as the one-string file does');
  }
  // the old call (editPoints with arrays: add-ons) on the new table: the same files as the old code through undo and redo, and a record of the changed rows only
  {
    const [a, b] = pair(projObj(9000));
    const fns = [
      (pts) => { pts[7] = { ...pts[7], z: 99 }; return pts; },
      (pts) => pts.filter((q, i) => i % 50 !== 3),
      (pts) => pts.concat([{ n: 'a1', x: 1, y: 2, z: 3, d: 'Q' }]),
      (pts) => [{ n: 'first', x: 0, y: 0, z: null, d: '' }, ...pts],
      (pts) => pts.map((q) => ({ ...q, x: q.x + 1 })),
      (pts) => pts.slice(0, 100).concat(pts.slice(200)),
      (pts) => pts.reverse(),
      () => [],
    ];
    const seqOf = (p) => { const out = []; for (const f of fns) { p.editPoints('legacy', f); out.push(fileOf(p)); } while (p.undo()) out.push(fileOf(p)); while (p.redo()) out.push(fileOf(p)); return out; };
    const sa = seqOf(a.project), sb = seqOf(b.project);
    ok(sa.length === sb.length && sa.every((x, i) => x === sb[i]), 'the old editPoints call: the same project file after each of ' + sa.length + ' edits, undos and redos');
    const p = N.Project.fromJSON(projObj(9000)).project;
    p.editPoints('one', (pts) => { pts[4000] = { ...pts[4000], z: 1 }; return pts; });
    const st = p.undoStack.at(-1);
    ok(!st.pts && st.prec.ops.length === 2 && st.prec.ops.every((o) => o.frag.length === 1), 'the old call changing one point records that one row (removed and put in)', st.prec.ops.map((o) => [o.k, o.frag.length]));
  }
  // the undo step of a point edit keeps the changed rows only
  {
    const p = N.Project.fromJSON(projObj(200000)).project;
    const before = JSON.stringify(p.pointTable.rows());
    N.editPoint(p, '1000', { x: 1, y: 2 });
    const st = p.undoStack[p.undoStack.length - 1];
    ok(!st.pts && st.prec && st.prec.bytes < 2000, 'a point move\'s undo step: no copy of the points, ' + st.prec.bytes + ' bytes recorded (200,000 points)', st.prec?.bytes);
    p.editPointTable('del', (ed) => { ed.remove([5, 6, 7]); });
    ok(p.undoStack[p.undoStack.length - 1].prec.bytes < 4000, 'deleting 3 points: ' + p.undoStack[p.undoStack.length - 1].prec.bytes + ' bytes recorded');
    p.undo(); p.undo();
    ok(JSON.stringify(p.pointTable.rows()) === before, 'undone: the rows as they were');
    // autosave: the journal copy reads back as the project file, after edits too
    const j = p.autosaveJournal(); const b0 = await j.base(); b0.commit?.(); const rec = { data: b0.data, segments: [] };
    N.editPoint(p, '50', { z: '12.5' }); p.editPointTable('add', (ed) => { ed.add([{ n: 'zz', x: 1, y: 1, z: 1, d: 'Q' }]); }); p.editPointTable('del', (ed) => { ed.remove([0, 70000, 199999]); });
    const d = await j.delta(); rec.segments.push(d.data); d.commit?.();
    const back = JSON.parse(N.recoverText(rec)); delete back.saved; const now = p.toJSON(); delete now.saved;
    ok(JSON.stringify(back) === JSON.stringify(now), 'the autosave copy (base + one change) reads back as the project file');
    // an edit while the copy is being written (the write yields between blocks): the copy is the project as it was when the write began, the
    // next change brings the edit
    {
      const p2 = N.Project.fromJSON(projObj(300000)).project, j2 = p2.autosaveJournal();
      const want = fileOf(p2);
      let yielded = false; const tick = setTimeout(() => { yielded = true; N.editPoint(p2, '7', { x: 5, y: 6 }); p2.editPointTable('mv', (ed) => { const { xs, ys } = ed.table.getXY(); for (let i = 0; i < xs.length; i++) xs[i] += 1; ed.setXY(xs, ys); }); }, 0);
      const b2 = await j2.base(); clearTimeout(tick); b2.commit?.();
      const got = JSON.parse(N.recoverText({ data: b2.data, segments: [] })); delete got.saved;
      const w0 = JSON.parse(want); delete w0.saved;
      ok(yielded && JSON.stringify(got) === JSON.stringify(w0), 'edits made while the first copy was written (it yielded: ' + yielded + '): the copy is the project as it was when the write began');
      const d2 = await j2.delta(); d2?.commit?.();
      const got2 = JSON.parse(N.recoverText({ data: b2.data, segments: d2 ? [d2.data] : [] })); delete got2.saved; const now2 = p2.toJSON(); delete now2.saved;
      ok(JSON.stringify(got2) === JSON.stringify(now2), 'and the next change brings them');
    }
    const setKeys = (d.data.set || []).map((e) => e[0]), blocks = setKeys.filter((k) => k.startsWith('x:pb:')).length;
    ok(blocks > 0 && blocks <= 4, 'the change wrote ' + blocks + ' blocks of points of ' + p.pointTable.blocks.length + ' (only the ones edited)', setKeys);
  }
  if (BIG) {
    const file = '/var/www/CADCRAFT/testfiles/generated/civil/survey-500k.civilcraft.json', text = fs.readFileSync(file, 'utf8');
    const a = O.Project.fromJSON(JSON.parse(text)), b = N.Project.fromJSON(JSON.parse(text));
    ok(fileOf(a.project) === fileOf(b.project), 'survey-500k: the same project file');
    ok(surf(a.project) === surf(b.project), 'survey-500k: the same surface and contours');
    // and through the streamed reader (what the Worker does)
    const w = new BlockWriter(), st = new ProjectStream({ max: N.MAX_POINTS, rowOf: writeRow, writer: w });
    for (let i = 0; i < text.length; i += 65536) st.push(text.slice(i, i + 65536));
    const r = st.end(), rest = JSON.parse(r.rest.join('')); delete rest.points;
    const c = N.Project.fromJSON(rest, { table: PointTable.fromParts(w.done()), total: r.total });
    ok(fileOf(c.project) === fileOf(a.project) && surf(c.project) === surf(a.project), 'survey-500k streamed: the same project file, surface and contours');
    // the plan scene past POINTS_ITEM_FROM: one 'points' item gives the DXF and PDF what one 'point' item each gave
    const S = await imp(NEW, 'scene.js'), PL = await imp(NEW, 'plot.js');
    const n = S.POINTS_ITEM_FROM + 3, T = PointTable.from(Array.from({ length: n }, (_, i) => ({ n: String(i), x: (i % 2000) * 1.5, y: Math.floor(i / 2000) * 1.5, z: i % 5 ? i % 97 : null, d: '' })));
    const one = S.planScene({ units: 'ft', points: T, pointTable: T }, { mmPerUnit: 1 }), each = S.planScene({ units: 'ft', points: T.toArray() }, { mmPerUnit: 1 });
    ok(one.items.filter((x) => x.kind === 'points').length === 1 && each.items.filter((x) => x.kind === 'point').length === n, 'past ' + S.POINTS_ITEM_FROM.toLocaleString('en-US') + ' points the scene holds one points item (' + one.items.length + ' items, was ' + each.items.length + ')');
    ok(JSON.stringify(S.toDxfEntities(one, 1)) === JSON.stringify(S.toDxfEntities(each, 1)), 'the same DXF entities from it');
    const sheet = (sc) => { try { return JSON.stringify(PL.planSheet(sc, { extents: { minX: 0, minY: 0, maxX: 3000, maxY: 1600 }, scale: { mmPerUnit: 0.1, label: '1:10' }, title: 'x' })).length; } catch (e) { return 'err ' + e.message; } };
    ok(sheet(one) === sheet(each), 'the same plot sheet from it', [sheet(one), sheet(each)]);
  }
}
console.log(`test-civilcraft-cap11: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
