/* SPDX-License-Identifier: Apache-2.0 */
/**
 * raster.js — elevation grids for CivilCraft: GeoTIFF (through geotiff.js, vendored, loaded on first use) and ESRI ASCII
 * grids (.asc + .prj, read here). No DOM. Files are untrusted: sizes, counts and numbers are checked before use.
 *
 *   await probeTiff(file) → { bands, bits, float, photometric, image: bool }   enough to tell an elevation grid from a picture
 *   await openRaster(files) → src | throws Error (plain message)             files: the .tif/.tiff or the .asc (+ its .prj)
 *     src = { kind: 'geotiff'|'asc', name, size, width, height, dtype, gt: [x0, dxCol, dxRow, y0, dyCol, dyRow] (GDAL
 *             geotransform, cell corners; pixel-is-point files shifted half a cell so nodes stay at cell centers),
 *             pixelIsPoint, cell (cell size, file units, when square and north-up), nodata, scale, offset,
 *             crs (state.crs shape | null), code, crsNote, zUnit ('m'|'ft'|'ftUS'|null — what the file says),
 *             zUnitFrom, notes[], stats: { min, max, sampled } | null }
 *   await readWindow(src, { c0, r0, c1, r1, step, signal, progress(fraction) }) → grid { c0, r0, step, nx, ny, z }
 *     every step-th cell of the window (z: Float64Array, NaN = nodata, scale/offset applied, file units); reads rows in
 *     bands (GeoTIFF readRasters({window}) on the File; ASCII streamed) — never the whole file at once
 *   await sampleStats(src) → { min, max } from a ≤ 256 × 256 sample (GeoTIFF; ASCII: a full read when it is small)
 *   await readGeoImage(file) → { width, height, rgba, affine (gt), bbox [minX, minY, maxX, maxY], crs, code, notes }
 *     an RGB(A) GeoTIFF for builder C's map layers (≤ 16 M pixels; larger images are read at a reduced size, said in notes)
 *
 * GeoKeys: ProjectedCSTypeGeoKey / GeographicTypeGeoKey → the EPSG catalog (crs.js), ProjLinearUnitsGeoKey, vertical
 * units (VerticalUnitsGeoKey, or GDAL's band unit type), GTRasterTypeGeoKey (1 area, 2 point). GDAL_NODATA, GDAL_METADATA
 * scale/offset/unit type.
 */

import { crsFromGeoKeys, unitFromName, LIMITS } from './terrain.js';
import { crsFromPrj } from './crs.js';
import { t } from "./i18n.js";

let GT = null;
const geotiff = () => (GT ||= import('geotiff'));

const SAMPLE_TYPES = { '1:8': 'uint8', '1:16': 'uint16', '1:32': 'uint32', '2:8': 'int8', '2:16': 'int16', '2:32': 'int32', '3:32': 'float32', '3:64': 'float64' };

async function openTiff(file) {
  const { fromBlob } = await geotiff();
  let tiff, image;
  try {
    tiff = await fromBlob(file);
    image = await tiff.getImage(0);
  } catch (e) {
    throw new Error(t('raster.not_tiff', { reason: String(e?.message || e).slice(0, 120) }));
  }
  return { tiff, image };
}

function tagNum(fd, name, def = null) {
  try { if (!fd.hasTag(name)) return def; const v = fd.getValue(name); return v == null ? def : typeof v === 'number' ? v : v.length ? v[0] : def; } catch { return def; }
}
function tagArr(fd, name) {
  try { return fd.hasTag(name) ? Array.from(fd.getValue(name) || []) : null; } catch { return null; }
}
function tagStr(fd, name) {
  try { if (!fd.hasTag(name)) return null; const v = fd.getValue(name); return typeof v === 'string' ? v.replace(/\u0000+$/, '') : null; } catch { return null; }
}

export async function probeTiff(file) {
  const { image } = await openTiff(file);
  const fd = image.fileDirectory;
  const bands = image.getSamplesPerPixel();
  const bits = Math.max(...(tagArr(fd, 'BitsPerSample') || [8]));
  const fmt = Math.max(...(tagArr(fd, 'SampleFormat') || [1]));
  const photometric = tagNum(fd, 'PhotometricInterpretation', 1);
  const float = fmt === 3;
  const picture = bands >= 2 || photometric === 2 || photometric === 3 || photometric === 6 || (bands === 1 && bits <= 8 && !float);
  return { bands, bits, float, photometric, image: picture };
}

/** GDAL_METADATA items for band 0 and the dataset, by role or name. */
function gdalMeta(xml) {
  const out = { scale: null, offset: null, unit: null, items: {} };
  if (!xml || xml.length > 1e6) return out;
  const re = /<Item\b([^>]*)>([^<]*)<\/Item>/g;
  let m;
  while ((m = re.exec(xml))) {
    const attrs = m[1], val = m[2].trim();
    const at = (k) => (attrs.match(new RegExp(k + '="([^"]*)"')) || [])[1];
    const sample = at('sample'), role = (at('role') || '').toLowerCase(), name = at('name') || '';
    if (sample !== undefined && sample !== '0') continue;
    if (role === 'scale') out.scale = Number(val);
    else if (role === 'offset') out.offset = Number(val);
    else if (role === 'unittype') out.unit = val;
    else if (name && sample === undefined) out.items[name] = val;
  }
  return out;
}

async function openGeoTiff(file) {
  const { image } = await openTiff(file);
  const fd = image.fileDirectory;
  const width = image.getWidth(), height = image.getHeight();
  if (!(width > 0 && height > 0) || width > LIMITS.dim || height > LIMITS.dim) throw new Error(t('raster.bad_size', { w: width, h: height }));
  const bands = image.getSamplesPerPixel();
  const bits = (tagArr(fd, 'BitsPerSample') || [8])[0], fmt = (tagArr(fd, 'SampleFormat') || [1])[0];
  const dtype = SAMPLE_TYPES[fmt + ':' + bits];
  if (!dtype) throw new Error(t('raster.bad_cells', { bits, fmt }));
  const notes = [];
  if (bands > 1) notes.push(t('raster.bands_n', { n: bands }));
  // georeferencing: ModelTransformation, else tie point + pixel scale
  let keys = null;
  try { keys = image.getGeoKeys(); } catch { keys = null; }
  const rasterType = keys?.GTRasterTypeGeoKey ?? 1;
  const pixelIsPoint = rasterType === 2;
  const tie = tagArr(fd, 'ModelTiepoint'), scl = tagArr(fd, 'ModelPixelScale'), mtx = tagArr(fd, 'ModelTransformation');
  let gt;
  if (mtx && mtx.length >= 16 && mtx.every(Number.isFinite)) gt = [mtx[3], mtx[0], mtx[1], mtx[7], mtx[4], mtx[5]];
  else if (tie && tie.length >= 6 && scl && scl.length >= 2 && [...tie.slice(0, 6), ...scl.slice(0, 2)].every(Number.isFinite) && scl[0] > 0 && scl[1] > 0) {
    if (tie.length > 6) notes.push(t('raster.tie_points'));
    gt = [tie[3] - tie[0] * scl[0], scl[0], 0, tie[4] + tie[1] * scl[1], 0, -scl[1]];
  } else throw new Error(t('raster.no_georef'));
  if (!(Math.abs(gt[1] * gt[5] - gt[2] * gt[4]) > 0)) throw new Error(t('raster.zero_cell'));
  // pixel-is-point: the tie point is a cell center (GDAL's reading) — shift to the corner convention
  if (pixelIsPoint) { gt = [gt[0] - 0.5 * (gt[1] + gt[2]), gt[1], gt[2], gt[3] - 0.5 * (gt[4] + gt[5]), gt[4], gt[5]]; }
  const g = crsFromGeoKeys(keys);
  const meta = gdalMeta(tagStr(fd, 'GDAL_METADATA'));
  const ndStr = tagStr(fd, 'GDAL_NODATA');
  let nodata = ndStr != null && ndStr.trim() !== '' ? Number(ndStr.trim()) : null;
  if (nodata != null && Number.isNaN(nodata) && !/nan/i.test(ndStr)) nodata = null;
  const scale = Number.isFinite(meta.scale) && meta.scale !== 0 ? meta.scale : 1;
  const offset = Number.isFinite(meta.offset) ? meta.offset : 0;
  let zUnit = unitFromName(meta.unit), zUnitFrom = zUnit ? t('raster.zfrom.band', { unit: meta.unit }) : null;
  if (!zUnit && g.zUnit) { zUnit = g.zUnit; zUnitFrom = t('raster.zfrom.key'); }
  if (meta.unit && !zUnit) notes.push(t('raster.unknown_unit', { unit: meta.unit.slice(0, 40) }));
  const stats = Number.isFinite(Number(meta.items.STATISTICS_MINIMUM)) && Number.isFinite(Number(meta.items.STATISTICS_MAXIMUM)) ? { min: Number(meta.items.STATISTICS_MINIMUM) * scale + offset, max: Number(meta.items.STATISTICS_MAXIMUM) * scale + offset, sampled: false } : null;
  return {
    kind: 'geotiff', name: file.name, size: file.size, file, image, width, height, bands, dtype, gt, pixelIsPoint,
    cell: gt[2] === 0 && gt[4] === 0 && Math.abs(gt[1] + gt[5]) < 1e-9 * Math.abs(gt[1]) ? gt[1] : null,
    nodata, scale, offset, crs: g.crs, code: g.code, crsNote: g.note, zUnit, zUnitFrom, notes, stats,
    tileHeight: image.getTileHeight ? image.getTileHeight() : 1,
  };
}

// ---------------------------------------------------------------- ESRI ASCII grid
const ASC_KEYS = ['ncols', 'nrows', 'xllcorner', 'yllcorner', 'xllcenter', 'yllcenter', 'cellsize', 'dx', 'dy', 'nodata_value'];

async function ascHeader(file) {
  const head = await file.slice(0, 4096).text();
  const lines = head.split(/\r?\n/);
  const h = {};
  let bytes = 0, n = 0;
  for (const line of lines) {
    const m = line.match(/^\s*([A-Za-z_]+)\s+(\S+)\s*$/);
    if (!m || !ASC_KEYS.includes(m[1].toLowerCase())) break;
    h[m[1].toLowerCase()] = Number(m[2]);
    bytes += new TextEncoder().encode(line).length + (head.includes('\r\n') ? 2 : 1);
    if (++n > 10) break;
  }
  const ncols = h.ncols, nrows = h.nrows;
  if (!Number.isInteger(ncols) || !Number.isInteger(nrows) || ncols <= 0 || nrows <= 0 || ncols > LIMITS.dim || nrows > LIMITS.dim) throw new Error(t('raster.asc.not_asc'));
  const dx = h.cellsize ?? h.dx, dy = h.cellsize ?? h.dy ?? h.dx;
  if (!(dx > 0) || !(dy > 0) || !Number.isFinite(dx) || !Number.isFinite(dy)) throw new Error(t('raster.asc.no_cell'));
  const center = h.xllcenter !== undefined;
  const xll = center ? h.xllcenter - dx / 2 : h.xllcorner, yll = center ? (h.yllcenter ?? 0) - dy / 2 : h.yllcorner;
  if (!Number.isFinite(xll) || !Number.isFinite(yll)) throw new Error(t('raster.asc.no_corner'));
  return { ncols, nrows, dx, dy, xll, yll, nodata: Number.isFinite(h.nodata_value) ? h.nodata_value : null, dataStart: bytes };
}

async function openAsc(files) {
  const file = files.find((f) => /\.asc$/i.test(f.name));
  const h = await ascHeader(file);
  const notes = [];
  let crs = null, code = null, crsNote = t('raster.asc.no_prj');
  const prj = files.find((f) => /\.prj$/i.test(f.name) && f.name.replace(/\.prj$/i, '').toLowerCase() === file.name.replace(/\.asc$/i, '').toLowerCase()) || files.find((f) => /\.prj$/i.test(f.name));
  if (prj) {
    if (prj.size > 20000) crsNote = t('raster.asc.prj_big');
    else {
      try { const r = crsFromPrj(await prj.text()); crs = r.crs; code = r.matched?.code ?? null; crsNote = r.notes.join(' ') || null; } catch (e) { crsNote = e.message; }
    }
  }
  return {
    kind: 'asc', name: file.name, size: file.size, file, width: h.ncols, height: h.nrows, bands: 1, dtype: 'text',
    gt: [h.xll, h.dx, 0, h.yll + h.nrows * h.dy, 0, -h.dy], pixelIsPoint: false, cell: h.dx === h.dy ? h.dx : null,
    nodata: h.nodata, scale: 1, offset: 0, crs, code, crsNote, zUnit: null, zUnitFrom: null, notes, stats: null, dataStart: h.dataStart,
  };
}

export async function openRaster(files) {
  const list = Array.isArray(files) ? files : [files];
  const main = list.find((f) => /\.(tiff?|asc)$/i.test(f.name));
  if (!main) throw new Error(t('raster.no_grid'));
  if (main.size > LIMITS.fileBytes) throw new Error(t('raster.too_big', { name: main.name, mb: (main.size / 1048576).toFixed(0), max: String(LIMITS.fileBytes / 1048576) }));
  if (/\.asc$/i.test(main.name)) return openAsc(list);
  return openGeoTiff(main);
}

// ---------------------------------------------------------------- reading
const aborted = (signal) => { if (signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' }); };
const tick = () => new Promise((r) => setTimeout(r, 0));

export async function readWindow(src, { c0 = 0, r0 = 0, c1 = src.width, r1 = src.height, step = 1, signal = null, progress = null } = {}) {
  c0 = Math.max(0, Math.floor(c0)); r0 = Math.max(0, Math.floor(r0)); c1 = Math.min(src.width, Math.ceil(c1)); r1 = Math.min(src.height, Math.ceil(r1));
  step = Math.max(1, Math.floor(step));
  if (!(c1 > c0 && r1 > r0)) throw new Error(t('raster.no_overlap'));
  if ((c1 - c0) * (r1 - r0) > LIMITS.readCells) throw new Error(t('raster.area_big', { cells: fmtBig((c1 - c0) * (r1 - r0)), max: fmtBig(LIMITS.readCells) }));
  const nx = Math.ceil((c1 - c0) / step), ny = Math.ceil((r1 - r0) / step);
  const z = new Float64Array(nx * ny);
  const grid = { c0, r0, step, nx, ny, z };
  if (src.kind === 'asc') await readAsc(src, grid, c1, r1, signal, progress);
  else {
    try { await readTiff(src, grid, c1, r1, signal, progress); } catch (e) {
      if (e?.name === 'AbortError' || signal?.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
      throw new Error(t('raster.read_failed', { reason: String(e?.message || e).slice(0, 80) }));
    }
  }
  return grid;
}

function cleanValue(src, v) {
  if (src.nodata != null && (v === src.nodata || (Number.isNaN(src.nodata) && Number.isNaN(v)))) return NaN;
  if (!Number.isFinite(v)) return NaN;
  // float32 files often store nodata as the float32 rounding of a double (−3.4028235e38): compare at float32 too
  if (src.nodata != null && src.dtype === 'float32' && Math.fround(src.nodata) === v) return NaN;
  return v * src.scale + src.offset;
}

async function readTiff(src, grid, c1, r1, signal, progress) {
  const { c0, r0, step, nx, ny, z } = grid, width = c1 - c0;
  const put = (row, data, rowInData) => {
    const j = (row - r0) / step, base = rowInData * width;
    for (let i = 0; i < nx; i++) z[j * nx + i] = cleanValue(src, data[base + i * step]);
  };
  // rows in bands of ≤ ~4 M cells; when the step skips whole bands of the file's blocks, read only the rows needed
  const bandRows = Math.max(1, Math.min(r1 - r0, Math.floor(4e6 / width)));
  if (step >= Math.max(8, src.tileHeight || 1)) {
    for (let j = 0; j < ny; j++) {
      aborted(signal);
      const row = r0 + j * step;
      const [data] = await src.image.readRasters({ window: [c0, row, c1, row + 1], samples: [0], signal: signal || undefined });
      put(row, data, 0);
      if (progress && j % 16 === 0) { progress(j / ny); await tick(); }
    }
  } else {
    for (let rs = r0; rs < r1; rs += bandRows) {
      aborted(signal);
      const re = Math.min(r1, rs + bandRows);
      const [data] = await src.image.readRasters({ window: [c0, rs, c1, re], samples: [0], signal: signal || undefined });
      for (let row = rs; row < re; row++) if ((row - r0) % step === 0) put(row, data, row - rs);
      if (progress) { progress((re - r0) / (r1 - r0)); await tick(); }
    }
  }
  aborted(signal);
}

/** Streams the text after the header: values row by row from the top; stops after the last row needed. */
async function readAsc(src, grid, c1, r1, signal, progress) {
  const { c0, r0, step, nx, z } = grid, W = src.width;
  const total = src.size - src.dataStart;
  const reader = src.file.slice(src.dataStart).stream().getReader();
  const dec = new TextDecoder();
  let carry = '', k = 0, read = 0, lastTick = 0;
  const need = r1 * W;
  const take = (tok) => {
    const row = Math.floor(k / W), col = k - row * W;
    if (row >= r0 && row < r1 && (row - r0) % step === 0 && col >= c0 && col < c1 && (col - c0) % step === 0) {
      const v = Number(tok);
      z[((row - r0) / step) * nx + (col - c0) / step] = Number.isNaN(v) ? NaN : cleanValue(src, v);
    }
    k++;
  };
  try {
    for (;;) {
      aborted(signal);
      const { value, done } = await reader.read();
      if (done) break;
      read += value.length;
      const text = carry + dec.decode(value, { stream: true });
      let s = 0;
      const n = text.length;
      for (let i = 0; i < n && k < need; i++) {
        const c = text.charCodeAt(i);
        if (c <= 32) { if (i > s) take(text.slice(s, i)); s = i + 1; }
      }
      carry = k < need ? text.slice(s) : '';
      if (k >= need) break;
      if (progress && read - lastTick > 4e6) { lastTick = read; progress(Math.min(1, k / need)); await tick(); }
    }
    if (carry.trim() && k < need) take(carry.trim());
  } finally { reader.cancel().catch(() => {}); }
  if (k < need) throw new Error(t('raster.asc.short', { read: fmtBig(k), total: fmtBig(W * src.height) }));
}

export async function sampleStats(src, { signal } = {}) {
  if (src.stats) return src.stats;
  let min = Infinity, max = -Infinity, sampled = true;
  if (src.kind === 'geotiff') {
    const w = Math.min(256, src.width), h = Math.min(256, src.height);
    const [data] = await src.image.readRasters({ samples: [0], width: w, height: h, resampleMethod: 'nearest', signal: signal || undefined });
    for (let i = 0; i < data.length; i++) { const v = cleanValue(src, data[i]); if (v < min) min = v; if (v > max) max = v; }
    sampled = w < src.width || h < src.height;
  } else {
    if (src.size > 20e6) return null;
    const g = await readWindow(src, { signal });
    for (const v of g.z) { if (v < min) min = v; if (v > max) max = v; }
    sampled = false;
  }
  src.stats = Number.isFinite(min) ? { min, max, sampled } : { min: null, max: null, sampled };
  return src.stats;
}

// ---------------------------------------------------------------- images (builder C's map layers)
const MAX_IMAGE_PX = 16 * 1024 * 1024;

export async function readGeoImage(file) {
  if (file.size > LIMITS.fileBytes) throw new Error(t('raster.too_big', { name: file.name, mb: (file.size / 1048576).toFixed(0), max: String(LIMITS.fileBytes / 1048576) }));
  const src = await openGeoTiff(file);
  const notes = [...src.notes.filter((n) => n !== t('raster.bands_n', { n: src.bands }))];
  let w = src.width, h = src.height;
  if (w * h > MAX_IMAGE_PX) {
    const k = Math.sqrt(MAX_IMAGE_PX / (w * h));
    w = Math.max(1, Math.floor(w * k)); h = Math.max(1, Math.floor(h * k));
    notes.push(t('raster.image_reduced', { w: src.width, h: src.height, rw: w, rh: h }));
  }
  const rgb = await src.image.readRGB({ width: w, height: h, enableAlpha: true, interleave: true, resampleMethod: 'bilinear' });
  const n = w * h, rgba = new Uint8ClampedArray(n * 4), ch = rgb.length / n;
  const bits = Math.max(...(tagArr(src.image.fileDirectory, 'BitsPerSample') || [8]));
  const k8 = bits > 8 ? 255 / (2 ** bits - 1) : 1;
  for (let i = 0; i < n; i++) {
    rgba[4 * i] = rgb[ch * i] * k8; rgba[4 * i + 1] = rgb[ch * i + 1] * k8; rgba[4 * i + 2] = rgb[ch * i + 2] * k8;
    rgba[4 * i + 3] = ch >= 4 ? rgb[ch * i + 3] * k8 : 255;
  }
  // the affine for the image as read (cells scaled when it was reduced)
  const sx = src.width / w, sy = src.height / h, g = src.gt;
  const affine = [g[0], g[1] * sx, g[2] * sy, g[3], g[4] * sx, g[5] * sy];
  const xs = [], ys = [];
  for (const [c, r] of [[0, 0], [w, 0], [w, h], [0, h]]) { xs.push(affine[0] + c * affine[1] + r * affine[2]); ys.push(affine[3] + c * affine[4] + r * affine[5]); }
  return { width: w, height: h, rgba, affine, bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], crs: src.crs, code: src.code, crsNote: src.crsNote, notes };
}

export const fmtBig = (n) => (n >= 1e9 ? t('raster.big.billion', { n: (n / 1e9).toFixed(1) }) : n >= 1e6 ? t('raster.big.million', { n: (n / 1e6).toFixed(1) }) : Math.round(n).toLocaleString('en-US'));
