#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * autosave-pictures-test.mjs — 0.11 PERF.24, BimCraft models with pictures (perf-finish-11, lane bim): the autosave journal with the pictures
 * carried as files (autosave-pictures.js) instead of the whole IFC on every write. A building with pictures (one of them 1.5 MB, above the
 * 512 KB a plain IFC embeds) gets random edits (names, a new picture, a picture moved, one removed, undo); after every autosave a "new page"
 * with an EMPTY picture store recovers the copy: the IFC must equal the live model's byte for byte and every picture must come back with its
 * exact bytes. Then numbers: the copy written after one name edit, whole IFC with pictures embedded (as before) against the journal.
 *   node tools/bimcraft-test/autosave-pictures-test.mjs [seed]
 */
import { register } from 'node:module';
import { pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const ROOT = '/var/www/CADCRAFT/getcadcraft.com';
const APP = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
(await import(pathToFileURL(path.join(APP, 'i18n.js')).href)).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
register('data:text/javascript,' + encodeURIComponent(`import { pathToFileURL } from 'node:url';
export async function resolve(spec, ctx, next) {
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  if (spec === 'proj4') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/proj4/current/proj4.esm.min.js')).href)}, shortCircuit: true };
  if (spec === 'delaunator') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/delaunator/current/index.js')).href)}, shortCircuit: true };
  if (spec === 'robust-predicates') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/robust-predicates/current/index.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
const WebIFC = await import(path.join(APP, 'ifc/api.js'));
const { IfcModel } = await import(path.join(APP, 'ifc-model.js'));
const { IfcEditor } = await import(path.join(APP, 'ifc-edit.js'));
const { IfcFile } = await import(path.join(APP, 'ifc/model.js'));
const { ModelWriter } = await import(path.join(APP, 'model-write.js'));
const { ifcJournal, recoverIfc, IFC_WHOLE } = await import(path.join(APP, 'history/ifc-journal.js'));
const { withPictures, recoverPictures } = await import(path.join(APP, 'autosave-pictures.js'));
const A = await import(path.join(APP, 'app-autosave.js'));
const MP = await import(path.join(APP, 'model-picture.js'));
const ST = await import(path.join(APP, 'picture-store.js'));
const N = await import(path.join(APP, 'new-model.js'));
const OPS = await import(path.join(APP, 'model-ops.js'));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL ' + m); } };
let seed = Number(process.argv.find((a, i) => i > 1 && /^\d+$/.test(a)) || 7);
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
const quiet = (f) => async (...a) => { const l = console.log; console.log = () => {}; try { return await f(...a); } finally { console.log = l; } };
const STAMP = '2026-11-21T00:00:00';
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16);

// PNGs made here: small ones (patterns) and one of 1.5 MB (noise, stored not deflated)
const crc = (() => { const t = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; }); return (b) => { let c = ~0; for (const x of b) c = t[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; }; })();
const chunk = (type, data) => { const b = Buffer.alloc(12 + data.length); b.writeUInt32BE(data.length, 0); b.write(type, 4, 'latin1'); data.copy(b, 8); b.writeUInt32BE(crc(b.subarray(4, 8 + data.length)), 8 + data.length); return b; };
const png = (w, h, noise = false, k = 0) => {
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 0;
  const raw = Buffer.alloc((w + 1) * h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) raw[y * (w + 1) + 1 + x] = noise ? Math.floor(rnd() * 256) : (x * 7 + y * 3 + k) & 255;
  return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: noise ? 0 : 6 })), chunk('IEND', Buffer.alloc(0))]));
};

const open = async (bytes) => { const eng = await quiet(IfcModel.create)(WebIFC, null); await quiet((b) => eng.load(b))(bytes); return { eng, ed: new IfcEditor(WebIFC, eng) }; };
const W = (ed) => new ModelWriter(WebIFC, ed.api, ed.mid);
const text = N.newBuilding({ name: 'Pictures', levels: N.stackLevels(3, 3000, (i) => 'Level ' + (i + 1)), fileName: 'p.ifc', now: new Date('2026-11-21T12:00:00Z') });
ST.clearAll();
const { eng, ed } = await open(new TextEncoder().encode(text));
const lv = OPS.snapshotModel(ed).levels;
const big = png(1200, 1250, true);
ok(big.length > 512 * 1024, 'the big picture is above the 512 KB a plain IFC embeds (' + big.length + ' bytes)');
ed.modelChange(MP.addPicture({ storey: lv[0].guid, bytes: png(300, 200), name: 'site.png' }), { label: 'Picture' });
ed.modelChange(MP.addPicture({ storey: lv[1].guid, bytes: big, name: 'survey.png' }), { label: 'Picture' });

const files = () => { try { return MP.bundleFiles(W(ed)); } catch (e) { return []; } };
const store = A.memoryStore();
const page = (name) => new A.Autosave({ app: 'bimcraft', store, locks: null, alive: async () => [name], session: name });
const as1 = page('s1');
const file = () => eng.api.file(eng.modelID);
const doc = as1.doc({ name: 'p.ifc', journal: withPictures(ifcJournal({ file, whole: async () => ed.save(), meta: () => ({ name: 'p.ifc', changes: ed.changes.length }) }), { files, meta: () => ({ name: 'p.ifc', changes: ed.changes.length }) }) });
const named = [];
for (const type of ['IFCWALL', 'IFCSLAB', 'IFCBUILDINGSTOREY', 'IFCANNOTATION']) { const l = eng.api.GetLineIDsWithType(eng.modelID, WebIFC[type]); for (let i = 0; i < l.size(); i++) named.push(l.get(i)); }

let checks = 0, n = 0, lastSegs = 0;
for (let i = 0; i < 40; i++) {
  const r = rnd(), pics = MP.readPictures(W(ed));
  try {
    if (r < 0.45) ed.setAttribute(named[Math.floor(rnd() * named.length)], 'Name', 'N' + Math.floor(rnd() * 1e6));
    else if (r < 0.6 && pics.length < 6) ed.modelChange(MP.addPicture({ storey: lv[Math.floor(rnd() * lv.length)].guid, bytes: png(120 + i, 80, false, i), name: 'p' + i + '.png' }), { label: 'Picture' });
    else if (r < 0.72 && pics.length) ed.modelChange(MP.changePicture(pics[Math.floor(rnd() * pics.length)].guid, { x: Math.round(rnd() * 9000), angle: Math.round(rnd() * 90) }), { label: 'Move' });
    else if (r < 0.8 && pics.length > 1) ed.modelChange(MP.removePictures([pics[Math.floor(rnd() * pics.length)].guid]), { label: 'Remove' });
    else if (r < 0.9) ed.undo();
    else ed.redo?.();
  } catch (e) { /* refused */ }
  doc.changed();
  await as1.flush();
  const idx = await store.index('bimcraft~j');
  if (!idx.length) continue;
  lastSegs = idx[0].segs;
  // a new page: nothing in the picture store
  const live = new Map(files().map((f) => [f.loc, f.bytes]));
  const as2 = page('s2-' + i), orph = await as2.orphans(), rec = await as2.load(orph[0]);
  const got = recoverIfc(rec, IfcFile, { timeStamp: STAMP });
  const want = file().dirty ? file().save({ timeStamp: STAMP }) : file().bytes;
  ok(Buffer.compare(Buffer.from(got), Buffer.from(want)) === 0, 'step ' + i + ': the recovered IFC equals the live model (' + lastSegs + ' change records)');
  const back = new Map(recoverPictures(rec));
  ok(back.size === live.size && [...live].every(([loc, b]) => back.has(loc) && sha(back.get(loc)) === sha(b)), 'step ' + i + ': every picture comes back with its bytes (' + live.size + ')');
  if (i % 8 === 7) {   // open the recovered model in a page whose store holds only what the copy carried
    const saved = new Map(live);
    ST.clearAll();
    for (const [loc, b] of back) ST.putBytes(loc, b);
    const re = await open(got);
    const rp = MP.readPictures(W(re.ed), { data: true });
    ok(rp.length === MP.readPictures(W(ed)).length && rp.every((p) => p.hasData && !p.lost && sha(p.bytes) === sha(saved.get(p.loc))), 'step ' + i + ': the recovered model shows its ' + rp.length + ' pictures, none lost');
    ST.clearAll(); for (const [loc, b] of saved) ST.putBytes(loc, b);
    n++;
  }
  checks++;
}
ok(checks > 30 && n >= 3, 'recovered ' + checks + ' times, reopened ' + n + ' times');

// numbers: one name edit after the first copy, with the 1.5 MB picture in the model
{
  const sizes = {};
  for (const mode of ['whole', 'journal']) {
    const st = A.memoryStore(); let wrote = 0; const put = st.putData.bind(st);
    st.putData = async (k, d) => { const one = (x) => (x?.byteLength ?? 0); wrote += d.bytes ? d.bytes.length + (d.files || []).reduce((a, [, b]) => a + one(b), 0) : d.byteLength ?? (JSON.stringify(d.set || []).length + (d.files || []).reduce((a, [, b]) => a + one(b), 0)); return put(k, d); };
    const as = new A.Autosave({ app: 'bimcraft', store: st, locks: null, alive: async () => ['n' + mode], session: 'n' + mode });
    // before: the whole IFC with the small pictures embedded (picture-ui snapshotBytes); after: the journal with the pictures as files
    const snapshotBytes = () => { let tr = null; try { tr = MP.transient(ed, MP.embedFor()); return ed.save(); } finally { tr?.undo(); } };
    const d = as.doc({ name: mode, ...(mode === 'journal' ? { journal: withPictures(ifcJournal({ file, whole: async () => ed.save() }), { files }) } : { snapshot: async () => ({ data: snapshotBytes() }) }) });
    d.changed(); await as.flush(); const first = wrote; wrote = 0;
    const t0 = performance.now();
    ed.setAttribute(named[0], 'Name', 'Edit ' + mode); d.changed(); await as.flush();
    sizes[mode] = { first, next: wrote, ms: +(performance.now() - t0).toFixed(1) };
    await d.close();
  }
  console.log(`model with ${files().length} pictures (${files().reduce((a, f) => a + f.bytes.length, 0)} bytes of pictures): the copy after one name edit`);
  console.log(`  before, whole IFC with pictures embedded: first ${sizes.whole.first} bytes, next ${sizes.whole.next} bytes in ${sizes.whole.ms} ms`);
  console.log(`  after, journal + pictures as files      : first ${sizes.journal.first} bytes, next ${sizes.journal.next} bytes in ${sizes.journal.ms} ms`);
  ok(sizes.journal.next < 4096 && sizes.journal.next < sizes.whole.next / 20, 'the next copy is the change only (' + sizes.journal.next + ' bytes, was ' + sizes.whole.next + ')');
}
console.log(`autosave with pictures: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
