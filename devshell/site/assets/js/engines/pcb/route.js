/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Grid router (0.8 XE.11): Lee/Dijkstra–A* wave routing on a multi-layer grid with 45° moves and vias (Lee 1961; Hart/Nilsson/Raphael 1968), nets taken
 * shortest first, the failed ones first on the next pass. Obstacles are the true copper of other nets grown by clearance, half the track width and a
 * slack for the segments between grid points, so the result passes the clearance rule it was given (drc() confirms it). Honest limits: no push-and-shove,
 * no differential pairs or length matching, no teardrops, pour zones are not routed through, existing tracks are kept as obstacles only.
 */
import { pointPrimDist, primBox, pointInPoly } from './geom.js';
import { problem } from './board.js';

class Heap { // min-heap on f with parallel arrays
  constructor() { this.f = []; this.v = []; }
  push(f, v) { const F = this.f, V = this.v; let i = F.length; F.push(f); V.push(v); while (i > 0) { const p = (i - 1) >> 1; if (F[p] <= f) break; F[i] = F[p]; V[i] = V[p]; i = p; } F[i] = f; V[i] = v; }
  pop() { const F = this.f, V = this.v, top = V[0], f = F.pop(), v = V.pop(), n = F.length; if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && F[c + 1] < F[c]) c++; if (F[c] >= f) break; F[i] = F[c]; V[i] = V[c]; i = c; } F[i] = f; V[i] = v; } return top; }
  get size() { return this.f.length; }
}

/** route(board, opts) adds tracks and vias to the board. opts: pitch, passes, viaCost, skipNets[], nets[] (only these), expansionBudget. */
export function route(board, opts = {}) {
  const R = board.rules, problems = [], t0 = Date.now();
  const pitch = opts.pitch || (R.trackWidth + R.clearance) / 2, viaCost = opts.viaCost ?? 14, budget = opts.expansionBudget || 3e6, passes = opts.passes || 3, L = board.layers.length;
  const ob = board.extent(), ox = ob[0] - pitch, oy = ob[1] - pitch, Wc = Math.ceil((ob[2] - ob[0]) / pitch) + 3, Hc = Math.ceil((ob[3] - ob[1]) / pitch) + 3, N = Wc * Hc;
  const cx = (x) => ox + x * pitch, cy = (y) => oy + y * pitch, cellOf = (p) => [Math.round((p[0] - ox) / pitch), Math.round((p[1] - oy) / pitch)];
  const slack = 0.25 * pitch, netId = new Map(); const nid = (n) => { if (!netId.has(n)) netId.set(n, netId.size); return netId.get(n); };
  const items = board.items(), pads = items.filter((i) => i.kind === 'pad');
  const initial = { tracks: board.tracks.length, vias: board.vias.length };

  // ---- obstacle rasters (owner net id per cell, per layer; -1 free, -2 more than one net)
  const blk = Array.from({ length: L }, () => new Int32Array(N).fill(-1)), blkVia = Array.from({ length: L }, () => new Int32Array(N).fill(-1));
  const claim = (arr, i, n) => { if (arr[i] === -1) arr[i] = n; else if (arr[i] !== n) arr[i] = -2; };
  const raster = (it) => { // copper with no net blocks everyone (owner -2)
    const n = it.net ? nid(it.net) : -2, box = primBox(it.prim);
    for (const [arr, extra] of [[blk, R.clearance + R.trackWidth / 2 + slack], [blkVia, R.clearance + R.viaDia / 2 + slack]]) {
      const r = extra, x0 = Math.max(0, Math.floor((box[0] - r - ox) / pitch)), x1 = Math.min(Wc - 1, Math.ceil((box[2] + r - ox) / pitch)), y0 = Math.max(0, Math.floor((box[1] - r - oy) / pitch)), y1 = Math.min(Hc - 1, Math.ceil((box[3] + r - oy) / pitch));
      for (const l of it.layers) { const li = board.layers.indexOf(l); if (li < 0) continue; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (pointPrimDist([cx(x), cy(y)], it.prim) < r) claim(arr[li], y * Wc + x, n); }
    }
  };
  for (const it of items) raster(it);
  // keepout: outside the outline and near its edge
  const edgeR = R.edgeClearance + R.trackWidth / 2 + slack, edges = []; for (let i = 0; i < board.outline.length; i++) edges.push([board.outline[i], board.outline[(i + 1) % board.outline.length]]);
  for (let y = 0; y < Hc; y++) for (let x = 0; x < Wc; x++) { const p = [cx(x), cy(y)], inside = pointInPoly(p, board.outline); let d = Infinity; for (const [a, b] of edges) d = Math.min(d, segDist(p, a, b)); if (!inside || d < edgeR) for (let l = 0; l < L; l++) { blk[l][y * Wc + x] = -2; blkVia[l][y * Wc + x] = -2; } else if (d < R.edgeClearance + R.viaDia / 2 + slack) for (let l = 0; l < L; l++) blkVia[l][y * Wc + x] = -2; }
  const free = (arr, l, i, n) => { const o = arr[l][i]; return o === -1 || o === n; };

  // ---- nets to route
  const byNet = new Map(); for (const p of pads) if (p.net) { if (!byNet.has(p.net)) byNet.set(p.net, []); byNet.get(p.net).push(p); }
  const skip = new Set(opts.skipNets || []);
  for (const z of board.zones) { const ps = byNet.get(z.net); if (ps && ps.every((p) => p.layers.includes(z.layer) && pointInPoly([p.pad.x, p.pad.y], z.poly))) skip.add(z.net); }
  let todo = [...byNet.entries()].filter(([n, ps]) => ps.length > 1 && !skip.has(n) && (!opts.nets || opts.nets.includes(n)));
  const span = (ps) => { const b = ps.reduce((a, p) => [Math.min(a[0], p.pad.x), Math.min(a[1], p.pad.y), Math.max(a[2], p.pad.x), Math.max(a[3], p.pad.y)], [Infinity, Infinity, -Infinity, -Infinity]); return (b[2] - b[0]) + (b[3] - b[1]); };
  todo.sort((a, b) => span(a[1]) - span(b[1]));
  const failed = new Map(); let routed = [];
  const snapshot = () => ({ blk: blk.map((a) => a.slice()), blkVia: blkVia.map((a) => a.slice()), tracks: board.tracks.length, vias: board.vias.length });
  const base = snapshot();
  let stats = { expansions: 0, passes: 0 };

  const rasterNetItem = (net, kind, prim, layers, width) => raster({ net, kind, prim, layers, width });

  for (let pass = 0; pass < passes; pass++) {
    stats.passes = pass + 1;
    if (pass > 0) { board.tracks.length = initial.tracks; board.vias.length = initial.vias; blk.forEach((a, l) => a.set(base.blk[l])); blkVia.forEach((a, l) => a.set(base.blkVia[l])); }
    failed.clear(); routed = [];
    for (const [net, ps] of todo) {
      const res = routeNet(net, ps);
      if (res.ok) routed.push(net); else failed.set(net, res);
    }
    if (!failed.size) break;
    todo = [...todo.filter(([n]) => failed.has(n)), ...todo.filter(([n]) => !failed.has(n))];
  }

  function routeNet(net, ps) {
    const n = nid(net), tree = new Uint8Array(L * N), t0n = board.tracks.length, v0n = board.vias.length; // tree: cells already part of this net's copper
    const access = (p) => { // cells inside the pad (on each of its layers), else the nearest cell to its centre
      const out = [], r = Math.max(p.pad.w, p.pad.h) / 2 + pitch, x0 = Math.max(0, Math.floor((p.pad.x - r - ox) / pitch)), x1 = Math.min(Wc - 1, Math.ceil((p.pad.x + r - ox) / pitch)), y0 = Math.max(0, Math.floor((p.pad.y - r - oy) / pitch)), y1 = Math.min(Hc - 1, Math.ceil((p.pad.y + r - oy) / pitch));
      for (const l of p.layers) { const li = board.layers.indexOf(l); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const i = y * Wc + x; if (pointPrimDist([cx(x), cy(y)], p.prim) === 0 && free(blk, li, i, n)) out.push([li, x, y]); } }
      if (!out.length) { const [x, y] = cellOf([p.pad.x, p.pad.y]); for (const l of p.layers) { const li = board.layers.indexOf(l); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const i = (y + dy) * Wc + x + dx; if (free(blk, li, i, n) && pointPrimDist([cx(x + dx), cy(y + dy)], p.prim) < pitch * 1.5) out.push([li, x + dx, y + dy]); } } }
      return out;
    };
    const acc = ps.map((p) => ({ p, cells: access(p) }));
    const noAcc = acc.find((a) => !a.cells.length);
    if (noAcc) return { ok: false, code: 'no-access', pad: noAcc.p.id };
    const inTree = [acc[0]]; const rest = acc.slice(1);
    for (const [li, x, y] of acc[0].cells) tree[li * N + y * Wc + x] = 1;
    const made = [], madeVias = [];
    while (rest.length) {
      // nearest unconnected pad to any connected pad
      let bi = 0, bd = Infinity; rest.forEach((r, i) => { for (const t of inTree) { const d = Math.abs(r.p.pad.x - t.p.pad.x) + Math.abs(r.p.pad.y - t.p.pad.y); if (d < bd) { bd = d; bi = i; } } });
      const tgt = rest.splice(bi, 1)[0], path = search(tgt, tree, n);
      if (!path) { board.tracks.length = t0n; board.vias.length = v0n; return { ok: false, code: 'no-path', pad: tgt.p.id, from: inTree[0].p.id }; }
      // path: array of [li, x, y] from the new pad to the tree
      const segs = []; let cur = [path[0]];
      for (let k = 1; k < path.length; k++) { if (path[k][0] !== path[k - 1][0]) { segs.push(cur); madeVias.push([cx(path[k][1]), cy(path[k][2])]); cur = [path[k]]; } else cur.push(path[k]); }
      segs.push(cur);
      segs.forEach((sg, si) => {
        const pts = sg.map(([, x, y]) => [cx(x), cy(y)]); const simp = [pts[0]];
        for (let k = 1; k + 1 < pts.length; k++) { const a = simp[simp.length - 1], b = pts[k], c = pts[k + 1]; if (Math.abs((b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0])) > 1e-9) simp.push(b); }
        if (pts.length > 1) simp.push(pts[pts.length - 1]);
        if (si === 0 && pointPrimDist(simp[0], tgt.p.prim) > 0) simp.unshift([tgt.p.pad.x, tgt.p.pad.y]); // only a start outside the pad needs a stub in
        const L_ = board.layers[sg[0][0]]; if (simp.length >= 2) { board.addTrack(net, L_, R.trackWidth, simp); made.push(board.tracks.length - 1); }
      });
      for (const [li, x, y] of path) tree[li * N + y * Wc + x] = 1;
      for (const [li, x, y] of tgt.cells) tree[li * N + y * Wc + x] = 1;
      for (const v of madeVias.splice(0)) { board.addVia(net, v[0], v[1]); }
      inTree.push(tgt);
    }
    // claim this net's new copper in the rasters
    for (let ti = initial.tracks; ti < board.tracks.length; ti++) { const t = board.tracks[ti]; if (t.net !== net) continue; for (let k = 0; k + 1 < t.pts.length; k++) rasterNetItem(net, 'track', { k: 'cap', a: t.pts[k], b: t.pts[k + 1], r: t.width / 2 }, [t.layer], t.width); }
    for (let vi = initial.vias; vi < board.vias.length; vi++) { const v = board.vias[vi]; if (v.net !== net) continue; rasterNetItem(net, 'via', { k: 'cap', a: [v.x, v.y], b: [v.x, v.y], r: v.dia / 2 }, board.layers, 0); }
    return { ok: true };
  }

  function search(tgt, tree, n) {
    const dist = new Float32Array(L * N).fill(Infinity), prev = new Int32Array(L * N).fill(-1), heap = new Heap();
    for (const [li, x, y] of tgt.cells) { const s = li * N + y * Wc + x; dist[s] = 0; heap.push(0, s); }
    const dirs = [[1, 0, 1], [-1, 0, 1], [0, 1, 1], [0, -1, 1], [1, 1, 1.4142], [1, -1, 1.4142], [-1, 1, 1.4142], [-1, -1, 1.4142]];
    let exp = 0;
    while (heap.size) {
      const s = heap.pop(), li = Math.floor(s / N), r = s - li * N, y = Math.floor(r / Wc), x = r - y * Wc, d = dist[s];
      if (tree[s]) { const path = []; let c = s; while (c !== -1) { const l = Math.floor(c / N), rr = c - l * N, yy = Math.floor(rr / Wc); path.push([l, rr - yy * Wc, yy]); c = prev[c]; } stats.expansions += exp; return path.reverse(); }
      if (++exp > budget) { stats.expansions += exp; return null; }
      for (const [dx, dy, c0] of dirs) {
        const nx = x + dx, ny = y + dy; if (nx < 1 || ny < 1 || nx >= Wc - 1 || ny >= Hc - 1) continue; const ni = ny * Wc + nx;
        if (!free(blk, li, ni, n)) continue;
        if (dx && dy && (!free(blk, li, y * Wc + nx, n) || !free(blk, li, ny * Wc + x, n))) continue;
        let c = c0; if (opts.preferDirections !== false && L > 1) { const horiz = li % 2 === 0; if ((dy && !dx && horiz) || (dx && !dy && !horiz)) c *= 1.4; }
        const ns = li * N + ni, nd = d + c; if (nd < dist[ns]) { dist[ns] = nd; prev[ns] = s; heap.push(nd, ns); }
      }
      for (let l2 = 0; l2 < L; l2++) { if (l2 === li) continue; const i = y * Wc + x; if (!free(blkVia, l2, i, n) || !free(blkVia, li, i, n) || !free(blk, l2, i, n)) continue; const ns = l2 * N + i, nd = d + viaCost * Math.abs(l2 - li); if (nd < dist[ns]) { dist[ns] = nd; prev[ns] = s; heap.push(nd, ns); } }
    }
    stats.expansions += exp; return null;
  }

  for (const [net, f] of failed) {
    if (f.code === 'no-access') problems.push(problem('route.no-access', 'No room to start a track at pad ' + f.pad + ' (net ' + net + '): every grid point inside it is blocked.', { net, pad: f.pad, fix: 'A finer grid pitch (now ' + pitch + ' mm), or more space around the pad.' }));
    else problems.push(problem('route.no-path', 'Net ' + net + ' could not be routed from ' + f.from + ' to ' + f.pad + '.', { net, pad: f.pad, fix: 'More layers, more space, or move parts; vias are allowed.' }));
  }
  return { routed, failed: [...failed.keys()], problems, stats: { ...stats, pitch, grid: [Wc, Hc, L], ms: Date.now() - t0, tracks: board.tracks.length - initial.tracks, vias: board.vias.length - initial.vias }, skipped: [...skip] };
}

function segDist(p, a, b) { const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy, t = l2 ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2)) : 0; return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy); }
