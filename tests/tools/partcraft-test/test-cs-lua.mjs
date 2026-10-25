/* SPDX-License-Identifier: Apache-2.0 */
/** test-cs-lua.mjs — CraftScript builder B: the Lua adapter and CraftScript/Lua parity. Picked up by bin/test-craftscript.mjs; the checks are in test-craftscript-b.mjs. */
export const run = async (T) => (await import('./test-craftscript-b.mjs')).runPart('lua', T);
