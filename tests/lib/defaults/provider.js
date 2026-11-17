// SPDX-License-Identifier: Apache-2.0
/**
 * provider.js: what the add-on hands the host's defaults hook (defaults-hook.js; api.defaults.provide), 0.10 DP.1. No app imports.
 *
 *   makeProvider({ doc: () => document, source: () => words, optionsOf? }) → {
 *     get(id, { system }) → the value | undefined     undefined = not set: the app does what it always did
 *     has(id, ctx) → boolean
 *     source() → 'from your Default Policies'         the words the host shows beside a value a policy set (the add-on's language)
 *     office() → the office's name ('' when none)
 *   }
 * `optionsOf(policy, system)` (the host adapter's lists) lets get() drop a value the app no longer offers (a wall type that is gone):
 * the answer is then undefined and the app's own default applies, never a broken value.
 */
import { valueOf, policyById } from './policies.js';

export function makeProvider({ doc, source = () => '', optionsOf = null } = {}) {
  const get = (id, ctx = {}) => {
    const p = policyById(id);
    if (!p) return undefined;
    const system = ctx && (ctx.system === 'metric' || ctx.system === 'imperial') ? ctx.system : null;
    const v = valueOf(doc(), id, { system });
    if (v === undefined) return undefined;
    if (p.optionsFrom && optionsOf) { const list = optionsOf(p, system); if (Array.isArray(list) && !list.includes(v)) return undefined; }
    return v;
  };
  return { get, has: (id, ctx) => get(id, ctx) !== undefined, source: () => String(source() || ''), office: () => String(doc()?.office || '') };
}
