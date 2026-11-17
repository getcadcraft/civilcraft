#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test.mjs: lib/finishes known-answer tests (0.10 BK.25-28, BK.130; session bim-finishes-10). Every expected value is worked out in the comment
 * beside it from the geometry (no reference program):   node lib/finishes/test/test.mjs
 */
import { faceFrame, planPoint, viewerU, extent, rect, area, inter, subtract, areaOf, openingRect } from '../face.js';
import { withType, withoutType, withZone, withoutZone, withZoneChanged, withZoneMoved, forgetWalls, emptyDoc, cleanDoc, typeById, typeThickness, buildUp, substrates, tileOf, finishedWall, zoneFullHeight, zoneSplashBack, zoneShower, zoneFromCorners, resolveZone, newId } from '../model.js';
import { setOut, tileSize, tilesToOrder, startOrigin } from '../tiles.js';
import { surfaces, byFinish, byRoom, byWall, thicknessOn } from '../schedule.js';
import { coveringSpec, stableGuid, profileX } from '../covering.js';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + JSON.stringify(d) + ')' : '')); } };
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
const throwsKey = (fn, key) => { try { fn(); return false; } catch (e) { return e.key === key; } };

console.log('== the face of a wall (face.js)');
const W = { guid: 'w1', a: [0, 0], b: [4000, 0], t: 200, height: 2400 };
{
  const L = faceFrame(W, 'left'), R = faceFrame(W, 'right');
  ok(L.len === 4000 && L.h === 100 && L.origin[0] === 0 && L.origin[1] === 100 && L.normal[1] === 1, 'left face of a wall along +x: starts at (0, 100), faces +y', L);
  ok(R.origin[1] === -100 && R.normal[1] === -1, 'right face: starts at (0, -100), faces -y');
  ok(near(planPoint(L, 1500)[0], 1500) && viewerU(L, 1000) === 3000 && viewerU(R, 1000) === 1000, 'a person in front of the left face sees s = 1000 three metres from its left edge; the right face one metre');
  ok(throwsKey(() => faceFrame({ ...W, bulge: 0.2 }, 'left'), 'finishes.err.curved') && throwsKey(() => faceFrame(W, 'top'), 'finishes.err.face'), 'a curved wall and a wrong face are refused with a key');
  const poly = [[-100, -100], [4100, -100], [3900, 100], [100, 100]];   // mitred both ends: the left face (y = 100) is the short one
  const eL = extent(W, 'left', poly), eR = extent(W, 'right', poly);
  ok(eL[0] === 100 && eL[1] === 3900 && eR[0] === -100 && eR[1] === 4100, 'a mitred outline: the left face spans s 100..3900, the right face -100..4100', [eL, eR]);
  ok(extent(W, 'left')[1] === 4000 && extent(W, 'left', [[0, 0]])[1] === 4000, 'no outline: the whole centre line');
  const a = rect(0, 1000, 0, 1000);
  ok(areaOf(subtract(a, [rect(400, 600, 400, 600)])) === 960000 && areaOf(subtract(a, [rect(-100, 1200, -100, 400)])) === 600000, 'a 200 x 200 hole takes 40 000 of 1 000 000; a hole over the bottom 400 takes 400 000');
  ok(inter(a, rect(1000, 2000, 0, 10)) === null && area(openingRect({ offset: 500, width: 900, sill: 0, height: 2100 })) === 1890000, 'edges that only touch overlap in nothing; a door 900 x 2100 is 1 890 000');
}

console.log('== the document (model.js)');
const TILE = { id: 'tile-300', name: 'Wall tile 300 x 300', kind: 'tile', layers: [{ role: 'substrate', material: 'Cement board', thickness: 12.5 }, { role: 'waterproofing', material: 'Liquid membrane', thickness: 1 }, { role: 'adhesive', material: 'Tile adhesive', thickness: 3 }, { role: 'finish', material: 'Ceramic tile', thickness: 8 }], tile: { length: 300, width: 300, joint: 0, waste: 10 } };
const PAINT = { id: 'paint', name: 'Paint on plaster', kind: 'paint', layers: [{ role: 'substrate', material: 'Plaster', thickness: 13 }, { role: 'finish', material: 'Paint', thickness: 0.2 }] };
{
  const raw = { format: 'cadcraft-wall-finishes', version: 1, types: [TILE, PAINT, { id: 'paint', name: 'dup', layers: [{ role: 'finish', thickness: 1 }] }, { id: 'bad', name: 'no layers', layers: [] }, { id: 'bad2', name: 'neg', layers: [{ role: 'finish', thickness: -1 }] }, { id: 'tile0', name: 't', kind: 'tile', layers: [{ role: 'finish', thickness: 5 }], tile: { length: 0, width: 5 } }],
    faces: [{ wall: 'w1', face: 'left', zones: [{ id: 'z1', kind: 'full', type: 'paint', top: true }, { id: 'z2', kind: 'custom', type: 'nope', anchor: 'a', d0: 0, d1: 10, v0: 0, v1: 10 }, { id: 'z3', type: 'tile-300', anchor: 'a', d0: 500, d1: 100, v0: 0, v1: 10 }] }, { wall: 'w1', face: 'left', zones: [] }, { wall: 'w2', face: 'middle' }] };
  const { doc, errors } = cleanDoc(raw);
  ok(doc.types.map((x) => x.id).join() === 'tile-300,paint', 'two good types kept; the duplicate, the empty one, the negative layer and the zero-size tile are left out', doc.types.map((x) => x.id));
  ok(errors.map((e) => e.code).sort().join() === 'face,face,layer,tile,type.dup,type.layers,type.layers,zone.span,zone.type', 'every wrong entry is named (the duplicate type, the empty one, the negative layer and the type left with no layer, the zero tile, a zone of an unknown type, a zone that ends before it starts, a second left face, a face called middle), none thrown', errors.map((e) => e.code));
  ok(doc.faces.length === 1 && doc.faces[0].zones.length === 1 && doc.faces[0].zones[0].anchor === 'fill' && doc.faces[0].zones[0].top, 'one face with the one good zone (a full-height zone follows the wall)');
  ok(cleanDoc(null).doc.faces.length === 0 && cleanDoc({ format: 'other' }).errors[0].code === 'format' && cleanDoc(JSON.parse(JSON.stringify(doc))).errors.length === 0, 'null and a foreign document give an empty one; a clean document round-trips with no errors');
  const T = doc.types[0];
  ok(near(typeThickness(T), 24.5) && buildUp(T)[3].from === 16.5 && buildUp(T)[3].to === 24.5, 'build-up 12.5 + 1 + 3 + 8 = 24.5; the tile layer sits from 16.5 to 24.5 off the wall');
  ok(substrates(T).length === 1 && substrates(T)[0].material === 'Cement board' && tileOf(T).length === 300 && tileOf(doc.types[1]) === null, 'the substrate (BK.27) is read on its own with its material and thickness; a paint has no tile');
  const f = finishedWall(W, 24.5, 13.2);
  ok(f.raw === 200 && near(f.finished, 237.7) && f.left === 24.5, 'a 200 wall with 24.5 on one face and 13.2 on the other measures 237.7 finished');
  ok(newId('z', ['z1', 'z2']) === 'z3' && newId('z', new Set(['z3', 'z1', 'z2'])) === 'z4', 'new ids skip taken ones');
}

console.log('== changes return a new document');
{
  let d = withType(withType(emptyDoc(), TILE), PAINT);
  d = withZone(d, 'w1', 'left', { ...zoneFullHeight(), type: 'paint', kind: 'full' });
  d = withZone(d, 'w1', 'left', { ...zoneShower([1000, 2000], { len: 4000, height: 2400 }), type: 'tile-300' });
  ok(d.types.length === 2 && d.faces.length === 1 && d.faces[0].zones.map((z) => z.id).join() === 'z1,z2', 'two types, one face, two zones numbered z1, z2: the shower wall lies on top');
  const before = JSON.stringify(d);
  const d2 = withZoneMoved(d, 'w1', 'left', 'z2', 'down');
  ok(d2.faces[0].zones.map((z) => z.id).join() === 'z2,z1' && JSON.stringify(d) === before, 'moved one place down; the old document is not touched');
  ok(withZoneMoved(d, 'w1', 'left', 'z2', 'up').faces[0].zones[1].id === 'z2', 'already on top: nothing moves');
  ok(throwsKey(() => withoutType(d, 'paint'), 'finishes.err.typeused') && withoutType(withoutZone(d, 'w1', 'left', 'z1'), 'paint').types.length === 1, 'a type a zone uses is refused; once the zone is gone it can go');
  ok(withZoneChanged(d, 'w1', 'left', 'z2', { type: 'paint' }).faces[0].zones[1].type === 'paint' && throwsKey(() => withZoneChanged(d, 'w1', 'left', 'z2', { type: 'none' }), 'finishes.err.zone.type'), 'a zone changes type; a type that is not there is refused with a key');
  ok(throwsKey(() => withoutZone(d, 'w1', 'right', 'z1'), 'finishes.err.nozone') && withoutZone(withoutZone(d, 'w1', 'left', 'z1'), 'w1', 'left', 'z2').faces.length === 0, 'a zone that is not there is refused; the last zone of a face takes the face with it');
  const k = forgetWalls(d, new Set(['other']));
  ok(k.dropped === 1 && k.doc.faces.length === 0 && d.faces.length === 1, 'walls that are gone take their faces: 1 dropped');
}

console.log('== zones by corners (BK.26)');
{
  const geom = { len: 4000, extent: [0, 4000], height: 2400 };
  const full = zoneFullHeight(), r0 = resolveZone(full, geom);
  ok(r0.rect.s0 === 0 && r0.rect.s1 === 4000 && r0.rect.v1 === 2400 && !r0.clipped, 'full height: the whole face, 4000 x 2400');
  ok(resolveZone(full, { ...geom, len: 3000, extent: [0, 3000], height: 2700 }).rect.v1 === 2700, 'a full-height zone follows the wall when it is made shorter and taller');
  const sp = zoneSplashBack([1000, 2500], geom);
  const rs = resolveZone(sp, geom).rect;
  ok(sp.anchor === 'a' && rs.s0 === 1000 && rs.s1 === 2500 && rs.v0 === 900 && rs.v1 === 1500, 'splash-back between two corners at 1000 and 2500: v 900..1500 (a 900 worktop and 600 up)', rs);
  const sh = zoneShower([3000, 3900], geom);
  ok(sh.anchor === 'b' && sh.d0 === 100 && sh.d1 === 1000 && resolveZone(sh, geom).rect.s0 === 3000 && resolveZone(sh, geom).rect.v1 === 2100, 'a shower wall near the far end is measured from that end: d 100..1000, s 3000..3900, to 2100');
  ok(resolveZone(sh, { ...geom, len: 4500, extent: [0, 4500] }).rect.s0 === 3500, 'the wall is made 500 longer at its far end: the shower wall stays 100..1000 from that end (s 3500..4400)');
  ok(resolveZone(zoneShower([3000, 3900], geom, { height: 0 }), geom).rect.v1 === 2400, 'a shower wall with no height goes up to the top');
  const cz = zoneFromCorners([[500, 100], [1500, 1200]], geom);
  ok(cz.anchor === 'a' && cz.d0 === 500 && cz.d1 === 1500 && cz.v0 === 100 && cz.v1 === 1200, 'two opposite corners make a rectangle');
  ok(zoneFromCorners([[100, 0], [900, 0], [900, 500], [100, 500]], geom).d1 === 900, 'four corners in any order make the same rectangle');
  ok(throwsKey(() => zoneFromCorners([[0, 0], [10, 0], [10, 10]], geom), 'finishes.err.corners') && throwsKey(() => zoneFromCorners([[0, 0], [1000, 0], [900, 500], [0, 500]], geom), 'finishes.err.notrect') && throwsKey(() => zoneFromCorners([[0, 0], [0, 500]], geom), 'finishes.err.emptyzone'), 'three corners, a slanted quadrilateral and a zero-width pick are refused with a key');
  const over = resolveZone({ ...sp, d1: 6000 }, geom);
  ok(over.clipped && over.rect.s1 === 4000 && !over.lost, 'a zone longer than the wall is clipped, and says so');
  ok(resolveZone({ ...sp, d0: 5000, d1: 6000 }, geom).lost && resolveZone({ ...sp, v0: 2500, v1: 2600 }, geom).lost, 'a zone wholly outside the wall (past its end, above its top) is lost');
  ok(resolveZone(zoneFullHeight(), { len: 4000, extent: [100, 3900], height: 2400 }).rect.s0 === 100, 'a mitred face: the full-height zone covers the face\'s own extent 100..3900');
}

console.log('== tile set-out (BK.28)');
const T3 = { length: 300, width: 300, joint: 0, waste: 10 };
const Z = rect(0, 1000, 0, 900);
const run = (o) => setOut({ region: [Z], zone: Z, tile: T3, ...o });
{
  ok(tilesToOrder(12, 0, 10) === 14 && tilesToOrder(10, 2, 0) === 12 && tilesToOrder(9, 3, 5) === 13, 'order = (whole + cut) x (1 + waste): 12 + 10% = 13.2 -> 14; 12 + 0 = 12; 12 + 5% = 12.6 -> 13');
  let r = run({});
  ok(r.whole === 9 && r.cut === 3 && r.order === 14 && r.cutSizes[0].w === 100 && r.cutSizes[0].h === 300 && r.cutSizes[0].count === 3, 'from the bottom-left corner of 1000 x 900 with 300 tiles: 3 x 3 whole, the end column is 100 x 300, three of them (cut)', [r.whole, r.cut, r.cutSizes]);
  ok(near(r.area, 900000) && r.estimated === false, 'net area 1000 x 900');
  r = run({ setout: { start: { kind: 'centre' } } });
  ok(r.whole === 9 && r.cut === 6 && r.cutSizes.length === 1 && r.cutSizes[0].w === 50 && r.cutSizes[0].count === 6, 'centred: whole tiles 50..950 by 3 rows (9), and a 50 x 300 cut on each side, 6 cuts: the cuts are symmetrical', [r.whole, r.cut, r.cutSizes]);
  r = run({ setout: { start: { kind: 'corner', corner: 'br' } } });
  ok(r.whole === 9 && r.cut === 3 && r.cutSizes[0].w === 100 && r.origin.s === 700, 'from the bottom-right corner: tiles end at s = 1000 (the first starts at 700), the 100 cut is on the left');
  r = run({ setout: { start: { kind: 'corner', corner: 'tl' } } });
  ok(r.origin.v === 600 && r.whole === 9, 'from the top-left corner the first tile starts at v = 600');
  r = run({ setout: { start: { kind: 'point', s: 150, v: 0 } } });
  ok(r.origin.s === 150 && r.cut === 6, 'from a point (150, 0): the tile before it is 150 wide inside the zone, the grid then runs 150..450..750..1050 (the last is 250 wide): a cut at each end of each of the 3 rows = 6 cut');
  const door = rect(350, 650, 0, 600);
  r = run({ holes: [door] });
  ok(r.whole === 5 && r.cut === 7 && near(r.area, 900000 - 180000), 'a door 350..650 x 0..600 laid over a grid from the corner: the two columns it crosses each lose 2 tiles to cuts: 5 whole, 7 cut; net 720 000', [r.whole, r.cut]);
  r = run({ holes: [door], setout: { start: { kind: 'opening', opening: 'd', edge: 'right' } }, openings: { d: door } });
  ok(r.origin.s === 650 && r.whole === 7 && r.cut === 6, 'a tile starts on the door\'s right edge: the column 350..650 is exactly the door, its two tiles vanish: 13 left, 7 whole, 6 cut', [r.whole, r.cut]);
  r = run({ holes: [door], setout: { start: { kind: 'opening', opening: 'd', edge: 'left' } }, openings: { d: door } });
  ok(r.origin.s === 50 && r.whole + r.cut > 0, 'a tile ends on the door\'s left edge (350): the grid starts at s = 50');
  r = run({ holes: [rect(0, 1000, 500, 700)], setout: { start: { kind: 'opening', opening: 'w', edge: 'top' } }, openings: { w: rect(0, 1000, 500, 700) } });
  ok(r.origin.v === 700 && r.whole === 3 && r.cut === 13, 'a band 500..700 across the whole wall, tiles start on its top edge (700): rows 700-1000 (cut at 900), 400-700 (cut by the band), 100-400 and -200..100 (cut at 0): 4 + 4 + 1 + 4 = 13 cut, and 3 whole in the row 100-400', [r.origin, r.whole, r.cut]);
  const B = rect(0, 1000, 0, 400), tb = { length: 400, width: 200, joint: 0, waste: 0 };
  r = setOut({ region: [B], zone: B, tile: tb, setout: { pattern: 'brick', shift: 0.5 } });
  ok(r.whole === 4 && r.cut === 2, 'brick 400 x 200 on 1000 x 400, half shift: row 1 has 2 whole + the 200 end, row 2 starts with a 200 cut and has 2 whole: 4 whole, 2 cut', [r.whole, r.cut]);
  r = setOut({ region: [B], zone: B, tile: tb, setout: { pattern: 'grid' } });
  ok(r.whole === 4 && r.cut === 2 && r.rows === 2, 'the same in a straight grid: 2 rows of 2 whole + the 200 end = 4 whole, 2 cut');
  const V = rect(0, 1000, 0, 800), tv = { length: 400, width: 200, joint: 0, waste: 0 };
  r = setOut({ region: [V], zone: V, tile: tv, setout: { direction: 'vertical' } });
  ok(tileSize(tv, 'vertical').w === 200 && tileSize(tv).w === 400 && r.whole === 10 && r.cut === 0, 'vertical: the 400 length runs up the wall: 5 across x 2 up = 10 whole, no cut');
  r = setOut({ region: [Z], zone: Z, tile: { ...T3, joint: 3 }, });
  ok(r.whole === 6 && r.cut === 6, 'a 3 mm joint (pitch 303): columns 0, 303, 606 whole, 909 cut; rows 0, 303 whole, 606 cut (900 is inside the third tile\'s 606..906): 6 whole, 6 cut');
  r = setOut({ region: [rect(0, 600, 0, 600), rect(0, 600, 600, 900)].slice(0, 1), zone: Z, tile: T3 });
  ok(r.whole === 4 && r.cut === 0, 'a zone partly under another one: only its visible part counts (600 x 600 = 4 whole)');
  const big = rect(0, 200000, 0, 100000);
  r = setOut({ region: [big], zone: big, tile: T3, list: false });
  ok(r.estimated && r.cut === 0 && r.whole === Math.ceil(200000 * 100000 / 90000), 'over the tile limit: counted from the area and marked estimated', [r.whole, r.estimated]);
  ok(startOrigin(Z, { w: 300, h: 300 }, { start: { kind: 'opening', opening: 'gone', edge: 'left' } }, {}).s === 0, 'an opening that is not there falls back to the bottom-left corner');
}

console.log('== schedule: what is covered and taken (BK.130)');
const DOC = cleanDoc({ format: 'cadcraft-wall-finishes', version: 1, types: [TILE, PAINT],
  faces: [{ wall: 'w1', face: 'left', zones: [{ id: 'base', kind: 'full', type: 'paint', top: true }, { id: 'shower', kind: 'shower', type: 'tile-300', anchor: 'a', d0: 1000, d1: 2000, v0: 0, v1: 2100 }] },
          { wall: 'w1', face: 'right', zones: [{ id: 'base', kind: 'full', type: 'paint', top: true }] }, { wall: 'gone', face: 'left', zones: [{ id: 'z', kind: 'full', type: 'paint', top: true }] }] }).doc;
const WALL = { ...W, len: 4000, name: 'Wall 200', level: 'L1', extent: { left: [0, 4000], right: [0, 4000] }, openings: [{ id: 'door', kind: 'door', offset: 2500, width: 900, sill: 0, height: 2100 }], room: { left: 'bath', right: 'hall' } };
{
  const S = surfaces(DOC, [WALL], { list: false });
  const row = (id) => S.rows.find((r) => r.id === 'w1:' + id);
  const base = row('left:base'), shower = row('left:shower');
  ok(S.orphans.length === 1 && S.orphans[0].wall === 'gone', 'a face of a wall that is not there is reported, not counted');
  ok(base.gross === 4000 * 2400 - 1000 * 2100 && base.deductions === 900 * 2100 && base.net === 4000 * 2400 - 1000 * 2100 - 900 * 2100, 'paint on the left face: 4000 x 2400 = 9 600 000, less the shower zone laid over it (1000 x 2100 = 2 100 000) = 7 500 000, less the door 1 890 000 = 5 610 000 net');
  ok(near(base.substrateVolume, 5610000 * 13) && near(base.finishVolume, 5610000 * 0.2) && near(base.thickness, 13.2), 'its plaster: 5 610 000 x 13 mm; its paint 5 610 000 x 0.2; build-up 13.2');
  ok(shower.net === 1000 * 2100 && shower.tiles.whole === 3 * 7 && shower.tiles.cut === 7 && shower.tiles.cutSizes[0].w === 100, 'the shower wall 1000 x 2100: 3 columns x 7 rows = 21 whole, and the 100-wide end column of 7 cuts', [shower.tiles.whole, shower.tiles.cut]);
  const rr = row('right:base');
  ok(rr.net === 4000 * 2400 - 900 * 2100 && rr.room === 'hall' && shower.room === 'bath', 'the door cuts both faces: the right face loses it too (7 710 000); each row names its room');
  const F = byFinish(S.rows), P = F.find((x) => x.type === 'paint'), T = F.find((x) => x.type === 'tile-300');
  ok(P.net === base.net + rr.net && P.count === 2 && P.rooms.includes('bath') && P.rooms.includes('hall') && T.net === 2100000, 'per finish: paint = both faces (13 320 000), tile = the shower wall (2 100 000)');
  ok(T.layers.length === 4 && near(T.layers[0].volume, 2100000 * 12.5) && near(T.volume, 2100000 * 24.5), 'tile build-up by layer: the board is 2 100 000 x 12.5; every layer 24.5 thick');
  const R = byRoom(S.rows), bath = R.find((x) => x.room === 'bath');
  ok(R.length === 2 && bath.net === base.net + shower.net && bath.finishes.length === 2, 'per room: the bathroom has the left face (paint + tile): 7 710 000, two finishes');
  const Wl = byWall(S.rows)[0];
  ok(Wl.left === 24.5 && near(Wl.right, 13.2) && thicknessOn(S.rows, 'w1', 'left') === 24.5, 'the left face now carries up to 24.5 (the shower wall), the right face 13.2: what Wall finish adds to each side');
  const moved = surfaces(DOC, [{ ...WALL, a: [50, 50], b: [4050, 50] }]).rows.find((r) => r.id === 'w1:left:shower');
  ok(moved.net === shower.net, 'the wall moved as a whole: the same zone, the same area');
  const swapped = surfaces(DOC, [{ ...WALL, t: 300 }]).rows.find((r) => r.id === 'w1:left:shower');
  ok(swapped.net === shower.net, 'the wall\'s type swapped to 300 thick: the zone is unchanged (face coordinates do not depend on thickness)');
  const shorter = surfaces(DOC, [{ ...WALL, len: 1500, extent: { left: [0, 1500], right: [0, 1500] }, openings: [] }]).rows.find((r) => r.id === 'w1:left:shower');
  ok(shorter.clipped && shorter.net === 500 * 2100, 'the wall shortened to 1500: the shower wall 1000..2000 is clipped to 1000..1500 and says so');
  const gone = surfaces(DOC, [{ ...WALL, len: 800, extent: { left: [0, 800], right: [0, 800] }, openings: [] }]).rows.find((r) => r.id === 'w1:left:shower');
  ok(gone.lost && gone.net === 0 && !byFinish([gone]).length, 'the wall shortened to 800: the zone is lost, counted as nothing, still listed');
}

console.log('== IfcCovering description');
{
  const S = surfaces(DOC, [WALL]), sh = S.rows.find((r) => r.id === 'w1:left:shower'), base = S.rows.find((r) => r.id === 'w1:left:base');
  const c = coveringSpec(sh, { ...WALL, baseZ: 0 }, DOC);
  ok(c.predefined === 'CLADDING' && c.guid.length === 22 && /^[0-3]/.test(c.guid) && c.guid === coveringSpec(sh, WALL, DOC).guid && c.guid !== coveringSpec(base, WALL, DOC).guid, 'one IfcCovering, CLADDING, a 22-character GlobalId that is the same each time for the same zone and differs between zones');
  ok(c.frame.origin[1] === 100 && c.frame.z[1] === 1 && c.frame.x[0] === -1 && c.thickness === 24.5, 'on the left face: origin (0, 100), out of the wall along +y, its X runs against the wall (so Y can point up)');
  ok(c.profiles.length === 1 && c.profiles[0][0][0] === -2000 && c.profiles[0][1][0] === -1000 && c.profiles[0][2][1] === 2100 && near(c.area, 2100000), 'the shower wall s 1000..2000 -> X -2000..-1000, up to 2100');
  const cb = coveringSpec(base, WALL, DOC);
  ok(cb.profiles.length >= 3 && near(cb.profiles.reduce((s, p) => s + (p[1][0] - p[0][0]) * (p[2][1] - p[1][1]), 0), base.net), 'the paint is described as rectangles that leave out the shower wall and the door: their area is the net area', cb.profiles.length);
  ok(profileX('right', 500) === 500 && stableGuid('a') !== stableGuid('b') && stableGuid('a').length === 22, 'the right face X runs with s; a GlobalId depends on its key');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
