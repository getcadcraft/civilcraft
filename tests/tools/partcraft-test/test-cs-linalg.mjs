/* SPDX-License-Identifier: Apache-2.0 */
/** test-cs-linalg.mjs — CraftScript builder B: linear algebra and sparse builtins. Picked up by bin/test-craftscript.mjs; the checks are in test-craftscript-b.mjs. */
export const run = async (T) => (await import('./test-craftscript-b.mjs')).runPart('linalg', T);
