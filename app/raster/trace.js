/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — option names and data fields. */
/**
 * trace.js — the auto trace for scanned drawings (0.7 LC.6 c): black-and-white pixels in, lines and arcs out. Classic image
 * processing only — no trained model, no network, nothing sent anywhere: connected pieces → text-sized pieces set aside →
 * thinning to centre lines (Zhang and Suen, 1984) → centre-line graph → chains → lines and arcs fitted to a tolerance (a
 * line first, then a circle by least squares (Kåsa), else split at the worst point; neighbours re-fitted together) →
 * collinear runs joined, nearly level / plumb lines squared, corners closed, short bits dropped, hatching set aside.
 * DOM-free; typed arrays come from a reusable `Workspace` (hot loops allocate nothing; fitting allocates per chain).
 *
 *   trace(bitmap, opts, ws) → { lines: [{ x1, y1, x2, y2 }], arcs: [{ cx, cy, r, a0, a1, sx, sy, ex, ey }], left, report }
 *     bitmap = { w, h, data } with 1 = ink (image.js). Coordinates are pixels, y down, a pixel's centre at (x + .5, y + .5);
 *     an arc runs from angle a0 to a1 > a0 (atan2(dy, dx) in that y-down space), start (sx, sy) to end (ex, ey).
 *     opts: win [x0, y0, x1, y1] (default all), tol (px, default 1.5: how far a fitted line or arc may lie from the centre line),
 *           minLen (px, 8), squareDeg (2), joinGap (px, 2·tol + 3), textMax (px: pieces no bigger than this each way are text,
 *           default 3 % of the long side, 16–160), hatch (true: set hatching aside), arcs (true), spur (px, set from tol)
 *     left: { text: [{ x0, y0, x1, y1, n }], hatch: [{ x0, y0, x1, y1, n }] } — regions left as raster
 *     report: { win, tolPx, ink, skeleton, chains, spurs, lines, arcs, textPieces, textPixels, hatchGroups, hatchLines, merged }
 */
import { Workspace, refuse, MAX_TRACE_PIXELS } from './util.js';
import { label } from './image.js';

const DEFAULT_WS = new Workspace();
const NB = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];   // clockwise from north

// ------------------------------------------------------------------------------------------------ thinning
function thin(sk, W, H, ws) {
  // Zhang–Suen, but only the pixels that can change are looked at: the candidates are the ink pixels that touch paper; a
  // pixel whose neighbour was just deleted joins them. (A sheet is mostly paper, and the last iterations delete a few pixels.)
  const N = W * H;
  let ink = 0;
  for (let p = 0; p < N; p++) ink += sk[p];
  if (!ink) return;
  const inList = ws.u8('trMark', N, 0);
  let cand = ws.i32('trCandA', ink), next = ws.i32('trCandB', ink);
  const dels = ws.i32('trDels', ink);
  let n = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (!sk[p]) continue;
    const edge = x === 0 || y === 0 || x === W - 1 || y === H - 1 || !sk[p - 1] || !sk[p + 1] || !sk[p - W] || !sk[p + W] || !sk[p - W - 1] || !sk[p - W + 1] || !sk[p + W - 1] || !sk[p + W + 1];
    if (edge) { cand[n++] = p; inList[p] = 1; }
  }
  let quiet = 0, iter = 0;
  while (n && quiet < 2 && iter++ < 2000) {
    for (let step = 0; step < 2; step++) {
      let nd = 0;
      for (let i = 0; i < n; i++) {
        const p = cand[i], y = (p / W) | 0, x = p - y * W;
        const up = y > 0, dn = y < H - 1, lf = x > 0, rt = x < W - 1;
        const P2 = up ? sk[p - W] : 0, P3 = up && rt ? sk[p - W + 1] : 0, P4 = rt ? sk[p + 1] : 0, P5 = dn && rt ? sk[p + W + 1] : 0;
        const P6 = dn ? sk[p + W] : 0, P7 = dn && lf ? sk[p + W - 1] : 0, P8 = lf ? sk[p - 1] : 0, P9 = up && lf ? sk[p - W - 1] : 0;
        const B = P2 + P3 + P4 + P5 + P6 + P7 + P8 + P9;
        if (B < 2 || B > 6) continue;
        const A = (!P2 && P3) + (!P3 && P4) + (!P4 && P5) + (!P5 && P6) + (!P6 && P7) + (!P7 && P8) + (!P8 && P9) + (!P9 && P2);
        if (A !== 1) continue;
        if (step === 0 ? (P2 * P4 * P6 || P4 * P6 * P8) : (P2 * P4 * P8 || P2 * P6 * P8)) continue;
        dels[nd++] = p;
      }
      if (nd) quiet = 0; else quiet++;
      // the survivors, then the neighbours the deletions uncover
      let m = 0;
      for (let k = 0; k < nd; k++) sk[dels[k]] = 0;
      for (let i = 0; i < n; i++) { const p = cand[i]; if (sk[p]) next[m++] = p; else inList[p] = 0; }
      for (let k = 0; k < nd; k++) {
        const p = dels[k], y = (p / W) | 0, x = p - y * W;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= H) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= W) continue;
            const q = yy * W + xx;
            if (sk[q] && !inList[q]) { inList[q] = 1; next[m++] = q; }
          }
        }
      }
      const t = cand; cand = next; next = t; n = m;
    }
  }
  for (let i = 0; i < n; i++) inList[cand[i]] = 0;
}
/** How many 8-connected groups the ring of 8 neighbours forms, for every ring mask (bit k = NB[k] set). */
const RING = new Uint8Array(256);
for (let m = 0; m < 256; m++) {
  let seen = 0, groups = 0;
  for (let k = 0; k < 8; k++) {
    if (!(m >> k & 1) || (seen >> k & 1)) continue;
    groups++;
    const q = [k];
    seen |= 1 << k;
    while (q.length) {
      const c = q.pop();
      for (let j = 0; j < 8; j++) if ((m >> j & 1) && !(seen >> j & 1) && Math.abs(NB[c][0] - NB[j][0]) <= 1 && Math.abs(NB[c][1] - NB[j][1]) <= 1) { seen |= 1 << j; q.push(j); }
    }
  }
  RING[m] = groups;
}
const POP = new Uint8Array(256);
for (let m = 1; m < 256; m++) POP[m] = POP[m >> 1] + (m & 1);
/** Stair pixels: a pixel whose neighbours already touch each other adds nothing to the line (corner pixels, 2-pixel stairs);
 * line ends and the middle of a T or cross stay. */
function tidy(sk, W, H) {
  for (let pass = 0; pass < 3; pass++) {
    let n = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const p = y * W + x;
      if (!sk[p]) continue;
      let m = 0;
      for (let k = 0; k < 8; k++) if (sk[p + NB[k][1] * W + NB[k][0]]) m |= 1 << k;
      const c = POP[m];
      if (c < 2 || c > 3 || RING[m] !== 1) continue;
      // three neighbours with two opposite each other is a T: keep
      if (c === 3 && ((m & 1 && m & 16) || (m & 2 && m & 32) || (m & 4 && m & 64) || (m & 8 && m & 128))) continue;
      sk[p] = 0; n++;
    }
    if (!n) break;
  }
}

// ------------------------------------------------------------------------------------------------ chains
/** → [{ pts: [[x, y], …] (window pixel coords, centres), a, b (cluster ids; -1 for a closed loop), len }] , clusters: { cx[], cy[] } */
function chainsOf(sk, W, H, ws) {
  const N = W * H;
  const nb = ws.u8('trNb', N, 0);
  let skeleton = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = y * W + x;
    if (!sk[p]) continue;
    skeleton++;
    let c = 0;
    for (let k = 0; k < 8; k++) { const xx = x + NB[k][0], yy = y + NB[k][1]; if (xx >= 0 && yy >= 0 && xx < W && yy < H && sk[yy * W + xx]) c++; }
    nb[p] = c;
  }
  // nodes: pixels that are not on a plain run (ends, junctions, isolated); clusters of touching nodes
  const cl = ws.i32('trCl', N, 0);   // cluster id (1-based) of a node pixel
  const stack = ws.i32('trStack', N);
  const cx = [], cy = [], cn = [];
  let ncl = 0;
  for (let s = 0; s < N; s++) {
    if (!sk[s] || nb[s] === 2 || cl[s]) continue;
    ncl++;
    let sp = 0, sx = 0, sy = 0, n = 0;
    stack[sp++] = s; cl[s] = ncl;
    while (sp) {
      const p = stack[--sp], x = p % W, y = (p - x) / W;
      sx += x + 0.5; sy += y + 0.5; n++;
      for (let k = 0; k < 8; k++) {
        const xx = x + NB[k][0], yy = y + NB[k][1];
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx;
        if (sk[q] && nb[q] !== 2 && !cl[q]) { cl[q] = ncl; stack[sp++] = q; }
      }
    }
    cx.push(sx / n); cy.push(sy / n); cn.push(n);
  }
  const vis = ws.u8('trVis', N, 0);
  const chains = [];
  const walk = (startP, fromCluster) => {
    const pts = [];
    let prev = startP, cur = startP;
    for (;;) {
      const x = cur % W, y = (cur - x) / W;
      pts.push([x + 0.5, y + 0.5]);
      vis[cur] = 1;
      let nxt = -1;
      for (let k = 0; k < 8; k++) {
        const xx = x + NB[k][0], yy = y + NB[k][1];
        if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
        const q = yy * W + xx;
        if (!sk[q] || q === prev) continue;
        if (cl[q]) { if (cl[q] !== fromCluster || pts.length >= 3) { nxt = q; break; } continue; }   // reached a node (not the one we left, unless we came round)
        if (!vis[q] && nxt < 0) nxt = q;
      }
      if (nxt < 0) return { pts, end: -1 };
      if (cl[nxt]) return { pts, end: cl[nxt] };
      prev = cur; cur = nxt;
    }
  };
  for (let s = 0; s < N; s++) {
    if (!cl[s]) continue;
    const x = s % W, y = (s - x) / W;
    for (let k = 0; k < 8; k++) {
      const xx = x + NB[k][0], yy = y + NB[k][1];
      if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue;
      const q = yy * W + xx;
      if (!sk[q] || cl[q] || vis[q]) continue;
      const r = walk(q, cl[s]);
      const a = cl[s], b = r.end;
      if (b === a && r.pts.length < 3) continue;
      const pts = [[cx[a - 1], cy[a - 1]], ...r.pts];
      if (b > 0) pts.push([cx[b - 1], cy[b - 1]]);
      chains.push({ pts, a, b: b > 0 ? b : -2, len: r.pts.length });
    }
  }
  // loops with no node at all (a circle)
  for (let s = 0; s < N; s++) {
    if (!sk[s] || vis[s] || cl[s]) continue;
    const r = walk(s, 0);
    if (r.pts.length >= 6) { r.pts.push([r.pts[0][0], r.pts[0][1]]); chains.push({ pts: r.pts, a: -1, b: -1, len: r.pts.length, closed: true }); }
  }
  return { chains, cx, cy, skeleton, nodes: ncl };
}

// ------------------------------------------------------------------------------------------------ fitting
function lineFit(P, i, j) {
  const n = j - i + 1;
  let mx = 0, my = 0;
  for (let k = i; k <= j; k++) { mx += P[k][0]; my += P[k][1]; }
  mx /= n; my /= n;
  let sxx = 0, sxy = 0, syy = 0;
  for (let k = i; k <= j; k++) { const dx = P[k][0] - mx, dy = P[k][1] - my; sxx += dx * dx; sxy += dx * dy; syy += dy * dy; }
  const th = 0.5 * Math.atan2(2 * sxy, sxx - syy), ux = Math.cos(th), uy = Math.sin(th);
  let dev = 0, t0 = Infinity, t1 = -Infinity;
  for (let k = i; k <= j; k++) {
    const dx = P[k][0] - mx, dy = P[k][1] - my, t = dx * ux + dy * uy, d = Math.abs(-dx * uy + dy * ux);
    if (d > dev) dev = d;
    if (t < t0) t0 = t; if (t > t1) t1 = t;
  }
  // orient from the first point to the last
  const f = (P[j][0] - P[i][0]) * ux + (P[j][1] - P[i][1]) * uy;
  const s = f < 0 ? -1 : 1;
  const a = s > 0 ? t0 : -t1, b = s > 0 ? t1 : -t0;
  const dxu = ux * s, dyu = uy * s;
  // the ends are the first and last points' feet on the line
  const tf = (P[i][0] - mx) * dxu + (P[i][1] - my) * dyu, tl = (P[j][0] - mx) * dxu + (P[j][1] - my) * dyu;
  void a; void b;
  return { type: 'L', dev, x1: mx + dxu * tf, y1: my + dyu * tf, x2: mx + dxu * tl, y2: my + dyu * tl, ux: dxu, uy: dyu, mx, my };
}

function circleFit(P, i, j, tol, maxR) {
  const n = j - i + 1;
  if (n < 5) return null;
  let mx = 0, my = 0;
  for (let k = i; k <= j; k++) { mx += P[k][0]; my += P[k][1]; }
  mx /= n; my /= n;
  let suu = 0, suv = 0, svv = 0, suuu = 0, svvv = 0, suvv = 0, svuu = 0;
  for (let k = i; k <= j; k++) {
    const u = P[k][0] - mx, v = P[k][1] - my;
    suu += u * u; suv += u * v; svv += v * v; suuu += u * u * u; svvv += v * v * v; suvv += u * v * v; svuu += v * u * u;
  }
  const det = suu * svv - suv * suv;
  if (Math.abs(det) < 1e-9) return null;
  const b1 = 0.5 * (suuu + suvv), b2 = 0.5 * (svvv + svuu);
  const uc = (b1 * svv - b2 * suv) / det, vc = (b2 * suu - b1 * suv) / det;
  let cx = mx + uc, cy = my + vc, r = Math.sqrt(uc * uc + vc * vc + (suu + svv) / n);
  if (!(r > 2 * tol) || r > maxR || !Number.isFinite(r)) return null;
  // Kåsa's fit leans on short arcs: a few Gauss–Newton steps on the true distances (cx, cy, r)
  for (let it = 0; it < 6; it++) {
    let a11 = 0, a12 = 0, a13 = 0, a22 = 0, a23 = 0, a33 = 0, g1 = 0, g2 = 0, g3 = 0;
    for (let k = i; k <= j; k++) {
      const dx = P[k][0] - cx, dy = P[k][1] - cy, d = Math.hypot(dx, dy) || 1e-9, ux = dx / d, uy = dy / d, e = d - r;
      a11 += ux * ux; a12 += ux * uy; a13 += ux; a22 += uy * uy; a23 += uy; a33 += 1;
      g1 += -ux * e; g2 += -uy * e; g3 += e;
    }
    // J = [-ux, -uy, -1]; normal equations (JᵀJ) δ = −Jᵀe
    const D = a11 * (a22 * a33 - a23 * a23) - a12 * (a12 * a33 - a23 * a13) + a13 * (a12 * a23 - a22 * a13);
    if (Math.abs(D) < 1e-12) break;
    const b1 = -g1, b2 = -g2, b3 = -g3;           // −Jᵀe = (Σ ux·e, Σ uy·e, Σ e)
    const dcx = (b1 * (a22 * a33 - a23 * a23) - a12 * (b2 * a33 - a23 * b3) + a13 * (b2 * a23 - a22 * b3)) / D;
    const dcy = (a11 * (b2 * a33 - a23 * b3) - b1 * (a12 * a33 - a23 * a13) + a13 * (a12 * b3 - b2 * a13)) / D;
    const dr = (a11 * (a22 * b3 - b2 * a23) - a12 * (a12 * b3 - b2 * a13) + b1 * (a12 * a23 - a22 * a13)) / D;
    if (!Number.isFinite(dcx + dcy + dr)) break;
    cx += dcx; cy += dcy; r += dr;
  }
  if (!(r > 2 * tol) || r > maxR || !Number.isFinite(r)) return null;
  let dev = 0, prev = Math.atan2(P[i][1] - cy, P[i][0] - cx), total = 0, neg = 0, pos = 0;
  const back = 2 * tol / r;
  const steps = [];
  for (let k = i; k <= j; k++) {
    const d = Math.abs(Math.hypot(P[k][0] - cx, P[k][1] - cy) - r);
    if (d > dev) dev = d;
    if (dev > tol) return null;
    if (k > i) {
      let da = Math.atan2(P[k][1] - cy, P[k][0] - cx) - prev;
      while (da > Math.PI) da -= 2 * Math.PI;
      while (da < -Math.PI) da += 2 * Math.PI;
      steps.push(da); total += da; prev += da;
      if (da > 0) pos++; else if (da < 0) neg++;
    }
  }
  const sgn = total < 0 ? -1 : 1, sweep = Math.abs(total);
  for (const da of steps) if (da * sgn < -back) return null;   // doubles back: not one arc
  if (sweep < 0.12 || sweep > 2 * Math.PI + 0.35) return null;
  if (r * (1 - Math.cos(Math.min(sweep, Math.PI) / 2)) < 2.5 * tol) return null;   // barely bent: that is a line with a ragged end, not an arc
  void pos; void neg;
  const a0 = Math.atan2(P[i][1] - cy, P[i][0] - cx);
  const ang = sgn > 0 ? [a0, a0 + sweep] : [a0 - sweep, a0];
  return { type: 'A', dev, cx, cy, r, a0: ang[0], a1: ang[1], sweep };
}

/** Indices where a chain turns sharply (more than `minTurn` radians over ±w steps), the sharpest of each bunch. */
function findCorners(P, w, minTurn, loop) {
  const n = loop ? P.length - 1 : P.length, out = [];
  if (n < 2 * w + 1) return out;
  const at = (k) => P[loop ? ((k % n) + n) % n : k];
  const turn = new Float64Array(n);
  for (let k = loop ? 0 : w; k < (loop ? n : n - w); k++) {
    const p = at(k - w), q = at(k), r = at(k + w);
    let d = Math.atan2(r[1] - q[1], r[0] - q[0]) - Math.atan2(q[1] - p[1], q[0] - p[0]);
    while (d > Math.PI) d -= 2 * Math.PI;
    while (d < -Math.PI) d += 2 * Math.PI;
    turn[k] = Math.abs(d);
  }
  for (let k = loop ? 0 : w; k < (loop ? n : n - w); k++) {
    if (turn[k] < minTurn) continue;
    let best = true;
    for (let m = -w; m <= w && best; m++) {
      const j = loop ? ((k + m) % n + n) % n : k + m;
      if (j < 0 || j >= n || j === k) continue;
      if (turn[j] > turn[k] || (turn[j] === turn[k] && j < k)) best = false;
    }
    if (best) out.push(k);
  }
  return out;
}

/** Fit chain points P[i..j] (inclusive) as lines and arcs → pieces [{ ...fit, i, j }]. */
function fitRange(P, i, j, tol, arcs, maxR, out) {
  const stack = [[i, j]];
  const pieces = [];
  while (stack.length) {
    const [a, b] = stack.pop();
    if (b - a < 1) continue;
    if (b - a === 1) { const f = lineFit(P, a, b); f.i = a; f.j = b; pieces.push(f); continue; }
    const lf = lineFit(P, a, b);
    if (lf.dev <= tol) { lf.i = a; lf.j = b; pieces.push(lf); continue; }
    if (arcs) { const cf = circleFit(P, a, b, tol, maxR); if (cf) { cf.i = a; cf.j = b; pieces.push(cf); continue; } }
    // split at the point farthest from the chord
    const cx = P[b][0] - P[a][0], cy = P[b][1] - P[a][1], cl = Math.hypot(cx, cy) || 1;
    let m = a + 1, md = -1;
    for (let k = a + 1; k < b; k++) {
      const d = cl > 1e-9 ? Math.abs((P[k][0] - P[a][0]) * cy - (P[k][1] - P[a][1]) * cx) / cl : Math.hypot(P[k][0] - P[a][0], P[k][1] - P[a][1]);
      if (d > md) { md = d; m = k; }
    }
    stack.push([m, b], [a, m]);
  }
  pieces.sort((p, q) => p.i - q.i);
  // neighbours that fit as one: join them (an arc cut in two by a noisy split, a line cut by a bump)
  let again = true;
  while (again && pieces.length > 1) {
    again = false;
    for (let k = 0; k + 1 < pieces.length; k++) {
      const p = pieces[k], q = pieces[k + 1];
      if (p.type === 'L' && q.type === 'L' && false) continue;
      const lf = lineFit(P, p.i, q.j);
      if (lf.dev <= tol) { lf.i = p.i; lf.j = q.j; pieces.splice(k, 2, lf); again = true; break; }
      if (arcs && (p.type === 'A' || q.type === 'A')) {
        const cf = circleFit(P, p.i, q.j, tol, maxR);
        if (cf) { cf.i = p.i; cf.j = q.j; pieces.splice(k, 2, cf); again = true; break; }
      }
    }
  }
  for (const p of pieces) out.push(p);
}

// ------------------------------------------------------------------------------------------------ the whole trace
export function trace(bm, opts = {}, ws = DEFAULT_WS) {
  const tol = Math.max(0.5, opts.tol ?? 1.5);
  const [wx0, wy0, wx1, wy1] = opts.win ? [Math.max(0, Math.floor(opts.win[0])), Math.max(0, Math.floor(opts.win[1])), Math.min(bm.w, Math.ceil(opts.win[2])), Math.min(bm.h, Math.ceil(opts.win[3]))] : [0, 0, bm.w, bm.h];
  const W = wx1 - wx0, H = wy1 - wy0;
  if (W < 3 || H < 3) refuse('empty');
  if (W * H > MAX_TRACE_PIXELS) refuse('trace_big', W + 'x' + H);
  const minLen = opts.minLen ?? 8, squareDeg = opts.squareDeg ?? 2, joinGap = opts.joinGap ?? 2 * tol + 3, arcs = opts.arcs !== false;
  const textMax = opts.textMax ?? Math.max(16, Math.min(160, Math.round(0.03 * Math.max(W, H))));
  const spurLen = opts.spur ?? Math.max(4, Math.round(2.5 * tol + 2));
  const maxR = 4 * Math.max(W, H);
  const rep = { win: [wx0, wy0, wx1, wy1], tolPx: tol, ink: 0, skeleton: 0, chains: 0, spurs: 0, lines: 0, arcs: 0, textPieces: 0, textPixels: 0, hatchGroups: 0, hatchLines: 0, merged: 0 };
  const left = { text: [], hatch: [] };

  // the window's ink, text-sized pieces set aside
  const sk = ws.u8('trSk', W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = bm.data[(y + wy0) * bm.w + x + wx0]; sk[y * W + x] = v; rep.ink += v; }
  const sub = { w: W, h: H, data: sk };
  const count = label(sub, ws), lab = ws.i32('lab', W * H), info = ws.i32('labInfo', 5);
  const text = ws.u8('trText', count + 1, 0);
  for (let c = 0; c < count; c++) {
    const o = c * 5, bw = info[o + 3] - info[o + 1] + 1, bh = info[o + 4] - info[o + 2] + 1;
    if (bw <= textMax && bh <= textMax) {
      text[c + 1] = 1; rep.textPieces++; rep.textPixels += info[o];
      left.text.push({ x0: info[o + 1] + wx0, y0: info[o + 2] + wy0, x1: info[o + 3] + 1 + wx0, y1: info[o + 4] + 1 + wy0, n: info[o] });
    }
  }
  if (rep.textPieces) for (let p = 0; p < W * H; p++) if (lab[p] && text[lab[p]]) sk[p] = 0;

  thin(sk, W, H, ws);
  tidy(sk, W, H);
  const { chains, cx: ccx, cy: ccy, skeleton } = chainsOf(sk, W, H, ws);
  rep.skeleton = skeleton;

  // spurs: a short free end hanging on a junction
  const deg = new Map();
  const bump = (c, d) => { if (c > 0) deg.set(c, (deg.get(c) || 0) + d); };
  for (const c of chains) { bump(c.a, 1); bump(c.b, 1); }
  let alive = chains.filter((c) => {
    const freeA = c.a > 0 && deg.get(c.a) === 1, freeB = c.b > 0 && deg.get(c.b) === 1;
    if (c.len < spurLen && ((freeA && c.b > 0 && deg.get(c.b) >= 3) || (freeB && c.a > 0 && deg.get(c.a) >= 3))) { bump(c.a, -1); bump(c.b, -1); rep.spurs++; return false; }
    return true;
  });
  // through a node with exactly two chains: one chain
  const at = new Map();
  alive.forEach((c, k) => { for (const e of [c.a, c.b]) if (e > 0) { if (!at.has(e)) at.set(e, []); at.get(e).push(k); } });
  const gone = new Set();
  for (const [node, list] of at) {
    const L = list.filter((k) => !gone.has(k));
    if (L.length !== 2 || deg.get(node) !== 2) continue;
    const A = alive[L[0]], B = alive[L[1]];
    if (A === B) continue;
    // orient: A ends at node, B starts at node
    const pa = A.b === node ? A.pts : A.pts.slice().reverse(), ea = A.b === node ? A.a : A.b;
    const pb = B.a === node ? B.pts : B.pts.slice().reverse(), eb = B.a === node ? B.b : B.a;
    A.pts = pa.concat(pb.slice(1)); A.a = ea; A.b = eb; A.len += B.len;
    gone.add(L[1]);
    // chains that ended at B's far end now end at A's: keep the index lists honest
    const far = at.get(eb);
    if (far) for (let m = 0; m < far.length; m++) if (far[m] === L[1]) far[m] = L[0];
    if (ea === eb && ea > 0) A.closed = true;
  }
  alive = alive.filter((_, k) => !gone.has(k));
  rep.chains = alive.length;

  // fit
  const pieces = [];
  for (const c of alive) {
    const P = c.pts;
    if (P.length < 2) continue;
    const loop = c.closed || (c.a > 0 && c.a === c.b) || (P.length > 6 && Math.hypot(P[0][0] - P[P.length - 1][0], P[0][1] - P[P.length - 1][1]) < 1.5);
    const out = [];
    const cw = Math.max(5, Math.round(3 * tol + 2)), cor = findCorners(P, cw, 0.6, loop && P.length > 8);
    if (loop && P.length > 8) {
      const full = arcs && !cor.length ? circleFit(P, 0, P.length - 1, tol, maxR) : null;
      if (full && full.sweep > 2 * Math.PI - 0.5) { full.i = 0; full.j = P.length - 1; full.a1 = full.a0 + 2 * Math.PI; out.push(full); }
      else {
        // a closed run: start it at a corner (or at the point farthest from the first), and cut it at every corner
        let R = P;
        const cut = cor.length ? [...cor] : [];
        if (cor.length) { const c0 = cor[0], core = P.slice(0, -1); R = core.slice(c0).concat(core.slice(0, c0), [core[c0]]); for (let k = 0; k < cut.length; k++) cut[k] = (cut[k] - c0 + core.length) % core.length; cut.sort((p, q) => p - q); cut.shift(); }
        else { let far = 1, fd = -1; for (let k = 1; k < P.length - 1; k++) { const d = Math.hypot(P[k][0] - P[0][0], P[k][1] - P[0][1]); if (d > fd) { fd = d; far = k; } } cut.push(far); }
        const idx = [0, ...cut, R.length - 1];
        for (let k = 0; k + 1 < idx.length; k++) fitRange(R, idx[k], idx[k + 1], tol, arcs, maxR, out);
      }
    } else {
      const idx = [0, ...cor, P.length - 1];
      for (let k = 0; k + 1 < idx.length; k++) fitRange(P, idx[k], idx[k + 1], tol, arcs, maxR, out);
    }
    for (const p of out) pieces.push(p);
  }
  let L = pieces.filter((p) => p.type === 'L').map((p) => ({ x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2 }));
  let A = pieces.filter((p) => p.type === 'A');

  // hatching: short parallel lines packed closely in a bundle
  if (opts.hatch !== false && L.length >= 5) {
    const hatchLen = opts.hatchLen ?? Math.max(60, 12 * textMax), hatchGap = opts.hatchGap ?? Math.max(8, 6 * tol + 4);
    const cand = [];
    L.forEach((l, k) => { const len = Math.hypot(l.x2 - l.x1, l.y2 - l.y1); if (len <= hatchLen && len >= minLen) cand.push({ k, ang: ((Math.atan2(l.y2 - l.y1, l.x2 - l.x1) % Math.PI) + Math.PI) % Math.PI, len }); });
    const bins = new Map();
    for (const c of cand) { const b = Math.round(c.ang / (3 * Math.PI / 180)) % 60; if (!bins.has(b)) bins.set(b, []); bins.get(b).push(c); }
    const hatchSet = new Set(), groups = [];
    for (const list of bins.values()) {
      if (list.length < 5) continue;
      list.ang = list.reduce((s2, c) => s2 + c.ang, 0) / list.length;
      const items = list.map((c) => { const l = L[c.k], a = c.ang, nx = -Math.sin(a), ny = Math.cos(a), ux = Math.cos(a), uy = Math.sin(a); return { k: c.k, off: (l.x1 + l.x2) / 2 * nx + (l.y1 + l.y2) / 2 * ny, t0: Math.min(l.x1 * ux + l.y1 * uy, l.x2 * ux + l.y2 * uy), t1: Math.max(l.x1 * ux + l.y1 * uy, l.x2 * ux + l.y2 * uy) }; });
      items.sort((p, q) => p.off - q.off);
      let run = [items[0]];
      const flush = () => {
        if (run.length >= 5) {
          let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
          for (const it of run) { hatchSet.add(it.k); const l = L[it.k]; x0 = Math.min(x0, l.x1, l.x2); y0 = Math.min(y0, l.y1, l.y2); x1 = Math.max(x1, l.x1, l.x2); y1 = Math.max(y1, l.y1, l.y2); }
          left.hatch.push({ x0: x0 + wx0, y0: y0 + wy0, x1: x1 + wx0, y1: y1 + wy0, n: run.length }); rep.hatchGroups++;
          groups.push({ x0, y0, x1, y1, ang: list.ang });
        }
      };
      for (let k = 1; k < items.length; k++) {
        const prev = run[run.length - 1], it = items[k];
        if (it.off - prev.off <= hatchGap && it.off - prev.off > 1 && Math.min(it.t1, prev.t1) - Math.max(it.t0, prev.t0) > -hatchGap) run.push(it);
        else { flush(); run = [it]; }
      }
      flush();
    }
    if (hatchSet.size) {
      // the rest of the bundle: lines of the same direction inside a group's box, which the fitting broke into pieces too short to count
      for (const g of groups) {
        const e = hatchGap * 2;
        L.forEach((l, k) => {
          if (hatchSet.has(k)) return;
          const a = ((Math.atan2(l.y2 - l.y1, l.x2 - l.x1) % Math.PI) + Math.PI) % Math.PI;
          let da = Math.abs(a - g.ang); if (da > Math.PI / 2) da = Math.PI - da;
          const mx = (l.x1 + l.x2) / 2, my = (l.y1 + l.y2) / 2;
          if (da < 0.07 && mx >= g.x0 - e && mx <= g.x1 + e && my >= g.y0 - e && my <= g.y1 + e && Math.hypot(l.x2 - l.x1, l.y2 - l.y1) <= hatchLen) hatchSet.add(k);
        });
      }
      rep.hatchLines = hatchSet.size; L = L.filter((_, k) => !hatchSet.has(k));
    }
  }

  // join collinear runs that a junction cut apart
  const before = L.length;
  L = joinCollinear(L, tol, joinGap);
  rep.merged = before - L.length;
  // square: nearly level or plumb lines become level or plumb, and lines of one wall share a coordinate
  squareLines(L, tol, squareDeg);
  // corners: an end that stops short of another line runs to it
  L = L.filter((l) => Math.hypot(l.x2 - l.x1, l.y2 - l.y1) >= minLen);   // the nicks the thinning leaves at corners go first
  closeCorners(L, joinGap);
  A = A.filter((a) => a.r * Math.abs(a.a1 - a.a0) >= minLen);

  const lines = L.map((l) => ({ x1: l.x1 + wx0, y1: l.y1 + wy0, x2: l.x2 + wx0, y2: l.y2 + wy0 }));
  const arcsOut = A.map((a) => ({ cx: a.cx + wx0, cy: a.cy + wy0, r: a.r, a0: a.a0, a1: a.a1, sx: a.cx + wx0 + a.r * Math.cos(a.a0), sy: a.cy + wy0 + a.r * Math.sin(a.a0), ex: a.cx + wx0 + a.r * Math.cos(a.a1), ey: a.cy + wy0 + a.r * Math.sin(a.a1) }));
  rep.lines = lines.length; rep.arcs = arcsOut.length;
  void ccx; void ccy;
  return { lines, arcs: arcsOut, left, report: rep };
}

// ------------------------------------------------------------------------------------------------ clean-up of the vector result
function joinCollinear(L, tol, gap) {
  const angOf = (l) => Math.atan2(l.y2 - l.y1, l.x2 - l.x1);
  let changed = true, guard = 0;
  while (changed && guard++ < 50) {
    changed = false;
    const cell = Math.max(32, gap * 4), grid = new Map();
    const key = (x, y) => Math.floor(x / cell) + ',' + Math.floor(y / cell);
    L.forEach((l, k) => { for (const [x, y] of [[l.x1, l.y1], [l.x2, l.y2]]) { const s = key(x, y); if (!grid.has(s)) grid.set(s, []); grid.get(s).push(k); } });
    const dead = new Set();
    for (let a = 0; a < L.length; a++) {
      if (dead.has(a)) continue;
      const la = L[a];
      let merged = false;
      for (const [ex, ey] of [[la.x1, la.y1], [la.x2, la.y2]]) {
        const cx0 = Math.floor((ex - gap) / cell), cx1 = Math.floor((ex + gap) / cell), cy0 = Math.floor((ey - gap) / cell), cy1 = Math.floor((ey + gap) / cell);
        for (let gx = cx0; gx <= cx1 && !merged; gx++) for (let gy = cy0; gy <= cy1 && !merged; gy++) for (const b of grid.get(gx + ',' + gy) || []) {
          if (b <= a || dead.has(b)) continue;
          const lb = L[b];
          let da = Math.abs(angOf(la) - angOf(lb)) % Math.PI; if (da > Math.PI / 2) da = Math.PI - da;
          if (da > 0.026) continue;   // 1.5°
          // close ends?
          const ends = [[la.x1, la.y1], [la.x2, la.y2]], ends2 = [[lb.x1, lb.y1], [lb.x2, lb.y2]];
          let near = false;
          for (const p of ends) for (const q of ends2) if (Math.hypot(p[0] - q[0], p[1] - q[1]) <= gap) near = true;
          if (!near) continue;
          // same line? every end of b within tol of a's line
          const ux = Math.cos(angOf(la)), uy = Math.sin(angOf(la));
          const off = (p) => Math.abs((p[0] - la.x1) * -uy + (p[1] - la.y1) * ux);
          if (off(ends2[0]) > tol * 1.5 || off(ends2[1]) > tol * 1.5) continue;
          const pts = [...ends, ...ends2], t = pts.map((p) => (p[0] - la.x1) * ux + (p[1] - la.y1) * uy);
          let lo = 0, hi = 0;
          t.forEach((v, i) => { if (v < t[lo]) lo = i; if (v > t[hi]) hi = i; });
          la.x1 = pts[lo][0]; la.y1 = pts[lo][1]; la.x2 = pts[hi][0]; la.y2 = pts[hi][1];
          dead.add(b); merged = true; changed = true;
          break;
        }
        if (merged) break;
      }
      if (merged) a--;   // look again: it may now reach another
    }
    if (dead.size) L = L.filter((_, k) => !dead.has(k));
  }
  return L;
}

function squareLines(L, tol, deg) {
  const lim = deg * Math.PI / 180;
  const H = [], V = [];
  for (const l of L) {
    const dx = l.x2 - l.x1, dy = l.y2 - l.y1, len = Math.hypot(dx, dy);
    if (len < 1e-9) continue;
    const a = Math.atan2(dy, dx), ah = Math.min(Math.abs(a), Math.PI - Math.abs(a)), av = Math.abs(Math.abs(a) - Math.PI / 2);
    if (ah <= lim) { const y = (l.y1 + l.y2) / 2; l.y1 = l.y2 = y; if (l.x1 > l.x2) { const t = l.x1; l.x1 = l.x2; l.x2 = t; } H.push(l); }
    else if (av <= lim) { const x = (l.x1 + l.x2) / 2; l.x1 = l.x2 = x; if (l.y1 > l.y2) { const t = l.y1; l.y1 = l.y2; l.y2 = t; } V.push(l); }
  }
  // one coordinate for lines that lie within tolerance of each other (a long line cut into pieces stays one line)
  const align = (list, get, set) => {
    list.sort((p, q) => get(p) - get(q));
    let i = 0;
    while (i < list.length) {
      let j = i, sum = 0, w = 0;
      while (j < list.length && get(list[j]) - get(list[i]) <= tol * 0.75) { const len = Math.abs(list[j].x2 - list[j].x1) + Math.abs(list[j].y2 - list[j].y1); sum += get(list[j]) * len; w += len; j++; }
      const m = sum / (w || 1);
      for (let k = i; k < j; k++) set(list[k], m);
      i = j;
    }
  };
  align(H, (l) => l.y1, (l, v) => { l.y1 = l.y2 = v; });
  align(V, (l) => l.x1, (l, v) => { l.x1 = l.x2 = v; });
}

function closeCorners(L, gap) {
  if (!L.length) return;
  const cell = Math.max(32, gap * 6), grid = new Map();
  const push = (cx, cy, k) => { const s = cx + ',' + cy; let a = grid.get(s); if (!a) grid.set(s, (a = [])); a.push(k); };
  L.forEach((l, k) => {
    const x0 = Math.floor((Math.min(l.x1, l.x2) - gap) / cell), x1 = Math.floor((Math.max(l.x1, l.x2) + gap) / cell), y0 = Math.floor((Math.min(l.y1, l.y2) - gap) / cell), y1 = Math.floor((Math.max(l.y1, l.y2) + gap) / cell);
    for (let x = x0; x <= x1; x++) for (let y = y0; y <= y1; y++) push(x, y, k);
  });
  for (let a = 0; a < L.length; a++) {
    const la = L[a];
    for (const end of [1, 2]) {
      const ex = end === 1 ? la.x1 : la.x2, ey = end === 1 ? la.y1 : la.y2, fx = end === 1 ? la.x2 : la.x1, fy = end === 1 ? la.y2 : la.y1;
      const dl = Math.hypot(ex - fx, ey - fy);
      if (dl < 1e-9) continue;
      const ux = (ex - fx) / dl, uy = (ey - fy) / dl;
      let best = null;
      for (const b of grid.get(Math.floor(ex / cell) + ',' + Math.floor(ey / cell)) || []) {
        if (b === a) continue;
        const lb = L[b], vx = lb.x2 - lb.x1, vy = lb.y2 - lb.y1, vl = Math.hypot(vx, vy);
        if (vl < 1e-9) continue;
        const den = ux * vy - uy * vx;
        if (Math.abs(den) < 0.05 * vl) continue;   // parallel (within ~3°): no corner
        // the point on a's line (e + s·u) that lies on b's line
        const s = ((lb.x1 - ex) * vy - (lb.y1 - ey) * vx) / den, t = ((lb.x1 - ex) * uy - (lb.y1 - ey) * ux) / den;
        if (Math.abs(s) > gap) continue;                       // the end must be near the crossing
        if (t < -gap / vl || t > 1 + gap / vl) continue;       // and the crossing near b's length
        if (!best || Math.abs(s) < best.s) best = { s: Math.abs(s), x: ex + s * ux, y: ey + s * uy };
      }
      if (best) { if (end === 1) { la.x1 = best.x; la.y1 = best.y; } else { la.x2 = best.x; la.y2 = best.y; } }
    }
  }
}
