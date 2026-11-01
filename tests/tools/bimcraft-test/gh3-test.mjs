/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gh3-test.mjs — GH.3-D (a selected roof's settings coalesce into one undo step) and GH.3-E (TJI floor framing from a table the person
 * loads), session gh3build_PART_3. DOM-free: node bin/test-bimcraft.mjs --gh3
 * The only table used is tools/bimcraft-test/fixtures/tji-example.{json,csv}: MADE-UP numbers, "EXAMPLE, not for design".
 */
import path from 'node:path';
import fs from 'node:fs';

export async function gh3Mode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const T = await import(path.join(APP, 'tji-table.js'));
  const FR = await import(path.join(APP, 'res-framing.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const MU = await import(path.join(APP, 'model-units.js'));
  void MU;
  const FT = 304.8, IN = 25.4;
  const fx = (f) => fs.readFileSync(path.join(ROOT, 'tools/bimcraft-test/fixtures', f), 'utf8');
  const words = (k, v = {}) => k + (Object.keys(v).length ? ' ' + JSON.stringify(v) : '');

  console.log('== GH.3-E the table reader');
  const j = T.parseTjiTable(fx('tji-example.json'));
  ok(j.ok && j.table.example && j.table.rows.length === 3 && j.table.cases.length === 2, 'the JSON example table reads (3 rows, 2 load cases, marked EXAMPLE)');
  ok(j.ok && near(j.table.rows[0].depth, 9.5 * IN, 1e-6) && near(j.table.rows[0].spans.get('EX-40-10-L480')[0].max, 10 * FT, 1e-6), 'depth in inches and spans "10-0" read into mm');
  const c = T.parseTjiTable(fx('tji-example.csv'));
  ok(c.ok && c.table.rows.length === 2 && c.table.cases[0].live === 40 && c.table.example, 'the CSV form reads the same way');
  const m = T.parseTjiTable(JSON.stringify({ format: 'cadcraft-tji-table', version: 1, manufacturer: 'M', edition: 'E', source: 'S', units: 'metric', cases: [{ id: 'c', live: 1.9, dead: 0.5, deflection: 'L/480', bearing: 45 }], rows: [{ series: 'X', depth: 241, spans: { c: { 400: 4.5 } } }] }));
  ok(m.ok && near(m.table.rows[0].spans.get('c')[0].max, 4500, 1e-6) && near(m.table.cases[0].bearing, 45), 'a metric table: mm depth and spacing, spans in metres');
  const bads = [
    ['not our format', { format: 'x' }, 'tji.err.format'],
    ['no source', { format: 'cadcraft-tji-table', version: 1, manufacturer: 'M', edition: 'E', units: 'imperial', cases: [{ id: 'a' }], rows: [{ series: 'S', depth: 9, spans: { a: { 16: 10 } } }] }, 'tji.err.field'],
    ['no units', { format: 'cadcraft-tji-table', version: 1, manufacturer: 'M', edition: 'E', source: 'S', cases: [{ id: 'a' }], rows: [{ series: 'S', depth: 9, spans: { a: { 16: 10 } } }] }, 'tji.err.units'],
    ['a span that is not a number', { format: 'cadcraft-tji-table', version: 1, manufacturer: 'M', edition: 'E', source: 'S', units: 'imperial', cases: [{ id: 'a' }], rows: [{ series: 'S', depth: 9, spans: { a: { 16: 'long' } } }] }, 'tji.err.span'],
  ];
  for (const [what, obj, key] of bads) { const r = T.parseTjiTable(obj); ok(!r.ok && r.errors.some((e) => e.key === key), 'refused: ' + what + ' (' + key + ')', JSON.stringify(r.errors || r)); }
  ok(!T.parseTjiTable('{not json').ok, 'refused: text that is not JSON');

  console.log('== GH.3-E series and depth from the span');
  const tb = j.table;
  let p = T.pickTji(tb, { span: 9 * FT, spacing: 16 * IN, caseId: 'EX-40-10-L480' });
  ok(p.ok && p.series === 'EX-A' && near(p.depth, 9.5 * IN, 1e-6), '9 ft at 16 in: the shallowest that reaches it (EX-A 9.5 in)');
  p = T.pickTji(tb, { span: 12 * FT, spacing: 16 * IN, caseId: 'EX-40-10-L480' });
  ok(p.ok && p.series === 'EX-B' && near(p.depth, 11.875 * IN, 1e-6), '12 ft: the next depth (EX-B 11.875 in)');
  p = T.pickTji(tb, { span: 12 * FT, spacing: 24 * IN, caseId: 'EX-40-10-L480' });
  ok(p.ok && near(p.depth, 14 * IN, 1e-6), 'the same span at 24 in needs more depth (14 in)');
  p = T.pickTji(tb, { span: 12 * FT, spacing: 16 * IN, caseId: 'EX-30-10-L360' });
  ok(p.ok && near(p.depth, 11.875 * IN, 1e-6), 'another load case reads its own column');
  p = T.pickTji(tb, { span: 25 * FT, spacing: 16 * IN, caseId: 'EX-40-10-L480' });
  ok(!p.ok && p.key === 'tji.err.beyond' && /25\.0 ft/.test(p.fill.span) && /18\.0 ft/.test(p.fill.max), 'a span past every row is refused and the message says the span and the table\'s longest', words(p.key, p.fill));
  p = T.pickTji(tb, { span: 9 * FT, spacing: 19.2 * IN, caseId: 'EX-40-10-L480' });
  ok(!p.ok && p.key === 'tji.err.spacing' && /16 in/.test(p.fill.list), 'a spacing the table does not list is refused and the listed ones named', words(p.key, p.fill));
  p = T.pickTji(tb, { span: 9 * FT, spacing: 400, caseId: 'EX-40-10-L480' });
  ok(p.ok && p.series === 'EX-A', '400 mm uses the 16 in column (a spacing up to 2% closer than the listed one is covered)');
  p = T.pickTji(tb, { span: 9 * FT, spacing: 420, caseId: 'EX-40-10-L480' });
  ok(!p.ok && p.key === 'tji.err.spacing', '420 mm (wider than 16 in) is refused: never a wider spacing than listed');
  const lines = T.tjiStatement(tb, 'EX-40-10-L480', (k, v) => k + (v ? JSON.stringify(v) : ''));
  ok(lines[0] === 'tji.example' && lines.some((l) => l.startsWith('tji.line.loads') && /40 psf/.test(l) && /L\/480/.test(l) && /1\.75 in/.test(l)) && lines[lines.length - 1] === 'tji.statement', 'the assumptions: example warning first, live, dead, deflection, bearing, source, then the plain statement');

  console.log('== GH.3-E framing a floor with the table');
  const text = N.newBuilding({ name: 'TJI', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 't.ifc', now: new Date('2026-10-29T12:00:00Z') });
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L = OPS.snapshotModel(ed).levels;
  const P = [[0, 0], [8000, 0], [8000, 5000], [0, 5000]];
  ed.modelChange(OPS.drawWalls({ storey: L[0].guid, segs: P.map((a, i) => ({ a, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: L[1].guid }));
  ed.modelChange(OPS.placeFloor({ storey: L[0].guid, seed: [4000, 2500], mode: 'building', kind: 'wood', thickness: 12 * IN }));
  const floor = OPS.snapshotModel(ed).derived.floors[0];
  T.setActiveTji(null);
  ok(FR.tjiFor === undefined && FR.TJI_BUILTIN === undefined && FR.TJI_SPANS === undefined, 'no built-in TJI span data is exported: a maker\'s tables are not ours');
  let key0 = '';
  try { ed.modelChange(FR.frameHosts({ hosts: [floor.guid], spacing: 16 * IN, floorMode: 'tji', floorDir: 'y' })); } catch (e) { key0 = e.key; }
  ok(key0 === 'tji.err.none' && FR.readFraming(W()).length === 0, 'no table loaded: TJI is refused (tji.err.none) and nothing is framed');
  ok(/Load a TJI table: the manufacturer's tables are theirs and are not built in/.test(JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8'))['tji.err.none']), 'the refusal says plainly that the table is needed');
  // sawn lumber is untouched by all this
  ed.modelChange(FR.frameHosts({ hosts: [floor.guid], spacing: 16 * IN, floorMode: 'lumber', floorDir: 'y' }));
  let fr = FR.readFraming(W())[0];
  ok(fr && FR.lumberList(W()).rows.some((r) => /^2x/.test(r.size)), 'solid sawn joists still frame with no table loaded');
  ed.undo();
  T.setActiveTji(tb, 'EX-40-10-L480');
  ed.modelChange(FR.frameHosts({ hosts: [floor.guid], spacing: 16 * IN, floorMode: 'tji', floorDir: 'y' }));
  fr = FR.readFraming(W())[0];
  const before = FR.lumberList(W()).rows.map((r) => r.size + r.count).join(',');
  T.setActiveTji(null);
  let keyNone = '';
  try { ed.modelChange(FR.changeFraming(fr.guid, { spacing: 24 * IN })); } catch (e) { keyNone = e.key; }
  ok(keyNone === 'tji.err.none' && FR.lumberList(W()).rows.map((r) => r.size + r.count).join(',') === before, 'table gone: re-framing is refused and every placed joist stays as it was');
  T.setActiveTji(tb, 'EX-40-10-L480');
  const n0 = ed.changes.length;
  ed.modelChange(FR.changeFraming(fr.guid, { floorMode: 'tji' }));
  fr = FR.readFraming(W())[0];
  const ps = W().readPset(fr.id, FR.TJI_PSET);
  const sizes = FR.lumberList(W()).rows.map((r) => r.size);
  ok(ed.changes.length === n0 + 1 && sizes.some((s) => s.startsWith('EX-B 14')) && ps && ps.Series === 'EX-B', 'with the table: a 5 m span at 16 in picks EX-B 14 in from it (one undo step)', sizes.join(','));
  ok(ps && /EXAMPLE/.test(ps.Table) && /Preliminary layout guidance; final selection needs the manufacturer's tables and the project loads\./.test(ps.Assumptions) && /live load 40 psf, dead load 10 psf, deflection limit L\/480, bearing length 1\.75 in/.test(ps.Assumptions) && /source: Made-up/.test(ps.Assumptions) && /EXAMPLE table, not for design/.test(ps.Assumptions), 'the assumptions are written into the model (EXAMPLE warning, live, dead, deflection, bearing, source, the preliminary statement)', String(ps && ps.Assumptions));
  const keyBefore = fr.key;
  T.setActiveTji(tb, 'EX-30-10-L360');
  ed.modelChange(FR.changeFraming(fr.guid, { floorMode: 'tji' }));
  ok(FR.readFraming(W())[0].key !== keyBefore && W().readPset(fr.id, FR.TJI_PSET).LoadCase === 'EX-30-10-L360', 'another load case frames again with its own loads');
  T.setActiveTji(tb, 'EX-40-10-L480');
  let key = '';
  try { ed.modelChange(FR.changeFraming(fr.guid, { spacing: 24 * IN })); } catch (e) { key = e.key; }
  ok(key === 'tji.err.beyond', '24 in on a 5 m span is outside the table: refused with a plain message, nothing half-written');
  ok(FR.readFraming(W())[0].spacing === 16 * IN || near(FR.readFraming(W())[0].spacing, 16 * IN, 0.1), 'the framing stays as it was after the refusal');
  key = '';
  try { ed.modelChange(FR.changeFraming(fr.guid, { floorDir: 'x' })); } catch (e) { key = e.key; }
  ok(key === 'tji.err.beyond', 'joists the long way (8 m) are refused too');
  ed.undo();
  void 0;
  T.setActiveTji(null);

  console.log('== GH.3-E the regs add-on hook (additive, off unless a table is loaded)');
  const CK = await import(path.join(APP, 'addons/regs/lib/check.js'));
  const prof = { rule: (id) => (id === 'frame.joist.span.max' ? { id, op: '<=', unit: 'mm', label: 'Joist span', value: 1 } : null) };
  const fram = [{ storey: 1, spacing: 16 * IN, guid: 'g', pieces: [{ role: 'joist', size: 'EX-B 14 in', length: 15 * FT, guid: 'p' }] }];
  ok(CK.joistRows(fram, prof).length === 0, 'no table loaded: TJI joists are skipped, as before');
  const hook = { maxSpan: (size, sp) => { const h = T.tjiMaxSpan(tb, size, sp, 'EX-40-10-L480'); return h ? { span: h.span, name: tb.id } : null; } };
  const rows = CK.joistRows(fram, prof, { tji: hook });
  ok(rows.length === 1 && rows[0].ok === true && near(rows[0].req, 18 * FT, 1), 'a table loaded: the floor-joist rule reads the table (15 ft passes against 18 ft)', JSON.stringify(rows[0] && { ok: rows[0].ok, req: rows[0].req }));
  fram[0].pieces[0].length = 20 * FT;
  ok(CK.joistRows(fram, prof, { tji: hook })[0].ok === false, '20 ft fails against the same table');

  console.log('== GH.3-D a selected roof: one undo step per change, a quick series coalesces');
  const { mergeJournals } = await import(path.join(APP, 'model-ui.js')).catch(() => ({}));
  const merge = mergeJournals || ((a, b) => b);
  const roofL = L[0];
  ed.modelChange(OPS.placeRoof({ storey: roofL.guid, seed: [4000, 2500], pitch: 20, overhang: 300, edges: '' }));
  const roof0 = OPS.snapshotModel(ed).derived.roofs[0];
  const roof = () => OPS.snapshotModel(ed).derived.roofs[0];
  const key1 = 'roof:' + roof0.guid + ':pitch';
  const c0 = ed.changes.length;
  for (const pd of [25, 30, 35]) ed.modelChange(OPS.changeDerived([roof0.guid], { pitch: pd }), { label: 'roof', coalesce: { key: key1, merge } });
  ok(ed.changes.length === c0 + 1 && near(roof().pitch, 35, 1e-6), 'three pitch edits in a row: one undo step, the roof at the last pitch');
  ed.modelChange(OPS.changeDerived([roof0.guid], { overhang: 600 }), { label: 'roof', coalesce: { key: 'roof:' + roof0.guid + ':overhang', merge } });
  ok(ed.changes.length === c0 + 2, 'a different field is its own step');
  ed.modelChange(OPS.changeDerived([roof0.guid], { fascia: 0, soffit: false }), { label: 'roof', coalesce: { key: 'roof:' + roof0.guid + ':fascia,soffit', merge } });
  ok(ed.changes.length === c0 + 3 && roof().fascia === 0 && !roof().soffit, 'fascia and soffit are changes of the selected roof too');
  ed.undo();
  ok(roof().fascia > 0 && roof().soffit, 'undo: fascia and soffit back');
  ed.undo(); ed.undo();
  ok(near(roof().pitch, 20, 1e-6) && roof().overhang >= 299 && roof().overhang <= 301, 'undo twice more: the roof is back at the pitch and overhang it had (one step undid all three pitch edits)');
  ed.redo();
  ok(near(roof().pitch, 35, 1e-6), 'redo: the last pitch of the series');
  ed.undo();
  const c1 = ed.changes.length;
  ed.modelChange(OPS.changeDerived([roof0.guid], { pitch: 25 }), { label: 'roof', coalesce: { key: key1, merge, ms: 0 } });
  ed.modelChange(OPS.changeDerived([roof0.guid], { pitch: 26 }), { label: 'roof', coalesce: { key: key1, merge, ms: 0 } });
  ok(ed.changes.length === c1 + 2, 'edits further apart than the window are separate steps');
  let k2 = '';
  try { ed.modelChange(OPS.changeDerived([roof0.guid], { pitch: 85 }), { label: 'roof', coalesce: { key: key1, merge } }); } catch (e) { k2 = e.key; }
  ok(k2 === 'model.err.pitch' && ed.changes.length === c1 + 2, 'the same validation as the tool: 85 degrees is refused and nothing is recorded');
  console.log(bad ? '\n' + bad + ' FAILED' : '\ngh3: all ok');
  return bad ? 1 : 0;
}
