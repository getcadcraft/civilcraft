/* SPDX-License-Identifier: Apache-2.0 */
/** picture-paste-test.mjs — a copied area pasted as a picture (0.8 D8.15):  node bin/test-bimcraft.mjs --picture  (runs after picture2-test.mjs)
 *  areaclip.js byte copy in step; picture-paste.js: which paste wins, the size (real / paper / after a shrink), the overlay opacity; then one
 *  pasted area in a model: one undo step, saved and read back at its size. */
import path from 'node:path';
import fs from 'node:fs';

export async function picturePaste({ APP, ROOT, WebIFC, IfcModel, quiet, ok, makePng }) {
  const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;
  ok(fs.readFileSync(path.join(ROOT, 'public_html/assets/apps/markupcraft/dev/areaclip.js')).equals(fs.readFileSync(path.join(APP, 'areaclip.js'))), 'the BimCraft copy of areaclip.js is byte-identical to MarkupCraft\'s (node tools/areaclip/sync.mjs)');
  const AC = await import(path.join(APP, 'areaclip.js'));
  const PP = await import(path.join(APP, 'picture-paste.js'));
  const png = makePng(400, 250), src = 'data:image/png;base64,' + Buffer.from(png).toString('base64');
  const now = Date.parse('2026-10-30T12:00:00Z'), ago = (ms) => new Date(now - ms).toISOString();
  const real = AC.makeAreaClip({ src, ptPerPx: 0.48, real: { mmPerPx: 25, unit: 'mm' }, overlay: { opacity: 0.35, tint: '#d0312d' }, label: 'Ground floor', sheet: 'A-101', at: ago(60000) });
  const paper = AC.makeAreaClip({ src, ptPerPx: 0.48, at: ago(60000) });
  ok(real && paper && real.px[0] === 400 && !paper.real, 'two clips from the Copy area format: with a drawing scale, and without');

  // ---- reading the clip back (untrusted)
  const mem = (v) => ({ getItem: (k) => (k === AC.AREA_KEY ? v : null) });
  ok(PP.readAreaClip(mem(JSON.stringify(real)))?.real?.mmPerPx === 25, 'readAreaClip: the clip in localStorage "cadcraft.areaclip"');
  ok(PP.readAreaClip(mem('{nope')) === null && PP.readAreaClip(mem(JSON.stringify({ ...real, src: 'data:image/png;base64,AAAA' }))) === null && PP.readAreaClip(mem(null)) === null && PP.readAreaClip(null) === null, 'readAreaClip: bad JSON, a picture that is not a PNG, nothing stored → null');
  ok(PP.readAreaClip({ getItem: () => { throw new Error('denied'); } }) === null, 'readAreaClip: storage that refuses → null');

  // ---- which paste wins
  const own = (ms) => ({ kind: 'placement', copiedAt: ago(ms) });
  ok(PP.areaWins(real, null, now), 'an area clip and no BimCraft clip: the area');
  ok(PP.areaWins(real, own(120000), now) && !PP.areaWins(real, own(1000), now), 'the newer of the two wins (BimCraft copied 2 min ago: area; 1 s ago: BimCraft)');
  ok(!PP.areaWins({ ...real, at: ago(7 * 3600e3) }, null, now) && !PP.areaWins({ ...real, at: 'soon' }, null, now) && !PP.areaWins(null, null, now), 'an area copied 7 hours ago, or with no readable time, does not paste by surprise');
  ok(PP.areaWins(real, { copiedAt: '' }, now), 'a BimCraft clip with no readable time loses to a recent area');
  const R = (o) => PP.route({ now, ...o });
  ok(R({ area: real, image: { w: 400, h: 250 } }) === 'image-area', 'Ctrl+V with the area\'s own picture on the system clipboard (same pixel size): the sized area');
  ok(R({ area: real, image: { w: 401, h: 250 } }) === 'image' && R({ image: { w: 10, h: 10 }, own: own(1), ownOk: true }) === 'image', 'another picture on the system clipboard: a plain picture (even with a BimCraft clip)');
  ok(R({ area: { ...real, at: ago(7 * 3600e3) }, image: { w: 400, h: 250 } }) === 'image', 'the area\'s size but an old clip: a plain picture');
  ok(R({ area: real }) === 'area' && R({ area: real, own: own(1), ownOk: true }) === 'own' && R({ own: own(1), ownOk: true }) === 'own' && R({}) === 'none', 'no picture on the clipboard: the area when newer, else BimCraft\'s own paste, else nothing');

  // ---- size and patch
  let s = PP.pasteSize(real, 400);
  ok(near(s.mmPerPx, 25) && s.scaled && s.use === 'real', 'with a drawing scale: 25 mm per pixel, scaled (true size)');
  s = PP.pasteSize(real, 200);
  ok(near(s.mmPerPx, 50), 'brought down to half the pixels: 50 mm per pixel, the same 10 m on the plan');
  s = PP.pasteSize(paper, 400);
  ok(near(s.mmPerPx, 0.48 * 25.4 / 72) && !s.scaled && s.use === 'paper', 'without one: paper size (' + s.mmPerPx.toFixed(4) + ' mm per pixel), not scaled yet');
  const pt = PP.pastePatch(real, { w: 400, h: 250 }, [1200, -300]);
  ok(pt.x === 1200 && pt.y === -300 && pt.opacity === 0.35 && pt.scaled, 'the patch: centred on the pointer, the overlay\'s opacity');
  ok(!('opacity' in PP.pastePatch(paper, { w: 400, h: 250 }, [0, 0])), 'no overlay: opacity left at the picture default');
  ok(Buffer.from(PP.pngBytes(src)).equals(Buffer.from(png)), 'pngBytes: the data URL back to the same bytes');
  ok(PP.areaName(real) === 'Ground floor' && PP.areaName({ sheet: 'A-101' }) === 'A-101' && PP.areaName(paper) === '', 'the name: label, else sheet, else the host\'s "Pasted picture"');

  // ---- in a model: one undo step, saved at its size
  const P = await import(path.join(APP, 'picture.js'));
  const MP = await import(path.join(APP, 'model-picture.js'));
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const open = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return new IfcEditor(WebIFC, eng); };
  const text = N.newBuilding({ name: 'D815', levels: N.stackLevels(1, 3000, () => 'Level 1'), fileName: 'p.ifc', now: new Date('2026-10-30T12:00:00Z') });
  const ed = await open(new TextEncoder().encode(text));
  const lv = OPS.snapshotModel(ed).levels;
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const n0 = ed.changes.length, bytes = PP.pngBytes(real.src);
  ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes, name: PP.areaName(real), embed: true, patch: PP.pastePatch(real, P.sniff(bytes), [5000, 2000]) }), { label: 'Ground floor' });
  ok(ed.changes.length === n0 + 1, 'the paste is one undo step');
  const re = await open(ed.save());
  const got = MP.readPictures(new ModelWriter(WebIFC, re.api, re.mid))[0];
  ok(got && got.name === 'Ground floor' && near(got.w * got.mmPerPx, 10000, 1e-3) && got.scaled && near(got.opacity, 0.35) && got.x === 5000 && got.y === 2000, 'saved and opened again: 10 m wide on the plan, scaled, 35 % opaque, where it was pasted');
  ed.undo();
  ok(MP.readPictures(W()).length === 0, 'one undo takes the pasted area out');
}
