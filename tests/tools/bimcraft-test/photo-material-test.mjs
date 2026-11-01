/* SPDX-License-Identifier: Apache-2.0 */
/**
 * photo-material-test.mjs — `node bin/test-bimcraft.mjs --photo` (0.8 EG.62, BimCraft half): a material made from a photo is kept in the
 * IFC (CadCraft_PhotoMaterials), paints like a library material, survives save and reopen, and undo takes it away. cc-ifc, no browser;
 * the real photo through the Paint palette is tools/bimcraft-test/browser-photo.mjs.
 */
import path from 'node:path';
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';

export async function photoMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  register('data:text/javascript,' + encodeURIComponent(`export async function resolve(s, c, next) { return s === 'three' ? { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/three/current/three.module.js')).href)}, shortCircuit: true } : next(s, c); }`));
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const PB = await import(path.join(APP, 'paint-bim.js'));
  const PM = await import(path.join(APP, 'photo-materials.js'));
  const MAT = await import(path.join(APP, 'render/materials.js'));
  let bad = 0, good = 0;
  const ok = (c, label, detail = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + label + (detail ? ' (' + detail + ')' : '')); };

  // a made-up "photo": seeded blobs lit from the left (the same idea as test-photo-material.mjs)
  const photo = (w, h, seed = 3) => {
    let a = seed >>> 0; const rnd = () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const d = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const l = 0.55 + 0.45 * (1 - x / w), n = 0.5 + 0.5 * rnd(), o = (y * w + x) * 4; d[o] = 150 * n * l; d[o + 1] = 90 * n * l; d[o + 2] = 70 * n * l; d[o + 3] = 255; }
    return { w, h, data: d };
  };

  console.log('== Make a material from a photo');
  const made = PM.makeFromPhoto(photo(600, 600), { name: 'Garden brick', size: 0.9, roughness: 0.7 });
  const rec = made.record;
  ok(PM.ID_RE.test(rec.id) && rec.name === 'Garden brick' && rec.size === 0.9 && rec.rough === 0.7, 'a record with an id, the name, the tile size and the roughness', rec.id);
  ok(/^#[0-9a-f]{6}$/.test(rec.color) && made.maps.color.w === 512 && made.maps.normal.w === 512 && made.maps.roughness.w === 512, 'colour, roughness and normal maps of 512 px; a mean colour for flat views');
  ok(rec.png.length > 1000 && rec.png.length < 1_500_000, 'the colour tile kept as a PNG, about half a megabyte at most', Math.round(rec.png.length / 1024) + ' KB');
  const bytes64 = PM.fromBase64(rec.png);
  ok(bytes64[0] === 137 && bytes64[1] === 80 && PM.toBase64(bytes64) === rec.png, 'base64 round trip; the bytes are a PNG');
  let threw = false; try { PM.makeFromPhoto({ w: 4, h: 4, data: new Uint8Array(64) }, {}); } catch (e) { threw = e instanceof RangeError; }
  ok(threw, 'a picture under 16 px is refused');

  console.log('== Keep it in the file and paint with it');
  const lv = (n, h) => N.stackLevels(n, h, (i) => 'Level ' + (i + 1));
  const text = N.newBuilding({ name: 'Photo test', levels: lv(2, 3000), fileName: 'p.ifc', now: new Date('2026-10-30T12:00:00Z') });
  const engine = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => engine.load(b))(new TextEncoder().encode(text));
  const ed = new IfcEditor(WebIFC, engine);
  let snap = OPS.snapshotModel(ed);
  const P = [[0, 0], [6000, 0], [6000, 4000], [0, 4000]];
  ed.modelChange(OPS.drawWalls({ storey: snap.levels[0].guid, segs: P.map((p, i) => ({ a: p, b: P[(i + 1) % 4] })), typeKey: 'ext-2x6', topLevel: snap.levels[1].guid }), { label: 'walls' });
  snap = OPS.snapshotModel(ed);
  const w = new ModelWriter(ed.W, ed.api, ed.mid);
  const W0 = w.byGuid(snap.walls[0].guid);
  ok(PM.readRecords(ed.api, ed.mid).records.length === 0, 'a new file has none');
  const n0 = ed.changes.length;
  ed.modelChange(PM.writeOp([rec]), { label: 'Garden brick', verb: 'Made' });
  ok(ed.changes.length === n0 + 1, 'one undo step');
  let got = PM.readRecords(ed.api, ed.mid);
  ok(got.records.length === 1 && got.bad === 0 && got.records[0].png === rec.png && got.records[0].size === 0.9, 'the file says it: same id, same PNG, same tile size');
  // paint: needs the registry to know the id first (the order the app uses: refresh, then paint)
  threw = false; try { PB.paintOp({ ids: [W0], mat: rec.id }); } catch { threw = true; }
  ok(threw, 'before the registry knows the id, painting with it is refused');
  await PM.refresh([{ api: ed.api, mid: ed.mid }], async (b) => ({ w: 512, h: 512, data: new Uint8Array(512 * 512 * 4).fill(200) }));
  ok(MAT.isMaterialId(rec.id) && MAT.material(rec.id).name === 'Garden brick' && MAT.material(rec.id).cat === 'mine', 'refresh puts it in the registry like a library material');
  ok(MAT.material(rec.id).photo.pixels && MAT.material(rec.id).photo.pixels.w === 512, 'the tile is decoded for the views', '');
  const layers = MAT.materialLayers(rec.id);
  ok(layers && layers.base.length === 512 * 512 * 4 && layers.normal.length === 512 * 512 * 4 && layers.data.length === 512 * 512 * 4, 'the renderer\'s baked layers (colour, roughness, normal) are worked out from the tile');
  ed.modelChange(PB.paintOp({ ids: [W0], mat: rec.id }), { label: 'Garden brick', verb: 'Painted' });
  let paint = PB.readPaint(ed.api, ed.mid);
  ok(paint.get(W0)?.all === rec.id, 'CadCraft_Render.Material = the photo material\'s id');

  console.log('== Save, reopen');
  const saved = ed.save();
  const back = await quiet(IfcModel.create)(WebIFC, null);
  await quiet((b) => back.load(b))(saved);
  const again = PM.readRecords(back.api, back.model?.modelID ?? back.mid ?? 0);
  ok(again.records.length === 1 && again.records[0].png === rec.png, 'reopened: the material and its picture came with the file');
  const ed2 = new IfcEditor(WebIFC, back);
  ok(PM.readRecords(ed2.api, ed2.mid).records[0]?.id === rec.id, 'and through an editor');

  console.log('== Undo, redo, remove');
  ed.undo();
  ok(!PB.readPaint(ed.api, ed.mid).has(W0), 'undo takes the paint off');
  ed.undo();
  ok(PM.readRecords(ed.api, ed.mid).records.length === 0, 'undo again: the material is gone from the file');
  ed.redo(); ed.redo();
  ok(PM.readRecords(ed.api, ed.mid).records.length === 1 && PB.readPaint(ed.api, ed.mid).get(W0)?.all === rec.id, 'redo twice: both are back');
  ed.modelChange(PM.writeOp([]), { label: 'Remove', verb: 'Removed' });
  ok(PM.readRecords(ed.api, ed.mid).records.length === 0, 'writing an empty list removes it from the file');
  await PM.refresh([{ api: ed.api, mid: ed.mid }], null);
  ok(!MAT.isMaterialId(rec.id) && !PB.readPaint(ed.api, ed.mid).size, 'the registry forgets it; an element still naming it reads as not painted (no crash)');

  console.log('== Bad data is dropped, not guessed at');
  threw = false; try { PM.writeOp([{ ...rec, id: 'brick-red' }]); } catch { threw = true; }
  ok(threw, 'an id that is not photo-<8 hex> is refused');
  threw = false; try { PM.writeOp([{ ...rec, size: 0 }]); } catch { threw = true; }
  ok(threw, 'a tile size of 0 is refused');
  threw = false; try { PM.writeOp(Array.from({ length: 41 }, (_, i) => ({ ...rec, id: 'photo-' + i.toString(16).padStart(8, '0') }))); } catch { threw = true; }
  ok(threw, 'more than 40 is refused');

  console.log((bad ? 'FAIL ' : 'ok   ') + good + ' passed, ' + bad + ' failed');
  return bad ? 1 : 0;
}
