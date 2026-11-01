/* SPDX-License-Identifier: Apache-2.0 */
/** traceref-test.mjs — Trace Reference geometry (0.8 SU.1055, session bim-08):  node bin/test-bimcraft.mjs --traceref */
import path from 'node:path';

export async function traceRefMode({ APP }) {
  let bad = 0;
  const ok = (c, m, d = '') => { if (!c) bad++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d ? ' (' + d + ')' : '')); };
  const near = (a, b, e = 0.01) => Math.abs(a - b) <= e;
  const T = await import(path.join(APP, 'trace-ref.js'));
  const wall = [{ a: [0, 0], b: [4000, 0], t: 200 }];
  const s0 = T.referenceSegs(wall);
  ok(s0.length === 16, 'a wall is four edges', String(s0.length));
  const ys = s0.filter((_, i) => i % 2 === 1);
  ok(Math.min(...ys) === -100 && Math.max(...ys) === 100, 'its outline is half the thickness each side');
  const s1 = T.referenceSegs(wall, [], { dx: 500, dy: -250 });
  ok(near(s1[0], s0[0] + 500) && near(s1[1], s0[1] - 250), 'moved by (dx, dy)');
  const s2 = T.referenceSegs(wall, [], { angle: 90 });
  const xs = s2.filter((_, i) => i % 2 === 0), yy = s2.filter((_, i) => i % 2 === 1);
  ok(near(Math.max(...xs) - Math.min(...xs), 200) && near(Math.max(...yy) - Math.min(...yy), 4000), 'turned 90° about its own centre: now 4000 mm tall');
  ok(near((Math.max(...xs) + Math.min(...xs)) / 2, 2000), 'the centre stays where it was');
  const b = T.referenceSegs([], [{ minX: 0, minY: 0, maxX: 300, maxY: 300 }]);
  ok(b.length === 16, 'a box (column, floor) is four edges');
  ok(T.referenceSegs([]).length === 0, 'nothing in, nothing out');
  const d = T.fitOffset([100, 200], [400, 150]);
  ok(d.dx === 300 && d.dy === -50, 'fitOffset: base point to second point');
  // another view: a callout's drawing cut to its crop, a ceiling plan by name
  const cl = T.clipSegs([-100, 50, 500, 50, 150, -100, 150, 400, 600, 600, 700, 700, 50, 50, 60, 60], [0, 0, 300, 300]);
  ok(cl.length === 12 && near(cl[0], 0) && near(cl[2], 300) && near(cl[5], 0) && near(cl[7], 300), 'a crop cuts lines at its edge (two lines clipped, one inside kept, one outside dropped)', JSON.stringify(cl));
  ok(T.clipSegs([10, 10, 20, 20], [300, 300, 0, 0]).length === 4, 'a crop given corner to corner either way round');
  const pl = T.placeSegs([0, 0, 100, 0], { dx: 10, dy: 20 });
  ok(near(pl[0], 10) && near(pl[1], 20) && near(pl[2], 110), 'placeSegs moves any segments (what a view draws) like the walls');
  ok(JSON.stringify(T.parseRef('rcp:abc')) === '{"kind":"rcp","level":"abc"}' && JSON.stringify(T.parseRef('co:callout-3')) === '{"kind":"callout","id":"callout-3"}' && T.parseRef('2xyz').kind === 'plan' && T.parseRef('') === null && T.parseRef('co:evil') .kind === 'plan', 'a reference names a level, a ceiling plan (rcp:) or a callout (co:); anything else is a level id');
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
