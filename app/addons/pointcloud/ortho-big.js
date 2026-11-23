/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ortho-big.js — a big orthomosaic GeoTIFF reduced to a picture and a world file (0.11 PC.13). DOM-free (the caller encodes the pixels).
 *
 * CivilCraft's own GeoTIFF reader (raster.js readGeoImage) refuses a file over 200 MB, and a drone orthomosaic is usually 300 MB to several GB.
 * This reads such a file without loading it: geotiff.js reads a Blob window by window (only the tiles it needs are fetched), the smallest
 * overview image (the file's own pyramid, when it has one) that still holds the target size is used, and a file with no overview is read in
 * bands of rows so the memory stays at one band plus the output. The output is at most `maxPixels` (default 16 million, the same limit the
 * picture opener applies); the picture keeps the file's extent, the world file the reduced pixel size.
 *
 *   await readBigGeoTiff(file, { geotiff, maxPixels, bandRows, signal, progress }) → {
 *       width, height, rgba: Uint8ClampedArray, worldFile: 'A\nD\nB\nE\nC\nF\n', bbox: [minX, minY, maxX, maxY], source: { width, height, ifds, usedIfd, bands },
 *       epsg: number|null (the file's ProjectedCSTypeGeoKey / GeographicTypeGeoKey), notes: [code] }
 *   geotiff  the geotiff.js module (the app's import map 'geotiff'); the caller passes it so this file imports nothing.
 *   Throws Error with .code 'ortho_not_tiff' | 'ortho_no_georef' | 'ortho_unsupported' (a plain message is made by the caller).
 *   Notes: 'ortho_overview' (read from a pyramid level), 'ortho_banded' (no pyramid: read in bands), 'ortho_nodata_alpha' (transparent where the file says so),
 *   'ortho_16bit' (16-bit samples scaled to 8).
 */
const err = (code, msg) => Object.assign(new Error(msg || code), { code });

export async function readBigGeoTiff(file, { geotiff, maxPixels = 16 * 1024 * 1024, bandRows = 2048, signal = null, progress = null } = {}) {
  if (!geotiff || typeof geotiff.fromBlob !== 'function') throw err('ortho_unsupported', 'no geotiff reader');
  let tiff, base;
  try { tiff = await geotiff.fromBlob(file); base = await tiff.getImage(0); } catch (e) { throw err('ortho_not_tiff', String(e && e.message || e)); }
  const W0 = base.getWidth(), H0 = base.getHeight(), fd = base.fileDirectory;
  // georeference of the full image: origin + resolution (ModelTiepoint + ModelPixelScale, or a ModelTransformation), as geotiff.js reads them
  let ox, oy, rx, ry;
  try { const o = base.getOrigin(), r = base.getResolution(); [ox, oy] = o; [rx, ry] = r; } catch { throw err('ortho_no_georef', 'no georeference'); }
  if (![ox, oy, rx, ry].every(Number.isFinite) || !rx || !ry) throw err('ortho_no_georef', 'no georeference');
  // pixel-is-point files: the tie point is a cell centre, so the area's corner is half a cell back
  let gk = null; try { gk = base.getGeoKeys(); } catch { gk = null; }
  const pixelIsPoint = !!gk && gk.GTRasterTypeGeoKey === 2;
  const x0 = pixelIsPoint ? ox - rx / 2 : ox, y0 = pixelIsPoint ? oy - ry / 2 : oy;   // ry is negative for north-up files
  const epsg = gk ? (gk.ProjectedCSTypeGeoKey > 0 && gk.ProjectedCSTypeGeoKey < 32767 ? gk.ProjectedCSTypeGeoKey : gk.GeographicTypeGeoKey > 0 && gk.GeographicTypeGeoKey < 32767 ? gk.GeographicTypeGeoKey : null) : null;
  const bps = Array.from(fd.BitsPerSample || [8]), bits = Math.max(...bps), samples = base.getSamplesPerPixel();
  const notes = [];
  if (bits > 8) notes.push('ortho_16bit');
  const k8 = bits > 8 ? 255 / (2 ** Math.min(bits, 16) - 1) : 1;

  // the target size, and the pyramid level to read it from: the smallest image that is still at least the target (area)
  const k = W0 * H0 > maxPixels ? Math.sqrt(maxPixels / (W0 * H0)) : 1;
  const W = Math.max(1, Math.floor(W0 * k)), H = Math.max(1, Math.floor(H0 * k));
  const count = await tiff.getImageCount();
  let used = 0, img = base;
  for (let i = 1; i < count; i++) {
    let im; try { im = await tiff.getImage(i); } catch { continue; }
    if (im.getWidth() >= W && im.getHeight() >= H && im.getWidth() * im.getHeight() < img.getWidth() * img.getHeight() && im.getSamplesPerPixel() === samples) { img = im; used = i; }
  }
  if (used) notes.push('ortho_overview');
  const sw = img.getWidth(), sh = img.getHeight();
  const rgba = new Uint8ClampedArray(W * H * 4);
  const bands = Math.max(1, Math.ceil(sh / bandRows));
  if (!used && bands > 1) notes.push('ortho_banded');
  let alphaSeen = false;
  for (let b = 0; b < bands; b++) {
    if (signal && signal.aborted) throw Object.assign(new Error('Cancelled.'), { name: 'AbortError' });
    // source rows [r0, r1) -> output rows [o0, o1) with the same proportions (the bands tile the output exactly)
    const r0 = Math.floor(b * sh / bands), r1 = Math.floor((b + 1) * sh / bands), o0 = Math.floor(b * H / bands), o1 = Math.floor((b + 1) * H / bands);
    if (o1 <= o0 || r1 <= r0) continue;
    const rgb = await img.readRGB({ window: [0, r0, sw, r1], width: W, height: o1 - o0, enableAlpha: true, interleave: true, resampleMethod: 'bilinear' });
    const n = W * (o1 - o0), ch = Math.round(rgb.length / n);
    for (let i = 0; i < n; i++) {
      const o = 4 * (o0 * W + i);
      rgba[o] = rgb[ch * i] * k8; rgba[o + 1] = rgb[ch * i + 1] * k8; rgba[o + 2] = rgb[ch * i + 2] * k8;
      const a = ch >= 4 ? rgb[ch * i + 3] * k8 : 255; rgba[o + 3] = a; if (a < 255) alphaSeen = true;
    }
    if (progress) progress((b + 1) / bands);
  }
  if (alphaSeen) notes.push('ortho_nodata_alpha');
  // world file: centre of the first pixel, reduced pixel size (rows grow downwards: E is negative for a north-up file)
  const A = rx * (W0 / W), E = ry * (H0 / H), C = x0 + A / 2, F = y0 + E / 2;
  const worldFile = [A, 0, 0, E, C, F].map((v) => v.toPrecision(17)).join('\n') + '\n';
  const xs = [x0, x0 + W0 * rx], ys = [y0, y0 + H0 * ry];
  return { width: W, height: H, rgba, worldFile, bbox: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)], epsg, notes,
    source: { width: W0, height: H0, ifds: count, usedIfd: used, bands: !used ? bands : 1 } };
}
