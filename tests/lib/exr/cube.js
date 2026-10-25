/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cube.js — .cube colour tables (LUTs), from Adobe's "Cube LUT Specification" version 1.0 (2013): text lines,
 * `#` comments, keywords before the data — TITLE "…", LUT_1D_SIZE n (2–65536) and/or LUT_3D_SIZE n (2–256),
 * DOMAIN_MIN r g b, DOMAIN_MAX r g b — then one "r g b" row per entry; in a 3D table red changes fastest, then green,
 * then blue. Also read: LUT_1D_INPUT_RANGE / LUT_3D_INPUT_RANGE lo hi (a common variant of the domain lines) and a file
 * with both a 1D table (a "shaper", applied first) and a 3D table, 1D rows first. Other keywords are skipped with a note.
 *
 *   readCube(text) → { title, size1d, size3d, lut1d: Float32Array (size1d × 3) | null, lut3d: Float32Array
 *                      (size3d³ × 3) | null, domainMin [3], domainMax [3], notes: [] }
 *   writeCube({ title, size3d, lut3d, size1d, lut1d, domainMin, domainMax }) → string
 *   applyCube(lut, r, g, b, out = [0, 0, 0], { tetrahedral }) → out    (trilinear by default)
 *   applyCubeToImage(lut, data, channels = 4, opts) — in place on a float RGB(A) buffer
 *   identityCube(size) → a 3D table that changes nothing
 * Errors: ExrError 'damaged' (messages ccexr.cube.*).
 */
import { ExrError } from './util.js';
import { msg } from './messages.js';

const dmg = (key, fills) => new ExrError('damaged', msg('ccexr.cube.damaged', { reason: msg(key, fills) }));
const MAX_TEXT = 1 << 28;

export function readCube(input) {
  const text = typeof input === 'string' ? input : new TextDecoder().decode(input);
  if (text.length > MAX_TEXT) throw dmg('ccexr.cube.size', { n: text.length });
  const lines = text.split(/\r\n|\n|\r/);
  let title = '';
  let size1d = 0;
  let size3d = 0;
  let domainMin = [0, 0, 0];
  let domainMax = [1, 1, 1];
  const notes = [];
  let rows = null;
  let need = 0;
  let have = 0;
  const num = (s) => { const v = Number(s); return Number.isFinite(v) ? v : NaN; };
  for (let i = 0; i < lines.length; i++) {
    const s = lines[i].trim();
    if (!s || s[0] === '#') continue;
    if (/^[A-Za-z_]/.test(s)) {
      if (rows) throw dmg('ccexr.cube.keyword', { line: i + 1, word: s.split(/\s+/)[0] });
      const [k, ...rest] = s.split(/\s+/);
      if (k === 'TITLE') { const m = s.match(/^TITLE\s+"(.*)"\s*$/); title = m ? m[1] : rest.join(' '); }
      else if (k === 'LUT_1D_SIZE' || k === 'LUT_3D_SIZE') {
        const n = num(rest[0]);
        const ok = Number.isInteger(n) && n >= 2 && (k === 'LUT_1D_SIZE' ? n <= 65536 : n <= 256);
        if (!ok) throw dmg('ccexr.cube.size', { n: rest[0] });
        if (k === 'LUT_1D_SIZE') size1d = n; else size3d = n;
      } else if (k === 'DOMAIN_MIN' || k === 'DOMAIN_MAX') {
        const v = rest.slice(0, 3).map(num);
        if (v.length !== 3 || v.some(Number.isNaN)) throw dmg('ccexr.cube.domain');
        if (k === 'DOMAIN_MIN') domainMin = v; else domainMax = v;
      } else if (k === 'LUT_1D_INPUT_RANGE' || k === 'LUT_3D_INPUT_RANGE') {
        const lo = num(rest[0]);
        const hi = num(rest[1]);
        if (Number.isNaN(lo) || Number.isNaN(hi)) throw dmg('ccexr.cube.domain');
        domainMin = [lo, lo, lo];
        domainMax = [hi, hi, hi];
      } else notes.push(k);
      continue;
    }
    if (!rows) {
      if (!size1d && !size3d) throw dmg('ccexr.cube.no_size');
      need = size1d + size3d ** 3;
      rows = new Float32Array(need * 3);
    }
    const v = s.split(/\s+/).map(num);
    if (v.length !== 3 || v.some(Number.isNaN)) throw dmg('ccexr.cube.line', { line: i + 1 });
    if (have >= need) throw dmg('ccexr.cube.count', { have: have + 1, want: need });
    rows[have * 3] = v[0]; rows[have * 3 + 1] = v[1]; rows[have * 3 + 2] = v[2];
    have++;
  }
  if (!size1d && !size3d) throw dmg('ccexr.cube.no_size');
  if (have !== need) throw dmg('ccexr.cube.count', { have, want: need });
  for (let c = 0; c < 3; c++) if (!(domainMax[c] > domainMin[c])) throw dmg('ccexr.cube.domain');
  return {
    title, size1d, size3d, domainMin, domainMax,
    lut1d: size1d ? rows.slice(0, size1d * 3) : null,
    lut3d: size3d ? rows.slice(size1d * 3) : null,
    notes: notes.length ? [msg('ccexr.cube.skipped', { words: [...new Set(notes)].join(', ') })] : [],
  };
}

const fmt = (v) => {
  if (Object.is(v, -0) || v === 0) return '0';
  const s = v.toPrecision(7);
  return String(Number(s));
};

export function writeCube(lut) {
  const out = ['# Written by CadCraft'];
  if (lut.title) out.push('TITLE "' + String(lut.title).replace(/"/g, "'") + '"');
  if (lut.lut1d) out.push('LUT_1D_SIZE ' + lut.size1d);
  if (lut.lut3d) out.push('LUT_3D_SIZE ' + lut.size3d);
  const dmin = lut.domainMin ?? [0, 0, 0];
  const dmax = lut.domainMax ?? [1, 1, 1];
  if (dmin.some((v) => v !== 0) || dmax.some((v) => v !== 1)) {
    out.push('DOMAIN_MIN ' + dmin.map(fmt).join(' '));
    out.push('DOMAIN_MAX ' + dmax.map(fmt).join(' '));
  }
  for (const t of [lut.lut1d, lut.lut3d]) {
    if (!t) continue;
    for (let i = 0; i < t.length; i += 3) out.push(fmt(t[i]) + ' ' + fmt(t[i + 1]) + ' ' + fmt(t[i + 2]));
  }
  return out.join('\n') + '\n';
}

export function identityCube(size) {
  const t = new Float32Array(size ** 3 * 3);
  let o = 0;
  for (let b = 0; b < size; b++) for (let g = 0; g < size; g++) for (let r = 0; r < size; r++) {
    t[o++] = r / (size - 1); t[o++] = g / (size - 1); t[o++] = b / (size - 1);
  }
  return { title: 'Identity' /* i18n-ignore: a file-format title */, size1d: 0, size3d: size, lut1d: null, lut3d: t, domainMin: [0, 0, 0], domainMax: [1, 1, 1], notes: [] };
}

const clamp01 = (v) => (v > 0 ? (v < 1 ? v : 1) : 0);

export function applyCube(lut, r, g, b, out = [0, 0, 0], opts = {}) {
  const { domainMin: lo, domainMax: hi } = lut;
  let x = clamp01((r - lo[0]) / (hi[0] - lo[0]));
  let y = clamp01((g - lo[1]) / (hi[1] - lo[1]));
  let z = clamp01((b - lo[2]) / (hi[2] - lo[2]));
  if (Number.isNaN(x)) x = 0;
  if (Number.isNaN(y)) y = 0;
  if (Number.isNaN(z)) z = 0;
  if (lut.lut1d) {
    const t = lut.lut1d;
    const n = lut.size1d - 1;
    const one = (v, c) => {
      const f = v * n;
      const i = Math.min(n - 1, Math.floor(f));
      const u = f - i;
      return t[i * 3 + c] * (1 - u) + t[(i + 1) * 3 + c] * u;
    };
    x = one(x, 0); y = one(y, 1); z = one(z, 2);
    if (!lut.lut3d) { out[0] = x; out[1] = y; out[2] = z; return out; }
    // the shaper's output is the 3D table's input, in the same domain
    x = clamp01(x); y = clamp01(y); z = clamp01(z);
  }
  const t = lut.lut3d;
  const n = lut.size3d;
  const m = n - 1;
  const fx = x * m; const fy = y * m; const fz = z * m;
  const ix = Math.min(m - 1, Math.floor(fx)); const iy = Math.min(m - 1, Math.floor(fy)); const iz = Math.min(m - 1, Math.floor(fz));
  const dx = fx - ix; const dy = fy - iy; const dz = fz - iz;
  const at = (i, j, k) => ((k * n + j) * n + i) * 3;
  for (let c = 0; c < 3; c++) {
    const c000 = t[at(ix, iy, iz) + c];
    const c111 = t[at(ix + 1, iy + 1, iz + 1) + c];
    if (opts.tetrahedral) {
      let v;
      if (dx > dy) {
        if (dy > dz) v = c000 + dx * (t[at(ix + 1, iy, iz) + c] - c000) + dy * (t[at(ix + 1, iy + 1, iz) + c] - t[at(ix + 1, iy, iz) + c]) + dz * (c111 - t[at(ix + 1, iy + 1, iz) + c]);
        else if (dx > dz) v = c000 + dx * (t[at(ix + 1, iy, iz) + c] - c000) + dz * (t[at(ix + 1, iy, iz + 1) + c] - t[at(ix + 1, iy, iz) + c]) + dy * (c111 - t[at(ix + 1, iy, iz + 1) + c]);
        else v = c000 + dz * (t[at(ix, iy, iz + 1) + c] - c000) + dx * (t[at(ix + 1, iy, iz + 1) + c] - t[at(ix, iy, iz + 1) + c]) + dy * (c111 - t[at(ix + 1, iy, iz + 1) + c]);
      } else if (dz > dy) v = c000 + dz * (t[at(ix, iy, iz + 1) + c] - c000) + dy * (t[at(ix, iy + 1, iz + 1) + c] - t[at(ix, iy, iz + 1) + c]) + dx * (c111 - t[at(ix, iy + 1, iz + 1) + c]);
      else if (dz > dx) v = c000 + dy * (t[at(ix, iy + 1, iz) + c] - c000) + dz * (t[at(ix, iy + 1, iz + 1) + c] - t[at(ix, iy + 1, iz) + c]) + dx * (c111 - t[at(ix, iy + 1, iz + 1) + c]);
      else v = c000 + dy * (t[at(ix, iy + 1, iz) + c] - c000) + dx * (t[at(ix + 1, iy + 1, iz) + c] - t[at(ix, iy + 1, iz) + c]) + dz * (c111 - t[at(ix + 1, iy + 1, iz) + c]);
      out[c] = v;
      continue;
    }
    const c100 = t[at(ix + 1, iy, iz) + c];
    const c010 = t[at(ix, iy + 1, iz) + c];
    const c110 = t[at(ix + 1, iy + 1, iz) + c];
    const c001 = t[at(ix, iy, iz + 1) + c];
    const c101 = t[at(ix + 1, iy, iz + 1) + c];
    const c011 = t[at(ix, iy + 1, iz + 1) + c];
    const c00 = c000 + (c100 - c000) * dx;
    const c10 = c010 + (c110 - c010) * dx;
    const c01 = c001 + (c101 - c001) * dx;
    const c11 = c011 + (c111 - c011) * dx;
    const c0 = c00 + (c10 - c00) * dy;
    const c1 = c01 + (c11 - c01) * dy;
    out[c] = c0 + (c1 - c0) * dz;
  }
  return out;
}

export function applyCubeToImage(lut, data, channels = 4, opts = {}) {
  const o = [0, 0, 0];
  for (let i = 0; i + 2 < data.length; i += channels) {
    applyCube(lut, data[i], data[i + 1], data[i + 2], o, opts);
    data[i] = o[0]; data[i + 1] = o[1]; data[i + 2] = o[2];
  }
  return data;
}
