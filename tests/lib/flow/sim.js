/* SPDX-License-Identifier: Apache-2.0 */
/**
 * sim.js — the discrete-event simulation core of the Material flow add-on (0.8 SU.858, session sx-flow). DOM-free, deterministic
 * (seeded random numbers, ties broken by a sequence number), kinematic (no physics: loads never tumble). Seconds and metres.
 *
 *   const r = simulate(graph, { seed, until, warmup, traceUntil })      → results (see results() below)
 *   checkGraph(graph)                                                    → problems [{code, id?, port?, key?}] (empty = fine)
 *
 * THE GRAPH (graph.js builds it from a layout; tests write it by hand):
 *   { elements: [{ id, type, …params }], links: [{ from, out, to, in }], agv: { edges: [{id, from, to, length}], fleet } | null }
 *   source   out            interarrival (dist), mode 'interval' | 'saturate' (a new load whenever the last one left),
 *                           types [{type, weight, length}], limit, start, firstAtStart
 *   sink     in
 *   conveyor in, out        length, speed, gap (between loads), accumulate (true: loads queue up at a blocked end, zero
 *                           pressure; false: the whole belt stops), pitch (fixed spacing: zone accumulation, one load a zone)
 *   buffer   in, out        capacity (FIFO, no time)
 *   station  in, out        servers, queue (capacity of its input queue; Infinity), time (dist). A finished load that cannot
 *                           leave keeps its server (blocked).
 *   gate     in, out        mode 'open' | 'closed' | 'cycle' (open s, closed s, offset s) | 'plc' (starts closed; a PLC opens and closes it: sim.input(id, bool), plc.js): a stop
 *   merge    in1..in3, out  rule 'priority' (in1 first) | 'fifo' (longest waiting first) | 'alternate'
 *   divert   in, out1..out3 rule 'round-robin' | 'first-free' | 'type' (map {type: n}, default n) | 'percent' (weights) |
 *                           'sensor' (sensors [id per output]: a lane whose photo-eye has a load standing on it is full)
 *   sensor   (no ports)     on (a conveyor id), at (m from its start): a photo-eye; counts loads, says when one stands on it
 *   agv-pick in             node (an AGV path node), to (an agv-drop id), capacity: loads wait here for a vehicle
 *   agv-drop out            node, capacity: vehicles put loads down here
 * A zero-length element (gate, merge, divert) passes a load on at once; the next element's own rule (a conveyor's spacing)
 * decides when. A merge decides after every other event at the same moment, so its rule holds for loads that come together.
 *
 * CONVEYORS. A load's position p is its tail, from 0 (just on) to length − L (its head at the end). On an accumulating belt
 * every speed is the same, so each load moves as p(t) = min(v·t + c, S): c says where it is held back by the load in front
 * (or by its own start), S where it stops when the end is blocked. Both change only when the head load leaves, so they are
 * worked out again then (O(loads on the belt)). A new load gets on when the last one's tail has moved its pitch (L + gap, or
 * the fixed pitch) — capacity floor((length − L) / pitch) + 1. A non-accumulating belt keeps one belt distance D(t): it stops
 * when its head load is blocked and starts again when it leaves.
 *
 * AGVs (one-way path segments; plan step 3): a pickup asks for a vehicle; the nearest idle one by path distance goes (ties: the
 * lower number). A vehicle holds the segment it is on until it enters the next (zone control): a segment is never shared. An
 * idle vehicle in the way is sent on along its first segment out. Vehicles waiting for each other in a circle = a deadlock:
 * the run stops and says where.
 */

import { makeRng, sample } from './rng.js';
import { compile as compileCalendar } from './calendar.js';

const EPS = 1e-7;
export const VERSION = 1;

// ------------------------------------------------------------------------------------------------- event queue
class Heap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  less(x, y) { return x.t < y.t || (x.t === y.t && (x.p < y.p || (x.p === y.p && x.s < y.s))); }
  push(e) {
    const a = this.a; a.push(e);
    let i = a.length - 1;
    while (i > 0) { const j = (i - 1) >> 1; if (!this.less(a[i], a[j])) break; [a[i], a[j]] = [a[j], a[i]]; i = j; }
  }
  peek() { return this.a[0]; }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < a.length && this.less(a[l], a[m])) m = l;
        if (r < a.length && this.less(a[r], a[m])) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m], a[i]]; i = m;
      }
    }
    return top;
  }
}

/** A time-weighted value (queue length, busy servers): mean and max over the measured period. */
class TW {
  constructor(sim) { this.sim = sim; this.v = 0; this.t = sim.now; this.t0 = sim.now; this.area = 0; this.max = 0; sim.tws.push(this); }
  set(v) { const n = this.sim.now; this.area += this.v * (n - this.t); this.t = n; this.v = v; if (v > this.max) this.max = v; }
  add(d) { this.set(this.v + d); }
  reset() { this.set(this.v); this.area = 0; this.t0 = this.sim.now; this.max = this.v; }
  mean() { const n = this.sim.now, span = n - this.t0; return span > 0 ? (this.area + this.v * (n - this.t)) / span : this.v; }
}

const r6 = (x) => (Number.isFinite(x) ? Math.round(x * 1e6) / 1e6 : x);

// ------------------------------------------------------------------------------------------------- elements
class El {
  constructor(sim, spec) { this.sim = sim; this.spec = spec; this.id = spec.id; this.type = spec.type; this.outs = {}; this.ins = {}; this.waiters = []; this.passed = 0; }
  init() {}
  reset() { this.passed = 0; }
  down(port = 'out') { return this.outs[port] || null; }
  addWaiter(u, port) { if (!this.waiters.some((w) => w.u === u)) this.waiters.push({ u, port }); }
  notify() {
    if (!this.waiters.length) return;
    const ws = this.waiters; this.waiters = [];
    for (const w of ws) this.sim.at(this.sim.now, 0, () => w.u.retry());
  }
  /** Hand `load` on through `port`: true when it moved; else this element waits to be woken. */
  push(load, port = 'out') {
    const d = this.down(port);
    if (!d) return false;
    if (d.el.canAccept(load, d.port, this)) {
      this.release(load);
      this.sim.leave(load);
      this.passed++;
      d.el.accept(load, d.port);
      return true;
    }
    d.el.addWaiter(this, d.port);
    return false;
  }
  canAccept() { return false; }
  accept() {}
  release() {}
  retry() {}
  stats() { return { type: this.type, passed: this.passed }; }
}

class Source extends El {
  init() {
    const s = this.spec, sim = this.sim;
    this.r = sim.rng('src:' + this.id); this.rt = sim.rng('type:' + this.id);
    this.types = s.types && s.types.length ? s.types : [{ type: 'A', weight: 1, length: 0.4 }];
    this.wsum = this.types.reduce((a, x) => a + x.weight, 0);
    this.limit = s.limit ?? Infinity;
    this.backlog = []; this.bl = new TW(sim); this.made = 0;
    this.saturate = s.mode === 'saturate';
    this.cal = s.calendar ? sim.calendar(s.calendar) : null;
    const start = s.start ?? 0;
    // orders from a file (0.9 TW.15): one arrival per row (qty loads together) at the row's time, in the file's order for equal times; no random draw is used
    if (s.mode === 'orders') {
      this.orderRows = Array.isArray(s.orders) ? s.orders : [];
      this.ordersTotal = this.orderRows.reduce((a, o) => a + (o.qty || 1), 0);
      this.orderRows.forEach((o) => { for (let k = 0; k < (o.qty || 1); k++) sim.at(start + o.t, 0, () => this.arriveOrder(o)); });
      return;
    }
    const first = this.saturate || s.firstAtStart ? start : start + sample(s.interarrival, this.r);
    sim.at(first, 0, () => this.arrive());
  }
  reset() { super.reset(); this.made = 0; }
  pickType() {
    if (this.types.length === 1) return this.types[0];
    let u = this.rt.next() * this.wsum;
    for (const x of this.types) { if ((u -= x.weight) < 0) return x; }
    return this.types[this.types.length - 1];
  }
  arriveOrder(o) {
    const known = this.types.find((x) => x.type === o.type);
    const ty = o.type ? { type: o.type, length: o.length ?? (known ? known.length : 0.4) } : { type: this.types[0].type, length: o.length ?? this.types[0].length };
    const load = this.sim.newLoad(ty.type, ty.length);
    this.made++; this.madeAll = (this.madeAll || 0) + 1;
    this.backlog.push(load); this.bl.set(this.backlog.length);
    this.sim.enter(load, this);
    if (this.backlog.length === 1) this.retry();
  }
  arrive() {
    if ((this.madeAll || 0) >= this.limit) return;
    // off shift: nothing arrives; the next one comes when the calendar opens
    if (this.cal && !this.cal.isOn(this.sim.now)) { const t = this.cal.nextOn(this.sim.now); if (t < Infinity) this.sim.at(t, 0, () => this.arrive()); return; }
    const ty = this.pickType();
    const load = this.sim.newLoad(ty.type, ty.length);
    this.made++; this.madeAll = (this.madeAll || 0) + 1;
    this.backlog.push(load); this.bl.set(this.backlog.length);
    this.sim.enter(load, this);
    if (!this.saturate && this.madeAll < this.limit) this.sim.at(this.sim.now + sample(this.spec.interarrival, this.r), 0, () => this.arrive());
    if (this.backlog.length === 1) this.retry();
  }
  retry() { while (this.backlog.length && this.push(this.backlog[0])) { /* moved */ } }
  release() {
    this.backlog.shift(); this.bl.set(this.backlog.length);
    if (this.saturate && (this.madeAll || 0) < this.limit) this.sim.at(this.sim.now, 0, () => this.arrive());
  }
  stats() { return { type: this.type, created: this.made, passed: this.passed, backlogMean: r6(this.bl.mean()), backlogMax: this.bl.max, ...(this.orderRows ? { ordersTotal: this.ordersTotal } : {}) }; }
}

class Sink extends El {
  init() { this.n = 0; this.lead = 0; this.leadMax = 0; this.byType = {}; }
  reset() { super.reset(); this.init(); }
  canAccept() { return true; }
  accept(load) {
    const lt = this.sim.now - load.born;
    this.n++; this.lead += lt; if (lt > this.leadMax) this.leadMax = lt;
    this.byType[load.type] = (this.byType[load.type] || 0) + 1;
    this.sim.finish(load, lt);
  }
  stats() {
    const span = this.sim.now - this.sim.statsFrom;
    return { type: this.type, done: this.n, perHour: r6(span > 0 ? (this.n / span) * 3600 : 0), leadMean: r6(this.n ? this.lead / this.n : 0), leadMax: r6(this.leadMax), byType: { ...this.byType } };
  }
}

class Buffer extends El {
  init() { this.cap = this.spec.capacity ?? Infinity; this.list = []; this.q = new TW(this.sim); }
  canAccept() { return this.list.length < this.cap; }
  accept(load) {
    this.sim.enter(load, this);
    this.list.push(load); this.q.set(this.list.length);
    if (this.list.length === 1) this.retry();
  }
  retry() { while (this.list.length && this.push(this.list[0])) { /* moved */ } }
  release() { this.list.shift(); this.q.set(this.list.length); this.notify(); }
  stats() { return { type: this.type, passed: this.passed, mean: r6(this.q.mean()), max: this.q.max }; }
}

class Station extends El {
  init() {
    const s = this.spec, sim = this.sim;
    this.c = s.servers ?? 1; this.qcap = s.queue ?? Infinity; this.r = sim.rng('st:' + this.id);
    this.servers = Array.from({ length: this.c }, (_, i) => ({ i, load: null, st: 'idle', ver: 0, end: 0, rem: 0 }));
    this.queue = []; this.done = [];
    this.busy = new TW(sim); this.blk = new TW(sim); this.q = new TW(sim);
    this.wsum = 0; this.wn = 0; this.served = 0;
    // shifts: no new work starts while the calendar is off (a service in progress finishes)
    this.cal = s.calendar ? sim.calendar(s.calendar) : null;
    this.openTW = null;
    if (this.cal) { this.openTW = new TW(sim); this.openTW.set(this.cal.isOn(sim.now) ? 1 : 0); this.watch(); }
    // breakdowns: after mtbf seconds of clock time the station stops for a repair of mttr seconds on average (in-progress services pause)
    this.broken = false; this.failures = 0; this.downTW = null;
    this.mtbf = s.mtbf > 0 && s.mttr > 0 ? s.mtbf : 0;
    if (this.mtbf) { this.downTW = new TW(sim); this.rf = sim.rng('fail:' + this.id); this.scheduleFailure(); }
    // operators (0.8 part-model_PART_4, SU.858 rest): a service needs one person from the named pool for its whole duration (a breakdown keeps the person); none free = the load waits
    this.pool = s.pool ? sim.pools.get(s.pool) || null : null; this.opWait = new TW(sim);
    if (this.pool) this.pool.users.push(this);
  }
  hasOp() { return !this.pool || this.pool.free() > 0; }
  reset() { super.reset(); this.wsum = 0; this.wn = 0; this.served = 0; this.failures = 0; }
  isOpen() { return !this.broken && (!this.cal || this.cal.isOn(this.sim.now)); }
  watch() {
    const now = this.sim.now, on = this.cal.isOn(now), t = on ? this.cal.nextOff(now) : this.cal.nextOn(now);
    if (!(t < Infinity)) return;
    this.sim.at(t, 0, () => { this.openTW.set(this.cal.isOn(this.sim.now) ? 1 : 0); this.drain(); this.watch(); });
  }
  scheduleFailure() { const sim = this.sim; sim.at(sim.now + sample({ kind: 'exp', mean: this.mtbf }, this.rf), 0, () => this.breakDown()); }
  breakDown() {
    const sim = this.sim;
    this.broken = true; this.failures++; this.downTW.set(1);
    for (const x of this.servers) if (x.st === 'busy') { x.rem = Math.max(0, x.end - sim.now); x.ver++; x.paused = true; }
    sim.at(sim.now + sample({ kind: 'erlang', mean: this.spec.mttr, k: 2 }, this.rf), 0, () => this.repair());
  }
  repair() {
    const sim = this.sim;
    this.broken = false; this.downTW.set(0);
    for (const x of this.servers) if (x.paused) { x.paused = false; this.schedule(x, x.rem); }
    this.drain();
    this.scheduleFailure();
  }
  schedule(x, d) { const v = ++x.ver; x.end = this.sim.now + d; this.sim.at(x.end, 0, () => { if (x.ver === v) this.finishService(x); }); }
  /** Start waiting work on idle servers (the calendar opened, a repair ended, a place came free). */
  drain() {
    if (!this.isOpen()) return;
    let moved = false;
    for (const x of this.servers) {
      if (x.st !== 'idle' || !this.queue.length) continue;
      if (!this.hasOp()) break;
      const n = this.queue.shift(); this.q.set(this.queue.length); this.start(x, n); moved = true;
    }
    if (moved) this.notify();
  }
  canAccept() { return (this.isOpen() && this.hasOp() && this.servers.some((x) => x.st === 'idle')) || this.queue.length < this.qcap; }
  accept(load) {
    this.sim.enter(load, this);
    load.q0 = this.sim.now;
    const s = this.isOpen() && this.hasOp() ? this.servers.find((x) => x.st === 'idle') : null;
    if (s) this.start(s, load);
    else { this.queue.push(load); this.q.set(this.queue.length); }
  }
  start(s, load) {
    const now = this.sim.now;
    this.wsum += now - load.q0; this.wn++;
    if (load.rec) load.rec.ts = now;
    s.load = load; s.st = 'busy'; this.busy.add(1);
    if (this.pool) { this.pool.take(this); s.op = true; }
    this.schedule(s, sample(this.spec.time, this.r));
  }
  finishService(s) {
    this.busy.add(-1); s.st = 'blocked'; this.blk.add(1); this.served++;
    this.done.push(s);
    if (s.op) { s.op = false; this.pool.give(); }   // the person is free as soon as the service ends, even if the load cannot leave yet
    this.retry();
  }
  retry() { while (this.done.length && this.push(this.done[0].load)) { /* moved */ } }
  release() {
    const s = this.done.shift();
    s.load = null; s.st = 'idle'; this.blk.add(-1);
    // with a pool the next load waits one tick: the load that has just left may be going to the next station, which needs this operator before this one takes it again
    if (this.pool) this.sim.at(this.sim.now, 1, () => this.drain());
    else if (this.queue.length && this.isOpen()) { const n = this.queue.shift(); this.q.set(this.queue.length); this.start(s, n); }
    this.notify();
  }
  stats() {
    const out = {
      type: this.type, passed: this.passed, served: this.served, servers: this.c,
      utilisation: r6(this.busy.mean() / this.c), blocked: r6(this.blk.mean() / this.c), idle: r6(1 - (this.busy.mean() + this.blk.mean()) / this.c),
      queueMean: r6(this.q.mean()), queueMax: this.q.max, waitMean: r6(this.wn ? this.wsum / this.wn : 0),
    };
    if (this.downTW) { out.availability = r6(1 - this.downTW.mean()); out.failures = this.failures; }
    if (this.pool) out.pool = this.pool.id;
    if (this.openTW) out.calendarOpen = r6(this.openTW.mean());
    return out;
  }
}

/** A pool of operators shared by stations (graph.pools: [{ id, size }]). A station takes one for each service; when one comes free the first station that has work waiting is woken. */
class Pool {
  constructor(sim, spec) { this.sim = sim; this.id = spec.id; this.size = spec.size; this.inUse = 0; this.rr = 0; this.users = []; this.tw = new TW(sim); this.tw.set(0); this.waitPeak = 0; }
  free() { return this.size - this.inUse; }
  take(st) { this.inUse++; this.tw.set(this.inUse); const i = this.users.indexOf(st); if (i >= 0) this.rr = (i + 1) % this.users.length; }
  /** An operator comes free: the stations are woken in turn, starting after the one that took the last, so a busy first stage cannot starve the next one. */
  give() {
    this.inUse--; this.tw.set(this.inUse);
    const now = this.sim.now, n = this.users.length;
    for (let k = 0; k < n; k++) { const st = this.users[(this.rr + k) % n]; this.sim.at(now, 0, () => { st.drain(); }); }
  }
  stats() { return { id: this.id, size: this.size, utilisation: r6(this.size ? this.tw.mean() / this.size : 0), peak: this.tw.max }; }
}

class Gate extends El {
  init() {
    const s = this.spec;
    this.mode = s.mode || 'open';
    this.ot = new TW(this.sim);
    if (this.mode === 'cycle') {
      const per = s.open + s.closed, off = s.offset || 0;
      const ph = (((0 - off) % per) + per) % per;
      this.isOpen = ph < s.open;
      this.sim.at(this.isOpen ? s.open - ph : per - ph, 0, () => this.toggle());
    } else this.isOpen = this.mode !== 'closed' && this.mode !== 'plc';
    this.ot.set(this.isOpen ? 1 : 0);
    // breakdowns (0.8 part-model_PART_4, SU.858 rest): after mtbf seconds of clock time the gate sticks SHUT for a repair of mttr seconds on average
    this.broken = false; this.failures = 0; this.downTW = null;
    this.mtbf = s.mtbf > 0 && s.mttr > 0 ? s.mtbf : 0;
    if (this.mtbf) { this.downTW = new TW(this.sim); this.rf = this.sim.rng('fail:' + this.id); this.scheduleFailure(); }
  }
  reset() { super.reset(); this.failures = 0; }
  scheduleFailure() { const sim = this.sim; sim.at(sim.now + sample({ kind: 'exp', mean: this.mtbf }, this.rf), 0, () => this.breakDown()); }
  breakDown() {
    const sim = this.sim;
    this.broken = true; this.failures++; this.downTW.set(1);
    sim.at(sim.now + sample({ kind: 'erlang', mean: this.spec.mttr, k: 2 }, this.rf), 0, () => this.repair());
  }
  repair() { this.broken = false; this.downTW.set(0); this.notify(); this.scheduleFailure(); }
  /** A PLC's command (0.8 SU.858 step 5): only a gate in mode 'plc' takes it. → true when taken. */
  setOpen(v) {
    if (this.mode !== 'plc') return false;
    v = !!v;
    if (v !== this.isOpen) { this.isOpen = v; this.ot.set(v ? 1 : 0); if (v) this.notify(); }
    return true;
  }
  toggle() {
    const s = this.spec;
    this.isOpen = !this.isOpen; this.ot.set(this.isOpen ? 1 : 0);
    this.sim.at(this.sim.now + (this.isOpen ? s.open : s.closed), 0, () => this.toggle());
    if (this.isOpen) this.notify();
  }
  canAccept(load) {
    if (!this.isOpen || this.broken) return false;
    const d = this.down();
    if (d.el.canAccept(load, d.port, this)) return true;
    d.el.addWaiter(this, d.port);
    return false;
  }
  accept(load) { this.passed++; const d = this.down(); d.el.accept(load, d.port); }
  retry() { this.notify(); }
  stats() { const o = { type: this.type, passed: this.passed, openFraction: r6(this.ot.mean()) }; if (this.downTW) { o.availability = r6(1 - this.downTW.mean()); o.failures = this.failures; } return o; }
}

const portNo = (p) => Number(String(p).replace(/^\D+/, '')) || 1;

class Merge extends El {
  init() {
    this.ports = Object.keys(this.ins).sort((a, b) => portNo(a) - portNo(b));
    this.rule = this.spec.rule || 'priority';
    this.waiting = new Map(); this.pending = false; this.granted = null; this.last = -1;
    this.counts = Object.fromEntries(this.ports.map((p) => [p, 0]));
  }
  reset() { super.reset(); for (const k of Object.keys(this.counts)) this.counts[k] = 0; }
  addWaiter(u, port) {
    if (this.granted === port) { this.asked = true; return; }   // inside decide(): put back there
    if (!this.waiting.has(port)) this.waiting.set(port, { u, since: this.sim.now });
    this.schedule();
  }
  schedule() { if (!this.pending) { this.pending = true; this.sim.at(this.sim.now, 1, () => this.decide()); } }
  order() {
    const ps = [...this.waiting.keys()];
    if (this.rule === 'fifo') return ps.sort((a, b) => this.waiting.get(a).since - this.waiting.get(b).since || portNo(a) - portNo(b));
    if (this.rule === 'alternate') {
      const n = this.ports.length, at = (p) => (this.ports.indexOf(p) - this.last - 1 + 2 * n) % n;
      return ps.sort((a, b) => at(a) - at(b));
    }
    return ps.sort((a, b) => portNo(a) - portNo(b));
  }
  decide() {
    this.pending = false;
    if (!this.waiting.size) return;
    const p = this.order()[0];
    const w = this.waiting.get(p);
    this.waiting.delete(p);
    this.granted = p; this.moved = false; this.asked = false;
    w.u.retry();
    this.granted = null;
    // still something to send from p: keep it waiting (since now when one passed; else its first wait)
    if (this.asked) this.waiting.set(p, this.moved ? { u: w.u, since: this.sim.now } : w);
    if (this.moved || !this.asked) { if (this.waiting.size) this.schedule(); }
    // else: the way on is blocked; downstream wakes this merge (retry)
  }
  canAccept(load, port) {
    if (this.granted !== port) return false;
    const d = this.down();
    if (d.el.canAccept(load, d.port, this)) return true;
    d.el.addWaiter(this, d.port);
    return false;
  }
  accept(load, port) {
    this.moved = true; this.passed++; this.counts[port] = (this.counts[port] || 0) + 1;
    this.last = this.ports.indexOf(port);
    const d = this.down(); d.el.accept(load, d.port);
  }
  retry() { if (this.waiting.size) this.schedule(); }
  stats() { return { type: this.type, passed: this.passed, byInput: { ...this.counts } }; }
}

class Divert extends El {
  init() {
    const s = this.spec;
    this.n = Object.keys(this.outs).length;
    this.rule = s.rule || 'round-robin';
    this.rr = 0; this.r = this.sim.rng('div:' + this.id);
    this.counts = Array(this.n).fill(0);
    this.wsum = (s.weights || []).slice(0, this.n).reduce((a, x) => a + x, 0);
  }
  reset() { super.reset(); this.counts.fill(0); }
  candidates(load) {
    const s = this.spec, all = [...Array(this.n).keys()];
    switch (this.rule) {
      case 'first-free': return all;
      case 'type': {
        const k = s.map && s.map[load.type] !== undefined ? s.map[load.type] : (s.default ?? 1);
        return [Math.min(this.n, Math.max(1, k)) - 1];
      }
      case 'percent': {
        load.route = load.route || {};
        if (load.route[this.id] === undefined) {
          let u = this.r.next() * this.wsum, k = this.n - 1;
          for (let i = 0; i < this.n; i++) { if ((u -= s.weights[i] || 0) < 0) { k = i; break; } }
          load.route[this.id] = k;
        }
        return [load.route[this.id]];
      }
      case 'sensor': {
        const free = all.filter((i) => { const sn = this.sim.els.get((s.sensors || [])[i]); return !sn || !sn.standing(); });
        return free.length ? free : all;
      }
      default: return [this.rr];
    }
  }
  canAccept(load) {
    for (const i of this.candidates(load)) {
      const d = this.down('out' + (i + 1));
      if (!d) continue;
      if (d.el.canAccept(load, d.port, this)) { this.choice = i; return true; }
      d.el.addWaiter(this, d.port);
    }
    return false;
  }
  accept(load) {
    const i = this.choice;
    this.counts[i]++; this.passed++;
    if (this.rule === 'round-robin') this.rr = (i + 1) % this.n;
    const d = this.down('out' + (i + 1)); d.el.accept(load, d.port);
  }
  retry() { this.notify(); }
  stats() { return { type: this.type, passed: this.passed, byOutput: this.counts.slice() }; }
}

class Conveyor extends El {
  init() {
    const s = this.spec, sim = this.sim;
    this.len = s.length; this.v = s.speed; this.gap = s.gap ?? 0; this.acc = s.accumulate !== false; this.fixed = s.pitch || 0;
    this.loads = []; this.prev = null; this.wakeAt = Infinity; this.tok = 0;
    this.on = new TW(sim); this.hw = new TW(sim); this.sensors = this.sensors || [];
    if (!this.acc) { this.D0 = 0; this.t0 = 0; this.running = true; this.belt(); }
    // 0.8 round 3 (model_PART_3, SU.858 next step): a belt breaks down like a station — after mtbf seconds of clock time it stops for a
    // repair of mttr seconds on average; every load on it stays where it is, nothing gets on or off, then it runs on from where it stopped
    this.broken = false; this.failures = 0; this.downTW = null; this.headBlocked = false;
    this.mtbf = s.mtbf > 0 && s.mttr > 0 ? s.mtbf : 0;
    if (this.mtbf) { this.downTW = new TW(sim); this.rf = sim.rng('fail:' + this.id); this.scheduleFailure(); }
  }
  reset() { super.reset(); this.failures = 0; }
  scheduleFailure() { const sim = this.sim; sim.at(sim.now + sample({ kind: 'exp', mean: this.mtbf }, this.rf), 0, () => this.breakDown()); }
  breakDown() {
    const sim = this.sim, now = sim.now;
    this.broken = true; this.failures++; this.downTW.set(1); this.tDown = now; ++this.tok;   // the head's arrival waits for the repair
    if (this.acc) for (const e of this.loads) { e.frozen = Math.min(this.v * now + e.c, e.S); if (e.load.rec && e.load.rec.k) e.load.rec.k.push([now, e.c, e.frozen]); }
    else if (this.running) { this.D0 = this.D(); this.t0 = now; this.running = false; this.belt(); }
    sim.at(now + sample({ kind: 'erlang', mean: this.spec.mttr, k: 2 }, this.rf), 0, () => this.repair());
  }
  repair() {
    const sim = this.sim, now = sim.now, dur = now - this.tDown;
    this.broken = false; this.downTW.set(0);
    if (this.acc) {
      // the clock went on while the belt stood still: every load's timeline moves on by the time it stood
      for (const e of this.loads) { e.c -= this.v * dur; e.e += dur; delete e.frozen; if (e.load.rec && e.load.rec.k) e.load.rec.k.push([now, e.c, e.S]); }
      if (this.prev) this.prev.x += dur;
    } else if (!this.headBlocked) { this.running = true; this.t0 = now; this.belt(); }
    const h = this.loads[0];
    if (h && h.arrived) this.retry(); else this.scheduleArrival();
    this.notify();
    this.scheduleFailure();
  }
  pitch(load) { return this.fixed > 0 ? this.fixed : load.L + this.gap; }
  D() { return this.running ? this.D0 + this.v * (this.sim.now - this.t0) : this.D0; }
  belt() { const tr = this.sim.trace; if (tr && this.sim.now <= tr.until) (tr.belts[this.id] = tr.belts[this.id] || []).push([this.sim.now, this.D0, this.running ? 1 : 0]); }
  /** Tail position of entry e now. */
  pos(e) { return this.acc ? (e.frozen !== undefined ? e.frozen : Math.min(this.v * this.sim.now + e.c, e.S)) : this.D() - e.De; }
  entryTime(load) {
    if (this.broken) return Infinity;   // nothing gets on a belt that is down (its repair wakes the waiting ones)
    const need = this.pitch(load), now = this.sim.now, v = this.v;
    if (this.acc) {
      if (!this.loads.length) return this.prev ? this.prev.x + (need - (this.len - this.prev.L)) / v : -Infinity;
      const last = this.loads[this.loads.length - 1];
      if (last.S < need - EPS) return Infinity;
      return (need - last.c) / v;
    }
    if (!this.loads.length) return -Infinity;
    const gapD = this.D() - this.loads[this.loads.length - 1].De;
    if (gapD >= need - EPS) return -Infinity;
    return this.running ? now + (need - gapD) / v : Infinity;
  }
  canAccept(load) {
    const t = this.entryTime(load);
    if (t <= this.sim.now + EPS) return true;
    if (t < Infinity && t < this.wakeAt - EPS) {
      this.wakeAt = t;
      this.sim.at(t, 0, () => { if (this.wakeAt === t) this.wakeAt = Infinity; this.notify(); });
    }
    return false;
  }
  accept(load) {
    const sim = this.sim, now = sim.now, v = this.v;
    sim.enter(load, this);
    this.on.add(1);
    let e;
    if (this.acc) {
      const need = this.pitch(load);
      let c, S;
      if (!this.loads.length) {
        c = -v * now; if (this.prev) c = Math.min(c, this.len - this.prev.L - v * this.prev.x - need);
        S = this.len - load.L;
      } else {
        const last = this.loads[this.loads.length - 1];
        c = Math.min(-v * now, last.c - need); S = last.S - need;
      }
      e = { load, e: now, c, S, arrived: false };
      if (load.rec) load.rec.k = [[now, c, S]];
    } else {
      e = { load, De: this.D(), arrived: false };
      if (load.rec) load.rec.De = e.De;
    }
    this.loads.push(e);
    if (this.loads.length === 1) this.scheduleArrival();
  }
  scheduleArrival() {
    const h = this.loads[0];
    const tok = ++this.tok;
    if (!h || this.broken) return;
    let t;
    if (this.acc) t = (this.len - h.load.L - h.c) / this.v;
    else { if (!this.running) return; t = this.t0 + (h.De + this.len - h.load.L - this.D0) / this.v; }
    if (t < this.sim.now) t = this.sim.now;
    this.sim.at(t, 0, () => { if (tok !== this.tok) return; h.arrived = true; this.retry(); });
  }
  retry() {
    const h = this.loads[0];
    if (!h || !h.arrived || this.broken) return;
    if (this.push(h.load)) return;
    this.hw.set(1); this.headBlocked = true;
    if (!this.acc && this.running) { this.D0 = this.D(); this.t0 = this.sim.now; this.running = false; this.belt(); }
  }
  release(load) {
    const now = this.sim.now, v = this.v;
    this.loads.shift(); this.on.add(-1); this.hw.set(0); this.headBlocked = false;
    for (const sn of this.sensors) sn.count++;
    if (this.acc) {
      this.prev = { x: now, L: load.L };
      for (let i = 0; i < this.loads.length; i++) {
        const e = this.loads[i], need = this.pitch(e.load);
        let c, S;
        if (i === 0) { c = Math.min(-v * e.e, this.len - load.L - v * now - need); S = this.len - e.load.L; }
        else { const f = this.loads[i - 1]; c = Math.min(-v * e.e, f.c - need); S = f.S - need; }
        if (c !== e.c || S !== e.S) { e.c = c; e.S = S; if (e.load.rec && e.load.rec.k) e.load.rec.k.push([now, c, S]); }
      }
    } else if (!this.running) { this.running = true; this.t0 = now; this.belt(); }
    this.scheduleArrival();
    this.notify();
  }
  stats() {
    const out = { type: this.type, passed: this.passed, onMean: r6(this.on.mean()), onMax: this.on.max, blockedFraction: r6(this.hw.mean()) };
    if (this.downTW) { out.availability = r6(1 - this.downTW.mean()); out.failures = this.failures; }
    return out;
  }
}

class Sensor extends El {
  init() {
    this.count = 0;
    const c = this.sim.els.get(this.spec.on);
    this.conv = c instanceof Conveyor ? c : null;
    if (this.conv) { this.conv.sensors = this.conv.sensors || []; this.conv.sensors.push(this); }
  }
  reset() { this.count = 0; }
  covered() {
    const c = this.conv, at = this.spec.at;
    if (!c) return false;
    return c.loads.some((e) => { const p = c.pos(e); return p - EPS <= at && at <= p + e.load.L + EPS; });
  }
  /** A load stands on the eye (stopped there: the lane has backed up to it). */
  standing() {
    const c = this.conv, at = this.spec.at;
    if (!c) return false;
    return c.loads.some((e) => {
      const p = c.pos(e);
      const stopped = c.acc ? c.v * this.sim.now + e.c >= e.S - EPS : !c.running;
      return stopped && p - EPS <= at && at <= p + e.load.L + EPS;
    });
  }
  stats() { return { type: this.type, passed: this.count }; }
}

class AgvPick extends El {
  init() { this.cap = this.spec.capacity ?? 4; this.list = []; this.q = new TW(this.sim); }
  canAccept() { return this.list.length < this.cap; }
  accept(load) {
    this.sim.enter(load, this);
    this.list.push(load); this.q.set(this.list.length);
    this.sim.agv.request(this, load);
  }
  take(load) {
    const i = this.list.indexOf(load);
    if (i >= 0) this.list.splice(i, 1);
    this.q.set(this.list.length); this.passed++;
    this.sim.leave(load);
    this.notify();
  }
  stats() { return { type: this.type, passed: this.passed, mean: r6(this.q.mean()), max: this.q.max }; }
}

class AgvDrop extends El {
  init() { this.cap = this.spec.capacity ?? 4; this.list = []; this.reserved = 0; this.vwait = []; this.q = new TW(this.sim); }
  room() { return this.list.length + this.reserved < this.cap; }
  accept(load) {
    this.sim.enter(load, this);
    this.list.push(load); this.q.set(this.list.length);
    if (this.list.length === 1) this.retry();
  }
  retry() { while (this.list.length && this.push(this.list[0])) { /* moved */ } }
  release() {
    this.list.shift(); this.q.set(this.list.length);
    if (this.vwait.length) { const w = this.vwait.shift(); this.sim.at(this.sim.now, 0, () => this.sim.agv.atDrop(w)); }
  }
  stats() { return { type: this.type, passed: this.passed, mean: r6(this.q.mean()), max: this.q.max }; }
}

const CLASSES = { source: Source, sink: Sink, conveyor: Conveyor, buffer: Buffer, station: Station, gate: Gate, merge: Merge, divert: Divert, sensor: Sensor, 'agv-pick': AgvPick, 'agv-drop': AgvDrop };
export const SIM_TYPES = Object.keys(CLASSES);
const IN_PORTS = { source: [], sink: ['in'], conveyor: ['in'], buffer: ['in'], station: ['in'], gate: ['in'], merge: ['in1', 'in2', 'in3'], divert: ['in'], sensor: [], 'agv-pick': ['in'], 'agv-drop': [] };
const OUT_PORTS = { source: ['out'], sink: [], conveyor: ['out'], buffer: ['out'], station: ['out'], gate: ['out'], merge: ['out'], divert: ['out1', 'out2', 'out3'], sensor: [], 'agv-pick': [], 'agv-drop': ['out'] };
export { IN_PORTS, OUT_PORTS };

// ------------------------------------------------------------------------------------------------- AGVs
const ST = ['idle', 'empty', 'loaded', 'loading', 'unloading', 'waiting', 'reposition', 'down'];

class AgvSystem {
  constructor(sim, spec) {
    this.sim = sim;
    const f = spec.fleet || {};
    this.speed = f.speed || 1; this.tLoad = f.load ?? 5; this.tUnload = f.unload ?? 5;
    this.edges = spec.edges.map((e) => ({ ...e }));
    this.byId = new Map(this.edges.map((e) => [e.id, e]));
    this.nodes = [...new Set(this.edges.flatMap((e) => [e.from, e.to]))];
    this.out = new Map(this.nodes.map((n) => [n, this.edges.filter((e) => e.from === n)]));
    this.res = new Map(); this.ewait = new Map(); this.requests = []; this.pending = false; this.paths = new Map();
    // two-way lanes: the two directed edges of one lane share a reservation key. Node reservation (fleet.nodes) also lets only one
    // vehicle at a time hold a junction.
    this.useNodes = !!f.nodes;
    // vehicle breakdowns (0.8 part-model_PART_4, SU.858 rest): after mtbf seconds of clock time a vehicle breaks down WHERE IT NEXT STANDS (the end of the edge it is on,
    // or where it is idle), keeps the lane it holds, and goes on with what it was doing after a repair of mttr seconds on average. Parking: an idle vehicle with no
    // request waiting drives to a free parking node of fleet.park, so it does not block a lane.
    this.mtbf = f.mtbf > 0 && f.mttr > 0 ? f.mtbf : 0; this.mttr = f.mttr || 0;
    this.park = Array.isArray(f.park) ? f.park.slice() : [];
    // node reservation holds a junction (three or more lanes meet) for one vehicle at a time, from the moment it enters a lane
    // that ends there until it has entered the next one
    this.junction = new Set();
    if (this.useNodes) {
      const lanes = new Map();
      for (const e of this.edges) for (const n of [e.from, e.to]) { if (!lanes.has(n)) lanes.set(n, new Set()); lanes.get(n).add(e.lane ?? e.id); }
      for (const [n, l] of lanes) if (l.size >= 3) this.junction.add(n);
    }
    const n = Math.max(0, Math.min(f.vehicles ?? 1, this.edges.length));
    this.vehicles = [];
    for (let k = 0; k < n; k++) {
      let se = (f.start && this.byId.get(f.start[k])) || null;
      if (!se) {
        const base = Math.floor((k * this.edges.length) / n);
        for (let o = 0; o < this.edges.length && !se; o++) {
          const c = this.edges[(base + o) % this.edges.length];
          if (this.standing(c).every((x) => !this.res.has(x))) se = c;
        }
      }
      if (!se) break;
      const v = { i: this.vehicles.length, node: se.to, held: this.standing(se), st: 'idle', load: null, task: null, route: [], then: null, since: 0, t: Object.fromEntries(ST.map((s) => [s, 0])), delivered: 0, distLoaded: 0, distEmpty: 0 };
      for (const x of v.held) this.res.set(x, v);
      v.failures = 0; v.rf = sim.rng('vfail:' + v.i); v.failAt = this.mtbf ? sample({ kind: 'exp', mean: this.mtbf }, v.rf) : Infinity;
      this.vehicles.push(v);
      if (sim.trace) sim.trace.vehicles.push({ v: v.i, e: se.id, t0: -1, t1: -1 });
    }
    if (this.park.length) this.kick();   // vehicles start by driving to their parking places
  }
  /** What a vehicle standing at the end of edge e keeps: a one-way edge stays reserved until the next one is entered; a two-way lane is let go on arrival. */
  standing(e) { return e.lane === undefined ? this.keys(e) : this.keys(e).filter((k) => k[0] !== 'L'); }
  /** The reservation keys a vehicle needs to be on edge e: its lane, and (with node reservation) the junction it arrives at. */
  keys(e) { return this.junction.has(e.to) ? ['L' + (e.lane ?? e.id), 'N' + e.to] : ['L' + (e.lane ?? e.id)]; }
  reset() { const now = this.sim.now; for (const v of this.vehicles) { for (const s of ST) v.t[s] = 0; v.since = now; v.delivered = 0; v.distLoaded = 0; v.distEmpty = 0; } }
  setState(v, st) { const now = this.sim.now; v.t[v.st] += now - v.since; v.since = now; v.st = st; }
  /** Shortest paths from a node (Dijkstra, ties to the edge listed first) → {dist: Map, via: Map node → edge}. */
  from(n) {
    let p = this.paths.get(n);
    if (p) return p;
    const dist = new Map([[n, 0]]), via = new Map(), done = new Set();
    for (;;) {
      let best = null, bd = Infinity;
      for (const [k, d] of dist) if (!done.has(k) && d < bd) { bd = d; best = k; }
      if (best === null) break;
      done.add(best);
      for (const e of this.out.get(best) || []) {
        const nd = bd + e.length;
        if (nd < (dist.get(e.to) ?? Infinity) - EPS) { dist.set(e.to, nd); via.set(e.to, e); }
      }
    }
    p = { dist, via };
    this.paths.set(n, p);
    return p;
  }
  dist(a, b) { return this.from(a).dist.get(b) ?? Infinity; }
  route(a, b) {
    if (a === b) return [];
    const { via } = this.from(a), r = [];
    let n = b;
    while (n !== a) { const e = via.get(n); if (!e) return null; r.unshift(e); n = e.from; }
    return r;
  }
  request(pick, load) { this.requests.push({ pick, load }); this.kick(); }
  kick() { if (!this.pending) { this.pending = true; this.sim.at(this.sim.now, 1, () => this.dispatch()); } }
  dispatch() {
    this.pending = false;
    if (this.mtbf) for (const v of this.vehicles) if (v.st === 'idle' && this.sim.now >= v.failAt) this.maybeFail(v, () => {});
    for (let qi = 0; qi < this.requests.length;) {
      const rq = this.requests[qi];
      let best = null, bd = Infinity;
      for (const v of this.vehicles) {
        if (v.st !== 'idle') continue;
        const d = this.dist(v.node, rq.pick.spec.node);
        if (d < bd - EPS) { bd = d; best = v; }
      }
      if (!this.vehicles.some((v) => v.st === 'idle')) break;
      if (!best) { qi++; continue; }
      this.requests.splice(qi, 1);
      best.task = rq;
      this.setState(best, 'empty');
      this.travel(best, rq.pick.spec.node, () => this.startLoad(best));
    }
    this.parkIdle();
  }
  travel(v, target, then) {
    const r = this.route(v.node, target);
    if (!r) { this.sim.fail('agv-no-route', { from: v.node, to: target }); return; }
    v.route = r; v.then = then;
    if (!r.length) { v.then = null; then(); } else this.step(v);
  }
  step(v) {
    const e = v.route[0];
    const ks = this.keys(e);
    // going on along a lane this vehicle already holds (turning back on a two-way lane) while another waits for it: hand it over,
    // so a vehicle shuttling to and fro cannot keep the lane for ever
    for (const k of ks) {
      const q = this.ewait.get(k);
      if (this.res.get(k) === v && q && q.some((w) => w !== v && w.route[0] && this.keys(w.route[0]).includes(k))) { v.held = v.held.filter((x) => x !== k); this.freeKey(k); }
    }
    const blockers = ks.filter((k) => { const h = this.res.get(k); return h && h !== v; });
    if (blockers.length) {
      for (const k of blockers) {
        const q = this.ewait.get(k) || [];
        if (!q.includes(v)) q.push(v);
        this.ewait.set(k, q);
      }
      if (!v.waitingFor) { v.before = v.st; this.setState(v, 'waiting'); }
      v.waitingFor = blockers[0];
      const h = this.res.get(blockers[0]);
      if (h.st === 'idle') this.nudge(h);
      else this.deadlock(v);
      return;
    }
    this.enter(v, e);
  }
  enter(v, e) {
    const sim = this.sim, now = sim.now;
    const ks = this.keys(e);
    for (const k of ks) this.res.set(k, v);
    v.granted = false;
    const old = v.held;
    v.held = ks;
    if (v.waitingFor) {
      v.waitingFor = null; this.setState(v, v.before);
      for (const q of this.ewait.values()) { const at = q.indexOf(v); if (at >= 0) q.splice(at, 1); }
    }
    for (const k of old) if (!ks.includes(k)) this.freeKey(k);
    if (v.load) v.distLoaded += e.length; else v.distEmpty += e.length;
    const t1 = now + e.length / this.speed;
    if (sim.trace && now <= sim.trace.until) sim.trace.vehicles.push({ v: v.i, e: e.id, t0: now, t1 });
    sim.at(t1, 0, () => {
      v.node = e.to; v.route.shift();
      if (e.lane !== undefined) {   // two-way lane: reserved while driven on, free again on arrival (vehicles may pass at a node)
        const lk = 'L' + e.lane;
        if (this.res.get(lk) === v) { v.held = v.held.filter((x) => x !== lk); this.freeKey(lk); }
      }
      this.maybeFail(v, () => { if (v.route.length) this.step(v); else { const f = v.then; v.then = null; if (f) f(); } });
    });
  }
  /** If this vehicle's failure time has come, it stops here for a repair, then does `cont`. */
  maybeFail(v, cont) {
    const sim = this.sim;
    if (!this.mtbf || sim.now < v.failAt || v.st === 'down') { cont(); return; }
    v.failures++; v.upTo = v.st; this.setState(v, 'down');
    sim.at(sim.now + sample({ kind: 'erlang', mean: this.mttr, k: 2 }, v.rf), 0, () => {
      this.setState(v, v.upTo); v.failAt = sim.now + sample({ kind: 'exp', mean: this.mtbf }, v.rf);
      cont(); this.kick();
    });
  }
  /** Idle vehicles with nothing to do go to a free parking node. */
  parkIdle() {
    if (!this.park.length || this.requests.length) return;
    for (const v of this.vehicles) {
      if (v.st !== 'idle' || this.park.includes(v.node)) continue;
      const taken = new Set(this.vehicles.filter((w) => w !== v).map((w) => (w.st === 'reposition' && w.parkTo) || (w.st === 'idle' ? w.node : null)).filter(Boolean));
      const spot = this.park.filter((n) => !taken.has(n) && Number.isFinite(this.dist(v.node, n))).sort((a, b) => this.dist(v.node, a) - this.dist(v.node, b))[0];
      if (!spot) continue;
      v.parkTo = spot; this.setState(v, 'reposition');
      this.travel(v, spot, () => { v.parkTo = null; this.setState(v, 'idle'); this.kick(); });
    }
  }
  /** Let go of a key; the first waiter that can now take everything it needs is given it (and enters this instant). */
  freeKey(k) {
    this.res.delete(k);
    const q = this.ewait.get(k);
    if (!q || !q.length) return;
    for (let i = 0; i < q.length; i++) {
      const w = q[i], e = w.route[0];
      if (!e) continue;
      const ks = this.keys(e);
      if (ks.every((x) => { const h = this.res.get(x); return !h || h === w; })) {
        q.splice(i, 1);
        for (const x of ks) this.res.set(x, w);
        w.granted = true;   // it has the lane now and enters this instant: it is not waiting any more (deadlock checks)
        this.sim.at(this.sim.now, 0, () => this.enter(w, e));
        return;
      }
    }
  }
  nudge(h) {
    // an idle vehicle in the way moves on along an edge of another lane (its own lane's other direction would still block)
    const mine = new Set(h.held.filter((x) => x[0] === 'L'));
    const outs = (this.out.get(h.node) || []).filter((e) => !mine.has('L' + (e.lane ?? e.id)));
    if (!outs.length) { this.sim.fail('agv-blocked', { vehicles: [h.i + 1], edge: [...mine][0]?.slice(1) ?? '' }); return; }
    this.setState(h, 'reposition');
    h.route = [outs[0]];
    h.then = () => { this.setState(h, 'idle'); this.kick(); };
    this.step(h);
  }
  deadlock(v) {
    const seen = new Set([v]);
    let x = v;
    for (;;) {
      if (!x.waitingFor || x.granted) return;
      const h = this.res.get(x.waitingFor);
      if (!h || h.st === 'idle') return;
      if (h === v || seen.has(h)) { this.sim.fail('agv-deadlock', { vehicles: [...seen].map((y) => y.i + 1), edge: v.waitingFor.slice(1) }); return; }
      seen.add(h); x = h;
    }
  }
  startLoad(v) {
    this.setState(v, 'loading');
    this.sim.at(this.sim.now + this.tLoad, 0, () => {
      const { pick, load } = v.task;
      pick.take(load);
      v.load = load;
      this.sim.enter(load, { id: 'agv:' + (v.i + 1) });
      this.setState(v, 'loaded');
      const drop = this.sim.els.get(pick.spec.to);
      this.travel(v, drop.spec.node, () => this.atDrop(v));
    });
  }
  atDrop(v) {
    const drop = this.sim.els.get(v.task.pick.spec.to);
    if (!drop.room()) { this.setState(v, 'waiting'); drop.vwait.push(v); return; }
    drop.reserved++;
    this.setState(v, 'unloading');
    this.sim.at(this.sim.now + this.tUnload, 0, () => {
      drop.reserved--;
      const load = v.load;
      this.sim.leave(load);
      v.load = null; v.task = null; v.delivered++;
      this.setState(v, 'idle');
      drop.accept(load);
      this.kick();
    });
  }
  stats() {
    const now = this.sim.now, span = now - this.sim.statsFrom;
    return this.vehicles.map((v) => {
      const t = { ...v.t }; t[v.st] += now - v.since;
      const frac = Object.fromEntries(ST.map((s) => [s, r6(span > 0 ? t[s] / span : 0)]));
      return { vehicle: v.i + 1, delivered: v.delivered, distLoaded: r6(v.distLoaded), distEmpty: r6(v.distEmpty), time: frac, busy: r6(1 - frac.idle - frac.down), ...(this.mtbf ? { availability: r6(1 - frac.down), failures: v.failures } : {}) };
    });
  }
}

// ------------------------------------------------------------------------------------------------- checks
const pos = (x) => typeof x === 'number' && Number.isFinite(x) && x > 0;
const nonneg = (x) => typeof x === 'number' && Number.isFinite(x) && x >= 0;

export function checkGraph(g) {
  const out = [];
  if (!g || !Array.isArray(g.elements)) return [{ code: 'no-elements' }];
  const els = new Map();
  for (const e of g.elements) {
    if (!e || typeof e.id !== 'string' || !CLASSES[e.type]) { out.push({ code: 'unknown-type', id: e && e.id, type: e && e.type }); continue; }
    if (els.has(e.id)) { out.push({ code: 'duplicate-id', id: e.id }); continue; }
    els.set(e.id, e);
  }
  const linkedOut = new Set(), linkedIn = new Set();
  for (const l of g.links || []) {
    const a = els.get(l.from), b = els.get(l.to);
    if (!a || !b || !OUT_PORTS[a.type].includes(l.out) || !IN_PORTS[b.type].includes(l.in)) { out.push({ code: 'bad-link', id: l.from, port: l.out }); continue; }
    const ko = l.from + ':' + l.out, ki = l.to + ':' + l.in;
    if (linkedOut.has(ko) || linkedIn.has(ki)) { out.push({ code: 'double-link', id: linkedOut.has(ko) ? l.from : l.to }); continue; }
    linkedOut.add(ko); linkedIn.add(ki);
  }
  const lenOf = new Map();
  for (const e of els.values()) {
    const bad = (key) => out.push({ code: 'bad-param', id: e.id, key });
    const outs = OUT_PORTS[e.type];
    if (e.type === 'divert' || e.type === 'merge') {
      const ports = e.type === 'divert' ? outs : IN_PORTS.merge;
      const n = ports.filter((p) => linkedOut.has(e.id + ':' + p) || linkedIn.has(e.id + ':' + p)).length;
      if (n < 1) out.push({ code: e.type === 'divert' ? 'out-unlinked' : 'in-unlinked', id: e.id, port: ports[0] });
      if (e.type === 'divert') { for (let i = 0; i < n; i++) if (!linkedOut.has(e.id + ':out' + (i + 1))) out.push({ code: 'out-unlinked', id: e.id, port: 'out' + (i + 1) }); }
      if (e.type === 'merge' && !linkedOut.has(e.id + ':out')) out.push({ code: 'out-unlinked', id: e.id, port: 'out' });
    } else {
      for (const p of outs) if (!linkedOut.has(e.id + ':' + p)) out.push({ code: 'out-unlinked', id: e.id, port: p });
    }
    if (e.calendar !== undefined) {
      const spec = (g.calendars || []).find((c) => c.id === e.calendar);
      if (!spec) out.push({ code: 'calendar-unknown', id: e.id, key: e.calendar });
      else if (compileCalendar(spec).never) out.push({ code: 'calendar-never', id: e.id, key: e.calendar });
    }
    switch (e.type) {
      case 'source':
        if (e.mode !== 'saturate' && e.mode !== 'orders' && (!e.interarrival || !(meanPositive(e.interarrival)))) bad('interarrival');
        for (const ty of e.types || []) { if (!pos(ty.length) || !nonneg(ty.weight)) bad('types'); lenOf.set(e.id, Math.max(lenOf.get(e.id) || 0, ty.length)); }
        for (const o of e.mode === 'orders' && Array.isArray(e.orders) ? e.orders : []) if (o.length !== undefined) lenOf.set(e.id, Math.max(lenOf.get(e.id) || 0, o.length));
        break;
      case 'conveyor':
        if (!pos(e.length)) bad('length');
        if (!pos(e.speed)) bad('speed');
        if (e.gap !== undefined && !nonneg(e.gap)) bad('gap');
        if (e.pitch !== undefined && !nonneg(e.pitch)) bad('pitch');
        if (e.mtbf !== undefined && !(pos(e.mtbf) && pos(e.mttr))) bad('mttr');
        break;
      case 'station':
        if (!(Number.isInteger(e.servers ?? 1) && (e.servers ?? 1) >= 1)) bad('servers');
        if (!e.time) bad('time');
        if (e.mtbf !== undefined && !(pos(e.mtbf) && pos(e.mttr))) bad('mttr');
        if (e.pool !== undefined && !(g.pools || []).some((p) => p.id === e.pool)) out.push({ code: 'pool-unknown', id: e.id, key: e.pool });
        break;
      case 'gate':
        if (e.mode === 'cycle' && !(pos(e.open) && pos(e.closed))) bad('open');
        if (e.mtbf !== undefined && !(pos(e.mtbf) && pos(e.mttr))) bad('mttr');
        break;
      case 'sensor': {
        const c = els.get(e.on);
        if (!c || c.type !== 'conveyor') out.push({ code: 'sensor-no-conveyor', id: e.id });
        else if (!(nonneg(e.at) && e.at <= c.length)) bad('at');
        break;
      }
      case 'agv-pick': {
        const d = els.get(e.to);
        if (!d || d.type !== 'agv-drop') out.push({ code: 'agv-no-drop', id: e.id });
        if (e.node === undefined || e.node === null) out.push({ code: 'agv-no-node', id: e.id });
        break;
      }
      case 'agv-drop':
        if (e.node === undefined || e.node === null) out.push({ code: 'agv-no-node', id: e.id });
        break;
    }
  }
  for (const p of g.pools || []) if (!p || typeof p.id !== 'string' || !Number.isInteger(p.size) || p.size < 1) out.push({ code: 'bad-param', id: String(p && p.id), key: 'size' });
  const usesAgv = [...els.values()].some((e) => e.type === 'agv-pick' || e.type === 'agv-drop');
  if (usesAgv) {
    const a = g.agv;
    if (!a || !Array.isArray(a.edges) || !a.edges.length) out.push({ code: 'agv-no-path' });
    else {
      for (const ed of a.edges) if (!pos(ed.length)) out.push({ code: 'bad-param', id: String(ed.id), key: 'length' });
      if (a.edges.some((ed) => ed.lane !== undefined && typeof ed.lane !== 'string')) out.push({ code: 'bad-param', id: 'agv', key: 'lane' });
      const nodes = new Set(a.edges.flatMap((ed) => [ed.from, ed.to]));
      for (const e of els.values()) if ((e.type === 'agv-pick' || e.type === 'agv-drop') && e.node !== undefined && e.node !== null && !nodes.has(e.node)) out.push({ code: 'agv-no-node', id: e.id });
      if (!((a.fleet?.vehicles ?? 1) >= 1)) out.push({ code: 'agv-no-vehicles' });
    }
  }
  // a load longer than a conveyor never fits on it (the longest load any source makes)
  const longest = Math.max(0, ...lenOf.values(), ...[...els.values()].filter((e) => e.type === 'source' && !(e.types && e.types.length)).map(() => 0.4));
  for (const e of els.values()) if (e.type === 'conveyor' && pos(e.length) && e.length < longest - EPS) out.push({ code: 'load-too-long', id: e.id });
  return out;
}
function meanPositive(d) {
  if (!d) return false;
  switch (d.kind) { case 'const': return d.v > 0; case 'uniform': return d.b > 0; case 'exp': case 'erlang': case 'normal': return d.mean > 0; case 'tri': return d.b > 0; }
  return false;
}

// ------------------------------------------------------------------------------------------------- the run
export class Sim {
  constructor(graph, opts = {}) {
    this.seed = opts.seed ?? 1;
    this.until = opts.until ?? 3600;
    this.warmup = Math.min(opts.warmup ?? 0, this.until);
    this.maxEvents = opts.maxEvents ?? 5e7;
    this.maxLeads = opts.maxLeads ?? 2e6;
    this.onProgress = typeof opts.onProgress === 'function' ? opts.onProgress : null;
    this.progressEvery = opts.progressEvery ?? 50000;
    this.begun = false; this.over = false;
    this.now = 0; this.seq = 0; this.heap = new Heap(); this.tws = []; this.events = 0; this.statsFrom = 0;
    this.nextLoad = 1; this.created = 0; this.done = 0; this.alive = 0; this.leads = []; this.byType = {}; this.warnings = []; this.failed = null;
    const tu = Math.min(opts.traceUntil ?? 0, this.until);
    this.trace = tu > 0 ? { until: tu, max: opts.maxTrace ?? 200000, res: [], belts: {}, vehicles: [], full: false } : null;
    this.problems = checkGraph(graph);
    this.els = new Map(); this.pools = new Map();
    this.cals = new Map(); this.calSpecs = new Map((graph.calendars || []).map((c) => [c.id, c]));
    if (this.problems.length) return;
    for (const p of graph.pools || []) this.pools.set(p.id, new Pool(this, p));
    for (const spec of graph.elements) this.els.set(spec.id, new CLASSES[spec.type](this, spec));
    for (const l of graph.links || []) {
      const a = this.els.get(l.from), b = this.els.get(l.to);
      a.outs[l.out] = { el: b, port: l.in }; b.ins[l.in] = a;
    }
    const usesAgv = graph.elements.some((e) => e.type === 'agv-pick');
    this.agv = usesAgv ? new AgvSystem(this, graph.agv) : null;
  }
  at(t, p, fn) { this.heap.push({ t, p, s: this.seq++, fn }); }
  /** An input from outside the model between ticks (a PLC's coil): the element with that id takes the value. → true when taken. */
  input(id, value) { const el = this.els.get(id); return !!(el && typeof el.setOpen === 'function' && el.setOpen(value)); }
  /** A compiled shift calendar by id (calendar.js); one per run. */
  calendar(id) {
    let c = this.cals.get(id);
    if (!c) { c = compileCalendar(this.calSpecs.get(id)); this.cals.set(id, c); }
    return c;
  }
  rng(key) { return makeRng(this.seed, key); }
  newLoad(type, L) { this.created++; this.alive++; return { id: this.nextLoad++, type, L, born: this.now, rec: null }; }
  enter(load, el) {
    const tr = this.trace;
    if (!tr || this.now > tr.until) return;
    if (tr.res.length >= tr.max) { tr.full = true; return; }
    load.rec = { l: load.id, ty: load.type, L: load.L, el: el.id, t0: this.now, t1: Infinity };
    tr.res.push(load.rec);
  }
  leave(load) { if (load.rec) { load.rec.t1 = this.now; load.rec = null; } }
  finish(load, lt) {
    this.done++; this.alive--;
    if (this.leads.length < this.maxLeads) this.leads.push(lt);
    const b = this.byType[load.type] || (this.byType[load.type] = { done: 0, lead: 0 });
    b.done++; b.lead += lt;
  }
  fail(code, data = {}) { if (!this.failed) this.failed = { code, t: r6(this.now), ...data }; }
  resetStats() {
    this.statsFrom = this.now;
    for (const tw of this.tws) tw.reset();
    for (const el of this.els.values()) el.reset();
    if (this.agv) this.agv.reset();
    this.created = 0; this.done = 0; this.leads = []; this.byType = {};
  }
  /** Set the run up (elements start, the warm-up reset is queued). False when the graph has problems. */
  begin() {
    if (this.problems.length) return false;
    if (this.begun) return true;
    this.begun = true;
    for (const el of this.els.values()) if (el.type !== 'sensor') el.init();
    for (const el of this.els.values()) if (el.type === 'sensor') el.init();
    if (this.warmup > 0) this.at(this.warmup, 2, () => this.resetStats());
    return true;
  }
  /** Work through every event up to simulated time t (never past `until`). True once the run is over (end, failure, event cap). */
  advance(t) {
    if (!this.begun || this.over) return this.over;
    const lim = Math.min(t, this.until);
    while (this.heap.size) {
      const e = this.heap.peek();
      if (e.t > lim) break;
      this.heap.pop();
      this.now = e.t;
      e.fn();
      if (++this.events >= this.maxEvents) { this.warnings.push({ code: 'max-events', t: r6(this.now) }); this.over = true; break; }
      if (this.failed) { this.over = true; break; }
      if (this.onProgress && this.events % this.progressEvery === 0) this.onProgress({ t: this.now, until: this.until, events: this.events });
    }
    if (!this.over) { this.now = Math.max(this.now, lim); if (lim >= this.until) this.over = true; }
    return this.over;
  }
  run() {
    if (!this.begin()) return { ok: false, problems: this.problems };
    this.advance(this.until);
    return this.results();
  }
  results() {
    const ls = Float64Array.from(this.leads).sort();
    const q = (p) => (ls.length ? ls[Math.min(ls.length - 1, Math.floor(p * ls.length))] : 0);
    const sum = ls.reduce((a, x) => a + x, 0);
    const span = this.now - this.statsFrom;
    const elements = {};
    for (const [id, el] of this.els) elements[id] = el.stats();
    const byType = {};
    for (const [k, b] of Object.entries(this.byType)) byType[k] = { done: b.done, leadMean: r6(b.done ? b.lead / b.done : 0) };
    if (this.trace && this.trace.full) this.warnings.push({ code: 'trace-full' });
    return {
      ok: !this.failed, failed: this.failed, version: VERSION, seed: this.seed, until: this.until, warmup: this.warmup, end: r6(this.now),
      events: this.events, created: this.created, done: this.done, wip: this.alive,
      perHour: r6(span > 0 ? (this.done / span) * 3600 : 0),
      lead: { n: ls.length, mean: r6(ls.length ? sum / ls.length : 0), min: r6(ls.length ? ls[0] : 0), p50: r6(q(0.5)), p95: r6(q(0.95)), max: r6(ls.length ? ls[ls.length - 1] : 0) },
      byType, elements, pools: [...this.pools.values()].map((p) => p.stats()), vehicles: this.agv ? this.agv.stats() : [], warnings: this.warnings,
      trace: this.trace,
    };
  }
}

export function simulate(graph, opts = {}) { return new Sim(graph, opts).run(); }
