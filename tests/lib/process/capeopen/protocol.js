/* SPDX-License-Identifier: Apache-2.0 */
/**
 * protocol.js — the JSON-over-pipe protocol between the CAPE-OPEN COM shim (Windows, native) and our process engine (JavaScript). 0.9 IND.3.
 *
 * Wire: one JSON-RPC 2.0 message per line (UTF-8, '\n' ends a message; JSON never holds a raw newline), both ways on the same pipe: either
 * side may call the other, also while it waits for an answer (the engine asks the simulator's material for values in the middle of a unit's
 * Calculate; the shim asks our material for values in the middle of a foreign unit's Calculate). The first call is `hello`.
 *   request  {"jsonrpc":"2.0","id":7,"method":"thermo.calcEquilibrium","params":{…}}
 *   answer   {"jsonrpc":"2.0","id":7,"result":{…}}   or   {"jsonrpc":"2.0","id":7,"error":{"code":-32000,"message":"…","data":{ecape,hr,…}}}
 * code -32000 = a CAPE-OPEN error (data = CapeError.toWire(): the shim returns data.hr and fills ECapeUser/ECapeRoot from it); -32601 unknown
 * method; -32602 bad params; -32700 not JSON. Objects that live on one side travel as handles ("e7" engine side, "s7" shim side).
 *
 *   SyncPeer(readLine, writeLine)   a side that blocks (the engine host: Node with blocking reads, or the native host's embedded JS; the shim)
 *   AsyncPeer(writeLine)            a side that awaits (CadCraft in a page or Studio's web view); feed it lines with receive(line)
 *   serveEngine(peer, opts)         the engine's methods (below) on any peer
 *   RemoteMaterial(peer, handle)    an ICapeThermoMaterial on the other side, called synchronously (SyncPeer only)
 *   remoteUnitDriver(peer, comp)    a foreign CAPE-OPEN unit hosted by the shim, for foreign.js (any peer)
 *
 * Engine methods: hello · package.list · package.open {name} · thermo.calcEquilibrium {package, spec1, spec2, solutionType, state, allowed}
 *   · thermo.checkEquilibriumSpec · thermo.calcSinglePhaseProp {package, props, phase, T, P, fraction} · thermo.calcTwoPhaseProp {package, props, phases}
 *   · thermo.lnPhi {package, phase, T, P, moleNumbers, flags} · thermo.compoundConstant {package, props, compIds} · thermo.tDependent {package, props, T, compIds}
 *   · unit.types · unit.create {type, opts} · unit.parameters {unit} · unit.setParameter {unit, name, value} · unit.validate {unit}
 *   · unit.calculate {unit, inlets: {port: state}, outlets: [port]} (own thermo: states in, states out)   · unit.calculateHost {unit, materials: {port: handle}} (host thermo,
 *     needs a SyncPeer: the engine calls material.call back)   · unit.save / unit.load / unit.report · close {handle}
 * Shim methods the engine calls: material.call {material, op, args} (SyncPeer engines only).
 * Shim methods for foreign units: foreign.list · foreign.create {component} · foreign.connect {unit, port, material} · foreign.setParameter
 *   · foreign.validate · foreign.calculate · foreign.parameters · foreign.terminate. While foreign.calculate runs, the shim calls material.call on us.
 */
import { CapeError, fromWire } from './errors.js';
import { CoPropertyPackage } from './package.js';
import { CoUnit, UNIT_SPECS, UNIT_TYPES_OFFERED } from './unit.js';
import { CoMaterial } from './material.js';

export const PROTOCOL = { name: 'cadcraft-capeopen', version: 1 };
const MAX_LINE = 16 * 1024 * 1024;

class PeerBase {
  constructor(writeLine, prefix) { this.writeLine = writeLine; this.handlers = new Map(); this.nextId = 1; this.objects = new Map(); this.prefix = prefix; this.nextHandle = 1; this.log = null; }
  handle(method, fn) { this.handlers.set(method, fn); return this; }
  ref(obj) { for (const [h, o] of this.objects) if (o === obj) return h; const h = this.prefix + (this.nextHandle++); this.objects.set(h, obj); return h; }
  obj(h, what = 'object') { const o = this.objects.get(h); if (!o) throw new CapeError('ECapeInvalidArgument', 'unknown ' + what + ' handle ' + h, { interface: 'pipe', operation: 'handle' }); return o; }
  drop(h) { this.objects.delete(h); }
  _send(msg) { const s = JSON.stringify(msg); if (this.log) this.log('>', s); this.writeLine(s); }
  _parse(line) {
    if (line.length > MAX_LINE) return { bad: { code: -32700, message: 'message too long' } };
    try { return { msg: JSON.parse(line) }; } catch { return { bad: { code: -32700, message: 'not JSON' } }; }
  }
  _errorOf(e) {
    if (e instanceof CapeError) return { code: -32000, message: e.message, data: e.toWire() };
    if (e && e.rpc) return e.rpc;
    return { code: -32000, message: String(e && e.message ? e.message : e), data: new CapeError('ECapeUnknown', String(e && e.message ? e.message : e)).toWire() };
  }
  _replyError(id, e) { this._send({ jsonrpc: '2.0', id, error: this._errorOf(e) }); }
}

/** A blocking side. readLine() returns the next line (string) or null at end of input. */
export class SyncPeer extends PeerBase {
  constructor(readLine, writeLine, prefix = 'e') { super(writeLine, prefix); this.readLine = readLine; }
  _dispatch(msg) {
    const fn = this.handlers.get(msg.method);
    if (!fn) { if (msg.id != null) this._send({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'unknown method ' + msg.method } }); return; }
    let r; try { r = fn(msg.params || {}, this); } catch (e) { if (msg.id != null) this._replyError(msg.id, e); return; }
    if (r && typeof r.then === 'function') { if (msg.id != null) this._replyError(msg.id, new CapeError('ECapeImplementation', msg.method + ' is asynchronous on a blocking peer')); return; }
    if (msg.id != null) this._send({ jsonrpc: '2.0', id: msg.id, result: r === undefined ? null : r });
  }
  /** Call and block until the answer; requests that arrive meanwhile are served (nested calls). */
  call(method, params) {
    const id = this.nextId++; this._send({ jsonrpc: '2.0', id, method, params });
    for (;;) {
      const line = this.readLine(); if (line == null) throw new CapeError('ECapeTimeOut', 'the pipe closed while waiting for ' + method, { interface: 'pipe', operation: method });
      if (!line.trim()) continue; if (this.log) this.log('<', line);
      const { msg, bad } = this._parse(line); if (bad) { this._send({ jsonrpc: '2.0', id: null, error: bad }); continue; }
      if (msg.method) { this._dispatch(msg); continue; }
      if (msg.id === id) { if (msg.error) throw msg.error.data ? fromWire(msg.error.data) : new CapeError('ECapeUnknown', msg.error.message || 'error'); return msg.result; }
    }
  }
  /** Serve until the input ends or `shutdown` is called. */
  serve() {
    this.stopped = false; this.handle('shutdown', () => { this.stopped = true; return null; });
    while (!this.stopped) {
      const line = this.readLine(); if (line == null) break; if (!line.trim()) continue; if (this.log) this.log('<', line);
      const { msg, bad } = this._parse(line); if (bad) { this._send({ jsonrpc: '2.0', id: null, error: bad }); continue; }
      if (msg.method) this._dispatch(msg);
    }
  }
}

/** An awaiting side: call() returns a promise; feed every incoming line to receive(). */
export class AsyncPeer extends PeerBase {
  constructor(writeLine, prefix = 'e') { super(writeLine, prefix); this.waiting = new Map(); }
  call(method, params) { const id = this.nextId++; return new Promise((resolve, reject) => { this.waiting.set(id, { resolve, reject, method }); this._send({ jsonrpc: '2.0', id, method, params }); }); }
  async receive(line) {
    if (!line || !line.trim()) return; if (this.log) this.log('<', line);
    const { msg, bad } = this._parse(line); if (bad) { this._send({ jsonrpc: '2.0', id: null, error: bad }); return; }
    if (msg.method) {
      const fn = this.handlers.get(msg.method);
      if (!fn) { if (msg.id != null) this._send({ jsonrpc: '2.0', id: msg.id, error: { code: -32601, message: 'unknown method ' + msg.method } }); return; }
      try { const r = await fn(msg.params || {}, this); if (msg.id != null) this._send({ jsonrpc: '2.0', id: msg.id, result: r === undefined ? null : r }); } catch (e) { if (msg.id != null) this._replyError(msg.id, e); }
      return;
    }
    const w = this.waiting.get(msg.id); if (!w) return; this.waiting.delete(msg.id);
    if (msg.error) w.reject(msg.error.data ? fromWire(msg.error.data) : new CapeError('ECapeUnknown', msg.error.message || 'error')); else w.resolve(msg.result);
  }
  /** The pipe closed: every waiting call fails. */
  closed() { for (const [, w] of this.waiting) w.reject(new CapeError('ECapeTimeOut', 'the pipe closed while waiting for ' + w.method)); this.waiting.clear(); }
}

/** A material on the other side of a SyncPeer, with the CoMaterial method names. */
export class RemoteMaterial {
  constructor(peer, handle) { this.peer = peer; this.handle = handle; }
  _c(op, args) { return this.peer.call('material.call', { material: this.handle, op, args }); }
  CreateMaterial() { return new RemoteMaterial(this.peer, this._c('CreateMaterial', [])); }
}
for (const op of ['ClearAllProps', 'GetOverallProp', 'GetOverallTPFraction', 'GetPresentPhases', 'GetSinglePhaseProp', 'GetTPFraction', 'GetTwoPhaseProp', 'SetOverallProp', 'SetPresentPhases',
  'SetSinglePhaseProp', 'SetTwoPhaseProp', 'GetCompoundList', 'GetNumCompounds', 'GetCompoundConstant', 'GetPhaseList', 'GetNumPhases', 'GetPhaseInfo', 'CalcSinglePhaseProp', 'CalcTwoPhaseProp',
  'CalcEquilibrium', 'CheckEquilibriumSpec', 'GetUniversalConstant']) RemoteMaterial.prototype[op] = function (...args) { return this._c(op, args); };

/** Serve material.call for our own materials (handles made with peer.ref(material)). CreateMaterial answers a new handle. */
export function serveMaterials(peer) {
  if (peer.handlers.has('material.call')) return peer;
  peer.handle('material.call', ({ material, op, args }) => {
    const m = peer.obj(material, 'material');
    if (op === 'CreateMaterial') return peer.ref(m.CreateMaterial());
    if (typeof m[op] !== 'function' || op.startsWith('_')) throw new CapeError('ECapeInvalidArgument', 'not a material call: ' + op, { interface: 'ICapeThermoMaterial', operation: op });
    const r = m[op](...(args || [])); return r === undefined ? null : r;
  });
  return peer;
}

const describeUnit = (peer, u) => ({
  handle: peer.ref(u), name: u.ComponentName, description: u.ComponentDescription,
  ports: u.ports.items.map((p) => ({ name: p.ComponentName, direction: p.direction, type: p.portType })),
  parameters: u.parameters.items.map((p) => ({ name: p.ComponentName, description: p.ComponentDescription, mode: p.Mode, value: p.value, spec: p.Specification })),
});

/**
 * The engine's methods. opts.packages: [{ name, description, thermo }] (from an exported CAPE-OPEN package file, bundle.js), opts.engine (a label).
 */
export function serveEngine(peer, opts = {}) {
  const packages = opts.packages || [];
  const pp = (h) => peer.obj(h, 'package');
  peer.handle('hello', (p) => ({ ...PROTOCOL, engine: opts.engine || 'cc-process', co: '1.1', peer: p && p.name }))
    .handle('package.list', () => packages.map((p) => ({ name: p.name, description: p.description || '' })))
    .handle('package.open', ({ name }) => {
      const d = packages.find((p) => p.name === name); if (!d) throw new CapeError('ECapeInvalidArgument', 'no property package named ' + name, { interface: 'ICapeThermoPropertyPackageManager', operation: 'GetPropertyPackage' });
      const k = new CoPropertyPackage(d.thermo, { name: d.name, description: d.description });
      // everything the shim can answer without asking again
      return { handle: peer.ref(k), name: k.ComponentName, description: k.ComponentDescription, compounds: k.GetCompoundList(), phases: k.GetPhaseList(),
        constProps: k.GetConstPropList(), tProps: k.GetTDependentPropList(), pProps: k.GetPDependentPropList(), singlePhaseProps: k.GetSinglePhasePropList(), twoPhaseProps: k.GetTwoPhasePropList(), universal: k.GetUniversalConstantList() };
    })
    .handle('thermo.checkEquilibriumSpec', ({ package: h, spec1, spec2, solutionType }) => pp(h).CheckEquilibriumSpec(spec1, spec2, solutionType))
    .handle('thermo.calcEquilibrium', ({ package: h, spec1, spec2, solutionType, state, allowed }) => {
      const k = pp(h);
      if (solutionType && solutionType !== 'Unspecified' && solutionType !== 'Normal') throw new CapeError('ECapeLimitedImpl', 'solution type ' + solutionType + ' is not supported', { interface: 'ICapeThermoEquilibriumRoutine', operation: 'CalcEquilibrium' });
      const kind = k._pair(spec1, spec2); if (!kind) throw new CapeError('ECapeLimitedImpl', `equilibrium specification ${spec1?.[0]} + ${spec2?.[0]} is not supported`, { interface: 'ICapeThermoEquilibriumRoutine', operation: 'CalcEquilibrium' });
      return k.equilibrium(kind, state, allowed && allowed.length ? allowed : null);
    })
    .handle('thermo.calcSinglePhaseProp', ({ package: h, props, phase, T, P, fraction }) => pp(h).phaseValues(props, phase, T, P, fraction))
    .handle('thermo.calcTwoPhaseProp', ({ package: h, props, phases }) => {
      const k = pp(h), [a, b] = phases, la = k.lnPhi(a.label, a.T, a.P, a.fraction), lb = k.lnPhi(b.label, b.T, b.P, b.fraction), lnK = la.map((v, i) => lb[i] - v), out = {};
      for (const p of props) { if (p === 'logKvalue') out[p] = lnK; else if (p === 'kvalue') out[p] = lnK.map(Math.exp); else throw new CapeError('ECapeThrmPropertyNotAvailable', 'two-phase property ' + p + ' is not offered', { interface: 'ICapeThermoPropertyRoutine', operation: 'CalcTwoPhaseProp' }); }
      return out;
    })
    .handle('thermo.lnPhi', ({ package: h, phase, T, P, moleNumbers, flags }) => pp(h).CalcAndGetLnPhi(phase, T, P, moleNumbers, flags))
    .handle('thermo.compoundConstant', ({ package: h, props, compIds }) => pp(h).GetCompoundConstant(props, compIds))
    .handle('thermo.tDependent', ({ package: h, props, T, compIds }) => pp(h).GetTDependentProperty(props, T, compIds))
    .handle('unit.types', () => UNIT_TYPES_OFFERED.map((t) => ({ type: t, title: UNIT_SPECS[t].title })))
    .handle('unit.create', ({ type, opts: o }) => describeUnit(peer, new CoUnit(type, o || {})))
    .handle('unit.parameters', ({ unit }) => describeUnit(peer, peer.obj(unit, 'unit')).parameters)
    .handle('unit.setParameter', ({ unit, name, value }) => { peer.obj(unit, 'unit').parameters.Item(name).value = value; return null; })
    .handle('unit.validate', ({ unit }) => peer.obj(unit, 'unit').Validate())
    .handle('unit.report', ({ unit }) => peer.obj(unit, 'unit').ProduceReport())
    .handle('unit.save', ({ unit }) => peer.obj(unit, 'unit').Save())
    .handle('unit.load', ({ unit, text }) => { peer.obj(unit, 'unit').Load(text); return null; })
    .handle('close', ({ handle }) => { peer.drop(handle); return null; })
    // own thermo: inlet states in, outlet states out; the shim writes them on the simulator's outlet materials and flashes them there at T and P
    .handle('unit.calculate', ({ unit, inlets, packageName }) => {
      const u = peer.obj(unit, 'unit');
      const d = packages.find((p) => p.name === packageName) || packages[0];
      const k = new CoPropertyPackage(d ? d.thermo : { components: (inlets && Object.values(inlets)[0]?.compIds) || [], model: 'pr' });
      const mats = {};
      for (const port of u.ports.items) {
        const m = new CoMaterial(k, port.ComponentName); mats[port.ComponentName] = m;
        const s = inlets && inlets[port.ComponentName];
        if (s) { m.SetOverallProp('totalFlow', 'Mole', [s.totalFlow]); m.SetOverallProp('fraction', 'Mole', s.fraction); m.SetOverallProp('temperature', '', [s.temperature]); m.SetOverallProp('pressure', '', [s.pressure]); m.CalcEquilibrium(['temperature', '', 'Overall'], ['pressure', '', 'Overall']); }
        if (s || port.direction !== 0) port.Connect(m);
      }
      const keep = u.opts.thermo; u.opts.thermo = 'host';   // the package here IS ours: host thermo through these materials
      try { u.ValStatus = 0; u.Calculate(); } finally { u.opts.thermo = keep; }
      const outlets = {};
      for (const port of u.ports.items) if (port.direction === 1) { const m = mats[port.ComponentName]; outlets[port.ComponentName] = { totalFlow: m.GetOverallProp('totalFlow', 'Mole')[0], fraction: m.GetOverallProp('fraction', 'Mole'), temperature: m.GetOverallProp('temperature', '')[0], pressure: m.GetOverallProp('pressure', '')[0] }; }
      return { outlets, parameters: describeUnit(peer, u).parameters.filter((p) => p.mode === 1), report: u.ProduceReport() };
    })
    // host thermo: the simulator's materials by handle; every material call goes back over the pipe while this runs (blocking peers only)
    .handle('unit.calculateHost', ({ unit, materials }) => {
      if (!(peer instanceof SyncPeer)) throw new CapeError('ECapeImplementation', 'unit.calculateHost needs a blocking engine host', { interface: 'ICapeUnit', operation: 'Calculate' });
      const u = peer.obj(unit, 'unit');
      for (const port of u.ports.items) { const h = materials[port.ComponentName]; if (h) port.Connect(new RemoteMaterial(peer, h)); else port.Disconnect(); }
      u.Calculate();
      return { parameters: describeUnit(peer, u).parameters.filter((p) => p.mode === 1), report: u.ProduceReport() };
    });
  return peer;
}

/**
 * A foreign CAPE-OPEN unit hosted by the shim, as the driver foreign.js uses. component: { clsid | progId, name }.
 * Our materials go across as handles; the shim's COM material objects forward the unit's calls to material.call here.
 */
export async function remoteUnitDriver(peer, component) {
  serveMaterials(peer);
  const d = await peer.call('foreign.create', { component });
  return {
    name: d.name, ports: d.ports, parameters: d.parameters,
    connect: (port, material) => peer.call('foreign.connect', { unit: d.handle, port, material: peer.ref(material) }),
    setParameter: (name, value) => peer.call('foreign.setParameter', { unit: d.handle, name, value }),
    validate: () => peer.call('foreign.validate', { unit: d.handle }),
    calculate: () => peer.call('foreign.calculate', { unit: d.handle }),
    outputs: async () => (await peer.call('foreign.parameters', { unit: d.handle })).filter((p) => p.mode !== 0),
    terminate: () => peer.call('foreign.terminate', { unit: d.handle }),
  };
}
/** The same driver over a unit object in this process (our CoUnit, or any JS object with the ICapeUnit shape). */
export function localUnitDriver(u) {
  return {
    name: u.ComponentName, ports: u.ports.items.map((p) => ({ name: p.ComponentName, direction: p.direction, type: p.portType })),
    parameters: u.parameters.items.map((p) => ({ name: p.ComponentName, mode: p.Mode, value: p.value })),
    connect: (port, m) => u.ports.Item(port).Connect(m), setParameter: (n, v) => { u.parameters.Item(n).value = v; },
    validate: () => u.Validate(), calculate: () => u.Calculate(),
    outputs: () => u.parameters.items.filter((p) => p.Mode !== 0).map((p) => ({ name: p.ComponentName, mode: p.Mode, value: p.value })),
    terminate: () => u.Terminate(),
  };
}
