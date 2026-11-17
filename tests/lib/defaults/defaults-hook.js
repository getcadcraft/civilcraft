/* SPDX-License-Identifier: Apache-2.0 */
/**
 * defaults-hook.js: the one place an add-on can say what a new project starts with and what new things get (0.10 DP.1, owner
 * 2026-11-11: "should be an add-on (Default Policies) where users can define defaults like these"). The app knows no policies:
 * with no add-on it asks nothing and every default is the app's own, exactly as before. DOM-free, no imports. The same file in
 * every host (canonical: lib/defaults/defaults-hook.js; copies by tools/defaults/sync.mjs, never edited).
 *
 *   setDefaults(provider | null)   the add-on's provider (api.defaults.provide); null when it is switched off
 *   defaults() → provider | null
 *   defaultsChanged()              a policy changed: whoever shows one asks again
 *   onDefaults(fn) → stop()        fn(provider | null) after a change
 *   policy(id, ctx) → value | undefined     THE question a host asks. undefined = not set (or no add-on, or the add-on failed):
 *                                           the caller then uses its built-in default. ctx = { system: 'metric' | 'imperial' }
 *                                           for a policy that has one value per unit system.
 *   policySource() → string        the words to show beside a value a policy set ('' with no add-on)
 *
 *   hostDefaultsApi(track) → { provide(provider) → off(), changed() }     what a host's add-on API hands out as `api.defaults`:
 *                                           one provider at a time, taken away when the add-on is switched off (track(fn) = the
 *                                           loader's onDeactivate)
 *   scheduleStandard() → { group?, totals?, title?, headings? }     the office standard for schedule and estimate layouts (0.10
 *                                           BK.149): the four all.schedule.* policies as lib/tables/table.js withStandard takes them;
 *                                           {} when none is set (or no add-on)
 * provider = { get(id, ctx) → value | undefined, source() → string }
 * Adding a policy: one entry in the add-on's list (lib/defaults/policies.js) and one policy('<id>') call where the host makes
 * its default. The host never imports the add-on.
 */
let current = null;
const listeners = new Set();
export const defaults = () => current;
export function onDefaults(fn) { listeners.add(fn); return () => listeners.delete(fn); }
export function defaultsChanged() { for (const fn of [...listeners]) { try { fn(current); } catch (e) { /* a listener's failure never stops the others */ } } }
export function setDefaults(p) { current = p && typeof p === 'object' && typeof p.get === 'function' ? p : null; defaultsChanged(); }
export function policy(id, ctx) {
  if (!current) return undefined;
  try { const v = current.get(String(id), ctx || {}); return v === null ? undefined : v; } catch (e) { return undefined; }
}
export function policySource() {
  if (!current || typeof current.source !== 'function') return '';
  try { return String(current.source() || ''); } catch (e) { return ''; }
}
/** The `defaults` part of a host's add-on API (the same in every app that hosts the add-on). */
export function hostDefaultsApi(track) {
  return {
    provide(provider) {
      if (!provider || typeof provider !== 'object' || typeof provider.get !== 'function') throw new Error('defaults.provide: (provider with get(id, ctx))');
      setDefaults(provider);
      const off = () => { if (current === provider) setDefaults(null); };
      if (typeof track === 'function') track(off);
      return off;
    },
    changed() { defaultsChanged(); },
  };
}
/** The office standard for schedule layouts: one reading for every app (BimCraft's schedules, TakeoffCraft's estimate). */
export function scheduleStandard() {
  const out = {};
  const g = policy('all.schedule.group'), tt = policy('all.schedule.totals'), ti = policy('all.schedule.title'), h = policy('all.schedule.headings');
  if (typeof g === 'string') out.group = g;
  if (typeof tt === 'string') out.totals = tt;
  if (typeof ti === 'string' && ti.trim()) out.title = ti;
  if (typeof h === 'string') out.headings = h;
  return out;
}
