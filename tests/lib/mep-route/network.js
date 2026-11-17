/* SPDX-License-Identifier: Apache-2.0 */
/**
 * network.js — a duct (or pipe) network from one source to many terminals, found with route.js (0.10 MEP.1, suggestion #1556).
 * DOM-free and app-free: a host gives it ports, boxes and a sizing rule, and gets back centre lines with a section each, ready to
 * be drawn as runs. The host's run model makes the fittings (BimCraft's mepLayout: an elbow at a corner, a tee where a run ends
 * on another run's line, a reducer where two runs of different sizes meet end to end).
 *
 * How it goes: the terminal farthest from the source is reached first, and that route is the MAIN. Every other terminal is
 * routed back onto the main (never onto another branch), arriving at right angles somewhere along a straight leg of it, far
 * enough from its corners and from the tees already there; the cheapest of the places tried wins (length + a cost per bend).
 * Then the main is cut into pieces: after each tee it carries less air, and when the size for what it still carries is
 * smaller, a new piece starts past the tee (room for the tee, then the reducer). A branch is one piece of its terminal's size.
 * Nothing upstream is ever smaller than what follows it. The main is routed at its biggest size, so every piece keeps the
 * clearance that size had.
 *
 *   routeNetwork({ source, terminals, obstacles, sizeFor, clearance?, bendRadius?, levels?, bendCost?, climbCost?, maxNodes?, tries? })
 *     source    { p: [x, y, z] mm, out: unit axis vector, section? }        section = { shape: 'rect'|'round'|'oval', w, h } mm
 *     terminals [{ id, p, out, flow, section? }]   flow in the host's unit (only sums and the sizing rule use it)
 *     obstacles [{ min, max, id? }]                 boxes in the same frame (mm)
 *     sizeFor(flow) → section                       the host's sizing rule (BimCraft: equal friction, ductForFlow)
 *     clearance mm kept from every obstacle (default 25), on top of the duct's own half size
 *   → { ok, runs: [{ role: 'main'|'branch', path, points, section, flow, start: 'source'|'tee'|'joint', end: 'terminal'|'joint',
 *        terminal (id) | null, host (path index of the main, for a branch) }],
 *       paths: [{ role, points, terminal, routeSection, error? }], tees: [{ branch, at, leg }], length, bends,
 *       failed: [{ id, error }], notes: [string keys] }
 *     ok is false when the main cannot be found (failed says why); a terminal that cannot be reached is left out and listed.
 *   sliceLine(points, s0, s1) → the polyline between two distances along it · lineLength(points) · boxOfLeg(a, b, half)
 *   sectionMax(sec) → its larger side · bendRadiusOf(sec) → the centre-line radius a host is assumed to use (round 1.5 D,
 *     rectangular one width or height, whichever is bigger: never smaller than the host's own)
 * Errors (failed[].error): route.js's ('blocked-start', 'blocked-end', 'no-route', 'too-big', 'axis') and 'no-place' (no
 * straight leg of the main has room for the tee).
 * Notes: 'reducer-skipped' (a smaller size had no room past its tee; the bigger size carries on, which is safe).
 */
import { route, legsOf, lengthOf, hitsObstacle } from './route.js';

export const sectionMax = (s) => Math.max(Number(s.w) || 0, Number(s.h) || Number(s.w) || 0);
export const bendRadiusOf = (s) => (s.shape === 'round' ? 1.5 * s.w : sectionMax(s));
const halfOf = (s) => [sectionMax(s) / 2, sectionMax(s) / 2, (s.shape === 'round' ? s.w : Number(s.h) || s.w) / 2];
const sameSec = (a, b) => a.shape === b.shape && Math.abs(a.w - b.w) < 0.5 && Math.abs((a.h || a.w) - (b.h || b.w)) < 0.5;
const fits = (small, big) => small.w <= big.w + 0.5 && (small.h || small.w) <= (big.h || big.w) + 0.5;
/** the tee's half lengths as BimCraft's mepLayout makes them: m along the host, mb along the branch */
const teeHalf = (host, br) => ({ m: Math.max(25, 0.5 * sectionMax(br) + 0.25 * sectionMax(host)), mb: Math.max(25, 0.5 * sectionMax(host) + 0.25 * sectionMax(br)) });
/** a reducer's length as mepLayout makes it (ducts: 15° a side, at least 150 mm; pipes: the bigger size, at least 38) */
const reducerLen = (a, b, pipe) => (pipe ? Math.max(38, Math.max(sectionMax(a), sectionMax(b)))
  : Math.max(150, Math.max(Math.abs(a.w - b.w), Math.abs((a.h || a.w) - (b.h || b.w))) / 2 / Math.tan(15 * Math.PI / 180)));

export const lineLength = (points) => lengthOf(points);
export function sliceLine(points, s0, s1) {
  const out = [];
  let acc = 0;
  const at = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], L = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    const lo = acc, hi = acc + L;
    if (hi >= s0 - 1e-9 && lo <= s1 + 1e-9 && L > 0) {
      if (!out.length) out.push(at(a, b, Math.max(0, (s0 - lo) / L)));
      if (hi <= s1 + 1e-9) out.push(b.slice()); else { out.push(at(a, b, (s1 - lo) / L)); break; }
    }
    acc = hi;
  }
  return out.filter((q, i) => !i || Math.hypot(q[0] - out[i - 1][0], q[1] - out[i - 1][1], q[2] - out[i - 1][2]) > 1e-6);
}
export function boxOfLeg(a, b, half) {
  return { min: [0, 1, 2].map((k) => Math.min(a[k], b[k]) - half[k]), max: [0, 1, 2].map((k) => Math.max(a[k], b[k]) + half[k]) };
}
/** Does an orthogonal polyline run over itself (two legs on one line sharing a stretch, or crossing)? Touching at a corner is fine. */
export function selfOverlaps(points, tol = 1) {
  const L = legsOf(points);
  for (let i = 0; i < L.length; i++) for (let j = i + 2; j < L.length; j++) {
    const a = L[i], b = L[j];
    // the two legs' boxes overlap by more than tol on the axes they run along, and meet on the others
    const lo = (l, k) => Math.min(l.a[k], l.b[k]), hi = (l, k) => Math.max(l.a[k], l.b[k]);
    if ([0, 1, 2].every((k) => Math.min(hi(a, k), hi(b, k)) - Math.max(lo(a, k), lo(b, k)) >= -tol)) return true;
  }
  return false;
}
const manhattan = (a, b) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) + Math.abs(a[2] - b[2]);
const leadOf = (n, L) => n.p.map((v, k) => v + n.out[k] * L);

export function routeNetwork(opt) {
  const clear = Number.isFinite(opt.clearance) ? opt.clearance : 25;
  const R = typeof opt.bendRadius === 'function' ? opt.bendRadius : bendRadiusOf;
  const pipe = !!opt.pipe;
  const obstacles = (opt.obstacles || []).filter((o) => o && o.min && o.max);
  const terms = (opt.terminals || []).filter((t) => t && t.p && t.out && Number(t.flow) > 0);
  const total = terms.reduce((n, t) => n + Number(t.flow), 0);
  const failed = [], notes = [];
  const done = (extra) => ({ ok: false, runs: [], paths: [], tees: [], length: 0, bends: 0, failed, notes, ...extra });
  if (!terms.length) return done({ failed: [{ id: null, error: 'no-terminals' }] });
  const mainSec = opt.source.section || opt.sizeFor(total);
  const termSec = (t) => t.section || opt.sizeFor(Number(t.flow));
  const flat = !!opt.flat;   // 0.10 MEP.2: one horizontal plane (a gravity drain's plan); the terminals face along X or Y
  const common = { flat, levels: opt.levels, bendCost: opt.bendCost, climbCost: opt.climbCost, maxNodes: opt.maxNodes || 3000000 };
  const clearOf = (sec) => halfOf(sec).map((v) => v + clear);
  const legOf = (sec) => 2 * R(sec) + 50;   // two elbows back to back, with a little straight between
  const bendCost = (sec) => (Number.isFinite(opt.bendCost) ? opt.bendCost : 4 * sectionMax(sec) + 200);

  // ---- 1. the main: to the terminal farthest from the source ----
  const order = terms.map((t, i) => ({ t, i, d: manhattan(leadOf(opt.source, 1), t.p) })).sort((a, b) => b.d - a.d || a.i - b.i);
  const first = order[0].t;
  // the main keeps out of the room every other terminal needs to reach it: the straight bit out of its port long enough for an
  // elbow and a tee's branch end (else a main straight over a diffuser leaves no room for a tee to drop into it)
  const reach = order.slice(1).map(({ t }) => {
    const bs = termSec(t), L = teeHalf(mainSec, bs).mb + R(bs) + 50, end = leadOf(t, L), h = halfOf(bs);
    return boxOfLeg(t.p, end, h);
  });
  const rMain = route({ from: { p: opt.source.p, out: opt.source.out }, to: { p: first.p, out: first.out }, obstacles: [...obstacles, ...reach], od: sectionMax(mainSec),
    clearance: clearOf(mainSec), minLeg: legOf(mainSec), lead: R(mainSec) + 50, ...common, bendCost: bendCost(mainSec) });
  if (!rMain.ok) return done({ failed: [{ id: first.id, error: rMain.error }] });
  const main = { role: 'main', points: rMain.points, terminal: first.id, routeSection: mainSec };
  const paths = [main];
  const tees = [];   // { branch (path index), s (along the main), leg, at, sec (branch), m }
  const mainLegs = legsOf(main.points);
  const legStart = []; { let acc = 0; for (const l of mainLegs) { legStart.push(acc); acc += l.len; } }

  // ---- 2. every other terminal onto the main ----
  const half = halfOf(mainSec);
  for (const { t } of order.slice(1)) {
    const bs = termSec(t), { m, mb } = teeHalf(mainSec, bs);
    const lead = R(bs) + 50, leadTee = mb + R(bs) + 50;
    const tl = leadOf(t, lead);
    // places along the main: straight legs, away from its corners and ends, away from the tees already there
    const cands = [];
    mainLegs.forEach((l, li) => {
      const ax = 'xyz'.indexOf(l.axis), sgn = Math.sign(l.b[ax] - l.a[ax]) || 1;
      const endRoom = (end) => (end ? (li === mainLegs.length - 1 ? 0 : R(mainSec)) : (li === 0 ? 0 : R(mainSec)));
      const lo = endRoom(false) + m + 50, hi = l.len - endRoom(true) - m - 50;
      if (hi < lo) return;
      const want = Math.max(lo, Math.min(hi, (tl[ax] - l.a[ax]) * sgn));
      for (const s of new Set([want, lo, hi, (lo + hi) / 2].map((v) => Math.round(v)))) {
        const S = legStart[li] + s;
        if (tees.some((x) => Math.abs(x.s - S) < x.m + m + 50)) continue;
        const P = l.a.map((v, k) => (k === ax ? v + sgn * s : v));
        cands.push({ li, s: S, P, d: manhattan(P, tl), ax });
      }
    });
    cands.sort((a, b) => a.d - b.d);
    let best = null, lastErr = cands.length ? 'no-route' : 'no-place';
    for (const c of cands.slice(0, opt.tries || 6)) {
      // the main and the branches already made are obstacles; the host leg too, except a window at the tee (the branch
      // starts there and leaves it at right angles)
      const own = [], win = half[c.ax] + clearOf(bs)[c.ax] + 1;
      mainLegs.forEach((l, li) => {
        if (li !== c.li) { own.push(boxOfLeg(l.a, l.b, half)); return; }
        const dir = Math.sign(l.b[c.ax] - l.a[c.ax]) || 1, P0 = c.P.slice(), P1 = c.P.slice();
        P0[c.ax] -= dir * win; P1[c.ax] += dir * win;
        own.push(boxOfLeg(l.a, P0, half), boxOfLeg(P1, l.b, half));
      });
      for (const p of paths.slice(1)) for (const l of legsOf(p.points)) own.push(boxOfLeg(l.a, l.b, halfOf(p.routeSection)));
      for (const k of flat ? [0, 1] : [0, 1, 2]) {
        if (k === c.ax) continue;
        for (const sgn of [1, -1]) {
          const out = [0, 0, 0]; out[k] = sgn;
          const r = route({ from: { p: t.p, out: t.out }, to: { p: c.P, out }, obstacles: [...obstacles, ...own], od: sectionMax(bs),
            clearance: clearOf(bs), minLeg: legOf(bs), lead: [lead, leadTee], ...common, bendCost: bendCost(bs) });
          if (!r.ok) { lastErr = r.error; continue; }
          const pts = r.points.slice().reverse();   // from the main out to the terminal
          // the window is free space to the router: past its first leg the branch must not come back into the host leg,
          // nor run over itself
          const hostBox = boxOfLeg(mainLegs[c.li].a, mainLegs[c.li].b, half);
          if (pts.length > 2 && hitsObstacle(pts.slice(1), [hostBox], Math.min(...clearOf(bs)) - 1)) { lastErr = 'no-route'; continue; }
          if (selfOverlaps(pts)) { lastErr = 'no-route'; continue; }
          const cost = r.length + r.bends * bendCost(bs);
          if (!best || cost < best.cost - 1e-6) best = { cost, pts, c, r };
        }
      }
    }
    if (!best) { failed.push({ id: t.id, error: lastErr }); continue; }
    paths.push({ role: 'branch', points: best.pts, terminal: t.id, routeSection: bs });
    tees.push({ branch: paths.length - 1, s: best.c.s, leg: best.c.li, at: best.c.P, sec: bs, m, flow: Number(t.flow) });
  }

  // ---- 3. the main in pieces, sized by what it still carries ----
  tees.sort((a, b) => a.s - b.s);
  const reached = paths.map((p) => terms.find((t) => t.id === p.terminal));
  const firstFlow = Number(reached[0].flow);
  let carried = firstFlow + tees.reduce((n, x) => n + x.flow, 0);
  const runs = [];
  const mainLen = lengthOf(main.points);
  let pieceStart = 0, cur = mainSec, startKind = 'source';
  for (let i = 0; i < tees.length; i++) {
    const x = tees[i];
    carried -= x.flow;
    const left = tees.slice(i + 1);
    const want = left.length ? opt.sizeFor(carried) : (reached[0].section || opt.sizeFor(carried));
    if (sameSec(want, cur) || !fits(want, cur)) continue;   // same size, or bigger (never grows downstream)
    const Lr = reducerLen(cur, want, pipe);
    const cut = x.s + x.m + Lr + 50;
    const leg = mainLegs[x.leg], legEnd = legStart[x.leg] + leg.len - (x.leg === mainLegs.length - 1 ? 0 : R(cur));
    const next = left[0];
    if (cut + 50 > legEnd || (next && cut + 50 + next.m > next.s)) { notes.push('reducer-skipped'); continue; }
    runs.push({ role: 'main', path: 0, points: sliceLine(main.points, pieceStart, cut), section: cur, flow: 0, start: startKind, end: 'joint', terminal: null });
    pieceStart = cut; cur = want; startKind = 'joint';
  }
  runs.push({ role: 'main', path: 0, points: sliceLine(main.points, pieceStart, mainLen), section: cur, flow: 0, start: startKind, end: 'terminal', terminal: main.terminal });
  // the flows of the pieces: what passes each piece's start
  { let f = firstFlow + tees.reduce((n, x) => n + x.flow, 0), si = 0; for (const r of runs) { r.flow = f; const endS = si + lengthOf(r.points); f -= tees.filter((x) => x.s >= si && x.s < endS).reduce((n, x) => n + x.flow, 0); si = endS; } }
  for (const x of tees) runs.push({ role: 'branch', path: x.branch, points: paths[x.branch].points, section: x.sec, flow: x.flow, start: 'tee', end: 'terminal', terminal: paths[x.branch].terminal, host: 0 });

  // the promise, checked: no centre line comes within its half size + clearance of an obstacle (the routes were found that way)
  // (the boxes a route's own ends sit in — the equipment it starts or ends on — are left out of that check)
  const inBox = (q, o) => q.every((v, k) => v >= o.min[k] - 1e-6 && v <= o.max[k] + 1e-6);
  const clash = paths.some((p) => {
    const c = Math.min(...clearOf(p.routeSection)) - 1, ends = [p.points[0], p.points[p.points.length - 1]];
    const grown = (o) => ({ min: o.min.map((v) => v - c), max: o.max.map((v) => v + c) });
    return hitsObstacle(p.points, obstacles.filter((o) => !ends.some((q) => inBox(q, grown(o)))), c);
  });
  const all = paths.map((p) => legsOf(p.points));
  return { ok: true, runs, paths, tees: tees.map((x) => ({ branch: x.branch, at: x.at, leg: x.leg })), length: all.flat().reduce((n, l) => n + l.len, 0),
    bends: all.reduce((n, l) => n + Math.max(0, l.length - 1), 0), failed, notes: [...new Set(notes)], clash };
}
