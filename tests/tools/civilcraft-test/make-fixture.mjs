#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-fixture.mjs — writes site-topo.csv: a small made-up topographic survey (US feet, PNEZD with a
 * header row) of a 400 × 300 ft site with a ridge running across its north half and a swale
 * winding along its south half, draining west. Coordinates sit at state-plane-like magnitudes
 * (E ≈ 6,150,000, N ≈ 2,080,000) so precision problems would show.
 *
 * Codes: GRD ground shots (jittered 25 ft grid), FL swale flowline, TBN/TBS swale top of bank
 * north/south, RIDGE ridge crest, TREE (ground at a trunk), CP control points.
 * The terrain is a formula (terrain() below) so tests can compare the TIN with the truth.
 *   node tools/civilcraft-test/make-fixture.mjs   (deterministic; rewrites site-topo.csv)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const E0 = 6150000, N0 = 2080000, W = 400, H = 300;

const ridgeV = (u) => 230 - 0.15 * u;                 // ridge crest line (local)
const swaleV = (u) => 80 + 25 * Math.sin(u / 90);     // swale flowline (local)
export function terrain(u, v) {
  let z = 250 + 0.02 * u - 0.01 * v;
  const dr = (v - ridgeV(u)) / Math.hypot(1, 0.15);
  z += 8 * Math.exp(-((dr / 45) ** 2));
  const ds = Math.abs(v - swaleV(u));
  z -= 4 * Math.max(0, 1 - ds / 35);
  return z;
}

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

export function makePoints() {
  const r = rng(20261010), pts = [];
  let n = 1;
  const add = (u, v, d) => pts.push({ n: n++, u, v, z: terrain(u, v), d });
  add(-15, -12, 'CP 1 IRON ROD');
  add(W + 12, H + 9, 'CP 2 IRON ROD');
  for (let v = 0; v <= H; v += 25) for (let u = 0; u <= W; u += 25) {
    const ju = u === 0 || u === W ? 0 : (r() - 0.5) * 12, jv = v === 0 || v === H ? 0 : (r() - 0.5) * 12;
    const uu = u + ju, vv = v + jv;
    if (Math.abs(vv - swaleV(uu)) < 8 || Math.abs(vv - ridgeV(uu)) < 6) continue;
    add(uu, vv, 'GRD');
  }
  for (let u = 0; u <= W; u += 20) add(u, swaleV(u), 'FL');
  for (let u = 0; u <= W; u += 25) add(u, swaleV(u) + 35, 'TBN');
  for (let u = 0; u <= W; u += 25) add(u, swaleV(u) - 35, 'TBS');
  for (let u = 0; u <= W; u += 30) add(u, ridgeV(u), 'RIDGE');
  for (const [u, v] of [[60, 160], [140, 175], [300, 150], [330, 260]]) add(u + 0.4, v - 0.3, 'TREE 12 OAK');
  return pts;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const out = path.join(path.dirname(fileURLToPath(import.meta.url)), 'site-topo.csv');
  const lines = ['Point,Northing,Easting,Elevation,Description'];
  for (const p of makePoints()) lines.push([p.n, (N0 + p.v).toFixed(3), (E0 + p.u).toFixed(3), p.z.toFixed(2), p.d].join(','));
  fs.writeFileSync(out, lines.join('\r\n') + '\r\n');
  console.log('wrote ' + out + ' (' + (lines.length - 1) + ' points)');
}
