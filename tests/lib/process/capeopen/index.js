/* SPDX-License-Identifier: Apache-2.0 */
/**
 * cc-process CAPE-OPEN 1.1 adapters (0.9 IND.3, session cape-open-09; spike docs/spikes/cape-open-11.md). DOM-free, no Node imports.
 *   names.js     the CO 1.1 words, enums, CATIDs, ECape HRESULTs, CAS numbers
 *   errors.js    CapeError (ECape* name + HRESULT + interface + operation)
 *   material.js  CoMaterial: an ICapeThermoMaterial in JavaScript
 *   package.js   CoPropertyPackage / CoPropertyPackageManager: our thermo as a CO 1.1 property package
 *   mthermo.js   MaterialThermo: any CO 1.1 material as the thermo our unit operations use
 *   unit.js      CoUnit: our unit operations as CO unit operations (ports, parameters, Validate, Calculate, persistence, report)
 *   foreign.js   a foreign CO unit as a unit of our flowsheet (type 'capeopen'), solveWithForeign
 *   protocol.js  the JSON-over-pipe protocol (SyncPeer, AsyncPeer, serveEngine, RemoteMaterial, unit drivers)
 *   bundle.js    the exported "CAPE-OPEN package" file and its registry lines
 */
export * from './names.js';
export { CapeError, fromWire, asCape } from './errors.js';
export { CoMaterial } from './material.js';
export { CoPropertyPackage, CoPropertyPackageManager, writeEquilibrium } from './package.js';
export { MaterialThermo } from './mthermo.js';
export { CoUnit, CoParameter, CoPort, CoCollection, UNIT_SPECS, UNIT_TYPES_OFFERED, unitFromSaved } from './unit.js';
export { FOREIGN_TYPE, NO_BRIDGE, registerForeignUnit, runForeign, solveWithForeign } from './foreign.js';
export { PROTOCOL, SyncPeer, AsyncPeer, serveEngine, serveMaterials, RemoteMaterial, remoteUnitDriver, localUnitDriver } from './protocol.js';
export { FORMAT as PACKAGE_FORMAT, CLASSES, makeCapeOpenPackage, checkCapeOpenPackage, registryLines } from './bundle.js';
export { runHost, loadPackages } from './host.js';
