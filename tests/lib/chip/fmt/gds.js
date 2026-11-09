/* SPDX-License-Identifier: Apache-2.0 */
/**
 * gds.js — GDSII stream reader and writer for the chip layout model (layout.js). Same format notes as lib/pcb/gds.js (0.8 XE.11), which this
 * extends for chips: properties (PROPATTR / PROPVALUE), path extensions (BGNEXTN / ENDEXTN, pathtype 4), text presentation and transforms,
 * column-wise storage so a million shapes read quickly, and AREFs kept as repetitions instead of being expanded. lib/pcb/gds.js is unchanged;
 * toPcbLib() in layout.js hands this model to its flatten / layoutDrc, and the tests check that both readers agree on the same files.
 *
 *   readGds(bytes, { maxBytes }) → { lib, problems }
 *   writeGds(lib, { problems }) → Uint8Array
 */
import { prob } from './problem.js';
import { newLib, newCell, POLY, PATH, BOX } from './layout.js';

const R = { HEADER: 0x00, BGNLIB: 0x01, LIBNAME: 0x02, UNITS: 0x03, ENDLIB: 0x04, BGNSTR: 0x05, STRNAME: 0x06, ENDSTR: 0x07, BOUNDARY: 0x08, PATH: 0x09, SREF: 0x0a, AREF: 0x0b, TEXT: 0x0c, LAYER: 0x0d, DATATYPE: 0x0e, WIDTH: 0x0f, XY: 0x10, ENDEL: 0x11, SNAME: 0x12, COLROW: 0x13, NODE: 0x15, TEXTTYPE: 0x16, PRESENTATION: 0x17, STRING: 0x19, STRANS: 0x1a, MAG: 0x1b, ANGLE: 0x1c, PROPATTR: 0x2b, PROPVALUE: 0x2c, BOX: 0x2d, BOXTYPE: 0x2e, PLEX: 0x2f, BGNEXTN: 0x30, ENDEXTN: 0x31, ELFLAGS: 0x26, PATHTYPE: 0x21 };
export const GDS_RECORDS = R;

export function real8(b, o) { const s = b[o] & 0x80 ? -1 : 1, e = (b[o] & 0x7f) - 64; let m = 0; for (let i = 1; i < 8; i++) m = m * 256 + b[o + i]; return s * (m / 72057594037927936) * Math.pow(16, e); }
export function toReal8(v) {
  const out = new Uint8Array(8); if (v === 0) return out; let s = 0; if (v < 0) { s = 0x80; v = -v; } let e = 0; while (v >= 1) { v /= 16; e++; } while (v < 1 / 16) { v *= 16; e--; }
  out[0] = s | (e + 64); let m = Math.round(v * 72057594037927936); if (m >= 72057594037927936) { m = Math.round(m / 16); out[0]++; } for (let i = 7; i >= 1; i--) { out[i] = m % 256; m = Math.floor(m / 256); } return out;
}

export function readGds(bytes, { maxBytes = 1024 * 1024 * 1024 } = {}) {
  const problems = [], lib = newLib('');
  if (bytes.length > maxBytes) return { lib, problems: [prob('gds.too-big', 'The file is larger than the ' + maxBytes + ' byte limit.')] };
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength), n = bytes.length;
  let o = 0, cell = null, ended = false, skipped = 0, nodes = 0;
  // current element
  let et = -1, layer = 0, dt = 0, width = 0, pathtype = 0, bgn = 0, endx = 0, strans = 0, mag = 1, angle = 0, sname = '', cols = 1, rows = 1, text = '', pres = 0, obj = null, shape = -1, propAttr = 0, xy = null;
  const str = (a, l) => { let s = ''; for (let i = 0; i < l; i++) { const c = bytes[a + i]; if (c) s += String.fromCharCode(c); } return s; };
  const startEl = (t) => { et = t; layer = 0; dt = 0; width = 0; pathtype = 0; bgn = 0; endx = 0; strans = 0; mag = 1; angle = 0; sname = ''; cols = 1; rows = 1; text = ''; pres = 0; obj = null; shape = -1; xy = null; };
  while (o + 4 <= n && !ended) {
    const len = dv.getUint16(o), type = bytes[o + 2];
    if (len < 4 || o + len > n) { problems.push(prob('gds.truncated', 'A record at byte ' + o + ' has length ' + len + ' and runs past the end of the file.')); break; }
    const a = o + 4, l = len - 4; o += len;
    switch (type) {
      case R.HEADER: lib.version = dv.getInt16(a); break;
      case R.BGNLIB: { const d = []; for (let i = 0; i < 12 && 2 * i < l; i++) d.push(dv.getInt16(a + 2 * i)); lib.dates = d; break; }
      case R.LIBNAME: lib.name = str(a, l); break;
      case R.UNITS: lib.userPerDb = real8(bytes, a); lib.metersPerDb = real8(bytes, a + 8); break;
      case R.BGNSTR: cell = { name: null }; break;
      case R.STRNAME: { const nm = str(a, l); if (lib.cells[nm]) problems.push(prob('gds.duplicate-cell', 'Cell ' + nm + ' appears twice; the later one wins.', { severity: 'warning' })); cell = newCell(lib, nm); break; }
      case R.ENDSTR: cell = null; break;
      case R.BOUNDARY: case R.PATH: case R.SREF: case R.AREF: case R.TEXT: case R.BOX: startEl(type); break;
      case R.NODE: startEl(type); nodes++; break;
      case R.LAYER: layer = dv.getInt16(a); break;
      case R.DATATYPE: case R.TEXTTYPE: case R.BOXTYPE: dt = dv.getInt16(a); break;
      case R.WIDTH: width = dv.getInt32(a); break;
      case R.PATHTYPE: pathtype = dv.getInt16(a); break;
      case R.BGNEXTN: bgn = dv.getInt32(a); break;
      case R.ENDEXTN: endx = dv.getInt32(a); break;
      case R.SNAME: sname = str(a, l); break;
      case R.STRANS: strans = dv.getUint16(a); break;
      case R.MAG: mag = real8(bytes, a); break;
      case R.ANGLE: angle = real8(bytes, a); break;
      case R.COLROW: cols = dv.getInt16(a); rows = dv.getInt16(a + 2); break;
      case R.PRESENTATION: pres = dv.getUint16(a); break;
      case R.STRING: text = str(a, l); break;
      case R.XY: {
        if (!cell) { skipped++; break; }
        const np = l >> 3;
        if (et === R.BOUNDARY || et === R.BOX) {
          let m = np; if (m > 1 && dv.getInt32(a) === dv.getInt32(a + 8 * (m - 1)) && dv.getInt32(a + 4) === dv.getInt32(a + 8 * (m - 1) + 4)) m--;
          if (m < 3) problems.push(prob('gds.boundary', 'A ' + (et === R.BOX ? 'box' : 'boundary') + ' in ' + cell.name + ' has fewer than 3 corners.', { severity: 'warning' }));
          const S = cell.shapes; shape = S.begin(et === R.BOX ? BOX : POLY, layer & 0xffff, dt & 0xffff); S.grow(0, S.nxy + 2 * m); for (let i = 0; i < m; i++) { S.xy[S.nxy++] = dv.getInt32(a + 8 * i); S.xy[S.nxy++] = dv.getInt32(a + 8 * i + 4); } S.end();
        } else if (et === R.PATH) {
          const S = cell.shapes; shape = S.begin(PATH, layer & 0xffff, dt & 0xffff, width); S.grow(0, S.nxy + 2 * np); for (let i = 0; i < np; i++) { S.xy[S.nxy++] = dv.getInt32(a + 8 * i); S.xy[S.nxy++] = dv.getInt32(a + 8 * i + 4); } S.end();
          if (pathtype || bgn || endx) { const e = { pathtype }; if (pathtype === 4) { e.bgnext = bgn; e.endext = endx; } S.ext.set(shape, e); }
        } else xy = Array.from({ length: np * 2 }, (_, i) => dv.getInt32(a + 4 * i));
        break;
      }
      case R.PROPATTR: propAttr = dv.getInt16(a); break;
      case R.PROPVALUE: {
        const pv = [propAttr, str(a, l)];
        if (shape >= 0) { const P = cell.shapes.props; (P.get(shape) || P.set(shape, []).get(shape)).push(pv); } else (obj ||= {})._props = [...(obj?._props || []), pv];
        break;
      }
      case R.ENDEL: {
        if (!cell) break;
        const tr = () => { const t = {}; if (strans & 0x8000) t.flip = true; if (mag !== 1) t.mag = mag; if (angle) t.angle = angle; if (strans & 0x0006) t.abs = strans & 0x0006; return t; };
        const props = obj?._props;
        if ((et === R.SREF || et === R.AREF) && xy) {
          const r = { cell: sname, x: xy[0], y: xy[1], flip: !!(strans & 0x8000), angle, mag }; if (strans & 0x0006) r.abs = strans & 0x0006;
          if (et === R.AREF) { if (cols < 1 || rows < 1 || xy.length < 6) problems.push(prob('gds.aref', 'An array in ' + cell.name + ' has ' + cols + ' × ' + rows + ' places.', { severity: 'warning' })); r.rep = { kind: 'lattice', nx: Math.max(1, cols), ny: Math.max(1, rows), ax: [(xy[2] - xy[0]) / Math.max(1, cols), (xy[3] - xy[1]) / Math.max(1, cols)], ay: [(xy[4] - xy[0]) / Math.max(1, rows), (xy[5] - xy[1]) / Math.max(1, rows)] }; }
          if (props) r.props = props; cell.refs.push(r);
        } else if (et === R.TEXT && xy) { const t = { text, layer, texttype: dt, x: xy[0], y: xy[1], ...tr() }; if (pres) t.pres = pres; if (width) t.width = width; if (pathtype) t.pathtype = pathtype; if (props) t.props = props; cell.texts.push(t); }
        et = -1; shape = -1; obj = null; break;
      }
      case R.ENDLIB: ended = true; break;
      default: skipped++;
    }
  }
  if (!ended) problems.push(prob('gds.no-endlib', 'The stream has no ENDLIB record (cut short?).', { severity: 'warning' }));
  if (skipped) problems.push(prob('gds.skipped', skipped + ' record(s) of kinds this reader does not use were skipped (fonts, reference libraries, plex, element flags).', { severity: 'note' }));
  if (nodes) problems.push(prob('gds.nodes', nodes + ' NODE element(s) were skipped (electrical nodes have no shape).', { severity: 'note' }));
  for (const c of Object.values(lib.cells)) { c.shapes.trim(); for (const r of c.refs) if (!lib.cells[r.cell]) problems.push(prob('gds.missing-cell', c.name + ' places cell ' + r.cell + ', which is not in the file.', { about: [{ kind: 'cell', id: c.name }] })); }
  return { lib, problems };
}

/** Write a layout as a GDSII stream (version 600). Repetitions on shapes are written out one by one; placement lattices become AREFs. */
export function writeGds(lib, { problems = [] } = {}) {
  let buf = new Uint8Array(1 << 16), pos = 0;
  const room = (k) => { if (pos + k > buf.length) { const b = new Uint8Array(Math.max(buf.length * 2, pos + k)); b.set(buf.subarray(0, pos)); buf = b; } };
  const hdr = (len, type, dtp) => { room(len); buf[pos] = len >> 8; buf[pos + 1] = len & 255; buf[pos + 2] = type; buf[pos + 3] = dtp; pos += 4; };
  const i2 = (v) => { buf[pos++] = (v >> 8) & 255; buf[pos++] = v & 255; };
  const i4 = (v) => { buf[pos++] = (v >>> 24) & 255; buf[pos++] = (v >>> 16) & 255; buf[pos++] = (v >>> 8) & 255; buf[pos++] = v & 255; };
  const rec0 = (t) => hdr(4, t, 0);
  const rec2 = (t, ...v) => { hdr(4 + 2 * v.length, t, 2); for (const x of v) i2(x); };
  const rec4 = (t, ...v) => { hdr(4 + 4 * v.length, t, 3); for (const x of v) i4(x); };
  const recS = (t, s) => { s = String(s); const l = s.length + (s.length & 1); hdr(4 + l, t, 6); for (let i = 0; i < l; i++) buf[pos++] = i < s.length ? s.charCodeAt(i) & 255 : 0; };
  const recR = (t, ...v) => { hdr(4 + 8 * v.length, t, 5); for (const x of v) { buf.set(toReal8(x), pos); pos += 8; } };
  const rnd = (v) => { const r = Math.round(v); if (r !== v) problems.push(prob('gds.round', 'A coordinate ' + v + ' was rounded to ' + r + ' database units.', { severity: 'warning' })); return r | 0; };
  const date = lib.dates && lib.dates.length === 12 ? lib.dates : [2026, 11, 3, 0, 0, 0, 2026, 11, 3, 0, 0, 0];
  rec2(R.HEADER, 600); rec2(R.BGNLIB, ...date); recS(R.LIBNAME, lib.name || 'lib'); recR(R.UNITS, lib.userPerDb ?? 0.001, lib.metersPerDb ?? 1e-9);
  const props = (ps) => { for (const [k, v] of ps || []) { rec2(R.PROPATTR, k); recS(R.PROPVALUE, v); } };
  const trans = (t) => { const s = (t.flip ? 0x8000 : 0) | (t.abs || 0); if (s || (t.mag ?? 1) !== 1 || t.angle) { rec2(R.STRANS, s); if ((t.mag ?? 1) !== 1) recR(R.MAG, t.mag); if (t.angle) recR(R.ANGLE, t.angle); } };
  for (const name of lib.order) {
    const c = lib.cells[name]; rec2(R.BGNSTR, ...date); recS(R.STRNAME, name);
    const S = c.shapes;
    for (let i = 0; i < S.n; i++) {
      const k = S.kind[i], a = S.off[i], b = S.off[i + 1], np = (b - a) >> 1, closed = k !== PATH, total = np + (closed ? 1 : 0);
      if (4 + total * 8 > 65535) { problems.push(prob('gds.too-many-points', 'A shape in ' + name + ' has ' + np + ' points; GDSII allows 8191 per record, so it was left out.', { about: [{ kind: 'cell', id: name }] })); continue; }
      const rep = S.rep.get(i), offs = rep ? [...repIter(rep)] : [[0, 0]];
      for (const [dx, dy] of offs) {
        rec0(k === PATH ? R.PATH : k === BOX ? R.BOX : R.BOUNDARY); rec2(R.LAYER, S.layer[i]); rec2(k === BOX ? R.BOXTYPE : R.DATATYPE, S.dt[i]);
        if (k === PATH) { const e = S.ext.get(i); if (e?.pathtype) rec2(R.PATHTYPE, e.pathtype); rec4(R.WIDTH, S.width[i]); if (e?.pathtype === 4) { rec4(R.BGNEXTN, e.bgnext | 0); rec4(R.ENDEXTN, e.endext | 0); } }
        hdr(4 + total * 8, R.XY, 3); for (let p = a; p < b; p += 2) { i4(rnd(S.xy[p] + dx)); i4(rnd(S.xy[p + 1] + dy)); } if (closed) { i4(rnd(S.xy[a] + dx)); i4(rnd(S.xy[a + 1] + dy)); }
        props(S.props.get(i)); rec0(R.ENDEL);
      }
    }
    for (const r of c.refs) {
      const lat = r.rep && r.rep.kind === 'lattice' ? r.rep : null, list = r.rep && !lat ? [...repIter(r.rep)] : null;
      if (lat && (lat.nx > 32767 || lat.ny > 32767)) problems.push(prob('gds.aref-size', 'An array of ' + lat.nx + ' × ' + lat.ny + ' in ' + name + ' is larger than GDSII allows (32767).'));
      for (const [dx, dy] of list || [[0, 0]]) {
        rec0(lat ? R.AREF : R.SREF); recS(R.SNAME, r.cell); trans(r);
        if (lat) { rec2(R.COLROW, lat.nx, lat.ny); rec4(R.XY, rnd(r.x), rnd(r.y), rnd(r.x + lat.ax[0] * lat.nx), rnd(r.y + lat.ax[1] * lat.nx), rnd(r.x + lat.ay[0] * lat.ny), rnd(r.y + lat.ay[1] * lat.ny)); }
        else rec4(R.XY, rnd(r.x + dx), rnd(r.y + dy));
        props(r.props); rec0(R.ENDEL);
      }
    }
    for (const t of c.texts) for (const [dx, dy] of t.rep ? [...repIter(t.rep)] : [[0, 0]]) {
      rec0(R.TEXT); rec2(R.LAYER, t.layer); rec2(R.TEXTTYPE, t.texttype || 0); if (t.pres) rec2(R.PRESENTATION, t.pres); if (t.pathtype) rec2(R.PATHTYPE, t.pathtype); if (t.width) rec4(R.WIDTH, t.width); trans(t);
      rec4(R.XY, rnd(t.x + dx), rnd(t.y + dy)); recS(R.STRING, t.text); props(t.props); rec0(R.ENDEL);
    }
    rec0(R.ENDSTR);
  }
  rec0(R.ENDLIB);
  return buf.slice(0, pos);
}
function* repIter(r) { if (r.kind === 'lattice') { for (let j = 0; j < r.ny; j++) for (let i = 0; i < r.nx; i++) yield [i * r.ax[0] + j * r.ay[0], i * r.ax[1] + j * r.ay[1]]; } else for (let k = 0; k < r.d.length; k += 2) yield [r.d[k], r.d[k + 1]]; }
