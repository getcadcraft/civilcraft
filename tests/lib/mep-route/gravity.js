/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine; messages are keys the host words */
/**
 * gravity.js — sanitary drainage by gravity on the MEP.1 router (0.10 MEP.2, suggestion #1557). DOM-free, app-free, no tables of its own:
 * the host gives it the rules of the code in force (sizes, the smallest slope per size, how many fixture units a size carries), so the
 * numbers stay where they are cited (BimCraft: mep/drainage.js, mep/pipes.js). No second router: the plan of the drains is
 * network.js (routeNetwork) with `flat: true`, which keeps the search in one horizontal plane; the fall is worked out afterwards.
 *
 * How it goes
 *  1. The fixtures' drains are routed in plan, flat, to the outlet (or to a stack's tap): a main to the farthest fixture, the others teed
 *     onto it at right angles. Sizes come from the fixture units each piece carries, never smaller than the fixture drains it serves nor
 *     than a drain flowing into it.
 *  2. The fall: every piece falls by its size's smallest slope along its length, towards the outlet. Going back from the outlet, the
 *     invert at every tee and every fixture follows; a fixture drain leaves its connector straight down (the tail) to the level its
 *     branch reaches. The outlet's invert is the HIGHEST one that leaves every tail at least `minTail` long, unless the host gives it
 *     (then a fixture the fall cannot reach is listed as 'no-fall' with the millimetres it is short).
 *  3. Stacks: each fixture goes to the nearest stack (or the one it names); the lateral runs of one stack meet it at their own level; the
 *     stack is one vertical run from above its highest tap to its foot, sized by the units of everything above it; from the foot a
 *     building drain is routed to the outlet the same way (the foot is its farthest "fixture").
 *  4. Vent stubs: a short vertical pipe up from each fixture's drain just past its trap arm, and the stack's top, are marked
 *     (positions; the distance a code allows between trap and vent is the person's to check).
 *
 *   planDrainage({ fixtures, outlet, stacks?, obstacles?, rules, minTail?, footBelow?, clearance?, ventSize?, ventLength? })
 *     fixtures  [{ id, p: [x, y, z] (the drain connector, mm), dir?: [dx, dy, dz], units, dn? (smallest drain, the host's nominal), stack? }]
 *     outlet    { p: [x, y, z?], out: [±1, 0, 0] | [0, ±1, 0], z? }   z = the invert there (optional)
 *     stacks    [{ id, p: [x, y] }]
 *     rules     { sizes: [{ key, nominal, od }] smallest first, slopeOf(nominal) → rise per run (fraction), capacity(nominal, slope, role) → units
 *               (role 'branch' | 'main') }
 *   → { ok, runs: [{ role: 'main'|'branch'|'stack', points, size, nominal, od, slope, units, terminal, from: 'fixture'|'tee'|'joint'|'stack', inverts: [start, end] }],
 *       vents: [{ id, at, up, nominal? }], stacks: [{ id, units, size, nominal, top, foot, taps: [{ z, units }] }], drops: { id → mm }, zOut,
 *       failed: [{ id, error, short? }], notes: [string], clash }
 *     errors: route.js's, 'no-fall' (short = mm), 'too-big' (no size carries it), 'no-place', 'no-stack'
 *     notes: 'junction-wye' (the run model draws a tee where a branch meets a drain; a drain needs a wye or a combination fitting there)
 *   arcOf(points, q) → distance along the polyline to q · slopeRise(pieces, s) → the rise over the first s mm (tested)
 */
import { routeNetwork } from './network.js';
import { lengthOf, hitsObstacle } from './route.js';

const EPS = 1e-6;
const pt = (a) => [a[0], a[1], a[2] || 0];
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], (a[2] || 0) - (b[2] || 0));
/** Distance along an orthogonal polyline to a point q lying on it (the nearest leg). */
export function arcOf(points, q) {
  let acc = 0, best = { d: Infinity, s: 0 };
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1], b = points[i], L = dist(a, b);
    if (L > 0) {
      const t = Math.max(0, Math.min(1, ((q[0] - a[0]) * (b[0] - a[0]) + (q[1] - a[1]) * (b[1] - a[1]) + ((q[2] || 0) - (a[2] || 0)) * ((b[2] || 0) - (a[2] || 0))) / (L * L)));
      const p = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, (a[2] || 0) + ((b[2] || 0) - (a[2] || 0)) * t], d = dist(p, [q[0], q[1], q[2] || 0]);
      if (d < best.d) best = { d, s: acc + t * L };
    }
    acc += L;
  }
  return best.s;
}
/** The rise over the first `s` mm from the outlet; pieces = [{ a (arc start), len, slope }] in order from the outlet. */
export function slopeRise(pieces, s) { return pieces.reduce((n, k) => n + k.slope * Math.max(0, Math.min(k.len, s - k.a)), 0); }

const dirOut = (from, to) => { const dx = to[0] - from[0], dy = to[1] - from[1]; return Math.abs(dx) >= Math.abs(dy) ? [Math.sign(dx) || 1, 0, 0] : [0, Math.sign(dy) || 1, 0]; };
const horizontal = (d) => d && Math.abs(d[2] || 0) < 0.1 && (Math.abs(d[0]) > 0.9 || Math.abs(d[1]) > 0.9);

/** One gravity tree: terminals (fixtures, or stack feet) → source (the outlet or a stack's tap). */
export function gravityTree(opt) {
  const R = opt.rules, minTail = Number.isFinite(opt.minTail) ? opt.minTail : 0;
  const failed = [], notes = [];
  const sec = (s) => ({ shape: 'round', w: s.od, h: s.od, key: s.key, nominal: s.nominal });
  const pick = (units, floor, role) => R.sizes.find((s) => s.nominal + 1e-9 >= floor && R.capacity(s.nominal, R.slopeOf(s.nominal) ?? 0.01, role) >= units) || null;
  const terms = [];
  for (const t of opt.terminals) {
    const s = pick(t.units, t.dn || 0, 'branch');
    if (!s) { failed.push({ id: t.id, error: 'too-big' }); continue; }
    terms.push({ ...t, size: s });
  }
  if (!terms.length) return { ok: false, runs: [], vents: [], failed, notes, zOut: null, drops: {}, net: null };
  const mainFloor = Math.max(0, ...terms.map((t) => Math.max(t.dn || 0, t.size.nominal)));
  const zPorts = terms.map((t) => t.p[2]);
  const zRef = Number.isFinite(opt.zRef) ? opt.zRef : (Number.isFinite(opt.outlet.z) ? opt.outlet.z + 150 : Math.min(...zPorts) - minTail - 150);
  const sizeFor = (flow) => sec(pick(flow, mainFloor, 'main') || R.sizes[R.sizes.length - 1]);
  const net = routeNetwork({
    source: { p: [opt.outlet.p[0], opt.outlet.p[1], zRef], out: opt.outlet.out }, pipe: true, flat: true, clearance: opt.clearance ?? 25,
    terminals: terms.map((t) => ({ id: t.id, p: [t.p[0], t.p[1], zRef], out: horizontal(t.dir) ? t.dir.slice(0, 2).concat(0) : dirOut(t.p, opt.outlet.p), flow: Math.max(t.units, 1e-6), section: sec(t.size) })),
    obstacles: opt.obstacles || [], sizeFor,
  });
  if (!net.ok) return { ok: false, runs: [], vents: [], failed: [...failed, ...net.failed], notes, zOut: null, drops: {}, net };
  for (const f of net.failed) failed.push(f);
  const byId = new Map(terms.map((t) => [t.id, t]));
  const main = net.paths[0], mainLen = lengthOf(main.points);
  const mainRuns = net.runs.filter((r) => r.role === 'main'), branchRuns = net.runs.filter((r) => r.role === 'branch');
  const tees = branchRuns.map((r) => ({ run: r, s: arcOf(main.points, r.points[0]), t: byId.get(r.terminal) }));
  // the pieces of the main in order from the outlet, their true floors and sizes (never smaller than what flows into them)
  const pieces = [];
  { let a = 0; for (const r of mainRuns) { const len = lengthOf(r.points); pieces.push({ run: r, a, len, size: null }); a += len; } }
  for (let k = pieces.length - 1; k >= 0; k--) {
    const P = pieces[k], end = byId.get(mainRuns[mainRuns.length - 1].terminal);
    let floor = Math.max(end?.dn || 0, end?.size.nominal || 0);
    for (const x of tees) if (x.s >= P.a - 1e-6) floor = Math.max(floor, x.t.dn || 0, x.t.size.nominal);
    if (pieces[k + 1]) floor = Math.max(floor, pieces[k + 1].size.nominal);
    P.size = pick(P.run.flow, floor, 'main') || P.run.section;
    P.slope = R.slopeOf(P.size.nominal) ?? 0.01;
    if (!pick(P.run.flow, floor, 'main')) failed.push({ id: P.run.terminal, error: 'too-big' });
  }
  const rise = (s) => slopeRise(pieces, s);
  const endT = byId.get(main.terminal);
  const attach = [{ t: endT, rise: rise(mainLen), run: mainRuns[mainRuns.length - 1], kind: 'end' }];
  for (const x of tees) { const sl = R.slopeOf(x.t.size.nominal) ?? 0.01; attach.push({ t: x.t, rise: rise(x.s) + sl * lengthOf(x.run.points), run: x.run, kind: 'branch', s: x.s, slope: sl }); }
  const given = Number.isFinite(opt.outlet.z);
  const zOut = given ? opt.outlet.z : Math.floor(Math.min(...attach.map((a) => a.t.p[2] - minTail - a.rise)));
  const drops = {};
  for (const a of attach) { const drop = a.t.p[2] - (zOut + a.rise); drops[a.t.id] = Math.round(drop * 10) / 10; if (drop < minTail - 1e-6) failed.push({ id: a.t.id, error: 'no-fall', short: Math.round((minTail - drop) * 10) / 10 }); }
  const runs = [], vents = [];
  const tail = (t, zStart, pts) => { const out = pts.map((q) => [q[0], q[1], zStart]); if (t.p[2] - zStart > 0.5 && !t.noTail) out.unshift(pt(t.p)); return out; };
  const ventAt = (t, pts, zStart, slope) => {
    // just past the trap arm: along the first horizontal leg, an elbow's room from the tail
    const a = pts[0], b = pts[1], L = dist(a, b), d = Math.min(L * 0.5, Math.max(150, (t.size.od || 50) * 2));
    const q = [a[0] + (b[0] - a[0]) * d / L, a[1] + (b[1] - a[1]) * d / L, zStart - slope * d];
    vents.push({ id: t.id, at: q, up: opt.ventLength ?? 300, trapToVent: Math.round((Math.max(0, t.p[2] - zStart) + d) * 10) / 10 });
  };
  mainRuns.forEach((r, k) => {
    const P = pieces[k], zStart = zOut + rise(P.a + P.len);
    const flat = r.points.slice().reverse();   // flowing towards the outlet: first point upstream
    const last = k === mainRuns.length - 1;
    const pts = last ? tail(endT, zStart, flat) : flat.map((q) => [q[0], q[1], zStart]);
    if (last) ventAt(endT, flat, zStart, P.slope);
    runs.push({ role: 'main', points: pts, size: P.size.key, nominal: P.size.nominal, od: P.size.od ?? P.run.section.w, slope: P.slope, units: P.run.flow, terminal: last ? endT.id : null,
      from: last ? (endT.stack ? 'stack' : 'fixture') : 'joint', inverts: [zStart, zStart - P.slope * P.len] });
  });
  for (const x of tees) {
    const sl = R.slopeOf(x.t.size.nominal) ?? 0.01, Lb = lengthOf(x.run.points), zStart = zOut + rise(x.s) + sl * Lb;
    const flat = x.run.points.slice().reverse();   // terminal → the main
    runs.push({ role: 'branch', points: tail(x.t, zStart, flat), size: x.t.size.key, nominal: x.t.size.nominal, od: x.t.size.od, slope: sl, units: x.t.units, terminal: x.t.id,
      from: x.t.stack ? 'stack' : 'fixture', inverts: [zStart, zStart - sl * Lb] });
    ventAt(x.t, flat, zStart, sl);
  }
  if (tees.length) notes.push('junction-wye');
  // the developed length from each trap (its connector) down the tail and along the drains to the outlet: where a fixture is vented
  // through the stack alone, this is its trap-to-vent distance
  const toOutlet = {};
  toOutlet[endT.id] = Math.round((Math.max(0, drops[endT.id]) + mainLen) * 10) / 10;
  for (const x of tees) toOutlet[x.t.id] = Math.round((Math.max(0, drops[x.t.id]) + lengthOf(x.run.points) + x.s) * 10) / 10;
  // a 45-degree wye where a drain meets a drain (a drain never takes a square tee): the run model draws what it can, the kind is named here
  const junctions = tees.map((x) => ({ kind: 'wye', angle: 45, at: x.run.points[0].slice(), branch: x.t.id, size: x.t.size.key, nominal: x.t.size.nominal }));
  // the promise, checked on the real (sloped) centre lines
  const real = runs.map((r) => { const p = r.points.map(pt), out = [];
    let z = null; for (let i = 0; i < p.length; i++) { if (z === null) z = p[i][2]; else if (Math.abs(p[i][0] - p[i - 1][0]) + Math.abs(p[i][1] - p[i - 1][1]) > EPS) z -= r.slope * dist([p[i][0], p[i][1], 0], [p[i - 1][0], p[i - 1][1], 0]); else z = p[i][2]; out.push([p[i][0], p[i][1], z]); }
    return out; });
  const clash = real.some((pts, i) => { const c = (runs[i].od || 50) / 2 + (opt.clearance ?? 25) - 1; return pts.length > 1 && hitsObstacle(pts, opt.obstacles || [], c); });
  return { ok: !failed.length, runs, vents, failed, notes, zOut, drops, net, clash, tees: net.tees, junctions, toOutlet };
}

/**
 * Trap-to-vent distances (0.11 MEP.2). `opt.vent`: 'own' (default: each fixture has its own vent stub just past its trap arm; the distance is the
 * developed length from the trap down the tail to the stub) or 'stack' (no stub: the fixture is vented through the stack; the distance is the
 * developed length from the trap to the stack). The most a code allows is the PERSON'S (or the host's cited table): `rules.ventLimit(trapNominal,
 * slope) → mm | null`, or `opt.ventLimit` (one number, mm). With none, the distances are reported and nothing is checked (note 'vent-limit-not-set').
 * Never a claim of compliance: it compares two numbers the person can see.
 */
function ventChecks(opt, fixtures, vents, toOutlet, runs, failed) {
  const R = opt.rules, mode = opt.vent === 'stack' && (opt.stacks || []).length ? 'stack' : 'own';
  const rows = [];
  for (const f of fixtures) {
    const own = (vents || []).find((v) => v.id === f.id);
    const d = mode === 'stack' ? toOutlet?.[f.id] : own?.trapToVent;
    if (!Number.isFinite(d)) continue;
    const run = (runs || []).find((r) => r.terminal === f.id);
    const lim = Number.isFinite(opt.ventLimit) ? opt.ventLimit : R.ventLimit ? R.ventLimit(f.dn, run?.slope) : null;
    const row = { id: f.id, mode, distance: d, limit: Number.isFinite(lim) ? lim : null, ok: !Number.isFinite(lim) || d <= lim + 1e-9 };
    rows.push(row);
    if (!row.ok) failed.push({ id: f.id, error: 'vent-distance', over: Math.round((d - lim) * 10) / 10 });
  }
  return { ventChecks: rows, vents: mode === 'stack' ? [] : vents };
}

export function planDrainage(opt) {
  const R = opt.rules, minTail = Number.isFinite(opt.minTail) ? opt.minTail : 0, footBelow = Number.isFinite(opt.footBelow) ? opt.footBelow : 300;
  const fixtures = (opt.fixtures || []).filter((f) => f && f.p && f.units >= 0);
  const stacks = opt.stacks || [];
  if (!fixtures.length) return { ok: false, runs: [], vents: [], stacks: [], failed: [{ id: null, error: 'no-fixtures' }], notes: [], drops: {}, zOut: null };
  const base = { rules: R, minTail, clearance: opt.clearance, obstacles: opt.obstacles || [], ventLength: opt.ventLength };
  if (!stacks.length) {
    const r = gravityTree({ ...base, outlet: opt.outlet, terminals: fixtures });
    const vc = ventChecks(opt, fixtures, r.vents, r.toOutlet, r.runs, r.failed);
    return { ...r, stacks: [], ...vc, ok: r.ok && !r.failed.length };
  }
  // fixtures to stacks
  const groups = new Map(stacks.map((s) => [s.id, []]));
  const failed = [];
  for (const f of fixtures) {
    const s = f.stack ? stacks.find((x) => x.id === f.stack) : stacks.slice().sort((a, b) => Math.hypot(a.p[0] - f.p[0], a.p[1] - f.p[1]) - Math.hypot(b.p[0] - f.p[0], b.p[1] - f.p[1]))[0];
    if (!s) { failed.push({ id: f.id, error: 'no-stack' }); continue; }
    groups.get(s.id).push(f);
  }
  const runs = [], vents = [], notes = new Set(), stackOut = [], feet = [], drops = {}, toOutlet = {}, junctions = [];
  let clash = false;
  const stackBox = (s, od) => ({ min: [s.p[0] - od / 2, s.p[1] - od / 2, -1e7], max: [s.p[0] + od / 2, s.p[1] + od / 2, 1e7] });
  for (const s of stacks) {
    const g = groups.get(s.id);
    if (!g.length) continue;
    // 0.11: several storeys in one go: the fixtures of one stack are split by their `storey` (the host's key); each storey's laterals are
    // routed flat at their own level and tap the one stack there; the stack runs from above the highest tap to the foot below the lowest
    const byStorey = new Map();
    for (const f of g) { const k = f.storey ?? ''; if (!byStorey.has(k)) byStorey.set(k, []); byStorey.get(k).push(f); }
    const others = stacks.filter((x) => x.id !== s.id).map((x) => stackBox(x, 150));
    const taps = [];
    for (const [key, gs] of byStorey) {
      const cx = gs.reduce((n, f) => n + f.p[0], 0) / gs.length, cy = gs.reduce((n, f) => n + f.p[1], 0) / gs.length;
      const tree = gravityTree({ ...base, obstacles: [...base.obstacles, ...others], outlet: { p: [s.p[0], s.p[1], 0], out: dirOut(s.p, [cx, cy]) }, terminals: gs.map((f) => ({ ...f, stack: false })) });
      for (const f of tree.failed) failed.push(f);
      if (!tree.runs.length) continue;
      Object.assign(drops, tree.drops); Object.assign(toOutlet, tree.toOutlet || {});
      for (const n of tree.notes) notes.add(n);
      junctions.push(...(tree.junctions || []));
      clash = clash || tree.clash;
      for (const r of tree.runs) r.storey = key;
      for (const v of tree.vents) v.storey = key;
      runs.push(...tree.runs); vents.push(...tree.vents);
      const m = tree.runs.filter((r) => r.role === 'main')[0];
      if (m) taps.push({ z: m.inverts[1], units: gs.reduce((n, f) => n + f.units, 0), storey: key });
    }
    if (!taps.length) continue;
    const units = g.reduce((n, f) => n + f.units, 0);
    const lateral = Math.max(0, ...runs.filter((r) => r.role === 'main' && g.some((f) => f.id === r.terminal)).map((r) => r.nominal), ...g.map((f) => f.dn || 0));
    const size = R.sizes.find((z) => z.nominal + 1e-9 >= lateral && R.capacity(z.nominal, R.slopeOf(z.nominal) ?? 0.01, 'branch') >= units);
    if (!size) { failed.push({ id: 'stack:' + s.id, error: 'too-big' }); continue; }
    const tapZ = Math.min(...taps.map((x) => x.z)), topZ = Math.max(...taps.map((x) => x.z));
    stackOut.push({ id: s.id, units, size: size.key, nominal: size.nominal, od: size.od, top: topZ, taps, storeys: byStorey.size, p: s.p, tap: tapZ });
    feet.push({ id: 'stack:' + s.id, p: [s.p[0], s.p[1], tapZ - footBelow], units, dn: size.nominal, stack: true, noTail: true, _s: s });
  }
  // the building drain: from each stack's foot to the outlet
  const bd = gravityTree({ ...base, obstacles: base.obstacles, outlet: opt.outlet, terminals: feet.map(({ _s, ...t }) => t), zRef: undefined });
  for (const f of bd.failed) failed.push(f);
  for (const n of bd.notes) notes.add(n);
  clash = clash || bd.clash;
  const lowKey = (st) => st.taps.reduce((m, x) => (x.z < m.z ? x : m), st.taps[0]).storey;
  for (const r of bd.runs) {
    const st = stackOut.find((x) => 'stack:' + x.id === r.terminal);
    r.storey = st ? lowKey(st) : stackOut.length ? lowKey(stackOut[0]) : undefined;
    // the stack's foot is where its own run ends: the first, vertical part of the building drain's first run is the stack (no tail drawn)
    runs.push(r);
  }
  for (const st of stackOut) {
    const fr = bd.runs.find((r) => r.terminal === 'stack:' + st.id);
    const foot = fr ? fr.inverts[0] : st.tap - footBelow;
    st.foot = foot;
    runs.push({ role: 'stack', storey: lowKey(st), points: [[st.p[0], st.p[1], st.top + (opt.stackAbove ?? 300)], [st.p[0], st.p[1], foot]], size: st.size, nominal: st.nominal, od: st.od, slope: 0, units: st.units, terminal: null, from: 'stack', inverts: [st.top, foot] });
  }
  junctions.push(...(bd.junctions || []));
  // the stack's own distance to the outlet is part of every fixture's way to the building drain; trap-to-vent is measured to the stack
  const vc = ventChecks(opt, fixtures, vents, toOutlet, runs, failed);
  return { ok: !failed.length && bd.ok, runs, vents: vc.vents, ventChecks: vc.ventChecks, stacks: stackOut.map(({ p, tap, ...s }) => s), failed, notes: [...notes], drops: { ...drops, ...bd.drops }, zOut: bd.zOut, clash, net: bd.net, junctions };
}
