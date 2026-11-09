/* SPDX-License-Identifier: Apache-2.0 */
/**
 * oasis.js — OASIS (SEMI P39) reader and writer for the chip layout model (layout.js). Written from the published description of the format:
 * unsigned/signed integers (7 bits a byte), reals (8 kinds), strings, 1-/2-/3-/g-deltas, point lists, the 12 repetition kinds, modal
 * variables (reset by each CELL), XYABSOLUTE / XYRELATIVE, name tables with implicit or explicit reference numbers (resolved after reading,
 * so forward references work), PROPERTY / repeat-PROPERTY (S_GDS_PROPERTY becomes a GDSII property), CBLOCK (DEFLATE, our own inflate in
 * zlib.js), END with CRC32 or checksum32 validation, LAYERNAME records (kept as lib.layerNames for the layer map).
 *
 *   readOasis(bytes) → { lib, problems }
 *   writeOasis(lib, { compress = true, validate = 'crc32', problems }) → Uint8Array
 *
 * Honest limits: TRAPEZOID and CTRAPEZOID are turned into polygons by our reading of the spec's tables and CIRCLE into a 64-sided polygon;
 * XGEOMETRY / XELEMENT records are skipped and counted. The writer emits rectangles, polygons, paths, placements and texts only. Files
 * from other programs have not been tried yet (no third-party OASIS sample in the tree); everything is checked by our own round trips.
 */
import { prob } from './problem.js';
import { newLib, newCell, POLY, PATH, BOX } from './layout.js';
import { inflateRawSized, deflateRaw } from './zlib.js';

const MAGIC = '%SEMI-OASIS\r\n';

// ---------------------------------------------------------------- CRC32 / checksum32
let CRC_T = null;
export function crc32(b, end = b.length, c = 0xffffffff) { if (!CRC_T) { CRC_T = new Uint32Array(256); for (let n = 0; n < 256; n++) { let x = n; for (let k = 0; k < 8; k++) x = x & 1 ? 0xedb88320 ^ (x >>> 1) : x >>> 1; CRC_T[n] = x >>> 0; } } for (let i = 0; i < end; i++) c = CRC_T[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function checksum32(b, end) { let s = 0; for (let i = 0; i < end; i++) s = (s + b[i]) >>> 0; return s; }

// ---------------------------------------------------------------- reader
class Src {
  constructor(b) { this.b = b; this.p = 0; }
  u() { let v = 0, m = 1, c; do { if (this.p >= this.b.length) throw new Error('cut short'); c = this.b[this.p++]; v += (c & 127) * m; m *= 128; } while (c & 128); return v; }
  s() { const u = this.u(); return u % 2 ? -Math.floor(u / 2) : Math.floor(u / 2); }
  real() {
    const t = this.u();
    switch (t) {
      case 0: return this.u(); case 1: return -this.u(); case 2: return 1 / this.u(); case 3: return -1 / this.u();
      case 4: { const a = this.u(); return a / this.u(); } case 5: { const a = this.u(); return -a / this.u(); }
      case 6: { const v = new DataView(this.b.buffer, this.b.byteOffset + this.p, 4).getFloat32(0, true); this.p += 4; return v; }
      case 7: { const v = new DataView(this.b.buffer, this.b.byteOffset + this.p, 8).getFloat64(0, true); this.p += 8; return v; }
      default: throw new Error('real of unknown kind ' + t);
    }
  }
  str() { const n = this.u(); if (this.p + n > this.b.length) throw new Error('cut short'); let s = ''; for (let i = 0; i < n; i++) s += String.fromCharCode(this.b[this.p + i]); this.p += n; return s; }
  bytes(n) { const v = this.b.subarray(this.p, this.p + n); this.p += n; return v; }
  g() { // g-delta → [dx, dy]
    const u = this.u();
    if (u % 2 === 0) { const dir = Math.floor(u / 2) & 7, m = Math.floor(u / 16); return oct(dir, m); }
    const mx = Math.floor(u / 4), sx = Math.floor(u / 2) & 1; return [sx ? -mx : mx, this.s()];
  }
}
const oct = (dir, m) => [[m, 0], [0, m], [-m, 0], [0, -m], [m, m], [-m, m], [-m, -m], [m, -m]][dir];

function pointList(S, polygon) { // → flat array of offsets from the element's position, first point [0, 0] included
  const type = S.u(), n = S.u(), out = [0, 0]; let x = 0, y = 0;
  if (type === 0 || type === 1) {
    let h = type === 0; for (let k = 0; k < n; k++) { const v = S.s(); if (h) x += v; else y += v; out.push(x, y); h = !h; }
    if (polygon) { const ix = h ? 0 : x, iy = h ? y : 0; // one implied corner keeps the outline Manhattan; dropped when it falls on a corner already there
      if (!(ix === 0 && iy === 0) && !(ix === x && iy === y)) out.push(ix, iy); }
  } else if (type === 2) { for (let k = 0; k < n; k++) { const u = S.u(), d = [[1, 0], [0, 1], [-1, 0], [0, -1]][u & 3], m = Math.floor(u / 4); x += d[0] * m; y += d[1] * m; out.push(x, y); } }
  else if (type === 3) { for (let k = 0; k < n; k++) { const u = S.u(), d = oct(u & 7, Math.floor(u / 8)); x += d[0]; y += d[1]; out.push(x, y); } }
  else if (type === 4) { for (let k = 0; k < n; k++) { const d = S.g(); x += d[0]; y += d[1]; out.push(x, y); } }
  else if (type === 5) { let dx = 0, dy = 0; for (let k = 0; k < n; k++) { const d = S.g(); dx += d[0]; dy += d[1]; x += dx; y += dy; out.push(x, y); } }
  else throw new Error('point list of unknown kind ' + type);
  return out;
}
function repetition(S, M) {
  const t = S.u();
  switch (t) {
    case 0: if (!M.rep) throw new Error('repetition reused before one was given'); return M.rep;
    case 1: { const nx = S.u() + 2, ny = S.u() + 2, sx = S.u(), sy = S.u(); return { kind: 'lattice', nx, ny, ax: [sx, 0], ay: [0, sy] }; }
    case 2: { const nx = S.u() + 2, sx = S.u(); return { kind: 'lattice', nx, ny: 1, ax: [sx, 0], ay: [0, 0] }; }
    case 3: { const ny = S.u() + 2, sy = S.u(); return { kind: 'lattice', nx: 1, ny, ax: [0, 0], ay: [0, sy] }; }
    case 4: case 5: case 6: case 7: { const n = S.u() + 2, gr = t === 5 || t === 7 ? S.u() : 1, d = [0, 0]; let v = 0; for (let k = 1; k < n; k++) { v += S.u() * gr; if (t <= 5) d.push(v, 0); else d.push(0, v); } return { kind: 'list', d }; }
    case 8: { const n = S.u() + 2, m = S.u() + 2, a = S.g(), b = S.g(); return { kind: 'lattice', nx: n, ny: m, ax: a, ay: b }; }
    case 9: { const n = S.u() + 2, a = S.g(); return { kind: 'lattice', nx: n, ny: 1, ax: a, ay: [0, 0] }; }
    case 10: case 11: { const n = S.u() + 2, gr = t === 11 ? S.u() : 1, d = [0, 0]; let x = 0, y = 0; for (let k = 1; k < n; k++) { const g = S.g(); x += g[0] * gr; y += g[1] * gr; d.push(x, y); } return { kind: 'list', d }; }
    default: throw new Error('repetition of unknown kind ' + t);
  }
}
const CTRAP = [ // (w, h) → corners, by our reading of the CTRAPEZOID table
  (w, h) => [0, 0, 0, h, w - h, h, w, 0], (w, h) => [0, 0, 0, h, w, h, w - h, 0], (w, h) => [0, 0, h, h, w, h, w, 0], (w, h) => [h, 0, 0, h, w, h, w, 0],
  (w, h) => [0, 0, h, h, w - h, h, w, 0], (w, h) => [h, 0, 0, h, w, h, w - h, 0], (w, h) => [0, 0, h, h, w, h, w - h, 0], (w, h) => [h, 0, 0, h, w - h, h, w, 0],
  (w, h) => [0, 0, 0, h, w, h - w, w, 0], (w, h) => [0, 0, 0, h - w, w, h, w, 0], (w, h) => [0, 0, 0, h, w, h, w, w], (w, h) => [0, w, 0, h, w, h, w, 0],
  (w, h) => [0, 0, 0, h, w, h - w, w, w], (w, h) => [0, w, 0, h - w, w, h, w, 0], (w, h) => [0, 0, 0, h - w, w, h, w, w], (w, h) => [0, w, 0, h, w, h - w, w, 0],
  (w) => [0, 0, 0, w, w, 0], (w) => [0, 0, 0, w, w, w], (w) => [0, 0, w, w, w, 0], (w) => [0, w, w, w, w, 0],
  (w, h) => [0, 0, h, h, 2 * h, 0], (w, h) => [0, h, 2 * h, h, h, 0], (w) => [0, 0, 0, 2 * w, w, w], (w) => [w, 0, 0, w, w, 2 * w],
  (w, h) => [0, 0, 0, h, w, h, w, 0], (w) => [0, 0, 0, w, w, w, w, 0],
];

export function readOasis(bytes) {
  const problems = [], lib = newLib('');
  for (let i = 0; i < MAGIC.length; i++) if (bytes[i] !== MAGIC.charCodeAt(i)) return { lib, problems: [prob('oas.magic', 'The file does not start with %SEMI-OASIS: it is not an OASIS file.')] };
  let S = new Src(bytes); S.p = MAGIC.length; const stack = [];
  const names = { cell: new Map(), text: new Map(), prop: new Map(), str: new Map() }, implicit = { cell: 0, text: 0, prop: 0, str: 0 };
  lib.layerNames = [];
  let M = null, cell = null, target = null, offsetFlag = 0, ended = false, skipped = { x: 0, trap: 0, circle: 0 }, lastProp = null;
  const resetModal = () => { M = { rel: false, px: 0, py: 0, tx: 0, ty: 0, gx: 0, gy: 0, layer: undefined, dt: undefined, tl: undefined, tt: undefined, gw: undefined, gh: undefined, hw: undefined, se: undefined, ee: undefined, ppl: undefined, pathpl: undefined, ct: undefined, r: undefined, pcell: undefined, text: undefined, rep: undefined }; };
  resetModal();
  const X = (k, has, v) => { const key = k + 'x'; if (has) M[key] = M.rel ? M[key] + v : v; return M[key]; };
  const Y = (k, has, v) => { const key = k + 'y'; if (has) M[key] = M.rel ? M[key] + v : v; return M[key]; };
  const need = (v, what) => { if (v === undefined) throw new Error(what + ' used before it was given'); return v; };
  const addShape = (kind, layer, dt, x, y, offs, rep, width = 0, ext = null) => {
    const st = cell.shapes, i = st.begin(kind, layer & 0xffff, dt & 0xffff, width); st.grow(0, st.nxy + offs.length); for (let k = 0; k < offs.length; k += 2) { st.xy[st.nxy++] = x + offs[k]; st.xy[st.nxy++] = y + offs[k + 1]; } st.end();
    if (rep) st.rep.set(i, rep); if (ext) st.ext.set(i, ext); target = { kind: 'shape', i };
  };
  const attach = (p) => {
    const gp = p.standard && p.name === 'S_GDS_PROPERTY' && p.values.length === 2 ? [Number(p.values[0]), String(p.values[1])] : { name: p.name, values: p.values };
    if (!target) (lib.props ||= []).push(gp);
    else if (target.kind === 'cell') (cell.props ||= []).push(gp);
    else if (target.kind === 'shape') { const P = cell.shapes.props; (P.get(target.i) || P.set(target.i, []).get(target.i)).push(gp); }
    else if (target.kind === 'obj') (target.o.props ||= []).push(gp);
    // properties on name records (S_BOUNDING_BOX, S_CELL_OFFSET …) are hints for random access and are not kept
  };
  try {
    for (;;) {
      if (S.p >= S.b.length) { if (stack.length) { S = stack.pop(); continue; } break; }
      const id = S.u();
      switch (id) {
        case 0: break; // PAD
        case 1: { lib.oasisVersion = S.str(); const unit = S.real(); lib.metersPerDb = +(1e-6 / unit).toPrecision(12); lib.userPerDb = +(1 / unit).toPrecision(12); offsetFlag = S.u(); if (offsetFlag === 0) for (let k = 0; k < 12; k++) S.u(); break; }
        case 2: {
          if (offsetFlag !== 0) for (let k = 0; k < 12; k++) S.u();
          S.str(); const scheme = S.u();
          if (scheme === 1 || scheme === 2) { const at = S.p, sig = (S.b[at] | (S.b[at + 1] << 8) | (S.b[at + 2] << 16) | (S.b[at + 3] << 24)) >>> 0; S.p += 4;
            if (stack.length) problems.push(prob('oas.end-in-cblock', 'END was found inside a compressed block.'));
            else { const want = scheme === 1 ? crc32(bytes, at) : checksum32(bytes, at); if (want !== sig) problems.push(prob('oas.validation', 'The file\'s ' + (scheme === 1 ? 'CRC32' : 'checksum') + ' does not match: it may be damaged.', { severity: 'warning' })); else lib.validated = scheme === 1 ? 'crc32' : 'checksum32'; } }
          ended = true; break;
        }
        case 3: case 4: { const nm = S.str(), r = id === 4 ? S.u() : implicit.cell++; names.cell.set(r, nm); target = { kind: 'name' }; break; }
        case 5: case 6: { const nm = S.str(), r = id === 6 ? S.u() : implicit.text++; names.text.set(r, nm); target = { kind: 'name' }; break; }
        case 7: case 8: { const nm = S.str(), r = id === 8 ? S.u() : implicit.prop++; names.prop.set(r, nm); target = { kind: 'name' }; break; }
        case 9: case 10: { const nm = S.str(), r = id === 10 ? S.u() : implicit.str++; names.str.set(r, nm); target = { kind: 'name' }; break; }
        case 11: case 12: { const nm = S.str(), iv = () => { const t = S.u(); return t === 0 ? [0, Infinity] : t === 1 ? [0, S.u()] : t === 2 ? [S.u(), Infinity] : t === 3 ? ((v) => [v, v])(S.u()) : [S.u(), S.u()]; }; const L = iv(), D = iv(); lib.layerNames.push({ name: nm, layer: L, datatype: D, text: id === 12 }); target = { kind: 'name' }; break; }
        case 13: case 14: { const key = id === 13 ? { ref: S.u() } : S.str(); resetModal(); const nm = typeof key === 'string' ? key : '\u0000#' + key.ref; cell = lib.cells[nm] || newCell(lib, nm); target = { kind: 'cell' }; break; }
        case 15: M.rel = false; break;
        case 16: M.rel = true; break;
        case 17: case 18: {
          const info = S.u(); let ref = M.pcell;
          if (info & 0x80) ref = info & 0x40 ? { ref: S.u() } : S.str(); M.pcell = need(ref, 'placement cell');
          let mag = 1, angle = 0;
          if (id === 18) { if (info & 0x04) mag = S.real(); if (info & 0x02) angle = S.real(); } else angle = ((info >> 1) & 3) * 90;
          const x = X('p', info & 0x20, info & 0x20 ? S.s() : 0), y = Y('p', info & 0x10, info & 0x10 ? S.s() : 0);
          const rep = info & 0x08 ? (M.rep = repetition(S, M)) : undefined;
          const r = { cell: ref, x, y, flip: !!(info & 1), angle, mag }; if (rep) r.rep = rep;
          if (!cell) throw new Error('a placement outside a cell'); cell.refs.push(r); target = { kind: 'obj', o: r }; break;
        }
        case 19: {
          const info = S.u(); let txt = M.text;
          if (info & 0x40) txt = info & 0x20 ? { ref: S.u() } : S.str(); M.text = need(txt, 'text string');
          if (info & 0x01) M.tl = S.u(); if (info & 0x02) M.tt = S.u();
          const x = X('t', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('t', info & 0x08, info & 0x08 ? S.s() : 0);
          const rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          const t = { text: txt, layer: need(M.tl, 'text layer'), texttype: need(M.tt, 'text type'), x, y }; if (rep) t.rep = rep;
          if (!cell) throw new Error('a text outside a cell'); cell.texts.push(t); target = { kind: 'obj', o: t }; break;
        }
        case 20: {
          const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u();
          if (info & 0x40) M.gw = S.u(); if (info & 0x80) M.gh = M.gw; else if (info & 0x20) M.gh = S.u();
          const x = X('g', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('g', info & 0x08, info & 0x08 ? S.s() : 0), rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          const w = need(M.gw, 'rectangle width'), h = need(M.gh, 'rectangle height');
          addShape(POLY, need(M.layer, 'layer'), need(M.dt, 'datatype'), x, y, [0, 0, w, 0, w, h, 0, h], rep); break;
        }
        case 21: {
          const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u(); if (info & 0x20) M.ppl = pointList(S, true);
          const x = X('g', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('g', info & 0x08, info & 0x08 ? S.s() : 0), rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          addShape(POLY, need(M.layer, 'layer'), need(M.dt, 'datatype'), x, y, need(M.ppl, 'polygon point list'), rep); break;
        }
        case 22: {
          const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u(); if (info & 0x40) M.hw = S.u();
          if (info & 0x80) { const e = S.u(), ss = (e >> 2) & 3, ee = e & 3; const ext = (k, cur) => (k === 0 ? cur : k === 1 ? 0 : k === 2 ? 'hw' : S.s()); M.se = ext(ss, M.se); M.ee = ext(ee, M.ee); }
          if (info & 0x20) M.pathpl = pointList(S, false);
          const x = X('g', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('g', info & 0x08, info & 0x08 ? S.s() : 0), rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          const hw = need(M.hw, 'path half-width'), se = M.se === 'hw' ? hw : (M.se ?? 0), ee = M.ee === 'hw' ? hw : (M.ee ?? 0);
          const ext = se === 0 && ee === 0 ? null : se === hw && ee === hw ? { pathtype: 2 } : { pathtype: 4, bgnext: se, endext: ee };
          addShape(PATH, need(M.layer, 'layer'), need(M.dt, 'datatype'), x, y, need(M.pathpl, 'path point list'), rep, 2 * hw, ext); break;
        }
        case 23: case 24: case 25: {
          const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u(); if (info & 0x40) M.gw = S.u(); if (info & 0x20) M.gh = S.u();
          const da = id !== 25 ? S.s() : 0, db = id !== 24 ? S.s() : 0;
          const x = X('g', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('g', info & 0x08, info & 0x08 ? S.s() : 0), rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          const w = need(M.gw, 'width'), h = need(M.gh, 'height');
          const pts = info & 0x80 ? [0, Math.max(0, -da), 0, h - Math.max(0, da), w, h - Math.max(0, db), w, Math.max(0, -db)].map((v, i) => (i % 2 ? v : v)) : [Math.max(0, da), 0, Math.max(0, -da), h, w - Math.max(0, -db), h, w - Math.max(0, db), 0];
          skipped.trap++; addShape(POLY, M.layer, M.dt, x, y, pts, rep); break;
        }
        case 26: {
          const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u(); if (info & 0x80) M.ct = S.u(); if (info & 0x40) M.gw = S.u(); if (info & 0x20) M.gh = S.u();
          const x = X('g', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('g', info & 0x08, info & 0x08 ? S.s() : 0), rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          const f = CTRAP[need(M.ct, 'ctrapezoid type')]; if (!f) throw new Error('ctrapezoid type ' + M.ct);
          skipped.trap++; addShape(POLY, M.layer, M.dt, x, y, f(M.gw ?? 0, M.gh ?? M.gw ?? 0), rep); break;
        }
        case 27: {
          const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u(); if (info & 0x20) M.r = S.u();
          const x = X('g', info & 0x10, info & 0x10 ? S.s() : 0), y = Y('g', info & 0x08, info & 0x08 ? S.s() : 0), rep = info & 0x04 ? (M.rep = repetition(S, M)) : undefined;
          const r = need(M.r, 'circle radius'), pts = []; for (let k = 0; k < 64; k++) pts.push(Math.round(r * Math.cos(k * Math.PI / 32)), Math.round(r * Math.sin(k * Math.PI / 32)));
          skipped.circle++; addShape(POLY, M.layer, M.dt, x, y, pts, rep); break;
        }
        case 28: {
          const info = S.u(); let name = lastProp?.name, values;
          if (info & 0x04) name = info & 0x02 ? { ref: S.u() } : S.str();
          if (info & 0x08) values = need(lastProp?.values, 'property values');
          else { let n = info >> 4; if (n === 15) n = S.u(); values = []; for (let k = 0; k < n; k++) { const t = S.u(); if (t <= 7) { S.p--; values.push(S.real()); } else if (t === 8) values.push(S.u()); else if (t === 9) values.push(S.s()); else if (t <= 12) values.push(S.str()); else values.push({ ref: S.u() }); } }
          lastProp = { name: need(name, 'property name'), values, standard: !!(info & 0x01) }; attach(lastProp); break;
        }
        case 29: if (!lastProp) throw new Error('PROPERTY repeated before one was given'); attach(lastProp); break;
        case 30: case 31: S.u(); S.str(); if (id === 31) S.u(); skipped.x++; break;
        case 32: S.u(); S.str(); skipped.x++; break;
        case 33: { const info = S.u(); if (info & 0x01) M.layer = S.u(); if (info & 0x02) M.dt = S.u(); S.u(); S.str(); X('g', info & 0x10, info & 0x10 ? S.s() : 0); Y('g', info & 0x08, info & 0x08 ? S.s() : 0); if (info & 0x04) M.rep = repetition(S, M); skipped.x++; break; }
        case 34: {
          const kind = S.u(), un = S.u(), cn = S.u(), data = S.bytes(cn);
          if (kind !== 0) { problems.push(prob('oas.cblock', 'A compressed block uses compression kind ' + kind + ', which is not DEFLATE; the rest of the file cannot be read.')); throw new Error('stop'); }
          let out; try { out = inflateRawSized(data, un); } catch (e) { problems.push(prob('oas.inflate', 'A compressed block does not unpack (' + e.message + ').')); throw new Error('stop'); }
          stack.push(S); S = new Src(out); break;
        }
        default: throw new Error('record of unknown kind ' + id);
      }
      if (ended) break;
    }
  } catch (e) { if (e.message !== 'stop') problems.push(prob('oas.read', 'Reading stopped at byte ' + S.p + (stack.length ? ' of a compressed block' : '') + ': ' + e.message + '.')); }
  if (!ended) problems.push(prob('oas.no-end', 'The file has no END record (cut short?).', { severity: 'warning' }));
  if (skipped.x) problems.push(prob('oas.x', skipped.x + ' extension record(s) (XNAME, XELEMENT, XGEOMETRY) were skipped.', { severity: 'note' }));
  if (skipped.trap) problems.push(prob('oas.trapezoid', skipped.trap + ' trapezoid(s) were read as polygons by our reading of the spec; check them against your source.', { severity: 'note' }));
  if (skipped.circle) problems.push(prob('oas.circle', skipped.circle + ' circle(s) were read as 64-sided polygons.', { severity: 'note' }));
  // resolve reference numbers
  const cname = (k) => (typeof k === 'string' ? k : names.cell.has(k.ref) ? names.cell.get(k.ref) : (problems.push(prob('oas.cellname', 'Cell number ' + k.ref + ' has no CELLNAME.')), '#' + k.ref));
  const rename = {}; for (const n of lib.order) if (n.startsWith('\u0000#')) rename[n] = cname({ ref: Number(n.slice(2)) });
  if (Object.keys(rename).length) { const cells = {}; lib.order = lib.order.map((n) => rename[n] || n); for (const [n, c] of Object.entries(lib.cells)) { c.name = rename[n] || n; cells[c.name] = c; } lib.cells = cells; }
  const pstr = (v) => (v && typeof v === 'object' && 'ref' in v ? names.str.get(v.ref) ?? '#' + v.ref : v);
  const fixProps = (ps) => { if (ps) for (let k = 0; k < ps.length; k++) { const p = ps[k]; if (Array.isArray(p)) continue; if (typeof p.name === 'object') p.name = names.prop.get(p.name.ref) ?? '#' + p.name.ref; p.values = p.values.map(pstr); if (p.name === 'S_GDS_PROPERTY' && p.values.length === 2) ps[k] = [Number(p.values[0]), String(p.values[1])]; } };
  fixProps(lib.props);
  for (const c of Object.values(lib.cells)) {
    c.shapes.trim(); fixProps(c.props); for (const ps of c.shapes.props.values()) fixProps(ps);
    for (const r of c.refs) { r.cell = cname(r.cell); fixProps(r.props); if (!lib.cells[r.cell]) problems.push(prob('oas.missing-cell', c.name + ' places cell ' + r.cell + ', which is not in the file.')); }
    for (const t of c.texts) { if (typeof t.text === 'object') t.text = names.text.get(t.text.ref) ?? '#' + t.text.ref; fixProps(t.props); }
  }
  if (!lib.layerNames.length) delete lib.layerNames;
  lib.name = lib.name || 'oasis';
  return { lib, problems };
}

// ---------------------------------------------------------------- writer
class Out {
  constructor(n = 1 << 16) { this.b = new Uint8Array(n); this.p = 0; }
  room(k) { if (this.p + k > this.b.length) { const b = new Uint8Array(Math.max(this.b.length * 2, this.p + k)); b.set(this.b.subarray(0, this.p)); this.b = b; } }
  u(v) { this.room(10); if (v < 0 || !Number.isFinite(v)) throw new Error('unsigned value ' + v); while (v >= 128) { this.b[this.p++] = (v % 128) | 128; v = Math.floor(v / 128); } this.b[this.p++] = v; }
  s(v) { this.u(v < 0 ? -v * 2 + 1 : v * 2); }
  str(s) { s = String(s); this.u(s.length); this.room(s.length); for (let i = 0; i < s.length; i++) this.b[this.p++] = s.charCodeAt(i) & 255; }
  real(v) { if (Number.isInteger(v) && Math.abs(v) < 2 ** 53) { this.u(v >= 0 ? 0 : 1); this.u(Math.abs(v)); return; } const r = 1 / v; if (Number.isInteger(r) && Math.abs(r) < 2 ** 53) { this.u(r > 0 ? 2 : 3); this.u(Math.abs(r)); return; } this.u(7); this.room(8); new DataView(this.b.buffer, this.b.byteOffset + this.p, 8).setFloat64(0, v, true); this.p += 8; }
  raw(bytes) { this.room(bytes.length); this.b.set(bytes, this.p); this.p += bytes.length; }
  g(dx, dy) { const a = Math.abs(dx), b = Math.abs(dy); if (dy === 0 || dx === 0 || a === b) { const dir = dy === 0 ? (dx >= 0 ? 0 : 2) : dx === 0 ? (dy > 0 ? 1 : 3) : dx > 0 ? (dy > 0 ? 4 : 7) : dy > 0 ? 5 : 6; this.u((Math.max(a, b) * 8 + dir) * 2); } else { this.u(a * 4 + (dx < 0 ? 2 : 0) + 1); this.s(dy); } }
  done() { return this.b.slice(0, this.p); }
}
function writePointList(o, xy, from, to, x0, y0, polygon) { // points after the first, relative to it
  const n = (to - from) / 2 - 1; let manh = true, octa = true;
  for (let k = from + 2; k < to; k += 2) { const dx = xy[k] - xy[k - 2], dy = xy[k + 1] - xy[k - 1]; if (dx !== 0 && dy !== 0) manh = false; if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) octa = false; }
  if (polygon && manh) { const dx = xy[from] - xy[to - 2], dy = xy[from + 1] - xy[to - 1]; if (dx !== 0 && dy !== 0) manh = false; }
  if (polygon && octa) { const dx = xy[from] - xy[to - 2], dy = xy[from + 1] - xy[to - 1]; if (dx !== 0 && dy !== 0 && Math.abs(dx) !== Math.abs(dy)) octa = false; }
  o.u(manh ? 2 : octa ? 3 : 4); o.u(n);
  for (let k = from + 2; k < to; k += 2) {
    const dx = xy[k] - xy[k - 2], dy = xy[k + 1] - xy[k - 1];
    if (manh) { const d = dx > 0 ? 0 : dy > 0 ? 1 : dx < 0 ? 2 : 3; o.u(Math.max(Math.abs(dx), Math.abs(dy)) * 4 + d); }
    else if (octa) { const a = Math.max(Math.abs(dx), Math.abs(dy)), d = dy === 0 ? (dx >= 0 ? 0 : 2) : dx === 0 ? (dy > 0 ? 1 : 3) : dx > 0 ? (dy > 0 ? 4 : 7) : dy > 0 ? 5 : 6; o.u(a * 8 + d); }
    else o.g(dx, dy);
  }
}
function writeRep(o, r) {
  if (r.kind === 'lattice') {
    const { nx, ny, ax, ay } = r;
    if (nx >= 2 && ny >= 2 && ax[1] === 0 && ay[0] === 0 && ax[0] >= 0 && ay[1] >= 0) { o.u(1); o.u(nx - 2); o.u(ny - 2); o.u(ax[0]); o.u(ay[1]); }
    else if (ny === 1 && nx >= 2 && ax[1] === 0 && ax[0] >= 0) { o.u(2); o.u(nx - 2); o.u(ax[0]); }
    else if (nx === 1 && ny >= 2 && ay[0] === 0 && ay[1] >= 0) { o.u(3); o.u(ny - 2); o.u(ay[1]); }
    else if (nx >= 2 && ny >= 2) { o.u(8); o.u(nx - 2); o.u(ny - 2); o.g(ax[0], ax[1]); o.g(ay[0], ay[1]); }
    else if (ny === 1) { o.u(9); o.u(nx - 2); o.g(ax[0], ax[1]); }
    else { o.u(9); o.u(ny - 2); o.g(ay[0], ay[1]); }
    return;
  }
  const d = r.d, n = d.length >> 1; let xOnly = true, yOnly = true;
  for (let k = 2; k < d.length; k += 2) { if (d[k + 1] !== 0 || d[k] < d[k - 2]) xOnly = false; if (d[k] !== 0 || d[k + 1] < d[k - 1]) yOnly = false; }
  if (xOnly) { o.u(4); o.u(n - 2); for (let k = 2; k < d.length; k += 2) o.u(d[k] - d[k - 2]); }
  else if (yOnly) { o.u(6); o.u(n - 2); for (let k = 2; k < d.length; k += 2) o.u(d[k + 1] - d[k - 1]); }
  else { o.u(10); o.u(n - 2); for (let k = 2; k < d.length; k += 2) o.g(d[k] - d[k - 2], d[k + 1] - d[k - 1]); }
}
const repOk = (r) => r && (r.kind === 'lattice' ? r.nx * r.ny >= 2 && (r.nx >= 2 || r.ny >= 2) : (r.d.length >> 1) >= 2);
const intRep = (r) => (r.kind === 'lattice' ? [...r.ax, ...r.ay].every(Number.isInteger) : r.d.every(Number.isInteger));

export function writeOasis(lib, { compress = true, validate = 'crc32', problems = [] } = {}) {
  const o = new Out(); o.raw(Uint8Array.from(MAGIC, (c) => c.charCodeAt(0)));
  const unit = 1e-6 / (lib.metersPerDb || 1e-9);
  o.u(1); o.str('1.0'); o.real(Number.isInteger(Math.round(unit * 1e6) / 1e6) ? Math.round(unit) : unit); o.u(0); for (let k = 0; k < 12; k++) o.u(0);
  const cellNum = new Map(); lib.order.forEach((n, i) => cellNum.set(n, i));
  for (const n of lib.order) { o.u(3); o.str(n); }
  for (const L of lib.layerNames || []) { o.u(L.text ? 12 : 11); o.str(L.name); for (const iv of [L.layer, L.datatype]) { if (iv[0] === 0 && iv[1] === Infinity) o.u(0); else if (iv[1] === Infinity) { o.u(2); o.u(iv[0]); } else if (iv[0] === iv[1]) { o.u(3); o.u(iv[0]); } else if (iv[0] === 0) { o.u(1); o.u(iv[1]); } else { o.u(4); o.u(iv[0]); o.u(iv[1]); } } }
  const props = (w, ps) => {
    for (const p of ps || []) {
      if (Array.isArray(p)) { w.u(28); w.u(0x20 | 0x04 | 0x01); w.str('S_GDS_PROPERTY'); w.u(8); w.u(p[0]); w.u(11); w.str(p[1]); continue; }
      const vals = p.values || [], cnt = vals.length; w.u(28); w.u(((cnt < 15 ? cnt : 15) << 4) | 0x04); w.str(p.name); if (cnt >= 15) w.u(cnt);
      for (const v of vals) { if (typeof v === 'string') { w.u(10); w.str(v); } else if (Number.isInteger(v) && v >= 0) { w.u(8); w.u(v); } else if (Number.isInteger(v)) { w.u(9); w.s(v); } else w.real(v); }
    }
  };
  props(o, lib.props);
  for (const name of lib.order) {
    const c = lib.cells[name], w = compress ? new Out(1 << 14) : o;
    w.u(13); w.u(cellNum.get(name)); w.u(16); // XYRELATIVE
    props(w, c.props);
    const M = { gx: 0, gy: 0, px: 0, py: 0, tx: 0, ty: 0 };
    const S = c.shapes;
    for (let i = 0; i < S.n; i++) {
      const k = S.kind[i], a = S.off[i], b = S.off[i + 1], xy = S.xy, x = xy[a], y = xy[a + 1], rep = S.rep.get(i), hasRep = repOk(rep) && intRep(rep);
      if (rep && !hasRep) problems.push(prob('oas.rep', 'A repetition in ' + name + ' could not be written; its shapes are written once.', { severity: 'warning' }));
      const dx = x - M.gx, dy = y - M.gy; M.gx = x; M.gy = y;
      const lb = M.layer === S.layer[i] ? 0 : 1, db = M.dt === S.dt[i] ? 0 : 2; M.layer = S.layer[i]; M.dt = S.dt[i];
      const isRect = k !== PATH && b - a === 8 && xy[a + 3] === y && xy[a + 2] > x && xy[a + 4] === xy[a + 2] && xy[a + 5] > y && xy[a + 6] === x && xy[a + 7] === xy[a + 5];
      if (isRect) {
        const W = xy[a + 2] - x, H = xy[a + 5] - y; let info = (dx ? 0x10 : 0) | (dy ? 0x08 : 0) | (hasRep ? 0x04 : 0) | db | lb;
        if (W === H) { info |= 0x80; if (M.gw !== W) info |= 0x40; } else { if (M.gw !== W) info |= 0x40; if (M.gh !== H) info |= 0x20; }
        w.u(20); w.u(info); if (lb) w.u(S.layer[i]); if (db) w.u(S.dt[i]); if (info & 0x40) w.u(W); if (info & 0x20) w.u(H); M.gw = W; M.gh = H; if (dx) w.s(dx); if (dy) w.s(dy); if (hasRep) writeRep(w, rep);
      } else if (k === PATH) {
        const hw = S.width[i] / 2; if (!Number.isInteger(hw) || hw < 0) problems.push(prob('oas.path-width', 'A path in ' + name + ' has width ' + S.width[i] + '; OASIS keeps half-widths in whole units, so it was rounded.', { severity: 'warning' }));
        const e = S.ext.get(i), pt = e?.pathtype || 0; if (pt === 1) problems.push(prob('oas.round-ends', 'A path with round ends in ' + name + ' was written with half-width square ends (OASIS has no round ends).', { severity: 'note' }));
        const hwi = Math.max(0, Math.round(hw)), se = pt === 4 ? e.bgnext | 0 : pt === 2 || pt === 1 ? hwi : 0, ee = pt === 4 ? e.endext | 0 : pt === 2 || pt === 1 ? hwi : 0;
        const extChanged = M.se !== se || M.ee !== ee, info = 0x20 | (extChanged ? 0x80 : 0) | (M.hw !== hwi ? 0x40 : 0) | (dx ? 0x10 : 0) | (dy ? 0x08 : 0) | (hasRep ? 0x04 : 0) | db | lb;
        w.u(22); w.u(info); if (lb) w.u(S.layer[i]); if (db) w.u(S.dt[i]); if (info & 0x40) w.u(hwi); M.hw = hwi;
        if (extChanged) { const sch = (v) => (v === 0 ? 1 : v === hwi ? 2 : 3); const ss = sch(se), es = sch(ee); w.u((ss << 2) | es); if (ss === 3) w.s(se); if (es === 3) w.s(ee); M.se = se; M.ee = ee; }
        writePointList(w, xy, a, b, x, y, false); if (dx) w.s(dx); if (dy) w.s(dy); if (hasRep) writeRep(w, rep);
      } else {
        if (k === BOX) problems.push(prob('oas.box', 'A GDSII BOX in ' + name + ' was written as a polygon.', { severity: 'note' }));
        w.u(21); w.u(0x20 | (dx ? 0x10 : 0) | (dy ? 0x08 : 0) | (hasRep ? 0x04 : 0) | db | lb); if (lb) w.u(S.layer[i]); if (db) w.u(S.dt[i]);
        writePointList(w, xy, a, b, x, y, true); if (dx) w.s(dx); if (dy) w.s(dy); if (hasRep) writeRep(w, rep);
      }
      props(w, S.props.get(i));
    }
    for (const r of c.refs) {
      const num = cellNum.get(r.cell); if (num === undefined) { problems.push(prob('oas.missing-cell', name + ' places ' + r.cell + ', which is not in the library; left out.')); continue; }
      const rx = Math.round(r.x), ry = Math.round(r.y), dx = rx - M.px, dy = ry - M.py; M.px = rx; M.py = ry;
      const rep = r.rep && repOk(r.rep) && intRep(r.rep) ? r.rep : null, newCellRef = M.pcell !== num;
      const ang = ((r.angle || 0) % 360 + 360) % 360, simple = (r.mag ?? 1) === 1 && ang % 90 === 0;
      if (simple) { w.u(17); w.u((newCellRef ? 0xc0 : 0) | (dx ? 0x20 : 0) | (dy ? 0x10 : 0) | (rep ? 0x08 : 0) | ((ang / 90) << 1) | (r.flip ? 1 : 0)); if (newCellRef) w.u(num); }
      else { w.u(18); w.u((newCellRef ? 0xc0 : 0) | (dx ? 0x20 : 0) | (dy ? 0x10 : 0) | (rep ? 0x08 : 0) | ((r.mag ?? 1) !== 1 ? 0x04 : 0) | (ang ? 0x02 : 0) | (r.flip ? 1 : 0)); if (newCellRef) w.u(num); if ((r.mag ?? 1) !== 1) w.real(r.mag); if (ang) w.real(r.angle); }
      M.pcell = num; if (dx) w.s(dx); if (dy) w.s(dy); if (rep) writeRep(w, rep);
      props(w, r.props);
    }
    for (const t of c.texts) {
      const tx = Math.round(t.x), ty = Math.round(t.y), dx = tx - M.tx, dy = ty - M.ty; M.tx = tx; M.ty = ty;
      const rep = t.rep && repOk(t.rep) && intRep(t.rep) ? t.rep : null, nt = M.text !== t.text, nl = M.tl !== t.layer, ntt = M.tt !== (t.texttype || 0);
      w.u(19); w.u((nt ? 0x40 : 0) | (dx ? 0x10 : 0) | (dy ? 0x08 : 0) | (rep ? 0x04 : 0) | (ntt ? 0x02 : 0) | (nl ? 0x01 : 0)); if (nt) w.str(t.text); if (nl) w.u(t.layer); if (ntt) w.u(t.texttype || 0);
      M.text = t.text; M.tl = t.layer; M.tt = t.texttype || 0; if (dx) w.s(dx); if (dy) w.s(dy); if (rep) writeRep(w, rep);
      props(w, t.props);
    }
    if (compress) { const raw = w.done(); if (raw.length > 64) { const z = deflateRaw(raw); o.u(34); o.u(0); o.u(raw.length); o.u(z.length); o.raw(z); } else o.raw(raw); }
  }
  // END: 256 bytes in all; offset-flag was 0, so no tables here
  const endAt = o.p; o.u(2); const scheme = validate === 'crc32' ? 1 : validate === 'checksum32' ? 2 : 0, padLen = scheme ? 248 : 252; /* id 1 + length 2 + pad + scheme 1 (+ signature 4) */ o.u(padLen); o.room(padLen); for (let k = 0; k < padLen; k++) o.b[o.p++] = 0; o.u(scheme);
  if (scheme) { const sig = scheme === 1 ? crc32(o.b, o.p) : checksum32(o.b, o.p); o.room(4); o.b[o.p++] = sig & 255; o.b[o.p++] = (sig >>> 8) & 255; o.b[o.p++] = (sig >>> 16) & 255; o.b[o.p++] = (sig >>> 24) & 255; }
  if (o.p - endAt !== 256) problems.push(prob('oas.end-size', 'The END record is ' + (o.p - endAt) + ' bytes, not 256.', { severity: 'warning' }));
  return o.done();
}
