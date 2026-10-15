/* SPDX-License-Identifier: Apache-2.0 */
/**
 * dynblock-write.js — writing an edited visibility parameter of a dynamic block (0.5 DB.9, after the DB.10 spike).
 * cc-dwg, Apache-2.0. Not in the ODA spec: the BLOCKVISIBILITYPARAMETER layout is a `Spec gap:` found by experiment on
 * AutoCAD's own files (docs/DWG-DYNAMIC-BLOCKS.md § BLOCKVISIBILITYPARAMETER and § DB.10; dynblock-read.js reads the same
 * layout). LibreDWG's source was never read.
 *
 * Only what DB.10 found possible: the states of a parameter that is already in the file — renamed, added, deleted, and
 * which of the block's entities each one shows. Every other field (header, flags, grip point, grip node, label,
 * description, the list of every entity) is written back as it came. Nothing here makes a new parameter or graph.
 *
 *   visibilityFields(raw)           → every field of the parameter, in file order (handles as [code, 'HEX'])
 *   encodeVisibility(fields, ver)   → raw { ver, n, data, h } (passthrough.js's form, so the writer copies it like any raw object)
 *   rewriteVisibility(raw, states)  → raw with these states:
 *       states = [{ name, entities: ['HEX'…] (from the parameter's list of every entity), from?: a state name in the file
 *                   (whose parameters/grips list the new state takes; default: the state of that name, else the first) }]
 *     Throws (message 'not-exact' | 'handles' | 'states' | 'layout') when the parameter does not re-encode bit for bit from
 *     its own fields first — then the caller saves the block plain — or when the states are not valid.
 */
import { BitReader } from './bits-read.js';
import { BitWriter } from './bits-write.js';
import { b64, unb64 } from './bits-util.js';
import { stringStreamStart } from './objects-read.js';

const hexKey = (h) => (h === undefined || h === null ? '' : String(h).toUpperCase().replace(/^0+(?=.)/, ''));
const VERSION = { 15: 'AC1015', 18: 'AC1018', 21: 'AC1021', 24: 'AC1024', 27: 'AC1027', 32: 'AC1032' };
const LIMIT = { list: 100000, states: 1000, name: 255 };

/** A reader on a raw object's data bits; R2007+ strings come from the string stream at the end (ODA spec 20.1). */
function reader(raw) {
  const buf = unb64(raw.data);
  const r = new BitReader(buf, { version: raw.ver, endBit: raw.n });
  if (raw.ver >= 21) {
    const ss = stringStreamStart(buf, raw.n, 0);
    const s = new BitReader(buf, { version: raw.ver, startBit: raw.n, endBit: raw.n });
    if (ss !== -1) { s.pos = ss.start; s.end = ss.end; r.end = ss.start; } else r.end = raw.n - 1;
    r.str = s;
  }
  return r;
}
const count = (n, max) => { if (!Number.isInteger(n) || n < 0 || n > max) throw new Error('layout'); return n; };

/**
 * Spec gap (docs/DWG-DYNAMIC-BLOCKS.md): element header (BL −1, BL release, BL maintenance, BL a 32-bit value, TV name) ·
 * B B · BS ×4 · BD3 grip point · BS BS · BL grip node · TV label · TV description · B B · BL n + n handles (every entity)
 * · BL states, each TV name · BL a + a handles (entities shown) · BL b + b handles (parameters and grips shown).
 */
export function visibilityFields(raw) {
  if (!raw || !VERSION[raw.ver] || typeof raw.data !== 'string' || !Array.isArray(raw.h)) throw new Error('layout');
  const r = reader(raw), h = raw.h.map(([c, x]) => [c, hexKey(x)]);
  let k = 0;
  const take = (n) => { if (k + n > h.length) throw new Error('layout'); const l = h.slice(k, k + n); k += n; return l; };
  const f = { ver: raw.ver, id: r.BL(), release: r.BL(), maint: r.BL(), tag: r.BL(), name: r.TV(), b: [r.B(), r.B()], pad: [r.BS(), r.BS(), r.BS(), r.BS()],
    point: r.BD3(), z: [r.BS(), r.BS()], grip: r.BL(), label: r.TV(), description: r.TV(), f2: [r.B(), r.B()] };
  f.all = take(count(r.BL(), LIMIT.list));
  f.states = [];
  for (let i = 0, n = count(r.BL(), LIMIT.states); i < n; i++) {
    const name = r.TV();
    const entities = take(count(r.BL(), LIMIT.list)), elements = take(count(r.BL(), LIMIT.list));
    f.states.push({ name, entities, elements });
  }
  if (r.end - r.pos !== 0 || k !== h.length || (r.str && r.str.end - r.str.pos !== 0)) throw new Error('layout');
  return f;
}

/** The fields back to bits: R2007+ strings go to the string stream, followed by its size and the flag bit (ODA spec 20.1). */
export function encodeVisibility(f, ver = f.ver) {
  const V = VERSION[ver];
  if (!V) throw new Error('layout');
  const w = new BitWriter(V), s = ver >= 21 ? new BitWriter(V) : w;
  const handles = [];
  w.BL(f.id); w.BL(f.release); w.BL(f.maint); w.BL(f.tag | 0); s.TV(f.name);
  w.B(f.b[0]); w.B(f.b[1]); for (const v of f.pad) w.BS(v);
  w.BD3(f.point.x, f.point.y, f.point.z);
  for (const v of f.z) w.BS(v);
  w.BL(f.grip); s.TV(f.label); s.TV(f.description); w.B(f.f2[0]); w.B(f.f2[1]);
  w.BL(f.all.length); handles.push(...f.all);
  w.BL(f.states.length);
  for (const st of f.states) { s.TV(st.name); w.BL(st.entities.length); handles.push(...st.entities); w.BL(st.elements.length); handles.push(...st.elements); }
  if (ver >= 21) {
    const size = s.bit;
    w.append(s);
    if (size < 0x8000) w.RS(size); else { w.RS(size >>> 15); w.RS((size & 0x7fff) | 0x8000); }
    w.B(1);
  }
  return { ver, n: w.bit, data: b64(w.bytes()), h: handles.map(([c, x]) => [c, x]) };
}

const bitsOf = (raw) => { const u = unb64(raw.data); let s = ''; for (let i = 0; i < raw.n; i++) s += (u[i >> 3] >> (7 - (i & 7))) & 1; return s; };
const sameHandles = (a, b) => a.length === b.length && a.every(([c, x], i) => c === b[i][0] && hexKey(x) === hexKey(b[i][1]));

/** True when the parameter re-encodes bit for bit from its own fields (so an edited one is written in the same layout). */
export function reencodesExactly(raw) {
  try { const e = encodeVisibility(visibilityFields(raw), raw.ver); return e.n === raw.n && bitsOf(e) === bitsOf(raw) && sameHandles(e.h, raw.h); } catch { return false; }
}

const clean = (s) => String(s ?? '').replace(/[\x00-\x1f]/g, '').slice(0, LIMIT.name);

/** The parameter with edited states (see the header). → raw */
export function rewriteVisibility(raw, states) {
  if (!reencodesExactly(raw)) throw new Error('not-exact');
  const f = visibilityFields(raw);
  if (!Array.isArray(states) || !states.length || states.length > LIMIT.states) throw new Error('states');
  const code = new Map(f.all.map(([c, x]) => [x, c])), at = new Map(f.all.map(([, x], i) => [x, i]));
  // the code a state's entity reference uses: as in the file's own state lists, else the list of every entity's
  const stateCode = f.states.flatMap((s) => s.entities)[0]?.[0];
  const byName = new Map(f.states.map((s) => [s.name.toLowerCase(), s]));
  const names = new Set();
  f.states = states.map((st) => {
    const name = clean(st.name);
    if (!name || names.has(name.toLowerCase())) throw new Error('states');
    names.add(name.toLowerCase());
    const ents = [...new Set((st.entities || []).map(hexKey))];
    if (ents.some((x) => !code.has(x))) throw new Error('handles');
    ents.sort((a, b) => at.get(a) - at.get(b));   // in the block's order, as AutoCAD lists them
    const base = byName.get(String(st.from ?? name).toLowerCase()) || f.states[0];
    return { name, entities: ents.map((x) => [stateCode ?? code.get(x), x]), elements: base ? base.elements.map(([c, x]) => [c, x]) : [] };
  });
  return encodeVisibility(f, raw.ver);
}
