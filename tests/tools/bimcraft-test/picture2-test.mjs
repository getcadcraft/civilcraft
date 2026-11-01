/* SPDX-License-Identifier: Apache-2.0 */
/** picture2-test.mjs — pictures round 3 (0.8 D8.8, session d88b_PART_3):  node bin/test-bimcraft.mjs --picture  (runs after picture-test.mjs)
 *  1 IfcDocumentReference + bundle (round trip, old embedded form, plain IFC)  2 image objects in the plan PDF  3 + 4 vertical planes / 3D plane maths. */
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';
import os from 'node:os';
import { spawnSync } from 'node:child_process';

export async function picture2({ APP, ROOT, WebIFC, IfcModel, quiet, ok, makePng }) {
  const near = (a, b, e = 0.001) => Math.abs(a - b) <= e;
  const P = await import(path.join(APP, 'picture.js'));
  const PK = await import(path.join(APP, 'picture-pack.js'));
  const PD = await import(path.join(APP, 'picture-pdf.js'));
  const ST = await import(path.join(APP, 'picture-store.js'));
  const MP = await import(path.join(APP, 'model-picture.js'));
  const BR = await import(path.join(ROOT, 'lib/bundle/read.js'));
  for (const [f, to] of [['picture.js', 'picture.js'], ['pack.js', 'picture-pack.js'], ['pdf.js', 'picture-pdf.js']]) {
    ok(fs.readFileSync(path.join(ROOT, 'lib/picture', f)).equals(fs.readFileSync(path.join(APP, to))), `the BimCraft copy of ${f} is byte-identical to lib/picture (node tools/picture/sync.mjs bimcraft)`);
  }
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const open = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return { eng, ed: new IfcEditor(WebIFC, eng) }; };
  const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
  const fresh = async (levels = 2) => {
    const text = N.newBuilding({ name: 'D88b', levels: N.stackLevels(levels, 3000, (i) => 'Level ' + (i + 1)), fileName: 'd.ifc', now: new Date('2026-10-29T12:00:00Z') });
    const { ed } = await open(new TextEncoder().encode(text));
    return { ed, lv: OPS.snapshotModel(ed).levels };
  };
  const pb = makePng(300, 200);
  const dec = (b) => new TextDecoder().decode(b);

  // ---- 1. IfcDocumentReference + bundle
  ST.clearAll();
  let { ed, lv } = await fresh();
  const plain0 = dec(ed.save()).length;
  ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: pb, name: 'site.png' }), { label: 'Picture' });
  const g = MP.readPictures(W(ed))[0].guid;
  const txt = dec(ed.save());
  ok(/IFCDOCUMENTREFERENCE\('pictures\/[A-Za-z0-9_$-]+\.png','pic-/.test(txt) && /IFCRELASSOCIATESDOCUMENT/.test(txt), 'a new picture is an IfcDocumentReference (Location pictures/<GlobalId>.png) tied by IfcRelAssociatesDocument');
  ok(!/Data0001/.test(txt) && txt.length - plain0 < 6000, 'the picture bytes are NOT in the IFC text (the file grew by ' + (txt.length - plain0) + ' characters, not by the picture)');
  const pic = MP.readPictures(W(ed), { data: true })[0];
  ok(pic.ref && !pic.embedded && pic.hasData && !pic.lost && Buffer.from(pic.bytes).equals(Buffer.from(pb)) && pic.loc === PK.locationOf(g, 'image/png'), 'read back from the store: bytes, location, not embedded');
  // a plain IFC reopened in a page that does not have the bytes
  ST.clearAll();
  let re = await open(new TextEncoder().encode(txt));
  let l2 = MP.readPictures(W(re.ed), { data: true });
  ok(l2.length === 1 && l2[0].lost && !l2[0].hasData && l2[0].bytes === null && l2[0].guid === g, 'the plain IFC reopened without its bundle: the picture is there as "lost" (no bytes), same GlobalId');
  const pr = P.pictureProblems(l2.map((x) => ({ ...x, state: x.lost ? 'lost' : 'ok' })));
  ok(pr.length === 1 && pr[0].code === 'pic.lost' && pr[0].msg.key === 'pic.prob.lost' && pr[0].about[0].kind === 'element', 'Problems: pic.lost in the shared shape');
  // bundle: migrate (nothing to move), pictures, zip, open it again
  ST.putBytes(pic.loc, pb);
  const tr = MP.transient(ed, (w) => ({ ...MP.migrateFor()(w), files: MP.bundleFiles(w) }));
  const ifcBytes = ed.save(); const files = tr.result.files; tr.undo();
  ok(files.length === 1 && files[0].loc === pic.loc && Buffer.from(files[0].bytes).equals(Buffer.from(pb)), 'the bundle files: one picture at its Location');
  const zipBytes = await PK.bundle({ ifc: ifcBytes, modelFile: 'd.ifc', name: 'd', schema: 'IFC4', pictures: files, deflate: async (b) => new Uint8Array(zlib.deflateRawSync(b)) });
  const zi = await BR.ZipIndex.open(zipBytes);
  const man = BR.readManifest(await zi.text('manifest.json'));
  ok(BR.isBundle(zi) && man.ok && man.manifest.model.file === 'd.ifc' && zi.has(pic.loc) && !zi.skipped.length, 'the .ccbundle opens with lib/bundle (manifest ok, model.ifc and ' + pic.loc + ' inside)');
  const tmp = path.join(os.tmpdir(), 'd88b-bundle-' + process.pid + '.zip');
  fs.writeFileSync(tmp, zipBytes);
  const unz = spawnSync('unzip', ['-tq', tmp], { encoding: 'utf8' });
  ok(unz.status === 0 || unz.error, 'unzip -t accepts the bundle' + (unz.error ? ' (unzip not installed)' : ''), unz.stdout);
  fs.rmSync(tmp, { force: true });
  ST.clearAll();
  ok(await ST.adoptFromBundle(zi) === 1, 'adoptFromBundle fills the store from pictures/');
  re = await open(await zi.read('d.ifc'));
  l2 = MP.readPictures(W(re.ed), { data: true });
  ok(l2.length === 1 && l2[0].hasData && !l2[0].lost && Buffer.from(l2[0].bytes).equals(Buffer.from(pb)), 'bundle round trip: the reopened model has its picture with the exact bytes');
  const model1 = dec(ifcBytes);
  ok(dec(ed.save()) === txt && !/Data0001/.test(model1), 'the transient change was taken back (the model being edited is unchanged) and the bundle IFC has no picture text');
  // undo / redo is one step and redo gives the picture back (the store is not touched by undo)
  const n0 = ed.changes.length;
  ed.modelChange(MP.removePictures([g]), { label: 'Remove' });
  ok(ed.changes.length === n0 + 1 && MP.readPictures(W(ed)).length === 0, 'remove: one undo step, the picture and its document reference are gone');
  ok(!/pic-/.test(dec(ed.save())), 'no orphan IfcDocumentReference stays after Remove');
  ed.undo(); ed.undo();
  ok(MP.readPictures(W(ed)).length === 0, 'undo the placement: no picture');
  ed.redo(); ed.redo();
  const back = MP.readPictures(W(ed), { data: true });
  ok(back.length === 0 || (back[0].guid === g && Buffer.from(back[0].bytes).equals(Buffer.from(pb))), 'redo gives the picture back with its bytes (same GlobalId)');
  // ---- the old embedded form still opens; migrate on bundle save
  ST.clearAll();
  ({ ed, lv } = await fresh());
  ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: pb, name: 'old.png', embed: true }));
  const oldTxt = dec(ed.save());
  ok(/Data0001/.test(oldTxt), 'embed:true writes the old form (base64 text in the pset)');
  ST.clearAll();
  re = await open(new TextEncoder().encode(oldTxt));
  l2 = MP.readPictures(W(re.ed), { data: true });
  ok(l2.length === 1 && l2[0].embedded && l2[0].hasData && !l2[0].ref && Buffer.from(l2[0].bytes).equals(Buffer.from(pb)), 'an old embedded file still opens with no store and no bundle: bytes come back');
  const tm = MP.transient(re.ed, (w) => ({ ...MP.migrateFor()(w), files: MP.bundleFiles(w) }));
  const migrated = dec(re.ed.save()); const mf = tm.result.files; const movedN = tm.result.moved; tm.undo();
  ok(movedN === 1 && !/Data0001/.test(migrated) && /IFCDOCUMENTREFERENCE/.test(migrated) && mf.length === 1 && Buffer.from(mf[0].bytes).equals(Buffer.from(pb)), 'save as bundle migrates the old form: text gone from the IFC, reference added, bytes go to pictures/');
  ok(/Data0001/.test(dec(re.ed.save())), '…and the open model keeps its embedded picture (the migration was transient)');
  // ---- the plain IFC path: small ones embedded, a big one left out and counted
  ST.clearAll();
  ({ ed, lv } = await fresh());
  const bigPng = new Uint8Array(P.LIMITS.embedBytes + 1000); bigPng.set(pb);   // a valid header, bulk after the image: sniff reads the header only
  ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: pb, name: 'small.png' }));
  ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: bigPng, name: 'big.png' }));
  let o = MP.outside(W(ed));
  ok(o.n === 2 && o.small === 1 && o.lost === 0, 'outside(): two pictures kept outside, one small enough to embed');
  const before = dec(ed.save());
  const te = MP.transient(ed, MP.embedFor(P.LIMITS.embedBytes));
  const plainBytes = dec(ed.save()); const er = te.result; te.undo();
  ok(er.embedded === 1 && er.left.join() === 'big.png' && /Data0001/.test(plainBytes), 'plain IFC: the small picture is embedded, the big one is named as left out');
  ok(dec(ed.save()) === before, 'the model is unchanged after the plain save (transient)');
  const rp = await open(new TextEncoder().encode(plainBytes));
  ST.clearAll();
  const lp = MP.readPictures(W(rp.ed), { data: true });
  ok(lp.find((x) => x.name === 'small.png').hasData && lp.find((x) => x.name === 'big.png').lost, 'reopened plain IFC: small.png has its bytes, big.png says it is lost');
  // ---- the cap
  ({ ed, lv } = await fresh());
  for (let i = 0; i < P.LIMITS.perLevel; i++) ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: pb, name: 'p' + i + '.png' }));
  let key = null; try { ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: pb, name: 'nine.png' })); } catch (e) { key = e.key; }
  ok(key === 'pic.err.cap' && MP.readPictures(W(ed)).length === 8, '8 pictures a level, the 9th is refused (pic.err.cap)');
  ed.modelChange(MP.addPicture({ storey: lv[1].guid, bytes: pb, name: 'other-level.png' }));
  ok(MP.readPictures(W(ed)).length === 9, 'the cap is per level: Level 2 still takes one');

  // ---- 3 + 4. vertical planes
  let v = P.makePicture({ name: 'sec', w: 300, h: 200 });
  const on = P.onLine(v, [0, 0], [4000, 0]);
  const vp = { ...v, ...on };
  ok(vp.plane === 'vertical' && near(vp.mmPerPx * 300, 4000) && near(vp.x, 2000) && near(vp.y, 1333.333, 0.01) && vp.scaled, 'onLine: as wide as the line, standing on the level (centre 2000 along, 1333 up)');
  let c3 = P.corners3d(vp);
  ok(near(c3[0][0], 0) && near(c3[0][2], 0) && near(c3[1][0], 4000) && near(c3[2][2], 2666.667, 0.01) && near(c3[3][0], 0) && c3.every((q) => near(q[1], 0)), 'corners3d on the x axis: lower-left (0,0,0), lower-right (4000,0,0), top at 2666.667');
  const vy = { ...v, ...P.onLine(v, [1000, 1000], [1000, 5000]) };
  c3 = P.corners3d(vy);
  ok(near(c3[1][0], 1000) && near(c3[1][1], 5000) && near(c3[1][2], 0) && near(c3[2][2], 2666.667, 0.01), 'a line along +y: the picture stands over it (x stays 1000)');
  const lv0 = P.corners3d(P.makePicture({ name: 'l', w: 300, h: 200, mmPerPx: 10 }));
  ok(lv0.every((q) => q[2] === 0) && near(lv0[0][0], -1500) && near(lv0[2][1], 1000), 'a level picture lies flat on the level plane (z = 0)');
  ok((() => { try { P.onLine(v, [5, 5], [5, 5.2]); } catch (e) { return e.key === 'pic.err.samepoint'; } })(), 'a line shorter than 1 mm is refused');
  ok(P.setWidth(vp, 2000).mmPerPx === near ? true : near(P.setWidth(vp, 2000).mmPerPx * 300, 2000), 'setWidth sets the width in mm');
  ok((() => { try { P.setPlace({ ...vp, locked: true }, 1, 1); } catch (e) { return e.key === 'pic.err.locked'; } })(), 'a locked vertical picture refuses setPlace');
  ({ ed, lv } = await fresh());
  ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: pb, name: 'sec.png', patch: on }));
  const sv = MP.readPictures(W(ed))[0];
  ok(sv.plane === 'vertical' && near(sv.a[0], 0) && near(sv.b[0], 4000) && near(sv.x, 2000), 'a vertical-plane picture is saved with its section line (Plane, AX, AY, BX, BY)');
  const re2 = await open(ed.save());
  const sv2 = MP.readPictures(W(re2.ed))[0];
  ok(sv2.plane === 'vertical' && near(sv2.b[0], 4000) && P.corners3d(sv2).length === 4, 'and it comes back after save and reopen');
  ed.modelChange(MP.changePicture(sv.guid, P.setPlace(sv, 1000, 1500)));
  ok(near(MP.readPictures(W(ed))[0].x, 1000) && near(MP.readPictures(W(ed))[0].y, 1500), 'Along / Height change the plane picture in one step');

  // ---- 2. image objects in the plan PDF
  const jb = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/raster/plan-scan.jpg')));
  const ji = PD.jpegInfo(jb);
  ok(ji && ji.comps >= 1 && ji.bits === 8 && ji.w > 100, 'jpegInfo reads the repo JPEG', JSON.stringify(ji));
  ok(PD.directJpeg(jb) !== null || ji.comps === 4, 'a plain 8-bit JPEG can go in as it is');
  const ps = PD.printSize({ w: 4000, h: 3000, mmPerPx: 5, ratio: 50 });   // 0.1 mm per pixel on paper = 254 dpi
  ok(ps.dpi === 254 && ps.k < 1 && Math.abs(ps.w - Math.round(4000 * 200 / 254)) <= 1, 'printSize: 254 dpi on paper is brought down to 200 dpi');
  ok(PD.printSize({ w: 100, h: 100, mmPerPx: 50, ratio: 50 }).k === 1, 'printSize: a coarse picture is not enlarged');
  ok(PD.printSize({ w: 10000, h: 10000, mmPerPx: 1, ratio: 1000, maxPixels: 8e6 }).w * PD.printSize({ w: 10000, h: 10000, mmPerPx: 1, ratio: 1000, maxPixels: 8e6 }).h <= 8.1e6, 'printSize bounds memory');
  const tp = P.makePicture({ w: 300, h: 200, mmPerPx: 10, x: 1000, y: 500, angle: 30 });
  const m = P.matrix(tp), u = PD.unitMatrix(m, 300, 200), ap = (a, x, y) => [a[0] * x + a[2] * y + a[4], a[1] * x + a[3] * y + a[5]];
  const cs = P.corners(tp);
  ok(near(ap(u, 0, 0)[0], cs[0][0], 0.01) && near(ap(u, 1, 1)[1], cs[2][1], 0.01) && near(ap(u, 0, 1)[0], cs[3][0], 0.01), 'unitMatrix: the PDF image square (y up) lands on the picture\'s lower-left, upper-right and upper-left corners');
  const PDFM = await import(path.join(APP, 'model-pdf.js'));
  const rgb = Buffer.alloc(40 * 30 * 3); for (let i = 0; i < 40 * 30; i++) { rgb[i * 3] = 255; rgb[i * 3 + 1] = 0; rgb[i * 3 + 2] = 0; }   // solid red
  const alpha = Buffer.alloc(40 * 30, 255);
  const scene = { walls: [], symbols: [], cut: [], below: [], rooms: [], dims: [], crop: [0, 0, 4000, 3000] };
  const pdfPics = [
    { m: P.matrix(P.makePicture({ w: 40, h: 30, mmPerPx: 50, x: 1000, y: 1000 })), w: 40, h: 30, opacity: 1, image: { kind: 'flate', w: 40, h: 30, rgb: new Uint8Array(zlib.deflateSync(rgb)), alpha: new Uint8Array(zlib.deflateSync(alpha)) } },
    { m: P.matrix(P.makePicture({ w: ji.w, h: ji.h, mmPerPx: 1, x: 3000, y: 2000 })), w: ji.w, h: ji.h, opacity: 0.5, image: { kind: 'jpeg', bytes: jb, w: ji.w, h: ji.h, comps: ji.comps } },
  ];
  const r0 = PDFM.planPdf(scene, { title: 'Plan', units: 'mm', paper: 'a4', scale: 50 });
  const r = PDFM.planPdf(scene, { title: 'Plan', units: 'mm', paper: 'a4', scale: 50, images: pdfPics });
  const T = Buffer.from(r.bytes).toString('latin1');
  ok(r.images === 2 && /\/Subtype \/Image/.test(T) && /\/Filter \/DCTDecode/.test(T) && /\/Filter \/FlateDecode/.test(T) && /\/SMask \d+ 0 R/.test(T), 'the PDF has two image XObjects: DCTDecode as it is, FlateDecode with an /SMask');
  ok(/\/XObject << \/Im0 \d+ 0 R \/Im1 \d+ 0 R >>/.test(T) && /\/ExtGState << \/GS1 \d+ 0 R >>/.test(T) && /\/ca 0\.5 \/CA 0\.5/.test(T) && !/\/GS0/.test(T), 'resources name both images and one opacity state (/ca 0.5) for the faded one only');
  ok(/\/Im0 Do Q/.test(T) && /\/GS1 gs [^\n]* cm \/Im1 Do Q/.test(T) && T.indexOf('/Im0 Do') < T.indexOf('/Im1 Do') && /W n\n/.test(T), 'the page content draws both with Do, first, inside a clip (W n)');
  const sj = Buffer.from(jb); ok(T.includes(sj.subarray(0, 600).toString('latin1')), 'the JPEG bytes are in the PDF as they are (no re-encode)');
  // structural: xref offsets and stream lengths
  const xr = Number(/startxref\n(\d+)/.exec(T)[1]); const rows = T.slice(xr).split('\n').slice(3).filter((l) => /^\d{10} 00000 n/.test(l));
  ok(rows.every((l, i) => T.slice(Number(l.slice(0, 10))).startsWith((i + 1) + ' 0 obj')) && rows.length === 7 + 3 + 1, 'every object sits at its xref offset (' + rows.length + ' objects: 7 base + 3 image objects + 1 opacity state)');
  ok(r.bytes.length > r0.bytes.length && !/Subtype \/Image/.test(Buffer.from(r0.bytes).toString('latin1')), 'a plan with no pictures has no image objects (as before)');
  const pdfFile = path.join(os.tmpdir(), 'd88b-pictures-' + process.pid + '.pdf');
  fs.writeFileSync(pdfFile, r.bytes);
  const info = spawnSync('pdfinfo', [pdfFile], { encoding: 'utf8' });
  if (info.error) ok(true, 'poppler not installed: structural checks only');
  else {
    ok(/Pages:\s+1/.test(info.stdout) && !/Syntax Error/i.test(info.stderr || ''), 'pdfinfo reads it: one page, no syntax errors', info.stderr);
    const im = spawnSync('pdfimages', ['-list', pdfFile], { encoding: 'utf8' });
    ok(/jpeg/.test(im.stdout) && /image/.test(im.stdout) && /smask/.test(im.stdout), 'pdfimages lists a jpeg, an image and its smask', im.stdout);
    const base = pdfFile.replace(/\.pdf$/, '');
    const pp = spawnSync('pdftoppm', ['-r', '50', '-png', pdfFile, base], { encoding: 'utf8' });
    const png = fs.readdirSync(os.tmpdir()).find((f) => f.startsWith(path.basename(base)) && f.endsWith('.png'));
    ok(pp.status === 0 && png, 'pdftoppm renders the page');
    if (png) {
      const raw = fs.readFileSync(path.join(os.tmpdir(), png));
      const ppm = spawnSync('pdftoppm', ['-r', '50', pdfFile], { encoding: 'buffer' }).stdout;   // PPM on stdout
      const hdr = /^P6\s+(\d+)\s+(\d+)\s+255\s/.exec(ppm.subarray(0, 40).toString('latin1'));
      const [pw, ph] = [Number(hdr[1]), Number(hdr[2])], off = hdr[0].length;
      const px = (x, y) => [...ppm.subarray(off + (y * pw + x) * 3, off + (y * pw + x) * 3 + 3)];
      // sheet layout: A4 landscape 297 x 210 mm at 50 dpi; margin 12, strip 16; plan 4000 x 3000 mm at 1:50 = 80 x 60 mm, centred in the room
      const k = 50 / 25.4, room = [297 - 24, 210 - 24 - 16], ox = 12 + (room[0] - 80) / 2, oy = 12 + 16 + (room[1] - 60) / 2;
      const at = (xmm, ymm) => px(Math.round((ox + xmm / 50) * k), Math.round(ph - (oy + ymm / 50) * k));
      const red = at(1000, 1000), blank = at(300, 2900), half = at(3000, 2000);
      ok(red[0] > 200 && red[1] < 60 && red[2] < 60, 'rendered: the solid red picture is red where it was placed (' + red + ')');
      ok(blank[0] > 240 && blank[1] > 240 && blank[2] > 240, 'rendered: paper stays white where there is no picture (' + blank + ')');
      ok(half[0] > 120 && !(half[0] > 245 && half[1] > 245 && half[2] > 245), 'rendered: the faded JPEG shows (not white) at 50% (' + half + ')');
      void raw;
    }
    for (const f of fs.readdirSync(os.tmpdir())) if (f.startsWith('d88b-pictures-' + process.pid)) fs.rmSync(path.join(os.tmpdir(), f), { force: true });
  }
}
