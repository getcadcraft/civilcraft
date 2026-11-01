/* SPDX-License-Identifier: Apache-2.0 */
/** cc-trace — requirements and traceability (0.8 XE.7): model, ReqIF in/out, verification matrix, impact, design history file index. DOM-free, no imports outside this folder. */
export * from './model.js';
export * from './checks.js';
export { readReqif, writeReqif } from './reqif.js';
export { parseXml, XmlError } from './xml.js';
export const VERSION = 1;
