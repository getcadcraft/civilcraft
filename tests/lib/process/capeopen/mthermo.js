/* SPDX-License-Identifier: Apache-2.0 */
/**
 * mthermo.js — MaterialThermo: the part of thermo.js's `Thermo` that our unit operations (stream.js UNITS) use, answered by ANY CAPE-OPEN 1.1
 * material object and the property package behind it (0.9 IND.3). With it our units run inside a simulator on the simulator's own thermo:
 * every flash is the material's CalcEquilibrium, every phase property its CalcSinglePhaseProp, on scratch materials made with
 * CreateMaterial. With our own CoPropertyPackage behind the material it gives back what Thermo gives (the tests check that).
 *
 *   new MaterialThermo(material)     n, ids, c[i].MWkg, MW, index(id), mwMix(z), phase(T, P, x, 'V'|'L'), flashPT, flashPH, flashPS, flashPVF
 *
 * Calls are synchronous: in a simulator they go through the COM shim to the simulator's material (the engine host's synchronous callback,
 * docs/spikes/cape-open-11.md); in JavaScript to a CoMaterial.
 */
import { PHASE_STATUS } from './names.js';

const R = 8.314462618;
const ours = (label) => (label === 'Vapor' ? 'vapor' : label === 'Liquid2' ? 'liquid2' : 'liquid');

export class MaterialThermo {
  constructor(material) {
    this.mat = material;
    const cl = material.GetCompoundList();
    this.ids = cl.compIds.slice(); this.n = this.ids.length;
    this.c = cl.compIds.map((id, i) => ({ id, name: cl.names[i], formula: cl.formulae[i], MW: cl.molwts[i], MWkg: cl.molwts[i] / 1000, Tb: cl.boilTemps[i] }));
    const pl = material.GetPhaseList();
    this.labels = pl.phaseLabels.slice();
    this.vapLabel = pl.phaseLabels.find((l, i) => pl.stateOfAggregation[i] === 'Vapor') || 'Vapor';
    this.liqLabel = pl.phaseLabels.find((l, i) => pl.stateOfAggregation[i] === 'Liquid') || 'Liquid';
    this.model = 'cape-open'; this.eos = null; this.calls = 0;
  }
  get MW() { return this.c.map((c) => c.MWkg); }
  index(id) { const i = this.ids.indexOf(id); if (i < 0) throw new Error('component not in this package: ' + id); return i; }
  mwMix(z) { let s = 0; for (let i = 0; i < this.n; i++) s += z[i] * this.c[i].MWkg; return s; }
  _scratch() { const m = this.mat.CreateMaterial(); return m; }
  _norm(z) { const s = z.reduce((a, c) => a + c, 0); return z.map((v) => v / s); }
  /** One phase's H, S, V, Z at (T, P, x). type 'V' | 'L'. */
  phase(T, P, x, type) {
    const m = this._scratch(), label = type === 'V' ? this.vapLabel : this.liqLabel; this.calls++;
    m.SetOverallProp('fraction', 'Mole', this._norm(x)); m.SetOverallProp('temperature', '', [T]); m.SetOverallProp('pressure', '', [P]);
    m.SetPresentPhases([label], [PHASE_STATUS.CAPE_UNKNOWNPHASESTATUS]);
    m.SetSinglePhaseProp('temperature', label, '', [T]); m.SetSinglePhaseProp('pressure', label, '', [P]);
    m.SetSinglePhaseProp('fraction', label, 'Mole', this._norm(x)); m.SetSinglePhaseProp('phaseFraction', label, 'Mole', [1]);
    m.CalcSinglePhaseProp(['enthalpy', 'entropy', 'volume'], label);
    const H = m.GetSinglePhaseProp('enthalpy', label, 'Mole')[0], S = m.GetSinglePhaseProp('entropy', label, 'Mole')[0], V = m.GetSinglePhaseProp('volume', label, 'Mole')[0];
    return { H, S, V, Z: P * V / (R * T), liquidLike: type === 'L' };
  }
  /** spec1/spec2 as CO specifications, `set(m)` puts the spec values on the scratch material → the flash result shape of thermo.js. */
  _flash(z, spec1, spec2, set) {
    z = this._norm(z); const m = this._scratch(); this.calls++;
    m.SetOverallProp('fraction', 'Mole', z); m.SetOverallProp('totalFlow', 'Mole', [1]);
    m.SetPresentPhases(this.labels, this.labels.map(() => PHASE_STATUS.CAPE_UNKNOWNPHASESTATUS));
    set(m);
    m.CalcEquilibrium(spec1, spec2, 'Unspecified');
    const T = m.GetOverallProp('temperature', '')[0], P = m.GetOverallProp('pressure', '')[0], pp = m.GetPresentPhases().phaseLabels;
    const phases = [];
    for (const label of pp) {
      m.CalcSinglePhaseProp(['enthalpy', 'entropy', 'volume'], label);
      const frac = m.GetSinglePhaseProp('phaseFraction', label, 'Mole')[0], x = m.GetSinglePhaseProp('fraction', label, 'Mole');
      const H = m.GetSinglePhaseProp('enthalpy', label, 'Mole')[0], S = m.GetSinglePhaseProp('entropy', label, 'Mole')[0], v = m.GetSinglePhaseProp('volume', label, 'Mole')[0];
      phases.push({ type: ours(label), frac, x, H, S, v, Z: P * v / (R * T) });
    }
    phases.sort((a, b) => (a.type === 'vapor' ? -1 : b.type === 'vapor' ? 1 : 0));
    const sum = (k) => phases.reduce((s, p) => s + p.frac * p[k], 0), vap = phases.find((p) => p.type === 'vapor');
    const V = vap ? vap.frac : 0;
    const state = phases.length === 1 ? (phases[0].type === 'vapor' ? 'vapor' : 'liquid') : vap ? 'two-phase' : 'liquid-liquid';
    return { T, P, z, V: state === 'liquid-liquid' ? 0 : V, phases, H: sum('H'), S: sum('S'), v: sum('v'), state };
  }
  flashPT(T, P, z) { return this._flash(z, ['temperature', '', 'Overall'], ['pressure', '', 'Overall'], (m) => { m.SetOverallProp('temperature', '', [T]); m.SetOverallProp('pressure', '', [P]); }); }
  flashPH(P, H, z, guessT = 300) { try { return this._flash(z, ['pressure', '', 'Overall'], ['enthalpy', 'Mole', 'Overall'], (m) => { m.SetOverallProp('pressure', '', [P]); m.SetOverallProp('enthalpy', 'Mole', [H]); m.SetOverallProp('temperature', '', [guessT]); }); } catch (e) { if (e && e.ecape === 'ECapeSolvingError') return null; throw e; } }
  flashPS(P, S, z, guessT = 300) { try { return this._flash(z, ['pressure', '', 'Overall'], ['entropy', 'Mole', 'Overall'], (m) => { m.SetOverallProp('pressure', '', [P]); m.SetOverallProp('entropy', 'Mole', [S]); m.SetOverallProp('temperature', '', [guessT]); }); } catch (e) { if (e && e.ecape === 'ECapeSolvingError') return null; throw e; } }
  flashPVF(P, vf, z) {
    try {
      return this._flash(z, ['pressure', '', 'Overall'], ['phaseFraction', 'Mole', this.vapLabel], (m) => {
        m.SetOverallProp('pressure', '', [P]); m.SetSinglePhaseProp('phaseFraction', this.vapLabel, 'Mole', [vf]);
      });
    } catch (e) { if (e && e.ecape === 'ECapeSolvingError') return null; throw e; }
  }
}
