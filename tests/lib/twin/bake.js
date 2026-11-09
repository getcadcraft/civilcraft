/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library. */
/**
 * bake.js — a stretch of a run as motion tracks (0.9 TW.6), for the path tracer (the model's timeline) and for animated USD. DOM-free.
 *
 *   sampleTracks(player, { from, to, fps, maxLoads }) → { from, to, fps, loads: [{id, type, L, keys: [{t, p, h}], born, gone}], vehicles: [...], dropped }
 *        p = the load's middle in world metres; times from 0 (from is subtracted); straight stretches keep only their ends (tolerance 2 mm, 0.2°).
 *   matrixAt(key, size) → column-major 16 numbers (ModelCraft's m16), HIDE_Z for "not in the scene" (under the floor)
 *   bakeAnim(tracks, pathOf, anim, A) → the anim with one object track per load (A = render/anim.js' functions, handed in)
 */
import { loadSize } from './equipment.js';

export const HIDE_Z = -50;
const rad = (d) => (d * Math.PI) / 180;
export function m16(p, h) { const c = Math.cos(rad(h)), s = Math.sin(rad(h)); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, p[0], p[1], p[2], 1]; }

function thin(keys) {
  if (keys.length < 3) return keys;
  const out = [keys[0]];
  for (let i = 1; i < keys.length - 1; i++) {
    const a = out[out.length - 1], k = keys[i], b = keys[i + 1], f = (k.t - a.t) / (b.t - a.t);
    const e = Math.hypot(a.p[0] + (b.p[0] - a.p[0]) * f - k.p[0], a.p[1] + (b.p[1] - a.p[1]) * f - k.p[1], a.p[2] + (b.p[2] - a.p[2]) * f - k.p[2]);
    if (e > 0.002 || Math.abs(a.h + (b.h - a.h) * f - k.h) > 0.2) out.push(k);
  }
  out.push(keys[keys.length - 1]);
  return out;
}

export function sampleTracks(player, { from = 0, to = 60, fps = 15, maxLoads = 200, maxKeys = 1500 } = {}) {
  const loads = new Map(), vehicles = new Map(), step = 1 / fps;
  for (let t = from; t <= to + 1e-9; t += step) {
    const f = player.frame(t), rel = +(t - from).toFixed(4);
    for (const l of f.loads) {
      let r = loads.get(l.id);
      if (!r) { r = { id: l.id, type: l.type, L: l.L, keys: [], born: rel, gone: rel }; loads.set(l.id, r); }
      const h = loadSize(l.L).h;
      r.keys.push({ t: rel, p: [l.p[0], l.p[1], l.p[2] + h / 2], h: l.h }); r.gone = rel;
    }
    for (const v of f.vehicles) {
      let r = vehicles.get(v.n);
      if (!r) { r = { id: 'v' + v.n, n: v.n, keys: [], born: rel, gone: rel }; vehicles.set(v.n, r); }
      r.keys.push({ t: rel, p: [v.p[0], v.p[1], v.p[2]], h: v.h }); r.gone = rel;
    }
  }
  const all = [...loads.values()];
  const dropped = Math.max(0, all.length - maxLoads);
  const keep = all.slice(0, maxLoads);
  const cap = (x) => { x.keys = thin(x.keys); if (x.keys.length > maxKeys) { const n = x.keys.length; x.keys = Array.from({ length: maxKeys }, (_, i) => x.keys[Math.round((i * (n - 1)) / (maxKeys - 1))]); } return x; };
  return { from, to, fps, length: +(to - from).toFixed(4), loads: keep.map(cap), vehicles: [...vehicles.values()].map(cap), dropped };
}

/** One object track per load: under the floor until it appears, along its keys, under the floor after it goes. pathOf(track) → the placement's path, or null. */
export function bakeAnim(tracks, pathOf, anim, A) {
  let a = anim;
  const put = (x, name) => {
    const path = pathOf(x); if (!path) return;
    const k0 = x.keys[0], kN = x.keys[x.keys.length - 1];
    if (k0.t > 0.001) { a = A.setObjectKey(a, path, name, 0, m16([k0.p[0], k0.p[1], HIDE_Z], k0.h), 'hold'); }
    if (k0.t > 0.002) a = A.setObjectKey(a, path, name, Math.max(0, k0.t - 0.001), m16([k0.p[0], k0.p[1], HIDE_Z], k0.h), 'hold');
    for (const k of x.keys) a = A.setObjectKey(a, path, name, k.t, m16(k.p, k.h), 'linear');
    if (kN.t < tracks.length - 0.002) a = A.setObjectKey(a, path, name, kN.t + 0.001, m16([kN.p[0], kN.p[1], HIDE_Z], kN.h), 'hold');
  };
  for (const l of tracks.loads) put(l, 'Load ' + l.id);
  for (const v of tracks.vehicles) put(v, 'Vehicle ' + v.n);
  return a;
}
