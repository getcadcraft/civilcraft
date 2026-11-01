/* SPDX-License-Identifier: Apache-2.0 */
/**
 * photo-material.js — a material from a photo (0.8 round 2, EG.62, session `model_PART_2`; a shared library since round 3, rule 39:
 * lib/photo-material is canonical, hosts carry byte copies via tools/photo-material/sync.mjs <host>): one picture of a surface becomes the
 * three maps of a tiling material — colour, roughness and a normal map — by image processing alone (rule 35: no trained model, no
 * network; plain maths on the pixels). DOM-free except `decodePhoto`, which only the page calls.
 *
 *   fromPhoto(photo {w, h, data RGBA8, rows top-down}, opts) → {color, roughness, normal, stats, notes}
 *     each map is {w: 512, h: 512, data RGBA8, rows bottom-up} — the shape the file's pictures have (shading/images.js)
 *     opts: crop [x, y, w, h] as fractions of the photo (default: the largest centred square) · flatten (default true: takes the
 *           light falling off across the photo out of the colours) · seamless (default true: the tile joins itself) ·
 *           roughness 0–1 (the surface's base roughness, default 0.65: a photo cannot tell polished from matt) · bump 0–4 (how
 *           strong the relief reads, default 1)
 *     stats: {size, source {w, h}, crop, seam {before, after} (1 = as smooth across the join as anywhere inside), meanColor,
 *             heightSigma, roughnessMean}
 *   decodePhoto(mime, bytes) → Promise<photo>      (page) the browser decodes it; at most MAX_SIDE pixels on a side
 *   seamRatio(channel, n) → number                 the join's jump over the usual jump between neighbours (1 = invisible)
 *   MAX_SIDE, SIZE
 *
 * What each step does, and what it cannot:
 *   flatten    divides the colour by a heavily blurred copy of its brightness (lit-from-one-side photos tile as stripes otherwise)
 *   seamless   blends the tile with a copy of itself shifted half a tile in both directions, so the edges (which are now the
 *              middle of the shifted copy) meet; busy photos can show a soft ghost along the old middle — pick a plainer crop
 *   normal     the relief is the photo's detail band (fine brightness changes, not the broad lighting) read as a height map:
 *              darker pits are lower. It is the photo's look of relief, not a measurement
 *   roughness  your base value, made rougher in the pits and smoother on the raised parts. It is an estimate, always
 */
export const SIZE = 512;
export const MAX_SIDE = 12000;
const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

/** Browser decode of a PNG / JPEG / WebP, rows top-down, with the picture's own proportions kept (the file pictures are squared; this is not). */
export async function decodePhoto(mime, bytes) {
  const bmp = await createImageBitmap(new Blob([bytes], { type: mime }));
  if (bmp.width > MAX_SIDE || bmp.height > MAX_SIDE) { bmp.close?.(); throw new RangeError('That picture is larger than ' + MAX_SIDE + ' pixels on a side.'); }
  const cv = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(bmp.width, bmp.height) : Object.assign(document.createElement('canvas'), { width: bmp.width, height: bmp.height });
  const g = cv.getContext('2d');
  g.drawImage(bmp, 0, 0);
  const id = g.getImageData(0, 0, bmp.width, bmp.height);
  bmp.close?.();
  return { w: id.width, h: id.height, data: new Uint8Array(id.data.buffer) };
}

// ------------------------------------------------------------------ small image maths (planar Float32, N × N, wrapping)
/** A box blur of radius r (running sum), once in x and once in y; `wrap` = the tile repeats (else the edge pixels repeat). */
function boxBlur(a, n, r, wrap) {
  if (r < 1) return a;
  const out = new Float32Array(n * n), tmp = new Float32Array(n * n), k = 2 * r + 1;
  const ix = wrap ? (i) => ((i % n) + n) % n : (i) => (i < 0 ? 0 : i >= n ? n - 1 : i);
  for (let y = 0; y < n; y++) {
    let s = 0;
    for (let i = -r; i <= r; i++) s += a[y * n + ix(i)];
    for (let x = 0; x < n; x++) {
      tmp[y * n + x] = s / k;
      s += a[y * n + ix(x + r + 1)] - a[y * n + ix(x - r)];
    }
  }
  for (let x = 0; x < n; x++) {
    let s = 0;
    for (let i = -r; i <= r; i++) s += tmp[ix(i) * n + x];
    for (let y = 0; y < n; y++) {
      out[y * n + x] = s / k;
      s += tmp[ix(y + r + 1) * n + x] - tmp[ix(y - r) * n + x];
    }
  }
  return out;
}
/** Three box passes ≈ a Gaussian of about r pixels (wrapping by default: the tile repeats once it is seamless). */
const blur = (a, n, r, wrap = true) => boxBlur(boxBlur(boxBlur(a, n, r, wrap), n, r, wrap), n, r, wrap);
const mean = (a) => { let s = 0; for (let i = 0; i < a.length; i++) s += a[i]; return s / a.length; };
const luma = (r, g, b) => { const o = new Float32Array(r.length); for (let i = 0; i < o.length; i++) o[i] = 0.2126 * r[i] + 0.7152 * g[i] + 0.0722 * b[i]; return o; };

/** The picture's chosen part (rows top-down) as three N × N planes, averaged down (or bilinearly up) to the tile size. */
function cropTo(photo, crop, n) {
  const { w, h, data } = photo;
  const [cx, cy, cw, ch] = crop;
  const sx = cx * w, sy = cy * h, sw = cw * w, sh = ch * h;
  const taps = clamp(Math.ceil(Math.max(sw, sh) / n), 1, 6);
  const R = new Float32Array(n * n), G = new Float32Array(n * n), B = new Float32Array(n * n);
  const at = (x, y, c) => {
    const fx = clamp(x - 0.5, 0, w - 1), fy = clamp(y - 0.5, 0, h - 1), x0 = Math.floor(fx), y0 = Math.floor(fy), x1 = Math.min(w - 1, x0 + 1), y1 = Math.min(h - 1, y0 + 1), tx = fx - x0, ty = fy - y0;
    const p = (xx, yy) => data[(yy * w + xx) * 4 + c];
    return (p(x0, y0) * (1 - tx) + p(x1, y0) * tx) * (1 - ty) + (p(x0, y1) * (1 - tx) + p(x1, y1) * tx) * ty;
  };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    let r = 0, g = 0, b = 0;
    for (let j = 0; j < taps; j++) for (let i = 0; i < taps; i++) {
      const px = sx + ((x + (i + 0.5) / taps) / n) * sw, py = sy + ((y + (j + 0.5) / taps) / n) * sh;
      r += at(px, py, 0); g += at(px, py, 1); b += at(px, py, 2);
    }
    const o = y * n + x, k = taps * taps;
    R[o] = r / k; G[o] = g / k; B[o] = b / k;
  }
  return [R, G, B];
}

/** How big the jump across the tile's join is, against the usual jump between neighbouring pixels inside it. 1 = invisible, 3+ = a visible seam. */
export function seamRatio(a, n) {
  let join = 0, inner = 0;
  for (let i = 0; i < n; i++) {
    join += Math.abs(a[i * n] - a[i * n + n - 1]) + Math.abs(a[i] - a[(n - 1) * n + i]);
    for (let j = 0; j < n - 1; j++) inner += Math.abs(a[i * n + j] - a[i * n + j + 1]) + Math.abs(a[j * n + i] - a[(j + 1) * n + i]);
  }
  join /= 2 * n; inner /= 2 * n * (n - 1);
  return join / Math.max(inner, 1e-6);
}

/** Blend each plane with its half-tile-shifted copy: the mask is 0 on the old edges and 1 in the middle, so the edges become the shifted copy's middle. */
function makeSeamless(planes, n) {
  const w = new Float32Array(n), half = n >> 1;
  for (let i = 0; i < n; i++) { const s = clamp(Math.sin((Math.PI * (i + 0.5)) / n) * 1.8, 0, 1); w[i] = s * s * (3 - 2 * s); }
  return planes.map((a) => {
    const o = new Float32Array(n * n);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const m = w[x] * w[y], b = a[((y + half) % n) * n + ((x + half) % n)];
      o[y * n + x] = a[y * n + x] * m + b * (1 - m);
    }
    return o;
  });
}

const hex = (v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0');

/** Rows top-down planes → an RGBA8 picture with rows bottom-up (the file pictures' order). */
function toImage(rp, gp, bp, n) {
  const data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const s = y * n + x, o = ((n - 1 - y) * n + x) * 4;
    data[o] = clamp(Math.round(rp[s]), 0, 255); data[o + 1] = clamp(Math.round(gp[s]), 0, 255); data[o + 2] = clamp(Math.round(bp[s]), 0, 255); data[o + 3] = 255;
  }
  return { w: n, h: n, data };
}

export function fromPhoto(photo, opts = {}) {
  if (!photo || !Number.isInteger(photo.w) || !Number.isInteger(photo.h) || photo.w < 16 || photo.h < 16 || photo.w > MAX_SIDE || photo.h > MAX_SIDE || !photo.data || photo.data.length < photo.w * photo.h * 4) throw new RangeError('That is not a usable picture (16 to ' + MAX_SIDE + ' pixels on a side).');
  const n = SIZE, notes = [];
  const flatten = opts.flatten !== false, seamless = opts.seamless !== false;
  const base = clamp(Number.isFinite(opts.roughness) ? opts.roughness : 0.65, 0, 1), bump = clamp(Number.isFinite(opts.bump) ? opts.bump : 1, 0, 4);
  // ---- which part of the photo
  let crop = opts.crop;
  if (crop) {
    if (!Array.isArray(crop) || crop.length !== 4 || crop.some((v) => !Number.isFinite(v))) throw new RangeError('crop is [x, y, width, height] as fractions of the picture, e.g. [0.1, 0.1, 0.5, 0.5].');
    const [x, y, w, h] = crop.map((v) => clamp(v, 0, 1));
    crop = [x, y, Math.min(w, 1 - x), Math.min(h, 1 - y)];
    if (crop[2] * photo.w < 16 || crop[3] * photo.h < 16) throw new RangeError('That crop is smaller than 16 pixels.');
    if (Math.abs(crop[2] * photo.w - crop[3] * photo.h) > 0.1 * Math.max(crop[2] * photo.w, crop[3] * photo.h)) notes.push('The crop is not square: the tile squeezes it to a square, so the pattern is stretched. Choose a square part for a true-to-scale tile.');
  } else {
    const s = Math.min(photo.w, photo.h);
    crop = [(photo.w - s) / 2 / photo.w, (photo.h - s) / 2 / photo.h, s / photo.w, s / photo.h];
    if (Math.max(photo.w, photo.h) > s * 1.05) notes.push('The photo is not square: the middle square was used (give crop to use another part).');
  }
  let planes = cropTo(photo, crop, n);
  // ---- the light across the photo
  if (flatten) {
    const L = luma(...planes), B = blur(L, n, n >> 3, false), m = mean(L);   // the photo does not repeat yet: its edges are edges
    const g = new Float32Array(n * n);
    for (let i = 0; i < g.length; i++) g[i] = clamp(m / Math.max(B[i], 8), 0.6, 1.7);
    planes = planes.map((p) => { const o = new Float32Array(p.length); for (let i = 0; i < o.length; i++) o[i] = p[i] * g[i]; return o; });
  }
  const before = seamRatio(luma(...planes), n);
  if (seamless) planes = makeSeamless(planes, n);
  const L = luma(...planes), after = seamRatio(L, n);
  if (seamless && after > 2.2) notes.push('The tile still shows a join (ratio ' + after.toFixed(1) + '): the picture has a strong pattern or one large feature. Try a plainer crop.');
  // ---- relief from the detail band
  const fine = blur(L, n, 1), coarse = blur(L, n, n >> 5), band = new Float32Array(n * n);
  let ss = 0;
  for (let i = 0; i < band.length; i++) { band[i] = fine[i] - coarse[i]; ss += band[i] * band[i]; }
  const sigma = Math.sqrt(ss / band.length) || 1e-6;
  const hgt = new Float32Array(n * n);
  for (let i = 0; i < hgt.length; i++) hgt[i] = 0.5 + 0.5 * Math.tanh(band[i] / (2 * sigma));
  if (sigma < 1.5) notes.push('The picture has very little fine detail (a smooth surface): the normal map is nearly flat.');
  // ---- normal map (OpenGL: +Y is up the tile, the picture's rows bottom-up)
  const S = 4 * bump, nx = new Float32Array(n * n), ny = new Float32Array(n * n), nz = new Float32Array(n * n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const xm = (x + n - 1) % n, xp = (x + 1) % n, ym = (y + n - 1) % n, yp = (y + 1) % n;
    const dx = (hgt[y * n + xp] - hgt[y * n + xm]) * 0.5, dy = (hgt[ym * n + x] - hgt[yp * n + x]) * 0.5;   // rows top-down here: y up the tile is y − 1
    const vx = -dx * S, vy = -dy * S, l = Math.hypot(vx, vy, 1), o = y * n + x;
    nx[o] = (vx / l * 0.5 + 0.5) * 255; ny[o] = (vy / l * 0.5 + 0.5) * 255; nz[o] = (1 / l * 0.5 + 0.5) * 255;
  }
  // ---- roughness: the base value, rougher in the pits
  const rough = new Float32Array(n * n);
  for (let i = 0; i < rough.length; i++) rough[i] = clamp(base + 0.35 * (0.5 - hgt[i]), 0.05, 1);
  const rs = blur(rough, n, 1);
  const rg = new Float32Array(n * n);
  for (let i = 0; i < rg.length; i++) rg[i] = rs[i] * 255;
  const mc = planes.map(mean);
  notes.push('Roughness is an estimate: ' + base.toFixed(2) + ' from your choice, rougher in the pits the photo shows. A photo cannot tell polished from matt: say so with roughness.');
  return {
    color: toImage(planes[0], planes[1], planes[2], n),
    roughness: toImage(rg, rg, rg, n),
    normal: toImage(nx, ny, nz, n),
    stats: { size: n, source: { w: photo.w, h: photo.h }, crop: crop.map((v) => Math.round(v * 1000) / 1000), seam: { before: Math.round(before * 100) / 100, after: Math.round(after * 100) / 100 }, meanColor: '#' + hex(mc[0]) + hex(mc[1]) + hex(mc[2]), heightSigma: Math.round(sigma * 100) / 100, roughnessMean: Math.round(mean(rs) * 1000) / 1000 },
    notes,
  };
}
