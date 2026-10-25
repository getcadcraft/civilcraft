/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ops-vsc.mjs — LC.20 item 6, first step (session bim-ops): the vertical sky component per window (daylight-bim-sky.js).
 * Known answers: the free facade's 39.6 % from the closed form; a long obstruction against an independent integral (and
 * BRE's "25° → about 27 %"); a finite block in an IFC against a brute-force ray count over the sky; the showcase house
 * turned 30° = the house. Part of ops-test.mjs (`--ops --only vsc`).
 */
import path from 'node:path';
import fs from 'node:fs';
import { building } from './extra2-daylight.mjs';

export default async function vscPart({ APP, ROOT, WebIFC, IfcModel, quiet, ok, near }) {
  console.log('== LC.20 vertical sky component');
  const S = await import(path.join(APP, 'daylight-bim-sky.js'));
  const D = await import(path.join(APP, 'daylight-bim.js'));
  const quad = (a, b, c, d) => Float64Array.from([...a, ...b, ...c, ...a, ...c, ...d]);
  const win = { id: 1, origin: [0, 0, 0], n: [0, -1, 0], s: [1, 0, 0], span: [-0.5, 0.5], hz: 1, area: 1 };

  // ---- the closed forms
  ok(near(S.cieF(Math.PI / 2), Math.PI / 12 + 2 / 9, 1e-12) && near(S.EH, 7 * Math.PI / 9, 1e-15), 'CIE overcast sky: ∫L cos²θ dθ over 0…90° = π/12 + 2/9; the whole sky on the horizontal = 7π/9 Lz');
  const free = S.vsc(S.profile(win, []));
  ok(near(free, (2 * (Math.PI / 12 + 2 / 9) / S.EH) * 100, 1e-9) && near(free, 39.62, 0.005), 'a free facade: VSC = 39.62 % (the known 39.6 %), exactly, at any step', free.toFixed(4));
  ok(S.skyFraction(S.profile(win, [])) === 1 && S.obstructionAngle(S.profile(win, [])) === 0, 'free: the whole sky, no obstruction angle');

  // ---- a long wall opposite: against a reference integral that shares no code with the profile
  const longWall = (D0, H) => quad([-5000, -D0, -1], [5000, -D0, -1], [5000, -D0, H], [-5000, -D0, H]);
  const ref = (D0, H) => { let s = 0; const N = 200000; for (let i = 0; i < N; i++) { const f = -Math.PI / 2 + (i + 0.5) * Math.PI / N; s += Math.cos(f) * (S.cieF(Math.PI / 2) - S.cieF(Math.atan((H * Math.cos(f)) / D0))) * Math.PI / N; } return (s / S.EH) * 100; };
  for (const [D0, deg] of [[10, 25], [8, 40], [20, 10]]) {
    const H = D0 * Math.tan(deg * Math.PI / 180), p = S.profile(win, [longWall(D0, H)]), v = S.vsc(p), r = ref(D0, H);
    ok(Math.abs(v - r) < 0.01 && near(S.obstructionAngle(p), deg, 1e-6), `a long wall ${D0} m away rising ${deg}° above the window: VSC ${v.toFixed(2)} % = the reference ${r.toFixed(2)} % (± 0.01); obstruction angle ${deg}°`);
  }
  ok(Math.abs(S.vsc(S.profile(win, [longWall(10, 10 * Math.tan(25 * Math.PI / 180))])) - 27) < 0.5, 'BRE 209\'s rule of thumb: a 25° obstruction leaves about 27 % (27.31 %)');
  // a fin to one side: only the azimuths on that side lose sky
  const fin = quad([0.6, 0, -2], [0.6, -1, -2], [0.6, -1, 5], [0.6, 0, 5]);
  const pf = S.profile(win, [fin]);
  ok(pf.phi.every((f, i) => (f < 0 ? true : f > 31 ? pf.blocked[i].length > 0 : true)) && pf.phi.filter((f, i) => f < 0 && pf.blocked[i].length).length === 0 && S.vsc(pf) < free && S.vsc(pf) > free / 2, 'a fin on one side (0.6 m off, 1 m deep): it hides only that side\'s sky', S.vsc(pf).toFixed(2));

  // ---- a finite block in an IFC: against a brute-force count of rays over the sky
  const open = async (text) => { const eng = await quiet(IfcModel.create)(WebIFC, null); const m = await quiet((b) => eng.load(b))(new TextEncoder().encode(text)); return { api: eng.api, mid: m.modelID }; };
  const { api, mid } = await open(building({ block: true }));
  const g = S.profileWindows(D.gatherRooms(WebIFC, api, mid, { keep: true }));
  const w1 = g.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W1');
  // the block: x −20…26 m, y −12…−10 m, z 0…10 m; brute force: 1800 × 900 directions over the front sky, ray against the box
  // the reader may move the model near the origin: the box moves with W1 (its outer face centre is at 3, −0.1, 1.5 in the file)
  const sh = [w1.origin[0] - 3, w1.origin[1] + 0.1, w1.origin[2] - 1.5];
  const box = { lo: [-20 + sh[0], -12 + sh[1], 0 + sh[2]], hi: [26 + sh[0], -10 + sh[1], 10 + sh[2]] };
  const hit = (o, d) => { let t0 = 0, t1 = Infinity; for (let k = 0; k < 3; k++) { if (Math.abs(d[k]) < 1e-12) { if (o[k] < box.lo[k] || o[k] > box.hi[k]) return false; continue; } let a = (box.lo[k] - o[k]) / d[k], b = (box.hi[k] - o[k]) / d[k]; if (a > b) [a, b] = [b, a]; t0 = Math.max(t0, a); t1 = Math.min(t1, b); } return t1 >= t0; };
  let e = 0;
  const NP = 1800, NT = 900, s = w1.s, n = w1.n;
  for (let i = 0; i < NP; i++) {
    const f = -Math.PI / 2 + (i + 0.5) * Math.PI / NP, dh = [Math.cos(f) * n[0] + Math.sin(f) * s[0], Math.cos(f) * n[1] + Math.sin(f) * s[1]];
    for (let j = 0; j < NT; j++) {
      const th = (j + 0.5) * (Math.PI / 2) / NT, d = [Math.cos(th) * dh[0], Math.cos(th) * dh[1], Math.sin(th)];
      if (!hit(w1.origin, d)) e += S.L(th) * Math.cos(th) ** 2 * Math.cos(f) * (Math.PI / NP) * (Math.PI / 2 / NT);
    }
  }
  const brute = (e / S.EH) * 100;
  ok(Math.abs(w1.vsc - brute) < 0.1, `a block 46 m wide, 10 m tall, 9.9 m from W1 (an IFC): VSC ${w1.vsc.toFixed(2)} % = a brute-force count over 1.6 million sky directions ${brute.toFixed(2)} % (± 0.1)`);
  ok(near(w1.alpha, Math.atan(8.5 / 9.9) * 180 / Math.PI, 1e-6) && w1.vsc < free, 'its obstruction angle = atan(8.5 / 9.9) = 40.65°, the same as the sky-angle section square to the window');
  const w2 = g.rooms.find((r) => r.name === '101').windows.find((w) => w.name === 'W2');
  ok(w2.vsc > 30, 'W2 on the side wall: most of its sky clear', w2.vsc.toFixed(2));
  // the showcase house and the same house turned 30°: the same VSC per window
  const showcase = path.resolve(APP, '../../../../../fixtures/showcase');
  const house = async (f) => { const m = await open(fs.readFileSync(path.join(showcase, f), 'utf8')); return S.profileWindows(D.gatherRooms(WebIFC, m.api, m.mid, { keep: true })); };
  const h0 = await house('bimcraft-house.ifc'), h1 = await house('bimcraft-house-turned.ifc');
  const vs = (h) => h.rooms.flatMap((r) => r.windows.map((w) => r.name + '/' + (w.name || w.tag) + '=' + w.vsc.toFixed(2))).sort();
  ok(vs(h0).join() === vs(h1).join() && vs(h0).length === 9, 'the showcase house turned 30°: every window\'s VSC the same (2 decimals)', vs(h0).join(' ') + ' | ' + vs(h1).join(' '));
  void ROOT;
}
