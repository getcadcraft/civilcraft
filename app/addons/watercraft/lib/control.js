/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: DOM-free engine */
/**
 * control.js — control rules, flow-control and pressure-sustaining valves, boosters, an event-stepped extended run and pump energy
 * (0.11 WN.17 and WN.13). The host's steady solver is the only hydraulics (configure()); this file steps it through time.
 *
 * Rules (the words of the published EPANET control grammar, parsed here from that description, no program code):
 *   LINK <id> OPEN|CLOSED IF NODE <id> BELOW|ABOVE <value>     a tank level (project length) or a junction pressure (psi / kPa)
 *   LINK <id> OPEN|CLOSED AT TIME <hours>                      hours since the run began
 *   LINK <id> OPEN|CLOSED AT CLOCKTIME <hour of day>
 * A rule fires on the state at the start of a step and the link keeps the status until another rule changes it. A tank-level rule is also
 * met exactly: the step is cut to the moment the level crosses the value (constant flow over the step), as the usual simulators do.
 * Pressure rules are checked at step boundaries only.
 *
 * Valves (not in the host model; passed as opts.valves = [{ id, pipe, type: 'FCV' | 'PSV', setting }]; the pipe stays in the model as an ordinary pipe):
 *   FCV  holds the flow at `setting` (project flow units) when the open valve would pass more, open otherwise.
 *   PSV  holds the pressure at its upstream node at `setting` (psi / kPa): fully open while the upstream pressure is above it, throttled
 *        (flow found by bisection) when it would fall below, closed when even no flow does not bring it back.
 *   A throttled valve is a flow transfer from its upstream node to its downstream node, so it is exact when both ends are junctions, or the
 *   upstream end is a reservoir or tank. Valves are settled in the order given (two throttled valves in series are an approximation).
 *
 *   parseRules(text) → { rules, errors }              ruleText(rule)
 *   boosterCurve(q, h) → a one-point pump curve for the host (design flow and head)
 *   solveState(water, units, opts) → host result plus { valves: Map, transfers }       the steady state with valves and statuses applied
 *   simulate(water, units, { hours, step, reportStep, patternStep, pattern, rules, valves, energy: { eff, price, tariff }, levels,
 *       outages: [{ link, fromHours, toHours }], draws: [{ node, flow, fromHours, toHours }] }) →
 *       { times, rows: [{ t, nodes, pipes, tanks, status, valves, mult }], events, energy, problems }
 *   pumpEnergy(water, units, run) is built into simulate: energy[pumpId] = { kwh, avgKw, peakKw, hoursOn, usagePct, volume, kwhPerVolume, cost }
 */
import { hydraulics, num, pos, problem, si } from './util.js';

const KW_US = 0.7457 / 3960;   // kW per (gpm · ft) at SG 1, efficiency 1: 1 hp = 0.7457 kW, 1 hp = 3960 gpm·ft
const KW_SI = 9.80665e-3;      // kW per (L/s · m) at efficiency 1: rho·g = 9806.65 N/m³, 1 L/s = 1e-3 m³/s

/** A one-point host pump curve from a design flow and head (a booster is a pump with a rule). */
export const boosterCurve = (q, h) => { if (!(q > 0 && h > 0)) throw problem('bad_booster'); return [[q, h]]; };

// ---------------------------------------------------------------------------------------------------------------------------- rules
export function parseRules(text) {
  const rules = [], errors = [];
  String(text || '').split(/\r?\n/).forEach((raw, i) => {
    const line = raw.replace(/;.*$/, '').trim();
    if (!line) return;
    let m = /^LINK\s+(\S+)\s+(OPEN|CLOSED)\s+IF\s+NODE\s+(\S+)\s+(BELOW|ABOVE)\s+(-?[\d.]+(?:e-?\d+)?)$/i.exec(line);
    if (m) return rules.push({ kind: 'node', link: m[1], status: m[2].toLowerCase(), node: m[3], op: m[4].toLowerCase(), value: Number(m[5]) });
    m = /^LINK\s+(\S+)\s+(OPEN|CLOSED)\s+AT\s+(TIME|CLOCKTIME)\s+(-?[\d.]+)$/i.exec(line);
    if (m) return rules.push({ kind: m[3].toLowerCase(), link: m[1], status: m[2].toLowerCase(), at: Number(m[4]) });
    errors.push({ line: i + 1, text: raw.trim() });
  });
  return { rules, errors };
}
export const ruleText = (r) => (r.kind === 'node' ? `LINK ${r.link} ${r.status.toUpperCase()} IF NODE ${r.node} ${r.op.toUpperCase()} ${r.value}` : `LINK ${r.link} ${r.status.toUpperCase()} AT ${r.kind.toUpperCase()} ${r.at}`);

// ---------------------------------------------------------------------------------------------------------------------------- one steady state with valves
const patchPipes = (W, closed) => (closed.size ? { ...W, pipes: W.pipes.map((p) => (closed.has(p.id) ? { ...p, status: 'closed' } : p)) } : W);
const addExtra = (extra, id, f) => { extra[id] = (extra[id] || 0) + f; };

/**
 * opts: { mult, levels, pumpOn, closed: Set of link ids, valves, extra }. The result is the host's, with `valves` (Map id → { state, flow }) and
 * `transfers` (Map nodeId → flow into the node through throttled valves, project flow units; negative = out).
 */
export function solveState(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const valves = (opts.valves || []).filter((v) => W.pipes.some((p) => p.id === v.pipe));
  const base = { mult: opts.mult ?? 1, levels: opts.levels, pumpOn: opts.pumpOn };
  const closed0 = new Set(opts.closed || []);
  if (!valves.length) { const r = hyd.solve(patchPipes(W, closed0), units, { ...base, extra: opts.extra }); r.valves = new Map(); r.transfers = new Map(); return r; }
  const K = si(units), pr = (units === 'm' ? 1 : 0.433527 * 3.280839895), kpa = units === 'm' ? 9.80665 : 0.433527;   // psi/ft = 0.433527
  const nodeById = new Map(W.nodes.map((n) => [n.id, n]));
  const fixed = []; const state = new Map();                                       // fixed: valves already settled { v, f } (a transfer or closed)
  const run = (extraValves, openValve) => {                                       // extraValves: [{ v, f }] throttled; openValve left open
    const closed = new Set(closed0), extra = { ...(opts.extra || {}) };
    for (const { v, f } of extraValves) { closed.add(v.pipe); addExtra(extra, W.pipes.find((p) => p.id === v.pipe).a, f); addExtra(extra, W.pipes.find((p) => p.id === v.pipe).b, -f); }
    return hyd.solve(patchPipes(W, closed), units, { ...base, extra });
  };
  const upP = (r, v) => { const n = r.nodes.get(W.pipes.find((p) => p.id === v.pipe).a); return n?.pressure ?? (n?.head != null ? (n.head - (nodeById.get(n.id)?.z ?? 0)) * kpa : null); };
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < valves.length; i++) {
      const v = valves[i], others = fixed.filter((x) => x.v !== v);
      const r0 = run(others, v);
      const q0 = r0.pipes.get(v.pipe)?.q ?? 0;
      let entry = null;
      if (closed0.has(v.pipe)) { entry = { v, f: 0, st: 'closed' }; }
      else if (v.type === 'FCV') {
        const S = pos(v.setting, 0);
        entry = q0 > S + 1e-9 ? { v, f: S, st: 'active' } : null;
      } else if (v.type === 'PSV') {
        const S = num(v.setting, 0), p0 = upP(r0, v);
        if (q0 > 1e-9 && p0 != null && p0 < S - 1e-9) {
          const pAt = (f) => upP(run([...others, { v, f }], v), v);
          if (pAt(0) < S - 1e-9) entry = { v, f: 0, st: 'closed' };
          else {
            let lo = 0, hi = q0;                                                 // pressure rises as the flow falls: pAt(lo) >= S > pAt(hi)
            for (let k = 0; k < 40 && hi - lo > 1e-7 * Math.max(1, q0); k++) { const mid = (lo + hi) / 2; if (pAt(mid) >= S) lo = mid; else hi = mid; }
            entry = { v, f: lo, st: 'active' };
          }
        }
      }
      const at = fixed.findIndex((x) => x.v === v);
      if (entry) { if (at >= 0) fixed[at] = entry; else fixed.push(entry); } else if (at >= 0) fixed.splice(at, 1);
    }
  }
  const r = run(fixed, null), transfers = new Map(), vout = new Map();
  for (const v of valves) {
    const e = fixed.find((x) => x.v === v), p = W.pipes.find((x) => x.id === v.pipe);
    if (e) { vout.set(v.id, { state: e.st, flow: e.f, pipe: v.pipe }); if (e.f) { transfers.set(p.a, (transfers.get(p.a) || 0) - e.f); transfers.set(p.b, (transfers.get(p.b) || 0) + e.f); } if (r.pipes.get(v.pipe)) r.pipes.get(v.pipe).q = e.f; }
    else vout.set(v.id, { state: 'open', flow: r.pipes.get(v.pipe)?.q ?? 0, pipe: v.pipe });
  }
  r.valves = vout; r.transfers = transfers;
  return r;
}

// ---------------------------------------------------------------------------------------------------------------------------- the stepped run
export function simulate(water, units, opts = {}) {
  const hyd = hydraulics();
  const W = hyd.cleanWater ? hyd.cleanWater(water, units) : water;
  const K = si(units), S = W.settings;
  const T = Math.round((pos(opts.hours, S.duration)) * 3600);
  const step = Math.max(1, Math.round(pos(opts.step, S.step))), reportStep = Math.max(step, Math.round(pos(opts.reportStep, step)));
  const patStep = Math.max(1, Math.round(pos(opts.patternStep, S.step)));
  const pattern = Array.isArray(opts.pattern) ? opts.pattern : S.pattern;
  const rules = opts.rules || [], valves = opts.valves || [];
  const sec = (h) => Math.round(Number(h) * 3600);
  const outages = (opts.outages || []).map((o) => ({ link: o.link, from: sec(o.fromHours ?? 0), to: sec(o.toHours ?? 1e9) }));   // a link forced out of service for a while (power cut, a closed main)
  const draws = (opts.draws || []).map((d) => ({ node: d.node, flow: Number(d.flow), from: sec(d.fromHours ?? 0), to: sec(d.toHours ?? 1e9) }));   // a fire or a flushing draw for a while
  const edges = [...outages, ...draws].flatMap((o) => [o.from, o.to]).filter((x) => x > 0 && x < 1e8);
  const clock0 = num(opts.clockStart, 0);
  const eff = Object.assign({ eff: 75, price: 0, tariff: [] }, opts.energy || {});
  const nodeById = new Map(W.nodes.map((n) => [n.id, n]));
  const tanks = W.nodes.filter((n) => n.kind === 'tank');
  const levels = Object.fromEntries(tanks.map((n) => [n.id, opts.levels?.[n.id] ?? n.level]));
  const status = new Map(W.pipes.map((p) => [p.id, p.status === 'closed' ? 'closed' : 'open']));
  const events = [], problems = [], rows = [], times = [];
  const area = (n) => Math.PI * Math.pow(n.diameter * K.len, 2) / 4;                // m²
  const energy = {}; for (const p of W.pipes) if (p.kind === 'pump') energy[p.id] = { kwh: 0, hoursOn: 0, peakKw: 0, volume: 0, cost: 0, weighted: 0 };
  const multAt = (t) => (pattern.length ? pattern[Math.floor(t / patStep) % pattern.length] : 1);
  const kwOf = (r, p) => {
    const pp = r.pipes.get(p.id), a = r.nodes.get(p.a)?.head, b = r.nodes.get(p.b)?.head;
    if (!pp || pp.status === 'closed' || !(pp.q > 0) || a == null || b == null) return { kw: 0, q: 0 };
    const k = (units === 'm' ? KW_SI : KW_US);
    return { kw: Math.max(0, pp.q * (b - a) * k / (eff.eff / 100)), q: pp.q };
  };
  const state = (t) => {
    const pumpOn = {}, closed = new Set();
    for (const p of W.pipes) {
      const st = status.get(p.id);
      if (p.kind === 'pump') { const pat = p.pattern?.length ? p.pattern[Math.floor(t / patStep) % p.pattern.length] > 0 : true; pumpOn[p.id] = st === 'open' && pat; }
      else if (st === 'closed') closed.add(p.id);
    }
    const extra = {};
    for (const o of outages) if (t >= o.from && t < o.to) { const p = W.pipes.find((x) => x.id === o.link); if (!p) continue; if (p.kind === 'pump') pumpOn[p.id] = false; else closed.add(p.id); }
    for (const d of draws) if (t >= d.from && t < d.to) extra[d.node] = (extra[d.node] || 0) + d.flow;
    return solveState(W, units, { mult: multAt(t), levels, pumpOn, closed, valves, extra });
  };
  const level = (id) => levels[id];
  const fire = (r, t) => {   // rules against the state at t; returns whether a status changed
    let changed = false;
    for (const rule of rules) {
      if (!status.has(rule.link)) continue;
      let hit = false;
      if (rule.kind === 'node') {
        const n = nodeById.get(rule.node); if (!n) continue;
        const v = n.kind === 'tank' ? level(n.id) : r.nodes.get(n.id)?.pressure;
        if (v == null) continue;
        hit = rule.op === 'below' ? v < rule.value : v > rule.value;
      } else if (rule.kind === 'time') hit = Math.abs(t - rule.at * 3600) < 0.5 || (t > rule.at * 3600 && !rule._seen && (rule._seen = true));
      else { const d = ((t / 3600 + clock0) % 24 + 24) % 24, h = rule.at % 24; hit = Math.abs(d - h) < 1e-6 || (rule._last != null && rule._last < h && d >= h && d - rule._last < 12) ; rule._last = d; }
      if (hit && status.get(rule.link) !== rule.status) { status.set(rule.link, rule.status); events.push({ t, link: rule.link, status: rule.status, why: ruleText(rule) }); changed = true; }
    }
    return changed;
  };
  for (const r of rules) { delete r._seen; delete r._last; }
  const tariffAt = (t) => (eff.tariff.length ? eff.tariff[Math.floor(t / 3600) % eff.tariff.length] : 1);
  let t = 0, nextReport = 0;
  const nextEdge = (t0, every) => (Math.floor(t0 / every + 1e-9) + 1) * every;
  for (let guard = 0; t <= T && guard < 400000; guard++) {
    let r = state(t);
    for (let k = 0; k < 6 && fire(r, t); k++) r = state(t);
    if (t >= nextReport - 1e-6) { rows.push({ t, mult: multAt(t), nodes: r.nodes, pipes: r.pipes, tanks: Object.fromEntries(tanks.map((n) => [n.id, { level: level(n.id), inflow: (r.nodes.get(n.id)?.inflow ?? 0) + (r.transfers.get(n.id) || 0) }])), status: new Map(status), valves: r.valves, ok: r.ok, problems: r.problems }); times.push(t); nextReport += reportStep; }
    if (t >= T) break;
    // the length of this stretch: to the next step edge, report, pattern change or tariff hour; sooner when a tank meets a level rule or a limit
    let dt = Math.min(nextEdge(t, step) - t, nextEdge(t, patStep) - t, nextReport - t, T - t);
    if (eff.tariff.length) dt = Math.min(dt, nextEdge(t, 3600) - t);
    for (const e of edges) if (e > t) dt = Math.min(dt, e - t);
    const inflow = {};
    for (const n of tanks) {
      const q = ((r.nodes.get(n.id)?.inflow ?? 0) + (r.transfers.get(n.id) || 0)) * K.q;   // m³/s into the tank
      inflow[n.id] = q;
      const rate = q / area(n) / K.len;                                                      // level change, project length per s
      if (Math.abs(rate) < 1e-12) continue;
      const lim = rate > 0 ? n.maxLevel : n.minLevel;
      if ((rate > 0 && level(n.id) < lim) || (rate < 0 && level(n.id) > lim)) dt = Math.min(dt, Math.max(1, (lim - level(n.id)) / rate));
      for (const rule of rules) if (rule.kind === 'node' && rule.node === n.id && status.get(rule.link) !== rule.status) {
        const hits = rule.op === 'below' ? (rate < 0 && level(n.id) >= rule.value) : (rate > 0 && level(n.id) <= rule.value);
        if (hits) dt = Math.min(dt, Math.max(1, (rule.value - level(n.id)) / rate + 0.5));
      }
    }
    dt = Math.max(1, Math.round(dt));
    for (const p of W.pipes) if (p.kind === 'pump') {   // energy over this stretch
      const { kw, q } = kwOf(r, p), e = energy[p.id], h = dt / 3600;
      if (kw > 0) { e.kwh += kw * h; e.hoursOn += h; e.peakKw = Math.max(e.peakKw, kw); e.volume += q * K.q * dt; e.cost += kw * h * eff.price * tariffAt(t); }
    }
    for (const n of tanks) {
      const rate = inflow[n.id] / area(n) / K.len;
      let lv = level(n.id) + rate * dt;
      if (lv > n.maxLevel + 1e-9) { problems.push({ code: 'tankfull', id: n.id, t: t + dt }); lv = n.maxLevel; }
      else if (lv < n.minLevel - 1e-9) { problems.push({ code: 'tankempty', id: n.id, t: t + dt }); lv = n.minLevel; }
      for (const rule of rules) if (rule.kind === 'node' && rule.node === n.id && Math.abs(lv - rule.value) < Math.abs(rate) * 1.5 + 1e-6 && ((rule.op === 'below' && rate < 0) || (rule.op === 'above' && rate > 0))) lv = rule.value + (rule.op === 'below' ? -1 : 1) * 1e-9;
      levels[n.id] = lv;
    }
    t += dt;
  }
  const hours = T / 3600, out = {};
  for (const [id, e] of Object.entries(energy)) {
    const vol = e.volume;   // m³
    out[id] = { kwh: e.kwh, avgKw: e.hoursOn > 0 ? e.kwh / e.hoursOn : 0, peakKw: e.peakKw, hoursOn: e.hoursOn, usagePct: hours > 0 ? 100 * e.hoursOn / hours : 0, volume: vol,
      kwhPerMgal: vol > 0 ? e.kwh / (vol / 3785.411784) : 0, kwhPerM3: vol > 0 ? e.kwh / vol : 0, cost: e.cost };
  }
  return { times, rows, events, energy: out, problems, levels: { ...levels }, hours, step, reportStep };
}
