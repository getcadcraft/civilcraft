/* SPDX-License-Identifier: Apache-2.0 */
/**
 * index.js — cc-dwg, our own Apache-2.0 DWG library (docs/DWG-LIB-SPEC.md).
 *
 *   readDwg(bytes, opts?) → Model            (read.js; R13/R14 and R2000–R2018)
 *   writeDwg(model, { version }) → { bytes, report }   (write.js, builder W)
 *   VERSIONS                                  { AC1015: 'R2000', … }
 *
 * Written from the ODA "Open Design Specification for .dwg files" v5.4.1 and our own code only.
 */
export { readDwg } from './read.js';
export { VERSIONS } from './model.js';
export { writeDwg } from './write.js';
