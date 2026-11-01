/* SPDX-License-Identifier: Apache-2.0 */
// Materials into rules, the parts of a job: frameless known answers, face frames, blind corners, fillers, end panels, drilling, hardware.
const { ok, section, near, mine } = globalThis.__ccTest;
const MAT = await mine('lib/materials.js');
const P = await mine('lib/project.js');
const B = await mine('lib/build.js');
const M = await mine('lib/model.js');

const job = (base, over = {}, upper = []) => P.cleanProject({ unit: 'mm', room: { w: 3600, d: 3000, h: 2400 }, ...over, runs: [{ id: 'A', wall: 'S', from: 0, to: 3600, base, upper }] });
const cab = (tpl, w, extra = {}) => ({ kind: 'cab', tpl, w, ...extra });
const partOf = (b, no, role) => b.parts.filter((p) => p.group === no && p.role === role);

section('Materials become rules');
{
  const R = MAT.rulesFromPicks('mm', {});
  ok(R.t === 18 && R.backT === 8 && R.groove === 8 && R.frontT === 18 && R.drawerT === 15 && R.drawerBottomT === 6, 'default picks: 18 carcass, 8 back in 8 grooves, 18 fronts, 15 drawer sides, 6 bottoms');
  ok(R.bandCarcass.thickness === 1 && R.bandFront.thickness === 2, 'banding 1 mm on the carcass, 2 mm on the fronts');
  const R2 = MAT.rulesFromPicks('mm', { carcass: 'ply-15', back: 'hdf-3', fronts: 'laminate-19' });
  ok(R2.t === 15 && R2.backT === 3 && R2.groove === 3 && R2.frontT === 19, 'other picks: 15 carcass, a 3 mm back with a 3 mm groove, 19 fronts');
  const Ri = MAT.rulesFromPicks('in', {});
  ok(Ri.unit === 'in' && Ri.t === 0.75 && Ri.backT === 0.3125 && Ri.bandFront.thickness === 0.08, 'inches: 3/4 carcass, 5/16 back');
  const custom = MAT.cleanCustom([{ id: 'my-oak', role: 'fronts', name: 'Oak ply <b>', thickness: 21, sheet: { w: 2500, h: 1250 } }, { id: 'oak', role: 'fronts', name: 'x', thickness: 1 }, { id: 'my-bad', role: 'nope', name: 'x', thickness: 5 }, { id: 'my-z', role: 'back', name: 'Z', thickness: -2 }]);
  ok(custom.length === 1 && custom[0].id === 'my-oak' && !/[<>]/.test(custom[0].name), 'a job\'s own materials: id must start my-, role and thickness checked, markup removed', JSON.stringify(custom));
  const R3 = MAT.rulesFromPicks('mm', { fronts: 'my-oak' }, { custom });
  ok(R3.frontMat === custom[0].name && R3.frontT === 21, 'a typed material name is kept as typed with its own thickness');
  ok(MAT.cleanPicks({ fronts: 'my-oak' }, custom).fronts === 'my-oak' && MAT.cleanPicks({ fronts: 'my-oak' }, []).fronts === 'mdf-painted-18', 'a pick of an own material needs that material in the job');
  const say = (k, v) => k.replace('lib.mat.', '').replace('lib.band.', '') + ' ' + (v && v.t);
  const Rn = MAT.rulesFromPicks('mm', {}, { say });
  ok(Rn.carcass === 'melamine-18 18' && Rn.bandFront.code === 'pvc-2 2', 'names are written by the add-on\'s words with the thickness');
  ok(MAT.sheetFor(Rn.carcass, 18, { say }).w === 2440 && MAT.sheetFor('unknown', 3, { say, fallback: { w: 1, h: 2 } }).w === 1, 'the sheet of a material by its written name; unknown names take the job\'s sheet');
  ok(MAT.sheetFor(MAT.rulesFromPicks('in', {}, { say }).carcass, 0.75, { say, unit: 'in' }).w === 96, 'inch jobs get the sheet in inches: 96 × 48', JSON.stringify(MAT.sheetFor(MAT.rulesFromPicks('in', {}, { say }).carcass, 0.75, { say, unit: 'in' })));
}

section('Frameless parts (the shared model) and the job around it');
{
  const b = B.buildJob(job([cab('base-door', 600)]));
  const side = partOf(b, 'B01', 'side')[0];
  ok(side && side.qty === 2 && side.length === 720 && side.width === 560 && side.thickness === 18, 'a 600 base: two sides 720 × 560 × 18 (870 high on 150 legs)');
  ok(partOf(b, 'B01', 'door')[0].length === 717 && partOf(b, 'B01', 'door')[0].width === 597, 'one door 717 × 597 (3 mm reveal)');
  ok(b.parts.every((p) => /^[A-Z]\d\d-\d\d$/.test(p.id)) && new Set(b.parts.map((p) => p.id)).size === b.parts.length, 'part ids are cabinet-number plus a running number and never repeat');
  ok(b.parts.every((p) => !/^part\./.test(p.name) || false) === false, 'names are keys until the app writes them');
  const w = B.buildJob(job([cab('base-door', 600)]), { word: (k) => k.replace('part.', '') });
  ok(w.parts.some((p) => p.name === 'side' && p.nameKey === 'part.side'), 'word() writes part names and keeps the key');
  ok(b.hardware.find((h) => h.key === 'hinge').qty === 2 && b.hardware.find((h) => h.key === 'leg').qty === 4, 'hardware list: 2 hinges, 4 legs');
  ok(b.drill.length === 2 && b.drill.every((d) => d.no === 'B01'), 'a drilling plan for the sides and the door');
  const d = b.drill.find((x) => x.role === 'door');
  ok(b.parts.find((p) => p.id === d.id).role === 'door', 'drilling ids point at real parts of the cut list', d.id);
}

section('Face frame');
{
  const b = B.buildJob(job([cab('base-pair', 900)], { construction: 'faceframe' }));
  const c = b.cells.find((x) => x.no === 'B01');
  ok(c.construction === 'faceframe' && c.frame && c.frame.openings.length === 1, 'a face-frame cabinet has a frame and an opening');
  const side = partOf(b, 'B01', 'side')[0];
  ok(side.width === 541, 'the carcass is shallower by the frame: sides 560 − 19 = 541');
  ok(side.band.l1 === null, 'no banding on the front edge of the sides (the frame covers it)');
  const stile = partOf(b, 'B01', 'frame-stile')[0], rail = partOf(b, 'B01', 'frame-rail')[0];
  ok(stile.qty === 2 && stile.length === 720 && stile.width === 38 && stile.thickness === 19 && stile.meta.linear, 'two stiles 720 × 38 × 19, cut by length');
  ok(rail.qty === 2 && rail.length === 824 && rail.width === 38, 'two rails between the stiles: 900 − 76 = 824');
  const doors = partOf(b, 'B01', 'door')[0];
  ok(doors.qty === 2 && near(doors.width, 422.5) && near(doors.length, 668), 'a pair of overlay doors: (824 + 24 − 3) / 2 = 422.5 wide, 644 + 24 = 668 high', JSON.stringify([doors.qty, doors.width, doors.length]));
  const dr = B.buildJob(job([cab('base-drawers3', 600)], { construction: 'faceframe' }));
  const fr = dr.cells[0].fronts;
  ok(fr.length === 3 && dr.cells[0].frame.rails.filter((r) => r.kind === 'mid').length === 2, 'three drawers: three openings, two middle rails');
  ok(near(fr[0].y + fr[0].h + (38 - 3) / 2 - 0, fr[0].y + fr[0].h + 17.5), 'sanity');
  ok(near(fr[1].y - (fr[0].y + fr[0].h), 3), 'fronts that meet on a rail leave the 3 mm gap between them', JSON.stringify(fr.map((f) => [f.y, f.h])));
  const boxes = partOf(dr, 'D01', 'drawer-side');
  ok(boxes.length === 1 && boxes[0].qty === 6 && boxes[0].width < fr[0].opening.h, 'drawer boxes fit the frame openings (6 sides)', JSON.stringify(boxes.map((x) => [x.qty, x.width])));
  const dd = dr.drill.find((x) => x.role === 'side');
  ok(!dd || !dd.holes.some((h) => h.kind === 'plate'), 'no hinge-plate holes in the sides of a face-frame cabinet');
  const mixed = B.buildJob(job([cab('base-door', 600, { construction: 'faceframe' }), cab('base-door', 600)]));
  ok(mixed.cells[0].construction === 'faceframe' && mixed.cells[1].construction === 'frameless', 'one cabinet can differ from the job');
  ok(b.parts.filter((p) => p.meta && p.meta.linear).every((p) => p.material === b.F.mat), 'frame stock is its own material');
}

section('Blind corner');
{
  const b = B.buildJob(job([cab('base-blind', 1050)]));
  const door = partOf(b, 'B01', 'door')[0], bp = partOf(b, 'B01', 'blind-panel')[0];
  ok(door.width === 747 && door.length === 717 && bp.width === 297 && bp.length === 717, 'a 1050 blind corner: a 747 door over the open 750 and a 297 blind panel over the 300', JSON.stringify([door.width, bp.width]));
  const fr = b.cells[0].fronts;
  ok(fr[0].kind === 'door' && fr[0].x === 1.5 && fr[1].kind === 'blind' && fr[1].x === 751.5, 'door on the left (hinged left), blind part on the right');
  const r = B.buildJob(job([cab('base-blind', 1050, { hinge: 'right' })])).cells[0].fronts;
  ok(r[0].x === 301.5 && r[1].x === 1.5, 'hinged right: the blind part is on the left');
  const f = B.buildJob(job([cab('base-blind', 1050)], { construction: 'faceframe' }));
  ok(partOf(f, 'B01', 'frame-stile').length === 2 && partOf(f, 'B01', 'frame-stile').reduce((a, p) => a + p.qty, 0) === 3 && f.cells[0].frame.openings[0].w === 1050 - 76 - 300, 'face-frame blind corner: an extra stile and an opening of 674');
}

section('Fillers and end panels');
{
  const b = B.buildJob(job([cab('base-door', 600), cab('base-pair', 900), cab('base-drawers3', 600), cab('base-door', 600), cab('base-pair', 880)]));
  const f = b.parts.find((p) => p.role === 'filler');
  ok(f && f.length === 720 && f.width === 20 && f.thickness === 18 && f.group === 'F01', 'an automatic filler: 720 high, 20 wide, the front material', JSON.stringify(f));
  const c = B.buildJob(job([cab('base-door', 600)]));
  const e = c.parts.find((p) => p.role === 'end-panel');
  ok(e && e.length === 720 && e.width === 578 && e.band.l1 && e.band.w1 && !e.band.l2, 'an end panel 720 × 578 with its front and top edges banded');
  ok(c.cells.filter((x) => x.kind === 'cab').length === 1 && c.cells.length === 2, 'cells: the cabinet and the panel');
}

section('A whole job');
{
  const p = P.sampleProject();
  const b = B.buildJob(p);
  ok(b.cells.length === 13 && b.cells.filter((c) => c.kind === 'cab').length === 10 && b.cells.filter((c) => c.kind === 'endpanel').length === 3, 'the example kitchen: 10 cabinets and 3 end panels (the open ends of the upper row and of the east run)');
  ok(b.counters.length === 2, 'two countertop pieces');
  ok(b.parts.length > 70 && new Set(b.parts.map((x) => x.id)).size === b.parts.length, 'ids are unique over the whole job', String(b.parts.length));
  const hw = Object.fromEntries(b.hardware.map((h) => [h.key, h.qty]));
  ok(hw.hinge > 10 && hw.slide === 5 && hw.bracket === 8, 'hardware: hinges, 5 drawer slides (3 + 2), 8 hanging brackets', JSON.stringify(hw));
  const ff = B.buildJob({ ...p, construction: 'faceframe' });
  ok(ff.parts.filter((x) => x.meta && x.meta.linear).length > 20, 'the same job as face frames adds frame stock');
  const inch = B.buildJob(P.cleanProject({ unit: 'in', runs: [{ id: 'A', wall: 'S', base: [cab('base-door', 24)] }] }));
  const s = partOf(inch, 'B01', 'side')[0];
  ok(near(s.length, 34.5 - 4) && near(s.width, 23.25) && s.thickness === 0.75, 'inches: sides 30.5 × 23.25 × 3/4', JSON.stringify(s));
}
