/* SPDX-License-Identifier: Apache-2.0 */
/**
 * probe-lib.mjs — helpers for the DB.1 spike (docs/DWG-DYNAMIC-BLOCKS.md): read the corpus with cc-dwg, find the
 * dynamic-block objects (kept raw, passthrough.js) and decode their data bits against a layout under test.
 * Test tooling only; nothing here ships.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const lib = (f) => import(pathToFileURL(path.join(ROOT, 'lib/dwg', f)).href);
export const { readDwg } = await lib('read.js');
export const { BitReader } = await lib('bits-read.js');
export const { unb64 } = await lib('bits-util.js');
export const CORPUS = '/var/www/CADCRAFT/testfiles/dwg-corpus';
export const VERS = ['AC1015', 'AC1018', 'AC1021', 'AC1024', 'AC1027', 'AC1032'];

export function load(name, ver = 'AC1015') {
  const f = name.endsWith('.dwg') ? name : ver === 'orig' ? path.join(CORPUS, 'orig', name + '.dwg') : path.join(CORPUS, ver, name + '.dwg');
  return readDwg(new Uint8Array(fs.readFileSync(f)), { raw: true });
}
/** handle (hex) → its extension dictionary's handle (hex), from the reader's records ({raw: true}). */
export function xdicOf(db) {
  const m = new Map();
  const recs = db._records instanceof Map ? db._records.values() : Object.values(db._records || {});
  for (const r of recs) if (r && r._h && r._h.xdic) m.set(r.handle.toString(16).toUpperCase(), r._h.xdic.toString(16).toUpperCase());
  return m;
}
export const typeOf = (o) => o.dxfName || o.type;
export const byHandle = (db) => {
  const m = new Map();
  for (const o of db.objects || []) m.set(o.handle, o);
  for (const b of db.blocks || []) { m.set(b.handle, b); for (const e of b.entities || []) m.set(e.handle, e); }
  for (const e of db.entities || []) m.set(e.handle, e);
  return m;
};

/** A reader on an object's raw data bits. R2007+: strings come from the string stream at the end (20.1). */
export function reader(o) {
  const raw = o.raw;
  const buf = unb64(raw.data);
  const r = new BitReader(buf, { version: raw.ver, endBit: raw.n });
  if (raw.ver >= 21) {
    // 20.1: the last bit of the data says whether a string stream is there; its size sits before that bit
    const end = raw.n;
    const s = new BitReader(buf, { version: raw.ver, startBit: end - 1, endBit: end });
    if (s.B()) {
      let p = end - 1 - 16;
      const sr = new BitReader(buf, { version: raw.ver, startBit: p, endBit: p + 16 });
      let size = sr.RSu();
      if (size & 0x8000) {
        p -= 16;
        const hr = new BitReader(buf, { version: raw.ver, startBit: p, endBit: p + 16 });
        size = (size & 0x7fff) | (hr.RSu() << 15);
      }
      const start = p - size;
      r.str = new BitReader(buf, { version: raw.ver, startBit: start, endBit: p });
      r.end = start;
    } else r.end = end - 1;
  }
  return r;
}

/** Every bit offset where a T string of printable characters starts (R15/R18 data). */
export function strings(o, min = 2) {
  const buf = unb64(o.raw.data), out = [];
  for (let p = 0; p + 18 < o.raw.n; p++) {
    try {
      const r = new BitReader(buf, { version: 15, startBit: p, endBit: o.raw.n });
      const n = r.BS();
      if (n < min || n > 200) continue;
      const b = r.bytes(n);
      let s = '';
      let okc = true;
      for (let i = 0; i < b.length; i++) { const c = b[i]; if (c === 0 && i === b.length - 1) break; if (c < 32 || c > 126) { okc = false; break; } s += String.fromCharCode(c); }
      if (okc && s.length >= min) out.push([p, r.pos, s]);
    } catch { /* past the end */ }
  }
  return out;
}

/** Decode with a layout: [[name, kind], …]; kind is a BitReader method name, or a function (r, out) → value. */
export function decode(o, layout) {
  const r = reader(o), out = {};
  let err = null;
  for (const [name, kind] of layout) {
    try { out[name] = typeof kind === 'function' ? kind(r, out) : r[kind](); }
    catch (e) { err = name + ': ' + e.message; break; }
  }
  return { out, left: r.end - r.pos, err, strLeft: r.str ? r.str.end - r.str.pos : 0 };
}

/** ACAD_EVALUATION_GRAPH → Map(node id → element handle): BL, BL, BL node count, then per node BL index (into the
 *  graph's handle list), BL flags (32 in every sample), BL node id, BL ×4 (edge indices, −1 = none). */
export function graphNodes(g) {
  const r = reader(g), out = new Map();
  r.BL(); r.BL(); const n = r.BL();
  for (let i = 0; i < n; i++) { const idx = r.BL(); r.BL(); const id = r.BL(); r.BL(); r.BL(); r.BL(); r.BL(); out.set(id, g.raw.h[idx]?.[1]); }
  return out;
}

/** The element header every dynamic-block object starts with (EvalExpr + BlockElement): BL −1, BL release (27 =
 *  AutoCAD 2007 format), BL maintenance, BL 32-bit value (low 16 bits 0xD8F1 in every sample; meaning unknown);
 *  the element's name is the first string (TV). */
export function header(r) { return { id: r.BL(), release: r.BL(), maint: r.BL(), tag: r.BL() >>> 0, name: r.TV() }; }

/** BLOCKVISIBILITYPARAMETER → { name, label, description, point, grip, all[], states[{name, entities[], elements[]}] }. */
export function visibility(o) {
  const r = reader(o), h = o.raw.h.map(([, x]) => x);
  let k = 0;
  const take = (n) => h.slice(k, (k += n));
  const head = header(r);
  const flags = [r.B(), r.B()];                       // BlockParameter: show properties, chain actions
  const pad = [r.BS(), r.BS(), r.BS(), r.BS()];       // 256, 1, 0, 0 in every sample (meaning unknown)
  const point = r.BD3();
  const z1 = r.BS(), z2 = r.BS(), grip = r.BL();      // 0, 0, the node id of the parameter's grip
  const label = r.TV(), description = r.TV();
  const f2 = [r.B(), r.B()];
  const all = take(r.BL());
  const states = [];
  for (let i = 0, n = r.BL(); i < n; i++) {
    const name = r.TV();
    const entities = take(r.BL()), elements = take(r.BL());
    states.push({ name, entities, elements });
  }
  return { ...head, flags, pad, point, z: [z1, z2], grip, label, description, f2, all, states, left: r.end - r.pos, refsLeft: h.length - k, strLeft: r.str ? r.str.end - r.str.pos : 0 };
}
