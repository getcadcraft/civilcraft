/* SPDX-License-Identifier: Apache-2.0 */
/**
 * SoftPLC: the runtime plus a process image, forces, plants and a trace. One cycle = read plant sensors into the image → forces on inputs →
 * scan the program → forces on outputs → write commands to the plants → step the plants by the cycle. Time is the cycle count × cycleMs.
 */
import { Runtime } from './runtime.js';

export class SoftPLC {
  constructor(project, opts = {}) {
    this.rt = new Runtime(project, opts); this.cycleMs = this.rt.cycleMs;
    this.bindings = []; this.forces = new Map(); this.trace = []; this.watch = [];
  }
  get time() { return this.rt.now; }
  get problems() { return this.rt.problems; }
  /** Bind a plant: `sense` maps image address → sensor name (inputs), `command` maps image address → command name (outputs). */
  bind(plant, { sense = {}, command = {} } = {}) { this.bindings.push({ plant, sense, command }); return this; }
  force(address, value) { this.forces.set(address.toUpperCase(), value); }
  unforce(address) { this.forces.delete(address.toUpperCase()); }
  setInput(address, value) { this.rt.io.set(address.toUpperCase(), value); }
  getOutput(address) { return this.rt.io.get(address.toUpperCase()); }
  /** Record these image addresses or variable names on every cycle. */
  record(...names) { this.watch = names.map((n) => String(n)); return this; }
  cycle() {
    const io = this.rt.io;
    for (const b of this.bindings) { const s = b.plant.sense(); for (const [addr, name] of Object.entries(b.sense)) if (name in s) io.set(addr.toUpperCase(), s[name]); }
    const input = (a) => /^%I/.test(a), force = (pred) => { for (const [a, v] of this.forces) if (pred(a)) io.set(a, v); };
    force(input);
    this.rt.scan(this.cycleMs - 0);   // scan() advances the clock by the cycle after executing
    force((a) => !input(a));
    for (const b of this.bindings) { for (const [addr, name] of Object.entries(b.command)) if (io.has(addr.toUpperCase())) b.plant.command(name, io.get(addr.toUpperCase())); b.plant.step(this.cycleMs); }
    if (this.watch.length) this.trace.push({ t: this.rt.now - this.cycleMs, v: Object.fromEntries(this.watch.map((n) => [n, n.startsWith('%') ? io.get(n.toUpperCase()) : this.rt.get(n)])) });
  }
  /** Run for `ms` of simulated time, or until `until()` returns true (checked after each cycle). → number of cycles run. */
  run(ms, until) { const n = Math.round(ms / this.cycleMs); let i = 0; for (; i < n; i++) { this.cycle(); if (until && until(this)) { i++; break; } } return i; }
  /** First time (ms) at which `name` had `value` in the trace, or null. */
  firstTime(name, value) { const r = this.trace.find((x) => x.v[name] === value); return r ? r.t : null; }
}
