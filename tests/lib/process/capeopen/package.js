/* SPDX-License-Identifier: Apache-2.0 */
/**
 * package.js — our thermo (lib/process/thermo.js: PR, SRK, ideal, NRTL, Wilson, UNIQUAC) as a CAPE-OPEN 1.1 property package (0.9 IND.3).
 *
 *   new CoPropertyPackage(thermoOpts | Thermo, { name, description })
 *     ICapeIdentification            ComponentName, ComponentDescription
 *     ICapeUtilities                 Initialize, Terminate, Edit (ECapeNoImpl), parameters ([]), simulationContext
 *     ICapeThermoMaterialContext     SetMaterial, UnsetMaterial
 *     ICapeThermoCompounds           GetCompoundList, GetNumCompounds, GetCompoundConstant, GetConstPropList, GetTDependentProperty,
 *                                    GetTDependentPropList, GetPDependentProperty, GetPDependentPropList
 *     ICapeThermoPhases              GetNumPhases, GetPhaseList, GetPhaseInfo
 *     ICapeThermoPropertyRoutine     CalcSinglePhaseProp, CalcTwoPhaseProp, CalcAndGetLnPhi, CheckSinglePhasePropSpec, CheckTwoPhasePropSpec,
 *                                    GetSinglePhasePropList, GetTwoPhasePropList
 *     ICapeThermoEquilibriumRoutine  CalcEquilibrium, CheckEquilibriumSpec
 *     ICapeThermoUniversalConstant   GetUniversalConstant, GetUniversalConstantList
 *   new CoPropertyPackageManager([{ name, thermo }])   ICapeThermoPropertyPackageManager: GetPropertyPackageList, GetPropertyPackage
 *
 * Values are written on the material per Mole (or with no basis); the material converts to Mass when asked. Equilibrium specifications
 * supported: T+P, P+H, P+S, P+phaseFraction(Vapor), T+phaseFraction(Vapor) (either order). Anything else answers ECapeLimitedImpl.
 * Fugacity coefficients of an activity-model liquid are gamma-phi (gamma Psat / P, no Poynting term) and of its vapour 1 (ideal gas),
 * as thermo.js's K-values are.
 */
import { Thermo } from '../thermo.js';
import { CapeError, asCape } from './errors.js';
import { PHASES, OVERALL, PHASE_STATUS, SINGLE_PHASE_PROPS, TWO_PHASE_PROPS, CONST_PROPS, TDEP_PROPS, UNIVERSAL, CAS } from './names.js';

const R = 8.314462618;
const IC = 'ICapeThermoCompounds', IP = 'ICapeThermoPropertyRoutine', IE = 'ICapeThermoEquilibriumRoutine', IPh = 'ICapeThermoPhases';
const lower = (s) => String(s || '').trim();
const isAct = (th) => !th.eos && th.model !== 'ideal';

export class CoPropertyPackage {
  constructor(thermo, opts = {}) {
    this.th = thermo instanceof Thermo ? thermo : new Thermo(thermo);
    this.ComponentName = opts.name || ('CadCraft ' + this.th.model.toUpperCase());
    this.ComponentDescription = opts.description || 'CadCraft process engine property package (' + this.th.model + ')';
    this.material = null; this.parameters = []; this.simulationContext = null;
    this.phaseLabels = isAct(this.th) ? ['Vapor', 'Liquid', 'Liquid2'] : ['Vapor', 'Liquid'];
    this.cas = Object.fromEntries(this.th.c.map((c) => [c.id, c.cas || CAS[c.id] || '']));
  }
  // ---- ICapeUtilities / context --------------------------------------------------------------------------------------------------
  Initialize() {} Terminate() { this.material = null; }
  Edit() { throw new CapeError('ECapeNoImpl', 'the package is edited in CadCraft (Process model), not from the simulator', { interface: 'ICapeUtilities', operation: 'Edit' }); }
  SetMaterial(m) { this.material = m; }
  UnsetMaterial() { this.material = null; }
  _mat(op) { if (!this.material) throw new CapeError('ECapeBadInvOrder', 'no material: call SetMaterial first', { interface: IP, operation: op }); return this.material; }

  // ---- ICapeThermoCompounds ------------------------------------------------------------------------------------------------------
  GetCompoundList() {
    const c = this.th.c;
    return { compIds: this.th.ids.slice(), formulae: c.map((x) => x.formula || ''), names: c.map((x) => x.name || x.id), boilTemps: c.map((x) => x.Tb ?? NaN), molwts: c.map((x) => x.MW), casnos: c.map((x) => this.cas[x.id]) };
  }
  GetNumCompounds() { return this.th.n; }
  GetConstPropList() { return Object.keys(CONST_PROPS); }
  _idx(compIds, op, iface = IC) { if (compIds == null || compIds.length === 0) return this.th.ids.map((_, i) => i); return compIds.map((id) => { const i = this.th.ids.indexOf(id); if (i < 0) throw new CapeError('ECapeInvalidArgument', 'unknown compound ' + id, { interface: iface, operation: op }); return i; }); }
  /** Values in the order: for each compound (compIds order), each property (props order). Missing values are null (VT_EMPTY in COM). */
  GetCompoundConstant(props, compIds) {
    const ix = this._idx(compIds, 'GetCompoundConstant'), out = [];
    for (const p of props) if (!CONST_PROPS[p]) throw new CapeError('ECapeThrmPropertyNotAvailable', 'constant ' + p + ' is not offered', { interface: IC, operation: 'GetCompoundConstant' });
    for (const i of ix) for (const p of props) out.push(p === 'casRegistryNumber' ? (this.cas[this.th.ids[i]] || null) : CONST_PROPS[p](this.th.c[i]));
    return out;
  }
  GetTDependentPropList() { return TDEP_PROPS.slice(); }
  GetPDependentPropList() { return []; }
  GetPDependentProperty(props) { throw new CapeError('ECapeThrmPropertyNotAvailable', 'no pressure-dependent compound properties are offered (' + props.join(', ') + ')', { interface: IC, operation: 'GetPDependentProperty' }); }
  /** for each compound, each property, at temperature T (K). */
  GetTDependentProperty(props, T, compIds) {
    const ix = this._idx(compIds, 'GetTDependentProperty'), th = this.th, out = [];
    for (const i of ix) for (const p of props) {
      if (p === 'vaporPressure') out.push(th.eos ? (th.eos.psat(i, T) ?? NaN) : th.psatIdeal(i, T));
      else if (p === 'idealGasHeatCapacity') out.push(th.cpIg(i, T));
      else if (p === 'idealGasEnthalpy') out.push(th.hIg(i, T));
      else if (p === 'idealGasEntropy') out.push(th.sIg(i, T));
      else if (p === 'heatOfVaporization') out.push(th.dHvap(i, T));
      else if (p === 'liquidVolume') out.push(th.vLiq(i, T));
      else throw new CapeError('ECapeThrmPropertyNotAvailable', 'temperature-dependent property ' + p + ' is not offered', { interface: IC, operation: 'GetTDependentProperty' });
    }
    return out;
  }

  // ---- ICapeThermoPhases ---------------------------------------------------------------------------------------------------------
  GetNumPhases() { return this.phaseLabels.length; }
  GetPhaseList() { return { phaseLabels: this.phaseLabels.slice(), stateOfAggregation: this.phaseLabels.map((l) => PHASES[l].state), keyCompoundId: this.phaseLabels.map(() => null) }; }
  GetPhaseInfo(label, attribute) {
    if (!this.phaseLabels.includes(label)) throw new CapeError('ECapeInvalidArgument', 'unknown phase ' + label, { interface: IPh, operation: 'GetPhaseInfo' });
    if (attribute === 'StateOfAggregation') return PHASES[label].state;
    if (attribute === 'KeyCompoundId' || attribute === 'ExcludedId') return null;
    if (attribute === 'DensityDescription') return label === 'Vapor' ? 'Light' : label === 'Liquid2' ? 'Heavy' : 'Light';
    if (attribute === 'UserDescription') return label === 'Liquid2' ? 'second liquid (activity models)' : label;
    if (attribute === 'TypeOfSolid') return null;
    throw new CapeError('ECapeInvalidArgument', 'unknown phase attribute ' + attribute, { interface: IPh, operation: 'GetPhaseInfo' });
  }

  // ---- ICapeThermoPropertyRoutine ------------------------------------------------------------------------------------------------
  GetSinglePhasePropList() { return Object.keys(SINGLE_PHASE_PROPS).filter((p) => p !== 'activityCoefficient' || isAct(this.th)); }
  GetTwoPhasePropList() { return Object.keys(TWO_PHASE_PROPS); }
  CheckSinglePhasePropSpec(prop, label) { return this.phaseLabels.includes(label) && this.GetSinglePhasePropList().includes(prop) && !(prop === 'activityCoefficient' && label === 'Vapor'); }
  CheckTwoPhasePropSpec(prop, labels) { return !!TWO_PHASE_PROPS[prop] && labels.length === 2 && labels.every((l) => this.phaseLabels.includes(l)); }

  /** The single-phase values at (T, P, x) of phase label: { prop: [values] } per Mole / no basis. Stateless (the pipe calls it directly). */
  phaseValues(props, label, T, P, x) {
    const th = this.th, type = PHASES[label]?.type; if (!type) throw new CapeError('ECapeInvalidArgument', 'unknown phase ' + label, { interface: IP, operation: 'CalcSinglePhaseProp' });
    const sum = x.reduce((a, c) => a + c, 0); if (!(sum > 0) || x.length !== th.n) throw new CapeError('ECapeInvalidArgument', 'the composition must have one non-negative fraction per compound', { interface: IP, operation: 'CalcSinglePhaseProp' });
    x = x.map((v) => v / sum);
    let ph; try { ph = th.phase(T, P, x, type); } catch (e) { throw asCape(e, 'ECapeComputation', IP, 'CalcSinglePhaseProp'); }
    const out = {}, mw = th.mwMix(x) * 1000;
    for (const p of props) {
      if (p === 'enthalpy') out[p] = [ph.H];
      else if (p === 'entropy') out[p] = [ph.S];
      else if (p === 'gibbsEnergy') out[p] = [ph.H - T * ph.S];
      else if (p === 'volume') out[p] = [ph.V];
      else if (p === 'density') out[p] = [1 / ph.V];
      else if (p === 'compressibilityFactor') out[p] = [ph.Z];
      else if (p === 'molecularWeight') out[p] = [mw];
      else if (p === 'heatCapacityCp') { const d = Math.max(1e-3, 1e-5 * T); out[p] = [(th.phase(T + d, P, x, type).H - th.phase(T - d, P, x, type).H) / (2 * d)]; }
      else if (p === 'logFugacityCoefficient' || p === 'fugacityCoefficient' || p === 'fugacity') {
        const lp = this.lnPhi(label, T, P, x);
        out[p] = p === 'logFugacityCoefficient' ? lp : p === 'fugacityCoefficient' ? lp.map(Math.exp) : lp.map((v, i) => Math.exp(v) * x[i] * P);
      } else if (p === 'activityCoefficient') {
        if (!isAct(th) || type === 'V') throw new CapeError('ECapeThrmPropertyNotAvailable', 'activity coefficients come from an activity model liquid only', { interface: IP, operation: 'CalcSinglePhaseProp' });
        out[p] = th.lnGamma(x, T).map(Math.exp);
      } else throw new CapeError('ECapeThrmPropertyNotAvailable', 'property ' + p + ' is not offered', { interface: IP, operation: 'CalcSinglePhaseProp' });
    }
    return out;
  }
  lnPhi(label, T, P, x) {
    const th = this.th, type = PHASES[label].type;
    if (th.eos) { const r = th.eos.roots(T, P, x), Z = type === 'L' ? r.z[0] : r.z[r.z.length - 1]; return th.eos.lnphi(T, P, x, Z, r); }
    if (type === 'V') return x.map(() => 0);
    const lg = th.lnGamma(x, T);
    return x.map((_, i) => { const H = th.henryAt(i, T); return H != null ? Math.log(H / P) : lg[i] + Math.log(th.psatIdeal(i, T) / P); });
  }
  CalcSinglePhaseProp(props, phaseLabel) {
    const m = this._mat('CalcSinglePhaseProp');
    if (phaseLabel === OVERALL) throw new CapeError('ECapeInvalidArgument', 'single-phase properties are per phase, not Overall', { interface: IP, operation: 'CalcSinglePhaseProp' });
    const { temperature: T, pressure: P, composition: x } = m.GetTPFraction(phaseLabel);
    const vals = this.phaseValues(props, phaseLabel, T, P, x);
    for (const [p, v] of Object.entries(vals)) m.SetSinglePhaseProp(p, phaseLabel, SINGLE_PHASE_PROPS[p].per.startsWith('mole') ? 'Mole' : '', v);
  }
  CalcTwoPhaseProp(props, phaseLabels) {
    const m = this._mat('CalcTwoPhaseProp');
    if (phaseLabels.length !== 2) throw new CapeError('ECapeInvalidArgument', 'two phase labels are needed', { interface: IP, operation: 'CalcTwoPhaseProp' });
    const a = m.GetTPFraction(phaseLabels[0]), b = m.GetTPFraction(phaseLabels[1]);
    const la = this.lnPhi(phaseLabels[0], a.temperature, a.pressure, a.composition), lb = this.lnPhi(phaseLabels[1], b.temperature, b.pressure, b.composition);
    // K_i = x_i(first) / x_i(second) = phi_i(second) / phi_i(first) at equal fugacity
    const lnK = la.map((v, i) => lb[i] - v);
    for (const p of props) {
      if (p === 'logKvalue') m.SetTwoPhaseProp(p, phaseLabels, '', lnK);
      else if (p === 'kvalue') m.SetTwoPhaseProp(p, phaseLabels, '', lnK.map(Math.exp));
      else throw new CapeError('ECapeThrmPropertyNotAvailable', 'two-phase property ' + p + ' is not offered', { interface: IP, operation: 'CalcTwoPhaseProp' });
    }
  }
  /** fFlags: 1 ln phi, 2 d/dT, 4 d/dP, 8 d/dn (CAPE_LOG_FUGACITY_COEFFICIENTS, CAPE_T_DERIVATIVE, CAPE_P_DERIVATIVE, CAPE_MOLE_NUMBERS_DERIVATIVES). Derivatives are central differences. */
  CalcAndGetLnPhi(phaseLabel, T, P, moleNumbers, fFlags = 1) {
    const n = moleNumbers.reduce((a, c) => a + c, 0), x = moleNumbers.map((v) => v / n), f = (TT, PP, xx) => this.lnPhi(phaseLabel, TT, PP, xx), out = {};
    if (fFlags & 1) out.lnPhi = f(T, P, x);
    if (fFlags & 2) { const d = 1e-4 * T, a = f(T + d, P, x), b = f(T - d, P, x); out.lnPhiDT = a.map((v, i) => (v - b[i]) / (2 * d)); }
    if (fFlags & 4) { const d = 1e-5 * P, a = f(T, P + d, x), b = f(T, P - d, x); out.lnPhiDP = a.map((v, i) => (v - b[i]) / (2 * d)); }
    if (fFlags & 8) {          // d ln phi_i / d n_j, row-major (i, j)
      out.lnPhiDn = []; const N = moleNumbers.length;
      const cols = [];
      for (let j = 0; j < N; j++) { const h = 1e-6 * n, up = moleNumbers.slice(), dn = moleNumbers.slice(); up[j] += h; dn[j] = Math.max(0, dn[j] - h); const s = up[j] - dn[j]; const nu = up.reduce((a, c) => a + c, 0), nd = dn.reduce((a, c) => a + c, 0); const a = f(T, P, up.map((v) => v / nu)), b = f(T, P, dn.map((v) => v / nd)); cols.push(a.map((v, i) => (v - b[i]) / s)); }
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) out.lnPhiDn.push(cols[j][i]);
    }
    return out;
  }

  // ---- ICapeThermoEquilibriumRoutine ---------------------------------------------------------------------------------------------
  _specKind(spec) {
    const [prop, basis, label] = spec || [];
    const p = lower(prop);
    if (p === 'temperature' || p === 'pressure') return (label == null || label === '' || label === OVERALL) ? p : null;
    if (p === 'enthalpy' || p === 'entropy') return (label === OVERALL || label == null || label === '') && (basis === 'Mole' || basis === 'Mass' || !basis) ? p : null;
    if (p === 'phaseFraction') return label === 'Vapor' && (basis === 'Mole' || !basis) ? 'vf' : null;
    return null;
  }
  _pair(s1, s2) { const a = this._specKind(s1), b = this._specKind(s2); if (!a || !b || a === b) return null; const k = [a, b].sort().join('+'); return ['pressure+temperature', 'enthalpy+pressure', 'entropy+pressure', 'pressure+vf', 'temperature+vf'].includes(k) ? k : null; }
  CheckEquilibriumSpec(spec1, spec2, solutionType = 'Unspecified') { return !!this._pair(spec1, spec2) && (solutionType === 'Unspecified' || solutionType === 'Normal'); }
  /**
   * Stateless equilibrium: state = { fraction (Mole), temperature?, pressure?, enthalpy? (J/mol), entropy?, vf? }, the pair kind, allowed phases.
   * → { temperature, pressure, phases: [{ label, phaseFraction, fraction }] }
   */
  equilibrium(kind, st, allowed = null) {
    const th = this.th, z = st.fraction, ok = (r) => { if (!r) throw new CapeError('ECapeSolvingError', 'the equilibrium calculation found no solution', { interface: IE, operation: 'CalcEquilibrium' }); return r; };
    let fl;
    try {
      if (kind === 'pressure+temperature') {
        fl = th.flashPT(st.temperature, st.pressure, z);
        if (isAct(th) && fl.state === 'liquid' && (!allowed || allowed.includes('Liquid2'))) { const ll = th.flashLL(st.temperature, st.pressure, z); if (ll.state === 'liquid-liquid') fl = ll; }
      } else if (kind === 'enthalpy+pressure') fl = ok(th.flashPH(st.pressure, st.enthalpy, z, st.temperature || 300));
      else if (kind === 'entropy+pressure') fl = ok(th.flashPS(st.pressure, st.entropy, z, st.temperature || 300));
      else if (kind === 'pressure+vf') fl = ok(th.flashPVF(st.pressure, st.vf, z));
      else if (kind === 'temperature+vf') fl = ok(this._flashTVF(st.temperature, st.vf, z));
      else throw new CapeError('ECapeLimitedImpl', 'this pair of equilibrium specifications is not supported', { interface: IE, operation: 'CalcEquilibrium' });
    } catch (e) { throw asCape(e, 'ECapeSolvingError', IE, 'CalcEquilibrium'); }
    let phases = fl.phases.filter((p) => p.frac > 0 || fl.phases.length === 1).map((p) => ({ label: p.type === 'vapor' ? 'Vapor' : p.type === 'liquid2' ? 'Liquid2' : 'Liquid', phaseFraction: p.frac, fraction: p.x.slice() }));
    if (allowed && allowed.length) {
      const bad = phases.filter((p) => !allowed.includes(p.label));
      if (bad.length && phases.length === 1) throw new CapeError('ECapeSolvingError', `the only stable phase (${bad[0].label}) is not among the allowed phases (${allowed.join(', ')})`, { interface: IE, operation: 'CalcEquilibrium' });
      if (bad.length) throw new CapeError('ECapeSolvingError', `phase ${bad[0].label} forms but the material does not allow it`, { interface: IE, operation: 'CalcEquilibrium' });
    }
    return { temperature: fl.T, pressure: fl.P, phases };
  }
  _flashTVF(T, vf, z) {
    const th = this.th, b = th.bubbleP(z, T), d = th.dewP(z, T); if (!b || !d) return null;
    if (vf <= 0) return th.flashPT(T, b.P, z); if (vf >= 1) return th.flashPT(T, d.P, z);
    let hi = b.P, lo = d.P;                         // V grows as P falls
    for (let i = 0; i < 200; i++) { const m = Math.sqrt(lo * hi), f = th.flashPT(T, m, z); if (f.V > vf) lo = m; else hi = m; if (hi / lo - 1 < 1e-12) break; }
    return th.flashPT(T, Math.sqrt(lo * hi), z);
  }
  CalcEquilibrium(spec1, spec2, solutionType = 'Unspecified') {
    const m = this._mat('CalcEquilibrium');
    if (solutionType !== 'Unspecified' && solutionType !== 'Normal') throw new CapeError('ECapeLimitedImpl', 'solution type ' + solutionType + ' is not supported (only Normal)', { interface: IE, operation: 'CalcEquilibrium' });
    const kind = this._pair(spec1, spec2); if (!kind) throw new CapeError('ECapeLimitedImpl', `equilibrium specification ${spec1?.[0]} + ${spec2?.[0]} is not supported`, { interface: IE, operation: 'CalcEquilibrium' });
    const st = { fraction: m.GetOverallProp('fraction', 'Mole') }, tryGet = (f) => { try { return f(); } catch { return undefined; } };
    st.temperature = tryGet(() => m.GetOverallProp('temperature', '')[0]);
    st.pressure = tryGet(() => m.GetOverallProp('pressure', '')[0]);
    if (kind.includes('enthalpy')) st.enthalpy = m.GetOverallProp('enthalpy', 'Mole')[0];
    if (kind.includes('entropy')) st.entropy = m.GetOverallProp('entropy', 'Mole')[0];
    if (kind.includes('vf')) st.vf = m.GetSinglePhaseProp('phaseFraction', 'Vapor', 'Mole')[0];
    for (const k of kind.split('+')) if (k !== 'vf' && st[k] == null) throw new CapeError('ECapeBadInvOrder', `the material has no ${k} to flash at`, { interface: IE, operation: 'CalcEquilibrium' });
    const allowed = m.GetPresentPhases().phaseLabels;
    const r = this.equilibrium(kind, st, allowed.length ? allowed : null);
    writeEquilibrium(m, r);
  }

  // ---- ICapeThermoUniversalConstant ----------------------------------------------------------------------------------------------
  GetUniversalConstantList() { return Object.keys(UNIVERSAL); }
  GetUniversalConstant(name) { if (!(name in UNIVERSAL)) throw new CapeError('ECapeInvalidArgument', 'unknown universal constant ' + name, { interface: 'ICapeThermoUniversalConstant', operation: 'GetUniversalConstant' }); return UNIVERSAL[name]; }
}

/** Write an equilibrium result on a material: overall T and P, the present phases at equilibrium, each phase's T, P, fraction, phaseFraction. */
export function writeEquilibrium(m, r) {
  if (typeof m.ClearPhaseProps === 'function') m.ClearPhaseProps();      // our material: old phase values are stale at the new T and P
  m.SetPresentPhases(r.phases.map((p) => p.label), r.phases.map(() => PHASE_STATUS.CAPE_ATEQUILIBRIUM));
  m.SetOverallProp('temperature', '', [r.temperature]); m.SetOverallProp('pressure', '', [r.pressure]);
  for (const p of r.phases) {
    m.SetSinglePhaseProp('temperature', p.label, '', [r.temperature]); m.SetSinglePhaseProp('pressure', p.label, '', [r.pressure]);
    m.SetSinglePhaseProp('fraction', p.label, 'Mole', p.fraction); m.SetSinglePhaseProp('phaseFraction', p.label, 'Mole', [p.phaseFraction]);
  }
}

/** ICapeThermoPropertyPackageManager over the packages an exported CAPE-OPEN package file lists. */
export class CoPropertyPackageManager {
  constructor(list, opts = {}) { this.list = list; this.ComponentName = opts.name || 'CadCraft property packages'; this.ComponentDescription = 'Property packages from the CadCraft process engine'; }
  GetPropertyPackageList() { return this.list.map((p) => p.name); }
  GetPropertyPackage(name) {
    const p = this.list.find((x) => x.name === name);
    if (!p) throw new CapeError('ECapeInvalidArgument', 'no property package named ' + name, { interface: 'ICapeThermoPropertyPackageManager', operation: 'GetPropertyPackage' });
    return new CoPropertyPackage(p.thermo, { name: p.name, description: p.description });
  }
  Initialize() {} Terminate() {}
  Edit() { throw new CapeError('ECapeNoImpl', 'packages are made in CadCraft', { interface: 'ICapeUtilities', operation: 'Edit' }); }
}
export const R_GAS = R;
