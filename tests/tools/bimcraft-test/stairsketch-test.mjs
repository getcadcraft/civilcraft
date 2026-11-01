/* SPDX-License-Identifier: Apache-2.0 */
/** stairsketch-test.mjs — a stair from a sketch (0.8 SU.1055, session bim-08):  node bin/test-bimcraft.mjs --stairsketch */
import path from 'node:path';

export async function stairSketchMode({ APP }) {
  let bad = 0;
  const ok = (c, m, d = '') => { if (!c) bad++; console.log((c ? '  ok   ' : '  FAIL ') + m + (!c && d ? ' (' + d + ')' : '')); };
  const near = (a, b, e = 1) => Math.abs(a - b) <= e;
  const S = await import(path.join(APP, 'stair-sketch.js'));
  const H = 2800;   // 14 risers of 200 at most 7¾" (196.85): ceil(2800/196.85) = 15
  const one = S.stairFromSketch([[0, 0], [3000, 0]], { height: H });
  ok(one.spec.kind === 'straight' && one.spec.angle === 0 && one.spec.start[0] === 0, 'one line: a straight stair going east');
  const n = Math.ceil(H / 196.85), T = n - 1;
  ok(near(one.spec.tread * T, 3000, 1), 'its tread is the line over the number of treads', String(one.spec.tread));
  ok(one.layout.checks && typeof one.layout.checks === 'object', 'the layout is worked out with the checks');
  const l = S.stairFromSketch([[0, 0], [2000, 0], [2000, 1500]], { height: H });
  ok(l.spec.kind === 'l' && l.spec.turn === 'left' && near(l.spec.split, 2000 / 3500, 0.001), 'two lines turning left: an L, split at the corner', JSON.stringify(l.spec));
  const r = S.stairFromSketch([[0, 0], [2000, 0], [2000, -1500]], { height: H });
  ok(r.spec.turn === 'right', 'turning the other way: right');
  const u = S.stairFromSketch([[0, 0], [2000, 0], [2000, 1000], [0, 1000]], { height: H });
  ok(u.spec.kind === 'u' && u.spec.turn === 'left' && near(u.spec.gap, 1000 - 914.4, 1) && near(u.spec.angle, 0), 'three lines (up, across, back): a U; the gap is the jog less the width', JSON.stringify(u.spec));
  const lw = S.stairFromSketch([[0, 0], [2000, 0], [2000, 1500]], { height: H, landing: [[1500, -400], [2400, -400], [2400, 500], [1500, 500]] });
  ok(near(lw.spec.width, 900, 1), 'a landing boundary sets the width (its short side)', String(lw.spec.width));
  const uw = S.stairFromSketch([[0, 0], [2000, 0], [2000, 1000], [0, 1000]], { height: H, landing: [[2000, -450], [2900, -450], [2900, 1450], [2000, 1450]] });
  ok(near(uw.spec.width, 900, 1) && near(uw.spec.gap, 100, 1), 'a U landing: width the short side, gap the long side less two widths', JSON.stringify([uw.spec.width, uw.spec.gap]));
  const err = (f) => { try { f(); return null; } catch (e) { return e.key; } };
  ok(err(() => S.stairFromSketch([[0, 0]], { height: H })) === 'model.err.stairsketch.lines', 'one point is not a line');
  ok(err(() => S.stairFromSketch([[0, 0], [2000, 0], [3000, 200]], { height: H })) === 'model.err.stairsketch.angle', 'two lines at 11° are not an L');
  ok(err(() => S.stairFromSketch([[0, 0], [2000, 0], [2000, 1000], [3000, 1000]], { height: H })) === 'model.err.stairsketch.u', 'three lines not coming back are not a U');
  ok(err(() => S.stairFromSketch([[0, 0], [2000, 0]], { height: 0 })) === 'model.err.stairsketch.height', 'no height, no stair');
  console.log(bad ? `\n${bad} failed` : '\nall ok');
  return bad ? 1 : 0;
}
