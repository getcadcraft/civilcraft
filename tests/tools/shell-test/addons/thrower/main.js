/* SPDX-License-Identifier: Apache-2.0 */
export function activate(api) { api.onDeactivate(() => { globalThis.__throwerCleaned = true; }); throw new Error('boom in activate'); }
