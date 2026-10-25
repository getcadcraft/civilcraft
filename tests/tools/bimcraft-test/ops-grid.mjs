/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-grid.mjs — LC.20 item 6, third step (session bim-ops): the daylight factor on a grid (daylight-bim-sky.js, BRE
 * split-flux). The sky component against an independent Monte Carlo count (cosine-weighted rays, shares no code with the
 * patch sum); the internally reflected component against the hand-worked case G1 in the log (checked again in Python);
 * the grid's own rules (spacing, border, ≤ 400 points). Part of ops-test.mjs (`--ops --only grid`).
 */
import path from 'node:path';
import fs from 'node:fs';
import { building } from './extra2-daylight.mjs';

export default async function gridPart({ APP, WebIFC, IfcModel, quiet, ok, near }) {
  console.log('== LC.20 daylight factor on a grid');
  const S = await import(path.join(APP, 'daylight-bim-sky.js'));
  const D = await import(path.join(APP, 'daylight-bim.js'));

  // ---- the sky component of one window at one point, against Monte Carlo
  // window in the plane y = 0, 1.5 m wide × 1.2 m tall, centre (0, 0, 1.2), looking out to −y; the room is y > 0
  const win = { id: 1, origin: [0, 0, 1.2], n: [0, -1, 0], s: [1, 0, 0], span: [-0.75, 0.75], hz: 1.2, area: 1.8 };
  const mc = (P, lum, N = 3000000) => {
    let seed = 12345;   // mulberry32: 32-bit integer steps (a float LCG loses its low bits past 2^53)
    const rnd = () => { seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    let s = 0;
    for (let i = 0; i < N; i++) {
      const r1 = rnd(), r2 = rnd(), sinT = Math.sqrt(r1), cosT = Math.sqrt(1 - r1), ph = 2 * Math.PI * r2;   // cosine-weighted about +z
      const d = [sinT * Math.cos(ph), sinT * Math.sin(ph), cosT];
      if (d[1] >= 0) continue;                       // toward the window plane (y decreasing)
      const t = -P[1] / d[1], x = P[0] + t * d[0], z = P[2] + t * d[2];
      if (Math.abs(x) <= 0.75 && Math.abs(z - 1.2) <= 0.6) s += lum(Math.asin(cosT));
    }
    return s / N;   // E[L·hit] under p = cosθ/π  →  ∫L sinα dω = π · this
  };
  const MCN = 4000000;
  /** 4 standard errors of a Monte Carlo share p over MCN rays, in % (+ 0.005 for the patch sum's own rounding). */
  const tol = (pct) => 4 * 100 * Math.sqrt((pct / 100) * (1 - pct / 100) / MCN) + 0.005;
  for (const P of [[0.3, 2, 0.85], [-1.2, 4, 0.85], [0, 0.8, 0.85]]) {
    const u = S.pointComponents(P, win, null, { sky: 'uniform' }), cie = S.pointComponents(P, win, null);
    const mu = 100 * mc(P, () => 1, MCN), mcie = (100 * Math.PI * mc(P, S.L, MCN)) / S.EH, t = tol(mu);
    ok(Math.abs(u.sc - mu) < t && Math.abs(cie.sc - mcie) < t && u.erc === 0, `SC at (${P.join(', ')}): uniform sky ${u.sc.toFixed(3)} % vs Monte Carlo ${mu.toFixed(3)} %; CIE ${cie.sc.toFixed(3)} % vs ${mcie.toFixed(3)} % (± ${t.toFixed(3)}: 4 standard errors of 4 million rays)`);
  }
  const conv = [[0.3, 2, 0.85], [-1.2, 4, 0.85], [0, 0.8, 0.85], [0.7, 0.3, 1.15]].map((P) => { const a = S.pointComponents(P, win, null).sc, b = S.pointComponents(P, win, null, { patches: 1500 }).sc; return Math.abs(a - b) / b; });
  ok(conv.every((x) => x < 0.001), 'the patch counts the app picks are within 0.1 % of the converged sum (1500 × 1500 patches), even 0.3 m from the glass', conv.map((x) => (x * 100).toFixed(3) + ' %').join(' '));
  // an obstruction hiding the lower part of the sky through the window: that light comes in as ERC at 0.1 of the sky's
  const prof = S.profile(win, [Float64Array.from([-500, -6, 0, 500, -6, 0, 500, -6, 4.2, -500, -6, 0, 500, -6, 4.2, -500, -6, 4.2])]);
  const P0 = [0, 3, 0.85], free = S.pointComponents(P0, win, null), shaded = S.pointComponents(P0, win, prof);
  ok(shaded.sc < free.sc && shaded.erc > 0 && near(shaded.sc + shaded.erc / 0.1, free.sc, 0.02), `a long wall 6 m out, 3 m above the window centre: the sky it hides comes in as ERC at a tenth (SC ${free.sc.toFixed(2)} → ${shaded.sc.toFixed(2)} + ERC ${shaded.erc.toFixed(3)})`);

  // ---- C and the internally reflected component (G1 by hand)
  ok(S.cOf(0) === 39 && S.cOf(25) === 28 && S.cOf(80) === 5 && S.cOf(90) === 5 && S.cOf(-3) === 39, 'C by the angle of obstruction: 39 at 0°, 28 at 25° (between 31 and 25), 5 at 80° and beyond');
  const open = async (text) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const m = await quiet((b) => eng.load(b))(new TextEncoder().encode(text)); return { api: eng.api, mid: m.modelID }; };
  const { api, mid } = await open(building());
  const g = S.profileWindows(D.gatherRooms(WebIFC, api, mid, { keep: true }));
  const r101 = g.rooms.find((r) => r.name === '101');
  ok(near(S.irc(r101, {}), 0.670486, 1e-6), 'G1 by hand: IRC of room 101 = 0.7 × 3.15 / (102 × 0.54) × (39 × 0.352761 + 5 × 0.598160) = 0.6705 %', String(S.irc(r101, {})));

  // ---- the grid
  const grid = S.roomGrid(r101, g.prods, {});
  const xs = new Set(grid.points.map((p) => p[0].toFixed(3))), ys = new Set(grid.points.map((p) => p[1].toFixed(3)));
  ok(grid.spacing === 0.25 && grid.points.length === 240 && xs.size === 20 && ys.size === 12, '6 × 4 m room: spacing 0.25 m (√(24/400) rounded up to 5 cm), 0.5 m in from the walls → 20 × 12 = 240 points', grid.spacing + ' ' + grid.points.length);
  const floorZ = Math.min(...grid.points.map((p) => p[2]));
  ok(grid.points.every((p) => near(p[2], floorZ, 1e-9)) && grid.edges.length >= 4, 'every point at the working plane (0.85 m above the floor); the floor\'s outline found');
  const g100 = S.roomGrid(r101, g.prods, { max: 100 });
  ok(g100.points.length <= 100 && g100.spacing > 0.25, `max 100: the spacing grows to ${g100.spacing} m (${g100.points.length} points)`);
  const res = S.gridDaylight(g, [r101], {})[0];
  const near1 = res.grid.points.filter((p) => p.y < Math.min(...res.grid.points.map((q) => q.y)) + 0.6), far = res.grid.points.filter((p) => p.y > Math.max(...res.grid.points.map((q) => q.y)) - 0.6);
  const avg = (l) => l.reduce((t, p) => t + p.df, 0) / l.length;
  ok(avg(near1) > avg(far) && res.grid.uniformity > 0 && res.grid.uniformity <= 1 && near(res.irc, 0.670486, 1e-6), `deeper into the room is darker (by W1 ${avg(near1).toFixed(2)} %, at the back ${avg(far).toFixed(2)} %); uniformity ${res.grid.uniformity.toFixed(2)}`);
  ok(res.grid.points.every((p) => near(p.df, p.sc + p.erc + res.irc, 1e-9)) && near(res.grid.mean, avg(res.grid.points), 1e-9), 'DF = SC + ERC + IRC at every point; the mean is the points\' mean');
  const half = S.gridDaylight(g, [r101], { T: 0.35 })[0];
  ok(near(half.grid.mean, res.grid.mean / 2, 1e-9), 'transmittance halved: every component halves');
  // lowest tier: no room of the showcase house gets more than 400 points
  const showcase = path.resolve(APP, '../../../../../fixtures/showcase');
  const hm = await open(fs.readFileSync(path.join(showcase, 'bimcraft-house.ifc'), 'utf8'));
  const hg = S.profileWindows(D.gatherRooms(WebIFC, hm.api, hm.mid, { keep: true }));
  const hr = S.gridDaylight(hg, hg.rooms, {});
  ok(hr.length === 5 && hr.every((r) => r.grid.points.length > 0 && r.grid.points.length <= 400) && hr.every((r) => r.grid.mean > 0), 'the showcase house: 5 rooms, each 1–400 points, each with daylight', hr.map((r) => r.name + ':' + r.grid.points.length + '/' + r.grid.mean.toFixed(2)).join(' '));
}
