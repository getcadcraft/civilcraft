/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laser-plan.js — from a job's settings and the drawing's shapes and pictures to the head's moves (0.7 SU.772, session `make-07`).
 * DOM-free; imports laser-model.js, laser-geom.js, laser-image.js. The G-code (laser-gcode.js) and the preview both read this
 * plan, so what is previewed is what is sent.
 *
 *   plan(job, input) → { ops, bounds, origin, stats, warnings }
 *     input = { shapes: [{ layer, loops: [path…], closed = true }], pictures: [{ layer, x, y, w, h, pw, ph, gray }] }
 *       path = [{ x, y, b? }] (bulge arcs, see laser-geom.js); a picture is grey values (0 black … 255 white, row 0 on top) laid on
 *       the rectangle x, y (lower left), w × h (mm)
 *     ops: [{ layer, mode, speed, power, passes, moves }] in the order the laser runs them: pictures, fills, line engraving, scores,
 *       then cuts (layers of one mode in the job's order); within an operation the paths run inside-first (a loop inside another
 *       goes before it) and, at one depth, by nearest neighbour from where the head is
 *     move: { x, y, s, start?, link?, rapid? } in machine coordinates (the job's lower left corner is 0, 0 unless origin is
 *       'drawing'); s is the S value the laser burns at when it gets there (0 = laser off); `start` begins a path: a rapid (G0)
 *       to it, or, with `link`, a feed move with the laser off; a move with `rapid` crosses blank space fast with the laser off
 *     bounds: the box of everything that burns (overscan not counted), machine coordinates · origin: the drawing point that is 0, 0
 *     stats: { burn, travel (mm), time (s, without acceleration), paths, moves, passes }
 *     warnings: [{ code, layer?, … }] 'no-geometry' 'open-fill' 'zero-power' 'shape-skipped' 'picture-skipped' 'out-of-bed' 'empty-layer'
 */
import { ORDER, sValue } from './laser-model.js';
import { flatten, bounds as boxOf, depths, hatch, unrotate, orderPaths } from './laser-geom.js';
import { resample, dither, runs } from './laser-image.js';

const RAPID_GAP = 5;           // mm of blank in a line crossed by a rapid instead of a feed move

export function plan(job, input = {}) {
  const warnings = [];
  const machine = job.machine, tol = machine.tol;
  const shapes = (input.shapes || []).filter((s) => s && Array.isArray(s.loops));
  const pictures = (input.pictures || []).filter((p) => p && p.w > 0 && p.h > 0 && p.pw > 0 && p.ph > 0 && p.gray);
  const layerOf = new Map(job.layers.map((l, i) => [l.name, { ...l, index: i }]));
  const active = (name) => { const l = layerOf.get(name); return l && l.mode !== 'off' ? l : null; };

  // the geometry of every active layer, flattened once; bounds of everything that burns
  const items = [];                                   // { layer, loops: [{ pts, closed }] }
  let box = null;
  const grow = (b) => { box = box ? { x0: Math.min(box.x0, b.x0), y0: Math.min(box.y0, b.y0), x1: Math.max(box.x1, b.x1), y1: Math.max(box.y1, b.y1) } : { ...b }; };
  for (const s of shapes) {
    const l = active(s.layer);
    if (!l) continue;
    if (l.mode === 'image') { warnings.push({ code: 'shape-skipped', layer: l.name }); continue; }
    const closed = s.closed !== false;
    if (l.mode === 'fill' && !closed) { warnings.push({ code: 'open-fill', layer: l.name }); continue; }
    const loops = s.loops.filter((p) => Array.isArray(p) && p.length >= 2).map((p) => ({ pts: flatten(p, closed, tol), closed }));
    if (!loops.length) continue;
    for (const lp of loops) grow(boxOf(lp.pts));
    items.push({ layer: l, loops });
  }
  const pics = [];
  for (const p of pictures) {
    const l = active(p.layer);
    if (!l) continue;
    if (l.mode !== 'image') { warnings.push({ code: 'picture-skipped', layer: l.name }); continue; }
    grow({ x0: p.x, y0: p.y, x1: p.x + p.w, y1: p.y + p.h });
    pics.push({ layer: l, pic: p });
  }
  if (!box) return { ops: [], bounds: null, origin: { x: 0, y: 0 }, stats: { burn: 0, travel: 0, time: 0, paths: 0, moves: 0, passes: 0 }, warnings: [...warnings, { code: 'no-geometry' }] };

  const origin = job.origin === 'drawing' ? { x: 0, y: 0 } : { x: box.x0, y: box.y0 };
  const M = (x, y, s, extra = {}) => ({ x: x - origin.x, y: y - origin.y, s, ...extra });
  const head0 = { x: box.x0, y: box.y0 };

  const ops = [];
  const modeLayers = [...layerOf.values()].filter((l) => l.mode !== 'off').sort((a, b) => ORDER[a.mode] - ORDER[b.mode] || a.index - b.index);
  let head = head0;
  for (const l of modeLayers) {
    const S = sValue(machine, l.power);
    if (l.power <= 0) warnings.push({ code: 'zero-power', layer: l.name });
    const moves = [];
    const mine = items.filter((it) => it.layer === l);
    const myPics = pics.filter((q) => q.layer === l);
    if (!mine.length && !myPics.length) { warnings.push({ code: 'empty-layer', layer: l.name }); continue; }

    if (l.mode === 'cut' || l.mode === 'score' || l.mode === 'engrave') {
      const paths = [];
      for (const it of mine) for (const lp of it.loops) paths.push({ pts: lp.pts, closed: lp.closed });
      const closedIdx = paths.map((p, i) => (p.closed ? i : -1)).filter((i) => i >= 0);
      const d = depths(closedIdx.map((i) => paths[i].pts));
      closedIdx.forEach((i, k) => { paths[i].depth = d[k]; });
      for (const p of paths) if (!p.closed) p.depth = 0;
      // inside first: deepest group first; open paths run with the outermost
      const levels = [...new Set(paths.map((p) => p.depth))].sort((a, b) => b - a);
      for (const dep of levels) {
        for (const p of orderPaths(paths.filter((q) => q.depth === dep), head)) {
          const pts = p.pts;
          moves.push(M(pts[0].x, pts[0].y, 0, { start: true }));
          for (let i = 1; i < pts.length; i++) moves.push(M(pts[i].x, pts[i].y, S));
          if (p.closed) moves.push(M(pts[0].x, pts[0].y, S));
          head = p.closed ? pts[0] : pts[pts.length - 1];
        }
      }
    } else if (l.mode === 'fill') {
      const angles = l.crosshatch ? [l.angle, l.angle + 90] : [l.angle];
      for (const ang of angles) {
        for (const it of orderShapes(mine, head)) {
          const lines = hatch(it.loops.map((lp) => lp.pts), { interval: l.interval, angle: ang });
          head = scanMoves(moves, lines, ang, l, S, M, head);
        }
      }
    } else if (l.mode === 'image') {
      for (const { pic } of myPics) head = imageMoves(moves, pic, l, machine, M, head);
    }
    if (moves.length) ops.push({ layer: l.name, mode: l.mode, speed: l.speed, power: l.power, passes: l.passes, moves });
  }

  // machine-coordinate bounds, the bed, and the time
  const bounds = { x0: box.x0 - origin.x, y0: box.y0 - origin.y, x1: box.x1 - origin.x, y1: box.y1 - origin.y };
  if ((machine.bedW > 0 && bounds.x1 > machine.bedW + 1e-6) || (machine.bedH > 0 && bounds.y1 > machine.bedH + 1e-6) || bounds.x0 < -1e-6 || bounds.y0 < -1e-6) {
    if (machine.bedW > 0 || machine.bedH > 0) warnings.push({ code: 'out-of-bed', w: bounds.x1 - Math.min(0, bounds.x0), h: bounds.y1 - Math.min(0, bounds.y0) });
  }
  const stats = { burn: 0, travel: 0, time: 0, paths: 0, moves: 0, passes: 0 };
  for (const op of ops) {
    let px = 0, py = 0;
    for (const m of op.moves) {
      const d = Math.hypot(m.x - px, m.y - py);
      const fast = (m.start && !m.link) || m.rapid;
      if (m.s > 0) { stats.burn += d * op.passes; stats.time += d / op.speed * 60 * op.passes; }
      else if (fast) { stats.travel += d * op.passes; stats.time += d / machine.rapid * 60 * op.passes; }
      else { stats.travel += d * op.passes; stats.time += d / op.speed * 60 * op.passes; }
      if (m.start) stats.paths += op.passes;
      stats.moves += op.passes;
      px = m.x; py = m.y;
    }
    stats.passes += op.passes;
  }
  return { ops, bounds, origin, stats, warnings };
}

/** Shapes of a fill layer in nearest-neighbour order of their bounding boxes' lower left corners. */
function orderShapes(items, head) {
  const left = items.slice(), out = [];
  let h = head;
  while (left.length) {
    let bi = 0, bd = Infinity;
    left.forEach((it, i) => { const b = boxOf(it.loops[0].pts); const d = Math.hypot(b.x0 - h.x, b.y0 - h.y); if (d < bd) { bd = d; bi = i; } });
    const it = left.splice(bi, 1)[0];
    out.push(it);
    const b = boxOf(it.loops[0].pts);
    h = { x: b.x0, y: b.y0 };
  }
  return out;
}

/** Scan lines (rotated frame) → moves in drawing coordinates, boustrophedon when bidirectional. Returns the new head position. */
function scanMoves(moves, lines, angle, l, S, M, head) {
  let dir = 1, prev = null;
  const os = l.overscan;
  for (const line of lines) {
    const spans = dir > 0 ? line.spans : line.spans.slice().reverse().map(([a, b]) => [b, a]);
    const first = spans[0][0], last = spans[spans.length - 1][1];
    const P = (x) => unrotate({ x, y: line.y }, angle);
    const a = P(first - dir * os), a2 = P(first);
    const link = !!(l.bidirectional && prev && Math.hypot(a.x - prev.x, a.y - prev.y) <= RAPID_GAP);
    moves.push(M(a.x, a.y, 0, { start: true, ...(link ? { link: true } : {}) }));
    if (os > 0) moves.push(M(a2.x, a2.y, 0));
    for (let i = 0; i < spans.length; i++) {
      const [xa, xb] = spans[i], pa = P(xa), pb = P(xb);
      if (i > 0) { const pg = P(spans[i - 1][1]); if (Math.hypot(pa.x - pg.x, pa.y - pg.y) >= RAPID_GAP) moves.push(M(pa.x, pa.y, 0, { rapid: true })); else moves.push(M(pa.x, pa.y, 0)); }
      moves.push(M(pb.x, pb.y, S));
    }
    const e = P(last + dir * os);
    if (os > 0) moves.push(M(e.x, e.y, 0));
    prev = os > 0 ? e : P(last);
    head = prev;
    if (l.bidirectional) dir = -dir;
  }
  return head;
}

function imageMoves(moves, pic, l, machine, M, head) {
  const cols = Math.max(1, Math.round(pic.w / l.interval)), rows = Math.max(1, Math.round(pic.h / l.interval));
  const vals = resample(pic.gray, pic.pw, pic.ph, cols, rows);
  const lev = dither(vals, cols, rows, { method: l.dither, threshold: l.threshold, gamma: l.gamma, invert: l.invert, levels: l.levels });
  const dx = pic.w / cols, dy = pic.h / rows;
  const sOf = (level) => sValue(machine, l.minPower + (l.power - l.minPower) * level / 255);
  let dir = 1, prev = null;
  for (let r = 0; r < rows; r++) {
    const burn = runs(lev, cols, rows, r).filter((q) => q[2] > 0);
    if (!burn.length) continue;
    const y = pic.y + pic.h - (r + 0.5) * dy;
    const list = dir > 0 ? burn : burn.slice().reverse();
    const seg = (q) => (dir > 0 ? [pic.x + q[0] * dx, pic.x + q[1] * dx] : [pic.x + q[1] * dx, pic.x + q[0] * dx]);
    const [f0] = seg(list[0]), [, l1] = seg(list[list.length - 1]);
    const os = l.overscan;
    const link = !!(l.bidirectional && prev && Math.hypot(f0 - dir * os - prev.x, y - prev.y) <= RAPID_GAP);
    moves.push(M(f0 - dir * os, y, 0, { start: true, ...(link ? { link: true } : {}) }));
    if (os > 0) moves.push(M(f0, y, 0));
    let at = f0;
    for (const q of list) {
      const [xa, xb] = seg(q);
      if (Math.abs(xa - at) > 1e-9) moves.push(M(xa, y, 0, Math.abs(xa - at) >= l.skipGap && l.skipGap > 0 ? { rapid: true } : {}));
      moves.push(M(xb, y, sOf(q[2])));
      at = xb;
    }
    if (os > 0) moves.push(M(l1 + dir * os, y, 0));
    prev = { x: l1 + dir * os, y };
    head = { x: prev.x, y };
    if (l.bidirectional) dir = -dir;
  }
  return head;
}
