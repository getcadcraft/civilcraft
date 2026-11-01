/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — numbers and keys; the host's panels pass t() and show the language files' words. */
/**
 * stat.js — statistical reverberation for a box room whose absorption is NOT spread evenly (0.8 XE.3 phase S2, session ind_PART_4).
 * DOM-free; lib/acoustics is canonical. Sabine and Eyring (acoustics.js) assume the same absorption everywhere; a carpeted floor under a hard ceiling breaks
 * that and Sabine then reads too long. Two published corrections, written from the papers' formulas (no standard is involved):
 *   Fitzroy (1959):          T = 0.161 V / S² · Σ_i  S_i / (−ln(1 − ᾱ_i))
 *   Arau-Puchades (1988):    T = Π_i [ 0.161 V / (−S ln(1 − ᾱ_i)) ] ^ (S_i / S)
 * for a box Lx × Ly × Lz, i = x, y, z; S_i is the area of the pair of opposite surfaces perpendicular to axis i (S_x = 2 Ly Lz …), ᾱ_i their mean absorption.
 * Both reduce to Eyring when ᾱ_i is the same on every pair (the test checks it). Air absorption m (1/m) adds 4 m V to the denominator terms like Eyring's.
 *
 *   boxReverb({ lx, ly, lz, alpha: { x: [..bands], y: [..], z: [..] } | pairs: { floor, ceiling, west, east, south, north } (band arrays), air? }) →
 *     { V, S, bands: [{ f, sabine, eyring, fitzroy, arau }], notes }
 */
import { BANDS, airM } from './acoustics.js';

const K = 0.161;
export function boxReverb(room, env = {}) {
  const { lx, ly, lz } = room, V = lx * ly * lz;
  if (!(V > 0)) return { ok: false, reason: 'noroom' };
  const p = room.pairs;
  if (!p) return { ok: false, reason: 'nopairs' };
  const SX = 2 * ly * lz, SY = 2 * lx * lz, SZ = 2 * lx * ly, S = SX + SY + SZ;
  const A = (a, i) => a[i];
  const notes = [];
  const bands = BANDS.map((f, i) => {
    // mean absorption of each pair, area-weighted (opposite surfaces have the same area)
    const ax = (A(p.west, i) + A(p.east, i)) / 2, ay = (A(p.south, i) + A(p.north, i)) / 2, az = (A(p.floor, i) + A(p.ceiling, i)) / 2;
    const cl = (a) => Math.min(0.999, Math.max(1e-4, a)), air = env.air === false ? 0 : 4 * airM(f, env) * V;
    const lx_ = -Math.log(1 - cl(ax)), ly_ = -Math.log(1 - cl(ay)), lz_ = -Math.log(1 - cl(az));
    const aMean = (SX * ax + SY * ay + SZ * az) / S, sabine = K * V / (S * aMean + air), eyring = K * V / (-S * Math.log(1 - cl(aMean)) + air);
    const fitzroy = K * V / (S * S) * (SX / lx_ + SY / ly_ + SZ / lz_);
    const arau = Math.pow(K * V / (S * lx_ + air), SX / S) * Math.pow(K * V / (S * ly_ + air), SY / S) * Math.pow(K * V / (S * lz_ + air), SZ / S);
    // air: the same term joins each pair's −ln(1−ᾱ_i) as air / S (so the sum reduces to Eyring-with-air when the pairs are equal)
    const fz = air ? K * V / (S * S) * (SX / (lx_ + air / S) + SY / (ly_ + air / S) + SZ / (lz_ + air / S)) : fitzroy;
    return { f, sabine, eyring, fitzroy: fz, arau, alphaPairs: { x: ax, y: ay, z: az } };
  });
  const spread = bands.map((b) => Math.max(b.alphaPairs.x, b.alphaPairs.y, b.alphaPairs.z) / Math.max(1e-6, Math.min(b.alphaPairs.x, b.alphaPairs.y, b.alphaPairs.z)));
  if (Math.max(...spread) > 3) notes.push({ key: 'ac.note.uneven' });
  return { ok: true, V, S, bands, notes };
}
