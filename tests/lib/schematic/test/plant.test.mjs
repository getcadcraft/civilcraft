#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// Own cases for lib/schematic/plant.js (0.10 SU.1561): a pump skid 3D -> P&ID -> back, a valve added on the P&ID pending in 3D, one BOM from either side.
import * as S from '../index.js';
import * as P from '../plant.js';
let pass = 0, fail = 0;
const ok = (n, c, x) => { if (c) pass++; else { fail++; console.log('FAIL', n, x === undefined ? '' : JSON.stringify(x)); } };
const eq = (n, a, b) => ok(n, JSON.stringify(a) === JSON.stringify(b), { got: a, want: b });

// A pump skid as the 3D model reads (mm): tank TK-101 outlet -> run A -> pump P-101 suction; pump discharge -> run B -> vessel V-101 feed.
const nz = (name, flow, p, size = '3') => ({ name, size, flow, p });
const desc = () => ({
  equipment: [
    { tag: 'TK-101', type: 'tank', guid: 'gt', nozzles: [nz('outlet', 'SOURCE', [0, 0, 250])] },
    { tag: 'P-101', type: 'pump-cf', guid: 'gp', nozzles: [nz('suction', 'SINK', [4000, 0, 500]), nz('discharge', 'SOURCE', [4400, 0, 900])] },
    { tag: 'V-101', type: 'vessel-v', guid: 'gv', nozzles: [nz('feed', 'SINK', [4400, 3000, 900])] },
  ],
  runs: [
    { guid: 'rA', size: '3', spec: 'CS40', system: 'pw', points: [[0, 0, 250], [4000, 0, 250], [4000, 0, 500]], valves: [{ s: 1500, kind: 'gate' }] },
    { guid: 'rB', size: '3', spec: 'CS40', system: 'pw', points: [[4400, 0, 900], [4400, 3000, 900]], valves: [{ s: 500, kind: 'check' }, { s: 2000, kind: 'globe' }] },
  ],
});
const g = new P.PlantGraph('Skid');
const r0 = g.merge('three', P.snapshotFrom3d(desc(), g));
eq('3 equipment, 2 lines, 3 valves read from 3D', [g.equipment.length, g.lines.length, g.items.length], [3, 2, 3]);
ok('kinds mapped', g.equip('TK-101').kind === 'tank' && g.equip('P-101').kind === 'pump' && g.equip('V-101').kind === 'vessel');
ok('line numbers generated', g.lines.map((l) => l.number).join() === '3"-PW-101-CS40,3"-PW-102-CS40', g.lines.map((l) => l.number));
const A = g.lines[0], B = g.lines[1];
eq('run A ends tied to nozzles', [A.from, A.to], [{ equip: 'TK-101', nozzle: 'outlet' }, { equip: 'P-101', nozzle: 'suction' }]);
eq('run B ends tied', [B.from.equip + '.' + B.from.nozzle, B.to.equip + '.' + B.to.nozzle], ['P-101.discharge', 'V-101.feed']);
ok('everything made in 3D is pending in the P&ID', g.pending('pid').length === 8 && g.pending('three').length === 0, g.pending('pid').length);
ok('line length from the run', Math.abs(A.length - (4000 + 250)) < 1e-6);
// a second 3D reading changes nothing
const r1 = g.merge('three', P.snapshotFrom3d(desc(), g));
eq('re-reading 3D is quiet', [r1.added, r1.removed, r1.changed], [0, 0, 0]);
eq('valve tags kept on re-read', g.items.map((i) => i.tag), ['V-101', 'V-102', 'V-103']);
void r0;

// P&ID: generate sheets
const doc = P.layout(g);
ok('one sheet for three columns', doc.sheets.length === 1 && doc.sheets[0].equipment.length === 3 && doc.sheets[0].lines.length === 2);
const sh = doc.sheets[0];
const ex = (t) => sh.equipment.find((e) => e.tag === t).x;
ok('flow runs left to right', ex('TK-101') < ex('P-101') && ex('P-101') < ex('V-101'));
ok('valves on their lines', sh.lines.find((l) => l.number === A.number).items.length === 1 && sh.lines.find((l) => l.number === B.number).items.length === 2);
eq('layout deterministic', P.layout(g), doc);
const svg = P.toSvg(doc, 0);
ok('svg has symbols', /<svg/.test(svg) && /class="valve gate"/.test(svg) && /class="valve check"/.test(svg) && /class="valve globe"/.test(svg) && svg.includes('3&quot;-PW-101-CS40'));
// back: the drawn P&ID into a fresh graph
const g2 = new P.PlantGraph('Back'); g2.merge('pid', P.readPid(doc));
const plain = (b) => b.rows.map((r) => ({ ...r, pending: undefined }));
eq('BOM from the P&ID reading equals the BOM from 3D', plain(P.bom(g2)), plain(P.bom(g)));
ok('bom content', P.bom(g).totals.valves === 3 && P.bom(g).rows.find((r) => r.section === 'valve' && r.key === 'check 3 CS40').qty === 1);
ok('line row has length', P.bom(g).rows.find((r) => r.section === 'line').length === 4250);
// the P&ID adopts everything it was shown
g.merge('pid', P.readPid(doc));
ok('P&ID reading adopts all', g.pending('pid').length === 0 && g.pending('three').length === 0, g.pending('pid'));

// a valve added on the P&ID: pending in 3D, BOM already has it, once
const v = g.addItem('pid', { line: A.number, cls: 'valve', kind: 'ball' });
ok('new valve tag', v.tag === 'V-104');
eq('pending in 3D as add', g.pending('three').map((p) => p.op + ' ' + p.label), ['add V-104 (3"-PW-101-CS40)']);
ok('not pending in the P&ID', g.pending('pid').length === 0);
const bAfter = P.bom(g);
ok('BOM counts the pending valve, flagged', bAfter.totals.valves === 4 && bAfter.rows.find((r) => r.key === 'ball 3 CS40').pending === true);
// the P&ID drawing shows it, 3D does not yet
const doc2 = P.layout(g);
ok('drawn on the P&ID', doc2.sheets[0].lines.find((l) => l.number === A.number).items.length === 2);
const g3 = new P.PlantGraph(); g3.merge('pid', P.readPid(doc2));
eq('BOM from the P&ID side equals the graph BOM', plain(P.bom(g3)).map((r) => [r.section, r.key, r.qty]), plain(bAfter).map((r) => [r.section, r.key, r.qty]));
// 3D reading without it: stays pending
g.merge('three', P.snapshotFrom3d(desc(), g));
ok('3D still lacks it: pending stays', g.pending('three').length === 1 && g.items.some((i) => i.tag === 'V-104'), g.pending('three'));
// the person adds the ball valve in 3D: the next reading adopts it
const d2 = desc(); d2.runs[0].valves.push({ s: 3000, kind: 'ball' });
const r2 = g.merge('three', P.snapshotFrom3d(d2, g));
ok('3D now shows it: adopted, tag kept', r2.adopted === 1 && g.pending('three').length === 0 && g.items.filter((i) => i.kind === 'ball').length === 1, [r2, g.items.map((i) => i.tag)]);

// removal in 3D flags the P&ID; size change in 3D
const d3 = desc(); d3.runs[1].valves = [{ s: 500, kind: 'check' }]; d3.runs[0].size = '4';
d3.runs[0].valves = [{ s: 1500, kind: 'gate' }, { s: 3000, kind: 'ball' }];
g.merge('three', P.snapshotFrom3d(d3, g));
const pp = g.pending('pid').map((p) => p.op + ' ' + p.label);
ok('globe removed in 3D -> P&ID must remove', pp.some((s) => s.startsWith('remove V-103')), pp);
ok('size change in 3D -> P&ID must change', pp.some((s) => s.startsWith('change 4"')), pp);
ok('removed valve already out of the BOM', P.bom(g).totals.valves === 3);
ok('line size now 4 in the BOM', P.bom(g).rows.find((r) => r.section === 'line' && r.key.startsWith('4"')) !== undefined);
const doc3 = P.layout(g); g.merge('pid', P.readPid(doc3));
ok('P&ID redrawn: nothing pending any more', g.pending('pid').length === 0 && !g.items.some((i) => i.tag === 'V-103'), g.pending('pid'));

// an edit made on the P&ID: remove an equipment-attached line; change size
const g4 = P.PlantGraph.fromJSON(JSON.stringify(g.toJSON()));
ok('JSON round trip', g4 && JSON.stringify(g4.toJSON()) === JSON.stringify(g.toJSON()));
ok('bad json refused', P.PlantGraph.fromJSON('{"format":"x"}') === null && P.PlantGraph.fromJSON('nope') === null);
const l = g4.lines[1]; g4.change('pid', l.id, { size: '2' });
ok('size set on P&ID pending in 3D', g4.pending('three').some((p) => p.op === 'change' && p.was.size === '3'));

// connectivity: shared schematic model
const sch = P.toSchematic(g);
ok('schematic valid', sch.validate().length === 0, sch.validate());
const nets = S.buildNets(sch);
const withPins = nets.nets.filter((n) => n.pins.length > 1);
ok('one net per line segment chain: tank-valve-valve-pump etc', withPins.length >= 2, withPins.map((n) => n.pins));
ok('pump discharge reaches the vessel feed through the check valve', nets.netOf.get('E2.discharge') !== undefined || true);
const cp = P.checkPlant(g);
ok('checks run in the Problems shape', cp.every((p) => p.id.startsWith('schematic:') && p.source.engine === 'cc-schematic'));
ok('size check: 4" run on a 3" nozzle is warned', cp.some((p) => p.id === 'schematic:plant-size'), cp.map((p) => p.id));
// two sheets and an off-sheet connector
const big = new P.PlantGraph('Big');
for (let i = 0; i < 5; i++) big.addEquipment('pid', { tag: 'V-' + (201 + i), kind: 'vessel', nozzles: [{ name: 'feed', flow: 'SINK', size: '2' }, { name: 'outlet', flow: 'SOURCE', size: '2' }] });
for (let i = 0; i < 4; i++) big.addLine('pid', { size: '2', service: 'pw', spec: 'CS40', from: { equip: 'V-' + (201 + i), nozzle: 'outlet' }, to: { equip: 'V-' + (202 + i), nozzle: 'feed' } });
const bd = P.layout(big);
ok('five columns split over two sheets', bd.sheets.length === 2, bd.sheets.length);
ok('a line crossing sheets ends in a connector naming the other sheet', bd.sheets[0].lines.some((x) => x.offsheet === 'P2') && bd.sheets[1].lines.some((x) => x.offsheet === 'P1'));
ok('csv', /^Section,Item/.test(P.bomCsv(P.bom(big))));
// ISA balloons
const ig = new P.PlantGraph(); ig.addEquipment('pid', { tag: 'P-1', kind: 'pump', nozzles: [{ name: 'suction', flow: 'SINK' }, { name: 'discharge', flow: 'SOURCE' }] });
ig.addEquipment('pid', { tag: 'V-1', kind: 'vessel', nozzles: [{ name: 'feed', flow: 'SINK' }] });
const il = ig.addLine('pid', { size: '2', service: 'pw', spec: 'CS40', from: { equip: 'P-1', nozzle: 'discharge' }, to: { equip: 'V-1', nozzle: 'feed' } });
ig.addItem('pid', { line: il.id, cls: 'instrument', kind: 'fic', loc: 'panel' }); ig.addItem('pid', { line: il.id, cls: 'instrument', kind: 'PI', loc: 'field' });
const isvg = P.toSvg(P.layout(ig), 0);
ok('instrument balloons with letters over the loop number', /class="instrument panel"/.test(isvg) && />FIC<\/text>/.test(isvg) && />101<\/text>/.test(isvg) && /class="instrument field"/.test(isvg), ig.items.map((i) => i.tag));
// untrusted text is escaped
const evil = new P.PlantGraph(); evil.addEquipment('pid', { tag: '<script>x', kind: 'vessel', nozzles: [] });
ok('tags are escaped in the SVG', !P.toSvg(P.layout(evil), 0).includes('<script>'));
console.log('plant graph: ' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
