#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * node lib/quantities/test/test.mjs — the measuring rules and a type's takeoff data (BK.11, BK.84, BK.40; session bk-quantities-10).
 * Every expected value is worked out in the comment beside it. Also checks the apps' copies are byte-equal and that the rule each
 * app shows is the rule written here.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES, RULE_VERSION, ruleText, measure, wallSide, outlineArea, finishFaces, addMeasures } from '../rules.js';
import { cleanTypeData, rateQuantity, rateAmount, unitText, mortarText, rateText, amountText, RATE_BASES } from '../typedata.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail !== '' ? ' (' + JSON.stringify(detail) + ')' : '')); };
const near = (a, b, e = 1e-9) => Math.abs(a - b) <= e;
const adds = (m) => near(m.gross - m.deductions, m.net, 1e-6);

console.log('== the rules as written');
ok(RULE_VERSION === 1 && ['wall.side', 'floor', 'finish.wall', 'finish.ceiling'].every((k) => RULES[k] && RULES[k].id === k && /^Gross: .+ Deductions: .+ Net: .+/.test(RULES[k].text)), 'four rules, each states gross, deductions and net');
ok(ruleText('wall.side') === RULES['wall.side'].text && ruleText('nothing') === '', 'ruleText gives the sentence, nothing for an unknown id');
ok(Object.isFrozen(RULES) && Object.isFrozen(RULES.floor), 'the rules cannot be changed by a host');
ok(!/—/.test(Object.values(RULES).map((r) => r.text).join(' ')), 'plain wording, no em dashes');

console.log('== measure');
let m = measure(100, 30);
ok(m.gross === 100 && m.deductions === 30 && m.net === 70, '100 less 30 = 70');
m = measure(100, [30, 20, 5]);
ok(m.deductions === 55 && m.net === 45, 'a list of deductions: 30 + 20 + 5 = 55, net 45');
m = measure(100, 250);
ok(m.net === 0 && m.deductions === 100 && adds(m), 'more taken out than there is: net 0, deductions capped at the gross, still adds up');
m = measure(-5, 3);
ok(m.gross === 0 && m.net === 0 && m.deductions === 0, 'a negative gross is nothing');
m = measure(100, [NaN, -4, Infinity, 10]);
ok(m.deductions === 10 && m.net === 90, 'a deduction that is not a positive finite number is ignored');

console.log('== one face of a wall');
// 5000 x 2700 = 13 500 000 mm2; a 900 x 2100 door = 1 890 000; net 11 610 000
m = wallSide({ length: 5000, height: 2700, openings: [{ id: 7, width: 900, height: 2100 }] });
ok(m.gross === 13500000 && m.deductions === 1890000 && m.net === 11610000, 'wall 5000 x 2700 with a 900 x 2100 door: 13 500 000 gross, 1 890 000 out, 11 610 000 net', m);
m = wallSide({ length: 5000, height: 2700, openings: [{ id: 7, width: 900, height: 2100 }, { id: 7, width: 900, height: 2100 }] });
ok(m.deductions === 1890000, 'the same opening listed twice (same id) is deducted once', m);
m = wallSide({ length: 5000, height: 2700, openings: [{ id: 7, width: 900, height: 2100 }, { id: 8, width: 1200, height: 1200 }] });
ok(m.deductions === 1890000 + 1440000 && m.net === 13500000 - 3330000, 'a door and a window: 1 890 000 + 1 440 000 = 3 330 000 out');
m = wallSide({ length: 5000, height: 2700, gross: 15000000, openings: [{ area: 1000000 }] });
ok(m.gross === 15000000 && m.net === 14000000, 'a shaped wall: its real face (given) wins over length x height; an opening may be given as an area');
m = wallSide({ length: 1000, height: 1000, openings: [{ width: 100, height: 100 }, { width: 100, height: 100 }] });
ok(m.deductions === 20000, 'two openings without ids are two openings');
m = wallSide({});
ok(m.gross === 0 && m.net === 0, 'nothing in, nothing out');

console.log('== outlines with cut-outs');
m = outlineArea(20e6, [1e6, 0.5e6]);
ok(m.gross === 20e6 && m.deductions === 1.5e6 && m.net === 18.5e6, 'a 20 m2 floor with 1 m2 and 0.5 m2 openings: 18.5 m2 net');
ok(outlineArea(5, 2).net === 3 && outlineArea(5).net === 5, 'one cut-out as a number; none at all');
m = addMeasures([measure(10, 2), measure(20, 5), null]);
ok(m.gross === 30 && m.deductions === 7 && m.net === 23 && adds(m), 'measures add up: 30 gross, 7 out, 23 net');

console.log('== the faces of a wall type that carry a finish');
const L = (mat, fn, core = false, extra = {}) => ({ mat, t: 12, function: fn, core, kind: 'material', ...extra });
let f = finishFaces([L('siding', 'finish'), L('osb', 'substrate'), L('studs', 'structure', true), L('gypsum', 'finish')]);
ok(f.length === 2 && f[0].mat === 'siding' && f[0].side === 'exterior' && f[1].mat === 'gypsum' && f[1].side === 'interior' && f[1].index === 3, 'siding outside the core, gypsum inside it: two faces');
f = finishFaces([L('brick', 'finish'), { mat: 'air', t: 25, function: 'finish', kind: 'cavity', core: false }, L('block', 'structure', true), L('membrane', 'membrane', false, { t: 0 }), L('plaster', 'finish')]);
ok(f.length === 2 && f.map((x) => x.mat).join() === 'brick,plaster', 'a cavity and a membrane are not finishes');
ok(finishFaces([L('concrete', 'structure', true)]).length === 0 && finishFaces(null).length === 0, 'a bare structural wall has no finish; no layers, no faces');
ok(finishFaces([L('tile', 'finish', false, { t: 0 })]).length === 0, 'a finish with no thickness is not measured');

console.log('== a type\'s takeoff data');
let c = cleanTypeData({ unit: { name: ' Clay brick ', length: 222, height: 73, width: 106 }, mortar: { name: 'Class II', joint: 10 }, rate: { amount: 450, currency: 'zar', basis: 'm2' } });
ok(!c.errors.length && c.data.unit.name === 'Clay brick' && c.data.unit.length === 222 && c.data.mortar.joint === 10 && c.data.rate.currency === 'ZAR' && c.data.rate.basis === 'm2', 'a full entry is kept, name trimmed, currency in capitals', c);
ok(cleanTypeData(undefined).data === null && cleanTypeData({}).data === null && cleanTypeData({ unit: { name: '' }, mortar: {}, rate: {} }).data === null && !cleanTypeData({ unit: { name: '' } }).errors.length, 'nothing entered = no data, no error');
c = cleanTypeData({ unit: { name: 'Block' } });
ok(c.data && c.data.unit.name === 'Block' && c.data.unit.length === undefined && !c.data.rate, 'a name alone is enough; the rest stays absent');
const err = (i) => cleanTypeData(i).errors;
ok(err({ unit: { length: 200 } }).includes('unit_name'), 'a size without a name is refused');
ok(err({ unit: { name: 'B', length: NaN } }).includes('unit_size') && err({ unit: { name: 'B', height: -1 } }).includes('unit_size') && err({ unit: { name: 'B', width: 6000 } }).includes('unit_size') && err({ unit: { name: 'B', length: '222' } }).includes('unit_size'), 'a size that is not a length from 0 to 5000 mm is refused, never dropped (NaN, negative, too large, a text)');
ok(err({ mortar: { joint: 10 } }).includes('mortar_name') && err({ mortar: { name: 'M', joint: 500 } }).includes('mortar_joint'), 'mortar: a name is needed, the joint is 0 to 100 mm');
ok(err({ rate: { amount: 5, currency: 'rand', basis: 'm2' } }).includes('rate_currency') && err({ rate: { amount: -1, currency: 'USD', basis: 'm2' } }).includes('rate_amount') && err({ rate: { amount: 5, currency: 'USD', basis: 'yd2' } }).includes('rate_basis') && err({ rate: { currency: 'USD', basis: 'm2' } }).includes('rate_amount'), 'rate: amount 0 or more, a three-letter currency code, a known basis');
ok(err('x').includes('format') && err([1]).includes('format') && cleanTypeData({ rate: { amount: NaN, currency: 'USD', basis: 'm2' } }).data === null, 'a wrong shape is an error and gives no data');
ok(cleanTypeData({ mortar: { name: 'M', joint: 0 } }).data.mortar.joint === undefined, 'a joint of 0 means not given');
ok(RATE_BASES.join() === 'm2,ft2,m,ft,each', 'the five bases');

console.log('== rate times the measured quantity');
// net 11 610 000 mm2 = 11.61 m2; x 450 = 5224.50
ok(rateAmount({ amount: 450, currency: 'ZAR', basis: 'm2' }, { netArea: 11610000 }) === 5224.5, '450 per m2 x 11.61 m2 = 5224.50');
// 11 610 000 mm2 / 92 903.04 = 124.9690... ft2; x 4 = 499.876... → 499.88
ok(rateAmount({ amount: 4, currency: 'USD', basis: 'ft2' }, { netArea: 11610000 }) === 499.88, '4 per ft2 x 124.969 ft2 = 499.88');
ok(rateAmount({ amount: 30, currency: 'EUR', basis: 'm' }, { length: 18000 }) === 540 && rateAmount({ amount: 10, currency: 'USD', basis: 'ft' }, { length: 3048 }) === 100 && rateAmount({ amount: 75, currency: 'USD', basis: 'each' }, { count: 4 }) === 300, 'per metre, per foot, per wall');
ok(rateAmount(null, { netArea: 1 }) === null && rateAmount({ amount: 5, basis: 'acre' }, {}) === null, 'no rate, no amount');
ok(near(rateQuantity('ft2', { netArea: 92903.04 }), 1) && rateQuantity('m2', { netArea: 2e6 }) === 2 && rateQuantity('x', {}) === 0, 'the quantity a rate multiplies');
const d = cleanTypeData({ unit: { name: 'Clay brick', length: 222, height: 73, width: 106 }, mortar: { name: 'Class II', joint: 10 }, rate: { amount: 450, currency: 'ZAR', basis: 'm2' } }).data;
ok(unitText(d) === 'Clay brick, 222 mm x 73 mm x 106 mm' && mortarText(d) === 'Class II, 10 mm' && rateText(d.rate) === '450.00 ZAR / m²' && amountText(5224.5, 'ZAR') === '5224.50 ZAR', 'the readings for a table cell', [unitText(d), mortarText(d), rateText(d.rate)]);
ok(unitText(null) === '' && mortarText({}) === '' && rateText(null) === '' && amountText(null, 'USD') === '', 'nothing entered reads as empty');

console.log('== one copy, and the rule the apps show is the rule written here');
for (const app of ['bimcraft', 'takeoffcraft']) for (const file of ['rules.js', 'typedata.js']) {
  const a = fs.readFileSync(path.join(ROOT, 'lib/quantities', file)), p = path.join(ROOT, 'public_html/assets/apps', app, 'dev/quantities', file);
  ok(fs.existsSync(p) && fs.readFileSync(p).equals(a), app + '/dev/quantities/' + file + ' is byte-equal to lib/quantities/' + file);
}
const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/bimcraft/dev/lang/en.json'), 'utf8'));
for (const k of Object.keys(RULES)) ok(en['qty.rule.' + k] === RULES[k].text, 'BimCraft shows the "' + k + '" rule word for word (lang/en.json qty.rule.' + k + ')');
const src = (app, file) => fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev', file), 'utf8');
ok(/wallSide\(/.test(src('bimcraft', 'model-walls.js')) && /wallSide\(/.test(src('bimcraft', 'wall-shape.js')) && /outlineArea\(/.test(src('bimcraft', 'model-slabs.js')) && /outlineArea\(/.test(src('bimcraft', 'model-floors.js')), 'BimCraft\'s IFC quantity writers (walls, shaped walls, floors, ceilings, drawn floors) call the rule');
ok(/wallSide\(/.test(src('bimcraft', 'model-schedule.js')) && /outlineArea\(/.test(src('bimcraft', 'quantity-schedules.js')), 'BimCraft\'s schedules call the rule');
ok(/outlineArea\(/.test(src('takeoffcraft', 'geom.js')) && /wallSide\(/.test(src('takeoffcraft', 'model.js')), 'TakeoffCraft\'s area marks and wall areas call the rule');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
