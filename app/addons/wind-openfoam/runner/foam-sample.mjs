/* SPDX-License-Identifier: GPL-3.0-or-later */
/**
 * foam-sample.mjs — reads a finished OpenFOAM case (ASCII polyMesh and fields) and samples U and p at given points (nearest cell centre).
 * It exists because function objects (`probes`, `postProcess`) did not run in every OpenFOAM build we tried (the Debian/Ubuntu `openfoam` 1912 package aborts with an
 * IOstream "sha1" error), while reading the files needs nothing from OpenFOAM. It is a plain reader of an open text format.
 *   sampleCase(dir, points:[[x,y,z]...], { time? }) → { time, n, U: [[u,v,w]|null], p: [number|null], cells }
 *   needs ASCII output (the case writer sets writeFormat ascii). Cell centre = mean of the centres of the cell's faces.
 */
import fs from 'node:fs';
import path from 'node:path';

const isNum = (c) => (c >= 48 && c <= 57) || c === 45 || c === 43 || c === 46 || c === 101 || c === 69;
/** Every number in str[a, b) in order. */
function numbers(str, a, b, cap = 0) {
  const out = cap ? new Float64Array(cap) : []; let k = 0;
  for (let i = a; i < b;) {
    const c = str.charCodeAt(i);
    if (isNum(c)) { let j = i + 1; while (j < b && isNum(str.charCodeAt(j))) j++; const v = Number(str.slice(i, j)); if (cap) out[k++] = v; else out.push(v); i = j; } else i++;
  }
  return cap ? out.subarray(0, k) : Float64Array.from(out);
}
const bodyStart = (text) => { const m = /FoamFile\s*\{[^}]*\}/.exec(text); return m ? m.index + m[0].length : 0; };
const matchParen = (str, open) => { let d = 0; for (let i = open; i < str.length; i++) { const c = str.charCodeAt(i); if (c === 40) d++; else if (c === 41 && --d === 0) return i; } return -1; };

/** The first "N ( ... )" list after `from`: { n, a, b } with str[a, b) the inside of the brackets. */
function listAt(str, from) {
  const m = /(\d+)\s*\(/g; m.lastIndex = from; const r = m.exec(str); if (!r) throw new Error('no list');
  const open = r.index + r[0].length - 1, close = matchParen(str, open); return { n: Number(r[1]), a: open + 1, b: close, end: close + 1 };
}

export function readLabels(text) { const l = listAt(text, bodyStart(text)); return Int32Array.from(numbers(text, l.a, l.b)); }
export function readPoints(text) { const l = listAt(text, bodyStart(text)); return numbers(text, l.a, l.b); }
export function readFaces(text) {
  const s = bodyStart(text), compact = /class\s+faceCompactList/.test(text.slice(0, s));
  if (compact) {
    const o = listAt(text, s), f = listAt(text, o.end), off = Int32Array.from(numbers(text, o.a, o.b)), flat = Int32Array.from(numbers(text, f.a, f.b));
    return { n: off.length - 1, start: off, flat };
  }
  const l = listAt(text, s), start = [0], flat = [];   // "N(a b c d)" per face
  const inner = text.slice(l.a, l.b), re = /(\d+)\s*\(([^)]*)\)/g; let m;
  while ((m = re.exec(inner))) { for (const v of m[2].trim().split(/\s+/)) flat.push(Number(v)); start.push(flat.length); }
  return { n: start.length - 1, start: Int32Array.from(start), flat: Int32Array.from(flat) };
}
/** internalField of a volScalarField / volVectorField → { uniform, value } or { values: Float64Array, dim } */
export function readField(text, dim) {
  const i = text.indexOf('internalField'); if (i < 0) throw new Error('no internalField');
  const rest = text.slice(i, i + 200), u = /internalField\s+uniform\s+(\([^)]*\)|[-+0-9.eE]+)/.exec(rest);
  if (u) return { uniform: true, value: numbers(u[1], 0, u[1].length) };
  const l = listAt(text, i); return { uniform: false, values: numbers(text, l.a, l.b), dim, n: l.n };
}

export function latestTime(dir) {
  const ts = fs.readdirSync(dir).filter((n) => /^[0-9]+(\.[0-9]+)?(e[-+]?[0-9]+)?$/.test(n)).sort((a, b) => Number(a) - Number(b));
  const nz = ts.filter((t) => Number(t) > 0); return nz.length ? nz[nz.length - 1] : ts[ts.length - 1];
}

export function cellCentres(dir) {
  const pm = path.join(dir, 'constant/polyMesh'), rd = (n) => fs.readFileSync(path.join(pm, n), 'utf8');
  const pts = readPoints(rd('points')), faces = readFaces(rd('faces')), owner = readLabels(rd('owner')), nb = readLabels(rd('neighbour'));
  let nCells = 0; for (const o of owner) if (o + 1 > nCells) nCells = o + 1; for (const o of nb) if (o + 1 > nCells) nCells = o + 1;
  const fc = new Float64Array(3 * faces.n);
  for (let f = 0; f < faces.n; f++) { let x = 0, y = 0, z = 0; const a = faces.start[f], b = faces.start[f + 1]; for (let k = a; k < b; k++) { const p = faces.flat[k]; x += pts[3 * p]; y += pts[3 * p + 1]; z += pts[3 * p + 2]; } const c = b - a; fc[3 * f] = x / c; fc[3 * f + 1] = y / c; fc[3 * f + 2] = z / c; }
  const sum = new Float64Array(3 * nCells), cnt = new Int32Array(nCells);
  const add = (c, f) => { sum[3 * c] += fc[3 * f]; sum[3 * c + 1] += fc[3 * f + 1]; sum[3 * c + 2] += fc[3 * f + 2]; cnt[c]++; };
  for (let f = 0; f < faces.n; f++) { add(owner[f], f); if (f < nb.length) add(nb[f], f); }
  const C = new Float64Array(3 * nCells); for (let c = 0; c < nCells; c++) { C[3 * c] = sum[3 * c] / cnt[c]; C[3 * c + 1] = sum[3 * c + 1] / cnt[c]; C[3 * c + 2] = sum[3 * c + 2] / cnt[c]; }
  return { C, nCells };
}

export function sampleCase(dir, points, opts = {}) {
  const time = opts.time || latestTime(dir), { C, nCells } = cellCentres(dir);
  const Uf = readField(fs.readFileSync(path.join(dir, time, 'U'), 'utf8'), 3), Pf = readField(fs.readFileSync(path.join(dir, time, 'p'), 'utf8'), 1);
  // spatial hash on the centres
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (let c = 0; c < nCells; c++) { x0 = Math.min(x0, C[3 * c]); x1 = Math.max(x1, C[3 * c]); y0 = Math.min(y0, C[3 * c + 1]); y1 = Math.max(y1, C[3 * c + 1]); z0 = Math.min(z0, C[3 * c + 2]); z1 = Math.max(z1, C[3 * c + 2]); }
  const nb = Math.max(1, Math.round(Math.cbrt(nCells / 4))), sx = (x1 - x0) / nb + 1e-9, sy = (y1 - y0) / nb + 1e-9, sz = (z1 - z0) / nb + 1e-9, key = (i, j, k) => (i * (nb + 1) + j) * (nb + 1) + k;
  const grid = new Map(), ix = (x) => Math.min(nb, Math.floor((x - x0) / sx)), iy = (y) => Math.min(nb, Math.floor((y - y0) / sy)), iz = (z) => Math.min(nb, Math.floor((z - z0) / sz));
  for (let c = 0; c < nCells; c++) { const k = key(ix(C[3 * c]), iy(C[3 * c + 1]), iz(C[3 * c + 2])); const a = grid.get(k); if (a) a.push(c); else grid.set(k, [c]); }
  const nearest = (p) => {
    const i0 = ix(p[0]), j0 = iy(p[1]), k0 = iz(p[2]);
    for (let r = 1; r <= nb + 1; r++) {   // grow the box until a cell is found, then one more ring for exactness
      let best = -1, bd = Infinity;
      for (let i = Math.max(0, i0 - r); i <= Math.min(nb, i0 + r); i++) for (let j = Math.max(0, j0 - r); j <= Math.min(nb, j0 + r); j++) for (let k = Math.max(0, k0 - r); k <= Math.min(nb, k0 + r); k++) {
        const a = grid.get(key(i, j, k)); if (!a) continue;
        for (const c of a) { const d = (C[3 * c] - p[0]) ** 2 + (C[3 * c + 1] - p[1]) ** 2 + (C[3 * c + 2] - p[2]) ** 2; if (d < bd) { bd = d; best = c; } }
      }
      if (best >= 0 && Math.sqrt(bd) <= r * Math.min(sx, sy, sz)) return best;
    }
    return -1;
  };
  const U = [], P = [];
  for (const p of points) {
    if (p[0] < x0 - 2 * sx || p[0] > x1 + 2 * sx || p[1] < y0 - 2 * sy || p[1] > y1 + 2 * sy || p[2] < z0 - 2 * sz || p[2] > z1 + 2 * sz) { U.push(null); P.push(null); continue; }
    const c = nearest(p);
    if (c < 0) { U.push(null); P.push(null); continue; }
    U.push(Uf.uniform ? Array.from(Uf.value) : [Uf.values[3 * c], Uf.values[3 * c + 1], Uf.values[3 * c + 2]]);
    P.push(Pf.uniform ? Pf.value[0] : Pf.values[c]);
  }
  return { time: Number(time), n: points.length, U, p: P, cells: nCells };
}
