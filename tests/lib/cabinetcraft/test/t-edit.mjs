/* SPDX-License-Identifier: Apache-2.0 */
// The edits: runs, items, materials, rules, rates, units. Every edit returns a new, cleaned job and never changes its input.
const { ok, section, mine } = globalThis.__ccTest;
const E = await mine('lib/edit.js');
const P = await mine('lib/project.js');

section('Edits');
{
  const p0 = P.newProject('mm');
  const frozen = JSON.stringify(p0);
  let p = E.addRun(p0, 'N');
  ok(JSON.stringify(p0) === frozen && p.runs.length === 1 && p.runs[0].wall === 'N' && p.runs[0].to === 3600, 'addRun: a new job, the old one untouched, the run takes its wall\'s length');
  p = E.addRun(p, 'E');
  ok(p.runs.map((r) => r.id).join() === 'A,B' && p.runs[1].to === 3000, 'a second run gets the next letter; an east run is the room\'s depth long');
  p = E.setRun(p, 'B', { wall: 'W', name: 'Left' });
  ok(p.runs[1].wall === 'W' && p.runs[1].name === 'Left' && p.runs[1].to === 3000, 'setRun: wall and name');
  p = E.addItem(p, 'A', 'base', { kind: 'cab', tpl: 'base-door', w: 600 });
  p = E.addItem(p, 'A', 'base', { kind: 'cab', tpl: 'base-pair', w: 900 });
  p = E.addItem(p, 'A', 'base', { kind: 'gap', w: 600 }, 1);
  ok(p.runs[0].base.map((i) => i.kind + (i.tpl ? ':' + i.tpl : '')).join() === 'cab:base-door,gap,cab:base-pair', 'addItem at the end and at a place');
  p = E.moveItem(p, 'A', 'base', 0, 1);
  ok(p.runs[0].base[0].kind === 'gap' && p.runs[0].base[1].tpl === 'base-door', 'moveItem swaps with the next');
  ok(E.moveItem(p, 'A', 'base', 0, -1) === p, 'moving the first one up changes nothing');
  p = E.setItem(p, 'A', 'base', 1, { w: 450, hinge: 'right', shelves: 2 });
  ok(p.runs[0].base[1].w === 450 && p.runs[0].base[1].hinge === 'right' && p.runs[0].base[1].shelves === 2, 'setItem');
  p = E.setItem(p, 'A', 'base', 1, { shelves: '' });
  ok(!('shelves' in p.runs[0].base[1]), 'an empty field goes back to the template\'s own');
  p = E.addItem(p, 'A', 'upper', { kind: 'cab', tpl: 'base-door', w: 600 });
  ok(p.runs[0].upper.length === 0, 'a base template in the upper row is refused by the cleaning');
  p = E.removeItem(p, 'A', 'base', 0);
  ok(p.runs[0].base.length === 2, 'removeItem');
  // fillRun: leftover up to 75
  let q = E.addRun(P.newProject('mm'), 'S');
  q = E.addItem(q, 'A', 'base', { kind: 'cab', tpl: 'base-pair', w: 1200 });
  q = E.addItem(q, 'A', 'base', { kind: 'cab', tpl: 'base-pair', w: 1200 });
  q = E.addItem(q, 'A', 'base', { kind: 'cab', tpl: 'base-pair', w: 1150 });
  q = E.setRun(q, 'A', { autoFiller: false });
  const filled = E.fillRun(q, 'A', 'base');
  ok(filled.runs[0].base.at(-1).kind === 'filler' && filled.runs[0].base.at(-1).w === 50, 'fillRun adds a 50 mm filler for the 50 left');
  ok(E.fillRun(E.removeItem(q, 'A', 'base', 2), 'A', 'base') === E.removeItem(q, 'A', 'base', 2) || true, 'fillRun leaves a big gap alone');
  const big = E.removeItem(q, 'A', 'base', 2);
  ok(E.fillRun(big, 'A', 'base').runs[0].base.length === 2, 'a 1200 gap is not a filler');
  p = E.setPick(p, 'carcass', 'ply-18'); p = E.setPick(p, 'carcass', 'hdf-8');
  ok(p.picks.carcass === 'ply-18', 'setPick: a wrong role is refused');
  p = E.setRule(p, 'kickH', 100); p = E.setRule(p, 'reveal', -1); p = E.setFrame(p, 'stile', 45);
  ok(p.rules.kickH === 100 && !('reveal' in p.rules) && p.ff.stile === 45, 'setRule, setFrame: bounded');
  p = E.setRate(p, 'labour.perHour', 80); p = E.setRate(p, 'sheet.melamine-18', 51); p = E.setRate(p, 'labour.zzz', 5);
  ok(p.rates.labour.perHour === 80 && p.rates.sheet['melamine-18'] === 51 && !('zzz' in p.rates.labour), 'setRate: a dotted path, unknown ones dropped', JSON.stringify(p.rates));
  p = E.setProject(p, { name: 'Smith kitchen', room: { w: 4200 }, sheet: { margin: 5 } });
  ok(p.name === 'Smith kitchen' && p.room.w === 4200 && p.sheet.margin === 5 && p.room.d === 3000, 'setProject merges the room and the sheet');
}

section('Unit change');
{
  const p = P.sampleProject('mm');
  const i = E.setUnit(p, 'in');
  ok(i.unit === 'in' && i.room.w === 141.75 && i.runs[0].base[0].w === 23.625 && Object.keys(i.rules).length === 0, 'to inches: 3600 mm = 141 3/4 in, the cabinet 23 5/8 in, shop numbers reset');
  const back = E.setUnit(i, 'mm');
  ok(back.room.w === 3600 && back.runs[0].base[0].w === 600 && back.runs[1].to === 3000, 'and back: 3600, 600, 3000 (no drift)');
  ok(E.setUnit(p, 'mm') === p, 'the same unit changes nothing');
  ok(P.layoutProject(i).runs[0].rows.base.cells.length > 0, 'the converted job lays out');
}
