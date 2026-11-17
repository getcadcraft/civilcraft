/* SPDX-License-Identifier: Apache-2.0 */
/**
 * pack-test.mjs: client pack and stage report fields, the option comparison on area and cost (BK.63, BK.170; session bk-r3-stages-10):
 *   node bin/test-bimcraft.mjs --pack
 * Hand-worked numbers beside each check. Cost comes from price rows only: no row, no number.
 */
import path from 'node:path';

export async function packMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail !== '' ? ' (' + (typeof detail === 'string' ? detail : JSON.stringify(detail)) + ')' : '')); };
  const OC = await import(path.join(APP, 'option-compare.js'));
  const PF = await import(path.join(APP, 'pack-fields.js'));
  const C5 = await import(path.join(APP, 'cost5d.js'));
  const MO = await import(path.join(APP, 'mass-options.js'));
  const D = await import(path.join(APP, 'doc-template.js'));
  const DF = await import(path.join(APP, 'doc-fields.js'));
  const { TEMPLATES } = await import(path.join(APP, 'doc-templates.js'));
  const H = await import(path.join(APP, 'issuelog/history.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const { t } = await import(path.join(APP, 'i18n.js'));
  const row = (r) => { const c = C5.cleanPriceRow(r); if (!c.row) throw new Error('bad row ' + c.errors); return c.row; };

  console.log('== option costs from the price table only');
  // A: 10 x 20 m, 3 floors of 3 m: gross 600 m2, perimeter 60 m x 9 m = 540 m2 envelope, 1800 m3.  B: 10 x 10 m, 4 floors: 400 m2, 40 x 12 = 480 m2, 1200 m3
  const A = { guid: 'gA', id: 1, name: 'Bar', option: 'Bar', current: true, use: '', floors: 3, height: 9000, footprint_m2: 200, gross_m2: 600, volume_m3: 1800, envelope_m2: 540 };
  const B = { guid: 'gB', id: 2, name: 'Tower', option: 'Tower', current: false, use: '', floors: 4, height: 12000, footprint_m2: 100, gross_m2: 400, volume_m3: 1200, envelope_m2: 480 };
  const O = { guid: 'gO', id: 3, name: 'Offices', option: 'Offices', current: false, use: 'office', floors: 1, height: 3000, footprint_m2: 100, gross_m2: 100, volume_m3: 300, envelope_m2: 120 };
  let c = OC.optionCosts([A, B], []);
  ok(c.get('gA').total === null && c.get('gA').floor === null && JSON.stringify(c.get('gA').missing) === '["floor"]' && c.envelopeAsked === false, 'no price rows: no cost, the floor rate is missing, no envelope asked');
  const gfa = row({ id: 'gfa', match: 'gross floor area', classes: 'IFCBUILDINGELEMENTPROXY', unit: 'm2', mat: 1000, lab: 200 });
  c = OC.optionCosts([A, B], [gfa]);
  ok(c.get('gA').total === 720000 && c.get('gB').total === 480000 && c.get('gA').floor.rate === 'gfa' && c.get('gA').floor.qty === 600, 'a gross floor area row at 1000 + 200 a m2: 600 x 1200 = 720 000, 400 x 1200 = 480 000', [c.get('gA').total, c.get('gB').total]);
  const env = row({ id: 'env', match: 'envelope|facade', classes: 'IFCBUILDINGELEMENTPROXY', unit: 'm2', mat: 300, lab: 0, waste: 0.1 });
  c = OC.optionCosts([A, B], [gfa, env]);
  ok(c.get('gA').envelope.cost === 178200 && c.get('gA').total === 898200 && c.get('gB').envelope.cost === 158400 && c.get('gB').total === 638400, 'with an envelope row (300 a m2, 10 % waste): A 540 x 1.1 x 300 = 178 200, total 898 200; B 480 x 1.1 x 300 = 158 400, total 638 400', [c.get('gA').total, c.get('gB').total]);
  c = OC.optionCosts([A], [env]);
  ok(c.get('gA').total === null && c.get('gA').envelope.cost === 178200 && c.get('gA').missing.join() === 'floor', 'an envelope row alone: the envelope has a cost, the total stays empty (a part is never shown as the whole)');
  c = OC.optionCosts([A], [row({ id: 'slab', match: 'floor|gross floor area', classes: 'IFCSLAB', unit: 'm2', mat: 90, lab: 10 }), row({ id: 'any', match: 'gross floor area', unit: 'm2', mat: 5, lab: 0 })]);
  ok(c.get('gA').total === null, 'a slab\'s row, or a row not made for building masses, never prices a mass');
  c = OC.optionCosts([A, O], [gfa, row({ id: 'office', match: 'office', classes: 'IFCBUILDINGELEMENTPROXY', unit: 'm2', mat: 2000, lab: 0 })]);
  ok(c.get('gO').total === 200000 && c.get('gO').floor.rate === 'office' && c.get('gA').floor.rate === 'gfa', 'an option whose use is "office" takes the office row: 100 x 2000 = 200 000; the others the general row');
  c = OC.optionCosts([A], [row({ id: 'vol', match: 'building mass', classes: 'IFCBUILDINGELEMENTPROXY', unit: 'm3', mat: 100, lab: 0 })]);
  ok(c.get('gA').total === 180000, 'a row by volume: 1800 m3 x 100 = 180 000');
  const cmp = OC.compareOptions([{ set: 'Scheme 1', options: [A, B] }], { rows: [gfa, env], currency: 'ZAR' })[0];
  ok(cmp.options[0].perM2 === 1497 && cmp.options[1].perM2 === 1596, 'cost for each m2 of floor: 898 200 / 600 = 1497, 638 400 / 400 = 1596', cmp.options.map((o) => o.perM2));
  const fm = { t, fmtArea: (m2) => m2 + ' m2', fmtLen: (mm) => mm / 1000 + ' m', money: (v) => 'R ' + v };
  let T = OC.optionTable(cmp, fm);
  ok(T.head.length === 10 && JSON.stringify(T.rows[0]) === JSON.stringify(['Bar (current)', '3', '9 m', '200 m2', '600 m2', '540 m2', 'R 720000', 'R 178200', 'R 898200', 'R 1497']) && JSON.stringify(T.ids) === '[["gA"],["gB"]]', 'the table: area and cost side by side, the current option marked, each row tied to its mass', T.rows[0]);
  ok(/price table/.test(T.note) && /gfa, env/.test(T.note) && /ZAR/.test(T.note), 'the note names the price rows and the currency');
  T = OC.optionTable(OC.compareOptions([{ set: 'Scheme 1', options: [A, B] }], { rows: [] })[0], fm);
  ok(T.rows[0][6] === 'No rate' && T.rows[0][7] === 'No rate' && T.rows[0][8] === 'No rate' && T.head.length === 9 && /no row for building masses/.test(T.note) && !T.rows.flat().some((x) => /R \d/.test(x)), 'no rate: the cost columns read "No rate", never a number');

  console.log('== pack fields');
  let h = H.emptyHistory();
  h = H.addIssue(h, H.planIssue(h, { id: 'i1', date: '2026-03-02', sheets: [{ id: 'sheet-1', number: 'A-101', title: 'Plan', hash: 'x' }] }));
  const ST = PF.sheetsTable({ sheets: [{ id: 'sheet-1', number: 'A-101', title: 'Plan', views: [1, 2] }, { id: 'sheet-2', number: 'A-102', title: 'Roof', views: [] }], history: h, t });
  ok(JSON.stringify(ST.rows) === JSON.stringify([['A-101', 'Plan', '2', 'A', '2026-03-02'], ['A-102', 'Roof', '0', 'Not issued', '']]), 'sheets with their revision: issued at A, and one not issued', ST.rows);
  ok(PF.sheetsTable({ sheets: [], history: h, t }) === null, 'no sheets, no table');
  // rooms: Level 1 has 12 and 18 m2, Level 2 has 20 m2 (values in mm2): 30, 20, total 50 over 3 rooms
  const rooms = { head: ['No.', 'Name', 'Level', 'Area'], cols: [{ id: 'number', kind: 'text' }, { id: 'name', kind: 'text' }, { id: 'level', kind: 'text', role: 'level', order: ['Level 1', 'Level 2'] }, { id: 'area', kind: 'area' }],
    rows: [['1', 'Hall', 'Level 2', ''], ['2', 'Kitchen', 'Level 1', ''], ['3', 'Bed', 'Level 1', '']], vals: [[null, null, null, 20e6], [null, null, null, 12e6], [null, null, null, 18e6]], ids: [[31], [32], [33]] };
  const AT = PF.areasTable({ table: rooms, fmtArea: (v) => v / 1e6 + ' m2', t });
  ok(JSON.stringify(AT.rows) === JSON.stringify([['Level 1', '2', '30 m2'], ['Level 2', '1', '20 m2'], ['Total', '3', '50 m2']]) && JSON.stringify(AT.ids) === JSON.stringify([[32, 33], [31], [31, 32, 33]]), 'areas by level in level order, with the rooms behind each figure', AT.rows);
  const CT = PF.changesTable({ issue: h.issues[0], t, changes: { elements: null, sheets: [{ id: 'sheet-1', number: 'A-101', title: 'Plan', rev: 'A', state: 'changed', why: ['elements'], elements: { added: ['g1'], removed: [], changed: ['g2', 'g3'] } }] } });
  ok(JSON.stringify(CT.rows[0]) === JSON.stringify(['A-101', 'Plan', 'A', 'Changed (its elements)', '1', '2', '0']) && CT.guids[0].join() === 'g1,g2,g3' && /No element record/.test(CT.note), 'changes since the last issue as a table', CT.rows[0]);
  ok(PF.stageLine('concept', { concept: 'Concept' }, t) === 'Concept' && PF.stageLine('', null, t) === 'not set', 'the stage in words, or "not set"');
  const csv = PF.figuresCsv([{ head: ['Level', 'Rooms', 'Floor area'], lines: [{ cells: ['Level 1', '2', '30 m2'], ids: [32, 33], cellIds: null }, { cells: ['x', '', ''], ids: [], cellIds: null }] }], (k) => 'G' + k);
  ok(csv === 'Table,Row,Column,Figure,GlobalIds\r\n1,Level 1,Rooms,2,G32 G33\r\n1,Level 1,Floor area,30 m2,G32 G33\r\n', 'figures.csv: every figure with the GlobalIds behind it', csv);

  console.log('== the templates print the fields');
  const fields = { stage: () => 'Concept', options: () => DF.mdTable(['Option', 'Cost'], [['Bar', 'No rate']]), areas: () => DF.mdTable(['Level', 'Floor area'], [['Level 1', '30 m2']]), sheets: () => DF.mdTable(['Sheet'], [['A-101']]), issues: () => 'Nothing has been issued yet.', changes: () => 'Nothing has been issued yet.', schedule: (a) => DF.mdTable(['Mark'], [[a]]) };
  const src = D.docSource({ ixs: [], defs: [], project: { name: 'Pack house' }, file: 'p.ifc', date: '2026-11-11', fields });
  for (const id of ['clientpack', 'stagereport']) {
    const tpl = TEMPLATES.find((x) => x.id === id), r = D.render(tpl.text, src);
    ok(!!tpl && r.warnings.length === 0 && /Stage: Concept\./.test(r.markdown) && /\| Bar \| No rate \|/.test(r.markdown) && /\| Level 1 \| 30 m2 \|/.test(r.markdown) && /\| A-101 \|/.test(r.markdown) && !/\{\{/.test(r.markdown), id + ': every field prints, nothing is left unfilled', r.warnings);
    ok(t(tpl.name) !== tpl.name && t(tpl.trade) === 'presentation', id + ': named in the language file');
  }

  console.log('== a real model: two kept options, the price table in the file');
  const eng = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => eng.load(b))(new TextEncoder().encode(N.newBuilding({ name: 'Option house', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'o.ifc', now: new Date('2026-11-11T12:00:00Z') })));
  const ed = new IfcEditor(WebIFC, eng);
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  ed.modelChange(MO.addMassOption({ set: 'Scheme 1', name: 'Bar', pts: [[0, 0], [20000, 0], [20000, 10000], [0, 10000]], floors: 3, floorHeight: 3000, use: '' }));
  ed.modelChange(MO.addMassOption({ set: 'Scheme 1', name: 'Tower', pts: [[30000, 0], [40000, 0], [40000, 10000], [30000, 10000]], floors: 4, floorHeight: 3000, use: '' }));
  const sets = MO.readOptionSets(W());
  ok(sets.length === 1 && sets[0].options.length === 2 && sets[0].options[0].gross_m2 === 600 && sets[0].options[0].envelope_m2 === 540 && sets[0].options[1].gross_m2 === 400 && sets[0].options[1].envelope_m2 === 480, 'the kept options read back: 600 and 400 m2 gross, 540 and 480 m2 envelope', sets[0]?.options.map((o) => [o.gross_m2, o.envelope_m2]));
  let cm = OC.compareOptions(sets, { rows: C5.readCostSettings(W()).rows })[0];
  ok(cm.options.every((o) => o.cost.total === null), 'a model with no price table: no cost for any option');
  ed.modelChange(C5.setCostSettings({ rows: [gfa, env], currency: 'ZAR' }));
  const cs = C5.readCostSettings(W());
  cm = OC.compareOptions(sets, { rows: cs.rows, currency: cs.currency })[0];
  ok(cm.options[0].cost.total === 898200 && cm.options[1].cost.total === 638400 && cm.currency === 'ZAR', 'with the price table kept in the file: 898 200 and 638 400', cm.options.map((o) => o.cost.total));

  console.log(`\n${good} passed, ${bad} failed`);
  return bad ? 1 : 0;
}
