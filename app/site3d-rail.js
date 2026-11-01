/* SPDX-License-Identifier: Apache-2.0 */
/**
 * site3d-rail.js — 0.7.1 71.26: what the 3D site view adds for a railway track. No DOM, no three.js: site3d.js calls these while
 * it builds its scene; the view draws the result; the exporters get the sleepers written out as plain meshes (site3d-landscape.js
 * expandInstances, which turns instances with `rot` too).
 *
 *   railInput(items) → [{ id, name, sections, rail }]   the corridors built as tracks (each section with its `track`, corridor.js)
 *   railMesh(B, tracks, L, C)       each rail swept along its track as the rail section's outline (head, web, foot from RAIL_PROFILES)
 *   ballastMesh(B, tracks, L, C)    the ballast bed's top (toe, shoulder, the sleepers' level, shoulder, toe) between sections
 *   sleeperInstances(tracks, L, C)  → set | null   one box per sleeper every `spacing` along each track, turned with the track and
 *                                   tilted with the cant, its top on the track (exaggerated), its depth true: { key 'sleepers', shape 'box',
 *                                   proto, at (bottom middle, local), size (width
 *                                   along the track, length across, depth; true size), rot (quaternion x y z w each), colors, owners,
 *                                   instOwner, count }
 * Rails and sleepers keep their true size (the ground's vertical exaggeration is for the terrain, as the plants).
 */

import { RAIL_PROFILES, mmTo } from './rail.js';

export const RAIL_COLORS = { rail: '#6b6f75', ballast: '#8f8b83', 'sleeper:concrete': '#b9b4a8', 'sleeper:timber': '#6e4f33', 'sleeper:steel': '#5d646b', 'sleeper:composite': '#4d5a52' };
const rgbOf = (hex) => { const v = parseInt(String(hex).replace('#', ''), 16) || 0; return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255]; };

export function railInput(items) {
  return (items || []).filter((x) => x.kind === 'corridor' && x.rail && (x.sections || []).filter((s) => s.track).length >= 2)
    .map((x) => ({ id: x.id, name: x.name, sections: x.sections.filter((s) => s.track), rail: x.rail.rail, units: x.rail.units }));
}

function face(B, a, b, c, col) {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const l = Math.hypot(nx, ny, nz);
  if (!(l > 1e-15)) return;
  const n = [nx / l, ny / l, nz / l];
  B.tri(B.vert(a, n, col), B.vert(b, n, col), B.vert(c, n, col));
}
const world = (sec, o, z) => ({ x: sec.track.p.x + sec.track.r.x * o, y: sec.track.p.y + sec.track.r.y * o, z: sec.track.z0 + z });

/** The rail's outline across (offset from the head's centre, height down from the head's top), project units: a simple I. */
function railOutline(rail, units) {
  const P = RAIL_PROFILES[rail.rail] || RAIL_PROFILES['60E1'], m = (v) => mmTo(v, units);
  const h = m(P.h), hw = m(P.head) / 2, fw = m(P.foot) / 2, ww = m(P.web) / 2, hd = h * 0.28, fd = h * 0.12;
  return [[-hw, 0], [hw, 0], [hw, -hd], [ww, -hd], [ww, -h + fd], [fw, -h + fd], [fw, -h], [-fw, -h], [-fw, -h + fd], [-ww, -h + fd], [-ww, -hd], [-hw, -hd]];
}

export function railMesh(B, tracks, L, C) {
  let n = 0;
  const col = rgbOf(C.rail || RAIL_COLORS.rail);
  for (const tr of tracks || []) {
    const S = tr.sections, out = railOutline(tr.rail, tr.units), nT = S[0].track.shape.tracks.length;
    B.owner({ kind: 'alignment', id: tr.id, name: tr.name });
    for (let k = 0; k < nT; k++) for (let j = 0; j < 2; j++) {
      // true size: the head on the (exaggerated) track, the section's depth below it unexaggerated
      const ring = (sec) => { const r = sec.track.shape.tracks[k].rails[j]; return out.map(([o, dz]) => { const q = world(sec, r.o + o, r.z), v = L(q.x, q.y, q.z); v[2] += dz; return v; }); };
      let A = ring(S[0]);
      for (let i = 1; i < S.length; i++) {
        const Bq = ring(S[i]);
        for (let v = 0; v < out.length; v++) { const w = (v + 1) % out.length; face(B, A[v], Bq[w], Bq[v], col); face(B, A[v], A[w], Bq[w], col); }
        A = Bq;
      }
      n++;
    }
  }
  return n;
}

export function ballastMesh(B, tracks, L, C) {
  let n = 0;
  const col = rgbOf(C.ballast || RAIL_COLORS.ballast);
  for (const tr of tracks || []) {
    const S = tr.sections;
    B.owner({ kind: 'alignment', id: tr.id, name: tr.name });
    const line = (sec) => { const T = sec.track.shape.top; return [...T.L.slice().reverse(), ...T.R.slice(1)].filter((q) => q.code !== 'CESS').map((q) => { const w = world(sec, q.o, q.z); return L(w.x, w.y, w.z); }); };
    let A = line(S[0]);
    for (let i = 1; i < S.length; i++) {
      const Bq = line(S[i]);
      if (Bq.length !== A.length) { A = Bq; continue; }
      for (let v = 0; v + 1 < A.length; v++) { face(B, A[v], A[v + 1], Bq[v + 1], col); face(B, A[v], Bq[v + 1], Bq[v], col); }
      A = Bq;
      n++;
    }
  }
  return n;
}

/** A unit box: x, y in −0.5 … 0.5, z in 0 … 1, a face's own normals. */
let BOX = null;
export function boxProto() {
  if (BOX) return BOX;
  const pos = [], nor = [], idx = [];
  const quad = (n, pts) => { const b = pos.length / 3; for (const p of pts) { pos.push(...p); nor.push(...n); } idx.push(b, b + 1, b + 2, b, b + 2, b + 3); };
  const a = -0.5, b = 0.5;
  quad([0, 0, 1], [[a, a, 1], [b, a, 1], [b, b, 1], [a, b, 1]]); quad([0, 0, -1], [[a, a, 0], [a, b, 0], [b, b, 0], [b, a, 0]]);
  quad([1, 0, 0], [[b, a, 0], [b, b, 0], [b, b, 1], [b, a, 1]]); quad([-1, 0, 0], [[a, a, 0], [a, a, 1], [a, b, 1], [a, b, 0]]);
  quad([0, 1, 0], [[a, b, 0], [a, b, 1], [b, b, 1], [b, b, 0]]); quad([0, -1, 0], [[a, a, 0], [b, a, 0], [b, a, 1], [a, a, 1]]);
  BOX = { positions: new Float32Array(pos), normals: new Float32Array(nor), indices: new Uint32Array(idx) };
  return BOX;
}

export function sleeperInstances(tracks, L, C, { name = 'Sleepers', max = 200000 } = {}) {
  const at = [], size = [], rot = [], colors = [], owners = [], instOwner = [];
  for (const tr of tracks || []) {
    const S = tr.sections, R = tr.rail, sl = R.sleeper, col = rgbOf(C['sleeper:' + sl.material] || RAIL_COLORS['sleeper:' + sl.material] || RAIL_COLORS['sleeper:concrete']);
    const oi = owners.push({ kind: 'alignment', id: tr.id, name: tr.name }) - 1, nT = S[0].track.shape.tracks.length;
    for (let k = 0; k < nT; k++) {
      // the track's centre at every section: position, the sleeper's bottom (middle), heading and roll; then a sleeper every spacing
      const P = S.map((sec) => {
        const tk = sec.track.shape.tracks[k], top = (tk.sleeper[0].z + tk.sleeper[1].z) / 2, w = world(sec, tk.c, top);   // hung from its top (true size below)
        return { ...w, dir: Math.atan2(sec.track.r.x, -sec.track.r.y), roll: Math.atan(-tk.slope) };
      });
      const cum = [0];
      for (let i = 1; i < P.length; i++) cum.push(cum[i - 1] + Math.hypot(P[i].x - P[i - 1].x, P[i].y - P[i - 1].y));
      const len = cum[cum.length - 1], count = Math.floor(len / sl.spacing + 1e-9) + 1;
      let i = 1;
      for (let m = 0; m < count && instOwner.length < max; m++) {
        const d = m * sl.spacing;
        while (i < P.length - 1 && cum[i] < d) i++;
        const f = cum[i] > cum[i - 1] ? Math.min(1, Math.max(0, (d - cum[i - 1]) / (cum[i] - cum[i - 1]))) : 0;
        const A = P[i - 1], Bq = P[i], lerp = (u, v) => u + (v - u) * f;
        let dd = Bq.dir - A.dir; dd = Math.atan2(Math.sin(dd), Math.cos(dd));
        const psi = A.dir + dd * f, phi = lerp(A.roll, Bq.roll);
        const b = L(lerp(A.x, Bq.x), lerp(A.y, Bq.y), lerp(A.z, Bq.z));
        b[2] -= sl.depth;
        at.push(...b);
        size.push(sl.width, sl.length, sl.depth);
        const cz = Math.cos(psi / 2), sz = Math.sin(psi / 2), cx = Math.cos(phi / 2), sx = Math.sin(phi / 2);
        rot.push(cz * sx, sz * sx, sz * cx, cz * cx);   // turn about z by the heading, then roll about the track's own axis
        colors.push(...col); instOwner.push(oi);
      }
    }
  }
  if (!instOwner.length) return null;
  return { key: 'sleepers', shape: 'box', name, proto: boxProto(), at: new Float32Array(at), size: new Float32Array(size), rot: new Float32Array(rot), colors: new Float32Array(colors), owners, instOwner: new Uint32Array(instOwner), count: instOwner.length };
}

/** A point rotated by the quaternion (x, y, z, w). */
export function rotateQ(q, v) {
  const [x, y, z, w] = q, [vx, vy, vz] = v;
  const tx = 2 * (y * vz - z * vy), ty = 2 * (z * vx - x * vz), tz = 2 * (x * vy - y * vx);
  return [vx + w * tx + (y * tz - z * ty), vy + w * ty + (z * tx - x * tz), vz + w * tz + (x * ty - y * tx)];
}
