/* SPDX-License-Identifier: Apache-2.0 */
/** test-cs-mesh.mjs — CraftScript builder B: mesh builtins and element/solver kernels. Picked up by bin/test-craftscript.mjs; the checks are in test-craftscript-b.mjs. */
export const run = async (T) => (await import('./test-craftscript-b.mjs')).runPart('mesh', T);
