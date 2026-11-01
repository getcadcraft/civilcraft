/* SPDX-License-Identifier: Apache-2.0 */
/**
 * `node bin/test-bimcraft.mjs --site-ctx` (0.8 EG.63, civil_PART_4): CivilCraft's site-context file taken as suggestions. The file is read and cleaned (lib/site-context),
 * proposals list the buildings and the parcel, ticked ones become walls (as tall as the source said) in ONE undo step, the parcel becomes the site outline, a rejected
 * building adds nothing. Run on a made-up block of three buildings and a parcel; NOT on a real fetch from the open services (the owner's run).
 */
import path from 'node:path';

export async function siteCtxMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  const C = await import(path.join(APP, 'site-context.js'));
  const SB = await import(path.join(APP, 'site-ctx-build.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const SITE = await import(path.join(APP, 'model-site.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  let good = 0, bad = 0;
  const ok = (c, l) => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + l); };

  const O = { lat: 48, lon: 9 }, sq = (lon, lat, d = 0.0002) => [[lon, lat], [lon + d, lat], [lon + d, lat + d], [lon, lat + d], [lon, lat]];
  const file = C.buildContext({ origin: O, radius: 150, items: [{ kind: 'building', rings: [sq(9.0003, 48.0003)], height: 12, name: 'A' }, { kind: 'building', rings: [sq(9.0007, 48.0003)], levels: 2 }, { kind: 'building', rings: [sq(9.0003, 48.0008)] },
    { kind: 'parcel', rings: [sq(9.0001, 48.0001, 0.001)], name: 'APN 1' }, { kind: 'flood', rings: [sq(9, 48, 0.001)], label: 'AE' }] });
  const read = C.readContext(JSON.stringify(file));
  ok(read.ok, 'the file reads');
  const props = C.proposals(read.ctx, { defaultHeight: 9 });
  const bld = props.filter((p) => p.kind === 'building');
  ok(bld.length === 3 && bld[2].height === 9 && bld[2].assumed === 'default' && bld[1].height === 6 && bld[1].assumed === 'levels', 'three buildings: 12 m from the source, 6 m from two levels (said), 9 m typed for the unknown');
  const ws = SB.contextWalls(props, { defaultHeight: 9 });
  ok(ws.length === 12 && ws.every((x) => Math.hypot(x.b[0] - x.a[0], x.b[1] - x.a[1]) > 100), 'four walls for each building: ' + ws.length);
  ok(ws.filter((x) => x.of === 'b1').every((x) => x.height === 12000), 'the first building stands 12 000 mm');

  const text = N.newBuilding({ name: 'Ctx', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'c.ifc', now: new Date('2026-10-30T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  const [A] = OPS.snapshotModel(ed).levels.map((l) => l.guid);
  const nWalls = () => OPS.snapshotModel(ed).walls.length;
  const before = nWalls();
  ed.modelChange(SB.contextChange([], { storey: A }));
  ok(nWalls() === before, 'nothing accepted: nothing added');
  ed.modelChange(SB.contextChange(C.pick(props, ['b1', 'b2']), { storey: A, defaultHeight: 9 }));
  const mid = nWalls();
  ok(mid === before + 8, 'two buildings accepted: eight walls (' + (mid - before) + ')');
  ed.undo();
  ok(nWalls() === before, 'one undo removes every wall of the step');
  ed.modelChange(SB.contextChange(C.pick(props, ['b3']), { storey: A, defaultHeight: 9 }));
  ok(nWalls() === before + 4, 'the building with the typed height: four walls');
  const out = SB.outlineChange(C.pick(props, ['p4']), { storey: A });
  ok(out && SB.outlineChange(C.pick(props, ['b1']), { storey: A }) === null, 'the parcel makes a site outline; no parcel accepted = no outline step');
  ed.modelChange(out);
  const site = SITE.readSite(new ModelWriter(ed.W, ed.api, ed.mid));
  ok(site && site.points.length >= 4, 'the model has a site outline of ' + site?.points.length + ' points');
  ok(!props.find((p) => p.kind === 'flood').adds, 'the flood zone is information only: it cannot be added');
  console.log(good + ' ok, ' + bad + ' failed');
  return bad ? 1 : 0;
}
