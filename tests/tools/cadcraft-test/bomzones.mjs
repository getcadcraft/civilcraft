#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bomzones.mjs — CadCraft's bills of materials by zone (0.9.1, suggestion #1503), Node, no page: zones and tables in the document,
 * the live hook (move, erase, attribute edit, reshape, copy, undo / redo), frozen tables, item numbers, the commands typed at the
 * command line, CSV, and every file format read back (DXF R12, DXF 2000, DWG 2000–2018) with the tables still live.
 *   node tools/cadcraft-test/bomzones.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const imp = (f) => import(pathToFileURL(APP + f).href);
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (process.argv.includes('--verbose')) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + JSON.stringify(x) : '')); } };

const I18n = await imp('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await imp('doc.js');
const { Engine, lookup } = await imp('commands.js');
const G = await imp('geom.js');
const B = await imp('bomzones-cad.js');
const C = await imp('bomzones-cmd.js');
const { readDxf, writeDxf } = await imp('dxf.js');
const { writeDxf2000 } = await imp('dxf2000.js');
const { saveDwg } = await imp('dwg-save.js');
const { importDwg } = await imp('dwg-import.js');
const { readDwg } = await imp('dwg/read.js');

// the copy in the app is the library, byte for byte
ok(fs.readFileSync(path.join(ROOT, 'lib/bomzones/bomzones.js')).equals(fs.readFileSync(APP + 'bomzones/bomzones.js')), 'cadcraft/dev/bomzones/bomzones.js is lib/bomzones/bomzones.js byte for byte (tools/bomzones/sync.mjs)');

const att = (tag, def, y) => ({ tag, prompt: '', def, x: 0, y, h: 1, rot: 0, ha: 'left', va: 'baseline', wf: 1, layer: '0', color: null });
function plant() {
  const doc = new Doc();
  doc.change('setup', () => {
    doc.defineBlock({ name: 'VALVE', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', cx: 0, cy: 0, r: 1 }], attdefs: [att('TAG', '', 0), att('SIZE', 'DN50', -2)] });
    doc.defineBlock({ name: 'PUMP', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', cx: 0, cy: 0, r: 2 }], attdefs: [att('TAG', '', 0)] });
    const ins = (block, x, y, attrs) => doc.add({ type: 'insert', layer: 'EQUIP', block, x, y, sx: 1, sy: 1, rot: 0, attrs });
    ins('VALVE', 2, 2, { TAG: 'V-1', SIZE: 'DN50' }); ins('VALVE', 4, 2, { TAG: 'V-2', SIZE: 'DN50' }); ins('PUMP', 6, 6, { TAG: 'P-1' });
    ins('VALVE', 24, 2, { TAG: 'V-3', SIZE: 'DN80' });
    doc.add({ type: 'line', layer: 'PIPE', x1: 1, y1: 8, x2: 9, y2: 8 });           // 8 long, middle (5, 8): zone A
    doc.add({ type: 'line', layer: 'PIPE', x1: 13, y1: 4, x2: 19, y2: 4 });         // 6 long, middle (16, 4): outside both zones
    doc.add({ type: 'poly', layer: 'SLAB', closed: true, pts: [{ x: 21, y: 5, b: 0 }, { x: 25, y: 5, b: 0 }, { x: 25, y: 8, b: 0 }, { x: 21, y: 8, b: 0 }] });   // 4 x 3 in zone B: perimeter 14, area 12
  });
  const za = B.addZone(doc, [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }], 'Zone A', { h: 1 });
  const zb = B.addZone(doc, [{ x: 20, y: 0 }, { x: 30, y: 0 }, { x: 30, y: 10 }, { x: 20, y: 10 }], 'Zone B', { h: 1 });
  const ta = B.addTable(doc, { zone: za, at: { x: 0, y: -5 }, h: 1 });
  const tb = B.addTable(doc, { zone: zb, at: { x: 20, y: -5 }, h: 1 });
  return { doc, za, zb, ta, tb };
}
const rowsOf = (doc, id) => B.tableView(doc, id).result.rows.map((r) => r.cells.join('|'));
const textsOf = (doc, id) => doc.blocks.get(B.TABLE_BLOCK + id).entities.filter((e) => e.type === 'text').map((e) => e.s);
const byTag = (doc, tag) => [...doc.model.values()].find((e) => e.attrs?.TAG === tag);
const zoneEnt = (doc, id) => B.bomScan(doc).zones.find((z) => z.id === id).ent;
const labelEnt = (doc, id) => B.bomScan(doc).labels.find((l) => l.zone === id).ent;

console.log('== zones and tables in the document');
{
  const { doc, za, zb, ta, tb } = plant();
  const reg = B.bomScan(doc);
  ok(reg.zones.length === 2 && reg.labels.length === 2 && reg.tables.length === 2, 'two zones, their two names and two tables are in the drawing');
  const L = doc.layers.get(B.ZONE_LAYER);
  ok(L && L.plot === false && L.linetype === 'DASHED' && zoneEnt(doc, za).layer === B.ZONE_LAYER, 'zones sit on layer BOM-ZONES: dashed and not plotted');
  const lab = labelEnt(doc, za);
  ok(lab.s === 'Zone A' && lab.x === 0 && lab.y === 10.5 && lab.layer === B.ZONE_LAYER, 'the name is a text above the zone\'s top left corner', [lab.x, lab.y]);
  ok(rowsOf(doc, ta).join(' ; ') === '1|1|PUMP|P-1| ; 2|1|VALVE|V-1|DN50 ; 3|1|VALVE|V-2|DN50', 'table A: the pump and the two valves, one row each (their tags differ)', rowsOf(doc, ta));
  ok(rowsOf(doc, tb).join() === '1|1|VALVE|V-3|DN80', 'table B: the one valve in zone B');
  ok(textsOf(doc, ta)[0] === 'Bill of materials: Zone A' && textsOf(doc, ta).includes('V-2') && textsOf(doc, ta).includes('Qty'), 'the table on the drawing is a block of plain lines and texts with its title and headings', textsOf(doc, ta).slice(0, 6));
  const blk = doc.blocks.get(B.TABLE_BLOCK + ta);
  ok(blk.entities.every((e) => e.type === 'line' || e.type === 'text') && blk.entities.some((e) => e.type === 'line'), 'nothing but lines and texts in the table\'s block');
  ok(doc.undoStack.length === 5, 'setup, two zones, two tables: five undo steps', doc.undoStack.length);

  console.log('== live');
  let steps = doc.undoStack.length;
  const v2 = byTag(doc, 'V-2');
  doc.change('MOVE', () => doc.update(v2.id, G.txEntity(v2, G.mTranslate(22, 0))));   // (4, 2) → (26, 2): out of A, into B
  ok(rowsOf(doc, ta).length === 2 && !textsOf(doc, ta).includes('V-2'), 'a valve moved out of zone A leaves table A (block redrawn)', textsOf(doc, ta));
  ok(rowsOf(doc, tb).length === 2 && textsOf(doc, tb).includes('V-2'), '… and shows up in table B');
  ok(doc.undoStack.length === steps + 1, 'the move and both table updates are ONE undo step', doc.undoStack.length - steps);
  ok(rowsOf(doc, tb).find((r) => r.includes('V-2')).startsWith('2|') && rowsOf(doc, ta).map((r) => r[0]).join() === '1,2', 'the arrival takes the next number in B (2); in A the rows that stay keep theirs (1, 2)', [rowsOf(doc, ta), rowsOf(doc, tb)]);
  doc.undo();
  ok(textsOf(doc, ta).includes('V-2') && !textsOf(doc, tb).includes('V-2') && rowsOf(doc, ta).length === 3, 'Undo puts the valve and both tables back together');
  doc.redo();
  ok(!textsOf(doc, ta).includes('V-2') && textsOf(doc, tb).includes('V-2'), 'Redo moves them again');
  doc.undo();

  doc.change('ERASE', () => doc.remove(byTag(doc, 'P-1').id));
  ok(!textsOf(doc, ta).includes('PUMP') && rowsOf(doc, ta).map((r) => r.split('|')[0]).join() === '2,3', 'erasing the pump removes its row; the valves keep items 2 and 3', rowsOf(doc, ta));
  doc.change('INSERT', () => doc.add({ type: 'insert', layer: 'EQUIP', block: 'PUMP', x: 5, y: 5, sx: 1, sy: 1, rot: 0, attrs: { TAG: 'P-9' } }));
  ok(rowsOf(doc, ta).find((r) => r.includes('P-9')).startsWith('4|'), 'a new pump takes item 4: the erased pump\'s number 1 is not handed out again', rowsOf(doc, ta));
  const v1 = byTag(doc, 'V-1');
  doc.change('EATTEDIT', () => doc.update(v1.id, { ...v1, attrs: { ...v1.attrs, SIZE: 'DN65' } }));
  ok(textsOf(doc, ta).includes('DN65'), 'editing an attribute value changes the table');
  // on the edge: x = 10 is zone A's right side
  const edge = byTag(doc, 'V-2');
  doc.change('MOVE', () => doc.update(edge.id, { ...edge, x: 10, y: 5 }));
  ok(textsOf(doc, ta).includes('V-2'), 'a block whose insertion point is exactly on the zone\'s edge counts as inside');
  doc.change('MOVE', () => doc.update(edge.id, { ...byTag(doc, 'V-2'), x: 10.001 }));
  ok(!textsOf(doc, ta).includes('V-2'), '… and a hair outside it does not');
  // reshape the zone with a grip: pull its right side out to x = 12
  const z = zoneEnt(doc, za);
  doc.change('STRETCH', () => doc.update(z.id, { ...z, pts: z.pts.map((p) => (p.x === 10 ? { ...p, x: 12 } : p)) }));
  ok(textsOf(doc, ta).includes('V-2'), 'reshaping the zone takes the block in again');
  // move the zone: its name follows
  const z2 = zoneEnt(doc, za);
  doc.change('MOVE', () => doc.update(z2.id, G.txEntity(z2, G.mTranslate(0, 3))));
  ok(labelEnt(doc, za).y === 13.5 && labelEnt(doc, za).x === 0, 'moving the zone moves its name in the same step', labelEnt(doc, za).y);
  doc.undo();
  ok(labelEnt(doc, za).y === 10.5 && zoneEnt(doc, za).pts[0].y === 0, 'Undo puts both back');
  // rename by editing the name's text
  const lab2 = labelEnt(doc, za);
  doc.change('DDEDIT', () => doc.update(lab2.id, { ...lab2, s: 'Pump room' }));
  ok(B.bomScan(doc).zones.find((x) => x.id === za).name === 'Pump room' && textsOf(doc, ta)[0] === 'Bill of materials: Pump room', 'editing the name\'s text renames the zone and the table\'s title');
  ok(B.renameZone(doc, za, 'Zone A') && labelEnt(doc, za).s === 'Zone A' && textsOf(doc, ta)[0] === 'Bill of materials: Zone A', 'renameZone renames the text and the title too');

  console.log('== columns, grouping, sorting, totals, linework');
  steps = doc.undoStack.length;
  B.setTable(doc, ta, (t) => ({ ...t, columns: t.columns.map((c) => (c.key === 'attr:SIZE' ? { ...c, on: false } : c)) }));
  ok(!textsOf(doc, ta).includes('SIZE') && !textsOf(doc, ta).includes('DN65') && doc.undoStack.length === steps + 1, 'unticking the SIZE column takes it off the drawing: one undo step');
  ok(B.tableView(doc, ta).table.columns.find((c) => c.key === 'attr:SIZE').on === false, 'the choice is stored with the table');
  B.setTable(doc, ta, (t) => ({ ...t, columns: t.columns.map((c) => (c.key === 'attr:TAG' ? { ...c, label: 'Tag no.' } : c.key === 'attr:SIZE' ? { ...c, on: true } : c)) }));
  ok(textsOf(doc, ta).includes('Tag no.') && textsOf(doc, ta).includes('SIZE'), 'a column\'s heading can be renamed; ticking SIZE again brings it back');
  B.setTable(doc, ta, (t) => { const cols = t.columns.slice(); const i = cols.findIndex((c) => c.key === 'name'); cols.unshift(cols.splice(i, 1)[0]); return { ...t, columns: cols }; });
  ok(B.tableView(doc, ta).result.columns[0].key === 'name', 'columns can be re-ordered (Name first)');
  B.setTable(doc, ta, { group: 'name', totals: true, sort: { key: 'qty', dir: -1 } });
  let v = B.tableView(doc, ta);
  ok(v.result.rows.length === 2 && v.result.rows[0].cells[v.result.columns.findIndex((c) => c.key === 'qty')] === '2' && v.result.rows[0].cells.includes('varies'), 'grouped by block name, most first: VALVE x 2 with its TAG "varies", then PUMP', v.result.rows.map((r) => r.cells));
  ok(v.result.totals.includes('Total') && v.result.totals.includes('3'), 'the totals row counts 3');
  B.setTable(doc, tb, (t) => ({ ...t, objects: true, blocks: false, columns: t.columns.map((c) => (['length', 'area', 'layer'].includes(c.key) ? { ...c, on: true } : c)) }));
  v = B.tableView(doc, tb);
  ok(v.result.rows.length === 1 && v.result.rows[0].cells.includes('SLAB (linework)') && v.result.rows[0].cells.includes('14') && v.result.rows[0].cells.includes('12'), 'table B as linework by layer: SLAB, length 14 (the 4 x 3 outline), area 12', v.result.rows.map((r) => r.cells));
  B.setTable(doc, ta, { objects: true });
  v = B.tableView(doc, ta);
  ok(v.result.rows.some((r) => r.cells.includes('PIPE (linework)')) && v.result.rows.filter((r) => r.kind === 'object').length === 1 && v.result.rows.find((r) => r.kind === 'object').qty === 1, 'zone A lists one PIPE line (middle inside); the line whose middle is outside is not counted, and zone outlines never are', v.result.rows.map((r) => r.cells));
  B.setTable(doc, ta, { objects: false, group: 'detail', sort: { key: 'item', dir: 1 }, totals: false });

  console.log('== frozen, update now, renumber, remarks, CSV');
  B.setTable(doc, ta, { frozen: true });
  const before = textsOf(doc, ta).join();
  doc.change('ERASE', () => doc.remove(byTag(doc, 'P-9').id));
  ok(textsOf(doc, ta).join() === before, 'a frozen table does not follow the drawing');
  ok(B.updateTables(doc) === 1 && !textsOf(doc, ta).includes('P-9'), 'BOMUPDATE updates it anyway (1 table changed)');
  ok(B.updateTables(doc) === 0, 'a second update changes nothing');
  B.setTable(doc, ta, { frozen: false });
  ok(B.tableView(doc, ta).result.rows.map((r) => r.item).join() !== '1,2', 'after erasures and regrouping the item numbers have gaps', B.tableView(doc, ta).result.rows.map((r) => r.item));
  ok(B.renumberTable(doc, ta) && B.tableView(doc, ta).result.rows.map((r) => r.item).join() === '1,2' && textsOf(doc, ta).includes('1'), 'Renumber items: 1 and 2');
  const hash = B.tableView(doc, ta).result.rows[0].hash;
  B.setTable(doc, ta, (t) => ({ ...t, remarks: { [hash]: 'spare on site' }, columns: t.columns.map((c) => (c.key === 'remarks' ? { ...c, on: true } : c)) }));
  ok(textsOf(doc, ta).includes('spare on site') && textsOf(doc, ta).includes('Remarks'), 'a remark typed for a row shows in the Remarks column');
  const csv = B.tableCsv(doc, ta);
  ok(csv.startsWith('Name,Item,Qty,Tag no.,SIZE,Remarks\r\n') && csv.includes('spare on site') && csv.endsWith('\r\n'), 'CSV: the shown columns under their headings', csv);

  console.log('== copies, erasing');
  const zc = zoneEnt(doc, za), lc = labelEnt(doc, za), tc = B.bomScan(doc).tables.find((x) => x.id === ta).ent;
  doc.change('COPY', () => { for (const e of [zc, lc, tc]) { const c = G.txEntity(e, G.mTranslate(0, 40)); delete c.id; doc.add(c); } });
  let reg2 = B.bomScan(doc);
  ok(reg2.zones.length === 3 && new Set(reg2.zones.map((x) => x.id)).size === 3 && reg2.zones.some((x) => x.name === 'Zone A (2)'), 'a copied zone gets its own id and the name "Zone A (2)"', reg2.zones.map((x) => [x.id, x.name]));
  ok(reg2.labels.length === 3 && reg2.labels.filter((l) => l.ent.s === 'Zone A (2)').length === 1, 'the copy has one name of its own');
  const tcopy = reg2.tables.find((x) => x.id !== ta && x.id !== tb);
  ok(reg2.tables.length === 3 && tcopy && tcopy.ent.block === B.TABLE_BLOCK + tcopy.id && doc.blocks.has(tcopy.ent.block) && tcopy.table.zone === reg2.zones.find((x) => x.name === 'Zone A (2)').id, 'a table copied with its zone gets its own block and follows the copied zone');
  ok(B.tableView(doc, tcopy.id).result.rows.length === 0 && rowsOf(doc, ta).length === 2, 'the copied zone is empty, so its table is; the original still lists two');
  doc.change('ERASE', () => doc.remove(tcopy.ent.id));
  ok(!doc.blocks.has(B.TABLE_BLOCK + tcopy.id), 'erasing a table removes its block in the same step');
  doc.undo();
  ok(doc.blocks.has(B.TABLE_BLOCK + tcopy.id) && B.bomScan(doc).tables.length === 3, 'Undo brings the table and its block back');
  const zdel = B.bomScan(doc).zones.find((x) => x.name === 'Zone A (2)');
  doc.change('ERASE', () => doc.remove(zdel.ent.id));
  reg2 = B.bomScan(doc);
  ok(reg2.labels.length === 2 && B.tableView(doc, tcopy.id).lost === true, 'erasing a zone erases its name; its table says the zone is gone and stays as it was');
  B.setTable(doc, tcopy.id, { zone: '' });
  ok(B.tableView(doc, tcopy.id).lost === false && B.tableView(doc, tcopy.id).result.rows.length >= 3 && textsOf(doc, tcopy.id)[0] === 'Bill of materials', 'given "Whole drawing" it lists every block of the model');

  console.log('== saved and read back');
  const want = { a: rowsOf(doc, ta), b: rowsOf(doc, tb), def: JSON.stringify(B.tableView(doc, ta).table) };
  const files = [['DXF R12', () => readDxf(writeDxf(doc).text)], ['DXF 2000', () => readDxf(writeDxf2000(doc).text)],
    ...['2000', '2004', '2007', '2010', '2013', '2018'].map((ver) => ['DWG ' + ver, () => importDwg(readDwg(saveDwg(doc, { version: ver }).bytes), { versionTag: 'x' })])];
  for (const [label, read] of files) {
    let d2;
    try { d2 = new Doc(); d2.load(read()); } catch (err) { ok(false, label + ': reads back', String(err && err.stack || err).slice(0, 300)); continue; }
    const r = B.bomScan(d2);
    ok(r.zones.length === 2 && r.labels.length === 2 && r.tables.length === 3, label + ': two zones, their names and three tables come back', [r.zones.length, r.labels.length, r.tables.length]);
    ok(r.tables.some((x) => x.id === ta) && JSON.stringify(B.tableView(d2, ta).table) === want.def, label + ': table A\'s settings (columns, headings, order, numbers, remarks) are the same');
    ok(rowsOf(d2, ta).join(';') === want.a.join(';') && rowsOf(d2, tb).join(';') === want.b.join(';'), label + ': both tables list the same rows', rowsOf(d2, ta));
    const blk2 = d2.blocks.get(B.TABLE_BLOCK + ta);
    ok(blk2 && blk2.entities.filter((e) => e.type === 'text').some((e) => e.s === 'spare on site') && blk2.entities.some((e) => e.type === 'line'), label + ': the table is in the file as an ordinary block of lines and texts');
    if (label !== 'DXF R12') ok(d2.layers.get(B.ZONE_LAYER)?.plot === false, label + ': layer BOM-ZONES is still not plotted');   // an R12 DXF keeps no-plot layers only when the drawing has a sheet (dxf.js: its own note says so on save)
    const mv = byTag(d2, 'V-3');
    d2.change('MOVE', () => d2.update(mv.id, { ...mv, x: 3, y: 3 }));   // zone B → zone A
    ok(rowsOf(d2, ta).length === want.a.length + 1 && d2.blocks.get(B.TABLE_BLOCK + ta).entities.some((e) => e.s === 'V-3'), label + ': still live after reopening (a valve moved into zone A appears in table A)', rowsOf(d2, ta));
  }
}

console.log('== the commands, typed');
{
  const doc = new Doc(), log = [];
  const host = { cursor: { x: 0, y: 0 }, selection: new Set(), shift: false, print: (s) => log.push(s), prompt: () => {}, setSelection: (s) => { host.selection = new Set(s); }, preview: () => {},
    pickAt: (p) => { let best = null, bd = 0.5; for (const e of doc.all()) { const d = G.distToEntity(e, p, doc.blocks); if (d < bd) { bd = d; best = e.id; } } return best; },
    pickWindow: () => [], zoomExtents: () => {}, zoomWindow: () => {}, saved: [], saveBlob: (name, data, mime) => host.saved.push({ name, data, mime }) };
  const eng = new Engine(doc, host);
  const tick = () => new Promise((r) => setTimeout(r, 0));
  const type = async (...lines) => { for (const l of lines) { eng.text(l); await tick(); await tick(); } };
  const click = async (x, y) => { eng.click({ x, y }); await tick(); await tick(); };
  ok(['BOMZONE', 'BOMTABLE', 'BOM', 'BOMEDIT', 'BOMUPDATE', 'BOMEXPORT'].every((n) => lookup(n)), 'BOMZONE, BOMTABLE (BOM), BOMEDIT, BOMUPDATE and BOMEXPORT are commands');
  doc.change('setup', () => {
    doc.defineBlock({ name: 'LAMP', base: { x: 0, y: 0 }, entities: [{ type: 'circle', layer: '0', cx: 0, cy: 0, r: 0.5 }], attdefs: [att('TYPE', 'L1', 0)] });
    for (const [x, y, ty] of [[2, 2, 'L1'], [4, 4, 'L1'], [6, 2, 'L2'], [22, 3, 'L2']]) doc.add({ type: 'insert', layer: '0', block: 'LAMP', x, y, sx: 1, sy: 1, rot: 0, attrs: { TYPE: ty } });
    doc.add({ type: 'circle', layer: '0', cx: 25, cy: 5, r: 6 });
  });
  await type('BOMZONE', '0,0', '#10,10', 'Room 1');
  let reg = B.bomScan(doc);
  ok(reg.zones.length === 1 && reg.zones[0].name === 'Room 1' && reg.zones[0].ent.pts.length === 4, 'BOMZONE with two corners makes a rectangle zone named Room 1', log.slice(-3));
  await type('BOMZONE', 'O'); await click(31, 5); await type('Room 2');
  reg = B.bomScan(doc);
  const z2 = reg.zones.find((z) => z.name === 'Room 2');
  ok(z2 && z2.ent.pts.length === 2 && z2.ent.pts[0].b === 1 && doc.all().some((e) => e.type === 'circle'), 'BOMZONE Object copies a circle\'s outline as a zone (the circle stays)', log.slice(-3));
  await type('BOMZONE', 'P', '40,0', '#50,0', '#45,8', '', 'Triangle');
  ok(B.bomScan(doc).zones.find((z) => z.name === 'Triangle')?.ent.pts.length === 3, 'BOMZONE Polygon: three corners, Enter closes');
  await type('BOMZONE', 'P', '60,0', '#61,0', '');
  ok(B.bomScan(doc).zones.length === 3 && log.some((s) => /at least three corners/.test(s)), 'two corners are refused in words');
  await type('BOMTABLE'); await click(10, 5); await type('1', '0,-3');
  reg = B.bomScan(doc);
  ok(reg.tables.length === 1 && reg.tables[0].table.zone === reg.zones.find((z) => z.name === 'Room 1').id && reg.tables[0].table.h === 1 && reg.tables[0].ent.x === 0 && reg.tables[0].ent.y === -3, 'BOMTABLE: pick the zone, text height 1, corner 0,-3', log.slice(-3));
  ok(log.some((s) => /Table placed for Room 1: 2 rows/.test(s)), 'it says what it placed (2 rows: L1 x 2 and L2 x 1)', log.slice(-2));
  const t1 = reg.tables[0].id;
  ok(B.tableView(doc, t1).result.rows.map((r) => r.cells.join('|')).join(' ; ') === '1|2|LAMP|L1 ; 2|1|LAMP|L2', 'identical blocks collapse into one row with a quantity', rowsOf(doc, t1));
  host.selection = new Set();
  await type('BOM', 'W', '1', '20,-3');
  reg = B.bomScan(doc);
  const tw = reg.tables.find((x) => x.id !== t1);
  ok(tw && tw.table.zone === '' && B.tableView(doc, tw.id).result.rows.map((r) => r.qty).join() === '2,2', 'BOM … Whole: a table of the whole drawing (L1 x 2, L2 x 2)', tw && rowsOf(doc, tw.id));
  await type('BOMZONE', 'R'); await click(0, 5); await type('Lobby');
  ok(B.bomScan(doc).zones.some((z) => z.name === 'Lobby') && log.some((s) => /Zone Room 1 is now Lobby/.test(s)), 'BOMZONE Rename');
  await type('BOMZONE', 'Z');
  ok(log.some((s) => /Lobby: 1 table/.test(s)) && log.some((s) => /Triangle: no table/.test(s)), 'BOMZONE Zones lists each zone with its tables', log.slice(-3));
  B.setTable(doc, t1, { frozen: true });
  doc.change('ERASE', () => doc.remove(doc.all().find((e) => e.type === 'insert' && e.attrs?.TYPE === 'L2' && e.x === 6).id));
  await type('BOMUPDATE');
  ok(log.some((s) => /1 table updated of 2/.test(s)), 'BOMUPDATE says how many tables changed (the frozen one; the other was live)', log.slice(-2));
  host.selection = new Set([B.bomScan(doc).tables.find((x) => x.id === t1).ent.id]);
  await type('BOMEXPORT');
  ok(host.saved.length === 1 && /Lobby\.csv$/.test(host.saved[0].name) && host.saved[0].data.startsWith('﻿Item,Qty,Name,TYPE\r\n1,2,LAMP,L1') && host.saved[0].mime === 'text/csv', 'BOMEXPORT saves the selected table as CSV', host.saved[0]);
  await type('BOMEDIT');
  ok(log.some((s) => /need the dialog/.test(s)), 'BOMEDIT without a page says the dialog is not available');
  ok(C.outlineOf({ type: 'line', x1: 0, y1: 0, x2: 1, y2: 1 }) === null && C.outlineOf({ type: 'poly', closed: false, pts: [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }] }) === null, 'an open object is not an outline');
  ok(I18n.missing().filter((k) => /^(bom|opt|count|input)\./.test(k)).length === 0, 'no text key is missing', I18n.missing());
}

console.log('== a drawing that never used it');
{
  const doc = new Doc();
  doc.change('x', () => doc.add({ type: 'line', layer: '0', x1: 0, y1: 0, x2: 1, y2: 1 }));
  ok(doc.undoStack[0].ops.length === 1 && !doc.layers.has(B.ZONE_LAYER), 'a drawing with no zones or tables is left exactly as before (no extra edits, no layer)');
  // untrusted records
  doc.change('x', () => { doc.add({ type: 'poly', closed: true, layer: '0', pts: [{ x: 0, y: 0, b: 0 }, { x: 1, y: 0, b: 0 }, { x: 1, y: 1, b: 0 }], xd: { CADCRAFT_BOM: [[1000, 'BOM1:1:{"role":"zone","id":"<bad id>"}']] } }); doc.add({ type: 'insert', block: 'NOPE', x: 0, y: 0, sx: 1, sy: 1, rot: 0, layer: '0', xd: { CADCRAFT_BOM: [[1000, 'garbage'], [1070, 3]] } }); });
  const r = B.bomScan(doc);
  ok(r.zones.length === 0 && r.tables.length === 0, 'records that do not check out (a file is untrusted) are ignored');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
