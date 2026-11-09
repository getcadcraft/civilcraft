/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — DOM-free library: its literals are ST source, signal names and codes the panel turns into words. */
/**
 * commission.js — controls testing on the model with no hardware (0.9 TW.1, TW.2). The soft PLC (lib/plc) runs in lock step with the flow simulation: sensors in, one scan,
 * commands out, the model moves by one cycle. Simulated time: a test repeats to the byte and runs faster than real time. Not a safety validation: an emergency stop here is a test input.
 *
 *   ioList(graph) → { inputs: [{name, addr, type, element, key}], outputs: [...] }       every photo-eye, gate in mode plc, plus estop_ok, loads_done, loads_inside
 *   starterProgram(graph) → ST text                                                      declarations for all of it, and a first rule per gate
 *   const rig = new Rig({ Sim, graph, program, seed, until, cycleMs, traceUntil })       Sim handed in, so lib/twin needs no copy of the flow code; program = ST text or a PLCopen XML string
 *   rig.problems · rig.run(seconds) · rig.value(name) · rig.force(name, value) · rig.unforce(name) · rig.fault(spec) → id · rig.clear(id) · rig.summary()
 *   fault specs: { kind: 'sensor-stuck', element, value } | { kind: 'gate-stuck', element } | { kind: 'belt-stop', element } | { kind: 'station-down', element } | { kind: 'estop' }
 *   runTest(makeRig, test) → { passed, checks, log, findings, summary }                  test = { name, seconds, steps: [{at, fault, id} | {at, clear} | {at, within, signal, equals} | {at, metric, min|max}] }
 *   stockTests(graph) → the tests a layout gets without anyone writing one
 *   reportCsv(result)
 */
import { projectFromST, readPlcopen, analyze, SoftPLC } from '../plc/index.js';

const NEVER = 1e15;
export const stName = (id) => { const s = String(id).replace(/[^A-Za-z0-9_]/g, '_'); return /^[A-Za-z_]/.test(s) ? s : 'x_' + s; };

export function ioList(graph) {
  const inputs = [], outputs = [];
  let bit = 0, word = 0, obit = 0;
  const bx = () => { const a = `%IX${Math.floor(bit / 8)}.${bit % 8}`; bit++; return a; };
  inputs.push({ name: 'estop_ok', addr: bx(), type: 'BOOL', key: 'estop' });
  for (const e of graph.elements) {
    if (e.type === 'sensor') for (const key of ['covered', 'standing']) inputs.push({ name: stName(e.id) + '_' + key, addr: bx(), type: 'BOOL', element: e.id, key });
    else if (e.type === 'gate' && e.mode === 'plc') {
      inputs.push({ name: stName(e.id) + '_is_open', addr: bx(), type: 'BOOL', element: e.id, key: 'isopen' });
      outputs.push({ name: stName(e.id) + '_open', addr: `%QX${Math.floor(obit / 8)}.${obit % 8}`, type: 'BOOL', element: e.id, key: 'open' });
      obit++;
    }
  }
  for (const key of ['loads_done', 'loads_inside']) inputs.push({ name: key, addr: `%IW${word++}`, type: 'INT', key });
  return { inputs, outputs };
}

/** The eye that says the belt after this gate has backed up: the eye on that belt closest to its start. */
function eyeAfter(graph, gateId) {
  const link = (graph.links || []).find((l) => l.from === gateId);
  if (!link) return null;
  const eyes = graph.elements.filter((e) => e.type === 'sensor' && e.on === link.to).sort((a, b) => a.at - b.at);
  return eyes[0] ? eyes[0].id : null;
}

export function starterProgram(graph) {
  const io = ioList(graph), lines = ['PROGRAM Main', 'VAR'];
  for (const p of [...io.inputs, ...io.outputs]) lines.push(`  ${p.name} AT ${p.addr} : ${p.type};`);
  lines.push('END_VAR', '');
  if (!io.outputs.length) lines.push('(* No gate is in PLC mode yet: set a stop gate\'s mode to plc, then press Starter program again. *)');
  for (const o of io.outputs) {
    const eye = eyeAfter(graph, o.element);
    lines.push(eye ? `(* ${o.element}: let loads through while the next belt has room *)` : `(* ${o.element}: no photo-eye on the next belt, so only the emergency stop holds it *)`);
    lines.push(`${o.name} := estop_ok${eye ? ` AND NOT ${stName(eye)}_standing` : ''};`);
  }
  lines.push('END_PROGRAM', '');
  return lines.join('\n');
}

const looksLikeXml = (s) => /^\s*(<\?xml|<project)/i.test(s);
export function loadProgram(text) {
  const project = looksLikeXml(text) ? readPlcopen(text) : projectFromST(text);
  const problems = [...(project.problems || [])];
  try { problems.push(...analyze(project)); } catch (e) { problems.push({ severity: 'error', text: String(e.message || e) }); }
  return { project, problems };
}

export class Rig {
  constructor({ Sim, graph, program, seed = 1, until = 3600, cycleMs = 50, traceUntil = 0, warmup = 0 }) {
    this.problems = []; this.log = []; this.faults = new Map(); this.nextFault = 1; this.cycleMs = cycleMs; this.t = 0; this.findings = [];
    this.lastDone = 0; this.lastDoneAt = 0; this.stallS = 120; this.stalled = false;
    this.estop = false; this.heldGates = new Set(); this.values = new Map();
    // every belt and station can be stopped on command: a breakdown that never comes by itself and never mends by itself (its own RNG stream, so nothing else in the run moves)
    this.graph = { ...graph, elements: graph.elements.map((e) => ((e.type === 'conveyor' || e.type === 'station') && !e.mtbf ? { ...e, mtbf: NEVER, mttr: NEVER } : { ...e })) };
    this.io = ioList(graph);
    const { project, problems } = loadProgram(program);
    this.problems.push(...problems.filter((p) => p.severity === 'error'));
    this.warnings = problems.filter((p) => p.severity !== 'error');
    this.sim = new Sim(this.graph, { seed, until, warmup, traceUntil });
    if (this.sim.problems.length) { this.problems.push(...this.sim.problems.map((p) => ({ severity: 'error', text: 'Layout: ' + p.code + (p.id ? ' ' + p.id : '') }))); return; }
    if (this.problems.length) return;
    this.plc = new SoftPLC(project, { cycleMs });
    if (this.plc.problems.some((p) => p.severity === 'error')) { this.problems.push(...this.plc.problems); return; }
    this.sim.begin();
    const sense = {}, command = {};
    for (const p of this.io.inputs) sense[p.addr] = p.name;
    for (const p of this.io.outputs) command[p.addr] = p.name;
    const declared = new Set(this.plc.rt.addresses().map((a) => a.address.toUpperCase()));
    this.unbound = [...this.io.inputs, ...this.io.outputs].filter((p) => !declared.has(p.addr)).map((p) => p.name);
    const self = this;
    this.plc.bind({
      sense() { const out = {}; for (const p of self.io.inputs) { out[p.name] = self.read(p); self.note(p.name, out[p.name]); } return out; },
      command(name, v) { self.note(name, v); const o = self.io.outputs.find((x) => x.name === name); if (o && !self.heldGates.has(o.element)) self.sim.input(o.element, !!v); },
      step(dt) { self.t += dt / 1000; self.sim.advance(self.t); self.watch(); },
    }, { sense, command });
  }
  read(p) {
    const el = p.element ? this.sim.els.get(p.element) : null;
    switch (p.key) {
      case 'estop': return !this.estop;
      case 'covered': return !!(el && el.covered());
      case 'standing': return !!(el && el.standing());
      case 'isopen': return !!(el && el.isOpen);
      case 'loads_done': return this.sim.done & 0x7fff;
      case 'loads_inside': return this.sim.alive & 0x7fff;
      default: return false;
    }
  }
  note(name, v) {
    if (this.values.get(name) !== v) { if (this.values.has(name)) this.log.push({ t: +this.t.toFixed(3), what: 'signal', name, value: v }); this.values.set(name, v); }
  }
  value(name) { return this.values.get(name); }
  addrOf(name) { const p = [...this.io.inputs, ...this.io.outputs].find((x) => x.name === name); return p ? p.addr : null; }
  force(name, v) { const a = this.addrOf(name); if (a) { this.plc.force(a, v); this.log.push({ t: +this.t.toFixed(3), what: 'force', name, value: v }); } }
  unforce(name) { const a = this.addrOf(name); if (a) { this.plc.unforce(a); this.log.push({ t: +this.t.toFixed(3), what: 'unforce', name }); } }
  stopEl(id) { const el = this.sim.els.get(id); if (el && !el.broken && typeof el.breakDown === 'function') { el.breakDown(); return true; } return false; }
  startEl(id) { const el = this.sim.els.get(id); if (el && el.broken && typeof el.repair === 'function') el.repair(); }
  fault(spec) {
    const id = this.nextFault++, undo = [];
    this.log.push({ t: +this.t.toFixed(3), what: 'fault', kind: spec.kind, element: spec.element || '', id });
    switch (spec.kind) {
      case 'sensor-stuck': { const a = this.addrOf(stName(spec.element) + '_' + (spec.key || 'covered')); if (a) { this.plc.force(a, !!spec.value); undo.push(() => this.plc.unforce(a)); } break; }
      case 'gate-stuck': { this.heldGates.add(spec.element); this.sim.input(spec.element, false); undo.push(() => this.heldGates.delete(spec.element)); break; }
      case 'belt-stop': case 'station-down': if (this.stopEl(spec.element)) undo.push(() => this.startEl(spec.element)); break;
      case 'estop': {
        this.estop = true;
        for (const e of this.graph.elements) if ((e.type === 'conveyor' || e.type === 'station') && this.stopEl(e.id)) undo.push(() => this.startEl(e.id));
        undo.push(() => { this.estop = false; });
        break;
      }
      default: this.log.push({ t: +this.t.toFixed(3), what: 'unknown-fault', kind: spec.kind });
    }
    this.faults.set(id, { spec, undo });
    return id;
  }
  clear(id) {
    const f = this.faults.get(id); if (!f) return false;
    for (const u of f.undo) u();
    this.faults.delete(id);
    this.log.push({ t: +this.t.toFixed(3), what: 'cleared', kind: f.spec.kind, element: f.spec.element || '', id });
    this.lastDoneAt = this.t;
    return true;
  }
  watch() {
    const s = this.sim;
    if (s.done !== this.lastDone) { this.lastDone = s.done; this.lastDoneAt = this.t; if (this.stalled) { this.stalled = false; this.log.push({ t: +this.t.toFixed(3), what: 'moving-again' }); } }
    else if (!this.stalled && s.alive > 0 && this.t - this.lastDoneAt > this.stallS) {
      this.stalled = true;
      const f = { code: 'stalled', t: +this.t.toFixed(3), since: +this.lastDoneAt.toFixed(3), inside: s.alive, faults: this.faults.size };
      this.findings.push(f); this.log.push({ what: 'stalled', ...f });
    }
    if (s.failed && !this.failedSeen) { this.failedSeen = true; this.findings.push({ code: s.failed.code, t: s.failed.t }); }
  }
  run(seconds) {
    if (!this.plc || this.problems.length) return 0;
    const n = Math.round((seconds * 1000) / this.cycleMs);
    for (let i = 0; i < n; i++) { if (this.sim.over) return i; this.plc.cycle(); }
    return n;
  }
  summary() { const s = this.sim; return { t: +this.t.toFixed(3), done: s.done, inside: s.alive, perHour: this.t > 0 ? +((s.done / this.t) * 3600).toFixed(3) : 0, scans: this.plc ? this.plc.rt.scans : 0, unbound: this.unbound || [] }; }
}

const META = { done: (r) => r.sim.done, inside: (r) => r.sim.alive };
export function runTest(makeRig, test) {
  const rig = makeRig(test);
  if (rig.problems.length) return { name: test.name, passed: false, checks: [], log: [], findings: [], problems: rig.problems, summary: null };
  const steps = (test.steps || []).slice().sort((a, b) => a.at - b.at), checks = [], ids = new Map();
  const seconds = test.seconds ?? Math.max(60, ...steps.map((s) => s.at + (s.within || 0) + 1));
  const open = [];
  const dt = rig.cycleMs / 1000, pending = steps.slice();
  const end = Math.round(seconds / dt);
  for (let i = 0; i < end; i++) {
    const t = i * dt;
    while (pending.length && pending[0].at <= t + 1e-9) {
      const s = pending.shift();
      if (s.fault) ids.set(s.id || s.fault.kind + ':' + (s.fault.element || ''), rig.fault(s.fault));
      else if (s.clear) { const id = ids.get(s.clear); if (id) rig.clear(id); }
      else if (s.signal) open.push({ ...s, hit: null });
      else if (s.metric) { const v = META[s.metric] ? META[s.metric](rig) : NaN, ok = (s.min === undefined || v >= s.min) && (s.max === undefined || v <= s.max); checks.push({ what: s.label || s.metric, at: s.at, ok, found: v, want: { min: s.min, max: s.max } }); }
    }
    rig.run(dt);
    for (const c of open) {
      if (c.done) continue;
      if (rig.value(c.signal) === c.equals) { c.done = true; c.hit = rig.t; checks.push({ what: c.label || c.signal, at: c.at, ok: true, found: +(rig.t - c.at).toFixed(3), want: { signal: c.signal, equals: c.equals, within: c.within } }); }
      else if (rig.t > c.at + (c.within || 0) + dt) { c.done = true; checks.push({ what: c.label || c.signal, at: c.at, ok: false, found: rig.value(c.signal), want: { signal: c.signal, equals: c.equals, within: c.within } }); }
    }
  }
  for (const c of open) if (!c.done) checks.push({ what: c.label || c.signal, at: c.at, ok: false, found: rig.value(c.signal), want: { signal: c.signal, equals: c.equals, within: c.within } });
  const expectStall = !!test.expectStall, stalled = rig.findings.some((f) => f.code === 'stalled');
  const passed = checks.every((c) => c.ok) && !rig.findings.some((f) => f.code !== 'stalled') && (expectStall || !stalled);
  return { name: test.name, passed, checks, log: rig.log, findings: rig.findings, problems: [], summary: rig.summary() };
}

/** The tests every layout gets. A belt or a station on the line stops and starts again; the emergency stop closes every PLC gate; a stuck eye does not stop work for good. */
export function stockTests(graph) {
  const tests = [], io = ioList(graph);
  tests.push({ name: 'Runs for ten minutes without a stall', id: 'steady', seconds: 600, steps: [{ at: 590, metric: 'done', min: 1, label: 'Loads finished' }] });
  const belts = graph.elements.filter((e) => e.type === 'conveyor'), stations = graph.elements.filter((e) => e.type === 'station');
  const last = belts[belts.length - 1];
  if (last) tests.push({ name: `Belt ${last.id} stops for two minutes and starts again`, id: 'belt-stop', seconds: 600, expectStall: true, steps: [
    { at: 120, fault: { kind: 'belt-stop', element: last.id }, id: 'jam' }, { at: 240, clear: 'jam' }, { at: 590, metric: 'done', min: 1, label: 'Loads finished after the restart' }] });
  if (stations[0]) tests.push({ name: `Station ${stations[0].id} goes down for two minutes and comes back`, id: 'station-down', seconds: 600, expectStall: true, steps: [
    { at: 120, fault: { kind: 'station-down', element: stations[0].id }, id: 'down' }, { at: 240, clear: 'down' }, { at: 590, metric: 'done', min: 1, label: 'Loads finished after the repair' }] });
  if (io.outputs.length) {
    tests.push({ name: 'Emergency stop closes every PLC gate, and restart opens them', id: 'estop', seconds: 300, expectStall: true, steps: [
      { at: 60, fault: { kind: 'estop' }, id: 'stop' }, ...io.outputs.map((o) => ({ at: 60, within: 1, signal: o.name, equals: false, label: `${o.name} closes within 1 s of the stop` })),
      { at: 120, clear: 'stop' }, { at: 290, metric: 'done', min: 1, label: 'Loads finished after the restart' }] });
  }
  const eye = io.inputs.find((p) => p.key === 'standing');
  if (eye && io.outputs.length) tests.push({ name: `Photo-eye ${eye.element} stuck on for a minute`, id: 'eye-stuck', seconds: 400, expectStall: true, steps: [
    { at: 60, fault: { kind: 'sensor-stuck', element: eye.element, key: 'standing', value: true }, id: 'eye' }, { at: 120, clear: 'eye' }, { at: 390, metric: 'done', min: 1, label: 'Loads finished after the eye cleared' }] });
  return tests;
}

const q = (s) => { const t = String(s ?? ''); const safe = /^[=+\-@\t\r]/.test(t) ? "'" + t : t; return /[",\n]/.test(safe) ? '"' + safe.replace(/"/g, '""') + '"' : safe; };
export function reportCsv(results) {
  const rows = [['test', 'passed', 'check', 'at_s', 'check_passed', 'found', 'want']];
  for (const r of results) {
    if (!r.checks.length) rows.push([r.name, r.passed, '', '', '', '', '']);
    for (const c of r.checks) rows.push([r.name, r.passed, c.what, c.at, c.ok, c.found, JSON.stringify(c.want)]);
    for (const f of r.findings) rows.push([r.name, r.passed, 'finding: ' + f.code, f.t, '', '', '']);
  }
  return rows.map((x) => x.map(q).join(',')).join('\r\n') + '\r\n';
}
