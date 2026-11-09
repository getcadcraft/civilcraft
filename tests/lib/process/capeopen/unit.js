/* SPDX-License-Identifier: Apache-2.0 */
/**
 * unit.js — our unit operations (lib/process/stream.js UNITS) as CAPE-OPEN 1.1 unit operations (0.9 IND.3). DOM-free.
 *
 *   new CoUnit(type, opts)    ICapeIdentification · ICapeUnit (ports, ValStatus, Validate, Calculate) · ICapeUtilities (parameters,
 *                             simulationContext, Initialize, Terminate, Edit) · ICapeUnitReport (reports, selectedReport, ProduceReport)
 *                             · persistence (Save → text, Load(text), InitNew, IsDirty: what the shim's IPersistStreamInit stores)
 *   CoCollection              ICapeCollection: Item(name | 1-based index), Count()
 *   CoParameter               ICapeParameter + ICapeParameterSpec + ICapeRealParameterSpec / ICapeOptionParameterSpec
 *   CoPort                    ICapeUnitPort: portType, direction, connectedObject, Connect, Disconnect
 *   UNIT_SPECS                which of our types are offered, their ports and parameters (SI)
 *
 * opts.thermo: 'host' (default; the simulator's thermo through the inlet material, mthermo.js: the CAPE-OPEN way) or 'own' (our package
 * from opts.package, compounds matched by CAS number, id or name; the outlets are then flashed by the host at our T and P, because the two
 * packages' enthalpy references differ).
 * JS binding: Validate() returns { valid, message } where COM returns the boolean and the message as [out].
 */
import { UNITS, fromFlash } from '../stream.js';
import { Thermo } from '../thermo.js';
import { COMPONENTS } from '../data.js';
import { MaterialThermo } from './mthermo.js';
import { CapeError, asCape } from './errors.js';
import { PORT_TYPE, PORT_DIR, PARAM_MODE, PARAM_TYPE, VALIDATION, DIM, CAS } from './names.js';

const real = (name, desc, dim, dflt, lo, hi, mode = PARAM_MODE.CAPE_INPUT) => ({ kind: 'real', name, desc, dim, dflt, lo, hi, mode });
const option = (name, desc, list, dflt) => ({ kind: 'option', name, desc, list, dflt, mode: PARAM_MODE.CAPE_INPUT });
const OUT_Q = real('HeatDuty', 'Heat added to the fluid (W)', DIM.W, 0, -Infinity, Infinity, PARAM_MODE.CAPE_OUTPUT);
const OUT_W = real('Work', 'Shaft work added to the fluid (W)', DIM.W, 0, -Infinity, Infinity, PARAM_MODE.CAPE_OUTPUT);

/** Ports: [name, direction]; params map to our unit's p: { CO name: our key }. `toP(params)` builds the p object of stream.js. */
export const UNIT_SPECS = {
  heater: {
    title: 'Heater / cooler', ports: (o) => [['Feed', 0], ['Product', 1]],
    params: [option('Specification', 'What is given', ['OutletTemperature', 'TemperatureChange', 'VapourFraction', 'HeatDuty'], 'OutletTemperature'),
      real('OutletTemperature', 'Outlet temperature (K)', DIM.T, 350, 1, 5000), real('TemperatureChange', 'Temperature change (K)', DIM.T, 10, -5000, 5000),
      real('VapourFraction', 'Outlet vapour fraction (mole)', DIM.none, 1, 0, 1), real('HeatInput', 'Heat input (W)', DIM.W, 0, -1e12, 1e12),
      real('PressureDrop', 'Pressure drop (Pa)', DIM.P, 0, 0, 1e9), OUT_Q],
    toP: (v) => ({ dP: v.PressureDrop, ...({ OutletTemperature: { Tout: v.OutletTemperature }, TemperatureChange: { dT: v.TemperatureChange }, VapourFraction: { vf: v.VapourFraction }, HeatDuty: { duty: v.HeatInput } })[v.Specification] }),
  },
  valve: { title: 'Valve', ports: () => [['Feed', 0], ['Product', 1]], params: [real('OutletPressure', 'Outlet pressure (Pa)', DIM.P, 1e5, 1, 1e10)], toP: (v) => ({ Pout: v.OutletPressure }) },
  pump: { title: 'Pump', ports: () => [['Feed', 0], ['Product', 1]], params: [real('OutletPressure', 'Outlet pressure (Pa)', DIM.P, 5e5, 1, 1e10), real('Efficiency', 'Efficiency', DIM.none, 0.75, 0.01, 1), OUT_W], toP: (v) => ({ Pout: v.OutletPressure, eff: v.Efficiency }) },
  compressor: { title: 'Compressor / expander', ports: () => [['Feed', 0], ['Product', 1]], params: [real('OutletPressure', 'Outlet pressure (Pa)', DIM.P, 5e5, 1, 1e10), real('Efficiency', 'Isentropic efficiency', DIM.none, 0.75, 0.01, 1), OUT_W], toP: (v) => ({ Pout: v.OutletPressure, eff: v.Efficiency }) },
  flash: {
    title: 'Flash drum', ports: () => [['Feed', 0], ['Vapour', 1], ['Liquid', 1]],
    params: [option('Specification', 'What is given', ['Temperature', 'HeatDuty', 'VapourFraction'], 'HeatDuty'), real('Pressure', 'Drum pressure (Pa)', DIM.P, 1e5, 1, 1e10),
      real('Temperature', 'Drum temperature (K)', DIM.T, 300, 1, 5000), real('HeatInput', 'Heat input (W)', DIM.W, 0, -1e12, 1e12), real('VapourFraction', 'Vapour fraction (mole)', DIM.none, 0.5, 0, 1), OUT_Q],
    toP: (v) => ({ P: v.Pressure, ...({ Temperature: { T: v.Temperature }, HeatDuty: { duty: v.HeatInput }, VapourFraction: { vf: v.VapourFraction } })[v.Specification] }),
  },
  mixer: { title: 'Mixer', ports: (o) => [...Array.from({ length: o.inlets || 2 }, (_, i) => ['Feed' + (i + 1), 0]), ['Product', 1]], params: [], toP: () => ({}) },
  splitter: {
    title: 'Splitter', ports: (o) => [['Feed', 0], ...Array.from({ length: o.outlets || 2 }, (_, i) => ['Product' + (i + 1), 1])],
    params: (o) => Array.from({ length: o.outlets || 2 }, (_, i) => real('Fraction' + (i + 1), 'Fraction to product ' + (i + 1), DIM.none, 1 / (o.outlets || 2), 0, 1)),
    toP: (v, o) => ({ fractions: Array.from({ length: o.outlets || 2 }, (_, i) => v['Fraction' + (i + 1)]) }),
  },
  hx: {
    title: 'Two-stream heat exchanger', ports: () => [['HotInlet', 0], ['ColdInlet', 0], ['HotOutlet', 1], ['ColdOutlet', 1]],
    params: [option('Specification', 'What is given', ['HotOutletTemperature', 'ColdOutletTemperature', 'Duty'], 'HotOutletTemperature'),
      real('HotOutletTemperature', 'Hot outlet temperature (K)', DIM.T, 320, 1, 5000), real('ColdOutletTemperature', 'Cold outlet temperature (K)', DIM.T, 320, 1, 5000),
      real('Duty', 'Heat moved from hot to cold (W)', DIM.W, 1e5, 0, 1e12), real('HotPressureDrop', 'Hot side pressure drop (Pa)', DIM.P, 0, 0, 1e9), real('ColdPressureDrop', 'Cold side pressure drop (Pa)', DIM.P, 0, 0, 1e9),
      real('DutyResult', 'Heat moved (W)', DIM.W, 0, -Infinity, Infinity, PARAM_MODE.CAPE_OUTPUT)],
    toP: (v) => ({ dPhot: v.HotPressureDrop, dPcold: v.ColdPressureDrop, ...({ HotOutletTemperature: { hotOutT: v.HotOutletTemperature }, ColdOutletTemperature: { coldOutT: v.ColdOutletTemperature }, Duty: { duty: v.Duty } })[v.Specification] }),
  },
};
export const UNIT_TYPES_OFFERED = Object.keys(UNIT_SPECS);

export class CoCollection {
  constructor(items, name = 'collection') { this.items = items; this.ComponentName = name; this.ComponentDescription = ''; }
  Count() { return this.items.length; }
  /** id: the item's ComponentName or its 1-based index (as CAPE-OPEN collections are indexed). */
  Item(id) {
    const it = typeof id === 'number' ? this.items[id - 1] : this.items.find((x) => x.ComponentName === id);
    if (!it) throw new CapeError('ECapeInvalidArgument', 'no item ' + id + ' in ' + this.ComponentName, { interface: 'ICapeCollection', operation: 'Item' });
    return it;
  }
}

export class CoParameter {
  constructor(def) {
    this.def = def; this.ComponentName = def.name; this.ComponentDescription = def.desc || '';
    this.Mode = def.mode; this.ValStatus = VALIDATION.CAPE_NOT_VALIDATED; this._value = def.dflt;
    this.Specification = def.kind === 'real'
      ? { Type: PARAM_TYPE.CAPE_REAL, Dimensionality: def.dim.slice(), DefaultValue: def.dflt, LowerBound: def.lo, UpperBound: def.hi }
      : { Type: PARAM_TYPE.CAPE_OPTION, DefaultValue: def.dflt, OptionList: def.list.slice(), RestrictedToList: true };
    this.onChange = null;
  }
  get value() { return this._value; }
  set value(v) {
    if (this.Mode === PARAM_MODE.CAPE_OUTPUT && !this._internal) throw new CapeError('ECapeInvalidOperation', this.ComponentName + ' is a result, it cannot be set', { interface: 'ICapeParameter', operation: 'put_value' });
    this._value = v; this.ValStatus = VALIDATION.CAPE_NOT_VALIDATED; if (this.onChange) this.onChange(this);
  }
  setResult(v) { this._internal = true; try { this.value = v; } finally { this._internal = false; } this.ValStatus = VALIDATION.CAPE_VALID; }
  /** → { valid, message } */
  Validate() {
    const v = this._value, s = this.Specification; let msg = '';
    if (s.Type === PARAM_TYPE.CAPE_REAL) { if (typeof v !== 'number' || !Number.isFinite(v)) msg = this.ComponentName + ' must be a number'; else if (v < s.LowerBound || v > s.UpperBound) msg = `${this.ComponentName} must be between ${s.LowerBound} and ${s.UpperBound}`; }
    else if (!s.OptionList.includes(v)) msg = `${this.ComponentName} must be one of ${s.OptionList.join(', ')}`;
    this.ValStatus = msg ? VALIDATION.CAPE_INVALID : VALIDATION.CAPE_VALID;
    return { valid: !msg, message: msg };
  }
  Reset() { this._value = this.def.dflt; this.ValStatus = VALIDATION.CAPE_NOT_VALIDATED; }
}

export class CoPort {
  constructor(name, direction, owner) { this.ComponentName = name; this.ComponentDescription = (direction === PORT_DIR.CAPE_INLET ? 'inlet ' : 'outlet ') + name; this.portType = PORT_TYPE.CAPE_MATERIAL; this.direction = direction; this.connectedObject = null; this.owner = owner; }
  Connect(obj) {
    if (!obj || typeof obj.GetOverallProp !== 'function') throw new CapeError('ECapeInvalidArgument', 'a material port connects to a CAPE-OPEN 1.1 material object', { interface: 'ICapeUnitPort', operation: 'Connect' });
    this.connectedObject = obj; this.owner.ValStatus = VALIDATION.CAPE_NOT_VALIDATED;
  }
  Disconnect() { this.connectedObject = null; this.owner.ValStatus = VALIDATION.CAPE_NOT_VALIDATED; }
}

/** Our components by CAS number, id or name (for 'own' thermo inside a simulator). */
function ourComponentFor(compId, cas, name) {
  if (cas) for (const [id, c] of Object.entries(CAS)) if (c === cas) return id;
  const k = String(compId || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  for (const [id, c] of Object.entries(COMPONENTS)) if (id === k || String(c.name).toLowerCase().replace(/[^a-z0-9]/g, '') === k || String(c.name).toLowerCase().replace(/[^a-z0-9]/g, '') === String(name || '').toLowerCase().replace(/[^a-z0-9]/g, '')) return id;
  return null;
}

export class CoUnit {
  /** type: a key of UNIT_SPECS; opts: { inlets, outlets, thermo: 'host'|'own', package: thermo options for 'own', name } */
  constructor(type, opts = {}) {
    const spec = UNIT_SPECS[type]; if (!spec) throw new CapeError('ECapeInvalidArgument', 'no CAPE-OPEN unit of type ' + type, { interface: 'ICapeUnit', operation: 'create' });
    this.type = type; this.spec = spec; this.opts = { ...opts };
    this.ComponentName = opts.name || ('CadCraft ' + spec.title); this.ComponentDescription = 'CadCraft process engine: ' + spec.title.toLowerCase();
    this.ValStatus = VALIDATION.CAPE_NOT_VALIDATED; this.simulationContext = null; this.dirty = false; this.lastReport = '';
    this.ports = new CoCollection(spec.ports(this.opts).map(([n, d]) => new CoPort(n, d, this)), 'Ports');
    const defs = typeof spec.params === 'function' ? spec.params(this.opts) : spec.params;
    this.parameters = new CoCollection(defs.map((d) => { const p = new CoParameter(d); p.onChange = () => { this.ValStatus = VALIDATION.CAPE_NOT_VALIDATED; this.dirty = true; }; return p; }), 'Parameters');
    this.reports = ['Summary']; this.selectedReport = 'Summary';
  }
  Initialize() {} Terminate() { for (const p of this.ports.items) p.connectedObject = null; }
  Edit() { throw new CapeError('ECapeNoImpl', 'edit the parameters in the simulator\'s parameter table; there is no separate window yet', { interface: 'ICapeUtilities', operation: 'Edit' }); }
  _values() { return Object.fromEntries(this.parameters.items.filter((p) => p.Mode !== PARAM_MODE.CAPE_OUTPUT).map((p) => [p.ComponentName, p.value])); }
  Validate() {
    let msg = '';
    for (const p of this.parameters.items) if (p.Mode !== PARAM_MODE.CAPE_OUTPUT) { const r = p.Validate(); if (!r.valid) { msg = r.message; break; } }
    if (!msg) for (const port of this.ports.items) if (!port.connectedObject && (port.direction === PORT_DIR.CAPE_OUTLET || this.type !== 'mixer')) { msg = 'port ' + port.ComponentName + ' is not connected'; break; }
    if (!msg && this.type === 'mixer' && !this.ports.items.some((p) => p.direction === PORT_DIR.CAPE_INLET && p.connectedObject)) msg = 'connect at least one feed';
    if (!msg && this.opts.thermo === 'own') { try { this._ownThermo(); } catch (e) { msg = e.message; } }
    this.ValStatus = msg ? VALIDATION.CAPE_INVALID : VALIDATION.CAPE_VALID;
    return { valid: !msg, message: msg };
  }
  _ownThermo() {
    const mat = this.ports.items.find((p) => p.connectedObject)?.connectedObject; if (!mat) throw new Error('nothing is connected');
    const cl = mat.GetCompoundList(), ids = cl.compIds.map((id, i) => { const o = ourComponentFor(id, cl.casnos?.[i], cl.names?.[i]); if (!o) throw new Error(`compound ${id} is not in CadCraft's data: use the simulator's thermo (Thermo = host)`); return o; });
    return new Thermo({ ...(this.opts.package || { model: 'pr' }), components: ids });
  }
  _readInlet(th, mat, own) {
    const F = mat.GetOverallProp('totalFlow', 'Mole')[0], z = mat.GetOverallProp('fraction', 'Mole'), T = mat.GetOverallProp('temperature', '')[0], P = mat.GetOverallProp('pressure', '')[0];
    if (!(F > 0)) return { id: '', F: 0, z, T, P, H: 0, S: 0, vf: 0, state: 'empty', phases: [] };
    let H = null; if (!own) { try { H = mat.GetOverallProp('enthalpy', 'Mole')[0]; } catch { H = null; } }
    const fl = H != null ? (th.flashPH(P, H, z, T) || th.flashPT(T, P, z)) : th.flashPT(T, P, z);
    return fromFlash(F, fl);
  }
  _writeOutlet(mat, s, own) {
    mat.SetOverallProp('totalFlow', 'Mole', [s.F > 0 ? s.F : 0]); mat.SetOverallProp('fraction', 'Mole', s.z.slice());
    mat.SetOverallProp('pressure', '', [s.P]); mat.SetOverallProp('temperature', '', [s.T]);
    const labels = mat.GetPhaseList().phaseLabels; mat.SetPresentPhases(labels, labels.map(() => 0));
    if (!own && s.F > 0) { mat.SetOverallProp('enthalpy', 'Mole', [s.H]); mat.CalcEquilibrium(['pressure', '', 'Overall'], ['enthalpy', 'Mole', 'Overall'], 'Unspecified'); }
    else mat.CalcEquilibrium(['temperature', '', 'Overall'], ['pressure', '', 'Overall'], 'Unspecified');
  }
  Calculate() {
    if (this.ValStatus !== VALIDATION.CAPE_VALID) { const r = this.Validate(); if (!r.valid) throw new CapeError('ECapeBadInvOrder', 'the unit is not valid: ' + r.message, { interface: 'ICapeUnit', operation: 'Calculate' }); }
    const own = this.opts.thermo === 'own', inPorts = this.ports.items.filter((p) => p.direction === PORT_DIR.CAPE_INLET), outPorts = this.ports.items.filter((p) => p.direction === PORT_DIR.CAPE_OUTLET);
    const firstMat = inPorts.find((p) => p.connectedObject)?.connectedObject;
    let th; try { th = own ? this._ownThermo() : new MaterialThermo(firstMat); } catch (e) { throw asCape(e, 'ECapeFailedInitialisation', 'ICapeUnit', 'Calculate'); }
    let r;
    try {
      const ins = inPorts.filter((p) => p.connectedObject).map((p) => this._readInlet(th, p.connectedObject, own));
      r = UNITS[this.type](th, ins, this.spec.toP(this._values(), this.opts));
      outPorts.forEach((p, k) => this._writeOutlet(p.connectedObject, r.outs[k], own));
    } catch (e) { throw asCape(e, 'ECapeSolvingError', 'ICapeUnit', 'Calculate'); }
    const set = (name, v) => { const p = this.parameters.items.find((x) => x.ComponentName === name); if (p && Number.isFinite(v)) p.setResult(v); };
    set('HeatDuty', r.Q); set('Work', r.W); set('DutyResult', r.duty);
    this.last = { Q: r.Q, W: r.W, notes: r.notes || [], outs: r.outs.map((s) => ({ F: s.F, T: s.T, P: s.P, z: s.z })) };
    this.lastReport = this._report(); return this.last;
  }
  _report() {
    const L = [this.ComponentName, 'Thermo: ' + (this.opts.thermo === 'own' ? 'CadCraft package' : 'the simulator\'s package')];
    for (const p of this.parameters.items) L.push(`${p.ComponentName} = ${p.value}`);
    if (this.last) { this.last.outs.forEach((s, k) => L.push(`out ${k + 1}: F ${s.F.toPrecision(6)} mol/s, T ${s.T.toFixed(3)} K, P ${s.P.toPrecision(6)} Pa`)); for (const n of this.last.notes) L.push('note: ' + n); }
    return L.join('\n');
  }
  ProduceReport() { return this.lastReport || this._report(); }
  // ---- persistence (IPersistStreamInit in the shim stores this text, UTF-8, length first) -------------------------------------
  Save() { this.dirty = false; return JSON.stringify({ format: 'cadcraft-capeopen-unit', version: 1, type: this.type, opts: this.opts, params: this._values() }); }
  Load(text) {
    let o; try { o = JSON.parse(text); } catch { o = null; }
    if (!o || o.format !== 'cadcraft-capeopen-unit' || o.type !== this.type) throw new CapeError('ECapePersistenceNotFound', 'this saved unit is not a CadCraft ' + this.type, { interface: 'IPersistStreamInit', operation: 'Load' });
    for (const [k, v] of Object.entries(o.params || {})) { const p = this.parameters.items.find((x) => x.ComponentName === k); if (p) p.value = v; }
    this.dirty = false;
  }
  InitNew() { for (const p of this.parameters.items) p.Reset(); this.dirty = false; }
  IsDirty() { return this.dirty; }
}
/** Make a unit from its saved text (the shim's Load when the class is not yet known). */
export function unitFromSaved(text) { const o = JSON.parse(text); const u = new CoUnit(o.type, o.opts || {}); u.Load(text); return u; }
