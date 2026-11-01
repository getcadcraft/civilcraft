/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * modes.js — low-frequency room acoustics (0.8 XE.3 phase S6 first part, session ind_PART_4). DOM-free; lib/acoustics is canonical.
 *   boxModes(box, { fmax })        the standing waves of a rigid box: f = c/2 · √((nx/Lx)² + (ny/Ly)² + (nz/Lz)²), with kind axial / tangential / oblique
 *   schroederFrequency(T, V)       f_S = 2000 √(T / V) (Schroeder & Kuttruff 1962): below it the field is modes, not diffuse, and geometric methods (geo.js) do not apply
 *   modalGap(freqs)                the smallest gap between neighbouring modes below f (rooms with modes on top of each other boom)
 *   fdtdBox(box, source, listener, opts)   the wave equation on a regular grid (leap-frog, 7-point stencil, rigid walls), one pressure trace at the listener
 *                                          and its spectrum; a first-principles solver for small rooms and the check of the mode list.
 * The grid keeps the Courant number at 0.9/√3 of its limit; the grid spacing must be at least 6 cells per wavelength at the top frequency (the function says so).
 */
import { fft } from './acoustics-ir.js';
const C = 343;

export function boxModes({ lx, ly, lz }, { fmax = 200 } = {}) {
  const out = [], nmax = (l) => Math.floor(2 * l * fmax / C);
  for (let i = 0; i <= nmax(lx); i++) for (let j = 0; j <= nmax(ly); j++) for (let k = 0; k <= nmax(lz); k++) {
    if (!i && !j && !k) continue;
    const f = C / 2 * Math.hypot(i / lx, j / ly, k / lz);
    if (f <= fmax) out.push({ n: [i, j, k], f, kind: [i, j, k].filter(Boolean).length === 1 ? 'axial' : [i, j, k].filter(Boolean).length === 2 ? 'tangential' : 'oblique' });
  }
  return out.sort((a, b) => a.f - b.f);
}
export const schroederFrequency = (T, V) => 2000 * Math.sqrt(T / V);
export function modalGap(modes, fmax) {
  const f = modes.filter((m) => m.f <= fmax).map((m) => m.f);
  let g = Infinity;
  for (let i = 1; i < f.length; i++) g = Math.min(g, f[i] - f[i - 1]);
  return g;
}

/** FDTD of a rigid box. opts: h (m, default so that fmax has 8 cells per wavelength), fmax (Hz, default 150), seconds (default 3), damping (1/s energy loss, default 2). */
export function fdtdBox(box, source, listener, { fmax = 150, h = 0, seconds = 3, damping = 2 } = {}) {
  const hh = h || C / fmax / 8, nx = Math.max(3, Math.round(box.lx / hh)), ny = Math.max(3, Math.round(box.ly / hh)), nz = Math.max(3, Math.round(box.lz / hh));
  const dx = box.lx / nx, dy = box.ly / ny, dz = box.lz / nz, hmin = Math.min(dx, dy, dz);
  const perWave = C / fmax / Math.max(dx, dy, dz);
  const dt = 0.9 * hmin / (C * Math.sqrt(3)), steps = Math.ceil(seconds / dt), sr = 1 / dt;
  const N = nx * ny * nz, p0 = new Float32Array(N), p1 = new Float32Array(N), p2 = new Float32Array(N);
  let a = p0, b = p1, d = p2;                           // a = p(t−dt), b = p(t), d = p(t+dt)
  const id = (i, j, k) => (k * ny + j) * nx + i, cell = (pt) => [Math.min(nx - 1, Math.floor(pt[0] / dx)), Math.min(ny - 1, Math.floor(pt[1] / dy)), Math.min(nz - 1, Math.floor(pt[2] / dz))];
  const s = cell(source), l = cell(listener), si = id(...s), li = id(...l);
  const cx = (C * dt / dx) ** 2, cy = (C * dt / dy) ** 2, cz = (C * dt / dz) ** 2, damp = 1 - damping * dt;
  const trace = new Float32Array(steps), sig = 2 / (2 * Math.PI * fmax);
  for (let n = 0; n < steps; n++) {
    const t = n * dt, g = -(t - 4 * sig) / sig * Math.exp(-0.5 * ((t - 4 * sig) / sig) ** 2);   // a derivative-of-Gaussian pulse has no DC, so no field builds up in the closed box
    for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const q = id(i, j, k), c0 = b[q];
      // rigid walls on the cell faces: the missing neighbour has the cell's own pressure (zero gradient across the face)
      const xm = i > 0 ? b[q - 1] : c0, xp = i < nx - 1 ? b[q + 1] : c0;
      const ym = j > 0 ? b[q - nx] : c0, yp = j < ny - 1 ? b[q + nx] : c0;
      const zm = k > 0 ? b[q - nx * ny] : c0, zp = k < nz - 1 ? b[q + nx * ny] : c0;
      d[q] = damp * (2 * c0 - a[q]) + cx * (xm + xp - 2 * c0) + cy * (ym + yp - 2 * c0) + cz * (zm + zp - 2 * c0);
    }
    d[si] += g;
    trace[n] = d[li];
    const t0 = a; a = b; b = d; d = t0;
  }
  // spectrum of the trace
  let M = 1; while (M < steps) M <<= 1;
  const re = new Float64Array(M), im = new Float64Array(M);
  for (let n = 0; n < steps; n++) re[n] = trace[n] * 0.5 * (1 - Math.cos(2 * Math.PI * n / (steps - 1)));    // Hann window
  fft(re, im);
  const spec = new Float64Array(M / 2);
  for (let q = 0; q < M / 2; q++) spec[q] = Math.hypot(re[q], im[q]);
  return { sr, steps, cells: [nx, ny, nz], cellsPerWavelength: perWave, trace, spectrum: spec, df: sr / M, fmaxOk: perWave >= 6 };
}

/** Peaks of a spectrum (local maxima above `rel` of the largest) below fmax → [{ f, mag }]. */
export function spectrumPeaks(res, fmax, { rel = 0.05, fmin = 20 } = {}) {
  const s = res.spectrum, df = res.df, top = Math.min(s.length - 2, Math.floor(fmax / df));
  let mx = 0; for (let i = Math.floor(fmin / df); i <= top; i++) mx = Math.max(mx, s[i]);
  const out = [];
  for (let i = Math.max(1, Math.floor(fmin / df)); i <= top; i++) if (s[i] > s[i - 1] && s[i] >= s[i + 1] && s[i] > rel * mx) {
    const y0 = s[i - 1], y1 = s[i], y2 = s[i + 1], den = y0 - 2 * y1 + y2, off = den ? 0.5 * (y0 - y2) / den : 0;   // parabolic interpolation
    out.push({ f: (i + off) * df, mag: y1 });
  }
  return out;
}
