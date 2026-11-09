/* SPDX-License-Identifier: Apache-2.0 */
/**
 * names.js — the words and numbers of the CAPE-OPEN 1.1 interfaces that our adapters use (0.9 IND.3, session cape-open-09; DOM-free, no imports).
 *
 * Written from CO-LaN's published interface specifications (Thermo 1.1, Unit Operations, Common Interfaces, Error Common Interface) as
 * remembered and partly checked on the web on 2026-11-03 (docs/spikes/cape-open-11.md says which). Nothing here is copied from CO-LaN's
 * type library or from any other implementation. The COM shim must take every IID from the type library at build time
 * (tools/capeopen/shim/gen), never from this file; the CATIDs below are what registration writes, and those marked `checked: false` must be
 * compared with the type library before the first Windows test.
 *
 * Units are SI as CAPE-OPEN requires: K, Pa, mol/s, J/mol or J/kg, J/(mol K), m3/mol or m3/kg, mol/m3 or kg/m3; molecularWeight is the
 * relative molar mass (g/mol as a number, no unit).
 */

export const CO_VERSION = '1.1';

/** Phase labels our package offers. StateOfAggregation is the CO attribute value. */
export const PHASES = {
  Vapor: { state: 'Vapor', ours: 'vapor', type: 'V' },
  Liquid: { state: 'Liquid', ours: 'liquid', type: 'L' },
  Liquid2: { state: 'Liquid', ours: 'liquid2', type: 'L' },     // activity models only (liquid–liquid)
};
export const OVERALL = 'Overall';
export const phaseLabelOf = (ours) => (ours === 'vapor' ? 'Vapor' : ours === 'liquid2' ? 'Liquid2' : 'Liquid');

/** CapePhaseStatus */
export const PHASE_STATUS = { CAPE_UNKNOWNPHASESTATUS: 0, CAPE_ATEQUILIBRIUM: 1, CAPE_ESTIMATES: 2 };
/** CapeValidationStatus */
export const VALIDATION = { CAPE_NOT_VALIDATED: 0, CAPE_INVALID: 1, CAPE_VALID: 2 };
/** CapePortType, CapePortDirection */
export const PORT_TYPE = { CAPE_MATERIAL: 0, CAPE_ENERGY: 1, CAPE_INFORMATION: 2, CAPE_ANY: 3 };
export const PORT_DIR = { CAPE_INLET: 0, CAPE_OUTLET: 1, CAPE_INLET_OUTLET: 2 };
/** CapeParamMode, CapeParamType */
export const PARAM_MODE = { CAPE_INPUT: 0, CAPE_OUTPUT: 1, CAPE_INPUT_OUTPUT: 2 };
export const PARAM_TYPE = { CAPE_INVALID_PARAMETER: 0, CAPE_REAL: 1, CAPE_INT: 2, CAPE_OPTION: 3, CAPE_BOOLEAN: 4, CAPE_ARRAY: 5 };
/** A real parameter's dimensionality: exponents of m, kg, s, A, K, mol, cd, rad (the order of the CO parameter spec). */
export const DIM = {
  none: [0, 0, 0, 0, 0, 0, 0, 0], T: [0, 0, 0, 0, 1, 0, 0, 0], P: [-1, 1, -2, 0, 0, 0, 0, 0], W: [2, 1, -3, 0, 0, 0, 0, 0],
};

/** Basis words. '' = undefined (props with no basis: temperature, pressure, compressibilityFactor, molecularWeight, fugacityCoefficient …). */
export const BASIS = { mole: 'Mole', mass: 'Mass', none: '' };

/**
 * Single-phase properties our package calculates (CalcSinglePhaseProp), with what basis means for each.
 *   per: 'mole-or-mass' (value per mol or per kg) | 'none' (no basis) | 'vector-none' (one value per compound, no basis)
 */
export const SINGLE_PHASE_PROPS = {
  enthalpy: { per: 'mole-or-mass', unit: 'J/mol | J/kg' },
  entropy: { per: 'mole-or-mass', unit: 'J/(mol K) | J/(kg K)' },
  gibbsEnergy: { per: 'mole-or-mass', unit: 'J/mol | J/kg' },
  volume: { per: 'mole-or-mass', unit: 'm3/mol | m3/kg' },
  density: { per: 'mole-or-mass-inverse', unit: 'mol/m3 | kg/m3' },
  heatCapacityCp: { per: 'mole-or-mass', unit: 'J/(mol K) | J/(kg K)' },
  molecularWeight: { per: 'none', unit: 'g/mol (relative molar mass)' },
  compressibilityFactor: { per: 'none', unit: '-' },
  fugacityCoefficient: { per: 'vector-none', unit: '-' },
  logFugacityCoefficient: { per: 'vector-none', unit: '-' },
  fugacity: { per: 'vector-none', unit: 'Pa' },
  activityCoefficient: { per: 'vector-none', unit: '-' },
};
/** Two-phase properties (CalcTwoPhaseProp): K = x(first label) / x(second label). */
export const TWO_PHASE_PROPS = { kvalue: { unit: '-' }, logKvalue: { unit: '-' } };
/** Material state words (set, not calculated). */
export const STATE_PROPS = ['temperature', 'pressure', 'fraction', 'phaseFraction', 'totalFlow', 'flow'];

/** Compound constants (GetCompoundConstant). value(c) works on a normalised component of lib/process/data.js. */
export const CONST_PROPS = {
  molecularWeight: (c) => c.MW,
  criticalTemperature: (c) => c.Tc,
  criticalPressure: (c) => c.Pc,                     // Pa (normalised)
  acentricFactor: (c) => c.omega,
  normalBoilingPoint: (c) => c.Tb ?? null,
  heatOfVaporizationAtNormalBoilingPoint: (c) => c.dHvapTb ?? null,          // J/mol
  idealGasEnthalpyOfFormationAt25C: (c) => c.hf ?? null,                     // J/mol
  idealGasGibbsFreeEnergyOfFormationAt25C: (c) => c.gf ?? null,              // J/mol
  casRegistryNumber: (c) => CAS[c.id] || null,
  chemicalFormula: (c) => c.formula || null,
  iupacName: (c) => c.name || null,
};
/** Temperature-dependent properties (GetTDependentProperty), keyed to Thermo methods. */
export const TDEP_PROPS = ['vaporPressure', 'idealGasHeatCapacity', 'idealGasEnthalpy', 'idealGasEntropy', 'heatOfVaporization', 'liquidVolume'];

/** Universal constants (GetUniversalConstant). CODATA 2018. */
export const UNIVERSAL = {
  avogadroConstant: 6.02214076e23, boltzmannConstant: 1.380649e-23, molarGasConstant: 8.314462618,
  speedOfLightInVacuum: 299792458, standardAccelerationOfGravity: 9.80665,
};

/**
 * CAS registry numbers for lib/process/data.js's components (a component a person adds has none unless they give `cas`). The test checks
 * every check digit; the numbers themselves are the well-known ones and must be re-read against a CAS source before a release note says so.
 */
export const CAS = {
  methane: '74-82-8', ethane: '74-84-0', propane: '74-98-6', nbutane: '106-97-8', npentane: '109-66-0', nhexane: '110-54-3',
  ethylene: '74-85-1', propylene: '115-07-1', benzene: '71-43-2', toluene: '108-88-3', water: '7732-18-5', methanol: '67-56-1',
  ethanol: '64-17-5', acetone: '67-64-1', ammonia: '7664-41-7', nitrogen: '7727-37-9', oxygen: '7782-44-7', hydrogen: '1333-74-0',
  co: '630-08-0', co2: '124-38-9', h2s: '7783-06-4',
};
/** CAS check digit test (the last digit = sum of the other digits weighted 1, 2, 3 … from the right, mod 10). */
export function casValid(cas) {
  const m = /^(\d{2,7})-(\d{2})-(\d)$/.exec(String(cas || '')); if (!m) return false;
  const d = (m[1] + m[2]).split('').reverse(); let s = 0; d.forEach((c, i) => { s += (i + 1) * +c; });
  return s % 10 === +m[3];
}

/**
 * Component categories written under "Implemented Categories" at registration. `checked: true` = the GUID was seen in a CO-LaN forum
 * answer on 2026-11-03 (https://forum.colan.org/viewtopic.php?p=2605); false = from memory, compare with the type library.
 */
export const CATIDS = {
  CAPEOPEN_COMPONENT: { guid: '{678C09A1-7D66-11D2-A67D-00105A42887F}', what: 'CAPE-OPEN process modelling component', checked: true },
  UNIT_OPERATION: { guid: '{678C09A5-7D66-11D2-A67D-00105A42887F}', what: 'Unit operation', checked: true },
  CONSUMES_THERMO: { guid: '{4150C28A-EE06-403F-A871-87AFEC38A249}', what: 'Consumes thermodynamics', checked: true },
  SUPPORTS_THERMO_11: { guid: '{4667023A-5A8E-4CCA-AB6D-9D78C5112FED}', what: 'Supports Thermo 1.1', checked: true },
  PROPERTY_PACKAGE_MANAGER_11: { guid: '{CF51E383-0110-4ED8-ACB7-B50CFDE6908E}', what: 'Thermo 1.1 property package manager', checked: false },
};

/**
 * The ECape error family: name → HRESULT (the CAPE-OPEN error codes start at 0x80040501). From the Error Common Interface as remembered;
 * the shim takes the numbers from the type library's CapeErrorInterfaceHR enum at build time and its test compares them with this table.
 */
export const ECAPE_HR = {
  ECapeUnknown: 0x80040501, ECapeData: 0x80040502, ECapeLicenceError: 0x80040503, ECapeBadCOParameter: 0x80040504, ECapeBadArgument: 0x80040505,
  ECapeInvalidArgument: 0x80040506, ECapeOutOfBounds: 0x80040507, ECapeImplementation: 0x80040508, ECapeNoImpl: 0x80040509,
  ECapeLimitedImpl: 0x8004050A, ECapeComputation: 0x8004050B, ECapeOutOfResources: 0x8004050C, ECapeNoMemory: 0x8004050D,
  ECapeTimeOut: 0x8004050E, ECapeFailedInitialisation: 0x8004050F, ECapeSolvingError: 0x80040510, ECapeBadInvOrder: 0x80040511,
  ECapeInvalidOperation: 0x80040512, ECapePersistence: 0x80040513, ECapeIllegalAccess: 0x80040514, ECapePersistenceNotFound: 0x80040515,
  ECapePersistenceSystemError: 0x80040516, ECapePersistenceOverflow: 0x80040517, ECapeOutsideSolverScope: 0x80040518,
  ECapeHessianInfoNotAvailable: 0x80040519, ECapeThrmPropertyNotAvailable: 0x8004051A,
};
