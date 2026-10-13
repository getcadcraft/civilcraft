/* SPDX-License-Identifier: Apache-2.0 */
/**
 * geotiff-write.js — a surface out as a GeoTIFF elevation grid (docs/GIS-SPEC.md §3, builder B). No DOM, no library
 * (geotiff.js's writer has no tiles, compression or nodata tag). Written from the TIFF 6.0 and GeoTIFF 1.1 specifications.
 *
 *   NODATA = −3.4028235e38 (float32's lowest value; GDAL writes it as "-3.4028234663852886e+38")
 *   averageEdge(surface) → mean 2D triangle edge length (the default cell size, project units)
 *   await surfaceGrid(surface, { cell, toGrid, fromGrid, signal, progress, maxCells }) →
 *         { width, height, gt: [x0, cell, 0, y0, 0, −cell], values: Float32Array (row-major, north row first) }
 *     The grid is laid out in GRID coordinates (crs.js frame.toGrid: ground/local projects export grid coordinates):
 *     the box of the surface outline through toGrid, snapped to multiples of the cell; each cell's center goes back
 *     through fromGrid and takes surface.elevationAt there (planar inside its triangle); outside the TIN → NODATA.
 *   await writeDemTiff({ width, height, gt, values, epsg, citation, xyUnit, zUnit, description, tiled = true,
 *                        tile = 256, compress = 'deflate' | 'none' }) → Uint8Array
 *     classic little-endian TIFF, one Float32 band (SampleFormat 3), tiles (256 × 256) or strips (16 rows), DEFLATE
 *     (zlib via CompressionStream, TIFF compression 8) or none; ModelPixelScale + ModelTiepoint (pixel-is-area);
 *     GeoKeys GTModelType projected, GTRasterType area, ProjectedCSType = epsg, ProjLinearUnits, citation — only when
 *     epsg is given (no code → no system in the file: the dialog warns); GDAL_NODATA; GDAL_METADATA with the band's
 *     unit type and description; ImageDescription saying what the numbers are.
 */

import { t } from "./i18n.js";

export const NODATA = Math.fround(-3.4028235e38);
const NODATA_TEXT = '-3.4028234663852886e+38';
const UNIT_EPSG = { m: 9001, ft: 9002, ftUS: 9003 };
const UNIT_TYPE = { m: 'm', ft: 'ft', ftUS: 'US survey foot' };   // i18n-ignore: GDAL unit type written into the file

export function averageEdge(surface) {
  const e = surface.edges(), X = surface.X, Y = surface.Y;
  if (!e.length) return 0;
  let s = 0;
  for (let k = 0; k < e.length; k += 2) s += Math.hypot(X[e[k]] - X[e[k + 1]], Y[e[k]] - Y[e[k + 1]]);
  return s / (e.length / 2);
}

const aborted = (signal) => { if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' }); };
const tick = () => new Promise((r) => setTimeout(r, 0));

export async function surfaceGrid(surface, { cell, toGrid = (x, y) => [x, y], fromGrid = (x, y) => [x, y], signal = null, progress = null, maxCells = 25e6 } = {}) {
  if (!(cell > 0) || !Number.isFinite(cell)) throw new Error(t('gtw.cell.bad'));
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const loop of surface.outline()) for (const p of loop) {
    const [gx, gy] = toGrid(p.x, p.y);
    minX = Math.min(minX, gx); maxX = Math.max(maxX, gx); minY = Math.min(minY, gy); maxY = Math.max(maxY, gy);
  }
  if (!Number.isFinite(minX)) throw new Error(t('gtw.no_outline'));
  const x0 = Math.floor(minX / cell) * cell, y0 = Math.ceil(maxY / cell) * cell;
  const width = Math.max(1, Math.ceil((maxX - x0) / cell - 1e-9)), height = Math.max(1, Math.ceil((y0 - minY) / cell - 1e-9));
  if (width * height > maxCells) throw new Error(t('gtw.too_many', { w: width.toLocaleString('en-US'), h: height.toLocaleString('en-US'), cells: (width * height / 1e6).toFixed(1), max: String(maxCells / 1e6) }));
  const values = new Float32Array(width * height);
  for (let r = 0; r < height; r++) {
    const gy = y0 - (r + 0.5) * cell;
    for (let c = 0; c < width; c++) {
      const [x, y] = fromGrid(x0 + (c + 0.5) * cell, gy);
      const z = surface.elevationAt(x, y);
      values[r * width + c] = z === null ? NODATA : z;
    }
    if ((r & 63) === 63) { aborted(signal); if (progress) { progress(r / height); await tick(); } }
  }
  return { width, height, gt: [x0, cell, 0, y0, 0, -cell], values };
}

async function deflate(bytes) {
  const cs = new CompressionStream('deflate');
  const out = new Response(new Blob([bytes]).stream().pipeThrough(cs)).arrayBuffer();
  return new Uint8Array(await out);
}

export async function writeDemTiff({ width, height, gt, values, epsg = null, citation = '', xyUnit = 'm', zUnit = 'm', description = '', tiled = true, tile = 256, compress = 'deflate', signal = null, progress = null }) {
  if (!(Number.isInteger(width) && Number.isInteger(height) && width > 0 && height > 0) || values.length !== width * height) throw new Error(t('gtw.size_wrong'));
  if (gt[2] !== 0 || gt[4] !== 0) throw new Error(t('gtw.north_up'));
  // ---- image data, as blocks (tiles or strips), each little-endian float32
  const bw = tiled ? tile : width, bh = tiled ? tile : Math.min(height, 16);
  const across = Math.ceil(width / bw), down = Math.ceil(height / bh);
  const blocks = [];
  for (let by = 0; by < down; by++) {
    for (let bx = 0; bx < across; bx++) {
      const rows = tiled ? bh : Math.min(bh, height - by * bh), cols = tiled ? bw : width;
      const buf = new Float32Array(rows * cols);
      if (tiled) buf.fill(NODATA);
      for (let r = 0; r < rows; r++) {
        const sr = by * bh + r;
        if (sr >= height) break;
        const sc = bx * bw, n = Math.min(cols, width - sc);
        buf.set(values.subarray(sr * width + sc, sr * width + sc + n), r * cols);
      }
      let bytes = new Uint8Array(buf.buffer);
      if (new Uint8Array(new Uint16Array([1]).buffer)[0] !== 1) { const dv = new DataView(buf.buffer); for (let i = 0; i < buf.length; i++) dv.setFloat32(i * 4, buf[i], true); }
      if (compress === 'deflate') bytes = await deflate(bytes);
      blocks.push(bytes);
    }
    if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
    if (progress && (by & 7) === 7) { progress(by / down); await tick(); }
  }
  // ---- tags
  const enc = (s) => { const b = new TextEncoder().encode(s.replace(/[^ -~\n]/g, '?') + '\u0000'); return b; };
  const T = [];   // { tag, type, count, data: Uint8Array }  type 2 ASCII, 3 SHORT, 4 LONG, 12 DOUBLE
  const short = (tag, vals) => { const b = new Uint8Array(vals.length * 2), dv = new DataView(b.buffer); vals.forEach((v, i) => dv.setUint16(i * 2, v, true)); T.push({ tag, type: 3, count: vals.length, data: b }); };
  const long = (tag, vals) => { const b = new Uint8Array(vals.length * 4), dv = new DataView(b.buffer); vals.forEach((v, i) => dv.setUint32(i * 4, v, true)); T.push({ tag, type: 4, count: vals.length, data: b }); };
  const dbl = (tag, vals) => { const b = new Uint8Array(vals.length * 8), dv = new DataView(b.buffer); vals.forEach((v, i) => dv.setFloat64(i * 8, v, true)); T.push({ tag, type: 12, count: vals.length, data: b }); };
  const asc = (tag, s) => { const b = enc(s); T.push({ tag, type: 2, count: b.length, data: b }); };
  long(256, [width]); long(257, [height]); short(258, [32]); short(259, [compress === 'deflate' ? 8 : 1]); short(262, [1]);
  if (description) asc(270, description);
  short(277, [1]);
  if (!tiled) long(278, [bh]);
  short(284, [1]);
  asc(305, 'CivilCraft');
  if (tiled) { long(322, [bw]); long(323, [bh]); }
  short(339, [3]);
  dbl(33550, [gt[1], -gt[5], 0]);
  dbl(33922, [0, 0, 0, gt[0], gt[3], 0]);
  if (epsg) {
    const cit = (citation || 'EPSG:' + epsg).replace(/\|/g, '/') + '|';
    const keys = [[1024, 0, 1, 1], [1025, 0, 1, 1], [1026, 34737, cit.length, 0], [3072, 0, 1, epsg], [3076, 0, 1, UNIT_EPSG[xyUnit] || 9001]];
    short(34735, [1, 1, 0, keys.length, ...keys.flat()]);
    asc(34737, cit);
  }
  // i18n-ignore: GDAL metadata XML written into the file (the default description is file content)
  const meta = '<GDALMetadata>\n' +
    '  <Item name="DESCRIPTION" sample="0" role="description">' + xmlText(description.split('.')[0] || 'Elevation')   /* i18n-ignore: file content */ + '</Item>\n' +
    '  <Item name="UNITTYPE" sample="0" role="unittype">' + UNIT_TYPE[zUnit] + '</Item>\n' +
    '  <Item name="ELEVATION_UNITS">' + UNIT_TYPE[zUnit] + '</Item>\n' +
    '</GDALMetadata>';
  asc(42112, meta);
  asc(42113, NODATA_TEXT);
  // offsets placeholders (filled below)
  const offTag = tiled ? 324 : 273, cntTag = tiled ? 325 : 279;
  long(offTag, blocks.map(() => 0)); long(cntTag, blocks.map((b) => b.length));
  T.sort((a, b) => a.tag - b.tag);
  // ---- layout: header 8 | IFD | out-of-line values | blocks
  const ifdSize = 2 + T.length * 12 + 4;
  let p = 8 + ifdSize;
  const size = (t) => t.data.length;
  for (const t of T) if (size(t) > 4) { t.at = p; p += size(t) + (size(t) & 1); }
  const dataStart = p;
  let total = dataStart;
  for (const b of blocks) total += b.length + (b.length & 1);
  if (total > 4e9) throw new Error(t('gtw.over_4gb'));
  const out = new Uint8Array(total), dv = new DataView(out.buffer);
  out.set([0x49, 0x49]); dv.setUint16(2, 42, true); dv.setUint32(4, 8, true);
  // block offsets
  const offs = [];
  let q = dataStart;
  for (const b of blocks) { offs.push(q); out.set(b, q); q += b.length + (b.length & 1); }
  const ot = T.find((t) => t.tag === offTag), odv = new DataView(ot.data.buffer);
  offs.forEach((v, i) => odv.setUint32(i * 4, v, true));
  dv.setUint16(8, T.length, true);
  T.forEach((t, i) => {
    const e = 10 + i * 12;
    dv.setUint16(e, t.tag, true); dv.setUint16(e + 2, t.type, true); dv.setUint32(e + 4, t.count, true);
    if (size(t) <= 4) out.set(t.data, e + 8); else { dv.setUint32(e + 8, t.at, true); out.set(t.data, t.at); }
  });
  dv.setUint32(10 + T.length * 12, 0, true);
  return out;
}

const xmlText = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
