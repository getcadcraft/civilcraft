/* SPDX-License-Identifier: Apache-2.0 */
/**
 * engine.js — the discrete-event engine of cc-des (0.8 XE.5): an event calendar, entities, and the node kinds every flow model is made of.
 * Method: event scheduling with a binary-heap calendar (Law, "Simulation Modeling and Analysis"), blocking after service, preempt-resume service interruption.
 * Time has no fixed unit: use one unit everywhere (seconds, minutes, hours) in a model.
 *
 * A model is plain data: {nodes: [ … ]}, each node {type, name, …}:
 *   source    {arrival: dist, to, start?, stop?, max?, onFull?: 'lose' | 'block', kind?, priority?, attrs?}     entities arrive one at a time (batch?: n)
 *   burst     {count, at: dist, to, kind?, attrs?}                                                            `count` entities, each at a time drawn from `at`
 *   server    {units?: c, service: dist, to, queue?: capacity, discipline?: 'fifo'|'lifo'|'priority', breakdown?: {mtbf, mttr},
 *              shifts?: {period, windows: [[from, to], …]}, needs?: [{resource, n?}]}                         c identical machines or people, one queue
 *   delay     {time: dist, to}                                  infinite servers: walking, curing, transit
 *   conveyor  {length, speed, pitch, to}                        accumulating belt; the slot count is floor(length / pitch)
 *   agv       {graph, vehicles, speed, pick, drop, load?, unload?, to, queue?}  vehicles carry entities from station `pick` to `drop` on the graph
 *   resource  {capacity | schedule: {period, steps: [[from, to, capacity], …]}}   shared people or tools that servers seize while they work
 *   sink      {}
 * `to` is a node name, [{to, p}] (probabilities), {by: 'attr', key, map: {value: node}, default?} or {least: [{to, extra?}]} (the target with the smallest
 * load × mean service + extra). Distributions: see rng.js.
 */
import { Rng, sample, mean, distProblem } from './rng.js';
import { Graph } from './agv.js';

export function problem(code, severity, text, about = [], extra = {}) {
  return { id: 'des:' + code + ':' + about.map((a) => a.id).join(','), code, severity, text, about, source: { kind: 'engine', name: 'cc-des' }, ...extra };
}

class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(x) { const a = this.a; a.push(x); let i = a.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (less(a[i], a[p])) { [a[i], a[p]] = [a[p], a[i]]; i = p; } else break; } }
  pop() { const a = this.a, top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && less(a[l], a[m])) m = l; if (r < a.length && less(a[r], a[m])) m = r; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } } return top; }
  peek() { return this.a[0]; }
}
const less = (x, y) => x.t < y.t || (x.t === y.t && (x.pr < y.pr || (x.pr === y.pr && x.seq < y.seq)));

/** Time-weighted average of a value that changes at events. */
class TimeAvg {
  constructor(t = 0) { this.v = 0; this.last = t; this.area = 0; this.t0 = t; this.max = 0; }
  set(v, t) { this.area += this.v * (t - this.last); this.last = t; this.v = v; if (v > this.max) this.max = v; }
  reset(t) { this.area = 0; this.last = t; this.t0 = t; this.max = this.v; }
  avg(t) { const T = t - this.t0; return T > 0 ? (this.area + this.v * (t - this.last)) / T : this.v; }
}
/** Welford's running mean and variance, plus a bounded sample for percentiles. */
class Tally {
  constructor() { this.reset(); }
  reset() { this.n = 0; this.m = 0; this.s = 0; this.min = Infinity; this.max = -Infinity; this.keep = []; }
  add(x) { this.n++; const d = x - this.m; this.m += d / this.n; this.s += d * (x - this.m); if (x < this.min) this.min = x; if (x > this.max) this.max = x; if (this.keep.length < 50000) this.keep.push(x); }
  report() {
    const k = this.keep.slice().sort((a, b) => a - b), pct = (p) => (k.length ? k[Math.min(k.length - 1, Math.floor(p * k.length))] : 0);
    return { n: this.n, mean: this.n ? this.m : 0, sd: this.n > 1 ? Math.sqrt(this.s / (this.n - 1)) : 0, min: this.n ? this.min : 0, max: this.n ? this.max : 0, p50: pct(0.5), p95: pct(0.95) };
  }
}

class Node {
  constructor(sim, spec) { this.sim = sim; this.spec = spec; this.name = spec.name; this.waiters = new Set(); this.rng = new Rng(sim.seed, spec.name); }
  canAccept() { return true; }
  load() { return 0; }
  meanService() { return 0; }
  resetStats() {}
  /** Space may have opened: let the blocked callers try again. */
  freed() { if (!this.waiters.size) return; const w = [...this.waiters]; this.waiters.clear(); for (const f of w) f(); }
  /** Resolve this node's `to` for an entity. */
  pick(e) {
    const to = this.spec.to, S = this.sim;
    if (typeof to === 'string') return S.nodes.get(to);
    if (Array.isArray(to)) { let u = this.rng.next() * to.reduce((s, r) => s + r.p, 0); for (const r of to) { u -= r.p; if (u <= 0) return S.nodes.get(r.to); } return S.nodes.get(to[to.length - 1].to); }
    if (to && to.by === 'attr') { const v = e.attrs[to.key], name = (to.map && to.map[v]) ?? to.default; return S.nodes.get(name); }
    if (to && to.least) { let best = null, bc = Infinity; for (const r of to.least) { const n = S.nodes.get(r.to), c = n.load() * Math.max(n.meanService(), 1e-9) + (r.extra || 0); if (c < bc) { bc = c; best = n; } } return best; }
    return null;
  }
}

class Sink extends Node {
  constructor(sim, spec) { super(sim, spec); this.count = 0; this.cycle = new Tally(); this.byKind = new Map(); this.t0 = 0; this.first = null; this.last = null; }
  put(e) { this.count++; if (this.first === null) this.first = this.sim.t; this.last = this.sim.t; const c = this.sim.t - e.born; this.cycle.add(c); let k = this.byKind.get(e.kind); if (!k) this.byKind.set(e.kind, k = { count: 0, cycle: new Tally() }); k.count++; k.cycle.add(c); this.sim.inSystem--; }
  resetStats(t) { this.count = 0; this.cycle.reset(); this.byKind.clear(); this.t0 = t; this.first = null; this.last = null; }
  report(t) { const T = t - this.t0; return { type: 'sink', count: this.count, first: this.first, last: this.last, throughput: T > 0 ? this.count / T : 0, cycle: this.cycle.report(), kinds: Object.fromEntries([...this.byKind].map(([k, v]) => [k, { count: v.count, cycle: v.cycle.report() }])) }; }
}

class Source extends Node {
  constructor(sim, spec) { super(sim, spec); this.made = 0; this.lost = 0; this.held = null; this.cb = () => this.release(); }
  start() { const s = this.spec; this.sim.at((s.start || 0) + sample(s.arrival, this.rng), () => this.arrive()); }
  arrive() {
    const s = this.spec, S = this.sim;
    if (S.t > (s.stop ?? Infinity) || this.made >= (s.max ?? Infinity)) return;
    for (let i = 0; i < (s.batch || 1); i++) {
      const e = S.entity(s); this.made++;
      const t = this.pick(e);
      if (t.canAccept(e)) t.put(e);
      else if (s.onFull === 'block') { this.held = e; S.inSystem--; /* not yet in the system */ t.waiters.add(this.cb); this.target = t; return; }
      else { this.lost++; S.inSystem--; }
    }
    S.at(sample(s.arrival, this.rng), () => this.arrive());
  }
  release() {
    const e = this.held, t = this.target;
    if (t.canAccept(e)) { this.held = null; this.sim.inSystem++; e.born = this.sim.t; t.put(e); this.sim.at(sample(this.spec.arrival, this.rng), () => this.arrive()); } else t.waiters.add(this.cb);
  }
  resetStats() { this.lost = 0; this.made = 0; }
  report() { return { type: 'source', made: this.made, lost: this.lost, blocked: this.held ? 1 : 0 }; }
}

class Burst extends Node {
  start() { const s = this.spec; for (let i = 0; i < s.count; i++) this.sim.at(sample(s.at, this.rng), () => this.emit()); }
  emit() { const e = this.sim.entity(this.spec); e.born = 0; const t = this.pick(e); this.made = (this.made || 0) + 1; if (t.canAccept(e)) t.put(e); else { this.pending = this.pending || []; this.pending.push(e); this.sim.inSystem--; t.waiters.add(() => this.retry(t)); } }
  retry(t) { while (this.pending && this.pending.length && t.canAccept(this.pending[0])) { const e = this.pending.shift(); this.sim.inSystem++; t.put(e); } if (this.pending && this.pending.length) t.waiters.add(() => this.retry(t)); }
  report() { return { type: 'burst', made: this.made || 0, waiting: (this.pending || []).length }; }
}

/** A place people stand in (a room): passes entities straight on and counts who is inside until `depart()` (a server with `leaves: room` calls it when work on them starts). */
class Junction extends Node {
  constructor(sim, spec) { super(sim, spec); this.n = 0; this.avg = new TimeAvg(0); this.in = 0; }
  put(e) { this.n++; this.in++; this.avg.set(this.n, this.sim.t); const t = this.pick(e); if (!t.canAccept(e)) { this.stuck = (this.stuck || 0) + 1; } t.put(e); }
  depart() { this.n--; this.avg.set(this.n, this.sim.t); }
  load() { return this.n; }
  resetStats(t) { this.avg.reset(t); this.in = 0; }
  report(t) { return { type: 'junction', entered: this.in, inside: { average: this.avg.avg(t), max: this.avg.max, now: this.n } }; }
}

class Resource extends Node {
  constructor(sim, spec) { super(sim, spec); this.cap = spec.capacity ?? 0; this.inUse = 0; this.util = new TimeAvg(0); this.capAvg = new TimeAvg(0); this.capAvg.set(this.cap, 0); }
  start() {
    const sc = this.spec.schedule; if (!sc) return;
    const apply = (cap) => { this.cap = cap; this.capAvg.set(cap, this.sim.t); if (this.inUse < this.cap) this.freed(); };
    const at = (t) => { const base = Math.floor(t / sc.period) * sc.period; for (const [a, b, c] of sc.steps) { if (t >= base + a && t < base + b) return c; } return 0; };
    apply(at(0)); const times = [...new Set(sc.steps.flatMap(([a, b]) => [a, b]))].filter((x) => x < sc.period).sort((x, y) => x - y);
    const next = (t) => { const base = Math.floor(t / sc.period) * sc.period; for (const x of times) if (base + x > t + 1e-12) return base + x; return base + sc.period + times[0]; };
    const tick = () => { apply(at(this.sim.t + 1e-9)); this.sim.at(next(this.sim.t) - this.sim.t, tick); };
    this.sim.at(next(0), tick, -1);
  }
  take(n) { if (this.cap - this.inUse >= n) { this.inUse += n; this.util.set(this.inUse, this.sim.t); return true; } return false; }
  give(n) { this.inUse -= n; this.util.set(this.inUse, this.sim.t); this.freed(); }
  resetStats(t) { this.util.reset(t); this.capAvg.reset(t); }
  report(t) { return { type: 'resource', capacity: this.cap, averageCapacity: this.capAvg.avg(t), inUse: this.inUse, utilization: this.capAvg.avg(t) > 0 ? this.util.avg(t) / this.capAvg.avg(t) : 0, averageInUse: this.util.avg(t), peakInUse: this.util.max }; }
}

class Server extends Node {
  constructor(sim, spec) {
    super(sim, spec);
    this.c = spec.units || 1; this.qcap = spec.queue ?? Infinity; this.q = []; this.onShift = true;
    this.units = Array.from({ length: this.c }, (_, i) => ({ i, state: 'idle', failed: false, e: null, ev: null, endAt: 0, remaining: 0, target: null, cb: null }));
    for (const u of this.units) u.cb = () => { if (u.state === 'blocked') this.handOver(u); };
    this.lq = new TimeAvg(0); this.busy = new TimeAvg(0); this.blocked = new TimeAvg(0); this.down = new TimeAvg(0);
    this.wait = new Tally(); this.svc = new Tally(); this.done = 0; this.rejected = 0; this.failures = 0; this.fail = new Tally();
    this.rng2 = new Rng(sim.seed, spec.name + '#fail');
  }
  start() {
    const s = this.spec;
    if (s.breakdown) for (const u of this.units) this.sim.at(sample(s.breakdown.mtbf, this.rng2), () => this.breakDown(u));
    if (s.shifts) {
      const sh = s.shifts, inWin = (t) => { const x = t - Math.floor(t / sh.period) * sh.period; return sh.windows.some(([a, b]) => x >= a && x < b); };
      const edges = [...new Set(sh.windows.flatMap(([a, b]) => [a, b]))].filter((x) => x < sh.period).sort((a, b) => a - b);
      const next = (t) => { const base = Math.floor(t / sh.period) * sh.period; for (const x of edges) if (base + x > t + 1e-12) return base + x; return base + sh.period + edges[0]; };
      const set = (on) => { if (on === this.onShift) return; this.onShift = on; this.refresh(); };
      this.onShift = inWin(0); this.mark();
      const tick = () => { set(inWin(this.sim.t + 1e-9)); this.sim.at(next(this.sim.t) - this.sim.t, tick, -1); };
      this.sim.at(next(0), tick, -1); this.refresh();
    }
  }
  up(u) { return !u.failed && this.onShift; }
  breakDown(u) {
    u.failed = true; this.failures++; const s = this.spec.breakdown, rep = sample(s.mttr, this.rng2); this.fail.add(rep);
    this.refresh(); this.sim.at(rep, () => { u.failed = false; this.refresh(); this.sim.at(sample(s.mtbf, this.rng2), () => this.breakDown(u)); });
  }
  /** a unit went down or came up: pause or resume work */
  refresh() {
    for (const u of this.units) {
      if (!this.up(u) && u.state === 'busy') { u.remaining = u.endAt - this.sim.t; if (u.ev) u.ev.dead = true; u.state = 'paused'; }
      else if (this.up(u) && u.state === 'paused') { u.state = 'busy'; u.endAt = this.sim.t + u.remaining; u.ev = this.sim.at(u.remaining, () => this.complete(u)); }
    }
    this.mark(); this.dispatch();
  }
  mark() {
    const t = this.sim.t; let b = 0, bl = 0, d = 0;
    for (const u of this.units) { if (!this.up(u)) d++; else if (u.state === 'busy') b++; else if (u.state === 'blocked') bl++; }
    this.busy.set(b, t); this.blocked.set(bl, t); this.down.set(d, t); this.lq.set(this.q.length, t);
  }
  availableUnit() { return this.units.some((u) => u.state === 'idle' && this.up(u)); }
  canAccept() { return this.q.length < this.qcap || (this.q.length === 0 && this.availableUnit()); }
  load() { return this.q.length + this.units.filter((u) => u.e).length; }
  meanService() { return this.spec.service ? mean(this.spec.service) / this.c : 0; }
  put(e) { e.qAt = this.sim.t; this.q.push(e); this.dispatch(); this.mark(); }
  nextEntity() {
    const d = this.spec.discipline || 'fifo', q = this.q; if (!q.length) return null;
    if (d === 'lifo') return q.length - 1;
    if (d === 'priority') { let b = 0; for (let i = 1; i < q.length; i++) if (q[i].priority > q[b].priority) b = i; return b; }
    return 0;
  }
  seize() {
    const need = this.spec.needs || []; const got = [];
    for (const r of need) { const res = this.sim.nodes.get(r.resource), n = r.n || 1; if (res.take(n)) got.push([res, n]); else { for (const [g, k] of got) g.give(k); res.waiters.add(() => { this.dispatch(); this.mark(); }); return false; } }
    return true;
  }
  dispatch() {
    for (const u of this.units) {
      if (!this.q.length) break;
      if (u.state !== 'idle' || !this.up(u)) continue;
      if (!this.seize()) break;
      const i = this.nextEntity(), e = this.q.splice(i, 1)[0];
      this.wait.add(this.sim.t - e.qAt);
      const dur = e.attrs.service !== undefined ? e.attrs.service : sample(this.spec.service, this.rng);
      u.e = e; u.state = 'busy'; u.endAt = this.sim.t + dur; u.dur = dur; u.ev = this.sim.at(dur, () => this.complete(u));
      if (this.spec.leaves) this.sim.nodes.get(this.spec.leaves).depart();
    }
  }
  complete(u) {
    this.svc.add(u.dur); this.done++;
    for (const r of this.spec.needs || []) this.sim.nodes.get(r.resource).give(r.n || 1);
    this.handOver(u);
  }
  handOver(u) {
    const e = u.e, t = this.pick(e);
    if (t.canAccept(e)) { u.e = null; u.state = 'idle'; u.target = null; t.put(e); this.dispatch(); this.mark(); this.freed(); }
    else { u.state = 'blocked'; u.target = t; t.waiters.add(u.cb); this.mark(); }
  }
  resetStats(t) { this.lq.reset(t); this.busy.reset(t); this.blocked.reset(t); this.down.reset(t); this.wait.reset(); this.svc.reset(); this.done = 0; this.rejected = 0; this.failures = 0; this.fail.reset(); }
  report(t) {
    const c = this.c, down = this.down.avg(t) / c, busy = this.busy.avg(t) / c, bl = this.blocked.avg(t) / c;
    return { type: 'server', units: c, completed: this.done, utilization: busy, blocked: bl, down, idle: Math.max(0, 1 - busy - bl - down), queue: { average: this.lq.avg(t), max: this.lq.max, now: this.q.length }, wait: this.wait.report(), service: this.svc.report(), failures: this.failures, repair: this.fail.report() };
  }
}

class Delay extends Node {
  constructor(sim, spec) { super(sim, spec); this.n = new TimeAvg(0); this.items = 0; this.out = []; this.cb = () => this.flush(); this.tally = new Tally(); }
  put(e) { this.items++; this.n.set(this.items, this.sim.t); const d = sample(this.spec.time, this.rng); this.tally.add(d); this.sim.at(d, () => { this.out.push(e); this.flush(); }); }
  load() { return this.items; }
  flush() {
    while (this.out.length) { const e = this.out[0], t = this.pick(e); if (!t.canAccept(e)) { t.waiters.add(this.cb); return; } this.out.shift(); this.items--; this.n.set(this.items, this.sim.t); t.put(e); }
  }
  resetStats(t) { this.n.reset(t); this.tally.reset(); }
  report(t) { return { type: 'delay', inside: { average: this.n.avg(t), max: this.n.max, now: this.items }, time: this.tally.report() }; }
}

class Conveyor extends Node {
  constructor(sim, spec) {
    super(sim, spec);
    this.cap = Math.max(1, Math.floor(spec.length / spec.pitch + 1e-9)); this.h = spec.pitch / spec.speed; this.travel = spec.length / spec.speed;
    this.items = []; this.lastEntry = -Infinity; this.lastExit = -Infinity; this.timer = null; this.cb = () => this.advance(); this.wake = false; this.n = new TimeAvg(0); this.moved = 0;
  }
  canAccept() {
    if (this.items.length >= this.cap) return false;
    if (this.sim.t + 1e-12 < this.lastEntry + this.h) { if (!this.wake) { this.wake = true; this.sim.at(this.lastEntry + this.h - this.sim.t, () => { this.wake = false; this.freed(); }); } return false; }
    return true;
  }
  load() { return this.items.length; }
  put(e) { this.lastEntry = this.sim.t; this.items.push({ e, in: this.sim.t }); this.n.set(this.items.length, this.sim.t); this.advance(); }
  advance() {
    if (this.timer) { this.timer.dead = true; this.timer = null; }
    const head = this.items[0]; if (!head) return;
    const ready = Math.max(head.in + this.travel, this.lastExit + this.h);
    if (ready > this.sim.t + 1e-12) { this.timer = this.sim.at(ready - this.sim.t, () => { this.timer = null; this.advance(); }); return; }
    const t = this.pick(head.e);
    if (!t.canAccept(head.e)) { t.waiters.add(this.cb); return; }
    this.items.shift(); this.lastExit = this.sim.t; this.moved++; this.n.set(this.items.length, this.sim.t); t.put(head.e); this.freed(); this.advance();
  }
  resetStats(t) { this.n.reset(t); this.moved = 0; }
  report(t) { return { type: 'conveyor', slots: this.cap, onBelt: { average: this.n.avg(t), max: this.n.max, now: this.items.length }, moved: this.moved, maxRate: 1 / this.h }; }
}

class Agv extends Node {
  constructor(sim, spec) {
    super(sim, spec);
    this.g = new Graph(spec.graph); this.qcap = spec.queue ?? Infinity; this.q = []; this.v = [];
    for (let i = 0; i < spec.vehicles; i++) this.v.push({ i, at: spec.home || spec.pick, state: 'idle', e: null, busyT: 0, emptyD: 0, loadedD: 0, trips: 0, since: 0, cb: null });
    for (const v of this.v) v.cb = () => { if (v.state === 'blocked') this.deliver(v); };
    this.lq = new TimeAvg(0); this.nbusy = new TimeAvg(0); this.wait = new Tally(); this.trip = new Tally(); this.t0 = 0;
  }
  canAccept() { return this.q.length < this.qcap || this.v.some((v) => v.state === 'idle'); }
  load() { return this.q.length + this.v.filter((v) => v.e).length; }
  meanService() { const d = this.g.distance(this.spec.pick, this.spec.drop); return (2 * d / this.spec.speed + (this.spec.load || 0) + (this.spec.unload || 0)) / this.spec.vehicles; }
  put(e) { e.qAt = this.sim.t; this.q.push(e); this.dispatch(); this.mark(); }
  mark() { this.lq.set(this.q.length, this.sim.t); this.nbusy.set(this.v.filter((v) => v.state !== 'idle').length, this.sim.t); }
  dispatch() {
    while (this.q.length) {
      const pick = this.spec.pick; let best = null, bd = Infinity;
      for (const v of this.v) if (v.state === 'idle') { const d = this.g.distance(v.at, pick); if (d < bd) { bd = d; best = v; } }
      if (!best || !Number.isFinite(bd)) break;
      const e = this.q.shift(); this.wait.add(this.sim.t - e.qAt); this.job(best, e, bd);
    }
  }
  job(v, e, toPick) {
    const S = this.sim, sp = this.spec.speed, ld = this.spec.load || 0, ul = this.spec.unload || 0, run = this.g.distance(this.spec.pick, this.spec.drop);
    v.state = 'going'; v.e = null; v.started = S.t; v.emptyD += toPick;
    S.at(toPick / sp + ld, () => { v.e = e; v.state = 'carrying'; v.loadedD += run; S.at(run / sp + ul, () => { v.at = this.spec.drop; this.deliver(v); }); });
    this.mark();
  }
  deliver(v) {
    const e = v.e, t = this.pick(e);
    if (t.canAccept(e)) { v.e = null; v.state = 'idle'; v.trips++; this.trip.add(this.sim.t - v.started); t.put(e); this.dispatch(); this.mark(); this.freed(); }
    else { v.state = 'blocked'; t.waiters.add(v.cb); this.mark(); }
  }
  resetStats(t) { this.lq.reset(t); this.nbusy.reset(t); this.wait.reset(); this.trip.reset(); this.t0 = t; for (const v of this.v) { v.trips = 0; v.emptyD = 0; v.loadedD = 0; } }
  report(t) { return { type: 'agv', vehicles: this.v.length, trips: this.v.reduce((s, v) => s + v.trips, 0), utilization: this.nbusy.avg(t) / this.v.length, queue: { average: this.lq.avg(t), max: this.lq.max, now: this.q.length }, wait: this.wait.report(), trip: this.trip.report(), emptyDistance: this.v.reduce((s, v) => s + v.emptyD, 0), loadedDistance: this.v.reduce((s, v) => s + v.loadedD, 0) }; }
}

/** A gate a controller opens and closes (0.8 XE.13, soft PLC bound to a flow model): entities wait in front of it while it is shut, `queue` of them at most. `setOpen(true)` lets them through in order. */
class Gate extends Node {
  constructor(sim, spec) { super(sim, spec); this.isOpen = spec.open !== false; this.qcap = spec.queue ?? Infinity; this.q = []; this.passed = 0; this.openTime = new TimeAvg(0); this.openTime.set(this.isOpen ? 1 : 0, 0); this.lq = new TimeAvg(0); this.toggles = 0; }
  canAccept() { return this.q.length < this.qcap; }
  load() { return this.q.length; }
  put(e) { this.q.push(e); this.lq.set(this.q.length, this.sim.t); this.flush(); }
  flush() {
    while (this.isOpen && this.q.length) {
      const e = this.q[0], t = this.pick(e);
      if (!t.canAccept(e)) { t.waiters.add(this.cb || (this.cb = () => this.flush())); return; }
      this.q.shift(); this.passed++; this.lq.set(this.q.length, this.sim.t); t.put(e); this.freed();
    }
  }
  setOpen(v) { v = !!v; if (v === this.isOpen) return false; this.isOpen = v; this.toggles++; this.openTime.set(v ? 1 : 0, this.sim.t); if (v) this.flush(); return true; }
  resetStats(t) { this.passed = 0; this.toggles = 0; this.openTime.reset(t); this.lq.reset(t); }
  report(t) { return { type: 'gate', open: this.isOpen, passed: this.passed, toggles: this.toggles, openFraction: this.openTime.avg(t), queue: { average: this.lq.avg(t), max: this.lq.max, now: this.q.length } }; }
}

const KINDS = { gate: Gate, junction: Junction, source: Source, burst: Burst, server: Server, delay: Delay, conveyor: Conveyor, agv: Agv, resource: Resource, sink: Sink };

/** Check a model before running it. Returns Problems (errors stop the run). */
export function validate(model) {
  const P = [], nodes = model && model.nodes;
  if (!Array.isArray(nodes) || !nodes.length) return [problem('model.empty', 'error', 'The model has no nodes.')];
  const names = new Set();
  for (const n of nodes) { if (!n.name || typeof n.name !== 'string') { P.push(problem('node.name', 'error', 'A node has no name.')); continue; } if (names.has(n.name)) P.push(problem('node.dup', 'error', `Two nodes are called "${n.name}".`, [{ id: n.name }])); names.add(n.name); }
  const id = (n) => [{ id: n.name }];
  const target = (n, t, where = 'to') => { if (!names.has(t)) P.push(problem('target.unknown', 'error', `"${n.name}" sends to "${t}", which is not a node.`, id(n))); else if (nodes.find((x) => x.name === t).type === 'source' || nodes.find((x) => x.name === t).type === 'resource') P.push(problem('target.kind', 'error', `"${n.name}" sends to "${t}", which cannot take entities.`, id(n))); };
  const D = (n, d, what) => { const m = distProblem(d); if (m) P.push(problem('dist', 'error', `"${n.name}" ${what}: ${m}.`, id(n))); };
  for (const n of nodes) {
    if (!KINDS[n.type]) { P.push(problem('node.type', 'error', `"${n.name}" has an unknown type "${n.type}".`, id(n))); continue; }
    if (n.type !== 'sink' && n.type !== 'resource' && !(n.type === 'junction' && n.exit)) {
      const to = n.to;
      if (to === undefined || to === null) P.push(problem('target.missing', 'error', `"${n.name}" has no "to"; its entities would go nowhere.`, id(n)));
      else if (typeof to === 'string') target(n, to);
      else if (Array.isArray(to)) { if (!to.length || to.some((r) => !(r.p > 0))) P.push(problem('target.p', 'error', `"${n.name}" has a route list with a missing or non-positive probability.`, id(n))); to.forEach((r) => target(n, r.to)); }
      else if (to.by === 'attr') { Object.values(to.map || {}).forEach((t) => target(n, t)); if (to.default) target(n, to.default); }
      else if (to.least) to.least.forEach((r) => target(n, r.to)); else P.push(problem('target.form', 'error', `"${n.name}" has an unreadable "to".`, id(n)));
    }
    if (n.type === 'source') D(n, n.arrival, 'arrival');
    if (n.type === 'burst') { D(n, n.at, 'at'); if (!(n.count >= 1)) P.push(problem('burst.count', 'error', `"${n.name}" needs a count ≥ 1.`, id(n))); }
    if (n.type === 'server') {
      D(n, n.service, 'service'); if (n.units !== undefined && !(Number.isInteger(n.units) && n.units >= 1)) P.push(problem('server.units', 'error', `"${n.name}" needs a whole number of units ≥ 1.`, id(n)));
      if (n.breakdown) { D(n, n.breakdown.mtbf, 'mtbf'); D(n, n.breakdown.mttr, 'mttr'); }
      if (n.shifts) { const s = n.shifts; if (!(s.period > 0) || !Array.isArray(s.windows) || !s.windows.length || s.windows.some((w) => !(w[0] >= 0 && w[1] > w[0] && w[1] <= s.period))) P.push(problem('shifts', 'error', `"${n.name}" has an unreadable shift calendar (windows must lie inside one period).`, id(n))); }
      for (const r of n.needs || []) if (!names.has(r.resource) || nodes.find((x) => x.name === r.resource).type !== 'resource') P.push(problem('needs.unknown', 'error', `"${n.name}" needs "${r.resource}", which is not a resource.`, id(n)));
    }
    if (n.type === 'delay') D(n, n.time, 'time');
    if (n.type === 'conveyor' && !(n.length > 0 && n.speed > 0 && n.pitch > 0 && n.pitch <= n.length)) P.push(problem('conveyor', 'error', `"${n.name}" needs a length, speed and pitch > 0 with pitch ≤ length.`, id(n)));
    if (n.type === 'agv') {
      if (!(n.vehicles >= 1 && n.speed > 0)) P.push(problem('agv', 'error', `"${n.name}" needs vehicles ≥ 1 and a speed > 0.`, id(n)));
      else { const g = new Graph(n.graph || {}); g.problems.forEach((m) => P.push(problem('agv.graph', 'error', `"${n.name}": ${m}.`, id(n)))); for (const s of [n.pick, n.drop]) if (!g.nodes[s]) P.push(problem('agv.station', 'error', `"${n.name}" uses station "${s}", which is not on its graph.`, id(n))); if (g.nodes[n.pick] && g.nodes[n.drop] && !Number.isFinite(g.distance(n.pick, n.drop))) P.push(problem('agv.unreachable', 'error', `"${n.name}": there is no path from ${n.pick} to ${n.drop}.`, id(n))); }
    }
    if (n.type === 'resource' && !(n.capacity >= 0 || n.schedule)) P.push(problem('resource', 'error', `"${n.name}" needs a capacity or a schedule.`, id(n)));
  }
  if (!nodes.some((n) => n.type === 'sink')) P.push(problem('sink.none', 'warning', 'The model has no sink: finished entities are never counted.'));
  return P;
}

export class Sim {
  constructor(model, { seed = 1 } = {}) {
    this.seed = seed; this.t = 0; this.heap = new Heap(); this.seq = 0; this.nextId = 1; this.inSystem = 0; this.nodes = new Map(); this.events = 0;
    for (const spec of model.nodes) this.nodes.set(spec.name, new KINDS[spec.type](this, spec));
    this.wip = new TimeAvg(0);
  }
  at(delay, fn, pr = 0) { const ev = { t: this.t + delay, pr, seq: this.seq++, fn, dead: false }; this.heap.push(ev); return ev; }
  entity(spec) { this.inSystem++; return { id: this.nextId++, born: this.t, kind: spec.kind || 'item', priority: spec.priority || 0, attrs: { ...(spec.attrs || {}) } }; }
  resetStats() { for (const n of this.nodes.values()) n.resetStats(this.t); this.wip.reset(this.t); }
  /** Run on to time `until` and stop, ready to be asked again (0.8 XE.13: a controller reads sensors and moves gates between slices). The nodes start once. */
  advance(until) {
    if (!this.started) { this.started = true; for (const n of this.nodes.values()) if (n.start) n.start(); }
    while (this.heap.size) {
      const ev = this.heap.peek(); if (ev.t > until) break; this.heap.pop(); if (ev.dead) continue;
      this.t = ev.t; this.events++; this.wip.set(this.inSystem, this.t); ev.fn(); this.wip.set(this.inSystem, this.t);
    }
    if (until > this.t) this.t = until;
    return this.t;
  }
  /** Run to time `until`. `warmup` clears the statistics at that time. */
  run(until, warmup = 0) {
    for (const n of this.nodes.values()) if (n.start) n.start();
    if (warmup > 0) this.at(warmup, () => this.resetStats(), -2);
    while (this.heap.size) {
      const ev = this.heap.peek(); if (ev.t > until) break; this.heap.pop(); if (ev.dead) continue;
      this.t = ev.t; this.events++; this.wip.set(this.inSystem, this.t); ev.fn(); this.wip.set(this.inSystem, this.t);
    }
    if (Number.isFinite(until)) this.t = until;
    return this.report();
  }
  report() {
    const t = this.t, nodes = {}, problems = [];
    for (const [name, n] of this.nodes) if (n.report) nodes[name] = n.report(t);
    // blocked forever: entities held by units whose downstream never frees, with nothing left on the calendar
    const live = this.heap.a.some((e) => !e.dead);
    if (!live) for (const [name, n] of this.nodes) {
      const stuck = n.units ? n.units.filter((u) => u.state === 'blocked').length : n.v ? n.v.filter((v) => v.state === 'blocked').length : 0;
      if (stuck) problems.push(problem('deadlock', 'error', `The model stopped with ${stuck} entit${stuck === 1 ? 'y' : 'ies'} blocked at "${name}" and nothing left to happen: the downstream node never frees (check the loop or the capacity after it).`, [{ id: name }], { found: stuck }));
    }
    for (const [name, r] of Object.entries(nodes)) {
      if (r.type === 'server' && r.utilization + r.blocked >= 0.98 && r.queue.now > 0 && t > 0) problems.push(problem('saturated', 'warning', `"${name}" was busy ${(100 * (r.utilization + r.blocked)).toFixed(1)} % of the time and still had ${r.queue.now} waiting at the end: the arrivals exceed what it can serve, so the queue is still growing and the averages depend on the run length.`, [{ id: name }], { found: r.utilization }));
      if (r.type === 'source' && r.lost > 0) problems.push(problem('lost', 'note', `${r.lost} arrivals at "${name}" found the next node full and were lost.`, [{ id: name }], { found: r.lost }));
    }
    return { time: t, events: this.events, wip: { average: this.wip.avg(t), max: this.wip.max, now: this.inSystem }, nodes, problems };
  }
}

/** simulate(model, {until, warmup, seed}) → {ok, result, problems}. The model is validated first; errors stop the run. */
export function simulate(model, { until, warmup = 0, seed = 1 } = {}) {
  const problems = validate(model);
  if (problems.some((p) => p.severity === 'error')) return { ok: false, result: null, problems };
  if (!(until > 0)) return { ok: false, result: null, problems: [...problems, problem('until', 'error', 'The run needs an end time > 0.')] };
  if (warmup >= until) return { ok: false, result: null, problems: [...problems, problem('warmup', 'error', 'The warm-up must be shorter than the run.')] };
  const result = new Sim(model, { seed }).run(until, warmup);
  return { ok: true, result, problems: [...problems, ...result.problems] };
}

// two-sided 95 % Student t quantiles, df 1…30 (standard table)
const T975 = [12.706, 4.303, 3.182, 2.776, 2.571, 2.447, 2.365, 2.306, 2.262, 2.228, 2.201, 2.179, 2.160, 2.145, 2.131, 2.120, 2.110, 2.101, 2.093, 2.086, 2.080, 2.074, 2.069, 2.064, 2.060, 2.056, 2.052, 2.048, 2.045, 2.042];
export const tQuantile95 = (df) => (df < 1 ? NaN : df <= 30 ? T975[df - 1] : df <= 60 ? 2.0 : df <= 120 ? 1.98 : 1.96);
/**
 * replicate(model, {runs, until, warmup, seed}, metrics) — independent replications (seeds seed, seed+1, …). `metrics` is {name: result → number}.
 * → {runs, metrics: {name: {mean, sd, half (95 % half-width), low, high}}, results[]}
 */
export function replicate(model, { runs = 10, until, warmup = 0, seed = 1 }, metrics) {
  const vals = Object.fromEntries(Object.keys(metrics).map((k) => [k, []])), results = [], problems = [];
  for (let r = 0; r < runs; r++) {
    const s = simulate(model, { until, warmup, seed: seed + r }); if (!s.ok) return { runs: 0, metrics: {}, results: [], problems: s.problems };
    results.push(s.result); if (r === 0) problems.push(...s.problems);
    for (const [k, f] of Object.entries(metrics)) vals[k].push(f(s.result));
  }
  const out = {};
  for (const [k, v] of Object.entries(vals)) {
    const m = v.reduce((a, b) => a + b, 0) / v.length, sd = v.length > 1 ? Math.sqrt(v.reduce((a, b) => a + (b - m) ** 2, 0) / (v.length - 1)) : 0, half = v.length > 1 ? tQuantile95(v.length - 1) * sd / Math.sqrt(v.length) : 0;
    out[k] = { mean: m, sd, half, low: m - half, high: m + half };
  }
  return { runs, metrics: out, results, problems };
}
