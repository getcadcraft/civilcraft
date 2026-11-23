/* SPDX-License-Identifier: Apache-2.0 */
/** pen-bim-test.mjs — the pen reads into BimCraft's stair sketch (0.11 SU.1807, bim-inbox-11):  node bin/test-bimcraft.mjs --pen */
import path from 'node:path';

export async function penBimMode({ APP }) {
  let bad = 0;
  const ok = (c, m, d = '') => { if (!c) bad++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d ? ' (' + d + ')' : '')); };
  const P = await import(path.join(APP, 'pen-bim.js'));
  const S = await import(path.join(APP, 'stair-sketch.js'));
  const line = (a, b, n = 30) => Array.from({ length: n }, (_, i) => [a[0] + (b[0] - a[0]) * i / (n - 1) + (i % 2 ? 6 : -6), a[1] + (b[1] - a[1]) * i / (n - 1) + (i % 3 ? 4 : -4)]);
  const one = P.strokeCorners(line([0, 0], [3000, 0]));
  ok(one.length === 2, 'a wobbly straight stroke keeps its two ends', JSON.stringify(one));
  const l = P.strokeCorners([...line([0, 0], [2000, 0]), ...line([2000, 0], [2000, 1500]).slice(1)]);
  ok(l.length === 3 && Math.abs(l[1][0] - 2000) < 60 && Math.abs(l[1][1]) < 60, 'an L stroke keeps its corner', JSON.stringify(l));
  const u = P.strokeCorners([...line([0, 0], [2000, 0]), ...line([2000, 0], [2000, 1000]).slice(1), ...line([2000, 1000], [0, 1000]).slice(1)]);
  ok(u.length === 4, 'a U stroke keeps three lines', JSON.stringify(u));
  ok(S.stairFromSketch(l, { height: 2800 }).spec.kind === 'l', 'the corners go to stairFromSketch as an L');
  ok(P.strokeCorners([]).length === 0 && P.strokeCorners([[1, 1], [1, 1]]).length === 0, 'an empty or still stroke gives no line');
  // the event path: down / move / up with pen samples
  const L = {}; const win = { addEventListener: (n, f) => { L[n] = f; }, removeEventListener: (n) => { delete L[n]; } };
  let got = null; const pen = P.penStrokes(win, (s) => { got = s; });
  const fire = (phase, samples) => L['cc-pen-stroke']({ detail: { phase, pointerId: 7, samples } });
  fire('down', [{ x: 1, y: 1, pressure: 0.4 }]); fire('move', [{ x: 5, y: 5, pressure: 0.6 }]); fire('up', [{ x: 9, y: 9, pressure: 0.5 }]);
  ok(got && got.samples.length === 3 && Math.abs(got.pressure - 0.5) < 1e-9, 'a finished pen stroke reaches the tool with its samples and mean pressure');
  ok(pen.take() && !pen.take(), 'take() gives the last stroke once');
  pen.stop(); ok(!L['cc-pen-stroke'], 'stop() removes the listener');
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
