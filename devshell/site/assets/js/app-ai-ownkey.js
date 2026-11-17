/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file — no words a person reads: the Ask box (app-ai-ask.js) says them through the shell language files. */
/**
 * app-ai-ownkey.js — the Ask box's seam for the "Your own AI key" add-on (0.10, owner 2026-11-11: "no AI in the apps" with no exception).
 * The client for a person's own model (their key, their provider, or a model on their own computer; 0.8 AC.11 / AC.7) is no longer a file of
 * the shared shell. It is an add-on the person adds on purpose (source: addons/own-ai-key/ in the repo, never inside an app build). This file
 * is all the shell keeps: it knows the add-on's id, reads the engine the add-on registers, and can ask the account's add-on client to add
 * it. It holds no provider address, no request shape and no model call, and it never reads or moves a key.
 *
 * The seam (the add-on's main.js writes it, this file reads it):
 *   globalThis.ccAskEngines = [{ id, name, settingsKey, engine({ studio, store }) → an ask-style engine | null }]
 *   'cc-ask-engines' on the window whenever the list changes
 *
 *   ownProvider(g)            → the add-on's entry, or null when it is not added (or switched off)
 *   ownEngine({ g, studio })  → the engine for the person's own model, or null (not added, not in Studio, or nothing set up yet)
 *   ownState({ g, store })    → { inStudio, added, hadSettings }   hadSettings = the person set up a model before (the stored settings are there)
 *   watchOwn(fn, g)           → off()   fn runs when the add-on arrives or leaves, and when the stored settings change in another window
 *   addOwnKey({ g })          → { ok } | { ok:false, reason: 'no-client' | 'sign-in' | 'offline' | 'no-package' | 'refused', message }
 *   listingUrl(g)             → the add-on's page in the Library
 */
export const ADDON_ID = 'own-ai-key';
/** Where Studio's hub keeps the person's settings (provider, model, limits; never the key). The add-on reads the same entry: nothing is migrated or copied. */
export const SETTINGS_KEY = 'cadcraft.studio.byok.settings';
const SITE = 'https://getcadcraft.com';

const list = (g) => (Array.isArray(g.ccAskEngines) ? g.ccAskEngines : []);
export const ownProvider = (g = globalThis) => list(g).find((p) => p && p.id === ADDON_ID && typeof p.engine === 'function') || null;

const isStudio = (s) => !!s && typeof s.post === 'function' && typeof s.on === 'function';

export function ownEngine({ g = globalThis, studio = g.cadcraftStudio } = {}) {
  const p = ownProvider(g);
  if (!p || !isStudio(studio)) return null;
  try { const e = p.engine({ studio }); return e && typeof e.ask === 'function' ? e : null; } catch { return null; }
}

export function ownState({ g = globalThis, store = g.localStorage } = {}) {
  let had = false;
  try { had = store.getItem(SETTINGS_KEY) !== null; } catch { had = false; }
  return { inStudio: isStudio(g.cadcraftStudio), added: !!ownProvider(g), hadSettings: had };
}

export function watchOwn(fn, g = globalThis) {
  if (typeof g.addEventListener !== 'function') return () => {};
  const onList = () => fn('addon');
  const onStore = (ev) => { if (ev && ev.key === SETTINGS_KEY) fn('settings'); };
  g.addEventListener('cc-ask-engines', onList);
  g.addEventListener('storage', onStore);
  return () => { g.removeEventListener('cc-ask-engines', onList); g.removeEventListener('storage', onStore); };
}

/** The add-on's Library page: a relative address on the website, the website's own address anywhere else (Studio, a packed edition). */
export function listingUrl(g = globalThis) {
  let onSite = false;
  try { onSite = /^https?:$/.test(g.location.protocol) && /(^|\.)getcadcraft\.com$/.test(g.location.hostname); } catch { onSite = false; }
  return (onSite ? '' : SITE) + '/library/addons/' + ADDON_ID;
}

/**
 * "Add it": put the add-on on the account's list and fetch it (signature checked, all or nothing) through the page's account add-on client
 * (window.ccAddonsAccount, app-addons-account.js). A page without that client cannot add from here: the Ask box then shows the Library page.
 * A fetched add-on starts the next time the app is opened (the loader reads its store at start).
 */
export async function addOwnKey({ g = globalThis } = {}) {
  const acc = g.ccAddonsAccount;
  if (!acc || typeof acc.add !== 'function' || typeof acc.ensure !== 'function') return { ok: false, reason: 'no-client' };
  try {
    if (typeof acc.signedIn === 'function' && !acc.signedIn()) {
      const c = typeof acc.connect === 'function' ? await acc.connect() : { ok: false };
      if (!c || !c.ok) return { ok: false, reason: 'sign-in' };
    }
    let r = await acc.add(ADDON_ID);
    if (r && r.ok) r = await acc.ensure(ADDON_ID);
    if (r && r.ok) return { ok: true };
    if (r && r.offline) return { ok: false, reason: 'offline' };
    const why = (r && (r.reason || r.code)) || '';
    return { ok: false, reason: why === 'no-package' ? 'no-package' : 'refused', message: String((r && r.message) || why || '').slice(0, 160) };
  } catch { return { ok: false, reason: 'refused', message: '' }; }
}
