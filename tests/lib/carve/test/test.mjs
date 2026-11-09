/* SPDX-License-Identifier: Apache-2.0 */
// node lib/carve/test/test.mjs — the carving engine (0.9 SU.886, session `carve-09`). Toolpaths are cut into a simulated block (lib/sim.js) and the result
// is compared with the ideal: V-carve depth = distance to the edge / tan(half angle), a relief = the picture, never cut below it.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const C = await import(path.join(HERE, '../lib/index.js'));
const { vcarve, relief, engrave, gcode, parseGcode, cleanPost, POSTS, checkProgram, makeSim, cutPaths, simulate, makeField, nearest, at, medialAxis, contours, simplify, flattenBulges, polish, cleanJob, heightField } = C;

let good = 0, bad = 0;
const ok = (c, m, extra = '') => { if (c) { good++; console.log('  ok   ' + m); } else { bad++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const throws = (fn, key) => { try { fn(); return false; } catch (e) { return e.key === key; } };
const circ = (R, N = 360, cx = 0, cy = 0) => Array.from({ length: N }, (_, k) => [cx + R * Math.cos((k * 2 * Math.PI) / N), cy + R * Math.sin((k * 2 * Math.PI) / N)]);
const star = Array.from({ length: 10 }, (_, k) => { const r = k % 2 ? 5 : 12, a = (k * Math.PI) / 5; return [r * Math.cos(a), r * Math.sin(a)]; });
const SHAPES = { rect: [[[0, 0], [20, 0], [20, 10], [0, 10]]], ring: [circ(10), circ(6)], L: [[[0, 0], [30, 0], [30, 6], [6, 6], [6, 30], [0, 30]]], star: [star], disc: [circ(10)] };

console.log('== geometry helpers');
{
  const pts = Array.from({ length: 101 }, (_, i) => [i, 0.001 * Math.sin(i), i * 0.5]);
  ok(simplify(pts, 0.05).length === 2, 'simplify drops points on a straight 3D ramp');
  ok(simplify([[0, 0, 0], [5, 0, 0], [5, 0, -3], [10, 0, -3]], 0.1).length === 4, 'simplify keeps a corner and a plunge (z counts)');
  const arc = flattenBulges([{ x: 0, y: 0, b: 1 }, { x: 10, y: 0 }], false, 0.02);   // bulge 1 = a half circle of radius 5
  const sag = Math.max(...arc.map((p) => Math.abs(Math.hypot(p[0] - 5, p[1]) - 5)));
  ok(arc.length > 10 && sag < 1e-9, 'a bulge becomes chords whose corners lie on the arc', String(sag));
  const mid = arc[Math.floor(arc.length / 2)], chordMid = [(arc[Math.floor(arc.length / 2) - 1][0] + mid[0]) / 2, (arc[Math.floor(arc.length / 2) - 1][1] + mid[1]) / 2];
  ok(Math.abs(Math.hypot(chordMid[0] - 5, chordMid[1]) - 5) <= 0.021, 'and no chord sags more than the tolerance (0.02 mm)');
}

console.log('== distance field');
{
  const F = makeField(SHAPES.rect, { res: 0.1 });
  ok(Math.abs(at(F, 10, 5) - 5) < 0.06 && Math.abs(F.max - 5) < 0.1, 'a 20 × 10 rectangle is 5 mm from its edge in the middle', String(F.max));
  const nn = nearest(F, 3, 4);
  ok(Math.abs(nn.d - 3) < 1e-9 && Math.abs(nn.px) < 1e-9 && Math.abs(nn.py - 4) < 1e-9, 'nearest(): exact distance (3 mm to the left edge) and its foot point (0, 4)');
  const C = makeField(SHAPES.disc, { res: 0.1 });
  ok(Math.abs(nearest(C, 3, 4).d - 5) < 0.001, 'the disc: 5 mm from the edge at radius 5');
  const R = makeField(SHAPES.ring, { res: 0.1 });
  ok(R.inside[Math.floor((8 - R.x0) / R.res) + Math.floor((0 - R.y0) / R.res) * R.w] === 1 && R.inside[Math.floor((0 - R.x0) / R.res) + Math.floor((0 - R.y0) / R.res) * R.w] === 0, 'even-odd: the ring is filled, its hole is not');
  ok(throws(() => makeField(SHAPES.rect, { res: 0.001 }), 'carve.err.big'), 'a grid over 12 million cells is refused with a message');
  const t = Date.now(); const B = makeField([[[0, 0], [300, 0], [300, 200], [0, 200]]], { res: 0.1 });
  ok(Date.now() - t < 6000 && B.w * B.h > 5e6, 'a 300 × 200 mm part at 0.1 mm (6 million cells) builds in a few seconds', Date.now() - t + ' ms');
}

console.log('== contours');
{
  const F = makeField(SHAPES.disc, { res: 0.1 });
  const cs = contours(F.dist, F.w, F.h, 4, { x0: F.x0, y0: F.y0, res: F.res });
  const r = cs[0].pts.map((p) => Math.hypot(p[0], p[1]));
  ok(cs.length === 1 && cs[0].closed && Math.abs(Math.max(...r) - 6) < 0.03 && Math.abs(Math.min(...r) - 6) < 0.03, 'the level 4 mm inside a radius-10 disc is one closed loop of radius 6', Math.min(...r) + '..' + Math.max(...r));
  const G = makeField(SHAPES.ring, { res: 0.1 });
  ok(contours(G.dist, G.w, G.h, 1, { x0: G.x0, y0: G.y0, res: G.res }).length === 2, 'a level inside a ring is two loops (outer and inner)');
  ok(contours(G.dist, G.w, G.h, 99, { x0: G.x0, y0: G.y0, res: G.res }).length === 0, 'a level higher than the field is nothing');
}

console.log('== medial axis');
{
  const R = medialAxis(makeField(SHAPES.ring, { res: 0.1 }));
  const loop = R.find((p) => p.closed);
  ok(R.length === 1 && loop && Math.abs(Math.min(...loop.pts.map((p) => Math.hypot(p[0], p[1]))) - 8) < 0.12 && Math.abs(Math.max(...loop.pts.map((p) => Math.hypot(p[0], p[1]))) - 8) < 0.12, 'a ring (radius 6 to 10) has one closed axis at radius 8');
  const D = medialAxis(makeField(SHAPES.disc, { res: 0.1 }));
  ok(D.length === 1 && D[0].pts.length === 1 && Math.hypot(D[0].pts[0][0], D[0].pts[0][1]) < 0.3, 'a disc has a single point, its centre', JSON.stringify(D.map((p) => p.pts.length)));
  const Rt = medialAxis(makeField(SHAPES.rect, { res: 0.1 }));
  const ends = Rt.flatMap((p) => [p.pts[0], p.pts[p.pts.length - 1]]).filter((p) => p[2] < 0.6);
  const corners = [[0, 0], [20, 0], [20, 10], [0, 10]];
  ok(corners.every((c) => ends.some((p) => Math.hypot(p[0] - c[0], p[1] - c[1]) < 0.8)), 'a rectangle: a branch runs into each of its four corners');
  const F = makeField(SHAPES.rect, { res: 0.1 });
  const q = polish(F, 7.04, 5.07);
  ok(Math.abs(q[1] - 5) < 0.002 && Math.abs(q[2] - 5) < 0.002, 'polish() moves a point off the axis back onto the bisector (the middle of the 10 mm width)', q.join());
  const c = polish(F, 1.23, 0.6);   // on the diagonal toward the corner the axis is where the two distances match
  ok(Math.abs(c[0] - c[1]) < 0.01 && Math.abs(c[2] - c[0]) < 0.01, 'and onto the corner bisector, where the distance to both edges is equal', c.join());
}

console.log('== V-carve against the ideal (the simulator cuts the toolpaths)');
{
  const maxDepth = 3, res = 0.1, sr = 0.05;
  for (const angle of [60, 90]) {
    for (const [name, loops] of Object.entries(SHAPES)) {
      const r = vcarve(loops, { angle, maxDepth, res, clear: { mode: 'endmill', dia: 3 } });
      const F = r.field, S = simulate(r.ops, { x0: F.x0, y0: F.y0, x1: F.x0 + F.w * res, y1: F.y0 + F.h * res, res: sr });
      const tanH = Math.tan((angle * Math.PI) / 360), tolG = (1.5 * sr) / tanH + 0.05;
      let n = 0, gouge = 0, left = 0, wG = 0, wL = 0;
      for (let j = 0; j < S.h; j++) {
        for (let i = 0; i < S.w; i++) {
          const x = S.x0 + i * sr, y = S.y0 + j * sr, ci = Math.floor((x - F.x0) / res), cj = Math.floor((y - F.y0) / res);
          if (ci < 0 || cj < 0 || ci >= F.w || cj >= F.h || !F.inside[cj * F.w + ci]) continue;
          const d = nearest(F, x, y).d;
          if (d < 0.3) continue;
          n++;
          const want = -Math.min(d / tanH, maxDepth), got = S.z[j * S.w + i];
          if (got < want - tolG) { gouge++; wG = Math.max(wG, want - got); }
          if (got > want + 0.3) { left++; wL = Math.max(wL, got - want); }
        }
      }
      ok(gouge === 0 && wG < tolG, `${angle}° ${name}: nothing cut deeper than the ideal V-carve (more than ${tolG.toFixed(2)} mm)`, `${gouge} cells, worst ${wG.toFixed(3)}`);
      ok(left / n < 0.005, `${angle}° ${name}: under 0.5 % of the shape is left more than 0.3 mm shallower`, `${left} of ${n} (${(100 * left / n).toFixed(2)} %), worst ${wL.toFixed(2)}`);
    }
  }
  const r = vcarve(SHAPES.ring, { angle: 60, maxDepth: 5, res: 0.1 });
  const axis = r.ops.find((o) => o.id === 'vcarve').paths.flat();
  ok(r.ops.length === 1 && Math.abs(axis[0][2] + 2 / Math.tan(Math.PI / 6)) < 0.03, 'a ring 4 mm wide, deep enough: one V-bit pass, the tip at 2 / tan(30°) = 3.46 mm', String(axis[0][2]));
  ok(r.stats.wide === false && r.ops.every((o) => o.paths.flat().every((p) => p[2] >= -5 - 1e-9)), 'no clearing and nothing below the maximum depth');
  const w = vcarve(SHAPES.rect, { angle: 60, maxDepth: 3, res: 0.1, clear: { mode: 'endmill', dia: 3 } });
  ok(w.ops[0].id === 'clear' && w.ops[0].tool.type === 'flat' && w.ops[1].tool.type === 'v' && w.ops.every((o) => o.paths.flat().every((p) => p[2] >= -3 - 1e-9)), 'a wide shape: the flat mill clears first, then the V-bit; nothing below the flat depth');
  ok(vcarve(SHAPES.rect, { angle: 60, maxDepth: 3, res: 0.1, clear: { mode: 'none' } }).stats.warnings.includes('carve.warn.floor'), 'clearing off: the floor is left and the plan says so');
  ok(throws(() => vcarve(SHAPES.disc, { angle: 60, maxDepth: 3, res: 0.1, clear: { mode: 'vbit' }, ridgeTol: 0.001 }), 'carve.err.manypasses'), 'V-bit clearing of a huge floor is refused when it would take over 400 passes');
  ok(vcarve(SHAPES.rect, { angle: 60, maxDepth: 3, res: 0.1, clear: { mode: 'vbit' }, ridgeTol: 0.2 }).ops.length === 1, 'V-bit clearing works as one operation when the floor is small enough');
  ok(throws(() => vcarve([], {}), 'carve.err.noshape') && throws(() => vcarve([[[0, 0], [1, 1]]], {}), 'carve.err.noshape'), 'no closed shape is refused with a message');
}

console.log('== relief from a depth map');
{
  const N = 120, data = new Float32Array(N * N);
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const x = (i - N / 2 + 0.5) / (N / 2), y = (j - N / 2 + 0.5) / (N / 2), r = Math.hypot(x, y); data[j * N + i] = r < 1 ? Math.sqrt(1 - r * r) : 0; }
  const img = { w: N, h: N, data };
  const hf = heightField(img, { width: 60, depth: 5 });
  ok(hf.w === 120 && Math.abs(hf.p - 0.5) < 1e-9 && Math.abs(Math.min(...hf.z) + 5) < 1e-6 && Math.max(...hf.z) <= 0 && Math.abs(hf.z[Math.floor(N / 2) * N + N / 2] - 0) < 0.07, 'the picture becomes a height field: white at the top (0), black at the full depth, 0.5 mm cells');
  ok(Math.abs(heightField(img, { width: 60, depth: 5, invert: true }).z[0]) < 1e-6, 'inverted: black is the top');
  const flatImg = { w: 4, h: 4, data: new Float32Array(16).fill(1) };
  ok(heightField(flatImg, { width: 8, depth: 2 }).z.every((v) => v === 0) && throws(() => heightField({ w: 1, h: 1, data: [1] }, {}), 'carve.err.image'), 'a white picture is the untouched top; a bad picture is refused');
  const target = (H, x, y) => { const fx = x / H.p - 0.5, fy = y / H.p - 0.5, i = Math.max(0, Math.min(H.w - 2, Math.floor(fx))), j = Math.max(0, Math.min(H.h - 2, Math.floor(fy))), tx = fx - i, ty = fy - j; const z = (a, b) => H.z[b * H.w + a]; return z(i, j) * (1 - tx) * (1 - ty) + z(i + 1, j) * tx * (1 - ty) + z(i, j + 1) * (1 - tx) * ty + z(i + 1, j + 1) * tx * ty; };
  const slope = (H, x, y) => { const i = Math.min(H.w - 2, Math.max(1, Math.floor(x / H.p))), j = Math.min(H.h - 2, Math.max(1, Math.floor(y / H.p))); return Math.hypot((H.z[j * H.w + i + 1] - H.z[j * H.w + i - 1]) / (2 * H.p), (H.z[(j + 1) * H.w + i] - H.z[(j - 1) * H.w + i]) / (2 * H.p)); };
  for (const tool of [{ type: 'ball', dia: 3 }, { type: 'v', angle: 60 }, { type: 'flat', dia: 2 }]) {
    const r = relief(img, { width: 60, depth: 5, tool, rough: { tool: { type: 'flat', dia: 6 }, stepdown: 1.5, stepover: 0.5, leave: 0.3 } });
    const H = r.height, sr = 0.25;
    const S = makeSim({ x0: 0, y0: 0, x1: H.width, y1: H.height, res: sr });
    const rough = r.ops.find((o) => o.id === 'rough'), fin = r.ops.find((o) => o.id === 'finish');
    const scan = (lo, hi) => { let n = 0, over = 0, left = 0, wO = 0, wL = 0; for (let j = 0; j < S.h; j++) for (let i = 0; i < S.w; i++) { const x = i * sr, y = j * sr; if (x < 3.6 || y < 3.6 || x > H.width - 3.6 || y > H.height - 3.6 || slope(H, x, y) > 1) continue; n++; const t = target(H, x, y), g = S.z[j * S.w + i]; if (g < t + lo) { over++; wO = Math.max(wO, t + lo - g); } if (g > t + hi) { left++; wL = Math.max(wL, g - t - hi); } } return { n, over, left, wO, wL }; };
    cutPaths(S, rough.paths, rough.tool);
    let s = scan(-0.05, 1e9);
    let removed = 0, wanted = 0;
    for (let j = 0; j < S.h; j++) for (let i = 0; i < S.w; i++) { const x = i * sr, y = j * sr; if (x < 3.6 || y < 3.6 || x > H.width - 3.6 || y > H.height - 3.6 || slope(H, x, y) > 1) continue; removed -= S.z[j * S.w + i]; wanted -= target(H, x, y); }
    ok(s.over === 0, `${tool.type}: roughing never cuts into the picture`, `${s.over} cells, worst ${s.wO.toFixed(3)}`);
    ok(removed / wanted > 0.35, `${tool.type}: and takes out a good part of the material before finishing (a flat mill leaves a wedge on slopes: the finishing pass does the rest)`, (100 * removed / wanted).toFixed(0) + ' %');
    cutPaths(S, fin.paths, fin.tool);
    s = scan(-0.1, tool.type === 'v' ? 0.7 : 0.3);
    ok(s.over === 0, `${tool.type}: finishing never cuts below the picture (a cutter dropped on it cannot gouge)`, `${s.over} cells, worst ${s.wO.toFixed(3)}`);
    ok(s.left / s.n < 0.02, `${tool.type}: and leaves almost nothing above it (stepover ${r.stats.stepover.toFixed(2)} mm${r.stats.scallop !== null ? ', scallop ' + r.stats.scallop.toFixed(3) + ' mm' : ''})`, `${s.left} of ${s.n}, worst ${s.wL.toFixed(2)}`);
  }
  const ball = relief(img, { width: 60, depth: 5, tool: { type: 'ball', dia: 6 }, stepover: 0.1, rough: null });
  ok(ball.ops.length === 1 && ball.ops[0].id === 'finish' && Math.abs(ball.stats.scallop - (3 - Math.sqrt(9 - 0.09))) < 1e-9, 'rough: null → only the finishing pass, and the ball scallop is r - sqrt(r² - (stepover / 2)²)');
  const vert = relief(img, { width: 60, depth: 5, tool: { type: 'ball', dia: 3 }, rough: null, direction: 'y' }).ops[0].paths[0];
  ok(vert.every((p) => Math.abs(p[0] - vert[0][0]) < 1e-9), 'direction y: each line runs along y');
  ok(relief(img, { width: 60, depth: 5, tool: { type: 'ball', dia: 3 }, rough: null }).ops[0].paths.every((p) => p.every((q) => q[2] <= 0 && q[2] >= -5 - 1e-9)), 'every point is between the top and the full depth');
  ok(throws(() => relief(img, { tool: { type: 'ball', dia: 0 } }), 'carve.err.tool'), 'a ball tool needs a diameter');
}

console.log('== engraving');
{
  const e = engrave([{ pts: [[0, 0], [20, 0]], closed: false }], { depth: 1, tool: { type: 'v', angle: 60 } });
  ok(Math.abs(e.stats.width - 2 * Math.tan(Math.PI / 6)) < 1e-9 && e.ops[0].paths.length === 1 && e.ops[0].paths[0].every((p) => p[2] === -1), 'a 1 mm deep line with a 60° V-bit is 1.155 mm wide at the top');
  const S = simulate(e.ops, { x0: -2, y0: -3, x1: 22, y1: 3, res: 0.02 });
  let wTop = 0;
  const j0 = Math.round(3 / 0.02), mid = Math.round((10 + 2) / 0.02);
  for (let j = 0; j < S.h; j++) if (S.z[j * S.w + mid] < -0.02) wTop = Math.max(wTop, Math.abs((j - j0) * 0.02) * 2);
  ok(Math.abs(wTop - 1.155) < 0.1 && (() => { let m = 0; for (const v of S.z) if (v < m) m = v; return Math.abs(m + 1) < 0.02; })(), 'cut into the block, the groove is that wide and 1 mm deep', String(wTop));
  const m = engrave([{ pts: [[0, 0], [10, 0], [10, 10]], closed: true }], { depth: 2, passDepth: 0.5 });
  ok(m.stats.passes === 4 && m.ops[0].paths.length === 4 && m.ops[0].paths.every((p) => p[0][0] === p[p.length - 1][0] && p[0][1] === p[p.length - 1][1]), 'passDepth 0.5 for 2 mm: four passes, each a closed loop back to its start');
  ok(throws(() => engrave([], {}), 'carve.err.noshape'), 'nothing to engrave is refused');
}

console.log('== G-code and the post-processor');
{
  const r = vcarve(SHAPES.rect, { angle: 60, maxDepth: 3, res: 0.1, clear: { mode: 'endmill', dia: 3 } });
  const job = { feed: 800, plunge: 250, rpm: 16000, name: 'Sign' };
  const g = gcode(r.ops, job, POSTS.grbl);
  const moves = parseGcode(g.text);
  const cuts = moves.filter((m) => m.g === 1 && m.z !== null && m.z < 0);
  const want = r.ops.flatMap((o) => o.paths.flat()).length;
  ok(cuts.length >= want * 0.9 && moves.every((m) => m.x === null || Number.isFinite(m.x)), 'the program reads back: its cutting moves are the toolpath points', cuts.length + ' vs ' + want);
  const first = r.ops[0].paths[0][1];
  ok(moves.some((m) => m.g === 1 && Math.abs(m.x - first[0]) < 0.001 && Math.abs(m.y - first[1]) < 0.001 && Math.abs(m.z - first[2]) < 0.001), 'a point of the toolpath appears in the G-code to 0.001 mm');
  ok(/^G21$/m.test(g.text) && /^M3 S16000$/m.test(g.text) && /\(Sign\)/.test(g.text) && /^M2$/m.test(g.text.trim().split('\n').slice(-1)[0]) && (g.text.match(/^M3 S/gm) || []).length === 2 && (g.text.match(/^M5$/gm) || []).length >= 3, 'GRBL post: millimetres, spindle on per tool, a comment, M5 between, M2 at the end');
  ok(/^M0 \(Change to flat 3 mm/m.test(g.text), 'GRBL asks you to change the tool (it has no M6): a pause naming the tool');
  const lc = gcode(r.ops, job, POSTS.linuxcnc).text;
  ok(/^T1 M6$/m.test(lc) && /^T2 M6$/m.test(lc) && /^G43 H2$/m.test(lc), 'LinuxCNC post: T1 M6 then T2 M6 with a length offset');
  const fn = gcode(r.ops, job, POSTS.fanuc).text;
  ok(/^%$/m.test(fn) && /^O0001$/m.test(fn) && /^N\d+ T1 M6$/m.test(fn), 'Fanuc post: % and a program number, numbered blocks');
  const inch = gcode(r.ops, job, POSTS.fanuc).text, inchG = gcode(r.ops, { ...job, unit: 'in' }, POSTS.fanuc);
  ok(/G20/.test(inchG.text) && !/G21/.test(inchG.text) && inch !== inchG.text, 'inches: G20 even in a header line with several words');
  const mi = parseGcode(inchG.text).filter((m) => m.g === 1 && m.z !== null && m.z < 0);
  ok(mi.every((m) => m.mm === false) && Math.abs(mi.map((m) => m.z).reduce((a, b) => Math.min(a, b)) * 25.4 + 3) < 0.01, 'and the coordinates are divided by 25.4 (3 mm deep = 0.1181 in)');
  const modal = gcode(r.ops, job, { ...POSTS.grbl, modal: false }), compact = gcode(r.ops, job, POSTS.grbl);
  ok(compact.text.length < modal.text.length * 0.8 && parseGcode(modal.text).length === parseGcode(compact.text).length, 'modal output (words that did not change left out) is shorter and means the same');
  const mine = { ...POSTS.grbl, id: 'mine', name: 'My router', header: ['G21', 'G90', '(my header {unit})'], spindleOn: 'M3 S{rpm} (on)', footer: ['G0 Z{safe}', 'M30'], decimals: 2, lineNumbers: true };
  const mt = gcode(r.ops, job, mine).text;
  ok(/\(my header mm\)/.test(mt) && /M3 S16000 \(on\)/.test(mt) && /M30/.test(mt) && /^N\d+ /m.test(mt) && !/\d\.\d{3}\b/.test(mt.split('\n').filter((l) => /^N\d+ [GXYZ]/.test(l)).join('\n')), 'an edited post: its header, spindle line, footer, numbering and two decimals are used');
  const dirty = cleanPost({ id: 'x y!', header: ['G21\u0000', 'A'.repeat(500)], decimals: 99, comment: 'weird' });
  ok(dirty.id === 'grbl' && dirty.header[0] === 'G21 ' && dirty.header[1].length === 200 && dirty.decimals === 3 && dirty.comment === 'paren', 'cleanPost: bad id, control characters, long lines, decimals and comment style are corrected');
  ok(cleanJob({ unit: 'x', feed: -5, rpm: 1e9, safeZ: 'a', name: 'a(b)\nc' }).feed === 1000 && cleanJob({ rpm: 1e9 }).rpm === 12000 && cleanJob({ name: 'a(b)' }).name === 'a b ', 'cleanJob: out-of-range numbers fall back, parentheses leave the name');
  ok(g.stats.tools === 2 && g.stats.minutes > 0 && g.stats.cut > 0 && g.stats.rapid > 0, 'stats: tools, cutting length, rapid length and a time estimate');
}

console.log('== the checker (for our programs and anyone\'s)');
{
  const r = vcarve(SHAPES.rect, { angle: 60, maxDepth: 3, res: 0.1, clear: { mode: 'endmill', dia: 3 } });
  const text = gcode(r.ops, { feed: 800, plunge: 250, rpm: 16000 }, POSTS.grbl).text;
  const limits = { bed: { x0: -1, y0: -1, x1: 25, y1: 15 }, maxDepth: 3.01 };
  const good1 = checkProgram(text, limits);
  ok(good1.ok && good1.stats.cuts > 100 && good1.stats.unit === 'mm' && Math.abs(good1.stats.minZ + 3) < 1e-6, 'our own program passes (millimetres, 3 mm deep, many cuts)', JSON.stringify(good1.issues));
  const keys = (t, l = limits) => checkProgram(t, l).issues.map((i) => i.key);
  ok(keys(text.replace(/ F\d+/g, '')).includes('nofeed'), 'no feed rate anywhere: flagged');
  ok(keys(text.replace(/^M3 S\d+$/gm, '')).includes('nospindle'), 'cutting with the spindle never started: flagged');
  ok(keys(text.replace(/^G0 Z2$/m, 'G0 Z-1')).includes('rapidcut') || keys(text.replace(/^(G1 Z0 F250)$/m, 'G0 Z-2\nG0 X30 Y30\n$1')).includes('rapidcut'), 'a rapid across the work below the top: flagged');
  ok(keys(text, { ...limits, bed: { x0: 0, y0: 0, x1: 10, y1: 5 } }).includes('outsidebed'), 'a move outside the bed: flagged');
  ok(keys(text, { ...limits, maxDepth: 2 }).includes('toodeep'), 'cutting deeper than the stock allows: flagged');
  ok(keys(text.replace(/^G21$/m, '')).includes('nounit') && keys(text.replace(/^M2$/m, '')).includes('noend'), 'no unit declared and no program end: flagged');
  ok(keys('G21\nM3 S1000\nG0 X0 Y0 Z5\nM2\n').includes('nocuts'), 'a program with no cuts: flagged');
  const inch = checkProgram('G20\nM3 S1000\nG0 X0 Y0 Z0.2\nG1 Z-0.1 F20\nG1 X2 F20\nM5\nM2\n', { bed: { x0: 0, y0: 0, x1: 100, y1: 100 }, maxDepth: 3 });
  ok(inch.ok && Math.abs(inch.stats.minZ + 2.54) < 1e-9 && inch.stats.unit === 'in', 'someone else\'s inch program: read in inches, depth converted to millimetres (0.1 in = 2.54 mm)', JSON.stringify(inch.issues));
}

console.log((bad ? 'FAILED ' : 'passed ') + good + ' / ' + (good + bad));
process.exit(bad ? 1 : 0);
