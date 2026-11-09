/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Design rule checks (0.8 XE.11), every finding a Problems-shape problem with the rule, the numbers (found/required) and the objects.
 * Rules come from board.rules (set them from the board house's capability sheet; board.js has EXAMPLE values only).
 * Checks: clearance, short, track width, via/pad annular ring, drill size, hole-to-hole, copper to board edge, courtyards, unconnected nets.
 * Zones are checked as solid copper polygons (the poured result is not computed here; see gerber.js for how a pour is drawn).
 */
import { gap, primBox, pointSegDist, pointInPoly, polyEdges, polyPolyDist, dist } from './geom.js';
import { problem } from './board.js';

class Grid {
  constructor(cell) { this.cell = cell; this.map = new Map(); }
  add(item, box) { const c = this.cell; for (let x = Math.floor(box[0] / c); x <= Math.floor(box[2] / c); x++) for (let y = Math.floor(box[1] / c); y <= Math.floor(box[3] / c); y++) { const k = x + ',' + y; let l = this.map.get(k); if (!l) this.map.set(k, l = []); l.push(item); } }
  pairs(fn) { const seen = new Set(); for (const l of this.map.values()) for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) { const a = l[i], b = l[j], k = a.n < b.n ? a.n + ':' + b.n : b.n + ':' + a.n; if (!seen.has(k)) { seen.add(k); fn(a, b); } } }
}

const named = (it) => it.kind === 'pad' ? it.ref + '.' + it.num : it.kind === 'via' ? 'via at ' + it.prim.a.map((v) => v.toFixed(2)).join(',') : it.kind === 'track' ? 'track on ' + it.net : 'zone on ' + it.net;
const where = (a, b) => [(a.prim.k === 'cap' ? a.prim.a[0] : a.prim.pts[0][0]), (a.prim.k === 'cap' ? a.prim.a[1] : a.prim.pts[0][1])].map((v) => +v.toFixed(3));

/** Run the checks. opts.only: array of rule ids to run. Returns {problems, stats}. */
export function drc(board, opts = {}) {
  const R = board.rules, out = [], items = board.items(), want = (r) => !opts.only || opts.only.includes(r);
  const add = (p) => out.push(p);

  // --- clearance and shorts (same layer, different net) ---
  if (want('clearance') || want('short')) {
    const g = new Grid(Math.max(R.clearance * 4, 2)); items.forEach((it, n) => { it.n = n; g.add(it, primBox(it.prim).map((v, i) => v + (i < 2 ? -R.clearance : R.clearance))); });
    let pairs = 0;
    g.pairs((a, b) => {
      if (a.net && a.net === b.net) return;
      if (a.kind === 'pad' && b.kind === 'pad' && a.ref === b.ref && a.num === b.num) return;
      const shared = a.layers.filter((l) => b.layers.includes(l)); if (!shared.length) return;
      if (a.kind === 'zone' && b.kind === 'zone') return; // zones of different nets on one layer are the pour's business
      // a zone is poured around other nets' copper by the clearance, so a foreign item inside the outline is not a violation by itself
      if (a.kind === 'zone' || b.kind === 'zone') return;
      pairs++;
      const d = gap(a.prim, b.prim);
      if (d === 0) { if (want('short')) add(problem('drc.short', named(a) + ' (' + (a.net || 'no net') + ') touches ' + named(b) + ' (' + (b.net || 'no net') + ') on ' + shared[0] + '.', { rule: 'short', layer: shared[0], objects: [a.id, b.id], at: where(a, b), found: 0, req: R.clearance })); }
      else if (d < R.clearance - 1e-9 && want('clearance')) add(problem('drc.clearance', named(a) + ' and ' + named(b) + ' are ' + d.toFixed(3) + ' mm apart on ' + shared[0] + '; the rule is ' + R.clearance + ' mm.', { rule: 'clearance', layer: shared[0], objects: [a.id, b.id], at: where(a, b), found: +d.toFixed(4), req: R.clearance }));
    });
    var pairsChecked = pairs;
  }

  // --- widths, drills, annular rings ---
  if (want('track-width')) for (const it of items) if (it.kind === 'track' && it.width < R.minTrackWidth - 1e-9) add(problem('drc.track-width', 'A track on ' + it.net + ' is ' + it.width + ' mm wide; the minimum is ' + R.minTrackWidth + ' mm.', { rule: 'track-width', layer: it.layers[0], objects: [it.id], at: where(it), found: it.width, req: R.minTrackWidth }));
  if (want('drill') || want('annular')) {
    for (const it of items) {
      const d = it.kind === 'via' ? it.drill : it.kind === 'pad' && it.pad.drill > 0 ? it.pad.drill : 0; if (!d) continue;
      if (want('drill') && d < R.minDrill - 1e-9) add(problem('drc.drill', named(it) + ' has a ' + d + ' mm drill; the minimum is ' + R.minDrill + ' mm.', { rule: 'drill', objects: [it.id], at: where(it), found: d, req: R.minDrill }));
      const copper = it.kind === 'via' ? it.prim.r * 2 : Math.min(it.pad.w, it.pad.h), ring = (copper - d) / 2;
      if (want('annular') && it.pad?.plated !== false && ring < R.minAnnular - 1e-9) add(problem('drc.annular', named(it) + ' has an annular ring of ' + ring.toFixed(3) + ' mm; the minimum is ' + R.minAnnular + ' mm.', { rule: 'annular', objects: [it.id], at: where(it), found: +ring.toFixed(4), req: R.minAnnular }));
    }
  }
  if (want('hole-to-hole')) {
    const hs = board.drills(), g = new Grid(Math.max(R.holeToHole * 4, 2)); hs.forEach((h, n) => { h.n = n; g.add(h, [h.x - h.drill / 2 - R.holeToHole, h.y - h.drill / 2 - R.holeToHole, h.x + h.drill / 2 + R.holeToHole, h.y + h.drill / 2 + R.holeToHole]); });
    g.pairs((a, b) => { const d = dist([a.x, a.y], [b.x, b.y]) - a.drill / 2 - b.drill / 2; if (d < R.holeToHole - 1e-9) add(problem('drc.hole-to-hole', 'Holes ' + a.id + ' and ' + b.id + ' are ' + Math.max(0, d).toFixed(3) + ' mm apart (wall to wall); the rule is ' + R.holeToHole + ' mm.', { rule: 'hole-to-hole', objects: [a.id, b.id], at: [a.x, a.y], found: +Math.max(0, d).toFixed(4), req: R.holeToHole })); });
  }

  // --- board edge ---
  if (want('edge')) {
    const edges = polyEdges(board.outline), nearEdge = (p) => Math.min(...edges.map(([a, b]) => pointSegDist(p, a, b)));
    const inside = (p) => pointInPoly(p, board.outline);
    for (const it of items) {
      if (it.kind === 'zone') continue; // a pour is held back from the edge by the pour, not by this check
      const pts = it.prim.k === 'cap' ? (it.prim.a === it.prim.b || (it.prim.a[0] === it.prim.b[0] && it.prim.a[1] === it.prim.b[1]) ? [it.prim.a] : [it.prim.a, it.prim.b]) : it.prim.pts;
      let worst = Infinity, out_ = false;
      for (const p of pts) { const e = nearEdge(p) - (it.prim.r || 0); if (!inside(p)) out_ = true; worst = Math.min(worst, e); }
      if (out_) add(problem('drc.outside', named(it) + ' lies outside the board outline.', { rule: 'edge', objects: [it.id], at: where(it) }));
      else if (worst < R.edgeClearance - 1e-9) add(problem('drc.edge', named(it) + ' is ' + Math.max(0, worst).toFixed(3) + ' mm from the board edge; the rule is ' + R.edgeClearance + ' mm.', { rule: 'edge', objects: [it.id], at: where(it), found: +Math.max(0, worst).toFixed(4), req: R.edgeClearance }));
    }
    for (const h of board.drills()) { if (h.kind === 'pad' || h.kind === 'via') continue; const e = nearEdge([h.x, h.y]) - h.drill / 2; if (!inside([h.x, h.y]) || e < R.edgeClearance - 1e-9) add(problem('drc.edge', 'Hole ' + h.id + ' is too close to the board edge or outside it.', { rule: 'edge', objects: [h.id], at: [h.x, h.y], found: +e.toFixed(4), req: R.edgeClearance })); }
  }

  // --- courtyards ---
  if (want('courtyard')) {
    const cy = board.parts.map((p) => ({ ref: p.ref, side: p.side, poly: board.courtyardWorld(p) }));
    for (let i = 0; i < cy.length; i++) for (let j = i + 1; j < cy.length; j++) { if (cy[i].side !== cy[j].side) continue; if (polyPolyDist(cy[i].poly, cy[j].poly) === 0 && (pointInPoly(cy[i].poly[0], cy[j].poly) || pointInPoly(cy[j].poly[0], cy[i].poly) || overlapArea(cy[i].poly, cy[j].poly) > 1e-9)) add(problem('drc.courtyard', 'Courtyards of ' + cy[i].ref + ' and ' + cy[j].ref + ' overlap.', { rule: 'courtyard', objects: [cy[i].ref, cy[j].ref], at: cy[i].poly[0].map((v) => +v.toFixed(3)), severity: 'warning' })); }
  }

  // --- connectivity ---
  let islands = null;
  if (want('unconnected')) { const cn = connectivity(board, items); islands = cn; for (const u of cn.unconnected) add(problem('drc.unconnected', 'Net ' + u.net + ' is in ' + u.islands + ' pieces: ' + u.example.join(' | ') + ' are not joined.', { rule: 'unconnected', net: u.net, objects: u.example, islands: u.islands, at: u.at })); }
  return { problems: out, stats: { items: items.length, pairsChecked: typeof pairsChecked === 'number' ? pairsChecked : 0, islands } };
}

function overlapArea(P, Q) { // are the interiors overlapping? sample: any vertex of one strictly inside the other, or edge crossing with interior points
  const inP = (pt) => pointInPoly(pt, P), inQ = (pt) => pointInPoly(pt, Q);
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  for (const pt of P) if (inQ(pt) && !onBoundary(pt, Q)) return 1; for (const pt of Q) if (inP(pt) && !onBoundary(pt, P)) return 1;
  for (const [a, b] of polyEdges(P)) { const m = mid(a, b); if (inQ(m) && !onBoundary(m, Q)) return 1; }
  for (const [a, b] of polyEdges(Q)) { const m = mid(a, b); if (inP(m) && !onBoundary(m, P)) return 1; }
  // identical or crossing rectangles: the centre of P inside Q
  const c = [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length]; return inQ(c) && !onBoundary(c, Q) ? 1 : 0;
}
const onBoundary = (p, poly) => polyEdges(poly).some(([a, b]) => pointSegDist(p, a, b) < 1e-9);

/** Copper connectivity: items on one layer that touch are joined; vias join all layers; through pads join their layers. Zones join what they cover. */
export function connectivity(board, items = board.items()) {
  const par = items.map((_, i) => i), find = (x) => { while (par[x] !== x) { par[x] = par[par[x]]; x = par[x]; } return x; }, uni = (a, b) => { par[find(a)] = find(b); };
  const g = new Grid(2); items.forEach((it, n) => { it.n = n; g.add(it, primBox(it.prim)); });
  g.pairs((a, b) => { if (a.net !== b.net) return; if (!a.layers.some((l) => b.layers.includes(l))) return; if (a.kind === 'zone' && b.kind === 'zone') { if (gap(a.prim, b.prim) === 0) uni(a.n, b.n); return; } if (gap(a.prim, b.prim) <= 1e-9) uni(a.n, b.n); });
  // the same pad is one object per layer set already; a through-pad and a via of one net join across layers via the shared layer sets above
  const byNet = new Map(); items.forEach((it, i) => { if (!it.net) return; if (!byNet.has(it.net)) byNet.set(it.net, []); byNet.get(it.net).push(i); });
  const unconnected = [];
  for (const [net, list] of byNet) {
    const pads = list.filter((i) => items[i].kind === 'pad'); if (pads.length < 2) continue;
    const roots = new Map(); for (const i of pads) { const r = find(i); if (!roots.has(r)) roots.set(r, []); roots.get(r).push(items[i]); }
    if (roots.size > 1) { const groups = [...roots.values()]; unconnected.push({ net, islands: groups.length, example: groups.slice(0, 2).map((gr) => gr[0].id), at: groups[0][0].pad ? [+groups[0][0].pad.x.toFixed(3), +groups[0][0].pad.y.toFixed(3)] : [0, 0], groups: groups.map((gr) => gr.map((x) => x.id)) }); }
  }
  return { unconnected, find, items };
}
