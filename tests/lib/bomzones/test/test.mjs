#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs — lib/bomzones known-answer tests (0.9.1). Every expected value is worked out in the comment beside it.
 *   node lib/bomzones/test/test.mjs
 */
import { pointInZone, collect, zoneBounds, defaultTable, cleanTable, attrTags, syncColumns, groupRows, numberRows, renumber, sortRows, buildTable, diffTables, layoutTable, toCsv, pack, unpack, packTable, hashKey, VARIES, LIMITS } from '../bomzones.js';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };

console.log('== zones');
const sq = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }];
ok(pointInZone({ x: 5, y: 5 }, sq) && !pointInZone({ x: 11, y: 5 }, sq) && !pointInZone({ x: 5, y: -0.001 }, sq), 'a point inside a 10 x 10 square is in, one outside is out');
ok(pointInZone({ x: 10, y: 5 }, sq) && pointInZone({ x: 0, y: 0 }, sq) && pointInZone({ x: 3, y: 10 }, sq), 'a point on an edge or a corner counts as inside');
// an L: the 10 x 10 square without its top right 5 x 5 quarter
const ell = [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 5 }, { x: 5, y: 5 }, { x: 5, y: 10 }, { x: 0, y: 10 }];
ok(pointInZone({ x: 2, y: 8 }, ell) && pointInZone({ x: 8, y: 2 }, ell) && !pointInZone({ x: 8, y: 8 }, ell), 'an L-shaped zone: the cut-out quarter is outside');
ok(pointInZone({ x: 1e9, y: -4 }, null) && !pointInZone({ x: 1, y: 1 }, [{ x: 0, y: 0 }, { x: 2, y: 2 }]), 'no zone = the whole drawing; fewer than three corners holds nothing');
const b = zoneBounds(ell);
ok(b.minX === 0 && b.maxX === 10 && b.minY === 0 && b.maxY === 10, 'bounds of the L are 0..10 both ways');

const blk = (id, name, x, y, attrs = {}, layer = 'EQUIP') => ({ id, kind: 'block', name, layer, x, y, attrs, length: null, area: null });
const obj = (id, layer, x, y, length, area = null) => ({ id, kind: 'object', name: '', layer, x, y, attrs: {}, length, area });
const items = [
  blk(1, 'VALVE', 1, 1, { TAG: 'V-1', SIZE: 'DN50' }), blk(2, 'VALVE', 2, 2, { TAG: 'V-2', SIZE: 'DN50' }), blk(3, 'VALVE', 20, 1, { TAG: 'V-3', SIZE: 'DN80' }),
  blk(4, 'PUMP', 3, 3, { TAG: 'P-1' }), blk(5, 'PUMP', 21, 2, { TAG: 'P-2' }),
  obj(6, 'PIPE', 5, 5, 12.5), obj(7, 'PIPE', 6, 6, 7.5), obj(8, 'SLAB', 4, 4, 40, 100), obj(9, 'PIPE', 25, 5, 3),
];
const inA = collect(items, sq);
ok(inA.map((i) => i.id).join() === '1,2,4,6,7,8', 'collect: the square holds items 1, 2, 4, 6, 7, 8', inA.map((i) => i.id));
ok(collect(items, null).length === 9, 'collect with no zone: all nine');

console.log('== the table record');
let t = defaultTable({ id: 'tA', zone: 'z1' });
ok(t.columns.filter((c) => c.on).map((c) => c.key).join() === 'item,qty,name' && t.group === 'detail' && t.next === 1, 'a new table shows item, quantity and name, grouped by name and attribute values');
ok(cleanTable(null) === null && cleanTable({ id: 'bad id!' }) === null && cleanTable([]) === null, 'cleanTable refuses what is not a record or has a bad id');
const dirty = cleanTable({ id: 'x', zone: '<script>', group: 'nonsense', sort: { key: 'rm -rf', dir: 7 }, h: -3, columns: [{ key: 'qty' }, { key: 'qty' }, { key: 'evil' }, { key: 'attr:SIZE', label: 'Size' }], nums: { a1: 4, 'B!': 2, c: -1, d: 2.5 }, next: 2, remarks: { a1: 'spare', zz: '   ' } });
ok(dirty.zone === '' && dirty.group === 'detail' && dirty.sort.key === 'item' && dirty.sort.dir === 1 && dirty.h === 2.5, 'bad zone, group, sort and height fall back to the defaults');
ok(dirty.columns.map((c) => c.key).join() === 'qty,attr:SIZE,item,name,layer,length,area,remarks' && dirty.columns[1].label === 'Size', 'duplicate and unknown columns go; the built-in ones are always offered', dirty.columns.map((c) => c.key));
ok(JSON.stringify(dirty.nums) === '{"a1":4}' && dirty.next === 5 && JSON.stringify(dirty.remarks) === '{"a1":"spare"}', 'only whole positive numbers are kept; next is above the highest (4 → 5)', [dirty.nums, dirty.next]);
ok(attrTags(items).join() === 'TAG,SIZE', 'attribute tags in first-seen order: TAG, SIZE');
t = syncColumns(t, inA);
ok(t.columns.map((c) => c.key).join() === 'item,qty,name,layer,length,area,attr:TAG,attr:SIZE,remarks' && t.columns.find((c) => c.key === 'attr:TAG').on, 'syncColumns adds a shown column per attribute, before the remarks', t.columns.map((c) => c.key));
ok(syncColumns(t, inA) === t, 'syncColumns with nothing new returns the same record');
const many = syncColumns(defaultTable({ id: 'm' }), [blk(1, 'X', 0, 0, Object.fromEntries(Array.from({ length: 9 }, (_, i) => ['A' + i, i])))]);
ok(many.columns.filter((c) => c.key.startsWith('attr:') && c.on).length === 6 && many.columns.filter((c) => c.key.startsWith('attr:')).length === 9, 'nine attributes: the first six shown, the other three offered unticked');

console.log('== rows, numbers, sorting');
let rows = groupRows(inA, t);
ok(rows.length === 3 && rows.every((r) => r.qty === 1), 'grouped by name and values: V-1, V-2 and P-1 are three rows of one (their TAG differs)', rows.map((r) => [r.name, r.qty]));
const byName = { ...t, group: 'name' };
rows = groupRows(inA, byName);
const valve = rows.find((r) => r.name === 'VALVE'), pump = rows.find((r) => r.name === 'PUMP');
ok(rows.length === 2 && valve.qty === 2 && pump.qty === 1, 'grouped by name: VALVE x 2, PUMP x 1');
ok(valve.attrs.TAG === VARIES && valve.attrs.SIZE === 'DN50' && valve.ids.join() === '1,2', 'in a merged row a value that differs reads "varies", one that is the same stays (SIZE DN50)');
rows = groupRows(collect(items, null), { ...t, group: 'attr:SIZE' });
ok(rows.length === 3 && rows.map((r) => r.qty).sort().join() === '1,2,2', 'grouped by the SIZE attribute over the whole drawing: DN50 x 2, DN80 x 1, no size x 2 (the pumps)', rows.map((r) => [r.attrs.SIZE, r.qty]));
const withObj = { ...byName, objects: true };
rows = groupRows(inA, withObj);
const pipe = rows.find((r) => r.kind === 'object' && r.layer === 'PIPE'), slab = rows.find((r) => r.layer === 'SLAB');
ok(rows.length === 4 && pipe.qty === 2 && pipe.length === 20 && pipe.area === null && slab.length === 40 && slab.area === 100, 'plain objects by layer: PIPE 2 objects, 12.5 + 7.5 = 20 long, no area; SLAB 40 long, area 100');
ok(groupRows(inA, { ...withObj, blocks: false }).length === 2, 'blocks switched off: only the two layer rows');
let n = numberRows(rows, withObj);
ok(Object.values(n.nums).sort().join() === '1,2,3,4' && n.next === 5, 'four rows numbered 1 to 4, next is 5');
// the pump leaves the zone and a new block arrives: numbers of the rows that stay do not move, the new row takes 5
const t2 = { ...withObj, nums: n.nums, next: n.next };
const valveNo = n.nums[valve.hash], pumpNo = n.nums[pump.hash];
const later = [...inA.filter((i) => i.name !== 'PUMP'), blk(10, 'TANK', 5, 5, {})];
rows = groupRows(later, t2);
const n2 = numberRows(rows, t2);
ok(n2.nums[valve.hash] === valveNo && n2.nums[hashKey('N\u0001TANK')] === 5 && n2.next === 6 && !(pump.hash in n2.nums), 'the valve keeps its number, the new tank takes 5, the pump\'s number is dropped and not reused', n2);
rows = groupRows(inA, { ...t2, nums: n2.nums, next: n2.next });
const n3 = numberRows(rows, { ...t2, nums: n2.nums, next: n2.next });
ok(n3.nums[pump.hash] === 6 && n3.nums[pump.hash] !== pumpNo, 'the pump comes back: it takes the next free number (6), never an old one');
const rn = renumber(rows, { ...t2, sort: { key: 'name', dir: 1 } });
ok(Object.values(rn.nums).sort().join() === '1,2,3,4' && rn.next === 5 && rn.nums[pump.hash] < rn.nums[valve.hash], 'renumber: 1 to 4 in the table\'s order (by name: PUMP before VALVE)', rn.nums);
const sorted = sortRows(rows.map((r) => ({ ...r })), { ...t2, sort: { key: 'qty', dir: -1 } });
ok(sorted[0].qty === 2 && sorted[sorted.length - 1].qty === 1, 'sorted by quantity, most first');

console.log('== the built table');
const tb = { ...syncColumns(defaultTable({ id: 'tA', group: 'name', objects: true, totals: true, title: 'Zone A' }), inA) };
tb.columns = tb.columns.map((c) => (['length', 'area', 'layer'].includes(c.key) ? { ...c, on: true } : c.key === 'attr:SIZE' ? { ...c, label: 'Size' } : c));
const res = buildTable(tb, inA, { labels: { objects: '{layer} (linework)' } });
ok(res.title === 'Zone A' && res.columns.map((c) => c.label).join() === 'Item,Qty,Name,Layer,Length,Area,TAG,Size', 'title and headers (SIZE renamed to Size)', res.columns.map((c) => c.label));
const vr = res.rows.find((r) => r.cells[2] === 'VALVE'), pr = res.rows.find((r) => r.cells[2] === 'PIPE (linework)');
ok(vr && vr.cells.join('|') === vr.item + '|2|VALVE|EQUIP|||varies|DN50', 'the valve row: qty 2, layer EQUIP, TAG varies, Size DN50', vr && vr.cells);
ok(pr && pr.cells[1] === '2' && pr.cells[4] === '20' && pr.cells[5] === '', 'the pipe row: 2 objects, length 20, no area', pr && pr.cells);
ok(res.totals.join('|') === '|6|Total||60|100||', 'totals: valves 2 + pump 1 + pipes 2 + slab 1 = 6 items; lengths 20 + 40 = 60; area 100', res.totals);
ok(res.rows.map((r) => r.item).join() === [...res.rows.map((r) => r.item)].sort((a, c) => a - c).join(), 'rows come in item-number order by default');
const off = { ...tb, columns: tb.columns.map((c) => (c.key === 'attr:TAG' ? { ...c, on: false } : c)), nums: res.nums, next: res.next };
const res2 = buildTable(off, inA);
ok(res2.columns.length === res.columns.length - 1 && !res2.columns.some((c) => c.label === 'TAG') && res2.rows.every((r, i) => r.item === res.rows[i].item), 'unticking a column removes it and leaves the item numbers alone');
ok(buildTable({ ...tb, showTitle: false }, inA).title === '' && buildTable({ ...tb, title: '' }, inA, { labels: { title: 'BOM' } }).title === 'BOM', 'title off = none; no own title = the host\'s default');
const d = diffTables(res, buildTable({ ...off, columns: tb.columns }, later));
ok(d.added.length === 1 && d.removed.length === 1 && !d.same && diffTables(res, buildTable({ ...tb, nums: res.nums, next: res.next }, inA, { labels: { objects: '{layer} (linework)' } })).same, 'diff: the tank row added, the pump row removed; the same input twice = same');

console.log('== drawing and CSV');
const lay = layoutTable(res, { h: 2 });
// rows: title + header + 4 body + totals = 7 rows of 2h = 4 → height 28
ok(lay.height === 28 && lay.width > 0, 'seven rows (title, header, four items, totals) of twice the text height: 28 high', lay.height);
ok(lay.lines.filter((l) => l.y1 === l.y2).length === 8 && lay.lines.filter((l) => l.x1 === l.x2).length === 9, '8 horizontal lines (7 rows) and 9 vertical ones (8 columns)');
ok(lay.lines.filter((l) => l.x1 === l.x2 && l.y1 === 0).length === 2, 'only the two outer verticals run through the title row');
ok(lay.texts[0].s === 'Zone A' && lay.texts[0].align === 'center' && lay.texts.every((x) => x.h === 2 && x.y < 0 && x.x >= 0 && x.x <= lay.width), 'the title is centred; every text sits inside the table');
ok(lay.texts.find((x) => x.s === 'VALVE').align === 'left' && lay.texts.find((x) => x.s === 'Qty').align === 'right', 'words are left-aligned, numbers right-aligned');
const wide = layoutTable(res, { h: 2, measure: (s, h) => s.length * h });
ok(wide.width > lay.width, 'the host\'s own text measure sets the column widths');
ok(layoutTable({ title: '', columns: [], rows: [], totals: null }, {}).height === 0, 'a table with no columns draws nothing');
const csv = toCsv(buildTable({ ...defaultTable({ id: 'c', group: 'name' }), remarks: {} }, [blk(1, '=SUM(A1)', 0, 0), blk(2, 'a,"b"', 0, 0)]));
ok(csv === 'Item,Qty,Name\r\n1,1,\'=SUM(A1)\r\n2,1,"a,""b"""\r\n', 'CSV: CRLF, quotes doubled, a cell starting with = gets a leading quote mark', csv);

console.log('== the record in a file');
const rec = { ...tb, title: 'Zona A — válvulas', nums: res.nums, next: res.next, remarks: { [vr.hash]: 'spare ×2' } };
const strs = pack(rec);
ok(strs.every((s) => s.length <= LIMITS.chunk + 12 && /^[\x20-\x7e]*$/.test(s)), 'packed strings are plain ASCII and at most ' + (LIMITS.chunk + 12) + ' characters');
ok(JSON.stringify(cleanTable(unpack(strs.slice().reverse()))) === JSON.stringify(cleanTable(rec)), 'unpack(pack(x)) gives x back, in any order of the strings');
ok(unpack(['nonsense']) === null && unpack(['BOM1:1:{not json']) === null && unpack([]) === null, 'unpack refuses what is not a record');
const big = { ...rec, remarks: Object.fromEntries(Array.from({ length: 300 }, (_, i) => ['k' + i.toString(36), 'x'.repeat(60)])) };
ok(pack(big) === null && Array.isArray(packTable(big)) && Object.keys(unpack(packTable(big)).remarks).length === 0 && Object.keys(unpack(packTable(big)).nums).length === 4, 'a record too big for the file drops its remarks first and keeps its numbers');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
