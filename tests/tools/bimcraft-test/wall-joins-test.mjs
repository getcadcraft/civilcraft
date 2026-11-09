/* SPDX-License-Identifier: Apache-2.0 */
/**
 * wall-joins-test.mjs — the stored join record (0.9 FX.60, wall tool spec section 5 and tests 1, 2, 7, 8), DOM-free:
 *   node bin/test-bimcraft.mjs --joins
 * A room of four walls, a partition on one wall (T) and a wall across the room (X): the file holds IfcRelConnectsPathElements for each,
 * a Move keeps them, Disallow join frees one end and it stays free, undo, delete, and a save + reload keep the records.
 */
import path from 'node:path';

export async function joinsMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0;
  const ok = (cond, label, detail = '') => { if (!cond) bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const MM = await import(path.join(APP, 'model-modify.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const boot = async (bytes) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(bytes);
    return new IfcEditor(WebIFC, eng);
  };
  const text = N.newBuilding({ name: 'Joins', levels: N.stackLevels(1, 3000, (i) => 'Level ' + (i + 1)), fileName: 'j.ifc', now: new Date('2026-11-05T12:00:00Z') });
  let ed = await boot(new TextEncoder().encode(text));
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const L1 = OPS.snapshotModel(ed).levels[0];
  const walls = () => MW.readWalls(W());
  const recs = () => MW.readJoinRecords(W());
  const by = (list, g) => list.find((x) => x.guid === g);

  console.log('== a room: four L joins');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [5000, 0] }, { a: [5000, 0], b: [5000, 4000] }, { a: [5000, 4000], b: [0, 4000] }, { a: [0, 4000], b: [0, 0] }], typeKey: 'int-2x4', height: 2700 }));
  let [s, e, n, wv] = walls();
  ok(recs().length === 4 && recs().every((r) => r.kind === 'L'), 'four L records are written with the walls', JSON.stringify(recs().map((r) => r.kind)));
  ok(walls().every((x) => x.joins && x.joins.length === 2), 'readWalls carries them: every wall has two joins');
  ok(by(walls(), s.guid).joins.some((j) => j.other === e.guid && j.pos === 'end' && j.otherPos === 'start'), 'the record says where: the south wall\'s end meets the east wall\'s start');

  console.log('== a partition (T) and a wall across (X)');
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [2000, 4000], b: [2000, 0] }], typeKey: 'int-2x4', height: 2700 }));
  [s, e, n, wv] = walls();
  const p = walls()[4];
  ok(recs().filter((r) => r.kind === 'T').length === 2, 'the partition ends on the top and the bottom wall: two T records', JSON.stringify(recs().map((r) => r.kind)));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [3000, 1000], b: [3000, 3000] }], typeKey: 'int-2x4', height: 2700 }));
  ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [2500, 2000], b: [4500, 2000] }], typeKey: 'int-2x4', height: 2700 }));
  ok(recs().some((r) => r.kind === 'X'), 'two walls crossing mid + mid make an X record', JSON.stringify(recs().map((r) => r.kind)));
  const before = recs().length;

  console.log('== spec test 1 and 8: move the top wall, one undo step');
  const n0 = ed.changes.length;
  ed.modelChange(MM.moveElements([{ guid: n.guid, dx: 0, dy: 500 }]), { label: 'Move' });
  const m = walls();
  ok(ed.changes.length === n0 + 1, 'one undo step');
  ok(near(by(m, e.guid).b[1], 4500) && near(by(m, wv.guid).a[1], 4500) && near(by(m, n.guid).a[1], 4500), 'the side walls lengthen 500, the corners stay joined');
  ok(near(by(m, p.guid).a[1], 4500), 'the partition (a T) comes with the wall it is joined to');
  ok(recs().length === before, 'the records are the same after the move');
  ed.undo();
  ok(near(by(walls(), n.guid).a[1], 4000) && recs().length === before, 'undo: the walls and the records are back');

  console.log('== spec test 7: Disallow join at one end, move away and back');
  ed.modelChange(OPS.changeWall(e.guid, { joinAllowed: { b: false } }), { label: 'Disallow join' });
  ok(by(walls(), e.guid).joinOff.b === true && by(walls(), e.guid).joinOff.a === false, 'the wall remembers: join off at its end only');
  ok(recs().length === before - 1 && !by(walls(), e.guid).joins.some((j) => j.pos === 'end'), 'the record at that end is gone');
  ed.modelChange(MM.moveElements([{ guid: e.guid, dx: 800, dy: 0 }]), { label: 'Move' });
  ed.modelChange(MM.moveElements([{ guid: e.guid, dx: -800, dy: 0 }]), { label: 'Move' });
  ok(!by(walls(), e.guid).joins.some((j) => j.pos === 'end') && recs().length === before - 1, 'moved away and back: that end stays free, no join comes back');
  ed.modelChange(OPS.changeWall(e.guid, { joinAllowed: { b: true } }), { label: 'Allow join' });
  ok(recs().length === before && by(walls(), e.guid).joins.some((j) => j.pos === 'end'), 'Allow join: the end joins again');

  console.log('== delete, save and reload');
  ed.modelChange(OPS.removeWalls([p.guid]), { label: 'Delete' });
  ok(recs().every((r) => r.a.guid !== p.guid && r.b.guid !== p.guid), 'a deleted wall takes its join records with it');
  const kept = recs().length, bytes = ed.save();
  ed = await boot(bytes);
  ok(recs().length === kept && kept >= 4, 'the records survive a save and reload: ' + kept);
  const again = walls();
  ok(again.every((x) => x.joins), 'the reloaded walls carry their joins');
  const txt = new TextDecoder().decode(bytes);
  ok(/IFCRELCONNECTSPATHELEMENTS\(/.test(txt) && /CadCraft join L/.test(txt), 'the file holds IfcRelConnectsPathElements named CadCraft join');
  console.log(bad ? `\n${bad} FAILED` : '\nall ok');
  return bad ? 1 : 0;
}
