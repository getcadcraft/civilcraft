/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine; messages are keys the host words */
/**
 * water.js — domestic cold and hot water on the MEP.1 router (0.10 MEP.3, suggestion #1558). DOM-free, app-free. No second router
 * (routeNetwork with pipe: true) and no second hydraulics: demand, friction and fitting losses are the host's functions
 * (BimCraft: mep/flow.js demandFor, hazenWilliams, PIPE_K), so the numbers stay where they are labelled. lib/waternet's solver
 * is for looped networks with node demands; a branched supply from one source is series arithmetic along each path, which is what is
 * done here (a loop is a fixed-flow return line, sized by the person's own size).
 *
 *   planWater({ source: { p, out, section? }, fixtures: [{ id, p, out, units }], obstacles?, rules, pressure?, loop?, system?, clearance? })
 *     units  supply fixture units (the code's table: the person's), added up along the network
 *     rules  { sizes: [{ key, od, id }] smallest first (mm), demand(units) → m³/s, friction(Q m³/s, D m, C) → Pa/m, C, K: { elbow, tee_run,
 *              tee_branch, reducer }, vmax (m/s), rho? (kg/m³) }
 *     pressure { source (kPa at the source), required (kPa at a fixture), minimum? }   the check at every fixture
 *     relax  true: obstacles within 150 mm of a connector of this system are left out (hot beside cold)
 *     loop   { to: { p, out }, size: key }   a return line from the end of the longest path back to `to` (hot water recirculation)
 *   → { ok, runs: [{ role, points, size, od, units, flow (m³/s), terminal, system }], paths: [{ id, length, bends, rise, friction, fittings, static, pressure,
 *       ok, velocity }], worst: { id, pressure } | null, failed, notes, clash, loop: { run } | null, schedule: [{ size, length }] }
 *   errors: route.js's, 'too-big' (no size keeps the velocity), 'low-pressure' (path under the required pressure; `short` kPa)
 *   hotFrom(cold, offset) · boxesOfRuns(runs, clearance)
 */
import { routeNetwork } from './network.js';
import { route, legsOf, lengthOf, hitsObstacle } from './route.js';
import { arcOf } from './gravity.js';

const G = 9.80665;
/** The boxes of runs' straight legs as obstacles. `snap` (mm) rounds every face outwards to a multiple of it: the router's grid has a line at every
 *  face, so a handful of pipes side by side would otherwise make a grid too fine to search (9 s → minutes). */
export const boxesOfRuns = (runs, extra = 0, snap = 0) => runs.flatMap((r) => legsOf(r.points).map((l) => {
  const h = (r.od || 20) / 2 + extra, lo = (v) => (snap ? Math.floor(v / snap) * snap : v), hi = (v) => (snap ? Math.ceil(v / snap) * snap : v);
  return { min: [0, 1, 2].map((k) => lo(Math.min(l.a[k], l.b[k]) - h)), max: [0, 1, 2].map((k) => hi(Math.max(l.a[k], l.b[k]) + h)) };
}));
/** A hot connector next to a cold one (a fixture family with a cold connector only): offset mm along X, a drafting default. */
export const hotFrom = (p, offset = 100) => [p[0] + offset, p[1], p[2]];

export function planWater(opt) {
  const R = opt.rules, failed = [], notes = [], rho = R.rho ?? 998.2;
  const sec = (s) => ({ shape: 'round', w: s.od, h: s.od, key: s.key, id: s.id, od: s.od });
  const fixtures = (opt.fixtures || []).filter((f) => f && f.p && f.units > 0);
  if (!fixtures.length) return { ok: false, runs: [], paths: [], worst: null, failed: [{ id: null, error: 'no-fixtures' }], notes, loop: null, schedule: [] };
  // `relax`: another system's pipes (hot beside cold) leave out the boxes a connector of this one sits in or beside (150 mm): the two connectors of a fixture are close
  const pts = [opt.source.p, ...fixtures.map((f) => f.p)];
  const obstacles = (opt.obstacles || []).filter((o) => !opt.relax || !pts.some((q) => q.every((v, k) => v >= o.min[k] - 150 && v <= o.max[k] + 150)));
  const sizeBy = (units) => {
    const Q = R.demand(units);
    return R.sizes.find((s) => Q / (Math.PI * (s.id / 1000) ** 2 / 4) <= R.vmax + 1e-9) || null;
  };
  const sizeFor = (units) => sec(sizeBy(units) || R.sizes[R.sizes.length - 1]);
  const net = routeNetwork({
    source: { p: opt.source.p, out: opt.source.out, ...(opt.source.section ? { section: opt.source.section } : {}) }, pipe: true, clearance: opt.clearance ?? 25,
    terminals: fixtures.map((f) => ({ id: f.id, p: f.p, out: f.out, flow: f.units, section: sec(sizeBy(f.units) || R.sizes[R.sizes.length - 1]) })),
    obstacles, sizeFor, levels: opt.levels,
  });
  if (!net.ok) return { ok: false, runs: [], paths: [], worst: null, failed: net.failed, notes, loop: null, schedule: [] };
  for (const f of net.failed) failed.push(f);
  for (const f of fixtures) if (!sizeBy(f.units)) failed.push({ id: f.id, error: 'too-big' });
  const runs = net.runs.map((r) => ({ role: r.role, points: r.points, size: r.section.key, od: r.section.od ?? r.section.w, id: r.section.id, units: r.flow, flow: R.demand(r.flow), terminal: r.terminal, system: opt.system || 'cw', _r: r }));
  // series arithmetic along each path: the main's pieces up to the tee, then the branch
  const main = net.paths[0], mainRuns = runs.filter((r) => r.role === 'main');
  const byTerm = new Map(fixtures.map((f) => [f.id, f]));
  const K = R.K || {}, C = R.C ?? 130;
  const loss = (r, len) => R.friction(r.flow, r.id / 1000, C) * len / 1000;   // Pa
  const bendsOf = (pts) => Math.max(0, legsOf(pts).length - 1);
  const paths = [];
  const pieceStart = []; { let a = 0; for (const r of mainRuns) { pieceStart.push(a); a += lengthOf(r.points); } }
  const upTo = (s) => {   // friction, bends and reducers along the main up to arc s
    let fr = 0, bends = 0, red = 0, len = 0;
    mainRuns.forEach((r, k) => { const L = lengthOf(r.points), take = Math.max(0, Math.min(L, s - pieceStart[k])); if (take > 0) { fr += loss(r, take); len += take; } if (k && s > pieceStart[k]) red++; });
    const cut = main.points; let acc = 0; for (let i = 1; i < cut.length - 1; i++) { acc += Math.hypot(cut[i][0] - cut[i - 1][0], cut[i][1] - cut[i - 1][1], cut[i][2] - cut[i - 1][2]); if (acc < s) bends++; }
    return { fr, bends, red, len };
  };
  const zAtMainArc = (s) => { let acc = 0; const P = main.points; for (let i = 1; i < P.length; i++) { const L = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1], P[i][2] - P[i - 1][2]); if (acc + L >= s - 1e-9) return P[i - 1][2] + (P[i][2] - P[i - 1][2]) * (L ? (s - acc) / L : 0); acc += L; } return P[P.length - 1][2]; };
  const zSrc = opt.source.p[2];
  const mainEnd = mainRuns[mainRuns.length - 1];
  const entries = [{ id: mainEnd.terminal, s: lengthOf(main.points), run: null }];
  for (const r of runs.filter((x) => x.role === 'branch')) entries.push({ id: r.terminal, s: arcOf(main.points, r.points[0]), run: r });
  for (const e of entries) {
    const f = byTerm.get(e.id), u = upTo(e.s);
    let fr = u.fr, bends = u.bends, fit = 0, len = u.len, z = zAtMainArc(e.s);
    if (e.run) { fr += loss(e.run, lengthOf(e.run.points)); bends += bendsOf(e.run.points); len += lengthOf(e.run.points); z = e.run.points[e.run.points.length - 1][2]; fit += (K.tee_branch ?? 0); }
    else z = main.points[main.points.length - 1][2];
    const dyn = (r) => (r.flow / (Math.PI * (r.id / 1000) ** 2 / 4)) ** 2 * rho / 2;
    fit = (fit + bends * (K.elbow ?? 0) + u.red * (K.reducer ?? 0)) * dyn(e.run || mainEnd);
    const stat = (z - zSrc) / 1000 * rho * G;
    const p = opt.pressure ? opt.pressure.source - (fr + fit + stat) / 1000 : null;
    const need = opt.pressure ? (opt.pressure.required ?? 0) : null;
    const rr = e.run || mainEnd, v = rr.flow / (Math.PI * (rr.id / 1000) ** 2 / 4);
    const row = { id: e.id, length: len, bends, rise: z - zSrc, friction: fr / 1000, fittings: fit / 1000, static: stat / 1000, pressure: p, velocity: v, ok: p === null || p >= need - 1e-9 };
    if (!row.ok) failed.push({ id: e.id, error: 'low-pressure', short: Math.round((need - p) * 10) / 10 });
    paths.push(row);
  }
  const worst = opt.pressure ? paths.reduce((a, b) => (!a || b.pressure < a.pressure ? b : a), null) : null;
  let loop = null;
  if (opt.loop) {
    const far = entries.reduce((a, b) => (b.s > (a?.s ?? -1) ? b : a), null), t = byTerm.get(far.id), sz = R.sizes.find((s) => s.key === opt.loop.size) || R.sizes[0];
    const near = (b, q) => q.every((v, k) => v >= b.min[k] - 200 && v <= b.max[k] + 200);   // the boxes the loop starts or ends inside are its own pipes
    const others = [...obstacles, ...boxesOfRuns(runs, 0, opt.snap || 0)].filter((b) => !near(b, t.p) && !near(b, opt.loop.to.p));
    const r = route({ from: { p: t.p, out: t.out }, to: { p: opt.loop.to.p, out: opt.loop.to.out }, obstacles: others, od: sz.od, clearance: sz.od / 2 + 25, lead: 100, maxNodes: 3000000 });
    if (r.ok) { loop = { run: { role: 'loop', points: r.points.slice().reverse(), size: sz.key, od: sz.od, id: sz.id, units: 0, flow: 0, terminal: null, system: opt.loopSystem || 'hwr' } }; }
    else { failed.push({ id: "loop", error: r.error }); }
  }
  const sched = new Map();
  for (const r of [...runs, ...(loop ? [loop.run] : [])]) sched.set(r.size, (sched.get(r.size) || 0) + lengthOf(r.points));
  const schedule = [...sched].map(([size, length]) => ({ size, length }));
  const all = runs.concat(loop ? [loop.run] : []);
  const clash = all.some((r) => hitsObstacle(r.points, obstacles.filter((o) => !r.points.some((q) => q.every((v, k) => v >= o.min[k] - 1e-6 && v <= o.max[k] + 1e-6))), (r.od || 20) / 2 + (opt.clearance ?? 25) - 1));
  return { ok: !failed.length, runs: runs.map(({ _r, ...r }) => r), paths, worst, failed, notes: [...new Set([...net.notes, ...notes])], clash, loop, schedule, net };
}
