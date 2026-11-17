// SPDX-License-Identifier: Apache-2.0
// node lib/lod/test/lod.test.mjs   (pure: no model, no page). Every expected value is worked out by hand in the comment beside it.
import assert from 'node:assert/strict';
import test from 'node:test';
import * as S from '../scale.js';
import * as R from '../record.js';
import * as M from '../milestones.js';
import * as A from '../advice.js';
import * as L from '../library.js';
import * as F from '../fixes.js';

test('scale: six levels, in order, each with a meaning; the scale is the one in lib/walls', () => {
  assert.deepEqual(S.LOD_LEVELS.map((l) => l.lod), [100, 200, 300, 350, 400, 500]);
  assert.deepEqual(S.LOD_LEVELS.map((l) => l.key), ['symbol', 'placeholder', 'specific', 'coordinated', 'fabrication', 'field-verified']);
  assert.ok(S.LOD_LEVELS.every((l) => l.means && l.example && l.name));
  assert.deepEqual(S.LOD_SCALE, [100, 200, 300, 350, 400, 500]);
  assert.match(S.SCALE_SOURCE, /BIMForum/); assert.match(S.SCALE_SOURCE, /ISO 7817-1/);
});
test('scale is frozen all the way down (BK.93)', () => {
  assert.ok(Object.isFrozen(S.LOD_LEVELS) && S.LOD_LEVELS.every((l) => Object.isFrozen(l)));
  assert.throws(() => { 'use strict'; S.LOD_LEVELS[2].means = 'x'; }, TypeError);
  assert.throws(() => { 'use strict'; S.LOD_LEVELS.push({}); }, TypeError);
});
test('scale fingerprint is pinned: changing a definition is a decision, not an edit', () => {
  assert.equal(S.scaleFingerprint(), S.scaleFingerprint());
  assert.match(S.scaleFingerprint(), /^[0-9a-f]{8}$/);
  assert.equal(S.scaleFingerprint(), '9179af0b');
});
test('each level includes the ones below', () => {
  assert.deepEqual(S.includesBelow(300), [100, 200]);
  assert.deepEqual(S.includesBelow(100), []);
  assert.deepEqual(S.includesBelow(500), [100, 200, 300, 350, 400]);
  assert.ok(S.atLeast(350, 300) && !S.atLeast(200, 300) && !S.atLeast(null, 100) && !S.atLeast(300, null));
  assert.equal(S.compareLod(null, 100), -1); assert.equal(S.compareLod(300, 300), 0);
});
test('checkContent refuses content that redefines the scale, accepts a milestone table', () => {
  assert.deepEqual(S.checkContent({ name: 'pack', rows: [{ required: { sd: 200 } }] }), []);
  const a = S.checkContent({ lodScale: { 300: 'whatever we say' } });
  assert.equal(a[0].code, 'lod.scale.redefined');
  assert.equal(S.checkContent({ scaleId: 'other 9' })[0].code, 'lod.scale.id');
  assert.equal(S.checkContent({ scaleId: S.SCALE_ID }).length, 0);
  assert.equal(S.checkContent({ fingerprint: 'deadbeef' })[0].code, 'lod.scale.fingerprint');
  assert.equal(S.checkContent({ fingerprint: S.scaleFingerprint() }).length, 0);
  assert.equal(S.checkContent({ rows: [{ lod: 250 }] })[0].code, 'lod.scale.number');
  assert.equal(S.checkContent({ rows: [{ lod: 300 }] }).length, 0);
  assert.equal(S.checkContent({ definitions: { 100: 'a', 200: 'b' } })[0].code, 'lod.scale.redefined');
});
test('detail is not development (BK.100)', () => {
  assert.equal(S.drawnDetail({ sketch: true }), 'band');
  assert.equal(S.drawnDetail({ layers: 4, planDetail: 'fine' }), 'layers');
  assert.equal(S.drawnDetail({ mesh: true }), 'full');
  assert.equal(S.drawnDetail({ hasShape: false }), '');
  assert.equal(S.compareDetail('full', 200).state, 'drawn-ahead');   // drawn rank 5, LOD 200 wants 2: gap 3
  assert.equal(S.compareDetail('band', 200).state, 'agree');
  assert.equal(S.compareDetail('band', 500).state, 'developed-ahead');   // rank 2 vs 5
  assert.equal(S.compareDetail('', 300).state, 'unknown');
  assert.equal(S.compareDetail('layers', null).state, 'unknown');
});

test('record: clean, rows, marks', () => {
  assert.deepEqual(R.cleanRecord(null), { lod: null, parts: { geometry: null, information: null, documentation: null } });
  const rec = R.cleanRecord({ LOD: '300', LODGeometry: 300, LODInformation: 200, LODDocumentation: 'lod 250' });
  assert.deepEqual(rec, { lod: 300, parts: { geometry: 300, information: 200, documentation: null } });
  assert.deepEqual(R.partMarks(rec), { geometry: 'met', information: 'below', documentation: 'not-stated' });
  assert.deepEqual(R.partMarks({ lod: null, parts: {} }), { geometry: 'no-lod', information: 'no-lod', documentation: 'no-lod' });
  assert.deepEqual(R.recordRows(rec).map((r) => r[0] + '=' + r[2]), ['LOD=300', 'LODGeometry=300', 'LODInformation=200', 'LODDocumentation=null']);
  assert.deepEqual(R.weakestPart(rec), { part: 'information', lod: 200 });
  assert.equal(R.weakestPart(null), null);
  assert.ok(R.isEmpty({}) && !R.isEmpty({ lod: 100 }));
  assert.deepEqual(R.fromPset({ LOD: 350 }).lod, 350);
});
test('record: a bigger part reaches the level (each level includes the ones below); effective LOD', () => {
  assert.equal(R.partMarks({ lod: 200, parts: { geometry: 400, information: 200, documentation: 100 } }).geometry, 'met');
  assert.equal(R.effectiveLod({ lod: 200 }, 300, false), 200);
  assert.equal(R.effectiveLod(null, 300, false), 300);
  assert.equal(R.effectiveLod({ lod: 200 }, 300, true), 500);
  assert.equal(R.effectiveLod(null, null, false), null);
  const f = R.frameworkOf({ cls: 'IfcWall', record: { lod: 300 }, codes: [{ system: 'uniformat', code: 'B2010' }] });
  assert.equal(f.lodFrom, 'element'); assert.ok(f.complete);
  assert.equal(R.frameworkOf({ cls: 'IfcWall', typeLod: 200 }).lodFrom, 'type');
  assert.equal(R.frameworkOf({ cls: 'IfcWall', verified: true }).lod, 500);
  assert.ok(!R.frameworkOf({ cls: 'IfcWall' }).complete);
});

const els = [
  { id: 'w1', label: 'Wall 1', cls: 'IfcWall', codes: [], lod: 200 },
  { id: 'w2', label: 'Wall 2', cls: 'IfcWallStandardCase', codes: [], lod: 300, parts: { information: 200 } },
  { id: 'd1', label: 'Door 1', cls: 'IfcDoor', codes: [], lod: null },
  { id: 'd2', label: 'Door 2', cls: 'IfcDoor', codes: [], lod: 350 },
  { id: 'x1', label: 'Thing', cls: 'IfcSomething', codes: [], lod: 300 },
  { id: 'c1', label: 'Wall by code', cls: 'IfcBuildingElementProxy', codes: [{ system: 'uniformat', code: 'B2010' }], lod: 100 },
];
test('milestone check on the starter table at DD (hand-worked)', () => {
  // DD needs: walls 300, doors 300. w1 200 → not reached; w2 300 → reached (information part 200 < 300 → partsBelow);
  // d1 no tag → untagged; d2 350 → reached; x1 IfcSomething → no row; c1 has no row (class unknown, no code row) → no row.
  const c = M.milestoneCheck(els, M.STARTER_TABLE, 'dd');
  const st = Object.fromEntries(c.results.map((r) => [r.id, r.state]));
  assert.deepEqual(st, { w1: 'not-reached', w2: 'reached', d1: 'untagged', d2: 'reached', x1: 'no-row', c1: 'no-row' });
  assert.deepEqual(c.totals, { checked: 4, reached: 2, notReached: 1, untagged: 1, noRow: 2, asksNothing: 0 });
  assert.deepEqual(c.results.find((r) => r.id === 'w2').partsBelow, ['information']);
  assert.equal(c.byRow.find((r) => r.name === 'Walls').notReached, 1);
});
test('milestone table: a code row wins over a class row; longest code wins; prefix match', () => {
  const { table, problems } = M.cleanTable({ id: 't', name: 'office', rows: [
    { name: 'Walls', ifc: ['IfcWall'], required: { sd: 200, dd: 300 } },
    { name: 'External walls', codes: [{ system: 'uniformat', code: 'B20' }], required: { sd: 200, dd: 350 } },
    { name: 'Walls, exterior closure', codes: [{ system: 'uniformat', code: 'B2010' }], required: { sd: 300, dd: 350 } }] });
  assert.equal(problems.length, 0);
  const el = (cls, code) => ({ cls, codes: code ? [{ system: 'uniformat', code }] : [] });
  assert.equal(M.matchRow(el('IfcWall', 'B2010.10'), table), 2);
  assert.equal(M.matchRow(el('IfcWall', 'B2030'), table), 1);
  assert.equal(M.matchRow(el('IfcWall', null), table), 0);
  assert.equal(M.matchRow(el('IfcColumn', null), table), -1);
});
test('milestone table: bad rows and levels are said, not guessed; a scale redefinition is reported', () => {
  const r = M.cleanTable({ rows: [{ name: 'x', required: { sd: 200 } }, { ifc: ['IfcWall'], required: { sd: 250, dd: 'LOD 300', cd: '-' } }], lodScale: { 300: 'mine' } });
  assert.ok(r.problems.some((p) => p.code === 'lod.table.norow'));
  assert.ok(r.problems.some((p) => p.code === 'lod.table.level'));
  assert.ok(r.problems.some((p) => p.code === 'lod.scale.redefined'));
  assert.deepEqual(r.table.rows[0].required, { sd: null, dd: 300, cd: null, estimate: null, bid: null });
  assert.equal(M.cleanTable(5).table, null);
});
test('milestone table: CSV and JSON round trip; formula cells stay text', () => {
  const csv = M.tableCsv(M.STARTER_TABLE);
  const back = M.parseTable(csv);
  assert.equal(back.problems.length, 0);
  assert.equal(back.table.rows.length, M.STARTER_TABLE.rows.length);
  assert.deepEqual(back.table.rows[0].required, { ...M.STARTER_TABLE.rows[0].required });
  assert.deepEqual(back.table.rows[0].ifc, ['IfcWall']);
  const j = M.parseTable(JSON.stringify(M.STARTER_TABLE));
  assert.equal(j.table.rows.length, M.STARTER_TABLE.rows.length);
  assert.equal(M.parseTable('{bad').table, null);
  assert.equal(M.parseTable('name,ifc\nA,IfcWall\n').table, null);
  const evil = M.tableCsv({ ...M.STARTER_TABLE, rows: [{ name: '=HYPERLINK("x")', ifc: ['IfcWall'], codes: [], required: { sd: 100 } }] });
  assert.match(evil.split('\n')[1], /^"?'=HYPERLINK/);
  const quoted = M.parseTable('name,ifc,system,code,sd\n"Walls, all",IfcWall,,,200\n');
  assert.equal(quoted.table.rows[0].name, 'Walls, all');
});
test('milestone problems: below is a warning, untagged is one note; nothing is an error', () => {
  const c = M.milestoneCheck(els, M.STARTER_TABLE, 'dd');
  const p = M.milestoneProblems(c);
  assert.deepEqual(p.map((x) => x.code), ['lod.below', 'lod.untagged']);
  assert.ok(p.every((x) => x.severity !== 'error' && x.source.name === 'lod'));
  assert.match(p[0].text, /Wall 1 is at LOD 200; Design development \(DD\) asks for LOD 300/);
  assert.equal(M.milestoneProblems(c, { t: (k) => k })[0].text, p[0].text);   // a host with no word for it keeps the English
});
test('advice never blocks (BK.101)', () => {
  assert.equal(A.placeAdvice({ itemLod: 300, required: 200, name: 'Brick wall' }).block, false);
  assert.match(A.words('lod.advice.place', { name: 'Brick wall', lod: 300, required: 200 }), /Brick wall is LOD 300/);
  assert.equal(A.placeAdvice({ itemLod: 200, required: 200 }), null);
  assert.equal(A.placeAdvice({ itemLod: 300, required: 300 }), null);
  assert.equal(A.placeAdvice({ itemLod: 300, required: null }), null);
  const m = A.modelAdvice({ elements: [{ id: 'a', lod: 300 }, { id: 'b', lod: 100 }, { id: 'c', lod: 500 }], required: 200, stage: 'Design development' });
  assert.equal(m.block, false); assert.deepEqual(m.notes[0].ids, ['a']);
  assert.deepEqual(A.modelAdvice({ elements: [{ id: 'a', lod: 300 }], required: 300 }).notes, []);
  assert.equal(A.startingLod(100), 200); assert.equal(A.startingLod(300), null);
});
test('library items state their LOD and class before placing (BK.95)', () => {
  const door = { kind: 'door', lod: 200, ifc: { class: 'IfcDoor' }, classification: [{ system: 'uniclass', code: 'Ss_25_30' }] };
  assert.equal(L.placeLine(door), 'LOD 200 · IfcDoor · uniclass Ss_25_30');
  const type = { kind: 'type', type: { element: 'wall', lod: 300 } };
  assert.equal(L.itemLod(type), 300);
  assert.equal(L.placeLine({ kind: 'window' }), 'LOD not stated · IfcWindow');
  assert.equal(L.itemClass({ kind: 'window' }).from, 'kind');
  assert.equal(L.itemClass({ kind: 'furniture', ifc: { class: 'IfcFurniture' } }).from, 'item');
  assert.equal(L.itemLod({ lod: 250 }), null);
  assert.equal(L.placeInfo(door, { required: 300 }).vsStage, 'below');
  assert.equal(L.placeInfo(door, { required: 100 }).vsStage, 'above');
  assert.equal(L.placeInfo(door, {}).vsStage, '');
});
test('fix lists propose, never invent names (BK.151)', () => {
  const items = [
    { id: 'a', kind: 'door', tag: 'D1' }, { id: 'b', kind: 'door', tag: 'D2' }, { id: 'c', kind: 'door', tag: '' }, { id: 'd', kind: 'door', tag: ' ' },
    { id: 'e', kind: 'window', tag: '' }, { id: 'f', kind: 'room', tag: '101' }, { id: 'g', kind: 'room', tag: '' }, { id: 'h', kind: 'device', tag: 'E-07' }, { id: 'i', kind: 'device', tag: '' }];
  const p = Object.fromEntries(F.proposeTags(items).map((x) => [x.id, x.tag]));
  // doors continue D1 D2 → D3 D4; no window has a tag → default W1; rooms 101 → 102; E-07 has prefix "E-" and width 2 → "E-08"
  assert.deepEqual(p, { c: 'D3', d: 'D4', e: 'W1', g: '102', i: 'E-08' });
  const taken = F.proposeTags([{ id: 'x', kind: 'door', tag: '' }, { id: 'y', kind: 'door', tag: 'D1' }], { taken: ['D2'] });
  assert.equal(taken[0].tag, 'D3');
  const rooms = F.roomNameFixes([{ id: 1, number: '101', name: '' }, { id: 2, number: '102', name: 'Room 2' }, { id: 3, number: '103', name: 'Kitchen' }], { isAutoName: (n) => /^Room \d+$/.test(n) });
  assert.deepEqual(rooms.map((r) => r.id), [1, 2]);
  assert.equal(F.appliable(rooms).length, 0);
  rooms[0].name = 'Hall';
  assert.deepEqual(F.appliable(rooms).map((r) => r.id), [1]);
});
