/* SPDX-License-Identifier: Apache-2.0 */
/**
 * material.js — a CAPE-OPEN 1.1 material object in JavaScript (ICapeThermoMaterial, plus the property, equilibrium, compound and phase
 * calls a 1.1 material forwards to its property package). 0.9 IND.3; DOM-free.
 *
 * It is the material in three places:
 *   - our flowsheet hands one to a foreign CAPE-OPEN unit for each port (foreign.js; over the pipe the COM shim forwards the unit's calls here),
 *   - the tests play a simulator with it (a simulator would use its own material object, and our package must work on any 1.1 material),
 *   - scratch materials for MaterialThermo (mthermo.js).
 *
 * JavaScript binding of the COM calls: method names are the interface's; [in] arguments in the interface's order; [out] arguments are the
 * return value (an object when there are several, keyed by the IDL's argument names). Values are plain arrays of numbers.
 * Stored values keep their basis; a Mass read of a value stored per Mole (or the other way round) is converted with the compounds' molecular
 * weights from the package. A value that was never set throws ECapeThrmPropertyNotAvailable, as the standard asks.
 */
import { CapeError } from './errors.js';
import { OVERALL, PHASE_STATUS } from './names.js';

const IFACE = 'ICapeThermoMaterial';
// per amount: value per mol <-> per kg; flows: mol/s <-> kg/s; density mol/m3 <-> kg/m3 (the inverse way)
const PER_AMOUNT = new Set(['enthalpy', 'entropy', 'gibbsEnergy', 'volume', 'heatCapacityCp', 'heatCapacityCv', 'internalEnergy', 'helmholtzEnergy']);

export class CoMaterial {
  /** pp: the property package this material belongs to (anything with the ICapeThermo* calls and SetMaterial). */
  constructor(pp, name = 'material') {
    this.pp = pp; this.ComponentName = name; this.ComponentDescription = 'CadCraft material object';
    this.ClearAllProps(); this.present = { phaseLabels: [], phaseStatus: [] };
  }
  // ---- helpers -----------------------------------------------------------------------------------------------------------------
  _mws() { return this.pp.GetCompoundList().molwts.map((w) => w / 1000); }       // kg/mol
  _bag(label) { if (!this.props.has(label)) this.props.set(label, new Map()); return this.props.get(label); }
  _fractionMole(label) { const b = this.props.get(label); const v = b && (b.get('fraction|Mole')); if (v) return v; const m = b && b.get('fraction|Mass'); if (!m) return null; const w = this._mws(); const n = m.map((v, i) => v / w[i]); const s = n.reduce((a, c) => a + c, 0); return n.map((v) => v / s); }
  _mwMix(label) { const x = this._fractionMole(label); if (!x) return null; const w = this._mws(); return x.reduce((s, v, i) => s + v * w[i], 0); }
  _get(prop, label, basis) {
    const b = this.props.get(label), key = prop + '|' + (basis || '');
    if (b && b.has(key)) return b.get(key).slice();
    if (basis === 'Mole' || basis === 'Mass') {
      const other = basis === 'Mole' ? 'Mass' : 'Mole', o = b && b.get(prop + '|' + other);
      if (o) {
        if (prop === 'fraction') { const w = this._mws(); if (basis === 'Mass') { const m = o.map((v, i) => v * w[i]); const s = m.reduce((a, c) => a + c, 0); return m.map((v) => v / s); } const n = o.map((v, i) => v / w[i]); const s = n.reduce((a, c) => a + c, 0); return n.map((v) => v / s); }
        if (prop === 'flow') { const w = this._mws(); return o.map((v, i) => (basis === 'Mass' ? v * w[i] : v / w[i])); }
        const mw = this._mwMix(label);
        if (mw) {
          if (prop === 'totalFlow') return o.map((v) => (basis === 'Mass' ? v * mw : v / mw));
          if (PER_AMOUNT.has(prop)) return o.map((v) => (basis === 'Mass' ? v / mw : v * mw));
          if (prop === 'density') return o.map((v) => (basis === 'Mass' ? v * mw : v / mw));
        }
      }
      // flow <-> totalFlow × fraction
      if (prop === 'flow') { const F = b && (b.get('totalFlow|' + basis) || null); const x = basis === 'Mole' ? this._fractionMole(label) : (b && b.get('fraction|Mass')); if (F && x) return x.map((v) => v * F[0]); }
      if (prop === 'totalFlow') { const f = b && b.get('flow|' + basis); if (f) return [f.reduce((a, c) => a + c, 0)]; }
      if (prop === 'fraction') { const f = b && b.get('flow|' + basis); if (f) { const s = f.reduce((a, c) => a + c, 0); return f.map((v) => v / s); } }
    }
    throw new CapeError('ECapeThrmPropertyNotAvailable', `${prop} (${basis || 'no basis'}) of ${label} is not set on this material`, { interface: IFACE, operation: 'Get' });
  }
  _set(prop, label, basis, values) {
    if (!Array.isArray(values) || values.some((v) => typeof v !== 'number' || Number.isNaN(v))) throw new CapeError('ECapeInvalidArgument', `${prop}: values must be numbers`, { interface: IFACE, operation: 'Set' });
    const b = this._bag(label);
    // a new value in one basis replaces the old one in the other
    if (basis === 'Mole' || basis === 'Mass') b.delete(prop + '|' + (basis === 'Mole' ? 'Mass' : 'Mole'));
    b.set(prop + '|' + (basis || ''), values.slice());
  }

  // ---- ICapeThermoMaterial ----------------------------------------------------------------------------------------------------
  ClearAllProps() { this.props = new Map(); this.present = { phaseLabels: [], phaseStatus: [] }; }
  CopyFromMaterial(src) {
    this.ClearAllProps();
    for (const [label, b] of src.props) this.props.set(label, new Map([...b].map(([k, v]) => [k, v.slice()])));
    this.present = { phaseLabels: src.present.phaseLabels.slice(), phaseStatus: src.present.phaseStatus.slice() };
  }
  /** Not a CO call: drops every single-phase and two-phase value (writeEquilibrium uses it; a simulator's material does this itself). */
  ClearPhaseProps() { for (const l of [...this.props.keys()]) if (l !== OVERALL) this.props.delete(l); }
  CreateMaterial() { return new CoMaterial(this.pp, this.ComponentName + '+'); }
  GetOverallProp(property, basis) { return this._get(property, OVERALL, basis); }
  GetOverallTPFraction() { return { temperature: this._get('temperature', OVERALL, '')[0], pressure: this._get('pressure', OVERALL, '')[0], composition: this._get('fraction', OVERALL, 'Mole') }; }
  GetPresentPhases() { return { phaseLabels: this.present.phaseLabels.slice(), phaseStatus: this.present.phaseStatus.slice() }; }
  GetSinglePhaseProp(property, phaseLabel, basis) { this._known(phaseLabel, 'GetSinglePhaseProp'); return this._get(property, phaseLabel, basis); }
  GetTPFraction(phaseLabel) { this._known(phaseLabel, 'GetTPFraction'); return { temperature: this._get('temperature', phaseLabel, '')[0], pressure: this._get('pressure', phaseLabel, '')[0], composition: this._get('fraction', phaseLabel, 'Mole') }; }
  GetTwoPhaseProp(property, phaseLabels, basis) { return this._get(property, phaseLabels.join('/'), basis); }
  SetOverallProp(property, basis, values) { this._set(property, OVERALL, basis, values); }
  SetPresentPhases(phaseLabels, phaseStatus) {
    const known = this.pp.GetPhaseList().phaseLabels;
    for (const l of phaseLabels) if (!known.includes(l)) throw new CapeError('ECapeInvalidArgument', `phase ${l} is not one of the package's phases (${known.join(', ')})`, { interface: IFACE, operation: 'SetPresentPhases' });
    const st = phaseStatus && phaseStatus.length === phaseLabels.length ? phaseStatus.slice() : phaseLabels.map(() => PHASE_STATUS.CAPE_UNKNOWNPHASESTATUS);
    // phases no longer present lose their values
    for (const l of [...this.props.keys()]) if (l !== OVERALL && !l.includes('/') && !phaseLabels.includes(l)) this.props.delete(l);
    this.present = { phaseLabels: phaseLabels.slice(), phaseStatus: st };
  }
  SetSinglePhaseProp(property, phaseLabel, basis, values) { this._known(phaseLabel, 'SetSinglePhaseProp'); this._set(property, phaseLabel, basis, values); }
  SetTwoPhaseProp(property, phaseLabels, basis, values) { this._set(property, phaseLabels.join('/'), basis, values); }
  _known(label, op) { if (!this.present.phaseLabels.includes(label)) throw new CapeError('ECapeInvalidArgument', `phase ${label} is not present on this material`, { interface: IFACE, operation: op }); }

  // ---- what a 1.1 material forwards to its package ------------------------------------------------------------------------------
  _with(fn) { this.pp.SetMaterial(this); try { return fn(); } finally { this.pp.UnsetMaterial(); } }
  GetCompoundList() { return this.pp.GetCompoundList(); }
  GetNumCompounds() { return this.pp.GetNumCompounds(); }
  GetCompoundConstant(props, compIds) { return this.pp.GetCompoundConstant(props, compIds); }
  GetConstPropList() { return this.pp.GetConstPropList(); }
  GetTDependentProperty(props, T, compIds) { return this.pp.GetTDependentProperty(props, T, compIds); }
  GetPhaseList() { return this.pp.GetPhaseList(); }
  GetNumPhases() { return this.pp.GetNumPhases(); }
  GetPhaseInfo(label, attr) { return this.pp.GetPhaseInfo(label, attr); }
  GetSinglePhasePropList() { return this.pp.GetSinglePhasePropList(); }
  GetTwoPhasePropList() { return this.pp.GetTwoPhasePropList(); }
  GetUniversalConstant(name) { return this.pp.GetUniversalConstant(name); }
  CheckSinglePhasePropSpec(prop, label) { return this.pp.CheckSinglePhasePropSpec(prop, label); }
  CheckEquilibriumSpec(s1, s2, type) { return this._with(() => this.pp.CheckEquilibriumSpec(s1, s2, type)); }
  CalcSinglePhaseProp(props, phaseLabel) { return this._with(() => this.pp.CalcSinglePhaseProp(props, phaseLabel)); }
  CalcTwoPhaseProp(props, phaseLabels) { return this._with(() => this.pp.CalcTwoPhaseProp(props, phaseLabels)); }
  CalcEquilibrium(spec1, spec2, solutionType = 'Unspecified') { return this._with(() => this.pp.CalcEquilibrium(spec1, spec2, solutionType)); }

  /** A plain snapshot (for the pipe and for tests): { props: { label: { 'prop|basis': [..] } }, present }. */
  snapshot() { return { props: Object.fromEntries([...this.props].map(([l, b]) => [l, Object.fromEntries(b)])), present: this.GetPresentPhases() }; }
  static fromSnapshot(pp, snap, name) { const m = new CoMaterial(pp, name); for (const [l, b] of Object.entries(snap?.props || {})) m.props.set(l, new Map(Object.entries(b).map(([k, v]) => [k, v.slice()]))); if (snap?.present) m.present = { phaseLabels: snap.present.phaseLabels.slice(), phaseStatus: snap.present.phaseStatus.slice() }; return m; }
}
