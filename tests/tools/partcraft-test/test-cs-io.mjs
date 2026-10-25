/* SPDX-License-Identifier: Apache-2.0 */
/** test-cs-io.mjs — CraftScript builder B: file builtins incl. HDF5. Picked up by bin/test-craftscript.mjs; the checks are in test-craftscript-b.mjs. */
export const run = async (T) => (await import('./test-craftscript-b.mjs')).runPart('io', T);
