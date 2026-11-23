/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ifc-raster.mjs: pictures of an IFC model with no window and no graphics card (FX.377, GH.6 ask 4; session assistant-11).
 * Node built-ins only (zlib for the PNG), written from the PNG specification; nothing is loaded from the network.
 *
 *   svgToPng(svgText, { pxPerMm = 4 })              -> { bytes, width, height }   the plan SVG of plan-export.js (planSvg), drawn as it is:
 *                                                      filled and stroked paths (M L Z), dashes, rectangles. LETTERING IS NOT DRAWN (no font here).
 *   renderPng(triangles, { view, width, height })    -> { bytes, width, height, triangles, view }   a flat-shaded orthographic picture (z-buffer,
 *                                                      one light, two-sided) of the triangles ifc-mesh.mjs gives. It is a picture to check an edit by
 *                                                      eye, not BimCraft's render: no shadows, materials, textures, sky or anti-aliased edges beyond a 2x smoothing.
 */
import zlib from 'node:zlib';

// ---- PNG ----
let CRC = null;
function crc32(b) {
  if (!CRC) { CRC = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; CRC[n] = c >>> 0; } }
  let c = 0xffffffff;
  for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0); out.write(type, 4, 'ascii'); Buffer.from(data.buffer, data.byteOffset, data.length).copy(out, 8);
  out.writeUInt32BE(crc32(out.subarray(4, 8 + data.length)), 8 + data.length);
  return out;
}
/** RGB (3 bytes a pixel) -> PNG bytes. */
export function encodePng(rgb, w, h) {
  const raw = Buffer.alloc((w * 3 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 3 + 1)] = 0; Buffer.from(rgb.buffer, rgb.byteOffset + y * w * 3, w * 3).copy(raw, y * (w * 3 + 1) + 1); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return new Uint8Array(Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 6 })), chunk('IEND', Buffer.alloc(0))]));
}

/** A w*h RGB canvas drawn at `ss` times its size, then averaged down. */
class Canvas {
  constructor(w, h, ss) { this.w = w; this.h = h; this.ss = ss; this.W = w * ss; this.H = h * ss; this.px = new Uint8Array(this.W * this.H * 3).fill(255); }
  /** Even-odd fill of one polygon [[x, y]...] in canvas pixels (before the ss factor). */
  fill(poly, rgb) {
    const s = this.ss, n = poly.length;
    if (n < 3) return;
    let y0 = Infinity, y1 = -Infinity;
    for (const p of poly) { y0 = Math.min(y0, p[1] * s); y1 = Math.max(y1, p[1] * s); }
    y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(this.H - 1, Math.ceil(y1));
    for (let y = y0; y <= y1; y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < n; i++) {
        const a = poly[i], b = poly[(i + 1) % n], ay = a[1] * s, by = b[1] * s;
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(a[0] * s + (yc - ay) / (by - ay) * (b[0] - a[0]) * s);
      }
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const xa = Math.max(0, Math.round(xs[k])), xb = Math.min(this.W, Math.round(xs[k + 1]));
        for (let x = xa; x < xb; x++) { const o = (y * this.W + x) * 3; this.px[o] = rgb[0]; this.px[o + 1] = rgb[1]; this.px[o + 2] = rgb[2]; }
      }
    }
  }
  /** A stroked segment of width `wd` (canvas pixels): a rectangle with square caps. */
  seg(a, b, wd, rgb) {
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1e-9, h = Math.max(wd, 1 / this.ss) / 2;
    const ux = dx / l * h, uy = dy / l * h;
    this.fill([[a[0] - ux - uy, a[1] - uy + ux], [b[0] + ux - uy, b[1] + uy + ux], [b[0] + ux + uy, b[1] + uy - ux], [a[0] - ux + uy, a[1] - uy - ux]], rgb);
  }
  down() {
    const { w, h, ss, W } = this, out = new Uint8Array(w * h * 3), q = ss * ss;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) {
      let t = 0;
      for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) t += this.px[((y * ss + j) * W + x * ss + i) * 3 + c];
      out[(y * w + x) * 3 + c] = Math.round(t / q);
    }
    return out;
  }
}

const colour = (c, dflt) => {
  if (!c || c === 'none') return null;
  if (/^#[0-9a-f]{3}$/i.test(c)) c = '#' + [...c.slice(1)].map((x) => x + x).join('');
  const m = /^#([0-9a-f]{6})$/i.exec(c);
  return m ? [parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16)] : dflt;
};
const attr = (tag, name) => { const m = new RegExp('\\s' + name + '="([^"]*)"').exec(tag); return m ? m[1] : null; };

/** The plan SVG (plan-export.js planSvg, paper millimetres, y down) as a PNG. */
export function svgToPng(svg, { pxPerMm = 4, maxPixels = 40e6 } = {}) {
  const head = /<svg[^>]*>/.exec(svg)?.[0] || '';
  const vb = (attr(head, 'viewBox') || '').split(/\s+/).map(Number);
  if (vb.length !== 4 || !(vb[2] > 0) || !(vb[3] > 0)) throw new Error('The picture is not an SVG this tool draws (no viewBox).');
  let k = pxPerMm;
  if (vb[2] * k * vb[3] * k > maxPixels) k = Math.sqrt(maxPixels / (vb[2] * vb[3]));
  const w = Math.max(1, Math.round(vb[2] * k)), h = Math.max(1, Math.round(vb[3] * k));
  const cv = new Canvas(w, h, 3);
  const P = (x, y) => [(x - vb[0]) * k, (y - vb[1]) * k];
  for (const m of svg.matchAll(/<(rect|path)\b[^>]*>/g)) {
    const tag = m[0], fill = colour(attr(tag, 'fill'), [0, 0, 0]), stroke = colour(attr(tag, 'stroke'), [0, 0, 0]);
    const sw = (parseFloat(attr(tag, 'stroke-width')) || 1) * k, dash = (attr(tag, 'stroke-dasharray') || '').split(/\s+/).map(Number).filter((v) => v > 0).map((v) => v * k);
    const subs = [];
    if (m[1] === 'rect') {
      const x = +attr(tag, 'x') || 0, y = +attr(tag, 'y') || 0, rw = +attr(tag, 'width'), rh = +attr(tag, 'height');
      subs.push({ pts: [P(x, y), P(x + rw, y), P(x + rw, y + rh), P(x, y + rh)], closed: true });
    } else {
      let cur = null;
      for (const t of (attr(tag, 'd') || '').matchAll(/([MLZ])\s*(-?[\d.]+)?[\s,]*(-?[\d.]+)?/g)) {
        if (t[1] === 'M') { cur = { pts: [P(+t[2], +t[3])], closed: false }; subs.push(cur); }
        else if (t[1] === 'L' && cur) cur.pts.push(P(+t[2], +t[3]));
        else if (t[1] === 'Z' && cur) cur.closed = true;
      }
    }
    for (const s of subs) if (fill && s.closed) cv.fill(s.pts, fill);
    if (stroke) for (const s of subs) {
      const pts = s.closed ? [...s.pts, s.pts[0]] : s.pts;
      for (let i = 0; i + 1 < pts.length; i++) {
        if (!dash.length) { cv.seg(pts[i], pts[i + 1], sw, stroke); continue; }
        const l = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
        let d = 0, di = 0;
        while (d < l) {
          const len = dash[di % dash.length], e = Math.min(l, d + len);
          if (di % 2 === 0) cv.seg([pts[i][0] + (pts[i + 1][0] - pts[i][0]) * d / l, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * d / l], [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * e / l, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * e / l], sw, stroke);
          d = e; di++;
        }
      }
    }
  }
  return { bytes: encodePng(cv.down(), w, h), width: w, height: h };
}

// ---- the 3D picture ----
const PALETTE = [
  [/wall|curtain/i, [0.86, 0.85, 0.8]], [/slab|floor|covering/i, [0.7, 0.7, 0.73]], [/door/i, [0.55, 0.38, 0.22]], [/window/i, [0.55, 0.75, 0.92]],
  [/roof/i, [0.72, 0.36, 0.3]], [/column|beam|member/i, [0.6, 0.6, 0.66]], [/stair|ramp|railing/i, [0.75, 0.68, 0.55]],
];
const plain = (c) => c[0] > 0.99 && c[1] > 0.99 && c[2] > 0.99;
export const VIEWS = { iso: [1, 0.8, 1], top: [0, 1, 0.0001], front: [0, 0, 1], back: [0, 0, -1], left: [-1, 0, 0], right: [1, 0, 0] };
const norm = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

/** triangles: [{ cls, color: [r,g,b,a], tri: Float32Array(9n) }] in scene metres, Y up. */
export function renderPng(triangles, { view = 'iso', width = 1200, height = 800 } = {}) {
  const dir = VIEWS[view];
  if (!dir) throw new Error('Unknown view "' + view + '". Views: ' + Object.keys(VIEWS).join(', ') + '.');
  const list = triangles.filter((t) => !/^IfcSpace$/i.test(t.cls));
  let n = 0;
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (const t of list) for (let i = 0; i < t.tri.length; i += 3) for (let a = 0; a < 3; a++) { mn[a] = Math.min(mn[a], t.tri[i + a]); mx[a] = Math.max(mx[a], t.tri[i + a]); n++; }
  if (!n) throw new Error('The model has no geometry the engine could mesh, so there is nothing to draw.');
  const ctr = mn.map((v, i) => (v + mx[i]) / 2), fwd = norm(dir.map((v) => -v));
  const right = norm(cross(fwd, [0, 1, 0])), up = cross(right, fwd);
  const proj = (p) => { const q = [p[0] - ctr[0], p[1] - ctr[1], p[2] - ctr[2]]; return [dot(q, right), dot(q, up), dot(q, fwd)]; };
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (const t of list) for (let i = 0; i < t.tri.length; i += 3) { const p = proj([t.tri[i], t.tri[i + 1], t.tri[i + 2]]); x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  const ss = 2, W = width * ss, H = height * ss, margin = 0.06 * Math.min(W, H);
  const sc = Math.min((W - 2 * margin) / Math.max(1e-9, x1 - x0), (H - 2 * margin) / Math.max(1e-9, y1 - y0));
  const ox = (W - sc * (x1 - x0)) / 2 - x0 * sc, oy = (H - sc * (y1 - y0)) / 2 + y1 * sc;
  const px = new Uint8Array(W * H * 3).fill(255), zb = new Float32Array(W * H).fill(Infinity);
  const L = norm([-0.35, 0.85, 0.4]);
  let drawn = 0;
  for (const t of list) {
    const base = plain(t.color) ? (PALETTE.find(([re]) => re.test(t.cls))?.[1] || [0.78, 0.78, 0.8]) : t.color;
    for (let i = 0; i < t.tri.length; i += 9) {
      const A = [t.tri[i], t.tri[i + 1], t.tri[i + 2]], B = [t.tri[i + 3], t.tri[i + 4], t.tri[i + 5]], C = [t.tri[i + 6], t.tri[i + 7], t.tri[i + 8]];
      let nn = norm(cross([B[0] - A[0], B[1] - A[1], B[2] - A[2]], [C[0] - A[0], C[1] - A[1], C[2] - A[2]]));
      if (dot(nn, fwd) > 0) nn = nn.map((v) => -v);
      const lit = 0.38 + 0.62 * Math.max(0, dot(nn, L)), rgb = [0, 1, 2].map((c) => Math.round(255 * Math.min(1, base[c] * lit)));
      const a = proj(A), b = proj(B), c = proj(C);
      const sx = [a, b, c].map((p) => p[0] * sc + ox), sy = [a, b, c].map((p) => oy - p[1] * sc), sz = [a[2], b[2], c[2]];
      const ar = (sx[1] - sx[0]) * (sy[2] - sy[0]) - (sx[2] - sx[0]) * (sy[1] - sy[0]);
      if (Math.abs(ar) < 1e-9) continue;
      const bx0 = Math.max(0, Math.floor(Math.min(...sx))), bx1 = Math.min(W - 1, Math.ceil(Math.max(...sx))), by0 = Math.max(0, Math.floor(Math.min(...sy))), by1 = Math.min(H - 1, Math.ceil(Math.max(...sy)));
      for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
        const xc = x + 0.5, yc = y + 0.5;
        const w0 = ((sx[1] - xc) * (sy[2] - yc) - (sx[2] - xc) * (sy[1] - yc)) / ar, w1 = ((sx[2] - xc) * (sy[0] - yc) - (sx[0] - xc) * (sy[2] - yc)) / ar, w2 = 1 - w0 - w1;
        if (w0 < -1e-6 || w1 < -1e-6 || w2 < -1e-6) continue;
        const z = w0 * sz[0] + w1 * sz[1] + w2 * sz[2], o = y * W + x;
        if (z >= zb[o]) continue;
        zb[o] = z; px[o * 3] = rgb[0]; px[o * 3 + 1] = rgb[1]; px[o * 3 + 2] = rgb[2];
      }
      drawn++;
    }
  }
  const out = new Uint8Array(width * height * 3);
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) for (let c = 0; c < 3; c++) {
    let s = 0;
    for (let j = 0; j < ss; j++) for (let i = 0; i < ss; i++) s += px[((y * ss + j) * W + x * ss + i) * 3 + c];
    out[(y * width + x) * 3 + c] = Math.round(s / (ss * ss));
  }
  return { bytes: encodePng(out, width, height), width, height, triangles: drawn, view };
}
