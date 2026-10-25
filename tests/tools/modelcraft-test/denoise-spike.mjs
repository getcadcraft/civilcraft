#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * denoise-spike.mjs — RN.5's spike (docs/spikes/RN.5-denoiser.md): the Apache-2.0 Open Image Denoise network (its published
 * weights, our own inference) against an own edge-avoiding à-trous filter, on the path tracer's own pictures. Renders the
 * reference scenes tiny with the JS reference (noisy and long), runs both denoisers in plain JS (f32), prints the error against
 * the long render (relative MSE on the linear picture, and RMSE of the display bytes) and the time each took.
 *
 *   node tools/modelcraft-test/denoise-spike.mjs [--weights <file.tza>] [--size 64] [--spp 4] [--ref 256] [--scene room,…]
 *
 * The weights stay outside every repo for the spike (refs/oidn-weights, from RenderKit/oidn-weights, Apache-2.0).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(REPO, 'public_html/assets/apps/modelcraft/dev');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SIZE = Number(arg('--size', 64)), SPP = Number(arg('--spp', 4)), REF = Number(arg('--ref', 256));
const WEIGHTS = arg('--weights', '/var/www/CADCRAFT/refs/oidn-weights/rt_hdr_alb_nrm_small.tza');
const SCENES_LIST = arg('--scene', 'room,lamps,daylight').split(',');

const SC = await import(path.join(REPO, 'tools/modelcraft-test/pt-scenes.mjs'));
const PK = await import(path.join(APP, 'render/pt-pack.js'));
const RF = await import(path.join(APP, 'render/pt-ref.js'));
const SP = await import(path.join(APP, 'render/pt-sampler.js'));
const PS = await import(path.join(APP, 'render/pt-spec.js'));
const { halfToFloat } = await import(path.join(APP, 'exr/util.js'));

// ---- TZA (OIDN's weights container): magic 0x41D7, version 2, a table of named tensors (oihw weights, x biases), f16/f32 ----
function readTza(buf) {
  const b = new Uint8Array(buf), v = new DataView(b.buffer, b.byteOffset, b.length), T = {};
  if (v.getUint16(0, true) !== 0x41d7 || b[2] !== 2) throw new Error('not a TZA v2 blob');
  let o = Number(v.getBigUint64(4, true));
  const n = v.getUint32(o, true); o += 4;
  for (let i = 0; i < n; i++) {
    const nl = v.getUint16(o, true); o += 2;
    const name = new TextDecoder().decode(b.subarray(o, o + nl)); o += nl;
    const nd = b[o]; o += 1;
    const dims = []; for (let j = 0; j < nd; j++) { dims.push(v.getUint32(o, true)); o += 4; }
    o += nd;   // layout
    const dt = String.fromCharCode(b[o]); o += 1;
    const off = Number(v.getBigUint64(o, true)); o += 8;
    const count = dims.reduce((a, x) => a * x, 1), data = new Float32Array(count);
    for (let k = 0; k < count; k++) data[k] = dt === 'h' ? halfToFloat(v.getUint16(off + k * 2, true)) : v.getFloat32(off + k * 4, true);
    T[name] = { dims, data };
  }
  return T;
}

// ---- the network: 3 × 3 convolutions (zero padding) + ReLU, 2 × 2 max pools, nearest 2 × upsampling, concatenation ----
const tensor = (c, h, w) => ({ c, h, w, d: new Float32Array(c * h * w) });
function conv(x, W, B, relu = true) {
  const [O, I] = W.dims, y = tensor(O, x.h, x.w), H = x.h, Wd = x.w, wd = W.data, bd = B.data, xd = x.d, yd = y.d;
  if (I !== x.c) throw new Error('conv: ' + I + ' inputs, got ' + x.c);
  for (let o = 0; o < O; o++) {
    const yo = o * H * Wd;
    yd.fill(bd[o], yo, yo + H * Wd);
    for (let i = 0; i < I; i++) {
      const xi = i * H * Wd, wo = (o * I + i) * 9;
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 3; kx++) {
        const k = wd[wo + ky * 3 + kx];
        if (k === 0) continue;
        const dy = ky - 1, dx = kx - 1, y0 = Math.max(0, -dy), y1 = Math.min(H, H - dy), x0 = Math.max(0, -dx), x1 = Math.min(Wd, Wd - dx);
        for (let yy = y0; yy < y1; yy++) {
          const row = yo + yy * Wd, src = xi + (yy + dy) * Wd + dx;
          for (let xx = x0; xx < x1; xx++) yd[row + xx] += k * xd[src + xx];
        }
      }
    }
    if (relu) for (let p = yo; p < yo + H * Wd; p++) if (yd[p] < 0) yd[p] = 0;
  }
  return y;
}
function pool(x) {
  const y = tensor(x.c, x.h >> 1, x.w >> 1);
  for (let c = 0; c < x.c; c++) for (let yy = 0; yy < y.h; yy++) for (let xx = 0; xx < y.w; xx++) {
    const s = c * x.h * x.w + yy * 2 * x.w + xx * 2;
    y.d[c * y.h * y.w + yy * y.w + xx] = Math.max(x.d[s], x.d[s + 1], x.d[s + x.w], x.d[s + x.w + 1]);
  }
  return y;
}
function upConcat(x, skip) {
  const y = tensor(x.c + skip.c, skip.h, skip.w);
  for (let c = 0; c < x.c; c++) for (let yy = 0; yy < skip.h; yy++) for (let xx = 0; xx < skip.w; xx++) y.d[c * skip.h * skip.w + yy * skip.w + xx] = x.d[c * x.h * x.w + (yy >> 1) * x.w + (xx >> 1)];
  y.d.set(skip.d, x.c * skip.h * skip.w);
  return y;
}
function unet(T, inp) {
  const C = (name, x) => conv(x, T[name + '.weight'], T[name + '.bias']);
  let x = C('enc_conv0', inp);
  const p1 = x = pool(C('enc_conv1', x));
  const p2 = x = pool(C('enc_conv2', x));
  const p3 = x = pool(C('enc_conv3', x));
  const p4 = pool(C('enc_conv4', x));
  x = C('enc_conv5b', C('enc_conv5a', p4));
  x = C('dec_conv4b', C('dec_conv4a', upConcat(x, p3)));
  x = C('dec_conv3b', C('dec_conv3a', upConcat(x, p2)));
  x = C('dec_conv2b', C('dec_conv2a', upConcat(x, p1)));
  x = C('dec_conv1b', C('dec_conv1a', upConcat(x, inp)));
  return C('dec_conv0', x);
}
// HDR input: the PU curve (OIDN core/color.h constants), normalised so 65504 → 1; auto-exposure = key 0.18 / the log-average
// luminance of 16 × 16 bins
const PU = { a: 1.41283765e+03, b: 1.64593172e+00, c: 4.31384981e-01, d: -2.94139609e-03, e: 1.92653254e-01, f: 6.26026094e-03, g: 9.98620152e-01, y0: 1.57945760e-06, y1: 3.22087631e-02, x0: 2.23151711e-03, x1: 3.70974749e-01 };
const puF = (y) => (y <= PU.y0 ? PU.a * y : y <= PU.y1 ? PU.b * Math.pow(y, PU.c) + PU.d : PU.e * Math.log(y + PU.f) + PU.g);
const puI = (x) => (x <= PU.x0 ? x / PU.a : x <= PU.x1 ? Math.pow((x - PU.d) / PU.b, 1 / PU.c) : Math.exp((x - PU.g) / PU.e) - PU.f);
const NORM = 1 / puF(65504);
function autoexposure(rgb, w, h) {
  const nbH = Math.ceil(h / 16), nbW = Math.ceil(w / 16);
  let s = 0, n = 0;
  for (let i = 0; i < nbH; i++) for (let j = 0; j < nbW; j++) {
    const h0 = Math.floor((i * h) / nbH), h1 = Math.floor(((i + 1) * h) / nbH), w0 = Math.floor((j * w) / nbW), w1 = Math.floor(((j + 1) * w) / nbW);
    let L = 0;
    for (let y = h0; y < h1; y++) for (let x = w0; x < w1; x++) { const o = (y * w + x) * 3; L += 0.212671 * rgb[o] + 0.71516 * rgb[o + 1] + 0.072169 * rgb[o + 2]; }
    L /= (h1 - h0) * (w1 - w0);
    if (L > 1e-8) { s += Math.log2(L); n++; }
  }
  return n ? 0.18 / Math.pow(2, s / n) : 1;
}
function oidn(T, rgb, alb, nrm, w, h) {
  // pad to a multiple of 16 (four pools) with zeros, as OIDN pads its tiles
  const W16 = Math.ceil(w / 16) * 16, H16 = Math.ceil(h / 16) * 16, inp = tensor(9, H16, W16), sc = autoexposure(rgb, w, h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const o = (y * w + x) * 3, p = y * W16 + x, N = H16 * W16;
    for (let k = 0; k < 3; k++) {
      inp.d[k * N + p] = puF(Math.max(0, rgb[o + k] * sc)) * NORM;
      inp.d[(3 + k) * N + p] = Math.min(1, Math.max(0, alb[o + k]));
      inp.d[(6 + k) * N + p] = Math.min(1, Math.max(-1, nrm[o + k])) * 0.5 + 0.5;
    }
  }
  const out = unet(T, inp), res = new Float32Array(w * h * 3), N = H16 * W16;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let k = 0; k < 3; k++) res[(y * w + x) * 3 + k] = puI(Math.max(0, out.d[k * N + y * W16 + x]) / NORM) / sc;
  return res;
}

// ---- the own filter: edge-avoiding à-trous (B3 spline, 5 levels) on the irradiance (colour ÷ albedo), guided by normal, depth,
// albedo and the colour itself; the albedo multiplied back afterwards ----
function atrous(rgb, alb, nrm, dep, w, h, { levels = 5, sc = 4, sn = 64, sd = 1, sa = 0.3 } = {}) {
  const k = [1 / 16, 1 / 4, 3 / 8, 1 / 4, 1 / 16];
  let src = new Float32Array(rgb.length);
  for (let i = 0; i < w * h; i++) for (let c = 0; c < 3; c++) src[i * 3 + c] = rgb[i * 3 + c] / Math.max(0.01, alb[i * 3 + c]);
  const dst = new Float32Array(src.length);
  for (let lv = 0; lv < levels; lv++) {
    const step = 1 << lv;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, ci = [src[i * 3], src[i * 3 + 1], src[i * 3 + 2]], li = 0.2126 * ci[0] + 0.7152 * ci[1] + 0.0722 * ci[2];
      let s0 = 0, s1 = 0, s2 = 0, ws = 0;
      for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
        const xx = x + dx * step, yy = y + dy * step;
        if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx;
        const nd = nrm[i * 3] * nrm[j * 3] + nrm[i * 3 + 1] * nrm[j * 3 + 1] + nrm[i * 3 + 2] * nrm[j * 3 + 2];
        const ni = nrm[i * 3] ** 2 + nrm[i * 3 + 1] ** 2 + nrm[i * 3 + 2] ** 2, nj = nrm[j * 3] ** 2 + nrm[j * 3 + 1] ** 2 + nrm[j * 3 + 2] ** 2;
        const wn = ni > 0.01 && nj > 0.01 ? Math.pow(Math.max(0, nd / Math.sqrt(ni * nj)), sn) : ni > 0.01 || nj > 0.01 ? 0 : 1;   // no surface: the sky (no normal) only with the sky
        const wd = Math.exp(-Math.abs(dep[i] - dep[j]) / (sd * (Math.abs(dx) + Math.abs(dy)) * step * 0.02 * Math.max(0.1, dep[i]) + 1e-4));
        const da = Math.hypot(alb[i * 3] - alb[j * 3], alb[i * 3 + 1] - alb[j * 3 + 1], alb[i * 3 + 2] - alb[j * 3 + 2]), wa = Math.exp(-da / sa);
        const lj = 0.2126 * src[j * 3] + 0.7152 * src[j * 3 + 1] + 0.0722 * src[j * 3 + 2], wl = Math.exp(-Math.abs(li - lj) / (sc * Math.sqrt(Math.max(1e-4, li)) + 1e-4));
        const wt = k[dy + 2] * k[dx + 2] * wn * wd * wa * wl;
        s0 += src[j * 3] * wt; s1 += src[j * 3 + 1] * wt; s2 += src[j * 3 + 2] * wt; ws += wt;
      }
      if (ws > 0) { dst[i * 3] = s0 / ws; dst[i * 3 + 1] = s1 / ws; dst[i * 3 + 2] = s2 / ws; } else { dst[i * 3] = ci[0]; dst[i * 3 + 1] = ci[1]; dst[i * 3 + 2] = ci[2]; }
    }
    src.set(dst);
  }
  for (let i = 0; i < w * h; i++) for (let c = 0; c < 3; c++) src[i * 3 + c] *= Math.max(0.01, alb[i * 3 + c]);
  return src;
}

// ---- errors ----
function relMSE(a, ref) { let s = 0; for (let i = 0; i < a.length; i++) { const d = a[i] - ref[i]; s += (d * d) / (ref[i] * ref[i] + 1e-2); } return s / a.length; }
function rmseBytes(a, ref, w, h) {
  let s = 0;
  for (let i = 0; i < w * h; i++) { const p = PS.displayPixel([a[i * 3], a[i * 3 + 1], a[i * 3 + 2]], 0), q = PS.displayPixel([ref[i * 3], ref[i * 3 + 1], ref[i * 3 + 2]], 0); for (let k = 0; k < 3; k++) s += (p[k] - q[k]) ** 2; }
  return Math.sqrt(s / (w * h * 3));
}

const T = readTza(fs.readFileSync(WEIGHTS));
const MASK = SP.blueNoise();
const rows = [];
for (const name of SCENES_LIST) {
  const d = SC.SCENES[name]();
  const pk = SC.applyPatches(PK.packScene(SC.shimScene(d), { ...d.settings, mode: 'hq', elements: true }, { w: SIZE, h: SIZE }), d, PK.finishRecord);
  const tr = RF.makeTracer(pk, { mask: MASK });
  const means = (acc) => {
    const n = SIZE * SIZE, S = pk.auxStride, rgb = new Float32Array(n * 3), alb = new Float32Array(n * 3), nrm = new Float32Array(n * 3), dep = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const c = acc[i * 4 + 3] || 1, g = acc.aux[(i * S) * 4 + 3] || 1;
      for (let k = 0; k < 3; k++) { rgb[i * 3 + k] = acc[i * 4 + k] / c; alb[i * 3 + k] = acc.aux[(i * S) * 4 + k] / g; nrm[i * 3 + k] = acc.aux[(i * S + 1) * 4 + k] / g; }
      dep[i] = acc.aux[(i * S + 1) * 4 + 3] / g;
    }
    return { rgb, alb, nrm, dep };
  };
  const t0 = Date.now(), ref = means(tr.render({ spp: REF, s0: 1000 })), tRef = Date.now() - t0;
  const noisy = means(tr.render({ spp: SPP }));
  const t1 = Date.now(), dn = oidn(T, noisy.rgb, noisy.alb, noisy.nrm, SIZE, SIZE), tN = Date.now() - t1;
  const t2 = Date.now(), at = atrous(noisy.rgb, noisy.alb, noisy.nrm, noisy.dep, SIZE, SIZE), tA = Date.now() - t2;
  const r = { scene: name, noisy: [relMSE(noisy.rgb, ref.rgb), rmseBytes(noisy.rgb, ref.rgb, SIZE, SIZE)], network: [relMSE(dn, ref.rgb), rmseBytes(dn, ref.rgb, SIZE, SIZE), tN], atrous: [relMSE(at, ref.rgb), rmseBytes(at, ref.rgb, SIZE, SIZE), tA], refMs: tRef };
  rows.push(r);
  console.log(name.padEnd(9), 'noisy relMSE ' + r.noisy[0].toFixed(4) + ' rmse ' + r.noisy[1].toFixed(1), '| network ' + r.network[0].toFixed(4) + ' / ' + r.network[1].toFixed(1) + ' (' + tN + ' ms)', '| à-trous ' + r.atrous[0].toFixed(4) + ' / ' + r.atrous[1].toFixed(1) + ' (' + tA + ' ms)');
  if (process.argv.includes('--keep')) {
    const out = path.join(REPO, 'tmp/shots/denoise-spike'); fs.mkdirSync(out, { recursive: true });
    fs.writeFileSync(path.join(out, name + '.json'), JSON.stringify({ size: SIZE, noisy: Array.from(noisy.rgb), network: Array.from(dn), atrous: Array.from(at), ref: Array.from(ref.rgb) }));
  }
}
console.log(JSON.stringify({ size: SIZE, spp: SPP, ref: REF, weights: path.basename(WEIGHTS), rows }));
