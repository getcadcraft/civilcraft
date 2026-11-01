/* SPDX-License-Identifier: Apache-2.0 */
/**
 * GDSII stream reader and writer, layer maps and basic layout DRC (0.8 XE.11). Format from the published GDSII Stream Format description
 * (record header = length, type, data type; 8-byte excess-64 reals; BOUNDARY, PATH, SREF, AREF, TEXT, BOX). Units are the file's own
 * (database unit in metres is read from UNITS); coordinates are returned in user units (usually micrometres). Hierarchies are flattened on request.
 */
import { polyArea, bbox, pointInPoly, polyEdges, segSegDist } from './geom.js';
import { problem } from './board.js';

const REC = { HEADER: 0x00, BGNLIB: 0x01, LIBNAME: 0x02, UNITS: 0x03, ENDLIB: 0x04, BGNSTR: 0x05, STRNAME: 0x06, ENDSTR: 0x07, BOUNDARY: 0x08, PATH: 0x09, SREF: 0x0a, AREF: 0x0b, TEXT: 0x0c, LAYER: 0x0d, DATATYPE: 0x0e, WIDTH: 0x0f, XY: 0x10, ENDEL: 0x11, SNAME: 0x12, COLROW: 0x13, NODE: 0x15, TEXTTYPE: 0x16, PRESENTATION: 0x17, STRING: 0x19, STRANS: 0x1a, MAG: 0x1b, ANGLE: 0x1c, PATHTYPE: 0x21, BOX: 0x2d, BOXTYPE: 0x2e };
const NAME = Object.fromEntries(Object.entries(REC).map(([k, v]) => [v, k]));
export const GDS = REC;

export function real8(bytes, o) { // GDSII 8-byte real: sign, 7-bit excess-64 exponent (base 16), 56-bit mantissa
  const s = bytes[o] & 0x80 ? -1 : 1, e = (bytes[o] & 0x7f) - 64; let m = 0; for (let i = 1; i < 8; i++) m = m * 256 + bytes[o + i]; return s * (m / 72057594037927936) * Math.pow(16, e);
}
export function toReal8(v) {
  const out = new Uint8Array(8); if (v === 0) return out; let s = 0; if (v < 0) { s = 0x80; v = -v; } let e = 0; while (v >= 1) { v /= 16; e++; } while (v < 1 / 16) { v *= 16; e--; }
  out[0] = s | (e + 64); let m = Math.round(v * 72057594037927936); if (m >= 72057594037927936) { m = Math.round(m / 16); out[0]++; } for (let i = 7; i >= 1; i--) { out[i] = m % 256; m = Math.floor(m / 256); } return out;
}

/** Parse a GDSII stream. Returns {lib: {name, userPerDb, metersPerDb, cells: {name: {elements}}, order}, problems}. Unknown records are skipped and counted. */
export function readGds(bytes, { maxBytes = 512 * 1024 * 1024 } = {}) {
  const problems = [], lib = { name: '', userPerDb: 0.001, metersPerDb: 1e-9, cells: {}, order: [], version: 0 };
  if (bytes.length > maxBytes) return { lib, problems: [problem('gds.read.too-big', 'The file is larger than the ' + maxBytes + ' byte limit.')] };
  const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength); let o = 0, cell = null, el = null, ended = false, skipped = 0, bad = false;
  const ints = (a, w) => { const r = []; for (let i = 0; i + w <= a.length; i += w) r.push(w === 2 ? dv.getInt16(a.start + i) : dv.getInt32(a.start + i)); return r; };
  const str = (a) => { let s = ''; for (let i = 0; i < a.len; i++) { const c = bytes[a.start + i]; if (c) s += String.fromCharCode(c); } return s; };
  while (o + 4 <= bytes.length && !ended) {
    const len = dv.getUint16(o), type = bytes[o + 2];
    if (len < 4 || o + len > bytes.length) { problems.push(problem('gds.read.truncated', 'A record at byte ' + o + ' has length ' + len + ' and runs past the end of the file.')); bad = true; break; }
    const a = { start: o + 4, len: len - 4 }; o += len;
    const d2 = () => ints({ start: a.start, length: a.len }, 2), d4 = () => ints({ start: a.start, length: a.len }, 4);
    switch (type) {
      case REC.HEADER: lib.version = d2()[0]; break;
      case REC.BGNLIB: break; case REC.LIBNAME: lib.name = str(a); break;
      case REC.UNITS: lib.userPerDb = real8(bytes, a.start); lib.metersPerDb = real8(bytes, a.start + 8); break;
      case REC.BGNSTR: cell = { name: '', elements: [] }; break;
      case REC.STRNAME: if (cell) { cell.name = str(a); if (lib.cells[cell.name]) problems.push(problem('gds.read.duplicate-cell', 'Cell ' + cell.name + ' appears twice; the later one wins.', { severity: 'warning' })); lib.cells[cell.name] = cell; lib.order.push(cell.name); } break;
      case REC.ENDSTR: cell = null; break;
      case REC.BOUNDARY: case REC.PATH: case REC.SREF: case REC.AREF: case REC.TEXT: case REC.BOX: case REC.NODE: el = { type: NAME[type].toLowerCase(), layer: 0, datatype: 0, pts: [], width: 0, pathtype: 0, strans: 0, mag: 1, angle: 0 }; break;
      case REC.LAYER: if (el) el.layer = d2()[0]; break; case REC.DATATYPE: case REC.TEXTTYPE: case REC.BOXTYPE: if (el) el.datatype = d2()[0]; break;
      case REC.WIDTH: if (el) el.width = d4()[0]; break; case REC.PATHTYPE: if (el) el.pathtype = d2()[0]; break;
      case REC.XY: if (el) { const v = d4(); for (let i = 0; i + 1 < v.length; i += 2) el.pts.push([v[i], v[i + 1]]); } break;
      case REC.SNAME: if (el) el.ref = str(a); break; case REC.STRANS: if (el) el.strans = dv.getUint16(a.start); break;
      case REC.MAG: if (el) el.mag = real8(bytes, a.start); break; case REC.ANGLE: if (el) el.angle = real8(bytes, a.start); break;
      case REC.COLROW: if (el) { const v = d2(); el.cols = v[0]; el.rows = v[1]; } break; case REC.STRING: if (el) el.text = str(a); break;
      case REC.ENDEL: if (el && cell) { cell.elements.push(el); } el = null; break;
      case REC.ENDLIB: ended = true; break;
      default: skipped++;
    }
  }
  if (!ended && !bad) problems.push(problem('gds.read.no-endlib', 'The stream has no ENDLIB record.', { severity: 'warning' }));
  if (skipped) problems.push(problem('gds.read.skipped', skipped + ' record(s) of kinds this reader does not use were skipped (properties, plex, node data).', { severity: 'info' }));
  for (const c of Object.values(lib.cells)) for (const e of c.elements) {
    if ((e.type === 'boundary') && (e.pts.length < 4)) problems.push(problem('gds.read.boundary', 'A boundary in ' + c.name + ' has fewer than 4 points.', { severity: 'warning' }));
    if ((e.type === 'sref' || e.type === 'aref') && !lib.cells[e.ref]) problems.push(problem('gds.read.missing-cell', c.name + ' places cell ' + e.ref + ', which is not in the file.'));
  }
  return { lib, problems };
}

/** Write a library built in memory: lib = {name, userPerDb, metersPerDb, cells: {name: {elements}}, order?}. Elements as returned by readGds (integer database coordinates). */
export function writeGds(lib) {
  const parts = []; const rec = (type, dt, data) => { const n = data ? data.length : 0, b = new Uint8Array(4 + n); b[0] = (4 + n) >> 8; b[1] = (4 + n) & 255; b[2] = type; b[3] = dt; if (n) b.set(data, 4); parts.push(b); };
  const i2 = (...v) => { const b = new Uint8Array(v.length * 2), dv = new DataView(b.buffer); v.forEach((x, i) => dv.setInt16(i * 2, x)); return b; }, i4 = (v) => { const b = new Uint8Array(v.length * 4), dv = new DataView(b.buffer); v.forEach((x, i) => dv.setInt32(i * 4, x)); return b; };
  const s = (t) => { const b = new Uint8Array(t.length % 2 ? t.length + 1 : t.length); for (let i = 0; i < t.length; i++) b[i] = t.charCodeAt(i); return b; }, r8 = (v) => toReal8(v);
  const date = i2(2026, 10, 29, 0, 0, 0, 2026, 10, 29, 0, 0, 0);
  rec(REC.HEADER, 2, i2(600)); rec(REC.BGNLIB, 2, date); rec(REC.LIBNAME, 6, s(lib.name || 'lib')); const u = new Uint8Array(16); u.set(r8(lib.userPerDb ?? 0.001)); u.set(r8(lib.metersPerDb ?? 1e-9), 8); rec(REC.UNITS, 5, u);
  for (const name of lib.order || Object.keys(lib.cells)) {
    rec(REC.BGNSTR, 2, date); rec(REC.STRNAME, 6, s(name));
    for (const e of lib.cells[name].elements) {
      const T = { boundary: REC.BOUNDARY, path: REC.PATH, sref: REC.SREF, aref: REC.AREF, text: REC.TEXT, box: REC.BOX }[e.type]; rec(T, 0);
      if (e.type === 'sref' || e.type === 'aref') rec(REC.SNAME, 6, s(e.ref)); else { rec(REC.LAYER, 2, i2(e.layer)); rec(e.type === 'text' ? REC.TEXTTYPE : e.type === 'box' ? REC.BOXTYPE : REC.DATATYPE, 2, i2(e.datatype || 0)); }
      if (e.type === 'path') { if (e.pathtype) rec(REC.PATHTYPE, 2, i2(e.pathtype)); rec(REC.WIDTH, 3, i4([e.width])); }
      if (e.strans || e.mag !== 1 || e.angle) { rec(REC.STRANS, 1, i2(e.strans | 0)); if (e.mag !== 1) rec(REC.MAG, 5, r8(e.mag)); if (e.angle) rec(REC.ANGLE, 5, r8(e.angle)); }
      if (e.type === 'aref') rec(REC.COLROW, 2, i2(e.cols, e.rows));
      rec(REC.XY, 3, i4(e.pts.flat())); if (e.type === 'text') rec(REC.STRING, 6, s(e.text || ''));
      rec(REC.ENDEL, 0);
    }
    rec(REC.ENDSTR, 0);
  }
  rec(REC.ENDLIB, 0);
  let total = 0; for (const p of parts) total += p.length; const out = new Uint8Array(total); let o = 0; for (const p of parts) { out.set(p, o); o += p.length; } return out;
}

const xf = (pts, e, ox, oy) => { // STRANS bit 0x8000 reflects about the x axis, then magnification, then rotation, then translation
  const c = Math.cos(e.angle * Math.PI / 180), s = Math.sin(e.angle * Math.PI / 180), refl = e.strans & 0x8000 ? -1 : 1;
  return pts.map(([x, y]) => { const px = x * e.mag, py = y * e.mag * refl; return [px * c - py * s + ox, px * s + py * c + oy]; });
};

/**
 * Flatten one cell to polygons: returns {shapes: [{layer, datatype, poly}], texts: [{layer, text, at}], problems}. Paths become polygons (flush ends for
 * pathtype 0, extended half-width for 2, round ends approximated by extension for 1). Reference loops and depth > 64 are named and cut.
 */
export function flatten(lib, cellName, { maxShapes = 5e6 } = {}) {
  const shapes = [], texts = [], problems = [];
  const pathPoly = (e) => {
    const hw = Math.abs(e.width) / 2, pts = e.pts; if (pts.length < 2 || hw === 0) return null; const left = [], right = [];
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i]; let dx, dy; const ext = e.pathtype === 2 || e.pathtype === 1;
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; dx = b[0] - a[0]; dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      let px = p[0], py = p[1]; if (ext && (i === 0 || i === pts.length - 1)) { const sgn = i === 0 ? -1 : 1; px += sgn * dx * hw; py += sgn * dy * hw; }
      let nx = -dy, ny = dx; if (i > 0 && i < pts.length - 1) { const d1 = [pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]], d2 = [pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]], l1 = Math.hypot(...d1) || 1, l2 = Math.hypot(...d2) || 1, n1 = [-d1[1] / l1, d1[0] / l1], n2 = [-d2[1] / l2, d2[0] / l2], sx = n1[0] + n2[0], sy = n1[1] + n2[1], sl = Math.hypot(sx, sy) || 1, cos = (n1[0] * sx + n1[1] * sy) / sl; nx = sx / sl / Math.max(0.2, cos); ny = sy / sl / Math.max(0.2, cos); }
      left.push([px + nx * hw, py + ny * hw]); right.push([px - nx * hw, py - ny * hw]);
    }
    return [...left, ...right.reverse()];
  };
  const walk = (name, ox, oy, e0, depth, stack) => {
    const cell = lib.cells[name]; if (!cell) return;
    if (depth > 64) { problems.push(problem('gds.flatten.depth', 'Hierarchy deeper than 64 levels at ' + name + '; cut.')); return; }
    for (const e of cell.elements) {
      if (shapes.length > maxShapes) { problems.push(problem('gds.flatten.too-many', 'More than ' + maxShapes + ' shapes; flattening stopped.')); return; }
      const T = (pts) => (e0 ? xf(pts, e0, 0, 0).map((p) => [p[0] + ox, p[1] + oy]) : pts.map((p) => [p[0] + ox, p[1] + oy]));
      if (e.type === 'boundary' || e.type === 'box') { const p = e.type === 'box' ? e.pts.slice(0, 4) : e.pts.slice(0, -1); if (p.length >= 3) shapes.push({ layer: e.layer, datatype: e.datatype, poly: T(p) }); }
      else if (e.type === 'path') { const p = pathPoly(e); if (p) shapes.push({ layer: e.layer, datatype: e.datatype, poly: T(p) }); }
      else if (e.type === 'text') texts.push({ layer: e.layer, text: e.text, at: T([e.pts[0]])[0] });
      else if (e.type === 'sref' || e.type === 'aref') {
        if (stack.includes(e.ref)) { problems.push(problem('gds.flatten.loop', 'Cell ' + e.ref + ' contains itself through ' + stack.join(' > ') + '; the loop was cut.')); continue; }
        const place = (px, py) => { const t = e0 ? xf([[px, py]], e0, 0, 0)[0] : [px, py]; walk(e.ref, t[0] + ox, t[1] + oy, composed(e0, e), depth + 1, [...stack, e.ref]); };
        if (e.type === 'sref') place(e.pts[0][0], e.pts[0][1]);
        else { const [o, c, r] = e.pts, cs = [(c[0] - o[0]) / e.cols, (c[1] - o[1]) / e.cols], rs = [(r[0] - o[0]) / e.rows, (r[1] - o[1]) / e.rows]; for (let i = 0; i < e.cols; i++) for (let j = 0; j < e.rows; j++) place(o[0] + cs[0] * i + rs[0] * j, o[1] + cs[1] * i + rs[1] * j); }
      }
    }
  };
  // compose a child's transform with its parent's (parent applied after child): reflection toggles, mags multiply, angles add (with the parent's reflection flipping the child's)
  const composed = (parent, child) => { if (!parent) return { strans: child.strans, mag: child.mag, angle: child.angle }; const pr = parent.strans & 0x8000 ? -1 : 1, cr = child.strans & 0x8000 ? 1 : 0; return { strans: (pr === -1) !== !!cr ? 0x8000 : 0, mag: parent.mag * child.mag, angle: parent.angle + pr * child.angle }; };
  if (!lib.cells[cellName]) return { shapes, texts, problems: [problem('gds.flatten.no-cell', 'No cell named ' + cellName + '.')] };
  walk(cellName, 0, 0, null, 0, [cellName]);
  const k = lib.userPerDb; // database units → user units
  for (const s of shapes) s.poly = s.poly.map((p) => [p[0] * k, p[1] * k]); for (const t of texts) t.at = [t.at[0] * k, t.at[1] * k];
  return { shapes, texts, problems };
}

/** Layer map: {name: {layers: [[layer, datatype], …], color, purpose}}. layerName(map, l, d) finds a name. The shipped map below is a GENERIC EXAMPLE, not any foundry's. */
export const EXAMPLE_LAYER_MAP = { format: 'cc-layer-map', name: 'generic-example', note: 'Made-up numbers for demonstration; take the real map from your process documentation.', layers: [
  { name: 'NWELL', gds: [1, 0], color: '#6d8f3f', purpose: 'drawing' }, { name: 'ACTIVE', gds: [2, 0], color: '#3f8f5e', purpose: 'drawing' }, { name: 'POLY', gds: [3, 0], color: '#c0392b', purpose: 'drawing' },
  { name: 'CONTACT', gds: [4, 0], color: '#222222', purpose: 'drawing' }, { name: 'METAL1', gds: [5, 0], color: '#2e6fd1', purpose: 'drawing' }, { name: 'VIA1', gds: [6, 0], color: '#555555', purpose: 'drawing' }, { name: 'METAL2', gds: [7, 0], color: '#8e44ad', purpose: 'drawing' },
  { name: 'LABEL', gds: [5, 1], color: '#2e6fd1', purpose: 'label' }, { name: 'BOUNDARY', gds: [63, 0], color: '#999999', purpose: 'outline' }] };
export function layerName(map, layer, datatype) { const m = map.layers.find((x) => x.gds[0] === layer && x.gds[1] === datatype); return m ? m.name : 'L' + layer + '/' + datatype; }
/** Count shapes and area per named layer: [{name, layer, datatype, shapes, area}] (area in user units squared, polygons as drawn). Unmapped layers are listed too. */
export function layerSummary(shapes, map) {
  const t = new Map(); for (const s of shapes) { const k = s.layer + '/' + s.datatype; let r = t.get(k); if (!r) t.set(k, r = { name: layerName(map, s.layer, s.datatype), layer: s.layer, datatype: s.datatype, shapes: 0, area: 0, mapped: map.layers.some((x) => x.gds[0] === s.layer && x.gds[1] === s.datatype) }); r.shapes++; r.area += Math.abs(polyArea(s.poly)); }
  return [...t.values()].sort((a, b) => a.layer - b.layer || a.datatype - b.datatype);
}

/**
 * Basic layout DRC on flattened shapes, per layer: minWidth, minSpace, minArea (user units). rules: [{layer: 'NAME', minWidth?, minSpace?, minArea?}], map names layers.
 * Shapes are checked AS DRAWN (not merged): overlapping or touching shapes are treated as one for spacing (no violation) but each piece is width-checked on its own,
 * so a wide region built from narrow overlapping pieces reports width; merge them first. Width = two antiparallel edges of one polygon that face each other across its
 * inside, closer than minWidth. Notches inside one polygon are not spacing-checked.
 */
export function layoutDrc(shapes, map, rules) {
  const out = [];
  for (const r of rules) {
    const m = map.layers.find((x) => x.name === r.layer); if (!m) { out.push(problem('layout.rule-layer', 'Rule for ' + r.layer + ' names a layer the map does not have.')); continue; }
    const polys = shapes.filter((s) => s.layer === m.gds[0] && s.datatype === m.gds[1]).map((s) => s.poly), boxes = polys.map(bbox);
    polys.forEach((P, i) => {
      const a = Math.abs(polyArea(P));
      if (r.minArea && a < r.minArea - 1e-12) out.push(problem('layout.min-area', r.layer + ' shape at (' + P[0].map((v) => +v.toFixed(3)).join(', ') + ') has area ' + +a.toFixed(4) + '; the minimum is ' + r.minArea + '.', { rule: 'minArea', layer: r.layer, found: a, req: r.minArea, at: P[0] }));
      if (r.minWidth) { const w = narrowest(P, r.minWidth); if (w !== null) out.push(problem('layout.min-width', r.layer + ' shape at (' + P[0].map((v) => +v.toFixed(3)).join(', ') + ') is ' + +w.toFixed(4) + ' wide; the minimum is ' + r.minWidth + '.', { rule: 'minWidth', layer: r.layer, found: +w.toFixed(4), req: r.minWidth, at: P[0] })); }
    });
    if (r.minSpace) {
      const cell = Math.max(r.minSpace * 4, 1), grid = new Map(), seen = new Set();
      boxes.forEach((b, i) => { for (let x = Math.floor((b[0] - r.minSpace) / cell); x <= Math.floor((b[2] + r.minSpace) / cell); x++) for (let y = Math.floor((b[1] - r.minSpace) / cell); y <= Math.floor((b[3] + r.minSpace) / cell); y++) { const k = x + ',' + y; (grid.get(k) || grid.set(k, []).get(k)).push(i); } });
      for (const l of grid.values()) for (let a = 0; a < l.length; a++) for (let b = a + 1; b < l.length; b++) {
        const i = l[a], j = l[b], k = i + ':' + j; if (seen.has(k)) continue; seen.add(k);
        const A = boxes[i], B = boxes[j]; if (A[0] - B[2] > r.minSpace || B[0] - A[2] > r.minSpace || A[1] - B[3] > r.minSpace || B[1] - A[3] > r.minSpace) continue;
        const d = polyDist(polys[i], polys[j]); if (d > 0 && d < r.minSpace - 1e-12) out.push(problem('layout.min-space', r.layer + ' shapes are ' + +d.toFixed(4) + ' apart near (' + polys[i][0].map((v) => +v.toFixed(3)).join(', ') + '); the minimum is ' + r.minSpace + '.', { rule: 'minSpace', layer: r.layer, found: +d.toFixed(4), req: r.minSpace, at: polys[i][0] }));
      }
    }
  }
  return out;
}
function polyDist(P, Q) { if (pointInPoly(P[0], Q) || pointInPoly(Q[0], P)) return 0; let m = Infinity; for (const [a, b] of polyEdges(P)) for (const [c, d] of polyEdges(Q)) { const v = segSegDist(a, b, c, d); if (v < m) m = v; if (m === 0) return 0; } return m; }
function narrowest(P, minW) { // smallest facing-edge distance below minW, else null
  const E = polyEdges(P); let best = null; const eps = 1e-9;
  for (let i = 0; i < E.length; i++) for (let j = i + 1; j < E.length; j++) {
    const [a, b] = E[i], [c, d] = E[j], u = [b[0] - a[0], b[1] - a[1]], v = [d[0] - c[0], d[1] - c[1]], lu = Math.hypot(...u), lv = Math.hypot(...v); if (lu < eps || lv < eps) continue;
    const cr = (u[0] * v[1] - u[1] * v[0]) / (lu * lv), dt = (u[0] * v[0] + u[1] * v[1]) / (lu * lv); if (Math.abs(cr) > 1e-6 || dt > 0) continue; // antiparallel only
    const n = [-u[1] / lu, u[0] / lu], dist = Math.abs((c[0] - a[0]) * n[0] + (c[1] - a[1]) * n[1]); if (dist >= minW - 1e-12 || dist < eps) continue;
    // overlap of the projections along the edge direction
    const t = (p) => ((p[0] - a[0]) * u[0] + (p[1] - a[1]) * u[1]) / lu, lo = Math.max(0, Math.min(t(c), t(d))), hi = Math.min(lu, Math.max(t(c), t(d))); if (hi - lo <= eps) continue;
    const mid = (lo + hi) / 2, pa = [a[0] + u[0] / lu * mid, a[1] + u[1] / lu * mid], side = (c[0] - a[0]) * n[0] + (c[1] - a[1]) * n[1] > 0 ? 1 : -1, pm = [pa[0] + n[0] * side * dist / 2, pa[1] + n[1] * side * dist / 2];
    if (pointInPoly(pm, P)) best = best === null ? dist : Math.min(best, dist);
  }
  return best;
}
