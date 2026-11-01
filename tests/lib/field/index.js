/* SPDX-License-Identifier: Apache-2.0 */
/** cc-field: signed-distance fields on a sparse voxel grid. DOM-free; the canonical copy is lib/field/ (tools/field/sync.mjs copies it into each app). */
export * from './field.js';
export { FieldError, Grid, INSIDE, BS, BN, keyOf, brickOf, fingerprint, packGrid, unpackGrid } from './grid.js';
export { plan, bakeKeys, assemble, bake, chunks, packSpec, unpackSpec } from './bake.js';
export { bakeParallel } from './parallel.js';
export { fromMesh } from './mesh-sdf.js';
export { contour } from './contour.js';
export { meshVolume, meshArea, meshTopology } from './measure.js';
export { toVoxelGrid } from './voxels.js';
export * from './detmath.js';
export { latticeBeams, pathBeams, LATTICE_KINDS } from './lattice.js';
export { analyze as mfgAnalyze, overhang as mfgOverhang, distanceSquared, components } from './mfg.js';
export { PROCESSES, PROCESS_NAMES, profileOf, customProfile } from './process.js';
export { dataSheet, dataSheetJson, dataSheetPdf, toVTI, toVTU, threeMF, base64 } from './export.js';
export { toVDB, vdbSize, VDB_FILE_VERSION } from './vdb.js';
export { crc32 } from './zip.js';
