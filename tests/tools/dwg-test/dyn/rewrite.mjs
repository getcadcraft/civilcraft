/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rewrite.mjs — DB.10 spike: can cc-dwg write a visibility parameter itself (not copy it)? Each BLOCKVISIBILITYPARAMETER of
 * the blocks sample is decoded into all its fields (docs/DWG-DYNAMIC-BLOCKS.md), encoded again from those fields alone,
 * and compared with the file's own bits, handle list and string stream. Then one edit (a state renamed, an object moved
 * between states) is encoded and read back with dynblock-read.js.
 *   node tools/dwg-test/dyn/rewrite.mjs [--verbose]
 */
import * as P from './probe-lib.mjs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const { BitWriter } = await import(pathToFileURL(path.join(ROOT, 'lib/dwg/bits-write.js')).href);
const { b64, unb64 } = await import(pathToFileURL(path.join(ROOT, 'lib/dwg/bits-util.js')).href);
const D = await import(pathToFileURL(path.join(ROOT, 'lib/dwg/dynblock-read.js')).href);
const VERBOSE = process.argv.includes('--verbose');

/** Every field of a visibility parameter, in file order (the layout dynblock-read.js reads). */
function fields(o) {
  const r = P.reader(o), h = o.raw.h;
  let k = 0;
  const take = (n) => h.slice(k, (k += n));
  const f = { id: r.BL(), release: r.BL(), maint: r.BL(), tag: r.BL(), name: r.TV(), b1: r.B(), b2: r.B(), pad: [r.BS(), r.BS(), r.BS(), r.BS()], point: r.BD3(),
    z: [r.BS(), r.BS()], grip: r.BL(), label: r.TV(), description: r.TV(), f2: [r.B(), r.B()] };
  f.all = take(r.BL());
  f.states = [];
  for (let i = 0, n = r.BL(); i < n; i++) { const name = r.TV(); const entities = take(r.BL()); const elements = take(r.BL()); f.states.push({ name, entities, elements }); }
  return f;
}

/** The fields back to bits (R2007+: strings in the string stream, its size and flag at the end; ODA spec 20.1). */
function encode(f, ver) {
  const w = new BitWriter(ver === 21 ? 'AC1021' : 'AC1032'), s = new BitWriter(ver === 21 ? 'AC1021' : 'AC1032');
  const handles = [];
  w.BL(f.id); w.BL(f.release); w.BL(f.maint); w.BL(f.tag | 0); s.TU(f.name);
  w.B(f.b1); w.B(f.b2); for (const v of f.pad) w.BS(v);
  w.BD3(f.point.x, f.point.y, f.point.z);
  for (const v of f.z) w.BS(v);
  w.BL(f.grip); s.TU(f.label); s.TU(f.description); w.B(f.f2[0]); w.B(f.f2[1]);
  w.BL(f.all.length); handles.push(...f.all);
  w.BL(f.states.length);
  for (const st of f.states) { s.TU(st.name); w.BL(st.entities.length); handles.push(...st.entities); w.BL(st.elements.length); handles.push(...st.elements); }
  const size = s.bit;
  w.append(s);
  if (size < 0x8000) w.RS(size); else { w.RS(size >>> 15); w.RS((size & 0x7fff) | 0x8000); }
  w.B(1);
  return { raw: { ver, n: w.bit, data: b64(w.bytes()), h: handles } };
}

const bits = (raw) => { const u = unb64(raw.data); let s = ''; for (let i = 0; i < raw.n; i++) s += (u[i >> 3] >> (7 - (i & 7))) & 1; return s; };
let same = 0, diff = 0;
const db = P.load('blocks-and-tables-imperial', 'orig');
for (const o of db.objects.filter((x) => x.type === 'BLOCKVISIBILITYPARAMETER')) {
  const f = fields(o), e = encode(f, o.raw.ver);
  const a = bits(o.raw), b = bits(e.raw), hs = JSON.stringify(o.raw.h) === JSON.stringify(e.raw.h);
  if (a === b && hs) same++; else { diff++; console.log('DIFF', o.handle, a.length, b.length, hs, [...a].findIndex((c, i) => c !== b[i])); }
  if (VERBOSE) console.log(o.handle, f.states.map((x) => x.name).join('|'), a === b ? 'bit for bit' : 'differs');
}
console.log(same + ' visibility parameters re-encoded bit for bit from their fields, ' + diff + ' differ');

// an edit: rename the first state of Receptacle's parameter and move one object from the second state's list to the first's
const o = db.objects.find((x) => x.type === 'BLOCKVISIBILITYPARAMETER' && fields(x).states.some((s) => s.name === 'GFI'));
const f = fields(o);
f.states[0].name = 'Duplex (edited)';
const moved = f.states[1].entities.find((h) => !f.states[0].entities.includes(h));
f.states[0].entities.push(moved);
const back = D.visibilityOf({ ...o, raw: encode(f, o.raw.ver).raw });
console.log('edited and read back:', JSON.stringify(back.states.map((s) => [s.name, s.entities.length])), back.states[0].entities.includes(String(moved[1]).toUpperCase()) ? 'the moved object is in the first state' : 'MISSING');
process.exit(diff ? 1 : 0);
