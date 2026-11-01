/* SPDX-License-Identifier: Apache-2.0 */
/** picture-test.mjs — pictures as backgrounds (0.8 D8.8, session d88_PART_3):  node bin/test-bimcraft.mjs --picture
 *  lib/picture maths + byte copy in step, then model-picture.js in a model (add / change / remove = one undo step each, save, reopen). */
import path from 'node:path';
import fs from 'node:fs';
import zlib from 'node:zlib';

export async function pictureMode({ APP, ROOT, WebIFC, IfcModel, quiet }) {
  let bad = 0, good = 0;
  const ok = (c, m, d = '') => { if (c) good++; else bad++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d ? ' (' + d + ')' : '')); };
  const near = (a, b, e = 0.001) => Math.abs(a - b) <= e;
  const P = await import(path.join(APP, 'picture.js'));
  ok(fs.readFileSync(path.join(ROOT, 'lib/picture/picture.js')).equals(fs.readFileSync(path.join(APP, 'picture.js'))), 'the BimCraft copy is byte-identical to lib/picture (node tools/picture/sync.mjs bimcraft)');

  // ---- files: a real PNG made here, the repo's JPEGs, a WebP header
  const crc = (() => { const t = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; }); return (b) => { let c = ~0; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; }; })();
  const chunk = (type, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(type, 4, 'latin1'); data.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + data.length)), 8 + data.length); return b; };
  const png = (w, h) => {
    const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
    const raw = Buffer.alloc((w + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = (x * 7 + y * 3) & 255;
    return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
  };
  const pb = png(300, 200);
  ok(JSON.stringify(P.sniff(pb)) === '{"kind":"png","mime":"image/png","w":300,"h":200}', 'sniff: a PNG gives its type and 300 x 200');
  const jb = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/raster/plan-scan.jpg')));
  const js = P.sniff(jb);
  ok(js?.kind === 'jpeg' && js.w > 100 && js.h > 100, 'sniff: the repo JPEG (plan-scan.jpg) gives its size', JSON.stringify(js));
  const jp = P.sniff(new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/raster/plan-scan-progressive.jpg'))));
  ok(jp?.kind === 'jpeg' && jp.w === js.w, 'sniff: a progressive JPEG (SOF2) too');
  const webp = new Uint8Array(30); webp.set(Buffer.from('RIFF'), 0); webp.set(Buffer.from('WEBP'), 8); webp.set(Buffer.from('VP8X'), 12); webp[24] = 99; webp[27] = 49;
  ok(P.sniff(webp)?.w === 100 && P.sniff(webp)?.h === 50, 'sniff: a WebP (VP8X) 100 x 50');
  ok(P.sniff(new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])) === null && P.sniff(pb.subarray(0, 20)) === null && P.sniff(null) === null, 'sniff: other bytes and a cut header give null');

  // ---- the maths
  let p = P.makePicture({ name: 'site', w: 300, h: 200 });
  ok(near(p.mmPerPx * 300, 20000) && !p.scaled && p.opacity === 1 && !p.locked && p.angle === 0, 'a new picture: 20 m wide, centred on (0, 0), not scaled, opaque, unlocked');
  let c = P.corners(p);
  ok(near(c[0][0], -10000) && near(c[2][0], 10000) && near(c[0][1], -6666.667, 0.01) && near(c[2][1], 6666.667, 0.01), 'corners: lower-left (-10 m, -6.67 m) to upper-right');
  const m = P.matrix(p);
  const ap = (m, u, v) => [m[0] * u + m[2] * v + m[4], m[1] * u + m[3] * v + m[5]];
  ok(near(ap(m, 0, 0)[0], -10000) && near(ap(m, 0, 0)[1], 6666.667, 0.01) && near(ap(m, 300, 200)[0], 10000) && near(ap(m, 300, 200)[1], -6666.667, 0.01), 'matrix: the top-left pixel is the upper-left corner (plan y goes up), the bottom-right the lower-right');
  p = { ...p, ...{ x: 500, y: -200, angle: 90 } };
  const m2 = P.matrix(p), tl = ap(m2, 0, 0), c2 = P.corners(p);
  ok(near(tl[0], c2[3][0], 0.01) && near(tl[1], c2[3][1], 0.01), 'turned 90 degrees and moved: matrix and corners agree on the upper-left pixel');
  ok(P.hit(p, [500, -200]) && !P.hit(p, [500 + 9000, -200]) && P.hit(p, [500, -200 + 9000]), 'hit: the centre is in; turned 90 degrees it is 20 m tall, not 20 m wide');
  const back = P.toPicture(p, [500, -200]);
  ok(near(back[0], 150) && near(back[1], 100), 'toPicture: the centre is pixel (150, 100)');
  // scale by two points: a 4000 mm wall drawn 2000 long on the picture
  p = P.makePicture({ name: 's', w: 300, h: 200, mmPerPx: 10 });
  const a = [-1000, 0], b = [1000, 0];
  const sc = P.scaleByPoints(p, a, b, 4000);
  ok(near(sc.mmPerPx, 20) && sc.scaled === true, 'scaleByPoints: two points 2000 apart that are really 4000 double the scale', JSON.stringify(sc));
  ok(near(sc.x, -1000 + (0 + 1000) * 2) && near(sc.y, 0), 'scaleByPoints: grows about the first point (it stays where it is)', JSON.stringify(sc));
  const q = { ...p, ...sc };
  ok(near(P.toPicture(q, a)[0], P.toPicture(p, a)[0]) && near(P.toPicture(q, a)[1], P.toPicture(p, a)[1]), 'the first point still lies on the same pixel after scaling');
  { const pa = P.toPicture(p, a), pbx = P.toPicture(p, b); ok(near(Math.hypot(pbx[0] - pa[0], pbx[1] - pa[1]) * q.mmPerPx, 4000), 'the two pixels that were picked are now 4000 mm apart'); }
  const thrown = (f) => { try { f(); return null; } catch (e) { return e.key; } };
  ok(thrown(() => P.scaleByPoints(p, a, a, 100)) === 'pic.err.samepoint' && thrown(() => P.scaleByPoints(p, a, b, 0)) === 'pic.err.distance' && thrown(() => P.scaleByPoints(p, a, b, NaN)) === 'pic.err.distance', 'scale refuses the same point twice, no distance, a distance that is not a number');
  ok(JSON.stringify(P.moveByPoints(p, [0, 0], [300, -100])) === '{"x":300,"y":-100}', 'move by two points');
  ok(P.turn(P.makePicture({ w: 1, h: 1, angle: 350 }), 20).angle === 10 && P.turn(p, -90).angle === 270, 'turn wraps round 360');
  ok(P.fade(p, 0).opacity === P.LIMITS.minOpacity && P.fade(p, 5).opacity === 1 && P.fade(p, 0.4).opacity === 0.4, 'fade stays between the least opacity and 1');
  const L = { ...p, locked: true };
  ok(thrown(() => P.moveBy(L, 1, 1)) === 'pic.err.locked' && thrown(() => P.turn(L, 5)) === 'pic.err.locked' && thrown(() => P.scaleByPoints(L, a, b, 10)) === 'pic.err.locked' && P.fade(L, 0.5).opacity === 0.5, 'a locked picture refuses move, turn and scale; fading still works');
  ok(P.shrink(8000, 4000).w === 4096 && P.shrink(8000, 4000).h === 2048 && P.shrink(300, 200).k === 1, 'shrink: 8000 x 4000 comes down to 4096 x 2048; a small one stays');
  // bytes as text
  const rnd = new Uint8Array(1000).map((_, i) => (i * 37 + 11) & 255);
  for (const n of [0, 1, 2, 3, 4, 999, 1000]) { const s = rnd.subarray(0, n); ok(Buffer.from(P.fromBase64(P.toBase64(s))).equals(Buffer.from(s)) && P.toBase64(s) === Buffer.from(s).toString('base64'), 'base64 round trip, ' + n + ' bytes (same text as Node)'); }
  ok(P.chunks('x'.repeat(65000)).length === 3 && P.join(P.chunks('abc'.repeat(30000))) === 'abc'.repeat(30000), 'chunks of 30 000 characters join back');
  const pr = P.pictureProblems([{ guid: 'g1', name: 'a', bytes: null, scaled: true }, { guid: 'g2', name: 'b', bytes: new Uint8Array([1, 2, 3]), scaled: true }, { guid: 'g3', name: 'c', bytes: pb, scaled: false }, { guid: 'g4', name: 'd', bytes: pb, scaled: true }]);
  ok(pr.map((x) => x.code).join() === 'pic.missing,pic.unreadable,pic.unscaled' && pr.every((x) => x.about[0].kind === 'element' && x.msg.key && x.source.name === 'picture'), 'Problems: missing, unreadable, not scaled yet (a good scaled picture says nothing)');

  // ---- in a model
  const N = await import(path.join(APP, 'new-model.js'));
  const OPS = await import(path.join(APP, 'model-ops.js'));
  const MP = await import(path.join(APP, 'model-picture.js'));
  const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
  const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
  const open = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return { eng, ed: new IfcEditor(WebIFC, eng) }; };
  const text = N.newBuilding({ name: 'D88', levels: N.stackLevels(2, 3000, (i) => 'Level ' + (i + 1)), fileName: 'd.ifc', now: new Date('2026-10-29T12:00:00Z') });
  const { ed } = await open(new TextEncoder().encode(text));
  const levels = OPS.snapshotModel(ed).levels;
  const W = () => new ModelWriter(WebIFC, ed.api, ed.mid);
  const n0 = ed.changes.length;
  const r = ed.modelChange(MP.addPicture({ storey: levels[0].guid, bytes: pb, name: 'site.png' }), { label: 'Picture', verb: 'Placed' });
  ok(ed.changes.length === n0 + 1, 'Place: one undo step');
  let list = MP.readPictures(W(), { data: true });
  ok(list.length === 1 && list[0].name === 'site.png' && list[0].storey === levels[0].id && list[0].w === 300 && list[0].h === 200 && list[0].mime === 'image/png' && Buffer.from(list[0].bytes).equals(Buffer.from(pb)), 'read back: name, level, 300 x 200, the exact PNG bytes');
  const g = list[0].guid;
  const saved = new TextDecoder().decode(ed.save());
  ok(/IFCANNOTATION\([^;]*'Picture'/.test(saved) && saved.includes('CadCraft_Picture'), 'the file has an IfcAnnotation "Picture" with CadCraft_Picture');
  const re = await open(new TextEncoder().encode(saved));
  const l2 = MP.readPictures(new ModelWriter(WebIFC, re.ed.api, re.ed.mid), { data: true });
  ok(l2.length === 1 && Buffer.from(l2[0].bytes).equals(Buffer.from(pb)) && l2[0].guid === g, 'saved and reopened: the picture and its bytes come back');
  // each change one step
  const chg = (patch, label) => { const n = ed.changes.length; ed.modelChange(MP.changePicture(g, patch), { label }); return ed.changes.length === n + 1; };
  ok(chg(P.scaleByPoints(list[0], [0, 0], [1000, 0], 3000), 'Scale'), 'Scale by two points: one undo step');
  ok(chg({ x: 1200, y: -300 }, 'Move'), 'Move: one undo step');
  ok(chg({ angle: 15 }, 'Turn'), 'Turn: one undo step');
  ok(chg({ opacity: 0.4 }, 'Fade'), 'Fade: one undo step');
  ok(chg({ locked: true }, 'Lock'), 'Lock: one undo step');
  list = MP.readPictures(W());
  ok(near(list[0].x, 1200) && near(list[0].y, -300) && near(list[0].angle, 15) && near(list[0].opacity, 0.4) && list[0].locked && list[0].scaled && near(list[0].mmPerPx, list[0].mmPerPx), 'all five changes are in the model', JSON.stringify(list[0]));
  let key = null; try { ed.modelChange(MP.changePicture(g, { x: 5 })); } catch (e) { key = e.key || e.message; }
  ok(key === 'pic.err.locked' && near(MP.readPictures(W())[0].x, 1200), 'a locked picture refuses a move (and nothing changes)', String(key));
  ok(chg({ locked: false }, 'Unlock') && chg({ x: 0 }, 'Move again'), 'unlocked: it moves again');
  const reread = MP.readPictures(W(), { data: true })[0];
  ok(Buffer.from(reread.bytes).equals(Buffer.from(pb)), 'the picture bytes are untouched by changes');
  // undo all
  for (let i = 0; i < 7; i++) ed.undo();
  ok(near(MP.readPictures(W())[0].x, 0) && MP.readPictures(W())[0].opacity === 1 && !MP.readPictures(W())[0].locked, 'undo x 7: back to the first placement (centred, opaque, unlocked)');
  ed.undo();
  ok(MP.readPictures(W()).length === 0, 'undo the placement: no picture');
  ed.redo();
  ok(MP.readPictures(W()).length === 1 && MP.readPictures(W())[0].guid === g, 'redo gives the same picture (same GlobalId)');
  // refusals
  const refuse = (f) => { try { ed.modelChange(f()); return null; } catch (e) { return e.key || e.message; } };
  ok(refuse(() => MP.addPicture({ storey: levels[0].guid, bytes: new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]) })) === 'pic.err.type', 'a file that is not a PNG / JPEG / WebP is refused');
  ok(refuse(() => MP.addPicture({ storey: 'nope', bytes: pb })) === 'model.err.nolevel', 'no such level is refused');
  const big = new Uint8Array(P.LIMITS.keepBytes + 1); big.set(pb);
  ok(refuse(() => MP.addPicture({ storey: levels[0].guid, bytes: big })) === 'pic.err.big', 'a picture over the keep limit is refused');
  // a JPEG, on the second level, and two pictures together
  ed.modelChange(MP.addPicture({ storey: levels[1].guid, bytes: jb, name: 'scan.jpg', patch: { x: 100, y: 100, mmPerPx: 12 } }));
  const two = MP.readPictures(W(), { data: true });
  ok(two.length === 2 && two[1].storey === levels[1].id && two[1].mime === 'image/jpeg' && Buffer.from(two[1].bytes).equals(Buffer.from(jb)) && two[1].mmPerPx === 12, 'a JPEG on Level 2, the plan-scan fixture, bytes kept');
  // edited down: a cut-off property makes the picture "missing"
  const cut = new TextDecoder().decode(ed.save()).replace(/('Bytes'[^;]*?IFCINTEGER\()(\d+)\)/, (m, a, n) => a + (Number(n) + 5) + ')');
  const ce = await open(new TextEncoder().encode(cut));
  const cl = MP.readPictures(new ModelWriter(WebIFC, ce.ed.api, ce.ed.mid), { data: true });
  ok(cl.some((x) => x.hasData && x.bytes === null), 'bytes that do not add up to the size written read as a missing picture');
  const dang = (txt) => { const defined = new Set([...txt.matchAll(/^#(\d+)=/gm)].map((mm) => mm[1])), out = new Set(); for (const line of txt.split('\n')) for (const mm of line.replace(/^#\d+=/, '').replace(/'(?:[^']|'')*'/g, '').matchAll(/#(\d+)/g)) if (!defined.has(mm[1])) out.add(mm[1]); return [...out]; };
  ed.modelChange(MP.removePictures(two.map((x) => x.guid)));
  ok(MP.readPictures(W()).length === 0 && !dang(new TextDecoder().decode(ed.save())).length, 'remove both: gone, no dangling references');
  // ---- round 3 (d88b_PART_3): bundle / IfcDocumentReference, planes, PDF
  await (await import('./picture2-test.mjs')).picture2({ APP, ROOT, WebIFC, IfcModel, quiet, ok, makePng: png });
  // ---- 0.8 D8.15: a copied area pasted as a picture (picture-paste.js)
  await (await import('./picture-paste-test.mjs')).picturePaste({ APP, ROOT, WebIFC, IfcModel, quiet, ok, makePng: png });
  console.log(bad ? `\n${bad} failed (${good} ok)` : `\nall ok (${good})`);
  return bad ? 1 : 0;
}
