#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * lib/issuelog (0.10 BK.46, BK.48; session bk-r3-stages-10).   node lib/issuelog/test/test.mjs
 * Expected values are worked out by hand in the comments beside each check.
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const I = await import(path.join(ROOT, 'lib/issuelog/history.js'));
let pass = 0, fail = 0;
const ok = (c, name) => { if (c) pass++; else { fail++; console.log('  FAIL ' + name); } };
const eq = (a, b, name) => ok(JSON.stringify(a) === JSON.stringify(b), name + ' (got ' + JSON.stringify(a) + ')');

// ---- revisions: letters skip I and O; Z is followed by AA; numbered revisions count up
eq(I.nextRev(''), 'A', 'first revision is A');
eq(I.nextRev('H'), 'J', 'H → J (I is skipped)');
eq(I.nextRev('N'), 'P', 'N → P (O is skipped)');
eq(I.nextRev('Z'), 'AA', 'Z → AA');
eq(I.nextRev('AZ'), 'BA', 'AZ → BA');
eq(I.nextRev('P1'), 'P2', 'P1 → P2');
eq(I.nextRev('P09'), 'P10', 'P09 → P10');
eq(I.nextRev('03'), '04', '03 → 04');
eq(I.nextRev('?'), 'A', 'an unknown revision starts again at A');

// ---- prints: FNV-1a 32 of "a" is 0xe40c292c = 3826002220 → base 36 "1r9wqgs"
eq(I.textPrint('a'), (0xe40c292c).toString(36), 'FNV-1a of "a"');
eq(I.textPrint(''), (0x811c9dc5).toString(36), 'FNV-1a of nothing is the offset');
ok(I.sheetPrint({ a: 1, b: [2, 3] }, ['x', 'y']) === I.sheetPrint({ b: [2, 3], a: 1 }, ['y', 'x']), 'a sheet print does not depend on key or part order');
ok(I.sheetPrint({ a: 1 }, ['x']) !== I.sheetPrint({ a: 2 }, ['x']), 'a changed sheet has another print');
ok(I.elementPrint({ n: 'W' }, [1.0000001, 2]).g === I.elementPrint({ n: 'W' }, [1.0000002, 2]).g, 'a shape differing in the 8th place prints the same');
ok(I.elementPrint({ n: 'W' }, [1.001, 2]).g !== I.elementPrint({ n: 'W' }, [1.002, 2]).g, 'a shape differing in the 4th place prints differently');

// ---- a job: three sheets, two issues
const sheet = (id, number, title, hash, scope) => ({ id, number, title, hash, scope });
const plan1 = { all: false, storeys: ['L1'], classes: [] }, plan2 = { all: false, storeys: ['L2'], classes: [] }, doors = { all: false, storeys: [], classes: ['IfcDoor'] }, elev = { all: true, storeys: [], classes: [] };
let h = I.emptyHistory();
eq(I.nextCode(h), 'A', 'the first issue is coded A');
const s1 = [sheet('sheet-1', 'A-101', 'Level 1', 'h1', plan1), sheet('sheet-2', 'A-102', 'Level 2', 'h2', plan2), sheet('sheet-3', 'A-201', 'Elevations', 'h3', elev)];
const i1 = I.planIssue(h, { id: 'i1', purpose: 'submission', date: '2026-03-02', by: 'DP', name: 'Council', sheets: s1, elements: 4 });
h = I.addIssue(h, i1);
eq(i1.code, 'A', 'issue 1 code');
eq(i1.sheets.map((s) => s.rev + ':' + s.state), ['A:first', 'A:first', 'A:first'], 'every sheet of the first issue is rev A, first');
// second issue: A-101 changed (h1 → h1b), A-102 unchanged, A-201 left out, a door schedule added
const s2 = [sheet('sheet-1', 'A-101', 'Level 1', 'h1b', plan1), sheet('sheet-2', 'A-102', 'Level 2', 'h2', plan2), sheet('sheet-4', 'A-601', 'Door schedule', 'h4', doors)];
eq(I.nextCode(h), 'B', 'the second issue is coded B');
const i2 = I.planIssue(h, { id: 'i2', purpose: 'tender', date: '2026-05-11', sheets: s2 });
h = I.addIssue(h, i2);
eq(i2.sheets.map((s) => s.number + ' ' + s.rev + ' ' + s.state), ['A-101 B revised', 'A-102 A unchanged', 'A-601 B first'], 'issue 2: the changed sheet is B, the unchanged one stays A, the new one is B');
eq(I.sheetRev(h, 'sheet-2'), 'A', 'A-102 is still at A');
eq(I.sheetRev(h, 'sheet-3'), 'A', 'A-201 (not in issue 2) is at A');
eq(I.lastIssueOf(h, 'sheet-3').issue.id, 'i1', 'A-201 was last issued in issue 1');
eq(I.lastIssueOf(h, 'sheet-1', 'i2').issue.id, 'i1', 'before issue 2, A-101 was last in issue 1');

// ---- element prints: 4 elements at issue 1; now: W1 moved, D1 props changed, W3 removed, W4 added
const P = (p, g, c, s) => ({ p, g, c, s });
const old = new Map([['W1', P('a', 'g1', 'IfcWall', 'L1')], ['W2', P('b', 'g2', 'IfcWall', 'L2')], ['D1', P('c', 'g3', 'IfcDoor', 'L1')], ['W3', P('d', 'g4', 'IfcWall', 'L2')]]);
const now = new Map([['W1', P('a', 'g1x', 'IfcWall', 'L1')], ['W2', P('b', 'g2', 'IfcWall', 'L2')], ['D1', P('cx', 'g3', 'IfcDoor', 'L1')], ['W4', P('e', 'g5', 'IfcWall', 'L1')]]);
const cmp = I.comparePrints(old, now);
eq(cmp.added, ['W4'], 'added'); eq(cmp.removed, ['W3'], 'removed'); eq(cmp.same, 1, 'one the same (W2)');
eq(cmp.changed, [{ guid: 'W1', props: false, shape: true }, { guid: 'D1', props: true, shape: false }], 'W1 changed shape, D1 changed properties');
const packed = I.packPrints(old), back = I.unpackPrints(packed);
eq([...back], [...old], 'prints survive packing');
eq(packed.split('|')[2].split(';').length, 4, 'four element entries');
ok(!/["\n']/.test(packed), 'packed prints hold no quotes or line ends');
eq(packed.split('|').slice(0, 2), ['IfcWall,IfcDoor', 'L1,L2'], 'classes and storeys are named once');
eq(I.unpackPrints('').size, 0, 'no prints from nothing');
eq(I.unpackPrints('W1 a b 0 0').size, 0, 'text in another shape gives no prints');
// a sheet set-up print tells 'the sheet changed' from 'its elements changed'
{ const iss = I.planIssue(I.emptyHistory(), { id: 'x', sheets: [{ id: 's', number: '1', title: '', hash: 'A', def: 'd1', scope: { all: true, storeys: [], classes: [] } }] });
  eq(I.changesSince(iss, { sheets: [{ id: 's', number: '1', title: '', hash: 'B', def: 'd1' }], prints: now, oldPrints: old }).sheets[0].why, ['elements'], 'same set-up, changed elements: why = elements');
  eq(I.changesSince(iss, { sheets: [{ id: 's', number: '1', title: '', hash: 'B', def: 'd2' }], prints: old, oldPrints: old }).sheets[0].why, ['sheet'], 'another set-up, same elements: why = sheet'); }

// ---- changes since issue 1 with today's sheets: sheet-1 definition same as issued (h1) but elements on L1 changed;
//      sheet-2 (L2): W3 removed there; sheet-3 (all): everything; sheet-9 is new; all three issued sheets are 'changed'
const today = [sheet('sheet-1', 'A-101', 'Level 1', 'h1'), sheet('sheet-2', 'A-102', 'Level 2', 'h2'), sheet('sheet-3', 'A-201', 'Elevations', 'h3x'), sheet('sheet-9', 'A-900', 'New', 'h9')];
const ch = I.changesSince(i1, { sheets: today, prints: now, oldPrints: old });
const row = (id) => ch.sheets.find((s) => s.id === id);
eq(row('sheet-1').state + '|' + row('sheet-1').why, 'changed|elements', 'A-101: same sheet, its elements changed');
eq(row('sheet-1').elements, { added: ['W4'], removed: [], changed: ['W1', 'D1'] }, 'A-101: W4 added, W1 and D1 changed (all on L1)');
eq(row('sheet-2').elements, { added: [], removed: ['W3'], changed: [] }, 'A-102: W3 (on L2) removed');
eq(row('sheet-3').why, ['elements'], 'A-201: no set-up print kept, so its changed print is put down to the elements found on it');
eq(row('sheet-3').elements.changed.length + row('sheet-3').elements.added.length + row('sheet-3').elements.removed.length, 4, 'A-201 (whole model): 2 changed + 1 added + 1 removed');
eq(row('sheet-9').state, 'added', 'a sheet made after the issue is "added"');
eq(ch.counts, { same: 0, changed: 3, added: 1, removed: 0 }, 'counts');
// nothing changed
const none = I.changesSince(i1, { sheets: s1, prints: old, oldPrints: old });
eq(none.counts, { same: 3, changed: 0, added: 0, removed: 0 }, 'an untouched model: three sheets the same');
// a sheet deleted since
eq(I.changesSince(i1, { sheets: s1.slice(0, 2), prints: old, oldPrints: old }).counts.removed, 1, 'a deleted sheet is "removed"');
// a class scope: the door schedule sees D1 only
const chD = I.changesSince(i2, { sheets: s2, prints: now, oldPrints: old });
eq(chD.sheets.find((s) => s.id === 'sheet-4').elements, { added: [], removed: [], changed: ['D1'] }, 'the door schedule sheet: D1 only');
// no prints kept: sheets only
const np = I.changesSince(i1, { sheets: today });
eq(np.elements, null, 'without prints no element list');
eq(np.sheets.find((s) => s.id === 'sheet-1').state, 'same', 'without prints A-101 (same definition) reads the same');

// ---- records
eq(I.nextRef(h, 'instruction'), 'SI-001', 'first site instruction');
h = I.putRecord(h, { id: 'r1', kind: 'instruction', issue: 'i2', ref: 'SI-001', title: 'Move DP1 300 east', date: '2026-06-01', status: 'open', sheets: ['A-101'], rev: 'B' });
h = I.putRecord(h, { id: 'r2', kind: 'shop-drawing', issue: 'i2', ref: 'SD-001', title: 'Steel stair', date: '2026-06-03', status: 'approved-as-noted', file: { name: 'stair.pdf', bytes: 10, sha256: 'ab'.repeat(32) } });
h = I.putRecord(h, { id: 'r3', kind: 'bogus', title: 'x' });
eq(h.records.length, 2, 'an unknown kind is refused');
eq(I.nextRef(h, 'instruction'), 'SI-002', 'second site instruction');
eq(I.nextRef(h, 'instruction', [{ ref: 'SI-007' }]), 'SI-008', 'the host\'s own records count for the next number');
eq(I.nextRef(h, 'linked-model'), 'LM-001', 'first linked model');
h = I.putRecord(h, { id: 'r1', kind: 'instruction', issue: 'i2', ref: 'SI-001', title: 'Move DP1 300 east', status: 'closed' });
eq(h.records.length + ':' + h.records[0].status, '2:closed', 'a record saved again is changed in place');
eq(I.recordsFor(h, { issue: 'i2', kind: 'shop-drawing' }).map((r) => r.ref), ['SD-001'], 'records by issue and kind');
eq(I.recordsFor(h, { extra: [{ id: 'm1', kind: 'cloud', issue: 'i2', ref: 'RC-001', title: 'Cloud' }] }).length, 3, 'a host\'s own records are listed with them');

// ---- the changelog
const L = I.changelog(h);
eq(L.issues.map((i) => [i.code, i.sheets, i.first, i.revised, i.unchanged, i.records]), [['A', 3, 3, 0, 0, 0], ['B', 3, 1, 1, 1, 2]], 'issue rows');
eq(L.sheets.map((s) => s.number + ':' + s.current), ['A-101:B', 'A-102:A', 'A-201:A', 'A-601:B'], 'sheets in number order with their current revision');
const T = I.changelogTable(h);
eq(T.head, ['Sheet', 'Title', 'A 2026-03-02', 'B 2026-05-11', 'Current revision'], 'table head');
eq(T.rows, [['A-101', 'Level 1', 'A', 'B', 'B'], ['A-102', 'Level 2', 'A', '(A)', 'A'], ['A-201', 'Elevations', 'A', '', 'A'], ['A-601', 'Door schedule', '', 'B', 'B']], 'the sheet by issue table: (A) = issued again unchanged, blank = not in that issue');
const csv = I.changelogCsv(h);
ok(csv.includes('A-102,Level 2,A,(A),A\r\n'), 'CSV has the table row');
ok(csv.includes('SI-001,instruction,B,'), 'CSV lists the record with its issue code');
ok(I.changelogCsv(I.putRecord(h, { id: 'r9', kind: 'note', title: '=cmd()' })).includes("'=cmd()"), 'a formula-looking title is quoted off in the CSV');
const md = I.changelogMarkdown(h);
ok(md.includes('| A-101 | Level 1 | A | B | B |') && md.includes('| SD-001 |'), 'Markdown has the table and the records');
eq(I.changelogMarkdown(I.emptyHistory()), 'Nothing has been issued yet.', 'an empty history says so');
eq(I.changelogTable(h, { sheet: 'Blad' }).head[0], 'Blad', 'the host\'s words are used');

// ---- exchange and merge
const text = I.historyJson(h, { prints: { i1: packed } });
const rd = I.readHistoryJson(text);
ok(rd.ok && rd.history.issues.length === 2 && rd.history.records.length === 2 && rd.prints.i1 === packed, 'the exchange file reads back with its prints');
eq(I.readHistoryJson('{').why, 'json', 'bad JSON'); eq(I.readHistoryJson('{"format":"x"}').why, 'format', 'another format'); eq(I.readHistoryJson('{"format":"cadcraft-issues","version":9}').why, 'newer', 'a newer version is refused');
let other = I.cleanHistory(JSON.parse(text));
other = I.addIssue(other, I.planIssue(other, { id: 'i3', date: '2026-07-01', purpose: 'construction', sheets: [sheet('sheet-1', 'A-101', 'Level 1', 'h1c', plan1)] }));
other = I.putRecord(other, { id: 'r1', kind: 'instruction', issue: 'i2', ref: 'SI-001', title: 'Move DP1 300 east', status: 'answered', at: '2026-07-02T00:00:00Z' });
other = I.putRecord(other, { id: 'r5', kind: 'linked-model', issue: 'i3', ref: 'LM-001', title: 'Steel model', link: 'steel.ifc' });
const m = I.mergeHistory(h, other);
eq(m.issues.map((i) => i.code), ['A', 'B', 'C'], 'merge: the third issue arrives, coded C');
eq(m.added, { issues: 1, records: 1 }, 'merge counts what is new');
eq(m.records.find((r) => r.id === 'r1').status, 'answered', 'merge: the newer copy of a record wins');
eq(I.mergeHistory(m, h).issues.length, 3, 'merging an older copy loses nothing');
h = I.removeIssue(h, 'i2');
eq(h.issues.length + ':' + h.records.map((r) => r.issue).join(','), '1:,', 'removing an issue keeps its records, unattached');

// ---- cleaning what is read
const dirty = I.cleanHistory({ issues: [{ id: 'ok', code: 'x'.repeat(40), purpose: 'nonsense', date: '2026-13-99x', sheets: [{ id: 'a b' }, { id: 's1', state: 'odd' }, { id: 's1' }], snapshot: { name: 'm.ifc', bytes: -4, sha256: 'zz' } }, { id: '' }, { id: 'ok' }], records: 'no' });
eq(dirty.issues.length, 1, 'issues without an id and repeats are dropped');
eq([dirty.issues[0].code.length, dirty.issues[0].purpose, dirty.issues[0].date, dirty.issues[0].sheets.length, dirty.issues[0].sheets[0].state], [12, 'information', '', 1, 'first'], 'fields are bounded and defaulted');
eq(dirty.issues[0].snapshot, { name: 'm.ifc', bytes: 0, sha256: '' }, 'a snapshot record is cleaned');
eq(dirty.records, [], 'records that are not a list are none');

// ---- DetailCraft's per-sheet log regrouped: two sheets issued 1 March (A), one re-issued 9 March (B)
const dc = I.fromSheetIssues([{ sheet: 'assembly:B1', number: 'A-B1', rev: 'A', date: '2026-03-01', note: 'For fabrication', hash: 11 }, { sheet: 'part:p1', number: 'P-p1', rev: 'A', date: '2026-03-01', note: 'For fabrication', hash: 12 }, { sheet: 'assembly:B1', number: 'A-B1', rev: 'B', date: '2026-03-09', note: 'Hole moved', hash: 13 }], { app: 'detailcraft' });
eq(dc.issues.map((i) => i.code + ' ' + i.date + ' ' + i.sheets.map((s) => s.number + s.rev + s.state).join('+')), ['A 2026-03-01 A-B1Afirst+P-p1Afirst', 'B 2026-03-09 A-B1Brevised'], 'a per-sheet log becomes two issues');
eq(I.changelogTable(dc).rows, [['A-B1', '', 'A', 'B', 'B'], ['P-p1', '', 'A', '', 'A']], 'and reads as a changelog');

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
