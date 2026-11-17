#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0
/**
 * node lib/quantities/test/methods.test.mjs — measurement methods, junctions, reveals, bricks and mortar (BK.42; session
 * bk-measure-10). The older node lib/quantities/test/test.mjs is unchanged and still covers the default rule.
 *
 * NUMBERS WORKED OUT BY HAND (every expected value below comes from here):
 *
 *  A. Units per area of one leaf = 1 / ((L + j) x (H + j))
 *     UK brick 215 x 65 x 102.5, joint 10:   225 x 75 = 16 875 mm2  → 1e6 / 16 875 = 59.259259 per m2
 *     SA brick 222 x 73 x 106, joint 10:     232 x 83 = 19 256 mm2  → 1e6 / 19 256 = 51.931865 per m2
 *     US modular 7 5/8 x 2 1/4 x 3 5/8 in, joint 3/8 in:  8 x 2.625 = 21 in2 → 144 / 21 = 6.857143 per ft2
 *        (in mm: 193.675 x 57.15 x 92.075, joint 9.525)
 *  B. Unit widths across a leaf = round((leaf + j) / (W + j)), at least 1
 *     UK: leaf 102.5 → 112.5 / 112.5 = 1;   leaf 215 → 225 / 112.5 = 2;   leaf 327.5 → 337.5 / 112.5 = 3
 *     SA: leaf 222 → 232 / 116 = 2;   leaf 106 → 1;   a 90 mm leaf of 106 bricks → 100 / 116 = 0.86 → 1 (at least 1)
 *  C. A UK half-brick wall, net 10 m2 (10 000 000 mm2):
 *     units        = 59.259259 x 1 x 10 = 592.59259
 *     with 5% waste = 622.22222 → 623 to order;  with no waste → 593 to order
 *     leaf volume  = 10 000 000 x 102.5 = 1 025 000 000 mm3
 *     one unit     = 215 x 65 x 102.5 = 1 432 437.5 mm3;  x 592.59259 = 848 851 851.85 mm3
 *     mortar       = 1 025 000 000 - 848 851 851.85 = 176 148 148.15 mm3 (0.176148 m3)
 *     with 20% extra for frogs: x 1.2 = 211 377 777.78;  and a 15% method allowance: x 1.15 = 243 084 444.44
 *  D. A UK one-brick wall (215), net 10 m2:
 *     units  = 59.259259 x 2 x 10 = 1 185.18519 → 1186 to order
 *     mortar = 10 000 000 x 215 - 1 185.18519 x 1 432 437.5 = 2 150 000 000 - 1 697 703 703.70 = 452 296 296.30 mm3
 *  E. A cavity wall: brick leaf 102.5, cavity 50, brick leaf 102.5, plaster 13; both leaves flagged; net 10 m2:
 *     units = 2 x 592.59259 = 1 185.18519;  mortar = 2 x 176 148 148.15 = 352 296 296.30 mm3 (the cavity and plaster add nothing)
 *  F. Rates on C with 5% waste (623 units, mortar 176 148 148.15 mm3 = 0.17614815 m3):
 *     0.85 per unit x 623 = 529.55;   850 per 1000 x 0.623 = 529.55;   1200 per m3 x 0.17614815 = 211.377778 → 211.38
 *  G. Smallest opening deducted (a wall 5000 x 2700 = 13 500 000 mm2 with four openings):
 *     door 900 x 2100 = 1 890 000 (1.89 m2) · window 1200 x 1200 = 1 440 000 (1.44) · window 1000 x 500 = 500 000 (exactly 0.5)
 *     · vent 300 x 300 = 90 000 (0.09)
 *     default and BIA TN 10 (all deducted):           3 920 000 out, net 9 580 000
 *     NRM 2 and AAQS masonry (0.5 m2 or less stays):  1 890 000 + 1 440 000 = 3 330 000 out, net 10 170 000; two stay (590 000)
 *     IS 1200 brickwork (0.1 m2 or less stays):       3 830 000 out, net 9 670 000; one stays (90 000)
 *     NRM 2 finishes (1 m2 or less stays):            3 330 000 out (door and the 1.44 window)
 *     an office file "less than 0.5 m2 stays" (not inclusive): the exact 0.5 m2 window IS deducted: 3 830 000 out
 *     an office file "under 100 ft2 stays" (9.290304 m2): nothing here is deducted
 *  H. Junctions (thickness: through wall 200, abutting wall 100; all 2700 high unless said):
 *     T, the abutting wall ends on the through wall's centre line: it loses 200 / 2 = 100 mm, 100 x 2700 = 270 000 mm2 (both modes)
 *     T, the abutting wall ends on the through wall's face (100 from the centre line): loses nothing
 *     T at 45 degrees: 100 / sin 45 = 141.4214 mm
 *     T against a lower through wall (2400): 100 x 2400 = 240 000 mm2
 *     corner of two 200 walls: 'overlap' nothing; 'face' each loses 100 mm (270 000 mm2)
 *     a through wall drawn as two pieces with a third ending on their meeting point: the third loses 100 in both modes (a T)
 *     crossing, 200 wall and 100 wall: 'overlap' the 100 wall loses 200 mm; 'face' the 200 wall loses 100 and the 100 wall 200
 *  I. Reveals (wall 230 thick → depth 115; door 900 x 2100, window 1200 x 1200, both deducted):
 *     door girth = 2 x 2100 + 900 = 5100;  window girth = 2 x 1200 + 2 x 1200 = 4800;  together 9900 mm
 *     as an area: 9900 x 115 = 1 138 500 mm2;  as a length (depth 115 is no more than 300): 9900 mm
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RULES, RULE_VERSION, wallSide, outlineArea, deducts } from '../rules.js';
import * as M from '../methods.js';
import { PACKS } from '../method-packs.js';
import { junctionCuts, cutFor } from '../junctions.js';
import { masonryOf, masonryLeaves, unitsPerArea, widthsAcross, PER_M2, PER_FT2 } from '../masonry.js';
import { cleanTypeData, rateAmount, rateQuantity, rateText, RATE_BASES, MASONRY_BASES, ALL_BASES } from '../typedata.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
let pass = 0, fail = 0;
const ok = (c, label, detail = '') => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + label + (!c && detail !== '' ? ' (' + JSON.stringify(detail) + ')' : '')); };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e * Math.max(1, Math.abs(b));
const MM = { m2: 1e6, mm: 1 };
const B = Object.fromEntries(M.builtinMethods().map((m) => [m.id, m]));
const rule = (id, q = 'wall.side', u = MM) => M.methodRule(B[id], q, u);

console.log('== the shipped packs');
ok(RULE_VERSION === 1, 'the default rule did not change: RULE_VERSION is still 1');
ok(PACKS.length === 5 && M.builtinMethods().length === 5 && PACKS.every((p) => M.cleanMethod(p).errors.length === 0), 'five packs, every one valid by the format\'s own check', PACKS.map((p) => M.cleanMethod(p).errors));
ok(M.builtinMethods()[0].id === M.DEFAULT_METHOD && M.defaultMethod().id === 'cadcraft-default', 'the CadCraft default comes first');
ok(M.builtinMethods().every((m) => m.review.state === 'unchecked'), 'every shipped pack says: unchecked by a quantity surveyor');
ok(M.builtinMethods().every((m) => /^\d{4}-\d{2}-\d{2}$/.test(m.source.read) && m.source.title && (m.id === 'cadcraft-default' || (/^https:\/\//.test(m.source.url) && m.source.edition && m.source.publisher))), 'every pack names its source: title, publisher, edition, link, date read');
{
  const stated = [];
  for (const m of M.builtinMethods()) { for (const q of Object.values(m.quantities)) for (const f of Object.values(q)) if (f.state === 'stated') stated.push(f.clause); for (const f of Object.values(m.masonry)) if (f.state === 'stated') stated.push(f.clause); }
  ok(stated.length > 20 && stated.every((c) => c.length > 5), 'every stated value names the clause it was read from (' + stated.length + ' values)');
}
ok(!/—/.test(JSON.stringify(PACKS)) && !/—/.test(JSON.stringify(M.TEXT)), 'plain wording, no em dashes');
ok(Object.isFrozen(B['rics-nrm2-2021']) && M.findMethod('rics-nrm2-2021') === B['rics-nrm2-2021'] && M.findMethod('nope') === null, 'findMethod by id; an unknown id is null');

console.log('== each pack, value by value (the report lists these with their clauses)');
{
  const d = rule('cadcraft-default');
  ok(d.minArea === 0 && d.junction === 'centre' && !rule('cadcraft-default', 'finish.wall').reveals.measured && !d.fallback.length, 'default: every opening deducted, centre line, reveals not measured');
  let r = rule('rics-nrm2-2021');
  ok(r.minArea === 500000 && r.inclusive === true && r.junction === 'centre' && !r.fallback.length, 'NRM 2 masonry: 0.50 m2 or less is not deducted; walls on the centre line', r);
  r = rule('rics-nrm2-2021', 'finish.wall');
  ok(r.minArea === 1e6 && r.inclusive && !r.reveals.measured && r.fallback.join() === 'junctions,reveals', 'NRM 2 finishes: 1 m2 or less is not deducted; junctions and reveals not confirmed (default used)', r);
  ok(rule('rics-nrm2-2021', 'finish.ceiling').minArea === 1e6 && rule('rics-nrm2-2021', 'floor').minArea === 0 && rule('rics-nrm2-2021', 'floor').fallback.join() === 'openings', 'NRM 2 ceilings 1 m2; floors not confirmed');
  let ms = M.methodMasonry(B['rics-nrm2-2021']);
  ok(ms.unit === 'm2' && ms.wastePct === null && ms.allowancePct === 0, 'NRM 2 masonry in m2; no waste percentage, no mortar allowance stated', ms);
  r = rule('aaqs-africa-2015');
  ok(r.minArea === 500000 && r.inclusive && r.fallback.join() === 'junctions', 'AAQS masonry: not exceeding 0.5 m2 is not deducted; junctions not confirmed', r);
  ok(rule('aaqs-africa-2015', 'finish.wall').minArea === 500000 && rule('aaqs-africa-2015', 'finish.ceiling').minArea === 500000, 'AAQS plaster and paint: 0.5 m2, walls and ceilings');
  ms = M.methodMasonry(B['aaqs-africa-2015']);
  ok(ms.unit === 'm2' && ms.wastePct === 0 && ms.allowancePct === 0, 'AAQS: m2; measured net with no allowance for waste (0%)', ms);
  r = rule('is-1200-1976');
  ok(r.minArea === 100000 && r.inclusive, 'IS 1200 brickwork: openings up to 0.1 m2 are not deducted', r);
  r = rule('is-1200-1976', 'finish.wall');
  ok(r.minArea === 0 && r.unheld.join() === 'openings,reveals' && r.fallback.join() === 'junctions', 'IS 1200 plaster: its three bands are not held by the format, the default is used and said so', r);
  ok(M.methodMasonry(B['is-1200-1976']).unit === 'm3', 'IS 1200 brickwork is generally in m3');
  r = rule('us-bia-tn10-2009');
  ok(r.minArea === 0 && r.fallback.join() === 'junctions', 'BIA TN 10: net wall area, every opening deducted', r);
  ms = M.methodMasonry(B['us-bia-tn10-2009']);
  ok(ms.unit === 'number' && ms.wastePct === 5 && ms.allowancePct === 15, 'BIA TN 10: brick waste 5%, mortar 15% (the low end of 15 to 25)', ms);
}

console.log('== the caller\'s units');
ok(near(M.methodRule(B['rics-nrm2-2021'], 'wall.side', { m2: 1 / 0.09290304, mm: 1 / 304.8 }).minArea, 5.381955208), '0.5 m2 in square feet: 0.5 / 0.09290304 = 5.381955');
ok(M.methodRule(B['rics-nrm2-2021'], 'wall.side').minArea === 0.5, 'no units given: m2');

console.log('== G. the smallest opening deducted, a wall 5000 x 2700 with four openings');
const OPEN = [{ id: 1, width: 900, height: 2100 }, { id: 2, width: 1200, height: 1200 }, { id: 3, width: 1000, height: 500 }, { id: 4, width: 300, height: 300 }];
const side = (r) => wallSide({ length: 5000, height: 2700, openings: OPEN, rule: r });
let m = wallSide({ length: 5000, height: 2700, openings: OPEN });
ok(m.gross === 13500000 && m.deductions === 3920000 && m.net === 9580000 && m.notDeducted === undefined, 'no rule (the default): 3 920 000 out, net 9 580 000, the three numbers only');
for (const [id, ded, kept, keptA] of [['us-bia-tn10-2009', 3920000, 0, 0], ['rics-nrm2-2021', 3330000, 2, 590000], ['aaqs-africa-2015', 3330000, 2, 590000], ['is-1200-1976', 3830000, 1, 90000]]) {
  m = side(rule(id));
  ok(m.gross === 13500000 && m.deductions === ded && m.net === 13500000 - ded && m.notDeducted === kept && m.notDeductedArea === keptA && m.deducted === 4 - kept, id + ': ' + ded + ' out, net ' + (13500000 - ded) + ', ' + kept + ' left in', m);
}
m = wallSide({ length: 5000, height: 2700, openings: OPEN, rule: rule('rics-nrm2-2021', 'finish.wall') });
ok(m.deductions === 3330000 && m.notDeducted === 2, 'NRM 2 finishes (1 m2): the door and the 1.44 m2 window are deducted');
const office = (over) => ({ format: M.METHOD_FORMAT, version: 1, id: 'office-test', name: 'Office test', region: '', source: { title: 'Office measuring notes', publisher: 'Test office', edition: '2026', url: '', read: '2026-11-11' }, review: { state: 'unchecked' }, quantities: {}, masonry: {}, ...over });
const clean = (o) => { const r = M.cleanMethod(o); if (!r.method) throw new Error(r.errors.join()); return r.method; };
let off = clean(office({ quantities: { 'wall.side': { openings: { state: 'stated', clause: 'note 1', minArea: 0.5, unit: 'm2', inclusive: false } } } }));
m = side(M.methodRule(off, 'wall.side', MM));
ok(m.deductions === 3830000 && m.notDeducted === 1, '"less than 0.5 m2 stays" (not inclusive): the exact 0.5 m2 window is deducted');
off = clean(office({ quantities: { 'wall.side': { openings: { state: 'stated', clause: 'note 1', minArea: 100, unit: 'ft2', inclusive: false } } } }));
m = side(M.methodRule(off, 'wall.side', MM));
ok(near(M.methodRule(off, 'wall.side', MM).minArea, 9290304) && m.deductions === 0 && m.net === 13500000 && m.notDeducted === 4, '"under 100 ft2 stays" = 9 290 304 mm2: nothing here is deducted');
ok(deducts(500000, { minArea: 500000, inclusive: true }) === false && deducts(500000, { minArea: 500000, inclusive: false }) === true && deducts(500080, { minArea: 500000, inclusive: true }) === false && deducts(500200, { minArea: 500000, inclusive: true }) === true && deducts(1, { minArea: 0 }) === true && deducts(1, null) === true,
  'the edge: exactly the minimum follows `inclusive`; within 2 parts in 10 000 of it counts as exactly it; no minimum deducts everything');
m = wallSide({ length: 5000, height: 2700, openings: [OPEN[2], OPEN[2]], rule: rule('rics-nrm2-2021') });
ok(m.notDeducted === 1 && m.deductions === 0, 'the same opening listed twice is still one opening');
m = outlineArea(20e6, [0.8e6, 1.5e6, 1e6], rule('rics-nrm2-2021', 'finish.ceiling'));
ok(m.deductions === 1.5e6 && m.net === 18.5e6, 'a ceiling under NRM 2: cut-outs of 0.8 and 1.0 m2 stay, 1.5 m2 is deducted');
ok(outlineArea(20e6, [0.8e6, 1.5e6]).deductions === 2.3e6, 'the same ceiling by the default: both deducted');

console.log('== H. junctions');
const wl = (id, a, b, t, height = 2700, extra = {}) => ({ id, a, b, t, height, ...extra });
let c = junctionCuts([wl('X', [0, 0], [6000, 0], 200), wl('W', [3000, 0], [3000, 4000], 100)]);
ok(near(c.get('W').overlap.length, 100) && near(c.get('W').overlap.area, 270000) && near(c.get('W').face.area, 270000) && c.get('X').face.length === 0 && c.get('W').ends[0].kind === 'tee', 'a T on the centre line: the abutting wall loses 100 mm, 270 000 mm2, in both modes; the through wall nothing', c.get('W'));
c = junctionCuts([wl('X', [0, 0], [6000, 0], 200), wl('W', [3000, 100], [3000, 4000], 100)]);
ok(c.get('W').face.length === 0 && c.get('W').overlap.length === 0, 'a T drawn to the face: nothing to take off');
c = junctionCuts([wl('X', [0, 0], [6000, 0], 200), wl('W', [3000, 0], [5000, 2000], 100)]);
ok(near(c.get('W').overlap.length, 141.4213562, 1e-6), 'a T at 45 degrees: 100 / sin 45 = 141.42 mm', c.get('W').overlap.length);
c = junctionCuts([wl('X', [0, 0], [6000, 0], 200, 2400), wl('W', [3000, 0], [3000, 4000], 100, 2700)]);
ok(near(c.get('W').overlap.area, 240000), 'against a lower wall the lower height counts: 100 x 2400 = 240 000');
c = junctionCuts([wl('A', [0, 0], [5000, 0], 200), wl('B', [5000, 0], [5000, 4000], 200)]);
ok(c.get('A').overlap.length === 0 && c.get('B').overlap.length === 0 && near(c.get('A').face.length, 100) && near(c.get('B').face.area, 270000) && c.get('A').ends[0].kind === 'corner', 'a corner: nothing by overlap; to the face each wall loses 100 mm');
c = junctionCuts([wl('X1', [0, 0], [3000, 0], 200), wl('X2', [3000, 0], [6000, 0], 200), wl('W', [3000, 0], [3000, 4000], 100)]);
ok(near(c.get('W').overlap.length, 100) && c.get('W').ends[0].kind === 'tee' && c.get('X1').overlap.length === 0, 'a through wall in two pieces: the third wall is still a T (loses 100 by overlap)', c.get('W'));
c = junctionCuts([wl('A', [0, 0], [6000, 0], 200), wl('B', [3000, -2000], [3000, 2000], 100)]);
ok(c.get('A').overlap.length === 0 && near(c.get('B').overlap.length, 200) && near(c.get('A').face.length, 100) && near(c.get('B').face.length, 200), 'crossing walls: by overlap the thinner loses 200; to the face 100 and 200');
c = junctionCuts([wl('A', [0, 0], [6000, 0], 200), wl('B', [3000, -2000], [3000, 2000], 200)]);
ok(c.get('A').overlap.length === 0 && near(c.get('B').overlap.length, 200), 'crossing walls of one thickness: the later one in the list loses');
c = junctionCuts([wl('X', [0, 0], [6000, 0], 200), wl('W', [3000, 0], [3000, 4000], 100, 2700, { curved: true }), wl('P', [0, 1000], [6000, 1100], 100)]);
ok(c.get('W').face.length === 0 && c.get('P').face.length === 0 && c.get('X').face.length === 0, 'a curved wall is not looked at; walls that do not touch have no junction');
ok(cutFor(c, 'X', 'centre').area === 0 && cutFor(null, 'X', 'face').area === 0 && cutFor(c, 'nobody', 'face').length === 0, 'centre line, no cuts, or an unknown wall: nothing taken off');
c = junctionCuts([wl('X', [0, 0], [6000, 0], 200), wl('W', [3000, 0], [3000, 4000], 100)]);
m = wallSide({ length: 4000, height: 2700, openings: [{ width: 900, height: 2100 }], rule: { minArea: 0, inclusive: true }, cut: cutFor(c, 'W', 'overlap').area });
ok(m.gross === 4000 * 2700 - 270000 && m.junctions === 270000 && m.deductions === 1890000 && m.net === m.gross - 1890000, 'a wall measured to the face: gross 10 800 000 - 270 000 = 10 530 000, then the door out; still gross - deductions = net', m);

console.log('== I. reveals');
const RV = [{ kind: 'door', width: 900, height: 2100 }, { kind: 'window', width: 1200, height: 1200 }];
let rv = M.revealsOf({ openings: RV, depth: 115, rule: { minArea: 0, inclusive: true, reveals: { measured: true, linearUpTo: 0 } } });
ok(rv.area === 1138500 && rv.length === 0 && rv.n === 2, 'as an area: (5100 + 4800) x 115 = 1 138 500 mm2', rv);
rv = M.revealsOf({ openings: RV, depth: 115, rule: { minArea: 0, inclusive: true, reveals: { measured: true, linearUpTo: 300 } } });
ok(rv.length === 9900 && rv.area === 0, 'no deeper than 300 mm: a length, 9900 mm');
rv = M.revealsOf({ openings: RV, depth: 115, rule: { minArea: 1.5e6, inclusive: true, reveals: { measured: true, linearUpTo: 300 } } });
ok(rv.length === 5100 && rv.n === 1, 'an opening that is not deducted has no reveal measured (only the door: 5100)');
ok(M.revealsOf({ openings: RV, depth: 115, rule: { minArea: 0, reveals: { measured: false, linearUpTo: 0 } } }).area === 0 && M.revealsOf({ openings: RV, depth: 115, rule: null }).length === 0, 'not measured by the method, or no method: nothing');

console.log('== A to F. bricks, blocks and mortar');
const UK = { unit: { name: 'Brick', length: 215, height: 65, width: 102.5 }, mortar: { name: 'M4', joint: 10 } };
const SA = { unit: { name: 'Clay brick', length: 222, height: 73, width: 106 }, mortar: { name: 'Class II', joint: 10 } };
const US = { unit: { name: 'Modular', length: 193.675, height: 57.15, width: 92.075 }, mortar: { name: 'Type N', joint: 9.525 } };
ok(near(unitsPerArea(UK.unit, 10) * PER_M2, 59.2592593, 1e-8) && near(unitsPerArea(SA.unit, 10) * PER_M2, 51.9318654, 1e-8) && near(unitsPerArea(US.unit, 9.525) * PER_FT2, 6.8571429, 1e-8), 'A. units per area: UK 59.259 per m2, SA 51.932 per m2, US modular 6.857 per ft2', [unitsPerArea(UK.unit, 10) * PER_M2, unitsPerArea(SA.unit, 10) * PER_M2, unitsPerArea(US.unit, 9.525) * PER_FT2]);
ok(unitsPerArea({ length: 215 }, 10) === 0 && unitsPerArea(null) === 0 && masonryOf({ data: { unit: { name: 'B' } }, layers: [], netArea: 1 }) === null, 'no length or no height: nothing is counted');
ok(widthsAcross(102.5, UK.unit, 10) === 1 && widthsAcross(215, UK.unit, 10) === 2 && widthsAcross(327.5, UK.unit, 10) === 3 && widthsAcross(222, SA.unit, 10) === 2 && widthsAcross(106, SA.unit, 10) === 1 && widthsAcross(90, SA.unit, 10) === 1 && widthsAcross(300, { length: 1 }, 10) === 1, 'B. unit widths across a leaf: 1, 2, 3; SA 2 and 1; at least 1; 1 without a unit width');
const leaf = (t, extra = {}) => ({ mat: 'brick', t, function: 'structure', core: true, kind: 'material', ...extra });
let r = masonryOf({ data: UK, layers: [leaf(102.5)], netArea: 10e6, waste: { pct: 5 } });
ok(near(r.unitsNet, 592.592593, 1e-8) && r.wastePct === 5 && r.wasteFrom === 'method' && near(r.units, 622.222222, 1e-8) && r.unitsOrder === 623 && near(r.mortar, 176148148.15, 1e-9) && r.assumedLeaves === true, 'C. half-brick wall, 10 m2, 5% from the method: 592.59 units, 623 to order, mortar 176 148 148 mm3; the core was taken as the leaf', r);
r = masonryOf({ data: UK, layers: [leaf(102.5, { masonry: true })], netArea: 10e6 });
ok(r.unitsOrder === 593 && r.wastePct === 0 && r.wasteFrom === 'none' && r.assumedLeaves === false, 'C. with no waste anywhere: 0% and 593 to order; a flagged leaf is not an assumption');
r = masonryOf({ data: { ...UK, unit: { ...UK.unit, waste: 0 } }, layers: [leaf(102.5)], netArea: 10e6, waste: { pct: 5 } });
ok(r.unitsOrder === 593 && r.wasteFrom === 'type', 'a waste of 0 entered on the type wins over the method\'s 5%');
r = masonryOf({ data: { ...UK, unit: { ...UK.unit, waste: 10 } }, layers: [leaf(102.5)], netArea: 10e6, waste: { pct: 5 } });
ok(near(r.units, 651.851852, 1e-8) && r.unitsOrder === 652, 'the type\'s own 10% wins: 592.59 x 1.1 = 651.85 → 652');
r = masonryOf({ data: { ...UK, mortar: { ...UK.mortar, extra: 20 } }, layers: [leaf(102.5)], netArea: 10e6, allowance: 15 });
ok(near(r.mortar, 243084444.44, 1e-9) && r.extraPct === 20 && r.allowancePct === 15, 'C. mortar with 20% extra for frogs and a 15% method allowance: 243 084 444 mm3', r.mortar);
r = masonryOf({ data: UK, layers: [leaf(215)], netArea: 10e6 });
ok(r.leaves[0].across === 2 && near(r.unitsNet, 1185.185185, 1e-8) && r.unitsOrder === 1186 && near(r.mortar, 452296296.30, 1e-9), 'D. one-brick wall: two unit widths across, 1185.19 units, mortar 452 296 296 mm3', r);
const cavity = [leaf(102.5, { masonry: true, core: false, function: 'finish' }), { mat: 'air', t: 50, function: 'insulation', core: false, kind: 'cavity' }, leaf(102.5, { masonry: true }), { mat: 'plaster', t: 13, function: 'finish', core: false, kind: 'material' }];
r = masonryOf({ data: UK, layers: cavity, netArea: 10e6 });
ok(r.leaves.length === 2 && r.leaves.map((l) => l.index).join() === '0,2' && near(r.unitsNet, 1185.185185, 1e-8) && near(r.mortar, 352296296.30, 1e-9), 'E. cavity wall: two leaves counted, the cavity and the plaster add nothing: 1185.19 units, 352 296 296 mm3', r);
ok(masonryLeaves(cavity).length === 2 && masonryLeaves([leaf(100), { mat: 'air', t: 50, kind: 'cavity', core: true }]).map((l) => l.assumed).join() === 'true' && masonryLeaves(null).length === 0, 'flagged layers are the leaves; none flagged: the core\'s material layers, marked as assumed');
r = masonryOf({ data: { unit: { name: 'Block', length: 390, height: 190 }, mortar: { name: 'M', joint: 10 } }, layers: [leaf(140)], netArea: 10e6 });
ok(near(r.unitsNet, 125, 1e-9) && r.mortar === null && r.leaves[0].across === 1, 'a block with no width given: 1e6 / (400 x 200) = 12.5 per m2, 125 units, no mortar volume');
r = masonryOf({ data: US, layers: [leaf(92.075)], netArea: 100 * PER_FT2, waste: { pct: 5 }, allowance: 15 });
ok(near(r.unitsNet, 685.714286, 1e-8) && r.unitsOrder === 720, 'US modular, 100 ft2: 685.71 units (the table in BIA TN 10 says 675: it uses the 2 2/3 in nominal height); + 5% = 720', r.unitsNet);

console.log('== F. the type\'s data and the rate');
let cdt = cleanTypeData({ unit: { name: 'Brick', length: 215, height: 65, width: 102.5, waste: 5 }, mortar: { name: 'M4', joint: 10, extra: 20 }, rate: { amount: 850, currency: 'gbp', basis: 'k' } });
ok(!cdt.errors.length && cdt.data.unit.waste === 5 && cdt.data.mortar.extra === 20 && cdt.data.rate.basis === 'k', 'waste, extra mortar and a rate per 1000 are kept', cdt);
ok(cleanTypeData({ unit: { name: 'B', waste: 0 } }).data.unit.waste === 0 && cleanTypeData({ unit: { name: 'B' } }).data.unit.waste === undefined && cleanTypeData({ mortar: { name: 'M', extra: 0 } }).data.mortar.extra === undefined, 'a waste of 0 is a value; none entered stays absent; extra 0 means none');
const err = (i) => cleanTypeData(i).errors;
ok(err({ unit: { name: 'B', waste: 101 } }).includes('unit_waste') && err({ unit: { name: 'B', waste: NaN } }).includes('unit_waste') && err({ unit: { name: 'B', waste: '5' } }).includes('unit_waste') && err({ mortar: { name: 'M', extra: 301 } }).includes('mortar_extra') && err({ mortar: { name: 'M', extra: -1 } }).includes('mortar_extra') && err({ unit: { waste: 5 } }).includes('unit_name'), 'waste 0 to 100, extra 0 to 300, numbers only, refused not dropped');
ok(RATE_BASES.join() === 'm2,ft2,m,ft,each' && MASONRY_BASES.join() === 'unit,k,m3' && ALL_BASES.length === 8, 'the five bases as before, and three more for masonry');
ok(rateAmount({ amount: 0.85, currency: 'GBP', basis: 'unit' }, { units: 623 }) === 529.55 && rateAmount({ amount: 850, currency: 'GBP', basis: 'k' }, { units: 623 }) === 529.55 && rateAmount({ amount: 1200, currency: 'GBP', basis: 'm3' }, { mortar: 176148148.15 }) === 211.38, 'F. 0.85 a unit x 623 = 529.55; 850 per 1000 x 0.623 = 529.55; 1200 per m3 x 0.176148 = 211.38');
ok(rateQuantity('unit', {}) === 0 && rateText({ amount: 850, currency: 'GBP', basis: 'k' }) === '850.00 GBP / 1000 units' && rateText({ amount: 1200, currency: 'GBP', basis: 'm3' }) === '1200.00 GBP / m³ mortar', 'the readings of the new bases');

console.log('== an office\'s own method file');
const good = office({ quantities: { 'wall.side': { openings: { state: 'stated', clause: 'Office rule 3', minArea: 0.25, unit: 'm2' }, junctions: { state: 'stated', clause: 'Office rule 4', mode: 'face' } }, 'finish.wall': { reveals: { state: 'stated', clause: 'Office rule 7', measured: true, linearUpTo: 300 } } }, masonry: { waste: { state: 'stated', clause: 'Office rule 9', pct: 7.5 } } });
let rf = M.readMethodFile(JSON.stringify(good));
ok(rf.method && rf.method.id === 'office-test' && M.methodRule(rf.method, 'wall.side', MM).junction === 'face' && M.methodRule(rf.method, 'finish.wall', MM).reveals.linearUpTo === 300 && M.methodMasonry(rf.method).wastePct === 7.5, 'a valid file is read: 0.25 m2, to the face, reveals as a length up to 300 mm, 7.5% waste', rf);
ok(JSON.stringify(M.cleanMethod(JSON.parse(JSON.stringify(rf.method))).method) === JSON.stringify(rf.method), 'a cleaned pack reads back the same (it is what the project file keeps)');
ok(M.findMethod('office-test', [rf.method]) === rf.method && M.findMethod('office-test') === null, 'an office pack is found only where it was loaded');
const bad = (o) => M.cleanMethod(o).errors;
ok(M.readMethodFile('{not json').errors.join() === 'json' && M.readMethodFile('x'.repeat(70000)).errors.join() === 'size' && bad({ ...good, format: 'x' }).join() === 'format' && bad({ ...good, version: 2 }).join() === 'version' && bad(null).join() === 'format', 'not JSON, too large, another format, another version: refused');
ok(M.readMethodFile(JSON.stringify({ ...good, id: 'rics-nrm2-2021' })).errors.join() === 'id.taken', 'a file may not take the id of a shipped method');
ok(bad({ ...good, id: 'Has Spaces' }).includes('id') && bad({ ...good, name: '' }).includes('name') && bad({ ...good, source: { ...good.source, read: 'yesterday' } }).includes('source.read') && bad({ ...good, source: { ...good.source, url: 'javascript:alert(1)' } }).includes('source.url') && bad({ ...good, source: { ...good.source, title: '' } }).includes('source.title'), 'a wrong id, no name, a date that is not a date, a link that is not https, no source title: each named');
ok(bad({ ...good, quantities: { 'wall.side': { openings: { state: 'stated', clause: '', minArea: 0.5 } } } }).includes('wall.side.openings.clause'), 'a stated value with no clause is refused');
ok(bad({ ...good, quantities: { 'wall.side': { openings: { state: 'stated', clause: 'c', minArea: -1 } } } }).includes('wall.side.openings.minArea') && bad({ ...good, quantities: { 'wall.side': { openings: { state: 'stated', clause: 'c', minArea: 1, unit: 'yd2' } } } }).includes('wall.side.openings.unit') && bad({ ...good, quantities: { 'wall.side': { junctions: { state: 'stated', clause: 'c', mode: 'guess' } } } }).includes('wall.side.junctions.mode') && bad({ ...good, quantities: { 'wall.side': { openings: { state: 'maybe' } } } }).includes('wall.side.openings.state'), 'a negative size, an unknown unit, an unknown junction mode, an unknown state: each named');
ok(bad({ ...good, quantities: { roof: {} } }).includes('quantities.roof') && bad({ ...good, quantities: { floor: { reveals: { state: 'not-stated' } } } }).includes('floor.reveals') && bad({ ...good, masonry: { bricks: {} } }).includes('masonry.bricks') && bad({ ...good, masonry: { waste: { state: 'stated', clause: 'c', pct: 500 } } }).includes('masonry.waste.pct'), 'an unknown quantity or field is an error, never dropped silently');
ok(bad({ ...good, review: { state: 'checked' } }).includes('review.by') && M.cleanMethod({ ...good, review: { state: 'checked', by: 'A. Surveyor', date: '2026-12-01' } }).method.review.by === 'A. Surveyor' && bad({ ...good, review: { state: 'approved' } }).includes('review.state'), '"checked" needs a name and a date');
{
  const nc = clean(office({ quantities: { 'wall.side': { openings: { state: 'not-confirmed', clause: '', minArea: 99 } } } }));
  ok(nc.quantities['wall.side'].openings.minArea === undefined && M.methodRule(nc, 'wall.side', MM).minArea === 0 && M.methodRule(nc, 'wall.side', MM).fallback.join() === 'openings', 'a value on a field that is not stated is never used: the default applies and the field is listed');
}

console.log('== the words');
ok(M.methodRuleText(B['cadcraft-default'], 'wall.side') === RULES['wall.side'].text && M.methodRuleText(null, 'floor') === RULES.floor.text && M.methodRuleText(B['cadcraft-default'], 'x') === '', 'the default method\'s text is the rule of rules.js, word for word');
let tx = M.methodRuleText(B['rics-nrm2-2021'], 'wall.side');
ok(/larger than 0\.5 m²/.test(tx) && /An opening of 0\.5 m² or less is not deducted/.test(tx) && /Read from: NRM 2, Work section 14 Masonry, items 1 to 3, note 6/.test(tx) && /^Gross: .+ Deductions: .+ Net: gross less deductions/.test(tx), 'NRM 2 walls: the size, and the clause it was read from', tx);
tx = M.methodRuleText(B['is-1200-1976'], 'finish.wall');
ok(/cannot hold yet, so the CadCraft default is used for: the smallest opening deducted, reveals/.test(tx) && /Not confirmed from the source, so the CadCraft default is used for: how wall junctions are measured/.test(tx), 'IS 1200 finishes: says what is not held and what is not confirmed', tx);
tx = M.methodRuleText(rf.method, 'wall.side');
ok(/Every wall end that meets another wall is measured to the near face/.test(tx) && /larger than 0\.25 m²/.test(tx), 'an office method to the face: the junction sentence is in the rule');
ok(/measured by their girth: as a length when no deeper than 300 mm/.test(M.methodRuleText(rf.method, 'finish.wall')), 'reveals as a length up to 300 mm, in words');
let ln = M.methodLine(B['rics-nrm2-2021']);
ok(ln === 'Measurement method: RICS NRM 2 (United Kingdom). Source: NRM 2: Detailed measurement for building works, 2nd edition, October 2021, Royal Institution of Chartered Surveyors (RICS); read 2026-11-11. Unchecked by a quantity surveyor.', 'the line that names a method: name, source, edition, publisher, date read, review state', ln);
ok(M.methodLine(B['cadcraft-default']) === 'Measurement method: CadCraft default (every opening deducted).' && /Loaded from an office file\. Unchecked by a quantity surveyor\.$/.test(M.methodLine(rf.method)), 'the default is named plainly; an office file is said to be one');
ok(/Waste on units from the method: 5%/.test(M.methodMasonryText(B['us-bia-tn10-2009'])) && /Mortar allowance from the method: 15%/.test(M.methodMasonryText(B['us-bia-tn10-2009'])) && /states no waste on units: 0%/.test(M.methodMasonryText(B['rics-nrm2-2021'])) && /worked out by CadCraft/.test(M.methodMasonryText(B['cadcraft-default'])), 'what a method says about masonry, in words');
const custom = M.methodLine(B['rics-nrm2-2021'], (k, p) => '[' + k + (p?.name ? ':' + p.name : '') + ']');
ok(custom === '[line:RICS NRM 2 (United Kingdom)] [line.source] [review.unchecked]', 'the words go through the host\'s own translator when it gives one');

console.log('== one copy, and the apps hold the same words');
for (const app of ['bimcraft', 'takeoffcraft']) for (const file of ['rules.js', 'typedata.js', 'methods.js', 'method-packs.js', 'junctions.js', 'masonry.js']) {
  const a = fs.readFileSync(path.join(ROOT, 'lib/quantities', file)), p = path.join(ROOT, 'public_html/assets/apps', app, 'dev/quantities', file);
  ok(fs.existsSync(p) && fs.readFileSync(p).equals(a), app + '/dev/quantities/' + file + ' is byte-equal to lib/quantities/' + file);
}
const lang = (app) => JSON.parse(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev/lang/en.json'), 'utf8'));
const bim = lang('bimcraft'), tc = lang('takeoffcraft');
ok(Object.keys(M.TEXT).every((k) => bim['qty.m.' + k] === M.TEXT[k]), 'BimCraft\'s lang file holds every method sentence word for word (qty.m.*)', Object.keys(M.TEXT).filter((k) => bim['qty.m.' + k] !== M.TEXT[k]));
ok(['line', 'line.source', 'line.own', 'review.unchecked', 'review.checked'].every((k) => tc['qty.m.' + k] === M.TEXT[k]), 'TakeoffCraft\'s lang file holds the sentences that name a method');
const src = (app, file) => fs.readFileSync(path.join(ROOT, 'public_html/assets/apps', app, 'dev', file), 'utf8');
ok(/ruleOf\(w, 'floor'\)/.test(src('bimcraft', 'model-slabs.js')) && /ruleOf\(w, 'finish.ceiling'\)/.test(src('bimcraft', 'model-slabs.js')) && /ruleOf\(w, 'floor'\)/.test(src('bimcraft', 'model-floors.js')) && /QUANTITY_HOOK\(w, storey, walls, host\)/.test(src('bimcraft', 'model-walls.js')), 'BimCraft\'s IFC quantity writers ask for the project\'s method');
ok(/wallRule\(state\)/.test(src('takeoffcraft', 'model.js')) && /deducts\(a, rule\)/.test(src('takeoffcraft', 'model.js')), 'TakeoffCraft measures a run\'s openings by the takeoff\'s method');

console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
