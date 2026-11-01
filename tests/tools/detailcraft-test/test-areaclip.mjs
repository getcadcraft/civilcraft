#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-areaclip.mjs — 0.8 D8.15: a copied area of a sheet (MarkupCraft's Copy area, areaclip.js) pasted into DetailCraft as a
 * reference picture at its true size (picture.js + model.js): the size from the clip (real scale, else paper), the overlay's
 * opacity, one undo step, the PNG kept once outside the undo snapshots, saved in the file and read back (untrusted), Ctrl+V's
 * "newer clipboard wins" rule.   node tools/detailcraft-test/test-areaclip.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await load('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const A = await load('areaclip.js'), P = await load('picture.js'), { Model, starterState, readModel, VERSION } = await load('model.js');
const { copyClip, readClip } = await load('clipboard.js');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x) : '')); } };
const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;
const throws = (fn) => { try { fn(); return false; } catch { return true; } };

// a real PNG of w × h (grey), as the Copy area tool makes one
function png(w, h, grey = 128) {
  const crcT = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
  const crc = (b) => { let c = 0xffffffff; for (const x of b) c = crcT[(c ^ x) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4), c = Buffer.alloc(4); len.writeUInt32BE(data.length); c.writeUInt32BE(crc(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
  const raw = Buffer.alloc((w + 1) * h, grey); for (let y = 0; y < h; y++) raw[y * (w + 1)] = 0;
  const b = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
  return 'data:image/png;base64,' + b.toString('base64');
}
const SRC = png(400, 200), SRC2 = png(30, 60, 40);
const realClip = A.makeAreaClip({ source: 'S-201.pdf', sheet: 'S-201', label: 'Base plate detail', src: SRC, ptPerPx: 0.48, real: { mmPerPx: 12.7, unit: 'ft-in' } });
const paperClip = A.makeAreaClip({ source: 'notes.pdf', src: SRC2, ptPerPx: 0.24, overlay: { opacity: 0.4, tint: '#d0312d' } });

console.log('A clip becomes a picture of its true size');
{
  ok(realClip && paperClip, 'the test clips are good clips');
  const r = P.pictureFromClip(realClip, { at: [6000, 3000, 4000] });
  ok(r && r.size === 'real' && near(r.picture.mmPerPx, 12.7), 'with a drawing scale: true size, one pixel = clip.real.mmPerPx', r?.picture);
  const [w, h] = P.pictureSizeMm(r.picture);
  ok(near(w, 400 * 12.7, 1e-6) && near(h, 200 * 12.7, 1e-6), '400 × 200 px → 5080 × 2540 mm', [w, h]);
  ok(r.picture.x === 6000 && r.picture.y === 3000 && r.picture.z === 4000 && r.picture.opacity === 1, 'at the place asked, full strength (no overlay)');
  ok(r.picture.name === 'Base plate detail' && r.src === SRC && r.picture.hash === P.srcHash(SRC), 'named by the clip label; the PNG and its hash come along');
  const q = P.pictureFromClip(JSON.stringify(paperClip));
  ok(q && q.size === 'paper' && near(q.picture.mmPerPx, 0.24 * 25.4 / 72, 1e-12), 'without a scale: paper size (ptPerPx in mm)', q?.picture.mmPerPx);
  ok(near(P.pictureSizeMm(q.picture)[0], A.sizeMm(paperClip, { use: 'paper' })[0], 1e-9), 'the same size areaclip.js sizeMm gives');
  ok(q.picture.opacity === 0.4, 'a "Copy as overlay" clip starts at its opacity (0.4)');
  ok(P.pictureFromClip({ ...realClip, src: 'data:image/png;base64,AAAA' }) === null, 'a clip whose PNG does not read is refused');
  ok(P.pictureFromClip({ ...realClip, format: 'other' }) === null && P.pictureFromClip('{not json') === null, 'a foreign or broken clip is refused');
}

console.log('Pasted into the model: one undo step, the PNG outside the snapshots');
{
  const m = new Model(starterState('t'));
  const r = P.pictureFromClip(realClip, { at: [6000, 3000, 0] });
  const hash = m.pictureSrcs.put(r.src);
  const id = m.change('Paste picture', (tx) => tx.addPicture({ ...r.picture, hash }));
  ok(/^g\d+$/.test(id) && m.picture(id) && m.undoStack.length === 1, 'one undo step adds the picture', id);
  ok(!JSON.stringify(m.state).includes('data:image') && !m.undoStack.some((u) => u.before.includes('data:image')), 'neither the state nor a snapshot holds the PNG');
  m.change('Move picture', (tx) => tx.movePictures([id], [1000, -500, 0]));
  ok(m.picture(id).x === 7000 && m.picture(id).y === 2500, 'moved by an offset');
  m.change('Picture opacity', (tx) => tx.updatePicture(id, { opacity: 0.3 }));
  ok(m.picture(id).opacity === 0.3 && m.picture(id).hash === hash, 'opacity changed, the PNG kept');
  const before = JSON.stringify(m.state);
  ok(throws(() => m.change('bad', (tx) => tx.updatePicture(id, { mmPerPx: -1 }))) && JSON.stringify(m.state) === before, 'a bad scale is refused and changes nothing');
  ok(throws(() => m.change('bad', (tx) => tx.updatePicture('g999', { x: 1 }))), 'a picture that is gone is refused');
  ok(throws(() => m.change('bad', (tx) => tx.addPicture({ ...r.picture, hash: '' }))), 'a picture without its PNG hash is refused');
  m.undo(); m.undo();
  ok(m.picture(id).x === 6000 && m.picture(id).opacity === 1, 'undo puts it back where it was pasted');
  m.undo();
  ok(!m.picture(id) && m.pictureSrcs.has(hash), 'undo the paste: gone, its PNG kept for redo');
  m.redo();
  ok(m.picture(id) && m.pictureSrcs.get(hash) === SRC, 'redo brings it back with its PNG');
  m.change('Delete picture', (tx) => tx.removePictures([id]));
  ok(!m.picture(id) && !('pictures' in m.state), 'deleted; the last one removes the key');
}

console.log('Saved in the file, read back as untrusted');
{
  const m = new Model(starterState('t'));
  const a = P.pictureFromClip(realClip, { at: [0, 0, 0] }), b = P.pictureFromClip(paperClip, { at: [100, 200, 4000] });
  m.change('Paste picture', (tx) => { tx.addPicture({ ...a.picture, hash: m.pictureSrcs.put(a.src) }); tx.addPicture({ ...b.picture, hash: m.pictureSrcs.put(b.src) }); });
  const text = m.toJSON(), j = JSON.parse(text);
  ok(j.version === VERSION && VERSION === 2, 'the file version is unchanged (2): pictures are an optional key', j.version);
  ok(j.pictures.length === 2 && j.pictures[0].src === SRC && j.pictures[1].src === SRC2, 'each picture carries its PNG in the file');
  const m2 = new Model();
  const { warnings } = m2.load(text);
  ok(warnings.length === 0 && m2.state.pictures.length === 2, 'opens with both pictures, no warnings', warnings);
  ok(JSON.stringify(m2.state.pictures) === JSON.stringify(m.state.pictures), 'the same pictures (ids, places, scales, opacities, hashes)');
  ok(m2.pictureSrcs.get(m2.state.pictures[1].hash) === SRC2 && m2.toJSON() === text, 'the PNGs come back; saving again gives the same file');
  ok(m2.state.seq > Math.max(...m2.state.pictures.map((p) => Number(p.id.slice(1)))), 'new ids number past the pictures');
  // tampered: a PNG of another size, a bad scale, junk, a picture with no PNG
  const bad = JSON.parse(text);
  bad.pictures = [{ ...bad.pictures[0], px: [10, 10] }, { ...bad.pictures[1], mmPerPx: 'big' }, 'junk', { ...bad.pictures[1], src: undefined }, bad.pictures[1]];
  const r = readModel(JSON.stringify(bad));
  ok(r.state.pictures.length === 1 && r.pictureSrcs.length === 1 && r.warnings.some((w) => /4 pictures/.test(w)), 'bad pictures are left out with a warning; the good one stays', r.warnings);
  const many = JSON.parse(text); many.pictures = Array.from({ length: P.MAX_PICTURES + 3 }, () => j.pictures[1]);
  ok(readModel(JSON.stringify(many)).state.pictures.length === P.MAX_PICTURES, 'at most ' + P.MAX_PICTURES + ' pictures are read');
  const old = JSON.parse(text); delete old.pictures;
  const r3 = readModel(JSON.stringify(old));
  ok(!('pictures' in r3.state) && r3.warnings.length === 0, 'a file without pictures opens as before');
  const m3 = new Model(); m3.load(JSON.stringify(old));
  ok(!('pictures' in JSON.parse(m3.toJSON())), 'and saves without the key');
  // a picture whose PNG is not in the store is left out of the file rather than saved blank
  const m4 = new Model(starterState('t'));
  m4.change('x', (tx) => tx.addPicture({ ...a.picture, hash: P.srcHash(SRC) }));
  ok(JSON.parse(m4.toJSON()).pictures.length === 0, 'a picture without its PNG is not written');
  // DetailCraft's parts clipboard ignores pictures (they are not copied)
  ok(copyClip(m2.state, m2.state.pictures.map((p) => ({ kind: 'picture', id: p.id }))) === null, 'copying only pictures copies nothing');
}

console.log('Ctrl+V: the newer clipboard wins');
{
  const m = new Model(starterState('t'));
  m.change('beam', (tx) => tx.addMember({ type: 'beam', start: [0, 0, 4000], end: [6000, 0, 4000] }));
  const dc = readClip(copyClip(m.state, [{ kind: 'member', id: m.state.members[0].id }]).clip);
  const made = P.clipTime(dc);
  ok(Number.isFinite(made) && Math.abs(made - Date.now()) < 5000, 'a DetailCraft clip says when it was made', made);
  const at = (ms) => A.cleanAreaClip({ ...realClip, at: new Date(ms).toISOString() });
  ok(P.areaClipNewer(at(made + 1000), dc) === true, 'the area copied after the parts: the area');
  ok(P.areaClipNewer(at(made - 1000), dc) === false, 'the parts copied after the area: the parts');
  ok(P.areaClipNewer(at(made), null) === true, 'no DetailCraft clipboard: the area');
  ok(P.areaClipNewer(null, dc) === false, 'no area: the parts');
  ok(P.areaClipNewer(at(made + 1000), { ...dc, source: '' }) === false, 'a DetailCraft clip of unknown age keeps the paste');
  // a picture pasted from the system clipboard is the clip when it has the clip's pixel size (areaclip.js sameImage)
  ok(A.sameImage(realClip, 400, 200) && !A.sameImage(realClip, 401, 200), 'the system clipboard picture matches by size');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
