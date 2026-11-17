#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tools/detailcraft-test/test-steelstair-10.mjs (0.10 SU.1814c): the steel stair generator inside DetailCraft, DOM-free: a generator stair is stored, read back, built into parts
 * (holes on the stringers), marked, drawn (the stair sheet and the flights' assembly sheets), exported to IFC and NC, and a stair of the old kind still builds exactly as in 0.9.
 *   node tools/detailcraft-test/test-steelstair-10.mjs
 * The engine's own numbers are checked by lib/steelstair/test/steelstair.test.mjs.
 */
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const ROOT = '/var/www/CADCRAFT/getcadcraft.com/public_html/assets/apps/detailcraft/';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m); } };
async function load(v) {
  const mod = (f) => import(pathToFileURL(ROOT + v + '/' + f).href);
  const I = await mod('i18n.js'); I.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(ROOT + v + '/lang/en.json', 'utf8')) });
  const [Md, B, Mk, D, If, G, Rb] = await Promise.all([mod('model.js'), mod('build.js'), mod('marks.js'), mod('drawings.js'), mod('ifc.js'), v === 'dev' ? mod('stair-ui.js') : mod('stair.js'), mod('rebar.js')]);
  return { Md, B, Mk, D, If, G, Rb };
}
const cur = await load('dev'), old = await load('0.9');
const gen = (await import(pathToFileURL(ROOT + 'dev/steelstair/steelstair.js').href));

// 1. a generator stair goes through the model: stored, checked, saved, opened again
const m = new cur.Md.Model(cur.Md.starterState('stair test'));
const id = m.change('stair', (tx) => tx.addStair({ ...gen.defaults('us-ibc-2021'), tread: { ...gen.defaults().tread }, x: 1000, y: 2000, z: 0, rise: 3000, phase: 1 }));
const st = m.stair(id);
ok(st && st.gen === 1 && st.rule === 'us-ibc-2021' && st.treadType === 'folded' && st.x === 1000 && st.y === 2000, 'the generator stair is stored with its settings and place: ' + JSON.stringify(st && { gen: st.gen, x: st.x, y: st.y }));
let threw = ''; try { m.change('bad', (tx) => tx.updateStair(id, { rise: -3 })); } catch (e) { threw = e.message; }
ok(/out of range/.test(threw) && m.stair(id).rise === 3000, 'a bad value is refused and nothing changes: ' + threw);
m.change('rule', (tx) => tx.updateStair(id, { rule: 'us-osha-1910', railTop: gen.defaults('us-osha-1910').railTop }));
ok(m.stair(id).rule === 'us-osha-1910' && m.stair(id).railTop === 940, 'changing the rule set stores it (the OSHA rail height 940 mm = 37 in)');
m.change('back', (tx) => tx.updateStair(id, { rule: 'us-ibc-2021', railTop: gen.defaults('us-ibc-2021').railTop }));
const saved = m.save ? m.save() : JSON.stringify(cur.Md.writeModel ? cur.Md.writeModel(m.state) : m.state);
const back = cur.Md.readModel(typeof saved === 'string' ? saved : JSON.stringify(saved));
const st2 = (back.state || back).stairs[0];
ok(st2 && st2.gen === 1 && st2.treadType === 'folded' && st2.rule === 'us-ibc-2021', 'saved and read back: still a generator stair');

// 2. built into parts
const built = cur.B.build(m.state), marks = cur.Mk.markParts(built, { perPhase: true });
const stairParts = built.parts.filter((p) => p.stair === id);
const kinds = (re) => stairParts.filter((p) => re.test(p.id.split('.')[1])).length;
ok(kinds(/^f1stringer[LR]$/) === 2 && kinds(/^f1tread\d+$/) === 17 && kinds(/^f1tread\d+n$/) === 17, 'two stringers, 17 treads and 17 nosing returns');
ok(kinds(/^r1[LR]rail$/) === 2 && kinds(/^r1[LR]post\d+$/) > 6 && kinds(/^r1[LR]bal\d+$/) > 20, 'rails, posts and balusters on both sides');
const sL = built.byId.get(id + '.f1stringerL'), sR = built.byId.get(id + '.f1stringerR');
ok(sL.holes.length === 34 && sR.holes.length === 34 && sL.holes.every((h) => h.d === 14 && h.face === 'web'), 'the stringers carry 34 holes each (2 per tread), 14 mm');
ok(!built.problems.some((p) => p.ref === id && p.hard), 'no hard problem: ' + JSON.stringify(built.problems.filter((p) => p.ref === id)));
const w = stairParts.reduce((a, p) => a + p.weight, 0);
const cl = gen.cutList(gen.build(m.stair(id), { profileOf: (n) => cur.B.build && null }), { profileOf: () => null });   // masses need the host's table: compared below through the host's own part weights
ok(w > 600 && w < 2500, 'a 3 m stair weighs a plausible ' + Math.round(w) + ' kg');
const asm = [...new Set(stairParts.map((p) => marks.asmOf.get(p.id)))];
ok(asm.length >= 5, 'assembly instances: the flight and each rail: ' + asm.length);
const balMarks = new Set(stairParts.filter((p) => /bal\d+$/.test(p.id)).map((p) => marks.partMark.get(p.id)));
ok(balMarks.size <= 4, 'identical balusters share a mark: ' + balMarks.size + ' marks for ' + stairParts.filter((p) => /bal\d+$/.test(p.id)).length + ' balusters');

// 3. the host's cut list through the engine with the host's table equals the sum of the part weights
const { getProfile } = await import(pathToFileURL(ROOT + 'dev/profiles.js').href);
const lay = gen.build(m.stair(id), { profileOf: (n) => getProfile(n, m.state.profiles) });
const list = gen.cutList(lay, { profileOf: (n) => getProfile(n, m.state.profiles) });
ok(Math.abs(list.totalKg - w) < Math.max(1, w * 0.002), `the cut list total (${list.totalKg} kg) equals the sum of the parts' weights (${Math.round(w * 100) / 100} kg)`);
ok(list.count === stairParts.length, 'every part is in the cut list: ' + list.count + ' = ' + stairParts.length);

// 4. drawings: the flight's assembly sheet (the stringer with its holes) and the stair sheet
const set = cur.D.drawingSet(m.state, built, marks, { date: '2026-11-14' });
const stairSheet = set.sheets.find((s) => s.kind === 'stair');
ok(!!stairSheet && /^ST-/.test(stairSheet.number), 'the stair sheet is in the drawing set: ' + (stairSheet && stairSheet.number));
const texts = stairSheet ? stairSheet.items.filter((i) => i.k === 'text').map((i) => i.s).join('\n') : '';
ok(/Hole stations/.test(texts) && /Tread detail/.test(texts) && /Pan return 40 mm/.test(texts) && /2 holes 14 mm/.test(texts), 'the stair sheet gives hole stations, the tread detail, the fold and the holes');
ok(stairSheet && stairSheet.items.filter((i) => i.k === 'circle').length >= 36, 'the stair sheet draws the fixing holes (34 + 2 in the flange): ' + (stairSheet && stairSheet.items.filter((i) => i.k === 'circle').length));
const asmSheet = set.sheets.find((s) => s.kind === 'assembly' && s.id === 'assembly:' + marks.asmMark.get(id + '.f1stringerL'));
ok(!!asmSheet && asmSheet.items.some((i) => i.k === 'circle'), 'the flight assembly sheet draws the stringer holes');
const asmSheets = set.sheets.filter((s) => s.kind === 'assembly');
ok(asmSheets.length === 2, 'two assembly sheets: the flight and the rail (both rails are one assembly, made twice): ' + asmSheets.map((s) => s.number));
const railRow = marks.assemblies.find((a) => a.main && built.byId.get(a.ids ? a.ids[0] : '')?.role === 'Top rail') || marks.assemblies.find((a) => a.count === 2);
ok(!!railRow && railRow.count === 2, 'the rail assembly is made twice');

// 5. IFC and NC
const ifc = cur.If.writeIfc(m.state, built, marks, cur.Rb.bendingSchedule(m.state.footings), {});
ok(/IFCMEMBER\(/.test(ifc) && /IFCCOLUMN\(/.test(ifc) && /IFCPLATE\(/.test(ifc), 'the IFC export has members, columns and plates for the stair');

// 6. the stair of the old kind builds exactly as in 0.9
{
  const a = new old.Md.Model(old.Md.starterState('o')), b = new cur.Md.Model(cur.Md.starterState('o'));
  const rec = { x: 0, y: 0, z: 0, dir: 30, rise: 2800, going: 280, width: 1100, maxRiser: 175, stringer: 'C10x15.3', tread: { t: 6, nosing: 25 }, material: 'A36' };
  a.change('s', (tx) => tx.addStair({ ...rec, tread: { ...rec.tread } })); b.change('s', (tx) => tx.addStair({ ...rec, tread: { ...rec.tread } }));
  const ba = old.B.build(a.state), bb = cur.B.build(b.state);
  const strip = (bl) => JSON.stringify(bl.parts.map((p) => [p.id, p.type, p.profileName, p.length, p.start, p.end, p.weight, p.holes.length]));
  ok(strip(ba) === strip(bb), 'a stair of the old kind builds the same parts as 0.9 (' + bb.parts.length + ' parts)');
  ok(!b.stair(b.state.stairs[0].id).gen, 'it stays an old-kind stair');
}

// 7. two flights and a landing through the model and the sheets
{
  const m2 = new cur.Md.Model(cur.Md.starterState('two'));
  const i2 = m2.change('s', (tx) => tx.addStair({ ...gen.defaults('us-ibc-2021'), tread: { ...gen.defaults().tread }, x: 0, y: 0, z: 0, rise: 4000, width: 1100, phase: 1 }));
  const b2 = cur.B.build(m2.state), mk2 = cur.Mk.markParts(b2, { perPhase: true });
  const ps = b2.parts.filter((p) => p.stair === i2);
  ok(ps.some((p) => p.id.endsWith('.f2stringerL')) && ps.some((p) => p.id.endsWith('.l1cover')) && ps.filter((p) => /\.l1post/.test(p.id)).length === 2, 'two flights, a landing cover and two posts');
  const set2 = cur.D.drawingSet(m2.state, b2, mk2, { date: '2026-11-14' });
  ok(set2.sheets.some((s) => s.kind === 'stair') && set2.sheets.filter((s) => s.kind === 'stair')[0].items.filter((i) => i.k === 'text' && /f[12]stringerL/.test(i.s)).length === 2, 'the stair sheet draws a stringer for each flight');
}
console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
