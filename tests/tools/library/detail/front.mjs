#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * front.mjs — a front elevation (looking from the plan's front, −Y, towards +Y) of a library item's mesh body, as a PNG line-and-tone mask for the
 * browse cards (2026-11-03: "a front facing view of the object"). The PNG is grey+alpha: only the alpha channel carries the drawing, so the card paints
 * it with CSS mask-image in the page's own ink colour, light or dark.
 *
 *   node tools/library/detail/front.mjs <items-dir> <out-dir> [--only names.txt]     every *.item.json with a mesh body → <out-dir>/<slug>.png
 *
 * Depth-buffered: hidden edges are not drawn. Lines come from depth jumps, the silhouette and crease angles over 24°; flat tone from the face angle.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const OUT_W = 480, OUT_H = 360, SS = 3, W = OUT_W * SS, H = OUT_H * SS, PAD = 0.07;

function crc(buf) { let c, crcv = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crcv ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crcv = (crcv >>> 8) ^ c; } return (crcv ^ 0xffffffff) >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([len, td, c]); }
// CRC table version (the loop above is too slow for many files)
const TBL = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; TBL[n] = c >>> 0; }
function crcFast(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = TBL[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunkFast(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const c = Buffer.alloc(4); c.writeUInt32BE(crcFast(td)); return Buffer.concat([len, td, c]); }
function pngGA(w, h, ga) {
  const raw = Buffer.alloc((w * 2 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 2 + 1)] = 0; ga.copy(raw, y * (w * 2 + 1) + 1, y * w * 2, (y + 1) * w * 2); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 4;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunkFast('IHDR', ihdr), chunkFast('IDAT', zlib.deflateSync(raw, { level: 9 })), chunkFast('IEND', Buffer.alloc(0))]);
}

export function frontPng(item) {
  const b = item.body;
  if (!b || b.type !== 'mesh') return null;
  const P = b.positions, I = b.indices, nT = I.length / 3;
  let x0 = 1e18, x1 = -1e18, z0 = 1e18, z1 = -1e18, y0 = 1e18, y1 = -1e18;
  for (let i = 0; i < P.length; i += 3) { x0 = Math.min(x0, P[i]); x1 = Math.max(x1, P[i]); y0 = Math.min(y0, P[i + 1]); y1 = Math.max(y1, P[i + 1]); z0 = Math.min(z0, P[i + 2]); z1 = Math.max(z1, P[i + 2]); }
  const bw = x1 - x0 || 1, bh = z1 - z0 || 1, sc = Math.min((W * (1 - 2 * PAD)) / bw, (H * (1 - 2 * PAD)) / bh), ox = (W - bw * sc) / 2 - x0 * sc, oz = (H + bh * sc) / 2 + z0 * sc;
  const depth = new Float32Array(W * H).fill(1e30), nid = new Int32Array(W * H).fill(-1);
  const nx = new Float32Array(nT), ny = new Float32Array(nT), nz = new Float32Array(nT);
  const sx = (x) => x * sc + ox, sz = (z) => oz - z * sc;
  for (let t = 0; t < nT; t++) {
    const a = I[t * 3] * 3, b2 = I[t * 3 + 1] * 3, c = I[t * 3 + 2] * 3;
    const ax = P[a], ay = P[a + 1], az = P[a + 2], bx = P[b2], by = P[b2 + 1], bz = P[b2 + 2], cx = P[c], cy = P[c + 1], cz = P[c + 2];
    let ex = bx - ax, ey = by - ay, ez = bz - az, fx = cx - ax, fy = cy - ay, fz = cz - az;
    let tx = ey * fz - ez * fy, ty = ez * fx - ex * fz, tz = ex * fy - ey * fx; const l = Math.hypot(tx, ty, tz) || 1; tx /= l; ty /= l; tz /= l;
    if (ty > 0) { tx = -tx; ty = -ty; tz = -tz; }   // two-sided: the normal always faces the viewer (−Y)
    nx[t] = tx; ny[t] = ty; nz[t] = tz;
    const X0 = sx(ax), Z0 = sz(az), X1 = sx(bx), Z1 = sz(bz), X2 = sx(cx), Z2 = sz(cz);
    const area = (X1 - X0) * (Z2 - Z0) - (X2 - X0) * (Z1 - Z0);
    if (Math.abs(area) < 1e-9) continue;
    const minX = Math.max(0, Math.floor(Math.min(X0, X1, X2))), maxX = Math.min(W - 1, Math.ceil(Math.max(X0, X1, X2))), minZ = Math.max(0, Math.floor(Math.min(Z0, Z1, Z2))), maxZ = Math.min(H - 1, Math.ceil(Math.max(Z0, Z1, Z2)));
    for (let py = minZ; py <= maxZ; py++) for (let px = minX; px <= maxX; px++) {
      const qx = px + 0.5, qz = py + 0.5;
      const w0 = ((X1 - qx) * (Z2 - qz) - (X2 - qx) * (Z1 - qz)) / area, w1 = ((X2 - qx) * (Z0 - qz) - (X0 - qx) * (Z2 - qz)) / area, w2 = 1 - w0 - w1;
      if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
      const d = w0 * ay + w1 * by + w2 * cy, k = py * W + px;
      if (d < depth[k]) { depth[k] = d; nid[k] = t; }
    }
  }
  const span = Math.max(bw, bh, y1 - y0) || 1, jump = span * 0.004, cosC = Math.cos((40 * Math.PI) / 180);
  const ga = Buffer.alloc(W * H * 2);
  const edge = new Uint8Array(W * H), tone = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const k = y * W + x, t = nid[k];
    if (t < 0) continue;
    const lit = Math.max(0, -nx[t] * 0.35 + nz[t] * 0.55 - ny[t] * 0.25);
    tone[k] = Math.round(18 + 40 * lit);
    let e = 0;
    for (const [dx, dy] of [[1, 0], [0, 1], [-1, 0], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) { e = 1; break; }
      const k2 = yy * W + xx, t2 = nid[k2];
      if (t2 < 0) { e = 1; break; }
      if (t2 !== t) { if (Math.abs(depth[k2] - depth[k]) > jump) { if (depth[k] < depth[k2]) e = 1; } else if (nx[t] * nx[t2] + ny[t] * ny[t2] + nz[t] * nz[t2] < cosC) e = 1; }
    }
    edge[k] = e;
  }
  // thicken the line by one pixel, then box-filter SSxSS down to the output size
  const thick = new Uint8Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (edge[y * W + x]) { thick[y * W + x] = 1; if (x + 1 < W) thick[y * W + x + 1] = 1; if (y + 1 < H) thick[(y + 1) * W + x] = 1; }
  for (let y = 0; y < OUT_H; y++) for (let x = 0; x < OUT_W; x++) {
    let a = 0, tn = 0, cov = 0;
    for (let j = 0; j < SS; j++) for (let i = 0; i < SS; i++) { const k = (y * SS + j) * W + (x * SS + i); if (thick[k]) a += 255; if (nid[k] >= 0) { cov++; tn += tone[k]; } }
    const n = SS * SS, line = a / n, body = cov ? (tn / cov) * (cov / n) : 0;
    const alpha = Math.min(255, Math.round(Math.max(line * 0.92, body)));
    const o = (y * OUT_W + x) * 2; ga[o] = 0; ga[o + 1] = alpha;
  }
  return pngGA(OUT_W, OUT_H, ga);
}

if (process.argv[1] && process.argv[1].endsWith('front.mjs')) {
  const [dir, out] = process.argv.slice(2);
  const oi = process.argv.indexOf('--only');
  const only = oi >= 0 ? new Set(fs.readFileSync(process.argv[oi + 1], 'utf8').split('\n').filter(Boolean)) : null;
  fs.mkdirSync(out, { recursive: true });
  let n = 0, skipped = 0;
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.item.json')) continue;
    const slug = f.replace(/\.item\.json$/, '');
    if (only && !only.has(slug)) continue;
    const item = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    const png = frontPng(item);
    if (!png) { skipped++; continue; }
    fs.writeFileSync(path.join(out, slug + '.png'), png); n++;
  }
  console.log(`front: wrote ${n} PNG${n === 1 ? '' : 's'} to ${out}${skipped ? ` (${skipped} without a mesh body skipped)` : ''}`);
}
