/* SPDX-License-Identifier: Apache-2.0 */
/** cc-factory — the factory floor (0.9 D8.13): machines and cells from the flow layout, an MTConnect reader of our own, a seeded simulated shop, live reading through lib/live's store (OPC UA, MQTT, Modbus, BACnet through Studio's bridge), the job queue that hands programs to EG.40's Send to a machine, history and OEE, writes off by default. DOM-free except ui.js. Imports outside this folder: ../plc/xml.js (XML reader) and, through the host, ../live/store.js. */
export * as mtconnect from './mtconnect.js';
export * as sim from './sim.js';
export * as record from './record.js';
export * as cells from './cells.js';
export * as jobs from './jobs.js';
export * as guard from './guard.js';
export * as monitor from './monitor.js';
export { WORDS, wordsOf } from './words.js';
export const VERSION = 1;
