#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/tables + lib/quantities/finishes.js (0.10 BK.39, BK.149, BK.142, BK.62, BK.29; session bk-r3-schedules-10).
 *   node lib/tables/test/test.mjs
 * Expected values are worked out by hand in the comments beside each check.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const X = await import(path.join(ROOT, 'lib/tables/xlsx.js'));
const T = await import(path.join(ROOT, 'lib/tables/table.js'));
const S = await import(path.join(ROOT, 'lib/tables/signoff.js'));
const F = await import(path.join(ROOT, 'lib/quantities/finishes.js'));
let pass = 0, fail = 0;
const ok = (c, name) => { if (c) pass++; else { fail++; console.log('  FAIL ' + name); } };
const near = (a, b, tol = 1e-6) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));

// ---- unzip (stored or deflated entries) to read a workbook back
function unzip(bytes) {
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), out = {};
  let p = 0;
  while (p + 4 <= bytes.length && dv.getUint32(p, true) === 0x04034b50) {
    const method = dv.getUint16(p + 8, true), csize = dv.getUint32(p + 18, true), nlen = dv.getUint16(p + 26, true), xlen = dv.getUint16(p + 28, true);
    const name = new TextDecoder().decode(bytes.subarray(p + 30, p + 30 + nlen)), body = bytes.subarray(p + 30 + nlen + xlen, p + 30 + nlen + xlen + csize);
    out[name] = (method === 8 ? zlib.inflateRawSync(body) : Buffer.from(body)).toString('utf8');
    p += 30 + nlen + xlen + csize;
  }
  return out;
}

console.log('== xlsx: the one writer');
{
  const sheets = [{ name: 'Doors', cols: [10, 12], freeze: 1, rows: [[{ v: 'Mark', s: 'head' }, { v: 'Width', s: 'head' }], ['D1', 900], ['=SUM(A1)', { v: 1800, f: 'B2*2', s: 'money' }], [{ v: '-dash', s: 'head' }, null]] }];
  const a = await X.writeXlsx(sheets, { title: 'T', creator: 'BimCraft', created: new Date(0) });
  const b = await X.writeXlsx(sheets, { title: 'T', creator: 'BimCraft', created: new Date(0) });
  ok(a.length === b.length && a.every((v, i) => v === b[i]), 'two writes of one workbook are the same bytes (no stamp)');
  const z = unzip(a), sh = z['xl/worksheets/sheet1.xml'];
  ok(['[Content_Types].xml', '_rels/.rels', 'docProps/core.xml', 'docProps/app.xml', 'xl/workbook.xml', 'xl/_rels/workbook.xml.rels', 'xl/styles.xml', 'xl/worksheets/sheet1.xml'].every((n) => z[n]), 'the eight parts of a one-sheet workbook');
  ok(/<c r="B2"><v>900<\/v><\/c>/.test(sh), 'a number is a number');
  ok(/<c r="A3" s="10" t="inlineStr"><is><t xml:space="preserve">=SUM\(A1\)<\/t>/.test(sh), 'text that looks like a formula is inline text with quotePrefix (style 10), never a formula');
  ok(/<c r="A4" s="11" t="inlineStr">/.test(sh), 'a heading that looks like a formula: style 11');
  ok(/<c r="B3" s="5"><f>B2\*2<\/f><v>1800<\/v><\/c>/.test(sh), 'a formula only where the caller gave one, with its value');
  ok(/<calcPr /.test(z['xl/workbook.xml']), 'a workbook with a formula asks to be recalculated');
  ok(/<dc:creator>BimCraft<\/dc:creator>/.test(z['docProps/core.xml']) && /<Application>BimCraft<\/Application>/.test(z['docProps/app.xml']), 'the program is named as given');
  ok(/cellXfs count="12"/.test(z['xl/styles.xml']) && (z['xl/styles.xml'].match(/<xf /g) || []).length === 13, 'twelve cell styles, as STYLE lists');
  const c = await X.writeXlsx([{ name: 'A', rows: [['x']] }], { currency: 'R' });
  ok(/&quot;R&quot;#,##0.00/.test(unzip(c)['xl/styles.xml']) && !/<calcPr/.test(unzip(c)['xl/workbook.xml']), 'the currency of the money formats is the one given; no formula, no calcPr');
  ok(X.sheetName('a/b:c', new Set()) === 'a b c' && X.colName(27) === 'AB' && X.ref(0, 0) === 'A1', 'sheetName, colName, ref');
  for (const app of ['bimcraft', 'takeoffcraft']) for (const f of ['xlsx.js', 'table.js', 'signoff.js'])
    ok(fs.readFileSync(path.join(ROOT, 'lib/tables', f)).equals(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev/tables', f))), app + '/dev/tables/' + f + ' is the lib file, byte for byte');
  ok(!/function zip|CRC_TABLE|cellXfs/.test(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/takeoffcraft/dev/xlsx.js'), 'utf8')), 'TakeoffCraft\'s xlsx.js holds no writer of its own');
  ok(!/function zip|const CRC|cellXfs/.test(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/assets-bim-xlsx.js'), 'utf8')), 'BimCraft\'s assets-bim-xlsx.js holds no writer of its own');
}

console.log('== table: layout, grouping, totals, headings, figure ids');
const doors = {
  key: 'doors', title: 'Doors', head: ['Mark', 'Type', 'Width', 'Level'],
  cols: [{ id: 'mark', kind: 'text' }, { id: 'type', kind: 'text', role: 'type' }, { id: 'width', kind: 'length' }, { id: 'level', kind: 'text', role: 'level', order: ['Ground', 'First'] }],
  rows: [['D1', 'Single', '900', 'First'], ['D2', 'Double', '1800', 'Ground'], ['D3', 'Single', '800', 'Ground']],
  vals: [[null, null, 900, null], [null, null, 1800, null], [null, null, 800, null]],
  ids: [[11], [12], [13]], total: ['3 doors'], note: '',
};
const fmt = { length: (n) => String(Math.round(n)) };
{
  const plain = T.applyLayout(doors, {}, { fmt });
  ok(plain.lines.length === 4 && plain.lines[3].kind === 'total' && plain.lines[3].cells[0] === '3 doors' && plain.head.join() === 'Mark,Type,Width,Level', 'no layout: the table as it was, with its own total');
  const g = T.applyLayout(doors, { groupBy: 'level', totals: 'groups' }, { fmt });
  // groups in the level order Ground, First; Ground: D2 1800 + D3 800 = 2600 (2 rows); First: D1 900; total 3500 of 3
  ok(g.lines.map((l) => l.kind).join() === 'group,row,row,subtotal,group,row,subtotal,total', 'grouped by level with subtotals: group, rows, subtotal … total');
  ok(g.lines[0].label === 'Level: Ground' && g.lines[4].label === 'Level: First', 'groups follow the level order, not the alphabet');
  ok(g.head.join() === 'Mark,Type,Width' && g.colIds.join() === 'mark,type,width', 'the grouped column leaves the body');
  ok(g.lines[3].cells.join('|') === 'Subtotal (2)||2600' && g.lines[6].cells.join('|') === 'Subtotal (1)||900' && g.lines[7].cells.join('|') === 'Total (3)||3500', 'subtotals 2600 and 900, total 3500');
  ok(g.lines[3].ids.join() === '12,13' && g.lines[7].ids.join() === '12,13,11' && T.figureIds(g, 1, 2).join() === '12', 'a subtotal carries its group\'s elements, the total every element, a cell its row\'s');
  const t = T.applyLayout(doors, { groupBy: 'type', totals: 'grand', columns: ['mark', 'width'], headings: { case: 'upper', columns: { width: 'Leaf width' } }, title: '{schedule} schedule: {project}' }, { fmt, vars: { project: 'House' } });
  ok(t.title === 'Doors schedule: House' && t.head.join() === 'MARK,LEAF WIDTH', 'title pattern, upper-case headings, a renamed column');
  ok(t.lines.map((l) => l.kind).join() === 'group,row,group,row,row,total' && t.lines[0].label === 'TYPE: Double' && t.lines[5].cells.join('|') === 'Total (3)|3500', 'grouped by type (A to Z), grand total only');
  ok(T.applyLayout(doors, { totals: 'none' }, { fmt }).lines.length === 3, 'totals none: no total line');
  ok(T.applyLayout(doors, { groupBy: 'nope', columns: ['zz'] }, { fmt }).head.length === 4, 'an unknown column or group is ignored');
  const cell = T.applyLayout({ ...doors, cellIds: [[null, null, [91, 92], null], null, null] }, {}, { fmt });
  ok(T.figureIds(cell, 0, 2).join() === '91,92' && T.figureIds(cell, 0, 0).join() === '11' && T.figureIds(cell, 9, 0).length === 0, 'a figure with elements of its own gives those');
  // the office standard
  const s1 = T.withStandard({}, { group: 'level', totals: 'groups', title: '{schedule} schedule', headings: 'upper' }, doors);
  ok(s1.layout.groupBy === 'level' && s1.layout.totals === 'groups' && s1.layout.title === '{schedule} schedule' && s1.layout.headings.case === 'upper' && Object.keys(s1.from).sort().join() === 'groupBy,headings,title,totals', 'nothing stated: the office standard sets grouping, totals, title and headings');
  const s2 = T.withStandard({ groupBy: null, totals: 'grand' }, { group: 'level', totals: 'groups', headings: 'title' }, doors);
  ok(s2.layout.groupBy === null && s2.layout.totals === 'grand' && s2.layout.headings.case === 'title' && !s2.from.groupBy && !s2.from.totals && s2.from.headings, 'what a set-up states stays; the standard fills the rest');
  ok(T.withStandard({}, { group: 'room' }, doors).layout.groupBy === undefined, 'a standard grouping the table has no column for is left out');
  ok(Object.keys(T.withStandard({}, {}, doors).from).length === 0 && Object.keys(T.cleanStandard({ group: 'x', totals: 'source', headings: 7 })).length === 0, 'no standard: nothing changes; wrong values are dropped');
  ok(T.headingCase('net area (m2)', 'title') === 'Net Area (M2)' && T.headingCase('a', 'asis') === 'a', 'heading case');
  ok(JSON.stringify(T.cleanLayout({ columns: ['a', 'a', ''], groupBy: '', totals: 'x', junk: 1, headings: { case: 'upper', columns: { a: ' A ' } } })) === '{"columns":["a"],"groupBy":null,"headings":{"case":"upper","columns":{"a":"A"}}}', 'cleanLayout keeps what it knows');
  // exports
  ok(T.toTsv(g).split('\n')[0] === 'Mark\tType\tWidth' && T.toTsv(g).split('\n')[1] === 'Level: Ground\t\t' && T.toTsv({ ...g, lines: [{ kind: 'row', cells: ['a\tb', 'c\nd', ''] }] }).split('\n')[1] === 'a b\tc d\t', 'tab-separated: headings first, tabs and line breaks inside a cell become spaces');
  const csv = T.toCsv(g, (head, rows) => [head, ...rows].map((r) => r.join(',')).join('\n'));
  ok(csv.split('\n').length === 9 && csv.split('\n')[4] === 'Subtotal (2),,2600', 'CSV through the host\'s writer: 1 heading + 8 lines');
  const sh = T.toSheet(g, { convert: { length: (mm) => mm / 1000 } });
  ok(sh.rows.length === 9 && sh.rows[0][0].s === 'head' && sh.rows[1][0].s === 'bold' && sh.rows[2][2].v === 1.8 && sh.rows[2][2].s === 'qty' && sh.rows[4][2].v === 2.6 && sh.rows[4][2].s === 'bold' && sh.rows[2][0] === 'D2' && sh.freeze === 1, 'the sheet: headings, bold group rows, lengths as numbers in the shown unit (1.8), bold sums');
  ok(T.toSheet(g).rows[2][2] === '1800', 'no converter: the cell\'s text');
  const es = T.elementsSheet(g, { nameOf: (id) => 'G' + id });
  ok(es.rows.length === 9 && es.rows[1].join('|') === '2|Level: Ground|G12 G13' && es.rows[2].join('|') === '3|D2|G12', 'the Elements sheet names the elements behind each line');
}

console.log('== signoff');
{
  const lines = [{ key: 'i1', qty: 10, unit: 'SF', mat: 2.5, lab: 1, total: 3500 }, { key: 'i2', qty: 4, unit: 'EA', mat: 0, lab: 0, total: 0 }];
  const r = S.makeSignoff({ by: '  Duncan  Philips ', role: 'Architect', at: '2026-11-11T10:00:00Z', total: 3500, currency: '$', lines, missing: 1 });
  ok(r.ok && r.signoff.by === 'Duncan Philips' && r.signoff.total === 3500 && r.signoff.lines === 2 && r.signoff.missing === 1 && /^[0-9a-f]{16}$/.test(r.signoff.print) && r.signoff.at === '2026-11-11T10:00:00.000Z', 'a sign-off records who, when, what total, how many lines and how many had no rate');
  ok(S.holds(r.signoff, lines, 3500), 'it holds while the figures are the ones signed');
  ok(!S.holds(r.signoff, [{ ...lines[0], mat: 2.6 }, lines[1]], 3500) && !S.holds(r.signoff, lines, 3501) && !S.holds(r.signoff, lines.slice(0, 1), 3500) && !S.holds(r.signoff, [lines[1], lines[0]], 3500), 'a changed rate, total, a removed line or a changed order: it no longer holds');
  ok(S.holds(r.signoff, lines.map((l) => ({ ...l, name: 'renamed' })), 3500), 'a line\'s name is not a figure');
  ok(!S.makeSignoff({ by: ' ', at: '2026-11-11T10:00:00Z', total: 1 }).ok && S.makeSignoff({ by: 'A', at: 'x', total: 1 }).error === 'when' && S.makeSignoff({ by: 'A', at: '2026-11-11', total: NaN }).error === 'total', 'no name, no time or no total: refused');
  const back = S.cleanSignoff(JSON.parse(JSON.stringify(r.signoff)));
  ok(back && back.print === r.signoff.print && S.holds(back, lines, 3500), 'read back from a file it is the same record');
  ok(S.cleanSignoff({ ...r.signoff, print: 'zz' }) === null && S.cleanSignoff({ ...r.signoff, format: 'x' }) === null && S.cleanSignoff(null) === null && S.cleanSignoff({ ...r.signoff, by: '' }) === null, 'a wrong record is no sign-off');
  ok(S.fingerprint(lines, 3500) === S.fingerprint(JSON.parse(JSON.stringify(lines)), 3500) && S.fingerprint([], 0) !== S.fingerprint([], 1), 'the print is repeatable');
}

console.log('== finishes: tiles with cuts, substrate, rooms, walls, zones');
{
  const sq = (w, h) => [[0, 0], [w, 0], [w, h], [0, h]];
  // 1000 x 1000 with 300 x 300 tiles, no joint: 4 columns x 4 rows; 3 x 3 = 9 whole, 16 - 9 = 7 cut
  let c = F.tileCount({ outer: sq(1000, 1000), tile: { length: 300, width: 300, joint: 0 } });
  ok(c.whole === 9 && c.cut === 7 && !c.estimated, '1000 x 1000 in 300 tiles: 9 whole, 7 cut');
  // 1200 x 900 with 300 x 300: exactly 4 x 3 = 12 whole, none cut
  c = F.tileCount({ outer: sq(1200, 900), tile: { length: 300, width: 300, joint: 0 } });
  ok(c.whole === 12 && c.cut === 0, '1200 x 900 in 300 tiles: 12 whole, none cut');
  // joint 5: pitch 305. 1000 wide: tiles at 0, 305, 610 whole (610 + 300 = 910 <= 1000), 915 cut (85 left): 3 whole + 1 cut per row, 4 rows the same way
  c = F.tileCount({ outer: sq(1000, 1000), tile: { length: 300, width: 300, joint: 5 } });
  ok(c.whole === 9 && c.cut === 7, 'a 5 joint: still 9 whole and 7 cut on 1000 x 1000');
  // 1220 x 1220, joint 5: 4 whole across (915 + 300 = 1215 <= 1220), the 5 left is joint only: 16 whole, no cut
  c = F.tileCount({ outer: sq(1220, 1220), tile: { length: 300, width: 300, joint: 5 } });
  ok(c.whole === 16 && c.cut === 0, 'the strip left over is a joint, not a tile');
  // a hole 300 x 300 exactly on tile (1,1) of the 1200 x 900 grid: 11 whole; a hole 150..450 square touches 4 tiles: 8 whole, 4 cut
  c = F.tileCount({ outer: sq(1200, 900), holes: [[[300, 300], [600, 300], [600, 600], [300, 600]]], tile: { length: 300, width: 300, joint: 0 } });
  ok(c.whole === 11 && c.cut === 0, 'an opening exactly one tile: 11 whole');
  c = F.tileCount({ outer: sq(1200, 900), holes: [[[150, 150], [450, 150], [450, 450], [150, 450]]], tile: { length: 300, width: 300, joint: 0 } });
  ok(c.whole === 8 && c.cut === 4, 'an opening across four tiles: 8 whole, 4 cut');
  // an L: 900 x 900 less the 300 x 300 top-right corner... cut at 600: tiles (2,2) gone: 8 whole
  c = F.tileCount({ outer: [[0, 0], [900, 0], [900, 600], [600, 600], [600, 900], [0, 900]], tile: { length: 300, width: 300, joint: 0 } });
  ok(c.whole === 8 && c.cut === 0, 'an L-shaped floor: 8 whole');
  // a right triangle 900 x 900: cells with x+y <= 600 whole: (0,0),(0,1),(1,0) = 3; cells crossed by the diagonal: those with ix+iy = 2 → 3 cut; ix+iy>=3 outside (touch only)
  c = F.tileCount({ outer: [[0, 0], [900, 0], [0, 900]], tile: { length: 300, width: 300, joint: 0 } });
  ok(c.whole === 3 && c.cut === 3, 'a triangle: 3 whole, 3 cut along the slope');
  ok(F.tilesToOrder({ whole: 9, cut: 7 }, 10) === 18 && F.tilesToOrder({ whole: 12, cut: 0 }, 0) === 12 && F.tilesToOrder({ whole: 10, cut: 0 }, 10) === 11, 'to order: 16 + 10 % = 17.6 → 18; 12; 10 + 10 % = 11');
  ok(F.tileCount({ outer: sq(1e6, 1e6), tile: { length: 100, width: 100, joint: 0 } }).estimated, 'a surface of over 250 000 tiles is counted from its area and says so');

  const doc0 = {
    format: 'cadcraft-finishes', version: 1,
    finishes: [
      { id: 'tile', name: 'Porcelain 300', kind: 'tile', thickness: 10, tile: { length: 300, width: 300, joint: 0, waste: 10 }, substrate: { name: 'Screed', thickness: 40 } },
      { id: 'paint', name: 'Emulsion', kind: 'coat', thickness: 0 },
      { id: 'wtile', name: 'Wall tile 200', kind: 'tile', thickness: 8, tile: { length: 200, width: 200, joint: 0, waste: 0 }, substrate: { name: 'Backing board', thickness: 12 } },
      { id: 'bad', name: '', kind: 'tile' }, { id: 'tile', name: 'again', kind: 'coat' },
    ],
    rooms: { R1: { floor: 'tile', walls: 'paint', ceiling: 'paint', skirting: { name: 'Timber 100', height: 100 } }, R2: { floor: 'nope' } },
    zones: [{ id: 'z1', name: 'Splashback', room: 'R1', surface: 'wall', finish: 'wtile', from: 0, to: 1200, walls: ['W1'] }, { id: 'z2', name: 'x', room: 'R1', surface: 'wall', finish: 'wtile', from: 5, to: 2 }],
  };
  const { doc, errors } = F.cleanFinishes(doc0);
  ok(doc.finishes.length === 3 && Object.keys(doc.rooms).join() === 'R1' && doc.zones.length === 1 && errors.map((e) => e.code).join() === 'finish_name,finish_id,room_finish,zone_band', 'cleanFinishes keeps the good entries and names the four wrong ones');
  // room R1: 3000 x 2000 floor, height 2400; edges W1 3000 (a window 1000 x 1000 at offset 1000, sill 900), W2 2000 (a door 900 x 2100 at offset 500), W3 3000, W4 2000
  const room = { key: 'R1', height: 2400, floor: { outer: sq(3000, 2000), holes: [] }, ceiling: { outer: sq(3000, 2000), holes: [] }, edges: [
    { wall: 'W1', length: 3000, openings: [{ id: 'win', offset: 1000, width: 1000, sill: 900, height: 1000 }] },
    { wall: 'W2', length: 2000, openings: [{ id: 'door', offset: 500, width: 900, sill: 0, height: 2100, door: true }] },
    { wall: 'W3', length: 3000, openings: [] }, { wall: 'W4', length: 2000, openings: [] }] };
  const R = F.roomFinishes(doc, [room]);
  const row = (surface, wall, zone = null) => R.rows.find((r) => r.surface === surface && r.wall === wall && r.zone === zone);
  // floor: 6 m2; tiles 10 x 7 columns/rows? 3000/300 = 10, 2000/300 = 6.67 → 7 rows: 10 x 6 = 60 whole, 10 cut; order (70) x 1.1 = 77; screed 6e6 x 40 = 2.4e8 mm3
  const fl = row('floor', null);
  ok(fl.net === 6e6 && fl.tiles.whole === 60 && fl.tiles.cut === 10 && fl.tiles.order === 77 && fl.substrate.volume === 2.4e8 && fl.volume === 6e7, 'floor: 6 m2, 60 whole + 10 cut tiles, 77 to order, 0.24 m3 of screed, 0.06 m3 of tile');
  ok(row('ceiling', null).net === 6e6 && row('ceiling', null).tiles === null, 'ceiling: 6 m2 of paint, no tiles');
  // W1: splashback band 0..1200: gross 3.6 m2; the window's part inside the band is 900..1200 = 1000 x 300 = 0.3 m2: net 3.3 m2
  //   tiles 200: 15 x 6 = 90 cells; window part covers x 1000..2000 (5 tiles), y 900..1200: row 4 (800..1000) half cut, row 5 (1000..1200) gone: 5 cut, 5 gone → 80 whole, 5 cut
  const sp = row('wall', 'W1', 'z1');
  ok(near(sp.gross, 3.6e6) && near(sp.deductions, 3e5) && near(sp.net, 3.3e6) && sp.tiles.whole === 80 && sp.tiles.cut === 5 && sp.tiles.order === 85 && near(sp.substrate.volume, 3.3e6 * 12) && sp.openings.join() === 'win', 'the splashback zone on W1: 3.6 gross, 0.3 window, 3.3 net; 80 whole + 5 cut tiles; backing board 0.0396 m3');
  // W1 paint above the band 1200..2400: gross 3.6; window part 1200..1900 = 0.7 m2: net 2.9
  const p1 = row('wall', 'W1');
  ok(p1.from === 1200 && p1.to === 2400 && near(p1.gross, 3.6e6) && near(p1.deductions, 7e5) && near(p1.net, 2.9e6), 'paint on W1 covers what the zone leaves: 3.6 gross, 0.7 window, 2.9 net');
  // W2 paint: 2000 x 2400 = 4.8, door 0.9 x 2.1 = 1.89: net 2.91; W3 7.2; W4 4.8
  ok(near(row('wall', 'W2').net, 2.91e6) && row('wall', 'W2').openings.join() === 'door' && near(row('wall', 'W3').net, 7.2e6) && near(row('wall', 'W4').net, 4.8e6), 'W2 2.91 (door out), W3 7.2, W4 4.8');
  // skirting: 10 000 less the 900 door = 9100
  ok(row('skirting', null).net === 9100 && row('skirting', null).deductions === 900 && row('skirting', null).name === 'Timber 100', 'skirting 10 m of wall less the 0.9 door: 9.1 m');
  // totals: paint = ceiling 6 + 2.9 + 2.91 + 7.2 + 4.8 = 23.81; wall tile 3.3; porcelain 6
  const tot = Object.fromEntries(R.totals.map((t) => [t.finish, t]));
  ok(near(tot.paint.net, 23.81e6) && near(tot.wtile.net, 3.3e6) && tot.wtile.tiles.order === 85 && tot.tile.tiles.order === 77 && tot.tile.substrate.name === 'Screed' && tot.paint.tiles === null && tot.paint.rows === 5, 'totals by finish: paint 23.81 m2 over 5 surfaces, wall tile 3.3, porcelain 6');
  ok(R.rows.every((r) => near(r.gross - r.deductions, r.net)), 'gross less deductions is the net on every row');
  // a method that does not deduct openings up to 0.5 m2: the 0.3 m2 window part stays in the splashback, and is tiled over
  const R2 = F.roomFinishes(doc, [room], { rules: { 'finish.wall': { minArea: 5e5, inclusive: true } } });
  const sp2 = R2.rows.find((r) => r.zone === 'z1');
  ok(near(sp2.net, 3.6e6) && sp2.deductions === 0 && sp2.tiles.whole === 90 && sp2.tiles.cut === 0, 'under a method with a 0.5 m2 minimum the 0.3 m2 window part is not deducted: 3.6 net, 90 tiles');
  // a floor zone of 2 m2 in the 6 m2 room: zone 2, the rest 4; both counted from the area and marked estimated: 2e6/9e4 = 22.2 → 23; 4e6/9e4 = 44.4 → 45
  const d3 = F.cleanFinishes({ ...doc0, zones: [{ id: 'fz', name: 'Shower', room: 'R1', surface: 'floor', finish: 'wtile', area: 2e6 }] }).doc;
  const R3 = F.roomFinishes(d3, [room]);
  const z = R3.rows.find((r) => r.zone === 'fz'), rest = R3.rows.find((r) => r.surface === 'floor' && !r.zone);
  ok(z.net === 2e6 && z.tiles.estimated && z.tiles.cut === 50 && rest.net === 4e6 && rest.deductions === 2e6 && rest.tiles.estimated && rest.tiles.cut === 45, 'a typed floor zone of 2 m2 leaves 4 m2 for the room\'s finish; both tile counts are from the area and say so (50 of 200, 45 of 300)');
  ok(F.roomFinishes(F.emptyFinishes(), [room]).rows.length === 0, 'no finishes set: no rows');
  for (const app of ['bimcraft', 'takeoffcraft']) ok(fs.readFileSync(path.join(ROOT, 'lib/quantities/finishes.js')).equals(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev/quantities/finishes.js'))), app + '/dev/quantities/finishes.js is the lib file');
}

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
