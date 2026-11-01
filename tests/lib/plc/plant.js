/* SPDX-License-Identifier: Apache-2.0 */
/**
 * Plant models for virtual commissioning. A plant is anything with  sense() → {name: bool|number},  command(name, value),  step(dtMs).
 * These three are plain physics (constant speed, exact integration); a discrete-event model (lib/des) or a 3D scene can implement the same three methods and be bound the same way.
 */
export class Conveyor {
  /** @param o {length m, speed m/s, sensors [{name, at m, width m}]} */
  constructor(o) { this.length = o.length ?? 3; this.speed = o.speed ?? 0.5; this.sensors = o.sensors || []; this.items = []; this.run = false; this.exited = 0; }
  addItem(x = 0) { this.items.push({ x }); return this; }
  command(name, v) { if (name === 'run') this.run = !!v; }
  step(dt) { if (!this.run) return; const d = this.speed * dt / 1000; for (const it of this.items) it.x += d; const keep = this.items.filter((i) => i.x <= this.length + 1e-9); this.exited += this.items.length - keep.length; this.items = keep; }
  sense() { const o = {}; for (const s of this.sensors) o[s.name] = this.items.some((i) => Math.abs(i.x - s.at) <= (s.width ?? 0.1) / 2 + 1e-9); return o; }
}
export class Cylinder {
  /** @param o {stroke mm, speed mm/s} — command 'extend' true drives out, false drives back; sensors 'retracted' and 'extended'. */
  constructor(o = {}) { this.stroke = o.stroke ?? 100; this.speed = o.speed ?? 200; this.pos = o.pos ?? 0; this.extend = false; }
  command(name, v) { if (name === 'extend') this.extend = !!v; }
  step(dt) { const d = this.speed * dt / 1000; this.pos = Math.min(this.stroke, Math.max(0, this.pos + (this.extend ? d : -d))); }
  sense() { return { retracted: this.pos <= 1e-9, extended: this.pos >= this.stroke - 1e-9, position: this.pos }; }
}
export class Tank {
  /** @param o {area m², height m, level m, inflow m³/s (valve open), outflow m³/s, low m, high m} — commands 'fill', 'drain'; sensors 'low', 'high', 'level'. Level integrates exactly (the flows are constant). */
  constructor(o = {}) { this.area = o.area ?? 0.5; this.height = o.height ?? 1; this.level = o.level ?? 0; this.inflow = o.inflow ?? 0.002; this.outflow = o.outflow ?? 0.001; this.low = o.low ?? 0.1; this.high = o.high ?? 0.4; this.fill = false; this.drain = false; }
  command(name, v) { if (name === 'fill') this.fill = !!v; else if (name === 'drain') this.drain = !!v; }
  step(dt) { const q = (this.fill ? this.inflow : 0) - (this.drain && this.level > 0 ? this.outflow : 0); this.level = Math.min(this.height, Math.max(0, this.level + q * dt / 1000 / this.area)); }
  sense() { return { low: this.level >= this.low - 1e-9, high: this.level >= this.high - 1e-9, level: this.level }; }
}
