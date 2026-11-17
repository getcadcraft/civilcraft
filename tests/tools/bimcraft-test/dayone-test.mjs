/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dayone-test.mjs — BK.74 (booklet principle 3, "draw from day one": sensible defaults, detail fills in later), session
 * `bk-instep-10`. DOM-free, run by
 *   node bin/test-bimcraft.mjs --dayone
 * What a new building starts with (new-defaults.js), the first sheet written into the new file (new-model.js
 * newBuilding({ sheet })) and read like any saved sheet (views-model.js readSheets), and that sheet showing the first wall
 * (res-sheets.js composeSheet). The page's side (the dialog, the clicks to the first wall) is browser-dayone.mjs.
 */
import path from 'node:path';

export async function dayOneMode({ APP, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (cond, label, detail = '') => { if (cond) good++; else bad++; console.log((cond ? '  ok   ' : '  FAIL ') + label + (!cond && detail ? ' (' + detail + ')' : '')); };
  const near = (a, b, tol = 0.01) => Math.abs(a - b) <= tol;
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const ND = await import(path.join(APP, 'new-defaults.js'));
  const MW = await import(path.join(APP, 'model-walls.js'));
  const WPG = await import(path.join(APP, 'wall-plan-graphics.js'));
  const RS = await import(path.join(APP, 'res-sheets.js'));
  const V = await import(path.join(APP, 'views-model.js'));
  const open = async (text) => {
    const eng = await quiet(IfcModel.create)(WebIFC, null);
    await quiet((b) => eng.load(b))(new TextEncoder().encode(text));
    const ed = new IfcEditor(WebIFC, eng);
    return { ed, w: () => new ModelWriter(WebIFC, ed.api, ed.mid) };
  };

  console.log('== BK.74 the defaults of a new building (new-defaults.js)');
  const dm = ND.startDefaults({ metric: true }), di = ND.startDefaults({ metric: false });
  ok(dm.levels === 2 && dm.height === 3000 && dm.heightText === '3000 mm' && di.height === 3048 && di.heightText === "10'-0\"", 'two levels, 3000 mm apart in metric units, 10\'-0" (3048 mm) otherwise');
  ok(dm.wallType === MW.WALL_TYPES[0].key && !!MW.wallType(dm.wallType) && di.wallType === dm.wallType, 'the wall type is the Wall tool\'s first type (' + MW.typeName(MW.wallType(dm.wallType)) + '), a type that exists');
  ok(dm.sheet.number === 'A-101' && dm.sheet.paper === 'a3' && dm.sheet.ratio === 100 && di.sheet.paper === 'tabloid' && di.sheet.ratio === 96, 'sheet A-101: A3 at 1:100 in metric units, Tabloid at 1/8" = 1\'-0" (1:96) otherwise');
  ok(Object.entries(ND.START_PAPERS).every(([k, v]) => RS.PAPERS[k] && near(RS.PAPERS[k][0], v[0]) && near(RS.PAPERS[k][1], v[1])), 'its paper sizes are the sheet module\'s own');
  ok(RS.scalesFor('mm').find((x) => x.ratio === 100)?.label === dm.sheet.scale && RS.scalesFor('ftin').find((x) => x.ratio === 96)?.label === di.sheet.scale, 'its scale words are the sheet editor\'s own (' + dm.sheet.scale + ', ' + di.sheet.scale + ')');
  const fs1 = ND.firstSheet({ metric: true, title: 'Level 1 plan' });
  ok(fs1.x === 210 && fs1.y === 162.5 && fs1.title === 'Level 1 plan', 'the plan goes in the middle of the drawing area (210, 162.5 on A3: above the title block)', JSON.stringify(fs1));

  for (const metric of [true, false]) {
    console.log('== BK.74 a new building, ' + (metric ? 'metric' : 'feet and inches') + ': its first sheet and the first wall');
    const d = ND.startDefaults({ metric });
    const levels = N.stackLevels(d.levels, d.height, (i) => 'Level ' + (i + 1));
    const text = N.newBuilding({ name: 'Day one', levels, fileName: 'd.ifc', now: new Date('2026-11-11T12:00:00Z'), sheet: ND.firstSheet({ metric, title: 'Level 1 plan' }) });
    const { ed, w } = await open(text);
    const [L1] = OPS.snapshotModel(ed).levels;
    const sheets = V.readSheets(w());
    ok(sheets.length === 1 && sheets[0].id === 'sheet-1' && sheets[0].number === 'A-101' && sheets[0].title === 'Level 1 plan' && sheets[0].paper === d.sheet.paper, 'the new file has one sheet: sheet-1, A-101 "Level 1 plan" on ' + d.sheet.paper, JSON.stringify(sheets));
    ok(sheets[0].views.length === 1 && sheets[0].views[0].kind === 'plan' && sheets[0].views[0].ref === L1.guid && sheets[0].views[0].ratio === d.sheet.ratio, 'with one view: the plan of Level 1 (the lowest level) at ' + d.sheet.scale);
    ok(ed.changes.length === 0, 'nothing to undo yet: the sheet is part of the new file, not an edit');
    const units = metric ? 'mm' : 'ftin';
    const input = () => {
      const s = OPS.snapshotModel(ed), here = s.walls.filter((x) => x.storey === L1.id);
      const outlines = MW.wallOutlines(here.map((x) => ({ key: x.guid, a: x.a, b: x.b, t: x.t, bulge: x.bulge, off: x.joinOff })));
      return { plans: [{ ref: L1.guid, title: 'Level 1 plan', scene: { walls: WPG.wallPlanGraphics(here, outlines, [], null, { detail: 'coarse' }), symbols: [], cut: [], below: [], rooms: [], dims: [] } }], elevations: [], sections: [], schedules: [] };
    };
    let sheet = RS.composeSheet(sheets[0], input(), { paper: sheets[0].paper, units });
    ok(sheet.views.length === 0 && sheet.missing.join() === '0' && sheet.items.some((i) => i.t === 'text' && i.s === 'A-101'), 'before the first wall the sheet is its frame and title block (A-101); the empty plan draws nothing and breaks nothing');
    // the first wall, with the defaults: the Wall tool's type, up to the level above
    const L2 = OPS.snapshotModel(ed).levels[1];
    ed.modelChange(OPS.drawWalls({ storey: L1.guid, segs: [{ a: [0, 0], b: [6000, 0] }], typeKey: d.wallType, topLevel: L2.guid }));
    const wall = OPS.snapshotModel(ed).walls[0];
    ok(ed.changes.length === 1 && wall && near(wall.len, 6000) && wall.typeKey === d.wallType && near(wall.height, d.height) && near(wall.t, MW.typeThickness(MW.wallType(d.wallType))), 'the first wall: one step, 6000 long, the default type, as high as the level', JSON.stringify(wall && [wall.len, wall.typeKey, wall.height, wall.t]));
    sheet = RS.composeSheet(V.readSheets(w())[0], input(), { paper: sheets[0].paper, units });
    const v = sheet.views[0], t = wall.t, pad = Math.max(6000, t) * 0.03 + 300;
    ok(sheet.views.length === 1 && !sheet.missing.length && v.ratio === d.sheet.ratio && v.label === d.sheet.scale, 'the first sheet now shows the plan at ' + d.sheet.scale, JSON.stringify(sheet.views));
    ok(v && near(v.box[2] - v.box[0], (6000 + 2 * pad) / d.sheet.ratio, 0.01) && near((v.box[0] + v.box[2]) / 2, ND.firstSheet({ metric }).x, 0.01), 'the wall on the paper: 6000 mm and its margin at the scale = ' + ((6000 + 2 * pad) / d.sheet.ratio).toFixed(2) + ' mm wide, centred where the sheet put it');
    const [PW, PH] = RS.PAPERS[sheets[0].paper];
    ok(v && v.box[0] > 10 && v.box[2] < PW - 10 && v.box[1] > 28 && v.box[3] < PH - 10, 'inside the frame and above the title block');
    const xs = sheet.items.filter((i) => (i.t === 'line' || i.t === 'fill')).flatMap((i) => i.pts || i.polys.flat()).filter((q) => q[0] >= v.box[0] && q[0] <= v.box[2] && q[1] >= v.box[1] && q[1] <= v.box[3]).map((q) => q[0]);
    ok(xs.length && near(Math.max(...xs) - Math.min(...xs), 6000 / d.sheet.ratio, 0.01), 'the wall is drawn ' + (6000 / d.sheet.ratio).toFixed(2) + ' mm long on it', xs.length ? String(Math.max(...xs) - Math.min(...xs)) : 'nothing drawn');
    ed.modelChange(V.saveSheet({ number: 'A-102', title: 'Second', paper: sheets[0].paper, views: [] }));
    const two = V.readSheets(w());
    ok(two.length === 2 && two[1].id === 'sheet-2' && two[0].id === 'sheet-1', 'a sheet added later is sheet-2 beside it');
    ed.modelChange(V.saveSheet({ ...two[0], title: 'Ground floor' }));
    ok(V.readSheets(w())[0].title === 'Ground floor' && V.readSheets(w()).length === 2, 'the first sheet is edited like any other (renamed in place)');
    const again = await open(new TextDecoder().decode(ed.save()));
    ok(V.readSheets(again.w()).length === 2 && V.readSheets(again.w())[0].views[0]?.ref === L1.guid && OPS.snapshotModel(again.ed).walls.length === 1, 'saved and opened again: both sheets, the plan view and the wall');
  }

  console.log('== BK.74 without a sheet asked for the file is as before');
  const plain = N.newBuilding({ name: 'Plain', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), now: new Date('2026-11-11T12:00:00Z') });
  ok(!/CadCraft_Sheets/.test(plain) && V.readSheets((await open(plain)).w()).length === 0, 'newBuilding without `sheet` writes no sheet (templates and scripts are unchanged)');
  const below = N.newBuilding({ name: 'Below', levels: [{ name: 'Upper', elevation: 0, height: 3000 }, { name: 'Basement', elevation: -3000, height: 3000 }], now: new Date('2026-11-11T12:00:00Z'), sheet: ND.firstSheet({ metric: true, title: 'Basement plan' }) });
  const B = await open(below);
  ok(V.readSheets(B.w())[0].views[0].ref === OPS.snapshotModel(B.ed).levels.find((l) => l.name === 'Basement').guid, 'levels given out of order: the sheet shows the lowest one');

  console.log(`\n${good} ok, ${bad} failed`);
  return bad ? 1 : 0;
}
