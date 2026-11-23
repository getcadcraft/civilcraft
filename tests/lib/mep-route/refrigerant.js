/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine; messages are keys the host words */
/**
 * refrigerant.js — split, multi-split and VRF refrigerant pipes on the MEP.1 router (0.10 MEP.4, suggestion #1559). DOM-free, app-free.
 * The liquid and gas lines are routed as ONE path (routeNetwork with a bundle as wide as both tubes and the gap between them), then drawn
 * as two parallel pipes: each corner of the path turns the offset the same way the path turns (parallel transport), so the pair never
 * crosses. Where an indoor unit's branch meets the trunk a BRANCH KIT is marked (a refnet joint, not a tee: the person's maker names it);
 * the branch pair starts at the kit. Condensate drains are MEP.2's gravity rule (gravity.js, called by the host with the units' drain
 * ports). NO product data: tube sizes come from the person's own line-set table (`rules.lineSet`) or from the units' ports; the limits
 * (length, height difference) are typed by the person; a limit left out is not checked.
 *
 *   planRefrigerant({ outdoor: { p, out, liquid, gas }, indoors: [{ id, p, out, capacity?, liquid?, gas? }], obstacles?, rules, limits?, clearance? })
 *     liquid / gas  { key, od } (mm) the unit's own port sizes
 *     rules  { lineSet(capacity) → { liquid: {key, od}, gas: {key, od} } | null (the person's table, by what a pipe carries), gap (mm between the tubes, default 25) }
 *     limits { maxTotal, maxLongest, maxOutdoorAbove, maxOutdoorBelow, maxIndoorIndoor } mm, any left out = not checked (the maker's, typed)
 *   → { ok, runs: [{ role: 'trunk'|'branch', line: 'liquid'|'gas', points, size, od, capacity, terminal }], kits: [{ at, branch, capacity }],
 *       checks: [{ key, id?, value, limit, ok }], lengths: { total, longest, perUnit: { id → mm } }, heights: { id → indoor − outdoor (mm) },
 *       failed, notes, clash }
 * 0.11: `units[].ports` / `outdoor.ports` = { liquid: [x,y,z], gas: [x,y,z] } (the real port points): each line's end is carried on to its own port with short
 *   legs, one axis at a time (none shorter than `rules.minLeg`, else it stays centred, note 'port-offset') (note 'port-stub' when two axes); the nearer port goes with the nearer line. `rules.equivalent(kind, line, sizeKey) → mm` (kind
 *   'bend' | 'kit'; the MAKER'S values, typed by the person: none is shipped) adds each fitting's equivalent length to the straight length; limits are then checked on
 *   `equivalent` lengths (note 'equivalent-lengths') and the result has `equivalent: { total, longest, perUnit }`.
 *   offsetPath(points, lateral, off) → the polyline moved `off` mm to the side, by parallel transport · lateralAt(points, lateral, s)
 */
import { routeNetwork, sliceLine, lineLength, sectionMax } from './network.js';
import { legsOf, lengthOf, hitsObstacle } from './route.js';
import { arcOf } from './gravity.js';

const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const norm = (v) => { const L = Math.hypot(...v) || 1; return v.map((x) => x / L); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const dirs = (pts) => pts.slice(1).map((p, i) => norm(sub(p, pts[i])));
/** The side vector of a first leg: horizontal and across it (a vertical leg: along X). */
export function lateral0(points) {
  const d = dirs(points)[0];
  if (!d) return [1, 0, 0];
  const l = Math.abs(d[2]) > 0.9 ? [1, 0, 0] : norm(cross(d, [0, 0, 1]));
  return l;
}
/** The side vector on every leg: carried round each corner by the same turn the path makes (so a pair stays a pair). */
function laterals(points, L0) {
  const d = dirs(points), out = [L0];
  for (let i = 1; i < d.length; i++) {
    const a = d[i - 1], b = d[i], n = cross(a, b), L = out[i - 1];
    // rotation about n taking a to b (90°): a→b, b→−a, n→n
    const la = dot(L, a), lb = dot(L, b), ln = dot(L, norm(n));
    const nn = norm(n);
    out.push(norm([0, 1, 2].map((k) => la * b[k] - lb * a[k] + ln * nn[k])));
  }
  return out;
}
export function offsetPath(points, L0, off) {
  const d = dirs(points), Ls = laterals(points, L0), out = [];
  out.push(points[0].map((v, k) => v + Ls[0][k] * off));
  // a corner of the offset line: both offset lines meet at p + off (L − (L·b) a), L the side vector before the corner, a and b the legs
  for (let i = 1; i < points.length - 1; i++) { const a = d[i - 1], b = d[i], L = Ls[i - 1], lb = dot(L, b); out.push(points[i].map((v, k) => v + off * (L[k] - lb * a[k]))); }
  out.push(points[points.length - 1].map((v, k) => v + Ls[Ls.length - 1][k] * off));
  return out;
}
export function lateralAt(points, L0, s) {
  const Ls = laterals(points, L0);
  let acc = 0;
  for (let i = 1; i < points.length; i++) { acc += Math.hypot(...sub(points[i], points[i - 1])); if (acc > s + 1e-6) return Ls[i - 1]; }
  return Ls[Ls.length - 1];
}

export function planRefrigerant(opt) {
  const R = opt.rules || {}, gap = R.gap ?? 25, failed = [], notes = [];
  const units = (opt.indoors || []).filter((u) => u && u.p);
  if (!units.length) return { ok: false, runs: [], kits: [], checks: [], failed: [{ id: null, error: 'no-terminals' }], notes, lengths: null, heights: {} };
  const pair = (cap, u) => {
    const t = R.lineSet && cap > 0 ? R.lineSet(cap) : null;
    const liquid = t?.liquid || u?.liquid || opt.outdoor.liquid, gas = t?.gas || u?.gas || opt.outdoor.gas;
    return { liquid, gas, w: liquid.od + gas.od + gap };
  };
  const secOf = (cap, u) => { const q = pair(cap, u); return { shape: 'round', w: q.w, h: Math.max(q.liquid.od, q.gas.od), key: q.gas.key + '/' + q.liquid.key, pair: q }; };
  const total = units.reduce((n, u) => n + (u.capacity || 1), 0);
  const net = routeNetwork({
    source: { p: opt.outdoor.p, out: opt.outdoor.out, section: secOf(total, null) }, pipe: true, clearance: opt.clearance ?? 25, obstacles: opt.obstacles || [],
    terminals: units.map((u) => ({ id: u.id, p: u.p, out: u.out, flow: u.capacity || 1, section: secOf(u.capacity || 1, u) })), sizeFor: (c) => secOf(c, null),
  });
  if (!net.ok) return { ok: false, runs: [], kits: [], checks: [], failed: net.failed, notes, lengths: null, heights: {} };
  for (const f of net.failed) failed.push(f);
  const main = net.paths[0], L0 = lateral0(main.points);
  const runs = [], kits = [];
  let s0 = 0;
  const emit = (role, pts, Lat, sec, cap, terminal) => {
    const q = sec.pair, sep = (q.liquid.od + q.gas.od) / 2 + gap;
    runs.push({ role, line: 'gas', points: offsetPath(pts, Lat, -sep / 2), size: q.gas.key, od: q.gas.od, capacity: cap, terminal });
    runs.push({ role, line: 'liquid', points: offsetPath(pts, Lat, sep / 2), size: q.liquid.key, od: q.liquid.od, capacity: cap, terminal });
  };
  for (const r of net.runs.filter((x) => x.role === 'main')) {
    const len = lengthOf(r.points);
    emit('trunk', r.points, lateralAt(main.points, L0, s0 + 1e-3), r.section, r.flow, r.terminal);
    s0 += len;
  }
  for (const t of net.tees) {
    const br = net.runs.find((x) => x.role === 'branch' && x.path === t.branch);
    if (!br) continue;
    const s = arcOf(main.points, t.at);
    emit('branch', br.points, lateral0(br.points), br.section, br.flow, br.terminal);
    kits.push({ at: t.at, branch: br.terminal, capacity: br.flow });
  }
  // the real ports: carry each line's end to its own port
  const portNote = new Set();
  const fixEnd = (r, atStart, target) => {
    if (!target) return;
    const i = atStart ? 0 : r.points.length - 1, q = r.points[i], d = sub(target, q), L = Math.hypot(...d);
    if (L < 1) return;
    // the way from the line's end to the port, one axis at a time (x, y, then z: a port pair stands one above the other as often as side by side)
    const via = []; let cur = q.slice();
    for (const k of [0, 1, 2]) if (Math.abs(d[k]) > 1e-6) { cur = cur.slice(); cur[k] = target[k]; via.push(cur); }
    // the host's run model refuses a leg shorter than its bends need (`rules.minLeg`, mm): a port too close to the pair's own offset is left centred (note 'port-offset')
    const legs = []; { let prev = q; for (const x of via) { legs.push(Math.hypot(...sub(x, prev))); prev = x; } }
    if (R.minLeg && legs.some((l) => l > 1e-6 && l < R.minLeg - 1e-9)) { portNote.add('port-offset'); return; }
    if (via.length > 1) portNote.add('port-stub');
    if (atStart) r.points.unshift(...via.reverse().map((x) => x.slice())); else r.points.push(...via.map((x) => x.slice()));
  };
  const portsFor = (rs, ports, atStart) => {
    const g = rs.find((x) => x.line === 'gas'), l = rs.find((x) => x.line === 'liquid');
    if (!g || !l || !ports || !ports.gas || !ports.liquid) return;
    const i = atStart ? 0 : g.points.length - 1, j = atStart ? 0 : l.points.length - 1;
    const straight = Math.hypot(...sub(g.points[i], ports.gas)) + Math.hypot(...sub(l.points[j], ports.liquid));
    const swapped = Math.hypot(...sub(g.points[i], ports.liquid)) + Math.hypot(...sub(l.points[j], ports.gas));
    const [pg, pl] = swapped < straight - 1e-6 ? [ports.liquid, ports.gas] : [ports.gas, ports.liquid];
    fixEnd(g, atStart, pg); fixEnd(l, atStart, pl);
    if (swapped < straight - 1e-6) portNote.add('port-lines-crossed');
  };
  portsFor(runs.filter((r) => r.role === 'trunk').slice(0, 2), opt.outdoor.ports, true);
  for (const u of units) portsFor(runs.filter((r) => r.terminal === u.id && (r.role === 'branch' || r.role === 'trunk')), u.ports, false);
  for (const n of portNote) notes.push(n);
  // lengths and heights against the person's limits
  const per = {}, heights = {}, checks = [];
  const mainLen = lengthOf(main.points);
  for (const u of units) {
    const br = net.runs.find((x) => x.role === 'branch' && x.terminal === u.id);
    per[u.id] = br ? arcOf(main.points, br.points[0]) + lengthOf(br.points) : mainLen;
    heights[u.id] = u.p[2] - opt.outdoor.p[2];
  }
  // equivalent lengths: the maker's value for a bend and for a branch kit, by the gas line's size (R.equivalent, typed by the person); none: the straight length counts
  const eq = R.equivalent ? (kind, key) => Number(R.equivalent(kind, 'gas', key)) || 0 : null;
  const eqPer = {}; let eqTotal = net.length;
  if (eq) {
    const mainRuns = net.runs.filter((x) => x.role === 'main');
    const piece = []; { let a0 = 0; for (const r of mainRuns) { const L = lengthOf(r.points); piece.push({ a: a0, L, r }); a0 += L; } }
    const bendsOf = (pts) => Math.max(0, pts.length - 2), keyOf = (r) => r.section.pair.gas.key;
    const mainEq = (s) => piece.reduce((n, x) => n + (s > x.a ? bendsOf(x.r.points) * eq('bend', keyOf(x.r)) : 0), 0);
    eqTotal = net.length;
    for (const x of piece) eqTotal += bendsOf(x.r.points) * eq('bend', keyOf(x.r));
    for (const u of units) {
      const br = net.runs.find((x) => x.role === 'branch' && x.terminal === u.id);
      if (br) { const s = arcOf(main.points, br.points[0]); eqPer[u.id] = per[u.id] + mainEq(s) + bendsOf(br.points) * eq('bend', keyOf(br)) + eq('kit', keyOf(br)); eqTotal += bendsOf(br.points) * eq('bend', keyOf(br)) + eq('kit', keyOf(br)); }
      else eqPer[u.id] = per[u.id] + mainEq(Infinity);
    }
    notes.push('equivalent-lengths');
  }
  const totalLen = eq ? eqTotal : net.length, longest = Math.max(...Object.values(eq ? eqPer : per)), Lim = opt.limits || {};
  const chk = (key, value, limit, id) => { if (Number.isFinite(limit)) { const row = { key, id, value, limit, ok: value <= limit + 1e-9 }; checks.push(row); if (!row.ok) failed.push({ id: id ?? 'limits', error: 'limit-' + key, over: Math.round((value - limit) * 10) / 10 }); } };
  chk('maxTotal', totalLen, Lim.maxTotal);
  chk('maxLongest', longest, Lim.maxLongest);
  for (const u of units) { chk('maxOutdoorAbove', -heights[u.id], Lim.maxOutdoorAbove, u.id); chk('maxOutdoorBelow', heights[u.id], Lim.maxOutdoorBelow, u.id); }
  const hs = Object.values(heights);
  chk('maxIndoorIndoor', Math.max(...hs) - Math.min(...hs), Lim.maxIndoorIndoor);
  if (!checks.length) notes.push('limits-not-set');
  notes.push('kit-marked');
  const clash = runs.some((r) => hitsObstacle(r.points, opt.obstacles || [], r.od / 2 + (opt.clearance ?? 25) - 1));
  return { ok: !failed.length, runs, kits, checks, lengths: { total: net.length, longest: Math.max(...Object.values(per)), perUnit: per }, equivalent: eq ? { total: eqTotal, longest, perUnit: eqPer } : null, heights, failed, notes, clash, net };
}
