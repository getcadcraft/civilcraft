/* SPDX-License-Identifier: Apache-2.0 */
/** index.js — lib/sweptpath: swept path engine for road vehicles, aircraft and light rail. DOM-free, no app imports; the road solver is handed in (configure). */
export { configure, configured, run } from './run.js';
export { cleanPack, cleanVehicle, toUnits, coreVehicle, FORMAT, KINDS } from './vehicle.js';
export { check } from './clearance.js';
export { roundabout, parking, worstBay } from './junction.js';
export { summary, csv } from './report.js';
export { flattenBulge, chaikin, polyDist } from './geom.js';
export { chaikin as chaikinPath } from './geom.js';
